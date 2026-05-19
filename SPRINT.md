# Fraction Dojo — Sprint Plan

A 1-week challenge cloning Synthesis Tutor: a karate-themed math game that
teaches **fraction equivalence** (1/2 = 2/4 = 4/8). The whole is a wooden
**board**; three tools reshape it — **Chop** halves a piece, **Glue** merges
two into one, **Simplify** renames a piece in lower terms — and an animated
**sensei** tutors. Completing a belt earns a karate **belt**.

- Requirements: see `PRD.pdf`
- Due: ~2026-05-25
- Stack: Vite + React + TS, Vitest. Pure-TS `core/` kept React-free.

## Done

- **Scaffold & tooling** — Vite + React + TS, Tailwind, Vitest, ESLint.
- **Core domain logic** — pure-TS fraction / board (region model: chop, glue,
  simplify) / rect geometry; 68 unit tests.
- **Board manipulative** — `BoardView` renders the board; three tools with
  on-board feedback (chop preview, glowing glue seams, simplify glow).
- **Dojo UI** — sensei, speech bubble, tool buttons, belt bar, wooden frame
  (from the Claude Design handoff).
- **Lesson engine** — `core/lesson.ts` + the `LessonScreen` runner: `board`
  and `question` step kinds, progressive tool reveal, Continue gate, per-puzzle
  Reset, locked-piece "master" reference, settle beat before celebration.
- **White Belt & Yellow Belt — placeholder curriculum** — proves the engine
  end-to-end; will be reworked into the real curriculum below.
- **Audio-visual polish** — Web Audio synth + file-override system with a
  one-at-a-time playback queue; nine effects (chop, glue, simplify, success,
  beltUp, wrong, continue, select, reset) with five real recordings supplied;
  confetti burst and sensei hop on success; carved-stone locked-master art.

## Backlog

### 1 · The intro experience (next)
- [ ] **Dojo opening** — initial load: nothing but the dojo background (plus
      Pause); the sensei walks in; *"Welcome to my dojo"* — mock-wisdom about
      learning to chop not only blocks but numbers themselves.
- [ ] **What a fraction is** — sensei introduces the board with `1/1` on it,
      explains the numerator-over-denominator idea (parts over total parts).
- [ ] **First-cut transition** — chopping the whole moves the student into
      the White Belt curriculum proper.
- [ ] **Progress persistence (localStorage)** — remember unlocked belts so
      returning students skip the intro and can revisit earned belts.

### 2 · The real curriculum
- [ ] **Two-phase tool intros** — when a new tool appears, the sensei first
      says *"Tap the Glue tool"*; once the student selects it, *"Now tap the
      seam to glue them."* Each tool selection is a separate beat.
- [ ] **White Belt — the Chop** — chop *is* "divide by 2"; a substantive
      chop-only challenge (e.g. chop down to a 1/64 piece) before any other
      tool is introduced.
- [ ] **Glue Belt** — glue *is* "add"; build fractions by combining quarters,
      eighths, etc.
- [ ] **Simplify Belt** — simplify *is* "divide by GCD"; the equivalence
      reveal.
- [ ] **Tool-meaning mini-lessons** — woven into each belt: name the math
      operation behind the tool, not just the move.
- [ ] **Hints** — surface a step's hints when the student is stuck.

### 3 · More polish
- [ ] **Visual juice** — chop particles, glue sparkle, simplify shimmer,
      **board-tap burst** (to restore from the Claude Design session — owner
      will reshare the link).

### 4 · Ship it
- [ ] **Deploy** — deploy to a public URL.
- [ ] **README + demo** — finalize README; record the 1–2 minute demo video.

## Deliverables (PRD)
- Working web app, runnable in a browser (tested in Chrome tablet view)
- README with run instructions + technical approach
- 1–2 minute demo video — recorded at the end of the sprint
