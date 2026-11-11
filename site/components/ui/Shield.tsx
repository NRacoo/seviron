export function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Perisai">
      <path
        d="M16 2.5 28 6.5v10.2c0 6.2-4.6 11.2-12 13.3C8.6 27.9 4 22.9 4 16.7V6.5Z"
        fill="rgba(208,255,65,0.12)"
        stroke="var(--c-lime)"
        strokeWidth="1.6"
      />
      <path d="M10.5 16.4 14.4 20.3 22 12.7" fill="none" stroke="var(--c-lime)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
