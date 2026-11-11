"use client"
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis();

    // sinkronkan Lenis -> ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // pakai gsap ticker sebagai raf loop, bukan requestAnimationFrame manual
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // konten tinggi berubah (preloader, font, gambar) -> hitung ulang
    const resize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener("load", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", resize);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}