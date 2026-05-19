/* The lesson screen — the dojo, driven by the lesson engine.
 *
 * It walks the student through the curriculum in ./lessons. A `board` step is
 * a puzzle (start board → goal board), optionally followed by understanding-
 * check sub-prompts where the student taps numbers from a palette to fill one
 * or two slots, each colour-coded to a region on the board. A `question` step
 * keeps the board on screen as a scratchpad and asks for a fraction. Tools
 * reveal progressively. Each step ends with a Continue gate.
 */

import { useState } from 'react';
import {
  type Board,
  type Tool,
  type Rect,
  createBoard,
  chop,
  glue,
  canGlue,
  gluablePairs,
  simplify,
  canSimplify,
  findPiece,
} from '@/core/board';
import type { Step, SubPromptSlot } from '@/core/lesson';
import { fraction } from '@/core/fraction';
import { BoardView } from './BoardView';
import { QuestionPanel } from './QuestionPanel';
import { Confetti } from './Confetti';
import { GoalPreview } from './GoalPreview';
import { NumberPad } from './NumberPad';
import { canChopFurther } from './chop-limit';
import { playSound } from './sound';
import { LESSONS } from './lessons';
import { ToolButton } from './ToolButton';
import { Sensei } from './Sensei';
import { SpeechBubble } from './SpeechBubble';
import { DojoBackground } from './DojoBackground';
import { BeltBar } from './BeltBar';
import { PauseButton } from './PauseButton';
import { IconChop, IconGlue, IconSimplify } from './icons';
import '@/styles/dojo.css';

const FIRST_STEP = LESSONS[0].steps[0];
const INITIAL_BOARD = FIRST_STEP.kind === 'board' ? FIRST_STEP.startBoard : createBoard();

// A pause after a completing move before the follow-ups or the celebration —
// long enough for the sensei's success line to be read.
const SETTLE_MS = 1200;

// A pause showing a sub-prompt's "right" line before advancing to the next.
const FOLLOWUP_RIGHT_MS = 1300;

// Every tool introduced by a board step up to and including (lessonIndex,
// stepIndex) — drives which tool buttons are on screen.
function revealedTools(lessonIndex: number, stepIndex: number): Set<Tool> {
  const revealed = new Set<Tool>();
  LESSONS.forEach((lesson, li) => {
    if (li > lessonIndex) return;
    lesson.steps.forEach((step, si) => {
      if (li === lessonIndex && si > stepIndex) return;
      if (step.kind === 'board') step.allowedTools.forEach((t) => revealed.add(t));
    });
  });
  return revealed;
}

// The board a step puts on screen — its puzzle, or a question's scratchpad.
function stepBoard(step: Step): Board {
  return step.kind === 'board' ? step.startBoard : step.scratchBoard;
}

// The bounding rect over a slot's highlighted pieces — single piece, group of
// pieces, or nothing if the slot has no highlight.
function highlightFor(
  slot: SubPromptSlot,
  board: Board,
): { rect: Rect; color: string } | undefined {
  if (!slot.color) return undefined;
  const ids =
    slot.highlightPieces ?? (slot.highlightPiece ? [slot.highlightPiece] : []);
  if (ids.length === 0) return undefined;
  const rects = ids.flatMap((id) => {
    const piece = findPiece(board, id);
    return piece ? [piece.rect] : [];
  });
  if (rects.length === 0) return undefined;
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.w));
  const maxY = Math.max(...rects.map((r) => r.y + r.h));
  return {
    rect: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
    color: slot.color,
  };
}

