import React from "react";
import { Still, registerRoot } from "remotion";
import { Thumb } from "./ThumbKit";
import { THUMBS } from "./Thumbs";
const Root: React.FC = () => (
  <>{Object.entries(THUMBS).map(([k, t]) => <Still key={k} id={`Thumb${k}`} component={() => <Thumb t={t} />} width={1080} height={1920} />)}</>
);
registerRoot(Root);
