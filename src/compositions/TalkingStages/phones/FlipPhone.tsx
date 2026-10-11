import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { tsFonts } from "../fonts";
import { HOT_WORDS } from "../lyrics";
import { INK } from "../illustration/HandDrawn";
import type { PhoneProps } from "./types";

const W = 440;
const H = 1000;

/** Mid-2000s clamshell, flipped open: colour screen in the lid, etched metal keypad below (no brand marks). */
export const FlipPhone: React.FC<PhoneProps> = ({ caseColor, text, typedChars, sinceCue, activeKey }) => {
  const frame = useCurrentFrame();
  const glow = interpolate(sinceCue, [0, 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorOn = Math.floor(frame / 12) % 2 === 0;
  const typed = text.slice(0, typedChars);

  return (
    <g>
      {/* Lid */}
      <rect x={6} y={0} width={W - 12} height={470} rx={60} fill={caseColor} stroke={INK} strokeWidth={9} />
      <rect x={34} y={30} width={W - 68} height={410} rx={38} fill="#17181D" stroke={INK} strokeWidth={5} />
      <rect x={W / 2 - 46} y={50} width={92} height={10} rx={5} fill="#3A3C44" />
      <rect x={56} y={78} width={W - 112} height={344} rx={14} fill="#0A1A3A" stroke={INK} strokeWidth={4} />
      <foreignObject x={56} y={78} width={W - 112} height={344}>
        <div
          style={{
            width: W - 112,
            height: 344,
            borderRadius: 12,
            background: `linear-gradient(160deg, color-mix(in srgb, #5FB4FF ${Math.round(40 + glow * 50)}%, #0D2A66), #071631)`,
            fontFamily: tsFonts.pixel,
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px", fontSize: 26, background: "rgba(0,0,0,0.35)" }}>
            <span>Inbox</span>
            <span>{sinceCue < 0.9 && Math.floor(frame / 5) % 2 === 0 ? "1 NEW" : "12:00"}</span>
          </div>
          <div style={{ padding: "12px 16px", fontSize: 46, lineHeight: "40px", wordBreak: "break-word" }}>
            {typed.split(/(\s+)/).map((part, i) => {
              const hot = HOT_WORDS.has(part.toLowerCase().replace(/[^a-z']/g, ""));
              return (
                <span key={i} style={hot ? { color: "#FFE14D", textShadow: "0 0 10px #FF7AD9" } : undefined}>
                  {part}
                </span>
              );
            })}
            <span style={{ opacity: cursorOn ? 1 : 0 }}>_</span>
          </div>
        </div>
      </foreignObject>
      {/* Hinge */}
      <rect x={30} y={462} width={W - 60} height={54} rx={24} fill="#4A4C55" stroke={INK} strokeWidth={6} />
      <path d={`M50 478 L${W - 50} 478`} stroke="white" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
      {/* Base */}
      <rect x={6} y={508} width={W - 12} height={H - 508} rx={50} fill={caseColor} stroke={INK} strokeWidth={9} />
      <rect x={34} y={530} width={W - 68} height={H - 570} rx={30} fill="#B9C2CF" stroke={INK} strokeWidth={5} />
      {/* Nav ring + soft keys */}
      <circle cx={W / 2} cy={600} r={44} fill="#D6DCE5" stroke={INK} strokeWidth={4} />
      <circle cx={W / 2} cy={600} r={16} fill="#9AA4B3" stroke={INK} strokeWidth={3} />
      <rect x={60} y={580} width={90} height={40} rx={10} fill="#D6DCE5" stroke={INK} strokeWidth={3.5} />
      <rect x={W - 150} y={580} width={90} height={40} rx={10} fill="#D6DCE5" stroke={INK} strokeWidth={3.5} />
      {/* Etched keypad grid */}
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const label = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"][i];
        return (
          <g key={i} transform={`translate(${70 + col * 100} ${660 + row * 72})`}>
            <rect x={0} y={0} width={100} height={72} fill={activeKey === i ? "#FFFFFF" : "#C9D1DC"} stroke={INK} strokeWidth={3} opacity={0.95} />
            <text x={50} y={48} textAnchor="middle" fontFamily={tsFonts.hand} fontSize={34} fill="#2A2F38">
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
