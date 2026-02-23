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
    href: "/settings",
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
