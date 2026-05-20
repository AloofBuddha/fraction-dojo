import { chop, glue, simplify, type Board } from '@/core/board';
import { fraction } from '@/core/fraction';
import type { BoardStep, Lesson, QuestionStep, Step } from '@/core/lesson';
import { BELT_RANKS } from '@/constants/theme';
import { LESSONS } from './lessons';

/* Walk every step in every belt the way a student would — solve the boards
 * with the supplied tools, answer the questions with a correct value. Each
 * step's isComplete / isCorrect must flip from unmet to met. This is the
 * proof that the curriculum is solvable end-to-end and that nothing in the
 * lesson model is internally inconsistent (e.g. a goal a student cannot
 * reach with the allowed tools, or an answer no fraction can satisfy). */

const lesson = (index: number): Lesson => LESSONS[index];
const boardStep = (step: Step): BoardStep => {
  if (step.kind !== 'board') throw new Error('expected a board step');
  return step;
};
const questionStep = (step: Step): QuestionStep => {
  if (step.kind !== 'question') throw new Error('expected a question step');
  return step;
};

describe('belt ladder', () => {
  // One Lesson per BELT_RANKS entry, in matching order — the BeltBar reads
  // the lesson's `belt` key to light up the right slot, so misalignment here
  // means the wrong rank would show as active mid-curriculum.
  it('runs from White to Black with one lesson per belt', () => {
    const expected = BELT_RANKS.map((r) => r.key);
    expect(LESSONS.map((l) => l.belt)).toEqual(expected);
  });

  // Every belt key on a Lesson must match a BELT_RANKS entry; an unknown key
  // would silently break BeltBar's findIndex lookup (rankIndex = -1).
  it('uses only known belt keys', () => {
    const known = new Set(BELT_RANKS.map((r) => r.key));
    for (const l of LESSONS) {
      expect(known.has(l.belt)).toBe(true);
    }
  });
});

describe('White Belt — first chop, meet 1/2', () => {
  const wb = lesson(0);

  // The first puzzle: one chop on the whole splits it into two halves and
  // the goal flips to met. Proves the most basic chop interaction works.
  it('P1: chopping the whole splits it into two halves', () => {
    const p = boardStep(wb.steps[0]);
    expect(p.isComplete(p.startBoard)).toBe(false);
    expect(p.isComplete(chop(p.startBoard, '0:0:1:1'))).toBe(true);
  });

  // The recall question: 1/2 (and any equivalent like 2/4) is accepted.
  it('P2: the recall question accepts 1/2 (and equivalents)', () => {
    const q = questionStep(wb.steps[1]);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 3))).toBe(false);
  });
});

describe('Yellow Belt — sharper cuts to quarters and eighths', () => {
  const yb = lesson(1);

  // Three chops produce four equal quarters; the puzzle flips to met only
  // after the third chop, never before. A chop into anything other than four
  // equal pieces must not satisfy the goal.
  it('P1: three chops produce four quarters', () => {
    const p = boardStep(yb.steps[0]);
    let board = chop(p.startBoard, '0:0:1:1');
    expect(p.isComplete(board)).toBe(false);
    board = chop(board, '0:0:0.5:1');
    expect(p.isComplete(board)).toBe(false);
    board = chop(board, '0.5:0:0.5:1');
    expect(p.isComplete(board)).toBe(true);
  });

  // From four quarters, halving one yields an eighth — the goal flips on
  // the first chop of any quarter.
  it('P2: halving a quarter produces an eighth', () => {
    const p = boardStep(yb.steps[1]);
    expect(p.isComplete(p.startBoard)).toBe(false);
    const next = chop(p.startBoard, '0.5:0:0.5:0.5');
    expect(p.isComplete(next)).toBe(true);
  });

  // The eighths question accepts 1/8 and equivalents.
  it('P3: the question accepts 1/8 (and equivalents)', () => {
    const q = questionStep(yb.steps[2]);
    expect(q.isCorrect(fraction(1, 8))).toBe(true);
    expect(q.isCorrect(fraction(2, 16))).toBe(true);
    expect(q.isCorrect(fraction(1, 4))).toBe(false);
  });

  // P4 introduces Glue early — the student combines the two 1/8 pieces
  // back into a single 2/8 (visually a quarter-sized piece).
  it('P4: glueing the two eighths produces a 2/8 piece', () => {
    const p = boardStep(yb.steps[3]);
    expect(p.isComplete(p.startBoard)).toBe(false);
    const next = glue(p.startBoard, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
    expect(p.isComplete(next)).toBe(true);
  });

  // P5 reads back the size comparison: two eighths cover one quarter.
  // Accepts 1/4 or 2/8 (equivalent).
  it('P5: the size-comparison question accepts 1/4 (and equivalents)', () => {
    const q = questionStep(yb.steps[4]);
    expect(q.isCorrect(fraction(1, 4))).toBe(true);
    expect(q.isCorrect(fraction(2, 8))).toBe(true);
    expect(q.isCorrect(fraction(1, 8))).toBe(false);
  });
});

describe('Orange Belt — reading a fraction', () => {
  const ob = lesson(2);

  // Same chop sequence as Yellow P1 — orange focuses on READING the result.
  it('P1: still takes three chops to four quarters', () => {
    const p = boardStep(ob.steps[0]);
    let board = chop(p.startBoard, '0:0:1:1');
    board = chop(board, '0:0:0.5:1');
    board = chop(board, '0.5:0:0.5:1');
    expect(p.isComplete(board)).toBe(true);
  });

  // The reading question accepts 2/4 (and equivalents). Orange uses 2/4
  // rather than 3/4 because three quarters in an L-shape can't form a
  // single rectangular piece in this engine — the rect highlight bounding
  // box would over-include the 4th quarter too.
  it('P2: the reading question accepts 2/4 (and equivalents)', () => {
    const q = questionStep(ob.steps[1]);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(3, 4))).toBe(false);
  });
});

