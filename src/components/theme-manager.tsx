"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 400;
const STYLES_ID = "mode-toggle-circle-style";

// Type predicate for ViewTransition API
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
  if (typeof window === "undefined" || document.getElementById(STYLES_ID))
    return;
  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent = `
    ::view-transition-old(root), ::view-transition-new(root) { animation: none !important; }
  `;
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

export const ModeToggle = ({ className = "" }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    injectCircleTransitionStyles();
    setMounted(true);
  }, []);

  const handleClick = useCallback(() => {
    if (
      !btnRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    animateCircleTransition(x, y, () =>
      setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    );
  }, [setTheme, resolvedTheme]);

  if (!mounted) return null;

  return (
    <button
      ref={btnRef}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
      className={`relative flex size-10 items-center justify-center rounded-full bg-transparent text-2xl text-neutral-700 transition outline-none hover:bg-neutral-100 focus:ring-2 focus:ring-blue-400 md:text-3xl dark:text-neutral-200 dark:hover:bg-neutral-800 ${className}`}
      style={{ transition: "background 0.2s" }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
};
