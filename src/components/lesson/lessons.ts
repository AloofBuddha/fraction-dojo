/**
 * The lesson curriculum — hand-authored content for the lesson engine.
 *
 * The demo walks the student through fraction equivalence using only Chop and
 * Glue (Simplify comes later). White Belt teaches the cut (halves, quarters);
 * Yellow Belt introduces Glue and the equivalence 2/4 = 1/2; Orange Belt goes
 * deeper to 4/8 = 1/2. Each challenge has a goal thumbnail and slot-by-slot
 * understanding-check sub-prompts, with a colour language: yellow names the
 * part you have (numerator side), blue names the total parts (denominator).
 */

import { type Board, createBoard, chop, glue, lockPiece } from '@/core/board';
import type { Lesson } from '@/core/lesson';
import { DEN_COLOR, NUM_COLOR } from '@/constants/theme';

// Deterministic piece ids — "x:y:w:h" of the piece's rect.
const WHOLE = '0:0:1:1';
const LEFT_HALF = '0:0:0.5:1';
const RIGHT_HALF = '0.5:0:0.5:1';
const RIGHT_TOP_QUARTER = '0.5:0:0.5:0.5';
const RIGHT_BOTTOM_QUARTER = '0.5:0.5:0.5:0.5';

// The four quarter-ids in a 2×2 tile-up of the board (top-left, bottom-left,
// top-right, bottom-right). Used for follow-up highlights when the whole board
// is a grid of quarters.
const ALL_QUARTERS: readonly string[] = [
  '0:0:0.5:0.5',
  '0:0.5:0.5:0.5',
  '0.5:0:0.5:0.5',
  '0.5:0.5:0.5:0.5',
];

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

/** A whole board chopped into four equal quarters in a 2×2 grid. */
function fourQuarters(): Board {
  let board = chop(createBoard(), WHOLE);
  board = chop(board, LEFT_HALF);
  return chop(board, RIGHT_HALF);
}

