export const ADHKAR_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
] as const;

export type AdhkarLanguage = (typeof ADHKAR_LANGUAGE_OPTIONS)[number]["value"];

export const ADHKAR_LANGUAGE_STORAGE_KEY = "adhkarLanguagePreference";

export const PRAYER_WITH_ADHKAR = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

export type PrayerWithAdhkar = (typeof PRAYER_WITH_ADHKAR)[number];

export function isAdhkarLanguage(
  value: string | null | undefined,
): value is AdhkarLanguage {
  return value === "en" || value === "ar";
}

export function getDaySeedFromKey(dayKey: string): number | null {
  const match = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

