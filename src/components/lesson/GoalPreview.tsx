/* A non-interactive thumbnail of a step's goal board — a clean schematic
 * (no wood frame, no nails) so a glance reads as "two red halves" rather
 * than the small replica of the big board. */

import type { Board } from '@/core/board';

// Colour per denominator, matching the dojo's piece styles in dojo.css.
const PIECE_FILL: Record<number, string> = {
  1: '#d2a273',
  2: '#e85f4e',
  4: '#f3b13a',
  8: '#7ab560',
  16: '#5ba5d9',
  32: '#a586d4',
  64: '#e87fb4',
};

function fillFor(denominator: number): string {
  return PIECE_FILL[denominator] ?? PIECE_FILL[64];
}

interface GoalPreviewProps {
  board: Board;
}

export function GoalPreview({ board }: GoalPreviewProps) {
  return (
    // aria-hidden — decorative; tests and screen readers ignore the pieces
    // inside so they don't masquerade as real piece buttons.
    <div
      aria-hidden
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2,
          color: '#7a4a26',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Goal
      </div>
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 140,
          background: '#8a5224',
          border: '3px solid #1f1712',
          borderRadius: 8,
          boxShadow: '0 4px 0 #1f1712',
          overflow: 'hidden',
        }}
      >
        {board.pieces.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: `${piece.rect.x * 100}%`,
              top: `${piece.rect.y * 100}%`,
              width: `${piece.rect.w * 100}%`,
              height: `${piece.rect.h * 100}%`,
              padding: 3,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: fillFor(piece.value.denominator),
                border: '2px solid #1f1712',
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
