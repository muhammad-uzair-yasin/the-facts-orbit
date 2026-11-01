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
  const y1964 = at("1964,"), seventeen = at("seventeen-year-old", y1964), randy = at("Randy", y1964), stayed = at("stayed", randy), eleven = at("eleven", stayed);
  const elevenQ = at("Eleven", eleven + 10), day2 = at("day", elevenQ), focus = at("focus", day2), day4 = at("day", focus), seeing = at("seeing", day4);
  const thought = at("He", seeing + 10), sign = at("sign", thought), person = at("person.", sign);
  const terrifying = at("That's", person), day11 = at("day", terrifying), math = at("math.", day11), forget = at("forget", math), middle = at("middle", forget);
  const allnight = at("But", middle), fine = at("fine.", allnight), areyou = at("Are", fine);
  const eighteen = at("eighteen", areyou), drinking = at("drinking.", eighteen);
  const micro = at("microsleeps...", drinking), tiny = at("tiny", micro), few = at("few", tiny), noticing = at("noticing.", few);
  const recover = at("So", noticing), slept = at("slept", recover), fourteen = at("fourteen", slept), okay = at("okay.", fourteen);
  const record = at("record", okay), accepting = at("accepting", record), dangerous = at("dangerous.", accepting), sub = at("Subscribe", dangerous);
  return { y1964, seventeen, randy, stayed, eleven, elevenQ, day2, focus, day4, seeing, thought, sign, person, terrifying, day11, math, forget, middle, allnight, fine, areyou, eighteen, drinking, micro, tiny, few, noticing, recover, slept, fourteen, okay, record, accepting, dangerous, sub };
})();

const CODER = CAST[24], SCI = CAST[0], RANDY = { ...CAST[29], prop: "coffee" as const };
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const NAVY = "#0f1630", NAVY2 = "#1b2550", MOON = "#f4ecd0", CYAN = "#5ad1ff", PURP = "#9b7bff", RED = "#ff4d5e", GREEN = "#3ddc97", AMBER = "#ffb13b";

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

const ASKL = ["NEVER\nSLEEP?!", "11 DAYS?!", "TERRIFYING!", "ALL-NIGHTERS?\nI'M FINE!", "HOW DID HE\nRECOVER?"];

