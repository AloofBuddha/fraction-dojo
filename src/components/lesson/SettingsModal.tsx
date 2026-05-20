/* Settings modal — opened from the Pause button. Single screen with the
 * student's preferences plus a destructive Reset. Each row is its own
 * toggle/segment that persists immediately; no Save/Apply needed. */

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  INK,
  PARCHMENT_DARK,
  PARCHMENT_LIGHT,
  DOJO_RED,
} from '@/constants/theme';
import {
  getFont,
  getSoundEnabled,
  resetAllProgress,
  setFont,
  setSoundEnabled,
  type FontKey,
} from '@/utils/storage';
import { isEnabled as voiceEnabled, setEnabled as setVoiceEnabled } from './tts';

interface SettingsModalProps {
  onClose: () => void;
}

const SCRIM_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 150,
  cursor: 'pointer',
  animation: 'dojo-fade-in 180ms ease-out both',
};

const CARD_STYLE: CSSProperties = {
  background: `linear-gradient(180deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT_DARK} 100%)`,
  border: `4px solid ${INK}`,
  borderRadius: 22,
  padding: '28px 32px',
  width: 'min(440px, 92vw)',
  color: INK,
  fontFamily: 'Fredoka, system-ui, sans-serif',
  boxShadow: '0 0 0 4px rgba(0,0,0,0.18), 0 18px 36px rgba(0,0,0,0.4)',
  cursor: 'default',
};

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '2px dashed rgba(0,0,0,0.12)',
};

const LABEL_STYLE: CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  letterSpacing: 0.2,
};

const HINT_STYLE: CSSProperties = {
  fontSize: 13,
  color: '#6b3f1f',
  opacity: 0.75,
  marginTop: 2,
};

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={ROW_STYLE}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && <span style={HINT_STYLE}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* iOS-style pill switch. The row's label says what is being toggled;
 * the switch's position (knob left / right) shows whether it's on. No
 * "Off / On" caption is needed. */
function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 52,
        height: 30,
        borderRadius: 999,
        border: `2px solid ${INK}`,
        background: on
          ? `linear-gradient(180deg, #ef6f5a, ${DOJO_RED})`
          : 'rgba(0,0,0,0.18)',
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 180ms ease',
        boxShadow: `inset 0 2px 3px rgba(0,0,0,0.25)`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 24 : 2,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: '#fff',
          boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
          transition: 'left 180ms ease',
        }}
      />
    </button>
  );
}

/* The parent conditionally renders this so each open is a fresh mount —
 * useState initializers run, picking up any out-of-band changes (e.g. the
 * mic chip having flipped voice) without needing a useEffect resync. */
export function SettingsModal({ onClose }: SettingsModalProps) {
  const [sound, setSound] = useState(getSoundEnabled);
  const [voice, setVoice] = useState(voiceEnabled);
  const [font, setFontState] = useState<FontKey>(getFont);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSoundChange = (value: boolean) => {
    setSound(value);
    setSoundEnabled(value);
  };
  const onVoiceChange = (value: boolean) => {
    setVoice(value);
    setVoiceEnabled(value);
  };
  const onFontChange = (value: FontKey) => {
    setFontState(value);
    setFont(value);
  };
  const onResetConfirm = () => {
    resetAllProgress();
    window.location.reload();
  };

  return (
    <div style={SCRIM_STYLE} onClick={onClose}>
      <div style={CARD_STYLE} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Settings
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: INK,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <Row
          label="Sensei voice"
          hint="Speaks each line aloud. Currently a browser preview."
        >
          <Switch on={voice} onChange={onVoiceChange} label="Sensei voice" />
        </Row>

        <Row label="Sound effects" hint="Chop, glue, success — the dojo's audio.">
          <Switch on={sound} onChange={onSoundChange} label="Sound effects" />
        </Row>

        <Row
          label="Dyslexic font"
          hint="Easier reading for low-vision and dyslexic readers."
        >
          <Switch
            on={font === 'hyperlegible'}
            onChange={(v) => onFontChange(v ? 'hyperlegible' : 'default')}
            label="Dyslexic font"
          />
        </Row>

        <div style={{ marginTop: 22 }}>
          {confirmingReset ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 14, color: '#6b3f1f' }}>
                Erase all belts, lessons, and settings?
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  style={{
                    ...DANGER_BUTTON,
                    background: 'rgba(0,0,0,0.08)',
                    color: INK,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onResetConfirm}
                  style={DANGER_BUTTON}
                >
                  Erase
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              style={{
                ...DANGER_BUTTON,
                background: 'transparent',
                color: '#8b2a23',
                border: `2px solid #8b2a23`,
                boxShadow: 'none',
              }}
            >
              Reset progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const DANGER_BUTTON: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 10,
  border: `2px solid ${INK}`,
  background: `linear-gradient(180deg, #ef6f5a, ${DOJO_RED})`,
  color: '#fff',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: `0 3px 0 ${INK}`,
};
