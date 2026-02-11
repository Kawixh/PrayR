import { getAdhkarCategories, getAdhkarSourceUrl } from "@/backend/adhkar";
import { NextResponse } from "next/server";

export async function GET() {
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

