import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// ---------- cue table (start frame of each word, looked up from words.ts) ----------
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const W = (word: string, n = 1): number => {
  let k = 0;
  for (const w of WORDS) if (norm(w[2]) === word && ++k === n) return w[0];
  throw new Error(`cue word not found: ${word} #${n}`);
};
// asker lines (consecutive asker phrases) -> bubble text
const ASKS: [number, number][] = (() => {
  const g: [number, number][] = []; let last = "";
  for (const [a, b, s] of SPK) { if (s === "asker") { if (last === "asker") g[g.length - 1][1] = b; else g.push([a, b]); } last = s; }
  return g;
})();
const F = {
  ask: ASKS[0][0], dropped: W("dropped"),
  strasbourg: W("strasbourg"), july: W("july"), y1518: W("1518"), woman: W("woman"), frau: W("frau"), stepped: W("stepped"), street: W("street"),
  started: W("started"), dancing: W("dancing"), couldnt: W("couldnt"),
  funQ: ASKS[1][0], notfun: W("not"), days: W("days"), within: W("within"), week: W("week"), dozens: W("dozens"), joined: W("joined"),
  by: W("by"), august: W("august"), hundreds: W("hundreds"),
  whyQ: ASKS[2][0], heres: W("heres"), crazy: W("crazy"), doctors: W("doctors"), cure: W("cure"), more: W("more"), so: W("so"),
  city: W("city"), stage: W("stage"), musicians: W("musicians"),
  worseQ: ASKS[3][0], much: W("much"), records: W("records", 2), collapsed: W("collapsed"), exhaustion: W("exhaustion"), some: W("some", 2), died: W("died"),
  reallyQ: ASKS[4][0], historians: W("historians"), mass: W("mass"), panic: W("panic"), starving: W("starving"), sick: W("sick"), feared: W("feared"),
  saints: W("saints"), curse: W("curse"), made: W("made", 2), fear: W("fear"), spread: W("spread"), mind: W("mind"), virus: W("virus"),
  september: W("september"), taken: W("taken"), shrine: W("shrine"), pray: W("pray"), plague: W("plague"), stopped: W("stopped"),
  sub: W("subscribe"),
};
const BUB: { t: string; hot?: boolean }[] = [
  { t: "DANCED TO DEATH?!", hot: true }, { t: "FOR FUN?" }, { t: "WHY NOT STOP THEM?" }, { t: "WORSE?!", hot: true }, { t: "WHAT WAS IT?!", hot: true },
];

// ---------- palette ----------
const SKY0 = "#8cc8ee", SKY1 = "#dcefff", BEAM = "#5a3a24", ROOF = "#b5452f", ROOF2 = "#8e3424", COB = "#9a9186", COB2 = "#867d72";
const SAND = "#c98a7a", SAND2 = "#a86a5c", WOOD = "#a4723f", WOOD2 = "#7d5329", PARCH = "#f3e2b8", RED = "#e4473b", GREEN = "#3ddc97", CYAN = "#58c8ff", PURP = "#7b5cff";
const WALLS = ["#f3e3c3", "#e9c99a", "#f0d6d0", "#d6e4c8", "#f6eedc"];
const DRESS = ["#3f7a5a", "#b5452f", "#3d6ccf", "#c8893a", "#7a4a8a", "#5a6a3a", "#a83f5a", "#2f6d8a"];
const SKINS = ["#f2c7a5", "#e0a87e", "#c68a5e"];

const ASKER = CAST[30], HOST = CAST[35];
const TROFFEA: PersonDef = { name: "Frau Troffea", skin: "#f2c7a5", hair: "bun", hairC: "#7a4a26", top: "dress", topC: "#3f7a5a", pants: "#5a3a2a", shoes: "#3a2a20", hat: "none", blush: true };
const PHYSICIAN: PersonDef = { ...CAST[7], top: "kurta", topC: "#6b2a3a", hat: "beret", hatC: "#222222", prop: "book", face: "beard" };
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const askMood = (f: number): "happy" | "neutral" | "surprised" => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
  if (i >= 0) return BUB[i]?.hot ? "surprised" : "neutral";
  if ((f > F.notfun && f < F.notfun + 40) || (f > F.much && f < F.much + 40) || (f > F.crazy && f < F.crazy + 30)) return "surprised";
  return "neutral";
};
const hostMood = (f: number): "happy" | "neutral" | "surprised" => (speaking(f, "asker", SPK) ? "neutral" : "happy");

