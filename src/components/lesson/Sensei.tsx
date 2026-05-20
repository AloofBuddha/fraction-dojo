/* The sensei — a friendly karate master, flat-vector cartoon. His expression
 * follows the lesson's mood. Ported from the Claude Design handoff. */

import { useMemo } from 'react';
import { DOJO_RED, INK } from '@/constants/theme';

export type SenseiMood = 'happy' | 'cheer' | 'think' | 'wow';

interface SenseiProps {
  mood?: SenseiMood;
  talking?: boolean;
  /** When true, the sensei does a happy hop — used on a step's success. */
  celebrating?: boolean;
}

export function Sensei({ mood = 'happy', talking = true, celebrating = false }: SenseiProps) {
  const eyeKind = useMemo(() => {
    switch (mood) {
      case 'cheer':
        return 'closed-up';
      case 'think':
        return 'side';
      case 'wow':
        return 'wide';
      default:
        return 'open';
    }
  }, [mood]);

  const renderEye = (cx: number, cy: number, mirror: boolean) => {
    if (eyeKind === 'closed-up') {
      return (
        <path
          d={`M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 3}`}
          stroke={INK}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (eyeKind === 'side') {
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx="8.5" ry="9" fill="#fff" />
          <circle cx={cx + (mirror ? -2 : 3)} cy={cy + 1} r="4.2" fill={INK} />
          <circle cx={cx + (mirror ? -3 : 2)} cy={cy - 1.5} r="1.3" fill="#fff" />
        </g>
      );
    }
    if (eyeKind === 'wide') {
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx="10" ry="11" fill="#fff" />
          <circle cx={cx} cy={cy + 1} r="5" fill={INK} />
          <circle cx={cx - 1.5} cy={cy - 1} r="1.6" fill="#fff" />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="7" ry="8" fill="#fff" />
        <circle cx={cx} cy={cy + 1} r="4" fill={INK} />
        <circle cx={cx - 1.2} cy={cy - 1} r="1.3" fill="#fff" />
      </g>
    );
  };

  const mouth =
    mood === 'cheer' ? (
      <path d="M 175 222 Q 200 248 225 222 Q 200 235 175 222" fill="#7d2a20" stroke="#3a1410" strokeWidth="2.5" strokeLinejoin="round" />
    ) : mood === 'wow' ? (
      <ellipse cx="200" cy="228" rx="11" ry="14" fill="#7d2a20" stroke="#3a1410" strokeWidth="2.5" />
    ) : (
      <path d="M 178 224 Q 200 240 222 224" stroke="#3a1410" strokeWidth="4" strokeLinecap="round" fill="none" />
    );

  return (
    <svg
      viewBox="0 0 400 520"
      width="100%"
      height="100%"
      className={celebrating ? 'sensei-cheer' : undefined}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="senseiGi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf3da" />
          <stop offset="100%" stopColor="#e7d4a7" />
        </linearGradient>
        <linearGradient id="senseiSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6c992" />
          <stop offset="100%" stopColor="#dfa367" />
        </linearGradient>
        <radialGradient id="senseiCheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f49680" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f49680" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* body — gi */}
      <g>
        <path
          d="M 105 470 Q 100 510 130 510 L 270 510 Q 300 510 295 470 L 295 430 L 105 430 Z"
          fill="#f0e1b4"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 80 300 Q 70 280 95 270 L 305 270 Q 330 280 320 300 L 320 440 Q 320 460 300 460 L 100 460 Q 80 460 80 440 Z"
          fill="url(#senseiGi)"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M 200 270 L 130 460 L 165 460 L 215 290 Z" fill="#e7d4a7" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 200 270 L 270 460 L 235 460 L 185 290 Z" fill="#f6ecd6" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <rect x="80" y="380" width="240" height="28" fill="#1c1410" stroke="#000" strokeWidth="2" />
        <rect x="80" y="384" width="240" height="4" fill="#3a2e26" opacity="0.5" />
        <rect x="186" y="372" width="28" height="44" rx="4" fill="#1c1410" stroke="#000" strokeWidth="2" />
        <rect x="196" y="416" width="8" height="22" fill="#1c1410" />
        <rect x="186" y="416" width="8" height="18" fill="#1c1410" />
      </g>

      {/* arms */}
      <g>
        <path
          d="M 305 295 Q 360 250 360 180 Q 360 145 325 145 Q 295 145 295 200 L 295 300 Z"
          fill="url(#senseiGi)"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <g>
          <circle cx="335" cy="135" r="22" fill="url(#senseiSkin)" stroke={INK} strokeWidth="4" />
          <path d="M 322 122 Q 320 110 327 108" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 332 118 Q 330 105 338 104" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 342 120 Q 342 109 349 110" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
        <path
          d="M 95 295 Q 60 320 65 380 Q 68 420 92 416 Q 110 412 108 380 L 105 300 Z"
          fill="url(#senseiGi)"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="418" r="20" fill="url(#senseiSkin)" stroke={INK} strokeWidth="4" />
      </g>

      {/* head */}
      <g className={talking ? 'bob' : undefined} style={{ transformOrigin: '200px 280px' }}>
        <rect x="180" y="240" width="40" height="40" fill="url(#senseiSkin)" stroke={INK} strokeWidth="4" />
        <ellipse cx="200" cy="200" rx="78" ry="86" fill="url(#senseiSkin)" stroke={INK} strokeWidth="5" />
        <ellipse cx="155" cy="222" rx="15" ry="10" fill="url(#senseiCheek)" />
        <ellipse cx="245" cy="222" rx="15" ry="10" fill="url(#senseiCheek)" />
        <ellipse cx="124" cy="200" rx="10" ry="16" fill="url(#senseiSkin)" stroke={INK} strokeWidth="4" />
        <ellipse cx="276" cy="200" rx="10" ry="16" fill="url(#senseiSkin)" stroke={INK} strokeWidth="4" />
        <path d="M 155 175 Q 168 165 185 174" stroke="#2a1a10" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M 245 175 Q 232 165 215 174" stroke="#2a1a10" strokeWidth="7" fill="none" strokeLinecap="round" />
        {renderEye(170, 195, false)}
        {renderEye(230, 195, true)}
        <path d="M 200 200 Q 195 218 200 224 Q 205 226 210 222" stroke="#9a6b3a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {mouth}
        <path
          d="M 178 218 Q 188 215 198 220 Q 208 215 222 218 Q 218 226 200 226 Q 184 226 178 218 Z"
          fill="#241409"
          stroke="#000"
          strokeWidth="1.5"
        />
        <g>
          <path
            d="M 122 158 Q 200 138 278 158 L 282 178 Q 200 158 118 178 Z"
            fill={DOJO_RED}
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="160" r="13" fill="#f6ecd6" stroke={INK} strokeWidth="3" />
          <path d="M 196 154 L 196 166 M 191 158 L 204 158 M 200 158 L 205 165" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M 270 168 Q 305 175 322 200 Q 308 196 296 198 Q 292 188 270 188 Z"
            fill={DOJO_RED}
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M 130 140 Q 150 110 200 100 Q 250 110 270 140 Q 248 125 200 124 Q 152 125 130 140 Z"
          fill="#1f1410"
          stroke="#000"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
