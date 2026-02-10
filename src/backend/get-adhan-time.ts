import { ApiResponse } from "./types";

export const getAdhanTime = async (
  city: string,
  country: string,
  method: number,
  school: number
) => {
  const searchParams = new URLSearchParams({
    city,
    country,
    method: String(method),
    school: String(school),
  });

  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity?${searchParams.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Prayer API request failed with status ${response.status}`);
  }

  const data: ApiResponse = await response.json();
  return data.data.timings;
};
