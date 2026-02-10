export function parseTime24(time: string): { hours: number; minutes: number } | null {
  const match = time.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

export function formatTo12Hour(time: string): string {
  const parsed = parseTime24(time);

  if (!parsed) {
    return time;
  }

  const period = parsed.hours >= 12 ? "PM" : "AM";
  const hours12 = parsed.hours % 12 || 12;

  return `${hours12}:${String(parsed.minutes).padStart(2, "0")} ${period}`;
}

export function prayerTimeToDate(time: string, baseDate = new Date()): Date | null {
  const parsed = parseTime24(time);

  if (!parsed) {
    return null;
  }

  const date = new Date(baseDate);
  date.setHours(parsed.hours, parsed.minutes, 0, 0);

  return date;
}

export function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
