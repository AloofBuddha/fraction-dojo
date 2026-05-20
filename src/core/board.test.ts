import {
  createBoard,
  findPiece,
  lockPiece,
  halfValue,
  canChopFurther,
  chop,
  canGlue,
  glue,
  gluablePairs,
  canSimplify,
  simplify,
} from './board';
import { fraction, areEquivalent, toValue } from './fraction';

// Piece ids are deterministic — `"x:y:w:h"` of the piece's rect.
const WHOLE = '0:0:1:1';
const LEFT_HALF = '0:0:0.5:1';
const RIGHT_HALF = '0.5:0:0.5:1';

describe('createBoard()', () => {
  it('starts as a single whole piece worth 1', () => {
    const board = createBoard();
    expect(board.pieces).toHaveLength(1);
    expect(board.pieces[0].value).toEqual(fraction(1, 1));
    expect(board.pieces[0].rect).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });
});

describe('halfValue()', () => {
  it('halves an even numerator (2/4 → 1/4)', () => {
    expect(halfValue(fraction(2, 4))).toEqual(fraction(1, 4));
  });

  it('doubles the denominator when the numerator cannot be halved', () => {
    expect(halfValue(fraction(1, 1))).toEqual(fraction(1, 2));
    expect(halfValue(fraction(1, 4))).toEqual(fraction(1, 8));
    expect(halfValue(fraction(3, 4))).toEqual(fraction(3, 8));
  });
});

describe('canChopFurther()', () => {
  it('allows chopping a piece above the size limit (1/32 → 1/64)', () => {
    expect(canChopFurther(fraction(1, 32))).toBe(true);
  });

  it('refuses a chop that would pass the 1/64 limit (1/64 → 1/128)', () => {
    expect(canChopFurther(fraction(1, 64))).toBe(false);
  });

  it('allows a chop the numerator absorbs (2/64 → 1/64)', () => {
    // halving the numerator keeps the denominator within the limit
    expect(canChopFurther(fraction(2, 64))).toBe(true);
  });

  it('respects a tighter puzzle limit — a quarter cannot be chopped past 4', () => {
    expect(canChopFurther(fraction(1, 4), 4)).toBe(false); // 1/4 → 1/8 overshoots
    expect(canChopFurther(fraction(1, 2), 4)).toBe(true); // 1/2 → 1/4 is allowed
  });
});

describe('chop()', () => {
  it('splits the whole board into two halves', () => {
    const board = chop(createBoard(), WHOLE);
    expect(board.pieces).toHaveLength(2);
    for (const piece of board.pieces) {
      expect(piece.value).toEqual(fraction(1, 2));
    }
  });

  it('chops a half into two quarters', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    expect(board.pieces).toHaveLength(3);
    expect(board.pieces.filter((p) => p.value.denominator === 4)).toHaveLength(2);
  });

  it('splits along the long side — a tall half becomes two stacked quarters', () => {
    // the right half is taller than wide, so its cut must be horizontal,
    // yielding a quarter above and a quarter below (not side by side).
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    const quarterRects = board.pieces
      .filter((p) => p.value.denominator === 4)
      .map((p) => p.rect)
      .sort((m, n) => m.y - n.y);
    expect(quarterRects).toEqual([
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ]);
  });

  it('does not mutate the original board', () => {
    const original = createBoard();
    chop(original, WHOLE);
    expect(original.pieces).toHaveLength(1);
  });

  it('throws when chopping a piece that does not exist', () => {
    expect(() => chop(createBoard(), 'nope')).toThrow();
  });
});

describe('glue()', () => {
  it('merges two quarters into a 2/4 — numerators add, denominator kept', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF); // right half → two 1/4
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(findPiece(board, RIGHT_HALF)?.value).toEqual(fraction(2, 4));
  });

  it('cannot glue pieces of different denominators', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF); // a 1/2 + two 1/4
    expect(canGlue(board, LEFT_HALF, '0.5:0:0.5:0.5')).toBe(false);
  });

  it('cannot glue non-adjacent pieces', () => {
    // four quarters in a 2×2 — the diagonal pair shares no edge
    let board = chop(createBoard(), WHOLE);
    board = chop(board, LEFT_HALF);
    board = chop(board, RIGHT_HALF);
    expect(canGlue(board, '0:0:0.5:0.5', '0.5:0.5:0.5:0.5')).toBe(false);
  });

  it('throws when gluing pieces that cannot be glued', () => {
    expect(() => glue(chop(createBoard(), WHOLE), LEFT_HALF, 'nope')).toThrow();
  });
});

describe('gluablePairs()', () => {
  it('finds all four internal edges of a 2×2 of quarters', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, LEFT_HALF);
    board = chop(board, RIGHT_HALF);
    expect(board.pieces).toHaveLength(4);
    expect(gluablePairs(board)).toHaveLength(4);
  });
});

describe('simplify()', () => {
  it('cannot simplify a piece already in lowest terms', () => {
    expect(canSimplify(createBoard(), WHOLE)).toBe(false); // 1/1
  });

  it('reduces a 2/4 to 1/2 in the same place', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5'); // a 2/4 at RIGHT_HALF
    expect(canSimplify(board, RIGHT_HALF)).toBe(true);
    board = simplify(board, RIGHT_HALF);
    expect(findPiece(board, RIGHT_HALF)?.value).toEqual(fraction(1, 2));
  });

  it('throws when simplifying a piece that cannot be simplified', () => {
    expect(() => simplify(createBoard(), WHOLE)).toThrow();
  });
});

describe('the equivalence the lesson teaches', () => {
  it('a built 2/4 simplifies to 1/2 — equal to the untouched half', () => {
    // chop the board; chop the right half into quarters; glue them into a 2/4;
    // simplify → 1/2. Both halves are now 1/2, covering equal space.
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    board = simplify(board, RIGHT_HALF);
    expect(findPiece(board, LEFT_HALF)?.value).toEqual(fraction(1, 2));
    expect(findPiece(board, RIGHT_HALF)?.value).toEqual(fraction(1, 2));
    expect(areEquivalent(fraction(1, 2), fraction(2, 4))).toBe(true);
  });

  it('keeps the board whole — piece values always sum to 1', () => {
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    board = chop(board, '0.5:0:0.5:0.5');
    const total = board.pieces.reduce((sum, p) => sum + toValue(p.value), 0);
    expect(total).toBeCloseTo(1);
  });
});

describe('lockPiece()', () => {
  it('marks a piece as locked', () => {
    expect(findPiece(lockPiece(createBoard(), WHOLE), WHOLE)?.locked).toBe(true);
  });

  it('a locked piece cannot be chopped', () => {
    expect(() => chop(lockPiece(createBoard(), WHOLE), WHOLE)).toThrow();
  });

  it('a locked piece cannot be glued to its neighbour', () => {
    // chop into halves, lock the left — gluing it back is now refused
    const board = lockPiece(chop(createBoard(), WHOLE), LEFT_HALF);
    expect(canGlue(board, LEFT_HALF, RIGHT_HALF)).toBe(false);
  });

  it('a locked piece cannot be simplified', () => {
    // build a 2/4 at RIGHT_HALF, lock it, then simplify is refused
    let board = chop(createBoard(), WHOLE);
    board = chop(board, RIGHT_HALF);
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    board = lockPiece(board, RIGHT_HALF);
    expect(canSimplify(board, RIGHT_HALF)).toBe(false);
  });
});
