import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Drift, Outro, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (from sents.json)
const F = {
  hook: 17, equator: 90, kmh: 200, rightNow: 266, feel: 295, air: 379, oceans: 406, ground: 438,
  stop: 475, notThings: 522, flying: 574, people: 684, wind: 744, scrape: 864,
  oceansMove: 923, bulge: 966, poles: 1030, continent: 1119,
  day: 1218, year: 1266, daylight: 1299, night: 1346,
  so: 1396, danger: 1425, slowing: 1479, fine: 1585, sub: 1624,
};
const OCEAN = "#2f7fd8", OCEAN_D = "#1d5aa6", LAND = "#4fbf6a", LAND_D = "#2f8f4a", SPACE0 = "#070b1f", SPACE1 = "#141d45", RED = "#ff4d3d", ORANGE = "#ff9a2e", CYAN = "#5ad7ff", WHITE = "#ffffff";
const INK = "#1b1b24";
const PROF = CAST[35], KID = CAST[34];
const GROUND = 1440;

// ---------- characters ----------
/** Host (Professor) on the right, flipped to face left; kid on the left facing right. */
const Prof: React.FC<{ f: number; x?: number; y?: number; s?: number; wave?: number; mood?: any; face?: 1 | -1 }> = ({ f, x = 820, y = GROUND, s = 0.78, wave, mood, face = -1 }) => {
  const talking = speaking(f, "host", SPK);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
      <Person d={PROF} f={f} seed={36} talk={talkFor(f, "host", SPK, ENV)} wave={wave ?? (talking && Math.sin(f * 0.05) > 0.4 ? 1 : 0)} mood={mood ?? "happy"} />
    </g>
  );
};
const Kid: React.FC<{ f: number; x?: number; y?: number; s?: number; wave?: number; mood?: any; face?: 1 | -1 }> = ({ f, x = 250, y = GROUND, s = 0.78, wave, mood, face = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
    <Person d={KID} f={f} seed={35} talk={talkFor(f, "kid", SPK, ENV)} wave={wave ?? 0} mood={mood ?? "neutral"} />
  </g>
);

// ---------- set pieces ----------
const Space: React.FC<{ f: number; tint?: string }> = ({ f, tint = SPACE1 }) => (
  <g>
    <defs>
      <radialGradient id="spg" cx="50%" cy="40%" r="80%"><stop offset="0" stopColor={tint} /><stop offset="1" stopColor={SPACE0} /></radialGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#spg)" />
    {[...Array(70)].map((_, i) => (
      <circle key={i} cx={rnd("sx" + i) * VW} cy={rnd("sy" + i) * VH} r={0.8 + rnd("sr" + i) * 2.2} fill={WHITE}
        opacity={0.25 + 0.6 * Math.abs(Math.sin(f * 0.04 + rnd("sp" + i) * 6.28))} />
    ))}
  </g>
);
/** Globe with continents drifting by rotation phase `rot` (0..∞). */
const Globe: React.FC<{ x: number; y: number; r: number; rot: number; id: string; glow?: boolean; squash?: number }> = ({ x, y, r, rot, id, glow = true, squash = 1 }) => {
  const lands = [[0.05, -0.35, 0.32, 0.22], [0.42, 0.1, 0.28, 0.34], [0.7, -0.15, 0.22, 0.2], [0.85, 0.42, 0.2, 0.16], [0.25, 0.45, 0.18, 0.14], [0.55, -0.55, 0.26, 0.12]];
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <defs>
        <clipPath id={`gc${id}`}><circle r={r} /></clipPath>
        <radialGradient id={`gs${id}`} cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#ffffff" stopOpacity={0.35} /><stop offset="0.6" stopColor="#ffffff" stopOpacity={0} /><stop offset="1" stopColor="#000000" stopOpacity={0.45} /></radialGradient>
      </defs>
      {glow && <circle r={r * 1.12} fill={CYAN} opacity={0.12} />}
      <circle r={r} fill={OCEAN} stroke={INK} strokeWidth={8} />
      <g clipPath={`url(#gc${id})`}>
        {lands.map(([px, py, w, h], i) => {
          const u = (((px + rot) % 1) + 1) % 1; // 0..1 around
          const cx = lerp(-1.6, 1.6, u) * r;
          return [0, -3.2 * r].map((off, k) => (
            <ellipse key={i + "-" + k} cx={cx + off} cy={py * r} rx={w * r} ry={h * r} fill={LAND} stroke={LAND_D} strokeWidth={5} />
          ));
        })}
        {[...Array(5)].map((_, i) => <path key={i} d={`M${-r} ${(-0.6 + i * 0.3) * r} Q0 ${(-0.6 + i * 0.3) * r + 20} ${r} ${(-0.6 + i * 0.3) * r}`} stroke="#ffffff" strokeWidth={2} opacity={0.12} fill="none" />)}
      </g>
      <circle r={r} fill={`url(#gs${id})`} />
      <circle r={r} fill="none" stroke={INK} strokeWidth={8} />
    </g>
  );
};
const Gauge: React.FC<{ x: number; y: number; r: number; v: number; max: number; label: string; hue: string; ticks?: string[]; danger?: number }> = ({ x, y, r, v, max, label, hue, ticks, danger }) => {
  const a0 = -120, a1 = 120;
  const ang = lerp(a0, a1, clamp01(v / max)) + (v > max ? Math.sin(v) * 4 + 6 : 0);
  const arc = (a: number, b: number, rr: number) => {
    const p = (q: number) => [Math.sin((q * Math.PI) / 180) * rr, -Math.cos((q * Math.PI) / 180) * rr];
    const [x0, y0] = p(a), [x1, y1] = p(b);
    return `M${x0} ${y0} A${rr} ${rr} 0 ${b - a > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#0f1530" stroke={INK} strokeWidth={8} />
      <circle r={r - 10} fill="none" stroke="#2a3566" strokeWidth={3} />
      <path d={arc(a0, a1, r - 34)} stroke="#2a3566" strokeWidth={22} fill="none" strokeLinecap="round" />
      {danger !== undefined && <path d={arc(lerp(a0, a1, danger), a1, r - 34)} stroke={RED} strokeWidth={22} fill="none" opacity={0.55} />}
      <path d={arc(a0, Math.min(a1, ang), r - 34)} stroke={hue} strokeWidth={22} fill="none" strokeLinecap="round" />
      {ticks && ticks.map((t, i) => {
        const q = lerp(a0, a1, i / (ticks.length - 1)) * Math.PI / 180;
        return <text key={i} x={Math.sin(q) * (r - 78)} y={-Math.cos(q) * (r - 78) + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={r * 0.12} fill="#9fb0d8">{t}</text>;
      })}
      <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * (r - 50)} y2={-Math.cos((ang * Math.PI) / 180) * (r - 50)} stroke={YEL} strokeWidth={12} strokeLinecap="round" />
      <circle r={20} fill={YEL} stroke={INK} strokeWidth={5} />
      <text y={r * 0.74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={r * 0.13} fill="#9fb0d8" letterSpacing={3}>{label}</text>
    </g>
  );
};
const Car: React.FC<{ x: number; y: number; s?: number; c: string; rot?: number }> = ({ x, y, s = 1, c, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-90 0 V-40 Q-80 -50 -50 -52 L-30 -84 H40 L70 -52 Q95 -50 96 -30 V0 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-22 -76 H32 L52 -52 H-38 Z" fill="#bfe6ff" stroke={INK} strokeWidth={4} />
    {[-52, 56].map((wx) => <g key={wx}><circle cx={wx} cy={0} r={20} fill="#222" stroke={INK} strokeWidth={5} /><circle cx={wx} cy={0} r={8} fill="#bbb" /></g>)}
  </g>
);
const Tree: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-12} y={-80} width={24} height={80} fill="#7a4f22" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-120} r={58} fill="#3fae5a" stroke={INK} strokeWidth={6} />
    <circle cx={-30} cy={-100} r={30} fill="#4fc46a" />
  </g>
);
const House: React.FC<{ x: number; y: number; s?: number; c: string; rot?: number }> = ({ x, y, s = 1, c, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-80} y={-130} width={160} height={130} fill={c} stroke={INK} strokeWidth={6} />
    <path d="M-96 -126 L0 -200 L96 -126 Z" fill="#c0392b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-56} y={-100} width={40} height={36} fill="#bfe6ff" stroke={INK} strokeWidth={4} />
    <rect x={16} y={-100} width={40} height={36} fill="#bfe6ff" stroke={INK} strokeWidth={4} />
    <rect x={-18} y={-56} width={36} height={56} fill="#7a4f22" stroke={INK} strokeWidth={4} />
  </g>
);
const SpeedLines: React.FC<{ f: number; n?: number; dir?: 1 | -1; y0?: number; y1?: number; op?: number }> = ({ f, n = 26, dir = 1, y0 = 200, y1 = 1500, op = 0.55 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const y = y0 + rnd("ly" + i) * (y1 - y0);
      const len = 120 + rnd("ll" + i) * 260;
      const x = ((rnd("lx" + i) * 1600 + f * 48 * (0.7 + rnd("lv" + i))) % 1700) - 300;
      const xx = dir > 0 ? x : VW - x;
      return <line key={i} x1={xx} y1={y} x2={xx - dir * len} y2={y} stroke="#ffffff" strokeWidth={3 + rnd("lw" + i) * 4} opacity={op * (0.4 + rnd("lo" + i) * 0.6)} strokeLinecap="round" />;
    })}
  </g>
);

// ---------- shots ----------
const S1_Hook: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Space f={f} />
    <Globe x={540} y={720} r={330} rot={f * 0.006} id="h" />
    {/* curved rotation arrow */}
    <g opacity={0.9}>
      <path d={`M 230 470 A 360 360 0 0 1 850 470`} stroke={YEL} strokeWidth={10} fill="none" strokeDasharray="28 18" strokeDashoffset={-f * 3} />
      <path d="M850 470 l-36 -14 l10 34 z" fill={YEL} />
    </g>
    {/* small planet horizon for the characters */}
    <path d={`M -40 ${GROUND + 30} Q 540 ${GROUND - 70} 1120 ${GROUND + 30} V ${VH} H -40 Z`} fill="#26315f" stroke={INK} strokeWidth={6} />
    {[...Array(9)].map((_, i) => <circle key={i} cx={80 + i * 120} cy={GROUND + 40 + (i % 3) * 20} r={6 + (i % 2) * 4} fill="#1a2348" />)}
    <Kid f={f} x={290} y={GROUND - 20} s={0.82} mood="surprised" wave={f > F.hook + 10 && f < 72 ? 1 : 0} />
    <Prof f={f} x={820} y={GROUND - 20} s={0.82} mood="neutral" />
  </g>
);
const S2_Speed: React.FC<{ f: number }> = ({ f }) => {
  const kmh = countUp(f, F.equator + 30, F.kmh + 30, 1670);
  const icons: [number, string, string][] = [[F.air, "AIR", "#bfe6ff"], [F.oceans, "OCEANS", OCEAN], [F.ground, "GROUND", "#c99a52"]];
  return (
    <g>
      <Space f={f} tint="#1a2a5a" />
      <Globe x={540} y={560} r={250} rot={f * 0.01} id="s2" />
      {/* equator line */}
      <g opacity={eout(ramp(f, F.equator + 10, F.equator + 30))}>
        <ellipse cx={540} cy={560} rx={262} ry={36} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="20 12" strokeDashoffset={-f * 4} />
        <Chip x={540} y={240} w={300} label="EQUATOR" hue={YEL} p={pop(f, F.equator + 14, 10)} fs={36} textColor={INKC} />
      </g>
      {/* riders orbiting along with the spin */}
      {icons.map(([at, label, c], i) => {
        if (f < at) return null;
        const p = pop(f, at, 10);
        const a = (f - at) * 0.02 + i * 2.1;
        const x = 540 + Math.cos(a) * 330, y = 560 + Math.sin(a) * 70;
        return (
          <g key={label} transform={`translate(${x} ${y}) scale(${p})`}>
            <circle r={52} fill={c} stroke={INK} strokeWidth={6} />
            {label === "AIR" && <path d="M-30 -6 q20 -16 40 0 t40 0 M-34 14 q20 -16 40 0" stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" />}
            {label === "OCEANS" && <path d="M-34 4 q12 -14 24 0 t24 0 t24 0" stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" />}
            {label === "GROUND" && <path d="M-30 16 L-6 -22 L8 0 L18 -12 L34 16 Z" fill="#7a4f22" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />}
            <text y={86} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff" stroke={INKC} strokeWidth={6} paintOrder="stroke">{label}</text>
          </g>
        );
      })}
      {/* speedometer */}
      <g opacity={eout(ramp(f, F.equator + 20, F.equator + 34))}>
        <Gauge x={540} y={1060} r={190} v={kmh} max={2000} label="KM / H" hue={ORANGE} ticks={["0", "500", "1000", "1500", "2000"]} />
        <text x={540} y={1340} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={YEL} stroke={INKC} strokeWidth={10} paintOrder="stroke">{kmh.toLocaleString("en-US")}</text>
      </g>
      {f >= F.rightNow && f < F.feel + 20 && <Chip x={540} y={150} w={360} label="RIGHT NOW" hue={RED} p={pop(f, F.rightNow, 8)} fs={38} />}
      <Kid f={f} x={170} y={GROUND + 60} s={0.62} mood={f > F.rightNow ? "surprised" : "neutral"} />
      <Prof f={f} x={910} y={GROUND + 60} s={0.62} />
    </g>
  );
};
const S3_Stop: React.FC<{ f: number }> = ({ f }) => {
  const brake = clamp01((f - F.stop) / 26);
  const rot = 0.3 + (1 - Math.pow(1 - brake, 3)) * 0.18; // decelerates to a standstill
  const halt = f >= F.stop + 26;
  return (
    <g>
      <Space f={f} tint="#3a1430" />
      <Globe x={540} y={800} r={360} rot={rot} id="s3" />
      {/* brake sparks along the equator */}
      {!halt && [...Array(18)].map((_, i) => {
        const q = ((f * 0.09 + i * 0.07) % 1);
        return <line key={i} x1={540 + 360 - 10} y1={800 + (rnd("bs" + i) - 0.5) * 60} x2={540 + 360 + 20 + q * 180} y2={800 + (rnd("bs" + i) - 0.5) * 60 - q * 120} stroke={i % 2 ? YEL : ORANGE} strokeWidth={6} opacity={1 - q} strokeLinecap="round" />;
      })}
      {/* skid marks */}
      <path d="M 200 1220 Q 540 1260 880 1220" stroke="#ffffff" strokeWidth={8} strokeDasharray="40 20" opacity={0.25 * (1 - brake * 0.5)} fill="none" />
      <g transform={`translate(540 ${430}) rotate(-4)`} opacity={pop(f, F.stop + 4, 10)}>
        <rect x={-250} y={-110} width={500} height={220} rx={20} fill={RED} stroke="#ffffff" strokeWidth={12} />
        <text y={52} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={170} fill="#ffffff" letterSpacing={10}>STOP</text>
      </g>
      {halt && <Chip x={540} y={1300} w={560} label="0 KM / H" hue={RED} p={pop(f, F.stop + 28, 10)} fs={52} />}
      {f >= F.notThings && <BigNum f={f} at={F.notThings + 4} text="...NOT WHAT'S ON IT" x={540} y={1470} hue={YEL} fs={76} />}
    </g>
  );
};
const S4_Fly: React.FC<{ f: number }> = ({ f }) => {
  const t = f - F.flying;
  const fly = (base: number, k: number) => base + Math.max(0, t - k) * (14 + k * 0.1) + Math.pow(Math.max(0, t - k), 1.4) * 0.6;
  const wind = f < F.wind ? 0 : lerp(0, 380, eout(ramp(f, F.wind + 6, F.wind + 70)));
  const scraped = eio(ramp(f, F.scrape, F.scrape + 30));
  return (
    <g>
      <defs><linearGradient id="dsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2550" /><stop offset="1" stopColor="#c86a3a" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#dsk)" />
      <circle cx={180} cy={360} r={80} fill="#ffd28a" opacity={0.8} />
      <rect x={0} y={1180} width={VW} height={VH - 1180} fill={mix("#6a4a2a", "#8a8a8a", scraped)} />
      <rect x={0} y={1180} width={VW} height={18} fill="#3a2a1a" />
      {/* things launched east (to the right): staggered over the whole beat so the frame stays full */}
      <g opacity={1 - scraped}>
        {[...Array(14)].map((_, i) => {
          const k = i * 13;                        // launch delay (frames after "flying")
          const q = Math.max(0, t - k);
          const x0 = 60 + rnd("ox" + i) * 900 - 200;
          const x = x0 + q * (7 + rnd("ov" + i) * 4) + q * q * 0.035;
          const y = 1190 - q * (0.6 + rnd("oy" + i) * 0.9) - Math.sin(q * 0.08) * 30;
          const r = q * (1 + rnd("or" + i) * 2.4);
          if (x > 1400) return null;
          const kind = i % 3;
          return kind === 0 ? <Tree key={i} x={x} y={y} s={0.7 + rnd("os" + i) * 0.4} rot={r} />
            : kind === 1 ? <Car key={i} x={x} y={y - 10} s={0.8 + rnd("os" + i) * 0.4} c={[RED, CYAN, YEL, "#7b5cff"][i % 4]} rot={r * 1.4} />
            : <House key={i} x={x} y={y} s={0.6 + rnd("os" + i) * 0.3} c={["#f2d7a8", "#bfe6ff", "#ffd1dc"][i % 3]} rot={r * 0.8} />;
        })}
      </g>
      <Drift f={f} n={40} color="#e8c89a" seed="dust" maxR={5} speed={0.2} area={[0, 900, VW, 400]} opacity={0.6 * (1 - scraped * 0.5)} />
      <SpeedLines f={f} n={30} />
      {f >= F.flying && <g transform="translate(860 300)"><Chip x={0} y={0} w={300} label="EAST →" hue={ORANGE} p={pop(f, F.flying + 6, 10)} fs={44} /></g>}
      {f >= F.people && f < F.wind && (
        <g>
          {["PEOPLE", "CARS", "BUILDINGS", "TREES"].map((w, i) => <Chip key={w} x={540} y={470 + i * 92} w={360} label={w} hue={[RED, CYAN, YEL, "#3fae5a"][i]} p={pop(f, F.people + i * 12, 8)} fs={38} textColor={i === 2 ? INKC : "#ffffff"} />)}
        </g>
      )}
      {f >= F.wind && (
        <g opacity={eout(ramp(f, F.wind, F.wind + 10))}>
          <Gauge x={540} y={640} r={230} v={wind} max={300} label="WIND KM / H" hue={wind > 252 ? RED : ORANGE} ticks={["0", "75", "150", "225", "300"]} danger={252 / 300} />
          <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#ffffff" stroke={INKC} strokeWidth={8} paintOrder="stroke">{wind > 300 ? "OFF THE SCALE" : wind > 252 ? "BEYOND HURRICANE" : `${Math.round(wind)} KM/H`}</text>
        </g>
      )}
      {f >= F.scrape && <Stamp f={f} at={F.scrape + 8} x={540} y={1340} text="SCRAPED CLEAN" hue={YEL} fs={70} />}
    </g>
  );
};
const S5_Oceans: React.FC<{ f: number }> = ({ f }) => {
  const relax = eio(ramp(f, F.poles - 4, F.poles + 26));
  const slide = eio(ramp(f, F.poles + 22, F.continent + 10));
  const ring = pop(f, F.continent + 6, 14);
  const r = 330, cx = 540, cy = 760;
  const sq = lerp(0.86, 1, relax);
  return (
    <g>
      <Space f={f} tint="#10204a" />
      <g transform={`translate(${cx} ${cy}) scale(${1 / Math.sqrt(sq)} ${sq})`}>
        <defs><clipPath id="oc"><circle r={r} /></clipPath></defs>
        <circle r={r * 1.1} fill={CYAN} opacity={0.12} />
        <circle r={r} fill={slide > 0.02 ? LAND : OCEAN} stroke={INK} strokeWidth={8} />
        <g clipPath="url(#oc)">
          {/* water: full cover → retreats into polar caps */}
          <rect x={-r} y={-r} width={r * 2} height={lerp(r, r * 0.42, slide)} fill={OCEAN} />
          <rect x={-r} y={r - lerp(r, r * 0.42, slide)} width={r * 2} height={lerp(r, r * 0.42, slide)} fill={OCEAN} />
          {slide < 0.98 && <rect x={-r} y={-r * 0.02} width={r * 2} height={r * 0.04} fill={OCEAN} opacity={1 - slide} />}
          {[[-0.5, -0.35, 0.3, 0.2], [0.25, 0.1, 0.28, 0.32], [0.55, -0.45, 0.2, 0.16], [-0.3, 0.5, 0.22, 0.14]].map(([px, py, w, h], i) => (
            <ellipse key={"l" + i} cx={px * r} cy={py * r} rx={w * r} ry={h * r} fill={LAND} stroke={LAND_D} strokeWidth={5} opacity={1 - slide} />
          ))}
          {slide > 0.02 && [...Array(10)].map((_, i) => <circle key={i} cx={-r + 40 + i * 70} cy={(rnd("rk" + i) - 0.5) * 2 * r * 0.4 * slide} r={10 + rnd("rr" + i) * 14} fill={LAND_D} opacity={0.7} />)}
          {/* flow arrows */}
          {f >= F.poles && f < F.continent + 20 && [-1, 1].map((s) => [...Array(4)].map((_, i) => {
            const q = ((f - F.poles) * 0.03 + i * 0.25) % 1;
            return <path key={s + "-" + i} d={`M${-200 + i * 130} ${s * (40 + q * 160)} l -18 ${-s * 26} M${-200 + i * 130} ${s * (40 + q * 160)} l 18 ${-s * 26}`} stroke="#ffffff" strokeWidth={7} opacity={(1 - q) * 0.9} fill="none" strokeLinecap="round" />;
          }))}
        </g>
        <circle r={r} fill="none" stroke={INK} strokeWidth={8} />
      </g>
      {/* bulge callout */}
      {f < F.poles + 24 && (
        <g opacity={eout(ramp(f, F.bulge, F.bulge + 10)) * (1 - ramp(f, F.poles + 14, F.poles + 24))}>
          <path d={`M ${cx - r * 1.08} ${cy} H ${cx - r * 1.22} M ${cx + r * 1.08} ${cy} H ${cx + r * 1.22}`} stroke={YEL} strokeWidth={8} strokeLinecap="round" />
          <Chip x={540} y={300} w={460} label={relax < 0.5 ? "BULGE AT THE MIDDLE" : "BULGE RELAXES"} hue={YEL} p={1} fs={36} textColor={INKC} />
        </g>
      )}
      {f >= F.poles + 24 && <Chip x={540} y={300} w={460} label="OCEANS → POLES" hue={OCEAN} p={pop(f, F.poles + 24, 10)} fs={40} />}
      {f >= F.continent && (
        <g transform={`translate(540 ${cy}) scale(${ring})`}>
          <ellipse rx={r * 1.15} ry={60} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="22 14" strokeDashoffset={f * 3} />
        </g>
      )}
      {f >= F.continent && <Chip x={540} y={1210} w={560} label="ONE RING CONTINENT" hue="#3fae5a" p={pop(f, F.continent + 10, 10)} fs={40} />}
      <Prof f={f} x={930} y={GROUND + 90} s={0.55} />
    </g>
  );
};
const S6_DayNight: React.FC<{ f: number }> = ({ f }) => {
  const months = Math.min(12, Math.floor(eout(ramp(f, F.daylight, F.night + 50)) * 12));
  const isNight = f >= F.night;
  return (
    <g>
      {/* day half */}
      <rect x={0} y={0} width={VW / 2} height={VH} fill="#9fd8ff" />
      <rect x={0} y={1100} width={VW / 2} height={VH - 1100} fill="#5cc26a" />
      <circle cx={260} cy={420} r={120} fill="#ffd84a" stroke={INK} strokeWidth={6} />
      {[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={260 + Math.cos(a) * 140} y1={420 + Math.sin(a) * 140} x2={260 + Math.cos(a) * 180} y2={420 + Math.sin(a) * 180} stroke="#ffb000" strokeWidth={10} strokeLinecap="round" />; })}
      {/* night half */}
      <rect x={VW / 2} y={0} width={VW / 2} height={VH} fill="#0b1230" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={VW / 2 + rnd("nx" + i) * VW / 2} cy={rnd("ny" + i) * 1000} r={1 + rnd("nr" + i) * 2.5} fill="#ffffff" opacity={0.3 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))} />)}
      <circle cx={820} cy={420} r={100} fill="#f1ecd2" />
      <circle cx={790} cy={400} r={92} fill="#0b1230" />
      <rect x={VW / 2} y={1100} width={VW / 2} height={VH - 1100} fill="#1c3a28" />
      <line x1={VW / 2} y1={0} x2={VW / 2} y2={VH} stroke="#ffffff" strokeWidth={8} />
      {/* stuck sun label */}
      <Chip x={260} y={650} w={330} label="SUN STUCK" hue={ORANGE} p={pop(f, F.day + 10, 10)} fs={36} />
      {/* big kinetic number */}
      {f >= F.year && <BigNum f={f} at={F.year} text="1 DAY = 1 YEAR" x={540} y={880} hue={YEL} fs={92} />}
      {/* calendar */}
      {f >= F.daylight && (
        <g transform={`translate(${isNight ? 690 : 270} 1260)`} opacity={pop(f, F.daylight, 10)}>
          <rect x={-200} y={-140} width={400} height={300} rx={22} fill="#ffffff" stroke={INK} strokeWidth={6} />
          <rect x={-200} y={-140} width={400} height={80} rx={22} fill={isNight ? "#3d4a8a" : ORANGE} />
          <text y={-86} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff" letterSpacing={4}>{isNight ? "NIGHT" : "DAYLIGHT"}</text>
          <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INKC}>{isNight ? 1 + Math.floor(eout(ramp(f, F.night, F.night + 18)) * 5) : 1 + Math.floor(eout(ramp(f, F.daylight, F.night - 8)) * 5)}</text>
          <text y={128} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#555">OF 6 MONTHS</text>
        </g>
      )}
      <Kid f={f} x={960} y={GROUND + 100} s={0.5} face={-1} mood={isNight ? "surprised" : "happy"} />
    </g>
  );
};
const S7_Fine: React.FC<{ f: number }> = ({ f }) => {
  const handA = (f - F.slowing) * 2.2;
  const relief = f >= F.fine;
  return (
    <g>
      <Space f={f} tint="#163a5a" />
      <Globe x={540} y={640} r={190} rot={f * 0.004} id="s7" />
      {f >= F.slowing && (
        <g transform="translate(540 1000)" opacity={pop(f, F.slowing + 4, 12)}>
          <circle r={150} fill="#ffffff" stroke={INK} strokeWidth={8} />
          {[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 120} y1={Math.sin(a) * 120} x2={Math.cos(a) * 138} y2={Math.sin(a) * 138} stroke={INK} strokeWidth={6} />; })}
          <line x1={0} y1={0} x2={Math.sin((handA * Math.PI) / 180) * 100} y2={-Math.cos((handA * Math.PI) / 180) * 100} stroke={RED} strokeWidth={8} strokeLinecap="round" />
          <circle r={12} fill={INK} />
          <g transform="translate(0 210)"><Chip x={0} y={0} w={420} label="+2 ms / CENTURY" hue={CYAN} p={1} fs={40} textColor={INKC} /></g>
        </g>
      )}
      {relief && <Stamp f={f} at={F.fine} x={540} y={260} text="WE'RE FINE" hue="#3ddc97" fs={92} rot={-6} />}
      {f < F.slowing && (
        <g>
          {[0, 1, 2].map((i) => <text key={i} x={300 + i * 60} y={980 - i * 40 - Math.sin(f * 0.2 + i) * 10} fontFamily={FONT} fontWeight={800} fontSize={100 - i * 16} fill={RED} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.danger + i * 5, 8)}>!</text>)}
        </g>
      )}
      <Kid f={f} x={200} y={GROUND + 60} s={0.7} mood={relief ? "happy" : f >= F.danger ? "surprised" : "neutral"} wave={relief ? 1 : 0} />
      <Prof f={f} x={880} y={GROUND + 60} s={0.7} />
    </g>
  );
};
const S8_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Space f={f} tint="#1a2a5a" />
    <Globe x={540} y={560} r={260} rot={f * 0.008} id="s8" />
    <rect width={VW} height={VH} fill="#000000" opacity={0.25} />
    <Outro f={f} at={F.sub} />
    <Kid f={f} x={190} y={GROUND + 80} s={0.62} wave={1} mood="happy" />
    <Prof f={f} x={890} y={GROUND + 80} s={0.62} wave={1} />
  </g>
);

export const EarthSpinFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.equator, render: () => <S1_Hook f={f} />, cam: [[0, { x: 540, y: 760, z: 1.25 }], [F.equator, { x: 540, y: 980, z: 1.05 }]] },
    { from: F.equator, to: F.stop, tr: "zoom", render: () => <S2_Speed f={f} />, cam: [[F.equator, { x: 540, y: 560, z: 1.25 }], [F.kmh, { x: 540, y: 900, z: 1.05 }], [F.rightNow + 10, { x: 540, y: 1100, z: 1.18 }], [F.air - 10, { x: 540, y: 700, z: 1.08 }], [F.stop, { x: 540, y: 720, z: 1.14, r: -1 }]] },
    { from: F.stop, to: F.flying, tr: "flash", render: () => <S3_Stop f={f} />, cam: [[F.stop, { x: 540, y: 700, z: 1.3 }], [F.notThings, { x: 540, y: 960, z: 1.04 }], [F.flying, { x: 540, y: 1080, z: 1.12 }]] },
    { from: F.flying, to: F.oceansMove, tr: "whip", render: () => <S4_Fly f={f} />, cam: [[F.flying, { x: 360, y: 1050, z: 1.25 }], [F.people, { x: 720, y: 900, z: 1.15 }], [F.wind, { x: 540, y: 760, z: 1.08 }], [F.scrape + 10, { x: 540, y: 1100, z: 1.14, r: 1.5 }], [F.oceansMove, { x: 540, y: 1000, z: 1.05 }]] },
    { from: F.oceansMove, to: F.day, tr: "iris", render: () => <S5_Oceans f={f} />, cam: [[F.oceansMove, { x: 540, y: 760, z: 1.3 }], [F.poles, { x: 540, y: 760, z: 1.1 }], [F.continent + 20, { x: 540, y: 820, z: 1.02 }], [F.day, { x: 540, y: 780, z: 1.12 }]] },
    { from: F.day, to: F.so, tr: "wipe", render: () => <S6_DayNight f={f} />, cam: [[F.day, { x: 300, y: 600, z: 1.3 }], [F.year, { x: 540, y: 900, z: 1.06 }], [F.daylight + 10, { x: 330, y: 1150, z: 1.2 }], [F.night + 6, { x: 760, y: 1150, z: 1.2 }], [F.so, { x: 760, y: 1000, z: 1.1 }]] },
    { from: F.so, to: F.sub, tr: "push", render: () => <S7_Fine f={f} />, cam: [[F.so, { x: 260, y: 1150, z: 1.3 }], [F.slowing, { x: 540, y: 950, z: 1.08 }], [F.fine, { x: 540, y: 760, z: 1.1, r: -1 }], [F.sub, { x: 540, y: 900, z: 1.02 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "spin", render: () => <S8_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.14 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.kmh + 30, 0.1], [F.rightNow, 0.12], [F.stop + 4, 0.18], [F.notThings + 4, 0.1], [F.people, 0.06], [F.wind + 50, 0.1], [F.scrape + 8, 0.1], [F.continent + 6, 0.1], [F.year, 0.14], [F.fine, 0.12]];
  const SHAKE: [number, number][] = [[F.stop, 10], [F.stop + 26, 22], [F.flying + 4, 14], [F.wind + 60, 10], [F.scrape + 8, 12], [F.year, 8]];
  const SFX: Cue[] = [
    [F.hook + 2, "pop", 0.35],
    [F.equator + 14, "pop", 0.35], [F.equator + 30, "riser", 0.22], [F.kmh + 30, "impact", 0.45], [F.rightNow, "pop", 0.4],
    [F.air, "pop", 0.35], [F.oceans, "pop", 0.35], [F.ground, "pop", 0.35],
    [F.stop - 50, "riser_dark", 0.3], [F.stop + 4, "impact", 0.6], [F.stop + 26, "boom", 0.55], [F.notThings + 4, "pop", 0.4],
    [F.flying + 2, "whoosh", 0.45], [F.people, "pop", 0.3], [F.people + 12, "pop", 0.3], [F.people + 24, "pop", 0.3], [F.people + 36, "pop", 0.3],
    [F.wind, "whoosh", 0.45], [F.wind + 40, "riser", 0.25], [F.scrape + 8, "impact", 0.5],
    [F.bulge, "tick", 0.3], [F.poles, "whoosh", 0.35], [F.continent + 6, "impact", 0.45],
    [F.year, "boom", 0.4], [F.daylight, "pop", 0.35], [F.night, "pop", 0.35],
    [F.danger, "tick", 0.4], [F.slowing + 4, "pop", 0.35], [F.fine, "impact", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.stop ? YEL : f < F.oceansMove ? RED : f < F.day ? CYAN : f < F.so ? ORANGE : "#3ddc97";
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="EARTH STOPS" sub="WHAT IF EARTH STOPPED SPINNING?" until={F.equator - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="earthspin" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
