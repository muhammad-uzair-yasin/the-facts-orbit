import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (start frame of each word, from words.ts WORDS)
const F = {
  ask: 17, askEnd: 101, believed: 119, late: 171, stanford: 217, choice: 286, one: 311, two: 363, fifteen: 400, alone: 423,
  eat: 451, eatEnd: 484, many: 502, others: 533, covered: 544, sang: 575, hands: 591, years: 631, school: 745, average: 762,
  so: 795, soEnd: 836, notfast: 854, y2012: 890, twist: 954, promised: 1025, broke: 1095, mean: 1141, meanEnd: 1162,
  three: 1225, twelve: 1319, sotrust: 1349, sotrustEnd: 1380, matters: 1398, y2018: 1442, bigger: 1453, home: 1519, explained: 1537,
  waiting: 1596, willpower: 1623, believing: 1662, reward: 1681, sub: 1733,
};

const WALL = "#ffe8c4", WALL2 = "#ffd59a", FLOOR = "#e9a96a", PINK = "#ff6fae", GRN = "#2fbf71", RED = "#e8412c", BLUE = "#3d6ccf", WOOD = "#b8743a";
const KID = CAST[44], SCI = CAST[0], TOT = CAST[11], TOT2 = CAST[12], TOT3 = CAST[47], TEACH = CAST[4];
const kidTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const sciTalk = (f: number) => talkFor(f, "host", SPK, ENV);

