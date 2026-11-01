// ThumbKit — Shorts thumbnail template (1080x1920 still).
// Layout: bright topic background + sunburst, 2-line hook text (huge, outlined), hero art in the middle,
// big shocked character(s) at the bottom, red arrow / circle pointing at the hero.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FontStyle, VW, VH } from "./kit";
import { FONT, YEL, INKC } from "./factkit";
import { Person, PersonDef } from "./Humans";

export const RED = "#ff2d3d";
export type ThumbDef = {
  bg: [string, string];
  rays?: string;
  line1: string; line2: string; c1?: string; c2?: string; s1?: number; s2?: number;
  tag?: string; tagC?: string;
  hero: () => React.ReactNode;
  people: { d: PersonDef; x: number; s?: number; mood?: "happy" | "neutral" | "surprised"; flip?: boolean; y?: number }[];
  arrow?: { x1: number; y1: number; x2: number; y2: number };
  circle?: { x: number; y: number; r: number };
};

export const Txt: React.FC<{ x: number; y: number; s: number; c: string; children: React.ReactNode; sw?: number; rot?: number; ls?: number }> = ({ x, y, s, c, children, sw, rot = 0, ls = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text x={6} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill="#000" opacity={0.35} letterSpacing={ls}>{children}</text>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill={c} stroke={INKC} strokeWidth={sw ?? s * 0.16} paintOrder="stroke" strokeLinejoin="round" letterSpacing={ls}>{children}</text>
  </g>
);

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${(a * 180) / Math.PI})`}>
      <path d={`M0 -16 L${L - 70} -22 L${L - 80} -58 L${L} 0 L${L - 80} 58 L${L - 70} 22 L0 16 Z`} fill={RED} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
    </g>
  );
};

export const Thumb: React.FC<{ t: ThumbDef }> = ({ t }) => (
  <AbsoluteFill style={{ background: t.bg[1] }}>
    <FontStyle />
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`}>
      <defs>
        <radialGradient id="tbg" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor={t.bg[0]} /><stop offset="1" stopColor={t.bg[1]} /></radialGradient>
        <radialGradient id="tvig" cx="50%" cy="50%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></radialGradient>
      </defs>
      <rect width={VW} height={VH} fill="url(#tbg)" />
      {[...Array(18)].map((_, i) => {
        const a1 = (i / 18) * Math.PI * 2, a2 = a1 + Math.PI / 30;
        return <path key={i} d={`M540 1000 L${540 + Math.cos(a1) * 2200} ${1000 + Math.sin(a1) * 2200} L${540 + Math.cos(a2) * 2200} ${1000 + Math.sin(a2) * 2200} Z`} fill={t.rays ?? "#ffffff"} opacity={0.09} />;
      })}
      {/* hero */}
      <g>{t.hero()}</g>
      {/* people (big, cropped at the bottom) */}
      {t.people.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y ?? 2140}) scale(${(p.flip ? -1 : 1) * (p.s ?? 2.3)} ${p.s ?? 2.3})`}>
          <Person d={p.d} f={40 + i * 13} seed={i * 7} talk={p.mood === "surprised" ? 0.9 : 0.4} mood={p.mood ?? "surprised"} />
        </g>
      ))}
      {t.circle && <circle cx={t.circle.x} cy={t.circle.y} r={t.circle.r} fill="none" stroke={RED} strokeWidth={16} strokeDasharray="0" />}
      {t.arrow && <Arrow {...t.arrow} />}
      <rect width={VW} height={VH} fill="url(#tvig)" />
      {/* hook text */}
      {t.tag && (
        <g transform="translate(540 150) rotate(-2)">
          <rect x={-(t.tag.length * 19 + 50)} y={-52} width={(t.tag.length * 19 + 50) * 2} height={92} rx={18} fill={t.tagC ?? RED} stroke="#fff" strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" letterSpacing={4}>{t.tag}</text>
        </g>
      )}
      <Txt x={540} y={t.tag ? 360 : 300} s={t.s1 ?? 128} c={t.c1 ?? "#ffffff"} rot={-3}>{t.line1}</Txt>
      <Txt x={540} y={t.tag ? 530 : 470} s={t.s2 ?? 150} c={t.c2 ?? YEL} rot={-3}>{t.line2}</Txt>
    </svg>
  </AbsoluteFill>
);
