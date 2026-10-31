import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Shots, ShotDef, Figure, FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, blinkAt, VW, VH, INK } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Drift, Outro, countUp, FONT, YEL, INKC } from "./factkit";
import { WORDS, CHUNKS, TOTAL, ENV } from "./words";

// cue frames (from gen_words cue table)
const F = { hook: 17, aliens: 74, slaves: 117, great: 167, nobody: 270, y2013: 355, logbook: 525, merer: 556, team: 668, boat: 742, thirty: 790,
  sledge: 864, painting: 929, y2014: 1066, right: 1147, half: 1199, builders: 1262, village: 1296, paid: 1430, honor: 1480,
  magic: 1524, boats: 1559, brilliant: 1605, sub: 1658 };
const SAND = "#e8b76a", SAND2 = "#d29a4f", STONE = "#d8a65e", STONE_D = "#a8753a", NILE = "#2f7fb5", SKY0 = "#2a1b4a", SKY1 = "#f08a3c", GOLD = "#ffc94a", RED = "#e4473b", TEAL = "#1aa39a";
const GROUND = 1430;
const talk = (f: number) => Math.max(0, ENV[Math.max(0, f - 15)] ?? 0);

// ---------- set pieces ----------
const Sky: React.FC<{ f: number; warm?: number }> = ({ f, warm = 1 }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mix(SKY0, "#3b6fb0", 1 - warm)} />
        <stop offset="0.62" stopColor={mix(SKY1, "#8fc6ef", 1 - warm)} />
        <stop offset="1" stopColor={mix("#ffd28a", "#d9f0ff", 1 - warm)} />
      </linearGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#sky)" />
    <circle cx={760} cy={lerp(980, 900, clamp01(f / 600))} r={130} fill="#ffe7a8" opacity={0.85} />
    <circle cx={760} cy={lerp(980, 900, clamp01(f / 600))} r={210} fill="#ffe7a8" opacity={0.15} />
  </g>
);
const Dunes: React.FC<{ y?: number }> = ({ y = GROUND }) => (
  <g>
    <path d={`M0 ${y - 60} Q 260 ${y - 140} 540 ${y - 70} T 1080 ${y - 90} V ${VH} H 0 Z`} fill={SAND2} />
    <path d={`M0 ${y} Q 300 ${y - 60} 620 ${y - 10} T 1080 ${y - 20} V ${VH} H 0 Z`} fill={SAND} />
    {[...Array(14)].map((_, i) => <path key={i} d={`M${rnd("dn" + i) * VW} ${y + 40 + rnd("dy" + i) * 260} q 40 -10 80 0`} stroke={SAND2} strokeWidth={4} fill="none" opacity={0.6} />)}
  </g>
);
const Pyramid: React.FC<{ x: number; base: number; w: number; built?: number; glow?: number }> = ({ x, base, w, built = 1, glow = 0 }) => {
  const h = w * 0.62;
  const top = base - h * built;
  const cut = w / 2 * (1 - built);
  return (
    <g>
      {glow > 0 && <path d={`M${x - w / 2 - 30} ${base} L${x} ${base - h - 40} L${x + w / 2 + 30} ${base} Z`} fill={GOLD} opacity={0.25 * glow} />}
      <path d={`M${x - w / 2} ${base} L${x - cut} ${top} L${x + cut} ${top} L${x + w / 2} ${base} Z`} fill={STONE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${x} ${base} L${x - cut * 0} ${top} L${x + cut} ${top} L${x + w / 2} ${base} Z`} fill={STONE_D} opacity={0.55} />
      {[...Array(9)].map((_, i) => {
        const yy = base - (i + 1) * h / 10; if (yy < top) return null;
        const hw = w / 2 * (1 - (i + 1) / 10);
        return <line key={i} x1={x - hw} y1={yy} x2={x + hw} y2={yy} stroke={INK} strokeWidth={2} opacity={0.25} />;
      })}
    </g>
  );
};
const Block: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = STONE }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-40} width={120} height={80} rx={6} fill={c} stroke={INK} strokeWidth={5} />
    <path d="M-60 -40 L-44 -54 H76 L60 -40 Z" fill={mix(c, "#fff", 0.25)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M60 -40 L76 -54 V26 L60 40 Z" fill={mix(c, "#000", 0.2)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Hero: React.FC<{ f: number; x: number; y?: number; s?: number; facing?: 1 | -1; mood?: any; armR?: number; elbowR?: number; armL?: number; look?: [number, number]; walk?: number; hat?: boolean }> = (p) => (
  <g>
    <Figure x={p.x} y={p.y ?? GROUND + 40} s={p.s ?? 0.85} facing={p.facing ?? 1} coat={TEAL} mood={p.mood ?? "neutral"} look={p.look ?? [1, 0]}
      blink={blinkAt(p.f, 2)} hair="tuft" armR={(p.armR ?? 20) + Math.sin(p.f * 0.13) * 4 * talk(p.f)} armL={p.armL ?? -30} elbowL={-16} elbowR={p.elbowR ?? 16}
      walk={p.walk} talk={talk(p.f)} />
    {p.hat !== false && (
      <g transform={`translate(${p.x} ${(p.y ?? GROUND + 40) - 352 * (p.s ?? 0.85) - 58 * (p.s ?? 0.85)}) scale(${p.s ?? 0.85})`}>
        <path d="M-84 6 Q0 -10 84 6 Q60 14 0 14 Q-60 14 -84 6Z" fill="#c99a52" stroke={INK} strokeWidth={6} />
        <path d="M-46 6 Q-44 -46 0 -48 Q44 -46 46 6Z" fill="#d8ad66" stroke={INK} strokeWidth={6} />
        <rect x={-46} y={-8} width={92} height={10} fill="#7a4f22" />
      </g>
    )}
  </g>
);
const Worker: React.FC<{ f: number; x: number; y: number; s?: number; seed: number; pull?: boolean; coat?: string }> = ({ f, x, y, s = 0.5, seed, pull, coat = "#f2eee4" }) => (
  <Figure x={x} y={y} s={s} facing={-1} coat={coat} mood="neutral" look={[-1, 0]} blink={blinkAt(f, seed)} hair="none"
    armR={pull ? 70 + Math.sin(f * 0.3 + seed) * 6 : 10} armL={pull ? 60 : -10} elbowR={pull ? -20 : 0} walk={pull ? f * 0.22 + seed : undefined} />
);
const Cross: React.FC<{ x: number; y: number; p: number; r?: number }> = ({ x, y, p, r = 120 }) => (
  <g opacity={clamp01(p * 3)} transform={`translate(${x} ${y})`}>
    <line x1={-r} y1={-r} x2={lerp(-r, r, clamp01(p * 2))} y2={lerp(-r, r, clamp01(p * 2))} stroke={RED} strokeWidth={22} strokeLinecap="round" />
    {p > 0.5 && <line x1={r} y1={-r} x2={lerp(r, -r, clamp01(p * 2 - 1))} y2={lerp(-r, r, clamp01(p * 2 - 1))} stroke={RED} strokeWidth={22} strokeLinecap="round" />}
  </g>
);

// ---------- shots ----------
const S1_Hook: React.FC<{ f: number }> = ({ f }) => {
  const ufoX = lerp(-200, 360, eout(ramp(f, F.aliens - 6, F.aliens + 12)));
  const crossU = ramp(f, F.aliens + 18, F.aliens + 30);
  const crossS = ramp(f, F.slaves + 16, F.slaves + 28);
  return (
    <g>
      <Sky f={f} />
      <Pyramid x={720} base={GROUND - 30} w={760} />
      <Pyramid x={250} base={GROUND - 10} w={420} />
      <Dunes />
      <Drift f={f} n={20} color="#fff3d0" seed="hookdust" maxR={3} speed={0.3} area={[0, 900, VW, 600]} opacity={0.5} />
      {f >= F.aliens - 6 && (
        <g transform={`translate(${ufoX} ${560 + Math.sin(f * 0.2) * 10}) rotate(${-8 + Math.sin(f * 0.1) * 4})`}>
          <path d="M-60 -60 L-110 120 H110 L60 -60 Z" fill="#9dfcff" opacity={0.18} />
          <ellipse rx={130} ry={34} fill="#c9d3e6" stroke={INK} strokeWidth={6} />
          <path d="M-60 -10 Q0 -80 60 -10" fill="#8ee6ff" stroke={INK} strokeWidth={6} />
          {[-80, -30, 30, 80].map((lx, i) => <circle key={i} cx={lx} cy={6} r={8} fill={(f + i * 4) % 16 < 8 ? YEL : "#fff"} />)}
          <Cross x={0} y={-10} p={crossU} r={110} />
        </g>
      )}
      {f >= F.slaves && (
        <g transform="translate(760 520)" opacity={pop(f, F.slaves, 10)}>
          <circle r={115} fill="rgba(10,10,20,0.55)" stroke="#fff" strokeWidth={5} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={-60 + i * 60} cy={0} rx={34} ry={22} fill="none" stroke="#cfd3dc" strokeWidth={13} />)}
          <Cross x={0} y={0} p={crossS} r={100} />
        </g>
      )}
      <Hero f={f} x={250} s={0.92} mood={f > F.aliens ? "sly" : "neutral"} armR={f > F.aliens ? 70 : 25} look={[1, -2]} />
    </g>
  );
};
const S2_Blocks: React.FC<{ f: number }> = ({ f }) => {
  const built = eio(ramp(f, F.great + 6, F.nobody - 6));
  const n = countUp(f, F.great + 10, F.great + 80, 2000000);
  return (
    <g>
      <Sky f={f} warm={0.6} />
      <Dunes />
      <Pyramid x={540} base={GROUND - 20} w={880} built={Math.max(0.05, built)} />
      {[...Array(10)].map((_, i) => {
        const q = clamp01(built * 10 - i); if (q <= 0 || q >= 1) return null;
        return <Block key={i} x={540 + (i % 2 ? 1 : -1) * (120 + i * 18)} y={lerp(200, GROUND - 120 - built * 400, eio(q))} s={0.55} />;
      })}
      <g transform="translate(540 330)">
        <rect x={-330} y={-70} width={660} height={140} rx={24} fill="rgba(20,14,36,0.78)" stroke={GOLD} strokeWidth={4} />
        <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={GOLD}>{n >= 2000000 ? "2,000,000+" : n.toLocaleString("en-US")}</text>
      </g>
      <text x={540} y={450} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" letterSpacing={4}>STONE BLOCKS</text>
      {f >= F.nobody && [0, 1, 2].map((i) => (
        <text key={i} x={180 + i * 70} y={1010 - i * 30 - Math.sin(f * 0.15 + i) * 10} fontFamily={FONT} fontWeight={800} fontSize={90 - i * 12} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.nobody + i * 6, 8)}>?</text>
      ))}
      <Hero f={f} x={200} s={0.8} mood={f >= F.nobody ? "worried" : "surprised"} armR={f >= F.nobody ? 150 : 40} elbowR={f >= F.nobody ? 70 : 10} look={[1, -2]} />
    </g>
  );
};
const S3_Papyrus: React.FC<{ f: number }> = ({ f }) => {
  const unroll = eio(ramp(f, F.y2013 + 30, F.y2013 + 70));
  const lines = ramp(f, F.logbook, F.logbook + 30);
  return (
    <g>
      <rect width={VW} height={VH} fill="#2b1c14" />
      <path d={`M0 0 H${VW} V420 Q 540 520 0 420 Z`} fill="#1d120c" />
      <ellipse cx={540} cy={900} rx={520} ry={420} fill="#ffc06a" opacity={0.12} />
      <Drift f={f} n={30} color="#ffd9a0" seed="cave" maxR={2.5} speed={0.25} opacity={0.4} />
      <BigNum f={f} at={F.y2013} text="2013" x={540} y={400} hue={GOLD} fs={150} />
      <g transform="translate(540 860)">
        <rect x={-430 * unroll - 30} y={-200} width={860 * unroll + 60} height={400} rx={10} fill="#e9d29c" stroke={INK} strokeWidth={6} />
        <rect x={-430 * unroll - 50} y={-215} width={40} height={430} rx={18} fill="#c89b55" stroke={INK} strokeWidth={6} />
        <rect x={430 * unroll + 10} y={-215} width={40} height={430} rx={18} fill="#c89b55" stroke={INK} strokeWidth={6} />
        {unroll > 0.9 && [...Array(6)].map((_, i) => {
          const q = clamp01(lines * 6 - i);
          return (
            <g key={i} opacity={q}>
              {[...Array(9)].map((__, k) => {
                const gx = -360 + k * 84, gy = -140 + i * 56;
                const t = Math.floor(rnd("hg" + i + "-" + k) * 4);
                return k / 9 < q ? (
                  <g key={k} transform={`translate(${gx} ${gy})`} stroke="#3b2412" strokeWidth={5} fill="none" strokeLinecap="round">
                    {t === 0 && <path d="M0 0 q 14 -22 28 0" />}
                    {t === 1 && <><circle cx={14} cy={-6} r={10} /><line x1={14} y1={4} x2={14} y2={18} /></>}
                    {t === 2 && <path d="M0 10 L14 -14 L28 10" />}
                    {t === 3 && <><line x1={0} y1={-10} x2={28} y2={-10} /><line x1={0} y1={6} x2={28} y2={6} /></>}
                  </g>
                ) : null;
              })}
            </g>
          );
        })}
      </g>
      <Stamp f={f} at={F.y2013 + 80} x={600} y={1130} text="OLDEST PAPYRUS" hue={GOLD} fs={64} rot={-6} />
      {f >= F.logbook && <Chip x={540} y={600} w={360} label="A LOGBOOK" hue={RED} p={pop(f, F.logbook, 10)} fs={40} />}
      <Hero f={f} x={130} s={0.6} mood="surprised" armR={80} look={[1, -1]} />
    </g>
  );
};
const S4_Boat: React.FC<{ f: number }> = ({ f }) => {
  const sail = eio(ramp(f, F.boat - 6, F.thirty + 40));
  const bx = lerp(220, 820, sail);
  const blocks = countUp(f, F.thirty, F.thirty + 30, 30);
  return (
    <g>
      <Sky f={f} warm={0.4} />
      <Pyramid x={900} base={1080} w={300} />
      <path d={`M0 1080 Q 540 1040 1080 1080 V 1430 Q 540 1460 0 1430 Z`} fill={NILE} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${((i * 140 + f * 2) % 1240) - 80} ${1120 + (i % 4) * 70} q 30 -12 60 0`} stroke="#9fd3f2" strokeWidth={5} fill="none" opacity={0.7} />)}
      <path d={`M0 1430 Q 540 1460 1080 1430 V ${VH} H0 Z`} fill={SAND} />
      <path d={`M0 1080 Q 540 1040 1080 1080 V 1060 Q 540 1010 0 1050 Z`} fill="#6a9b4a" />
      <Chip x={160} y={990} w={200} label="TURA" hue="#7a5a3a" p={pop(f, F.team, 10)} fs={34} />
      <Chip x={900} y={760} w={200} label="GIZA" hue="#7a5a3a" p={pop(f, F.team + 8, 10)} fs={34} />
      {f >= F.team && <path d={`M240 1130 Q 540 ${1100 - 80} 860 1100`} stroke="#fff" strokeWidth={6} strokeDasharray="18 16" fill="none" opacity={0.7 * clamp01((f - F.team) / 20)} strokeDashoffset={-f * 2} />}
      <g transform={`translate(${bx} ${1230 + Math.sin(f * 0.15) * 6}) rotate(${Math.sin(f * 0.12) * 2})`}>
        <path d="M-230 0 Q 0 70 230 0 L 200 -30 H -200 Z" fill="#8a5a2b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <line x1={0} y1={-30} x2={0} y2={-300} stroke={INK} strokeWidth={8} />
        <path d="M6 -290 Q 130 -170 6 -60 Z" fill="#f4ecd8" stroke={INK} strokeWidth={5} />
        {[...Array(Math.min(6, Math.ceil(blocks / 5)))].map((_, i) => <Block key={i} x={-150 + (i % 3) * 70} y={-60 - Math.floor(i / 3) * 52} s={0.5} />)}
      </g>
      {f >= F.merer && (
        <g>
          <Figure x={lerp(330, 930, sail) - 90} y={1200 + Math.sin(f * 0.15) * 6} s={0.42} facing={1} coat="#3c6fd1" mood="happy" look={[1, 0]} blink={blinkAt(f, 4)} hair="tuft" armR={60} />
          <Chip x={540} y={330} w={400} label="MERER'S CREW" hue="#3c6fd1" p={pop(f, F.merer, 10)} fs={36} />
          <g transform="translate(540 470)">
            {[...Array(40)].map((_, i) => {
              const q = clamp01((f - F.merer - 10) / 40 * 40 - i); if (q <= 0) return null;
              return <g key={i} transform={`translate(${-390 + (i % 20) * 41} ${Math.floor(i / 20) * 64}) scale(${eout(q)})`}><circle cy={-12} r={11} fill="#fff" stroke={INK} strokeWidth={3} /><rect x={-9} y={0} width={18} height={24} rx={6} fill="#3c6fd1" stroke={INK} strokeWidth={3} /></g>;
            })}
          </g>
          <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.merer + 50, 10)}>~40 WORKERS</text>
        </g>
      )}
      {f >= F.thirty && <BigNum f={f} at={F.thirty} text={`${blocks} BLOCKS / TRIP`} x={540} y={900} hue={GOLD} fs={74} />}
    </g>
  );
};
const S5_Sledge: React.FC<{ f: number }> = ({ f }) => {
  const pour = f >= F.painting + 20;
  const move = (f - F.sledge) * 0.6;
  return (
    <g>
      <rect width={VW} height={VH} fill="#e7cf9a" />
      <rect x={60} y={260} width={960} height={1220} rx={20} fill="#efdcae" stroke="#8a6a3a" strokeWidth={10} />
      {[...Array(5)].map((_, i) => <rect key={i} x={60} y={260 + i * 30} width={960} height={6} fill="#c9a86a" opacity={0.6} />)}
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#7a4f22" letterSpacing={6} opacity={pop(f, F.painting, 10)}>ANCIENT TOMB PAINTING</text>
      <g transform={`translate(${Math.min(40, move * 0.2) - 90} -250) scale(1.15)`}>
        <path d="M640 1080 H980 L1000 1110 H620 Z" fill="#8a5a2b" stroke={INK} strokeWidth={6} />
        <Block x={810} y={980} s={1.6} c="#cfa25a" />
        {[0, 1, 2, 3].map((i) => <Worker key={i} f={f} x={180 + i * 100} y={1100} s={0.42} seed={i} pull />)}
        <line x1={150} y1={960} x2={640} y2={1050} stroke="#6b4a24" strokeWidth={7} />
        {pour && (
          <g>
            <Figure x={590} y={1100} s={0.42} facing={-1} coat="#f2eee4" mood="neutral" look={[-1, 1]} blink={1} hair="none" armR={95} elbowR={-30} armL={40} />
            <path d="M560 950 l -30 18 l 6 22 l 30 -10 Z" fill="#b35a2a" stroke={INK} strokeWidth={4} />
            {[...Array(8)].map((_, i) => { const q = ((f * 0.08 + i * 0.13) % 1); return <circle key={i} cx={530 - q * 30} cy={985 + q * 110} r={6 - q * 3} fill="#4aa3df" opacity={1 - q * 0.5} />; })}
            <ellipse cx={500} cy={1110} rx={90} ry={14} fill="#4aa3df" opacity={0.5} />
          </g>
        )}
      </g>
      <path d="M60 1045 H1020" stroke="#8a6a3a" strokeWidth={6} />
      <Chip x={540} y={1250} w={380} label="WOODEN SLEDGE" hue="#8a5a2b" p={pop(f, F.sledge + 6, 10)} fs={36} />
      {pour && <Chip x={540} y={1340} w={460} label="WATER ON THE SAND" hue={NILE} p={pop(f, F.painting + 26, 10)} fs={36} />}
    </g>
  );
};
const Gauge: React.FC<{ x: number; y: number; v: number; label: string; hue: string; f: number; at: number }> = ({ x, y, v, label, hue, f, at }) => {
  const a = lerp(-120, 120, v);
  return (
    <g transform={`translate(${x} ${y})`} opacity={pop(f, at, 10)}>
      <circle r={170} fill="#fff" stroke={INK} strokeWidth={8} />
      <path d="M-147 85 A170 170 0 1 1 147 85" fill="none" stroke="#eee" strokeWidth={20} />
      <path d={`M-147 85 A170 170 0 ${v > 0.5 ? 1 : 0} 1 ${170 * Math.sin((a * Math.PI) / 180) * 0.865} ${-170 * Math.cos((a * Math.PI) / 180) * 0.865}`} fill="none" stroke={hue} strokeWidth={20} opacity={0.9} />
      <line x1={0} y1={0} x2={120 * Math.sin((a * Math.PI) / 180)} y2={-120 * Math.cos((a * Math.PI) / 180)} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle r={16} fill={INK} />
      <text y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">{label}</text>
    </g>
  );
};
const S6_Physics: React.FC<{ f: number }> = ({ f }) => {
  const wet = eio(ramp(f, F.half - 4, F.half + 14));
  return (
    <g>
      <rect width={VW} height={VH} fill="#16213f" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 170} x2={VW} y2={i * 170} stroke="#2a3a66" strokeWidth={2} />)}
      {[...Array(8)].map((_, i) => <line key={i} x1={i * 150} y1={0} x2={i * 150} y2={VH} stroke="#2a3a66" strokeWidth={2} />)}
      <BigNum f={f} at={F.y2014} text="2014" x={540} y={330} hue={GOLD} fs={130} />
      <Chip x={540} y={440} w={460} label="PHYSICISTS TEST IT" hue="#6c4ee6" p={pop(f, F.y2014 + 10, 10)} fs={34} />
      <Gauge x={290} y={800} v={0.86} label="DRY SAND" hue={RED} f={f} at={F.y2014 + 20} />
      <Gauge x={790} y={800} v={lerp(0.86, 0.43, wet)} label="WET SAND" hue={TEAL} f={f} at={F.right} />
      {f >= F.right && [...Array(6)].map((_, i) => { const q = ((f * 0.05 + i * 0.17) % 1); return <circle key={i} cx={720 + i * 26} cy={520 + q * 120} r={7} fill="#4aa3df" opacity={1 - q} />; })}
      {f >= F.half && <BigNum f={f} at={F.half + 6} text="½ THE FORCE" x={570} y={1310} hue={TEAL} fs={110} />}
      <Hero f={f} x={120} y={GROUND + 120} s={0.5} hat={false} mood={f >= F.half ? "happy" : "neutral"} armR={70} look={[1, -1]} />
    </g>
  );
};
const S7_Village: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} warm={0.75} />
    <Pyramid x={820} base={1100} w={420} />
    <Dunes y={1180} />
    {f >= F.village && [...Array(6)].map((_, i) => (
      <g key={i} opacity={pop(f, F.village + 6 + i * 5, 10)} transform={`translate(${130 + i * 150} ${1180 + (i % 2) * 40})`}>
        <rect x={-60} y={-80} width={120} height={80} fill="#e2c084" stroke={INK} strokeWidth={5} />
        <rect x={-14} y={-46} width={28} height={46} fill="#5a3a1a" />
        <rect x={-66} y={-92} width={132} height={14} fill="#c99a52" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    {f >= F.village + 50 && (
      <g transform="translate(300 900)" opacity={pop(f, F.village + 50, 12)}>
        <path d="M-90 80 V-40 Q0 -120 90 -40 V80 Z" fill="#cfb27a" stroke={INK} strokeWidth={6} />
        <path d="M-30 80 V10 Q0 -20 30 10 V80 Z" fill="#3a2614" />
        <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">WORKERS' TOMB</text>
      </g>
    )}
    {f >= F.paid && (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const q = clamp01((f - F.paid - i * 4) / 18);
          return <g key={i} transform={`translate(${620 + i * 60} ${lerp(500, 820 - i * 8, eout(q))})`} opacity={q}><ellipse rx={34} ry={22} fill="#d89a4a" stroke={INK} strokeWidth={4} /><path d="M-20 -6 q20 -10 40 0" stroke={INK} strokeWidth={3} fill="none" /></g>;
        })}
        <Stamp f={f} at={F.paid + 10} x={740} y={640} text="PAID" hue={TEAL} fs={110} />
      </g>
    )}
    {f >= F.honor && [...Array(8)].map((_, i) => <circle key={i} cx={300 + Math.cos(i * 0.8 + f * 0.05) * 140} cy={880 + Math.sin(i * 0.8 + f * 0.05) * 90} r={7} fill={GOLD} opacity={0.8} />)}
    <Hero f={f} x={160} s={0.62} mood={f >= F.paid ? "happy" : "neutral"} armR={60} look={[1, -1]} />
  </g>
);
const S8_Recap: React.FC<{ f: number }> = ({ f }) => {
  const items = [["BOATS", F.boats, NILE], ["WATER", F.boats + 24, TEAL], ["ENGINEERING", F.brilliant, GOLD]] as const;
  return (
    <g>
      <Sky f={f} warm={0.2} />
      <Pyramid x={540} base={GROUND - 20} w={820} glow={eout(ramp(f, F.brilliant, F.brilliant + 30))} />
      <Dunes />
      <g opacity={1 - ramp(f, F.boats - 6, F.boats + 4)}>
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.magic, 10)}>NO MAGIC</text>
      </g>
      {items.map(([label, at, hue], i) => <Chip key={label} x={540} y={330 + i * 110} w={label.length * 34 + 120} label={label} hue={hue} p={pop(f, at, 10)} fs={44} textColor={hue === GOLD ? INKC : "#fff"} />)}
      <Hero f={f} x={170} s={0.8} mood="happy" armR={130} elbowR={30} look={[1, -2]} />
    </g>
  );
};
const S9_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky f={f} warm={0.9} />
    <Pyramid x={540} base={GROUND - 20} w={900} glow={0.6} />
    <Dunes />
    <rect width={VW} height={VH} fill="#000" opacity={0.25} />
    <Outro f={f} at={F.sub} />
    <Hero f={f} x={180} s={0.75} mood="happy" armR={120 + Math.sin(f * 0.3) * 14} elbowR={40} look={[1, -1]} />
  </g>
);

