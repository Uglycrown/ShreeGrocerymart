import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import BackgroundPattern from "@/components/BackgroundPattern";

import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shree Grocery Mart - Quick Commerce",
  description: "Quick delivery e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <Providers>
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <BackgroundPattern />
          </div>
          <div className="relative z-10">
            <Header />
            {children}
            <Footer />
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
