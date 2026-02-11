"use client";

import { PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatTo12Hour, prayerTimeToDate } from "../_utils/time";

type PrayerTime = {
  name: string;
  time: string;
};

type PrayerStatus = {
  nextPrayer: PrayerTime;
  previousPrayer: PrayerTime;
  timeRemaining: string;
  isWithinFifteenMinutes: boolean;
};

function getPrayerStatus(now: Date, timings: PrayerTimings): PrayerStatus | null {
  const basePrayerTimes: PrayerTime[] = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  const prayerTimes = basePrayerTimes
    .map((prayer) => {
      const prayerDate = prayerTimeToDate(prayer.time, now);

      if (!prayerDate) {
        return null;
      }

      return {
        ...prayer,
        prayerDate,
      };
    })
    .filter((prayer): prayer is PrayerTime & { prayerDate: Date } => prayer !== null);

  if (prayerTimes.length === 0) {
    return null;
  }

  const nowTimestamp = now.getTime();

  let nextPrayer = prayerTimes.find(
    (prayer) => prayer.prayerDate.getTime() > nowTimestamp,
  );
  let nextPrayerDate: Date;

  if (nextPrayer) {
    nextPrayerDate = nextPrayer.prayerDate;
  } else {
    nextPrayer = prayerTimes[0];
    nextPrayerDate = new Date(nextPrayer.prayerDate);
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
  }

  let previousPrayer = [...prayerTimes]
    .reverse()
    .find((prayer) => prayer.prayerDate.getTime() <= nowTimestamp);

  if (!previousPrayer) {
    previousPrayer = prayerTimes[prayerTimes.length - 1];
  }

  const diff = nextPrayerDate.getTime() - nowTimestamp;
  const minutes = Math.max(0, Math.ceil(diff / 60000));

  return {
    nextPrayer,
    previousPrayer,
    timeRemaining: `${minutes}m`,
    isWithinFifteenMinutes: diff <= 15 * 60 * 1000,
  };
}

function PrayerPanel({
  label,
  prayer,
  timeRemaining,
  highlight,
}: {
  label: string;
  prayer: PrayerTime;
  timeRemaining?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "relative overflow-hidden border-primary/35 bg-gradient-to-br from-primary/20 via-card to-accent/20 p-5 sm:p-6"
          : "glass-panel border-border/80 p-5 sm:p-6"
      }
    >
      {highlight ? (
        <>
          <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-primary/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 size-36 rounded-full bg-accent/30 blur-2xl" />
        </>
      ) : null}

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <p className="soft-chip">{label}</p>
          {highlight ? (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Sparkles className="size-3.5" />
              <span>Live</span>
            </div>
          ) : (
            <Clock3 className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="font-display text-4xl leading-tight sm:text-5xl">
            {prayer.name}
          </p>
          <p className="text-2xl font-semibold text-foreground/90">
            {formatTo12Hour(prayer.time)}
          </p>
        </div>

        {timeRemaining ? (
          <p className="mt-auto text-sm text-muted-foreground">
            {highlight
              ? `Starts in ${timeRemaining}`
              : `Started before ${timeRemaining}`}
          </p>
        ) : null}

        <Button
          asChild
          className="min-h-9 w-fit rounded-full px-3 py-2 text-sm"
          size="sm"
          variant="outline"
        >
          <Link href={`/adhkars?prayer=${encodeURIComponent(prayer.name)}`}>
            View Adhkars
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function PrayerTimeCard({ timings }: { timings: PrayerTimings }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => window.clearInterval(timer);
  }, []);

  const prayerStatus = useMemo(
    () => getPrayerStatus(currentTime, timings),
    [currentTime, timings],
  );

  if (!prayerStatus) {
    return null;
  }

  const { nextPrayer, previousPrayer, timeRemaining, isWithinFifteenMinutes } =
    prayerStatus;

  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <PrayerPanel
        highlight
        label={isWithinFifteenMinutes ? "Happening Soon" : "Next Prayer"}
        prayer={nextPrayer}
        timeRemaining={timeRemaining}
      />
      <PrayerPanel label="Previous Prayer" prayer={previousPrayer} />
    </div>
  );
}
