import { NextResponse } from "next/server";
import { reverseGeocode } from "../_lib/geonames";

type IpApiResponse = {
  city?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
};

function isValidCoordinate(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to resolve IP location" },
        { status: 502 },
      );
    }

    const ipData = (await response.json()) as IpApiResponse;

    if (ipData.error) {
      return NextResponse.json(
        { error: ipData.reason ?? "IP geolocation failed" },
        { status: 502 },
      );
    }

    if (!isValidCoordinate(ipData.latitude) || !isValidCoordinate(ipData.longitude)) {
      return NextResponse.json(
        { error: "Could not determine coordinates from IP address" },
        { status: 404 },
      );
    }

    try {
      const place = await reverseGeocode(ipData.latitude, ipData.longitude);

      if (place) {
        return NextResponse.json({
          city: place.name,
          country: place.countryName,
          countryCode: place.countryCode,
          lat: place.lat,
          lng: place.lng,
          source: "ip+geonames",
        });
      }
    } catch (reverseError) {
      console.error("Reverse geocode after IP lookup failed:", reverseError);
    }

    if (!ipData.city || !ipData.country_name) {
      return NextResponse.json(
        { error: "Could not determine city/country from IP address" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      city: ipData.city,
      country: ipData.country_name,
      countryCode: ipData.country_code ?? "",
      lat: ipData.latitude,
      lng: ipData.longitude,
      source: "ip",
    });
  } catch (error) {
    console.error("IP location lookup failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to resolve location from IP address",
      },
      { status: 500 },
    );
  }
}
