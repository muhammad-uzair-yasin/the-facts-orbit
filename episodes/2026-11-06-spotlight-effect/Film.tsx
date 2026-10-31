import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Drift, Outro, Cursor, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (from sents.json)
const F = {
  hook: 17, much: 69, y2000: 118, walked: 363, staring: 437, guessed: 504, guess: 602, half: 633, real: 681, quarter: 716,
  twice: 758, asDid: 838, called: 886, center: 939, everyone: 997, busy: 1078, worry: 1132, hair: 1193, mistake: 1235,
  nobody: 1283, goAhead: 1346, doIt: 1381, sub: 1419,
};
const PINK = "#ff2fa0", NAVY = "#0d1030", STAGE = "#1a1240", GOLD = "#ffc94a", TEAL = "#19c3b0", RED = "#ff4d5e";
const GROUND = 1450;

// ---------- cast ----------
const HOST: PersonDef = { ...CAST[17], hairC: "#111111", shoes: "#111111" };             // #18 Business — narrator
const STUDENT_BASE: PersonDef = { ...CAST[22], top: "tee", prop: "none" };                // #23 Student — guest
const studentD = (shirtOn: boolean): PersonDef => ({ ...STUDENT_BASE, topC: shirtOn ? PINK : "#9aa4b2" });
const CROWD: { d: PersonDef; x: number; s: number; glance?: boolean; seed: number }[] = [
  { d: { ...CAST[0], prop: "phone" }, x: 110, s: 0.95, seed: 3 },
  { d: { ...CAST[33] }, x: 270, s: 0.9, seed: 5 },
  { d: { ...CAST[20], prop: "phone" }, x: 820, s: 0.95, seed: 7 },
  { d: { ...CAST[10], prop: "coffee" }, x: 980, s: 0.88, seed: 9, glance: true },
  { d: { ...CAST[29], prop: "phone" }, x: 420, s: 0.82, seed: 11 },
  { d: { ...CAST[26], prop: "coffee" }, x: 660, s: 0.84, seed: 13, glance: true },
  { d: { ...CAST[4], prop: "phone" }, x: 560, s: 0.78, seed: 15 },
];

const Eyes: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-14, 14].map((dx) => <g key={dx}><ellipse cx={dx} cy={0} rx={12} ry={15} fill="#fff" stroke={INKC} strokeWidth={3} /><circle cx={dx + 3} cy={2} r={6} fill={INKC} /></g>)}
  </g>
);
const IconHair: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={50} fill="#f2cfa8" stroke={INKC} strokeWidth={5} />
    <path d="M-50 -10 q10 -60 50 -50 q-10 -30 30 -20 q30 10 20 50 q-20 -30 -40 -10 q-20 -20 -60 30" fill="#6b4423" stroke={INKC} strokeWidth={5} />
    <path d="M10 -70 l18 -30 M30 -62 l22 -26" stroke="#6b4423" strokeWidth={8} strokeLinecap="round" />
    <path d="M-16 24 q16 -10 32 0" stroke={INKC} strokeWidth={5} fill="none" />
  </g>
);
const IconMeeting: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-60} y={-46} width={120} height={80} rx={18} fill={PINK} stroke={INKC} strokeWidth={5} />
    <path d="M-20 34 L-34 58 L4 34 Z" fill={PINK} stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
    <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff">!?</text>
  </g>
);

