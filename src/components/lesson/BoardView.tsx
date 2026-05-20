/* The board manipulative — a wooden board the student chops, glues, and
 * simplifies. Visual layer over the region model in src/core/board.ts.
 *
 * Three tools:
 *  - Chop     — tap a piece to split it (hovering previews the cut — a bonus,
 *               never required, since touch has no hover).
 *  - Glue     — every gluable edge carries an always-glowing seam button.
 *  - Simplify — simplifiable pieces glow; tap one to reduce it (2/4 → 1/2).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type Board,
  type Rect,
  type Tool,
  findPiece,
  gluablePairs,
  canChopFurther,
} from '@/core/board';
import { type Seam, seamBetween } from '@/core/rect';
import { GLOW_GOLD } from '@/constants/theme';

export type { Tool };

/** The two labels on a piece — numerator above the bar, denominator below.
 *  Lives here (not in core/board) because it's a UI concern: the model has no
 *  notion of how a piece is rendered. */
export type LabelKind = 'numerator' | 'denominator';

/* ─── piece styling ──────────────────────────────────────────────────── */

const PIECE_STYLES: Record<number, { fill: string; edge: string }> = {
  1: { fill: 'var(--p-1)', edge: 'var(--p-1-d)' },
  2: { fill: 'var(--p-2)', edge: 'var(--p-2-d)' },
  4: { fill: 'var(--p-4)', edge: 'var(--p-4-d)' },
  8: { fill: 'var(--p-8)', edge: 'var(--p-8-d)' },
  16: { fill: 'var(--p-16)', edge: 'var(--p-16-d)' },
  32: { fill: 'var(--p-32)', edge: 'var(--p-32-d)' },
  64: { fill: 'var(--p-64)', edge: 'var(--p-64-d)' },
};

function pieceStyle(denominator: number) {
  return PIECE_STYLES[denominator] ?? PIECE_STYLES[64];
}

/* ─── one piece ──────────────────────────────────────────────────────── */

interface PieceViewProps {
  id: string;
  numerator: number;
  denominator: number;
  rect: Rect;
  tool: Tool | null;
  locked: boolean;
  chopLimit?: number;
  /** When set, the matching label pulses to draw the student's attention. */
  highlightLabel?: LabelKind;
  /** When set, the numerator and denominator become independently tappable. */
  onLabelTap?: (id: string, label: LabelKind) => void;
  onTap: (id: string) => void;
}

