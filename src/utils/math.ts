/**
 * Small, general-purpose math helpers — reusable across the app and not tied to
 * any one feature module.
 */

/**
 * Greatest common divisor of two integers (Euclid's algorithm).
 * Always returns a non-negative result. By convention `gcd(0, 0) === 0` —
 * callers that divide by the result must guard against it (see
 * `fraction.ts:simplify`, which uses `gcd(…) || 1`).
 */
export function gcd(a: number, b: number): number {
  let dividend = Math.abs(a);
  let divisor = Math.abs(b);
  while (divisor !== 0) {
    const remainder = dividend % divisor;
    dividend = divisor;
    divisor = remainder;
  }
  return dividend;
}

/**
 * True when two numbers are equal within a small tolerance — for comparing
 * floating-point coordinates without exact-equality surprises.
 */
export function approxEqual(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) <= epsilon;
}
