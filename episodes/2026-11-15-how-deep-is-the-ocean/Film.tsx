import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (word start frames from words.ts)
const F = {
  ask: 17, askEnd: 69, deepest: 93, challenger: 126, mariana: 163, almost: 197, eleven: 210, km: 222, down: 241, seven: 271, miles: 283,
  okay: 314, okayEnd: 393, drop: 411, everest: 430, in: 444, tallest: 466, earth: 495, peak: 519, two: 560, underwater: 581,
  whoa: 615, whoaEnd: 633, pressure: 682, thousand: 708, stronger: 729, surface: 758, like: 779, eight: 786, tons: 794, every: 818, inch: 836,
  anyone: 862, anyEnd: 922, y1960: 946, twoMen: 957, piccard: 974, walsh: 1011, sank: 1031, sub: 1059, trieste: 1087,
  way: 1122, window: 1131, cracked: 1140, kept: 1180, took: 1211, five: 1228, hours: 1235, bottom: 1262,
  what: 1292, whatEnd: 1327, life: 1345, tiny: 1370, shrimp: 1378, crawl: 1410, y2019: 1469, explorer: 1486, veryBottom: 1514, found: 1536, plastic: 1595, bag: 1611,
  seriously: 1639, serEnd: 1664, even: 1682, deepestP: 1694, reach: 1766, subscribe: 1792,
};
const SKY0 = "#7cc8ff", SKY1 = "#d8f0ff", SEA0 = "#1e88c9", SEA1 = "#0a2a5c", ABYSS = "#020814", ROCK = "#2b2a3a", RED = "#ff4b4b", GREEN = "#3ddc97", CYAN = "#58e1ff", ORANGE = "#ff8a3d";
const YT = CAST[42], DIVER = CAST[46];
const PICCARD: PersonDef = { ...CAST[1], prop: "none" }, WALSH: PersonDef = { ...CAST[13], glasses: "none" };
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const KM = (k: number) => 240 + k * 115; // depth column: 0 km at y 240, 11 km at y 1505

// ---------- Q&A bubble ----------
const Bubble: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string; dx?: number; fs?: number; ink?: string }> = ({ f, a, b, x, y, text, dx = 0, fs = 80, ink = INKC }) => {
  if (f < a - 2 || f > b + 14) return null;
  const p = pop(f, a - 2, 10), out = 1 - ramp(f, b + 4, b + 14);
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * fs * 0.64 + 80, h = lines.length * fs * 1.08 + 46;
  const cx = Math.min(VW - w / 2 - 40, Math.max(w / 2 + 40, x + dx));
  const by = y - 54, bx = Math.min(cx + w / 2 - 60, Math.max(cx - w / 2 + 60, x));
  const s = Math.max(0.01, p * out), rot = Math.sin(f * 0.13) * 1.6;
  return (
    <g opacity={clamp01(p * 2) * out} transform={`translate(${x} ${y}) scale(${s}) rotate(${rot}) translate(${-x} ${-y})`}>
      <rect x={cx - w / 2 + 10} y={by - h + 12} width={w} height={h} rx={40} fill="#000" opacity={0.3} />
      <path d={`M${bx - 30} ${by - 6} L${x} ${y} L${bx + 30} ${by - 6} Z`} fill="#fff" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <rect x={cx - w / 2} y={by - h} width={w} height={h} rx={40} fill="#fff" stroke={INKC} strokeWidth={8} />
      <path d={`M${bx - 24} ${by - 8} L${bx + 24} ${by - 8}`} stroke="#fff" strokeWidth={12} />
      {lines.map((l, k) => <text key={k} x={cx} y={by - h + 23 + fs * 0.86 + k * fs * 1.08} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={ink} letterSpacing={1}>{l}</text>)}
    </g>
  );
};