describe('Green Belt — Glue introduced (adding like fractions)', () => {
  const gb = lesson(3);

  // One glue of any adjacent quarter pair produces a 2/4 — goal met.
  it('P1: gluing two quarters produces 2/4', () => {
    const p = boardStep(gb.steps[0]);
    expect(p.isComplete(p.startBoard)).toBe(false);
    const next = glue(p.startBoard, '0:0:0.5:0.5', '0:0.5:0.5:0.5');
    expect(p.isComplete(next)).toBe(true);
  });

  // Three glues bring all four quarters back into a single 4/4 (the whole).
  // canGlue requires the union to be a rectangle, so the path must go via
  // two half-pieces — proves the engine accepts this sequence.
  it('P2: three glues fold four quarters back into a 4/4 whole', () => {
    const p = boardStep(gb.steps[1]);
    let board = glue(p.startBoard, '0:0:0.5:0.5', '0:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(false);
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(false);
    board = glue(board, '0:0:0.5:1', '0.5:0:0.5:1');
    expect(p.isComplete(board)).toBe(true);
    expect(board.pieces).toHaveLength(1);
  });

  // The like-fraction sum question — 1/4 + 1/4 + 1/4 = 3/4 (or any equivalent).
  it('P3: the addition question accepts 3/4 (and equivalents)', () => {
    const q = questionStep(gb.steps[2]);
    expect(q.isCorrect(fraction(3, 4))).toBe(true);
    expect(q.isCorrect(fraction(6, 8))).toBe(true);
    expect(q.isCorrect(fraction(2, 4))).toBe(false);
  });
});

describe('Blue Belt — equivalence revealed (1/2 = 2/4)', () => {
  const bb = lesson(4);

  // P1 is now the discovery question: look at a free half vs. two free
  // quarters and write "how many fourths fit one half." The setup has no
  // master and no goal — the student answers from observation alone.
  it('P1: same-space discovery accepts 2/4 (and equivalents)', () => {
    const q = questionStep(bb.steps[0]);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(3, 4))).toBe(false);
  });

  // The locked master cannot be touched (chop throws); one glue on the
  // free pair builds a 2/4 that equals the master 1/2 in size.
  it('P2: the master is inert; gluing the free quarters builds 2/4', () => {
    const p = boardStep(bb.steps[1]);
    expect(() => chop(p.startBoard, '0:0:0.5:1')).toThrow();
    const next = glue(p.startBoard, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(next)).toBe(true);
  });

  // The naming question — 1/2 in fourths is 2/4 (and equivalents).
  it('P3: the question accepts 2/4 (and equivalents)', () => {
    const q = questionStep(bb.steps[2]);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(3, 4))).toBe(false);
  });
});

