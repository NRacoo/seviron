"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type ContactSection } from "@/lib/content";
import { endFor } from "@/lib/scroll";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function Contact() {
  const data = section<ContactSection>("contact");
  const c = data.content;
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);

  const endpointReady = /^(https?:|mailto:|\/)/.test(c.form.action);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-fade]", { opacity: 1, y: 0, letterSpacing: "0em" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: endFor(data.scrollLength),
            pin: data.pin,
            scrub: 1,
          },
        });
        tl.from("[data-stat]", { opacity: 0, duration: 0.4 }, 0)
          .from("[data-headline]", { opacity: 0, y: 30, duration: 0.4 }, 0.3)
          .from("[data-form]", { opacity: 0, y: 24, duration: 0.4 }, 0.45)
          .from("[data-tagline]", { opacity: 0, letterSpacing: "0.3em", duration: 0.5 }, 0.6);
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="contact" className="relative flex min-h-screen items-center bg-navy px-5 py-24 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2 md:items-center">
        <div>
          <p data-stat data-fade className="num text-[12px] tracking-wider text-loss">
            {c.stat}
          </p>
          <h2 data-headline data-fade className="mt-5 text-[2rem] md:text-[3.2rem]">
            {c.headline}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{c.body}</p>
          <p data-tagline data-fade className="display mt-10 text-sm text-lime">
            {c.tagline}
          </p>
        </div>

        <form
          data-form
          data-fade
          className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 md:p-6"
          action={endpointReady ? c.form.action : undefined}
          method={endpointReady ? "post" : undefined}
          onSubmit={(e) => {
            if (!endpointReady) {
              e.preventDefault();
              setSent(true);
            }
          }}
        >
          <div className="grid gap-4">
            {c.form.fields.map((field) => {
              const id = `contact-${slug(field)}`;
              const email = /email/i.test(field);
              return (
                <div key={field}>
                  <label htmlFor={id} className="block text-[12px] text-muted">
                    {field}
                  </label>
                  <input
                    id={id}
                    name={slug(field)}
                    type={email ? "email" : "text"}
                    required
                    autoComplete={email ? "email" : "off"}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-navy/60 px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-lime"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-lime px-5 py-3 text-[14px] font-medium text-navy transition-transform hover:scale-[1.01]"
          >
            {c.form.submit}
          </button>

          <p role="status" aria-live="polite" className="mt-3 text-[12px] text-gain">
            {sent ? "Thanks — form endpoint not configured yet, nothing was sent." : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
