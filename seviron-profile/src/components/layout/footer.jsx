import Link from "next/link";
import { navigation, site } from "@/lib/site";

const buildYear = 2026;

export default function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-sm tracking-[0.22em] text-ink">{site.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone">
              {site.fullName} — {site.positioning}. Monitor current conditions,
              anticipate potential risks, and support timely decisions.
            </p>
          </div>

          <div>
            <p className="eyebrow">Navigate</p>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-stone transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Get in touch</p>
            <p className="mt-5 text-sm leading-relaxed text-stone">
              Business inquiries, demo requests, and partnership conversations
              are handled through our contact form.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 text-sm text-ink"
            >
              Talk to our team
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone">
            © {buildYear} {site.name}. All rights reserved.
          </p>
          <p className="text-xs tracking-[0.18em] text-stone uppercase">
            {site.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
