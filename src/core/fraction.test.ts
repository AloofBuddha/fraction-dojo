import { fraction, toValue, simplify, areEquivalent } from './fraction';

describe('fraction()', () => {
  it('builds a Fraction from well-formed integers', () => {
    expect(fraction(3, 8)).toEqual({ numerator: 3, denominator: 8 });
  });

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

  it('produces the same canonical form for any equivalent input', () => {
    // The lesson chain 4/8 = 2/4 = 1/2 — all simplify to the same value object.
    const canonical = simplify(fraction(1, 2));
    expect(simplify(fraction(2, 4))).toEqual(canonical);
    expect(simplify(fraction(4, 8))).toEqual(canonical);
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