export const PyramidsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: ShotDef[] = [
    { from: 0, to: F.great, z0: 1.08, z1: 1.0, fx: 540, fy: 900, render: () => <S1_Hook f={f} /> },
    { from: F.great, to: F.y2013, z0: 1.0, z1: 1.08, fx: 540, fy: 900, render: () => <S2_Blocks f={f} /> },
    { from: F.y2013, to: F.merer, z0: 1.0, z1: 1.06, fx: 540, fy: 860, render: () => <S3_Papyrus f={f} /> },
    { from: F.merer, to: F.sledge, z0: 1.0, z1: 1.06, fx: 540, fy: 1100, render: () => <S4_Boat f={f} /> },
    { from: F.sledge, to: F.y2014, z0: 1.02, z1: 1.1, fx: 600, fy: 1000, render: () => <S5_Sledge f={f} /> },
    { from: F.y2014, to: F.builders, z0: 1.0, z1: 1.06, fx: 540, fy: 800, render: () => <S6_Physics f={f} /> },
    { from: F.builders, to: F.magic, z0: 1.0, z1: 1.07, fx: 500, fy: 950, render: () => <S7_Village f={f} /> },
    { from: F.magic, to: F.sub, z0: 1.0, z1: 1.08, fx: 540, fy: 900, render: () => <S8_Recap f={f} /> },
    { from: F.sub, to: TOTAL + 1, z0: 1.04, z1: 1.0, fx: 540, fy: 1000, render: () => <S9_Outro f={f} /> },
  ];
  const KICKS: [number, number][] = [[F.aliens + 18, 14], [F.slaves + 16, 14], [F.great + 80, 10], [F.y2013, 12], [F.y2013 + 80, 12], [F.thirty, 10], [F.half + 6, 18], [F.paid + 10, 14], [F.brilliant, 10]];
  const SFX: Cue[] = [
    [F.aliens - 8, "whoosh", 0.45], [F.aliens + 18, "impact", 0.5], [F.slaves, "pop", 0.4], [F.slaves + 16, "impact", 0.5],
    [F.great - 2, "whoosh", 0.4], [F.great + 10, "riser", 0.25], [F.great + 80, "impact", 0.45], [F.nobody, "pop", 0.3],
    [F.y2013 - 2, "whoosh", 0.4], [F.y2013, "boom", 0.35], [F.y2013 + 80, "impact", 0.45], [F.logbook, "pop", 0.4],
    [F.merer - 2, "whoosh", 0.4], [F.merer + 10, "tick", 0.3], [F.boat - 4, "whoosh", 0.3], [F.thirty, "pop", 0.4],
    [F.sledge - 2, "whoosh", 0.4], [F.painting + 20, "pop", 0.35],
    [F.y2014 - 2, "whoosh", 0.4], [F.y2014, "impact", 0.4], [F.right - 60, "riser", 0.3], [F.half + 6, "boom", 0.4],
    [F.builders - 2, "whoosh", 0.4], [F.village + 6, "pop", 0.3], [F.paid + 10, "impact", 0.5],
    [F.magic - 2, "whoosh", 0.4], [F.boats, "pop", 0.4], [F.boats + 24, "pop", 0.4], [F.brilliant, "impact", 0.45],
    [F.sub - 2, "whoosh", 0.4], [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.y2013 ? YEL : f < F.y2014 ? "#e4873b" : f < F.builders ? TEAL : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Shots f={f} shots={SHOTS} kicks={KICKS} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="PYRAMIDS" sub="HOW WERE THEY BUILT?" until={F.great - 10} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="pyramids" total={TOTAL} />
      <Sfx cues={SFX} />
    </AbsoluteFill>
  );
};
