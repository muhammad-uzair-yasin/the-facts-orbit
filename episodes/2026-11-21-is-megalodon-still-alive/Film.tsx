import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
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
  ask: ASK[0][0], mega: W("megalodon"), alive: W("alive"), first: W("first"), big: W("big"), fifteen: W("fifteen"), meters: W("meters"),
  thats: W("that's"), longer: W("longer"), bus: W("bus"), its: W("its"), teeth: W("teeth"), hand: W("hand"),
  deep: ASK[1][0], deepW: W("deep"), problem: W("problem"), didnt: W("didn't"), deep2: W("deep", 2), hunted: W("hunted"), whales: W("whales"), warm: W("warm"), coast: W("coast"), right2: W("right", 2), see: W("we'd"),
  huge: ASK[2][0], itIs: W("is", 3), butSharks: W("but", 2), sharks: W("sharks"), thousands: W("thousands"), lifetimeEnd: W("lifetime") + 20, megalodon2: W("megalodon", 3), find: W("find"), world: W("world"),
  every: W("every"), millions: W("millions"), no: W("no"), fresh: W("fresh"),
  bite: ASK[3][0], bite2: W("bite", 2), shark2: W("shark"), giant: W("giant"), huge2: W("huge", 2), whales2: W("whales", 2), today: W("today"), dont: W("don't"),
  killed: ASK[4][0], around: W("around", 2), three: W("three"), million: W("million"), cooled: W("cooled"), food: W("food"), away: W("away"),
  rival0: W("and", 4), prey: W("prey"), oceans: W("oceans"), smaller: W("smaller"), faster: W("faster"), rival: W("rival"), competed: W("competed"), great: W("great"), white: W("white"),
  sub: W("subscribe"),
};

const KID = CAST[11], EXPL = CAST[1];
const SEA0 = "#0a2a4a", SEA1 = "#1f6fa8", SEA2 = "#5ab8e8", SKY0 = "#7cc4ff", SKY1 = "#ffe7b8", RED = "#ff4d3d", GREEN = "#3ddc97", SHARK = "#6f8ba3", BELLY = "#eef3f6", WARMC = "#ffb03a";
const GROUND = 1520;

// ---------- Q&A kit ----------
const Q: { text: string; hot?: boolean }[] = [
  { text: "STILL ALIVE?!", hot: true },
  { text: "HIDING IN\nTHE DEEP?" },
  { text: "BUT THE OCEAN\nIS HUGE!", hot: true },
  { text: "BITE MARKS?" },
  { text: "WHAT KILLED IT?" },
];
const lineAt = (f: number) => ASK.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
const askMood = (f: number, base: "happy" | "neutral" | "surprised" = "happy") => { const i = lineAt(f); return i >= 0 ? (Q[i]?.hot ? "surprised" : "happy") : base; };
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
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; askBase?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised"; wave?: boolean; hostWave?: boolean }> = ({ f, ax = 260, hx = 820, y = GROUND, s = 0.8, askBase = "happy", hostMood = "happy", wave, hostWave }) => {
  const hTalk = speaking(f, "host", SPK);
  return (
    <g>
      <g transform={`translate(${ax} ${y}) scale(${s * 1.12})`}>
        <Person d={KID} f={f} seed={12} talk={talkFor(f, "asker", SPK, ENV)} wave={wave ? 1 : 0} mood={askMood(f, askBase)} />
      </g>
      <g transform={`translate(${hx} ${y}) scale(${-s} ${s})`}>
        <Person d={EXPL} f={f} seed={2} talk={talkFor(f, "host", SPK, ENV)} wave={hostWave || (hTalk && Math.sin(f * 0.045) > 0.55) ? 1 : 0} mood={hostMood} />
      </g>
    </g>
  );
};

