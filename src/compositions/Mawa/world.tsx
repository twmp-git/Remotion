import React from "react";
import { random } from "remotion";
import { MAWA } from "./theme";

/**
 * Richer 2D building blocks for the "Mawa" verse: soft light, layered depth,
 * continuous motion. Everything is a pure function of the time `t` (seconds)
 * passed in, so motion is smooth (no stepped updates).
 * Canvas: 1080×1920.
 */
export const W = 1080;
export const H = 1920;

/** Smooth pseudo-noise in [-1, 1] from a few incommensurate sines. */
export const wobble = (t: number, seed: number) =>
  (Math.sin(t * 1.31 + seed * 1.7) * 0.5 + Math.sin(t * 2.17 + seed * 3.1) * 0.3 + Math.sin(t * 3.73 + seed * 5.3) * 0.2);

// ---------------------------------------------------------------------------
// Sky & sun
// ---------------------------------------------------------------------------

export const Sky: React.FC<{ id: string; top: string; bottom: string; glow?: string; glowY?: number; glowAmt?: number }> = ({
  id,
  top,
  bottom,
  glow = "#F3B275",
  glowY = 0.5,
  glowAmt = 0.55,
}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <radialGradient id={`${id}-skyglow`} cx="0.5" cy={glowY} r="0.6">
        <stop offset="0" stopColor={glow} stopOpacity={glowAmt} />
        <stop offset="1" stopColor={glow} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#${id}-sky)`} />
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#${id}-skyglow)`} />
  </g>
);

/** Sun with tapered rays, a warm gradient disc and a soft bloom halo. */
export const GlowSun: React.FC<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  t: number;
  rays?: number;
  rayGrow?: number;
  spin?: number;
  glow?: number;
  dim?: number;
}> = ({ id, cx, cy, r, t, rays = 26, rayGrow = 1, spin = 0, glow = 1, dim = 0 }) => {
  const disc = dim > 0 ? `color-mix(in srgb, ${MAWA.paperLight} ${Math.round(dim * 100)}%, ${MAWA.orange})` : MAWA.orange;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#F7B46E" stopOpacity={0.6 * glow * (1 - dim)} />
          <stop offset="0.45" stopColor="#F2A15A" stopOpacity={0.22 * glow * (1 - dim)} />
          <stop offset="1" stopColor="#F2A15A" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-disc`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor={dim > 0 ? disc : "#F4A55E"} />
          <stop offset="0.65" stopColor={disc} />
          <stop offset="1" stopColor={dim > 0 ? disc : "#C4621C"} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 3.4} fill={`url(#${id}-halo)`} />
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 + spin;
        const breathe = 1 + 0.05 * Math.sin(t * 1.6 + i * 0.9);
        const inner = r * 1.2;
        const outer = r * (1.2 + 0.95 * rayGrow * breathe);
        const nx = -Math.sin(a);
        const ny = Math.cos(a);
        const p = (d: number, w: number, s: number) => `${cx + Math.cos(a) * d + nx * w * s} ${cy + Math.sin(a) * d + ny * w * s}`;
        const w0 = r * 0.04;
        const w1 = r * 0.085;
        return (
          <path
            key={i}
            d={`M${p(inner, w0, -1)} L${p(outer, w1, -1)} L${p(outer, w1, 1)} L${p(inner, w0, 1)} Z`}
            fill={disc}
            opacity={0.95 - dim * 0.5}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-disc)`} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Landscape
// ---------------------------------------------------------------------------

/** A smooth rolling hill silhouette. `shift` moves it sideways (parallax). */
export const Hill: React.FC<{ id: string; baseY: number; amp: number; freq: number; phase: number; shift?: number; fill: string; rim?: string }> = ({
  id,
  baseY,
  amp,
  freq,
  phase,
  shift = 0,
  fill,
  rim,
}) => {
  const pts: string[] = [];
  for (let x = -300; x <= W + 300; x += 30) {
    const u = (x + shift) / W;
    const y = baseY - amp * (0.6 * Math.sin(u * freq * Math.PI * 2 + phase) + 0.4 * Math.sin(u * freq * 3.1 + phase * 1.7));
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  const d = `M${pts.join(" L")} L${W + 300} ${H + 600} L-300 ${H + 600} Z`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={rim ?? fill} />
          <stop offset="0.12" stopColor={fill} />
          <stop offset="1" stopColor={fill} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id}-hill)`} />
    </g>
  );
};

