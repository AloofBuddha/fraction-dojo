/**
 * The board manipulative — a wooden board (= 1 whole) tiled by rectangular
 * pieces. A piece's `value` is its share of the whole; its numerator may be
 * greater than 1 (e.g. a 2/4 piece glued from two 1/4s).
 *
 * Three operations, each a pure function returning a new `Board`:
 *  - chop     — split a piece into two equal halves
 *  - glue     — merge two adjacent same-denominator pieces (numerators add)
 *  - simplify — reduce a piece's fraction one halving step (2/4 → 1/2)
 *
 * Rectangle geometry lives in ./rect; this module is the model on top of it.
 * Framework-agnostic (no React, no DOM) and unit-testable.
 */

import { SMALLEST_DENOMINATOR } from '@/constants/theme';
import { type Fraction, fraction } from './fraction';
import { type Rect, splitRect, unionRect } from './rect';

export type { Rect } from './rect';

export interface Piece {
  readonly id: string;
  readonly value: Fraction;
  readonly rect: Rect;
  /** A locked piece is a puzzle's fixed reference — inert to every tool. */
  readonly locked?: boolean;
}

export interface Board {
  readonly pieces: readonly Piece[];
}

/**
 * The three operations a student can apply to a piece on the board. Reserved
 * for board-mutating verbs — UI-only "tools" (e.g. inspect, compare) should
 * define their own enum rather than widen this union.
 */
export type Tool = 'chop' | 'glue' | 'simplify';

/**
 * A piece's id is derived from its rect. Pieces always tile the board, so no
 * two share a rect — the id is therefore unique and fully deterministic, with
 * no id generator to thread through (handy for tests and React keys).
 *
 * Safe because every halving stays on exact dyadic rationals (0.5, 0.25, …) —
 * introducing thirds or fifths would require a normalised serialisation.
 */
function rectId(rect: Rect): string {
  return `${rect.x}:${rect.y}:${rect.w}:${rect.h}`;
}

// A piece's rect is its id-source-of-truth — freeze it (and the piece itself)
// so a stray mutation cannot desynchronise the two.
function makePiece(value: Fraction, rect: Rect): Piece {
  return Object.freeze({
    id: rectId(rect),
    value,
    rect: Object.freeze({ ...rect }),
  });
}

// findPiece + throw if missing — every mutating op needs this guard, so
// hoist it instead of repeating the "if (!piece) throw …" pattern.
function requirePiece(board: Board, id: string, op: string): Piece {
  const piece = findPiece(board, id);
  if (!piece) throw new Error(`${op}(): no piece "${id}"`);
  return piece;
}

/** A fresh board: a single whole piece worth 1. */
export function createBoard(): Board {
  return { pieces: [makePiece(fraction(1, 1), { x: 0, y: 0, w: 1, h: 1 })] };
}

/** Find a piece by id, or `undefined` if there is none. */
export function findPiece(board: Board, id: string): Piece | undefined {
  return board.pieces.find((piece) => piece.id === id);
}

/**
 * Mark a piece as locked. A locked piece is a puzzle's fixed reference — it
 * cannot be chopped, glued, or simplified, so the student must match it.
 */
export function lockPiece(board: Board, id: string): Board {
  return {
    pieces: board.pieces.map((piece) =>
      piece.id === id ? Object.freeze({ ...piece, locked: true }) : piece,
    ),
  };
}

/* ─── chop ───────────────────────────────────────────────────────────── */

/**
 * Half of a fraction, in the smallest denominator: halve the numerator if it
 * is even, otherwise double the denominator. So 2/4 → 1/4, but 1/4 → 1/8.
 */
export function halfValue(value: Fraction): Fraction {
  return value.numerator % 2 === 0
    ? fraction(value.numerator / 2, value.denominator)
    : fraction(value.numerator, value.denominator * 2);
}

/**
 * Whether a piece of this value can still be chopped within the size limit.
 * A puzzle may pass a tighter `limit` denominator (e.g. 4 to stop at quarters)
 * so the student cannot over-chop into an unrecoverable state. The default,
 * SMALLEST_DENOMINATOR, is the global UX ceiling defined in `@/constants/theme`.
 *
 * This is a query, not a mutation — `chop()` itself remains mathematically
 * unbounded, so unit tests can construct arbitrarily fine boards.
 */
export function canChopFurther(
  value: Fraction,
  limit: number = SMALLEST_DENOMINATOR,
): boolean {
  return halfValue(value).denominator <= limit;
}

