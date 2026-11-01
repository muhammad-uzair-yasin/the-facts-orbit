import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
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
  ask: ASK[0][0], hijack: W("hijack"), jump: W("jump"), vanish: W("vanish"),
  november: W("november"), d24: W("24th"), y1971: W("1971"), quiet: W("quiet"), suit: W("suit"), ticket: W("ticket"), portland: W("portland"), dan: W("dan"),
  soon: W("soon"), takeoff: W("takeoff"), hands: W("hands"), note: W("note"), says: W("says"), bomb: W("bomb"),
  want: ASK[1][0], two: W("two"), thousand: W("thousand"), dollars: W("dollars"), four: W("four"), parachutes: W("parachutes"),
  seattle: W("seattle"), money: W("money"), passenger: W("passenger"), go: W("go"),
  then: ASK[2][0], plane2: W("plane", 2), mexico: W("mexico"), somewhere: W("somewhere"), washington: W("washington"), night: W("night"), rain: W("rain"),
  opened: W("opened"), stairs: W("stairs"), jumped: W("jumped"),
  withMoney: ASK[3][0], with2: W("with", 2), suit2: W("suit", 2), loafers: W("loafers"), never: W("never"), seen: W("seen"),
  found: ASK[4][0], y1980: W("1980"), eight: W("eight-year-old"), boy: W("boy"), digging: W("digging"), river: W("river"), bundles: W("bundles"), twenty: W("twenty-dollar"),
  serial: W("serial"), matched: W("matched"), ransom: W("ransom"), rest: W("rest"), man3: W("man", 3), missing: W("missing"),
  sub: W("subscribe"),
};

const YT = CAST[42], DET = CAST[3];
const COOPER: PersonDef = { ...CAST[17], glasses: "shades", tie: "#111111", topC: "#2a2a33", pants: "#2a2a33", prop: "none" };
const ATTENDANT: PersonDef = { name: "Attendant", skin: "#efc69d", hair: "bun", hairC: "#2a1d18", top: "uniform", topC: "#3d6ccf", pants: "#3d6ccf", shoes: "#111111", prop: "none", lip: "#c0392b" };
const BOY: PersonDef = { ...CAST[11], prop: "none", topC: "#3ddc97" };
const NAVY = "#0b1026", RED = "#ff4d3d", GREEN = "#3ddc97", MONEY = "#5aa86a", PAPER = "#f4ecd8", AMBER = "#ffb13b";
const GROUND = 1560;

