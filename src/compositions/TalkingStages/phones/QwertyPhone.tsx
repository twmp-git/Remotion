import React from "react";
import { tsFonts } from "../fonts";
import { INK } from "../illustration/HandDrawn";
import { ChatScreen } from "./ChatScreen";
import type { PhoneProps } from "./types";

const W = 440;
const H = 1000;
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** Late-2000s keyboard phone: wide screen, trackball, full QWERTY (no brand marks). */
export const QwertyPhone: React.FC<PhoneProps> = ({ caseColor, text, typedChars, sinceCue, activeKey, history }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} rx={70} fill={caseColor} stroke={INK} strokeWidth={9} />
    <rect x={18} y={18} width={W - 36} height={H - 36} rx={56} fill="#202127" stroke={INK} strokeWidth={5} />
    <path d={`M50 60 Q${W / 2} 36 ${W - 50} 60`} stroke="white" strokeOpacity={0.35} strokeWidth={8} fill="none" strokeLinecap="round" />
    <rect x={W / 2 - 50} y={50} width={100} height={10} rx={5} fill="#0E0E12" />
    {/* Screen */}
    <rect x={38} y={88} width={W - 76} height={380} rx={14} fill="#0E0E12" stroke={INK} strokeWidth={5} />
    <ChatScreen
      x={50}
      y={100}
      w={W - 100}
      h={356}
      text={text}
      typedChars={typedChars}
      sinceCue={sinceCue}
      history={history.slice(-1)}
      theme={{
        font: tsFonts.pixel,
        fontSize: 38,
        bg: "linear-gradient(#F3F6FA, #DCE4EE)",
        headerBg: "#2C3E57",
        headerText: "#FFFFFF",
        title: "Talking Stage",
        bubble: "#2463D6",
        bubbleText: "#FFFFFF",
        oldBubble: "#3A4F6E",
        oldText: "#FFFFFF",
        hot: "#FFD23F",
        radius: 8,
        retro: true,
      }}
    />
    {/* Call / menu / trackball / back / end row */}
    <g transform="translate(0 520)">
      <rect x={40} y={-26} width={70} height={52} rx={14} fill="#2D2E35" stroke={INK} strokeWidth={4} />
      <rect x={60} y={-6} width={30} height={12} rx={6} fill="#3BC56B" />
      <rect x={120} y={-26} width={60} height={52} rx={14} fill="#2D2E35" stroke={INK} strokeWidth={4} />
      <circle cx={W / 2} cy={0} r={26} fill="#5A5C66" stroke={INK} strokeWidth={4} />
      <circle cx={W / 2 - 7} cy={-8} r={8} fill="white" opacity={0.6} />
      <rect x={W - 180} y={-26} width={60} height={52} rx={14} fill="#2D2E35" stroke={INK} strokeWidth={4} />
      <rect x={W - 110} y={-26} width={70} height={52} rx={14} fill="#2D2E35" stroke={INK} strokeWidth={4} />
      <rect x={W - 90} y={-6} width={30} height={12} rx={6} fill="#E2453A" />
    </g>
    {/* QWERTY keyboard */}
    {ROWS.map((row, r) =>
      Array.from(row).map((ch, c) => {
        const n = row.length;
        const kw = 34;
        const gap = 4;
        const x0 = (W - (n * kw + (n - 1) * gap)) / 2;
        const cx = x0 + c * (kw + gap) + kw / 2;
        const curve = ((c - (n - 1) / 2) / n) ** 2 * 40;
        const cy = 620 + r * 64 + curve;
        const idx = r * 10 + c;
        const pressed = activeKey !== null && idx % 12 === activeKey;
        return (
          <g key={`${r}-${c}`} transform={`translate(${cx} ${cy})`}>
            <rect x={-kw / 2} y={-24} width={kw} height={48} rx={10} fill={pressed ? "#9AA0AE" : "#3A3B43"} stroke={INK} strokeWidth={3} />
            <text y={9} textAnchor="middle" fontFamily={tsFonts.hand} fontSize={24} fill="#F1F1F4">
              {ch}
            </text>
          </g>
        );
      }),
    )}
    <rect x={W / 2 - 80} y={830} width={160} height={46} rx={12} fill="#3A3B43" stroke={INK} strokeWidth={3} />
    <circle cx={W / 2} cy={H - 60} r={5} fill="#0E0E12" />
  </g>
);
