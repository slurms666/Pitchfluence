import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";

import "@/app/globals.css";
import { APP_NAME } from "@/lib/constants";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Influencer Outreach Copilot`,
  description:
    "Pitchfluence is a small-business influencer outreach copilot for scoring creators, building shortlists, and managing outreach.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={`${plusJakartaSans.variable} ${sora.variable} ${ibmPlexMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
