"use client";

import { type PrayerTimings } from "@/backend/types";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentPrayerName, getPrayerStatusSnapshot } from "../_utils/prayer-day";

type CurrentPrayerStatusCardProps = {
  timings: PrayerTimings;
};

function formatCountdown(target: Date, now: Date): string {
  const totalMinutes = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / 60_000),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) {
    return "starting now";
  }

  if (hours === 0) {
    return `in ${minutes}m`;
  }

  return minutes === 0 ? `in ${hours}h` : `in ${hours}h ${minutes}m`;
}

export function CurrentPrayerStatusCard({ timings }: CurrentPrayerStatusCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const snapshot = useMemo(
    () => getPrayerStatusSnapshot(timings, currentTime),
    [currentTime, timings],
  );
  const currentPrayer = useMemo(
    () => getCurrentPrayerName(timings, currentTime),
    [currentTime, timings],
  );

  if (!snapshot) {
    return null;
  }

  const { activeMakruh, nextPrayer } = snapshot;
  const statusLabel = activeMakruh
    ? `Makruh time until ${activeMakruh.endLabel}`
    : currentPrayer
      ? `${currentPrayer} time now`
      : "No fard prayer right now";

  return (
    <section
      aria-label="Next prayer"
      className="relative overflow-hidden rounded-3xl bg-primary px-5 pt-5 pb-4 text-primary-foreground shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--primary)_80%,transparent)] sm:px-6 sm:pt-6 dark:bg-[color-mix(in_oklab,var(--primary)_24%,var(--card))] dark:text-foreground dark:shadow-none dark:ring-1 dark:ring-primary/25"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative">
        <p className="text-sm font-medium opacity-80">Next prayer</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
            {nextPrayer.name}
          </h2>
          <p className="font-display text-3xl leading-none tabular-nums sm:text-4xl">
            {nextPrayer.time12}
          </p>
        </div>
        <p className="mt-2 text-sm font-medium tabular-nums opacity-80">
          {formatCountdown(nextPrayer.date, currentTime)}
        </p>

        <p
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            activeMakruh
              ? "bg-amber-300 text-amber-950"
              : "bg-white/15 text-primary-foreground dark:bg-primary/15 dark:text-primary",
          )}
        >
          {activeMakruh ? <TriangleAlert aria-hidden className="size-3.5" /> : null}
          {statusLabel}
        </p>
      </div>
    </section>
  );
}
