import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/util/SmoothScrollProvider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap"
})

export const metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.fullName}. ${site.positioning} that helps organizations monitor environmental conditions, anticipate potential risks, and make informed decisions.`,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable}  antialiased`}
    >
      <body className="bg-sand font-sans text-ink">
        <SmoothScrollProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
