import { render, screen } from '@testing-library/react'
import App from './App'

// Smoke test: the app shell mounts and renders its title.
// Guards against a broken build/provider wiring regressing the entry point.
test('renders the Fraction Dojo title', () => {
  render(<App />)
  expect(
    screen.getByRole('heading', { name: /fraction dojo/i }),
  ).toBeInTheDocument()
})
