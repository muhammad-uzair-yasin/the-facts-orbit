import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Drift, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

const F = { hook: 17, y1912: 106, died: 207, found: 292, deep: 393, saw: 453, nobones: 528, notone: 565, why: 602, creatures: 634, water: 713,
  ballard: 770, dissolve: 978, clue: 1063, pairs: 1139, side: 1212, leather: 1251, rest: 1314, sub: 1412 };
const NAVY = "#06122b", DEEP = "#020814", ICE = "#cfefff", CYAN = "#7fd8ff", SEPIA = "#d9c49a", RED = "#e4473b";
const DIVER = CAST[46], HIST = CAST[45];

// ---------- set pieces ----------
const NightSky: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020617" /><stop offset="1" stopColor="#13284f" /></linearGradient>
      <linearGradient id="nsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d2148" /><stop offset="1" stopColor="#030a1c" /></linearGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#nsky)" />
    {[...Array(60)].map((_, i) => <circle key={i} cx={rnd("st" + i) * VW} cy={rnd("sy" + i) * 900} r={1 + rnd("sr" + i) * 2} fill="#fff" opacity={0.3 + 0.6 * Math.abs(Math.sin(f * 0.04 + i))} />)}
    <circle cx={820} cy={300} r={60} fill="#eef6ff" opacity={0.9} />
    <circle cx={820} cy={300} r={140} fill="#eef6ff" opacity={0.08} />
    <rect y={1000} width={VW} height={VH - 1000} fill="url(#nsea)" />
    {[...Array(16)].map((_, i) => <path key={i} d={`M${((i * 97 + f * 1.2) % 1240) - 80} ${1030 + (i % 6) * 70} q 30 -10 60 0`} stroke="#3c6aa8" strokeWidth={4} fill="none" opacity={0.5} />)}
    <path d={`M760 1000 L820 1000 L790 ${1000 + 500}`} fill="#eef6ff" opacity={0.06} />
  </g>
);
const Liner: React.FC<{ x: number; y: number; s?: number; tilt?: number; f: number; lights?: number }> = ({ x, y, s = 1, tilt = 0, f, lights = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={-210 + i * 110} y={-210} width={52} height={120} rx={4} fill="#e1b25a" stroke="#0a0a12" strokeWidth={5} />
        <rect x={-210 + i * 110} y={-210} width={52} height={30} fill="#111" />
      </g>
    ))}
    <rect x={-300} y={-100} width={600} height={60} fill="#f2efe6" stroke="#0a0a12" strokeWidth={5} />
    <path d="M-380 -40 H400 L360 70 H-340 Z" fill="#14141c" stroke="#0a0a12" strokeWidth={5} />
    <path d="M-345 40 H363 L360 70 H-340 Z" fill="#8c1f1f" />
    {[...Array(14)].map((_, i) => <circle key={i} cx={-320 + i * 50} cy={-8} r={6} fill="#ffd77a" opacity={lights * (0.6 + 0.4 * Math.sin(f * 0.2 + i))} />)}
    {[...Array(10)].map((_, i) => <rect key={i} x={-280 + i * 58} y={-86} width={24} height={14} fill="#ffd77a" opacity={lights * 0.8} />)}
  </g>
);
const Iceberg: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-160 0 L-110 -150 L-60 -110 L-10 -230 L50 -130 L100 -170 L170 0 Z" fill={ICE} stroke="#0a0a12" strokeWidth={5} />
    <path d="M-10 -230 L50 -130 L100 -170 L170 0 H20 Z" fill="#9cd0ec" />
    <path d="M-200 0 Q0 160 220 0 Z" fill="#7fb5d6" opacity={0.25} />
  </g>
);
/** Ocean column whose depth shifts with `depth` 0..1 (surface → seabed). */
const Ocean: React.FC<{ f: number; depth: number }> = ({ f, depth }) => {
  const top = mix("#1e5fa8", DEEP, Math.min(1, depth * 1.6));
  const bot = mix("#0b2a5a", "#000000", Math.min(1, depth * 1.2));
  return (
    <g>
      <defs><linearGradient id="ocn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#ocn)" />
      {depth < 0.35 && [...Array(5)].map((_, i) => <path key={i} d={`M${100 + i * 220} 0 L${60 + i * 220 + Math.sin(f * 0.02 + i) * 30} ${VH * 0.7} L${160 + i * 220} 0 Z`} fill="#bfe6ff" opacity={0.05 * (1 - depth * 2.8)} />)}
      <Drift f={f} n={45} color="#dcefff" seed="snow" maxR={2.2} speed={-0.5} opacity={0.45} />
    </g>
  );
};
const Bubbles: React.FC<{ f: number; x: number; y: number; n?: number }> = ({ f, x, y, n = 8 }) => (
  <g>{[...Array(n)].map((_, i) => { const q = ((f * 0.015 + i / n) % 1); return <circle key={i} cx={x + Math.sin(f * 0.1 + i) * 14 + (i % 3) * 10} cy={y - q * 500} r={4 + (i % 3) * 3} fill="none" stroke="#cfefff" strokeWidth={2.5} opacity={1 - q} />; })}</g>
);
const Sub: React.FC<{ x: number; y: number; f: number; beam?: number; dir?: number }> = ({ x, y, f, beam = 1, dir = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.05) * 6})`}>
    <g transform={`rotate(${dir})`} style={{ mixBlendMode: "screen" }}>
      <path d="M40 30 L330 330 L-250 330 Z" fill="#cfefff" opacity={0.16 * beam} />
      <path d="M40 30 L230 330 L-150 330 Z" fill="#e8f8ff" opacity={0.14 * beam} />
    </g>
    <ellipse rx={110} ry={58} fill="#f2c13a" stroke="#0a0a12" strokeWidth={6} />
    <circle cx={42} cy={-4} r={30} fill="#7fd8ff" stroke="#0a0a12" strokeWidth={6} />
    <circle cx={50} cy={-12} r={8} fill="#fff" opacity={0.7} />
    <rect x={-150} y={-16} width={44} height={32} rx={8} fill="#c99a2a" stroke="#0a0a12" strokeWidth={5} />
    <rect x={-20} y={-80} width={40} height={26} rx={6} fill="#c99a2a" stroke="#0a0a12" strokeWidth={5} />
    <circle cx={90} cy={30} r={9} fill="#fff" />
  </g>
);
const Seabed: React.FC<{ y?: number }> = ({ y = 1350 }) => (
  <g>
    <path d={`M0 ${y} Q 270 ${y - 40} 540 ${y - 10} T 1080 ${y - 20} V ${VH} H 0 Z`} fill="#141a24" />
    {[...Array(26)].map((_, i) => <ellipse key={i} cx={rnd("sb" + i) * VW} cy={y + 20 + rnd("sby" + i) * 400} rx={6 + rnd("sbr" + i) * 14} ry={3 + rnd("sbr" + i) * 5} fill="#222b38" />)}
  </g>
);
const ShoePair: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.35 + 0.65 * lit}>
    {[-26, 26].map((dx, i) => (
      <g key={i} transform={`translate(${dx} ${i * 4}) rotate(${i ? 4 : -4})`}>
        <path d="M-22 10 Q-26 -14 -6 -16 L10 -14 Q32 -8 34 8 Q20 16 -22 10 Z" fill="#4a3426" stroke="#0a0a12" strokeWidth={4} />
        <path d="M-10 -14 Q0 -6 10 -12" stroke="#2a1d14" strokeWidth={3} fill="none" />
      </g>
    ))}
  </g>
);
const Coat: React.FC<{ x: number; y: number; r?: number; s?: number; c?: string; o?: number }> = ({ x, y, r = 0, s = 1, c = "#3a3550", o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <path d="M-50 -30 L-20 -40 L0 -20 L20 -40 L50 -30 L60 30 L-60 30 Z" fill={c} stroke="#0a0a12" strokeWidth={4} />
    <path d="M0 -20 V30" stroke="#0a0a12" strokeWidth={3} />
  </g>
);
const Crab: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x + Math.sin(f * 0.08) * 20} ${y}) scale(${s})`}>
    {[-1, 1].map((k) => [0, 1, 2].map((j) => <path key={`${k}${j}`} d={`M${k * 20} ${4 + j * 6} q ${k * 20} ${-8 + Math.sin(f * 0.4 + j) * 4} ${k * 34} 6`} stroke="#c85a3a" strokeWidth={5} fill="none" />))}
    <ellipse rx={30} ry={18} fill="#d8693f" stroke="#0a0a12" strokeWidth={4} />
    <circle cx={-8} cy={-20} r={5} fill="#0a0a12" /><circle cx={8} cy={-20} r={5} fill="#0a0a12" />
    <path d={`M-30 -6 q -20 -24 -6 -34 M30 -6 q 20 -24 6 -34`} stroke="#c85a3a" strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
