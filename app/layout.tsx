import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-app-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R365 AI Accounting · Claude Demo",
  description: "Restaurant accounting powered by Claude – auto-GL categorization, reconciliation, and sales trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
