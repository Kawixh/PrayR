import { getAdhanTime } from "@/backend/get-adhan-time";
import { getRequestFeatureFlags } from "@/features/request";
import { NextRequest, NextResponse } from "next/server";

function parseRequiredNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function normalizeDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const yyyyMmDdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (yyyyMmDdMatch) {
    const [, year, month, day] = yyyyMmDdMatch;
    return `${day}-${month}-${year}`;
  }

  const ddMmYyyyMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (ddMmYyyyMatch) {
    return trimmed;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const featureFlags = getRequestFeatureFlags(request);

  if (!featureFlags.prayerTimings) {
    return NextResponse.json({ error: "Prayer timings feature is disabled." }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;

  const city = searchParams.get("city")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const date = normalizeDate(searchParams.get("date"));
  const method = parseRequiredNumber(searchParams.get("method"));
  const school = parseRequiredNumber(searchParams.get("school"));

  if (!city || !country || method === null || school === null) {
    return NextResponse.json(
      { error: "Missing or invalid prayer time query params" },
      { status: 400 },
    );
  }

  try {
    const payload = await getAdhanTime(city, country, method, school, date ?? undefined);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);

    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 },
    );
  }
}
