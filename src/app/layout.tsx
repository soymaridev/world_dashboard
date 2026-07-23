import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import "./dashboard.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "3D Earth Model Monitor",
  description: "Real-time globe visualization analytics dashboard",
};

import { GlobeSettingsProvider } from "@/components/GlobeSettingsContext";
import PersistentGlobe from "@/components/PersistentGlobe";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable}`}
    >
      <head>
        {/* Anti-FOUC Critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { 
            background: #020408 !important; 
            color: #e0eaf8 !important;
            margin: 0;
            padding: 0;
          }
        `}} />
      </head>
      <body className={rajdhani.className}>
        <GlobeSettingsProvider>
          <PersistentGlobe />
          {children}
        </GlobeSettingsProvider>
      </body>
    </html>
  );
}
