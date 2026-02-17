import { PostHogProvider } from "@/app/providers";
import RootLayoutClient from "@/components/root-layout-client";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerFeatureFlags } from "@/features/server";
import { getSiteUrl } from "@/lib/site-url";
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

const siteUrl = getSiteUrl();

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PrayR",
  url: siteUrl,
  description:
    "Accurate daily Muslim prayer times by city and country with configurable calculation methods.",
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PrayR",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
};

const themeInitScript = `
(() => {
  try {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : (prefersDark ? "dark" : "light");
    const isDark = resolvedTheme === "dark";
    const backgroundColor = isDark ? "#10232a" : "#e9f9f7";

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    root.style.backgroundColor = backgroundColor;

    const applyBodyBackground = () => {
      if (document.body) {
        document.body.style.backgroundColor = backgroundColor;
      }
    };

    applyBodyBackground();

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", applyBodyBackground, {
        once: true,
      });
    }
  } catch {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PrayR Prayer Times",
    template: "%s | PrayR",
  },
  manifest: "/manifest.webmanifest",
  applicationName: "PrayR",
  description:
    "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
  keywords: [
    "prayer times",
    "muslim prayer times",
    "salah times",
    "adhan time",
    "islamic prayer timetable",
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ],
  category: "Religion & Spirituality",
  creator: "PrayR",
  publisher: "PrayR",
  authors: [{ name: "PrayR Team" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrayR",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "PrayR",
    locale: "en_US",
    title: "PrayR Prayer Times",
    description:
      "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PrayR daily prayer times app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrayR Prayer Times",
    description:
      "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
    images: ["/twitter-image"],
  },
  other: {
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#6db7ba",
    "mobile-web-app-capable": "yes",
    "content-language": "en-US",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#10232a" },
  ],
  minimumScale: 1,
  maximumScale: 5,
  initialScale: 1,
  width: "device-width",
  userScalable: true,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const featureFlags = await getServerFeatureFlags();

  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <PostHogProvider>
          <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            suppressHydrationWarning
            type="application/ld+json"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
            suppressHydrationWarning
            type="application/ld+json"
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="app-canvas">
              <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-4 px-4 pb-[calc(var(--bottom-nav-reserve,8rem)+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-8">
                <PwaInstallBanner />

                <RootLayoutClient>
                  <main className="flex-1 space-y-6">{children}</main>
                </RootLayoutClient>

                <Navbar featureFlags={featureFlags} />
              </div>
            </div>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
