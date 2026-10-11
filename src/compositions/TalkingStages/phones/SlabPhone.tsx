import React from "react";
import { INK } from "../illustration/HandDrawn";
import { ChatScreen, type ChatTheme } from "./ChatScreen";
import type { PhoneProps } from "./types";

const W = 440;
const H = 1000;

const THEMES: Record<"ios" | "android", ChatTheme> = {
  ios: {
    font: "Inter, sans-serif",
    fontSize: 34,
    bg: "#FFFFFF",
    headerBg: "#F4F4F7",
    headerText: "#111111",
    title: "Talking Stage",
    bubble: "#2F80FF",
    bubbleText: "#FFFFFF",
    oldBubble: "#E7E7EC",
    oldText: "#111111",
    hot: "#FFE14D",
    radius: 26,
  },
  android: {
    font: "Inter, sans-serif",
    fontSize: 34,
    bg: "#14161C",
    headerBg: "#1F232C",
    headerText: "#FFFFFF",
    title: "Talking Stage",
    bubble: "#8C6BFF",
    bubbleText: "#FFFFFF",
    oldBubble: "#2C313C",
    oldText: "#E8EAF0",
    hot: "#C6FF4D",
    radius: 22,
  },
};

/** Modern all-screen phone. `style="ios"` has a pill cut-out; `"android"` a punch-hole camera. */
export const makeSlabPhone = (style: "ios" | "android") => {
  const SlabPhone: React.FC<PhoneProps> = ({ caseColor, text, typedChars, sinceCue, history }) => {
    const rx = style === "ios" ? 84 : 60;
    return (
      <g>
        {/* Side buttons */}
        <rect x={-10} y={230} width={14} height={70} rx={6} fill={caseColor} stroke={INK} strokeWidth={4} />
        <rect x={W - 4} y={260} width={14} height={110} rx={6} fill={caseColor} stroke={INK} strokeWidth={4} />
        <rect x={0} y={0} width={W} height={H} rx={rx} fill={caseColor} stroke={INK} strokeWidth={9} />
        <rect x={16} y={16} width={W - 32} height={H - 32} rx={rx - 14} fill="#0B0B0E" stroke={INK} strokeWidth={4} />
        <rect x={28} y={28} width={W - 56} height={H - 56} rx={rx - 26} fill={THEMES[style].bg} />
        {/* Status bar */}
        <text x={64} y={78} fontFamily="Inter, sans-serif" fontWeight={700} fontSize={24} fill={THEMES[style].headerText}>
          9:41
        </text>
        <rect x={W - 104} y={60} width={40} height={20} rx={6} fill="none" stroke={THEMES[style].headerText} strokeWidth={3} />
        <rect x={W - 100} y={64} width={28} height={12} rx={3} fill={THEMES[style].headerText} />
        {style === "ios" ? (
          <rect x={W / 2 - 70} y={46} width={140} height={40} rx={20} fill="#0B0B0E" />
        ) : (
          <circle cx={W / 2} cy={66} r={14} fill="#0B0B0E" />
        )}
        <ChatScreen
          x={28}
          y={100}
          w={W - 56}
          h={345}
          text={text}
          typedChars={typedChars}
          sinceCue={sinceCue}
          history={history.slice(-2)}
          theme={THEMES[style]}
        />
        {/* Keyboard hint under the chat (mostly hidden by the hand) */}
        <rect x={28} y={445} width={W - 56} height={H - 473} rx={0} fill={style === "ios" ? "#D5D8DF" : "#22262F"} />
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: r === 3 ? 3 : 8 }).map((__, c) => {
            const n = r === 3 ? 3 : 8;
            const kw = r === 3 ? (c === 1 ? 200 : 70) : 40;
            const xs = r === 3 ? [50, 130, 340][c] : 46 + c * 45;
            return (
              <rect
                key={`${r}-${c}`}
                x={xs}
                y={545 + r * 74}
                width={r === 3 ? kw : kw}
                height={56}
                rx={10}
                fill={style === "ios" ? "#FFFFFF" : "#3A404C"}
                opacity={n ? 0.95 : 1}
              />
            );
          }),
        )}
        <rect x={W / 2 - 70} y={H - 52} width={140} height={8} rx={4} fill={style === "ios" ? "#111" : "#DDD"} />
        <path d={`M60 40 Q${W / 2} 22 ${W - 60} 40`} stroke="white" strokeOpacity={0.4} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  return SlabPhone;
};

