"use client";

import { PrayerTimings } from "@/backend/types";
import { useEffect, useState } from "react";
import { fetchPrayerTimes } from "../actions";
import { PrayerTimeCard } from "./prayer-time-card";

export function PrayerTimesWrapper() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPrayerTimes = async () => {
      try {
        const savedSettings = localStorage.getItem("prayerSettings");
        if (!savedSettings) return;

        const { cityName, country, method, school } = JSON.parse(savedSettings);
        if (!cityName || !country || !method || !school) return;

        const prayerTimes = await fetchPrayerTimes(
          cityName,
          country,
          method,
          school
        );
        setTimings(prayerTimes);
        setError(null);
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        setError("Failed to fetch prayer times. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getPrayerTimes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-8 text-xl font-medium text-orange-500">
            Loading prayer times...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-8 text-xl font-medium text-red-500">{error}</h2>
        </div>
      </div>
    );
  }

  if (!timings) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <PrayerTimeCard timings={timings} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <div className="text-center">
          <p className="text-lg font-semibold">Fajr</p>
          <p className="text-xl">{timings.Fajr}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Sunrise</p>
          <p className="text-xl">{timings.Sunrise}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Dhuhr</p>
          <p className="text-xl">{timings.Dhuhr}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Asr</p>
          <p className="text-xl">{timings.Asr}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Maghrib</p>
          <p className="text-xl">{timings.Maghrib}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Isha</p>
          <p className="text-xl">{timings.Isha}</p>
        </div>
      </div>
    </div>
  );
}
