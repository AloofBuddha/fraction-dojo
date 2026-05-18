# Fraction Dojo

A voice-first, karate-themed math tutor that teaches **fraction equivalence**
(½ = 2/4 = 4/8). Built as a 1-week prototype cloning the Synthesis Tutor
experience — a conversational tutor paired with an interactive manipulative.

> **Status:** in development. See [`SPRINT.md`](./SPRINT.md) for the PR roadmap
> and [`PRD.pdf`](./PRD.pdf) for the original brief.

## How it works

The student is a karate student in a dojo. A whole is a wooden **board**; a
**karate chop** halves a board and a **band-aid** mends it back. By chopping and
mending, the student discovers that different fractions can cover the same space
— that they are *equivalent*. An animated **sensei** guides the lesson.

## Running the app

Requires **Node.js 20.19+** and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

The app is a standard web app — open it in any modern browser. It is designed
for tablets; test it in Chrome DevTools' device/tablet mode.

### Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Type-check and build for production  |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | Run ESLint                           |
| `npm run typecheck`| Run the TypeScript compiler          |
| `npm test`         | Run the unit tests (Vitest)          |

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** for components
- **Zustand** for state
- **Vitest** + Testing Library for tests

Game logic lives in a framework-agnostic `src/core/` layer (pure TypeScript) so
it can be reused if the app is ported to React Native later.

## Technical approach

_To be written up in PR 4, once the lesson is playable end-to-end._
