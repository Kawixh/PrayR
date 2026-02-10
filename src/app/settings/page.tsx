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
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  method: string;
  school: string;
};

function getInitialSettings(): PrayerSettingsState {
  if (typeof window === "undefined") {
    return {
      cityName: "",
      country: "",
      method: "",
      school: "",
    };
  }

  const savedSettings = localStorage.getItem("prayerSettings");

  if (!savedSettings) {
    return {
      cityName: "",
      country: "",
      method: "",
      school: "",
    };
  }

  try {
    const parsed = JSON.parse(savedSettings) as Partial<PrayerSettingsState>;

    return {
      cityName: parsed.cityName ?? "",
      country: parsed.country ?? "",
      method: parsed.method ?? "",
      school: parsed.school ?? "",
    };
  } catch {
    return {
      cityName: "",
      country: "",
      method: "",
      school: "",
    };
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrayerSettingsState>(
    getInitialSettings,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem("prayerSettings", JSON.stringify(settings));
    router.push("/");
  };

  return (
    <section className="space-y-5">
      <header className="glass-panel rounded-3xl p-5 sm:p-6">
        <p className="soft-chip inline-flex">Profile</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Prayer Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Set your location and prayer preferences once, then PrayR keeps daily
          timings in sync.
        </p>
      </header>

      <Card className="glass-panel border-border/80 p-5 sm:p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="cityName">
                City
              </label>
              <input
                className="h-11 w-full rounded-xl border border-border/85 bg-background/80 px-3 text-base shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none"
                id="cityName"
                name="cityName"
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    cityName: event.target.value,
                  }))
                }
                placeholder="e.g. Toronto"
                required
                type="text"
                value={settings.cityName}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="country">
                Country
              </label>
              <input
                className="h-11 w-full rounded-xl border border-border/85 bg-background/80 px-3 text-base shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none"
                id="country"
                name="country"
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    country: event.target.value,
                  }))
                }
                placeholder="e.g. Canada"
                required
                type="text"
                value={settings.country}
              />
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
              <SelectTrigger className="h-11 rounded-xl border-border/85 bg-background/80">
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
                      "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors",
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
              className="h-10 rounded-full border-border/85"
              type="button"
              variant="outline"
            >
              <Link href="/">Cancel</Link>
            </Button>
            <Button className="h-10 rounded-full px-6" type="submit">
              Save settings
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
