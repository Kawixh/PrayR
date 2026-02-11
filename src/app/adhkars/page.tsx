import {
  getAdhkarCategories,
  getAdhkarSourceUrl,
  getRecommendedCategoryIdsForPrayer,
} from "@/backend/adhkar";
import { PRAYER_WITH_ADHKAR, PrayerWithAdhkar } from "@/lib/adhkar";
import type { Metadata } from "next";
import { AdhkarBrowser } from "./_components/adhkar-browser";

type SearchParams = {
  prayer?: string | string[];
  category?: string | string[];
};

type AdhkarsPageProps = {
  searchParams: Promise<SearchParams>;
};

function readFirstValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return null;
}

function parsePrayer(value: string | null): PrayerWithAdhkar | null {
  if (!value) {
    return null;
  }

  const prayer = PRAYER_WITH_ADHKAR.find((candidate) => candidate === value);

  return prayer ?? null;
}

function parseCategoryId(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export const metadata: Metadata = {
  title: "Adhkars Library",
  description:
    "Read daily adhkar with source-preserved Arabic text and source-provided translation wording.",
  alternates: {
    canonical: "/adhkars",
  },
  openGraph: {
    type: "website",
    siteName: "PrayR",
    title: "Adhkars Library",
    description:
      "Read daily adhkar with source-preserved Arabic text and source-provided translation wording.",
    url: "/adhkars",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PrayR daily prayer times app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adhkars Library",
    description:
      "Read daily adhkar with source-preserved Arabic text and source-provided translation wording.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AdhkarsPage({ searchParams }: AdhkarsPageProps) {
  const resolvedParams = await searchParams;
  const requestedPrayer = parsePrayer(readFirstValue(resolvedParams.prayer));
  const requestedCategoryId = parseCategoryId(readFirstValue(resolvedParams.category));

  const categories = await getAdhkarCategories().catch((error) => {
    console.error("Failed to fetch adhkar categories for /adhkars:", error);
    return [];
  });

  const recommendedCategoryIds = requestedPrayer
    ? getRecommendedCategoryIdsForPrayer(requestedPrayer, categories)
    : [];
  const categoryExists =
    requestedCategoryId !== null &&
    categories.some((category) => category.id === requestedCategoryId);
  const fallbackCategoryId =
    recommendedCategoryIds[0] ?? categories[0]?.id ?? null;
  const initialCategoryId = categoryExists ? requestedCategoryId : fallbackCategoryId;

  return (
    <AdhkarBrowser
      categories={categories}
      initialCategoryId={initialCategoryId}
      prayer={requestedPrayer}
      recommendedCategoryIds={recommendedCategoryIds}
      sourceUrl={getAdhkarSourceUrl()}
    />
  );
}
