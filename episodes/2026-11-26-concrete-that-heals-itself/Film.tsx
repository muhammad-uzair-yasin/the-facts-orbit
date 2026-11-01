import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking, countUp } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (start frame of each word, from words.ts WORDS)
const F = {
  ask: 17, askEnd: 123, look: 141, pantheon: 159, dome: 200, nineteen: 235, its: 284, largest: 307, andQ: 392, andQEnd: 434,
  lot: 452, cracking: 479, hundred: 518, know: 557, knowEnd: 621, y2023: 639, mit: 698, secret: 734, tiny: 764, lumps: 781, all: 803,
  lumpsQ: 861, lumpsQEnd: 934, everyone: 952, crack: 1012, water: 1036, dissolve: 1077, and2: 1108, harden: 1113, filling: 1130, heals: 1185,
  noway: 1226, nowayEnd: 1251, harbor: 1269, seawater: 1343, ash: 1395, grows: 1436, their: 1479, stronger: 1507, time: 1536, sub: 1577,
};

const SKY = "#ffd9a0", SKY2 = "#ffefd2", STONE = "#d9c7a5", STONE2 = "#bfa77f", CONC = "#b9b6ad", CONC2 = "#8f8b82", LIME = "#ffffff", WATER = "#3fa7e0", SEA = "#1f6fa8", CRYST = "#7ef0ff", RED = "#e8412c", GRN = "#2fbf71", TERRA = "#c8643c";
const MECH = CAST[26], ENG = CAST[8];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);

