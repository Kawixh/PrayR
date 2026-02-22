import { type PrayerTimings } from "@/backend/types";
import { prayerTimeToDate } from "./time";

export type FastingTopBannerState = "hidden" | "iftar" | "sehar";

const NIGHT_SEHAR_START_HOUR = 22;
const WINDOW_BUFFER_MINUTES = 30;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function setHour(date: Date, hour: number): Date {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

export function getFastingTopBannerState(
  timings: PrayerTimings,
  now = new Date(),
): FastingTopBannerState {
  const fajr = prayerTimeToDate(timings.Fajr, now);
  const dhuhr = prayerTimeToDate(timings.Dhuhr, now);
  const maghrib = prayerTimeToDate(timings.Maghrib, now);

  if (!fajr || !dhuhr || !maghrib) {
    return "hidden";
  }

  const seharCutoff = addMinutes(fajr, WINDOW_BUFFER_MINUTES);
  const iftarStart = addMinutes(dhuhr, WINDOW_BUFFER_MINUTES);
  const iftarCutoff = addMinutes(maghrib, WINDOW_BUFFER_MINUTES);
  const lateNightStart = setHour(now, NIGHT_SEHAR_START_HOUR);

  if (now < seharCutoff || now >= lateNightStart) {
    return "sehar";
  }

  if (now >= iftarStart && now < iftarCutoff) {
    return "iftar";
  }

  return "hidden";
}
