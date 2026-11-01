import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, blinkAt, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, Drift, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames = start frame of the word in words.ts
const F = {
  ask: 17, askEnd: 89, did: 107, name: 135, hachiko: 159, tokyo: 191, y1924: 222, professor: 262, ueno: 312, adopted: 321, fluffy: 340, akita: 353, puppy: 364,
  every: 386, evening: 396, waited: 423, shibuya: 452, station: 465,
  aww: 497, awwEnd: 514, everyQ: 523, everyQEnd: 558, everyDay: 576, until: 607, may: 629, y1925: 644, collapsed: 694, never: 741, home: 759,
  ohno: 787, ohnoEnd: 805, what: 818, whatEnd: 868, nextEve: 886, station2: 929, next1: 950, next2: 982,
  nine: 1014, months: 1048, showed: 1078, train: 1111, arrived: 1119, nineQ: 1149, nineQEnd: 1176,
  first: 1194, shooed: 1220, newspaper: 1255, story: 1291, japan: 1317, love: 1351, y1934: 1380, built: 1411, bronze: 1437, statue: 1453, there: 1479, see: 1515,
  stopQ: 1545, stopQEnd: 1589, only: 1607, march: 1627, y1935: 1641, passed: 1675, today: 1715, remains: 1744, beside: 1764, grave: 1798, together: 1818, sub: 1862,
};
const CREAM = "#f1d9b0", CREAM2 = "#e0b98a", WHITE = "#fffaf0", BRONZE = "#8a6236", BRONZE2 = "#a8804a", SAKURA = "#ffb7cf", BRICK = "#b5654a";
const ASKER = CAST[12], HOST = CAST[9], UENO = CAST[35];
const COMMUTER: PersonDef = { ...CAST[17], name: "Commuter", prop: "none", hat: "cap", hatC: "#2c3550" };
const COMMUTER2: PersonDef = { ...CAST[16], name: "Commuter2", prop: "none", topC: "#5a3a6a" };
const say = (who: string) => (f: number) => talkFor(f, who, SPK, ENV);
const askT = say("asker"), hostT = say("host");

