import React from "react";
import { Composition, Folder } from "remotion";
import { FORMATS, sec, VIDEO } from "./config/video";
import { showcaseSchema } from "./compositions/Showcase/schema";
import { Showcase } from "./compositions/Showcase/Showcase";
import { IntroScene } from "./compositions/Showcase/scenes/IntroScene";
import { OutroScene } from "./compositions/Showcase/scenes/OutroScene";
import { ShapesScene } from "./compositions/Showcase/scenes/ShapesScene";
import { SpecsScene } from "./compositions/Showcase/scenes/SpecsScene";
import { getShowcaseFrames, SHOWCASE_TIMING } from "./compositions/Showcase/timing";
// @new-composition-imports (used by `npm run new` — keep this line)

const showcaseFrames = getShowcaseFrames(VIDEO.fps);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main sample: 1920×1080 @ 30 fps. Edit src/config/video.ts to change.
          Keep defaultProps as inline literals so Studio can save edits back to this file. */}
      <Composition
        id="Showcase"
        component={Showcase}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={showcaseFrames.total}
        schema={showcaseSchema}
        defaultProps={{
          title: "Programmatic Motion",
          subtitle: "Polished videos, written in React.",
          cta: "npm run dev",
          withAudio: true,
        }}
      />

      {/* Same video re-targeted to other formats — layouts scale via useResponsive(). */}
      <Folder name="Showcase-Formats">
        <Composition
          id="Showcase-Square"
          component={Showcase}
          {...FORMATS.square}
          fps={VIDEO.fps}
          durationInFrames={showcaseFrames.total}
          schema={showcaseSchema}
          defaultProps={{
            title: "Programmatic Motion",
            subtitle: "Polished videos, written in React.",
            cta: "npm run dev",
            withAudio: true,
          }}
        />
        <Composition
          id="Showcase-Vertical"
          component={Showcase}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={showcaseFrames.total}
          schema={showcaseSchema}
          defaultProps={{
            title: "Programmatic Motion",
            subtitle: "Polished videos, written in React.",
            cta: "npm run dev",
            withAudio: true,
          }}
        />
      </Folder>

      {/* Each scene on its own timeline, for focused previewing. */}
      <Folder name="Showcase-Scenes">
        <Composition
          id="Scene-Intro"
          component={IntroScene}
          {...VIDEO}
          durationInFrames={sec(SHOWCASE_TIMING.intro, VIDEO.fps)}
          defaultProps={{ title: "Programmatic Motion", subtitle: "Polished videos, written in React." }}
        />
        <Composition
          id="Scene-Shapes"
          component={ShapesScene}
          {...VIDEO}
          durationInFrames={sec(SHOWCASE_TIMING.shapes, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
        <Composition
          id="Scene-Specs"
          component={SpecsScene}
          {...VIDEO}
          durationInFrames={sec(SHOWCASE_TIMING.specs, VIDEO.fps)}
        />
        <Composition
          id="Scene-Outro"
          component={OutroScene}
          {...VIDEO}
          durationInFrames={sec(SHOWCASE_TIMING.outro, VIDEO.fps)}
          defaultProps={{ cta: "npm run dev" }}
        />
      </Folder>

      {/* @new-compositions (used by `npm run new` — keep this line) */}
    </>
  );
};
