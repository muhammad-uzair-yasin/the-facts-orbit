import React from "react";
import { Composition, registerRoot } from "remotion";
import { DejaVuFilm } from "./Film";
import { TOTAL } from "./words";
const Root: React.FC = () => (
  <Composition id="DejaVu" component={DejaVuFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
