import React from "react";
import { Composition, registerRoot } from "remotion";
import { ManipulationFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="Manipulation" component={ManipulationFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
