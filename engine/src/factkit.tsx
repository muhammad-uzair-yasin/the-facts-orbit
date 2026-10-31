// factkit.tsx — shared building blocks for The Facts Orbit films (on top of kit.tsx).
// Cover frame, narration (correct 15-frame offset), sound-effect track, captions (dark + light),
// channel chip, props (chips, kinetic numbers, stamps, cursor, counters) and the subscribe outro.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { CAPTION_FONT, VW, VH, clamp01, lerp, ramp, eio, eout, pop, rnd } from "./kit";

export const FONT = "InterLocal, Inter, sans-serif";
export const YEL = "#FFD60A";
export const INKC = "#111118";

// ---------- audio ----------
/** Narration always starts at frame 15 (word timings are 15 + sec*30). */
export const Narration: React.FC<{ slug: string; total: number; volume?: number }> = ({ slug, total, volume = 1 }) => (
  <Sequence from={15} durationInFrames={total - 15}>
    <Audio src={staticFile(`projects/${slug}/narration.wav`)} volume={volume} />
  </Sequence>
);
/** Sound-effect cues: [frame, name, volume]. Names = files in engine/public/sfx (CC0):
 *  whoosh (cuts/moves, start 2 frames early), pop (appear), impact (reveal), boom (big reveal),
 *  riser (2 s build ending on a hit), riser_dark (6 s ominous build), click (cursor), tick (tiny UI). */
export type Cue = [number, string, number?];
export const Sfx: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map(([at, name, vol], i) => (
      <Sequence key={i} from={Math.max(0, Math.round(at))}>
        <Audio src={staticFile(`sfx/${name}.ogg`)} volume={vol ?? 0.35} />
      </Sequence>
    ))}
  </>
);

// ---------- captions ----------
/** Word-by-word highlight captions. theme "dark" = white text on dark sets, "light" = ink text on light sets. */
export const Caps: React.FC<{ f: number; words: [number, number, string][]; chunks: [number, number][]; accent: string; theme?: "dark" | "light"; y?: number; hide?: boolean }> = ({ f, words, chunks, accent, theme = "dark", y = 1640, hide }) => {
  if (hide) return null;
  const c = chunks.find(([a, b], k) => f >= words[a][0] - 2 && f < (chunks[k + 1] ? Math.min(words[chunks[k + 1][0]][0] - 2, words[b][1] + 24) : words[b][1] + 24));
  if (!c) return null;
  const dark = theme === "dark";
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.3 }}>
      {words.slice(c[0], c[1] + 1).map(([w0, w1, t], i) => {
        const active = f >= w0 && f <= w1 + 2;
        const said = f > w1 + 2;
        const k = active ? 1 + 0.08 * Math.sin(clamp01((f - w0) / 5) * Math.PI) : 1;
        return (
          <span key={i} style={{
            display: "inline-block", margin: "0 9px", transform: `scale(${k})`,
            color: active ? (accent === YEL ? INKC : "#fff") : dark ? (said ? "#fff" : "rgba(255,255,255,0.42)") : (said ? INKC : "rgba(17,17,24,0.38)"),
            background: active ? accent : "transparent", borderRadius: 14, padding: active ? "2px 14px" : "2px 0",
            boxShadow: active ? "0 6px 18px rgba(0,0,0,0.35)" : "none",
            textShadow: active || !dark ? "none" : "0 3px 0 rgba(0,0,0,0.65), 0 0 18px rgba(0,0,0,0.55)",
          }}>{t}</span>
        );
      })}
    </div>
  );
};

