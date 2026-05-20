/**
 * The lesson curriculum — hand-authored content for the lesson engine.
 *
 * The whole game teaches **fraction equivalence** (1/2 = 2/4 = 4/8) through
 * a karate belt ladder. Each belt is one Lesson, each Lesson a tight set of
 * Steps that introduce ONE new idea before adding the next. A tool is fully
 * explored on its own belt before a second tool joins.
 *
 *   White ─ Meet a half. First chop.
 *   Yellow ─ Sharper cuts. Quarters and eighths.
 *   Orange ─ Reading a fraction. Numerator / denominator.
 *   Green ─ Glue. Combining like parts (1/4 + 1/4 + 1/4 = 3/4).
 *   Blue ─ Equivalence revealed. 1/2 = 2/4 against a locked master.
 *   Purple ─ Deeper equivalence. 1/2 = 4/8.
 *   Brown ─ Simplify. Find the simplest name (4/8 → 2/4 → 1/2).
 *   Black ─ Mastery. Free build with all three tools, plus capstone questions.
 */

import {
  type Board,
  createBoard,
  chop,
  glue,
  lockPiece,
} from '@/core/board';
import { areEquivalent, fraction } from '@/core/fraction';
import type { Lesson } from '@/core/lesson';
import { DEN_COLOR, NUM_COLOR } from '@/constants/theme';

/* ─── deterministic piece ids ─────────────────────────────────────────────
 * The board uses "x:y:w:h" of a piece's rect as its id, so the same chop
 * sequence always produces the same string. Naming the common ones once
 * keeps the lesson table readable. */

const WHOLE = '0:0:1:1';
const LEFT_HALF = '0:0:0.5:1';
const RIGHT_HALF = '0.5:0:0.5:1';
const RIGHT_TOP_QUARTER = '0.5:0:0.5:0.5';
const RIGHT_BOTTOM_QUARTER = '0.5:0.5:0.5:0.5';

/** All four quarter ids when the whole board is a 2×2 tile-up of quarters. */
const ALL_QUARTERS: readonly string[] = [
  '0:0:0.5:0.5',
  '0:0.5:0.5:0.5',
  '0.5:0:0.5:0.5',
  '0.5:0.5:0.5:0.5',
];

/** The two left quarters of a 2×2 (top-left + bottom-left). */
const LEFT_TWO_QUARTERS: readonly string[] = [
  '0:0:0.5:0.5',
  '0:0.5:0.5:0.5',
];

/* ─── puzzle setups ───────────────────────────────────────────────────────
 * Tiny helpers that build the starting/goal boards for each step. Named
 * after what they LOOK like, not how they're built — the curriculum reads
 * top-down without diving into rect strings. */

/** A whole board chopped into two halves. */
function twoHalves(): Board {
  return chop(createBoard(), WHOLE);
}

/** A whole board chopped into four equal quarters (2×2 grid). */
function fourQuarters(): Board {
  let board = chop(createBoard(), WHOLE);
  board = chop(board, LEFT_HALF);
  return chop(board, RIGHT_HALF);
}

/** Four quarters with one of them chopped further into two eighths. */
function fourQuartersWithOneChopped(): Board {
  return chop(fourQuarters(), RIGHT_TOP_QUARTER);
}

/** A whole board chopped into eight equal eighths — four columns by two
 *  rows of vertical-strip pieces. Used as the scratchpad for any question
 *  that asks about a board divided into eighths so the visual matches the
 *  question's premise. */
function eightEighths(): Board {
  let board = fourQuarters();
  for (const id of ALL_QUARTERS) {
    board = chop(board, id);
  }
  return board;
}

/** Same as fourQuartersWithOneChopped but the two eighths are then glued
 *  back into a single 2/8 piece — the result of Yellow Belt's glue intro.
 *  Visually identical to fourQuarters() but with one piece labelled 2/8
 *  rather than 1/4. */
function fourQuartersWithEighthsGlued(): Board {
  return glue(
    fourQuartersWithOneChopped(),
    '0.5:0:0.25:0.5',
    '0.75:0:0.25:0.5',
  );
}

/** Two halves, the left one locked as the puzzle's "master" reference 1/2. */
function masterAndFreeHalf(): Board {
  return lockPiece(twoHalves(), LEFT_HALF);
}

