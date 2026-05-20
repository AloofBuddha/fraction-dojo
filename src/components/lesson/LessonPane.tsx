/* The right-side lesson selector — slides in when the TopicChip is tapped.
 * Lists ONLY the belts the student has unlocked (white always, plus any
 * belt advanced to); each belt's lesson sits as a sub-item beneath. Future
 * belts are hidden entirely — not greyed-out — so the pane is a positive
 * "here's what you've earned" surface, not a teaser of locked content. */

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import type { Lesson } from '@/core/lesson';
import type { BeltKey } from '@/core/types';
import { BELT_COLORS, BELT_RANKS, INK, PARCHMENT_LIGHT } from '@/constants/theme';

interface LessonPaneProps {
  /** Whether the pane is showing — drives the slide-in transform. */
  visible: boolean;
  /** Every lesson in the curriculum, in belt order. The pane filters by
   *  `unlocked` so locked belts never appear. */
  lessons: readonly Lesson[];
  /** Belt keys the student has reached so far. White is always included. */
  unlocked: Set<BeltKey>;
  /** The student's current belt — highlighted in the list. */
  currentBelt: BeltKey | null;
  /** Tapping an unlocked lesson row. */
  onJump: (lessonIndex: number) => void;
  /** Tapping outside the pane or the close affordance. */
  onClose: () => void;
}

const PANE_WIDTH = 360;
const SLIDE_DURATION_MS = 220;

const BACKDROP_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.32)',
  zIndex: 9,
  transition: `opacity ${SLIDE_DURATION_MS}ms ease`,
};

const PANE_STYLE: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: PANE_WIDTH,
  background:
    'linear-gradient(180deg, rgba(34, 20, 10, 0.96) 0%, rgba(20, 12, 6, 0.96) 100%)',
  color: PARCHMENT_LIGHT,
  fontFamily: 'Fredoka, system-ui, sans-serif',
  borderLeft: `4px solid ${INK}`,
  boxShadow: '-12px 0 30px rgba(0,0,0,0.5)',
  transition: `transform ${SLIDE_DURATION_MS}ms ease`,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10,
};

const HEADER_STYLE: CSSProperties = {
  padding: '18px 22px 14px',
  borderBottom: '2px solid rgba(255, 220, 150, 0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: 0.4,
};

const CLOSE_BUTTON_STYLE: CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PARCHMENT_LIGHT,
  cursor: 'pointer',
  fontSize: 22,
  lineHeight: 1,
  padding: 4,
  borderRadius: 6,
};

const LIST_STYLE: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '14px 0',
};

export function LessonPane({
  visible,
  lessons,
  unlocked,
  currentBelt,
  onJump,
  onClose,
}: LessonPaneProps) {
  // Esc closes the pane. Wires once and only while visible.
  useEffect(() => {
    if (!visible) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  const orderedLessons = lessons
    .map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => unlocked.has(lesson.belt))
    // Match BELT_RANKS order so belts read top-to-bottom in karate order
    // regardless of how the curriculum array was authored.
    .sort(
      (a, b) =>
        BELT_RANKS.findIndex((r) => r.key === a.lesson.belt) -
        BELT_RANKS.findIndex((r) => r.key === b.lesson.belt),
    );

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        style={{
          ...BACKDROP_STYLE,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />
      <aside
        aria-label="Lessons"
        aria-hidden={!visible}
        style={{
          ...PANE_STYLE,
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div style={HEADER_STYLE}>
          <span>Lessons</span>
          <button
            type="button"
            aria-label="Close lessons"
            onClick={onClose}
            style={CLOSE_BUTTON_STYLE}
          >
            ✕
          </button>
        </div>
        <div style={LIST_STYLE}>
          {orderedLessons.map(({ lesson, index }) => {
            const swatch = BELT_COLORS[lesson.belt];
            const isCurrent = lesson.belt === currentBelt;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onJump(index)}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 22px',
                  background: isCurrent
                    ? 'rgba(255, 220, 150, 0.10)'
                    : 'transparent',
                  border: 'none',
                  borderLeft: isCurrent
                    ? '4px solid rgba(255, 220, 150, 0.7)'
                    : '4px solid transparent',
                  color: PARCHMENT_LIGHT,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 15,
                  transition: 'background 120ms ease',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: swatch.color,
                    border: `2px solid ${swatch.trim}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>
                    {lesson.title}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      opacity: 0.78,
                      letterSpacing: 0.2,
                    }}
                  >
                    {lesson.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
