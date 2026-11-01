import React from "react";
import { FONT, YEL, INKC } from "./factkit";
import { CAST } from "./Humans";
import { ThumbDef, RED } from "./ThumbKit";

const Card: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; fill?: string; stroke?: string; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, fill = "#fff", stroke = INKC, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={28} fill="#000" opacity={0.3} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={stroke} strokeWidth={10} />
    {children}
  </g>
);
const T: React.FC<{ x?: number; y: number; s: number; c?: string; children: React.ReactNode }> = ({ x = 0, y, s, c = INKC, children }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill={c}>{children}</text>
);
const Stamp: React.FC<{ x: number; y: number; text: string; c?: string; s?: number; rot?: number }> = ({ x, y, text, c = RED, s = 80, rot = -10 }) => {
  const w = text.length * s * 0.64 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-s * 0.75} width={w} height={s * 1.4} rx={18} fill="#fff" stroke={c} strokeWidth={12} />
      <text y={s * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill={c} letterSpacing={3}>{text}</text>
    </g>
  );
};
const Big: React.FC<{ x: number; y: number; s: number; c?: string; children: React.ReactNode; rot?: number }> = ({ x, y, s, c = YEL, children, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill={c} stroke={INKC} strokeWidth={s * 0.14} paintOrder="stroke" strokeLinejoin="round">{children}</text>
  </g>
);
const Planet: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#3d8ee8" stroke={INKC} strokeWidth={10} />
    <path d={`M${-r * 0.6} ${-r * 0.3} q ${r * 0.3} ${-r * 0.4} ${r * 0.6} ${-r * 0.1} q ${r * 0.1} ${r * 0.4} ${-r * 0.3} ${r * 0.5} Z M${r * 0.1} ${r * 0.2} q ${r * 0.4} ${-r * 0.1} ${r * 0.5} ${r * 0.3} q ${-r * 0.2} ${r * 0.3} ${-r * 0.5} ${r * 0.1} Z`} fill="#4fc46a" stroke={INKC} strokeWidth={6} />
    <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.25} ry={r * 0.12} fill="#fff" opacity={0.35} />
  </g>
);
const Bed: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-60} width={600} height={120} rx={20} fill="#8a5a2b" stroke={INKC} strokeWidth={8} />
    <rect x={-300} y={-110} width={600} height={70} rx={30} fill="#5b6bd6" stroke={INKC} strokeWidth={8} />
    <ellipse cx={-200} cy={-120} rx={80} ry={40} fill="#fff" stroke={INKC} strokeWidth={8} />
    <rect x={-330} y={-200} width={40} height={280} rx={12} fill="#6b4423" stroke={INKC} strokeWidth={8} />
  </g>
);
const Brain: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#ff9ec7" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -150 Q-90 -190 -150 -120 Q-230 -90 -200 0 Q-240 80 -150 130 Q-90 190 0 150 Q90 190 150 130 Q240 80 200 0 Q230 -90 150 -120 Q90 -190 0 -150 Z" fill={c} stroke={INKC} strokeWidth={10} />
    <path d="M0 -150 L0 150 M-120 -60 q 40 30 0 70 M120 -60 q -40 30 0 70 M-80 -120 q 30 30 70 10 M80 -120 q -30 30 -70 10" stroke="#c74a86" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

