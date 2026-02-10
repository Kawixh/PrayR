"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const DURATION = 400;
const STYLES_ID = "mode-toggle-circle-style";

type ViewTransitionCallback = () => void;
type ViewTransitionResult = { ready: Promise<void> };

function isViewTransitionCapable(doc: Document): doc is Document & {
  startViewTransition: (cb: ViewTransitionCallback) => ViewTransitionResult;
} {
  return (
    "startViewTransition" in doc &&
    typeof (doc as Document & { startViewTransition?: unknown })
      .startViewTransition === "function"
  );
}

function injectCircleTransitionStyles() {
  if (typeof window === "undefined" || document.getElementById(STYLES_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent =
    "::view-transition-old(root), ::view-transition-new(root) { animation: none !important; }";
  document.head.appendChild(style);
}

function animateCircleTransition(x: number, y: number, done: () => void) {
  if (!isViewTransitionCapable(document)) {
    done();
    return;
  }

  const r = Math.max(
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y),
  );

  document.startViewTransition(done).ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${r}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: DURATION,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const ModeToggle = ({ className = "" }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const hydrated = useHydrated();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    injectCircleTransitionStyles();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleClick = useCallback(() => {
    if (
      !btnRef.current ||
      !hydrated ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      toggleTheme();
      return;
    }

    const rect = btnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    animateCircleTransition(x, y, toggleTheme);
  }, [hydrated, toggleTheme]);

  return (
    <button
      ref={btnRef}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:border-border hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 ${className}`}
      disabled={!hydrated}
      onClick={handleClick}
      type="button"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
};
