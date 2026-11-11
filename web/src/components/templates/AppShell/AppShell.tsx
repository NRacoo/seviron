import { AppRail } from "@/components/organisms/AppRail/AppRail";
import type { JakartaStation } from "@/types/jakarta";
import styles from "./AppShell.module.css";

/**
 * Opts a route out of the centred reading container so it can fill the
 * viewport. `AppShell` detects this wrapper with `:has()`.
 */
export function FullBleed({ children }: { children: React.ReactNode }) {
  return <div className={styles.bleed}>{children}</div>;
}

export function AppShell({
  stations,
  online,
  total,
  children,
}: {
  stations: JakartaStation[];
  online: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <AppRail stations={stations} online={online} total={total} />
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}
