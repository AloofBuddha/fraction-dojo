/* global React */
/* Icons for the lesson chrome — flat vector, big, kid-friendly. */

function IconChop({ size = 64 }) {
  // A karate hand chopping down, with a small "swoosh" trail.
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <g>
        {/* speed trail */}
        <path d="M 16 24 Q 28 30 36 38" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85"/>
        <path d="M 12 38 Q 22 42 30 48" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65"/>

        {/* sleeve / cuff */}
        <path d="M 18 76 L 8 90 L 30 96 L 38 86 Z" fill="#f6ecd6" stroke="#1f1712" strokeWidth="3" strokeLinejoin="round"/>
        <rect x="20" y="80" width="22" height="6" fill="#1c1410" transform="rotate(-22 31 83)"/>

        {/* hand (chop shape — flat blade) */}
        <path
          d="M 28 70
             Q 24 60 32 50
             L 60 22
             Q 70 14 76 22
             Q 82 30 74 38
             L 60 54
             L 78 56
             Q 88 58 86 66
             Q 84 74 76 74
             L 50 78
             Q 38 80 30 74 Z"
          fill="#f6c992" stroke="#1f1712" strokeWidth="3.5" strokeLinejoin="round"
        />
        {/* thumb knuckle line */}
        <path d="M 50 64 Q 54 62 58 64" stroke="#1f1712" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* finger lines */}
        <path d="M 58 36 Q 62 32 64 30" stroke="#1f1712" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M 64 42 Q 68 38 70 36" stroke="#1f1712" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function IconBandaid({ size = 64 }) {
  // A cartoony band-aid on a slight tilt.
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <g transform="rotate(-22 50 50)">
        {/* left pad */}
        <rect x="6" y="36" width="34" height="28" rx="10" fill="#f0b876" stroke="#1f1712" strokeWidth="3"/>
        {/* right pad */}
        <rect x="60" y="36" width="34" height="28" rx="10" fill="#f0b876" stroke="#1f1712" strokeWidth="3"/>
        {/* middle pad (gauze) */}
        <rect x="34" y="38" width="32" height="24" fill="#f8e8c4" stroke="#1f1712" strokeWidth="3"/>
        {/* dots on pads */}
        <circle cx="14" cy="44" r="2.2" fill="#1f1712"/>
        <circle cx="22" cy="56" r="2.2" fill="#1f1712"/>
        <circle cx="32" cy="44" r="2.2" fill="#1f1712"/>
        <circle cx="14" cy="56" r="2.2" fill="#1f1712"/>
        <circle cx="68" cy="44" r="2.2" fill="#1f1712"/>
        <circle cx="76" cy="56" r="2.2" fill="#1f1712"/>
        <circle cx="86" cy="44" r="2.2" fill="#1f1712"/>
        <circle cx="86" cy="56" r="2.2" fill="#1f1712"/>
        {/* shine */}
        <path d="M 38 42 L 62 42" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </g>
    </svg>
  );
}

function IconPause({ size = 28 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <rect x="6" y="5" width="4.5" height="14" rx="1.4" fill="currentColor"/>
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.4" fill="currentColor"/>
    </svg>
  );
}

function IconUndo({ size = 28 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M 9 7 L 4 12 L 9 17" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 4 12 H 14 a 5 5 0 0 1 5 5 v 1" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function IconMic({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/>
      <path d="M 6 11 a 6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconCheck({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M 4 12 L 10 18 L 20 6" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconStar({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M 12 2 L 14.9 8.6 L 22 9.3 L 16.6 14 L 18.3 21 L 12 17.4 L 5.7 21 L 7.4 14 L 2 9.3 L 9.1 8.6 Z" fill="currentColor"/>
    </svg>
  );
}

Object.assign(window, { IconChop, IconBandaid, IconPause, IconUndo, IconMic, IconCheck, IconStar });
