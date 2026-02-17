import { Separator } from "@/components/ui/separator";
import { getServerFeatureFlags } from "@/features/server";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CitySeoSummary } from "./_components/city-seo-summary";
import { PrayerTimesWrapper } from "./_components/prayer-times-wrapper";
import { SettingsCheck } from "./_components/settings-check";

const siteUrl = getSiteUrl();

const prayerMeaningItems = [
  {
    name: "Fajr",
    meaning:
      "The dawn prayer that starts before sunrise and begins your daily prayer schedule.",
  },
  {
    name: "Sunrise",
    meaning:
      "Marks the end of Fajr time. It is shown so you clearly know the morning transition.",
  },
  {
    name: "Dhuhr",
    meaning:
      "The midday prayer after the sun passes its highest point in the sky.",
  },
  {
    name: "Asr",
    meaning:
      "The afternoon prayer. Its time changes based on the school setting you choose.",
  },
  {
    name: "Maghrib",
    meaning:
      "The sunset prayer that begins right after the sun sets below the horizon.",
  },
  {
    name: "Isha",
    meaning: "The night prayer and the final required prayer of the day.",
  },
] as const;

const settingMeaningItems = [
  {
    name: "City and Country",
    meaning:
      "Used to load the correct local prayer times for your area and timezone.",
  },
  {
    name: "Calculation Method",
    meaning:
      "Selects the scholarly calculation standard used to generate prayer times.",
  },
  {
    name: "School (Shafi or Hanafi)",
    meaning:
      "Affects how Asr time is calculated so timings match your fiqh preference.",
  },
  {
    name: "Dashboard View",
    meaning:
      "Choose between timeline or card view to read your daily schedule more easily.",
  },
  {
    name: "Reminders",
    meaning:
      "Lets you enable local prayer notifications so you do not miss prayer windows.",
  },
] as const;

const faqEntries = [
  {
    question: "What prayer times does PrayR show?",
    answer:
      "PrayR shows Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha for your selected location.",
  },
  {
    question: "How do I set my location?",
    answer:
      "Open Settings, choose your city and country, and save. The homepage then loads your local prayer times.",
  },
  {
    question: "What is the difference between method and school?",
    answer:
      "Method controls the calculation standard, while school controls fiqh rules that mainly affect Asr timing.",
  },
  {
    question: "Why are my mosque times slightly different?",
    answer:
      "Local mosques may use different calculation rules, manual offsets, or iqamah schedules. Check settings to match your local standard.",
  },
  {
    question: "Does this app use my GPS location?",
    answer:
      "No GPS is required. You can manually set city and country, and those settings are stored in your browser.",
  },
  {
    question: "Are prayer times shown in local time?",
    answer:
      "Yes. Times are shown in your local timezone using a readable 12-hour format.",
  },
  {
    question: "Can I use dark mode, light mode, or system mode?",
    answer:
      "Yes. PrayR supports dark, light, and system themes and adjusts automatically.",
  },
  {
    question: "Can I view all prayers in one place?",
    answer:
      "Yes. The All Prayer Times section lists every prayer for the day in one simple summary grid.",
  },
  {
    question: "Does PrayR include Adhkar links?",
    answer:
      "Yes, when the Adhkar feature is enabled you can open related adhkar from each prayer card.",
  },
  {
    question: "What should I do if prayer times fail to load?",
    answer:
      "Check your internet connection, verify settings, and refresh. If it still fails, reopen settings and save location again.",
  },
  {
    question: "Can I install PrayR on my phone?",
    answer:
      "Yes. Use your browser install option or the install banner to add PrayR as a home screen app.",
  },
  {
    question: "Is PrayR free to use?",
    answer:
      "Yes. PrayR is free to use for checking daily prayer times and related guidance.",
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
  name: "Prayer Times and Daily Salah Guide",
  url: siteUrl,
  inLanguage: "en-US",
  description:
    "Simple daily prayer times dashboard with clear explanations for each prayer and setting.",
};

export const metadata: Metadata = {
  title: "Prayer Times and Daily Salah Guide",
  description:
    "View accurate daily prayer times by city and country with clear explanations for every prayer and setting.",
  keywords: [
    "prayer times by city",
    "daily salah times",
    "fajr time today",
    "dhuhr time today",
    "asr prayer time",
    "maghrib time today",
    "isha prayer time",
    "muslim prayer schedule",
  ],
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
    title: "Prayer Times and Daily Salah Guide",
    description:
      "View accurate daily prayer times by city and country with clear explanations for every prayer and setting.",
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
    title: "Prayer Times and Daily Salah Guide",
    description:
      "View accurate daily prayer times by city and country with clear explanations for every prayer and setting.",
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

export default async function Page() {
  const featureFlags = await getServerFeatureFlags();

  if (!featureFlags.prayerTimings) {
    if (featureFlags.adhkars) {
      redirect("/adhkars");
    }

    redirect("/settings");
  }

  return (
    <>
      <div className="homepage-clean space-y-6">
        <section aria-labelledby="dashboard-heading" className="space-y-4">
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            id="dashboard-heading"
          >
            Today&apos;s Prayer Dashboard
          </h2>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            Daily prayer schedule, timeline, and reminders based on your saved
            location and preferences.
          </p>
          <SettingsCheck>
            <PrayerTimesWrapper featureFlags={featureFlags} />
          </SettingsCheck>
        </section>

        <section
          aria-labelledby="prayer-meaning-heading"
          className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6"
        >
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            id="prayer-meaning-heading"
          >
            What Each Prayer Means
          </h2>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Quick definitions for each prayer name.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prayerMeaningItems.map((item) => (
              <article
                className="rounded-lg border border-border/70 bg-background px-4 py-3"
                key={item.name}
              >
                <h3 className="text-base leading-tight font-semibold">
                  {item.name}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.meaning}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="settings-meaning-heading"
          className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6"
        >
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            id="settings-meaning-heading"
          >
            What Each Setting Means
          </h2>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Simple definitions for each settings option.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settingMeaningItems.map((item) => (
              <article
                className="rounded-lg border border-border/70 bg-background px-4 py-3"
                key={item.name}
              >
                <h3 className="text-base leading-tight font-semibold">
                  {item.name}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.meaning}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="homepage-faq-heading"
          className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6"
        >
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            id="homepage-faq-heading"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Common questions and answers about prayer times and this page.
          </p>
          <div className="space-y-3">
            {faqEntries.map((item) => (
              <details
                className="rounded-lg border border-border/70 bg-background px-4 py-3"
                key={item.question}
              >
                <summary className="cursor-pointer list-none text-sm leading-6 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="homepage-seo-heading"
          className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6"
        >
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            id="homepage-seo-heading"
          >
            SEO and Search Summary
          </h2>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            PrayR helps Muslims check accurate daily prayer times by city and
            country, with clear explanations for Fajr, Sunrise, Dhuhr, Asr,
            Maghrib, and Isha.
          </p>
          <CitySeoSummary />
          <Separator />
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Search topics covered: prayer times by city, today&apos;s Fajr time,
            Dhuhr time, Asr time, Maghrib time, Isha time, salah timetable,
            Islamic prayer schedule, and prayer time settings.
          </p>
        </section>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        suppressHydrationWarning
        type="application/ld+json"
      />
    </>
  );
}