// ---------- shared pieces ----------
const AskBubble: React.FC<{ f: number; x: number; y: number; tx: number; ty: number; fs?: number }> = ({ f, x, y, tx, ty, fs = 80 }) => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 3 && f < b + 16);
  if (i < 0 || !BUB[i]) return null;
  const [a, b] = ASKS[i]; const { t, hot } = BUB[i];
  const fz = t.length > 14 ? fs * 0.8 : fs;
  const p = pop(f, a - 3, 10), out = 1 - ramp(f, b + 6, b + 16);
  const w = Math.min(940, t.length * fz * 0.66 + 100), h = fz * 1.65;
  const bx = Math.max(w / 2 + 60, Math.min(VW - w / 2 - 60, x));
  const wob = hot ? Math.sin(f * 0.9) * 1.6 : 0;
  const tail = `M${-34} ${h / 2 - 10} L${tx - bx} ${ty - y} L${34} ${h / 2 - 10} Z`;
  const fill = hot ? YEL : "#ffffff";
  return (
    <g opacity={clamp01(out)} transform={`translate(${bx} ${y}) rotate(${-2 + wob}) scale(${Math.max(0, p)})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={h / 2} fill="#000" opacity={0.3} />
      <path d={tail} fill={fill} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={INKC} strokeWidth={9} />
      <path d={`M${-26} ${h / 2 - 14} L${(tx - bx) * 0.25} ${(ty - y) * 0.25} L${26} ${h / 2 - 14} Z`} fill={fill} />
      <text y={fz * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fz} fill={INKC} letterSpacing={1}>{t}</text>
    </g>
  );
};

/** Half-timbered Alsace house; y = ground line. */
const House: React.FC<{ x: number; y: number; w: number; h: number; c: string; door?: boolean; doorOpen?: number }> = ({ x, y, w, h, c, door, doorOpen = 0 }) => {
  const rh = w * 0.72;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={c} stroke={INKC} strokeWidth={6} />
      {/* timber frame */}
      <line x1={-w / 2} y1={-h * 0.5} x2={w / 2} y2={-h * 0.5} stroke={BEAM} strokeWidth={12} />
      {[-1, 1].map((k) => <line key={k} x1={(k * w) / 6} y1={-h} x2={(k * w) / 6} y2={-h * 0.5} stroke={BEAM} strokeWidth={10} />)}
      <path d={`M${-w / 2} ${-h * 0.5} L${-w / 6} ${-h} M${w / 2} ${-h * 0.5} L${w / 6} ${-h}`} stroke={BEAM} strokeWidth={9} />
      {[-1, 1].map((k) => <rect key={"w" + k} x={k * w * 0.3 - w * 0.08} y={-h * 0.86} width={w * 0.16} height={h * 0.2} fill="#9cc7e0" stroke={BEAM} strokeWidth={6} />)}
      {!door && [-1, 1].map((k) => <rect key={"v" + k} x={k * w * 0.3 - w * 0.08} y={-h * 0.36} width={w * 0.16} height={h * 0.18} fill="#9cc7e0" stroke={BEAM} strokeWidth={6} />)}
      {door && (
        <g>
          <rect x={-w * 0.14} y={-h * 0.42} width={w * 0.28} height={h * 0.42} fill="#2a1a10" stroke={INKC} strokeWidth={5} />
          <rect x={-w * 0.14} y={-h * 0.42} width={w * 0.28 * (1 - doorOpen * 0.85)} height={h * 0.42} fill={WOOD} stroke={INKC} strokeWidth={5} />
        </g>
      )}
      <path d={`M${-w / 2 - 18} ${-h} L0 ${-h - rh} L${w / 2 + 18} ${-h} Z`} fill={ROOF} stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${-w * 0.2} ${-h - rh * 0.25} L${w * 0.2} ${-h - rh * 0.25}`} stroke={ROOF2} strokeWidth={6} />
      <rect x={-w * 0.07} y={-h - rh * 0.62} width={w * 0.14} height={w * 0.12} fill="#9cc7e0" stroke={BEAM} strokeWidth={5} />
    </g>
  );
};
/** Strasbourg cathedral silhouette (single north spire, pink sandstone). y = ground. */
const Cathedral: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-330} width={340} height={330} fill={SAND} stroke={INKC} strokeWidth={7} />
    <circle cx={30} cy={-200} r={56} fill="#e6b9a8" stroke={INKC} strokeWidth={6} />
    {[0, 45, 90, 135].map((a) => <line key={a} x1={30 + Math.cos((a * Math.PI) / 180) * 50} y1={-200 + Math.sin((a * Math.PI) / 180) * 50} x2={30 - Math.cos((a * Math.PI) / 180) * 50} y2={-200 - Math.sin((a * Math.PI) / 180) * 50} stroke={SAND2} strokeWidth={5} />)}
    <path d="M-30 0 V-80 Q30 -150 90 -80 V0 Z" fill={SAND2} stroke={INKC} strokeWidth={6} />
    <rect x={-170} y={-600} width={130} height={270} fill={SAND} stroke={INKC} strokeWidth={7} />
    {[0, 1, 2].map((i) => <rect key={i} x={-148} y={-580 + i * 80} width={20} height={56} rx={10} fill={SAND2} />)}
    {[0, 1, 2].map((i) => <rect key={"b" + i} x={-82} y={-580 + i * 80} width={20} height={56} rx={10} fill={SAND2} />)}
    <path d="M-170 -600 L-105 -900 L-40 -600 Z" fill={SAND} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
    <line x1={-105} y1={-900} x2={-105} y2={-940} stroke={INKC} strokeWidth={6} />
    <path d="M40 -330 L140 -420 L170 -330 Z" fill={SAND2} stroke={INKC} strokeWidth={6} />
  </g>
);
/** Street of Strasbourg, 1518. ground = 1150. */
const Street: React.FC<{ f: number; dusk?: number; door?: number; noCath?: boolean }> = ({ f, dusk = 0, door, noCath }) => (
  <g>
    <defs><linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix(SKY0, "#3b2a5a", dusk)} /><stop offset="1" stopColor={mix(SKY1, "#f08a5a", dusk)} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#skyS)" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 420 + f * 0.6) % 1400) - 160} cy={240 + i * 90} rx={120} ry={34} fill="#ffffff" opacity={0.75 * (1 - dusk)} />)}
    {!noCath && <Cathedral x={560} y={1160} s={0.95} />}
    <House x={110} y={1160} w={250} h={420} c={WALLS[0]} />
    <House x={330} y={1160} w={200} h={330} c={WALLS[2]} />
    <House x={790} y={1160} w={210} h={350} c={WALLS[3]} door={door !== undefined} doorOpen={door ?? 0} />
    <House x={990} y={1160} w={240} h={440} c={WALLS[1]} />
    <rect y={1150} width={VW} height={VH - 1150} fill={COB} />
    {[...Array(9)].map((_, r) => [...Array(9)].map((_, c) => <rect key={`${r}-${c}`} x={c * 130 - (r % 2) * 65 + 4} y={1158 + r * 86} width={120} height={76} rx={26} fill={(r + c) % 3 ? COB2 : "#a49b90"} />))}
    {dusk > 0 && <rect width={VW} height={VH} fill="#1a1030" opacity={dusk * 0.25} />}
  </g>
);
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; wave?: number }> = ({ f, ax = 290, hx = 800, y = 1500, s = 1.05, wave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={ASKER} f={f} seed={30} talk={askTalk(f)} wave={wave} mood={askMood(f)} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={HOST} f={f} seed={35} talk={hostTalk(f)} wave={wave} mood={hostMood(f)} /></g>
  </g>
);
/** 1518 townsperson who dances (arms up, legs kicking). fall = collapsed, calm = walking slowly. */
const Dancer: React.FC<{ f: number; x: number; y: number; s: number; seed: number; c?: string; fall?: number; calm?: number; pray?: number; sick?: number; dirOv?: number }> = ({ f, x, y, s, seed, c, fall = 0, calm = 0, pray = 0, sick = 0, dirOv }) => {
  const col = c ?? DRESS[seed % DRESS.length];
  const skin = SKINS[seed % 3];
  const ph = f * 0.33 + seed * 2.1;
  const amp = (1 - fall) * (1 - calm);
  const sw = Math.sin(ph) * amp;
  const bounce = Math.abs(Math.sin(ph)) * 16 * amp;
  const lean = Math.sin(ph * 0.5) * 9 * amp;
  const up = amp;
  const walk = Math.sin(f * 0.22 + seed) * calm * (1 - fall);
  const dir = dirOv ?? (seed % 2 ? 1 : -1);
  const arm = (k: number) => {
    const ex = lerp(k * 34, k * 50, up), ey = lerp(-118, -196 + sw * 14 * k, up);
    const hx = lerp(lerp(k * 36, k * 8, pray), k * (40 + sw * 18), up), hy = lerp(lerp(-82, -150, pray), -248, up);
    return { d: `M${k * 24} -160 L${ex} ${ey} L${hx} ${hy}`, hx, hy };
  };
  const L = arm(-1), R = arm(1);
  const cap = seed % 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-30 * fall}) rotate(${fall * 86 * dir})`}>
      <g transform={`translate(0 ${-bounce}) rotate(${lean})`}>
        <path d={`M-12 -80 L${-14 - sw * 26 - walk * 14} ${-Math.max(0, sw) * 20}`} stroke={INKC} strokeWidth={15} strokeLinecap="round" />
        <path d={`M12 -80 L${14 - sw * 26 + walk * 14} ${-Math.max(0, -sw) * 20}`} stroke={INKC} strokeWidth={15} strokeLinecap="round" />
        {[L, R].map((a, i) => <path key={i} d={a.d} stroke={INKC} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {[L, R].map((a, i) => <path key={"s" + i} d={a.d} stroke={col} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {[L, R].map((a, i) => <circle key={"h" + i} cx={a.hx} cy={a.hy} r={10} fill={skin} stroke={INKC} strokeWidth={4} />)}
        <path d="M-30 -172 L30 -172 L50 -62 L-50 -62 Z" fill={col} stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-22 -120 L22 -120 L30 -64 L-30 -64 Z" fill="#f4ecd8" opacity={cap === 0 ? 0.85 : 0} />
        <circle cy={-204} r={29} fill={mix(skin, "#9ad07a", sick * 0.45)} stroke={INKC} strokeWidth={5} />
        {cap === 0 && <path d="M-31 -206 Q-30 -244 0 -244 Q30 -244 31 -206 L24 -214 Q0 -232 -24 -214 Z" fill="#f6f2e6" stroke={INKC} strokeWidth={4} />}
        {cap === 1 && <g><ellipse cy={-226} rx={38} ry={8} fill="#5a3a24" stroke={INKC} strokeWidth={4} /><path d="M-20 -228 Q0 -258 20 -228 Z" fill="#5a3a24" stroke={INKC} strokeWidth={4} /></g>}
        {cap === 2 && <path d="M-32 -200 Q-34 -242 0 -242 Q34 -242 32 -200 Q20 -222 0 -222 Q-20 -222 -32 -200 Z" fill={RED} stroke={INKC} strokeWidth={4} />}
        {fall < 0.5 ? (
          <g>
            <circle cx={-10} cy={-206} r={4} fill={INKC} /><circle cx={10} cy={-206} r={4} fill={INKC} />
            {amp > 0.3 ? <ellipse cy={-188} rx={6} ry={8} fill="#5a1f1f" /> : <path d="M-7 -190 Q0 -186 7 -190" stroke={INKC} strokeWidth={3} fill="none" />}
          </g>
        ) : (
          <path d="M-15 -207 L-5 -207 M5 -207 L15 -207 M-6 -190 L6 -190" stroke={INKC} strokeWidth={4} strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};
/** A 1518 musician: kind 0 drum, 1 pipe, 2 fiddle. */
const Musician: React.FC<{ f: number; x: number; y: number; s: number; kind: number; p?: number }> = ({ f, x, y, s, kind, p = 1 }) => {
  const col = ["#2f6d8a", "#7a4a8a", "#c8893a"][kind];
  const beat = Math.sin(f * 0.6 + kind * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * clamp01(p)})`} opacity={clamp01(p)}>
      <g transform={`translate(0 ${-Math.abs(beat) * 6})`}>
        <path d="M-12 -80 L-16 0 M12 -80 L16 0" stroke={INKC} strokeWidth={15} strokeLinecap="round" />
        <path d="M-30 -172 L30 -172 L48 -62 L-48 -62 Z" fill={col} stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
        <circle cy={-204} r={29} fill={SKINS[kind]} stroke={INKC} strokeWidth={5} />
        <ellipse cy={-228} rx={34} ry={12} fill="#3a2a20" stroke={INKC} strokeWidth={4} />
        <circle cx={-10} cy={-206} r={4} fill={INKC} /><circle cx={10} cy={-206} r={4} fill={INKC} />
        {kind === 0 && (
          <g>
            <ellipse cx={0} cy={-100} rx={46} ry={14} fill="#f4ecd8" stroke={INKC} strokeWidth={5} />
            <path d="M-46 -100 V-60 Q0 -44 46 -60 V-100" fill={RED} stroke={INKC} strokeWidth={5} />
            <path d="M-30 -96 L-10 -64 L10 -96 L30 -64" stroke="#f4ecd8" strokeWidth={4} fill="none" />
            <line x1={30} y1={-160} x2={10 + beat * 10} y2={-110 - Math.max(0, beat) * 20} stroke={WOOD2} strokeWidth={8} strokeLinecap="round" />
            <circle cx={10 + beat * 10} cy={-110 - Math.max(0, beat) * 20} r={8} fill={WOOD} />
          </g>
        )}
        {kind === 1 && (
          <g>
            <path d="M-6 -192 L50 -120" stroke={WOOD2} strokeWidth={12} strokeLinecap="round" />
            <path d="M50 -120 L66 -100" stroke={WOOD} strokeWidth={20} strokeLinecap="round" />
            <circle cx={30} cy={-145} r={9} fill={SKINS[1]} stroke={INKC} strokeWidth={3} />
          </g>
        )}
        {kind === 2 && (
          <g>
            <g transform="translate(-30 -160) rotate(-30)"><ellipse rx={22} ry={34} fill={WOOD} stroke={INKC} strokeWidth={5} /><line x1={0} y1={-34} x2={0} y2={-70} stroke={WOOD2} strokeWidth={8} /></g>
            <line x1={-70 + beat * 20} y1={-130} x2={20 + beat * 20} y2={-190} stroke="#e8d8b0" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </g>
      {/* music notes */}
      {[0, 1].map((i) => {
        const q = ((f * 1.5 + i * 40 + kind * 25) % 80) / 80;
        return <text key={i} x={30 + i * 20 + q * 40} y={-260 - q * 120} fontFamily={FONT} fontWeight={800} fontSize={48} fill={INKC} opacity={Math.sin(q * Math.PI) * p}>♪</text>;
      })}
    </g>
  );
};
/** Wooden stage built by the city. y = floor top. b = build progress. */
const Stage: React.FC<{ x: number; y: number; w: number; b: number }> = ({ x, y, w, b }) => (
  <g transform={`translate(${x} ${y})`}>
    {[...Array(6)].map((_, i) => {
      const p = clamp01(b * 7 - i);
      const px = -w / 2 + 30 + (i * (w - 60)) / 5;
      return <rect key={i} x={px - 14} y={0} width={28} height={140 * p} fill={WOOD2} stroke={INKC} strokeWidth={5} />;
    })}
    {[...Array(8)].map((_, i) => {
      const p = eout(clamp01(b * 9 - i - 0.5));
      return <rect key={"p" + i} x={-w / 2 + (i * w) / 8} y={-20 - (1 - p) * 120} width={w / 8 + 1} height={34} fill={i % 2 ? WOOD : "#b5824a"} stroke={INKC} strokeWidth={5} opacity={p} />;
    })}
    {b > 0.9 && <g opacity={ramp(b, 0.9, 1)}>{[...Array(7)].map((_, i) => <path key={i} d={`M${-w / 2 + (i * w) / 7} -20 l ${w / 14} 40 l ${w / 14} -40 Z`} fill={i % 2 ? RED : YEL} stroke={INKC} strokeWidth={4} />)}</g>}
  </g>
);
const Calendar: React.FC<{ x: number; y: number; s: number; top: string; big: string; p?: number; hue?: string }> = ({ x, y, s, top, big, p = 1, hue = RED }) => (
  <g transform={`translate(${x} ${y}) scale(${s * clamp01(p)})`} opacity={clamp01(p)}>
    <rect x={-150} y={-150} width={300} height={300} rx={26} fill="#ffffff" stroke={INKC} strokeWidth={8} />
    <path d="M-150 -70 V-124 Q-150 -150 -124 -150 H124 Q150 -150 150 -124 V-70 Z" fill={hue} stroke={INKC} strokeWidth={8} />
    {[-80, 80].map((cx) => <rect key={cx} x={cx - 10} y={-176} width={20} height={50} rx={10} fill={INKC} />)}
    <text y={-92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" letterSpacing={3}>{top}</text>
    <text y={/^\d+$/.test(big) ? 90 : 76} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={/^\d+$/.test(big) ? 170 : 104} fill={INKC}>{big}</text>
  </g>
);
const Candle: React.FC<{ f: number; x: number; y: number; s: number; p: number; seed: number }> = ({ f, x, y, s, p, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(p)}>
    <ellipse cy={-110} rx={46} ry={60} fill="#ffcf6a" opacity={0.18 + 0.05 * Math.sin(f * 0.3 + seed)} />
    <rect x={-16} y={-80} width={32} height={80} rx={6} fill="#f6efe0" stroke={INKC} strokeWidth={4} />
    <path d={`M0 -84 Q${-12 + Math.sin(f * 0.4 + seed) * 3} -104 0 ${-128 - Math.sin(f * 0.5 + seed) * 6} Q12 -104 0 -84 Z`} fill="#ffb02e" stroke="#e8762f" strokeWidth={3} />
  </g>
);
/** Simple head for the "fear spreads" network. */
const Head: React.FC<{ f: number; x: number; y: number; r: number; inf: number; seed: number }> = ({ f, x, y, r, inf, seed }) => {
  const wob = Math.sin(f * 0.5 + seed) * 6 * inf;
  return (
    <g transform={`translate(${x} ${y + wob}) rotate(${wob})`}>
      {inf > 0 && <circle r={r * (1.25 + 0.1 * Math.sin(f * 0.3 + seed))} fill={RED} opacity={0.25 * inf} />}
      <circle r={r} fill={mix(SKINS[seed % 3], "#ff7a6a", inf * 0.55)} stroke={INKC} strokeWidth={6} />
      <circle cx={-r * 0.32} cy={-r * 0.08} r={r * (0.1 + 0.06 * inf)} fill="#fff" stroke={INKC} strokeWidth={3} />
      <circle cx={r * 0.32} cy={-r * 0.08} r={r * (0.1 + 0.06 * inf)} fill="#fff" stroke={INKC} strokeWidth={3} />
      <circle cx={-r * 0.32} cy={-r * 0.08} r={r * 0.06} fill={INKC} /><circle cx={r * 0.32} cy={-r * 0.08} r={r * 0.06} fill={INKC} />
      {inf > 0.5 ? <ellipse cy={r * 0.42} rx={r * 0.14} ry={r * 0.2} fill="#5a1f1f" /> : <path d={`M${-r * 0.25} ${r * 0.4} Q0 ${r * 0.5} ${r * 0.25} ${r * 0.4}`} stroke={INKC} strokeWidth={4} fill="none" />}
    </g>
  );
};
const Virus: React.FC<{ f: number; x: number; y: number; r: number; p: number }> = ({ f, x, y, r, p }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0, p)}) rotate(${f * 1.2})`}>
    {[...Array(12)].map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <g key={i}><line x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * r * 1.4} y2={Math.sin(a) * r * 1.4} stroke={INKC} strokeWidth={10} /><circle cx={Math.cos(a) * r * 1.45} cy={Math.sin(a) * r * 1.45} r={r * 0.14} fill={RED} stroke={INKC} strokeWidth={5} /></g>;
    })}
    <circle r={r} fill={RED} stroke={INKC} strokeWidth={9} />
    {[...Array(5)].map((_, i) => <circle key={"d" + i} cx={Math.cos(i * 1.3) * r * 0.5} cy={Math.sin(i * 1.3) * r * 0.5} r={r * 0.13} fill="#ff9a8a" />)}
  </g>
);
const IconCard: React.FC<{ x: number; y: number; p: number; label: string; hue: string; children: React.ReactNode; w?: number }> = ({ x, y, p, label, hue, children, w = 300 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0, p)})`} opacity={clamp01(p * 2)}>
    <rect x={-w / 2 + 10} y={-150 + 14} width={w} height={300} rx={30} fill="#000" opacity={0.3} />
    <rect x={-w / 2} y={-150} width={w} height={300} rx={30} fill="#fff" stroke={INKC} strokeWidth={8} />
    <g transform="translate(0 -30)">{children}</g>
    <rect x={-w / 2} y={70} width={w} height={80} rx={0} fill={hue} stroke={INKC} strokeWidth={8} />
    <text y={124} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={label.length > 10 ? 36 : 44} fill="#fff" letterSpacing={2}>{label}</text>
  </g>
);

