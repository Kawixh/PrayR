import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "../_lib/geonames";

type IpApiResponse = {
  city?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number | string;
  longitude?: number | string;
  error?: boolean;
  reason?: string;
};

type IpWhoIsResponse = {
  success?: boolean;
  city?: string;
  country?: string;
  country_code?: string;
  latitude?: number | string;
  longitude?: number | string;
};

type IpInfoResponse = {
  bogon?: boolean;
  city?: string;
  country?: string;
  loc?: string;
};

type IpLookupResult = {
  city?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  source: "ipapi" | "ipwhois" | "ipinfo";
};

const IP_LOOKUP_TIMEOUT_MS = 6_500;

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseCoordinate(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function hasCoordinates(
  value: IpLookupResult,
): value is IpLookupResult & { lat: number; lng: number } {
  return typeof value.lat === "number" && typeof value.lng === "number";
}

function hasCityAndCountry(value: IpLookupResult): boolean {
  return Boolean(value.city && (value.country || value.countryCode));
}

function normalizeIpCandidate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();

  if (!first || first.toLowerCase() === "unknown") {
    return null;
  }

  let normalized = first;

  if (normalized.startsWith("::ffff:")) {
    normalized = normalized.slice(7);
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(normalized)) {
    normalized = normalized.replace(/:\d+$/, "");
  }

  if (normalized === "::1" || normalized === "127.0.0.1") {
    return null;
  }

  return normalized;
}

function getClientIp(request: NextRequest): string | null {
  return (
    normalizeIpCandidate(request.headers.get("x-forwarded-for")) ??
    normalizeIpCandidate(request.headers.get("x-real-ip")) ??
    normalizeIpCandidate(request.headers.get("cf-connecting-ip")) ??
    normalizeIpCandidate(request.headers.get("x-client-ip"))
  );
}

async function fetchIpJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(IP_LOOKUP_TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

async function lookupFromIpApi(ip: string | null): Promise<IpLookupResult | null> {
  const suffix = ip ? `${encodeURIComponent(ip)}/json/` : "json/";
  const data = await fetchIpJson<IpApiResponse>(`https://ipapi.co/${suffix}`);

  if (!data || data.error) {
    return null;
  }

  const city = normalizeText(data.city);
  const country = normalizeText(data.country_name);
  const countryCode = normalizeText(data.country_code)?.toUpperCase();
  const lat = parseCoordinate(data.latitude);
  const lng = parseCoordinate(data.longitude);

  if (!city && !country && !countryCode && lat === undefined && lng === undefined) {
    return null;
  }

  return {
    city,
    country,
    countryCode,
    lat,
    lng,
    source: "ipapi",
  };
}

async function lookupFromIpWhoIs(ip: string | null): Promise<IpLookupResult | null> {
  const path = ip ? `/${encodeURIComponent(ip)}` : "/";
  const data = await fetchIpJson<IpWhoIsResponse>(`https://ipwho.is${path}`);

  if (!data || data.success === false) {
    return null;
  }

  const city = normalizeText(data.city);
  const country = normalizeText(data.country);
  const countryCode = normalizeText(data.country_code)?.toUpperCase();
  const lat = parseCoordinate(data.latitude);
  const lng = parseCoordinate(data.longitude);

  if (!city && !country && !countryCode && lat === undefined && lng === undefined) {
    return null;
  }

  return {
    city,
    country,
    countryCode,
    lat,
    lng,
    source: "ipwhois",
  };
}

async function lookupFromIpInfo(ip: string | null): Promise<IpLookupResult | null> {
  const prefix = ip ? `/${encodeURIComponent(ip)}` : "";
  const data = await fetchIpJson<IpInfoResponse>(`https://ipinfo.io${prefix}/json`);

  if (!data || data.bogon) {
    return null;
  }

  const city = normalizeText(data.city);
  const countryCode = normalizeText(data.country)?.toUpperCase();
  const [latToken, lngToken] = (data.loc ?? "").split(",");
  const lat = parseCoordinate(latToken);
  const lng = parseCoordinate(lngToken);

  if (!city && !countryCode && lat === undefined && lng === undefined) {
    return null;
  }

  return {
    city,
    country: countryCode,
    countryCode,
    lat,
    lng,
    source: "ipinfo",
  };
}

async function resolveIpLocation(ip: string | null): Promise<IpLookupResult | null> {
  const providers = [
    { name: "ipapi", run: lookupFromIpApi },
    { name: "ipwhois", run: lookupFromIpWhoIs },
    { name: "ipinfo", run: lookupFromIpInfo },
  ] as const;

  for (const provider of providers) {
    try {
      const result = await provider.run(ip);

      if (result && (hasCoordinates(result) || hasCityAndCountry(result))) {
        return result;
      }
    } catch (error) {
      console.error(`IP lookup provider failed (${provider.name}):`, error);
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipData = await resolveIpLocation(ip);

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

    if (!ipData.city || (!ipData.country && !ipData.countryCode)) {
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
