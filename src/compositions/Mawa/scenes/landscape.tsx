import React from "react";
import { interpolate, random } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { Figure, GlowSun, H, Haze, Hill, Sky, SunRoad, W, roadAt, wobble } from "../world";

export type Mood = "day" | "golden" | "dusk";

const MOODS: Record<Mood, {
  skyTop: string; skyBottom: string; glow: string; glowAmt: number;
  far: [string, string]; mid: [string, string]; ground: string; haze: string; hazeAmt: number; road?: string;
}> = {
  day: { skyTop: "#C9C4B7", skyBottom: MAWA.paperLight, glow: "#F3B275", glowAmt: 0.6, far: ["#5A5650", "#7A746B"], mid: ["#3B3936", "#57524B"], ground: MAWA.charcoal, haze: MAWA.paperLight, hazeAmt: 0.35 },
  golden: { skyTop: "#C2AE93", skyBottom: "#EFD6B2", glow: "#F2A35C", glowAmt: 0.8, far: ["#6A5A4B", "#93795F"], mid: ["#3E3530", "#5E4B3E"], ground: "#2B2624", haze: "#F2D1A6", hazeAmt: 0.42 },
  dusk: { skyTop: "#241D1B", skyBottom: "#A65A31", glow: "#F08A3E", glowAmt: 0.75, far: ["#3F2D28", "#6A4535"], mid: ["#231C1A", "#3B2A23"], ground: "#1B1817", haze: "#C2683A", hazeAmt: 0.32, road: "#B4602A" },
};

/** Camera: world point (fx, fy) is placed at screen point (ax, ay), scaled by zoom; depth adds parallax. */
export type Cam = { zoom: number; fx: number; fy: number; ax?: number; ay?: number; lift?: number; rot?: number; t: number };

export const camTransform = (c: Cam, depth: number) => {
  const z = 1 + (c.zoom - 1) * (0.75 + depth * 0.5);
  const drift = wobble(c.t * 0.35, depth * 3) * 14 * depth;
  const ax = (c.ax ?? c.fx) + drift;
  const ay = (c.ay ?? c.fy) + (c.lift ?? 0) * (0.6 + depth * 0.4);
  return `translate(${ax} ${ay}) rotate(${c.rot ?? 0}) scale(${z}) translate(${-c.fx} ${-c.fy})`;
};

/**
 * The cover's world: sky, glowing sun, two hill layers with haze, charcoal ground and the
 * sunlit winding road. `children` render on the ground layer (figures, footprints…).
 */
export const Landscape: React.FC<{
  id: string;
  t: number;
  cam: Cam;
  mood: Mood;
  horizon?: number;
  sunY?: number;
  sunR?: number;
  sunDim?: number;
  sunGlow?: number;
  rayGrow?: number;
  land?: number;
  children?: React.ReactNode;
  sky?: React.ReactNode;
}> = ({ id, t, cam, mood, horizon = 1060, sunY, sunR = 230, sunDim = 0, sunGlow = 1, rayGrow = 1, land = 1, children, sky }) => {
  const m = MOODS[mood];
  const sy = sunY ?? horizon - 40;
  return (
    <g>
      <g transform={camTransform(cam, 0)}>
        <g transform="translate(0 -1600) scale(1 2.2)">
          <Sky id={`${id}-sky`} top={m.skyTop} bottom={m.skyBottom} glow={m.glow} glowY={(sy + 1600) / 2.2 / H} glowAmt={m.glowAmt} />
        </g>
        {sky}
        <GlowSun id={`${id}-sun`} cx={W / 2} cy={sy} r={sunR} t={t} rayGrow={rayGrow} spin={t * 0.03} dim={sunDim} glow={sunGlow} />
      </g>
      <g transform={camTransform(cam, 0.2)} opacity={land}>
        <Hill id={`${id}-far`} baseY={horizon - 18} amp={34} freq={1.3} phase={0.4} fill={m.far[0]} rim={m.far[1]} />
        <Haze id={`${id}-haze`} y={horizon - 10} h={170} color={m.haze} amt={m.hazeAmt} />
      </g>
      <g transform={camTransform(cam, 0.45)} opacity={land}>
        <Hill id={`${id}-mid`} baseY={horizon + 30} amp={40} freq={0.9} phase={2.2} fill={m.mid[0]} rim={m.mid[1]} />
      </g>
      <g transform={camTransform(cam, 0.75)} opacity={land}>
        <path d={`M-600 ${horizon + 90} Q${W / 2} ${horizon + 20} ${W + 600} ${horizon + 90} L${W + 600} ${H + 1200} L-600 ${H + 1200} Z`} fill={m.ground} />
        <SunRoad id={`${id}-road`} horizon={horizon + 52} color={m.road} />
        {children}
      </g>
    </g>
  );
};

