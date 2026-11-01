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
  ask: W("can"), part: W("part"), three: W("three"), one: W("one"), smile: W("smile"),
  how: W("how"), look: W("look"), eyes: W("eyes"), real: W("real", 2), crinkles: W("crinkles"), fake: W("fake"), mouth: W("mouth"),
  french: W("french"), duchenne: W("duchenne"), y1860: W("1860s"),
  two: W("two", 3), pupils: W("pupils"), y1960: W("1960s"), hess: W("hess"), bigger: W("bigger"), interesting: W("interesting"),
  three2: W("three", 3), myth: W("myth"), liars: W("liars"), away: W("away"),
  but: W("but"), fifty: W("fiftyfour"), coin: W("coin"),
  backwards: W("backwards"), lying: W("lying"), brainpower: W("brainpower"), reverse: W("reverse"), cracks: W("cracks"),
  sub: W("subscribe"),
  okayQ: ASKS[2][0], and3: ASKS[3][0], so: ASKS[4][0], askThem: W("ask"),
};
const BUB: { t: string; hot?: boolean }[] = [
  { t: "READ PEOPLE?!", hot: true }, { t: "HOW?" }, { t: "WHAT'S #2?" }, { t: "AND #3?" }, { t: "CATCH A LIAR?!", hot: true },
];

const WALL = "#232a46", WALL2 = "#313a63", FLOOR = "#171b2e", LAMP = "#ffcf6b", GREEN = "#3ddc97", RED = "#ff4b4b", CYAN = "#58e1ff", CARD = "#fff6e0";
const ASKER = CAST[17], HOST = CAST[3];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const askMood = (f: number): "happy" | "neutral" | "surprised" => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
  if (i >= 0) return BUB[i]?.hot ? "surprised" : "neutral";
  if ((f > F.fifty && f < F.fifty + 50) || (f > F.cracks && f < F.cracks + 40)) return "surprised";
  return "happy";
};
const hostMood = (f: number): "happy" | "neutral" | "surprised" => (speaking(f, "asker", SPK) ? "happy" : "neutral");

