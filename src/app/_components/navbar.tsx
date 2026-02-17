"use client";

import { type FeatureFlags, type FeatureKey } from "@/features/definitions";
import { ModeToggle } from "@/components/theme-manager";
import { Button } from "@/components/ui/button";
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
import { useEffect, useMemo, useRef } from "react";

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
  const navPanelRef = useRef<HTMLDivElement>(null);
  const visibleNavItems = useMemo(
    () =>
      navItems.filter(
        (item) => !item.featureKey || featureFlags[item.featureKey],
      ),
    [featureFlags],
  );

  useEffect(() => {
    const navPanel = navPanelRef.current;
    if (!navPanel) {
      return;
    }

    const root = document.documentElement;
    const updateReserve = () => {
      const panelHeight = navPanel.getBoundingClientRect().height;
      const reserve = Math.ceil(panelHeight + 24);
      root.style.setProperty("--bottom-nav-reserve", `${reserve}px`);
    };

    updateReserve();

    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(updateReserve);
      observer.observe(navPanel);
    }

    window.addEventListener("resize", updateReserve);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateReserve);
      root.style.removeProperty("--bottom-nav-reserve");
    };
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="pointer-events-auto glass-panel max-h-[min(72svh,30rem)] overflow-y-auto rounded-2xl border-border/80 p-2 sm:p-2.5"
          ref={navPanelRef}
        >
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="grid min-w-0 gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(12ch,100%),1fr))]">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matches(pathname);

                return (
                  <Button
                    asChild
                    className={cn(
                      "min-h-11 h-auto rounded-xl px-2.5 py-2 whitespace-normal sm:px-3",
                      isActive
                        ? "border-primary/35 bg-primary/16 text-foreground shadow-sm"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border/80 hover:bg-background/60 hover:text-foreground",
                    )}
                    key={item.href}
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className="flex w-full items-center justify-center gap-1.5 text-center leading-tight sm:flex-col sm:gap-1"
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
              <ModeToggle className="shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
