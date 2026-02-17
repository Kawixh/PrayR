"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type SettingsCheckProps = {
  allowMissingSettings?: boolean;
  children: React.ReactNode;
};

export function SettingsCheck({
  allowMissingSettings = false,
  children,
}: SettingsCheckProps) {
  const router = useRouter();

  useEffect(() => {
    if (allowMissingSettings) {
      return;
    }

    const savedSettings = localStorage.getItem("prayerSettings");
    if (!savedSettings) {
      router.push("/settings");
      return;
    }

    try {
      const parsed = JSON.parse(savedSettings) as {
        cityName?: string;
        country?: string;
      };

      if (!parsed.cityName || !parsed.country) {
        router.push("/settings");
      }
    } catch {
      router.push("/settings");
    }
  }, [allowMissingSettings, router]);

  return <>{children}</>;
}
