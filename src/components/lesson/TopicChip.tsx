/* The top-right "what am I learning" chip. Shows the current lesson's
 * name with a belt-colored square swatch, matching the BeltBar's idiom.
 * Tapping it opens the LessonPane so the student can jump elsewhere. */

import type { CSSProperties } from 'react';
import { BELT_COLORS } from '@/constants/theme';
import type { BeltKey } from '@/core/types';

const CHIP_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 18px',
  background: 'rgba(34, 20, 10, 0.86)',
  borderRadius: 999,
  boxShadow:
    '0 6px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255, 220, 150, 0.18)',
  color: '#f6ecd6',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: 0.3,
  whiteSpace: 'nowrap',
  border: 'none',
  cursor: 'pointer',
};

interface TopicChipProps {
  onOpen: () => void;
  /** The current lesson's display name (e.g. 'Meet a Half'). */
  name: string;
  /** Belt of the current lesson — drives the swatch colour. Null when
   *  the curriculum is complete, in which case the swatch is dim. */
  belt: BeltKey | null;
}

export function TopicChip({ onOpen, name, belt }: TopicChipProps) {
  const swatch = belt ? BELT_COLORS[belt] : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      style={CHIP_STYLE}
      aria-label="Open lessons"
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          borderRadius: 3,
          background: swatch?.color ?? 'rgba(255, 220, 150, 0.35)',
          border: `2px solid ${swatch?.trim ?? 'rgba(255, 220, 150, 0.6)'}`,
          boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
          flexShrink: 0,
        }}
      />
      {name}
      <span
        aria-hidden
        style={{
          fontSize: 12,
          opacity: 0.7,
          marginLeft: 4,
          letterSpacing: 1,
        }}
      >
        ▾
      </span>
    </button>
  );
}