// ---------- shared pieces ----------
const Bubble: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string; tx: number; ty: number; hue?: string; fs?: number }> = ({ f, a, b, x, y, text, tx, ty, hue = YEL, fs = 72 }) => {
  if (f < a - 3 || f > b + 14) return null;
  const s = pop(f, a - 3, 10) * (1 - eio(ramp(f, b + 6, b + 14)));
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * fs * 0.66 + 100;
  const h = lines.length * fs * 1.08 + 64;
  const bx = Math.max(-w / 2 + 60, Math.min(w / 2 - 60, tx - x));
  const wob = Math.sin((f - a) * 0.22) * 1.6;
  const tail = `M${bx - 34} ${h / 2 - 6} L${tx - x} ${ty - y} L${bx + 34} ${h / 2 - 6} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob}) scale(${Math.max(0, s)})`}>
      <g transform="translate(10 12)" opacity={0.3}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="#000000" /><path d={tail} fill="#000000" /></g>
      <path d={tail} fill={hue} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill={hue} stroke={INKC} strokeWidth={9} />
      <path d={`M${bx - 30} ${h / 2 - 9} L${bx + 30} ${h / 2 - 9}`} stroke={hue} strokeWidth={12} />
      {lines.map((l, i) => <text key={i} y={(i - (lines.length - 1) / 2) * fs * 1.08 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC} letterSpacing={1}>{l}</text>)}
    </g>
  );
};
const Who: React.FC<{ d: PersonDef; f: number; x: number; y: number; s: number; seed: number; talk?: number; mood?: "happy" | "neutral" | "surprised"; wave?: number; rot?: number; op?: number }> = ({ d, f, x, y, s, seed, talk = 0, mood = "neutral", wave = 0, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood} />
  </g>
);
/** Akita dog (custom SVG). pose sit|stand|walk, dir 1 = facing right. mood happy shows tongue, sad droops brows + ears. */
const Dog: React.FC<{ f: number; x: number; y: number; s: number; dir?: number; pose?: "sit" | "stand" | "walk"; mood?: "happy" | "neutral" | "sad"; pup?: boolean; bronze?: boolean; snow?: number; look?: number; wag?: number }> = ({ f, x, y, s, dir = 1, pose = "sit", mood = "neutral", pup, bronze, snow = 0, look = 0, wag = 0.5 }) => {
  const body = bronze ? BRONZE : CREAM, light = bronze ? BRONZE2 : WHITE, dark = bronze ? "#5a3e1e" : CREAM2;
  const ink = bronze ? "#3a2810" : INKC;
  const blink = bronze ? 1 : blinkAt(f, 7);
  const tw = bronze ? 0 : Math.sin(f * (0.25 + wag * 0.35)) * 10 * wag;
  const sad = mood === "sad";
  const hs = pup ? 1.35 : 1;
  const legSw = pose === "walk" ? Math.sin(f * 0.35) * 18 : 0;
  const head = (hx: number, hy: number) => (
    <g transform={`translate(${hx} ${hy}) rotate(${look + (sad ? 10 : 0)}) scale(${hs})`}>
      <path d={`M-42 -26 L-36 ${sad ? -78 : -96} L4 -46 Z`} fill={body} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M-2 -44 L${sad ? 36 : 26} ${sad ? -86 : -102} L46 -34 Z`} fill={body} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M6 -48 L24 -86 L36 -42 Z" fill={bronze ? dark : "#f2b8a8"} />
      <ellipse cx={0} cy={-10} rx={58} ry={52} fill={body} stroke={ink} strokeWidth={6} />
      <ellipse cx={-12} cy={10} rx={30} ry={22} fill={light} />
      <ellipse cx={40} cy={10} rx={42} ry={29} fill={light} stroke={ink} strokeWidth={5} />
      <ellipse cx={78} cy={0} rx={12} ry={10} fill={ink} />
      <ellipse cx={16} cy={-18} rx={7} ry={Math.max(1, 8 * blink)} fill={ink} />
      {!bronze && <circle cx={18} cy={-21} r={2.2} fill="#ffffff" opacity={blink > 0.5 ? 1 : 0} />}
      {sad && <path d="M2 -36 L28 -30" stroke={ink} strokeWidth={5} strokeLinecap="round" />}
      <path d="M66 22 q -14 12 -30 2" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      {mood === "happy" && !bronze && <path d={`M44 24 q 4 ${18 + Math.sin(f * 0.4) * 4} 16 0 Z`} fill="#ff7a8a" stroke={ink} strokeWidth={3} />}
      {snow > 0 && <path d="M-50 -48 Q 0 -78 50 -50 Q 0 -60 -50 -48 Z" fill="#ffffff" opacity={snow} />}
    </g>
  );
  const tail = (tx: number, ty: number) => (
    <g transform={`translate(${tx} ${ty}) rotate(${tw})`}>
      <path d="M0 0 q -54 -34 -26 -86 q 34 -40 66 -4 q 18 30 -14 40" stroke={ink} strokeWidth={36} fill="none" strokeLinecap="round" />
      <path d="M0 0 q -54 -34 -26 -86 q 34 -40 66 -4 q 18 30 -14 40" stroke={body} strokeWidth={24} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      {pose === "sit" ? (
        <g>
          {tail(-62, -110)}
          <ellipse cx={-35} cy={-60} rx={70} ry={60} fill={body} stroke={ink} strokeWidth={6} />
          <path d="M-70 -70 Q -82 -176 4 -204 Q 76 -214 80 -132 L 74 -20 L 6 -12 Z" fill={body} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M44 -196 Q 90 -150 74 -36 L 42 -36 Q 54 -120 22 -182 Z" fill={light} />
          <ellipse cx={-14} cy={-8} rx={44} ry={13} fill={body} stroke={ink} strokeWidth={5} />
          <rect x={22} y={-96} width={26} height={96} rx={12} fill={body} stroke={ink} strokeWidth={5} />
          <rect x={54} y={-96} width={26} height={96} rx={12} fill={light} stroke={ink} strokeWidth={5} />
          {snow > 0 && <path d="M-80 -110 Q -60 -200 10 -206 Q -40 -180 -60 -110 Z" fill="#ffffff" opacity={snow} />}
          {head(44, -218)}
        </g>
      ) : (
        <g>
          {tail(-92, -150)}
          {[-70, -40].map((lx, i) => <rect key={i} x={lx} y={-120} width={26} height={120} rx={12} fill={i ? body : dark} stroke={ink} strokeWidth={5} transform={`rotate(${(i ? 1 : -1) * legSw} ${lx + 13} -110)`} />)}
          {[40, 68].map((lx, i) => <rect key={i} x={lx} y={-120} width={26} height={120} rx={12} fill={i ? light : dark} stroke={ink} strokeWidth={5} transform={`rotate(${(i ? -1 : 1) * legSw} ${lx + 13} -110)`} />)}
          <ellipse cx={0} cy={-128} rx={108} ry={52} fill={body} stroke={ink} strokeWidth={6} />
          <ellipse cx={74} cy={-118} rx={34} ry={36} fill={light} />
          {head(104, -196)}
        </g>
      )}
    </g>
  );
};
const Sky: React.FC<{ id: string; top: string; bot: string }> = ({ id, top, bot }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect width={VW} height={VH} fill={`url(#${id})`} />
  </g>
);
/** Present-day park where grandpa tells the story. dusk 0..1 */
const Park: React.FC<{ f: number; dusk?: number; children?: React.ReactNode }> = ({ f, dusk = 0, children }) => (
  <g>
    <Sky id={dusk > 0.5 ? "parkD" : "parkS"} top={mix("#ffb88a", "#2a2a5a", dusk)} bot={mix("#ffe9c2", "#c88a8a", dusk)} />
    <circle cx={800} cy={760} r={110} fill="#fff1c9" opacity={1 - dusk * 0.6} />
    {dusk > 0 && [...Array(14)].map((_, i) => <circle key={i} cx={rnd("ps" + i) * VW} cy={rnd("py" + i) * 600 + 120} r={2 + rnd("pr" + i) * 2} fill="#ffffff" opacity={dusk * (0.5 + 0.5 * Math.sin(f * 0.1 + i))} />)}
    {[[120, 1180, 150], [960, 1160, 170], [380, 1200, 110]].map(([x, y, r], i) => (
      <g key={i}>
        <rect x={x - 14} y={y - 40} width={28} height={220} fill="#6b4a2a" />
        <circle cx={x} cy={y - 80} r={r} fill={mix("#ff9fbf", "#7a4a6a", dusk)} stroke={INKC} strokeWidth={5} />
        <circle cx={x - r * 0.4} cy={y - 120} r={r * 0.55} fill={mix("#ffc4d6", "#8a5a7a", dusk)} />
      </g>
    ))}
    <rect x={0} y={1340} width={VW} height={VH - 1340} fill={mix("#7dbb6a", "#3a5a3a", dusk)} />
    <path d="M0 1480 Q 540 1420 1080 1480 V1920 H0 Z" fill={mix("#c9a86a", "#5a4a3a", dusk)} />
    <rect x={0} y={1600} width={VW} height={VH - 1600} fill="#3a2e24" />
    {/* lamp post */}
    <rect x={530} y={980} width={18} height={420} fill="#2a2a34" />
    <circle cx={539} cy={970} r={34} fill={dusk > 0.3 ? "#ffe9a8" : "#f4f1ea"} stroke={INKC} strokeWidth={5} />
    {dusk > 0.3 && <circle cx={539} cy={970} r={120} fill="#ffe9a8" opacity={0.25 * dusk} />}
    <Drift f={f} n={14} color={SAKURA} seed="petal" maxR={6} speed={-0.6} area={[0, 0, VW, 1400]} opacity={0.8} />
    {children}
  </g>
);
const Station: React.FC<{ f: number; season?: number; night?: number; children?: React.ReactNode }> = ({ f, season = 0, night = 0, children }) => {
  // season: 0 summer, 1 autumn, 2 winter, 3 spring
  const leaf = ["#4aa04a", "#e8792a", "#e8eef4", "#ff9fbf"][season];
  const skyT = mix(["#8fc8ea", "#f0a868", "#b8c8d8", "#a8d8f0"][season], "#1a1f3a", night);
  const skyB = mix(["#e8f6ff", "#ffd9a8", "#eef2f6", "#fff0f6"][season], "#4a3a5a", night);
  return (
    <g>
      <Sky id={`st${season}${night > 0.5 ? "n" : "d"}`} top={skyT} bot={skyB} />
      {/* building */}
      <rect x={140} y={640} width={800} height={660} fill={mix(BRICK, "#4a2a2a", night * 0.6)} stroke={INKC} strokeWidth={8} />
      <path d="M100 650 L540 470 L980 650 Z" fill={mix("#4a5a6a", "#22262f", night * 0.6)} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={540} cy={580} r={60} fill="#fffaf0" stroke={INKC} strokeWidth={6} />
      <line x1={540} y1={580} x2={540} y2={542} stroke={INKC} strokeWidth={6} strokeLinecap="round" />
      <line x1={540} y1={580} x2={568} y2={590} stroke={INKC} strokeWidth={6} strokeLinecap="round" />
      <rect x={250} y={690} width={580} height={86} rx={10} fill="#1f3b70" stroke={INKC} strokeWidth={6} />
      <text x={540} y={750} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill="#ffffff" letterSpacing={8}>SHIBUYA STATION</text>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={200 + i * 190} y={830} width={110} height={150} fill={night > 0.4 ? "#ffd98a" : "#a9d4ea"} stroke={INKC} strokeWidth={5} />)}
      <rect x={420} y={1020} width={240} height={280} fill="#2a1d18" stroke={INKC} strokeWidth={6} />
      {/* tree */}
      <rect x={950} y={940} width={30} height={380} fill="#6b4a2a" />
      <circle cx={965} cy={900} r={130} fill={leaf} stroke={INKC} strokeWidth={5} />
      <circle cx={900} cy={860} r={70} fill={mix(leaf, "#ffffff", 0.2)} />
      <rect x={0} y={1300} width={VW} height={VH - 1300} fill={season === 2 ? "#e8eef4" : "#9a8a76"} />
      <rect x={0} y={1300} width={VW} height={14} fill="#6a5a4a" />
      <rect x={0} y={1580} width={VW} height={VH - 1580} fill="#2e2620" />
      {season === 1 && <Drift f={f} n={22} color="#e8792a" seed="leaf" maxR={7} speed={-1.2} area={[0, 0, VW, 1300]} opacity={0.9} />}
      {season === 2 && <Drift f={f} n={60} color="#ffffff" seed="snow" maxR={5} speed={-1.4} area={[0, 0, VW, 1580]} opacity={0.95} />}
      {season === 3 && <Drift f={f} n={30} color={SAKURA} seed="sak" maxR={6} speed={-0.9} area={[0, 0, VW, 1400]} opacity={0.9} />}
      {children}
    </g>
  );
};
const Train: React.FC<{ x: number; y: number; s?: number; lit?: boolean }> = ({ x, y, s = 1, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={-260} width={900} height={230} rx={30} fill="#3a7a4a" stroke={INKC} strokeWidth={8} />
    <rect x={0} y={-130} width={900} height={22} fill="#e8d8a8" />
    {[...Array(6)].map((_, i) => <rect key={i} x={40 + i * 140} y={-230} width={100} height={80} rx={10} fill={lit ? "#ffe9a8" : "#bfe6ff"} stroke={INKC} strokeWidth={5} />)}
    {[120, 300, 600, 780].map((wx) => <circle key={wx} cx={wx} cy={-20} r={30} fill={INKC} />)}
  </g>
);
const Calendar: React.FC<{ x: number; y: number; s: number; top: string; big: string; small: string; rot?: number; o?: number; hue?: string }> = ({ x, y, s, top, big, small, rot = 0, o = 1, hue = "#d8352a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-170} y={-200} width={340} height={400} rx={18} fill={WHITE} stroke={INKC} strokeWidth={7} />
    <rect x={-170} y={-200} width={340} height={96} rx={18} fill={hue} stroke={INKC} strokeWidth={7} />
    <text y={-134} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#ffffff" letterSpacing={6}>{top}</text>
    <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={big.length > 2 ? 140 : 200} fill={INKC}>{big}</text>
    <text y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#555555" letterSpacing={4}>{small}</text>
  </g>
);
const Hearts: React.FC<{ f: number; at: number; n?: number }> = ({ f, at, n = 14 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const t = (f - at - i * 3) / 60;
      if (t < 0 || t > 1.4) return null;
      const x = 80 + rnd("hx" + i) * 920 + Math.sin(f * 0.1 + i) * 20, y = 1300 - t * 900;
      const s = 0.6 + rnd("hs" + i) * 0.8;
      return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 18 C -40 -10 -30 -42 0 -26 C 30 -42 40 -10 0 18 Z" fill="#ff5a7a" stroke={INKC} strokeWidth={4} opacity={1 - Math.max(0, t - 1) * 2.5} />;
    })}
  </g>
);

