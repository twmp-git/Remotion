import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { H, Sheet, Vignette, W, wobble } from "../world";
import { Plane } from "./landscape";

/** Cover-style angular flame tongue with smooth, continuous flicker. Base centre at (x, y). */
export const FlameTongue: React.FC<{ x: number; y: number; w: number; h: number; t: number; seed: number; lean?: number }> = ({
  x,
  y,
  w,
  h,
  t,
  seed,
  lean = 0,
}) => {
  if (h < 2) return null;
  const wb = (k: number) => wobble(t * 3.2 + seed * 1.37, seed * 7 + k);
  const sway = (lean + 0.14 * wobble(t * 1.4, seed + 9)) * h;
  const shape = (s: number) => {
    const pts: [number, number][] = [
      [-0.5, 0],
      [-0.46, -0.28 + 0.05 * wb(1)],
      [-0.3 + 0.03 * wb(2), -0.36],
      [-0.26, -0.7 + 0.09 * wb(3)],
      [-0.1, -0.5],
      [0.02 + 0.06 * wb(4), -1 + 0.08 * wb(5)],
      [0.14, -0.55],
      [0.3, -0.78 + 0.1 * wb(6)],
      [0.36, -0.34],
      [0.48, -0.42 + 0.06 * wb(7)],
      [0.5, 0],
    ];
    return `M${pts.map(([px, py]) => `${(x + px * w * s - py * sway * s).toFixed(1)} ${(y + py * h * s).toFixed(1)}`).join(" L")} Z`;
  };
  return (
    <g>
      <path d={shape(1)} fill={MAWA.orange} stroke={MAWA.ink} strokeWidth={Math.max(3, w * 0.018)} strokeLinejoin="miter" />
      <path d={shape(0.62)} fill="#F2A15A" />
      <path d={shape(0.3)} fill="#FBE3C4" opacity={0.9} />
    </g>
  );
};

export type Act4Times = {
  whipAt: number; // enters from below
  ma1: number;
  beti1: number;
  anabeta1: number;
  anapita1: number;
  ma2: number;
  anabeta2: number;
  anapita2: number;
  end: number; // wall of fire fills the frame
};

/**
 * A pile of slips by the road catches fire. Embers rise and become tiny paper planes that fly
 * away. On the repeat the fire surges into a wall that fills the frame.
 */
