import type { Metadata } from "next";

const asimYouTubeResources = [
  {
    title: "If Fajr adhan starts, can I still eat and drink?",
    url: "https://www.youtube.com/watch?v=9OKroQ-1RGo",
    transcriptSummary: [
      "He explains that eating and drinking must stop when true Fajr begins.",
      "He also clarifies to stop immediately at Fajr entry, not after a custom buffer.",
    ],
  },
  {
    title: "Dua before or after iftar?",
    url: "https://www.youtube.com/watch?v=nFmL8JQI76w",
    transcriptSummary: [
      "He explains that dua can be made before iftar while still fasting.",
      "He states the known narrated iftar dua is said after breaking the fast.",
    ],
  },
  {
    title: "Is there a prescribed dua for suhoor?",
    url: "https://www.youtube.com/watch?v=Lgpz1LJMx4M",
    transcriptSummary: [
      "He clarifies there is no specific authenticated dua fixed for suhoor.",
      "He says intention to fast is in the heart and does not need a fixed phrase.",
    ],
  },
] as const;

const asimWebsiteResources = [
  {
    title: "First adhan or second adhan for fasting start?",
    url: "https://www.assimalhakeem.net/if-ive-an-intention-of-fasting-do-i-have-to-stop-eating-or-drinking-when-i-hear-the-first-athan-of-fajr-or-should-i-wait-for-the-second-one/",
    keyPoint:
      "Start fasting at the adhan that indicates true Fajr, not a separate earlier cutoff.",
  },
  {
    title: "If I hear Fajr adhan while eating, what should I do?",
    url: "https://www.assimalhakeem.net/would-like-to-clarify-if-i-have-heard-the-fajar-azan-do-i-have-to-stop-anything-immediately-even-if-there-is-a-little-food-in-my-mouth-or-water-in-my-hand/",
    keyPoint:
      "Stop once Fajr begins and avoid delaying the fast start beyond true dawn.",
  },
  {
    title: "Can I pray Maghrib first and then break my fast?",
    url: "https://www.assimalhakeem.net/question-sheikh-is-it-permissible-to-to-pray-maghreb-and-then-break-my-fast/",
    keyPoint:
      "Break fast at Maghrib entry without unnecessary delay, then continue worship.",
  },
  {
    title: "Is there a dua specifically for iftar or suhoor?",
    url: "https://www.assimalhakeem.net/is-there-a-duaa-to-be-said-at-the-time-of-iftar-what-about-the-suhur/",
    keyPoint:
      "No fixed suhoor dua is prescribed; iftar duas are addressed with authenticity notes.",
  },
  {
    title: "Authentic iftar dua and when to say it",
    url: "https://www.assimalhakeem.net/what-is-the-authentic-dua-to-read-at-iftar-it-should-be-read-before-breaking-the-fast-or-after-breaking-the-fast/",
    keyPoint:
      "Clarifies which iftar wording is authentic and that it is recited after breaking the fast.",
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

export default function ResourcesPage() {
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

        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            YouTube
          </h3>
          <ul className="space-y-2">
            {asimYouTubeResources.map((resource) => (
              <li
                className="rounded-xl border border-border/70 bg-background/60 p-3"
                key={resource.url}
              >
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

        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Website
          </h3>
          <ul className="space-y-2">
            {asimWebsiteResources.map((resource) => (
              <li
                className="rounded-xl border border-border/70 bg-background/60 p-3"
                key={resource.url}
              >
                <a
                  className="text-sm font-semibold underline decoration-border underline-offset-4 hover:text-primary sm:text-base"
                  href={resource.url}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {resource.title}
                </a>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {resource.keyPoint}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
