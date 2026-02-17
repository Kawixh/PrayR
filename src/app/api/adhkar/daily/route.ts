import {
  AdhkarCategory,
  getAdhkarCategories,
  getAdhkarChapter,
  getAdhkarSourceUrl,
  getRecommendedCategoryIdsForPrayer,
  getSeedFromDayKey,
  pickBySeed,
} from "@/backend/adhkar";
import { getRequestFeatureFlags } from "@/features/request";
import { isAdhkarLanguage, PRAYER_WITH_ADHKAR, PrayerWithAdhkar } from "@/lib/adhkar";
import { NextRequest, NextResponse } from "next/server";

function isPrayerWithAdhkar(value: string | null): value is PrayerWithAdhkar {
  return value !== null && PRAYER_WITH_ADHKAR.includes(value as PrayerWithAdhkar);
}

function selectCategoryPool(
  categories: AdhkarCategory[],
  prayer: PrayerWithAdhkar | null,
): AdhkarCategory[] {
  if (!prayer) {
    return categories;
  }

  const suggestedIds = getRecommendedCategoryIdsForPrayer(prayer, categories);
  const idSet = new Set(suggestedIds);
  const filtered = categories.filter((category) => idSet.has(category.id));

  return filtered.length > 0 ? filtered : categories;
}

export async function GET(request: NextRequest) {
  const featureFlags = getRequestFeatureFlags(request);

  if (!featureFlags.adhkars || !featureFlags.adhkarOfTheDay) {
    return NextResponse.json({ error: "Daily adhkar feature is disabled." }, { status: 404 });
  }

  const languageQuery = request.nextUrl.searchParams.get("language");
  const dayKey = request.nextUrl.searchParams.get("dayKey");
  const prayerQuery = request.nextUrl.searchParams.get("prayer");
  const language = isAdhkarLanguage(languageQuery) ? languageQuery : "en";
  const prayer = isPrayerWithAdhkar(prayerQuery) ? prayerQuery : null;

  if (!dayKey) {
    return NextResponse.json({ error: "dayKey is required." }, { status: 400 });
  }

  try {
    const categories = await getAdhkarCategories();
    const categoryPool = selectCategoryPool(categories, prayer);
    const seed = getSeedFromDayKey(dayKey);
    const categoryPick = pickBySeed(categoryPool, seed);

    if (!categoryPick) {
      return NextResponse.json(
        { error: "No adhkar categories available for daily selection." },
        { status: 404 },
      );
    }

    const chapter = await getAdhkarChapter(categoryPick.item.id, language);
    const itemPick = pickBySeed(chapter.items, seed, chapter.id);

    if (!itemPick) {
      return NextResponse.json(
        { error: "No adhkar entries available in selected chapter." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      dayKey,
      prayer,
      language,
      category: {
        id: categoryPick.item.id,
        title: categoryPick.item.title,
        titleAr: categoryPick.item.titleAr,
      },
      adhkar: itemPick.item,
      source: {
        name: "Hisn Muslim JSON API",
        categoriesUrl: getAdhkarSourceUrl(),
        chapterUrl: chapter.sourceUrl,
      },
    });
  } catch (error) {
    console.error("Failed to fetch daily adhkar:", error);

    return NextResponse.json(
      { error: "Failed to fetch daily adhkar." },
      { status: 500 },
    );
  }
}
