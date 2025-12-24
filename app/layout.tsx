import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cx } from "@/utils";
import MainNavigation, { MainNavigationWrapper } from "@/src/components/MainNavigation";
import "./globals.css";
import { SkipNavContent } from "@/components/SkipNavLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial App",
  description: "Budget overview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cx(`${geistSans.variable} ${geistMono.variable} antialiased`)}
      >
        <MainNavigationWrapper>
          <MainNavigation />
          <SkipNavContent />
          {children}
        </MainNavigationWrapper>
      </body>
    </html>
  );
}
