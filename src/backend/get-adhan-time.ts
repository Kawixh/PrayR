import { ApiResponse } from "./types";

export const getAdhanTime = async (city: string, country: string) => {
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`,
    { cache: "force-cache" }
  );

  const data: ApiResponse = await response.json();
  return data.data.timings;
};
