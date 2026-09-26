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
  const value = formatTo12Hour(isSehar ? timings.Fajr : timings.Maghrib);
  const Icon = isSehar ? MoonStar : Sunset;
  const hijriDateLabel = `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`;

  return (
    <section
      aria-label={`${label} time`}
      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-display text-xl leading-tight font-semibold tabular-nums">
          {value}
        </p>
      </div>
      <p className="text-right text-xs leading-5 text-muted-foreground">{hijriDateLabel}</p>
    </section>
  );
}