/**
 * Chop a piece into two equal halves — split along its longer side so the
 * pieces stay roughly square. Throws if the piece does not exist.
 *
 * The two children are spliced in at the parent's index so reading order
 * tracks board layout, not chop history.
 */
export function chop(board: Board, id: string): Board {
  const piece = requirePiece(board, id, 'chop');
  if (piece.locked) {
    throw new Error(`chop(): piece "${id}" is locked`);
  }
  const childValue = halfValue(piece.value);
  const children = splitRect(piece.rect).map((rect) => makePiece(childValue, rect));
  return {
    pieces: board.pieces.flatMap((p) => (p.id === id ? children : [p])),
  };
}

/* ─── glue ───────────────────────────────────────────────────────────── */

/**
 * Two pieces can be glued when they share a denominator and their rects union
 * into a rectangle — keeping the board a tidy tiling.
 *
 * Same-denominator is an MVP rule of thumb; a later lesson engine may want a
 * value- or rule-based gate instead.
 */
export function canGlue(board: Board, idA: string, idB: string): boolean {
  if (idA === idB) return false;
  const a = findPiece(board, idA);
  const b = findPiece(board, idB);
  if (!a || !b) return false;
  if (a.locked || b.locked) return false;
  if (a.value.denominator !== b.value.denominator) return false;
  return unionRect(a.rect, b.rect) !== undefined;
}

/**
 * Glue two pieces into one — their numerators add, the denominator is kept
 * (1/4 + 1/4 → 2/4). Throws if they cannot be glued; check `canGlue` first.
 *
 * The merged piece takes the slot of whichever input came earlier in the
 * pieces array, so reading order stays stable across a glue.
 */
export function glue(board: Board, idA: string, idB: string): Board {
  if (!canGlue(board, idA, idB)) {
    throw new Error(`glue(): "${idA}" and "${idB}" cannot be glued`);
  }
  // canGlue established both pieces exist and their rects union — assert.
  const a = findPiece(board, idA)!;
  const b = findPiece(board, idB)!;
  const rect = unionRect(a.rect, b.rect)!;
  const merged = makePiece(
    fraction(a.value.numerator + b.value.numerator, a.value.denominator),
    rect,
  );
  const newPieces: Piece[] = [];
  let inserted = false;
  for (const p of board.pieces) {
    if (p.id === idA || p.id === idB) {
      // Replace the first of the two with `merged`; drop the second.
      if (!inserted) {
        newPieces.push(merged);
        inserted = true;
      }
    } else {
      newPieces.push(p);
    }
  }
  return { pieces: newPieces };
}

/** Every pair of pieces that can currently be glued — used to place the seams.
 *  Inlined over `canGlue` so the locked/denominator filters stay O(n²); the
 *  generic `canGlue` repeats two findPiece calls per pair, which is O(n³). */
export function gluablePairs(board: Board): [string, string][] {
  const pairs: [string, string][] = [];
  const { pieces } = board;
  for (let i = 0; i < pieces.length; i++) {
    const a = pieces[i];
    if (a.locked) continue;
    for (let j = i + 1; j < pieces.length; j++) {
      const b = pieces[j];
      if (b.locked) continue;
      if (a.value.denominator !== b.value.denominator) continue;
      if (unionRect(a.rect, b.rect)) pairs.push([a.id, b.id]);
    }
  }
  return pairs;
}

/* ─── simplify ───────────────────────────────────────────────────────── */

/**
 * A piece can be simplified when its numerator and denominator are both even
 * (2/4, 8/8) — one halving step reduces it.
 */
export function canSimplify(board: Board, id: string): boolean {
  const piece = findPiece(board, id);
  if (!piece || piece.locked) return false;
  return piece.value.numerator % 2 === 0 && piece.value.denominator % 2 === 0;
}

/**
 * Reduce a piece's fraction by one halving step — 2/4 → 1/2, 8/8 → 4/4. The
 * piece keeps its exact size and position; only its value (and colour) change,
 * which is what makes equivalence visible. Throws if it cannot be simplified.
 */
export function simplify(board: Board, id: string): Board {
  const piece = requirePiece(board, id, 'simplify');
  if (!canSimplify(board, id)) {
    throw new Error(`simplify(): "${id}" cannot be simplified`);
  }
  const reduced = fraction(
    piece.value.numerator / 2,
    piece.value.denominator / 2,
  );
  // Spread the original piece so every field (id, rect, locked) is preserved
  // — only the value changes — and freeze the new piece for consistency with
  // makePiece's invariant.
  return {
    pieces: board.pieces.map((p) =>
      p.id === id ? Object.freeze({ ...p, value: reduced }) : p,
    ),
  };
}
