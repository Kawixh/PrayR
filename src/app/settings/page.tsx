"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BellRing,
  FlaskConical,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getLocalNotificationPermission,
  type LocalNotificationPermission,
  showLocalNotification,
} from "../_utils/local-notifications";

const calculationMethods = [
  { value: "0", label: "Jafari / Shia Ithna-Ashari" },
  { value: "1", label: "University of Islamic Sciences, Karachi" },
  { value: "2", label: "Islamic Society of North America" },
  { value: "3", label: "Muslim World League" },
  { value: "4", label: "Umm Al-Qura University, Makkah" },
  { value: "5", label: "Egyptian General Authority of Survey" },
  { value: "7", label: "Institute of Geophysics, University of Tehran" },
  { value: "8", label: "Gulf Region" },
  { value: "9", label: "Kuwait" },
  { value: "10", label: "Qatar" },
  { value: "11", label: "Majlis Ugama Islam Singapura, Singapore" },
  { value: "12", label: "Union Organization islamic de France" },
  { value: "13", label: "Diyanet İşleri Başkanlığı, Turkey" },
  { value: "14", label: "Spiritual Administration of Muslims of Russia" },
  {
    value: "15",
    label: "Moonsighting Committee Worldwide (requires shafaq parameter)",
  },
  { value: "16", label: "Dubai (experimental)" },
  { value: "17", label: "Jabatan Kemajuan Islam Malaysia (JAKIM)" },
  { value: "18", label: "Tunisia" },
  { value: "19", label: "Algeria" },
  { value: "20", label: "KEMENAG - Kementerian Agama Republik Indonesia" },
  { value: "21", label: "Morocco" },
  { value: "22", label: "Comunidade Islamica de Lisboa" },
  {
    value: "23",
    label: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan",
  },
];

const schools = [
  { value: "0", label: "Shafi (general Sunni school)" },
  { value: "1", label: "Hanafi" },
];

