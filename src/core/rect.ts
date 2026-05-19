/**
 * Pure rectangle geometry for the board — the trickiest, most error-prone part
 * of the model, kept here on its own so it can be unit-tested directly.
 *
 * A rect lives in unit space: the board is the unit square (0,0)–(1,1).
 */

import { approxEqual } from '@/utils/math';

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Split a rect into two equal halves, along its longer side. */
export function splitRect(rect: Rect): [Rect, Rect] {
  const { x, y, w, h } = rect;
  return w >= h
    ? [
        { x, y, w: w / 2, h },
        { x: x + w / 2, y, w: w / 2, h },
      ]
    : [
        { x, y, w, h: h / 2 },
        { x, y: y + h / 2, w, h: h / 2 },
      ];
}

/**
 * If two rects share a full edge and union into a single rectangle, that rect;
 * otherwise `undefined`.
 */
export function unionRect(a: Rect, b: Rect): Rect | undefined {
  // side by side — same row, adjacent columns
  if (approxEqual(a.y, b.y) && approxEqual(a.h, b.h)) {
    if (approxEqual(a.x + a.w, b.x)) return { x: a.x, y: a.y, w: a.w + b.w, h: a.h };
    if (approxEqual(b.x + b.w, a.x)) return { x: b.x, y: a.y, w: a.w + b.w, h: a.h };
  }
  // stacked — same column, adjacent rows
  if (approxEqual(a.x, b.x) && approxEqual(a.w, b.w)) {
    if (approxEqual(a.y + a.h, b.y)) return { x: a.x, y: a.y, w: a.w, h: a.h + b.h };
    if (approxEqual(b.y + b.h, a.y)) return { x: a.x, y: b.y, w: a.w, h: a.h + b.h };
  }
  return undefined;
}

/** A line segment — the shared edge between two adjacent rects. */
export interface Seam {
  readonly x: number;
  readonly y: number;
  readonly length: number;
  readonly vertical: boolean;
}

/**
 * The shared edge between two adjacent rects, as a seam line. Orientation is
 * decided by which edge the rects actually meet on — consistent with
 * `unionRect` — rather than guessed from a single coordinate.
 */
export function seamBetween(a: Rect, b: Rect): Seam {
  // vertical seam — the rects meet along a shared x-edge (side by side)
  if (approxEqual(a.x + a.w, b.x) || approxEqual(b.x + b.w, a.x)) {
    const x = approxEqual(a.x + a.w, b.x) ? a.x + a.w : b.x + b.w;
    return { x, y: a.y, length: a.h, vertical: true };
  }
  // horizontal seam — the rects meet along a shared y-edge (stacked)
  const y = approxEqual(a.y + a.h, b.y) ? a.y + a.h : b.y + b.h;
  return { x: a.x, y, length: a.w, vertical: false };
}
