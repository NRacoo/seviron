"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/atoms/Icon/Icon";
import { ispuColor } from "@/lib/ispu";
import type { JakartaStation } from "@/types/jakarta";
import styles from "./StationSwitcher.module.css";

/**
 * Picks the station every page is scoped to.
 *
 * The network has ~90 stations, far too many for a plain list, so the menu is
 * searchable. Selection is a query parameter rather than client state so the
 * choice survives navigation between pages and can be linked to directly.
 */
export function StationSwitcher({ stations }: { stations: JakartaStation[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrap = useRef<HTMLDivElement>(null);

  // Layouts cannot read `searchParams`, so the switcher resolves the active
  // station from the URL itself. Stations are sorted worst-first, so falling
  // back to the head matches the pages' own default.
  const requested = params.get("station");
  const current = stations.find((s) => s.id === requested) ?? stations[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;

    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q),
    );
  }, [stations, query]);

  // Dismiss on outside click and on Escape.
  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!current) return null;

  function pick(id: string) {
    setOpen(false);
    setQuery("");

    // The map shows the whole network, so a station choice there is only
    // meaningful once the reader moves to a station-scoped page.
    const target = pathname === "/map" ? "/decisions" : pathname;
    const next = new URLSearchParams(params.toString());
    next.set("station", id);

    router.push(`${target}?${next.toString()}`);
  }

  return (
    <div className={styles.wrap} ref={wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.body}>
          <span className={styles.label}>Active station</span>
          <span className={styles.name}>{current.name}</span>
          <span className={styles.meta}>
            {current.city} · ISPU {current.ispu}
          </span>
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <Icon name="chevron" size={13} />
        </span>
      </button>

      {open ? (
        <div className={styles.menu}>
          <label className={styles.search}>
            <input
              autoFocus
              type="search"
              value={query}
              placeholder="Search station or area"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <ul role="listbox" className={styles.list}>
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.id === current.id}
                  className={`${styles.option} ${
                    s.id === current.id ? styles.optionActive : ""
                  }`}
                  onClick={() => pick(s.id)}
                >
                  <span
                    className={styles.bar}
                    style={{ background: ispuColor[s.severity] }}
                  />
                  <span className={styles.optionBody}>
                    <span className={styles.optionName}>{s.name}</span>
                    <span className={styles.optionRegion}>{s.city}</span>
                  </span>
                  <span
                    className={`${styles.optionValue} u-num`}
                    style={{ color: ispuColor[s.severity] }}
                  >
                    {s.ispu}
                  </span>
                </button>
              </li>
            ))}

            {filtered.length === 0 ? (
              <li className={styles.empty}>No station matches “{query}”.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
