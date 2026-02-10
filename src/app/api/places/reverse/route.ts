import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "../_lib/geonames";

function parseCoordinate(value: string | null): number | null {
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
  const lat = parseCoordinate(searchParams.get("lat"));
  const lng = parseCoordinate(searchParams.get("lng"));

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: "Missing or invalid coordinates" },
      { status: 400 },
    );
  }

  try {
    const place = await reverseGeocode(lat, lng);

    if (!place) {
      return NextResponse.json(
        { error: "No city found for these coordinates" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      city: place.name,
      country: place.countryName,
      countryCode: place.countryCode,
      lat: place.lat,
      lng: place.lng,
    });
  } catch (error) {
    console.error("Places reverse lookup failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to resolve coordinates",
      },
      { status: 500 },
    );
  }
}
