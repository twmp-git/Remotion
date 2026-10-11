import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, EASE_OUT } from "../../../utils/animation";
import { HOT_WORDS } from "../lyrics";

export type ChatTheme = {
  font: string;
  fontSize: number;
  bg: string;
  headerBg: string;
  headerText: string;
  title: string;
  /** Bubble colours for the line being typed now (sent). */
  bubble: string;
  bubbleText: string;
  /** Bubble colours for earlier lines. */
  oldBubble: string;
  oldText: string;
  hot: string;
  /** Accent for hot words inside older bubbles (defaults to `hot`). */
  oldHot?: string;
  radius: number;
  /** Square-ish pixel UI (for older phones). */
  retro?: boolean;
};

/** Messenger-style screen: earlier lines above, current line typed into a new bubble. */
export const ChatScreen: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  theme: ChatTheme;
  history: string[];
  text: string;
  typedChars: number;
  sinceCue: number;
}> = ({ x, y, w, h, theme, history, text, typedChars, sinceCue }) => {
  const frame = useCurrentFrame();
  const pop = interpolate(sinceCue, [0, 0.25], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const showDots = typedChars < 2 && text.length > 0;
  const typed = text.slice(0, typedChars);

  const renderWords = (s: string, hotColor = theme.hot) =>
    s.split(/(\s+)/).map((part, i) => {
      const hot = HOT_WORDS.has(part.toLowerCase().replace(/[^a-z']/g, ""));
      return hot ? (
        <span key={i} style={{ color: hotColor, fontWeight: 800 }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      );
    });

  const bubbleBase: React.CSSProperties = {
    maxWidth: "86%",
    padding: theme.retro ? "6px 12px" : "10px 18px",
    borderRadius: theme.radius,
    fontSize: theme.fontSize,
    lineHeight: 1.12,
    wordBreak: "break-word",
  };

  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div
        style={{
          width: w,
          height: h,
          background: theme.bg,
          fontFamily: theme.font,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: theme.headerBg,
            color: theme.headerText,
            fontSize: theme.fontSize * 0.62,
            padding: theme.retro ? "4px 10px" : "8px 14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: theme.fontSize * 0.8,
              height: theme.fontSize * 0.8,
              borderRadius: theme.retro ? 4 : "50%",
              background: theme.bubble,
              color: theme.bubbleText,
              fontSize: theme.fontSize * 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            T
          </div>
          {theme.title}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 10,
            padding: 12,
          }}
        >
          {history.map((m, i) => (
            <div
              key={i}
              style={{
                ...bubbleBase,
                alignSelf: "flex-start",
                background: theme.oldBubble,
                color: theme.oldText,
                opacity: i === history.length - 1 ? 0.95 : 0.6,
              }}
            >
              {renderWords(m, theme.oldHot ?? theme.hot)}
            </div>
          ))}
          {text ? (
            <div
              style={{
                ...bubbleBase,
                alignSelf: "flex-end",
                background: theme.bubble,
                color: theme.bubbleText,
                scale: String(0.6 + pop * 0.4),
                opacity: pop,
                transformOrigin: "right bottom",
              }}
            >
              {showDots ? (
                <span style={{ letterSpacing: 6 }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ opacity: Math.floor(frame / 5 + d) % 3 === 0 ? 1 : 0.35 }}>
                      •
                    </span>
                  ))}
                </span>
              ) : (
                renderWords(typed)
              )}
            </div>
          ) : null}
        </div>
      </div>
    </foreignObject>
  );
};
