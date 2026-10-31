import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure, FontStyle, blinkAt, clamp01, lerp, VW, VH, INK } from "./kit";

const FONT = "InterLocal, Inter, sans-serif";
type P = { f: number; seed: number };
const talkOf = (f: number, seed: number) => Math.max(0, Math.sin(f * 0.55 + seed)) * (Math.sin(f * 0.11 + seed) > -0.35 ? 1 : 0);
const waveOf = (f: number, seed: number) => Math.sin(f * 0.22 + seed);
const blink = (f: number, seed: number) => blinkAt(f, seed);

// 1 — CLASSIC: the current stick figure (baseline)
const Classic: React.FC<P> = ({ f, seed }) => (
  <Figure x={0} y={0} s={0.82} coat="#1aa39a" mood="happy" look={[1, 0]} blink={blink(f, seed)} hair="tuft" armR={120 + waveOf(f, seed) * 22} elbowR={40} armL={-30} elbowL={-16} talk={talkOf(f, seed)} />
);

// 2 — BEAN: chunky capsule body, big eyes, noodle arms
const Bean: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const sq = 1 + Math.sin(f * 0.2) * 0.02;
  return (
    <g transform={`scale(${1 / sq} ${sq})`}>
      <ellipse cx={0} cy={2} rx={90} ry={12} fill="#000" opacity={0.18} />
      <path d="M-34 -10 L-38 -60 M34 -10 L38 -60" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <ellipse cx={-42} cy={-6} rx={26} ry={13} fill="#3a2d5c" />
      <ellipse cx={42} cy={-6} rx={26} ry={13} fill="#3a2d5c" />
      <rect x={-95} y={-330} width={190} height={280} rx={95} fill="#ff8a3d" stroke={INK} strokeWidth={7} />
      <path d="M-95 -150 H95 V-145 A95 95 0 0 1 -95 -145 Z" fill="#ff7428" opacity={0.0} />
      <ellipse cx={0} cy={-90} rx={70} ry={26} fill="#ff7428" opacity={0.55} />
      <path d={`M-90 -170 Q-150 -140 -150 -90`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
      <circle cx={-150} cy={-86} r={14} fill="#fff" stroke={INK} strokeWidth={5} />
      <path d={`M90 -170 Q ${150 + w * 10} ${-230 + w * 8} ${140 + w * 26} ${-290}`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
      <circle cx={140 + w * 26} cy={-292} r={14} fill="#fff" stroke={INK} strokeWidth={5} />
      {[-34, 34].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-250} rx={28} ry={34 * b} fill="#fff" stroke={INK} strokeWidth={5} />
          <circle cx={ex + 6} cy={-246} r={12 * Math.min(1, b * 1.4)} fill={INK} />
          <circle cx={ex + 11} cy={-252} r={4 * b} fill="#fff" />
        </g>
      ))}
      <ellipse cx={0} cy={-196} rx={18 + t * 6} ry={5 + t * 16} fill="#5a1a1a" stroke={INK} strokeWidth={4} />
      <ellipse cx={-62} cy={-206} rx={14} ry={8} fill="#ff5f7a" opacity={0.55} />
      <ellipse cx={62} cy={-206} rx={14} ry={8} fill="#ff5f7a" opacity={0.55} />
    </g>
  );
};

