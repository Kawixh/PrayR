"use client";

import { PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLocalNotificationPermission,
  type LocalNotificationPermission,
  showLocalNotification,
} from "../_utils/local-notifications";
import {
  formatTo12Hour,
  getLocalDayKey,
  prayerTimeToDate,
} from "../_utils/time";

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

const PRAYER_NAMES: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const REMINDER_MINUTES_BEFORE = 15;
const REMINDER_STORAGE_PREFIX = "prayerReminderSent";

function getReminderStorageKey(dayKey: string, prayer: PrayerName): string {
  return `${REMINDER_STORAGE_PREFIX}:${dayKey}:${prayer}`;
}

async function showLocalPrayerReminder(
  prayer: PrayerName,
  prayerTime: string,
  dayKey: string,
): Promise<void> {
  const title = `${prayer} in ${REMINDER_MINUTES_BEFORE} minutes`;
  const body = `${prayer} starts at ${formatTo12Hour(prayerTime)}.`;
  await showLocalNotification({
    title,
    body,
    tag: `prayer-reminder-${dayKey}-${prayer}`,
  });
}

export function PrayerReminder({ timings }: { timings: PrayerTimings }) {
  const [permission, setPermission] = useState<LocalNotificationPermission>(
    getLocalNotificationPermission,
  );
  const [scheduleVersion, setScheduleVersion] = useState(0);

  useEffect(() => {
    if (permission !== "granted") {
      return;
    }

    const now = new Date();
    const dayKey = getLocalDayKey(now);
    const timeoutIds: number[] = [];

    for (const prayer of PRAYER_NAMES) {
      const prayerDate = prayerTimeToDate(timings[prayer], now);

      if (!prayerDate) {
        continue;
      }

      const reminderDate = new Date(
        prayerDate.getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000,
      );

      if (reminderDate <= now) {
        continue;
      }

      const storageKey = getReminderStorageKey(dayKey, prayer);

      if (localStorage.getItem(storageKey) === "1") {
        continue;
      }

      const timeoutId = window.setTimeout(() => {
        if (localStorage.getItem(storageKey) === "1") {
          return;
        }

        void showLocalPrayerReminder(prayer, timings[prayer], dayKey).finally(
          () => {
            localStorage.setItem(storageKey, "1");
          },
        );
      }, reminderDate.getTime() - now.getTime());

      timeoutIds.push(timeoutId);
    }

    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 5, 0);

    const nextDayTimeoutId = window.setTimeout(() => {
      setScheduleVersion((version) => version + 1);
    }, nextDay.getTime() - now.getTime());

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(nextDayTimeoutId);
    };
  }, [permission, scheduleVersion, timings]);

  const requestNotificationPermission = async () => {
    if (permission === "unsupported") {
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (permission === "unsupported") {
    return null;
  }

  if (permission === "granted") {
    return null;
  }

  return (
    <div
      className={cn("glass-panel rounded-2xl border-border/80 p-4")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 rounded-full p-2",
              "bg-primary/15 text-primary",
            )}
          >
            <Bell className="size-4" />
          </div>

          <div className="min-w-0 space-y-1">
            <p className="font-display text-xl leading-tight">Enable prayer reminders</p>
            <p className="break-words text-sm leading-6 text-muted-foreground">
              Receive local reminders 15 minutes before each prayer without any
              server requests.
            </p>
          </div>
        </div>

        <Button
          className="min-h-10 w-full rounded-full px-5 py-2.5 sm:w-auto"
          onClick={() => void requestNotificationPermission()}
          size="sm"
          type="button"
        >
          Turn on reminders
        </Button>
      </div>

      {permission === "denied" ? (
        <p className="mt-2 break-words text-xs text-muted-foreground">
          Notifications are currently blocked in browser settings. Allow
          notifications for this site to receive reminders.
        </p>
      ) : null}
    </div>
  );
}
