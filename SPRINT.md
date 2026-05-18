# Fraction Dojo — Sprint Plan

A 1-week challenge cloning Synthesis Tutor: a voice-first, karate-themed math game
that teaches **fraction equivalence** (1/2 = 2/4 = 4/8). The whole is a wooden
**board**; a karate **chop** halves it, a **band-aid** mends it, an animated
**sensei** tutors, and completing the lesson earns a **belt**.

- Requirements: see `PRD.pdf`
- Due: ~2026-05-25
- Stack: Vite + React + TS, Tailwind, Zustand, ShadCN, framer-motion, Vitest.
  Pure-TS `core/` kept React-free so logic can port to React Native later.

## PR Backlog

Ordered so the PRD-satisfying MVP lands first, then demo-strengthening features,
then reach goals. Tick a box when its PR merges.

### Tier 1 — MVP (satisfies the PRD)
- [x] **PR 1 · Scaffold & tooling** — Vite+React+TS, Tailwind, Zustand, ShadCN, Vitest, lint; app shell boots; README skeleton.
- [ ] **PR 2 · Core domain logic** — pure-TS `fraction.ts` + `board.ts` (chop halves, mend merges) + unit tests.
- [ ] **PR 3 · Board manipulative** — `BoardView` SVG renders the piece tree; tap-to-chop + mend; `Toolbar`; store-wired.
- [ ] **PR 4 · Lesson engine + scripted tutor + README** — `engine.ts` + `script.ts`; text tutor; explore→guided→check-for-understanding with branching; placeholder sensei; finalized README. *(PRD satisfied after this PR.)*

### Tier 2 — Make it a great demo
- [ ] **PR 5 · Chop/mend juice** — particles, screen-shake, sparkle, action hover-previews, sound effects.
- [ ] **PR 6 · Animated sensei** — `<Sensei>` with AI-generated flat-vector poses + expressions.
- [ ] **PR 7 · Voice-first tutor** — Web Speech API speaks the script; transcript kept as fallback.
- [ ] **PR 8 · Onboarding ritual** — audio/music check, boy/girl pronoun, name pronunciation + phonetic fallback.
- [ ] **PR 9 · Belts & celebration** — belt progress UI + belt-up celebration (confetti + gong).
- [ ] **PR 10 · Adaptive presence** — idle-timer hints + proximity encouragement.
- [ ] **PR 11 · Accessibility & settings** — pause → Settings: voice speed, read-aloud, dyslexic font, on-screen keyboard.

### Tier 3 — Reach goals
- [ ] **PR 12 · Multi-lesson framework + 2nd lesson** — lesson registry, select screen, belt path.
- [ ] **PR 13 · Advanced chops** — strength-3/5 moves ("Tiger Strike" / "Crane Kick") for thirds & fifths.
- [ ] **PR 14 · Paint/color tool** — Fill tool; color carries fraction meaning.
- [ ] **PR 15 · Spanish (i18n)** — localized script + Spanish voice + language toggle.
- [ ] **PR 16 · Parent app & student registration** — parent sign-up, register a child as student.

## Deliverables (PRD)
- Working web app, runnable in a browser (tested in Chrome tablet view) — PR 1–4
- README with run instructions + technical approach — PR 4
- 1–2 minute demo video — recorded at end of sprint (not a PR)
