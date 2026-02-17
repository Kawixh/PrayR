"use client";

import { type AlAdhanDateInfo } from "@/backend/types";
import { Card } from "@/components/ui/card";

type IslamicDateCalendarCardProps = {
  dateInfo: AlAdhanDateInfo;
};

export function IslamicDateCalendarCard({ dateInfo }: IslamicDateCalendarCardProps) {
  const hijriMonth = dateInfo.hijri.month;

  return (
    <Card className="glass-panel border-border/80 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="soft-chip inline-flex">Islamic Date</p>
          <h2 className="mt-3 text-balance font-display text-2xl leading-tight sm:text-3xl">
            {dateInfo.hijri.day} {hijriMonth.en} {dateInfo.hijri.year} AH
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {dateInfo.hijri.weekday.en} • {dateInfo.hijri.weekday.ar}
          </p>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {hijriMonth.ar}
          </p>
        </div>

        <div className="rounded-xl border border-border/75 bg-background/55 px-3 py-2">
          <p className="text-xs text-muted-foreground">Gregorian</p>
          <p className="text-sm font-semibold">{dateInfo.readable}</p>
        </div>
      </div>
    </Card>
  );
}