// ---------- shots ----------
const S1_Park: React.FC<{ f: number }> = ({ f }) => {
  const ph = pop(f, F.hachiko - 6, 14);
  return (
    <Park f={f}>
      {ph > 0 && (
        <g transform={`translate(540 760) rotate(${-4 + Math.sin(f * 0.04) * 2}) scale(${ph})`}>
          <rect x={-220} y={-220} width={440} height={470} rx={10} fill={WHITE} stroke={INKC} strokeWidth={7} />
          <rect x={-190} y={-190} width={380} height={340} fill="#d9e6c8" />
          <Dog f={f} x={-30} y={140} s={1.05} mood="happy" />
          <text y={215} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={INKC} letterSpacing={6}>HACHIKO</text>
        </g>
      )}
      <Who d={ASKER} f={f} x={250} y={1520} s={1.0} seed={12} talk={askT(f)} mood="neutral" />
      <Who d={HOST} f={f} x={830} y={1520} s={0.92} seed={9} talk={hostT(f)} mood="happy" />
      <Bubble f={f} a={F.ask} b={F.askEnd} x={440} y={940} text={"WAITED\n9 YEARS?"} tx={260} ty={1110} fs={72} />
    </Park>
  );
};
const S2_Puppy: React.FC<{ f: number }> = ({ f }) => {
  const hop = f >= F.puppy ? Math.abs(Math.sin((f - F.puppy) * 0.22)) * 40 : 0;
  return (
    <g>
      <Sky id="s2sky" top="#a8d8f0" bot="#fff4dc" />
      {/* 1920s Tokyo house */}
      <rect x={120} y={760} width={840} height={560} fill="#e8d9b8" stroke={INKC} strokeWidth={8} />
      <path d="M60 780 L540 560 L1020 780 Z" fill="#4a4a58" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <g key={i}><rect x={190 + i * 260} y={860} width={180} height={220} fill="#f4ecd8" stroke={INKC} strokeWidth={5} />{[1, 2].map((k) => <line key={k} x1={190 + i * 260 + k * 60} y1={860} x2={190 + i * 260 + k * 60} y2={1080} stroke="#8a6a4a" strokeWidth={3} />)}<line x1={190 + i * 260} y1={970} x2={370 + i * 260} y2={970} stroke="#8a6a4a" strokeWidth={3} /></g>)}
      <rect x={0} y={1320} width={VW} height={VH - 1320} fill="#8fbf6a" />
      <rect x={0} y={1580} width={VW} height={VH - 1580} fill="#3a4a2a" />
      <g transform={`translate(540 ${lerp(470, 380, eio(ramp(f, F.professor - 6, F.professor + 10)))})`} opacity={1 - ramp(f, F.ueno - 4, F.ueno + 6)}>
        <rect x={-210} y={-60} width={420} height={120} rx={20} fill={WHITE} stroke={INKC} strokeWidth={7} />
        <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={INKC} letterSpacing={6}>TOKYO</text>
        <BigNum f={f} at={F.y1924} text="1924" x={0} y={200} hue={YEL} fs={150} />
      </g>
      <Who d={UENO} f={f} x={380} y={1500} s={0.95} seed={35} mood={f >= F.adopted ? "happy" : "neutral"} />
      {f >= F.ueno && (
        <g transform={`translate(560 1010) scale(${pop(f, F.ueno, 12)})`}>
          <rect x={-250} y={-74} width={500} height={148} rx={20} fill={YEL} stroke={INKC} strokeWidth={6} />
          <text y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC} letterSpacing={3}>PROFESSOR</text>
          <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>HIDESABURO UENO</text>
        </g>
      )}
      {f >= F.adopted - 4 && <Dog f={f} x={lerp(1200, 720, eout(ramp(f, F.adopted - 4, F.fluffy + 6)))} y={1500 - hop} s={0.62} pup dir={-1} pose={f < F.fluffy + 6 ? "walk" : "sit"} mood="happy" wag={1} />}
      {f >= F.fluffy && <Hearts f={f} at={F.fluffy} n={8} />}
      {f >= F.akita && <Chip x={740} y={1150} w={300} label="AKITA PUPPY" hue={CREAM2} textColor={INKC} p={pop(f, F.akita, 10)} fs={38} />}
    </g>
  );
};
const S3_Evening: React.FC<{ f: number }> = ({ f }) => {
  const tr = eout(ramp(f, F.waited, F.shibuya + 10));
  const uenoX = lerp(540, 380, eio(ramp(f, F.shibuya + 10, F.aww)));
  return (
    <Station f={f} night={0.35}>
      <Train x={lerp(1300, 1080, tr)} y={1300} s={0.6} />
      {f >= F.shibuya + 6 && <Who d={UENO} f={f} x={uenoX} y={1450} s={0.85} seed={35} mood="happy" op={ramp(f, F.shibuya + 6, F.shibuya + 16)} />}
      <Dog f={f} x={260} y={1460} s={0.85} mood={f >= F.shibuya + 10 ? "happy" : "neutral"} pose={f >= F.shibuya + 16 ? "stand" : "sit"} wag={f >= F.shibuya + 10 ? 1 : 0.2} />
      {f >= F.evening && <Chip x={540} y={420} w={420} label="EVERY EVENING" hue={YEL} textColor={INKC} p={pop(f, F.evening, 10)} fs={42} />}
      {f >= F.waited && <Chip x={260} y={1110} w={300} label="WAITING..." hue="#ffffff" textColor={INKC} p={pop(f, F.waited, 10)} fs={36} />}
    </Station>
  );
};
const S4_Aww: React.FC<{ f: number }> = ({ f }) => {
  const day = 1 + Math.floor(Math.max(0, f - F.everyDay) / 2.2);
  return (
    <Park f={f} dusk={0.2}>
      {f >= F.everyDay && (
        <g transform={`translate(540 700) scale(${pop(f, F.everyDay, 10)})`}>
          <Calendar x={0} y={0} s={0.9} top="DAY" big={String(Math.min(day, 499))} small="WAITING" />
        </g>
      )}
      <Who d={ASKER} f={f} x={250} y={1520} s={1.0} seed={12} talk={askT(f)} mood={f < F.everyQ ? "happy" : "surprised"} />
      <Who d={HOST} f={f} x={830} y={1520} s={0.92} seed={9} talk={hostT(f)} mood="happy" />
      <Bubble f={f} a={F.aww} b={F.awwEnd} x={420} y={960} text={"AWW ♥"} tx={260} ty={1110} hue="#ffc4d6" fs={84} />
      <Bubble f={f} a={F.everyQ} b={F.everyQEnd} x={450} y={940} text={"EVERY\nSINGLE DAY?"} tx={260} ty={1110} fs={68} />
    </Park>
  );
};
const S5_Collapse: React.FC<{ f: number }> = ({ f }) => {
  const fall = eio(ramp(f, F.collapsed, F.collapsed + 22));
  const dim = ramp(f, F.never - 10, F.never + 20);
  return (
    <g>
      <rect width={VW} height={VH} fill="#d9c9a8" />
      <rect x={140} y={460} width={800} height={480} rx={12} fill="#2a4a3a" stroke="#6b4a2a" strokeWidth={16} />
      <text x={540} y={620} textAnchor="middle" fontFamily="Georgia, serif" fontSize={60} fill="#e8f2ee" opacity={0.85}>LECTURE</text>
      <text x={540} y={700} textAnchor="middle" fontFamily="Georgia, serif" fontSize={40} fill="#e8f2ee" opacity={0.7}>UNIV. OF TOKYO</text>
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#6b4a2a" />
      <rect x={0} y={1580} width={VW} height={VH - 1580} fill="#2e2018" />
      <Calendar x={lerp(540, 880, eio(ramp(f, F.y1925 + 16, F.collapsed - 6)))} y={lerp(760, 300, eio(ramp(f, F.y1925 + 16, F.collapsed - 6)))} s={lerp(1, 0.5, eio(ramp(f, F.y1925 + 16, F.collapsed - 6)))} top="MAY" big="1925" small="TOKYO" o={pop(f, F.may - 4, 12) * (1 - ramp(f, F.never - 12, F.never))} />
      <g transform={`translate(${lerp(420, 470, fall)} 1500) rotate(${-82 * fall}) translate(-420 -1500)`}>
        <Who d={UENO} f={f} x={420} y={1500} s={0.92} seed={35} mood={f >= F.collapsed ? "surprised" : "neutral"} />
      </g>
      <rect width={VW} height={VH} fill="#1a1f3a" opacity={dim * 0.55} />
      {f >= F.never && <Chip x={540} y={420} w={480} label="NEVER CAME HOME" hue="#ffffff" textColor={INKC} p={pop(f, F.never, 10)} fs={42} />}
      {f >= F.home && (
        <g transform={`translate(800 1300) scale(${pop(f, F.home, 12)})`}>
          <circle r={150} fill="#fff1c9" stroke={INKC} strokeWidth={6} />
          <Dog f={f} x={-10} y={110} s={0.62} mood="sad" />
          <text y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC}>?</text>
        </g>
      )}
    </g>
  );
};
const S6_OhNo: React.FC<{ f: number }> = ({ f }) => (
  <Park f={f} dusk={0.55}>
    <Who d={ASKER} f={f} x={250} y={1520} s={1.0} seed={12} talk={askT(f)} mood="surprised" />
    <Who d={HOST} f={f} x={830} y={1520} s={0.92} seed={9} talk={hostT(f)} mood="neutral" />
    <Bubble f={f} a={F.ohno} b={F.ohnoEnd} x={420} y={960} text={"OH NO..."} tx={260} ty={1110} hue="#bfe6ff" fs={84} />
    <Bubble f={f} a={F.what} b={F.whatEnd} x={470} y={940} text={"WHAT DID\nHACHIKO DO?"} tx={260} ty={1110} fs={66} />
  </Park>
);
const S7_Seasons: React.FC<{ f: number }> = ({ f }) => {
  const season = f < F.next1 ? 0 : f < F.next2 ? 1 : 2;
  const calN = f < F.next1 ? 1 : f < F.next2 ? 2 : 3;
  const flip = (at: number) => ramp(f, at - 2, at + 10);
  return (
    <Station f={f} season={season} night={0.25}>
      <Dog f={f} x={300} y={1460} s={0.85} mood="neutral" look={Math.sin(f * 0.05) * 4} snow={season === 2 ? ramp(f, F.next2, F.next2 + 20) : 0} wag={0.15} />
      <g transform="translate(790 400)">
        <Calendar x={0} y={0} s={0.5} top="DAY" big={String(calN)} small="NEXT" hue="#1f3b70" />
        {[F.next1, F.next2].map((at, i) => { const q = flip(at); return q > 0 && q < 1 ? <g key={i} transform={`translate(${q * 60} ${q * 300}) rotate(${q * 40})`} opacity={1 - q}><Calendar x={0} y={0} s={0.5} top="DAY" big={String(i + 1)} small="NEXT" hue="#1f3b70" /></g> : null; })}
      </g>
      {f >= F.station2 && f < F.next1 + 20 && <Chip x={380} y={1110} w={380} label="BACK AT THE STATION" hue={YEL} textColor={INKC} p={pop(f, F.station2, 10)} fs={30} />}
      {f >= F.next1 && <Chip x={420} y={420} w={420} label={season === 1 ? "AND THE NEXT..." : "AND THE NEXT..."} hue="#ffffff" textColor={INKC} p={pop(f, season === 1 ? F.next1 : F.next2, 10)} fs={38} />}
    </Station>
  );
};
const S8_Platform: React.FC<{ f: number }> = ({ f }) => {
  const yrs = countUp(f, F.nine - 2, F.nine + 22, 9), mos = countUp(f, F.months - 8, F.months + 14, 9);
  const tr = eout(ramp(f, F.train - 30, F.arrived + 8));
  const perk = f >= F.train;
  return (
    <g>
      <Sky id="s8sky" top="#ffb07a" bot="#ffe6c2" />
      <rect x={0} y={760} width={VW} height={40} fill="#5a4a3a" />
      {[...Array(6)].map((_, i) => <rect key={i} x={i * 200 + 40} y={600} width={16} height={180} fill="#3a3a48" />)}
      <rect x={0} y={580} width={VW} height={26} fill="#3a3a48" />
      <Train x={lerp(1150, 60, tr)} y={1080} s={1} lit />
      <rect x={0} y={1080} width={VW} height={260} fill="#b8a888" />
      <rect x={0} y={1080} width={VW} height={18} fill={YEL} />
      <rect x={0} y={1340} width={VW} height={VH - 1340} fill="#2e2620" />
      {/* ticket gate */}
      <rect x={640} y={1150} width={30} height={170} fill="#6b4a2a" stroke={INKC} strokeWidth={4} />
      <rect x={900} y={1150} width={30} height={170} fill="#6b4a2a" stroke={INKC} strokeWidth={4} />
      <Dog f={f} x={780} y={1320} s={0.7} dir={-1} pose={perk ? "stand" : "sit"} mood={perk ? "happy" : "neutral"} wag={perk ? 1 : 0.1} look={perk ? -8 : 0} />
      <g transform={`translate(540 340) scale(${pop(f, F.nine - 2, 12)})`} opacity={1 - ramp(f, F.train - 24, F.train - 8)}>
        <rect x={-420} y={-110} width={840} height={220} rx={30} fill={INKC} stroke={YEL} strokeWidth={8} />
        <text x={-200} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={130} fill={YEL}>{yrs}</text>
        <text x={-200} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#ffffff" letterSpacing={4}>YEARS</text>
        <text x={200} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={130} fill={f >= F.months - 8 ? YEL : "#555555"}>{mos}</text>
        <text x={200} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#ffffff" letterSpacing={4}>MONTHS</text>
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#ffffff">+</text>
      </g>
      {f >= F.arrived && <Chip x={780} y={960} w={360} label="RIGHT ON TIME" hue="#3ddc97" textColor={INKC} p={pop(f, F.arrived, 10)} fs={36} />}
      <Who d={ASKER} f={f} x={200} y={1560} s={0.86} seed={12} talk={askT(f)} mood={f >= F.nineQ - 4 ? "surprised" : "neutral"} />
      <Bubble f={f} a={F.nineQ} b={F.nineQEnd + 4} x={420} y={1020} text={"9 YEARS?!"} tx={220} ty={1230} fs={84} />
    </g>
  );
};
const S9_News: React.FC<{ f: number }> = ({ f }) => {
  const np = eout(ramp(f, F.newspaper - 8, F.newspaper + 14));
  const shooX = f < F.newspaper ? 0 : 1;
  return (
    <Station f={f} season={3}>
      <Dog f={f} x={300} y={1460} s={0.85} mood="sad" />
      <Who d={COMMUTER} f={f} x={620} y={1480} s={0.85} seed={17} mood="surprised" op={1 - shooX} />
      <Who d={COMMUTER2} f={f} x={840} y={1480} s={0.85} seed={16} mood="neutral" op={1 - shooX} />
      {f < F.newspaper && <Bubble f={f} a={F.shooed - 4} b={F.newspaper - 12} x={660} y={1000} text={"SHOO!"} tx={640} ty={1100} hue="#ffffff" fs={84} />}
      {np > 0 && (
        <g transform={`translate(540 860) rotate(${(1 - np) * 720 - 4}) scale(${np})`}>
          <rect x={-380} y={-460} width={760} height={920} fill="#f4efe2" stroke={INKC} strokeWidth={8} />
          <text y={-370} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={64} fill={INKC}>TOKYO DAILY</text>
          <line x1={-340} y1={-340} x2={340} y2={-340} stroke={INKC} strokeWidth={5} />
          <text y={-260} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC}>THE LOYAL DOG</text>
          <text y={-200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#555555">STILL WAITING AT SHIBUYA</text>
          <rect x={-300} y={-160} width={600} height={360} fill="#d8d0c0" stroke={INKC} strokeWidth={5} />
          <g filter="url(#newsprint)"><Dog f={f} x={-20} y={180} s={1.0} mood="neutral" /></g>
          {[...Array(6)].map((_, i) => <rect key={i} x={-340} y={240 + i * 32} width={i % 3 === 2 ? 420 : 680} height={14} fill="#bdb6a6" />)}
        </g>
      )}
      {f >= F.love - 4 && <Hearts f={f} at={F.love - 4} n={18} />}
      {f >= F.japan && <Chip x={540} y={1380} w={460} label="ALL OF JAPAN ♥" hue="#ff5a7a" p={pop(f, F.japan, 10)} fs={42} />}
    </Station>
  );
};
const S10_Statue: React.FC<{ f: number }> = ({ f }) => {
  const cloth = eio(ramp(f, F.bronze - 6, F.statue + 10));
  const realIn = eout(ramp(f, F.there - 10, F.there + 16));
  return (
    <Station f={f} season={3}>
      <rect width={VW} height={VH} fill="#ffffff" opacity={0.15} />
      {/* pedestal + statue */}
      <rect x={410} y={1180} width={300} height={140} fill="#9a9a9a" stroke={INKC} strokeWidth={6} />
      <text x={560} y={1265} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#3a3a3a" letterSpacing={4}>HACHIKO</text>
      <Dog f={f} x={560} y={1180} s={0.95} bronze />
      {cloth < 1 && <path d={`M400 ${1180 - 300 + cloth * 300} Q 560 ${1180 - 340 + cloth * 330} 720 ${1180 - 300 + cloth * 300} L 740 1186 L 380 1186 Z`} fill="#c0392b" stroke={INKC} strokeWidth={6} opacity={1 - cloth * 0.3} />}
      {/* crowd */}
      {[...Array(9)].map((_, i) => <circle key={i} cx={60 + i * 120} cy={1540 + (i % 2) * 30} r={60} fill="#3a2a2a" />)}
      <Dog f={f} x={lerp(-200, 240, realIn)} y={1330} s={0.62} pose={realIn < 1 ? "walk" : "sit"} mood="happy" wag={0.4} />
      {f >= F.there + 16 && <Chip x={240} y={1060} w={380} label="HACHIKO WAS THERE" hue={YEL} textColor={INKC} p={pop(f, F.there + 16, 10)} fs={30} />}
      <g transform="translate(540 430)" opacity={1 - ramp(f, F.there - 10, F.there + 4)}>
        <BigNum f={f} at={F.y1934} text="1934" x={0} y={40} hue={YEL} fs={150} />
      </g>
      {f >= F.bronze && <Chip x={540} y={580} w={400} label="BRONZE STATUE" hue={BRONZE2} p={pop(f, F.bronze, 10)} fs={40} />}
    </Station>
  );
};
const S11_Stop: React.FC<{ f: number }> = ({ f }) => {
  const dusk = lerp(0.6, 0.95, ramp(f, F.only, F.passed + 20));
  return (
    <Park f={f} dusk={dusk}>
      {f >= F.march - 4 && (
        <g transform={`translate(540 640) scale(${pop(f, F.march - 4, 12)})`} opacity={1 - ramp(f, F.passed + 30, F.today)}>
          <Calendar x={0} y={0} s={0.85} top="MARCH" big="8" small="1935" hue="#5a5a7a" />
        </g>
      )}
      {f >= F.passed && <circle cx={540} cy={330} r={14 + 4 * Math.sin(f * 0.2)} fill="#fff6c9" opacity={pop(f, F.passed, 20)} />}
      {f >= F.passed && <circle cx={540} cy={330} r={50} fill="#fff6c9" opacity={0.25 * clamp01(pop(f, F.passed, 20))} />}
      <Who d={ASKER} f={f} x={250} y={1520} s={1.0} seed={12} talk={askT(f)} mood="neutral" />
      <Who d={HOST} f={f} x={830} y={1520} s={0.92} seed={9} talk={hostT(f)} mood="neutral" />
      <Bubble f={f} a={F.stopQ} b={F.stopQEnd} x={460} y={940} text={"DID HE EVER\nSTOP WAITING?"} tx={260} ty={1110} fs={62} />
    </Park>
  );
};
const S12_Together: React.FC<{ f: number }> = ({ f }) => {
  const up = eout(ramp(f, F.together - 10, F.together + 30));
  return (
    <g>
      <Sky id="s12sky" top="#ff9a7a" bot="#ffe0b8" />
      <circle cx={540} cy={900} r={180} fill="#fff1c9" opacity={0.9} />
      <Drift f={f} n={36} color={SAKURA} seed="grave" maxR={7} speed={-0.8} area={[0, 0, VW, 1500]} opacity={0.9} />
      <rect x={0} y={1300} width={VW} height={VH - 1300} fill="#8a9a6a" />
      <rect x={0} y={1580} width={VW} height={VH - 1580} fill="#2e3020" />
      {/* graves */}
      <g transform="translate(460 1330)">
        <rect x={-110} y={-380} width={220} height={380} rx={8} fill="#b8b8b0" stroke={INKC} strokeWidth={6} />
        <rect x={-150} y={-30} width={300} height={40} fill="#9a9a92" stroke={INKC} strokeWidth={5} />
        <text y={-280} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#3a3a3a" letterSpacing={4}>PROF.</text>
        <text y={-220} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#3a3a3a" letterSpacing={4}>UENO</text>
      </g>
      <g transform="translate(720 1330)">
        <rect x={-70} y={-180} width={140} height={180} rx={8} fill="#c8c8c0" stroke={INKC} strokeWidth={6} />
        <path d="M0 -60 C -30 -84 -22 -110 0 -96 C 22 -110 30 -84 0 -60 Z" fill="#ff7a8a" stroke={INKC} strokeWidth={3} />
        <text y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#3a3a3a">HACHIKO</text>
      </g>
      {[300, 840].map((x, i) => <g key={i} transform={`translate(${x} 1320)`}>{[0, 1, 2].map((k) => <circle key={k} cx={k * 22 - 22} cy={-20 - k * 6} r={14} fill={["#ff9fbf", YEL, "#ffffff"][k]} stroke={INKC} strokeWidth={3} />)}</g>)}
      {f >= F.beside && <Chip x={590} y={1440} w={360} label="SIDE BY SIDE" hue="#ffffff" textColor={INKC} p={pop(f, F.beside, 10)} fs={38} />}
      {/* reunion in the sky */}
      {up > 0 && (
        <g opacity={up} transform={`translate(0 ${lerp(120, 0, up)})`}>
          <ellipse cx={540} cy={720} rx={420} ry={110} fill="#ffffff" opacity={0.85} />
          <ellipse cx={380} cy={680} rx={180} ry={90} fill="#ffffff" opacity={0.85} />
          <ellipse cx={700} cy={670} rx={200} ry={100} fill="#ffffff" opacity={0.85} />
          <Who d={UENO} f={f} x={460} y={720} s={0.62} seed={35} mood="happy" wave={1} />
          <Dog f={f} x={640} y={720} s={0.55} dir={-1} pose="stand" mood="happy" wag={1} />
          <Hearts f={f} at={F.together} n={8} />
        </g>
      )}
      {f >= F.together && <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={82} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, F.together + 6, 12)}>TOGETHER AGAIN</text>}
    </g>
  );
};
const S13_Outro: React.FC<{ f: number }> = ({ f }) => (
  <Park f={f} dusk={0.3}>
    <rect x={430} y={1250} width={220} height={100} fill="#9a9a9a" stroke={INKC} strokeWidth={5} />
    <Dog f={f} x={540} y={1250} s={0.62} bronze />
    <Outro f={f} at={F.sub} />
    <Who d={HOST} f={f} x={180} y={1520} s={0.86} seed={9} talk={hostT(f)} wave={1} mood="happy" />
    <Who d={ASKER} f={f} x={900} y={1520} s={0.95} seed={12} talk={0} wave={1} mood="happy" />
  </Park>
);

