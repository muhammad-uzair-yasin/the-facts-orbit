import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Drift, Outro, Cursor, countUp, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor, speaking } from "./factkit";
import { Person, CAST, PersonDef } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (phrase starts from sents.json)
const F = {
  hook: 17, spot: 94, one: 143, foot: 166, ask1: 217, y1966: 282, only17: 476, but: 535, s76: 625, smallYes: 682, bigYes: 725,
  two: 769, face: 793, huge: 836, then: 911, ok: 981, howAbout: 1022, y1975: 1082, alone17: 1215, after: 1291, f50: 1389,
  three: 1447, gift: 1472, soda: 1516, strings: 1562, y1971: 1618, small: 1834, debt: 1874, so: 1938, free: 2015, pause: 2069, choice: 2094, sub: 2178,
};
const NOIR0 = "#141726", NOIR1 = "#22263a", LAMP = "#ffd98a", RED = "#e4473b", TEAL = "#1aa39a", GOLD = "#ffc94a", PAPER = "#efe4c8", INKD = "#1b1b24";
const GROUND = 1380;
const HOST = CAST[3], GUEST = CAST[17], HOME = CAST[25], STU = CAST[22];

const Char: React.FC<{ d: PersonDef; f: number; seed: number; x: number; y?: number; s?: number; flip?: boolean; who?: string; wave?: number; mood?: "happy" | "neutral" | "surprised" }> = ({ d, f, seed, x, y = GROUND, s = 1, flip, who, wave = 0, mood }) => {
  const talk = who ? talkFor(f, who, SPK, ENV) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <Person d={d} f={f} seed={seed} talk={talk} wave={wave} mood={mood ?? "happy"} />
    </g>
  );
};
const hostTalking = (f: number) => speaking(f, "host", SPK);
const guestTalking = (f: number) => speaking(f, "guest", SPK);

