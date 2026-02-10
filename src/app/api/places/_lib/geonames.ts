type GeoNamesBasePlace = {
  geonameId: number;
  name: string;
  countryName: string;
  countryCode: string;
  adminName1?: string;
  lat: string;
  lng: string;
};

type GeoNamesCountry = {
  countryCode: string;
  countryName: string;
};

type GeoNamesCountriesResponse = {
  geonames?: GeoNamesCountry[];
  status?: {
    message?: string;
    value?: number;
  };
};

type GeoNamesPlacesResponse = {
  geonames?: GeoNamesBasePlace[];
  status?: {
    message?: string;
    value?: number;
  };
};

let countriesCache: GeoNamesCountry[] | null = null;
let countriesCacheExpiresAt = 0;

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export type PlaceSuggestion = {
  geonameId: number;
  name: string;
  countryName: string;
  countryCode: string;
  adminName1?: string;
  lat: number;
  lng: number;
};

function getGeoNamesUsername(): string {
  const username = process.env.GEONAMES_USERNAME?.trim();

  if (!username) {
    throw new Error("Missing GEONAMES_USERNAME environment variable");
  }

  return username;
}

function getGeoNamesBaseUrl(): string {
  return process.env.GEONAMES_BASE_URL?.trim() || "http://api.geonames.org";
}

async function fetchGeoNames<T>(
  path: string,
  params: URLSearchParams,
): Promise<T> {
  const username = getGeoNamesUsername();
  const baseUrl = getGeoNamesBaseUrl();
  params.set("username", username);

  const response = await fetch(`${baseUrl}/${path}?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    let details = "";

    try {
      const parsed = JSON.parse(body) as {
        status?: {
          message?: string;
          value?: number;
        };
      };
      details = parsed.status?.message?.trim() ?? "";
    } catch {
      details = body.trim();
    }

    const reason = details
      ? `GeoNames request failed with status ${response.status}: ${details}`
      : `GeoNames request failed with status ${response.status}`;

    if (response.status === 401 && baseUrl.includes("secure.geonames.org")) {
      throw new Error(
        `${reason}. Use the free endpoint by setting GEONAMES_BASE_URL=http://api.geonames.org`,
      );
    }

    throw new Error(reason);
  }

  return (await response.json()) as T;
}

function mapPlace(place: GeoNamesBasePlace): PlaceSuggestion | null {
  const lat = Number(place.lat);
  const lng = Number(place.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    geonameId: place.geonameId,
    name: place.name,
    countryName: place.countryName,
    countryCode: place.countryCode,
    adminName1: place.adminName1,
    lat,
    lng,
  };
}

export async function searchCities(
  query: string,
  countryCode?: string,
): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    name_startsWith: query,
    featureClass: "P",
    maxRows: "10",
    orderby: "population",
    lang: "en",
  });

  if (countryCode && /^[a-z]{2}$/i.test(countryCode)) {
    params.set("country", countryCode.toUpperCase());
  }

  const data = await fetchGeoNames<GeoNamesPlacesResponse>("searchJSON", params);

  if (data.status?.value) {
    throw new Error(data.status.message ?? "GeoNames city search failed");
  }

  const seen = new Set<number>();
  const mapped: PlaceSuggestion[] = [];

  for (const place of data.geonames ?? []) {
    if (seen.has(place.geonameId)) {
      continue;
    }

    const converted = mapPlace(place);

    if (!converted) {
      continue;
    }

    seen.add(converted.geonameId);
    mapped.push(converted);
  }

  return mapped;
}

export async function validateCityInCountry(
  city: string,
  countryCode: string,
): Promise<boolean> {
  const normalizedCity = city.trim().toLowerCase();

  if (!normalizedCity) {
    return false;
  }

  const candidates = await searchCities(city, countryCode);

  return candidates.some((candidate) => {
    const candidateName = candidate.name.trim().toLowerCase();

    return (
      candidateName === normalizedCity ||
      candidateName.startsWith(normalizedCity) ||
      normalizedCity.startsWith(candidateName)
    );
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PlaceSuggestion | null> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    maxRows: "1",
    lang: "en",
  });

  const data = await fetchGeoNames<GeoNamesPlacesResponse>(
    "findNearbyPlaceNameJSON",
    params,
  );

  if (data.status?.value) {
    throw new Error(data.status.message ?? "GeoNames reverse lookup failed");
  }

  const first = data.geonames?.[0];

  if (!first) {
    return null;
  }

  return mapPlace(first);
}

export async function getCountryList(): Promise<GeoNamesCountry[]> {
  const now = Date.now();

  if (countriesCache && countriesCacheExpiresAt > now) {
    return countriesCache;
  }

  const params = new URLSearchParams({
    lang: "en",
  });

  const data = await fetchGeoNames<GeoNamesCountriesResponse>(
    "countryInfoJSON",
    params,
  );

  if (data.status?.value) {
    throw new Error(data.status.message ?? "GeoNames country lookup failed");
  }

  countriesCache = (data.geonames ?? []).sort((a, b) =>
    a.countryName.localeCompare(b.countryName),
  );
  countriesCacheExpiresAt = now + ONE_DAY_IN_MS;

  return countriesCache;
}
