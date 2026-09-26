"use client";

import { type AlAdhanDateInfo } from "@/backend/types";
import { CalendarDays } from "lucide-react";

type IslamicDateCalendarCardProps = {
  dateInfo: AlAdhanDateInfo;
};

export function IslamicDateCalendarCard({ dateInfo }: IslamicDateCalendarCardProps) {
  const hijriMonth = dateInfo.hijri.month;

  return (
    <section
      aria-label="Islamic date"
      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <CalendarDays aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">
          {dateInfo.hijri.weekday.en}
        </p>
        <p className="font-medium">
          {dateInfo.hijri.day} {hijriMonth.en} {dateInfo.hijri.year} AH
        </p>
      </div>
      <p className="text-right text-sm text-muted-foreground" dir="rtl" lang="ar">
        {hijriMonth.ar}
      </p>
    </section>
  );
}
