import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false during SSR and hydration, true afterwards. Gate anything read from
// browser-only state (localStorage, theme) on it to avoid hydration mismatches.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
