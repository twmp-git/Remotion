# AGENTS.md — Remotion motion graphics project

Instructions for AI coding agents (Claude Code, Codex, Cursor, …) working in this repo.
Remotion **4.0.534** · React 19 · TypeScript · npm.

## Before you start

- Detailed, version-matched Remotion knowledge lives in **`.agents/skills/`** (also symlinked
  into `.claude/skills/`). Load `remotion-best-practices` first; it routes to the right sub-skill
  (`remotion-markup` for animation, `remotion-render` for export, `remotion-captions`, etc.).
- Official docs: https://www.remotion.dev/docs — API reference: https://www.remotion.dev/docs/api
- The user may edit files themselves, or in Remotion Studio, which writes back to code. If code changed
  unexpectedly, treat it as intentional.

## Golden rules (rendering correctness)

1. **Every animation is a pure function of `useCurrentFrame()`.** Use `interpolate()`, `spring()`
   or the helpers in `src/utils/animation.ts`.
2. **Never** use CSS `transition`/`animation`, Tailwind `animate-*`, `setTimeout`, `requestAnimationFrame`
   or `Math.random()`. They flicker or are non-deterministic in renders. Use `random(seed)` from `remotion`.
3. **Author time in seconds, convert with `sec(seconds, fps)`** (from `src/config/video.ts`), so changing
   fps keeps the motion speed the same.
4. Always clamp interpolations (`CLAMP` from `src/utils/animation.ts`) unless you want overshoot.
5. Prefer the `scale` / `translate` / `rotate` CSS properties over `transform` strings.
6. Assets go in `public/` and are referenced with `staticFile("path/in/public")`.
7. Install Remotion packages with **`npx remotion add <pkg>`** so versions stay pinned to 4.0.534.
   Every `@remotion/*` package must be the same version as `remotion`.
8. Size text with `useResponsive().s(px)` (designed against 1920×1080), so the composition works in any format.
   Minimum sizes at 1080p: headline ≈ 84 px, supporting text ≈ 44 px. Keep key content ≥ 100 px from edges.

## Project layout

```
src/
  index.ts                 registerRoot() entry — don't change
  Root.tsx                 Registers every <Composition> (id, size, fps, duration, props)
  config/video.ts          VIDEO {width, height, fps}, FORMATS presets, sec() helper  ← change resolution/fps here
  theme/theme.ts           colors + fonts (self-hosted fonts loaded from public/fonts)
  utils/animation.ts       progress, springIn, fadeInOut, stagger, wave, countUp, easings, SPRINGS
  utils/useResponsive.ts   scale factor relative to 1920×1080 (portrait: 1080 wide)
  components/              Reusable animated building blocks (import from "../components")
    AnimatedText           kinetic typography — per-word/per-char masked slide-up, optional exit
    Reveal                 fade + slide (+ blur) entrance for any element
    GrowLine               underline/divider that grows in
    DrawRing               SVG ring that draws on (stroke-dash), arcs, dashed variant
    PopShape               circle/square/triangle/star (@remotion/shapes) with spring pop + float
    Background             animated gradient orbs + moving grid + vignette
  compositions/
    Showcase/              the sample video
      Showcase.tsx         <TransitionSeries> of scenes + music/SFX
      timing.ts            scene lengths in seconds → frames, start frames, total  ← change duration here
      schema.ts            zod props schema (editable in Studio)
      scenes/*.tsx         one file per scene
    _template/Template.tsx template used by `npm run new`
public/
  audio/                   ambient-pad.mp3, whoosh.mp3, pop.mp3 (synthesized locally, royalty-free)
  fonts/                   Space Grotesk + Inter variable woff2 (SIL Open Font License)
  images/                  put images here
scripts/new-composition.mjs  scaffolds a composition and registers it in Root.tsx
out/                       render output (git-ignored)
```

## Common tasks

### Change resolution, frame rate or duration

- Resolution / fps for everything: edit `VIDEO` in `src/config/video.ts`.
- One composition only: change `width`/`height`/`fps` on its `<Composition>` in `src/Root.tsx`
  (or spread a preset: `{...FORMATS.vertical}`).
- Showcase length: edit seconds in `SHOWCASE_TIMING` (`src/compositions/Showcase/timing.ts`).
  Total duration, transition points and synced SFX all derive from it.
- Other compositions: `durationInFrames={sec(SECONDS, VIDEO.fps)}` in `Root.tsx`.
- Duration from data (e.g. audio length): use `calculateMetadata` on `<Composition>`
  (see `.agents/skills/remotion-markup/calculate-metadata.md`).
- One-off override at render time: `npx remotion render Showcase out/x.mp4 --width=1280 --height=720 --frames=0-89`.
  Change fps in `src/config/video.ts`, not with `--fps`: the frame count is computed from `VIDEO.fps`.

### Create a new composition

```bash
npm run new -- ProductLaunch     # PascalCase name
```

