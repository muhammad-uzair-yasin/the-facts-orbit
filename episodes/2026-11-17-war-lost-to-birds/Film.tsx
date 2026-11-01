import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// ---------- cue helpers (frames come straight from words.ts) ----------
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9']/g, "");
const at = (w: string, after = 0) => { for (const [a, , t] of WORDS) if (a >= after && norm(t) === norm(w)) return a; throw new Error(`cue not found: ${w}`); };
const ASK: [number, number][] = [];
for (const [a, b, s] of SPK) {
  if (s !== "asker") continue;
  const L = ASK[ASK.length - 1];
  if (L && !SPK.some(([a2, , s2]) => s2 !== "asker" && a2 > L[1] && a2 < a)) L[1] = b; else ASK.push([a, b]);
}

// cue table
const F = (() => {
  const australia = at("Australia,"), y1932 = at("1932."), twenty = at("twenty", y1932), marched = at("marched", twenty), wheat = at("wheat.", marched);
  const so = at("So", wheat), army = at("army?", so), did = at("They", army), major = at("Major", did), two = at("two", major), ten = at("ten", two);
  const easy = at("That", ten), wasnt = at("wasn't.", easy), split = at("split", wasnt), every = at("every", split), flock = at("flock", every), jammed = at("jammed.", flock);
  const mounted = at("mounted", jammed), outran = at("outran", mounted), birds = at("Birds", outran), fifty = at("fifty", birds), hour = at("hour.", fifty);
  const weeks = at("weeks", hour), thousand = at("thousand", weeks), ten2 = at("ten", thousand), each = at("each", ten2);
  const who = at("So", each), emus = at("emus.", who), said = at("major", emus), tough = at("tough", said), world = at("world.", tough), sub = at("Subscribe", world);
  return { australia, y1932, twenty, marched, wheat, so, army, did, major, two, ten, easy, wasnt, split, every, flock, jammed, mounted, outran, birds, fifty, hour, weeks, thousand, ten2, each, who, emus, said, tough, world, sub };
})();

const COWBOY = CAST[21], FARMER = CAST[41], MAJOR = CAST[38];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const SKY = "#ffe2b0", SKY2 = "#ffc98a", SOIL = "#e0a85a", WHEAT = "#f2c94c", RUST = "#c4572a", OLIVE = "#5b6b3a", RED = "#e4473b", GREEN = "#3ddc97";
const fmt = (n: number) => n.toLocaleString("en-US");

// ---------- shared pieces ----------
const Bubble: React.FC<{ f: number; x: number; y: number; labels: string[]; tail?: number; fs?: number; hue?: string; minX?: number; maxX?: number }> = ({ f, x, y, labels, tail = 0, fs = 72, hue = "#ffffff", minX = 110, maxX = 970 }) => {
  const i = ASK.findIndex(([a, b]) => f >= a - 3 && f <= b + 10);
  if (i < 0 || !labels[i]) return null;
  const [a, b] = ASK[i];
  const p = clamp01(pop(f, i === 0 ? Math.max(a - 3, 36) : a - 3, 10)) * (1 - ramp(f, b + 4, b + 10));
  if (p <= 0) return null;
  const lines = labels[i].split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  fs = Math.min(fs, 680 / (longest * 0.66));
  const w = longest * fs * 0.66 + 90;
  const h = lines.length * fs * 1.1 + 56;
  const cx = Math.min(maxX - w / 2, Math.max(minX + w / 2, x));
  const tx = x + tail - cx;
  return (
    <g transform={`translate(${cx} ${y}) scale(${0.6 + 0.4 * p}) rotate(${Math.sin(f * 0.12) * 1.5})`} opacity={p}>
      <path d={`M${tx - 34} ${-4} L${tx + 8} ${62} L${tx + 34} ${-4} Z`} fill={hue} stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h} width={w} height={h} rx={44} fill={hue} stroke={INKC} strokeWidth={7} />
      <path d={`M${tx - 30} ${-7} L${tx + 30} ${-7}`} stroke={hue} strokeWidth={10} />
      {lines.map((l, k) => (
        <text key={k} x={0} y={-h + 28 + fs * 0.86 + k * fs * 1.1} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC} letterSpacing={1}>{l}</text>
      ))}
    </g>
  );
};
const ASKL = ["LOST A WAR...\nTO BIRDS?!", "THEY CALLED\nTHE ARMY?", "EASY WIN!", "OUTRAN A\nTRUCK?!", "WHO WON?"];

