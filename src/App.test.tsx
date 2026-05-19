import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

// On a first load, the dojo opens with the intro title — no lesson yet.
test('on first load the dojo opens with the intro title', () => {
  render(<App />);
  expect(screen.getByText(/fraction dojo/i)).toBeInTheDocument();
});

// Returning students skip the intro and go straight into the lesson.
test('with the intro already seen, the lesson renders with the Chop tool', () => {
  localStorage.setItem('dojo:introSeen', 'true');
  render(<App />);
  expect(screen.getByRole('button', { name: /chop/i })).toBeInTheDocument();
});
