const PRAYER_METHOD_IDS = [
  0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
] as const;

const PRAYER_SCHOOL_IDS = [0, 1] as const;

const SUPPORTED_PRAYER_METHODS = new Set<number>(PRAYER_METHOD_IDS);
const SUPPORTED_PRAYER_SCHOOLS = new Set<number>(PRAYER_SCHOOL_IDS);

const COUNTRY_TO_PRAYER_METHOD: Record<string, PrayerMethodId> = {
  AE: 8,
  AF: 1,
  BD: 1,
  BH: 8,
  CA: 2,
  DZ: 19,
  EG: 5,
  FR: 12,
  ID: 20,
  IN: 1,
  IR: 7,
  JO: 23,
  KW: 9,
  LK: 1,
  MA: 21,
  MY: 17,
  NP: 1,
  OM: 8,
  PK: 1,
  PT: 22,
  QA: 10,
  RU: 14,
  SA: 4,
  SG: 11,
  TN: 18,
  TR: 13,
  US: 2,
  YE: 8,
};

export type PrayerMethodId = (typeof PRAYER_METHOD_IDS)[number];
export type PrayerSchoolId = (typeof PRAYER_SCHOOL_IDS)[number];

export const DEFAULT_PRAYER_METHOD: PrayerMethodId = 2;
export const DEFAULT_PRAYER_SCHOOL: PrayerSchoolId = 0;

function parseIntegerLike(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || !/^-?\d+$/.test(trimmedValue)) {
    return null;
  }

  return Number(trimmedValue);
}

function normalizeCountryCode(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmedValue) ? trimmedValue : "";
}

export function parsePrayerMethod(value: unknown): PrayerMethodId | null {
  const parsedValue = parseIntegerLike(value);

  if (parsedValue === null || !SUPPORTED_PRAYER_METHODS.has(parsedValue)) {
    return null;
  }

  return parsedValue as PrayerMethodId;
}

export function parsePrayerSchool(value: unknown): PrayerSchoolId | null {
  const parsedValue = parseIntegerLike(value);

  if (parsedValue === null || !SUPPORTED_PRAYER_SCHOOLS.has(parsedValue)) {
    return null;
  }

  return parsedValue as PrayerSchoolId;
}

export function resolvePrayerMethodByCountryCode(
  countryCode: string | null | undefined,
): PrayerMethodId {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  if (!normalizedCountryCode) {
    return DEFAULT_PRAYER_METHOD;
  }

  return COUNTRY_TO_PRAYER_METHOD[normalizedCountryCode] ?? DEFAULT_PRAYER_METHOD;
}