/** Emu, facing right, origin at its feet. run 0..1.5 = leg speed; peck 0..1 = head down eating. */
const Emu: React.FC<{ f: number; x: number; y: number; s?: number; flip?: boolean; run?: number; seed?: number; peck?: number; medal?: boolean }> = ({ f, x, y, s = 1, flip, run = 0, seed = 0, peck = 0, medal }) => {
  const ph = f * 0.6 * Math.max(run, 0.001) + seed * 2.1;
  const a = Math.sin(ph) * 32 * Math.min(1, run), bob = Math.abs(Math.sin(ph)) * 10 * Math.min(1, run);
  const hipY = -165 - bob;
  const leg = (ang: number, k: number) => {
    const r = (ang * Math.PI) / 180;
    const kx = Math.sin(r) * 85, ky = hipY + Math.cos(r) * 85;
    const fx = kx - Math.sin(r * 0.6) * 20 - 6, fy = -2 + Math.min(0, Math.cos(r) * 0) - (k * Math.max(0, Math.sin(ph + (k ? Math.PI : 0))) * 18 * Math.min(1, run));
    return <g key={k}><path d={`M0 ${hipY} L${kx} ${ky} L${fx} ${fy}`} stroke="#6a5a48" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${fx - 18} ${fy} L${fx + 26} ${fy} M${fx} ${fy} L${fx + 20} ${fy - 10}`} stroke="#6a5a48" strokeWidth={8} strokeLinecap="round" /></g>;
  };
  const nx = lerp(85, 140, peck), ny = lerp(-370, -190, peck) - bob * 1.5;
  const sway = Math.sin(ph * 0.5 + seed) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={10} fill="#000" opacity={0.14} />
      {leg(a, 0)}
      {leg(-a, 1)}
      <path d={`M60 ${-245 - bob} Q${95 + sway} ${(-245 + ny) / 2 - bob} ${nx} ${ny + 18}`} stroke="#7f8ea8" strokeWidth={28} fill="none" strokeLinecap="round" />
      <g transform={`translate(0 ${-bob})`}>
        <path d="M-100 -215 Q-110 -290 -10 -292 Q80 -296 90 -230 Q92 -170 20 -158 Q-40 -150 -100 -175 Q-118 -190 -100 -215Z" fill="#6e5440" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
        {[...Array(7)].map((_, i) => <path key={i} d={`M${-80 + i * 24} ${-180 + (i % 2) * 6} q 6 22 -6 36`} stroke="#3e2f24" strokeWidth={6} fill="none" strokeLinecap="round" />)}
        {[...Array(5)].map((_, i) => <path key={i} d={`M${-70 + i * 30} -270 q 10 14 4 30`} stroke="#7a6450" strokeWidth={5} fill="none" strokeLinecap="round" />)}
      </g>
      <g transform={`translate(${nx} ${ny})`}>
        <ellipse cx={0} cy={0} rx={30} ry={25} fill="#6f7f9a" stroke={INKC} strokeWidth={5} />
        <path d="M18 -6 Q52 0 20 10Z" fill="#3a3a3a" stroke={INKC} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={6} cy={-6} r={8} fill="#fff" stroke={INKC} strokeWidth={3} />
        <circle cx={8} cy={-6} r={4} fill="#c4572a" />
        <path d="M-18 -18 q 4 -14 14 -16 M-8 -20 q 8 -12 16 -10" stroke="#5a4636" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      {medal && <g transform={`translate(70 ${-235 - bob})`}><path d="M-14 -40 L0 0 L14 -40" stroke={RED} strokeWidth={10} fill="none" /><circle r={22} fill={YEL} stroke={INKC} strokeWidth={5} /><text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={INKC}>1</text></g>}
    </g>
  );
};
/** wheat field band; eaten 0..1 removes stalks */
const Wheat: React.FC<{ f: number; y: number; h?: number; eaten?: number; seed?: string }> = ({ f, y, h = 380, eaten = 0, seed = "w" }) => (
  <g>
    <rect x={0} y={y} width={VW} height={h} fill={mix(WHEAT, SOIL, eaten * 0.8)} />
    {[...Array(46)].map((_, i) => {
      if (rnd(seed + "e" + i) < eaten) return null;
      const x = (i / 46) * VW + rnd(seed + i) * 20, yy = y + 30 + (i % 3) * (h / 3.4);
      const sw = Math.sin(f * 0.06 + i) * 6;
      return <g key={i}><path d={`M${x} ${yy + 70} Q${x + sw / 2} ${yy + 30} ${x + sw} ${yy}`} stroke="#c9962a" strokeWidth={5} fill="none" /><ellipse cx={x + sw} cy={yy - 10} rx={9} ry={22} fill="#f7d76a" stroke="#b9862a" strokeWidth={3} transform={`rotate(${sw * 2} ${x + sw} ${yy - 10})`} /></g>;
    })}
  </g>
);
const Outback: React.FC<{ f: number; ground?: number }> = ({ f, ground = 1330 }) => (
  <g>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY2} /><stop offset="1" stopColor={SKY} /></linearGradient></defs>
    <rect width={VW} height={VH} fill="url(#sky)" />
    <circle cx={840} cy={360} r={110} fill="#fff3c4" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 400 + f * 0.5) % 1400) - 160} cy={250 + i * 110} rx={110} ry={32} fill="#fff" opacity={0.7} />)}
    <path d={`M0 ${ground - 220} Q 260 ${ground - 300} 520 ${ground - 230} T 1080 ${ground - 240} V ${ground} H0Z`} fill="#e6a35e" opacity={0.6} />
  </g>
);
const Fence: React.FC<{ y: number }> = ({ y }) => (
  <g>{[...Array(9)].map((_, i) => <rect key={i} x={i * 135 + 10} y={y - 120} width={16} height={130} fill="#8a5a2b" stroke={INKC} strokeWidth={4} />)}
    <path d={`M0 ${y - 90} H1080 M0 ${y - 45} H1080`} stroke="#8a5a2b" strokeWidth={10} /></g>
);
const Duo: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised" }> = ({ f, askMood, hostMood }) => (
  <g>
    <g transform="translate(290 1480) scale(0.98)"><Person d={COWBOY} f={f} seed={21} talk={askTalk(f)} wave={0} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy")} /></g>
    <g transform="translate(800 1480) scale(0.98)"><Person d={FARMER} f={f} seed={41} talk={hostTalk(f)} wave={0} mood={hostMood ?? "happy"} /></g>
  </g>
);
/** Lewis-style machine gun on a tripod (simple prop). */
const Gun: React.FC<{ x: number; y: number; s?: number; jam?: number; f: number; rot?: number }> = ({ x, y, s = 1, jam = 0, f, rot = -6 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + (jam > 0 ? Math.sin(f * 1.3) * 3 * (1 - jam) : 0)})`}>
    <path d="M0 0 L-60 110 M0 0 L60 110 M0 0 L0 115" stroke="#3a3a40" strokeWidth={10} strokeLinecap="round" />
    <rect x={-70} y={-30} width={190} height={40} rx={12} fill="#4a4f58" stroke={INKC} strokeWidth={6} />
    <rect x={110} y={-20} width={90} height={18} rx={6} fill="#3a3a40" stroke={INKC} strokeWidth={5} />
    <rect x={-120} y={-24} width={60} height={30} rx={8} fill="#8a5a2b" stroke={INKC} strokeWidth={5} />
    <ellipse cx={20} cy={-42} rx={56} ry={14} fill="#2a2d33" stroke={INKC} strokeWidth={5} />
    {jam > 0 && [0, 1, 2].map((i) => <circle key={i} cx={150 + i * 26} cy={-40 - ((f * 2 + i * 14) % 50)} r={16 + i * 4} fill="#d8d8d8" opacity={0.7 * jam} />)}
  </g>
);
const Truck: React.FC<{ f: number; x: number; y: number; s?: number; children?: React.ReactNode; bounce?: number }> = ({ f, x, y, s = 1, children, bounce = 1 }) => {
  const b = Math.abs(Math.sin(f * 0.5)) * 6 * bounce;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${-b})`}>
        {children}
        <rect x={-240} y={-140} width={300} height={70} rx={8} fill="#6b7a4a" stroke={INKC} strokeWidth={7} />
        <path d="M60 -70 V-210 H170 L230 -140 V-70Z" fill="#7d8c56" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
        <path d="M90 -190 H160 L205 -140 H90Z" fill="#bfe6ff" stroke={INKC} strokeWidth={5} />
        <rect x={-250} y={-80} width={500} height={30} rx={8} fill="#4a5434" stroke={INKC} strokeWidth={6} />
      </g>
      {[-160, 150].map((wx, i) => (
        <g key={i} transform={`translate(${wx} -45) rotate(${f * 14})`}>
          <circle r={48} fill="#2a2a2a" stroke={INKC} strokeWidth={6} /><circle r={18} fill="#9aa4b2" />
          <path d="M-40 0 H40 M0 -40 V40" stroke="#555" strokeWidth={6} />
        </g>
      ))}
    </g>
  );
};
const Dust: React.FC<{ f: number; x: number; y: number; n?: number }> = ({ f, x, y, n = 6 }) => (
  <g>{[...Array(n)].map((_, i) => { const q = ((f * 0.05 + i / n) % 1); return <circle key={i} cx={x - q * 220} cy={y - q * 40 - (i % 2) * 20} r={14 + q * 36} fill="#e8c890" opacity={0.6 * (1 - q)} />; })}</g>
);
const AUS = "M120 250 Q160 160 270 150 L330 90 Q380 60 420 110 L470 80 Q520 70 540 130 L580 100 Q610 140 620 200 Q680 250 700 330 Q720 420 660 500 Q610 560 520 560 Q470 600 420 570 Q360 520 290 530 Q200 560 140 520 Q90 470 100 400 Q80 320 120 250Z";

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Outback f={f} />
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
    <Wheat f={f} y={1080} h={260} />
    <Fence y={1340} />
    <Emu f={f} x={960} y={1120} s={0.55} peck={0.5 + 0.5 * Math.sin(f * 0.15)} seed={3} />
    <Duo f={f} />
    <Bubble f={f} x={290} y={890} labels={ASKL} />
  </g>
);
const S2_Invasion: React.FC<{ f: number }> = ({ f }) => {
  const n = countUp(f, F.twenty - 4, F.marched + 30, 20000);
  const eaten = ramp(f, F.wheat - 50, F.wheat + 30);
  const waP = ramp(f, F.australia + 10, F.australia + 30);
  return (
    <g>
      <Outback f={f} ground={1100} />
      {/* map in the sky */}
      <g transform="translate(130 260) scale(1.15)">
        <path d={AUS} fill="#f5d9a8" stroke={INKC} strokeWidth={7} strokeLinejoin="round" />
        <clipPath id="ausClip"><path d={AUS} /></clipPath>
        <rect x={60} y={40} width={210 * waP} height={560} fill={RUST} opacity={0.75} clipPath="url(#ausClip)" />
        <text x={190} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff" opacity={waP}>WESTERN</text>
        <text x={190} y={395} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff" opacity={waP}>AUSTRALIA</text>
      </g>
      <BigNum f={f} at={F.y1932} text="1932" x={760} y={330} hue={YEL} fs={130} />
      {/* farm below */}
      <rect x={0} y={1100} width={VW} height={VH - 1100} fill={SOIL} />
      <Wheat f={f} y={1180} h={420} eaten={eaten} />
      {[...Array(16)].map((_, i) => {
        const start = F.twenty + i * 6;
        const tx = clamp01((f - start) / 70);
        const homeX = 60 + (i % 8) * 135 + rnd("ex" + i) * 40, homeY = 1260 + Math.floor(i / 8) * 190 + rnd("ey" + i) * 30;
        const x = lerp(1260 + i * 30, homeX, eout(tx));
        if (f < start) return null;
        return <Emu key={i} f={f} x={x} y={homeY} s={0.5} flip run={tx < 1 ? 1 : 0} peck={tx >= 1 ? 0.5 + 0.5 * Math.sin(f * 0.18 + i) : 0} seed={i} />;
      })}
      {f >= F.twenty - 4 && (
        <g transform="translate(540 1010)" opacity={pop(f, F.twenty - 4, 10)}>
          <rect x={-300} y={-80} width={600} height={130} rx={30} fill="#fff" stroke={INKC} strokeWidth={7} />
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={RUST}>~{fmt(n)}</text>
          <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC} stroke="#fff" strokeWidth={8} paintOrder="stroke">EMUS</text>
        </g>
      )}
      {f >= F.wheat && <Stamp f={f} at={F.wheat + 2} x={540} y={760} text="WHEAT EATEN" hue={RED} fs={66} rot={-6} />}
    </g>
  );
};
const S3_Army: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Outback f={f} />
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
    <Wheat f={f} y={1080} h={260} eaten={0.6} seed="w2" />
    <Fence y={1340} />
    {[0, 1, 2].map((i) => <Emu key={i} f={f} x={620 + i * 170} y={1150 + (i % 2) * 30} s={0.45} peck={0.5 + 0.5 * Math.sin(f * 0.2 + i)} seed={i} />)}
    <Duo f={f} hostMood="neutral" />
    {/* old telephone in farmer's hand area */}
    {f >= F.did && <Chip x={800} y={900} w={360} label="CALL THE ARMY" hue={OLIVE} p={pop(f, F.did, 10)} fs={34} />}
    <Bubble f={f} x={290} y={890} labels={ASKL} />
  </g>
);
const S4_Major: React.FC<{ f: number }> = ({ f }) => {
  const arrive = eout(ramp(f, F.major - 30, F.major + 20));
  const bullets = countUp(f, F.ten, F.ten + 40, 10000);
  return (
    <g>
      <Outback f={f} />
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
      <Wheat f={f} y={1150} h={190} eaten={0.6} seed="w3" />
      {/* the major marches in */}
      <g transform={`translate(${lerp(1300, 760, arrive)} 1480) scale(1.0)`}><Person d={MAJOR} f={f} seed={38} talk={0} wave={f > F.major + 10 && f < F.two ? 1 : 0} mood="happy" /></g>
      <Chip x={700} y={950} w={420} label="MAJOR MEREDITH" hue={OLIVE} p={pop(f, F.major + 8, 10) * (1 - ramp(f, F.two + 6, F.two + 14))} fs={36} />
      {/* gear */}
      {f >= F.two && [0, 1].map((i) => (
        <g key={i} opacity={clamp01(pop(f, F.two + i * 8, 10))} transform={`translate(${220 + i * 0} ${560 + i * 220}) scale(${clamp01(pop(f, F.two + i * 8, 10))})`}><Gun f={f} x={0} y={0} s={0.8} /></g>
      ))}
      {f >= F.two && <BigNum f={f} at={F.two} text="×2" x={470} y={720} hue={YEL} fs={110} />}
      {f >= F.ten && (
        <g transform="translate(330 340)" opacity={clamp01(pop(f, F.ten, 10)) * (1 - ramp(f, F.easy - 14, F.easy - 4))}>
          <rect x={-260} y={-70} width={520} height={130} rx={24} fill="#fff" stroke={INKC} strokeWidth={7} />
          {[...Array(8)].map((_, i) => <g key={i} transform={`translate(${-220 + i * 18} -10)`}><rect x={-5} y={-30} width={10} height={44} rx={4} fill="#d9a441" stroke={INKC} strokeWidth={2} /></g>)}
          <text x={60} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={INKC}>{fmt(bullets)}</text>
          <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={INKC} stroke="#fff" strokeWidth={8} paintOrder="stroke">BULLETS</text>
        </g>
      )}
      {/* asker watching from the left edge */}
      <g transform={`translate(${lerp(-120, 150, eout(ramp(f, F.easy - 16, F.easy)))} 1560) scale(0.62)`}><Person d={COWBOY} f={f} seed={21} talk={askTalk(f)} wave={0} mood={f >= F.wasnt ? "surprised" : "happy"} /></g>
      <Bubble f={f} x={160} y={1220} labels={ASKL} />
      {f >= F.wasnt && <Stamp f={f} at={F.wasnt + 2} x={560} y={1130} text="IT WASN'T" hue={RED} fs={76} rot={-8} />}
    </g>
  );
};
const S5_Scatter: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp01((f - F.split) / 60);
  const jam = ramp(f, F.jammed - 4, F.jammed + 6);
  const flockIn = eout(ramp(f, F.flock - 10, F.jammed));
  return (
    <g>
      <rect width={VW} height={VH} fill="#f2d39a" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("t" + i) * VW} cy={300 + rnd("u" + i) * 1500} r={6 + rnd("v" + i) * 10} fill="#d9b070" opacity={0.6} />)}
      <text x={540} y={260} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={INKC} opacity={pop(f, F.split, 10)}>EMU TACTICS</text>
      {/* small groups running every direction */}
      {[...Array(6)].map((_, g) => {
        const ang = (g / 6) * Math.PI * 2 + 0.4;
        const d = eout(t) * 340;
        const gx = 540 + Math.cos(ang) * d, gy = 900 + Math.sin(ang) * d * 0.8;
        return (
          <g key={g}>
            {f >= F.every && <path d={`M${540 + Math.cos(ang) * 90} ${900 + Math.sin(ang) * 72} L${540 + Math.cos(ang) * 420} ${900 + Math.sin(ang) * 336}`} stroke={RED} strokeWidth={8} strokeDasharray="16 14" opacity={0.5 * ramp(f, F.every, F.every + 10)} />}
            {[0, 1, 2].map((k) => <Emu key={k} f={f} x={gx + (k - 1) * 40} y={gy + 110 + k * 12} s={0.36} flip={Math.cos(ang) < 0} run={1.3} seed={g * 3 + k} />)}
          </g>
        );
      })}
      {/* big flock comes close, gun jams */}
      {f >= F.flock - 10 && [...Array(7)].map((_, i) => <Emu key={i} f={f} x={lerp(1250, 620 + (i % 4) * 110, flockIn) + (jam > 0 ? (f - F.jammed) * 10 : 0)} y={1560 + Math.floor(i / 4) * 40} s={0.5} flip run={1.2} seed={i + 30} />)}
      <Gun f={f} x={220} y={1400} s={1.1} jam={jam} rot={-4} />
      {f >= F.jammed && <Stamp f={f} at={F.jammed} x={330} y={1180} text="JAMMED!" hue={RED} fs={72} rot={-10} />}
    </g>
  );
};
const S6_Truck: React.FC<{ f: number }> = ({ f }) => {
  const drive = (f - F.mounted) * 4;
  return (
    <g>
      <Outback f={f} ground={1250} />
      <rect x={0} y={1250} width={VW} height={VH - 1250} fill={SOIL} />
      {[...Array(10)].map((_, i) => <rect key={i} x={((i * 180 - drive * 2.5) % 1260 + 1260) % 1260 - 120} y={1440} width={90} height={12} rx={6} fill="#c48a40" />)}
      {[...Array(5)].map((_, i) => <path key={i} transform={`translate(${((i * 280 - drive * 0.8) % 1400 + 1400) % 1400 - 160} 1150)`} d="M0 100 Q-10 40 -30 20 M0 100 Q10 30 30 10 M0 100 V0" stroke="#7a8a3a" strokeWidth={8} fill="none" />)}
      {/* emus in front, pulling away */}
      {[...Array(5)].map((_, i) => {
        const lead = ramp(f, F.outran - 20, F.outran + 40) * 160;
        return <Emu key={i} f={f} x={680 + i * 70 + lead + Math.sin(f * 0.1 + i) * 14} y={1500 + (i % 2) * 40} s={0.5} run={1.5} seed={i + 9} />;
      })}
      <Dust f={f} x={120} y={1560} n={7} />
      <Truck f={f} x={380} y={1580} s={0.95}>
        <g transform="translate(-110 -140) scale(0.55)"><Person d={MAJOR} f={f} seed={38} talk={0} wave={0} mood={f >= F.outran ? "surprised" : "happy"} /></g>
        <Gun f={f} x={-170} y={-230} s={0.55} rot={-10} />
      </Truck>
      {f >= F.mounted && <Chip x={330} y={1180} w={400} label="GUN ON A TRUCK" hue={OLIVE} p={pop(f, F.mounted + 4, 10)} fs={34} />}
      {f >= F.outran && <Stamp f={f} at={F.outran + 2} x={760} y={900} text="OUTRAN!" hue={RED} fs={80} rot={-8} />}
    </g>
  );
};
const Gauge: React.FC<{ f: number; x: number; y: number; v: number }> = ({ f, x, y, v }) => {
  const ang = -120 + v * 240;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={170} fill="#fff" stroke={INKC} strokeWidth={9} />
      <path d="M-147 85 A170 170 0 1 1 147 85" fill="none" stroke="#eee" strokeWidth={22} />
      <path d={`M-147 85 A170 170 0 ${v > 0.5 ? 1 : 0} 1 ${Math.sin((ang * Math.PI) / 180) * 170} ${-Math.cos((ang * Math.PI) / 180) * 170}`} fill="none" stroke={RED} strokeWidth={22} opacity={v > 0.02 ? 1 : 0} />
      <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 130} y2={-Math.cos((ang * Math.PI) / 180) * 130} stroke={INKC} strokeWidth={10} strokeLinecap="round" />
      <circle r={16} fill={INKC} />
      <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC}>{Math.round(v * 50)}</text>
      <text y={150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={INKC}>KM/H</text>
    </g>
  );
};
const S7_Speed: React.FC<{ f: number }> = ({ f }) => {
  const v = eout(ramp(f, F.fifty - 10, F.fifty + 20));
  const zoomX = ((f - F.birds) * 18) % 1600;
  return (
    <g>
      <Outback f={f} />
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
      <Fence y={1340} />
      {/* emu streaking past behind the duo */}
      {[...Array(6)].map((_, i) => <line key={i} x1={1180 - zoomX - 100 - i * 50} y1={1060 + i * 18} x2={1180 - zoomX - 300 - i * 50} y2={1060 + i * 18} stroke="#fff" strokeWidth={6} opacity={0.7} />)}
      <Emu f={f} x={1180 - zoomX} y={1250} s={0.6} flip run={1.6} seed={5} />
      <Duo f={f} />
      {f >= F.fifty - 10 && <g opacity={pop(f, F.fifty - 10, 12)}><Gauge f={f} x={780} y={620} v={v} /></g>}
      <Bubble f={f} x={290} y={890} labels={ASKL} />
    </g>
  );
};
const S8_Tally: React.FC<{ f: number }> = ({ f }) => {
  const k = countUp(f, F.thousand - 6, F.thousand + 30, 1000);
  const bulletsShown = Math.min(10, Math.floor(ramp(f, F.ten2 - 6, F.each + 10) * 10.99));
  return (
    <g>
      <rect width={VW} height={VH} fill="#f6e7c8" />
      <rect x={90} y={300} width={900} height={1220} rx={30} fill="#3a4a2a" stroke="#6b4a24" strokeWidth={22} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" opacity={pop(f, F.weeks, 10)}>AFTER WEEKS...</text>
      {[...Array(Math.min(6, Math.floor(ramp(f, F.weeks, F.thousand) * 6.9)))].map((_, i) => <g key={i} transform={`translate(${180 + i * 120} 500)`}><path d="M0 0 V80 M20 0 V80 M40 0 V80 M60 0 V80 M-10 70 L70 10" stroke="#fff" strokeWidth={6} /></g>)}
      <g transform="translate(330 860)">
        <Emu f={f} x={0} y={60} s={0.6} seed={2} />
      </g>
      <text x={690} y={830} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={YEL}>~{fmt(k)}</text>
      <text x={690} y={890} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#fff">BIRDS CLAIMED</text>
      {f >= F.ten2 - 6 && (
        <g>
          <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">BULLETS PER BIRD</text>
          {[...Array(bulletsShown)].map((_, i) => <g key={i} transform={`translate(${200 + i * 76} ${1150}) scale(${clamp01(pop(f, F.ten2 - 6 + i * 3, 8))})`}><rect x={-14} y={-50} width={28} height={84} rx={10} fill="#d9a441" stroke={INKC} strokeWidth={4} /><path d="M-14 -40 Q0 -80 14 -40Z" fill="#b87333" stroke={INKC} strokeWidth={4} /></g>)}
          <BigNum f={f} at={F.ten2} text="~10" x={540} y={1400} hue={YEL} fs={170} />
        </g>
      )}
    </g>
  );
};
const S9_Winner: React.FC<{ f: number }> = ({ f }) => {
  const tro = pop(f, F.emus, 14);
  const quote = ramp(f, F.said, F.said + 14);
  return (
    <g>
      <rect width={VW} height={VH} fill="#ffe7b3" />
      {[...Array(14)].map((_, i) => <path key={i} d={`M540 820 L${540 + Math.cos(i * 0.45 + f * 0.01) * 1400} ${820 + Math.sin(i * 0.45 + f * 0.01) * 1400} L${540 + Math.cos(i * 0.45 + 0.2 + f * 0.01) * 1400} ${820 + Math.sin(i * 0.45 + 0.2 + f * 0.01) * 1400}Z`} fill="#ffd27a" opacity={0.6 * clamp01(tro)} />)}
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
      {/* podium */}
      <g transform="translate(540 1330)">
        <rect x={-170} y={-200} width={340} height={200} fill={YEL} stroke={INKC} strokeWidth={8} />
        <text y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={INKC}>1</text>
      </g>
      <g opacity={clamp01(tro)}><Emu f={f} x={540} y={1130} s={0.8} medal seed={1} peck={Math.max(0, Math.sin(f * 0.08)) * 0.15} /></g>
      {f >= F.emus && (
        <g transform={`translate(540 420) scale(${clamp01(tro)}) rotate(${-4 + Math.sin(f * 0.1) * 2})`}>
          <rect x={-330} y={-90} width={660} height={170} rx={26} fill={RED} stroke={INKC} strokeWidth={8} />
          <text y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">WINNER</text>
          <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={76} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke">THE EMUS</text>
        </g>
      )}
      <g transform="translate(170 1560) scale(0.78)"><Person d={COWBOY} f={f} seed={21} talk={askTalk(f)} wave={f > F.emus ? 1 : 0} mood={f >= F.emus ? "surprised" : "happy"} /></g>
      <g transform="translate(910 1560) scale(0.78)"><Person d={FARMER} f={f} seed={41} talk={hostTalk(f)} wave={0} mood="happy" /></g>
      <Bubble f={f} x={200} y={1150} labels={ASKL} />
      {quote > 0 && (
        <g opacity={quote} transform={`translate(540 ${lerp(700, 680, quote)})`}>
          <rect x={-420} y={-110} width={840} height={200} rx={24} fill="#fff" stroke={INKC} strokeWidth={6} />
          <text y={-46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#6a6a6a">MAJOR MEREDITH (PARAPHRASED):</text>
          <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>"SOLDIERS AS TOUGH AS THESE</text>
          <text y={58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>BIRDS COULD FACE ANY ARMY"</text>
        </g>
      )}
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Outback f={f} />
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={SOIL} />
    <Emu f={f} x={540} y={1440} s={0.5} medal peck={0} />
    <Outro f={f} at={F.sub} light />
    <g transform="translate(140 1570) scale(0.72)"><Person d={COWBOY} f={f} seed={21} talk={0} wave={1} mood="happy" /></g>
    <g transform="translate(940 1570) scale(0.72)"><Person d={FARMER} f={f} seed={41} talk={hostTalk(f)} wave={1} mood="happy" /></g>
  </g>
);

export const EmuWarFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.australia, render: () => <S1_Ask f={f} />, cam: [[0, { x: 540, y: 1000, z: 1.05 }], [40, { x: 420, y: 1060, z: 1.15 }], [F.australia, { x: 380, y: 1080, z: 1.24 }]] },
    { from: F.australia, to: F.so, tr: "whip", render: () => <S2_Invasion f={f} />, cam: [[F.australia, { x: 460, y: 560, z: 1.3 }], [F.y1932 + 10, { x: 540, y: 600, z: 1.12 }], [F.twenty - 10, { x: 540, y: 780, z: 1.0 }], [F.marched + 20, { x: 540, y: 1180, z: 1.1 }], [F.so, { x: 540, y: 1140, z: 1.18, r: -1 }]] },
    { from: F.so, to: F.major, tr: "wipe", render: () => <S3_Army f={f} />, cam: [[F.so, { x: 400, y: 1060, z: 1.22 }], [F.did, { x: 620, y: 1020, z: 1.1 }], [F.major, { x: 660, y: 1020, z: 1.16 }]] },
    { from: F.major, to: F.split, tr: "push", render: () => <S4_Major f={f} />, cam: [[F.major, { x: 760, y: 1060, z: 1.25 }], [F.two + 6, { x: 520, y: 900, z: 1.05 }], [F.ten + 10, { x: 460, y: 760, z: 1.1 }], [F.easy, { x: 400, y: 1050, z: 1.12 }], [F.split, { x: 480, y: 1050, z: 1.18, r: 1 }]] },
    { from: F.split, to: F.mounted, tr: "zoom", render: () => <S5_Scatter f={f} />, cam: [[F.split, { x: 540, y: 900, z: 1.3 }], [F.every + 20, { x: 540, y: 960, z: 1.02 }], [F.flock, { x: 460, y: 1250, z: 1.12 }], [F.mounted, { x: 400, y: 1280, z: 1.22 }]] },
    { from: F.mounted, to: F.birds, tr: "whip", render: () => <S6_Truck f={f} />, cam: [[F.mounted, { x: 340, y: 1300, z: 1.25 }], [F.outran, { x: 560, y: 1250, z: 1.1 }], [F.birds, { x: 700, y: 1220, z: 1.2 }]] },
    { from: F.birds, to: F.weeks - 8, tr: "iris", render: () => <S7_Speed f={f} />, cam: [[F.birds, { x: 380, y: 1060, z: 1.22 }], [F.fifty, { x: 600, y: 900, z: 1.08 }], [F.weeks - 8, { x: 640, y: 860, z: 1.14 }]] },
    { from: F.weeks - 8, to: F.who, tr: "spin", render: () => <S8_Tally f={f} />, cam: [[F.weeks - 8, { x: 540, y: 600, z: 1.3 }], [F.thousand, { x: 540, y: 820, z: 1.12 }], [F.ten2, { x: 540, y: 1180, z: 1.1 }], [F.who, { x: 540, y: 1200, z: 1.16 }]] },
    { from: F.who, to: F.sub, tr: "flash", render: () => <S9_Winner f={f} />, cam: [[F.who, { x: 300, y: 1240, z: 1.3 }], [F.emus, { x: 540, y: 960, z: 1.05 }], [F.said, { x: 540, y: 900, z: 1.0 }], [F.sub, { x: 540, y: 880, z: 1.08 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.y1932, 0.1], [F.twenty, 0.08], [F.wheat, 0.08], [F.two, 0.08], [F.ten, 0.1], [F.wasnt, 0.12], [F.jammed, 0.14], [F.outran, 0.12], [F.fifty, 0.12], [F.thousand, 0.1], [F.ten2, 0.14], [F.emus, 0.16]];
  const SHAKE: [number, number][] = [[F.wheat + 2, 8], [F.wasnt + 2, 10], [F.jammed + 2, 14], [F.outran + 2, 10], [F.emus + 2, 14]];
  const SFX: Cue[] = [
    [36, "pop", 0.35], [F.y1932, "boom", 0.4], [F.twenty - 4, "pop", 0.35], [F.twenty, "riser", 0.25], [F.wheat + 2, "impact", 0.4],
    [F.so - 3, "pop", 0.35], [F.did, "pop", 0.3], [F.major - 20, "whoosh", 0.3], [F.major + 8, "pop", 0.3], [F.two, "pop", 0.35], [F.two + 8, "pop", 0.35], [F.ten, "tick", 0.35],
    [F.easy - 3, "pop", 0.35], [F.wasnt + 2, "impact", 0.45], [F.split, "whoosh", 0.3], [F.every, "tick", 0.3], [F.flock - 10, "riser_dark", 0.25], [F.jammed, "impact", 0.5],
    [F.mounted + 4, "pop", 0.3], [F.outran + 2, "impact", 0.4], [F.birds - 3, "pop", 0.35], [F.fifty - 10, "riser", 0.25], [F.fifty + 20, "tick", 0.35],
    [F.weeks, "tick", 0.3], [F.thousand, "pop", 0.35], [F.ten2 - 6, "tick", 0.3], [F.ten2, "boom", 0.4], [F.who - 3, "pop", 0.35], [F.emus + 2, "boom", 0.5], [F.said, "pop", 0.3],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const darkSet = f >= F.weeks - 8 && f < F.who;
  const accent = f < F.major ? RUST : f < F.weeks ? OLIVE : f < F.who ? YEL : RED;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light />
        <Cover f={f} word="EMU WAR" sub="LOST A WAR TO BIRDS?" until={ASK[0][1] - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme={darkSet ? "dark" : "light"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="emuwar" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
