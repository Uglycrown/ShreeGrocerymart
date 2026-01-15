import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import BackgroundPattern from "@/components/BackgroundPattern";
import AppLoader from "@/components/AppLoader";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PushNotificationManager from "@/components/PushNotificationManager";

import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Shree Grocery Mart - Quick Commerce",
  description: "Quick delivery e-commerce platform - Get groceries delivered in minutes!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shree Grocery Mart",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Shree Grocery Mart",
    title: "Shree Grocery Mart - Quick Commerce",
    description: "Quick delivery e-commerce platform - Get groceries delivered in minutes!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Grocery Mart - Quick Commerce",
    description: "Quick delivery e-commerce platform - Get groceries delivered in minutes!",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SGM" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <Providers>
          <AppLoader />
          <ServiceWorkerRegistration />
          <PushNotificationManager />
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

