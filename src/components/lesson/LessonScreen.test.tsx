import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonScreen } from './LessonScreen';

// The core chop contract: with the chop tool, tapping a piece halves it.
test('tapping the whole board chops it into two halves', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  expect(screen.getAllByRole('button', { name: '1/2 piece' })).toHaveLength(2);
});

// The glue tool combines two adjacent same-denominator pieces — numerators add.
test('the glue tool combines two quarters into a 2/4', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' })); // → two 1/2
  await user.click(screen.getAllByRole('button', { name: '1/2 piece' })[0]); // → a 1/2 + two 1/4
  await user.click(screen.getByRole('button', { name: /fuses two pieces/i })); // Glue tool
  await user.click(screen.getByRole('button', { name: 'Glue these two pieces' }));
  expect(screen.getByRole('button', { name: '2/4 piece' })).toBeInTheDocument();
});

// The simplify tool reduces a piece in place — 2/4 → 1/2, the equivalence reveal.
test('the simplify tool reduces a 2/4 to 1/2', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  await user.click(screen.getByRole('button', { name: '1/1 piece' }));
  await user.click(screen.getAllByRole('button', { name: '1/2 piece' })[0]);
  await user.click(screen.getByRole('button', { name: /fuses two pieces/i }));
  await user.click(screen.getByRole('button', { name: 'Glue these two pieces' }));
  // now: a 1/2 piece + a 2/4 piece
  await user.click(screen.getByRole('button', { name: /reduces a piece/i })); // Simplify tool
  await user.click(screen.getByRole('button', { name: '2/4 piece' }));
  expect(screen.getAllByRole('button', { name: '1/2 piece' })).toHaveLength(2);
});

// The readability limit: a piece cannot be chopped smaller than 1/64.
test('a piece cannot be chopped past 1/64', async () => {
  const user = userEvent.setup();
  render(<LessonScreen />);
  for (const fraction of ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32']) {
    await user.click(screen.getAllByRole('button', { name: `${fraction} piece` })[0]);
  }
  // The smallest pieces are now 1/64; tapping one must not chop further.
  await user.click(screen.getAllByRole('button', { name: '1/64 piece' })[0]);
  expect(screen.queryByRole('button', { name: '1/128 piece' })).toBeNull();
});
