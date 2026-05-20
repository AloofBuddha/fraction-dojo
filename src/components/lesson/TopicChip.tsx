/* The top-right "what am I learning" chip. Static today — names the unit
 * the student is on (Equivalent Fractions). The seat is being reserved for
 * a future LessonPane click target that opens a right-side scrollable list
 * of unlocked belts and their lessons. */

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
};

const DOT_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: 99,
  background: '#d8453d',
  boxShadow: '0 0 0 2px rgba(216,69,61,0.35)',
};

export function TopicChip() {
  return (
    <div style={CHIP_STYLE} aria-label="Current unit">
      <span aria-hidden style={DOT_STYLE} />
      Equivalent Fractions
    </div>
  );
}
