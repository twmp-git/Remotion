import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { Figure, H, Motes, Sheet, Vignette, W } from "../world";
import { Landscape, Plane, Scars, roadAt } from "./landscape";

const inOut = Easing.bezier(0.45, 0, 0.2, 1);
const easeIn = Easing.bezier(0.6, 0, 0.9, 0.5);

export type Act3Times = {
  start: number; // "ndili ndi mabala" (repeat)
  mabala: number;
  abale: number;
  irisAt: number; // vortex → dusk reveal
  whipAt: number; // whip down to the fire
  end: number;
};

const HORIZON = 1060;
const SUN = { x: W / 2, y: HORIZON - 40 - 520 };

/**
 * The contrails twist into a vortex around the lifted sun; the camera spirals in.
 * Slips and planes orbit inward and are swallowed by the light.
 */
export const Vortex: React.FC<{ T: Act3Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T.start + frame / fps;
  const lt = t - T.start;
  const dive = interpolate(t, [T.start + 0.2, T.irisAt + 0.2], [0, 1], { ...CLAMP, easing: easeIn });
  const zoom = 1.06 * (1 + dive * 9);
  const rot = dive * 140;
  const cam = { zoom, fx: SUN.x, fy: SUN.y, ax: W / 2, ay: interpolate(dive, [0, 1], [SUN.y + 0.06 * (SUN.y - HORIZON), H / 2]), rot, t };
  const arms = 6;
  const grow = interpolate(lt, [0, 0.9], [0, 1], { ...CLAMP, easing: inOut });

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Landscape id="vortex" t={t} cam={cam} mood="golden" horizon={HORIZON} sunY={SUN.y} sunGlow={1.6 + dive}>
          {null}
        </Landscape>
        <g transform={`translate(${W / 2} ${cam.ay}) rotate(${rot}) scale(${1 + dive * 4}) translate(${-SUN.x} ${-SUN.y})`}>
          {Array.from({ length: arms }).map((_, a) => {
            const pts = Array.from({ length: 80 }, (_, i) => {
              const th = (i / 79) * Math.PI * 3.4;
              const r = 70 * Math.exp(0.21 * th) * (0.4 + grow * 0.6);
              const ang = th + (a / arms) * Math.PI * 2 + lt * 1.6;
              return `${(SUN.x + Math.cos(ang) * r).toFixed(1)} ${(SUN.y + Math.sin(ang) * r).toFixed(1)}`;
            });
            return <path key={a} d={`M${pts.join(" L")}`} stroke={a % 2 ? MAWA.orange : MAWA.paperLight} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.75 * grow} />;
          })}
          {Array.from({ length: 16 }).map((_, i) => {
            const p = interpolate(lt, [i * 0.07, 1.9 + i * 0.07], [0, 1], { ...CLAMP, easing: easeIn });
            if (p >= 1) return null;
            const r = (900 + random(`vx-r${i}`) * 500) * (1 - p);
            const ang = random(`vx-a${i}`) * Math.PI * 2 + p * 7;
            const x = SUN.x + Math.cos(ang) * r;
            const y = SUN.y + Math.sin(ang) * r;
            return i % 3 === 0 ? (
              <Plane key={i} x={x} y={y} angle={(ang * 180) / Math.PI + 100} size={90 * (1 - p * 0.8)} opacity={1 - p * 0.6} />
            ) : (
              <Sheet key={i} x={x} y={y} w={120 * (1 - p * 0.8)} rot={(ang * 180) / Math.PI + p * 200} seed={`vx-${i}`} />
            );
          })}
        </g>
        {/* the light swallows everything just before the reveal */}
        <rect width={W} height={H} fill="#F2A35C" opacity={interpolate(t, [T.irisAt - 0.45, T.irisAt], [0, 1], CLAMP)} />
        <Vignette id="vortex" amt={0.35 * (1 - dive)} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Dusk. The same road, now empty: footprints, a few embers where the friends were,
 * one lone figure left facing the low sun. Stitched scars across the sky.
 * Ends with a fast vertical whip down to the fire.
 */
export const DuskRoad: React.FC<{ T: Act3Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T.irisAt + frame / fps;
  const lt = t - T.irisAt;
  const iris = interpolate(lt, [0, 0.75], [0, 2300], { ...CLAMP, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  const push = interpolate(t, [T.irisAt, T.whipAt], [1.12, 1], { ...CLAMP, easing: inOut });
  const whip = interpolate(t, [T.whipAt, T.whipAt + 0.3], [0, 1], { ...CLAMP, easing: easeIn });
  const cam = { zoom: push, fx: W / 2, fy: HORIZON + 60, t };

  const footprints = Array.from({ length: 16 }, (_, i) => {
    const u = 0.9 - i * 0.032;
    const p = roadAt(u, HORIZON + 52);
    const side = (i % 2 ? 1 : -1) * p.w * 0.06;
    const s = 0.2 + u ** 1.4 * 1.6;
    return { x: p.x + side, y: p.y, s };
  });
  const embers = [0.8, 0.73, 0.67, 0.61, 0.55].map((u, i) => ({ ...roadAt(u - 0.04, HORIZON + 52), i }));

  return (
    <AbsoluteFill style={{ translate: `0 ${-whip * H * 1.05}px`, filter: `blur(${whip * 18}px)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <clipPath id="dusk-iris">
            <circle cx={W / 2} cy={H / 2} r={iris} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="#F2A35C" />
        <g clipPath="url(#dusk-iris)">
          <Landscape
            id="dusk"
            t={t}
            cam={cam}
            mood="dusk"
            horizon={HORIZON}
            sunY={HORIZON + 30}
            sunR={250}
            rayGrow={0.7}
            sky={<Scars id="dusk-scars" t={t} start={T.irisAt - 5} stitch={T.irisAt - 5} opacity={0.5} />}
          >
            {footprints.map((f, i) => (
              <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
                <ellipse cx={0} cy={0} rx={6} ry={10} fill={MAWA.ink} opacity={0.55} />
              </g>
            ))}
            {embers.map((e) => (
              <circle key={e.i} cx={e.x} cy={e.y - 4} r={4 + 2 * Math.sin(t * 3 + e.i)} fill="#F7B46E" opacity={0.6 + 0.4 * Math.sin(t * 2.3 + e.i * 1.7)} />
            ))}
            <Figure x={W * 0.6} y={1900} h={560} t={0} color="#2E2725" shadow={0.2} />
          </Landscape>
          <Motes id="dusk-motes" t={t} count={30} color="#F7B46E" rise={10} area={[0, 300, W, 1200]} />
        </g>
        <Vignette id="dusk" amt={0.6} />
      </svg>
    </AbsoluteFill>
  );
};
