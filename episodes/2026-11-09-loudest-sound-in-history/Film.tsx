import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, Drift, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames = start frame of the word in words.ts
const F = {
  ask: 17, askEnd: 74, aug: 92, y1883: 154, volcano: 196, krakatoa: 224, indonesia: 249, exploded: 270,
  ship: 305, forty: 344, captain: 387, wrote: 397, eardrums: 416, half: 437, shattered: 461,
  fortyQ: 493, fortyQEnd: 521, notEven: 539, crazy: 567, island: 602, mauritius: 620, three: 648, heard: 700, cannon: 767,
  ny: 802, nyEnd: 837, la: 849, laEnd: 877, farther: 895, pressure: 942, barometers: 988, circling: 1041, again: 1084, five: 1118,
  whole: 1154, wholeEnd: 1189, yes: 1207, giant: 1243, killed: 1261, n36: 1286, people: 1316,
  ash: 1337, spread: 1354, sunsets: 1405, blood: 1453, red: 1462, nys: 1486, glowing: 1539, fire: 1572, because: 1611, town: 1642, burning: 1654,
  wait: 1684, waitEnd: 1710, seriously: 1728, one: 1760, explosion: 1767, planet: 1820, heard2: 1829, sub: 1858,
};
const SEA = "#1f6f9f", SEA2 = "#155a85", LAVA = "#ff5a1f", ASH = "#6d6670", BLOOD = "#c8231b", CAN = "#ffb13b";
const ASKER = CAST[29], HOST = CAST[1];
const CAPT: PersonDef = { ...CAST[13], name: "Captain", glasses: "none", face: "beard", hairC: "#6b6b6b", topC: "#1f2f5a", pants: "#1f2f5a", hatC: "#1f2f5a" };
const SAILOR: PersonDef = { ...CAST[43], name: "Sailor", topC: "#f4f4f4", pants: "#2c3550", hat: "beanie", hatC: "#2c3550" };
const ISLANDER: PersonDef = { ...CAST[32], name: "Islander", hat: "none", face: "none", topC: "#e8dcc0", topC2: "#c0392b", prop: "none" };
const FIREMAN: PersonDef = { ...CAST[37], name: "Fireman" };
const TOWNIE: PersonDef = { ...CAST[16], name: "Townswoman", prop: "none", topC: "#5a3a6a" };
const say = (who: string) => (f: number) => talkFor(f, who, SPK, ENV);
const askT = say("asker"), hostT = say("host");

