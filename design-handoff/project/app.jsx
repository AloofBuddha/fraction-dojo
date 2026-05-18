/* global React, ReactDOM */
/* global Sensei, BoardView, DojoBackground, BeltBar, SpeechBubble, ToolButton, PauseButton, BELT_RANKS */
/* global IconChop, IconBandaid, IconMic, IconCheck, IconStar */
/* global createWhole, chopBoard, mendBoard, findP, allLeaves, allMendable, canMendPiece, F, fmt, isLeaf */
/* global TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakRadio, TweakToggle, TweakSelect */

const { useState, useEffect, useMemo, useRef } = React;

/* ─── presets ─────────────────────────────────────────────────────── */
function presetBoard(name) {
  // Build the trees the brief describes.
  let b = createWhole();
  switch (name) {
    case 'whole':
      return b;
    case 'halves':
      return chopBoard(b, 'r');
    case 'half_and_quarters':
      // 1/2 top, 1/4 + 1/4 bottom
      b = chopBoard(b, 'r');
      b = chopBoard(b, 'r.1');
      return b;
    case 'half_quarter_eighths':
      // 1/2 top; bottom = 1/4 + (1/8, 1/8)
      b = chopBoard(b, 'r');         // r.0 (1/2), r.1 (1/2)
      b = chopBoard(b, 'r.1');       // r.1.0 (1/4), r.1.1 (1/4)
      b = chopBoard(b, 'r.1.1');     // r.1.1.0 (1/8), r.1.1.1 (1/8)
      return b;
    case 'all_quarters':
      b = chopBoard(b, 'r');
      b = chopBoard(b, 'r.0');
      b = chopBoard(b, 'r.1');
      return b;
    case 'all_eighths':
      b = chopBoard(b, 'r');
      b = chopBoard(b, 'r.0');
      b = chopBoard(b, 'r.1');
      b = chopBoard(b, 'r.0.0');
      b = chopBoard(b, 'r.0.1');
      b = chopBoard(b, 'r.1.0');
      b = chopBoard(b, 'r.1.1');
      return b;
    default:
      return b;
  }
}

/* sensei lines, picked by board signature */
function senseiLineFor(board) {
  const leaves = allLeaves(board);
  const dens = leaves.map((p) => p.value.den).sort((a, b) => a - b);
  const sig = dens.join(',');

  if (sig === '1') {
    return { mood: 'wow',   text: 'One whole board. Ready for a chop?',         hint: 'Tap the board with your karate chop.' };
  }
  if (sig === '2,2') {
    return { mood: 'happy', text: 'Two halves \u2014 they make one whole!',     hint: 'Try chopping a half next.' };
  }
  if (sig === '2,4,4') {
    return { mood: 'happy', text: 'Half on top, two quarters below. Same size!', hint: '1/2 = 2/4. Now chop a quarter\u2026' };
  }
  if (sig === '2,4,8,8') {
    return { mood: 'cheer', text: '1/2 = 2/4 = 4/8 \u2014 same amount!',         hint: 'Chop the half to see four eighths.' };
  }
  if (sig === '2,8,8,8,8') {
    return { mood: 'cheer', text: 'Boom! 4/8 fills the same space as 1/2.',     hint: 'Try a band-aid to mend two eighths back.' };
  }
  if (sig === '4,4,4,4') {
    return { mood: 'cheer', text: 'Four quarters \u2014 one whole board. 4/4 = 1!', hint: 'Tap a band-aid seam to mend a half.' };
  }
  if (sig === '8,8,8,8,8,8,8,8') {
    return { mood: 'wow',   text: 'Eight eighths! 8/8 = one whole board.',      hint: 'Big chop, little chop \u2014 same wood.' };
  }
  if (dens.length === 1) {
    return { mood: 'wow',   text: 'One whole, ready to chop!',                  hint: 'Karate chop time.' };
  }
  return {
    mood: 'think',
    text: 'Different pieces, same board. Spot a half?',
    hint: 'Mend two with the band-aid to make one.',
  };
}

