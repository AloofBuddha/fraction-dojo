/* The belt rank trail + a karate belt graphic showing within-belt step
 * progress, in one bar. Ported/adapted from the Claude Design handoff
 * (claude.ai/design).
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │  ■ ■ ◆ □ □ □ □ □   White Belt  ▭▭▭ ▭▭▭ ▭▭▭   →  Yellow         │
 *  │  └─ rank trail ─┘  └─ current ─┘└stripes─┘ └ next ┘             │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 * The rank trail shows the eight ranks the student is climbing (past
 * filled, active rotated/glowing, future faded). The belt graphic is
 * a horizontal karate belt in the current rank's color with `stripes`
 * white tape marks out of `stripesTotal` slots, so the student can see
 * step progress within the belt without needing to read "1 / 2". */

import type { CSSProperties } from 'react';
import { BELT_COLORS, BELT_RANKS } from '@/constants/theme';

interface BeltBarProps {
  /** Index into BELT_RANKS — the student's current belt. */
  rankIndex?: number;
  /** Name of the current belt for the readout (defaults to BELT_RANKS lookup). */
  label?: string;
  /** Stripes earned so far in the current belt (typically: completed step
   *  count). The current step counts as earned-in-progress to keep the
   *  indicator alive from the very first beat. */
  stripes?: number;
  /** Total stripe slots — typically the current belt's step count. */
  stripesTotal?: number;
}

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 22,
  padding: '10px 22px',
  background: 'rgba(34, 20, 10, 0.86)',
  borderRadius: 999,
  boxShadow:
    '0 6px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255, 220, 150, 0.18)',
  color: '#f6ecd6',
  fontFamily: 'Fredoka, system-ui, sans-serif',
};

const DIVIDER_STYLE: CSSProperties = {
  width: 1,
  height: 28,
  background: 'rgba(246, 236, 214, 0.25)',
};

export function BeltBar({
  rankIndex = 0,
  label,
  stripes = 0,
  stripesTotal = 0,
}: BeltBarProps) {
  // Clamp into BELT_RANKS so an out-of-range "all earned" rankIndex doesn't
  // crash — show the last belt as the active readout in that case.
  const safeIndex = Math.min(rankIndex, BELT_RANKS.length - 1);
  const current = BELT_RANKS[safeIndex];
  const next = BELT_RANKS[Math.min(safeIndex + 1, BELT_RANKS.length - 1)];
  const currentSwatch = BELT_COLORS[current.key];
  const readoutLabel = label ?? `${current.name} Belt`;
  const hasStripes = stripesTotal > 0;

  return (
    <div style={ROW_STYLE}>
      {/* rank trail — white through black */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {BELT_RANKS.map((rank, index) => {
          const past = index < rankIndex;
          const active = index === rankIndex;
          const swatch = BELT_COLORS[rank.key];
          return (
            <div
              key={rank.key}
              title={`${rank.name} belt`}
              style={{
                width: active ? 26 : 18,
                height: active ? 26 : 18,
                borderRadius: 6,
                background: swatch.color,
                border: `2px solid ${swatch.trim}`,
                transform: active ? 'rotate(45deg)' : 'none',
                boxShadow: active
                  ? '0 0 0 3px rgba(255, 220, 150, 0.55), 0 0 18px rgba(255, 220, 150, 0.6)'
                  : past
                    ? '0 1px 0 rgba(0,0,0,0.35)'
                    : 'none',
                opacity: past || active ? 1 : 0.45,
              }}
            />
          );
        })}
      </div>

      <div style={DIVIDER_STYLE} />

      {/* current belt readout + the karate-belt stripe graphic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 0.4,
            whiteSpace: 'nowrap',
          }}
        >
          {readoutLabel}
        </div>

        {hasStripes && (
          <div
            aria-label={`${stripes} of ${stripesTotal} stripes earned`}
            style={{
              position: 'relative',
              width: 160,
              height: 22,
              borderRadius: 6,
              background: currentSwatch.color,
              border: `2px solid ${currentSwatch.trim}`,
              boxShadow:
                'inset 0 -3px 0 rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.2), 0 2px 0 rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 12,
              }}
            >
              {Array.from({ length: stripesTotal }).map((_, i) => {
                const earned = i < stripes;
                return (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 14,
                      borderRadius: 2,
                      background: earned ? '#fff' : 'rgba(0,0,0,0.18)',
                      border: earned
                        ? '1.5px solid #b8b29a'
                        : '1.5px solid rgba(0,0,0,0.25)',
                      boxShadow: earned ? '0 1px 0 rgba(0,0,0,0.2)' : 'none',
                    }}
                  />
                );
              })}
            </div>
            {/* belt-fold knot end — a small offset rect that reads as fabric
             *  doubling back. Decorative, mirrors the design handoff. */}
            <div
              style={{
                position: 'absolute',
                right: -6,
                top: -4,
                bottom: -4,
                width: 14,
                background: currentSwatch.color,
                border: `2px solid ${currentSwatch.trim}`,
                borderRadius: 3,
                transform: 'rotate(8deg)',
              }}
            />
          </div>
        )}

        {next.key !== current.key && (
          <div style={{ fontWeight: 600, fontSize: 14, opacity: 0.75 }}>
            → {next.name}
          </div>
        )}
      </div>
    </div>
  );
}
