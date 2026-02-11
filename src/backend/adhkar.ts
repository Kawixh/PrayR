import { AdhkarLanguage, getDaySeedFromKey, PrayerWithAdhkar } from "@/lib/adhkar";

const HISN_MUSLIM_API_BASE = "https://www.hisnmuslim.com/api";
const ADHKAR_SOURCE_URL = `${HISN_MUSLIM_API_BASE}/husn.json`;
const ADHKAR_CATEGORY_FALLBACK_URLS = [
  `${HISN_MUSLIM_API_BASE}/ar/husn_ar.json`,
  `${HISN_MUSLIM_API_BASE}/en/husn_en.json`,
];

type RecordValue = Record<string, unknown>;

export type AdhkarCategory = {
  id: number;
  title: string;
  titleAr: string;
};

export type AdhkarItem = {
  id: string;
  arabicText: string;
  translatedText: string;
  repeat: string | null;
  source: string | null;
  audioUrl: string | null;
};

export type AdhkarChapter = {
  id: number;
  title: string;
  titleAr: string;
  language: AdhkarLanguage;
  items: AdhkarItem[];
  sourceUrl: string;
};

function asRecord(value: unknown): RecordValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as RecordValue;
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.trim());

  return Number.isNaN(parsed) ? null : parsed;
}

