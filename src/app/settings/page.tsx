"use client";

import { Button } from "@/components/ui/button";
import LiquidGlass from "@/components/ui/liquid-glass";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themes } from "@/lib/themes";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
  { value: "0", label: "Shafi (or the general Sunni school)" },
  { value: "1", label: "Hanafi" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    cityName: "",
    country: "",
    method: "",
    school: "",
    theme: "flower", // Add theme to state, with a default
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("prayerSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("prayerSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleThemeSelect = (themeId: string) => {
    // Update the local state for the UI
    setSettings((prev) => ({ ...prev, theme: themeId }));
    // Temporarily update localStorage so ThemeManager can apply the preview
    localStorage.setItem(
      "prayerSettings",
      JSON.stringify({ ...settings, theme: themeId })
    );
    // Notify ThemeManager to apply the new theme immediately for the preview
    window.dispatchEvent(new Event("theme-changed"));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("prayerSettings", JSON.stringify(settings));
    router.push("/");
  };

  return (
    <div className="p-4 flex flex-col container max-w-full md:max-w-2xl lg:max-w-4xl mx-auto h-screen gap-10">
      <LiquidGlass className="w-full">
        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Settings</h1>

          <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div>
                <h2 className="text-lg font-bold mb-2">Select theme</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeSelect(theme.id)} // Use the new handler
                      className={`w-24 h-24 rounded-lg border-4 bg-cover bg-center transition-all duration-200 ${
                        settings.theme === theme.id
                          ? "border-blue-500 scale-105"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundImage: `url(${theme.image})` }}
                      aria-label={`Select ${theme.id} theme`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="cityName">City Name</label>
                <input
                  type="text"
                  id="cityName"
                  name="cityName"
                  value={settings.cityName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      cityName: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={settings.country}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="method">Calculation Method</label>
                <Select
                  key={settings.method}
                  value={settings.method || undefined}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      className="w-full"
                      placeholder="Select a calculation method"
                    />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {calculationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label>School</label>
                <div className="flex flex-col gap-2">
                  {schools.map((school) => (
                    <div key={school.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`school-${school.value}`}
                        name="school"
                        value={school.value}
                        checked={settings.school === school.value}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            school: e.target.value,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={`school-${school.value}`}
                        className="text-sm"
                      >
                        {school.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit">Save</Button>
            </form>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}
