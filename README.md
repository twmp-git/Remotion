# Remotion motion graphics

Programmatic motion graphics videos with [Remotion](https://www.remotion.dev) **4.0.534**, React and TypeScript.
The project is set up for working with AI coding agents. See [`AGENTS.md`](AGENTS.md).

The sample composition **`Showcase`** (1920×1080, 30 fps, 13.7 s) has kinetic typography, spring-animated
shapes, counters, slide/wipe/fade transitions, a music bed and sound effects synced to the frame.

## Requirements

- Node.js 18+ (tested with Node 22) and npm
- Remotion downloads its own headless Chrome on first render. FFmpeg is bundled.

## Commands

```bash
npm install                                   # install dependencies
npm run dev                                   # open Remotion Studio (http://localhost:3000)
npm run new -- MyVideo                        # scaffold + register a new composition
npm run render                                # export Showcase → out/showcase.mp4
npx remotion render MyVideo out/my-video.mp4  # export any composition
npm run render:all                            # landscape, square and vertical MP4s
npm run still                                 # export a single frame as PNG
npx remotion compositions                     # list compositions
npm run lint                                  # eslint + typecheck
npx remotion upgrade                          # upgrade all Remotion packages together
```

## Change resolution, fps and duration

| What | Where |
| --- | --- |
| Resolution / fps (all compositions) | `VIDEO` in `src/config/video.ts` |
| Format presets (square, vertical, 4K) | `FORMATS` in `src/config/video.ts` |
| Showcase scene lengths and transition length | `SHOWCASE_TIMING` (seconds) in `src/compositions/Showcase/timing.ts` |
| Per-composition settings | `<Composition>` entries in `src/Root.tsx` |
| Render-time override | `npx remotion render Showcase out/x.mp4 --width=1280 --height=720` (change fps in `video.ts` so durations recompute) |

## Structure

```
src/config      video settings and sec() helper
src/theme       colors and fonts
src/utils       animation helpers (easing, springs, stagger, countUp…) and useResponsive
src/components  AnimatedText, Reveal, GrowLine, DrawRing, PopShape, Background
src/compositions/Showcase   the sample video (scenes, timing, props schema)
public/         audio, fonts, images (use staticFile())
.agents/skills  official Remotion Agent Skills (symlinked into .claude/skills)
```

## Docs

- [Remotion docs](https://www.remotion.dev/docs) · [Fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [Transitions](https://www.remotion.dev/docs/transitions) · [Audio](https://www.remotion.dev/docs/using-audio) · [Rendering](https://www.remotion.dev/docs/render)
- [Agent Skills](https://www.remotion.dev/docs/ai/skills)

## License

Remotion is free for individuals and for companies of up to 3 people. Larger companies need a
[company license](https://www.remotion.pro/license). Fonts: Space Grotesk and Inter (SIL OFL).
The audio in `public/audio` was synthesized for this project.
