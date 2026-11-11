# Seviron — company profile site

Public profile with scroll storytelling plus an interactive Perisai demo.
Separate from `web/` (the operational dashboard); nothing is shared between them.

```bash
cd site && npm install && npm run dev    # :3001
```

| Route | Purpose |
|---|---|
| `/` | Scroll story: hero → story → gap → product → demo → outcome → solutions → why → about → contact |
| `/demo` | Same dashboard, unpinned and fully clickable |

## Content

`content/site.json` is the single source of truth. Every string, number and
colour is read from it; nothing is hard-coded in components. `lib/content.ts`
types it and exposes `section(id)`.

Colour tokens become CSS variables (`--c-navy`, `--c-lime`, …) on `<html>` in
`app/layout.tsx`, then map to Tailwind v4 theme colours in `app/globals.css`.
Green marks gains only; red marks losses and risk only.

## Animation

GSAP + `@gsap/react` `useGSAP`, ScrollTrigger and Flip registered once in
`components/GsapProvider.tsx`, which also mounts Lenis smooth scroll.

- Pinned sections (`hero`, `story`, `product`, `demo`, `contact`) use `scrub`.
- Unpinned sections use `toggleActions: "play none none reverse"`.
- `scrollLength` from the JSON is converted to pixels in `lib/scroll.ts`.
- `gsap.matchMedia` gates animation; `prefers-reduced-motion` renders static.
- Counters tween a proxy object and round to the JSON `decimals`.

## Demo data

`lib/series.ts` generates a deterministic 24h observed series ending at
`forecastSeries.observedEnd` and a 24h forecast peaking at `forecastPeak` on
`peakHour`. The area above the limit is filled red. All values are labelled
sample data on the page.

## Before publishing

- Fill `about.content.mission`, `footer.address`, `footer.email`,
  `contact.content.form.action`.
- Decide `solutions.content.showPricing` (currently `false`).
- Confirm team and advisor listing; partner logos only with written permission.
- Add `public/og.png` (1200×630) and set `NEXT_PUBLIC_SITE_URL`.
