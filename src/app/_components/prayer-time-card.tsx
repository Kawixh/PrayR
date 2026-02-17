"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock3, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPrayerStatusSnapshot, type PrayerName } from "../_utils/prayer-day";

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

function formatMinutesBetween(startDate: Date, endDate: Date): string {
  const minutes = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / 60_000));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

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
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
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

export function PrayerTimeCard({ showAdhkarLinks, timings }: PrayerTimeCardProps) {
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

  if (!snapshot) {
    return null;
  }

  const untilNextPrayer = formatMinutesBetween(currentTime, snapshot.nextPrayer.date);
  const sincePreviousPrayer = formatMinutesBetween(snapshot.previousPrayer.date, currentTime);
  const upcomingMakruhBeforeNextPrayer =
    snapshot.upcomingMakruh &&
    snapshot.upcomingMakruh.start.getTime() > currentTime.getTime() &&
    snapshot.upcomingMakruh.start.getTime() <= snapshot.nextPrayer.date.getTime()
      ? snapshot.upcomingMakruh
      : null;

  return (
    <section className="space-y-4">
      <div className="grid w-full gap-4 lg:grid-cols-2">
        {snapshot.activeMakruh ? (
          <PrayerPanel
            description={`${snapshot.activeMakruh.startLabel} - ${snapshot.activeMakruh.endLabel}. Ends in ${formatMinutesBetween(currentTime, snapshot.activeMakruh.end)}. Next prayer ${snapshot.nextPrayer.name} at ${snapshot.nextPrayer.time12}.`}
            headline="Makrooh Waqt"
            title="Current State"
            tone="makruh"
            showAdhkarLink={false}
          />
        ) : upcomingMakruhBeforeNextPrayer ? (
          <PrayerPanel
            description={`${upcomingMakruhBeforeNextPrayer.startLabel} - ${upcomingMakruhBeforeNextPrayer.endLabel}. Starts in ${formatMinutesBetween(currentTime, upcomingMakruhBeforeNextPrayer.start)}. Next prayer ${snapshot.nextPrayer.name} at ${snapshot.nextPrayer.time12}.`}
            headline={upcomingMakruhBeforeNextPrayer.title.replace("Makrooh Waqt: ", "")}
            title="Next Event"
            tone="makruh"
            showAdhkarLink={false}
          />
        ) : (
          <PrayerPanel
            description={`${snapshot.nextPrayer.time12} • starts in ${untilNextPrayer}`}
            headline={snapshot.nextPrayer.name}
            highlight
            prayerName={snapshot.nextPrayer.name}
            showAdhkarLink={showAdhkarLinks}
            title="Next Event"
          />
        )}

        <PrayerPanel
          description={`${snapshot.previousPrayer.time12} • started ${sincePreviousPrayer} ago`}
          headline={snapshot.previousPrayer.name}
          prayerName={snapshot.previousPrayer.name}
          showAdhkarLink={showAdhkarLinks}
          title="Previous Prayer"
        />
      </div>
    </section>
  );
}
