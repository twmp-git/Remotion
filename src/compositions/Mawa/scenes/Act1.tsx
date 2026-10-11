import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";
import { MAWA } from "../theme";
import { GlowSun, H, Haze, Hill, Motes, Sheet, Sky, SunRoad, Figure, Vignette, W, roadAt, wobble } from "../world";

const inOut = Easing.bezier(0.45, 0, 0.2, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const inn = Easing.bezier(0.55, 0, 0.9, 0.4);

/** Smooth 0→1→0 bump between a and b. */
const bump = (t: number, a: number, b: number) => {
  const u = interpolate(t, [a, b], [0, 1], CLAMP);
  return Math.sin(u * Math.PI) ** 2;
};

export type Act1Times = {
  /** clip seconds */
  zalelo: number;
  mawa: number;
  breakdown: number; // music drops out
  beatBack: number; // "Uzagona" — beat returns (slip hits the surface)
  pampeni: number;
  uzafunda: number;
  mwetsera: number;
  mvetsera: number;
  nextLine: number; // "ndili ndi mabala" — next act
};

export const IMPACT = { x: W / 2, y: 1500 };

/**
 * DAWN — opens inside the sun (multiplier fantasy), long eased pull-back into the cover
 * landscape, a whole day passes on "mawa", then the breakdown drains the colour and a
 * single slip tumbles down and drops into the road like water.
 */
export const Dawn: React.FC<{ T: Act1Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const horizon = 1060;
  const sunY = horizon - 40;

  // Camera: from deep inside the sun to the full landscape, then a slow dolly.
  const pull = interpolate(t, [0.25, 2.8], [0, 1], { ...CLAMP, easing: inOut });
  const dolly = interpolate(t, [2.8, T.beatBack], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const zoom = interpolate(pull, [0, 1], [9, 1]) * (1 + dolly * 0.1);
  const fx = W / 2;
  const fy = interpolate(pull, [0, 1], [H / 2, sunY + 120]);
  // landscape fades up as we leave the sun, so the first frames are pure sunlight
  const land = interpolate(pull, [0.18, 0.5], [0, 1], CLAMP);
  const cam = (depth: number) => {
    const z = 1 + (zoom - 1) * (0.75 + depth * 0.5);
    const drift = wobble(t * 0.35, depth * 3) * 14 * depth;
    return `translate(${fx + drift} ${fy}) scale(${z}) translate(${-fx} ${-fy})`;
  };

  // "Mawa": a whole day passes — the sun sets behind the hills and rises again.
  const day = bump(t, T.mawa - 0.35, T.mawa + 0.95);
  const sunDip = day * 520;
  const nightTint = day * 0.55;

  // Breakdown: colour drains, time slows.
  const drain = interpolate(t, [T.breakdown, T.breakdown + 1.2], [0, 1], { ...CLAMP, easing: inOut });
  const slowT = t < T.breakdown ? t : T.breakdown + (t - T.breakdown) * 0.3;

  // Multiplier fantasy inside the sun.
  const mult = 1 + (Math.exp(Math.min(t, 1.7) * 1.55) - 1) * 0.85;
  const multFade = interpolate(t, [1.2, 2.0], [1, 0], CLAMP);
  const rayGrow = interpolate(t, [0, 0.9], [0.15, 1], { ...CLAMP, easing: Easing.out(Easing.back(1.6)) });

  // The slip: appears high in the breakdown, tumbles, then drops into the road.
  const slipIn = interpolate(t, [T.breakdown + 0.6, T.breakdown + 1.2], [0, 1], CLAMP);
  const hang = interpolate(t, [T.breakdown + 0.6, T.beatBack - 0.45], [0, 1], { ...CLAMP, easing: out });
  const drop = interpolate(t, [T.beatBack - 0.45, T.beatBack], [0, 1], { ...CLAMP, easing: inn });
  const slipY = interpolate(hang, [0, 1], [-160, 720]) + drop * (IMPACT.y - 720);
  const slipX = IMPACT.x + wobble(t * 0.8, 2) * 60 * (1 - drop);
  const flip = Math.cos(t * 3.2);
  const afterImpact = t >= T.beatBack;

  const walkerU = interpolate(t, [2, T.beatBack], [0.42, 0.3]);
  const wp = roadAt(walkerU, horizon);

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Sky id="dawn" top="#C9C4B7" bottom={MAWA.paperLight} glowY={sunY / H} glowAmt={0.6 * (1 - drain)} />
        <g transform={cam(0)}>
          <g transform={`translate(0 ${sunDip})`}>
            <GlowSun id="dawn-sun" cx={W / 2} cy={sunY} r={230} t={t} rayGrow={rayGrow} spin={t * 0.03} dim={drain * 0.75} />
          </g>
        </g>
        <g transform={cam(0.2)} opacity={land}>
          <Hill id="far" baseY={horizon - 18} amp={34} freq={1.3} phase={0.4} fill="#5A5650" rim="#7A746B" />
          <Haze id="far" y={horizon - 10} h={160} amt={0.35 * (1 - drain * 0.5)} />
        </g>
        <g transform={cam(0.45)} opacity={land}>
          <Hill id="mid" baseY={horizon + 30} amp={40} freq={0.9} phase={2.2} fill="#3B3936" rim="#57524B" />
        </g>
        <g transform={cam(0.75)} opacity={land}>
          <path d={`M-300 ${horizon + 90} Q${W / 2} ${horizon + 20} ${W + 300} ${horizon + 90} L${W + 300} ${H + 600} L-300 ${H + 600} Z`} fill={MAWA.charcoal} />
          <SunRoad id="dawn-road" horizon={horizon + 52} sway={wobble(t * 0.2, 1) * 0.1} />
          <Figure x={wp.x} y={wp.y} h={70} t={t} opacity={interpolate(t, [2.2, 2.9], [0, 1], CLAMP) * (1 - drain * 0.6)} shadow={1 + day} />
        </g>
        <Motes id="dawn-motes" t={slowT} count={40} area={[0, 200, W, 1300]} />
        {/* a day passing: warm dusk, then night, then dawn again */}
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#C2611E" opacity={nightTint * 0.9} style={{ mixBlendMode: "multiply" }} />
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#1A120E" opacity={nightTint * 0.55} />
        {/* breakdown drains colour toward paper */}
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={MAWA.paper} opacity={drain * 0.32} style={{ mixBlendMode: "saturation" }} />
        {!afterImpact ? (
          <g opacity={slipIn}>
            <Sheet x={slipX} y={slipY} w={150 + drop * 40} rot={wobble(t, 4) * 25 + t * 20} tilt={0.25 + 0.75 * Math.abs(flip)} seed="hero-slip" />
          </g>
        ) : null}
        <text
          x={W / 2}
          y={H / 2 + 70}
          textAnchor="middle"
          fontFamily="Anton, Impact, sans-serif"
          fontSize={230}
          fill={MAWA.charcoal}
          opacity={multFade}
          style={{ fontVariantNumeric: "tabular-nums", filter: `blur(${(1 - multFade) * 18}px)` }}
          transform={`translate(${W / 2} ${H / 2}) scale(${1 + t * 0.06}) translate(${-W / 2} ${-H / 2})`}
        >
          {mult.toFixed(2)}x
        </text>
        <Vignette id="dawn" amt={0.45} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * NIGHT SEA — "Uzagona pampeni, uzafunda nkhawa".
 * Revealed by a ripple from where the slip dropped. A thin crescent hangs like a blade;
 * below, a sea of paper heaves like a restless blanket, warm worry glowing between the sheets.
 * On "uzafundankhawa" the sea rises over the camera (blanket pulled up).
 */
export const NightSea: React.FC<{ T: Act1Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lt = frame / fps; // local seconds
  const t = T.beatBack + lt; // clip seconds

  // Ripple reveal.
  const rr = interpolate(lt, [0, 1.1], [0, 2400], { ...CLAMP, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  const ripplePath = Array.from({ length: 73 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r = rr * (1 + 0.035 * Math.sin(a * 9 + lt * 14)) ;
    return `${IMPACT.x + Math.cos(a) * r} ${IMPACT.y + Math.sin(a) * r * 0.62}`;
  }).join(" L");

  const rock = Math.sin(lt * 0.9) * 1.6;
  const push = interpolate(t, [T.beatBack, T.uzafunda], [1, 1.08]);
  const glint = bump(t, T.pampeni - 0.1, T.pampeni + 0.7);
  const rise = interpolate(t, [T.uzafunda + 0.2, T.mwetsera], [0, 1], { ...CLAMP, easing: Easing.bezier(0.5, 0, 0.75, 0.2) });

  const rows = 7;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <clipPath id="ripple-reveal">
            <path d={`M${ripplePath} Z`} />
          </clipPath>
          <radialGradient id="worry-glow" cx="0.5" cy="1" r="0.7">
            <stop offset="0" stopColor={MAWA.orange} stopOpacity={0.75} />
            <stop offset="1" stopColor={MAWA.orange} stopOpacity={0} />
          </radialGradient>
          <mask id="crescent">
            <circle cx={700} cy={470} r={130} fill="white" />
            <circle cx={748} cy={440} r={118} fill="black" />
          </mask>
          <filter id="moon-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
        </defs>
        <g clipPath="url(#ripple-reveal)">
          <g transform={`rotate(${rock} ${W / 2} ${H / 2}) translate(${W / 2} ${H / 2}) scale(${push}) translate(${-W / 2} ${-H / 2})`}>
            <Sky id="night" top="#0F0F10" bottom="#2E2B28" glow={MAWA.orange} glowY={0.95} glowAmt={0.35} />
            {Array.from({ length: 22 }).map((_, i) => (
              <circle key={i} cx={random(`st${i}`) * W} cy={random(`sy${i}`) * 820} r={1.5 + random(`sr${i}`) * 2} fill={MAWA.paperLight} opacity={0.25 + 0.3 * Math.sin(lt * 1.5 + i)} />
            ))}
            {/* blade-thin crescent with a travelling glint */}
            <g mask="url(#crescent)">
              <circle cx={700} cy={470} r={130} fill={MAWA.paperLight} />
            </g>
            <g mask="url(#crescent)" opacity={0.35 + glint * 0.65}>
              <circle cx={700} cy={470} r={150} fill="white" filter="url(#moon-bloom)" />
            </g>
            {/* worry glow beneath the paper */}
            <rect x={-200} y={950} width={W + 400} height={1150} fill="url(#worry-glow)" opacity={0.85 + 0.15 * Math.sin(lt * 2.4)} />
            {/* the paper sea, far rows first; warm worry-light glows up between rows */}
            {Array.from({ length: rows }).map((_, r) => {
              const depth = r / (rows - 1);
              const w = 110 + depth * 230;
              const spacing = w * 1.02;
              const y0 = 1000 + depth ** 1.2 * 820 - rise * (300 + depth * 1400);
              const drift = (lt * (8 + depth * 26)) % spacing;
              const n = Math.ceil((W + 2 * spacing) / spacing) + 1;
              return (
                <g key={r}>
                  <ellipse cx={W / 2} cy={y0 + 30} rx={W * 0.75} ry={60 + depth * 70} fill={MAWA.orange} opacity={0.18 + 0.1 * Math.sin(lt * 2 + r)} filter="url(#moon-bloom)" />
                  {Array.from({ length: n }).map((__, i) => {
                    const k = `sea-${r}-${i}`;
                    const jx = (random(`${k}-jx`) - 0.5) * w * 0.5;
                    const jy = (random(`${k}-jy`) - 0.5) * (30 + depth * 50);
                    const size = 0.78 + random(`${k}-s`) * 0.44;
                    const x = -spacing + i * spacing + drift + (r % 2) * spacing * 0.5 + jx;
                    const heave = Math.sin(lt * 1.25 + i * 0.75 + r * 0.9) * (14 + depth * 40);
                    const rot = (random(`${k}-r`) - 0.5) * 30 + Math.sin(lt * 0.95 + i * 1.3 + r * 2.1) * (8 + depth * 8);
                    const shade = 14 + depth ** 1.4 * 70 + (random(`${k}-t`) - 0.5) * 14;
                    return (
                      <Sheet
                        key={i}
                        x={x}
                        y={y0 + heave + jy}
                        w={w * size * (1 + rise * depth * 0.8)}
                        rot={rot}
                        tilt={0.4 + depth * 0.28 + Math.sin(lt * 1.1 + i) * 0.06}
                        lit={0.3 + depth * 0.7}
                        seed={k}
                        tone={`color-mix(in srgb, #E8E4DA ${Math.round(shade)}%, #1E1B19)`}
                      />
                    );
                  })}
                </g>
              );
            })}
            <Motes id="night-motes" t={t} count={26} color="#F7B46E" rise={30} area={[0, 900, W, 1000]} />
          </g>
          {/* the blanket closes over the lens */}
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#E8E4DA" opacity={interpolate(rise, [0.75, 1], [0, 1], CLAMP)} />
        </g>
        {/* ripple rings at the reveal edge */}
        {[1, 0.82, 0.66].map((k, i) => (
          <ellipse key={i} cx={IMPACT.x} cy={IMPACT.y} rx={rr * k} ry={rr * k * 0.62} fill="none" stroke={MAWA.paperLight} strokeWidth={8 - i * 2} opacity={interpolate(lt, [0, 1.1], [0.9, 0], CLAMP)} />
        ))}
        <Vignette id="night" amt={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * LISTEN — "Mwetsera, mvetsera". Under the blanket: darkness, then rings of light pulse
 * out like a heartbeat on each word. The rings fold back into a glowing core that swells
 * into the sun (match cut into the next act).
 */
export const Listen: React.FC<{ T: Act1Times }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lt = frame / fps;
  const t = T.mwetsera + lt;
  const cy = 940;
  const lightsOut = interpolate(lt, [0, 0.45], [1, 0], { ...CLAMP, easing: out });
  const swell = interpolate(t, [T.nextLine - 1.0, T.nextLine], [0, 1], { ...CLAMP, easing: Easing.bezier(0.6, 0, 0.4, 1) });
  const core = 34 + 10 * Math.sin(t * 6) * (1 - swell) + swell * 1500;
  const pulses = [T.mwetsera, T.mvetsera];

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={10} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="core-glow">
            <stop offset="0" stopColor="#F7B46E" stopOpacity={0.9} />
            <stop offset="1" stopColor={MAWA.orange} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={MAWA.ink} />
        <circle cx={W / 2} cy={cy} r={420 + swell * 1400} fill="url(#core-glow)" opacity={0.35 + swell * 0.65} />
        {pulses.map((p, k) =>
          [0, 0.12, 0.24, 0.36].map((d, i) => {
            const u = interpolate(t, [p + d, p + d + 2.1], [0, 1], { ...CLAMP, easing: out });
            if (u <= 0) return null;
            const fold = interpolate(t, [T.nextLine - 1.0, T.nextLine - 0.3], [1, 0], CLAMP);
            return (
              <circle
                key={`${k}-${i}`}
                cx={W / 2}
                cy={cy}
                r={(60 + u * (720 + k * 160)) * fold}
                fill="none"
                stroke={i % 2 ? MAWA.orange : "#F7B46E"}
                strokeWidth={14 - i * 2.5}
                opacity={(1 - u) * 0.95 + 0.05}
                filter="url(#ring-glow)"
              />
            );
          }),
        )}
        <circle cx={W / 2} cy={cy} r={core} fill={MAWA.orange} />
        <Motes id="listen-motes" t={t} count={30} color="#F7B46E" rise={12} />
        <rect width={W} height={H} fill="#E8E4DA" opacity={lightsOut} />
        <Vignette id="listen" amt={0.7 * (1 - swell)} />
      </svg>
    </AbsoluteFill>
  );
};
