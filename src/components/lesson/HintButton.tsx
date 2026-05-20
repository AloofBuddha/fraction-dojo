/* The board's "?" hint button — tap to reveal the puzzle's goal as a
 * popover anchored to the board's top-right corner. The popover stays open
 * until the button is tapped again or another tap lands elsewhere. */

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { INK, PARCHMENT_DARK, PARCHMENT_LIGHT } from '@/constants/theme';
import { IconLightbulb } from './icons';

interface HintButtonProps {
  /** What the popover shows — typically a GoalPreview. */
  children: ReactNode;
}

// Hint button — bright yellow lightbulb to read as "bright idea."
const TRIGGER_STYLE: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 10,
  border: 'none',
  background:
    'radial-gradient(circle at 35% 30%, #ffe680 0%, #f3b13a 60%, #b8801f 100%)',
  color: INK,
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: `0 0 0 3px ${INK}, 0 4px 0 ${INK}, 0 6px 12px rgba(0,0,0,0.3)`,
  padding: 0,
};

// Popover overlaps the trigger — center of the popover sits on the
// center of the button so the goal blossoms out from the same point the
// student tapped. Tapping anywhere (popover itself or outside) closes it.
// Square by design — the goal it shows is a square thumbnail.
const POPOVER_SIZE = 152;
const POPOVER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: POPOVER_SIZE,
  height: POPOVER_SIZE,
  background: `linear-gradient(180deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT_DARK} 100%)`,
  border: `3px solid ${INK}`,
  borderRadius: 14,
  boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 20,
  cursor: 'pointer',
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
        <IconLightbulb size={26} />
      </button>
      {open && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setOpen(false);
          }}
          style={POPOVER_STYLE}
        >
          {children}
        </div>
      )}
    </div>
  );
}
