import { getAdhanTime } from "@/backend/get-adhan-time";
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const city = searchParams.get("city")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const method = parseRequiredNumber(searchParams.get("method"));
  const school = parseRequiredNumber(searchParams.get("school"));

  if (!city || !country || method === null || school === null) {
    return NextResponse.json(
      { error: "Missing or invalid prayer time query params" },
      { status: 400 },
    );
  }

  try {
    const timings = await getAdhanTime(city, country, method, school);

    return NextResponse.json({ timings });
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);

    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 },
    );
  }
}
