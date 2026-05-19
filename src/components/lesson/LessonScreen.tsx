/* The lesson screen — the full dojo, integrated from the Claude Design handoff.
 *
 * The frame fills the whole viewport (tablet-first, landscape) and is
 * responsive. Three tools drive the board manipulative:
 *  - Chop     — tap a piece to split it in two (capped at 1/64).
 *  - Glue     — tap a glowing seam to merge two adjacent same-denominator pieces.
 *  - Simplify — tap a glowing piece to reduce its fraction (2/4 → 1/2).
 * The sensei dialogue and belt are static for now — the lesson engine that
 * drives them is the next step.
 */

import { useState } from 'react';
import {
  type Board,
  createBoard,
  chop,
  glue,
  canGlue,
  simplify,
  canSimplify,
  findPiece,
} from '@/core/board';
import { BoardView, type Tool } from './BoardView';
import { canChopFurther } from './chop-limit';
import { ToolButton } from './ToolButton';
import { Sensei } from './Sensei';
import { SpeechBubble } from './SpeechBubble';
import { DojoBackground } from './DojoBackground';
import { BeltBar } from './BeltBar';
import { PauseButton } from './PauseButton';
import { IconChop, IconGlue, IconSimplify } from './icons';
import '@/styles/dojo.css';

export function LessonScreen() {
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [tool, setTool] = useState<Tool>('chop');

  // Chop or simplify the tapped piece, depending on the active tool.
  const handlePieceTap = (id: string) => {
    const piece = findPiece(board, id);
    if (!piece) return;
    if (tool === 'chop') {
      // refuse a chop that would take the piece past the 1/64 readability limit
      if (canChopFurther(piece.value)) {
        setBoard(chop(board, id));
      }
    } else if (tool === 'simplify') {
      if (canSimplify(board, id)) {
        setBoard(simplify(board, id));
      }
    }
  };

  // Glue two pieces at the tapped seam.
  const handleGlue = (idA: string, idB: string) => {
    if (canGlue(board, idA, idB)) {
      setBoard(glue(board, idA, idB));
    }
  };

  return (
    <div className="stage">
      <div className="frame">
        <DojoBackground />

        {/* top bar — on the wooden beam: pause left, belt + lesson centered. */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 112, zIndex: 5 }}>
          <div
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <PauseButton />
          </div>
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BeltBar rankIndex={0} label="Lesson 1 · Equivalent Fractions" />
          </div>
        </div>

        {/* main row — sensei (1/4) · board (2/4) · tools (1/4), even gaps */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 200,
            bottom: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: 20,
            padding: '0 20px',
            zIndex: 2,
          }}
        >
          {/* sensei + speech bubble — stacked, centered in the column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              height: '100%',
              paddingBottom: 14,
            }}
          >
            <div style={{ width: 'min(100%, 360px)' }}>
              <SpeechBubble
                text="Welcome to the dojo, young student!"
                accent="Pick your karate chop and split the board in two."
              />
            </div>
            <div
              style={{
                width: 'min(260px, 100%)',
                aspectRatio: '400 / 520',
                marginTop: 8,
                pointerEvents: 'none',
              }}
            >
              <Sensei mood="happy" talking />
            </div>
          </div>

          {/* board — a centered square, top-aligned so the tools line up to it */}
          <div style={{ display: 'grid', placeItems: 'start center' }}>
            <div style={{ width: 'min(100%, calc(100svh - 220px))' }}>
              <BoardView
                board={board}
                tool={tool}
                onPieceTap={handlePieceTap}
                onGlue={handleGlue}
              />
            </div>
          </div>

          {/* tools — top-aligned to the board, centered in the column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 14,
              fontFamily: 'Fredoka, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 2,
                color: '#7a4a26',
                textTransform: 'uppercase',
              }}
            >
              Your Tools
            </div>

            <ToolButton
              label="Chop"
              hint="Splits a piece in two"
              active={tool === 'chop'}
              onClick={() => setTool('chop')}
            >
              <IconChop size={48} />
            </ToolButton>

            <ToolButton
              label="Glue"
              hint="Fuses two pieces into one"
              accent="#f3b13a"
              active={tool === 'glue'}
              onClick={() => setTool('glue')}
            >
              <IconGlue size={48} />
            </ToolButton>

            <ToolButton
              label="Simplify"
              hint="Reduces a piece to lower terms"
              accent="#5fb24a"
              active={tool === 'simplify'}
              onClick={() => setTool('simplify')}
            >
              <IconSimplify size={44} />
            </ToolButton>
          </div>
        </div>
      </div>
    </div>
  );
}
