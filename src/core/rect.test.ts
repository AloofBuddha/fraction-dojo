import { splitRect, unionRect, seamBetween } from './rect';

describe('splitRect()', () => {
  it('splits a square along its width', () => {
    expect(splitRect({ x: 0, y: 0, w: 1, h: 1 })).toEqual([
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ]);
  });

  it('splits a tall rect along its height', () => {
    expect(splitRect({ x: 0, y: 0, w: 0.5, h: 1 })).toEqual([
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    ]);
  });
});

describe('unionRect()', () => {
  it('joins two side-by-side rects into one rectangle', () => {
    expect(
      unionRect({ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }),
    ).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it('joins two stacked rects into one rectangle', () => {
    expect(
      unionRect({ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }),
    ).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it('is undefined when the two rects do not form a rectangle', () => {
    // a tall rect beside a short one — the union is an L-shape
    expect(
      unionRect({ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }),
    ).toBeUndefined();
  });

  it('is undefined for non-adjacent rects', () => {
    expect(
      unionRect({ x: 0, y: 0, w: 0.25, h: 1 }, { x: 0.75, y: 0, w: 0.25, h: 1 }),
    ).toBeUndefined();
  });

  it('is commutative — the same union regardless of argument order', () => {
    // Covers the "b-then-a" branches that the happy-path tests do not hit.
    const left = { x: 0, y: 0, w: 0.5, h: 1 };
    const right = { x: 0.5, y: 0, w: 0.5, h: 1 };
    expect(unionRect(right, left)).toEqual(unionRect(left, right));
    const top = { x: 0, y: 0, w: 1, h: 0.5 };
    const bottom = { x: 0, y: 0.5, w: 1, h: 0.5 };
    expect(unionRect(bottom, top)).toEqual(unionRect(top, bottom));
  });
});

describe('seamBetween()', () => {
  it('is a vertical line between two side-by-side rects', () => {
    expect(
      seamBetween({ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }),
    ).toEqual({ x: 0.5, y: 0, length: 1, vertical: true });
  });

  it('is a horizontal line between two stacked rects', () => {
    expect(
      seamBetween({ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }),
    ).toEqual({ x: 0, y: 0.5, length: 1, vertical: false });
  });

  it('finds the same seam regardless of argument order', () => {
    const left = { x: 0, y: 0, w: 0.5, h: 1 };
    const right = { x: 0.5, y: 0, w: 0.5, h: 1 };
    expect(seamBetween(right, left)).toEqual(seamBetween(left, right));
  });

  it('finds the seam when the first rect is the lower of a stacked pair', () => {
    const top = { x: 0, y: 0, w: 1, h: 0.5 };
    const bottom = { x: 0, y: 0.5, w: 1, h: 0.5 };
    expect(seamBetween(bottom, top)).toEqual({ x: 0, y: 0.5, length: 1, vertical: false });
  });

  it('returns the seam at the actual coordinates, not the origin', () => {
    // Two side-by-side rects translated away from (0,0) — guards against a
    // regression that hardcoded x:0 or y:0 in the seam's position.
    expect(
      seamBetween(
        { x: 0.25, y: 0.5, w: 0.25, h: 0.25 },
        { x: 0.5, y: 0.5, w: 0.25, h: 0.25 },
      ),
    ).toEqual({ x: 0.5, y: 0.5, length: 0.25, vertical: true });
  });
});
