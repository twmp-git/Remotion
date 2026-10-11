import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../../utils/animation";

/**
 * The fire shot rendered in Blender (scripts/blender/mawa_fire.py → public/mawa/blender-fire.mp4).
 * Frame 1 of the Blender render = this Sequence's frame 0 (song 1:50.84). Same vertical whip-in
 * as the 2D version so it drops into the edit identically.
 */
export const BlenderFire: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame / fps, [0, 0.32], [1, 0], { ...CLAMP, easing: Easing.bezier(0.1, 0.8, 0.3, 1) });
  return (
    <AbsoluteFill style={{ translate: `0 ${enter * 1920 * 1.05}px`, filter: `blur(${enter * 18}px)` }}>
      <Video src={staticFile("mawa/blender-fire.mp4")} muted style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
