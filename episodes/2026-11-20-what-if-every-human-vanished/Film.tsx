import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// ---------- cue lookup: frame = start frame of the n-th spoken word (from words.ts) ----------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const W = (word: string, n = 1) => {
  let k = 0;
  for (const [a, , t] of WORDS) if (norm(t) === norm(word) && ++k === n) return a;
  throw new Error("cue word not found: " + word + " #" + n);
};
/** Asker lines = consecutive asker phrases with no host phrase in between: [start, end]. */
const ASK: [number, number][] = (() => {
  const out: [number, number][] = [];
  let prev = "";
  for (const [a, b, s] of SPK) {
    if (s === "asker") { if (prev === "asker" && out.length) out[out.length - 1][1] = b; else out.push([a, b]); }
    prev = s;
  }
  return out;
})();

// cue table (global frames)
const F = {
  ask: ASK[0][0], vanished: W("vanished"), within: W("within"), hours: W("hours"), shutting: W("shutting"),
  andDay: W("and"), day: W("day"), lights: W("lights"), planet: W("planet"),
  fast: ASK[1][0], fast2: W("fast", 2), ny: W("new"), pumps: W("pumps"), millions: W("millions"), everyDay: W("every", 2),
  without: W("without"), flood: W("flood"), days: W("days"),
  pets: ASK[2][0], wild: W("wild"), big: W("big"), survive: W("survive"), tiny: W("tiny"), probably: W("probably"),
  cities: ASK[3][0], nature: W("nature"), already: W("already"), after: W("after"), chernobyl: W("chernobyl"), left: W("left"),
  wolves: W("wolves"), boar: W("boar"), horses: W("horses"), empty: W("empty"),
  last: ASK[4][0], houses: W("houses"), decades: W("decades"), bridges: W("bridges"), centuries: W("centuries"),
  but: W("but"), plastic: W("plastic"), ages: W("ages"), radio: W("radio"), space: W("space"), lightYears: W("light"),
  sub: W("subscribe"),
};

const ARTIST = CAST[18], PROF = CAST[35];
const NIGHT0 = "#070a1c", NIGHT1 = "#1a2150", DUSK0 = "#ff9a5a", DUSK1 = "#6a3c8f", GREEN = "#3ddc97", RED = "#ff4d3d", LEAF = "#4caf50", LEAF2 = "#2e7d32", WIN = "#ffd36b";
const GROUND = 1520;

// ---------- Q&A kit ----------
const Q: { text: string; hot?: boolean }[] = [
  { text: "EVERY HUMAN\nGONE?!", hot: true },
  { text: "THAT FAST?!", hot: true },
  { text: "OUR PETS?" },
  { text: "OUR CITIES?" },
  { text: "ANYTHING\nLAST?" },
];
const lineAt = (f: number) => ASK.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
const askMood = (f: number, base: "happy" | "neutral" | "surprised" = "happy") => { const i = lineAt(f); return i >= 0 ? (Q[i]?.hot ? "surprised" : "happy") : base; };
/** Big question bubble near the asker: pops on the line's first word, leaves when the line ends. */
const QBubble: React.FC<{ f: number; i: number; x: number; y: number; tx: number; ty: number; fs?: number }> = ({ f, i, x, y, tx, ty, fs = 78 }) => {
  if (!ASK[i] || !Q[i]) return null;
  const [a, b] = ASK[i];
  const st = i === 0 ? Math.max(a - 3, 34) : a - 3;
  const p = pop(f, st, 11), out = ramp(f, b + 8, b + 16);
  if (f < st || out >= 1) return null;
  const lines = Q[i].text.split("\n");
  const est = Math.max(...lines.map((l) => l.length)) * fs * 0.66;
  const w = Math.min(840, est + 100), h = lines.length * fs * 1.08 + 56;
  const cx = Math.max(110 + w / 2, Math.min(VW - 110 - w / 2, x));
  const hot = Q[i].hot;
  const k = Math.max(0, p) * (1 - eio(out));
  const bx = Math.max(cx - w / 2 + 60, Math.min(cx + w / 2 - 60, tx));
  return (
    <g transform={`translate(${cx} ${y}) rotate(${Math.sin(f * 0.18) * 1.6}) scale(${k}) translate(${-cx} ${-y})`} opacity={1 - out}>
      <rect x={cx - w / 2 + 10} y={y - h / 2 + 14} width={w} height={h} rx={44} fill="#000" opacity={0.28} />
      <path d={`M${bx - 34} ${y + h / 2 - 8} L${tx} ${ty} L${bx + 34} ${y + h / 2 - 8} Z`} fill={hot ? YEL : "#ffffff"} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <rect x={cx - w / 2} y={y - h / 2} width={w} height={h} rx={44} fill={hot ? YEL : "#ffffff"} stroke={INKC} strokeWidth={8} />
      <rect x={bx - 30} y={y + h / 2 - 14} width={60} height={12} fill={hot ? YEL : "#ffffff"} />
      {lines.map((l, j) => (
        <text key={j} x={cx} y={y - h / 2 + 28 + fs * 0.86 + j * fs * 1.08} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC}
          textLength={l.length * fs * 0.66 > w - 70 ? w - 70 : undefined} lengthAdjust="spacingAndGlyphs">{l}</text>
      ))}
    </g>
  );
};
/** Asker (left) + host (right) standing in the scene. */
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; askBase?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised"; wave?: boolean; hostWave?: boolean }> = ({ f, ax = 260, hx = 820, y = GROUND, s = 0.8, askBase = "happy", hostMood = "happy", wave, hostWave }) => {
  const hTalk = speaking(f, "host", SPK);
  return (
    <g>
      <g transform={`translate(${ax} ${y}) scale(${s})`}>
        <Person d={ARTIST} f={f} seed={19} talk={talkFor(f, "asker", SPK, ENV)} wave={wave ? 1 : 0} mood={askMood(f, askBase)} />
      </g>
      <g transform={`translate(${hx} ${y}) scale(${-s} ${s})`}>
        <Person d={PROF} f={f} seed={36} talk={talkFor(f, "host", SPK, ENV)} wave={hostWave || (hTalk && Math.sin(f * 0.045) > 0.55) ? 1 : 0} mood={hostMood} />
      </g>
    </g>
  );
};

