"use client";

import { type AlAdhanDateInfo, type PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
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
    <Card className="overflow-hidden border-primary/35 bg-linear-to-br from-primary/12 via-primary/7 to-card p-0">
      <div className="relative px-4 py-4 sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute -top-10 -right-4 size-28 rounded-full bg-primary/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-primary/10 blur-2xl" />

        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Ramadan Dashboard
        </p>

        <div className="mt-3 grid gap-2 min-[580px]:grid-cols-2">
          <article className="min-w-0 rounded-xl border border-border/75 bg-background/65 px-3.5 py-3.5 sm:px-4">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Islamic Date
            </p>
            <p className="font-display mt-1 text-balance text-2xl leading-tight break-words sm:text-3xl">
              {hijriDateLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hijriMetaLabel}</p>
          </article>

          <article className="min-w-0 rounded-xl border border-primary/35 bg-background/70 px-3.5 py-3.5 sm:px-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-3xl leading-tight break-words sm:text-4xl">
                  {label}
                </h2>
                <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {prayerLabel}
                </p>
              </div>
              <span className="rounded-full border border-primary/35 bg-background/80 p-2.5 text-primary">
                <Icon className="size-5" />
              </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight break-words sm:text-4xl">
              {value}
            </p>
          </article>
        </div>
      </div>
    </Card>
  );
}
