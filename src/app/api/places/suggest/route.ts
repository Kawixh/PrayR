import { NextRequest, NextResponse } from "next/server";
import { getCountryList, searchCities } from "../_lib/geonames";

type SuggestKind = "city" | "country";

function normalizeKind(value: string | null): SuggestKind {
  if (value === "country") {
    return "country";
  }

  return "city";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kind = normalizeKind(searchParams.get("kind"));
  const query = (searchParams.get("q") ?? "").trim();
  const countryCode = (searchParams.get("countryCode") ?? "").trim();

  if (query.length < 1) {
    return NextResponse.json({ items: [] });
  }

  try {
    if (kind === "country") {
      const countries = await getCountryList();
      const normalizedQuery = query.toLowerCase();

      const items = countries
        .filter((country) =>
          country.countryName.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, 10);

      return NextResponse.json({ items });
    }

    if (query.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const items = await searchCities(query, countryCode || undefined);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Places suggest failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch place suggestions",
      },
      { status: 500 },
    );
  }
}
