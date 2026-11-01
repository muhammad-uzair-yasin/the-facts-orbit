import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (start frame of each word, from words.ts WORDS)
const F = {
  ask: 17, askEnd: 62, first: 80, taller: 121, without: 143, astronauts: 204, five: 255, wait: 301, waitEnd: 338, goes: 360,
  and1: 407, pain: 449, face: 466, fluid: 519, head: 555, puffy: 600, what: 661, whatEnd: 678, bones: 704, weaker: 720,
  one: 778, hips: 823, every: 830, month: 838, thats: 856, two: 902, day: 920, twoQ: 945, twoQEnd: 979, everyA: 997,
  nasa: 1035, twins: 1054, scott: 1117, year: 1160, identical: 1199, mark: 1223, changed: 1275, changedEnd: 1303,
  genes: 1334, caps: 1409, longer: 1442, most: 1464, normal: 1497, notall: 1556, sub: 1595,
};

const HULL = "#a9b8cf", HULL2 = "#8797b2", PANEL = "#2b3550", SPACE0 = "#050817", SPACE1 = "#14204a", CYAN = "#58e1ff", RED = "#ff4d5e", GRN = "#3ddc97", ORG = "#ff8a3d", BONE = "#f4ecd6", BLUE = "#3d6ccf";
const PHOTO = CAST[19], ASTRO = CAST[2];
const MARK = { ...CAST[2], name: "Mark", hat: "none" as const, top: "suit" as const, topC: "#2c3550", tie: "#3d6ccf", pants: "#2c3550", shoes: "#111111", face: "mustache" as const, hair: "short" as const, hairC: "#3a3a3a" };
const SCOTT = { ...CAST[2], face: "mustache" as const, hairC: "#3a3a3a" };
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);

// ---------- Q&A kit (local) ----------
const Bubble: React.FC<{ f: number; from: number; to: number; x: number; y: number; lines: string[]; tx: number; ty: number; hue?: string; fs?: number; accent?: string }> = ({ f, from, to, x, y, lines, tx, ty, hue = "#ffffff", fs = 74, accent = "#e8412c" }) => {
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
/** Both floating inside the ISS (gentle zero-g drift). */
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; aMood?: "happy" | "neutral" | "surprised"; hWave?: number }> = ({ f, ax = 270, hx = 810, y = 1440, s = 0.92, aMood = "happy", hWave = 0 }) => (
  <g>
    <g transform={`translate(${ax + Math.sin(f * 0.03) * 10} ${y + Math.sin(f * 0.05) * 14}) rotate(${Math.sin(f * 0.04) * 4}) scale(${s})`}><Person d={PHOTO} f={f} seed={19} talk={askTalk(f)} wave={0} mood={aMood} /></g>
    <g transform={`translate(${hx + Math.sin(f * 0.035 + 1) * 10} ${y - 30 + Math.sin(f * 0.045 + 2) * 16}) rotate(${Math.sin(f * 0.03 + 1) * -5}) scale(${s})`}><Person d={ASTRO} f={f} seed={2} talk={hostTalk(f)} wave={hWave} mood="happy" /></g>
  </g>
);