export const THUMBS2: Record<string, ThumbDef> = {
  "01": {
    bg: ["#ffd27a", "#b5651d"], rays: "#fff4c2", tag: "NOT ALIENS", line1: "HOW PYRAMIDS", line2: "WERE BUILT", s1: 118,
    hero: () => (
      <g>
        <path d="M540 640 L900 1300 L180 1300 Z" fill="#e8b65c" stroke={INKC} strokeWidth={12} strokeLinejoin="round" />
        {[...Array(6)].map((_, i) => <line key={i} x1={540 - (i + 1) * 60} y1={640 + (i + 1) * 110} x2={540 + (i + 1) * 60} y2={640 + (i + 1) * 110} stroke="#b5823a" strokeWidth={8} />)}
        <g transform="translate(870 760) rotate(12)"><ellipse rx={120} ry={40} fill="#9aa4c0" stroke={INKC} strokeWidth={8} /><ellipse cy={-25} rx={50} ry={34} fill="#bfe6ff" stroke={INKC} strokeWidth={8} /><line x1={-150} y1={-80} x2={150} y2={80} stroke={RED} strokeWidth={22} strokeLinecap="round" /></g>
      </g>
    ),
    people: [{ d: CAST[1], x: 300, s: 2.1, mood: "surprised", y: 2170 }],
    arrow: { x1: 980, y1: 1500, x2: 720, y2: 1150 },
  },
  "02": {
    bg: ["#4aa3ff", "#0b1a5a"], rays: "#cfe6ff", tag: "WHAT IF?", line1: "EARTH STOPS", line2: "SPINNING?!",
    hero: () => (
      <g>
        <Planet x={540} y={1000} r={300} />
        <g transform="translate(540 1000)"><rect x={-90} y={-90} width={180} height={180} rx={30} fill={RED} stroke="#fff" strokeWidth={12} transform="rotate(45)" /><T y={22} s={60} c="#fff">STOP</T></g>
        {[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 60} ${700 + i * 220} q 120 -20 260 0`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />)}
      </g>
    ),
    people: [{ d: CAST[34], x: 230, s: 2.0, mood: "surprised", y: 2170 }, { d: CAST[35], x: 850, s: 2.0, mood: "neutral", y: 2170 }],
  },
  "03": {
    bg: ["#ff5a6e", "#3a0b1a"], rays: "#ffd0d6", tag: "PSYCHOLOGY", line1: "3 TRICKS TO", line2: "MAKE YOU SAY YES",  s2: 104,
    hero: () => (
      <g>
        {["FOOT IN DOOR", "DOOR IN FACE", "FREE GIFT"].map((t, i) => (
          <Card key={i} x={540} y={760 + i * 175} w={720} h={140} rot={i % 2 ? 2 : -2}>
            <rect x={-360} y={-70} width={130} height={140} rx={28} fill={[RED, "#7b5cff", "#2fd67b"][i]} />
            <T x={-295} y={24} s={70} c="#fff">{i + 1}</T>
            <T x={60} y={20} s={54}>{t}</T>
          </Card>
        ))}
      </g>
    ),
    people: [{ d: CAST[17], x: 230, s: 2.0, mood: "surprised", y: 2200 }, { d: CAST[3], x: 860, s: 2.0, mood: "happy", y: 2200 }],
  },
  "04": {
    bg: ["#2a6fb0", "#04122a"], rays: "#9fd0ff", tag: "TITANIC", tagC: "#2a6fb0", line1: "WHERE ARE", line2: "THE BODIES?",
    hero: () => (
      <g>
        <path d="M150 1020 L930 1020 L860 1180 L220 1180 Z" fill="#2a2a32" stroke={INKC} strokeWidth={10} transform="rotate(-8 540 1100)" />
        <rect x={320} y={900} width={420} height={110} fill="#f0e8d8" stroke={INKC} strokeWidth={10} transform="rotate(-8 540 1100)" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={360 + i * 100} y={790} width={56} height={120} fill="#e8a23a" stroke={INKC} strokeWidth={8} transform="rotate(-8 540 1100)" />)}
        <g transform="translate(540 1320)"><ellipse cx={-60} rx={70} ry={30} fill="#3a2a20" stroke={INKC} strokeWidth={6} /><ellipse cx={60} rx={70} ry={30} fill="#3a2a20" stroke={INKC} strokeWidth={6} /></g>
        <Big x={540} y={760} s={90} c="#9fd0ff">4 KM DEEP</Big>
      </g>
    ),
    people: [{ d: CAST[45], x: 220, s: 1.9, mood: "neutral", y: 2200 }, { d: CAST[46], x: 860, s: 1.9, mood: "surprised", y: 2200 }],
    arrow: { x1: 980, y1: 1150, x2: 660, y2: 1300 },
  },
  "05": {
    bg: ["#7be0ff", "#0b4a6a"], rays: "#e0f8ff", tag: "YOUR BODY", tagC: "#0b8ac4", line1: "WHY YOU GET", line2: "GOOSEBUMPS",
    hero: () => (
      <g>
        <circle cx={540} cy={1000} r={330} fill="#f2c6a0" stroke={INKC} strokeWidth={12} />
        {[...Array(26)].map((_, i) => { const a = i * 2.4, r = 40 + (i * 37) % 270; const x = 540 + Math.cos(a) * r, y = 1000 + Math.sin(a) * r; return <g key={i}><circle cx={x} cy={y} r={16} fill="#e2a982" stroke={INKC} strokeWidth={4} /><line x1={x} y1={y} x2={x + 4} y2={y - 44} stroke="#5a3a22" strokeWidth={6} strokeLinecap="round" /></g>; })}
        <circle cx={540} cy={1000} r={330} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray="30 18" />
      </g>
    ),
    people: [{ d: CAST[11], x: 250, s: 2.0, mood: "surprised", y: 2200 }],
  },
  "06": {
    bg: ["#ffe36a", "#c46a10"], rays: "#fff8d0", tag: "PSYCHOLOGY", line1: "NOBODY IS", line2: "LOOKING AT YOU",  s2: 112,
    hero: () => (
      <g>
        <path d="M540 700 L880 1400 L200 1400 Z" fill="#fff8c0" opacity={0.75} />
        <circle cx={540} cy={700} r={70} fill="#fff" stroke={INKC} strokeWidth={10} />
        {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${170 + i * 185} 1300)`}><circle r={46} fill="#2a2a3a" /><rect x={-50} y={40} width={100} height={110} rx={30} fill="#2a2a3a" /></g>)}
        <Stamp x={540} y={1010} text="ONLY 25%" s={70} rot={-6} />
      </g>
    ),
    people: [{ d: CAST[22], x: 540, s: 2.2, mood: "surprised", y: 2230 }],
  },
  "07": {
    bg: ["#8a5cff", "#05061a"], rays: "#e0d0ff", tag: "WHAT IF?", tagC: "#7b5cff", line1: "FALLING INTO", line2: "A BLACK HOLE",
    hero: () => (
      <g>
        <ellipse cx={540} cy={1000} rx={420} ry={110} fill="none" stroke="#ffb13b" strokeWidth={46} opacity={0.9} />
        <circle cx={540} cy={1000} r={210} fill="#000" stroke="#ff6a2b" strokeWidth={12} />
        <path d="M120 1000 Q540 1180 960 1000" stroke="#ffb13b" strokeWidth={46} fill="none" />
        <Stamp x={540} y={740} text="SPAGHETTIFIED?!" s={56} rot={-6} c="#ff6a2b" />
      </g>
    ),
    people: [{ d: CAST[2], x: 260, s: 1.9, mood: "surprised", y: 2200 }, { d: CAST[44], x: 840, s: 2.1, mood: "surprised", y: 2200 }],
  },
  "09": {
    bg: ["#ff7a2a", "#3a0606"], rays: "#ffd2a0", tag: "KRAKATOA · 1883", line1: "LOUDEST SOUND", line2: "IN HISTORY", s1: 110,
    hero: () => (
      <g>
        <path d="M200 1350 L470 820 L610 820 L880 1350 Z" fill="#6b4a3a" stroke={INKC} strokeWidth={12} />
        <path d="M470 820 Q400 640 520 560 Q540 460 640 540 Q760 600 610 820 Z" fill="#ff8a2a" stroke={INKC} strokeWidth={10} />
        {[1, 2, 3].map((i) => <circle key={i} cx={540} cy={760} r={140 + i * 110} fill="none" stroke="#fff" strokeWidth={14} opacity={0.75 - i * 0.18} />)}
        <Big x={540} y={1250} s={110}>310 dB?!</Big>
      </g>
    ),
    people: [{ d: CAST[29], x: 230, s: 2.0, mood: "surprised", y: 2210 }, { d: CAST[1], x: 860, s: 2.0, mood: "surprised", y: 2210 }],
  },
  "10": {
    bg: ["#ffb5c8", "#7a2a4a"], rays: "#ffe8ef", tag: "TRUE STORY", tagC: "#c43a6a", line1: "HE WAITED", line2: "9 YEARS 😢",
    hero: () => (
      <g>
        <g transform="translate(540 1180) scale(1.7)">
          <ellipse cx={0} cy={0} rx={130} ry={70} fill="#f2d2a0" stroke={INKC} strokeWidth={6} />
          <circle cx={110} cy={-80} r={70} fill="#f2d2a0" stroke={INKC} strokeWidth={6} />
          <path d="M70 -140 L80 -190 L110 -150 Z M140 -140 L160 -185 L170 -135 Z" fill="#e0b880" stroke={INKC} strokeWidth={6} />
          <circle cx={95} cy={-90} r={8} fill={INKC} /><circle cx={135} cy={-90} r={8} fill={INKC} /><ellipse cx={160} cy={-60} rx={14} ry={10} fill={INKC} />
          <path d="M-130 -10 q -60 -80 0 -110" stroke="#e0b880" strokeWidth={30} fill="none" strokeLinecap="round" />
          {[-80, -20, 40, 90].map((x) => <rect key={x} x={x} y={40} width={26} height={70} rx={10} fill="#f2d2a0" stroke={INKC} strokeWidth={6} />)}
        </g>
        <Card x={540} y={720} w={500} h={110} rot={-3}><T y={24} s={58}>SHIBUYA STATION</T></Card>
      </g>
    ),
    people: [{ d: CAST[12], x: 190, s: 1.8, mood: "surprised", y: 2210 }],
  },
  "11": {
    bg: ["#ff6ad5", "#3a0b4a"], rays: "#ffd0f5", tag: "STRASBOURG · 1518", tagC: "#c43a9a", line1: "THEY DANCED", line2: "UNTIL THEY DROPPED", s2: 96,
    hero: () => (
      <g>
        {[...Array(9)].map((_, i) => { const x = 140 + (i % 5) * 200, y = 900 + Math.floor(i / 5) * 240, c = ["#e4473b", "#3b63b8", "#2f8f6a", "#d8a03a", "#7b5cff"][i % 5]; return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? 10 : -10})`}>
            <circle cy={-110} r={40} fill="#f2c6a0" stroke={INKC} strokeWidth={6} />
            <path d="M-50 -60 L50 -60 L70 80 L-70 80 Z" fill={c} stroke={INKC} strokeWidth={6} />
            <path d="M-50 -50 L-110 -150 M50 -50 L110 -150" stroke={INKC} strokeWidth={14} strokeLinecap="round" />
          </g>); })}
      </g>
    ),
    people: [{ d: CAST[30], x: 540, s: 2.1, mood: "surprised", y: 2250 }],
  },
  "12": {
    bg: ["#ffb13b", "#1a0606"], rays: "#fff0c0", tag: "WHAT IF?", line1: "THE SUN", line2: "DISAPPEARS?!",
    hero: () => (
      <g>
        <circle cx={540} cy={960} r={260} fill="#ffcc33" stroke={INKC} strokeWidth={12} strokeDasharray="40 26" opacity={0.85} />
        <circle cx={540} cy={960} r={200} fill="#000" />
        <Big x={540} y={990} s={120} c="#fff">8 MIN</Big>
        <Planet x={860} y={1300} r={90} />
      </g>
    ),
    people: [{ d: CAST[34], x: 240, s: 2.0, mood: "surprised", y: 2200 }],
  },
  "13": {
    bg: ["#ff4a4a", "#2a0606"], rays: "#ffd0d0", tag: "YALE · 1961", line1: "WOULD YOU", line2: "SHOCK HIM?",
    hero: () => (
      <g>
        <Card x={540} y={1000} w={820} h={380} rot={-2} fill="#2a2a34" stroke={INKC}>
          {[...Array(6)].map((_, i) => <g key={i} transform={`translate(${-330 + i * 132} -40)`}><rect x={-40} y={-60} width={80} height={120} rx={10} fill={i === 5 ? RED : "#888"} stroke={INKC} strokeWidth={6} /><T y={110} s={30} c="#fff">{[15, 90, 180, 270, 360, 450][i]}V</T></g>)}
        </Card>
        <Big x={540} y={760} s={130} c="#fff">65% DID</Big>
      </g>
    ),
    people: [{ d: CAST[17], x: 250, s: 2.0, mood: "surprised", y: 2220 }, { d: CAST[0], x: 850, s: 2.0, mood: "neutral", y: 2220 }],
    circle: { x: 870, y: 960, r: 110 },
  },
  "15": {
    bg: ["#2ab0ff", "#020a2a"], rays: "#b0e8ff", tag: "MARIANA TRENCH", tagC: "#0b6ac4", line1: "HOW DEEP IS", line2: "THE OCEAN?",
    hero: () => (
      <g>
        <path d="M80 640 L380 640 L470 1450 L610 1450 L700 640 L1000 640" fill="none" stroke="#9fd0ff" strokeWidth={14} />
        <path d="M380 640 L470 1450 L610 1450 L700 640 Z" fill="#05153a" />
        <path d="M430 1440 L540 1080 L650 1440 Z" fill="#8a8aa0" stroke={INKC} strokeWidth={8} />
        <path d="M505 1180 L540 1080 L575 1180 Z" fill="#fff" />
        <Big x={540} y={920} s={130}>11 KM</Big>
        <Card x={820} y={1200} w={300} h={90} rot={6}><T y={20} s={42}>EVEREST ↓</T></Card>
      </g>
    ),
    people: [{ d: CAST[42], x: 200, s: 1.9, mood: "surprised", y: 2210 }],
  },
  "16": {
    bg: ["#a0f0b0", "#0b5a3a"], rays: "#e8ffe8", tag: "TRY NOT TO YAWN", tagC: "#1f9a5a", line1: "WHY YAWNS", line2: "ARE CONTAGIOUS",  s2: 112,
    hero: () => (
      <g>
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${240 + i * 300} 1000) scale(${1 - i * 0.12})`}><circle r={130} fill="#f2c6a0" stroke={INKC} strokeWidth={10} /><path d="M-60 -30 q 20 -20 40 0 M20 -30 q 20 -20 40 0" stroke={INKC} strokeWidth={10} fill="none" strokeLinecap="round" /><ellipse cy={55} rx={50} ry={60} fill="#5a1a1a" stroke={INKC} strokeWidth={8} /></g>)}
        <Big x={540} y={780} s={110} c="#fff">YAAAWN</Big>
      </g>
    ),
    people: [{ d: CAST[27], x: 250, s: 2.0, mood: "surprised", y: 2220 }],
  },
  "18": {
    bg: ["#5a6bff", "#0a0a2a"], rays: "#d0d8ff", tag: "1964 EXPERIMENT", tagC: "#4a5ad6", line1: "11 DAYS", line2: "NO SLEEP?!", s1: 150,
    hero: () => (
      <g>
        <g transform="translate(540 990)"><circle r={230} fill="#fff" stroke={INKC} strokeWidth={14} /><line x1={0} y1={0} x2={0} y2={-160} stroke={INKC} strokeWidth={16} strokeLinecap="round" /><line x1={0} y1={0} x2={120} y2={40} stroke={RED} strokeWidth={14} strokeLinecap="round" /><circle r={18} fill={INKC} /></g>
        <ellipse cx={330} cy={760} rx={110} ry={70} fill="#fff" stroke={INKC} strokeWidth={8} /><circle cx={330} cy={760} r={40} fill="#3a5bd1" /><path d="M230 760 l -20 -12 M240 790 l -24 6" stroke={RED} strokeWidth={6} />
        <ellipse cx={750} cy={760} rx={110} ry={70} fill="#fff" stroke={INKC} strokeWidth={8} /><circle cx={750} cy={760} r={40} fill="#3a5bd1" /><path d="M850 760 l 20 -12 M840 790 l 24 6" stroke={RED} strokeWidth={6} />
      </g>
    ),
    people: [{ d: CAST[29], x: 540, s: 2.2, mood: "surprised", y: 2260 }],
  },
  "19": {
    bg: ["#2a8aff", "#04142a"], rays: "#c0e0ff", tag: "THE REAL ANSWER", tagC: "#0b6ac4", line1: "BERMUDA", line2: "TRIANGLE", s1: 140, s2: 150,
    hero: () => (
      <g>
        <path d="M200 1300 L540 700 L880 1300 Z" fill="#0b2a5a" stroke={RED} strokeWidth={16} strokeLinejoin="round" />
        <g transform="translate(540 1080) rotate(-30)"><path d="M0 -60 L22 30 L0 18 L-22 30 Z" fill="#fff" stroke={INKC} strokeWidth={6} /><rect x={-70} y={-6} width={140} height={20} rx={8} fill="#fff" stroke={INKC} strokeWidth={6} /></g>
        <Big x={540} y={1200} s={150} c="#fff">?</Big>
      </g>
    ),
    people: [{ d: CAST[15], x: 210, s: 1.9, mood: "surprised", y: 2200 }, { d: CAST[13], x: 870, s: 1.9, mood: "happy", y: 2200 }],
  },
  "20": {
    bg: ["#6ad06a", "#0b2a10"], rays: "#d8ffd0", tag: "WHAT IF?", tagC: "#2f8f3a", line1: "ALL HUMANS", line2: "VANISHED?!",
    hero: () => (
      <g>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={120 + i * 170} y={760 + (i % 2) * 120} width={140} height={600 - (i % 2) * 120} fill="#4a5060" stroke={INKC} strokeWidth={8} />)}
        {[...Array(14)].map((_, i) => <path key={i} d={`M${130 + i * 62} 1360 q ${20 - (i % 3) * 20} -160 ${(i % 2 ? 40 : -30)} -${220 + (i % 4) * 60}`} stroke="#3aa04a" strokeWidth={18} fill="none" strokeLinecap="round" />)}
        <g transform="translate(820 1300)"><ellipse rx={90} ry={50} fill="#6a6a70" stroke={INKC} strokeWidth={6} /><circle cx={80} cy={-40} r={40} fill="#6a6a70" stroke={INKC} strokeWidth={6} /><path d="M70 -76 L80 -110 L96 -74 Z" fill="#6a6a70" stroke={INKC} strokeWidth={5} /></g>
      </g>
    ),
    people: [{ d: CAST[18], x: 250, s: 2.0, mood: "surprised", y: 2220 }],
  },
  "21": {
    bg: ["#2ab0ff", "#02142a"], rays: "#c0f0ff", tag: "MEGALODON", tagC: "#0b6ac4", line1: "IS IT STILL", line2: "ALIVE?!",
    hero: () => (
      <g transform="translate(540 1000)">
        <path d="M-460 0 Q-200 -200 200 -120 Q380 -90 460 0 Q380 90 200 110 Q-200 180 -460 0 Z" fill="#7d8fa6" stroke={INKC} strokeWidth={12} />
        <path d="M-60 -150 L20 -330 L100 -140 Z" fill="#7d8fa6" stroke={INKC} strokeWidth={12} strokeLinejoin="round" />
        <path d="M-460 0 L-560 -140 L-540 0 L-560 140 Z" fill="#7d8fa6" stroke={INKC} strokeWidth={12} />
        <path d="M200 30 Q330 60 430 20" stroke={INKC} strokeWidth={10} fill="#fff" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${230 + i * 34} 34 l 14 26 l 14 -26`} fill="#fff" stroke={INKC} strokeWidth={4} />)}
        <circle cx={300} cy={-40} r={16} fill={INKC} />
        <Big x={-120} y={-200} s={90} c="#fff">15 M</Big>
      </g>
    ),
    people: [{ d: CAST[11], x: 250, s: 2.0, mood: "surprised", y: 2230 }],
  },
  "22": {
    bg: ["#5a3aa0", "#08051a"], rays: "#c8b0ff", tag: "SLEEP PARALYSIS", tagC: "#5a3aa0", line1: "AWAKE BUT", line2: "CAN'T MOVE?!",
    hero: () => (
      <g>
        <Bed x={540} y={1180} s={1.25} />
        <g transform="translate(830 860)"><path d="M-110 300 Q-130 -60 0 -120 Q130 -60 110 300 Z" fill="#0a0612" opacity={0.92} /><circle cx={-30} cy={-40} r={14} fill={RED} /><circle cx={30} cy={-40} r={14} fill={RED} /></g>
        <g transform="translate(300 1040)"><circle r={60} fill="#f2c6a0" stroke={INKC} strokeWidth={8} /><circle cx={-20} cy={-8} r={10} fill={INKC} /><circle cx={22} cy={-8} r={10} fill={INKC} /><ellipse cy={28} rx={14} ry={10} fill={INKC} /></g>
      </g>
    ),
    people: [{ d: CAST[31], x: 200, s: 1.8, mood: "surprised", y: 2220 }],
  },
  "23": {
    bg: ["#3a4a6a", "#05080f"], rays: "#c0d0ff", tag: "UNSOLVED · 1971", tagC: "#c4572a", line1: "HE JUMPED", line2: "& VANISHED", s1: 140,
    hero: () => (
      <g>
        <g transform="translate(540 760) rotate(-6)"><rect x={-340} y={-50} width={680} height={100} rx={50} fill="#e8edf5" stroke={INKC} strokeWidth={10} /><path d="M120 -40 L260 -150 L320 -150 L240 -40 Z" fill="#3a6ad6" stroke={INKC} strokeWidth={8} /></g>
        <g transform="translate(540 1080)"><path d="M-170 -90 Q0 -260 170 -90 Z" fill="#f4f4f4" stroke={INKC} strokeWidth={10} /><line x1={-160} y1={-90} x2={-20} y2={60} stroke={INKC} strokeWidth={6} /><line x1={160} y1={-90} x2={20} y2={60} stroke={INKC} strokeWidth={6} /><circle cx={0} cy={80} r={34} fill="#2a2a2a" /><rect x={-36} y={110} width={72} height={100} rx={14} fill="#2a2a34" /></g>
        <Big x={540} y={1380} s={110} c="#2fd67b">$200,000</Big>
      </g>
    ),
    people: [{ d: CAST[3], x: 200, s: 1.8, mood: "surprised", y: 2230 }],
  },
  "24": {
    bg: ["#ffb0e0", "#6a2a6a"], rays: "#ffe8f8", tag: "PSYCHOLOGY", tagC: "#c43a9a", line1: "1 OR 2", line2: "MARSHMALLOWS?", s1: 150, s2: 116,
    hero: () => (
      <g>
        <Card x={540} y={1050} w={820} h={340}>
          <g transform="translate(-220 -10)"><rect x={-70} y={-60} width={140} height={120} rx={30} fill="#fff" stroke={INKC} strokeWidth={8} /><T y={130} s={44}>NOW</T></g>
          <T x={0} y={30} s={90} c={RED}>vs</T>
          <g transform="translate(240 -10)"><rect x={-130} y={-60} width={120} height={120} rx={30} fill="#fff" stroke={INKC} strokeWidth={8} /><rect x={10} y={-60} width={120} height={120} rx={30} fill="#fff" stroke={INKC} strokeWidth={8} /><T y={130} s={44}>WAIT 15 MIN</T></g>
        </Card>
      </g>
    ),
    people: [{ d: CAST[44], x: 270, s: 2.2, mood: "surprised", y: 2240 }],
  },
  "25": {
    bg: ["#8a6aff", "#100a30"], rays: "#e0d8ff", tag: "SCIENCE", tagC: "#6a4ad6", line1: "WHY DO", line2: "WE DREAM?", s1: 150, s2: 150,
    hero: () => (
      <g>
        <Bed x={540} y={1300} s={1.1} />
        <path d="M200 900 Q160 760 300 740 Q340 620 480 660 Q560 580 680 650 Q820 620 850 760 Q960 790 900 900 Z" fill="#fff" stroke={INKC} strokeWidth={10} />
        <Brain x={540} y={800} s={0.5} />
        <circle cx={360} cy={1060} r={24} fill="#fff" stroke={INKC} strokeWidth={6} /><circle cx={310} cy={1140} r={14} fill="#fff" stroke={INKC} strokeWidth={5} />
      </g>
    ),
    people: [{ d: CAST[23], x: 860, s: 1.9, mood: "surprised", y: 2230 }],
  },
  "26": {
    bg: ["#ffd27a", "#6a3a10"], rays: "#fff4d0", tag: "ANCIENT ROME", tagC: "#b5651d", line1: "CONCRETE", line2: "THAT HEALS ITSELF", s1: 140, s2: 100,
    hero: () => (
      <g>
        <path d="M200 1250 L200 980 A340 340 0 0 1 880 980 L880 1250 Z" fill="#d8c8a8" stroke={INKC} strokeWidth={12} />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={230 + i * 110} y={1020} width={60} height={230} fill="#c4b494" stroke={INKC} strokeWidth={8} />)}
        <path d="M440 760 L470 860 L430 920 L480 1000" stroke={INKC} strokeWidth={12} fill="none" />
        <path d="M440 760 L470 860 L430 920 L480 1000" stroke="#2fd67b" strokeWidth={6} fill="none" />
        <Big x={540} y={1400} s={110}>2,000 YEARS</Big>
      </g>
    ),
    people: [{ d: CAST[26], x: 860, s: 1.8, mood: "surprised", y: 2250 }],
  },
  "27": {
    bg: ["#5a8aff", "#04081a"], rays: "#d0e0ff", tag: "NASA TWINS", tagC: "#2a5ad6", line1: "WHAT SPACE", line2: "DOES TO YOU", s1: 130,
    hero: () => (
      <g>
        <Planet x={540} y={1150} r={240} />
        <g transform="translate(540 820)"><rect x={-260} y={-30} width={180} height={60} fill="#3a6ad6" stroke={INKC} strokeWidth={8} /><rect x={80} y={-30} width={180} height={60} fill="#3a6ad6" stroke={INKC} strokeWidth={8} /><rect x={-80} y={-60} width={160} height={120} rx={20} fill="#c9d3e6" stroke={INKC} strokeWidth={8} /></g>
        <Big x={250} y={1450} s={100} c="#fff">+5 CM</Big>
      </g>
    ),
    people: [{ d: CAST[2], x: 830, s: 2.0, mood: "surprised", y: 2230 }],
  },
  "28": {
    bg: ["#ff8a3d", "#3a1406"], rays: "#ffe0c0", tag: "PART 2", line1: "READ ANYONE", line2: "IN SECONDS", s1: 130,
    hero: () => (
      <g>
        <g transform="translate(540 960)"><ellipse rx={330} ry={190} fill="#fff" stroke={INKC} strokeWidth={14} /><circle r={150} fill="#3d8ee8" stroke={INKC} strokeWidth={10} /><circle r={80} fill="#111" /><circle cx={-40} cy={-40} r={26} fill="#fff" /></g>
        <Stamp x={540} y={1250} text="LIARS DO THIS" s={66} rot={-5} />
      </g>
    ),
    people: [{ d: CAST[17], x: 220, s: 1.9, mood: "surprised", y: 2230 }, { d: CAST[3], x: 860, s: 1.9, mood: "happy", y: 2230 }],
  },
  "29": {
    bg: ["#ff3ad0", "#140430"], rays: "#ffd0f5", tag: "BRAIN GLITCH", tagC: "#c43a9a", line1: "DÉJÀ VU", line2: "EXPLAINED", s1: 160,
    hero: () => (
      <g>
        <Brain x={540} y={1020} s={1.2} />
        <rect x={250} y={900} width={580} height={30} fill="#33d6ff" opacity={0.7} />
        <rect x={300} y={1080} width={520} height={20} fill="#ff3ad0" opacity={0.7} />
        <Stamp x={540} y={1300} text="I'VE BEEN HERE?!" s={58} rot={-4} c="#7b5cff" />
      </g>
    ),
    people: [{ d: CAST[39], x: 230, s: 1.9, mood: "surprised", y: 2230 }],
  },
  "30": {
    bg: ["#ffa04a", "#3a1406"], rays: "#ffe0c0", tag: "POMPEII · 79 AD", line1: "FROZEN IN ASH", line2: "2,000 YEARS", s1: 116,
    hero: () => (
      <g>
        <path d="M120 1300 L460 760 L620 760 L960 1300 Z" fill="#6b4a3a" stroke={INKC} strokeWidth={12} />
        <path d="M460 760 Q380 560 520 480 Q560 360 680 460 Q820 520 620 760 Z" fill="#555" stroke={INKC} strokeWidth={10} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={200 + i * 150} y={1180} width={50} height={170} fill="#efe0c0" stroke={INKC} strokeWidth={8} />)}
        <rect x={180} y={1150} width={720} height={40} fill="#efe0c0" stroke={INKC} strokeWidth={8} />
      </g>
    ),
    people: [{ d: CAST[25], x: 230, s: 1.9, mood: "surprised", y: 2230 }, { d: CAST[45], x: 860, s: 1.9, mood: "neutral", y: 2230 }],
  },
};
