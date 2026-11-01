import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// ---------- cue helpers (frames come straight from words.ts) ----------
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9']/g, "");
/** start frame of the first word `w` at/after frame `after` */
const at = (w: string, after = 0) => { for (const [a, , t] of WORDS) if (a >= after && norm(t) === norm(w)) return a; throw new Error(`cue not found: ${w}`); };
/** asker lines (consecutive asker phrases merged) */
const ASK: [number, number][] = [];
for (const [a, b, s] of SPK) {
  if (s !== "asker") continue;
  const L = ASK[ASK.length - 1];
  if (L && !SPK.some(([a2, , s2]) => s2 !== "asker" && a2 > L[1] && a2 < a)) L[1] = b; else ASK.push([a, b]);
}

// cue table
const F = (() => {
  const careful = at("Careful.");
  const reading = at("reading", careful), hearing = at("hearing", careful), ends = at("ends.", careful);
  const ha = at("Ha!", careful);
  const first = at("First,", ha), cool = at("cool", first), brain = at("brain.", first), studies = at("studies,", brain), pack = at("pack", studies), less = at("less.", studies);
  const okay = at("Okay,", less), contagious = at("contagious?", okay), social = at("social.", contagious);
  const family = at("family", social), strangers = at("strangers.", family);
  const kids = at("kids", strangers), until = at("until", kids), four = at("four", until);
  const bonding = at("So", four), maybe = at("Maybe.", bonding);
  const chimps = at("Chimpanzees", maybe), dogs = at("dogs", chimps), humans = at("humans.", dogs);
  const wait = at("Wait,", humans), wild = at("Here's", wait), womb = at("womb,", wild), eleven = at("eleven", womb);
  const yawning = at("Okay...", eleven), nowY = at("yawning", yawning), told = at("Told", yawning), sub = at("Subscribe", told);
  return { careful, reading, hearing, ends, ha, first, cool, brain, studies, pack, less, okay, contagious, social, family, strangers, kids, until, four, bonding, maybe, chimps, dogs, humans, wait, wild, womb, eleven, yawning, nowY, told, sub };
})();

const NURSE = CAST[27], DOC = CAST[7];
const nurseTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const docTalk = (f: number) => talkFor(f, "host", SPK, ENV);
/** a yawn: mouth opens wide over `dur` frames starting at `a` (value fed to Person talk) */
const yawn = (f: number, a: number, dur = 40, k = 2.5) => { const t = (f - a) / dur; return t <= 0 || t >= 1 ? 0 : k * Math.pow(Math.sin(t * Math.PI), 0.7); };
const MINT = "#dff4ee", MINT2 = "#bfe5d9", TEAL = "#2bb39a", PINK = "#ff7aa8", BLUE = "#4aa3ff", WARM = "#ff7a4a";

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
const ASKL = ["WHY IS IT\nCATCHING?", "I WON'T!", "BUT WHY\nCONTAGIOUS?", "A BONDING\nTHING?", "WAIT...\nMY DOG?!", "I'M YAWNING\nNOW...", ""];

