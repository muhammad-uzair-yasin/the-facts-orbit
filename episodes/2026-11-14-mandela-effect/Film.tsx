import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (word start frames from words.ts)
const F = {
  ask: 17, never: 85, askEnd: 107, called: 132, mandela: 147, effect: 159, in2009: 185, writer: 202, fiona: 229, found: 256,
  lots: 279, clearly: 311, remembered: 328, nelson: 351, dying: 382, prison: 401, the80s: 430,
  wait: 463, waitEnd: 517, no: 535, walked: 565, free: 579, y1990: 595, president: 621, africa: 659, died: 704, y2013: 727,
  okay: 763, okayEnd: 821, tryThis: 839, starWars: 875, vader: 892, says: 911, luke: 921, father: 948, right: 962, obviously: 992, obvEnd: 1015,
  never2: 1038, real: 1078, noI: 1100, father2: 1123, monopoly: 1143, noMon: 1174, monocle: 1180, ever: 1209, pikachu: 1239, tail: 1256, noTip: 1275, black: 1281, tip: 1293,
  why: 1322, whyEnd: 1406, because: 1424, brain: 1442, record: 1462, video: 1495, rebuilds: 1519, every: 1540, fills: 1564, gaps: 1579, feels: 1602, right2: 1611,
  rich: 1633, should: 1652, have: 1665, monocle2: 1676, so: 1704, adds: 1727, in2022: 1765, scientists: 1777, chicago: 1805, misremember: 1860, famous: 1902, images: 1916, exact: 1962, sameway: 1972,
  lying: 2008, lyingEnd: 2057, notLying: 2075, guessing: 2107, very: 2137, confidently: 2146, sub: 2188,
};
const BG0 = "#1a1440", BG1 = "#2c2366", TEAL = "#2ec4b6", PINK = "#ff6fae", RED = "#ff4b5c", GREEN = "#3ddc97", PAPER = "#fff8ec", BOARD = "#b88a5a";
const INFL = CAST[33], DET = CAST[3];
const FIONA: PersonDef = { ...CAST[31], name: "Fiona", prop: "laptop" };
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);

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
const Bg: React.FC<{ f: number; id: string }> = ({ f, id }) => (
  <g>
    <defs><radialGradient id={id} cx="50%" cy="40%" r="75%"><stop offset="0" stopColor={BG1} /><stop offset="1" stopColor={BG0} /></radialGradient></defs>
    <rect width={VW} height={VH} fill={`url(#${id})`} />
    {[...Array(14)].map((_, i) => {
      const x = rnd("fx" + i) * VW, y = ((rnd("fy" + i) * VH - f * (0.3 + rnd("fs" + i) * 0.5)) % VH + VH) % VH;
      return <rect key={i} x={x} y={y} width={60 + rnd("fw" + i) * 50} height={44 + rnd("fh" + i) * 30} rx={6} fill="none" stroke="#fff" strokeWidth={3} opacity={0.06 + 0.05 * Math.sin(f * 0.05 + i)} transform={`rotate(${rnd("fr" + i) * 30 - 15} ${x} ${y})`} />;
    })}
  </g>
);
/** Detective office: corkboard with photos + red strings; asker left, detective right. */
const Office: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; hostWave?: number; children?: React.ReactNode }> = ({ f, askMood, hostWave = 0, children }) => (
  <g>
    <rect width={VW} height={VH} fill="#1f2a44" />
    {[...Array(8)].map((_, i) => <rect key={i} x={i * 140} y={0} width={70} height={1460} fill="#22304d" />)}
    <rect x={120} y={340} width={840} height={520} rx={14} fill={BOARD} stroke="#6b4a2b" strokeWidth={16} />
    {[[200, 400, -4], [420, 380, 3], [650, 410, -2], [820, 420, 5], [260, 630, 4], [520, 640, -3], [760, 650, 2]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <rect x={-62} y={0} width={124} height={150} fill={PAPER} stroke="#2a2a2a" strokeWidth={3} />
        <rect x={-50} y={12} width={100} height={88} fill={["#9fb4d8", "#d8b49f", "#b4d89f", "#d89fc4", "#c4c4c4", "#9fd8d0", "#d8d09f"][i]} />
        <text y={128} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill="#444">{["1980s?", "PRISON?", "1990", "VADER?", "MONOCLE?", "TAIL?", "2013"][i]}</text>
        <circle cy={4} r={9} fill={RED} />
      </g>
    ))}
    <path d="M200 404 L420 384 L650 414 L820 424 M260 634 L520 644 L760 654 M420 384 L520 644" stroke={RED} strokeWidth={4} fill="none" />
    <rect y={1460} width={VW} height={VH - 1460} fill="#141c30" />
    <P d={INFL} f={f} x={300} y={1500} s={1.04} seed={33} talk={askTalk(f)} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy")} />
    <P d={DET} f={f} x={790} y={1500} s={1.02} seed={3} talk={hostTalk(f)} mood="happy" wave={hostWave} />
    {children}
  </g>
);
/** MEMORY ✗ / REALITY ✓ card. */
const Card: React.FC<{ x: number; y: number; w: number; h: number; ok: boolean; lines: string[]; p: number; fs?: number; rot?: number; flip?: number }> = ({ x, y, w, h, ok, lines, p, fs = 58, rot = 0, flip = 1 }) => {
  if (p <= 0) return null;
  const hue = ok ? GREEN : RED;
  return (
    <g opacity={clamp01(p * 2)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${clamp01(p) * flip} ${clamp01(p)})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} rx={26} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={PAPER} stroke={INKC} strokeWidth={8} />
      <rect x={-w / 2} y={-h / 2} width={w} height={84} rx={26} fill={hue} stroke={INKC} strokeWidth={8} />
      <rect x={-w / 2 + 4} y={-h / 2 + 50} width={w - 8} height={30} fill={hue} />
      <text y={-h / 2 + 60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INKC} letterSpacing={6}>{ok ? "REALITY ✓" : "MEMORY ✗"}</text>
      {lines.map((l, i) => <text key={i} y={-h / 2 + 84 + (h - 84) / 2 + (i - (lines.length - 1) / 2) * fs * 1.15 + fs * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC}>{l}</text>)}
    </g>
  );
};
/** Generic top-hat rich man silhouette (not any brand mascot). */
const TopHat: React.FC<{ x: number; y: number; s: number; monocle?: number; ghostMonocle?: number }> = ({ x, y, s, monocle = 0, ghostMonocle = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 360 Q-150 170 0 160 Q150 170 150 360 Z" fill="#2a2f4a" stroke="#c9d0ff" strokeWidth={6} />
    <path d="M-30 168 L0 205 L30 168 L0 185 Z" fill="#c9d0ff" />
    <circle cx={0} cy={60} r={95} fill="#2a2f4a" stroke="#c9d0ff" strokeWidth={6} />
    <rect x={-120} y={-38} width={240} height={22} rx={8} fill="#2a2f4a" stroke="#c9d0ff" strokeWidth={6} />
    <rect x={-72} y={-170} width={144} height={136} rx={8} fill="#2a2f4a" stroke="#c9d0ff" strokeWidth={6} />
    <path d="M-60 92 Q-30 70 0 92 Q30 70 60 92 Q30 104 0 96 Q-30 104 -60 92 Z" fill="#c9d0ff" />
    <line x1={190} y1={170} x2={190} y2={360} stroke="#c9d0ff" strokeWidth={10} strokeLinecap="round" />
    <path d="M190 170 Q190 140 160 140" stroke="#c9d0ff" strokeWidth={10} fill="none" strokeLinecap="round" />
    {ghostMonocle > 0 && <circle cx={38} cy={40} r={30} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="10 8" opacity={ghostMonocle} />}
    {monocle > 0 && (
      <g opacity={clamp01(monocle)} transform={`translate(38 40) scale(${monocle})`}>
        <circle r={30} fill="#bfe6ff" fillOpacity={0.35} stroke={YEL} strokeWidth={8} />
        <path d="M24 18 Q50 80 30 140" stroke={YEL} strokeWidth={4} fill="none" />
      </g>
    )}
  </g>
);
const Brain: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.02 * Math.sin(f * 0.15))})`}>
    <path d="M-120 20 Q-150 -60 -80 -90 Q-60 -140 0 -120 Q60 -150 90 -100 Q160 -80 130 0 Q160 60 90 80 Q40 120 -20 90 Q-90 120 -110 60 Q-150 50 -120 20 Z" fill="#ff9fc4" stroke={INKC} strokeWidth={8} />
    <path d="M0 -118 Q-10 -40 10 0 Q-10 50 0 88 M-80 -60 Q-40 -50 -50 -10 M60 -70 Q30 -30 70 -10 M-70 30 Q-30 40 -40 70 M60 30 Q90 50 70 70" stroke="#d45a8a" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const ThoughtCloud: React.FC<{ x: number; y: number; w: number; text: string; p: number; fs?: number }> = ({ x, y, w, text, p, fs = 30 }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${clamp01(p)})`}>
    {[[-w * 0.32, 0, 0.4], [0, -16, 0.5], [w * 0.32, 0, 0.4]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={w * r * 0.6} fill="#fff" />)}
    <rect x={-w / 2} y={-30} width={w} height={64} rx={30} fill="#fff" />
    <circle cx={-10} cy={60} r={10} fill="#fff" /><circle cx={-20} cy={84} r={6} fill="#fff" />
    <text y={fs * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC}>{text}</text>
  </g>
);
const Icon: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-70} r={40} fill={c} stroke={INKC} strokeWidth={5} />
    <path d="M-62 50 Q-62 -20 0 -20 Q62 -20 62 50 Z" fill={c} stroke={INKC} strokeWidth={5} />
  </g>
);

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <Office f={f}>
    <Bubble f={f} a={36} b={F.askEnd} x={300} y={1020} text={"NEVER\nHAPPENED?!"} dx={110} fs={84} />
  </Office>
);
const S2_Name: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(f, F.mandela - 2, 12);
  return (
    <g>
      <Bg f={f} id="mdBg2" />
      <g opacity={clamp01(t)} transform={`translate(540 520) scale(${t}) rotate(-3)`}>
        <rect x={-380} y={-140} width={760} height={280} rx={30} fill={YEL} stroke={INKC} strokeWidth={10} />
        <text y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC} letterSpacing={8}>THE</text>
        <text y={74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={INKC}>MANDELA EFFECT</text>
      </g>
      <BigNum f={f} at={F.in2009 - 2} text="2009" x={540} y={900} hue={TEAL} fs={150} />
      {/* writer at her laptop */}
      <P d={FIONA} f={f} x={330} y={1500} s={1.0} seed={31} mood="happy" />
      {f >= F.fiona - 2 && (
        <g opacity={clamp01(pop(f, F.fiona - 2, 10))} transform="translate(760 1120) rotate(2)">
          <rect x={-200} y={-80} width={400} height={160} rx={18} fill={PAPER} stroke={INKC} strokeWidth={7} />
          <text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INKC}>FIONA BROOME</text>
          <text y={48} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#7a5a2b" letterSpacing={4}>WRITER</text>
        </g>
      )}
      <Chip x={420} y={1040} w={320} label="FOUND..." hue={PINK} p={pop(f, F.found, 10)} fs={40} textColor={INKC} />
    </g>
  );
};
const S3_Crowd: React.FC<{ f: number }> = ({ f }) => {
  const N = 15;
  return (
    <g>
      <Bg f={f} id="mdBg3" />
      {[...Array(N)].map((_, i) => {
        const r = Math.floor(i / 5), c = i % 5;
        const x = 140 + c * 200 + (r % 2) * 40, y = 960 + r * 220;
        const p = clamp01(pop(f, F.lots - 6 + i * 3, 10));
        return <g key={i} opacity={p}><Icon x={x} y={y} s={0.9 * p} c={["#7d86b8", "#b87d9a", "#7db8a4", "#b8a47d"][i % 4]} />
          {i % 2 === 0 && r > 0 && f >= F.dying + (i % 5) * 3 && <ThoughtCloud x={x + 40} y={y - 160} w={170} text="PRISON!" p={pop(f, F.dying + (i % 5) * 3, 10)} fs={30} />}
        </g>;
      })}
      <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.lots, 10)}>LOTS OF PEOPLE</text>
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={PINK} stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.clearly, 10)}>CLEARLY REMEMBERED:</text>
      <Card x={540} y={640} w={820} h={250} ok={false} lines={["MANDELA DIED IN", "PRISON — 1980s"]} p={pop(f, F.nelson, 12)} fs={54} rot={-2} />
    </g>
  );
};
const S4_Wait: React.FC<{ f: number }> = ({ f }) => (
  <Office f={f} askMood="surprised" hostWave={f > F.no - 4 ? 1 : 0}>
    <Bubble f={f} a={F.wait} b={F.waitEnd} x={300} y={1020} text={"WAIT...\nDIDN'T HE?!"} dx={110} fs={80} />
    {f >= F.no - 2 && <BigNum f={f} at={F.no - 2} text="NO!" x={760} y={980} hue={RED} fs={170} />}
  </Office>
);
const S5_Timeline: React.FC<{ f: number }> = ({ f }) => {
  const line = eio(ramp(f, F.walked - 10, F.y2013 + 10));
  const nodes: [number, string, string, string, number][] = [[400, "1990", "WALKED FREE", TEAL, F.y1990 - 4], [900, "1994", "PRESIDENT", YEL, F.president], [1400, "2013", "DIED", "#c9c2ff", F.y2013 - 4]];
  return (
    <g>
      <Bg f={f} id="mdBg5" />
      <line x1={540} y1={300} x2={540} y2={lerp(300, 1560, line)} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
      {nodes.map(([y, yr, lab, hue, at], i) => {
        const p = clamp01(pop(f, at, 12));
        return (
          <g key={i}>
            <circle cx={540} cy={y} r={28 * p} fill={hue} stroke={INKC} strokeWidth={6} />
            <g opacity={p} transform={`translate(${i % 2 ? 300 : 780} ${y}) scale(${p})`}>
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={hue} stroke={INKC} strokeWidth={8} paintOrder="stroke">{yr}</text>
              <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" letterSpacing={3}>{lab}</text>
            </g>
            {/* icons */}
            <g opacity={p} transform={`translate(${i % 2 ? 780 : 300} ${y})`}>
              {i === 0 && <g><rect x={-80} y={-90} width={160} height={180} rx={10} fill="none" stroke="#9aa4b2" strokeWidth={8} />{[-40, 0, 40].map((bx) => <line key={bx} x1={bx} y1={-90} x2={bx - 30 * eio(ramp(f, F.free - 4, F.free + 10))} y2={90} stroke="#9aa4b2" strokeWidth={8} />)}<path d="M-20 0 L40 0 M20 -20 L40 0 L20 20" stroke={TEAL} strokeWidth={10} fill="none" strokeLinecap="round" transform={`translate(${60 * eio(ramp(f, F.free, F.free + 16))} 0)`} /></g>}
              {i === 1 && <g><rect x={-70} y={-10} width={140} height={100} rx={8} fill="#6b4a2b" stroke={INKC} strokeWidth={6} /><line x1={60} y1={-10} x2={60} y2={-120} stroke="#ddd" strokeWidth={6} /><path d="M60 -120 H140 V-60 H60 Z" fill={YEL} stroke={INKC} strokeWidth={4} /><path d="M60 -100 H140 M60 -80 H140" stroke={GREEN} strokeWidth={8} /></g>}
              {i === 2 && <g><rect x={-30} y={-40} width={60} height={120} rx={8} fill={PAPER} stroke={INKC} strokeWidth={5} /><path d="M0 -44 Q-20 -70 0 -100 Q20 -70 0 -44 Z" fill="#ffb13b" opacity={0.7 + 0.3 * Math.sin(f * 0.3)} /></g>}
            </g>
          </g>
        );
      })}
      <text x={540} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={GREEN} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.walked - 6, 10) * (1 - ramp(f, F.y1990 - 6, F.y1990 + 4))}>WHAT REALLY HAPPENED</text>
    </g>
  );
};
const S6_Mix: React.FC<{ f: number }> = ({ f }) => (
  <Office f={f} askMood={f < F.tryThis ? "neutral" : "surprised"} hostWave={f > F.tryThis - 6 ? 1 : 0}>
    <Bubble f={f} a={F.okay} b={F.okayEnd} x={300} y={1020} text={"JUST ONE\nMIX-UP!"} dx={110} fs={80} />
    {f >= F.tryThis - 2 && <Chip x={760} y={960} w={340} label="TRY THIS..." hue={YEL} p={pop(f, F.tryThis - 2, 10)} fs={44} textColor={INKC} />}
  </Office>
);
const S7_Quote: React.FC<{ f: number }> = ({ f }) => {
  const flip = f < F.never2 ? 1 : Math.abs(Math.cos(clamp01((f - F.never2 - 20) / 14) * Math.PI));
  const showReal = f >= F.never2 + 27;
  const words = ["LUKE,", "I AM", "YOUR", "FATHER."];
  const wAt = [F.luke, 932, 940, F.father];
  const shownW = words.map((w, i) => (f >= wAt[i] - 2 ? w : ""));
  return (
    <g>
      <Bg f={f} id="mdBg7" />
      {/* plain title card (text only, no logo) */}
      <g opacity={pop(f, F.starWars - 2, 10)}>
        <rect x={250} y={250} width={580} height={120} rx={20} fill="#000" stroke="#fff" strokeWidth={4} />
        <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" letterSpacing={12}>STAR WARS</text>
      </g>
      <text x={540} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#c9c2ff" opacity={pop(f, F.vader, 10)}>THE VILLAIN SAYS...</text>
      {!showReal ? (
        <g transform={`translate(540 760) scale(${flip} 1) translate(-540 -760)`}>
          <Card x={540} y={760} w={860} h={430} ok={false} lines={[]} p={pop(f, F.says, 12)} />
          {f >= F.says && <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={INKC}>{"“" + shownW.slice(0, 2).filter(Boolean).join(" ")}</text>}
          <text x={540} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={INKC}>{shownW.slice(2).filter(Boolean).join(" ") + (f >= F.father ? "”" : "")}</text>
        </g>
      ) : (
        <g transform={`translate(540 760) scale(${flip} 1) translate(-540 -760)`}>
          <Card x={540} y={760} w={860} h={430} ok={true} lines={[]} p={1} />
          <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={INKC} opacity={f >= F.noI - 2 ? 1 : 0.15}>“<tspan fill={GREEN} stroke={INKC} strokeWidth={3} paintOrder="stroke">NO,</tspan> I AM</text>
          <text x={540} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={INKC} opacity={f >= F.father2 - 2 ? 1 : 0.15}>YOUR FATHER.”</text>
        </g>
      )}
      {f >= F.never2 && f < F.never2 + 27 && <Stamp f={f} at={F.never2} x={540} y={760} text="NEVER SAID" hue={RED} fs={84} rot={-10} />}
      <P d={INFL} f={f} x={240} y={1500} s={0.86} seed={33} talk={askTalk(f)} mood={f >= F.never2 ? "surprised" : "happy"} />
      <P d={DET} f={f} x={850} y={1500} s={0.84} seed={3} talk={hostTalk(f)} mood="happy" />
      <Bubble f={f} a={F.obviously} b={F.obvEnd} x={240} y={1100} text={"OBVIOUSLY!"} dx={140} fs={80} />
      {f >= F.right - 2 && f < F.obviously && <Chip x={790} y={1150} w={240} label="RIGHT?" hue={YEL} p={pop(f, F.right - 2, 10)} fs={44} textColor={INKC} />}
    </g>
  );
};
const S8_Mono: React.FC<{ f: number }> = ({ f }) => {
  const ghost = f >= F.noMon - 4 ? 1 - ramp(f, F.noMon, F.monocle + 8) : 0.9 * ramp(f, F.monopoly + 6, F.monopoly + 16);
  return (
    <g>
      <Bg f={f} id="mdBg8" />
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.monopoly - 4, 10) * (1 - ramp(f, F.pikachu - 10, F.pikachu))}>THE MONOPOLY MAN?</text>
      <TopHat x={540} y={500} s={1.1} ghostMonocle={ghost} />
      {f >= F.noMon - 2 && <Chip x={540} y={980} w={460} label="NO MONOCLE ✓" hue={GREEN} p={pop(f, F.noMon - 2, 10)} fs={44} textColor={INKC} />}
      <Stamp f={f} at={F.ever} x={790} y={420} text="EVER." hue={RED} fs={80} rot={12} />
      {/* tail colour swatches (generic shapes) */}
      <text x={540} y={1180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.pikachu - 4, 10)}>PIKACHU'S TAIL TIP?</text>
      {f >= F.tail - 4 && (
        <g>
          <g opacity={clamp01(pop(f, F.tail - 4, 10))} transform="translate(300 1340)">
            <rect x={-170} y={-60} width={340} height={120} rx={20} fill={PAPER} stroke={RED} strokeWidth={8} />
            <rect x={-130} y={-22} width={200} height={44} rx={10} fill="#ffd93b" stroke={INKC} strokeWidth={4} />
            <rect x={70} y={-22} width={60} height={44} rx={10} fill="#111" stroke={INKC} strokeWidth={4} />
            <text y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={RED}>MEMORY ✗</text>
          </g>
          <g opacity={clamp01(pop(f, F.noTip - 2, 10))} transform="translate(780 1340)">
            <rect x={-170} y={-60} width={340} height={120} rx={20} fill={PAPER} stroke={GREEN} strokeWidth={8} />
            <rect x={-130} y={-22} width={260} height={44} rx={10} fill="#ffd93b" stroke={INKC} strokeWidth={4} />
            <text y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={GREEN}>REALITY ✓</text>
          </g>
          {f >= F.black && <Chip x={540} y={1480} w={420} label="NO BLACK TIP" hue={YEL} p={pop(f, F.black, 10)} fs={42} textColor={INKC} />}
        </g>
      )}
    </g>
  );
};
const S9_Why: React.FC<{ f: number }> = ({ f }) => (
  <Office f={f} askMood="surprised">
    <Bubble f={f} a={F.why} b={F.whyEnd} x={300} y={1020} text={"WHY THE\nSAME WAY?!"} dx={110} fs={80} />
  </Office>
);
const S10_Puzzle: React.FC<{ f: number }> = ({ f }) => {
  const cols = 3, rows = 3, sz = 190, x0 = 540 - (cols * sz) / 2, y0 = 820;
  const gap = 4;
  const filled = eio(ramp(f, F.feels - 4, F.feels + 10));
  return (
    <g>
      <Bg f={f} id="mdBg10" />
      <Brain x={540} y={360} s={1.1} f={f} />
      {f >= F.record - 2 && f < F.rebuilds - 4 && (
        <g opacity={clamp01(pop(f, F.record - 2, 10))} transform="translate(540 820)">
          <rect x={-170} y={-100} width={240} height={200} rx={24} fill="#3a4266" stroke="#fff" strokeWidth={8} />
          <path d="M80 -60 L170 -110 V110 L80 60 Z" fill="#3a4266" stroke="#fff" strokeWidth={8} />
          <circle cx={-50} cy={0} r={50} fill="none" stroke="#fff" strokeWidth={8} />
          <line x1={-220} y1={-150} x2={220} y2={150} stroke={RED} strokeWidth={20} strokeLinecap="round" opacity={clamp01(pop(f, F.video - 4, 8))} />
          <text y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke">NOT A VIDEO</text>
        </g>
      )}
      {f >= F.rebuilds - 4 && (
        <g>
          <rect x={x0 - 20} y={y0 - 20} width={cols * sz + 40} height={rows * sz + 40} rx={20} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="20 14" opacity={0.6} />
          {[...Array(cols * rows)].map((_, i) => {
            const c = i % cols, r = Math.floor(i / cols), gapPiece = i === 4;
            const at = F.rebuilds - 4 + i * 4;
            const t = eout(ramp(f, at, at + 14));
            const tx = x0 + c * sz, ty = y0 + r * sz;
            const sx = 540, sy = 420;
            if (gapPiece) {
              if (f < F.gaps - 4) return null;
              return (
                <g key={i}>
                  <rect x={tx + gap} y={ty + gap} width={sz - gap * 2} height={sz - gap * 2} rx={14} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="14 10" opacity={0.6 + 0.4 * Math.sin(f * 0.3)} />
                  {filled > 0 && <g opacity={filled} transform={`translate(${tx + sz / 2} ${ty + sz / 2}) scale(${0.6 + 0.4 * filled})`}><rect x={-sz / 2 + gap} y={-sz / 2 + gap} width={sz - gap * 2} height={sz - gap * 2} rx={14} fill={YEL} stroke={INKC} strokeWidth={5} /><text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={INKC}>?</text></g>}
                </g>
              );
            }
            return (
              <g key={i} opacity={t > 0 ? 1 : 0} transform={`translate(${lerp(sx, tx + sz / 2, t)} ${lerp(sy, ty + sz / 2, t)}) rotate(${(1 - t) * (i * 40 - 160)}) scale(${0.4 + 0.6 * t})`}>
                <rect x={-sz / 2 + gap} y={-sz / 2 + gap} width={sz - gap * 2} height={sz - gap * 2} rx={14} fill={mix(TEAL, PINK, ((c + r) % 4) / 4)} stroke={INKC} strokeWidth={5} />
                <circle cx={sz / 2 - gap} cy={0} r={22} fill={mix(TEAL, PINK, ((c + r) % 4) / 4)} stroke={INKC} strokeWidth={5} />
              </g>
            );
          })}
          <text x={540} y={1450} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.rebuilds, 10) * (1 - ramp(f, F.fills - 6, F.fills))}>REBUILT EVERY TIME</text>
          {f >= F.gaps - 4 && <text x={540} y={1450} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.gaps - 4, 10) * (1 - ramp(f, F.feels - 6, F.feels))}>GAPS...</text>}
          {f >= F.feels - 2 && <Chip x={540} y={1490} w={460} label="FILLED: FEELS RIGHT" hue={YEL} p={pop(f, F.feels - 2, 10)} fs={38} textColor={INKC} />}
        </g>
      )}
    </g>
  );
};
const S11_Adds: React.FC<{ f: number }> = ({ f }) => {
  const mon = pop(f, F.adds - 2, 14);
  return (
    <g>
      <Bg f={f} id="mdBg11" />
      <TopHat x={620} y={650} s={1.05} monocle={f >= F.adds - 2 ? mon : 0} />
      <Brain x={230} y={520} s={0.6} f={f} />
      <ThoughtCloud x={540} y={300} w={420} text={'"SHOULD" HAVE...'} p={pop(f, F.should - 2, 10)} fs={40} />
      {f >= F.rich - 2 && <Chip x={600} y={1100} w={420} label="RICH + OLD MAN" hue="#c9d0ff" p={pop(f, F.rich - 2, 10)} fs={40} textColor={INKC} />}
      {f >= F.monocle2 - 2 && f < F.adds - 4 && <text x={600} y={1240} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.monocle2 - 2, 10)}>= MONOCLE?</text>}
      {f >= F.adds - 2 && (
        <g>
          <path d={`M300 500 Q ${lerp(300, 560, eio(ramp(f, F.adds - 14, F.adds)))} 420 650 690`} stroke={YEL} strokeWidth={8} fill="none" strokeDasharray="16 12" opacity={0.8} />
          <Stamp f={f} at={F.adds} x={560} y={1240} text="BRAIN ADDED IT" hue={YEL} fs={60} rot={-6} />
        </g>
      )}
    </g>
  );
};
const S12_Chicago: React.FC<{ f: number }> = ({ f }) => {
  const same = f >= F.exact - 2;
  return (
    <g>
      <Bg f={f} id="mdBg12" />
      <BigNum f={f} at={F.in2022 - 2} text="2022" x={540} y={360} hue={TEAL} fs={170} />
      {f >= F.chicago - 2 && <Chip x={540} y={470} w={560} label="UNIVERSITY OF CHICAGO" hue={PINK} p={pop(f, F.chicago - 2, 10)} fs={36} textColor={INKC} />}
      {[...Array(9)].map((_, i) => {
        const c = i % 3, r = Math.floor(i / 3);
        const x = 220 + c * 320, y = 820 + r * 270;
        const p = clamp01(pop(f, F.scientists + i * 3, 10));
        const cp = clamp01(pop(f, F.misremember + i * 2, 10));
        return (
          <g key={i} opacity={p}>
            <Icon x={x - 75} y={y + 60} s={0.7} c={["#7d86b8", "#b87d9a", "#7db8a4"][i % 3]} />
            <g opacity={cp} transform={`translate(${x + 50} ${y - 10}) scale(${cp}) rotate(${same ? 0 : (rnd("cr" + i) - 0.5) * 20})`}>
              <rect x={-70} y={-55} width={140} height={110} rx={12} fill={PAPER} stroke={same ? RED : INKC} strokeWidth={same ? 7 : 4} />
              <path d="M-40 -15 Q-40 -40 -14 -40 H14 Q40 -40 40 -15 V10 H-40 Z" fill="#2a2f4a" />
              <circle cx={14} cy={-14} r={11} fill="none" stroke={YEL} strokeWidth={4} />
              <text y={42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={RED}>{same ? "✗ SAME" : "✗"}</text>
            </g>
          </g>
        );
      })}
      {f >= F.famous - 2 && f < F.exact - 4 && <Chip x={540} y={640} w={440} label="FAMOUS IMAGES" hue={YEL} p={pop(f, F.famous - 2, 10)} fs={40} textColor={INKC} />}
      {same && <Stamp f={f} at={F.sameway - 2} x={540} y={640} text="SAME MISTAKE" hue={RED} fs={76} rot={-6} />}
    </g>
  );
};
const S13_Lying: React.FC<{ f: number }> = ({ f }) => {
  const meter = eio(ramp(f, F.very - 4, F.confidently + 20));
  return (
    <Office f={f} askMood={f < F.notLying ? "surprised" : "happy"} hostWave={f >= F.notLying - 4 && f < F.guessing ? 1 : 0}>
      <rect x={100} y={320} width={880} height={560} rx={20} fill="#0f1426" opacity={0.75 * ramp(f, F.notLying - 6, F.notLying + 4)} />
      <Bubble f={f} a={F.lying} b={F.lyingEnd} x={300} y={1020} text={"MY MEMORY\nIS LYING?!"} dx={110} fs={78} />
      {f >= F.notLying - 2 && (
        <g opacity={clamp01(pop(f, F.notLying - 2, 10))} transform="translate(540 440)">
          <rect x={-200} y={-55} width={400} height={110} rx={55} fill="#3a4266" stroke="#fff" strokeWidth={5} />
          <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff">LYING</text>
          <line x1={-150} y1={0} x2={lerp(-150, 150, eout(ramp(f, F.notLying + 4, F.notLying + 14)))} y2={0} stroke={RED} strokeWidth={14} strokeLinecap="round" />
        </g>
      )}
      {f >= F.guessing - 2 && (
        <g>
          <Chip x={540} y={610} w={460} label="GUESSING..." hue={YEL} p={pop(f, F.guessing - 2, 10)} fs={52} textColor={INKC} />
        </g>
      )}
      {f >= F.very - 6 && (
        <g opacity={clamp01(pop(f, F.very - 6, 10))} transform="translate(540 800)">
          <rect x={-300} y={-28} width={600} height={56} rx={28} fill="#141c30" stroke="#fff" strokeWidth={5} />
          <rect x={-292} y={-20} width={584 * meter} height={40} rx={20} fill={meter > 0.95 ? GREEN : TEAL} />
          <text y={-46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff" letterSpacing={3}>CONFIDENCE {Math.round(meter * 100)}%</text>
        </g>
      )}
    </Office>
  );
};
const S14_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Bg f={f} id="mdBg14" />
    <rect y={1460} width={VW} height={VH - 1460} fill="#141c30" />
    <Outro f={f} at={F.sub} />
    <P d={DET} f={f} x={180} y={1500} s={0.82} seed={3} talk={hostTalk(f)} wave={1} mood="happy" />
    <P d={INFL} f={f} x={900} y={1500} s={0.84} seed={33} wave={1} mood="happy" />
  </g>
);

export const MandelaFilm: React.FC = () => {
  const f = useCurrentFrame();
  const dlg = (a: number, b: number): [number, { x: number; y: number; z: number; r?: number }][] => [[a, { x: 400, y: 1080, z: 1.16 }], [a + 50, { x: 440, y: 1060, z: 1.1 }], [b, { x: 600, y: 1040, z: 1.12 }]];
  const SHOTS: Shot[] = [
    { from: 0, to: F.called - 4, render: () => <S1_Ask f={f} />, cam: [[0, { x: 540, y: 900, z: 1.0 }], [F.ask + 30, { x: 420, y: 1060, z: 1.12 }], [F.called, { x: 440, y: 1060, z: 1.16 }]] },
    { from: F.called - 4, to: F.lots - 6, tr: "whip", render: () => <S2_Name f={f} />, cam: [[F.called - 4, { x: 540, y: 560, z: 1.3 }], [F.effect + 10, { x: 540, y: 620, z: 1.2 }], [F.in2009 + 6, { x: 540, y: 900, z: 1.08 }], [F.fiona, { x: 560, y: 1080, z: 1.12 }], [F.lots, { x: 540, y: 1060, z: 1.18 }]] },
    { from: F.lots - 6, to: F.wait - 4, tr: "zoom", render: () => <S3_Crowd f={f} />, cam: [[F.lots - 6, { x: 540, y: 1100, z: 1.2 }], [F.remembered, { x: 540, y: 1000, z: 1.05 }], [F.nelson + 10, { x: 540, y: 760, z: 1.1 }], [F.wait, { x: 540, y: 820, z: 1.04 }]] },
    { from: F.wait - 4, to: F.walked - 6, tr: "wipe", render: () => <S4_Wait f={f} />, cam: [[F.wait - 4, { x: 380, y: 1080, z: 1.2 }], [F.no - 6, { x: 420, y: 1060, z: 1.14 }], [F.no + 4, { x: 640, y: 1040, z: 1.12 }], [F.walked, { x: 620, y: 1040, z: 1.16 }]] },
    { from: F.walked - 6, to: F.okay - 4, tr: "push", render: () => <S5_Timeline f={f} />, cam: [[F.walked - 6, { x: 540, y: 420, z: 1.25 }], [F.y1990 + 10, { x: 540, y: 520, z: 1.12 }], [F.president + 10, { x: 540, y: 960, z: 1.12 }], [F.y2013 + 6, { x: 540, y: 1300, z: 1.12 }], [F.okay, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.okay - 4, to: F.starWars - 6, tr: "iris", render: () => <S6_Mix f={f} />, cam: dlg(F.okay - 4, F.starWars) },
    { from: F.starWars - 6, to: F.monopoly - 6, tr: "flash", render: () => <S7_Quote f={f} />, cam: [[F.starWars - 6, { x: 540, y: 400, z: 1.3 }], [F.says, { x: 540, y: 760, z: 1.12 }], [F.right, { x: 540, y: 900, z: 1.05 }], [F.never2, { x: 540, y: 780, z: 1.12 }], [F.father2 + 10, { x: 540, y: 820, z: 1.06 }], [F.monopoly, { x: 540, y: 800, z: 1.1 }]] },
    { from: F.monopoly - 6, to: F.why - 4, tr: "whipUp", render: () => <S8_Mono f={f} />, cam: [[F.monopoly - 6, { x: 540, y: 600, z: 1.2 }], [F.noMon, { x: 540, y: 640, z: 1.12 }], [F.ever + 6, { x: 600, y: 600, z: 1.16 }], [F.pikachu, { x: 540, y: 1180, z: 1.12 }], [F.why, { x: 540, y: 1200, z: 1.08 }]] },
    { from: F.why - 4, to: F.because - 4, tr: "zoom", render: () => <S9_Why f={f} />, cam: dlg(F.why - 4, F.because) },
    { from: F.because - 4, to: F.rich - 6, tr: "iris", render: () => <S10_Puzzle f={f} />, cam: [[F.because - 4, { x: 540, y: 420, z: 1.3 }], [F.record, { x: 540, y: 700, z: 1.1 }], [F.rebuilds + 20, { x: 540, y: 900, z: 1.06 }], [F.gaps, { x: 540, y: 1100, z: 1.2 }], [F.rich, { x: 540, y: 1060, z: 1.12 }]] },
    { from: F.rich - 6, to: F.in2022 - 6, tr: "wipe", render: () => <S11_Adds f={f} />, cam: [[F.rich - 6, { x: 540, y: 900, z: 1.04 }], [F.should + 10, { x: 540, y: 600, z: 1.12 }], [F.adds - 4, { x: 600, y: 760, z: 1.15 }], [F.in2022, { x: 560, y: 860, z: 1.08 }]] },
    { from: F.in2022 - 6, to: F.lying - 4, tr: "flash", render: () => <S12_Chicago f={f} />, cam: [[F.in2022 - 6, { x: 540, y: 420, z: 1.3 }], [F.chicago + 10, { x: 540, y: 600, z: 1.12 }], [F.misremember, { x: 540, y: 1000, z: 1.05 }], [F.exact, { x: 540, y: 920, z: 1.0 }], [F.lying, { x: 540, y: 900, z: 1.1 }]] },
    { from: F.lying - 4, to: F.sub, tr: "push", render: () => <S13_Lying f={f} />, cam: [[F.lying - 4, { x: 400, y: 1080, z: 1.16 }], [F.notLying - 4, { x: 440, y: 1000, z: 1.08 }], [F.guessing, { x: 540, y: 900, z: 1.04 }], [F.sub, { x: 540, y: 960, z: 1.08 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "spin", render: () => <S14_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.mandela, 0.12], [F.in2009, 0.1], [F.nelson, 0.08], [F.no - 2, 0.14], [F.y1990, 0.08], [F.y2013, 0.08], [F.father, 0.08], [F.never2, 0.12], [F.noI, 0.12], [F.ever, 0.12], [F.black, 0.08], [F.feels, 0.08], [F.adds, 0.14], [F.in2022, 0.1], [F.sameway, 0.12], [F.guessing, 0.08], [F.confidently, 0.08]];
  const SHAKE: [number, number][] = [[F.no - 2, 10], [F.never2, 10], [F.ever, 10], [F.adds, 8], [F.sameway, 10]];
  const SFX: Cue[] = [
    [34, "pop", 0.45], [F.mandela - 2, "boom", 0.4], [F.in2009 - 2, "pop", 0.4], [F.fiona - 2, "pop", 0.35], [F.found, "tick", 0.3],
    [F.lots - 6, "pop", 0.3], [F.remembered, "tick", 0.3], [F.nelson, "impact", 0.4],
    [F.wait - 2, "pop", 0.45], [F.no - 2, "impact", 0.5], [F.walked - 6, "whoosh", 0.3], [F.y1990 - 4, "pop", 0.4], [F.president, "pop", 0.4], [F.y2013 - 4, "pop", 0.4],
    [F.okay - 2, "pop", 0.45], [F.tryThis - 2, "pop", 0.35], [F.says, "pop", 0.35], [F.luke - 2, "tick", 0.3], [F.father, "tick", 0.3], [F.right - 2, "pop", 0.3], [F.obviously - 2, "pop", 0.45],
    [F.never2, "impact", 0.45], [F.never2 + 20, "whoosh", 0.35], [F.noI - 2, "boom", 0.4],
    [F.monopoly - 4, "pop", 0.35], [F.noMon - 2, "pop", 0.4], [F.ever, "impact", 0.45], [F.tail - 4, "pop", 0.35], [F.noTip - 2, "pop", 0.35], [F.black, "tick", 0.3],
    [F.why - 2, "pop", 0.45], [F.record - 2, "pop", 0.35], [F.video - 4, "impact", 0.35], [F.rebuilds - 4, "riser", 0.25], [F.gaps - 4, "tick", 0.35], [F.feels - 2, "pop", 0.4],
    [F.rich - 2, "pop", 0.3], [F.should - 2, "pop", 0.35], [F.adds - 2, "boom", 0.4],
    [F.in2022 - 2, "pop", 0.4], [F.chicago - 2, "pop", 0.35], [F.famous - 2, "tick", 0.3], [F.exact - 30, "riser", 0.25], [F.sameway - 2, "impact", 0.45],
    [F.lying - 2, "pop", 0.45], [F.notLying, "whoosh", 0.3], [F.guessing - 2, "pop", 0.4], [F.very - 6, "riser", 0.25],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < F.okay ? YEL : f < F.because ? PINK : f < F.lying ? TEAL : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="MANDELA" sub="WHY MILLIONS REMEMBER WRONG" until={34} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="mandela" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