// 3 — TOON: 1930s rubber-hose style (original design): round head, pie-eyes, gloves, big shoes
const Toon: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const bounce = Math.abs(Math.sin(f * 0.18)) * 10;
  return (
    <g transform={`translate(0 ${-bounce})`}>
      <ellipse cx={0} cy={2 + bounce} rx={80} ry={12} fill="#000" opacity={0.18} />
      <path d={`M-20 -120 Q -40 -60 -30 -18`} stroke={INK} strokeWidth={12} fill="none" />
      <path d={`M20 -120 Q 40 -60 30 -18`} stroke={INK} strokeWidth={12} fill="none" />
      <path d="M-78 -2 Q-80 -34 -40 -30 Q-18 -28 -18 -2 Z" fill="#7a4a26" stroke={INK} strokeWidth={6} />
      <path d="M78 -2 Q80 -34 40 -30 Q18 -28 18 -2 Z" fill="#7a4a26" stroke={INK} strokeWidth={6} />
      <path d="M-60 -200 Q0 -230 60 -200 L54 -110 Q0 -96 -54 -110 Z" fill="#f6f0e2" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-57} y={-196 + k * 22} width={114} height={9} fill="#2f8f6a" />)}
      <path d="M-50 -160 H50 L54 -104 Q0 -92 -54 -104 Z" fill="#3b63b8" stroke={INK} strokeWidth={6} />
      <path d="M-40 -160 L-30 -206 M40 -160 L30 -206" stroke="#3b63b8" strokeWidth={10} />
      <rect x={-14} y={-150} width={28} height={20} rx={4} fill="#2b4c96" />
      <path d={`M-56 -190 Q -120 -150 -110 -100`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
      <circle cx={-110} cy={-96} r={22} fill="#ffcf3a" stroke={INK} strokeWidth={6} />
      <path d={`M56 -190 Q ${110 + w * 10} ${-240} ${100 + w * 30} ${-300}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
      <g transform={`translate(${100 + w * 30} ${-304}) rotate(${w * 20})`}>
        <circle r={24} fill="#ffcf3a" stroke={INK} strokeWidth={6} />
        <path d="M-20 -6 q-12 -14 2 -18" stroke={INK} strokeWidth={5} fill="#ffcf3a" />
      </g>
      <circle cx={0} cy={-290} r={86} fill="#f4d9b0" stroke={INK} strokeWidth={7} />
      <path d="M-86 -300 Q -80 -390 0 -380 Q 80 -390 86 -300 Q 50 -340 0 -330 Q -50 -340 -86 -300Z" fill="#c4572a" stroke={INK} strokeWidth={6} />
      <path d="M-30 -378 q 10 -40 40 -30" stroke="#c4572a" strokeWidth={14} fill="none" strokeLinecap="round" />
      {[-28, 28].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-298} rx={18} ry={30 * b} fill="#fff" stroke={INK} strokeWidth={5} />
          <path d={`M${ex - 12} ${-292} a12 ${20 * b} 0 0 0 24 0 Z`} fill={INK} />
        </g>
      ))}
      <ellipse cx={0} cy={-262} rx={14} ry={9} fill="#d9786a" stroke={INK} strokeWidth={4} />
      <path d={`M-40 -236 Q 0 ${-210 + t * 18} 40 -236`} stroke={INK} strokeWidth={6} fill={t > 0.15 ? "#7a2020" : "none"} strokeLinejoin="round" />
    </g>
  );
};

// 4 — DOODLE: wobbly marker lines on paper (hand-drawn look)
const Doodle: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const boil = Math.floor(f / 4) % 3; // line "boil" every 4 frames like hand-drawn animation
  return (
    <g filter={`url(#wobble${boil})`}>
      <circle cx={0} cy={-330} r={58} fill="#fff" stroke="#151515" strokeWidth={8} />
      {[-20, 20].map((ex) => <ellipse key={ex} cx={ex} cy={-338} rx={6} ry={9 * b} fill="#151515" />)}
      <path d={t > 0.15 ? `M-14 -306 Q0 ${-300 + t * 16} 14 -306 Q0 -310 -14 -306` : "M-16 -308 Q0 -296 16 -308"} stroke="#151515" strokeWidth={6} fill={t > 0.15 ? "#151515" : "none"} strokeLinecap="round" />
      <path d="M-6 -384 q4 -22 16 -18 M6 -388 q2 -18 14 -14" stroke="#151515" strokeWidth={5} fill="none" strokeLinecap="round" />
      <line x1={0} y1={-272} x2={0} y2={-130} stroke="#151515" strokeWidth={9} strokeLinecap="round" />
      <path d="M0 -130 L-40 0 M0 -130 L40 0" stroke="#151515" strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d="M0 -240 L-70 -170 L-90 -120" stroke="#151515" strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d={`M0 -240 L70 ${-280 + w * 8} L${100 + w * 20} ${-350 + w * 6}`} stroke="#151515" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M-28 -50 l30 -18 l30 18" stroke="#ffcf00" strokeWidth={0} fill="none" />
    </g>
  );
};

// 5 — FLAT: modern flat illustration person (no outlines, soft shapes)
const Flat: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const sway = Math.sin(f * 0.08) * 2;
  return (
    <g transform={`rotate(${sway} 0 0)`}>
      <ellipse cx={0} cy={2} rx={80} ry={11} fill="#000" opacity={0.15} />
      <rect x={-42} y={-150} width={34} height={150} rx={14} fill="#26315a" />
      <rect x={8} y={-150} width={34} height={150} rx={14} fill="#2d3a6b" />
      <ellipse cx={-26} cy={-4} rx={30} ry={12} fill="#f4f1ea" /><ellipse cx={26} cy={-4} rx={30} ry={12} fill="#f4f1ea" />
      <path d="M-70 -300 Q0 -330 70 -300 L60 -140 Q0 -128 -60 -140 Z" fill="#7b5cff" />
      <path d="M-70 -300 Q-110 -230 -96 -160" stroke="#7b5cff" strokeWidth={30} fill="none" strokeLinecap="round" />
      <circle cx={-96} cy={-150} r={17} fill="#c98d64" />
      <path d={`M70 -300 Q ${118 + w * 8} ${-340} ${110 + w * 26} ${-410}`} stroke="#6a4ce8" strokeWidth={30} fill="none" strokeLinecap="round" />
      <circle cx={110 + w * 26} cy={-420} r={17} fill="#c98d64" />
      <rect x={-14} y={-338} width={28} height={30} fill="#c98d64" />
      <ellipse cx={0} cy={-392} rx={56} ry={62} fill="#d89a6e" />
      <path d="M-58 -400 Q-62 -470 0 -466 Q 66 -470 60 -396 Q 40 -440 -10 -436 Q -40 -434 -58 -400Z" fill="#2a1d18" />
      <circle cx={52} cy={-390} r={10} fill="#d89a6e" />
      {[-20, 22].map((ex) => <ellipse key={ex} cx={ex} cy={-392} rx={6} ry={8 * b} fill="#2a1d18" />)}
      <path d={t > 0.15 ? `M-14 -360 Q0 ${-352 + t * 14} 14 -360 Z` : "M-14 -362 Q0 -352 14 -362"} stroke="#2a1d18" strokeWidth={5} fill={t > 0.15 ? "#8a3a3a" : "none"} strokeLinecap="round" />
    </g>
  );
};