// ---------- shared pieces ----------
const Bubble: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string; tx: number; ty: number; hue?: string; fs?: number }> = ({ f, a, b, x, y, text, tx, ty, hue = YEL, fs = 72 }) => {
  if (f < a - 3 || f > b + 14) return null;
  const s = pop(f, a - 3, 10) * (1 - eio(ramp(f, b + 6, b + 14)));
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * fs * 0.66 + 100;
  const h = lines.length * fs * 1.08 + 64;
  const bx = Math.max(-w / 2 + 60, Math.min(w / 2 - 60, tx - x));
  const wob = Math.sin((f - a) * 0.22) * 1.6;
  const tail = `M${bx - 34} ${h / 2 - 6} L${tx - x} ${ty - y} L${bx + 34} ${h / 2 - 6} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob}) scale(${Math.max(0, s)})`}>
      <g transform="translate(10 12)" opacity={0.3}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="#000000" /><path d={tail} fill="#000000" /></g>
      <path d={tail} fill={hue} stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill={hue} stroke={INKC} strokeWidth={9} />
      <path d={`M${bx - 30} ${h / 2 - 9} L${bx + 30} ${h / 2 - 9}`} stroke={hue} strokeWidth={12} />
      {lines.map((l, i) => <text key={i} y={(i - (lines.length - 1) / 2) * fs * 1.08 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INKC} letterSpacing={1}>{l}</text>)}
    </g>
  );
};
const Who: React.FC<{ d: PersonDef; f: number; x: number; y: number; s: number; seed: number; talk?: number; mood?: "happy" | "neutral" | "surprised"; wave?: number; ears?: boolean }> = ({ d, f, x, y, s, seed, talk = 0, mood = "neutral", wave = 0, ears }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood} />
    {ears && [-1, 1].map((k) => <g key={k} transform={`translate(${k * 62} -372)`}>{[0, 1, 2].map((i) => <path key={i} d={`M${k * (14 + i * 14)} -18 Q${k * (24 + i * 14)} 0 ${k * (14 + i * 14)} 18`} stroke={BLOOD} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f * 0.6 + i)} />)}</g>)}
  </g>
);
/** Volcano island. erupts at `at` (plume, lava bombs, shock ring). */
const Volcano: React.FC<{ f: number; x: number; y: number; s: number; at?: number; smoke?: boolean }> = ({ f, x, y, s, at = 99999, smoke = true }) => {
  const q = f - at;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {q >= 0 && (
        <g>
          <circle cx={0} cy={-240} r={80 + Math.min(q, 30) * 30} fill="#ffd36b" opacity={0.5 * Math.exp(-q / 12)} />
          {[...Array(22)].map((_, i) => {
            const age = q - i * 2.2;
            if (age < 0) return null;
            const up = Math.min(1150, age * (7 + rnd("pv" + i) * 5));
            const px = (rnd("px" + i) - 0.5) * (60 + up * 0.5);
            const r = Math.min(190, 40 + age * 2.4) * (0.7 + rnd("pr" + i) * 0.5);
            return <circle key={i} cx={px} cy={-230 - up} r={r} fill={mix("#3a3236", "#8a8088", rnd("pc" + i))} stroke="#2a2428" strokeWidth={4} />;
          })}
          {[...Array(10)].map((_, i) => {
            const t = (q - 4 - i * 1.5) / 40;
            if (t < 0 || t > 1) return null;
            const vx = (rnd("bx" + i) - 0.5) * 900, vy = -700 - rnd("by" + i) * 400;
            return <circle key={i} cx={vx * t} cy={-240 + vy * t + 1200 * t * t} r={14} fill={LAVA} stroke="#7a1a08" strokeWidth={4} />;
          })}
          {[0, 1].map((i) => { const k = ramp(f, at + i * 8, at + 50 + i * 8); return k > 0 && k < 1 ? <ellipse key={i} cx={0} cy={-120} rx={150 + k * 1400} ry={60 + k * 520} fill="none" stroke="#ffffff" strokeWidth={22 * (1 - k)} opacity={0.9 * (1 - k)} /> : null; })}
        </g>
      )}
      {smoke && q < 0 && [0, 1, 2].map((i) => { const a = ((f * 0.8 + i * 30) % 90) / 90; return <circle key={i} cx={Math.sin(f * 0.03 + i) * 16} cy={-250 - a * 160} r={26 + a * 40} fill="#cfc8cc" opacity={0.8 * (1 - a)} />; })}
      <path d="M-330 0 L-90 -220 Q0 -246 90 -220 L330 0 Z" fill="#6b4a3a" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
      <path d="M-90 -220 L-150 -150 L-60 -170 L-110 -80 L0 -150 L60 -60 L50 -170 L150 -140 L90 -220 Z" fill="#8a6a50" opacity={0.6} />
      {q >= 0 && [[-60, 0.6], [20, 0.9], [70, 0.5]].map(([dx, k], i) => <path key={i} d={`M${dx} -225 Q${dx * 1.5} ${-140} ${dx * 2.2} ${-220 + 220 * Math.min(1, (q / 30) * k)}`} stroke={LAVA} strokeWidth={14} fill="none" strokeLinecap="round" />)}
      <path d="M-380 0 Q-200 -40 0 -20 Q 200 -40 380 0 Z" fill="#2f8f6a" stroke={INKC} strokeWidth={6} />
    </g>
  );
};
const Sea: React.FC<{ f: number; y: number; c?: string; c2?: string }> = ({ f, y, c = SEA, c2 = SEA2 }) => (
  <g>
    <rect x={0} y={y} width={VW} height={VH - y} fill={c} />
    {[...Array(9)].map((_, i) => <path key={i} d={`M${((i * 173 + f * 1.2) % 1240) - 140} ${y + 40 + (i % 4) * 70} q 30 -14 60 0 t 60 0`} stroke="#d8eef8" strokeWidth={5} fill="none" opacity={0.55} />)}
    <rect x={0} y={y + 330} width={VW} height={VH} fill={c2} />
  </g>
);
const Sky: React.FC<{ id: string; top: string; bot: string }> = ({ id, top, bot }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect width={VW} height={VH} fill={`url(#${id})`} />
  </g>
);
/** Cliff lookout where host + asker talk; volcano island on the horizon. red = sunset tint 0..1 */
const Lookout: React.FC<{ f: number; red?: number; erupt?: number; children?: React.ReactNode }> = ({ f, red = 0, erupt, children }) => (
  <g>
    <Sky id={red > 0.5 ? "skyR" : "skyB"} top={mix("#6fb3e0", "#4a0f2a", red)} bot={mix("#d9f0fa", "#ff6a2b", red)} />
    {red > 0 && <circle cx={760} cy={880} r={110} fill="#ffd36b" opacity={red} />}
    <Sea f={f} y={900} c={mix(SEA, "#7a2a3a", red * 0.7)} c2={mix(SEA2, "#4a1a2a", red * 0.7)} />
    <Volcano f={f} x={780} y={905} s={0.32} at={erupt} />
    <path d="M0 1340 Q 260 1290 520 1330 T 1080 1320 V1920 H0 Z" fill="#3f6b3a" stroke={INKC} strokeWidth={6} />
    <path d="M0 1420 Q 300 1390 640 1420 T 1080 1410 V1920 H0 Z" fill="#2b3a26" />
    {/* coin binoculars */}
    <g transform="translate(540 1440)">
      <rect x={-8} y={-160} width={16} height={160} fill="#556070" stroke={INKC} strokeWidth={4} />
      <rect x={-46} y={-216} width={92} height={60} rx={18} fill="#7a8696" stroke={INKC} strokeWidth={5} />
      <circle cx={-22} cy={-186} r={14} fill="#1b1b24" /><circle cx={22} cy={-186} r={14} fill="#1b1b24" />
    </g>
    {children}
  </g>
);
const Ship: React.FC<{ f: number; x: number; y: number; s: number; rock?: number }> = ({ f, x, y, s, rock = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.08) * 6 * rock}) rotate(${Math.sin(f * 0.06) * 1.5 * rock}) scale(${s})`}>
    <line x1={-260} y1={-60} x2={-260} y2={-420} stroke="#5a3a22" strokeWidth={12} />
    <line x1={240} y1={-60} x2={240} y2={-400} stroke="#5a3a22" strokeWidth={12} />
    <path d="M-260 -400 L-120 -220 L-260 -200 Z" fill="#f4ecd8" stroke={INKC} strokeWidth={5} />
    <path d="M240 -380 L360 -220 L240 -200 Z" fill="#f4ecd8" stroke={INKC} strokeWidth={5} />
    <rect x={-40} y={-260} width={70} height={190} fill="#c0392b" stroke={INKC} strokeWidth={6} />
    <rect x={-40} y={-260} width={70} height={30} fill={INKC} />
    {[0, 1, 2].map((i) => { const a = ((f * 0.7 + i * 30) % 90) / 90; return <circle key={i} cx={-5 - a * 120} cy={-280 - a * 120} r={24 + a * 30} fill="#555055" opacity={0.7 * (1 - a)} />; })}
    <rect x={-160} y={-120} width={300} height={60} fill="#f4f1ea" stroke={INKC} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={-120 + i * 70} cy={-90} r={12} fill="#9fd3f0" stroke={INKC} strokeWidth={3} />)}
    <path d="M-440 -60 L440 -60 L370 70 L-380 70 Z" fill="#1b1b24" stroke={INKC} strokeWidth={6} />
    <rect x={-420} y={-60} width={850} height={20} fill="#c0392b" />
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f4f1ea" letterSpacing={6}>NORHAM CASTLE</text>
  </g>
);
const Globe: React.FC<{ f: number; x: number; y: number; r: number; spin?: number; ocean?: string }> = ({ f, x, y, r, spin = 0.6, ocean = "#2f7fc0" }) => {
  const off = (f * spin) % (r * 4);
  const blobs: [number, number, number, number][] = [[-0.6, -0.35, 0.42, 0.3], [-0.45, 0.25, 0.25, 0.42], [0.35, -0.3, 0.5, 0.28], [0.5, 0.35, 0.26, 0.2], [1.3, -0.1, 0.35, 0.5], [1.55, 0.5, 0.2, 0.2]];
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={`gc${r}`}><circle r={r} /></clipPath>
      <circle r={r} fill={ocean} stroke={INKC} strokeWidth={8} />
      <g clipPath={`url(#gc${r})`}>
        {[-1, 0, 1].map((k) => <g key={k} transform={`translate(${k * r * 4 - off + r} 0)`}>
          {blobs.map(([bx, by, rx, ry], i) => <ellipse key={i} cx={bx * r * 2 - r} cy={by * r} rx={rx * r} ry={ry * r} fill="#5cb85c" stroke="#2f6a2f" strokeWidth={4} />)}
        </g>)}
        <circle r={r} fill="url(#globeShade)" />
      </g>
    </g>
  );
};
const Barometer: React.FC<{ x: number; y: number; r: number; a: number; label: string }> = ({ x, y, r, a, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 14} fill="#c9a35a" stroke={INKC} strokeWidth={6} />
    <circle r={r} fill="#fffaf0" stroke={INKC} strokeWidth={4} />
    {[...Array(11)].map((_, i) => <line key={i} x1={0} y1={-r * 0.75} x2={0} y2={-r * 0.9} stroke={INKC} strokeWidth={4} transform={`rotate(${-120 + i * 24})`} />)}
    <line x1={0} y1={0} x2={0} y2={-r * 0.8} stroke={BLOOD} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />
    <circle r={9} fill={INKC} />
    <text y={r + 58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#ffffff" letterSpacing={2}>{label}</text>
  </g>
);

// ---------- shots ----------
const S1_Hook: React.FC<{ f: number }> = ({ f }) => (
  <Lookout f={f}>
    <Who d={ASKER} f={f} x={240} y={1500} s={0.9} seed={29} talk={askT(f)} mood="neutral" />
    <Who d={HOST} f={f} x={850} y={1500} s={0.9} seed={1} talk={hostT(f)} mood="neutral" />
    <Bubble f={f} a={F.ask} b={F.askEnd} x={470} y={920} text={"LOUDEST\nSOUND EVER?"} tx={260} ty={1080} fs={66} />
  </Lookout>
);
const S2_Erupt: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sky id="s2sky" top={f >= F.exploded ? mix("#6fb3e0", "#5a4a50", ramp(f, F.exploded, F.exploded + 40)) : "#6fb3e0"} bot="#e8f4fa" />
    <Sea f={f} y={1230} />
    <Volcano f={f} x={540} y={1240} s={1} at={F.exploded - 2} />
    <g transform={`translate(540 ${lerp(430, 330, eio(ramp(f, F.volcano - 6, F.volcano + 10)))})`} opacity={1 - ramp(f, F.exploded - 6, F.exploded + 4)}>
      <g transform={`scale(${pop(f, F.aug, 12)})`}>
        <rect x={-260} y={-70} width={520} height={140} rx={24} fill="#fffaf0" stroke={INKC} strokeWidth={8} />
        <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill={INKC} letterSpacing={4}>AUG 27</text>
      </g>
      <BigNum f={f} at={F.y1883} text="1883" x={0} y={210} hue={YEL} fs={150} />
    </g>
    {f >= F.krakatoa && <Chip x={540} y={1340} w={400} label="KRAKATOA" hue={LAVA} p={pop(f, F.krakatoa, 10)} fs={48} />}
    {f >= F.indonesia && <Chip x={540} y={1440} w={360} label="INDONESIA" hue="#ffffff" textColor={INKC} p={pop(f, F.indonesia, 10)} fs={40} />}
    {f >= F.exploded && <rect width={VW} height={VH} fill="#fff6d6" opacity={0.8 * Math.exp(-(f - F.exploded) / 8)} />}
  </g>
);
const S3_Ship: React.FC<{ f: number }> = ({ f }) => {
  const d = countUp(f, F.forty - 4, F.forty + 14, 40);
  const logP = pop(f, F.wrote - 4, 12);
  return (
    <g>
      <Sky id="s3sky" top="#5a4a50" bot="#c9b8a8" />
      <Sea f={f} y={1000} c="#2f5f7f" c2="#244a64" />
      <Volcano f={f} x={150} y={1005} s={0.3} at={F.exploded - 40} />
      {/* sound rings rolling across the sea */}
      {[0, 1, 2, 3].map((i) => { const k = ((f - F.ship + i * 22) % 88) / 88; return <ellipse key={i} cx={150} cy={940} rx={60 + k * 1300} ry={30 + k * 520} fill="none" stroke="#ffffff" strokeWidth={10 * (1 - k)} opacity={0.6 * (1 - k)} />; })}
      <Ship f={f} x={700} y={1230} s={0.9} />
      <Who d={CAPT} f={f} x={540} y={1172} s={0.48} seed={13} mood={f >= F.eardrums ? "surprised" : "neutral"} ears={f >= F.eardrums} />
      <Who d={SAILOR} f={f} x={760} y={1172} s={0.44} seed={43} mood="surprised" ears={f >= F.eardrums} />
      <Who d={SAILOR} f={f} x={900} y={1172} s={0.44} seed={44} mood="surprised" ears={f >= F.eardrums} />
      {f >= F.forty - 4 && (
        <g opacity={clamp01(pop(f, F.forty - 4, 10))}>
          <line x1={210} y1={1060} x2={470} y2={1060} stroke={YEL} strokeWidth={8} strokeDasharray="18 10" />
          <path d="M210 1060 l24 -16 v32 Z M470 1060 l-24 -16 v32 Z" fill={YEL} />
          <text x={340} y={1030} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke">{d} MI</text>
        </g>
      )}
      {logP > 0 && (
        <g transform={`translate(540 520) rotate(-2) scale(${logP})`}>
          <rect x={-420} y={-210} width={840} height={420} rx={14} fill="#f3e6c4" stroke="#6b4a2a" strokeWidth={10} />
          <text x={-370} y={-140} fontFamily={FONT} fontWeight={800} fontSize={34} fill={BLOOD} letterSpacing={4}>CAPTAIN'S LOG</text>
          <text x={-370} y={-70} fontFamily="Georgia, serif" fontStyle="italic" fontSize={44} fill="#3a2a1a">"...the ear-drums of over</text>
          <text x={-370} y={-10} fontFamily="Georgia, serif" fontStyle="italic" fontSize={44} fill="#3a2a1a">half my crew have been</text>
          <text x={-370} y={50} fontFamily="Georgia, serif" fontStyle="italic" fontSize={44} fill="#3a2a1a">shattered."</text>
          {f >= F.half && [...Array(8)].map((_, i) => {
            const hit = i < 5 && f >= F.shattered - 2 + i * 2;
            return (
              <g key={i} transform={`translate(${-330 + i * 94} 140) scale(${pop(f, F.half + i * 2, 8)})`}>
                <circle r={30} fill={hit ? "#ff8a8a" : "#ffffff"} stroke={INKC} strokeWidth={5} />
                <circle cx={-10} cy={-4} r={4} fill={INKC} /><circle cx={10} cy={-4} r={4} fill={INKC} />
                {hit && <path d="M-36 -36 L36 36" stroke={BLOOD} strokeWidth={7} strokeLinecap="round" />}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
const S4_Forty: React.FC<{ f: number }> = ({ f }) => (
  <Lookout f={f} erupt={F.exploded - 200}>
    <Who d={ASKER} f={f} x={240} y={1500} s={0.9} seed={29} talk={askT(f)} mood={f < F.notEven ? "surprised" : "neutral"} />
    <Who d={HOST} f={f} x={850} y={1500} s={0.9} seed={1} talk={hostT(f)} mood="happy" />
    <Bubble f={f} a={F.fortyQ} b={F.fortyQEnd} x={470} y={950} text={"40 MILES?!"} tx={260} ty={1080} fs={80} />
    {f >= F.crazy && <Chip x={560} y={860} w={420} label="NOT THE CRAZY PART" hue={LAVA} p={pop(f, F.crazy, 10)} fs={32} />}
  </Lookout>
);
/** Indian Ocean map: Krakatoa → Rodrigues (~3,000 mi). */
const KRK: [number, number] = [805, 835], ROD: [number, number] = [350, 1180];
const S5_Map: React.FC<{ f: number }> = ({ f }) => {
  const k = eout(ramp(f, F.island - 10, F.heard + 10));
  const dist = Math.hypot(ROD[0] - KRK[0], ROD[1] - KRK[1]);
  const miles = countUp(f, F.three - 6, F.three + 24, 3000);
  const inset = pop(f, F.cannon - 8, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1d5f8a" />
      {[...Array(16)].map((_, i) => <line key={i} x1={0} y1={i * 120} x2={VW} y2={i * 120} stroke="#2a7aa8" strokeWidth={2} opacity={0.4} />)}
      <g fill="#e7d9b0" stroke={INKC} strokeWidth={5} strokeLinejoin="round">
        <path d="M0 260 L120 240 L200 300 L230 380 L300 420 L240 520 L200 640 L210 800 L170 960 L120 1120 L60 1260 L0 1300 Z" />
        <path d="M200 960 L250 940 L270 1040 L240 1180 L200 1200 L185 1080 Z" />
        <path d="M330 240 L560 260 L540 380 L480 520 L440 640 L410 560 L360 440 L320 340 Z" />
        <path d="M600 200 L1080 160 L1080 520 L960 600 L880 520 L800 480 L720 420 L660 340 Z" />
        <path d="M640 600 L700 610 L790 740 L800 820 L760 800 L690 700 Z" />
        <path d="M820 860 L1000 860 L1010 890 L830 892 Z" />
        <path d="M760 1120 L900 1060 L1080 1080 L1080 1520 L960 1500 L860 1420 L780 1300 Z" />
      </g>
      <circle cx={290} cy={1210} r={9} fill="#e7d9b0" stroke={INKC} strokeWidth={3} />
      <text x={150} y={1270} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#ffffff">MAURITIUS</text>
      {/* sound ring from Krakatoa */}
      {f >= F.island - 10 && [0, 1, 2].map((i) => <circle key={i} cx={KRK[0]} cy={KRK[1]} r={Math.max(1, dist * k - i * 40)} fill="none" stroke={YEL} strokeWidth={10 - i * 3} opacity={0.9 - i * 0.25} strokeDasharray={i ? "16 12" : undefined} />)}
      <circle cx={KRK[0]} cy={KRK[1]} r={18 + 4 * Math.sin(f * 0.3)} fill={LAVA} stroke={INKC} strokeWidth={5} />
      <g transform={`translate(${KRK[0] - 300} ${KRK[1] - 40})`}><rect x={-10} y={-36} width={270} height={56} rx={12} fill={LAVA} stroke={INKC} strokeWidth={4} /><text x={125} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#ffffff">KRAKATOA</text></g>
      {f >= F.island && (
        <g>
          <circle cx={ROD[0]} cy={ROD[1]} r={14} fill="#ffffff" stroke={INKC} strokeWidth={4} />
          <g transform={`translate(${ROD[0] + 20} ${ROD[1] + 64}) scale(${pop(f, F.island, 10)})`}><rect x={-10} y={-36} width={300} height={56} rx={12} fill="#ffffff" stroke={INKC} strokeWidth={4} /><text x={140} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>RODRIGUES</text></g>
        </g>
      )}
      {f >= F.three - 6 && (
        <g>
          <line x1={KRK[0]} y1={KRK[1]} x2={ROD[0]} y2={ROD[1]} stroke="#ffffff" strokeWidth={6} strokeDasharray="14 10" />
          <g transform={`translate(${(KRK[0] + ROD[0]) / 2 + 40} ${(KRK[1] + ROD[1]) / 2 + 70}) rotate(37) scale(${pop(f, F.three - 6, 12)})`}>
            <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={YEL} stroke={INKC} strokeWidth={9} paintOrder="stroke">{miles.toLocaleString("en-US")} MI</text>
          </g>
        </g>
      )}
      {inset > 0 && (
        <g transform={`translate(330 560) scale(${inset})`}>
          <circle r={230} fill="#f3d9a8" stroke={INKC} strokeWidth={10} />
          <clipPath id="insetC"><circle r={222} /></clipPath>
          <g clipPath="url(#insetC)">
            <rect x={-230} y={60} width={460} height={200} fill="#c9a86a" />
            <path d="M120 60 L130 -120 M130 -120 q-60 -10 -90 30 M130 -120 q60 -20 90 20 M130 -120 q-20 -50 -70 -60 M130 -120 q30 -50 80 -50" stroke="#2f6a2f" strokeWidth={14} fill="none" strokeLinecap="round" />
            <g transform="translate(-40 250) scale(0.62)"><Person d={ISLANDER} f={f} seed={32} talk={0} wave={0} mood="surprised" /></g>
          </g>
          <g transform="translate(150 -170)"><rect x={-150} y={-44} width={300} height={88} rx={20} fill="#ffffff" stroke={INKC} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>CANNONS?</text></g>
        </g>
      )}
    </g>
  );
};
const S6_NY: React.FC<{ f: number }> = ({ f }) => {
  const nyP = pop(f, F.ny + 20, 10), laP = pop(f, F.la + 6, 10);
  const line = eout(ramp(f, F.la + 6, F.la + 26));
  const far = pop(f, F.farther, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#203a5a" />
      <rect x={60} y={300} width={960} height={720} rx={24} fill="#16304d" stroke="#5a7aa0" strokeWidth={6} />
      <path d="M140 420 L320 400 L540 410 L720 420 L820 400 L880 350 L920 370 L900 450 L860 500 L820 580 L780 640 L810 720 L780 730 L720 660 L580 680 L500 760 L440 720 L350 680 L260 650 L190 600 L150 520 Z" fill="#e7d9b0" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={860} cy={450} r={16} fill={BLOOD} stroke={INKC} strokeWidth={4} opacity={nyP > 0 ? 1 : 0} />
      {nyP > 0 && <g transform={`translate(860 400) scale(${nyP})`}><rect x={-120} y={-34} width={240} height={56} rx={12} fill="#ffffff" stroke={INKC} strokeWidth={4} /><text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>NEW YORK</text></g>}
      {laP > 0 && <g><circle cx={175} cy={590} r={16} fill={BLOOD} stroke={INKC} strokeWidth={4} /><g transform={`translate(230 670) scale(${laP})`}><rect x={-140} y={-34} width={280} height={56} rx={12} fill="#ffffff" stroke={INKC} strokeWidth={4} /><text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>LOS ANGELES</text></g></g>}
      {line > 0 && <path d={`M175 590 L${lerp(175, 860, line)} ${lerp(590, 450, line)}`} stroke={YEL} strokeWidth={9} strokeDasharray="18 10" />}
      {f >= F.farther && (
        <g transform={`translate(540 880) scale(${far})`}>
          <rect x={-420} y={-74} width={840} height={148} rx={20} fill="#0f2238" stroke="#5a7aa0" strokeWidth={4} />
          <rect x={-400} y={-56} width={560} height={46} rx={12} fill="#7aa0c8" />
          <text x={-390} y={-22} fontFamily={FONT} fontWeight={800} fontSize={28} fill={INKC}>NY → LA ~2,450 MI</text>
          <rect x={-400} y={8} width={eout(ramp(f, F.farther, F.farther + 20)) * 790} height={46} rx={12} fill={YEL} />
          <text x={-390} y={42} fontFamily={FONT} fontWeight={800} fontSize={28} fill={INKC}>KRAKATOA SOUND ~3,000 MI</text>
        </g>
      )}
      <rect x={0} y={1400} width={VW} height={VH - 1400} fill="#122236" />
      <Who d={ASKER} f={f} x={240} y={1520} s={0.88} seed={29} talk={askT(f)} mood="surprised" />
      <Who d={HOST} f={f} x={850} y={1520} s={0.88} seed={1} talk={hostT(f)} mood="happy" />
      <Bubble f={f} a={F.ny} b={F.laEnd} x={500} y={1000} text={f < F.la ? "NEW YORK..." : "...FROM L.A.?!"} tx={270} ty={1130} fs={70} />
    </g>
  );
};
const S7_Wave: React.FC<{ f: number }> = ({ f }) => {
  const lap = Math.max(0, (f - F.pressure) / 70);
  const ang = lap * Math.PI * 2;
  const day = Math.max(1, Math.min(5, 1 + Math.floor(ramp(f, F.again, F.five + 6) * 4.999)));
  const baro = (i: number) => { const hit = Math.abs(Math.sin(ang - i * 1.2)); return -60 + (f >= F.barometers + i * 6 ? 110 * Math.pow(hit, 6) : 0); };
  return (
    <g>
      <rect width={VW} height={VH} fill="#0b1630" />
      <Drift f={f} n={50} color="#ffffff" seed="stars7" maxR={2} speed={0.05} opacity={0.6} />
      <Globe f={f} x={540} y={760} r={330} spin={0.8} />
      {/* pressure ring sweeping around the globe (drawn as a moving meridian) */}
      {f >= F.pressure - 4 && (
        <g>
          <ellipse cx={540} cy={760} rx={Math.abs(Math.cos(ang)) * 330} ry={330} fill="none" stroke={YEL} strokeWidth={12} opacity={0.9} />
          <ellipse cx={540} cy={760} rx={Math.abs(Math.cos(ang)) * 330 + 14} ry={344} fill="none" stroke={YEL} strokeWidth={4} opacity={0.4} />
        </g>
      )}
      <circle cx={540 + 330 * 0.55} cy={760 + 330 * 0.2} r={14} fill={LAVA} stroke={INKC} strokeWidth={4} />
      {f >= F.pressure && <Chip x={540} y={330} w={420} label="PRESSURE WAVE" hue={YEL} textColor={INKC} p={pop(f, F.pressure, 10)} fs={40} />}
      {f >= F.barometers - 4 && [0, 1, 2].map((i) => <g key={i} opacity={pop(f, F.barometers - 4 + i * 5, 10)}><Barometer x={220 + i * 320} y={1290} r={90} a={baro(i)} label={["LONDON", "PARIS", "BATAVIA"][i]} /></g>)}
      {f >= F.again && (
        <g transform={`translate(540 1530) scale(${pop(f, F.again, 10)})`}>
          <rect x={-250} y={-60} width={500} height={120} rx={24} fill={YEL} stroke={INKC} strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC}>DAY {day} / 5</text>
        </g>
      )}
    </g>
  );
};
const S8_Whole: React.FC<{ f: number }> = ({ f }) => (
  <Lookout f={f} erupt={F.exploded - 400}>
    <Who d={ASKER} f={f} x={240} y={1500} s={0.9} seed={29} talk={askT(f)} mood="surprised" />
    <Who d={HOST} f={f} x={850} y={1500} s={0.9} seed={1} talk={hostT(f)} mood="neutral" />
    <Bubble f={f} a={F.whole} b={F.wholeEnd} x={480} y={920} text={"THE WHOLE\nEARTH?!"} tx={260} ty={1080} fs={72} />
    {f >= F.yes && <Chip x={740} y={960} w={320} label="IN A WAY... YES" hue="#3ddc97" textColor={INKC} p={pop(f, F.yes, 10)} fs={32} />}
  </Lookout>
);
const S9_Tsunami: React.FC<{ f: number }> = ({ f }) => {
  const rise = eio(ramp(f, F.giant - 10, F.people + 10));
  const n = countUp(f, F.n36 - 4, F.n36 + 26, 36000);
  return (
    <g>
      <Sky id="s9sky" top="#3a3a4a" bot="#8a8a96" />
      <path d="M0 1260 L1080 1260 L1080 1920 L0 1920 Z" fill="#c9a86a" />
      {[[180, 1270], [420, 1280], [700, 1270], [930, 1280]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x={-60} y={-90} width={120} height={90} fill="#b08a5a" stroke={INKC} strokeWidth={4} />
          <path d="M-84 -86 L0 -150 L84 -86 Z" fill="#8a6a3a" stroke={INKC} strokeWidth={4} />
        </g>
      ))}
      {[[90, 1270], [560, 1270], [1010, 1270]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(f * 0.15 + i) * 6})`}>
          <path d="M0 0 Q 10 -120 0 -240" stroke="#6b4a2a" strokeWidth={14} fill="none" />
          {[-1, 1].map((s) => <path key={s} d={`M0 -240 q ${s * 60} -30 ${s * 110} 20`} stroke="#2f8f4a" strokeWidth={18} fill="none" strokeLinecap="round" />)}
        </g>
      ))}
      {/* the wave: a curling wall of water rolling in from the left */}
      <g transform={`translate(${lerp(-760, -120, rise)} ${lerp(80, 0, rise)})`}>
        <path d="M-300 1320 L-300 760 Q 160 520 560 600 Q 800 660 790 840 Q 700 760 600 800 Q 560 880 660 960 Q 700 1120 860 1320 Z" fill="#2f6f9f" stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
        <path d="M-200 900 Q 200 680 540 680" stroke="#7fc4e8" strokeWidth={16} fill="none" opacity={0.7} strokeLinecap="round" />
        <path d="M-200 1080 Q 220 880 560 920" stroke="#7fc4e8" strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
        {[...Array(12)].map((_, i) => <circle key={i} cx={560 + Math.cos(i * 0.5) * 230 * (i / 12) + 60} cy={640 + Math.sin(i * 0.9 + f * 0.2) * 16 + i * 6} r={12 + (i % 3) * 7} fill="#ffffff" opacity={0.85} />)}
      </g>
      {f >= F.giant && <Chip x={540} y={400} w={380} label="GIANT WAVES" hue="#5ac8fa" textColor={INKC} p={pop(f, F.giant, 10)} fs={44} />}
      {f >= F.n36 - 4 && (
        <g transform={`translate(540 590) scale(${pop(f, F.n36 - 4, 12)})`}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill="#ffffff" stroke={INKC} strokeWidth={10} paintOrder="stroke">{n.toLocaleString("en-US")}+</text>
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffffff" stroke={INKC} strokeWidth={6} paintOrder="stroke" letterSpacing={6}>LIVES LOST</text>
        </g>
      )}
    </g>
  );
};
const S10_Ash: React.FC<{ f: number }> = ({ f }) => {
  const band = eout(ramp(f, F.spread - 6, F.sunsets));
  const red = eio(ramp(f, F.sunsets - 4, F.red + 10));
  return (
    <g>
      <rect width={VW} height={VH} fill={mix("#0b1630", "#5a0f1a", red)} />
      <rect y={900} width={VW} height={VH - 900} fill={mix("#0b1630", BLOOD, red)} opacity={0.7} />
      <circle cx={540} cy={1500} r={lerp(0, 300, red)} fill="#ffb13b" opacity={0.9 * red} />
      <Globe f={f} x={540} y={760} r={330} spin={0.8} ocean={mix("#2f7fc0", "#5a2a4a", red * 0.6)} />
      <ellipse cx={540} cy={760} rx={360} ry={70} fill="none" stroke={ASH} strokeWidth={50} strokeDasharray={`${band * 1500} 3000`} opacity={0.85} transform="rotate(-12 540 760)" />
      {[...Array(30)].map((_, i) => { const a = rnd("ash" + i) * Math.PI * 2 * band; return <circle key={i} cx={540 + Math.cos(a + f * 0.01) * 360} cy={760 + Math.sin(a + f * 0.01) * 80 - 70 * Math.cos(a) * 0.3} r={6 + rnd("ar" + i) * 10} fill="#8a8088" opacity={0.7 * band} />; })}
      {f >= F.ash && f < F.sunsets && <Chip x={540} y={400} w={360} label="ASH IN THE SKY" hue="#8a8088" p={pop(f, F.ash, 10)} fs={38} />}
      {f >= F.sunsets && <Chip x={540} y={400} w={460} label="SUNSETS WORLDWIDE" hue={CAN} textColor={INKC} p={pop(f, F.sunsets, 10)} fs={38} />}
      {f >= F.blood && <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={BLOOD} stroke="#ffffff" strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.blood, 10)} letterSpacing={6}>BLOOD RED</text>}
    </g>
  );
};
const S11_Fire: React.FC<{ f: number }> = ({ f }) => {
  const run = eio(ramp(f, F.fire - 6, F.because + 30));
  return (
    <g>
      <Sky id="s11sky" top="#4a0f2a" bot="#ff5a1f" />
      <circle cx={760} cy={1080} r={140} fill="#ffd36b" opacity={0.8} />
      {[...Array(6)].map((_, i) => <ellipse key={i} cx={(i * 240 + f * 0.6) % 1300 - 100} cy={420 + (i % 3) * 120} rx={150} ry={30} fill="#ff8a5a" opacity={0.5} />)}
      {/* town silhouette */}
      {[[100, 1260, 180, 260], [300, 1260, 160, 320], [500, 1260, 200, 230], [720, 1260, 170, 300], [930, 1260, 200, 250]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#2a1420" />
          <path d={`M${x - w / 2 - 14} ${y - h} L${x} ${y - h - 70} L${x + w / 2 + 14} ${y - h} Z`} fill="#2a1420" />
          {[0, 1].map((k) => <rect key={k} x={x - w / 4 + k * (w / 2) - 14} y={y - h * 0.6} width={28} height={40} fill="#ffcf6a" opacity={0.8} />)}
        </g>
      ))}
      <rect x={570} y={900} width={20} height={130} fill="#2a1420" /><path d="M560 900 L580 860 L600 900 Z" fill="#2a1420" />
      <rect x={0} y={1260} width={VW} height={VH - 1260} fill="#3a2a2a" />
      {f >= F.nys && <Chip x={540} y={330} w={400} label="NEW YORK, 1883" hue="#ffffff" textColor={INKC} p={pop(f, F.nys, 10)} fs={40} />}
      <Who d={TOWNIE} f={f} x={180} y={1470} s={0.78} seed={16} mood="surprised" />
      {f >= F.glowing && f < F.fire && <Bubble f={f} a={F.glowing} b={F.fire - 8} x={330} y={1000} text={"THE SKY\nIS GLOWING!"} tx={200} ty={1100} hue="#ffffff" fs={52} />}
      {/* fire wagon racing in */}
      <g transform={`translate(${lerp(1400, 640, run)} 1460)`}>
        <rect x={-150} y={-150} width={300} height={110} rx={12} fill="#d6452f" stroke={INKC} strokeWidth={6} />
        <rect x={-110} y={-210} width={120} height={60} rx={8} fill="#c9a35a" stroke={INKC} strokeWidth={5} />
        <circle cx={60} cy={-190} r={22} fill="#ffcc33" stroke={INKC} strokeWidth={5} transform={`rotate(${Math.sin(f * 0.8) * 20} 60 -210)`} />
        {[-95, 95].map((x) => <g key={x} transform={`translate(${x} -30) rotate(${f * 12})`}><circle r={44} fill="#3a2a1a" stroke={INKC} strokeWidth={6} /><path d="M-40 0 H40 M0 -40 V40" stroke="#c9a35a" strokeWidth={6} /></g>)}
        <text y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff" letterSpacing={2}>FIRE DEPT.</text>
      </g>
      {f >= F.fire && <g transform={`translate(${lerp(1500, 860, run)} 1470)`}><Who d={FIREMAN} f={f} x={0} y={0} s={0.72} seed={37} mood="surprised" /></g>}
      {f >= F.town && <Stamp f={f} at={F.town} x={540} y={620} text="NO FIRE!" hue="#ffffff" fs={92} rot={-8} />}
      {f >= F.burning + 20 && <Chip x={540} y={800} w={460} label="JUST THE SUNSET" hue={CAN} textColor={INKC} p={pop(f, F.burning + 20, 10)} fs={40} />}
    </g>
  );
};
const S12_Seriously: React.FC<{ f: number }> = ({ f }) => (
  <Lookout f={f} red={1}>
    <Who d={ASKER} f={f} x={240} y={1500} s={0.9} seed={29} talk={askT(f)} mood="surprised" />
    <Who d={HOST} f={f} x={850} y={1500} s={0.9} seed={1} talk={hostT(f)} mood="happy" />
    <Bubble f={f} a={F.wait} b={F.waitEnd} x={460} y={950} text={"SERIOUSLY?!"} tx={260} ty={1080} fs={80} />
    {f >= F.seriously && <Stamp f={f} at={F.seriously + 2} x={760} y={700} text="TRUE" hue="#3ddc97" fs={90} rot={-10} />}
  </Lookout>
);
const S13_Planet: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#0b1630" />
    <Drift f={f} n={60} color="#ffffff" seed="stars13" maxR={2} speed={0.05} opacity={0.6} />
    {f >= F.explosion && [0, 1, 2, 3].map((i) => { const k = ((f - F.explosion + i * 18) % 72) / 72; return <circle key={i} cx={540} cy={980} r={340 + k * 500} fill="none" stroke={YEL} strokeWidth={14 * (1 - k)} opacity={0.8 * (1 - k)} />; })}
    <Globe f={f} x={540} y={980} r={330} spin={0.6} />
    <g transform="translate(540 700) scale(0.32)"><Volcano f={f} x={0} y={0} s={1} at={F.explosion - 2} smoke={false} /></g>
    {f >= F.one && <BigNum f={f} at={F.one} text="1" x={290} y={420} hue={YEL} fs={200} />}
    {f >= F.explosion && <text x={290} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#ffffff" letterSpacing={6} opacity={pop(f, F.explosion, 10)}>EXPLOSION</text>}
    {f >= F.heard2 && <Chip x={540} y={1460} w={660} label="THE WHOLE PLANET HEARD IT" hue={YEL} textColor={INKC} p={pop(f, F.heard2, 10)} fs={32} />}
  </g>
);
const S14_Outro: React.FC<{ f: number }> = ({ f }) => (
  <Lookout f={f} red={0.6}>
    <Outro f={f} at={F.sub} />
    <Who d={HOST} f={f} x={180} y={1500} s={0.82} seed={1} talk={hostT(f)} wave={1} mood="happy" />
    <Who d={ASKER} f={f} x={900} y={1500} s={0.82} seed={29} talk={0} wave={1} mood="happy" />
  </Lookout>
);

export const KrakatoaFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.aug, render: () => <S1_Hook f={f} />, cam: [[0, { x: 460, y: 1150, z: 1.2 }], [F.askEnd, { x: 520, y: 1100, z: 1.1 }], [F.aug, { x: 640, y: 1000, z: 1.16 }]] },
    { from: F.aug, to: F.ship, tr: "zoom", render: () => <S2_Erupt f={f} />, cam: [[F.aug, { x: 540, y: 560, z: 1.3 }], [F.y1883 + 20, { x: 540, y: 640, z: 1.2 }], [F.volcano + 6, { x: 540, y: 1100, z: 1.25 }], [F.exploded - 4, { x: 540, y: 1100, z: 1.3 }], [F.exploded + 20, { x: 540, y: 900, z: 1.0 }], [F.ship, { x: 540, y: 860, z: 1.04 }]] },
    { from: F.ship, to: F.fortyQ, tr: "whip", render: () => <S3_Ship f={f} />, cam: [[F.ship, { x: 360, y: 1050, z: 1.25 }], [F.forty + 20, { x: 520, y: 1060, z: 1.1 }], [F.wrote - 6, { x: 640, y: 1100, z: 1.2 }], [F.wrote + 10, { x: 540, y: 800, z: 1.05 }], [F.fortyQ, { x: 540, y: 760, z: 1.12 }]] },
    { from: F.fortyQ, to: F.island, tr: "push", render: () => <S4_Forty f={f} />, cam: [[F.fortyQ, { x: 380, y: 1150, z: 1.2 }], [F.notEven, { x: 600, y: 1100, z: 1.12 }], [F.island, { x: 600, y: 1080, z: 1.14 }]] },
    { from: F.island, to: F.ny, tr: "zoom", render: () => <S5_Map f={f} />, cam: [[F.island, { x: 760, y: 860, z: 1.3 }], [F.three, { x: 560, y: 1000, z: 1.0 }], [F.heard + 20, { x: 540, y: 960, z: 1.04 }], [F.cannon, { x: 400, y: 760, z: 1.2 }], [F.ny, { x: 380, y: 720, z: 1.25 }]] },
    { from: F.ny, to: F.pressure, tr: "wipe", render: () => <S6_NY f={f} />, cam: [[F.ny, { x: 760, y: 700, z: 1.3 }], [F.la, { x: 540, y: 800, z: 1.05 }], [F.farther, { x: 540, y: 960, z: 1.0 }], [F.pressure, { x: 540, y: 900, z: 1.08 }]] },
    { from: F.pressure, to: F.whole, tr: "spin", render: () => <S7_Wave f={f} />, cam: [[F.pressure, { x: 540, y: 760, z: 1.2 }], [F.barometers, { x: 540, y: 960, z: 1.0 }], [F.circling, { x: 540, y: 860, z: 1.08 }], [F.again, { x: 540, y: 1100, z: 1.12 }], [F.whole, { x: 540, y: 1000, z: 1.05 }]] },
    { from: F.whole, to: F.giant, tr: "whipUp", render: () => <S8_Whole f={f} />, cam: [[F.whole, { x: 380, y: 1150, z: 1.2 }], [F.yes, { x: 600, y: 1100, z: 1.1 }], [F.giant, { x: 640, y: 1100, z: 1.15 }]] },
    { from: F.giant, to: F.ash, tr: "whip", render: () => <S9_Tsunami f={f} />, cam: [[F.giant, { x: 540, y: 1000, z: 1.2 }], [F.n36, { x: 540, y: 900, z: 1.04 }], [F.ash, { x: 540, y: 860, z: 1.1 }]] },
    { from: F.ash, to: F.nys, tr: "iris", render: () => <S10_Ash f={f} />, cam: [[F.ash, { x: 540, y: 760, z: 1.25 }], [F.sunsets, { x: 540, y: 900, z: 1.05 }], [F.blood, { x: 540, y: 1000, z: 1.12 }], [F.nys, { x: 540, y: 1020, z: 1.15 }]] },
    { from: F.nys, to: F.wait, tr: "push", render: () => <S11_Fire f={f} />, cam: [[F.nys, { x: 540, y: 700, z: 1.2 }], [F.glowing, { x: 360, y: 1100, z: 1.15 }], [F.fire + 10, { x: 600, y: 1150, z: 1.08 }], [F.town, { x: 560, y: 960, z: 1.0 }], [F.wait, { x: 560, y: 900, z: 1.06 }]] },
    { from: F.wait, to: F.one, tr: "flash", render: () => <S12_Seriously f={f} />, cam: [[F.wait, { x: 380, y: 1150, z: 1.22 }], [F.seriously, { x: 620, y: 1080, z: 1.1 }], [F.one, { x: 600, y: 1050, z: 1.14 }]] },
    { from: F.one, to: F.sub, tr: "zoom", render: () => <S13_Planet f={f} />, cam: [[F.one, { x: 480, y: 620, z: 1.25 }], [F.explosion + 10, { x: 540, y: 800, z: 1.1 }], [F.planet, { x: 540, y: 960, z: 1.0 }], [F.sub, { x: 540, y: 1000, z: 1.06 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S14_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.y1883, 0.1], [F.krakatoa, 0.06], [F.exploded, 0.16], [F.forty, 0.1], [F.shattered, 0.1], [F.fortyQ, 0.08], [F.three, 0.12], [F.cannon, 0.08], [F.la, 0.08], [F.barometers, 0.06], [F.five, 0.1], [F.whole, 0.06], [F.n36, 0.12], [F.blood, 0.12], [F.fire, 0.08], [F.town, 0.1], [F.wait, 0.08], [F.explosion, 0.16]];
  const SHAKE: [number, number][] = [[F.exploded, 22], [F.shattered, 8], [F.cannon, 6], [F.giant + 20, 10], [F.explosion, 16]];
  const SFX: Cue[] = [
    [F.ask - 3, "pop", 0.4], [F.aug, "pop", 0.35], [F.y1883, "impact", 0.35], [F.krakatoa, "pop", 0.3], [F.indonesia, "pop", 0.25], [F.exploded - 60, "riser", 0.35], [F.exploded - 2, "boom", 0.7],
    [F.forty - 4, "tick", 0.35], [F.wrote - 4, "pop", 0.35], [F.shattered, "impact", 0.4],
    [F.fortyQ - 3, "pop", 0.4], [F.crazy, "pop", 0.3], [F.three - 6, "tick", 0.35], [F.island, "pop", 0.3], [F.cannon - 8, "boom", 0.35],
    [F.ny - 3, "pop", 0.4], [F.la + 6, "pop", 0.35], [F.farther, "whoosh", 0.3],
    [F.pressure, "pop", 0.3], [F.barometers, "tick", 0.35], [F.again, "tick", 0.3], [F.five, "tick", 0.35],
    [F.whole - 3, "pop", 0.4], [F.yes, "pop", 0.3], [F.giant - 6, "riser_dark", 0.3], [F.n36, "impact", 0.45],
    [F.spread, "whoosh", 0.3], [F.blood, "impact", 0.4], [F.glowing - 3, "pop", 0.3], [F.fire - 6, "whoosh", 0.35], [F.town, "impact", 0.4],
    [F.wait - 3, "pop", 0.4], [F.seriously + 2, "impact", 0.35], [F.explosion - 2, "boom", 0.6], [F.heard2, "pop", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.ship ? YEL : f < F.giant ? CAN : f < F.wait ? "#ff6a5a" : YEL;
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <FontStyle />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="globeShade" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#ffffff" stopOpacity={0.25} /><stop offset="0.6" stopColor="#000000" stopOpacity={0} /><stop offset="1" stopColor="#000000" stopOpacity={0.45} /></radialGradient>
        </defs>
      </svg>
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="LOUDEST" sub="SOUND IN HISTORY?" until={F.aug - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="krakatoa" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
