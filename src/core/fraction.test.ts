import {
  fraction,
  toValue,
  simplify,
  areEquivalent,
  add,
  format,
} from './fraction';

describe('fraction()', () => {
  it('rejects a zero denominator', () => {
    // A fraction over zero is undefined — constructing one is a programming bug.
    expect(() => fraction(1, 0)).toThrow();
  });

  it('rejects non-integer parts', () => {
    expect(() => fraction(1.5, 2)).toThrow();
  });
});

describe('toValue()', () => {
  it('converts a fraction to its decimal value', () => {
    expect(toValue(fraction(1, 2))).toBe(0.5);
    expect(toValue(fraction(3, 4))).toBe(0.75);
  });
});

describe('simplify()', () => {
  it('reduces a fraction to lowest terms', () => {
    // 4/8 reducing to 1/2 is the lesson's punchline.
    expect(simplify(fraction(4, 8))).toEqual(fraction(1, 2));
    expect(simplify(fraction(2, 4))).toEqual(fraction(1, 2));
    expect(simplify(fraction(6, 9))).toEqual(fraction(2, 3));
  });

  it('leaves an already-reduced fraction unchanged', () => {
    expect(simplify(fraction(1, 2))).toEqual(fraction(1, 2));
  });

  it('reduces zero to 0/1', () => {
    // gcd(0, 4) is 4, so 0/4 must collapse to a canonical 0/1.
    expect(simplify(fraction(0, 4))).toEqual(fraction(0, 1));
  });

  it('canonicalises sign onto the numerator', () => {
    // A negative denominator moves its sign to the numerator, so equivalent
    // fractions reduce to one identical form.
    expect(simplify(fraction(1, -2))).toEqual(fraction(-1, 2));
    expect(simplify(fraction(-1, -2))).toEqual(fraction(1, 2));
  });
});

describe('areEquivalent()', () => {
  it('recognises the lesson chain 1/2 = 2/4 = 4/8', () => {
    expect(areEquivalent(fraction(1, 2), fraction(2, 4))).toBe(true);
    expect(areEquivalent(fraction(2, 4), fraction(4, 8))).toBe(true);
    expect(areEquivalent(fraction(1, 2), fraction(4, 8))).toBe(true);
  });

  it('rejects fractions that are not the same amount', () => {
    expect(areEquivalent(fraction(1, 2), fraction(1, 3))).toBe(false);
    expect(areEquivalent(fraction(2, 4), fraction(3, 4))).toBe(false);
  });
});

describe('add()', () => {
  it('adds two fractions and reduces the result to lowest terms', () => {
    // 1/4 + 1/4 = 1/2 exactly. Reducing keeps denominators from growing without
    // bound when add() is folded over many pieces.
    expect(add(fraction(1, 4), fraction(1, 4))).toEqual(fraction(1, 2));
  });

  it('adds fractions with unlike denominators', () => {
    // 1/2 + 1/4 = 3/4
    expect(add(fraction(1, 2), fraction(1, 4))).toEqual(fraction(3, 4));
  });

  it('stays exact for thirds — where float division could not', () => {
    // 1/3 + 1/3 + 1/3 is exactly one whole; 0.333... summed three times is not.
    const oneThird = fraction(1, 3);
    const total = add(add(oneThird, oneThird), oneThird);
    expect(areEquivalent(total, fraction(1, 1))).toBe(true);
  });

  it('treats 0/1 as the identity', () => {
    expect(add(fraction(0, 1), fraction(3, 8))).toEqual(fraction(3, 8));
  });
});

describe('format()', () => {
  it('renders a fraction as "n/d"', () => {
    expect(format(fraction(3, 8))).toBe('3/8');
  });
});