// ---------- set pieces ----------
const Stars: React.FC<{ f: number; n?: number; seed?: string }> = ({ f, n = 60, seed = "st" }) => (
  <g>{[...Array(n)].map((_, i) => <circle key={i} cx={((rnd(seed + "x" + i) * VW - f * 0.2) % VW + VW) % VW} cy={rnd(seed + "y" + i) * VH} r={0.8 + rnd(seed + "r" + i) * 2.2} fill="#ffffff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))} />)}</g>
);
/** ISS module interior: curved hull, panels, handrails, round window with Earth. */
const ISS: React.FC<{ f: number; tint?: string }> = ({ f, tint = HULL }) => (
  <g>
    <rect width={VW} height={VH} fill={tint} />
    <rect x={0} y={0} width={VW} height={200} fill={HULL2} />
    <rect x={0} y={VH - 260} width={VW} height={260} fill={HULL2} />
    {[...Array(6)].map((_, i) => <rect key={i} x={i * 190 - 20} y={200} width={10} height={VH - 460} fill={HULL2} opacity={0.7} />)}
    {[...Array(5)].map((_, i) => (
      <g key={i} transform={`translate(${60 + i * 210} 230)`}>
        <rect width={170} height={120} rx={10} fill={PANEL} stroke={INKC} strokeWidth={4} />
        {[...Array(6)].map((_, j) => <circle key={j} cx={24 + (j % 3) * 60} cy={36 + Math.floor(j / 3) * 48} r={9} fill={[GRN, ORG, CYAN, RED, YEL, GRN][(i + j) % 6]} opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.1 + i + j))} />)}
      </g>
    ))}
    <rect x={40} y={1300} width={1000} height={18} rx={9} fill="#ffcc33" stroke={INKC} strokeWidth={4} />
    {/* window */}
    <g transform="translate(540 640)">
      <circle r={150} fill={HULL2} stroke={INKC} strokeWidth={8} />
      <defs><clipPath id="win"><circle r={120} /></clipPath></defs>
      <g clipPath="url(#win)">
        <rect x={-130} y={-130} width={260} height={260} fill={SPACE0} />
        <Stars f={f} n={20} seed="w" />
        <circle cx={40} cy={200} r={190} fill="#2b78d4" />
        <path d={`M${-120 + (f * 0.5) % 120} 60 q 40 -30 90 -10 q 30 30 -10 50 Z`} fill="#3ddc97" opacity={0.85} />
        <circle cx={40} cy={200} r={194} fill="none" stroke="#9fd8ff" strokeWidth={10} opacity={0.6} />
      </g>
      <circle r={120} fill="none" stroke={INKC} strokeWidth={6} />
    </g>
    {/* floating pen + water blob */}
    <g transform={`translate(${900 + Math.sin(f * 0.04) * 20} ${980 + Math.sin(f * 0.03) * 30}) rotate(${f * 1.2})`}><rect x={-40} y={-6} width={80} height={12} rx={6} fill={BLUE} stroke={INKC} strokeWidth={3} /></g>
    <circle cx={160 + Math.sin(f * 0.05) * 14} cy={900 + Math.cos(f * 0.04) * 20} r={18 + Math.sin(f * 0.2) * 2} fill={CYAN} opacity={0.7} stroke={INKC} strokeWidth={3} />
  </g>
);
/** Spine: n vertebrae with gap g (stretch). */
const Spine: React.FC<{ x: number; y: number; g: number; glow?: number }> = ({ x, y, g, glow = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {[...Array(10)].map((_, i) => {
      const yy = -i * (70 + g);
      return (
        <g key={i}>
          {i > 0 && <rect x={-30} y={yy + 4} width={60} height={g + 10} rx={8} fill={i < 6 && glow > 0 ? mix("#9fd8ff", RED, glow) : "#9fd8ff"} stroke={INKC} strokeWidth={3} opacity={0.8} />}
          <rect x={-56} y={yy - 56} width={112} height={56} rx={18} fill={BONE} stroke={INKC} strokeWidth={6} />
          <path d={`M56 ${yy - 30} L92 ${yy - 22} M-56 ${yy - 30} L-92 ${yy - 22}`} stroke={INKC} strokeWidth={10} strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);
/** Simple diagram body for "puffy face, bird legs": head scale hs, legs width lw. */
const BodyDiagram: React.FC<{ f: number; x: number; y: number; hs: number; lw: number; color: string; label?: string }> = ({ f, x, y, hs, lw, color, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M-20 0 L-24 -260 M20 0 L24 -260`} stroke={INKC} strokeWidth={lw + 8} strokeLinecap="round" />
    <path d={`M-20 0 L-24 -260 M20 0 L24 -260`} stroke={color} strokeWidth={lw} strokeLinecap="round" />
    <rect x={-70} y={-480} width={140} height={240} rx={40} fill={color} stroke={INKC} strokeWidth={7} />
    <path d="M-70 -450 L-120 -300 M70 -450 L120 -300" stroke={INKC} strokeWidth={30} strokeLinecap="round" />
    <path d="M-70 -450 L-120 -300 M70 -450 L120 -300" stroke={color} strokeWidth={22} strokeLinecap="round" />
    <g transform={`translate(0 -560) scale(${hs})`}>
      <circle r={80} fill="#dca877" stroke={INKC} strokeWidth={7 / hs} />
      <circle cx={-26} cy={-6} r={9} fill={INKC} /><circle cx={26} cy={-6} r={9} fill={INKC} />
      <ellipse cx={-46} cy={22} rx={16} ry={9} fill="#ff6f8a" opacity={0.5 * (hs - 0.9) * 3} /><ellipse cx={46} cy={22} rx={16} ry={9} fill="#ff6f8a" opacity={0.5 * (hs - 0.9) * 3} />
      <path d="M-16 32 q 16 10 32 0" stroke={INKC} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
    {label && <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={INKC}>{label}</text>}
  </g>
);
const Bone: React.FC<{ x: number; y: number; s?: number; holes: number }> = ({ x, y, s = 1, holes }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-220 -40 Q-260 -90 -220 -110 Q-190 -130 -170 -90 L170 -90 Q190 -130 220 -110 Q260 -90 220 -40 Q260 0 220 40 Q260 90 220 110 Q190 130 170 90 L-170 90 Q-190 130 -220 110 Q-260 90 -220 40 Q-260 0 -220 -40 Z"
      fill={BONE} stroke={INKC} strokeWidth={10} strokeLinejoin="round" transform="scale(1 0.8)" />
    {[...Array(26)].map((_, i) => {
      const show = rnd("bh" + i) < holes;
      return show ? <ellipse key={i} cx={-160 + rnd("bx" + i) * 320} cy={-46 + rnd("by" + i) * 92} rx={6 + rnd("br" + i) * 10} ry={5 + rnd("bq" + i) * 7} fill="#c9b78f" stroke={INKC} strokeWidth={2} /> : null;
    })}
  </g>
);
/** Treadmill with astronaut strapped on, running. */
const Treadmill: React.FC<{ f: number; x: number; y: number; s?: number }> = ({ f, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-240} y={0} width={480} height={50} rx={25} fill="#3a3a48" stroke={INKC} strokeWidth={6} />
    {[...Array(9)].map((_, i) => <rect key={i} x={-230 + ((i * 56 - f * 8) % 504 + 504) % 504} y={8} width={16} height={34} fill="#5a5a6a" />)}
    <rect x={180} y={-260} width={22} height={270} fill="#5a5a6a" stroke={INKC} strokeWidth={4} />
    <rect x={120} y={-290} width={140} height={60} rx={12} fill={PANEL} stroke={INKC} strokeWidth={5} />
    <text x={190} y={-250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={GRN}>RUN</text>
    <g transform={`translate(-20 ${-Math.abs(Math.sin(f * 0.45)) * 18}) rotate(${Math.sin(f * 0.45) * 3})`}><Person d={ASTRO} f={f} seed={2} talk={hostTalk(f)} wave={0} mood="happy" /></g>
    <path d="M-60 -290 L-180 0 M20 -290 L-20 -10" stroke={ORG} strokeWidth={8} opacity={0.9} />
    <path d="M60 -290 L180 0" stroke={ORG} strokeWidth={8} opacity={0.9} />
  </g>
);
/** DNA double helix; caps = telomere length at the ends (0..1). */
const DNA: React.FC<{ f: number; x: number; y: number; h: number; cap: number; flick?: number }> = ({ f, x, y, h, cap, flick = 0 }) => {
  const n = 16;
  return (
    <g transform={`translate(${x} ${y})`}>
      {[...Array(n)].map((_, i) => {
        const yy = -h / 2 + (i / (n - 1)) * h;
        const ph = i * 0.6 + f * 0.06;
        const a = Math.sin(ph) * 120, b = -a;
        const on = flick > 0 && rnd("g" + i) < 0.5 && Math.sin(f * 0.3 + i * 2) > 0;
        return (
          <g key={i}>
            <line x1={a} y1={yy} x2={b} y2={yy} stroke={on ? YEL : "#c9d3e6"} strokeWidth={on ? 12 : 8} opacity={0.9} />
            <circle cx={a} cy={yy} r={14} fill={Math.cos(ph) > 0 ? CYAN : "#2b78d4"} stroke={INKC} strokeWidth={3} />
            <circle cx={b} cy={yy} r={14} fill={Math.cos(ph) > 0 ? "#2b78d4" : CYAN} stroke={INKC} strokeWidth={3} />
          </g>
        );
      })}
      {[-1, 1].map((k) => (
        <g key={k}>
          <rect x={-90} y={k < 0 ? -h / 2 - 30 - 120 * cap : h / 2 + 30} width={180} height={120 * cap} rx={30} fill={GRN} stroke={INKC} strokeWidth={6} />
        </g>
      ))}
    </g>
  );
};

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Duo f={f} aMood={speaking(f, "asker", SPK) ? "surprised" : "happy"} />
    <Bubble f={f} from={F.ask} to={F.askEnd} x={420} y={860} lines={["WHAT DOES SPACE", "DO TO YOU?"]} tx={270} ty={1000} fs={64} />
  </g>
);
const S2_Taller: React.FC<{ f: number }> = ({ f }) => {
  const g = eio(ramp(f, F.without - 6, F.five + 10));
  const cm = countUp(f, F.five - 8, F.five + 14, 5);
  return (
    <g>
      <rect width={VW} height={VH} fill="#0d1636" />
      <Stars f={f} />
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.taller, 10) * (1 - ramp(f, F.five - 12, F.five - 4))}>YOU GET TALLER</text>
      <Spine x={360} y={1420} g={lerp(4, 30, g)} />
      {f < F.without + 10 && (
        <g opacity={1 - ramp(f, F.without, F.without + 10)}>
          {[0, 1, 2].map((i) => <path key={i} d={`M${360 + (i - 1) * 50} 480 v 80 m -20 -24 l 20 24 l 20 -24`} stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" />)}
          <text x={360} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={RED}>GRAVITY</text>
        </g>
      )}
      {/* ruler */}
      <g transform="translate(760 1420)">
        <rect x={-50} y={-960} width={100} height={960} fill="#ffd36b" stroke={INKC} strokeWidth={6} />
        {[...Array(24)].map((_, i) => <line key={i} x1={-50} y1={-i * 40} x2={i % 5 === 0 ? 10 : -16} y2={-i * 40} stroke={INKC} strokeWidth={4} />)}
        <path d={`M-90 ${-lerp(726, 960, g)} H90`} stroke={GRN} strokeWidth={8} />
        <path d={`M-90 -726 H90`} stroke={RED} strokeWidth={6} strokeDasharray="14 10" />
      </g>
      {f >= F.five - 8 && <BigNum f={f} at={F.five - 6} text={`+${cm} CM`} x={760} y={380 + 40} hue={GRN} fs={120} />}
    </g>
  );
};
const S3_Great: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Duo f={f} aMood="surprised" />
    <Bubble f={f} from={F.wait} to={F.waitEnd} x={420} y={860} lines={["WAIT, THAT", "SOUNDS GREAT!"]} tx={270} ty={1000} fs={68} />
    {f >= F.goes && <Chip x={720} y={640} w={560} label="GONE BACK ON EARTH" hue={ORG} p={pop(f, F.goes, 10)} fs={34} />}
  </g>
);
const S4_Puffy: React.FC<{ f: number }> = ({ f }) => {
  const back = pop(f, F.pain - 4, 10);
  const fluid = eio(ramp(f, F.fluid - 6, F.head + 10));
  const puff = eio(ramp(f, F.puffy - 6, F.puffy + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill="#c9d8ee" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 170} x2={VW} y2={i * 170} stroke="#b7c8e2" strokeWidth={3} />)}
      {f < F.face - 4 ? (
        <g>
          <g transform="translate(540 1350) scale(1.1)"><Person d={ASTRO} f={f} seed={2} talk={hostTalk(f)} wave={0} mood={f > F.pain ? "surprised" : "happy"} /></g>
          {f >= F.pain - 4 && (
            <g opacity={clamp01(back)}>
              {[0, 1, 2].map((i) => <path key={i} d={`M${640 + i * 20} ${980 + i * 40} l 30 -14 l -14 30 l 34 -10`} stroke={RED} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6 + 0.4 * Math.sin(f * 0.6 + i)} />)}
              <Chip x={540} y={560} w={380} label="BACK PAIN" hue={RED} p={back} fs={44} />
            </g>
          )}
        </g>
      ) : (
        <g>
          <BodyDiagram f={f} x={280} y={1450} hs={1} lw={44} color={BLUE} label="ON EARTH" />
          <BodyDiagram f={f} x={790} y={1450} hs={1 + 0.3 * puff} lw={44 - 22 * puff} color={ORG} label="IN SPACE" />
          {[...Array(5)].map((_, i) => {
            const q = ((f * 0.02 + i * 0.2) % 1);
            return <path key={i} d={`M${760 + (i % 2) * 60} ${1380 - q * 600} v -40 m -16 16 l 16 -16 l 16 16`} stroke={CYAN} strokeWidth={8} fill="none" strokeLinecap="round" opacity={fluid * Math.sin(q * Math.PI)} />;
          })}
          {f >= F.fluid && <Chip x={790} y={520} w={380} label="FLUID FLOATS UP" hue={CYAN} p={pop(f, F.fluid, 10)} fs={34} textColor={INKC} />}
          {f >= F.puffy && (
            <g>
              <rect x={90} y={340} width={900} height={110} rx={55} fill={YEL} stroke={INKC} strokeWidth={7} opacity={pop(f, F.puffy, 10)} />
              <text x={540} y={415} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC} opacity={pop(f, F.puffy, 10)}>"PUFFY FACE, BIRD LEGS"</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};
const S5_Else: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Duo f={f} aMood="neutral" />
    <Bubble f={f} from={F.what} to={F.whatEnd} x={380} y={860} lines={["WHAT ELSE?"]} tx={270} ty={1000} fs={84} />
  </g>
);
const S6_Bones: React.FC<{ f: number }> = ({ f }) => {
  const months = Math.floor(clamp01((f - F.every - 10) / 70) * 6);
  const holes = 0.08 + 0.12 * months + 0.3 * eio(ramp(f, F.weaker - 4, F.weaker + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill="#1a1f3a" />
      <Stars f={f} n={40} />
      <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill="#ffffff" opacity={pop(f, F.bones - 2, 10)}>BONES GET WEAKER</text>
      <Bone x={540} y={820} s={1.6} holes={Math.min(1, holes)} />
      {f >= F.hips - 4 && <Chip x={540} y={1060} w={360} label="HIPS + SPINE" hue={ORG} p={pop(f, F.hips - 4, 10)} fs={38} />}
      {f >= F.one - 4 && <BigNum f={f} at={F.one - 4} text="-1%" x={330} y={1360} hue={RED} fs={170} />}
      {f >= F.month - 4 && (
        <g opacity={pop(f, F.month - 4, 10)}>
          <rect x={600} y={1190} width={300} height={240} rx={20} fill="#ffffff" stroke={INKC} strokeWidth={7} />
          <rect x={600} y={1190} width={300} height={70} rx={20} fill={RED} stroke={INKC} strokeWidth={7} />
          <text x={750} y={1242} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff">EVERY</text>
          <text x={750} y={1380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INKC}>MONTH</text>
        </g>
      )}
    </g>
  );
};
const S7_Treadmill: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} tint="#e6ecf4" />
    <Treadmill f={f} x={520} y={1470} s={1.0} />
    {f >= F.two - 6 && <BigNum f={f} at={F.two - 6} text="2 HRS" x={540} y={480} hue={GRN} fs={150} />}
    {f >= F.day - 4 && <Chip x={540} y={880} w={340} label="EVERY DAY" hue={ORG} p={pop(f, F.day - 4, 10)} fs={42} />}
  </g>
);
const S8_TwoHrs: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Duo f={f} aMood="surprised" />
    <Bubble f={f} from={F.twoQ} to={F.twoQEnd} x={420} y={860} lines={["2 HOURS,", "EVERY DAY?!"]} tx={270} ty={1000} fs={76} />
    {f >= F.everyA && <Stamp f={f} at={F.everyA} x={560} y={900} text="EVERY DAY" hue={GRN} fs={74} rot={-8} />}
  </g>
);
/** 9: NASA twins study — Scott in space, Mark on Earth. */
const S9_Twins: React.FC<{ f: number }> = ({ f }) => {
  const sp = pop(f, F.twins - 4, 12), ea = pop(f, F.twins + 6, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill={SPACE0} />
      <Stars f={f} n={80} />
      <text x={540} y={320} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill="#ffffff" opacity={pop(f, F.nasa, 10) * (f < F.scott ? 1 : 0)}>NASA TWINS STUDY</text>
      {/* left: space */}
      <g opacity={clamp01(sp)}>
        <rect x={60} y={420} width={460} height={980} rx={30} fill="#0b1236" stroke={CYAN} strokeWidth={6} />
        <g transform="translate(290 720)">
          <rect x={-150} y={-20} width={300} height={40} fill={HULL2} stroke={INKC} strokeWidth={4} />
          <rect x={-40} y={-60} width={80} height={120} rx={10} fill={HULL} stroke={INKC} strokeWidth={4} />
          {[-1, 1].map((k) => <rect key={k} x={k > 0 ? 160 : -220} y={-70} width={60} height={140} fill="#2b4fa8" stroke={INKC} strokeWidth={4} />)}
        </g>
        <g transform={`translate(${290 + Math.sin(f * 0.04) * 16} ${1220 + Math.sin(f * 0.05) * 18}) rotate(${Math.sin(f * 0.03) * 10}) scale(0.72)`}><Person d={SCOTT} f={f} seed={4} talk={0} wave={1} mood="happy" /></g>
        <text x={290} y={1460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={CYAN}>SCOTT · SPACE</text>
      </g>
      {/* right: earth */}
      <g opacity={clamp01(ea)}>
        <rect x={560} y={420} width={460} height={980} rx={30} fill="#9fd8ff" stroke={GRN} strokeWidth={6} />
        <circle cx={900} cy={540} r={50} fill="#fff3c4" />
        <rect x={562} y={1200} width={456} height={198} rx={0} fill="#5cc26a" />
        <g transform="translate(790 1260) scale(0.72)"><Person d={MARK} f={f} seed={5} talk={0} wave={0} mood="happy" /></g>
        <text x={790} y={1460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={GRN} opacity={f < F.scott || f >= F.mark - 20 ? 1 : 0}>MARK · EARTH</text>
      </g>
      {f >= F.year - 4 && <Chip x={540} y={1545} w={600} label="ALMOST A YEAR (340 DAYS)" hue={YEL} p={pop(f, F.year - 4, 10)} fs={34} textColor={INKC} />}
      {f >= F.identical && <Chip x={790} y={480 + 40} w={300} label="IDENTICAL TWIN" hue={GRN} p={pop(f, F.identical, 10)} fs={26} textColor={INKC} />}
    </g>
  );
};
const S10_Changed: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Duo f={f} aMood="surprised" />
    <Bubble f={f} from={F.changed} to={F.changedEnd} x={420} y={860} lines={["SO WHAT", "CHANGED?"]} tx={270} ty={1000} fs={78} />
  </g>
);
/** 11: genes switch on/off; DNA caps (telomeres) get longer; most went back, not all. */
const S11_DNA: React.FC<{ f: number }> = ({ f }) => {
  const capUp = eio(ramp(f, F.caps - 4, F.longer + 20));
  const back = eio(ramp(f, F.normal - 10, F.normal + 20));
  const cap = 0.35 + 0.55 * capUp - 0.4 * back;
  return (
    <g>
      <rect width={VW} height={VH} fill="#0b1236" />
      <Stars f={f} n={40} />
      <DNA f={f} x={360} y={1000} h={760} cap={cap} flick={ramp(f, F.genes - 4, F.genes + 6) * (1 - back)} />
      {f >= F.genes && <Chip x={540} y={340} w={600} label="GENES SWITCH ON / OFF" hue={YEL} p={pop(f, F.genes, 10)} fs={36} textColor={INKC} />}
      {f >= F.caps - 4 && (
        <g opacity={pop(f, F.caps - 4, 10)}>
          <path d="M470 470 L620 470" stroke={GRN} strokeWidth={6} />
          <text x={780} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={GRN}>DNA CAPS</text>
          <text x={780} y={510} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#c9d3e6">(TELOMERES)</text>
        </g>
      )}
      {f >= F.longer && f < F.most && <BigNum f={f} at={F.longer} text="LONGER ↑" x={780} y={1000} hue={GRN} fs={86} />}
      {f >= F.most && (
        <g>
          <rect x={570} y={820} width={440} height={130} rx={24} fill="#ffffff" stroke={INKC} strokeWidth={7} opacity={pop(f, F.most, 10)} />
          <text x={790} y={905} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC} opacity={pop(f, F.most, 10)}>MOST: NORMAL ✓</text>
        </g>
      )}
      {f >= F.notall && <Stamp f={f} at={F.notall} x={780} y={1180} text="NOT ALL" hue={RED} fs={92} rot={-8} />}
    </g>
  );
};
const S12_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <ISS f={f} />
    <Outro f={f} at={F.sub} light />
    <g transform={`translate(190 ${1500 + Math.sin(f * 0.05) * 14}) scale(0.82)`}><Person d={ASTRO} f={f} seed={2} talk={hostTalk(f)} wave={1} mood="happy" /></g>
    <g transform={`translate(890 ${1500 + Math.sin(f * 0.05 + 1) * 14}) scale(0.82)`}><Person d={PHOTO} f={f} seed={19} talk={0} wave={1} mood="happy" /></g>
  </g>
);

export const SpaceBodyFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.first, render: () => <S1_Ask f={f} />, cam: [[0, { x: 450, y: 1000, z: 1.16 }], [F.askEnd, { x: 490, y: 980, z: 1.12 }], [F.first, { x: 520, y: 960, z: 1.08 }]] },
    { from: F.first, to: F.astronauts, tr: "zoom", render: () => <S2_Taller f={f} />, cam: [[F.first, { x: 540, y: 500, z: 1.2 }], [F.without, { x: 450, y: 1000, z: 1.05 }], [F.astronauts, { x: 420, y: 1050, z: 1.12 }]] },
    { from: F.astronauts, to: F.wait, tr: "cut", render: () => <S2_Taller f={f} />, cam: [[F.astronauts, { x: 700, y: 700, z: 1.2 }], [F.five, { x: 640, y: 860, z: 1.04 }], [F.wait, { x: 640, y: 860, z: 1.1 }]] },
    { from: F.wait, to: F.and1, tr: "whip", render: () => <S3_Great f={f} />, cam: [[F.wait, { x: 450, y: 1000, z: 1.16 }], [F.goes, { x: 520, y: 940, z: 1.06 }], [F.and1, { x: 540, y: 940, z: 1.1 }]] },
    { from: F.and1, to: F.face, tr: "iris", render: () => <S4_Puffy f={f} />, cam: [[F.and1, { x: 540, y: 1000, z: 1.12 }], [F.pain, { x: 580, y: 950, z: 1.22 }], [F.face, { x: 580, y: 950, z: 1.26 }]] },
    { from: F.face, to: F.what, tr: "whip", render: () => <S4_Puffy f={f} />, cam: [[F.face, { x: 540, y: 1000, z: 1.0 }], [F.fluid, { x: 640, y: 1000, z: 1.1 }], [F.puffy, { x: 540, y: 900, z: 1.02 }], [F.what, { x: 540, y: 900, z: 1.06 }]] },
    { from: F.what, to: F.bones - 8, tr: "push", render: () => <S5_Else f={f} />, cam: [[F.what, { x: 450, y: 1000, z: 1.18 }], [F.bones - 8, { x: 490, y: 1000, z: 1.12 }]] },
    { from: F.bones - 8, to: F.thats, tr: "wipe", render: () => <S6_Bones f={f} />, cam: [[F.bones - 8, { x: 540, y: 700, z: 1.2 }], [F.weaker, { x: 540, y: 820, z: 1.05 }], [F.one, { x: 540, y: 1100, z: 1.06 }], [F.thats, { x: 540, y: 1100, z: 1.08 }]] },
    { from: F.thats, to: F.twoQ, tr: "spin", render: () => <S7_Treadmill f={f} />, cam: [[F.thats, { x: 540, y: 1200, z: 1.22 }], [F.two, { x: 540, y: 900, z: 1.02 }], [F.twoQ, { x: 540, y: 1000, z: 1.08 }]] },
    { from: F.twoQ, to: F.nasa - 6, tr: "whipUp", render: () => <S8_TwoHrs f={f} />, cam: [[F.twoQ, { x: 450, y: 1000, z: 1.18 }], [F.everyA, { x: 520, y: 900, z: 1.06 }], [F.nasa - 6, { x: 540, y: 900, z: 1.1 }]] },
    { from: F.nasa - 6, to: F.scott, tr: "flash", render: () => <S9_Twins f={f} />, cam: [[F.nasa - 6, { x: 540, y: 500, z: 1.25 }], [F.twins, { x: 540, y: 900, z: 1.02 }], [F.scott, { x: 540, y: 960, z: 1.06 }]] },
    { from: F.scott, to: F.changed, tr: "cut", render: () => <S9_Twins f={f} />, cam: [[F.scott, { x: 420, y: 1100, z: 1.12 }], [F.year, { x: 480, y: 1100, z: 1.08 }], [F.mark, { x: 640, y: 1100, z: 1.08 }], [F.changed - 20, { x: 540, y: 1000, z: 1.0 }]] },
    { from: F.changed, to: F.genes - 8, tr: "push", render: () => <S10_Changed f={f} />, cam: [[F.changed, { x: 450, y: 1000, z: 1.18 }], [F.genes - 8, { x: 490, y: 1000, z: 1.12 }]] },
    { from: F.genes - 8, to: F.most, tr: "zoom", render: () => <S11_DNA f={f} />, cam: [[F.genes - 8, { x: 400, y: 900, z: 1.2 }], [F.caps, { x: 540, y: 700, z: 1.08 }], [F.longer, { x: 560, y: 960, z: 1.02 }], [F.most, { x: 600, y: 960, z: 1.08 }]] },
    { from: F.most, to: F.sub, tr: "cut", render: () => <S11_DNA f={f} />, cam: [[F.most, { x: 700, y: 900, z: 1.25 }], [F.notall, { x: 600, y: 1000, z: 1.06 }], [F.sub, { x: 580, y: 1000, z: 1.1 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "iris", render: () => <S12_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.taller, 0.1], [F.five, 0.12], [F.pain, 0.1], [F.puffy, 0.1], [F.weaker, 0.08], [F.one, 0.12], [F.two, 0.1], [F.everyA, 0.12], [F.nasa, 0.08], [F.year, 0.08], [F.longer, 0.1], [F.notall, 0.14]];
  const SHAKE: [number, number][] = [[F.pain, 8], [F.one, 10], [F.everyA, 8], [F.notall, 12]];
  const SFX: Cue[] = [
    [F.ask - 2, "pop", 0.4], [F.taller, "boom", 0.35], [F.without - 6, "riser", 0.3], [F.five - 6, "impact", 0.4],
    [F.wait - 2, "pop", 0.45], [F.goes, "pop", 0.3], [F.pain - 4, "impact", 0.4], [F.fluid, "whoosh", 0.3], [F.puffy, "pop", 0.45],
    [F.what - 2, "pop", 0.4], [F.bones - 2, "boom", 0.35], [F.hips - 4, "pop", 0.3], [F.one - 4, "impact", 0.45], [F.month - 4, "tick", 0.4],
    [F.two - 6, "pop", 0.4], [F.day - 4, "pop", 0.35], [F.twoQ - 2, "pop", 0.45], [F.everyA, "impact", 0.4],
    [F.nasa, "pop", 0.3], [F.scott - 4, "whoosh", 0.3], [F.mark - 4, "whoosh", 0.3], [F.year - 4, "tick", 0.4],
    [F.changed - 2, "pop", 0.4], [F.genes, "pop", 0.35], [F.caps - 4, "pop", 0.35], [F.longer, "riser", 0.3], [F.most, "pop", 0.35], [F.notall, "boom", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const dark = (f >= F.first && f < F.wait) || (f >= F.bones - 6 && f < F.thats) || (f >= F.nasa - 6 && f < F.changed) || (f >= F.genes - 8 && f < F.sub);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light={!dark} />
        <Cover f={f} word="SPACE BODY" sub="WHAT SPACE DOES TO YOU" until={F.first - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={ORG} theme={dark ? "dark" : "light"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="spacebody" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
