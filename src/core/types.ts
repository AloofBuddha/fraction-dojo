/**
 * Shared domain types that don't live with a single module's data.
 *
 * Concrete data (colour values, BELT_RANKS table, etc.) lives in
 * `@/constants/theme` — this file is types-only so a consumer that just needs
 * the shape never reaches for the table.
 */

/** A karate belt rank — the ladder a student climbs as lessons complete. */
export interface BeltRank {
  readonly key: string;
  readonly name: string;
}
