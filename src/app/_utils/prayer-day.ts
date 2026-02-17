import { type PrayerTimings } from "@/backend/types";
import { formatTo12Hour, prayerTimeToDate } from "./time";

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export type MakruhWindowId = "sunrise" | "solarNoon" | "sunset";

export type PrayerEvent = {
  name: PrayerName;
  date: Date;
  time24: string;
  time12: string;
};

export type MakruhWindow = {
  id: MakruhWindowId;
  title: string;
  details: string;
  start: Date;
  end: Date;
  startLabel: string;
  endLabel: string;
};

export type PrayerTimelineEntry = {
  id: string;
  kind: "prayer" | "makruh";
  title: string;
  subtitle: string;
  startsAt: Date;
  endsAt?: Date;
  prayerName?: PrayerName;
  isActive: boolean;
  isPast: boolean;
  isNextPrayer: boolean;
};

export type PrayerStatusSnapshot = {
  now: Date;
  nowLabel: string;
  previousPrayer: PrayerEvent;
  nextPrayer: PrayerEvent;
  activeMakruh: MakruhWindow | null;
  upcomingMakruh: MakruhWindow | null;
  makruhWindows: MakruhWindow[];
  timelineEntries: PrayerTimelineEntry[];
};

const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;
const SUNSET_MAKRUH_MINUTES = 15;

const PRAYER_ORDER: readonly PrayerName[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

function formatClockWithoutSeconds(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toPrayerEvents(timings: PrayerTimings, now: Date): PrayerEvent[] {
  return PRAYER_ORDER.map((name) => {
    const time24 = timings[name];
    const parsedDate = prayerTimeToDate(time24, now);

    if (!parsedDate) {
      return null;
    }

    return {
      name,
      date: parsedDate,
      time24,
      time12: formatTo12Hour(time24),
    };
  }).filter((event): event is PrayerEvent => event !== null);
}

export function getMakruhWindows(timings: PrayerTimings, now: Date): MakruhWindow[] {
  const sunrise = prayerTimeToDate(timings.Sunrise, now);
  const dhuhr = prayerTimeToDate(timings.Dhuhr, now);
  const maghrib = prayerTimeToDate(timings.Maghrib, now);

  const windows: MakruhWindow[] = [];

  if (sunrise) {
    const end = addMinutes(sunrise, SUNRISE_MAKRUH_MINUTES);
    windows.push({
      id: "sunrise",
      title: "Makrooh Waqt: Sunrise",
      details: "Avoid voluntary prayers while the sun is rising.",
      start: sunrise,
      end,
      startLabel: formatTo12Hour(timings.Sunrise),
      endLabel: formatClockWithoutSeconds(end),
    });
  }

  if (dhuhr) {
    const start = addMinutes(dhuhr, -SOLAR_NOON_MAKRUH_MINUTES);
    windows.push({
      id: "solarNoon",
      title: "Makrooh Waqt: Solar Noon",
      details: "Avoid voluntary prayers at the sun’s highest point.",
      start,
      end: dhuhr,
      startLabel: formatClockWithoutSeconds(start),
      endLabel: formatTo12Hour(timings.Dhuhr),
    });
  }

  if (maghrib) {
    const start = addMinutes(maghrib, -SUNSET_MAKRUH_MINUTES);
    windows.push({
      id: "sunset",
      title: "Makrooh Waqt: Sunset",
      details: "Avoid voluntary prayers while the sun is setting.",
      start,
      end: maghrib,
      startLabel: formatClockWithoutSeconds(start),
      endLabel: formatTo12Hour(timings.Maghrib),
    });
  }

  return windows.sort((left, right) => left.start.getTime() - right.start.getTime());
}

function resolvePreviousPrayer(prayers: PrayerEvent[], now: Date): PrayerEvent {
  const previous = [...prayers]
    .reverse()
    .find((prayer) => prayer.date.getTime() <= now.getTime());

  if (previous) {
    return previous;
  }

  const fallback = prayers[prayers.length - 1];
  return {
    ...fallback,
    date: addDays(fallback.date, -1),
  };
}

function resolveNextPrayer(prayers: PrayerEvent[], now: Date): PrayerEvent {
  const next = prayers.find((prayer) => prayer.date.getTime() > now.getTime());

  if (next) {
    return next;
  }

  const fallback = prayers[0];
  return {
    ...fallback,
    date: addDays(fallback.date, 1),
  };
}

function resolveUpcomingMakruh(windows: MakruhWindow[], now: Date): MakruhWindow | null {
  const upcoming = windows.find((windowItem) => windowItem.end.getTime() > now.getTime());

  if (upcoming) {
    return upcoming;
  }

  const firstWindow = windows[0];

  if (!firstWindow) {
    return null;
  }

  return {
    ...firstWindow,
    start: addDays(firstWindow.start, 1),
    end: addDays(firstWindow.end, 1),
  };
}

function buildTimelineEntries(
  prayers: PrayerEvent[],
  makruhWindows: MakruhWindow[],
  now: Date,
): PrayerTimelineEntry[] {
  const nextPrayerId = prayers.find((prayer) => prayer.date.getTime() > now.getTime())?.name;
  const entries: PrayerTimelineEntry[] = [];

  for (const prayer of prayers) {
    entries.push({
      id: `prayer-${prayer.name}`,
      kind: "prayer",
      title: prayer.name,
      subtitle: prayer.time12,
      startsAt: prayer.date,
      prayerName: prayer.name,
      isActive: false,
      isPast: prayer.date.getTime() <= now.getTime(),
      isNextPrayer: prayer.name === nextPrayerId,
    });
  }

  for (const windowItem of makruhWindows) {
    entries.push({
      id: `makruh-${windowItem.id}`,
      kind: "makruh",
      title: windowItem.title,
      subtitle: `${windowItem.startLabel} - ${windowItem.endLabel}`,
      startsAt: windowItem.start,
      endsAt: windowItem.end,
      isActive: isBetween(now, windowItem.start, windowItem.end),
      isPast: windowItem.end.getTime() <= now.getTime(),
      isNextPrayer: false,
    });
  }

  return entries.sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
}

export function getPrayerStatusSnapshot(
  timings: PrayerTimings,
  now = new Date(),
): PrayerStatusSnapshot | null {
  const prayers = toPrayerEvents(timings, now);

  if (prayers.length === 0) {
    return null;
  }

  const makruhWindows = getMakruhWindows(timings, now);
  const previousPrayer = resolvePreviousPrayer(prayers, now);
  const nextPrayer = resolveNextPrayer(prayers, now);
  const activeMakruh =
    makruhWindows.find((windowItem) => isBetween(now, windowItem.start, windowItem.end)) ??
    null;
  const upcomingMakruh = resolveUpcomingMakruh(makruhWindows, now);
  const timelineEntries = buildTimelineEntries(prayers, makruhWindows, now);

  return {
    now,
    nowLabel: formatClockWithoutSeconds(now),
    previousPrayer,
    nextPrayer,
    activeMakruh,
    upcomingMakruh,
    makruhWindows,
    timelineEntries,
  };
}
