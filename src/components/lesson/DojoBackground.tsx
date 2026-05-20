/* The dojo set dressing — shoji-screen wall, wooden header beam, hanging
 * plaque, tatami floor. Ported from the Claude Design handoff (claude.ai/design). */

import { INK } from "@/constants/theme";

function BrushGlyph({ d, size = 54 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="-40 -30 80 60"
      width={size}
      height={size * 0.8}
      aria-hidden
      style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.35))" }}
    >
      <path
        d={d}
        stroke="#f8e9c6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function DojoBackground() {
  return (
    <div
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      aria-hidden
    >
      {/* paper wall */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #f8edd0 0%, #f0debb 70%, #e7cea0 100%)",
        }}
      />

      {/* shoji paper screen grid */}
      <svg
        viewBox="0 0 1366 900"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <pattern
            id="shoji"
            width="170"
            height="190"
            patternUnits="userSpaceOnUse"
          >
            <rect width="170" height="190" fill="none" />
            <rect
              x="0"
              y="0"
              width="170"
              height="190"
              fill="none"
              stroke="#c9a974"
              strokeWidth="3"
              opacity="0.45"
            />
            <line
              x1="85"
              y1="0"
              x2="85"
              y2="190"
              stroke="#c9a974"
              strokeWidth="2"
              opacity="0.35"
            />
            <line
              x1="0"
              y1="95"
              x2="170"
              y2="95"
              stroke="#c9a974"
              strokeWidth="2"
              opacity="0.35"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1366" height="640" fill="url(#shoji)" />
      </svg>

      {/* slim wooden header beam — edge-to-edge; chrome riding on top of
       *  it (pause / belt / topic) supplies the internal left/right/bottom
       *  padding via its own positioning. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          background:
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 64px)," +
            "linear-gradient(180deg, #a4703f 0%, #7a4a26 55%, #5a3318 100%)",
          borderBottom: "4px solid #3a2210",
          boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        }}
      />

      {/* hanging plaque — hangs from the beam and extends BELOW it so the
       *  board can overlap the bottom of it (instead of sitting cleanly
       *  beneath). The hanging strings ride inside the beam. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 48,
          transform: "translateX(-50%)",
          width: 200,
          height: 54,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "18%",
            top: -20,
            width: 3,
            height: 22,
            background: "#6b3f1f",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "18%",
            top: -20,
            width: 3,
            height: 22,
            background: "#6b3f1f",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #b73a32 0%, #92281f 100%)",
            borderRadius: 8,
            boxShadow:
              `inset 0 0 0 4px #f0d9a3, inset 0 0 0 6px ${INK}, 0 8px 16px rgba(0,0,0,0.4)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <BrushGlyph d="M -20 -12 L 20 -12 M 0 -12 L 0 14 M -16 14 L 16 14 M -12 4 L 12 4" />
          <BrushGlyph d="M -16 -14 L 16 -14 M -16 -14 L -16 12 L 16 12 L 16 -14 M -8 -2 L 8 -2" />
        </div>
      </div>

      {/* tatami floor */}
      <div
        className="tatami-pattern"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          boxShadow: "inset 0 30px 40px -10px rgba(120,80,30,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 4,
            background: INK,
          }}
        />
      </div>

      {/* wood baseboard */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 260,
          height: 12,
          background: "linear-gradient(180deg, #8a5224 0%, #4d2c14 100%)",
          boxShadow: "0 2px 0 #2b1808, 0 8px 14px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
