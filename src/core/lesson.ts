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
  readonly allowedTools: readonly Tool[];
  /** Tightest denominator the chop tool may reach here (defaults to 1/64). */
  readonly maxDenominator?: number;
  readonly isComplete: (board: Board) => boolean;
  readonly successLine: string;
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