// ---------- Q&A kit (local) ----------
/** Speech bubble for the asker: pops on the line's first word, leaves when the line ends. Tail points at (tx, ty). */
const Bubble: React.FC<{ f: number; from: number; to: number; x: number; y: number; lines: string[]; tx: number; ty: number; hue?: string; fs?: number; accent?: string }> = ({ f, from, to, x, y, lines, tx, ty, hue = "#ffffff", fs = 74, accent = RED }) => {
  if (f < from - 2 || f > to + 10) return null;
  const p = pop(f, from - 2, 10) * (1 - eio(ramp(f, to + 3, to + 10)));
  const w = Math.max(...lines.map((l) => l.length)) * fs * 0.68 + 90;
  const h = lines.length * fs * 1.1 + 60;
  const cx = Math.min(VW - w / 2 - 36, Math.max(w / 2 + 36, x));
  const bx = Math.min(cx + w / 2 - 70, Math.max(cx - w / 2 + 70, tx));
  const tipX = lerp(bx, tx, 0.55), tipY = lerp(y + h / 2, ty, 0.55);
  const wob = Math.sin(f * 0.12) * 1.5;
  return (
    <g opacity={clamp01(p * 1.5)} transform={`translate(${tipX} ${tipY}) scale(${p}) rotate(${wob}) translate(${-tipX} ${-tipY})`}>
      <rect x={cx - w / 2 + 10} y={y - h / 2 + 12} width={w} height={h} rx={44} fill="#000000" opacity={0.22} />
      <path d={`M${bx - 34} ${y + h / 2 - 6} L${tipX} ${tipY} L${bx + 22} ${y + h / 2 - 6} Z`} fill={hue} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
      <rect x={cx - w / 2} y={y - h / 2} width={w} height={h} rx={44} fill={hue} stroke={INKC} strokeWidth={7} />
      <rect x={bx - 30} y={y + h / 2 - 14} width={48} height={12} fill={hue} />
      {lines.map((l, i) => (
        <text key={i} x={cx} y={y - h / 2 + 30 + fs * 0.86 + i * fs * 1.1} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs}
          fill={/[?!]/.test(l) ? accent : INKC} letterSpacing={1}>{l}</text>
      ))}
    </g>
  );
};
/** Asker (left) + host (right) standing in a dialogue two-shot. */
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; aMood?: "happy" | "neutral" | "surprised"; hWave?: number; aWave?: number }> = ({ f, ax = 270, hx = 800, y = 1500, s = 0.95, aMood, hWave = 0, aWave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s * 1.12})`}><Person d={KID} f={f} seed={45} talk={kidTalk(f)} wave={aWave} mood={aMood ?? (speaking(f, "host", SPK) ? "happy" : "happy")} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={SCI} f={f} seed={7} talk={sciTalk(f)} wave={hWave} mood="happy" /></g>
  </g>
);

// ---------- set pieces ----------
const Room: React.FC<{ f: number; tint?: string; board?: boolean }> = ({ f, tint = WALL, board = true }) => (
  <g>
    <rect width={VW} height={VH} fill={tint} />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130 - 20} y={0} width={60} height={1330} fill={WALL2} opacity={0.35} />)}
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={FLOOR} />
    <rect x={0} y={1316} width={VW} height={22} fill={mix(FLOOR, "#000000", 0.25)} />
    {board && (
      <g>
        <rect x={140} y={420} width={800} height={430} rx={18} fill="#2f5d4a" stroke="#7a4f22" strokeWidth={18} />
        {[0, 1, 2].map((i) => <rect key={i} x={640 + i * 70} y={700} width={46} height={44} rx={14} fill="none" stroke="#f4f1ea" strokeWidth={5} opacity={0.6} />)}
        <path d="M260 640 q 60 -30 120 0 t 120 0" stroke="#f4f1ea" strokeWidth={6} fill="none" opacity={0.5} />
      </g>
    )}
    <g transform="translate(940 230)">
      <circle r={66} fill="#fff" stroke={INKC} strokeWidth={8} />
      <line x1={0} y1={0} x2={Math.sin(f * 0.02) * 44} y2={-Math.cos(f * 0.02) * 44} stroke={INKC} strokeWidth={7} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(f * 0.004) * 30} y2={-Math.cos(f * 0.004) * 30} stroke={INKC} strokeWidth={9} strokeLinecap="round" />
    </g>
  </g>
);
const Marsh: React.FC<{ x: number; y: number; s?: number; bite?: number }> = ({ x, y, s = 1, bite = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-34} y={-58} width={68} height={58} rx={20} fill="#fffaf2" stroke={INKC} strokeWidth={5} />
    <ellipse cx={0} cy={-56} rx={32} ry={12} fill="#ffffff" stroke={INKC} strokeWidth={4} />
    <rect x={-26} y={-40} width={10} height={30} rx={5} fill="#ffe3ef" />
    {bite > 0 && <circle cx={30} cy={-50} r={22 * bite} fill="#ffffff00" stroke="none" />}
  </g>
);
const Plate: React.FC<{ x: number; y: number; n: number; s?: number; gone?: number }> = ({ x, y, n, s = 1, gone = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={92} ry={24} fill="#ffffff" stroke={INKC} strokeWidth={5} />
    <ellipse cx={0} cy={2} rx={62} ry={14} fill="#eef3f8" />
    {[...Array(n)].map((_, i) => (
      <g key={i} opacity={1 - gone} transform={`translate(0 ${-gone * 30})`}>
        <Marsh x={(i - (n - 1) / 2) * 76} y={4} s={1 - gone * 0.6} />
      </g>
    ))}
  </g>
);
const Table: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={34} rx={10} fill={WOOD} stroke={INKC} strokeWidth={6} />
    <rect x={x - w / 2 + 20} y={y + 30} width={w - 40} height={240} fill={mix(WOOD, "#000000", 0.18)} stroke={INKC} strokeWidth={6} />
    <rect x={x - w / 2 + 20} y={y + 30} width={w - 40} height={16} fill="#000000" opacity={0.15} />
  </g>
);
/** Kitchen timer: counts down from `from` seconds, fast. */
const Timer: React.FC<{ f: number; x: number; y: number; s?: number; left: number; total?: number }> = ({ f, x, y, s = 1, left, total = 900 }) => {
  const k = clamp01(left / total);
  const a = k * Math.PI * 2;
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.5) * (left < 60 ? 3 : 0.6)})`}>
      <rect x={-22} y={-132} width={44} height={30} rx={8} fill="#ff8a3d" stroke={INKC} strokeWidth={5} />
      <circle r={110} fill="#fff" stroke={INKC} strokeWidth={9} />
      <path d={`M0 0 L0 -96 A96 96 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * 96} ${-Math.cos(a) * 96} Z`} fill={PINK} opacity={0.85} />
      <circle r={62} fill="#fff" stroke={INKC} strokeWidth={5} />
      <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>{`${mm}:${ss.toString().padStart(2, "0")}`}</text>
    </g>
  );
};
/** Story kid seated behind a table (hands hidden under table edge, own pose drawn on top). */
const SeatedKid: React.FC<{ f: number; d: typeof KID; x: number; y: number; s: number; seed: number; mood?: "happy" | "neutral" | "surprised"; talk?: number; rot?: number }> = ({ f, d, x, y, s, seed, mood = "neutral", talk = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot} 0 -100)`}><Person d={{ ...d, prop: "none" }} f={f} seed={seed} talk={talk} wave={0} mood={mood} /></g>
);
/** Two arms raised so the hands cover the eyes (kid scale 1 coords, origin = feet). */
const CoverEyes: React.FC<{ x: number; y: number; s: number; skin: string; sleeve: string; peek?: number }> = ({ x, y, s, skin, sleeve, peek = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((k) => {
      const d = `M${k * 46} -150 L${k * 92} -210 L${k * (24 + (k > 0 ? peek * 26 : 0))} -312`;
      return (
        <g key={k}>
          <path d={d} stroke={INKC} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} stroke={sleeve} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={k * (24 + (k > 0 ? peek * 26 : 0))} cy={-314} rx={24} ry={20} fill={skin} stroke={INKC} strokeWidth={4} />
        </g>
      );
    })}
  </g>
);
const Notes: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const q = ((f * 0.9 + i * 30) % 90) / 90;
      return (
        <g key={i} opacity={Math.sin(q * Math.PI)} transform={`translate(${x + i * 40 + Math.sin(f * 0.1 + i) * 16} ${y - q * 170})`}>
          <ellipse cx={0} cy={0} rx={15} ry={11} fill={INKC} transform="rotate(-20)" />
          <line x1={13} y1={-2} x2={13} y2={-52} stroke={INKC} strokeWidth={5} />
          <path d="M13 -52 q 18 6 16 26" stroke={INKC} strokeWidth={5} fill="none" />
        </g>
      );
    })}
  </g>
);
const Bar: React.FC<{ x: number; base: number; w: number; h: number; color: string; label: string; val: string; p: number }> = ({ x, base, w, h, color, label, val, p }) => (
  <g>
    <rect x={x - w / 2} y={base - h * p} width={w} height={h * p} rx={16} fill={color} stroke={INKC} strokeWidth={6} />
    <text x={x} y={base - h * p - 26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INKC} opacity={clamp01(p * 3)}>{val}</text>
    <text x={x} y={base + 62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={INKC}>{label}</text>
  </g>
);
const CrayonBox: React.FC<{ x: number; y: number; s?: number; empty?: number }> = ({ x, y, s = 1, empty = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {["#e8412c", "#ff8a3d", "#ffd60a", "#2fbf71", "#3d6ccf", "#8a5cff"].map((c, i) => (
      <g key={i} opacity={1 - empty} transform={`translate(${-75 + i * 30} ${-40 - (i % 2) * 14 - empty * 80})`}>
        <rect x={-11} y={-60} width={22} height={70} fill={c} stroke={INKC} strokeWidth={4} />
        <path d="M-11 -60 L0 -84 L11 -60 Z" fill={c} stroke={INKC} strokeWidth={4} />
      </g>
    ))}
    <rect x={-100} y={-50} width={200} height={130} rx={10} fill="#ffd60a" stroke={INKC} strokeWidth={6} />
    <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>CRAYONS</text>
  </g>
);
const House: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-150} width={240} height={170} fill="#fff4e2" stroke={INKC} strokeWidth={7} />
    <path d="M-150 -140 L0 -270 L150 -140 Z" fill={RED} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-30} y={-80} width={60} height={100} fill={WOOD} stroke={INKC} strokeWidth={6} />
    <rect x={-100} y={-120} width={50} height={46} fill="#9fd8ff" stroke={INKC} strokeWidth={5} />
    <rect x={50} y={-120} width={50} height={46} fill="#9fd8ff" stroke={INKC} strokeWidth={5} />
    <path d="M-20 -200 q 20 -26 40 0 q -20 30 -20 30 q 0 0 -20 -30" fill={PINK} stroke={INKC} strokeWidth={4} />
  </g>
);
/** Balance scale: tilt >0 = right side heavier. */
const Balance: React.FC<{ x: number; y: number; tilt: number; left: string; right: string }> = ({ x, y, tilt, left, right }) => {
  const a = tilt * 16 * Math.PI / 180;
  const L = 300;
  const lx = -Math.cos(a) * L, ly = -Math.sin(a) * L, rx = Math.cos(a) * L, ry = Math.sin(a) * L;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-90 360 H90 L30 320 V0 H-30 V320 Z" fill="#c9a24a" stroke={INKC} strokeWidth={6} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INKC} strokeWidth={14} strokeLinecap="round" />
      <circle r={22} fill="#ffd60a" stroke={INKC} strokeWidth={6} />
      {[[lx, ly, left, BLUE], [rx, ry, right, GRN]].map(([px, py, t, c], i) => (
        <g key={i} transform={`translate(${px} ${py})`}>
          <line x1={-90} y1={130} x2={0} y2={0} stroke={INKC} strokeWidth={4} /><line x1={90} y1={130} x2={0} y2={0} stroke={INKC} strokeWidth={4} />
          <path d="M-120 130 H120 Q 100 170 0 172 Q -100 170 -120 130 Z" fill={c as string} stroke={INKC} strokeWidth={6} />
          <text y={240} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>{t as string}</text>
        </g>
      ))}
    </g>
  );
};

// ---------- shots ----------
/** 1: classroom two-shot, the question. */
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} />
    <Table x={540} y={1260} w={360} />
    <Plate x={540} y={1262} n={1} s={1.1} />
    <Duo f={f} ax={230} hx={830} y={1520} aMood={f < F.believed ? "surprised" : "happy"} />
    <Bubble f={f} from={F.ask} to={F.askEnd} x={430} y={760} lines={["1 CANDY =", "YOUR FUTURE?"]} tx={260} ty={1000} />
    {f >= F.believed && <Chip x={720} y={760} w={520} label="EVERYONE BELIEVED IT" hue={BLUE} p={pop(f, F.believed + 4, 10)} fs={32} />}
  </g>
);
/** 2: Stanford, late 1960s: a kid alone with one marshmallow. */
const S2_Stanford: React.FC<{ f: number }> = ({ f }) => {
  const leave = eio(ramp(f, F.alone - 30, F.alone + 10));
  return (
    <g>
      <Room f={f} tint="#e7f1ff" board={false} />
      <rect x={120} y={360} width={840} height={150} rx={20} fill="#8c1515" stroke={INKC} strokeWidth={7} opacity={pop(f, F.stanford, 12)} />
      <text x={540} y={462} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill="#ffffff" opacity={pop(f, F.stanford, 12)} letterSpacing={4}>STANFORD</text>
      <BigNum f={f} at={F.late + 2} text="LATE 1960s" x={540} y={680} hue={YEL} fs={110} />
      <SeatedKid f={f} d={TOT} x={430} y={1390} s={1.05} seed={11} mood={f > F.alone ? "neutral" : "happy"} />
      <Table x={480} y={1290} w={520} />
      <Plate x={440} y={1292} n={1} s={1.2} />
      <g transform={`translate(${lerp(840, 1300, leave)} 1520) scale(0.95)`}><Person d={SCI} f={f} seed={7} talk={sciTalk(f)} wave={0} mood="happy" /></g>
      {f >= F.alone && <Chip x={430} y={880} w={300} label="ALONE..." hue={INKC} p={pop(f, F.alone + 2, 10)} fs={40} />}
    </g>
  );
};
/** 3: the choice: 1 NOW vs 2 LATER, 15-minute timer. */
const S3_Choice: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(f, F.one, 12), b = pop(f, F.two, 12);
  const left = 900 - Math.max(0, f - F.fifteen - 10) * 6;
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff2dc" />
      {[...Array(14)].map((_, i) => <circle key={i} cx={rnd("c" + i) * VW} cy={rnd("d" + i) * VH} r={30 + rnd("e" + i) * 60} fill={PINK} opacity={0.08} />)}
      <g opacity={clamp01(a)} transform={`translate(290 760) scale(${clamp01(a)})`}>
        <rect x={-210} y={-260} width={420} height={480} rx={40} fill="#ffffff" stroke={INKC} strokeWidth={8} />
        <Plate x={0} y={60} n={1} s={1.5} />
        <text y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={88} fill={INKC}>1</text>
        <text y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED}>NOW</text>
      </g>
      <g opacity={clamp01(b)} transform={`translate(790 760) scale(${clamp01(b)})`}>
        <rect x={-210} y={-260} width={420} height={480} rx={40} fill="#ffffff" stroke={INKC} strokeWidth={8} />
        <Plate x={0} y={60} n={2} s={1.5} />
        <text y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={88} fill={INKC}>2</text>
        <text y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={GRN}>LATER</text>
      </g>
      <g opacity={clamp01(b)}><circle cx={540} cy={1010} r={50} fill={YEL} stroke={INKC} strokeWidth={6} /><text x={540} y={1028} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INKC}>or</text></g>
      {f >= F.fifteen - 2 && (
        <g opacity={clamp01(pop(f, F.fifteen - 2, 12))}>
          <Timer f={f} x={300} y={1290} s={1.15} left={Math.max(0, left)} />
          <BigNum f={f} at={F.fifteen} text="15 MIN" x={720} y={1330} hue={PINK} fs={130} />
        </g>
      )}
      {f >= F.alone && <Chip x={540} y={1490} w={360} label="ALL ALONE..." hue={INKC} p={pop(f, F.alone, 10)} fs={40} />}
    </g>
  );
};
/** 4: "I'd eat it right away." / "Many did." — thought cloud: marshmallow gulped. */
const S4_Eat: React.FC<{ f: number }> = ({ f }) => {
  const gone = eio(ramp(f, F.many + 4, F.many + 18));
  return (
    <g>
      <Room f={f} />
      <Duo f={f} ax={250} hx={830} y={1520} aMood="happy" />
      <Bubble f={f} from={F.eat} to={F.eatEnd} x={360} y={780} lines={["I'D EAT IT", "RIGHT AWAY!"]} tx={260} ty={1020} accent={PINK} />
      {f >= F.many - 2 && (
        <g opacity={pop(f, F.many - 2, 10)}>
          <ellipse cx={660} cy={720} rx={230} ry={170} fill="#ffffff" stroke={INKC} strokeWidth={7} />
          {[0, 1, 2].map((i) => <circle key={i} cx={800 + i * 18} cy={900 + i * 40} r={22 - i * 6} fill="#ffffff" stroke={INKC} strokeWidth={5} />)}
          <Plate x={660} y={780} n={1} s={1.3} gone={gone} />
          {gone > 0.5 && <text x={660} y={690} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={76} fill={RED} transform={`rotate(-6 660 690)`} opacity={pop(f, F.many + 14, 8)}>GULP!</text>}
        </g>
      )}
      {f >= F.many + 16 && <Chip x={660} y={1000} w={360} label="MANY DID" hue={RED} p={pop(f, F.many + 16, 10)} fs={40} />}
    </g>
  );
};
/** 5: coping tricks montage — covered eyes, singing, sat on hands. */
const S5_Cope: React.FC<{ f: number }> = ({ f }) => {
  const panels = [
    { at: F.covered, d: TOT2, label: "COVER EYES", hue: BLUE },
    { at: F.sang, d: TOT, label: "SING", hue: PINK },
    { at: F.hands, d: TOT3, label: "SIT ON HANDS", hue: GRN },
  ];
  const left = 900 - Math.max(0, f - F.covered + 30) * 3;
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff6e8" />
      <Timer f={f} x={540} y={300} s={0.9} left={Math.max(60, left)} />
      {panels.map((p, i) => {
        const q = pop(f, p.at - 4, 12);
        const y0 = 470 + i * 400;
        const wig = i === 2 ? Math.sin(f * 0.45) * 6 : 0;
        return (
          <g key={i} opacity={clamp01(q * 1.4)} transform={`translate(${(1 - clamp01(q)) * (i % 2 ? 300 : -300)} 0)`}>
            <rect x={60} y={y0} width={960} height={370} rx={30} fill={mix(p.hue, "#ffffff", 0.82)} stroke={INKC} strokeWidth={7} />
            <defs><clipPath id={`pan${i}`}><rect x={64} y={y0 + 4} width={952} height={362} rx={26} /></clipPath></defs>
            <g clipPath={`url(#pan${i})`}>
              <SeatedKid f={f} d={p.d} x={300} y={y0 + 380} s={0.82} seed={20 + i} rot={wig} mood={i === 1 ? "happy" : "neutral"} talk={i === 1 ? 0.45 + 0.4 * Math.sin(f * 0.35) : 0} />
              {i === 0 && <CoverEyes x={300} y={y0 + 380} s={0.82} skin={p.d.skin} sleeve={p.d.topC} peek={f % 70 < 14 ? 1 : 0} />}
              {i === 1 && <Notes f={f} x={390} y={y0 + 160} />}
              <rect x={120} y={y0 + 268} width={380} height={110} fill={WOOD} stroke={INKC} strokeWidth={6} />
              <Plate x={300} y={y0 + 270} n={1} s={0.9} />
            </g>
            <text x={730} y={y0 + 205} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC}>{p.label}</text>
          </g>
        );
      })}
    </g>
  );
};
/** 6: years later — school results chart. */
const S6_School: React.FC<{ f: number }> = ({ f }) => {
  const g = eout(ramp(f, F.school - 10, F.school + 24));
  return (
    <g>
      <rect width={VW} height={VH} fill="#eaf4ff" />
      <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={INKC} opacity={pop(f, F.years, 10)}>YEARS LATER...</text>
      <line x1={120} y1={1290} x2={960} y2={1290} stroke={INKC} strokeWidth={8} strokeLinecap="round" />
      <Bar x={330} base={1290} w={220} h={330} color={RED} label="ATE IT" val="" p={g} />
      <Bar x={720} base={1290} w={220} h={560} color={GRN} label="WAITED" val="" p={g} />
      <g opacity={clamp01(g)} transform={`translate(720 ${1290 - 560 * g - 40})`}>
        <path d="M-80 0 L0 -36 L80 0 L0 36 Z" fill="#222222" stroke={INKC} strokeWidth={4} />
        <rect x={-40} y={6} width={80} height={30} fill="#222222" />
        <line x1={60} y1={4} x2={60} y2={50} stroke={YEL} strokeWidth={5} />
      </g>
      <text x={540} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={BLUE} opacity={pop(f, F.school, 10)}>BETTER IN SCHOOL</text>
      {f >= F.average && <Stamp f={f} at={F.average} x={540} y={1490} text="ON AVERAGE" hue={BLUE} fs={64} rot={-6} />}
    </g>
  );
};
/** 7: "So waiting means success?" — "Not so fast." */
const S7_NotFast: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} />
    <Duo f={f} ax={250} hx={830} y={1520} aMood="happy" />
    <Bubble f={f} from={F.so} to={F.soEnd} x={420} y={780} lines={["WAITING =", "SUCCESS?"]} tx={250} ty={1020} />
    {f >= F.notfast && <Stamp f={f} at={F.notfast} x={540} y={990} text="NOT SO FAST" hue={RED} fs={76} rot={-8} />}
  </g>
);
/** 8: 2012 twist — promised better crayons, promise broken. */
const S8_Promise: React.FC<{ f: number }> = ({ f }) => {
  const back = eio(ramp(f, F.broke - 24, F.broke + 4));
  const showBox = f >= F.promised - 4;
  return (
    <g>
      <Room f={f} tint="#fde7f0" board={false} />
      <BigNum f={f} at={F.y2012} text="2012" x={540} y={440} hue={YEL} fs={200} />
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INKC} opacity={pop(f, F.twist, 10)}>THE TWIST</text>
      <SeatedKid f={f} d={TOT2} x={330} y={1390} s={1.05} seed={30} mood={f > F.broke + 6 ? "surprised" : "happy"} />
      <Table x={360} y={1290} w={440} />
      <g transform={`translate(${lerp(800, 860, back)} 1520) scale(1)`}><Person d={{ ...TEACH, prop: "none" }} f={f} seed={9} talk={0} wave={f < F.broke ? 1 : 0} mood={f > F.broke ? "neutral" : "happy"} /></g>
      {showBox && (
        <g opacity={pop(f, F.promised - 4, 12)}>
          <rect x={430} y={640} width={580} height={360} rx={34} fill="#ffffff" stroke={INKC} strokeWidth={7} />
          <path d={`M780 1000 L840 1080 L860 1000 Z`} fill="#ffffff" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
          <rect x={790} y={990} width={60} height={14} fill="#ffffff" />
          <text x={720} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>"I'LL BRING BETTER</text>
          <text x={720} y={768} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>CRAYONS!"</text>
          <CrayonBox x={720} y={930} s={0.95} empty={back} />
        </g>
      )}
      {f >= F.broke && <Stamp f={f} at={F.broke + 2} x={720} y={900} text="BROKEN" hue={RED} fs={92} rot={-12} />}
    </g>
  );
};
/** 9: "That's mean!" + 3 min vs 12 min bars. */
const S9_Bars: React.FC<{ f: number }> = ({ f }) => {
  const a = eout(ramp(f, F.three - 6, F.three + 20)), b = eout(ramp(f, F.twelve - 6, F.twelve + 26));
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff4e6" />
      <text x={540} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={INKC} opacity={pop(f, F.three - 10, 10)}>HOW LONG THEY WAITED</text>
      <line x1={100} y1={1060} x2={980} y2={1060} stroke={INKC} strokeWidth={8} strokeLinecap="round" />
      <Bar x={330} base={1060} w={220} h={120} color={RED} label="PROMISE BROKEN" val={`${countUp(f, F.three - 6, F.three + 20, 3)} MIN`} p={a} />
      <Bar x={760} base={1060} w={220} h={520} color={GRN} label="PROMISE KEPT" val={`${countUp(f, F.twelve - 6, F.twelve + 26, 12)} MIN`} p={b} />
      <g transform="translate(230 1560) scale(0.62)"><Person d={KID} f={f} seed={45} talk={kidTalk(f)} wave={0} mood={f < F.three ? "surprised" : "neutral"} /></g>
      <Bubble f={f} from={F.mean} to={F.meanEnd} x={460} y={1240} lines={["THAT'S MEAN!"]} tx={240} ty={1330} fs={66} />
    </g>
  );
};
/** 10: "So it's about trust?" — TRUST reveal. */
const S10_Trust: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} tint="#e9f8ef" board={false} />
    <Duo f={f} ax={250} hx={830} y={1520} aMood={f < F.matters ? "surprised" : "happy"} />
    <Bubble f={f} from={F.sotrust} to={F.sotrustEnd} x={420} y={760} lines={["IT'S ABOUT", "TRUST?"]} tx={250} ty={1010} />
    {f >= F.matters && (
      <g>
        {"TRUST".split("").map((ch, i) => {
          const q = pop(f, F.matters + i * 3, 10);
          return <text key={i} x={300 + i * 120} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={170} fill={YEL} stroke={INKC} strokeWidth={12} paintOrder="stroke" opacity={clamp01(q)} transform={`translate(0 ${(1 - clamp01(q)) * 60})`}>{ch}</text>;
        })}
        <Chip x={540} y={760} w={420} label="MATTERS A LOT" hue={GRN} p={pop(f, F.matters + 18, 10)} fs={38} />
      </g>
    )}
  </g>
);
/** 11: 2018 — home life explains much of the link; willpower vs believing. */
const S11_Home: React.FC<{ f: number }> = ({ f }) => {
  const tilt = f < F.willpower ? 0 : f < F.believing ? -0.6 * eout(ramp(f, F.willpower, F.willpower + 16)) : lerp(-0.6, 1, eio(ramp(f, F.believing, F.believing + 24)));
  const showScale = f >= F.waiting;
  return (
    <g>
      <rect width={VW} height={VH} fill="#f3ecff" />
      {f < F.waiting && <BigNum f={f} at={F.y2018} text="2018" x={540} y={380} hue={YEL} fs={170} />}
      {f < F.waiting && <g>
        <text x={540} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={INKC} opacity={pop(f, F.bigger, 10)}>BIGGER STUDY</text>
        <g opacity={pop(f, F.home - 4, 12)}><House x={540} y={1020} s={1.4} /></g>
        <Chip x={540} y={1150} w={400} label="HOME LIFE" hue={RED} p={pop(f, F.home, 10)} fs={44} />
        <text x={540} y={1290} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INKC} opacity={pop(f, F.explained, 10)}>EXPLAINED MUCH OF IT</text>
      </g>}
      {showScale && (
        <g opacity={pop(f, F.waiting, 12)}>
          <Balance x={540} y={760} tilt={tilt} left="WILLPOWER" right="TRUST" />
          {f >= F.reward && <Chip x={540} y={1260} w={640} label="THE REWARD WILL COME" hue={GRN} p={pop(f, F.reward, 10)} fs={38} />}
        </g>
      )}
    </g>
  );
};
const S12_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} board={false} />
    <Plate x={540} y={700} n={2} s={1.6} />
    <Outro f={f} at={F.sub} light />
    <g transform="translate(170 1570) scale(0.8)"><Person d={SCI} f={f} seed={7} talk={sciTalk(f)} wave={1} mood="happy" /></g>
    <g transform="translate(910 1570) scale(0.92)"><Person d={KID} f={f} seed={45} talk={0} wave={1} mood="happy" /></g>
  </g>
);

