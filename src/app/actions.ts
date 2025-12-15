"use server";

import { getAdhanTime } from "@/backend/get-adhan-time";
import { PrayerTimings } from "@/backend/types";

export async function fetchPrayerTimes(
  city: string,
  country: string,
  method: number,
  school: number,
): Promise<PrayerTimings> {
  try {
    const timings = await getAdhanTime(city, country, method, school);
    return timings;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw new Error("Failed to fetch prayer times");
  }
}
