import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, Drift, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames = start frame of the word in words.ts
const F = {
  ask: 17, askEnd: 98, true: 116, name: 146, yama: 180, aug: 214, y1945: 254, walk: 283, engineer: 314, hiro: 342, trip: 381,
  at: 400, t815: 405, blinding: 460, flash1: 476,
  close: 507, closeEnd: 534, three: 562, blast: 616, ears: 639, burned: 658, night: 736, shelter: 751,
  home: 789, homeEnd: 817, home2: 847, naga: 878, wait: 919, waitEnd: 954,
  days: 972, bandaged: 1000, work: 1041, boss: 1088, onebomb: 1102, city: 1148, said: 1180, crazy: 1199,
  moment: 1226, second: 1282, flash2: 1294,
  again: 1324, againEnd: 1340, again2: 1358, three2: 1379, andAgain: 1426, survived: 1464,
  what: 1501, whatEnd: 1542, lived: 1565, n93: 1584, warning: 1633, nuclear: 1671,
  y2009: 1714, recognized: 1760, only: 1804, both: 1851, sub: 1897,
};
const PAPER = "#efe3c8", WALL = "#d8c39c", WOOD = "#3b2a20", CHALK = "#1f3a33", RED = "#d8352a", SKY0 = "#f7d9a6", SKY1 = "#9cc3d8", NIGHT = "#0d1530", GLOW = "#fff6d6";
const ASKER = CAST[23], HOST = CAST[45];
const YAMA: PersonDef = { ...CAST[8], name: "Yamaguchi", top: "suit", topC: "#4a5568", tie: "#2b2b2b", hat: "none", prop: "none", face: "none", glasses: "round", hair: "short", hairC: "#1c1410" };
const YAMA_OLD: PersonDef = { ...YAMA, hairC: "#d6d6d6", age: "old", topC: "#2c3550", tie: "#8a2b2b" };
const BOSS: PersonDef = { ...CAST[17], prop: "none", hair: "side", face: "mustache", skin: "#efc69d" };
const say = (who: string) => (f: number) => talkFor(f, who, SPK, ENV);
const askT = say("asker"), hostT = say("host");

