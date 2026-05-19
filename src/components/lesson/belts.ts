/* The karate belt ranks — the progression a student climbs as lessons complete.
 * Ported from the Claude Design handoff (claude.ai/design). */

export interface BeltRank {
  key: string;
  name: string;
  color: string;
  trim: string;
}

export const BELT_RANKS: BeltRank[] = [
  { key: 'white', name: 'White', color: '#f6ecd6', trim: '#a89770' },
  { key: 'yellow', name: 'Yellow', color: '#f4cd44', trim: '#a8801a' },
  { key: 'orange', name: 'Orange', color: '#ec8b2e', trim: '#9f4d12' },
  { key: 'green', name: 'Green', color: '#5fb24a', trim: '#2d6e1d' },
  { key: 'blue', name: 'Blue', color: '#3d8edc', trim: '#1b4f87' },
  { key: 'purple', name: 'Purple', color: '#8c5cc1', trim: '#4c2b75' },
  { key: 'brown', name: 'Brown', color: '#7d4d24', trim: '#3e2410' },
  { key: 'black', name: 'Black', color: '#1f1712', trim: '#000' },
];
