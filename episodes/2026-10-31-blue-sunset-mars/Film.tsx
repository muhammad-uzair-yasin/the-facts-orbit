import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Shots, ShotDef, Figure, Captions, Vignette, FontStyle, keys, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, blinkAt, VW, VH, INK } from "./kit";
import { WORDS, CHUNKS, VOICE_END, TOTAL, ENV } from "./words";

// cue frames (from the real narration, v3 script)
const F = { hook: 15, blue1: 96, in2015: 127, filmed: 167, wasBlue: 249, onEarth: 291, burnRed: 394, flips: 449, thin: 491, dustSmoke: 530, scatters: 611, letsBlue: 681, glow: 765, butters: 848, twilight: 899, redEarth: 985, blueMars: 1019, which: 1064 };
const AMBER = "#e8921c";
const GROUND = 1500;
// ---------- the Mars set ----------
const Stars: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {[...Array(34)].map((_, i) => (
      <circle key={i} cx={rnd("sx" + i) * VW} cy={rnd("sy" + i) * 900} r={1 + rnd("sr" + i) * 2.4}
        fill="#fff" opacity={(0.25 + 0.65 * Math.abs(Math.sin(f * 0.05 + rnd("sp" + i) * 6.28))) * 0.9} />
    ))}
  </g>
);
const Comet: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = clamp01((f - at) / 50);
  if (p <= 0 || p >= 1) return null;
  const x = 1120 - p * 900, y = 220 + p * 170;
  return (
    <g opacity={p < 0.1 ? p * 10 : p > 0.85 ? (1 - p) * 6.7 : 1}>
      {[...Array(9)].map((_, i) => (
        <circle key={i} cx={x + i * 26} cy={y - i * 5} r={9 - i} fill={i < 3 ? "#fff" : "#9ad8ff"} opacity={1 - i / 9} />
      ))}
    </g>
  );
};
const DottedPath: React.FC<{ p: number; x0: number; y0: number; x1: number; y1: number }> = ({ p, x0, y0, x1, y1 }) => (
  <g>
    {[...Array(22)].map((_, i) => {
      const q = i / 21; if (q > p) return null;
      const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * 180;
      return <circle key={i} cx={x} cy={y} r={5.5} fill="#cfe4ff" opacity={0.85 - q * 0.3} />;
    })}
  </g>
);
const Shockwave: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => (
  <g>
    {[0, 1].map((k) => {
      const p = clamp01((f - at - k * 9) / 34); if (p <= 0 || p >= 1) return null;
      return <circle key={k} cx={x} cy={y} r={60 + p * 420} fill="none" stroke="#8fc2ff" strokeWidth={(1 - p) * 12 + 2} opacity={(1 - p) * 0.8} />;
    })}
  </g>
);
const Satellite: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = clamp01((f - at) / 170);
  if (p <= 0 || p >= 1) return null;
  const x = -80 + p * 1240, y = 300 - Math.sin(p * Math.PI) * 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(14)`} opacity={0.9}>
      <rect x={-16} y={-16} width={32} height={32} rx={5} fill="#b9c2d4" stroke={INK} strokeWidth={3} />
      <rect x={-66} y={-9} width={42} height={18} rx={3} fill="#53639c" stroke={INK} strokeWidth={3} />
      <rect x={24} y={-9} width={42} height={18} rx={3} fill="#53639c" stroke={INK} strokeWidth={3} />
    </g>
  );
};
const SpeedLines: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const p = clamp01((f - at) / 16);
  if (p <= 0 || p >= 1) return null;
  return (
    <g strokeLinecap="round">
      {[...Array(16)].map((_, i) => {
        const a = (i / 16) * 6.283;
        const r0 = 90 + eout(p) * 260, r1 = r0 + 90 * (1 - p);
        return <path key={i} d={`M ${x + Math.cos(a) * r0},${y + Math.sin(a) * r0} L ${x + Math.cos(a) * r1},${y + Math.sin(a) * r1}`} stroke="#cfe4ff" strokeWidth={(1 - p) * 7 + 1.5} opacity={(1 - p) * 0.85} />;
      })}
    </g>
  );
};
const Bokeh: React.FC<{ f: number; n?: number }> = ({ f, n = 10 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const p = ((f * (0.9 + rnd("bs" + i)) * 0.0022) + rnd("bp" + i)) % 1;
      const x = 60 + rnd("bx" + i) * 960 + Math.sin(f * 0.013 + i * 2) * 36;
      const y = 1650 - p * 1500;
      return <circle key={i} cx={x} cy={y} r={10 + rnd("br" + i) * 26} fill="#8fc2ff" opacity={(1 - Math.abs(p - 0.5) * 2) * 0.16} />;
    })}
  </g>
);
const PulseRings: React.FC<{ f: number; at: number; x: number; y: number; col: string }> = ({ f, at, x, y, col }) => (
  <g>
    {[0, 1, 2].map((kk) => {
      const p = ((Math.max(0, f - at) / 36 + kk / 3) % 1);
      if (f < at) return null;
      return <circle key={kk} cx={x} cy={y} r={14 + p * 90} fill="none" stroke={col} strokeWidth={(1 - p) * 5 + 1} opacity={(1 - p) * 0.7} />;
    })}
  </g>
);
const Sky: React.FC<{ blue: number }> = ({ blue }) => (
  <>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#120b1e" />
        <stop offset="0.55" stopColor={mix("#3a1b22", "#2a2440", blue * 0.5)} />
        <stop offset="0.82" stopColor={mix("#6e3420", "#3f4a7a", blue)} />
        <stop offset="1" stopColor={mix("#7c4324", "#53639c", blue)} />
      </linearGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#sky)" />
  </>
);
const Sun: React.FC<{ f: number; sink: number; blue: number; x?: number; y?: number; r?: number }> = ({ f, sink, blue, x = 790, y = GROUND - 60, r = 62 }) => {
  const yy = y + sink * 46;
  const halo = mix("#ff9d4a", "#8fc2ff", blue);
  const core = mix("#fff3cf", "#eaf4ff", blue);
  return (
    <g>
      <circle cx={x} cy={yy} r={r * (3.1 + Math.sin(f * 0.08) * 0.1)} fill={halo} opacity={0.16 + blue * 0.1} />
      <circle cx={x} cy={yy} r={r * 2.0} fill={halo} opacity={0.22 + blue * 0.12} />
      <circle cx={x} cy={yy} r={r * 1.35} fill={halo} opacity={0.3} />
      <circle cx={x} cy={yy} r={r} fill={core} />
    </g>
  );
};
const Ground: React.FC<{ blue: number }> = ({ blue }) => (
  <g>
    <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill={mix("#2a1410", "#1c1826", blue * 0.6)} />
    <path d={`M 0,${GROUND} Q 270,${GROUND - 26} 540,${GROUND} T 1080,${GROUND - 10} L 1080,${GROUND + 8} L 0,${GROUND + 8} Z`} fill={mix("#3a1d15", "#262238", blue * 0.6)} />
    {[...Array(7)].map((_, i) => (
      <ellipse key={i} cx={90 + rnd("rk" + i) * 920} cy={GROUND + 40 + rnd("ry" + i) * 240} rx={26 + rnd("rr" + i) * 46} ry={8 + rnd("rh" + i) * 12} fill="#1c0e0a" opacity={0.55} />
    ))}
  </g>
);
const Dust: React.FC<{ f: number; n?: number; lit?: number }> = ({ f, n = 26, lit = 0 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const spd = 0.3 + rnd("ds" + i) * 0.5;
      const x = ((rnd("dx" + i) * 1200 + f * spd) % 1200) - 60;
      const y = 300 + rnd("dy" + i) * 1240 + Math.sin(f * 0.02 + i) * 30;
      const r = 2.2 + rnd("dr" + i) * 4.2;
      return <circle key={i} cx={x} cy={y} r={r} fill={lit > 0 ? mix("#c9876a", "#cfe4ff", lit) : "#c9876a"} opacity={0.2 + rnd("do" + i) * 0.3} />;
    })}
  </g>
);
const Helmet: React.FC<{ x: number; y: number; s: number; glow?: number }> = ({ x, y, s, glow = 0 }) => (
  <g transform={`translate(${x} ${y - 352 * s}) scale(${s})`}>
    <circle cx={0} cy={0} r={80} fill="rgba(190,225,255,0.10)" stroke="#dfe8f5" strokeWidth={6} />
    <path d="M -46,56 q 46,20 92,0" stroke="#dfe8f5" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -52,-44 q 18,-26 46,-30" stroke="rgba(255,255,255,0.75)" strokeWidth={7} fill="none" strokeLinecap="round" />
    {glow > 0 && <circle cx={0} cy={0} r={76} fill="#9ec8ff" opacity={glow * 0.3} />}
  </g>
);
const Footprints: React.FC<{ n?: number }> = ({ n = 9 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const t = i / (n - 1);
      const x = 980 - t * 620, y = GROUND + 150 - t * 120;
      const s = 1 - t * 0.55;
      return <ellipse key={i} cx={x + (i % 2 ? 16 * s : -16 * s)} cy={y} rx={13 * s} ry={6 * s} fill="#140a08" opacity={0.7 - t * 0.3} transform={`rotate(${-24} ${x} ${y})`} />;
    })}
  </g>
);
const EarthDot: React.FC<{ f: number; x?: number; y?: number; warm?: number }> = ({ f, x = 300, y = 420, warm = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={10 + Math.sin(f * 0.1) * 1.2} fill={mix("#9ec8ff", "#ff9d7a", warm)} />
    <circle cx={x} cy={y} r={22} fill={mix("#9ec8ff", "#ff9d7a", warm)} opacity={0.25} />
  </g>
);
// a light beam travelling from the sun; deflects at (mx,my) if given
const Beam: React.FC<{ p: number; x0: number; y0: number; mx: number; my: number; dx?: number; dy?: number; col: string; deflect?: boolean }> = ({ p, x0, y0, mx, my, dx = 0, dy = 0, col, deflect }) => {
  if (p <= 0) return null;
  const seg1 = clamp01(p * (deflect ? 1.8 : 1.4));
  const hx = lerp(x0, mx, seg1), hy = lerp(y0, my, seg1);
  const seg2 = deflect ? clamp01(p * 1.8 - 1) : 0;
  const ex = lerp(mx, mx + dx, seg2), ey = lerp(my, my + dy, seg2);
  return (
    <g strokeLinecap="round">
      <path d={`M ${x0},${y0} L ${hx},${hy}`} stroke={col} strokeWidth={7} opacity={0.75} />
      {deflect && seg2 > 0 && <path d={`M ${mx},${my} L ${ex},${ey}`} stroke={col} strokeWidth={6} opacity={0.6 * (1 - seg2 * 0.5)} />}
      <circle cx={deflect && seg2 > 0 ? ex : hx} cy={deflect && seg2 > 0 ? ey : hy} r={10} fill={col} />
    </g>
  );
};

// ---------- the hero ----------
const Hero: React.FC<{ x: number; y: number; s: number; f: number; mood?: any; look?: [number, number]; facing?: 1 | -1; armL?: number; armR?: number; elbowL?: number; elbowR?: number; walk?: number; glow?: number; headTilt?: number; helmet?: boolean }> = (p) => (
  <g>
    <Figure x={p.x} y={p.y} s={p.s} facing={p.facing ?? 1} coat={AMBER} mood={p.mood ?? "neutral"} look={p.look ?? [0, 0]} blink={blinkAt(p.f, 3)} hair="none" armL={p.armL} armR={p.armR} elbowL={p.elbowL} elbowR={p.elbowR} walk={p.walk} headTilt={p.headTilt} talk={Math.max(0, (ENV[Math.max(0, p.f - 15)] ?? 0))} />
    {p.helmet !== false && <Helmet x={p.x} y={p.y} s={p.s} glow={p.glow ?? 0} />}
  </g>
);

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: ShotDef[] = [
    // S1 HOOK: open ON the blue sunset (0 - in2015)
    { from: 0, to: F.in2015, z0: 1.0, z1: 1.13, fx: 700, fy: 1320, slide: 0, render: () => (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.55} blue={1} x={700} r={72} /><Ground blue={1} />
        <Hero x={300} y={GROUND + 70} s={1.2} f={f} mood="neutral" look={[14, -4]} armR={12 + Math.sin(f * 0.06) * 6} />
        <Dust f={f} lit={0.5} />
      </g>
    )},
    // S2 2015: the rover films it (in2015 - onEarth)
    { from: F.in2015, to: F.onEarth, z0: 1.0, z1: 1.1, fx: 560, fy: 1340, render: (lf) => (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.55} blue={1} x={830} r={64} /><Ground blue={1} />
        {/* rover */}
        <g transform={`translate(360 ${GROUND + 60}) scale(${1 + pop(lf, 4) * 0.05})`}>
          <rect x={-110} y={-120} width={220} height={80} rx={16} fill="#b9c2d4" stroke={INK} strokeWidth={6} />
          {[-78, 0, 78].map((wx, i) => <circle key={i} cx={wx} cy={-20} r={34} fill="#2a3044" stroke={INK} strokeWidth={6} />)}
          {[-78, 0, 78].map((wx, i) => <circle key={"h" + i} cx={wx} cy={-20} r={12} fill="#6a7490" />)}
          <path d="M 60,-120 L 60,-230" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <g transform={`rotate(${keys(lf, [[0, -14], [26, 8], [70, 4]])} 60 -230)`}>
            <rect x={36} y={-262} width={86} height={44} rx={10} fill="#dfe8f5" stroke={INK} strokeWidth={6} />
            <circle cx={122} cy={-240} r={11} fill="#16161d" />
          </g>
          <rect x={-96} y={-170} width={70} height={46} rx={8} fill="#53639c" stroke={INK} strokeWidth={5} />
        </g>
        {f > F.filmed + 30 && f < F.filmed + 34 && <rect width={VW} height={VH} fill="#fff" opacity={0.5} />}
        <Hero x={780} y={GROUND + 90} s={1.0} f={f} mood="happy" look={[-12, 0]} facing={-1} />
        <Dust f={f} lit={0.4} />
      </g>
    )},
    // S3 EARTH: warm red sunset, helmet off (onEarth - flips)
    { from: F.onEarth, to: F.flips, z0: 1.0, z1: 1.1, fx: 540, fy: 1200, render: (lf) => (
      <g>
        <defs><linearGradient id="esky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1535" /><stop offset="0.5" stopColor="#7a2d35" /><stop offset="0.82" stopColor="#c45a2e" /><stop offset="1" stopColor="#e8853a" />
        </linearGradient></defs>
        <rect width={VW} height={VH} fill="url(#esky)" />
        <Stars f={f} />
        <Sun f={f} sink={0.5} blue={0} x={760} r={66} />
        <g>
          <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#1c2416" />
          <path d={`M 0,${GROUND} Q 270,${GROUND - 24} 540,${GROUND} T 1080,${GROUND - 8} L 1080,${GROUND + 8} L 0,${GROUND + 8} Z`} fill="#28331e" />
        </g>
        {/* a simple tree = Earth */}
        <g transform={`translate(170 ${GROUND + 30})`}>
          <path d="M 0,0 L 0,-170" stroke="#4a3520" strokeWidth={22} strokeLinecap="round" />
          <circle cx={-40} cy={-210} r={62} fill="#35502a" /><circle cx={44} cy={-224} r={70} fill="#3d5c30" /><circle cx={0} cy={-280} r={66} fill="#466b38" />
        </g>
        {/* blue light scattering across the whole sky: little blue sparkles everywhere */}
        {[...Array(18)].map((_, i) => {
          const p = ((f * 0.012) + rnd("eb" + i)) % 1;
          return <circle key={i} cx={rnd("ex" + i) * VW} cy={rnd("ey" + i) * 1000 + 100} r={4 + rnd("er" + i) * 5} fill="#9ad8ff" opacity={(1 - Math.abs(p - 0.5) * 2) * 0.6} />;
        })}
        <Hero x={520} y={GROUND + 80} s={1.15} f={f} mood="happy" look={[10, -4]} helmet={false} armR={16 + Math.sin(f * 0.07) * 8} />
      </g>
    )},
    // S4 Mars flips it: hard cut back to blue (flips - thin)
    { from: F.flips, to: F.thin, z0: 1.04, z1: 1.16, fx: 700, fy: 1300, render: () => (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.55} blue={1} x={700} r={70} /><Ground blue={1} />
        <Shockwave f={f} at={F.flips + 4} x={700} y={GROUND - 40} />
        <Hero x={300} y={GROUND + 70} s={1.2} f={f} mood="surprised" look={[14, -4]} armR={keys(f, [[F.flips, 16], [F.flips + 10, 120]])} elbowR={26} />
        <Dust f={f} lit={0.6} />
      </g>
    )},
    // S5 dust close (thin - scatters)
    { from: F.thin, to: F.scatters, z0: 1.02, z1: 1.14, fx: 520, fy: 900, render: (lf) => (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.6} blue={1} x={880} /><Ground blue={1} />
        {/* big drifting smoke-fine motes around his head */}
        {[...Array(14)].map((_, i) => {
          const x = 220 + rnd("mx" + i) * 620 + Math.sin(f * 0.025 + i * 1.7) * 44;
          const y = 560 + rnd("my" + i) * 620 + Math.cos(f * 0.02 + i) * 30;
          return <circle key={i} cx={x} cy={y} r={7 + rnd("mr" + i) * 14} fill="#d8a37e" opacity={0.5 + rnd("mo" + i) * 0.35} />;
        })}
        <Hero x={470} y={GROUND + 200} s={1.9} f={f} mood="neutral" look={[Math.sin(lf * 0.08) * 10, -8]} glow={0.25} armR={keys(lf, [[0, 14], [18, 84], [60, 78]])} elbowR={30} headTilt={-4} />
      </g>
    )},
    // S6 THE FACT: beams (scatters - glow)
    { from: F.scatters, to: F.glow, z0: 1.0, z1: 1.11, fx: 540, fy: 1200, render: () => {
      const sp = (k: number) => clamp01(ramp(f, F.scatters + 6 + k * 12, F.scatters + 40 + k * 12));
      const bp = clamp01(ramp(f, F.letsBlue, F.letsBlue + 44));
      return (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.6} blue={1} x={870} y={GROUND - 40} /><Ground blue={1} />
        {[[660, 1240], [580, 1100], [690, 990], [470, 1190], [430, 1040]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={13 + (i % 3) * 4} fill="#d8a37e" opacity={0.8} />
        ))}
        <Beam p={sp(0)} x0={870} y0={GROUND - 60} mx={660} my={1240} dx={-120} dy={-320} col="#ff6a5e" deflect />
        <Beam p={sp(1)} x0={870} y0={GROUND - 80} mx={580} my={1100} dx={-80} dy={-360} col="#ff6a5e" deflect />
        <Beam p={sp(2)} x0={870} y0={GROUND - 70} mx={690} my={990} dx={-30} dy={-380} col="#ff6a5e" deflect />
        <Beam p={bp} x0={870} y0={GROUND - 50} mx={238} my={GROUND + 180 - 352 * 1.3} col="#8fc2ff" />
        <Hero x={230} y={GROUND + 180} s={1.3} f={f} mood={bp > 0.6 ? "happy" : "neutral"} look={[16, bp > 0.3 ? -2 : 4]} glow={bp} armR={keys(f, [[F.scatters, 12], [F.scatters + 14, 96], [F.letsBlue + 30, 90]])} elbowR={16} />
        <Dust f={f} lit={0.5} />
      </g>
    )}},
    // S7 blue glow + butterscotch sky (glow - twilight)
    { from: F.glow, to: F.twilight, z0: 1.1, z1: 1.0, fx: 640, fy: 1250, render: (lf) => (
      <g>
        <Sky blue={1} /><Stars f={f} />
        <defs><linearGradient id="btr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b97a3a" stopOpacity={0} /><stop offset="0.55" stopColor="#c98b4a" stopOpacity={0.4} /><stop offset="0.8" stopColor="#c98b4a" stopOpacity={0} />
        </linearGradient></defs>
        <rect width={VW} height={VH} fill="url(#btr)" opacity={clamp01(ramp(f, F.butters, F.butters + 20))} />
        <Sun f={f} sink={0.7} blue={1} x={640} r={76} /><Ground blue={1} />
        <PulseRings f={f} at={F.glow} x={640} y={GROUND - 20} col="#8fc2ff" />
        <Hero x={300} y={GROUND + 70} s={1.15} f={f} mood="happy" look={[12, -2]} glow={0.35} armR={keys(lf, [[0, 12], [18, 64], [60, 58]])} armL={keys(lf, [[0, -12], [18, -60], [60, -54]])} />
        <Dust f={f} lit={0.7} /><Bokeh f={f} n={7} />
      </g>
    )},
    // S8 the two-hour twilight (twilight - redEarth)
    { from: F.twilight, to: F.redEarth, z0: 1.0, z1: 1.09, fx: 540, fy: 1250, render: (lf) => (
      <g>
        <Sky blue={1} /><rect width={VW} height={VH} fill="#05060f" opacity={0.42} />
        <Stars f={f} />
        {/* sun below horizon, the blue glow band stays */}
        <g opacity={0.9}>
          <ellipse cx={540} cy={GROUND + 10} rx={430} ry={120} fill="#4a7ec4" opacity={0.3} />
          <ellipse cx={540} cy={GROUND + 6} rx={260} ry={70} fill="#8fc2ff" opacity={0.35} />
        </g>
        <Ground blue={1} />
        {/* the moons of Mars drifting */}
        <circle cx={240 + lf * 0.3} cy={420} r={13} fill="#cfd6e4" opacity={0.9} />
        <circle cx={820 - lf * 0.2} cy={300} r={8} fill="#9aa6bd" opacity={0.8} />
        <Hero x={430} y={GROUND + 80} s={1.15} f={f} mood="happy" look={[6, -6]} glow={0.3} armR={10 + Math.sin(f * 0.05) * 5} />
        <Dust f={f} lit={0.5} />
      </g>
    )},
    // S9 payoff + question (redEarth - end)
    { from: F.redEarth, to: TOTAL, z0: 1.0, z1: 1.13, fx: 500, fy: 880, render: (lf) => (
      <g>
        <Sky blue={1} /><Stars f={f} /><Sun f={f} sink={0.78} blue={1} x={850} /><Ground blue={1} />
        <EarthDot f={f} x={190} y={330} warm={f > F.redEarth ? 1 : 0} />
        <PulseRings f={f} at={F.redEarth} x={190} y={330} col="#ff9d7a" />
        <Bokeh f={f} n={8} />
        <Hero x={480} y={GROUND + 260} s={2.2} f={f} mood="happy" look={[Math.sin(lf * 0.06) * 4, 2]} headTilt={3 + Math.sin(lf * 0.05) * 2} glow={0.45}
          armR={f > F.which ? keys(f, [[F.which, 14], [F.which + 14, 125]]) + Math.sin(f * 0.35) * 10 : 14} elbowR={f > F.which ? 30 : 0} />
      </g>
    )},
  ];
  const fadeIn = clamp01(ramp(f, 0, 10));
  const fadeOut = 1 - clamp01(ramp(f, TOTAL - 18, TOTAL - 2));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Shots f={f} shots={SHOTS} kicks={[[F.flips, 20], [F.wasBlue, 10], [F.letsBlue + 40, 10], [F.blueMars, 8]]} />
      <Vignette />
      <Captions f={f} words={WORDS} chunks={CHUNKS} accent={f < F.onEarth ? "#3f7fd4" : f < F.flips ? "#e8921c" : "#3f7fd4"} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - Math.min(fadeIn, fadeOut), pointerEvents: "none" }} />
      <Sequence from={15} durationInFrames={TOTAL - 15}>
        <Audio src={staticFile("projects/marsblue/narration.wav")} />
      </Sequence>
      <Audio src={staticFile("projects/marsblue/amb_wind.wav")} loop volume={0.55} />
    </AbsoluteFill>
  );
};
