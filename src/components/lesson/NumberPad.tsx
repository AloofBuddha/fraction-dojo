/* A controlled tap-to-place number input. The parent owns the slot values
 * and which slot is focused; this component just renders them and emits
 * tile-tap events so the parent can drive the learning logic.
 *
 * One slot for a single-number answer, two stacked as a fraction. The
 * focused slot pulses in its colour; the matching region on the board
 * (managed by the parent) glows in the same colour. */

import type { CSSProperties } from 'react';
import { INK } from '@/constants/theme';

export interface NumberPadSlot {
  /** The number currently placed in the slot, or null if empty. */
  readonly value: number | null;
  /** Slot border + focus-glow colour — set by the lesson. */
  readonly color?: string;
}

interface NumberPadProps {
  readonly options: readonly number[];
  readonly slots: readonly NumberPadSlot[];
  /** Which slot is currently being filled. */
  readonly focusedIndex: number;
  /** Tile tap — parent validates against the focused slot. */
  readonly onTileTap: (value: number) => void;
  /** Tapping a slot (optional — e.g. to re-focus a filled slot). */
  readonly onSlotTap?: (index: number) => void;
}

export function NumberPad({
  options,
  slots,
  focusedIndex,
  onTileTap,
  onSlotTap,
}: NumberPadProps) {
  return (
    <div style={CARD}>
      <div style={FRACTION_COL}>
        <Slot
          slot={slots[0]}
          focused={focusedIndex === 0}
          onClick={() => onSlotTap?.(0)}
        />
        {slots.length === 2 && (
          <>
            <div style={BAR} />
            <Slot
              slot={slots[1]}
              focused={focusedIndex === 1}
              onClick={() => onSlotTap?.(1)}
            />
          </>
        )}
      </div>
      <div style={PALETTE}>
        {options.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onTileTap(value)}
            style={TILE}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slot({
  slot,
  focused,
  onClick,
}: {
  slot: NumberPadSlot;
  focused: boolean;
  onClick: () => void;
}) {
  const color = slot.color ?? INK;
  const style: CSSProperties = {
    width: 56,
    height: 46,
    borderRadius: 10,
    border: `4px ${slot.value == null ? 'dashed' : 'solid'} ${color}`,
    background: '#fff',
    fontFamily: 'Fredoka, system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 24,
    color: INK,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'box-shadow 200ms ease',
    boxShadow: focused
      ? `0 0 0 4px ${color}55, 0 0 18px ${color}`
      : 'none',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-label={slot.value == null ? 'empty slot' : `slot ${slot.value}`}
    >
      {slot.value ?? ''}
    </button>
  );
}

// NumberPad sits naturally on the speech bubble's parchment — no border
// or background of its own to avoid the box-within-box look.
const CARD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingTop: 2,
};
const FRACTION_COL: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};
const BAR: CSSProperties = {
  width: 64,
  height: 4,
  borderRadius: 99,
  background: INK,
};
const PALETTE: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  flexWrap: 'wrap',
};
const TILE: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 99,
  border: `3px solid ${INK}`,
  background: 'linear-gradient(180deg, #f6ecd6, #e3cea0)',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 20,
  color: INK,
  cursor: 'pointer',
  boxShadow: `0 4px 0 ${INK}`,
};
