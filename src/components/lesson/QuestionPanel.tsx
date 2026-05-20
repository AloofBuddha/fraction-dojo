/* The answer input for a question step — a compact [ ]/[ ] fraction the
 * student fills in beneath the sensei's question. The board stays on screen
 * as a scratchpad, so this panel only carries the answer. */

import type { CSSProperties, KeyboardEvent } from 'react';
import { DOJO_RED, INK, PARCHMENT_DARK, PARCHMENT_LIGHT } from '@/constants/theme';

interface QuestionPanelProps {
  numerator: string;
  denominator: string;
  onNumerator: (value: string) => void;
  onDenominator: (value: string) => void;
  onSubmit: () => void;
}

const boxStyle: CSSProperties = {
  width: 76,
  height: 64,
  borderRadius: 12,
  border: `3px solid ${INK}`,
  background: '#fff',
  textAlign: 'center',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 34,
  color: INK,
};

export function QuestionPanel({
  numerator,
  denominator,
  onNumerator,
  onDenominator,
  onSubmit,
}: QuestionPanelProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSubmit();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '16px 22px',
        borderRadius: 20,
        background: `linear-gradient(180deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT_DARK} 100%)`,
        border: `3px solid ${INK}`,
        boxShadow: `0 0 0 3px ${DOJO_RED}, 0 8px 16px rgba(0,0,0,0.22)`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <input
          aria-label="numerator"
          inputMode="numeric"
          value={numerator}
          onChange={(event) => onNumerator(event.target.value)}
          onKeyDown={onKeyDown}
          style={boxStyle}
        />
        <div style={{ width: 84, height: 7, borderRadius: 99, background: INK }} />
        <input
          aria-label="denominator"
          inputMode="numeric"
          value={denominator}
          onChange={(event) => onDenominator(event.target.value)}
          onKeyDown={onKeyDown}
          style={boxStyle}
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        style={{
          padding: '12px 24px',
          borderRadius: 999,
          border: `3px solid ${INK}`,
          background: `linear-gradient(180deg, #ef6f5a, ${DOJO_RED})`,
          color: '#fff',
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: `0 4px 0 ${INK}`,
        }}
      >
        Check
      </button>
    </div>
  );
}
