# Fraction Dojo Lesson

_Started 2026-05-18 20:34 UTC_

---

## User

Design the core lesson screen for "Fraction Dojo" — a karate-themed math game
  that teaches children (ages ~5–11) that fractions like 1/2, 2/4, and 4/8 are the
  same amount. It runs in a browser on a tablet (iPad), landscape orientation.
  Think Synthesis Tutor / Duolingo: playful, warm, a game not a worksheet.

  THE METAPHOR
  The student is a karate student in a dojo. The "whole" is a wooden board. A
  karate chop splits a board into two equal halves; a band-aid mends chopped
  pieces back together. A friendly animated sensei is the tutor.

  THE SCREEN MUST INCLUDE
  1. The board manipulative — the centerpiece, given the most space. A large
     square wooden board that has been chopped into pieces of different sizes
     (e.g. one 1/2, two 1/4s, two 1/8s). Pieces are color-coded by size and each
     shows its fraction. This is what the child taps to chop.
  2. The sensei + tutor area — an animated karate sensei character with a speech
     bubble delivering one warm, encouraging line (the app is voice-first, so the
     bubble is supportive, not text-heavy).
  3. A toolbar — two clear, big, tappable tools: a "karate chop" tool (splits a
     piece in half) and a "band-aid" tool (mends pieces back together).
  4. A progress indicator styled as a karate belt (the student earns belts).
  5. A small pause / settings control.

  VISUAL LANGUAGE
  Flat vector cartoon. Warm and bright, with wood tones for the boards and a dojo
  setting (tatami mats, paper screens) — characterful but uncluttered; the board
  is the star. Kid-friendly, high-contrast, legible from a distance. Avoid generic
  corporate UI; it should feel like a polished game.

  CONSTRAINTS
  Landscape tablet (~1024×768 and up). Large touch targets sized for a child's
  finger. Clean and uncluttered.

  DELIVERABLE
  A polished mockup of this lesson screen. If you output code, target
  React + TypeScript + Tailwind CSS.

## Assistant

_[tool: view_image]_

_[tool: local_ls]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: local_ls]_

_[tool: local_read]_

_[tool: local_read]_

_[tool: list_files]_

_[tool: local_read]_

_[tool: local_read]_

_[tool: local_read]_

_[tool: local_read]_

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: local_read]_

The design system folder appears to be empty — I'll work from the brief and the Synthesis reference. The local repo has the core fraction/board logic and shadcn scaffolding, but no UI yet. I have enough to design the lesson screen.

Let me set up the prototype with a polished, full-bleed mockup plus Tweaks to switch sensei moods, board configurations, and lesson states.

_[tool: write_file]_

I have everything I need — the data model is a tree of `Piece { id, value, children }` with deterministic ids, and the brief is clear. Time to design.

**My approach:**
- **Setting:** Dojo interior — tatami floor, shoji paper screens, hanging banner with stylized kanji
- **Board:** Wooden-frame square, colored "painted wood" pieces (each fraction size = one color, like Cuisenaire rods), big fraction labels, slight grain texture
- **Sensei:** Flat-vector cartoon — round face, hachimaki headband, cream gi, black belt; friendly waving pose. Speech bubble shaped like rice-paper card.
- **Tools:** Two big tactile buttons (chop = karate-hand SVG, band-aid = plaster SVG). Active tool gets a glowing ring.
- **Belt progress:** A real karate belt graphic across the top with a knot, currently yellow, filling toward orange.
- **Goal card:** Small "make 1/2 with eighths" target indicator.
- **Color/type:** Fredoka display (rounded, kid-friendly), warm wood + paper + bold accent red palette.

Let me build it.

_[tool: invoke_skill]_

_[tool: run_script]_

_[tool: write_file]_

_[tool: write_file]_

PRD aligns with the brief. Continuing the build now.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

The board and chrome look great, but the speech bubble is missing and the banner peeks awkwardly above the board. Let me debug and fix.

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

The bubble exists in DOM but html-to-image isn't rendering the box-shadow border, so it blends into the cream paper background. Real browser will show it but let me make it more robust with explicit borders, plus tighten the banner placement and sensei position.

_[tool: str_replace_edit]_

Let me clean up the composition — remove the awkward banner and reposition the sensei properly.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

Found it — the `float-up` animation is stuck at opacity 0 (mid-animation? maybe key churn). Let me just remove the animation since it's not essential.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

Speech bubble is showing but text is wrapping awkwardly and overlapping. Let me make the bubble wider, shorter sensei lines, and fix the belt label wrap.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

The speech tail is covering the hint text. Let me fix the tail position.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

Looking really good! Let me test the interaction — click a piece to chop it.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

The bubble feels disconnected from the sensei. Let me anchor it just above his head.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: update_todos]_

_[tool: done]_

Composition is locked in. Let me also add a tiny polish: when the bubble is above the sensei, anchor the tail toward his head (slightly right of center). And let me also do a final touch: write a brief explanation in a small "designer's notes" markdown next to the artifact.

Actually, let me just ship it — this is solid. Going to `done`.

_[tool: fork_verifier_agent]_

Designed a polished, voice-first lesson screen for **Fraction Dojo**. Here's what's in it:

**The shot**
- **Wooden board** centerpiece, framed like a training plaque (with corner nails). Pieces are colored Cuisenaire-style by denominator — red halves, gold quarters, green eighths — with big fraction labels and a subtle wood-grain wash.
- **Sensei** is a flat-vector cartoon waving from the tatami floor (hachimaki headband, cream gi, black belt). His expression switches with the lesson state (happy / cheer / think / wow / wide-eyed).
- **Speech bubble** is a rice-paper card with a washi-tape accent and a "Sensei" mic indicator — voice-first, so the bubble is short and supportive ("1/2 = 2/4 = 4/8 — same amount!" + a coaching hint underneath).
- **Toolbar** on the right: two big tactile wood-veneer buttons — Chop (karate hand) and Band-aid. The active tool gets a "READY" badge and a glowing red ring. Undo + context hint below.
- **Belt progress** at the top — a row of all 8 belt-rank tiles plus a live yellow-belt strip showing earned stripes and the next rank.
- **Pause** as a round wooden disc top-left. Plaque with kanji-style brushwork hangs above the board.
- **Dojo set dressing**: shoji-paper wall grid, a top wooden beam, wood baseboard, tatami floor stripes.

**It's interactive**: tap any piece → karate-chop animation (white slash + new halves pop in); switch to Band-aid → mendable seams pulse with a band-aid icon, tap to join; sparkle burst on each move; undo. State mirrors `src/core/board.ts` exactly so it ports straight in.

**Tweaks (toolbar toggle)**: 6 board presets (whole → all-eighths), belt rank + stripe count, sensei mood, default tool, speech override, scene toggles.

**Caveat / next**: I had to mock the design system from scratch (the linked one was empty), so type and palette are my call — happy to swap the font (currently Fredoka) or recolor the pieces if you have preferences. The chop/mend logic uses the same path-based ids your tests assert on, so wiring this React tree into your repo means just replacing the local `presetBoard()` with your Zustand-backed `board` state.

