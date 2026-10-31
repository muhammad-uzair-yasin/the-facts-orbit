import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, blinkAt, clamp01, lerp, mix } from "./kit";

const FONT = "InterLocal, Inter, sans-serif";
const INK = "#1b1b24";
const LW = 5;

// ---------------------------------------------------------------------------------------------
// PERSON RIG — one animated human, fully parametric
// ---------------------------------------------------------------------------------------------
type Hair = "short" | "side" | "curly" | "afro" | "bun" | "long" | "pony" | "spiky" | "bald" | "mohawk" | "braids" | "bob" | "none";
type Top = "tee" | "hoodie" | "suit" | "lab" | "dress" | "jacket" | "sweater" | "uniform" | "apron" | "overalls" | "space" | "kurta";
type Hat = "none" | "cap" | "beanie" | "hard" | "chef" | "explorer" | "crown" | "headset" | "helmet" | "hijab" | "turban" | "beret" | "cowboy" | "grad";
type Glasses = "none" | "round" | "square" | "shades";
type Face = "none" | "beard" | "mustache" | "stubble";
type Prop = "none" | "book" | "mag" | "mic" | "phone" | "coffee" | "wrench" | "flask" | "pointer" | "globe" | "camera" | "laptop" | "ball" | "brush";
export type PersonDef = {
  name: string; skin: string; hair: Hair; hairC: string; top: Top; topC: string; topC2?: string; pants: string; shoes: string;
  hat?: Hat; hatC?: string; glasses?: Glasses; face?: Face; prop?: Prop; bw?: number; h?: number; age?: "kid" | "adult" | "old"; lip?: string; blush?: boolean; tie?: string;
};

const arm = (sx: number, sy: number, a: number, b: number, l1: number, l2: number) => {
  const r1 = (a * Math.PI) / 180, r2 = ((a + b) * Math.PI) / 180;
  const ex = sx + Math.sin(r1) * l1, ey = sy + Math.cos(r1) * l1;
  const hx = ex + Math.sin(r2) * l2, hy = ey + Math.cos(r2) * l2;
  return { ex, ey, hx, hy, d: `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}` };
};

const PropDraw: React.FC<{ p: Prop; f: number }> = ({ p, f }) => {
  switch (p) {
    case "book": return <g transform="translate(-6 -6) rotate(-10)"><rect x={-26} y={-34} width={52} height={40} rx={4} fill="#c0392b" stroke={INK} strokeWidth={4} /><rect x={-22} y={-30} width={6} height={32} fill="#fff" opacity={0.5} /></g>;
    case "mag": return <g transform="rotate(-30)"><line x1={0} y1={0} x2={0} y2={-36} stroke="#6b4a24" strokeWidth={8} strokeLinecap="round" /><circle cy={-58} r={24} fill="#bfe6ff" fillOpacity={0.5} stroke={INK} strokeWidth={6} /></g>;
    case "mic": return <g><rect x={-6} y={-40} width={12} height={40} rx={5} fill="#333" /><circle cy={-50} r={16} fill="#888" stroke={INK} strokeWidth={4} /></g>;
    case "phone": return <g transform="rotate(-8)"><rect x={-16} y={-50} width={32} height={58} rx={6} fill="#222" stroke={INK} strokeWidth={3} /><rect x={-12} y={-44} width={24} height={44} rx={3} fill="#5ac8fa" opacity={0.6 + 0.3 * Math.sin(f * 0.3)} /></g>;
    case "coffee": return <g><path d="M-18 -40 H18 L14 4 H-14 Z" fill="#fff" stroke={INK} strokeWidth={4} /><rect x={-18} y={-26} width={36} height={12} fill="#8a5a2b" />{[0, 1].map((i) => <path key={i} d={`M${-6 + i * 10} -48 q -6 -10 0 -20`} stroke="#bbb" strokeWidth={3} fill="none" opacity={0.6 + 0.4 * Math.sin(f * 0.2 + i)} />)}</g>;
    case "wrench": return <g transform="rotate(-35)"><rect x={-6} y={-60} width={12} height={60} rx={4} fill="#9aa4b2" stroke={INK} strokeWidth={4} /><path d="M-18 -60 a18 18 0 1 1 36 0 l-8 0 l-4 -8 h-4 l-4 8 Z" fill="#9aa4b2" stroke={INK} strokeWidth={4} /></g>;
    case "flask": return <g><path d="M-8 -50 V-30 L-26 4 H26 L8 -30 V-50 Z" fill="#e8f7ff" stroke={INK} strokeWidth={4} /><path d="M-20 -6 L20 -6 L26 4 H-26 Z" fill="#3ddc97" />{[0, 1, 2].map((i) => <circle key={i} cx={-6 + i * 7} cy={-14 - ((f * 1.2 + i * 9) % 26)} r={3} fill="#3ddc97" />)}</g>;
    case "pointer": return <line x1={0} y1={0} x2={70} y2={-80} stroke="#6b4a24" strokeWidth={6} strokeLinecap="round" />;
    case "globe": return <g transform="translate(0 -30)"><circle r={30} fill="#4aa3df" stroke={INK} strokeWidth={4} /><path d="M-18 -12 q10 -10 22 -4 q4 10 -8 14 q-10 4 -14 -10 M6 10 q10 -4 16 6" fill="#5cc26a" /></g>;
    case "camera": return <g transform="translate(0 -18)"><rect x={-30} y={-22} width={60} height={40} rx={6} fill="#333" stroke={INK} strokeWidth={4} /><circle r={13} fill="#5a6a80" stroke="#ddd" strokeWidth={4} /></g>;
    case "laptop": return <g transform="translate(-10 -20)"><rect x={-40} y={-34} width={64} height={42} rx={4} fill="#c9ced8" stroke={INK} strokeWidth={4} transform="skewX(-10)" /><rect x={-46} y={8} width={76} height={8} rx={3} fill="#9aa4b2" stroke={INK} strokeWidth={3} /></g>;
    case "ball": return <g transform={`translate(0 ${-24 - Math.abs(Math.sin(f * 0.25)) * 14})`}><circle r={22} fill="#ff8a3d" stroke={INK} strokeWidth={4} /><path d="M-22 0 H22 M0 -22 V22" stroke={INK} strokeWidth={3} /></g>;
    case "brush": return <g transform="rotate(-30)"><rect x={-5} y={-54} width={10} height={44} rx={4} fill="#d8ad66" stroke={INK} strokeWidth={3} /><path d="M-8 -54 Q0 -78 8 -54 Z" fill="#e4473b" stroke={INK} strokeWidth={3} /></g>;
    default: return null;
  }
};

