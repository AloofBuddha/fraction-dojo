/**
 * useMediaQuery — subscribe to a CSS media query and re-render on change.
 *
 * Server-safe: returns false during SSR (no window). Subscriptions clean up
 * on unmount so listeners don't pile up across hot reloads.
 */

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const get = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/* The dojo force-rotates portrait into landscape (see .stage in dojo.css),
 * so the "effective landscape width" the layout cares about is:
 *   - the device's width when held landscape, or
 *   - the device's HEIGHT when held portrait.
 * Each query below combines both cases. iPad Air / Pro 11" land in the
 * small tier (effective width ≤ 1100); iPad Pro 12.9" lands in the large
 * tier (effective width 1101–1400). Desktops above 1400 keep the original
 * layout. */

/** Effective landscape width ≤ 1100px — small tablets. */
export const SMALL_TABLET_QUERY =
  '(max-width: 1100px) and (orientation: landscape), (max-height: 1100px) and (orientation: portrait)';

/** Effective landscape width 1101–1400px — iPad Pro 12.9" range. */
export const LARGE_TABLET_QUERY =
  '(min-width: 1101px) and (max-width: 1400px) and (orientation: landscape), (min-height: 1101px) and (max-height: 1400px) and (orientation: portrait)';
