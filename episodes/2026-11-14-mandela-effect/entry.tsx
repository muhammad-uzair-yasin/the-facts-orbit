import React from "react";
import { Composition, registerRoot } from "remotion";
import { MandelaFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="Mandela" component={MandelaFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
