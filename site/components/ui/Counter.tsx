"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Counter({
  value,
  decimals = 0,
  className,
  trigger,
}: {
  value: number;
  decimals?: number;
  className?: string;
  trigger?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const proxy = { n: 0 };
      const write = () => {
        el.textContent = proxy.n.toFixed(decimals);
      };
      write();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        proxy.n = value;
        write();
        return;
      }

      gsap.to(proxy, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: write,
        scrollTrigger: trigger === false ? undefined : {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { dependencies: [value, decimals] },
  );

  return <span ref={ref} className={`num ${className ?? ""}`} aria-label={value.toFixed(decimals)} />;
}