// ---------- cover + chrome ----------
/** Frames 0–~40: one huge yellow outlined keyword (the thumbnail frame), then it shrinks into a top title chip. */
export const Cover: React.FC<{ f: number; word: string; sub?: string; until?: number }> = ({ f, word, sub, until = 999999 }) => {
  const shrink = eio(ramp(f, 22, 38));
  const big = word.length > 7 ? 190 : 250;
  const fs = lerp(big, 64, shrink);
  const y = lerp(VH * 0.42, 300, shrink);
  const out = 1 - ramp(f, until, until + 10);
  if (out <= 0) return null;
  const wob = f < 22 ? Math.sin(f * 0.6) * 1.2 : 0;
  return (
    <g opacity={out}>
      {f < 30 && <rect width={VW} height={VH} fill="#000" opacity={0.35 * (1 - ramp(f, 18, 30))} />}
      <g transform={`translate(${VW / 2} ${y}) rotate(${wob - 2 * (1 - shrink)})`}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={YEL} stroke={INKC} strokeWidth={lerp(22, 9, shrink)}
          paintOrder="stroke" strokeLinejoin="round" letterSpacing={2}
          textLength={Math.min(VW - 120, word.length * fs * 0.66)} lengthAdjust="spacingAndGlyphs">{word}</text>
        {sub && shrink < 0.5 && (
          <text y={fs * 0.55} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" stroke={INKC} strokeWidth={10}
            paintOrder="stroke" opacity={1 - shrink * 2}>{sub}</text>
        )}
      </g>
    </g>
  );
};
/** Small channel chip, top-left, from frame 30. */
export const Brand: React.FC<{ f: number; light?: boolean }> = ({ f, light }) => {
  const p = eout(ramp(f, 30, 44));
  return (
    <g opacity={p} transform={`translate(${lerp(-260, 46, p)} 70)`}>
      <rect width={300} height={58} rx={29} fill={light ? "#fff" : "rgba(10,12,28,0.72)"} stroke={light ? INKC : YEL} strokeWidth={3} />
      <circle cx={30} cy={29} r={12} fill="none" stroke={YEL} strokeWidth={4} />
      <circle cx={30} cy={29} r={4} fill={YEL} />
      <text x={54} y={39} fontFamily={FONT} fontWeight={800} fontSize={26} fill={light ? INKC : "#fff"} letterSpacing={2}>FACTS ORBIT</text>
    </g>
  );
};

