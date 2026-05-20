/* The board's "?" hint button — tap to reveal the puzzle's goal as a
 * popover anchored to the board's top-right corner. The popover stays open
 * until the button is tapped again or another tap lands elsewhere. */

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { INK, PARCHMENT_DARK, PARCHMENT_LIGHT } from '@/constants/theme';

interface HintButtonProps {
  /** What the popover shows — typically a GoalPreview. */
  children: ReactNode;
}

const TRIGGER_STYLE: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: '2px solid #5c3a1e',
  background: 'linear-gradient(180deg, #f6ecd6, #d9b86d)',
  color: '#3a2412',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 22,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 3px 0 #5c3a1e, 0 4px 10px rgba(0,0,0,0.3)',
  padding: 0,
};

const POPOVER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '110%',
  right: 0,
  background: `linear-gradient(180deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT_DARK} 100%)`,
  border: `3px solid ${INK}`,
  borderRadius: 14,
  padding: 12,
  boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
  zIndex: 20,
};

export function HintButton({ children }: HintButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when the student taps outside the button or popover. Esc also
  // dismisses it (parity with other escape-friendly chrome).
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Hide hint' : 'Show hint'}
        aria-expanded={open}
        title="Show the goal"
        style={TRIGGER_STYLE}
      >
        ?
      </button>
      {open && <div style={POPOVER_STYLE}>{children}</div>}
    </div>
  );
}
