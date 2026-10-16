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

The artist's news brand. The user pastes content (or uploads a .docx) and expects finished PNGs back.

### Template registry (approved by the user — don't change their look without being asked)

Every template comes as a pair: a square/feed **Post** and a vertical **Story**. Each item becomes
`KK-<slug>-Post` and `KK-<slug>-Story`; all are registered in `src/compositions/KayaKurrent/Stills.tsx`
(sub-folders per family in Studio) and rendered by `npm run kk -- <slug>`.

| Template | Post size | Story size | Component | Items live in | Used for |
|---|---|---|---|---|---|
| **News** | 1500×1500 | 1080×1920 | `NewsPost.tsx` / `NewsStory.tsx` | `stories/` | Full news stories (headline, byline, bold lede, body) |
| **News Cover** | 1500×1500 | 1125×2000 | `Cover.tsx` | `covers/index.ts` | Photo + headline slide posted before a News story (same slug as the story → `<slug>-cover-post.png` / `-cover-story.png`) |
| **Breaking News** | 2000×2000 | 1125×2000 | `BreakingNews.tsx` | `breaking/index.ts` | Photo + one-line/short headline, optional subline |
| **Celebration** | 1600×2000 (4:5) | 1125×2000 | `Celebration.tsx` | `celebrations/index.ts` | Holiday/occasion greetings on the calendar card (message, sticky-note text, dates, optional polaroid photo) |
| **Public Notice** | 2000×2000 | 1125×2000 | `PublicNotice.tsx` | `notices/index.ts` | Official notices: kicker, title, `items` lines and/or a `body` paragraph, source |
| **Opportunities** | 1500×1500 | 1125×2000 | `Opportunities.tsx` | `opportunities/index.ts` | Opportunities Desk posts: title + "Who it's for / What you get / Deadline" rows on the mustard card over a sharp photo |

- "the square one / the vertical one" = Post / Story of whichever template is being discussed.
- The user supplied the square/feed designs plus the Breaking and Celebration verticals; **Public Notice Story** and
  **Opportunities Story** were designed by Claude to match their squares.
- Opportunities: rows use the report's DETAIL lines (`**Who it's for:**  …`, `**What you get:**  **amount** …`,
  `**Deadline:**  Closes …`); the SHORT CAPTION + link go in the caption file, not on the image. Flag links that are
  Google searches or general listing pages rather than the official page. Each needs a photo (shown sharp behind the card — the user doesn't want it blurred;
  Pexels photos can be fetched from `images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=2400`, the site itself blocks bots).
- Opportunities typography (the user's rules): break titles at natural phrase boundaries with `\n` (never split a
  name like "Ban Ki-moon Foundation"), and give the vertical its own breaks via `storyTitle` when the square's lines
  are too long for it. The title is sized by line count; rows are a fixed size on every post (square 38 px,
  vertical 47 px) and the title shrinks first if space runs out. A short rule sits under the title. Vertical rows
  put the bold label on its own line. Inner margins ≈ 110 px (square) / 95 px (vertical) from the card edge.
  Keep money amounts together with non-breaking spaces (`Up\u00a0to\u00a0GBP\u00a015,000`).
- Reference images of the user's originals are in `assets-src/kaya-kurrent/`; each family has a `*-reference`
  item that rebuilds the original — keep those as regression checks (compare side by side after changes).
- Raster assets (Breaking panel watermark, Celebration backgrounds with text removed, wordmark, sample photos)
  are generated by `python3 scripts/kaya-kurrent-assets.py` from those references.
- Shared approved details: d Diam headlines in capitals (News headlines ≤ 8 words), DM Sans text pinned to
  `opsz 14`, brand red `#BE292D`, footer "News now, for then." + @kayakurrent.
- **Brand logos — use these, never redraw them** (all transparent black PNGs in `public/kaya-kurrent/`; recolour
  with `filter: invert(1)` for white; originals from the user in `assets-src/kaya-kurrent/logo-*.webp`):
  | File | What | Use via |
  |---|---|---|
  | `logo-k.png` | "k." — the user's lowercase k + dot, as on every template | `<Logo x y height color />` in `parts.tsx` |
  | `logo-k-lowercase.png` | lowercase blackletter k, no dot | `<Img>` |
  | `logo-K-uppercase.png` | uppercase blackletter K | `<Img>` |
  | `logo-wordmark-stacked.png` | "kaya / kurrent" on two lines | `<Img>` |
  | `wordmark.png` | "kaya kurrent" on one line (cut from the Celebration template) | `<Wordmark>` in `parts.tsx` |
