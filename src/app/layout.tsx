import RootLayoutClient from "@/components/root-layout-client";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Navbar } from "./_components/navbar";
import { PwaInstallBanner } from "./_components/pwa-install-banner";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-fraunces",
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
  themeColor: "#6db7ba",
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
        <meta name="msapplication-TileColor" content="#6db7ba" />
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
        <link rel="mask-icon" href="/icon-512.png" color="#6db7ba" />
      </head>

      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="app-canvas">
            <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-4 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
              <Navbar />
              <PwaInstallBanner />

              <RootLayoutClient>
                <main className="space-y-6">{children}</main>
              </RootLayoutClient>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