// ---------- Q&A kit ----------
const Q: { text: string; hot?: boolean }[] = [
  { text: "HIJACK, JUMP...\nAND VANISH?!", hot: true },
  { text: "WHAT DID\nHE WANT?" },
  { text: "THEN WHAT?!", hot: true },
  { text: "WITH THE\nMONEY?!", hot: true },
  { text: "NEVER FOUND\nANYTHING?" },
];
const lineAt = (f: number) => ASK.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
const askMood = (f: number, base: "happy" | "neutral" | "surprised" = "happy") => { const i = lineAt(f); return i >= 0 ? (Q[i]?.hot ? "surprised" : "neutral") : base; };
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
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; askBase?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised"; wave?: boolean; hostWave?: boolean }> = ({ f, ax = 260, hx = 820, y = GROUND, s = 0.84, askBase = "neutral", hostMood = "happy", wave, hostWave }) => {
  const hTalk = speaking(f, "host", SPK);
  return (
    <g>
      <g transform={`translate(${ax} ${y}) scale(${s})`}>
        <Person d={YT} f={f} seed={43} talk={talkFor(f, "asker", SPK, ENV)} wave={wave ? 1 : 0} mood={askMood(f, askBase)} />
      </g>
      <g transform={`translate(${hx} ${y}) scale(${-s} ${s})`}>
        <Person d={DET} f={f} seed={4} talk={talkFor(f, "host", SPK, ENV)} wave={hostWave || (hTalk && Math.sin(f * 0.045) > 0.55) ? 1 : 0} mood={hostMood} />
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
const Label: React.FC<{ x: number; y: number; text: string; p: number; fs?: number; fill?: string; rot?: number }> = ({ x, y, text, p, fs = 56, fill = "#ffffff", rot = 0 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${clamp01(p) * 0.3 + 0.7 * p})`} opacity={clamp01(p)}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={fill} stroke={INKC} strokeWidth={fs * 0.14} paintOrder="stroke" strokeLinejoin="round">{text}</text>
  </g>
);
const Rain: React.FC<{ f: number; n?: number; o?: number; area?: [number, number, number, number]; seed?: string }> = ({ f, n = 70, o = 0.45, area = [0, 0, VW, VH], seed = "rn" }) => (
  <g opacity={o}>
    {[...Array(n)].map((_, i) => {
      const [x0, y0, w, h] = area;
      const y = y0 + ((rnd(seed + "y" + i) * h + f * 38) % h);
      const x = x0 + ((rnd(seed + "x" + i) * w - f * 9) % w + w) % w;
      return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 60} stroke="#a8c4ff" strokeWidth={3} strokeLinecap="round" />;
    })}
  </g>
);
const Fig: React.FC<{ d: PersonDef; f: number; x: number; y: number; s?: number; seed?: number; mood?: "happy" | "neutral" | "surprised"; flip?: boolean; wave?: number; talk?: number }> = ({ d, f, x, y, s = 1, seed = 1, mood = "neutral", flip, wave = 0, talk = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}><Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood} /></g>
);
/** Noir detective office: rain on the window, case board. */
const Office: React.FC<{ f: number; id: string }> = ({ f, id }) => (
  <g>
    <Grad id={id} top="#1c2a2e" bot="#2e3a34" h={1480} />
    {/* window with rain */}
    <g transform="translate(250 520)">
      <rect x={-170} y={-240} width={340} height={440} fill="#0b1026" stroke="#5a4a3a" strokeWidth={16} />
      {[...Array(6)].map((_, i) => <rect key={i} x={-150 + i * 52} y={60 - (i % 3) * 60} width={40} height={140 + (i % 3) * 60} fill="#141a3a" />)}
      {[...Array(10)].map((_, i) => <rect key={"w" + i} x={-140 + (i % 5) * 60} y={90 + Math.floor(i / 5) * 50} width={12} height={16} fill={AMBER} opacity={0.7} />)}
      <Rain f={f} n={22} o={0.5} area={[-170, -240, 340, 440]} seed={id} />
      <line x1={0} x2={0} y1={-240} y2={200} stroke="#5a4a3a" strokeWidth={10} /><line x1={-170} x2={170} y1={-20} y2={-20} stroke="#5a4a3a" strokeWidth={10} />
    </g>
    {/* case board */}
    <g transform="translate(780 560)">
      <rect x={-210} y={-250} width={420} height={480} rx={10} fill="#b88a5a" stroke={INKC} strokeWidth={8} />
      <rect x={-170} y={-210} width={160} height={190} fill={PAPER} stroke={INKC} strokeWidth={4} transform="rotate(-4 -90 -115)" />
      <g transform="translate(-90 -110) scale(0.36)"><g transform="translate(0 200)"><Person d={COOPER} f={0} seed={1} talk={0} mood="neutral" /></g></g>
      <rect x={20} y={-200} width={160} height={110} fill={PAPER} stroke={INKC} strokeWidth={4} transform="rotate(5 100 -145)" />
      <text x={100} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INKC} transform="rotate(5 100 -145)">NORJAK</text>
      <rect x={-150} y={40} width={300} height={140} fill={PAPER} stroke={INKC} strokeWidth={4} transform="rotate(-2 0 110)" />
      <text x={0} y={128} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={RED} transform="rotate(-8 0 110)" letterSpacing={3}>UNSOLVED</text>
      <path d="M-90 -110 L100 -145 M-90 -110 L0 100" stroke={RED} strokeWidth={4} />
      {[[-90, -200], [100, -195], [0, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill={RED} stroke={INKC} strokeWidth={3} />)}
    </g>
    {/* lamp glow */}
    <ellipse cx={540} cy={1200} rx={520} ry={260} fill={AMBER} opacity={0.08} />
    <rect x={0} y={1480} width={VW} height={VH - 1480} fill="#1e1a18" />
    {[...Array(9)].map((_, i) => <line key={i} x1={i * 130} x2={i * 130 - 80} y1={1480} y2={VH} stroke="#000" strokeWidth={3} opacity={0.3} />)}
  </g>
);
/** Boeing 727 side view (faces right). stairs 0..1 lowers the rear airstair. */
const Jet: React.FC<{ x: number; y: number; s?: number; stairs?: number; lights?: boolean; f: number }> = ({ x, y, s = 1, stairs = 0, lights, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* aft airstair under the tail */}
    <g transform={`rotate(${lerp(0, 32, stairs)} -300 40)`}>
      <rect x={-420} y={30} width={130} height={18} fill="#9aa4b8" stroke={INKC} strokeWidth={4} opacity={stairs > 0.02 ? 1 : 0} />
      {stairs > 0.02 && [...Array(5)].map((_, i) => <line key={i} x1={-410 + i * 24} x2={-410 + i * 24} y1={30} y2={48} stroke={INKC} strokeWidth={3} />)}
    </g>
    <path d="M-440 -20 Q-460 0 -430 40 L420 40 Q500 30 520 0 Q500 -40 420 -50 L-380 -50 Z" fill="#f4f4f6" stroke={INKC} strokeWidth={6} />
    <rect x={-400} y={-6} width={830} height={12} fill="#3d6ccf" />
    {[...Array(18)].map((_, i) => <circle key={i} cx={-300 + i * 38} cy={-24} r={8} fill={lights ? AMBER : "#5a7aa8"} stroke={INKC} strokeWidth={2} />)}
    <path d="M440 -40 Q480 -40 500 -10 L460 -10 Z" fill="#2a3a5a" />
    {/* wing */}
    <path d="M40 10 L-120 110 L-60 110 L130 10 Z" fill="#c9ced8" stroke={INKC} strokeWidth={5} />
    {/* tail fin (T-tail) + 3 rear engines */}
    <path d="M-330 -50 L-420 -200 L-370 -200 L-260 -50 Z" fill="#3d6ccf" stroke={INKC} strokeWidth={5} />
    <rect x={-450} y={-212} width={120} height={18} rx={8} fill="#c9ced8" stroke={INKC} strokeWidth={4} />
    <rect x={-400} y={-90} width={120} height={44} rx={20} fill="#c9ced8" stroke={INKC} strokeWidth={5} />
    {lights && <circle cx={-430} cy={-205} r={7} fill={RED} opacity={0.5 + 0.5 * Math.sin(f * 0.4)} />}
  </g>
);
const Chute: React.FC<{ x: number; y: number; s?: number; open: number; f: number; bag?: boolean }> = ({ x, y, s = 1, open, f, bag = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.07) * 6})`}>
    {open > 0 && (
      <g transform={`scale(${lerp(0.2, 1, open)} ${open})`}>
        <path d="M-220 -470 Q0 -640 220 -470 Q170 -450 110 -470 Q55 -450 0 -470 Q-55 -450 -110 -470 Q-170 -450 -220 -470 Z" fill="#e8e4d8" stroke={INKC} strokeWidth={7} />
        {[-110, 0, 110].map((gx) => <path key={gx} d={`M${gx} -470 Q${gx * 0.6} -560 0 -585`} stroke={INKC} strokeWidth={3} fill="none" opacity={0.5} />)}
        {[-220, -110, 0, 110, 220].map((gx) => <line key={gx} x1={gx} y1={-470} x2={gx * 0.12} y2={-330} stroke={INKC} strokeWidth={3} />)}
      </g>
    )}
    <Person d={COOPER} f={f} seed={1} talk={0} wave={1} mood="neutral" />
    {bag && <g transform="translate(-40 -200)"><rect x={-40} y={-30} width={80} height={70} rx={14} fill="#c8a24a" stroke={INKC} strokeWidth={5} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>$</text></g>}
  </g>
);
const Bill: React.FC<{ x: number; y: number; s?: number; rot?: number; rotten?: number }> = ({ x, y, s = 1, rot = 0, rotten = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-55} width={240} height={110} rx={8} fill={mix("#b8d8a8", "#8a8a5a", rotten)} stroke={INKC} strokeWidth={5} />
    <rect x={-104} y={-41} width={208} height={82} rx={6} fill="none" stroke={mix(MONEY, "#5a5a3a", rotten)} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={30} ry={36} fill={mix("#d8e8c8", "#9a9a6a", rotten)} stroke={mix(MONEY, "#5a5a3a", rotten)} strokeWidth={4} />
    <text x={-80} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={mix("#2a5a3a", "#4a4a2a", rotten)}>20</text>
    <text x={80} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={mix("#2a5a3a", "#4a4a2a", rotten)}>20</text>
    {rotten > 0 && [...Array(5)].map((_, i) => <circle key={i} cx={-100 + rnd("rot" + i) * 200} cy={-40 + rnd("roty" + i) * 80} r={8 + rnd("rr" + i) * 14} fill="#5a4a2a" opacity={0.5 * rotten} />)}
  </g>
);