// crowd slots for the square: [x, y, scale], sorted back-to-front
const SLOTS: [number, number, number][] = (() => {
  const a: [number, number, number][] = [[540, 1440, 1.0]];
  for (let i = 1; i < 96; i++) {
    const t = rnd("cy" + i);
    const y = lerp(1180, 1470, t);
    const x = 60 + rnd("cx" + i) * 960;
    if (Math.abs(x - 540) < 90 && y > 1360) continue;
    a.push([x, y, lerp(0.5, 0.95, t)]);
  }
  return a;
})();
const SLOT_ORDER = SLOTS.map((s, i) => i).sort((p, q) => SLOTS[p][1] - SLOTS[q][1]);

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Street f={f} />
    <Duo f={f} />
    <AskBubble f={f} x={420} y={800} tx={290} ty={1000} fs={84} />
  </g>
);
const S2_City: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#skyC)" />
    <circle cx={880} cy={520} r={80} fill="#fff4c6" />
    {/* river + far roofs */}
    <Cathedral x={540} y={1220} s={1.25} />
    {[...Array(9)].map((_, i) => <House key={i} x={i * 135 - 20} y={1300 + (i % 2) * 30} w={150} h={180 + (i % 3) * 40} c={WALLS[i % 5]} />)}
    <rect y={1320} width={VW} height={VH - 1320} fill="#5f9fc4" />
    {[...Array(7)].map((_, i) => <path key={i} d={`M${((i * 170 + f * 2) % 1240) - 120} ${1400 + (i % 3) * 70} q 30 -14 60 0 q 30 14 60 0`} stroke="#bfe3f5" strokeWidth={6} fill="none" />)}
    <rect y={1560} width={VW} height={VH - 1560} fill={COB} />
    <BigNum f={f} at={F.july} text="JULY 1518" x={540} y={420} hue={YEL} fs={170} />
    <Chip x={540} y={240} w={440} label="STRASBOURG" hue={RED} p={pop(f, F.strasbourg, 10)} fs={46} />
  </g>
);
const S3_Troffea: React.FC<{ f: number }> = ({ f }) => {
  const door = eout(ramp(f, F.woman - 6, F.woman + 10));
  const step = eio(ramp(f, F.stepped - 4, F.street + 8));
  const dance = ramp(f, F.dancing - 8, F.dancing + 6);
  const px = lerp(790, 560, step), py = lerp(1170, 1440, step), sc = lerp(0.62, 1.1, step);
  const ph = f * 0.42;
  const bounce = Math.abs(Math.sin(ph)) * 34 * dance, tilt = Math.sin(ph * 0.5) * 12 * dance;
  const flipX = dance > 0 ? (Math.sin(ph * 0.25) > 0 ? 1 : -1) : 1;
  return (
    <g>
      <Street f={f} door={door} />
      {/* motion lines while dancing */}
      {dance > 0 && [...Array(6)].map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + f * 0.05;
        return <path key={i} d={`M${px + Math.cos(a) * 230} ${py - 230 + Math.sin(a) * 200} q ${Math.cos(a + 1) * 30} ${Math.sin(a + 1) * 30} ${Math.cos(a + 1.6) * 60} ${Math.sin(a + 1.6) * 60}`} stroke={INKC} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5 * dance} />;
      })}
      <g opacity={ramp(f, F.woman - 2, F.woman + 6)} transform={`translate(${px} ${py - bounce}) rotate(${tilt}) scale(${sc * flipX} ${sc})`}>
        <Person d={TROFFEA} f={f} seed={7} talk={0} wave={dance > 0.2 ? 1 : 0} mood={f > F.couldnt ? "surprised" : dance > 0 ? "happy" : "neutral"} />
      </g>
      <Chip x={540} y={560} w={420} label="FRAU TROFFEA" hue={DRESS[0]} p={pop(f, F.frau, 10) * (1 - ramp(f, F.couldnt - 6, F.couldnt))} fs={44} />
      <g opacity={0.85 * ramp(f, F.couldnt + 2, F.couldnt + 9)} transform="translate(540 600) rotate(-7)"><rect x={-380} y={-76} width={760} height={146} rx={18} fill="#ffffff" /></g>
      <Stamp f={f} at={F.couldnt} x={540} y={600} text="CAN'T STOP!" hue={RED} fs={92} rot={-7} />
    </g>
  );
};
const S4_Fun: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Street f={f} />
    {/* Troffea still dancing far behind */}
    <g transform={`translate(560 ${1170 - Math.abs(Math.sin(f * 0.42)) * 14}) rotate(${Math.sin(f * 0.21) * 10}) scale(0.5)`}><Person d={TROFFEA} f={f} seed={7} wave={1} mood="surprised" /></g>
    <Duo f={f} />
    <Chip x={790} y={860} w={380} label="NOT FOR FUN" hue={RED} p={pop(f, F.notfun, 10)} fs={42} />
    <AskBubble f={f} x={380} y={800} tx={290} ty={1000} fs={92} />
  </g>
);
const S5_Crowd: React.FC<{ f: number }> = ({ f }) => {
  const n1 = lerp(1, 30, eout(ramp(f, F.dozens - 6, F.joined + 10)));
  const n = Math.round(lerp(n1, SLOTS.length, eout(ramp(f, F.hundreds - 8, F.hundreds + 26))));
  const day = Math.max(1, countUp(f, F.days - 4, F.week, 7));
  const isAug = f >= F.august - 2;
  const roll1 = countUp(f, F.dozens - 4, F.dozens + 18, 36), roll2 = 36 + countUp(f, F.hundreds - 4, F.hundreds + 20, 264);
  const counter = f < F.dozens - 4 ? "1" : f < F.dozens + 18 ? String(Math.max(1, roll1)) : f < F.hundreds - 4 ? "DOZENS" : f < F.hundreds + 20 ? String(roll2) : "HUNDREDS";
  const big = counter.length > 4;
  return (
    <g>
      <Street f={f} noCath />
      <rect y={1150} width={VW} height={VH - 1150} fill={COB} opacity={0.35} />
      {SLOT_ORDER.filter((i) => i < n).map((i) => {
        const [x, y, s] = SLOTS[i];
        const born = i === 0 ? 0 : i < 30 ? F.dozens - 6 + i * 1.3 : F.hundreds - 8 + (i - 30) * 0.5;
        const p = i === 0 ? 1 : clamp01(pop(f, born, 8));
        return <Dancer key={i} f={f} x={x} y={y} s={s * p} seed={i} c={i === 0 ? DRESS[0] : undefined} />;
      })}
      <Calendar x={210} y={360} s={0.8} top={isAug ? "1518" : "DAY"} big={isAug ? "AUG" : String(day)} p={pop(f, F.days - 4, 10)} hue={isAug ? PURP : RED} />
      <g transform="translate(700 360)" opacity={pop(f, F.days, 10)}>
        <rect x={-300} y={-110} width={600} height={220} rx={30} fill="rgba(17,17,24,0.85)" stroke={YEL} strokeWidth={6} />
        <text y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#fff" letterSpacing={4}>DANCERS</text>
        <text y={big ? 64 : 76} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={big ? 92 : 130} fill={YEL}>{counter}</text>
      </g>
    </g>
  );
};
const S6_Why: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Street f={f} />
    {[0, 1, 2, 3, 4].map((i) => <Dancer key={i} f={f} x={180 + i * 180} y={1180} s={0.5} seed={i + 3} />)}
    <Duo f={f} />
    <Chip x={790} y={860} w={420} label="THE CRAZY PART..." hue={PURP} p={pop(f, F.crazy, 10)} fs={38} />
    <AskBubble f={f} x={440} y={800} tx={290} ty={1000} fs={84} />
  </g>
);
const S7_Cure: React.FC<{ f: number }> = ({ f }) => {
  const unroll = eio(ramp(f, F.doctors - 4, F.cure));
  const more = f >= F.more;
  const h = lerp(40, 520, unroll);
  return (
    <g>
      <rect width={VW} height={VH} fill="#5a3a3a" />
      {/* study: shelves + window */}
      <rect x={60} y={200} width={300} height={360} rx={150} fill="#9cc7e0" stroke={INKC} strokeWidth={8} />
      <path d="M210 200 V560 M60 380 H360" stroke={INKC} strokeWidth={8} />
      {[0, 1, 2].map((r) => <g key={r}><rect x={640} y={240 + r * 160} width={400} height={20} fill={WOOD2} />{[...Array(8)].map((_, i) => <rect key={i} x={650 + i * 48} y={150 + r * 160 + (i % 3) * 10} width={36} height={90 - (i % 3) * 10} fill={DRESS[(i + r) % DRESS.length]} stroke={INKC} strokeWidth={3} />)}</g>)}
      <rect y={1300} width={VW} height={VH - 1300} fill="#7a4e36" />
      {[...Array(8)].map((_, i) => <line key={i} x1={0} y1={1340 + i * 70} x2={VW} y2={1340 + i * 70} stroke="#6a4230" strokeWidth={5} />)}
      <g transform="translate(230 1470) scale(1.05)"><Person d={PHYSICIAN} f={f} seed={7} talk={0} mood={more ? "happy" : "neutral"} /></g>
      {/* prescription scroll */}
      <g transform={`translate(680 ${560}) rotate(3)`}>
        <rect x={-240} y={0} width={480} height={h} fill={PARCH} stroke={INKC} strokeWidth={7} />
        <rect x={-265} y={-30} width={530} height={46} rx={23} fill="#d8bf86" stroke={INKC} strokeWidth={7} />
        <rect x={-265} y={h - 16} width={530} height={46} rx={23} fill="#d8bf86" stroke={INKC} strokeWidth={7} />
        {unroll > 0.6 && (
          <g opacity={ramp(unroll, 0.6, 1)}>
            <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#6b4a2b" letterSpacing={4}>DOCTORS' ORDERS</text>
            <text y={210} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={88} fill={INKC}>CURE:</text>
          </g>
        )}
        {more && (
          <g transform={`translate(0 370) rotate(-4) scale(${clamp01(pop(f, F.more, 10))})`}>
            <text y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill={RED} stroke={INKC} strokeWidth={4} paintOrder="stroke">MORE</text>
            <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={RED} stroke={INKC} strokeWidth={4} paintOrder="stroke">DANCING?!</text>
          </g>
        )}
      </g>
    </g>
  );
};
const S8_Stage: React.FC<{ f: number }> = ({ f }) => {
  const b = eout(ramp(f, F.stage - 10, F.stage + 22));
  return (
    <g>
      <Street f={f} noCath />
      <Cathedral x={560} y={1160} s={0.8} />
      <Stage x={540} y={1250} w={860} b={b} />
      {b > 0.95 && [0, 1, 2, 3].map((i) => <Dancer key={i} f={f} x={300 + i * 160} y={1230} s={0.62} seed={i + 11} />)}
      {[...Array(10)].map((_, i) => <Dancer key={"c" + i} f={f} x={40 + i * 110} y={1370 + (i % 2) * 26} s={0.5} seed={i + 20} />)}
      {[0, 1, 2].map((k) => <Musician key={k} f={f} x={[190, 540, 890][k]} y={1575} s={1.0} kind={k} p={pop(f, F.musicians - 4 + k * 4, 10)} />)}
      <Chip x={540} y={420} w={480} label="CITY BUILT A STAGE" hue={WOOD2} p={pop(f, F.stage, 10)} fs={38} />
      <Chip x={540} y={520} w={470} label="+ HIRED MUSICIANS" hue={PURP} p={pop(f, F.musicians, 10)} fs={38} />
    </g>
  );
};
const S9_Worse: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Street f={f} dusk={0.2} noCath />
    <Stage x={540} y={1110} w={820} b={1} />
    {[0, 1, 2, 3, 4].map((i) => <Dancer key={i} f={f} x={250 + i * 145} y={1090} s={0.55} seed={i + 30} />)}
    <Duo f={f} />
    <Stamp f={f} at={F.much} x={790} y={840} text="MUCH WORSE" hue={RED} fs={66} rot={-7} />
    <AskBubble f={f} x={330} y={800} tx={290} ty={1000} fs={100} />
  </g>
);
const S10_Collapse: React.FC<{ f: number }> = ({ f }) => {
  const dim = eio(ramp(f, F.some - 10, F.died + 10));
  return (
    <g>
      <Street f={f} dusk={0.15 + dim * 0.85} noCath />
      <rect width={VW} height={VH} fill="#ff9a2e" opacity={0.28 * (1 - dim)} />
      <circle cx={820} cy={330} r={110 + Math.sin(f * 0.2) * 6} fill={mix("#fff1a8", "#c8c0d8", dim)} opacity={1 - dim * 0.6} />
      {[...Array(10)].map((_, i) => <line key={i} x1={820 + Math.cos(i * 0.63 + f * 0.01) * 140} y1={330 + Math.sin(i * 0.63 + f * 0.01) * 140} x2={820 + Math.cos(i * 0.63 + f * 0.01) * 200} y2={330 + Math.sin(i * 0.63 + f * 0.01) * 200} stroke="#ffb02e" strokeWidth={10} strokeLinecap="round" opacity={1 - dim} />)}
      <Stage x={540} y={1180} w={980} b={1} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const fall = eio(ramp(f, F.collapsed - 6 + ((i * 3) % 6) * 6, F.collapsed + 6 + i * 7));
        return <Dancer key={i} f={f} x={60 + i * 158} y={1162} s={0.72} seed={i + 40} fall={fall} sick={0.6} dirOv={1} />;
      })}
      {/* sweat drops before collapse */}
      {f < F.collapsed + 10 && [...Array(8)].map((_, i) => { const q = ((f * 2 + i * 13) % 30) / 30; return <ellipse key={i} cx={160 + i * 120 + q * 10} cy={820 + q * 90} rx={7} ry={11} fill={CYAN} opacity={1 - q} />; })}
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.exhaustion, 10) * (1 - ramp(f, F.some - 8, F.some))}>EXHAUSTION</text>
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#ffffff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={ramp(f, F.some, F.some + 10)}>SOME MAY HAVE DIED</text>
      {[0, 1, 2, 3, 4].map((i) => <Candle key={i} f={f} x={180 + i * 180} y={1480} s={1} seed={i} p={ramp(f, F.died - 10 + i * 4, F.died + i * 4)} />)}
      <Chip x={540} y={420} w={500} label="RECORDS OF THE TIME" hue="#5a3a24" p={pop(f, F.records, 10) * (1 - ramp(f, F.exhaustion - 6, F.exhaustion))} fs={36} />
    </g>
  );
};
const S11_Really: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Street f={f} dusk={0.55} />
    <Duo f={f} />
    <Chip x={790} y={860} w={440} label="HISTORIANS THINK..." hue={PURP} p={pop(f, F.historians, 10)} fs={36} />
    <AskBubble f={f} x={400} y={800} tx={290} ty={1000} fs={90} />
  </g>
);
const S12_Panic: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#3a2430" />
    <g opacity={0.35}><Street f={f} dusk={1} noCath /></g>
    <rect width={VW} height={VH} fill="#2a1420" opacity={0.45} />
    <Stamp f={f} at={F.mass} x={540} y={430} text="MASS PANIC" hue={RED} fs={104} rot={-5} />
    <IconCard x={250} y={720} p={pop(f, F.starving, 12)} label="STARVING" hue="#c8893a">
      <path d="M-90 -10 Q0 90 90 -10 Z" fill="#c9ced8" stroke={INKC} strokeWidth={7} />
      <ellipse cy={-10} rx={92} ry={18} fill="#9aa4b2" stroke={INKC} strokeWidth={6} />
      <text y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC} opacity={0.5}>EMPTY</text>
    </IconCard>
    <IconCard x={830} y={720} p={pop(f, F.sick, 12)} label="SICK" hue={GREEN}>
      <circle r={70} fill="#b8e0a0" stroke={INKC} strokeWidth={7} />
      <path d="M-34 -14 L-14 -6 M34 -14 L14 -6" stroke={INKC} strokeWidth={7} strokeLinecap="round" />
      <path d="M-26 34 Q0 14 26 34" stroke={INKC} strokeWidth={7} fill="none" strokeLinecap="round" />
      <rect x={30} y={10} width={16} height={60} rx={8} fill="#fff" stroke={INKC} strokeWidth={4} transform="rotate(30 38 40)" />
    </IconCard>
    <IconCard x={540} y={1200} p={pop(f, F.saints, 12)} label="SAINT'S CURSE" hue={PURP} w={420}>
      <ellipse cy={-70} rx={60} ry={16} fill="none" stroke={YEL} strokeWidth={10} />
      <circle cy={-10} r={40} fill="#f2c7a5" stroke={INKC} strokeWidth={6} />
      <path d="M-50 70 Q0 20 50 70" fill="#6b5a8a" stroke={INKC} strokeWidth={6} />
      <path d="M100 -80 L70 -20 L95 -20 L65 50" stroke={YEL} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={f > F.curse ? 1 : 0} />
      <path d="M-100 -80 L-70 -20 L-95 -20 L-65 50" stroke={YEL} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={f > F.curse ? 1 : 0} />
    </IconCard>
    <Chip x={540} y={1420} w={420} label="= YOU DANCE!" hue={RED} p={pop(f, F.made, 10)} fs={44} />
  </g>
);
const S13_Virus: React.FC<{ f: number }> = ({ f }) => {
  const COLS = 4, ROWS = 4;
  const heads = [...Array(COLS * ROWS)].map((_, i) => {
    const c = i % COLS, r = Math.floor(i / COLS);
    return { x: 180 + c * 240 + (r % 2) * 60 - 30, y: 620 + r * 230, i };
  });
  const src = 5;
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
  const t0 = F.spread - 4;
  const infAt = (h: { x: number; y: number; i: number }) => t0 + (h.i === src ? -14 : dist(h, heads[src]) * 0.075);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1f1830" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("vx" + i) * VW} cy={rnd("vy" + i) * VH} r={2 + rnd("vr" + i) * 3} fill="#ffffff" opacity={0.15} />)}
      {/* links */}
      {heads.map((h) => heads.filter((g) => g.i > h.i && dist(g, h) < 300).map((g) => {
        const a = infAt(h) < infAt(g) ? h : g, b = a === h ? g : h;
        const p = eout(ramp(f, infAt(a), infAt(b)));
        return <line key={`${h.i}-${g.i}`} x1={a.x} y1={a.y} x2={lerp(a.x, b.x, p)} y2={lerp(a.y, b.y, p)} stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={p > 0 ? 0.85 : 0} strokeDasharray="4 18" />;
      }))}
      {heads.map((h) => <Head key={h.i} f={f} x={h.x} y={h.y} r={70} inf={ramp(f, infAt(h), infAt(h) + 8)} seed={h.i} />)}
      <Chip x={540} y={360} w={340} label="FEAR" hue={RED} p={pop(f, F.fear, 10) * (1 - ramp(f, F.mind - 4, F.mind))} fs={50} />
      <Chip x={540} y={360} w={480} label="MIND → MIND" hue={RED} p={pop(f, F.mind, 10) * (1 - ramp(f, F.virus - 10, F.virus - 4))} fs={46} />
      <g opacity={ramp(f, F.virus - 6, F.virus)}>
        <rect width={VW} height={VH} fill="#1f1830" opacity={0.55} />
        <Virus f={f} x={540} y={900} r={150} p={pop(f, F.virus - 4, 14)} />
        <text x={540} y={1250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={YEL} stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.virus, 10)}>LIKE A VIRUS</text>
      </g>
    </g>
  );
};
const S14_Shrine: React.FC<{ f: number }> = ({ f }) => {
  const out = 1 - ramp(f, F.sub - 8, F.sub + 2);
  const duoIn = eout(ramp(f, F.sub - 4, F.sub + 14));
  const glow = ramp(f, F.pray, F.pray + 20);
  return (
    <g>
      <defs><linearGradient id="skyH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6a76a" /><stop offset="1" stopColor="#fde3b8" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#skyH)" />
      <circle cx={260} cy={560} r={90} fill="#fff1c6" />
      {/* hill */}
      <path d={`M0 1000 Q 520 640 1080 860 V${VH} H0 Z`} fill="#7aa858" stroke={INKC} strokeWidth={7} />
      <path d={`M0 1260 Q 540 1060 1080 1180 V${VH} H0 Z`} fill="#5c9448" />
      {/* path */}
      <path d="M-40 1500 Q 380 1300 560 1060 Q 680 900 800 790" stroke="#d9c49a" strokeWidth={60} fill="none" strokeLinecap="round" />
      {/* shrine chapel */}
      <g transform="translate(840 800)">
        <circle cy={-120} r={190} fill="#fff6c8" opacity={0.5 * glow} />
        <rect x={-100} y={-160} width={200} height={160} fill="#f4ecd8" stroke={INKC} strokeWidth={7} />
        <path d="M-125 -160 L0 -260 L125 -160 Z" fill={ROOF} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-14} y={-330} width={28} height={70} fill="#f4ecd8" stroke={INKC} strokeWidth={5} />
        <path d="M0 -360 V-306 M-16 -344 H16" stroke={INKC} strokeWidth={8} strokeLinecap="round" />
        <path d="M-34 0 V-70 Q0 -110 34 -70 V0 Z" fill="#5a3a24" stroke={INKC} strokeWidth={5} />
      </g>
      {/* procession walking up the path */}
      {[...Array(7)].map((_, i) => {
        const t = clamp01(ramp(f, F.taken - 30, F.sub) * 0.55 + 0.38 - i * 0.075);
        const x = lerp(60, 760, t), y = t < 0.5 ? lerp(1450, 1150, t * 2) : lerp(1150, 840, (t - 0.5) * 2);
        return <Dancer key={i} f={f} x={x} y={y} s={lerp(0.75, 0.38, t)} seed={i + 50} calm={1} pray={f > F.pray ? 1 : 0} />;
      })}
      <g opacity={out}>
        <BigNum f={f} at={F.september} text="SEPTEMBER" x={540} y={420} hue={YEL} fs={130} />
        <Chip x={300} y={660} w={440} label="SHRINE OF ST. VITUS" hue={PURP} p={pop(f, F.shrine, 10)} fs={34} />
        <g opacity={0.9 * ramp(f, F.stopped + 2, F.stopped + 9)} transform="translate(540 1360) rotate(-6)"><rect x={-380} y={-62} width={760} height={116} rx={18} fill="#ffffff" /></g>
        <Stamp f={f} at={F.stopped} x={540} y={1360} text="PLAGUE STOPPED" hue="#1f9a5a" fs={64} rot={-6} />
      </g>
      <Outro f={f} at={F.sub} />
      {duoIn > 0 && <Duo f={f} wave={1} s={0.85} ax={150} hx={930} y={lerp(2200, 1560, duoIn)} />}
    </g>
  );
};

