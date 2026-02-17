import {
  getAdhkarCategories,
  getAdhkarSourceUrl,
  getRecommendedCategoryIdsForPrayer,
} from "@/backend/adhkar";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getServerFeatureFlags } from "@/features/server";
import { PRAYER_WITH_ADHKAR, PrayerWithAdhkar } from "@/lib/adhkar";
import {
  getCanonicalUrl,
  getPageAlternates,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  keywords: [
    "daily adhkar",
    "morning adhkar",
    "evening adhkar",
    "islamic duas",
    "prayer adhkar library",
  ],
  alternates: getPageAlternates("/adhkars"),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
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
  const featureFlags = await getServerFeatureFlags();

  if (!featureFlags.adhkars) {
    notFound();
  }

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
  const adhkarsCanonicalUrl = getCanonicalUrl("/adhkars");
  const adhkarsCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Adhkars Library",
    description:
      "Read daily adhkar with source-preserved Arabic text and source-provided translation wording.",
    inLanguage: SITE_LOCALE,
    url: adhkarsCanonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: categories.length,
      itemListElement: categories.slice(0, 20).map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.title,
        item: `${adhkarsCanonicalUrl}?category=${category.id}`,
      })),
    },
  };
  const adhkarsBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Adhkars",
        item: adhkarsCanonicalUrl,
      },
    ],
  };

  return (
    <>
      <AdhkarBrowser
        categories={categories}
        initialCategoryId={initialCategoryId}
        prayer={requestedPrayer}
        recommendedCategoryIds={recommendedCategoryIds}
        sourceUrl={getAdhkarSourceUrl()}
      />
      <JsonLdScript data={adhkarsCollectionJsonLd} id="adhkars-collection-jsonld" />
      <JsonLdScript data={adhkarsBreadcrumbJsonLd} id="adhkars-breadcrumb-jsonld" />
    </>
  );
}
