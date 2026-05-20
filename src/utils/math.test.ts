import { gcd, approxEqual } from './math';

describe('gcd()', () => {
  it('finds the greatest common divisor', () => {
    expect(gcd(8, 12)).toBe(4);
    expect(gcd(6, 9)).toBe(3);
  });

  it('returns 1 for co-prime numbers', () => {
    expect(gcd(7, 13)).toBe(1);
  });

  it('handles a zero argument', () => {
    expect(gcd(0, 5)).toBe(5);
  });
});

describe('approxEqual()', () => {
  it('is true despite floating-point drift', () => {
    // 0.1 + 0.2 is famously not exactly 0.3 — approxEqual sees through it.
    expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
  });

  it('is false for clearly different numbers', () => {
    expect(approxEqual(0.5, 0.75)).toBe(false);
  });

  it('treats values exactly epsilon apart as equal (inclusive boundary)', () => {
    // The conventional definition is "within tolerance" — inclusive at epsilon.
    expect(approxEqual(0, 1e-9)).toBe(true);
    expect(approxEqual(0, 2e-9)).toBe(false);
  });
});
