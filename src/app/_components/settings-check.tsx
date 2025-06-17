"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SettingsCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const savedSettings = localStorage.getItem("prayerSettings");
    if (!savedSettings) {
      router.push("/settings");
      return;
    }

    const { cityName, country } = JSON.parse(savedSettings);
    if (!cityName || !country) {
      router.push("/settings");
    }
  }, [router]);

  return <>{children}</>;
}