export const Fire: React.FC<{ T: Act4Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T.whipAt + frame / fps;

  const enter = interpolate(t, [T.whipAt, T.whipAt + 0.32], [1, 0], { ...CLAMP, easing: Easing.bezier(0.1, 0.8, 0.3, 1) });
  const ign = interpolate(
    t,
    [T.ma1, T.beti1, T.anabeta1, T.anabeta1 + 0.7, T.ma2, T.anabeta2, T.anapita2, T.end],
    [0, 0.12, 0.35, 1, 1.15, 1.6, 2.1, 6],
    { ...CLAMP, easing: Easing.inOut(Easing.quad) },
  );
  const push = interpolate(t, [T.whipAt, T.end], [1, 1.14], CLAMP);
  const flick = 0.85 + 0.15 * wobble(t * 4, 3);

  const heap = Array.from({ length: 22 }, (_, i) => {
    const a = random(`heap-a${i}`) * Math.PI * 2;
    const r = Math.sqrt(random(`heap-r${i}`));
    return { x: W / 2 + Math.cos(a) * r * 300, y: 1530 + Math.sin(a) * r * 80, w: 120 + random(`heap-w${i}`) * 70, rot: (random(`heap-rot${i}`) - 0.5) * 120, i };
  }).sort((a, b) => a.y - b.y);
  const scorch = Math.min(1, ign / 1.6);

  const tongues = Array.from({ length: 9 }, (_, i) => ({
    x: W / 2 - 300 + i * 75 + wobble(i, 2) * 20,
    base: 1500,
    w: 150 + (i % 3) * 40,
    h: (180 + random(`tg-${i}`) * 200) * ign,
    seed: i + 1,
  }));
  const wall = Math.max(0, ign - 2);
  const planeWave = (at: number, k: number) => {
    const p = interpolate(t, [at + k * 0.08, at + 1.8 + k * 0.08], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.6, 1) });
    if (p <= 0 || p >= 1) return null;
    const sx = W / 2 - 200 + k * 100;
    const dir = k % 2 ? 1 : -1;
    const x = sx + dir * p * (250 + k * 60);
    const y = 1300 - p * 1100;
    return <Plane key={`${at}-${k}`} x={x} y={y} angle={-70 + dir * 25} size={70} opacity={interpolate(p, [0, 0.1, 0.8, 1], [0, 1, 1, 0])} />;
  };

  return (
    <AbsoluteFill style={{ translate: `0 ${enter * H * 1.05}px`, filter: `blur(${enter * 18}px)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <linearGradient id="fire-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141110" />
            <stop offset="0.7" stopColor="#3D2215" />
            <stop offset="1" stopColor="#5A2E16" />
          </linearGradient>
          <radialGradient id="fire-glow" cx="0.5" cy="0.76" r="0.6">
            <stop offset="0" stopColor="#F7A85A" stopOpacity={0.9} />
            <stop offset="1" stopColor="#F7A85A" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#fire-sky)" />
        <g transform={`translate(${W / 2} 1450) scale(${push}) translate(${-W / 2} -1450)`}>
          <rect width={W} height={H} fill="url(#fire-glow)" opacity={Math.min(1, 0.15 + ign * 0.5) * flick} />
          <path d={`M-200 1360 Q${W / 2} 1310 ${W + 200} 1360 L${W + 200} ${H + 200} L-200 ${H + 200} Z`} fill="#1B1817" />
          <ellipse cx={W / 2} cy={1560} rx={520} ry={120} fill={MAWA.orange} opacity={Math.min(0.45, ign * 0.3) * flick} />
          {/* back flames */}
          {tongues.filter((_, i) => i % 2 === 0).map((f) => (
            <FlameTongue key={`b${f.seed}`} x={f.x} y={f.base - 10} w={f.w * 1.2} h={f.h * 1.15} t={t} seed={f.seed + 20} />
          ))}
          {heap.map((s) => (
            <Sheet key={s.i} x={s.x} y={s.y} w={s.w} rot={s.rot} tilt={0.55} lit={0.4} seed={`heap-${s.i}`} tone={`color-mix(in srgb, #E8E4DA ${Math.round(100 - scorch * 55)}%, ${MAWA.ember})`} />
          ))}
          {/* front flames */}
          {tongues.filter((_, i) => i % 2 === 1).map((f) => (
            <FlameTongue key={`f${f.seed}`} x={f.x} y={f.base + 40} w={f.w} h={f.h} t={t} seed={f.seed} />
          ))}
          {/* the wall */}
          {wall > 0
            ? Array.from({ length: 8 }, (_, i) => (
                <FlameTongue key={`w${i}`} x={-60 + i * 170} y={H + 80} w={300} h={wall * (420 + (i % 3) * 120)} t={t} seed={i + 40} lean={(i - 3.5) * 0.02} />
              ))
            : null}
        </g>
        {/* embers */}
        {Array.from({ length: 50 }, (_, i) => {
          if (random(`em-on${i}`) > Math.min(1, ign)) return null;
          const speed = 160 + random(`em-s${i}`) * 260;
          const span = 1200;
          const yy = 1450 - (((t * speed + random(`em-o${i}`) * span) % span));
          const xx = W / 2 + (random(`em-x${i}`) - 0.5) * 640 + wobble(t * 1.5, i) * 40;
          return <circle key={i} cx={xx} cy={yy} r={2 + random(`em-r${i}`) * 4} fill={i % 3 ? "#F7B46E" : MAWA.orange} opacity={interpolate(yy, [250, 1450], [0, 0.95], CLAMP)} />;
        })}
        {[0, 1, 2, 3, 4].map((k) => planeWave(T.anapita1, k))}
        {[0, 1, 2, 3, 4].map((k) => planeWave(T.anapita2, k))}
        <rect width={W} height={H} fill={MAWA.orange} opacity={interpolate(t, [T.end - 0.3, T.end], [0, 1], CLAMP)} />
        <Vignette id="fire" amt={0.55} />
      </svg>
    </AbsoluteFill>
  );
};
