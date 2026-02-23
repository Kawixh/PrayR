"use client";

import { resetBannerPreferencesToDefaults } from "@/app/_utils/banner-preferences";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  readClientFeatureOverrides,
  writeClientFeatureOverrides,
} from "@/features/client";
import { type FeatureFlags } from "@/features/definitions";
import { resolveFeatureFlags } from "@/features/resolve";
import { cn } from "@/lib/utils";
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createHomepageSeoContentCookie,
  DEFAULT_SHOW_HOMEPAGE_SEO_CONTENT,
  normalizeShowHomepageSeoContent,
} from "../../_utils/homepage-seo-content";
import {
  getLocalNotificationPermission,
  showLocalNotification,
  type LocalNotificationPermission,
} from "../../_utils/local-notifications";
import {
  readPrayerDashboardViewFromStorage,
  writePrayerDashboardViewToStorage,
  type PrayerDashboardView,
} from "../../_utils/prayer-dashboard-view";
import {
  getSettingsPanelPath,
  type SettingsPanelId,
} from "../_lib/settings-panels";
import { FeatureSettingsCard } from "./feature-settings-card";

const calculationMethods = [
  {
    value: "0",
    label: "Jafari / Shia Ithna-Ashari",
    description: "Ja'fari preset commonly used by Shia communities.",
  },
  {
    value: "1",
    label: "University of Islamic Sciences, Karachi",
    description: "Karachi preset, common in South Asia.",
  },
  {
    value: "2",
    label: "Islamic Society of North America",
    description: "ISNA preset, common in the US and Canada.",
  },
  {
    value: "3",
    label: "Muslim World League",
    description: "MWL preset, widely used internationally.",
  },
  {
    value: "4",
    label: "Umm Al-Qura University, Makkah",
    description: "Umm al-Qura preset, standard in Saudi Arabia.",
  },
  {
    value: "5",
    label: "Egyptian General Authority of Survey",
    description: "Egyptian survey preset, common in Egypt.",
  },
  {
    value: "7",
    label: "Institute of Geophysics, University of Tehran",
    description: "Tehran preset, commonly used in Iran.",
  },
  {
    value: "8",
    label: "Gulf Region",
    description: "General Gulf-region preset.",
  },
  {
    value: "9",
    label: "Kuwait",
    description: "Kuwait national preset.",
  },
  {
    value: "10",
    label: "Qatar",
    description: "Qatar national preset.",
  },
  {
    value: "11",
    label: "Majlis Ugama Islam Singapura, Singapore",
    description: "MUIS preset for Singapore.",
  },
  {
    value: "12",
    label: "Union Organization islamic de France",
    description: "French community preset (UOIF).",
  },
  {
    value: "13",
    label: "Diyanet İşleri Başkanlığı, Turkey",
    description: "Diyanet preset, standard in Turkey.",
  },
  {
    value: "14",
    label: "Spiritual Administration of Muslims of Russia",
    description: "Russian Muslim administration preset.",
  },
  {
    value: "15",
    label: "Moonsighting Committee Worldwide (requires shafaq parameter)",
    description: "Moonsighting Committee preset (requires `shafaq`).",
  },
  {
    value: "16",
    label: "Dubai (experimental)",
    description: "Dubai-specific experimental preset.",
  },
  {
    value: "17",
    label: "Jabatan Kemajuan Islam Malaysia (JAKIM)",
    description: "Official JAKIM preset for Malaysia.",
  },
  {
    value: "18",
    label: "Tunisia",
    description: "Tunisia national preset.",
  },
  {
    value: "19",
    label: "Algeria",
    description: "Algeria national preset.",
  },
  {
    value: "20",
    label: "KEMENAG - Kementerian Agama Republik Indonesia",
    description: "Official KEMENAG preset for Indonesia.",
  },
  {
    value: "21",
    label: "Morocco",
    description: "Morocco national preset.",
  },
  {
    value: "22",
    label: "Comunidade Islamica de Lisboa",
    description: "Lisbon Islamic community preset.",
  },
  {
    value: "23",
    label: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan",
    description: "Official Jordan Awqaf preset.",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: string;
}>;

const schools = [
  {
    value: "0",
    label: "Shafi (general Sunni school)",
    description:
      "Default for most Sunni communities. Asr begins when shadow length equals object height.",
  },
  {
    value: "1",
    label: "Hanafi",
    description:
      "Uses a later Asr timing. Select this when your local masjid follows Hanafi fiqh.",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: "0" | "1";
}>;

const dashboardViewOptions = [
  {
    value: "cards",
    label: "Current cards",
    description:
      "Shows current state cards, previous/next flow, and Makrooh warnings inside prayer times.",
  },
  {
    value: "timeline",
    label: "Vertical timeline",
    description:
      "Shows full day events in a vertical timeline with prayers and Makrooh blocks.",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: PrayerDashboardView;
}>;

const HIJRI_DATE_ADJUSTMENT_OPTIONS = [
  {
    value: "-2",
    label: "-2 days",
    description: "Use when your local moon-sighting starts two days earlier.",
  },
  {
    value: "-1",
    label: "-1 day",
    description: "Move the Hijri date one day earlier for local calendars.",
  },
  {
    value: "0",
    label: "No adjustment",
    description: "Keep the default astronomical Hijri date.",
  },
  {
    value: "1",
    label: "+1 day",
    description: "Move the Hijri date one day forward to match your community.",
  },
  {
    value: "2",
    label: "+2 days",
    description: "Use only if your local calendar is two days ahead.",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: "-2" | "-1" | "0" | "1" | "2";
}>;

const DEFAULT_HIJRI_DATE_ADJUSTMENT = "0";

type SettingsMenuItem = {
  description: string;
  icon: LucideIcon;
  id: SettingsPanelId;
  label: string;
  summary: string;
};

function normalizeHijriDateAdjustmentValue(value: unknown): string {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_HIJRI_DATE_ADJUSTMENT;
  }

  const integerValue = Math.trunc(parsed);

  if (integerValue < -2 || integerValue > 2) {
    return DEFAULT_HIJRI_DATE_ADJUSTMENT;
  }

  return String(integerValue);
}

type PrayerSettingsState = {
  cityName: string;
  country: string;
  countryCode: string;
  hijriDateAdjustment: string;
  method: string;
  showHomepageSeoContent: boolean;
  school: string;
};

type CitySuggestion = {
  geonameId: number;
  name: string;
  countryName: string;
  countryCode: string;
  adminName1?: string;
  lat: number;
  lng: number;
};

type LocationResult = {
  city: string;
  country: string;
  countryCode: string;
};

const AUTO_DETECT_FALLBACK_MESSAGE =
  "Unable to determine location automatically. Search manually.";

const EMPTY_SETTINGS: PrayerSettingsState = {
  cityName: "",
  country: "",
  countryCode: "",
  hijriDateAdjustment: DEFAULT_HIJRI_DATE_ADJUSTMENT,
  method: "",
  showHomepageSeoContent: DEFAULT_SHOW_HOMEPAGE_SEO_CONTENT,
  school: "",
};
const DEV_MENU_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_MENU !== "0";
const DEFAULT_FEATURE_FLAGS = resolveFeatureFlags();

function getInitialSettings(): PrayerSettingsState {
  if (typeof window === "undefined") {
    return EMPTY_SETTINGS;
  }

  const savedSettings = localStorage.getItem("prayerSettings");

  if (!savedSettings) {
    return EMPTY_SETTINGS;
  }

  try {
    const parsed = JSON.parse(savedSettings) as Partial<PrayerSettingsState>;

    return {
      cityName: parsed.cityName ?? "",
      country: parsed.country ?? "",
      countryCode: parsed.countryCode ?? "",
      hijriDateAdjustment: normalizeHijriDateAdjustmentValue(
        parsed.hijriDateAdjustment,
      ),
      method: parsed.method ?? "",
      showHomepageSeoContent: normalizeShowHomepageSeoContent(
        parsed.showHomepageSeoContent,
      ),
      school: parsed.school ?? "",
    };
  } catch {
    return EMPTY_SETTINGS;
  }
}

function getInitialFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") {
    return DEFAULT_FEATURE_FLAGS;
  }

  const overrides = readClientFeatureOverrides();
  return resolveFeatureFlags(overrides);
}

function getInitialDashboardView(): PrayerDashboardView {
  return readPrayerDashboardViewFromStorage();
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }

  return data;
}

