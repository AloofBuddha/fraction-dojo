/* global React */
/* Lesson-screen chrome: dojo background, belt progress, speech bubble, toolbar. */

const { useMemo: _useMemo, useState: _useState } = React;

/* ─── Dojo background ─────────────────────────────────────────────── */
function DojoBackground() {
  // Layers, back to front:
  //   shoji screen wall (cream paper w/ grid)
  //   hanging banner behind the board area
  //   tatami floor (woven mat) along bottom
  //   wood floor moulding strip
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sky paper wall */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'linear-gradient(180deg, #f8edd0 0%, #f0debb 70%, #e7cea0 100%)',
      }} />

      {/* Shoji paper screen grid */}
      <svg viewBox="0 0 1366 900" preserveAspectRatio="none"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="shoji" width="170" height="190" patternUnits="userSpaceOnUse">
            <rect width="170" height="190" fill="none"/>
            <rect x="0" y="0" width="170" height="190" fill="none"
                  stroke="#c9a974" strokeWidth="3" opacity="0.45"/>
            <line x1="85" y1="0" x2="85" y2="190" stroke="#c9a974" strokeWidth="2" opacity="0.35"/>
            <line x1="0" y1="95" x2="170" y2="95" stroke="#c9a974" strokeWidth="2" opacity="0.35"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="1366" height="640" fill="url(#shoji)"/>
        {/* Top horizontal wooden beam */}
        <rect x="0" y="0" width="1366" height="16" fill="#6b3f1f"/>
        <rect x="0" y="14" width="1366" height="6" fill="#3a2210"/>
      </svg>

      {/* Hanging plaque above the board area */}
      <div style={{
        position: 'absolute', left: '50%', top: 100, transform: 'translateX(-50%)',
        width: 260, height: 70, pointerEvents: 'none',
      }}>
        {/* cords */}
        <div style={{ position: 'absolute', left: '18%', top: -20, width: 3, height: 22, background: '#6b3f1f' }} />
        <div style={{ position: 'absolute', right: '18%', top: -20, width: 3, height: 22, background: '#6b3f1f' }} />
        {/* plaque */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #b73a32 0%, #92281f 100%)',
          borderRadius: 8,
          boxShadow: 'inset 0 0 0 4px #f0d9a3, inset 0 0 0 6px #1f1712, 0 8px 16px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <BrushGlyph d="M -20 -12 L 20 -12 M 0 -12 L 0 14 M -16 14 L 16 14 M -12 4 L 12 4" />
          <BrushGlyph d="M -16 -14 L 16 -14 M -16 -14 L -16 12 L 16 12 L 16 -14 M -8 -2 L 8 -2" />
        </div>
      </div>

      {/* Tatami mat ground */}
      <div className="tatami-pattern" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 260,
        boxShadow: 'inset 0 30px 40px -10px rgba(120,80,30,0.5)',
      }}>
        {/* Black mat trim seams */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: '#1f1712' }}/>
      </div>
      {/* Wood baseboard above tatami */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 260, height: 12,
        background: 'linear-gradient(180deg, #8a5224 0%, #4d2c14 100%)',
        boxShadow: '0 2px 0 #2b1808, 0 8px 14px rgba(0,0,0,0.3)',
      }}/>
    </div>
  );
}