// ---------- shared pieces ----------
const AskBubble: React.FC<{ f: number; x: number; y: number; tx: number; ty: number; fs?: number }> = ({ f, x, y, tx, ty, fs = 80 }) => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 3 && f < b + 16);
  if (i < 0 || !BUB[i]) return null;
  const [a, b] = ASKS[i]; const { t, hot } = BUB[i];
  const p = pop(f, a - 3, 10), out = 1 - ramp(f, b + 6, b + 16);
  const w = Math.min(900, t.length * fs * 0.66 + 100), h = fs * 1.65;
  const bx = Math.max(w / 2 + 70, Math.min(VW - w / 2 - 70, x));
  const wob = hot ? Math.sin(f * 0.9) * 1.6 : 0;
  const tail = `M${-34} ${h / 2 - 10} L${tx - bx} ${ty - y} L${34} ${h / 2 - 10} Z`;
  const fill = hot ? YEL : "#ffffff";
  return (
    <g opacity={clamp01(out)} transform={`translate(${bx} ${y}) rotate(${-2 + wob}) scale(${Math.max(0, p)})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={h / 2} fill="#000" opacity={0.3} />
      <path d={tail} fill={fill} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={INKC} strokeWidth={9} />
      <path d={`M${-26} ${h / 2 - 14} L${(tx - bx) * 0.25} ${(ty - y) * 0.25} L${26} ${h / 2 - 14} Z`} fill={fill} />
      <text y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC} letterSpacing={1}>{t}</text>
    </g>
  );
};
const Office: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <g>
    <defs>
      <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={WALL} /><stop offset="1" stopColor={WALL2} /></linearGradient>
      <radialGradient id="lampg" cx="50%" cy="0%" r="80%"><stop offset="0" stopColor={LAMP} stopOpacity={0.45} /><stop offset="1" stopColor={LAMP} stopOpacity={0} /></radialGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#wallg)" />
    {/* window with blinds */}
    <g transform="translate(640 330)">
      <rect width={340} height={420} rx={10} fill="#0d1128" stroke="#5a6488" strokeWidth={10} />
      {[...Array(11)].map((_, i) => <rect key={i} x={10} y={14 + i * 36} width={320} height={16} fill="#8d97c0" opacity={0.55} />)}
    </g>
    {/* light stripes from blinds */}
    {[...Array(6)].map((_, i) => <path key={i} d={`M${620 - i * 10} ${780 + i * 70} L${120 - i * 10} ${980 + i * 70} L${120 - i * 10} ${1010 + i * 70} L${620 - i * 10} ${810 + i * 70} Z`} fill="#fff4cf" opacity={0.06} />)}
    {/* cork board with pins + red string */}
    <g transform="translate(90 360)">
      <rect width={420} height={330} rx={12} fill="#b9894f" stroke="#6e4b24" strokeWidth={12} />
      {[[40, 40, "#fff"], [230, 30, "#ffe9a8"], [120, 170, "#d7ecff"], [290, 180, "#fff"]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 2 ? 4 : -5)})`}>
          <rect width={100} height={110} fill={c as string} stroke="#00000033" strokeWidth={2} />
          <circle cx={50} cy={22} r={16} fill="#c9c2b4" /><rect x={28} y={48} width={44} height={8} fill="#9a937f" /><rect x={20} y={66} width={60} height={8} fill="#9a937f" />
          <circle cx={50} cy={6} r={9} fill={RED} stroke={INKC} strokeWidth={3} />
        </g>
      ))}
      <path d="M90 46 L280 36 L170 176 L340 186" stroke={RED} strokeWidth={4} fill="none" />
      <text x={210} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#5a3a18">CASE: HUMANS</text>
    </g>
    {/* lamp */}
    <g transform="translate(540 0)">
      <line x1={0} y1={0} x2={0} y2={150} stroke="#111" strokeWidth={6} />
      <path d="M-70 210 L-30 150 H30 L70 210 Z" fill="#2d6b4f" stroke={INKC} strokeWidth={6} />
      <ellipse cx={0} cy={210} rx={70} ry={12} fill={LAMP} opacity={0.9 + 0.1 * Math.sin(f * 0.3)} />
    </g>
    <path d="M470 210 L610 210 L900 1500 L180 1500 Z" fill="url(#lampg)" />
    <rect y={1490} width={VW} height={VH - 1490} fill={FLOOR} />
    <rect y={1490} width={VW} height={8} fill="#0b0e1c" />
    {dim > 0 && <rect width={VW} height={VH} fill="#05060f" opacity={dim} />}
  </g>
);
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; wave?: number }> = ({ f, ax = 290, hx = 800, y = 1500, s = 1.05, wave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={ASKER} f={f} seed={17} talk={askTalk(f)} wave={wave} mood={askMood(f)} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={HOST} f={f} seed={3} talk={hostTalk(f)} wave={wave} mood={hostMood(f)} /></g>
  </g>
);
const NumCard: React.FC<{ f: number; x: number; y: number; n: number; at: number; label?: string; labelAt?: number; hue: string; s?: number; rot?: number }> = ({ f, x, y, n, at, label, labelAt = 0, hue, s = 1, rot = 0 }) => {
  const p = pop(f, at, 12);
  if (p <= 0) return null;
  const flip = label ? eio(ramp(f, labelAt, labelAt + 10)) : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot * (1 - flip)}) scale(${p * s})`}>
      <rect x={-130 + 10} y={-170 + 14} width={260} height={340} rx={30} fill="#000" opacity={0.3} />
      <rect x={-130} y={-170} width={260} height={340} rx={30} fill={CARD} stroke={INKC} strokeWidth={9} />
      <rect x={-130} y={-170} width={260} height={70} rx={30} fill={hue} stroke={INKC} strokeWidth={9} />
      <text y={100 - flip * 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={200 - flip * 60} fill={INKC}>{n}</text>
      <text y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff" letterSpacing={3}>TRICK</text>
      {label && flip > 0 && label.split("|").map((l, i) => (
        <text key={i} y={110 + i * 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={hue} stroke={INKC} strokeWidth={2} opacity={flip}>{l}</text>
      ))}
    </g>
  );
};
const SKIN = "#e8b98c";
/** Big close-up face: real (Duchenne) smile squints the eyes + crinkles; fake smile only moves the mouth. */
const BigFace: React.FC<{ f: number; x: number; y: number; r: number; real: boolean; crink: number }> = ({ f, x, y, r, real, crink }) => {
  const ex = r * 0.38, ey = -r * 0.1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-r - 8} cy={ey + 20} rx={r * 0.13} ry={r * 0.2} fill={SKIN} stroke={INKC} strokeWidth={8} />
      <ellipse cx={r + 8} cy={ey + 20} rx={r * 0.13} ry={r * 0.2} fill={SKIN} stroke={INKC} strokeWidth={8} />
      <ellipse rx={r} ry={r * 1.08} fill={SKIN} stroke={INKC} strokeWidth={9} />
      <path d={`M${-r * 0.95} ${-r * 0.3} Q${-r} ${-r * 1.3} ${0} ${-r * 1.12} Q${r} ${-r * 1.3} ${r * 0.95} ${-r * 0.3} Q${r * 0.5} ${-r * 0.82} ${-r * 0.2} ${-r * 0.7} Q${-r * 0.6} ${-r * 0.6} ${-r * 0.95} ${-r * 0.3} Z`} fill="#3a2a20" stroke={INKC} strokeWidth={8} />
      {[-1, 1].map((s) => (
        <g key={s}>
          {real ? (
            <g>
              {/* squeezed eye: upturned arc + raised cheek */}
              <path d={`M${s * ex - 46} ${ey + 6} Q${s * ex} ${ey - 30 + crink * 6} ${s * ex + 46} ${ey + 6}`} stroke={INKC} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={`M${s * ex - 40} ${ey + 34} Q${s * ex} ${ey + 16 - crink * 8} ${s * ex + 40} ${ey + 34}`} stroke={mix(SKIN, "#000000", 0.25)} strokeWidth={6} fill="none" strokeLinecap="round" />
              <ellipse cx={s * ex} cy={ey + 74} rx={42} ry={20} fill="#ff6f8a" opacity={0.25 + crink * 0.2} />
              {/* muscle ring squeezing around the eye */}
              <ellipse cx={s * ex} cy={ey} rx={78} ry={56} fill="none" stroke="#ff9a3d" strokeWidth={6} strokeDasharray="12 10" opacity={crink * (0.6 + 0.4 * Math.sin(f * 0.3))} />
              {/* crinkles (crow's feet) */}
              {[-22, 0, 22].map((a, k) => {
                const rad = (a * Math.PI) / 180, x0 = s * (ex + 58), len = 40 * crink;
                return <line key={k} x1={x0} y1={ey + k * 3} x2={x0 + s * Math.cos(rad) * len} y2={ey + Math.sin(rad) * len} stroke={INKC} strokeWidth={7} strokeLinecap="round" />;
              })}
            </g>
          ) : (
            <g>
              <ellipse cx={s * ex} cy={ey} rx={36} ry={30} fill="#fff" stroke={INKC} strokeWidth={7} />
              <circle cx={s * ex} cy={ey + 2} r={15} fill="#2a1d18" />
              <circle cx={s * ex + 5} cy={ey - 4} r={5} fill="#fff" />
              <path d={`M${s * ex - 40} ${ey - 50} H${s * ex + 40}`} stroke="#3a2a20" strokeWidth={11} strokeLinecap="round" />
            </g>
          )}
        </g>
      ))}
      {real && [-1, 1].map((s) => <path key={s} d={`M${s * ex - 40} ${ey - 58} Q${s * ex} ${ey - 74} ${s * ex + 40} ${ey - 58}`} stroke="#3a2a20" strokeWidth={11} fill="none" strokeLinecap="round" />)}
      <path d={`M-10 ${ey + 30} Q 8 ${ey + 80} -6 ${ey + 96}`} stroke={mix(SKIN, "#000000", 0.25)} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d={`M${-r * 0.48} ${r * 0.36} Q0 ${r * 0.86} ${r * 0.48} ${r * 0.36} Q0 ${r * 0.5} ${-r * 0.48} ${r * 0.36} Z`} fill="#fff" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M${-r * 0.4} ${r * 0.44} Q0 ${r * 0.58} ${r * 0.4} ${r * 0.44}`} stroke="#d9d4cc" strokeWidth={4} fill="none" />
    </g>
  );
};
const Magnifier: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 110 }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={r * 0.7} y1={r * 0.7} x2={r * 1.6} y2={r * 1.6} stroke="#6b4a24" strokeWidth={34} strokeLinecap="round" />
    <circle r={r} fill="#bfe6ff" fillOpacity={0.22} stroke={INKC} strokeWidth={16} />
    <circle r={r} fill="none" stroke="#d9dde6" strokeWidth={8} />
    <path d={`M${-r * 0.5} ${-r * 0.55} q ${r * 0.3} ${-r * 0.2} ${r * 0.6} 0`} stroke="#fff" strokeWidth={9} fill="none" opacity={0.8} strokeLinecap="round" />
  </g>
);
/** Huge eye with a pupil that dilates. */
const BigEye: React.FC<{ f: number; x: number; y: number; w: number; pr: number; id: string; spark?: number }> = ({ f, x, y, w, pr, id, spark = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <clipPath id={id}><path d={`M${-w} 0 Q0 ${-w * 0.78} ${w} 0 Q0 ${w * 0.78} ${-w} 0 Z`} /></clipPath>
      <radialGradient id={id + "i"} cx="50%" cy="50%" r="50%"><stop offset="0.3" stopColor="#7fd3b0" /><stop offset="1" stopColor="#2a6b8a" /></radialGradient>
    </defs>
    <path d={`M${-w} 0 Q0 ${-w * 0.78} ${w} 0 Q0 ${w * 0.78} ${-w} 0 Z`} fill="#fbf8f2" />
    <g clipPath={`url(#${id})`}>
      <circle r={w * 0.42} fill={`url(#${id}i)`} stroke={INKC} strokeWidth={8} />
      {[...Array(28)].map((_, i) => { const a = (i / 28) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * (pr + 6)} y1={Math.sin(a) * (pr + 6)} x2={Math.cos(a) * w * 0.4} y2={Math.sin(a) * w * 0.4} stroke="#1e4f66" strokeWidth={4} opacity={0.5} />; })}
      <circle r={pr} fill="#09090e" />
      <circle cx={-w * 0.13} cy={-w * 0.14} r={w * 0.07} fill="#fff" opacity={0.9} />
      {spark > 0 && <path d={`M${w * 0.1} ${w * 0.04} l 8 18 l 20 2 l -15 13 l 5 20 l -18 -11 l -18 11 l 5 -20 l -15 -13 l 20 -2 Z`} fill={YEL} opacity={spark * 0.9} />}
    </g>
    <path d={`M${-w} 0 Q0 ${-w * 0.78} ${w} 0 Q0 ${w * 0.78} ${-w} 0 Z`} fill="none" stroke={INKC} strokeWidth={12} strokeLinejoin="round" />
    {[...Array(7)].map((_, i) => { const t = 0.2 + i * 0.1; const xx = lerp(-w * 0.75, w * 0.75, t); const yy = -w * 0.78 * 0.5 * (1 - Math.pow((xx / w), 2)) * 2 * 0.5; return <line key={i} x1={xx} y1={yy - 4} x2={xx + (xx / w) * 18} y2={yy - 40} stroke={INKC} strokeWidth={8} strokeLinecap="round" />; })}
  </g>
);
/** A tiny pictogram for the story panels. */
const Picto: React.FC<{ k: number }> = ({ k }) => {
  switch (k) {
    case 0: return <g><path d="M-50 0 L0 -45 L50 0 Z" fill="#e4473b" stroke={INKC} strokeWidth={6} strokeLinejoin="round" /><rect x={-38} y={0} width={76} height={56} fill="#ffe1a8" stroke={INKC} strokeWidth={6} /><rect x={-12} y={20} width={24} height={36} fill="#8a5a2b" /></g>;
    case 1: return <g><path d="M-60 20 V0 L-36 -26 H30 L60 0 V20 Z" fill="#3d6ccf" stroke={INKC} strokeWidth={6} strokeLinejoin="round" /><circle cx={-32} cy={26} r={15} fill="#222" stroke={INKC} strokeWidth={4} /><circle cx={32} cy={26} r={15} fill="#222" stroke={INKC} strokeWidth={4} /><rect x={-28} y={-18} width={24} height={16} fill="#bfe6ff" /><rect x={4} y={-18} width={24} height={16} fill="#bfe6ff" /></g>;
    case 2: return <g><path d="M-30 -30 H30 L24 40 H-24 Z" fill="#fff" stroke={INKC} strokeWidth={6} /><path d="M30 -10 q 26 4 0 30" stroke={INKC} strokeWidth={6} fill="none" /><rect x={-28} y={-16} width={56} height={14} fill="#8a5a2b" />{[0, 1].map((i) => <path key={i} d={`M${-10 + i * 18} -40 q -8 -12 0 -24`} stroke="#bbb" strokeWidth={5} fill="none" />)}</g>;
    default: return <g><path d="M10 -46 A46 46 0 1 0 40 26 A36 36 0 1 1 10 -46 Z" fill={YEL} stroke={INKC} strokeWidth={6} />{[[-40, -30], [36, -36], [-30, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#fff" />)}</g>;
  }
};

// ---------- shots ----------
const S1_Office: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} />
    <Duo f={f} />
    <g opacity={pop(f, F.part, 10)} transform={`translate(830 ${880 + Math.sin(f * 0.12) * 6}) rotate(8) scale(${clamp01(pop(f, F.part, 10))})`}>
      <rect x={-150} y={-62} width={300} height={124} rx={24} fill={RED} stroke={INKC} strokeWidth={9} />
      <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill="#fff" letterSpacing={2}>PART 2</text>
    </g>
    <AskBubble f={f} x={360} y={760} tx={300} ty={1010} />
  </g>
);
const S2_Cards: React.FC<{ f: number }> = ({ f }) => {
  const t1 = W("three"), sci = W("science");
  const focus = eio(ramp(f, F.one, F.one + 14));
  return (
    <g>
      <Office f={f} dim={0.45} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, sci, 10)}>BACKED BY SCIENCE</text>
      <NumCard f={f} x={lerp(220, 260, focus)} y={lerp(760, 760, focus)} n={1} at={t1 + 2} hue={GREEN} rot={-8} s={1} />
      <NumCard f={f} x={lerp(540, 680, focus)} y={lerp(720, 560, focus)} n={2} at={t1 + 8} hue={CYAN} s={lerp(1, 0.42, focus)} />
      <NumCard f={f} x={lerp(860, 840, focus)} y={lerp(760, 560, focus)} n={3} at={t1 + 14} hue={RED} rot={8} s={lerp(1, 0.42, focus)} />
      {focus > 0 && (
        <g opacity={focus} transform={`translate(${lerp(300, 440, focus)} 790)`}>
          <rect x={-10} y={-80} width={480} height={160} rx={30} fill={GREEN} stroke={INKC} strokeWidth={9} />
          <text x={220} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC}>IS THE SMILE</text>
          <text x={220} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={6} paintOrder="stroke">REAL?</text>
        </g>
      )}
      <Duo f={f} s={0.9} ax={300} hx={790} />
      <AskBubble f={f} x={300} y={1000} tx={300} ty={1090} fs={90} />
    </g>
  );
};
const S3_Smiles: React.FC<{ f: number }> = ({ f }) => {
  const crink = eout(ramp(f, F.real - 4, F.crinkles + 10));
  const mag = eio(ramp(f, F.eyes - 10, F.eyes + 14));
  const fakeIn = pop(f, F.fake - 2, 12);
  const mouthHi = ramp(f, F.mouth - 2, F.mouth + 8);
  return (
    <g>
      <rect width={VW} height={VH} fill="#ffe9c7" />
      {[...Array(14)].map((_, i) => <circle key={i} cx={rnd("d" + i) * VW} cy={rnd("e" + i) * VH} r={30 + rnd("r" + i) * 60} fill="#ffd79a" opacity={0.5} />)}
      <rect x={60} y={190} width={960} height={640} rx={50} fill="#fff" stroke={INKC} strokeWidth={9} />
      <BigFace f={f} x={540} y={530} r={200} real crink={crink} />
      <Chip x={540} y={240} w={330} label="REAL ✓" hue={GREEN} p={pop(f, F.real, 10)} fs={46} textColor={INKC} />
      {crink > 0.3 && <text x={540} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#ff7a1a" stroke="#fff" strokeWidth={8} paintOrder="stroke" opacity={ramp(f, F.crinkles, F.crinkles + 8)}>EYE CRINKLES</text>}
      <g opacity={clamp01(fakeIn)} transform={`translate(0 ${(1 - clamp01(fakeIn)) * 200})`}>
        <rect x={60} y={880} width={960} height={640} rx={50} fill="#f1f1f4" stroke={INKC} strokeWidth={9} />
        <BigFace f={f} x={540} y={1210} r={200} real={false} crink={0} />
        <Chip x={540} y={930} w={330} label="FAKE ✗" hue={RED} p={fakeIn} fs={46} />
        {mouthHi > 0 && <ellipse cx={540} cy={1325} rx={130} ry={70} fill="none" stroke={RED} strokeWidth={10} strokeDasharray="20 12" opacity={mouthHi} />}
        {mouthHi > 0 && <text x={540} y={1490} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={RED} stroke="#fff" strokeWidth={8} paintOrder="stroke" opacity={mouthHi}>ONLY THE MOUTH</text>}
      </g>
      {mag > 0 && mag < 1.01 && f < F.real + 6 && <g opacity={1 - ramp(f, F.real, F.real + 6)}><Magnifier x={lerp(900, 640, mag)} y={lerp(900, 520, mag)} /></g>}
    </g>
  );
};
const S4_Duchenne: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#3b2a1c" />
    {[...Array(12)].map((_, i) => <rect key={i} x={i * 90} y={0} width={44} height={VH} fill="#462f1e" />)}
    {/* sepia portrait */}
    <g transform="translate(540 820)">
      <rect x={-300} y={-380} width={600} height={720} rx={20} fill="#c69a4a" stroke={INKC} strokeWidth={10} />
      <rect x={-262} y={-342} width={524} height={644} fill="#e9d6ae" stroke="#8a6a32" strokeWidth={8} />
      <g transform="translate(0 280) scale(1.25)"><Person d={CAST[35]} f={f} seed={9} talk={0} wave={0} mood="happy" /></g>
      <rect x={-200} y={370} width={400} height={70} rx={10} fill="#d9b25b" stroke={INKC} strokeWidth={6} />
      <text y={418} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC} letterSpacing={3} opacity={pop(f, F.duchenne, 10)}>G. DUCHENNE</text>
    </g>
    {/* French flag chip */}
    <g opacity={pop(f, F.french, 10)} transform={`translate(190 360) rotate(-6) scale(${clamp01(pop(f, F.french, 10))})`}>
      <rect x={-110} y={-70} width={220} height={140} rx={10} fill="#fff" stroke={INKC} strokeWidth={7} />
      <rect x={-110} y={-70} width={73} height={140} fill="#2f5fd0" /><rect x={37} y={-70} width={73} height={140} fill="#e4473b" />
      <rect x={-110} y={-70} width={220} height={140} rx={10} fill="none" stroke={INKC} strokeWidth={7} />
      <text y={120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke">FRANCE</text>
    </g>
    <BigNum f={f} at={F.y1860} text="1860s" x={540} y={1440} hue={YEL} fs={190} />
    <g opacity={pop(f, F.y1860 + 10, 10)}><text x={540} y={1530} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" letterSpacing={3}>"THE DUCHENNE SMILE"</text></g>
  </g>
);
const S5_Two: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} />
    <Duo f={f} />
    <NumCard f={f} x={680} y={720} n={2} at={F.two} hue={CYAN} label="WATCH THE|PUPILS" labelAt={F.pupils - 4} rot={6} s={0.95} />
    <AskBubble f={f} x={330} y={780} tx={300} ty={1010} />
  </g>
);
const S6_Eye: React.FC<{ f: number }> = ({ f }) => {
  const dil = eout(ramp(f, F.bigger - 4, F.bigger + 16));
  const like = pop(f, F.interesting - 2, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#0f2530" />
      {[...Array(6)].map((_, i) => <circle key={i} cx={540} cy={860} r={260 + i * 120} fill="none" stroke="#1d4252" strokeWidth={3} />)}
      <BigEye f={f} x={540} y={860} w={430} pr={lerp(52, 118, dil)} id="eyeA" spark={clamp01(like)} />
      {/* pupil size gauge */}
      <g transform="translate(540 1270)">
        <text y={0} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#fff" letterSpacing={3}>PUPIL SIZE</text>
        <rect x={-300} y={26} width={600} height={40} rx={20} fill="#1d4252" stroke="#fff" strokeWidth={4} />
        <rect x={-296} y={30} width={lerp(170, 592, dil)} height={32} rx={16} fill={dil > 0.5 ? GREEN : CYAN} />
        {dil > 0.4 && <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={GREEN} opacity={ramp(f, F.bigger + 4, F.bigger + 12)}>BIGGER!</text>}
      </g>
      {/* the interesting thing */}
      {like > 0 && (
        <g transform={`translate(540 ${330 + Math.sin(f * 0.15) * 10}) scale(${clamp01(like)})`}>
          <path d="M0 40 C -90 -20 -50 -90 0 -40 C 50 -90 90 -20 0 40 Z" fill="#ff4b7a" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
          <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" stroke={INKC} strokeWidth={7} paintOrder="stroke">INTERESTED</text>
        </g>
      )}
      <g opacity={1 - ramp(f, F.bigger - 12, F.bigger - 2)}>
        <Chip x={540} y={420} w={400} label="ECKHARD HESS" hue={CYAN} p={pop(f, F.hess, 10)} fs={38} dark />
        <BigNum f={f} at={F.y1960} text="1960s" x={540} y={330} hue={YEL} fs={140} />
      </g>
    </g>
  );
};
const S7_Three: React.FC<{ f: number }> = ({ f }) => {
  const away = eio(ramp(f, F.away - 6, F.away + 6));
  return (
    <g>
      <Office f={f} />
      <Duo f={f} />
      <NumCard f={f} x={540} y={560} n={3} at={F.three2} hue={RED} label="EYE CONTACT|MYTH" labelAt={F.myth - 6} s={0.9} />
      {f >= F.liars - 2 && (
        <g opacity={pop(f, F.liars - 2, 10)} transform="translate(540 880)">
          <rect x={-330} y={-56} width={660} height={112} rx={56} fill="#fff" stroke={INKC} strokeWidth={8} />
          {/* little shifty eyes */}
          {[-1, 1].map((s) => <g key={s}><ellipse cx={-250 + s * 34} cy={0} rx={26} ry={20} fill="#fff" stroke={INKC} strokeWidth={5} /><circle cx={-250 + s * 34 + lerp(0, 14, away)} cy={lerp(0, 4, away)} r={9} fill={INKC} /></g>)}
          <text x={40} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>"LIARS LOOK AWAY"</text>
        </g>
      )}
      <Stamp f={f} at={F.away + 12} x={560} y={880} text="MYTH" hue={RED} fs={90} rot={-9} />
      <AskBubble f={f} x={330} y={800} tx={300} ty={1010} />
    </g>
  );
};
const S8_Coin: React.FC<{ f: number }> = ({ f }) => {
  const pct = countUp(f, F.fifty - 6, F.fifty + 22, 54);
  const coinT = f - F.coin;
  const spin = coinT > 0 ? Math.cos(coinT * 0.55) : 1;
  const coinY = coinT > 0 ? 1180 - Math.sin(clamp01(coinT / 36) * Math.PI) * 260 : 1180;
  return (
    <g>
      <rect width={VW} height={VH} fill="#16213d" />
      {[...Array(10)].map((_, i) => <line key={i} x1={0} y1={200 + i * 160} x2={VW} y2={200 + i * 160} stroke="#1f2c50" strokeWidth={3} />)}
      <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff" letterSpacing={2} opacity={pop(f, F.but + 4, 10)}>PEOPLE CATCH LIES...</text>
      <g transform="translate(540 640)">
        <text textAnchor="middle" y={60} fontFamily={FONT} fontWeight={800} fontSize={240} fill={YEL} stroke={INKC} strokeWidth={10} paintOrder="stroke" transform={`scale(${f >= F.fifty ? 1 + 0.08 * Math.exp(-(f - F.fifty) / 6) : 1})`}>{pct}%</text>
      </g>
      {/* meter */}
      <g transform="translate(110 860)">
        <rect width={860} height={80} rx={40} fill="#0c1226" stroke="#fff" strokeWidth={6} />
        <rect x={6} y={6} width={848 * pct / 100} height={68} rx={34} fill={YEL} />
        <line x1={430} y1={-30} x2={430} y2={110} stroke={CYAN} strokeWidth={7} strokeDasharray="14 8" />
        <text x={430} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={CYAN}>50% = COIN FLIP</text>
        <text x={0} y={-24} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#9fb0d8">0%</text>
        <text x={860} y={-24} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#9fb0d8">100%</text>
      </g>
      {/* coin */}
      <g transform={`translate(540 ${coinY}) scale(${Math.max(0.08, Math.abs(spin))} 1)`} opacity={pop(f, F.coin - 30, 10)}>
        <circle r={120} fill={spin > 0 ? "#ffcc33" : "#e0a91a"} stroke={INKC} strokeWidth={10} />
        <circle r={90} fill="none" stroke="#b07f10" strokeWidth={6} />
        <text y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill="#8a5f05">{spin > 0 ? "H" : "T"}</text>
      </g>
      <text x={540} y={1440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.coin + 6, 10)}>BARELY BETTER THAN A COIN</text>
    </g>
  );
};
const S9_Backwards: React.FC<{ f: number }> = ({ f }) => {
  const xs = [204, 428, 652, 876];
  const rev = eio(ramp(f, F.backwards + 4, F.backwards + 30));
  const load = eio(ramp(f, F.brainpower - 6, F.brainpower + 20)) * 0.6 + eio(ramp(f, F.reverse - 4, F.cracks)) * 0.4;
  const crack = eout(ramp(f, F.cracks - 2, F.cracks + 14));
  const panelsIn = (i: number) => pop(f, F.askThem + i * 5, 10);
  const labels = ["HOME", "DRIVE", "CAFE", "NIGHT"];
  return (
    <g>
      <Office f={f} dim={0.55} />
      {/* story strip */}
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={panelsIn(0)}>{rev > 0.5 ? "NOW TELL IT BACKWARDS" : "THE STORY"}</text>
      {[0, 1, 2, 3].map((i) => {
        const slot = lerp(xs[i], xs[3 - i], rev);
        const hop = Math.sin(rev * Math.PI) * (i % 2 ? -90 : 90);
        const p = panelsIn(i);
        const tilt = crack * (i % 2 ? 5 : -5) + (f > F.cracks ? Math.sin((f - F.cracks) * 0.9) * 2 * Math.exp(-(f - F.cracks) / 10) : 0);
        return (
          <g key={i} opacity={clamp01(p)} transform={`translate(${slot} ${520 + hop}) rotate(${tilt}) scale(${clamp01(p)})`}>
            <rect x={-100} y={-120} width={200} height={240} rx={22} fill={CARD} stroke={INKC} strokeWidth={8} />
            <g transform="translate(0 -10)"><Picto k={i} /></g>
            <text y={95} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INKC}>{labels[i]}</text>
            <circle cx={-76} cy={-96} r={26} fill={YEL} stroke={INKC} strokeWidth={5} />
            <text x={-76} y={-85} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKC}>{i + 1}</text>
            {crack > 0 && <path d={`M${-30 + i * 8} -120 L${-6 + i * 4} -60 L${-36} -10 L${10} 40 L${-14} 120`} stroke={INKC} strokeWidth={7} fill="none" strokeDasharray="400" strokeDashoffset={400 * (1 - crack)} strokeLinejoin="round" />}
          </g>
        );
      })}
      {rev > 0 && (
        <g opacity={clamp01(rev * 3) * (1 - ramp(f, F.lying - 6, F.lying))} transform={`translate(540 760)`}>
          <circle r={70} fill={RED} stroke={INKC} strokeWidth={8} />
          <path d="M-8 -30 L-48 0 L-8 30 Z M38 -30 L-2 0 L38 30 Z" fill="#fff" />
        </g>
      )}
      {/* brain load gauge */}
      {f >= F.lying - 6 && (
        <g transform="translate(540 870)" opacity={pop(f, F.lying - 6, 10)}>
          <path d="M-200 0 A200 200 0 0 1 200 0" fill="none" stroke="#2a3150" strokeWidth={44} />
          <path d="M-200 0 A200 200 0 0 1 -100 -173" fill="none" stroke={GREEN} strokeWidth={36} />
          <path d="M-100 -173 A200 200 0 0 1 100 -173" fill="none" stroke={YEL} strokeWidth={36} />
          <path d="M100 -173 A200 200 0 0 1 200 0" fill="none" stroke={RED} strokeWidth={36} />
          <g transform={`rotate(${-90 + load * 168 + (load > 0.9 ? Math.sin(f * 1.3) * 3 : 0)})`}><line x1={0} y1={0} x2={0} y2={-170} stroke="#fff" strokeWidth={12} strokeLinecap="round" /></g>
          <circle r={22} fill="#fff" stroke={INKC} strokeWidth={6} />
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" letterSpacing={3}>BRAIN LOAD</text>
        </g>
      )}
      <Stamp f={f} at={F.cracks + 4} x={540} y={640} text="CRACKS SHOW" hue={RED} fs={80} rot={-7} />
      <Duo f={f} s={0.85} ax={290} hx={800} y={1500} />
      <AskBubble f={f} x={360} y={1010} tx={290} ty={1110} />
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} dim={0.35} />
    <Outro f={f} at={F.sub} />
    <Duo f={f} wave={1} s={0.85} ax={150} hx={930} y={1560} />
  </g>
);

