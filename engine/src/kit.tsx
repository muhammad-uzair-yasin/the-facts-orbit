import React from "react";
import { Audio, interpolate, random, Sequence, staticFile } from "remotion";
// 9:16 variant of the stick-figure-shorts kit (grammar §10): 1080x1920, no --scale.
export const CAPTION_FONT = "InterLocal, Inter, sans-serif";
export const VW = 1080;
export const VH = 1920;
export const FontStyle: React.FC = () => (
  <style>{`@font-face{font-family:InterLocal;font-weight:800;src:url(${staticFile("inter800.woff2")}) format("woff2")}`}</style>
);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eout = (t: number) => 1 - Math.pow(1 - t, 3);
export const eback = (t: number) => { const c1 = 1.7, c3 = c1 + 1; return t >= 1 ? 1 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const rnd = (s: string) => random(s);
const hex = (c: string) => { const h = c.length === 4 ? "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b), k = clamp01(t);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, "0")).join("");
};
export const keys = (f: number, K: [number, number][]) => {
  for (let k = 0; k < K.length - 1; k++) if (f <= K[k + 1][0]) return lerp(K[k][1], K[k + 1][1], eio(ramp(f, K[k][0], K[k + 1][0])));
  return K[K.length - 1][1];
};
export const pop = (f: number, at: number, dur = 10) => eback(ramp(f, at, at + dur));
export type ShotDef = { from: number; to: number; z0?: number; z1?: number; fx?: number; fy?: number; slide?: number; render: (f: number, p: number) => React.ReactNode };
export const Shots: React.FC<{ f: number; shots: ShotDef[]; kicks?: [number, number][] }> = ({ f, shots, kicks = [] }) => {
  const s = shots.find((x) => f >= x.from && f < x.to) ?? shots[shots.length - 1];
  const p = ramp(f, s.from, s.to);
  // transition in: quick slide + zoom settle over 8 frames
  const tin = eout(ramp(f, s.from, s.from + 8));
  const z = lerp(s.z0 ?? 1, s.z1 ?? 1.06, eio(p)) * lerp(1.045, 1, tin);
  const fx = s.fx ?? VW / 2, fy = s.fy ?? VH / 2;
  const slideX = (1 - tin) * (s.slide ?? 54);
  // handheld drift (frames-only style)
  let dx = Math.sin(f * 0.051) * 5 + Math.sin(f * 0.023 + 2) * 3 + slideX;
  let dy = Math.sin(f * 0.043 + 1) * 5 + Math.sin(f * 0.019) * 3;
  // impact shakes: damped spring kicks
  for (const [at, amp] of kicks) {
    const t = f - at;
    if (t >= 0 && t < 22) { const d = Math.exp(-t / 6); dx += Math.sin(t * 1.35) * amp * d; dy += Math.cos(t * 1.1) * amp * 0.6 * d; }
  }
  const rot = Math.sin(f * 0.017 + 3) * 0.22;
  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${dx} ${dy}) rotate(${rot} ${VW / 2} ${VH / 2}) translate(${fx} ${fy}) scale(${z}) translate(${-fx} ${-fy})`}>{s.render(f - s.from, p)}</g>
    </svg>
  );
};
export const INK = "#16161d";
export const LINE = 7;
export type Mood = "neutral" | "worried" | "sly" | "happy" | "surprised" | "sad";
export type FigureProps = {
  x: number; y: number; s?: number; facing?: 1 | -1;
  coat: string; coatDark?: string;
  walk?: number; armL?: number; armR?: number; elbowL?: number; elbowR?: number;
  mood?: Mood; look?: [number, number]; blink?: number; sweat?: number; talk?: number;
  hair?: "tuft" | "bun" | "none"; hairColor?: string;
  glasses?: boolean; scarf?: string; labCoat?: boolean;
  headTilt?: number; bob?: number; holdR?: React.ReactNode;
};
const limb = (sx: number, sy: number, a: number, len: number, bend = 0) => {
  const r1 = ((a) * Math.PI) / 180, r2 = ((a + bend) * Math.PI) / 180;
  const ex = sx + Math.sin(r1) * len * 0.52, ey = sy + Math.cos(r1) * len * 0.52;
  const hx = ex + Math.sin(r2) * len * 0.48, hy = ey + Math.cos(r2) * len * 0.48;
  return { d: `M ${sx},${sy} L ${ex},${ey} L ${hx},${hy}`, hx, hy };
};
export const Face: React.FC<{ mood: Mood; look: [number, number]; blink: number; cy: number; talk?: number }> = ({ mood, look, blink, cy, talk = 0 }) => {
  const [lx, ly] = look;
  const ey = cy - 4 + ly;
  const eh = (mood === "surprised" ? 15 : 12) * blink;
  const brow = (side: -1 | 1) => {
    const bx = side * 22 + lx, by = cy - 30 + ly;
    const inner = { neutral: 0, worried: -9, sly: 7, happy: -3, surprised: -10, sad: -8 }[mood];
    const outer = { neutral: 0, worried: 5, sly: -4, happy: -3, surprised: -10, sad: 6 }[mood];
    return <path d={`M ${bx - side * 12},${by + inner} L ${bx + side * 12},${by + outer}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />;
  };
  const my = cy + 26 + ly * 0.6, mx = lx * 0.8;
  const mouth = {
    neutral: `M ${mx - 9},${my} L ${mx + 9},${my}`,
    worried: `M ${mx - 12},${my + 3} q 6,-6 12,0 q 6,6 12,0`,
    sly: `M ${mx - 12},${my + 2} Q ${mx + 2},${my + 8} ${mx + 14},${my - 4}`,
    happy: `M ${mx - 14},${my - 3} Q ${mx},${my + 14} ${mx + 14},${my - 3}`,
    surprised: "",
    sad: `M ${mx - 12},${my + 6} Q ${mx},${my - 6} ${mx + 12},${my + 6}`,
  }[mood];
  return (
    <g>
      {[-1, 1].map((side) => <ellipse key={side} cx={side * 21 + lx} cy={ey} rx={8} ry={Math.max(1.5, eh)} fill={INK} />)}
      {brow(-1)}{brow(1)}
      {talk > 0.07 ? <ellipse cx={mx} cy={my + 2} rx={7 + talk * 5} ry={3 + talk * 11} fill={INK} /> : mood === "surprised" ? <ellipse cx={mx} cy={my + 2} rx={8} ry={10} fill={INK} /> : <path d={mouth} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
};
export const Figure: React.FC<FigureProps> = (p) => {
  const s = p.s ?? 1, fc = p.facing ?? 1, w = p.walk ?? 0;
  const walking = p.walk !== undefined && p.walk !== 0;
  const bob = (p.bob ?? 0) + (walking ? Math.abs(Math.sin(w)) * 6 : 0);
  const hipY = -150 - bob, shY = -282 - bob, headY = -352 - bob;
  const step = walking ? Math.sin(w) * 34 : 0;
  const lift = (ph: number) => (walking ? Math.max(0, Math.sin(ph)) * 14 : 0);
  const feet: [number, number][] = [[-20 - step, -10 - lift(w + Math.PI)], [20 + step, -10 - lift(w)]];
  const armSwing = walking ? Math.sin(w) * 22 : 0;
  const aL = limb(-40, shY + 10, (p.armL ?? -10) + armSwing, 120, p.elbowL ?? 0);
  const aR = limb(40, shY + 10, (p.armR ?? 10) - armSwing, 120, p.elbowR ?? 0);
  const coat = p.labCoat ? "#f4f4f2" : p.coat;
  const blink = p.blink ?? 1;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
      <ellipse cx={0} cy={2} rx={70} ry={11} fill="#000" opacity={0.22} />
      {feet.map(([fx, fy], k) => (
        <g key={k}>
          <path d={`M ${k ? 14 : -14},${hipY} L ${fx},${fy - 6}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${fx - 16},${fy + 4} q -2,-16 14,-16 l 10,0 q 20,2 22,16 z`} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        </g>
      ))}
      <path d={aL.d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={aL.hx} cy={aL.hy} r={15} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} />
      <path d={`M ${-46},${shY} Q 0,${shY - 16} 46,${shY} L 56,${hipY + 6} Q 0,${hipY + 18} -56,${hipY + 6} Z`} fill={coat} stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
      <path d={`M 0,${shY + 4} L 0,${hipY + 10}`} stroke={p.coatDark ?? mix(p.coat, "#000000", 0.35)} strokeWidth={4} />
      <path d={`M -30,${hipY - 34} l 20,0 M 10,${hipY - 34} l 20,0`} stroke={p.coatDark ?? mix(p.coat, "#000000", 0.35)} strokeWidth={4} strokeLinecap="round" />
      <g transform={`rotate(${p.headTilt ?? 0} 0 ${headY + 50})`}>
        <circle cx={0} cy={headY} r={62} fill="#fbfbf8" stroke={INK} strokeWidth={LINE} />
        {(p.hair ?? "tuft") === "tuft" && <path d={`M -10,${headY - 60} q 2,-26 22,-24 q -16,6 -8,22`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
        <Face mood={p.mood ?? "neutral"} look={p.look ?? [0, 0]} blink={blink} cy={headY + 6} talk={p.talk ?? 0} />
        {p.glasses && (
          <g stroke={INK} strokeWidth={5} fill="rgba(255,255,255,0.3)">
            <circle cx={-21} cy={headY + 2} r={17} /><circle cx={21} cy={headY + 2} r={17} />
            <line x1={-4} y1={headY + 2} x2={4} y2={headY + 2} /><line x1={37} y1={headY} x2={56} y2={headY - 6} />
          </g>
        )}
      </g>
      <path d={aR.d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {p.holdR && <g transform={`translate(${aR.hx} ${aR.hy})`}>{p.holdR}</g>}
      <circle cx={aR.hx} cy={aR.hy} r={15} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} />
    </g>
  );
};
export const blinkAt = (f: number, seed = 0) => { const q = (f + seed * 41) % 104; return q < 4 ? Math.abs(Math.cos((q / 4) * Math.PI)) * 0.9 + 0.1 : 1; };
// Plain subtitles, 9:16: top y 1360, margins 70, font 68 (grammar §10).
export const Captions: React.FC<{ f: number; words: [number, number, string][]; chunks: [number, number][]; y?: number; hide?: boolean; accent?: string }> = ({ f, words, chunks, y = 1650, hide, accent = "#e8921c" }) => {
  if (hide) return null;
  const c = chunks.find(([a, b], k) => f >= words[a][0] - 2 && f < (chunks[k + 1] ? Math.min(words[chunks[k + 1][0]][0] - 2, words[b][1] + 24) : words[b][1] + 24));
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.3 }}>
      {words.slice(c[0], c[1] + 1).map(([w0, w1, t], i) => {
        const active = f >= w0 && f <= w1 + 2;
        const said = f > w1 + 2;
        const popK = active ? 1 + 0.08 * Math.sin(clamp01((f - w0) / 5) * Math.PI) : 1;
        return (
          <span key={i} style={{ display: "inline-block", margin: "0 9px", transform: `scale(${popK})`,
            color: active ? "#ffffff" : said ? "#ffffff" : "rgba(255,255,255,0.4)",
            background: active ? accent : "transparent", borderRadius: 14, padding: active ? "2px 14px" : "2px 0",
            boxShadow: active ? "0 6px 18px rgba(0,0,0,0.45)" : "none",
            textShadow: active ? "none" : "0 2px 0 rgba(0,0,0,0.6), 0 0 18px rgba(0,0,0,0.55)" }}>{t}</span>
        );
      })}
    </div>
  );
};
export const Vignette: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
);
