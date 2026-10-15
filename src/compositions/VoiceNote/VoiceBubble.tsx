import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../../theme/theme";
import { CLAMP } from "../../utils/animation";
import { useResponsive } from "../../utils/useResponsive";

const BARS = 44;
/** Seconds at the end where playback has finished (play icon, total length shown). */
const END_HOLD = 0.4;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/** Deterministic, speech-like bar heights in 0..1. */
const barHeights = Array.from({ length: BARS }, (_, i) => {
  const envelope = 0.55 + 0.45 * Math.sin((i / BARS) * Math.PI * 3.1 + 0.6) ** 2;
  return Math.max(0.12, envelope * (0.35 + 0.65 * random(`bar-${i}`)));
});

/** WhatsApp-style voice-note bubble: play/pause, waveform with playhead, elapsed timer, sent time. */
export const VoiceBubble: React.FC<{ color: string; sentAt: string; durationSeconds: number }> = ({
  color,
  sentAt,
  durationSeconds,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { s } = useResponsive();

  const playEnd = durationInFrames - Math.round(END_HOLD * fps);
  const finished = frame >= playEnd;
  const p = interpolate(frame, [0, playEnd], [0, 1], CLAMP);
  const elapsed = finished ? durationSeconds : Math.min(durationSeconds, frame / fps);

  const width = s(540);
  const height = s(170);
  const waveLeft = s(112);
  const waveRight = s(44);
  const waveWidth = width - waveLeft - waveRight;
  const waveMid = s(66);
  const step = waveWidth / BARS;
  const headX = waveLeft + (finished ? 0 : p) * waveWidth;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: color,
        borderRadius: s(14),
        boxShadow: `0 ${s(14)}px ${s(36)}px rgba(0,0,0,0.35)`,
        fontFamily: fonts.body,
        color: "white",
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* play / pause */}
        {finished ? (
          <path
            d={`M${s(40)} ${waveMid - s(20)} L${s(72)} ${waveMid} L${s(40)} ${waveMid + s(20)} Z`}
            fill="white"
          />
        ) : (
          <g fill="white">
            <rect x={s(40)} y={waveMid - s(19)} width={s(11)} height={s(38)} rx={s(2)} />
            <rect x={s(60)} y={waveMid - s(19)} width={s(11)} height={s(38)} rx={s(2)} />
          </g>
        )}
        {/* waveform */}
        {barHeights.map((h, i) => {
          const x = waveLeft + i * step + step * 0.2;
          const bh = s(8) + h * s(54);
          const played = !finished && x + step * 0.3 < headX;
          return (
            <rect
              key={i}
              x={x}
              y={waveMid - bh / 2}
              width={step * 0.55}
              height={bh}
              rx={step * 0.27}
              fill="white"
              opacity={played ? 1 : 0.5}
            />
          );
        })}
        {/* playhead */}
        <circle cx={headX} cy={waveMid} r={s(13)} fill="white" />
        {/* sent tick */}
        <path
          d={`M${width - s(46)} ${s(134)} l${s(8)} ${s(8)} l${s(16)} ${-s(17)}`}
          fill="none"
          stroke="white"
          strokeWidth={s(3.2)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: waveLeft,
          top: s(116),
          fontSize: s(27),
          opacity: 0.85,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(elapsed)}
      </div>
      <div
        style={{
          position: "absolute",
          right: s(58),
          top: s(116),
          fontSize: s(27),
          opacity: 0.9,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {sentAt}
      </div>
    </div>
  );
};
