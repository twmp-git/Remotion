import React from "react";
import { random, useCurrentFrame } from "remotion";
import { MAWA } from "./theme";

/**
 * Original illustration parts in the style of the "Mawa" cover:
 * flat shapes, paper grain, charcoal / burnt-orange / paper palette.
 * All coordinates are in a 1080×1920 SVG canvas unless noted.
 */

export const W = 1080;
export const H = 1920;

/** Half sun with straight cover-style rays. `rise` 0–1 slides it up from the horizon. */
export const Sun: React.FC<{
  cx: number;
  horizon: number;
  r: number;
  rays?: number;
  rayLen?: number;
  rayGrow?: number;
  spin?: number;
  color?: string;
}> = ({ cx, horizon, r, rays = 21, rayLen = 1.05, rayGrow = 1, spin = 0, color = MAWA.orange }) => (
  <g>
    {Array.from({ length: rays }).map((_, i) => {
      const a = Math.PI + (i / (rays - 1)) * Math.PI + spin;
      const inner = r * 1.22;
      const outer = r * (1.22 + rayLen * rayGrow);
      const w0 = r * 0.035;
      const w1 = r * 0.075;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      const p = (d: number, w: number, s: number) =>
        `${cx + Math.cos(a) * d + nx * w * s} ${horizon + Math.sin(a) * d + ny * w * s}`;
      return <path key={i} d={`M${p(inner, w0, -1)} L${p(outer, w1, -1)} L${p(outer, w1, 1)} L${p(inner, w0, 1)} Z`} fill={color} />;
    })}
    <path d={`M${cx - r} ${horizon} A ${r} ${r} 0 0 1 ${cx + r} ${horizon} Z`} fill={color} />
  </g>
);

/** Charcoal ground with a gently curved horizon. */
export const Ground: React.FC<{ horizon: number; bulge?: number; color?: string }> = ({
  horizon,
  bulge = 70,
  color = MAWA.charcoal,
}) => <path d={`M-200 ${horizon + bulge} Q${W / 2} ${horizon - bulge} ${W + 200} ${horizon + bulge} L${W + 200} ${H + 400} L-200 ${H + 400} Z`} fill={color} />;

/** Points along the winding road, from the horizon (t=0) to the viewer (t=1). */
export const roadPoint = (t: number, horizon: number) => {
  const x = W / 2 + Math.sin(t * Math.PI * 3.2 + 0.6) * (60 + t * 260) * (1 - t * 0.35);
  const y = horizon + (H + 200 - horizon) * t ** 1.35;
  const w = 8 + t ** 1.5 * 420;
  return { x, y, w };
};

/** The winding orange road. `reveal` 0–1 draws it from the horizon toward the viewer. */
export const Road: React.FC<{ horizon: number; reveal?: number; color?: string }> = ({
  horizon,
  reveal = 1,
  color = MAWA.orange,
}) => {
  const N = 70;
  const pts = Array.from({ length: N + 1 }, (_, i) => roadPoint((i / N) * reveal, horizon));
  const left = pts.map((p) => `${p.x - p.w / 2} ${p.y}`);
  const right = pts.map((p) => `${p.x + p.w / 2} ${p.y}`).reverse();
  return <path d={`M${left.join(" L")} L${right.join(" L")} Z`} fill={color} />;
};

/** Simple original walking figure (light grey silhouette), facing away. `phase` drives the stride. */
export const Walker: React.FC<{ x: number; y: number; h: number; phase: number; opacity?: number; color?: string }> = ({
  x,
  y,
  h,
  phase,
  opacity = 1,
  color = MAWA.grey,
}) => {
  const s = h / 100;
  const swing = Math.sin(phase) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-6} y={-62} width={12} height={34} rx={6} fill={color} transform={`rotate(${swing} 0 -40)`} />
      <rect x={-6} y={-62} width={12} height={34} rx={6} fill={color} transform={`rotate(${-swing} 0 -40)`} opacity={0.8} />
      <rect x={-12} y={-96} width={24} height={44} rx={10} fill={color} />
      <rect x={-5} y={-92} width={10} height={36} rx={5} fill={color} transform={`rotate(${-swing * 0.8} 0 -90)`} />
      <circle cx={0} cy={-108} r={11} fill={color} />
    </g>
  );
};

