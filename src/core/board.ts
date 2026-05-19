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

import { type Fraction, fraction } from './fraction';
import { type Rect, splitRect, unionRect } from './rect';

export type { Rect } from './rect';

export interface Piece {
  readonly id: string;
  readonly value: Fraction;
  readonly rect: Rect;
}

export interface Board {
  readonly pieces: readonly Piece[];
}

/**
 * A piece's id is derived from its rect. Pieces always tile the board, so no
 * two share a rect — the id is therefore unique and fully deterministic, with
 * no id generator to thread through (handy for tests and React keys).
 */
function rectId(rect: Rect): string {
  return `${rect.x}:${rect.y}:${rect.w}:${rect.h}`;
}

function makePiece(value: Fraction, rect: Rect): Piece {
  return { id: rectId(rect), value, rect };
}

/** A fresh board: a single whole piece worth 1. */
export function createBoard(): Board {
  return { pieces: [makePiece(fraction(1, 1), { x: 0, y: 0, w: 1, h: 1 })] };
}

/** Find a piece by id, or `undefined` if there is none. */
export function findPiece(board: Board, id: string): Piece | undefined {
  return board.pieces.find((piece) => piece.id === id);
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
 * Chop a piece into two equal halves — split along its longer side so the
 * pieces stay roughly square. Throws if the piece does not exist.
 */
export function chop(board: Board, id: string): Board {
  const piece = findPiece(board, id);
  if (!piece) {
    throw new Error(`chop(): no piece "${id}"`);
  }
  const childValue = halfValue(piece.value);
  return {
    pieces: [
      ...board.pieces.filter((p) => p.id !== id),
      ...splitRect(piece.rect).map((rect) => makePiece(childValue, rect)),
    ],
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
  if (a.value.denominator !== b.value.denominator) return false;
  return unionRect(a.rect, b.rect) !== undefined;
}

/**
 * Glue two pieces into one — their numerators add, the denominator is kept
 * (1/4 + 1/4 → 2/4). Throws if they cannot be glued; check `canGlue` first.
 */
export function glue(board: Board, idA: string, idB: string): Board {
  const a = findPiece(board, idA);
  const b = findPiece(board, idB);
  const rect =
    a && b && a.value.denominator === b.value.denominator
      ? unionRect(a.rect, b.rect)
      : undefined;
  if (!a || !b || !rect) {
    throw new Error(`glue(): "${idA}" and "${idB}" cannot be glued`);
  }
  const merged = makePiece(
    fraction(a.value.numerator + b.value.numerator, a.value.denominator),
    rect,
  );
  return {
    pieces: [
      ...board.pieces.filter((p) => p.id !== idA && p.id !== idB),
      merged,
    ],
  };
}

/** Every pair of pieces that can currently be glued — used to place the seams. */
export function gluablePairs(board: Board): [string, string][] {
  const pairs: [string, string][] = [];
  const { pieces } = board;
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      if (canGlue(board, pieces[i].id, pieces[j].id)) {
        pairs.push([pieces[i].id, pieces[j].id]);
      }
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
  if (!piece) return false;
  return piece.value.numerator % 2 === 0 && piece.value.denominator % 2 === 0;
}

/**
 * Reduce a piece's fraction by one halving step — 2/4 → 1/2, 8/8 → 4/4. The
 * piece keeps its exact size and position; only its value (and colour) change,
 * which is what makes equivalence visible. Throws if it cannot be simplified.
 */
export function simplify(board: Board, id: string): Board {
  const piece = findPiece(board, id);
  if (!piece || !canSimplify(board, id)) {
    throw new Error(`simplify(): "${id}" cannot be simplified`);
  }
  const reduced = fraction(
    piece.value.numerator / 2,
    piece.value.denominator / 2,
  );
  return {
    pieces: board.pieces.map((p) =>
      p.id === id ? makePiece(reduced, p.rect) : p,
    ),
  };
}
