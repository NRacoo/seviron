"use client";

import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import { ispuColor } from "@/lib/ispu";
import type { JakartaStation } from "@/types/jakarta";
import styles from "./JakartaMap.module.css";

/**
 * CARTO's Positron basemap: muted greys that let the ISPU markers carry all the
 * colour, and free to use without an API key (OSM + CARTO attribution).
 */
const STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/**
 * MapLibre v6 loads its tile worker as a separate ES module. Next.js does not
 * resolve that import on its own, so we hand it an explicit bundled URL —
 * otherwise the worker 404s and no tiles are ever drawn.
 */
setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
);

/** Mainland DKI Jakarta. */
const CENTER: [number, number] = [106.823, -6.21];
const BOUNDS: [[number, number], [number, number]] = [
  [106.5, -6.45],
  [107.1, -5.95],
];

export function JakartaMap({
  stations,
  activeId,
  onSelect,
}: {
  stations: JakartaStation[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef(new Map<string, Marker>());

  // `onSelect` is kept in a ref so marker click handlers never close over a
  // stale callback, while the markers themselves are only rebuilt when the
  // station data actually changes.
  const select = useRef(onSelect);
  select.current = onSelect;

  useEffect(() => {
    if (!host.current || map.current) return;

    const m = new MapLibreMap({
      container: host.current,
      style: STYLE,
      center: CENTER,
      zoom: 10.4,
      maxBounds: BOUNDS,
      attributionControl: false,
    });

    m.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    m.addControl(new AttributionControl({ compact: true }), "bottom-left");

    // Clicking empty map dismisses the open station card.
    m.on("click", () => select.current(null));

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
      markers.current.clear();
    };
  }, []);

  // Build one marker per station.
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    for (const marker of markers.current.values()) marker.remove();
    markers.current.clear();

    for (const s of stations) {
      if (s.offshore) continue;

      const el = document.createElement("button");
      el.type = "button";
      el.className = styles.pill;
      el.style.setProperty("--pill", ispuColor[s.severity]);
      el.textContent = String(s.ispu);
      el.setAttribute("aria-label", `${s.name}, ISPU ${s.ispu}, ${s.status}`);
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        select.current(s.id);
      });

      markers.current.set(
        s.id,
        new Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(m),
      );
    }
  }, [stations]);

  // Reflect selection without rebuilding markers.
  useEffect(() => {
    for (const [id, marker] of markers.current) {
      marker.getElement().classList.toggle(styles.pillActive, id === activeId);
    }

    const m = map.current;
    const active = stations.find((s) => s.id === activeId);
    if (m && active && !active.offshore) {
      m.easeTo({ center: [active.lon, active.lat], duration: 600 });
    }
  }, [activeId, stations]);

  return <div ref={host} className={styles.map} />;
}