function PieceView({
  id,
  numerator,
  denominator,
  rect,
  tool,
  locked,
  chopLimit,
  highlightLabel,
  onLabelTap,
  onTap,
}: PieceViewProps) {
  // A locked piece keeps its wood look — the lock badge below is the only
  // visual cue it's untouchable, so it matches the goal-preview thumbnail.
  const style = pieceStyle(denominator);
  // A chop cuts along the piece's longer side.
  const cutVertical = rect.w >= rect.h;
  const showChopLine =
    !locked && tool === 'chop' && canChopFurther({ numerator, denominator }, chopLimit);
  const canSimplify =
    !locked && tool === 'simplify' && numerator % 2 === 0 && denominator % 2 === 0;

  return (
    <button
      type="button"
      className="piece"
      aria-label={`${numerator}/${denominator} piece${locked ? ' (locked)' : ''}`}
      onClick={() => onTap(id)}
      disabled={locked}
      style={{
        position: 'absolute',
        left: `${rect.x * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
        padding: 4,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          containerType: 'size',
          background: `linear-gradient(160deg, ${style.fill} 0%, ${style.fill} 55%, color-mix(in oklab, ${style.fill} 80%, black) 100%)`,
          borderRadius: 10,
          border: `3px solid ${style.edge}`,
          boxShadow: canSimplify
            ? `inset 0 3px 0 rgba(255,255,255,0.18), 0 0 0 4px ${GLOW_GOLD}, 0 0 20px rgba(255,220,120,0.75)`
            : 'inset 0 3px 0 rgba(255,255,255,0.18), inset 0 -6px 0 rgba(0,0,0,0.10), 0 3px 0 rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        {/* faint wood grain — same for every piece, locked or not */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          aria-hidden
          style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.22, mixBlendMode: 'multiply' }}
        >
          <path d="M 0 22 Q 40 26 100 20" stroke="#000" strokeWidth="0.6" fill="none" />
          <path d="M 0 48 Q 50 44 100 50" stroke="#000" strokeWidth="0.5" fill="none" />
          <path d="M 0 72 Q 60 78 100 70" stroke="#000" strokeWidth="0.6" fill="none" />
        </svg>

        {/* lock badge — this piece is the puzzle's fixed master */}
        {locked && (
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            style={{
              position: 'absolute',
              top: '8%',
              right: '8%',
              width: '26cqmin',
              height: '26cqmin',
              zIndex: 1,
            }}
          >
            <path
              d="M 7 11 V 8 a 5 5 0 0 1 10 0 V 11"
              fill="none"
              stroke="#2e2b27"
              strokeWidth="2.6"
            />
            <rect x="4.5" y="11" width="15" height="11" rx="2.4" fill="#2e2b27" />
          </svg>
        )}

        {/* chop preview — a dashed cut-line, shown on hover, behind the label */}
        {showChopLine && (
          <div
            className="chop-line"
            style={{
              position: 'absolute',
              zIndex: 1,
              pointerEvents: 'none',
              ...(cutVertical
                ? {
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: 0,
                    borderLeft: '3px dashed rgba(58,58,58,0.55)',
                    transform: 'translateX(-1.5px)',
                  }
                : {
                    left: 0,
                    right: 0,
                    top: '50%',
                    height: 0,
                    borderTop: '3px dashed rgba(58,58,58,0.55)',
                    transform: 'translateY(-1.5px)',
                  }),
            }}
          />
        )}

        {/* fraction label — kept above the chop line so it is never obscured */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 0.95,
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '22cqmin',
            textShadow: `0 2px 0 ${style.edge}, 0 4px 6px rgba(0,0,0,0.25)`,
            userSelect: 'none',
          }}
        >
          <span
            className={highlightLabel === 'numerator' ? 'label-pulse' : undefined}
            role={onLabelTap ? 'button' : undefined}
            tabIndex={onLabelTap ? 0 : undefined}
            onClick={
              onLabelTap
                ? (event) => {
                    event.stopPropagation();
                    onLabelTap(id, 'numerator');
                  }
                : undefined
            }
            style={onLabelTap ? { cursor: 'pointer' } : undefined}
          >
            {numerator}
          </span>
          <span
            style={{
              width: '0.95em',
              height: '0.12em',
              background: '#fff',
              borderRadius: 99,
              margin: '0.12em 0',
            }}
          />
          <span
            className={highlightLabel === 'denominator' ? 'label-pulse' : undefined}
            role={onLabelTap ? 'button' : undefined}
            tabIndex={onLabelTap ? 0 : undefined}
            onClick={
              onLabelTap
                ? (event) => {
                    event.stopPropagation();
                    onLabelTap(id, 'denominator');
                  }
                : undefined
            }
            style={onLabelTap ? { cursor: 'pointer' } : undefined}
          >
            {denominator}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── glue seam ──────────────────────────────────────────────────────── */

interface GlueSeam extends Seam {
  key: string;
  idA: string;
  idB: string;
}

function GlueSeamButton({ seam, onTap }: { seam: GlueSeam; onTap: () => void }) {
  const reach = 24; // tappable half-thickness around the seam line
  return (
    <button
      type="button"
      aria-label="Glue these two pieces"
      onClick={onTap}
      style={{
        position: 'absolute',
        left: seam.vertical
          ? `calc(${seam.x * 100}% - ${reach}px)`
          : `${seam.x * 100}%`,
        top: seam.vertical
          ? `${seam.y * 100}%`
          : `calc(${seam.y * 100}% - ${reach}px)`,
        width: seam.vertical ? reach * 2 : `${seam.length * 100}%`,
        height: seam.vertical ? `${seam.length * 100}%` : reach * 2,
        background: 'transparent',
        cursor: 'pointer',
        zIndex: 3,
      }}
    >
      <div
        className="pulse-glow"
        style={{
          position: 'absolute',
          ...(seam.vertical
            ? { top: 8, bottom: 8, left: '50%', width: 14, transform: 'translateX(-7px)' }
            : { left: 8, right: 8, top: '50%', height: 14, transform: 'translateY(-7px)' }),
          borderRadius: 99,
          background: `linear-gradient(90deg, ${GLOW_GOLD}, #fff2b0, ${GLOW_GOLD})`,
          boxShadow: '0 0 22px 8px rgba(255, 220, 120, 0.7)',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}

/* ─── chop flash ─────────────────────────────────────────────────────── */

interface ChopFxState {
  key: number;
  rect: Rect;
  vertical: boolean;
}

function ChopFx({ fx, onDone }: { fx: ChopFxState; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 520);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${fx.rect.x * 100}%`,
        top: `${fx.rect.y * 100}%`,
        width: `${fx.rect.w * 100}%`,
        height: `${fx.rect.h * 100}%`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          ...(fx.vertical
            ? { top: 0, bottom: 0, left: '50%', width: 6, transform: 'translateX(-3px)' }
            : { left: 0, right: 0, top: '50%', height: 6, transform: 'translateY(-3px)' }),
          background: '#fff',
          borderRadius: 99,
          boxShadow: '0 0 18px 6px rgba(255,255,255,0.85)',
          animation: 'dojo-chop-flash 520ms ease-out forwards',
        }}
      />
    </div>
  );
}

/* ─── the board ──────────────────────────────────────────────────────── */

interface BoardViewProps {
  board: Board;
  /** The active tool, or null when the student has not picked one. */
  tool: Tool | null;
  /** Tightest denominator the chop tool may reach (puzzle-specific). */
  chopLimit?: number;
  /** When set, the matching label on every piece pulses. */
  highlightLabel?: LabelKind;
  /** A colored region overlay drawn over the board — used to point a follow-up
   *  question at a slice (one piece) or the whole board (a group). */
  highlight?: { rect: Rect; color: string };
  /** When set, a piece's numerator and denominator become independently tappable. */
  onLabelTap?: (id: string, label: LabelKind) => void;
  onPieceTap: (id: string) => void;
  onGlue: (idA: string, idB: string) => void;
}

export function BoardView({
  board,
  tool,
  chopLimit,
  highlightLabel,
  highlight,
  onLabelTap,
  onPieceTap,
  onGlue,
}: BoardViewProps) {
  const [chopFx, setChopFx] = useState<ChopFxState | null>(null);
  // A monotonic counter keys each flash, so two chops in the same millisecond
  // still remount ChopFx (Date.now() would collide and drop the second one).
  const chopFxCount = useRef(0);

  const seams = useMemo<GlueSeam[]>(() => {
    if (tool !== 'glue') return [];
    return gluablePairs(board).flatMap(([idA, idB]) => {
      const a = findPiece(board, idA);
      const b = findPiece(board, idB);
      if (!a || !b) return [];
      return [{ key: `${idA}|${idB}`, idA, idB, ...seamBetween(a.rect, b.rect) }];
    });
  }, [board, tool]);

  const handlePieceTap = (id: string) => {
    const piece = findPiece(board, id);
    // Flash only when the tap will actually chop a piece within the size limit.
    if (piece && !piece.locked && tool === 'chop' && canChopFurther(piece.value, chopLimit)) {
      chopFxCount.current += 1;
      setChopFx({
        key: chopFxCount.current,
        rect: piece.rect,
        vertical: piece.rect.w >= piece.rect.h,
      });
    }
    onPieceTap(id);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 26,
        padding: 22,
        boxSizing: 'border-box',
        background:
          'repeating-linear-gradient(125deg, #8a5224 0px, #8a5224 8px, #6b3f1f 9px, #8a5224 16px),' +
          'linear-gradient(180deg, #b07642 0%, #7a4a26 100%)',
        boxShadow:
          '0 24px 50px rgba(0,0,0,0.45), 0 0 0 4px #4d2c14, inset 0 0 0 4px #aa6e3c, inset 0 6px 0 rgba(255,255,255,0.12), inset 0 -10px 0 rgba(0,0,0,0.25)',
      }}
    >
      {/* corner nail studs */}
      {[
        { left: 8, top: 8 },
        { left: 8, bottom: 8 },
        { right: 8, top: 8 },
        { right: 8, bottom: 8 },
      ].map((pos, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            ...pos,
            width: 14,
            height: 14,
            borderRadius: 99,
            background:
              'radial-gradient(circle at 35% 30%, #d8c08a 0%, #8a6628 60%, #3a2811 100%)',
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.2)',
            zIndex: 4,
          }}
        />
      ))}

      {/* inner play area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 12,
          background: '#3a2516',
          overflow: 'hidden',
          boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.55)',
        }}
      >
        {board.pieces.map((piece) => (
          <PieceView
            key={piece.id}
            id={piece.id}
            numerator={piece.value.numerator}
            denominator={piece.value.denominator}
            rect={piece.rect}
            tool={tool}
            locked={piece.locked ?? false}
            chopLimit={chopLimit}
            highlightLabel={highlightLabel}
            onLabelTap={onLabelTap}
            onTap={handlePieceTap}
          />
        ))}

        {seams.map((seam) => (
          <GlueSeamButton key={seam.key} seam={seam} onTap={() => onGlue(seam.idA, seam.idB)} />
        ))}

        {chopFx && (
          <ChopFx key={chopFx.key} fx={chopFx} onDone={() => setChopFx(null)} />
        )}

        {highlight && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: `${highlight.rect.x * 100}%`,
              top: `${highlight.rect.y * 100}%`,
              width: `${highlight.rect.w * 100}%`,
              height: `${highlight.rect.h * 100}%`,
              border: `5px solid ${highlight.color}`,
              borderRadius: 12,
              boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 22px ${highlight.color}`,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        )}
      </div>
    </div>
  );
}
