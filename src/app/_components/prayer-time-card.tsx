"use client";

import { PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useState } from "react";
import { formatTo12Hour, prayerTimeToDate } from "../_utils/time";

type PrayerTime = {
  name: string;
  time: string;
};

type PrayerStatus = {
  nextPrayer: PrayerTime;
  previousPrayer: PrayerTime;
  timeRemaining: string;
  isWithinFifteenMinutes: boolean;
};

function getPrayerStatus(now: Date, timings: PrayerTimings): PrayerStatus | null {
  const basePrayerTimes: PrayerTime[] = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  const prayerTimes = basePrayerTimes
    .map((prayer) => {
      const prayerDate = prayerTimeToDate(prayer.time, now);

      if (!prayerDate) {
        return null;
      }

      return {
        ...prayer,
        prayerDate,
      };
    })
    .filter((prayer): prayer is PrayerTime & { prayerDate: Date } => prayer !== null);

  if (prayerTimes.length === 0) {
    return null;
  }

  const nowTimestamp = now.getTime();

  let nextPrayer = prayerTimes.find(
    (prayer) => prayer.prayerDate.getTime() > nowTimestamp,
  );
  let nextPrayerDate: Date;

  if (nextPrayer) {
    nextPrayerDate = nextPrayer.prayerDate;
  } else {
    nextPrayer = prayerTimes[0];
    nextPrayerDate = new Date(nextPrayer.prayerDate);
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
  }

  let previousPrayer = [...prayerTimes]
    .reverse()
    .find((prayer) => prayer.prayerDate.getTime() <= nowTimestamp);

  if (!previousPrayer) {
    previousPrayer = prayerTimes[prayerTimes.length - 1];
  }

  const diff = nextPrayerDate.getTime() - nowTimestamp;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    nextPrayer,
    previousPrayer,
    timeRemaining: `${minutes}m ${seconds}s`,
    isWithinFifteenMinutes: diff <= 15 * 60 * 1000,
  };
}

export function PrayerTimeCard({ timings }: { timings: PrayerTimings }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const prayerStatus = useMemo(
    () => getPrayerStatus(currentTime, timings),
    [currentTime, timings],
  );

  if (!prayerStatus) {
    return null;
  }

  const { nextPrayer, previousPrayer, timeRemaining, isWithinFifteenMinutes } =
    prayerStatus;

  return (
    <div className="flex flex-col md:flex-row items-stretch w-full justify-center gap-4 md:gap-8">
      <Card className="w-full min-h-[320px] bg-black dark:bg-gray-900">
        <div className="flex flex-col h-full p-6 md:p-8">
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
                {formatTo12Hour(nextPrayer.time)}
              </div>
            </div>
          </div>
          <div className="h-1/3 flex flex-col justify-center items-center text-center gap-2">
            {isWithinFifteenMinutes ? (
              <div
                className="text-xl md:text-2xl font-semibold"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {timeRemaining} remaining
              </div>
            ) : null}
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
                {formatTo12Hour(previousPrayer.time)}
              </div>
            </div>
          </div>
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
    </div>
  );
}
