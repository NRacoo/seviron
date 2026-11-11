import type { Metadata } from "next";
import { AppShell } from "@/components/templates/AppShell/AppShell";
import { getSensors, getSites } from "@/lib/api";
import type { Site } from "@/types/decision";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seviron — Environmental decision platform",
  description:
    "Normalize multi-vendor air sensors, forecast exposure 24 hours ahead, and turn it into auditable operational decisions.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let sites: Site[] = [];
  let online = 0;
  let total = 0;

  try {
    const [list, fleet] = await Promise.all([getSites(), getSensors()]);
    sites = list;
    online = fleet.online;
    total = fleet.total;
  } catch {
    // decision service offline; pages render their own notice
  }

  return (
    <html lang="en">
      <body>
        <AppShell sites={sites} online={online} total={total}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
