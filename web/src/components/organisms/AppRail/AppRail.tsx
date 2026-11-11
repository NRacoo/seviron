import { Suspense } from "react";
import { Wordmark } from "@/components/atoms/Wordmark/Wordmark";
import { NavItem } from "@/components/molecules/NavItem/NavItem";
import { SiteSwitcher } from "@/components/molecules/SiteSwitcher/SiteSwitcher";
import type { IconName } from "@/components/atoms/Icon/Icon";
import type { Site } from "@/types/decision";
import styles from "./AppRail.module.css";

const groups: { title: string; items: { href: string; icon: IconName; label: string }[] }[] = [
  {
    title: "Monitor",
    items: [
      { href: "/map", icon: "map", label: "Site map" },
      { href: "/sensors", icon: "sensors", label: "Sensors" },
      { href: "/forecast", icon: "forecast", label: "Forecast" },
    ],
  },
  {
    title: "Act",
    items: [
      { href: "/decisions", icon: "decisions", label: "Decisions" },
      { href: "/actions", icon: "actions", label: "Actions" },
    ],
  },
  {
    title: "Report",
    items: [{ href: "/esg", icon: "esg", label: "ESG report" }],
  },
];

export function AppRail({
  sites,
  online,
  total,
}: {
  sites: Site[];
  online: number;
  total: number;
}) {
  return (
    <aside className={styles.rail}>
      <div className={styles.brand}>
        <Wordmark tone="light" />
      </div>

      <div className={styles.site}>
        <Suspense fallback={null}>
          <SiteSwitcher sites={sites} />
        </Suspense>
        <span className={styles.siteMeta}>
          {online}/{total} sensors reporting
        </span>
      </div>

      <nav className={styles.nav}>
        {groups.map((g) => (
          <div key={g.title} className={styles.group}>
            <span className={styles.groupTitle}>{g.title}</span>
            {g.items.map((i) => (
              <Suspense key={i.href} fallback={null}>
                <NavItem {...i} />
              </Suspense>
            ))}
          </div>
        ))}
      </nav>

      <footer className={styles.foot}>
        <span>Decision service</span>
        <span className={styles.version}>v0.1 · POC</span>
      </footer>
    </aside>
  );
}
