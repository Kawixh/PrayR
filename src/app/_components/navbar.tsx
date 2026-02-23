"use client";

import { ModeToggle } from "@/components/theme-manager";
import { Button } from "@/components/ui/button";
import { type FeatureFlags, type FeatureKey } from "@/features/definitions";
import { cn } from "@/lib/utils";
import {
  BookOpenText,
  Home,
  type LucideIcon,
  Menu,
  NotebookTabs,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
    href: "/settings/general",
    label: "Settings",
    icon: Settings,
    matches: (pathname: string) => pathname.startsWith("/settings"),
  },
];

export const Navbar = ({ featureFlags }: { featureFlags: FeatureFlags }) => {
  const pathname = usePathname();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const mobileMenuOpen = mobileMenuPath === pathname;
  const visibleNavItems = useMemo(
    () =>
      navItems.filter(
        (item) => !item.featureKey || featureFlags[item.featureKey],
      ),
    [featureFlags],
  );

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuPath(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

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

      <Button
        aria-controls="mobile-primary-menu"
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className={cn(
          "fixed right-4 z-50 size-14 rounded-full border border-primary/30 text-primary-foreground shadow-[0_1px_1px_color-mix(in_oklab,var(--foreground)_9%,transparent),0_16px_30px_-20px_color-mix(in_oklab,var(--foreground)_42%,transparent)] md:hidden",
          mobileMenuOpen
            ? "bg-primary hover:bg-primary/90"
            : "bg-primary/95 hover:bg-primary",
        )}
        onClick={() => {
          setMobileMenuPath((openPath) =>
            openPath === pathname ? null : pathname,
          );
        }}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        type="button"
      >
        {mobileMenuOpen ? (
          <X className="size-6" aria-hidden />
        ) : (
          <Menu className="size-6" aria-hidden />
        )}
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200 md:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        id="mobile-primary-menu"
      >
        <button
          aria-label="Close menu"
          className="absolute inset-0 bg-background/96 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => {
            setMobileMenuPath(null);
          }}
          type="button"
        />

        <nav
          aria-label="Mobile primary"
          className="relative flex h-full flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]"
        >
          <div className="flex items-center justify-between">
            <span className="soft-chip border-primary/35 text-primary">
              Navigation
            </span>
            <ModeToggle className="size-10 border-border bg-card/70 text-foreground hover:border-primary/30 hover:bg-card" />
          </div>

          <div className="mt-6 h-px bg-border/80" />

          <div className="flex flex-1 items-center">
            <ul className="w-full space-y-3">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matches(pathname);

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border px-5 py-4 transition-colors duration-200",
                        isActive
                          ? "border-primary/45 bg-primary/14 text-primary"
                          : "border-border/80 bg-card/75 text-foreground hover:border-primary/30 hover:bg-card",
                      )}
                      href={item.href}
                      onClick={() => {
                        setMobileMenuPath(null);
                      }}
                    >
                      <span className="font-display text-[1.85rem] leading-[1.1] tracking-tight">
                        {item.label}
                      </span>
                      <Icon
                        aria-hidden
                        className={cn(
                          "size-7 shrink-0 transition duration-200",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};