// ---------- set pieces ----------
const Stars: React.FC<{ f: number; n?: number; seed?: string; h?: number; o?: number }> = ({ f, n = 80, seed = "st", h = VH, o = 1 }) => (
  <g opacity={o}>
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(seed + "x" + i) * VW} cy={rnd(seed + "y" + i) * h} r={0.8 + rnd(seed + "r" + i) * 2.4} fill="#ffffff"
        opacity={0.3 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))} />
    ))}
  </g>
);
const Sky: React.FC<{ id: string; top: string; bot: string }> = ({ id, top, bot }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect width={VW} height={VH} fill={`url(#${id})`} />
  </g>
);
/** Skyline with windows. lit(x) = 0..1 light level of a window at world x. */
const BLD = (() => {
  const out: { x: number; w: number; h: number }[] = [];
  let x = -20;
  for (let i = 0; x < VW + 40; i++) { const w = 80 + rnd("bw" + i) * 90; out.push({ x, w, h: 220 + rnd("bh" + i) * 420 }); x += w + 6; }
  return out;
})();
const Skyline: React.FC<{ base: number; fill: string; lit: (x: number) => number; seed?: string }> = ({ base, fill, lit, seed = "w" }) => (
  <g>
    {BLD.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 4} fill={fill} />
        {i % 3 === 1 && <rect x={b.x + b.w / 2 - 3} y={base - b.h - 50} width={6} height={50} fill={fill} />}
        {[...Array(Math.floor((b.h - 40) / 46))].map((_, r) => [...Array(Math.floor((b.w - 20) / 30))].map((_, c) => {
          const on = rnd(seed + i + "-" + r + "-" + c) > 0.38;
          if (!on) return null;
          const wx = b.x + 14 + c * 30;
          return <rect key={r + "-" + c} x={wx} y={base - b.h + 24 + r * 46} width={16} height={24} rx={2} fill={WIN} opacity={0.9 * lit(wx)} />;
        }))}
      </g>
    ))}
  </g>
);
const Roof: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <g>
    <rect x={0} y={1460} width={VW} height={VH - 1460} fill={mix("#4a4360", "#1c1a2a", dark)} />
    <rect x={0} y={1448} width={VW} height={24} fill={mix("#6a6080", "#2a2740", dark)} />
    {/* water tower */}
    <g transform="translate(560 1460)" opacity={0.95}>
      <path d="M-40 0 L-30 -120 M40 0 L30 -120 M-36 -40 L36 -80 M36 -40 L-36 -80" stroke={mix("#3a3048", "#121020", dark)} strokeWidth={8} />
      <rect x={-62} y={-250} width={124} height={130} rx={10} fill={mix("#8a5a3a", "#2a1c18", dark)} stroke={INKC} strokeWidth={5} />
      <path d="M-70 -250 L0 -300 L70 -250 Z" fill={mix("#5a3a2a", "#1a1210", dark)} stroke={INKC} strokeWidth={5} />
      {[0, 1, 2].map((i) => <line key={i} x1={-62} x2={62} y1={-220 + i * 36} y2={-220 + i * 36} stroke={INKC} strokeWidth={3} opacity={0.5} />)}
    </g>
  </g>
);
const Mini: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number }> = ({ x, y, s = 1, c = "#2a2440", o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-62} r={11} fill={c} />
    <rect x={-10} y={-50} width={20} height={34} rx={8} fill={c} />
    <rect x={-9} y={-20} width={7} height={20} fill={c} /><rect x={2} y={-20} width={7} height={20} fill={c} />
  </g>
);
const Poof: React.FC<{ x: number; y: number; q: number }> = ({ x, y, q }) => q <= 0 || q >= 1 ? null : (
  <g opacity={1 - q}>
    {[...Array(7)].map((_, i) => { const a = (i / 7) * Math.PI * 2; return <circle key={i} cx={x + Math.cos(a) * q * 40} cy={y - 30 + Math.sin(a) * q * 40} r={6 * (1 - q) + 2} fill="#ffffff" />; })}
  </g>
);
/** Side-view animal (faces right; dir=-1 faces left). */
type Kind = "wolf" | "boar" | "horse" | "bigdog" | "tiny";
const BEAST: Record<Kind, { c: string; c2: string; L: number; H: number; leg: number; head: number; lw: number }> = {
  wolf: { c: "#8b9098", c2: "#d9dde2", L: 150, H: 56, leg: 62, head: 30, lw: 14 },
  boar: { c: "#5a4030", c2: "#3a281e", L: 150, H: 80, leg: 36, head: 34, lw: 16 },
  horse: { c: "#c9a46a", c2: "#f0dfbf", L: 190, H: 76, leg: 112, head: 30, lw: 17 },
  bigdog: { c: "#8a5a30", c2: "#e8c8a0", L: 140, H: 60, leg: 66, head: 32, lw: 15 },
  tiny: { c: "#e0b080", c2: "#f6dcc0", L: 62, H: 30, leg: 24, head: 20, lw: 7 },
};
const Beast: React.FC<{ f: number; x: number; y: number; s?: number; kind: Kind; dir?: 1 | -1; walk?: number; seed?: number; shiver?: number; collar?: number }> = ({ f, x, y, s = 1, kind, dir = 1, walk = 0, seed = 0, shiver = 0, collar = 0 }) => {
  const k = BEAST[kind];
  const { L, H, leg, head, lw } = k;
  const ph = walk + seed;
  const by = -(leg + H / 2) - Math.abs(Math.sin(ph)) * (walk ? 4 : 0);
  const legs = [[-L * 0.32, 0], [L * 0.3, Math.PI]].flatMap(([lx, o]) => [[lx + 8, o + Math.PI, true], [lx, o, false]]) as [number, number, boolean][];
  const sh = shiver ? Math.sin(f * 2.1) * 2.5 * shiver : 0;
  const hx = kind === "horse" ? L / 2 + 26 : kind === "boar" ? L / 2 + 6 : L / 2 + head * 0.3;
  const hy = kind === "horse" ? by - H / 2 - 70 : kind === "boar" ? by + 4 : by - H / 2 - head * 0.2;
  const ink = INKC;
  return (
    <g transform={`translate(${x + sh} ${y}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={2} rx={L * 0.55} ry={8} fill="#000" opacity={0.2} />
      {legs.filter((l) => l[2]).map(([lx, o], i) => { const d = `M${lx} ${by + H * 0.2} L${lx + Math.sin(ph + o) * (walk ? leg * 0.32 : 0)} ${-4}`; return <g key={"b" + i}><path d={d} stroke={ink} strokeWidth={lw + 8} strokeLinecap="round" /><path d={d} stroke={mix(k.c, "#000000", 0.35)} strokeWidth={lw} strokeLinecap="round" /></g>; })}
      {/* tail */}
      {kind === "wolf" && <ellipse cx={-L / 2 - 20} cy={by + 14} rx={16} ry={40} transform={`rotate(${30 + Math.sin(f * 0.2 + seed) * 6} ${-L / 2 - 6} ${by - 10})`} fill={k.c} stroke={ink} strokeWidth={4} />}
      {kind === "bigdog" && <path d={`M${-L / 2 + 6} ${by - 10} q -40 -10 -36 -60`} stroke={k.c} strokeWidth={14} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(f * 0.5 + seed) * 12} ${-L / 2} ${by - 10})`} />}
      {kind === "tiny" && <path d={`M${-L / 2 + 4} ${by - 4} q -22 -6 -18 -30`} stroke={k.c} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {kind === "horse" && <path d={`M${-L / 2 + 4} ${by - 20} q -40 30 -30 110`} stroke="#3a2a1a" strokeWidth={20} fill="none" strokeLinecap="round" />}
      {kind === "boar" && <path d={`M${-L / 2 + 2} ${by - 10} q -16 -4 -12 10 q 4 10 -8 12`} stroke={ink} strokeWidth={4} fill="none" />}
      {/* body */}
      <ellipse cx={0} cy={by} rx={L / 2} ry={H / 2} fill={k.c} stroke={ink} strokeWidth={5} />
      <ellipse cx={4} cy={by + H * 0.22} rx={L * 0.36} ry={H * 0.2} fill={k.c2} opacity={0.6} />
      {kind === "boar" && <path d={`M${-L * 0.35} ${by - H / 2 + 4} l 10 -14 l 8 12 l 10 -14 l 8 12 l 10 -14 l 8 12 l 10 -14 l 8 12`} stroke={k.c2} strokeWidth={5} fill="none" />}
      {legs.filter((l) => !l[2]).map(([lx, o], i) => { const d = `M${lx} ${by + H * 0.2} L${lx + Math.sin(ph + o) * (walk ? leg * 0.32 : 0)} ${-4}`; return <g key={"f" + i}><path d={d} stroke={ink} strokeWidth={lw + 8} strokeLinecap="round" /><path d={d} stroke={kind === "horse" ? "#4a3420" : k.c} strokeWidth={lw} strokeLinecap="round" /></g>; })}
      {/* neck */}
      {kind === "horse" && <path d={`M${L * 0.3} ${by - 10} L${hx - 10} ${hy + 6}`} stroke={k.c} strokeWidth={46} strokeLinecap="round" />}
      {kind === "horse" && <path d={`M${L * 0.22} ${by - H / 2 + 2} L${hx - 26} ${hy - 22}`} stroke="#3a2a1a" strokeWidth={14} strokeLinecap="round" />}
      {/* head */}
      <g transform={`translate(${hx} ${hy}) rotate(${kind === "horse" ? 30 : 0})`}>
        {kind === "wolf" && <path d={`M${-12} ${-head * 0.6} l 6 -30 l 16 24 Z`} fill={k.c} stroke={ink} strokeWidth={4} strokeLinejoin="round" />}
        {kind === "horse" && <path d={`M${-16} ${-head * 0.6} l 2 -26 l 14 22 Z`} fill={k.c} stroke={ink} strokeWidth={4} strokeLinejoin="round" />}
        {kind === "tiny" && <path d={`M${-10} ${-head * 0.5} l -8 -34 l 26 24 Z`} fill={k.c} stroke={ink} strokeWidth={3} strokeLinejoin="round" />}
        {kind === "boar" && <path d={`M${-14} ${-head * 0.7} l 0 -18 l 14 12 Z`} fill={k.c} stroke={ink} strokeWidth={4} />}
        <ellipse cx={0} cy={0} rx={head} ry={head * 0.82} fill={k.c} stroke={ink} strokeWidth={kind === "tiny" ? 3 : 5} />
        {/* snout */}
        {kind === "horse" ? <ellipse cx={head * 1.3} cy={head * 0.2} rx={head * 1.1} ry={head * 0.55} fill={k.c} stroke={ink} strokeWidth={5} />
          : <rect x={head * 0.4} y={kind === "boar" ? -head * 0.25 : -head * 0.1} width={kind === "tiny" ? head * 0.8 : head * 1.2} height={head * 0.62} rx={head * 0.3} fill={kind === "boar" ? mix(k.c, "#ffffff", 0.1) : k.c} stroke={ink} strokeWidth={kind === "tiny" ? 3 : 5} />}
        {kind === "boar" ? <ellipse cx={head * 1.6} cy={head * 0.06} rx={7} ry={head * 0.32} fill="#d88a8a" stroke={ink} strokeWidth={3} />
          : <circle cx={kind === "horse" ? head * 2.3 : kind === "tiny" ? head * 1.2 : head * 1.6} cy={kind === "horse" ? head * 0.2 : head * 0.05} r={kind === "tiny" ? 4 : 7} fill={ink} />}
        {kind === "boar" && <path d={`M${head * 1.0} ${head * 0.32} q 10 4 8 -16`} stroke="#fffbe8" strokeWidth={6} fill="none" strokeLinecap="round" />}
        <circle cx={head * 0.25} cy={-head * 0.25} r={kind === "tiny" ? 4 : 5} fill={ink} />
        {kind === "bigdog" && <ellipse cx={-head * 0.5} cy={head * 0.1} rx={12} ry={26} fill={mix(k.c, "#000000", 0.3)} stroke={ink} strokeWidth={4} />}
      </g>
      {collar > 0 && <rect x={hx - head - 6} y={hy + head * 0.5} width={head * 1.1} height={kind === "tiny" ? 7 : 12} rx={4} fill="#e4473b" stroke={ink} strokeWidth={3} opacity={collar} />}
    </g>
  );
};
const Vine: React.FC<{ x: number; y0: number; h: number; p: number; seed: string; w?: number }> = ({ x, y0, h, p, seed, w = 10 }) => {
  if (p <= 0) return null;
  const n = 7, pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) pts.push([x + Math.sin(i * 1.3 + rnd(seed) * 6) * 24, y0 - (h * i) / n]);
  const d = pts.map(([px, py], i) => (i ? "L" : "M") + px + " " + py).join(" ");
  return (
    <g>
      <path d={d} stroke={LEAF2} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={h * 1.4} strokeDashoffset={h * 1.4 * (1 - p)} />
      {pts.slice(1).map(([px, py], i) => (i + 1) / n <= p ? <ellipse key={i} cx={px + (i % 2 ? 18 : -18)} cy={py} rx={20} ry={11} transform={`rotate(${i % 2 ? -30 : 30} ${px} ${py})`} fill={i % 3 ? LEAF : "#7ccf5a"} stroke={INKC} strokeWidth={3} /> : null)}
    </g>
  );
};
const Grass: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * eout(clamp01(p))})`}>
    {[-18, -6, 6, 18].map((dx, i) => <path key={i} d={`M${dx} 0 Q${dx + (i - 1.5) * 8} -30 ${dx + (i - 1.5) * 14} -${44 + (i % 2) * 18}`} stroke={i % 2 ? LEAF : LEAF2} strokeWidth={8} fill="none" strokeLinecap="round" />)}
  </g>
);
const Tree: React.FC<{ x: number; y: number; s?: number; p?: number; c?: string }> = ({ x, y, s = 1, p = 1, c = LEAF }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * eout(clamp01(p))})`}>
    <rect x={-14} y={-150} width={28} height={150} fill="#6b4423" stroke={INKC} strokeWidth={5} />
    <circle cx={0} cy={-190} r={80} fill={c} stroke={INKC} strokeWidth={6} />
    <circle cx={-56} cy={-150} r={52} fill={mix(c, "#000000", 0.12)} stroke={INKC} strokeWidth={6} />
    <circle cx={58} cy={-148} r={50} fill={mix(c, "#000000", 0.08)} stroke={INKC} strokeWidth={6} />
  </g>
);
const Clock: React.FC<{ x: number; y: number; a: number; r?: number; label?: string }> = ({ x, y, a, r = 70, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#ffffff" stroke={INKC} strokeWidth={8} />
    {[...Array(12)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 6) * r * 0.75} y1={-Math.cos(i * Math.PI / 6) * r * 0.75} x2={Math.sin(i * Math.PI / 6) * r * 0.88} y2={-Math.cos(i * Math.PI / 6) * r * 0.88} stroke={INKC} strokeWidth={4} />)}
    <line x1={0} y1={0} x2={Math.sin(a / 12) * r * 0.5} y2={-Math.cos(a / 12) * r * 0.5} stroke={INKC} strokeWidth={9} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(a) * r * 0.72} y2={-Math.cos(a) * r * 0.72} stroke={RED} strokeWidth={6} strokeLinecap="round" />
    <circle r={8} fill={INKC} />
    {label && <text y={r + 50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#ffffff" stroke={INKC} strokeWidth={7} paintOrder="stroke">{label}</text>}
  </g>
);
const Label: React.FC<{ x: number; y: number; text: string; p: number; fs?: number; fill?: string; rot?: number }> = ({ x, y, text, p, fs = 56, fill = "#ffffff", rot = 0 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${clamp01(p) * 0.3 + 0.7 * p})`} opacity={clamp01(p)}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={fill} stroke={INKC} strokeWidth={fs * 0.14} paintOrder="stroke" strokeLinejoin="round">{text}</text>
  </g>
);

// ---------- shots ----------
const S1_Roof: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky id="dusk" top={DUSK1} bot={DUSK0} />
    <circle cx={800} cy={1080} r={120} fill="#ffd27a" opacity={0.85} />
    <Skyline base={1300} fill="#3a2c55" lit={() => 0.55} seed="a" />
    {/* footbridge with people who vanish */}
    <rect x={0} y={1286} width={VW} height={18} fill="#2a2140" />
    <line x1={0} x2={VW} y1={1250} y2={1250} stroke="#2a2140" strokeWidth={5} />
    {[...Array(9)].map((_, i) => {
      const at = F.vanished + 2 + i * 3;
      const x = 70 + i * 118 + Math.sin(i * 2.3) * 20;
      return <g key={i}><Mini x={x + (f < at ? Math.sin(f * 0.05 + i) * 6 : 0)} y={1288} s={0.9} o={f < at ? 1 : 0} /><Poof x={x} y={1288} q={(f - at) / 14} /></g>;
    })}
    <Roof />
    <Duo f={f} hostMood={f > F.vanished ? "surprised" : "happy"} />
    <QBubble f={f} i={0} x={420} y={900} tx={270} ty={1070} />
  </g>
);
const S2_Plant: React.FC<{ f: number }> = ({ f }) => {
  const off = eio(ramp(f, F.shutting, F.shutting + 40));
  const gauge = lerp(0.95, 0.05, eio(ramp(f, F.hours, F.shutting + 30)));
  return (
    <g>
      <Sky id="plantSky" top={mix("#3b4a8a", "#151a3a", off)} bot={mix("#f2a36a", "#3a2a4a", off)} />
      <Stars f={f} n={40} h={700} o={off} />
      {/* steam */}
      {[300, 620].map((tx, t) => [...Array(9)].map((_, i) => {
        const q = ((f * 0.9 + i * 14 + t * 30) % 126) / 126;
        return <circle key={t + "-" + i} cx={tx + Math.sin(q * 4 + i) * 30 + q * 120} cy={700 - q * 520} r={50 + q * 90} fill="#ffffff" opacity={(1 - q) * 0.55 * (1 - off)} />;
      }))}
      <rect x={0} y={1300} width={VW} height={VH - 1300} fill={mix("#4a5a3a", "#1a2018", off)} />
      {[300, 620].map((tx, t) => (
        <g key={t}>
          <path d={`M${tx - 160} 1310 Q${tx - 90} 1000 ${tx - 115} 700 L${tx + 115} 700 Q${tx + 90} 1000 ${tx + 160} 1310 Z`} fill={mix("#d9d4c8", "#5a5866", off)} stroke={INKC} strokeWidth={8} />
          <path d={`M${tx - 150} 1250 Q${tx} 1270 ${tx + 150} 1250`} stroke={mix("#e4473b", "#5a2a2a", off)} strokeWidth={22} fill="none" />
          <ellipse cx={tx} cy={700} rx={115} ry={18} fill={mix("#a8a49a", "#3a3a44", off)} stroke={INKC} strokeWidth={6} />
          <circle cx={tx} cy={688} r={9} fill={off > 0.5 && Math.sin(f * 0.4) > 0 ? RED : "#5a2a2a"} />
        </g>
      ))}
      {/* reactor hall + pylons */}
      <rect x={760} y={1080} width={260} height={230} fill={mix("#b8c0cc", "#3a3e4a", off)} stroke={INKC} strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={786 + i * 58} y={1130} width={36} height={40} fill={off > 0.3 + i * 0.12 ? "#222633" : WIN} stroke={INKC} strokeWidth={4} />)}
      {/* power gauge */}
      <g transform="translate(540 1500)">
        <path d="M-150 0 A150 150 0 0 1 150 0" fill="#ffffff" stroke={INKC} strokeWidth={10} />
        <path d="M-150 0 A150 150 0 0 1 -75 -130" fill="none" stroke={RED} strokeWidth={22} />
        <path d="M75 -130 A150 150 0 0 1 150 0" fill="none" stroke={GREEN} strokeWidth={22} />
        <line x1={0} y1={0} x2={Math.cos(Math.PI - gauge * Math.PI) * 120} y2={-Math.sin(Math.PI - gauge * Math.PI) * 120} stroke={INKC} strokeWidth={10} strokeLinecap="round" />
        <circle r={14} fill={INKC} />
        <text y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff" stroke={INKC} strokeWidth={7} paintOrder="stroke">POWER</text>
      </g>
      <g opacity={pop(f, F.within, 12)}><Clock x={700} y={520} a={(f - F.within) * 0.5} label="WITHIN HOURS" /></g>
      {f >= F.shutting && <Chip x={430} y={430} w={500} label="SHUTTING DOWN" hue={RED} p={pop(f, F.shutting + 4, 12)} fs={40} />}
    </g>
  );
};
const S3_Dark: React.FC<{ f: number }> = ({ f }) => {
  const wave = (x: number) => 1 - eio(ramp(f, F.lights + (x / VW) * 40, F.lights + (x / VW) * 40 + 10));
  const globeOff = eio(ramp(f, F.lights + 10, F.planet + 20));
  const numOut = ramp(f, F.fast - 10, F.fast);
  return (
    <g>
      <Sky id="night" top={NIGHT0} bot={NIGHT1} />
      <Stars f={f} n={90} h={1200} o={0.4 + 0.6 * (1 - wave(VW))} />
      {/* night globe with city lights */}
      <g transform="translate(800 430)">
        <circle r={110} fill="#173a6a" stroke="#5a8ad8" strokeWidth={5} />
        <path d="M-80 -40 q 30 -40 70 -20 q 20 30 -10 50 q -40 20 -60 -30 Z M10 20 q 50 -10 70 30 q -20 50 -60 40 Z" fill="#1e4a3a" />
        {[...Array(26)].map((_, i) => { const a = rnd("g" + i) * 6.28, r = rnd("gr" + i) * 95; return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={3 + rnd("gs" + i) * 3} fill={WIN} opacity={(1 - globeOff) * (0.6 + 0.4 * Math.sin(f * 0.2 + i))} />; })}
      </g>
      <Skyline base={1300} fill="#161a33" lit={wave} seed="b" />
      <rect x={0} y={1286} width={VW} height={18} fill="#0f1226" />
      <Roof dark={1} />
      <Duo f={f} askBase={f > F.lights ? "surprised" : "happy"} hostMood="neutral" />
      <g opacity={1 - numOut}>
        <BigNum f={f} at={F.day - 2} text="1–2 DAYS" x={470} y={640} hue={YEL} fs={150} />
        {f >= F.lights && <Stamp f={f} at={F.lights + 30} x={470} y={860} text="LIGHTS OUT" hue={RED} fs={84} />}
      </g>
      <QBubble f={f} i={1} x={400} y={920} tx={260} ty={1070} fs={84} />
    </g>
  );
};
const S4_Subway: React.FC<{ f: number }> = ({ f }) => {
  const pumpOn = f < F.without;
  const water = eio(ramp(f, F.without + 10, F.days + 30));
  const top = 760, bot = 1180, wl = lerp(bot - 20, top + 70, water);
  return (
    <g>
      <rect width={VW} height={440} fill="#9fd3ff" />
      {/* street with buildings */}
      {[...Array(8)].map((_, i) => <rect key={i} x={i * 140 - 10} y={180 + (i % 3) * 50} width={120} height={260 - (i % 3) * 50} fill={["#c8b8a8", "#a8b8c8", "#d8c8a0"][i % 3]} stroke={INKC} strokeWidth={4} />)}
      <rect x={0} y={420} width={VW} height={40} fill="#3a3a44" />
      {[...Array(6)].map((_, i) => <rect key={i} x={i * 200 + ((f * 3) % 200) - 100} y={436} width={70} height={8} fill="#ffffff" />)}
      {/* soil */}
      <rect x={0} y={460} width={VW} height={VH - 460} fill="#6b4a32" />
      {[...Array(40)].map((_, i) => <circle key={i} cx={rnd("so" + i) * VW} cy={480 + rnd("sy" + i) * 1400} r={4 + rnd("sr" + i) * 8} fill="#5a3c28" />)}
      {/* tunnel */}
      <defs><clipPath id="tun"><rect x={70} y={top} width={940} height={bot - top} rx={120} /></clipPath></defs>
      <rect x={60} y={top - 10} width={960} height={bot - top + 20} rx={128} fill="#9a9aa4" stroke={INKC} strokeWidth={8} />
      <g clipPath="url(#tun)">
        <rect x={70} y={top} width={940} height={bot - top} fill="#232838" />
        {[...Array(9)].map((_, i) => <rect key={i} x={110 + i * 105} y={top + 40} width={50} height={20} fill={WIN} opacity={0.35} />)}
        {/* subway car */}
        <rect x={170} y={930} width={620} height={200} rx={26} fill="#c9ced8" stroke={INKC} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={200 + i * 118} y={960} width={86} height={70} rx={10} fill="#3a4a6a" stroke={INKC} strokeWidth={4} />)}
        <rect x={170} y={1060} width={620} height={16} fill="#e4473b" />
        <line x1={70} x2={1010} y1={1150} y2={1150} stroke="#5a5a64" strokeWidth={10} />
        {/* water */}
        <path d={`M70 ${wl} ${[...Array(19)].map((_, i) => `Q${95 + i * 50} ${wl + (i % 2 ? 12 : -12) * Math.sin(f * 0.15)} ${120 + i * 50} ${wl}`).join(" ")} L1010 ${bot} L70 ${bot} Z`} fill="#2f7fd8" opacity={0.82} />
      </g>
      {/* pump + pipe to street */}
      <rect x={880} y={440} width={40} height={600} fill="#7a8a9a" stroke={INKC} strokeWidth={5} />
      {pumpOn && [...Array(6)].map((_, i) => { const q = ((f * 2 + i * 100) % 600); return <circle key={i} cx={900} cy={1040 - q} r={10} fill="#5ab8ff" />; })}
      <g transform="translate(900 1080)">
        <rect x={-70} y={-50} width={140} height={100} rx={16} fill={pumpOn ? "#3ddc97" : "#6a6a74"} stroke={INKC} strokeWidth={6} />
        <circle r={30} fill="#ffffff" stroke={INKC} strokeWidth={5} />
        <g transform={`rotate(${pumpOn ? f * 12 : F.without * 12})`}><path d="M0 -24 L6 0 L0 24 L-6 0 Z M-24 0 L0 6 L24 0 L0 -6 Z" fill={INKC} /></g>
        {!pumpOn && <g opacity={pop(f, F.without + 2, 10)}><path d="M-50 -50 L50 50 M50 -50 L-50 50" stroke={RED} strokeWidth={16} strokeLinecap="round" /></g>}
      </g>
      <Chip x={900} y={1230} w={260} label={pumpOn ? "PUMPS ON" : "PUMPS OFF"} hue={pumpOn ? GREEN : RED} fs={34} textColor={pumpOn ? INKC : "#ffffff"} />
      <g opacity={1 - ramp(f, F.without - 8, F.without - 2)}>
        <Chip x={250} y={560} w={330} label="NEW YORK" hue="#2f6db5" p={pop(f, F.ny, 12)} fs={40} />
        <BigNum f={f} at={F.millions - 2} text="MILLIONS" x={420} y={690} hue={YEL} fs={112} />
      </g>
      {f >= F.everyDay - 4 && <Chip x={560} y={1290} w={480} label="LITERS / EVERY DAY" hue="#5ab8ff" p={pop(f, F.everyDay - 4, 12)} fs={36} textColor={INKC} />}
      {f >= F.days - 2 && <Stamp f={f} at={F.days} x={540} y={1420} text="FLOODED IN DAYS" hue="#ffffff" fs={64} rot={-6} />}
    </g>
  );
};
const S5_Pets: React.FC<{ f: number }> = ({ f }) => {
  const run = eout(ramp(f, F.wild - 20, F.wild + 14));
  const collar = 1 - ramp(f, F.wild + 4, F.wild + 10);
  return (
    <g>
      <Sky id="day" top="#7cc4ff" bot="#d8f0ff" />
      <circle cx={880} cy={300} r={70} fill="#ffe27a" />
      {/* abandoned house */}
      <g transform="translate(540 1330)">
        <rect x={-230} y={-300} width={460} height={300} fill="#e8d8b8" stroke={INKC} strokeWidth={7} />
        <path d="M-270 -300 L0 -480 L270 -300 Z" fill="#a0523a" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-50} y={-170} width={100} height={170} fill="#5a3a2a" stroke={INKC} strokeWidth={6} />
        <rect x={-190} y={-240} width={100} height={80} fill="#3a4a6a" stroke={INKC} strokeWidth={6} />
        <rect x={90} y={-240} width={100} height={80} fill="#3a4a6a" stroke={INKC} strokeWidth={6} />
        <path d="M-190 -240 L-90 -160 M90 -160 L150 -220" stroke="#ffffff" strokeWidth={4} opacity={0.7} />
        <Vine x={-220} y0={0} h={300} p={1} seed="h1" w={8} />
        <Vine x={220} y0={0} h={260} p={1} seed="h2" w={8} />
      </g>
      {/* fence + overgrown yard */}
      {[...Array(14)].map((_, i) => <rect key={i} x={i * 80 + 4} y={1260} width={40} height={130} rx={6} fill="#f4ecd8" stroke={INKC} strokeWidth={4} transform={`rotate(${(rnd("fe" + i) - 0.5) * 14} ${i * 80 + 24} 1390)`} />)}
      <rect x={0} y={1380} width={VW} height={VH - 1380} fill="#2f6a2a" />
      {[...Array(18)].map((_, i) => <Grass key={i} x={30 + i * 60} y={1400 + (i % 3) * 30} p={1} s={1.1} />)}
      {/* dogs */}
      <Beast f={f} x={lerp(540, 470, run)} y={lerp(1330, 1560, run)} s={lerp(0.6, 1.25, run)} kind="bigdog" walk={f < F.wild + 14 ? f * 0.5 : 0} seed={1} collar={collar} />
      <Beast f={f} x={lerp(560, 690, run)} y={lerp(1330, 1560, run)} s={lerp(0.6, 1.3, run)} kind="tiny" dir={-1} walk={f < F.wild + 14 ? f * 0.7 : 0} seed={2} collar={collar} shiver={f > F.tiny ? 1 : 0} />
      {f >= F.wild + 4 && f < F.wild + 30 && [0, 1].map((i) => { const q = (f - F.wild - 4) / 26; return <rect key={i} x={480 + i * 200 + q * (i ? 120 : -120)} y={1420 - Math.sin(q * Math.PI) * 160} width={40} height={12} rx={4} fill="#e4473b" stroke={INKC} strokeWidth={3} transform={`rotate(${q * 400})`} opacity={1 - q} />; })}
      <Label x={540} y={760} text="GONE WILD!" p={pop(f, F.wild + 2, 12) * (1 - ramp(f, F.big - 6, F.big))} fs={84} fill={YEL} rot={-4} />
      {f >= F.big && <Chip x={420} y={1290} w={360} label="BIG & TOUGH ✓" hue={GREEN} p={pop(f, F.big + 2, 12)} fs={36} textColor={INKC} />}
      {f >= F.tiny && <Chip x={650} y={1405} w={250} label="TINY ✗" hue={RED} p={pop(f, F.tiny + 2, 12)} fs={36} />}
      <Duo f={f} ax={230} hx={860} s={0.76} askBase={f > F.probably ? "surprised" : "happy"} />
      <QBubble f={f} i={2} x={400} y={940} tx={230} ty={1100} />
    </g>
  );
};
const S6_City: React.FC<{ f: number }> = ({ f }) => {
  const g = eio(ramp(f, F.nature - 4, F.after - 6));
  return (
    <g>
      <Sky id="citySky" top="#8fb8d8" bot="#e8efe0" />
      {/* facades */}
      {[[0, 330, 1300, "#b8a898"], [330, 260, 1060, "#c8c0b0"], [590, 230, 1180, "#a8a0a8"], [820, 270, 1280, "#b8b0a0"]].map(([x, w, h, c], i) => (
        <g key={i}>
          <rect x={x as number} y={1420 - (h as number)} width={w as number} height={h as number} fill={c as string} stroke={INKC} strokeWidth={6} />
          {[...Array(Math.floor(((h as number) - 80) / 110))].map((_, r) => [...Array(Math.floor(((w as number) - 30) / 80))].map((_, k) => (
            <rect key={r + "-" + k} x={(x as number) + 26 + k * 80} y={1420 - (h as number) + 40 + r * 110} width={50} height={70} fill="#3a4a5a" stroke={INKC} strokeWidth={3} />
          )))}
          <Vine x={(x as number) + 30} y0={1420} h={(h as number) * 0.9} p={ramp(g, i * 0.1, 0.6 + i * 0.1)} seed={"v" + i} w={12} />
          <Vine x={(x as number) + (w as number) - 40} y0={1420} h={(h as number) * 0.7} p={ramp(g, 0.15 + i * 0.1, 0.8)} seed={"u" + i} w={10} />
        </g>
      ))}
      {/* street */}
      <rect x={0} y={1420} width={VW} height={VH - 1420} fill="#3a3a44" />
      {[...Array(5)].map((_, i) => <path key={i} d={`M${100 + i * 220} 1430 l 30 60 l -20 40 l 40 50`} stroke="#22222a" strokeWidth={6} fill="none" opacity={g} />)}
      {[...Array(12)].map((_, i) => <Grass key={i} x={60 + i * 90} y={1450 + (i % 2) * 120} p={ramp(g, 0.1 + i * 0.04, 0.4 + i * 0.04)} s={1.3} />)}
      <Tree x={540} y={1470} s={1.2} p={ramp(g, 0.4, 0.9)} />
      {/* abandoned car */}
      <g transform="translate(540 1500)" opacity={1 - ramp(g, 0.5, 0.8) * 0.4}>
        <rect x={-120} y={-60} width={240} height={60} rx={18} fill="#8a3a3a" stroke={INKC} strokeWidth={5} />
        <rect x={-70} y={-100} width={140} height={50} rx={14} fill="#6a2a2a" stroke={INKC} strokeWidth={5} />
        <circle cx={-70} cy={0} r={22} fill={INKC} /><circle cx={70} cy={0} r={22} fill={INKC} />
      </g>
      <Label x={540} y={430} text="NATURE TAKES IT BACK" p={pop(f, F.nature + 4, 12)} fs={62} fill={GREEN} />
      <Duo f={f} y={1560} s={0.78} />
      <QBubble f={f} i={3} x={430} y={960} tx={240} ty={1150} />
    </g>
  );
};
const S7_Chernobyl: React.FC<{ f: number }> = ({ f }) => {
  const busX = lerp(560, -400, eio(ramp(f, F.left - 10, F.left + 50)));
  const walkIn = (at: number, x0: number, x1: number) => lerp(x0, x1, eout(ramp(f, at - 10, at + 50)));
  return (
    <g>
      <Sky id="pripyat" top="#9aa8a0" bot="#dfe6d8" />
      {/* apartment blocks */}
      {[[40, 760, 520, 300], [600, 700, 440, 360]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h + 460} fill="#c8c8c0" stroke={INKC} strokeWidth={7} />
          {[...Array(8)].map((_, r) => [...Array(Math.floor(w / 62))].map((_, k) => (
            <rect key={r + "-" + k} x={x + 18 + k * 62} y={y + 24 + r * 70} width={40} height={44} fill={rnd("pw" + i + r + k) > 0.7 ? "#1a1a1a" : "#4a5458"} stroke={INKC} strokeWidth={3} />
          )))}
          <Vine x={x + 30} y0={y + h + 460} h={600} p={1} seed={"pv" + i} w={12} />
          <Vine x={x + w - 30} y0={y + h + 460} h={420} p={1} seed={"pu" + i} w={10} />
        </g>
      ))}
      {/* ferris wheel */}
      <g transform="translate(560 640)">
        <circle r={200} fill="none" stroke="#e8c03a" strokeWidth={12} />
        {[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return <g key={i}><line x1={0} y1={0} x2={Math.cos(a) * 200} y2={Math.sin(a) * 200} stroke="#e8c03a" strokeWidth={5} /><rect x={Math.cos(a) * 200 - 22} y={Math.sin(a) * 200} width={44} height={36} rx={6} fill="#e8c03a" stroke={INKC} strokeWidth={4} /></g>; })}
        <path d="M-120 420 L0 0 L120 420" stroke="#8a8a8a" strokeWidth={14} fill="none" />
      </g>
      <rect x={0} y={1400} width={VW} height={VH - 1400} fill="#4a6a3a" />
      <Tree x={130} y={1420} s={1.3} c="#5a9a4a" /><Tree x={980} y={1420} s={1.1} c="#4a8a3a" />
      {[...Array(14)].map((_, i) => <Grass key={i} x={40 + i * 75} y={1430 + (i % 3) * 20} p={1} s={1.2} />)}
      {/* evacuation bus */}
      {f < F.left + 60 && (
        <g transform={`translate(${busX} 1470)`}>
          <rect x={0} y={-130} width={340} height={120} rx={20} fill="#e8c860" stroke={INKC} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => <g key={i}><rect x={24 + i * 76} y={-112} width={60} height={50} rx={6} fill="#3a4a6a" stroke={INKC} strokeWidth={4} /><Mini x={54 + i * 76} y={-62} s={0.55} c="#222" /></g>)}
          <circle cx={70} cy={-8} r={26} fill={INKC} /><circle cx={270} cy={-8} r={26} fill={INKC} />
        </g>
      )}
      {/* wildlife */}
      {f >= F.horses - 12 && <Beast f={f} x={walkIn(F.horses, 1350, 880)} y={1460} s={1.05} kind="horse" dir={-1} walk={f * 0.25} seed={7} />}
      {f >= F.wolves - 12 && [0, 1, 2].map((i) => <Beast key={i} f={f} x={walkIn(F.wolves, 1200 + i * 150, 540 + i * 135)} y={1570 + (i % 2) * 30} s={0.95} kind="wolf" dir={-1} walk={f * 0.35} seed={i} />)}
      {f >= F.boar - 12 && [0, 1].map((i) => <Beast key={i} f={f} x={walkIn(F.boar, -250 - i * 170, 200 + i * 170)} y={1580 + i * 10} s={0.8} kind="boar" walk={f * 0.4} seed={i + 4} />)}
      <Chip x={540} y={930} w={460} label="CHERNOBYL ZONE" hue="#e8c03a" p={pop(f, F.chernobyl, 12)} fs={40} textColor={INKC} />
      {f >= F.left && <Chip x={540} y={1030} w={380} label="PEOPLE LEFT" hue="#6a6a74" p={pop(f, F.left + 2, 12) * (1 - ramp(f, F.wolves - 6, F.wolves))} fs={36} />}
      {f >= F.wolves && <Chip x={660} y={1360} w={220} label="WOLVES" hue="#5a6a7a" p={pop(f, F.wolves + 2, 10)} fs={34} />}
      {f >= F.boar && <Chip x={280} y={1400} w={250} label="WILD BOAR" hue="#6a4a30" p={pop(f, F.boar + 2, 10)} fs={32} />}
      {f >= F.horses && <Chip x={850} y={1140} w={300} label="WILD HORSES" hue="#b0853a" p={pop(f, F.horses + 2, 10)} fs={32} />}
    </g>
  );
};
const S8_Timeline: React.FC<{ f: number }> = ({ f }) => {
  const house = eio(ramp(f, F.houses + 10, F.decades + 26));
  const bridge = eio(ramp(f, F.bridges + 6, F.centuries + 30));
  const ax = (k: number) => 120 + k * 280;
  return (
    <g>
      <Sky id="meadow" top="#6aa8d8" bot="#e0f0d8" />
      <rect x={0} y={1400} width={VW} height={VH - 1400} fill="#2f6a2a" />
      {[...Array(18)].map((_, i) => <Grass key={i} x={30 + i * 60} y={1420 + (i % 3) * 26} p={1} s={1.2} />)}
      <Tree x={540} y={1500} s={0.8} c="#5a9a4a" />
      {/* timeline */}
      <g opacity={eout(ramp(f, F.houses - 10, F.houses + 4))}>
        <line x1={80} x2={1000} y1={520} y2={520} stroke={INKC} strokeWidth={12} strokeLinecap="round" />
        <path d="M985 495 L1030 520 L985 545 Z" fill={INKC} />
        {["NOW", "DECADES", "CENTURIES", "AGES"].map((t, k) => {
          const at = [F.houses - 6, F.decades, F.centuries, F.ages][k];
          const on = f >= at;
          return (
            <g key={k}>
              <circle cx={ax(k)} cy={520} r={on ? 20 : 12} fill={on ? YEL : "#ffffff"} stroke={INKC} strokeWidth={6} />
              <text x={ax(k)} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={on ? 40 : 34} fill={on ? YEL : "#ffffff"} stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={on ? 1 : 0.6}>{t}</text>
            </g>
          );
        })}
      </g>
      {/* house collapsing (decades) */}
      {f >= F.houses - 6 && (
        <g transform={`translate(${ax(1)} 870)`} opacity={pop(f, F.houses - 6, 12)}>
          <g transform={`rotate(${house * 18} -80 0) translate(0 ${house * 40})`}>
            <path d="M-100 -150 L0 -230 L100 -150 Z" fill="#a0523a" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
          </g>
          <g transform={`skewX(${house * -14})`}>
            <rect x={-80} y={-150} width={160} height={140} fill="#e8d8b8" stroke={INKC} strokeWidth={6} />
            <rect x={-20} y={-80} width={40} height={70} fill="#5a3a2a" />
          </g>
          {house > 0.6 && [...Array(6)].map((_, i) => <rect key={i} x={-90 + i * 30} y={-10 - rnd("rb" + i) * 20} width={24} height={16} fill="#a0523a" stroke={INKC} strokeWidth={3} />)}
          <rect x={-120} y={-10} width={240} height={14} fill="#4a6a3a" />
        </g>
      )}
      {/* bridge rusting (centuries) */}
      {f >= F.bridges - 6 && (
        <g transform={`translate(${ax(2) + 20} 860)`} opacity={pop(f, F.bridges - 6, 12)}>
          <path d={`M-140 -40 Q0 ${-40 + bridge * 60} 140 -40`} stroke={mix("#7a8a9a", "#a0522d", bridge)} strokeWidth={16} fill="none" />
          <path d="M-140 -40 Q0 -170 140 -40" stroke={mix("#7a8a9a", "#a0522d", bridge)} strokeWidth={12} fill="none" />
          {[...Array(7)].map((_, i) => { const x = -105 + i * 35; return <line key={i} x1={x} x2={x} y1={-40 - (1 - Math.pow(x / 140, 2)) * 120} y2={-40 + (1 - Math.pow(x / 140, 2)) * bridge * 60} stroke={mix("#7a8a9a", "#a0522d", bridge)} strokeWidth={5} />; })}
          <rect x={-160} y={-40} width={30} height={80} fill="#8a8a8a" stroke={INKC} strokeWidth={4} /><rect x={130} y={-40} width={30} height={80} fill="#8a8a8a" stroke={INKC} strokeWidth={4} />
        </g>
      )}
      {f >= F.decades && <Chip x={ax(1)} y={990} w={260} label="COLLAPSE" hue={RED} p={pop(f, F.decades + 6, 10)} fs={32} />}
      {f >= F.centuries && <Chip x={ax(2) + 20} y={990} w={220} label="RUST" hue="#a0522d" p={pop(f, F.centuries + 6, 10)} fs={32} />}
      <Duo f={f} y={1640} s={0.78} askBase={f > F.houses ? "neutral" : "happy"} />
      <QBubble f={f} i={4} x={430} y={1040} tx={250} ty={1230} />
    </g>
  );
};
const S9_Crane: React.FC<{ f: number }> = ({ f }) => {
  const sig = ramp(f, F.radio - 6, F.radio + 4);
  const towerX = 760, towerY = 1010;
  return (
    <g>
      <Sky id="crane" top="#03040d" bot="#1a2a5a" />
      <Stars f={f} n={120} h={900} seed="cr" />
      {/* radio rings expanding into space */}
      {sig > 0 && [...Array(8)].map((_, i) => {
        const q = ((f - F.radio + i * 22) % 176) / 176;
        if (f - F.radio + i * 22 < 0) return null;
        return <circle key={i} cx={towerX} cy={towerY} r={30 + q * 1100} fill="none" stroke="#5ad7ff" strokeWidth={8 - q * 5} opacity={(1 - q) * 0.8 * sig} />;
      })}
      {/* cliff + radio tower */}
      <path d="M560 1320 L620 1150 L700 1120 L1080 1110 L1080 1320 Z" fill="#1a1e2e" stroke={INKC} strokeWidth={6} />
      <g transform={`translate(${towerX} 1120)`}>
        <path d="M-50 0 L0 -110 L50 0 M-34 -40 L34 -40 M-20 -76 L20 -76 M-34 -40 L20 -76 M34 -40 L-20 -76" stroke="#c9d3e6" strokeWidth={7} fill="none" />
        <circle cx={0} cy={-110} r={10} fill={RED} opacity={0.6 + 0.4 * Math.sin(f * 0.3)} />
      </g>
      {/* ocean */}
      <rect x={0} y={1300} width={VW} height={VH - 1300} fill="#0d2a5a" />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${-100 + ((i * 160 + f * 1.5) % 1300)} ${1340 + (i % 4) * 70} q 30 -14 60 0`} stroke="#5a8ad8" strokeWidth={5} fill="none" opacity={0.6} />)}
      {/* plastic bottle */}
      <g transform={`translate(330 ${1360 + Math.sin(f * 0.08) * 10}) rotate(${-18 + Math.sin(f * 0.06) * 8})`}>
        <rect x={-90} y={-36} width={180} height={72} rx={30} fill="#bfe6ff" fillOpacity={0.7} stroke={INKC} strokeWidth={6} />
        <rect x={90} y={-18} width={40} height={36} rx={6} fill="#bfe6ff" fillOpacity={0.8} stroke={INKC} strokeWidth={5} />
        <rect x={128} y={-22} width={22} height={44} rx={5} fill="#3d6ccf" stroke={INKC} strokeWidth={5} />
        <rect x={-50} y={-36} width={90} height={72} fill="#e4473b" opacity={0.85} />
      </g>
      {/* hourglass */}
      <g opacity={1 - ramp(f, F.radio - 12, F.radio - 4)}><g transform={`translate(160 1150) rotate(${Math.floor(Math.max(0, f - F.plastic) / 30) * 180 + eio(((Math.max(0, f - F.plastic)) % 30) / 30) * 0})`} opacity={pop(f, F.plastic + 2, 12)}>
        <path d="M-40 -60 H40 L0 0 L40 60 H-40 L0 0 Z" fill="#fff6d8" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
        <path d="M-20 40 H20 L0 20 Z" fill="#e8b84a" />
      </g></g>
      {f >= F.plastic && <Label x={420} y={1240} text="PLASTIC: AGES" p={pop(f, F.ages - 4, 12) * (1 - ramp(f, F.radio - 12, F.radio - 4))} fs={64} fill={YEL} />}
      {f >= F.space && <Label x={540} y={360} text="STILL TRAVELING..." p={pop(f, F.space, 12)} fs={62} fill="#5ad7ff" />}
      <BigNum f={f} at={F.lightYears} text="LIGHT YEARS" x={540} y={620} hue={YEL} fs={110} />
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky id="outro" top={NIGHT0} bot={NIGHT1} />
    <Stars f={f} n={100} h={1300} seed="o" />
    <Skyline base={1300} fill="#161a33" lit={() => 0} seed="c" />
    {[0, 1].map((i) => <Vine key={i} x={60 + i * 960} y0={1300} h={300 + i * 40} p={1} seed={"ov" + i} />)}
    <Roof dark={1} />
    <Outro f={f} at={F.sub} />
    <Duo f={f} ax={170} hx={910} s={0.78} wave hostWave />
  </g>
);

