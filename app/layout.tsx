import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd, { siteGraph, SITE_URL } from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Bloodlust & Harmony: Castle Fight-Style Auto Battler RTS",
    template: "%s — Bloodlust & Harmony",
  },
  description:
    "A Castle Fight-style auto-battler RTS. Your buildings spawn endless waves that march on the enemy castle. Win through build order, economy, and counters, not clicks. Free alpha: join the Discord and wishlist on Steam.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Bloodlust & Harmony",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen flex flex-col bg-bh-night text-bh-ink font-sans">
        <JsonLd data={siteGraph()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
