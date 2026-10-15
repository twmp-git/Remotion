import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../utils/animation";

/**
 * Illustrated gallery-style room (deep teal wall, framed art, sideboard, plants, lamp).
 * Drawn on a 1080×1920 canvas; the SVG scales to the composition size.
 * A slow push-in over the whole clip keeps the still background alive.
 */

const WALL_TOP = "#24525E";
const WALL_BOTTOM = "#173B45";
const INK = "#16181B";
const CREAM = "#F3E9D6";
const MUSTARD = "#E2A92B";
const TERRACOTTA = "#C8613F";
const CORAL = "#EE8565";
const SAGE = "#8DB39A";
const WOOD = "#8A5630";
const WOOD_LIGHT = "#A86C3E";
const WOOD_DARK = "#5E3920";

/** Thin black frame with a cream mat around `children` (art drawn in local coords). */
const Frame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  mat?: number;
  children: React.ReactNode;
  id: string;
}> = ({ x, y, w, h, mat = 26, children, id }) => {
  const ix = x + 12 + mat;
  const iy = y + 12 + mat;
  const iw = w - 2 * (12 + mat);
  const ih = h - 2 * (12 + mat);
  return (
    <g>
      {/* soft wall shadow */}
      <rect x={x + 10} y={y + 16} width={w} height={h} fill="#000" opacity={0.28} filter="url(#soft)" />
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill={CREAM} />
      <clipPath id={id}>
        <rect x={ix} y={iy} width={iw} height={ih} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${ix} ${iy})`}>{children}</g>
      </g>
    </g>
  );
};

/** Lake-at-sunset painting (local size 304×394). */
const LakePainting: React.FC = () => (
  <g>
    <rect width={304} height={394} fill="#F2C97A" />
    <rect y={150} width={304} height={250} fill="#EFA65A" />
    <circle cx={190} cy={150} r={62} fill={CORAL} />
    <path d="M0 210 C60 170 110 180 160 200 C210 220 250 190 304 175 L304 260 L0 260 Z" fill="#2E6E6A" />
    <path d="M0 235 C70 215 130 230 200 240 C250 247 280 235 304 228 L304 280 L0 280 Z" fill="#1F4B52" />
    <rect y={270} width={304} height={124} fill="#3F8A92" />
    {[292, 312, 334, 356, 376].map((yy, i) => (
      <rect key={yy} x={30 + (i % 2) * 60} y={yy} width={150 - i * 12} height={6} rx={3} fill={CREAM} opacity={0.55} />
    ))}
    <path d="M150 300 l40 0 l-6 10 l-28 0 Z" fill={INK} />
    <path d="M168 300 l0 -34 l16 26 Z" fill={CREAM} />
  </g>
);

/** Matisse-style cut-out composition (local size 354×224). */
const CutoutPainting: React.FC = () => (
  <g>
    <rect width={354} height={224} fill="#2C4A3E" />
    <path d="M40 200 C20 140 60 90 50 30 C90 70 110 130 90 200 Z" fill={CORAL} />
    <path d="M130 40 C170 60 160 110 200 120 C170 150 140 120 120 160 C110 120 140 90 130 40 Z" fill={CREAM} />
    <circle cx={270} cy={70} r={34} fill={MUSTARD} />
    <path d="M230 210 C240 160 300 150 320 120 C330 170 300 200 260 214 Z" fill={SAGE} />
    <path d="M190 190 q20 -30 40 0 q-20 18 -40 0 Z" fill={TERRACOTTA} />
    <circle cx={80} cy={40} r={8} fill={MUSTARD} />
    <circle cx={330} cy={200} r={6} fill={CREAM} />
  </g>
);

/** Single-line face drawing (local size 114×104). */
const LineFace: React.FC = () => (
  <g>
    <rect width={114} height={104} fill="#FBF5EA" />
    <path
      d="M30 18 C14 40 16 70 34 88 C48 100 70 98 82 86 M62 30 C54 44 58 52 66 56 C60 60 58 66 64 70 M40 44 q8 -6 14 0 M70 42 q8 -6 14 0 M46 78 q12 8 24 0 M30 18 C50 6 80 6 92 26"
      fill="none"
      stroke={INK}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  </g>
);

/** Round chitenje-style textile piece. */
const TextileDisc: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <circle cx={cx + 8} cy={cy + 14} r={r + 6} fill="#000" opacity={0.28} filter="url(#soft)" />
    <circle cx={cx} cy={cy} r={r + 8} fill={INK} />
    <circle cx={cx} cy={cy} r={r} fill={MUSTARD} />
    <circle cx={cx} cy={cy} r={r * 0.78} fill={INK} />
    <circle cx={cx} cy={cy} r={r * 0.7} fill={TERRACOTTA} />
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return (
        <circle key={i} cx={cx + Math.cos(a) * r * 0.88} cy={cy + Math.sin(a) * r * 0.88} r={r * 0.05} fill={CREAM} />
      );
    })}
    <circle cx={cx} cy={cy} r={r * 0.45} fill={CREAM} />
    <path
      d={`M${cx - r * 0.3} ${cy} L${cx} ${cy - r * 0.3} L${cx + r * 0.3} ${cy} L${cx} ${cy + r * 0.3} Z`}
      fill={INK}
    />
    <circle cx={cx} cy={cy} r={r * 0.08} fill={MUSTARD} />
  </g>
);

const Leaf: React.FC<{ x: number; y: number; len: number; angle: number; color: string; width?: number }> = ({
  x,
  y,
  len,
  angle,
  color,
  width = 0.32,
}) => (
  <path
    d={`M0 0 C${len * width} ${-len * 0.25} ${len * width} ${-len * 0.75} 0 ${-len} C${-len * width} ${-len * 0.75} ${-len * width} ${-len * 0.25} 0 0 Z`}
    transform={`translate(${x} ${y}) rotate(${angle})`}
    fill={color}
  />
);

const Room: React.FC = () => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={WALL_TOP} />
        <stop offset="1" stopColor={WALL_BOTTOM} />
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6E4527" />
        <stop offset="1" stopColor="#4E2F1A" />
      </linearGradient>
      <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFD58A" stopOpacity={0.55} />
        <stop offset="1" stopColor="#FFD58A" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id="beam" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="28" />
      </filter>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>

    {/* wall + plaster grain */}
    <rect width={1080} height={1920} fill="url(#wall)" />
    <rect width={1080} height={1920} filter="url(#grain)" opacity={0.06} />

    {/* window light falling across the wall */}
    <g filter="url(#beam)" opacity={0.16}>
      <path d="M760 0 L1080 0 L1080 260 L380 1500 L120 1500 Z" fill="#FFE7B8" />
    </g>

    {/* gallery wall */}
    <Frame id="art-lake" x={80} y={150} w={380} h={470}>
      <LakePainting />
    </Frame>
    <Frame id="art-cutout" x={540} y={130} w={430} h={300}>
      <CutoutPainting />
    </Frame>
    <Frame id="art-face" x={560} y={480} w={190} h={180} mat={26}>
      <LineFace />
    </Frame>
    <TextileDisc cx={880} cy={570} r={82} />

    {/* arc floor lamp (right) */}
    <circle cx={850} cy={1200} r={230} fill="url(#lampGlow)" />
    <path d="M1010 1760 L1010 1000 C1010 860 930 820 870 840" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d="M810 830 L930 830 L905 900 L835 900 Z" fill={MUSTARD} transform="rotate(-8 870 865)" />
    <ellipse cx={1010} cy={1770} rx={60} ry={14} fill={INK} />

    {/* floor + rug */}
    <rect y={1690} width={1080} height={230} fill="url(#floor)" />
    {[1730, 1790, 1860].map((yy) => (
      <rect key={yy} y={yy} width={1080} height={3} fill="#3C2414" opacity={0.6} />
    ))}
    <path d="M120 1800 L960 1800 L1040 1920 L40 1920 Z" fill={TERRACOTTA} />
    <path d="M170 1820 L910 1820 L975 1920 L105 1920 Z" fill={CREAM} />
    {Array.from({ length: 9 }).map((_, i) => (
      <path
        key={i}
        d={`M${190 + i * 85} 1840 l30 30 l-30 30 l-30 -30 Z`}
        fill={i % 2 === 0 ? INK : MUSTARD}
      />
    ))}

    {/* sideboard */}
    <rect x={150} y={1400} width={780} height={26} rx={6} fill={WOOD_LIGHT} />
    <rect x={165} y={1426} width={750} height={210} fill={WOOD} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={185 + i * 245} y={1446} width={225} height={170} rx={6} fill={WOOD_DARK} />
        {Array.from({ length: 10 }).map((_, k) => (
          <rect key={k} x={197 + i * 245 + k * 21} y={1458} width={8} height={146} rx={4} fill="#C99A63" opacity={0.55} />
        ))}
        <circle cx={i === 1 ? 297 + 245 : 185 + i * 245 + (i === 0 ? 210 : 15)} cy={1531} r={6} fill={MUSTARD} />
      </g>
    ))}
    <path d="M200 1636 L190 1700 M880 1636 L890 1700" stroke={WOOD_DARK} strokeWidth={14} strokeLinecap="round" />

    {/* objects on the sideboard */}
    {/* face vase */}
    <path d="M230 1400 C200 1350 205 1290 245 1270 L245 1250 L285 1250 L285 1270 C325 1290 330 1350 300 1400 Z" fill={CREAM} />
    <path d="M250 1320 q10 -8 20 0 M262 1322 q-6 18 4 30 M252 1366 q14 8 26 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    {/* plant in pot */}
    <path d="M440 1400 L455 1310 L555 1310 L570 1400 Z" fill={TERRACOTTA} />
    <rect x={448} y={1300} width={114} height={16} rx={4} fill="#B4532F" />
    <Leaf x={505} y={1302} len={150} angle={-38} color="#2F7A4E" width={0.4} />
    <Leaf x={505} y={1302} len={175} angle={-8} color="#3A8F5C" width={0.36} />
    <Leaf x={505} y={1302} len={140} angle={28} color="#2F7A4E" width={0.42} />
    <Leaf x={505} y={1302} len={110} angle={62} color="#4FA26D" width={0.4} />
    <Leaf x={505} y={1302} len={120} angle={-70} color="#4FA26D" width={0.4} />
    {/* book stack + small sculpture */}
    {[
      { y: 1374, w: 150, c: MUSTARD },
      { y: 1350, w: 135, c: TERRACOTTA },
      { y: 1328, w: 160, c: SAGE },
      { y: 1306, w: 140, c: CREAM },
    ].map((b) => (
      <rect key={b.y} x={650 + (160 - b.w) / 2} y={b.y} width={b.w} height={24} rx={3} fill={b.c} stroke={INK} strokeWidth={2} />
    ))}
    <circle cx={728} cy={1270} r={34} fill={INK} />
    <circle cx={728} cy={1270} r={14} fill={CORAL} />
    <path d="M840 1400 C835 1340 870 1320 875 1290 C880 1320 915 1340 910 1400 Z" fill={SAGE} />

    {/* snake plant (left, floor) */}
    <path d="M40 1760 L60 1660 L170 1660 L190 1760 Z" fill={CREAM} />
    <rect x={52} y={1650} width={126} height={16} rx={4} fill="#DCCFB7" />
    {[
      { x: 75, len: 330, a: -12, c: "#2E6B45" },
      { x: 100, len: 420, a: -4, c: "#3F8556" },
      { x: 125, len: 380, a: 5, c: "#2E6B45" },
      { x: 150, len: 300, a: 14, c: "#4E9A63" },
      { x: 112, len: 260, a: -20, c: "#4E9A63" },
    ].map((l) => (
      <Leaf key={l.x + l.a} x={l.x} y={1656} len={l.len} angle={l.a} color={l.c} width={0.1} />
    ))}

    {/* vignette */}
    <rect width={1080} height={1920} fill="url(#vignette)" />
  </svg>
);

export const ArtRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.07, 1], CLAMP);
  const y = interpolate(frame, [0, durationInFrames], [-18, 0], CLAMP);
  return (
    <AbsoluteFill style={{ backgroundColor: WALL_BOTTOM }}>
      <AbsoluteFill style={{ scale: String(scale), translate: `0 ${y}px` }}>
        <Room />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
