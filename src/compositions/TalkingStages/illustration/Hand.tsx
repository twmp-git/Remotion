import React from "react";
import { random, useCurrentFrame } from "remotion";
import { INK } from "./HandDrawn";

export type NailStyle = {
  shape: "almond" | "coffin" | "square" | "short";
  /** How far the nail extends past the fingertip (phone-local px). */
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

export type Ring = { finger: 0 | 1 | 2 | 3 | "thumb"; metal: "gold" | "silver"; stone?: string; stack?: boolean };

export type HandStyle = {
  id: string;
  skin: string;
  skinShadow: string;
  skinLight: string;
  nails: NailStyle;
  rings?: Ring[];
  /** Thickness multiplier (bigger for a man's hand). */
  build?: number;
  /** Optional sleeve colour at the wrist. */
  sleeve?: string;
  /** Optional watch / bracelet at the wrist. */
  bracelet?: "gold" | "silver";
};

type P = { x: number; y: number };

const METALS = {
  gold: ["#FFEDB0", "#E2AC3C", "#9C6A12"],
  silver: ["#FFFFFF", "#C9CED6", "#78808B"],
};

// ---------------------------------------------------------------------------
// Geometry: a tapered "limb" along a quadratic Bézier centreline.
// ---------------------------------------------------------------------------

const bez = (p0: P, p1: P, p2: P, t: number): P => ({
  x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x,
  y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y,
});
const tangent = (p0: P, p1: P, p2: P, t: number): P => {
  const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
};
const fmt = (p: P) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

type Limb = { p0: P; p1: P; p2: P; w0: number; w2: number; knuckle?: number };

const widthAt = (l: Limb, t: number) =>
  l.w0 + (l.w2 - l.w0) * t ** 0.9 + (l.knuckle ?? 0) * Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t);

/** Outline of a tapered limb with a rounded tip and an optional rounded base. */
const limbOutline = (l: Limb, roundBase: boolean) => {
  const N = 22;
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const c = bez(l.p0, l.p1, l.p2, t);
    const d = tangent(l.p0, l.p1, l.p2, t);
    const w = widthAt(l, t) / 2;
    left.push({ x: c.x - d.y * w, y: c.y + d.x * w });
    right.push({ x: c.x + d.y * w, y: c.y - d.x * w });
  }
  const cap = (center: P, dir: P, r: number, from: number) =>
    Array.from({ length: 9 }, (_, k) => {
      const a = Math.atan2(dir.y, dir.x) + from - (k * Math.PI) / 8;
      return { x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r };
    });
  const tipDir = tangent(l.p0, l.p1, l.p2, 1);
  const baseDir = tangent(l.p0, l.p1, l.p2, 0);
  const tipCap = cap(l.p2, tipDir, l.w2 / 2, Math.PI / 2);
  const baseCap = cap(l.p0, { x: -baseDir.x, y: -baseDir.y }, l.w0 / 2, Math.PI / 2);

  const sides = [...left, ...tipCap, ...right.slice().reverse()];
  const all = roundBase ? [...sides, ...baseCap] : sides;
  const fill = `M${all.map(fmt).join(" L")} Z`;
  const stroke = roundBase ? fill : `M${sides.map(fmt).join(" L")}`;
  return { fill, stroke };
};

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

const nailPath = (shape: NailStyle["shape"], len: number, h: number) => {
  const r = h / 2;
  switch (shape) {
    case "almond":
      return `M0 ${-r} L${len * 0.5} ${-r * 0.95} Q${len} ${-h * 0.14} ${len} 0 Q${len} ${h * 0.14} ${len * 0.5} ${r * 0.95} L0 ${r} Q${-h * 0.32} 0 0 ${-r}Z`;
    case "coffin":
      return `M0 ${-r} L${len * 0.7} ${-h * 0.4} L${len} ${-h * 0.25} L${len} ${h * 0.25} L${len * 0.7} ${h * 0.4} L0 ${r} Q${-h * 0.32} 0 0 ${-r}Z`;
    case "square":
      return `M0 ${-r} L${len - 9} ${-r} Q${len} ${-r} ${len} ${-r + 9} L${len} ${r - 9} Q${len} ${r} ${len - 9} ${r} L0 ${r} Q${-h * 0.32} 0 0 ${-r}Z`;
    case "short":
      return `M0 ${-r} L${len * 0.55} ${-r} Q${len} ${-r} ${len} 0 Q${len} ${r} ${len * 0.55} ${r} L0 ${r} Q${-h * 0.32} 0 0 ${-r}Z`;
  }
};

