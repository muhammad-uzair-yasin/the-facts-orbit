import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (start frame of each word, from words.ts WORDS)
const F = {
  ask: 17, askEnd: 53, every: 71, dream: 96, two: 121, total: 140, forget: 171, minutes: 211, twoQ: 257, point: 297, pointEnd: 335,
  unsure: 353, memory: 440, replays: 504, keep: 557, proof: 584, proofEnd: 616, y2010: 634, harvard: 650, maze: 707, nap: 741,
  ones: 772, dreamed: 792, ten: 842, whoa: 896, practice: 926, practiceEnd: 976, exactly: 1026, safe: 1060, rehearse: 1099, danger: 1112,
  chased: 1189, falling: 1215, blind: 1257, blindEnd: 1315, too: 1333, pictures: 1380, sounds: 1405, touch: 1417, smells: 1433, sub: 1462,
};

const NIGHT0 = "#0b0b2a", NIGHT1 = "#2a1b5e", LAV = "#b69cff", PINK = "#ff7ac8", CYAN = "#6fe3ff", MINT = "#5ff0b0", RED = "#ff4d5e", MOON = "#fff1c1";
const GRAD = CAST[23], PROF = CAST[35], SLEEPER = CAST[22];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);

// ---------- Q&A kit (local) ----------
const Bubble: React.FC<{ f: number; from: number; to: number; x: number; y: number; lines: string[]; tx: number; ty: number; hue?: string; fs?: number; accent?: string }> = ({ f, from, to, x, y, lines, tx, ty, hue = "#ffffff", fs = 74, accent = "#d6286b" }) => {
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
      <rect x={cx - w / 2 + 10} y={y - h / 2 + 12} width={w} height={h} rx={44} fill="#000000" opacity={0.3} />
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
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; aMood?: "happy" | "neutral" | "surprised"; hWave?: number; aWave?: number }> = ({ f, ax = 280, hx = 800, y = 1500, s = 0.95, aMood = "happy", hWave = 0, aWave = 0 }) => (
  <g>
    <ellipse cx={ax} cy={y - 200 * s} rx={190 * s} ry={300 * s} fill={LAV} opacity={0.32} />
    <ellipse cx={hx} cy={y - 200 * s} rx={190 * s} ry={300 * s} fill={LAV} opacity={0.22} />
    <ellipse cx={ax} cy={y} rx={150 * s} ry={26 * s} fill={LAV} opacity={0.35} />
    <ellipse cx={hx} cy={y} rx={150 * s} ry={26 * s} fill={LAV} opacity={0.3} />
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={GRAD} f={f} seed={23} talk={askTalk(f)} wave={aWave} mood={aMood} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={PROF} f={f} seed={35} talk={hostTalk(f)} wave={hWave} mood="happy" /></g>
  </g>
);

