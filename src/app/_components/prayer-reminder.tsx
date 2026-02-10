"use client";

import { PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTo12Hour, getLocalDayKey, prayerTimeToDate } from "../_utils/time";

type ReminderPermission = NotificationPermission | "unsupported";
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

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `prayer-reminder-${dayKey}-${prayer}`,
      });
      return;
    } catch (error) {
      console.error("Service worker notification failed:", error);
    }
  }

  new Notification(title, {
    body,
    icon: "/icon-192.png",
    tag: `prayer-reminder-${dayKey}-${prayer}`,
  });
}

export function PrayerReminder({ timings }: { timings: PrayerTimings }) {
  const [permission, setPermission] = useState<ReminderPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    return Notification.permission;
  });
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

        void showLocalPrayerReminder(prayer, timings[prayer], dayKey).finally(() => {
          localStorage.setItem(storageKey, "1");
        });
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
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
        <BellRing className="size-4" />
        <span>Prayer reminders are active 15 minutes before each prayer.</span>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-border/70 bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Bell className="mt-0.5 size-4 text-primary" />
          <p className="text-sm text-card-foreground">
            Enable local prayer reminders 15 minutes before each prayer.
          </p>
        </div>

        <Button onClick={() => void requestNotificationPermission()} size="sm" type="button">
          Enable reminders
        </Button>
      </div>

      {permission === "denied" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Notifications are blocked in browser settings. Enable them for this site
          to receive reminders.
        </p>
      ) : null}
    </div>
  );
}
