/* The belt rank trail + the current lesson label, in one bar.
 *
 * The colored tiles run white -> black (one belt per lesson). The bar doubles
 * as mission-select; for the MVP it shows the single lesson. Ported/adapted
 * from the Claude Design handoff (claude.ai/design). */

import { BELT_COLORS, BELT_RANKS } from '@/constants/theme';

interface BeltBarProps {
  /** Which belt the student is on — also which tile is highlighted. */
  rankIndex?: number;
  /** The current lesson's title, shown beside the rank trail. */
  label: string;
}

export function BeltBar({ rankIndex = 0, label }: BeltBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '10px 22px',
        background: 'rgba(34, 20, 10, 0.86)',
        borderRadius: 999,
        boxShadow:
          '0 6px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255, 220, 150, 0.18)',
        color: '#f6ecd6',
        fontFamily: 'Fredoka, system-ui, sans-serif',
      }}
    >
      {/* belt rank trail — white to black */}
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

      <div style={{ width: 1, height: 28, background: 'rgba(246, 236, 214, 0.25)' }} />

      {/* the current lesson */}
      <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  );
}