/** One free half on the left, two free quarters on the right — the side-by-
 *  side picture that opens Blue Belt as a discovery before any master is
 *  introduced: same space, two names. */
function halfAndTwoQuarters(): Board {
  return chop(twoHalves(), RIGHT_HALF);
}

/** The master 1/2 on the left, two free quarters on the right. */
function masterAndTwoQuarters(): Board {
  return chop(masterAndFreeHalf(), RIGHT_HALF);
}

/** The master 1/2 on the left, a right-side 2/4 already glued together. */
function masterAndTwoFourths(): Board {
  return glue(masterAndTwoQuarters(), RIGHT_TOP_QUARTER, RIGHT_BOTTOM_QUARTER);
}

/** The master 1/2 on the left, four free eighths on the right — the open
 *  Black-Belt board where many tool sequences can win. */
function masterAndFourFreeEighths(): Board {
  let board = masterAndTwoQuarters();
  board = chop(board, RIGHT_TOP_QUARTER);
  return chop(board, RIGHT_BOTTOM_QUARTER);
}

/** The master 1/2 on the left, a 4/8 piece on the right (glued from four
 *  eighths) — the canonical 1/2 = 4/8 picture. */
function masterAndFourEighthsGlued(): Board {
  let board = masterAndFourFreeEighths();
  board = glue(board, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
  board = glue(board, '0.5:0.5:0.25:0.5', '0.75:0.5:0.25:0.5');
  return glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
}

/** Two quarters glued on the left (2/4), two free quarters on the right —
 *  the goal picture after the Green Belt's first glue. */
function twoFourthsAndTwoQuarters(): Board {
  return glue(fourQuarters(), '0:0:0.5:0.5', '0:0.5:0.5:0.5');
}

/** All four quarters glued back into a single 4/4 piece covering the whole
 *  board — the Green Belt's "addition fills the whole" picture. The board
 *  model only glues rect-into-rect, so the path is left-pair, right-pair,
 *  then the two halves. */
function allFourQuartersGlued(): Board {
  let board = fourQuarters();
  board = glue(board, '0:0:0.5:0.5', '0:0.5:0.5:0.5'); // left two → 2/4
  board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5'); // right two → 2/4
  return glue(board, '0:0:0.5:1', '0.5:0:0.5:1'); // both halves → 4/4
}

/* ─── predicates used by isComplete ──────────────────────────────────────── */

/** Does the board hold a piece worth exactly this fraction (by labels)? */
function hasPiece(board: Board, numerator: number, denominator: number): boolean {
  return board.pieces.some(
    (piece) =>
      piece.value.numerator === numerator && piece.value.denominator === denominator,
  );
}

/** Is there a non-locked piece on the board whose value is equivalent to
 *  the target fraction? Used by free-build challenges where the student may
 *  reach the goal in several different denominators. */
function hasFreePieceEquivalentTo(
  board: Board,
  numerator: number,
  denominator: number,
): boolean {
  const target = fraction(numerator, denominator);
  return board.pieces.some(
    (piece) => !piece.locked && areEquivalent(piece.value, target),
  );
}

/** Is every piece on the board labelled with the exact same fraction
 *  (numerator and denominator)? Used by the Brown Belt simplify chain — the
 *  master is already 1/2; the student is done when the right piece simplifies
 *  down to 1/2 as well, so every piece reads 1/2. */
function everyPieceLabelled(
  board: Board,
  numerator: number,
  denominator: number,
): boolean {
  return board.pieces.every(
    (piece) =>
      piece.value.numerator === numerator && piece.value.denominator === denominator,
  );
}

/* ─── the curriculum ─────────────────────────────────────────────────────── */

export const LESSONS: readonly Lesson[] = [
  /* ═══ WHITE BELT — Meet a Half ════════════════════════════════════════
   * One chop. The whole splits in two. Each part is a half — 1/2. */
  {
    id: 'white-belt',
    title: 'White Belt',
    name: 'Meet a Half',
    belt: 'white',
    steps: [
      {
        kind: 'board',
        instruction:
          'Your first challenge. Tap the Chop tool, then tap the board to split it into two equal parts.',
        successLine: [
          'ONE chop, TWO equal halves — both pieces exactly the same size.',
          'Each is a HALF — written 1/2.',
          'We say it out loud as "one half."',
        ],
        startBoard: createBoard(),
        goalBoard: twoHalves(),
        allowedTools: ['chop'],
        maxDenominator: 2,
        minMoves: 1,
        isComplete: (board) => board.pieces.length === 2,
        hints: ['Tap the Chop tool to pick it up, then tap the board.'],
        followUps: [
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'How many equal parts is the board now?',
                correctValue: 2,
                wrongLine: 'Count the pieces inside the blue box.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Two equal parts — yes!',
          },
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'Now just the yellow slice on its own — how many parts are in the yellow box?',
                correctValue: 1,
                wrongLine: 'Just the yellow box. How many is that?',
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
                prompt: 'Put it together — the parts you have on top.',
                correctValue: 1,
                wrongLine: 'Just the yellow box — how many?',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And the total parts on the bottom.',
                correctValue: 2,
                wrongLine: 'Count the total number of pieces in the blue box.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, RIGHT_HALF],
              },
            ],
            correctLine: 'Exactly — one half. 1/2.',
          },
        ],
      },
      {
        kind: 'question',
        instruction:
          'Quick check — if the whole is split into 2 equal parts, what is each piece called?',
        scratchBoard: twoHalves(),
        isCorrect: (answer) => areEquivalent(answer, fraction(1, 2)),
        correctLine: 'Yes — one half. 1/2.',
        wrongLine: 'One piece out of two — write it as 1 over 2.',
        hints: ['The piece is 1 of 2 — top is 1, bottom is 2.'],
      },
    ],
  },

  /* ═══ YELLOW BELT — Sharper Cuts ════════════════════════════════════════
   * Keep chopping. Halves become quarters; quarters become eighths. The
   * student sees that each chop halves a piece. */
  {
    id: 'yellow-belt',
    title: 'Yellow Belt',
    name: 'Sharper Cuts',
    belt: 'yellow',
    steps: [
      {
        kind: 'board',
        instruction: 'Sharper now — chop until the board is FOUR equal parts.',
        successLine: 'Four equal parts! Each is a QUARTER — 1/4.',
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
            options: [1, 2, 4, 8],
            slots: [
              {
                prompt: 'How many equal parts now?',
                correctValue: 4,
                wrongLine: 'Count the pieces inside the blue box.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine: 'Four parts — quarters!',
          },
          {
            options: [1, 2, 4, 8],
            slots: [
              {
                prompt: 'Just the yellow slice — how many parts?',
                correctValue: 1,
                wrongLine: 'Just the yellow piece — how many?',
                color: NUM_COLOR,
                highlightPiece: ALL_QUARTERS[0],
              },
            ],
            correctLine: 'One — a single quarter.',
          },
          {
            options: [1, 2, 4, 8],
            slots: [
              {
                prompt: 'One of four — fill the top.',
                correctValue: 1,
                wrongLine: 'Just the yellow slice — how many?',
                color: NUM_COLOR,
                highlightPiece: ALL_QUARTERS[0],
              },
              {
                prompt: 'And the bottom — total parts.',
                correctValue: 4,
                wrongLine: 'Count every piece in the blue box.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine: 'One quarter — 1/4. One of four parts.',
          },
        ],
      },
      {
        kind: 'board',
        instruction:
          'Halve a quarter — pick any one piece and chop it. Let us see what we get.',
        successLine:
          'Halve a quarter and you get an EIGHTH — 1/8. Notice — an eighth is SMALLER than a quarter. The more cuts you make, the smaller each piece. So 1/8 is smaller than 1/4.',
        startBoard: fourQuarters(),
        goalBoard: fourQuartersWithOneChopped(),
        allowedTools: ['chop'],
        maxDenominator: 8,
        minMoves: 1,
        isComplete: (board) =>
          board.pieces.some((piece) => piece.value.denominator === 8),
        hints: ['Tap any one quarter while Chop is selected.'],
      },
      {
        kind: 'question',
        instruction:
          'If the whole was split into 8 equal parts, what is each piece called?',
        scratchBoard: eightEighths(),
        isCorrect: (answer) => areEquivalent(answer, fraction(1, 8)),
        correctLine: 'One eighth — 1/8. One of eight parts.',
        wrongLine: 'One piece of eight — write it 1 over 8.',
        hints: ['Top is parts you have (1). Bottom is total parts (8).'],
      },
      {
        kind: 'board',
        instruction:
          'A new tool — Glue. Tap Glue to pick it up, then tap the glowing seam between the two eighths to combine them back into one piece.',
        successLine:
          'Two eighths glued — 2/8. The same SIZE as one quarter, just a different name. (We will learn how to rename it later.)',
        startBoard: fourQuartersWithOneChopped(),
        goalBoard: fourQuartersWithEighthsGlued(),
        allowedTools: ['glue'],
        minMoves: 1,
        isComplete: (board) => hasPiece(board, 2, 8),
        hints: [
          'Tap the Glue tool to pick it up.',
          'Then tap the glowing seam between the two 1/8 pieces.',
        ],
      },
      {
        kind: 'question',
        instruction:
          'You just saw it — two eighths cover the same space as one quarter. What fraction of the whole is two eighths?',
        scratchBoard: fourQuartersWithEighthsGlued(),
        isCorrect: (answer) => areEquivalent(answer, fraction(1, 4)),
        correctLine:
          'Two eighths = 1/4. An eighth is smaller, but two of them rebuild a quarter.',
        wrongLine:
          'Two eighths cover one quarter — write the fraction that names one quarter, or 2/8 (the same amount).',
        hints: [
          'Count two eighths on the board — together they fill one quarter.',
        ],
      },
    ],
  },

  /* ═══ ORANGE BELT — Reading a Fraction ══════════════════════════════════
   * Numerator on top, denominator on bottom. The student learns to READ a
   * fraction by counting parts they have over parts in total. Still chop
   * only — no new tools, only new vocabulary. */
  {
    id: 'orange-belt',
    title: 'Orange Belt',
    name: 'Reading a Fraction',
    belt: 'orange',
    steps: [
      {
        kind: 'board',
        instruction:
          'Chop the board into four equal parts again — then we will learn to READ what we built.',
        successLine: 'Four equal quarters. Now — let us read them.',
        startBoard: createBoard(),
        goalBoard: fourQuarters(),
        allowedTools: ['chop'],
        maxDenominator: 4,
        minMoves: 3,
        isComplete: (board) =>
          board.pieces.length === 4 &&
          board.pieces.every((piece) => piece.value.denominator === 4),
        hints: ['Chop the whole, then chop each half.'],
        followUps: [
          {
            options: [1, 2, 3, 4],
            slots: [
              {
                prompt: 'Just this one piece — how many parts of the whole?',
                correctValue: 1,
                wrongLine: 'One yellow slice. How many?',
                color: NUM_COLOR,
                highlightPiece: ALL_QUARTERS[0],
              },
            ],
            correctLine: 'One part — 1.',
          },
          {
            options: [1, 2, 3, 4],
            slots: [
              {
                prompt: 'These two slices together — how many parts?',
                correctValue: 2,
                wrongLine: 'Count the yellow slices.',
                color: NUM_COLOR,
                highlightPieces: LEFT_TWO_QUARTERS,
              },
            ],
            correctLine: 'Two parts — 2.',
          },
          {
            options: [1, 2, 3, 4],
            slots: [
              {
                prompt: 'And the whole board — how many parts in total?',
                correctValue: 4,
                wrongLine: 'Count every piece in the blue box.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine: 'Four parts in total — the denominator.',
          },
          {
            options: [1, 2, 3, 4],
            slots: [
              {
                prompt: 'Two of four — the top is the NUMERATOR (parts you have).',
                correctValue: 2,
                wrongLine: 'Count the yellow slices — two.',
                color: NUM_COLOR,
                highlightPieces: LEFT_TWO_QUARTERS,
              },
              {
                prompt: 'And the bottom is the DENOMINATOR (parts in total).',
                correctValue: 4,
                wrongLine: 'Count every piece in the blue box — four.',
                color: DEN_COLOR,
                highlightPieces: ALL_QUARTERS,
              },
            ],
            correctLine:
              'Two over four — 2/4. Numerator two, denominator four — two of four equal parts.',
          },
        ],
      },
      {
        kind: 'question',
        instruction:
          'Two of four equal parts — write the fraction that names it.',
        scratchBoard: fourQuarters(),
        isCorrect: (answer) => areEquivalent(answer, fraction(2, 4)),
        correctLine: 'Two over four — 2/4.',
        wrongLine: 'Top is parts you have (2). Bottom is parts in total (4).',
        hints: ['Numerator on top, denominator on bottom.'],
      },
    ],
  },

  /* ═══ GREEN BELT — Glue ════════════════════════════════════════════════
   * The second tool. Glue combines two pieces of the same size into one —
   * fractions with the same denominator add by adding the numerators. */
  {
    id: 'green-belt',
    title: 'Green Belt',
    name: 'Glue',
    belt: 'green',
    steps: [
      {
        kind: 'board',
        instruction:
          'A new tool — Glue. Tap Glue to pick it up, then tap the glowing seam between two quarters to combine them.',
        successLine: 'Two quarters glued — 2 out of 4 parts. That is 2/4.',
        startBoard: fourQuarters(),
        goalBoard: twoFourthsAndTwoQuarters(),
        allowedTools: ['glue'],
        minMoves: 1,
        isComplete: (board) => hasPiece(board, 2, 4),
        hints: [
          'Tap the Glue tool first.',
          'Then tap one of the glowing seams between adjacent quarters.',
        ],
        followUps: [
          {
            options: [1, 2, 3, 4],
            slots: [
              {
                prompt: 'How many quarters did you glue together?',
                correctValue: 2,
                wrongLine: 'Two quarters in your new yellow piece.',
                color: NUM_COLOR,
                highlightPiece: '0:0:0.5:1',
              },
              {
                prompt: 'And how many quarters fill the whole board?',
                correctValue: 4,
                wrongLine: 'Four quarters make a whole.',
                color: DEN_COLOR,
                highlightPieces: [LEFT_HALF, ...ALL_QUARTERS.slice(2)],
              },
            ],
            correctLine: 'Two over four — 2/4.',
          },
        ],
      },
      {
        kind: 'board',
        instruction:
          'Keep gluing — all four quarters this time, until your board is one whole again.',
        successLine:
          'Four quarters glued — 4/4. Four parts of four IS the whole. 1/4 + 1/4 + 1/4 + 1/4 = 4/4.',
        startBoard: fourQuarters(),
        goalBoard: allFourQuartersGlued(),
        allowedTools: ['glue'],
        minMoves: 3,
        isComplete: (board) =>
          board.pieces.length === 1 && hasPiece(board, 4, 4),
        hints: [
          'Glue pairs first (top, bottom, or left, right). Then glue the two halves together.',
        ],
      },
      {
        kind: 'question',
        instruction:
          'Add them up: 1/4 + 1/4 + 1/4. What is the answer?',
        scratchBoard: fourQuarters(),
        isCorrect: (answer) => areEquivalent(answer, fraction(3, 4)),
        correctLine: 'Three quarters — 3/4.',
        wrongLine: 'Three quarters added together — count them on the board.',
        hints: ['Three quarters — top is 3, bottom is 4.'],
      },
    ],
  },

  /* ═══ BLUE BELT — Two Names, One Size ════════════════════════════════════
   * The equivalence reveal. Begins with a discovery — student SEES a half
   * and two quarters cover the same space — then builds the equivalence
   * themselves next to a locked master, then names it as a fraction. */
  {
    id: 'blue-belt',
    title: 'Blue Belt',
    name: 'Two Names, One Size',
    belt: 'blue',
    steps: [
      {
        kind: 'question',
        instruction:
          'Look — one yellow half on the left, two quarters on the right. They cover the SAME SPACE on the board. How many fourths is one half? Write it as a fraction.',
        scratchBoard: halfAndTwoQuarters(),
        isCorrect: (answer) => areEquivalent(answer, fraction(2, 4)),
        correctLine:
          'Same space, two names — one half IS two fourths. 1/2 = 2/4. We call that EQUIVALENT.',
        wrongLine:
          'Count the quarters on the right that cover the same space as the half on the left.',
        hints: [
          'Two quarters cover the same space as one half — write 2 over 4.',
        ],
      },
      {
        kind: 'board',
        instruction:
          'Now build it yourself. The stone master on the left is 1/2. Glue your two quarters into one piece the same size.',
        successLine:
          'Two quarters glued — 2/4 (numerator 2, denominator 4). The SAME SIZE as the master 1/2. Two names, one amount — 1/2 and 2/4 are EQUIVALENT fractions.',
        startBoard: masterAndTwoQuarters(),
        goalBoard: masterAndTwoFourths(),
        allowedTools: ['glue'],
        minMoves: 1,
        isComplete: (board) => hasPiece(board, 2, 4),
        hints: [
          'Tap the Glue tool to pick it up.',
          'Then tap the glowing seam between the two quarters.',
        ],
        followUps: [
          {
            options: [1, 2, 4],
            slots: [
              {
                prompt: 'How many quarters did you glue?',
                correctValue: 2,
                wrongLine: 'Two quarters in the yellow piece.',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And how many quarters fill the whole board?',
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
      {
        kind: 'question',
        instruction: '1/2 is the same as how many fourths? Fill the fraction.',
        scratchBoard: masterAndTwoFourths(),
        isCorrect: (answer) => areEquivalent(answer, fraction(2, 4)),
        correctLine: '1/2 = 2/4 — two fourths.',
        wrongLine:
          'Look at your right piece — same SIZE as the master. Two of how many?',
        hints: ['Two quarters cover the same space as one half — write 2/4.'],
      },
    ],
  },

  /* ═══ PURPLE BELT — Deeper Equivalence ═══════════════════════════════════
   * Chop AND glue together for the first time. Build 4/8 to match the master
   * 1/2 — the equivalence pattern extends to eighths. */
  {
    id: 'purple-belt',
    title: 'Purple Belt',
    name: 'Deeper Equivalence',
    belt: 'purple',
    steps: [
      {
        kind: 'board',
        instruction:
          'The master still shows 1/2. Chop the right half down to eighths, then glue four of them into ONE piece the same size.',
        successLine:
          'Four eighths glued — 4/8. The same size as 1/2. So 1/2 = 2/4 = 4/8 — they all name the same amount!',
        startBoard: masterAndFreeHalf(),
        goalBoard: masterAndFourEighthsGlued(),
        allowedTools: ['chop', 'glue'],
        maxDenominator: 8,
        minMoves: 6,
        isComplete: (board) => hasPiece(board, 4, 8),
        hints: [
          'First chop the right half into four eighths.',
          'Then glue all four eighths together — same denominator, so they glue.',
        ],
        followUps: [
          {
            options: [1, 2, 4, 8],
            slots: [
              {
                prompt: 'How many eighths did you glue?',
                correctValue: 4,
                wrongLine: 'Four eighths in the yellow piece.',
                color: NUM_COLOR,
                highlightPiece: RIGHT_HALF,
              },
              {
                prompt: 'And how many eighths fill the whole board?',
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
      {
        kind: 'question',
        instruction: 'And in eighths — 1/2 is the same as how many eighths?',
        scratchBoard: masterAndFourEighthsGlued(),
        isCorrect: (answer) => areEquivalent(answer, fraction(4, 8)),
        correctLine: '1/2 = 4/8 — four eighths.',
        wrongLine: 'Count the eighths inside the master half — write 4/8.',
        hints: ['Four eighths fit inside one half. Write 4 over 8.'],
      },
    ],
  },

  /* ═══ BROWN BELT — Simplify ══════════════════════════════════════════════
   * The third tool. Simplify renames a piece in lower terms WITHOUT changing
   * its size — same amount, simpler name. */
  {
    id: 'brown-belt',
    title: 'Brown Belt',
    name: 'Simplify',
    belt: 'brown',
    steps: [
      {
        kind: 'board',
        instruction:
          'A new tool — Simplify. Tap Simplify, then tap the right piece. You will see 2/4 become its simplest name.',
        successLine:
          '2/4 simplified to 1/2 — the simplest name for the same amount.',
        startBoard: masterAndTwoFourths(),
        goalBoard: masterAndFreeHalf(),
        allowedTools: ['simplify'],
        minMoves: 1,
        isComplete: (board) => !hasPiece(board, 2, 4),
        hints: ['Tap the Simplify tool, then tap the yellow 2/4 piece.'],
      },
      {
        kind: 'board',
        instruction:
          'This piece is 4/8. Simplify it step by step until it cannot get any simpler.',
        successLine:
          '4/8 → 2/4 → 1/2. Each step halves both numerator and denominator. All three are the same amount — 1/2 is its simplest name.',
        startBoard: masterAndFourEighthsGlued(),
        goalBoard: masterAndFreeHalf(),
        allowedTools: ['simplify'],
        minMoves: 2,
        isComplete: (board) => everyPieceLabelled(board, 1, 2),
        hints: [
          'Simplify halves the top and bottom each tap.',
          'Tap simplify on the right piece twice — 4/8 → 2/4, then 2/4 → 1/2.',
        ],
      },
      {
        kind: 'question',
        instruction: 'What is 4/8 written in its simplest form?',
        scratchBoard: masterAndFourEighthsGlued(),
        isCorrect: (answer) =>
          answer.numerator === 1 && answer.denominator === 2,
        correctLine: '1/2 — the simplest name for 4/8.',
        wrongLine:
          'Keep simplifying — divide top and bottom by the same number until you cannot anymore.',
        hints: ['Halve top and bottom: 4/8 → 2/4 → 1/2.'],
      },
    ],
  },

  /* ═══ BLACK BELT — Mastery ═══════════════════════════════════════════════
   * All three tools on the table. A free-build challenge with many valid
   * solutions, then capstone questions that require fluent reasoning in
   * both directions (1/2 in n-ths, and n-ths in lowest terms). */
  {
    id: 'black-belt',
    title: 'Black Belt',
    name: 'Mastery',
    belt: 'black',
    steps: [
      {
        kind: 'board',
        instruction:
          'Final challenge. The master is 1/2. You have four eighths on the right — build ANY single piece equal in size to the master, your way.',
        successLine:
          'A piece equal to 1/2 — perfectly equivalent. You have mastered equivalence!',
        startBoard: masterAndFourFreeEighths(),
        goalBoard: masterAndFourEighthsGlued(),
        allowedTools: ['chop', 'glue', 'simplify'],
        maxDenominator: 64,
        minMoves: 3,
        isComplete: (board) => hasFreePieceEquivalentTo(board, 1, 2),
        hints: [
          'Glue all four eighths into one piece — that is 4/8, equal to 1/2.',
          'Or glue pairs first, then glue the pairs together.',
        ],
      },
      {
        kind: 'question',
        instruction: 'What is 2/4 written in its simplest form?',
        scratchBoard: masterAndTwoFourths(),
        isCorrect: (answer) =>
          answer.numerator === 1 && answer.denominator === 2,
        correctLine: '1/2 — the simplest name for 2/4.',
        wrongLine:
          'Halve top and bottom — 2/4 becomes a smaller pair of numbers.',
        hints: ['Divide top and bottom each by 2: 2/4 → 1/2.'],
      },
      {
        kind: 'question',
        instruction: '1/2 = ?/4 — what number fills the top?',
        scratchBoard: masterAndTwoFourths(),
        isCorrect: (answer) => areEquivalent(answer, fraction(2, 4)),
        correctLine: 'Two fourths — 2/4. 1/2 = 2/4.',
        wrongLine: 'Two quarters cover one half — write 2 on top.',
        hints: ['How many quarters fit in a half? Two.'],
      },
      {
        kind: 'question',
        instruction: 'And in eighths: 1/2 = ?/8 — what number fills the top?',
        scratchBoard: masterAndFourEighthsGlued(),
        isCorrect: (answer) => areEquivalent(answer, fraction(4, 8)),
        correctLine: 'Four eighths — 4/8. 1/2 = 2/4 = 4/8.',
        wrongLine: 'Four eighths cover one half — write 4 on top.',
        hints: ['How many eighths fit in a half? Four.'],
      },
      {
        kind: 'question',
        instruction:
          'Last one — and not about halves this time. What is 2/8 in its simplest form?',
        scratchBoard: fourQuartersWithOneChopped(),
        isCorrect: (answer) =>
          answer.numerator === 1 && answer.denominator === 4,
        correctLine:
          '1/4 — equivalence works for every fraction, not only halves.',
        wrongLine:
          'Halve top and bottom — 2/8 has a simpler name with smaller numbers.',
        hints: ['Divide top and bottom each by 2: 2/8 → 1/4.'],
      },
    ],
  },
];