// ---------- sets ----------
const Office: React.FC<{ f: number; lamp?: number }> = ({ f, lamp = 1 }) => (
  <g>
    <rect width={VW} height={VH} fill={NOIR0} />
    {[...Array(14)].map((_, i) => <rect key={i} x={0} y={i * 140} width={VW} height={70} fill={NOIR1} opacity={0.35} />)}
    {/* window blinds shadow */}
    {[...Array(8)].map((_, i) => <rect key={i} x={620} y={260 + i * 46} width={380} height={20} fill={LAMP} opacity={0.06 * lamp} transform="skewX(-14)" />)}
    <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#0d0f19" />
    <path d={`M540 0 L180 ${GROUND} H900 Z`} fill={LAMP} opacity={0.07 * lamp} />
    <ellipse cx={540} cy={GROUND + 10} rx={420} ry={60} fill={LAMP} opacity={0.08 * lamp} />
    <Drift f={f} n={26} color={LAMP} seed="dust3" maxR={2.4} speed={0.2} opacity={0.35} />
  </g>
);
const Board: React.FC<{ f: number; x: number; y: number; at: number }> = ({ f, x, y, at }) => {
  const cards = [[80, 90, "1"], [300, 60, "2"], [190, 260, "3"]] as const;
  const string = clamp01((f - at - 10) / 40);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={420} height={380} rx={10} fill="#6b4a2b" stroke={INKD} strokeWidth={8} />
      <rect x={14} y={14} width={392} height={352} fill="#b98a55" />
      {cards.map(([cx, cy, n], i) => (
        <g key={n} opacity={pop(f, at + i * 8, 10)} transform={`translate(${cx} ${cy}) rotate(${(i - 1) * 6})`}>
          <rect x={-56} y={-40} width={112} height={92} fill={PAPER} stroke={INKD} strokeWidth={4} />
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={RED}>{n}</text>
          <circle cy={-36} r={8} fill={RED} />
        </g>
      ))}
      <polyline points={`80,58 ${lerp(80, 300, string)},${lerp(58, 28, string)}`} stroke={RED} strokeWidth={4} fill="none" />
      {string > 0.5 && <polyline points={`300,28 ${lerp(300, 190, (string - 0.5) * 2)},${lerp(28, 228, (string - 0.5) * 2)}`} stroke={RED} strokeWidth={4} fill="none" />}
      <text x={210} y={358} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INKD} letterSpacing={4}>CASE: SAY YES</text>
    </g>
  );
};
const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={-400} x2={0} y2={-60} stroke="#333" strokeWidth={6} />
    <path d="M-70 -60 Q0 -110 70 -60 L50 -40 H-50 Z" fill="#2a6b4a" stroke={INKD} strokeWidth={5} />
    <ellipse cx={0} cy={-40} rx={46} ry={10} fill={LAMP} />
  </g>
);
const TrickTag: React.FC<{ f: number; at: number; n: number; name: string; hue: string }> = ({ f, at, n, name, hue }) => (
  <g>
    <Chip x={540} y={330} w={300} label={`TRICK ${n}/3`} hue={hue} p={pop(f, at, 10)} fs={38} />
    <g opacity={eout(ramp(f, at + 14, at + 26))} transform={`translate(${lerp(-300, 0, eout(ramp(f, at + 14, at + 26)))} 0)`}>
      <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={name.length > 18 ? 66 : 78} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke">{name}</text>
    </g>
  </g>
);
const Bars: React.FC<{ f: number; x: number; y: number; atA: number; atB: number; va: number; vb: number; la: string; lb: string; hb: string }> = ({ f, x, y, atA, atB, va, vb, la, lb, hb }) => {
  const H = 560;
  const pa = eout(ramp(f, atA, atA + 22)), pb = eout(ramp(f, atB, atB + 26));
  return (
    <g transform={`translate(${x} ${y})`} opacity={eout(ramp(f, atA - 24, atA - 4))}>
      <rect x={-40} y={-H - 60} width={600} height={H + 140} rx={24} fill="#0f1220" opacity={0.75} stroke="#3a3f5c" strokeWidth={3} />
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} y1={-H * g} x2={520} y2={-H * g} stroke="#3a3f5c" strokeWidth={2} strokeDasharray="8 10" />)}
      <line x1={0} y1={0} x2={520} y2={0} stroke="#cfd3e6" strokeWidth={4} />
      {f >= atA && (
        <g>
          <rect x={50} y={-H * va * pa} width={170} height={H * va * pa} rx={10} fill="#8a8fa8" />
          <text x={135} y={-H * va * pa - 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#fff">{Math.round(va * 100 * pa)}%</text>
          <text x={135} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#cfd3e6">{la}</text>
        </g>
      )}
      {f >= atB && (
        <g>
          <rect x={300} y={-H * vb * pb} width={170} height={H * vb * pb} rx={10} fill={hb} />
          <text x={385} y={-H * vb * pb - 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={hb} stroke={INKC} strokeWidth={6} paintOrder="stroke">{Math.round(vb * 100 * pb)}%</text>
          <text x={385} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#fff">{lb}</text>
        </g>
      )}
    </g>
  );
};
const House: React.FC<{ x: number; y: number; doorOpen?: number }> = ({ x, y, doorOpen = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={-420} width={520} height={420} fill="#c9b08a" stroke={INKD} strokeWidth={8} />
    <path d="M-300 -410 L0 -620 L300 -410 Z" fill="#7a3a2a" stroke={INKD} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-80} y={-280} width={160} height={280} fill="#2a1a12" stroke={INKD} strokeWidth={6} />
    <g transform={`translate(-80 0) scale(${1 - doorOpen * 0.75} 1)`}><rect x={0} y={-280} width={160} height={280} fill="#8a3a2a" stroke={INKD} strokeWidth={6} /><circle cx={130} cy={-140} r={9} fill={GOLD} /></g>
    <rect x={-220} y={-330} width={110} height={100} fill="#ffe7a8" stroke={INKD} strokeWidth={6} />
    <rect x={110} y={-330} width={110} height={100} fill="#ffe7a8" stroke={INKD} strokeWidth={6} />
  </g>
);