// ---------- set pieces ----------
const Sky: React.FC<{ f: number; top?: string; bot?: string; moon?: boolean }> = ({ f, top = NIGHT0, bot = NIGHT1, moon = true }) => (
  <g>
    <defs>
      <linearGradient id={`sky${top}${bot}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
    </defs>
    <rect width={VW} height={VH} fill={`url(#sky${top}${bot})`} />
    {[...Array(70)].map((_, i) => (
      <circle key={i} cx={rnd("sx" + i) * VW} cy={rnd("sy" + i) * VH * 0.8} r={1 + rnd("sr" + i) * 2.6} fill="#ffffff" opacity={0.3 + 0.6 * Math.abs(Math.sin(f * 0.04 + i * 1.7))} />
    ))}
    {moon && (
      <g transform={`translate(860 300)`}>
        <circle r={110} fill={MOON} opacity={0.18} />
        <circle r={72} fill={MOON} />
        <circle cx={34} cy={-20} r={64} fill={top} />
      </g>
    )}
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 420 + f * (0.4 + i * 0.2)) % 1500) - 200} cy={700 + i * 260} rx={220} ry={46} fill={LAV} opacity={0.08} />)}
  </g>
);
const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; o?: number }> = ({ x, y, s = 1, fill = "#ffffff", o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M-150 40 Q-190 40 -190 0 Q-190 -46 -140 -46 Q-130 -110 -60 -100 Q-20 -150 40 -120 Q100 -140 120 -80 Q190 -80 186 -10 Q186 40 140 40 Z" fill={fill} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
  </g>
);
/** Sleeper in bed (side view-ish: head on pillow, blanket). */
const Bed: React.FC<{ f: number; x: number; y: number; s?: number; awake?: number }> = ({ f, x, y, s = 1, awake = 0 }) => {
  const breathe = Math.sin(f * 0.07) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-300} y={-60} width={600} height={90} rx={14} fill="#6b4a9a" stroke={INKC} strokeWidth={7} />
      <rect x={-320} y={-200} width={40} height={250} rx={12} fill="#4a3474" stroke={INKC} strokeWidth={7} />
      <rect x={280} y={-130} width={40} height={180} rx={12} fill="#4a3474" stroke={INKC} strokeWidth={7} />
      <ellipse cx={-200} cy={-82} rx={84} ry={36} fill="#ffffff" stroke={INKC} strokeWidth={6} />
      <g transform={`translate(-200 ${-120 - awake * 40}) rotate(${-80 + awake * 80})`}>
        <circle r={50} fill={SLEEPER.skin} stroke={INKC} strokeWidth={6} />
        {[...Array(5)].map((_, i) => <circle key={i} cx={-30 + i * 15} cy={-40 + (i % 2) * 6} r={15} fill={SLEEPER.hairC} stroke={INKC} strokeWidth={4} />)}
        {awake < 0.5
          ? [-1, 1].map((k) => <path key={k} d={`M${k * 18 - 9} 4 q 9 7 18 0`} stroke={INKC} strokeWidth={5} fill="none" strokeLinecap="round" />)
          : [-1, 1].map((k) => <circle key={k} cx={k * 18} cy={4} r={8} fill="#ffffff" stroke={INKC} strokeWidth={3} />)}
        <path d={awake < 0.5 ? "M-8 26 q 8 5 16 0" : "M-8 24 q 8 -2 16 0"} stroke={INKC} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <path d={`M-170 ${-70 - breathe} Q 0 ${-120 - breathe} 260 -70 L 270 -40 H -170 Z`} fill="#8f6fd1" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M-160 ${-64 - breathe} Q 0 ${-104 - breathe} 250 -60`} stroke="#b69cff" strokeWidth={8} fill="none" opacity={0.7} />
    </g>
  );
};
const Zzz: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => (
  <g>{[0, 1, 2].map((i) => { const q = ((f + i * 25) % 75) / 75; return <text key={i} x={x + q * 60 + i * 10} y={y - q * 140} fontFamily={FONT} fontWeight={800} fontSize={36 + i * 12} fill={MOON} opacity={Math.sin(q * Math.PI)}>z</text>; })}</g>
);
/** Simple side-view brain. */
const Brain: React.FC<{ f: number; x: number; y: number; s?: number; glow?: number }> = ({ f, x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={260} ry={190} fill={PINK} opacity={0.12 + 0.2 * glow * (0.6 + 0.4 * Math.sin(f * 0.2))} />
    <path d="M-200 40 Q-240 -60 -170 -120 Q-130 -190 -40 -170 Q20 -210 90 -170 Q190 -170 210 -80 Q250 0 200 60 Q170 130 80 120 Q40 160 -30 130 Q-120 150 -160 100 Q-210 90 -200 40 Z" fill="#ffb6d9" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-150 -60 q 40 -30 80 0 t 80 0 M-120 30 q 40 -40 90 -10 t 90 10 M-40 -140 q 10 50 -20 90 M80 -150 q -20 60 20 100 M150 -40 q -30 50 10 100" stroke="#d9619b" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M40 120 q 10 50 -10 90" stroke="#d9619b" strokeWidth={22} fill="none" strokeLinecap="round" />
  </g>
);
/** Film strip running right→left with small day icons in its frames. */
const Reel: React.FC<{ f: number; y: number; speed: number; icons: string[]; keep?: number }> = ({ f, y, speed, icons, keep = 0 }) => {
  const fw = 220, n = 8;
  const off = (f * speed) % (fw * icons.length);
  return (
    <g>
      <rect x={-20} y={y - 120} width={VW + 40} height={240} fill="#1b1b28" stroke={INKC} strokeWidth={6} />
      {[...Array(30)].map((_, i) => <rect key={i} x={((i * 44 - f * speed) % (VW + 44) + VW + 44) % (VW + 44) - 22} y={y - 108} width={22} height={16} rx={4} fill="#fff1c1" opacity={0.7} />)}
      {[...Array(30)].map((_, i) => <rect key={"b" + i} x={((i * 44 - f * speed) % (VW + 44) + VW + 44) % (VW + 44) - 22} y={y + 92} width={22} height={16} rx={4} fill="#fff1c1" opacity={0.7} />)}
      {[...Array(n)].map((_, i) => {
        const x = i * fw - off + fw / 2;
        const xx = ((x % (fw * n)) + fw * n) % (fw * n) - fw;
        const ic = icons[i % icons.length];
        return (
          <g key={i} transform={`translate(${xx} ${y})`}>
            <rect x={-fw / 2 + 14} y={-78} width={fw - 28} height={156} rx={10} fill="#fff6dd" />
            <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>{ic}</text>
          </g>
        );
      })}
    </g>
  );
};
/** Maze with a dot walking a solution path. */
const Maze: React.FC<{ f: number; x: number; y: number; s: number; t: number; color?: string }> = ({ f, x, y, s, t, color = MINT }) => {
  const P: [number, number][] = [[-150, 150], [-150, 50], [-50, 50], [-50, -50], [-150, -50], [-150, -150], [50, -150], [50, -50], [150, -50], [150, 150]];
  const segs = P.length - 1;
  const u = clamp01(t) * segs, k = Math.min(segs - 1, Math.floor(u)), r = u - k;
  const dx = lerp(P[k][0], P[k + 1][0], r), dy = lerp(P[k][1], P[k + 1][1], r);
  const done = P.slice(0, k + 1).concat([[dx, dy]]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-200} y={-200} width={400} height={400} rx={14} fill="#14143a" stroke="#ffffff" strokeWidth={10} />
      <path d="M-100 200 V100 M-100 0 V-100 H100 M0 100 V0 H100 M100 100 H200 M-200 -100 H-100 M0 -200 V-100" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" />
      <polyline points={done.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <circle cx={dx} cy={dy} r={20 + Math.sin(f * 0.4) * 2} fill={color} stroke={INKC} strokeWidth={4} />
      <text x={150} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={YEL}>★</text>
    </g>
  );
};
const Icon: React.FC<{ kind: "ear" | "hand" | "nose" | "eye"; x: number; y: number; s?: number; p: number; f: number }> = ({ kind, x, y, s = 1, p, f }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${s * clamp01(p)})`}>
    <circle r={110} fill="#ffffff" stroke={INKC} strokeWidth={8} />
    {kind === "ear" && <g><path d="M-20 -60 Q50 -80 50 -10 Q50 30 10 50 Q-10 70 -20 50" stroke={INKC} strokeWidth={12} fill="#f3c9a3" strokeLinecap="round" /><path d="M0 -30 Q20 -30 20 -6" stroke={INKC} strokeWidth={8} fill="none" />{[0, 1, 2].map((i) => <path key={i} d={`M${-50 - i * 18} -40 Q${-70 - i * 18} 0 ${-50 - i * 18} 40`} stroke={CYAN} strokeWidth={7} fill="none" opacity={0.5 + 0.5 * Math.sin(f * 0.3 - i)} strokeLinecap="round" />)}</g>}
    {kind === "hand" && <g transform="translate(0 20)"><rect x={-40} y={-20} width={80} height={70} rx={24} fill="#f3c9a3" stroke={INKC} strokeWidth={7} />{[-30, -10, 10, 30].map((xx, i) => <rect key={i} x={xx - 9} y={-80 + Math.abs(i - 1.5) * 8} width={18} height={70} rx={9} fill="#f3c9a3" stroke={INKC} strokeWidth={6} />)}<rect x={36} y={-10} width={44} height={18} rx={9} fill="#f3c9a3" stroke={INKC} strokeWidth={6} transform="rotate(-30 36 0)" /></g>}
    {kind === "nose" && <g><path d="M0 -60 Q-10 10 -40 30 Q-30 52 0 44 Q30 52 40 30 Q10 10 0 -60" fill="#f3c9a3" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />{[0, 1, 2].map((i) => <path key={i} d={`M${-40 + i * 40} ${-50 - ((f * 1.5 + i * 12) % 40)} q 10 -10 0 -20`} stroke={PINK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />)}</g>}
    {kind === "eye" && <g><path d="M-70 0 Q0 -60 70 0 Q0 60 -70 0 Z" fill="#ffffff" stroke={INKC} strokeWidth={8} /><circle r={24} fill={INKC} /><line x1={-80} y1={70} x2={80} y2={-70} stroke={RED} strokeWidth={14} strokeLinecap="round" /></g>}
  </g>
);

