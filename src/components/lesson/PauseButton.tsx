/* A round wooden pause button.
 * Ported from the Claude Design handoff (claude.ai/design). */

import { IconPause } from './icons';
import { INK } from '@/constants/theme';

export function PauseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Pause"
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        background:
          'radial-gradient(circle at 35% 30%, #f6ecd6 0%, #e0c890 60%, #b08c4a 100%)',
        boxShadow: `0 0 0 3px ${INK}, 0 4px 0 ${INK}, 0 6px 12px rgba(0,0,0,0.3)`,
        display: 'grid',
        placeItems: 'center',
        color: INK,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <IconPause size={20} />
    </button>
  );
}