export const MarshmallowFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.late, render: () => <S1_Ask f={f} />, cam: [[0, { x: 460, y: 1040, z: 1.14 }], [F.askEnd, { x: 500, y: 1060, z: 1.1 }], [F.believed + 6, { x: 540, y: 1060, z: 1.05 }], [F.late, { x: 560, y: 1060, z: 1.08 }]] },
    { from: F.late, to: F.one, tr: "whip", render: () => <S2_Stanford f={f} />, cam: [[F.late, { x: 540, y: 700, z: 1.12 }], [F.choice, { x: 540, y: 960, z: 1.0 }], [F.one, { x: 470, y: 1100, z: 1.18 }]] },
    { from: F.one, to: F.eat, tr: "zoom", render: () => <S3_Choice f={f} />, cam: [[F.one, { x: 290, y: 780, z: 1.25 }], [F.two, { x: 540, y: 820, z: 1.08 }], [F.fifteen, { x: 540, y: 1000, z: 1.0 }], [F.eat, { x: 520, y: 1100, z: 1.1 }]] },
    { from: F.eat, to: F.others, tr: "push", render: () => <S4_Eat f={f} />, cam: [[F.eat, { x: 330, y: 1000, z: 1.22 }], [F.many, { x: 560, y: 960, z: 1.06 }], [F.others, { x: 620, y: 920, z: 1.12 }]] },
    { from: F.others, to: F.years, tr: "iris", render: () => <S5_Cope f={f} />, cam: [[F.others, { x: 540, y: 700, z: 1.15 }], [F.sang, { x: 540, y: 900, z: 1.1 }], [F.hands, { x: 540, y: 1000, z: 1.1 }], [F.years, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.years, to: F.so, tr: "wipe", render: () => <S6_School f={f} />, cam: [[F.years, { x: 540, y: 700, z: 1.2 }], [F.school, { x: 540, y: 960, z: 1.02 }], [F.so, { x: 560, y: 1000, z: 1.1 }]] },
    { from: F.so, to: F.y2012, tr: "spin", render: () => <S7_NotFast f={f} />, cam: [[F.so, { x: 340, y: 1000, z: 1.2 }], [F.notfast - 8, { x: 540, y: 980, z: 1.08 }], [F.y2012, { x: 560, y: 940, z: 1.14, r: -2 }]] },
    { from: F.y2012, to: F.mean, tr: "flash", render: () => <S8_Promise f={f} />, cam: [[F.y2012, { x: 540, y: 600, z: 1.25 }], [F.promised, { x: 640, y: 940, z: 1.08 }], [F.broke, { x: 600, y: 1000, z: 1.15 }], [F.mean, { x: 560, y: 1000, z: 1.1, r: 2 }]] },
    { from: F.mean, to: F.sotrust, tr: "whipUp", render: () => <S9_Bars f={f} />, cam: [[F.mean, { x: 460, y: 1150, z: 1.1 }], [F.three, { x: 540, y: 960, z: 1.02 }], [F.twelve, { x: 560, y: 940, z: 1.05 }], [F.sotrust, { x: 580, y: 920, z: 1.1 }]] },
    { from: F.sotrust, to: F.y2018, tr: "zoom", render: () => <S10_Trust f={f} />, cam: [[F.sotrust, { x: 330, y: 1000, z: 1.22 }], [F.matters, { x: 540, y: 900, z: 1.05 }], [F.y2018, { x: 540, y: 860, z: 1.12 }]] },
    { from: F.y2018, to: F.waiting, tr: "whip", render: () => <S11_Home f={f} />, cam: [[F.y2018, { x: 540, y: 520, z: 1.25 }], [F.home, { x: 540, y: 960, z: 1.05 }], [F.waiting, { x: 540, y: 1060, z: 1.14 }]] },
    { from: F.waiting, to: F.sub, tr: "wipe", render: () => <S11_Home f={f} />, cam: [[F.waiting, { x: 380, y: 900, z: 1.2 }], [F.willpower, { x: 400, y: 920, z: 1.15 }], [F.believing, { x: 600, y: 900, z: 1.06 }], [F.sub, { x: 560, y: 980, z: 1.04 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S12_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.two, 0.08], [F.fifteen, 0.1], [F.many + 14, 0.1], [F.average, 0.08], [F.notfast, 0.14], [F.y2012, 0.12], [F.broke + 2, 0.14], [F.three, 0.08], [F.twelve, 0.1], [F.matters, 0.12], [F.y2018, 0.1], [F.believing, 0.1]];
  const SHAKE: [number, number][] = [[F.notfast, 12], [F.broke + 2, 14], [F.matters, 8]];
  const SFX: Cue[] = [
    [F.ask - 2, "pop", 0.4], [F.believed + 4, "pop", 0.3], [F.stanford, "pop", 0.35], [F.late + 2, "impact", 0.35],
    [F.alone - 30, "whoosh", 0.25], [F.one, "pop", 0.4], [F.two, "pop", 0.45], [F.fifteen - 2, "tick", 0.45], [F.fifteen + 14, "tick", 0.35],
    [F.eat - 2, "pop", 0.4], [F.many + 14, "impact", 0.35], [F.covered - 4, "pop", 0.35], [F.sang - 4, "pop", 0.35], [F.hands - 4, "pop", 0.35],
    [F.years, "whoosh", 0.3], [F.school - 10, "riser", 0.25], [F.average, "impact", 0.35],
    [F.so - 2, "pop", 0.4], [F.notfast, "impact", 0.5], [F.promised - 4, "pop", 0.35], [F.broke - 60, "riser_dark", 0.25], [F.broke + 2, "boom", 0.45],
    [F.mean - 2, "pop", 0.4], [F.three - 6, "tick", 0.35], [F.twelve - 6, "riser", 0.3], [F.sotrust - 2, "pop", 0.4], [F.matters, "boom", 0.4],
    [F.home, "pop", 0.35], [F.believing, "impact", 0.4], [F.reward, "pop", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light />
        <Cover f={f} word="MARSHMALLOW" sub="1 CANDY = YOUR FUTURE?" until={F.late - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={PINK} theme="light" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="marshmallow" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
