import { ApiResponse } from "./types";

export const getAdhanTime = async (
  city: string,
  country: string,
  method: number,
  school: number
) => {
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}&school=${school}`,
    { cache: "force-cache" }
  );

  const data: ApiResponse = await response.json();
  return data.data.timings;
};
