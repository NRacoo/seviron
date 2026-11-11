import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { GsapProvider } from "@/components/GsapProvider";
import { site } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500"] });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["700"] });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://seviron.id"),
  title: site.seo.title,
  description: site.seo.description,
  keywords: site.seo.keywords,
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    images: [site.seo.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [site.seo.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: site.design.colors.navy,
};

const colorVars = Object.fromEntries(
  Object.entries(site.design.colors).map(([k, v]) => [`--c-${k}`, v]),
) as React.CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.meta.language} className={`${inter.variable} ${interTight.variable} ${jb.variable}`} style={colorVars}>
      <body>
        <GsapProvider>{children}</GsapProvider>
      </body>
    </html>
  );
}
