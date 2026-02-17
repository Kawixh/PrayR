import "server-only";

type IpApiResponse = {
  city?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number | string;
  longitude?: number | string;
  error?: boolean;
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

export type IpLocation = {
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

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseCoordinate(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

export function hasCoordinates(
  value: IpLocation,
): value is IpLocation & { lat: number; lng: number } {
  return typeof value.lat === "number" && typeof value.lng === "number";
}

export function hasCityAndCountry(value: IpLocation): boolean {
  return Boolean(value.city && (value.country || value.countryCode));
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

async function lookupFromIpApi(ip: string | null): Promise<IpLocation | null> {
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

async function lookupFromIpWhoIs(ip: string | null): Promise<IpLocation | null> {
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

async function lookupFromIpInfo(ip: string | null): Promise<IpLocation | null> {
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

export async function resolveLocationFromIp(ip: string | null): Promise<IpLocation | null> {
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
