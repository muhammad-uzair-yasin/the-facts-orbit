import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
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
  ask: ASK[0][0], wake: W("wake"), move: W("move"), called: W("called"), paralysis: W("paralysis"), common: W("common"),
  studies: W("studies"), one: W("one"), twelve: W("twelve"), once: W("once"),
  why: ASK[1][0], when: W("when"), dream: W("dream"), switches: W("switches"), off: W("off"), muscles: W("muscles"), act: W("act"),
  sometimes: W("sometimes", 2), mind: W("mind"), wakes: W("wakes"), before: W("before"), switch2: W("switch"), on: W("on"),
  frozen: ASK[2][0], frozenW: W("frozen"), exactly: W("exactly"), half: W("half"), many: W("many"), heavy: W("heavy"), chest: W("chest"),
  sense: W("sense"), someone: W("someone"), room: W("room"),
  horror: ASK[3][0], centuries: W("centuries"), demons: W("demons"), newfoundland: W("newfoundland"), hag: W("hag"),
  japan: W("japan"), kanashibari: W("kanashibari"), famous: W("famous"), y1781: W("1781"), creature: W("creature"), chest2: W("chest", 2),
  danger: ASK[4][0], no: W("no"), seconds: W("seconds"), minute: W("minute"), two: W("two"), regular: W("regular"), helps: W("helps"), side: W("side"),
  sub: W("subscribe"),
};

const LIB = CAST[31], DOC = CAST[7];
const SLEEPER: PersonDef = { ...LIB, prop: "none", top: "tee", topC: "#7b8fd8", pants: "#5a6ab8", glasses: "none" };
const NIGHT = "#141836", WALL = "#1f2550", MOON = "#f2ecd8", RED = "#ff4d3d", GREEN = "#3ddc97", VIOLET = "#8a5cff", CYAN = "#5ad7ff";
const GROUND = 1540;

