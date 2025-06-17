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
    <div className="flex items-stretch w-full justify-center gap-8">
      {/* Previous Prayer Card */}
      <LiquidGlass className="flex flex-col justify-between items-center p-12 w-full max-w-md min-h-[320px]">
        {/* Centered main part */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="flex items-center gap-4">
            <div
              className="text-5xl font-bold"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              {previousPrayer.name}
            </div>
            <div
              className="text-5xl font-bold"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              {convertTo12Hour(previousPrayer.time)}
            </div>
          </div>
        </div>
        {/* Bottom text */}
        <div
          className="text-lg font-semibold text-center mt-4"
          style={{ mixBlendMode: "difference", color: "white" }}
        >
          Previous Adhan
        </div>
      </LiquidGlass>

      {/* Divider */}
      <LiquidGlass className="h-full w-[2px] min-h-[320px] flex-shrink-0">
        <div className="h-full w-full"></div>
      </LiquidGlass>

      {/* Next Prayer Card */}
      <LiquidGlass className="flex flex-col justify-between items-center p-12 w-full max-w-md min-h-[320px]">
        {/* Centered main part */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="flex items-center gap-4">
            <div
              className="text-5xl font-bold"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              {nextPrayer.name}
            </div>
            <div
              className="text-5xl font-bold"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              {convertTo12Hour(nextPrayer.time)}
            </div>
          </div>
          {isWithinFifteenMinutes && (
            <div
              className="text-2xl font-semibold mt-4"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              {timeRemaining} remaining
            </div>
          )}
        </div>
        {/* Bottom text */}
        <div
          className="text-lg font-semibold text-center mt-4"
          style={{ mixBlendMode: "difference", color: "white" }}
        >
          Next Adhan
        </div>
      </LiquidGlass>
    </div>
  );
}
