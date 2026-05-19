import { fraction } from '@/core/fraction';
import { canChopFurther } from './chop-limit';

describe('canChopFurther()', () => {
  it('allows chopping a piece above the size limit (1/32 → 1/64)', () => {
    expect(canChopFurther(fraction(1, 32))).toBe(true);
  });

  it('refuses a chop that would pass the 1/64 limit (1/64 → 1/128)', () => {
    expect(canChopFurther(fraction(1, 64))).toBe(false);
  });

  it('allows a chop the numerator absorbs (2/64 → 1/64)', () => {
    // halving the numerator keeps the denominator within the limit
    expect(canChopFurther(fraction(2, 64))).toBe(true);
  });

  it('respects a tighter puzzle limit — a quarter cannot be chopped past 4', () => {
    expect(canChopFurther(fraction(1, 4), 4)).toBe(false); // 1/4 → 1/8 overshoots
    expect(canChopFurther(fraction(1, 2), 4)).toBe(true); // 1/2 → 1/4 is allowed
  });
});
