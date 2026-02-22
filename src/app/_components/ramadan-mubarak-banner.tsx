"use client";

import {
  RAMADAN_BANNER_STORAGE_KEY,
  readBannerDismissed,
  writeBannerDismissed,
} from "@/app/_utils/banner-preferences";
import { type AlAdhanDateInfo, type PrayerTimings } from "@/backend/types";
import { MoonStar, Sunset, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getFastingTopBannerState } from "../_utils/fasting-top-banner";
import { formatTo12Hour } from "../_utils/time";

type RamadanMubarakBannerProps = {
  dateInfo: AlAdhanDateInfo;
  showSeharAndIftarTimes: boolean;
  timings: PrayerTimings;
};

function isRamadan(dateInfo: AlAdhanDateInfo): boolean {
  const month = dateInfo.hijri.month;
  const monthEn = month.en.trim().toLowerCase();

  return (
    month.number === 9 ||
    monthEn.includes("ramadan") ||
    monthEn.includes("ramadhan") ||
    monthEn.includes("ramzan")
  );
}

export function RamadanMubarakBanner({
  dateInfo,
  showSeharAndIftarTimes,
  timings,
}: RamadanMubarakBannerProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !readBannerDismissed(RAMADAN_BANNER_STORAGE_KEY);
  });

  const isRamadanMonth = useMemo(() => isRamadan(dateInfo), [dateInfo]);
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

  const fastingBannerState = useMemo(() => {
    if (!showSeharAndIftarTimes) {
      return "hidden";
    }

    return getFastingTopBannerState(timings, now);
  }, [now, showSeharAndIftarTimes, timings]);

  if (!isVisible || !isRamadanMonth) {
    return null;
  }

  const hijriDateLabel = `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`;
  const isSehar = fastingBannerState === "sehar";
  const fastingLabel = isSehar ? "Sehar" : "Iftar";
  const fastingPrayerLabel = isSehar ? "Fajr" : "Maghrib";
  const fastingTime = formatTo12Hour(isSehar ? timings.Fajr : timings.Maghrib);
  const FastingIcon = isSehar ? MoonStar : Sunset;

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/35 bg-primary/8">
      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MoonStar className="size-4 text-primary" />
            <p className="text-sm font-semibold">Ramadan-ul-Mubarak</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{hijriDateLabel}</p>
        </div>
        <button
          aria-label="Dismiss Ramadan banner"
          className="text-muted-foreground hover:bg-primary/10 hover:text-foreground rounded-md p-1.5 transition-colors"
          onClick={() => {
            setIsVisible(false);
            writeBannerDismissed(RAMADAN_BANNER_STORAGE_KEY);
          }}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>

      {fastingBannerState !== "hidden" ? (
        <div className="border-t border-primary/20 bg-card/55 p-3 sm:px-5 sm:py-4">
          <article className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/65 px-3 py-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {fastingLabel}
              </p>
              <p className="mt-1 text-xl font-semibold">{fastingTime}</p>
              <p className="text-xs text-muted-foreground">{fastingPrayerLabel}</p>
            </div>
            <span className="rounded-full border border-primary/30 bg-background/80 p-2 text-primary">
              <FastingIcon className="size-4" />
            </span>
          </article>
        </div>
      ) : null}
    </section>
  );
}