export function LessonScreen() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [tool, setTool] = useState<Tool | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [settling, setSettling] = useState(false);
  const [numInput, setNumInput] = useState('');
  const [denInput, setDenInput] = useState('');
  const [feedbackWrong, setFeedbackWrong] = useState(false);
  const [followUpIndex, setFollowUpIndex] = useState<number | null>(null);
  const [followUpFeedback, setFollowUpFeedback] = useState<
    'none' | 'right' | 'wrong'
  >('none');
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotValues, setSlotValues] = useState<(number | null)[]>([]);

  const lesson = LESSONS[lessonIndex];
  const step = lesson?.steps[stepIndex];
  const done = lessonIndex >= LESSONS.length;
  const isQuestion = step?.kind === 'question';
  const revealed = revealedTools(lessonIndex, stepIndex);

  // The current sub-prompt — undefined unless we are in the follow-up phase.
  const followUp =
    followUpIndex !== null && step?.kind === 'board' && step.followUps
      ? step.followUps[followUpIndex]
      : undefined;
  const currentSlot = followUp?.slots[slotIndex];

  // The colored region overlay on the play board — comes from the focused slot.
  const highlight = currentSlot ? highlightFor(currentSlot, board) : undefined;

  // A step's goal is met — celebrate, with a belt-up jingle on a belt's final.
  const celebrate = () => {
    setCelebrating(true);
    const lastStep = !!lesson && stepIndex + 1 >= lesson.steps.length;
    playSound(lastStep ? 'beltUp' : 'success');
  };

  // Apply a board change. If it completes the step, settle for a beat, then
  // either enter the follow-up phase or celebrate directly.
  const applyMove = (next: Board) => {
    setBoard(next);
    if (step?.kind === 'board' && step.isComplete(next)) {
      const completedStep = step;
      setSettling(true);
      window.setTimeout(() => {
        setSettling(false);
        if (completedStep.followUps && completedStep.followUps.length > 0) {
          const firstSub = completedStep.followUps[0];
          setFollowUpIndex(0);
          setSlotIndex(0);
          setSlotValues(new Array(firstSub.slots.length).fill(null));
        } else {
          celebrate();
        }
      }, SETTLE_MS);
    }
  };

  // Move to the next sub-prompt — or, if this was the last, celebrate.
  const advanceFollowUp = () => {
    if (!step || step.kind !== 'board' || !step.followUps || followUpIndex === null) {
      return;
    }
    setFollowUpFeedback('none');
    const next = followUpIndex + 1;
    if (next >= step.followUps.length) {
      setFollowUpIndex(null);
      setSlotIndex(0);
      setSlotValues([]);
      celebrate();
    } else {
      const nextSub = step.followUps[next];
      setFollowUpIndex(next);
      setSlotIndex(0);
      setSlotValues(new Array(nextSub.slots.length).fill(null));
    }
  };

  // The student tapped a tile. Check it against the focused slot's correct
  // value; if right, fill the slot and advance focus (or finish the sub-prompt);
  // if wrong, show the slot's wrong-line and wait for a correct tap.
  const handleTileTap = (value: number) => {
    if (!followUp || followUpFeedback === 'right') return;
    const slot = followUp.slots[slotIndex];
    if (value === slot.correctValue) {
      const updated = slotValues.map((v, i) => (i === slotIndex ? value : v));
      setSlotValues(updated);
      setFollowUpFeedback('none');
      if (slotIndex + 1 >= followUp.slots.length) {
        setFollowUpFeedback('right');
        playSound('continue');
        window.setTimeout(advanceFollowUp, FOLLOWUP_RIGHT_MS);
      } else {
        setSlotIndex(slotIndex + 1);
        playSound('select');
      }
    } else {
      setFollowUpFeedback('wrong');
      playSound('wrong');
    }
  };

  // Set up the board for a step the runner is about to show. No tool is
  // auto-selected — the student picks one.
  const enterStep = (next: Step) => {
    setBoard(stepBoard(next));
  };

  // Tap Continue once a step is done — move to the next step / lesson.
  const advance = () => {
    if (!lesson) return;
    playSound('continue');
    if (stepIndex + 1 < lesson.steps.length) {
      setStepIndex(stepIndex + 1);
      enterStep(lesson.steps[stepIndex + 1]);
    } else {
      const nextLesson = LESSONS[lessonIndex + 1];
      setLessonIndex(lessonIndex + 1);
      setStepIndex(0);
      if (nextLesson) enterStep(nextLesson.steps[0]);
    }
    setCelebrating(false);
    setFeedbackWrong(false);
    setNumInput('');
    setDenInput('');
    setFollowUpIndex(null);
    setFollowUpFeedback('none');
    setSlotIndex(0);
    setSlotValues([]);
  };

  // Check a question step's answer.
  const submitAnswer = () => {
    if (step?.kind !== 'question') return;
    const num = Number(numInput);
    const den = Number(denInput);
    const valid =
      numInput !== '' &&
      denInput !== '' &&
      Number.isInteger(num) &&
      Number.isInteger(den) &&
      num >= 0 &&
      den > 0;
    if (valid && step.isCorrect(fraction(num, den))) {
      celebrate();
    } else {
      setFeedbackWrong(true);
      playSound('wrong');
    }
  };

  // Editing an answer clears the "wrong" feedback back to the question.
  const editNumerator = (value: string) => {
    setNumInput(value);
    setFeedbackWrong(false);
  };
  const editDenominator = (value: string) => {
    setDenInput(value);
    setFeedbackWrong(false);
  };

  // Which tools are usable now — a board step's allowed set, or, on a question
  // scratchpad, every tool learned so far.
  const toolAllowed = (t: Tool) => {
    if (!step || celebrating || settling || followUpIndex !== null) return false;
    return step.kind === 'board' ? step.allowedTools.includes(t) : revealed.has(t);
  };
  const chopLimit = step?.kind === 'board' ? step.maxDenominator : undefined;
  const chopEnabled =
    toolAllowed('chop') && board.pieces.some((p) => canChopFurther(p.value, chopLimit));
  const glueEnabled = toolAllowed('glue') && gluablePairs(board).length > 0;
  const simplifyEnabled =
    toolAllowed('simplify') && board.pieces.some((p) => canSimplify(board, p.id));

  // The tool BoardView reflects — the selected one only if it's usable now.
  const activeTool: Tool | null = tool && toolAllowed(tool) ? tool : null;

  // Picking a tool — nothing is auto-selected; the student chooses.
  const selectTool = (t: Tool) => {
    setTool(t);
    playSound('select');
  };

  const handlePieceTap = (id: string) => {
    if (settling || followUpIndex !== null) return;
    const piece = findPiece(board, id);
    if (!piece) return;
    if (piece.locked) {
      playSound('wrong');
      return;
    }
    if (tool === 'chop' && chopEnabled && canChopFurther(piece.value, chopLimit)) {
      playSound('chop');
      applyMove(chop(board, id));
    } else if (tool === 'simplify' && simplifyEnabled && canSimplify(board, id)) {
      playSound('simplify');
      applyMove(simplify(board, id));
    } else {
      playSound('wrong');
    }
  };

  const handleGlue = (idA: string, idB: string) => {
    if (settling || followUpIndex !== null) return;
    if (glueEnabled && canGlue(board, idA, idB)) {
      playSound('glue');
      applyMove(glue(board, idA, idB));
    } else {
      playSound('wrong');
    }
  };

  // What the sensei is saying right now.
  const senseiSays = (): string => {
    if (done) {
      const lastBelt = LESSONS[LESSONS.length - 1].title;
      return `Outstanding — you have earned your ${lastBelt}. Equivalence, mastered!`;
    }
    if (!step) return '';
    if (celebrating) {
      return step.kind === 'question' ? step.correctLine : step.successLine;
    }
    if (followUp && currentSlot) {
      if (followUpFeedback === 'right') return followUp.correctLine;
      if (followUpFeedback === 'wrong') return currentSlot.wrongLine;
      return currentSlot.prompt;
    }
    if (settling && step.kind === 'board') return step.successLine;
    if (step.kind === 'question' && feedbackWrong) return step.wrongLine;
    return step.instruction;
  };
  const senseiText = senseiSays();

  const goalBoard = step?.kind === 'board' ? step.goalBoard : undefined;

  return (
    <div className="stage">
      <div className="frame">
        <DojoBackground />
        {celebrating && <Confetti />}

        {/* top bar — pause on the left, current belt + step progress centered */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 112, zIndex: 5 }}>
          <div
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)' }}
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
            <BeltBar
              rankIndex={Math.min(lessonIndex, LESSONS.length - 1)}
              label={
                lesson
                  ? `${lesson.title} · ${stepIndex + 1} / ${lesson.steps.length}`
                  : 'All Belts Earned'
              }
            />
          </div>
        </div>

        {/* main row — sensei (1/4) · board (2/4) · tools (1/4) */}
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
          {/* sensei: speech bubble, then the answer panel or the Continue gate */}
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
              <SpeechBubble text={senseiText} />
            </div>
            {isQuestion && !celebrating && (
              <div style={{ marginTop: 52 }}>
                <QuestionPanel
                  numerator={numInput}
                  denominator={denInput}
                  onNumerator={editNumerator}
                  onDenominator={editDenominator}
                  onSubmit={submitAnswer}
                />
              </div>
            )}
            {followUp && !celebrating && followUpFeedback !== 'right' && (
              <div style={{ marginTop: 52 }}>
                <NumberPad
                  options={followUp.options}
                  slots={followUp.slots.map((s, i) => ({
                    value: slotValues[i] ?? null,
                    color: s.color,
                  }))}
                  focusedIndex={slotIndex}
                  onTileTap={handleTileTap}
                />
              </div>
            )}
            {celebrating && (
              <button
                type="button"
                onClick={advance}
                style={{
                  marginTop: 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 26px',
                  borderRadius: 999,
                  border: '3px solid #1f1712',
                  background: 'linear-gradient(180deg, #7ed47f, #4caf50)',
                  color: '#fff',
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 5px 0 #1f1712, 0 8px 14px rgba(0,0,0,0.25)',
                }}
              >
                <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>
                  ✓
                </span>
                Continue
              </button>
            )}
            <div
              style={{
                width: 'min(260px, 100%)',
                aspectRatio: '400 / 520',
                marginTop: 8,
                pointerEvents: 'none',
              }}
            >
              <Sensei
                mood={celebrating ? 'cheer' : 'happy'}
                celebrating={celebrating}
                talking
              />
            </div>
          </div>

          {/* the board — a puzzle, or a question's scratchpad — and Reset */}
          <div style={{ display: 'grid', placeItems: 'start center' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                width: 'min(100%, calc(100svh - 280px))',
              }}
            >
              <BoardView
                board={board}
                tool={activeTool}
                chopLimit={chopLimit}
                highlight={highlight}
                onPieceTap={handlePieceTap}
                onGlue={handleGlue}
              />
              {!celebrating && followUpIndex === null && step && (
                <button
                  type="button"
                  onClick={() => {
                    setBoard(stepBoard(step));
                    playSound('reset');
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: '2px solid #5c3a1e',
                    background: 'linear-gradient(180deg, #c99a63, #a9743d)',
                    color: '#3a2412',
                    fontFamily: 'Fredoka, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #5c3a1e',
                  }}
                >
                  {isQuestion ? '↺ Reset the play board' : '↺ Start this puzzle over'}
                </button>
              )}
            </div>
          </div>

          {/* tools column — a goal thumbnail above, then revealed tool buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontFamily: 'Fredoka, system-ui, sans-serif',
            }}
          >
            {goalBoard && <GoalPreview board={goalBoard} />}

            <div
              style={{
                marginBottom: 28,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 2,
                color: '#7a4a26',
                textTransform: 'uppercase',
              }}
            >
              Your Tools
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                rowGap: '4rem',
              }}
            >
              {revealed.has('chop') && (
                <ToolButton
                  label="Chop"
                  hint="Splits a piece in two"
                  active={tool === 'chop'}
                  disabled={!chopEnabled}
                  onClick={() => selectTool('chop')}
                >
                  <IconChop size={48} />
                </ToolButton>
              )}

              {revealed.has('glue') && (
                <ToolButton
                  label="Glue"
                  hint="Fuses two pieces into one"
                  accent="#f3b13a"
                  active={tool === 'glue'}
                  disabled={!glueEnabled}
                  onClick={() => selectTool('glue')}
                >
                  <IconGlue size={48} />
                </ToolButton>
              )}

              {revealed.has('simplify') && (
                <ToolButton
                  label="Simplify"
                  hint="Reduces a piece to lower terms"
                  accent="#5fb24a"
                  active={tool === 'simplify'}
                  disabled={!simplifyEnabled}
                  onClick={() => selectTool('simplify')}
                >
                  <IconSimplify size={44} />
                </ToolButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