// 6 — BLOBBY: squishy gradient blob with tiny hands
const Blobby: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const sq = 1 + Math.sin(f * 0.25) * 0.05 + t * 0.03;
  return (
    <g transform={`scale(${1 / sq} ${sq})`}>
      <defs><radialGradient id="blobg" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#8ef5c8" /><stop offset="1" stopColor="#1fb57a" /></radialGradient></defs>
      <ellipse cx={0} cy={2} rx={110} ry={14} fill="#000" opacity={0.18} />
      <path d="M-120 0 Q-140 -200 -60 -290 Q0 -340 60 -290 Q140 -200 120 0 Z" fill="url(#blobg)" stroke={INK} strokeWidth={7} />
      <ellipse cx={-60} cy={-240} rx={20} ry={30} fill="#fff" opacity={0.35} />
      {[-36, 36].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-190} rx={24} ry={30 * b} fill="#fff" stroke={INK} strokeWidth={5} />
          <circle cx={ex + 4} cy={-186} r={11 * Math.min(1, b * 1.4)} fill={INK} />
        </g>
      ))}
      <path d={`M-26 -130 Q0 ${-122 + t * 26} 26 -130`} stroke={INK} strokeWidth={6} fill={t > 0.1 ? "#145a3c" : "none"} strokeLinecap="round" />
      <ellipse cx={-130} cy={-90} rx={22} ry={16} fill="#1fb57a" stroke={INK} strokeWidth={5} />
      <g transform={`translate(${128} ${-150}) rotate(${-30 + w * 30})`}><ellipse cx={20} cy={0} rx={24} ry={17} fill="#1fb57a" stroke={INK} strokeWidth={5} /></g>
    </g>
  );
};

