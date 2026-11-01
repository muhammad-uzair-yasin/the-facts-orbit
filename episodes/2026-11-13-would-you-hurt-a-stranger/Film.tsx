import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (word start frames from words.ts)
const F = {
  ask: 17, ask2: 71, askEnd: 124, most: 142, no: 172, in1961: 195, yale: 213, milgram: 267, tested: 303,
  volunteers: 345, machine: 387, switches: 415, v15: 444, v450: 457, volts: 466, every: 489, man: 508, room: 531, wrong: 559, shock: 586, harder: 617, each: 630,
  real: 669, realEnd: 698, fake: 716, actor: 765, but: 786, didnt: 813, screamed: 853, banged: 885, wall: 906, then: 925, silent: 966,
  stopped: 998, stoppedEnd: 1036, lab: 1072, coat: 1079, said: 1095, experiment: 1113, continue: 1160,
  experts: 1194, predicted: 1213, one: 1239, thousand: 1253, allway: 1282, realnum: 1318, number: 1326, sixty: 1347, pressed: 1377, final: 1395, v450b: 1426,
  twoOf: 1485, twoEnd: 1530, hopeful: 1569, two: 1606, refused: 1641, ten: 1674, onePerson: 1730, saying: 1749, noA: 1761, gives: 1784, courage: 1820, sayNo: 1843, sub: 1871,
};
const WALL = "#e6d8b8", WALL2 = "#d4c39c", FLOOR = "#4a5a3e", FLOOR2 = "#3a4830", PANEL = "#5d6b5a", RED = "#e4473b", GREEN = "#3ddc97", BOLT = "#ffe14a", NAVY = "#1f2440";
const BIZ = CAST[17], SCI = CAST[0], DOC = CAST[7];
const LEARNER: PersonDef = { ...CAST[9], name: "Learner", prop: "none", age: "adult", glasses: "square", face: "none", hair: "side", hairC: "#7a7a7a", top: "sweater", topC: "#7a8a6a" };
const REB1: PersonDef = { ...CAST[20], prop: "none" }, REB2: PersonDef = { ...CAST[4], prop: "none" };
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

// ---------- helpers ----------
/** Hand position of a raised right arm (wave > 0), replicating the Person rig (adult, H=1). */
const handUp = (f: number, seed: number, wave: number, H = 1, bw = 1) => {
  const shY = -300 * H - Math.sin(f * 0.09 + seed) * 2.5, sx = 54 * bw - 6, sy = shY + 14;
  const a = (150 + Math.sin(f * 0.24 + seed) * 14 * wave) * Math.PI / 180, b = (26 + Math.sin(f * 0.24 + seed) * 18) * Math.PI / 180;
  const ex = sx + Math.sin(a) * 70 * H, ey = sy + Math.cos(a) * 70 * H;
  return { x: ex + Math.sin(a + b) * 66 * H, y: ey + Math.cos(a + b) * 66 * H };
};
const P: React.FC<{ d: PersonDef; f: number; x: number; y: number; s: number; seed: number; talk?: number; wave?: number; mood?: "happy" | "neutral" | "surprised"; sign?: string; signP?: number }> = ({ d, f, x, y, s, seed, talk = 0, wave = 0, mood = "neutral", sign, signP = 1 }) => {
  const hp = sign ? handUp(f, seed, 0.15) : { x: 0, y: 0 };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Person d={d} f={f} seed={seed} talk={talk} wave={sign ? 0.15 : wave} mood={mood} />
      {sign && (
        <g transform={`translate(${hp.x} ${hp.y}) scale(${clamp01(signP)})`}>
          <line x1={0} y1={14} x2={0} y2={-70} stroke="#8a5a2b" strokeWidth={10} strokeLinecap="round" />
          <rect x={-70} y={-150} width={140} height={90} rx={12} fill="#fff" stroke={INKC} strokeWidth={6} />
          <text y={-86} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED}>{sign}</text>
        </g>
      )}
    </g>
  );
};
const Bolt: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; o?: number; w?: number }> = ({ x1, y1, x2, y2, f, o = 1, w = 10 }) => {
  const n = 7; let d = `M${x1} ${y1}`;
  for (let i = 1; i < n; i++) { const t = i / n; d += ` L${lerp(x1, x2, t) + (rnd("b" + i + Math.floor(f / 2)) - 0.5) * 50} ${lerp(y1, y2, t) + (rnd("c" + i + Math.floor(f / 2)) - 0.5) * 50}`; }
  d += ` L${x2} ${y2}`;
  return <g opacity={o}><path d={d} stroke={BOLT} strokeWidth={w * 2.2} fill="none" opacity={0.35} strokeLinejoin="round" /><path d={d} stroke="#fffbe0" strokeWidth={w} fill="none" strokeLinejoin="round" /></g>;
};
const Room: React.FC<{ dim?: number }> = ({ dim = 0 }) => (
  <g>
    <rect width={VW} height={VH} fill={WALL} />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130 - 20} y={0} width={8} height={1420} fill={WALL2} opacity={0.6} />)}
    <rect y={1240} width={VW} height={22} fill="#8a6a3a" />
    <rect y={1420} width={VW} height={VH - 1420} fill={FLOOR} />
    {[...Array(8)].map((_, i) => <line key={i} x1={i * 160} y1={1420} x2={i * 160 - 200} y2={VH} stroke={FLOOR2} strokeWidth={6} />)}
    <rect width={VW} height={VH} fill="#000" opacity={dim} />
  </g>
);
/** Desk-top shock generator (front view), centered at x, top at y. level = how many of 30 switches are down. */
const Console: React.FC<{ x: number; y: number; w: number; level: number; f: number }> = ({ x, y, w, level }) => {
  const n = 30, sw = (w - 40) / n;
  return (
    <g transform={`translate(${x - w / 2} ${y})`}>
      <rect x={0} y={0} width={w} height={130} rx={10} fill={PANEL} stroke={INKC} strokeWidth={6} />
      <rect x={10} y={10} width={w - 20} height={26} rx={4} fill="#2c3328" />
      <text x={w / 2} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={18} fill="#e8e0c8" letterSpacing={3}>SHOCK GENERATOR</text>
      {[...Array(n)].map((_, i) => (
        <g key={i} transform={`translate(${20 + i * sw + sw / 2} 70)`}>
          <circle cy={-14} r={Math.min(6, sw * 0.25)} fill={i < level ? RED : "#2c3328"} />
          <rect x={-sw * 0.3} y={0} width={sw * 0.6} height={34} rx={3} fill={i < level ? "#c9c9c9" : "#e8e8e8"} stroke={INKC} strokeWidth={2} transform={i < level ? "translate(0 8)" : undefined} />
        </g>
      ))}
    </g>
  );
};

