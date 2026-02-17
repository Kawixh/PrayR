import { getAdhkarChapter } from "@/backend/adhkar";
import { getRequestFeatureFlags } from "@/features/request";
import { isAdhkarLanguage } from "@/lib/adhkar";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const featureFlags = getRequestFeatureFlags(request);

  if (!featureFlags.adhkars) {
    return NextResponse.json({ error: "Adhkars feature is disabled." }, { status: 404 });
  }

  const { id } = await context.params;
  const parsedId = Number(id);

  if (Number.isNaN(parsedId) || parsedId <= 0) {
    return NextResponse.json({ error: "Invalid adhkar category id." }, { status: 400 });
  }

  const languageQuery = request.nextUrl.searchParams.get("language");
  const language = isAdhkarLanguage(languageQuery) ? languageQuery : "en";

  try {
    const chapter = await getAdhkarChapter(parsedId, language);

    return NextResponse.json({
      chapter,
      source: {
        name: "Hisn Muslim JSON API",
        url: chapter.sourceUrl,
      },
    });
  } catch (error) {
    console.error("Failed to fetch adhkar chapter:", error);

    return NextResponse.json(
      { error: "Failed to fetch adhkar chapter." },
      { status: 500 },
    );
  }
}
