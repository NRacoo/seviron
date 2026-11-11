"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navigation, site } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onDark = isHome && !scrolled;

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-line/80 bg-sand/85 backdrop-blur-md"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div className="shell flex h-18 items-center justify-between">
          <Link
            href="/"
            aria-label={`${site.name} home`}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/images/SEV.png"
              alt=""
              width={50}
              height={50}
              className={[
                "transition-opacity duration-500",
                onDark ? "opacity-100" : "invert opacity-100",
              ].join(" ")}
            />
            <span
              className={[
                "text-sm tracking-[0.22em] transition-colors duration-500",
                onDark ? "text-white" : "text-ink",
              ].join(" ")}
            >
              {site.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative text-[13px] transition-colors duration-300",
                    onDark
                      ? active
                        ? "text-white"
                        : "text-white/65 hover:text-white"
                      : active
                        ? "text-ink"
                        : "text-stone hover:text-ink",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute -bottom-1.5 left-0 h-px w-full origin-left transition-transform duration-300",
                      onDark ? "bg-white" : "bg-ink",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className={[
                "hidden rounded-full border px-5 py-2.5 text-[12px] tracking-[0.08em] transition-colors duration-300 md:inline-flex",
                onDark
                  ? "border-white/35 text-white hover:bg-white hover:text-ink"
                  : "border-ink/20 text-ink hover:bg-ink hover:text-sand",
              ].join(" ")}
            >
              Request a Demo
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.25 md:hidden"
            >
              <span
                className={[
                  "h-px w-5 transition-all duration-300",
                  open ? "translate-y-0.75 rotate-45" : "",
                  open || !onDark ? "bg-ink" : "bg-white",
                ].join(" ")}
              />
              <span
                className={[
                  "h-px w-5 transition-all duration-300",
                  open ? "-translate-y-0.75 -rotate-45" : "",
                  open || !onDark ? "bg-ink" : "bg-white",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-sand pt-18 md:hidden"
          >
            <nav className="shell flex flex-col pt-8">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                >
                  <Link
                    href={item.href}
                    className="block border-b border-line py-5 text-2xl tracking-[-0.02em] text-ink"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/contact"
                className="mt-8 inline-flex w-fit rounded-full bg-ink px-6 py-3 text-[12px] tracking-[0.08em] text-sand"
              >
                Request a Demo
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