// ---------- set pieces ----------
const P: React.FC<{ d: PersonDef; f: number; x: number; y: number; s: number; seed: number; talk?: number; wave?: number; mood?: "happy" | "neutral" | "surprised" }> = ({ d, f, x, y, s, seed, talk = 0, wave = 0, mood = "neutral" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood} /></g>
);
const Waves: React.FC<{ f: number; y: number; c: string; amp?: number; sp?: number }> = ({ f, y, c, amp = 14, sp = 1 }) => {
  let d = `M0 ${y}`;
  for (let x = 0; x <= VW; x += 40) d += ` L${x} ${y + Math.sin(x * 0.02 + f * 0.08 * sp) * amp}`;
  return <path d={d + ` V${VH} H0 Z`} fill={c} />;
};
/** Boat deck on the sea surface: asker left, diver right. */
const Deck: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; hostWave?: number; children?: React.ReactNode; trash?: number }> = ({ f, askMood, hostWave = 0, children, trash = 0 }) => (
  <g>
    <defs><linearGradient id="ocSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#ocSky)" />
    <circle cx={860} cy={300} r={80} fill="#fff3b0" />
    {[0, 1].map((i) => <ellipse key={i} cx={((rnd("oc" + i) * VW + f * 0.5) % (VW + 300)) - 150} cy={420 + i * 120} rx={120} ry={36} fill="#fff" opacity={0.9} />)}
    <Waves f={f} y={880} c={SEA0} amp={8} />
    <Waves f={f} y={960} c="#1674b0" amp={12} sp={1.3} />
    {trash > 0 && (
      <g opacity={trash} transform={`translate(${820 + Math.sin(f * 0.05) * 20} ${1010 + Math.sin(f * 0.08) * 8}) rotate(${Math.sin(f * 0.06) * 10})`}>
        <path d="M-40 -30 Q-46 30 -30 50 H30 Q46 30 40 -30 L22 -30 Q20 -50 10 -50 Q0 -40 -6 -30 Z" fill="#f4f4f4" fillOpacity={0.85} stroke="#9aa4b2" strokeWidth={4} />
      </g>
    )}
    {/* deck + rail */}
    <rect x={0} y={1180} width={VW} height={14} fill="#f4f1ea" stroke={INKC} strokeWidth={4} />
    {[...Array(12)].map((_, i) => <rect key={i} x={20 + i * 92} y={1180} width={10} height={280} fill="#f4f1ea" stroke={INKC} strokeWidth={3} />)}
    <rect x={0} y={1460} width={VW} height={VH - 1460} fill="#8a5f36" />
    {[...Array(6)].map((_, i) => <line key={i} x1={0} y1={1500 + i * 70} x2={VW} y2={1500 + i * 70} stroke="#6e4a28" strokeWidth={5} />)}
    <P d={YT} f={f} x={300} y={1500} s={1.04} seed={42} talk={askTalk(f)} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy")} />
    <P d={DIVER} f={f} x={790} y={1500} s={1.0} seed={46} talk={hostTalk(f)} mood="happy" wave={hostWave} />
    {children}
  </g>
);
/** Inside a submersible: big porthole, both characters. */
const SubInside: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; view?: React.ReactNode; children?: React.ReactNode }> = ({ f, askMood, view, children }) => (
  <g>
    <rect width={VW} height={VH} fill="#4a5a66" />
    {[...Array(6)].map((_, i) => <rect key={i} x={0} y={140 + i * 220} width={VW} height={8} fill="#3a4852" />)}
    {[...Array(14)].map((_, i) => <circle key={i} cx={40 + (i % 7) * 166} cy={i < 7 ? 160 : 1040} r={7} fill="#2c3840" />)}
    <defs>
      <clipPath id="ocPort"><circle cx={540} cy={600} r={270} /></clipPath>
      <radialGradient id="ocDeep" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#0b2a52" /><stop offset="1" stopColor={ABYSS} /></radialGradient>
    </defs>
    <g clipPath="url(#ocPort)">
      <rect x={260} y={320} width={560} height={560} fill="url(#ocDeep)" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={270 + rnd("pp" + i) * 540} cy={330 + ((rnd("pq" + i) * 540 - f * 0.6) % 540 + 540) % 540} r={1.5 + rnd("pr" + i) * 3} fill="#cfe8ff" opacity={0.5} />)}
      {view}
    </g>
    <circle cx={540} cy={600} r={270} fill="none" stroke="#c9d3e6" strokeWidth={36} />
    <circle cx={540} cy={600} r={270} fill="none" stroke={INKC} strokeWidth={6} />
    {[...Array(12)].map((_, i) => <circle key={i} cx={540 + Math.cos(i * Math.PI / 6) * 270} cy={600 + Math.sin(i * Math.PI / 6) * 270} r={9} fill="#8a96a8" stroke={INKC} strokeWidth={3} />)}
    <rect y={1460} width={VW} height={VH - 1460} fill="#2c3840" />
    <P d={YT} f={f} x={300} y={1500} s={1.04} seed={42} talk={askTalk(f)} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy")} />
    <P d={DIVER} f={f} x={790} y={1500} s={1.0} seed={46} talk={hostTalk(f)} mood="happy" />
    {children}
  </g>
);
/** Full ocean depth column 0–11 km with the Mariana Trench. */
const Column: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="ocCol" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SEA0} /><stop offset="0.25" stopColor={SEA1} /><stop offset="0.6" stopColor="#061633" /><stop offset="1" stopColor={ABYSS} />
      </linearGradient>
      <linearGradient id="ocSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient>
    </defs>
    <rect width={VW} height={KM(0)} fill="url(#ocSky2)" />
    <rect y={KM(0)} width={VW} height={VH - KM(0)} fill="url(#ocCol)" />
    <Waves f={f} y={KM(0)} c={SEA0} amp={6} />
    <rect y={KM(0) + 8} width={VW} height={VH} fill="url(#ocCol)" />
    {/* boat on surface */}
    <path d={`M760 ${KM(0) - 6} h180 l-24 34 h-132 Z`} fill="#f4f1ea" stroke={INKC} strokeWidth={5} />
    <rect x={820} y={KM(0) - 46} width={60} height={40} fill="#ff4b4b" stroke={INKC} strokeWidth={4} />
    {/* seabed + trench */}
    <path d={`M0 ${KM(4)} L240 ${KM(4.3)} L420 ${KM(7)} L500 ${KM(11)} L600 ${KM(11)} L700 ${KM(7.2)} L860 ${KM(4.6)} L1080 ${KM(4.1)} V${VH} H0 Z`} fill={ROCK} stroke="#4a4860" strokeWidth={6} />
    {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("mx" + i) * VW} cy={KM(0) + rnd("my" + i) * (KM(11) - KM(0))} r={1.5 + rnd("mr" + i) * 2.5} fill="#cfe8ff" opacity={0.25 + 0.2 * Math.sin(f * 0.05 + i)} />)}
    {/* depth ticks */}
    {[...Array(12)].map((_, k) => (
      <g key={k}>
        <line x1={0} y1={KM(k)} x2={k % 2 ? 40 : 70} y2={KM(k)} stroke="#cfe8ff" strokeWidth={4} opacity={0.8} />
        {k > 0 && k % 2 === 0 && <text x={84} y={KM(k) + 11} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#cfe8ff" opacity={0.85}>{k} KM</text>}
      </g>
    ))}
  </g>
);
const Everest: React.FC<{ x: number; base: number; h: number }> = ({ x, base, h }) => (
  <g>
    <path d={`M${x - h * 0.55} ${base} L${x - h * 0.12} ${base - h * 0.75} L${x - h * 0.04} ${base - h * 0.88} L${x} ${base - h} L${x + h * 0.1} ${base - h * 0.85} L${x + h * 0.22} ${base - h * 0.68} L${x + h * 0.55} ${base} Z`} fill="#6b6a80" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
    <path d={`M${x - h * 0.1} ${base - h * 0.77} L${x - h * 0.04} ${base - h * 0.88} L${x} ${base - h} L${x + h * 0.1} ${base - h * 0.85} L${x + h * 0.15} ${base - h * 0.76} L${x + h * 0.06} ${base - h * 0.8} L${x} ${base - h * 0.74} L${x - h * 0.05} ${base - h * 0.79} Z`} fill="#f4f8ff" />
  </g>
);
const Trieste: React.FC<{ x: number; y: number; s: number; f: number; crack?: number; lamp?: number }> = ({ x, y, s, f, crack = 0, lamp = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {lamp > 0 && <path d="M60 170 L380 520 L-260 520 L-20 170 Z" fill="#fff6c0" opacity={0.12 * lamp} />}
    <rect x={-250} y={-90} width={500} height={150} rx={75} fill="#e8ecf2" stroke={INKC} strokeWidth={8} />
    <rect x={-30} y={-150} width={80} height={64} rx={8} fill="#d4dae4" stroke={INKC} strokeWidth={6} />
    <rect x={-200} y={-50} width={400} height={14} fill="#c9d0db" />
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC} letterSpacing={6}>TRIESTE</text>
    <rect x={-150} y={56} width={60} height={50} fill="#9aa4b2" stroke={INKC} strokeWidth={5} />
    <rect x={90} y={56} width={60} height={50} fill="#9aa4b2" stroke={INKC} strokeWidth={5} />
    <line x1={0} y1={60} x2={0} y2={92} stroke={INKC} strokeWidth={10} />
    <circle cx={0} cy={150} r={66} fill="#8a96a8" stroke={INKC} strokeWidth={8} />
    <circle cx={22} cy={160} r={20} fill="#bfe6ff" stroke={INKC} strokeWidth={5} />
    {crack > 0 && <path d="M22 160 l12 -10 M22 160 l-14 -6 M22 160 l4 16 M22 160 l16 8" stroke="#fff" strokeWidth={3} opacity={crack} />}
  </g>
);
const Amphipod: React.FC<{ x: number; y: number; s: number; f: number; seed: number }> = ({ x, y, s, f, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 Q-50 -36 0 -40 Q50 -36 64 -6 Q40 10 -60 0 Z" fill="#f2e6d8" stroke={INKC} strokeWidth={5} />
    {[...Array(5)].map((_, i) => <path key={i} d={`M${-40 + i * 20} -36 Q${-36 + i * 20} -14 ${-40 + i * 20} -2`} stroke="#c9b8a4" strokeWidth={3} fill="none" />)}
    <circle cx={50} cy={-18} r={5} fill={INKC} />
    <path d={`M62 -14 Q90 ${-40 + Math.sin(f * 0.3 + seed) * 6} 110 -30 M60 -10 Q92 ${-20 + Math.sin(f * 0.3 + seed + 1) * 6} 112 -12`} stroke="#c9b8a4" strokeWidth={4} fill="none" />
    {[...Array(6)].map((_, i) => <line key={i} x1={-40 + i * 18} y1={0} x2={-44 + i * 18 + Math.sin(f * 0.5 + i + seed) * 6} y2={18} stroke="#c9b8a4" strokeWidth={4} strokeLinecap="round" />)}
  </g>
);
const Bag: React.FC<{ x: number; y: number; s: number; f: number; o?: number }> = ({ x, y, s, f, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y + Math.sin(f * 0.06) * 8}) rotate(${Math.sin(f * 0.04) * 8}) scale(${s})`}>
    <path d="M-60 -50 Q-70 50 -46 80 H46 Q70 50 60 -50 L34 -50 Q30 -84 14 -84 Q0 -70 -6 -50 Z" fill="#f4f4f4" fillOpacity={0.85} stroke="#cfd6e0" strokeWidth={5} />
    <path d="M-34 -50 Q-30 -84 -14 -84 Q-4 -70 -6 -50" fill="none" stroke="#cfd6e0" strokeWidth={5} />
    <path d="M-30 0 Q0 20 30 0" stroke="#cfd6e0" strokeWidth={3} fill="none" />
  </g>
);

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <Deck f={f}><Bubble f={f} a={36} b={F.askEnd} x={300} y={1020} text={"HOW DEEP?!"} dx={100} fs={92} /></Deck>
);
const S2_Dive: React.FC<{ f: number }> = ({ f }) => {
  const t = eio(ramp(f, F.almost - 10, F.down + 16));
  const py = lerp(KM(0) + 60, KM(10.9) - 30, t);
  const depthM = Math.round(t * 10935);
  return (
    <g>
      <Column f={f} />
      <text x={760} y={KM(0) + 150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.deepest, 10)}>DEEPEST POINT?</text>
      {/* probe */}
      <g transform={`translate(550 ${py})`}>
        <line x1={0} y1={-2000} x2={0} y2={-20} stroke="#cfe8ff" strokeWidth={3} opacity={0.5} />
        <circle r={22} fill={YEL} stroke={INKC} strokeWidth={5} />
        <circle r={40 + 8 * Math.sin(f * 0.3)} fill="none" stroke={YEL} strokeWidth={3} opacity={0.6} />
        {f >= F.almost - 10 && (
          <g transform="translate(70 12)">
            <rect x={0} y={-46} width={300} height={84} rx={18} fill="rgba(4,10,28,0.85)" stroke={YEL} strokeWidth={5} />
            <text x={150} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill="#fff">{depthM.toLocaleString("en-US")} m</text>
          </g>
        )}
      </g>
      {f >= F.challenger - 2 && <Chip x={370} y={KM(9.3)} w={400} label="CHALLENGER DEEP" hue={ORANGE} p={pop(f, F.challenger - 2, 10)} fs={36} textColor={INKC} />}
      {f >= F.mariana - 2 && <Chip x={620} y={KM(3.2)} w={430} label="MARIANA TRENCH" hue={CYAN} p={pop(f, F.mariana - 2, 10)} fs={38} textColor={INKC} />}
      {f >= F.eleven - 2 && <BigNum f={f} at={F.eleven - 2} text="11 KM" x={540} y={KM(6.2)} hue={YEL} fs={150} />}
      {f >= F.seven - 2 && <BigNum f={f} at={F.seven - 2} text="7 MILES" x={540} y={KM(6.2) + 130} hue={CYAN} fs={100} />}
    </g>
  );
};
const S3_Really: React.FC<{ f: number }> = ({ f }) => (
  <Deck f={f} askMood={speaking(f, "asker", SPK) ? "neutral" : "happy"}>
    <Bubble f={f} a={F.okay} b={F.okayEnd} x={300} y={1020} text={"BUT HOW DEEP\nIS THAT?!"} dx={130} fs={76} />
  </Deck>
);
const S4_Everest: React.FC<{ f: number }> = ({ f }) => {
  const drop = eio(ramp(f, F.drop, F.in + 4));
  const base = lerp(KM(2) - 400, KM(11), drop * drop);
  const h = 8.849 * 115;
  const gap = KM(11) - h;
  return (
    <g>
      <Column f={f} />
      <Everest x={550} base={base} h={h} />
      {drop >= 1 && [...Array(10)].map((_, i) => { const q = clamp01((f - F.in - 4) / 30); return <circle key={i} cx={550 + (i - 4.5) * 70 * (0.4 + q)} cy={KM(11) - 20 - q * 60 * rnd("d" + i)} r={18 * (1 - q) + 4} fill="#8a8aa0" opacity={(1 - q) * 0.7} />; })}
      <text x={540} y={KM(0) - 120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC} opacity={pop(f, F.drop, 10) * (1 - ramp(f, F.in, F.in + 10))}>DROP EVEREST IN!</text>
      {f >= F.tallest - 2 && <Chip x={760} y={KM(5)} w={420} label="EVEREST 8,849 M" hue="#f4f8ff" p={pop(f, F.tallest - 2, 10)} fs={36} textColor={INKC} />}
      {f >= F.peak - 4 && (
        <g opacity={ramp(f, F.peak - 4, F.peak + 6)}>
          <line x1={330} y1={KM(0) + 8} x2={330} y2={gap - 8} stroke={YEL} strokeWidth={8} />
          <line x1={300} y1={KM(0) + 8} x2={360} y2={KM(0) + 8} stroke={YEL} strokeWidth={8} />
          <line x1={300} y1={gap - 8} x2={360} y2={gap - 8} stroke={YEL} strokeWidth={8} />
          <circle cx={550} cy={gap} r={22 + 6 * Math.sin(f * 0.3)} fill="none" stroke={YEL} strokeWidth={5} />
        </g>
      )}
      {f >= F.two - 4 && <BigNum f={f} at={F.two - 4} text={`${(countUp(f, F.two - 4, F.two + 16, 209) / 100).toFixed(1)}+ KM`} x={640} y={KM(1.4)} hue={YEL} fs={96} />}
      {f >= F.underwater - 2 && <Chip x={640} y={KM(1.4) + 70} w={400} label="STILL UNDERWATER" hue={CYAN} p={pop(f, F.underwater - 2, 10)} fs={34} textColor={INKC} />}
    </g>
  );
};
const S5_Pressure: React.FC<{ f: number }> = ({ f }) => {
  const squish = eio(ramp(f, F.thousand - 4, F.stronger + 16));
  const arrowsIn = ramp(f, F.pressure - 4, F.pressure + 8);
  const view = (
    <g>
      {/* styrofoam cup getting crushed */}
      <g transform={`translate(540 640) scale(${1 - 0.45 * squish} ${1 - 0.3 * squish})`}>
        <path d="M-70 -110 H70 L50 110 H-50 Z" fill="#fbfbf8" stroke={INKC} strokeWidth={6} />
        <ellipse cx={0} cy={-110} rx={70} ry={14} fill="#e8e8e2" stroke={INKC} strokeWidth={5} />
      </g>
      {arrowsIn > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = i * Math.PI / 4, r = lerp(250, 175, 0.5 + 0.5 * Math.sin(f * 0.25 + i));
        return <g key={i} opacity={arrowsIn} transform={`translate(${540 + Math.cos(a) * r} ${620 + Math.sin(a) * r}) rotate(${a * 180 / Math.PI + 180})`}><path d="M-30 -10 H10 V-22 L34 0 L10 22 V10 H-30 Z" fill={CYAN} stroke={INKC} strokeWidth={3} /></g>;
      })}
    </g>
  );
  return (
    <SubInside f={f} askMood={f < F.pressure ? "surprised" : "neutral"} view={view}>
      <Bubble f={f} a={F.whoa} b={F.whoaEnd + 6} x={300} y={1020} text={"WHOA."} dx={60} fs={100} />
      {f >= F.pressure - 4 && f < F.thousand - 4 && <Chip x={540} y={950} w={420} label="WATER PRESSURE" hue={CYAN} p={pop(f, F.pressure - 4, 10)} fs={38} textColor={INKC} />}
      {f >= F.thousand - 4 && <BigNum f={f} at={F.thousand - 4} text="1,000×" x={540} y={1010} hue={YEL} fs={130} />}
      {f >= F.surface - 4 && <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.surface - 4, 10)}>VS. THE SURFACE</text>}
    </SubInside>
  );
};
const S6_Tons: React.FC<{ f: number }> = ({ f }) => {
  const drops = [F.tons, F.tons + 6, F.tons + 12, F.every - 8, F.every - 2, F.every + 4, F.inch - 4, F.inch + 2];
  return (
    <g>
      <rect width={VW} height={VH} fill="#0a1e3e" />
      {[...Array(25)].map((_, i) => <circle key={i} cx={rnd("tb" + i) * VW} cy={((rnd("tc" + i) * VH - f * 1.2) % VH + VH) % VH} r={2 + rnd("td" + i) * 4} fill="#cfe8ff" opacity={0.35} />)}
      {/* square inch tile */}
      <rect x={470} y={1300} width={140} height={140} fill={YEL} stroke={INKC} strokeWidth={8} />
      <text x={540} y={1386} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>1 IN²</text>
      <rect x={300} y={1440} width={480} height={30} fill="#2b2a3a" />
      {drops.map((at, i) => {
        const t = eout(ramp(f, at - 6, at));
        if (f < at - 6) return null;
        const y = lerp(-200, 1300 - i * 92, t);
        const land = f >= at && f < at + 6 ? Math.sin((f - at) * 1.2) * 4 : 0;
        return (
          <g key={i} transform={`translate(540 ${y + land})`}>
            <path d="M-110 0 L-80 -100 H80 L110 0 Z" fill="#3a3e4e" stroke={INKC} strokeWidth={6} />
            <rect x={-30} y={-122} width={60} height={26} rx={10} fill="none" stroke={INKC} strokeWidth={8} />
            <text y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff">1 TON</text>
          </g>
        );
      })}
      {f >= F.eight - 2 && <BigNum f={f} at={F.eight - 2} text={`${Math.min(8, drops.filter((d) => f >= d).length)} TONS`} x={540} y={300} hue={ORANGE} fs={130} />}
      {f >= F.every - 2 && <Chip x={540} y={420} w={560} label="ON EVERY SQUARE INCH" hue={YEL} p={pop(f, F.every - 2, 10)} fs={36} textColor={INKC} />}
    </g>
  );
};
const S7_Anyone: React.FC<{ f: number }> = ({ f }) => (
  <SubInside f={f} view={<g><path d="M260 860 Q400 800 540 840 T820 830 V880 H260 Z" fill={ROCK} /></g>}>
    <Bubble f={f} a={F.anyone} b={F.anyEnd} x={300} y={1020} text={"ANYONE BEEN\nDOWN THERE?"} dx={130} fs={74} />
  </SubInside>
);
const Portrait: React.FC<{ f: number; x: number; y: number; d: PersonDef; seed: number; name: string; p: number }> = ({ f, x, y, d, seed, name, p }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${1.15 * clamp01(p)})`}>
    <defs><clipPath id={`oc${seed}`}><circle cx={0} cy={0} r={120} /></clipPath></defs>
    <circle r={126} fill="#f4f1ea" stroke={INKC} strokeWidth={8} />
    <g clipPath={`url(#oc${seed})`}><g transform="translate(0 340) scale(0.95)"><Person d={d} f={f} seed={seed} talk={0} mood="happy" /></g></g>
    <rect x={-200} y={130} width={400} height={64} rx={32} fill={YEL} stroke={INKC} strokeWidth={5} />
    <text y={174} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INKC}>{name}</text>
  </g>
);
const S8_Trieste: React.FC<{ f: number }> = ({ f }) => {
  const sink = eio(ramp(f, F.sank - 10, F.way + 20));
  return (
    <g>
      <defs><linearGradient id="ocT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f4a86" /><stop offset="1" stopColor="#031024" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#ocT)" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("tq" + i) * VW} cy={((rnd("tr" + i) * VH - f * (2 + sink * 6)) % VH + VH) % VH} r={2 + rnd("ts" + i) * 5} fill="#cfe8ff" opacity={0.35} />)}
      {f < F.sank && <BigNum f={f} at={F.y1960 - 2} text="1960" x={540} y={300} hue={YEL} fs={170} />}
      <Portrait f={f} x={290} y={620} d={PICCARD} seed={1} name="JACQUES PICCARD" p={pop(f, F.piccard - 2, 12) * (1 - ramp(f, F.sank - 6, F.sank + 6))} />
      <Portrait f={f} x={790} y={620} d={WALSH} seed={13} name="DON WALSH" p={pop(f, F.walsh - 2, 12) * (1 - ramp(f, F.sank - 6, F.sank + 6))} />
      {f >= F.twoMen - 2 && f < F.piccard && <Chip x={540} y={480} w={300} label="2 MEN" hue={YEL} p={pop(f, F.twoMen - 2, 10)} fs={44} textColor={INKC} />}
      <Trieste x={540} y={lerp(1140, 1260, sink)} s={1.2} f={f} />
      {sink > 0 && [...Array(8)].map((_, i) => <circle key={i} cx={260 + i * 80} cy={lerp(1140, 1260, sink) - 160 - ((f * 4 + i * 30) % 260)} r={6 + (i % 3) * 3} fill="none" stroke="#cfe8ff" strokeWidth={3} opacity={0.6} />)}
      {f >= F.trieste - 2 && <Stamp f={f} at={F.trieste - 2} x={540} y={880} text="THE TRIESTE" hue={YEL} fs={76} rot={-6} />}
    </g>
  );
};
const S9_Crack: React.FC<{ f: number }> = ({ f }) => {
  const crack = eout(ramp(f, F.cracked - 2, F.cracked + 6));
  const descend = eio(ramp(f, F.took - 10, F.bottom + 4));
  const secs = Math.round(eio(ramp(f, F.took - 6, F.hours + 20)) * (4 * 3600 + 47 * 60));
  const tY = lerp(700, 1230, descend);
  return (
    <g>
      <defs><linearGradient id="ocC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06244a" /><stop offset="1" stopColor={ABYSS} /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#ocC)" />
      {[...Array(24)].map((_, i) => <circle key={i} cx={rnd("cq" + i) * VW} cy={((rnd("cr" + i) * VH - f * 3) % VH + VH) % VH} r={2 + rnd("cs" + i) * 4} fill="#cfe8ff" opacity={0.3} />)}
      <path d="M0 1560 Q260 1520 540 1550 T1080 1540 V1920 H0 Z" fill={ROCK} />
      <Trieste x={540} y={tY} s={1.5} f={f} crack={crack} />
      {f >= F.bottom - 2 && [...Array(12)].map((_, i) => { const q = clamp01((f - F.bottom + 2) / 40); return <circle key={i} cx={540 + (i - 5.5) * 50 * (0.5 + q * 1.5)} cy={1540 - q * 80 * rnd("ds" + i)} r={20 * (1 - q) + 6} fill="#6a6a80" opacity={(1 - q) * 0.6} />; })}
      {f >= F.cracked - 2 && f < F.took && <Stamp f={f} at={F.cracked - 2} x={560} y={1130} text="CRACK!" hue={RED} fs={80} rot={-8} />}
      {f >= F.kept - 2 && f < F.took && <Chip x={540} y={600} w={420} label="THEY KEPT GOING" hue={GREEN} p={pop(f, F.kept - 2, 10)} fs={40} textColor={INKC} />}
      {f >= F.took - 6 && (
        <g opacity={clamp01(pop(f, F.took - 6, 10))} transform="translate(540 420)">
          <rect x={-240} y={-80} width={480} height={160} rx={30} fill="rgba(4,10,28,0.88)" stroke={YEL} strokeWidth={6} />
          <circle cx={-160} cy={0} r={44} fill="none" stroke={YEL} strokeWidth={6} />
          <line x1={-160} y1={0} x2={-160 + Math.sin(secs / 600) * 32} y2={-Math.cos(secs / 600) * 32} stroke={YEL} strokeWidth={6} strokeLinecap="round" />
          <text x={50} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill="#fff">{Math.floor(secs / 3600)}:{String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}</text>
        </g>
      )}
      {f >= F.five - 2 && <Chip x={540} y={580} w={440} label="ALMOST 5 HOURS" hue={YEL} p={pop(f, F.five - 2, 10)} fs={40} textColor={INKC} />}
      {f >= F.bottom && <Stamp f={f} at={F.bottom} x={540} y={760} text="BOTTOM!" hue={GREEN} fs={86} rot={-6} />}
    </g>
  );
};
const S10_Life: React.FC<{ f: number }> = ({ f }) => {
  const view = (
    <g>
      <path d="M260 800 Q400 760 540 790 T820 780 V880 H260 Z" fill={ROCK} />
      {[0, 1, 2, 3].map((i) => {
        const p = clamp01(pop(f, F.tiny - 6 + i * 6, 10));
        const x = 330 + ((i * 140 + (f - F.tiny) * (1.2 + i * 0.3)) % 460), y = 780 - (i % 2) * 120 - (i === 3 ? 230 : 0);
        return <g key={i} opacity={p}><Amphipod x={x} y={y} s={0.9 - (i % 2) * 0.2} f={f} seed={i} /></g>;
      })}
    </g>
  );
  return (
    <SubInside f={f} view={view}>
      <Bubble f={f} a={F.what} b={F.whatEnd} x={300} y={1020} text={"WHAT'S DOWN\nTHERE?"} dx={130} fs={74} />
      {f >= F.life - 2 && <BigNum f={f} at={F.life - 2} text="LIFE." x={540} y={260} hue={GREEN} fs={140} />}
      {f >= F.shrimp - 2 && <Chip x={540} y={800} w={360} label="AMPHIPODS" hue="#f2e6d8" p={pop(f, F.shrimp - 2, 10)} fs={42} textColor={INKC} />}
    </SubInside>
  );
};
const S11_Bag: React.FC<{ f: number }> = ({ f }) => {
  const beam = ramp(f, F.explorer - 6, F.explorer + 10);
  const reveal = eio(ramp(f, F.plastic - 8, F.plastic + 6));
  const subX = lerp(-200, 300, eio(ramp(f, F.y2019 - 20, F.found)));
  return (
    <g>
      <rect width={VW} height={VH} fill={ABYSS} />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("bq" + i) * VW} cy={((rnd("br" + i) * VH - f * 0.8) % VH + VH) % VH} r={1.5 + rnd("bs" + i) * 3} fill="#cfe8ff" opacity={0.25} />)}
      <path d="M0 1400 Q300 1360 540 1390 T1080 1380 V1920 H0 Z" fill={ROCK} />
      {/* headlight beam */}
      <path d={`M${subX + 120} 1030 L1100 ${880} L1100 ${1420} Z`} fill="#fff6c0" opacity={0.18 * beam} />
      <Bag x={790} y={1300} s={1.3} f={f} o={reveal} />
      {/* modern sub */}
      <g transform={`translate(${subX} 1060)`}>
        <rect x={-160} y={-90} width={290} height={180} rx={70} fill="#f4f1ea" stroke={INKC} strokeWidth={8} />
        <rect x={-140} y={-90} width={60} height={180} fill={ORANGE} />
        <circle cx={70} cy={-10} r={36} fill="#bfe6ff" stroke={INKC} strokeWidth={6} />
        <rect x={-200} y={-30} width={44} height={60} rx={10} fill="#9aa4b2" stroke={INKC} strokeWidth={5} />
        <circle cx={128} cy={50} r={14} fill="#fff6c0" stroke={INKC} strokeWidth={4} />
      </g>
      {f < F.veryBottom && <g opacity={1 - ramp(f, F.veryBottom - 8, F.veryBottom)}><BigNum f={f} at={F.y2019 - 2} text="2019" x={540} y={420} hue={YEL} fs={170} /></g>}
      {f >= F.veryBottom - 2 && f < F.plastic - 4 && <Chip x={560} y={700} w={420} label="THE VERY BOTTOM" hue={CYAN} p={pop(f, F.veryBottom - 2, 10)} fs={40} textColor={INKC} />}
      {f >= F.found && f < F.plastic - 4 && <text x={790} y={1200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.found, 10)}>?</text>}
      {f >= F.bag - 4 && <Stamp f={f} at={F.bag - 4} x={540} y={600} text="PLASTIC BAG" hue={RED} fs={86} rot={-6} />}
    </g>
  );
};
const S12_Reach: React.FC<{ f: number }> = ({ f }) => (
  <Deck f={f} askMood={speaking(f, "asker", SPK) ? "surprised" : "neutral"} trash={ramp(f, F.reach - 30, F.reach)}>
    <Bubble f={f} a={F.seriously} b={F.serEnd} x={300} y={1020} text={"SERIOUSLY?!"} dx={110} fs={88} />
    {f >= F.deepestP - 2 && <Chip x={540} y={760} w={560} label="EVEN THE DEEPEST PLACE" hue={CYAN} p={pop(f, F.deepestP - 2, 10)} fs={36} textColor={INKC} />}
    {f >= F.reach - 10 && <Stamp f={f} at={F.reach - 10} x={540} y={600} text="WITHIN OUR REACH" hue={RED} fs={66} rot={-6} />}
  </Deck>
);
const S13_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="ocO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SEA0} /><stop offset="1" stopColor={SEA1} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#ocO)" />
    {[...Array(20)].map((_, i) => <circle key={i} cx={rnd("oq" + i) * VW} cy={((rnd("or" + i) * VH - f * 2) % VH + VH) % VH} r={4 + rnd("os" + i) * 8} fill="none" stroke="#cfe8ff" strokeWidth={3} opacity={0.4} />)}
    <rect y={1460} width={VW} height={VH - 1460} fill="#8a5f36" />
    <Outro f={f} at={F.subscribe} />
    <P d={DIVER} f={f} x={180} y={1500} s={0.8} seed={46} talk={hostTalk(f)} wave={1} mood="happy" />
    <P d={YT} f={f} x={900} y={1500} s={0.84} seed={42} wave={1} mood="happy" />
  </g>
);

