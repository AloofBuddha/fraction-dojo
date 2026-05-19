/**
 * The lesson curriculum — hand-authored content for the lesson engine.
 *
 * White Belt teaches the three tools one puzzle at a time — each puzzle
 * introduces exactly one new tool and walks the student through it — and ends
 * on the equivalence 1/2 = 2/4. Yellow Belt goes deeper: 1/2 = 4/8.
 *
 * A "master" puzzle locks a reference piece the student must match with a
 * differently-named piece. A question keeps a free scratch board on screen.
 */

import { type Board, createBoard, chop, glue, lockPiece } from '@/core/board';
import { type Fraction, fraction, areEquivalent } from '@/core/fraction';
import type { Lesson } from '@/core/lesson';

// Deterministic piece ids — "x:y:w:h" of the piece's rect.
const WHOLE = '0:0:1:1';
const LEFT_HALF = '0:0:0.5:1';
const RIGHT_HALF = '0.5:0:0.5:1';
const RIGHT_TOP_QUARTER = '0.5:0:0.5:0.5';
const RIGHT_BOTTOM_QUARTER = '0.5:0.5:0.5:0.5';

const HALF: Fraction = fraction(1, 2);

/** Two halves, the left one locked as the puzzle's "master" 1/2. */
function masterAndFreeHalf(): Board {
  return lockPiece(chop(createBoard(), WHOLE), LEFT_HALF);
}

/** The master 1/2 on the left, two free quarters on the right. */
function masterAndTwoQuarters(): Board {
  return chop(masterAndFreeHalf(), RIGHT_HALF);
}

/** The master 1/2 on the left, a right-side 2/4 already glued together. */
function masterAndTwoFourths(): Board {
  return glue(masterAndTwoQuarters(), RIGHT_TOP_QUARTER, RIGHT_BOTTOM_QUARTER);
}

/** Does the board hold any piece with this denominator? */
function hasDenominator(board: Board, denominator: number): boolean {
  return board.pieces.some((piece) => piece.value.denominator === denominator);
}

/** Does the board hold a piece worth exactly this fraction? */
function hasPiece(board: Board, numerator: number, denominator: number): boolean {
  return board.pieces.some(
    (piece) =>
      piece.value.numerator === numerator && piece.value.denominator === denominator,
  );
}

export const LESSONS: readonly Lesson[] = [
  {
    id: 'white-belt',
    title: 'White Belt',
    steps: [
      {
        kind: 'board',
        instruction:
          'This board is one whole. Pick the Chop tool and chop it straight down the middle!',
        successLine: 'Two equal halves — each one is 1/2 of the board.',
        startBoard: createBoard(),
        allowedTools: ['chop'],
        isComplete: (board) => board.pieces.length === 2,
        hints: ['The Chop tool is glowing — just tap the board.'],
      },
      {
        kind: 'board',
        instruction: 'Sharper now — chop the board until it is four equal pieces.',
        successLine: 'Four quarters, 1/4 each. Your chop is sharp!',
        startBoard: createBoard(),
        allowedTools: ['chop'],
        maxDenominator: 4, // can't over-chop a quarter into eighths
        isComplete: (board) =>
          board.pieces.length === 4 &&
          board.pieces.every((piece) => piece.value.denominator === 4),
        hints: ['Chop the whole into halves, then chop each half again.'],
      },
      {
        kind: 'board',
        instruction:
          'A new tool — Glue! The left half is the stone master, worth 1/2. The two quarters beside it are glowing — tap the seam between them to glue them into one piece.',
        successLine:
          '1/4 and 1/4 glued into 2/4 — it fills the master 1/2 exactly. They are equivalent!',
        startBoard: masterAndTwoQuarters(),
        allowedTools: ['glue'],
        isComplete: (board) => hasPiece(board, 2, 4),
        hints: [
          'Glue is the new tool — it is already picked for you.',
          'Tap the glowing line right between the two quarter pieces.',
        ],
      },
      {
        kind: 'board',
        instruction:
          'Your 2/4 matches the master in size — but 1/2 is its simplest name. Here is the Simplify tool: tap your glowing 2/4 piece to rename it.',
        successLine:
          '1/2 = 2/4 — different names, the very same amount. That is equivalence!',
        startBoard: masterAndTwoFourths(),
        allowedTools: ['simplify'],
        isComplete: (board) => !hasDenominator(board, 4),
        hints: ['The Simplify tool is the new one — tap your glowing 2/4 piece.'],
      },
      {
        kind: 'question',
        instruction:
          'Now name it. The play board is yours to chop and glue — then write one half as fourths.',
        correctLine: 'Exactly — 1/2 = 2/4. White Belt earned!',
        wrongLine:
          'Not quite. One half split into fourths is two of them — try 2 over 4.',
        scratchBoard: chop(createBoard(), WHOLE),
        isCorrect: (answer) =>
          answer.denominator === 4 && areEquivalent(answer, HALF),
        hints: ['One half is the same as two quarters.'],
      },
    ],
  },
  {
    id: 'yellow-belt',
    title: 'Yellow Belt',
    steps: [
      {
        kind: 'board',
        instruction:
          'The master shows 1/2 once more. With every tool at hand, build a single 4/8 piece beside it.',
        successLine: '4/8 — the same space as the master 1/2, in smaller pieces.',
        startBoard: masterAndFreeHalf(),
        allowedTools: ['chop', 'glue', 'simplify'],
        maxDenominator: 8,
        isComplete: (board) => hasPiece(board, 4, 8),
        hints: [
          'Chop the free half all the way down to eighths.',
          'Then glue four eighths together into one 4/8 piece.',
        ],
      },
      {
        kind: 'question',
        instruction:
          'Go deeper — write one half using eighths. Use the play board to work it out.',
        correctLine: 'Yes! 1/2 = 4/8. Yellow Belt earned!',
        wrongLine:
          'Close — eighths are smaller, so you need more of them. How many eighths fill a half?',
        scratchBoard: chop(createBoard(), WHOLE),
        isCorrect: (answer) =>
          answer.denominator === 8 && areEquivalent(answer, HALF),
        hints: ['Eighths are half the size of fourths — so you need twice as many.'],
      },
    ],
  },
];
