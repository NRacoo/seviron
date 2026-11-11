"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/section/hero";
import PreloaderPage from "@/components/ui/preloader";
import HomeSections from "@/components/section/home-sections";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.cursor = "default";
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">{isLoading && <PreloaderPage />}</AnimatePresence>
      <div className="bg-black">
        <Hero />
      </div>
      <HomeSections />
    </>
  );
}