/* ─── lesson screen ──────────────────────────────────────────────── */
function LessonScreen() {
  const [t] = useTweaks(/*EDITMODE-BEGIN*/{
    "scenario": "half_quarter_eighths",
    "defaultTool": "chop",
    "rankIndex": 1,
    "stripes": 2,
    "showBelt": true,
    "showHint": true,
    "showTatami": true,
    "showBanner": true,
    "senseiMoodOverride": "auto",
    "speechOverride": ""
  }/*EDITMODE-END*/);

  const [board, setBoard] = useState(() => presetBoard(t.scenario));
  const [tool,  setTool]  = useState(t.defaultTool);
  const [history, setHistory] = useState([]);
  const [chopFx, setChopFx] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const chopKey = useRef(0);

  // When scenario changes via Tweaks, reset the board.
  const lastScenario = useRef(t.scenario);
  useEffect(() => {
    if (t.scenario !== lastScenario.current) {
      setBoard(presetBoard(t.scenario));
      setHistory([]);
      lastScenario.current = t.scenario;
    }
  }, [t.scenario]);

  // Sync default-tool tweak into live tool, but only when user changes the tweak.
  const lastTool = useRef(t.defaultTool);
  useEffect(() => {
    if (t.defaultTool !== lastTool.current) {
      setTool(t.defaultTool);
      lastTool.current = t.defaultTool;
    }
  }, [t.defaultTool]);

  /* ─── interactions ────────────────────────────────────────────── */
  const handlePieceTap = (id) => {
    if (tool !== 'chop') return;
    const piece = findP(board, id);
    if (!piece || !isLeaf(piece)) return;
    // Burst
    chopKey.current += 1;
    const layout = require_layout(board);
    const rect = layout.find((r) => r.id === id);
    if (rect) {
      setChopFx({
        key: chopKey.current,
        x: rect.x, y: rect.y, w: rect.w, h: rect.h,
        vertical: rect.w > rect.h,
        onDone: () => setChopFx(null),
      });
    }
    setHistory((h) => [...h, board]);
    setBoard(chopBoard(board, id));
    triggerCelebrate();
  };

  const handleSeamTap = (parentId) => {
    if (tool !== 'bandaid') return;
    if (!canMendPiece(findP(board, parentId))) return;
    setHistory((h) => [...h, board]);
    setBoard(mendBoard(board, parentId));
    triggerCelebrate();
  };

  const triggerCelebrate = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 700);
  };

  const undo = () => {
    if (history.length === 0) return;
    setBoard(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  /* ─── sensei line ─────────────────────────────────────────────── */
  const senseiAuto = senseiLineFor(board);
  const mood = t.senseiMoodOverride === 'auto' ? senseiAuto.mood : t.senseiMoodOverride;
  const speechText = t.speechOverride.trim() || senseiAuto.text;
  const hintText   = t.speechOverride.trim() ? '' : senseiAuto.hint;

  /* ─── stage scaling ────────────────────────────────────────────── */
  const stageRef = useRef(null);
  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const sx = window.innerWidth  / 1366;
      const sy = window.innerHeight / 900;
      const s  = Math.min(sx, sy);
      el.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const choppableCount = useMemo(() => allLeaves(board).length, [board]);
  const mendableCount  = useMemo(() => allMendable(board).length, [board]);

  return (
    <div className="stage">
      <div ref={stageRef} className="frame">
        <DojoBackground />

        {/* ─── top bar ───────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: 18, left: 18, right: 18, height: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 5, pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PauseButton onClick={() => alert('Pause / Settings')} />
          </div>
          {t.showBelt && (
            <div style={{ pointerEvents: 'auto' }}>
              <BeltBar rankIndex={t.rankIndex} stripes={t.stripes} stripesTotal={3} />
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(34, 20, 10, 0.86)',
            borderRadius: 999, padding: '10px 18px', color: '#f6ecd6',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255, 220, 150, 0.18)',
            fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16,
            pointerEvents: 'auto',
          }}>
            <span style={{ color: '#f4cd44' }}>🥋</span>
            <span>Lesson 1 · Equivalent Fractions</span>
          </div>
        </div>

        {/* ─── main row ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 100, bottom: 18,
          display: 'grid',
          gridTemplateColumns: '340px 1fr 180px',
          gap: 20,
          padding: '0 24px 0 24px',
          zIndex: 2,
        }}>
          {/* ── LEFT: sensei + speech ─────────────────────────── */}
          <div style={{
            position: 'relative', height: '100%',
          }}>
            {/* Sensei stands on tatami floor — anchored bottom */}
            <div style={{
              position: 'absolute', left: 0, bottom: 14, width: 300, height: 390,
              pointerEvents: 'none',
            }}>
              <Sensei mood={mood} talking />
              {/* shadow on tatami */}
              <div style={{
                position: 'absolute', left: 40, right: 40, bottom: 4, height: 14,
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(2px)',
              }}/>
            </div>
            {/* Speech bubble — anchored just above the sensei */}
            <div key={speechText}
                 style={{ position: 'absolute', left: 70, bottom: 380, right: -30, zIndex: 3 }}>
              <SpeechBubble text={speechText} accent={t.showHint ? hintText : ''} talking />
            </div>
          </div>

          {/* ── CENTER: board ─────────────────────────────────── */}
          <div style={{
            position: 'relative',
            display: 'grid', placeItems: 'center',
            paddingTop: 4,
          }}>
            <div style={{ width: 'min(620px, 100%)', position: 'relative' }}>
              <BoardView
                board={board}
                tool={tool}
                chopFx={chopFx}
                onPieceTap={handlePieceTap}
                onSeamTap={handleSeamTap}
              />
              {celebrate && <SparkleBurst />}
            </div>
          </div>

          {/* ── RIGHT: tools ──────────────────────────────────── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
            paddingTop: 8,
          }}>
            <div style={{
              fontFamily: 'Fredoka', fontWeight: 700, fontSize: 13, letterSpacing: 2,
              color: '#7a4a26', textTransform: 'uppercase',
            }}>
              Your Tools
            </div>

            <ToolButton
              label="Chop"
              hint={`Halves a piece`}
              active={tool === 'chop'}
              onClick={() => setTool('chop')}
            >
              <IconChop size={70} />
            </ToolButton>

            <ToolButton
              label="Band-aid"
              hint={`Joins two halves`}
              disabled={mendableCount === 0}
              active={tool === 'bandaid'}
              accent="#f0b876"
              onClick={() => setTool('bandaid')}
            >
              <IconBandaid size={68} />
            </ToolButton>

            <button
              onClick={undo}
              disabled={history.length === 0}
              style={{
                marginTop: 6,
                padding: '8px 16px', borderRadius: 999,
                background: 'rgba(34, 20, 10, 0.86)', color: '#f6ecd6',
                fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
                boxShadow: 'inset 0 0 0 2px rgba(255, 220, 150, 0.18), 0 4px 0 rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: history.length === 0 ? 0.4 : 1,
              }}
            >
              <IconUndo size={18} /> Undo
            </button>

            <div style={{
              marginTop: 10, padding: '10px 12px',
              background: 'rgba(246, 236, 214, 0.92)',
              border: '2px solid #1f1712', borderRadius: 14,
              fontFamily: 'Fredoka', fontWeight: 600, fontSize: 12.5,
              color: '#3a2e23', textAlign: 'center', lineHeight: 1.25,
              boxShadow: '0 3px 0 #1f1712',
            }}>
              {tool === 'chop'
                ? `Tap any piece to chop it.`
                : `Tap the glowing seam to mend.`}
            </div>
          </div>
        </div>

        {/* tweaks panel */}
        <TweaksPanel title="Fraction Dojo Tweaks">
          <TweakSection title="Board">
            <TweakSelect tweak="scenario" label="Board state" options={[
              { value: 'whole',                  label: 'Untouched whole' },
              { value: 'halves',                 label: 'Halves (1/2 + 1/2)' },
              { value: 'half_and_quarters',      label: 'Half + two quarters' },
              { value: 'half_quarter_eighths',   label: '1/2 + 1/4 + 1/8 + 1/8' },
              { value: 'all_quarters',           label: 'All quarters (4)' },
              { value: 'all_eighths',            label: 'All eighths (8)' },
            ]} />
            <TweakRadio tweak="defaultTool" label="Active tool" options={[
              { value: 'chop',    label: 'Chop' },
              { value: 'bandaid', label: 'Band-aid' },
            ]} />
          </TweakSection>

          <TweakSection title="Belt progress">
            <TweakSelect tweak="rankIndex" label="Belt rank" options={BELT_RANKS.map((r, i) => ({
              value: i, label: r.name,
            }))} />
            <TweakSlider tweak="stripes"   label="Stripes earned" min={0} max={3} step={1} />
            <TweakToggle tweak="showBelt"  label="Show belt bar" />
          </TweakSection>

          <TweakSection title="Sensei">
            <TweakRadio tweak="senseiMoodOverride" label="Mood" options={[
              { value: 'auto',  label: 'Auto' },
              { value: 'happy', label: 'Happy' },
              { value: 'cheer', label: 'Cheer' },
              { value: 'think', label: 'Think' },
              { value: 'wow',   label: 'Wow' },
            ]} />
            <TweakToggle tweak="showHint" label="Show coaching hint" />
          </TweakSection>

          <TweakSection title="Scene">
            <TweakToggle tweak="showTatami" label="Tatami floor" />
            <TweakToggle tweak="showBanner" label="Dojo banner" />
          </TweakSection>
        </TweaksPanel>
      </div>
    </div>
  );
}

/* helper — used by handlePieceTap; defined here to avoid a recompute cycle */
function require_layout(board) {
  return window.layoutTree(board, 0, 0, 1, 1);
}

/* ─── celebration sparkle burst ───────────────────────────────────── */
function SparkleBurst() {
  const N = 14;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6,
    }}>
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2;
        const dist  = 220 + Math.random() * 60;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 18 + Math.random() * 14;
        const color = ['#ffd54a', '#d8453d', '#fff', '#7ab560'][i % 4];
        return (
          <div key={i}
               style={{
                 position: 'absolute', left: '50%', top: '50%',
                 transform: `translate(-50%, -50%)`,
                 '--dx': `${dx}px`, '--dy': `${dy}px`,
                 width: size, height: size, color,
                 animation: `sparkle 700ms ease-out forwards`,
               }}>
            <IconStar size={size} />
          </div>
        );
      })}
      <style>{`@keyframes sparkle {
        0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        25%  { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4); opacity: 0; }
      }`}</style>
    </div>
  );
}

/* ─── mount ───────────────────────────────────────────────────────── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LessonScreen />);