/** Horizontal haze band (atmospheric depth). */
export const Haze: React.FC<{ id: string; y: number; h: number; color?: string; amt?: number }> = ({ id, y, h, color = MAWA.paperLight, amt = 0.35 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={0} />
        <stop offset="0.5" stopColor={color} stopOpacity={amt} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={-400} y={y - h / 2} width={W + 800} height={h} fill={`url(#${id}-haze)`} />
  </g>
);

/** Centre-line of the winding road on the ground, from horizon (u=0) to the viewer (u=1). */
export const roadAt = (u: number, horizon: number, sway = 0) => {
  const x = W / 2 + Math.sin(u * Math.PI * 2.6 + 0.9 + sway) * (40 + u * 300) * (1 - u * 0.25);
  const y = horizon + (H + 260 - horizon) * u ** 1.55;
  const w = 6 + u ** 1.6 * 520;
  return { x, y, w };
};

/** Sunlit road: gradient from bright near the sun to deep orange near the viewer, with a soft centre sheen. */
export const SunRoad: React.FC<{ id: string; horizon: number; reveal?: number; sway?: number; color?: string }> = ({
  id,
  horizon,
  reveal = 1,
  sway = 0,
  color,
}) => {
  const N = 90;
  const pts = Array.from({ length: N + 1 }, (_, i) => roadAt((i / N) * reveal, horizon, sway));
  const left = pts.map((p) => `${(p.x - p.w / 2).toFixed(1)} ${p.y.toFixed(1)}`);
  const right = pts.map((p) => `${(p.x + p.w / 2).toFixed(1)} ${p.y.toFixed(1)}`).reverse();
  const sheen = pts.map((p) => `${(p.x - p.w * 0.08).toFixed(1)} ${p.y.toFixed(1)}`);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-road`} gradientUnits="userSpaceOnUse" x1={0} y1={horizon} x2={0} y2={H + 260}>
          <stop offset="0" stopColor={color ?? "#F0A057"} />
          <stop offset="1" stopColor={color ?? MAWA.orangeDeep} />
        </linearGradient>
      </defs>
      <path d={`M${left.join(" L")} L${right.join(" L")} Z`} fill={`url(#${id}-road)`} />
      <path d={`M${sheen.join(" L")}`} stroke="#FFD9A8" strokeOpacity={0.35} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** A figure seen from behind with a long shadow cast toward the viewer. */
export const Figure: React.FC<{ x: number; y: number; h: number; t: number; opacity?: number; color?: string; shadow?: number }> = ({
  x,
  y,
  h,
  t,
  opacity = 1,
  color = MAWA.grey,
  shadow = 1,
}) => {
  const s = h / 100;
  const swing = Math.sin(t * 7) * 12;
  return (
    <g opacity={opacity}>
      {/* long soft shadow toward camera */}
      <path d={`M${x - 8 * s} ${y} L${x + 8 * s} ${y} L${x + 60 * s} ${y + 260 * s * shadow} L${x + 20 * s} ${y + 270 * s * shadow} Z`} fill={MAWA.ink} opacity={0.35} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-6} y={-60} width={12} height={34} rx={6} fill={color} transform={`rotate(${swing} 0 -42)`} />
        <rect x={-6} y={-60} width={12} height={34} rx={6} fill={color} transform={`rotate(${-swing} 0 -42)`} opacity={0.85} />
        <rect x={-13} y={-98} width={26} height={46} rx={11} fill={color} />
        <circle cx={0} cy={-110} r={11.5} fill={color} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Atmosphere
// ---------------------------------------------------------------------------

/** Drifting motes at three depths. Smooth: positions are continuous in t. */
export const Motes: React.FC<{ id: string; t: number; count?: number; color?: string; rise?: number; area?: [number, number, number, number] }> = ({
  id,
  t,
  count = 46,
  color = "#FBE3C4",
  rise = 18,
  area = [0, 0, W, H],
}) => {
  const [ax, ay, aw, ah] = area;
  return (
    <g>
      <defs>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const depth = random(`${id}-d${i}`);
        const speed = (0.4 + depth) * rise;
        const x = ax + ((random(`${id}-x${i}`) * aw + wobble(t * 0.6, i) * 40 * depth) % aw);
        const y = ay + ((((random(`${id}-y${i}`) * ah - t * speed) % ah) + ah) % ah);
        const r = 1.5 + depth * 5;
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (1 + depth * 2) + i));
        return (
          <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={tw * (0.35 + depth * 0.5)} filter={depth > 0.6 ? `url(#${id}-soft)` : undefined} />
        );
      })}
    </g>
  );
};

/** Soft vignette to focus the frame. */
export const Vignette: React.FC<{ id: string; amt?: number; color?: string }> = ({ id, amt = 0.55, color = MAWA.ink }) => (
  <g>
    <defs>
      <radialGradient id={`${id}-vig`} cx="0.5" cy="0.48" r="0.75">
        <stop offset="0.55" stopColor={color} stopOpacity={0} />
        <stop offset="1" stopColor={color} stopOpacity={amt} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#${id}-vig)`} />
  </g>
);

// ---------------------------------------------------------------------------
// Paper
// ---------------------------------------------------------------------------

/** A paper sheet lit from above: soft drop shadow, lit top edge, faint printed rows. */
export const Sheet: React.FC<{ x: number; y: number; w: number; rot: number; tilt?: number; lit?: number; seed: string; tone?: string }> = ({
  x,
  y,
  w,
  rot,
  tilt = 1,
  lit = 1,
  seed,
  tone = "#E8E4DA",
}) => {
  const h = w * 1.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${tilt})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 18} width={w} height={h} fill={MAWA.ink} opacity={0.28} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={tone} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.12} fill={MAWA.charcoal} opacity={0.85} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={-w * 0.38} y={-h / 2 + h * (0.22 + i * 0.11)} width={w * (0.3 + random(`${seed}-${i}`) * 0.4)} height={h * 0.022} fill="#9A968E" opacity={0.8} />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={4} fill="white" opacity={0.6 * lit} />
    </g>
  );
};
