/* Icons for the lesson chrome.
 *
 * The chop and glue tool icons render the PNG art in `public/assets/icons/` —
 * bold, flat, consistent. Pause and mic are small inline SVGs. */

interface IconProps {
  size?: number;
}

/** The karate-chop tool icon. */
export function IconChop({ size = 52 }: IconProps) {
  return (
    <img
      src="/assets/icons/chop.png"
      alt=""
      style={{ width: size, height: 'auto', display: 'block' }}
    />
  );
}

/** The glue tool icon. */
export function IconGlue({ size = 52 }: IconProps) {
  return (
    <img
      src="/assets/icons/glue.png"
      alt=""
      style={{ width: size, height: 'auto', display: 'block' }}
    />
  );
}

/** The simplify tool icon — a "reduce" double-chevron. Placeholder until a
 *  matching PNG (like chop/glue) is dropped into public/assets/icons/. */
export function IconSimplify({ size = 46 }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <path
        d="M 26 30 L 50 52 L 74 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 26 54 L 50 76 L 74 54"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Pause bars. */
export function IconPause({ size = 28 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="6" y="5" width="4.5" height="14" rx="1.4" fill="currentColor" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.4" fill="currentColor" />
    </svg>
  );
}

/** A microphone — marks the sensei's speech as voice-first. */
export function IconMic({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M 6 11 a 6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