type PrayerSettingsState = {
  cityName: string;
  country: string;
  countryCode: string;
  method: string;
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

type CountrySuggestion = {
  countryCode: string;
  countryName: string;
};

type LocationResult = {
  city: string;
  country: string;
  countryCode: string;
};

type ComboValidationResponse = {
  valid: boolean;
  warning?: string;
  normalizedCountry?: string;
  countryCode?: string;
};

const EMPTY_SETTINGS: PrayerSettingsState = {
  cityName: "",
  country: "",
  countryCode: "",
  method: "",
  school: "",
};
const DEV_MENU_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ENABLE_DEV_MENU === "1";

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
      method: parsed.method ?? "",
      school: parsed.school ?? "",
    };
  } catch {
    return EMPTY_SETTINGS;
  }
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
    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-lg">
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

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrayerSettingsState>(getInitialSettings);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [countrySuggestions, setCountrySuggestions] = useState<
    CountrySuggestion[]
  >([]);
  const [cityFocused, setCityFocused] = useState(false);
  const [countryFocused, setCountryFocused] = useState(false);
  const [cityInteracted, setCityInteracted] = useState(false);
  const [countryInteracted, setCountryInteracted] = useState(false);
  const [locationOptionsChanged, setLocationOptionsChanged] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);
  const [countrySearchError, setCountrySearchError] = useState<string | null>(
    null,
  );
  const [comboValidation, setComboValidation] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [comboWarning, setComboWarning] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<"gps" | "ip" | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<LocalNotificationPermission>(getLocalNotificationPermission);
  const [sendingMockNotification, setSendingMockNotification] = useState(false);
  const [isDevMenuExpanded, setIsDevMenuExpanded] = useState(false);
  const [mockNotificationStatus, setMockNotificationStatus] = useState<
    string | null
  >(null);
  const [mockNotificationError, setMockNotificationError] = useState<
    string | null
  >(null);

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
    const query = settings.country.trim();

    if (!countryFocused || !countryInteracted || query.length < 1) {
      setCountrySuggestions([]);
      setCountryLoading(false);
      setCountrySearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setCountryLoading(true);
        setCountrySuggestions([]);
        setCountrySearchError(null);
        const params = new URLSearchParams({
          kind: "country",
          q: query,
        });

        const data = await fetchJson<{ items: CountrySuggestion[] }>(
          `/api/places/suggest?${params.toString()}`,
          controller.signal,
        );

        setCountrySuggestions(data.items);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCountrySuggestions([]);
          setCountrySearchError(
            error instanceof Error ? error.message : "Country search failed",
          );
        }
      } finally {
        setCountryLoading(false);
      }
    }, 240);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [countryFocused, countryInteracted, settings.country]);

  useEffect(() => {
    if (!locationOptionsChanged) {
      return;
    }

    const city = settings.cityName.trim();
    const country = settings.country.trim();

    if (city.length < 2 || country.length < 2) {
      setComboValidation("idle");
      setComboWarning(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setComboValidation("checking");
        setComboWarning(null);

        const params = new URLSearchParams({
          city,
          country,
        });

        if (settings.countryCode) {
          params.set("countryCode", settings.countryCode);
        }

        const data = await fetchJson<ComboValidationResponse>(
          `/api/places/validate?${params.toString()}`,
          controller.signal,
        );

        if (!data.valid) {
          setComboValidation("invalid");
          setComboWarning(
            data.warning ?? "City and country combination does not match.",
          );
          return;
        }

        setComboValidation("valid");
        setComboWarning(null);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setComboValidation("invalid");
        setComboWarning(
          error instanceof Error ? error.message : "Validation failed",
        );
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [locationOptionsChanged, settings.cityName, settings.country, settings.countryCode]);

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

  const applyResolvedLocation = (location: LocationResult) => {
    setLocationOptionsChanged(true);
    setSettings((prev) => ({
      ...prev,
      cityName: location.city,
      country: location.country,
      countryCode: location.countryCode,
    }));
    setLocationError(null);
    setLocationStatus(`Location updated to ${location.city}, ${location.country}.`);
  };

  const resolveFromGps = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not available on this device.");
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
        } catch (error) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "Unable to resolve location from GPS.",
          );
        } finally {
          setResolving(null);
        }
      },
      (error) => {
        setLocationError(error.message || "Unable to access GPS location.");
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
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to resolve location from IP address.",
      );
    } finally {
      setResolving(null);
    }
  };

  const selectCitySuggestion = (city: CitySuggestion) => {
    setLocationOptionsChanged(true);
    setCityInteracted(false);
    setCountryInteracted(false);
    setSettings((prev) => ({
      ...prev,
      cityName: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
    }));
    setComboValidation("valid");
    setComboWarning(null);
    setCitySuggestions([]);
    setCountrySuggestions([]);
    setCityFocused(false);
    setCountryFocused(false);
  };

  const selectCountrySuggestion = (country: CountrySuggestion) => {
    setLocationOptionsChanged(true);
    setCountryInteracted(false);
    setCityInteracted(false);
    setSettings((prev) => ({
      ...prev,
      cityName: "",
      country: country.countryName,
      countryCode: country.countryCode,
    }));
    setComboValidation("idle");
    setComboWarning(null);
    setCountrySuggestions([]);
    setCountryFocused(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const city = settings.cityName.trim();
    const country = settings.country.trim();

    if (!city || !country) {
      setComboValidation("invalid");
      setComboWarning("City and country are required.");
      return;
    }

    try {
      setComboValidation("checking");
      const params = new URLSearchParams({
        city,
        country,
      });

      if (settings.countryCode) {
        params.set("countryCode", settings.countryCode);
      }

      const data = await fetchJson<ComboValidationResponse>(
        `/api/places/validate?${params.toString()}`,
      );

      if (!data.valid) {
        setComboValidation("invalid");
        setComboWarning(
          data.warning ?? "City and country combination does not match.",
        );
        return;
      }

      setComboValidation("valid");
      setComboWarning(null);
    } catch (error) {
      setComboValidation("invalid");
      setComboWarning(
        error instanceof Error ? error.message : "Validation failed",
      );
      return;
    }

    localStorage.setItem("prayerSettings", JSON.stringify(settings));
    router.push("/");
  };

  const requestDevNotificationPermission = async () => {
    setMockNotificationStatus(null);
    setMockNotificationError(null);

    if (notificationPermission === "unsupported") {
      setMockNotificationError("Notifications are not supported on this device.");
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationPermission(result);

    if (result === "granted") {
      setMockNotificationStatus("Notification permission granted.");
      return;
    }

    setMockNotificationError("Permission not granted. Enable notifications to test.");
  };

  const sendMockNotification = async () => {
    setMockNotificationStatus(null);
    setMockNotificationError(null);

    const currentPermission = getLocalNotificationPermission();
    setNotificationPermission(currentPermission);

    if (currentPermission === "unsupported") {
      setMockNotificationError("Notifications are not supported on this device.");
      return;
    }

    if (currentPermission !== "granted") {
      setMockNotificationError("Grant notification permission before sending a test.");
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
  const showCountrySuggestions = countryFocused && countrySuggestions.length > 0;
  const notificationPermissionLabel =
    notificationPermission === "unsupported"
      ? "Unsupported"
      : notificationPermission === "granted"
        ? "Granted"
        : notificationPermission === "denied"
          ? "Denied"
          : "Default";

  return (
    <section className="space-y-5">
      <header className="glass-panel rounded-3xl p-5 sm:p-6">
        <p className="soft-chip inline-flex">Profile</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Prayer Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Search city and country with GeoNames autocomplete, or optionally use
          your GPS/IP location for faster setup. GPS resolves to city-level
          names.
        </p>
      </header>

      <Card className="glass-panel border-border/80 p-5 sm:p-6">
        <div className="mb-5 rounded-2xl border border-border/70 bg-background/45 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="font-display text-2xl">Quick location setup</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional: GPS now prioritizes the nearest city (not local area),
                and IP lookup falls back across providers for better reliability.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 lg:w-auto">
              <Button
                className="min-h-10 w-full rounded-full px-4 py-2.5 text-center [overflow-wrap:anywhere] lg:w-auto"
                disabled={resolving !== null}
                onClick={resolveFromGps}
                size="sm"
                type="button"
                variant="outline"
              >
                <LocateFixed className="size-4" />
                {resolving === "gps" ? "Getting GPS..." : "Use GPS"}
              </Button>
              <Button
                className="min-h-10 w-full rounded-full px-4 py-2.5 text-center [overflow-wrap:anywhere] lg:w-auto"
                disabled={resolving !== null}
                onClick={() => void resolveFromIp()}
                size="sm"
                type="button"
                variant="outline"
              >
                <MapPin className="size-4" />
                {resolving === "ip" ? "Checking IP..." : "Use IP"}
              </Button>
            </div>
          </div>

          {locationStatus ? (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
              {locationStatus}
            </p>
          ) : null}
          {locationError ? (
            <p className="mt-2 text-sm text-destructive">{locationError}</p>
          ) : null}
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="relative space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="cityName">
                City
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  className="min-h-11 h-auto w-full rounded-xl border border-border/85 bg-background/80 px-3 py-3 pr-10 text-base leading-normal shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none"
                  id="cityName"
                  name="cityName"
                  onBlur={() => {
                    window.setTimeout(() => setCityFocused(false), 120);
                  }}
                  onChange={(event) => {
                    setCityInteracted(true);
                    setLocationOptionsChanged(true);
                    setSettings((prev) => ({
                      ...prev,
                      cityName: event.target.value,
                    }));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && citySuggestions.length > 0) {
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
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="min-h-5">
                {citySearchError ? (
                  <p className="text-sm text-destructive">{citySearchError}</p>
                ) : null}
              </div>

              {cityFocused && cityLoading ? <SuggestionsSkeleton withCode /> : null}

              {showCitySuggestions ? (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-lg">
                  {citySuggestions.map((city) => (
                    <button
                      className="flex w-full items-start justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent/50"
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

            <div className="relative space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="country">
                Country
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  className="min-h-11 h-auto w-full rounded-xl border border-border/85 bg-background/80 px-3 py-3 pr-10 text-base leading-normal shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none"
                  id="country"
                  name="country"
                  onBlur={() => {
                    window.setTimeout(() => setCountryFocused(false), 120);
                  }}
                  onChange={(event) => {
                    setCountryInteracted(true);
                    setLocationOptionsChanged(true);
                    setSettings((prev) => ({
                      ...prev,
                      cityName: "",
                      country: event.target.value,
                      countryCode: "",
                    }));
                  }}
                  onFocus={() => setCountryFocused(true)}
                  placeholder="Start typing your country..."
                  required
                  type="text"
                  value={settings.country}
                />
                <Sparkles className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {countryFocused && countryLoading ? (
                <SuggestionsSkeleton withCode />
              ) : null}

              <div className="min-h-5">
                {countrySearchError ? (
                  <p className="text-sm text-destructive">{countrySearchError}</p>
                ) : null}
              </div>
              <div className="min-h-5">
                {comboValidation === "checking" ? (
                  <p className="text-sm text-muted-foreground">
                    Checking city/country combination...
                  </p>
                ) : null}
                {comboWarning ? (
                  <p className="text-sm text-destructive">{comboWarning}</p>
                ) : null}
                {comboValidation === "valid" ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">
                    City and country combination looks good.
                  </p>
                ) : null}
              </div>

              {showCountrySuggestions ? (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-lg">
                  {countrySuggestions.map((country) => (
                    <button
                      className="flex w-full items-start justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent/50"
                      key={country.countryCode}
                      onMouseDown={() => selectCountrySuggestion(country)}
                      type="button"
                    >
                      <span className="break-words text-sm leading-snug font-medium">
                        {country.countryName}
                      </span>
                      <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {country.countryCode}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="method">
              Calculation Method
            </label>
            <Select
              key={settings.method}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, method: value }))
              }
              value={settings.method || undefined}
            >
              <SelectTrigger className="min-h-11 rounded-xl border-border/85 bg-background/80">
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
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">School</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {schools.map((school) => {
                const selected = settings.school === school.value;

                return (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                      selected
                        ? "border-primary/40 bg-primary/15 text-foreground"
                        : "border-border/80 bg-background/70 text-muted-foreground hover:border-border",
                    )}
                    htmlFor={`school-${school.value}`}
                    key={school.value}
                  >
                    <span>{school.label}</span>
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
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              asChild
              className="min-h-10 rounded-full border-border/85 px-5 py-2.5"
              type="button"
              variant="outline"
            >
              <Link href="/">Cancel</Link>
            </Button>
            <Button className="min-h-10 rounded-full px-6 py-2.5" type="submit">
              Save settings
            </Button>
          </div>
        </form>
      </Card>

      {DEV_MENU_ENABLED ? (
        <Card className="glass-panel border-border/80 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="soft-chip inline-flex">Developer</p>
              <h2 className="mt-3 font-display text-2xl">Dev menu</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Collapsed by default. Expand to run device notification tests.
              </p>
            </div>
            <Button
              className="min-h-9 rounded-full px-4 py-2"
              onClick={() => setIsDevMenuExpanded((prev) => !prev)}
              size="sm"
              type="button"
              variant="outline"
            >
              {isDevMenuExpanded ? "Minimize" : "Expand"}
            </Button>
          </div>

          {isDevMenuExpanded ? (
            <div className="mt-4">
              <p
                className={cn(
                  "text-sm font-medium",
                  notificationPermission === "granted"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : notificationPermission === "denied"
                      ? "text-destructive"
                      : "text-muted-foreground",
                )}
              >
                Permission: {notificationPermissionLabel}
              </p>

              <div className="mt-3 flex w-full flex-col gap-2 lg:w-auto">
                <Button
                  className="min-h-10 w-full rounded-full px-4 py-2.5 text-center [overflow-wrap:anywhere] lg:w-auto"
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
                  className="min-h-10 w-full rounded-full px-4 py-2.5 text-center [overflow-wrap:anywhere] lg:w-auto"
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
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">
                  {mockNotificationStatus}
                </p>
              ) : null}
              {mockNotificationError ? (
                <p className="mt-3 text-sm text-destructive">
                  {mockNotificationError}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}
    </section>
  );
}
