/**
 * LocalStorage-backed persistence for the dojo — survives reloads so a
 * returning student skips the intro and can revisit earned belts.
 *
 * Each call is safe in non-browser environments and against quota / private-
 * browsing errors; nothing here can crash the app.
 */

import type { BeltKey } from '@/core/types';

const INTRO_KEY = 'dojo:introSeen';
const UNLOCKED_KEY = 'dojo:unlockedBelts';

/** The student always starts on White Belt, so it is always unlocked even
 *  on first launch with empty storage. */
const ALWAYS_UNLOCKED: readonly BeltKey[] = ['white'];

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

/** The belts the student has reached so far — White always, plus any belt
 *  they have advanced to. Used by the LessonPane and BeltBar to gate which
 *  belts are jumpable. */
export function getUnlockedBelts(): Set<BeltKey> {
  const base = new Set<BeltKey>(ALWAYS_UNLOCKED);
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(UNLOCKED_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return base;
    for (const value of parsed) {
      if (typeof value === 'string') base.add(value as BeltKey);
    }
    return base;
  } catch {
    return base;
  }
}

/** Add a belt to the unlocked set and persist. No-op if it is already in
 *  there or in the always-unlocked baseline. */
export function markBeltUnlocked(belt: BeltKey): void {
  if (typeof window === 'undefined') return;
  const current = getUnlockedBelts();
  if (current.has(belt)) return;
  current.add(belt);
  try {
    window.localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...current]));
  } catch {
    // private browsing / quota — silently ignore
  }
}