// 7 — PROFESSOR: chibi big-head with lab coat, glasses, wild hair
const Professor: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  return (
    <g>
      <ellipse cx={0} cy={2} rx={80} ry={11} fill="#000" opacity={0.18} />
      <path d="M-26 -90 V-6 M26 -90 V-6" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <ellipse cx={-30} cy={-4} rx={24} ry={11} fill="#4a3426" /><ellipse cx={30} cy={-4} rx={24} ry={11} fill="#4a3426" />
      <path d="M-70 -200 Q0 -216 70 -200 L80 -80 H-80 Z" fill="#fbfbf8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M0 -205 L-22 -150 L0 -90 L22 -150 Z" fill="#3c6fd1" />
      <rect x={30} y={-150} width={34} height={8} rx={4} fill="#e94b3c" />
      <path d="M-70 -195 Q-112 -150 -100 -110" stroke="#fbfbf8" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M-70 -195 Q-112 -150 -100 -110" stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.0} />
      <circle cx={-100} cy={-104} r={15} fill="#f2cfa8" stroke={INK} strokeWidth={4} />
      <path d={`M70 -195 Q ${118 + w * 6} ${-240} ${110 + w * 24} ${-290}`} stroke="#fbfbf8" strokeWidth={26} fill="none" strokeLinecap="round" />
      <circle cx={110 + w * 24} cy={-298} r={15} fill="#f2cfa8" stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-330} r={120} fill="#f2cfa8" stroke={INK} strokeWidth={7} />
      <path d="M-120 -340 q-30 -40 0 -70 q-6 -50 50 -60 q30 -40 80 -10 q50 -10 60 40 q40 20 20 70 q-20 -40 -60 -50 q-50 10 -100 0 q-30 20 -50 80Z" fill="#ececec" stroke={INK} strokeWidth={6} />
      {[-42, 42].map((ex) => (
        <g key={ex}>
          <circle cx={ex} cy={-322} r={34} fill="#fff" stroke={INK} strokeWidth={6} />
          <ellipse cx={ex + 4} cy={-320} rx={9} ry={13 * b} fill={INK} />
        </g>
      ))}
      <line x1={-8} y1={-322} x2={8} y2={-322} stroke={INK} strokeWidth={6} />
      <path d="M-30 -268 Q0 -276 30 -268" stroke="#bbb" strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={0} cy={-248} rx={14 + t * 4} ry={4 + t * 12} fill="#7a2020" stroke={INK} strokeWidth={4} />
    </g>
  );
};

// 8 — SHADE: silhouette with glowing eyes + rim light (mystery/space/true-crime topics)
const Shade: React.FC<P> = ({ f, seed }) => {
  const t = talkOf(f, seed), w = waveOf(f, seed), b = blink(f, seed);
  const glow = 0.7 + 0.3 * Math.sin(f * 0.15);
  return (
    <g>
      <defs>
        <filter id="glowf" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <ellipse cx={0} cy={2} rx={90} ry={12} fill="#58e1ff" opacity={0.25} />
      <g stroke="#58e1ff" strokeWidth={16} opacity={0.35} filter="url(#glowf)" fill="none">
        <circle cx={0} cy={-330} r={64} />
      </g>
      <path d="M-34 -150 L-44 -4 M34 -150 L44 -4" stroke="#05060c" strokeWidth={26} strokeLinecap="round" />
      <path d="M-74 -280 Q0 -300 74 -280 L66 -140 Q0 -126 -66 -140 Z" fill="#05060c" />
      <path d="M-70 -270 Q-110 -200 -100 -140" stroke="#05060c" strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={`M70 -270 Q ${116 + w * 6} ${-310} ${108 + w * 22} ${-370}`} stroke="#05060c" strokeWidth={24} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-330} r={64} fill="#05060c" />
      <path d="M-64 -330 A64 64 0 0 1 40 -380" stroke="#58e1ff" strokeWidth={5} fill="none" opacity={0.9} />
      <path d="M74 -280 L66 -140" stroke="#58e1ff" strokeWidth={4} opacity={0.7} />
      {[-22, 22].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-336} rx={14} ry={9 * b} fill="#58e1ff" opacity={glow} filter="url(#glowf)" />
          <ellipse cx={ex} cy={-336} rx={10} ry={6 * b} fill="#e6fbff" />
        </g>
      ))}
      <ellipse cx={0} cy={-300} rx={12} ry={2 + t * 8} fill="#58e1ff" opacity={0.85 * glow} />
    </g>
  );
};

