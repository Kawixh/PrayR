"use client";

import { type AlAdhanDateInfo, type PrayerTimings } from "@/backend/types";
import { MoonStar, Sunset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getFastingTopBannerState } from "../_utils/fasting-top-banner";
import { formatTo12Hour } from "../_utils/time";

type SeharIftarHighlightsCardProps = {
  dateInfo: AlAdhanDateInfo;
  timings: PrayerTimings;
};

export function SeharIftarHighlightsCard({
  dateInfo,
  timings,
}: SeharIftarHighlightsCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;
    const syncNow = () => setNow(new Date());
    const delayToNextMinute = 60_000 - (Date.now() % 60_000);

    const timeoutId = window.setTimeout(() => {
      syncNow();
      intervalId = window.setInterval(syncNow, 60_000);
    }, delayToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const bannerState = useMemo(
    () => getFastingTopBannerState(timings, now),
    [timings, now],
  );

  if (bannerState === "hidden") {
    return null;
  }

  const isSehar = bannerState === "sehar";
  const label = isSehar ? "Sehar" : "Iftar";
  const prayerLabel = isSehar ? "Fajr" : "Maghrib";
  const value = formatTo12Hour(isSehar ? timings.Fajr : timings.Maghrib);
  const Icon = isSehar ? MoonStar : Sunset;
  const hijriDateLabel = `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`;
  const hijriMetaLabel = `${dateInfo.hijri.weekday.en} • ${dateInfo.hijri.month.ar}`;

  return (
    <section>
      <article className="mt-3 min-w-0 rounded-xl border border-primary/32 bg-primary/8 px-3.5 py-3.5 sm:px-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-tight break-words sm:text-4xl">
              {label}
            </h2>
          </div>
          <span className="rounded-full border border-primary/35 bg-background/85 p-2.5 text-primary">
            <Icon className="size-5" />
          </span>
        </div>

        <p className="font-display mt-4 text-5xl leading-none tracking-tight break-words sm:text-6xl">
          {value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          {hijriDateLabel}
        </p>
      </article>
    </section>
  );
}