const NightLab: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill={NAVY} />
    {[...Array(8)].map((_, i) => <rect key={i} x={i * 140} y={0} width={70} height={1330} fill="#ffffff" opacity={0.025} />)}
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill={NAVY2} />
    <rect x={0} y={1322} width={VW} height={14} fill="#2c3870" />
    {/* desk lamp glow */}
    <ellipse cx={540} cy={1340} rx={520} ry={60} fill={AMBER} opacity={0.08} />
    {/* digital wall clock */}
    <g transform="translate(870 200)">
      <rect x={-130} y={-50} width={260} height={100} rx={18} fill="#090c1a" stroke="#3a4680" strokeWidth={5} />
      <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={RED} letterSpacing={4} opacity={Math.floor(f / 15) % 2 ? 1 : 0.85}>3:47</text>
    </g>
    <g transform="translate(150 200)"><circle r={60} fill={MOON} /><circle cx={24} cy={-14} r={54} fill={NAVY} /></g>
  </g>
);
/** wall projection screen */
const Screen: React.FC<{ on: number; children?: React.ReactNode }> = ({ on, children }) => (
  <g>
    <rect x={170} y={300} width={740} height={540} rx={20} fill="#0a0e1f" stroke="#4a5a9a" strokeWidth={8} />
    <g opacity={on}>
      <clipPath id="scr"><rect x={180} y={310} width={720} height={520} rx={14} /></clipPath>
      <g clipPath="url(#scr)">{children}</g>
    </g>
  </g>
);
const Duo: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; hostMood?: "happy" | "neutral" | "surprised"; wave?: boolean }> = ({ f, askMood, hostMood, wave }) => (
  <g>
    <g transform="translate(290 1480) scale(0.98)"><Person d={CODER} f={f} seed={24} talk={askTalk(f)} wave={wave ? 1 : 0} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "neutral")} /></g>
    <g transform="translate(800 1480) scale(0.98)"><Person d={SCI} f={f} seed={0} talk={hostTalk(f)} wave={wave ? 1 : 0} mood={hostMood ?? "neutral"} /></g>
  </g>
);
const DayBadge: React.FC<{ f: number; at: number; day: number; x: number; y: number; out?: number }> = ({ f, at, day, x, y, out = 1e9 }) => {
  const p = clamp01(pop(f, at, 10)) * (1 - ramp(f, out, out + 6));
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p}) rotate(-4)`}>
      <rect x={-150} y={-70} width={300} height={140} rx={24} fill={RED} stroke={INKC} strokeWidth={7} />
      <text y={-18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff" letterSpacing={4}>DAY</text>
      <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#fff">{day}</text>
    </g>
  );
};
const Zs: React.FC<{ f: number; x: number; y: number; o?: number }> = ({ f, x, y, o = 1 }) => (
  <g opacity={o}>{[0, 1, 2].map((i) => { const q = ((f * 0.02 + i / 3) % 1); return <text key={i} x={x + q * 80} y={y - q * 160} fontFamily={FONT} fontWeight={800} fontSize={40 + q * 40} fill={CYAN} opacity={Math.sin(q * Math.PI)}>Z</text>; })}</g>
);

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightLab f={f} />
    <Screen on={0} />
    <Duo f={f} />
    <Bubble f={f} x={290} y={900} labels={ASKL} />
  </g>
);
const S2_Randy: React.FC<{ f: number }> = ({ f }) => {
  const day = Math.max(1, Math.min(11, 1 + Math.floor(ramp(f, F.stayed, F.eleven) * 10.99)));
  return (
    <g>
      <rect width={VW} height={VH} fill="#3b2a4a" />
      {[...Array(12)].map((_, i) => [...Array(16)].map((__, j) => <circle key={i + "-" + j} cx={i * 100 + (j % 2) * 50} cy={j * 90} r={14} fill="#4a3660" />))}
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#5a3a2a" />
      {[...Array(9)].map((_, i) => <line key={i} x1={i * 130} y1={1330} x2={i * 130 - 80} y2={VH} stroke="#4a2e20" strokeWidth={6} />)}
      {/* wall calendar */}
      <g transform="translate(260 520)">
        <rect x={-150} y={-170} width={300} height={330} rx={14} fill="#f6efe0" stroke={INKC} strokeWidth={7} />
        <rect x={-150} y={-170} width={300} height={90} rx={14} fill={RED} stroke={INKC} strokeWidth={7} />
        <text y={-108} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill="#fff">1964</text>
        {[...Array(15)].map((_, i) => { const d = i + 1; const x = -110 + (i % 5) * 55, y = -40 + Math.floor(i / 5) * 60; return <g key={i}><text x={x} y={y + 14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKC}>{d}</text>{d <= day && f >= F.stayed && <path d={`M${x - 18} ${y - 14} L${x + 18} ${y + 22} M${x + 18} ${y - 14} L${x - 18} ${y + 22}`} stroke={RED} strokeWidth={6} strokeLinecap="round" />}</g>; })}
      </g>
      {/* lamp */}
      <g transform="translate(860 1330)"><rect x={-60} y={-160} width={120} height={160} rx={10} fill="#8a5a2b" stroke={INKC} strokeWidth={6} /><path d="M-20 -160 V-300" stroke="#c9c9c9" strokeWidth={10} /><path d="M-90 -300 H50 L20 -380 H-60Z" fill="#ffd27a" stroke={INKC} strokeWidth={6} /><ellipse cx={-20} cy={-200} rx={170} ry={90} fill="#ffd27a" opacity={0.12} /></g>
      <g transform="translate(560 1400) scale(1.0)"><Person d={RANDY} f={f} seed={29} talk={0} wave={f > F.randy && f < F.stayed ? 1 : 0} mood={f >= F.eleven ? "surprised" : "happy"} /></g>
      <Chip x={720} y={330} w={320} label="RANDY GARDNER" hue={PURP} p={pop(f, F.randy, 10)} fs={30} />
      <Chip x={720} y={420} w={240} label="AGE 17" hue={AMBER} p={pop(f, F.seventeen, 10)} fs={34} textColor={INKC} />
      {f >= F.stayed && (
        <g transform="translate(720 560)" opacity={pop(f, F.stayed, 10)}>
          <rect x={-230} y={-60} width={460} height={110} rx={24} fill="#0a0e1f" stroke={CYAN} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={CYAN}>AWAKE: DAY {day}</text>
        </g>
      )}
      <BigNum f={f} at={F.eleven} text="11 DAYS" x={540} y={830} hue={YEL} fs={130} />
    </g>
  );
};
const S3_Eleven: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightLab f={f} />
    <Screen on={1}>
      <rect x={170} y={300} width={740} height={540} fill="#141a38" />
      <g transform="translate(540 850) scale(0.8)"><Person d={RANDY} f={f} seed={29} talk={0} wave={0} mood="neutral" /></g>
      <text x={540} y={390} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={YEL}>264 HOURS AWAKE</text>
    </Screen>
    <Duo f={f} />
    <Bubble f={f} x={290} y={900} labels={ASKL} />
  </g>
);
const S4_Eyes: React.FC<{ f: number }> = ({ f }) => {
  const blur = 3 + 5 * (0.5 + 0.5 * Math.sin(f * 0.12)) + ramp(f, F.day2, F.focus) * 4;
  const lid = 0.35 + 0.15 * Math.sin(f * 0.07);
  const ghosts = ramp(f, F.seeing - 6, F.seeing + 20);
  return (
    <g>
      <defs><filter id="eyeBlur"><feGaussianBlur stdDeviation={blur} /></filter></defs>
      <rect width={VW} height={VH} fill="#151b36" />
      {/* giant tired eye */}
      <g transform="translate(540 560)">
        <ellipse rx={380} ry={220} fill="#fff4f2" stroke={INKC} strokeWidth={10} />
        {[...Array(9)].map((_, i) => <path key={i} d={`M${i % 2 ? 360 : -360} ${-100 + i * 25} q ${i % 2 ? -60 : 60} 10 ${i % 2 ? -110 : 110} -6 q ${i % 2 ? -30 : 30} 20 ${i % 2 ? -60 : 60} 6`} stroke="#ff6a6a" strokeWidth={4} fill="none" opacity={0.8} />)}
        <circle cx={Math.sin(f * 0.05) * 30} cy={0} r={130} fill="#5a8ad8" stroke={INKC} strokeWidth={8} />
        <circle cx={Math.sin(f * 0.05) * 30} cy={0} r={60} fill="#0d0d14" />
        <circle cx={Math.sin(f * 0.05) * 30 + 34} cy={-40} r={20} fill="#fff" />
        {/* drooping lid */}
        <path d={`M-390 0 Q0 -260 390 0 L390 -240 L-390 -240Z`} fill="#c98a5a" transform={`translate(0 ${lerp(-60, 200, lid) - 200})`} stroke={INKC} strokeWidth={8} />
        <ellipse rx={380} ry={220} fill="none" stroke={INKC} strokeWidth={10} />
        {/* dark circles */}
        <path d="M-300 210 Q0 330 300 210" stroke="#5a3a6a" strokeWidth={26} fill="none" opacity={0.6} strokeLinecap="round" />
      </g>
      {/* blurry eye chart = what he sees */}
      <g transform="translate(540 1220)">
        <rect x={-260} y={-240} width={520} height={480} rx={20} fill="#f6f6f0" stroke={INKC} strokeWidth={8} />
        <g filter="url(#eyeBlur)">
          {["E", "F P", "T O Z", "L P E D"].map((r, i) => <text key={i} y={-120 + i * 100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110 - i * 22} fill={INKC} letterSpacing={8}>{r}</text>)}
        </g>
        {ghosts > 0 && [0, 1, 2].map((i) => (
          <g key={i} opacity={ghosts * (0.6 + 0.3 * Math.sin(f * 0.2 + i))} transform={`translate(${-200 + i * 200 + Math.sin(f * 0.07 + i) * 40} ${-300 - i * 40 + Math.cos(f * 0.05 + i) * 30})`}>
            <path d="M-40 40 Q-50 -50 0 -50 Q50 -50 40 40 L28 30 L14 44 L0 30 L-14 44 L-28 30Z" fill="#e8e0ff" stroke={PURP} strokeWidth={5} />
            <circle cx={-14} cy={-10} r={7} fill={INKC} /><circle cx={14} cy={-10} r={7} fill={INKC} />
          </g>
        ))}
      </g>
      <DayBadge f={f} at={F.day2} day={2} x={270} y={260} out={F.day4 - 4} />
      <DayBadge f={f} at={F.day4} day={4} x={270} y={260} />
      <Chip x={740} y={250} w={380} label="CAN'T FOCUS" hue={CYAN} p={pop(f, F.focus, 10) * (1 - ramp(f, F.day4 - 4, F.day4 + 2))} fs={36} textColor={INKC} />
      <Chip x={720} y={250} w={420} label="SEEING THINGS" hue={PURP} p={pop(f, F.seeing, 10)} fs={36} />
    </g>
  );
};
const S5_Street: React.FC<{ f: number }> = ({ f }) => {
  const m = eio(ramp(f, F.sign + 6, F.person + 8));
  const sx = 760, sy = 700;
  return (
    <g>
      <rect width={VW} height={VH} fill="#0b1026" />
      {[...Array(30)].map((_, i) => <circle key={i} cx={rnd("s" + i) * VW} cy={rnd("t" + i) * 600} r={1.5 + rnd("r" + i) * 2} fill="#fff" opacity={0.5} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 280 - 40} y={500 - (i % 2) * 120} width={220} height={900} fill="#151c3a" />)}
      {[...Array(14)].map((_, i) => <rect key={i} x={(i % 4) * 280 + 10 + (Math.floor(i / 4) % 2) * 90} y={580 + Math.floor(i / 4) * 160} width={50} height={70} fill={AMBER} opacity={0.35} />)}
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#20263f" />
      <rect x={0} y={1330} width={VW} height={30} fill="#3a4266" />
      {/* street lamp */}
      <g transform="translate(130 1330)"><rect x={-8} y={-700} width={16} height={700} fill="#5a6488" /><path d="M0 -700 Q60 -720 90 -690" stroke="#5a6488" strokeWidth={14} fill="none" /><ellipse cx={90} cy={-680} rx={30} ry={14} fill="#ffe7a0" /><path d="M60 -680 L-60 0 H260 L120 -680Z" fill="#ffe7a0" opacity={0.08} /></g>
      {/* the sign that becomes a person */}
      <g transform={`translate(${sx} ${sy})`}>
        <path d={`M${-8 - m * 14} 0 L${-8 - m * 10} 570 M${8 + m * 14} 0 L${8 + m * 10} 570`} stroke="#8a93b5" strokeWidth={16 + m * 10} strokeLinecap="round" />
        {m > 0.05 && <path d={`M-20 60 Q${-120 * m} ${100 + 60 * m} ${-150 * m} ${230}`} stroke="#8a93b5" strokeWidth={16} fill="none" strokeLinecap="round" opacity={m} />}
        {m > 0.05 && <path d={`M20 60 Q${120 * m} ${100 + 60 * m} ${150 * m} ${230}`} stroke="#8a93b5" strokeWidth={16} fill="none" strokeLinecap="round" opacity={m} />}
        <rect x={lerp(-170, -95, m)} y={lerp(-110, -190, m)} width={lerp(340, 190, m)} height={lerp(150, 190, m)} rx={lerp(14, 95, m)} fill={mix("#2f8f4a", "#c9cfe8", m)} stroke="#fff" strokeWidth={8} />
        <text y={lerp(-18, -80, m)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff" opacity={1 - m * 1.5}>ELM ST</text>
        <g opacity={clamp01(m * 2 - 1)}>
          <circle cx={-34} cy={-110} r={16} fill={INKC} /><circle cx={34} cy={-110} r={16} fill={INKC} />
          <path d="M-36 -50 Q0 -24 36 -50" stroke={INKC} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M60 -150 q 20 -20 ${Math.sin(f * 0.3) * 10 + 20} -40`} stroke="#fff" strokeWidth={0} />
        </g>
      </g>
      <g transform="translate(300 1420) scale(1.0)"><Person d={RANDY} f={f} seed={29} talk={0} wave={0} mood={f >= F.person - 4 ? "surprised" : "neutral"} /></g>
      {f >= F.person && <text x={380} y={900} fontFamily={FONT} fontWeight={800} fontSize={120} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.person, 10)}>?!</text>}
      <Chip x={540} y={330} w={400} label="HALLUCINATION" hue={PURP} p={pop(f, F.person + 4, 10)} fs={36} />
    </g>
  );
};
const S6_Day11: React.FC<{ f: number }> = ({ f }) => {
  const forgetP = ramp(f, F.forget, F.middle + 20);
  const sentence = "I WAS SAYING THAT...";
  const shown = sentence.slice(0, Math.max(0, Math.round(sentence.length * (1 - forgetP))));
  return (
    <g>
      <NightLab f={f} />
      <Screen on={ramp(f, F.day11 - 10, F.day11)}>
        <rect x={170} y={300} width={740} height={540} fill="#f2efe4" />
        <text x={540} y={390} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={RED}>DAY 11</text>
        <text x={540} y={510} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90} fill={INKC} opacity={1 - ramp(f, F.forget - 10, F.forget)}>7 + 5 = ?</text>
        {["11?", "13?", "75?"].map((t, i) => {
          const a0 = F.day11 + 20 + i * 14;
          return f >= a0 && f < F.forget ? <g key={i} opacity={pop(f, a0, 8)}><text x={340 + i * 200} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#7a7a8a">{t}</text><path d={`M${295 + i * 200} 600 L${385 + i * 200} 650`} stroke={RED} strokeWidth={8} strokeLinecap="round" /></g> : null;
        })}
        {f >= F.math && f < F.forget && <Stamp f={f} at={F.math} x={540} y={760} text="FAIL" hue={RED} fs={60} rot={-6} />}
        {f >= F.forget - 6 && (
          <g opacity={ramp(f, F.forget - 6, F.forget)}>
            <rect x={265} y={600} width={550} height={100} rx={50} fill="#fff" stroke={INKC} strokeWidth={6} />
            <text x={295} y={665} fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>"{shown}{forgetP < 1 && Math.floor(f / 8) % 2 ? "|" : ""}</text>
            {forgetP >= 1 && <text x={540} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={RED}>...WHAT WAS I SAYING?</text>}
          </g>
        )}
      </Screen>
      <Duo f={f} />
      <Bubble f={f} x={290} y={900} labels={ASKL} />
    </g>
  );
};
const Mug: React.FC<{ x: number; y: number; f: number; i: number }> = ({ x, y, f, i }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-30 -60 H30 L26 0 H-26Z" fill={["#ff8a3d", "#5ad1ff", "#3ddc97", "#ff6fae"][i % 4]} stroke={INKC} strokeWidth={5} />
    <path d="M30 -46 q 24 4 0 30" stroke={INKC} strokeWidth={6} fill="none" />
    <path d={`M-6 -70 q -8 -12 0 -24`} stroke="#ccd" strokeWidth={4} fill="none" opacity={0.5 + 0.4 * Math.sin(f * 0.2 + i)} />
  </g>
);
const S7_AllNighter: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightLab f={f} />
    <Screen on={0} />
    {/* desk with coffee pile */}
    <rect x={380} y={1250} width={330} height={30} rx={8} fill="#8a5a2b" stroke={INKC} strokeWidth={5} />
    <path d="M410 1280 V1480 M680 1280 V1480" stroke="#6b4423" strokeWidth={14} />
    {[...Array(5)].map((_, i) => f >= F.allnight + i * 6 ? <Mug key={i} x={420 + i * 62} y={1250} f={f} i={i} /> : null)}
    <Duo f={f} askMood={speaking(f, "asker", SPK) ? "happy" : "surprised"} hostMood={f >= F.areyou ? "surprised" : "neutral"} />
    {f >= F.areyou && <text x={880} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.areyou, 10)}>?</text>}
    <Bubble f={f} x={290} y={900} labels={ASKL} />
  </g>
);
const S8_Drunk: React.FC<{ f: number }> = ({ f }) => {
  const h = ramp(f, F.eighteen - 20, F.eighteen + 30);
  const bars = eout(ramp(f, F.drinking - 30, F.drinking + 10));
  return (
    <g>
      <rect width={VW} height={VH} fill="#141a38" />
      <g transform="translate(540 520)">
        <circle r={250} fill="#0a0e1f" stroke={CYAN} strokeWidth={12} />
        {[...Array(24)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 12) * 210} y1={-Math.cos(i * Math.PI / 12) * 210} x2={Math.sin(i * Math.PI / 12) * 232} y2={-Math.cos(i * Math.PI / 12) * 232} stroke={i <= h * 18 ? AMBER : "#3a4680"} strokeWidth={i % 6 ? 6 : 12} />)}
        <path d={`M0 0 L0 -200 A200 200 0 ${h * 18 > 12 ? 1 : 0} 1 ${Math.sin(h * 18 * Math.PI / 12) * 200} ${-Math.cos(h * 18 * Math.PI / 12) * 200}Z`} fill={AMBER} opacity={0.25} />
        <line x1={0} y1={0} x2={Math.sin(h * 18 * Math.PI / 12) * 190} y2={-Math.cos(h * 18 * Math.PI / 12) * 190} stroke={AMBER} strokeWidth={12} strokeLinecap="round" />
        <circle r={16} fill={AMBER} />
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill="#fff">{Math.round(h * 18)}H</text>
        <text y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={CYAN} letterSpacing={3}>AWAKE</text>
      </g>
      {/* bars: 18h awake vs drunk */}
      <g transform="translate(0 1450)">
        <text x={540} y={-560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill="#fff" opacity={bars}>REACTION SLOWDOWN</text>
        {[{ x: 330, label: "18H AWAKE", hue: AMBER }, { x: 750, label: "DRUNK", hue: RED }].map((b, i) => (
          <g key={i}>
            <rect x={b.x - 90} y={-420} width={180} height={420} rx={16} fill="#1f2750" />
            <rect x={b.x - 90} y={-420 * bars * 0.85} width={180} height={420 * bars * 0.85} rx={16} fill={b.hue} />
            <text x={b.x} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff">{b.label}</text>
          </g>
        ))}
        {bars > 0.9 && <text x={540} y={-180} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={140} fill={YEL} stroke={INKC} strokeWidth={8} paintOrder="stroke" opacity={pop(f, F.drinking + 6, 10)}>=</text>}
      </g>
    </g>
  );
};
const S9_Micro: React.FC<{ f: number }> = ({ f }) => {
  const blinks = [F.micro + 4, F.tiny + 6, F.noticing - 2];
  let lid = 0, which = -1;
  blinks.forEach((b, i) => { const q = (f - b) / 22; if (q > 0 && q < 1) { lid = Math.max(lid, Math.min(1, Math.sin(q * Math.PI) * 1.8)); which = i; } });
  const secs = Math.min(3, Math.floor(ramp(f, F.few - 4, F.few + 40) * 3.99));
  return (
    <g>
      <NightLab f={f} />
      <Screen on={0} />
      <g transform="translate(540 1500) scale(1.25)"><Person d={CODER} f={f} seed={24} talk={0} wave={0} mood="neutral" /></g>
      {/* laptop glow */}
      <ellipse cx={540} cy={1060} rx={260} ry={120} fill={CYAN} opacity={0.08} />
      <Chip x={540} y={420} w={440} label="MICROSLEEPS" hue={PURP} p={pop(f, F.micro, 10)} fs={42} />
      {f >= F.few - 4 && (
        <g transform="translate(540 600)" opacity={pop(f, F.few - 4, 10)}>
          <circle r={100} fill="#0a0e1f" stroke={CYAN} strokeWidth={8} />
          <rect x={-16} y={-126} width={32} height={20} rx={4} fill={CYAN} />
          <line x1={0} y1={0} x2={Math.sin(secs * 1.2) * 70} y2={-Math.cos(secs * 1.2) * 70} stroke={CYAN} strokeWidth={8} strokeLinecap="round" />
          <text y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">{secs} SEC</text>
        </g>
      )}
      {/* eyelids closing over the whole view */}
      {lid > 0 && (
        <g>
          <path d={`M0 0 H${VW} V${VH * 0.5 * lid} Q540 ${VH * 0.5 * lid + 120 * lid} 0 ${VH * 0.5 * lid}Z`} fill="#05060c" />
          <path d={`M0 ${VH} H${VW} V${VH - VH * 0.5 * lid} Q540 ${VH - VH * 0.5 * lid - 120 * lid} 0 ${VH - VH * 0.5 * lid}Z`} fill="#05060c" />
          {lid > 0.9 && <text x={540} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={PURP} letterSpacing={6}>{which === 2 ? "DIDN'T NOTICE?" : "MICROSLEEP"}</text>}
        </g>
      )}
    </g>
  );
};
const RecordBook: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={170} y={300} width={740} height={540} fill="#e9dcc0" />
    <g transform="translate(540 570) rotate(-4)">
      <rect x={-200} y={-220} width={400} height={440} rx={14} fill="#1f3b70" stroke={INKC} strokeWidth={8} />
      <rect x={-200} y={-220} width={40} height={440} fill="#152a52" />
      <text y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={YEL}>WORLD</text>
      <text y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={YEL}>RECORDS</text>
      <path d="M-70 60 L0 20 L70 60 L45 140 H-45Z" fill={YEL} opacity={0.8} />
    </g>
  </g>
);
const S10_Recover: React.FC<{ f: number }> = ({ f }) => {
  const showBed = f >= F.slept - 10 && f < F.record - 6;
  const showBook = f >= F.record - 6;
  const hrs = countUp(f, F.fourteen - 8, F.fourteen + 30, 14);
  return (
    <g>
      <NightLab f={f} />
      <Screen on={showBed || showBook ? 1 : 0}>
        {showBed && (
          <g>
            <rect x={170} y={300} width={740} height={540} fill="#1d2a5a" />
            <g transform="translate(560 700)">
              <rect x={-300} y={-40} width={600} height={120} rx={20} fill="#8a5a2b" stroke={INKC} strokeWidth={6} />
              <rect x={-290} y={-80} width={580} height={70} rx={30} fill="#7fa8ff" stroke={INKC} strokeWidth={6} />
              <ellipse cx={-210} cy={-100} rx={70} ry={36} fill="#fff" stroke={INKC} strokeWidth={6} />
              <g transform="translate(-200 -125)">
                <circle r={46} fill={RANDY.skin} stroke={INKC} strokeWidth={5} />
                <path d="M-46 -6 Q-40 -60 0 -56 Q46 -60 46 -6" fill="#ff8a3d" stroke={INKC} strokeWidth={5} />
                <path d="M-22 6 q 8 6 16 0 M8 6 q 8 6 16 0" stroke={INKC} strokeWidth={4} fill="none" />
              </g>
            </g>
            <Zs f={f} x={420} y={560} />
            <text x={660} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke">{hrs}H</text>
            <text x={660} y={478} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">OF SLEEP</text>
            {f >= F.okay && <Chip x={660} y={540} w={220} label="OKAY ✓" hue={GREEN} p={pop(f, F.okay, 10)} fs={36} textColor={INKC} />}
          </g>
        )}
        {showBook && <RecordBook f={f} />}
      </Screen>
      {showBook && f >= F.accepting && <Stamp f={f} at={F.accepting} x={540} y={570} text="NO LONGER ACCEPTED" hue={RED} fs={28} rot={-8} />}
      <Duo f={f} />
      {f >= F.dangerous && <Chip x={540} y={940} w={480} label="TOO DANGEROUS" hue={RED} p={pop(f, F.dangerous, 10)} fs={42} />}
      <Bubble f={f} x={290} y={900} labels={ASKL} />
    </g>
  );
};
const S11_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NightLab f={f} />
    <Outro f={f} at={F.sub} />
    <g transform="translate(140 1570) scale(0.72)"><Person d={CODER} f={f} seed={24} talk={0} wave={1} mood="happy" /></g>
    <g transform="translate(940 1570) scale(0.72)"><Person d={SCI} f={f} seed={0} talk={hostTalk(f)} wave={1} mood="happy" /></g>
  </g>
);