export const HachikoFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.tokyo, render: () => <S1_Park f={f} />, cam: [[0, { x: 460, y: 1150, z: 1.2 }], [F.askEnd, { x: 500, y: 1120, z: 1.12 }], [F.hachiko, { x: 540, y: 900, z: 1.05 }], [F.tokyo, { x: 540, y: 860, z: 1.12 }]] },
    { from: F.tokyo, to: F.every, tr: "whip", render: () => <S2_Puppy f={f} />, cam: [[F.tokyo, { x: 540, y: 560, z: 1.3 }], [F.professor, { x: 460, y: 900, z: 1.12 }], [F.adopted, { x: 540, y: 1100, z: 1.05 }], [F.puppy, { x: 640, y: 1180, z: 1.2 }], [F.every, { x: 600, y: 1150, z: 1.25 }]] },
    { from: F.every, to: F.aww, tr: "iris", render: () => <S3_Evening f={f} />, cam: [[F.every, { x: 540, y: 760, z: 1.15 }], [F.waited, { x: 360, y: 1120, z: 1.2 }], [F.shibuya, { x: 540, y: 1000, z: 1.02 }], [F.aww, { x: 420, y: 1120, z: 1.18 }]] },
    { from: F.aww, to: F.until, tr: "push", render: () => <S4_Aww f={f} />, cam: [[F.aww, { x: 400, y: 1150, z: 1.2 }], [F.everyDay, { x: 540, y: 960, z: 1.04 }], [F.until, { x: 600, y: 940, z: 1.1 }]] },
    { from: F.until, to: F.ohno, tr: "wipe", render: () => <S5_Collapse f={f} />, cam: [[F.until, { x: 540, y: 760, z: 1.25 }], [F.collapsed - 10, { x: 460, y: 1100, z: 1.15 }], [F.never, { x: 540, y: 960, z: 1.0 }], [F.ohno, { x: 700, y: 1150, z: 1.15 }]] },
    { from: F.ohno, to: F.nextEve, tr: "zoom", render: () => <S6_OhNo f={f} />, cam: [[F.ohno, { x: 380, y: 1150, z: 1.25 }], [F.what, { x: 480, y: 1100, z: 1.12 }], [F.nextEve, { x: 540, y: 1080, z: 1.06 }]] },
    { from: F.nextEve, to: F.nine, tr: "iris", render: () => <S7_Seasons f={f} />, cam: [[F.nextEve, { x: 300, y: 1150, z: 1.3 }], [F.station2, { x: 540, y: 960, z: 1.02 }], [F.next1, { x: 600, y: 900, z: 1.1 }], [F.next2, { x: 420, y: 1050, z: 1.15 }], [F.nine, { x: 400, y: 1100, z: 1.22 }]] },
    { from: F.nine, to: F.first, tr: "whipUp", render: () => <S8_Platform f={f} />, cam: [[F.nine, { x: 540, y: 500, z: 1.3 }], [F.months + 14, { x: 540, y: 700, z: 1.1 }], [F.train - 20, { x: 540, y: 960, z: 1.0 }], [F.arrived + 6, { x: 700, y: 1100, z: 1.15 }], [F.nineQ, { x: 420, y: 1160, z: 1.12 }], [F.first, { x: 420, y: 1160, z: 1.16 }]] },
    { from: F.first, to: F.y1934, tr: "spin", render: () => <S9_News f={f} />, cam: [[F.first, { x: 460, y: 1150, z: 1.2 }], [F.shooed, { x: 560, y: 1150, z: 1.15 }], [F.newspaper, { x: 540, y: 900, z: 1.0 }], [F.japan, { x: 540, y: 900, z: 1.06 }], [F.y1934, { x: 540, y: 1000, z: 1.0 }]] },
    { from: F.y1934, to: F.stopQ, tr: "flash", render: () => <S10_Statue f={f} />, cam: [[F.y1934, { x: 540, y: 600, z: 1.3 }], [F.bronze - 10, { x: 560, y: 1000, z: 1.15 }], [F.statue + 10, { x: 520, y: 1050, z: 1.08 }], [F.see, { x: 400, y: 1120, z: 1.15 }], [F.stopQ, { x: 420, y: 1120, z: 1.18 }]] },
    { from: F.stopQ, to: F.today, tr: "push", render: () => <S11_Stop f={f} />, cam: [[F.stopQ, { x: 400, y: 1150, z: 1.2 }], [F.only, { x: 540, y: 960, z: 1.04 }], [F.passed, { x: 540, y: 820, z: 1.12 }], [F.today, { x: 540, y: 760, z: 1.18 }]] },
    { from: F.today, to: F.sub, tr: "zoom", render: () => <S12_Together f={f} />, cam: [[F.today, { x: 560, y: 1150, z: 1.25 }], [F.beside, { x: 580, y: 1150, z: 1.15 }], [F.together - 6, { x: 540, y: 960, z: 1.0 }], [F.sub, { x: 540, y: 820, z: 1.12 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S13_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.hachiko, 0.08], [F.y1924, 0.1], [F.akita, 0.06], [F.shibuya, 0.06], [F.everyQ, 0.06], [F.y1925, 0.08], [F.collapsed + 10, 0.08], [F.what, 0.05], [F.next1, 0.06], [F.next2, 0.06], [F.nine, 0.1], [F.months, 0.1], [F.nineQ, 0.1], [F.newspaper + 14, 0.08], [F.y1934, 0.12], [F.statue, 0.1], [F.y1935, 0.06], [F.together + 6, 0.08]];
  const SHAKE: [number, number][] = [[F.newspaper + 14, 6], [F.statue, 6]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.4], [F.hachiko - 6, "pop", 0.4], [F.tokyo + 4, "pop", 0.3], [F.y1924, "impact", 0.35], [F.ueno, "pop", 0.3], [F.adopted - 4, "whoosh", 0.25], [F.fluffy, "pop", 0.3], [F.akita, "pop", 0.3],
    [F.evening, "pop", 0.3], [F.waited, "tick", 0.3], [F.shibuya - 20, "whoosh", 0.3],
    [F.aww - 3, "pop", 0.4], [F.everyQ - 3, "pop", 0.4], [F.everyDay, "tick", 0.3],
    [F.may - 4, "pop", 0.3], [F.collapsed + 14, "impact", 0.3], [F.never, "tick", 0.3], [F.home, "pop", 0.25],
    [F.ohno - 3, "pop", 0.35], [F.what - 3, "pop", 0.4], [F.station2, "pop", 0.3], [F.next1, "whoosh", 0.25], [F.next2, "whoosh", 0.25],
    [F.nine - 2, "tick", 0.35], [F.months - 8, "tick", 0.35], [F.train - 30, "whoosh", 0.35], [F.arrived, "pop", 0.35], [F.nineQ - 3, "pop", 0.45],
    [F.shooed - 4, "pop", 0.35], [F.newspaper - 8, "whoosh", 0.35], [F.newspaper + 14, "impact", 0.35], [F.love - 4, "pop", 0.3], [F.japan, "pop", 0.3],
    [F.bronze - 6, "whoosh", 0.3], [F.statue, "impact", 0.4], [F.there + 16, "pop", 0.3],
    [F.stopQ - 3, "pop", 0.4], [F.march - 4, "tick", 0.25], [F.beside, "pop", 0.25], [F.together - 10, "riser", 0.25], [F.together + 6, "pop", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.until ? YEL : f < F.first ? "#ff9fbf" : YEL;
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <FontStyle />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="newsprint"><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
      </svg>
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="9 YEARS" sub="A DOG WAITED?" until={F.did - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="hachiko" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
