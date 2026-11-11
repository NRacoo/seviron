"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/atoms/Icon/Icon";
import type { Site } from "@/types/decision";
import styles from "./SiteSwitcher.module.css";

export function SiteSwitcher({ sites }: { sites: Site[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = sites.find((s) => s.name === params.get("site")) ?? sites[0];
  if (!current) return null;

  function pick(name: string) {
    setOpen(false);
    const target = pathname === "/map" ? "/forecast" : pathname;
    router.push(`${target}?site=${encodeURIComponent(name)}`);
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.body}>
          <span className={styles.label}>Active site</span>
          <span className={styles.name}>{current.name}</span>
          <span className={styles.meta}>{current.region}</span>
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <Icon name="chevron" size={13} />
        </span>
      </button>

      {open ? (
        <ul className={styles.menu} role="listbox">
          {sites.map((s) => (
            <li key={s.name}>
              <button
                type="button"
                role="option"
                aria-selected={s.name === current.name}
                className={`${styles.option} ${s.name === current.name ? styles.optionActive : ""}`}
                onClick={() => pick(s.name)}
              >
                <span className={styles.optionName}>{s.name}</span>
                <span className={styles.optionRegion}>{s.region}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
