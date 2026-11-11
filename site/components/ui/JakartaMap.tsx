"use client";

/** Stylised Jabodetabek outline with deterministic sanction dots. */
export function JakartaMap({ count }: { count: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const a = (i * 2.399963) % (Math.PI * 2);
    const r = 0.22 + ((i * 37) % 60) / 100;
    return {
      x: 50 + Math.cos(a) * r * 38,
      y: 46 + Math.sin(a) * r * 26,
    };
  });

  return (
    <svg viewBox="0 0 100 70" className="w-full" role="img" aria-label="Greater Jakarta sanctioned sites">
      <path
        d="M8 30 L20 20 L36 16 L52 14 L70 18 L86 24 L92 34 L88 46 L76 56 L58 62 L40 60 L24 54 L12 44 Z"
        fill="rgba(62,169,245,0.08)"
        stroke="rgba(62,169,245,0.45)"
        strokeWidth="0.6"
      />
      {dots.map((d, i) => (
        <circle key={i} data-dot cx={d.x} cy={d.y} r="1.4" fill="var(--c-loss)" opacity="0.9" />
      ))}
    </svg>
  );
}
