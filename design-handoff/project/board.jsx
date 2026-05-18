/* global React */
/*
 * Board manipulative — the heart of the lesson.
 *
 * Mirrors the pure-TS model in src/core/board.ts:
 *   Piece { id, value: {num,den}, children[] }
 *   - chop(): splits a leaf into 2 equal children
 *   - mend(): collapses an "all-leaf-children" parent back to a leaf
 *
 * The visual is a wooden square. Each chop alternates orientation by depth
 * so a tree of halves lays out as nice rectangles. The fraction label sits
 * dead-centre on each piece. Color = denominator (Cuisenaire-rod logic).
 */

const { useMemo, useState, useEffect } = React;

/* ─── core (mirror of src/core/board.ts) ─────────────────────────── */
const F = (n, d) => ({ num: n, den: d });
const fmt = (f) => `${f.num}/${f.den}`;
const split = (f, parts) => F(f.num, f.den * parts);

function createWhole() {
  return { id: 'r', value: F(1, 1), children: [] };
}
function chopPiece(piece) {
  const childVal = split(piece.value, 2);
  return {
    ...piece,
    children: [
      { id: piece.id + '.0', value: childVal, children: [] },
      { id: piece.id + '.1', value: childVal, children: [] },
    ],
  };
}
function transformPiece(piece, id, fn) {
  if (piece.id === id) return fn(piece);
  if (piece.children.length === 0) return piece;
  return { ...piece, children: piece.children.map((c) => transformPiece(c, id, fn)) };
}
function chopBoard(root, id) {
  return transformPiece(root, id, chopPiece);
}
function mendBoard(root, id) {
  return transformPiece(root, id, (p) => ({ ...p, children: [] }));
}
function isLeaf(p) { return p.children.length === 0; }
function canMendPiece(p) { return !isLeaf(p) && p.children.every(isLeaf); }
function walk(p, visit) { visit(p); p.children.forEach((c) => walk(c, visit)); }
function findP(root, id) { let r; walk(root, (p) => { if (p.id === id) r = p; }); return r; }
function allLeaves(root) { const out = []; walk(root, (p) => { if (isLeaf(p)) out.push(p); }); return out; }
function allMendable(root) { const out = []; walk(root, (p) => { if (canMendPiece(p)) out.push(p); }); return out; }

/* ─── layout ─────────────────────────────────────────────────────── */
// depth-0 chop = horizontal cut (top/bottom).  Alternates by depth.
function layoutTree(piece, x, y, w, h, depth = 0, out = []) {
  if (isLeaf(piece)) {
    out.push({ id: piece.id, value: piece.value, x, y, w, h, depth });
    return out;
  }
  const horizontal = depth % 2 === 0;
  if (horizontal) {
    layoutTree(piece.children[0], x, y, w, h / 2, depth + 1, out);
    layoutTree(piece.children[1], x, y + h / 2, w, h / 2, depth + 1, out);
  } else {
    layoutTree(piece.children[0], x, y, w / 2, h, depth + 1, out);
    layoutTree(piece.children[1], x + w / 2, y, w / 2, h, depth + 1, out);
  }
  return out;
}

// Mendable seams: where leaf siblings of a mendable parent touch.
function layoutSeams(root) {
  const seams = [];
  const layout = layoutTree(root, 0, 0, 1, 1);
  const byId = Object.fromEntries(layout.map((r) => [r.id, r]));
  for (const parent of allMendable(root)) {
    const a = byId[parent.children[0].id];
    const b = byId[parent.children[1].id];
    if (!a || !b) continue;
    // Where do they touch?
    if (Math.abs(a.x - b.x) < 1e-6 && a.w === b.w) {
      // Stacked vertically — seam is horizontal between them
      const yMid = Math.max(a.y + a.h, b.y);
      seams.push({ id: parent.id, x: a.x, y: yMid, w: a.w, h: 0, vertical: false });
    } else {
      const xMid = Math.max(a.x + a.w, b.x);
      seams.push({ id: parent.id, x: xMid, y: a.y, w: 0, h: a.h, vertical: true });
    }
  }
  return seams;
}

/* ─── piece colors / styling ─────────────────────────────────────── */
const PIECE_STYLES = {
  1:  { fill: 'var(--p-1)',  edge: 'var(--p-1-d)'  },
  2:  { fill: 'var(--p-2)',  edge: 'var(--p-2-d)'  },
  4:  { fill: 'var(--p-4)',  edge: 'var(--p-4-d)'  },
  8:  { fill: 'var(--p-8)',  edge: 'var(--p-8-d)'  },
  16: { fill: 'var(--p-16)', edge: 'var(--p-16-d)' },
  32: { fill: 'var(--p-32)', edge: 'var(--p-32-d)' },
};
function styleFor(den) {
  return PIECE_STYLES[den] || PIECE_STYLES[32];
}