// ---------- shared pieces ----------
/** Question / reaction bubble: pops on the line's first word, leaves when the line ends. Tail points at (tx,ty). */
const Bubble: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string; tx: number; ty: number; hue?: string; fs?: number; ink?: string }> = ({ f, a, b, x, y, text, tx, ty, hue = YEL, fs = 72, ink = INKC }) => {
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
      <g transform="translate(10 12)" opacity={0.3}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="#000" /><path d={tail} fill="#000" /></g>
      <path d={tail} fill={hue} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill={hue} stroke={INKC} strokeWidth={9} />
      <path d={`M${bx - 30} ${h / 2 - 9} L${bx + 30} ${h / 2 - 9}`} stroke={hue} strokeWidth={12} />
      {lines.map((l, i) => (
        <text key={i} y={(i - (lines.length - 1) / 2) * fs * 1.08 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={ink} letterSpacing={1}>{l}</text>
      ))}
    </g>
  );
};
/** A cast member at (x,y) feet, scale s. */
const Who: React.FC<{ d: PersonDef; f: number; x: number; y: number; s: number; seed: number; talk?: number; mood?: "happy" | "neutral" | "surprised"; wave?: number; bandage?: boolean; op?: number }> = ({ d, f, x, y, s, seed, talk = 0, mood = "neutral", wave = 0, bandage, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood} />
    {bandage && (
      <g>
        <path d="M-56 -408 Q0 -424 56 -408 L56 -386 Q0 -402 -56 -386 Z" fill="#f7f5ee" stroke="#1b1b24" strokeWidth={4} />
        <rect x={22} y={-352} width={26} height={18} rx={4} fill="#f7f5ee" stroke="#1b1b24" strokeWidth={3} transform="rotate(-12 35 -343)" />
      </g>
    )}
  </g>
);
const Studio: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={VW} height={VH} fill={WALL} />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130 - 20} y={0} width={8} height={1420} fill="#c7ae84" opacity={0.6} />)}
    <ellipse cx={540} cy={680} rx={620} ry={520} fill="#fff3d8" opacity={0.35} />
    {/* board */}
    <rect x={70} y={280} width={940} height={800} rx={20} fill="#6b4a2a" />
    <rect x={92} y={302} width={896} height={756} rx={10} fill={CHALK} />
    <rect x={92} y={302} width={896} height={756} rx={10} fill="url(#chalkGrain)" opacity={0.25} />
    <rect x={300} y={1080} width={480} height={18} rx={8} fill="#6b4a2a" />
    {children}
    {/* floor */}
    <rect x={0} y={1420} width={VW} height={VH - 1420} fill={WOOD} />
    {[...Array(8)].map((_, i) => <line key={i} x1={0} y1={1460 + i * 60} x2={VW} y2={1460 + i * 60} stroke="#2a1d16" strokeWidth={4} />)}
    <rect x={0} y={1412} width={VW} height={14} fill="#5a3e2c" />
  </g>
);
const PeaceCranes: React.FC<{ f: number; n?: number }> = ({ f, n = 7 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const x = ((rnd("cx" + i) * 1300 + f * (0.8 + rnd("cs" + i))) % 1300) - 110;
      const y = 200 + rnd("cy" + i) * 600 + Math.sin(f * 0.04 + i) * 20;
      const c = ["#ff6b6b", "#ffd166", "#6ec6ff", "#9bde7e", "#ff9ecb"][i % 5];
      const flap = Math.sin(f * 0.18 + i) * 8;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + rnd("cz" + i) * 0.5})`}>
          <path d={`M-40 0 L0 ${-30 - flap} L10 0 Z`} fill={c} stroke={INKC} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M-40 0 L10 0 L46 -22 L20 12 Z`} fill={c} stroke={INKC} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M-10 0 L18 ${-34 + flap} L20 6 Z`} fill={c} stroke={INKC} strokeWidth={3} strokeLinejoin="round" opacity={0.85} />
        </g>
      );
    })}
  </g>
);
const House: React.FC<{ x: number; y: number; w: number; h: number; c: string; roof?: string }> = ({ x, y, w, h, c, roof = "#4a4a58" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={c} stroke={INKC} strokeWidth={4} />
    <path d={`M${-w / 2 - 26} ${-h + 4} Q0 ${-h - 70} ${w / 2 + 26} ${-h + 4} Z`} fill={roof} stroke={INKC} strokeWidth={4} />
    <rect x={-w / 4 - 18} y={-h * 0.62} width={36} height={h * 0.3} fill="#f7e7b8" stroke={INKC} strokeWidth={3} />
    <rect x={w / 4 - 18} y={-h * 0.62} width={36} height={h * 0.3} fill="#f7e7b8" stroke={INKC} strokeWidth={3} />
  </g>
);
const CalPage: React.FC<{ x: number; y: number; s: number; top: string; big: string; small: string; rot?: number; o?: number }> = ({ x, y, s, top, big, small, rot = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-170} y={-200} width={340} height={400} rx={18} fill="#fffaf0" stroke={INKC} strokeWidth={7} />
    <rect x={-170} y={-200} width={340} height={96} rx={18} fill={RED} stroke={INKC} strokeWidth={7} />
    <text y={-134} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff" letterSpacing={6}>{top}</text>
    <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={200} fill={INKC}>{big}</text>
    <text y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#555" letterSpacing={4}>{small}</text>
    {[-90, 0, 90].map((dx) => <circle key={dx} cx={dx} cy={-200} r={12} fill="#888" stroke={INKC} strokeWidth={4} />)}
  </g>
);
/** Blinding flash: light bloom from (x,y) that whitens the frame and leaves an amber haze. */
const FlashBloom: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  if (f < at - 2) return null;
  const q = f - at;
  const grow = eout(ramp(f, at - 2, at + 14));
  const white = q < 6 ? ramp(f, at - 2, at + 6) * 0.95 : 0.95 * Math.exp(-(q - 6) / 14) + 0.12;
  return (
    <g>
      <circle cx={x} cy={y} r={60 + grow * 900} fill="url(#bloom)" opacity={0.95} />
      {[0, 1].map((i) => { const k = ramp(f, at + i * 6, at + 30 + i * 6); return k > 0 && k < 1 ? <circle key={i} cx={x} cy={y} r={80 + k * 1100} fill="none" stroke="#fff" strokeWidth={30 * (1 - k)} opacity={1 - k} /> : null; })}
      <rect width={VW} height={VH} fill={GLOW} opacity={clamp01(white)} />
    </g>
  );
};
const Clock: React.FC<{ x: number; y: number; r: number; min: number }> = ({ x, y, r, min }) => {
  const ha = ((min / 60) % 12) * 30, ma = (min % 60) * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#fffaf0" stroke={INKC} strokeWidth={8} />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={-r * 0.78} x2={0} y2={-r * 0.9} stroke={INKC} strokeWidth={6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={INKC} strokeWidth={10} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={RED} strokeWidth={6} strokeLinecap="round" transform={`rotate(${ma})`} />
      <circle r={9} fill={INKC} />
    </g>
  );
};
/** City diagram: hypocentre star + "3 KM" ring + Yamaguchi pin. */
const RingMap: React.FC<{ f: number; at: number; x: number; y: number; r: number; title: string; date: string; kmAt: number; hue: string }> = ({ f, at, x, y, r, title, date, kmAt, hue }) => {
  const p = pop(f, at, 14);
  if (p <= 0) return null;
  const ring = eout(ramp(f, kmAt - 6, kmAt + 16));
  const pin = pop(f, kmAt + 14, 10);
  const a = -0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <circle r={r} fill="#2a4a42" stroke="#9bd3c0" strokeWidth={5} />
      {[...Array(6)].map((_, i) => <line key={i} x1={-r} y1={-r + (i + 1) * (r * 2) / 7} x2={r} y2={-r + (i + 1) * (r * 2) / 7} stroke="#9bd3c0" strokeWidth={2} opacity={0.25} />)}
      <circle r={r * 0.82 * ring} fill={hue} opacity={0.12} />
      <circle r={r * 0.82 * ring} fill="none" stroke={hue} strokeWidth={7} strokeDasharray="20 12" strokeDashoffset={-f * 1.5} />
      <path d="M0 -26 L7 -8 L26 -8 L11 4 L17 23 L0 11 L-17 23 L-11 4 L-26 -8 L-7 -8 Z" fill={YEL} stroke={INKC} strokeWidth={4} transform={`scale(${1 + 0.15 * Math.sin(f * 0.2)})`} />
      {ring > 0.2 && <line x1={0} y1={0} x2={Math.cos(a) * r * 0.82 * ring} y2={Math.sin(a) * r * 0.82 * ring} stroke="#fff" strokeWidth={5} strokeDasharray="10 8" />}
      {pin > 0 && (
        <g transform={`translate(${Math.cos(a) * r * 0.82} ${Math.sin(a) * r * 0.82}) scale(${pin})`}>
          <circle r={26} fill="#fff" stroke={INKC} strokeWidth={5} />
          <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKC}>Y</text>
        </g>
      )}
      <text y={-r - 54} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#fff" letterSpacing={3}>{title}</text>
      <text y={-r - 14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={YEL} letterSpacing={3}>{date}</text>
      {f >= kmAt && (
        <g transform={`translate(${-r * 0.1} ${r * 0.42}) scale(${pop(f, kmAt, 10)})`}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={r * 0.42} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke">{countUp(f, kmAt, kmAt + 14, 3)} KM</text>
        </g>
      )}
    </g>
  );
};

// ---------- shots ----------
const S1_Intro: React.FC<{ f: number }> = ({ f }) => {
  const fp = pop(f, F.name - 4, 14);
  return (
    <Studio f={f}>
      <text x={540} y={390} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#e8f2ee" opacity={0.9 * pop(f, F.true, 10)} letterSpacing={6}>IT'S TRUE.</text>
      {fp > 0 && (
        <g transform={`translate(540 700) scale(${fp}) rotate(${-2 + Math.sin(f * 0.03)})`}>
          <rect x={-190} y={-230} width={380} height={420} rx={10} fill="#c9a35a" stroke={INKC} strokeWidth={8} />
          <rect x={-162} y={-202} width={324} height={364} fill="#e9e1cf" />
          <clipPath id="pf"><rect x={-162} y={-202} width={324} height={364} /></clipPath>
          <g clipPath="url(#pf)" filter="url(#sepia)">
            <rect x={-162} y={-202} width={324} height={364} fill="#b9a98a" />
            <g transform="translate(0 420) scale(1.05)"><Person d={YAMA} f={f} seed={8} talk={0} wave={0} mood="neutral" /></g>
          </g>
        </g>
      )}
      {f >= F.yama && (
        <g transform={`translate(540 960) scale(${pop(f, F.yama, 12)})`}>
          <rect x={-330} y={-46} width={660} height={92} rx={14} fill={YEL} stroke={INKC} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INKC} letterSpacing={3}>TSUTOMU YAMAGUCHI</text>
        </g>
      )}
      <Who d={ASKER} f={f} x={230} y={1520} s={0.88} seed={23} talk={askT(f)} mood="neutral" />
      <Who d={HOST} f={f} x={850} y={1520} s={0.88} seed={45} talk={hostT(f)} mood="neutral" />
      <Bubble f={f} a={F.ask} b={F.askEnd} x={430} y={1010} text={"BOTH BOMBS?!"} tx={250} ty={1130} />
    </Studio>
  );
};
const S2_Hiroshima: React.FC<{ f: number }> = ({ f }) => {
  const walk = ramp(f, F.walk, F.at + 10);
  const yx = lerp(180, 470, eio(walk));
  const step = walk > 0 && walk < 1 ? Math.abs(Math.sin(f * 0.35)) * 10 : 0;
  const min = 8 * 60 + 5 + 10 * eout(ramp(f, F.at - 10, F.t815 + 12));
  const lit = f >= F.blinding;
  const calY = lerp(470, -300, eio(ramp(f, F.walk - 4, F.walk + 18)));
  return (
    <g>
      <defs>
        <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY1} /><stop offset="1" stopColor={SKY0} /></linearGradient>
      </defs>
      <rect width={VW} height={VH} fill="url(#hsky)" />
      <circle cx={200} cy={380} r={70} fill="#fff4c9" opacity={0.8} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={(i * 420 + f * 0.4) % 1300 - 100} cy={300 + i * 140} rx={130} ry={34} fill="#fff" opacity={0.7} />)}
      <path d="M0 1000 Q 200 880 420 960 T 820 920 T 1080 960 V 1150 H0Z" fill="#8fb39a" />
      {[[110, 1240, 180, 170, "#d9c7a3"], [330, 1250, 200, 210, "#cdb88f"], [560, 1240, 170, 160, "#e0cfaa"], [770, 1250, 210, 200, "#cbb48a"], [990, 1240, 170, 170, "#d9c7a3"]].map(([x, y, w, h, c], i) => <House key={i} x={x as number} y={y as number} w={w as number} h={h as number} c={c as string} />)}
      <rect x={0} y={1240} width={VW} height={VH - 1240} fill="#7a6a58" />
      <rect x={0} y={1240} width={VW} height={16} fill="#5a4c3e" />
      {[...Array(12)].map((_, i) => <rect key={i} x={i * 100 + 20} y={1590} width={60} height={10} fill="#998a76" />)}
      <rect x={0} y={1640} width={VW} height={VH - 1640} fill="#3a3028" />
      {/* street clock on a pole */}
      <rect x={812} y={940} width={16} height={520} fill="#3a3a48" stroke={INKC} strokeWidth={3} />
      <Clock x={820} y={900} r={78} min={min} />
      {f >= F.t815 && <Chip x={820} y={1030} w={240} label="8:15 AM" hue={RED} p={pop(f, F.t815, 10)} fs={40} />}
      <Who d={YAMA} f={f} x={yx} y={1460 - step} s={0.82} seed={8} mood={lit ? "surprised" : "neutral"} />
      {/* briefcase */}
      <rect x={yx - 75} y={1330 - step} width={56} height={42} rx={6} fill="#6b4423" stroke={INKC} strokeWidth={4} />
      {f >= F.engineer && f < F.blinding && <Chip x={yx} y={1050} w={300} label="ENGINEER" hue="#3b63b8" p={pop(f, F.engineer, 10)} fs={40} />}
      {f >= F.hiro && f < F.blinding && <Chip x={560} y={700} w={380} label="HIROSHIMA" hue={YEL} textColor={INKC} p={pop(f, F.hiro, 10)} fs={42} />}
      {f >= F.trip && f < F.blinding && <Chip x={560} y={790} w={340} label="BUSINESS TRIP" hue="#ffffff" textColor={INKC} p={pop(f, F.trip, 10)} fs={34} />}
      <FlashBloom f={f} at={F.blinding} x={960} y={880} />
      {/* calendar title card that lifts away as the camera cranes down */}
      {calY > -250 && (
        <g>
          <CalPage x={540} y={calY} s={1} top="AUGUST" big="6" small="MONDAY" rot={-3} />
          {f >= F.y1945 && <BigNum f={f} at={F.y1945} text="1945" x={540} y={calY + 360} hue={YEL} fs={150} />}
        </g>
      )}
    </g>
  );
};
const S3_HowClose: React.FC<{ f: number }> = ({ f }) => (
  <Studio f={f}>
    <RingMap f={f} at={F.close - 2} x={540} y={700} r={280} title="HIROSHIMA" date="AUG 6 · 8:15" kmAt={F.three} hue={YEL} />
    <Who d={ASKER} f={f} x={230} y={1520} s={0.88} seed={23} talk={askT(f)} mood="neutral" />
    <Who d={HOST} f={f} x={850} y={1520} s={0.88} seed={45} talk={hostT(f)} mood="neutral" />
    <Bubble f={f} a={F.close} b={F.closeEnd} x={470} y={1050} text={"HOW CLOSE?"} tx={260} ty={1140} />
  </Studio>
);
const S4_Shelter: React.FC<{ f: number }> = ({ f }) => {
  const go = eio(ramp(f, F.shelter, F.shelter + 40));
  return (
    <g>
      <rect width={VW} height={VH} fill={NIGHT} />
      <rect width={VW} height={900} fill="#3a1f2a" opacity={0.45} />
      <circle cx={850} cy={330} r={56} fill="#f2ecd8" opacity={0.85} />
      <Drift f={f} n={30} color="#ff9a52" seed="ember" maxR={3} speed={0.5} area={[0, 200, VW, 1100]} opacity={0.5} />
      {/* earth mound with shelter entrance */}
      <path d="M380 1460 Q 720 860 1180 1000 V1460 Z" fill="#3a3326" stroke={INKC} strokeWidth={6} />
      <path d="M640 1460 V1250 Q 760 1140 880 1250 V1460 Z" fill="#120c08" stroke="#6b5a40" strokeWidth={10} />
      <rect x={0} y={1450} width={VW} height={VH - 1450} fill="#1e1a14" />
      <Who d={YAMA} f={f} x={lerp(380, 760, go)} y={1470} s={0.84} seed={8} mood="neutral" bandage={f >= F.blast + 6} op={1 - ramp(f, F.shelter + 26, F.shelter + 40)} />
      {f >= F.ears && (
        <g transform={`translate(260 700) scale(${pop(f, F.ears, 10)})`}>
          <circle r={62} fill="#fff" stroke={INKC} strokeWidth={6} />
          <path d="M-10 -34 Q 26 -40 26 -4 Q 26 18 6 26 Q -4 30 -4 42 M-10 -12 Q 8 -16 8 0" stroke={INKC} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M-46 -40 L46 40" stroke={RED} strokeWidth={9} strokeLinecap="round" />
          <text x={88} y={14} fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" letterSpacing={2}>EARDRUMS BURST</text>
        </g>
      )}
      {f >= F.burned && (
        <g transform={`translate(260 860) scale(${pop(f, F.burned, 10)})`}>
          <circle r={62} fill="#ffb36b" stroke={INKC} strokeWidth={6} />
          <path d="M-14 26 Q -30 -6 0 -40 Q 6 -14 22 -8 Q 32 20 6 30 Q 12 10 0 4 Q -6 20 -14 26 Z" fill={RED} stroke={INKC} strokeWidth={4} />
          <text x={88} y={14} fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" letterSpacing={2}>LEFT SIDE BURNED</text>
        </g>
      )}
      {f >= F.night && <Chip x={540} y={1100} w={460} label="NIGHT IN A SHELTER" hue="#6ec6ff" p={pop(f, F.night, 10)} fs={38} dark />}
    </g>
  );
};
/** Simplified Japan (Honshu west, Shikoku, Kyushu) with the train route Hiroshima → Nagasaki. */
const HIRO: [number, number] = [480, 785], NAGA: [number, number] = [185, 975];
const ROUTE: [number, number][] = [HIRO, [400, 800], [330, 810], [300, 830], [300, 880], [260, 900], [210, 930], NAGA];
const along = (t: number): [number, number] => {
  const segs = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0);
  let d = clamp01(t) * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const k = d / segs[i]; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], k), lerp(ROUTE[i][1], ROUTE[i + 1][1], k)]; } d -= segs[i]; }
  return NAGA;
};
const S5_Map: React.FC<{ f: number }> = ({ f }) => {
  const t = eio(ramp(f, F.home2 - 6, F.naga + 4));
  const [tx, ty] = along(t);
  const route = ROUTE.map((p) => p.join(" ")).join(" L");
  return (
    <g>
      <rect width={VW} height={VH} fill="#1d4e6e" />
      {[...Array(14)].map((_, i) => <path key={i} d={`M0 ${200 + i * 90} Q 270 ${190 + i * 90 + Math.sin(f * 0.05 + i) * 8} 540 ${200 + i * 90} T 1080 ${200 + i * 90}`} stroke="#2d6a8e" strokeWidth={3} fill="none" opacity={0.5} />)}
      <g transform="translate(60 -200)" stroke={INKC} strokeWidth={6} strokeLinejoin="round" fill="#e7d9b0">
        <path d="M250 990 L330 960 L420 950 L520 930 L600 900 L660 860 L720 800 L760 720 L800 640 L830 560 L860 470 L880 380 L920 330 L1000 360 L1000 450 L920 540 L900 640 L860 740 L800 820 L740 890 L660 950 L580 990 L500 1010 L420 1020 L340 1040 L270 1040 Z" />
        <path d="M380 1060 L470 1040 L540 1050 L530 1100 L450 1120 L390 1100 Z" />
        <path d="M120 1080 L200 1050 L260 1060 L290 1110 L280 1200 L240 1270 L180 1290 L140 1240 L100 1180 L130 1130 Z" />
      </g>
      <text x={560} y={560} fontFamily={FONT} fontWeight={800} fontSize={54} fill="#e7d9b0" opacity={0.5} letterSpacing={10}>JAPAN</text>
      <path d={`M${route}`} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="16 12" opacity={0.85} />
      <path d={`M${route}`} fill="none" stroke={YEL} strokeWidth={9} strokeDasharray={`${t * 520} 2000`} />
      {/* Hiroshima pin */}
      <circle cx={HIRO[0]} cy={HIRO[1]} r={18} fill={RED} stroke={INKC} strokeWidth={5} />
      <g transform={`translate(${HIRO[0] + 30} ${HIRO[1] - 50})`}><rect x={0} y={-36} width={300} height={62} rx={14} fill="#fff" stroke={INKC} strokeWidth={5} /><text x={150} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={INKC}>HIROSHIMA</text></g>
      {f >= F.naga && (
        <g>
          <circle cx={NAGA[0]} cy={NAGA[1]} r={22 + 6 * Math.sin(f * 0.25)} fill={RED} stroke={INKC} strokeWidth={5} />
          <g transform={`translate(${NAGA[0] + 30} ${NAGA[1] + 30}) scale(${pop(f, F.naga, 12)})`}>
            <rect x={0} y={-40} width={380} height={80} rx={16} fill={YEL} stroke={INKC} strokeWidth={6} />
            <text x={190} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INKC}>NAGASAKI</text>
          </g>
          <text x={NAGA[0] + 220} y={NAGA[1] + 120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff" opacity={pop(f, F.naga + 8, 10)} letterSpacing={3}>HIS HOMETOWN</text>
        </g>
      )}
      {/* train */}
      {f >= F.home2 - 6 && (
        <g transform={`translate(${tx} ${ty})`}>
          <rect x={-34} y={-24} width={68} height={40} rx={10} fill="#3b63b8" stroke={INKC} strokeWidth={5} />
          <rect x={-24} y={-16} width={18} height={14} fill="#bfe6ff" /><rect x={4} y={-16} width={18} height={14} fill="#bfe6ff" />
          <circle cx={-18} cy={20} r={7} fill={INKC} /><circle cx={18} cy={20} r={7} fill={INKC} />
        </g>
      )}
      <rect x={0} y={1400} width={VW} height={VH - 1400} fill="#14324a" />
      <Who d={ASKER} f={f} x={200} y={1530} s={0.85} seed={23} talk={askT(f)} mood={f >= F.wait - 4 ? "surprised" : "neutral"} />
      <Who d={HOST} f={f} x={890} y={1530} s={0.85} seed={45} talk={hostT(f)} mood="neutral" />
      <Bubble f={f} a={F.home} b={F.homeEnd} x={550} y={1270} text={"WENT HOME?"} fs={66} tx={250} ty={1220} />
      <Bubble f={f} a={F.wait} b={F.waitEnd} x={540} y={1270} text={"WAIT... NO!"} fs={66} tx={250} ty={1220} hue="#ff8a8a" />
    </g>
  );
};
const S6_Office: React.FC<{ f: number }> = ({ f }) => {
  const tear = eio(ramp(f, F.days + 4, F.days + 22));
  const bossShake = f >= F.crazy ? Math.sin((f - F.crazy) * 0.6) * 4 * (1 - ramp(f, F.crazy, F.crazy + 30)) : 0;
  return (
    <g>
      <rect width={VW} height={VH} fill="#cdb98f" />
      {[...Array(12)].map((_, i) => <rect key={i} x={i * 96} y={0} width={4} height={1380} fill="#b9a273" />)}
      {/* window onto Nagasaki hills */}
      <g>
        <rect x={420} y={420} width={420} height={460} fill="#a9d4ea" stroke="#5a4028" strokeWidth={18} />
        <path d="M420 760 Q 520 640 640 720 T 840 690 V 880 H420 Z" fill="#6f9a6a" />
        <path d="M420 820 Q 560 760 700 800 T 840 790 V 880 H420 Z" fill="#557d55" />
        <line x1={630} y1={420} x2={630} y2={880} stroke="#5a4028" strokeWidth={10} />
        <line x1={420} y1={650} x2={840} y2={650} stroke="#5a4028" strokeWidth={10} />
      </g>
      {/* wall calendar: AUG 6 tears away to AUG 9 */}
      <CalPage x={210} y={600} s={0.62} top="AUGUST" big="9" small="1945" />
      {tear < 1 && <CalPage x={210 + tear * 120} y={600 + tear * 700} s={0.62} top="AUGUST" big="6" small="1945" rot={tear * 40} o={1 - tear} />}
      {f >= F.days && <Chip x={210} y={800} w={360} label="3 DAYS LATER" hue={RED} p={pop(f, F.days + 2, 10)} fs={36} />}
      {/* desk */}
      <rect x={560} y={1180} width={460} height={30} fill="#6b4423" stroke={INKC} strokeWidth={5} />
      <rect x={590} y={1210} width={30} height={200} fill="#5a3a22" /><rect x={960} y={1210} width={30} height={200} fill="#5a3a22" />
      <rect x={700} y={1130} width={120} height={50} fill="#f4f1ea" stroke={INKC} strokeWidth={4} />
      <rect x={0} y={1400} width={VW} height={VH - 1400} fill="#4a3424" />
      <Who d={YAMA} f={f} x={300} y={1500} s={0.86} seed={8} mood="neutral" bandage />
      <g transform={`translate(${bossShake} 0)`}><Who d={BOSS} f={f} x={820} y={1500} s={0.86} seed={17} mood={f >= F.crazy - 4 ? "surprised" : "neutral"} /></g>
      {f >= F.bandaged && f < F.boss && <Chip x={300} y={1000} w={300} label="BANDAGED" hue="#ffffff" textColor={INKC} p={pop(f, F.bandaged, 10)} fs={38} />}
      {f >= F.work && f < F.boss && <Chip x={300} y={1080} w={340} label="BACK TO WORK" hue="#3b63b8" p={pop(f, F.work, 10)} fs={36} />}
      {/* Yamaguchi's story bubble */}
      <Bubble f={f} a={F.onebomb} b={F.city + 14} x={420} y={930} text={"1 BOMB =\n1 CITY"} tx={330} ty={1080} hue="#ffffff" fs={64} />
      <Bubble f={f} a={F.crazy} b={F.crazy + 22} x={780} y={950} text={"CRAZY!"} tx={820} ty={1090} hue="#ff8a8a" fs={80} />
    </g>
  );
};
const S7_Nagasaki: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fc1df" /><stop offset="1" stopColor="#f3dcae" /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#nsky)" />
    <path d="M0 900 Q 200 700 420 820 T 820 760 T 1080 820 V 1300 H0Z" fill="#6f9a6a" />
    <path d="M0 1000 Q 300 900 560 980 T 1080 960 V 1300 H0Z" fill="#557d55" />
    <rect x={0} y={1260} width={VW} height={200} fill="#4f8fb8" />
    {[...Array(6)].map((_, i) => <path key={i} d={`M${i * 200 - 40} ${1300 + (i % 2) * 40} q 30 -14 60 0 t 60 0`} stroke="#d8eef8" strokeWidth={5} fill="none" opacity={0.7} />)}
    {/* office building with lit window */}
    <g transform="translate(560 1260)">
      <rect x={-170} y={-420} width={340} height={420} fill="#d8c7a3" stroke={INKC} strokeWidth={6} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-130 + c * 95} y={-380 + r * 120} width={70} height={80} fill={r === 1 && c === 1 ? "#ffe9a8" : "#a9d4ea"} stroke={INKC} strokeWidth={4} />))}
      <rect x={-190} y={-440} width={380} height={30} fill="#7a5a3a" stroke={INKC} strokeWidth={5} />
    </g>
    <rect x={0} y={1440} width={VW} height={VH - 1440} fill="#2c3a2c" />
    {f < F.second && <Chip x={540} y={560} w={430} label="NAGASAKI · AUG 9" hue={YEL} textColor={INKC} p={pop(f, F.moment, 10)} fs={40} />}
    <FlashBloom f={f} at={F.flash2 - 6} x={140} y={860} />
    {f >= F.flash2 + 8 && <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={RED} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, F.flash2 + 8, 10)}>THE 2ND FLASH</text>}
  </g>
);
const S8_Again: React.FC<{ f: number }> = ({ f }) => (
  <Studio f={f}>
    <RingMap f={f} at={F.again - 2} x={300} y={720} r={170} title="HIROSHIMA" date="AUG 6" kmAt={F.again + 6} hue={YEL} />
    <RingMap f={f} at={F.again2} x={780} y={720} r={170} title="NAGASAKI" date="AUG 9" kmAt={F.three2} hue="#ff8a8a" />
    {f >= F.survived && <Stamp f={f} at={F.survived} x={540} y={980} text="SURVIVED" hue="#7be0a5" fs={78} rot={-6} />}
    <Who d={ASKER} f={f} x={230} y={1520} s={0.88} seed={23} talk={askT(f)} mood={f < F.three2 ? "surprised" : "neutral"} />
    <Who d={HOST} f={f} x={850} y={1520} s={0.88} seed={45} talk={hostT(f)} mood="neutral" />
    <Bubble f={f} a={F.again} b={F.againEnd + 6} x={470} y={1080} text={"AGAIN?!"} tx={260} ty={1150} hue="#ff8a8a" fs={84} />
  </Studio>
);
const S9_Hall: React.FC<{ f: number }> = ({ f }) => {
  const age = countUp(f, F.n93 - 4, F.n93 + 16, 93);
  return (
    <g>
      <rect width={VW} height={VH} fill="#2a2440" />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${i * 170 - 40} 0 L${i * 170 + 60} 0 L${540 + (i - 3) * 60} 1100 Z`} fill="#fff6d6" opacity={0.04} />)}
      {/* banner */}
      <g transform={`translate(540 ${lerp(160, 330, eout(ramp(f, F.warning - 8, F.warning + 12)))})`} opacity={ramp(f, F.warning - 8, F.warning + 4)}>
        <rect x={-430} y={-70} width={860} height={140} rx={10} fill="#f4f1ea" stroke={INKC} strokeWidth={6} />
        <text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={RED} letterSpacing={3}>NO MORE</text>
        <text y={46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC} letterSpacing={3}>NUCLEAR WEAPONS</text>
      </g>
      {/* stage */}
      <rect x={0} y={1180} width={VW} height={60} fill="#6b4423" stroke={INKC} strokeWidth={5} />
      <rect x={0} y={1240} width={VW} height={VH - 1240} fill="#1a1626" />
      <Who d={YAMA_OLD} f={f} x={740} y={1190} s={0.8} seed={9} mood="neutral" />
      {/* podium in front of his legs only */}
      <path d="M660 1190 L680 1040 H800 L820 1190 Z" fill="#7a5a3a" stroke={INKC} strokeWidth={5} />
      <circle cx={740} cy={1100} r={22} fill={YEL} stroke={INKC} strokeWidth={4} />
      {/* audience heads */}
      {[...Array(9)].map((_, i) => <circle key={i} cx={380 + i * 90 + (i % 2) * 20} cy={1450 + (i % 2) * 30} r={46} fill="#0f0c18" />)}
      {f >= F.n93 - 4 && (
        <g transform={`translate(860 640) scale(${pop(f, F.n93 - 4, 12)})`}>
          <circle r={120} fill={YEL} stroke={INKC} strokeWidth={8} />
          <text y={-34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC} letterSpacing={3}>LIVED TO</text>
          <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INKC}>{age}</text>
        </g>
      )}
      <Who d={ASKER} f={f} x={180} y={1560} s={0.86} seed={23} talk={askT(f)} mood="neutral" />
      <Bubble f={f} a={F.what} b={F.whatEnd} x={340} y={1000} text={"WHAT\nHAPPENED NEXT?"} tx={200} ty={1190} fs={60} />
    </g>
  );
};
const S10_Only: React.FC<{ f: number }> = ({ f }) => (
  <Studio f={f}>
    <BigNum f={f} at={F.y2009} text="2009" x={540} y={470} hue={YEL} fs={150} />
    {f >= F.recognized - 6 && (
      <g transform={`translate(540 760) scale(${pop(f, F.recognized - 6, 14)}) rotate(-2)`}>
        <rect x={-330} y={-170} width={660} height={340} rx={12} fill="#fffaf0" stroke="#c9a35a" strokeWidth={12} />
        <circle cx={285} cy={-122} r={28} fill={RED} stroke="#8a1a12" strokeWidth={5} />
        <text x={-10} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#555" letterSpacing={3}>OFFICIALLY RECOGNIZED</text>
        <text y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={INKC}>DOUBLE SURVIVOR</text>
        <text y={56} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#555" letterSpacing={2}>TSUTOMU YAMAGUCHI</text>
        {f >= F.both && <text y={124} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#2f8f6a" opacity={pop(f, F.both, 10)}>HIROSHIMA ✓   NAGASAKI ✓</text>}
      </g>
    )}
    {f >= F.only && <Stamp f={f} at={F.only} x={560} y={1000} text="ONLY ONE" hue={RED} fs={66} rot={-5} />}
    <Who d={ASKER} f={f} x={230} y={1520} s={0.88} seed={23} talk={askT(f)} mood={f >= F.only ? "surprised" : "neutral"} />
    <Who d={HOST} f={f} x={850} y={1520} s={0.88} seed={45} talk={hostT(f)} mood="neutral" />
  </Studio>
);
const S11_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a5a" /><stop offset="1" stopColor="#f0a868" /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#dusk)" />
    <PeaceCranes f={f} />
    <rect x={0} y={1420} width={VW} height={VH - 1420} fill="#2a1d16" />
    <Outro f={f} at={F.sub} />
    <Who d={HOST} f={f} x={180} y={1500} s={0.8} seed={45} talk={hostT(f)} wave={1} mood="happy" />
    <Who d={ASKER} f={f} x={900} y={1500} s={0.8} seed={23} talk={0} wave={1} mood="happy" />
  </g>
);