// ---------- Q&A kit (local) ----------
const Bubble: React.FC<{ f: number; from: number; to: number; x: number; y: number; lines: string[]; tx: number; ty: number; hue?: string; fs?: number; accent?: string }> = ({ f, from, to, x, y, lines, tx, ty, hue = "#ffffff", fs = 74, accent = RED }) => {
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
      <rect x={cx - w / 2 + 10} y={y - h / 2 + 12} width={w} height={h} rx={44} fill="#000000" opacity={0.22} />
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
const Duo: React.FC<{ f: number; ax?: number; hx?: number; y?: number; s?: number; aMood?: "happy" | "neutral" | "surprised"; hWave?: number; aWave?: number }> = ({ f, ax = 260, hx = 820, y = 1500, s = 0.95, aMood = "happy", hWave = 0, aWave = 0 }) => (
  <g>
    <g transform={`translate(${ax} ${y}) scale(${s})`}><Person d={MECH} f={f} seed={26} talk={askTalk(f)} wave={aWave} mood={aMood} /></g>
    <g transform={`translate(${hx} ${y}) scale(${s})`}><Person d={ENG} f={f} seed={8} talk={hostTalk(f)} wave={hWave} mood="happy" /></g>
  </g>
);

// ---------- set pieces ----------
const Sun: React.FC<{ f: number; top?: string; bot?: string }> = ({ f, top = SKY, bot = SKY2 }) => (
  <g>
    <defs><linearGradient id={`sun${top}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect width={VW} height={VH} fill={`url(#sun${top})`} />
    <circle cx={880} cy={260} r={90} fill="#fff3c4" />
    <circle cx={880} cy={260} r={130 + Math.sin(f * 0.08) * 6} fill="#fff3c4" opacity={0.3} />
    {[0, 1].map((i) => <ellipse key={i} cx={((i * 600 + f * 0.6) % 1400) - 200} cy={420 + i * 120} rx={150} ry={34} fill="#ffffff" opacity={0.6} />)}
  </g>
);
/** Building site: ground, scaffold, cracked modern block. */
const Site: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sun f={f} />
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#c9a77a" />
    <rect x={0} y={1320} width={VW} height={20} fill="#a8865c" />
    <g opacity={0.9}>
      {[0, 1, 2].map((i) => <rect key={i} x={60 + i * 120} y={560} width={14} height={770} fill="#7a7a84" />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={60} y={620 + i * 180} width={254} height={14} fill="#7a7a84" />)}
      <rect x={640} y={600} width={14} height={730} fill="#ffb000" />
      <rect x={640} y={600} width={380} height={14} fill="#ffb000" />
      <line x1={960} y1={614} x2={960} y2={760 + Math.sin(f * 0.05) * 10} stroke={INKC} strokeWidth={4} />
      <rect x={920} y={760 + Math.sin(f * 0.05) * 10} width={80} height={50} fill={CONC} stroke={INKC} strokeWidth={4} />
    </g>
  </g>
);
/** The Pantheon (front view: portico + dome with oculus). */
const Pantheon: React.FC<{ x: number; y: number; s?: number; cut?: number }> = ({ x, y, s = 1, cut = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-330 -260 A330 300 0 0 1 330 -260 Z" fill={STONE2} stroke={INKC} strokeWidth={8} />
    {[...Array(5)].map((_, i) => <path key={i} d={`M${-330 + i * 20} -260 A${330 - i * 20} ${300 - i * 30} 0 0 1 ${330 - i * 20} -260`} fill="none" stroke={mix(STONE2, "#000000", 0.15)} strokeWidth={4} />)}
    <ellipse cx={0} cy={-556} rx={46} ry={12} fill="#3a2a20" stroke={INKC} strokeWidth={5} />
    <rect x={-340} y={-270} width={680} height={40} fill={STONE} stroke={INKC} strokeWidth={7} />
    <path d="M-360 -230 L0 -380 L360 -230 Z" fill={STONE} stroke={INKC} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-360} y={-230} width={720} height={40} fill={mix(STONE, "#000000", 0.08)} stroke={INKC} strokeWidth={7} />
    {[...Array(8)].map((_, i) => (
      <g key={i}>
        <rect x={-320 + i * 88} y={-190} width={46} height={330} fill="#efe4cc" stroke={INKC} strokeWidth={6} />
        <rect x={-328 + i * 88} y={-196} width={62} height={18} fill={STONE} stroke={INKC} strokeWidth={4} />
      </g>
    ))}
    <rect x={-380} y={140} width={760} height={40} fill={STONE2} stroke={INKC} strokeWidth={7} />
    {cut > 0 && <path d="M-320 -280 A320 290 0 0 1 320 -280" fill="none" stroke={YEL} strokeWidth={12} strokeDasharray="30 18" opacity={cut} />}
  </g>
);
/** Concrete slab with cracks that grow with c (0..1). */
const Slab: React.FC<{ x: number; y: number; w: number; h: number; c: number; lumps?: number; heal?: number; fill?: string }> = ({ x, y, w, h, c, lumps = 0, heal = 0, fill = CONC }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={fill} stroke={INKC} strokeWidth={8} />
    {[...Array(26)].map((_, i) => <circle key={i} cx={-w / 2 + 20 + rnd("ag" + i) * (w - 40)} cy={-h / 2 + 20 + rnd("ah" + i) * (h - 40)} r={4 + rnd("ar" + i) * 8} fill={CONC2} opacity={0.6} />)}
    {lumps > 0 && [...Array(10)].map((_, i) => <ellipse key={"l" + i} cx={-w / 2 + 40 + rnd("lx" + i) * (w - 80)} cy={-h / 2 + 30 + rnd("ly" + i) * (h - 60)} rx={14 + rnd("lr" + i) * 10} ry={10 + rnd("lq" + i) * 8} fill={LIME} stroke={INKC} strokeWidth={3} opacity={lumps} />)}
    {c > 0 && (
      <path d={`M${-w * 0.1} ${-h / 2} L${-w * 0.05} ${-h * 0.25} L${-w * 0.14} ${-h * 0.05} L${-w * 0.02} ${h * 0.12} L${-w * 0.1} ${h * 0.32} L${-w * 0.04} ${h / 2}`}
        stroke={mix("#2a2a2a", "#e9e6dc", heal)} strokeWidth={10 * (1 - heal * 0.7)} fill="none" strokeLinejoin="round" strokeDasharray={`${c * 1400} 2000`} />
    )}
    {c > 0.5 && <path d={`M${-w * 0.14} ${-h * 0.05} L${-w * 0.3} ${h * 0.05} L${-w * 0.38} ${-h * 0.1}`} stroke={mix("#2a2a2a", "#e9e6dc", heal)} strokeWidth={7} fill="none" strokeDasharray={`${(c - 0.5) * 2 * 500} 900`} />}
  </g>
);
const Magnifier: React.FC<{ x: number; y: number; r: number; children: React.ReactNode; id: string }> = ({ x, y, r, children, id }) => (
  <g>
    <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
    <line x1={x + r * 0.7} y1={y + r * 0.7} x2={x + r * 1.45} y2={y + r * 1.45} stroke="#5a3a22" strokeWidth={34} strokeLinecap="round" />
    <circle cx={x} cy={y} r={r + 6} fill="#ffffff" />
    <g clipPath={`url(#${id})`}>{children}</g>
    <circle cx={x} cy={y} r={r} fill="none" stroke={INKC} strokeWidth={14} />
    <path d={`M${x - r * 0.6} ${y - r * 0.3} A${r * 0.7} ${r * 0.7} 0 0 1 ${x - r * 0.2} ${y - r * 0.65}`} stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
  </g>
);
const Waves: React.FC<{ f: number; y: number; color?: string; amp?: number }> = ({ f, y, color = SEA, amp = 18 }) => (
  <path d={`M0 ${y} ${[...Array(13)].map((_, i) => `Q ${i * 90 + 45} ${y + (i % 2 ? amp : -amp) * Math.sin(f * 0.08 + i)} ${(i + 1) * 90} ${y}`).join(" ")} V ${VH} H 0 Z`} fill={color} />
);

// ---------- shots ----------
const S1_Ask: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Site f={f} />
    <Duo f={f} y={1500} aMood={speaking(f, "asker", SPK) ? "surprised" : "happy"} />
    <Bubble f={f} from={F.ask} to={F.askEnd} x={440} y={800} lines={["STILL STANDING", "AFTER 2,000 YRS?"]} tx={260} ty={1040} fs={62} />
  </g>
);
const S2_Pantheon: React.FC<{ f: number }> = ({ f }) => {
  const yrs = countUp(f, F.nineteen - 10, F.nineteen + 30, 1900);
  return (
    <g>
      <Sun f={f} top="#ffcf8a" bot="#ffeccb" />
      <rect x={0} y={1180} width={VW} height={VH - 1180} fill="#d8c29c" />
      {[...Array(9)].map((_, i) => <rect key={i} x={i * 130} y={1180} width={124} height={60} fill="none" stroke={STONE2} strokeWidth={4} />)}
      <Pantheon x={540} y={1050} s={1.1} cut={ramp(f, F.largest, F.largest + 20)} />
      <text x={540} y={390} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={INKC} opacity={pop(f, F.pantheon, 10)}>THE PANTHEON, ROME</text>
      {f >= F.nineteen - 10 && <BigNum f={f} at={F.nineteen - 10} text={`~${yrs.toLocaleString("en-US")} YRS`} x={540} y={1430} hue={YEL} fs={130} />}
      {f >= F.largest && <Chip x={540} y={1560} w={820} label="LARGEST UNREINFORCED DOME" hue={TERRA} p={pop(f, F.largest, 10)} fs={36} />}
    </g>
  );
};
const S3_Modern: React.FC<{ f: number }> = ({ f }) => {
  const c = eio(ramp(f, F.cracking - 10, F.hundred + 20));
  const yr = Math.round(lerp(0, 100, eio(ramp(f, F.cracking - 10, F.hundred + 10))));
  return (
    <g>
      <Sun f={f} top="#c9d8e8" bot="#eef2f6" />
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#9aa0a8" />
      {/* modern bridge */}
      <rect x={60} y={760} width={960} height={110} fill={CONC} stroke={INKC} strokeWidth={8} />
      {[220, 540, 860].map((x, i) => <rect key={i} x={x - 50} y={870} width={100} height={460} fill={CONC} stroke={INKC} strokeWidth={8} />)}
      <Slab x={540} y={815} w={960} h={110} c={c} fill={CONC} />
      {c > 0.3 && <path d={`M210 900 L230 1000 L205 1080 L225 1200`} stroke="#2a2a2a" strokeWidth={8} fill="none" strokeDasharray={`${(c - 0.3) * 700} 900`} />}
      {c > 0.5 && <path d={`M860 880 L840 980 L870 1060`} stroke="#2a2a2a" strokeWidth={8} fill="none" strokeDasharray={`${(c - 0.5) * 600} 900`} />}
      {[...Array(10)].map((_, i) => { const q = clamp01(c * 1.3 - rnd("db" + i) * 0.3); return q > 0.2 ? <rect key={i} x={500 + rnd("dx" + i) * 120} y={880 + q * 440 * rnd("dy" + i)} width={12} height={10} fill={CONC2} /> : null; })}
      <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INKC} opacity={pop(f, F.lot, 10)}>MODERN CONCRETE</text>
      {f >= F.cracking - 10 && (
        <g>
          <rect x={300} y={500} width={480} height={150} rx={24} fill="#ffffff" stroke={INKC} strokeWidth={7} />
          <text x={540} y={605} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={yr >= 50 ? RED : INKC}>{`${yr} YRS`}</text>
        </g>
      )}
      {f >= F.hundred && <Stamp f={f} at={F.hundred + 4} x={540} y={1450} text="CRACKED" hue={RED} fs={90} rot={-6} />}
    </g>
  );
};
const S4_Know: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Site f={f} />
    <Duo f={f} y={1500} aMood={f < F.know ? "neutral" : "surprised"} />
    <Bubble f={f} from={F.andQ} to={F.andQEnd} x={420} y={800} lines={["AND MODERN", "CONCRETE?"]} tx={260} ty={1040} />
    <Bubble f={f} from={F.know} to={F.knowEnd} x={440} y={800} lines={["WHAT DID THE", "ROMANS KNOW?"]} tx={260} ty={1040} fs={68} />
  </g>
);
const S4b_Crack: React.FC<{ f: number }> = ({ f }) => <S3_Modern f={f} />;
const S5_MIT: React.FC<{ f: number }> = ({ f }) => {
  const mx = lerp(260, 760, eio(ramp(f, F.lumps - 20, F.lumps + 40)));
  return (
    <g>
      <rect width={VW} height={VH} fill="#eef3f8" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 170} x2={VW} y2={i * 170} stroke="#d6e0ea" strokeWidth={3} />)}
      {f < F.tiny && <BigNum f={f} at={F.y2023} text="2023" x={540} y={360} hue={YEL} fs={160} />}
      {f < F.tiny && <Chip x={540} y={460} w={260} label="MIT" hue="#a31f34" p={pop(f, F.mit, 10)} fs={48} />}
      <Slab x={540} y={1050} w={900} h={460} c={0} lumps={0} fill={STONE} />
      <g opacity={pop(f, F.secret - 6, 12)}>
        <Magnifier x={mx} y={1040} r={190} id="mag1">
          <g transform={`translate(${mx} 1040) scale(2) translate(${-mx} -1040)`}>
          <rect x={0} y={0} width={VW} height={VH} fill={STONE} />
          {[...Array(40)].map((_, i) => <circle key={i} cx={rnd("mg" + i) * VW} cy={800 + rnd("mh" + i) * 500} r={6 + rnd("mr" + i) * 12} fill={CONC2} opacity={0.5} />)}
          {[...Array(36)].map((_, i) => <ellipse key={"w" + i} cx={150 + ((i % 9) + rnd("wx" + i) * 0.6) * 88} cy={900 + (Math.floor(i / 9) + rnd("wy" + i) * 0.6) * 72} rx={14 + rnd("wr" + i) * 8} ry={10 + rnd("wq" + i) * 6} fill={LIME} stroke={INKC} strokeWidth={4} />)}
          </g>
        </Magnifier>
      </g>
      {f >= F.lumps && <Chip x={540} y={1460} w={620} label="WHITE LIME LUMPS" hue={INKC} p={pop(f, F.lumps, 10)} fs={42} />}
      {f >= F.all && <text x={540} y={1570} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INKC} opacity={pop(f, F.all, 10)}>ALL THROUGH THE CONCRETE</text>}
    </g>
  );
};
const S6_Mistake: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Site f={f} />
    <Duo f={f} y={1500} aMood="surprised" />
    <Bubble f={f} from={F.lumpsQ} to={F.lumpsQEnd} x={420} y={800} lines={["LUMPS?!", "A MISTAKE?"]} tx={260} ty={1040} fs={78} />
    {f >= F.everyone && <Chip x={700} y={620} w={560} label="EVERYONE THOUGHT SO" hue={TERRA} p={pop(f, F.everyone, 10)} fs={34} />}
  </g>
);
/** 7: self-healing cross-section: crack → water → lumps dissolve → crack sealed. */
const S7_Heal: React.FC<{ f: number }> = ({ f }) => {
  const crack = eio(ramp(f, F.crack - 8, F.crack + 16));
  const water = eio(ramp(f, F.water - 4, F.water + 26));
  const dissolve = eio(ramp(f, F.dissolve - 4, F.dissolve + 30));
  const harden = eio(ramp(f, F.harden - 4, F.filling + 20));
  const W = 900, H = 700, X = 540, Y = 1000;
  const zig = (k: number) => `M${X - 30} ${Y - H / 2} L${X + 10} ${Y - 220} L${X - 40} ${Y - 90} L${X + 20} ${Y + 40} L${X - 30} ${Y + 170} L${X + 10} ${Y + H / 2 * k}`;
  const steps = [["1", "CRACK", F.crack], ["2", "WATER", F.water], ["3", "LUMPS DISSOLVE", F.dissolve], ["4", "SEALED", F.filling]] as const;
  return (
    <g>
      <rect width={VW} height={VH} fill="#f4efe4" />
      <rect x={X - W / 2} y={Y - H / 2} width={W} height={H} rx={14} fill={STONE} stroke={INKC} strokeWidth={8} />
      {[...Array(30)].map((_, i) => <circle key={i} cx={X - W / 2 + 30 + rnd("hx" + i) * (W - 60)} cy={Y - H / 2 + 30 + rnd("hy" + i) * (H - 60)} r={5 + rnd("hr" + i) * 9} fill={CONC2} opacity={0.5} />)}
      {[[X - 110, Y - 150], [X + 90, Y - 20], [X - 100, Y + 110], [X + 120, Y + 220], [X - 300, Y - 200], [X + 300, Y + 120]].map(([lx, ly], i) => {
        const near = i < 4;
        const s = near ? 1 - dissolve * 0.75 : 1;
        return <ellipse key={i} cx={lx} cy={ly} rx={42 * s} ry={30 * s} fill={LIME} stroke={INKC} strokeWidth={4} />;
      })}
      {/* dissolved lime flowing to the crack */}
      {dissolve > 0 && [...Array(18)].map((_, i) => {
        const q = clamp01(dissolve * 1.3 - rnd("fl" + i) * 0.3);
        const sx = [X - 110, X + 90, X - 100, X + 120][i % 4], sy = [Y - 150, Y - 20, Y + 110, Y + 220][i % 4];
        return <circle key={i} cx={lerp(sx, X - 10, q)} cy={lerp(sy, sy + (rnd("fy" + i) - 0.5) * 60, q)} r={7} fill="#ffffff" opacity={(1 - harden) * 0.9} />;
      })}
      <path d={zig(crack)} stroke="#2a2a2a" strokeWidth={lerp(30, 0, harden)} fill="none" strokeLinejoin="round" opacity={crack} />
      <path d={zig(crack)} stroke={WATER} strokeWidth={lerp(16, 0, harden)} fill="none" strokeLinejoin="round" strokeDasharray={`${water * 1000} 2000`} opacity={0.9} />
      <path d={zig(crack)} stroke="#ffffff" strokeWidth={22} fill="none" strokeLinejoin="round" strokeDasharray={`${harden * 1000} 2000`} opacity={0.95 * harden} />
      {water > 0 && [...Array(4)].map((_, i) => <path key={i} d={`M${X - 30 + i * 12} ${Y - H / 2 - 120 + ((f * 6 + i * 30) % 120)} q -12 20 0 30 q 12 -10 0 -30`} fill={WATER} opacity={(1 - harden)} />)}
      {steps.map(([n, t, at], i) => {
        const p = pop(f, at as number, 10);
        return (
          <g key={i} opacity={clamp01(p)} transform={`translate(${i % 2 ? 560 : 60} ${420 + (i > 1 ? 1000 : 0) - (i > 1 ? 0 : 0)})`}>
            <rect width={460} height={96} rx={48} fill={i === 3 ? GRN : "#ffffff"} stroke={INKC} strokeWidth={6} />
            <circle cx={48} cy={48} r={34} fill={YEL} stroke={INKC} strokeWidth={5} />
            <text x={48} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={INKC}>{n}</text>
            <text x={270} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={t.length > 8 ? 30 : 40} fill={i === 3 ? "#ffffff" : INKC}>{t}</text>
          </g>
        );
      })}
      {f >= F.heals && <Stamp f={f} at={F.heals} x={540} y={1010} text="SELF-HEALING" hue={GRN} fs={84} rot={-7} />}
    </g>
  );
};
const S8_NoWay: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Site f={f} />
    <Duo f={f} y={1500} aMood="surprised" />
    <Bubble f={f} from={F.noway} to={F.nowayEnd} x={380} y={820} lines={["NO WAY!"]} tx={260} ty={1040} fs={100} />
  </g>
);
/** 9: Roman harbor wall + seawater + volcanic ash → crystals → stronger. */
const S9_Harbor: React.FC<{ f: number }> = ({ f }) => {
  const grow = eio(ramp(f, F.grows - 6, F.stronger + 20));
  const str = eio(ramp(f, F.stronger - 4, F.time + 30));
  return (
    <g>
      <Sun f={f} top="#ffc58a" bot="#ffe8c8" />
      {/* Vesuvius-like volcano far away */}
      <path d="M-40 980 L220 640 L300 660 L560 980 Z" fill="#8a6a5a" stroke={INKC} strokeWidth={6} opacity={0.9} />
      {[0, 1, 2].map((i) => <circle key={i} cx={260 + i * 30 + Math.sin(f * 0.05 + i) * 10} cy={600 - i * 50 - ((f * 0.6) % 40)} r={34 + i * 10} fill="#9a9a9a" opacity={0.5} />)}
      <Waves f={f} y={1000} color={SEA} />
      <Waves f={f + 40} y={1040} color={mix(SEA, "#ffffff", 0.15)} amp={12} />
      {/* harbor wall */}
      <g transform="translate(560 0)">
        <rect x={0} y={760} width={520} height={900} fill={STONE} stroke={INKC} strokeWidth={8} />
        {[...Array(7)].map((_, r) => [...Array(4)].map((_, c) => <rect key={r + "-" + c} x={(r % 2 ? -60 : 0) + c * 140} y={760 + r * 120} width={140} height={120} fill="none" stroke={STONE2} strokeWidth={4} />))}
        {/* growing crystals inside */}
        {[...Array(16)].map((_, i) => {
          const q = clamp01(grow * 1.4 - rnd("cg" + i) * 0.4);
          const cx = 60 + rnd("cx" + i) * 400, cy = 1080 + rnd("cy" + i) * 500, s = 26 * q;
          return q > 0 ? <path key={i} d={`M${cx} ${cy - s * 1.6} L${cx + s * 0.6} ${cy} L${cx} ${cy + s * 0.8} L${cx - s * 0.6} ${cy} Z`} fill={CRYST} stroke={INKC} strokeWidth={3} opacity={0.95} /> : null;
        })}
      </g>
      <text x={300} y={440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={INKC} opacity={pop(f, F.harbor, 10)}>ROMAN HARBOR</text>
      <Chip x={270} y={1180} w={340} label="SEAWATER" hue={SEA} p={pop(f, F.seawater, 10)} fs={38} />
      <Chip x={270} y={1290} w={400} label="+ VOLCANIC ASH" hue="#6b5a50" p={pop(f, F.ash, 10)} fs={34} />
      <Chip x={270} y={1400} w={400} label="= NEW CRYSTALS" hue="#1aa3b8" p={pop(f, F.grows, 10)} fs={34} />
      {f >= F.stronger - 4 && (
        <g>
          <rect x={620} y={420} width={400} height={64} rx={32} fill="#ffffff" stroke={INKC} strokeWidth={6} />
          <rect x={628} y={428} width={384 * (0.3 + 0.7 * str)} height={48} rx={24} fill={GRN} />
          <text x={820} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>STRENGTH</text>
        </g>
      )}
      {f >= F.time && <Stamp f={f} at={F.time} x={540} y={680} text="STRONGER OVER TIME" hue={GRN} fs={60} rot={-6} />}
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Sun f={f} />
    <g opacity={0.5}><Pantheon x={540} y={760} s={0.55} /></g>
    <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#c9a77a" />
    <Outro f={f} at={F.sub} light />
    <g transform="translate(180 1520) scale(0.85)"><Person d={ENG} f={f} seed={8} talk={hostTalk(f)} wave={1} mood="happy" /></g>
    <g transform="translate(900 1520) scale(0.85)"><Person d={MECH} f={f} seed={26} talk={0} wave={1} mood="happy" /></g>
  </g>
);

export const ConcreteFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.look, render: () => <S1_Ask f={f} />, cam: [[0, { x: 440, y: 1020, z: 1.16 }], [F.askEnd, { x: 480, y: 1000, z: 1.12 }], [F.look, { x: 520, y: 1000, z: 1.08 }]] },
    { from: F.look, to: F.its, tr: "whip", render: () => <S2_Pantheon f={f} />, cam: [[F.look, { x: 540, y: 1150, z: 1.3 }], [F.dome, { x: 540, y: 820, z: 1.15 }], [F.its, { x: 540, y: 1000, z: 1.0 }]] },
    { from: F.its, to: F.andQ, tr: "cut", render: () => <S2_Pantheon f={f} />, cam: [[F.its, { x: 540, y: 1200, z: 1.12 }], [F.largest, { x: 540, y: 1150, z: 1.04 }], [F.andQ, { x: 540, y: 1100, z: 1.1 }]] },
    { from: F.andQ, to: F.lot, tr: "push", render: () => <S4_Know f={f} />, cam: [[F.andQ, { x: 440, y: 1000, z: 1.16 }], [F.lot, { x: 480, y: 1000, z: 1.12 }]] },
    { from: F.lot, to: F.know, tr: "wipe", render: () => <S4b_Crack f={f} />, cam: [[F.lot, { x: 540, y: 700, z: 1.15 }], [F.hundred, { x: 540, y: 960, z: 1.02 }], [F.know, { x: 540, y: 1000, z: 1.1, r: 2 }]] },
    { from: F.know, to: F.y2023, tr: "spin", render: () => <S4_Know f={f} />, cam: [[F.know, { x: 440, y: 1000, z: 1.16 }], [F.y2023, { x: 480, y: 1000, z: 1.1 }]] },
    { from: F.y2023, to: F.tiny, tr: "flash", render: () => <S5_MIT f={f} />, cam: [[F.y2023, { x: 540, y: 420, z: 1.3 }], [F.mit, { x: 540, y: 600, z: 1.15 }], [F.tiny, { x: 540, y: 900, z: 1.05 }]] },
    { from: F.tiny, to: F.lumpsQ, tr: "zoom", render: () => <S5_MIT f={f} />, cam: [[F.tiny, { x: 400, y: 1050, z: 1.3 }], [F.lumps, { x: 600, y: 1080, z: 1.2 }], [F.lumpsQ, { x: 540, y: 1150, z: 1.06 }]] },
    { from: F.lumpsQ, to: F.crack - 30, tr: "whipUp", render: () => <S6_Mistake f={f} />, cam: [[F.lumpsQ, { x: 440, y: 1000, z: 1.18 }], [F.everyone, { x: 520, y: 960, z: 1.08 }], [F.crack - 30, { x: 540, y: 960, z: 1.12 }]] },
    { from: F.crack - 30, to: F.and2, tr: "iris", render: () => <S7_Heal f={f} />, cam: [[F.crack - 30, { x: 540, y: 960, z: 1.0 }], [F.water, { x: 540, y: 900, z: 1.06 }], [F.dissolve, { x: 540, y: 1000, z: 1.08 }], [F.and2, { x: 540, y: 1000, z: 1.1 }]] },
    { from: F.and2, to: F.noway, tr: "cut", render: () => <S7_Heal f={f} />, cam: [[F.and2, { x: 540, y: 960, z: 1.06 }], [F.filling, { x: 540, y: 960, z: 1.04 }], [F.noway, { x: 540, y: 1000, z: 1.1 }]] },
    { from: F.noway, to: F.harbor, tr: "zoom", render: () => <S8_NoWay f={f} />, cam: [[F.noway, { x: 470, y: 1020, z: 1.14 }], [F.harbor, { x: 490, y: 1020, z: 1.1 }]] },
    { from: F.harbor, to: F.seawater, tr: "whip", render: () => <S9_Harbor f={f} />, cam: [[F.harbor, { x: 480, y: 700, z: 1.12 }], [F.seawater, { x: 560, y: 900, z: 1.04 }]] },
    { from: F.seawater, to: F.their, tr: "cut", render: () => <S9_Harbor f={f} />, cam: [[F.seawater, { x: 480, y: 1150, z: 1.1 }], [F.ash, { x: 480, y: 1100, z: 1.08 }], [F.grows, { x: 560, y: 1200, z: 1.08 }], [F.their, { x: 560, y: 1100, z: 1.05 }]] },
    { from: F.their, to: F.sub, tr: "flash", render: () => <S9_Harbor f={f} />, cam: [[F.their, { x: 600, y: 700, z: 1.15 }], [F.time, { x: 540, y: 800, z: 1.02 }], [F.sub, { x: 540, y: 820, z: 1.06 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "push", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.nineteen, 0.1], [F.largest, 0.08], [F.hundred, 0.12], [F.y2023, 0.12], [F.lumps, 0.1], [F.crack, 0.1], [F.heals, 0.14], [F.noway, 0.12], [F.stronger, 0.1], [F.time, 0.12]];
  const SHAKE: [number, number][] = [[F.hundred + 4, 12], [F.crack, 10], [F.heals, 8], [F.time, 10]];
  const SFX: Cue[] = [
    [F.ask - 2, "pop", 0.4], [F.pantheon, "pop", 0.3], [F.nineteen - 10, "riser", 0.3], [F.largest, "boom", 0.35],
    [F.andQ - 2, "pop", 0.4], [F.cracking - 10, "riser_dark", 0.3], [F.hundred + 4, "impact", 0.5],
    [F.know - 2, "pop", 0.4], [F.y2023, "impact", 0.35], [F.mit, "pop", 0.35], [F.secret - 6, "whoosh", 0.3], [F.lumps, "pop", 0.4],
    [F.lumpsQ - 2, "pop", 0.45], [F.everyone, "pop", 0.3], [F.crack, "impact", 0.45], [F.water, "pop", 0.35], [F.dissolve, "pop", 0.35], [F.filling, "pop", 0.35], [F.heals, "boom", 0.45],
    [F.noway - 2, "pop", 0.45], [F.seawater, "pop", 0.35], [F.ash, "pop", 0.35], [F.grows, "pop", 0.35], [F.stronger - 4, "riser", 0.3], [F.time, "impact", 0.45],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light />
        <Cover f={f} word="CONCRETE" sub="THAT HEALS ITSELF" until={F.look - 8} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={TERRA} theme={f >= F.harbor && f < F.sub ? "dark" : "light"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="concrete" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
