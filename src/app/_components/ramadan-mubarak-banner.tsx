"use client";

import {
  RAMADAN_BANNER_STORAGE_KEY,
  readBannerDismissed,
  writeBannerDismissed,
} from "@/app/_utils/banner-preferences";
import { type AlAdhanDateInfo, type PrayerTimings } from "@/backend/types";
import { MoonStar, X } from "lucide-react";
import { useMemo, useState } from "react";
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

  if (!isVisible || !isRamadanMonth) {
    return null;
  }

  const hijriDateLabel = `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`;
  const seharTime = formatTo12Hour(timings.Fajr);
  const iftarTime = formatTo12Hour(timings.Maghrib);

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

      {showSeharAndIftarTimes ? (
        <div className="grid gap-2 border-t border-primary/20 bg-card/55 p-3 sm:grid-cols-2 sm:px-5 sm:py-4">
          <article className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Sehar
            </p>
            <p className="mt-1 text-xl font-semibold">{seharTime}</p>
            <p className="text-xs text-muted-foreground">Fajr</p>
          </article>

          <article className="rounded-lg border border-border/70 bg-background/65 px-3 py-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Iftar
            </p>
            <p className="mt-1 text-xl font-semibold">{iftarTime}</p>
            <p className="text-xs text-muted-foreground">Maghrib</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
