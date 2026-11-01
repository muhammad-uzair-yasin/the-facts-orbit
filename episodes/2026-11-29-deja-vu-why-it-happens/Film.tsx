import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
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
  ask: ASKS[0][0], that: W("that"), lived: W("lived"), before: W("before"), two: W("two"), three: W("three"), felt1: W("felt"),
  glitchQ: ASKS[1][0], glitch: W("glitch"), matrix: W("matrix"), notq: W("not"),
  y2012: W("2012"), colorado: W("colorado"), virtual: W("virtual"), purpose: W("purpose"),
  showed: W("showed"), newp: W("new"), layout: W("layout"), seen: W("seen"), forgotten: W("forgotten"),
  andQ: ASKS[2][0], felt2: W("felt", 2), brain: W("brain"), pattern: W("pattern"), cant: W("cant"), memory: W("memory"),
  strangeQ: ASKS[3][0], theory: W("theory"), checking: W("checking"), mistakes: W("mistakes"), familiar2: W("familiar", 2), another: W("another"), new2: W("new", 2), clash: W("clash"),
  worryQ: ASKS[4][0], notall: W("not", 2), common: W("common"), young: W("young"), older: W("older"), sign: W("sign"), working: W("working"),
  sub: W("subscribe"),
};
const BUB: { t: string; hot?: boolean }[] = [
  { t: "DÉJÀ VU?!", hot: true }, { t: "A GLITCH?!", hot: true }, { t: "AND?" }, { t: "WHY SO STRANGE?" }, { t: "SHOULD I WORRY?" },
];

