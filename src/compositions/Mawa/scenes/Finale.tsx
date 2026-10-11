import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { H, Sheet, Vignette, W, roadAt, wobble, Figure, Motes } from "../world";
import { FlameTongue } from "./Act4";
import { Landscape, camTransform, type Cam } from "./landscape";

const inOut = Easing.bezier(0.45, 0, 0.2, 1);
const easeIn = Easing.bezier(0.6, 0, 0.95, 0.4);

export type FinaleTimes = {
  start: number; // "ine ndiye ndililanso" — flames recede, letters rise
  hits: number[]; // "mawa, mawa, mawa"
  reveal: number; // "ndililanso mawa" — pull back to the full cover
  sunPulses: number[]; // every later "mawa"
  rain: number[]; // "ndililanso" — slips drift down
  lastMawa: number;
  end: number;
};

const HORIZON = 840;
const LETTERS = [
  { ch: "M", dx: -330, rot: -6, dy: 10 },
  { ch: "A", dx: -105, rot: 4, dy: -24 },
  { ch: "W", dx: 120, rot: -3, dy: 6 },
  { ch: "A", dx: 335, rot: 7, dy: -16 },
];

/** Smooth decaying impulse after time `at`. */
const kick = (t: number, at: number, dur: number) => (t < at ? 0 : Math.exp(-(t - at) / dur) * Math.min(1, (t - at) / 0.04));

/**
 * The cover, alive: flames sink to reveal the jagged MAWA letters; three hits on "mawa, mawa, mawa";
 * the camera pulls back to the whole tableau — sun, road, lone walker, letters in fire, slips.
 * Each later "mawa" the sun tries to rise and sinks back. On the last one it finally rises and
 * the camera pushes into it — the same full-orange frame the video opens on (seamless loop).
 */
