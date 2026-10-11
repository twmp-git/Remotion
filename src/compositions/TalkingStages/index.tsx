import React from "react";
import { TalkingStagesVideo } from "./TalkingStagesVideo";
import { NOKIA_ERA } from "./variants";

export { HOOK_SECONDS } from "./lyrics";

type Props = { withAudio: boolean };

export const TalkingStagesNokia: React.FC<Props> = ({ withAudio }) => (
  <TalkingStagesVideo variant={NOKIA_ERA} withAudio={withAudio} />
);