export const AtomicBombsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.aug, render: () => <S1_Intro f={f} />, cam: [[0, { x: 470, y: 1150, z: 1.2 }], [F.ask + 60, { x: 440, y: 1150, z: 1.16 }], [F.true, { x: 720, y: 1150, z: 1.22 }], [F.name + 4, { x: 540, y: 880, z: 1.02 }], [F.aug, { x: 540, y: 840, z: 1.1 }]] },
    { from: F.aug, to: F.close, tr: "whip", render: () => <S2_Hiroshima f={f} />, cam: [[F.aug, { x: 540, y: 560, z: 1.3 }], [F.walk - 2, { x: 540, y: 600, z: 1.24 }], [F.walk + 22, { x: 420, y: 1060, z: 1.12 }], [F.at - 4, { x: 520, y: 1060, z: 1.12 }], [F.t815 + 6, { x: 760, y: 980, z: 1.32 }], [F.blinding - 2, { x: 740, y: 980, z: 1.34 }], [F.blinding + 14, { x: 560, y: 960, z: 1.0 }], [F.close, { x: 540, y: 960, z: 1.04 }]] },
    { from: F.close, to: F.blast, tr: "iris", render: () => <S3_HowClose f={f} />, cam: [[F.close, { x: 420, y: 1180, z: 1.15 }], [F.closeEnd + 10, { x: 540, y: 820, z: 1.04 }], [F.blast, { x: 540, y: 760, z: 1.14 }]] },
    { from: F.blast, to: F.home, tr: "whip", render: () => <S4_Shelter f={f} />, cam: [[F.blast, { x: 420, y: 1080, z: 1.3 }], [F.ears, { x: 400, y: 1000, z: 1.12 }], [F.night, { x: 520, y: 1040, z: 1.08 }], [F.home, { x: 700, y: 1120, z: 1.22 }]] },
    { from: F.home, to: F.days, tr: "push", render: () => <S5_Map f={f} />, cam: [[F.home, { x: 330, y: 1160, z: 1.18 }], [F.home2 - 8, { x: 540, y: 900, z: 1.0 }], [F.naga + 4, { x: 330, y: 900, z: 1.2 }], [F.wait - 4, { x: 380, y: 1060, z: 1.14 }], [F.days, { x: 380, y: 1080, z: 1.2 }]] },
    { from: F.days, to: F.moment, tr: "wipe", render: () => <S6_Office f={f} />, cam: [[F.days, { x: 280, y: 640, z: 1.45 }], [F.bandaged + 6, { x: 380, y: 1040, z: 1.12 }], [F.boss, { x: 540, y: 1000, z: 1.02 }], [F.city + 10, { x: 460, y: 1000, z: 1.1 }], [F.crazy - 2, { x: 760, y: 1040, z: 1.24 }], [F.moment, { x: 780, y: 1040, z: 1.28 }]] },
    { from: F.moment, to: F.again, tr: "zoom", render: () => <S7_Nagasaki f={f} />, cam: [[F.moment, { x: 540, y: 960, z: 1.0 }], [F.second, { x: 560, y: 1000, z: 1.18 }], [F.flash2 + 4, { x: 540, y: 960, z: 1.02 }], [F.again, { x: 540, y: 900, z: 1.08 }]] },
    { from: F.again, to: F.what, tr: "spin", render: () => <S8_Again f={f} />, cam: [[F.again, { x: 330, y: 1120, z: 1.22 }], [F.again2, { x: 540, y: 820, z: 1.02 }], [F.andAgain, { x: 600, y: 800, z: 1.1 }], [F.what, { x: 540, y: 880, z: 1.02 }]] },
    { from: F.what, to: F.y2009, tr: "whipUp", render: () => <S9_Hall f={f} />, cam: [[F.what, { x: 300, y: 1120, z: 1.2 }], [F.lived, { x: 700, y: 960, z: 1.12 }], [F.n93 + 10, { x: 760, y: 880, z: 1.2 }], [F.warning + 6, { x: 540, y: 880, z: 1.0 }], [F.y2009, { x: 560, y: 900, z: 1.06 }]] },
    { from: F.y2009, to: F.sub, tr: "flash", render: () => <S10_Only f={f} />, cam: [[F.y2009, { x: 540, y: 760, z: 1.2 }], [F.recognized, { x: 540, y: 820, z: 1.04 }], [F.only + 4, { x: 600, y: 760, z: 1.14 }], [F.sub, { x: 540, y: 900, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S11_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.true, 0.06], [F.y1945, 0.1], [F.t815, 0.08], [F.flash1, 0.14], [F.three, 0.12], [F.ears, 0.07], [F.naga, 0.12], [F.wait, 0.08], [F.onebomb, 0.07], [F.crazy, 0.1], [F.flash2, 0.14], [F.again, 0.08], [F.three2, 0.1], [F.survived, 0.12], [F.n93, 0.12], [F.y2009, 0.12], [F.only, 0.14]];
  const SHAKE: [number, number][] = [[F.flash1, 14], [F.flash2, 16], [F.crazy, 6], [F.only, 8]];
  const SFX: Cue[] = [
    [F.ask - 2, "pop", 0.4], [F.name - 4, "pop", 0.35], [F.yama, "tick", 0.3],
    [F.y1945, "impact", 0.35], [F.engineer, "pop", 0.3], [F.hiro, "pop", 0.3], [F.t815, "tick", 0.4], [F.blinding - 180, "riser_dark", 0.3], [F.blinding - 2, "boom", 0.5],
    [F.close - 3, "pop", 0.4], [F.three, "tick", 0.35], [F.ears, "pop", 0.3], [F.burned, "pop", 0.3], [F.night, "tick", 0.3],
    [F.home - 3, "pop", 0.4], [F.home2 - 6, "whoosh", 0.3], [F.naga, "impact", 0.4], [F.wait - 3, "pop", 0.4],
    [F.days + 4, "whoosh", 0.3], [F.onebomb - 3, "pop", 0.3], [F.crazy - 3, "pop", 0.4], [F.moment - 110, "riser_dark", 0.3], [F.flash2 - 8, "boom", 0.55],
    [F.again - 3, "pop", 0.4], [F.three2, "tick", 0.35], [F.survived, "impact", 0.45],
    [F.what - 3, "pop", 0.4], [F.n93, "tick", 0.35], [F.warning - 8, "whoosh", 0.25], [F.only, "impact", 0.5], [F.both, "pop", 0.3],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.close ? YEL : f < F.days ? "#ff8a8a" : f < F.what ? YEL : "#7be0a5";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="bloom" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffffff" /><stop offset="0.35" stopColor="#fff6d6" stopOpacity={0.95} /><stop offset="0.7" stopColor="#ffc46b" stopOpacity={0.5} /><stop offset="1" stopColor="#ff8a3d" stopOpacity={0} /></radialGradient>
          <pattern id="chalkGrain" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="8" cy="12" r="1.4" fill="#fff" /><circle cx="28" cy="30" r="1" fill="#fff" /><circle cx="33" cy="6" r="0.8" fill="#fff" /></pattern>
          <filter id="sepia"><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter>
        </defs>
      </svg>
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="BOTH BOMBS" sub="ONE MAN SURVIVED?" until={F.true - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="atomic" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
