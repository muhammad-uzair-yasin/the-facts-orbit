import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
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
  ask: ASKS[0][0], frozen: W("frozen"), two: W("two"), thousand: W("thousand"),
  y79: W("79"), vesuvius: W("vesuvius"), erupted: W("erupted"), roman: W("roman"), pompeii: W("pompeii"),
  many: W("many"), escaped: W("escaped"), stayed: W("stayed"), wave: W("wave"), superhot: W("superhot"), rolled: W("rolled"), hundreds: W("hundreds"), kmh: W("kilometers"),
  outrunQ: ASKS[1][0], no: W("no"), killed: W("killed"), then: W("then"), buried: W("buried"), meters: W("meters"), forgotten: W("forgotten"), seventeen: W("seventeen"),
  shapesQ: ASKS[2][0], y1863: W("1863"), archaeologist: W("archaeologist"), hollow: W("hollow"), hardened: W("hardened"), decayed: W("decayed"), molds: W("molds"),
  poured: W("poured"), plaster: W("plaster"), appeared: W("appeared"),
  creepyQ: ASKS[3][0], creepy: W("creepy"), twist: W("twist"), foryears: W("years", 3), pair: W("pair"), mother: W("mother"), child: W("child"),
  y2024: W("2024"), dna: W("dna"), man: W("man"), related: W("related"),
  wrongQ: ASKS[4][0], some: W("some"), froze: W("froze"), guessed: W("guessed"),
  sub: W("subscribe"),
};
const BUB: { t: string; hot?: boolean; num?: [number, number, number, string] }[] = [
  { t: "2,000 YEARS?!", hot: true }, { t: "OUTRUN IT?" }, { t: "BODY SHAPES?" }, { t: "WOW... CREEPY!", hot: true }, { t: "STORIES WRONG?!", hot: true },
];

const SKY0 = "#f4b27a", SKY1 = "#fbe3bd", STONE = "#e3cfa8", STONE2 = "#c7ad80", MOUNT = "#7a5c4a", MOUNT2 = "#5e4536", ASH = "#8a7f78", ASH2 = "#5d5450", LAVA = "#ff6a2b", PLASTER = "#e9e4da", RED = "#e8412f", GREEN = "#3ddc97", CYAN = "#58c8ff";
const ASKER = CAST[25], HOST = CAST[45], FIORELLI = CAST[1];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const askMood = (f: number): "happy" | "neutral" | "surprised" => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
  if (i >= 0) return BUB[i]?.hot ? "surprised" : "neutral";
  if ((f > F.no && f < F.no + 50) || (f > F.twist && f < F.twist + 30)) return "surprised";
  return "neutral";
};
const hostMood = (f: number): "happy" | "neutral" | "surprised" => (speaking(f, "asker", SPK) ? "neutral" : "happy");

