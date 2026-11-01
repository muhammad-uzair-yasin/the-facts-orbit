import React from "react";
import { Still, registerRoot } from "remotion";
import { Thumb } from "./ThumbKit";
import { THUMBS } from "./Thumbs";
import { THUMBS2 } from "./Thumbs2";
const ALL = { ...THUMBS, ...THUMBS2 };
const Root: React.FC = () => (
  <>{Object.entries(ALL).map(([k, t]) => <Still key={k} id={`Thumb${k}`} component={() => <Thumb t={t} />} width={1080} height={1920} />)}</>
);
registerRoot(Root);