function pickString(record: RecordValue, keys: string[]): string | null {
  for (const key of keys) {
    const value = getString(record[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function pickNumber(record: RecordValue, keys: string[]): number | null {
  for (const key of keys) {
    const value = getNumber(record[key]);

    if (value !== null) {
      return value;
    }
  }

  return null;
}

function pickValue(record: RecordValue, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function extractArrayPayload(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) {
    return raw;
  }

  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const preferredArrayKeys = [
    "data",
    "Data",
    "items",
    "Items",
    "result",
    "results",
    "categories",
    "chapters",
    "rows",
    "Rows",
    "TEXT",
    "text",
    "list",
    "records",
  ];

  for (const key of preferredArrayKeys) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  for (const value of Object.values(record)) {
    const nestedRecord = asRecord(value);

    if (!nestedRecord) {
      continue;
    }

    for (const nestedValue of Object.values(nestedRecord)) {
      if (Array.isArray(nestedValue)) {
        return nestedValue;
      }
    }
  }

  return null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: {
      revalidate: 43_200,
    },
  });

  if (!response.ok) {
    throw new Error(`Adhkar API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function parseCategory(raw: unknown): AdhkarCategory | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const id = pickNumber(record, ["ID", "id", "category_id", "categoryId"]);

  if (id === null || Number.isNaN(id) || id <= 0) {
    return null;
  }

  const titleAr =
    pickString(record, [
      "TITLE_AR",
      "title_ar",
      "titleAr",
      "AR_TITLE",
      "arabic_title",
      "TITLE",
      "title",
    ]) ?? `Chapter ${id}`;
  const title =
    pickString(record, [
      "TITLE",
      "title",
      "TITLE_EN",
      "title_en",
      "titleEn",
      "EN_TITLE",
      "english_title",
      "TITLE_AR",
      "title_ar",
    ]) ?? titleAr;

  return {
    id,
    title,
    titleAr,
  };
}

function parseItem(raw: unknown): AdhkarItem | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const arabicText = pickString(record, [
    "ARABIC_TEXT",
    "arabic_text",
    "TEXT_AR",
    "text_ar",
    "TEXT",
    "text",
    "TITLE",
    "title",
  ]);

  if (!arabicText) {
    return null;
  }

  const translatedText =
    pickString(record, [
      "LANGUAGE_ARABIC_TRANSLATED_TEXT",
      "language_arabic_translated_text",
      "TRANSLATION",
      "translation",
      "TRANSLATED_TEXT",
      "translated_text",
      "ENGLISH_TRANSLATION",
      "english_translation",
    ]) ?? "";

  return {
    id: pickString(record, ["ID", "id"]) ?? arabicText.slice(0, 40),
    arabicText,
    translatedText,
    repeat: pickString(record, ["REPEAT", "repeat", "COUNT", "count"]),
    source: pickString(record, [
      "SOURCE",
      "source",
      "FOOTNOTE",
      "footnote",
      "REFERENCE",
      "reference",
    ]),
    audioUrl: pickString(record, ["AUDIO", "audio", "AUDIO_URL", "audio_url"]),
  };
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchingCategoryIds(
  categories: AdhkarCategory[],
  keywords: string[],
): number[] {
  if (keywords.length === 0) {
    return [];
  }

  const normalizedKeywords = keywords.map((keyword) => normalizeForMatch(keyword));

  return categories
    .filter((category) => {
      const searchSpace = normalizeForMatch(`${category.title} ${category.titleAr}`);

      return normalizedKeywords.some((keyword) => searchSpace.includes(keyword));
    })
    .map((category) => category.id);
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

export async function getAdhkarCategories(): Promise<AdhkarCategory[]> {
  const raw = await fetchJson<unknown>(ADHKAR_SOURCE_URL);
  const primaryEntries = extractArrayPayload(raw);

  if (primaryEntries) {
    return primaryEntries
      .map(parseCategory)
      .filter((category): category is AdhkarCategory => category !== null)
      .sort((left, right) => left.id - right.id);
  }

  for (const fallbackUrl of ADHKAR_CATEGORY_FALLBACK_URLS) {
    try {
      const fallbackRaw = await fetchJson<unknown>(fallbackUrl);
      const fallbackEntries = extractArrayPayload(fallbackRaw);

      if (!fallbackEntries) {
        continue;
      }

      return fallbackEntries
        .map(parseCategory)
        .filter((category): category is AdhkarCategory => category !== null)
        .sort((left, right) => left.id - right.id);
    } catch {
      continue;
    }
  }

  throw new Error("Unexpected adhkar categories response");
}

export async function getAdhkarChapter(
  categoryId: number,
  language: AdhkarLanguage,
): Promise<AdhkarChapter> {
  const chapterUrl = `${HISN_MUSLIM_API_BASE}/${language}/${categoryId}.json`;
  const raw = await fetchJson<unknown>(chapterUrl);
  const record = asRecord(raw) ?? (Array.isArray(raw) ? ({ TEXT: raw } as RecordValue) : null);

  if (!record) {
    throw new Error("Unexpected adhkar chapter response");
  }

  const itemsRaw =
    extractArrayPayload(
      pickValue(record, [
        "TEXT",
        "text",
        "items",
        "Items",
        "data",
        "Data",
        "result",
        "results",
      ]) ?? record,
    ) ?? [];
  const items = itemsRaw
    .map(parseItem)
    .filter((item): item is AdhkarItem => item !== null);

  return {
    id: categoryId,
    title: pickString(record, ["TITLE_EN", "TITLE", "TITLE_AR"]) ?? `Chapter ${categoryId}`,
    titleAr: pickString(record, ["TITLE_AR", "TITLE", "TITLE_EN"]) ?? `الفصل ${categoryId}`,
    language,
    items,
    sourceUrl: chapterUrl,
  };
}

export function getRecommendedCategoryIdsForPrayer(
  prayer: PrayerWithAdhkar,
  categories: AdhkarCategory[],
): number[] {
  const adhanKeywords = ["adhan", "azan", "الأذان", "الاذان", "الآذان"];
  const afterPrayerKeywords = [
    "after prayer",
    "after the prayer",
    "after salah",
    "after salaam",
    "بعد السلام من الصلاة",
    "بعد الصلاة",
    "اذكار الصلاة",
  ];

  const prayerSpecificKeywords: Record<PrayerWithAdhkar, string[]> = {
    Fajr: ["morning", "الصباح"],
    Sunrise: ["morning", "الصباح"],
    Dhuhr: [],
    Asr: [],
    Maghrib: ["evening", "المساء"],
    Isha: ["sleep", "النوم", "night", "الليل", "evening", "المساء"],
  };

  const specificMatches = getMatchingCategoryIds(
    categories,
    prayerSpecificKeywords[prayer],
  );
  const adhanMatches = getMatchingCategoryIds(categories, adhanKeywords);
  const afterPrayerMatches = getMatchingCategoryIds(categories, afterPrayerKeywords);

  const merged = uniqueIds([...specificMatches, ...adhanMatches, ...afterPrayerMatches]);

  if (merged.length > 0) {
    return merged.slice(0, 8);
  }

  return categories.slice(0, 5).map((category) => category.id);
}

export function getSeedFromDayKey(dayKey: string): number {
  return getDaySeedFromKey(dayKey) ?? Math.floor(Date.now() / 86_400_000);
}

export function pickBySeed<T>(
  items: T[],
  seed: number,
  salt = 0,
): { item: T; index: number } | null {
  if (items.length === 0) {
    return null;
  }

  const index = Math.abs(seed + salt) % items.length;

  return {
    item: items[index],
    index,
  };
}

export function getAdhkarSourceUrl(): string {
  return ADHKAR_SOURCE_URL;
}
