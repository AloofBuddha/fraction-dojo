import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonScreen } from './LessonScreen';

// The runner opens on the first lesson and shows that challenge's instruction.
test('Lesson 1 opens with the first challenge instruction', () => {
  render(<LessonScreen />);
  expect(screen.getByText(/first challenge/i)).toBeInTheDocument();
});

// No tool is auto-selected — tapping the board before picking one does nothing.
test('tapping the board with no tool selected does nothing', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  expect(screen.getByRole('button', { name: '1/1 piece' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '1/2 piece' })).toBeNull();
});

// Picking the Chop tool, then tapping the board, completes the chop and the
// sensei stops repeating the instruction. We just want to confirm the chop
// happened and the bubble transitioned away from the first-challenge prompt —
// the exact success-line copy gets re-written as the script is tuned.
test('chopping the whole board completes the puzzle', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: /chop/i }));
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  expect(await screen.findAllByRole('button', { name: '1/2 piece' })).toHaveLength(2);
  expect(screen.queryByText(/first challenge/i)).toBeNull();
});

// Tools reveal progressively — Glue is not on screen during the first puzzle.
test('the Glue tool is not shown until a puzzle introduces it', () => {
  render(<LessonScreen />);
  expect(
    screen.queryByRole('button', { name: /fuses two pieces/i }),
  ).toBeNull();
});
