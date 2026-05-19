import { chop, glue } from '@/core/board';
import type { BoardStep } from '@/core/lesson';
import { LESSONS } from './lessons';

/* Walk each challenge by making the moves a student would make, asserting
 * every step's goal flips from unmet to met — proof the curriculum is
 * actually solvable, beat by beat, with the supplied tools. */

const boardStep = (lessonIndex: number, stepIndex: number): BoardStep => {
  const step = LESSONS[lessonIndex].steps[stepIndex];
  if (step.kind !== 'board') throw new Error('expected a board step');
  return step;
};

describe('the lesson curriculum', () => {
  it('progresses through White, Yellow, and Orange Belts', () => {
    expect(LESSONS.map((l) => l.id)).toEqual([
      'white-belt',
      'yellow-belt',
      'orange-belt',
    ]);
  });

  it('White Belt P1: one chop splits the whole into halves', () => {
    const p = boardStep(0, 0);
    expect(p.isComplete(p.startBoard)).toBe(false);
    expect(p.isComplete(chop(p.startBoard, '0:0:1:1'))).toBe(true);
  });

  it('White Belt P2: chopping into four equal quarters', () => {
    const p = boardStep(0, 1);
    let board = chop(p.startBoard, '0:0:1:1');
    expect(p.isComplete(board)).toBe(false);
    board = chop(board, '0:0:0.5:1');
    expect(p.isComplete(board)).toBe(false);
    board = chop(board, '0.5:0:0.5:1');
    expect(p.isComplete(board)).toBe(true);
  });

  it('Yellow Belt: the locked master is inert; gluing the quarters builds a 2/4', () => {
    const p = boardStep(1, 0);
    expect(() => chop(p.startBoard, '0:0:0.5:1')).toThrow(); // the locked master
    const board = glue(p.startBoard, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(true);
  });

  it('Orange Belt: chopping to eighths then gluing four into a 4/8', () => {
    const p = boardStep(2, 0);
    let board = chop(p.startBoard, '0.5:0:0.5:1');
    board = chop(board, '0.5:0:0.5:0.5');
    board = chop(board, '0.5:0.5:0.5:0.5');
    board = glue(board, '0.5:0:0.25:0.5', '0.75:0:0.25:0.5');
    board = glue(board, '0.5:0.5:0.25:0.5', '0.75:0.5:0.25:0.5');
    board = glue(board, '0.5:0:0.5:0.5', '0.5:0.5:0.5:0.5');
    expect(p.isComplete(board)).toBe(true);
  });
});
