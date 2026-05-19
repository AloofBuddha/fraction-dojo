/* A one-shot confetti burst — mounted while a step's success is celebrated. */

const COLORS = ['#e85f4e', '#f3b13a', '#7ab560', '#5ba5d9', '#e87fb4', '#fdf6e2'];

// Bit layouts are generated once at module load (impure randomness belongs
// out of render) and reused for every burst.
const BITS = Array.from({ length: 32 }, (_, i) => {
  const size = 8 + Math.random() * 9;
  return {
    color: COLORS[i % COLORS.length],
    left: Math.random() * 100,
    width: size,
    height: size * 0.55,
    delay: Math.random() * 0.4,
    duration: 1.3 + Math.random() * 0.9,
  };
});

export function Confetti() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      {BITS.map((bit, i) => (
        <div
          key={i}
          className="confetti-bit"
          style={{
            left: `${bit.left}%`,
            width: bit.width,
            height: bit.height,
            background: bit.color,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
