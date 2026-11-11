"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function VideoShowcase({
  src,
  poster,
  label = "Loading video",
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);

  // Buffered bytes drive the border trace. readyState >= 3 means enough
  // frames are decoded to start playing without stalling.
  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1);
      setProgress(Math.min(1, end / video.duration));
    }
  }, []);

  const handleReady = useCallback(() => {
    setProgress(1);
    setReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video may already be buffered from cache before React attaches
    // listeners, in which case no further events fire.
    if (video.readyState >= 3) handleReady();

    video.addEventListener("progress", handleProgress);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("error", () => setFailed(true));

    return () => {
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("canplay", handleReady);
    };
  }, [handleProgress, handleReady]);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === wrapRef.current);

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    // iOS Safari has no Element.requestFullscreen on arbitrary elements;
    // fall back to the native video fullscreen it does expose.
    if (wrap.requestFullscreen) {
      await wrap.requestFullscreen();
    } else if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  }, []);

  const toggleMuted = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <div
      ref={wrapRef}
      className="group relative bg-ink"
      data-fullscreen={isFullscreen ? "" : undefined}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="SEVIRON platform walkthrough"
          className={`h-full w-full object-contain transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />

        {!ready && !failed && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="eyebrow !text-sand/55">{label}</p>
              <p className="mt-3 font-mono text-xs text-sand/40">{pct}%</p>
            </div>
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 grid place-items-center px-6">
            <p className="text-center text-sm text-sand/55">
              The video couldn&apos;t load. Please refresh to try again.
            </p>
          </div>
        )}
      </div>

      {/* Border trace. strokeDashoffset walks the full perimeter as the
          video buffers, so the outline draws itself exactly once. */}
      {!ready && !failed && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-sand/12"
          />
          <rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            className="text-moss transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
      )}

      {ready && !failed && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={toggleMuted}
            className="border border-sand/20 bg-ink/70 px-3 py-1.5 text-[11px] tracking-[0.14em] text-sand/80 backdrop-blur transition-colors hover:border-sand/40 hover:text-sand"
          >
            {muted ? "UNMUTE" : "MUTE"}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="border border-sand/20 bg-ink/70 px-3 py-1.5 text-[11px] tracking-[0.14em] text-sand/80 backdrop-blur transition-colors hover:border-sand/40 hover:text-sand"
          >
            {isFullscreen ? "EXIT" : "FULLSCREEN"}
          </button>
        </div>
      )}
    </div>
  );
}
