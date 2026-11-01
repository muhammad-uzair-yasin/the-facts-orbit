import React from "react";
import { Composition, registerRoot } from "remotion";
import { ReadPeople2Film } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="ReadPeople2" component={ReadPeople2Film} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
