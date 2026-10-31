import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FontStyle, Vignette, ramp, eio, eout, pop, clamp01, lerp, mix, rnd, VW, VH } from "./kit";
import { Narration, Sfx, Cue, Caps, Cover, Brand, Chip, BigNum, Stamp, Drift, Outro, FONT, YEL, INKC, Director, Shot, transitionCues, talkFor } from "./factkit";
import { Person, CAST } from "./Humans";
import { WORDS, CHUNKS, TOTAL, ENV, SPK } from "./words";

// cue frames (from sents.json / words.ts)
const F = { hook: 17, every: 69, cold: 167, nerves: 212, tighten: 245, stands: 298, bump: 349, ancestors: 395, traps: 498, bigger: 577,
  cat: 629, same: 686, lost: 734, kept: 776, scary: 841, song: 867, prickle: 918, useless: 956, notquite: 1012, y2020: 1044,
  nerve2: 1137, wakes: 1199, stem: 1225, newhair: 1265, mice: 1294, cold2: 1326, weeks: 1396, leftovers: 1430, warm: 1507, sub: 1592 };
const SKY = "#dff3ff", MINT = "#3ddc97", PINK = "#ff8fa3", SKIN = "#f2c9a0", DERM = "#f6a8a8", NERVE = "#ffc531", RED = "#e4473b", BLUE = "#2f7fe0", PURP = "#7b5cff", ORANGE = "#ff8a3d";
const GY = 1470; // ground line
const SCI = CAST[0], KID = CAST[11];
const host = (f: number) => talkFor(f, "host", SPK, ENV);
const kid = (f: number) => talkFor(f, "kid", SPK, ENV);