/* ─── piece visual ───────────────────────────────────────────────── */
function Piece({ rect, tool, isLastChopped, onClick, choppable }) {
  const { value, x, y, w, h, depth } = rect;
  const sty = styleFor(value.den);
  // Choose a label scale that fits the smaller side.
  const minSide = Math.min(w, h);
  const fontSize = Math.max(18, Math.round(minSide * 0.30));
  const barLen = Math.round(fontSize * 0.95);
  const cls = ['piece'];
  if (choppable) cls.push('choppable');
  if (isLastChopped) cls.push('pop-in');

  // Where would the chop happen next?  Horizontal cut if next depth is even+1=odd? No:
  // depth currently = piece depth; if chopped, the new depth is depth+1.  But the visual cut
  // direction is determined by the longer axis to feel right.
  const cutVertical = w > h; // cut along the long side
  return (
    <div
      className={cls.join(' ')}
      style={{
        position: 'absolute',
        left:   `${x * 100}%`,
        top:    `${y * 100}%`,
        width:  `${w * 100}%`,
        height: `${h * 100}%`,
        padding: 4,
        boxSizing: 'border-box',
      }}
      onClick={onClick}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: `linear-gradient(160deg, ${sty.fill} 0%, ${sty.fill} 55%, color-mix(in oklab, ${sty.fill} 80%, black) 100%)`,
          borderRadius: 10,
          border: `3px solid ${sty.edge}`,
          boxShadow:
            'inset 0 3px 0 rgba(255,255,255,0.18), inset 0 -6px 0 rgba(0,0,0,0.10), 0 3px 0 rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        {/* faint wood grain */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"
             style={{ position: 'absolute', inset: 0, opacity: 0.22, mixBlendMode: 'multiply' }}>
          <path d="M 0 22 Q 40 26 100 20"  stroke="#000" strokeWidth="0.6" fill="none"/>
          <path d="M 0 48 Q 50 44 100 50"  stroke="#000" strokeWidth="0.5" fill="none"/>
          <path d="M 0 72 Q 60 78 100 70"  stroke="#000" strokeWidth="0.6" fill="none"/>
        </svg>

        {/* fraction label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 0.95,
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 700,
            fontSize,
            color: '#fff',
            textShadow:
              `0 2px 0 ${sty.edge}, 0 -1px 0 ${sty.edge}, 2px 0 0 ${sty.edge}, -2px 0 0 ${sty.edge}, 0 4px 6px rgba(0,0,0,0.25)`,
            userSelect: 'none',
          }}
        >
          <div>{value.num}</div>
          <div style={{
            width: barLen,
            height: Math.max(3, fontSize * 0.10),
            background: '#fff',
            borderRadius: 99,
            margin: `${fontSize * 0.10}px 0`,
            boxShadow: `0 2px 0 ${sty.edge}`,
          }} />
          <div>{value.den}</div>
        </div>

        {/* chop preview line when chop tool is hovered/armed and this piece is choppable */}
        {choppable && tool === 'chop' && (
          <div
            className="chop-hint"
            style={{
              position: 'absolute',
              ...(cutVertical
                ? { top: 8, bottom: 8, left: '50%', width: 0,
                    borderLeft: '3px dashed rgba(255,255,255,0.7)',
                    transform: 'translateX(-1.5px)' }
                : { left: 8, right: 8, top: '50%', height: 0,
                    borderTop: '3px dashed rgba(255,255,255,0.7)',
                    transform: 'translateY(-1.5px)' }),
              opacity: 0,
              transition: 'opacity 120ms ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── chop FX overlay ─────────────────────────────────────────────── */
function ChopFx({ x, y, w, h, vertical, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 520);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'absolute',
        left:   `${x * 100}%`,
        top:    `${y * 100}%`,
        width:  `${w * 100}%`,
        height: `${h * 100}%`,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <div style={{
        position: 'absolute',
        ...(vertical
          ? { top: 0, bottom: 0, left: '50%', width: 6,
              transform: 'translateX(-3px)', background: '#fff',
              boxShadow: '0 0 18px 6px rgba(255,255,255,0.85)' }
          : { left: 0, right: 0, top: '50%', height: 6,
              transform: 'translateY(-3px)', background: '#fff',
              boxShadow: '0 0 18px 6px rgba(255,255,255,0.85)' }),
        borderRadius: 99,
        animation: 'chopflash 520ms ease-out forwards',
      }} />
      <style>{`@keyframes chopflash {
        0%   { opacity: 0; transform: ${vertical ? 'translateX(-3px) scaleY(0.6)' : 'translateY(-3px) scaleX(0.6)'}; }
        25%  { opacity: 1; transform: ${vertical ? 'translateX(-3px) scaleY(1)'   : 'translateY(-3px) scaleX(1)'}; }
        100% { opacity: 0; transform: ${vertical ? 'translateX(-3px) scaleY(1.1)' : 'translateY(-3px) scaleX(1.1)'}; }
      }`}</style>
    </div>
  );
}

/* ─── board view ─────────────────────────────────────────────────── */
function BoardView({ board, tool, onPieceTap, onSeamTap, chopFx }) {
  const layout = useMemo(() => layoutTree(board, 0, 0, 1, 1), [board]);
  const seams  = useMemo(() => tool === 'bandaid' ? layoutSeams(board) : [], [board, tool]);

  return (
    <div className="board-wood-frame" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: 26,
      padding: 22,
      background:
        'repeating-linear-gradient(125deg, #8a5224 0px, #8a5224 8px, #6b3f1f 9px, #8a5224 16px),' +
        'linear-gradient(180deg, #b07642 0%, #7a4a26 100%)',
      boxShadow:
        '0 24px 50px rgba(0,0,0,0.45), 0 0 0 4px #4d2c14, inset 0 0 0 4px #aa6e3c, inset 0 6px 0 rgba(255,255,255,0.12), inset 0 -10px 0 rgba(0,0,0,0.25)',
    }}>
      {/* nail studs */}
      {[[8,8],[8,'calc(100% - 22px)'],['calc(100% - 22px)',8],['calc(100% - 22px)','calc(100% - 22px)']].map(([l,t],i)=>(
        <div key={i} style={{
          position: 'absolute', left: l, top: t, width: 14, height: 14, borderRadius: 99,
          background: 'radial-gradient(circle at 35% 30%, #d8c08a 0%, #8a6628 60%, #3a2811 100%)',
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.2)',
          zIndex: 4,
        }}/>
      ))}

      {/* inner play area */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        background: '#3a2516',
        overflow: 'hidden',
        boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.55)',
      }}
      onMouseOver={(e)=>{
        const hint = e.target.closest('.piece')?.querySelector('.chop-hint');
        if (hint) hint.style.opacity = 1;
      }}
      onMouseOut={(e)=>{
        const hint = e.target.closest('.piece')?.querySelector('.chop-hint');
        if (hint) hint.style.opacity = 0;
      }}>
        {layout.map((rect) => {
          const choppable = tool === 'chop'; // every leaf is choppable
          return (
            <Piece
              key={rect.id}
              rect={rect}
              tool={tool}
              choppable={choppable}
              isLastChopped={false}
              onClick={() => onPieceTap(rect.id)}
            />
          );
        })}

        {/* mend seams */}
        {seams.map((s, i) => (
          <button
            key={s.id + i}
            onClick={() => onSeamTap(s.id)}
            style={{
              position: 'absolute',
              left:   `calc(${s.x * 100}% - ${s.vertical ? 22 : 0}px)`,
              top:    `calc(${s.y * 100}% - ${s.vertical ? 0 : 22}px)`,
              width:  s.vertical ? 44 : `${s.w * 100}%`,
              height: s.vertical ? `${s.h * 100}%` : 44,
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              zIndex: 3,
            }}
            aria-label={`Mend ${s.id}`}
          >
            <div className="pulse-glow" style={{
              position: 'absolute',
              ...(s.vertical
                ? { top: 12, bottom: 12, left: '50%', width: 14, transform: 'translateX(-7px)' }
                : { left: 12, right: 12, top: '50%', height: 14, transform: 'translateY(-7px)' }),
              borderRadius: 99,
              background: 'linear-gradient(90deg, #ffdf80, #fff2b0, #ffdf80)',
              boxShadow: '0 0 22px 8px rgba(255, 220, 120, 0.7)',
            }} />
            {/* tiny band-aid icon at center of seam */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 36, height: 36, borderRadius: 99, background: '#fff',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 4px 0 rgba(0,0,0,0.18), 0 0 0 3px #1f1712',
            }}>
              <IconBandaid size={26} />
            </div>
          </button>
        ))}

        {/* chop flash overlay */}
        {chopFx && (
          <ChopFx
            key={chopFx.key}
            x={chopFx.x} y={chopFx.y} w={chopFx.w} h={chopFx.h}
            vertical={chopFx.vertical}
            onDone={chopFx.onDone}
          />
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  BoardView,
  createWhole, chopBoard, mendBoard, findP, layoutTree, allLeaves, allMendable, canMendPiece,
  F, fmt, isLeaf,
});