export const NoSleepFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.y1964, render: () => <S1_Ask f={f} />, cam: [[0, { x: 540, y: 1000, z: 1.05 }], [40, { x: 420, y: 1060, z: 1.15 }], [F.y1964, { x: 380, y: 1080, z: 1.24 }]] },
    { from: F.y1964, to: F.elevenQ, tr: "whip", render: () => <S2_Randy f={f} />, cam: [[F.y1964, { x: 480, y: 640, z: 1.3 }], [F.randy, { x: 560, y: 760, z: 1.15 }], [F.stayed, { x: 560, y: 820, z: 1.1 }], [F.eleven + 10, { x: 540, y: 820, z: 1.18 }], [F.elevenQ, { x: 540, y: 840, z: 1.22, r: -1 }]] },
    { from: F.elevenQ, to: F.day2, tr: "iris", render: () => <S3_Eleven f={f} />, cam: [[F.elevenQ, { x: 400, y: 1000, z: 1.2 }], [F.day2, { x: 540, y: 960, z: 1.05 }]] },
    { from: F.day2, to: F.thought, tr: "zoom", render: () => <S4_Eyes f={f} />, cam: [[F.day2, { x: 540, y: 560, z: 1.25 }], [F.focus + 10, { x: 540, y: 760, z: 1.08 }], [F.day4, { x: 540, y: 880, z: 1.05 }], [F.thought, { x: 540, y: 900, z: 1.1 }]] },
    { from: F.thought, to: F.terrifying, tr: "wipe", render: () => <S5_Street f={f} />, cam: [[F.thought, { x: 500, y: 980, z: 1.15 }], [F.sign, { x: 600, y: 940, z: 1.1 }], [F.terrifying, { x: 640, y: 880, z: 1.2 }]] },
    { from: F.terrifying, to: F.allnight, tr: "spin", render: () => <S6_Day11 f={f} />, cam: [[F.terrifying, { x: 400, y: 1040, z: 1.2 }], [F.day11 - 4, { x: 540, y: 980, z: 1.05 }], [F.day11 + 20, { x: 540, y: 570, z: 1.85 }], [F.middle + 20, { x: 540, y: 575, z: 1.8 }], [F.allnight, { x: 540, y: 900, z: 1.1 }]] },
    { from: F.allnight, to: F.eighteen - 18, tr: "push", render: () => <S7_AllNighter f={f} />, cam: [[F.allnight, { x: 420, y: 1060, z: 1.22 }], [F.areyou - 4, { x: 470, y: 1060, z: 1.15 }], [F.eighteen - 18, { x: 680, y: 1020, z: 1.22, r: 1 }]] },
    { from: F.eighteen - 18, to: F.micro - 6, tr: "whipUp", render: () => <S8_Drunk f={f} />, cam: [[F.eighteen - 18, { x: 540, y: 560, z: 1.3 }], [F.eighteen + 30, { x: 540, y: 760, z: 1.05 }], [F.drinking, { x: 540, y: 960, z: 1.0 }], [F.micro - 6, { x: 540, y: 980, z: 1.06 }]] },
    { from: F.micro - 6, to: F.recover, tr: "zoom", render: () => <S9_Micro f={f} />, cam: [[F.micro - 6, { x: 540, y: 900, z: 1.3 }], [F.few, { x: 540, y: 820, z: 1.15 }], [F.recover, { x: 540, y: 880, z: 1.22 }]] },
    { from: F.recover, to: F.sub, tr: "iris", render: () => <S10_Recover f={f} />, cam: [[F.recover, { x: 400, y: 1040, z: 1.2 }], [F.slept, { x: 540, y: 800, z: 1.1 }], [F.fourteen, { x: 540, y: 570, z: 1.85 }], [F.record, { x: 540, y: 575, z: 1.8 }], [F.accepting + 32, { x: 540, y: 575, z: 1.78 }], [F.dangerous - 4, { x: 540, y: 820, z: 1.12 }], [F.sub, { x: 540, y: 900, z: 1.06 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S11_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.y1964, 0.1], [F.eleven, 0.14], [F.elevenQ, 0.1], [F.focus, 0.08], [F.seeing, 0.08], [F.person, 0.14], [F.math, 0.1], [F.areyou, 0.1], [F.eighteen, 0.1], [F.drinking, 0.12], [F.fourteen, 0.12], [F.accepting, 0.14]];
  const SHAKE: [number, number][] = [[F.eleven + 2, 10], [F.person + 2, 12], [F.math + 2, 8], [F.drinking + 6, 10], [F.accepting + 2, 12]];
  const SFX: Cue[] = [
    [36, "pop", 0.35], [F.y1964, "boom", 0.4], [F.randy, "pop", 0.3], [F.seventeen, "pop", 0.3], [F.stayed, "tick", 0.35], [F.stayed + 12, "tick", 0.3], [F.stayed + 24, "tick", 0.3], [F.eleven, "impact", 0.45],
    [F.elevenQ - 3, "pop", 0.4], [F.day2, "pop", 0.35], [F.focus, "pop", 0.3], [F.day4, "pop", 0.35], [F.seeing - 10, "riser_dark", 0.25],
    [F.sign, "riser", 0.25], [F.person, "impact", 0.5], [F.terrifying - 3, "pop", 0.35], [F.day11, "pop", 0.3], [F.math, "impact", 0.4], [F.forget, "tick", 0.3],
    [F.allnight - 3, "pop", 0.35], [F.areyou, "pop", 0.3], [F.eighteen, "tick", 0.3], [F.drinking - 30, "riser", 0.25], [F.drinking + 6, "impact", 0.45],
    [F.micro + 4, "whoosh", 0.3], [F.tiny + 6, "whoosh", 0.3], [F.noticing - 2, "whoosh", 0.3], [F.few, "tick", 0.3],
    [F.recover - 3, "pop", 0.35], [F.fourteen, "pop", 0.35], [F.okay, "pop", 0.3], [F.record - 6, "whoosh", 0.3], [F.accepting, "impact", 0.5], [F.dangerous, "boom", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const accent = f < F.elevenQ ? PURP : f < F.allnight ? RED : f < F.recover ? "#7b5cff" : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="NO SLEEP" sub="WHAT IF YOU NEVER SLEEP?" until={ASK[0][1] - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="nosleep" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
