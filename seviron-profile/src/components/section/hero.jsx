"use client";

import Link from "next/link";
import Description from "../ui/description";
import Intro from "../ui/intro";

export default function Hero() {
  return (
    <section id="home" className="flex flex-col justify-end">
      <Intro />
      <Description />

      <div className="shell relative z-10 -mt-[20dvh] pb-24 sm:-mt-[24dvh] lg:-mt-[30dvh] lg:pb-40">
        <div className="max-w-xl">
          <p className="text-[10px] tracking-[0.16em] text-white/55 uppercase sm:text-[11px] sm:tracking-[0.18em]">
            Environmental Intelligence for Modern Industries
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-white/75 sm:mt-5 sm:text-[15px]">
            Environmental risks should never go unnoticed. SERAVIN connects
            environmental sensors with an intelligent monitoring platform to
            help organizations understand current conditions, anticipate
            potential risks, and make informed decisions before issues escalate.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[12px] tracking-[0.1em] text-ink transition-colors duration-300 hover:bg-white/85 sm:px-7"
            >
              Request a Demo
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-6 py-3.5 text-[12px] tracking-[0.1em] text-white transition-colors duration-300 hover:bg-white hover:text-ink sm:px-7"
            >
              Explore Our Solutions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
