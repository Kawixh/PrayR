"use client";

import { PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

    let nextPrayerTime = prayerTimes.find(
      (prayer) => prayer.time > currentTimeStr,
    );
    if (!nextPrayerTime) {
      nextPrayerTime = prayerTimes[0];
    }

    let previousPrayerTime = [...prayerTimes]
      .reverse()
      .find((prayer) => prayer.time < currentTimeStr);
    if (!previousPrayerTime) {
      previousPrayerTime = prayerTimes[prayerTimes.length - 1];
    }

    setNextPrayer(nextPrayerTime);
    setPreviousPrayer(previousPrayerTime);

    const [nextHour, nextMinute] = nextPrayerTime.time.split(":").map(Number);
    const nextPrayerDate = new Date(now);
    nextPrayerDate.setHours(nextHour, nextMinute, 0);

    if (nextPrayerTime.time < currentTimeStr) {
      nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
    }

    const diff = nextPrayerDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    setIsWithinFifteenMinutes(minutes < 15);
    setTimeRemaining(`${minutes}m ${seconds}s`);
  }, [currentTime, timings]);

  if (!nextPrayer || !previousPrayer) return null;

  return (
    <div className="flex flex-col md:flex-row items-stretch w-full justify-center gap-4 md:gap-8">
      {/* Previous Prayer Card */}
      <Card className="w-full min-h-[320px] bg-black dark:bg-gray-900">
        <div className="flex flex-col h-full p-6 md:p-8">
          {/* Top 2/3 section */}
          <div className="h-2/3 flex flex-col justify-center items-center">
            <div className="flex flex-col lg:flex-row justify-center items-center text-center lg:justify-between w-full gap-2 lg:gap-4">
              <div
                className="text-4xl lg:text-5xl font-bold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {nextPrayer.name}
              </div>
              <div
                className="text-4xl lg:text-5xl font-bold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {convertTo12Hour(nextPrayer.time)}
              </div>
            </div>
          </div>
          {/* Bottom 1/3 section */}
          <div className="h-1/3 flex flex-col justify-center items-center text-center gap-2">
            {isWithinFifteenMinutes && (
              <div
                className="text-xl md:text-2xl font-semibold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {timeRemaining} remaining
              </div>
            )}
            <div
              className="text-base md:text-lg font-semibold"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              Next Adhan
            </div>
          </div>
        </div>
      </Card>

      <div className="[display:none] md:block">
        <Separator orientation="vertical" />
      </div>

      <div className="md:[display:none]">
        <Separator orientation="horizontal" />
      </div>

      <Card className="w-full min-h-[320px]">
        <div className="flex flex-col h-full p-6 md:p-8">
          {/* Top 2/3 section */}
          <div className="h-2/3 flex flex-col justify-center items-center">
            <div className="flex flex-col lg:flex-row justify-center items-center text-center lg:justify-between w-full gap-2 lg:gap-4">
              <div
                className="text-4xl lg:text-5xl font-bold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {previousPrayer.name}
              </div>
              <div
                className="text-4xl lg:text-5xl font-bold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {convertTo12Hour(previousPrayer.time)}
              </div>
            </div>
          </div>
          {/* Bottom 1/3 section */}
          <div className="h-1/3 flex justify-center items-center">
            <div
              className="text-base md:text-lg font-semibold text-center"
              style={{ mixBlendMode: "difference", color: "white" }}
            >
              Previous Adhan
            </div>
          </div>
        </div>
      </Card>

      {/* Next Prayer Card */}
    </div>
  );
}
