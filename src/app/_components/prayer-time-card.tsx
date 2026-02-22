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

type PrayerPanelProps = {
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

function PrayerPanel({
  description,
  headline,
  prayerName,
  showAdhkarLink,
  title,
  tone = "default",
  highlight = false,
}: PrayerPanelProps) {
  return (
    <Card
      className={
        highlight
          ? "relative overflow-hidden border-primary/35 bg-gradient-to-br from-primary/20 via-card to-accent/20 p-5 sm:p-6"
          : tone === "makruh"
            ? "border-amber-500/35 bg-amber-500/10 p-5 sm:p-6"
            : "glass-panel border-border/80 p-5 sm:p-6"
      }
    >
      {highlight ? (
        <>
          <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-primary/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 size-36 rounded-full bg-accent/30 blur-2xl" />
        </>
      ) : null}

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="soft-chip">{title}</p>
          {tone === "makruh" ? (
            <TriangleAlert className="size-4 text-amber-700 dark:text-amber-300" />
          ) : highlight ? (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Sparkles className="size-3.5" />
              <span>Live</span>
            </div>
          ) : (
            <Clock3 className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-balance font-display text-3xl leading-tight sm:text-4xl">
            {headline}
          </p>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {showAdhkarLink && prayerName ? (
          <Button
            asChild
            className={cn(
              "mt-auto min-h-9 w-fit rounded-full px-3 py-2 text-sm",
              tone === "makruh"
                ? "border-amber-500/45 bg-amber-500/15 hover:bg-amber-500/20"
                : undefined,
            )}
            size="sm"
            variant="outline"
          >
            <Link href={`/adhkars?prayer=${encodeURIComponent(prayerName)}`}>
              View Adhkars
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
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
      <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PrayerPanel
          description="Fajr starts here. Sehar cutoff aligns with Fajr."
          headline={formatTo12Hour(timings.Fajr)}
          highlight={currentPrayer === "Fajr"}
          prayerName="Fajr"
          showAdhkarLink={showAdhkarLinks}
          title="Fajr / Sehar"
        />

        <PrayerPanel
          description="Sunrise Makruh window starts at sunrise and lasts for 15 minutes."
          headline={formatWindow(windows.sunriseMakruh)}
          highlight={isWindowActive(windows.sunriseMakruh)}
          showAdhkarLink={false}
          title="Makruh Waqt"
          tone="makruh"
        />

        <PrayerPanel
          description="Duha prayer window after sunrise Makruh until before Dhuhr Makruh."
          headline={formatWindow(windows.duhaWindow)}
          highlight={isWindowActive(windows.duhaWindow)}
          showAdhkarLink={false}
          title="Duha Window"
        />

        <PrayerPanel
          description="Avoid voluntary prayers shortly before Dhuhr."
          headline={formatWindow(windows.beforeDhuhrMakruh)}
          highlight={isWindowActive(windows.beforeDhuhrMakruh)}
          showAdhkarLink={false}
          title="Makruh Before Dhuhr"
          tone="makruh"
        />

        <PrayerPanel
          description="Dhuhr obligatory prayer starts at this time."
          headline={formatTo12Hour(timings.Dhuhr)}
          highlight={currentPrayer === "Dhuhr"}
          prayerName="Dhuhr"
          showAdhkarLink={showAdhkarLinks}
          title="Dhuhr"
        />

        <PrayerPanel
          description="Asr obligatory prayer starts at this time."
          headline={formatTo12Hour(timings.Asr)}
          highlight={currentPrayer === "Asr"}
          prayerName="Asr"
          showAdhkarLink={showAdhkarLinks}
          title="Asr"
        />

        <PrayerPanel
          description="Final minutes before Maghrib are Makruh for voluntary prayer."
          headline={formatWindow(windows.beforeMaghribMakruh)}
          highlight={isWindowActive(windows.beforeMaghribMakruh)}
          showAdhkarLink={false}
          title="Makruh Waqt"
          tone="makruh"
        />

        <PrayerPanel
          description="Maghrib starts and Iftar time begins."
          headline={formatTo12Hour(timings.Maghrib)}
          highlight={currentPrayer === "Maghrib"}
          prayerName="Maghrib"
          showAdhkarLink={showAdhkarLinks}
          title="Maghrib / Iftar"
        />

        <PrayerPanel
          description="Isha obligatory prayer starts at this time."
          headline={formatTo12Hour(timings.Isha)}
          highlight={currentPrayer === "Isha"}
          prayerName="Isha"
          showAdhkarLink={showAdhkarLinks}
          title="Isha"
        />
      </div>
    </section>
  );
}
