import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (word start frames from words.ts)
const F = {
  ask: 17, gone: 43, eight: 102, nothing: 155, nothing2: 188, sunlight: 225, eight2: 255, reach: 278, gravity: 307, same: 343,
  seeing: 387, orbiting: 413, after: 445, gone2: 473, then: 498, dark: 509, earth: 541, flies: 549, straight: 570, space: 596,
  moonQ: 623, no: 689, reflects: 735, moonDark: 783, planets: 808, fade: 836, one: 852, by: 858, one2: 863,
  cold: 889, within: 948, week: 962, zero: 981, year: 1042, minus: 1061, hundred: 1070,
  dies: 1107, not: 1168, oceans: 1205, freeze: 1223, ice: 1263, blanket: 1291, deep: 1315, vents: 1353, life: 1375, needed: 1399, keep: 1469, sub: 1503,
};
const SKY0 = "#4fb3ff", SKY1 = "#bfe8ff", SUN = "#ffd23f", SUN2 = "#ff9d2b", SPACE0 = "#04050d", SPACE1 = "#10173a", ICE = "#cfefff", CYAN = "#58e1ff", RED = "#ff4b3b", GREEN = "#3ddc97";
const KID = CAST[34], ASTRO = CAST[2];
const kidTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const ASK = SPK.filter((s) => s[2] === "asker");

// ---------- Q&A bubble (asker lines) ----------
/** Speech bubble with its tail tip at (x,y) above the asker's head; shows during asker line i. */
const Bubble: React.FC<{ f: number; i: number; x: number; y: number; text: string; dx?: number; fs?: number; ink?: string; at?: number }> = ({ f, i, x, y, text, dx = 0, fs = 80, ink = INKC, at }) => {
  const a = at ?? ASK[i][0], b = ASK[i][1];
  if (f < a - 2 || f > b + 14) return null;
  const p = pop(f, a - 2, 10), out = 1 - ramp(f, b + 4, b + 14);
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * fs * 0.64 + 80, h = lines.length * fs * 1.08 + 46;
  const cx = Math.min(VW - w / 2 - 40, Math.max(w / 2 + 40, x + dx));
  const by = y - 54, bx = Math.min(cx + w / 2 - 60, Math.max(cx - w / 2 + 60, x));
  const s = Math.max(0.01, p * out), rot = Math.sin(f * 0.13) * 1.6;
  return (
    <g opacity={clamp01(p * 2) * out} transform={`translate(${x} ${y}) scale(${s}) rotate(${rot}) translate(${-x} ${-y})`}>
      <rect x={cx - w / 2 + 10} y={by - h + 12} width={w} height={h} rx={40} fill="#000" opacity={0.3} />
      <path d={`M${bx - 30} ${by - 6} L${x} ${y} L${bx + 30} ${by - 6} Z`} fill="#fff" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <rect x={cx - w / 2} y={by - h} width={w} height={h} rx={40} fill="#fff" stroke={INKC} strokeWidth={8} />
      <path d={`M${bx - 24} ${by - 8} L${bx + 24} ${by - 8}`} stroke="#fff" strokeWidth={12} />
      {lines.map((l, k) => (
        <text key={k} x={cx} y={by - h + 23 + fs * 0.86 + k * fs * 1.08} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={ink} letterSpacing={1}>{l}</text>
      ))}
    </g>
  );
};

