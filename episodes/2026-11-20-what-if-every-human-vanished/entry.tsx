import React from "react";
import { Composition, registerRoot } from "remotion";
import { HumansGoneFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="HumansGone" component={HumansGoneFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
