import { getServerFeatureFlags } from "@/features/server";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrayerTimesWrapper } from "./_components/prayer-times-wrapper";
import { SettingsCheck } from "./_components/settings-check";
import { WhatsNewBanner } from "./_components/whats-new-banner";

const siteUrl = getSiteUrl();

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
    question: "When does fasting start each day?",
    answer:
      "Fasting starts at Fajr (true dawn). PrayR shows Sehar at Fajr and does not enforce a separate earlier cutoff.",
  },
  {
    question: "When should I break my fast?",
    answer:
      "Break the fast at Maghrib (sunset). PrayR maps Iftar to Maghrib time.",
  },
  {
    question: "Is there a specific dua for Sehar before fasting?",
    answer:
      "There is no authenticated fixed dua required for Sehar. Intention to fast is made in the heart before Fajr.",
  },
  {
    question: "When is the iftar dua recited?",
    answer:
      "The known narrated iftar dua is recited after breaking the fast.",
  },
  {
    question: "What if my local adhan timing differs by a few minutes?",
    answer:
      "Local masjid schedules may vary by method or local timetable. You can adjust city, method, and school in settings to match your local standard.",
  },
  {
    question: "What prayer timings does PrayR show?",
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
        <WhatsNewBanner />

        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">Resources</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                Ramadan guidance, fasting timing references, and duas are available
                here from the home screen.
              </p>
            </div>
            <Button asChild className="min-h-10 rounded-full px-5 py-2.5" type="button">
              <Link href="/resources">Open Resources</Link>
            </Button>
          </div>
        </section>

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