const BG0 = "#0d0820", BG1 = "#241046", MAG = "#ff3dbb", CYAN = "#3df0ff", GREEN = "#3ddc97", RED = "#ff4b4b", PINK = "#ff9ec7", CODE = "#38ff7a";
const ASKER = CAST[39], HOST = CAST[5], GUEST = CAST[22];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const askMood = (f: number): "happy" | "neutral" | "surprised" => {
  const i = ASKS.findIndex(([a, b]) => f >= a - 2 && f <= b + 6);
  if (i >= 0) return BUB[i]?.hot ? "surprised" : "neutral";
  if ((f > F.two && f < F.two + 40) || (f > F.clash && f < F.clash + 40)) return "surprised";
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
  const gl = hot && (f - a) % 14 < 3 ? 8 : 0;
  return (
    <g opacity={clamp01(out)} transform={`translate(${bx} ${y}) rotate(${-2 + wob}) scale(${Math.max(0, p)})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={h / 2} fill="#000" opacity={0.35} />
      <path d={tail} fill={fill} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={INKC} strokeWidth={9} />
      <path d={`M${-26} ${h / 2 - 14} L${(tx - bx) * 0.25} ${(ty - y) * 0.25} L${26} ${h / 2 - 14} Z`} fill={fill} />
      {gl > 0 && <text x={-gl} y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={CYAN} opacity={0.8}>{t}</text>}
      {gl > 0 && <text x={gl} y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={MAG} opacity={0.8}>{t}</text>}
      <text y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC} letterSpacing={1}>{t}</text>
    </g>
  );
};
/** Horizontal-slice glitch: renders children in shifted bands with cyan/magenta ghosts when g > 0. */
const Glitch: React.FC<{ f: number; g: number; seed: string; children: React.ReactNode }> = ({ f, g, seed, children }) => {
  if (g <= 0.02) return <>{children}</>;
  const bands = 7;
  const step = Math.floor(f / 2);
  return (
    <g>
      <defs>{[...Array(bands)].map((_, i) => <clipPath key={i} id={`${seed}b${i}`}><rect x={-200} y={(i * VH) / bands} width={VW + 400} height={VH / bands + 1} /></clipPath>)}</defs>
      {[...Array(bands)].map((_, i) => {
        const dx = (rnd(`${seed}${step}x${i}`) - 0.5) * 120 * g * (rnd(`${seed}${step}k${i}`) > 0.45 ? 1 : 0.1);
        return <g key={i} clipPath={`url(#${seed}b${i})`}><g transform={`translate(${dx} 0)`}>{children}</g></g>;
      })}
      <rect width={VW} height={VH} fill={CYAN} opacity={0.08 * g} transform={`translate(${-14 * g} 0)`} style={{ mixBlendMode: "screen" }} />
      <rect width={VW} height={VH} fill={MAG} opacity={0.08 * g} transform={`translate(${14 * g} 0)`} style={{ mixBlendMode: "screen" }} />
      {[...Array(5)].map((_, i) => <rect key={i} x={0} y={rnd(`${seed}${step}l${i}`) * VH} width={VW} height={4 + rnd(`${seed}${step}h${i}`) * 14} fill={i % 2 ? CYAN : MAG} opacity={0.35 * g} />)}
    </g>
  );
};
const NeonRoom: React.FC<{ f: number; dim?: number; sign?: boolean; deck?: boolean }> = ({ f, dim = 0, sign = true, deck = true }) => (
  <g>
    <defs>
      <linearGradient id="nrg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BG0} /><stop offset="1" stopColor={BG1} /></linearGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#nrg)" />
    {/* neon wall panels */}
    {[...Array(6)].map((_, i) => <rect key={i} x={40 + i * 175} y={260} width={130} height={700} rx={16} fill="none" stroke={i % 2 ? MAG : CYAN} strokeWidth={4} opacity={0.18 + 0.12 * Math.sin(f * 0.08 + i)} />)}
    {/* neon sign */}
    {sign && <g transform="translate(540 470)">
      <rect x={-300} y={-90} width={600} height={180} rx={30} fill="#00000066" stroke={MAG} strokeWidth={6} />
      <text y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={104} fill="none" stroke={MAG} strokeWidth={12} opacity={0.35}>ENCORE</text>
      <text y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={104} fill="#ffd6f3" opacity={0.85 + 0.15 * Math.sin(f * 0.6)}>ENCORE</text>
    </g>}
    {/* DJ deck at the back */}
    {deck && <g transform="translate(540 1130)">
      <rect x={-260} y={-50} width={520} height={110} rx={14} fill="#1a1530" stroke={CYAN} strokeWidth={5} />
      {[-150, 150].map((x) => <g key={x} transform={`translate(${x} 0)`}><circle r={38} fill="#0b0b12" stroke="#777" strokeWidth={4} /><line x1={0} y1={0} x2={Math.cos(f * 0.2) * 32} y2={Math.sin(f * 0.2) * 32} stroke={MAG} strokeWidth={4} /></g>)}
      {[...Array(5)].map((_, i) => <rect key={i} x={-40 + i * 18} y={-30 + (1 - Math.abs(Math.sin(f * 0.3 + i))) * 40} width={12} height={10 + Math.abs(Math.sin(f * 0.3 + i)) * 40} fill={GREEN} />)}
    </g>}
    {/* grid floor */}
    <rect y={1300} width={VW} height={VH - 1300} fill="#140a2c" />
    {[...Array(9)].map((_, i) => <line key={"h" + i} x1={0} y1={1300 + Math.pow(i / 8, 1.8) * 620} x2={VW} y2={1300 + Math.pow(i / 8, 1.8) * 620} stroke={MAG} strokeWidth={3} opacity={0.35} />)}
    {[...Array(15)].map((_, i) => <line key={"v" + i} x1={540 + (i - 7) * 40} y1={1300} x2={540 + (i - 7) * 220} y2={VH} stroke={CYAN} strokeWidth={3} opacity={0.3} />)}
    {dim > 0 && <rect width={VW} height={VH} fill="#05030c" opacity={dim} />}
  </g>
);
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; wave?: number }> = ({ f, ax = 290, hx = 800, y = 1500, s = 1.05, wave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={ASKER} f={f} seed={39} talk={askTalk(f)} wave={wave} mood={askMood(f)} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={HOST} f={f} seed={5} talk={hostTalk(f)} wave={wave} mood={hostMood(f)} /></g>
  </g>
);
/** Simple brain: pink lobes + folds. */
const Brain: React.FC<{ f: number; x: number; y: number; s: number; left?: string; right?: string; split?: number }> = ({ f, x, y, s, left = PINK, right = PINK, split = 0 }) => {
  const shape = "M-230 30 C-260 -90 -170 -190 -60 -190 C-20 -230 60 -230 90 -190 C200 -190 270 -90 240 20 C270 90 220 170 140 170 C100 210 20 210 -10 180 C-60 210 -150 200 -170 150 C-240 140 -260 80 -230 30 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id="brL"><rect x={-300} y={-260} width={300} height={520} /></clipPath>
        <clipPath id="brR"><rect x={0} y={-260} width={300} height={520} /></clipPath>
      </defs>
      <g transform={`translate(${-split * 30} 0)`} clipPath="url(#brL)"><path d={shape} fill={left} stroke={INKC} strokeWidth={10} /></g>
      <g transform={`translate(${split * 30} 0)`} clipPath="url(#brR)"><path d={shape} fill={right} stroke={INKC} strokeWidth={10} /></g>
      {[
        "M-180 -60 q 40 -40 80 0 t 70 -10", "M-200 40 q 50 -30 90 10 t 80 0", "M-120 120 q 30 -40 70 -10", "M30 -120 q 40 40 90 0 t 60 20",
        "M40 0 q 40 -30 80 10 t 80 -10", "M60 110 q 30 -40 80 -10", "M-60 -150 q 20 30 0 60",
      ].map((d, i) => <path key={i} d={d} stroke={mix(PINK, "#000000", 0.35)} strokeWidth={8} fill="none" strokeLinecap="round" transform={`translate(${(i < 3 || i === 6 ? -1 : 1) * split * 30} 0)`} />)}
      <line x1={0} y1={-200} x2={0} y2={190} stroke={INKC} strokeWidth={6} opacity={0.5 + split * 0.5} />
    </g>
  );
};
/** Top-down room plan. kind 0 = the forgotten room, 1 = new room with the same layout. */
const RoomPlan: React.FC<{ x: number; y: number; kind: 0 | 1; fog?: number; label: string; hue: string; p?: number }> = ({ x, y, kind, fog = 0, label, hue, p = 1 }) => {
  const A = kind === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${clamp01(p)})`} opacity={clamp01(p)}>
      <rect x={-400} y={-230} width={800} height={460} rx={24} fill={A ? "#f3e7cf" : "#d9f2ff"} stroke={INKC} strokeWidth={9} />
      <rect x={-400} y={-230} width={800} height={460} rx={24} fill="none" stroke={hue} strokeWidth={5} transform="scale(0.97)" />
      {/* door gap */}
      <rect x={-60} y={222} width={120} height={16} fill={A ? "#f3e7cf" : "#d9f2ff"} />
      {/* item 1: top-left (sofa / bed) */}
      <rect x={-330} y={-170} width={220} height={110} rx={20} fill={A ? "#c0392b" : "#7b5cff"} stroke={INKC} strokeWidth={6} />
      {/* item 2: top-right (plant / tree) */}
      <circle cx={260} cy={-120} r={62} fill={A ? "#3ddc97" : "#2f8f3a"} stroke={INKC} strokeWidth={6} />
      {/* item 3: centre (rug / pool) */}
      {A ? <rect x={-120} y={-40} width={240} height={150} rx={16} fill="#ffcc33" stroke={INKC} strokeWidth={6} /> : <ellipse cx={0} cy={35} rx={130} ry={80} fill="#4aa3df" stroke={INKC} strokeWidth={6} />}
      {/* item 4: bottom-right (lamp / statue) */}
      {A ? <circle cx={270} cy={140} r={36} fill="#fff59a" stroke={INKC} strokeWidth={6} /> : <rect x={234} y={104} width={72} height={72} rx={8} fill="#b8b8c8" stroke={INKC} strokeWidth={6} />}
      {/* item 5: bottom-left (table / bench) */}
      <rect x={-320} y={90} width={150} height={70} rx={10} fill={A ? "#8a5a2b" : "#e4473b"} stroke={INKC} strokeWidth={6} />
      {fog > 0 && <rect x={-400} y={-230} width={800} height={460} rx={24} fill="#cfd3e0" opacity={fog * 0.75} />}
      <g transform="translate(-400 -230)">
        <rect x={0} y={-58} width={label.length * 26 + 50} height={60} rx={14} fill={hue} stroke={INKC} strokeWidth={6} />
        <text x={25} y={-16} fontFamily={FONT} fontWeight={800} fontSize={36} fill={INKC}>{label}</text>
      </g>
    </g>
  );
};
const LayoutDots: React.FC<{ x: number; y: number; o: number; c?: string }> = ({ x, y, o, c = MAG }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-330} y={-170} width={220} height={110} rx={20} fill="none" stroke={c} strokeWidth={7} strokeDasharray="16 10" />
    <circle cx={260} cy={-120} r={62} fill="none" stroke={c} strokeWidth={7} strokeDasharray="16 10" />
    <rect x={-130} y={-45} width={260} height={160} rx={16} fill="none" stroke={c} strokeWidth={7} strokeDasharray="16 10" />
    <circle cx={270} cy={140} r={40} fill="none" stroke={c} strokeWidth={7} strokeDasharray="16 10" />
    <rect x={-320} y={90} width={150} height={70} rx={10} fill="none" stroke={c} strokeWidth={7} strokeDasharray="16 10" />
    <path d="M-220 -115 L260 -120 L0 35 L270 140 M0 35 L-245 125" stroke={c} strokeWidth={4} fill="none" opacity={0.7} />
  </g>
);
const VRHead: React.FC<{ f: number; glow: number }> = ({ f, glow }) => (
  <g>
    <rect x={-74} y={-30} width={148} height={64} rx={20} fill="#2a2d3a" stroke={INKC} strokeWidth={6} />
    <rect x={-62} y={-20} width={124} height={44} rx={14} fill={mix("#1b2a4a", CYAN, glow)} opacity={0.9} />
    <line x1={-74} y1={0} x2={-90} y2={-10} stroke="#2a2d3a" strokeWidth={10} />
    <line x1={74} y1={0} x2={90} y2={-10} stroke="#2a2d3a" strokeWidth={10} />
    {glow > 0 && <rect x={-62} y={-20} width={124} height={44} rx={14} fill="none" stroke={CYAN} strokeWidth={4} opacity={0.5 + 0.5 * Math.sin(f * 0.4)} />}
  </g>
);

// ---------- shots ----------
const S1_Club: React.FC<{ f: number }> = ({ f }) => {
  const g = f >= F.ask && f < F.that ? ((f - F.ask) % 24 < 4 ? 1 : 0) : 0;
  return (
    <Glitch f={f} g={g} seed="s1">
      <NeonRoom f={f} sign={false} />
      <Duo f={f} />
      <AskBubble f={f} x={360} y={800} tx={290} ty={1010} fs={90} />
    </Glitch>
  );
};
const S2_Replay: React.FC<{ f: number }> = ({ f }) => {
  const ghost = eout(ramp(f, F.lived - 4, F.before + 6));
  const people = ramp(f, F.two - 8, F.two);
  const t1 = pop(f, F.two, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1a0f33" />
      {/* the moment: a cafe table */}
      <g transform="translate(540 820)">
        <rect x={-430} y={-460} width={860} height={620} rx={36} fill="#2c1d52" stroke={CYAN} strokeWidth={6} />
        <text x={-390} y={-400} fontFamily={FONT} fontWeight={800} fontSize={40} fill={CYAN} letterSpacing={3}>THIS MOMENT</text>
        <circle cx={300} cy={-370} r={14} fill={RED} opacity={(f % 30) < 15 ? 1 : 0.3} />
        <text x={330} y={-358} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">REC</text>
        <rect x={-120} y={20} width={240} height={20} rx={8} fill="#8a5a2b" stroke={INKC} strokeWidth={5} />
        <rect x={-10} y={40} width={20} height={110} fill="#5a3a22" />
        {ghost > 0 && (
          <g opacity={0.5 * ghost} transform={`translate(${-60 * ghost} ${-10 * ghost})`}>
            <g transform="translate(-180 150) scale(0.95)"><Person d={GUEST} f={f - 60} seed={22} talk={0} wave={0} mood="neutral" /></g>
          </g>
        )}
        {ghost > 0 && (
          <g opacity={0.4 * ghost} transform={`translate(${60 * ghost} ${10 * ghost})`}>
            <g transform="translate(-180 150) scale(0.95)"><Person d={GUEST} f={f + 60} seed={22} talk={0} wave={0} mood="neutral" /></g>
          </g>
        )}
        <g transform="translate(-180 150) scale(0.95)"><Person d={GUEST} f={f} seed={22} talk={0} wave={0} mood={ghost > 0.5 ? "surprised" : "happy"} /></g>
        <g transform="translate(60 18)"><path d="M-22 -40 H22 L18 0 H-18 Z" fill="#fff" stroke={INKC} strokeWidth={4} /><path d="M22 -30 q 16 4 0 20" stroke={INKC} strokeWidth={4} fill="none" /></g>
      </g>
      {ghost > 0 && (
        <g opacity={ghost} transform={`translate(780 360) rotate(${f * -4})`}>
          <circle r={60} fill={MAG} stroke={INKC} strokeWidth={7} />
          <path d="M-28 -6 A30 30 0 1 1 -18 24" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M-44 -12 L-28 -6 L-16 -22" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {ghost > 0.3 && <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={ramp(f, F.before, F.before + 8) * (1 - people)}>"I'VE LIVED THIS BEFORE..."</text>}
      {/* 2 out of 3 people */}
      {people > 0 && (
        <g>
          {[0, 1, 2].map((i) => {
            const lit = i < 2 && f >= F.three - 2 + i * 4;
            const p = pop(f, F.two - 8 + i * 4, 10);
            return (
              <g key={i} transform={`translate(${260 + i * 280} 1320) scale(${clamp01(p)})`}>
                <circle cy={-150} r={52} fill={lit ? MAG : "#4a3d6b"} stroke={INKC} strokeWidth={7} />
                <path d="M-80 0 Q-80 -90 0 -90 Q80 -90 80 0 Z" fill={lit ? MAG : "#4a3d6b"} stroke={INKC} strokeWidth={7} />
                {lit && <text y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff">!</text>}
              </g>
            );
          })}
          <g opacity={clamp01(t1)}>
            <text x={540} y={1075} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" transform={`translate(540 1055) scale(${t1}) translate(-540 -1055)`}>2 OUT OF 3 PEOPLE</text>
          </g>
        </g>
      )}
    </g>
  );
};
const S3_Matrix: React.FC<{ f: number }> = ({ f }) => {
  const g = f >= F.glitch - 2 && f < F.notq ? 0.6 + 0.4 * Math.abs(Math.sin(f * 0.7)) : 0;
  return (
    <Glitch f={f} g={g} seed="s3">
      <NeonRoom f={f} dim={0.35} />
      {/* code rain */}
      {[...Array(18)].map((_, c) => (
        <g key={c} opacity={0.65}>
          {[...Array(14)].map((_, r) => {
            const y = ((r * 70 + f * (6 + (c % 4) * 2) + rnd("cr" + c) * 900) % 1300);
            return <text key={r} x={30 + c * 58} y={y} fontFamily="monospace" fontSize={40} fill={CODE} opacity={r === 13 ? 1 : 0.2 + r * 0.05}>{String.fromCharCode(48 + Math.floor(rnd(`ch${c}${r}${Math.floor(f / 6)}`) * 42))}</text>;
          })}
        </g>
      ))}
      <Duo f={f} />
      <AskBubble f={f} x={360} y={800} tx={290} ty={1010} fs={90} />
      <Chip x={790} y={860} w={360} label="NOT QUITE" hue={GREEN} p={pop(f, F.notq, 10)} fs={46} textColor={INKC} />
    </Glitch>
  );
};
const S4_VR: React.FC<{ f: number }> = ({ f }) => {
  const glow = eout(ramp(f, F.virtual - 4, F.virtual + 10));
  return (
    <g>
      <rect width={VW} height={VH} fill="#eaf4ff" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 170} x2={VW} y2={i * 170} stroke="#d2e4f7" strokeWidth={4} />)}
      {[...Array(8)].map((_, i) => <line key={"v" + i} x1={i * 160} y1={0} x2={i * 160} y2={VH} stroke="#d2e4f7" strokeWidth={4} />)}
      <BigNum f={f} at={F.y2012} text="2012" x={540} y={400} hue={YEL} fs={200} />
      <Chip x={540} y={500} w={560} label="COLORADO STATE UNIV." hue={CYAN} p={pop(f, F.colorado, 10)} fs={36} textColor={INKC} />
      {/* lab floor */}
      <rect y={1330} width={VW} height={VH - 1330} fill="#c9d8ea" />
      {/* volunteer with VR headset */}
      <g transform="translate(380 1350) scale(1.25)">
        <Person d={GUEST} f={f} seed={22} talk={0} wave={0} mood="happy" />
        <g transform="translate(0 -378)"><VRHead f={f} glow={glow} /></g>
      </g>
      {/* virtual world beams */}
      {glow > 0 && (
        <g opacity={glow}>
          <path d="M470 870 L980 650 L980 1120 Z" fill={CYAN} opacity={0.15} />
          <g transform="translate(800 880)">
            <rect x={-170} y={-170} width={340} height={340} rx={24} fill="#11163a" stroke={CYAN} strokeWidth={6} />
            {[...Array(5)].map((_, i) => <line key={i} x1={-170 + i * 85} y1={170} x2={0} y2={-20} stroke={CYAN} strokeWidth={3} opacity={0.6} />)}
            {[...Array(4)].map((_, i) => <line key={"h" + i} x1={-170 + i * 30} y1={40 + i * 40} x2={170 - i * 30} y2={40 + i * 40} stroke={CYAN} strokeWidth={3} opacity={0.6} />)}
            <text y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={CYAN}>VIRTUAL</text>
            <text y={-64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={CYAN}>REALITY</text>
          </g>
        </g>
      )}
      <Stamp f={f} at={F.purpose} x={540} y={650} text="ON PURPOSE" hue={MAG} fs={72} rot={-6} />
    </g>
  );
};
const S5_Layout: React.FC<{ f: number }> = ({ f }) => {
  const aIn = pop(f, F.seen - 30, 12);
  const bIn = pop(f, F.newp - 4, 12);
  const slide = eio(ramp(f, F.layout - 4, F.layout + 22));
  const fog = eout(ramp(f, F.forgotten - 4, F.forgotten + 16));
  const match = ramp(f, F.layout + 22, F.layout + 30);
  return (
    <g>
      <rect width={VW} height={VH} fill="#151036" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("p" + i) * VW} cy={rnd("q" + i) * VH} r={2 + rnd("s" + i) * 3} fill={CYAN} opacity={0.3} />)}
      <RoomPlan x={540} y={1180} kind={1} label="NEW PLACE" hue={CYAN} p={bIn} />
      <RoomPlan x={540} y={500} kind={0} label={fog > 0.4 ? "SEEN BEFORE... FORGOTTEN" : "SEEN BEFORE"} hue={YEL} fog={fog} p={aIn} />
      {f >= F.layout - 4 && <LayoutDots x={540} y={lerp(500, 1180, slide)} o={clamp01(ramp(f, F.layout - 4, F.layout)) } />}
      {match > 0 && (
        <g opacity={match}>
          <rect x={-10} y={1440} width={0} height={0} />
          <Chip x={540} y={840} w={560} label="SAME LAYOUT ✓" hue={MAG} p={match} fs={50} />
        </g>
      )}
      {fog > 0.3 && <text x={540} y={515} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill="#6b6f86" opacity={fog * 0.9} transform={`rotate(-6 540 515)`}>???</text>}
    </g>
  );
};
const S6_And: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NeonRoom f={f} />
    <Duo f={f} />
    <Chip x={790} y={850} w={420} label="DÉJÀ VU ✓" hue={MAG} p={pop(f, F.felt2, 10)} fs={52} />
    <AskBubble f={f} x={330} y={800} tx={290} ty={1010} fs={96} />
  </g>
);
const S7_Search: React.FC<{ f: number }> = ({ f }) => {
  const match = pop(f, F.pattern - 2, 12);
  const scan = ramp(f, F.cant - 30, F.memory + 10);
  const err = pop(f, F.memory + 4, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#0e0a24" />
      {[...Array(20)].map((_, i) => <line key={i} x1={0} y1={i * 100} x2={VW} y2={i * 100} stroke="#1c1640" strokeWidth={3} />)}
      <Brain f={f} x={540} y={520} s={1.1} />
      {/* pattern grid lighting up */}
      <g transform="translate(540 520)" opacity={clamp01(match)}>
        {[...Array(9)].map((_, i) => <rect key={i} x={-90 + (i % 3) * 64} y={-90 + Math.floor(i / 3) * 64} width={52} height={52} rx={8} fill={[0, 2, 4, 6, 8].includes(i) ? GREEN : "#ffffff55"} stroke={INKC} strokeWidth={5} />)}
      </g>
      <Chip x={540} y={830} w={520} label="PATTERN MATCH ✓" hue={GREEN} p={match} fs={42} textColor={INKC} />
      {/* memory drawers being searched */}
      <g transform="translate(540 1150)">
        {[...Array(5)].map((_, i) => {
          const active = Math.floor(scan * 5 * 2.2) % 5 === i && scan < 1;
          return (
            <g key={i} transform={`translate(${(i - 2) * 180} ${active ? -16 : 0})`}>
              <rect x={-74} y={-80} width={148} height={160} rx={12} fill={active ? "#3a2c7a" : "#241c52"} stroke={active ? CYAN : "#5a4d9a"} strokeWidth={6} />
              <rect x={-30} y={-10} width={60} height={14} rx={6} fill="#9a8ad8" />
              <text y={60} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={24} fill="#9a8ad8">MEM_{i + 1}</text>
            </g>
          );
        })}
        <text y={-120} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={38} fill={CYAN} opacity={scan > 0 && err <= 0 ? 1 : 0}>SEARCHING MEMORY{".".repeat(1 + (Math.floor(f / 6) % 3))}</text>
      </g>
      {err > 0 && (
        <g transform={`translate(540 1150) scale(${err})`}>
          <rect x={-380} y={-130} width={760} height={260} rx={20} fill="#2a0b14" stroke={RED} strokeWidth={8} />
          <rect x={-380} y={-130} width={760} height={56} rx={20} fill={RED} />
          <text x={-350} y={-88} fontFamily="monospace" fontWeight={800} fontSize={32} fill="#fff">ERROR 404</text>
          <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff">MEMORY</text>
          <text y={88} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED}>NOT FOUND</text>
        </g>
      )}
    </g>
  );
};
const S8_Clash: React.FC<{ f: number }> = ({ f }) => {
  const bIn = pop(f, F.theory - 4, 12);
  const check = ramp(f, F.checking - 4, F.mistakes + 14);
  const fam = pop(f, F.familiar2 - 4, 10);
  const nw = pop(f, F.new2 - 6, 10);
  const split = eout(ramp(f, F.another - 4, F.another + 10));
  const clash = f >= F.clash ? Math.exp(-(f - F.clash) / 12) : 0;
  return (
    <g>
      <NeonRoom f={f} dim={0.55} sign={false} />
      <g opacity={clamp01(bIn)}>
        <Brain f={f} x={540} y={640} s={clamp01(bIn) * 1.05} left={mix(PINK, CYAN, ramp(f, F.familiar2 - 4, F.familiar2 + 6))} right={mix(PINK, MAG, ramp(f, F.new2 - 6, F.new2 + 4))} split={split + clash * Math.sin(f * 2) * 0.4} />
      </g>
      {check > 0 && check < 1 && (
        <g transform={`translate(${lerp(300, 780, check)} ${560 + Math.sin(check * 12) * 50})`} opacity={1 - ramp(f, F.mistakes + 8, F.mistakes + 14)}>
          <circle r={70} fill="#bfe6ff" fillOpacity={0.3} stroke="#fff" strokeWidth={12} /><line x1={50} y1={50} x2={110} y2={110} stroke="#fff" strokeWidth={20} strokeLinecap="round" />
        </g>
      )}
      <Chip x={540} y={360} w={460} label="ERROR CHECK" hue={CYAN} p={pop(f, F.checking, 10) * (1 - ramp(f, F.familiar2 - 10, F.familiar2 - 4))} fs={42} dark />
      {/* the two parts arguing */}
      <g opacity={clamp01(fam)} transform={`translate(250 360) rotate(-5) scale(${clamp01(fam)})`}>
        <rect x={-210} y={-60} width={420} height={120} rx={60} fill={CYAN} stroke={INKC} strokeWidth={8} />
        <path d="M-20 56 L20 120 L40 56 Z" fill={CYAN} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
        <rect x={-30} y={44} width={80} height={14} fill={CYAN} />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC}>FAMILIAR!</text>
      </g>
      <g opacity={clamp01(nw)} transform={`translate(820 360) rotate(5) scale(${clamp01(nw)})`}>
        <rect x={-210} y={-60} width={420} height={120} rx={60} fill={MAG} stroke={INKC} strokeWidth={8} />
        <path d="M-40 56 L-20 120 L20 56 Z" fill={MAG} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
        <rect x={-50} y={44} width={80} height={14} fill={MAG} />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff">NO, NEW!</text>
      </g>
      {f >= F.clash && (
        <g opacity={clamp01(ramp(f, F.clash, F.clash + 4))} transform={`translate(540 640) scale(${1 + clash * 0.4})`}>
          <path d="M-30 -260 L40 -60 L-20 -60 L50 220 L-60 -10 L0 -10 L-80 -260 Z" fill={YEL} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
        </g>
      )}
      <Stamp f={f} at={F.clash + 2} x={540} y={880} text="CLASH!" hue={YEL} fs={84} rot={-8} />
      <Duo f={f} s={0.85} y={1510} />
      <AskBubble f={f} x={380} y={1030} tx={290} ty={1130} />
    </g>
  );
};
const S9_Age: React.FC<{ f: number }> = ({ f }) => {
  const bars = [{ a: "10s", h: 0.7 }, { a: "15–25", h: 1 }, { a: "30s", h: 0.75 }, { a: "40s", h: 0.55 }, { a: "50s", h: 0.4 }, { a: "60+", h: 0.25 }];
  const grow = eout(ramp(f, F.common - 6, F.common + 20));
  const down = eio(ramp(f, F.older - 10, F.older + 14));
  const ok = pop(f, F.sign - 2, 14);
  return (
    <g>
      <NeonRoom f={f} dim={0.6} sign={false} />
      <Chip x={790} y={330} w={400} label="NOT AT ALL ✓" hue={GREEN} p={pop(f, F.notall, 10) * (1 - ramp(f, F.common - 10, F.common))} fs={44} textColor={INKC} />
      <g opacity={1 - ok * 0.85}>
        <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#fff" letterSpacing={2} opacity={grow}>DÉJÀ VU BY AGE</text>
        {bars.map((b, i) => {
          const hh = 420 * b.h * grow * (i >= 2 ? lerp(1, 0.85, down) : 1);
          const hot = i === 1 && f >= F.young - 4;
          return (
            <g key={i} transform={`translate(${170 + i * 148} 900)`}>
              <rect x={-55} y={-hh} width={110} height={hh} rx={12} fill={hot ? MAG : i >= 2 && down > 0 ? mix(CYAN, "#4a3d6b", down * (i - 1) / 4) : CYAN} stroke={INKC} strokeWidth={6} />
              <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={i === 1 ? 32 : 36} fill="#fff" opacity={grow}>{b.a}</text>
            </g>
          );
        })}
        {f >= F.young - 4 && <Chip x={318} y={410} w={420} label="YOUNG ADULTS" hue={MAG} p={pop(f, F.young - 4, 10)} fs={40} />}
        {down > 0 && <path d={`M470 ${560} L${lerp(470, 950, down)} ${lerp(560, 760, down)}`} stroke={YEL} strokeWidth={12} strokeLinecap="round" markerEnd="" opacity={down} />}
        {down > 0.9 && <path d="M950 760 l -40 -4 l 22 -32 Z" fill={YEL} />}
      </g>
      {ok > 0 && (
        <g transform={`translate(540 640) scale(${ok})`}>
          <circle r={190} fill={GREEN} stroke={INKC} strokeWidth={12} />
          <path d="M-90 0 L-25 70 L100 -70" stroke="#fff" strokeWidth={36} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text y={270} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff" stroke={INKC} strokeWidth={9} paintOrder="stroke">MEMORY: WORKING</text>
        </g>
      )}
      <Duo f={f} s={0.85} y={1510} />
      <AskBubble f={f} x={380} y={1030} tx={290} ty={1130} />
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NeonRoom f={f} dim={0.45} sign={false} deck={false} />
    <Outro f={f} at={F.sub} />
    <Duo f={f} wave={1} s={0.85} ax={150} hx={930} y={1560} />
  </g>
);

export const DejaVuFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.that, render: () => <S1_Club f={f} />, cam: [[0, { x: 360, y: 1060, z: 1.25 }], [F.that, { x: 480, y: 1000, z: 1.1 }]] },
    { from: F.that, to: F.glitchQ, tr: "whip", render: () => <S2_Replay f={f} />, cam: [[F.that, { x: 480, y: 860, z: 1.3 }], [F.before, { x: 540, y: 820, z: 1.15, r: -2 }], [F.two, { x: 540, y: 1100, z: 1.05 }], [F.glitchQ, { x: 540, y: 1150, z: 1.12 }]] },
    { from: F.glitchQ, to: F.y2012, tr: "zoom", render: () => <S3_Matrix f={f} />, cam: [[F.glitchQ, { x: 540, y: 960, z: 1.0 }], [F.matrix, { x: 380, y: 980, z: 1.22, r: 2 }], [F.notq, { x: 640, y: 1000, z: 1.12 }], [F.y2012, { x: 680, y: 1000, z: 1.18 }]] },
    { from: F.y2012, to: F.showed, tr: "flash", render: () => <S4_VR f={f} />, cam: [[F.y2012, { x: 540, y: 520, z: 1.3 }], [F.colorado + 10, { x: 540, y: 640, z: 1.12 }], [F.virtual + 6, { x: 640, y: 900, z: 1.1 }], [F.showed, { x: 560, y: 820, z: 1.05 }]] },
    { from: F.showed, to: F.andQ, tr: "wipe", render: () => <S5_Layout f={f} />, cam: [[F.showed, { x: 540, y: 1180, z: 1.2 }], [F.seen - 30, { x: 540, y: 820, z: 1.02 }], [F.layout + 24, { x: 540, y: 860, z: 1.06 }], [F.forgotten, { x: 540, y: 560, z: 1.25 }], [F.andQ, { x: 540, y: 600, z: 1.3 }]] },
    { from: F.andQ, to: F.brain - 4, tr: "iris", render: () => <S6_And f={f} />, cam: [[F.andQ, { x: 360, y: 1040, z: 1.25 }], [F.felt2, { x: 560, y: 980, z: 1.1 }], [F.brain - 4, { x: 640, y: 960, z: 1.16 }]] },
    { from: F.brain - 4, to: F.strangeQ, tr: "zoom", render: () => <S7_Search f={f} />, cam: [[F.brain - 4, { x: 540, y: 560, z: 1.35 }], [F.pattern + 10, { x: 540, y: 640, z: 1.12 }], [F.cant, { x: 540, y: 1000, z: 1.1 }], [F.strangeQ, { x: 540, y: 1150, z: 1.22 }]] },
    { from: F.strangeQ, to: F.worryQ, tr: "push", render: () => <S8_Clash f={f} />, cam: [[F.strangeQ, { x: 520, y: 1180, z: 1.18 }], [F.theory, { x: 540, y: 900, z: 1.04 }], [F.familiar2, { x: 470, y: 640, z: 1.08 }], [F.new2, { x: 610, y: 640, z: 1.08 }], [F.clash, { x: 540, y: 760, z: 1.02 }], [F.worryQ, { x: 540, y: 900, z: 1.04 }]] },
    { from: F.worryQ, to: F.sub, tr: "whip", render: () => <S9_Age f={f} />, cam: [[F.worryQ, { x: 520, y: 1180, z: 1.18 }], [F.common, { x: 540, y: 760, z: 1.08 }], [F.older + 10, { x: 540, y: 720, z: 1.1 }], [F.sign, { x: 540, y: 800, z: 1.05 }], [F.sub, { x: 540, y: 820, z: 1.12 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "spin", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.ask + 4, 0.06], [F.two, 0.12], [F.glitch, 0.1], [F.y2012, 0.12], [F.layout + 24, 0.1], [F.memory + 4, 0.12], [F.clash, 0.14], [F.young, 0.08], [F.sign, 0.1]];
  const SHAKE: [number, number][] = [[F.glitch, 10], [F.memory + 4, 8], [F.clash + 2, 16]];
  const SFX: Cue[] = [
    ...ASKS.map(([a]) => [a - 3, "pop", 0.4] as Cue),
    [F.lived - 4, "riser", 0.25], [F.before + 4, "whoosh", 0.3], [F.two - 8, "tick", 0.3], [F.two, "boom", 0.35],
    [F.glitch, "impact", 0.35], [F.notq, "pop", 0.35],
    [F.y2012, "boom", 0.3], [F.colorado, "pop", 0.3], [F.virtual - 4, "riser", 0.25], [F.purpose, "impact", 0.4],
    [F.newp - 4, "pop", 0.35], [F.layout - 4, "whoosh", 0.35], [F.layout + 24, "pop", 0.4], [F.forgotten, "tick", 0.3],
    [F.felt2, "pop", 0.4], [F.pattern - 2, "pop", 0.35], [F.cant - 30, "tick", 0.25], [F.memory + 4, "impact", 0.45],
    [F.theory - 4, "pop", 0.3], [F.checking, "tick", 0.3], [F.familiar2 - 4, "pop", 0.4], [F.new2 - 6, "pop", 0.4], [F.clash, "boom", 0.5],
    [F.notall, "pop", 0.35], [F.common - 6, "whoosh", 0.3], [F.young - 4, "pop", 0.35], [F.older - 10, "whoosh", 0.25], [F.sign - 2, "impact", 0.4],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.y2012 ? MAG : f < F.strangeQ ? "#7b5cff" : f < F.sub ? MAG : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="DÉJÀ VU" sub="WHY DOES IT HAPPEN?" until={F.that - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="dejavu" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
