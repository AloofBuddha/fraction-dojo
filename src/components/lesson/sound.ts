/**
 * Sound effects. Each is synthesized with the Web Audio API so the prototype
 * needs no audio assets — but any one can be overridden by a real recording
 * via the FILES map below, one name at a time. The six SoundNames are the
 * stable contract the rest of the app calls.
 */

export type SoundName =
  | 'chop'
  | 'glue'
  | 'simplify'
  | 'success'
  | 'wrong'
  | 'beltUp'
  | 'continue'
  | 'select'
  | 'reset';

// The AudioContext is created lazily — browsers block audio until a user
// gesture, and every caller here runs inside a tap handler.
let context: AudioContext | undefined;
function getContext(): AudioContext {
  context ??= new AudioContext();
  return context;
}

interface ToneOptions {
  freq: number;
  dur: number;
  type?: OscillatorType;
  delay?: number;
  gain?: number;
  /** If set, the pitch glides from `freq` to here over the tone. */
  freqEnd?: number;
}

/** Play one oscillator tone with a quick attack and exponential decay. */
function tone({ freq, dur, type = 'sine', delay = 0, gain = 0.18, freqEnd }: ToneOptions): void {
  const ctx = getContext();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.03);
}

/** Play a short low-passed noise burst — the body of a wooden "thwack". */
function noiseBurst(dur: number, gain: number): void {
  const ctx = getContext();
  const start = ctx.currentTime;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1700;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(lowpass).connect(amp).connect(ctx.destination);
  src.start(start);
  src.stop(start + dur + 0.03);
}

/** Play an ascending run of notes — the celebration jingles. */
function arpeggio(freqs: number[], step: number, dur: number, gain: number): void {
  freqs.forEach((freq, i) => tone({ freq, dur, delay: i * step, gain }));
}

// One entry per effect — replace any single one with a real asset later.
const SOUNDS: Record<SoundName, () => void> = {
  chop: () => {
    noiseBurst(0.13, 0.34);
    tone({ freq: 230, freqEnd: 90, dur: 0.11, type: 'square', gain: 0.1 });
  },
  glue: () => tone({ freq: 300, freqEnd: 640, dur: 0.17, type: 'triangle', gain: 0.16 }),
  simplify: () => {
    tone({ freq: 660, dur: 0.15, gain: 0.12 });
    tone({ freq: 990, dur: 0.2, delay: 0.08, gain: 0.1 });
  },
  success: () => arpeggio([523, 659, 784], 0.1, 0.22, 0.15),
  wrong: () => tone({ freq: 196, freqEnd: 140, dur: 0.24, gain: 0.15 }),
  beltUp: () => arpeggio([523, 659, 784, 1047], 0.12, 0.3, 0.16),
  continue: () => {
    tone({ freq: 520, dur: 0.1, gain: 0.14 });
    tone({ freq: 780, dur: 0.14, delay: 0.08, gain: 0.13 });
  },
  select: () => tone({ freq: 520, dur: 0.06, type: 'triangle', gain: 0.09 }),
  reset: () => tone({ freq: 520, freqEnd: 240, dur: 0.18, gain: 0.12 }),
};

/**
 * Real recordings that override the synth, by name. To use one: drop the file
 * in `public/assets/sounds/` and add its entry here. Any name left out keeps
 * its synthesized sound — `wrong` stays synthesized (its soft tone works well).
 */
const FILES: Partial<Record<SoundName, string>> = {
  chop: '/assets/sounds/chop.mp3',
  glue: '/assets/sounds/glue.mp3',
  simplify: '/assets/sounds/simplify.mp3',
  success: '/assets/sounds/fanfare.mp3',
  beltUp: '/assets/sounds/belt-up.mp3',
};

// Warm the browser cache and learn each file's real duration at module load,
// so the first play has no fetch delay.
const preloaded = new Map<SoundName, HTMLAudioElement>();
for (const name of Object.keys(FILES) as SoundName[]) {
  const url = FILES[name];
  if (!url) continue;
  const element = new Audio(url);
  element.preload = 'auto';
  preloaded.set(name, element);
}

// Rough durations (ms) — a fallback for synth sounds and until a file's real
// metadata has loaded.
const FALLBACK_MS: Record<SoundName, number> = {
  chop: 220,
  glue: 320,
  simplify: 420,
  success: 700,
  wrong: 300,
  beltUp: 1000,
  continue: 240,
  select: 100,
  reset: 200,
};

/** How long a sound runs, in ms — the real file duration once known. */
function durationMs(name: SoundName): number {
  const element = preloaded.get(name);
  if (element && Number.isFinite(element.duration) && element.duration > 0) {
    return element.duration * 1000;
  }
  return FALLBACK_MS[name];
}

// The time (performance.now clock) the most recently started sound ends.
let busyUntil = 0;

/** Play the synthesized version of a sound. Failures are swallowed. */
function playSynth(name: SoundName): void {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') void ctx.resume();
    SOUNDS[name]();
  } catch {
    // audio unavailable (older browser, autoplay block, test env) — ignore
  }
}

/**
 * Play a recorded file — a fresh element each call so rapid taps can overlap.
 * Falls back to the synthesized sound if the file is missing or unplayable.
 */
function playFile(url: string, name: SoundName): void {
  try {
    const audio = new Audio(url);
    audio.volume = 0.8;
    // play() returns a Promise in browsers, undefined under a test DOM.
    void audio.play()?.catch(() => playSynth(name));
  } catch {
    playSynth(name);
  }
}

/** Play a sound right now — the registered recording, else the synth. */
function playNow(name: SoundName): void {
  const file = FILES[name];
  if (file) {
    playFile(file, name);
  } else {
    playSynth(name);
  }
}

/**
 * Play a named sound effect. Sounds are queued back-to-back — each waits for
 * the previous to finish — so rapid taps never overlap or clip one another.
 * A sound that would land more than ~1.4s behind a burst of taps is dropped.
 */
export function playSound(name: SoundName): void {
  const now = performance.now();
  const startAt = Math.max(now, busyUntil);
  if (startAt - now > 1400) return;
  busyUntil = startAt + durationMs(name);
  const delay = startAt - now;
  if (delay <= 0) {
    playNow(name);
  } else {
    window.setTimeout(() => playNow(name), delay);
  }
}
