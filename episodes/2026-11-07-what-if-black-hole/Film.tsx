import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (from gen_words cue table)
const F = {
  ask: 17, depends: 80, size: 119, small: 181, stretched: 380, thinner: 420, noodle: 466, spag: 501,
  supermassive: 594, cross: 774, nothing: 843, strange: 900, friend: 956, slow: 1082, freeze: 1125, red: 1168,
  you: 1229, through: 1293, two: 1346, both: 1413, sub: 1463,
};
const SPACE0 = "#05060f", SPACE1 = "#141a3a", DISK = "#ffb13b", DISK2 = "#ff6a2b", CYAN = "#58e1ff", RED = "#ff3b3b", PURP = "#8a5cff";
const ASTRO = CAST[2], KID = CAST[44];
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const kidTalk = (f: number) => talkFor(f, "kid", SPK, ENV);

// ---------- set pieces ----------
const Stars: React.FC<{ f: number; n?: number; seed?: string; drift?: number }> = ({ f, n = 90, seed = "st", drift = 0.15 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const x = ((rnd(seed + "x" + i) * VW - f * drift * (0.3 + rnd(seed + "d" + i))) % VW + VW) % VW;
      const y = rnd(seed + "y" + i) * VH;
      const r = 0.8 + rnd(seed + "r" + i) * 2.4;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.35 + 0.55 * Math.abs(Math.sin(f * 0.05 + i))} />;
    })}
  </g>
);
const Space: React.FC<{ f: number; tint?: string }> = ({ f, tint = PURP }) => (
  <g>
    <defs>
      <radialGradient id="nebula" cx="30%" cy="25%" r="80%">
        <stop offset="0" stopColor={SPACE1} /><stop offset="1" stopColor={SPACE0} />
      </radialGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#nebula)" />
    <ellipse cx={220} cy={360} rx={380} ry={180} fill={tint} opacity={0.12} />
    <ellipse cx={860} cy={1500} rx={420} ry={200} fill="#2b6cff" opacity={0.1} />
    <Stars f={f} />
  </g>
);
/** Black hole with swirling accretion disk + photon ring. r = shadow radius. */
const BlackHole: React.FC<{ f: number; x: number; y: number; r: number; tilt?: number; glow?: number }> = ({ f, x, y, r, tilt = 0.32, glow = 1 }) => {
  const id = `bh${Math.round(r)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stopColor={DISK} stopOpacity={0.0} />
          <stop offset="0.7" stopColor={DISK} stopOpacity={0.55 * glow} />
          <stop offset="1" stopColor={DISK2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 3.2} fill={`url(#${id}g)`} />
      {/* back half of disk (behind shadow), lensed arc over the top */}
      <path d={`M${-r * 2.6} 0 A${r * 2.6} ${r * 2.6 * tilt} 0 0 1 ${r * 2.6} 0`} fill="none" stroke={DISK} strokeWidth={r * 0.5} opacity={0.75 * glow} />
      <path d={`M${-r * 1.35} ${-r * 0.2} A${r * 1.4} ${r * 1.45} 0 0 1 ${r * 1.35} ${-r * 0.2}`} fill="none" stroke="#ffd98a" strokeWidth={r * 0.18} opacity={0.85 * glow} />
      <circle r={r} fill="#000" />
      <circle r={r * 1.03} fill="none" stroke="#ffe7b0" strokeWidth={r * 0.06} opacity={0.9 * glow} />
      {/* front half of disk with swirling streaks */}
      <g transform={`scale(1 ${tilt})`}>
        <path d={`M${-r * 2.6} 0 A${r * 2.6} ${r * 2.6} 0 0 0 ${r * 2.6} 0`} fill="none" stroke={DISK} strokeWidth={r * 0.55} opacity={0.9 * glow} />
        {[...Array(10)].map((_, i) => {
          const a0 = ((f * 1.6 + i * 36) % 360) * Math.PI / 180;
          const rr = r * (1.7 + (i % 3) * 0.35);
          if (Math.sin(a0) < 0) return null;
          return <path key={i} d={`M${Math.cos(a0) * rr} ${Math.sin(a0) * rr} A${rr} ${rr} 0 0 1 ${Math.cos(a0 + 0.5) * rr} ${Math.sin(a0 + 0.5) * rr}`} stroke="#fff3cf" strokeWidth={r * 0.06} fill="none" opacity={0.8 * glow} strokeLinecap="round" />;
        })}
      </g>
    </g>
  );
};
const Telescope: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 L-40 120 M0 0 L40 120 M0 0 L0 125" stroke="#3a3a48" strokeWidth={8} strokeLinecap="round" />
    <g transform="rotate(-32)">
      <rect x={-20} y={-24} width={150} height={44} rx={10} fill="#e8ecf5" stroke={INKC} strokeWidth={5} />
      <rect x={120} y={-30} width={26} height={56} rx={6} fill="#5a6a90" stroke={INKC} strokeWidth={5} />
      <rect x={-38} y={-14} width={22} height={24} rx={5} fill="#5a6a90" stroke={INKC} strokeWidth={4} />
    </g>
  </g>
);
const Arrow: React.FC<{ x: number; y: number; len: number; w: number; color: string; o?: number }> = ({ x, y, len, w, color, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <line x1={0} y1={0} x2={0} y2={len} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <path d={`M${-w * 1.6} ${len - w} L0 ${len + w * 1.8} L${w * 1.6} ${len - w} Z`} fill={color} />
  </g>
);
const Clock: React.FC<{ x: number; y: number; a: number; color: string; label: string; stopped?: boolean }> = ({ x, y, a, color, label, stopped }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={70} fill="#0d1230" stroke={color} strokeWidth={8} />
    {[...Array(12)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 6) * 54} y1={-Math.cos(i * Math.PI / 6) * 54} x2={Math.sin(i * Math.PI / 6) * 62} y2={-Math.cos(i * Math.PI / 6) * 62} stroke="#c9d3e6" strokeWidth={4} />)}
    <line x1={0} y1={0} x2={Math.sin(a) * 48} y2={-Math.cos(a) * 48} stroke={color} strokeWidth={8} strokeLinecap="round" />
    <circle r={8} fill={color} />
    <text y={112} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={stopped ? RED : "#fff"} letterSpacing={2}>{label}</text>
  </g>
);
/** Astronaut floating in space (Person rotated, drifting). */
const Floater: React.FC<{ f: number; x: number; y: number; s: number; rot?: number; sx?: number; sy?: number; mood?: "happy" | "neutral" | "surprised"; red?: number }> = ({ f, x, y, s, rot = 0, sx = 1, sy = 1, mood = "neutral", red = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s * sy})`}>
    <g opacity={1 - red}><Person d={ASTRO} f={f} seed={3} talk={hostTalk(f)} wave={0} mood={mood} /></g>
    {red > 0 && <g opacity={red} filter="url(#redshift)"><Person d={ASTRO} f={f} seed={3} talk={0} wave={0} mood="neutral" /></g>}
  </g>
);

// ---------- shots ----------
const S1_Hill: React.FC<{ f: number }> = ({ f }) => {
  const kidLook = speaking(f, "kid", SPK) ? "surprised" : "happy";
  const astroIn = eout(ramp(f, F.depends - 20, F.depends + 6));
  return (
    <g>
      <Space f={f} />
      <circle cx={820} cy={380} r={70} fill="#f2ecd8" opacity={0.85} />
      <circle cx={846} cy={364} r={62} fill={SPACE1} opacity={0.9} />
      <path d={`M0 1360 Q 300 1270 600 1330 T 1080 1300 V ${VH} H 0 Z`} fill="#1b2142" />
      <path d={`M0 1430 Q 340 1380 700 1420 T 1080 1400 V ${VH} H 0 Z`} fill="#121733" />
      <Telescope x={330} y={1310} />
      <g transform="translate(250 1440) scale(0.92)">
        <Person d={KID} f={f} seed={45} talk={kidTalk(f)} wave={0} mood={kidLook} />
      </g>
      <g transform={`translate(${lerp(1250, 760, astroIn)} 1450) scale(0.86)`}>
        <Person d={ASTRO} f={f} seed={3} talk={hostTalk(f)} wave={f > F.depends && f < F.size ? 1 : 0} mood="happy" />
      </g>
      {f >= F.ask + 20 && f < F.depends && (
        <g opacity={pop(f, F.ask + 20, 10)}>
          {[0, 1, 2].map((i) => <text key={i} x={180 + i * 60} y={900 - i * 30 + Math.sin(f * 0.15 + i) * 8} fontFamily={FONT} fontWeight={800} fontSize={80 - i * 12} fill={YEL} stroke={INKC} strokeWidth={7} paintOrder="stroke">?</text>)}
        </g>
      )}
    </g>
  );
};
const S2_Size: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(f, F.size + 4, 14), b = pop(f, F.size + 20, 16);
  return (
    <g>
      <Space f={f} tint="#ff8a3d" />
      <g opacity={clamp01(a)} transform={`translate(290 760) scale(${clamp01(a)})`}><BlackHole f={f} x={0} y={0} r={46} /></g>
      <g opacity={clamp01(b)} transform={`translate(760 1080) scale(${clamp01(b)})`}><BlackHole f={f} x={0} y={0} r={150} /></g>
      <Chip x={290} y={560} w={340} label="FEW × SUN" hue="#ff8a3d" p={a} fs={36} />
      <Chip x={760} y={720} w={380} label="SUPERMASSIVE" hue={PURP} p={b} fs={36} />
      <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.size, 10)}>SIZE MATTERS</text>
    </g>
  );
};
const S3_Small: React.FC<{ f: number }> = ({ f }) => {
  const approach = eio(ramp(f, F.small, F.stretched));
  const st = eio(ramp(f, F.stretched - 4, F.noodle + 20));
  const sy = 1 + st * 1.25 + (f >= F.noodle ? Math.sin((f - F.noodle) * 0.4) * 0.06 * (1 - ramp(f, F.noodle, F.spag + 40)) : 0);
  const sx = 1 - st * 0.55;
  const ay = lerp(760, 1040, approach);
  const arrows = ramp(f, F.small + 120, F.small + 150);
  return (
    <g>
      <Space f={f} tint="#ff6a2b" />
      <BlackHole f={f} x={540} y={1430} r={95} />
      <g transform={`translate(${540 + Math.sin(f * 0.05) * 8} ${ay})`}>
        <Floater f={f} x={0} y={0} s={0.72} sx={sx} sy={sy} mood={f >= F.stretched ? "surprised" : "neutral"} />
      </g>
      {arrows > 0 && (
        <g>
          <Arrow x={430} y={ay - 360 * 0.72 * sy} len={50} w={7} color={CYAN} o={arrows} />
          <Arrow x={430} y={ay - 30} len={130 + st * 40} w={14} color={RED} o={arrows} />
          <text x={340} y={ay - 360 * 0.72 * sy + 30} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={30} fill={CYAN} opacity={arrows}>HEAD: WEAK PULL</text>
          <text x={400} y={ay + 60} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={30} fill={RED} opacity={arrows}>FEET: STRONG PULL</text>
        </g>
      )}
      {f >= F.noodle && f < F.spag && (
        <g transform={`translate(840 ${620 + Math.sin(f * 0.2) * 6}) rotate(8)`} opacity={pop(f, F.noodle, 10)}>
          <path d="M-60 0 q 20 -40 40 0 t 40 0 t 40 0" stroke="#ffd36b" strokeWidth={14} fill="none" strokeLinecap="round" />
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke">🍝 NOODLE</text>
        </g>
      )}
      {f >= F.spag && (
        <g>
          {"SPAGHETTIFICATION".split("").map((ch, i) => {
            const q = pop(f, F.spag + 4 + i * 1.6, 10);
            return <text key={i} x={95 + i * 52} y={300 + Math.sin(f * 0.18 + i * 0.6) * 18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={clamp01(q)} transform={`translate(0 ${(1 - clamp01(q)) * 40})`}>{ch}</text>;
          })}
        </g>
      )}
    </g>
  );
};
const S4_Super: React.FC<{ f: number }> = ({ f }) => {
  const cross = eio(ramp(f, F.cross - 20, F.nothing + 20));
  const ringP = pop(f, F.cross - 4, 14);
  const ay = lerp(700, 1080, cross);
  return (
    <g>
      <Space f={f} tint={PURP} />
      <BlackHole f={f} x={540} y={1380} r={300} tilt={0.28} />
      {f >= F.cross - 4 && (
        <g opacity={clamp01(ringP)}>
          <ellipse cx={540} cy={1380} rx={500} ry={500} fill="none" stroke={CYAN} strokeWidth={6} strokeDasharray="22 16" strokeDashoffset={-f * 2} />
          <Chip x={540} y={1250} w={520} label="POINT OF NO RETURN" hue={CYAN} p={ringP} fs={32} dark />
        </g>
      )}
      <g transform={`translate(${540 + Math.sin(f * 0.04) * 20} ${ay})`}>
        <Floater f={f} x={0} y={0} s={0.7} rot={Math.sin(f * 0.05) * 6} mood="happy" />
      </g>
      {f >= F.nothing && <Chip x={540} y={560} w={420} label="FEELS NOTHING ✓" hue="#3ddc97" p={pop(f, F.nothing + 4, 12)} fs={36} />}
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.supermassive + 30, 12) * (1 - ramp(f, F.cross - 10, F.cross))}>SUPERMASSIVE</text>
    </g>
  );
};
const S5_Friend: React.FC<{ f: number }> = ({ f }) => {
  const slow = 1 - eio(ramp(f, F.slow - 30, F.freeze + 10));
  const drift = 1 - Math.pow(1 - clamp01((f - F.friend) / (F.freeze - F.friend)), 2);
  const ay = lerp(560, 760, drift);
  const red = eio(ramp(f, F.red - 6, F.red + 40));
  return (
    <g>
      <Space f={f} />
      <BlackHole f={f} x={540} y={980} r={160} />
      <ellipse cx={540} cy={980} rx={290} ry={290} fill="none" stroke={CYAN} strokeWidth={4} strokeDasharray="18 14" opacity={0.6} />
      <g transform={`translate(${540 + Math.sin(f * 0.04 * slow) * 10} ${ay})`}>
        <Floater f={f} x={0} y={0} s={0.45} rot={-8} red={red} mood="neutral" />
      </g>
      {/* friend watching from a far-away ship window */}
      <g transform="translate(230 1400)">
        <rect x={-120} y={-330} width={300} height={360} rx={40} fill="#1c2450" stroke="#9fb0d8" strokeWidth={10} />
        <rect x={-96} y={-306} width={252} height={312} rx={26} fill="#0a1030" />
        <g transform="translate(30 0) scale(0.62)"><Person d={KID} f={f} seed={45} talk={0} wave={0} mood={f > F.freeze ? "surprised" : "neutral"} /></g>
      </g>
      <Chip x={280} y={1010} w={330} label="FRIEND'S VIEW" hue={YEL} p={pop(f, F.friend + 6, 10)} fs={30} textColor={INKC} />
      <Clock x={850} y={1200} a={(f - F.friend) * 0.15 * (slow * slow)} color={slow < 0.05 ? RED : CYAN} label={slow < 0.05 ? "TIME: FROZEN" : "TIME: SLOWING"} stopped={slow < 0.05} />
      {f >= F.freeze && <Stamp f={f} at={F.freeze + 4} x={600} y={460} text="FROZEN" hue={CYAN} fs={88} />}
      {f >= F.red && <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={RED} stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={pop(f, F.red + 6, 10)}>FADING TO RED...</text>}
    </g>
  );
};
const S6_Split: React.FC<{ f: number }> = ({ f }) => {
  const fall = clamp01((f - F.you) / 120);
  return (
    <g>
      <defs><clipPath id="leftHalf"><rect x={0} y={0} width={538} height={VH} /></clipPath><clipPath id="rightHalf"><rect x={542} y={0} width={538} height={VH} /></clipPath></defs>
      {/* left: friend's view (frozen, red) */}
      <g clipPath="url(#leftHalf)">
        <Space f={f} />
        <BlackHole f={f} x={270} y={1050} r={110} glow={0.8} />
        <g transform="translate(270 820)"><Floater f={0} x={0} y={0} s={0.42} rot={-8} red={1} /></g>
        <Clock x={270} y={1380} a={0.4} color={RED} label="STOPPED" stopped />
        <text x={270} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke">FRIEND'S VIEW</text>
      </g>
      {/* right: your view (falling straight through) */}
      <g clipPath="url(#rightHalf)">
        <rect x={540} width={540} height={VH} fill={SPACE0} />
        <Stars f={f * 4} n={70} seed="fall" drift={0.6} />
        {[...Array(14)].map((_, i) => <line key={i} x1={560 + rnd("ln" + i) * 500} y1={((rnd("lny" + i) * VH + f * 18) % VH)} x2={560 + rnd("ln" + i) * 500} y2={((rnd("lny" + i) * VH + f * 18) % VH) + 90} stroke="#9fb0d8" strokeWidth={3} opacity={0.35} />)}
        <g transform={`translate(810 ${lerp(760, 920, fall)})`}><Floater f={f} x={0} y={0} s={0.42} rot={Math.sin(f * 0.08) * 10} mood="happy" /></g>
        <Clock x={810} y={1380} a={(f - F.you) * 0.15} color="#3ddc97" label="TICKING NORMALLY" />
        <text x={810} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#3ddc97" stroke={INKC} strokeWidth={6} paintOrder="stroke">YOUR VIEW</text>
        {f >= F.through && <Chip x={810} y={500} w={380} label="STRAIGHT THROUGH" hue="#3ddc97" p={pop(f, F.through + 4, 10)} fs={28} textColor={INKC} />}
      </g>
      <rect x={536} y={0} width={8} height={VH} fill="#fff" />
    </g>
  );
};
const S7_Both: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Space f={f} />
    <BlackHole f={f} x={540} y={1020} r={170} />
    <g transform="translate(250 1460) scale(0.8)"><Person d={KID} f={f} seed={45} talk={0} wave={0} mood="surprised" /></g>
    <g transform="translate(830 1460) scale(0.8)"><Person d={ASTRO} f={f} seed={3} talk={hostTalk(f)} wave={0} mood="happy" /></g>
    <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.two, 10)}>TWO VERSIONS</text>
    <Stamp f={f} at={F.both + 2} x={540} y={620} text="BOTH TRUE" hue={YEL} fs={80} rot={-8} />
  </g>
);
const S8_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Space f={f} />
    <BlackHole f={f} x={540} y={560} r={120} />
    <Outro f={f} at={F.sub} />
    <g transform="translate(170 1470) scale(0.78)"><Person d={ASTRO} f={f} seed={3} talk={hostTalk(f)} wave={1} mood="happy" /></g>
    <g transform="translate(910 1470) scale(0.8)"><Person d={KID} f={f} seed={45} talk={0} wave={1} mood="happy" /></g>
  </g>
);

export const BlackHoleFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.size, render: () => <S1_Hill f={f} />, cam: [[0, { x: 400, y: 1100, z: 1.25 }], [F.ask + 40, { x: 360, y: 1150, z: 1.18 }], [F.depends + 10, { x: 540, y: 1100, z: 1.08 }], [F.size, { x: 600, y: 1080, z: 1.12 }]] },
    { from: F.size, to: F.small, tr: "spin", render: () => <S2_Size f={f} />, cam: [[F.size, { x: 400, y: 780, z: 1.25 }], [F.small, { x: 620, y: 960, z: 1.05 }]] },
    { from: F.small, to: F.supermassive, tr: "whip", render: () => <S3_Small f={f} />, cam: [[F.small, { x: 540, y: 700, z: 1.2 }], [F.stretched, { x: 540, y: 900, z: 1.1, r: -2 }], [F.spag, { x: 540, y: 820, z: 1.05, r: 0 }], [F.supermassive, { x: 540, y: 900, z: 1.15, r: 2 }]] },
    { from: F.supermassive, to: F.strange, tr: "zoom", render: () => <S4_Super f={f} />, cam: [[F.supermassive, { x: 540, y: 700, z: 1.0 }], [F.cross, { x: 540, y: 900, z: 1.1 }], [F.strange, { x: 540, y: 1100, z: 1.25, r: 3 }]] },
    { from: F.strange, to: F.you, tr: "iris", render: () => <S5_Friend f={f} />, cam: [[F.strange, { x: 540, y: 900, z: 1.08 }], [F.slow, { x: 560, y: 820, z: 1.15 }], [F.red, { x: 540, y: 820, z: 1.12 }], [F.you, { x: 540, y: 860, z: 1.16 }]] },
    { from: F.you, to: F.both, tr: "wipe", render: () => <S6_Split f={f} />, cam: [[F.you, { x: 540, y: 960, z: 1.0 }], [F.both, { x: 540, y: 960, z: 1.04 }]] },
    { from: F.both, to: F.sub, tr: "flash", render: () => <S7_Both f={f} />, cam: [[F.both, { x: 540, y: 960, z: 1.15 }], [F.sub, { x: 540, y: 1000, z: 1.02 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S8_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.depends, 0.06], [F.stretched, 0.08], [F.noodle, 0.1], [F.spag + 4, 0.14], [F.cross, 0.1], [F.freeze + 4, 0.14], [F.red, 0.08], [F.both + 2, 0.15]];
  const SHAKE: [number, number][] = [[F.spag + 4, 12], [F.freeze + 4, 10], [F.both + 2, 14]];
  const SFX: Cue[] = [
    [F.ask + 20, "pop", 0.35], [F.depends - 20, "whoosh", 0.35], [F.size + 4, "pop", 0.4], [F.size + 20, "boom", 0.35],
    [F.small + 100, "riser_dark", 0.3], [F.small + 120, "tick", 0.3], [F.stretched, "whoosh", 0.35], [F.noodle, "pop", 0.4], [F.spag + 4, "impact", 0.5],
    [F.supermassive + 30, "boom", 0.3], [F.cross - 4, "riser", 0.3], [F.nothing + 4, "pop", 0.4],
    [F.friend + 6, "pop", 0.3], [F.slow - 30, "riser_dark", 0.3], [F.freeze + 4, "impact", 0.5], [F.red + 6, "tick", 0.3],
    [F.through + 4, "pop", 0.35], [F.two, "whoosh", 0.3], [F.both + 2, "boom", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.small ? YEL : f < F.strange ? "#ff8a3d" : f < F.both ? CYAN : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="redshift"><feColorMatrix type="matrix" values="0.9 0.4 0.2 0 0.15  0.1 0.05 0.05 0 0  0.05 0.02 0.05 0 0  0 0 0 1 0" /></filter>
        </defs>
      </svg>
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="BLACK HOLE" sub="WHAT IF YOU FELL IN?" until={F.depends - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="blackhole" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