// ---------- shots ----------
/** 1: night two-shot, the question. */
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} />
    <path d={`M0 1340 Q 300 1270 600 1320 T 1080 1300 V ${VH} H 0 Z`} fill="#3b2f7a" />
    <path d={`M0 1430 Q 340 1390 700 1420 T 1080 1410 V ${VH} H 0 Z`} fill="#2e2566" />
    <Duo f={f} y={1500} aMood={speaking(f, "asker", SPK) ? "surprised" : "happy"} />
    <Bubble f={f} from={F.ask} to={F.askEnd} x={400} y={800} lines={["WHY DO", "WE DREAM?"]} tx={290} ty={1040} />
  </g>
);
/** 2: sleeper dreams ~2 hours a night. */
const S2_TwoHours: React.FC<{ f: number }> = ({ f }) => {
  const h = countUp(f, F.two - 6, F.two + 16, 2); const hl = h === 1 ? "1 HOUR" : `${h} HOURS`;
  return (
    <g>
      <Sky f={f} top="#120d36" bot="#3a2378" />
      <Bed f={f} x={540} y={1320} s={1.15} />
      <Zzz f={f} x={330} y={1100} />
      <g opacity={pop(f, F.dream - 4, 14)}>
        <Cloud x={620} y={860} s={1.3} fill="#ffffff" />
        {[0, 1].map((i) => <circle key={i} cx={420 - i * 50} cy={1040 + i * 50} r={26 - i * 8} fill="#ffffff" stroke={INKC} strokeWidth={5} />)}
        <g transform="translate(620 830)">
          <circle cx={-80} cy={-10} r={40} fill={YEL} stroke={INKC} strokeWidth={5} />
          <path d="M-20 30 L40 -50 L100 30 Z" fill={MINT} stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </g>
      {f >= F.two - 6 && <BigNum f={f} at={F.two - 4} text={hl} x={540} y={480} hue={YEL} fs={150} />}
      {f >= F.total && <Chip x={540} y={600} w={420} label="EVERY NIGHT" hue={LAV} p={pop(f, F.total, 10)} fs={40} textColor={INKC} />}
    </g>
  );
};
/** 3: waking up — dreams evaporate within minutes. */
const S3_Forget: React.FC<{ f: number }> = ({ f }) => {
  const wake = eio(ramp(f, F.forget - 20, F.forget));
  const evap = eio(ramp(f, F.forget, F.minutes + 30));
  const ring = f >= F.forget - 24 && f < F.forget + 20;
  return (
    <g>
      <rect width={VW} height={VH} fill={mix("#2a1d5c", "#ffd9a8", wake)} />
      <circle cx={860} cy={300} r={90} fill={mix(MOON, "#ffb347", wake)} />
      <Bed f={f} x={540} y={1340} s={1.15} awake={wake} />
      <g transform={`translate(860 1150) rotate(${ring ? Math.sin(f * 2) * 10 : 0})`}>
        <circle r={70} fill="#ff6a3d" stroke={INKC} strokeWidth={7} />
        <circle r={50} fill="#ffffff" stroke={INKC} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={INKC} strokeWidth={6} /><line x1={0} y1={0} x2={24} y2={0} stroke={INKC} strokeWidth={6} />
        <circle cx={-46} cy={-62} r={20} fill="#ff6a3d" stroke={INKC} strokeWidth={5} /><circle cx={46} cy={-62} r={20} fill="#ff6a3d" stroke={INKC} strokeWidth={5} />
      </g>
      {ring && <text x={860} y={1030} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={RED} stroke={INKC} strokeWidth={5} paintOrder="stroke">RING!</text>}
      {/* dream cloud evaporating into particles */}
      <g opacity={1 - evap}>
        <Cloud x={560} y={760} s={1.3} />
        <g transform="translate(560 730)"><circle cx={-80} cy={-10} r={40} fill={YEL} stroke={INKC} strokeWidth={5} /><path d="M-20 30 L40 -50 L100 30 Z" fill={MINT} stroke={INKC} strokeWidth={5} /></g>
      </g>
      {[...Array(40)].map((_, i) => {
        const q = clamp01(evap * 1.4 - rnd("pd" + i) * 0.4);
        if (q <= 0 || q >= 1) return null;
        return <circle key={i} cx={400 + rnd("px" + i) * 320 + (rnd("pv" + i) - 0.5) * 300 * q} cy={680 + rnd("py" + i) * 160 - q * 420} r={6 + rnd("pr" + i) * 10} fill="#ffffff" opacity={1 - q} />;
      })}
      {f >= F.minutes && <Stamp f={f} at={F.minutes} x={540} y={480} text="FORGOTTEN" hue={RED} fs={88} rot={-8} />}
    </g>
  );
};
/** 4: "Two hours?! So what's the point?" */
const S4_Point: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} />
    <path d={`M0 1340 Q 300 1270 600 1320 T 1080 1300 V ${VH} H 0 Z`} fill="#3b2f7a" />
    <Duo f={f} y={1500} aMood={f < F.point ? "surprised" : "neutral"} />
    <Bubble f={f} from={F.twoQ} to={F.point - 4} x={380} y={820} lines={["2 HOURS?!"]} tx={290} ty={1040} fs={88} />
    <Bubble f={f} from={F.point} to={F.pointEnd} x={420} y={800} lines={["SO WHAT'S", "THE POINT?"]} tx={290} ty={1040} />
    {f >= F.unsure && <Chip x={720} y={640} w={560} label="SCIENTISTS: NOT SURE" hue={LAV} p={pop(f, F.unsure, 10)} fs={34} textColor={INKC} />}
  </g>
);
/** 5: memory — brain replays the day like a film reel and decides what to keep. */
const S5_Replay: React.FC<{ f: number }> = ({ f }) => {
  const keepP = pop(f, F.keep, 12);
  const icons = ["COFFEE", "BIKE", "BOOK", "PIZZA", "FRIENDS", "MUSIC"];
  return (
    <g>
      <Sky f={f} top="#170f40" bot="#40206e" moon={false} />
      <Brain f={f} x={540} y={620} s={1.25} glow={ramp(f, F.memory, F.memory + 20)} />
      {f >= F.memory && <Chip x={540} y={380} w={360} label="MEMORY" hue={PINK} p={pop(f, F.memory, 10)} fs={46} />}
      <g opacity={pop(f, F.replays - 6, 12)}>
        <Reel f={f} y={1080} speed={f < F.replays ? 2 : 9} icons={icons} />
        <text x={540} y={1260} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#ffffff" stroke={INKC} strokeWidth={6} paintOrder="stroke">REPLAYING YOUR DAY ▶▶</text>
      </g>
      {f >= F.keep - 2 && (
        <g opacity={clamp01(keepP)}>
          <rect x={150} y={1320} width={330} height={180} rx={26} fill={MINT} stroke={INKC} strokeWidth={7} />
          <text x={315} y={1435} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={INKC}>KEEP ✓</text>
          <rect x={600} y={1320} width={330} height={180} rx={26} fill="#ffffff" stroke={INKC} strokeWidth={7} opacity={0.75} />
          <text x={765} y={1435} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED}>TOSS ✗</text>
        </g>
      )}
    </g>
  );
};
/** 6: "Is there proof?" + 2010 Harvard maze nap study. */
const S6_Proof: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} />
    <path d={`M0 1340 Q 300 1270 600 1320 T 1080 1300 V ${VH} H 0 Z`} fill="#3b2f7a" />
    <Duo f={f} y={1500} aMood="neutral" />
    <Bubble f={f} from={F.proof} to={F.proofEnd} x={400} y={820} lines={["IS THERE", "PROOF?"]} tx={290} ty={1040} />
  </g>
);
const S7_Maze: React.FC<{ f: number }> = ({ f }) => {
  const learn = ramp(f, F.maze - 6, F.nap - 4);
  const better = eout(ramp(f, F.ten - 10, F.ten + 24));
  return (
    <g>
      <rect width={VW} height={VH} fill="#141238" />
      {[...Array(40)].map((_, i) => <circle key={i} cx={rnd("mx" + i) * VW} cy={rnd("my" + i) * VH} r={1.5 + rnd("mr" + i) * 2} fill="#ffffff" opacity={0.4} />)}
      <BigNum f={f} at={F.y2010} text="2010" x={540} y={330} hue={YEL} fs={150} />
      <Chip x={540} y={430} w={300} label="HARVARD" hue="#a51c30" p={pop(f, F.harvard, 10)} fs={40} />
      <g opacity={pop(f, F.maze - 18, 12)}><Maze f={f} x={300} y={780} s={0.9} t={learn} /></g>
      <text x={300} y={1020} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff" opacity={pop(f, F.maze, 10)}>1. LEARN A MAZE</text>
      <g opacity={pop(f, F.nap - 4, 12)}>
        <Bed f={f} x={790} y={880} s={0.6} />
        <Zzz f={f} x={700} y={760} />
        <text x={780} y={1020} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff">2. TAKE A NAP</text>
      </g>
      {f >= F.dreamed - 4 && (
        <g opacity={pop(f, F.dreamed - 4, 12)}>
          <Cloud x={820} y={650} s={0.75} fill="#ffffff" />
          <Maze f={f} x={820} y={630} s={0.28} t={(f % 60) / 60} color={PINK} />
        </g>
      )}
      {f >= F.ten - 10 && (
        <g>
          <line x1={140} y1={1500} x2={940} y2={1500} stroke="#ffffff" strokeWidth={6} />
          <rect x={220} y={1500 - 40 * better} width={200} height={40 * better} rx={10} fill={LAV} stroke={INKC} strokeWidth={5} />
          <rect x={640} y={1500 - 380 * better} width={200} height={380 * better} rx={10} fill={MINT} stroke={INKC} strokeWidth={5} />
          <text x={320} y={1550} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff">NO MAZE DREAM</text>
          <text x={740} y={1550} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff">DREAMED MAZE</text>
          <BigNum f={f} at={F.ten} text="×10" x={330} y={1290} hue={MINT} fs={130} />
        </g>
      )}
    </g>
  );
};
/** 8: "Whoa. So dreams are like practice?" */
const S8_Practice: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} top="#1a0f45" bot="#4a2a80" />
    <path d={`M0 1340 Q 300 1270 600 1320 T 1080 1300 V ${VH} H 0 Z`} fill="#3b2f7a" />
    <Duo f={f} y={1500} aMood={f < F.practice ? "surprised" : "happy"} />
    <Bubble f={f} from={F.whoa} to={F.practice - 4} x={380} y={830} lines={["WHOA!"]} tx={290} ty={1040} fs={100} />
    <Bubble f={f} from={F.practice} to={F.practiceEnd} x={420} y={800} lines={["DREAMS =", "PRACTICE?"]} tx={290} ty={1040} />
    {f >= F.exactly && <Stamp f={f} at={F.exactly} x={640} y={620} text="EXACTLY" hue={MINT} fs={84} rot={-8} />}
  </g>
);
/** 9: rehearsing danger: being chased, then falling. */
const S9_Danger: React.FC<{ f: number }> = ({ f }) => {
  const fall = f >= F.falling - 4;
  const fy = ((f - F.falling) * 14) % 600;
  return (
    <g>
      <rect width={VW} height={VH} fill={fall ? "#2a4a8c" : "#4a2468"} />
      <ellipse cx={600} cy={1150} rx={330} ry={380} fill={fall ? "#9fb3e8" : PINK} opacity={0.22} />
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#ffffff" stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.safe + 18, 10)}>SAFE PRACTICE</text>
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={RED} stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.danger, 10)}>FOR DANGER</text>
      {!fall && (
        <g>
          {[...Array(8)].map((_, i) => <rect key={i} x={((i * 160 - f * 14) % 1280 + 1280) % 1280 - 100} y={1260} width={90} height={14} rx={7} fill="#ffffff" opacity={0.25} />)}
          <g transform={`translate(640 ${1300 - Math.abs(Math.sin(f * 0.45)) * 30}) scale(0.8) rotate(8)`}><Person d={GRAD} f={f} seed={23} talk={0} wave={Math.sin(f * 0.45) > 0 ? 1 : 0} mood="surprised" /></g>
          <g transform={`translate(${200 + Math.sin(f * 0.2) * 20} 1200)`} opacity={pop(f, F.chased - 6, 12)}>
            <path d="M-130 120 Q-160 -60 -60 -150 Q0 -190 70 -150 Q160 -70 130 120 Q100 90 70 120 Q40 90 0 120 Q-40 90 -70 120 Q-100 90 -130 120 Z" fill="#0d0820" stroke="#7a5cff" strokeWidth={6} />
            <ellipse cx={-36} cy={-60} rx={18} ry={10} fill={RED} /><ellipse cx={36} cy={-60} rx={18} ry={10} fill={RED} />
          </g>
          {f >= F.chased && <Chip x={540} y={600} w={340} label="CHASED!" hue={RED} p={pop(f, F.chased, 10)} fs={48} />}
        </g>
      )}
      {fall && (
        <g>
          {[...Array(10)].map((_, i) => <Cloud key={i} x={rnd("fx" + i) * VW} y={((rnd("fy" + i) * VH - (f - F.falling) * 22) % VH + VH) % VH} s={0.35 + rnd("fs" + i) * 0.3} fill="#9fb3e8" o={0.5} />)}
          {[...Array(12)].map((_, i) => <line key={i} x1={300 + i * 45} y1={((i * 170 - (f - F.falling) * 40) % VH + VH) % VH} x2={300 + i * 45} y2={((i * 170 - (f - F.falling) * 40) % VH + VH) % VH + 120} stroke="#ffffff" strokeWidth={4} opacity={0.35} />)}
          <g transform={`translate(${540 + Math.sin(f * 0.1) * 30} ${1250 + fy * 0.05}) rotate(${Math.sin(f * 0.15) * 18}) scale(0.85)`}><Person d={GRAD} f={f} seed={23} talk={0} wave={1} mood="surprised" /></g>
          <Chip x={540} y={560} w={340} label="FALLING!" hue={CYAN} p={pop(f, F.falling, 10)} fs={48} textColor={INKC} />
        </g>
      )}
    </g>
  );
};
/** 10: "What about people who are born blind?" */
const S10_Blind: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} />
    <path d={`M0 1340 Q 300 1270 600 1320 T 1080 1300 V ${VH} H 0 Z`} fill="#3b2f7a" />
    <Duo f={f} y={1500} aMood="neutral" />
    <Bubble f={f} from={F.blind} to={F.blindEnd} x={430} y={800} lines={["BORN BLIND?", "DO THEY DREAM?"]} tx={290} ty={1040} fs={66} />
  </g>
);
/** 11: blind dreamers: sounds, touch, smells. */
const S11_Senses: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} top="#170f40" bot="#3a2378" moon={false} />
    <Cloud x={540} y={760} s={2.1} fill="#2b2466" />
    {f >= F.too && <Chip x={540} y={400} w={460} label="THEY DREAM TOO" hue={MINT} p={pop(f, F.too, 10)} fs={42} textColor={INKC} />}
    <Icon kind="eye" x={540} y={660} s={0.9} p={pop(f, F.pictures - 2, 12)} f={f} />
    <Icon kind="ear" x={250} y={1080} p={pop(f, F.sounds, 12)} f={f} />
    <Icon kind="hand" x={540} y={1180} p={pop(f, F.touch, 12)} f={f} />
    <Icon kind="nose" x={830} y={1080} p={pop(f, F.smells, 12)} f={f} />
    {[["SOUND", 250, F.sounds], ["TOUCH", 540, F.touch], ["SMELL", 830, F.smells]].map(([t, x, at], i) => (
      <text key={i} x={x as number} y={(i === 1 ? 1340 : 1240)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#ffffff" opacity={pop(f, (at as number) + 4, 10)}>{t as string}</text>
    ))}
  </g>
);
const S12_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} />
    <Outro f={f} at={F.sub} />
    <g transform="translate(180 1520) scale(0.85)"><Person d={PROF} f={f} seed={35} talk={hostTalk(f)} wave={1} mood="happy" /></g>
    <g transform="translate(900 1520) scale(0.85)"><Person d={GRAD} f={f} seed={23} talk={0} wave={1} mood="happy" /></g>
  </g>
);

