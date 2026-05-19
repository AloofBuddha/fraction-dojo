/**
 * The chop readability limit — a UI/lesson rule, kept out of the pure board
 * model (`core/board.ts` is mathematically unbounded).
 */

import type { Fraction } from '@/core/fraction';
import { halfValue } from '@/core/board';

/** Below 1/64 the pieces become too small to read — chopping stops here. */
export const SMALLEST_DENOMINATOR = 64;

/**
 * Whether a piece of this value can still be chopped within the size limit.
 * A puzzle may pass a tighter `limit` denominator (e.g. 4 to stop at quarters)
 * so the student cannot over-chop into an unrecoverable state.
 */
export function canChopFurther(
  value: Fraction,
  limit: number = SMALLEST_DENOMINATOR,
): boolean {
  return halfValue(value).denominator <= limit;
}
