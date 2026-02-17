"use client";

import { type AlAdhanDateInfo } from "@/backend/types";
import { Card } from "@/components/ui/card";

type IslamicDateCalendarCardProps = {
  dateInfo: AlAdhanDateInfo;
};

type CalendarCell = {
  day: number;
  isToday: boolean;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function parseHijriDay(dayValue: string): number {
  const parsed = Number(dayValue);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

function parseHijriMonthDays(daysValue: number): number {
  if (!Number.isFinite(daysValue) || daysValue < 29 || daysValue > 30) {
    return 30;
  }

  return Math.floor(daysValue);
}

function resolveWeekdayIndex(dateInfo: AlAdhanDateInfo): number {
  const unixTimestamp = Number(dateInfo.timestamp);

  if (!Number.isNaN(unixTimestamp)) {
    return new Date(unixTimestamp * 1000).getDay();
  }

  return new Date().getDay();
}

function buildHijriMonthGrid(dateInfo: AlAdhanDateInfo): CalendarCell[] {
  const hijriDay = parseHijriDay(dateInfo.hijri.day);
  const monthDays = parseHijriMonthDays(dateInfo.hijri.month.days);
  const weekdayIndex = resolveWeekdayIndex(dateInfo);
  const firstWeekdayIndex = (weekdayIndex - ((hijriDay - 1) % 7) + 7) % 7;

  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstWeekdayIndex; index += 1) {
    cells.push({ day: 0, isToday: false });
  }

  for (let day = 1; day <= monthDays; day += 1) {
    cells.push({
      day,
      isToday: day === hijriDay,
    });
  }

  return cells;
}

export function IslamicDateCalendarCard({ dateInfo }: IslamicDateCalendarCardProps) {
  const monthCells = buildHijriMonthGrid(dateInfo);
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
            {hijriMonth.ar} • {dateInfo.gregorian.date}
          </p>
        </div>

        <div className="rounded-xl border border-border/75 bg-background/55 px-3 py-2">
          <p className="text-xs text-muted-foreground">Gregorian</p>
          <p className="text-sm font-semibold">{dateInfo.readable}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
          {WEEKDAY_LABELS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {monthCells.map((cell, index) =>
            cell.day === 0 ? (
              <span className="h-9 rounded-md" key={`empty-${index}`} />
            ) : (
              <span
                className={
                  cell.isToday
                    ? "flex h-9 items-center justify-center rounded-md border border-primary/35 bg-primary/15 text-sm font-semibold text-foreground"
                    : "flex h-9 items-center justify-center rounded-md border border-border/70 bg-background/55 text-sm text-foreground/90"
                }
                key={`day-${cell.day}`}
              >
                {cell.day}
              </span>
            ),
          )}
        </div>
      </div>
    </Card>
  );
}
