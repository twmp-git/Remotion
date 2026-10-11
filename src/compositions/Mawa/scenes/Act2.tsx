import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { H, Motes, Vignette, W } from "../world";
import { DissolvingFigure, Landscape, Plane, Scars, qb, qbAngle, roadAt } from "./landscape";

const inOut = Easing.bezier(0.45, 0, 0.2, 1);
const accel = Easing.bezier(0.55, 0, 0.85, 0.35);

export type Act2Times = {
  start: number; // "ndili ndi mabala"
  mabala: number;
  otisachila: number;
  abale: number; // "ndili ndiabale oti anapita"
  ndege1: number;
  anakwera1: number;
  anapita1: number;
  ndege2: number;
  anakwera2: number;
  anapita2: number;
  end: number; // next act
};

const HORIZON = 1060;

/**
 * Golden hour on the road. Friends walk toward the sun; scars tear across the sky and get
 * stitched; the friends dissolve into embers that drift into the sun. Then the sun lifts and
 * paper planes climb toward it — one, then a flock — and vanish into the glow.
 */
export const RoadAndPlanes: React.FC<{ T: Act2Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T.start + frame / fps;
  const lt = t - T.start;

  // Out of the sun again (faster than the opening), then a slow forward drift.
  const pull = interpolate(lt, [0, 1.5], [0, 1], { ...CLAMP, easing: inOut });
  const zoom = interpolate(pull, [0, 1], [9, 1]) * interpolate(t, [T.start + 1.5, T.end], [1, 1.06], CLAMP);
  const land = interpolate(pull, [0.15, 0.5], [0, 1], CLAMP);

  // The sun lifts into the sky as the planes chase it.
  const lift = interpolate(t, [T.ndege1 - 0.3, T.anapita1], [0, 1], { ...CLAMP, easing: inOut });
  const sunY = HORIZON - 40 - lift * 520;
  const sunGlow = 1 + lift * 0.6;
  const cam = { zoom, fx: W / 2, fy: interpolate(pull, [0, 1], [sunY, HORIZON + 80]), ax: W / 2, ay: interpolate(pull, [0, 1], [H / 2, HORIZON + 80]), t };

  // Five friends walking away up the road.
  const friends = [0.8, 0.73, 0.67, 0.61, 0.55].map((u0, i) => {
    const u = u0 - lt * 0.012;
    const p = roadAt(u, HORIZON + 52);
    const side = (i % 2 ? 1 : -1) * p.w * 0.18;
    return { i, x: p.x + side, y: p.y, h: 30 + u ** 1.4 * 330, dissolveAt: T.abale + 0.15 + i * 0.32 };
  });

  // Flight paths: from the road up into the lifted sun.
  const sun = { x: W / 2, y: sunY };
  const single = { p0: roadAt(0.72, HORIZON + 52), p1: { x: W * 0.9, y: 700 } };
  const s1 = interpolate(t, [T.anakwera1 - 0.2, T.anapita1 + 0.35], [0, 1], { ...CLAMP, easing: accel });
  const flock = Array.from({ length: 7 }).map((_, k) => {
    const u = 0.55 + (k / 6) * 0.38;
    const p0 = roadAt(u, HORIZON + 52);
    const p1 = { x: W * (0.1 + random(`fl-${k}`) * 0.8), y: 300 + random(`fly-${k}`) * 600 };
    const st = T.anakwera2 - 0.25 + k * 0.1;
    const s = interpolate(t, [st, T.anapita2 + 0.35 + k * 0.06], [0, 1], { ...CLAMP, easing: accel });
    return { k, p0, p1, s };
  });
  const multipliers = ["1.4x", "2.9x", "6.3x", "17x"];

  const trail = (p0: { x: number; y: number }, p1: { x: number; y: number }, s: number) =>
    `M${Array.from({ length: 24 }, (_, i) => {
      const q = qb(p0, p1, sun, (i / 23) * s);
      return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    }).join(" L")}`;

  const trailFade = (end: number) => interpolate(t, [end, end + 1.2], [0.85, 0], CLAMP);

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Landscape
          id="act2"
          t={t}
          cam={cam}
          mood="golden"
          horizon={HORIZON}
          sunY={sunY}
          sunGlow={sunGlow}
          land={land}
          sky={<Scars id="act2-scars" t={t} start={T.mabala} stitch={T.otisachila} opacity={0.75 * land} />}
        >
          {friends.map((f) => (
            <DissolvingFigure key={f.i} id={`friend-${f.i}`} t={t} x={f.x} y={f.y} h={f.h} dissolveAt={f.dissolveAt} tx={W / 2} ty={HORIZON - 40} walkT={t + f.i} />
          ))}
        </Landscape>

        {/* single plane + multipliers ticking along its path */}
        {s1 > 0 ? (
          <g>
            <path d={trail(single.p0, single.p1, s1)} stroke={MAWA.paperLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={trailFade(T.anapita1 + 0.3)} />
            {multipliers.map((m, i) => {
              const at = (i + 1) / (multipliers.length + 0.6);
              const q = qb(single.p0, single.p1, sun, at);
              const vis = s1 >= at ? interpolate(s1, [at, at + 0.15], [0, 1], CLAMP) * trailFade(T.anapita1) : 0;
              return (
                <text key={m} x={q.x + 34} y={q.y - 20} fontFamily="Anton, Impact, sans-serif" fontSize={54} fill={MAWA.charcoal} opacity={vis}>
                  {m}
                </text>
              );
            })}
            {s1 < 1 ? (
              (() => {
                const q = qb(single.p0, single.p1, sun, s1);
                return <Plane x={q.x} y={q.y} angle={qbAngle(single.p0, single.p1, sun, s1)} size={150 * (1 - s1 * 0.75)} opacity={interpolate(s1, [0.85, 1], [1, 0], CLAMP)} />;
              })()
            ) : null}
          </g>
        ) : null}

        {/* the flock */}
        {flock.map(({ k, p0, p1, s }) =>
          s > 0 ? (
            <g key={k}>
              <path d={trail(p0, p1, s)} stroke={MAWA.paperLight} strokeWidth={7} fill="none" strokeLinecap="round" opacity={trailFade(T.anapita2 + 0.5) * 0.8} />
              {s < 1 ? (
                (() => {
                  const q = qb(p0, p1, sun, s);
                  return <Plane x={q.x} y={q.y} angle={qbAngle(p0, p1, sun, s)} size={110 * (1 - s * 0.75)} opacity={interpolate(s, [0.85, 1], [1, 0], CLAMP)} />;
                })()
              ) : null}
            </g>
          ) : null,
        )}

        <Motes id="act2-motes" t={t} count={36} area={[0, 150, W, 1300]} />
        <Vignette id="act2" amt={0.42} />
      </svg>
    </AbsoluteFill>
  );
};