// ---------- Q&A kit ----------
const Q: { text: string; hot?: boolean }[] = [
  { text: "WAKE UP...\nCAN'T MOVE?!", hot: true },
  { text: "BUT WHY?" },
  { text: "AWAKE...\nBUT FROZEN?!", hot: true },
  { text: "HORRIFYING!", hot: true },
  { text: "IS IT\nDANGEROUS?" },
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
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; askBase?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised"; wave?: boolean; hostWave?: boolean }> = ({ f, ax = 260, hx = 820, y = GROUND, s = 0.8, askBase = "neutral", hostMood = "happy", wave, hostWave }) => {
  const hTalk = speaking(f, "host", SPK);
  return (
    <g>
      <g transform={`translate(${ax} ${y}) scale(${s})`}>
        <Person d={LIB} f={f} seed={32} talk={talkFor(f, "asker", SPK, ENV)} wave={wave ? 1 : 0} mood={askMood(f, askBase)} />
      </g>
      <g transform={`translate(${hx} ${y}) scale(${-s} ${s})`}>
        <Person d={DOC} f={f} seed={8} talk={talkFor(f, "host", SPK, ENV)} wave={hostWave || (hTalk && Math.sin(f * 0.045) > 0.55) ? 1 : 0} mood={hostMood} />
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
const Zzz: React.FC<{ f: number; x: number; y: number; o?: number }> = ({ f, x, y, o = 1 }) => (
  <g opacity={o}>{[0, 1, 2].map((i) => { const q = ((f * 0.02 + i / 3) % 1); return <text key={i} x={x + q * 60 + i * 10} y={y - q * 140} fontFamily={FONT} fontWeight={800} fontSize={40 + q * 30} fill="#c9d3ff" opacity={Math.sin(q * Math.PI)}>Z</text>; })}</g>
);
/** Bedroom wall + window + floor. */
const Bedroom: React.FC<{ f: number; id: string; spooky?: number }> = ({ f, id, spooky = 0 }) => (
  <g>
    <Grad id={id} top={mix(WALL, "#0c0e22", spooky)} bot={mix("#2a3270", "#141836", spooky)} h={1460} />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130} y={0} width={4} height={1460} fill="#000" opacity={0.12} />)}
    {/* window with moon */}
    <g transform="translate(780 420)">
      <rect x={-150} y={-190} width={300} height={380} fill="#0a0d24" stroke="#8a90c0" strokeWidth={14} />
      <circle cx={50} cy={-80} r={58} fill={MOON} opacity={0.9} />
      <circle cx={74} cy={-96} r={52} fill="#0a0d24" />
      {[...Array(8)].map((_, i) => <circle key={i} cx={-120 + rnd("ws" + i) * 240} cy={-170 + rnd("wy" + i) * 330} r={2 + rnd("wr" + i) * 2} fill="#fff" opacity={0.7} />)}
      <line x1={0} x2={0} y1={-190} y2={190} stroke="#8a90c0" strokeWidth={10} /><line x1={-150} x2={150} y1={0} y2={0} stroke="#8a90c0" strokeWidth={10} />
      <path d={`M-190 -210 Q-170 0 ${-200 + Math.sin(f * 0.03) * 6} 220 L-140 220 Q-150 0 -140 -210 Z`} fill="#4a3a8a" stroke={INKC} strokeWidth={5} />
      <path d={`M190 -210 Q170 0 ${200 + Math.sin(f * 0.03) * 6} 220 L140 220 Q150 0 140 -210 Z`} fill="#4a3a8a" stroke={INKC} strokeWidth={5} />
    </g>
    {/* moonlight beam */}
    <path d="M630 610 L930 610 L760 1460 L260 1460 Z" fill="#c9d3ff" opacity={0.06} />
    <rect x={0} y={1460} width={VW} height={VH - 1460} fill={mix("#2a2240", "#141020", spooky)} />
    {[...Array(9)].map((_, i) => <line key={i} x1={i * 130} x2={i * 130 - 80} y1={1460} y2={VH} stroke="#000" strokeWidth={3} opacity={0.25} />)}
  </g>
);
/** Bed seen from the side with someone lying in it (head left). */
const Bed: React.FC<{ f: number; x: number; y: number; s?: number; awake?: boolean; chest?: number; blink?: boolean }> = ({ f, x, y, s = 1, awake = true, chest = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* frame */}
    <rect x={-420} y={-260} width={50} height={330} rx={12} fill="#6a4a3a" stroke={INKC} strokeWidth={6} />
    <rect x={360} y={-120} width={44} height={190} rx={12} fill="#6a4a3a" stroke={INKC} strokeWidth={6} />
    <rect x={-380} y={-40} width={760} height={70} rx={10} fill="#8a5a3a" stroke={INKC} strokeWidth={6} />
    <rect x={-380} y={-80} width={760} height={50} rx={18} fill="#e8e4f4" stroke={INKC} strokeWidth={6} />
    {/* pillow */}
    <rect x={-360} y={-150} width={170} height={76} rx={34} fill="#ffffff" stroke={INKC} strokeWidth={6} />
    {/* sleeper: Person rotated so head is on the pillow */}
    <defs><clipPath id={`headonly${Math.round(x)}${Math.round(y)}`}><rect x={-420} y={-420} width={232} height={420} /></clipPath></defs>
    <g clipPath={`url(#headonly${Math.round(x)}${Math.round(y)})`}>
      <g transform={`translate(${78} ${-118 + chest * 6}) rotate(-90) scale(-0.95 0.95)`}>
        <Person d={SLEEPER} f={awake ? 0 : f} seed={5} talk={0} wave={0} mood={awake ? "surprised" : "happy"} />
      </g>
    </g>
    {/* blanket */}
    <path d={`M-196 ${-150 + chest * 14} Q-60 ${-205 + chest * 22} 120 -180 Q300 -175 380 -110 L380 -40 L-196 -40 Z`} fill="#5a6ab8" stroke={INKC} strokeWidth={6} />
    {[...Array(5)].map((_, i) => <path key={i} d={`M${-110 + i * 100} -150 q 20 40 0 100`} stroke="#4a5aa8" strokeWidth={5} fill="none" />)}
  </g>
);
const Lock: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * p})`}>
    <path d="M-22 -10 V-30 Q-22 -54 0 -54 Q22 -54 22 -30 V-10" stroke="#c9d3e6" strokeWidth={10} fill="none" />
    <rect x={-34} y={-14} width={68} height={56} rx={10} fill={YEL} stroke={INKC} strokeWidth={6} />
    <circle cx={0} cy={10} r={7} fill={INKC} />
  </g>
);
const Office: React.FC<{ f: number; id: string }> = ({ f, id }) => (
  <g>
    <Grad id={id} top="#2e5a66" bot="#4a8a8a" h={1460} />
    {/* bookshelf */}
    <g transform="translate(60 520)">
      <rect x={0} y={0} width={300} height={720} fill="#6a4a3a" stroke={INKC} strokeWidth={6} />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={14} y={170 + r * 176} width={272} height={12} fill="#4a3428" />
          {[...Array(7)].map((_, k) => <rect key={k} x={22 + k * 38} y={60 + r * 176 + (k % 3) * 8} width={30} height={110 - (k % 3) * 8} fill={["#c0392b", "#2f6db5", "#e8b84a", "#3ddc97", "#8a5cff"][(k + r) % 5]} stroke={INKC} strokeWidth={3} />)}
        </g>
      ))}
    </g>
    {/* brain poster */}
    <g transform="translate(740 560)">
      <rect x={-200} y={-240} width={400} height={480} fill="#f4f1ea" stroke={INKC} strokeWidth={8} />
      <path d="M-120 20 Q-150 -100 -40 -130 Q20 -170 90 -120 Q160 -80 130 20 Q140 90 60 100 Q0 140 -60 100 Q-140 100 -120 20 Z" fill="#ffb3c6" stroke={INKC} strokeWidth={6} />
      <path d="M-80 -40 q 30 -30 60 0 t 60 0 M-60 30 q 30 -20 60 0 t 50 0 M0 -110 q -10 60 10 200" stroke="#d9758f" strokeWidth={5} fill="none" />
      <text y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC} letterSpacing={4}>SLEEP</text>
    </g>
    <rect x={0} y={1460} width={VW} height={VH - 1460} fill="#2a3a3a" />
    {[...Array(9)].map((_, i) => <line key={i} x1={i * 130} x2={i * 130 - 80} y1={1460} y2={VH} stroke="#000" strokeWidth={3} opacity={0.25} />)}
  </g>
);

// ---------- shots ----------
const S1_Hook: React.FC<{ f: number; i: number }> = ({ f, i }) => (
  <g>
    <Bedroom f={f} id={"bh" + i} />
    <Bed f={f} x={540} y={1430} s={0.62} awake={false} />
    <Zzz f={f} x={330} y={1240} o={0.6} />
    <Duo f={f} y={1580} ax={230} hx={850} s={0.82} />
    <QBubble f={f} i={i} x={430} y={880} tx={250} ty={1110} fs={i === 0 ? 82 : 78} />
  </g>
);
const S2_Paralysis: React.FC<{ f: number }> = ({ f }) => {
  const locks = [[700, 1160], [520, 1180], [360, 1150]];
  return (
    <g>
      <Bedroom f={f} id="bp" spooky={0.4} />
      <Bed f={f} x={540} y={1360} s={1.15} awake />
      {locks.map(([x, y], k) => <Lock key={k} x={x} y={y - 150} p={pop(f, F.paralysis + 6 + k * 5, 12)} s={0.9} />)}
      <Label x={540} y={600} text="SLEEP" p={pop(f, F.called + 8, 12)} fs={120} fill={YEL} />
      <Label x={540} y={740} text="PARALYSIS" p={pop(f, F.paralysis, 12)} fs={120} fill={YEL} />
      {f >= F.common && <Chip x={540} y={880} w={520} label="MORE COMMON THAN YOU THINK" hue={VIOLET} p={pop(f, F.common, 12)} fs={30} />}
    </g>
  );
};
const S3_Twelve: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Grad id="tw" top="#1a1f48" bot="#2a1f48" />
    {[...Array(12)].map((_, k) => {
      const c = k % 4, r = Math.floor(k / 4), x = 210 + c * 220, y = 820 + r * 230;
      const p = pop(f, F.studies + 4 + k * 3, 10), hot = k === 6 && f >= F.twelve;
      return (
        <g key={k} transform={`translate(${x} ${y}) scale(${Math.max(0, p)})`}>
          <circle cy={-70} r={42} fill={hot ? YEL : "#c9d3ff"} stroke={INKC} strokeWidth={6} />
          <path d="M-56 70 Q-56 -20 0 -20 Q56 -20 56 70 Z" fill={hot ? YEL : "#8a90c0"} stroke={INKC} strokeWidth={6} />
          {hot && <g><circle cx={-14} cy={-74} r={7} fill={INKC} /><circle cx={14} cy={-74} r={7} fill={INKC} /><ellipse cx={0} cy={-50} rx={8} ry={10} fill={INKC} /></g>}
        </g>
      );
    })}
    <BigNum f={f} at={F.one - 2} text="1 IN 12" x={540} y={520} hue={YEL} fs={170} />
    {f >= F.once && <Chip x={540} y={1550} w={420} label="AT LEAST ONCE" hue={VIOLET} p={pop(f, F.once, 12)} fs={38} />}
  </g>
);
const Brain: React.FC<{ f: number; x: number; y: number; s?: number; eyes?: number }> = ({ f, x, y, s = 1, eyes = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-200 30 Q-240 -150 -70 -200 Q30 -260 140 -190 Q250 -130 210 30 Q220 140 100 160 Q0 210 -100 160 Q-220 150 -200 30 Z" fill="#ffb3c6" stroke={INKC} strokeWidth={9} />
    <path d="M-140 -60 q 40 -50 90 0 t 90 0 t 80 -10 M-120 50 q 40 -30 90 0 t 80 0 t 70 -10 M0 -210 q -20 100 10 330" stroke="#d9758f" strokeWidth={8} fill="none" strokeLinecap="round" />
    {eyes > 0 && [-70, 70].map((ex) => (
      <g key={ex}>
        <ellipse cx={ex} cy={-10} rx={42} ry={42 * eyes} fill="#ffffff" stroke={INKC} strokeWidth={6} />
        {eyes > 0.4 && <circle cx={ex + Math.sin(f * 0.1) * 8} cy={-6} r={16} fill={INKC} />}
      </g>
    ))}
  </g>
);
const S4_Switch: React.FC<{ f: number }> = ({ f }) => {
  const off = f >= F.switches + 6 && f < F.on + 4;
  const lever = off ? -1 : 1;
  const flip = f < F.switches + 6 ? 1 : f < F.on + 4 ? -1 : 1;
  const eyes = eout(ramp(f, F.wakes - 4, F.wakes + 10));
  const dreamP = pop(f, F.dream - 2, 14);
  return (
    <g>
      <Grad id="sw" top="#141836" bot="#241a48" />
      {[...Array(14)].map((_, i) => <line key={i} x1={0} x2={VW} y1={i * 140} y2={i * 140} stroke="#ffffff" strokeWidth={1.5} opacity={0.05} />)}
      <Brain f={f} x={540} y={560} s={1} eyes={eyes} />
      {/* dream cloud */}
      {f >= F.dream - 2 && (
        <g transform={`translate(860 300) scale(${Math.max(0, dreamP)})`}>
          {[[-60, 0, 60], [0, -30, 70], [70, 0, 60], [0, 40, 60]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill="#ffffff" stroke={INKC} strokeWidth={6} />)}
          {[[-60, 0, 54], [0, -30, 64], [70, 0, 54], [0, 40, 54]].map(([cx, cy, r], k) => <circle key={"i" + k} cx={cx} cy={cy} r={r} fill="#ffffff" />)}
          {/* running stick figure */}
          <g transform="translate(0 10)" stroke={INKC} strokeWidth={7} strokeLinecap="round" fill="none">
            <circle cx={0} cy={-46} r={14} fill={INKC} />
            <line x1={0} y1={-32} x2={0} y2={10} />
            <line x1={0} y1={10} x2={Math.sin(f * 0.4) * 22} y2={44} /><line x1={0} y1={10} x2={-Math.sin(f * 0.4) * 22} y2={44} />
            <line x1={0} y1={-20} x2={-Math.sin(f * 0.4) * 24} y2={0} /><line x1={0} y1={-20} x2={Math.sin(f * 0.4) * 24} y2={0} />
          </g>
          <circle cx={-150} cy={110} r={22} fill="#ffffff" stroke={INKC} strokeWidth={5} /><circle cx={-190} cy={150} r={12} fill="#ffffff" stroke={INKC} strokeWidth={4} />
        </g>
      )}
      {/* muscle switch */}
      <g transform="translate(540 1020)">
        <rect x={-210} y={-90} width={420} height={180} rx={30} fill="#2a2f5a" stroke={INKC} strokeWidth={8} />
        <text x={-130} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={GREEN} opacity={flip > 0 ? 1 : 0.3}>ON</text>
        <text x={130} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={RED} opacity={flip < 0 ? 1 : 0.3}>OFF</text>
        <rect x={-120} y={6} width={240} height={50} rx={25} fill="#141836" stroke={INKC} strokeWidth={5} />
        <g transform={`rotate(${flip > 0 ? -35 : 35} 0 30)`}>
          <line x1={0} y1={30} x2={0} y2={-60} stroke="#c9d3e6" strokeWidth={16} strokeLinecap="round" />
          <circle cx={0} cy={-64} r={26} fill={flip > 0 ? GREEN : RED} stroke={INKC} strokeWidth={6} />
        </g>
        <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffffff" stroke={INKC} strokeWidth={7} paintOrder="stroke" letterSpacing={4}>MUSCLES</text>
      </g>
      {/* sleeper */}
      <Bed f={f} x={560} y={1440} s={0.62} awake={eyes > 0.5} />
      {!off && f < F.switches && <Zzz f={f} x={330} y={1280} />}
      {f >= F.act && f < F.sometimes && <Chip x={540} y={1200} w={440} label="BODY STAYS STILL" hue={VIOLET} p={pop(f, F.act, 12)} fs={34} />}
      {f >= F.mind && <Chip x={340} y={260} w={380} label="MIND: AWAKE" hue={YEL} p={pop(f, F.wakes, 12)} fs={36} textColor={INKC} />}
      {f >= F.before && f < F.on && <Chip x={540} y={1200} w={440} label="SWITCH STILL OFF!" hue={RED} p={pop(f, F.before + 4, 12)} fs={34} />}
      {lever === 0 && null}
    </g>
  );
};
const S6_Weight: React.FC<{ f: number }> = ({ f }) => {
  const press = eout(ramp(f, F.heavy - 4, F.chest + 6));
  const shadow = eio(ramp(f, F.sense - 10, F.someone + 20));
  const half = pop(f, F.half, 14);
  return (
    <g>
      <Bedroom f={f} id="bw" spooky={0.7 + 0.3 * shadow} />
      {/* half-dream haze */}
      <g opacity={0.35 * clamp01(half)}>{[...Array(10)].map((_, k) => <circle key={k} cx={rnd("hz" + k) * VW} cy={500 + rnd("hzy" + k) * 900} r={80 + rnd("hzr" + k) * 120} fill={VIOLET} opacity={0.3 + 0.2 * Math.sin(f * 0.05 + k)} />)}</g>
      {/* shadow figure in the doorway */}
      <g transform="translate(220 1460)">
        <rect x={-130} y={-760} width={260} height={760} fill="#0a0a14" stroke="#3a3a5a" strokeWidth={10} />
        <g opacity={shadow} transform={`translate(${Math.sin(f * 0.05) * 4} 0)`}>
          <path d="M-70 0 L-80 -420 Q-80 -520 0 -540 Q80 -520 80 -420 L70 0 Z" fill="#000000" />
          <circle cx={0} cy={-600} r={70} fill="#000000" />
          <circle cx={-24} cy={-604} r={8} fill={RED} opacity={0.6 + 0.4 * Math.sin(f * 0.2)} /><circle cx={24} cy={-604} r={8} fill={RED} opacity={0.6 + 0.4 * Math.sin(f * 0.2)} />
        </g>
      </g>
      <Bed f={f} x={620} y={1380} s={0.95} awake chest={press} />
      {/* heavy weight pressing on chest */}
      {f >= F.heavy - 6 && (
        <g transform={`translate(480 ${lerp(800, 1145, press)})`} opacity={clamp01(pop(f, F.heavy - 6, 10))}>
          <path d="M-110 -60 L110 -60 L140 70 L-140 70 Z" fill="#2a2a3a" stroke="#8a8aa8" strokeWidth={8} strokeLinejoin="round" />
          <path d="M-40 -60 Q-40 -110 0 -110 Q40 -110 40 -60" stroke="#8a8aa8" strokeWidth={14} fill="none" />
          <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#ffffff" letterSpacing={4}>HEAVY</text>
        </g>
      )}
      <Label x={600} y={520} text="HALF DREAMING" p={half * (1 - ramp(f, F.many - 6, F.many))} fs={70} fill="#c9b3ff" />
      {f >= F.someone && <Label x={340} y={560} text="SOMEONE THERE?" p={pop(f, F.someone + 4, 12)} fs={52} fill={RED} />}
    </g>
  );
};
const S8_Legends: React.FC<{ f: number }> = ({ f }) => {
  const c1 = pop(f, F.newfoundland - 4, 14), c2 = pop(f, F.japan - 4, 14);
  return (
    <g>
      <Grad id="lg" top="#2a1a14" bot="#4a2e1e" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("lgx" + i) * VW} cy={rnd("lgy" + i) * VH} r={2 + rnd("lgr" + i) * 3} fill="#ffcf8a" opacity={0.25 + 0.2 * Math.sin(f * 0.1 + i)} />)}
      {/* demon scroll */}
      <g transform="translate(540 520)" opacity={1 - ramp(f, F.newfoundland - 10, F.newfoundland)}>
        <g opacity={clamp01(pop(f, F.demons - 6, 12))}>
          <rect x={-300} y={-220} width={600} height={400} rx={10} fill="#e8d4a8" stroke={INKC} strokeWidth={8} />
          <rect x={-330} y={-240} width={660} height={40} rx={20} fill="#8a5a3a" stroke={INKC} strokeWidth={6} />
          <rect x={-330} y={160} width={660} height={40} rx={20} fill="#8a5a3a" stroke={INKC} strokeWidth={6} />
          {/* cartoon demon */}
          <g transform={`translate(0 0) scale(${1 + Math.sin(f * 0.15) * 0.03})`}>
            <path d="M-50 -90 L-70 -150 L-20 -110 Z M50 -90 L70 -150 L20 -110 Z" fill="#7a1a1a" stroke={INKC} strokeWidth={5} />
            <circle cy={-50} r={80} fill="#a02a2a" stroke={INKC} strokeWidth={6} />
            <path d="M-36 -70 L-10 -56 M36 -70 L10 -56" stroke={INKC} strokeWidth={7} strokeLinecap="round" />
            <circle cx={-26} cy={-44} r={9} fill={YEL} /><circle cx={26} cy={-44} r={9} fill={YEL} />
            <path d="M-30 -6 Q0 14 30 -6" stroke={INKC} strokeWidth={6} fill="none" />
          </g>
        </g>
      </g>
      <Label x={540} y={900} text="BLAMED: DEMONS" p={pop(f, F.demons, 12) * (1 - ramp(f, F.newfoundland - 10, F.newfoundland))} fs={66} fill={RED} />
      {/* two legend cards */}
      {[[F.newfoundland, 290, "NEWFOUNDLAND", "THE OLD HAG", c1, "#2f6db5"], [F.japan, 790, "JAPAN", "KANASHIBARI", c2, "#c0392b"]].map(([at, x, place, name, p, hue], k) => (
        (p as number) > 0 ? (
          <g key={k} transform={`translate(${x} 760) rotate(${k ? 4 : -4}) scale(${Math.max(0, p as number)})`}>
            <rect x={-220} y={-300} width={440} height={600} rx={22} fill="#f4ecd8" stroke={INKC} strokeWidth={8} />
            <rect x={-220} y={-300} width={440} height={90} rx={22} fill={hue as string} stroke={INKC} strokeWidth={8} />
            <text y={-240} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={k ? 46 : 36} fill="#ffffff" letterSpacing={2}>{place}</text>
            {k === 0 ? (
              <g transform="translate(0 20)">
                {/* hooded hag silhouette */}
                <path d="M-90 150 Q-100 -40 -30 -110 Q0 -140 30 -110 Q100 -40 90 150 Z" fill="#3a3048" stroke={INKC} strokeWidth={6} />
                <ellipse cx={4} cy={-50} rx={34} ry={40} fill="#1a1420" />
                <circle cx={-8} cy={-54} r={6} fill="#ffd36b" /><circle cx={16} cy={-54} r={6} fill="#ffd36b" />
                <path d="M60 20 L120 -60" stroke="#6a4a3a" strokeWidth={10} strokeLinecap="round" />
              </g>
            ) : (
              <g transform="translate(0 30)">
                {/* Mt Fuji + torii + chains (kanashibari = "bound in metal") */}
                <path d="M-170 120 L-40 -90 L0 -110 L40 -90 L170 120 Z" fill="#7a8ab8" stroke={INKC} strokeWidth={6} />
                <path d="M-62 -54 L-40 -90 L0 -110 L40 -90 L62 -54 Q20 -40 0 -60 Q-20 -40 -62 -54 Z" fill="#ffffff" stroke={INKC} strokeWidth={4} />
                <g transform="translate(0 80)">
                  <rect x={-110} y={-90} width={220} height={22} rx={6} fill="#c0392b" stroke={INKC} strokeWidth={5} />
                  <rect x={-90} y={-60} width={180} height={14} fill="#c0392b" stroke={INKC} strokeWidth={4} />
                  <rect x={-80} y={-70} width={20} height={130} fill="#c0392b" stroke={INKC} strokeWidth={4} />
                  <rect x={60} y={-70} width={20} height={130} fill="#c0392b" stroke={INKC} strokeWidth={4} />
                </g>
              </g>
            )}
            <text y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INKC} textLength={Math.min(380, (name as string).length * 31)} lengthAdjust="spacingAndGlyphs">{name}</text>
          </g>
        ) : null
      ))}
    </g>
  );
};
const S9_Painting: React.FC<{ f: number }> = ({ f }) => {
  const imp = pop(f, F.creature - 2, 14);
  return (
    <g>
      <Grad id="gal" top="#3a1a1a" bot="#5a2a22" />
      <path d="M380 0 L700 0 L980 1460 L100 1460 Z" fill="#fff6d8" opacity={0.07} />
      {/* gold frame */}
      <g transform="translate(540 820)">
        <rect x={-430} y={-330} width={860} height={660} fill="#c8a24a" stroke={INKC} strokeWidth={8} />
        <rect x={-400} y={-300} width={800} height={600} fill="#e8c86a" stroke={INKC} strokeWidth={5} />
        <rect x={-370} y={-270} width={740} height={540} fill="#3a1410" stroke={INKC} strokeWidth={6} />
        {/* curtain + horse head */}
        <path d="M-370 -270 Q-280 0 -330 270 L-370 270 Z" fill="#7a1a1a" />
        <path d="M200 -270 Q260 -120 370 -100 L370 -270 Z" fill="#7a1a1a" />
        <g transform="translate(250 -150)" opacity={0.85}>
          <path d="M-40 60 Q-50 -20 0 -50 Q50 -60 80 -10 Q90 30 60 40 Q40 70 -40 60 Z" fill="#2a1a14" stroke="#5a3a2a" strokeWidth={4} />
          <circle cx={30} cy={-14} r={7} fill="#ffffff" />
        </g>
        {/* sleeping woman draped across a bed */}
        <path d="M-330 170 L330 170 L330 230 L-330 230 Z" fill="#c8b8a0" />
        <g transform="translate(220 130) rotate(-90) scale(0.62)">
          <Person d={{ ...SLEEPER, top: "dress", topC: "#f4f1ea", pants: "#f4f1ea", hairC: "#c4872a", hair: "long" }} f={0} seed={9} talk={0} wave={0} mood="neutral" />
        </g>
        {/* the creature on her chest */}
        <g transform={`translate(90 ${2 + Math.sin(f * 0.1) * 3}) scale(${Math.max(0, imp)})`}>
          <ellipse cx={0} cy={20} rx={58} ry={66} fill="#3a2a22" stroke={INKC} strokeWidth={5} />
          <circle cx={0} cy={-56} r={42} fill="#4a3428" stroke={INKC} strokeWidth={5} />
          <path d="M-36 -82 L-50 -130 L-14 -96 Z M36 -82 L50 -130 L14 -96 Z" fill="#4a3428" stroke={INKC} strokeWidth={4} />
          <circle cx={-14} cy={-58} r={7} fill={YEL} /><circle cx={14} cy={-58} r={7} fill={YEL} />
        </g>
      </g>
      <g transform="translate(540 1230)">
        <rect x={-250} y={-40} width={500} height={80} rx={8} fill="#c8a24a" stroke={INKC} strokeWidth={5} />
        <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC} letterSpacing={3}>"THE NIGHTMARE"</text>
      </g>
      <BigNum f={f} at={F.y1781 - 2} text="1781" x={540} y={470} hue={YEL} fs={170} />
      {f >= F.creature && <Chip x={760} y={600} w={320} label="ON HER CHEST" hue={RED} p={pop(f, F.chest2, 12)} fs={34} />}
    </g>
  );
};
const S10_Safe: React.FC<{ f: number }> = ({ f }) => {
  const sweep = (f - F.seconds) * 0.12;
  return (
    <g>
      <Grad id="safe" top="#1a3a5a" bot="#2a5a6a" />
      <Stamp f={f} at={F.no} x={540} y={500} text="NOT DANGEROUS" hue={GREEN} fs={58} rot={-6} />
      {/* stopwatch */}
      <g transform="translate(300 800)" opacity={clamp01(pop(f, F.seconds - 4, 12))}>
        <rect x={-24} y={-200} width={48} height={40} rx={8} fill="#c9d3e6" stroke={INKC} strokeWidth={6} />
        <circle r={160} fill="#ffffff" stroke={INKC} strokeWidth={10} />
        {[...Array(12)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 6) * 120} y1={-Math.cos(i * Math.PI / 6) * 120} x2={Math.sin(i * Math.PI / 6) * 140} y2={-Math.cos(i * Math.PI / 6) * 140} stroke={INKC} strokeWidth={6} />)}
        <path d={`M0 0 L0 -130 A130 130 0 ${(sweep % (Math.PI * 2)) > Math.PI ? 1 : 0} 1 ${Math.sin(sweep) * 130} ${-Math.cos(sweep) * 130} Z`} fill={GREEN} opacity={0.35} />
        <line x1={0} y1={0} x2={Math.sin(sweep) * 130} y2={-Math.cos(sweep) * 130} stroke={RED} strokeWidth={8} strokeLinecap="round" />
        <circle r={12} fill={INKC} />
      </g>
      <Label x={720} y={720} text="SECONDS..." p={pop(f, F.seconds, 12)} fs={62} />
      <Label x={720} y={840} text="1–2 MINUTES" p={pop(f, F.minute - 4, 12)} fs={62} fill={YEL} />
      {/* tips */}
      {f >= F.regular - 4 && (
        <g transform="translate(540 1180)">
          <g opacity={clamp01(pop(f, F.regular - 4, 12))}>
            <rect x={-420} y={-110} width={380} height={220} rx={24} fill="#ffffff" stroke={INKC} strokeWidth={7} />
            {[...Array(7)].map((_, i) => <g key={i}><circle cx={-375 + i * 48} cy={-40} r={18} fill="#2a3270" /><path d={`M${-386 + i * 48} 20 l 8 10 l 16 -20`} stroke={GREEN} strokeWidth={7} fill="none" strokeLinecap="round" opacity={f > F.regular + i * 3 ? 1 : 0} /></g>)}
            <text x={-230} y={85} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INKC}>REGULAR SLEEP</text>
          </g>
          {f >= F.side - 8 && (
            <g opacity={clamp01(pop(f, F.side - 8, 12))}>
              <rect x={40} y={-110} width={380} height={220} rx={24} fill="#ffffff" stroke={INKC} strokeWidth={7} />
              {/* side-sleeper icon: curled figure on a mattress */}
              <rect x={70} y={10} width={320} height={30} rx={12} fill="#c9d3ff" stroke={INKC} strokeWidth={5} />
              <circle cx={120} cy={-26} r={26} fill="#efc69d" stroke={INKC} strokeWidth={5} />
              <path d="M150 -20 Q230 -40 290 -10 L330 -40 L350 -10 L300 10 L160 10 Z" fill="#7b8fd8" stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
              <text x={230} y={85} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INKC}>SLEEP ON SIDE ✓</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};
const S11_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Bedroom f={f} id="bo" />
    <Bed f={f} x={540} y={1430} s={0.62} awake={false} />
    <Outro f={f} at={F.sub} />
    <Duo f={f} y={1580} ax={160} hx={915} s={0.76} wave hostWave askBase="happy" />
  </g>
);

export const SleepParalysisFilm: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = F.called - 10, c2 = F.studies - 6, b3 = F.why - 4, b4 = F.when - 6, c4 = F.sometimes - 6, b5 = F.frozen - 4, b6 = F.exactly - 4, c6 = F.many - 6, b7 = F.horror - 4, b8 = F.centuries - 10, b9 = F.famous - 8, b10 = F.danger - 4, b11 = F.no - 4, b12 = F.sub - 4;
  const SHOTS: Shot[] = [
    { from: 0, to: b1, render: () => <S1_Hook f={f} i={0} />, cam: [[0, { x: 540, y: 1150, z: 1.18 }], [F.move, { x: 520, y: 1180, z: 1.12 }], [b1, { x: 540, y: 1160, z: 1.16 }]] },
    { from: b1, to: c2, tr: "iris", render: () => <S2_Paralysis f={f} />, cam: [[b1, { x: 380, y: 1150, z: 1.5 }], [F.paralysis, { x: 540, y: 1000, z: 1.12 }], [c2, { x: 540, y: 960, z: 1.02 }]] },
    { from: c2, to: b3, tr: "wipe", render: () => <S3_Twelve f={f} />, cam: [[c2, { x: 540, y: 900, z: 1.15 }], [F.twelve, { x: 540, y: 760, z: 1.08 }], [b3, { x: 540, y: 960, z: 1.0 }]] },
    { from: b3, to: b4, tr: "push", render: () => <S1_Hook f={f} i={1} />, cam: [[b3, { x: 540, y: 1120, z: 1.1 }], [b4, { x: 540, y: 1160, z: 1.18 }]] },
    { from: b4, to: c4, tr: "zoom", render: () => <S4_Switch f={f} />, cam: [[b4, { x: 540, y: 600, z: 1.35 }], [F.switches, { x: 540, y: 900, z: 1.1 }], [F.act, { x: 540, y: 1150, z: 1.15 }], [c4, { x: 540, y: 1000, z: 1.05 }]] },
    { from: c4, to: b5, tr: "cut", render: () => <S4_Switch f={f} />, cam: [[c4, { x: 480, y: 520, z: 1.45 }], [F.before, { x: 540, y: 900, z: 1.12 }], [b5, { x: 540, y: 960, z: 1.05 }]] },
    { from: b5, to: b6, tr: "whip", render: () => <Talk f={f} i={2} />, cam: [[b5, { x: 540, y: 1150, z: 1.15 }], [b6, { x: 540, y: 1100, z: 1.1 }]] },
    { from: b6, to: c6, tr: "flash", render: () => <S6_Weight f={f} />, cam: [[b6, { x: 600, y: 1100, z: 1.3 }], [c6, { x: 620, y: 1060, z: 1.18 }]] },
    { from: c6, to: b7, tr: "cut", render: () => <S6_Weight f={f} />, cam: [[c6, { x: 620, y: 1100, z: 1.4 }], [F.chest, { x: 600, y: 1150, z: 1.25 }], [F.sense, { x: 300, y: 1000, z: 1.3 }], [b7, { x: 360, y: 980, z: 1.2 }]] },
    { from: b7, to: b8, tr: "spin", render: () => <Talk f={f} i={3} />, cam: [[b7, { x: 540, y: 1150, z: 1.2 }], [b8, { x: 540, y: 1120, z: 1.12 }]] },
    { from: b8, to: b9, tr: "whipUp", render: () => <S8_Legends f={f} />, cam: [[b8, { x: 540, y: 600, z: 1.3 }], [F.newfoundland, { x: 360, y: 780, z: 1.2 }], [F.japan, { x: 600, y: 780, z: 1.08 }], [b9, { x: 540, y: 820, z: 1.05 }]] },
    { from: b9, to: b10, tr: "iris", render: () => <S9_Painting f={f} />, cam: [[b9, { x: 540, y: 700, z: 1.25 }], [F.y1781, { x: 540, y: 700, z: 1.1 }], [F.creature, { x: 540, y: 770, z: 1.25 }], [b10, { x: 540, y: 770, z: 1.2 }]] },
    { from: b10, to: b11, tr: "push", render: () => <Talk f={f} i={4} />, cam: [[b10, { x: 540, y: 1150, z: 1.12 }], [b11, { x: 540, y: 1150, z: 1.2 }]] },
    { from: b11, to: b12, tr: "wipe", render: () => <S10_Safe f={f} />, cam: [[b11, { x: 540, y: 600, z: 1.3 }], [F.seconds, { x: 520, y: 800, z: 1.15 }], [F.regular, { x: 540, y: 1100, z: 1.12 }], [b12, { x: 540, y: 1000, z: 1.02 }]] },
    { from: b12, to: TOTAL + 1, tr: "zoom", render: () => <S11_Outro f={f} />, cam: [[b12, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.paralysis, 0.1], [F.twelve, 0.12], [F.switches + 6, 0.1], [F.wakes, 0.1], [F.frozen, 0.08], [F.chest, 0.12], [F.someone, 0.1], [F.horror, 0.1], [F.demons, 0.08], [F.y1781, 0.12], [F.no, 0.12]];
  const SHAKE: [number, number][] = [[F.chest, 10], [F.someone + 4, 8], [F.horror + 2, 6]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.45], [F.called, "riser_dark", 0.25], [F.paralysis, "impact", 0.4], [F.paralysis + 6, "click", 0.4], [F.common, "pop", 0.3],
    [F.studies + 4, "tick", 0.3], [F.one - 2, "boom", 0.4], [F.why - 3, "pop", 0.45], [F.dream - 2, "pop", 0.35], [F.switches + 6, "click", 0.6],
    [F.wakes - 4, "pop", 0.4], [F.before + 4, "impact", 0.3], [F.on + 4, "click", 0.5], [F.frozen - 3, "pop", 0.45],
    [F.half, "riser_dark", 0.25], [F.heavy - 6, "whoosh", 0.3], [F.chest, "boom", 0.4], [F.sense - 10, "riser_dark", 0.3], [F.someone + 4, "impact", 0.4],
    [F.horror - 3, "pop", 0.45], [F.demons - 6, "pop", 0.35], [F.newfoundland - 4, "pop", 0.35], [F.japan - 4, "pop", 0.35], [F.y1781 - 2, "impact", 0.4], [F.creature - 2, "pop", 0.35],
    [F.danger - 3, "pop", 0.45], [F.no, "impact", 0.4], [F.seconds, "tick", 0.35], [F.regular, "pop", 0.3], [F.side - 8, "pop", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < b4 ? YEL : f < b8 ? VIOLET : f < b11 ? "#ff8a3d" : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="FROZEN" sub="WHY CAN'T YOU MOVE?" until={F.called - 14} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="paralysis" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
/** Dialogue set: doctor's office (asker lines 2–4). */
const Talk: React.FC<{ f: number; i: number }> = ({ f, i }) => (
  <g>
    <Office f={f} id={"of" + i} />
    <Duo f={f} y={1580} ax={260} hx={820} s={0.84} />
    <QBubble f={f} i={i} x={440} y={900} tx={280} ty={1110} />
  </g>
);
