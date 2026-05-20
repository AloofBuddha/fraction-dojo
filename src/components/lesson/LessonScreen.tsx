/* The lesson screen — the dojo, driven by the lesson engine.
 *
 * It walks the student through the curriculum in ./lessons. A `board` step is
 * a puzzle (start board → goal board), optionally followed by understanding-
 * check sub-prompts where the student taps numbers from a palette to fill one
 * or two slots, each colour-coded to a region on the board. A `question` step
 * keeps the board on screen as a scratchpad and asks for a fraction. Tools
 * reveal progressively. Each step ends with a Continue gate.
 */

import { useEffect, useState } from 'react';
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
  canChopFurther,
} from '@/core/board';
import type { Step, SubPromptSlot } from '@/core/lesson';
import { fraction } from '@/core/fraction';
import {
  BELT_RANKS,
  INK,
  TOOL_ACCENT_GLUE,
  TOOL_ACCENT_SIMPLIFY,
} from '@/constants/theme';
import { BoardView } from './BoardView';
import { QuestionPanel } from './QuestionPanel';
import { Confetti } from './Confetti';
import { GoalPreview } from './GoalPreview';
import { NumberPad } from './NumberPad';
import { playSound } from './sound';
import { LESSONS } from './lessons';
import { ToolButton } from './ToolButton';
import { Sensei } from './Sensei';
import { SpeechBubble } from './SpeechBubble';
import { DojoBackground } from './DojoBackground';
import { BeltBar } from './BeltBar';
import { PauseButton } from './PauseButton';
import { TopicChip } from './TopicChip';
import { LessonPane } from './LessonPane';
import { HintButton } from './HintButton';
import { BeltUpOverlay } from './BeltUpOverlay';
import { SettingsModal } from './SettingsModal';
import { IconChop, IconGlue, IconSimplify } from './icons';
import {
  getProgress,
  getUnlockedBelts,
  markBeltUnlocked,
  setProgress,
} from '@/utils/storage';
import {
  LARGE_TABLET_QUERY,
  SMALL_TABLET_QUERY,
  useMediaQuery,
} from '@/utils/useMediaQuery';
import type { BeltKey } from '@/core/types';
import '@/styles/dojo.css';

/* Resume the student where they left off. Persisted indexes are clamped
 * so curriculum reshuffles never crash a returning visitor — out-of-range
 * indexes fall back to the start. */