// ---------- set pieces ----------
const Stars: React.FC<{ f: number; n?: number; seed?: string; o?: number; h?: number }> = ({ f, n = 90, seed = "st", o = 1, h = VH }) => (
  <g opacity={o}>
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(seed + "x" + i) * VW} cy={rnd(seed + "y" + i) * h} r={0.8 + rnd(seed + "r" + i) * 2.4} fill="#fff" opacity={0.35 + 0.55 * Math.abs(Math.sin(f * 0.05 + i))} />
    ))}
  </g>
);
const Space: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="sgSpace" cx="50%" cy="30%" r="80%"><stop offset="0" stopColor={SPACE1} /><stop offset="1" stopColor={SPACE0} /></radialGradient>
    </defs>
    <rect width={VW} height={VH} fill="url(#sgSpace)" />
    <Stars f={f} />
  </g>
);
/** Sun with glow + rotating rays. ghost 0..1 turns it into a dashed outline. */
const Sun: React.FC<{ f: number; x: number; y: number; r: number; ghost?: number; face?: boolean }> = ({ f, x, y, r, ghost = 0, face }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id={`sunglow${Math.round(r)}`} cx="50%" cy="50%" r="50%">
        <stop offset="0.35" stopColor={SUN} stopOpacity={0.9} /><stop offset="1" stopColor={SUN2} stopOpacity={0} />
      </radialGradient>
    </defs>
    <g opacity={1 - ghost}>
      <circle r={r * 2.3} fill={`url(#sunglow${Math.round(r)})`} opacity={0.75} />
      <g transform={`rotate(${f * 0.4})`}>
        {[...Array(12)].map((_, i) => (
          <path key={i} d={`M${-r * 0.12} ${-r * 1.1} L0 ${-r * (1.45 + 0.08 * Math.sin(f * 0.15 + i))} L${r * 0.12} ${-r * 1.1} Z`} fill={SUN2} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={r} fill={SUN} stroke={SUN2} strokeWidth={r * 0.08} />
      {face && (
        <g>
          <circle cx={-r * 0.3} cy={-r * 0.1} r={r * 0.08} fill={INKC} /><circle cx={r * 0.3} cy={-r * 0.1} r={r * 0.08} fill={INKC} />
          <path d={`M${-r * 0.3} ${r * 0.25} Q0 ${r * 0.48} ${r * 0.3} ${r * 0.25}`} stroke={INKC} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
    {ghost > 0 && <circle r={r} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="22 16" opacity={ghost * 0.7} />}
  </g>
);
const Earth: React.FC<{ x: number; y: number; r: number; lit?: number; rot?: number; frost?: number }> = ({ x, y, r, lit = 1, rot = 0, frost = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill={mix("#2d6fd6", "#0d1830", 1 - lit)} stroke={INKC} strokeWidth={Math.max(3, r * 0.06)} />
    <path d={`M${-r * 0.6} ${-r * 0.3} q${r * 0.3} ${-r * 0.4} ${r * 0.6} ${-r * 0.1} q${r * 0.2} ${r * 0.4} ${-r * 0.2} ${r * 0.5} q${-r * 0.3} ${r * 0.1} ${-r * 0.4} ${-r * 0.4} Z M${r * 0.2} ${r * 0.2} q${r * 0.3} ${-r * 0.1} ${r * 0.5} ${r * 0.2} q${-r * 0.1} ${r * 0.4} ${-r * 0.4} ${r * 0.3} Z`} fill={mix("#3fbf5f", "#13241a", 1 - lit)} />
    {frost > 0 && <circle r={r * 0.98} fill="#e8f7ff" opacity={frost * 0.85} />}
    <circle r={r} fill="none" stroke={INKC} strokeWidth={Math.max(3, r * 0.06)} />
  </g>
);
const Moon: React.FC<{ x: number; y: number; r: number; dark?: number }> = ({ x, y, r, dark = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.8} fill="#fff6d8" opacity={0.18 * (1 - dark)} />
    <circle r={r} fill={mix("#f4eed8", "#1a1f33", dark)} stroke={mix("#c9c2a6", "#3a4266", dark)} strokeWidth={6} />
    {[[-0.3, -0.2, 0.18], [0.25, 0.15, 0.22], [-0.1, 0.4, 0.12]].map(([a, b, c], i) => <circle key={i} cx={r * a} cy={r * b} r={r * c} fill={mix("#ddd5b8", "#141829", dark)} />)}
  </g>
);
const Ground: React.FC<{ y: number; c1: string; c2: string }> = ({ y, c1, c2 }) => (
  <g>
    <path d={`M0 ${y} Q 300 ${y - 70} 600 ${y - 20} T 1080 ${y - 40} V ${VH} H 0 Z`} fill={c1} />
    <path d={`M0 ${y + 70} Q 340 ${y + 20} 700 ${y + 60} T 1080 ${y + 40} V ${VH} H 0 Z`} fill={c2} />
  </g>
);
const Snow: React.FC<{ f: number; n?: number; o?: number }> = ({ f, n = 60, o = 1 }) => (
  <g opacity={o}>
    {[...Array(n)].map((_, i) => {
      const x = (rnd("sx" + i) * VW + Math.sin(f * 0.03 + i) * 30 + VW) % VW;
      const y = ((rnd("sy" + i) * VH + f * (1.5 + rnd("sv" + i) * 2)) % VH);
      return <circle key={i} cx={x} cy={y} r={2 + rnd("sr" + i) * 5} fill="#fff" opacity={0.75} />;
    })}
  </g>
);
const Kid: React.FC<{ f: number; x: number; y: number; s: number; mood?: "happy" | "neutral" | "surprised"; wave?: number }> = ({ f, x, y, s, mood, wave = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Person d={KID} f={f} seed={34} talk={kidTalk(f)} wave={wave} mood={mood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy")} /></g>
);
const Astro: React.FC<{ f: number; x: number; y: number; s: number; mood?: "happy" | "neutral" | "surprised"; wave?: number }> = ({ f, x, y, s, mood = "happy", wave = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Person d={ASTRO} f={f} seed={3} talk={hostTalk(f)} wave={wave} mood={mood} /></g>
);
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const Timer: React.FC<{ x: number; y: number; sec: number; p: number; hue: string }> = ({ x, y, sec, p, hue }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * clamp01(p)})`}>
    <rect x={-170} y={-70} width={340} height={140} rx={30} fill="rgba(8,10,28,0.88)" stroke={hue} strokeWidth={6} />
    <circle cx={-110} cy={0} r={34} fill="none" stroke={hue} strokeWidth={6} />
    <line x1={-110} y1={0} x2={-110 + Math.sin(sec * 0.2) * 24} y2={-Math.cos(sec * 0.2) * 24} stroke={hue} strokeWidth={6} strokeLinecap="round" />
    <text x={40} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={76} fill="#fff">{mmss(sec)}</text>
  </g>
);

// ---------- shots ----------
// 1. Sunny backyard: Space Kid asks, Astronaut answers "8 minutes... nothing"
const S1_Yard: React.FC<{ f: number }> = ({ f }) => {
  const sky = 0;
  return (
    <g>
      <defs><linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#sgSky)" opacity={1 - sky} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={((rnd("cl" + i) * VW + f * 0.4 * (i + 1)) % (VW + 300)) - 150} cy={560 + i * 120} rx={130} ry={42} fill="#fff" opacity={0.85} />)}
      <Sun f={f} x={780} y={430} r={120} face />
      <Ground y={1350} c1="#6cc04a" c2="#4fa037" />
      {/* little house + fence */}
      <g transform="translate(110 1250)">
        <rect x={0} y={0} width={170} height={130} fill="#ffefd6" stroke={INKC} strokeWidth={6} />
        <path d="M-20 0 L85 -80 L190 0 Z" fill="#e4473b" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
        <rect x={64} y={60} width={44} height={70} fill="#8a5a2b" stroke={INKC} strokeWidth={5} />
      </g>
      <Kid f={f} x={340} y={1510} s={1.12} mood={f >= F.nothing2 - 2 && f < F.sunlight ? "surprised" : undefined} />
      <Astro f={f} x={770} y={1510} s={1.0} wave={f > F.eight - 10 && f < F.nothing ? 1 : 0} />
      <Bubble f={f} i={0} x={340} y={1000} text={"SUN GONE?!"} dx={80} fs={88} at={36} />
      <Bubble f={f} i={1} x={340} y={1000} text={"NOTHING?!"} dx={60} fs={96} />
      {f >= F.eight && f < F.nothing2 && <BigNum f={f} at={F.eight} text="8 MIN" x={560} y={760} hue={YEL} fs={170} />}
      {f >= F.nothing - 4 && f < F.nothing2 && <Chip x={540} y={880} w={480} label="NOTHING CHANGES" hue={GREEN} p={pop(f, F.nothing, 10)} fs={36} textColor={INKC} />}
    </g>
  );
};
// 2. Light + gravity race from the Sun to Earth, 8:20 timer
const S2_Race: React.FC<{ f: number }> = ({ f }) => {
  const t = eio(ramp(f, F.sunlight + 6, F.reach + 14));
  const g = eio(ramp(f, F.gravity, F.same + 8));
  const sunY = 320, earthY = 1420;
  const beamY = lerp(sunY + 150, earthY - 80, t);
  const sec = Math.round(t * 500);
  return (
    <g>
      <Space f={f} />
      <Sun f={f} x={540} y={sunY} r={150} />
      <Earth x={540} y={earthY} r={95} />
      {/* light beam */}
      <g opacity={ramp(f, F.sunlight, F.sunlight + 6)}>
        <rect x={500} y={sunY + 150} width={80} height={Math.max(0, beamY - sunY - 150)} fill={SUN} opacity={0.28} />
        <rect x={528} y={sunY + 150} width={24} height={Math.max(0, beamY - sunY - 150)} fill="#fff6c0" opacity={0.85} />
        <circle cx={540} cy={beamY} r={30} fill="#fff6c0" />
        <circle cx={540} cy={beamY} r={56} fill={SUN} opacity={0.35} />
      </g>
      <text x={680} y={beamY + 12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={YEL} stroke={INKC} strokeWidth={7} paintOrder="stroke" opacity={ramp(f, F.sunlight + 6, F.sunlight + 14) * (1 - ramp(f, F.gravity - 6, F.gravity))}>LIGHT</text>
      {/* gravity ripples */}
      {f >= F.gravity - 2 && [0, 1, 2, 3].map((i) => {
        const q = clamp01(g * 1.15 - i * 0.05);
        const ry = lerp(160, earthY - sunY - 60, q);
        return <path key={i} d={`M${540 - ry * 0.9} ${sunY + ry * 0.55} Q540 ${sunY + ry * 1.05} ${540 + ry * 0.9} ${sunY + ry * 0.55}`} fill="none" stroke={CYAN} strokeWidth={7} strokeDasharray="20 14" opacity={0.85 * (1 - i * 0.18)} />;
      })}
      {f >= F.gravity && <text x={780} y={lerp(560, 1040, g)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={CYAN} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.gravity, 10)}>GRAVITY</text>}
      <Timer x={790} y={1060} sec={sec} p={pop(f, F.sunlight + 10, 12) * (1 - ramp(f, F.gravity - 6, F.gravity))} hue={YEL} />
      {f >= F.eight2 - 2 && f < F.gravity && <BigNum f={f} at={F.eight2} text="8 MIN" x={370} y={800} hue={YEL} fs={110} />}
      {f >= F.same && <Chip x={540} y={1180} w={460} label="SAME SPEED!" hue={CYAN} p={pop(f, F.same, 10)} fs={40} textColor={INKC} />}
    </g>
  );
};
// 3. Earth keeps orbiting a Sun that is already gone
const S3_Orbit: React.FC<{ f: number }> = ({ f }) => {
  const ghost = eio(ramp(f, F.after, F.gone2 + 4));
  const ang = -Math.PI / 2 + (f - F.seeing) * 0.012;
  const R = 360, cx = 540, cy = 900;
  return (
    <g>
      <Space f={f} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#7d8bbd" strokeWidth={4} strokeDasharray="14 14" opacity={0.6} />
      <Sun f={f} x={cx} y={cy} r={130} ghost={ghost} />
      {/* light still arriving */}
      <line x1={cx} y1={cy} x2={cx + Math.cos(ang) * (R - 60)} y2={cy + Math.sin(ang) * (R - 60)} stroke={SUN} strokeWidth={10} opacity={0.4} strokeDasharray="30 20" strokeDashoffset={-f * 4} />
      <Earth x={cx + Math.cos(ang) * R} y={cy + Math.sin(ang) * R} r={60} rot={f} />
      <Chip x={540} y={330} w={500} label="STILL SEEING IT" hue={YEL} p={pop(f, F.seeing, 10) * (1 - ramp(f, F.orbiting - 4, F.orbiting))} fs={38} textColor={INKC} />
      <Chip x={540} y={330} w={500} label="STILL ORBITING" hue={GREEN} p={pop(f, F.orbiting, 10) * (1 - ramp(f, F.after - 4, F.after))} fs={38} textColor={INKC} />
      <Stamp f={f} at={F.gone2} x={540} y={900} text="ALREADY GONE" hue={RED} fs={58} rot={-8} />
    </g>
  );
};
// 4. Darkness: Earth flies off on a straight line
const S4_Tangent: React.FC<{ f: number }> = ({ f }) => {
  const dark = eio(ramp(f, F.dark - 4, F.dark + 14));
  const fly = eio(ramp(f, F.flies - 4, F.space + 20));
  const ex = 900, ey = lerp(1150, 260, fly);
  return (
    <g>
      <Space f={f} />
      <rect width={VW} height={VH} fill="#000" opacity={0.45 * dark} />
      <circle cx={540} cy={1150} r={360} fill="none" stroke="#7d8bbd" strokeWidth={4} strokeDasharray="14 14" opacity={0.6 * (1 - fly * 0.6)} />
      <circle cx={540} cy={1150} r={130} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="22 16" opacity={0.35} />
      {f >= F.straight - 6 && <line x1={900} y1={1150} x2={900} y2={lerp(1150, 140, eio(ramp(f, F.straight - 6, F.straight + 14)))} stroke={YEL} strokeWidth={8} strokeDasharray="26 18" />}
      {/* motion trail */}
      {fly > 0.02 && [...Array(6)].map((_, i) => <circle key={i} cx={ex} cy={ey + 40 + i * 34} r={44 - i * 6} fill="#2d6fd6" opacity={0.18 - i * 0.025} />)}
      <Earth x={ex} y={ey} r={64} lit={1 - dark * 0.6} rot={f} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.dark, 10) * (1 - ramp(f, F.straight - 10, F.straight))}>DARKNESS</text>
      {f >= F.straight && <Chip x={560} y={760} w={430} label="STRAIGHT LINE" hue={YEL} p={pop(f, F.straight, 10)} fs={40} textColor={INKC} />}
    </g>
  );
};
// 5. Night: "Would the Moon still shine?" → Moon goes dark
const S5_Moon: React.FC<{ f: number }> = ({ f }) => {
  const md = eio(ramp(f, F.moonDark - 6, F.moonDark + 14));
  const refl = clamp01(ramp(f, F.reflects - 4, F.reflects + 10) * (1 - ramp(f, F.moonDark - 4, F.moonDark + 6)));
  return (
    <g>
      <rect width={VW} height={VH} fill="#070a1c" />
      <Stars f={f} n={70} seed="mn" h={1200} />
      <Moon x={760} y={500} r={130} dark={md} />
      {refl > 0 && (
        <g opacity={refl}>
          <line x1={150} y1={120} x2={700} y2={430} stroke={SUN} strokeWidth={10} strokeDasharray="28 18" strokeDashoffset={-f * 4} />
          <line x1={720} y1={600} x2={420} y2={1000} stroke="#fff6c0" strokeWidth={8} strokeDasharray="28 18" strokeDashoffset={-f * 4} />
          <Chip x={330} y={330} w={360} label="SUNLIGHT IN" hue={SUN} p={refl} fs={32} textColor={INKC} />
        </g>
      )}
      {f >= F.moonDark && <Chip x={760} y={760} w={380} label="MOON: DARK" hue="#5a6a90" p={pop(f, F.moonDark + 2, 10)} fs={38} />}
      <Ground y={1360} c1="#1a2244" c2="#111832" />
      <Kid f={f} x={310} y={1510} s={1.08} />
      <Astro f={f} x={780} y={1510} s={0.98} mood={f >= F.no && f < F.no + 20 ? "neutral" : "happy"} />
      <Bubble f={f} i={2} x={310} y={1020} text={"MOON STILL\nSHINE?"} dx={80} fs={66} />
      {f >= F.no - 2 && f < F.reflects - 6 && <BigNum f={f} at={F.no} text="NO." x={790} y={960} hue={RED} fs={150} />}
    </g>
  );
};
// 6. Planets fade one by one
const S6_Planets: React.FC<{ f: number }> = ({ f }) => {
  const P: [number, number, number, string, number, boolean][] = [
    [300, 520, 50, "#e0b06a", F.fade + 4, false], [760, 760, 44, "#d9573b", F.one, false], [320, 1060, 92, "#d9a57a", F.by, false], [760, 1360, 74, "#e8cf8f", F.one2, true],
  ];
  const names = ["VENUS", "MARS", "JUPITER", "SATURN"];
  return (
    <g>
      <Space f={f} />
      {P.map(([x, y, r, c, at, ring], i) => {
        const o = 1 - eio(ramp(f, at, at + 10));
        return (
          <g key={i} transform={`translate(${x + Math.sin(f * 0.02 + i) * 8} ${y})`}>
            <circle r={r * 1.6} fill={c} opacity={0.15 * o} />
            {ring && <ellipse rx={r * 1.8} ry={r * 0.45} fill="none" stroke={mix(c, "#222", 1 - o)} strokeWidth={10} transform="rotate(-18)" opacity={0.35 + 0.65 * o} />}
            <circle r={r} fill={mix(c, "#11152a", 1 - o)} stroke={mix("#fff", "#2a3050", 1 - o)} strokeWidth={4} />
            <text y={r + 54} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff" opacity={0.25 + 0.75 * o} letterSpacing={3}>{names[i]}</text>
          </g>
        );
      })}
      <text x={540} y={320} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke" opacity={pop(f, F.fade, 10)}>FADING OUT...</text>
      {[F.one, F.by, F.one2].map((at, i) => <text key={i} x={760 - (i % 2) * 440} y={[640, 900, 1250][i]} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={clamp01(pop(f, at, 8)) * (1 - ramp(f, at + 18, at + 26))}>{["ONE", "BY", "ONE"][i]}</text>)}
    </g>
  );
};
// 7. Frozen Earth: "How cold?" + thermometer
const S7_Cold: React.FC<{ f: number }> = ({ f }) => {
  const t1 = eio(ramp(f, F.week, F.zero + 8)), t2 = eio(ramp(f, F.year, F.hundred + 14));
  const temp = Math.round(60 - 60 * t1 - 100 * t2);
  const frost = clamp01(0.25 + t1 * 0.35 + t2 * 0.4);
  const lvl = clamp01((temp + 110) / 180);
  const tx = 840, top = 520, bot = 1290;
  return (
    <g>
      <defs><linearGradient id="sgCold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1430" /><stop offset="1" stopColor="#24406e" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#sgCold)" />
      <Stars f={f} n={60} seed="cd" h={900} />
      <Ground y={1360} c1={mix("#2a3a5a", "#9fd0ec", frost)} c2={mix("#1d2a44", "#3f6e98", frost)} />
      {[120, 520, 980].map((x, i) => <path key={i} d={`M${x} 1330 l40 -110 l40 110 Z`} fill={ICE} opacity={frost} stroke="#8fc6e8" strokeWidth={4} />)}
      <Snow f={f} o={0.4 + frost * 0.6} />
      {/* thermometer */}
      <g>
        <rect x={tx - 46} y={top - 30} width={92} height={bot - top + 60} rx={46} fill="#eef6ff" stroke={INKC} strokeWidth={8} />
        <rect x={tx - 20} y={lerp(bot, top, lvl)} width={40} height={bot - lerp(bot, top, lvl)} rx={20} fill={temp > 20 ? RED : CYAN} />
        <circle cx={tx} cy={bot + 60} r={74} fill={temp > 20 ? RED : CYAN} stroke={INKC} strokeWidth={8} />
        {[60, 0, -50, -100].map((v) => { const yy = lerp(bot, top, (v + 110) / 180); return <g key={v}><line x1={tx + 46} y1={yy} x2={tx + 74} y2={yy} stroke="#fff" strokeWidth={5} /><text x={tx - 62} y={yy + 12} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">{v}°</text></g>; })}
        <text x={tx} y={top - 60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke">{temp}°F</text>
      </g>
      {f >= F.week - 2 && f < F.year - 4 && <Chip x={440} y={620} w={300} label="1 WEEK" hue={YEL} p={pop(f, F.week - 2, 10)} fs={44} textColor={INKC} />}
      {f >= F.year - 2 && <Chip x={440} y={620} w={300} label="1 YEAR" hue={YEL} p={pop(f, F.year - 2, 10)} fs={44} textColor={INKC} />}
      {f >= F.zero && f < F.year - 4 && <BigNum f={f} at={F.zero} text="0°F" x={420} y={860} hue={CYAN} fs={170} />}
      {f >= F.hundred - 4 && <BigNum f={f} at={F.hundred - 4} text="-100°F" x={420} y={860} hue={CYAN} fs={150} />}
      <Kid f={f} x={250} y={1510} s={1.02} mood={f > F.hundred ? "surprised" : undefined} />
      <Astro f={f} x={560} y={1510} s={0.92} />
      {/* frost tint on characters' feet area */}
      <rect x={0} y={1480} width={VW} height={40} fill={ICE} opacity={frost * 0.5} />
      <Bubble f={f} i={3} x={250} y={1050} text={"HOW COLD?!"} dx={110} fs={74} />
    </g>
  );
};
// 8. "So everything dies?" → "Not everything."
const S8_Dies: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="sgIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b1e" /><stop offset="1" stopColor="#1c3158" /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#sgIce)" />
    <Stars f={f} n={80} seed="ds" h={1100} />
    <circle cx={540} cy={560} r={130} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="20 16" opacity={0.3} />
    <path d="M0 1340 L1080 1300 V1920 H0 Z" fill="#9fd0ec" />
    <path d="M0 1400 L1080 1380 V1920 H0 Z" fill="#3f6e98" />
    {[200, 470, 760].map((x, i) => <path key={i} d={`M${x} 1350 l60 30 l50 -10`} stroke="#6aa9cf" strokeWidth={5} fill="none" />)}
    <Snow f={f} n={40} />
    <Kid f={f} x={310} y={1510} s={1.1} mood={f >= F.not ? "happy" : "surprised"} />
    <Astro f={f} x={780} y={1510} s={1.0} wave={f >= F.not - 4 ? 1 : 0} />
    <Bubble f={f} i={4} x={310} y={1010} text={"EVERYTHING\nDIES?!"} dx={90} fs={68} />
    {f >= F.not && <Chip x={700} y={880} w={480} label="NOT EVERYTHING" hue={GREEN} p={pop(f, F.not + 2, 10)} fs={40} textColor={INKC} />}
  </g>
);
// 9. Ocean cross-section: ice blanket on top, life at volcanic vents below (crane down)
const S9_Vents: React.FC<{ f: number }> = ({ f }) => {
  const iceIn = eio(ramp(f, F.freeze - 6, F.freeze + 18));
  return (
    <g>
      <defs>
        <linearGradient id="sgSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d5f9a" /><stop offset="0.5" stopColor="#0b2a52" /><stop offset="1" stopColor="#040b1c" /></linearGradient>
        <radialGradient id="sgVent" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ff8a3d" stopOpacity={0.55} /><stop offset="1" stopColor="#ff8a3d" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={VW} height={VH} fill="#070a1c" />
      <Stars f={f} n={20} seed="vs" h={150} />
      <rect y={180} width={VW} height={VH - 180} fill="url(#sgSea)" />
      {/* ice sheet grows from top */}
      <rect y={180} width={VW} height={170 * iceIn} fill={ICE} stroke="#8fc6e8" strokeWidth={6} />
      {iceIn > 0.5 && [...Array(7)].map((_, i) => <path key={i} d={`M${80 + i * 150} ${200} l30 ${60 + (i % 3) * 20} l-20 40`} stroke="#8fc6e8" strokeWidth={4} fill="none" opacity={iceIn} />)}
      {/* blanket stitches */}
      {f >= F.blanket - 4 && <rect x={30} y={196} width={VW - 60} height={138} rx={20} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="18 14" opacity={pop(f, F.blanket, 10)} />}
      <text x={540} y={440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.freeze, 10) * (1 - ramp(f, F.deep - 10, F.deep))}>OCEANS FREEZE ON TOP</text>
      {f >= F.blanket && f < F.deep && <Chip x={540} y={530} w={480} label="ICE = BLANKET" hue={YEL} p={pop(f, F.blanket, 10)} fs={42} textColor={INKC} />}
      <text x={180} y={700} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#9fd0ec" opacity={0.8}>LIQUID WATER</text>
      {/* depth arrow */}
      <line x1={80} y1={760} x2={80} y2={1360} stroke="#9fd0ec" strokeWidth={6} strokeDasharray="16 12" opacity={0.6} />
      <path d="M60 1350 L80 1390 L100 1350 Z" fill="#9fd0ec" opacity={0.6} />
      {f < F.vents - 4 && <Stamp f={f} at={F.deep} x={560} y={900} text="DEEP DOWN" hue="#9fd0ec" fs={64} rot={-6} />}
      {/* seafloor + vents */}
      <path d="M0 1600 Q 200 1540 380 1580 T 760 1560 T 1080 1590 V1920 H0 Z" fill="#1b1a24" />
      {[[330, 1570, 1.0], [700, 1555, 1.25]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cx={0} cy={-120} rx={160} ry={160} fill="url(#sgVent)" />
          {[...Array(6)].map((_, k) => { const q = ((f * 1.4 + k * 22) % 130) / 130; return <circle key={k} cx={Math.sin(k + f * 0.05) * 14 * q} cy={-90 - q * 220} r={16 + q * 34} fill="#3a3540" opacity={0.7 * (1 - q)} />; })}
          <path d="M-36 0 L-22 -90 L22 -90 L36 0 Z" fill="#2c2833" stroke={INKC} strokeWidth={5} />
          <ellipse cx={0} cy={-90} rx={24} ry={8} fill="#ff8a3d" />
        </g>
      ))}
      {/* tube worms + shrimp appear on "life" */}
      {[...Array(9)].map((_, i) => {
        const x = 400 + i * 34 + (i > 4 ? 120 : 0), p = clamp01(pop(f, F.life + i * 2, 10));
        const hgt = 60 + (i % 3) * 22;
        return (
          <g key={i} opacity={p} transform={`translate(${x} 1585) scale(1.4)`}>
            <line x1={0} y1={0} x2={Math.sin(f * 0.06 + i) * 6} y2={-hgt * p} stroke="#f2efe6" strokeWidth={12} strokeLinecap="round" />
            <circle cx={Math.sin(f * 0.06 + i) * 6} cy={-hgt * p - 8} r={13} fill="#e4473b" stroke={INKC} strokeWidth={3} />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => {
        const p = clamp01(pop(f, F.life + 10 + i * 4, 10));
        const x = 240 + i * 260 + Math.sin(f * 0.05 + i) * 30, y = 1420 + (i % 2) * 50;
        return <g key={i} opacity={p} transform={`translate(${x} ${y}) scale(${i % 2 ? -1.6 : 1.6} 1.6)`}><path d="M-30 0 Q0 -26 30 0 Q10 10 -30 0 Z" fill="#ffd2c2" stroke={INKC} strokeWidth={4} /><path d="M30 0 L48 -10 M30 0 L48 6" stroke={INKC} strokeWidth={3} /></g>;
      })}
      {f >= F.vents - 4 && f < F.needed && <Chip x={540} y={1240} w={460} label="VOLCANIC VENTS" hue="#ff8a3d" p={pop(f, F.vents, 10)} fs={40} textColor={INKC} />}
      {f >= F.life && f < F.keep && <BigNum f={f} at={F.life} text="LIFE!" x={540} y={1070} hue={GREEN} fs={140} />}
      {f >= F.needed && f < F.keep && <Chip x={540} y={1240} w={580} label="NO SUNLIGHT NEEDED" hue={YEL} p={pop(f, F.needed, 10)} fs={40} textColor={INKC} />}
      <Stamp f={f} at={F.keep} x={540} y={1100} text="KEEPS GOING" hue={GREEN} fs={72} rot={-7} />
    </g>
  );
};
// 10. Outro on the ice
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#070b1e" />
    <Stars f={f} n={100} seed="out" />
    <circle cx={540} cy={520} r={120} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="20 16" opacity={0.3} />
    <path d="M0 1380 L1080 1350 V1920 H0 Z" fill="#9fd0ec" />
    <path d="M0 1440 L1080 1420 V1920 H0 Z" fill="#3f6e98" />
    <Outro f={f} at={F.sub} />
    <Astro f={f} x={190} y={1500} s={0.76} wave={1} />
    <Kid f={f} x={890} y={1500} s={0.86} wave={1} mood="happy" />
  </g>
);

export const SunGoneFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.sunlight, render: () => <S1_Yard f={f} />, cam: [[0, { x: 420, y: 1080, z: 1.22 }], [F.eight - 12, { x: 440, y: 1060, z: 1.15 }], [F.eight + 6, { x: 600, y: 1020, z: 1.1 }], [F.nothing2 - 4, { x: 560, y: 1040, z: 1.08 }], [F.sunlight, { x: 420, y: 1080, z: 1.2 }]] },
    { from: F.sunlight, to: F.seeing - 17, tr: "whip", render: () => <S2_Race f={f} />, cam: [[F.sunlight, { x: 540, y: 520, z: 1.3 }], [F.reach + 10, { x: 540, y: 1100, z: 1.2 }], [F.gravity + 6, { x: 540, y: 960, z: 1.0 }], [F.seeing, { x: 540, y: 1000, z: 1.06 }]] },
    { from: F.seeing - 17, to: F.then, tr: "spin", render: () => <S3_Orbit f={f} />, cam: [[F.seeing - 17, { x: 540, y: 900, z: 1.3 }], [F.after, { x: 540, y: 900, z: 1.08 }], [F.gone2, { x: 540, y: 900, z: 1.04, r: -2 }], [F.then, { x: 540, y: 900, z: 1.12 }]] },
    { from: F.then, to: F.moonQ, tr: "iris", render: () => <S4_Tangent f={f} />, cam: [[F.then, { x: 540, y: 1000, z: 1.0 }], [F.flies, { x: 760, y: 1050, z: 1.25 }], [F.space + 10, { x: 760, y: 520, z: 1.25, r: 2 }], [F.moonQ, { x: 700, y: 480, z: 1.3, r: 3 }]] },
    { from: F.moonQ, to: F.planets, tr: "wipe", render: () => <S5_Moon f={f} />, cam: [[F.moonQ, { x: 420, y: 1100, z: 1.15 }], [F.no, { x: 600, y: 1000, z: 1.06 }], [F.reflects, { x: 620, y: 880, z: 1.08 }], [F.planets, { x: 580, y: 840, z: 1.1 }]] },
    { from: F.planets, to: F.cold, tr: "whipUp", render: () => <S6_Planets f={f} />, cam: [[F.planets, { x: 540, y: 700, z: 1.2 }], [F.cold, { x: 540, y: 1000, z: 1.05 }]] },
    { from: F.cold, to: F.dies, tr: "flash", render: () => <S7_Cold f={f} />, cam: [[F.cold, { x: 440, y: 1100, z: 1.12 }], [F.within, { x: 480, y: 1060, z: 1.08 }], [F.zero, { x: 600, y: 960, z: 1.05 }], [F.hundred, { x: 600, y: 940, z: 1.12, r: -1.5 }], [F.dies, { x: 560, y: 980, z: 1.06 }]] },
    { from: F.dies, to: F.oceans, tr: "push", render: () => <S8_Dies f={f} />, cam: [[F.dies, { x: 470, y: 1100, z: 1.16 }], [F.not - 4, { x: 500, y: 1100, z: 1.12 }], [F.oceans, { x: 640, y: 1060, z: 1.12 }]] },
    { from: F.oceans, to: F.sub, tr: "zoom", render: () => <S9_Vents f={f} />, cam: [[F.oceans, { x: 540, y: 420, z: 1.35 }], [F.blanket + 10, { x: 540, y: 520, z: 1.2 }], [F.vents, { x: 540, y: 1300, z: 1.25 }], [F.life + 20, { x: 540, y: 1340, z: 1.3 }], [F.sub, { x: 540, y: 1300, z: 1.18 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "iris", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.eight, 0.1], [F.nothing2, 0.08], [F.eight2, 0.1], [F.same, 0.08], [F.gone2, 0.14], [F.flies, 0.08], [F.no, 0.1], [F.moonDark, 0.08], [F.zero, 0.12], [F.hundred - 4, 0.15], [F.not, 0.08], [F.life, 0.12], [F.keep, 0.1]];
  const SHAKE: [number, number][] = [[F.gone2, 12], [F.dark, 8], [F.hundred - 4, 12], [F.keep, 8]];
  const SFX: Cue[] = [
    [F.ask - 4, "pop", 0.4], [F.eight, "impact", 0.45], [F.nothing, "pop", 0.3], [F.nothing2 - 4, "pop", 0.45],
    [F.sunlight + 6, "riser", 0.25], [F.eight2, "impact", 0.4], [F.gravity, "whoosh", 0.3], [F.same, "pop", 0.4],
    [F.seeing, "tick", 0.3], [F.orbiting, "tick", 0.3], [F.after - 30, "riser_dark", 0.28], [F.gone2, "boom", 0.5],
    [F.dark, "impact", 0.35], [F.flies - 2, "whoosh", 0.4], [F.straight, "pop", 0.35],
    [F.moonQ - 4, "pop", 0.4], [F.no, "impact", 0.4], [F.reflects, "tick", 0.3], [F.moonDark, "boom", 0.35],
    [F.fade, "pop", 0.3], [F.one, "tick", 0.35], [F.by, "tick", 0.35], [F.one2, "tick", 0.35],
    [F.cold - 4, "pop", 0.4], [F.week - 2, "pop", 0.35], [F.zero, "impact", 0.45], [F.year - 2, "pop", 0.35], [F.minus - 20, "riser", 0.25], [F.hundred - 4, "boom", 0.5],
    [F.dies - 4, "pop", 0.4], [F.not + 2, "pop", 0.4], [F.freeze, "tick", 0.3], [F.blanket, "pop", 0.35], [F.deep, "impact", 0.35], [F.vents, "pop", 0.35], [F.life, "boom", 0.4], [F.needed, "pop", 0.35], [F.keep, "impact", 0.4],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2);
  const accent = f < F.then ? YEL : f < F.oceans ? CYAN : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="NO SUN" sub="WHAT IF IT VANISHED?" until={34} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="sungone" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
