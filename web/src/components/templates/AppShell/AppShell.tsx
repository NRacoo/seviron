import { AppRail } from "@/components/organisms/AppRail/AppRail";
import type { Site } from "@/types/decision";
import styles from "./AppShell.module.css";

export function AppShell({
  sites,
  online,
  total,
  children,
}: {
  sites: Site[];
  online: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <AppRail sites={sites} online={online} total={total} />
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}