/** Torn-paper scars across the sky that draw on, then get stitched. */
export const Scars: React.FC<{ id: string; t: number; start: number; stitch: number; opacity?: number }> = ({ id, t, start, stitch, opacity = 0.8 }) => {
  const tears = [
    { x0: -40, y0: 260, x1: 700, y1: 520 },
    { x0: 380, y0: 140, x1: 1120, y1: 380 },
    { x0: -60, y0: 640, x1: 520, y1: 780 },
  ];
  return (
    <g opacity={opacity}>
      {tears.map((tr, k) => {
        const N = 22;
        const pts = Array.from({ length: N + 1 }, (_, i) => {
          const u = i / N;
          const jx = (random(`${id}-${k}-x${i}`) - 0.5) * 26;
          const jy = (random(`${id}-${k}-y${i}`) - 0.5) * 26;
          return { x: tr.x0 + (tr.x1 - tr.x0) * u + jx, y: tr.y0 + (tr.y1 - tr.y0) * u + jy };
        });
        const d = `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}`;
        const len = Math.hypot(tr.x1 - tr.x0, tr.y1 - tr.y0) * 1.25;
        const draw = interpolate(t, [start + k * 0.12, start + k * 0.12 + 0.55], [0, 1], { ...CLAMP, easing: (x) => 1 - (1 - x) ** 3 });
        const nx = -(tr.y1 - tr.y0) / Math.hypot(tr.x1 - tr.x0, tr.y1 - tr.y0);
        const ny = (tr.x1 - tr.x0) / Math.hypot(tr.x1 - tr.x0, tr.y1 - tr.y0);
        return (
          <g key={k}>
            <path d={d} stroke={MAWA.paperLight} strokeWidth={14} fill="none" strokeDasharray={`${len * draw} ${len}`} strokeLinejoin="round" opacity={0.7} />
            <path d={d} stroke={MAWA.ink} strokeWidth={5} fill="none" strokeDasharray={`${len * draw} ${len}`} strokeLinejoin="round" />
            {pts.filter((_, i) => i % 2 === 1).map((p, i) => {
              const s = interpolate(t, [stitch + k * 0.1 + i * 0.03, stitch + k * 0.1 + i * 0.03 + 0.2], [0, 1], CLAMP);
              return (
                <path
                  key={i}
                  d={`M${p.x - nx * 16 * s} ${p.y - ny * 16 * s} L${p.x + nx * 16 * s} ${p.y + ny * 16 * s}`}
                  stroke={MAWA.ink}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={s}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/** A figure that dissolves into embers that drift to a target (the sun). */
export const DissolvingFigure: React.FC<{
  id: string; t: number; x: number; y: number; h: number; dissolveAt: number; tx: number; ty: number; walkT: number;
}> = ({ id, t, x, y, h, dissolveAt, tx, ty, walkT }) => {
  const fade = interpolate(t, [dissolveAt, dissolveAt + 0.5], [1, 0], CLAMP);
  return (
    <g>
      {fade > 0 ? <Figure x={x} y={y} h={h} t={walkT} opacity={fade} /> : null}
      {Array.from({ length: 16 }).map((_, j) => {
        const p = interpolate(t, [dissolveAt + j * 0.025, dissolveAt + 1.7 + j * 0.03], [0, 1], { ...CLAMP, easing: (u) => u * u * (3 - 2 * u) });
        if (p <= 0 || p >= 1) return null;
        const sx = x + (random(`${id}-ex${j}`) - 0.5) * h * 0.35;
        const sy = y - random(`${id}-ey${j}`) * h * 1.1;
        const cx = (sx + tx) / 2 + (random(`${id}-ec${j}`) - 0.5) * 260;
        const cy = Math.min(sy, ty) - 120;
        const px = (1 - p) ** 2 * sx + 2 * (1 - p) * p * cx + p * p * tx;
        const py = (1 - p) ** 2 * sy + 2 * (1 - p) * p * cy + p * p * ty;
        return <circle key={j} cx={px} cy={py} r={(2 + random(`${id}-er${j}`) * 5) * (1 - p * 0.5)} fill={j % 3 ? "#F7B46E" : MAWA.orange} opacity={(1 - p) * 0.95} />;
      })}
    </g>
  );
};

/** Small original paper plane, nose along +x. */
export const Plane: React.FC<{ x: number; y: number; angle: number; size: number; opacity?: number }> = ({ x, y, angle, size, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size / 100})`} opacity={opacity}>
    <path d="M-50 -12 L52 0 L-50 12 L-30 0 Z" fill={MAWA.paperLight} stroke={MAWA.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-30 0 L52 0 L-40 26 Z" fill={MAWA.grey} stroke={MAWA.ink} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Quadratic Bézier helpers for flight paths. */
export const qb = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, s: number) => ({
  x: (1 - s) ** 2 * p0.x + 2 * (1 - s) * s * p1.x + s * s * p2.x,
  y: (1 - s) ** 2 * p0.y + 2 * (1 - s) * s * p1.y + s * s * p2.y,
});
export const qbAngle = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, s: number) => {
  const dx = 2 * (1 - s) * (p1.x - p0.x) + 2 * s * (p2.x - p1.x);
  const dy = 2 * (1 - s) * (p1.y - p0.y) + 2 * s * (p2.y - p1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export { roadAt };