export const Finale: React.FC<{ T: FinaleTimes }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T.start + frame / fps;
  const lt = t - T.start;

  const punch = T.hits.reduce((a, h) => a + kick(t, h, 0.22), 0);
  const sunTry = T.sunPulses.reduce((a, h) => a + kick(t, h, 0.9) * 0.9, 0);
  const finalRise = interpolate(t, [T.lastMawa - 0.25, T.lastMawa + 0.8], [0, 1], { ...CLAMP, easing: inOut });
  const sunY = HORIZON - 30 - sunTry * 70 - finalRise * 380;

  // Camera keyframes: close on the letters → full cover → push into the risen sun.
  const out = interpolate(t, [T.reveal, T.reveal + 2.6], [0, 1], { ...CLAMP, easing: inOut });
  const dive = interpolate(t, [T.lastMawa + 0.2, T.end - 0.12], [0, 1], { ...CLAMP, easing: easeIn });
  // the camera locks onto the risen sun quickly, then the zoom does the rest
  const lock = interpolate(t, [T.lastMawa + 0.1, T.lastMawa + 0.8], [0, 1], { ...CLAMP, easing: inOut });
  const closeZoom = 1.2 + lt * 0.015;
  let zoom = interpolate(out, [0, 1], [closeZoom, 1]) * (1 + interpolate(t, [T.reveal + 2.6, T.lastMawa], [0, 0.04], CLAMP));
  zoom *= 1 + punch * 0.07;
  zoom = zoom * (1 - dive) + 16 * dive;
  const fy = interpolate(out, [0, 1], [1450, H / 2]) * (1 - lock) + sunY * lock;
  const ay = interpolate(out, [0, 1], [1290, H / 2]);
  const cam: Cam = { zoom, fx: W / 2, fy, ax: W / 2, ay, t };

  const recede = interpolate(t, [T.start, T.start + 0.9], [1, 0], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const lettersUp = interpolate(t, [T.start + 0.1, T.start + 1.1], [1, 0], { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const flash = T.hits.reduce((a, h) => a + kick(t, h, 0.08), 0);
  const burst = punch;

  const walkerU = interpolate(t, [T.start, T.end], [0.42, 0.3]);
  const wp = roadAt(walkerU, HORIZON + 52);

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <filter id="jag" x="-10%" y="-10%" width="120%" height="130%">
            <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={22} />
          </filter>
        </defs>
        <Landscape id="finale" t={t} cam={cam} mood="day" horizon={HORIZON} sunY={sunY} sunR={215} sunGlow={1 + sunTry * 0.8 + finalRise} rayGrow={1 + sunTry * 0.25}>
          <Figure x={wp.x} y={wp.y} h={30 + walkerU ** 1.4 * 200} t={t} />
        </Landscape>

        <g transform={camTransform(cam, 0.95)}>
          {/* ray burst behind the letters on each hit */}
          {burst > 0.02
            ? Array.from({ length: 18 }, (_, i) => {
                const a = (i / 18) * Math.PI * 2 + lt * 0.4;
                const r0 = 260;
                const r1 = r0 + burst * 520;
                return <line key={i} x1={W / 2 + Math.cos(a) * r0} y1={1420 + Math.sin(a) * r0} x2={W / 2 + Math.cos(a) * r1} y2={1420 + Math.sin(a) * r1} stroke={MAWA.orange} strokeWidth={26} opacity={Math.min(1, burst)} />;
              })
            : null}
          {/* back flames around the letters */}
          {Array.from({ length: 7 }, (_, i) => (
            <FlameTongue key={`fb${i}`} x={140 + i * 135} y={1700} w={190} h={300 + (i % 3) * 110 + 40 * wobble(t, i)} t={t} seed={i + 60} />
          ))}
          <g transform={`translate(0 ${lettersUp * 700})`} filter="url(#jag)">
            {LETTERS.map((L, i) => (
              <text
                key={i}
                x={W / 2 + L.dx}
                y={1600 + L.dy}
                textAnchor="middle"
                fontFamily="Anton, Impact, sans-serif"
                fontSize={360}
                fill={MAWA.grey}
                stroke={MAWA.ink}
                strokeWidth={12}
                paintOrder="stroke fill"
                transform={`rotate(${L.rot} ${W / 2 + L.dx} 1450)`}
              >
                {L.ch}
              </text>
            ))}
          </g>
          {/* front flames + slips, like the cover */}
          {Array.from({ length: 6 }, (_, i) => (
            <FlameTongue key={`ff${i}`} x={200 + i * 135} y={1780} w={170} h={220 + (i % 2) * 120 + 30 * wobble(t, i + 5)} t={t} seed={i + 80} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <Sheet key={i} x={120 + (i % 8) * 120 + (i > 7 ? 60 : 0)} y={1800 + (i > 7 ? 90 : 0) + random(`fs${i}`) * 30} w={170} rot={(random(`fr${i}`) - 0.5) * 50} tilt={0.7} seed={`fin-${i}`} />
          ))}
        </g>

        {/* the receding wall of fire from the previous scene */}
        {recede > 0
          ? Array.from({ length: 8 }, (_, i) => (
              <FlameTongue key={`r${i}`} x={-60 + i * 170} y={H + 80} w={320} h={recede * (2400 + (i % 3) * 300)} t={t} seed={i + 40} />
            ))
          : null}

        {/* slips drifting down on "ndililanso" */}
        {T.rain.flatMap((r0, k) =>
          Array.from({ length: 10 }, (_, i) => {
            const p = interpolate(t, [r0 + i * 0.12, r0 + 3.4 + i * 0.12], [0, 1], CLAMP);
            if (p <= 0 || p >= 1) return null;
            const x = random(`rain-${k}-${i}`) * W + wobble(t, i) * 60;
            const y = -200 + p * (H + 400);
            return <Sheet key={`${k}-${i}`} x={x} y={y} w={90 + random(`rw-${k}-${i}`) * 60} rot={wobble(t * 0.8, i + k) * 60 + p * 90} tilt={0.3 + 0.7 * Math.abs(Math.cos(t * 2 + i))} seed={`rain-${k}-${i}`} />;
          }),
        )}

        <Motes id="finale-motes" t={t} count={30} area={[0, 150, W, 1200]} />
        <rect width={W} height={H} fill={MAWA.paperLight} opacity={Math.min(0.6, flash * 0.6)} />
        <rect width={W} height={H} fill={MAWA.orange} opacity={interpolate(t, [T.start, T.start + 0.25], [1, 0], CLAMP)} />
        <Vignette id="finale" amt={0.4 * (1 - dive)} />
      </svg>
    </AbsoluteFill>
  );
};
