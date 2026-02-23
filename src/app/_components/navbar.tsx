"use client";

import { ModeToggle } from "@/components/theme-manager";
import { Button } from "@/components/ui/button";
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
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
  featureKey?: FeatureKey;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Prayer Times",
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
    <nav
      aria-label="Primary"
      className="sticky top-[calc(env(safe-area-inset-top)+0.35rem)] z-40"
    >
      <div className="rounded-2xl border border-border/85 bg-card p-1.5 shadow-[0_1px_1px_color-mix(in_oklab,var(--foreground)_8%,transparent),0_10px_20px_-18px_color-mix(in_oklab,var(--foreground)_35%,transparent)]">
        <div className="grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid min-w-0 gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(min(10ch,100%),1fr))]">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.matches(pathname);

              return (
                <Button
                  asChild
                  className={cn(
                    "min-h-10 h-auto rounded-xl border px-2.5 py-2 whitespace-normal sm:px-3",
                    isActive
                      ? "border-primary/35 bg-primary/12 text-primary"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/45 hover:text-foreground",
                  )}
                  key={item.href}
                  size="sm"
                  variant="outline"
                >
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className="flex w-full items-center justify-center gap-1.5 text-center leading-tight"
                    href={item.href}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-[0.8125rem] leading-tight font-semibold tracking-normal [overflow-wrap:anywhere]">
                      {item.label}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <ModeToggle className="shrink-0 rounded-xl border-border/80 bg-background hover:border-primary/30 hover:bg-muted/45" />
          </div>
        </div>
      </div>
    </nav>
  );
};