// ---------------- shared bits ----------------
const Room: React.FC<{ f: number; tint?: string; cold?: number }> = ({ f, tint = SKY, cold = 0 }) => (
  <g>
    <rect width={VW} height={VH} fill={tint} />
    <rect x={0} y={GY - 10} width={VW} height={VH - GY + 10} fill={mix(tint, "#7a8aa8", 0.25)} />
    <line x1={0} y1={GY - 10} x2={VW} y2={GY - 10} stroke={INKC} strokeWidth={5} opacity={0.4} />
    {[...Array(6)].map((_, i) => <rect key={i} x={i * 190 - 20} y={GY - 10} width={6} height={VH} fill="#000000" opacity={0.04} />)}
    {cold > 0 && [...Array(18)].map((_, i) => {
      const y = 380 + rnd("w" + i) * 1000, x = ((f * (14 + rnd("ws" + i) * 10) + rnd("wx" + i) * 1400) % 1400) - 200;
      return <line key={i} x1={x} y1={y} x2={x + 120} y2={y + 8} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.75 * cold} />;
    })}
    {cold > 0 && <Drift f={f} n={26} color="#ffffff" seed="snow" maxR={5} speed={-1.2} opacity={0.8 * cold} />}
  </g>
);
const Sci: React.FC<{ f: number; x: number; y?: number; s?: number; wave?: number; mood?: any }> = ({ f, x, y = GY, s = 1.25, wave = 0, mood }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Person d={SCI} f={f} seed={3} talk={host(f)} wave={wave} mood={mood ?? (host(f) > 0 ? "happy" : "neutral")} /></g>
);
const Kid: React.FC<{ f: number; x: number; y?: number; s?: number; shiver?: number; wave?: number; mood?: any; flip?: boolean }> = ({ f, x, y = GY, s = 1.3, shiver = 0, wave = 0, mood, flip }) => {
  const sx = shiver ? Math.sin(f * 2.1) * 5 * shiver : 0;
  return <g transform={`translate(${x + sx} ${y}) scale(${flip ? -s : s} ${s})`}><Person d={KID} f={f} seed={7} talk={kid(f)} wave={wave} mood={mood ?? "surprised"} /></g>;
};
/** magnifier bubble showing skin with goosebumps */
const SkinBubble: React.FC<{ f: number; x: number; y: number; r?: number; bumps: number; label?: string }> = ({ f, x, y, r = 150, bumps, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><clipPath id={`sb${x}`}><circle r={r} /></clipPath></defs>
    <circle r={r} fill={SKIN} />
    <g clipPath={`url(#sb${x})`}>
      {[...Array(22)].map((_, i) => {
        const bx = (rnd("bx" + i) - 0.5) * r * 1.8, by = (rnd("by" + i) - 0.5) * r * 1.8;
        const q = clamp01(bumps * 22 - i * 0.6);
        const bh = q * (8 + rnd("bh" + i) * 6);
        return (
          <g key={i} transform={`translate(${bx} ${by})`}>
            <circle r={bh} fill={mix(SKIN, "#ffffff", 0.25)} stroke={mix(SKIN, "#000000", 0.25)} strokeWidth={2} />
            <line x1={0} y1={0} x2={lerp(14, 2, q)} y2={-lerp(6, 22, q)} stroke="#6b4a24" strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
    <circle r={r} fill="none" stroke={INKC} strokeWidth={12} />
    <circle r={r} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />
    <line x1={r * 0.72} y1={r * 0.72} x2={r * 1.25} y2={r * 1.25} stroke={INKC} strokeWidth={26} strokeLinecap="round" />
    {label && <text y={r + 70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INKC}>{label}</text>}
  </g>
);

// ---------------- shots ----------------
const S1_Hook: React.FC<{ f: number }> = ({ f }) => {
  const bumps = ramp(f, 30, 90);
  return (
    <g>
      <Room f={f} cold={1} />
      {/* scary movie TV */}
      <g transform="translate(760 560)">
        <rect x={-190} y={-130} width={380} height={250} rx={18} fill="#1b1b24" stroke={INKC} strokeWidth={6} />
        <rect x={-170} y={-112} width={340} height={214} rx={8} fill="#2a2140" />
        <g opacity={0.6 + 0.4 * Math.sin(f * 0.6)}>
          <path d="M-40 60 Q-50 -40 0 -60 Q50 -40 40 60 L26 44 L12 60 L0 44 L-12 60 L-26 44 Z" fill="#f1f1f1" />
          <circle cx={-14} cy={-14} r={9} fill="#2a2140" /><circle cx={14} cy={-14} r={9} fill="#2a2140" />
        </g>
        <rect x={-30} y={120} width={60} height={30} fill="#1b1b24" />
      </g>
      {f >= 62 && <Chip x={760} y={350} w={260} label="BRRR!" hue={BLUE} p={pop(f, 62, 10)} fs={40} />}
      <SkinBubble f={f} x={260} y={520} bumps={bumps} label="GOOSEBUMPS!" />
      <Kid f={f} x={560} shiver={1} mood="surprised" />
      {f >= F.every - 6 && <Sci f={f} x={lerp(1250, 880, eout(ramp(f, F.every - 6, F.every + 20)))} s={1.15} />}
    </g>
  );
};

const Follicle: React.FC<{ f: number; contract: number; zap: number; glowStem?: number; grow?: number; showLabels?: boolean }> = ({ f, contract, zap, glowStem = 0, grow = 0, showLabels = true }) => {
  // world coords: skin surface at y=760; follicle base at (540,1260)
  const surf = 760, bump = contract * 46;
  const lean = lerp(-38, -4, contract);
  const hairTop = (len: number) => { const a = (lean * Math.PI) / 180; return [540 + Math.sin(a) * -len, surf - Math.cos(a) * len]; };
  const [hx, hy] = hairTop(330);
  const musLen = lerp(1, 0.7, contract);
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff4f0" />
      {/* layers */}
      <path d={`M0 ${surf} Q 400 ${surf} 470 ${surf - bump * 0.4} Q 540 ${surf - bump} 610 ${surf - bump * 0.4} Q 680 ${surf} 1080 ${surf} V 900 H0 Z`} fill={SKIN} stroke={INKC} strokeWidth={6} />
      <rect x={0} y={900} width={VW} height={700} fill={DERM} />
      <rect x={0} y={900} width={VW} height={6} fill={INKC} opacity={0.3} />
      {[...Array(14)].map((_, i) => <circle key={i} cx={rnd("dc" + i) * VW} cy={960 + rnd("dy" + i) * 600} r={6 + rnd("dr" + i) * 8} fill="#ffffff" opacity={0.25} />)}
      <rect x={0} y={1500} width={VW} height={420} fill="#ffe2b3" />
      <text x={60} y={850} fontFamily={FONT} fontWeight={800} fontSize={30} fill={INKC} opacity={0.5}>SKIN</text>
      {/* follicle */}
      <path d="M500 780 Q 488 1100 510 1250 Q 540 1290 570 1250 Q 592 1100 580 780" fill="#fbd9c4" stroke={INKC} strokeWidth={6} />
      {/* stem cells */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={510 + (i % 2) * 60} cy={1080 + Math.floor(i / 2) * 50} r={16} fill={glowStem > 0 ? mix("#b8f5d6", MINT, glowStem) : "#e7c9ff"} stroke={INKC} strokeWidth={3}
          style={{ filter: glowStem > 0 ? `drop-shadow(0 0 ${14 * glowStem}px ${MINT})` : undefined }} />
      ))}
      {/* hair */}
      <path d={`M540 1240 L540 ${surf} L${hx} ${hy}`} stroke="#4a2f1a" strokeWidth={14} strokeLinecap="round" fill="none" />
      {grow > 0 && <path d={`M600 1240 L600 ${lerp(1240, surf - 40, grow)}`} stroke="#6b4423" strokeWidth={11} strokeLinecap="round" />}
      {/* arrector pili muscle */}
      <g transform={`translate(560 1030) rotate(-42)`}>
        <rect x={0} y={-17} width={260 * musLen} height={34} rx={17} fill={RED} stroke={INKC} strokeWidth={5} />
        {[...Array(6)].map((_, i) => <line key={i} x1={20 + i * 38 * musLen} y1={-12} x2={30 + i * 38 * musLen} y2={12} stroke="#ffffff" strokeWidth={3} opacity={0.5} />)}
      </g>
      {/* nerve */}
      <path d="M1080 1420 Q 860 1380 820 1200 Q 790 1090 735 900" stroke={NERVE} strokeWidth={14} fill="none" strokeLinecap="round" />
      {zap > 0 && zap < 1 && (() => {
        const t = zap; const px = lerp(1080, 735, t), py = lerp(1420, 900, Math.pow(t, 0.8));
        return <g><circle cx={px} cy={py} r={34} fill={NERVE} opacity={0.35} /><circle cx={px} cy={py} r={16} fill="#ffffff" /></g>;
      })()}
      {zap >= 1 && contract < 1 && <circle cx={735} cy={900} r={40 + 30 * Math.sin(f)} fill={NERVE} opacity={0.3} />}
      {showLabels && (
        <g>
          <g opacity={pop(f, F.every + 20, 10)}><line x1={420} y1={570} x2={hx - 10} y2={hy + 40} stroke={INKC} strokeWidth={4} /><Chip x={340} y={560} w={180} label="HAIR" hue="#4a2f1a" fs={34} /></g>
          <g opacity={pop(f, F.every + 50, 10)}><line x1={700} y1={1170} x2={640} y2={1000} stroke={INKC} strokeWidth={4} /><Chip x={740} y={1210} w={440} label="TINY MUSCLE" hue={RED} fs={34} /></g>
          <g opacity={pop(f, F.nerves, 10)}><Chip x={900} y={1330} w={210} label="NERVE" hue="#d99a00" fs={34} textColor={INKC} /></g>
        </g>
      )}
    </g>
  );
};
const S2_Micro: React.FC<{ f: number }> = ({ f }) => {
  const zap = ramp(f, F.nerves, F.tighten);
  const contract = eio(ramp(f, F.tighten, F.tighten + 30));
  return (
    <g>
      <Follicle f={f} contract={contract} zap={zap} />
      {f >= F.stands && <Chip x={540} y={430} w={460} label="HAIR STANDS UP" hue={PURP} p={pop(f, F.stands, 10)} fs={38} />}
      {f >= F.bump && <BigNum f={f} at={F.bump} text="= GOOSEBUMP" x={540} y={580} hue={YEL} fs={86} />}
      {f < F.stands && <Chip x={540} y={430} w={500} label={f >= F.tighten ? "MUSCLE TIGHTENS" : f >= F.cold ? "COLD OR SCARED?" : "INSIDE YOUR SKIN"} hue={f >= F.tighten ? RED : BLUE} p={pop(f, f >= F.tighten ? F.tighten : f >= F.cold ? F.cold : F.every, 10)} fs={36} />}
    </g>
  );
};
const Ape: React.FC<{ f: number; fluff: number; scale?: number }> = ({ f, fluff, scale = 1 }) => {
  const spikes = 46;
  const pts = [...Array(spikes)].map((_, i) => {
    const a = (i / spikes) * Math.PI * 2;
    const r = (i % 2 ? 170 : 170 + 22 + fluff * 40 + Math.sin(f * 0.3 + i) * 4 * fluff);
    return `${Math.cos(a) * r * 0.85},${Math.sin(a) * r}`;
  }).join(" ");
  return (
    <g transform={`scale(${scale})`}>
      <polygon points={pts} fill="#5a3a24" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={-60} rx={70} ry={64} fill="#c99a72" stroke={INKC} strokeWidth={5} />
      <ellipse cx={-26} cy={-70} rx={10} ry={13} fill={INKC} /><ellipse cx={26} cy={-70} rx={10} ry={13} fill={INKC} />
      <ellipse cx={0} cy={-34} rx={30} ry={18} fill="#a8785a" stroke={INKC} strokeWidth={4} />
      <ellipse cx={0} cy={60} rx={80} ry={70} fill="#c99a72" opacity={0.6} />
    </g>
  );
};
const S3_Ancestors: React.FC<{ f: number }> = ({ f }) => {
  const fluff = eout(ramp(f, F.traps - 10, F.traps + 16));
  const big = eio(ramp(f, F.bigger - 6, F.bigger + 16));
  return (
    <g>
      <rect width={VW} height={VH} fill="#cfe8ff" />
      <path d={`M0 1180 Q 300 1120 600 1170 T 1080 1150 V 1920 H0 Z`} fill="#bfe3b0" />
      <path d={`M0 1260 Q 400 1220 1080 1270 V1920 H0Z`} fill="#9fd08e" />
      <Drift f={f} n={30} color="#ffffff" seed="snow2" maxR={6} speed={-1.4} opacity={0.9} />
      <g transform={`translate(${lerp(540, 520, big)} ${lerp(930, 880, big)})`}><Ape f={f} fluff={fluff} scale={lerp(1.15, 1.45, big)} /></g>
      {/* warm air pockets */}
      {f >= F.traps && [...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + f * 0.01;
        return <circle key={i} cx={540 + Math.cos(a) * 260} cy={900 + Math.sin(a) * 300} r={18 + 6 * Math.sin(f * 0.2 + i)} fill={ORANGE} opacity={0.45 * eout(ramp(f, F.traps, F.traps + 20))} />;
      })}
      <Chip x={540} y={360} w={640} label="OUR FURRY ANCESTORS" hue="#5a3a24" p={pop(f, F.ancestors + 6, 10)} fs={36} />
      <Chip x={300} y={1400} w={460} label="TRAPS WARM AIR" hue={ORANGE} p={pop(f, F.traps, 10)} fs={36} />
      <Chip x={780} y={1400} w={380} label="LOOK BIGGER" hue={PURP} p={pop(f, F.bigger, 10)} fs={36} />
      {/* predator eyes in bush */}
      {f >= F.bigger + 20 && (
        <g transform={`translate(${lerp(930, 1060, eio(ramp(f, F.bigger + 30, F.bigger + 50)))} 1140)`} opacity={1 - ramp(f, F.bigger + 40, F.bigger + 50)}>
          <ellipse rx={90} ry={60} fill="#5f9d4e" />
          <ellipse cx={-22} cy={-6} rx={10} ry={8} fill={YEL} /><ellipse cx={22} cy={-6} rx={10} ry={8} fill={YEL} />
        </g>
      )}
    </g>
  );
};
const Cat: React.FC<{ f: number; puff: number }> = ({ f, puff }) => {
  const arch = lerp(0, 90, puff);
  const fur = (x: number, y: number, n: number, len: number) =>
    [...Array(n)].map((_, i) => <line key={i} x1={x + i * 26} y1={y} x2={x + i * 26 + 6} y2={y - len * (0.6 + 0.4 * rnd("cf" + i)) - Math.sin(f * 0.5 + i) * 3 * puff} stroke="#2b2b36" strokeWidth={10} strokeLinecap="round" />);
  return (
    <g>
      {/* body */}
      <path d={`M-230 60 Q -200 ${-60 - arch} 0 ${-90 - arch} Q 200 ${-60 - arch} 230 60 Z`} fill="#2b2b36" stroke={INKC} strokeWidth={6} />
      {puff > 0.05 && fur(-190, -40 - arch * 0.8, 15, 50 * puff)}
      {/* legs */}
      {[-200, -150, 150, 200].map((x) => <rect key={x} x={x - 14} y={40} width={28} height={130 + puff * 20} rx={12} fill="#2b2b36" stroke={INKC} strokeWidth={5} />)}
      {/* tail */}
      <path d={`M220 20 Q 330 -40 ${300 + puff * 20} ${-170 - puff * 40}`} stroke="#2b2b36" strokeWidth={30 + puff * 34} fill="none" strokeLinecap="round" />
      {/* head */}
      <g transform={`translate(-250 ${-40 - arch * 0.5})`}>
        <path d="M-70 -30 L-60 -110 L-20 -60 Z M30 -60 L60 -110 L70 -30 Z" fill="#2b2b36" stroke={INKC} strokeWidth={5} strokeLinejoin="round" />
        <circle r={80} fill="#2b2b36" stroke={INKC} strokeWidth={5} />
        <ellipse cx={-28} cy={-10} rx={16} ry={puff > 0.5 ? 8 : 14} fill={YEL} /><ellipse cx={28} cy={-10} rx={16} ry={puff > 0.5 ? 8 : 14} fill={YEL} />
        <ellipse cx={-28} cy={-10} rx={4} ry={10} fill={INKC} /><ellipse cx={28} cy={-10} rx={4} ry={10} fill={INKC} />
        <path d={puff > 0.5 ? "M-30 30 Q0 70 30 30 Z" : "M-14 30 Q0 40 14 30"} fill={puff > 0.5 ? "#ff8fa3" : "none"} stroke="#ffffff" strokeWidth={4} />
        {puff > 0.5 && <path d="M-16 34 L-10 48 M16 34 L10 48" stroke="#ffffff" strokeWidth={4} />}
      </g>
    </g>
  );
};
const S4_Cat: React.FC<{ f: number }> = ({ f }) => {
  const puff = eback(ramp(f, F.cat + 10, F.cat + 26));
  return (
    <g>
      <rect width={VW} height={VH} fill="#fff1d6" />
      <rect y={GY - 10} width={VW} height={500} fill="#ead2a6" />
      <g transform={`translate(560 ${GY - 180}) scale(1.25)`}><Cat f={f} puff={clamp01(puff)} /></g>
      {f >= F.cat + 18 && <text x={250} y={620} fontFamily={FONT} fontWeight={800} fontSize={90} fill={RED} stroke={INKC} strokeWidth={8} paintOrder="stroke" transform={`rotate(-8 250 620)`} opacity={pop(f, F.cat + 18, 8)}>HSSS!</text>}
      <Chip x={540} y={380} w={460} label="ANGRY CAT = PUFF" hue={INKC} p={pop(f, F.cat + 4, 10)} fs={36} />
      <Stamp f={f} at={F.same} x={600} y={820} text="SAME REFLEX" hue={PURP} fs={90} />
    </g>
  );
};
const eback = (t: number) => { const c1 = 1.7, c3 = c1 + 1; return t <= 0 ? 0 : t >= 1 ? 1 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

const S5_Lost: React.FC<{ f: number }> = ({ f }) => {
  const furGone = eio(ramp(f, F.lost, F.lost + 40));
  const notes = f >= F.song;
  return (
    <g>
      <Room f={f} tint="#f3ecff" />
      {/* ape fading to kid */}
      <g transform="translate(270 1050)" opacity={1 - furGone}><Ape f={f} fluff={0.3} scale={0.8} /></g>
      <g opacity={furGone}><Kid f={f} x={270} s={1.25} mood={f >= F.scary ? "surprised" : "happy"} shiver={f >= F.prickle ? 0.6 : 0} /></g>
      <Chip x={290} y={460} w={340} label={f < F.kept ? "FUR: GONE" : "REFLEX: KEPT"} hue={f < F.kept ? "#5a3a24" : MINT} p={pop(f, f < F.kept ? F.lost : F.kept, 10)} fs={34} textColor={f < F.kept ? "#ffffff" : INKC} />
      {/* screen */}
      <g transform="translate(780 700)" opacity={eout(ramp(f, F.kept, F.kept + 14))}>
        <rect x={-210} y={-170} width={420} height={330} rx={22} fill="#1b1b24" stroke={INKC} strokeWidth={6} />
        <rect x={-190} y={-150} width={380} height={290} rx={10} fill={f >= F.song ? "#2b1d4a" : "#1d1428"} />
        {f >= F.scary && f < F.song && (
          <g opacity={0.7 + 0.3 * Math.sin(f)}>
            <path d="M-50 90 Q-60 -40 0 -70 Q60 -40 50 90 L32 70 L16 90 L0 70 L-16 90 L-32 70 Z" fill="#f1f1f1" />
            <circle cx={-18} cy={-16} r={11} fill="#1d1428" /><circle cx={18} cy={-16} r={11} fill="#1d1428" />
            <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ff6070">SCARY MOVIE</text>
          </g>
        )}
        {f < F.scary && <path d="M-30 -50 L50 0 L-30 50 Z" fill="#ffffff" opacity={0.8} />}
        {notes && (
          <g>
            {[...Array(5)].map((_, i) => <rect key={i} x={-150 + i * 64} y={50 - (14 + 60 * Math.abs(Math.sin(f * 0.25 + i)))} width={40} height={14 + 60 * Math.abs(Math.sin(f * 0.25 + i))} rx={8} fill={[PINK, YEL, MINT, BLUE, PURP][i]} />)}
            <text y={130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff">A SONG YOU LOVE</text>
          </g>
        )}
      </g>
      {notes && [...Array(6)].map((_, i) => {
        const q = ((f - F.song) * 0.012 + i * 0.17) % 1;
        return <text key={i} x={560 + i * 70 + Math.sin(q * 6) * 20} y={1050 - q * 400} fontFamily={FONT} fontWeight={800} fontSize={60} fill={[PURP, PINK, BLUE][i % 3]} opacity={1 - q}>♪</text>;
      })}
      {f >= F.prickle - 10 && <SkinBubble f={f} x={780} y={1220} r={120} bumps={ramp(f, F.prickle - 10, F.prickle + 20)} />}
    </g>
  );
};
const S6_Useless: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room f={f} tint="#e9f7ff" />
    <Kid f={f} x={300} s={1.4} mood={f >= F.notquite ? "surprised" : "neutral"} />
    <Sci f={f} x={790} s={1.3} wave={f >= F.notquite ? 1 : 0} />
    <g opacity={pop(f, F.useless + 4, 10)}>
      <rect x={90} y={420} width={420} height={140} rx={30} fill="#ffffff" stroke={INKC} strokeWidth={5} />
      <path d="M250 560 L230 610 L300 560 Z" fill="#ffffff" stroke={INKC} strokeWidth={5} />
      <text x={300} y={505} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>USELESS?</text>
    </g>
    {f >= F.notquite && (
      <g opacity={pop(f, F.notquite, 10)}>
        <rect x={560} y={330} width={440} height={140} rx={30} fill={YEL} stroke={INKC} strokeWidth={5} />
        <path d="M760 470 L790 520 L820 470 Z" fill={YEL} stroke={INKC} strokeWidth={5} />
        <text x={780} y={418} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INKC}>NOT QUITE!</text>
      </g>
    )}
  </g>
);
const S7_Harvard: React.FC<{ f: number }> = ({ f }) => {
  const card = pop(f, F.y2020, 12);
  const toDiagram = eio(ramp(f, F.nerve2 - 20, F.nerve2));
  const zap = ramp(f, F.nerve2, F.wakes);
  const glow = eout(ramp(f, F.stem - 6, F.stem + 14));
  const grow = eout(ramp(f, F.newhair, F.newhair + 30));
  return (
    <g>
      <g opacity={toDiagram}><Follicle f={f} contract={1} zap={zap} glowStem={glow} grow={grow} showLabels={false} /></g>
      {toDiagram < 1 && <rect width={VW} height={VH} fill="#f6f8ff" opacity={1 - toDiagram} />}
      <g opacity={1 - toDiagram} transform={`translate(540 ${lerp(720, 330, toDiagram)}) scale(${lerp(1, 0.62, toDiagram) * card})`}>
        <rect x={-330} y={-200} width={660} height={400} rx={18} fill="#ffffff" stroke={INKC} strokeWidth={6} />
        <rect x={-330} y={-200} width={660} height={90} rx={18} fill="#a51c30" />
        <text y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill="#ffffff" letterSpacing={4}>HARVARD · 2020</text>
        <text y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INKC}>Published in CELL</text>
        {[0, 1, 2].map((i) => <rect key={i} x={-270} y={20 + i * 44} width={540 - i * 110} height={18} rx={9} fill="#d9dde8" />)}
      </g>
      {f >= F.wakes && <Chip x={760} y={1060} w={340} label="STEM CELLS" hue={MINT} p={pop(f, F.stem, 10)} fs={36} textColor={INKC} />}
      {f >= F.newhair && <Chip x={760} y={640} w={300} label="NEW HAIR!" hue={PURP} p={pop(f, F.newhair + 10, 10)} fs={36} />}
      {f >= F.nerve2 && f < F.wakes + 10 && <Chip x={880} y={1330} w={260} label="SAME NERVE" hue="#d99a00" p={pop(f, F.nerve2, 10)} fs={32} textColor={INKC} />}
    </g>
  );
};
const S8_Mouse: React.FC<{ f: number }> = ({ f }) => {
  const fur = eout(ramp(f, F.cold2 + 10, F.weeks + 10));
  const days = Math.min(13, Math.floor(ramp(f, F.cold2, F.weeks) * 13));
  return (
    <g>
      <rect width={VW} height={VH} fill="#e3f1ff" />
      <Drift f={f} n={40} color="#ffffff" seed="snow3" maxR={6} speed={-1.6} opacity={0.95} />
      <rect y={1250} width={VW} height={700} fill="#f7fbff" />
      <path d={`M0 1250 Q 540 1215 1080 1250`} stroke="#c9dcf0" strokeWidth={10} fill="none" />
      {/* mouse */}
      <g transform="translate(460 1180)">
        <path d="M150 20 Q 260 40 300 -40" stroke="#c99aa0" strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse rx={170} ry={110} fill="#b9b9c4" stroke={INKC} strokeWidth={6} />
        {[...Array(26)].map((_, i) => {
          const a = Math.PI + (i / 25) * Math.PI;
          return <line key={i} x1={Math.cos(a) * 160} y1={Math.sin(a) * 100} x2={Math.cos(a) * (160 + 28 * fur)} y2={Math.sin(a) * (100 + 26 * fur)} stroke="#9a9aa8" strokeWidth={8} strokeLinecap="round" opacity={fur} />;
        })}
        <circle cx={-150} cy={-70} r={46} fill="#d8b8bc" stroke={INKC} strokeWidth={5} />
        <circle cx={-190} cy={-10} r={50} fill="#b9b9c4" stroke={INKC} strokeWidth={5} />
        <circle cx={-205} cy={-22} r={8} fill={INKC} />
        <circle cx={-240} cy={0} r={9} fill="#ff8fa3" />
        <path d="M-240 4 L-290 -10 M-240 6 L-292 10" stroke={INKC} strokeWidth={3} />
      </g>
      {/* thermometer */}
      <g transform="translate(880 720)" opacity={pop(f, F.mice + 10, 10)}>
        <rect x={-30} y={-220} width={60} height={300} rx={30} fill="#ffffff" stroke={INKC} strokeWidth={6} />
        <rect x={-14} y={-60} width={28} height={140} rx={14} fill={BLUE} />
        <circle cy={100} r={50} fill={BLUE} stroke={INKC} strokeWidth={6} />
        <text x={-70} y={-160} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={42} fill={BLUE}>COLD</text>
      </g>
      {/* calendar */}
      <g transform="translate(330 560)" opacity={pop(f, F.cold2, 10)}>
        <rect x={-200} y={-150} width={400} height={300} rx={20} fill="#ffffff" stroke={INKC} strokeWidth={6} />
        <rect x={-200} y={-150} width={400} height={70} rx={20} fill={RED} />
        <text y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#ffffff">DAY {days + 1}</text>
        {[...Array(14)].map((_, i) => <g key={i}><rect x={-170 + (i % 7) * 50} y={-60 + Math.floor(i / 7) * 90} width={40} height={60} rx={6} fill={i <= days ? MINT : "#eef1f6"} stroke={INKC} strokeWidth={2} /></g>)}
      </g>
      {f >= F.weeks && <BigNum f={f} at={F.weeks} text="< 2 WEEKS" x={540} y={330} hue={MINT} fs={110} />}
      <Chip x={460} y={1420} w={420} label="NEW HAIR GROWS" hue={PURP} p={pop(f, F.weeks + 6, 10)} fs={34} />
    </g>
  );
};
const S9_Warm: React.FC<{ f: number }> = ({ f }) => {
  const glow = eout(ramp(f, F.warm - 10, F.warm + 20));
  return (
    <g>
      <rect width={VW} height={VH} fill={mix("#dff3ff", "#ffe9cf", glow)} />
      <circle cx={540} cy={1000} r={520} fill={ORANGE} opacity={0.18 * glow} />
      <circle cx={540} cy={1000} r={360} fill={YEL} opacity={0.18 * glow} />
      <rect y={GY - 10} width={VW} height={500} fill={mix("#b9c8de", "#f2c79a", glow)} />
      <Kid f={f} x={360} s={1.35} mood="happy" shiver={1 - glow} />
      <Sci f={f} x={760} s={1.25} />
      <Chip x={540} y={360} w={560} label="NOT USELESS LEFTOVERS" hue={INKC} p={pop(f, F.leftovers + 6, 10)} fs={34} />
      {f >= F.warm && <g>
        <text x={540} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#ffffff" stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.warm, 10)}>STILL TRYING TO</text>
        <text x={540} y={605} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={74} fill={ORANGE} stroke={INKC} strokeWidth={10} paintOrder="stroke" opacity={pop(f, F.warm + 8, 10)}>KEEP YOU WARM</text>
      </g>}
    </g>
  );
};
const S10_Outro: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#1d2440" />
    <Drift f={f} n={26} color={YEL} seed="outro" maxR={4} speed={0.6} opacity={0.5} />
    <Outro f={f} at={F.sub} />
    <Kid f={f} x={140} y={1600} s={0.95} mood="happy" wave={1} />
    <Sci f={f} x={950} y={1600} s={0.9} wave={1} />
  </g>
);