This creates `src/compositions/ProductLaunch/ProductLaunch.tsx` (with a zod schema and length in seconds)
and registers it in `src/Root.tsx` between the `@new-composition` marker comments (keep those comments).
To do it by hand: create the component, then add a `<Composition id=… component=… {...VIDEO}
durationInFrames=… defaultProps={{…}} />` to `Root.tsx`. Composition ids may only contain `a-z A-Z 0-9 -`.

### Build a multi-scene video

- One component per scene in `scenes/`. Each scene is a full-frame `<AbsoluteFill>` whose frame 0 is its own start.
- Join scenes with `<TransitionSeries>` from `@remotion/transitions`:
  `fade()`, `slide({direction})`, `wipe({direction})`, `flip()`, `clockWipe()`, `iris()`, … with
  `linearTiming({durationInFrames, easing})` or `springTiming()`.
- **Transitions overlap scenes**: total = sum(scene lengths) − sum(transition lengths). Keep that math in a
  `timing.ts` like `Showcase/timing.ts`.
- Use `<Series>` for hard cuts and `<Sequence from={…} durationInFrames={…}>` for free placement.
- Register each scene as its own `<Composition>` too (see the `Showcase-Scenes` folder in `Root.tsx`) to preview it in isolation.

### Animate typography

- `<AnimatedText text="…" delay={0.4} stagger={0.08} by="word" | "char" exitAt={3} style={{fontSize: s(120)}} />`
- Use `fonts.display` (Space Grotesk) for headlines, `fonts.body` (Inter) for copy.
- Counters: `countUp(frame, sec(start, fps), sec(dur, fps), target)` with `fontVariantNumeric: "tabular-nums"`.
- New fonts: put the `.woff2` in `public/fonts/` and add it to `FONT_FILES` in `src/theme/theme.ts`
  (or use `@remotion/google-fonts` via `npx remotion add @remotion/google-fonts`; it needs network access while rendering).

### Animate graphics and shapes

- `<PopShape kind="star" size={s(150)} color={colors.yellow} delay={0.2} />`
- Any `@remotion/shapes` component (`Circle`, `Rect`, `Triangle`, `Star`, `Polygon`, `Pie`, `Heart`, `Arrow`…)
  or inline SVG. Animate stroke drawing via `strokeDasharray`/`strokeDashoffset` (see `DrawRing`).
- Springs: `springIn(frame, fps, sec(delay, fps), SPRINGS.bouncy)`. `smooth` = no bounce, `snappy`, `bouncy`.

### Audio and synchronization

