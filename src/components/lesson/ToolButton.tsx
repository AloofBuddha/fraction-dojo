/* A big, tappable wooden tool button.
 * Ported from the Claude Design handoff (claude.ai/design). */

import type { MouseEvent, ReactNode } from 'react';

interface ToolButtonProps {
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  accent?: string;
  onClick: () => void;
  children: ReactNode;
}

export function ToolButton({
  label,
  hint,
  active = false,
  disabled = false,
  accent = '#d8453d',
  onClick,
  children,
}: ToolButtonProps) {
  const press = (event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) event.currentTarget.style.transform = 'translateY(4px)';
  };
  const release = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = 'none';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseDown={press}
      onMouseUp={release}
      onMouseLeave={release}
      style={{
        position: 'relative',
        width: 144,
        padding: '14px 8px 16px',
        borderRadius: 20,
        fontFamily: 'Fredoka, system-ui, sans-serif',
        background: disabled
          ? 'linear-gradient(180deg, #c8c2b2 0%, #aaa493 100%)'
          : active
            ? 'linear-gradient(180deg, #fff3c8 0%, #f1d177 100%)'
            : 'linear-gradient(180deg, #f6ecd6 0%, #e3cea0 100%)',
        boxShadow: disabled
          ? '0 0 0 3px #6f6a5e, 0 5px 0 #6f6a5e, 0 8px 14px rgba(0,0,0,0.22)'
          : active
            ? `0 0 0 4px ${accent}, 0 0 0 7px #1f1712, 0 8px 0 #1f1712, 0 0 26px rgba(216, 69, 61, 0.55)`
            : '0 0 0 3px #1f1712, 0 6px 0 #1f1712, 0 10px 18px rgba(0,0,0,0.25)',
        transition: 'transform 80ms ease, box-shadow 120ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <div
        className={active && !disabled ? 'tool-active' : undefined}
        style={{
          background: disabled ? '#e7e4db' : '#fff',
          borderRadius: 16,
          padding: 6,
          boxShadow: disabled
            ? 'inset 0 0 0 3px #6f6a5e'
            : 'inset 0 0 0 3px #1f1712, 0 3px 0 rgba(0,0,0,0.18)',
          filter: disabled ? 'grayscale(0.9)' : 'none',
        }}
      >
        {children}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: disabled ? '#6f6a5e' : '#1f1712',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            fontWeight: 500,
            fontSize: 12.5,
            color: '#6b3f1f',
            opacity: 0.78,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {hint}
        </div>
      )}
      {active && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            background: accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            boxShadow: '0 0 0 2px #1f1712, 0 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          READY
        </div>
      )}
    </button>
  );
}
