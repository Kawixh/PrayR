"use client";

import { PrayerTimings } from "@/backend/types";
import LiquidGlass from "@/components/ui/liquid-glass";
import { useEffect, useState } from "react";

type PrayerTime = {
  name: string;
  time: string;
};

const convertTo12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export function PrayerTimeCard({ timings }: { timings: PrayerTimings }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [previousPrayer, setPreviousPrayer] = useState<PrayerTime | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isWithinFifteenMinutes, setIsWithinFifteenMinutes] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const prayerTimes: PrayerTime[] = [
      { name: "Fajr", time: timings.Fajr },
      { name: "Sunrise", time: timings.Sunrise },
      { name: "Dhuhr", time: timings.Dhuhr },
      { name: "Asr", time: timings.Asr },
      { name: "Maghrib", time: timings.Maghrib },
      { name: "Isha", time: timings.Isha },
    ];

    const now = currentTime;
    const currentTimeStr = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Find the next prayer time
    let nextPrayerTime = prayerTimes.find(
      (prayer) => prayer.time > currentTimeStr
    );
    if (!nextPrayerTime) {
      // If no next prayer today, find the first prayer of tomorrow
      nextPrayerTime = prayerTimes[0];
    }

    // Find the previous prayer time
    let previousPrayerTime = [...prayerTimes]
      .reverse()
      .find((prayer) => prayer.time < currentTimeStr);
    if (!previousPrayerTime) {
      // If no previous prayer today, find the last prayer of yesterday
      previousPrayerTime = prayerTimes[prayerTimes.length - 1];
    }

    setNextPrayer(nextPrayerTime);
    setPreviousPrayer(previousPrayerTime);

    // Calculate time remaining
    const [nextHour, nextMinute] = nextPrayerTime.time.split(":").map(Number);
    const nextPrayerDate = new Date(now);
    nextPrayerDate.setHours(nextHour, nextMinute, 0);

    if (nextPrayerTime.time < currentTimeStr) {
      // If the next prayer is tomorrow
      nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
    }

    const diff = nextPrayerDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    // Check if the next prayer is within 15 minutes
    setIsWithinFifteenMinutes(minutes <= 15);
    setTimeRemaining(`${minutes}m ${seconds}s`);
  }, [currentTime, timings]);

  if (!nextPrayer || !previousPrayer) return null;

  return (
    <LiquidGlass className=" p-6 flex flex-col items-center justify-center text-white dark:text-black w-full max-w-md mx-auto">
      <div className="liquidGlass-effect"></div>
      <div className="liquidGlass-tint"></div>
      <div className="liquidGlass-shine"></div>
      <div className="liquidGlass-text">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Prayer Times</h2>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-right pr-4 border-r border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Previous
              </p>
              <div className="text-xl font-semibold">{previousPrayer.name}</div>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                {convertTo12Hour(previousPrayer.time)}
              </div>
            </div>

            <div className="text-left pl-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Next
              </p>
              <div className="text-xl font-semibold text-primary">
                {nextPrayer.name}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                {convertTo12Hour(nextPrayer.time)}
              </div>
            </div>
          </div>

          {isWithinFifteenMinutes && (
            <div className="text-xl font-semibold text-primary mt-4">
              {timeRemaining} remaining
            </div>
          )}
        </div>
      </div>
    </LiquidGlass>
  );
}
