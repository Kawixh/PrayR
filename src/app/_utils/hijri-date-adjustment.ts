import { type AlAdhanDateInfo } from "@/backend/types";

export const MIN_HIJRI_DATE_ADJUSTMENT = -2;
export const MAX_HIJRI_DATE_ADJUSTMENT = 2;
export const DEFAULT_HIJRI_DATE_ADJUSTMENT = 0;

const DAY_MS = 24 * 60 * 60 * 1000;
const RTL_MARK_REGEX = /[\u200e\u200f]/g;

function cleanText(value: string): string {
  return value.replace(RTL_MARK_REGEX, "").trim();
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return cleanText(parts.find((part) => part.type === type)?.value ?? "");
}

function parseGregorianDate(dateInfo: AlAdhanDateInfo): Date | null {
  const gregorianDate = dateInfo.gregorian.date.trim();
  const match = gregorianDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    if (Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year)) {
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }
  }

  const timestampSeconds = Number(dateInfo.timestamp);

  if (!Number.isFinite(timestampSeconds)) {
    return null;
  }

  return new Date(timestampSeconds * 1000);
}

export function normalizeHijriDateAdjustment(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_HIJRI_DATE_ADJUSTMENT;
  }

  const integerValue = Math.trunc(parsed);

  if (integerValue < MIN_HIJRI_DATE_ADJUSTMENT) {
    return MIN_HIJRI_DATE_ADJUSTMENT;
  }

  if (integerValue > MAX_HIJRI_DATE_ADJUSTMENT) {
    return MAX_HIJRI_DATE_ADJUSTMENT;
  }

  return integerValue;
}

export function applyHijriDateAdjustment(
  dateInfo: AlAdhanDateInfo,
  adjustment: number,
): AlAdhanDateInfo {
  const normalizedAdjustment = normalizeHijriDateAdjustment(adjustment);

  if (normalizedAdjustment === 0) {
    return dateInfo;
  }

  const baseGregorianDate = parseGregorianDate(dateInfo);

  if (!baseGregorianDate) {
    return dateInfo;
  }

  try {
    const adjustedGregorianDate = new Date(
      baseGregorianDate.getTime() + normalizedAdjustment * DAY_MS,
    );

    const numericParts = new Intl.DateTimeFormat("en-u-ca-islamic-nu-latn", {
      day: "numeric",
      month: "numeric",
      weekday: "long",
      year: "numeric",
      timeZone: "UTC",
    }).formatToParts(adjustedGregorianDate);

    const day = getPart(numericParts, "day");
    const monthNumber = Number(getPart(numericParts, "month"));
    const year = getPart(numericParts, "year");
    const weekdayEn = getPart(numericParts, "weekday");

    if (!day || !year || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return dateInfo;
    }

    const monthEn = cleanText(
      new Intl.DateTimeFormat("en-u-ca-islamic", {
        month: "long",
        timeZone: "UTC",
      }).format(adjustedGregorianDate),
    );

    const monthAr = cleanText(
      new Intl.DateTimeFormat("ar-u-ca-islamic", {
        month: "long",
        timeZone: "UTC",
      }).format(adjustedGregorianDate),
    );

    const weekdayAr = cleanText(
      new Intl.DateTimeFormat("ar-u-ca-islamic", {
        weekday: "long",
        timeZone: "UTC",
      }).format(adjustedGregorianDate),
    );

    const dayPadded = String(day).padStart(2, "0");
    const monthPadded = String(monthNumber).padStart(2, "0");

    return {
      ...dateInfo,
      hijri: {
        ...dateInfo.hijri,
        date: `${dayPadded}-${monthPadded}-${year}`,
        day,
        month: {
          ...dateInfo.hijri.month,
          number: monthNumber,
          en: monthEn || dateInfo.hijri.month.en,
          ar: monthAr || dateInfo.hijri.month.ar,
        },
        weekday: {
          en: weekdayEn || dateInfo.hijri.weekday.en,
          ar: weekdayAr || dateInfo.hijri.weekday.ar,
        },
        year,
      },
    };
  } catch {
    return dateInfo;
  }
}
