import { chop, glue, simplify } from '@/core/board';
import { fraction } from '@/core/fraction';
import type { BoardStep, QuestionStep } from '@/core/lesson';
import { LESSONS } from './lessons';

/* Walk each puzzle by making the moves / answers a student would make,
 * asserting goals and answers check out — proof the curriculum is solvable. */

const boardStep = (lessonIndex: number, stepIndex: number): BoardStep => {
  const step = LESSONS[lessonIndex].steps[stepIndex];
  if (step.kind !== 'board') throw new Error('expected a board step');
  return step;
};
const questionStep = (lessonIndex: number, stepIndex: number): QuestionStep => {
  const step = LESSONS[lessonIndex].steps[stepIndex];
  if (step.kind !== 'question') throw new Error('expected a question step');
  return step;
};

describe('the lesson curriculum', () => {
  it('is the White Belt then the Yellow Belt', () => {
    expect(LESSONS.map((lesson) => lesson.id)).toEqual(['white-belt', 'yellow-belt']);
  });

  it('White Belt P1: one chop splits the whole into halves', () => {
    const p1 = boardStep(0, 0);
    expect(p1.isComplete(p1.startBoard)).toBe(false);
    expect(p1.isComplete(chop(p1.startBoard, '0:0:1:1'))).toBe(true);
  });

  it('White Belt P2: chopping all the way to four quarters', () => {
    const p2 = boardStep(0, 1);
    let board = chop(p2.startBoard, '0:0:1:1');
    board = chop(board, '0:0:0.5:1');
    expect(p2.isComplete(board)).toBe(false); // only three pieces so far
    board = chop(board, '0.5:0:0.5:1');
    expect(p2.isComplete(board)).toBe(true);
  });

  it('White Belt P3: the locked master is inert; gluing the quarters builds a 2/4', () => {
    const p3 = boardStep(0, 2);
    expect(() => chop(p3.startBoard, '0:0:0.5:1')).toThrow(); // the locked master
    const board = glue(p3.startBoard, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p3.isComplete(board)).toBe(true);
  });

  it('White Belt P4: simplifying the 2/4 down to 1/2', () => {
    const p4 = boardStep(0, 3);
    expect(p4.isComplete(p4.startBoard)).toBe(false);
    expect(p4.isComplete(simplify(p4.startBoard, '0.5:0:0.5:1'))).toBe(true);
  });

  it('White Belt question: one half as fourths is 2/4', () => {
    const q = questionStep(0, 4);
    expect(q.isCorrect(fraction(2, 4))).toBe(true);
    expect(q.isCorrect(fraction(1, 2))).toBe(false); // the question asked for fourths
    expect(q.isCorrect(fraction(3, 4))).toBe(false);
  });

  it('Yellow Belt: the 4/8 challenge starts unsolved; the question wants eighths', () => {
    const challenge = boardStep(1, 0);
    expect(challenge.isComplete(challenge.startBoard)).toBe(false);
    const q = questionStep(1, 1);
    expect(q.isCorrect(fraction(4, 8))).toBe(true);
    expect(q.isCorrect(fraction(2, 4))).toBe(false); // the question asked for eighths
  });
});
