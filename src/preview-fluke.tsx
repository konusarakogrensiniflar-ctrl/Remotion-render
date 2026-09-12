import React from "react";
import { Composition, registerRoot } from "remotion";
import { AntidoteBook } from "./engines/antidote";
import config from "../books/fluke/config.antidote.json";

export const Root: React.FC = () => {
  return (
    <Composition
      id="Antidote-fluke"
      component={AntidoteBook}
      durationInFrames={config.meta.durationInFrames}
      fps={config.meta.fps}
      width={config.meta.width}
      height={config.meta.height}
      defaultProps={{ config: config as any }}
    />
  );
};

registerRoot(Root);
