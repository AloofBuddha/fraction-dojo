import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: the app mounts and shows the lesson with its Chop tool.
// Guards against a broken build/provider wiring regressing the entry point.
test('renders the lesson screen with the Chop tool', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /chop/i })).toBeInTheDocument();
});
