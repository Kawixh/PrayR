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
    <Card className="glass-panel block rounded-2xl border-primary/30 p-4 sm:p-5">
      <p className="soft-chip inline-flex">Ramadan Dashboard</p>

      <div className="mt-3 grid gap-2 min-[580px]:grid-cols-2">
        <article className="min-w-0 rounded-xl border border-border/75 bg-background/85 px-3.5 py-3.5 sm:px-4">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Islamic Date
          </p>
          <p className="font-display mt-1 text-balance text-2xl leading-tight break-words sm:text-3xl">
            {hijriDateLabel}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hijriMetaLabel}</p>
        </article>

        <article className="min-w-0 rounded-xl border border-primary/32 bg-primary/8 px-3.5 py-3.5 sm:px-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-3xl leading-tight break-words sm:text-4xl">
                {label}
              </h2>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {prayerLabel}
              </p>
            </div>
            <span className="rounded-full border border-primary/35 bg-background/85 p-2.5 text-primary">
              <Icon className="size-5" />
            </span>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-tight break-words sm:text-4xl">
            {value}
          </p>
        </article>
      </div>
    </Card>
  );
}
