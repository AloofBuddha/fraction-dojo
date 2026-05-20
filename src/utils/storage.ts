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
const SOUND_KEY = 'dojo:soundEnabled';
const FONT_KEY = 'dojo:font';
const VOICE_KEY = 'dojo:voiceEnabled';
const PROGRESS_KEY = 'dojo:progress';

export type FontKey = 'default' | 'hyperlegible';

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

/* ─── Settings: sound effects on/off ───────────────────────────────────── */

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(SOUND_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_KEY, value ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/* ─── Settings: font preference ────────────────────────────────────────── */

export function getFont(): FontKey {
  if (typeof window === 'undefined') return 'default';
  try {
    const raw = window.localStorage.getItem(FONT_KEY);
    return raw === 'hyperlegible' ? 'hyperlegible' : 'default';
  } catch {
    return 'default';
  }
}

export function setFont(value: FontKey): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FONT_KEY, value);
  } catch {
    // ignore
  }
  // Apply immediately to the document — CSS rules in dojo.css read
  // body[data-font] and swap in Atkinson Hyperlegible.
  document.body.dataset.font = value;
}

/** Wire the persisted font choice to the body's data-font attribute on
 *  startup so the document reflects the saved preference before the UI
 *  paints. Idempotent. */
export function applyPersistedFont(): void {
  if (typeof document === 'undefined') return;
  document.body.dataset.font = getFont();
}

/* ─── Position in the curriculum ───────────────────────────────────────── */

/** Which lesson + step the student is currently working through. Defaults
 *  to the very first step for a brand-new visitor. */
export interface Progress {
  readonly lessonIndex: number;
  readonly stepIndex: number;
}

const DEFAULT_PROGRESS: Progress = { lessonIndex: 0, stepIndex: 0 };

export function getProgress(): Progress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as { lessonIndex?: unknown }).lessonIndex !== 'number' ||
      typeof (parsed as { stepIndex?: unknown }).stepIndex !== 'number'
    ) {
      return DEFAULT_PROGRESS;
    }
    const { lessonIndex, stepIndex } = parsed as Progress;
    return { lessonIndex, stepIndex };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function setProgress(progress: Progress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

/* ─── Settings: full reset ─────────────────────────────────────────────── */

/** Wipe every dojo:* key so the next reload looks like a first-time visit. */
export function resetAllProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of [
      INTRO_KEY,
      UNLOCKED_KEY,
      SOUND_KEY,
      FONT_KEY,
      VOICE_KEY,
      PROGRESS_KEY,
    ]) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