function BrushGlyph({ d, size = 54 }) {
  return (
    <svg viewBox="-40 -30 80 60" width={size} height={size * 0.8} style={{ filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.35))' }}>
      <path d={d} stroke="#f8e9c6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─── Belt progress ───────────────────────────────────────────────── */
const BELT_RANKS = [
  { key: 'white',  name: 'White',  color: '#f6ecd6', trim: '#a89770' },
  { key: 'yellow', name: 'Yellow', color: '#f4cd44', trim: '#a8801a' },
  { key: 'orange', name: 'Orange', color: '#ec8b2e', trim: '#9f4d12' },
  { key: 'green',  name: 'Green',  color: '#5fb24a', trim: '#2d6e1d' },
  { key: 'blue',   name: 'Blue',   color: '#3d8edc', trim: '#1b4f87' },
  { key: 'purple', name: 'Purple', color: '#8c5cc1', trim: '#4c2b75' },
  { key: 'brown',  name: 'Brown',  color: '#7d4d24', trim: '#3e2410' },
  { key: 'black',  name: 'Black',  color: '#1f1712', trim: '#000' },
];

function BeltBar({ rankIndex = 1, stripes = 2, stripesTotal = 3 }) {
  const current = BELT_RANKS[rankIndex];
  const next    = BELT_RANKS[Math.min(rankIndex + 1, BELT_RANKS.length - 1)];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22, padding: '10px 22px',
      background: 'rgba(34, 20, 10, 0.86)',
      borderRadius: 999,
      boxShadow: '0 6px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255, 220, 150, 0.18)',
      color: '#f6ecd6',
    }}>
      {/* rank trail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {BELT_RANKS.map((r, i) => {
          const past   = i < rankIndex;
          const active = i === rankIndex;
          return (
            <div key={r.key}
                 title={r.name + ' belt'}
                 style={{
                   width:  active ? 26 : 18,
                   height: active ? 26 : 18,
                   borderRadius: 6,
                   background: r.color,
                   border: `2px solid ${r.trim}`,
                   transform: active ? 'rotate(45deg)' : 'none',
                   boxShadow: active
                     ? '0 0 0 3px rgba(255, 220, 150, 0.55), 0 0 18px rgba(255, 220, 150, 0.6)'
                     : past ? '0 1px 0 rgba(0,0,0,0.35)' : 'none',
                   opacity: past || active ? 1 : 0.45,
                 }} />
          );
        })}
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(246, 236, 214, 0.25)' }} />

      {/* current belt with stripes — the karate belt graphic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 16,
          letterSpacing: 0.4, whiteSpace: 'nowrap',
        }}>
          {current.name} Belt
        </div>
        <div style={{
          position: 'relative',
          width: 200, height: 24, borderRadius: 6,
          background: current.color,
          border: `2px solid ${current.trim}`,
          boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.2), 0 2px 0 rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {/* stripes (white tape) */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14 }}>
            {Array.from({ length: stripesTotal }).map((_, i) => (
              <div key={i} style={{
                width: 10, height: 16, borderRadius: 2,
                background: i < stripes ? '#fff' : 'rgba(0,0,0,0.18)',
                border: i < stripes ? '1.5px solid #b8b29a' : '1.5px solid rgba(0,0,0,0.25)',
                boxShadow: i < stripes ? '0 1px 0 rgba(0,0,0,0.2)' : 'none',
              }}/>
            ))}
          </div>
          {/* belt-fold knot end (visual) */}
          <div style={{
            position: 'absolute', right: -6, top: -4, bottom: -4, width: 14,
            background: current.color, border: `2px solid ${current.trim}`,
            borderRadius: 3,
            transform: 'rotate(8deg)',
          }}/>
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, opacity: 0.75 }}>
          → {next.name}
        </div>
      </div>
    </div>
  );
}

