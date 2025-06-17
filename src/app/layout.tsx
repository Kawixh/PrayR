import InstallButton from "@/components/install-button";
import RootLayoutClient from "@/components/root-layout-client";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "./_components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrayR - Your Daily Prayer Vibe",
  manifest: "/manifest.webmanifest",
  description:
    "Get your daily prayer times, right where you are. Real-time vibes, no cap. ✨",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrayR",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "PrayR",
    title: "PrayR - Your Daily Prayer Vibe",
    description:
      "Get your daily prayer times, right where you are. Real-time vibes, no cap. ✨",
  },
  twitter: {
    card: "summary",
    title: "PrayR - Your Daily Prayer Vibe",
    description:
      "Get your daily prayer times, right where you are. Real-time vibes, no cap. ✨",
  },
};

export const viewport: Viewport = {
  themeColor: "#3f51b5",
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="PrayR" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PrayR" />
        <meta
          name="description"
          content="Get your daily prayer times, right where you are. Real-time vibes, no cap. ✨"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3f51b5" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512.png"
        />
        <link rel="mask-icon" href="/icon-512.png" color="#3f51b5" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="p-4 flex flex-col container max-w-full md:max-w-2xl lg:max-w-4xl mx-auto h-screen gap-10">
            <InstallButton />
            <Navbar />

            <RootLayoutClient>{children}</RootLayoutClient>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
