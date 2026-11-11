"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/atoms/Icon/Icon";
import styles from "./NavItem.module.css";

export function NavItem({
  href,
  icon,
  label,
  keepSite = true,
}: {
  href: string;
  icon: IconName;
  label: string;
  /** Carry the selected site across navigation. */
  keepSite?: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === href;

  const site = params.get("site");
  const target = keepSite && site ? `${href}?site=${encodeURIComponent(site)}` : href;

  return (
    <Link
      href={target}
      className={`${styles.item} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className={styles.icon}>
        <Icon name={icon} size={16} />
      </span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