export const HumansGoneFilm: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = F.within - 4, b2 = F.andDay - 4, b3 = F.ny - 4, b4 = F.pets - 4, b5 = F.cities - 4, b6 = F.after - 4, b7 = F.last - 4, b8 = F.but - 4, b9 = F.sub - 4;
  // angle cuts inside long scenes (same set, new camera)
  const c4 = F.without - 4, c5 = F.big - 4, c7 = W("today") - 4, c8 = F.houses - 6, c9 = F.radio - 10;
  const SHOTS: Shot[] = [
    { from: 0, to: b1, render: () => <S1_Roof f={f} />, cam: [[0, { x: 520, y: 1120, z: 1.2 }], [F.vanished, { x: 540, y: 1140, z: 1.12 }], [b1, { x: 560, y: 1100, z: 1.16 }]] },
    { from: b1, to: b2, tr: "zoom", render: () => <S2_Plant f={f} />, cam: [[b1, { x: 460, y: 900, z: 1.35 }], [F.shutting, { x: 520, y: 1000, z: 1.15 }], [b2, { x: 540, y: 1050, z: 1.08, r: -1 }]] },
    { from: b2, to: b3, tr: "whip", render: () => <S3_Dark f={f} />, cam: [[b2, { x: 540, y: 820, z: 1.2 }], [F.lights, { x: 540, y: 900, z: 1.08 }], [F.fast - 6, { x: 540, y: 1100, z: 1.14 }], [b3, { x: 540, y: 1080, z: 1.1 }]] },
    { from: b3, to: c4, tr: "iris", render: () => <S4_Subway f={f} />, cam: [[b3, { x: 600, y: 620, z: 1.35 }], [F.millions, { x: 560, y: 760, z: 1.18 }], [c4, { x: 520, y: 900, z: 1.12 }]] },
    { from: c4, to: b4, tr: "cut", render: () => <S4_Subway f={f} />, cam: [[c4, { x: 760, y: 1020, z: 1.45 }], [F.flood, { x: 600, y: 1000, z: 1.2 }], [b4, { x: 540, y: 1100, z: 1.04 }]] },
    { from: b4, to: c5, tr: "wipe", render: () => <S5_Pets f={f} />, cam: [[b4, { x: 540, y: 1150, z: 1.14 }], [F.wild, { x: 540, y: 1100, z: 1.06 }], [c5, { x: 540, y: 1150, z: 1.1 }]] },
    { from: c5, to: b5, tr: "cut", render: () => <S5_Pets f={f} />, cam: [[c5, { x: 470, y: 1330, z: 1.35 }], [F.tiny, { x: 640, y: 1340, z: 1.35 }], [F.probably + 10, { x: 560, y: 1200, z: 1.12 }], [b5, { x: 540, y: 1180, z: 1.1 }]] },
    { from: b5, to: b6, tr: "push", render: () => <S6_City f={f} />, cam: [[b5, { x: 540, y: 1150, z: 1.14 }], [F.nature, { x: 540, y: 1000, z: 1.08 }], [b6, { x: 540, y: 700, z: 1.22 }]] },
    { from: b6, to: c7, tr: "flash", render: () => <S7_Chernobyl f={f} />, cam: [[b6, { x: 560, y: 640, z: 1.35 }], [F.left, { x: 400, y: 1100, z: 1.2 }], [c7, { x: 360, y: 1200, z: 1.25 }]] },
    { from: c7, to: b7, tr: "cut", render: () => <S7_Chernobyl f={f} />, cam: [[c7, { x: 800, y: 1300, z: 1.3 }], [F.boar, { x: 380, y: 1300, z: 1.25 }], [F.horses, { x: 700, y: 1150, z: 1.15 }], [b7, { x: 540, y: 1000, z: 1.0 }]] },
    { from: b7, to: c8, tr: "whipUp", render: () => <S8_Timeline f={f} />, cam: [[b7, { x: 540, y: 1150, z: 1.15 }], [c8, { x: 540, y: 1100, z: 1.1 }]] },
    { from: c8, to: b8, tr: "cut", render: () => <S8_Timeline f={f} />, cam: [[c8, { x: 400, y: 620, z: 1.6 }], [F.bridges, { x: 570, y: 620, z: 1.5 }], [b8, { x: 560, y: 620, z: 1.45 }]] },
    { from: b8, to: c9, tr: "spin", render: () => <S9_Crane f={f} />, cam: [[b8, { x: 360, y: 1300, z: 1.8 }], [c9, { x: 380, y: 1270, z: 1.65 }]] },
    { from: c9, to: b9, tr: "cut", render: () => <S9_Crane f={f} />, cam: [[c9, { x: 760, y: 1060, z: 1.6 }], [F.space + 4, { x: 640, y: 600, z: 1.35 }], [F.lightYears + 6, { x: 540, y: 900, z: 1.0 }], [b9, { x: 540, y: 960, z: 1.0 }]] },
    { from: b9, to: TOTAL + 1, tr: "zoom", render: () => <S10_Outro f={f} />, cam: [[b9, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.vanished, 0.08], [F.shutting, 0.08], [F.day, 0.1], [F.lights + 30, 0.12], [F.fast, 0.1], [F.millions, 0.1], [F.days, 0.12], [F.wild, 0.08], [F.chernobyl, 0.1], [F.decades, 0.08], [F.centuries, 0.08], [F.lightYears, 0.12]];
  const SHAKE: [number, number][] = [[F.lights + 30, 10], [F.days, 10], [F.decades + 20, 8]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.45], [F.vanished + 2, "whoosh", 0.3], [F.within, "tick", 0.35], [F.shutting, "riser_dark", 0.25], [F.shutting + 6, "pop", 0.35],
    [F.day - 2, "impact", 0.4], [F.lights + 30, "boom", 0.45], [F.fast - 3, "pop", 0.45],
    [F.ny, "pop", 0.35], [F.millions - 2, "impact", 0.35], [F.everyDay - 4, "pop", 0.3], [F.without + 2, "click", 0.5], [F.without + 10, "riser_dark", 0.25], [F.days, "boom", 0.4],
    [F.pets - 3, "pop", 0.45], [F.wild, "whoosh", 0.35], [F.big + 2, "pop", 0.35], [F.tiny + 2, "pop", 0.3],
    [F.cities - 3, "pop", 0.45], [F.nature, "riser", 0.3], [F.chernobyl, "pop", 0.35], [F.left, "whoosh", 0.3],
    [F.wolves + 2, "pop", 0.3], [F.boar + 2, "pop", 0.3], [F.horses + 2, "pop", 0.3],
    [F.last - 3, "pop", 0.45], [F.decades + 6, "impact", 0.35], [F.centuries + 6, "impact", 0.3], [F.ages - 4, "pop", 0.35], [F.radio, "riser", 0.3], [F.lightYears, "boom", 0.4],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < b3 ? YEL : f < b6 ? GREEN : f < b8 ? YEL : "#5ad7ff";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="VANISHED" sub="WHAT IF EVERY HUMAN..." until={F.within - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="humansgone" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