export const GoosebumpsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const SHOTS: Shot[] = [
    { from: 0, to: 160, render: () => <S1_Hook f={f} />, cam: [[0, { x: 560, y: 1050, z: 1.3 }], [60, { x: 480, y: 900, z: 1.12 }], [120, { x: 620, y: 960, z: 1.08 }], [160, { x: 330, y: 620, z: 1.5 }]] },
    { from: 160, to: F.ancestors, tr: "iris", trLen: 16, render: () => <S2_Micro f={f} />, cam: [[160, { x: 540, y: 900, z: 1.6 }], [F.nerves, { x: 640, y: 1020, z: 1.15 }], [F.tighten + 10, { x: 600, y: 980, z: 1.25 }], [F.stands + 10, { x: 520, y: 700, z: 1.12 }], [F.ancestors, { x: 540, y: 820, z: 1.02 }]] },
    { from: F.ancestors, to: F.cat, tr: "whip", render: () => <S3_Ancestors f={f} />, cam: [[F.ancestors, { x: 540, y: 1100, z: 1.3 }], [F.traps, { x: 540, y: 900, z: 1.12 }], [F.bigger, { x: 540, y: 960, z: 1.0 }], [F.cat, { x: 600, y: 1000, z: 1.1 }]] },
    { from: F.cat, to: F.lost, tr: "zoom", render: () => <S4_Cat f={f} />, cam: [[F.cat, { x: 300, y: 1150, z: 1.35 }], [F.cat + 30, { x: 520, y: 1100, z: 1.1 }], [F.lost, { x: 560, y: 900, z: 1.18, r: -2 }]] },
    { from: F.lost, to: F.useless, tr: "push", render: () => <S5_Lost f={f} />, cam: [[F.lost, { x: 300, y: 1050, z: 1.25 }], [F.scary, { x: 620, y: 860, z: 1.12 }], [F.prickle, { x: 720, y: 1080, z: 1.25 }], [F.useless, { x: 760, y: 1150, z: 1.4 }]] },
    { from: F.useless, to: F.y2020, tr: "wipe", render: () => <S6_Useless f={f} />, cam: [[F.useless, { x: 330, y: 900, z: 1.25 }], [F.notquite, { x: 760, y: 820, z: 1.2 }], [F.y2020, { x: 700, y: 900, z: 1.1 }]] },
    { from: F.y2020, to: F.mice, tr: "flash", render: () => <S7_Harvard f={f} />, cam: [[F.y2020, { x: 540, y: 760, z: 1.15 }], [F.nerve2, { x: 600, y: 1000, z: 1.12 }], [F.stem, { x: 560, y: 1080, z: 1.35 }], [F.newhair + 20, { x: 600, y: 900, z: 1.15 }], [F.mice, { x: 600, y: 760, z: 1.08 }]] },
    { from: F.mice, to: F.leftovers, tr: "whipUp", render: () => <S8_Mouse f={f} />, cam: [[F.mice, { x: 460, y: 1150, z: 1.3 }], [F.cold2, { x: 380, y: 700, z: 1.15 }], [F.weeks, { x: 540, y: 600, z: 1.08 }], [F.leftovers, { x: 480, y: 1000, z: 1.12 }]] },
    { from: F.leftovers, to: F.sub, tr: "spin", render: () => <S9_Warm f={f} />, cam: [[F.leftovers, { x: 540, y: 1000, z: 1.3, r: 2 }], [F.warm, { x: 540, y: 820, z: 1.05, r: 0 }], [F.sub, { x: 540, y: 900, z: 1.0 }]] },
    { from: F.sub, to: TOTAL + 1, tr: "zoom", render: () => <S10_Outro f={f} />, cam: [[F.sub, { x: 540, y: 1000, z: 1.12 }], [TOTAL, { x: 540, y: 960, z: 1.0 }]] },
  ];
  const PUNCH: [number, number][] = [[F.tighten + 8, 0.1], [F.bump, 0.14], [F.bigger, 0.08], [F.cat + 18, 0.14], [F.same, 0.1], [F.notquite, 0.1], [F.stem, 0.1], [F.weeks, 0.14], [F.warm, 0.08]];
  const SHAKE: [number, number][] = [[F.bump, 10], [F.cat + 18, 16], [F.same, 10], [F.weeks, 10]];
  const SFX: Cue[] = [
    [20, "pop", 0.4], [40, "tick", 0.3], [F.every - 6, "whoosh", 0.3],
    [F.nerves, "riser", 0.25], [F.tighten + 8, "impact", 0.4], [F.stands, "pop", 0.4], [F.bump, "boom", 0.35],
    [F.ancestors + 6, "pop", 0.35], [F.traps, "pop", 0.35], [F.bigger, "impact", 0.4],
    [F.cat + 18, "impact", 0.55], [F.same, "boom", 0.3],
    [F.lost, "pop", 0.3], [F.kept, "pop", 0.3], [F.scary, "impact", 0.35], [F.song, "pop", 0.35], [F.prickle - 6, "tick", 0.4],
    [F.useless + 4, "pop", 0.4], [F.notquite, "impact", 0.45],
    [F.nerve2 - 60, "riser", 0.25], [F.stem, "pop", 0.4], [F.newhair + 10, "pop", 0.4],
    [F.cold2, "tick", 0.3], [F.weeks, "boom", 0.35], [F.weeks + 6, "pop", 0.35],
    [F.leftovers + 6, "pop", 0.35], [F.warm, "impact", 0.4], [F.warm + 8, "pop", 0.35],
    [F.sub + 4, "pop", 0.4], [F.sub + 34, "click", 0.6],
  ];
  const fade = Math.min(eout(ramp(f, 0, 6)), 1 - ramp(f, TOTAL - 16, TOTAL - 2));
  const accent = f < F.ancestors ? BLUE : f < F.useless ? PURP : f < F.leftovers ? MINT : YEL;
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <FontStyle />
      <Director f={f} shots={SHOTS} punches={PUNCH} shakes={SHAKE} />
      <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
        <Brand f={f} light={f < F.sub} />
        <Cover f={f} word="GOOSEBUMPS" sub="WHY DO WE GET THEM?" until={56} />
      </svg>
      <Vignette />
      <Caps f={f} words={WORDS} chunks={CHUNKS} accent={accent} theme={f >= F.sub ? "dark" : "light"} hide={f < 30} />
      <AbsoluteFill style={{ background: "#000000", opacity: 1 - fade, pointerEvents: "none" }} />
      <Narration slug="goosebumps" total={TOTAL} />
      <Sfx cues={[...SFX, ...transitionCues(SHOTS)]} />
    </AbsoluteFill>
  );
};