const Clinic: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill={MINT} />
    {[...Array(9)].map((_, i) => <rect key={i} x={i * 130 - 20} y={0} width={60} height={1330} fill="#ffffff" opacity={0.25} />)}
    {/* window with soft clouds */}
    <rect x={600} y={330} width={380} height={330} rx={20} fill="#bfe6ff" stroke={INKC} strokeWidth={7} />
    {[0, 1].map((i) => <ellipse key={i} cx={((680 + i * 170 + f * 0.6) % 420) + 580} cy={430 + i * 90} rx={70} ry={26} fill="#ffffff" opacity={0.9} />)}
    <path d="M790 330 V660 M600 495 H980" stroke={INKC} strokeWidth={7} />
    {/* wall clock */}
    <g transform="translate(250 480)">
      <circle r={100} fill="#ffffff" stroke={INKC} strokeWidth={8} />
      {[...Array(12)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 6) * 78} y1={-Math.cos(i * Math.PI / 6) * 78} x2={Math.sin(i * Math.PI / 6) * 88} y2={-Math.cos(i * Math.PI / 6) * 88} stroke={INKC} strokeWidth={5} />)}
      <line x1={0} y1={0} x2={Math.sin(f * 0.02) * 56} y2={-Math.cos(f * 0.02) * 56} stroke={INKC} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(f * 0.1) * 76} y2={-Math.cos(f * 0.1) * 76} stroke={WARM} strokeWidth={4} strokeLinecap="round" />
      <circle r={8} fill={INKC} />
    </g>
    {/* cross sign */}
    <g transform="translate(540 230)"><rect x={-60} y={-60} width={120} height={120} rx={24} fill="#ffffff" stroke={INKC} strokeWidth={6} /><path d="M-14 -40 H14 V-14 H40 V14 H14 V40 H-14 V14 H-40 V-14 H-14Z" fill="#ff5a6a" /></g>
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={MINT2} />
    <rect x={0} y={1320} width={VW} height={18} fill="#9fd2c3" />
    {/* bench + plant */}
    <g transform="translate(960 1330)"><rect x={-40} y={-90} width={80} height={90} rx={12} fill="#e8a46a" stroke={INKC} strokeWidth={6} />{[-1, 0, 1].map((s) => <path key={s} d={`M0 -90 Q${s * 50} -170 ${s * 30} -220`} stroke="#2f8f6a" strokeWidth={22} fill="none" strokeLinecap="round" />)}</g>
  </g>
);
/** the two hosts standing in the clinic */
const Duo: React.FC<{ f: number; nurseYawn?: number; docYawn?: number; nurseMood?: "happy" | "neutral" | "surprised"; docMood?: "happy" | "neutral" | "surprised"; wave?: boolean }> = ({ f, nurseYawn = 0, docYawn = 0, nurseMood, docMood, wave }) => {
  const nm = nurseMood ?? (speaking(f, "asker", SPK) ? "surprised" : "happy");
  return (
    <g>
      <g transform="translate(290 1470) scale(0.98)"><Person d={NURSE} f={f} seed={27} talk={Math.max(nurseTalk(f), nurseYawn)} wave={wave || nurseYawn > 0.6 ? 1 : 0} mood={nm} /></g>
      <g transform="translate(800 1470) scale(0.98)"><Person d={DOC} f={f} seed={7} talk={Math.max(docTalk(f), docYawn)} wave={wave ? 1 : 0} mood={docMood ?? "happy"} /></g>
    </g>
  );
};
/** curved dotted "yawn wave" travelling from a to b */
const YawnArc: React.FC<{ f: number; a: number; x1: number; y1: number; x2: number; y2: number; hue?: string; fail?: boolean }> = ({ f, a, x1, y1, x2, y2, hue = TEAL, fail }) => {
  const t = clamp01((f - a) / 18);
  if (t <= 0) return null;
  const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 120;
  const o = 1 - ramp(f, a + 40, a + 55);
  const end = fail ? 0.55 : 1;
  const tt = Math.min(t, end);
  const px = (1 - tt) * (1 - tt) * x1 + 2 * (1 - tt) * tt * mx + tt * tt * x2, py = (1 - tt) * (1 - tt) * y1 + 2 * (1 - tt) * tt * my + tt * tt * y2;
  return (
    <g opacity={o}>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={hue} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" pathLength={100} strokeDashoffset={0} opacity={0.35} />
      <circle cx={px} cy={py} r={20} fill={hue} stroke={INKC} strokeWidth={4} />
      <text x={px} y={py - 32} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={hue} stroke="#fff" strokeWidth={6} paintOrder="stroke">{fail && t >= end ? "✗" : "YAWN"}</text>
    </g>
  );
};

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => {
  const warn = pop(f, F.careful + 2, 12);
  const prog = ramp(f, F.ends - 30, F.ends + 30);
  return (
    <g>
      <Clinic f={f} />
      <Duo f={f} docMood={f >= F.careful ? "neutral" : "happy"} nurseMood={f >= F.ha ? "happy" : undefined} />
      {f >= F.careful && f < F.ha && (
        <g transform={`translate(800 ${830 + Math.sin(f * 0.15) * 6}) scale(${clamp01(warn)})`}>
          <path d="M0 -150 L150 110 H-150 Z" fill={YEL} stroke={INKC} strokeWidth={10} strokeLinejoin="round" />
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={INKC}>!</text>
          <text y={175} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INKC} stroke="#fff" strokeWidth={8} paintOrder="stroke">CONTAGIOUS</text>
        </g>
      )}
      {f >= F.reading && f < F.ha && (
        <g>
          <Chip x={330} y={760} w={300} label="READING" hue={TEAL} p={pop(f, F.reading, 10)} fs={36} />
          <Chip x={330} y={860} w={300} label="HEARING" hue={BLUE} p={pop(f, F.hearing, 10)} fs={36} />
        </g>
      )}
      {f >= F.ends - 30 && f < F.ha + 4 && (
        <g transform="translate(540 1010)" opacity={ramp(f, F.ends - 30, F.ends - 20)}>
          <rect x={-330} y={-26} width={660} height={52} rx={26} fill="#ffffff" stroke={INKC} strokeWidth={5} />
          <rect x={-322} y={-18} width={644 * prog} height={36} rx={18} fill={PINK} />
          <text y={-44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INKC}>VIDEO ENDS IN...</text>
        </g>
      )}
      <Bubble f={f} x={290} y={880} labels={ASKL} tail={0} />
    </g>
  );
};
/** big head profile + brain cooling, then the cold-pack study (camera cranes down) */
const S2_Brain: React.FC<{ f: number }> = ({ f }) => {
  const cool = eio(ramp(f, F.cool, F.brain + 20));
  const brainC = mix("#ff8a7a", "#9fd8ff", cool);
  const yw = yawn(f, F.first + 10, 70, 1);
  const thermo = lerp(0.85, 0.3, cool);
  const studyP = ramp(f, F.studies - 10, F.studies + 10);
  const noPackYawns = countUp(f, F.pack, F.less + 30, 9), packYawns = countUp(f, F.pack, F.less + 30, 3);
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff6e8" />
      <circle cx={540} cy={560} r={430} fill="#ffe2c4" />
      {/* head profile facing right */}
      <g transform="translate(470 600)">
        <path d="M-260 60 Q-300 -260 0 -300 Q260 -300 280 -60 Q290 0 320 40 Q300 60 290 80 Q300 120 270 140 Q280 190 230 200 Q200 260 120 250 L100 420 H-180 Q-150 300 -220 220 Q-250 160 -260 60Z" fill="#f2c39a" stroke={INKC} strokeWidth={9} strokeLinejoin="round" />
        {/* mouth opening (yawn) */}
        <ellipse cx={262} cy={150} rx={18 + yw * 14} ry={8 + yw * 40} fill="#6a1f1f" stroke={INKC} strokeWidth={5} />
        <circle cx={190} cy={-60} r={14} fill={INKC} />
        {/* brain */}
        <g transform="translate(-10 -120)">
          <path d="M-180 20 Q-200 -110 -80 -140 Q0 -190 90 -140 Q200 -120 190 0 Q200 90 90 100 Q0 130 -90 100 Q-200 110 -180 20Z" fill={brainC} stroke={INKC} strokeWidth={7} />
          {[-110, -40, 30, 100].map((x, i) => <path key={i} d={`M${x} -110 q 30 40 0 80 q -30 40 0 90`} stroke={mix(brainC, "#000000", 0.25)} strokeWidth={6} fill="none" strokeLinecap="round" />)}
          {cool < 0.5 && [0, 1, 2].map((i) => <path key={i} d={`M${-60 + i * 60} ${-170 - ((f * 1.5 + i * 20) % 50)} q 10 -16 0 -32`} stroke={WARM} strokeWidth={7} fill="none" opacity={1 - cool * 2} strokeLinecap="round" />)}
        </g>
        {/* cool air flowing in */}
        {f >= F.first + 10 && [0, 1, 2, 3].map((i) => {
          const q = ((f - F.first) * 0.03 + i * 0.25) % 1;
          return <path key={i} d={`M${560 - q * 320} ${150 + Math.sin(q * 6 + i) * 30} q -30 -16 -60 0 t -60 0`} stroke={BLUE} strokeWidth={9} fill="none" strokeLinecap="round" opacity={Math.sin(q * Math.PI)} />;
        })}
      </g>
      {/* thermometer */}
      <g transform="translate(160 380)">
        <rect x={-26} y={0} width={52} height={360} rx={26} fill="#ffffff" stroke={INKC} strokeWidth={7} />
        <rect x={-14} y={20 + 320 * (1 - thermo)} width={28} height={320 * thermo} rx={14} fill={mix(WARM, BLUE, cool)} />
        <circle cy={380} r={46} fill={mix(WARM, BLUE, cool)} stroke={INKC} strokeWidth={7} />
      </g>
      <Chip x={540} y={170} w={560} label="BRAIN COOLER?" hue={BLUE} p={pop(f, F.cool, 12)} fs={48} />
      {/* --- the study (lower half of the set) --- */}
      <rect x={0} y={1080} width={VW} height={VH - 1080} fill="#e9f3ff" />
      <rect x={0} y={1080} width={VW} height={12} fill={INKC} opacity={0.15} />
      <text x={540} y={1160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC} opacity={studyP}>THE COLD-PACK STUDY</text>
      {[{ x: 290, d: CAST[22], s: 22, packed: false }, { x: 790, d: CAST[19], s: 19, packed: true }].map((p, i) => {
        const yy = p.packed ? 0 : Math.max(yawn(f, F.pack + 4, 40), yawn(f, F.pack + 50, 40), yawn(f, F.less + 10, 40));
        return (
          <g key={i} transform={`translate(${p.x} 1720) scale(0.82)`} opacity={studyP}>
            <Person d={p.d} f={f} seed={p.s} talk={yy} wave={yy > 0.6 ? 1 : 0} mood={p.packed ? "happy" : "neutral"} />
            {p.packed && f >= F.pack - 6 && (
              <g transform={`translate(0 ${-412 + (1 - eout(ramp(f, F.pack - 6, F.pack + 6))) * -120})`}>
                <rect x={-58} y={-20} width={116} height={40} rx={14} fill="#7fd0ff" stroke={INKC} strokeWidth={6} />
                <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INKC}>ICE</text>
              </g>
            )}
          </g>
        );
      })}
      {f >= F.pack && (
        <g>
          <Chip x={290} y={1250} w={340} label={`YAWNS: ${noPackYawns}`} hue={WARM} p={pop(f, F.pack, 10)} fs={40} />
          <Chip x={790} y={1250} w={340} label={`YAWNS: ${packYawns}`} hue={BLUE} p={pop(f, F.pack + 6, 10)} fs={40} />
        </g>
      )}
      {f >= F.less && <Stamp f={f} at={F.less + 2} x={540} y={1560} text="LESS" hue={BLUE} fs={60} rot={-8} />}
    </g>
  );
};
const S3_WhyContagious: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Clinic f={f} />
    <Duo f={f} />
    {f >= F.social && <Stamp f={f} at={F.social + 2} x={800} y={880} text="SOCIAL" hue={TEAL} fs={84} rot={-6} />}
    <Bubble f={f} x={290} y={880} labels={ASKL} />
  </g>
);
const Silhouette: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.75}>
    <circle cy={-380} r={56} fill="#9aa3b5" stroke={INKC} strokeWidth={5} />
    <path d="M-60 -300 Q0 -320 60 -300 L50 -150 H-50Z" fill="#9aa3b5" stroke={INKC} strokeWidth={5} />
    <path d="M-25 -150 L-28 -10 M25 -150 L28 -10" stroke="#7a8395" strokeWidth={30} strokeLinecap="round" />
    <path d="M-56 -290 L-80 -170 M56 -290 L80 -170" stroke="#7a8395" strokeWidth={20} strokeLinecap="round" />
  </g>
);
const Meter: React.FC<{ x: number; y: number; label: string; v: number; hue: string; p: number }> = ({ x, y, label, v, hue, p }) => (
  <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * p})`} opacity={p}>
    <rect x={-300} y={-40} width={600} height={80} rx={40} fill="#ffffff" stroke={INKC} strokeWidth={5} />
    <text x={-270} y={12} fontFamily={FONT} fontWeight={800} fontSize={32} fill={INKC}>{label}</text>
    <rect x={-20} y={-20} width={290} height={40} rx={20} fill="#e6e8ee" />
    <rect x={-20} y={-20} width={290 * v} height={40} rx={20} fill={hue} />
  </g>
);
const S4_Family: React.FC<{ f: number }> = ({ f }) => {
  const a = F.family;
  const fam = [{ d: CAST[10], s: 10, x: 200 }, { d: CAST[44], s: 44, x: 540 }, { d: CAST[9], s: 9, x: 880 }];
  const famMeter = eout(ramp(f, a + 30, a + 70)), strMeter = eout(ramp(f, F.strangers, F.strangers + 30)) * 0.22;
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff1f4" />
      <rect x={0} y={960} width={VW} height={VH - 960} fill="#eef0f5" />
      <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={PINK} stroke={INKC} strokeWidth={4} paintOrder="stroke">FAMILY &amp; FRIENDS</text>
      {[...Array(6)].map((_, i) => <path key={i} transform={`translate(${100 + i * 180} ${400 - ((f * 1.2 + i * 40) % 120)}) scale(1.4)`} d="M0 6 C-14 -8 -8 -20 0 -12 C8 -20 14 -8 0 6Z" fill={PINK} opacity={0.5} />)}
      {fam.map((p, i) => (
        <g key={i} transform={`translate(${p.x} 900) scale(0.66)`}>
          <Person d={p.d} f={f} seed={p.s} talk={yawn(f, a + i * 16, 42, 2.4)} wave={yawn(f, a + i * 16, 42) > 0.8 ? 1 : 0} mood="happy" />
        </g>
      ))}
      <YawnArc f={f} a={a + 4} x1={230} y1={620} x2={520} y2={620} hue={PINK} />
      <YawnArc f={f} a={a + 20} x1={560} y1={620} x2={850} y2={620} hue={PINK} />
      <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#6a7385" opacity={ramp(f, F.strangers - 30, F.strangers - 15)}>STRANGERS</text>
      {[200, 540, 880].map((x, i) => <Silhouette key={i} x={x} y={1500} s={0.66} />)}
      {f >= F.strangers - 10 && <YawnArc f={f} a={F.strangers - 10} x1={230} y1={1220} x2={520} y2={1220} hue="#8a93a5" fail />}
      <Meter x={540} y={440} label="CATCH RATE" v={famMeter} hue={PINK} p={famMeter > 0 ? 1 : 0} />
      {f >= F.strangers && <Meter x={540} y={1150} label="CATCH RATE" v={Math.max(0.12, strMeter)} hue="#8a93a5" p={clamp01(pop(f, F.strangers, 10))} />}
    </g>
  );
};
const Cake: React.FC<{ x: number; y: number; n: number; f: number }> = ({ x, y, n, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-80} width={240} height={80} rx={14} fill="#ffb0c8" stroke={INKC} strokeWidth={6} />
    <path d="M-120 -60 q 20 22 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="#fff" stroke={INKC} strokeWidth={5} />
    {[...Array(n)].map((_, i) => {
      const cx = -((n - 1) * 34) / 2 + i * 34;
      return <g key={i}><rect x={cx - 7} y={-130} width={14} height={50} rx={4} fill={[BLUE, YEL, TEAL, PINK, WARM][i % 5]} stroke={INKC} strokeWidth={3} /><path d={`M${cx} -152 q 9 12 0 20 q -9 -8 0 -20`} fill="#ffb13b" transform={`rotate(${Math.sin(f * 0.4 + i) * 8} ${cx} -132)`} /></g>;
    })}
  </g>
);
const S5_Kids: React.FC<{ f: number }> = ({ f }) => {
  const age = Math.min(5, 1 + Math.floor(ramp(f, F.kids + 10, F.four) * 4.01));
  const kidYawn = yawn(f, F.four + 4, 46, 2.4);
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff7d6" />
      {[...Array(10)].map((_, i) => <circle key={i} cx={rnd("cf" + i) * VW} cy={200 + rnd("cy" + i) * 700} r={10 + rnd("cr" + i) * 14} fill={[PINK, BLUE, TEAL, YEL][i % 4]} opacity={0.4} />)}
      <rect x={0} y={1360} width={VW} height={VH - 1360} fill="#ffe8a8" />
      <g transform="translate(300 1460) scale(0.95)"><Person d={DOC} f={f} seed={7} talk={Math.max(docTalk(f), yawn(f, F.kids, 44, 2.4))} wave={0} mood="happy" /></g>
      <g transform="translate(760 1460) scale(1.0)"><Person d={CAST[12]} f={f} seed={12} talk={kidYawn} wave={kidYawn > 0.8 ? 1 : 0} mood={f < F.four ? "neutral" : "happy"} /></g>
      {f < F.four && f >= F.kids + 10 && <text x={820} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={WARM} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.kids + 10, 10)}>?</text>}
      <Cake x={540} y={720} n={age} f={f} />
      <text x={540} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INKC} opacity={pop(f, F.kids + 10, 10)}>AGE {age}</text>
      {f < F.four && f >= F.kids + 20 && <Chip x={760} y={850} w={340} label="NO CATCH" hue="#8a93a5" p={pop(f, F.kids + 20, 10)} fs={36} />}
      <BigNum f={f} at={F.four} text="4–5" x={540} y={380} hue={YEL} fs={200} />
    </g>
  );
};
const S6_Bond: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Clinic f={f} />
    <Duo f={f} />
    {f >= F.bonding + 10 && [...Array(7)].map((_, i) => {
      const q = ((f - F.bonding) * 0.012 + i / 7) % 1;
      return <path key={i} transform={`translate(${380 + Math.sin(i * 2 + f * 0.05) * 160 + i * 40} ${1100 - q * 500}) scale(${2 + i % 3})`} d="M0 6 C-14 -8 -8 -20 0 -12 C8 -20 14 -8 0 6Z" fill={PINK} opacity={Math.sin(q * Math.PI) * 0.8} />;
    })}
    {f >= F.maybe && <Chip x={800} y={900} w={300} label="MAYBE..." hue={TEAL} p={pop(f, F.maybe, 10)} fs={44} />}
    <Bubble f={f} x={290} y={880} labels={ASKL} />
  </g>
);
const Chimp: React.FC<{ f: number; x: number; y: number; s: number; yw: number; flip?: boolean }> = ({ f, x, y, s, yw, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={60} rx={90} ry={110} fill="#5a3a26" stroke={INKC} strokeWidth={7} />
    <path d={`M-80 20 Q-150 ${120 + Math.sin(f * 0.1) * 10} -90 170`} stroke="#5a3a26" strokeWidth={36} fill="none" strokeLinecap="round" />
    <path d="M80 20 Q150 120 90 170" stroke="#5a3a26" strokeWidth={36} fill="none" strokeLinecap="round" />
    <circle cx={-92} cy={-80} r={30} fill="#5a3a26" stroke={INKC} strokeWidth={6} /><circle cx={-92} cy={-80} r={15} fill="#d9a67a" />
    <circle cx={92} cy={-80} r={30} fill="#5a3a26" stroke={INKC} strokeWidth={6} /><circle cx={92} cy={-80} r={15} fill="#d9a67a" />
    <circle cx={0} cy={-80} r={92} fill="#5a3a26" stroke={INKC} strokeWidth={7} />
    <path d="M-62 -100 Q-30 -140 0 -110 Q30 -140 62 -100 Q80 -30 40 0 Q0 20 -40 0 Q-80 -30 -62 -100Z" fill="#d9a67a" stroke={INKC} strokeWidth={5} />
    {yw > 0.5 ? <g><path d="M-36 -98 q 12 6 24 0 M12 -98 q 12 6 24 0" stroke={INKC} strokeWidth={6} fill="none" strokeLinecap="round" /></g>
      : <g><circle cx={-24} cy={-98} r={9} fill={INKC} /><circle cx={24} cy={-98} r={9} fill={INKC} /></g>}
    <ellipse cx={0} cy={-38 + yw * 8} rx={22 + yw * 10} ry={6 + yw * 26} fill="#6a1f1f" stroke={INKC} strokeWidth={5} />
    {yw > 0.4 && <path d={`M${-18 - yw * 6} ${-38 - yw * 14} h${36 + yw * 12}`} stroke="#fff" strokeWidth={6} />}
  </g>
);
const Dog: React.FC<{ f: number; x: number; y: number; s: number; yw: number }> = ({ f, x, y, s, yw }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M120 -110 Q${170 + Math.sin(f * 0.5) * 20} -170 ${150 + Math.sin(f * 0.5) * 30} -200`} stroke="#d9a35a" strokeWidth={20} fill="none" strokeLinecap="round" />
    <ellipse cx={30} cy={-100} rx={120} ry={62} fill="#e3b46c" stroke={INKC} strokeWidth={7} />
    {[-50, 0, 70, 110].map((lx, i) => <rect key={i} x={lx - 12} y={-60} width={24} height={60} rx={10} fill="#e3b46c" stroke={INKC} strokeWidth={5} />)}
    <g transform="translate(-90 -170)">
      <circle r={62} fill="#e3b46c" stroke={INKC} strokeWidth={7} />
      <path d="M-40 -40 Q-90 -30 -70 40 Q-50 20 -34 -6Z" fill="#a8743a" stroke={INKC} strokeWidth={5} />
      <ellipse cx={-48} cy={30} rx={42} ry={30} fill="#f3d6a6" stroke={INKC} strokeWidth={5} />
      <ellipse cx={-80} cy={18} rx={12} ry={9} fill={INKC} />
      {yw > 0.5 ? <path d="M-10 -14 q 10 6 20 0" stroke={INKC} strokeWidth={6} fill="none" /> : <circle cx={0} cy={-12} r={9} fill={INKC} />}
      <ellipse cx={-50} cy={56 + yw * 8} rx={18 + yw * 6} ry={4 + yw * 22} fill="#6a1f1f" stroke={INKC} strokeWidth={4} />
      {yw > 0.5 && <path d={`M-58 ${60 + yw * 10} q 8 12 16 0`} fill="#ff7a8a" stroke={INKC} strokeWidth={3} />}
    </g>
  </g>
);
const S7_Animals: React.FC<{ f: number }> = ({ f }) => {
  const c1 = yawn(f, F.chimps + 6, 44, 1), c2 = yawn(f, F.chimps + 30, 44, 1);
  const nurseY = yawn(f, F.dogs + 4, 44, 2.4), dogY = yawn(f, F.humans - 6, 46, 1);
  return (
    <g>
      <rect width={VW} height={VH} fill="#cfeec0" />
      <rect width={VW} height={900} fill="#bfe6ff" />
      {[...Array(5)].map((_, i) => <circle key={i} cx={i * 260 - 40} cy={900} r={180} fill="#5cae5a" stroke={INKC} strokeWidth={6} />)}
      {/* jungle branch */}
      <path d="M0 640 Q540 560 1080 650" stroke="#7a4a26" strokeWidth={40} fill="none" strokeLinecap="round" />
      {[...Array(6)].map((_, i) => <ellipse key={i} cx={80 + i * 190} cy={600 - (i % 2) * 30} rx={70} ry={30} fill="#3f9a4a" stroke={INKC} strokeWidth={5} transform={`rotate(${i * 20 - 50} ${80 + i * 190} ${600})`} />)}
      <Chimp f={f} x={330} y={480} s={0.9} yw={c1} />
      <Chimp f={f} x={750} y={480} s={0.9} yw={c2} flip />
      <YawnArc f={f} a={F.chimps + 20} x1={380} y1={350} x2={700} y2={350} hue={WARM} />
      <Chip x={540} y={180} w={480} label="CHIMPS CATCH IT" hue={WARM} p={pop(f, F.chimps + 6, 10)} fs={38} />
      {/* ground: nurse + her dog */}
      <rect x={0} y={1380} width={VW} height={VH - 1380} fill="#9fd48a" />
      <g transform="translate(330 1470) scale(0.95)"><Person d={NURSE} f={f} seed={27} talk={Math.max(nurseTalk(f), nurseY)} wave={nurseY > 0.8 ? 1 : 0} mood={f >= F.wait ? "surprised" : "happy"} /></g>
      <Dog f={f} x={820} y={1470} s={1.05} yw={dogY} />
      {f >= F.dogs && <YawnArc f={f} a={F.humans - 22} x1={380} y1={1050} x2={700} y2={1230} hue={TEAL} />}
      {f >= F.dogs && <Chip x={760} y={1020} w={420} label="DOGS CATCH IT" hue={TEAL} p={pop(f, F.dogs + 4, 10)} fs={38} />}
      <Bubble f={f} x={330} y={880} labels={ASKL} />
    </g>
  );
};
const S8_Womb: React.FC<{ f: number }> = ({ f }) => {
  const yw = yawn(f, F.womb - 4, 60, 1);
  const p = ramp(f, F.wild, F.wild + 20);
  return (
    <g>
      <rect width={VW} height={VH} fill="#141826" />
      <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.wild + 4, 10)}>THE WILDEST ONE</text>
      {/* ultrasound monitor */}
      <rect x={90} y={420} width={900} height={940} rx={40} fill="#2a2f42" stroke="#5a6a90" strokeWidth={10} />
      <path d="M540 470 L940 1260 Q540 1340 140 1260 Z" fill="#0b0d12" />
      <g opacity={p}>
        <ellipse cx={540} cy={930} rx={280} ry={240} fill="#20242c" stroke="#7d8696" strokeWidth={6} opacity={0.9} />
        {/* baby, simple and soft */}
        <g transform={`translate(540 930) rotate(${Math.sin(f * 0.04) * 3})`}>
          <path d="M-40 10 Q-150 40 -120 150 Q-60 200 40 170 Q120 140 100 60" fill="#c9cfd8" stroke="#eef1f6" strokeWidth={5} />
          <circle cx={30} cy={-40} r={92} fill="#d9dee6" stroke="#eef1f6" strokeWidth={5} />
          <path d="M-14 -50 q 14 8 28 0 M44 -50 q 14 8 28 0" stroke="#3a4050" strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={34} cy={4 + yw * 6} rx={10 + yw * 10} ry={4 + yw * 20} fill="#3a4050" />
          <path d="M-60 90 q 20 -30 50 -10" stroke="#eef1f6" strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
        {[...Array(40)].map((_, i) => <circle key={i} cx={160 + rnd("us" + i) * 760} cy={500 + rnd("uy" + i) * 760} r={2 + rnd("ur" + i) * 3} fill="#fff" opacity={0.08 + 0.1 * Math.sin(f * 0.3 + i)} />)}
      </g>
      {f >= F.womb && yw > 0.2 && <text x={760} y={760} fontFamily={FONT} fontWeight={800} fontSize={56} fill={YEL} opacity={clamp01(yw * 2)}>YAWN!</text>}
      <text x={170} y={500} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#7d8696">SCAN</text>
      <BigNum f={f} at={F.eleven} text="11 WEEKS" x={540} y={1530} hue={YEL} fs={140} />
    </g>
  );
};
const S9_Yawning: React.FC<{ f: number }> = ({ f }) => {
  const ny = yawn(f, F.nowY, 46, 2.5);
  return (
    <g>
      <Clinic f={f} />
      <Duo f={f} nurseYawn={ny} nurseMood={ny > 0 ? "surprised" : "happy"} docMood="happy" />
      {f >= F.told && <Stamp f={f} at={F.told + 2} x={760} y={860} text="TOLD YOU" hue={TEAL} fs={78} rot={-8} />}
      <Bubble f={f} x={290} y={880} labels={ASKL} />
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Clinic f={f} />
    <rect width={VW} height={VH} fill="#ffffff" opacity={0.35} />
    <Outro f={f} at={F.sub} light />
    <g transform="translate(140 1570) scale(0.72)"><Person d={NURSE} f={f} seed={27} talk={yawn(f, F.sub + 50, 40, 2)} wave={1} mood="happy" /></g>
    <g transform="translate(940 1570) scale(0.72)"><Person d={DOC} f={f} seed={7} talk={docTalk(f)} wave={1} mood="happy" /></g>
  </g>
);

export const YawnFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.careful, render: () => <S1_Ask f={f} />, cam: [[0, { x: 540, y: 1000, z: 1.05 }], [40, { x: 420, y: 1060, z: 1.16 }], [F.careful, { x: 380, y: 1080, z: 1.24 }]] },
    { from: F.careful, to: F.first, tr: "zoom", render: () => <S1_Ask f={f} />, cam: [[F.careful, { x: 720, y: 980, z: 1.3 }], [F.reading + 10, { x: 620, y: 960, z: 1.15 }], [F.ends, { x: 600, y: 1000, z: 1.1, r: 1 }], [F.ha, { x: 480, y: 1030, z: 1.12 }], [F.first, { x: 440, y: 1040, z: 1.18 }]] },
    { from: F.first, to: F.okay, tr: "whip", render: () => <S2_Brain f={f} />, cam: [[F.first, { x: 540, y: 600, z: 1.45 }], [F.brain, { x: 500, y: 640, z: 1.32 }], [F.studies - 6, { x: 500, y: 660, z: 1.3 }], [F.studies + 14, { x: 540, y: 1420, z: 1.12 }], [F.okay, { x: 540, y: 1440, z: 1.18 }]] },
    { from: F.okay, to: F.family, tr: "iris", render: () => <S3_WhyContagious f={f} />, cam: [[F.okay, { x: 380, y: 1060, z: 1.2 }], [F.social, { x: 600, y: 1020, z: 1.1 }], [F.family, { x: 640, y: 1040, z: 1.16 }]] },
    { from: F.family, to: F.kids, tr: "zoom", render: () => <S4_Family f={f} />, cam: [[F.family, { x: 540, y: 640, z: 1.25 }], [F.strangers - 30, { x: 540, y: 760, z: 1.05 }], [F.kids, { x: 540, y: 1100, z: 1.15 }]] },
    { from: F.kids, to: F.bonding, tr: "push", render: () => <S5_Kids f={f} />, cam: [[F.kids, { x: 700, y: 1100, z: 1.25 }], [F.four - 10, { x: 560, y: 900, z: 1.05 }], [F.bonding, { x: 640, y: 1000, z: 1.15 }]] },
    { from: F.bonding, to: F.chimps, tr: "spin", render: () => <S6_Bond f={f} />, cam: [[F.bonding, { x: 420, y: 1040, z: 1.18 }], [F.chimps, { x: 560, y: 1000, z: 1.08 }]] },
    { from: F.chimps, to: F.wild, tr: "whipUp", render: () => <S7_Animals f={f} />, cam: [[F.chimps, { x: 540, y: 500, z: 1.35 }], [F.dogs - 10, { x: 540, y: 560, z: 1.2 }], [F.dogs + 14, { x: 560, y: 1150, z: 1.15 }], [F.wild, { x: 520, y: 1100, z: 1.22 }]] },
    { from: F.wild, to: F.yawning, tr: "flash", render: () => <S8_Womb f={f} />, cam: [[F.wild, { x: 540, y: 880, z: 1.2 }], [F.womb, { x: 540, y: 920, z: 1.08 }], [F.eleven + 6, { x: 540, y: 1000, z: 1.05 }], [F.yawning, { x: 540, y: 1010, z: 1.1 }]] },
    { from: F.yawning, to: F.sub, tr: "wipe", render: () => <S9_Yawning f={f} />, cam: [[F.yawning, { x: 380, y: 1080, z: 1.25 }], [F.nowY + 30, { x: 360, y: 1060, z: 1.3 }], [F.told, { x: 600, y: 1020, z: 1.1 }], [F.sub, { x: 640, y: 1020, z: 1.14 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.careful, 0.08], [F.ends, 0.06], [F.cool, 0.08], [F.less, 0.1], [F.social, 0.1], [F.strangers, 0.08], [F.four, 0.14], [F.wait, 0.1], [F.eleven, 0.14], [F.nowY, 0.12], [F.told, 0.12]];
  const SHAKE: [number, number][] = [[F.less + 2, 8], [F.four + 2, 10], [F.eleven + 2, 12], [F.told + 2, 10]];
  const SFX: Cue[] = [
    [ASK[0][0] - 3, "pop", 0.35], [F.careful + 2, "impact", 0.4], [F.reading, "pop", 0.3], [F.hearing, "pop", 0.3], [F.ends - 30, "riser", 0.25], [F.ha - 3, "pop", 0.35],
    [F.cool, "pop", 0.35], [F.studies - 8, "whoosh", 0.3], [F.pack - 6, "pop", 0.35], [F.pack, "tick", 0.3], [F.less + 2, "impact", 0.45],
    [F.okay - 3, "pop", 0.35], [F.social + 2, "impact", 0.4], [F.family + 4, "pop", 0.3], [F.family + 20, "pop", 0.3], [F.strangers, "tick", 0.3],
    [F.kids + 10, "tick", 0.3], [F.kids + 30, "tick", 0.3], [F.four, "boom", 0.4], [F.bonding - 3, "pop", 0.35], [F.maybe, "pop", 0.3],
    [F.chimps + 6, "pop", 0.3], [F.dogs + 4, "pop", 0.3], [F.wait - 3, "pop", 0.4], [F.womb - 20, "riser_dark", 0.25], [F.eleven, "boom", 0.45],
    [F.yawning - 3, "pop", 0.35], [F.told + 2, "impact", 0.45], [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const darkSet = f >= F.wild && f < F.yawning;
  const accent = f < F.okay ? TEAL : f < F.chimps ? PINK : f < F.yawning ? YEL : TEAL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light={!darkSet} />
        <Cover f={f} word="YAWN" sub="WHY IS IT CONTAGIOUS?" until={ASK[0][1] - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme={darkSet ? "dark" : "light"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="yawn" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
