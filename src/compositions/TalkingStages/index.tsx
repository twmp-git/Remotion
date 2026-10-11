import React from "react";
import { TalkingStagesVideo } from "./TalkingStagesVideo";
import { ANDROID_ERA, FLIP_ERA, IPHONE_ERA, NOKIA_ERA, QWERTY_ERA } from "./variants";

export { HOOK_SECONDS } from "./lyrics";

type Props = { withAudio: boolean };

export const TalkingStagesNokia: React.FC<Props> = ({ withAudio }) => <TalkingStagesVideo variant={NOKIA_ERA} withAudio={withAudio} />;
export const TalkingStagesQwerty: React.FC<Props> = ({ withAudio }) => <TalkingStagesVideo variant={QWERTY_ERA} withAudio={withAudio} />;
export const TalkingStagesIPhone: React.FC<Props> = ({ withAudio }) => <TalkingStagesVideo variant={IPHONE_ERA} withAudio={withAudio} />;
export const TalkingStagesFlip: React.FC<Props> = ({ withAudio }) => <TalkingStagesVideo variant={FLIP_ERA} withAudio={withAudio} />;
export const TalkingStagesAndroid: React.FC<Props> = ({ withAudio }) => <TalkingStagesVideo variant={ANDROID_ERA} withAudio={withAudio} />;
