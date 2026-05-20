/* The sensei's speech bubble — a rice-paper card.
 * Ported from the Claude Design handoff (claude.ai/design). */

import { IconMic } from './icons';
import { DOJO_RED, INK, PARCHMENT_DARK, PARCHMENT_LIGHT } from '@/constants/theme';

interface SpeechBubbleProps {
  text: string;
  /** A quieter coaching hint shown beneath the main line. */
  accent?: string;
  talking?: boolean;
}

export function SpeechBubble({ text, accent, talking = true }: SpeechBubbleProps) {
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: PARCHMENT_LIGHT,
        backgroundImage: `linear-gradient(180deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT_DARK} 100%)`,
        borderRadius: 22,
        padding: '20px 22px 22px',
        border: `4px solid ${INK}`,
        boxShadow: `0 0 0 4px ${DOJO_RED}, 0 12px 0 rgba(0,0,0,0.22), 0 18px 28px rgba(0,0,0,0.22)`,
        fontFamily: 'Fredoka, system-ui, sans-serif',
      }}
    >
      {/* washi-tape decoration */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: 22,
          width: 70,
          height: 22,
          background: `repeating-linear-gradient(135deg, ${DOJO_RED} 0 8px, #a82e28 8px 16px)`,
          transform: 'rotate(-6deg)',
          borderRadius: 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
      {/* mic indicator — voice-first */}
      <div
        style={{
          position: 'absolute',
          top: -14,
          right: 16,
          background: '#1c1410',
          color: '#fff',
          borderRadius: 999,
          padding: '5px 11px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 99,
            background: DOJO_RED,
            animation: talking ? 'dojo-pulse 900ms ease-in-out infinite' : 'none',
          }}
        />
        <IconMic size={16} />
        Sensei
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 1.2,
          color: INK,
        }}
      >
        {text}
      </div>
      {accent && (
        <div
          style={{
            marginTop: 10,
            fontWeight: 500,
            fontSize: 15,
            color: '#7a4a26',
            lineHeight: 1.3,
          }}
        >
          {accent}
        </div>
      )}

      {/* speech tail — points straight down at the sensei below the bubble */}
      <svg
        viewBox="0 0 48 34"
        width="48"
        height="34"
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '100%',
          transform: 'translateX(-50%)',
          marginTop: 6,
          filter: 'drop-shadow(0 5px 0 rgba(0,0,0,0.16))',
        }}
      >
        <path
          d="M 5 0 L 43 0 L 24 30 Z"
          fill={PARCHMENT_LIGHT}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
