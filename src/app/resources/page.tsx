import { getServerFeatureFlags } from "@/features/server";
import type { Metadata } from "next";

const asimYouTubeResources = [
  {
    title: "If Fajr adhan starts, can I still eat and drink?",
    url: "https://www.youtube.com/watch?v=9OKroQ-1RGo",
    transcriptSummary: [
      "He explains that eating and drinking must stop when true Fajr begins.",
      "He also clarifies to stop immediately at Fajr entry, not after a custom buffer.",
      "If you have a glass of water in your hand and the adhan is given you may drink",
      "But to reach out after the adhan has started this is not permissible",
    ],
  },
  {
    title: "People say stop eating 15-20 min before Fajr (Imsak)",
    url: "https://www.youtube.com/watch?v=j85GXuWLVNE",
    transcriptSummary: [
      "He emphasizes fasting starts at Fajr itself, not at an invented earlier cutoff.",
      "On the contrary in the Hadith it says that between the sahoor of the Prophet ﷺ and the iqamah of the prayer not the adhan but the iqamah was approximately 100 verses or 50 verses meaning that the prophet used to eat and drink until the very very last second once the adhan of Fajr is given this is where we refrain",
      "To give a buffer zone of 10 or 15 minutes this is baseless",
    ],
  },
  {
    title: "Dua before or after iftar?",
    url: "https://www.youtube.com/watch?v=q5hXbbaENfo",
    transcriptSummary: [
      "He states the known narrated iftar dua is said after breaking the fast, after eating and drinking something.",
    ],
  },
] as const;

const ramadanFaqItems = [
  {
    question: "Do I stop eating before Fajr because of Imsak?",
    answer:
      "No fixed early stop time is required. Fasting starts at Fajr (true dawn).",
  },
  {
    question: "Can I keep eating if adhan starts while I am eating?",
    answer: "Once true Fajr starts, stop eating and drinking immediately.",
  },
  {
    question: "When exactly should I open my fast?",
    answer: "Open at Maghrib entry and avoid delaying iftar without reason.",
  },
  {
    question: "Is there a fixed suhoor dua everyone must read?",
    answer:
      "No authenticated fixed suhoor dua is required; intention is in the heart.",
  },
  {
    question: "Is there an iftar dua?",
    answer:
      "Yes, the known narrated wording is recited after breaking the fast.",
  },
] as const;

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Ramadan fasting resources, timing guidance, and dua references based on Sheikh Assim Al Hakeem materials.",
  alternates: {
    canonical: "/resources",
  },
};

export default async function ResourcesPage() {
  const featureFlags = await getServerFeatureFlags();

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Resources
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">
          Ramadan Fasting Guide
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          This page explains why PrayR uses Sehar at Fajr and Iftar at Maghrib,
          with references from Sheikh Assim Al Hakeem.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Why these settings in PrayR
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground sm:text-base">
            <li>
              Sehar is shown at Fajr, not with a separate Imsak cutoff line.
            </li>
            <li>Fast starts at Fajr (true dawn).</li>
            <li>
              Fast ends at Maghrib (sunset), so iftar is tied to Maghrib time.
            </li>
            <li>
              You can still tune city, method, and school in settings to match
              local masjid timing standards.
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="text-xl font-semibold sm:text-2xl">
            When to start and end fasting
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-6 sm:text-base">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Start Fast
              </p>
              <p className="mt-1 font-semibold">At Fajr time</p>
              <p className="mt-1 text-muted-foreground">
                Stop eating when Fajr begins. PrayR aligns Sehar with Fajr.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                End Fast
              </p>
              <p className="mt-1 font-semibold">At Maghrib (sunset)</p>
              <p className="mt-1 text-muted-foreground">
                Open your fast when Maghrib enters. PrayR maps Iftar to Maghrib
                time.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="text-xl font-semibold sm:text-2xl">Dua for fasting</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Starting Fast (Sehar)
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              There is no specific authenticated fixed dua required before
              starting the fast. Intention (niyyah) is in the heart before Fajr.
            </p>
          </article>

          <article className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Breaking Fast (Iftar)
            </p>
            <p className="my-4 text-5xl leading-20 font-semibold ">
              ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ
              شَاءَ اللَّهُ
            </p>
            <p className="mt-2 text-sm font-semibold sm:text-base">
              Dhahaba al-zama’u wabtallatil-‘urooqu wa thabata al-ajru in sha’
              Allah
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
              Meaning: Thirst is gone, the veins are moistened, and the reward
              is confirmed, if Allah wills.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Sheikh Assim Al Hakeem Resources
        </h2>

        <div className="mt-4 grid gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Videos
            </h3>
            <ul className="space-y-2">
              {asimYouTubeResources.map((resource) => (
                <li
                  className="rounded-xl border border-border/70 bg-background/60 p-3"
                  key={resource.url}
                >
                  <p className="mb-2 inline-flex rounded-full border border-border/80 bg-muted/55 px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    YouTube
                  </p>
                  <a
                    className="text-sm font-semibold underline decoration-border underline-offset-4 hover:text-primary sm:text-base"
                    href={resource.url}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {resource.title}
                  </a>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Transcript Summary
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                      {resource.transcriptSummary.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {featureFlags.ramadanResourcesFaq ? (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Common Ramadan Questions
          </h2>
          <div className="mt-3 space-y-2.5">
            {ramadanFaqItems.map((item) => (
              <article
                className="rounded-xl border border-border/70 bg-background/60 p-3"
                key={item.question}
              >
                <p className="mb-2 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  Ramadan Resources Feature
                </p>
                <h3 className="text-sm font-semibold sm:text-base">
                  {item.question}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
