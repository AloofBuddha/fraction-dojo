/* The dojo intro — plays on first load, sets a localStorage flag so a
 * returning student skips it. Welcomes the student, then *interactively*
 * teaches what a fraction is: the student clicks the numerator and the
 * denominator on a `1/1` board to learn what each part means. Hands off to
 * the lesson once the student is ready. */

import { useState } from "react";
import type { CSSProperties } from "react";
import { createBoard, type LabelKind } from "@/core/board";
import { BoardView } from "./BoardView";
import { Sensei } from "./Sensei";
import { SpeechBubble } from "./SpeechBubble";
import { DojoBackground } from "./DojoBackground";
import { PauseButton } from "./PauseButton";
import { playSound } from "./sound";
import "@/styles/dojo.css";

// One whole, shown unchanged through the "what is a fraction" beats.
const INTRO_BOARD = createBoard();

type BeatKind = "narrate" | "wait-for-numerator" | "wait-for-denominator";

interface Beat {
  /** What the sensei says — empty on the title beat. */
  readonly text: string;
  readonly kind: BeatKind;
  readonly showSensei: boolean;
  readonly showBoard: boolean;
}

// Beat 0 is the title screen. Beats 1+ are the sensei's monologue, with two
// "wait-for-label" beats that advance only when the student taps the right
// number on the board.
const BEATS: readonly Beat[] = [
  { text: "", kind: "narrate", showSensei: false, showBoard: false },
  {
    text: "Welcome to the Fraction Dojo.",
    kind: "narrate",
    showSensei: true,
    showBoard: false,
  },
  {
    text: "Here, we learn to chop — not only blocks, but numbers themselves!",
    kind: "narrate",
    showSensei: true,
    showBoard: false,
  },
  {
    text: "This is the board — one whole. The number on top is how many parts you have. Tap it.",
    kind: "wait-for-numerator",
    showSensei: true,
    showBoard: true,
  },
  {
    text: "One — the part you have right now.",
    kind: "narrate",
    showSensei: true,
    showBoard: true,
  },
  {
    text: "And the number underneath is how many parts there are in total. Tap it.",
    kind: "wait-for-denominator",
    showSensei: true,
    showBoard: true,
  },
  {
    text: "One — the total parts. So one over one is the whole. Ready to begin training?",
    kind: "narrate",
    showSensei: true,
    showBoard: true,
  },
];

interface IntroSceneProps {
  /** Called when the last beat is dismissed — App swaps in the LessonScreen. */
  onDone: () => void;
}

export function IntroScene({ onDone }: IntroSceneProps) {
  const [index, setIndex] = useState(0);
  const beat = BEATS[index];
  const isTitle = index === 0;
  const isLast = index >= BEATS.length - 1;
  const isWaiting =
    beat.kind === "wait-for-numerator" || beat.kind === "wait-for-denominator";

  const advance = () => {
    playSound(isTitle ? "gong" : "continue");
    if (isLast) onDone();
    else setIndex(index + 1);
  };

  const handleLabelTap = (_pieceId: string, label: LabelKind) => {
    if (beat.kind === "wait-for-numerator" && label === "numerator") {
      playSound("select");
      setIndex(index + 1);
    } else if (
      beat.kind === "wait-for-denominator" &&
      label === "denominator"
    ) {
      playSound("select");
      setIndex(index + 1);
    } else {
      playSound("wrong");
    }
  };

  const highlightLabel: LabelKind | undefined =
    beat.kind === "wait-for-numerator"
      ? "numerator"
      : beat.kind === "wait-for-denominator"
        ? "denominator"
        : undefined;

  return (
    <div className="stage">
      <div className="frame">
        <DojoBackground />

        {/* top bar — only the pause button during intro */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 112,
            zIndex: 5,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <PauseButton />
          </div>
        </div>

        {isTitle ? (
          <div
            className="dojo-title-in"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "30%",
              textAlign: "center",
              zIndex: 4,
              padding: "0 20px",
            }}
          >
            <div
              style={{
                fontFamily: "Fredoka, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "clamp(24px, 3vw, 42px)",
                color: "#fdf6e2",
                textShadow: "0 3px 0 #1f1712, 0 8px 16px rgba(0,0,0,0.45)",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Welcome to
            </div>
            <div
              style={{
                fontFamily: "Fredoka, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(56px, 9vw, 112px)",
                color: "#fdf6e2",
                textShadow: "0 6px 0 #1f1712, 0 14px 28px rgba(0,0,0,0.5)",
                letterSpacing: 1,
                lineHeight: 1.05,
              }}
            >
              Fraction Dojo
            </div>
            <button type="button" onClick={advance} style={BEGIN_BUTTON}>
              Begin
            </button>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 200,
              bottom: 20,
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              gap: 20,
              padding: "0 20px",
              zIndex: 2,
            }}
          >
            {/* sensei + speech + (when not waiting) continue */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                height: "100%",
                paddingBottom: 14,
              }}
            >
              <div style={{ width: "min(100%, 360px)" }}>
                <SpeechBubble text={beat.text} />
              </div>
              {!isWaiting && (
                <button type="button" onClick={advance} style={CONTINUE_BUTTON}>
                  <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>
                    ✓
                  </span>
                  {isLast ? "Begin Training" : "Continue"}
                </button>
              )}
              {beat.showSensei && (
                <div
                  className="sensei-entering"
                  style={{
                    width: "min(260px, 100%)",
                    aspectRatio: "400 / 520",
                    marginTop: 8,
                    pointerEvents: "none",
                  }}
                >
                  <Sensei mood="happy" talking />
                </div>
              )}
            </div>

            {/* the board (one whole) — appears once the fraction beats begin */}
            <div style={{ display: "grid", placeItems: "start center" }}>
              {beat.showBoard && (
                <div style={{ width: "min(100%, calc(100svh - 280px))" }}>
                  <BoardView
                    board={INTRO_BOARD}
                    tool={null}
                    highlightLabel={highlightLabel}
                    onLabelTap={handleLabelTap}
                    onPieceTap={() => undefined}
                    onGlue={() => undefined}
                  />
                </div>
              )}
            </div>

            {/* tools column — intentionally empty during intro */}
            <div />
          </div>
        )}
      </div>
    </div>
  );
}

const CONTINUE_BUTTON: CSSProperties = {
  marginTop: 52,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 26px",
  borderRadius: 999,
  border: "3px solid #1f1712",
  background: "linear-gradient(180deg, #7ed47f, #4caf50)",
  color: "#fff",
  fontFamily: "Fredoka, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 17,
  cursor: "pointer",
  boxShadow: "0 5px 0 #1f1712, 0 8px 14px rgba(0,0,0,0.25)",
};

const BEGIN_BUTTON: CSSProperties = {
  marginTop: 36,
  padding: "14px 44px",
  borderRadius: 999,
  border: "3px solid #1f1712",
  background: "linear-gradient(180deg, #ef6f5a, #d8453d)",
  color: "#fff",
  fontFamily: "Fredoka, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 22,
  cursor: "pointer",
  boxShadow: "0 6px 0 #1f1712, 0 10px 18px rgba(0,0,0,0.3)",
};