- News Cover: square = the News Post frame filled with the photo, black panel (Breaking panel "k" at 0.75 scale)
  with the headline (d Diam 74.3, same as News Post) and white wordmark; vertical = `cover-story-bg.png` (the
  user's frame + black shapes, logo/handle removed) with the photo inside the frame and its own panel "k" drawn as
  SVG. The user's vertical reference had the handle misspelt "@kayacurrent"; HANDLE is drawn instead. Headlines are
  centred on the panel. Needs a photo per story (ask for one); a portrait photo suits the vertical best.
- Celebration: the message is tucked under the sticky note/polaroid via a clip path (`covers`); the small partial
  calendar numbers (e.g. "3") are baked into the background and do not change with the dates.
- Breaking News needs a photo in `public/kaya-kurrent/photos/` (optionally `storyPhoto` for a different crop, and
  `photoPosition`). Ask the user for one if they don't send it.

**Adding a new template** (the user plans more, e.g. for other kinds of posts): give it a name, add a row to the
table above, build it in `src/compositions/KayaKurrent/` reusing `brand.ts` (fonts, colours, handle, tagline),
`FitBox`, `RichText` and the logo (`public/kaya-kurrent/logo-k.png`), register it in the `KayaKurrent` folder in
`Root.tsx` with an id starting `KK-`, and make sure `npm run kk` renders it (extend `scripts/render-kaya-kurrent.mjs`
if the id pattern differs). If the user supplies a template image, measure it and check the render side by side
against it, as was done for News Post with the IMF reference post.

### News templates

- `src/compositions/KayaKurrent/stories/<slug>.ts` — one file per story (`headline`, `byline`, `lede`, `body[]`,
  optional `photo`); register it at the top of `stories/index.ts`. `imf-ecf-deal.ts` is the user's published
  reference post — the square template was measured from it, so keep it as a regression check.
- Rendering: `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run kk -- <slug>`
  → `out/kaya-kurrent/<slug>-post.png` and `<slug>-story.png`. Look at both, then send them to the user.
- `NewsPost.tsx` (square: frame, logo, footer drawn in code; optional faded photo behind) and `NewsStory.tsx`
  (vertical: `public/kaya-kurrent/story-template.png` is the user's template, cleaned, with the handle removed and
  redrawn from `HANDLE` in `brand.ts`). Fonts are the user's own files: d Diam (headline, 74.3 px; ASCII only, Rajdhani
  fills in accented letters) and DM Sans variable (Light body / Bold lede, pinned to `opsz 14`).
- `FitBox` picks the largest text size that fills the frame (the user wants every card filled, short stories
  get bigger text). Side margins inside the frame are 80 px (square) / 64 px (vertical) — the user asked for
  this breathing room, don't tighten it. If a story is too long even at the minimum size, a red
  "TEXT TOO LONG" bar is rendered — never send an image with that bar; trim the story instead.

**Editing a pasted story (the user's rules):**
- Target ≈ 200–215 words for lede + body (the reference post is 212). The vertical format is the tighter one.
- Cut, don't rewrite: drop whole paragraphs that repeat a quote or the lede, or are tangential. Keep quotes
  word-for-word (or drop them whole). Merge an attribution sentence with its quote to save paragraph gaps.
- Only light copy fixes (spacing before commas, "He added that, the" → "He added that the"). Mention any change
  of meaning or any doubtful fact to the user instead of silently fixing it.
- Headlines are always rendered in CAPITALS (done in code via `textTransform`; write them in Title Case in the story file).
- Headlines: 8 words or fewer — shorten longer ones and tell the user. Use straight apostrophes (the headline font has no curly ones).
- House style: headline in Title Case; byline "By Staff Reporter"; lede = first paragraph (rendered bold);
  `**bold**` people and organisations on first mention in the body. If no headline is given, write one and say so.
- Record what was cut (and the source link, if any) in a comment at the top of the story file.
- When the source gives a link "for the post", it goes in the caption, not on the image: list the links in the reply.