/** The master 1/2 on the left, a 4/8 piece on the right (glued from four eighths). */
function masterAndFourEighthsGlued(): Board {
  let board = masterAndFreeHalf();
  board = chop(board, RIGHT_HALF);
  board = chop(board, RIGHT_TOP_QUARTER);
  board = chop(board, RIGHT_BOTTOM_QUARTER);
  // Now four eighths on the right, in two stacked rows of two.
  board = glue(board, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
  board = glue(board, '0.5:0.5:0.25:0.5', '0.75:0.5:0.25:0.5');
  return glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
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
      // P1 — First Chop. Chop the whole into two halves.
      {
        kind: 'board',
        instruction:
          'Your first challenge. Use the Chop tool to make your board match the goal — two equal halves.',
        successLine: 'One whole becomes two halves — 1 = 1/2 + 1/2.',
        startBoard: createBoard(),
        goalBoard: chop(createBoard(), WHOLE),
        allowedTools: ['chop'],
        minMoves: 1,
        isComplete: (board) => board.pieces.length === 2,
        hints: ['Tap the Chop tool to pick it up, then tap the board.'],
        followUps: [
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'How many parts is the whole board split into now?',
                correctValue: 2,
                wrongLine: 'Count the pieces inside the blue box.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Two parts — yes!',
          },
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'And the yellow slice on its own — how many parts is that?',
                correctValue: 1,
                wrongLine: 'Just the yellow piece. How many is that?',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
            ],
            correctLine: 'One — a single slice.',
          },
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'Parts you have — fill the top slot.',
                correctValue: 1,
                wrongLine: 'Just the yellow slice — how many?',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And parts in total — fill the bottom slot.',
                correctValue: 2,
                wrongLine: 'Count all the pieces in the blue box.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Exactly — one half. 1/2.',
          },
        ],
      },
      // P2 — Quarters. Chop the whole into four equal pieces.
      {
        kind: 'board',
        instruction:
          'Sharper now — chop your board until it is FOUR equal quarters.',
        successLine: 'Four equal quarters! Each is 1/4 — one part out of four.',
        startBoard: createBoard(),
        goalBoard: fourQuarters(),
        allowedTools: ['chop'],
        maxDenominator: 4,
        minMoves: 3,
        isComplete: (board) =>
          board.pieces.length === 4 &&
          board.pieces.every((piece) => piece.value.denominator === 4),
        hints: ['Chop the whole into halves, then chop each half again.'],
        followUps: [
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'How many parts is the whole board split into now?',
                correctValue: 4,
                wrongLine: 'Count the pieces inside the blue box.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine: 'Four parts — quarters!',
          },
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'And the yellow slice on its own — how many parts?',
                correctValue: 1,
                wrongLine: 'Just the yellow piece — how many?',
                color: NUM_COLOR,
                highlightPiece: ALL_QUARTERS[0],
              },
            ],
            correctLine: 'One — a single quarter.',
          },
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'Parts you have — fill the top slot.',
                correctValue: 1,
                wrongLine: 'Just the yellow slice — how many?',
                color: NUM_COLOR,
                highlightPiece: ALL_QUARTERS[0],
              },
              {
                prompt: 'And parts in total — fill the bottom slot.',
                correctValue: 4,
                wrongLine: 'Count all the pieces in the blue box.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine: 'One quarter — 1/4. One part of four.',
          },
        ],
      },
    ],
  },
  {
    id: 'yellow-belt',
    title: 'Yellow Belt',
    steps: [
      // P1 — Glue Introduction. 1/4 + 1/4 = 2/4 = 1/2 (vs the locked master).
      {
        kind: 'board',
        instruction:
          'Time for a new tool — Glue. The stone master on the left is 1/2. Glue your two quarters into a single piece to match its size.',
        successLine:
          'Two quarters glued — 2/4. And look, the same size as your master 1/2. Two names, one amount — they are equivalent!',
        startBoard: masterAndTwoQuarters(),
        goalBoard: masterAndTwoFourths(),
        allowedTools: ['glue'],
        minMoves: 1,
        isComplete: (board) => hasPiece(board, 2, 4),
        hints: [
          'Tap the new Glue tool to pick it up.',
          'Then tap the glowing seam between the two quarters.',
        ],
        followUps: [
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'How many quarters did you glue into your new piece?',
                correctValue: 2,
                wrongLine: 'You glued two quarters together — the yellow piece.',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And how many quarters would fill the whole board?',
                correctValue: 4,
                wrongLine: 'A whole has four quarters in total.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Two over four — 2/4. The same size as 1/2.',
          },
        ],
      },
    ],
  },
  {
    id: 'orange-belt',
    title: 'Orange Belt',
    steps: [
      // P1 — Build 4/8 from eighths. Equivalence 1/2 = 4/8.
      {
        kind: 'board',
        instruction:
          'The master still shows 1/2. Use Chop and Glue to build a single piece of EIGHTHS that matches its size.',
        successLine:
          'Four eighths glued into 4/8 — the very same size as the master 1/2. 1/2 = 4/8!',
        startBoard: masterAndFreeHalf(),
        goalBoard: masterAndFourEighthsGlued(),
        allowedTools: ['chop', 'glue'],
        maxDenominator: 8,
        minMoves: 6,
        isComplete: (board) => hasPiece(board, 4, 8),
        hints: [
          'Chop the free half down to four eighths.',
          'Then glue all four eighths together into one piece.',
        ],
        followUps: [
          {
            options: [1, 2, 4, 8],
            slots: [
              {
                prompt: 'How many eighths did you glue into your new piece?',
                correctValue: 4,
                wrongLine: 'You glued four eighths together — the yellow piece.',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And how many eighths would fill the whole board?',
                correctValue: 8,
                wrongLine: 'A whole has eight eighths in total.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Four over eight — 4/8. The same size as 1/2.',
          },
        ],
      },
    ],
  },
];
