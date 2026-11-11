"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";

export function Navbar() {
  const { logo, links, cta } = site.nav;
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState(links[0].href);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const ids = links.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [links]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-[color-mix(in_srgb,var(--c-navy)_92%,black)]/95 backdrop-blur border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main">
        <a href="#hero" className="display text-sm tracking-[0.28em] text-white">
          {logo}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={`text-[13px] transition-colors ${
                  active === l.href ? "text-lime" : "text-muted hover:text-white"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={cta.href}
          className="rounded-full bg-lime px-4 py-2 text-[12px] font-medium text-navy transition-transform hover:scale-[1.03] md:text-[13px]"
        >
          {cta.label}
        </a>
      </nav>
    </header>
  );
}