// shirt print: generic cartoon face (not a real person)
const ShirtFace: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={40} fill={YEL} stroke={INKC} strokeWidth={5} />
    <path d="M-30 -14 H30 L26 -2 Q14 6 4 -4 H-4 Q-14 6 -26 -2 Z" fill={INKC} />
    <path d="M-22 14 Q0 36 22 14 Z" fill="#7a1a2a" stroke={INKC} strokeWidth={4} />
    <path d="M-34 -30 q14 -26 34 -12 q20 -16 34 10" stroke="#ff7a1a" strokeWidth={10} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map((i) => <circle key={i} cx={-48 + i * 48} cy={52} r={4} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.3 + i)} />)}
  </g>
);
const Sweat: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g>
    {[0, 1].map((i) => {
      const q = ((f * 0.04 + i * 0.5) % 1);
      return <path key={i} d={`M${x + (60 + i * 18) * s} ${y - (430 - q * 70) * s} q ${8 * s} ${14 * s} 0 ${20 * s} q ${-8 * s} ${-6 * s} 0 ${-20 * s}`} fill="#7fd3ff" stroke={INKC} strokeWidth={3} opacity={1 - q} />;
    })}
  </g>
);
const Student: React.FC<{ f: number; x: number; y?: number; s?: number; shirtOn: boolean; mood?: "happy" | "neutral" | "surprised"; sweat?: boolean; wave?: number; walk?: number }> = ({ f, x, y = GROUND, s = 1.35, shirtOn, mood = "surprised", sweat, wave = 0, walk = 0 }) => {
  const bob = walk ? Math.abs(Math.sin(f * 0.3)) * 10 : 0;
  return (
    <g>
      <g transform={`translate(${x} ${y - bob}) scale(${s})`}>
        <Person d={studentD(shirtOn)} f={f} seed={23} talk={talkFor(f, "guest", SPK, ENV)} wave={wave} mood={mood} />
        {shirtOn && <ShirtFace x={0} y={-228} s={0.62} f={f} />}
      </g>
      {sweat && <Sweat x={x} y={y - bob} s={s} f={f} />}
    </g>
  );
};
const Host: React.FC<{ f: number; x: number; y?: number; s?: number; wave?: number; mood?: "happy" | "neutral" | "surprised"; flip?: boolean }> = ({ f, x, y = GROUND, s = 1.0, wave = 0, mood = "happy", flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <Person d={HOST} f={f} seed={18} talk={talkFor(f, "host", SPK, ENV)} wave={wave} mood={mood} />
  </g>
);
const CrowdPerson: React.FC<{ f: number; c: typeof CROWD[number]; y?: number; lit?: number }> = ({ f, c, y = GROUND - 40, lit = 0 }) => (
  <g>
    {lit > 0 && <MiniSpot x={c.x} y={y} s={c.s} p={lit} />}
    <g transform={`translate(${c.x} ${y}) scale(${c.s})`}>
      <Person d={c.d} f={f} seed={c.seed} mood={c.glance && Math.sin(f * 0.05 + c.seed) > 0.4 ? "surprised" : "neutral"} />
    </g>
  </g>
);
const MiniSpot: React.FC<{ x: number; y: number; s: number; p: number }> = ({ x, y, s, p }) => (
  <g opacity={clamp01(p)} style={{ mixBlendMode: "screen" }}>
    <path d={`M${x - 20} ${y - 700 * s} L${x + 20} ${y - 700 * s} L${x + 120 * s} ${y} L${x - 120 * s} ${y} Z`} fill="#fff6c8" opacity={0.28} />
    <ellipse cx={x} cy={y} rx={130 * s} ry={24 * s} fill="#fff6c8" opacity={0.45} />
  </g>
);
const Beam: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => (
  <g style={{ mixBlendMode: "screen" }} opacity={o}>
    <path d={`M${x - 40} 0 L${x + 40} 0 L${x + w} ${y} L${x - w} ${y} Z`} fill="#fff4b8" opacity={0.28} />
    <path d={`M${x - 20} 0 L${x + 20} 0 L${x + w * 0.6} ${y} L${x - w * 0.6} ${y} Z`} fill="#fff4b8" opacity={0.18} />
    <ellipse cx={x} cy={y} rx={w * 1.05} ry={w * 0.2} fill="#fff4b8" opacity={0.5} />
  </g>
);
const Room: React.FC<{ f: number; dark?: number }> = ({ f, dark = 0.6 }) => (
  <g>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1d5c" /><stop offset="1" stopColor="#4a2a6a" /></linearGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#wall)" />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130 - 20} y={300} width={6} height={1100} fill="#ffffff" opacity={0.04} />)}
    {[...Array(12)].map((_, i) => (
      <circle key={i} cx={60 + i * 90} cy={280 + Math.sin(i) * 20} r={10} fill={["#ffd60a", "#ff2fa0", "#19c3b0"][i % 3]} opacity={0.4 + 0.4 * Math.abs(Math.sin(f * 0.08 + i))} />
    ))}
    <path d={`M0 280 Q 540 330 1080 280`} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={3} fill="none" />
    <rect x={0} y={GROUND - 60} width={VW} height={VH} fill="#1b1030" />
    <rect x={0} y={GROUND - 60} width={VW} height={8} fill="#000000" opacity={0.4} />
    <rect width={VW} height={VH} fill="#000000" opacity={dark} />
  </g>
);
const Bubble: React.FC<{ x: number; y: number; text: string; p: number; w?: number; hue?: string }> = ({ x, y, text, p, w = 520, hue = "#ffffff" }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * eout(clamp01(p))})`}>
    <rect x={-w / 2} y={-62} width={w} height={124} rx={60} fill={hue} stroke={INKC} strokeWidth={6} />
    <circle cx={-w / 4} cy={84} r={18} fill={hue} stroke={INKC} strokeWidth={5} />
    <circle cx={-w / 4 - 22} cy={124} r={10} fill={hue} stroke={INKC} strokeWidth={4} />
    <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INKC}>{text}</text>
  </g>
);

// ---------- shots ----------
const S1_Hook: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill={NAVY} />
    <Drift f={f} n={40} color="#fff4b8" seed="dust1" maxR={2.5} speed={0.3} area={[300, 0, 500, 1400]} opacity={0.35} />
    {/* eyes in the dark that turn away */}
    {[...Array(10)].map((_, i) => {
      const ex = 80 + (i % 5) * 220 + (i > 4 ? 100 : 0), ey = 560 + Math.floor(i / 5) * 260;
      const away = ramp(f, F.much - 10 + i * 3, F.much + 4 + i * 3);
      return (
        <g key={i} opacity={lerp(0.9, 0.25, away)} transform={`translate(${ex} ${ey})`}>
          {[-16, 16].map((dx) => <g key={dx}><ellipse cx={dx} cy={0} rx={13} ry={9 * (1 - away * 0.85)} fill="#fff" /><circle cx={dx + lerp(0, 9, away) * (i % 2 ? 1 : -1)} cy={0} r={5 * (1 - away * 0.85)} fill={INKC} /></g>)}
        </g>
      );
    })}
    <Beam x={540} y={GROUND} w={260} />
    <Student f={f} x={540} s={1.3} shirtOn mood="surprised" sweat />
  </g>
);
const S2_Study: React.FC<{ f: number }> = ({ f }) => {
  const drop = eio(ramp(f, F.y2000 + 150, F.y2000 + 185));
  const shirtOn = f >= F.y2000 + 185;
  return (
    <g>
      <rect width={VW} height={VH} fill="#f3eee4" />
      {[...Array(14)].map((_, i) => <line key={i} x1={0} y1={i * 140} x2={VW} y2={i * 140} stroke="#e3dccd" strokeWidth={3} />)}
      {/* study card */}
      <g transform={`translate(540 ${lerp(-300, 340, eout(ramp(f, F.y2000, F.y2000 + 18)))}) rotate(${-2 + Math.sin(f * 0.05) * 0.6})`}>
        <rect x={-380} y={-150} width={760} height={300} rx={22} fill="#ffffff" stroke={INKC} strokeWidth={6} />
        <rect x={-380} y={-150} width={760} height={74} rx={22} fill="#b31b1b" />
        <rect x={-380} y={-100} width={760} height={24} fill="#b31b1b" />
        <text x={-340} y={-100} fontFamily={FONT} fontWeight={800} fontSize={36} fill="#fff" letterSpacing={3}>PSYCHOLOGY STUDY</text>
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={INKC}>CORNELL · 2000</text>
        <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill="#555">Gilovich, Medvec & Savitsky</text>
      </g>
      {/* falling embarrassing shirt */}
      {!shirtOn && f >= F.y2000 + 90 && (
        <g transform={`translate(560 ${lerp(-200, GROUND - 300 * 1.3, drop)}) rotate(${(1 - drop) * 25})`} opacity={pop(f, F.y2000 + 90, 10)}>
          <path d="M-110 -80 L-50 -100 Q0 -80 50 -100 L110 -80 L140 -20 L95 0 L90 120 H-90 L-95 0 L-140 -20 Z" fill={PINK} stroke={INKC} strokeWidth={6} />
          <ShirtFace x={0} y={20} s={0.9} f={f} />
        </g>
      )}
      {shirtOn && <Stamp f={f} at={F.y2000 + 186} x={760} y={760} text="OH NO" hue={RED} fs={70} rot={12} />}
      <Student f={f} x={560} s={1.3} shirtOn={shirtOn} mood={shirtOn ? "surprised" : "neutral"} sweat={shirtOn} />
      <Host f={f} x={170} s={0.9} mood="happy" />
    </g>
  );
};
const S3_Room: React.FC<{ f: number }> = ({ f }) => {
  const walkP = eout(ramp(f, F.walked, F.walked + 60));
  const sx = lerp(-150, 540, walkP);
  return (
    <g>
      <Room f={f} dark={0.55} />
      {CROWD.map((c, i) => <CrowdPerson key={i} f={f} c={c} y={GROUND - 30 - (i > 3 ? 60 : 0)} />)}
      <Beam x={sx} y={GROUND + 10} w={240} />
      <Student f={f} x={sx} y={GROUND + 30} s={1.32} shirtOn mood="surprised" sweat={f > F.walked + 30} walk={walkP < 1 ? 1 : 0} />
      {/* only two glances */}
      {f >= F.walked + 50 && [3, 5].map((k) => {
        const c = CROWD[k];
        return <g key={k} opacity={pop(f, F.walked + 50 + k * 4, 8)}><Eyes x={c.x + 40} y={GROUND - 30 - (k > 3 ? 60 : 0) - 600 * c.s} s={1.2} /></g>;
      })}
      {f >= F.staring && <Bubble x={560} y={470} text="EVERYONE SEES ME!" p={pop(f, F.staring, 12)} w={600} />}
      {f >= F.staring && [...Array(6)].map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + f * 0.03;
        return <text key={i} x={540 + Math.cos(a) * 330} y={900 + Math.sin(a) * 220} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={YEL} opacity={0.6 * clamp01((f - F.staring) / 15)}>?</text>;
      })}
    </g>
  );
};
const Bar: React.FC<{ x: number; y: number; w: number; p: number; hue: string; label: string; val: string; f: number; at: number }> = ({ x, y, w, p, hue, label, val, f, at }) => (
  <g opacity={pop(f, at, 10)} transform={`translate(${x} ${y})`}>
    <text x={0} y={-30} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff" letterSpacing={2}>{label}</text>
    <rect x={0} y={0} width={w} height={110} rx={55} fill="#ffffff" opacity={0.12} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={4} />
    <rect x={0} y={0} width={Math.max(110, w * p)} height={110} rx={55} fill={hue} stroke={INKC} strokeWidth={5} />
    <text x={Math.max(110, w * p) - 26} y={76} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={62} fill={INKC}>{val}</text>
  </g>
);
const Crowd10: React.FC<{ f: number; lit: number; y: number; hi: number }> = ({ f, lit, y, hi }) => (
  <g transform={`translate(140 ${y})`}>
    {[...Array(10)].map((_, i) => {
      const on = i < Math.round(lit);
      const flash = on && i === Math.round(lit) - 1 ? 1 + 0.15 * Math.sin(f * 0.5) : 1;
      return (
        <g key={i} transform={`translate(${(i % 5) * 200} ${Math.floor(i / 5) * 190}) scale(${flash})`}>
          <circle cy={-50} r={38} fill={on ? hi : "#3a3f63"} stroke={INKC} strokeWidth={5} />
          <rect x={-46} y={-8} width={92} height={80} rx={34} fill={on ? hi : "#3a3f63"} stroke={INKC} strokeWidth={5} />
          {on && <Eyes x={0} y={-50} s={0.9} />}
        </g>
      );
    })}
  </g>
);
const S4_Guess: React.FC<{ f: number }> = ({ f }) => {
  const g = eio(ramp(f, F.half - 8, F.half + 22));
  return (
    <g>
      <rect width={VW} height={VH} fill={NAVY} />
      <Drift f={f} n={30} color="#7b5cff" seed="g4" maxR={3} speed={0.4} opacity={0.4} />
      <Chip x={540} y={300} w={600} label="HOW MANY NOTICED?" hue="#7b5cff" p={pop(f, F.guessed, 10)} fs={40} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#cfd3e6" opacity={pop(f, F.guess, 8)}>THE STUDENTS' GUESS</text>
      <Crowd10 f={f} lit={g * 5} y={580} hi={PINK} />
      <Bar x={110} y={930} w={860} p={g * 0.5} hue={PINK} label="GUESS" val={`${Math.round(g * 50)}%`} f={f} at={F.guess} />
      <g transform="translate(880 1500) scale(-0.9 0.9)"><Person d={HOST} f={f} seed={18} talk={talkFor(f, "host", SPK, ENV)} wave={f > F.half ? 1 : 0} /></g>
    </g>
  );
};
const S5_Real: React.FC<{ f: number }> = ({ f }) => {
  const r = eio(ramp(f, F.quarter, F.quarter + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill={NAVY} />
      <Drift f={f} n={30} color={TEAL} seed="g5" maxR={3} speed={0.4} opacity={0.4} />
      <Chip x={540} y={300} w={460} label="THE REAL NUMBER" hue={TEAL} p={pop(f, F.real, 10)} fs={40} textColor={INKC} />
      <Crowd10 f={f} lit={r * 2.5} y={640} hi={TEAL} />
      <Bar x={110} y={1000} w={860} p={0.5} hue={PINK} label="GUESS" val="50%" f={f} at={F.real - 30} />
      <Bar x={110} y={1220} w={860} p={r * 0.25} hue={TEAL} label="REALITY" val={`${Math.round(r * 25)}%`} f={f} at={F.quarter} />
      {f >= F.twice && <BigNum f={f} at={F.twice} text="2× OVERESTIMATE" x={540} y={520} hue={YEL} fs={84} />}
      {f >= F.asDid && <Stamp f={f} at={F.asDid} x={540} y={1450} text="NOBODY CARED" hue={RED} fs={64} rot={-6} />}
    </g>
  );
};
const S6_Effect: React.FC<{ f: number }> = ({ f }) => {
  const orbit = ramp(f, F.center, F.center + 40);
  return (
    <g>
      <rect width={VW} height={VH} fill="#120c2c" />
      <Drift f={f} n={40} color="#fff4b8" seed="g6" maxR={2.5} speed={0.25} opacity={0.4} />
      <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.called, 12)}>THE SPOTLIGHT</text>
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.called + 8, 12)}>EFFECT</text>
      {/* your world orbit */}
      {f >= F.center && [0, 1, 2].map((k) => (
        <ellipse key={k} cx={540} cy={1180} rx={(200 + k * 120) * eout(orbit)} ry={(50 + k * 30) * eout(orbit)} fill="none" stroke={YEL} strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={-f * (2 + k)} opacity={0.7 - k * 0.15} />
      ))}
      {f >= F.everyone && [0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2 + f * 0.012;
        const x = 540 + Math.cos(a) * 420, y = 1080 + Math.sin(a) * 300;
        const q = clamp01((f - F.everyone - k * 5) / 14);
        return (
          <g key={k} opacity={q}>
            <line x1={x} y1={y} x2={lerp(x, 540, 0.55)} y2={lerp(y, 1000, 0.55)} stroke={PINK} strokeWidth={6} strokeDasharray="10 10" />
            <circle cx={x} cy={y} r={36} fill="#3a3f63" stroke={INKC} strokeWidth={5} />
            <Eyes x={x} y={y} s={0.9} />
          </g>
        );
      })}
      <Beam x={540} y={1440} w={230} />
      <Student f={f} x={540} y={1440} s={1.2} shirtOn mood="surprised" />
    </g>
  );
};
const S7_Busy: React.FC<{ f: number }> = ({ f }) => {
  const worries = ["MY HAIR!", "MY SHIRT?", "MY TEXT!", "AM I WEIRD?", "MY SHOES...", "DID I SAY THAT?"];
  return (
    <g>
      <Room f={f} dark={0.72} />
      {CROWD.slice(0, 6).map((c, i) => {
        const y = GROUND - 30 - (i > 3 ? 60 : 0);
        const lit = clamp01((f - F.busy - i * 6) / 14);
        return (
          <g key={i}>
            <CrowdPerson f={f} c={c} y={y} lit={lit} />
            {f >= F.worry - 10 && <g transform={`translate(${Math.min(950, Math.max(130, c.x))} ${y - (700 + (i % 2) * 110) * c.s})`} opacity={pop(f, F.worry - 10 + i * 5, 10)}>
              <rect x={-100} y={-34} width={200} height={62} rx={30} fill="#ffffff" stroke={INKC} strokeWidth={4} />
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INKC}>{worries[i]}</text>
            </g>}
          </g>
        );
      })}
      <Chip x={540} y={330} w={560} label="EVERYONE'S BUSY" hue="#7b5cff" p={pop(f, F.busy, 10)} fs={40} />
      <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" opacity={pop(f, F.worry, 10)}>...WITH THEIR OWN SPOTLIGHT</text>
    </g>
  );
};
const S8_Montage: React.FC<{ f: number }> = ({ f }) => {
  const fadeAll = ramp(f, F.nobody, F.nobody + 25);
  const item = (at: number, y: number, label: string, icon: React.ReactNode, hue: string) => (
    <g opacity={pop(f, at, 10) * (1 - fadeAll * 0.85)} transform={`translate(540 ${y}) rotate(${(at % 2 ? 1 : -1) * 3}) scale(${1 - fadeAll * 0.15})`}>
      <rect x={-400} y={-110} width={800} height={220} rx={30} fill="#ffffff" stroke={INKC} strokeWidth={6} />
      {icon}
      <text x={-170} y={22} fontFamily={FONT} fontWeight={800} fontSize={54} fill={hue}>{label}</text>
      {fadeAll > 0 && <line x1={-380} y1={0} x2={lerp(-380, 380, eout(fadeAll))} y2={0} stroke={RED} strokeWidth={14} strokeLinecap="round" />}
    </g>
  );
  return (
    <g>
      <rect width={VW} height={VH} fill="#1f1650" />
      <Drift f={f} n={30} color="#ffffff" seed="g8" maxR={2} speed={0.5} opacity={0.3} />
      {item(F.hair, 520, "BAD HAIR DAY", <IconHair x={-280} y={10} />, "#7b5cff")}
      {item(F.mistake, 820, "MEETING MISTAKE", <IconMeeting x={-280} y={0} />, PINK)}
      {f >= F.nobody && <BigNum f={f} at={F.nobody + 6} text="NOBODY REMEMBERS" x={540} y={1120} hue={YEL} fs={76} />}
      <Host f={f} x={150} y={1570} s={0.68} mood="happy" />
    </g>
  );
};
const S9_DoIt: React.FC<{ f: number }> = ({ f }) => {
  const shrink = ramp(f, F.goAhead, F.goAhead + 30);
  const click = F.doIt + 4;
  const pressed = f >= click;
  return (
    <g>
      <Room f={f} dark={lerp(0.6, 0.15, shrink)} />
      <Beam x={540} y={GROUND} w={lerp(260, 90, eout(shrink))} o={1 - shrink * 0.6} />
      <g transform={`translate(540 600) scale(${pop(f, F.goAhead + 6, 12) * (pressed && f < click + 5 ? 0.92 : 1)})`}>
        <rect x={-300} y={-80} width={600} height={160} rx={80} fill={pressed ? TEAL : YEL} stroke={INKC} strokeWidth={8} />
        <rect x={-300} y={pressed ? -72 : -80} width={600} height={pressed ? 140 : 140} rx={70} fill={pressed ? TEAL : YEL} />
        <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={INKC} letterSpacing={3}>DO THE THING</text>
      </g>
      {f >= F.goAhead + 14 && <Cursor x={lerp(900, 640, eio(ramp(f, F.goAhead + 14, click)))} y={lerp(1000, 640, eio(ramp(f, F.goAhead + 14, click)))} f={f} clickAt={click} />}
      {pressed && [...Array(18)].map((_, i) => {
        const q = clamp01((f - click) / 30); const a = rnd("cf" + i) * Math.PI * 2;
        return <rect key={i} x={540 + Math.cos(a) * 420 * q} y={600 + Math.sin(a) * 300 * q + 200 * q * q} width={16} height={10} fill={[YEL, PINK, TEAL][i % 3]} opacity={1 - q} transform={`rotate(${i * 40 + q * 300} ${540 + Math.cos(a) * 420 * q} ${600 + Math.sin(a) * 300 * q})`} />;
      })}
      <Student f={f} x={540} y={GROUND} s={1.3} shirtOn mood="happy" wave={pressed ? 1 : 0} />
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} dark={0.55} />
    <Student f={f} x={160} y={1570} s={0.78} shirtOn mood="happy" wave={1} />
    <Host f={f} x={920} y={1570} s={0.78} mood="happy" />
    <Outro f={f} at={F.sub} />
  </g>
);

export const SpotlightFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.y2000, render: () => <S1_Hook f={f} />, cam: [[0, { x: 540, y: 1050, z: 1.35 }], [F.much, { x: 540, y: 960, z: 1.12 }], [F.y2000, { x: 540, y: 900, z: 1.0 }]] },
    { from: F.y2000, to: F.walked, tr: "whip", render: () => <S2_Study f={f} />, cam: [[F.y2000, { x: 540, y: 420, z: 1.25 }], [F.y2000 + 120, { x: 540, y: 760, z: 1.05 }], [F.y2000 + 190, { x: 560, y: 900, z: 1.15 }], [F.walked, { x: 560, y: 960, z: 1.08 }]] },
    { from: F.walked, to: F.guessed, tr: "iris", render: () => <S3_Room f={f} />, cam: [[F.walked, { x: 300, y: 1100, z: 1.2 }], [F.walked + 60, { x: 540, y: 1050, z: 1.12 }], [F.staring, { x: 540, y: 880, z: 1.28, r: -1.5 }], [F.guessed, { x: 540, y: 960, z: 1.0, r: 0 }]] },
    { from: F.guessed, to: F.quarter, tr: "wipe", render: () => <S4_Guess f={f} />, cam: [[F.guessed, { x: 540, y: 420, z: 1.2 }], [F.half, { x: 540, y: 900, z: 1.05 }], [F.quarter, { x: 540, y: 1000, z: 1.12 }]] },
    { from: F.quarter, to: F.called, tr: "flash", render: () => <S5_Real f={f} />, cam: [[F.quarter, { x: 540, y: 1100, z: 1.15 }], [F.twice, { x: 540, y: 800, z: 1.05 }], [F.called, { x: 540, y: 1100, z: 1.1 }]] },
    { from: F.called, to: F.busy, tr: "zoom", render: () => <S6_Effect f={f} />, cam: [[F.called, { x: 540, y: 560, z: 1.18 }], [F.center, { x: 540, y: 900, z: 1.08 }], [F.busy, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.busy, to: F.hair, tr: "push", render: () => <S7_Busy f={f} />, cam: [[F.busy, { x: 300, y: 1000, z: 1.2 }], [F.worry + 10, { x: 760, y: 960, z: 1.12 }], [F.hair, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.hair, to: F.goAhead, tr: "whipUp", render: () => <S8_Montage f={f} />, cam: [[F.hair, { x: 540, y: 560, z: 1.18 }], [F.mistake, { x: 540, y: 820, z: 1.15 }], [F.nobody + 10, { x: 540, y: 1000, z: 1.05 }], [F.goAhead, { x: 540, y: 1100, z: 1.12 }]] },
    { from: F.goAhead, to: F.sub, tr: "spin", render: () => <S9_DoIt f={f} />, cam: [[F.goAhead, { x: 540, y: 1100, z: 1.3 }], [F.doIt, { x: 540, y: 760, z: 1.1 }], [F.sub, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "zoom", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.staring, 0.1], [F.half, 0.08], [F.quarter + 4, 0.14], [F.twice, 0.1], [F.called, 0.08], [F.nobody + 6, 0.12], [F.doIt + 4, 0.14]];
  const SHAKE: [number, number][] = [[F.y2000 + 186, 12], [F.quarter + 4, 14], [F.asDid, 10], [F.doIt + 4, 12]];
  const SFX: Cue[] = [
    [F.much - 6, "tick", 0.3], [F.y2000 + 10, "pop", 0.35], [F.y2000 + 150, "whoosh", 0.35], [F.y2000 + 186, "impact", 0.5],
    [F.walked + 4, "whoosh", 0.3], [F.staring, "pop", 0.4], [F.guess, "tick", 0.3], [F.half - 8, "riser", 0.25], [F.half + 22, "pop", 0.4],
    [F.quarter + 4, "boom", 0.4], [F.twice, "impact", 0.45], [F.asDid, "impact", 0.45], [F.called, "pop", 0.35], [F.everyone, "riser", 0.2],
    [F.busy + 4, "pop", 0.3], [F.worry - 10, "tick", 0.3], [F.hair, "pop", 0.4], [F.mistake, "pop", 0.4], [F.nobody + 6, "impact", 0.45],
    [F.goAhead + 6, "pop", 0.4], [F.doIt + 4, "click", 0.7], [F.doIt + 6, "boom", 0.3], [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.guessed ? YEL : f < F.called ? PINK : f < F.hair ? TEAL : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="SPOTLIGHT" sub="NOBODY IS LOOKING AT YOU" until={F.y2000 - 10} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="spotlight" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