// ---------- shots ----------
const Talk: React.FC<{ f: number; i: number; mood?: "happy" | "neutral" | "surprised" }> = ({ f, i, mood }) => (
  <g>
    <Office f={f} id={"of" + i} />
    <Duo f={f} hostMood={mood ?? "happy"} />
    <QBubble f={f} i={i} x={440} y={920} tx={280} ty={1130} />
  </g>
);
const S2_Ticket: React.FC<{ f: number }> = ({ f }) => {
  const flip = ramp(f, F.november - 4, F.november + 6);
  const tk = pop(f, F.ticket - 2, 14);
  return (
    <g>
      <Grad id="term" top="#d8cfb8" bot="#b8a88a" h={1480} />
      {/* 1971 terminal: big windows, departures board */}
      <rect x={60} y={260} width={960} height={400} fill="#8fb8d8" stroke={INKC} strokeWidth={8} />
      {[...Array(5)].map((_, i) => <line key={i} x1={60 + i * 192} x2={60 + i * 192} y1={260} y2={660} stroke={INKC} strokeWidth={6} />)}
      <g transform={`translate(${lerp(1200, 700, eout(ramp(f, F.november, F.y1971 + 30)))} 470) scale(0.42)`}><Jet x={0} y={0} f={f} /></g>
      <rect x={0} y={1480} width={VW} height={VH - 1480} fill="#5a4a3a" />
      {/* calendar */}
      <g transform="translate(270 900)" opacity={1 - ramp(f, F.quiet - 6, F.quiet + 6)}>
        <rect x={-150} y={-170} width={300} height={330} rx={16} fill="#ffffff" stroke={INKC} strokeWidth={8} />
        <rect x={-150} y={-170} width={300} height={90} rx={16} fill={RED} stroke={INKC} strokeWidth={8} />
        <text y={-108} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#ffffff" letterSpacing={4}>NOV</text>
        <g transform={`scale(1 ${flip < 0.5 ? 1 - flip * 2 : (flip - 0.5) * 2})`}>
          <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={INKC}>{flip < 0.5 ? "1" : "24"}</text>
        </g>
      </g>
      <BigNum f={f} at={F.y1971 - 2} text="1971" x={720} y={950} hue={YEL} fs={170} />
      {/* ticket counter */}
      <rect x={560} y={1220} width={520} height={260} fill="#8a5a3a" stroke={INKC} strokeWidth={8} />
      <rect x={560} y={1220} width={520} height={30} fill="#6a4a2a" />
      <Fig d={COOPER} f={f} x={lerp(1250, 360, eout(ramp(f, F.quiet - 10, F.suit + 10)))} y={1500} s={0.95} seed={3} mood="neutral" />
      {f >= F.suit && <Chip x={360} y={980} w={380} label="QUIET MAN IN A SUIT" hue="#2a2a33" p={pop(f, F.suit, 12) * (1 - ramp(f, F.ticket - 4, F.ticket))} fs={28} />}
      {/* ticket */}
      {tk > 0 && (
        <g transform={`translate(760 900) rotate(-6) scale(${tk})`}>
          <rect x={-250} y={-130} width={500} height={260} rx={18} fill={PAPER} stroke={INKC} strokeWidth={7} />
          <rect x={-250} y={-130} width={500} height={60} rx={18} fill="#c0392b" stroke={INKC} strokeWidth={7} />
          <text y={-88} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#ffffff" letterSpacing={4}>FLIGHT 305 · 1971</text>
          <text x={-220} y={-20} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#7a6a5a">PASSENGER</text>
          <text x={-220} y={34} fontFamily={FONT} fontWeight={800} fontSize={56} fill={INKC} opacity={clamp01(pop(f, F.dan, 10))}>DAN COOPER</text>
          <text x={-220} y={100} fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC} opacity={clamp01(pop(f, F.portland, 10))}>PORTLAND → SEATTLE</text>
        </g>
      )}
    </g>
  );
};
const S3_Note: React.FC<{ f: number }> = ({ f }) => {
  const walk = eout(ramp(f, F.hands - 20, F.hands + 6));
  const note = pop(f, F.note - 2, 14);
  const shock = f >= F.bomb;
  return (
    <g>
      <Grad id="cab" top="#e8e0cc" bot="#c8bca0" />
      {/* cabin wall with windows (clouds passing = takeoff) */}
      <rect x={0} y={380} width={VW} height={500} fill="#ddd4be" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${130 + i * 270} 600)`}>
          <rect x={-70} y={-100} width={140} height={190} rx={60} fill="#7cc4ff" stroke={INKC} strokeWidth={8} />
          <g clipPath={`url(#win${i})`}>
            <defs><clipPath id={`win${i}`}><rect x={-62} y={-92} width={124} height={174} rx={54} /></clipPath></defs>
            <circle cx={((i * 70 - f * 4) % 260 + 260) % 260 - 130} cy={lerp(60, -20, ramp(f, F.soon, F.takeoff + 40))} r={46} fill="#ffffff" />
          </g>
        </g>
      ))}
      <rect x={0} y={880} width={VW} height={600} fill="#b8ac90" />
      {/* seat rows */}
      {[0, 1].map((r) => <g key={r}><rect x={120 + r * 520} y={980} width={300} height={360} rx={30} fill="#3d6ccf" stroke={INKC} strokeWidth={7} /><rect x={110 + r * 520} y={1300} width={320} height={80} rx={20} fill="#2f5ab0" stroke={INKC} strokeWidth={7} /></g>)}
      <Fig d={COOPER} f={f} x={270} y={1420} s={0.85} seed={3} mood="neutral" />
      <rect x={0} y={1480} width={VW} height={VH - 1480} fill="#6a6a74" />
      <Fig d={ATTENDANT} f={f} x={lerp(1250, 760, walk)} y={1540} s={0.92} seed={7} mood={shock ? "surprised" : "happy"} flip />
      {/* the note */}
      {note > 0 && (
        <g transform={`translate(${lerp(360, 560, eout(ramp(f, F.note, F.says)))} ${lerp(1150, 820, eout(ramp(f, F.note, F.says)))}) rotate(-5) scale(${note})`}>
          <rect x={-210} y={-110} width={420} height={220} fill="#fffbe8" stroke={INKC} strokeWidth={6} />
          {[...Array(4)].map((_, i) => <line key={i} x1={-190} x2={190} y1={-60 + i * 44} y2={-60 + i * 44} stroke="#a8c4ff" strokeWidth={3} />)}
          <text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={INKC} opacity={f >= F.says ? 1 : 0} transform="rotate(-2)">I HAVE</text>
          <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={RED} opacity={f >= F.bomb ? 1 : 0} transform="rotate(-2)">A BOMB</text>
        </g>
      )}
      {f >= F.soon && <Chip x={540} y={300} w={380} label="SOON AFTER TAKEOFF" hue="#3d6ccf" p={pop(f, F.soon + 4, 12) * (1 - ramp(f, F.note - 6, F.note))} fs={32} />}
    </g>
  );
};
const S5_Demands: React.FC<{ f: number }> = ({ f }) => {
  const amt = countUp(f, F.two - 2, F.dollars + 10, 200000);
  return (
    <g>
      <Grad id="dem" top="#1a2a1e" bot="#0e1a12" />
      {/* money stacks */}
      {[...Array(10)].map((_, i) => {
        const p = pop(f, F.two + i * 4, 10);
        if (p <= 0) return null;
        const x = 200 + (i % 5) * 170, y = 1000 - Math.floor(i / 5) * 70;
        return <g key={i} transform={`translate(${x} ${y}) scale(${p * 0.62})`}>{[0, 1, 2].map((k) => <Bill key={k} x={0} y={-k * 22} />)}</g>;
      })}
      <BigNum f={f} at={F.two - 2} text={"$" + amt.toLocaleString("en-US")} x={540} y={520} hue={GREEN} fs={150} />
      {/* parachutes */}
      {[0, 1, 2, 3].map((i) => {
        const p = pop(f, F.four + i * 4, 12);
        if (p <= 0) return null;
        return (
          <g key={i} transform={`translate(${200 + i * 227} 1300) scale(${p})`}>
            <path d="M-80 0 Q0 -110 80 0 Q40 -12 0 0 Q-40 -12 -80 0 Z" fill="#e8e4d8" stroke={INKC} strokeWidth={6} />
            <path d="M-80 0 L-10 90 M80 0 L10 90 M0 0 L0 90" stroke={INKC} strokeWidth={3} />
            <rect x={-28} y={88} width={56} height={60} rx={10} fill="#5a6a3a" stroke={INKC} strokeWidth={5} />
          </g>
        );
      })}
      <Label x={540} y={1530} text="4 PARACHUTES" p={pop(f, F.parachutes, 12)} fs={70} fill={YEL} />
    </g>
  );
};
const S5b_Seattle: React.FC<{ f: number }> = ({ f }) => {
  const off = ramp(f, F.passenger - 20, F.go + 40);
  return (
    <g>
      <Grad id="sea" top="#5a6a8a" bot="#a8b0c0" h={1300} />
      {/* Seattle skyline + needle */}
      {[...Array(10)].map((_, i) => <rect key={i} x={i * 110} y={900 - (i % 4) * 70} width={90} height={400} fill="#6a7690" />)}
      <g transform="translate(860 1300)"><line x1={0} x2={0} y1={0} y2={-560} stroke="#6a7690" strokeWidth={22} /><ellipse cx={0} cy={-560} rx={110} ry={26} fill="#6a7690" /><path d="M-50 -600 L0 -680 L50 -600 Z" fill="#6a7690" /></g>
      <rect x={0} y={1300} width={VW} height={VH - 1300} fill="#4a4a54" />
      <line x1={0} x2={VW} y1={1500} y2={1500} stroke={YEL} strokeWidth={8} strokeDasharray="60 40" />
      <Jet x={600} y={1180} s={0.95} f={f} />
      {/* front stairs + passengers leaving */}
      <path d="M940 1160 L1060 1300 L1080 1300 L960 1160 Z" fill="#9aa4b8" stroke={INKC} strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const q = clamp01(off * 1.6 - i * 0.12);
        if (q <= 0) return null;
        const x = lerp(960, 300 - i * 30, q), y = q < 0.2 ? lerp(1160, 1300, q / 0.2) : 1300 + Math.sin(q * 40) * 3;
        return <g key={i} transform={`translate(${x} ${y + 120}) scale(0.32)`}><Person d={CAST[[5, 9, 19, 22, 27, 33][i]]} f={f} seed={i} talk={0} wave={0} mood="happy" /></g>;
      })}
      {/* money bag handed over */}
      <g transform={`translate(${lerp(140, 520, eout(ramp(f, F.money - 10, F.money + 10)))} 1290)`} opacity={pop(f, F.money - 10, 10) > 0 ? 1 : 0}>
        <path d="M-50 40 Q-60 -30 -20 -50 L20 -50 Q60 -30 50 40 Z" fill="#c8a24a" stroke={INKC} strokeWidth={6} />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INKC}>$</text>
      </g>
      <Chip x={540} y={720} w={300} label="SEATTLE" hue="#3d6ccf" p={pop(f, F.seattle, 12)} fs={44} />
      {f >= F.passenger - 10 && <Chip x={540} y={840} w={520} label="PASSENGERS FREED" hue={GREEN} p={pop(f, F.passenger, 12)} fs={38} textColor={INKC} />}
    </g>
  );
};
const S7_Map: React.FC<{ f: number }> = ({ f }) => {
  const t = eio(ramp(f, F.plane2 - 4, F.somewhere + 10));
  const px = lerp(560, 470, t), py = lerp(520, 1020, t);
  return (
    <g>
      <Grad id="mapn" top="#0e1838" bot="#0b1026" />
      {/* ocean + coast */}
      <path d="M0 0 L300 0 Q260 300 320 520 Q260 800 300 1100 Q250 1400 300 1920 L0 1920 Z" fill="#132a5a" />
      <path d="M300 0 Q260 300 320 520 Q260 800 300 1100 Q250 1400 300 1920 L1080 1920 L1080 0 Z" fill="#2a3a2e" stroke="#5a6a5a" strokeWidth={6} />
      <line x1={300} x2={1080} y1={880} y2={880} stroke="#8a9a8a" strokeWidth={5} strokeDasharray="20 14" />
      <text x={700} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#8a9a8a" letterSpacing={6}>WASHINGTON</text>
      <text x={700} y={1180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#8a9a8a" letterSpacing={6}>OREGON</text>
      {[[560, 500, "SEATTLE"], [520, 960, "PORTLAND"]].map(([x, y, n], i) => (
        <g key={i}><circle cx={x as number} cy={y as number} r={14} fill={YEL} stroke={INKC} strokeWidth={4} /><text x={(x as number) + 26} y={(y as number) + 12} fontFamily={FONT} fontWeight={800} fontSize={36} fill="#ffffff">{n}</text></g>
      ))}
      {/* flight path south */}
      <path d={`M560 520 L${px} ${py}`} stroke={YEL} strokeWidth={8} strokeDasharray="22 14" />
      <path d="M560 520 L360 1700" stroke={YEL} strokeWidth={4} strokeDasharray="10 16" opacity={0.35} />
      <g transform={`translate(${px} ${py}) rotate(100) scale(0.8)`}><path d="M-60 0 L60 0 M0 -50 L0 50 M-60 0 L-40 -10 L-40 10 Z" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" /><path d="M60 0 L30 -10 L30 10 Z" fill="#ffffff" /></g>
      <g opacity={pop(f, F.mexico, 12)}>
        <path d="M380 1380 L360 1500 L320 1440 M360 1500 L410 1450" stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" />
        <Label x={560} y={1470} text="MEXICO ↓" p={pop(f, F.mexico, 12)} fs={60} fill={RED} />
      </g>
      {f >= F.somewhere && <circle cx={500} cy={780} r={80 + Math.sin(f * 0.2) * 8} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="16 12" opacity={pop(f, F.somewhere + 4, 12)} />}
      {f >= F.somewhere && <Label x={500} y={810} text="?" p={pop(f, F.somewhere + 4, 12)} fs={110} fill={RED} />}
    </g>
  );
};
const S7b_Jump: React.FC<{ f: number }> = ({ f }) => {
  const st = eio(ramp(f, F.opened - 4, F.stairs + 10));
  const jt = clamp01((f - F.jumped) / 40);
  const fall = F.jumped <= f;
  const flash = f >= F.night && (f % 60 < 3);
  return (
    <g>
      <Grad id="nite" top="#04060f" bot="#121a3a" />
      {flash && <rect width={VW} height={VH} fill="#ffffff" opacity={0.25} />}
      {/* clouds */}
      {[...Array(6)].map((_, i) => <ellipse key={i} cx={((i * 260 - f * 2) % 1400 + 1400) % 1400 - 160} cy={300 + (i % 3) * 120} rx={200} ry={60} fill="#1e2648" />)}
      {/* forest far below */}
      {[...Array(16)].map((_, i) => <path key={i} d={`M${i * 72 - 20} 1920 L${i * 72 + 16} ${1680 - (i % 3) * 40} L${i * 72 + 52} 1920 Z`} fill="#0a1a14" />)}
      <Jet x={680} y={760} s={1.0} stairs={st} lights f={f} />
      {/* jumper */}
      {f >= F.stairs && (
        <g transform={`translate(${lerp(300, 200, jt)} ${fall ? lerp(810, 1280, eio(jt)) : 810})`}>
          <g transform={`rotate(${fall ? jt * 40 : 0}) scale(0.42)`}><Person d={COOPER} f={f} seed={1} talk={0} wave={0} mood="neutral" /></g>
        </g>
      )}
      <Rain f={f} n={90} o={0.5} seed="jr" />
      {f >= F.stairs && <Chip x={330} y={1000} w={330} label="BACK STAIRS" hue={AMBER} p={pop(f, F.stairs, 12) * (1 - ramp(f, F.jumped - 4, F.jumped))} fs={36} textColor={INKC} />}
      <Label x={540} y={420} text="NIGHT. RAIN." p={pop(f, F.night, 12)} fs={68} fill="#a8c4ff" />
      {fall && <Stamp f={f} at={F.jumped + 2} x={600} y={1240} text="JUMPED" hue={YEL} fs={100} rot={-8} />}
    </g>
  );
};
const S9_Chute: React.FC<{ f: number }> = ({ f }) => {
  const open = eout(ramp(f, F.with2 - 6, F.with2 + 14));
  const fade = eio(ramp(f, F.never - 6, F.seen + 20));
  const y = lerp(900, 1300, ramp(f, F.with2 - 10, F.seen + 40));
  return (
    <g>
      <Grad id="ch" top="#04060f" bot="#141c3a" />
      {[...Array(18)].map((_, i) => <path key={i} d={`M${i * 64 - 20} 1920 L${i * 64 + 14} ${1600 - (i % 4) * 50} L${i * 64 + 48} 1920 Z`} fill="#0c2018" />)}
      <g opacity={1 - fade * 0.92}>
        <Chute x={540} y={y} s={0.9} open={open} f={f} />
      </g>
      <Rain f={f} n={90} o={0.5} seed="cr" />
      {f >= F.suit2 - 4 && f < F.never && (
        <g>
          <Chip x={280} y={y - 260} w={250} label="IN A SUIT" hue="#2a2a33" p={pop(f, F.suit2 - 4, 12)} fs={30} />
          <Chip x={790} y={y + 20} w={250} label="LOAFERS" hue="#6a4a2a" p={pop(f, F.loafers, 12)} fs={30} />
        </g>
      )}
      {f >= F.never && <Stamp f={f} at={F.never + 4} x={540} y={720} text="NEVER SEEN AGAIN" hue={RED} fs={64} rot={-6} />}
    </g>
  );
};
const S11_River: React.FC<{ f: number }> = ({ f }) => {
  const dig = Math.sin(f * 0.35);
  const found = eout(ramp(f, F.bundles - 4, F.twenty + 20));
  return (
    <g>
      <Grad id="riv" top="#8fc8ff" bot="#e8f4ff" h={900} />
      {/* far bank + river */}
      <path d="M0 780 Q300 740 600 770 T1080 760 L1080 900 L0 900 Z" fill="#4a8a4a" />
      <rect x={0} y={880} width={VW} height={240} fill="#3a7ab8" />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${((i * 160 + f * 2) % 1240) - 80} ${920 + (i % 3) * 60} q 30 -10 60 0`} stroke="#a8d8ff" strokeWidth={5} fill="none" />)}
      {/* sandy bank */}
      <path d="M0 1100 Q540 1060 1080 1110 L1080 1920 L0 1920 Z" fill="#d8b878" stroke={INKC} strokeWidth={5} />
      <ellipse cx={600} cy={1440} rx={170} ry={46} fill="#a88a4a" />
      {/* bundles emerging */}
      {[0, 1, 2].map((i) => <Bill key={i} x={560 + i * 50} y={lerp(1470, 1330 - i * 26, found)} s={0.55} rot={-10 + i * 12} rotten={0.8} />)}
      <Fig d={BOY} f={f} x={360} y={1520} s={1.0} seed={8} mood={found > 0.5 ? "surprised" : "happy"} />
      {/* little shovel */}
      <g transform={`translate(470 ${1380 + dig * 14}) rotate(${30 + dig * 12})`}><rect x={-6} y={-90} width={12} height={110} fill="#8a5a3a" stroke={INKC} strokeWidth={3} /><path d="M-26 20 L26 20 L18 70 L-18 70 Z" fill="#c9ced8" stroke={INKC} strokeWidth={4} /></g>
      <BigNum f={f} at={F.y1980 - 2} text="1980" x={540} y={420} hue={YEL} fs={170} />
      {f >= F.eight && <Chip x={330} y={560} w={330} label="AGE 8" hue={GREEN} p={pop(f, F.eight, 12)} fs={40} textColor={INKC} />}
      {f >= F.river && <Chip x={760} y={560} w={420} label="COLUMBIA RIVER" hue="#3a7ab8" p={pop(f, F.river, 12)} fs={34} />}
      {f >= F.twenty && <Label x={720} y={1250} text="ROTTING $20s" p={pop(f, F.twenty + 6, 12)} fs={58} fill={YEL} />}
    </g>
  );
};
const S12_Match: React.FC<{ f: number }> = ({ f }) => {
  const m = pop(f, F.matched, 12);
  return (
    <g>
      <Grad id="lab" top="#1c2a2e" bot="#0e1418" />
      <Bill x={540} y={760} s={2.6} rotten={0.5} />
      {/* serial readout, two rows that match */}
      {[0, 1].map((r) => (
        <g key={r} transform={`translate(540 ${1120 + r * 140})`} opacity={clamp01(pop(f, F.serial + r * 10, 12))}>
          <rect x={-380} y={-56} width={760} height={112} rx={18} fill={r ? "#2a2a1e" : "#1e2a2a"} stroke={r ? AMBER : "#5ad7ff"} strokeWidth={5} />
          <text x={-350} y={-14} fontFamily={FONT} fontWeight={800} fontSize={24} fill={r ? AMBER : "#5ad7ff"} letterSpacing={3}>{r ? "RANSOM LIST" : "FOUND BILL"}</text>
          <text x={-350} y={36} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffffff" letterSpacing={8}>L 6 7 5 • • • • A</text>
        </g>
      ))}
      {/* magnifier sweeping */}
      <g transform={`translate(${540 + Math.sin(f * 0.06) * 200} ${720 + Math.cos(f * 0.05) * 40})`}>
        <circle r={110} fill="#ffffff" fillOpacity={0.18} stroke="#c9d3e6" strokeWidth={18} />
        <line x1={78} y1={78} x2={170} y2={170} stroke="#8a5a3a" strokeWidth={26} strokeLinecap="round" />
      </g>
      {m > 0 && <g transform={`translate(540 1470) scale(${m})`}><rect x={-230} y={-60} width={460} height={120} rx={60} fill={GREEN} stroke={INKC} strokeWidth={7} /><text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC} letterSpacing={4}>MATCH ✓</text></g>}
      <Label x={540} y={400} text="SERIAL NUMBERS" p={pop(f, F.serial, 12)} fs={70} />
    </g>
  );
};
const S12b_Wanted: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Grad id="wall" top="#3a2e22" bot="#1e1812" />
    {[...Array(12)].map((_, i) => <rect key={i} x={0} y={i * 160} width={VW} height={4} fill="#000" opacity={0.15} />)}
    <g transform={`translate(540 860) rotate(${-2 + Math.sin(f * 0.03)})`}>
      <rect x={-330} y={-520} width={660} height={940} fill="#efe0b8" stroke={INKC} strokeWidth={8} />
      <text y={-410} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INKC} letterSpacing={10}>WANTED</text>
      <rect x={-230} y={-360} width={460} height={480} fill="#e0cfa0" stroke={INKC} strokeWidth={5} />
      <defs><clipPath id="sketch"><rect x={-230} y={-360} width={460} height={480} /></clipPath></defs>
      <g clipPath="url(#sketch)"><g transform="translate(0 520) scale(1.5)" opacity={0.9}><Person d={COOPER} f={0} seed={1} talk={0} wave={0} mood="neutral" /></g></g>
      <text y={200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={INKC} letterSpacing={4}>"DAN COOPER"</text>
      <text y={270} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#7a5a3a" letterSpacing={3}>THE REST OF THE MONEY: ?</text>
    </g>
    {f >= F.missing - 6 && <Stamp f={f} at={F.missing} x={540} y={1120} text="STILL MISSING" hue={RED} fs={84} rot={-12} />}
  </g>
);
const S13_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} id="ofo" />
    <Outro f={f} at={F.sub} />
    <Duo f={f} ax={160} hx={915} s={0.76} wave hostWave askBase="happy" />
  </g>
);

export const DBCooperFilm: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = F.november - 6, c1 = F.quiet - 6, b2 = F.soon - 6, b3 = F.want - 4, b4 = F.two - 6, c4 = F.seattle - 8, b5 = F.then - 4, b6 = F.plane2 - 8, c6 = F.somewhere - 6, b7 = F.withMoney - 4, b8 = F.with2 - 6, b9 = F.found - 4, b10 = F.y1980 - 8, b11 = F.serial - 8, c11 = F.rest - 8, b12 = F.sub - 4;
  const SHOTS: Shot[] = [
    { from: 0, to: b1, render: () => <Talk f={f} i={0} />, cam: [[0, { x: 540, y: 1160, z: 1.2 }], [F.jump, { x: 540, y: 1130, z: 1.12 }], [b1, { x: 540, y: 1150, z: 1.18 }]] },
    { from: b1, to: c1, tr: "flash", render: () => <S2_Ticket f={f} />, cam: [[b1, { x: 360, y: 880, z: 1.35 }], [F.y1971, { x: 520, y: 880, z: 1.15 }], [c1, { x: 540, y: 900, z: 1.1 }]] },
    { from: c1, to: b2, tr: "cut", render: () => <S2_Ticket f={f} />, cam: [[c1, { x: 420, y: 1200, z: 1.3 }], [F.ticket, { x: 620, y: 1000, z: 1.12 }], [F.dan, { x: 700, y: 920, z: 1.3 }], [b2, { x: 680, y: 930, z: 1.25 }]] },
    { from: b2, to: b3, tr: "whip", render: () => <S3_Note f={f} />, cam: [[b2, { x: 540, y: 700, z: 1.25 }], [F.hands, { x: 540, y: 1100, z: 1.08 }], [F.note, { x: 500, y: 1000, z: 1.2 }], [F.bomb, { x: 560, y: 860, z: 1.35 }], [b3, { x: 560, y: 900, z: 1.3 }]] },
    { from: b3, to: b4, tr: "push", render: () => <Talk f={f} i={1} />, cam: [[b3, { x: 540, y: 1150, z: 1.12 }], [b4, { x: 520, y: 1170, z: 1.2 }]] },
    { from: b4, to: c4, tr: "zoom", render: () => <S5_Demands f={f} />, cam: [[b4, { x: 540, y: 600, z: 1.3 }], [F.dollars, { x: 540, y: 800, z: 1.08 }], [F.four, { x: 540, y: 1200, z: 1.15 }], [c4, { x: 540, y: 1150, z: 1.1 }]] },
    { from: c4, to: b5, tr: "wipe", render: () => <S5b_Seattle f={f} />, cam: [[c4, { x: 700, y: 900, z: 1.3 }], [F.money, { x: 520, y: 1150, z: 1.2 }], [F.passenger, { x: 620, y: 1250, z: 1.25 }], [b5, { x: 540, y: 1100, z: 1.1 }]] },
    { from: b5, to: b6, tr: "spin", render: () => <Talk f={f} i={2} mood="neutral" />, cam: [[b5, { x: 540, y: 1150, z: 1.2 }], [b6, { x: 540, y: 1150, z: 1.12 }]] },
    { from: b6, to: c6, tr: "iris", render: () => <S7_Map f={f} />, cam: [[b6, { x: 560, y: 560, z: 1.4 }], [F.mexico, { x: 500, y: 1100, z: 1.05 }], [c6, { x: 500, y: 960, z: 1.0 }]] },
    { from: c6, to: b7, tr: "whipUp", render: () => <S7b_Jump f={f} />, cam: [[c6, { x: 700, y: 760, z: 1.15 }], [F.rain, { x: 520, y: 800, z: 1.2 }], [F.opened, { x: 330, y: 820, z: 1.4 }], [F.jumped, { x: 300, y: 900, z: 1.3 }], [b7, { x: 360, y: 1100, z: 1.15, r: -2 }]] },
    { from: b7, to: b8, tr: "flash", render: () => <Talk f={f} i={3} mood="neutral" />, cam: [[b7, { x: 520, y: 1150, z: 1.25 }], [b8, { x: 540, y: 1150, z: 1.15 }]] },
    { from: b8, to: b9, tr: "wipe", render: () => <S9_Chute f={f} />, cam: [[b8, { x: 540, y: 700, z: 1.3 }], [F.loafers, { x: 540, y: 1000, z: 1.12 }], [F.never, { x: 540, y: 960, z: 1.02 }], [b9, { x: 540, y: 1000, z: 1.1 }]] },
    { from: b9, to: b10, tr: "push", render: () => <Talk f={f} i={4} />, cam: [[b9, { x: 540, y: 1150, z: 1.12 }], [b10, { x: 520, y: 1170, z: 1.2 }]] },
    { from: b10, to: b11, tr: "zoom", render: () => <S11_River f={f} />, cam: [[b10, { x: 540, y: 600, z: 1.3 }], [F.boy, { x: 420, y: 1150, z: 1.2 }], [F.bundles, { x: 600, y: 1300, z: 1.35 }], [b11, { x: 560, y: 1150, z: 1.12 }]] },
    { from: b11, to: c11, tr: "whip", render: () => <S12_Match f={f} />, cam: [[b11, { x: 540, y: 760, z: 1.3 }], [F.matched, { x: 540, y: 1100, z: 1.12 }], [c11, { x: 540, y: 1000, z: 1.05 }]] },
    { from: c11, to: b12, tr: "spin", render: () => <S12b_Wanted f={f} />, cam: [[c11, { x: 540, y: 700, z: 1.35 }], [F.man3, { x: 540, y: 860, z: 1.12 }], [b12, { x: 540, y: 960, z: 1.02 }]] },
    { from: b12, to: TOTAL + 1, tr: "iris", render: () => <S13_Outro f={f} />, cam: [[b12, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.vanish, 0.08], [F.y1971, 0.12], [F.dan, 0.1], [F.bomb, 0.14], [F.two, 0.1], [F.four, 0.1], [F.mexico, 0.08], [F.jumped, 0.14], [F.never, 0.12], [F.y1980, 0.12], [F.matched, 0.12], [F.missing, 0.14]];
  const SHAKE: [number, number][] = [[F.bomb + 2, 12], [F.jumped + 2, 12], [F.missing + 2, 10]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.45], [F.november - 4, "tick", 0.35], [F.y1971 - 2, "impact", 0.4], [F.ticket - 2, "pop", 0.4], [F.dan, "click", 0.4],
    [F.soon, "whoosh", 0.3], [F.note - 2, "pop", 0.4], [F.bomb, "boom", 0.45], [F.want - 3, "pop", 0.45],
    [F.two - 2, "riser", 0.25], [F.dollars, "impact", 0.4], [F.four, "pop", 0.35], [F.parachutes, "pop", 0.35], [F.money - 10, "whoosh", 0.3], [F.passenger, "pop", 0.35],
    [F.then - 3, "pop", 0.45], [F.mexico, "pop", 0.35], [F.somewhere, "riser_dark", 0.3], [F.opened - 4, "whoosh", 0.35], [F.jumped, "boom", 0.45],
    [F.withMoney - 3, "pop", 0.45], [F.with2 - 6, "whoosh", 0.35], [F.never + 4, "impact", 0.45],
    [F.found - 3, "pop", 0.45], [F.y1980 - 2, "impact", 0.4], [F.bundles, "pop", 0.35], [F.serial, "tick", 0.35], [F.matched, "boom", 0.4], [F.missing, "impact", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < b4 ? YEL : f < b7 ? AMBER : f < b10 ? RED : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="HIJACKED" sub="...AND VANISHED" until={F.november - 10} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="dbcooper" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
