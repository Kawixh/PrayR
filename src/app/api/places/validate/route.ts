import { NextRequest, NextResponse } from "next/server";
import {
  getCountryList,
  validateCityInCountry,
} from "../_lib/geonames";

function normalizeCountryCode(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!/^[a-z]{2}$/i.test(trimmed)) {
    return null;
  }

  return trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = (searchParams.get("city") ?? "").trim();
  const country = (searchParams.get("country") ?? "").trim();
  const rawCountryCode = normalizeCountryCode(searchParams.get("countryCode"));

  if (!city || !country) {
    return NextResponse.json(
      { error: "City and country are required for validation" },
      { status: 400 },
    );
  }

  try {
    const countries = await getCountryList();

    const selectedCountry =
      countries.find((item) => item.countryCode === rawCountryCode) ??
      countries.find(
        (item) => item.countryName.toLowerCase() === country.toLowerCase(),
      ) ??
      countries.find(
        (item) => item.countryCode.toLowerCase() === country.toLowerCase(),
      );

    if (!selectedCountry) {
      return NextResponse.json({
        valid: false,
        warning:
          "Country was not recognized. Select a country from autocomplete.",
      });
    }

    const valid = await validateCityInCountry(city, selectedCountry.countryCode);

    if (!valid) {
      return NextResponse.json({
        valid: false,
        warning: `${city} was not found in ${selectedCountry.countryName}. Please choose a matching city suggestion.`,
      });
    }

    return NextResponse.json({
      valid: true,
      normalizedCountry: selectedCountry.countryName,
      countryCode: selectedCountry.countryCode,
    });
  } catch (error) {
    console.error("Places validation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate city/country combination",
      },
      { status: 500 },
    );
  }
}
