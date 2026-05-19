/* A round wooden pause button.
 * Ported from the Claude Design handoff (claude.ai/design). */

import { IconPause } from './icons';

export function PauseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Pause"
      style={{
        width: 62,
        height: 62,
        borderRadius: 999,
        background:
          'radial-gradient(circle at 35% 30%, #f6ecd6 0%, #e0c890 60%, #b08c4a 100%)',
        boxShadow: '0 0 0 3px #1f1712, 0 6px 0 #1f1712, 0 10px 16px rgba(0,0,0,0.3)',
        display: 'grid',
        placeItems: 'center',
        color: '#1f1712',
        cursor: 'pointer',
      }}
    >
      <IconPause size={28} />
    </button>
  );
}
