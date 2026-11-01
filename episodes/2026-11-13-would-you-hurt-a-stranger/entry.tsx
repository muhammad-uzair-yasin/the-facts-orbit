import React from "react";
import { Composition, registerRoot } from "remotion";
import { MilgramFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="Milgram" component={MilgramFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
