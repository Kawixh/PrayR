import {
  hasCityAndCountry,
  hasCoordinates,
  resolveLocationFromIp,
} from "@/lib/ip-location";
import { getClientIpFromHeaders } from "@/lib/request-ip";
import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "../_lib/geonames";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    const ipData = await resolveLocationFromIp(ip);

    if (!ipData) {
      return NextResponse.json(
        { error: "Unable to resolve location from IP providers" },
        { status: 502 },
      );
    }

    if (hasCoordinates(ipData)) {
      try {
        const place = await reverseGeocode(ipData.lat, ipData.lng);

        if (place) {
          return NextResponse.json({
            city: place.name,
            country: place.countryName,
            countryCode: place.countryCode,
            lat: place.lat,
            lng: place.lng,
            source: `${ipData.source}+geonames`,
          });
        }
      } catch (reverseError) {
        console.error("Reverse geocode after IP lookup failed:", reverseError);
      }
    }

    if (!hasCityAndCountry(ipData)) {
      return NextResponse.json(
        { error: "Could not determine city/country from IP address" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      city: ipData.city,
      country: ipData.country ?? ipData.countryCode ?? "",
      countryCode: ipData.countryCode ?? "",
      lat: ipData.lat,
      lng: ipData.lng,
      source: ipData.source,
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
