/**
 * The chop readability limit — a UI/lesson rule, kept out of the pure board
 * model (`core/board.ts` is mathematically unbounded).
 */

import type { Fraction } from '@/core/fraction';
import { halfValue } from '@/core/board';

/** Below 1/64 the pieces become too small to read — chopping stops here. */
export const SMALLEST_DENOMINATOR = 64;

/** Whether a piece of this value can still be chopped within the size limit. */
export function canChopFurther(value: Fraction): boolean {
  return halfValue(value).denominator <= SMALLEST_DENOMINATOR;
}
