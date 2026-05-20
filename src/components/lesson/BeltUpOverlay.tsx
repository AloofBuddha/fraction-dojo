/* Belt-Up overlay — fires when a student crosses a belt boundary. A
 * full-screen scrim drops in, the old belt's swatch slides off, the new
 * belt's swatch pops in with the rank name, and the overlay dismisses
 * after a moment or on tap. */

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { BELT_COLORS, BELT_RANKS, INK, PARCHMENT_LIGHT } from '@/constants/theme';
import type { BeltKey } from '@/core/types';
import { playSound } from './sound';

interface BeltUpOverlayProps {
  from: BeltKey;
  to: BeltKey;
  onDone: () => void;
}

const DISMISS_MS = 2800;

const SCRIM_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 200,
  cursor: 'pointer',
  animation: 'dojo-fade-in 220ms ease-out both',
};

const PANEL_STYLE: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(40, 24, 12, 0.96) 0%, rgba(20, 12, 6, 0.96) 100%)',
  border: `4px solid ${INK}`,
  borderRadius: 24,
  padding: '36px 56px',
  textAlign: 'center',
  color: PARCHMENT_LIGHT,
  fontFamily: 'Fredoka, system-ui, sans-serif',
  boxShadow: '0 18px 40px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,220,150,0.25)',
  minWidth: 360,
};

const beltSwatch = (key: BeltKey): CSSProperties => {
  const swatch = BELT_COLORS[key];
  return {
    width: 72,
    height: 72,
    borderRadius: 14,
    background: swatch.color,
    border: `3px solid ${swatch.trim}`,
    boxShadow: '0 4px 0 rgba(0,0,0,0.35), inset 0 -6px 0 rgba(0,0,0,0.15)',
  };
};

export function BeltUpOverlay({ from, to, onDone }: BeltUpOverlayProps) {
  // Only play the gong-style fanfare once per mount, then auto-dismiss.
  // useRef guards against React 19 strict-mode double-effect runs replaying
  // the sound twice in dev.
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      playSound('beltUp');
    }
    const timer = window.setTimeout(onDone, DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const toName = BELT_RANKS.find((r) => r.key === to)?.name ?? to;

  return (
    <div
      role="dialog"
      aria-label="Belt up"
      onClick={onDone}
      style={SCRIM_STYLE}
    >
      <div style={PANEL_STYLE} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            opacity: 0.8,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Belt Up
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            margin: '22px 0',
          }}
        >
          <div
            style={{
              ...beltSwatch(from),
              animation: 'dojo-belt-old 700ms 220ms ease-out both',
            }}
          />
          <div
            style={{ fontSize: 30, opacity: 0.6 }}
            aria-hidden
          >
            →
          </div>
          <div
            style={{
              ...beltSwatch(to),
              animation: 'dojo-belt-new 700ms 360ms cubic-bezier(0.2, 1.2, 0.4, 1.05) both',
            }}
          />
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 0.5 }}>
          {toName} Belt
        </div>
        <div style={{ marginTop: 18, fontSize: 14, opacity: 0.6 }}>
          Tap to continue
        </div>
      </div>
    </div>
  );
}