export const Person: React.FC<{ d: PersonDef; f: number; seed: number; talk?: number; wave?: number; mood?: "happy" | "neutral" | "surprised" }> = ({ d, f, seed, talk = 0, wave = 0, mood = "happy" }) => {
  const kid = d.age === "kid", old = d.age === "old";
  const H = (d.h ?? 1) * (kid ? 0.8 : 1);
  const bw = d.bw ?? 1;
  const headR = kid ? 60 : 52;
  const breathe = Math.sin(f * 0.09 + seed) * 2.5;
  const bob = Math.sin(f * 0.09 + seed) * 2;
  const blink = blinkAt(f, seed);
  const hipY = -150 * H, shY = (-300 * H) - breathe, headY = shY - headR - 20 * H;
  const shoulder = 54 * bw, hip = 40 * bw;
  const skinD = mix(d.skin, "#000000", 0.18);
  const sleeve = d.top === "lab" ? "#fbfbf8" : d.top === "space" ? "#eef1f6" : d.top === "dress" || d.top === "kurta" ? d.topC : d.top === "suit" ? d.topC : d.top === "overalls" ? (d.topC2 ?? "#f2f2f2") : d.topC;
  const aL = arm(-shoulder + 6, shY + 14, -16 - Math.sin(f * 0.1 + seed) * 4 + (d.prop !== "none" && d.prop ? 0 : 0), d.prop && d.prop !== "none" ? -60 : -10, 70 * H, 66 * H);
  const wa = 150 + Math.sin(f * 0.24 + seed) * 14 * wave;
  const aR = wave > 0 ? arm(shoulder - 6, shY + 14, wa, 26 + Math.sin(f * 0.24 + seed) * 18, 70 * H, 66 * H)
    : arm(shoulder - 6, shY + 14, 18 + talk * 10, 24, 70 * H, 66 * H);
  const longTop = d.top === "lab" || d.top === "kurta" || d.top === "dress";
  const torsoBottom = longTop ? hipY + 40 : hipY + 8;
  const legL = `M${-hip / 2} ${hipY} L${-hip / 2 - 4} -12`, legR = `M${hip / 2} ${hipY} L${hip / 2 + 4} -12`;
  const hair = d.hair, hc = d.hairC;
  const hx = 0, hy = headY;
  const mouthY = hy + headR * 0.48, eyeY = hy + 2;
  const mouthOpen = talk > 0.08;
  const hatC = d.hatC ?? "#333";

  // hair BACK layer (behind head)
  const hairBack = () => {
    switch (hair) {
      case "long": return <path d={`M${hx - headR - 6} ${hy - 10} Q${hx - headR - 14} ${hy + 110} ${hx - 30} ${hy + 120} H${hx + 30} Q${hx + headR + 14} ${hy + 110} ${hx + headR + 6} ${hy - 10} Z`} fill={hc} stroke={INK} strokeWidth={LW} />;
      case "braids": return <g>{[-1, 1].map((s) => <path key={s} d={`M${hx + s * (headR - 6)} ${hy + 10} Q${hx + s * (headR + 14)} ${hy + 70} ${hx + s * (headR + 2)} ${hy + 130}`} stroke={hc} strokeWidth={20} fill="none" strokeLinecap="round" strokeDasharray="14 6" />)}</g>;
      case "pony": return <path d={`M${hx + headR - 10} ${hy - 30} Q${hx + headR + 50 + Math.sin(f * 0.15 + seed) * 8} ${hy - 10} ${hx + headR + 30 + Math.sin(f * 0.15 + seed) * 10} ${hy + 70}`} stroke={hc} strokeWidth={26} fill="none" strokeLinecap="round" />;
      case "bob": return <path d={`M${hx - headR - 8} ${hy - 6} Q${hx - headR - 10} ${hy + 50} ${hx - headR + 10} ${hy + 56} H${hx + headR - 10} Q${hx + headR + 10} ${hy + 50} ${hx + headR + 8} ${hy - 6} Z`} fill={hc} stroke={INK} strokeWidth={LW} />;
      case "afro": return <circle cx={hx} cy={hy - 16} r={headR + 30} fill={hc} stroke={INK} strokeWidth={LW} />;
      case "curly": return <g>{[...Array(9)].map((_, i) => { const a = Math.PI + (i / 8) * Math.PI; return <circle key={i} cx={hx + Math.cos(a) * (headR + 4)} cy={hy - 8 + Math.sin(a) * (headR + 4)} r={20} fill={hc} stroke={INK} strokeWidth={LW} />; })}</g>;
      default: return null;
    }
  };
  // hair FRONT layer (on top of head)
  const hairFront = () => {
    if (d.hat === "hijab" || d.hat === "helmet") return null;
    switch (hair) {
      case "short": return <path d={`M${hx - headR + 2} ${hy - 8} Q${hx - headR} ${hy - headR - 14} ${hx} ${hy - headR - 10} Q${hx + headR} ${hy - headR - 14} ${hx + headR - 2} ${hy - 8} Q${hx + 30} ${hy - headR + 6} ${hx - 10} ${hy - headR + 12} Q${hx - 40} ${hy - headR + 16} ${hx - headR + 2} ${hy - 8}Z`} fill={hc} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "side": return <path d={`M${hx - headR + 2} ${hy - 2} Q${hx - headR - 4} ${hy - headR - 20} ${hx + 10} ${hy - headR - 12} Q${hx + headR + 6} ${hy - headR} ${hx + headR - 2} ${hy - 10} Q${hx + 10} ${hy - headR + 4} ${hx - 20} ${hy - headR + 26} Q${hx - 40} ${hy - 30} ${hx - headR + 2} ${hy - 2}Z`} fill={hc} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "spiky": return <path d={`M${hx - headR} ${hy - 10} L${hx - headR + 4} ${hy - headR - 18} L${hx - 26} ${hy - headR - 4} L${hx - 14} ${hy - headR - 34} L${hx + 4} ${hy - headR - 6} L${hx + 22} ${hy - headR - 32} L${hx + 30} ${hy - headR - 2} L${hx + headR} ${hy - headR - 14} L${hx + headR} ${hy - 10} Q${hx} ${hy - headR + 10} ${hx - headR} ${hy - 10}Z`} fill={hc} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "mohawk": return <path d={`M${hx - 12} ${hy - headR + 8} L${hx - 18} ${hy - headR - 40} L${hx} ${hy - headR - 26} L${hx + 6} ${hy - headR - 50} L${hx + 16} ${hy - headR - 22} L${hx + 14} ${hy - headR + 8}Z`} fill={hc} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "bun": return <g><circle cx={hx} cy={hy - headR - 20} r={24} fill={hc} stroke={INK} strokeWidth={LW} /><path d={`M${hx - headR + 2} ${hy - 6} Q${hx - headR} ${hy - headR - 10} ${hx} ${hy - headR - 6} Q${hx + headR} ${hy - headR - 10} ${hx + headR - 2} ${hy - 6} Q${hx} ${hy - headR + 14} ${hx - headR + 2} ${hy - 6}Z`} fill={hc} stroke={INK} strokeWidth={LW} /></g>;
      case "long": case "bob": case "pony": case "braids": return <path d={`M${hx - headR + 2} ${hy + 4} Q${hx - headR - 4} ${hy - headR - 16} ${hx} ${hy - headR - 8} Q${hx + headR + 4} ${hy - headR - 16} ${hx + headR - 2} ${hy + 4} Q${hx + headR - 14} ${hy - 30} ${hx + 6} ${hy - headR + 16} Q${hx - 30} ${hy - 26} ${hx - headR + 2} ${hy + 4}Z`} fill={hc} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "afro": return null;
      case "curly": return <g>{[...Array(5)].map((_, i) => <circle key={i} cx={hx - 36 + i * 18} cy={hy - headR + 6 + (i % 2) * 6} r={15} fill={hc} stroke={INK} strokeWidth={LW} />)}</g>;
      case "bald": return old ? <path d={`M${hx - headR + 4} ${hy + 4} q -8 -20 4 -34 M${hx + headR - 4} ${hy + 4} q 8 -20 -4 -34`} stroke={hc} strokeWidth={12} fill="none" strokeLinecap="round" /> : null;
      default: return null;
    }
  };
  const hat = () => {
    const hy0 = hy - headR + 6;
    switch (d.hat) {
      case "cap": return <g><path d={`M${hx - headR} ${hy0 + 10} Q${hx} ${hy0 - 70} ${hx + headR} ${hy0 + 10} Z`} fill={hatC} stroke={INK} strokeWidth={LW} /><path d={`M${hx + headR - 20} ${hy0 + 6} Q${hx + headR + 50} ${hy0 + 2} ${hx + headR + 52} ${hy0 + 16} H${hx + headR - 10}Z`} fill={mix(hatC, "#000000", 0.2)} stroke={INK} strokeWidth={LW} /></g>;
      case "beanie": return <g><path d={`M${hx - headR - 2} ${hy0 + 14} Q${hx} ${hy0 - 80} ${hx + headR + 2} ${hy0 + 14} Z`} fill={hatC} stroke={INK} strokeWidth={LW} /><rect x={hx - headR - 4} y={hy0 + 2} width={headR * 2 + 8} height={20} rx={8} fill={mix(hatC, "#000000", 0.2)} stroke={INK} strokeWidth={LW} /><circle cx={hx} cy={hy0 - 50} r={13} fill="#fff" stroke={INK} strokeWidth={4} /></g>;
      case "hard": return <g><path d={`M${hx - headR - 4} ${hy0 + 12} Q${hx} ${hy0 - 74} ${hx + headR + 4} ${hy0 + 12} Z`} fill="#ffc31f" stroke={INK} strokeWidth={LW} /><rect x={hx - headR - 14} y={hy0 + 6} width={headR * 2 + 28} height={12} rx={6} fill="#ffb000" stroke={INK} strokeWidth={4} /><rect x={hx - 6} y={hy0 - 56} width={12} height={58} fill="#ffb000" /></g>;
      case "chef": return <g><rect x={hx - headR + 4} y={hy0 - 24} width={headR * 2 - 8} height={32} fill="#fff" stroke={INK} strokeWidth={LW} />{[-30, 0, 30].map((x) => <circle key={x} cx={hx + x} cy={hy0 - 50} r={30} fill="#fff" stroke={INK} strokeWidth={LW} />)}<rect x={hx - headR + 6} y={hy0 - 34} width={headR * 2 - 12} height={20} fill="#fff" /></g>;
      case "explorer": return <g><path d={`M${hx - headR - 34} ${hy0 + 10} Q${hx} ${hy0 - 6} ${hx + headR + 34} ${hy0 + 10} Q${hx} ${hy0 + 22} ${hx - headR - 34} ${hy0 + 10}Z`} fill="#c99a52" stroke={INK} strokeWidth={LW} /><path d={`M${hx - headR + 8} ${hy0 + 6} Q${hx} ${hy0 - 70} ${hx + headR - 8} ${hy0 + 6}Z`} fill="#d8ad66" stroke={INK} strokeWidth={LW} /><rect x={hx - headR + 8} y={hy0 - 8} width={headR * 2 - 16} height={10} fill="#7a4f22" /></g>;
      case "crown": return <path d={`M${hx - 44} ${hy0 + 2} L${hx - 48} ${hy0 - 44} L${hx - 22} ${hy0 - 20} L${hx} ${hy0 - 54} L${hx + 22} ${hy0 - 20} L${hx + 48} ${hy0 - 44} L${hx + 44} ${hy0 + 2}Z`} fill="#ffcc33" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
      case "headset": return <g><path d={`M${hx - headR - 4} ${hy} Q${hx} ${hy - headR - 50} ${hx + headR + 4} ${hy}`} stroke={hatC} strokeWidth={9} fill="none" /><rect x={hx - headR - 14} y={hy - 18} width={20} height={36} rx={8} fill={hatC} stroke={INK} strokeWidth={4} /><rect x={hx + headR - 6} y={hy - 18} width={20} height={36} rx={8} fill={hatC} stroke={INK} strokeWidth={4} /><path d={`M${hx - headR - 4} ${hy + 14} Q${hx - 40} ${hy + 50} ${hx - 14} ${hy + 46}`} stroke={hatC} strokeWidth={5} fill="none" /></g>;
      case "helmet": return <g><circle cx={hx} cy={hy} r={headR + 26} fill="#bfe6ff" fillOpacity={0.25} stroke="#eef1f6" strokeWidth={14} /><circle cx={hx} cy={hy} r={headR + 26} fill="none" stroke={INK} strokeWidth={LW} /><path d={`M${hx - 30} ${hy - headR - 4} q 20 -10 46 2`} stroke="#fff" strokeWidth={6} opacity={0.8} fill="none" /></g>;
      case "hijab": return <g><path d={`M${hx - headR - 12} ${hy + 6} Q${hx - headR - 14} ${hy - headR - 20} ${hx} ${hy - headR - 18} Q${hx + headR + 14} ${hy - headR - 20} ${hx + headR + 12} ${hy + 6} Q${hx + headR + 18} ${hy + 70} ${hx + 50} ${hy + 92} H${hx - 50} Q${hx - headR - 18} ${hy + 70} ${hx - headR - 12} ${hy + 6}Z`} fill={hatC} stroke={INK} strokeWidth={LW} /><ellipse cx={hx} cy={hy + 10} rx={headR - 10} ry={headR - 4} fill={d.skin} /></g>;
      case "turban": return <g><path d={`M${hx - headR - 6} ${hy - 4} Q${hx - headR - 10} ${hy - headR - 50} ${hx} ${hy - headR - 46} Q${hx + headR + 10} ${hy - headR - 50} ${hx + headR + 6} ${hy - 4} Q${hx} ${hy - headR + 4} ${hx - headR - 6} ${hy - 4}Z`} fill={hatC} stroke={INK} strokeWidth={LW} /><path d={`M${hx - headR} ${hy - 20} Q${hx} ${hy - headR - 30} ${hx + headR - 6} ${hy - headR - 18}`} stroke={mix(hatC, "#000000", 0.2)} strokeWidth={6} fill="none" /></g>;
      case "beret": return <g><ellipse cx={hx + 8} cy={hy0 - 6} rx={headR + 10} ry={22} fill={hatC} stroke={INK} strokeWidth={LW} /><rect x={hx + 4} y={hy0 - 36} width={6} height={12} fill={INK} /></g>;
      case "cowboy": return <g><path d={`M${hx - headR - 46} ${hy0 + 8} Q${hx - headR - 30} ${hy0 + 24} ${hx} ${hy0 + 16} Q${hx + headR + 30} ${hy0 + 24} ${hx + headR + 46} ${hy0 + 8} Q${hx} ${hy0 + 2} ${hx - headR - 46} ${hy0 + 8}Z`} fill={hatC} stroke={INK} strokeWidth={LW} /><path d={`M${hx - headR + 6} ${hy0 + 10} L${hx - headR + 12} ${hy0 - 54} Q${hx} ${hy0 - 40} ${hx + headR - 12} ${hy0 - 54} L${hx + headR - 6} ${hy0 + 10}Z`} fill={hatC} stroke={INK} strokeWidth={LW} /></g>;
      case "grad": return <g><path d={`M${hx - headR + 6} ${hy0 + 6} V${hy0 - 22} H${hx + headR - 6} V${hy0 + 6}`} fill="#222" stroke={INK} strokeWidth={LW} /><path d={`M${hx - 80} ${hy0 - 26} L${hx} ${hy0 - 56} L${hx + 80} ${hy0 - 26} L${hx} ${hy0 + 4}Z`} fill="#222" stroke={INK} strokeWidth={LW} /><path d={`M${hx + 40} ${hy0 - 28} V${hy0 + 20}`} stroke="#ffcc33" strokeWidth={4} /></g>;
      default: return null;
    }
  };
  const topShape = () => {
    const tb = torsoBottom;
    const base = <path d={`M${-shoulder} ${shY} Q0 ${shY - 14} ${shoulder} ${shY} L${shoulder - 6 + (longTop ? 14 : 0)} ${tb} Q0 ${tb + 8} ${-shoulder + 6 - (longTop ? 14 : 0)} ${tb}Z`} fill={d.topC} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />;
    switch (d.top) {
      case "tee": return <g>{base}<path d={`M-14 ${shY - 6} Q0 ${shY + 12} 14 ${shY - 6}`} stroke={INK} strokeWidth={4} fill={d.skin} /></g>;
      case "hoodie": return <g>{base}<path d={`M-30 ${shY - 4} Q0 ${shY + 36} 30 ${shY - 4}`} stroke={INK} strokeWidth={4} fill={mix(d.topC, "#000000", 0.15)} /><path d={`M-28 ${tb - 50} H28 L22 ${tb - 14} H-22Z`} fill={mix(d.topC, "#000000", 0.12)} stroke={INK} strokeWidth={3} /><line x1={-8} y1={shY + 14} x2={-10} y2={shY + 46} stroke="#fff" strokeWidth={3} /><line x1={8} y1={shY + 14} x2={10} y2={shY + 46} stroke="#fff" strokeWidth={3} /></g>;
      case "suit": return <g>{base}<path d={`M-16 ${shY - 4} L0 ${shY + 50} L16 ${shY - 4}Z`} fill="#fff" stroke={INK} strokeWidth={3} /><path d={`M-6 ${shY + 4} L6 ${shY + 4} L4 ${shY + 64} L0 ${shY + 74} L-4 ${shY + 64}Z`} fill={d.tie ?? "#c0392b"} stroke={INK} strokeWidth={3} /><path d={`M-16 ${shY - 4} L-34 ${shY + 40} L-6 ${shY + 74} M16 ${shY - 4} L34 ${shY + 40} L6 ${shY + 74}`} stroke={INK} strokeWidth={4} fill="none" /></g>;
      case "lab": return <g><path d={`M${-shoulder + 10} ${shY} H${shoulder - 10} L${shoulder - 14} ${hipY + 4} H${-shoulder + 14}Z`} fill={d.topC2 ?? "#4a7bd1"} />{base}<path d={`M-18 ${shY - 2} L-6 ${tb} M18 ${shY - 2} L6 ${tb}`} stroke={INK} strokeWidth={4} /><path d={`M-18 ${shY} L0 ${shY + 40} L18 ${shY}`} fill={d.topC2 ?? "#4a7bd1"} stroke={INK} strokeWidth={3} /><rect x={20} y={shY + 50} width={22} height={6} fill="#e4473b" /></g>;
      case "dress": return <g><path d={`M${-shoulder + 6} ${shY} Q0 ${shY - 12} ${shoulder - 6} ${shY} L${shoulder + 26} ${tb + 10} Q0 ${tb + 26} ${-shoulder - 26} ${tb + 10}Z`} fill={d.topC} stroke={INK} strokeWidth={LW} strokeLinejoin="round" /><path d={`M${-shoulder + 14} ${hipY - 30} H${shoulder - 14}`} stroke={mix(d.topC, "#000000", 0.25)} strokeWidth={8} /><path d={`M-14 ${shY - 6} Q0 ${shY + 14} 14 ${shY - 6}`} stroke={INK} strokeWidth={4} fill={d.skin} /></g>;
      case "jacket": return <g><path d={`M-20 ${shY} H20 V${tb} H-20Z`} fill={d.topC2 ?? "#f2f2f2"} />{base}<path d={`M-20 ${shY - 2} V${tb} M20 ${shY - 2} V${tb}`} stroke={INK} strokeWidth={4} /><path d={`M-20 ${shY - 2} L-34 ${shY + 30} L-20 ${shY + 40} M20 ${shY - 2} L34 ${shY + 30} L20 ${shY + 40}`} stroke={INK} strokeWidth={4} fill={mix(d.topC, "#000000", 0.15)} /></g>;
      case "sweater": return <g>{base}<rect x={-22} y={shY - 8} width={44} height={16} rx={8} fill={mix(d.topC, "#000000", 0.15)} stroke={INK} strokeWidth={3} />{[0, 1, 2].map((i) => <path key={i} d={`M${-shoulder + 10} ${shY + 50 + i * 26} H${shoulder - 10}`} stroke={mix(d.topC, "#ffffff", 0.35)} strokeWidth={6} />)}</g>;
      case "uniform": return <g>{base}<path d={`M-16 ${shY - 2} L0 ${shY + 24} L16 ${shY - 2}`} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-26} cy={shY + 44} r={11} fill="#ffcc33" stroke={INK} strokeWidth={3} /><rect x={14} y={shY + 36} width={26} height={16} rx={3} fill={mix(d.topC, "#000000", 0.2)} stroke={INK} strokeWidth={2} />{[0, 1, 2].map((i) => <circle key={i} cx={0} cy={shY + 46 + i * 26} r={4} fill="#ffcc33" />)}</g>;
      case "apron": return <g>{base}<path d={`M-34 ${shY + 30} H34 L38 ${tb + 4} H-38Z`} fill="#fff" stroke={INK} strokeWidth={4} /><path d={`M-24 ${shY + 30} L-30 ${shY} M24 ${shY + 30} L30 ${shY}`} stroke="#fff" strokeWidth={6} /><rect x={-14} y={shY + 70} width={28} height={20} rx={4} fill="none" stroke={INK} strokeWidth={3} /></g>;
      case "overalls": return <g><path d={`M${-shoulder} ${shY} Q0 ${shY - 14} ${shoulder} ${shY} L${shoulder - 6} ${tb} Q0 ${tb + 8} ${-shoulder + 6} ${tb}Z`} fill={d.topC2 ?? "#f2f2f2"} stroke={INK} strokeWidth={LW} />{[0, 1, 2].map((i) => <rect key={i} x={-shoulder + 4} y={shY + 12 + i * 30} width={shoulder * 2 - 8} height={10} fill={mix(d.topC2 ?? "#ddd", "#000000", 0.15)} />)}<path d={`M-36 ${shY + 50} H36 L${shoulder - 6} ${tb} Q0 ${tb + 8} ${-shoulder + 6} ${tb}Z`} fill={d.topC} stroke={INK} strokeWidth={LW} /><path d={`M-30 ${shY + 50} L-26 ${shY - 4} M30 ${shY + 50} L26 ${shY - 4}`} stroke={d.topC} strokeWidth={9} /></g>;
      case "space": return <g><path d={`M${-shoulder - 8} ${shY} Q0 ${shY - 18} ${shoulder + 8} ${shY} L${shoulder + 2} ${tb} Q0 ${tb + 10} ${-shoulder - 2} ${tb}Z`} fill="#eef1f6" stroke={INK} strokeWidth={LW} /><rect x={-24} y={shY + 30} width={48} height={34} rx={6} fill="#c9d3e6" stroke={INK} strokeWidth={3} />{[0, 1, 2].map((i) => <circle key={i} cx={-12 + i * 12} cy={shY + 47} r={4} fill={["#e4473b", "#ffcc33", "#3ddc97"][i]} opacity={0.6 + 0.4 * Math.sin(f * 0.3 + i)} />)}<rect x={-shoulder - 8} y={shY + 90} width={shoulder * 2 + 16} height={12} fill={d.topC} /></g>;
      case "kurta": return <g><path d={`M${-shoulder} ${shY} Q0 ${shY - 14} ${shoulder} ${shY} L${shoulder + 8} ${tb + 30} Q0 ${tb + 36} ${-shoulder - 8} ${tb + 30}Z`} fill={d.topC} stroke={INK} strokeWidth={LW} strokeLinejoin="round" /><path d={`M0 ${shY - 6} V${shY + 60}`} stroke={INK} strokeWidth={3} />{[0, 1, 2].map((i) => <circle key={i} cx={0} cy={shY + 14 + i * 16} r={3} fill={d.topC2 ?? "#ffcc33"} />)}<path d={`M-12 ${shY - 6} Q0 ${shY + 8} 12 ${shY - 6}`} stroke={INK} strokeWidth={3} fill="none" /></g>;
      default: return base;
    }
  };
  const eyes = () => {
    const ey = eyeY, sp = kid ? 22 : 20, r = kid ? 9 : 7.5;
    if (d.glasses === "shades") return <g><path d={`M${hx - 44} ${ey - 10} H${hx + 44} L${hx + 40} ${ey + 8} Q${hx + 24} ${ey + 18} ${hx + 8} ${ey + 6} H${hx - 8} Q${hx - 24} ${ey + 18} ${hx - 40} ${ey + 8}Z`} fill="#111" stroke={INK} strokeWidth={3} /><path d={`M${hx - 34} ${ey - 4} l10 0`} stroke="#fff" strokeWidth={3} opacity={0.6} /></g>;
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={hx + s * sp} cy={ey} rx={r + 4} ry={(r + 5) * blink} fill="#fff" stroke={INK} strokeWidth={3} />
            <circle cx={hx + s * sp + 2} cy={ey + 1} r={r * Math.min(1, blink * 1.5)} fill="#2a1d18" />
            <circle cx={hx + s * sp + 4} cy={ey - 2} r={2.2 * blink} fill="#fff" />
          </g>
        ))}
        {d.glasses === "round" && <g fill="none" stroke={INK} strokeWidth={4}><circle cx={hx - sp} cy={ey} r={17} /><circle cx={hx + sp} cy={ey} r={17} /><line x1={hx - 4} y1={ey} x2={hx + 4} y2={ey} /></g>}
        {d.glasses === "square" && <g fill="none" stroke={INK} strokeWidth={4}><rect x={hx - sp - 16} y={ey - 12} width={32} height={24} rx={5} /><rect x={hx + sp - 16} y={ey - 12} width={32} height={24} rx={5} /><line x1={hx - 4} y1={ey} x2={hx + 4} y2={ey} /></g>}
      </g>
    );
  };
  const brows = () => {
    const lift = mood === "surprised" ? -8 : talk > 0.5 ? -3 : 0;
    const bc = old ? "#bbb" : d.hair === "bald" || d.hair === "none" ? "#3a2a20" : mix(d.hairC, "#000000", 0.2);
    return <g stroke={bc} strokeWidth={5} strokeLinecap="round">{[-1, 1].map((s) => <path key={s} d={`M${hx + s * 12} ${eyeY - 20 + lift} Q${hx + s * 22} ${eyeY - 26 + lift} ${hx + s * 32} ${eyeY - 20 + lift}`} fill="none" />)}</g>;
  };
  const mouth = () => {
    if (mouthOpen) return <g><ellipse cx={hx} cy={mouthY} rx={10 + talk * 5} ry={4 + talk * 10} fill="#5a1a1a" stroke={INK} strokeWidth={3} /><ellipse cx={hx} cy={mouthY + 2 + talk * 5} rx={6} ry={3} fill="#e86a6a" /></g>;
    if (mood === "surprised") return <ellipse cx={hx} cy={mouthY} rx={8} ry={10} fill="#5a1a1a" stroke={INK} strokeWidth={3} />;
    return <path d={`M${hx - 14} ${mouthY - 3} Q${hx} ${mouthY + 10} ${hx + 14} ${mouthY - 3}`} stroke={d.lip ?? INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  };
  const facial = () => {
    switch (d.face) {
      case "beard": return <path d={`M${hx - headR + 6} ${hy + 4} Q${hx - headR + 4} ${hy + headR + 24} ${hx} ${hy + headR + 30} Q${hx + headR - 4} ${hy + headR + 24} ${hx + headR - 6} ${hy + 4} Q${hx + 20} ${mouthY + 18} ${hx} ${mouthY + 16} Q${hx - 20} ${mouthY + 18} ${hx - headR + 6} ${hy + 4}Z`} fill={old ? "#d8d8d8" : d.hairC} stroke={INK} strokeWidth={4} />;
      case "mustache": return <path d={`M${hx - 24} ${mouthY - 6} Q${hx - 12} ${mouthY - 18} ${hx} ${mouthY - 10} Q${hx + 12} ${mouthY - 18} ${hx + 24} ${mouthY - 6} Q${hx} ${mouthY - 4} ${hx - 24} ${mouthY - 6}Z`} fill={old ? "#d8d8d8" : d.hairC} stroke={INK} strokeWidth={3} />;
      case "stubble": return <g>{[...Array(18)].map((_, i) => <circle key={i} cx={hx - 34 + (i % 9) * 8.5} cy={mouthY + 10 + Math.floor(i / 9) * 8 + (i % 2) * 3} r={1.6} fill={mix(d.hairC, "#000000", 0.3)} opacity={0.6} />)}</g>;
      default: return null;
    }
  };
  return (
    <g transform={`translate(0 ${-bob * 0.3})`}>
      <ellipse cx={0} cy={4} rx={80 * bw} ry={12} fill="#000" opacity={0.16} />
      {/* legs */}
      {d.top !== "dress" || true ? (
        <g>
          <path d={legL} stroke={d.pants} strokeWidth={30 * bw} strokeLinecap="round" />
          <path d={legR} stroke={d.pants} strokeWidth={30 * bw} strokeLinecap="round" />
          <path d={legL} stroke={INK} strokeWidth={30 * bw + 8} strokeLinecap="round" opacity={0} />
        </g>
      ) : null}
      <ellipse cx={-hip / 2 - 10} cy={-6} rx={28} ry={13} fill={d.shoes} stroke={INK} strokeWidth={4} />
      <ellipse cx={hip / 2 + 10} cy={-6} rx={28} ry={13} fill={d.shoes} stroke={INK} strokeWidth={4} />
      {/* left arm (behind) */}
      <path d={aL.d} stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={aL.d} stroke={sleeve} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={aL.hx} cy={aL.hy} r={13} fill={d.skin} stroke={INK} strokeWidth={4} />
      {d.prop && d.prop !== "none" && <g transform={`translate(${aL.hx} ${aL.hy})`}><PropDraw p={d.prop} f={f} /></g>}
      {/* hair that falls behind the shoulders */}
      <g transform={`rotate(${Math.sin(f * 0.07 + seed) * 3 + talk * 2} 0 ${shY})`}>{hairBack()}</g>
      {/* torso */}
      <g transform={`translate(0 0)`}>{topShape()}</g>
      {/* neck */}
      <rect x={-12} y={shY - 22} width={24} height={26} fill={skinD} />
      {/* head */}
      <g transform={`rotate(${Math.sin(f * 0.07 + seed) * 3 + talk * 2} 0 ${shY})`}>
        {d.hat === "turban" || d.hat === "hijab" ? null : null}
        <ellipse cx={hx - headR + 2} cy={hy + 6} rx={10} ry={14} fill={d.skin} stroke={INK} strokeWidth={4} />
        <ellipse cx={hx + headR - 2} cy={hy + 6} rx={10} ry={14} fill={d.skin} stroke={INK} strokeWidth={4} />
        <ellipse cx={hx} cy={hy} rx={headR} ry={headR * 1.08} fill={d.skin} stroke={INK} strokeWidth={LW} />
        <ellipse cx={hx + 14} cy={hy + 20} rx={headR * 0.7} ry={headR * 0.6} fill={skinD} opacity={0.12} />
        {d.hat === "hijab" ? hat() : null}
        {old && <path d={`M${hx - 30} ${hy - 30} q 12 -4 24 0 M${hx + 6} ${hy - 30} q 12 -4 24 0`} stroke={skinD} strokeWidth={3} fill="none" opacity={0.7} />}
        {(d.blush || kid) && <g>{[-1, 1].map((s) => <ellipse key={s} cx={hx + s * 32} cy={mouthY - 10} rx={11} ry={6} fill="#ff6f8a" opacity={0.35} />)}</g>}
        {eyes()}
        {brows()}
        <path d={`M${hx + 2} ${eyeY + 8} Q${hx + 9} ${eyeY + 22} ${hx + 1} ${eyeY + 26}`} stroke={skinD} strokeWidth={4} fill="none" strokeLinecap="round" />
        {facial()}
        {mouth()}
        {hairFront()}
        {d.hat !== "hijab" ? hat() : null}
      </g>
      {/* right arm (front) */}
      <path d={aR.d} stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={aR.d} stroke={sleeve} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={aR.hx} cy={aR.hy} r={13} fill={d.skin} stroke={INK} strokeWidth={4} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// THE CAST — 50 characters
// ---------------------------------------------------------------------------------------------
const S = ["#f8dcc0", "#efc69d", "#dca877", "#bf8456", "#93603a", "#64402a"]; // skin tones
export const CAST: PersonDef[] = [
  { name: "Scientist", skin: S[1], hair: "side", hairC: "#3a2a20", top: "lab", topC: "#fbfbf8", topC2: "#3d6ccf", pants: "#2c3550", shoes: "#3a2a20", glasses: "round", prop: "flask" },
  { name: "Explorer", skin: S[2], hair: "short", hairC: "#4a3020", top: "jacket", topC: "#c8893a", topC2: "#efe6d2", pants: "#5a4a32", shoes: "#4a3020", hat: "explorer", prop: "mag", face: "stubble" },
  { name: "Astronaut", skin: S[3], hair: "short", hairC: "#222", top: "space", topC: "#3d6ccf", pants: "#eef1f6", shoes: "#c9d3e6", hat: "helmet" },
  { name: "Detective", skin: S[0], hair: "side", hairC: "#6b4423", top: "jacket", topC: "#8a6a3a", topC2: "#f0e8d8", pants: "#3a3a44", shoes: "#2a2a2a", hat: "beret", hatC: "#6b5a3a", prop: "mag", face: "mustache" },
  { name: "Teacher", skin: S[2], hair: "bun", hairC: "#2a1d18", top: "sweater", topC: "#2f8f6a", pants: "#2c3550", shoes: "#5a3a22", glasses: "square", prop: "pointer" },
  { name: "Hacker", skin: S[0], hair: "none", hairC: "#222", top: "hoodie", topC: "#22262f", pants: "#1d2028", shoes: "#e4473b", hat: "headset", hatC: "#5ac8fa", glasses: "square", prop: "laptop" },
  { name: "Chef", skin: S[3], hair: "short", hairC: "#222", top: "apron", topC: "#e8e8e8", pants: "#3a3a44", shoes: "#222", hat: "chef", face: "mustache" },
  { name: "Doctor", skin: S[4], hair: "short", hairC: "#1c1410", top: "lab", topC: "#fbfbf8", topC2: "#5fc7b2", pants: "#4aa39a", shoes: "#fff", glasses: "none", prop: "coffee" },
  { name: "Engineer", skin: S[2], hair: "short", hairC: "#3a2a20", top: "overalls", topC: "#3b63b8", topC2: "#ff8a3d", pants: "#3b63b8", shoes: "#5a3a22", hat: "hard", prop: "wrench", face: "beard" },
  { name: "Grandpa", skin: S[1], hair: "bald", hairC: "#cfcfcf", top: "sweater", topC: "#8a5a2b", pants: "#5a5a64", shoes: "#3a2a20", glasses: "round", face: "mustache", age: "old", prop: "book" },
  { name: "Grandma", skin: S[2], hair: "bun", hairC: "#d9d9d9", top: "dress", topC: "#9b59b6", pants: "#5a3a6a", shoes: "#5a3a22", glasses: "round", age: "old", prop: "coffee" },
  { name: "Gamer Kid", skin: S[1], hair: "spiky", hairC: "#ff8a3d", top: "tee", topC: "#e4473b", pants: "#2c3550", shoes: "#fff", age: "kid", prop: "phone" },
  { name: "School Girl", skin: S[3], hair: "braids", hairC: "#2a1d18", top: "dress", topC: "#3d6ccf", pants: "#2c3550", shoes: "#222", age: "kid", prop: "book" },
  { name: "Pilot", skin: S[2], hair: "short", hairC: "#222", top: "uniform", topC: "#1f3b70", pants: "#1f3b70", shoes: "#111", hat: "cap", hatC: "#1f3b70", glasses: "shades" },
  { name: "King", skin: S[1], hair: "curly", hairC: "#6b4423", top: "kurta", topC: "#7b1f3a", topC2: "#ffcc33", pants: "#3a1a2a", shoes: "#ffcc33", hat: "crown", face: "beard" },
  { name: "Traveler", skin: S[3], hair: "none", hairC: "#111", top: "kurta", topC: "#f4ecd8", topC2: "#ffcc33", pants: "#f4ecd8", shoes: "#c99a52", hat: "turban", hatC: "#2f6db5", glasses: "none" },
  { name: "Reporter", skin: S[0], hair: "bob", hairC: "#c4572a", top: "suit", topC: "#e4473b", tie: "#fff", pants: "#222", shoes: "#222", prop: "mic" },
  { name: "Business", skin: S[4], hair: "side", hairC: "#111", top: "suit", topC: "#2c3550", tie: "#ffcc33", pants: "#2c3550", shoes: "#111", prop: "phone" },
  { name: "Artist", skin: S[1], hair: "long", hairC: "#7a4a26", top: "tee", topC: "#ffcf3a", pants: "#3b63b8", shoes: "#e4473b", hat: "beret", hatC: "#e4473b", prop: "brush" },
  { name: "Photographer", skin: S[2], hair: "pony", hairC: "#2a1d18", top: "jacket", topC: "#2f8f6a", topC2: "#f4f1ea", pants: "#3a3a44", shoes: "#5a3a22", prop: "camera" },
  { name: "Athlete", skin: S[5], hair: "short", hairC: "#111", top: "tee", topC: "#ff8a3d", pants: "#222", shoes: "#fff", bw: 1.15, prop: "ball" },
  { name: "Cowboy", skin: S[2], hair: "short", hairC: "#6b4423", top: "jacket", topC: "#a0522d", topC2: "#e8dcc0", pants: "#3b63b8", shoes: "#5a3a22", hat: "cowboy", hatC: "#8a5a2b", face: "stubble" },
  { name: "Student", skin: S[3], hair: "curly", hairC: "#2a1d18", top: "hoodie", topC: "#7b5cff", pants: "#2c3550", shoes: "#fff", glasses: "round", prop: "book" },
  { name: "Graduate", skin: S[4], hair: "long", hairC: "#111", top: "dress", topC: "#222", pants: "#222", shoes: "#222", hat: "grad" },
  { name: "Hijabi Coder", skin: S[2], hair: "none", hairC: "#111", top: "jacket", topC: "#2f8f6a", topC2: "#f4f1ea", pants: "#2c3550", shoes: "#fff", hat: "hijab", hatC: "#c0392b", prop: "laptop" },
  { name: "Uncle Ji", skin: S[3], hair: "side", hairC: "#3a3a3a", top: "kurta", topC: "#f4f1ea", topC2: "#888", pants: "#f4f1ea", shoes: "#5a3a22", face: "mustache", bw: 1.2, prop: "coffee" },
  { name: "Mechanic", skin: S[1], hair: "short", hairC: "#c4572a", top: "overalls", topC: "#2f6db5", topC2: "#f2f2f2", pants: "#2f6db5", shoes: "#222", hat: "cap", hatC: "#e4473b", prop: "wrench" },
  { name: "Nurse", skin: S[1], hair: "pony", hairC: "#e2b04a", top: "uniform", topC: "#5fc7b2", pants: "#5fc7b2", shoes: "#fff", prop: "none" },
  { name: "Rapper", skin: S[5], hair: "afro", hairC: "#111", top: "hoodie", topC: "#e4473b", pants: "#222", shoes: "#fff", glasses: "shades", prop: "mic" },
  { name: "Skater", skin: S[0], hair: "long", hairC: "#e2b04a", top: "tee", topC: "#3ddc97", pants: "#3b63b8", shoes: "#222", hat: "beanie", hatC: "#ff8a3d" },
  { name: "Punk", skin: S[0], hair: "mohawk", hairC: "#e4473b", top: "jacket", topC: "#222", topC2: "#e4473b", pants: "#222", shoes: "#222", glasses: "none" },
  { name: "Librarian", skin: S[1], hair: "bob", hairC: "#6b4423", top: "sweater", topC: "#c0392b", pants: "#3a3a44", shoes: "#5a3a22", glasses: "square", prop: "book" },
  { name: "Gardener", skin: S[3], hair: "short", hairC: "#3a2a20", top: "overalls", topC: "#5a8a3a", topC2: "#ffcf3a", pants: "#5a8a3a", shoes: "#5a3a22", hat: "cap", hatC: "#5a8a3a", face: "beard" },
  { name: "Influencer", skin: S[2], hair: "long", hairC: "#e2b04a", top: "dress", topC: "#ff6fae", pants: "#222", shoes: "#fff", glasses: "shades", prop: "phone", blush: true },
  { name: "Space Kid", skin: S[4], hair: "curly", hairC: "#111", top: "space", topC: "#ff8a3d", pants: "#eef1f6", shoes: "#c9d3e6", age: "kid", hat: "helmet" },
  { name: "Professor", skin: S[0], hair: "bald", hairC: "#ececec", top: "suit", topC: "#6b5a3a", tie: "#2f6db5", pants: "#3a3a44", shoes: "#3a2a20", glasses: "round", face: "beard", age: "old", prop: "pointer" },
  { name: "Imam / Scholar", skin: S[3], hair: "none", hairC: "#111", top: "kurta", topC: "#fbfbf8", topC2: "#ccc", pants: "#fbfbf8", shoes: "#5a3a22", hat: "turban", hatC: "#fbfbf8", face: "beard", prop: "book" },
  { name: "Firefighter", skin: S[2], hair: "short", hairC: "#222", top: "uniform", topC: "#d6452f", pants: "#2c3550", shoes: "#222", hat: "hard", face: "stubble" },
  { name: "Police", skin: S[4], hair: "short", hairC: "#111", top: "uniform", topC: "#1f3b70", pants: "#1f3b70", shoes: "#111", hat: "cap", hatC: "#1f3b70" },
  { name: "DJ", skin: S[1], hair: "spiky", hairC: "#7b5cff", top: "tee", topC: "#111", pants: "#222", shoes: "#3ddc97", hat: "headset", hatC: "#3ddc97", glasses: "shades" },
  { name: "Baker", skin: S[0], hair: "bun", hairC: "#c4572a", top: "apron", topC: "#ff9fb2", pants: "#5a3a6a", shoes: "#fff", hat: "none", blush: true, prop: "coffee" },
  { name: "Farmer", skin: S[3], hair: "short", hairC: "#6b4423", top: "overalls", topC: "#3b63b8", topC2: "#c0392b", pants: "#3b63b8", shoes: "#5a3a22", hat: "cowboy", hatC: "#d8ad66", face: "stubble" },
  { name: "YouTuber", skin: S[2], hair: "side", hairC: "#111", top: "hoodie", topC: "#ff0033", pants: "#222", shoes: "#fff", prop: "camera" },
  { name: "Marathoner", skin: S[5], hair: "short", hairC: "#111", top: "tee", topC: "#ffcf3a", pants: "#222", shoes: "#3ddc97", bw: 0.9, h: 1.06 },
  { name: "Brainy Girl", skin: S[0], hair: "pony", hairC: "#c4572a", top: "sweater", topC: "#3d6ccf", pants: "#2c3550", shoes: "#e4473b", glasses: "round", age: "kid", prop: "globe" },
  { name: "Historian", skin: S[2], hair: "side", hairC: "#888", top: "jacket", topC: "#6b5a3a", topC2: "#f0e8d8", pants: "#3a3a44", shoes: "#3a2a20", glasses: "square", face: "beard", age: "old", prop: "globe" },
  { name: "Diver", skin: S[1], hair: "short", hairC: "#3a2a20", top: "space", topC: "#ffcf3a", pants: "#222", shoes: "#222", hat: "helmet" },
  { name: "Robot Fan", skin: S[4], hair: "afro", hairC: "#2a1d18", top: "tee", topC: "#5ac8fa", pants: "#2c3550", shoes: "#fff", glasses: "square", prop: "laptop", age: "kid" },
  { name: "Sufi Poet", skin: S[3], hair: "long", hairC: "#222", top: "kurta", topC: "#2f8f6a", topC2: "#ffcc33", pants: "#f4f1ea", shoes: "#5a3a22", face: "beard", prop: "book" },
  { name: "Host Uzair-style", skin: S[3], hair: "side", hairC: "#111", top: "jacket", topC: "#1d2b4f", topC2: "#ffffff", pants: "#2c3550", shoes: "#fff", face: "beard", prop: "laptop" },
];

// ---------------------------------------------------------------------------------------------
// SHEET: 5 pages × 10 characters (1920×1080), cycles every 90 frames
// ---------------------------------------------------------------------------------------------
const PAGE = 90;
export const HumansSheet: React.FC = () => {
  const f = useCurrentFrame();
  const page = Math.min(4, Math.floor(f / PAGE));
  const lf = f - page * PAGE;
  const slide = lf < 10 && page > 0 ? (1 - lf / 10) * 1920 : 0;
  const W = 1920, Hh = 1080, cols = 5, rows = 2, cw = 360, chh = 470, gx = 30, gy = 120;
  return (
    <AbsoluteFill style={{ background: "#14151c" }}>
      <FontStyle />
      <svg width={W} height={Hh} viewBox={`0 0 ${W} ${Hh}`}>
        <text x={W / 2} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill="#FFD60A" stroke="#000" strokeWidth={6} paintOrder="stroke">THE CAST · {page * 10 + 1}–{page * 10 + 10} of 50</text>
        <g transform={`translate(${slide} 0)`}>
          {CAST.slice(page * 10, page * 10 + 10).map((d, i) => {
            const n = page * 10 + i + 1;
            const col = i % cols, row = Math.floor(i / cols);
            const x = gx + col * (cw + 18), y = gy + row * (chh + 18);
            const talk = Math.max(0, Math.sin(f * 0.5 + n)) * (Math.sin(f * 0.09 + n) > 0 ? 1 : 0);
            const wave = Math.sin(f * 0.05 + n * 2) > 0.3 ? 1 : 0;
            const hue = ["#e9f6f4", "#fff1e4", "#eef0ff", "#e8fff4", "#fff7d6", "#f3ecff", "#ffe9ee", "#e6f4ff"][n % 8];
            return (
              <g key={n} transform={`translate(${x} ${y})`}>
                <rect width={cw} height={chh} rx={24} fill={hue} stroke="#000" strokeWidth={4} />
                <circle cx={40} cy={40} r={26} fill="#FFD60A" stroke="#000" strokeWidth={4} />
                <text x={40} y={51} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={n > 9 ? 26 : 30} fill="#000">{n}</text>
                <text x={78} y={50} fontFamily={FONT} fontWeight={800} fontSize={d.name.length > 12 ? 22 : 27} fill="#111">{d.name.toUpperCase()}</text>
                <g transform={`translate(${cw / 2} ${chh - 20}) scale(0.74)`}><Person d={d} f={f} seed={n * 1.3} talk={talk} wave={wave} /></g>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
