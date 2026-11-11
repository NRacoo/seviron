/** Convert a content-defined scrollLength ("150vh", "500vh", "800px") into pixels. */
export function toPx(length: string) {
  const match = /^([\d.]+)(vh|vw|px|%)?$/.exec(length.trim());
  if (!match) return window.innerHeight;
  const n = Number(match[1]);
  switch (match[2]) {
    case "vw":
      return (n / 100) * window.innerWidth;
    case "px":
      return n;
    case "%":
    case "vh":
    default:
      return (n / 100) * window.innerHeight;
  }
}

export function endFor(length: string) {
  return () => `+=${toPx(length)}`;
}
