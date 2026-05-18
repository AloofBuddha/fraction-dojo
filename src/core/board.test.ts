import {
  createBoard,
  chop,
  mend,
  canChop,
  canMend,
  findPiece,
  leaves,
} from './board';
import { add, areEquivalent, fraction } from './fraction';

describe('createBoard()', () => {
  it('starts as a single whole piece worth 1', () => {
    const board = createBoard();
    expect(board.root.value).toEqual(fraction(1, 1));
    expect(leaves(board)).toHaveLength(1);
  });
});

describe('chop()', () => {
  it('splits the whole board into two halves', () => {
    const cells = leaves(chop(createBoard(), 'r'));
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      expect(cell.value).toEqual(fraction(1, 2));
    }
  });

  it('chops a half into two quarters', () => {
    // whole -> two halves -> chop one half -> a remaining half + two quarters
    let board = chop(createBoard(), 'r');
    board = chop(board, 'r.0');
    const values = leaves(board).map((piece) => piece.value);
    expect(values).toContainEqual(fraction(1, 2));
    expect(values.filter((value) => value.denominator === 4)).toHaveLength(2);
  });

  it('uses deterministic path-based ids', () => {
    const board = chop(createBoard(), 'r');
    expect(findPiece(board, 'r.0')).toBeDefined();
    expect(findPiece(board, 'r.1')).toBeDefined();
  });

  it('does not mutate the original board', () => {
    const original = createBoard();
    chop(original, 'r');
    // chop returns a NEW board; the original is untouched.
    expect(leaves(original)).toHaveLength(1);
  });

  it('throws when chopping a piece that is not a choppable leaf', () => {
    const board = chop(createBoard(), 'r');
    expect(() => chop(board, 'r')).toThrow(); // 'r' is no longer a leaf
    expect(() => chop(board, 'nope')).toThrow(); // no such piece
  });
});

describe('the equivalence the lesson teaches', () => {
  it('two quarters cover the same space as one half', () => {
    // Chop the whole, then chop one half. The two quarters that result are,
    // together, equivalent to the untouched half — this IS fraction equivalence.
    let board = chop(createBoard(), 'r');
    board = chop(board, 'r.0');
    const quarters = leaves(board).filter(
      (piece) => piece.value.denominator === 4,
    );
    expect(quarters).toHaveLength(2);
    const bothQuarters = add(quarters[0].value, quarters[1].value);
    expect(areEquivalent(bothQuarters, fraction(1, 2))).toBe(true);
  });

  it('keeps the board whole — leaf values always sum to exactly 1', () => {
    // However the board is chopped, the pieces still make one whole board.
    // Summed with exact fraction addition, so it holds for any denominators.
    let board = createBoard();
    board = chop(board, 'r');
    board = chop(board, 'r.0');
    board = chop(board, 'r.0.0');
    const total = leaves(board).reduce(
      (sum, piece) => add(sum, piece.value),
      fraction(0, 1),
    );
    expect(areEquivalent(total, fraction(1, 1))).toBe(true);
  });
});

describe('mend()', () => {
  it('reverses a chop — chop then mend returns to one whole piece', () => {
    let board = chop(createBoard(), 'r');
    board = mend(board, 'r');
    expect(leaves(board)).toHaveLength(1);
    expect(board.root.value).toEqual(fraction(1, 1));
  });

  it('cannot mend a piece chopped deeper than one level', () => {
    // 'r' is chopped and one child is chopped again, so 'r' is not yet mendable
    // — the deeper piece must be mended first.
    let board = chop(createBoard(), 'r');
    board = chop(board, 'r.0');
    expect(canMend(board, 'r')).toBe(false);
    expect(canMend(board, 'r.0')).toBe(true);
  });

  it('re-enables a parent mend once the deeper piece is mended', () => {
    // The UI undo flow: mend deepest-first. After 'r.0' is mended, 'r' has all
    // leaf children again and becomes mendable.
    let board = chop(createBoard(), 'r');
    board = chop(board, 'r.0');
    expect(canMend(board, 'r')).toBe(false);
    board = mend(board, 'r.0');
    expect(canMend(board, 'r')).toBe(true);
    board = mend(board, 'r');
    expect(leaves(board)).toHaveLength(1);
  });

  it('throws when mending a piece that cannot be mended', () => {
    expect(() => mend(createBoard(), 'r')).toThrow(); // a leaf has nothing to mend
  });
});

describe('canChop()', () => {
  it('is true for a leaf and false for an already-chopped or missing piece', () => {
    const board = chop(createBoard(), 'r');
    expect(canChop(board, 'r')).toBe(false);
    expect(canChop(board, 'r.0')).toBe(true);
    expect(canChop(board, 'missing')).toBe(false);
  });
});
