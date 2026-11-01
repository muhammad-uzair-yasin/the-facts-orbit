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
  const december = at("December"), y1945 = at("1945.", december), five = at("Five", y1945), florida = at("Florida", five), never = at("never", florida);
  const vanished = at("They", never + 10), radioed = at("radioed", vanished), compasses = at("compasses", radioed), failed = at("failed.", compasses);
  const thought = at("thought", failed), keys = at("Keys...", thought), wrong = at("wrong", keys), ocean = at("ocean.", wrong);
  const rescue = at("And", ocean), did = at("It", rescue), disappeared = at("disappeared", did), ship = at("ship", disappeared), flames = at("flames", ship);
  const creepy = at("Okay,", flames), itis = at("It", creepy), truth = at("But", itis), coast = at("Coast", truth), lloyds = at("Lloyd's", coast), numbers = at("numbers.", lloyds);
  const ships = at("Ships", numbers), vanish = at("vanish", ships), anywhere = at("anywhere", vanish);
  const why = at("So", anywhere), busiest = at("busiest", why), storms = at("storms", busiest), current = at("current.", storms);
  const writer = at("writer", current), y1975 = at("1975,", writer), exaggerated = at("exaggerated...", y1975), sunk = at("sunk", exaggerated), elsewhere = at("else", sunk), sub = at("Subscribe", elsewhere);
  return { december, y1945, five, florida, never, vanished, radioed, compasses, failed, thought, keys, wrong, ocean, rescue, did, disappeared, ship, flames, creepy, itis, truth, coast, lloyds, numbers, ships, vanish, anywhere, why, busiest, storms, current, writer, y1975, exaggerated, sunk, elsewhere, sub };
})();

const TRAV = CAST[15], PILOT = CAST[13], WRITER = CAST[22];
const askTalk = (f: number) => talkFor(f, "asker", SPK, ENV);
const hostTalk = (f: number) => talkFor(f, "host", SPK, ENV);
const SEA = "#0e3a5c", SEA2 = "#0a2a45", LAND = "#d8c58a", NIGHT = "#081426", RED = "#ff4d5e", CYAN = "#5ad1ff", GREEN = "#3ddc97", ORANGE = "#ff8a3d";
// map points (world coords on the map board)
const MIAMI = [250, 760], BERMUDA = [840, 330], PR = [820, 900];
const KEYS = [200, 850];

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

const ASKL = ["THE REAL\nTRUTH?", "JUST\nVANISHED?!", "A RESCUE\nPLANE?", "CREEPY!", "WHY ALL THE\nSTORIES?"];

