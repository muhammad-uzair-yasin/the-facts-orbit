import React from "react";
import { Composition, registerRoot } from "remotion";
import { EmuWarFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="EmuWar" component={EmuWarFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
