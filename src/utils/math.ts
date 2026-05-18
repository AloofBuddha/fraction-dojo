/**
 * Small, general-purpose math helpers — reusable across the app and not tied to
 * any one feature module.
 */

/**
 * Greatest common divisor of two integers (Euclid's algorithm).
 * Always returns a non-negative result.
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