/** top-down plane icon pointing up (heading 0 = north) */
const PlaneIcon: React.FC<{ x: number; y: number; hd: number; s?: number; c?: string; o?: number }> = ({ x, y, hd, s = 1, c = "#ffffff", o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${hd}) scale(${s})`} opacity={o}>
    <path d="M0 -34 Q6 -30 6 -16 L6 -6 L36 6 L36 14 L6 8 L5 24 L14 30 L14 36 L0 32 L-14 36 L-14 30 L-5 24 L-6 8 L-36 14 L-36 6 L-6 -6 L-6 -16 Q-6 -30 0 -34Z" fill={c} stroke={INKC} strokeWidth={3} strokeLinejoin="round" />
  </g>
);
const MapBoard: React.FC<{ f: number; tri?: number; dim?: number; children?: React.ReactNode }> = ({ f, tri = 1, dim = 0, children }) => {
  const L1 = Math.hypot(BERMUDA[0] - MIAMI[0], BERMUDA[1] - MIAMI[1]), L2 = Math.hypot(PR[0] - BERMUDA[0], PR[1] - BERMUDA[1]), L3 = Math.hypot(MIAMI[0] - PR[0], MIAMI[1] - PR[1]);
  const LT = L1 + L2 + L3;
  return (
    <g transform="translate(540 650) scale(1.1) translate(-540 -610)">
      <rect x={50} y={210} width={980} height={800} rx={24} fill="#3a2a1a" stroke={INKC} strokeWidth={8} />
      <clipPath id="mapclip"><rect x={66} y={226} width={948} height={768} rx={14} /></clipPath>
      <g clipPath="url(#mapclip)">
        <rect x={66} y={226} width={948} height={768} fill={SEA} />
        {[...Array(9)].map((_, i) => <path key={i} d={`M66 ${260 + i * 90} q 60 -14 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`} stroke="#1a4f78" strokeWidth={3} fill="none" opacity={0.6} transform={`translate(${(f * 0.4) % 120 - 60} 0)`} />)}
        {/* Florida + US coast */}
        <path d="M66 226 H420 Q400 300 330 360 Q290 420 300 520 Q300 640 270 740 Q250 800 230 830 Q200 800 190 720 Q170 620 140 560 Q110 520 66 520Z" fill={LAND} stroke={INKC} strokeWidth={5} />
        {/* Florida keys */}
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={KEYS[0] + 30 - i * 26} cy={KEYS[1] + i * 6} rx={12} ry={5} fill={LAND} stroke={INKC} strokeWidth={2} />)}
        {/* Cuba + Hispaniola + Puerto Rico */}
        <path d="M120 930 Q300 880 470 920 Q560 940 600 970 L600 994 H120Z" fill={LAND} stroke={INKC} strokeWidth={5} />
        <path d="M640 940 Q700 915 760 935 L760 994 H640Z" fill={LAND} stroke={INKC} strokeWidth={5} />
        <ellipse cx={PR[0]} cy={PR[1] + 18} rx={38} ry={14} fill={LAND} stroke={INKC} strokeWidth={4} />
        {/* Bahamas */}
        {[...Array(7)].map((_, i) => <ellipse key={i} cx={340 + i * 34} cy={720 + Math.sin(i) * 40 + i * 14} rx={14} ry={6} fill={LAND} stroke={INKC} strokeWidth={2} />)}
        <circle cx={BERMUDA[0]} cy={BERMUDA[1]} r={10} fill={LAND} stroke={INKC} strokeWidth={3} />
        {/* triangle */}
        {tri > 0 && (
          <g>
            <path d={`M${MIAMI[0]} ${MIAMI[1]} L${BERMUDA[0]} ${BERMUDA[1]} L${PR[0]} ${PR[1]} Z`} fill={RED} opacity={0.14 * clamp01(tri * 1.5 - 0.5)} />
            <path d={`M${MIAMI[0]} ${MIAMI[1]} L${BERMUDA[0]} ${BERMUDA[1]} L${PR[0]} ${PR[1]} Z`} fill="none" stroke={RED} strokeWidth={7} strokeDasharray={`${LT * tri} ${LT}`} strokeLinejoin="round" />
          </g>
        )}
        {children}
        <rect x={66} y={226} width={948} height={768} fill="#000" opacity={dim} />
      </g>
      {[["MIAMI", MIAMI, -1], ["BERMUDA", BERMUDA, -1], ["PUERTO RICO", PR, 1]].map(([n, p, side], i) => (
        <g key={i} opacity={tri > 0.1 ? 1 - dim : 0}>
          <circle cx={(p as number[])[0]} cy={(p as number[])[1]} r={11} fill={YEL} stroke={INKC} strokeWidth={4} />
          <text x={(p as number[])[0] + (i === 0 ? 70 : 0)} y={(p as number[])[1] + (side as number) * 36 + (i === 2 ? 4 : 0)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff" stroke={INKC} strokeWidth={6} paintOrder="stroke">{n as string}</text>
        </g>
      ))}
    </g>
  );
};
const Room: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#1b2a3e" />
    {[...Array(8)].map((_, i) => <rect key={i} x={i * 140} y={0} width={70} height={1330} fill="#ffffff" opacity={0.02} />)}
    <rect x={0} y={1450} width={VW} height={VH - 1450} fill="#2a3a52" />
    <rect x={0} y={1442} width={VW} height={14} fill="#3a4e6e" />
    <ellipse cx={540} cy={1460} rx={520} ry={50} fill={CYAN} opacity={0.05} />
  </g>
);
const duoHidden = (f: number) => (f > F.december + 4 && f < F.vanished - 4) || (f > F.thought + 4 && f < F.rescue - 4) || (f > F.busiest - 12 && f < F.y1975 - 14);
const Duo: React.FC<{ f: number; askMood?: "happy" | "neutral" | "surprised"; wave?: boolean }> = ({ f, askMood, wave }) => duoHidden(f) ? null : (
  <g>
    <g transform="translate(210 1570) scale(0.66)"><Person d={TRAV} f={f} seed={15} talk={askTalk(f)} wave={wave ? 1 : 0} mood={askMood ?? (speaking(f, "asker", SPK) ? "surprised" : "neutral")} /></g>
    <g transform="translate(870 1570) scale(0.66)"><Person d={PILOT} f={f} seed={13} talk={hostTalk(f)} wave={wave ? 1 : 0} mood="happy" /></g>
  </g>
);
const FLIGHT: [number, number][] = [[255, 735], [420, 660], [560, 600], [610, 520], [520, 470]];
/** the five planes of Flight 19 heading out from Fort Lauderdale */
const Flight19: React.FC<{ f: number; t: number; o?: number; n?: number }> = ({ f, t, o = 1, n = 5 }) => {
  const seg = Math.min(FLIGHT.length - 2, Math.floor(t * (FLIGHT.length - 1)));
  const lt = t * (FLIGHT.length - 1) - seg;
  const [x0, y0] = FLIGHT[seg], [x1, y1] = FLIGHT[seg + 1];
  const x = lerp(x0, x1, lt), y = lerp(y0, y1, lt);
  const hd = (Math.atan2(x1 - x0, -(y1 - y0)) * 180) / Math.PI;
  return (
    <g opacity={o}>
      {[...Array(n)].map((_, i) => { const ox = [0, -34, 34, -68, 68][i], oy = [0, 30, 30, 60, 60][i]; const r = (hd * Math.PI) / 180; return <PlaneIcon key={i} x={x + ox * Math.cos(r) - oy * Math.sin(r)} y={y + ox * Math.sin(r) + oy * Math.cos(r)} hd={hd} s={0.62} />; })}
    </g>
  );
};

// ---------- shots ----------
const S1_Brief: React.FC<{ f: number }> = ({ f }) => {
  const tri = eio(ramp(f, F.december - 20, F.december + 20));
  const fly = ramp(f, F.five + 10, F.never);
  const gone = ramp(f, F.never - 4, F.never + 16);
  return (
    <g>
      <Room f={f} />
      <MapBoard f={f} tri={tri} dim={f < F.december - 20 ? 0.45 : 0}>
        {f >= F.five && <Flight19 f={f} t={fly} o={1 - gone} />}
        {f >= F.five && <path d={`M${FLIGHT.map((p) => p.join(" ")).join(" L")}`} stroke="#fff" strokeWidth={4} strokeDasharray="10 12" fill="none" opacity={0.4 * clamp01(fly * 3)} />}
        {f >= F.never && <text x={560} y={480} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90} fill={RED} stroke={INKC} strokeWidth={6} paintOrder="stroke" opacity={pop(f, F.never + 6, 10)}>?</text>}
      </MapBoard>
      {f < F.vanished && <BigNum f={f} at={F.december} text="DEC 1945" x={470} y={350} hue={YEL} fs={100} />}
      <Chip x={330} y={560} w={340} label="5 NAVY PLANES" hue={CYAN} p={pop(f, F.five, 10) * (f < F.vanished ? 1 : 0)} fs={32} textColor={INKC} />
      {f >= F.never && <Stamp f={f} at={F.never + 2} x={540} y={860} text="NEVER CAME BACK" hue={RED} fs={40} rot={-6} />}
      <Duo f={f} />
      {f >= F.vanished && f < F.radioed + 30 && <Chip x={870} y={1230} w={300} label="RADIO..." hue={GREEN} p={pop(f, F.radioed, 10)} fs={36} textColor={INKC} />}
      <Bubble f={f} x={210} y={1250} labels={ASKL} />
    </g>
  );
};
const Compass: React.FC<{ f: number; x: number; y: number; r: number; broken: number }> = ({ f, x, y, r, broken }) => {
  const a = lerp(Math.sin(f * 0.03) * 8, Math.sin(f * 0.21) * 160 + Math.sin(f * 0.53) * 90 + f * 6, broken);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 30} fill="#2a2f38" stroke={INKC} strokeWidth={10} />
      <circle r={r} fill="#f4efe0" stroke="#8a7a50" strokeWidth={8} />
      {["N", "E", "S", "W"].map((d, i) => <text key={d} x={Math.sin(i * Math.PI / 2) * (r - 46)} y={-Math.cos(i * Math.PI / 2) * (r - 46) + 20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={d === "N" ? RED : INKC}>{d}</text>)}
      {[...Array(36)].map((_, i) => <line key={i} x1={Math.sin(i * Math.PI / 18) * (r - 10)} y1={-Math.cos(i * Math.PI / 18) * (r - 10)} x2={Math.sin(i * Math.PI / 18) * (r - (i % 3 ? 22 : 34))} y2={-Math.cos(i * Math.PI / 18) * (r - (i % 3 ? 22 : 34))} stroke={INKC} strokeWidth={4} />)}
      <g transform={`rotate(${a})`}>
        <path d={`M0 ${-r + 60} L22 0 L0 14 L-22 0Z`} fill={RED} stroke={INKC} strokeWidth={4} />
        <path d={`M0 ${r - 60} L22 0 L0 -14 L-22 0Z`} fill="#e8e8e8" stroke={INKC} strokeWidth={4} />
      </g>
      <circle r={16} fill={INKC} />
      <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.35} ry={r * 0.15} fill="#fff" opacity={0.25} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.45})`} />
    </g>
  );
};
const S2_Compass: React.FC<{ f: number }> = ({ f }) => {
  const broken = ramp(f, F.compasses - 6, F.compasses + 10);
  return (
    <g>
      <rect width={VW} height={VH} fill="#1a1f28" />
      {/* cockpit canopy */}
      <path d="M0 0 H1080 V520 Q540 380 0 520Z" fill="#26476e" />
      <path d="M0 520 Q540 380 1080 520" stroke="#3a3f48" strokeWidth={30} fill="none" />
      <path d="M540 0 V430" stroke="#3a3f48" strokeWidth={22} />
      {[...Array(5)].map((_, i) => <ellipse key={i} cx={((i * 260 + f * 3) % 1300) - 110} cy={150 + (i % 3) * 90} rx={120} ry={30} fill="#9fb8d8" opacity={0.35} />)}
      <rect x={0} y={520} width={VW} height={VH - 520} fill="#2a2f38" />
      {[...Array(4)].map((_, i) => <g key={i} transform={`translate(${170 + i * 250} 1460)`}><circle r={70} fill="#11141a" stroke="#555" strokeWidth={8} /><line x1={0} y1={0} x2={Math.sin(i + f * 0.02) * 50} y2={-Math.cos(i + f * 0.02) * 50} stroke={i === 2 ? RED : "#e8e8e8"} strokeWidth={6} /></g>)}
      <Compass f={f} x={540} y={940} r={300} broken={broken} />
      {f >= F.failed && <Stamp f={f} at={F.failed} x={540} y={600} text="COMPASS FAILED" hue={RED} fs={56} rot={-6} />}
    </g>
  );
};
const S3_WrongWay: React.FC<{ f: number }> = ({ f }) => {
  const think = pop(f, F.thought, 12);
  const fly = eio(ramp(f, F.wrong - 10, F.ocean + 30));
  const px = lerp(520, 960, fly), py = lerp(470, 380, fly);
  return (
    <g>
      <Room f={f} />
      <MapBoard f={f}>
        {/* where he thought he was */}
        {f >= F.thought && (
          <g opacity={clamp01(think)}>
            <circle cx={KEYS[0]} cy={KEYS[1]} r={70} fill="none" stroke={YEL} strokeWidth={7} strokeDasharray="14 10" />
          </g>
        )}
        {/* where he really was */}
        <circle cx={520} cy={470} r={26} fill="none" stroke={GREEN} strokeWidth={6} opacity={ramp(f, F.thought + 20, F.thought + 30)} />
        {/* correct way home: west */}
        {f >= F.wrong - 10 && <path d="M500 470 L330 520" stroke={GREEN} strokeWidth={8} strokeDasharray="16 12" opacity={0.8} />}
        {f >= F.wrong - 10 && <path d="M330 520 l30 -24 l2 30z" fill={GREEN} />}
        {/* wrong way: east, out to open ocean */}
        {f >= F.wrong - 10 && <path d={`M520 470 L${px} ${py}`} stroke={RED} strokeWidth={9} fill="none" />}
        <PlaneIcon x={px} y={py} hd={f >= F.wrong - 10 ? 78 : 270} s={0.75} />
      <g opacity={clamp01(think)} transform={`translate(${KEYS[0] + 130} ${KEYS[1] - 260})`}>
        <rect x={-150} y={-60} width={300} height={100} rx={40} fill="#fff" stroke={INKC} strokeWidth={6} />
        <text y={4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKC}>"FLORIDA KEYS?"</text>
        <circle cx={-70} cy={70} r={14} fill="#fff" stroke={INKC} strokeWidth={5} /><circle cx={-95} cy={100} r={8} fill="#fff" stroke={INKC} strokeWidth={4} />
      </g>
      </MapBoard>
      {f >= F.wrong && <Stamp f={f} at={F.wrong + 2} x={600} y={1000} text="WRONG WAY" hue={RED} fs={58} rot={-8} />}
      {f >= F.ocean && <Chip x={760} y={300} w={360} label="OPEN OCEAN" hue={CYAN} p={pop(f, F.ocean, 10)} fs={34} textColor={INKC} />}
      <Duo f={f} />
      <Bubble f={f} x={210} y={1250} labels={ASKL} />
    </g>
  );
};
const Seaplane: React.FC<{ f: number; x: number; y: number; s: number }> = ({ f, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-180 0 Q-150 -40 60 -36 Q160 -30 190 0 Q160 30 60 32 Q-150 36 -180 0Z" fill="#b8c4d8" stroke={INKC} strokeWidth={6} />
    <path d="M-170 -10 L-230 -70 H-200 L-140 -20Z" fill="#9aa8c0" stroke={INKC} strokeWidth={5} />
    <path d="M-30 -30 L-60 -60 L60 -64 L40 -30Z" fill="#9aa8c0" stroke={INKC} strokeWidth={5} />
    {[-40, 40].map((ex) => <g key={ex}><rect x={ex - 22} y={-80} width={44} height={22} rx={10} fill="#5a6a80" stroke={INKC} strokeWidth={4} /><ellipse cx={ex + 26} cy={-69} rx={4} ry={22 * Math.abs(Math.sin(f * 0.9))} fill="#ddd" /></g>)}
    {[...Array(4)].map((_, i) => <circle key={i} cx={60 + i * 24} cy={-12} r={7} fill="#5ad1ff" stroke={INKC} strokeWidth={3} />)}
  </g>
);
const S4_Rescue: React.FC<{ f: number }> = ({ f }) => {
  const gone = ramp(f, F.disappeared + 6, F.disappeared + 14);
  const glow = ramp(f, F.flames - 6, F.flames + 10) * (1 - ramp(f, F.creepy + 20, F.creepy + 60));
  const flash = clamp01(1 - Math.abs(f - (F.disappeared + 10)) / 8);
  const px = lerp(-150, 720, ramp(f, F.did - 20, F.disappeared + 10));
  return (
    <g>
      <defs><radialGradient id="flm" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffd27a" /><stop offset="0.4" stopColor={ORANGE} stopOpacity={0.7} /><stop offset="1" stopColor={ORANGE} stopOpacity={0} /></radialGradient></defs>
      <rect width={VW} height={VH} fill={NIGHT} />
      {[...Array(40)].map((_, i) => <circle key={i} cx={rnd("st" + i) * VW} cy={rnd("sy" + i) * 900} r={1.4 + rnd("sr" + i) * 2} fill="#fff" opacity={0.4 + 0.4 * Math.sin(f * 0.07 + i)} />)}
      <ellipse cx={760} cy={460} rx={300 * glow + 1} ry={220 * glow + 1} fill="url(#flm)" opacity={glow} />
      {gone < 1 && <g opacity={1 - gone}><Seaplane f={f} x={px} y={460} s={0.9} /></g>}
      <circle cx={760} cy={460} r={260 * flash} fill="#ffe7b0" opacity={flash * 0.7} />
      <rect x={0} y={1000} width={VW} height={VH - 1000} fill="#0b2238" />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${-100 + ((i * 160 + f * 1.5) % 1300)} ${1060 + (i % 4) * 140} q 30 -14 60 0 t 60 0`} stroke="#1f4a70" strokeWidth={5} fill="none" />)}
      <path d={`M0 1000 H1080`} stroke="#ffb05a" strokeWidth={4} opacity={glow * 0.6} />
      {/* ship */}
      <g transform={`translate(300 ${1210 + Math.sin(f * 0.08) * 8}) rotate(${Math.sin(f * 0.06) * 2})`}>
        <path d="M-220 0 H220 L170 90 H-180Z" fill="#3a4a5e" stroke={INKC} strokeWidth={7} />
        <rect x={-120} y={-90} width={180} height={90} fill="#d8dde6" stroke={INKC} strokeWidth={6} />
        <rect x={-60} y={-160} width={80} height={70} fill="#d8dde6" stroke={INKC} strokeWidth={6} />
        <rect x={60} y={-180} width={30} height={120} fill={RED} stroke={INKC} strokeWidth={5} />
        {[...Array(4)].map((_, i) => <circle key={i} cx={-95 + i * 40} cy={-45} r={10} fill={f >= F.ship ? "#ffd27a" : "#5a6a80"} />)}
        {/* lookout */}
        <g transform="translate(-20 -160) scale(0.4)"><Person d={CAST[1]} f={f} seed={1} talk={0} wave={f >= F.flames ? 1 : 0} mood={f >= F.flames ? "surprised" : "neutral"} /></g>
      </g>
      <Chip x={540} y={260} w={420} label="RESCUE PLANE" hue={CYAN} p={pop(f, F.did, 10) * (1 - ramp(f, F.disappeared, F.disappeared + 8))} fs={36} textColor={INKC} />
      {f >= F.disappeared + 10 && <Stamp f={f} at={F.disappeared + 10} x={540} y={260} text="GONE TOO" hue={RED} fs={66} rot={-6} />}
      {f >= F.flames && <Chip x={760} y={720} w={420} label="FLAMES IN THE SKY" hue={ORANGE} p={pop(f, F.flames, 10)} fs={32} />}
    </g>
  );
};
const S5_Creepy: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} />
    <MapBoard f={f} dim={0.35}>
      {[0, 1].map((i) => <text key={i} x={520 + i * 140} y={560 + i * 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90} fill={RED} opacity={0.6 + 0.3 * Math.sin(f * 0.2 + i)}>?</text>)}
    </MapBoard>
    <Duo f={f} />
    <Bubble f={f} x={210} y={1250} labels={ASKL} />
  </g>
);
const Doc: React.FC<{ x: number; y: number; title: string; sub: string; hue: string; rot: number; p: number }> = ({ x, y, title, sub, hue, rot, p }) => (
  <g transform={`translate(${x} ${lerp(y + 200, y, eout(p))}) rotate(${rot})`} opacity={clamp01(p * 2)}>
    <rect x={-190} y={-250} width={380} height={500} rx={10} fill="#fbf7ec" stroke={INKC} strokeWidth={6} />
    <rect x={-190} y={-250} width={380} height={110} rx={10} fill={hue} stroke={INKC} strokeWidth={6} />
    <text y={-200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff">{title}</text>
    <text y={-158} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff">{sub}</text>
    {[...Array(7)].map((_, i) => <g key={i}><rect x={-150} y={-100 + i * 46} width={170} height={14} rx={7} fill="#c9c2b0" /><text x={130} y={-87 + i * 46} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INKC}>{[12, 9, 14, 11, 10, 13, 12][i]}</text></g>)}
  </g>
);
const S6_Truth: React.FC<{ f: number }> = ({ f }) => {
  const mag = eio(ramp(f, F.numbers - 30, F.ships));
  const bars = eout(ramp(f, F.vanish - 10, F.anywhere));
  return (
    <g>
      <rect width={VW} height={VH} fill="#f2ead6" />
      {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={i * 160} x2={VW} y2={i * 160} stroke="#e4d9bf" strokeWidth={3} />)}
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={INKC} opacity={pop(f, F.truth + 4, 10)}>THE TRUTH</text>
      <Doc x={300} y={640} title="U.S. COAST GUARD" sub="LOSS RECORDS" hue="#1f4f8a" rot={-5} p={ramp(f, F.coast - 6, F.coast + 10)} />
      <Doc x={780} y={660} title="LLOYD'S OF LONDON" sub="INSURANCE DATA" hue="#7a1f2a" rot={4} p={ramp(f, F.lloyds - 6, F.lloyds + 10)} />
      {/* magnifier sweeping over the numbers */}
      {f >= F.numbers - 30 && (
        <g transform={`translate(${lerp(300, 780, mag)} ${640 + Math.sin(mag * Math.PI) * -80})`}>
          <circle r={90} fill="#bfe6ff" fillOpacity={0.35} stroke={INKC} strokeWidth={12} />
          <path d="M64 64 L150 150" stroke="#6b4a24" strokeWidth={26} strokeLinecap="round" />
        </g>
      )}
      {/* comparison chart */}
      <g transform="translate(0 1480)" opacity={ramp(f, F.ships - 10, F.ships)}>
        <rect x={110} y={-460} width={860} height={540} rx={24} fill="#fff" stroke={INKC} strokeWidth={6} />
        <text x={540} y={-400} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={INKC}>LOSS RATE</text>
        {[{ x: 330, label: "TRIANGLE", hue: RED }, { x: 750, label: "ELSEWHERE", hue: "#3d6ccf" }].map((b, i) => (
          <g key={i}>
            <rect x={b.x - 100} y={-40 - 280 * bars} width={200} height={280 * bars} rx={12} fill={b.hue} stroke={INKC} strokeWidth={5} />
            <text x={b.x} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={INKC}>{b.label}</text>
          </g>
        ))}
        {bars > 0.95 && <text x={540} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INKC}>=</text>}
      </g>
      {f >= F.anywhere && (
        <g>
          <Stamp f={f} at={F.anywhere} x={540} y={1060} text="NO MORE THAN" hue={GREEN} fs={52} rot={-6} />
        </g>
      )}
    </g>
  );
};
const Storm: React.FC<{ f: number; x: number; y: number; s: number; seed: number }> = ({ f, x, y, s, seed }) => {
  const bolt = (Math.floor(f / 6) + seed) % 9 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {bolt && <path d="M0 30 L-20 90 L4 86 L-14 150 L30 70 L6 74 L22 30Z" fill={YEL} stroke={INKC} strokeWidth={4} />}
      <path d="M-80 30 Q-100 -10 -60 -20 Q-50 -60 0 -55 Q40 -80 70 -40 Q110 -40 100 0 Q110 30 70 34Z" fill="#5a6478" stroke={INKC} strokeWidth={5} />
    </g>
  );
};
const S7_Stories: React.FC<{ f: number }> = ({ f }) => {
  const traffic = ramp(f, F.busiest - 10, F.busiest + 20);
  const storm = pop(f, F.storms, 12);
  const cur = ramp(f, F.current - 20, F.current + 10);
  return (
    <g>
      <Room f={f} />
      <MapBoard f={f}>
        {/* busy lanes */}
        {[...Array(26)].map((_, i) => {
          const lane = i % 4;
          const q = ((f * (0.004 + rnd("q" + i) * 0.004) + rnd("o" + i)) % 1);
          const pts = [[[270, 740], [980, 420]], [[280, 600], [980, 700]], [[300, 820], [1000, 860]], [[240, 400], [900, 260]]][lane];
          const x = lerp(pts[0][0], pts[1][0], i % 2 ? q : 1 - q), y = lerp(pts[0][1], pts[1][1], i % 2 ? q : 1 - q);
          return i % 3 === 0
            ? <PlaneIcon key={i} x={x} y={y} hd={(i % 2 ? 1 : -1) * 70} s={0.42} c="#e8f4ff" o={traffic} />
            : <g key={i} opacity={traffic}><circle cx={x} cy={y} r={10} fill={YEL} stroke={INKC} strokeWidth={3} /></g>;
        })}
        {storm > 0 && <g opacity={clamp01(storm)}><Storm f={f} x={620} y={560} s={1.1 * clamp01(storm)} seed={1} /><Storm f={f} x={760} y={760} s={0.9 * clamp01(storm)} seed={4} /></g>}
        {/* Gulf Stream */}
        {cur > 0 && [0, 1, 2].map((i) => <path key={i} d="M330 900 Q320 760 340 640 Q370 500 440 400 Q520 300 640 250" stroke={CYAN} strokeWidth={14 - i * 4} fill="none" strokeDasharray="30 22" strokeDashoffset={-f * 4 - i * 17} opacity={cur * (0.9 - i * 0.25)} strokeLinecap="round" transform={`translate(${i * 18} 0)`} />)}
      </MapBoard>
      {f >= F.busiest && <Chip x={540} y={170} w={440} label="BUSY OCEAN" hue={YEL} p={pop(f, F.busiest, 10)} fs={38} textColor={INKC} />}
      {f >= F.storms && <Chip x={790} y={1000} w={320} label="SUDDEN STORMS" hue="#5a6478" p={pop(f, F.storms + 4, 10)} fs={30} />}
      {f >= F.current && <Chip x={330} y={1000} w={340} label="FAST CURRENT" hue={CYAN} p={pop(f, F.current, 10)} fs={30} textColor={INKC} />}
      <Duo f={f} />
      <Bubble f={f} x={210} y={1250} labels={ASKL} />
    </g>
  );
};
const CaseCard: React.FC<{ x: number; y: number; title: string; rot: number; p: number }> = ({ x, y, title, rot, p }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.7 + 0.3 * clamp01(p)})`} opacity={clamp01(p)}>
    <rect x={-170} y={-110} width={340} height={220} rx={12} fill="#fbf7ec" stroke={INKC} strokeWidth={6} />
    <rect x={-170} y={-110} width={340} height={56} rx={12} fill="#c9b27a" stroke={INKC} strokeWidth={6} />
    <text y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={INKC}>{title}</text>
    {[0, 1, 2].map((i) => <rect key={i} x={-140} y={-30 + i * 40} width={280 - i * 60} height={14} rx={7} fill="#c9c2b0" />)}
  </g>
);
const S8_1975: React.FC<{ f: number }> = ({ f }) => {
  const move = eio(ramp(f, F.sunk - 10, F.elsewhere + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill="#efe4c8" />
      <rect x={0} y={1330} width={VW} height={VH - 1330} fill="#8a5a2b" />
      <rect x={0} y={1322} width={VW} height={16} fill="#6b4423" />
      <BigNum f={f} at={F.y1975} text="1975" x={540} y={300} hue={YEL} fs={140} />
      <Chip x={540} y={400} w={420} label="A WRITER CHECKED" hue="#6b4423" p={pop(f, F.writer, 10)} fs={32} />
      <CaseCard x={290} y={620} title="CASE #1" rot={-6} p={ramp(f, F.y1975 + 10, F.y1975 + 20)} />
      <CaseCard x={790} y={620} title="CASE #2" rot={5} p={ramp(f, F.y1975 + 20, F.y1975 + 30)} />
      <CaseCard x={540} y={860} title="CASE #3" rot={-2} p={ramp(f, F.y1975 + 30, F.y1975 + 40)} />
      {f >= F.exaggerated && <Stamp f={f} at={F.exaggerated} x={540} y={720} text="EXAGGERATED" hue={RED} fs={70} rot={-10} />}
      {/* mini map: a ship pin flies out of the triangle to somewhere else */}
      {f >= F.sunk - 14 && (
        <g transform="translate(540 1150)" opacity={ramp(f, F.sunk - 14, F.sunk - 4)}>
          <rect x={-300} y={-150} width={600} height={260} rx={20} fill={SEA} stroke={INKC} strokeWidth={6} />
          <path d="M-140 -80 L60 -120 L40 70 Z" fill={RED} fillOpacity={0.15} stroke={RED} strokeWidth={5} />
          <path d={`M-20 -30 Q${lerp(-20, 120, move)} ${-140} ${lerp(-20, 230, move)} ${lerp(-30, 40, move)}`} stroke="#fff" strokeWidth={4} strokeDasharray="8 8" fill="none" opacity={move > 0 ? 0.7 : 0} />
          <g transform={`translate(${lerp(-20, 230, move)} ${lerp(-30, 40, move) - Math.sin(move * Math.PI) * 80})`}>
            <path d="M-26 0 H26 L18 16 H-18Z" fill="#d8dde6" stroke={INKC} strokeWidth={3} /><rect x={-8} y={-18} width={14} height={18} fill="#d8dde6" stroke={INKC} strokeWidth={3} />
          </g>
          {move > 0.95 && <text x={230} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={YEL}>SANK HERE</text>}
        </g>
      )}
      <g transform="translate(150 1560) scale(0.62)"><Person d={WRITER} f={f} seed={22} talk={0} wave={f >= F.exaggerated ? 1 : 0} mood="happy" /></g>
    </g>
  );
};
const S9_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} />
    <MapBoard f={f} dim={0.55} />
    <Outro f={f} at={F.sub} />
    <g transform="translate(140 1570) scale(0.72)"><Person d={TRAV} f={f} seed={15} talk={0} wave={1} mood="happy" /></g>
    <g transform="translate(940 1570) scale(0.72)"><Person d={PILOT} f={f} seed={13} talk={hostTalk(f)} wave={1} mood="happy" /></g>
  </g>
);

