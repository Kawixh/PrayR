import { PostHogProvider } from "@/app/providers";
import RootLayoutClient from "@/components/root-layout-client";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerFeatureFlags } from "@/features/server";
import {
  getLanguageMetaTags,
  getPageAlternates,
  getSiteBaseUrl,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo/site";
import { getOgImageMetadata, getOgImageUrl } from "@/lib/seo/og-image";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Navbar } from "./_components/navbar";
import { PwaInstallBanner } from "./_components/pwa-install-banner";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Sora({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const siteUrl = getSiteBaseUrl();

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: siteUrl,
  description:
    "Accurate daily Muslim prayer times by city and country with configurable calculation methods.",
  inLanguage: SITE_LOCALE,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: siteUrl,
  logo: `${siteUrl}/android-chrome-512x512.png`,
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

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: getPageAlternates("/"),
  title: {
    default: `${SITE_NAME} Prayer Times`,
    template: `%s | ${SITE_NAME}`,
  },
  manifest: "/manifest.webmanifest",
  applicationName: SITE_NAME,
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
  creator: SITE_NAME,
  publisher: SITE_NAME,
  authors: [{ name: `${SITE_NAME} Team` }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
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
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} Prayer Times`,
    description:
      "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
    images: [
      getOgImageMetadata({
        title: `${SITE_NAME} Prayer Times`,
        description:
          "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
        pathname: "/",
      }),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} Prayer Times`,
    description:
      "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
    images: [
      getOgImageUrl({
        title: `${SITE_NAME} Prayer Times`,
        description:
          "Get accurate daily prayer times by city and country, with trusted Islamic calculation methods and school preferences.",
        pathname: "/",
      }),
    ],
  },
  other: {
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#5f72d8",
    "mobile-web-app-capable": "yes",
    ...getLanguageMetaTags(),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#121318" },
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
    <html lang={SITE_LOCALE} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="PrayR" />
        <meta content={SITE_LOCALE} httpEquiv="content-language" />
        <meta content={SITE_LOCALE} name="language" />
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <PostHogProvider>
          <JsonLdScript data={websiteJsonLd} id="website-jsonld" />
          <JsonLdScript data={organizationJsonLd} id="organization-jsonld" />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={120}>
              <div className="app-canvas">
                <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-4 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-8">
                  <PwaInstallBanner />
                  <Navbar featureFlags={featureFlags} />

                  <RootLayoutClient>
                    <main className="flex-1 space-y-6">{children}</main>
                  </RootLayoutClient>
                </div>
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