export const DreamsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.every, render: () => <S1_Ask f={f} />, cam: [[0, { x: 440, y: 1020, z: 1.16 }], [F.askEnd, { x: 480, y: 1020, z: 1.12 }], [F.every, { x: 480, y: 1000, z: 1.12 }]] },
    { from: F.every, to: F.forget - 24, tr: "iris", render: () => <S2_TwoHours f={f} />, cam: [[F.every, { x: 540, y: 1200, z: 1.25 }], [F.two, { x: 540, y: 900, z: 1.05 }], [F.forget - 24, { x: 560, y: 960, z: 1.1 }]] },
    { from: F.forget - 24, to: F.twoQ, tr: "flash", render: () => <S3_Forget f={f} />, cam: [[F.forget - 24, { x: 700, y: 1150, z: 1.3 }], [F.forget + 10, { x: 540, y: 960, z: 1.05 }], [F.twoQ, { x: 540, y: 800, z: 1.15 }]] },
    { from: F.twoQ, to: F.memory - 30, tr: "whip", render: () => <S4_Point f={f} />, cam: [[F.twoQ, { x: 440, y: 1000, z: 1.16 }], [F.point, { x: 470, y: 1000, z: 1.12 }], [F.unsure, { x: 540, y: 960, z: 1.05 }], [F.memory - 30, { x: 600, y: 940, z: 1.1 }]] },
    { from: F.memory - 30, to: F.proof, tr: "zoom", render: () => <S5_Replay f={f} />, cam: [[F.memory - 30, { x: 540, y: 700, z: 1.25 }], [F.replays, { x: 540, y: 900, z: 1.05 }], [F.keep, { x: 540, y: 980, z: 1.06 }], [F.proof, { x: 540, y: 980, z: 1.08 }]] },
    { from: F.proof, to: F.y2010, tr: "push", render: () => <S6_Proof f={f} />, cam: [[F.proof, { x: 440, y: 1000, z: 1.18 }], [F.y2010, { x: 480, y: 1000, z: 1.12 }]] },
    { from: F.y2010, to: F.ones, tr: "flash", render: () => <S7_Maze f={f} />, cam: [[F.y2010, { x: 540, y: 420, z: 1.3 }], [F.maze, { x: 400, y: 800, z: 1.15 }], [F.nap, { x: 600, y: 820, z: 1.1 }], [F.ones, { x: 700, y: 760, z: 1.22 }]] },
    { from: F.ones, to: F.whoa, tr: "cut", render: () => <S7_Maze f={f} />, cam: [[F.ones, { x: 700, y: 760, z: 1.25 }], [F.ten - 10, { x: 540, y: 960, z: 1.0 }], [F.whoa, { x: 560, y: 960, z: 1.04 }]] },
    { from: F.whoa, to: F.safe, tr: "spin", render: () => <S8_Practice f={f} />, cam: [[F.whoa, { x: 440, y: 1000, z: 1.18 }], [F.practice, { x: 470, y: 1000, z: 1.12 }], [F.exactly, { x: 540, y: 900, z: 1.05 }], [F.safe, { x: 560, y: 900, z: 1.1 }]] },
    { from: F.safe, to: F.blind, tr: "wipe", render: () => <S9_Danger f={f} />, cam: [[F.safe, { x: 540, y: 620, z: 1.15 }], [F.chased, { x: 500, y: 960, z: 1.04 }], [F.falling, { x: 540, y: 900, z: 1.08, r: -3 }], [F.blind, { x: 540, y: 960, z: 1.04, r: 3 }]] },
    { from: F.blind, to: F.too - 4, tr: "whipUp", render: () => <S10_Blind f={f} />, cam: [[F.blind, { x: 440, y: 1000, z: 1.16 }], [F.too - 4, { x: 480, y: 1000, z: 1.1 }]] },
    { from: F.too - 4, to: F.sub, tr: "iris", render: () => <S11_Senses f={f} />, cam: [[F.too - 4, { x: 560, y: 860, z: 1.04 }], [F.pictures, { x: 560, y: 900, z: 1.0 }], [F.sounds, { x: 500, y: 1000, z: 1.05 }], [F.smells, { x: 560, y: 1000, z: 1.05 }], [F.sub, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S12_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.two, 0.1], [F.minutes, 0.12], [F.twoQ, 0.08], [F.memory, 0.1], [F.y2010, 0.12], [F.ten, 0.14], [F.exactly, 0.1], [F.chased, 0.08], [F.falling, 0.1], [F.sounds, 0.06], [F.touch, 0.06], [F.smells, 0.06]];
  const SHAKE: [number, number][] = [[F.forget - 20, 8], [F.minutes, 10], [F.ten, 10], [F.chased, 8]];
  const SFX: Cue[] = [
    [F.ask - 2, "pop", 0.4], [F.two - 4, "boom", 0.35], [F.dream - 4, "pop", 0.3], [F.total, "pop", 0.3],
    [F.forget - 22, "tick", 0.5], [F.forget - 14, "tick", 0.5], [F.forget - 6, "tick", 0.5], [F.minutes, "impact", 0.45],
    [F.twoQ - 2, "pop", 0.45], [F.point - 2, "pop", 0.35], [F.unsure, "pop", 0.3], [F.memory, "boom", 0.35], [F.replays - 6, "whoosh", 0.3], [F.keep, "pop", 0.4],
    [F.proof - 2, "pop", 0.4], [F.harvard, "pop", 0.35], [F.maze - 6, "pop", 0.3], [F.nap - 4, "pop", 0.3], [F.dreamed - 4, "pop", 0.35], [F.ten - 10, "riser", 0.3], [F.ten, "impact", 0.45],
    [F.whoa - 2, "pop", 0.45], [F.practice - 2, "pop", 0.35], [F.exactly, "impact", 0.4], [F.danger, "riser_dark", 0.3], [F.chased - 6, "boom", 0.35], [F.falling - 4, "whoosh", 0.4],
    [F.blind - 2, "pop", 0.4], [F.too, "pop", 0.35], [F.pictures - 2, "tick", 0.4], [F.sounds, "pop", 0.4], [F.touch, "pop", 0.4], [F.smells, "pop", 0.4],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="DREAMS" sub="WHY DO WE DREAM?" until={F.every - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={LAV} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="dreams" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