/** A nail drawn along +x from its cuticle at (0,0). */
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
      <path d={d} fill={style.chrome ? `url(#${grad})` : style.base} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <g clipPath={`url(#${clip})`}>
        {style.tip ? <path d={`M${len * 0.62} ${-h} Q${len * 0.5} 0 ${len * 0.62} ${h} L${len * 2} ${h} L${len * 2} ${-h}Z`} fill={style.tip} /> : null}
        {style.glitter
          ? Array.from({ length: Math.max(8, Math.round(len / 3.5)) }).map((_, i) => {
              const tw = 0.5 + 0.5 * Math.sin(frame / (5 + random(`${uid}g${i}t`) * 9) + i);
              return (
                <circle
                  key={i}
                  cx={random(`${uid}g${i}x`) * len}
                  cy={(random(`${uid}g${i}y`) - 0.5) * h}
                  r={1.4 + random(`${uid}g${i}r`) * 2.8}
                  fill={style.glitter![i % style.glitter!.length]}
                  opacity={tw}
                />
              );
            })
          : null}
        <path
          d={`M${len * 0.1} ${-h * 0.22} Q${len * 0.42} ${-h * 0.34} ${len * 0.68} ${-h * 0.16}`}
          stroke="white"
          strokeOpacity={0.8}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {style.gems
        ? [0.16, 0.3].map((p, i) => (
            <circle key={i} cx={len * p} cy={h * 0.14 * (i ? 1 : -1)} r={4} fill={style.gems} stroke={INK} strokeWidth={1.4} />
          ))
        : null}
    </g>
  );
};

const RingBand: React.FC<{ uid: string; ring: Ring; w: number }> = ({ uid, ring, w }) => {
  const [hi, mid, lo] = METALS[ring.metal];
  const bands = ring.stack ? [-13, 13] : [0];
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lo} />
          <stop offset="0.35" stopColor={hi} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
      </defs>
      {bands.map((dx) => (
        <rect key={dx} x={dx - 10} y={-w / 2 - 5} width={20} height={w + 10} rx={9} fill={`url(#${uid}-metal)`} stroke={INK} strokeWidth={4} />
      ))}
      {ring.stone ? (
        <g>
          <circle cx={0} cy={-w * 0.08} r={14} fill={ring.stone} stroke={INK} strokeWidth={3.5} />
          <circle cx={-4} cy={-w * 0.08 - 5} r={4.5} fill="white" opacity={0.85} />
        </g>
      ) : null}
    </g>
  );
};

