import React from "react";
import { random, useCurrentFrame } from "remotion";
import { INK } from "./HandDrawn";

export type NailStyle = {
  shape: "almond" | "coffin" | "square" | "short";
  /** Nail length in px (phone-local units). */
  length: number;
  base: string;
  /** Optional two-stop chrome gradient instead of a flat base. */
  chrome?: [string, string];
  /** Glitter speck colours. */
  glitter?: string[];
  /** French-tip colour. */
  tip?: string;
  /** Little rhinestones near the cuticle. */
  gems?: string;
};

export type Ring = { finger: 0 | 1 | 2 | 3 | "thumb"; metal: "gold" | "silver"; stone?: string };

export type HandStyle = {
  id: string;
  skin: string;
  skinShadow: string;
  skinLight: string;
  nails: NailStyle;
  rings?: Ring[];
  /** Thickness multiplier (bigger for a man's hand). */
  build?: number;
  /** Optional sleeve/cuff colour at the wrist. */
  sleeve?: string;
};

const METALS = {
  gold: ["#FFE7A0", "#E0A93A", "#9C6A12"],
  silver: ["#FFFFFF", "#C9CED6", "#7D8590"],
};

const nailPath = (shape: NailStyle["shape"], len: number, h: number) => {
  const r = h / 2;
  switch (shape) {
    case "almond":
      return `M0 ${-r} L${len * 0.55} ${-r} Q${len} ${-h * 0.12} ${len} 0 Q${len} ${h * 0.12} ${len * 0.55} ${r} L0 ${r} Q${-h * 0.3} 0 0 ${-r}Z`;
    case "coffin":
      return `M0 ${-r} L${len * 0.72} ${-h * 0.4} L${len} ${-h * 0.24} L${len} ${h * 0.24} L${len * 0.72} ${h * 0.4} L0 ${r} Q${-h * 0.3} 0 0 ${-r}Z`;
    case "square":
      return `M0 ${-r} L${len - 10} ${-r} Q${len} ${-r} ${len} ${-r + 10} L${len} ${r - 10} Q${len} ${r} ${len - 10} ${r} L0 ${r} Q${-h * 0.3} 0 0 ${-r}Z`;
    case "short":
      return `M0 ${-r} L${len * 0.7} ${-r} Q${len} ${-r} ${len} 0 Q${len} ${r} ${len * 0.7} ${r} L0 ${r} Q${-h * 0.3} 0 0 ${-r}Z`;
  }
};

/** One nail drawn along +x from its cuticle at (0,0). */
const Nail: React.FC<{ uid: string; style: NailStyle; len: number; h: number }> = ({ uid, style, len, h }) => {
  const frame = useCurrentFrame();
  const d = nailPath(style.shape, len, h);
  const clip = `${uid}-clip`;
  const grad = `${uid}-grad`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
        {style.chrome ? (
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={style.chrome[0]} />
            <stop offset="0.5" stopColor={style.chrome[1]} />
            <stop offset="1" stopColor={style.chrome[0]} />
          </linearGradient>
        ) : null}
      </defs>
      <path d={d} fill={style.chrome ? `url(#${grad})` : style.base} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <g clipPath={`url(#${clip})`}>
        {style.tip ? <rect x={len * 0.68} y={-h} width={len} height={h * 2} fill={style.tip} /> : null}
        {style.glitter
          ? Array.from({ length: Math.round(len / 4) }).map((_, i) => {
              const tw = 0.55 + 0.45 * Math.sin(frame / (6 + random(`${uid}g${i}t`) * 10) + i);
              return (
                <circle
                  key={i}
                  cx={random(`${uid}g${i}x`) * len}
                  cy={(random(`${uid}g${i}y`) - 0.5) * h}
                  r={1.6 + random(`${uid}g${i}r`) * 3.2}
                  fill={style.glitter![i % style.glitter!.length]}
                  opacity={tw}
                />
              );
            })
          : null}
        {/* Shine */}
        <path d={`M${len * 0.12} ${-h * 0.26} Q${len * 0.45} ${-h * 0.36} ${len * 0.7} ${-h * 0.2}`} stroke="white" strokeOpacity={0.75} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      {style.gems
        ? [0.18, 0.34].map((p, i) => <circle key={i} cx={len * p} cy={h * 0.12 * (i ? 1 : -1)} r={4.5} fill={style.gems} stroke={INK} strokeWidth={1.5} />)
        : null}
    </g>
  );
};

const RingBand: React.FC<{ uid: string; ring: Ring; x: number; th: number }> = ({ uid, ring, x, th }) => {
  const [hi, mid, lo] = METALS[ring.metal];
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lo} />
          <stop offset="0.45" stopColor={hi} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
      </defs>
      <rect x={x - 11} y={-th / 2 - 5} width={22} height={th + 10} rx={10} fill={`url(#${uid}-metal)`} stroke={INK} strokeWidth={4} />
      {ring.stone ? (
        <g>
          <circle cx={x} cy={-th * 0.05} r={13} fill={ring.stone} stroke={INK} strokeWidth={3.5} />
          <circle cx={x - 4} cy={-th * 0.05 - 4} r={4} fill="white" opacity={0.8} />
        </g>
      ) : null}
    </g>
  );
};