/** A generic paper slip (no brands): header bar, rows of lines and ticks. */
export const Slip: React.FC<{ x: number; y: number; w: number; rot: number; seed: string; scorch?: number }> = ({
  x,
  y,
  w,
  rot,
  seed,
  scorch = 0,
}) => {
  const h = w * 1.35;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#E9E6DE" stroke={MAWA.ink} strokeWidth={w * 0.012} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.13} fill={MAWA.charcoal} />
      <text x={-w * 0.4} y={-h / 2 + h * 0.095} fontFamily="Anton, Impact, sans-serif" fontSize={w * 0.11} fill="#E9E6DE" letterSpacing={w * 0.01}>
        SLIP
      </text>
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          <rect x={-w * 0.4} y={-h / 2 + h * (0.2 + i * 0.1)} width={w * (0.35 + random(`${seed}-${i}`) * 0.35)} height={h * 0.025} fill="#8C8A84" />
          <circle cx={w * 0.33} cy={-h / 2 + h * (0.215 + i * 0.1)} r={w * 0.025} fill={random(`${seed}-c${i}`) > 0.5 ? MAWA.charcoal : "#8C8A84"} />
        </g>
      ))}
      {scorch > 0 ? (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={MAWA.ember} opacity={scorch * 0.55} />
      ) : null}
    </g>
  );
};

/** Angular cover-style flame that flickers. `h` is the flame height, base centred at (x, y). */
export const Flame: React.FC<{ x: number; y: number; w: number; h: number; seed: string; color?: string }> = ({
  x,
  y,
  w,
  h,
  seed,
  color = MAWA.orange,
}) => {
  const frame = useCurrentFrame();
  const tick = Math.floor(frame / 3);
  const j = (k: string, amt: number) => (random(`${seed}-${k}-${tick}`) - 0.5) * amt;
  const pts = [
    [-0.5, 0],
    [-0.42, -0.35 + j("a", 0.08)],
    [-0.3, -0.28],
    [-0.22, -0.78 + j("b", 0.12)],
    [-0.08, -0.45],
    [0.02 + j("c", 0.06), -1 + j("d", 0.1)],
    [0.14, -0.5],
    [0.28, -0.7 + j("e", 0.12)],
    [0.34, -0.3],
    [0.46, -0.42 + j("f", 0.08)],
    [0.5, 0],
  ];
  return (
    <path
      d={`M${pts.map(([px, py]) => `${x + px * w} ${y + py * h}`).join(" L")} Z`}
      fill={color}
      stroke={MAWA.ink}
      strokeWidth={Math.max(2, w * 0.012)}
      strokeLinejoin="miter"
    />
  );
};

/** Original paper-plane glyph pointing right, centred at (0,0). */
export const PaperPlane: React.FC<{ size: number; color?: string }> = ({ size, color = MAWA.paperLight }) => {
  const s = size / 100;
  return (
    <g transform={`scale(${s})`}>
      <path d="M-50 -10 L50 0 L-50 10 L-30 0 Z" fill={color} stroke={MAWA.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-30 0 L50 0 L-38 26 Z" fill={MAWA.grey} stroke={MAWA.ink} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** Expanding concentric ripples (water). `t` 0–1 drives the spread. */
export const Ripples: React.FC<{ cx: number; cy: number; t: number; maxR: number; rings?: number; color?: string; squash?: number }> = ({
  cx,
  cy,
  t,
  maxR,
  rings = 5,
  color = MAWA.orange,
  squash = 0.32,
}) => (
  <g>
    {Array.from({ length: rings }).map((_, i) => {
      const local = t * 1.6 - i * 0.14;
      if (local <= 0) return null;
      const r = Math.min(1, local) * maxR;
      const fade = Math.max(0, 1 - local * 0.85);
      return <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * squash} fill="none" stroke={color} strokeWidth={10 + (1 - fade) * 4} opacity={fade} />;
    })}
  </g>
);

/** A full-frame paper grain to sit over everything. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.28 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 4;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity }}>
      <filter id={`mawa-grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed + 3} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 0" />
      </filter>
      <rect width={W} height={H} filter={`url(#mawa-grain-${seed})`} />
    </svg>
  );
};

/** Jagged, torn-edge display word in the style of the cover title (original lettering treatment). */
export const JaggedWord: React.FC<{
  text: string;
  x: number;
  y: number;
  size: number;
  fill?: string;
  stroke?: string;
  seed: string;
}> = ({ text, x, y, size, fill = MAWA.grey, stroke = MAWA.ink, seed }) => {
  const frame = useCurrentFrame();
  const id = `jag-${seed}`;
  const tick = Math.floor(frame / 4) % 3;
  return (
    <g>
      <defs>
        <filter id={`${id}-${tick}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves={2} seed={tick + 11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={size * 0.06} />
        </filter>
      </defs>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize={size}
        fill={fill}
        stroke={stroke}
        strokeWidth={size * 0.035}
        paintOrder="stroke fill"
        letterSpacing={size * 0.04}
        filter={`url(#${id}-${tick})`}
      >
        {text}
      </text>
    </g>
  );
};
