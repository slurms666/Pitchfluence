import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "@/app/globals.css";
import { APP_NAME } from "@/lib/constants";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Influencer Outreach Copilot`,
  description:
    "Pitchfluence is a small-business influencer outreach copilot for scoring creators, building shortlists, and managing outreach.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