// ---------- shots ----------
const S1_Case: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} />
    <Board f={f} x={330} y={520} at={40} />
    <Lamp x={540} y={GROUND - 10} />
    <rect x={120} y={GROUND - 60} width={840} height={60} rx={8} fill="#3a2a1c" stroke={INKD} strokeWidth={6} />
    <Char d={HOST} f={f} seed={4} x={300} y={GROUND} s={1.08} who="host" mood={f >= F.spot ? "neutral" : "happy"} />
    <Char d={GUEST} f={f} seed={18} x={800} y={GROUND} s={1.08} flip mood="happy" />
    {f >= F.spot && <Chip x={540} y={980} w={460} label="HOW TO SPOT THEM" hue={RED} p={pop(f, F.spot + 6, 10)} fs={36} />}
  </g>
);
const S2_Door: React.FC<{ f: number }> = ({ f }) => {
  const open = eio(ramp(f, F.foot + 10, F.foot + 30));
  const sign = pop(f, F.ask1 + 10, 12);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1d2a44" />
      <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#2f5a2f" />
      <House x={330} y={GROUND} doorOpen={open} />
      <TrickTag f={f} at={F.one} n={1} name="FOOT IN THE DOOR" hue={TEAL} />
      <Char d={HOME} f={f} seed={26} x={260} y={GROUND} s={0.8} mood={f >= F.ask1 + 20 ? "neutral" : "happy"} />
      <Char d={GUEST} f={f} seed={18} x={800} y={GROUND} s={0.95} flip who="guest" />
      {f >= F.ask1 + 10 && (
        <g transform={`translate(640 ${GROUND - 330}) scale(${sign}) rotate(-6)`}>
          <rect x={-60} y={-40} width={120} height={80} rx={6} fill="#fff" stroke={INKD} strokeWidth={4} />
          <text y={-4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={18} fill={INKD}>BE A SAFE</text>
          <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={18} fill={INKD}>DRIVER</text>
        </g>
      )}
      {f >= F.ask1 + 20 && <Chip x={640} y={GROUND - 440} w={220} label="TINY ASK" hue={TEAL} p={pop(f, F.ask1 + 24, 10)} fs={32} />}
    </g>
  );
};
const S3_Study1: React.FC<{ f: number }> = ({ f }) => {
  const bigSign = pop(f, F.y1966 + 60, 14);
  return (
    <g>
      <rect width={VW} height={VH} fill={NOIR0} />
      <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#2a4a2a" />
      <g opacity={1 - ramp(f, F.only17 - 30, F.only17 - 10)}><BigNum f={f} at={F.y1966} text="1966" x={540} y={330} hue={GOLD} fs={130} /></g>
      {/* big ugly lawn sign on the left */}
      <g transform={`translate(300 ${GROUND}) scale(${bigSign * 0.82})`}>
        <rect x={-14} y={-360} width={28} height={360} fill="#6b4a2b" stroke={INKD} strokeWidth={5} />
        <rect x={-200} y={-560} width={400} height={230} rx={8} fill="#f2e8a8" stroke={INKD} strokeWidth={8} transform="rotate(-4)" />
        <text x={0} y={-460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED} transform="rotate(-4)">DRIVE</text>
        <text x={0} y={-394} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={RED} transform="rotate(-4)">CAREFULLY</text>
      </g>
      {f >= F.y1966 + 80 && <Chip x={300} y={GROUND - 540} w={300} label="BIG, UGLY SIGN" hue={RED} p={pop(f, F.y1966 + 84, 10)} fs={30} />}
      <Bars f={f} x={520} y={GROUND - 30} atA={F.only17} atB={F.s76} va={0.17} vb={0.76} la="ASKED COLD" lb="TINY SIGN FIRST" hb={TEAL} />
      {f >= F.smallYes && (
        <g>
          <Chip x={330} y={480} w={330} label="SMALL YES FIRST" hue="#5a6280" p={pop(f, F.smallYes, 10)} fs={32} />
          <Chip x={780} y={480} w={320} label="BIG YES LATER" hue={TEAL} p={pop(f, F.bigYes, 10)} fs={32} />
          <path d="M480 480 H600" stroke="#fff" strokeWidth={6} markerEnd="url(#arrM)" opacity={pop(f, F.bigYes, 8)} />
        </g>
      )}
    </g>
  );
};
const S4_Face: React.FC<{ f: number }> = ({ f }) => {
  const card = pop(f, F.huge, 14);
  const slam = eio(ramp(f, F.huge + 34, F.huge + 44));
  const ticket = pop(f, F.howAbout + 6, 14);
  return (
    <g>
      <Office f={f} lamp={0.8} />
      <TrickTag f={f} at={F.two} n={2} name="DOOR IN THE FACE" hue={RED} />
      {/* door that slams */}
      <g transform={`translate(330 ${GROUND})`}>
        <rect x={-150} y={-560} width={300} height={560} fill="#2a1a12" stroke={INKD} strokeWidth={8} />
        <g transform={`translate(-150 0) scale(${lerp(0.15, 1, slam)} 1)`}><rect x={0} y={-560} width={300} height={560} fill="#8a3a2a" stroke={INKD} strokeWidth={8} /><circle cx={260} cy={-280} r={12} fill={GOLD} /></g>
        {slam >= 1 && f < F.huge + 60 && <text x={0} y={-600} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#fff" stroke={INKC} strokeWidth={10} paintOrder="stroke">SLAM!</text>}
      </g>
      {f >= F.huge && f < F.huge + 44 && (
        <g transform={`translate(440 ${GROUND - 360}) scale(${card}) rotate(-5)`} opacity={1 - slam}>
          <rect x={-170} y={-90} width={340} height={180} rx={12} fill={PAPER} stroke={INKD} strokeWidth={6} />
          <text y={-26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={RED}>2-YEAR</text>
          <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKD}>VOLUNTEER JOB</text>
          <text y={62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#555">2 hrs/week · 2 years</text>
        </g>
      )}
      {f >= F.then && <Chip x={540} y={600} w={460} label="THE REAL REQUEST" hue={GOLD} p={pop(f, F.then + 10, 10)} fs={32} textColor={INKC} />}
      {f >= F.howAbout + 6 && (
        <g transform={`translate(600 ${GROUND - 420}) scale(${ticket}) rotate(${4 + Math.sin(f * 0.1) * 2})`}>
          <rect x={-110} y={-56} width={220} height={112} rx={10} fill="#ffcf3a" stroke={INKD} strokeWidth={5} />
          <circle cx={-110} cy={0} r={16} fill={NOIR0} /><circle cx={110} cy={0} r={16} fill={NOIR0} />
          <text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKD}>ZOO TRIP</text>
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={INKD}>JUST 1 AFTERNOON</text>
        </g>
      )}
      <Char d={GUEST} f={f} seed={18} x={830} y={GROUND} s={0.95} flip who="guest" mood={guestTalking(f) ? "happy" : f > F.huge + 40 && f < F.ok ? "surprised" : "happy"} />
    </g>
  );
};
const S5_Study2: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#16213f" />
    {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 170} x2={VW} y2={i * 170} stroke="#22305a" strokeWidth={2} />)}
    <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#0f1730" />
    <g opacity={1 - ramp(f, F.alone17 - 30, F.alone17 - 10)}><BigNum f={f} at={F.y1975} text="1975" x={540} y={320} hue={GOLD} fs={130} /></g>
    <g opacity={pop(f, F.y1975 + 20, 12)}>
      {[...Array(8)].map((_, i) => (
        <g key={i} transform={`translate(${200 + i * 95} ${470 + (i % 2) * 18 + Math.sin(f * 0.2 + i) * 4})`}>
          <circle r={18} fill="#fbe0c8" stroke={INKD} strokeWidth={3} />
          <rect x={-14} y={18} width={28} height={30} rx={8} fill={["#e4473b", "#3d6ccf", "#ffcf3a", "#3ddc97"][i % 4]} stroke={INKD} strokeWidth={3} />
        </g>
      ))}
      <text x={540} y={580} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#cfd3e6" letterSpacing={3}>TAKE KIDS TO THE ZOO?</text>
    </g>
    <Bars f={f} x={270} y={GROUND - 40} atA={F.alone17} atB={F.f50} va={0.17} vb={0.5} la="ASKED ALONE" lb="AFTER A BIG NO" hb={RED} />
  </g>
);
const S6_Gift: React.FC<{ f: number }> = ({ f }) => {
  const slide = eout(ramp(f, F.soda + 4, F.soda + 30));
  return (
    <g>
      <Office f={f} />
      <TrickTag f={f} at={F.three} n={3} name="THE FREE GIFT" hue={GOLD} />
      <rect x={120} y={GROUND - 60} width={840} height={60} rx={8} fill="#3a2a1c" stroke={INKD} strokeWidth={6} />
      <Char d={STU} f={f} seed={23} x={290} y={GROUND} s={1.08} mood={f > F.strings ? "surprised" : "happy"} />
      <Char d={GUEST} f={f} seed={18} x={830} y={GROUND} s={1.12} flip who="guest" />
      {f >= F.soda && (
        <g transform={`translate(${lerp(700, 430, slide)} ${GROUND - 120}) scale(1.6)`}>
          <rect x={-34} y={-90} width={68} height={100} rx={12} fill={RED} stroke={INKD} strokeWidth={5} />
          <rect x={-34} y={-58} width={68} height={30} fill="#fff" opacity={0.9} />
          <text y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={18} fill={RED}>FREE</text>
          <ellipse cy={-90} rx={34} ry={8} fill="#ccc" stroke={INKD} strokeWidth={4} />
        </g>
      )}
      {f >= F.strings && <Chip x={600} y={620} w={420} label='"NO STRINGS"' hue={GOLD} p={pop(f, F.strings, 10)} fs={36} textColor={INKC} />}
      {f >= F.strings + 20 && [...Array(4)].map((_, i) => (
        <path key={i} d={`M${560 + i * 30} 660 q ${10 + i * 6} ${80} ${-10 + i * 4} ${180}`} stroke="#fff" strokeWidth={3} fill="none" strokeDasharray="10 8" opacity={0.6 * clamp01((f - F.strings - 20 - i * 5) / 10)} />
      ))}
    </g>
  );
};
const S7_Debt: React.FC<{ f: number }> = ({ f }) => {
  const n = 1 + Math.min(1, countUp(f, F.y1971 + 90, F.y1971 + 170, 100) / 100);
  const tickets = Math.round(lerp(4, 8, clamp01((f - F.y1971 - 90) / 80)));
  const drop = eout(ramp(f, F.debt + 6, F.debt + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill="#1a1626" />
      <rect x={0} y={GROUND} width={VW} height={VH - GROUND} fill="#110e1a" />
      <g opacity={1 - ramp(f, F.y1971 + 70, F.y1971 + 90)}><BigNum f={f} at={F.y1971} text="1971" x={540} y={320} hue={GOLD} fs={130} /></g>
      <g transform={`translate(330 ${GROUND - 200})`}>
        {[...Array(tickets)].map((_, i) => (
          <g key={i} transform={`translate(${(i % 2) * 14 - 7} ${-i * 46}) rotate(${(i % 3 - 1) * 3})`} opacity={clamp01((f - F.y1971 - 20 - i * 10) / 10)}>
            <rect x={-110} y={-22} width={220} height={44} rx={6} fill="#ffcf3a" stroke={INKD} strokeWidth={4} />
            <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={INKD}>RAFFLE TICKET</text>
          </g>
        ))}
      </g>
      {f >= F.y1971 + 90 && <BigNum f={f} at={F.y1971 + 90} text={`×${n.toFixed(1)}`} x={330} y={GROUND - 640} hue={GOLD} fs={120} />}
      <text x={330} y={GROUND - 100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#cfd3e6" opacity={pop(f, F.y1971 + 100, 10)}>TICKETS BOUGHT</text>
      {/* the weight of debt */}
      {f >= F.small && (
        <g transform={`translate(780 ${lerp(500, GROUND - 260, drop)})`}>
          <path d="M-120 0 L120 0 L90 180 H-90 Z" fill="#3a3f5c" stroke={INKD} strokeWidth={8} />
          <path d="M-50 0 Q0 -70 50 0" stroke="#3a3f5c" strokeWidth={22} fill="none" />
          <text y={120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#fff">DEBT</text>
        </g>
      )}
      {f >= F.small && <g transform={`translate(780 ${GROUND - 60})`} opacity={pop(f, F.small, 10)}><rect x={-30} y={-40} width={60} height={50} rx={10} fill={RED} stroke={INKD} strokeWidth={4} /><text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={14} fill="#fff">SODA</text></g>}
    </g>
  );
};
const S8_Phone: React.FC<{ f: number }> = ({ f }) => {
  const rows = [["Small ask → big ask", F.so + 10], ["Huge ask → small ask", F.so + 40], ["Free gift → favour", F.free + 6]] as const;
  const pressed = f >= F.pause + 8 && f < F.pause + 18;
  return (
    <g>
      <rect width={VW} height={VH} fill="#0e1424" />
      <Drift f={f} n={30} color="#5ac8fa" seed="ph" maxR={2} speed={0.3} opacity={0.3} />
      <g transform="translate(540 820)">
        <rect x={-300} y={-560} width={600} height={1060} rx={64} fill="#11141f" stroke="#cfd3e6" strokeWidth={8} />
        <rect x={-270} y={-520} width={540} height={980} rx={40} fill="#f4f6fb" />
        <rect x={-70} y={-548} width={140} height={22} rx={11} fill="#11141f" />
        <text x={0} y={-440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKD}>RED FLAG CHECK</text>
        {rows.map(([label, at], i) => {
          const p = pop(f, at as number, 10), tick = clamp01((f - (at as number) - 8) / 8);
          return (
            <g key={i} opacity={clamp01(p)} transform={`translate(0 ${-330 + i * 150})`}>
              <rect x={-240} y={-55} width={480} height={110} rx={20} fill="#fff" stroke="#dde2ee" strokeWidth={4} />
              <path d="M-200 -24 V26 M-200 -24 L-160 -12 L-200 0" stroke={RED} strokeWidth={8} fill={RED} strokeLinejoin="round" />
              <text x={-140} y={11} fontFamily={FONT} fontWeight={800} fontSize={27} fill={INKD}>{label}</text>
              <circle cx={200} cy={0} r={22} fill={tick > 0.5 ? RED : "#eee"} stroke={INKD} strokeWidth={3} />
              {tick > 0.5 && <path d="M188 0 L198 10 L214 -10" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />}
            </g>
          );
        })}
        <g transform={`translate(0 ${200}) scale(${pressed ? 0.94 : pop(f, F.pause - 6, 10)})`}>
          <rect x={-200} y={-60} width={400} height={120} rx={60} fill={pressed || f >= F.pause + 18 ? "#3a3f5c" : TEAL} />
          <rect x={-70} y={-24} width={18} height={48} rx={4} fill="#fff" /><rect x={-40} y={-24} width={18} height={48} rx={4} fill="#fff" />
          <text x={20} y={14} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">PAUSE</text>
        </g>
        {f >= F.choice && <text x={0} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={RED} opacity={pop(f, F.choice + 10, 12)}>IS THIS MY CHOICE?</text>}
      </g>
      {f >= F.pause - 20 && <Cursor x={lerp(920, 600, eio(ramp(f, F.pause - 20, F.pause + 6)))} y={lerp(1500, 1040, eio(ramp(f, F.pause - 20, F.pause + 6)))} f={f} clickAt={F.pause + 8} />}
    </g>
  );
};
const S8b_Detective: React.FC<{ f: number }> = ({ f }) => null;
const S9_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Office f={f} />
    <Board f={f} x={330} y={360} at={F.sub - 60} />
    <Stamp f={f} at={F.sub - 10} x={540} y={560} text="CASE CLOSED" hue={RED} fs={70} />
    <rect width={VW} height={VH} fill="#000" opacity={0.2} />
    <Outro f={f} at={F.sub} />
    <Char d={HOST} f={f} seed={4} x={190} y={GROUND} s={0.8} who="host" wave={f > F.sub + 40 ? 1 : 0} />
  </g>
);

export const ManipulationFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.one, render: () => <S1_Case f={f} />, cam: [[0, { x: 540, y: 760, z: 1.35 }], [70, { x: 540, y: 880, z: 1.12 }], [F.spot, { x: 640, y: 980, z: 1.18, r: -1 }], [F.one, { x: 540, y: 1000, z: 1.08 }]] },
    { from: F.one, to: F.y1966, tr: "whip", render: () => <S2_Door f={f} />, cam: [[F.one, { x: 540, y: 520, z: 1.2 }], [F.ask1 - 10, { x: 420, y: 1000, z: 1.12 }], [F.y1966, { x: 640, y: 1040, z: 1.2 }]] },
    { from: F.y1966, to: F.two, tr: "iris", render: () => <S3_Study1 f={f} />, cam: [[F.y1966, { x: 540, y: 420, z: 1.2 }], [F.y1966 + 90, { x: 300, y: 1000, z: 1.15 }], [F.only17 - 10, { x: 620, y: 1050, z: 1.12 }], [F.s76 + 30, { x: 620, y: 1000, z: 1.1 }], [F.two, { x: 540, y: 820, z: 1.02, r: 1 }]] },
    { from: F.two, to: F.y1975, tr: "zoom", render: () => <S4_Face f={f} />, cam: [[F.two, { x: 540, y: 460, z: 1.2 }], [F.huge, { x: 400, y: 1000, z: 1.1 }], [F.huge + 46, { x: 360, y: 980, z: 1.22 }], [F.ok, { x: 700, y: 1020, z: 1.12 }], [F.y1975, { x: 680, y: 960, z: 1.2 }]] },
    { from: F.y1975, to: F.three, tr: "wipe", render: () => <S5_Study2 f={f} />, cam: [[F.y1975, { x: 540, y: 380, z: 1.2 }], [F.alone17 - 10, { x: 540, y: 900, z: 1.06 }], [F.f50 + 20, { x: 640, y: 980, z: 1.14 }], [F.three, { x: 600, y: 960, z: 1.08 }]] },
    { from: F.three, to: F.y1971, tr: "push", render: () => <S6_Gift f={f} />, cam: [[F.three, { x: 540, y: 520, z: 1.18 }], [F.soda, { x: 620, y: 1000, z: 1.1 }], [F.strings + 10, { x: 480, y: 980, z: 1.22, r: -1.5 }], [F.y1971, { x: 520, y: 900, z: 1.15 }]] },
    { from: F.y1971, to: F.so, tr: "whipUp", render: () => <S7_Debt f={f} />, cam: [[F.y1971, { x: 540, y: 380, z: 1.2 }], [F.y1971 + 100, { x: 360, y: 900, z: 1.12 }], [F.small, { x: 600, y: 980, z: 1.06 }], [F.debt + 20, { x: 620, y: 1040, z: 1.14 }], [F.so, { x: 580, y: 1000, z: 1.1 }]] },
    { from: F.so, to: F.sub, tr: "flash", render: () => <S8_Phone f={f} />, cam: [[F.so, { x: 540, y: 520, z: 1.2 }], [F.free + 20, { x: 540, y: 760, z: 1.06 }], [F.pause, { x: 560, y: 900, z: 1.12 }], [F.choice + 20, { x: 540, y: 950, z: 1.08 }], [F.sub, { x: 540, y: 960, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "spin", render: () => <S9_Outro f={f} />, cam: [[F.sub, { x: 540, y: 960, z: 1.12 }], [TOTAL, { x: 540, y: 980, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.only17, 0.07], [F.s76, 0.15], [F.huge + 40, 0.12], [F.alone17, 0.07], [F.f50, 0.14], [F.y1971 + 90, 0.1], [F.debt + 20, 0.12], [F.pause + 8, 0.08], [F.choice + 10, 0.1]];
  const SHAKE: [number, number][] = [[F.huge + 44, 18], [F.s76, 10], [F.f50, 10], [F.debt + 20, 16]];
  const SFX: Cue[] = [
    [F.spot + 6, "pop", 0.35], [F.one, "pop", 0.4], [F.one + 14, "whoosh", 0.3], [F.ask1 + 10, "pop", 0.4],
    [F.y1966, "impact", 0.4], [F.y1966 + 60, "pop", 0.4], [F.only17, "tick", 0.4], [F.s76 - 60, "riser", 0.25], [F.s76, "impact", 0.5], [F.smallYes, "pop", 0.3], [F.bigYes, "pop", 0.35],
    [F.two, "pop", 0.4], [F.two + 14, "whoosh", 0.3], [F.huge, "pop", 0.35], [F.huge + 42, "boom", 0.4], [F.howAbout + 6, "pop", 0.4],
    [F.y1975, "impact", 0.4], [F.alone17, "tick", 0.4], [F.after, "riser", 0.25], [F.f50, "impact", 0.5],
    [F.three, "pop", 0.4], [F.three + 14, "whoosh", 0.3], [F.soda + 4, "whoosh", 0.3], [F.strings, "pop", 0.35],
    [F.y1971, "impact", 0.4], [F.y1971 + 90, "pop", 0.4], [F.debt + 18, "boom", 0.45],
    [F.so + 10, "tick", 0.5], [F.so + 40, "tick", 0.5], [F.free + 6, "tick", 0.5], [F.pause + 8, "click", 0.6], [F.choice + 10, "impact", 0.4],
    [F.sub - 10, "impact", 0.4], [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = guestTalking(f) ? GOLD : f < F.two ? TEAL : f < F.three ? RED : YEL;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <svg width={0} height={0} style={{ position: "absolute" }}><defs><marker id="arrM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#fff" /></marker></defs></svg>
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} />
        <Cover f={f} word="SAY YES?" sub="3 TRICKS · HOW TO SPOT THEM" until={F.one - 10} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme="dark" hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="manipulation" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
