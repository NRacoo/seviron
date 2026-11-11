/**
 * Extracting JSON blobs that udara.jakarta.go.id embeds in its pages.
 *
 * The portal has no public JSON API: readings are server-rendered into script
 * tags as `window.__NAME__ = {...}` or `var NAME = {...}`. These helpers pull
 * those out safely.
 */

/**
 * Reads the JSON literal assigned to `name`, starting from the first `{` or `[`
 * after it and scanning to the matching terminator.
 *
 * Tracks string state so a brace, bracket or semicolon inside a value — e.g. a
 * station called "SMPN 88 (ROOFTOP); Lt. 2" — cannot truncate the blob, which a
 * regex approach gets wrong.
 */
export function extractAssigned<T>(
  html: string,
  name: string,
  open: "[" | "{",
): T | null {
  const close = open === "[" ? "]" : "}";

  const at = html.indexOf(name);
  if (at === -1) return null;

  const start = html.indexOf(open, at);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

/**
 * Parses a timestamp from the portal into an absolute instant.
 *
 * The portal emits naive local times with no zone — "2026-11-12T01:30:00" and
 * "2026-11-12 01:30:00" both mean Jakarta time (UTC+7). Left to
 * `new Date()`, Node would read those as the *server's* local zone, so a
 * deployment outside WIB would misread every reading by hours. Anything
 * already carrying an offset or a trailing `Z` is passed through untouched.
 */
export function parseJakartaTime(s: string | null): Date | null {
  if (!s) return null;

  const normalised = s.trim().replace(" ", "T");
  const zoned = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalised)
    ? normalised
    : `${normalised}+07:00`;

  const d = new Date(zoned);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** The portal serves a trimmed page to unrecognised agents. */
export const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "accept-language": "id,en;q=0.8",
} as const;