// ---------- set pieces ----------
const Grad: React.FC<{ id: string; top: string; bot: string; y?: number; h?: number }> = ({ id, top, bot, y = 0, h = VH }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect y={y} width={VW} height={h} fill={`url(#${id})`} />
  </g>
);
const Rays: React.FC<{ f: number; o?: number }> = ({ f, o = 0.12 }) => (
  <g opacity={o}>{[...Array(6)].map((_, i) => <path key={i} d={`M${120 + i * 170 + Math.sin(f * 0.02 + i) * 30} 0 L${60 + i * 170} ${VH} L${170 + i * 170} ${VH} Z`} fill="#ffffff" />)}</g>
);
const Bubbles: React.FC<{ f: number; n?: number; seed?: string }> = ({ f, n = 24, seed = "bu" }) => (
  <g>{[...Array(n)].map((_, i) => { const y = ((rnd(seed + i) * VH - f * (1 + rnd(seed + "s" + i) * 2)) % VH + VH) % VH; return <circle key={i} cx={rnd(seed + "x" + i) * VW + Math.sin(f * 0.05 + i) * 10} cy={y} r={3 + rnd(seed + "r" + i) * 8} fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.35} />; })}</g>
);
/** Shark side view, faces right (dir=-1 faces left). L = length px. */
const Shark: React.FC<{ f: number; x: number; y: number; L: number; dir?: 1 | -1; c?: string; jaw?: number; seed?: number; ghost?: boolean }> = ({ f, x, y, L, dir = 1, c = SHARK, jaw = 0, seed = 0, ghost }) => {
  const sw = Math.sin(f * 0.18 + seed) * 0.05;
  const P = (px: number, py: number) => `${(px * L).toFixed(1)} ${(py * L).toFixed(1)}`;
  const lw = Math.max(3, L * 0.012);
  return (
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={ghost ? 0.35 : 1}>
      {/* tail (swishes) */}
      <g transform={`rotate(${sw * 120} ${-0.46 * L} 0)`}>
        <path d={`M${P(-0.44, -0.02)} L${P(-0.66, -0.26)} L${P(-0.58, 0.0)} L${P(-0.64, 0.17)} L${P(-0.44, 0.04)} Z`} fill={c} stroke={INKC} strokeWidth={lw} strokeLinejoin="round" />
      </g>
      <path d={`M${P(0.0, -0.13)} L${P(-0.09, -0.33)} L${P(-0.16, -0.12)} Z`} fill={c} stroke={INKC} strokeWidth={lw} strokeLinejoin="round" />
      <path d={`M${P(-0.5, 0)} C${P(-0.3, -0.17)} ${P(0.25, -0.2)} ${P(0.5, -0.02)} C${P(0.46, 0.08)} ${P(0.2, 0.14)} ${P(-0.1, 0.12)} C${P(-0.3, 0.1)} ${P(-0.45, 0.04)} ${P(-0.5, 0)} Z`} fill={c} stroke={INKC} strokeWidth={lw} />
      <path d={`M${P(-0.38, 0.05)} C${P(-0.1, 0.06)} ${P(0.3, 0.06)} ${P(0.47, 0.03)} C${P(0.4, 0.09)} ${P(0.2, 0.135)} ${P(-0.1, 0.12)} C${P(-0.25, 0.11)} ${P(-0.34, 0.08)} ${P(-0.38, 0.05)} Z`} fill={BELLY} />
      <path d={`M${P(0.1, 0.09)} L${P(-0.04, 0.3)} L${P(-0.05, 0.11)} Z`} fill={mix(c, "#000000", 0.12)} stroke={INKC} strokeWidth={lw} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${P(0.2 + i * 0.035, -0.06)} q ${L * 0.012} ${L * 0.05} 0 ${L * 0.1}`} stroke={INKC} strokeWidth={lw * 0.7} fill="none" opacity={0.7} />)}
      <circle cx={0.37 * L} cy={-0.06 * L} r={L * 0.016} fill={INKC} />
      {/* mouth */}
      <path d={`M${P(0.47, 0.035 + jaw * 0.02)} Q${P(0.38, 0.1 + jaw * 0.08)} ${P(0.27, 0.075)}`} stroke={INKC} strokeWidth={lw} fill={jaw > 0.1 ? "#5a1a1a" : "none"} />
      {[...Array(6)].map((_, i) => <path key={i} d={`M${P(0.29 + i * 0.03, 0.078 + i * 0.002)} l ${L * 0.008} ${L * 0.02} l ${L * 0.008} ${-L * 0.02}`} fill="#ffffff" stroke={INKC} strokeWidth={1.5} />)}
    </g>
  );
};
/** Generic baleen whale, faces right. */
const Whale: React.FC<{ f: number; x: number; y: number; L: number; dir?: 1 | -1; bite?: number; seed?: number }> = ({ f, x, y, L, dir = 1, bite = 0, seed = 0 }) => {
  const P = (px: number, py: number) => `${(px * L).toFixed(1)} ${(py * L).toFixed(1)}`;
  const sw = Math.sin(f * 0.1 + seed) * 8;
  const c = "#3a5a7a", lw = Math.max(3, L * 0.01);
  return (
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
      <g transform={`rotate(${sw} ${-0.42 * L} 0)`}>
        <path d={`M${P(-0.42, 0)} L${P(-0.6, -0.1)} Q${P(-0.62, 0)} ${P(-0.6, 0.1)} Z`} fill={c} stroke={INKC} strokeWidth={lw} strokeLinejoin="round" />
      </g>
      <path d={`M${P(-0.45, 0)} C${P(-0.2, -0.15)} ${P(0.3, -0.16)} ${P(0.5, -0.02)} C${P(0.5, 0.08)} ${P(0.2, 0.15)} ${P(-0.1, 0.1)} C${P(-0.3, 0.07)} ${P(-0.42, 0.03)} ${P(-0.45, 0)} Z`} fill={c} stroke={INKC} strokeWidth={lw} />
      {[...Array(5)].map((_, i) => <path key={i} d={`M${P(0.05, 0.08 + i * 0.012)} L${P(0.46, 0.03 + i * 0.012)}`} stroke="#c9d6e0" strokeWidth={lw * 0.6} />)}
      <path d={`M${P(0.1, 0.07)} Q${P(0.02, 0.3)} ${P(-0.14, 0.32)} Q${P(-0.02, 0.16)} ${P(0.02, 0.08)} Z`} fill={mix(c, "#ffffff", 0.2)} stroke={INKC} strokeWidth={lw} />
      <circle cx={0.33 * L} cy={0.0} r={L * 0.012} fill={INKC} />
      {bite > 0 && (
        <g opacity={bite}>
          <path d={`M${P(-0.08, -0.1)} A ${L * 0.11} ${L * 0.11} 0 0 0 ${P(-0.08, 0.1)}`} fill="none" stroke={RED} strokeWidth={lw * 1.4} strokeDasharray={`${L * 0.02} ${L * 0.015}`} />
          {[...Array(7)].map((_, i) => { const a = -1.2 + i * 0.4; return <circle key={i} cx={-0.08 * L + Math.cos(a + Math.PI) * L * 0.1 + L * 0.02} cy={Math.sin(a) * L * 0.1} r={lw * 0.9} fill={RED} />; })}
        </g>
      )}
    </g>
  );
};
const Tooth: React.FC<{ x: number; y: number; s?: number; fresh?: boolean; rot?: number }> = ({ x, y, s = 1, fresh, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60 -70 Q0 -96 60 -70 L52 -48 L0 90 L-52 -48 Z" fill={fresh ? "#ffffff" : "#8a7a6a"} stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-60 -70 Q0 -96 60 -70 L56 -50 Q0 -70 -56 -50 Z" fill={fresh ? "#e8e0d0" : "#5a4a3a"} />
    {[...Array(9)].map((_, i) => <path key={i} d={`M${-50 + i * 6} ${-44 + i * 15} l -4 3`} stroke={INKC} strokeWidth={2} />)}
    {[...Array(9)].map((_, i) => <path key={i} d={`M${50 - i * 6} ${-44 + i * 15} l 4 3`} stroke={INKC} strokeWidth={2} />)}
    {!fresh && <path d="M-20 -20 L10 10 M15 -40 L20 -10" stroke="#4a3a2a" strokeWidth={3} opacity={0.6} />}
  </g>
);
const Boat: React.FC<{ f: number; dark?: number }> = ({ f, dark = 0 }) => (
  <g transform={`translate(0 ${Math.sin(f * 0.06) * 6}) rotate(${Math.sin(f * 0.05) * 0.8} 540 1600)`}>
    <rect x={-40} y={1500} width={VW + 80} height={60} fill={mix("#c89a62", "#4a3a2a", dark)} stroke={INKC} strokeWidth={6} />
    {[...Array(12)].map((_, i) => <line key={i} x1={i * 100} x2={i * 100} y1={1500} y2={1560} stroke={INKC} strokeWidth={3} opacity={0.35} />)}
    <path d={`M-40 1560 L${VW + 40} 1560 L${VW - 60} ${VH} L40 ${VH} Z`} fill={mix("#24365a", "#141a2a", dark)} stroke={INKC} strokeWidth={6} />
    <rect x={-40} y={1600} width={VW + 80} height={26} fill={mix("#e4473b", "#4a1a1a", dark)} />
    {/* railing */}
    <line x1={-40} x2={VW + 40} y1={1300} y2={1300} stroke={mix("#e8e8e8", "#555", dark)} strokeWidth={10} />
    {[...Array(10)].map((_, i) => <line key={i} x1={20 + i * 116} x2={20 + i * 116} y1={1300} y2={1500} stroke={mix("#e8e8e8", "#555", dark)} strokeWidth={8} />)}
    <line x1={-40} x2={VW + 40} y1={1400} y2={1400} stroke={mix("#e8e8e8", "#555", dark)} strokeWidth={5} />
    {/* life ring */}
    <g transform="translate(560 1380)"><circle r={50} fill="none" stroke={mix("#ff6a2b", "#5a2a1a", dark)} strokeWidth={24} /><circle r={50} fill="none" stroke="#ffffff" strokeWidth={24} strokeDasharray="20 58" /></g>
  </g>
);
const SeaSurface: React.FC<{ f: number; y: number; c: string; c2: string }> = ({ f, y, c, c2 }) => (
  <g>
    <rect x={0} y={y} width={VW} height={VH - y} fill={c} />
    {[...Array(10)].map((_, i) => <path key={i} d={`M${((i * 137 + f * 1.2) % 1240) - 80} ${y + 30 + (i % 5) * 34} q 30 -12 60 0 q 30 12 60 0`} stroke={c2} strokeWidth={5} fill="none" opacity={0.7} />)}
  </g>
);
const Label: React.FC<{ x: number; y: number; text: string; p: number; fs?: number; fill?: string; rot?: number }> = ({ x, y, text, p, fs = 56, fill = "#ffffff", rot = 0 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${clamp01(p) * 0.3 + 0.7 * p})`} opacity={clamp01(p)}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={fill} stroke={INKC} strokeWidth={fs * 0.14} paintOrder="stroke" strokeLinejoin="round">{text}</text>
  </g>
);
const Cross: React.FC<{ x: number; y: number; p: number; r?: number }> = ({ x, y, p, r = 60 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${p})`}><path d={`M${-r} ${-r} L${r} ${r} M${r} ${-r} L${-r} ${r}`} stroke={RED} strokeWidth={r * 0.32} strokeLinecap="round" /></g>
);
const Check: React.FC<{ x: number; y: number; p: number; r?: number }> = ({ x, y, p, r = 60 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${p})`}><path d={`M${-r} 0 L${-r * 0.3} ${r * 0.7} L${r} ${-r * 0.7}`} stroke={GREEN} strokeWidth={r * 0.32} strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
);

