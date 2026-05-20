/* A non-interactive thumbnail of a step's goal board — a clean schematic
 * (no wood frame, no nails) so a glance reads as "two red halves" rather
 * than the small replica of the big board. */

import type { Board } from '@/core/board';
import { INK, PIECE_FILL_BY_DENOMINATOR } from '@/constants/theme';

function fillFor(denominator: number): string {
  return PIECE_FILL_BY_DENOMINATOR[denominator] ?? PIECE_FILL_BY_DENOMINATOR[64];
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
          border: `3px solid ${INK}`,
          borderRadius: 8,
          boxShadow: `0 4px 0 ${INK}`,
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
                border: `2px solid ${INK}`,
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