// ---------- shots ----------
// 1. Studio: the question
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><radialGradient id="mgSpot" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#3b4270" /><stop offset="1" stopColor="#12142a" /></radialGradient></defs>
    <rect width={VW} height={VH} fill="url(#mgSpot)" />
    <ellipse cx={300} cy={1505} rx={220} ry={40} fill="#fff" opacity={0.08} />
    <ellipse cx={780} cy={1505} rx={220} ry={40} fill="#fff" opacity={0.08} />
    <rect y={1460} width={VW} height={VH - 1460} fill="#191b33" />
    {/* faint switch silhouettes in the background */}
    {[...Array(10)].map((_, i) => <rect key={i} x={120 + i * 88} y={520} width={40} height={70} rx={6} fill="#fff" opacity={0.05} />)}
    <P d={BIZ} f={f} x={300} y={1500} s={1.02} seed={17} talk={askTalk(f)} mood={speaking(f, "asker", SPK) ? "surprised" : "neutral"} />
    <P d={SCI} f={f} x={790} y={1500} s={1.0} seed={0} talk={hostTalk(f)} mood="happy" wave={f > F.most - 6 && f < F.no + 10 ? 1 : 0} />
    <Bubble f={f} a={36} b={F.askEnd} x={300} y={1020} text={"HURT A\nSTRANGER?!"} dx={90} fs={78} />
    {f >= F.no - 4 && <Chip x={720} y={880} w={420} label="MOST SAY: NO" hue={GREEN} p={pop(f, F.no - 2, 10)} fs={42} textColor={INKC} />}
  </g>
);
// 2. Yale, 1961: Stanley Milgram
const S2_Yale: React.FC<{ f: number }> = ({ f }) => {
  const card = pop(f, F.milgram - 2, 12);
  return (
    <g>
      <defs><linearGradient id="mgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7b267" /><stop offset="1" stopColor="#f4d6a0" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#mgSky)" />
      {/* gothic hall */}
      <g transform="translate(140 520)">
        <rect x={0} y={200} width={800} height={800} fill="#9a8f7e" stroke={INKC} strokeWidth={8} />
        <path d="M300 200 L400 0 L500 200 Z" fill="#8a7f6e" stroke={INKC} strokeWidth={8} />
        <rect x={340} y={-60} width={120} height={260} fill="#8a7f6e" stroke={INKC} strokeWidth={8} />
        <path d="M340 -60 L400 -150 L460 -60 Z" fill="#6d6455" stroke={INKC} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${60 + i * 150} 520 V380 Q${105 + i * 150} 300 ${150 + i * 150} 380 V520 Z`} fill="#3a4a6a" stroke={INKC} strokeWidth={6} />)}
        <path d="M340 1000 V820 Q400 740 460 820 V1000 Z" fill="#4a3424" stroke={INKC} strokeWidth={6} />
        {[...Array(6)].map((_, i) => <rect key={i} x={i * 140 - 10} y={180} width={60} height={30} fill="#8a7f6e" stroke={INKC} strokeWidth={5} />)}
      </g>
      <rect y={1440} width={VW} height={VH - 1440} fill="#5d7a48" />
      <Chip x={540} y={1000} w={420} label="YALE UNIVERSITY" hue={NAVY} p={pop(f, F.yale - 2, 10)} fs={38} />
      {f < F.milgram && <g opacity={1 - ramp(f, F.milgram - 12, F.milgram - 2)}><BigNum f={f} at={F.in1961 - 2} text="1961" x={540} y={420} hue={YEL} fs={190} /></g>}
      {f >= F.milgram - 2 && (
        <g opacity={clamp01(card)} transform={`translate(540 1230) scale(${card}) rotate(-2)`}>
          <rect x={-330} y={-90} width={660} height={180} rx={18} fill="#fffaf0" stroke={INKC} strokeWidth={8} />
          <text y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill={INKC}>STANLEY MILGRAM</text>
          <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#7a5a2b" letterSpacing={4}>PSYCHOLOGIST</text>
        </g>
      )}
      <P d={SCI} f={f} x={900} y={1560} s={0.62} seed={0} talk={hostTalk(f)} mood="happy" />
      <Stamp f={f} at={F.tested} x={540} y={680} text="THE TEST" hue={RED} fs={84} rot={-8} />
    </g>
  );
};
// 3. The shock generator: 15 → 450 volts
const S3_Panel: React.FC<{ f: number }> = ({ f }) => {
  const groups = ["SLIGHT", "MODERATE", "STRONG", "VERY STRONG", "INTENSE", "EXTREME", "DANGER", "XXX"];
  const n = 30, x0 = 60, sw = 32;
  const lit = Math.floor(30 * eio(ramp(f, F.v15, F.v450 + 6)));
  return (
    <g>
      <rect width={VW} height={VH} fill="#2a2f26" />
      <rect x={20} y={640} width={VW - 40} height={560} rx={24} fill={PANEL} stroke={INKC} strokeWidth={10} />
      <rect x={50} y={670} width={VW - 100} height={60} rx={8} fill="#2c3328" />
      <text x={540} y={713} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#e8e0c8" letterSpacing={6}>SHOCK GENERATOR</text>
      {groups.map((g, i) => {
        const gx = x0 + i * 4 * sw, gw = (i === 7 ? 2 : 4) * sw;
        return (
          <g key={g}>
            <rect x={gx + 2} y={760} width={gw - 4} height={40} rx={6} fill={i >= 6 ? RED : "#e8e0c8"} opacity={0.9} />
            <text x={gx + gw / 2} y={787} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={i === 7 ? 20 : 15} fill={i >= 6 ? "#fff" : INKC}>{g}</text>
          </g>
        );
      })}
      {[...Array(n)].map((_, i) => (
        <g key={i} transform={`translate(${x0 + i * sw + sw / 2} 860)`}>
          <circle cy={-30} r={9} fill={i < lit ? RED : "#2c3328"} stroke={INKC} strokeWidth={2} />
          <rect x={-11} y={0} width={22} height={90} rx={5} fill="#ececec" stroke={INKC} strokeWidth={3} />
          <rect x={-7} y={6} width={14} height={30} rx={3} fill="#888" />
          <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={15} fill="#e8e0c8" transform="rotate(-90 0 140) translate(-10 5)">{(i + 1) * 15}</text>
        </g>
      ))}
      <path d="M1040 1100 Q1080 1300 1080 1300" stroke="#222" strokeWidth={10} fill="none" />
      {f < F.v15 - 2 && <Chip x={540} y={1250} w={420} label="TO THE NEXT ROOM →" hue="#e8e0c8" p={pop(f, F.machine, 10)} fs={30} textColor={INKC} />}
      {f >= F.v15 - 2 && f < F.v450 && <BigNum f={f} at={F.v15 - 2} text="15 V" x={300} y={500} hue={GREEN} fs={140} />}
      {f >= F.v450 - 2 && <BigNum f={f} at={F.v450 - 2} text="450 V" x={760} y={500} hue={RED} fs={150} />}
    </g>
  );
};
/** Lab set: volunteer (asker) at the console left, wall, learner strapped in the next room right. */
const Lab: React.FC<{ f: number; level: number; zap?: number; wallShake?: number; dimR?: number; learnerMood?: "happy" | "neutral" | "surprised"; volMood?: "happy" | "neutral" | "surprised"; children?: React.ReactNode; doc?: number }> = ({ f, level, zap = 0, wallShake = 0, dimR = 0, learnerMood = "neutral", volMood = "neutral", children, doc = 0 }) => {
  const wx = 580 + wallShake;
  return (
    <g>
      <Room />
      {/* learner room */}
      <rect x={wx} y={0} width={VW - wx} height={VH} fill="#cdbf9c" />
      <rect x={wx} y={1420} width={VW - wx} height={VH - 1420} fill="#3e4c34" />
      <rect x={720} y={1080} width={200} height={360} rx={16} fill="#6b4a2b" stroke={INKC} strokeWidth={6} />
      <P d={LEARNER} f={f} x={820} y={1500} s={0.9} seed={9} mood={learnerMood} />
      <rect x={705} y={1330} width={230} height={22} rx={8} fill="#3a2a1a" />
      <path d={`M${wx} 1180 Q 700 1200 ${820 - 102} ${1500 - 153}`} stroke="#222" strokeWidth={6} fill="none" />
      {zap > 0 && <Bolt x1={wx} y1={1180} x2={820 - 100} y2={1500 - 160} f={f} o={zap} w={8} />}
      <rect x={wx} y={0} width={VW - wx} height={VH} fill="#000" opacity={dimR} />
      {/* wall */}
      <rect x={wx - 26} y={0} width={52} height={VH} fill="#b8a77e" stroke={INKC} strokeWidth={6} />
      {/* experimenter */}
      {doc > 0 && <g opacity={clamp01(doc)}><P d={DOC} f={f} x={lerp(-120, 445, eout(clamp01(doc)))} y={1450} s={0.86} seed={7} mood="neutral" /></g>}
      {/* volunteer + console */}
      <P d={BIZ} f={f} x={230} y={1500} s={0.98} seed={17} talk={askTalk(f)} mood={volMood} />
      <rect x={60} y={1440} width={400} height={140} rx={10} fill="#6b4a2b" stroke={INKC} strokeWidth={6} />
      <Console x={260} y={1375} w={380} level={level} f={f} />
      {zap > 0 && <Bolt x1={420} y1={1385} x2={wx - 30} y2={1180} f={f} o={zap} w={7} />}
      {children}
    </g>
  );
};
// 4. Wrong answer → shock, harder each time
const S4_Shock: React.FC<{ f: number }> = ({ f }) => {
  const level = f < F.shock ? 4 : f < F.harder ? 5 : 5 + Math.floor(ramp(f, F.harder, F.real - 10) * 9);
  const zapT = [F.shock, F.harder + 4, F.each + 6, F.each + 22];
  const zap = Math.max(...zapT.map((t) => (f >= t && f < t + 10 ? 1 - (f - t) / 10 : 0)));
  const volts = level * 15;
  return (
    <Lab f={f} level={level} zap={zap} learnerMood={zap > 0.2 ? "surprised" : "neutral"} volMood={zap > 0.2 ? "surprised" : "neutral"}>
      <Chip x={820} y={600} w={330} label="NEXT ROOM" hue="#7a5a2b" p={pop(f, F.room - 4, 10)} fs={36} />
      {f >= F.wrong - 2 && f < F.harder && (
        <g opacity={clamp01(pop(f, F.wrong - 2, 10))} transform="translate(820 820)">
          <rect x={-200} y={-66} width={400} height={132} rx={24} fill="#fff" stroke={RED} strokeWidth={10} />
          <text y={25} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={RED}>✗ WRONG</text>
        </g>
      )}
      {f >= F.shock - 2 && f < F.harder && <BigNum f={f} at={F.shock - 2} text="ZAP!" x={300} y={760} hue={BOLT} fs={140} />}
      {f >= F.harder - 2 && (
        <g>
          <text x={300} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={INKC} opacity={pop(f, F.harder - 2, 10)}>HARDER EACH TIME</text>
          <text x={300} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={volts > 150 ? RED : "#e8a21c"} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.harder, 10)}>{volts} V</text>
        </g>
      )}
    </Lab>
  );
};
// 5. "Real shocks?!" → fake, an actor; screams, bangs, silence
const S5_Actor: React.FC<{ f: number }> = ({ f }) => {
  const level = f < F.screamed ? 14 : f < F.banged ? 18 : f < F.then ? 21 : 24;
  const bangs = [F.banged, F.banged + 12, F.wall, F.wall + 10];
  const sh = bangs.reduce((acc, t) => acc + (f >= t && f < t + 8 ? Math.sin((f - t) * 2.2) * 10 * (1 - (f - t) / 8) : 0), 0);
  const silent = eio(ramp(f, F.then, F.silent + 6));
  return (
    <Lab f={f} level={level} wallShake={sh} dimR={silent * 0.55} learnerMood={f >= F.screamed && f < F.then ? "surprised" : f >= F.actor && f < F.but ? "happy" : "neutral"} volMood={(f >= F.real && f < F.fake) || (f >= F.screamed && f < F.silent + 30) ? "surprised" : "neutral"}>
      <Bubble f={f} a={F.real} b={F.realEnd} x={230} y={1020} text={"REAL\nSHOCKS?!"} dx={90} fs={80} />
      {f < F.didnt - 4 && <Stamp f={f} at={F.fake} x={800} y={780} text="FAKE" hue={RED} fs={100} rot={-10} />}
      {f >= F.actor - 4 && f < F.screamed && (
        <g opacity={clamp01(pop(f, F.actor - 4, 10))} transform="translate(820 1000)">
          <rect x={-160} y={-50} width={320} height={100} rx={50} fill={YEL} stroke={INKC} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={INKC}>ACTOR</text>
        </g>
      )}
      {f >= F.didnt - 4 && f < F.screamed && (
        <g opacity={clamp01(pop(f, F.didnt - 4, 10))}>
          {[0, 1, 2].map((i) => <text key={i} x={140 + i * 70} y={960 - i * 30 + Math.sin(f * 0.2 + i) * 8} fontFamily={FONT} fontWeight={800} fontSize={90 - i * 14} fill={YEL} stroke={INKC} strokeWidth={7} paintOrder="stroke">?</text>)}
          <Chip x={290} y={640} w={380} label="DIDN'T KNOW" hue={RED} p={1} fs={40} />
        </g>
      )}
      {f >= F.screamed - 2 && f < F.then && (
        <g transform={`translate(820 ${860 + Math.sin(f * 0.9) * 6}) rotate(${-6 + Math.sin(f * 0.7) * 3})`} opacity={clamp01(pop(f, F.screamed - 2, 8))}>
          <path d="M-190 -20 L-150 -80 L-90 -60 L-40 -120 L10 -70 L70 -110 L100 -50 L180 -70 L150 0 L190 50 L120 60 L130 120 L60 80 L0 130 L-40 80 L-110 120 L-110 60 L-190 60 Z" fill="#fff" stroke={RED} strokeWidth={8} strokeLinejoin="round" />
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={RED}>AAAH!</text>
        </g>
      )}
      {bangs.map((t, i) => f >= t && f < t + 22 && (
        <text key={i} x={[430, 680, 450, 700][i]} y={[520, 420, 360, 600][i]} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={clamp01(pop(f, t, 6)) * (1 - ramp(f, t + 14, t + 22))} transform={`rotate(${i % 2 ? 8 : -8} ${[430, 680, 450, 700][i]} ${[520, 420, 360, 600][i]})`}>BANG!</text>
      ))}
      {f >= F.silent - 6 && (
        <g opacity={pop(f, F.silent - 4, 12)}>
          <text x={820} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">...</text>
          <text x={820} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" letterSpacing={8}>SILENT</text>
        </g>
      )}
    </Lab>
  );
};
// 6. "So people stopped, right?" → the man in the lab coat
const S6_Coat: React.FC<{ f: number }> = ({ f }) => {
  const doc = ramp(f, 1046, F.lab + 4);
  const quote = "THE EXPERIMENT REQUIRES THAT YOU CONTINUE.";
  const chars = Math.floor(clamp01((f - F.said) / (F.continue + 14 - F.said)) * quote.length);
  const lines = ["THE EXPERIMENT", "REQUIRES THAT", "YOU CONTINUE."];
  let rem = chars;
  return (
    <Lab f={f} level={24} dimR={0.4} doc={doc} volMood={f < F.lab ? "surprised" : "neutral"}>
      <Bubble f={f} a={F.stopped} b={F.stoppedEnd} x={230} y={1020} text={"THEY STOPPED,\nRIGHT?"} dx={150} fs={70} />
      {f >= F.coat - 2 && f < F.said && <Chip x={470} y={960} w={340} label="LAB COAT" hue="#fbfbf8" p={pop(f, F.coat - 2, 10)} fs={40} textColor={INKC} />}
      {f >= F.said - 4 && (
        <g opacity={clamp01(pop(f, F.said - 4, 10))} transform="translate(540 640)">
          <rect x={-470} y={-190} width={940} height={360} rx={30} fill="#fffaf0" stroke={INKC} strokeWidth={10} />
          <text x={-430} y={-110} fontFamily={FONT} fontWeight={800} fontSize={130} fill="#c9b78f">“</text>
          {lines.map((l, i) => { const take = Math.max(0, Math.min(l.length, rem)); rem -= l.length + 1; return <text key={i} x={0} y={-60 + i * 92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={76} fill={i === 2 ? RED : INKC}>{l.slice(0, take)}</text>; })}
        </g>
      )}
    </Lab>
  );
};
// 7. Prediction vs reality: 1 in 1000 vs 65%
const S7_Numbers: React.FC<{ f: number }> = ({ f }) => {
  const cols = 40, rows = 25, gx = 120, gy = 330, st = 21;
  const hl = pop(f, F.one - 2, 12);
  const bar = eio(ramp(f, F.sixty - 4, F.pressed));
  const pct = countUp(f, F.sixty - 4, F.pressed, 65);
  const flash = f >= F.v450b - 2 && f < F.v450b + 8 ? 1 - (f - F.v450b + 2) / 10 : 0;
  return (
    <g>
      <rect width={VW} height={VH} fill="#f3ead6" />
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={INKC} opacity={pop(f, F.experts, 10)}>EXPERTS PREDICTED</text>
      {[...Array(cols * rows)].map((_, i) => {
        const c = i % cols, r = Math.floor(i / cols), on = i === 512;
        return <circle key={i} cx={gx + c * st} cy={gy + r * st} r={on ? 7 + 6 * clamp01(hl) : 6} fill={on && hl > 0 ? RED : "#b9ab8a"} opacity={clamp01((f - F.experts - r * 0.8) / 6)} />;
      })}
      {hl > 0 && <circle cx={gx + 32 * st} cy={gy + 12 * st} r={30 + 10 * Math.sin(f * 0.3)} fill="none" stroke={RED} strokeWidth={6} />}
      {f >= F.one - 2 && <Chip x={540} y={900} w={460} label="1 IN 1,000" hue={RED} p={hl * (1 - ramp(f, F.realnum - 10, F.realnum))} fs={52} />}
      {/* bars */}
      <text x={540} y={1020} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={INKC} opacity={pop(f, F.realnum - 4, 10)}>THE REAL NUMBER?</text>
      <g transform="translate(140 1070)" opacity={ramp(f, F.realnum - 4, F.realnum + 6)}>
        <text x={0} y={34} fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>PREDICTED</text>
        <rect x={240} y={4} width={6} height={44} fill={RED} />
        <text x={262} y={38} fontFamily={FONT} fontWeight={800} fontSize={34} fill={RED}>0.1%</text>
        <text x={0} y={134} fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>ACTUAL</text>
        <rect x={240} y={96} width={560 * bar} height={56} rx={8} fill={RED} stroke={INKC} strokeWidth={4} />
      </g>
      {f >= F.sixty - 4 && <text opacity={1 - ramp(f, F.final - 8, F.final)} x={540} y={1420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={190} fill={RED} stroke={INKC} strokeWidth={9} paintOrder="stroke">{pct}%</text>}
      {f >= F.final - 6 && (
        <g opacity={clamp01(pop(f, F.final - 6, 10))} transform={`translate(540 1380) scale(${1.3 * clamp01(pop(f, F.final - 6, 10))})`}>
          <rect x={-250} y={-60} width={500} height={120} rx={20} fill={PANEL} stroke={INKC} strokeWidth={6} />
          <rect x={-30} y={-40} width={60} height={80} rx={8} fill={f >= F.v450b - 2 ? "#c9c9c9" : "#ececec"} stroke={INKC} strokeWidth={4} transform={f >= F.v450b - 2 ? "translate(0 10)" : undefined} />
          <text x={-150} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill="#fff">XXX</text>
          <text x={150} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={BOLT}>450 V</text>
        </g>
      )}
      <rect width={VW} height={VH} fill="#fff" opacity={flash * 0.7} />
    </g>
  );
};
// 8. "That's two out of three people!"
const S8_TwoThree: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><radialGradient id="mgSpot2" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#3b4270" /><stop offset="1" stopColor="#12142a" /></radialGradient></defs>
    <rect width={VW} height={VH} fill="url(#mgSpot2)" />
    <rect y={1460} width={VW} height={VH - 1460} fill="#191b33" />
    {[0, 1, 2].map((i) => {
      const p = clamp01(pop(f, F.twoOf + 8 + i * 5, 10)), red = i < 2;
      return (
        <g key={i} opacity={p} transform={`translate(${340 + i * 200} 560) scale(${p})`}>
          <circle cy={-70} r={46} fill={red ? RED : "#7d86b8"} stroke={INKC} strokeWidth={6} />
          <path d="M-70 60 Q-70 -20 0 -20 Q70 -20 70 60 Z" fill={red ? RED : "#7d86b8"} stroke={INKC} strokeWidth={6} />
        </g>
      );
    })}
    {f >= F.twoOf + 20 && <BigNum f={f} at={F.twoOf + 20} text="2 / 3" x={540} y={820} hue={RED} fs={130} />}
    <P d={BIZ} f={f} x={300} y={1500} s={1.02} seed={17} talk={askTalk(f)} mood="surprised" />
    <P d={SCI} f={f} x={790} y={1500} s={1.0} seed={0} talk={hostTalk(f)} mood="happy" wave={f > F.hopeful - 8 ? 1 : 0} />
    <Bubble f={f} a={F.twoOf} b={F.twoEnd} x={300} y={1020} text={"2 OUT OF 3?!"} dx={120} fs={80} />
    {f >= F.hopeful - 4 && <Chip x={700} y={960} w={440} label="THE HOPEFUL PART" hue={GREEN} p={pop(f, F.hopeful - 4, 10)} fs={38} textColor={INKC} />}
  </g>
);
// 9. Two rebels refuse → 10%; one "no" gives everyone courage
const S9_Rebels: React.FC<{ f: number }> = ({ f }) => {
  const drop = eio(ramp(f, F.ten - 8, F.ten + 14));
  const pct = Math.round(lerp(65, 10, drop));
  const glow = eio(ramp(f, F.courage - 6, F.courage + 12));
  return (
    <g>
      <Room />
      <rect width={VW} height={VH} fill={YEL} opacity={0.18 * glow} />
      <rect x={0} y={1440} width={VW} height={140} fill="#6b4a2b" stroke={INKC} strokeWidth={6} />
      <Console x={540} y={1375} w={460} level={20} f={f} />
      <P d={REB1} f={f} x={215} y={1500} s={0.92} seed={20} mood={f >= F.refused ? "neutral" : "neutral"} sign={f >= F.refused - 4 ? "NO" : undefined} signP={pop(f, F.refused - 4, 10)} />
      <P d={BIZ} f={f} x={540} y={1500} s={0.98} seed={17} mood={f >= F.sayNo ? "happy" : f >= F.courage ? "surprised" : "neutral"} sign={f >= F.sayNo - 4 ? "NO" : undefined} signP={pop(f, F.sayNo - 4, 10)} />
      <P d={REB2} f={f} x={835} y={1500} s={0.92} seed={4} mood="neutral" sign={f >= F.refused + 4 ? "NO" : undefined} signP={pop(f, F.refused + 4, 10)} />
      {f >= F.two - 2 && f < F.onePerson && <Chip x={540} y={420} w={480} label="2 REFUSED FIRST" hue={GREEN} p={pop(f, F.two - 2, 10)} fs={42} textColor={INKC} />}
      {f >= F.ten - 10 && f < F.onePerson + 10 && (
        <g opacity={1 - ramp(f, F.onePerson, F.onePerson + 10)}>
          <text x={540} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={200} fill={drop > 0.9 ? GREEN : RED} stroke={INKC} strokeWidth={9} paintOrder="stroke" transform={`translate(540 640) scale(${1 + 0.15 * Math.sin(clamp01((f - F.ten) / 10) * Math.PI)}) translate(-540 -640)`}>{pct}%</text>
          <text x={540} y={780} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>WENT TO THE END</text>
        </g>
      )}
      {f >= F.onePerson && (
        <g>
          <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INKC} opacity={pop(f, F.onePerson, 10)}>ONE "NO"...</text>
          {f >= F.courage - 6 && <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, F.courage - 6, 10)}>= COURAGE</text>}
        </g>
      )}
      {glow > 0 && [0, 1].map((i) => { const q = ((f - F.courage) * 0.02 + i * 0.5) % 1; return <circle key={i} cx={540} cy={1100} r={100 + q * 500} fill="none" stroke={YEL} strokeWidth={8 * (1 - q)} opacity={(1 - q) * glow} />; })}
    </g>
  );
};
// 10. Outro
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><radialGradient id="mgSpot3" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#3b4270" /><stop offset="1" stopColor="#12142a" /></radialGradient></defs>
    <rect width={VW} height={VH} fill="url(#mgSpot3)" />
    <rect y={1460} width={VW} height={VH - 1460} fill="#191b33" />
    <Outro f={f} at={F.sub} />
    <P d={SCI} f={f} x={180} y={1500} s={0.82} seed={0} talk={hostTalk(f)} wave={1} mood="happy" />
    <P d={BIZ} f={f} x={900} y={1500} s={0.84} seed={17} wave={1} mood="happy" />
  </g>
);

export const MilgramFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.in1961 - 6, render: () => <S1_Ask f={f} />, cam: [[0, { x: 400, y: 1080, z: 1.18 }], [F.askEnd, { x: 440, y: 1060, z: 1.12 }], [F.most + 6, { x: 600, y: 1040, z: 1.1 }], [F.in1961, { x: 640, y: 1040, z: 1.16 }]] },
    { from: F.in1961 - 6, to: F.volunteers, tr: "flash", render: () => <S2_Yale f={f} />, cam: [[F.in1961 - 6, { x: 540, y: 600, z: 1.25 }], [F.yale + 10, { x: 540, y: 820, z: 1.08 }], [F.milgram, { x: 540, y: 1060, z: 1.12 }], [F.volunteers, { x: 540, y: 900, z: 1.04 }]] },
    { from: F.volunteers, to: F.every, tr: "whip", render: () => <S3_Panel f={f} />, cam: [[F.volunteers, { x: 540, y: 900, z: 1.0 }], [F.switches, { x: 300, y: 900, z: 1.45 }], [F.v15 + 2, { x: 300, y: 860, z: 1.45 }], [F.v450 + 6, { x: 780, y: 860, z: 1.45, r: 1 }], [F.every, { x: 660, y: 900, z: 1.25 }]] },
    { from: F.every, to: F.real, tr: "wipe", render: () => <S4_Shock f={f} />, cam: [[F.every, { x: 540, y: 1000, z: 1.0 }], [F.wrong, { x: 600, y: 1020, z: 1.05 }], [F.shock, { x: 560, y: 1040, z: 1.04 }], [F.harder + 10, { x: 440, y: 1000, z: 1.12, r: -1 }], [F.real, { x: 420, y: 1040, z: 1.15 }]] },
    { from: F.real, to: F.stopped, tr: "push", render: () => <S5_Actor f={f} />, cam: [[F.real, { x: 400, y: 1060, z: 1.15 }], [F.fake - 4, { x: 420, y: 1040, z: 1.12 }], [F.actor, { x: 780, y: 1000, z: 1.3 }], [F.didnt, { x: 420, y: 1000, z: 1.08 }], [F.screamed, { x: 680, y: 960, z: 1.12 }], [F.wall + 10, { x: 600, y: 900, z: 1.04 }], [F.silent, { x: 760, y: 1000, z: 1.3 }], [F.stopped, { x: 760, y: 1000, z: 1.34 }]] },
    { from: F.stopped, to: F.experts, tr: "zoom", render: () => <S6_Coat f={f} />, cam: [[F.stopped, { x: 400, y: 1080, z: 1.18 }], [F.lab, { x: 420, y: 1060, z: 1.08 }], [F.said, { x: 540, y: 900, z: 1.04 }], [F.experts, { x: 540, y: 860, z: 1.1 }]] },
    { from: F.experts, to: F.twoOf, tr: "spin", render: () => <S7_Numbers f={f} />, cam: [[F.experts, { x: 540, y: 620, z: 1.2 }], [F.one, { x: 560, y: 640, z: 1.16 }], [F.allway, { x: 540, y: 700, z: 1.08 }], [F.realnum + 8, { x: 540, y: 1100, z: 1.08 }], [F.final, { x: 540, y: 1150, z: 1.08 }], [F.v450b + 6, { x: 540, y: 1250, z: 1.18 }], [F.twoOf, { x: 540, y: 1250, z: 1.14 }]] },
    { from: F.twoOf, to: F.two - 8, tr: "iris", render: () => <S8_TwoThree f={f} />, cam: [[F.twoOf, { x: 480, y: 980, z: 1.1 }], [F.hopeful, { x: 560, y: 1000, z: 1.06 }], [F.two - 8, { x: 620, y: 1040, z: 1.12 }]] },
    { from: F.two - 8, to: F.sub, tr: "whipUp", render: () => <S9_Rebels f={f} />, cam: [[F.two - 8, { x: 540, y: 1000, z: 1.0 }], [F.refused + 10, { x: 540, y: 1000, z: 1.03 }], [F.ten + 6, { x: 540, y: 940, z: 1.05 }], [F.onePerson, { x: 300, y: 1000, z: 1.15 }], [F.gives, { x: 420, y: 1000, z: 1.12 }], [F.sayNo + 10, { x: 540, y: 980, z: 1.04 }], [F.sub, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.no, 0.06], [F.in1961, 0.12], [F.v450 - 2, 0.12], [F.wrong, 0.08], [F.shock, 0.1], [F.fake, 0.14], [F.screamed, 0.08], [F.silent, 0.06], [F.continue, 0.08], [F.one, 0.1], [F.sixty, 0.14], [F.v450b, 0.16], [F.twoOf + 20, 0.1], [F.ten, 0.14], [F.sayNo, 0.1]];
  const SHAKE: [number, number][] = [[F.shock, 10], [F.fake, 8], [F.banged, 12], [F.wall, 12], [F.v450b, 16], [F.ten, 8]];
  const SFX: Cue[] = [
    [34, "pop", 0.45], [F.no - 2, "pop", 0.35], [F.yale - 2, "pop", 0.3], [F.milgram - 2, "pop", 0.4], [F.tested, "impact", 0.45],
    [F.machine, "tick", 0.3], [F.v15 - 2, "pop", 0.4], [F.v450 - 2, "impact", 0.45], [F.room - 4, "pop", 0.3], [F.wrong - 2, "tick", 0.45],
    [F.shock, "impact", 0.4], [F.harder + 4, "impact", 0.3], [F.each + 6, "impact", 0.3], [F.each + 22, "impact", 0.3],
    [F.real - 2, "pop", 0.45], [F.fake, "boom", 0.4], [F.actor - 4, "pop", 0.4], [F.didnt - 4, "tick", 0.3], [F.screamed - 2, "impact", 0.35],
    [F.banged, "impact", 0.45], [F.banged + 12, "impact", 0.4], [F.wall, "impact", 0.45], [F.wall + 10, "impact", 0.4], [F.then - 40, "riser_dark", 0.3],
    [F.stopped - 2, "pop", 0.45], [F.coat - 2, "pop", 0.3], [F.said - 4, "tick", 0.35],
    [F.experts, "pop", 0.3], [F.one - 2, "pop", 0.45], [F.realnum - 4, "riser", 0.3], [F.sixty - 4, "boom", 0.45], [F.v450b - 2, "impact", 0.55],
    [F.twoOf - 2, "pop", 0.45], [F.twoOf + 20, "impact", 0.35], [F.hopeful - 4, "pop", 0.35],
    [F.refused - 4, "pop", 0.4], [F.refused + 4, "pop", 0.4], [F.ten - 8, "whoosh", 0.3], [F.ten, "impact", 0.4], [F.courage - 6, "riser", 0.3], [F.sayNo - 4, "boom", 0.4],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < F.every ? YEL : f < F.twoOf ? RED : f < F.two ? YEL : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="OBEY?" sub="WOULD YOU HURT A STRANGER?" until={34} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme={f >= F.experts && f < F.twoOf ? "light" : "dark"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="milgram" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