/** A finger or thumb: tapered outline, shading, knuckle crease, ring and nail. */
const Digit: React.FC<{
  uid: string;
  hand: HandStyle;
  limb: Limb;
  roundBase: boolean;
  ring?: Ring;
  nailScale?: number;
}> = ({ uid, hand, limb, roundBase, ring, nailScale = 1 }) => {
  const { fill, stroke } = limbOutline(limb, roundBase);
  const tipDir = tangent(limb.p0, limb.p1, limb.p2, 1);
  const tipAngle = (Math.atan2(tipDir.y, tipDir.x) * 180) / Math.PI;
  const r2 = limb.w2 / 2;
  // Nail sits on the back of the fingertip and extends past it.
  const cuticle = { x: limb.p2.x - tipDir.x * r2 * 1.35, y: limb.p2.y - tipDir.y * r2 * 1.35 };
  const nailLen = (hand.nails.length + r2 * 1.35) * nailScale;
  const at = (t: number) => {
    const c = bez(limb.p0, limb.p1, limb.p2, t);
    const d = tangent(limb.p0, limb.p1, limb.p2, t);
    return { c, a: (Math.atan2(d.y, d.x) * 180) / Math.PI, w: widthAt(limb, t) };
  };
  const crease = at(roundBase ? 0.42 : 0.55);
  const ringAt = at(roundBase ? 0.2 : 0.42);
  const shade = limbOutline({ ...limb, w0: limb.w0 * 0.42, w2: limb.w2 * 0.4, p0: limb.p0, p1: limb.p1, p2: limb.p2 }, roundBase);

  return (
    <g>
      <path d={fill} fill="rgba(40,10,10,0.18)" transform="translate(4 10)" />
      <path d={fill} fill={hand.skin} />
      {/* soft underside shadow, offset toward the bottom edge */}
      <g transform={`translate(${-tipDir.y * limb.w2 * 0.28} ${tipDir.x * limb.w2 * 0.28})`} opacity={0.45}>
        <path d={shade.fill} fill={hand.skinShadow} />
      </g>
      {/* highlight along the top edge */}
      <g transform={`translate(${tipDir.y * limb.w2 * 0.3} ${-tipDir.x * limb.w2 * 0.3})`} opacity={0.35}>
        <path d={limbOutline({ ...limb, w0: limb.w0 * 0.18, w2: limb.w2 * 0.16 }, roundBase).fill} fill={hand.skinLight} />
      </g>
      <path d={stroke} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      {/* knuckle crease */}
      <g transform={`translate(${crease.c.x} ${crease.c.y}) rotate(${crease.a})`} opacity={0.75}>
        <path d={`M-6 ${-crease.w * 0.32} Q4 0 -6 ${crease.w * 0.3}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M6 ${-crease.w * 0.22} Q13 0 6 ${crease.w * 0.2}`} stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
      {ring ? (
        <g transform={`translate(${ringAt.c.x} ${ringAt.c.y}) rotate(${ringAt.a})`}>
          <RingBand uid={`${uid}-ring`} ring={ring} w={ringAt.w} />
        </g>
      ) : null}
      <g transform={`translate(${cuticle.x} ${cuticle.y}) rotate(${tipAngle})`}>
        <Nail uid={`${uid}-nail`} style={hand.nails} len={nailLen} h={limb.w2 * 0.66} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Hand (left hand, palm behind the phone; phone-local coordinates W×H)
// ---------------------------------------------------------------------------

/** Palm, heel and wrist — drawn BEHIND the phone. */
export const HandBack: React.FC<{ hand: HandStyle; W: number; H: number }> = ({ hand, W, H }) => {
  const b = hand.build ?? 1;
  const palm = `M${W - 20} ${H * 0.45}
    C${W + 120 * b} ${H * 0.44} ${W + 230 * b} ${H * 0.56} ${W + 250 * b} ${H * 0.72}
    C${W + 270 * b} ${H * 0.9} ${W + 300 * b} ${H * 1.1} ${W + 330 * b} ${H + 700}
    L${-120 * b} ${H + 700}
    C${-110 * b} ${H * 1.2} ${-70 * b} ${H * 0.98} ${-55 * b} ${H * 0.83}
    L${-40} ${H * 0.42} Z`;
  const wristY = H + 330;
  return (
    <g>
      <path d={palm} fill={hand.skin} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* thenar pad shading + palm crease */}
      <path d={`M${W + 30} ${H * 0.6} C${W + 150 * b} ${H * 0.7} ${W + 190 * b} ${H * 0.9} ${W + 210 * b} ${H + 200}`} stroke={hand.skinShadow} strokeWidth={70 * b} fill="none" strokeLinecap="round" opacity={0.35} />
      <path d={`M${W + 70 * b} ${H * 0.86} C${W + 120 * b} ${H * 0.95} ${W + 135 * b} ${H * 1.05} ${W + 130 * b} ${H * 1.16}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
      {hand.bracelet ? (
        <path d={`M${-120 * b} ${wristY} Q${W / 2} ${wristY + 70} ${W + 320 * b} ${wristY - 40}`} stroke={METALS[hand.bracelet][1]} strokeWidth={30} fill="none" strokeLinecap="round" />
      ) : null}
      {hand.sleeve ? (
        <path d={`M${-140 * b} ${wristY + 60} Q${W / 2} ${wristY + 140} ${W + 340 * b} ${wristY + 10} L${W + 360 * b} ${H + 760} L${-160 * b} ${H + 760} Z`} fill={hand.sleeve} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      ) : null}
    </g>
  );
};

/** Fingertips curling around the left edge + thumb over the keypad — drawn IN FRONT of the phone. */
export const HandFront: React.FC<{ hand: HandStyle; W: number; H: number; thumbPress?: number }> = ({
  hand,
  W,
  H,
  thumbPress = 0,
}) => {
  const b = hand.build ?? 1;
  const ringOn = (f: Ring["finger"]) => hand.rings?.find((r) => r.finger === f);

  // Each finger bulges out past the left edge (bent middle joint) and its tip lies on the phone face.
  const fingers: Limb[] = [
    { p0: { x: -62 * b, y: H * 0.515 }, p1: { x: 4, y: H * 0.502 }, p2: { x: 74, y: H * 0.484 }, w0: 104 * b, w2: 80 * b, knuckle: 6 },
    { p0: { x: -70 * b, y: H * 0.618 }, p1: { x: 8, y: H * 0.61 }, p2: { x: 82, y: H * 0.596 }, w0: 106 * b, w2: 82 * b, knuckle: 6 },
    { p0: { x: -64 * b, y: H * 0.718 }, p1: { x: 6, y: H * 0.714 }, p2: { x: 72, y: H * 0.706 }, w0: 98 * b, w2: 77 * b, knuckle: 5 },
    { p0: { x: -50 * b, y: H * 0.812 }, p1: { x: 4, y: H * 0.814 }, p2: { x: 54, y: H * 0.81 }, w0: 84 * b, w2: 68 * b, knuckle: 4 },
  ];

  // Thumb: rooted in the palm on the right, arching over to the upper keypad.
  const thumb: Limb = {
    p0: { x: W + 170 * b, y: H * 0.86 },
    p1: { x: W + 10, y: H * 0.69 + thumbPress * 0.5 },
    p2: { x: W * 0.62, y: H * 0.635 + thumbPress },
    w0: 160 * b,
    w2: 96 * b,
    knuckle: 14,
  };

  return (
    <g>
      {/* Draw bottom finger first so the upper ones overlap naturally. */}
      {[3, 2, 1, 0].map((i) => (
        <Digit key={i} uid={`${hand.id}-f${i}`} hand={hand} limb={fingers[i]} roundBase ring={ringOn(i as 0 | 1 | 2 | 3)} nailScale={i === 3 ? 0.85 : 1} />
      ))}
      <Digit uid={`${hand.id}-thumb`} hand={hand} limb={thumb} roundBase={false} ring={ringOn("thumb")} />
    </g>
  );
};
