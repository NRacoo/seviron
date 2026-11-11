import fs from "node:fs";

const SOURCE = new URL("../src/lib/geo/source.geojson", import.meta.url);
const TARGET = new URL("../src/lib/geo/indonesia.ts", import.meta.url);

const g = JSON.parse(fs.readFileSync(SOURCE, "utf8"));

// Equirectangular projection tuned to the Indonesian archipelago.
const LON0 = 94.5, LON1 = 141.5, LAT0 = 6.5, LAT1 = -11.5;
const W = 1000;
const H = Math.round((W * (LAT0 - LAT1)) / (LON1 - LON0));

const px = ([lon, lat]) => [
  ((lon - LON0) / (LON1 - LON0)) * W,
  ((LAT0 - lat) / (LAT0 - LAT1)) * H,
];

const tri = (a, b, c) =>
  Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;

// Visvalingam-Whyatt: repeatedly drop the vertex with the smallest effective
// area. Works correctly on closed rings, unlike Douglas-Peucker.
function simplify(pts, minArea, minPts = 6) {
  const p = pts.slice();
  if (p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) {
    p.pop();
  }
  if (p.length <= minPts) return p;

  const live = p.map((pt, i) => ({ pt, i, prev: i - 1, next: i + 1 }));
  live[0].prev = live.length - 1;
  live[live.length - 1].next = 0;

  let count = live.length;
  const removed = new Set();

  const areaOf = (n) => tri(live[n.prev].pt, n.pt, live[n.next].pt);

  while (count > minPts) {
    let best = null, bestA = Infinity;
    for (const n of live) {
      if (removed.has(n.i)) continue;
      const a = areaOf(n);
      if (a < bestA) { bestA = a; best = n; }
    }
    if (!best || bestA > minArea) break;
    removed.add(best.i);
    live[best.prev].next = best.next;
    live[best.next].prev = best.prev;
    count--;
  }

  return live.filter((n) => !removed.has(n.i)).map((n) => n.pt);
}

function ringArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return Math.abs(a / 2);
}

const MIN_AREA = 0.55;   // simplification tolerance, px^2
const MIN_RING = 1.5;    // drop islands smaller than this, px^2

function ringPath(ring) {
  const raw = ring.map(px);
  if (ringArea(raw) < MIN_RING) return "";
  const pts = simplify(raw, MIN_AREA);
  if (pts.length < 3) return "";
  return (
    pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z"
  );
}

function featurePath(geom) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  return polys.map((poly) => ringPath(poly[0])).join("");
}

const regions = g.features
  .map((f) => ({ name: f.properties.state, d: featurePath(f.geometry) }))
  .filter((r) => r.d)
  .sort((a, b) => a.name.localeCompare(b.name));

const out = `// Generated asset. Province outlines for Indonesia, pre-projected
// (equirectangular) into the viewBox below and simplified with Visvalingam-Whyatt,
// so the browser never ships or parses GeoJSON.
//
// Regenerate: node scripts/build-map.mjs

export const MAP_WIDTH = ${W};
export const MAP_HEIGHT = ${H};

/** Geographic bounds covered by the viewBox. */
export const MAP_BOUNDS = {
  lon0: ${LON0},
  lon1: ${LON1},
  lat0: ${LAT0},
  lat1: ${LAT1},
};

export function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon - MAP_BOUNDS.lon0) / (MAP_BOUNDS.lon1 - MAP_BOUNDS.lon0)) * MAP_WIDTH,
    y: ((MAP_BOUNDS.lat0 - lat) / (MAP_BOUNDS.lat0 - MAP_BOUNDS.lat1)) * MAP_HEIGHT,
  };
}

export interface Region {
  name: string;
  d: string;
}

export const REGIONS: Region[] = ${JSON.stringify(regions)};
`;

fs.writeFileSync(TARGET, out);
const pts = regions.reduce((a, r) => a + (r.d.match(/L/g) ?? []).length, 0);
console.log("regions", regions.length, "vertices", pts, "kb", Math.round(out.length / 1024));
