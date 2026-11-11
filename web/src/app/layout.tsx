import type { Metadata } from "next";
import { AppShell } from "@/components/templates/AppShell/AppShell";
import { isReporting } from "@/lib/adapt";
import { getJakartaAir } from "@/lib/jakarta";
import type { JakartaStation } from "@/types/jakarta";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seviron — Environmental decision platform",
  description:
    "Live air quality across DKI Jakarta, forecast exposure, and auditable operational decisions.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let stations: JakartaStation[] = [];
  let online = 0;

  try {
    const snapshot = await getJakartaAir();
    stations = snapshot.stations;
    online = stations.filter(isReporting).length;
  } catch {
    // Upstream portal unreachable; each page renders its own notice.
  }

  return (
    <html lang="en">
      <body>
        <AppShell stations={stations} online={online} total={stations.length}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