export const BermudaFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: F.december, render: () => <S1_Brief f={f} />, cam: [[0, { x: 540, y: 1000, z: 1.05 }], [40, { x: 520, y: 1180, z: 1.12 }], [F.december, { x: 500, y: 1200, z: 1.16 }]] },
    { from: F.december, to: F.vanished, tr: "whip", render: () => <S1_Brief f={f} />, cam: [[F.december, { x: 520, y: 560, z: 1.38 }], [F.five, { x: 550, y: 600, z: 1.3 }], [F.never, { x: 550, y: 600, z: 1.3 }], [F.vanished, { x: 550, y: 600, z: 1.3 }]] },
    { from: F.vanished, to: F.compasses - 4, tr: "zoom", render: () => <S1_Brief f={f} />, cam: [[F.vanished, { x: 500, y: 1200, z: 1.16 }], [F.radioed, { x: 560, y: 1150, z: 1.1 }], [F.compasses - 4, { x: 580, y: 1180, z: 1.16 }]] },
    { from: F.compasses - 4, to: F.thought, tr: "wipe", render: () => <S2_Compass f={f} />, cam: [[F.compasses - 4, { x: 540, y: 940, z: 1.4 }], [F.failed + 10, { x: 540, y: 880, z: 1.12, r: -3 }], [F.thought, { x: 540, y: 900, z: 1.2, r: 3 }]] },
    { from: F.thought, to: F.rescue, tr: "whip", render: () => <S3_WrongWay f={f} />, cam: [[F.thought, { x: 440, y: 700, z: 1.38 }], [F.wrong - 10, { x: 540, y: 620, z: 1.3 }], [F.ocean, { x: 600, y: 600, z: 1.34 }], [F.rescue, { x: 580, y: 610, z: 1.3 }]] },
    { from: F.rescue, to: F.did, tr: "spin", render: () => <S5_Creepy f={f} />, cam: [[F.rescue, { x: 500, y: 1200, z: 1.16 }], [F.did, { x: 540, y: 1150, z: 1.12 }]] },
    { from: F.did, to: F.creepy, tr: "whipUp", render: () => <S4_Rescue f={f} />, cam: [[F.did, { x: 400, y: 600, z: 1.3 }], [F.disappeared + 10, { x: 680, y: 520, z: 1.2 }], [F.ship, { x: 480, y: 900, z: 1.1 }], [F.flames + 10, { x: 600, y: 760, z: 1.05 }], [F.creepy, { x: 600, y: 760, z: 1.12 }]] },
    { from: F.creepy, to: F.truth, tr: "iris", render: () => <S5_Creepy f={f} />, cam: [[F.creepy, { x: 500, y: 1200, z: 1.16 }], [F.itis, { x: 560, y: 1150, z: 1.12 }], [F.truth, { x: 600, y: 1150, z: 1.18 }]] },
    { from: F.truth, to: F.why, tr: "flash", render: () => <S6_Truth f={f} />, cam: [[F.truth, { x: 540, y: 400, z: 1.3 }], [F.coast + 10, { x: 420, y: 640, z: 1.2 }], [F.lloyds + 10, { x: 660, y: 660, z: 1.2 }], [F.ships - 6, { x: 540, y: 760, z: 1.05 }], [F.ships + 14, { x: 540, y: 1180, z: 1.1 }], [F.why, { x: 540, y: 1200, z: 1.16 }]] },
    { from: F.why, to: F.y1975 - 10, tr: "wipe", render: () => <S7_Stories f={f} />, cam: [[F.why, { x: 500, y: 1200, z: 1.16 }], [F.why + 54, { x: 540, y: 1180, z: 1.12 }], [F.busiest - 8, { x: 540, y: 620, z: 1.3 }], [F.storms, { x: 600, y: 600, z: 1.38 }], [F.current, { x: 480, y: 640, z: 1.36 }], [F.y1975 - 10, { x: 540, y: 620, z: 1.3 }]] },
    { from: F.y1975 - 10, to: F.sub, tr: "push", render: () => <S8_1975 f={f} />, cam: [[F.y1975 - 10, { x: 540, y: 500, z: 1.3 }], [F.exaggerated, { x: 540, y: 700, z: 1.12 }], [F.sunk, { x: 540, y: 1000, z: 1.12 }], [F.sub, { x: 560, y: 1040, z: 1.2 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "zoom", render: () => <S9_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.1 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.december, 0.1], [F.five, 0.08], [F.never + 2, 0.12], [F.failed, 0.12], [F.wrong, 0.12], [F.disappeared + 10, 0.14], [F.flames, 0.1], [F.truth, 0.1], [F.anywhere, 0.14], [F.storms, 0.1], [F.y1975, 0.1], [F.exaggerated, 0.14]];
  const SHAKE: [number, number][] = [[F.never + 2, 10], [F.failed + 2, 10], [F.disappeared + 10, 14], [F.anywhere + 2, 10], [F.exaggerated + 2, 12]];
  const SFX: Cue[] = [
    [36, "pop", 0.35], [F.december - 20, "riser_dark", 0.25], [F.december, "boom", 0.4], [F.five, "pop", 0.35], [F.florida, "whoosh", 0.3], [F.never + 2, "impact", 0.45],
    [F.vanished - 3, "pop", 0.4], [F.radioed, "tick", 0.3], [F.compasses, "riser", 0.25], [F.failed, "impact", 0.45], [F.thought, "pop", 0.3], [F.wrong + 2, "impact", 0.4], [F.ocean, "pop", 0.3],
    [F.rescue - 3, "pop", 0.35], [F.did, "pop", 0.3], [F.did - 10, "whoosh", 0.3], [F.disappeared + 10, "boom", 0.45], [F.flames, "riser_dark", 0.3],
    [F.creepy - 3, "pop", 0.35], [F.coast - 6, "whoosh", 0.3], [F.lloyds - 6, "whoosh", 0.3], [F.numbers - 30, "tick", 0.3], [F.ships, "pop", 0.3], [F.anywhere, "impact", 0.5],
    [F.why - 3, "pop", 0.35], [F.busiest, "pop", 0.3], [F.storms, "boom", 0.3], [F.current, "whoosh", 0.3],
    [F.y1975, "boom", 0.4], [F.writer, "pop", 0.3], [F.exaggerated, "impact", 0.5], [F.sunk, "whoosh", 0.3],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = 1 - ramp(f, TOTAL - 16, TOTAL - 2); // no fade-in: frame 0 is the cover
  const light = f >= F.truth && f < F.why || f >= F.y1975 - 10 && f < F.sub;
  const accent = f < F.truth ? RED : f < F.why ? GREEN : f < F.y1975 ? CYAN : ORANGE;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light={light} />
        <Cover f={f} word="BERMUDA" sub="THE REAL TRUTH?" until={ASK[0][1] - 6} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme={light ? "light" : "dark"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="bermuda" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