const CHARS: { n: number; name: string; desc: string; bg: string; bg2: string; C: React.FC<P>; dark?: boolean; sc?: number }[] = [
  { n: 1, name: "CLASSIC", desc: "current stick figure", bg: "#e9f6f4", bg2: "#bfe8e2", C: Classic },
  { n: 2, name: "BEAN", desc: "chunky, cute, big eyes", bg: "#fff1e4", bg2: "#ffd2ad", C: Bean },
  { n: 3, name: "TOON", desc: "1930s rubber-hose cartoon", bg: "#f6efe0", bg2: "#e3d2ad", C: Toon },
  { n: 4, name: "DOODLE", desc: "hand-drawn marker lines", bg: "#ffffff", bg2: "#f1f1f1", C: Doodle },
  { n: 5, name: "FLAT", desc: "modern flat illustration", bg: "#eef0ff", bg2: "#cfd5ff", C: Flat, sc: 0.56 },
  { n: 6, name: "BLOBBY", desc: "squishy blob, max emotion", bg: "#e8fff4", bg2: "#b9f3d8", C: Blobby },
  { n: 7, name: "PROFESSOR", desc: "chibi scientist, big head", bg: "#eef6ff", bg2: "#c9e0ff", C: Professor, sc: 0.54 },
  { n: 8, name: "SHADE", desc: "silhouette, glowing eyes", bg: "#0b1022", bg2: "#1b2650", C: Shade, dark: true, sc: 0.6 },
];

export const CharacterSheet: React.FC = () => {
  const f = useCurrentFrame();
  const cw = 500, ch = 395, gx = 30, gy0 = 232, gap = 18;
  return (
    <AbsoluteFill style={{ background: "#14151c" }}>
      <FontStyle />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`}>
        <defs>
          {[0, 1, 2].map((k) => (
            <filter key={k} id={`wobble${k}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={k * 7 + 3} />
              <feDisplacementMap in="SourceGraphic" scale={5} />
            </filter>
          ))}
        </defs>
        <text x={VW / 2} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill="#FFD60A" stroke="#000" strokeWidth={8} paintOrder="stroke">PICK YOUR CHARACTER</text>
        <text x={VW / 2} y={180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#cfd3e6" letterSpacing={2}>all original · all animate: blink · talk · wave</text>
        {CHARS.map((c, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = gx + col * (cw + gap), y = gy0 + row * (ch + gap);
          const C = c.C;
          return (
            <g key={c.n} transform={`translate(${x} ${y})`}>
              <defs><linearGradient id={`cg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.bg} /><stop offset="1" stopColor={c.bg2} /></linearGradient></defs>
              <rect width={cw} height={ch} rx={28} fill={`url(#cg${i})`} stroke={c.dark ? "#58e1ff" : "#000"} strokeWidth={4} />
              <circle cx={50} cy={50} r={30} fill="#FFD60A" stroke="#000" strokeWidth={4} />
              <text x={50} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#000">{c.n}</text>
              <text x={92} y={48} fontFamily={FONT} fontWeight={800} fontSize={34} fill={c.dark ? "#fff" : "#111"} letterSpacing={2}>{c.name}</text>
              <text x={92} y={80} fontFamily={FONT} fontWeight={700} fontSize={22} fill={c.dark ? "#9fb0d8" : "#555"}>{c.desc}</text>
              <g transform={`translate(${cw / 2} ${ch - 26}) scale(${c.sc ?? 0.64})`}><C f={f} seed={i * 1.7} /></g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
