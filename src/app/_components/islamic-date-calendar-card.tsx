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
      <div className="min-w-0">
        <p className="soft-chip inline-flex">Islamic Date</p>
        <h2 className="mt-3 text-balance font-display text-2xl leading-tight sm:text-3xl">
          {dateInfo.hijri.day} {hijriMonth.en} {dateInfo.hijri.year} AH
        </h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {dateInfo.hijri.weekday.en} • {dateInfo.hijri.weekday.ar}
        </p>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{hijriMonth.ar}</p>
      </div>
    </Card>
  );
}