export const DancingPlagueFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.strasbourg, render: () => <S1_Ask f={f} />, cam: [[0, { x: 420, y: 1060, z: 1.22 }], [F.dropped, { x: 520, y: 1000, z: 1.1 }]] },
    { from: F.strasbourg, to: F.woman, tr: "flash", render: () => <S2_City f={f} />, cam: [[F.strasbourg, { x: 540, y: 700, z: 1.2 }], [F.july, { x: 540, y: 620, z: 1.08 }], [F.woman, { x: 540, y: 900, z: 1.04 }]] },
    { from: F.woman, to: F.funQ, tr: "push", render: () => <S3_Troffea f={f} />, cam: [[F.woman, { x: 780, y: 1000, z: 1.45 }], [F.stepped, { x: 720, y: 1040, z: 1.3 }], [F.street + 10, { x: 580, y: 1120, z: 1.18 }], [F.dancing, { x: 560, y: 1080, z: 1.1 }], [F.couldnt, { x: 540, y: 960, z: 1.06 }], [F.funQ, { x: 540, y: 980, z: 1.1 }]] },
    { from: F.funQ, to: F.days - 8, tr: "iris", render: () => <S4_Fun f={f} />, cam: [[F.funQ, { x: 380, y: 1060, z: 1.2 }], [F.notfun, { x: 600, y: 1000, z: 1.12 }], [F.days - 8, { x: 620, y: 1000, z: 1.14 }]] },
    { from: F.days - 8, to: F.whyQ, tr: "whip", render: () => <S5_Crowd f={f} />, cam: [[F.days - 8, { x: 540, y: 1200, z: 1.5 }], [F.dozens - 6, { x: 540, y: 1150, z: 1.35 }], [F.joined + 10, { x: 540, y: 1000, z: 1.12 }], [F.hundreds - 8, { x: 540, y: 980, z: 1.1 }], [F.hundreds + 26, { x: 540, y: 960, z: 1.0 }], [F.whyQ, { x: 540, y: 960, z: 1.03 }]] },
    { from: F.whyQ, to: F.doctors, tr: "wipe", render: () => <S6_Why f={f} />, cam: [[F.whyQ, { x: 420, y: 1060, z: 1.2 }], [F.heres, { x: 600, y: 1020, z: 1.12 }], [F.doctors, { x: 640, y: 1000, z: 1.16 }]] },
    { from: F.doctors, to: F.so, tr: "zoom", render: () => <S7_Cure f={f} />, cam: [[F.doctors, { x: 420, y: 1000, z: 1.2 }], [F.cure, { x: 600, y: 780, z: 1.1 }], [F.more, { x: 580, y: 900, z: 1.12 }], [F.so, { x: 570, y: 900, z: 1.1 }]] },
    { from: F.so, to: F.worseQ, tr: "push", render: () => <S8_Stage f={f} />, cam: [[F.so, { x: 540, y: 1100, z: 1.25 }], [F.stage + 20, { x: 540, y: 1050, z: 1.06 }], [F.musicians, { x: 540, y: 1200, z: 1.1 }], [F.worseQ, { x: 540, y: 1150, z: 1.04 }]] },
    { from: F.worseQ, to: F.records, tr: "whipUp", render: () => <S9_Worse f={f} />, cam: [[F.worseQ, { x: 360, y: 1060, z: 1.25 }], [F.much, { x: 580, y: 1000, z: 1.12 }], [F.records, { x: 600, y: 1000, z: 1.16 }]] },
    { from: F.records, to: F.reallyQ, tr: "iris", render: () => <S10_Collapse f={f} />, cam: [[F.records, { x: 540, y: 900, z: 1.2 }], [F.collapsed, { x: 540, y: 1000, z: 1.08 }], [F.exhaustion + 10, { x: 540, y: 900, z: 1.04 }], [F.died, { x: 540, y: 1100, z: 1.1 }], [F.reallyQ, { x: 540, y: 1150, z: 1.16 }]] },
    { from: F.reallyQ, to: F.mass, tr: "wipe", render: () => <S11_Really f={f} />, cam: [[F.reallyQ, { x: 400, y: 1060, z: 1.22 }], [F.historians, { x: 600, y: 1020, z: 1.12 }], [F.mass, { x: 640, y: 1000, z: 1.16 }]] },
    { from: F.mass, to: F.fear, tr: "zoom", render: () => <S12_Panic f={f} />, cam: [[F.mass, { x: 540, y: 520, z: 1.3 }], [F.starving - 6, { x: 400, y: 680, z: 1.18 }], [F.sick + 4, { x: 680, y: 720, z: 1.18 }], [F.saints, { x: 540, y: 1100, z: 1.2 }], [F.made, { x: 540, y: 1150, z: 1.12 }], [F.fear, { x: 540, y: 960, z: 1.04 }]] },
    { from: F.fear, to: F.september, tr: "spin", render: () => <S13_Virus f={f} />, cam: [[F.fear, { x: 540, y: 900, z: 1.3 }], [F.spread + 20, { x: 540, y: 960, z: 1.04 }], [F.virus - 8, { x: 540, y: 960, z: 1.06 }], [F.virus + 10, { x: 540, y: 1000, z: 1.12 }], [F.september, { x: 540, y: 1000, z: 1.18 }]] },
    { from: F.september, to: TOTAL + 1, tr: "flash", render: () => <S14_Shrine f={f} />, cam: [[F.september, { x: 540, y: 500, z: 1.2 }], [F.taken, { x: 500, y: 1000, z: 1.1 }], [F.shrine, { x: 760, y: 800, z: 1.2 }], [F.pray + 14, { x: 700, y: 860, z: 1.12 }], [F.stopped, { x: 540, y: 1000, z: 1.06 }], [F.sub, { x: 540, y: 1000, z: 1.04 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.y1518, 0.12], [F.dancing, 0.1], [F.couldnt, 0.12], [F.dozens, 0.1], [F.hundreds, 0.12], [F.crazy, 0.1], [F.more, 0.14], [ASKS[3][0], 0.12], [F.much, 0.1], [F.collapsed, 0.1], [F.mass, 0.12], [F.curse, 0.1], [F.virus, 0.12], [F.september, 0.1], [F.stopped, 0.12]];
  const SHAKE: [number, number][] = [[F.couldnt, 8], [F.more, 10], [ASKS[3][0], 8], [F.collapsed, 12], [F.mass, 10], [F.virus, 10]];
  const SFX: Cue[] = [
    ...ASKS.map(([a]) => [a - 3, "pop", 0.4] as Cue),
    [F.strasbourg, "pop", 0.3], [F.july, "boom", 0.3], [F.woman - 6, "whoosh", 0.25], [F.frau, "pop", 0.3], [F.dancing - 8, "riser", 0.25], [F.couldnt, "impact", 0.45],
    [F.notfun, "pop", 0.35], [F.days - 4, "tick", 0.3], [F.dozens - 4, "tick", 0.3], [F.dozens + 18, "pop", 0.35], [F.august - 2, "pop", 0.3], [F.hundreds - 4, "riser", 0.25], [F.hundreds + 20, "boom", 0.35],
    [F.crazy, "pop", 0.3], [F.doctors - 4, "whoosh", 0.25], [F.more, "impact", 0.5], [F.stage - 10, "tick", 0.3], [F.stage + 10, "pop", 0.3], [F.musicians - 4, "pop", 0.3], [F.musicians + 4, "pop", 0.25],
    [F.much, "impact", 0.45], [F.records, "pop", 0.3], [F.collapsed, "boom", 0.35], [F.exhaustion, "pop", 0.3], [F.some - 10, "riser_dark", 0.3],
    [F.historians, "pop", 0.3], [F.mass, "impact", 0.5], [F.starving, "pop", 0.35], [F.sick, "pop", 0.35], [F.saints, "pop", 0.35], [F.curse, "impact", 0.35], [F.made, "pop", 0.3],
    [F.fear, "pop", 0.3], [F.spread - 4, "riser_dark", 0.3], [F.mind, "pop", 0.3], [F.virus - 4, "boom", 0.45],
    [F.september, "pop", 0.35], [F.shrine, "pop", 0.3], [F.pray, "riser", 0.2], [F.stopped, "impact", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.funQ ? YEL : f < F.worseQ ? "#58c8ff" : f < F.september ? RED : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="DANCING" sub="THE PLAGUE OF 1518" until={F.strasbourg - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="dancing" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
