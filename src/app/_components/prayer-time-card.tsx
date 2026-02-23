"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock3, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentPrayerName,
  getMakruhWindows,
  type PrayerName,
} from "../_utils/prayer-day";
import { formatTo12Hour, prayerTimeToDate } from "../_utils/time";

type PrayerTimeCardProps = {
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

type PrayerRowProps = {
  title: string;
  headline: string;
  description: string;
  highlight?: boolean;
  prayerName?: PrayerName;
  showAdhkarLink: boolean;
  tone?: "default" | "makruh";
};

const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;

type DayWindow = {
  end: Date;
  start: Date;
};

function PrayerRow({
  description,
  headline,
  prayerName,
  showAdhkarLink,
  title,
  tone = "default",
  highlight = false,
}: PrayerRowProps) {
  const statusLabel =
    tone === "makruh" ? "Makruh Window" : highlight ? "Current Prayer" : "Scheduled";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:px-5",
        highlight
          ? "bg-primary/8"
          : tone === "makruh"
            ? "bg-amber-500/8"
            : "bg-transparent",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {title}
          </p>
          <p className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
            {headline}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {tone === "makruh" ? (
            <TriangleAlert className="size-3.5 text-amber-700 dark:text-amber-300" />
          ) : highlight ? (
            <Sparkles className="size-3.5 text-primary" />
          ) : (
            <Clock3 className="size-3.5" />
          )}
          <span>{statusLabel}</span>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>

      {showAdhkarLink && prayerName ? (
        <div className="pt-1">
          <Button asChild className="min-h-9 rounded-full px-3 py-2 text-sm" size="sm" variant="outline">
            <Link href={`/adhkars?prayer=${encodeURIComponent(prayerName)}`}>
              View Adhkars
            </Link>
          </Button>
        </div>
      ) : null}
    </li>
  );
}

export function PrayerTimeCard({
  showAdhkarLinks,
  timings,
}: PrayerTimeCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const currentPrayer = useMemo(
    () => getCurrentPrayerName(timings, currentTime),
    [currentTime, timings],
  );

  const windows = useMemo(() => {
    const fajr = prayerTimeToDate(timings.Fajr, currentTime);
    const sunrise = prayerTimeToDate(timings.Sunrise, currentTime);
    const dhuhr = prayerTimeToDate(timings.Dhuhr, currentTime);
    const asr = prayerTimeToDate(timings.Asr, currentTime);
    const maghrib = prayerTimeToDate(timings.Maghrib, currentTime);
    const isha = prayerTimeToDate(timings.Isha, currentTime);

    if (!fajr || !sunrise || !dhuhr || !asr || !maghrib || !isha) {
      return null;
    }

    const sunriseMakruhEnd = new Date(
      sunrise.getTime() + SUNRISE_MAKRUH_MINUTES * 60_000,
    );
    const solarNoonStart = new Date(
      dhuhr.getTime() - SOLAR_NOON_MAKRUH_MINUTES * 60_000,
    );

    const sunriseMakruh: DayWindow = {
      start: sunrise,
      end: sunriseMakruhEnd,
    };
    const duhaWindow: DayWindow = {
      start: sunriseMakruhEnd,
      end: solarNoonStart,
    };
    const beforeDhuhrMakruh: DayWindow = {
      start: solarNoonStart,
      end: dhuhr,
    };

    const makruhWindows = getMakruhWindows(timings, currentTime);
    const beforeMaghribMakruh = makruhWindows.find(
      (windowItem) => windowItem.id === "sunset",
    );

    if (!beforeMaghribMakruh) {
      return null;
    }

    return {
      asr,
      beforeDhuhrMakruh,
      beforeMaghribMakruh: {
        start: beforeMaghribMakruh.start,
        end: beforeMaghribMakruh.end,
      },
      dhuhr,
      duhaWindow,
      fajr,
      isha,
      maghrib,
      sunrise,
      sunriseMakruh,
    };
  }, [currentTime, timings]);

  if (!windows) {
    return null;
  }

  const formatWindow = (windowItem: DayWindow) =>
    `${new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(windowItem.start)} - ${new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(windowItem.end)}`;

  const isWindowActive = (windowItem: DayWindow) =>
    currentTime.getTime() >= windowItem.start.getTime() &&
    currentTime.getTime() < windowItem.end.getTime();

  return (
    <section className="space-y-4">
      <Card className="glass-panel overflow-hidden rounded-3xl border-border/80 p-0">
        <header className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">Today&apos;s Schedule</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Prayer times and Makruh windows in chronological order.
            </p>
          </div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Local Time
          </p>
        </header>

        <ul className="divide-y divide-border/75">
          <PrayerRow
            description="Fajr starts here. Sehar cutoff aligns with Fajr."
            headline={formatTo12Hour(timings.Fajr)}
            highlight={currentPrayer === "Fajr"}
            prayerName="Fajr"
            showAdhkarLink={showAdhkarLinks}
            title="Fajr / Sehar"
          />

          <PrayerRow
            description="Sunrise Makruh window starts at sunrise and lasts for 15 minutes."
            headline={formatWindow(windows.sunriseMakruh)}
            highlight={isWindowActive(windows.sunriseMakruh)}
            showAdhkarLink={false}
            title="Makruh Waqt"
            tone="makruh"
          />

          <PrayerRow
            description="Duha prayer window after sunrise Makruh until before Dhuhr Makruh."
            headline={formatWindow(windows.duhaWindow)}
            highlight={isWindowActive(windows.duhaWindow)}
            showAdhkarLink={false}
            title="Duha Window"
          />

          <PrayerRow
            description="Avoid voluntary prayers shortly before Dhuhr."
            headline={formatWindow(windows.beforeDhuhrMakruh)}
            highlight={isWindowActive(windows.beforeDhuhrMakruh)}
            showAdhkarLink={false}
            title="Makruh Before Dhuhr"
            tone="makruh"
          />

          <PrayerRow
            description="Dhuhr obligatory prayer starts at this time."
            headline={formatTo12Hour(timings.Dhuhr)}
            highlight={currentPrayer === "Dhuhr"}
            prayerName="Dhuhr"
            showAdhkarLink={showAdhkarLinks}
            title="Dhuhr"
          />

          <PrayerRow
            description="Asr obligatory prayer starts at this time."
            headline={formatTo12Hour(timings.Asr)}
            highlight={currentPrayer === "Asr"}
            prayerName="Asr"
            showAdhkarLink={showAdhkarLinks}
            title="Asr"
          />

          <PrayerRow
            description="Final minutes before Maghrib are Makruh for voluntary prayer."
            headline={formatWindow(windows.beforeMaghribMakruh)}
            highlight={isWindowActive(windows.beforeMaghribMakruh)}
            showAdhkarLink={false}
            title="Makruh Waqt"
            tone="makruh"
          />

          <PrayerRow
            description="Maghrib starts and Iftar time begins."
            headline={formatTo12Hour(timings.Maghrib)}
            highlight={currentPrayer === "Maghrib"}
            prayerName="Maghrib"
            showAdhkarLink={showAdhkarLinks}
            title="Maghrib / Iftar"
          />

          <PrayerRow
            description="Isha obligatory prayer starts at this time."
            headline={formatTo12Hour(timings.Isha)}
            highlight={currentPrayer === "Isha"}
            prayerName="Isha"
            showAdhkarLink={showAdhkarLinks}
            title="Isha"
          />
        </ul>
      </Card>
    </section>
  );
}