export const ReadPeople2Film: React.FC = () => {
  const f = useCurrentFrame();
  const eyesQ = F.look; const okay = F.okayQ; const andQ = F.and3; const so = F.so;
  const SHOTS: Shot[] = [
    { from: 0, to: F.three, render: () => <S1_Office f={f} />, cam: [[0, { x: 380, y: 1080, z: 1.22 }], [F.part, { x: 520, y: 1000, z: 1.12 }], [F.three, { x: 600, y: 960, z: 1.06 }]] },
    { from: F.three, to: eyesQ, tr: "zoom", render: () => <S2_Cards f={f} />, cam: [[F.three, { x: 540, y: 820, z: 1.15 }], [F.one + 10, { x: 420, y: 860, z: 1.08 }], [F.how, { x: 400, y: 1060, z: 1.1 }], [eyesQ, { x: 440, y: 1000, z: 1.14 }]] },
    { from: eyesQ, to: F.french, tr: "whip", render: () => <S3_Smiles f={f} />, cam: [[eyesQ, { x: 540, y: 520, z: 1.5 }], [F.crinkles + 6, { x: 540, y: 540, z: 1.32 }], [F.fake, { x: 540, y: 860, z: 1.04 }], [F.french, { x: 540, y: 1000, z: 1.12 }]] },
    { from: F.french, to: okay, tr: "flash", render: () => <S4_Duchenne f={f} />, cam: [[F.french, { x: 400, y: 600, z: 1.3 }], [F.duchenne, { x: 540, y: 760, z: 1.12 }], [okay, { x: 540, y: 980, z: 1.12 }]] },
    { from: okay, to: F.y1960 - 20, tr: "iris", render: () => <S5_Two f={f} />, cam: [[okay, { x: 360, y: 1000, z: 1.2 }], [F.two, { x: 560, y: 900, z: 1.08 }], [F.y1960 - 20, { x: 640, y: 820, z: 1.16 }]] },
    { from: F.y1960 - 20, to: andQ, tr: "zoom", render: () => <S6_Eye f={f} />, cam: [[F.y1960 - 20, { x: 540, y: 520, z: 1.3 }], [F.hess + 20, { x: 540, y: 700, z: 1.12 }], [F.bigger, { x: 540, y: 860, z: 1.1 }], [F.interesting, { x: 540, y: 760, z: 1.08 }], [andQ, { x: 540, y: 820, z: 1.2 }]] },
    { from: andQ, to: F.but, tr: "push", render: () => <S7_Three f={f} />, cam: [[andQ, { x: 380, y: 1040, z: 1.2 }], [F.three2, { x: 540, y: 880, z: 1.06 }], [F.liars, { x: 540, y: 960, z: 1.12 }], [F.but, { x: 540, y: 1000, z: 1.18, r: -1.5 }]] },
    { from: F.but, to: so, tr: "wipe", render: () => <S8_Coin f={f} />, cam: [[F.but, { x: 540, y: 600, z: 1.2 }], [F.fifty + 10, { x: 540, y: 760, z: 1.1 }], [F.coin, { x: 540, y: 1000, z: 1.12 }], [so, { x: 540, y: 1060, z: 1.2 }]] },
    { from: so, to: F.sub, tr: "spin", render: () => <S9_Backwards f={f} />, cam: [[so, { x: 480, y: 1150, z: 1.18 }], [F.askThem + 10, { x: 540, y: 900, z: 1.05 }], [F.backwards + 30, { x: 540, y: 720, z: 1.12 }], [F.lying, { x: 540, y: 820, z: 1.1 }], [F.cracks, { x: 540, y: 760, z: 1.18, r: 1.5 }], [F.sub, { x: 540, y: 900, z: 1.05 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "whipUp", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.part, 0.08], [F.three + 2, 0.08], [F.crinkles, 0.08], [F.y1860, 0.12], [F.two, 0.08], [F.bigger, 0.12], [F.three2, 0.08], [F.fifty, 0.14], [F.backwards + 4, 0.08], [F.cracks + 4, 0.14]];
  const SHAKE: [number, number][] = [[F.away + 12, 10], [F.cracks + 4, 14]];
  const SFX: Cue[] = [
    ...ASKS.map(([a]) => [a - 3, "pop", 0.4] as Cue),
    [F.part, "impact", 0.35], [W("three") + 2, "pop", 0.35], [W("three") + 8, "pop", 0.35], [W("three") + 14, "pop", 0.35], [F.one, "whoosh", 0.3],
    [F.eyes - 10, "whoosh", 0.25], [F.real, "pop", 0.4], [F.crinkles, "tick", 0.35], [F.fake - 2, "whoosh", 0.3], [F.mouth, "tick", 0.3],
    [F.french, "pop", 0.35], [F.y1860, "boom", 0.35],
    [F.two, "pop", 0.4], [F.pupils - 4, "tick", 0.3], [F.hess, "pop", 0.3], [F.y1960, "impact", 0.35], [F.bigger - 4, "riser", 0.25], [F.interesting, "pop", 0.4],
    [F.three2, "pop", 0.4], [F.liars - 2, "pop", 0.3], [F.away + 12, "impact", 0.5],
    [F.fifty - 6, "tick", 0.35], [F.fifty + 4, "boom", 0.35], [F.coin, "tick", 0.35],
    [F.askThem, "pop", 0.3], [F.backwards + 4, "whoosh", 0.4], [F.lying - 6, "riser_dark", 0.28], [F.cracks + 4, "impact", 0.55],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.okayQ ? GREEN : f < F.and3 ? CYAN : f < F.sub ? RED : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="READ ANYONE" sub="3 TRICKS · PART 2" until={F.three - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="readpeople2" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
