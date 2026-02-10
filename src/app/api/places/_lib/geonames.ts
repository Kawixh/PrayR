type GeoNamesBasePlace = {
  geonameId: number;
  name: string;
  countryName: string;
  countryCode: string;
  adminName1?: string;
  lat: string;
  lng: string;
  fcode?: string;
  population?: number | string;
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
  featureCode?: string;
  population?: number;
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
  const rawPopulation =
    typeof place.population === "string"
      ? Number(place.population)
      : place.population;
  const population =
    typeof rawPopulation === "number" && !Number.isNaN(rawPopulation)
      ? rawPopulation
      : undefined;

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
    featureCode: place.fcode?.trim() || undefined,
    population,
  };
}

const CITY_FEATURE_CODE_PRIORITY: Record<string, number> = {
  PPLC: 0,
  PPLA: 1,
  PPLA2: 2,
  PPLA3: 3,
  PPLA4: 4,
  PPL: 5,
  PPLG: 6,
  PPLX: 7,
  PPLL: 8,
  PPLS: 9,
};

function getFeaturePriority(place: PlaceSuggestion): number {
  if (!place.featureCode) {
    return Number.MAX_SAFE_INTEGER;
  }

  return CITY_FEATURE_CODE_PRIORITY[place.featureCode] ?? Number.MAX_SAFE_INTEGER;
}

function selectBestReverseResult(places: PlaceSuggestion[]): PlaceSuggestion | null {
  if (places.length === 0) {
    return null;
  }

  return [...places].sort((left, right) => {
    const featurePriorityDiff = getFeaturePriority(left) - getFeaturePriority(right);

    if (featurePriorityDiff !== 0) {
      return featurePriorityDiff;
    }

    const populationDiff = (right.population ?? 0) - (left.population ?? 0);

    if (populationDiff !== 0) {
      return populationDiff;
    }

    return left.name.localeCompare(right.name);
  })[0];
}

async function reverseGeocodeWithParams(
  latitude: number,
  longitude: number,
  params: URLSearchParams,
): Promise<PlaceSuggestion | null> {
  params.set("lat", String(latitude));
  params.set("lng", String(longitude));
  params.set("lang", "en");
  params.set("style", "FULL");

  const data = await fetchGeoNames<GeoNamesPlacesResponse>(
    "findNearbyPlaceNameJSON",
    params,
  );

  if (data.status?.value) {
    throw new Error(data.status.message ?? "GeoNames reverse lookup failed");
  }

  const mapped = (data.geonames ?? [])
    .map((place) => mapPlace(place))
    .filter((place): place is PlaceSuggestion => place !== null);

  return selectBestReverseResult(mapped);
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
  const cityFirst = await reverseGeocodeWithParams(
    latitude,
    longitude,
    new URLSearchParams({
      maxRows: "10",
      featureClass: "P",
      cities: "cities1000",
    }),
  );

  if (cityFirst) {
    return cityFirst;
  }

  return reverseGeocodeWithParams(
    latitude,
    longitude,
    new URLSearchParams({
      maxRows: "5",
    }),
  );
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
