# Fraction Dojo — Sprint Plan

A 1-week challenge cloning Synthesis Tutor: a karate-themed math game that
teaches **fraction equivalence** (1/2 = 2/4 = 4/8). The whole is a wooden
**board**; three tools reshape it — **Chop** halves a piece, **Glue** merges
two into one, **Simplify** renames a piece in lower terms — and an animated
**sensei** tutors. Completing a lesson earns a karate **belt**.

- Requirements: see `PRD.pdf`
- Due: ~2026-05-25
- Stack: Vite + React + TS, Vitest. Pure-TS `core/` kept React-free so the
  logic can port to React Native later.

## Done

- **Scaffold & tooling** — Vite + React + TS, Tailwind, Vitest, ESLint.
- **Core domain logic** — pure-TS `fraction.ts`, `board.ts` (region model:
  chop / glue / simplify), `rect.ts` geometry; 56 unit tests.
- **Board manipulative** — `BoardView` renders the board; three tools with
  on-board feedback (chop preview line, glowing glue seams, simplify glow).
- **Dojo UI** — the dojo screen integrated from the Claude Design handoff:
  sensei, speech bubble, tool buttons, belt bar, wooden frame.
- **Lesson engine — Phase 1** — `core/lesson.ts` + the `LessonScreen` runner.
  The **White Belt**: a 4-step on-rails lesson teaching Chop, Glue, Simplify,
  ending on the equivalence reveal (2/4 = 1/2). Each step is gated by a
  Continue button so nothing races off-screen.

## Backlog

Ordered by priority — tick a box when done.

### 1 · Lessons & teaching (the core deliverable)
- [ ] **Challenge steps** — a step kind with a start board and a goal state;
      the student reaches it with freely-chosen tools.
- [ ] **Question steps** — Synthesis-style teaching moments: the sensei asks
      and the student answers a fraction in a `[ ] / [ ]` input; right and
      wrong answers get different responses.
- [ ] **Real curriculum** — belts beyond White: each belt teaches an
      equivalence idea at rising mastery (recognise → build → answer unaided).
- [ ] **Hints** — surface each step's hints when the student is stuck.
- [ ] **Progressive tools** — reveal a tool only once a lesson has taught it.

### 2 · Audio-visual polish (make it feel good)
- [ ] **Visual juice** — chop particles, glue sparkle, simplify shimmer,
      step-success and belt-up celebrations.
- [ ] **Sound effects** — chop, glue, simplify, success, belt-up.
- [ ] **Sensei expressions** — poses / expressions that react to the lesson.

### 3 · Intro & onboarding
- [ ] **Intro screen** — a game-style start that collects name + pronoun
      (skippable). Light polish, not on the critical path.

### 4 · Ship it
- [ ] **Deploy** — deploy to a public URL for browser / tablet testing.
- [ ] **README + demo** — finalize the README's technical approach and
      run instructions; record the 1–2 minute demo video.

## Deliverables (PRD)
- Working web app, runnable in a browser (tested in Chrome tablet view)
- README with run instructions + technical approach
- 1–2 minute demo video — recorded at the end of the sprint