const Fish: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#3d5a80" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-40 0 Q0 -24 34 0 Q0 24 -40 0 Z M34 0 L56 -16 L56 16 Z" fill={c} opacity={0.85} /><circle cx={-22} cy={-4} r={3} fill="#cfefff" /></g>
);

// ---------- shots ----------
const S1: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightSky f={f} />
    <Iceberg x={860} y={1010} s={1.1} />
    <Liner x={lerp(380, 470, clamp01(f / 106))} y={990} s={0.62} f={f} />
    <path d={`M80 1000 Q 300 ${1020} 640 1000`} stroke="#9fc2ff" strokeWidth={3} fill="none" opacity={0.3} />
    <g transform="translate(300 1560)"><Person d={DIVER} f={f} seed={4.7} talk={talkFor(f, "host", SPK, ENV)} mood="neutral" /></g>
  </g>
);
const S2: React.FC<{ f: number }> = ({ f }) => {
  const sink = eio(ramp(f, F.died - 10, F.found));
  const n = countUp(f, F.died + 4, F.died + 50, 1500);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1b140e" />
      <rect x={0} y={1380} width={VW} height={540} fill="#2a1f15" />
      {[...Array(9)].map((_, i) => <rect key={i} x={i * 130} y={0} width={4} height={1380} fill="#241a12" />)}
      {/* old photograph frame */}
      <g transform={`translate(540 640) rotate(${-3 + Math.sin(f * 0.02) * 1})`}>
        <rect x={-380} y={-300} width={760} height={560} fill="#f1e6cb" stroke="#0a0a12" strokeWidth={6} />
        <clipPath id="photo"><rect x={-350} y={-270} width={700} height={500} /></clipPath>
        <g clipPath="url(#photo)">
          <rect x={-350} y={-270} width={700} height={500} fill={mix(SEPIA, "#5a4630", 0.25)} />
          <rect x={-350} y={60} width={700} height={170} fill={mix(SEPIA, "#3a2a1a", 0.45)} />
          <g transform={`translate(${lerp(-20, 30, sink)} ${lerp(40, 230, sink)}) rotate(${lerp(0, -32, sink)})`}>
            <g transform="scale(0.72)" opacity={0.9}>
              <Liner x={0} y={0} f={f} lights={1 - sink} />
            </g>
          </g>
          <rect x={-350} y={60 + 0} width={700} height={170} fill={mix(SEPIA, "#3a2a1a", 0.45)} opacity={0.65 * sink} />
          {[...Array(40)].map((_, i) => <circle key={i} cx={-350 + rnd("gr" + i) * 700} cy={-270 + rnd("gy" + i) * 500} r={1.5} fill="#3a2a1a" opacity={0.4} />)}
        </g>
      </g>
      <BigNum f={f} at={F.y1912 + 20} text="1912" x={540} y={290} hue={SEPIA} fs={150} />
      {f >= F.died && (
        <g>
          <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke">{n >= 1500 ? "1,500+" : n.toLocaleString("en-US")}</text>
          <text x={540} y={1120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={SEPIA} letterSpacing={6} opacity={pop(f, F.died + 30, 10)}>LIVES LOST</text>
        </g>
      )}
      <g transform="translate(830 1580)"><Person d={HIST} f={f} seed={2.1} talk={talkFor(f, "guest", SPK, ENV)} mood="neutral" /></g>
      <g transform="translate(220 1600) scale(0.92)"><Person d={DIVER} f={f} seed={4.7} talk={0} mood="neutral" /></g>
    </g>
  );
};
const S3: React.FC<{ f: number }> = ({ f }) => {
  const sweep = (f * 3) % 360;
  const ping = f >= F.found + 40;
  return (
    <g>
      <rect width={VW} height={VH} fill="#02140f" />
      <g transform="translate(540 820)">
        <circle r={420} fill="#03251a" stroke="#1fd38a" strokeWidth={6} />
        {[100, 200, 300].map((r) => <circle key={r} r={r} fill="none" stroke="#1fd38a" strokeWidth={2} opacity={0.4} />)}
        <line x1={-420} y1={0} x2={420} y2={0} stroke="#1fd38a" strokeWidth={2} opacity={0.4} />
        <line x1={0} y1={-420} x2={0} y2={420} stroke="#1fd38a" strokeWidth={2} opacity={0.4} />
        <path d={`M0 0 L${420 * Math.cos((sweep * Math.PI) / 180)} ${420 * Math.sin((sweep * Math.PI) / 180)} A420 420 0 0 0 ${420 * Math.cos(((sweep - 40) * Math.PI) / 180)} ${420 * Math.sin(((sweep - 40) * Math.PI) / 180)} Z`} fill="#1fd38a" opacity={0.25} />
        {ping && (
          <g transform="translate(150 -120)">
            {[0, 1].map((k) => { const q = ((f - F.found - 40 + k * 15) % 40) / 40; return <circle key={k} r={10 + q * 80} fill="none" stroke="#7dffc4" strokeWidth={4} opacity={1 - q} />; })}
            <circle r={12} fill="#7dffc4" />
            <text x={30} y={-24} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#7dffc4">WRECK FOUND</text>
          </g>
        )}
      </g>
      <BigNum f={f} at={F.found + 6} text="1985" x={540} y={290} hue="#7dffc4" fs={150} />
      <Chip x={540} y={1200} w={460} label="SONAR · NORTH ATLANTIC" hue="#1fd38a" p={pop(f, F.found + 30, 10)} fs={30} dark />
    </g>
  );
};
const S4: React.FC<{ f: number }> = ({ f }) => {
  const d = eio(ramp(f, F.deep - 4, F.saw + 20));
  const meters = Math.round(d * 3800);
  const subY = lerp(560, 760, d);
  const zones = [["SUNLIGHT", 0], ["TWILIGHT", 0.06], ["MIDNIGHT", 0.27], ["ABYSS", 0.8]] as const;
  const zone = [...zones].reverse().find(([, z]) => d >= z)?.[0] ?? "SUNLIGHT";
  return (
    <g>
      <Ocean f={f} depth={d} />
      {d > 0.75 && <g opacity={ramp(f, F.saw - 30, F.saw)}><Seabed y={1260} /></g>}
      {f >= F.saw - 10 && (
        <g opacity={ramp(f, F.saw - 10, F.saw + 10)}>
          <Coat x={330} y={1300} r={-12} />
          <ShoePair x={520} y={1320} s={1.2} />
          <Coat x={740} y={1290} r={8} c="#4a3a2a" />
          <g transform="translate(860 1320)"><rect x={-40} y={-30} width={80} height={50} rx={8} fill="#5a4630" stroke="#0a0a12" strokeWidth={4} /><rect x={-14} y={-42} width={28} height={14} rx={4} fill="none" stroke="#0a0a12" strokeWidth={4} /></g>
        </g>
      )}
      <Sub x={540} y={subY} f={f} beam={0.4 + d * 0.8} />
      <Bubbles f={f} x={420} y={subY - 40} />
      {/* depth meter */}
      <g transform="translate(940 300)">
        <rect x={-30} y={0} width={60} height={760} rx={30} fill="rgba(0,0,0,0.45)" stroke={CYAN} strokeWidth={4} />
        <rect x={-18} y={12} width={36} height={736 * d} rx={18} fill={CYAN} opacity={0.85} />
        {[0, 1000, 2000, 3000].map((m) => <text key={m} x={-46} y={14 + (m / 3800) * 736} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#9fc2ff">{m}</text>)}
      </g>
      <g transform="translate(470 300)">
        <rect x={-260} y={-70} width={520} height={140} rx={24} fill="rgba(2,8,20,0.75)" stroke={CYAN} strokeWidth={4} />
        <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#fff">{meters.toLocaleString("en-US")} M</text>
      </g>
      <Chip x={470} y={440} w={300} label={zone + " ZONE"} hue={CYAN} p={1} fs={28} dark />
      {f >= F.saw && <Chip x={540} y={1180} w={560} label="SHOES · COATS · BELONGINGS" hue="#ffd77a" p={pop(f, F.saw + 6, 10)} fs={30} dark />}
    </g>
  );
};
const S5: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill={DEEP} />
    <Drift f={f} n={40} color="#dcefff" seed="snow2" maxR={2} speed={-0.4} opacity={0.4} />
    <g style={{ mixBlendMode: "screen" }}><ellipse cx={540} cy={1180} rx={480} ry={560} fill="#9fd8ff" opacity={0.07} /></g>
    <Seabed y={1380} />
    <ShoePair x={760} y={1420} s={1.1} lit={0.8} />
    <Coat x={300} y={1410} r={-14} o={0.8} />
    <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={130} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.nobones, 10)}>NO BONES.</text>
    <text x={540} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={RED} stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.notone, 10)}>NOT ONE.</text>
    <g transform="translate(540 1580)"><Person d={DIVER} f={f} seed={4.7} talk={talkFor(f, "host", SPK, ENV)} mood={f >= F.notone ? "surprised" : "neutral"} /></g>
  </g>
);
const S6: React.FC<{ f: number }> = ({ f }) => {
  const eat = ramp(f, F.creatures + 10, F.water);
  return (
    <g>
      <rect width={VW} height={VH} fill={DEEP} />
      <Drift f={f} n={40} color="#dcefff" seed="snow3" maxR={2} speed={-0.4} opacity={0.4} />
      <g style={{ mixBlendMode: "screen" }}><path d="M780 200 L1080 1500 L300 1500 Z" fill="#cfefff" opacity={0.07} /></g>
      <Seabed y={1300} />
      <Coat x={560} y={1290} r={-6} s={1.5} o={1 - eat * 0.7} />
      {f >= F.creatures && (
        <g opacity={pop(f, F.creatures, 12)}>
          <Crab x={420} y={1320} f={f} s={1.1} />
          <Crab x={700} y={1330} f={f + 30} s={0.9} />
          <Fish x={lerp(1180, -100, ((f - F.creatures) / 140) % 1)} y={900} s={1.4} />
          <Fish x={lerp(-140, 1180, ((f - F.creatures) / 180) % 1)} y={1050} s={1} c="#2c4a6e" />
          {[...Array(10)].map((_, i) => { const q = ((f * 0.02 + i * 0.1) % 1); return <circle key={i} cx={560 + Math.sin(i * 2) * 60} cy={1280 - q * 200} r={3} fill="#cfefff" opacity={(1 - q) * eat} />; })}
        </g>
      )}
      <Chip x={540} y={420} w={600} label="DEPTH: 3,800 M · NO LIGHT" hue={CYAN} p={pop(f, F.why + 4, 10)} fs={30} dark />
      <text x={540} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.creatures + 4, 10)}>SEA LIFE TAKES</text>
      <text x={540} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill="#ffb86b" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.creatures + 14, 10)}>EVERYTHING SOFT</text>
      {f >= F.water && <Chip x={540} y={800} w={560} label="THEN THE WATER TAKES OVER" hue={CYAN} p={pop(f, F.water, 10)} fs={28} />}
      <g transform="translate(170 1590) scale(0.9)"><Person d={DIVER} f={f} seed={4.7} talk={talkFor(f, "host", SPK, ENV)} mood="neutral" /></g>
    </g>
  );
};
const S7: React.FC<{ f: number }> = ({ f }) => {
  const meter = lerp(0.85, 0.12, eio(ramp(f, F.ballard + 120, F.ballard + 180)));
  const dis = ramp(f, F.dissolve, F.dissolve + 70);
  return (
    <g>
      <rect width={VW} height={VH} fill="#04101f" />
      {[...Array(14)].map((_, i) => <line key={i} x1={0} y1={i * 140} x2={VW} y2={i * 140} stroke="#0f2340" strokeWidth={2} />)}
      {/* quote card */}
      <g transform="translate(540 430)" opacity={pop(f, F.ballard + 4, 12)}>
        <rect x={-440} y={-190} width={880} height={380} rx={28} fill="#0a1c36" stroke={CYAN} strokeWidth={4} />
        <text x={-390} y={-110} fontFamily={FONT} fontWeight={800} fontSize={120} fill={CYAN} opacity={0.5}>“</text>
        <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">The deep ocean lacks</text>
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">the minerals that keep</text>
        <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffd77a">bones intact.</text>
        <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#9fc2ff">— Robert Ballard (paraphrased), found the wreck</text>
      </g>
      {/* mineral meter */}
      <g transform="translate(540 820)" opacity={pop(f, F.ballard + 100, 12)}>
        <text x={-380} y={-20} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#9fc2ff" letterSpacing={3}>MINERALS IN WATER</text>
        <rect x={-380} y={0} width={760} height={56} rx={28} fill="#0a1c36" stroke={CYAN} strokeWidth={4} />
        <rect x={-372} y={8} width={744 * meter} height={40} rx={20} fill={meter < 0.3 ? RED : CYAN} />
        <text x={380} y={110} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={36} fill={meter < 0.3 ? RED : "#fff"}>{meter < 0.3 ? "TOO LOW" : ""}</text>
      </g>
      {/* abstract dissolve: a block of calcium dots scattering into the water */}
      <g transform="translate(540 1180)">
        {[...Array(70)].map((_, i) => {
          const gx = (i % 14) * 18 - 117, gy = Math.floor(i / 14) * 18 - 36;
          const q = clamp01(dis * 1.6 - rnd("dq" + i) * 0.6);
          const x = gx + (rnd("dx" + i) - 0.5) * 420 * q, y = gy - q * (180 + rnd("dy" + i) * 220);
          return <circle key={i} cx={x} cy={y} r={6 * (1 - q * 0.7)} fill="#e9f3ff" opacity={1 - q} />;
        })}
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#9fc2ff" opacity={pop(f, F.dissolve + 10, 10)} letterSpacing={3}>SLOWLY DISSOLVES</text>
      </g>
    </g>
  );
};
const S8: React.FC<{ f: number }> = ({ f }) => {
  const sweep = lerp(-260, 260, eio(ramp(f, F.pairs - 20, F.rest + 40)));
  const pairs: [number, number, number][] = [[210, 1300, 1.4], [450, 1350, 1.6], [690, 1290, 1.35], [900, 1340, 1.5], [330, 1470, 1.7], [760, 1480, 1.75]];
  return (
    <g>
      <rect width={VW} height={VH} fill="#01050e" />
      <Drift f={f} n={50} color="#dcefff" seed="snow4" maxR={2} speed={-0.3} opacity={0.35} />
      <Seabed y={1240} />
      <g style={{ mixBlendMode: "screen" }}>
        <path d={`M540 300 L${540 + sweep + 260} 1550 L${540 + sweep - 260} 1550 Z`} fill="#dff4ff" opacity={0.13} />
        <ellipse cx={540 + sweep} cy={1400} rx={300} ry={110} fill="#dff4ff" opacity={0.12} />
      </g>
      {pairs.map(([x, y, s], i) => {
        const lit = clamp01(1 - Math.abs(x - (540 + sweep)) / 320);
        return <g key={i} opacity={pop(f, F.pairs + i * 6, 12)}><ShoePair x={x} y={y} s={s} lit={0.25 + lit * 0.75} /></g>;
      })}
      <g opacity={pop(f, F.clue, 14)}>
        <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">ONE HEARTBREAKING CLUE</text>
      </g>
      {f >= F.side && <Chip x={540} y={560} w={420} label="SIDE BY SIDE" hue="#ffd77a" p={pop(f, F.side, 10)} fs={34} dark />}
      {f >= F.leather && <Chip x={540} y={680} w={620} label="TANNED LEATHER RESISTS DECAY" hue={CYAN} p={pop(f, F.leather, 10)} fs={28} dark />}
      {f >= F.rest && <text x={540} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#cfe4ff" opacity={eout(ramp(f, F.rest, F.rest + 30)) * 0.95} letterSpacing={2}>each pair · one person</text>}
    </g>
  );
};
const S9: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightSky f={f} />
    <g opacity={0.35}><Liner x={540} y={990} s={0.5} f={f} lights={0.4} /></g>
    <rect width={VW} height={VH} fill="#000" opacity={0.3} />
    <Outro f={f} at={F.sub} />
    <g transform="translate(130 1600) scale(0.78)"><Person d={DIVER} f={f} seed={4.7} talk={talkFor(f, "host", SPK, ENV)} wave={1} mood="happy" /></g>
  </g>
);

