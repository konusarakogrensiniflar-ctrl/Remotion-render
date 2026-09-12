import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { z } from "zod";
import { SceneBasedBook } from "./SceneBasedBook";

export const IntroMainVideo: React.FC<any> = (props) => {
  const introVideo = props.introVideo || "";
  const { introDurationInFrames = 381 } = props;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={introDurationInFrames}>
        <OffthreadVideo
          src={staticFile(introVideo)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Sequence>

      <Sequence from={introDurationInFrames}>
        <SceneBasedBook config={props.mainConfig} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const introMainVideoSchema = z.object({
  introVideo: z.string().optional(),
  introDurationInFrames: z.number().optional(),
  mainConfig: z.any(),
});
