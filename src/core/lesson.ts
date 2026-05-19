/**
 * The lesson model — a lesson is an ordered list of steps the student works
 * through. Pure data and predicates (no React), so a step's rule is a plain
 * function and is trivially unit-testable.
 *
 * Two step kinds: `board` (a puzzle solved on the manipulative) and `question`
 * (a teaching moment — the student answers a fraction).
 */

import type { Board, Tool } from './board';
import type { Fraction } from './fraction';

interface StepBase {
  /** What the sensei says when the step begins. */
  readonly instruction: string;
  /** Optional nudges, revealed one at a time when the student asks. */
  readonly hints: readonly string[];
}

/**
 * A board puzzle — start from `startBoard` and reshape it until `isComplete`.
 * `allowedTools` restricts what's usable; accumulated across the curriculum it
 * also drives which tool buttons have been revealed so far (a tool with one
 * entry is a tutorial; several is a free challenge).
 */
export interface BoardStep extends StepBase {
  readonly kind: 'board';
  readonly startBoard: Board;
  /** Optional target state, rendered as a goal thumbnail beside the play board. */
  readonly goalBoard?: Board;
  readonly allowedTools: readonly Tool[];
  /** Tightest denominator the chop tool may reach here (defaults to 1/64). */
  readonly maxDenominator?: number;
  readonly isComplete: (board: Board) => boolean;
  readonly successLine: string;
  /** Understanding-check prompts asked after the goal is met. */
  readonly followUps?: readonly SubPrompt[];
}

/** A sub-prompt asked after a board step's goal is met — a sequence of one
 * (number) or two (fraction) slots the student fills by tapping number tiles.
 * Each slot carries its own prompt, colour, board highlight, correct value,
 * and wrong-line. Tapping the right tile advances focus; tapping the wrong one
 * shows the slot's wrong-line and waits for a correct tap. After every slot
 * is filled correctly, the sub-prompt's overall `correctLine` plays. */
export interface SubPromptSlot {
  readonly prompt: string;
  readonly correctValue: number;
  readonly wrongLine: string;
  /** Slot border colour + the matching board overlay colour. */
  readonly color?: string;
  /** A single piece on the board to highlight in the slot's colour. */
  readonly highlightPiece?: string;
  /** Multiple pieces to highlight together (one bounding box). */
  readonly highlightPieces?: readonly string[];
}

export interface SubPrompt {
  /** Number tiles the student can choose from. */
  readonly options: readonly number[];
  /** 1 slot for a number answer, 2 stacked as a fraction. */
  readonly slots: readonly SubPromptSlot[];
  /** Shown briefly after every slot is filled correctly. */
  readonly correctLine: string;
}

/** A teaching moment — the student answers a fraction in a [ ]/[ ] input. */
export interface QuestionStep extends StepBase {
  readonly kind: 'question';
  /** A free board kept on screen as a scratchpad while the student answers. */
  readonly scratchBoard: Board;
  readonly isCorrect: (answer: Fraction) => boolean;
  readonly correctLine: string;
  readonly wrongLine: string;
}

export type Step = BoardStep | QuestionStep;

/** An ordered set of steps grouped under one belt. */
export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly steps: readonly Step[];
}
