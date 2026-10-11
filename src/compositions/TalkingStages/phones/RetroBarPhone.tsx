import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { tsFonts } from "../fonts";
import { INK } from "../illustration/HandDrawn";
import type { PhoneProps } from "./types";
import { HOT_WORDS } from "../lyrics";

/** Typed LCD text; "hot" words flash in inverted pixels once typed. */
const ScreenText: React.FC<{ text: string; typedChars: number; sinceCue: number; frame: number }> = ({
  text,
  typedChars,
  frame,
}) => {
  const typed = text.slice(0, typedChars);
  const parts = typed.split(/(\s+)/);
  let pos = 0;
  return (
    <>
      {parts.map((part, i) => {
        const startPos = pos;
        pos += part.length;
        const word = part.toLowerCase().replace(/[^a-z']/g, "");
        const complete = startPos + part.length < typedChars || typedChars === text.length;
        const hot = HOT_WORDS.has(word) && complete;
        const blink = hot && Math.floor(frame / 4) % 2 === 0;
        return hot ? (
          <span key={i} style={{ backgroundColor: blink ? "#1F2B0B" : "transparent", color: blink ? "#C9E25A" : "#1F2B0B", padding: "0 4px" }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

export const RETRO_W = 440;
export const RETRO_H = 1000;

const KEYS = [
  ["1", "oo"], ["2", "abc"], ["3", "def"],
  ["4", "ghi"], ["5", "jkl"], ["6", "mno"],
  ["7", "pqrs"], ["8", "tuv"], ["9", "wxyz"],
  ["*", "+"], ["0", "_"], ["#", "^"],
];

/** Early-2000s candy-bar phone with a green monochrome LCD (no brand marks). */
export const RetroBarPhone: React.FC<PhoneProps> = ({ caseColor, text, typedChars, sinceCue, activeKey }) => {
  const frame = useCurrentFrame();
  const W = RETRO_W;
  const H = RETRO_H;
  // Backlight flashes bright on every new line, then settles.
  const glow = interpolate(sinceCue, [0, 0.45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lcd = glow > 0 ? `color-mix(in srgb, #E9FF86 ${Math.round(glow * 100)}%, #B3CC3C)` : "#B3CC3C";
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  return (
    <g>
      {/* Case + body */}
      <rect x={0} y={0} width={W} height={H} rx={120} fill={caseColor} stroke={INK} strokeWidth={9} />
      <rect x={28} y={28} width={W - 56} height={H - 56} rx={96} fill="#E6DCCF" stroke={INK} strokeWidth={6} />
      <path d={`M60 120 Q${W / 2} 60 ${W - 60} 120`} stroke="white" strokeOpacity={0.55} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* Earpiece */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={W / 2 - 55 + i * 4} y={88 + i * 14} width={110 - i * 8} height={6} rx={3} fill={INK} opacity={0.75} />
      ))}

      {/* Screen bezel + LCD */}
      <rect x={58} y={168} width={W - 116} height={270} rx={30} fill="#B9AE9F" stroke={INK} strokeWidth={6} />
      <rect x={80} y={190} width={W - 160} height={226} rx={14} fill={lcd} stroke={INK} strokeWidth={4} />
      {/* status bar: signal + battery */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={94 + i * 9} y={224 - i * 6} width={6} height={8 + i * 6} fill="#24320E" />
      ))}
      <rect x={W - 130} y={208} width={30} height={16} fill="none" stroke="#24320E" strokeWidth={3} />
      <rect x={W - 100} y={212} width={4} height={8} fill="#24320E" />
      <rect x={W - 126} y={212} width={20} height={8} fill="#24320E" />
      {/* New-message envelope blinks at the start of each line */}
      {sinceCue < 0.9 && Math.floor(frame / 5) % 2 === 0 ? (
        <g transform="translate(150 206)">
          <rect x={0} y={0} width={34} height={22} fill="none" stroke="#1F2B0B" strokeWidth={3} />
          <path d="M0 0 L17 13 L34 0" fill="none" stroke="#1F2B0B" strokeWidth={3} />
        </g>
      ) : null}
      <foreignObject x={88} y={234} width={W - 176} height={178}>
        <div
          style={{
            fontFamily: tsFonts.pixel,
            fontSize: 44,
            lineHeight: "37px",
            color: "#1F2B0B",
            textTransform: "lowercase",
            wordBreak: "break-word",
          }}
        >
          <ScreenText text={text} typedChars={typedChars} sinceCue={sinceCue} frame={frame} />
          <span style={{ opacity: cursorOn ? 1 : 0 }}>_</span>
        </div>
      </foreignObject>
      <path d={`M88 200 L${W - 92} 200`} stroke="white" strokeOpacity={0.35} strokeWidth={4} />

      {/* Chin + nav keys */}
      <path d={`M60 470 Q${W / 2} 500 ${W - 60} 470`} stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
      <ellipse cx={W / 2} cy={530} rx={78} ry={30} fill="#D8CDBF" stroke={INK} strokeWidth={5} />
      <circle cx={92} cy={548} r={26} fill="#D8CDBF" stroke={INK} strokeWidth={5} />
      <text x={92} y={558} textAnchor="middle" fontFamily={tsFonts.hand} fontSize={30} fill={INK}>c</text>
      <circle cx={W - 92} cy={548} r={26} fill="#D8CDBF" stroke={INK} strokeWidth={5} />
      <circle cx={W - 92} cy={548} r={8} fill="#E2453A" />

      {/* Keypad */}
      {KEYS.map(([num, letters], i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 110 + col * 110;
        const cy = 625 + row * 82;
        const pressed = activeKey === i;
        return (
          <g key={num} transform={`translate(${cx} ${cy}) rotate(${-4 + col * 2})`}>
            <rect x={-46} y={-30} width={92} height={60} rx={22} fill={pressed ? "#FFFFFF" : "#DCD1C3"} stroke={INK} strokeWidth={4.5} />
            <text x={-14} y={12} textAnchor="middle" fontFamily={tsFonts.hand} fontSize={34} fill={INK}>{num}</text>
            <text x={18} y={10} textAnchor="middle" fontFamily={tsFonts.hand} fontSize={20} fill={INK}>{letters}</text>
          </g>
        );
      })}
      {/* Mic hole */}
      <circle cx={W / 2} cy={H - 70} r={6} fill={INK} opacity={0.7} />
    </g>
  );
};
