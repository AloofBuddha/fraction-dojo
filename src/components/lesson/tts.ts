/**
 * Sensei voice — browser-native Speech Synthesis (Web Speech API).
 *
 * No external service: every supported browser ships a TTS engine, so the
 * sprint can land a "voice-first" sensei without API keys, costs, or audio
 * assets. The voice is best-effort: a missing or muted SpeechSynthesis
 * (older browsers, autoplay-blocking environments, test runners) becomes a
 * silent no-op rather than a crash.
 *
 * Output is gated by an `enabled` flag persisted in localStorage so a
 * student's mute preference survives reload. The lesson UI flips that
 * flag via setEnabled(); the mic chip in the speech bubble exposes the
 * same toggle visually.
 */

const ENABLED_KEY = 'dojo:voiceEnabled';

let enabled: boolean = readEnabled();
const subscribers = new Set<(state: { enabled: boolean; speaking: boolean }) => void>();
let speakingNow = false;

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Default OFF for first-time visitors. The browser's built-in TTS
    // voice is noticeably robotic; until a real voice-AI track is
    // recorded over the final script (drop the MP3s into FILES in
    // sound.ts), the mic chip stays muted by default. A student can
    // tap the chip to opt-in for testing.
    const raw = window.localStorage.getItem(ENABLED_KEY);
    if (raw === null) return false;
    return raw === 'true';
  } catch {
    return false;
  }
}

function persistEnabled(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ENABLED_KEY, value ? 'true' : 'false');
  } catch {
    // private browsing / quota — silently ignore
  }
}

function getSynth(): SpeechSynthesis | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.speechSynthesis;
}

/** Re-shape sensei text so a TTS engine pronounces it the way a teacher
 *  would. "1/2" becomes "one half" instead of "one slash two." Common
 *  fractions get named; the rest fall back to "N over D". Em-dashes lose
 *  their pause-eating effect. */
function speakable(text: string): string {
  const named: Record<string, string> = {
    '1/2': 'one half',
    '1/3': 'one third',
    '2/3': 'two thirds',
    '1/4': 'one quarter',
    '2/4': 'two quarters',
    '3/4': 'three quarters',
    '1/8': 'one eighth',
    '2/8': 'two eighths',
    '3/8': 'three eighths',
    '4/8': 'four eighths',
    '5/8': 'five eighths',
    '6/8': 'six eighths',
    '7/8': 'seven eighths',
    '1/16': 'one sixteenth',
    '4/4': 'four fourths',
  };
  let out = text;
  for (const [token, words] of Object.entries(named)) {
    // Word-boundary so "11/2" isn't matched as "1/2"; the \b at the slash
    // doesn't apply (it's not a word char), so use a lookahead/lookbehind
    // for non-digit / non-slash chars.
    const re = new RegExp(`(?<![\\d/])${token.replace('/', '\\/')}(?![\\d/])`, 'g');
    out = out.replace(re, words);
  }
  // Any remaining n/d fractions — say "N over D".
  out = out.replace(/(?<![\w/])(\d{1,3})\/(\d{1,3})(?![\w/])/g, '$1 over $2');
  // Em-dash → comma-style pause (some engines swallow it).
  out = out.replace(/\s*—\s*/g, ', ');
  return out;
}

function notify(): void {
  const state = { enabled, speaking: speakingNow };
  for (const cb of subscribers) cb(state);
}

/** Cancel any in-flight utterance. Safe to call when nothing is speaking. */
export function stop(): void {
  const synth = getSynth();
  if (!synth) return;
  try {
    synth.cancel();
  } catch {
    // ignore
  }
  if (speakingNow) {
    speakingNow = false;
    notify();
  }
}

/** Speak a line. Cancels any earlier line first so the sensei doesn't
 *  pile up half-finished sentences. No-op when muted or unsupported. */
export function speak(text: string): void {
  if (!enabled) return;
  if (!text) return;
  const synth = getSynth();
  if (!synth) return;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(speakable(text));
    utterance.rate = 0.96;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.onstart = () => {
      speakingNow = true;
      notify();
    };
    utterance.onend = () => {
      speakingNow = false;
      notify();
    };
    utterance.onerror = () => {
      speakingNow = false;
      notify();
    };
    synth.speak(utterance);
  } catch {
    // ignore unavailability
  }
}

export function isEnabled(): boolean {
  return enabled;
}

export function isSpeaking(): boolean {
  return speakingNow;
}

/** Flip voice on/off. When turning off, also cancels any in-flight line. */
export function setEnabled(value: boolean): void {
  enabled = value;
  persistEnabled(value);
  if (!value) {
    stop();
  } else {
    notify();
  }
}

/** Subscribe to voice state (enabled / speaking) — used by the mic chip
 *  to render its mute icon and pulse animation. Returns an unsubscribe. */
export function subscribe(
  callback: (state: { enabled: boolean; speaking: boolean }) => void,
): () => void {
  subscribers.add(callback);
  callback({ enabled, speaking: speakingNow });
  return () => {
    subscribers.delete(callback);
  };
}