// ---------- props ----------
export const Chip: React.FC<{ x: number; y: number; w: number; label: string; hue: string; p?: number; fs?: number; dark?: boolean; textColor?: string }> = ({ x, y, w, label, hue, p = 1, fs = 34, dark, textColor }) => (
  <g opacity={clamp01(p)} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * clamp01(p)})`}>
    <rect x={-w / 2} y={-36} width={w} height={72} rx={36} fill={dark ? "rgba(10,12,28,0.85)" : hue} stroke={dark ? hue : INKC} strokeWidth={4} />
    <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={textColor ?? (dark ? hue : "#fff")} letterSpacing={2}>{label}</text>
  </g>
);
/** Kinetic number: pops in with overshoot, ghost shadow behind. */
export const BigNum: React.FC<{ f: number; at: number; text: string; x: number; y: number; hue: string; fs?: number; stroke?: string }> = ({ f, at, text, x, y, hue, fs = 180, stroke = INKC }) => {
  const p = pop(f, at, 12);
  if (p <= 0) return null;
  return (
    <g>
      <text x={x + 10} y={y + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={hue} opacity={0.22 * clamp01(p)}>{text}</text>
      <g transform={`translate(${x} ${y}) scale(${p})`}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={hue} stroke={stroke} strokeWidth={8} paintOrder="stroke">{text}</text>
      </g>
    </g>
  );
};
/** Counter that counts up between frames a→b. */
export const countUp = (f: number, a: number, b: number, to: number) => Math.round(eout(ramp(f, a, b)) * to);
export const Stamp: React.FC<{ f: number; at: number; x: number; y: number; text: string; hue: string; fs?: number; rot?: number }> = ({ f, at, x, y, text, hue, fs = 96, rot = -10 }) => {
  const p = ramp(f, at, at + 9);
  if (p <= 0) return null;
  const w = text.length * fs * 0.66 + 70;
  return (
    <g opacity={clamp01(p * 2)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${lerp(2.1, 1, eio(p))})`}>
      <rect x={-w / 2} y={-fs * 0.78} width={w} height={fs * 1.5} rx={18} fill="none" stroke={hue} strokeWidth={11} />
      <text y={fs * 0.32} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={hue} letterSpacing={6}>{text}</text>
    </g>
  );
};
export const Cursor: React.FC<{ x: number; y: number; f: number; clickAt?: number }> = ({ x, y, f, clickAt }) => (
  <g>
    {clickAt !== undefined && [0, 1].map((i) => {
      const q = clamp01((f - clickAt - i * 5) / 20); if (q <= 0 || q >= 1) return null;
      return <circle key={i} cx={x} cy={y} r={14 + q * 60} fill="none" stroke={YEL} strokeWidth={(1 - q) * 9} opacity={1 - q} />;
    })}
    <path d={`M ${x} ${y} l 0 56 l 16 -13 l 11 25 l 13 -6 l -11 -25 l 20 -2 z`} fill="#fff" stroke={INKC} strokeWidth={5} strokeLinejoin="round"
      transform={clickAt !== undefined && f >= clickAt && f < clickAt + 5 ? `translate(${x} ${y}) scale(0.88) translate(${-x} ${-y})` : undefined} />
  </g>
);
/** Floating dust/stars/bubbles: n particles drifting upward, deterministic. */
export const Drift: React.FC<{ f: number; n?: number; color: string; seed: string; maxR?: number; speed?: number; area?: [number, number, number, number]; opacity?: number }> = ({ f, n = 24, color, seed, maxR = 5, speed = 0.6, area = [0, 0, VW, VH], opacity = 0.5 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const [x0, y0, w, h] = area;
      const x = x0 + rnd(seed + "x" + i) * w + Math.sin(f * 0.02 + i) * 14;
      const y = y0 + ((rnd(seed + "y" + i) * h - f * speed * (0.5 + rnd(seed + "s" + i))) % h + h) % h;
      return <circle key={i} cx={x} cy={y} r={1.5 + rnd(seed + "r" + i) * maxR} fill={color} opacity={opacity * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i)))} />;
    })}
  </g>
);

// ---------- outro ----------
/** Subscribe end card: button pops, cursor flies in and clicks, "A NEW FACT EVERY DAY". */
export const Outro: React.FC<{ f: number; at: number; light?: boolean }> = ({ f, at, light }) => {
  const bp = pop(f, at + 4, 14);
  const click = at + 34;
  const cx = lerp(900, 640, eio(ramp(f, at + 14, at + 32)));
  const cy = lerp(1360, 1000, eio(ramp(f, at + 14, at + 32)));
  const pulse = f >= click ? 1 + 0.05 * Math.sin((f - click) * 0.3) : 1;
  if (f < at) return null;
  return (
    <g>
      <g transform={`translate(${VW / 2} 960) scale(${bp * pulse})`}>
        <rect x={-290} y={-82} width={580} height={164} rx={82} fill={f >= click ? "#3a3a44" : "#e62117"} />
        <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#fff" letterSpacing={3}>{f >= click ? "SUBSCRIBED ✓" : "SUBSCRIBE"}</text>
      </g>
      {f >= at + 14 && <Cursor x={cx} y={cy} f={f} clickAt={click} />}
      <g opacity={eout(ramp(f, click + 6, click + 18))}>
        <text x={VW / 2} y={1170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={light ? INKC : "#fff"} letterSpacing={3}>A NEW FACT</text>
        <text x={VW / 2} y={1240} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={YEL} stroke={INKC} strokeWidth={6} paintOrder="stroke" letterSpacing={3}>EVERY SINGLE DAY</text>
      </g>
    </g>
  );
};
