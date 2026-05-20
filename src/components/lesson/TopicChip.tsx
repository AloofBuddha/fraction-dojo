/* The top-right "what am I learning" chip. Tapping it opens the LessonPane
 * so the student can jump to any unlocked belt's lesson. */

import type { CSSProperties } from 'react';

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

const DOT_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: 99,
  background: '#d8453d',
  boxShadow: '0 0 0 2px rgba(216,69,61,0.35)',
};

interface TopicChipProps {
  onOpen: () => void;
}

export function TopicChip({ onOpen }: TopicChipProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={CHIP_STYLE}
      aria-label="Open lessons"
    >
      <span aria-hidden style={DOT_STYLE} />
      Equivalent Fractions
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
