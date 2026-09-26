"use client";

import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";

const themeOptions: ReadonlyArray<{ icon: LucideIcon; label: string; value: string }> = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function AppearanceSetting() {
  const { setTheme, theme = "system" } = useTheme();

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-sm font-semibold" id="appearance-heading">
          Appearance
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          System follows your phone&apos;s light or dark mode.
        </p>
      </div>

      <div
        aria-labelledby="appearance-heading"
        className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
        role="radiogroup"
      >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;

          return (
            <button
              aria-checked={selected}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={option.value}
              onClick={() => setTheme(option.value)}
              role="radio"
              type="button"
            >
              <Icon aria-hidden className="size-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
