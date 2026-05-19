/**
 * LocalStorage-backed persistence for the dojo — survives reloads so a
 * returning student skips the intro and can revisit earned belts.
 *
 * Each call is safe in non-browser environments and against quota / private-
 * browsing errors; nothing here can crash the app.
 */

const INTRO_KEY = 'dojo:introSeen';

export function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(INTRO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(INTRO_KEY, 'true');
  } catch {
    // private browsing / quota — silently ignore
  }
}