function resumePosition(): { lessonIndex: number; stepIndex: number; board: Board } {
  const saved = getProgress();
  const lessonIndex = Math.min(Math.max(saved.lessonIndex, 0), LESSONS.length - 1);
  const lesson = LESSONS[lessonIndex] ?? LESSONS[0];
  const stepIndex = Math.min(Math.max(saved.stepIndex, 0), lesson.steps.length - 1);
  const step = lesson.steps[stepIndex];
  const board = step.kind === 'board' ? step.startBoard : createBoard();
  return { lessonIndex, stepIndex, board };
}

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
  // Initialise once from localStorage so a returning student resumes at
  // their last lesson + step. Brand-new visitors get (0, 0).
  const initial = useState(() => resumePosition())[0];
  const [lessonIndex, setLessonIndex] = useState(initial.lessonIndex);
  const [stepIndex, setStepIndex] = useState(initial.stepIndex);
  const [board, setBoard] = useState<Board>(initial.board);

  // Persist (lessonIndex, stepIndex) on every change so a reload returns
  // the student to the same step they were on. Reset Progress in settings
  // clears this along with the rest of the dojo:* keys.
  useEffect(() => {
    setProgress({ lessonIndex, stepIndex });
  }, [lessonIndex, stepIndex]);
  const [tool, setTool] = useState<Tool | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [settling, setSettling] = useState(false);
  // When successLine is an array, this tracks which beat the sensei is on.
  // Reset to 0 whenever a new settling phase starts.
  const [settleBeat, setSettleBeat] = useState(0);
  const [numInput, setNumInput] = useState('');
  const [denInput, setDenInput] = useState('');
  const [feedbackWrong, setFeedbackWrong] = useState(false);
  const [followUpIndex, setFollowUpIndex] = useState<number | null>(null);
  const [followUpFeedback, setFollowUpFeedback] = useState<
    'none' | 'right' | 'wrong'
  >('none');
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotValues, setSlotValues] = useState<(number | null)[]>([]);
  // Belts the student has reached — drives the LessonPane's visible entries
  // and which BeltBar rank squares are jumpable. Loaded once from
  // localStorage; markBeltUnlocked persists each new entry.
  const [unlocked, setUnlocked] = useState<Set<BeltKey>>(() =>
    getUnlockedBelts(),
  );
  const [paneOpen, setPaneOpen] = useState(false);
  // When the student crosses a belt boundary on advance, the from/to belts
  // are captured here so the BeltUpOverlay can animate the transition.
  const [beltUp, setBeltUp] = useState<{ from: BeltKey; to: BeltKey } | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Two tablet tiers so iPad mini/Air/Pro 11" (small) and iPad Pro 12.9"
  // (large) both get a layout that lets the sensei's speech bubble breathe.
  // Desktop keeps the original generous values.
  const isSmallTablet = useMediaQuery(SMALL_TABLET_QUERY);
  const isLargeTablet = useMediaQuery(LARGE_TABLET_QUERY);
  const boardMaxWidth = isSmallTablet ? 540 : isLargeTablet ? 720 : 900;
  const toolsPaddingLeft = isSmallTablet ? 56 : isLargeTablet ? 80 : 120;
  const toolsPaddingRight = isSmallTablet ? 28 : isLargeTablet ? 36 : 0;

  const lesson = LESSONS[lessonIndex];
  const step = lesson?.steps[stepIndex];
  const done = lessonIndex >= LESSONS.length;
  const isQuestion = step?.kind === 'question';
  const revealed = revealedTools(lessonIndex, stepIndex);

  // Mark a belt as unlocked (persists to localStorage and updates React
  // state). No-op when the belt is already unlocked. Used by Advance when
  // crossing a belt boundary, so the next-belt's pane entry / rank square
  // becomes available immediately.
  const unlockBelt = (belt: BeltKey) => {
    if (unlocked.has(belt)) return;
    markBeltUnlocked(belt);
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(belt);
      return next;
    });
  };

  // The current sub-prompt — undefined unless we are in the follow-up phase.
  const followUp =
    followUpIndex !== null && step?.kind === 'board' && step.followUps
      ? step.followUps[followUpIndex]
      : undefined;
  const currentSlot = followUp?.slots[slotIndex];

  // The colored region overlay on the play board — comes from the focused slot.
  const highlight = currentSlot ? highlightFor(currentSlot, board) : undefined;

  // The "you got it" affirmation sound. 'beltUp' on the last step of a
  // belt (a more triumphant cue), otherwise the lighter 'success'. Called
  // at the moment the student gets the puzzle / question right so the
  // audio confirmation is instant — celebrate() then handles the visual
  // beat without re-playing the sound.
  const playStepCorrectSound = () => {
    const lastStep = !!lesson && stepIndex + 1 >= lesson.steps.length;
    playSound(lastStep ? 'beltUp' : 'success');
  };

  // A step's goal is met — flip into celebration (confetti + final beat).
  const celebrate = () => {
    setCelebrating(true);
  };

  // Apply a board change. If it completes the step, play the success
  // chime immediately and hold on the first successLine beat
  // (settling=true, settleBeat=0) until the student taps Continue —
  // handleContinue walks any further beats and then decides whether to
  // enter follow-ups or celebrate.
  const applyMove = (next: Board) => {
    setBoard(next);
    if (step?.kind === 'board' && step.isComplete(next)) {
      playStepCorrectSound();
      setSettling(true);
      setSettleBeat(0);
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
  // if wrong, show the slot's wrong-line and wait for a correct tap. When the
  // last slot is filled we hold on the correctLine — Continue advances.
  const handleTileTap = (value: number) => {
    if (!followUp || followUpFeedback === 'right') return;
    const slot = followUp.slots[slotIndex];
    if (value === slot.correctValue) {
      const updated = slotValues.map((v, i) => (i === slotIndex ? value : v));
      setSlotValues(updated);
      setFollowUpFeedback('none');
      if (slotIndex + 1 >= followUp.slots.length) {
        setFollowUpFeedback('right');
        playSound('correct');
      } else {
        setSlotIndex(slotIndex + 1);
        playSound('correct');
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

  // Reset every per-step transient — the input fields, follow-up cursor,
  // celebration / settle flags. Used by both Continue and Jump so a jump
  // from any state lands in a clean step.
  const resetTransients = () => {
    setCelebrating(false);
    setSettling(false);
    setSettleBeat(0);
    setFeedbackWrong(false);
    setNumInput('');
    setDenInput('');
    setFollowUpIndex(null);
    setFollowUpFeedback('none');
    setSlotIndex(0);
    setSlotValues([]);
    setTool(null);
  };

  // Move to the next step / lesson. Caller plays the continue sound.
  const advance = () => {
    if (!lesson) return;
    if (stepIndex + 1 < lesson.steps.length) {
      setStepIndex(stepIndex + 1);
      enterStep(lesson.steps[stepIndex + 1]);
    } else {
      const nextLesson = LESSONS[lessonIndex + 1];
      setLessonIndex(lessonIndex + 1);
      setStepIndex(0);
      if (nextLesson) {
        enterStep(nextLesson.steps[0]);
        unlockBelt(nextLesson.belt);
        // Crossing a belt boundary — surface the belt-up overlay so the
        // student sees the rank change as a discrete celebration.
        if (lesson && lesson.belt !== nextLesson.belt) {
          setBeltUp({ from: lesson.belt, to: nextLesson.belt });
        }
      }
    }
    resetTransients();
  };

  // Single Continue handler. Text in the bubble never changes on a timer —
  // every transition past a "the sensei is reading you something" beat
  // funnels through here. Branches in priority order:
  //   1. last sub-prompt answered (followUpFeedback === 'right') → next sub-prompt or celebrate
  //   2. board step solved (settling) → enter follow-ups, or celebrate if none
  //   3. step celebrated (celebrating) → next step / lesson
  const handleContinue = () => {
    if (followUpIndex !== null && followUpFeedback === 'right') {
      playSound('continue');
      advanceFollowUp();
      return;
    }
    if (settling && step?.kind === 'board') {
      playSound('continue');
      const lines = Array.isArray(step.successLine)
        ? step.successLine
        : [step.successLine];
      // More beats in the successLine? Just advance the cursor, stay in settling.
      if (settleBeat + 1 < lines.length) {
        setSettleBeat(settleBeat + 1);
        return;
      }
      // Last beat — exit settling and either enter follow-ups or celebrate.
      setSettling(false);
      setSettleBeat(0);
      if (step.followUps && step.followUps.length > 0) {
        const firstSub = step.followUps[0];
        setFollowUpIndex(0);
        setSlotIndex(0);
        setSlotValues(new Array(firstSub.slots.length).fill(null));
      } else {
        celebrate();
      }
      return;
    }
    if (celebrating) {
      playSound('continue');
      advance();
    }
  };

  // Jump to any unlocked lesson — from the LessonPane or a BeltBar rank
  // square. Lands on the lesson's first step in a clean state.
  const jumpToLesson = (targetLessonIndex: number) => {
    const target = LESSONS[targetLessonIndex];
    if (!target) return;
    if (!unlocked.has(target.belt)) return; // defensive — UI should hide locked entries
    setLessonIndex(targetLessonIndex);
    setStepIndex(0);
    enterStep(target.steps[0]);
    resetTransients();
    setPaneOpen(false);
    playSound('continue');
  };

  const jumpToBelt = (belt: BeltKey) => {
    const targetIndex = LESSONS.findIndex((l) => l.belt === belt);
    if (targetIndex >= 0) jumpToLesson(targetIndex);
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
      playStepCorrectSound();
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

  // The successLine for a board step — always normalised to an array so
  // settling can walk through it beat by beat.
  const boardSuccessLines = (boardStep: Extract<Step, { kind: 'board' }>) =>
    Array.isArray(boardStep.successLine) ? boardStep.successLine : [boardStep.successLine];

  // What the sensei is saying right now.
  const senseiSays = (): string => {
    if (done) {
      const lastBelt = LESSONS[LESSONS.length - 1].title;
      return `Outstanding — you have earned your ${lastBelt}. Equivalence, mastered!`;
    }
    if (!step) return '';
    if (celebrating) {
      if (step.kind === 'question') return step.correctLine;
      const lines = boardSuccessLines(step);
      return lines[lines.length - 1]; // hold the last beat through celebration
    }
    if (followUp && currentSlot) {
      if (followUpFeedback === 'right') return followUp.correctLine;
      if (followUpFeedback === 'wrong') return currentSlot.wrongLine;
      return currentSlot.prompt;
    }
    if (settling && step.kind === 'board') {
      const lines = boardSuccessLines(step);
      return lines[Math.min(settleBeat, lines.length - 1)];
    }
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

        {/* top bar — pause left, belt+stripes center, topic chip right.
            Sits inside the wood beam with internal padding (chrome insets
            via left:24 / right:24 below, and vertical centering inside
            the beam's height). */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, zIndex: 5 }}>
          <div
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)' }}
          >
            <PauseButton onClick={() => setSettingsOpen(true)} />
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
              rankIndex={
                lesson
                  ? BELT_RANKS.findIndex((rank) => rank.key === lesson.belt)
                  : BELT_RANKS.length
              }
              label={lesson ? `${lesson.title}` : 'All Belts Earned'}
              stripes={lesson ? stepIndex + 1 : 0}
              stripesTotal={lesson?.steps.length ?? 0}
              unlocked={unlocked}
              onJump={jumpToBelt}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <TopicChip
              onOpen={() => setPaneOpen(true)}
              name={lesson?.name ?? 'All Belts Earned'}
              belt={lesson?.belt ?? null}
            />
          </div>
        </div>

        <LessonPane
          visible={paneOpen}
          lessons={LESSONS}
          unlocked={unlocked}
          currentBelt={lesson?.belt ?? null}
          onJump={jumpToLesson}
          onClose={() => setPaneOpen(false)}
        />

        {beltUp && (
          <BeltUpOverlay
            from={beltUp.from}
            to={beltUp.to}
            onDone={() => setBeltUp(null)}
          />
        )}

        {settingsOpen && (
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        )}

        {/* main row — CSS grid with 1fr | auto | 1fr columns so the board
            (auto) sits dead-centre between two equal-width gutters
            regardless of inner padding. Top/bottom margins (138/66) are
            balanced so the board also sits vertically below the hanging
            plaque and above the viewport edge by similar gaps. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 138,
            bottom: 66,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'stretch',
            zIndex: 2,
          }}
        >
          {/* sensei column — sensei anchored at the bottom, his speech bubble
              sitting just above him with its tail pointing at his head. The
              bubble grows UPWARD as content is added (NumberPad / Continue
              gate / question controls) so the tail-to-head relationship is
              preserved and the sensei never moves. Implemented with
              flex-direction: column-reverse so both stay in normal flow and
              keep their grid-column position. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '100%',
              // Horizontal padding keeps the speech bubble off the viewport's
              // left edge and the board's left edge as the side gutter
              // narrows. The bubble grows upward, never wider than this.
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 0,
              minWidth: 0,
              minHeight: 0,
              overflow: 'visible',
            }}
          >
            <div
              style={{
                width: 'min(200px, 100%)',
                aspectRatio: '400 / 520',
                pointerEvents: 'none',
                flexShrink: 0,
              }}
            >
              <Sensei
                mood={celebrating ? 'cheer' : 'happy'}
                celebrating={celebrating}
                talking
              />
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: 420,
                marginBottom: 0,
              }}
            >
              <SpeechBubble
                text={senseiText}
                cornerAction={
                  celebrating || settling || followUpFeedback === 'right' ? (
                    <button
                      type="button"
                      aria-label="Continue"
                      onClick={handleContinue}
                      style={{
                        width: 52,
                        height: 52,
                        padding: 0,
                        borderRadius: 999,
                        border: `3px solid ${INK}`,
                        background: 'linear-gradient(180deg, #7ed47f, #4caf50)',
                        color: '#fff',
                        fontFamily: 'Fredoka, system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: 28,
                        lineHeight: 1,
                        cursor: 'pointer',
                        boxShadow: `0 4px 0 ${INK}, 0 6px 12px rgba(0,0,0,0.28)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✓
                    </button>
                  ) : undefined
                }
              >
                {isQuestion && !celebrating && (
                  <QuestionPanel
                    numerator={numInput}
                    denominator={denInput}
                    onNumerator={editNumerator}
                    onDenominator={editDenominator}
                    onSubmit={submitAnswer}
                  />
                )}
                {followUp && !celebrating && followUpFeedback !== 'right' && (
                  <NumberPad
                    options={followUp.options}
                    slots={followUp.slots.map((s, i) => ({
                      value: slotValues[i] ?? null,
                      color: s.color,
                    }))}
                    focusedIndex={slotIndex}
                    onTileTap={handleTileTap}
                  />
                )}
              </SpeechBubble>
            </div>
          </div>

          {/* the board — a puzzle, or a question's scratchpad. A small reset
              chip lives in the board's bottom-right corner; it only surfaces
              once the student has spent more moves than the puzzle needs.
              The column width caps by min(content max, viewport height minus
              top/bottom chrome) so the board never overflows a short screen. */}
          <div
            style={{
              display: 'grid',
              placeItems: 'start center',
              width: `min(${boardMaxWidth}px, calc(100vh - 204px))`,
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <BoardView
                board={board}
                tool={activeTool}
                chopLimit={chopLimit}
                highlight={highlight}
                onPieceTap={handlePieceTap}
                onGlue={handleGlue}
              />
              {/* Hint + Restart chrome — sits OUTSIDE the board's right
                  edge, stacked vertically at the top corner. Hint shows
                  the goal as a popover; Restart resets the puzzle's board
                  to its start state. */}
              {!celebrating && !settling && followUpIndex === null && step && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    marginLeft: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    zIndex: 5,
                  }}
                >
                  <HintButton disabled={!goalBoard}>
                    {goalBoard && <GoalPreview board={goalBoard} />}
                  </HintButton>
                  <button
                    type="button"
                    aria-label={
                      isQuestion ? 'Reset the play board' : 'Start this puzzle over'
                    }
                    title={
                      isQuestion ? 'Reset the play board' : 'Start this puzzle over'
                    }
                    onClick={() => {
                      setBoard(stepBoard(step));
                      playSound('reset');
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: 'none',
                      background:
                        'radial-gradient(circle at 35% 30%, #ff8a78 0%, #d8453d 60%, #8b2a23 100%)',
                      color: '#fff',
                      fontFamily: 'Fredoka, system-ui, sans-serif',
                      fontWeight: 700,
                      fontSize: 22,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: `0 0 0 3px ${INK}, 0 4px 0 ${INK}, 0 6px 12px rgba(0,0,0,0.3)`,
                      padding: 0,
                    }}
                  >
                    ↺
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* tools column — right grid gutter, buttons LEFT-aligned so
              they hug the board side. "YOUR TOOLS" header is in normal
              flow at the top of the column so it lines up with the Hint
              button at the top of the board. Buttons stack with a fixed
              rowGap so spacing doesn't grow with viewport height. */}
          <div
            style={{
              minWidth: 0,
              paddingLeft: toolsPaddingLeft,
              paddingRight: toolsPaddingRight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontFamily: 'Fredoka, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                width: 144,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 1.6,
                color: '#7a4a26',
                textTransform: 'uppercase',
              }}
            >
              Your Tools
            </div>

            {/* Three tool slots are always rendered (space reserved) but
             *  only revealed once the curriculum introduces them — the
             *  visibility:hidden gate keeps the column from shifting when
             *  a new tool unlocks. */}
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                rowGap: 20,
                width: 144,
              }}
            >
              <div style={{ visibility: revealed.has('chop') ? 'visible' : 'hidden' }}>
                <ToolButton
                  label="Chop"
                  hint="Splits a piece in two"
                  active={tool === 'chop'}
                  disabled={!chopEnabled}
                  onClick={() => selectTool('chop')}
                >
                  <IconChop size={40} />
                </ToolButton>
              </div>

              <div style={{ visibility: revealed.has('glue') ? 'visible' : 'hidden' }}>
                <ToolButton
                  label="Glue"
                  hint="Fuses two pieces into one"
                  accent={TOOL_ACCENT_GLUE}
                  active={tool === 'glue'}
                  disabled={!glueEnabled}
                  onClick={() => selectTool('glue')}
                >
                  <IconGlue size={40} />
                </ToolButton>
              </div>

              <div style={{ visibility: revealed.has('simplify') ? 'visible' : 'hidden' }}>
                <ToolButton
                  label="Simplify"
                  hint="Reduces a piece to lower terms"
                  accent={TOOL_ACCENT_SIMPLIFY}
                  active={tool === 'simplify'}
                  disabled={!simplifyEnabled}
                  onClick={() => selectTool('simplify')}
                >
                  <IconSimplify size={38} />
                </ToolButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