// ---------- shared pieces ----------
const AskBubble: React.FC<{ f: number; x: number; y: number; tx: number; ty: number; fs?: number }> = ({ f, x, y, tx, ty, fs = 80 }) => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 3 && f < b + 16);
  if (i < 0 || !BUB[i]) return null;
  const [a, b] = ASKS[i]; const { t, hot } = BUB[i];
  const fz = t.length > 16 ? fs * 0.82 : fs;
  const p = pop(f, a - 3, 10), out = 1 - ramp(f, b + 6, b + 16);
  const w = Math.min(920, t.length * fz * 0.66 + 100), h = fz * 1.65;
  const bx = Math.max(w / 2 + 70, Math.min(VW - w / 2 - 70, x));
  const wob = hot ? Math.sin(f * 0.9) * 1.6 : 0;
  const tail = `M${-34} ${h / 2 - 10} L${tx - bx} ${ty - y} L${34} ${h / 2 - 10} Z`;
  const fill = hot ? YEL : "#ffffff";
  // the first bubble counts up its number
  const txt = i === 0 ? `${countUp(f, a + 4, a + 34, 2000).toLocaleString("en-US")} YEARS?!` : t;
  return (
    <g opacity={clamp01(out)} transform={`translate(${bx} ${y}) rotate(${-2 + wob}) scale(${Math.max(0, p)})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={h / 2} fill="#000" opacity={0.3} />
      <path d={tail} fill={fill} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={INKC} strokeWidth={9} />
      <path d={`M${-26} ${h / 2 - 14} L${(tx - bx) * 0.25} ${(ty - y) * 0.25} L${26} ${h / 2 - 14} Z`} fill={fill} />
      <text y={fz * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fz} fill={INKC} letterSpacing={1}>{txt}</text>
    </g>
  );
};
const Column: React.FC<{ x: number; y: number; h: number; broken?: boolean; w?: number }> = ({ x, y, h, broken, w = 70 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 14} y={-24} width={w + 28} height={24} fill={STONE2} stroke={INKC} strokeWidth={5} />
    <path d={broken ? `M${-w / 2} -24 V${-h} L${-w / 4} ${-h - 18} L${w / 8} ${-h + 6} L${w / 2} ${-h - 10} V-24 Z` : `M${-w / 2} -24 V${-h} H${w / 2} V-24 Z`} fill={STONE} stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
    {[-1, 0, 1].map((k) => <line key={k} x1={k * w / 4} y1={-30} x2={k * w / 4} y2={-h + (broken ? 10 : 6)} stroke={STONE2} strokeWidth={5} />)}
    {!broken && <rect x={-w / 2 - 16} y={-h - 26} width={w + 32} height={26} fill={STONE2} stroke={INKC} strokeWidth={5} />}
  </g>
);
const Vesuvius: React.FC<{ f: number; x: number; y: number; s: number; smoke?: number; erupt?: number }> = ({ f, x, y, s, smoke = 0.3, erupt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {erupt > 0 && (
      <g>
        {/* plume column */}
        {[...Array(16)].map((_, i) => {
          const t = i / 15, yy = -360 - t * 900 * erupt, rr = 70 + t * 170 * erupt + Math.sin(f * 0.1 + i) * 10;
          return <circle key={i} cx={Math.sin(i * 1.7 + f * 0.03) * 40 * t} cy={yy} r={rr} fill={mix(ASH2, "#3a302c", t)} stroke={INKC} strokeWidth={5} opacity={0.95} />;
        })}
        {[...Array(12)].map((_, i) => {
          const q = ((f * 2 + i * 23) % 80) / 80;
          return <circle key={"r" + i} cx={(rnd("rk" + i) - 0.5) * 500 * q} cy={-360 - Math.sin(q * Math.PI) * 420 + q * 200} r={8 + rnd("rs" + i) * 10} fill={LAVA} opacity={erupt} />;
        })}
        <ellipse cx={0} cy={-360} rx={120} ry={40} fill={LAVA} opacity={0.8 * erupt} />
      </g>
    )}
    <path d="M-620 0 L-130 -360 Q0 -380 130 -360 L620 0 Z" fill={MOUNT} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-130 -360 Q0 -380 130 -360 L180 -320 Q60 -300 0 -320 Q-80 -300 -170 -330 Z" fill={MOUNT2} />
    <path d="M-300 -150 L-200 -120 M200 -200 L300 -150 M-80 -250 L-20 -200" stroke={MOUNT2} strokeWidth={10} strokeLinecap="round" />
    {erupt > 0.2 && <path d="M-40 -360 Q-60 -250 -120 -160 Q-140 -100 -170 -60" stroke={LAVA} strokeWidth={22} fill="none" strokeLinecap="round" opacity={erupt} />}
    {smoke > 0 && erupt <= 0 && [...Array(4)].map((_, i) => <circle key={i} cx={Math.sin(f * 0.02 + i) * 20 + i * 18} cy={-400 - i * 50 - (f * 0.5) % 50} r={30 + i * 10} fill="#d8d2cc" opacity={smoke * (1 - i * 0.2)} />)}
  </g>
);
const Ruins: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <g>
    <defs><linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#skyR)" />
    <circle cx={880} cy={300} r={90} fill="#fff4d6" opacity={0.8} />
    <Vesuvius f={f} x={560} y={1060} s={1.05} smoke={0.5} />
    <rect y={1040} width={VW} height={80} fill="#a9a06a" />
    {/* ruined wall */}
    <path d="M0 1120 V940 L80 930 L110 980 L200 960 L220 1020 L330 1000 V1120 Z" fill={STONE2} stroke={INKC} strokeWidth={6} />
    {[...Array(4)].map((_, i) => <line key={i} x1={0} y1={980 + i * 34} x2={320} y2={980 + i * 34} stroke="#a88d63" strokeWidth={4} />)}
    <Column x={420} y={1200} h={380} />
    <Column x={580} y={1200} h={300} broken />
    <Column x={960} y={1200} h={420} />
    <Column x={760} y={1200} h={200} broken />
    <rect x={380} y={790} width={220} height={36} fill={STONE2} stroke={INKC} strokeWidth={5} opacity={0} />
    {/* paving */}
    <rect y={1190} width={VW} height={VH - 1190} fill="#7d6a52" />
    {[...Array(8)].map((_, r) => [...Array(7)].map((_, c) => <rect key={`${r}-${c}`} x={c * 170 - (r % 2) * 85 + 6} y={1196 + r * 92} width={160} height={84} rx={14} fill={r % 2 ? "#87735a" : "#8f7a5f"} />))}
    {dim > 0 && <rect width={VW} height={VH} fill="#1a120c" opacity={dim} />}
  </g>
);
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; wave?: number }> = ({ f, ax = 290, hx = 800, y = 1500, s = 1.05, wave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={ASKER} f={f} seed={25} talk={askTalk(f)} wave={wave} mood={askMood(f)} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={HOST} f={f} seed={45} talk={hostTalk(f)} wave={wave} mood={hostMood(f)} /></g>
  </g>
);
/** A Roman townhouse with red tiled roof. */
const House: React.FC<{ x: number; y: number; w: number; h: number; c?: string }> = ({ x, y, w, h, c = "#f2dfc0" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={c} stroke={INKC} strokeWidth={5} />
    <path d={`M${-w / 2 - 12} ${-h} L0 ${-h - w * 0.28} L${w / 2 + 12} ${-h} Z`} fill="#c4572a" stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-w * 0.12} y={-h * 0.55} width={w * 0.24} height={h * 0.55} fill="#6b4a2b" />
  </g>
);
const City: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {[[-380, 120, 110], [-250, 150, 140], [-110, 120, 100], [20, 170, 150], [160, 130, 110], [300, 150, 130], [420, 110, 90]].map(([dx, w, h], i) => <House key={i} x={dx} y={0} w={w} h={h} c={i % 2 ? "#f2dfc0" : "#ead1a8"} />)}
    {/* temple */}
    <g transform="translate(-40 -150)">
      <path d="M-120 0 L0 -60 L120 0 Z" fill={STONE} stroke={INKC} strokeWidth={5} />
      {[-90, -45, 0, 45, 90].map((cx) => <rect key={cx} x={cx - 9} y={0} width={18} height={70} fill={STONE} stroke={INKC} strokeWidth={4} />)}
    </g>
  </g>
);
/** Simple running figure silhouette. */
const Runner: React.FC<{ f: number; x: number; y: number; s: number; c?: string; seed: number }> = ({ f, x, y, s, c = "#3a2c22", seed }) => {
  const k = Math.sin(f * 0.5 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={c} strokeWidth={12} strokeLinecap="round" fill="none">
      <circle cx={6} cy={-92} r={14} fill={c} stroke="none" />
      <line x1={4} y1={-76} x2={-4} y2={-36} />
      <line x1={-4} y1={-36} x2={-4 + k * 20} y2={0} /><line x1={-4} y1={-36} x2={-4 - k * 20} y2={0} />
      <line x1={2} y1={-66} x2={2 + k * 18} y2={-44} /><line x1={2} y1={-66} x2={2 - k * 18} y2={-46} />
    </g>
  );
};
/** Respectful plaster-cast silhouette (curled, lying). */
const CastShape: React.FC<{ x: number; y: number; s: number; fill: string; stroke?: string; o?: number }> = ({ x, y, s, fill, stroke = INKC, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M-150 10 C-160 -40 -110 -60 -60 -50 C-20 -44 30 -60 70 -40 C110 -20 140 0 120 30 C100 50 60 30 30 40 C0 50 -40 50 -80 40 C-120 34 -144 30 -150 10 Z" fill={fill} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={-170} cy={-20} rx={38} ry={34} fill={fill} stroke={stroke} strokeWidth={6} />
    <path d="M-120 -30 C-110 -70 -60 -80 -40 -60" fill="none" stroke={stroke} strokeWidth={5} opacity={0.5} />
  </g>
);
const DNA: React.FC<{ f: number; x: number; y: number; h: number; p: number }> = ({ f, x, y, h, p }) => (
  <g transform={`translate(${x} ${y})`} opacity={p}>
    {[...Array(14)].map((_, i) => {
      const t = i / 13, yy = -h / 2 + t * h, ph = f * 0.12 + i * 0.6;
      const a = Math.sin(ph) * 70, b = -a, front = Math.cos(ph) > 0;
      return (
        <g key={i}>
          <line x1={a} y1={yy} x2={b} y2={yy} stroke={i % 2 ? CYAN : "#ff9ec7"} strokeWidth={8} opacity={t <= p ? 1 : 0} />
          <circle cx={a} cy={yy} r={13} fill={front ? "#3d6ccf" : "#2a4a8a"} stroke={INKC} strokeWidth={4} opacity={t <= p ? 1 : 0} />
          <circle cx={b} cy={yy} r={13} fill={front ? "#2a4a8a" : "#3d6ccf"} stroke={INKC} strokeWidth={4} opacity={t <= p ? 1 : 0} />
        </g>
      );
    })}
  </g>
);

// ---------- shots ----------
const S1_Ruins: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Ruins f={f} />
    <Duo f={f} />
    <AskBubble f={f} x={380} y={790} tx={290} ty={1010} fs={86} />
  </g>
);
const S2_Erupt: React.FC<{ f: number }> = ({ f }) => {
  const er = eout(ramp(f, F.erupted - 6, F.erupted + 50));
  const dark = eio(ramp(f, F.erupted - 4, F.erupted + 30));
  return (
    <g>
      <defs><linearGradient id="skyE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#8fc6f0", "#3a2b2b", dark)} /><stop offset="1" stopColor={mix("#dff0fb", "#a2563a", dark)} /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#skyE)" />
      <Vesuvius f={f} x={540} y={1080} s={1.1} smoke={0.4} erupt={er} />
      <rect y={1070} width={VW} height={VH - 1070} fill={mix("#a9b36a", "#6e5a3a", dark)} />
      <City x={540} y={1330} />
      <rect y={1330} width={VW} height={VH - 1330} fill={mix("#cbb68e", "#7a6446", dark)} />
      <BigNum f={f} at={F.y79 - 2} text="79 AD" x={540} y={360} hue={YEL} fs={200} />
      <Chip x={540} y={1440} w={360} label="POMPEII" hue={RED} p={pop(f, F.pompeii, 10)} fs={50} />
      <Chip x={300} y={560} w={380} label="VESUVIUS" hue="#3a2c22" p={pop(f, F.vesuvius, 10)} fs={42} />
    </g>
  );
};
const S3_Surge: React.FC<{ f: number }> = ({ f }) => {
  const flee = ramp(f, F.many - 10, F.stayed);
  const surge = eio(ramp(f, F.wave - 4, F.hundreds + 30));
  const front = lerp(-200, 900, surge);
  const speedN = countUp(f, F.hundreds - 10, F.kmh + 10, 100);
  const speed = speedN * 2.4;
  return (
    <g>
      <rect width={VW} height={VH} fill="#4a3530" />
      <rect width={VW} height={900} fill="#2e2321" />
      {/* side view: slope from upper-left to city at right */}
      <path d={`M0 520 L640 1120 L${VW} 1120 V${VH} H0 Z`} fill="#6b5240" stroke={INKC} strokeWidth={6} />
      <path d="M0 360 L120 420 L0 480 Z" fill={LAVA} opacity={0.6} />
      <City x={820} y={1120} />
      {/* people escaping to the right */}
      {[...Array(6)].map((_, i) => {
        const go = clamp01(flee * 1.4 - i * 0.08);
        return <Runner key={i} f={f} x={lerp(700 + i * 40, 1180 + i * 60, go)} y={1240 + (i % 3) * 40} s={0.9} seed={i} c="#2a1f18" />;
      })}
      <Chip x={820} y={1420} w={340} label="MANY ESCAPED" hue={GREEN} p={pop(f, F.escaped, 10) * (1 - ramp(f, F.wave, F.wave + 8))} fs={38} textColor={INKC} />
      {/* pyroclastic surge billowing down the slope */}
      {surge > 0 && (
        <g>
          {[...Array(26)].map((_, i) => {
            const t = i / 25;
            const cx = front - t * 900;
            const cy = 520 + (cx / 640) * 600 - 40 - rnd("sy" + i) * 160;
            const r = 90 + rnd("sr" + i) * 90 + Math.sin(f * 0.2 + i) * 10;
            return <circle key={i} cx={cx} cy={Math.min(1120, cy)} r={r} fill={mix(ASH, ASH2, rnd("c" + i))} stroke={INKC} strokeWidth={5} />;
          })}
          {[...Array(6)].map((_, i) => <line key={"s" + i} x1={front - 300 - i * 60} y1={700 + i * 80} x2={front - 520 - i * 60} y2={700 + i * 80 - 30} stroke="#fff" strokeWidth={6} opacity={0.4} strokeLinecap="round" />)}
          <ellipse cx={front - 200} cy={1000} rx={300} ry={60} fill={LAVA} opacity={0.18} />
        </g>
      )}
      <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, F.superhot, 10)}>SUPERHOT GAS + ASH</text>
      {/* speedometer */}
      {f >= F.hundreds - 10 && (
        <g transform="translate(250 760)" opacity={pop(f, F.hundreds - 10, 10)}>
          <circle r={140} fill="#1d1614" stroke="#fff" strokeWidth={8} />
          <path d="M-110 50 A120 120 0 1 1 110 50" fill="none" stroke={RED} strokeWidth={14} strokeDasharray="20 10" />
          <g transform={`rotate(${-120 + (speed / 400) * 240 + Math.sin(f * 1.4) * 2})`}><line x1={0} y1={0} x2={0} y2={-110} stroke={YEL} strokeWidth={10} strokeLinecap="round" /></g>
          <circle r={14} fill={YEL} />
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff">{speedN < 100 ? speedN : "100s"}</text>
          <text y={112} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={YEL}>KM/H</text>
        </g>
      )}
    </g>
  );
};
const S4_Outrun: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Ruins f={f} dim={0.15} />
    <Duo f={f} />
    <Stamp f={f} at={F.no} x={790} y={820} text="NO." hue={RED} fs={110} rot={-8} />
    <Chip x={790} y={960} w={400} label="ALMOST INSTANT" hue="#3a2c22" p={pop(f, F.killed + 6, 10)} fs={38} />
    <AskBubble f={f} x={360} y={790} tx={290} ty={1010} fs={88} />
  </g>
);
const S5_Buried: React.FC<{ f: number }> = ({ f }) => {
  const fill = eio(ramp(f, F.buried - 6, F.meters + 30));
  const grass = eout(ramp(f, F.forgotten - 6, F.forgotten + 20));
  const yrs = countUp(f, F.seventeen - 10, F.seventeen + 30, 1700);
  const top = lerp(1150, 650, fill);
  return (
    <g>
      <rect width={VW} height={VH} fill={mix("#7fb8e0", "#8fc6f0", grass)} />
      <rect y={1150} width={VW} height={VH - 1150} fill="#5a4636" />
      <City x={540} y={1150} />
      {/* ash layers */}
      <defs><clipPath id="ashclip"><rect x={0} y={top} width={VW} height={1150 - top + 2} /></clipPath></defs>
      <g clipPath="url(#ashclip)">
        {[...Array(10)].map((_, i) => <rect key={i} x={0} y={650 + i * 50} width={VW} height={50} fill={i % 2 ? "#9a8f86" : "#b3a89e"} />)}
        {[...Array(40)].map((_, i) => <circle key={"p" + i} cx={rnd("ax" + i) * VW} cy={660 + rnd("ay" + i) * 480} r={3 + rnd("ar" + i) * 5} fill="#7a6f68" />)}
      </g>
      {/* ash falling */}
      {fill < 0.98 && [...Array(40)].map((_, i) => <circle key={"f" + i} cx={rnd("fx" + i) * VW} cy={((rnd("fy" + i) * 600 + f * 9) % 650)} r={3 + rnd("fr" + i) * 4} fill="#6d635d" opacity={0.8 * (1 - grass)} />)}
      {/* grass + tree on top */}
      {grass > 0 && (
        <g opacity={grass}>
          <rect x={0} y={top - 24} width={VW} height={30} fill="#5cae4a" stroke={INKC} strokeWidth={5} />
          {[...Array(30)].map((_, i) => <path key={i} d={`M${i * 37} ${top - 20} l 8 ${-20 * grass} l 8 ${20 * grass}`} fill="#5cae4a" />)}
          <g transform={`translate(960 ${top - 20}) scale(${grass})`}>
            <rect x={-12} y={-140} width={24} height={140} fill="#6b4a2b" />
            <circle cy={-180} r={80} fill="#3f9a4a" stroke={INKC} strokeWidth={6} />
          </g>
        </g>
      )}
      {/* ruler */}
      {f >= F.meters - 10 && (
        <g transform="translate(120 0)" opacity={pop(f, F.meters - 10, 10)}>
          <line x1={0} y1={top} x2={0} y2={1150} stroke="#fff" strokeWidth={10} />
          <line x1={-24} y1={top} x2={24} y2={top} stroke="#fff" strokeWidth={10} />
          <line x1={-24} y1={1150} x2={24} y2={1150} stroke="#fff" strokeWidth={10} />
          <text x={40} y={(top + 1150) / 2 + 20} fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke">4–6 M</text>
        </g>
      )}
      <Chip x={540} y={1300} w={300} label="BURIED" hue="#3a2c22" p={pop(f, F.buried, 10)} fs={46} />
      {f >= F.seventeen - 10 && (
        <g>
          <text x={540} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={YEL} stroke={INKC} strokeWidth={10} paintOrder="stroke">{yrs.toLocaleString("en-US")}</text>
          <text x={540} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">YEARS FORGOTTEN</text>
        </g>
      )}
      {f < F.seventeen - 10 && <Chip x={540} y={420} w={420} label="FORGOTTEN..." hue="#5a4636" p={pop(f, F.forgotten, 10)} fs={48} />}
    </g>
  );
};
const S6_Shapes: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Ruins f={f} dim={0.1} />
    {/* glass case with a cast, in the background */}
    <g transform="translate(560 1170)">
      <rect x={-150} y={-120} width={300} height={120} fill="#d8eef7" fillOpacity={0.4} stroke="#fff" strokeWidth={6} />
      <CastShape x={20} y={-40} s={0.55} fill={PLASTER} />
      <rect x={-160} y={0} width={320} height={40} fill={STONE2} stroke={INKC} strokeWidth={5} />
    </g>
    <Duo f={f} />
    <AskBubble f={f} x={360} y={790} tx={290} ty={1010} fs={88} />
  </g>
);
const S7_Plaster: React.FC<{ f: number }> = ({ f }) => {
  const hollow = eout(ramp(f, F.hollow - 4, F.hollow + 14));
  const mold = ramp(f, F.decayed, F.molds + 10);
  const pour = eio(ramp(f, F.poured - 4, F.appeared - 6));
  const tilt = eio(ramp(f, F.poured - 14, F.poured));
  const lift = eio(ramp(f, F.appeared - 2, F.appeared + 26));
  const castY = lerp(1060, 820, lift);
  return (
    <g>
      <rect width={VW} height={VH} fill="#f3d9ae" />
      <rect y={700} width={VW} height={VH - 700} fill="#cdbfb2" />
      {/* hardened ash block (cross-section) */}
      <rect x={60} y={900} width={960} height={420} rx={12} fill="#a49890" stroke={INKC} strokeWidth={8} />
      {[...Array(8)].map((_, i) => <line key={i} x1={60} y1={940 + i * 46} x2={1020} y2={940 + i * 46} stroke="#8f847c" strokeWidth={4} />)}
      {/* the hollow */}
      <g opacity={hollow}>
        <CastShape x={560} y={1090} s={1.25} fill="#2a2420" stroke="#1a1512" />
        <CastShape x={560} y={1090} s={1.25} fill="none" stroke={YEL} />
      </g>
      {/* plaster filling the hollow */}
      <defs><clipPath id="fillc"><rect x={0} y={lerp(1180, 980, pour)} width={VW} height={400} /></clipPath></defs>
      {pour > 0 && lift <= 0 && <g clipPath="url(#fillc)"><CastShape x={560} y={1090} s={1.25} fill={PLASTER} /></g>}
      {pour > 0 && pour < 1 && <path d={`M640 ${700} Q 650 ${820} 640 ${1000}`} stroke={PLASTER} strokeWidth={26} fill="none" strokeLinecap="round" />}
      {/* lifted cast */}
      {lift > 0 && <g transform={`rotate(${-4 * lift} 560 ${castY})`}><CastShape x={560} y={castY} s={1.25} fill={PLASTER} /></g>}
      {/* Fiorelli with bucket */}
      <g transform="translate(250 870) scale(1.0)"><Person d={FIORELLI} f={f} seed={1} talk={0} wave={0} mood={lift > 0.5 ? "surprised" : "neutral"} /></g>
      <g transform={`translate(600 680) rotate(${lerp(0, 70, tilt)})`}>
        <path d="M-50 -60 H50 L40 40 H-40 Z" fill="#9aa4b2" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
        <path d="M-50 -60 Q0 -110 50 -60" stroke={INKC} strokeWidth={6} fill="none" />
        <rect x={-46} y={-60} width={92} height={18} fill={PLASTER} />
      </g>
      <g opacity={1 - ramp(f, F.hollow - 14, F.hollow - 4)}><BigNum f={f} at={F.y1863} text="1863" x={540} y={330} hue={YEL} fs={190} /></g>
      <Chip x={540} y={440} w={520} label="GIUSEPPE FIORELLI" hue="#3a2c22" p={pop(f, F.archaeologist, 10) * (1 - ramp(f, F.hollow - 10, F.hollow - 2))} fs={38} />
      <Chip x={800} y={860} w={330} label={mold > 0.2 ? "PERFECT MOLD" : "HOLLOW"} hue={mold > 0.2 ? "#7b5cff" : "#3a2c22"} p={pop(f, F.hollow, 10) * (1 - ramp(f, F.poured - 16, F.poured - 8))} fs={40} />
      <Chip x={540} y={560} w={380} label="PLASTER" hue={CYAN} p={pop(f, F.plaster, 10) * (1 - ramp(f, F.appeared - 2, F.appeared + 4))} fs={46} textColor={INKC} />
      {lift > 0.6 && <text x={540} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={ramp(f, F.appeared + 16, F.appeared + 26)}>THE PEOPLE OF POMPEII</text>}
    </g>
  );
};
const S8_Creepy: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#2b2a33" />
    {/* museum hall */}
    {[...Array(5)].map((_, i) => <rect key={i} x={40 + i * 220} y={200} width={160} height={900} fill="#34333e" />)}
    {[...Array(3)].map((_, i) => <path key={"l" + i} d={`M${200 + i * 340} 140 L${120 + i * 340} 1100 L${280 + i * 340} 1100 Z`} fill="#fff6d8" opacity={0.06} />)}
    <g transform="translate(540 1100)">
      <rect x={-250} y={-200} width={500} height={200} fill="#d8eef7" fillOpacity={0.25} stroke="#fff" strokeWidth={6} />
      <CastShape x={0} y={-70} s={0.85} fill={PLASTER} />
      <rect x={-270} y={0} width={540} height={60} fill="#55535f" stroke={INKC} strokeWidth={5} />
    </g>
    <rect y={1160} width={VW} height={VH - 1160} fill="#1d1c24" />
    <Duo f={f} />
    <Stamp f={f} at={F.twist} x={790} y={820} text="TWIST!" hue={YEL} fs={96} rot={-8} />
    <AskBubble f={f} x={420} y={780} tx={290} ty={1010} fs={80} />
  </g>
);
const S9_DNA: React.FC<{ f: number }> = ({ f }) => {
  const labIn = pop(f, F.mother - 6, 12);
  const strike = eout(ramp(f, F.man - 4, F.man + 10));
  const dna = eio(ramp(f, F.dna - 10, F.dna + 30));
  const apart = eio(ramp(f, F.related - 4, F.related + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill="#2b2a33" />
      {[...Array(5)].map((_, i) => <rect key={i} x={40 + i * 220} y={200} width={160} height={900} fill="#34333e" />)}
      <rect y={1250} width={VW} height={VH - 1250} fill="#1d1c24" />
      {/* the pair */}
      <g transform="translate(540 1080)">
        <rect x={-420} y={-220} width={840} height={260} fill="#d8eef7" fillOpacity={0.18} stroke="#fff" strokeWidth={6} />
        <CastShape x={lerp(-40, -140, apart)} y={-70} s={1.05} fill={PLASTER} />
        <g transform={`translate(${lerp(110, 260, apart)} -60) scale(-1 1)`}><CastShape x={0} y={0} s={0.5} fill={PLASTER} /></g>
        <rect x={-440} y={40} width={880} height={70} fill="#55535f" stroke={INKC} strokeWidth={5} />
      </g>
      {/* museum label */}
      <g opacity={clamp01(labIn)} transform={`translate(540 520) scale(${clamp01(labIn)})`}>
        <rect x={-380} y={-110} width={760} height={220} rx={16} fill="#f4ecd8" stroke={INKC} strokeWidth={8} />
        <text y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#6b5a3a" letterSpacing={4}>FOR YEARS, THE LABEL SAID:</text>
        <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={INKC} opacity={1 - strike * 0.5}>"MOTHER & CHILD"</text>
        {strike > 0 && <line x1={-320} y1={22} x2={lerp(-320, 320, strike)} y2={22} stroke={RED} strokeWidth={14} strokeLinecap="round" />}
      </g>
      <BigNum f={f} at={F.y2024} text="2024" x={540} y={300} hue={YEL} fs={170} />
      <DNA f={f} x={900} y={760} h={360} p={dna * (1 - ramp(f, F.man + 10, F.man + 20) * 0.6)} />
      <Chip x={240} y={760} w={260} label="DNA TEST" hue={CYAN} p={pop(f, F.dna, 10) * (1 - ramp(f, F.man - 6, F.man))} fs={36} textColor={INKC} />
      {f >= F.man - 2 && (
        <g transform={`translate(540 760) rotate(-4) scale(${clamp01(pop(f, F.man - 2, 12))})`}>
          <rect x={-300} y={-60} width={600} height={120} rx={20} fill={RED} stroke={INKC} strokeWidth={8} />
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill="#fff">A MAN</text>
        </g>
      )}
      {f >= F.related - 2 && (
        <g transform={`translate(540 900) rotate(3) scale(${clamp01(pop(f, F.related - 2, 12))})`}>
          <rect x={-300} y={-50} width={600} height={100} rx={20} fill="#fff" stroke={INKC} strokeWidth={8} />
          <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC}>NOT RELATED</text>
        </g>
      )}
    </g>
  );
};
const S10_End: React.FC<{ f: number }> = ({ f }) => {
  const out = 1 - ramp(f, F.sub - 6, F.sub + 4);
  return (
    <g>
      <Ruins f={f} dim={0.25} />
      {out > 0 && (
        <g opacity={out}>
          <Chip x={540} y={560} w={460} label="ASH FROZE THE MOMENT" hue="#3a2c22" p={pop(f, F.froze - 4, 10)} fs={34} />
          <Stamp f={f} at={F.guessed} x={540} y={760} text="WE GUESSED THE REST" hue={RED} fs={54} rot={-6} />
        </g>
      )}
      <Outro f={f} at={F.sub} />
      <Duo f={f} wave={f >= F.sub ? 1 : 0} s={lerp(1.05, 0.85, eio(ramp(f, F.sub - 4, F.sub + 10)))} ax={lerp(290, 150, eio(ramp(f, F.sub - 4, F.sub + 10)))} hx={lerp(800, 930, eio(ramp(f, F.sub - 4, F.sub + 10)))} y={lerp(1500, 1560, eio(ramp(f, F.sub - 4, F.sub + 10)))} />
      <AskBubble f={f} x={380} y={790} tx={290} ty={1010} fs={86} />
    </g>
  );
};

export const PompeiiFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.y79, render: () => <S1_Ruins f={f} />, cam: [[0, { x: 380, y: 1060, z: 1.25 }], [F.thousand, { x: 480, y: 980, z: 1.12 }], [F.y79, { x: 560, y: 820, z: 1.06 }]] },
    { from: F.y79, to: F.many, tr: "flash", render: () => <S2_Erupt f={f} />, cam: [[F.y79, { x: 540, y: 500, z: 1.25 }], [F.vesuvius, { x: 540, y: 760, z: 1.1 }], [F.erupted + 10, { x: 540, y: 700, z: 1.02 }], [F.pompeii, { x: 540, y: 1000, z: 1.06 }], [F.many, { x: 540, y: 1060, z: 1.12 }]] },
    { from: F.many, to: F.outrunQ, tr: "whip", render: () => <S3_Surge f={f} />, cam: [[F.many, { x: 800, y: 1200, z: 1.3 }], [F.stayed, { x: 700, y: 1100, z: 1.15 }], [F.wave, { x: 400, y: 800, z: 1.1 }], [F.hundreds, { x: 420, y: 860, z: 1.08, r: -2 }], [F.outrunQ, { x: 700, y: 1000, z: 1.15 }]] },
    { from: F.outrunQ, to: F.then, tr: "iris", render: () => <S4_Outrun f={f} />, cam: [[F.outrunQ, { x: 360, y: 1040, z: 1.25 }], [F.no, { x: 560, y: 960, z: 1.12 }], [F.then, { x: 560, y: 980, z: 1.16 }]] },
    { from: F.then, to: F.shapesQ, tr: "push", render: () => <S5_Buried f={f} />, cam: [[F.then, { x: 540, y: 1150, z: 1.15 }], [F.meters + 10, { x: 540, y: 960, z: 1.04 }], [F.forgotten, { x: 640, y: 760, z: 1.15 }], [F.seventeen + 20, { x: 540, y: 600, z: 1.1 }], [F.shapesQ, { x: 540, y: 620, z: 1.18 }]] },
    { from: F.shapesQ, to: F.y1863, tr: "wipe", render: () => <S6_Shapes f={f} />, cam: [[F.shapesQ, { x: 420, y: 1060, z: 1.2 }], [F.y1863, { x: 540, y: 1080, z: 1.1 }]] },
    { from: F.y1863, to: F.creepyQ, tr: "zoom", render: () => <S7_Plaster f={f} />, cam: [[F.y1863, { x: 540, y: 420, z: 1.3 }], [F.archaeologist + 10, { x: 400, y: 760, z: 1.1 }], [F.hollow, { x: 560, y: 1060, z: 1.3 }], [F.molds, { x: 560, y: 1000, z: 1.15 }], [F.poured, { x: 560, y: 900, z: 1.1 }], [F.appeared + 10, { x: 540, y: 800, z: 1.08 }], [F.creepyQ, { x: 540, y: 820, z: 1.15 }]] },
    { from: F.creepyQ, to: F.foryears, tr: "spin", render: () => <S8_Creepy f={f} />, cam: [[F.creepyQ, { x: 520, y: 1000, z: 1.15 }], [F.creepy, { x: 500, y: 1020, z: 1.2, r: -2 }], [F.twist, { x: 620, y: 960, z: 1.12 }], [F.foryears, { x: 640, y: 940, z: 1.16 }]] },
    { from: F.foryears, to: F.wrongQ, tr: "flash", render: () => <S9_DNA f={f} />, cam: [[F.foryears, { x: 540, y: 1000, z: 1.2 }], [F.mother, { x: 540, y: 760, z: 1.08 }], [F.y2024, { x: 540, y: 520, z: 1.15 }], [F.man, { x: 540, y: 820, z: 1.1 }], [F.related + 10, { x: 540, y: 960, z: 1.04 }], [F.wrongQ, { x: 540, y: 980, z: 1.1 }]] },
    { from: F.wrongQ, to: TOTAL + 1, tr: "whipUp", render: () => <S10_End f={f} />, cam: [[F.wrongQ, { x: 540, y: 1060, z: 1.1 }], [F.some, { x: 600, y: 1000, z: 1.12 }], [F.guessed, { x: 540, y: 900, z: 1.08 }], [F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.thousand, 0.1], [F.y79, 0.12], [F.erupted, 0.1], [F.hundreds, 0.12], [F.no, 0.14], [F.seventeen, 0.12], [F.y1863, 0.12], [F.appeared, 0.08], [F.twist, 0.1], [F.y2024, 0.12], [F.man, 0.12], [F.guessed, 0.12]];
  const SHAKE: [number, number][] = [[F.erupted, 16], [F.wave + 20, 10], [F.no, 10], [F.man, 8], [F.guessed, 10]];
  const SFX: Cue[] = [
    ...ASKS.map(([a]) => [a - 3, "pop", 0.4] as Cue),
    [ASKS[0][0] + 4, "tick", 0.3],
    [F.y79 - 2, "pop", 0.3], [F.vesuvius, "pop", 0.3], [F.erupted - 6, "boom", 0.55], [F.pompeii, "pop", 0.35],
    [F.many - 10, "whoosh", 0.3], [F.escaped, "pop", 0.35], [F.wave - 4, "riser_dark", 0.35], [F.hundreds - 10, "tick", 0.3], [F.kmh, "impact", 0.35],
    [F.no, "impact", 0.5], [F.killed + 6, "pop", 0.3],
    [F.buried, "pop", 0.3], [F.buried - 6, "riser_dark", 0.25], [F.meters - 10, "tick", 0.3], [F.forgotten, "whoosh", 0.3], [F.seventeen - 10, "tick", 0.3], [F.seventeen + 20, "boom", 0.35],
    [F.y1863, "pop", 0.35], [F.archaeologist, "pop", 0.3], [F.hollow, "pop", 0.35], [F.poured - 14, "whoosh", 0.3], [F.plaster, "pop", 0.3], [F.appeared, "riser", 0.3],
    [F.twist, "impact", 0.45], [F.mother - 6, "pop", 0.35], [F.y2024, "boom", 0.35], [F.dna - 10, "riser", 0.25], [F.man - 2, "impact", 0.5], [F.related - 2, "pop", 0.4],
    [F.froze - 4, "pop", 0.3], [F.guessed, "impact", 0.5],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.many ? "#e8762f" : f < F.y1863 ? RED : f < F.wrongQ ? "#7b5cff" : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="POMPEII" sub="A CITY FROZEN IN ASH" until={F.y79 - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="pompeii" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
