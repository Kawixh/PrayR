"use client";

import { ModeToggle } from "@/components/theme-manager";
import { type FeatureFlags, type FeatureKey } from "@/features/definitions";
import { cn } from "@/lib/utils";
import {
  BookOpenText,
  Home,
  type LucideIcon,
  NotebookTabs,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
  featureKey?: FeatureKey;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Prayer Times",
    shortLabel: "Prayers",
    icon: Home,
    matches: (pathname: string) => pathname === "/",
    featureKey: "prayerTimings",
  },
  {
    href: "/adhkars",
    label: "Adhkars",
    icon: BookOpenText,
    matches: (pathname: string) => pathname.startsWith("/adhkars"),
    featureKey: "adhkars",
  },
  {
    href: "/resources",
    label: "Resources",
    icon: NotebookTabs,
    matches: (pathname: string) => pathname.startsWith("/resources"),
    featureKey: "resourcesTab",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    matches: (pathname: string) => pathname.startsWith("/settings"),
  },
];

export const Navbar = ({ featureFlags }: { featureFlags: FeatureFlags }) => {
  const pathname = usePathname();
  const visibleNavItems = useMemo(
    () =>
      navItems.filter(
        (item) => !item.featureKey || featureFlags[item.featureKey],
      ),
    [featureFlags],
  );

  return (
    <>
      <nav
        aria-label="Primary"
        className="sticky top-[calc(env(safe-area-inset-top)+0.35rem)] z-40 hidden md:block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_1px_1px_color-mix(in_oklab,var(--foreground)_8%,transparent),0_18px_36px_-30px_color-mix(in_oklab,var(--foreground)_42%,transparent)] backdrop-blur-md">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-0 h-full w-48 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative flex items-center gap-2.5 lg:gap-4">
            <ul className="flex min-w-0 flex-1 items-center justify-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matches(pathname);

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold tracking-tight transition-all duration-200",
                        isActive
                          ? "border-primary/30 bg-primary/12 text-primary"
                          : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-card hover:text-foreground",
                      )}
                      href={item.href}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="leading-none whitespace-nowrap">
                        {item.label}
                      </span>
                      {isActive ? (
                        <span
                          aria-hidden
                          className="absolute h-0.5 rounded-full bg-primary"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ModeToggle className="shrink-0 rounded-xl border-border/80 bg-background hover:border-primary/30 hover:bg-muted/45" />
          </div>
        </div>
      </nav>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.matches(pathname);

            return (
              <li className="flex-1" key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground active:text-foreground",
                  )}
                  href={item.href}
                >
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-primary/12",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                  </span>
                  {item.shortLabel ?? item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