describe('Purple Belt — deeper equivalence (1/2 = 4/8)', () => {
  const pb = lesson(5);

  // The full chop-and-glue path: split the right half into four eighths,
  // glue them into one 4/8 piece matching the master 1/2 in size. Six
  // moves — three chops, three glues.
  it('P1: chop to eighths, glue four into a 4/8', () => {
    const p = boardStep(pb.steps[0]);
    let board = chop(p.startBoard, '0.5:0:0.5:1');
    board = chop(board, '0.5:0:0.5:0.5');
    board = chop(board, '0.5:0.5:0.5:0.5');
    board = glue(board, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
    board = glue(board, '0.5:0.5:0.25:0.5', '0.75:0.5:0.25:0.5');
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(true);
  });

  it('P2: the question accepts 4/8 (and equivalents)', () => {
    const q = questionStep(pb.steps[1]);
    expect(q.isCorrect(fraction(4, 8))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(2, 8))).toBe(false);
  });
});

describe('Brown Belt — Simplify introduced (4/8 → 2/4 → 1/2)', () => {
  const bb = lesson(6);

  // One simplify on the 2/4 piece renames it 1/2, the simplest form.
  it('P1: simplifying 2/4 gives 1/2', () => {
    const p = boardStep(bb.steps[0]);
    expect(p.isComplete(p.startBoard)).toBe(false);
    // The 2/4 piece spans the right half of the board.
    const next = simplify(p.startBoard, '0.5:0:0.5:1');
    expect(p.isComplete(next)).toBe(true);
  });

  // Two simplify steps walk 4/8 → 2/4 → 1/2; the puzzle requires reaching
  // 1/2 (or equivalently, every piece on the board being labelled 1/2,
  // since the master already is).
  it('P2: two simplify steps reduce 4/8 to 1/2', () => {
    const p = boardStep(bb.steps[1]);
    let board: Board = p.startBoard;
    expect(p.isComplete(board)).toBe(false);
    board = simplify(board, '0.5:0:0.5:1'); // 4/8 → 2/4
    expect(p.isComplete(board)).toBe(false);
    board = simplify(board, '0.5:0:0.5:1'); // 2/4 → 1/2
    expect(p.isComplete(board)).toBe(true);
  });

  // The lowest-form question requires the simplest form 1/2 exactly —
  // unlike the leniency elsewhere, 2/4 (equivalent in value) is NOT the
  // simplest form and must be rejected.
  it('P3: the simplest-form question accepts only 1/2', () => {
    const q = questionStep(bb.steps[2]);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(2, 4))).toBe(false);
    expect(q.isCorrect(fraction(4, 8))).toBe(false);
  });
});

describe('Black Belt — mastery (all tools, multiple paths)', () => {
  const blk = lesson(7);

  // The free-build challenge accepts ANY non-locked piece equivalent to
  // 1/2. Glue all four eighths in three moves and the goal flips — but
  // not before. Other paths (glue pairs, glue with simplify) also reach
  // the goal; this test pins the canonical three-glue path.
  it('P1: gluing all four eighths into 4/8 satisfies the free build', () => {
    const p = boardStep(blk.steps[0]);
    let board = p.startBoard;
    expect(p.isComplete(board)).toBe(false);
    board = glue(board, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
    expect(p.isComplete(board)).toBe(false);
    board = glue(board, '0.5:0.5:0.25:0.5', '0.75:0.5:0.25:0.5');
    expect(p.isComplete(board)).toBe(false);
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(true);
  });

  // Capstone Q1 — 2/4 in simplest form requires 1/2 exactly.
  it('P2: simplest-form question accepts only 1/2', () => {
    const q = questionStep(blk.steps[1]);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(2, 4))).toBe(false);
  });

  // Capstone Q2 — 1/2 = ?/4 → 2/4 (or any equivalent fraction).
  it('P3: 1/2 in fourths question accepts 2/4 (and equivalents)', () => {
    const q = questionStep(blk.steps[2]);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(3, 4))).toBe(false);
  });

  // Capstone Q3 — 1/2 = ?/8 → 4/8 (and equivalents).
  it('P4: 1/2 in eighths question accepts 4/8 (and equivalents)', () => {
    const q = questionStep(blk.steps[3]);
    expect(q.isCorrect(fraction(4, 8))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(true);
    expect(q.isCorrect(fraction(3, 8))).toBe(false);
  });

  // Capstone Q4 — broadens mastery beyond the 1/2 family. 2/8 in simplest
  // form must be 1/4 exactly (lowest-terms test, not equivalence leniency).
  it('P5: 2/8 in simplest form accepts only 1/4', () => {
    const q = questionStep(blk.steps[4]);
    expect(q.isCorrect(fraction(1, 4))).toBe(true);
    expect(q.isCorrect(fraction(2, 8))).toBe(false);
    expect(q.isCorrect(fraction(1, 2))).toBe(false);
  });
});
