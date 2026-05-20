/* A celebration burst — multiple "fireworks" mounted while a step's success
 * is celebrated. Each burst sends particles outward from a centre, then they
 * fall and fade. Layouts are generated once at module load (impure randomness
 * belongs outside render). */

import type { CSSProperties } from 'react';
import { CONFETTI_PALETTE } from '@/constants/theme';

const BURST_COUNT = 5;
const PARTICLES_PER_BURST = 14;

interface Particle {
  dx: number; // offset (px) the particle travels at its peak
  dy: number;
  color: string;
}

interface Burst {
  cx: number; // centre, % of the layer
  cy: number;
  delay: number; // seconds — staggers the bursts
  particles: Particle[];
}

const BURSTS: Burst[] = Array.from({ length: BURST_COUNT }, (_, i) => {
  const particles: Particle[] = Array.from({ length: PARTICLES_PER_BURST }, (_, j) => {
    const angle = (j / PARTICLES_PER_BURST) * Math.PI * 2 + Math.random() * 0.25;
    const dist = 110 + Math.random() * 90;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: CONFETTI_PALETTE[(i * 3 + j) % CONFETTI_PALETTE.length],
    };
  });
  return {
    cx: 18 + Math.random() * 64,
    cy: 22 + Math.random() * 28,
    delay: i * 0.22 + Math.random() * 0.08,
    particles,
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
      {BURSTS.map((burst, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${burst.cx}%`,
            top: `${burst.cy}%`,
          }}
        >
          {burst.particles.map((p, j) => (
            <div
              key={j}
              className="firework-bit"
              style={
                {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  background: p.color,
                  animationDelay: `${burst.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