export const OceanFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.deepest - 6, render: () => <S1_Ask f={f} />, cam: [[0, { x: 540, y: 900, z: 1.0 }], [F.ask + 30, { x: 420, y: 1060, z: 1.12 }], [F.deepest, { x: 600, y: 1040, z: 1.14 }]] },
    { from: F.deepest - 6, to: F.okay - 4, tr: "whipUp", render: () => <S2_Dive f={f} />, cam: [[F.deepest - 6, { x: 540, y: 400, z: 1.5 }], [F.almost - 10, { x: 560, y: 420, z: 1.4 }], [F.down + 16, { x: 560, y: 1300, z: 1.35 }], [F.seven, { x: 540, y: 1100, z: 1.12 }], [F.okay, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.okay - 4, to: F.drop - 6, tr: "wipe", render: () => <S3_Really f={f} />, cam: [[F.okay - 4, { x: 400, y: 1080, z: 1.18 }], [F.okayEnd, { x: 460, y: 1060, z: 1.1 }], [F.drop, { x: 600, y: 1040, z: 1.12 }]] },
    { from: F.drop - 6, to: F.whoa - 4, tr: "zoom", render: () => <S4_Everest f={f} />, cam: [[F.drop - 6, { x: 540, y: 300, z: 1.25 }], [F.drop + 14, { x: 540, y: 600, z: 1.2 }], [F.in + 4, { x: 540, y: 1300, z: 1.2 }], [F.tallest + 10, { x: 600, y: 960, z: 1.0 }], [F.peak, { x: 540, y: 960, z: 1.0 }], [F.two + 6, { x: 560, y: 520, z: 1.3 }], [F.whoa, { x: 560, y: 560, z: 1.25 }]] },
    { from: F.whoa - 4, to: F.like - 4, tr: "iris", render: () => <S5_Pressure f={f} />, cam: [[F.whoa - 4, { x: 380, y: 1080, z: 1.18 }], [F.pressure - 6, { x: 460, y: 1000, z: 1.08 }], [F.thousand, { x: 540, y: 780, z: 1.22 }], [F.like, { x: 540, y: 720, z: 1.3 }]] },
    { from: F.like - 4, to: F.anyone - 4, tr: "spin", render: () => <S6_Tons f={f} />, cam: [[F.like - 4, { x: 540, y: 700, z: 1.15 }], [F.every, { x: 540, y: 900, z: 1.05 }], [F.anyone, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.anyone - 4, to: F.y1960 - 6, tr: "push", render: () => <S7_Anyone f={f} />, cam: [[F.anyone - 4, { x: 400, y: 1080, z: 1.18 }], [F.y1960, { x: 480, y: 1040, z: 1.1 }]] },
    { from: F.y1960 - 6, to: F.way - 6, tr: "whipUp", render: () => <S8_Trieste f={f} />, cam: [[F.y1960 - 6, { x: 540, y: 380, z: 1.3 }], [F.piccard, { x: 540, y: 600, z: 1.08 }], [F.sank, { x: 540, y: 900, z: 1.05 }], [F.trieste, { x: 540, y: 1060, z: 1.15 }], [F.way, { x: 540, y: 1150, z: 1.2 }]] },
    { from: F.way - 6, to: F.what - 4, tr: "zoom", render: () => <S9_Crack f={f} />, cam: [[F.way - 6, { x: 570, y: 960, z: 1.8 }], [F.cracked + 4, { x: 570, y: 1000, z: 1.95, r: -3 }], [F.kept + 10, { x: 540, y: 800, z: 1.2 }], [F.took, { x: 540, y: 760, z: 1.05 }], [F.bottom + 10, { x: 540, y: 1100, z: 1.1 }], [F.what, { x: 540, y: 1100, z: 1.15 }]] },
    { from: F.what - 4, to: F.y2019 - 12, tr: "iris", render: () => <S10_Life f={f} />, cam: [[F.what - 4, { x: 400, y: 1080, z: 1.18 }], [F.life - 6, { x: 480, y: 900, z: 1.08 }], [F.tiny + 6, { x: 540, y: 600, z: 1.95 }], [F.y2019 - 12, { x: 540, y: 600, z: 2.0 }]] },
    { from: F.y2019 - 12, to: F.seriously - 4, tr: "wipe", render: () => <S11_Bag f={f} />, cam: [[F.y2019 - 12, { x: 540, y: 700, z: 1.15 }], [F.explorer, { x: 520, y: 900, z: 1.08 }], [F.found, { x: 600, y: 1000, z: 1.12 }], [F.bag + 6, { x: 620, y: 980, z: 1.12 }], [F.seriously, { x: 600, y: 960, z: 1.08 }]] },
    { from: F.seriously - 4, to: F.subscribe, tr: "flash", render: () => <S12_Reach f={f} />, cam: [[F.seriously - 4, { x: 400, y: 1080, z: 1.18 }], [F.even, { x: 480, y: 1040, z: 1.1 }], [F.reach, { x: 560, y: 960, z: 1.04 }], [F.subscribe, { x: 600, y: 960, z: 1.08 }]] },
    { from: F.subscribe, to: TOTAL + 1, tr: "push", render: () => <S13_Outro f={f} />, cam: [[F.subscribe, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.eleven, 0.12], [F.seven, 0.08], [F.in + 4, 0.14], [F.two, 0.1], [F.thousand, 0.14], [F.eight, 0.1], [F.y1960, 0.1], [F.trieste, 0.08], [F.cracked, 0.16], [F.five, 0.08], [F.bottom, 0.1], [F.life, 0.12], [F.y2019, 0.1], [F.bag, 0.14], [F.reach, 0.08]];
  const SHAKE: [number, number][] = [[F.in + 4, 16], [F.cracked, 14], [F.bottom, 10], [F.bag - 4, 8]];
  const SFX: Cue[] = [
    [34, "pop", 0.45], [F.deepest, "pop", 0.3], [F.almost - 10, "riser_dark", 0.3], [F.challenger - 2, "pop", 0.35], [F.mariana - 2, "pop", 0.35], [F.eleven - 2, "impact", 0.45], [F.seven - 2, "pop", 0.35],
    [F.okay - 2, "pop", 0.45], [F.drop, "whoosh", 0.45], [F.in + 4, "boom", 0.55], [F.tallest - 2, "pop", 0.35], [F.peak - 4, "tick", 0.3], [F.two - 4, "impact", 0.4], [F.underwater - 2, "pop", 0.35],
    [F.whoa - 2, "pop", 0.45], [F.pressure - 4, "pop", 0.3], [F.thousand - 4, "boom", 0.45], [F.surface - 4, "tick", 0.3],
    [F.tons, "impact", 0.35], [F.tons + 6, "impact", 0.3], [F.tons + 12, "impact", 0.3], [F.every - 8, "impact", 0.3], [F.every - 2, "impact", 0.3], [F.every + 4, "impact", 0.3], [F.inch - 4, "impact", 0.3], [F.inch + 2, "impact", 0.35],
    [F.anyone - 2, "pop", 0.45], [F.y1960 - 2, "impact", 0.4], [F.piccard - 2, "pop", 0.35], [F.walsh - 2, "pop", 0.35], [F.sank - 6, "whoosh", 0.3], [F.trieste - 2, "impact", 0.4],
    [F.window - 10, "riser_dark", 0.3], [F.cracked - 2, "impact", 0.55], [F.kept - 2, "pop", 0.35], [F.took - 6, "tick", 0.3], [F.five - 2, "pop", 0.35], [F.bottom, "boom", 0.45],
    [F.what - 2, "pop", 0.45], [F.life - 2, "impact", 0.4], [F.shrimp - 2, "pop", 0.35],
    [F.y2019 - 2, "pop", 0.4], [F.explorer - 6, "whoosh", 0.3], [F.found - 30, "riser", 0.3], [F.bag - 4, "impact", 0.5],
    [F.seriously - 2, "pop", 0.45], [F.deepestP - 2, "pop", 0.35], [F.reach - 10, "boom", 0.4],
    [F.subscribe + 4, "pop", 0.4], [F.subscribe + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < F.okay ? YEL : f < F.anyone ? CYAN : f < F.seriously ? YEL : CYAN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="11 KM" sub="HOW DEEP IS THE OCEAN?" until={34} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="ocean" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
