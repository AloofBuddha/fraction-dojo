/**
 * The board manipulative: a wooden board (the whole, worth 1) that the student
 * chops into equal pieces and mends back together.
 *
 * The board is a tree of pieces. All operations are pure functions that return a
 * new `Board` — nothing is mutated — which keeps the model easy to test, to undo,
 * and to drive from React state.
 */

import { type Fraction, fraction, split } from './fraction';

/**
 * One rectangular region of the board. A piece is a leaf (no children) until it
 * is chopped, after which it has equal children. `value` is the piece's share of
 * the whole board.
 *
 * `id` is path-based and deterministic: the root is `"r"`, and the i-th child of
 * a piece is `"<parentId>.<i>"` (e.g. `"r.0"`, `"r.0.1"`). Deterministic ids make
 * the board easy to address from the UI and to assert on in tests, with no
 * separate id generator to thread through.
 */
export interface Piece {
  readonly id: string;
  readonly value: Fraction;
  readonly children: readonly Piece[];
}

export interface Board {
  readonly root: Piece;
}

/** A karate chop always halves a board. */
const CHOP_PARTS = 2;
const ROOT_ID = 'r';

/** A fresh board: a single whole piece worth 1. */
export function createBoard(): Board {
  return { root: { id: ROOT_ID, value: fraction(1, 1), children: [] } };
}

function isLeaf(piece: Piece): boolean {
  return piece.children.length === 0;
}

/** Visit every piece in the board, depth-first from the root. */
function walkBoard(board: Board, visit: (piece: Piece) => void): void {
  const visitPiece = (piece: Piece): void => {
    visit(piece);
    for (const child of piece.children) {
      visitPiece(child);
    }
  };
  visitPiece(board.root);
}

/** Find a piece anywhere in the tree by id, or `undefined` if there is none. */
export function findPiece(board: Board, id: string): Piece | undefined {
  let match: Piece | undefined;
  walkBoard(board, (piece) => {
    if (piece.id === id) {
      match = piece;
    }
  });
  return match;
}

/** Every leaf piece — the cells currently visible on the board. */
export function leaves(board: Board): Piece[] {
  const result: Piece[] = [];
  walkBoard(board, (piece) => {
    if (isLeaf(piece)) {
      result.push(piece);
    }
  });
  return result;
}

/** Rebuild the tree, replacing the piece with `id` via `transform`. */
function replacePiece(
  piece: Piece,
  id: string,
  transform: (target: Piece) => Piece,
): Piece {
  if (piece.id === id) {
    return transform(piece);
  }
  if (isLeaf(piece)) {
    return piece;
  }
  return {
    ...piece,
    children: piece.children.map((child) => replacePiece(child, id, transform)),
  };
}

/** A piece can be chopped only if it exists and is a leaf. */
export function canChop(board: Board, id: string): boolean {
  const piece = findPiece(board, id);
  return piece !== undefined && isLeaf(piece);
}

/**
 * Chop a leaf piece into two equal halves — the core karate-chop move.
 * Throws if the piece does not exist or is not a leaf; check `canChop` first.
 */
export function chop(board: Board, id: string): Board {
  if (!canChop(board, id)) {
    throw new Error(`chop(): "${id}" is not a choppable leaf piece`);
  }
  return {
    root: replacePiece(board.root, id, (piece) => {
      const childValue = split(piece.value, CHOP_PARTS);
      const children: Piece[] = [];
      for (let index = 0; index < CHOP_PARTS; index++) {
        children.push({
          id: `${piece.id}.${index}`,
          value: childValue,
          children: [],
        });
      }
      return { ...piece, children };
    }),
  };
}

/**
 * A piece can be mended only if it has children and all of them are leaves —
 * i.e. it was chopped exactly once and not chopped any deeper. Mend the deepest
 * pieces first to collapse a board step by step.
 */
export function canMend(board: Board, id: string): boolean {
  const piece = findPiece(board, id);
  return piece !== undefined && !isLeaf(piece) && piece.children.every(isLeaf);
}

/**
 * Mend a chopped piece back into a whole leaf — the band-aid move, the inverse
 * of `chop`. Throws if the piece cannot be mended; check `canMend` first.
 */
export function mend(board: Board, id: string): Board {
  if (!canMend(board, id)) {
    throw new Error(`mend(): "${id}" is not a mendable piece`);
  }
  return {
    root: replacePiece(board.root, id, (piece) => ({ ...piece, children: [] })),
  };
}