export const TitanicFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.y1912, render: () => <S1 f={f} />, cam: [[0, { x: 600, y: 980, z: 1.28 }], [70, { x: 560, y: 1000, z: 1.12 }], [F.y1912, { x: 520, y: 1050, z: 1.08, r: -1 }]] },
    { from: F.y1912, to: F.found, tr: "push", render: () => <S2 f={f} />, cam: [[F.y1912, { x: 540, y: 520, z: 1.25 }], [F.died - 10, { x: 540, y: 680, z: 1.08 }], [F.found, { x: 540, y: 900, z: 1.12, r: 1 }]] },
    { from: F.found, to: F.deep, tr: "flash", render: () => <S3 f={f} />, cam: [[F.found, { x: 540, y: 820, z: 1.0 }], [F.found + 45, { x: 620, y: 740, z: 1.12 }], [F.deep, { x: 680, y: 700, z: 1.25 }]] },
    { from: F.deep, to: F.nobones, tr: "whipUp", render: () => <S4 f={f} />, cam: [[F.deep, { x: 520, y: 520, z: 1.2 }], [F.saw - 20, { x: 540, y: 780, z: 1.1 }], [F.nobones, { x: 540, y: 1100, z: 1.22 }]] },
    { from: F.nobones, to: F.why, tr: "zoom", render: () => <S5 f={f} />, cam: [[F.nobones, { x: 540, y: 700, z: 1.15 }], [F.why, { x: 540, y: 860, z: 1.05 }]] },
    { from: F.why, to: F.ballard, tr: "wipe", render: () => <S6 f={f} />, cam: [[F.why, { x: 540, y: 600, z: 1.18 }], [F.creatures + 30, { x: 560, y: 1050, z: 1.2 }], [F.ballard, { x: 520, y: 900, z: 1.08, r: -1 }]] },
    { from: F.ballard, to: F.clue, tr: "iris", render: () => <S7 f={f} />, cam: [[F.ballard, { x: 540, y: 430, z: 1.25 }], [F.ballard + 100, { x: 540, y: 600, z: 1.08 }], [F.dissolve, { x: 540, y: 1000, z: 1.12 }], [F.clue, { x: 540, y: 1080, z: 1.22 }]] },
    { from: F.clue, to: F.sub, tr: "zoom", trLen: 18, render: () => <S8 f={f} />, cam: [[F.clue, { x: 540, y: 560, z: 1.2 }], [F.pairs + 20, { x: 540, y: 1000, z: 1.05 }], [F.rest, { x: 540, y: 1180, z: 1.16, r: 1.2 }], [F.sub, { x: 540, y: 1000, z: 1.05 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S9 f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.y1912 + 20, 0.08], [F.died + 30, 0.1], [F.found + 6, 0.12], [F.nobones, 0.1], [F.notone, 0.14], [F.creatures + 14, 0.07], [F.dissolve + 10, 0.08], [F.side, 0.06]];
  const SHAKE: [number, number][] = [[F.found + 6, 10], [F.notone, 12]];
  const SFX: Cue[] = [
    [F.y1912 + 20, "impact", 0.4], [F.died - 10, "riser_dark", 0.3], [F.died + 30, "boom", 0.35],
    [F.found + 6, "boom", 0.4], [F.found + 40, "tick", 0.5], [F.found + 80, "tick", 0.4],
    [F.deep + 4, "riser_dark", 0.22], [F.saw + 6, "pop", 0.3],
    [F.nobones, "impact", 0.45], [F.notone, "boom", 0.4],
    [F.creatures + 4, "pop", 0.25], [F.water, "pop", 0.3],
    [F.ballard + 4, "pop", 0.3], [F.ballard + 160, "tick", 0.4], [F.dissolve, "riser", 0.2],
    [F.pairs, "pop", 0.25], [F.side, "pop", 0.25], [F.leather, "pop", 0.3],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.found ? "#d9a64a" : f < F.clue ? "#2f9bd6" : "#ffd77a";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} handheld={3} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="TITANIC" sub="WHY NO BODIES?" until={F.y1912 - 10} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="titanic" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
