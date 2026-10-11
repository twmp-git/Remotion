import React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CLAMP, EASE_IN_OUT } from "../../utils/animation";
import type { ShowcaseProps } from "./schema";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { ShapesScene } from "./scenes/ShapesScene";
import { SpecsScene } from "./scenes/SpecsScene";
import { getShowcaseFrames } from "./timing";

/**
 * Sample composition: four scenes joined with slide / wipe / fade transitions,
 * an ambient music bed and sound effects synced to transitions and shape pops.
 */
export const Showcase: React.FC<ShowcaseProps> = ({
  title,
  subtitle,
  cta,
  withAudio,
}) => {
  const { fps } = useVideoConfig();
  const t = getShowcaseFrames(fps);
  const timing = linearTiming({ durationInFrames: t.transitionFrames, easing: EASE_IN_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={t.intro}>
          <IntroScene title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={timing}
        />
        <TransitionSeries.Sequence name="Shapes" durationInFrames={t.shapes}>
          <ShapesScene withAudio={withAudio} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom-left" })}
          timing={timing}
        />
        <TransitionSeries.Sequence name="Specs" durationInFrames={t.specs}>
          <SpecsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={t.outro}>
          <OutroScene cta={cta} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {withAudio ? (
        <>
          {/* Music bed: fade in over 1 s, fade out over the last 1.5 s. */}
          <Audio
            name="Music"
            src={staticFile("audio/ambient-pad.mp3")}
            durationInFrames={t.total}
            volume={(f) =>
              interpolate(f, [0, fps, t.total - 1.5 * fps, t.total], [0, 0.7, 0.7, 0], CLAMP)
            }
          />
          {/* A whoosh centred on each transition. */}
          {[t.starts.shapes, t.starts.specs, t.starts.outro].map((start, i) => (
            <Sequence
              key={i}
              name={`Whoosh ${i + 1}`}
              from={Math.max(0, start - Math.round(t.transitionFrames * 0.2))}
              layout="none"
            >
              <Audio src={staticFile("audio/whoosh.mp3")} volume={0.45} />
            </Sequence>
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