/* ─── Speech bubble (rice paper card) ─────────────────────────────── */
function SpeechBubble({ text, accent = 'Try chopping a quarter.', talking = true }) {
  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#fdf6e2',
      backgroundImage: 'linear-gradient(180deg, #fdf6e2 0%, #f5e7c0 100%)',
      borderRadius: 22,
      padding: '20px 22px 22px',
      border: '4px solid #1f1712',
      boxShadow: '0 0 0 4px #d8453d, 0 12px 0 rgba(0,0,0,0.22), 0 18px 28px rgba(0,0,0,0.22)',
    }}>
      {/* washi tape decoration */}
      <div style={{
        position: 'absolute', top: -10, left: 22, width: 70, height: 22,
        background: 'repeating-linear-gradient(135deg, #d8453d 0 8px, #a82e28 8px 16px)',
        transform: 'rotate(-6deg)', borderRadius: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}/>
      {/* mic indicator (voice-first) */}
      <div style={{
        position: 'absolute', top: -14, right: 16,
        background: '#1c1410', color: '#fff', borderRadius: 999,
        padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 4px 0 rgba(0,0,0,0.25)', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13,
      }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99,
                       background: '#d8453d', animation: talking ? 'pulseGlow 900ms ease-in-out infinite' : 'none' }}/>
        <IconMic size={16} />
        Sensei
      </div>

      <div style={{
        fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 24, lineHeight: 1.2,
        color: '#1f1712', textWrap: 'pretty',
      }}>
        {text}
      </div>
      {accent && (
        <div style={{ marginTop: 10, fontFamily: 'Fredoka', fontWeight: 500, fontSize: 15, color: '#7a4a26', lineHeight: 1.3 }}>
          {accent}
        </div>
      )}

      {/* speech tail pointing down toward sensei — positioned fully below the bubble */}
      <svg viewBox="0 0 60 60" width="46" height="46"
           style={{ position: 'absolute', left: 14, top: '100%', marginTop: -2, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.18))' }}>
        <path d="M 36 0 L 60 14 L 14 56 Z" fill="#fdf6e2" stroke="#1f1712" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ─── Tool button (wooden) ───────────────────────────────────────── */
function ToolButton({ label, hint, active, disabled, onClick, children, accent = '#d8453d' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 144, padding: '14px 8px 16px',
        borderRadius: 20,
        background: active
          ? 'linear-gradient(180deg, #fff3c8 0%, #f1d177 100%)'
          : 'linear-gradient(180deg, #f6ecd6 0%, #e3cea0 100%)',
        boxShadow: active
          ? `0 0 0 4px ${accent}, 0 0 0 7px #1f1712, 0 8px 0 #1f1712, 0 0 26px rgba(216, 69, 61, 0.55)`
          : '0 0 0 3px #1f1712, 0 6px 0 #1f1712, 0 10px 18px rgba(0,0,0,0.25)',
        transition: 'transform 80ms ease, box-shadow 120ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(4px)'; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = 'none'; }}
      onMouseLeave={(e)=> { e.currentTarget.style.transform = 'none'; }}
    >
      <div className={active ? 'tool-active' : ''} style={{
        background: '#fff', borderRadius: 16, padding: 6,
        boxShadow: 'inset 0 0 0 3px #1f1712, 0 3px 0 rgba(0,0,0,0.18)',
      }}>
        {children}
      </div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: '#1f1712', letterSpacing: 0.3 }}>
        {label}
      </div>
      {hint && (
        <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 12.5, color: '#6b3f1f', opacity: 0.78, textAlign: 'center', lineHeight: 1.1 }}>
          {hint}
        </div>
      )}
      {active && (
        <div style={{
          position: 'absolute', top: -10, right: -10,
          background: accent, color: '#fff', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 12,
          padding: '4px 10px', borderRadius: 999,
          boxShadow: '0 0 0 2px #1f1712, 0 3px 0 rgba(0,0,0,0.3)',
        }}>
          READY
        </div>
      )}
    </button>
  );
}

/* ─── Round wooden pause button ──────────────────────────────────── */
function PauseButton({ onClick }) {
  return (
    <button onClick={onClick}
      style={{
        width: 62, height: 62, borderRadius: 999,
        background: 'radial-gradient(circle at 35% 30%, #f6ecd6 0%, #e0c890 60%, #b08c4a 100%)',
        boxShadow: '0 0 0 3px #1f1712, 0 6px 0 #1f1712, 0 10px 16px rgba(0,0,0,0.3)',
        display: 'grid', placeItems: 'center', color: '#1f1712',
      }}
      aria-label="Pause"
    >
      <IconPause size={28} />
    </button>
  );
}

Object.assign(window, { DojoBackground, BeltBar, SpeechBubble, ToolButton, PauseButton, BELT_RANKS });
