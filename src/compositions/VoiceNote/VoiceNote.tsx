import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sec, VIDEO } from "../../config/video";
import { CLAMP, SPRINGS } from "../../utils/animation";
import { useResponsive } from "../../utils/useResponsive";
import { ArtRoom } from "./ArtRoom";
import { VoiceBubble } from "./VoiceBubble";

/** Max length requested for this video. */
export const VOICE_NOTE_MAX_SECONDS = 45;

export const voiceNoteSchema = z.object({
  /** Video length = voice-note length (timer counts up to this). Set it to your audio's length. */
  durationSeconds: z.number().min(2).max(VOICE_NOTE_MAX_SECONDS),
  /** Time shown in the bubble, like WhatsApp's "sent at". */
  sentAt: z.string(),
  bubbleColor: z.string(),
});

export type VoiceNoteProps = z.infer<typeof voiceNoteSchema>;

export const calculateVoiceNoteMetadata: CalculateMetadataFunction<VoiceNoteProps> = ({ props }) => ({
  durationInFrames: sec(props.durationSeconds, VIDEO.fps),
});

/** Cut-out head sticker with a gentle "talking" bob. */
const HeadSticker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useResponsive();
  const t = frame / fps;
  const pop = spring({ frame, fps, config: SPRINGS.bouncy, durationInFrames: sec(0.8, fps) });
  const scale = interpolate(pop, [0, 1], [0.7, 1]) * (1 + 0.012 * Math.sin(t * Math.PI * 2 * 1.7));
  const rotate = -4 + 2.2 * Math.sin(t * Math.PI * 2 * 0.35) + 0.8 * Math.sin(t * Math.PI * 2 * 1.3);
  const bob = s(7) * Math.sin(t * Math.PI * 2 * 0.6);
  return (
    <Img
      src={staticFile("voice-note/head.png")}
      style={{
        position: "absolute",
        left: s(70),
        top: s(640),
        width: s(470),
        transformOrigin: "50% 80%",
        scale: String(scale),
        rotate: `${rotate}deg`,
        translate: `0 ${bob}px`,
        filter: `drop-shadow(0 ${s(16)}px ${s(22)}px rgba(0,0,0,0.4))`,
      }}
    />
  );
};

export const VoiceNote: React.FC<VoiceNoteProps> = ({ durationSeconds, sentAt, bubbleColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useResponsive();
  const pop = spring({ frame: frame - sec(0.15, fps), fps, config: SPRINGS.snappy });
  const bubbleOpacity = interpolate(frame, [sec(0.15, fps), sec(0.35, fps)], [0, 1], CLAMP);
  return (
    <AbsoluteFill>
      <ArtRoom />
      <div
        style={{
          position: "absolute",
          left: s(495),
          top: s(905),
          opacity: bubbleOpacity,
          scale: String(interpolate(pop, [0, 1], [0.85, 1])),
          transformOrigin: "0% 50%",
        }}
      >
        <VoiceBubble color={bubbleColor} sentAt={sentAt} durationSeconds={durationSeconds} />
      </div>
      <HeadSticker />
    </AbsoluteFill>
  );
};
