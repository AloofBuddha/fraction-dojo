# Design Handoff — reference only

This folder is the **Claude Design** (claude.ai/design) handoff bundle for the
Fraction Dojo lesson screen. It is kept as **reference material** — it is **not**
part of the application:

- nothing here is imported by `src/`, so Vite never bundles it;
- the `.jsx` / `.html` / `.css` files are prototypes, not production code;
- TypeScript (`tsconfig` includes only `src`) and ESLint (`.tsx` only) ignore it.

## What's here

- `README.md` — the handoff's own instructions for coding agents.
- `chats/chat1.md` — the design conversation (the intent behind the design).
- `project/` — the HTML/CSS/JSX prototype + `screenshots/` (see `after-chop.png`
  for the intended look; `initial.png` rendered black — a known export glitch).

## How we're using it

We implement it **one PR at a time**, porting primitives into our React + TS
stack as each PR comes up — not wholesale.

- **PR 3** — ported `BoardView` (the board manipulative) → `src/components/lesson/`.
- **Later PRs** — `sensei.jsx`, `chrome.jsx` (`DojoBackground`, `BeltBar`,
  `SpeechBubble`, `ToolButton`, `PauseButton`) feed PRs 4 / 7 / 9 / 10 / 12.

When porting, recreate the *visual output* in our stack — don't copy the
prototype's structure — and wire to the real model in `src/core/`.
