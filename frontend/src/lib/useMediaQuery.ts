import { useCallback, useSyncExternalStore } from "react";

/**
 * Live result of a CSS media query. `null` on the server and during hydration, since
 * the server can't know the screen, so callers render nothing screen-dependent until
 * the browser answers.
 */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => null);
}
