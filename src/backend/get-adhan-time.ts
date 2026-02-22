import { type AlAdhanTimingsResponse } from "./types";

export const getAdhanTime = async (
  city: string,
  country: string,
  method: number,
  school: number,
  date?: string,
): Promise<AlAdhanTimingsResponse> => {
  const searchParams = new URLSearchParams({
    city,
    country,
    method: String(method),
    school: String(school),
  });

  const baseUrl = date
    ? `https://api.aladhan.com/v1/timingsByCity/${encodeURIComponent(date)}`
    : "https://api.aladhan.com/v1/timingsByCity";

  const response = await fetch(`${baseUrl}?${searchParams.toString()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Prayer API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AlAdhanTimingsResponse;
  return data;
};
