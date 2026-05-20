/**
 * Central constants for the dojo's visual + UX policy: every colour the app
 * draws, the belt-rank ladder, the chop-readability limit, and the bursts
 * palette. Edit here to retheme, swap palettes for a colourblind mode, or
 * tighten the chop ceiling — none of the consumers carry their own copy.
 *
 * Keep the file free of side effects. It is pure data so it can be imported
 * from anywhere (core, UI, tests) without dragging in render-time concerns.
 */

import type { BeltRank } from '@/core/types';

/* ─── core design palette ────────────────────────────────────────────────
 * The five tokens the whole UI is built on. Every outline, every cream
 * card, every red accent, every golden glow — pulled into one place so a
 * retheme is a five-line edit. */

/** The universal outline + text colour. Used for borders, strokes, type. */
export const INK = '#1f1712';

/** The dojo's signature red — sensei's gi, alert accents, primary CTAs. */
export const DOJO_RED = '#d8453d';

/** Cream parchment, top of a card/bubble gradient. */
export const PARCHMENT_LIGHT = '#fdf6e2';

/** Cream parchment, bottom of a card/bubble gradient. */
export const PARCHMENT_DARK = '#f5e7c0';

/** Warm gold used for the locked-piece halo + chop-preview glow. */
export const GLOW_GOLD = '#ffdf80';

/* ─── slot colour scheme ─────────────────────────────────────────────────
 * The "two colours" the curriculum uses as a teaching language: one for
 * the part you have (numerator), the other for the total parts
 * (denominator). They need to be:
 *   1. visually different from every piece fill (1..64) so a highlight is
 *      never the same colour as the piece it surrounds, and
 *   2. high contrast against EACH OTHER so a kid never confuses which
 *      slot they're filling.
 * Magenta + teal are colour-wheel opposites, both sit outside the warm
 * tan→pink piece palette, and pop against the wood board background. */

export const NUM_COLOR = '#d81b60'; // magenta — "parts you have"
export const DEN_COLOR = '#00838f'; // teal    — "parts in total"

/* ─── piece fills by denominator ─────────────────────────────────────────
 * Each denominator gets its own colour so a glance at the board reads as a
 * mosaic of sizes. Mirrors the --p-N CSS variables in styles/dojo.css —
 * if you change one, change the other. */

export const PIECE_FILL_BY_DENOMINATOR: Readonly<Record<number, string>> = {
  1: '#d2a273',
  2: '#e85f4e',
  4: '#f3b13a',
  8: '#7ab560',
  16: '#5ba5d9',
  32: '#a586d4',
  64: '#e87fb4',
};

/* ─── tool button accents ────────────────────────────────────────────────
 * The little glow ring around an unlocked tool tile. Chop has no accent
 * (its mat-yellow look is the default); Glue is curriculum-yellow (matches
 * NUM_COLOR), Simplify is leaf-green. */

export const TOOL_ACCENT_GLUE = '#f3b13a';
export const TOOL_ACCENT_SIMPLIFY = '#5fb24a';

/* ─── confetti burst palette ─────────────────────────────────────────────
 * The rainbow flecks fired off when a step is solved. Order is irrelevant
 * (the renderer shuffles around it). */

export const CONFETTI_PALETTE: readonly string[] = [
  '#e85f4e',
  '#f3b13a',
  '#7ab560',
  '#5ba5d9',
  '#e87fb4',
  '#fdf6e2',
  '#fff5c8',
];

/* ─── belt ladder ────────────────────────────────────────────────────────
 * The progression a student climbs as lessons complete. BELT_RANKS is the
 * ordered list of ranks; BELT_COLORS gives each rank its swatch + trim. The
 * split keeps the curriculum table free of theme details so a colourblind
 * palette can be swapped without touching belt order. */

export const BELT_RANKS: readonly BeltRank[] = [
  { key: 'white', name: 'White' },
  { key: 'yellow', name: 'Yellow' },
  { key: 'orange', name: 'Orange' },
  { key: 'green', name: 'Green' },
  { key: 'blue', name: 'Blue' },
  { key: 'purple', name: 'Purple' },
  { key: 'brown', name: 'Brown' },
  { key: 'black', name: 'Black' },
];

export interface BeltSwatch {
  readonly color: string;
  readonly trim: string;
}

export const BELT_COLORS: Readonly<Record<string, BeltSwatch>> = {
  white: { color: '#f6ecd6', trim: '#a89770' },
  yellow: { color: '#f4cd44', trim: '#a8801a' },
  orange: { color: '#ec8b2e', trim: '#9f4d12' },
  green: { color: '#5fb24a', trim: '#2d6e1d' },
  blue: { color: '#3d8edc', trim: '#1b4f87' },
  purple: { color: '#8c5cc1', trim: '#4c2b75' },
  brown: { color: '#7d4d24', trim: '#3e2410' },
  black: { color: '#1f1712', trim: '#000' },
};

/* ─── UX policy ──────────────────────────────────────────────────────────
 * Below 1/64 the pieces become too small to read on the board — chopping
 * stops there. A lesson may pass a tighter local limit (e.g. 4 to stop at
 * quarters) so a student cannot over-chop into an unrecoverable state. */

export const SMALLEST_DENOMINATOR = 64;