- `import { Audio } from "@remotion/media"` → `<Audio src={staticFile("audio/x.mp3")} />`.
- **Sync = frames.** Start a sound exactly when its visual starts: `from={sec(delay, fps)}` using the same
  `delay` value that drives the animation (see `ShapesScene.tsx`, where each pop sound fires on its shape's frame).
- Volume envelopes: `volume={(f) => interpolate(f, [0, fps, total - fps, total], [0, 1, 1, 0], CLAMP)}`.
- Trim: `trimBefore` / `trimAfter` (frames). Loop: `loop`. Speed: `playbackRate`.
- To fit a video to an audio file's length, use `calculateMetadata` + duration lookup
  (see `.agents/skills/remotion-multimedia/get-audio-duration.md`).
- Beat-synced visuals: `@remotion/media-utils` (`useWindowedAudioData`, `visualizeAudio`), see
  `.agents/skills/remotion-markup/audio-visualization.md`.
- Only use audio you have rights to. The bundled sounds were generated with ffmpeg for this project.

### Props / parametrized videos

Each composition has a zod `schema` and inline `defaultProps` in `Root.tsx`. Keep `defaultProps` as an
**inline object literal** so Remotion Studio can save edits back to the file.
Render with custom props: `npx remotion render Showcase out/x.mp4 --props='{"title":"Hello"}'` (or a path to a JSON file).

## Preview and verify

```bash
npm run dev                                       # Remotion Studio → http://localhost:3000
npx remotion studio --no-open                     # headless: just print the URL
npx remotion compositions                         # list ids, sizes, fps, durations
npx remotion still Showcase out/f.png --frame=60  # render one frame to check a layout
npm run lint                                      # eslint (incl. Remotion rules) + tsc — run before finishing
```

Agents without a browser: render a few stills at key frames (`--scale=0.5` is faster) and look at them.
The Remotion ESLint rules flag non-deterministic animation — fix those warnings.

## Render

```bash
npm run render                                         # Showcase → out/showcase.mp4 (H.264, CRF 18)
npx remotion render <CompositionId> out/<name>.mp4     # any composition
npx remotion render Showcase out/clip.mp4 --frames=0-89 --scale=0.5   # quick draft
npx remotion render Showcase out/showcase.webm --codec=vp9
npx remotion render Showcase out/showcase.mov --codec=prores --prores-profile=4444   # alpha
npm run render:all                                     # landscape + square + vertical
```

Render defaults (codec, CRF, pixel format) live in `remotion.config.ts`. That file only applies to the
CLI, not to the Node.js rendering APIs.

### Restricted / offline environments

Remotion downloads Chrome Headless Shell on the first render. If that's blocked, point it at an existing
Chromium: `REMOTION_BROWSER_EXECUTABLE=/path/to/chrome npm run render`. Fonts are self-hosted, so renders need no network.

## Before finishing a change

1. `npm run lint` passes (no new warnings).
2. `npx remotion compositions` lists the composition with the expected size/fps/duration.
3. Render stills at a few key frames (or the full MP4) and inspect them.
4. Don't commit `out/` or `node_modules/`.

## Project: "Talking Stages" lyric videos

Vertical (1080×1920) lyric videos for the hook of the artist's song (0:18–0:57 of the track).

- `public/talking-stages/hook.mp3` — the trimmed hook audio.
- `src/compositions/TalkingStages/lyrics.ts` — lyric lines and their start times (`TIMELINE`, seconds). Edit here if a line is early or late.
- Lyrics appear ONLY on the phone screens (the artist's choice) — no big on-screen text.
- `beats.json` — beat times detected from the audio (136 BPM); drives the pulses and thumb taps.
- `variants.ts` — one config per video (background, phone, case colour, hand: skin tone, nails, rings, bracelet, sleeve).
- `illustration/Hand.tsx` — parametric hand (palm, fingers, thumb, nails: almond/coffin/square/short, chrome, glitter, French tips, gems, rings).
- `phones/*` — phone illustrations (no brand logos), all on a shared 440×1000 footprint so the hand fits: `RetroBarPhone` (green LCD), `QwertyPhone`, `FlipPhone`, `SlabPhone` (`ios` / `android`). `ChatScreen` renders messenger-style bubbles.
- Compositions live in the `TalkingStages` folder in `Root.tsx`: `TalkingStages-1-Nokia`, `-2-BlackBerry`, `-3-iPhone`, `-4-Flip`, `-5-Android`.
- Full-quality renders are ~50 MB; make a smaller copy for sharing with `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -c:a copy out.mp4`.

## Project: "Mawa" verse video

The artist's verse on "Mawa" (song 1:20 → 2:10.5), vertical 1080×1920, two versions: `Mawa-Lyrics` and `Mawa-Clean`.

- Style: colours sampled from the cover (`src/compositions/Mawa/theme.ts`), paper grain, flat shapes with soft light.
- `aligned.json` — word timings (song seconds) from vocal isolation (UVR MDX-Net) + CTC forced alignment of the
  artist-supplied lyrics. `timing.ts` converts to clip seconds (`VERSE_START = 80`). Nudge times there if needed.
- `world.tsx` (sky, glowing sun, hills, haze, road, figures, motes, paper sheets) and `scenes/landscape.tsx`
  (shared landscape with a parallax camera, scars, dissolving figures, paper planes).
- Scenes: `Act1` (hook inside the sun, day passes, slip drop → ripple → night paper sea → heartbeat rings),
  `Act2` (golden road, friends dissolve to embers, planes chase the sun), `Act3` (vortex → empty dusk road → whip),
  `Act4` (fire, embers → paper planes, wall of fire), `Finale` (MAWA letters, hits, cover tableau, push into the sun = loop).
- Lyrics overlay sits mid-frame (`top: 880`) to stay clear of TikTok's caption/buttons.

## Project: Kaya Kurrent news cards

The artist's news brand. Each story becomes two PNG stills: a square feed post (1500×1500) and a vertical
story/status (1080×1920). The user pastes a story (or uploads a .docx) and expects both images back.

- `src/compositions/KayaKurrent/stories/<slug>.ts` — one file per story (`headline`, `byline`, `lede`, `body[]`,
  optional `photo`); register it at the top of `stories/index.ts`. `imf-ecf-deal.ts` is the user's published
  reference post — the square template was measured from it, so keep it as a regression check.
- Rendering: `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run kk -- <slug>`
  → `out/kaya-kurrent/<slug>-post.png` and `<slug>-story.png`. Look at both, then send them to the user.
- `NewsPost.tsx` (square: frame, logo, footer drawn in code; optional faded photo behind) and `NewsStory.tsx`
  (vertical: `public/kaya-kurrent/story-template.png` is the user's template, cleaned, with the handle removed and
  redrawn from `HANDLE` in `brand.ts`). Fonts: Rajdhani Bold (headline, + thin stroke), DM Sans Light/Bold (text).
- `FitBox` shrinks text from the template size (29.4 px body) to fit. If a story is still too long, a red
  "TEXT TOO LONG" bar is rendered — never send an image with that bar; trim the story instead.

**Editing a pasted story (the user's rules):**
- Target ≈ 200–215 words for lede + body (the reference post is 212). The vertical format is the tighter one.
- Cut, don't rewrite: drop whole paragraphs that repeat a quote or the lede, or are tangential. Keep quotes
  word-for-word (or drop them whole). Merge an attribution sentence with its quote to save paragraph gaps.
- Only light copy fixes (spacing before commas, "He added that, the" → "He added that the"). Mention any change
  of meaning or any doubtful fact to the user instead of silently fixing it.
- House style: headline in Title Case; byline "By Staff Reporter"; lede = first paragraph (rendered bold);
  `**bold**` people and organisations on first mention in the body. If no headline is given, write one and say so.
- Record what was cut in a comment at the top of the story file.
