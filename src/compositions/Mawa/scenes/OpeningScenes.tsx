import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { Ground, H, PaperPlane, Ripples, Road, Slip, Sun, W, Walker, roadPoint } from "../parts";
import { MAWA } from "../theme";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/**
 * HOOK — opens INSIDE the sun: rays slam out, a multiplier ticks up in the sun's core
 * (the "tomorrow I'll win" fantasy), then the camera rockets back to reveal the cover
 * landscape: winding road, lone walker. `dur` = seconds until the next scene.
 */
export const SunriseHook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const horizon = 860;

  // Camera: start extremely close on the sun core, pull back by ~1.1 s.
  const pull = interpolate(t, [0.15, 1.15], [0, 1], { ...CLAMP, easing: easeOut });
  const zoom = interpolate(pull, [0, 1], [7.5, 1]);
  const camY = interpolate(pull, [0, 1], [380, 0]);
  const rayGrow = interpolate(t, [0, 0.35], [0, 1], { ...CLAMP, easing: Easing.out(Easing.back(2.2)) });
  const spin = interpolate(t, [0, dur], [-0.08, 0.04]);

  // The multiplier fantasy: climbs fast, then freezes as reality pulls back.
  const mult = 1 + (Math.exp(Math.min(t, 1.0) * 2.4) - 1) * 0.9;
  const multOpacity = interpolate(t, [0.9, 1.25], [1, 0], CLAMP);

  const roadReveal = interpolate(t, [0.6, 1.8], [0, 1], { ...CLAMP, easing: easeOut });
  const walkerP = interpolate(t, [0.9, dur], [0.92, 0.62]);
  const wp = roadPoint(walkerP, horizon);

  return (
    <AbsoluteFill style={{ backgroundColor: MAWA.paper }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(${W / 2} ${horizon}) scale(${zoom}) translate(${-W / 2} ${-horizon + camY / zoom})`}>
          <Sun cx={W / 2} horizon={horizon} r={250} rayGrow={rayGrow} spin={spin} />
          <Ground horizon={horizon} />
          <Road horizon={horizon} reveal={roadReveal} />
          <Walker x={wp.x} y={wp.y} h={60 + (1 - walkerP) * 10} phase={t * 9} opacity={interpolate(t, [1.0, 1.4], [0, 1], CLAMP)} />
        </g>
        <text
          x={W / 2}
          y={horizon - 70}
          textAnchor="middle"
          fontFamily="Anton, Impact, sans-serif"
          fontSize={210}
          fill={MAWA.charcoal}
          opacity={multOpacity}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {mult.toFixed(2)}x
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * "Uzagona pampeni, uzafunda nkhawa" — sleeping on a knife's edge, blanketed in worry.
 * Night falls (sun sinks, palette flips), a figure lies on a thin blade under a blanket of slips,
 * worry scribbles loop overhead. At the end the top slip slides off and falls (→ ripple scene).
 */
export const KnifeEdge: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Transition in: circular wipe from the sun's position.
  const wipe = interpolate(t, [0, 0.45], [0, 1], { ...CLAMP, easing: easeIn });
  const bladeY = 1180;
  const sway = Math.sin(t * 2.2) * 3;
  const fall = interpolate(t, [dur - 0.55, dur], [0, 1], { ...CLAMP, easing: easeIn });

  return (
    <AbsoluteFill style={{ backgroundColor: MAWA.charcoal }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <clipPath id="knife-wipe">
            <circle cx={W / 2} cy={860} r={wipe * 2300} />
          </clipPath>
        </defs>
        <g clipPath="url(#knife-wipe)">
          <rect width={W} height={H} fill={MAWA.charcoal} />
          {/* low sunken sun, a sliver on the horizon */}
          <path d={`M${W / 2 - 160} 1560 A 160 160 0 0 1 ${W / 2 + 160} 1560 Z`} fill={MAWA.orangeDeep} opacity={0.6} />
          <rect y={1560} width={W} height={400} fill={MAWA.ink} />
          {/* worry scribbles */}
          {Array.from({ length: 6 }).map((_, i) => {
            const cx = W / 2 + Math.sin(t * 1.6 + i) * 120 + (i - 2.5) * 70;
            const cy = 820 + Math.cos(t * 1.3 + i * 2) * 60 - i * 30;
            const r = 40 + i * 9;
            const rot = (t * 160 + i * 60) % 360;
            return (
              <path
                key={i}
                d={`M${cx - r} ${cy} C${cx - r} ${cy - r * 1.4} ${cx + r} ${cy - r * 1.4} ${cx + r} ${cy} S${cx - r * 0.6} ${cy + r} ${cx - r * 0.2} ${cy - r * 0.3}`}
                fill="none"
                stroke={i % 2 ? MAWA.orange : MAWA.grey}
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.85}
                transform={`rotate(${rot} ${cx} ${cy})`}
              />
            );
          })}
          <g transform={`rotate(${sway} ${W / 2} ${bladeY})`}>
            {/* the blade */}
            <path d={`M80 ${bladeY + 30} L${W - 80} ${bladeY + 30} L${W - 140} ${bladeY + 52} L80 ${bladeY + 52} Z`} fill={MAWA.grey} stroke={MAWA.ink} strokeWidth={5} />
            <path d={`M80 ${bladeY + 30} L${W - 80} ${bladeY + 30}`} stroke="white" strokeWidth={3} opacity={0.8} />
            {/* sleeper: head + body under a blanket of slips */}
            <circle cx={250} cy={bladeY - 4} r={34} fill={MAWA.grey} stroke={MAWA.ink} strokeWidth={5} />
            <path d={`M290 ${bladeY + 30} Q300 ${bladeY - 60} 520 ${bladeY - 50} Q760 ${bladeY - 60} 860 ${bladeY + 30} Z`} fill={MAWA.grey} stroke={MAWA.ink} strokeWidth={5} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Slip key={i} x={340 + i * 95} y={bladeY - 18 + (i % 2) * 10} w={120} rot={-12 + i * 5} seed={`blanket-${i}`} />
            ))}
          </g>
          {/* the top slip slides off and falls toward the water */}
          <Slip
            x={interpolate(fall, [0, 1], [820, W / 2])}
            y={interpolate(fall, [0, 1], [bladeY - 70, H + 200])}
            w={130}
            rot={interpolate(fall, [0, 1], [8, 160])}
            seed="falling"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * "Mvetsera, mvetsera" (listen) — the falling slip hits dark water. Ripples spread on each
 * "mvetsera", then the rings tighten into the sun's disc: match cut back to the landscape.
 */
export const ListenRipples: React.FC<{ dur: number; hits: number[] }> = ({ dur, hits }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cy = 1040;

  // Slip drops in from above and touches the water at 0.35 s.
  const drop = interpolate(t, [0, 0.35], [0, 1], { ...CLAMP, easing: easeIn });
  const sink = interpolate(t, [0.35, 0.9], [0, 1], CLAMP);

  // Closing match cut: rings collapse into a filled orange disc → the sun.
  const collapse = interpolate(t, [dur - 0.6, dur], [0, 1], { ...CLAMP, easing: easeInOut });
  const discR = interpolate(collapse, [0, 1], [0, 250]);
  const dawn = interpolate(collapse, [0.5, 1], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: MAWA.ink }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {/* water surface glints */}
        {Array.from({ length: 18 }).map((_, i) => (
          <rect
            key={i}
            x={random(`gx${i}`) * W}
            y={cy - 500 + random(`gy${i}`) * 1000}
            width={40 + random(`gw${i}`) * 80}
            height={4}
            rx={2}
            fill={MAWA.grey}
            opacity={0.1 + 0.15 * Math.sin(t * 3 + i)}
          />
        ))}
        {[0.35, ...hits].map((h, i) => (
          <Ripples key={i} cx={W / 2} cy={cy} t={interpolate(t, [h, h + 1.6], [0, 1], CLAMP)} maxR={620 + i * 80} color={i === 0 ? MAWA.grey : MAWA.orange} />
        ))}
        <g opacity={1 - sink}>
          <Slip x={W / 2} y={interpolate(drop, [0, 1], [-200, cy])} w={130} rot={160 + drop * 40} seed="falling" scorch={sink} />
        </g>
        {/* the sun re-forms from the rings */}
        <ellipse cx={W / 2} cy={cy} rx={discR} ry={discR * interpolate(collapse, [0, 1], [0.32, 1])} fill={MAWA.orange} />
        <rect width={W} height={H} fill={MAWA.paper} opacity={dawn * 0} />
        <g transform={`translate(${W / 2} ${cy - 330}) rotate(-24)`} opacity={interpolate(t, [0.6, 1.0, dur - 0.7, dur - 0.4], [0, 0.9, 0.9, 0], CLAMP)}>
          <PaperPlane size={70} color={MAWA.grey} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
