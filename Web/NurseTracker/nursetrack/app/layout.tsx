import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import Providers from "../core/providers";

const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-kumbh-sans",
});

export const metadata: Metadata = {
  title: "NurseTrack",
  description: "Clinical tracking made organized and secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kumbhSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