function SuggestionsSkeleton({ withCode = false }: { withCode?: boolean }) {
  return (
    <div className="bg-popover absolute top-full left-0 z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border p-1 shadow-md">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="flex items-start justify-between rounded-lg px-2.5 py-2"
          key={index}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-4 w-2/5 animate-pulse rounded bg-muted/80" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-muted/70" />
          </div>
          {withCode ? (
            <div className="ml-2 h-5 w-10 animate-pulse rounded-md bg-muted/70" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

type SettingsRouteClientProps = {
  activePanel: SettingsPanelId;
};

export function SettingsRouteClient({ activePanel }: SettingsRouteClientProps) {
  const router = useRouter();
  const [isResettingDefaults, startResetDefaultsTransition] = useTransition();
  const [settings, setSettings] =
    useState<PrayerSettingsState>(getInitialSettings);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    getInitialFeatureFlags,
  );
  const [dashboardView, setDashboardView] = useState<PrayerDashboardView>(
    getInitialDashboardView,
  );
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityFocused, setCityFocused] = useState(false);
  const [cityInteracted, setCityInteracted] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<"gps" | "ip" | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<LocalNotificationPermission>(getLocalNotificationPermission);
  const [sendingMockNotification, setSendingMockNotification] = useState(false);
  const [mockNotificationStatus, setMockNotificationStatus] = useState<
    string | null
  >(null);
  const [mockNotificationError, setMockNotificationError] = useState<
    string | null
  >(null);

  useEffect(() => {
    localStorage.setItem("prayerSettings", JSON.stringify(settings));
    document.cookie = createHomepageSeoContentCookie(
      settings.showHomepageSeoContent,
    );
  }, [settings]);

  useEffect(() => {
    const query = settings.cityName.trim();

    if (!cityFocused || !cityInteracted || query.length < 2) {
      setCitySuggestions([]);
      setCityLoading(false);
      setCitySearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setCityLoading(true);
        setCitySuggestions([]);
        setCitySearchError(null);
        const params = new URLSearchParams({
          kind: "city",
          q: query,
        });

        if (settings.countryCode) {
          params.set("countryCode", settings.countryCode);
        }

        const data = await fetchJson<{ items: CitySuggestion[] }>(
          `/api/places/suggest?${params.toString()}`,
          controller.signal,
        );

        setCitySuggestions(data.items);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCitySuggestions([]);
          setCitySearchError(
            error instanceof Error ? error.message : "City search failed",
          );
        }
      } finally {
        setCityLoading(false);
      }
    }, 240);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [cityFocused, cityInteracted, settings.cityName, settings.countryCode]);

  useEffect(() => {
    if (!DEV_MENU_ENABLED || typeof window === "undefined") {
      return;
    }

    const syncPermission = () => {
      setNotificationPermission(getLocalNotificationPermission());
    };

    syncPermission();
    window.addEventListener("focus", syncPermission);
    document.addEventListener("visibilitychange", syncPermission);

    return () => {
      window.removeEventListener("focus", syncPermission);
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  const availablePanels = useMemo<SettingsPanelId[]>(() => {
    const panels: SettingsPanelId[] = featureFlags.prayerTimings
      ? ["general", "prayers", "display", "features"]
      : ["features"];

    if (DEV_MENU_ENABLED) {
      panels.push("developer");
    }

    return panels;
  }, [featureFlags.prayerTimings]);
  const fallbackPanel = availablePanels[0] ?? "features";
  const resolvedActivePanel = availablePanels.includes(activePanel)
    ? activePanel
    : fallbackPanel;

  useEffect(() => {
    if (resolvedActivePanel === activePanel) {
      return;
    }

    router.replace(getSettingsPanelPath(resolvedActivePanel));
  }, [activePanel, resolvedActivePanel, router]);

  const applyResolvedLocation = (location: LocationResult) => {
    const resolvedCity = location.city.trim();

    if (resolvedCity.length < 2) {
      setLocationStatus(null);
      setLocationError(AUTO_DETECT_FALLBACK_MESSAGE);
      return;
    }

    setSettings((prev) => ({
      ...prev,
      cityName: resolvedCity,
      country: location.country,
      countryCode: location.countryCode,
    }));
    setLocationError(null);
    setLocationStatus(
      `Location updated to ${resolvedCity}, ${location.country}.`,
    );
  };

  const resolveFromGps = () => {
    if (!("geolocation" in navigator)) {
      setLocationError(AUTO_DETECT_FALLBACK_MESSAGE);
      setLocationStatus(null);
      return;
    }

    setResolving("gps");
    setLocationStatus(null);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lng: String(position.coords.longitude),
          });

          const data = await fetchJson<LocationResult>(
            `/api/places/reverse?${params.toString()}`,
          );

          applyResolvedLocation(data);
        } catch {
          setLocationError(AUTO_DETECT_FALLBACK_MESSAGE);
        } finally {
          setResolving(null);
        }
      },
      () => {
        setLocationError(AUTO_DETECT_FALLBACK_MESSAGE);
        setResolving(null);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  };

  const resolveFromIp = async () => {
    setResolving("ip");
    setLocationStatus(null);
    setLocationError(null);

    try {
      const data = await fetchJson<LocationResult>("/api/places/from-ip");
      applyResolvedLocation(data);
    } catch {
      setLocationError(AUTO_DETECT_FALLBACK_MESSAGE);
    } finally {
      setResolving(null);
    }
  };

  const selectCitySuggestion = (city: CitySuggestion) => {
    setCityInteracted(false);
    setSettings((prev) => ({
      ...prev,
      cityName: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
    }));
    setLocationError(null);
    setLocationStatus(null);
    setCitySuggestions([]);
    setCityFocused(false);
  };

  const changeDashboardView = (value: PrayerDashboardView) => {
    setDashboardView(value);
    writePrayerDashboardViewToStorage(value);
  };

  const resetSettingsToDefaults = () => {
    setLocationError(null);
    setLocationStatus(null);
    setCitySearchError(null);
    setCitySuggestions([]);
    setMockNotificationStatus(null);
    setMockNotificationError(null);

    startResetDefaultsTransition(() => {
      resetBannerPreferencesToDefaults();
      writeClientFeatureOverrides({});
      setFeatureFlags(DEFAULT_FEATURE_FLAGS);
      setSettings(EMPTY_SETTINGS);
      setDashboardView("cards");
      writePrayerDashboardViewToStorage("cards");
      router.refresh();
    });
  };

  const requestDevNotificationPermission = async () => {
    setMockNotificationStatus(null);
    setMockNotificationError(null);

    if (notificationPermission === "unsupported") {
      setMockNotificationError(
        "Notifications are not supported on this device.",
      );
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationPermission(result);

    if (result === "granted") {
      setMockNotificationStatus("Notification permission granted.");
      return;
    }

    setMockNotificationError(
      "Permission not granted. Enable notifications to test.",
    );
  };

  const sendMockNotification = async () => {
    setMockNotificationStatus(null);
    setMockNotificationError(null);

    const currentPermission = getLocalNotificationPermission();
    setNotificationPermission(currentPermission);

    if (currentPermission === "unsupported") {
      setMockNotificationError(
        "Notifications are not supported on this device.",
      );
      return;
    }

    if (currentPermission !== "granted") {
      setMockNotificationError(
        "Grant notification permission before sending a test.",
      );
      return;
    }

    setSendingMockNotification(true);

    try {
      await showLocalNotification({
        title: "Mock prayer reminder",
        body: "This is a device test notification from the developer menu.",
        tag: `mock-prayer-reminder-${Date.now()}`,
      });
      setMockNotificationStatus(
        "Mock notification sent. Check your notification center on this device.",
      );
    } catch (error) {
      setMockNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to send a mock notification.",
      );
    } finally {
      setSendingMockNotification(false);
    }
  };

  const showCitySuggestions = cityFocused && citySuggestions.length > 0;
  const notificationPermissionLabel =
    notificationPermission === "unsupported"
      ? "Unsupported"
      : notificationPermission === "granted"
        ? "Granted"
        : notificationPermission === "denied"
          ? "Denied"
          : "Default";
  const selectedMethodLabel =
    calculationMethods.find((method) => method.value === settings.method)
      ?.label ?? "Method not selected";
  const selectedSchoolLabel =
    schools.find((school) => school.value === settings.school)?.label ??
    "School not selected";
  const selectedDashboardViewLabel =
    dashboardViewOptions.find((option) => option.value === dashboardView)
      ?.label ?? "View not selected";
  const selectedHijriAdjustmentLabel =
    HIJRI_DATE_ADJUSTMENT_OPTIONS.find(
      (option) => option.value === settings.hijriDateAdjustment,
    )?.label ?? "No adjustment";
  const homepageSeoContentLabel = settings.showHomepageSeoContent
    ? "SEO cards visible"
    : "SEO cards hidden";
  const generalLocationSummary =
    settings.cityName && settings.country
      ? `${settings.cityName}, ${settings.country}`
      : settings.cityName
        ? settings.cityName
        : "City not set";
  const menuItems: SettingsMenuItem[] = [
    ...(featureFlags.prayerTimings
      ? [
          {
            id: "general" as const,
            label: "General",
            description: "Location and automatic detection.",
            summary: `${generalLocationSummary} / ${homepageSeoContentLabel}`,
            icon: Sparkles,
          },
          {
            id: "prayers" as const,
            label: "Prayers",
            description: "Method and school selection.",
            summary: selectedSchoolLabel,
            icon: MapPin,
          },
          {
            id: "display" as const,
            label: "Display",
            description: "Dashboard and Hijri date behavior.",
            summary: `${selectedDashboardViewLabel} / ${selectedHijriAdjustmentLabel}`,
            icon: SlidersHorizontal,
          },
        ]
      : []),
    {
      id: "features",
      label: "Features",
      description: "Feature flag modules and app toggles.",
      summary: `Prayer timings: ${featureFlags.prayerTimings ? "Enabled" : "Disabled"}`,
      icon: Search,
    },
    ...(DEV_MENU_ENABLED
      ? [
          {
            id: "developer" as const,
            label: "Developer",
            description: "Notification permission and local tests.",
            summary: `Notification: ${notificationPermissionLabel}`,
            icon: FlaskConical,
          },
        ]
      : []),
  ];
  const panelMeta: Record<
    SettingsPanelId,
    { description: string; title: string }
  > = {
    general: {
      title: "General",
      description: "Manage location and automatic device detection.",
    },
    prayers: {
      title: "Prayers",
      description: "Set calculation method and fiqh school for prayer times.",
    },
    display: {
      title: "Display",
      description: "Control dashboard layout and Hijri date adjustment.",
    },
    features: {
      title: "Features",
      description: "Toggle product modules and advanced capabilities.",
    },
    developer: {
      title: "Developer",
      description: "Notification permission and test delivery helpers.",
    },
  };
  const activePanelMeta = panelMeta[resolvedActivePanel];
  const activePanelIndex = menuItems.findIndex(
    (item) => item.id === resolvedActivePanel,
  );
  const previousPanelItem =
    activePanelIndex > 0 ? menuItems[activePanelIndex - 1] : null;
  const nextPanelItem =
    activePanelIndex >= 0 && activePanelIndex < menuItems.length - 1
      ? menuItems[activePanelIndex + 1]
      : null;

  return (
    <section className="space-y-5 md:space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage prayer timings, display behavior, and feature access. Changes
          save automatically.
        </p>
      </header>

      <div className="space-y-2.5 md:hidden">
        <nav aria-label="Settings categories" className="grid gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const selected = resolvedActivePanel === item.id;

            return (
              <Link
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring/50 flex min-h-14 items-center justify-between gap-3 rounded-md border px-3 py-2.5 outline-none transition-colors focus-visible:ring-[3px]",
                  selected
                    ? "border-border bg-accent/70 text-foreground"
                    : "border-border/70 bg-card/80 hover:bg-accent/45",
                )}
                href={getSettingsPanelPath(item.id)}
                key={item.id}
                title={item.description}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.summary}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </nav>

        {!featureFlags.prayerTimings ? (
          <p className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
            Prayer settings are hidden while Prayer Timings is disabled in
            Features.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-[17rem_minmax(0,1fr)] ">
        <aside className="hidden self-start md:sticky md:top-24 md:block">
          <CardContent className="p-0!">
            <nav aria-label="Settings categories" className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const selected = resolvedActivePanel === item.id;

                return (
                  <Link
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "focus-visible:ring-ring/50 block w-full rounded-sm border px-3 py-2 text-left outline-none transition-colors focus-visible:ring-[3px]",
                      selected
                        ? "border-border bg-accent/70 text-foreground"
                        : "border-transparent hover:bg-accent/45",
                    )}
                    href={getSettingsPanelPath(item.id)}
                    key={item.id}
                    title={item.description}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.summary}
                          </span>
                        </span>
                      </span>
                      <ChevronRight
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          selected
                            ? "translate-x-0.5 text-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    </span>
                  </Link>
                );
              })}
            </nav>

            {!featureFlags.prayerTimings ? (
              <p className="mt-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
                Prayer settings are hidden while Prayer Timings is disabled in
                Features.
              </p>
            ) : null}
          </CardContent>
        </aside>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_1px_1px_color-mix(in_oklab,var(--foreground)_8%,transparent),0_8px_18px_-16px_color-mix(in_oklab,var(--foreground)_24%,transparent)] sm:p-6">
          <header className="border-b border-border/70 pb-4">
            <h2 className="text-xl font-semibold sm:text-2xl">
              {activePanelMeta.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activePanelMeta.description}
            </p>
            <div className="mt-3 flex gap-2 md:hidden">
              <Button
                asChild={Boolean(previousPanelItem)}
                className="flex-1 justify-start"
                size="sm"
                type="button"
                variant="outline"
              >
                {previousPanelItem ? (
                  <Link href={getSettingsPanelPath(previousPanelItem.id)}>
                    <ChevronLeft className="size-4" />
                    {previousPanelItem.label}
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="size-4" />
                    Previous
                  </span>
                )}
              </Button>
              <Button
                asChild={Boolean(nextPanelItem)}
                className="flex-1 justify-end"
                size="sm"
                type="button"
                variant="outline"
              >
                {nextPanelItem ? (
                  <Link href={getSettingsPanelPath(nextPanelItem.id)}>
                    {nextPanelItem.label}
                    <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span>
                    Next
                    <ChevronRight className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </header>

          <div className="pt-5">
            {resolvedActivePanel === "general" ? (
              featureFlags.prayerTimings ? (
                <div className="space-y-6">
                  {locationError ? (
                    <p className="rounded-md border border-destructive/35 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                      {locationError}
                    </p>
                  ) : null}
                  <section className="flex flex-col gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">Manual Location</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Search and select your city. Country is filled
                        automatically from the selected city.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <div className="relative space-y-2">
                        <label
                          className="text-sm font-medium text-foreground"
                          htmlFor="cityName"
                        >
                          City
                        </label>
                        <p className="text-xs leading-5 text-muted-foreground">
                          Used to match your nearest city timetable and
                          timezone.
                        </p>
                        <div className="relative">
                          <input
                            autoComplete="off"
                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-10 w-full rounded-md border bg-background px-3 py-2.5 pr-10 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                            id="cityName"
                            name="cityName"
                            onBlur={() => {
                              window.setTimeout(
                                () => setCityFocused(false),
                                120,
                              );
                            }}
                            onChange={(event) => {
                              setCityInteracted(true);
                              setSettings((prev) => ({
                                ...prev,
                                cityName: event.target.value,
                                country: "",
                                countryCode: "",
                              }));
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                citySuggestions.length > 0
                              ) {
                                event.preventDefault();
                                selectCitySuggestion(citySuggestions[0]);
                              }
                            }}
                            onFocus={() => setCityFocused(true)}
                            placeholder="Start typing your city..."
                            required
                            type="text"
                            value={settings.cityName}
                          />
                          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />

                          {cityFocused && cityLoading ? (
                            <SuggestionsSkeleton withCode />
                          ) : null}

                          {showCitySuggestions ? (
                            <div className="bg-popover absolute top-full left-0 z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border p-1 shadow-md">
                              {citySuggestions.map((city) => (
                                <button
                                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-start justify-between rounded-md px-2.5 py-2 text-left transition-colors"
                                  key={city.geonameId}
                                  onMouseDown={() => selectCitySuggestion(city)}
                                  type="button"
                                >
                                  <div className="min-w-0">
                                    <p className="break-words text-sm leading-snug font-medium">
                                      {city.name}
                                    </p>
                                    <p className="break-words text-sm text-muted-foreground">
                                      {[city.adminName1, city.countryName]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                  </div>
                                  <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                    {city.countryCode}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {citySearchError ? (
                          <div className="min-h-5">
                            <p className="text-sm text-destructive">
                              {citySearchError}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col gap-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">
                        Auto Detect Location
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Use GPS or IP lookup to fill city and country quickly.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        disabled={resolving !== null}
                        onClick={resolveFromGps}
                        size="sm"
                        className="rounded-sm"
                        type="button"
                        variant="outline"
                      >
                        <LocateFixed className="size-4" />
                        {resolving === "gps" ? "Getting GPS..." : "Use GPS"}
                      </Button>
                      <Button
                        disabled={resolving !== null}
                        onClick={() => void resolveFromIp()}
                        size="sm"
                        className="rounded-sm"
                        type="button"
                        variant="outline"
                      >
                        <MapPin className="size-4" />
                        {resolving === "ip" ? "Checking IP..." : "Use IP"}
                      </Button>
                    </div>
                    {locationStatus ? (
                      <p className="text-sm text-primary">{locationStatus}</p>
                    ) : null}
                  </section>

                  <section className="pt-5 border-t flex items-center">
                    <div className="mb-1">
                      <h3 className="text-sm font-semibold">
                        Homepage SEO Content
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Show or hide the homepage &quot;What Each Setting
                        Means&quot; and FAQ sections in this browser.
                      </p>
                    </div>

                    <Switch
                      aria-label="Toggle homepage SEO content sections"
                      checked={settings.showHomepageSeoContent}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          showHomepageSeoContent: checked,
                        }))
                      }
                    />
                  </section>

                  <section className="border-t pt-5">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-destructive">
                        Danger Zone
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Reset all settings to defaults. This clears your
                        location, method, dashboard view, feature toggles, and
                        homepage SEO content preference.
                      </p>
                    </div>
                    <Button
                      disabled={isResettingDefaults}
                      onClick={resetSettingsToDefaults}
                      size="sm"
                      type="button"
                      className="rounded-sm items-center"
                      variant="destructive"
                    >
                      {isResettingDefaults
                        ? "Resetting..."
                        : "Reset to default settings"}
                    </Button>
                  </section>
                </div>
              ) : (
                <p className="rounded-xl border border-border/80 bg-muted/25 px-3 py-2 text-sm leading-6 text-muted-foreground">
                  Prayer Timings is disabled. Turn it on in Features to manage
                  location settings.
                </p>
              )
            ) : null}

            {resolvedActivePanel === "prayers" ? (
              featureFlags.prayerTimings ? (
                <div className="space-y-5">
                  <section>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold">
                        Calculation Method
                      </h3>
                      <p className="text-sm  text-muted-foreground">
                        Choose the authority and angle rules used to calculate
                        prayer times.
                      </p>
                    </div>
                    <div className="max-w-2xl space-y-4">
                      <Select
                        key={settings.method}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, method: value }))
                        }
                        value={settings.method || undefined}
                      >
                        <SelectTrigger className="min-h-10">
                          <SelectValue placeholder="Select calculation method" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {calculationMethods.map((method) => (
                            <SelectItem
                              className="h-auto whitespace-normal py-2 leading-snug"
                              key={method.value}
                              value={method.value}
                            >
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                        <p>
                          Current method:{" "}
                          <span className="font-medium text-foreground">
                            {selectedMethodLabel}
                          </span>
                        </p>
                        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                          <p className="text-sm font-semibold text-foreground">
                            Quick Method Guide
                          </p>
                          <p className="text-sm leading-6">
                            These presets mostly change Fajr and Isha timing
                            rules. Use the one your local masjid follows.
                          </p>
                          <ul className="space-y-2">
                            {calculationMethods.map((method) => (
                              <li key={method.value}>
                                <span className="font-semibold text-foreground">
                                  {method.label}:
                                </span>{" "}
                                {method.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold">School</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        School mainly affects Asr timing boundaries. Pick the
                        setting your local masjid follows.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {schools.map((school) => {
                        const selected = settings.school === school.value;

                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-accent text-foreground"
                                : "border-input text-muted-foreground hover:bg-accent",
                            )}
                            htmlFor={`school-${school.value}`}
                            key={school.value}
                          >
                            <span className="min-w-0">
                              <span className="block font-medium text-foreground">
                                {school.label}
                              </span>
                              <span className="mt-1 block break-words text-xs leading-5 text-muted-foreground">
                                {school.description}
                              </span>
                            </span>
                            <input
                              checked={selected}
                              className="sr-only"
                              id={`school-${school.value}`}
                              name="school"
                              onChange={(event) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  school: event.target.value,
                                }))
                              }
                              type="radio"
                              value={school.value}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </section>
                </div>
              ) : (
                <p className="rounded-xl border border-border/80 bg-muted/25 px-3 py-2 text-sm leading-6 text-muted-foreground">
                  Prayer Timings is disabled. Turn it on in Features to manage
                  prayer rules.
                </p>
              )
            ) : null}

            {resolvedActivePanel === "display" ? (
              featureFlags.prayerTimings ? (
                <div className="space-y-5">
                  <section>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold">
                        Dashboard Layout
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Choose how prayer data appears on your homepage.
                      </p>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {dashboardViewOptions.map((option) => {
                        const selected = dashboardView === option.value;

                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-accent text-foreground"
                                : "border-input text-muted-foreground hover:bg-accent",
                            )}
                            htmlFor={`dashboard-view-${option.value}`}
                            key={option.value}
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {option.label}
                              </p>
                              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                            <input
                              checked={selected}
                              className="sr-only"
                              id={`dashboard-view-${option.value}`}
                              name="dashboardView"
                              onChange={() => changeDashboardView(option.value)}
                              type="radio"
                              value={option.value}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold">
                        Hijri Date Adjustment
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Use this only when your local moon-sighting differs from
                        the default date.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {HIJRI_DATE_ADJUSTMENT_OPTIONS.map((option) => {
                        const selected =
                          settings.hijriDateAdjustment === option.value;

                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-accent text-foreground"
                                : "border-input text-muted-foreground hover:bg-accent",
                            )}
                            htmlFor={`hijri-date-adjustment-${option.value}`}
                            key={option.value}
                          >
                            <span className="min-w-0">
                              <span className="block font-medium text-foreground">
                                {option.label}
                              </span>
                              <span className="mt-1 block break-words text-xs leading-5 text-muted-foreground">
                                {option.description}
                              </span>
                            </span>
                            <input
                              checked={selected}
                              className="sr-only"
                              id={`hijri-date-adjustment-${option.value}`}
                              name="hijriDateAdjustment"
                              onChange={(event) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  hijriDateAdjustment: event.target.value,
                                }))
                              }
                              type="radio"
                              value={option.value}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </section>
                </div>
              ) : (
                <p className="rounded-xl border border-border/80 bg-muted/25 px-3 py-2 text-sm leading-6 text-muted-foreground">
                  Prayer Timings is disabled. Turn it on in Features to manage
                  display settings.
                </p>
              )
            ) : null}

            {resolvedActivePanel === "features" ? (
              <FeatureSettingsCard onFeatureFlagsChange={setFeatureFlags} />
            ) : null}

            {resolvedActivePanel === "developer" && DEV_MENU_ENABLED ? (
              <div className="space-y-4 rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    notificationPermission === "granted"
                      ? "text-primary"
                      : notificationPermission === "denied"
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  Permission: {notificationPermissionLabel}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    disabled={notificationPermission === "unsupported"}
                    onClick={() => void requestDevNotificationPermission()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BellRing className="size-4" />
                    Request permission
                  </Button>
                  <Button
                    disabled={
                      sendingMockNotification ||
                      notificationPermission === "unsupported"
                    }
                    onClick={() => void sendMockNotification()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <FlaskConical className="size-4" />
                    {sendingMockNotification
                      ? "Sending notification..."
                      : "Send mock notification"}
                  </Button>
                </div>

                {mockNotificationStatus ? (
                  <p className="text-sm text-primary">
                    {mockNotificationStatus}
                  </p>
                ) : null}
                {mockNotificationError ? (
                  <p className="text-sm text-destructive">
                    {mockNotificationError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
