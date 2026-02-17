import { getAdhkarCategories, getAdhkarSourceUrl } from "@/backend/adhkar";
import { getRequestFeatureFlags } from "@/features/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const featureFlags = getRequestFeatureFlags(request);

  if (!featureFlags.adhkars) {
    return NextResponse.json({ error: "Adhkars feature is disabled." }, { status: 404 });
  }

  try {
    const categories = await getAdhkarCategories();

    return NextResponse.json({
      categories,
      source: {
        name: "Hisn Muslim JSON API",
        url: getAdhkarSourceUrl(),
      },
    });
  } catch (error) {
    console.error("Failed to fetch adhkar categories:", error);

    return NextResponse.json(
      { error: "Failed to fetch adhkar categories." },
      { status: 500 },
    );
  }
}
