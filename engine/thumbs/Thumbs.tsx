import React from "react";
import { lerp } from "./kit";
import { FONT, YEL, INKC } from "./factkit";
import { CAST } from "./Humans";
import { ThumbDef, Txt, RED } from "./ThumbKit";

// ---------- shared hero pieces ----------
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
const Mushroom: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={250} rx={220} ry={50} fill={c} opacity={0.6} />
    <path d="M-50 240 Q-40 60 -60 -40 L60 -40 Q40 60 50 240 Z" fill={c} stroke={INKC} strokeWidth={8} />
    <path d="M-200 -60 Q-230 -200 -100 -230 Q-60 -320 40 -290 Q160 -320 190 -210 Q260 -150 200 -60 Q120 -10 0 -30 Q-120 -10 -200 -60 Z" fill={c} stroke={INKC} strokeWidth={8} />
    <path d="M-150 -110 Q-130 -190 -60 -190 M40 -230 Q120 -240 140 -160" stroke="#fff" strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
  </g>
);
const Emu: React.FC<{ x: number; y: number; s?: number; flip?: boolean; medal?: boolean }> = ({ x, y, s = 1, flip, medal }) => {
  const a = 28, hipY = -170;
  const leg = (ang: number, k: number) => {
    const r = (ang * Math.PI) / 180, kx = Math.sin(r) * 85, ky = hipY + Math.cos(r) * 85, fx = kx - Math.sin(r * 0.6) * 20 - 6, fy = -2 - k * 14;
    return <g key={k}><path d={`M0 ${hipY} L${kx} ${ky} L${fx} ${fy}`} stroke="#6a5a48" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${fx - 18} ${fy} L${fx + 26} ${fy}`} stroke="#6a5a48" strokeWidth={8} strokeLinecap="round" /></g>;
  };
  const nx = 110, ny = -380;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {leg(a, 0)}{leg(-a, 1)}
      <path d={`M60 -245 Q100 -320 ${nx} ${ny + 18}`} stroke="#7f8ea8" strokeWidth={28} fill="none" strokeLinecap="round" />
      <path d="M-100 -215 Q-110 -290 -10 -292 Q80 -296 90 -230 Q92 -170 20 -158 Q-40 -150 -100 -175 Q-118 -190 -100 -215Z" fill="#6e5440" stroke={INKC} strokeWidth={6} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${-80 + i * 24} ${-180 + (i % 2) * 6} q 6 22 -6 36`} stroke="#3e2f24" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <g transform={`translate(${nx} ${ny})`}>
        <ellipse rx={32} ry={27} fill="#6f7f9a" stroke={INKC} strokeWidth={5} />
        <path d="M18 -6 Q56 0 20 12Z" fill="#3a3a3a" stroke={INKC} strokeWidth={4} />
        <circle cx={6} cy={-6} r={10} fill="#fff" stroke={INKC} strokeWidth={3} /><circle cx={9} cy={-6} r={5} fill="#c4572a" />
        <path d="M-12 -22 L14 -14" stroke={INKC} strokeWidth={5} strokeLinecap="round" />
      </g>
      {medal && <g transform="translate(60 -250)"><path d="M-16 -44 L0 0 L16 -44" stroke={RED} strokeWidth={12} fill="none" /><circle r={30} fill={YEL} stroke={INKC} strokeWidth={6} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>1</text></g>}
    </g>
  );
};

// ---------- thumbnails ----------
export const THUMBS: Record<string, ThumbDef> = {
  "08": {
    bg: ["#ff9a3c", "#7a1d10"], rays: "#ffe9b0",
    tag: "TRUE STORY", line1: "HE SURVIVED", line2: "BOTH BOMBS?!", s2: 128,
    hero: () => (
      <g>
        <Mushroom x={250} y={930} s={0.95} c="#ffb35c" />
        <Mushroom x={830} y={930} s={0.95} c="#ff8a3d" />
        <Card x={250} y={1250} w={360} h={110} rot={-4}><T y={22} s={56}>AUG 6</T></Card>
        <Card x={830} y={1250} w={360} h={110} rot={4}><T y={22} s={56}>AUG 9</T></Card>
      </g>
    ),
    people: [{ d: CAST[17], x: 540, s: 2.5, mood: "surprised", y: 2230 }],
  },
  "14": {
    bg: ["#5b3cff", "#140b45"], rays: "#c9b8ff",
    tag: "MANDELA EFFECT", tagC: "#7b5cff", line1: "THIS NEVER", line2: "HAPPENED!", c2: "#ff5a6e",
    hero: () => (
      <g>
        <Card x={540} y={960} w={880} h={340} rot={-3}>
          <rect x={-440} y={-170} width={880} height={84} rx={28} fill={RED} />
          <T y={-112} s={50} c="#fff">YOUR MEMORY ✗</T>
          <T y={10} s={76}>“LUKE, I AM</T>
          <T y={100} s={76}>YOUR FATHER.”</T>
        </Card>
        <g transform="translate(640 1135) rotate(-8)">
          <rect x={-300} y={-60} width={600} height={120} rx={20} fill="#fff" stroke={RED} strokeWidth={14} />
          <text y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={88} fill={RED} letterSpacing={4}>NEVER SAID</text>
        </g>
      </g>
    ),
    people: [{ d: CAST[33], x: 300, s: 2.15, mood: "surprised", y: 2130 }, { d: CAST[3], x: 820, s: 2.15, mood: "happy", y: 2130 }],
  },
  "17": {
    bg: ["#ffcf5a", "#b5541b"], rays: "#fff4c2",
    tag: "AUSTRALIA · 1932", tagC: "#2f6db5", line1: "THE ARMY LOST", line2: "TO BIRDS?!", s1: 116,
    hero: () => (
      <g>
        <Emu x={560} y={1360} s={1.9} medal />
        <Emu x={190} y={1250} s={1.0} />
        <Emu x={930} y={1260} s={1.0} flip />
        <g transform="translate(860 840) rotate(10)">
          <rect x={-150} y={-56} width={300} height={112} rx={20} fill="#fff" stroke={INKC} strokeWidth={8} />
          <T y={22} s={60} c={RED}>WINNER</T>
        </g>
      </g>
    ),
    people: [{ d: CAST[21], x: 230, s: 2.0, mood: "surprised", y: 2160 }],
    arrow: { x1: 980, y1: 1500, x2: 760, y2: 1250 },
  },
};