// ---------- shots ----------
const S1_Boat: React.FC<{ f: number; i: number; dusk?: number; fin?: number }> = ({ f, i, dusk = 0, fin }) => {
  const finX = fin !== undefined ? lerp(-200, 1300, clamp01((f - fin) / 70)) : -999;
  return (
    <g>
      <Grad id={"bsky" + i} top={mix(SKY0, "#3a3a7a", dusk)} bot={mix(SKY1, "#ff8a5a", dusk)} h={1200} />
      {dusk > 0 && <circle cx={760} cy={1120} r={90} fill="#ffd27a" opacity={0.9} />}
      <SeaSurface f={f} y={1150} c={mix(SEA1, "#1a3a6a", dusk)} c2={SEA2} />
      {/* passing fin */}
      <g transform={`translate(${finX} 1210)`}><path d="M-40 0 L10 -90 L50 0 Z" fill={SHARK} stroke={INKC} strokeWidth={6} strokeLinejoin="round" /><path d="M-70 4 q 60 -16 140 0" stroke="#ffffff" strokeWidth={6} fill="none" /></g>
      <Boat f={f} dark={dusk * 0.4} />
      <g transform={`translate(0 ${Math.sin(f * 0.06) * 6})`}>
        <Duo f={f} ax={300} hx={790} askBase={f > F.mega && i === 0 ? "surprised" : "happy"} />
      </g>
      <QBubble f={f} i={i} x={460} y={i === 0 ? 900 : 860} tx={330} ty={1060} fs={i === 0 ? 84 : 76} />
    </g>
  );
};
const S2_Size: React.FC<{ f: number }> = ({ f }) => {
  const swim = eout(ramp(f, F.first - 10, F.big + 20));
  const tape = eio(ramp(f, F.fifteen - 8, F.meters + 10));
  const bus = eout(ramp(f, F.longer - 6, F.bus + 6));
  const L = 900, mx = lerp(-700, 540, swim), my = 760;
  return (
    <g>
      <Grad id="uw" top={SEA1} bot={SEA0} />
      <Rays f={f} />
      <Bubbles f={f} />
      <Shark f={f} x={mx} y={my} L={L} seed={1} />
      {/* measuring tape */}
      <g opacity={ramp(f, F.fifteen - 10, F.fifteen - 4)}>
        <rect x={540 - L / 2 - 50} y={1010} width={(L * 1.12) * tape} height={50} fill={YEL} stroke={INKC} strokeWidth={5} />
        {[...Array(16)].map((_, k) => k / 15 <= tape ? <line key={k} x1={540 - L / 2 - 50 + k * (L * 1.12) / 15} x2={540 - L / 2 - 50 + k * (L * 1.12) / 15} y1={1010} y2={k % 5 === 0 ? 1050 : 1032} stroke={INKC} strokeWidth={4} /> : null)}
      </g>
      {f >= F.fifteen - 8 && <BigNum f={f} at={F.fifteen - 4} text={`${countUp(f, F.fifteen - 4, F.meters + 6, 15)} M`} x={540} y={430} hue={YEL} fs={180} />}
      {/* school bus */}
      {bus > 0 && (
        <g transform={`translate(${lerp(1500, 520, bus)} 1300)`}>
          <rect x={-330} y={-170} width={660} height={170} rx={24} fill="#ffc31f" stroke={INKC} strokeWidth={7} />
          {[...Array(7)].map((_, k) => <rect key={k} x={-300 + k * 84} y={-148} width={66} height={60} rx={8} fill="#7cc4ff" stroke={INKC} strokeWidth={4} />)}
          <rect x={-330} y={-70} width={660} height={14} fill={INKC} />
          <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC} letterSpacing={4}>SCHOOL BUS</text>
          <circle cx={-220} cy={0} r={42} fill={INKC} /><circle cx={220} cy={0} r={42} fill={INKC} />
          <circle cx={-220} cy={0} r={16} fill="#aaa" /><circle cx={220} cy={0} r={16} fill="#aaa" />
        </g>
      )}
      {f >= F.longer && <Chip x={540} y={1460} w={560} label="LONGER THAN A BUS" hue={WARMC} p={pop(f, F.bus, 12)} fs={40} textColor={INKC} />}
    </g>
  );
};
const S3_Tooth: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(f, F.teeth - 4, 14), h = pop(f, F.hand - 6, 14);
  return (
    <g>
      <Grad id="toothbg" top="#f4e8d0" bot="#d8c4a0" />
      {[...Array(10)].map((_, i) => <circle key={i} cx={rnd("tb" + i) * VW} cy={rnd("tby" + i) * VH} r={40 + rnd("tbr" + i) * 80} fill="#ffffff" opacity={0.12} />)}
      <g transform={`translate(330 900) scale(${Math.max(0, t) * 2.6})`}><Tooth x={0} y={0} /></g>
      {/* hand */}
      <g transform={`translate(760 930) scale(${Math.max(0, h) * 1.9}) rotate(${Math.sin(f * 0.08) * 3})`}>
        <path d="M-50 90 L-54 -10 Q-60 -20 -54 -30 L-52 -80 Q-46 -94 -36 -80 L-34 -30 L-30 -100 Q-22 -114 -12 -100 L-10 -32 L-6 -108 Q2 -120 10 -106 L12 -30 L18 -96 Q26 -108 34 -94 L32 -20 L48 -50 Q60 -62 68 -46 L44 30 Q36 70 30 90 Z" fill="#efc69d" stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
      </g>
      {h > 0 && <text x={545} y={940} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={INKC} opacity={clamp01(h)}>=</text>}
      <Label x={330} y={1240} text="TOOTH" p={t} fs={58} fill={YEL} />
      <Label x={760} y={1240} text="YOUR HAND" p={h} fs={58} fill={YEL} />
      <Label x={540} y={440} text="TEETH AS LONG AS..." p={pop(f, F.teeth, 12)} fs={60} />
    </g>
  );
};
const S4_Coast: React.FC<{ f: number }> = ({ f }) => {
  const chase = (f - F.hunted) * 3;
  const deepX = pop(f, F.deep2 + 6, 12), warmC = pop(f, F.warm, 12), eye = pop(f, F.see, 12);
  return (
    <g>
      <Grad id="csky" top="#8fd0ff" bot="#e8f6ff" h={560} />
      <circle cx={180} cy={240} r={70} fill="#ffe27a" />
      {/* water: warm shallows (left) to dark deep (right) */}
      <defs>
        <linearGradient id="cwater" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2fb6c8" /><stop offset="0.45" stopColor="#1f6fa8" /><stop offset="1" stopColor="#081a3a" /></linearGradient>
      </defs>
      <rect x={0} y={560} width={VW} height={VH - 560} fill="url(#cwater)" />
      <rect x={180} y={560} width={400} height={460} fill={WARMC} opacity={0.14 * warmC} />
      {/* land + beach + lighthouse */}
      <path d="M0 470 L170 470 L230 560 L0 560 Z" fill="#f2d79a" stroke={INKC} strokeWidth={5} />
      <path d="M0 470 L140 470 L170 500 L0 500 Z" fill="#5aa84a" stroke={INKC} strokeWidth={5} />
      <g transform="translate(90 470)">
        <path d="M-26 0 L-18 -180 L18 -180 L26 0 Z" fill="#ffffff" stroke={INKC} strokeWidth={5} />
        <rect x={-21} y={-120} width={42} height={30} fill={RED} /><rect x={-24} y={-50} width={48} height={30} fill={RED} />
        <rect x={-24} y={-216} width={48} height={36} fill="#ffe27a" stroke={INKC} strokeWidth={5} />
        <path d="M-30 -216 L0 -246 L30 -216 Z" fill={RED} stroke={INKC} strokeWidth={5} />
      </g>
      {/* seabed: shelf then drop-off */}
      <path d="M0 540 L200 540 Q190 700 170 860 Q200 1000 300 1010 L560 1030 Q620 1500 720 1700 L1080 1760 L1080 1920 L0 1920 Z" fill="#9a7a4a" stroke={INKC} strokeWidth={6} />
      <path d="M560 1030 Q620 1500 720 1700 L1080 1760 L1080 1920 L600 1920 Z" fill="#3a3a4a" opacity={0.6} />
      <Bubbles f={f} n={16} seed="cb" />
      {/* whale + megalodon in the warm shallows */}
      <Whale f={f} x={360 + Math.sin(chase * 0.01) * 14} y={720} L={260} dir={-1} />
      <Shark f={f} x={lerp(1250, 470, eout(ramp(f, F.hunted - 10, F.whales + 10)))} y={860} L={340} dir={-1} jaw={0.5 + 0.5 * Math.sin(f * 0.2)} seed={2} />
      {/* deep: empty */}
      <text x={790} y={1420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#ffffff" opacity={0.25}>? ? ?</text>
      <Chip x={790} y={1260} w={300} label="THE DEEP" hue="#5a7a9a" p={pop(f, F.deep2 - 6, 12)} fs={40} />
      <Cross x={790} y={1110} p={deepX} r={60} />
      {f >= F.warm && <Chip x={400} y={1110} w={420} label="WARM COAST ✓" hue={WARMC} p={warmC} fs={40} textColor={INKC} />}
      {/* we'd see it */}
      {f >= F.see - 4 && (
        <g transform="translate(330 360)" opacity={clamp01(eye)}>
          <ellipse rx={90} ry={50} fill="#ffffff" stroke={INKC} strokeWidth={8} />
          <circle r={34} fill="#2f6db5" /><circle r={16} fill={INKC} /><circle cx={10} cy={-10} r={7} fill="#ffffff" />
          <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#ffffff" stroke={INKC} strokeWidth={8} paintOrder="stroke">WE'D SEE IT</text>
        </g>
      )}
    </g>
  );
};
const S5_Huge: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 0.26, eio(ramp(f, F.huge + 6, F.itIs + 10)));
  return (
    <g>
      <Grad id="hsky" top="#5a9ad8" bot="#cfe8ff" h={1200} />
      <SeaSurface f={f} y={1150} c={SEA1} c2={SEA2} />
      {k < 0.95 && [...Array(20)].map((_, i) => <path key={i} d={`M${rnd("hw" + i) * VW} ${1180 + rnd("hy" + i) * 700} q 30 -12 60 0`} stroke={SEA2} strokeWidth={5} fill="none" opacity={0.6 * (1 - k)} />)}
      <g transform={`translate(540 1150) scale(${k}) translate(-540 -1150)`}>
        <rect x={-40} y={1150} width={VW + 80} height={VH} fill={SEA1} opacity={k < 0.99 ? 0 : 0} />
        <Boat f={f} />
        <g transform={`translate(0 ${Math.sin(f * 0.06) * 6})`}><Duo f={f} /></g>
      </g>
      {/* water around the shrunk boat */}
      <rect x={0} y={1150 + (VH - 1150) * k} width={VW} height={VH} fill={SEA1} opacity={k < 0.98 ? 1 : 0} />
      <QBubble f={f} i={2} x={420} y={lerp(900, 760, 1 - (k - 0.26) / 0.74)} tx={lerp(280, 470, 1 - (k - 0.26) / 0.74)} ty={lerp(1080, 1130, 1 - (k - 0.26) / 0.74)} />
      {f >= F.itIs && <Label x={540} y={560} text="IT IS. BUT..." p={pop(f, F.itIs + 2, 12)} fs={72} fill={YEL} />}
    </g>
  );
};
const MAPLAND = [
  "M120 640 q60 -60 150 -40 q70 30 40 110 q-20 60 -80 80 q-40 60 -10 120 q-60 10 -80 -60 q-50 -90 -20 -210 Z",
  "M280 900 q50 -20 80 30 q20 80 -20 160 q-30 50 -50 10 q-30 -100 -10 -200 Z",
  "M480 620 q70 -40 130 -10 q-10 50 -60 60 q-50 10 -70 -50 Z",
  "M500 760 q80 -20 110 50 q20 100 -40 170 q-50 -20 -70 -110 q-20 -60 0 -110 Z",
  "M620 600 q120 -60 260 -20 q60 40 20 110 q-80 40 -140 20 q-60 30 -120 -20 q-40 -50 -20 -90 Z",
  "M840 920 q70 -20 110 30 q-10 50 -70 50 q-50 -10 -40 -80 Z",
];
const S6_Teeth: React.FC<{ f: number }> = ({ f }) => {
  return (
    <g>
      <Grad id="tuw" top={SEA1} bot={SEA0} />
      <Rays f={f} o={0.08} />
      <Shark f={f} x={540} y={720} L={720} jaw={0.6 + 0.4 * Math.sin(f * 0.25)} seed={3} c="#7a96ac" />
      {/* teeth falling */}
      {[...Array(14)].map((_, i) => {
        const t0 = F.sharks + i * 6;
        const q = (f - t0) / 70;
        if (q <= 0) return null;
        const y = 780 + Math.min(q, 1) * 700, x = 760 + (rnd("tf" + i) - 0.5) * 300 + Math.sin(q * 8 + i) * 20;
        return <g key={i} opacity={q > 1 ? 1 : 1}><Tooth x={x} y={Math.min(y, 1480)} s={0.3} fresh rot={q * 300 * (i % 2 ? 1 : -1)} /></g>;
      })}
      <path d="M0 1500 Q540 1460 1080 1500 L1080 1920 L0 1920 Z" fill="#c8a870" stroke={INKC} strokeWidth={6} />
      <BigNum f={f} at={F.thousands - 2} text="THOUSANDS" x={540} y={380} hue={YEL} fs={130} />
      <Label x={540} y={480} text="OF TEETH PER LIFETIME" p={pop(f, F.thousands + 20, 12)} fs={46} />
    </g>
  );
};
const S7_Map: React.FC<{ f: number }> = ({ f }) => {
  const pins = [[200, 700], [330, 980], [560, 640], [560, 880], [760, 650], [880, 960], [140, 800], [700, 760]];
  return (
    <g>
      <Grad id="map" top="#123a64" bot="#0a2240" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} x2={VW} y1={420 + i * 70} y2={420 + i * 70} stroke="#ffffff" strokeWidth={1.5} opacity={0.08} />)}
      <g>{MAPLAND.map((d, i) => <path key={i} d={d} fill="#e8d8a8" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />)}</g>
      {pins.map(([x, y], i) => {
        const at = F.megalodon2 + i * 5, p = pop(f, at, 12);
        if (p <= 0) return null;
        const old = f >= F.millions + i * 3;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${p})`}>
            <Tooth x={0} y={-50} s={0.38} />
            {old && <g><rect x={-62} y={-4} width={124} height={40} rx={12} fill={INKC} /><text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={YEL}>OLD</text></g>}
          </g>
        );
      })}
      <Label x={540} y={430} text="TEETH ALL OVER THE WORLD" p={pop(f, F.world, 12) * (1 - ramp(f, F.every - 6, F.every))} fs={52} />
      {f >= F.every && <Stamp f={f} at={F.millions} x={540} y={1260} text="MILLIONS OF YEARS OLD" hue={YEL} fs={54} rot={-5} />}
      {f >= F.no - 6 && (
        <g transform={`translate(540 ${1450})`}>
          <g opacity={pop(f, F.no - 4, 12)}><Tooth x={-230} y={0} s={0.6} fresh /></g>
          <Cross x={-230} y={0} p={pop(f, F.fresh, 10)} r={70} />
          <Label x={120} y={20} text="NO FRESH ONES" p={pop(f, F.fresh, 12)} fs={50} fill={RED} />
        </g>
      )}
    </g>
  );
};
const Museum: React.FC<{ f: number; i: number }> = ({ f, i }) => (
  <g>
    <Grad id={"mus" + i} top="#3a2a3a" bot="#6a4a3a" />
    {[...Array(6)].map((_, k) => <rect key={k} x={k * 190 - 40} y={0} width={14} height={1460} fill="#000000" opacity={0.12} />)}
    {/* spotlight */}
    <path d="M440 0 L640 0 L900 1460 L180 1460 Z" fill="#fff6d8" opacity={0.08} />
    {/* giant jaw on the wall */}
    <g transform="translate(540 700)">
      <ellipse rx={300} ry={250} fill="#2a1e2a" stroke="#8a7a6a" strokeWidth={34} />
      <ellipse rx={300} ry={250} fill="none" stroke={INKC} strokeWidth={6} />
      {[...Array(18)].map((_, k) => { const a = (k / 18) * Math.PI * 2; return <g key={k} transform={`translate(${Math.cos(a) * 262} ${Math.sin(a) * 214}) rotate(${(a * 180) / Math.PI - 90})`}><path d="M-14 -4 L0 34 L14 -4 Z" fill="#e8dcc0" stroke={INKC} strokeWidth={3} /></g>; })}
      <rect x={-170} y={290} width={340} height={64} rx={10} fill="#c8a24a" stroke={INKC} strokeWidth={5} />
      <text y={334} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={INKC} letterSpacing={3}>MEGALODON</text>
    </g>
    <rect x={0} y={1460} width={VW} height={VH - 1460} fill="#4a3428" />
    {[...Array(9)].map((_, k) => <line key={k} x1={k * 130} x2={k * 130 - 60} y1={1460} y2={VH} stroke={INKC} strokeWidth={3} opacity={0.3} />)}
    <Duo f={f} y={1530} />
    <QBubble f={f} i={i === 0 ? 3 : 4} x={430} y={1010} tx={280} ty={1150} fs={80} />
  </g>
);
const S9_Whale: React.FC<{ f: number }> = ({ f }) => {
  const bite = pop(f, F.bite2, 12) * (1 - ramp(f, F.today - 4, F.today + 6));
  const clean = f >= F.today;
  return (
    <g>
      <Grad id="wuw" top={SEA1} bot={SEA0} />
      <Rays f={f} />
      <Bubbles f={f} seed="wb" />
      {!clean && <Shark f={f} x={lerp(-500, -60, eout(ramp(f, F.giant - 8, F.shark2 + 10)))} y={700} L={700} jaw={0.8} seed={4} ghost />}
      <Whale f={f} x={lerp(600, 560, ramp(f, F.giant, F.dont + 40))} y={1050} L={760} bite={bite} />
      {!clean && f >= F.huge2 && <Label x={540} y={440} text="HUGE BITE MARKS?" p={pop(f, F.huge2, 12)} fs={62} fill={RED} />}
      {clean && <Label x={540} y={440} text="TODAY: NONE" p={pop(f, F.today + 2, 12)} fs={76} fill={GREEN} />}
      {clean && <Check x={560} y={1020} p={pop(f, F.dont, 12)} r={80} />}
    </g>
  );
};
const S10_Cool: React.FC<{ f: number }> = ({ f }) => {
  const cool = eio(ramp(f, F.oceans - 6, F.cooled + 30));
  const away = eio(ramp(f, F.food, F.away + 30));
  return (
    <g>
      <Grad id="cool" top="#03050f" bot="#0d1636" />
      {[...Array(60)].map((_, i) => <circle key={i} cx={rnd("cs" + i) * VW} cy={rnd("csy" + i) * VH} r={1 + rnd("csr" + i) * 2} fill="#ffffff" opacity={0.5} />)}
      {/* globe */}
      <g transform="translate(470 960)">
        <circle r={330} fill={mix("#2fa8c8", "#1a4a8a", cool)} stroke={INKC} strokeWidth={8} />
        <defs><clipPath id="gclip"><circle r={330} /></clipPath></defs>
        <g clipPath="url(#gclip)">
          {MAPLAND.map((d, i) => <path key={i} d={d} transform="translate(-540 -800) scale(1)" fill="#7ab85a" stroke={INKC} strokeWidth={5} />)}
          <rect x={-330} y={-330} width={660} height={110 * cool} fill="#ffffff" opacity={0.85} />
          <rect x={-330} y={330 - 110 * cool} width={660} height={110 * cool} fill="#ffffff" opacity={0.85} />
        </g>
        {/* whales (food) moving away toward the poles */}
        {[[-120, 60, -1], [140, 40, -1], [0, 140, 1], [-60, -40, -1]].map(([x, y, d], i) => (
          <g key={i} transform={`translate(${x} ${y + d * away * 260}) scale(0.16)`} opacity={1 - away * 0.3}><Whale f={f} x={0} y={0} L={600} seed={i} /></g>
        ))}
      </g>
      {/* thermometer */}
      <g transform="translate(900 1000)">
        <rect x={-34} y={-400} width={68} height={420} rx={34} fill="#ffffff" stroke={INKC} strokeWidth={7} />
        <circle cy={60} r={64} fill={mix(RED, "#3d8cff", cool)} stroke={INKC} strokeWidth={7} />
        <rect x={-18} y={-360 + cool * 240} width={36} height={420 - cool * 240} fill={mix(RED, "#3d8cff", cool)} />
        <text y={-430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={mix(RED, "#5ad7ff", cool)} stroke={INKC} strokeWidth={6} paintOrder="stroke">{cool > 0.5 ? "COLD" : "WARM"}</text>
      </g>
      <BigNum f={f} at={F.three - 2} text="3.5 MILLION" x={540} y={380} hue={YEL} fs={120} />
      <Label x={540} y={490} text="YEARS AGO" p={pop(f, F.million + 6, 12)} fs={56} />
      {f >= F.food && <Chip x={470} y={1420} w={420} label="FOOD MOVED AWAY" hue="#5ad7ff" p={pop(f, F.food + 4, 12)} fs={36} textColor={INKC} />}
    </g>
  );
};
const S11_Rival: React.FC<{ f: number }> = ({ f }) => {
  const zip = eio(ramp(f, F.faster - 4, F.rival + 10));
  const take = eio(ramp(f, F.competed, F.prey + 10));
  const gx = lerp(1400, 760, zip) - take * 260;
  return (
    <g>
      <Grad id="ruw" top="#2a7ab8" bot={SEA0} />
      <Rays f={f} o={0.1} />
      <Bubbles f={f} seed="rb" />
      <Shark f={f} x={lerp(300, 240, take)} y={760} L={640} jaw={0.3} seed={5} />
      {/* prey: a seal */}
      <g transform={`translate(${lerp(540, 480, take)} ${1200 - take * 40}) scale(${1 - take * 0.2})`} opacity={1 - ramp(f, F.prey + 6, F.prey + 20)}>
        <ellipse rx={90} ry={40} fill="#7a6a5a" stroke={INKC} strokeWidth={6} />
        <circle cx={80} cy={-14} r={34} fill="#7a6a5a" stroke={INKC} strokeWidth={6} />
        <circle cx={94} cy={-20} r={5} fill={INKC} />
        <path d="M-80 0 L-130 -30 L-124 30 Z" fill="#6a5a4a" stroke={INKC} strokeWidth={5} />
      </g>
      {/* great white zipping in */}
      {zip > 0 && zip < 1 && [...Array(6)].map((_, i) => <line key={i} x1={gx + 160} x2={gx + 360} y1={1150 + i * 20 - 60} y2={1150 + i * 20 - 60} stroke="#ffffff" strokeWidth={5} opacity={0.6} />)}
      <Shark f={f} x={gx} y={1170} L={360} dir={-1} c="#8a9aa8" jaw={take > 0.3 ? 0.9 : 0.2} seed={6} />
      <Label x={540} y={420} text="SMALLER, FASTER RIVAL" p={pop(f, F.smaller, 12) * (1 - ramp(f, F.great - 8, F.great))} fs={56} fill={YEL} />
      {f >= F.great && <BigNum f={f} at={F.great} text="GREAT WHITE" x={540} y={460} hue="#ffffff" fs={110} />}
      {f >= F.competed && <Chip x={760} y={1440} w={380} label="SAME PREY" hue={RED} p={pop(f, F.competed + 4, 12)} fs={38} />}
    </g>
  );
};
const S12_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Grad id="osky" top="#3a3a7a" bot="#ff8a5a" h={1200} />
    <circle cx={540} cy={1140} r={110} fill="#ffd27a" />
    <SeaSurface f={f} y={1150} c="#1a3a6a" c2={SEA2} />
    <g transform={`translate(${lerp(-200, 1300, clamp01((f - F.sub) / 120))} 1210)`}><path d="M-40 0 L10 -90 L50 0 Z" fill={SHARK} stroke={INKC} strokeWidth={6} strokeLinejoin="round" /></g>
    <Boat f={f} dark={0.4} />
    <Outro f={f} at={F.sub} />
    <g transform={`translate(0 ${Math.sin(f * 0.06) * 6})`}><Duo f={f} ax={160} hx={915} s={0.72} wave hostWave /></g>
  </g>
);

export const MegalodonFilm: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = F.first - 4, c2 = F.thats - 4, b3 = F.its - 4, b4 = F.deep - 4, b5 = F.didnt - 6, b6 = F.huge - 4, b7 = F.butSharks - 4, b8 = F.find - 6, b9 = F.bite - 4, b10 = F.giant - 6, b11 = F.killed - 4, b12 = F.around - 4, b13 = F.rival0 - 4, b14 = F.sub - 4;
  const SHOTS: Shot[] = [
    { from: 0, to: b1, render: () => <S1_Boat f={f} i={0} fin={F.mega - 10} />, cam: [[0, { x: 540, y: 1250, z: 1.3 }], [F.mega, { x: 540, y: 1220, z: 1.22 }], [b1, { x: 540, y: 1200, z: 1.28 }]] },
    { from: b1, to: c2, tr: "whipUp", render: () => <S2_Size f={f} />, cam: [[b1, { x: 300, y: 760, z: 1.3 }], [F.fifteen, { x: 540, y: 700, z: 1.05 }], [c2, { x: 540, y: 760, z: 1.02 }]] },
    { from: c2, to: b3, tr: "cut", render: () => <S2_Size f={f} />, cam: [[c2, { x: 540, y: 1100, z: 1.2 }], [b3, { x: 540, y: 1000, z: 1.06 }]] },
    { from: b3, to: b4, tr: "zoom", render: () => <S3_Tooth f={f} />, cam: [[b3, { x: 540, y: 880, z: 1.25 }], [F.hand, { x: 560, y: 900, z: 1.1 }], [b4, { x: 540, y: 900, z: 1.16 }]] },
    { from: b4, to: b5, tr: "wipe", render: () => <S1_Boat f={f} i={1} dusk={0.7} />, cam: [[b4, { x: 540, y: 1200, z: 1.22 }], [F.problem, { x: 580, y: 1230, z: 1.3 }], [b5, { x: 560, y: 1230, z: 1.34 }]] },
    { from: b5, to: b6, tr: "iris", render: () => <S4_Coast f={f} />, cam: [[b5, { x: 760, y: 1200, z: 1.3 }], [F.hunted, { x: 520, y: 800, z: 1.22 }], [F.coast, { x: 540, y: 760, z: 1.15 }], [F.see, { x: 540, y: 760, z: 1.1 }], [b6, { x: 540, y: 900, z: 1.0 }]] },
    { from: b6, to: b7, tr: "push", render: () => <S5_Huge f={f} />, cam: [[b6, { x: 540, y: 1100, z: 1.12 }], [b7, { x: 540, y: 960, z: 1.0 }]] },
    { from: b7, to: b8, tr: "spin", render: () => <S6_Teeth f={f} />, cam: [[b7, { x: 600, y: 760, z: 1.3 }], [F.thousands, { x: 600, y: 900, z: 1.12 }], [b8, { x: 620, y: 1000, z: 1.2 }]] },
    { from: b8, to: b9, tr: "whip", render: () => <S7_Map f={f} />, cam: [[b8, { x: 540, y: 800, z: 1.3 }], [F.every, { x: 540, y: 900, z: 1.08 }], [F.no, { x: 540, y: 1150, z: 1.15 }], [b9, { x: 540, y: 1100, z: 1.1 }]] },
    { from: b9, to: b10, tr: "flash", render: () => <Museum f={f} i={0} />, cam: [[b9, { x: 540, y: 1100, z: 1.18 }], [b10, { x: 540, y: 1060, z: 1.1 }]] },
    { from: b10, to: b11, tr: "wipe", render: () => <S9_Whale f={f} />, cam: [[b10, { x: 400, y: 900, z: 1.25 }], [F.today, { x: 560, y: 1000, z: 1.1 }], [b11, { x: 560, y: 1000, z: 1.2 }]] },
    { from: b11, to: b12, tr: "zoom", render: () => <Museum f={f} i={1} />, cam: [[b11, { x: 540, y: 1000, z: 1.05 }], [b12, { x: 500, y: 1120, z: 1.18 }]] },
    { from: b12, to: b13, tr: "whipUp", render: () => <S10_Cool f={f} />, cam: [[b12, { x: 540, y: 600, z: 1.3 }], [F.oceans, { x: 540, y: 900, z: 1.08 }], [F.food, { x: 480, y: 1000, z: 1.15 }], [b13, { x: 540, y: 960, z: 1.0 }]] },
    { from: b13, to: b14, tr: "iris", render: () => <S11_Rival f={f} />, cam: [[b13, { x: 400, y: 800, z: 1.25 }], [F.faster, { x: 600, y: 1000, z: 1.12 }], [F.great, { x: 540, y: 900, z: 1.04 }], [b14, { x: 540, y: 960, z: 1.08 }]] },
    { from: b14, to: TOTAL + 1, tr: "push", render: () => <S12_Outro f={f} />, cam: [[b14, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.alive, 0.08], [F.fifteen, 0.1], [F.bus, 0.1], [F.hand, 0.1], [F.coast, 0.08], [F.huge + 6, 0.08], [F.thousands, 0.1], [F.millions, 0.12], [F.fresh, 0.1], [F.today, 0.1], [F.three, 0.12], [F.great, 0.14]];
  const SHAKE: [number, number][] = [[F.bus + 4, 8], [F.millions + 2, 10], [F.great + 2, 12]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.45], [F.mega - 10, "whoosh", 0.3], [F.fifteen - 4, "riser", 0.25], [F.meters, "impact", 0.4], [F.bus, "boom", 0.35],
    [F.teeth - 4, "pop", 0.4], [F.hand - 6, "pop", 0.4], [F.deep - 3, "pop", 0.45], [F.didnt + 6, "impact", 0.35], [F.warm, "pop", 0.35], [F.see, "pop", 0.35],
    [F.huge - 3, "pop", 0.45], [F.huge + 6, "whoosh", 0.35], [F.sharks, "tick", 0.3], [F.thousands - 2, "impact", 0.35],
    [F.megalodon2, "pop", 0.3], [F.millions, "boom", 0.4], [F.no - 4, "pop", 0.3], [F.fresh, "impact", 0.35],
    [F.bite - 3, "pop", 0.45], [F.bite2, "pop", 0.3], [F.today, "riser", 0.25], [F.dont, "pop", 0.4],
    [F.killed - 3, "pop", 0.45], [F.three - 2, "impact", 0.4], [F.cooled, "riser_dark", 0.25], [F.food + 4, "pop", 0.3],
    [F.faster - 4, "whoosh", 0.4], [F.great, "boom", 0.45], [F.competed + 4, "pop", 0.3],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < b4 ? YEL : f < b9 ? "#5ad7ff" : f < b12 ? YEL : WARMC;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="MEGALODON" sub="STILL ALIVE?" until={F.first - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="megalodon" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
