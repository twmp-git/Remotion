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
import {
  HOOK_SECONDS,
  TalkingStagesAndroid,
  TalkingStagesFlip,
  TalkingStagesIPhone,
  TalkingStagesNokia,
  TalkingStagesQwerty,
} from "./compositions/TalkingStages";
import { MawaVerse } from "./compositions/Mawa/MawaVerse";
import { FIRE_COMPARE_FRAMES, FireCompare } from "./compositions/Mawa/FireCompare";
import { VERSE_SECONDS as MAWA_SECONDS } from "./compositions/Mawa/timing";
import { calculateVoiceNoteMetadata, VoiceNote, voiceNoteSchema } from "./compositions/VoiceNote/VoiceNote";
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

      {/* "Talking Stages" lyric videos — vertical 1080×1920 for TikTok / Reels / Shorts. */}
      <Folder name="TalkingStages">
        <Composition
          id="TalkingStages-1-Nokia"
          component={TalkingStagesNokia}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(HOOK_SECONDS, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
        <Composition
          id="TalkingStages-2-BlackBerry"
          component={TalkingStagesQwerty}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(HOOK_SECONDS, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
        <Composition
          id="TalkingStages-3-iPhone"
          component={TalkingStagesIPhone}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(HOOK_SECONDS, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
        <Composition
          id="TalkingStages-4-Flip"
          component={TalkingStagesFlip}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(HOOK_SECONDS, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
        <Composition
          id="TalkingStages-5-Android"
          component={TalkingStagesAndroid}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(HOOK_SECONDS, VIDEO.fps)}
          defaultProps={{ withAudio: true }}
        />
      </Folder>

      {/* "Mawa" verse (song 1:20 → 2:09) — vertical 9:16 for TikTok / Reels / Shorts. */}
      <Folder name="Mawa">
        <Composition
          id="Mawa-Lyrics"
          component={MawaVerse}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={Math.round(MAWA_SECONDS * VIDEO.fps)}
          defaultProps={{ withLyrics: true, withAudio: true }}
        />
        <Composition
          id="Mawa-Clean"
          component={MawaVerse}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={Math.round(MAWA_SECONDS * VIDEO.fps)}
          defaultProps={{ withLyrics: false, withAudio: true }}
        />
        <Composition
          id="Mawa-Lyrics-BlenderFire"
          component={MawaVerse}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={Math.round(MAWA_SECONDS * VIDEO.fps)}
          defaultProps={{ withLyrics: true, withAudio: true, fire: "blender" as const }}
        />
        <Composition
          id="Mawa-Clean-BlenderFire"
          component={MawaVerse}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={Math.round(MAWA_SECONDS * VIDEO.fps)}
          defaultProps={{ withLyrics: false, withAudio: true, fire: "blender" as const }}
        />
        <Composition
          id="Mawa-FireCompare"
          component={FireCompare}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={FIRE_COMPARE_FRAMES(VIDEO.fps)}
        />
      </Folder>

      {/* Voice-note sticker video: cut-out head + WhatsApp-style bubble in an illustrated art room. */}
      <Folder name="VoiceNote">
        <Composition
          id="VoiceNote-Vertical"
          component={VoiceNote}
          {...FORMATS.vertical}
          fps={VIDEO.fps}
          durationInFrames={sec(45, VIDEO.fps)}
          schema={voiceNoteSchema}
          calculateMetadata={calculateVoiceNoteMetadata}
          defaultProps={{ durationSeconds: 45, sentAt: "20:24", bubbleColor: "#A88C00" }}
        />
      </Folder>

      {/* @new-compositions (used by `npm run new` — keep this line) */}
    </>
  );
};
