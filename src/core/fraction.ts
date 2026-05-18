/**
 * Exact fraction arithmetic for the lesson's core concept: equivalence.
 *
 * A `Fraction` is a plain immutable value — no class, no `this` — so this module
 * is framework-agnostic, trivial to unit-test, and portable (e.g. to React
 * Native) without change.
 *
 * The two integers are always the source of truth. `toValue` exists only for
 * rendering (pixel math) — never compare fractions through it, or floating-point
 * error will eventually bite. `areEquivalent` and `add` use exact integer math,
 * so they stay correct for thirds, fifths, and any future denominators.
 */

import { gcd } from '@/utils/math';

export interface Fraction {
  readonly numerator: number;
  readonly denominator: number;
}

/**
 * Create a fraction. Numerator and denominator must be integers; denominator ≠ 0.
 *
 * Any sign and improper values (numerator ≥ denominator) are permitted — this is
 * a general fraction type. The board layer only ever constructs proper, positive
 * fractions in the range (0, 1].
 */
export function fraction(numerator: number, denominator: number): Fraction {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new Error(
      `fraction() expects integers, got ${numerator}/${denominator}`,
    );
  }
  if (denominator === 0) {
    throw new Error('fraction() denominator cannot be zero');
  }
  return { numerator, denominator };
}

/**
 * The decimal value of a fraction, e.g. 1/2 → 0.5.
 *
 * For rendering only (e.g. a piece's pixel width). Never use this to compare
 * fractions — use `areEquivalent` instead, which is exact.
 */
export function toValue(f: Fraction): number {
  return f.numerator / f.denominator;
}

/**
 * Reduce a fraction to lowest terms and canonicalise its sign, e.g. 4/8 → 1/2
 * and 1/-2 → -1/2. The denominator of the result is always positive, so any two
 * equivalent fractions reduce to one identical form.
 */
export function simplify(f: Fraction): Fraction {
  // gcd is never 0 here: a Fraction built via fraction() has a non-zero
  // denominator, so gcd(numerator, denominator) ≥ |denominator| > 0. The `|| 1`
  // only guards a Fraction hand-built without the fraction() constructor.
  const divisor = gcd(f.numerator, f.denominator) || 1;
  // Move any sign onto the numerator so the denominator stays positive.
  const sign = f.denominator < 0 ? -1 : 1;
  return {
    numerator: (sign * f.numerator) / divisor,
    denominator: (sign * f.denominator) / divisor,
  };
}

/**
 * Do two fractions represent the same amount? e.g. 1/2 and 2/4 are equivalent.
 *
 * Uses cross-multiplication, so it never depends on simplification or on
 * floating-point division.
 */
export function areEquivalent(a: Fraction, b: Fraction): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

/**
 * Add two fractions, e.g. 1/4 + 1/4 = 1/2. The result is reduced to lowest terms.
 *
 * Exact integer math — and reducing keeps the integers small, so folding `add`
 * over many pieces never drifts past the safe-integer range. Correct for any
 * denominators (thirds, fifths, …) with no float error.
 */
export function add(a: Fraction, b: Fraction): Fraction {
  return simplify({
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

/**
 * The size of one part when a fraction is split into `parts` equal pieces, e.g.
 * splitting 1/2 into 2 gives 1/4. This is what a "chop" does to a board piece.
 */
export function split(f: Fraction, parts: number): Fraction {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new Error(`split() expects a positive integer, got ${parts}`);
  }
  return { numerator: f.numerator, denominator: f.denominator * parts };
}

/** Human-readable form, e.g. "1/2". */
export function format(f: Fraction): string {
  return `${f.numerator}/${f.denominator}`;
}
