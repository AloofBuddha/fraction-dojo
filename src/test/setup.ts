import '@testing-library/jest-dom/vitest';

// jsdom does not ship window.matchMedia. Components that call
// useMediaQuery() need it to exist — default everything to "doesn't match"
// (i.e., desktop layout) so tests run against the canonical render.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
