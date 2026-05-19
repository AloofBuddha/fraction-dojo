import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonScreen } from './LessonScreen';

// The runner opens on the first lesson and shows that step's instruction.
test('Lesson 1 opens with the chop instruction', () => {
  render(<LessonScreen />);
  expect(
    screen.getByText(/chop it straight down the middle/i),
  ).toBeInTheDocument();
});

// Meeting a step's goal triggers the sensei's success line.
test('chopping the whole board completes the first step', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  expect(await screen.findByText(/two equal halves/i)).toBeInTheDocument();
});

// Tools reveal progressively — Glue is not on screen during the first puzzle.
test('the Glue tool is not shown until a puzzle introduces it', () => {
  render(<LessonScreen />);
  expect(
    screen.queryByRole('button', { name: /fuses two pieces/i }),
  ).toBeNull();
});

// advance(): completing a step and tapping Continue moves to the next step.
test('Continue advances from the first puzzle to the second', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  await user.click(await screen.findByRole('button', { name: /continue/i }));
  expect(
    await screen.findByText(/chop the board until it is four equal pieces/i),
  ).toBeInTheDocument();
});
