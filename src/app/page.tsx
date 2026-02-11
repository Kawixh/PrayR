import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { CitySeoSummary } from "./_components/city-seo-summary";
import { PrayerTimesWrapper } from "./_components/prayer-times-wrapper";
import { SettingsCheck } from "./_components/settings-check";

const siteUrl = getSiteUrl();

const faqEntries = [
  {
    question: "What prayer times does PrayR show each day?",
    answer:
      "PrayR shows Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha for the selected city and country.",
  },
  {
    question: "How are prayer times calculated in PrayR?",
    answer:
      "Prayer times are fetched from the AlAdhan timingsByCity API and adjusted using your selected calculation method and school.",
  },
  {
    question: "How many calculation options are available?",
    answer:
      "PrayR includes 23 calculation methods and 2 school options (Shafi and Hanafi) to match local fiqh preferences.",
  },
  {
    question: "Are times shown in local time?",
    answer:
      "Yes. PrayR displays today’s prayer times in your local timezone with a 12-hour clock format for readability.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqEntries.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PrayR",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Daily Muslim prayer times by city and country with configurable calculation methods and school settings.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Daily Prayer Times by City and Country",
  url: siteUrl,
  inLanguage: "en-US",
  description:
    "Check accurate Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for your city with trusted Islamic calculation methods.",
};

export const metadata: Metadata = {
  title: "Daily Prayer Times by City and Country",
  description:
    "Check accurate Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for your city with trusted Islamic calculation methods.",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "PrayR",
    title: "Daily Prayer Times by City and Country",
    description:
      "Check accurate Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for your city with trusted Islamic calculation methods.",
    url: "/",
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
    title: "Daily Prayer Times by City and Country",
    description:
      "Check accurate Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for your city with trusted Islamic calculation methods.",
    images: ["/twitter-image"],
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
};

export default function Page() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        suppressHydrationWarning
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      />

      <SettingsCheck>
        <div className="space-y-5">
          <PrayerTimesWrapper />
        </div>
      </SettingsCheck>

      <section
        aria-labelledby="prayer-faq-heading"
        className="glass-panel border-border/80 rounded-3xl border p-5 sm:p-6"
      >
        <h2 className="font-display text-2xl sm:text-3xl" id="prayer-faq-heading">
          Prayer Times FAQ
        </h2>
        <div className="mt-4 space-y-4">
          {faqEntries.map((item) => (
            <article className="rounded-xl border border-border/70 p-4" key={item.question}>
              <h3 className="text-base font-semibold leading-snug">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="prayer-times-heading"
        className="glass-panel border-border/80 rounded-3xl border p-5 sm:p-6"
      >
        <h2
          className="font-display text-3xl leading-tight sm:text-4xl"
          id="prayer-times-heading"
        >
          Daily Prayer Times for Your City
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          PrayR gives you today&apos;s Fajr, Dhuhr, Asr, Maghrib, and Isha times
          based on your location and fiqh preferences. Prayer data is sourced
          from the AlAdhan API and supports 23 calculation methods.
        </p>
        <CitySeoSummary />
      </section>
    </>
  );
}
