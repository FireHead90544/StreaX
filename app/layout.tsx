import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StreaX - Gamified Productivity Tracker",
    template: "%s | StreaX"
  },
  description: "Track your productivity & stay consistent with Pomodoro sessions, build streaks, and gamify your daily goals.",
  keywords: [
    "productivity tracker",
    "pomodoro timer",
    "streak tracker",
    "habit tracker",
    "gamification",
    "task management",
    "focus timer",
    "productivity app",
    "time management",
    "goal tracking",
    "daily habits",
    "work tracker"
  ],
  authors: [{ name: "RudraXD", url: "https://github.com/FireHead90544" }],
  creator: "RudraXD",
  publisher: "RudraXD",
  manifest: "/manifest.json",
  applicationName: "StreaX",
  category: "productivity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/FireHead90544/streax",
    siteName: "StreaX",
    title: "StreaX - Gamified Productivity Tracker",
    description: "Track your productivity & stay consistent with Pomodoro sessions, build streaks, and gamify your daily goals.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "StreaX - Gamified Productivity Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreaX - Gamified Productivity Tracker",
    description: "Track your productivity & stay consistent with Pomodoro sessions, build streaks, and gamify your daily goals.",
    images: ["/og.png"],
    creator: "@FireHead90544",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ]
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${space.variable} font-sans`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