/** A finger lying horizontally, base at x=x0, tip at x=x1, centred on y=0. */
const Finger: React.FC<{
  uid: string;
  hand: HandStyle;
  x0: number;
  x1: number;
  th: number;
  ring?: Ring;
}> = ({ uid, hand, x0, x1, th, ring }) => {
  const r = th / 2;
  const nailH = th * 0.62;
  return (
    <g>
      {/* contact shadow */}
      <rect x={x0} y={-r + 10} width={x1 - x0} height={th} rx={r} fill="rgba(0,0,0,0.18)" />
      <rect x={x0} y={-r} width={x1 - x0} height={th} rx={r} fill={hand.skin} stroke={INK} strokeWidth={7} />
      {/* underside shading */}
      <path d={`M${x0 + 10} ${r * 0.45} L${x1 - r} ${r * 0.45}`} stroke={hand.skinShadow} strokeWidth={th * 0.28} strokeLinecap="round" opacity={0.6} />
      {/* knuckle creases */}
      <path d={`M${x0 + (x1 - x0) * 0.38} ${-r * 0.55} q6 ${r * 0.5} 0 ${r * 1.0}`} stroke={INK} strokeWidth={3.5} fill="none" opacity={0.7} />
      <path d={`M${x0 + (x1 - x0) * 0.43} ${-r * 0.45} q5 ${r * 0.4} 0 ${r * 0.8}`} stroke={INK} strokeWidth={3} fill="none" opacity={0.5} />
      {ring ? <RingBand uid={`${uid}-ring`} ring={ring} x={x0 + (x1 - x0) * 0.24} th={th} /> : null}
      <g transform={`translate(${x1 - r * 1.15} ${-th * 0.06}) rotate(-4)`}>
        <Nail uid={`${uid}-nail`} style={hand.nails} len={hand.nails.length} h={nailH} />
      </g>
    </g>
  );
};

/** Palm + wrist, drawn BEHIND the phone. Coordinates are phone-local (W×H). */
export const HandBack: React.FC<{ hand: HandStyle; W: number; H: number }> = ({ hand, W, H }) => {
  const b = hand.build ?? 1;
  return (
    <g>
      <path
        d={`M${W - 30} ${H * 0.46} C${W + 140 * b} ${H * 0.47} ${W + 230 * b} ${H * 0.58} ${W + 250 * b} ${H * 0.72}
            L${W + 380 * b} ${H + 520} L${-40} ${H + 520} C${-70} ${H + 200} ${-110 * b} ${H * 0.95} ${-125 * b} ${H * 0.82}
            L${-130 * b} ${H * 0.44} Z`}
        fill={hand.skin}
        stroke={INK}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      {/* palm shading */}
      <path d={`M${W + 40} ${H * 0.62} C${W + 120} ${H * 0.78} ${W + 140} ${H * 0.95} ${W + 200} ${H + 300}`} stroke={hand.skinShadow} strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.45} />
      <path d={`M${W + 150} ${H * 0.9} q30 80 20 160`} stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
      {hand.sleeve ? (
        <path d={`M${W - 10} ${H + 240} L${W + 400 * b} ${H + 120} L${W + 520 * b} ${H + 560} L${-60} ${H + 560} Z`} fill={hand.sleeve} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      ) : null}
    </g>
  );
};

/** Fingers wrapping the left edge + thumb on the right, drawn IN FRONT of the phone. */
export const HandFront: React.FC<{ hand: HandStyle; W: number; H: number; thumbPress?: number }> = ({
  hand,
  W,
  H,
  thumbPress = 0,
}) => {
  const b = hand.build ?? 1;
  const ringOn = (f: Ring["finger"]) => hand.rings?.find((r) => r.finger === f);
  const fingers = [0, 1, 2, 3].map((i) => ({
    i,
    y: H * 0.46 + i * H * 0.118 * b,
    th: (94 - i * 7) * b,
    x0: -150 * b,
    x1: 78 - i * 12,
  }));

  // Thumb: from the right side of the phone toward the upper keypad.
  const base = { x: W + 150 * b, y: H * 0.74 };
  const tip = { x: W * 0.58, y: H * 0.585 + thumbPress };
  const angle = (Math.atan2(tip.y - base.y, tip.x - base.x) * 180) / Math.PI;
  const len = Math.hypot(tip.x - base.x, tip.y - base.y);
  const thumbTh = 112 * b;

  return (
    <g>
      {fingers.map((f) => (
        <g key={f.i} transform={`translate(0 ${f.y}) rotate(${-3 + f.i * 2})`}>
          <Finger uid={`${hand.id}-f${f.i}`} hand={hand} x0={f.x0} x1={f.x1} th={f.th} ring={ringOn(f.i as 0 | 1 | 2 | 3)} />
        </g>
      ))}
      <g transform={`translate(${base.x} ${base.y}) rotate(${angle})`}>
        <Finger uid={`${hand.id}-thumb`} hand={hand} x0={-80} x1={len} th={thumbTh} ring={ringOn("thumb")} />
      </g>
    </g>
  );
};
