#!/usr/bin/env python3
"""
Word timing + lip-sync generator for the stick-figure Remotion films.

Usage:
    python3 engine/gen_words.py episodes/<ep>/sents.json episodes/<ep>/narration.mp3 episodes/<ep>/words.ts [--tail 70]

Input
  sents.json  : list of [phrase_text, start_sec, end_sec]. One entry per spoken phrase.
                Build it by running silencedetect on the narration and mapping each pause-to-pause
                window onto the script text (see docs/pipeline.md step 3):
                  ffmpeg -i narration.mp3 -af silencedetect=noise=-32dB:d=0.22 -f null - 2>&1 | grep silence_
  narration   : Uzair's ElevenLabs MP3 for the episode.

Output (words.ts)
  WORDS   : [startFrame, endFrame, word][]   word-level timing (film frame = 15 + round(sec*30))
  CHUNKS  : [firstWordIdx, lastWordIdx][]    caption groups of 2-4 words, broken at punctuation
  VOICE_END, TOTAL (= VOICE_END + tail frames for the outro hold)
  ENV     : number[]  per-frame voice loudness 0..1 (30 fps) -> drives the stick figure's mouth (lip-sync)

Why proportional timing: whisper/forced alignment is not installed in the workspace and the ElevenLabs
API is blocked by the egress proxy, so words inside each pause-bounded phrase are spread by character
length. In practice this lands within 1-2 frames of the real word on clean ElevenLabs speech.
"""
import json, math, struct, subprocess, sys, tempfile, os

def main():
    if len(sys.argv) < 4:
        print(__doc__); sys.exit(1)
    sents_path, audio_path, out_path = sys.argv[1:4]
    tail = 70
    if "--tail" in sys.argv:
        tail = int(sys.argv[sys.argv.index("--tail") + 1])
    sents = json.load(open(sents_path))

    W, CH = [], []
    wi = 0
    for row in sents:
        s, t0, t1 = row[0], row[1], row[2]
        toks = s.split()
        cw = [len(t) + 1 for t in toks]
        ct = sum(cw)
        t = t0
        start = wi
        for k, tok in enumerate(toks):
            d = cw[k] / ct * (t1 - t0)
            f0 = 15 + round(t * 30)
            f1 = 15 + round((t + d) * 30)
            W.append((f0, f1, tok.replace('"', '\\"')))
            t += d
            wi += 1
        i = start
        while i < wi:
            j = min(i + 3, wi - 1)
            for k in range(i, min(i + 4, wi)):
                w = W[k][2]
                if w.endswith(("...", ".", ",", "—", "?", "!", ":")):
                    j = k
                    break
            CH.append((i, j))
            i = j + 1

    # loudness envelope at 30 fps for lip-sync
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, "pcm.raw")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", audio_path, "-ac", "1", "-ar", "30000",
                        "-f", "s16le", raw], check=True)
        data = open(raw, "rb").read()
    n = len(data) // 2
    samples = struct.unpack("<%dh" % n, data)
    env = []
    for i in range(0, n, 1000):  # 30000 Hz / 30 fps
        ch = samples[i:i + 1000]
        if not ch:
            break
        env.append(math.sqrt(sum(x * x for x in ch) / len(ch)) / 32768.0)
    mx = max(env) or 1
    env = [e / mx for e in env]
    env = [0 if e < 0.09 else e ** 0.7 for e in env]          # noise gate + gamma
    sm = [sum(env[max(0, i - 1):i + 2]) / len(env[max(0, i - 1):i + 2]) for i in range(len(env))]  # 3-frame smooth

    end = W[-1][1]
    lines = ["export const WORDS: [number, number, string][] = ["]
    lines += [f'  [{a}, {b}, "{w}"],' for a, b, w in W]
    lines.append("];")
    lines.append("export const CHUNKS: [number, number][] = [" + ", ".join(f"[{a}, {b}]" for a, b in CH) + "];")
    lines.append(f"export const VOICE_END = {end};")
    lines.append(f"export const TOTAL = {end + tail};")
    lines.append("export const ENV: number[] = [" + ",".join(str(round(e, 3)) for e in sm) + "];")
    spk = [f'[{15 + round(r[1] * 30)}, {15 + round(r[2] * 30)}, "{r[3] if len(r) > 3 else "host"}"]' for r in sents]
    lines.append("/** phrase windows per speaker: [startFrame, endFrame, speaker] */")
    lines.append("export const SPK: [number, number, string][] = [" + ", ".join(spk) + "];")
    open(out_path, "w").write("\n".join(lines) + "\n")
    print(f"words {len(W)}  chunks {len(CH)}  voice_end {end}  total {end + tail}  env {len(sm)}")
    print("cue table (frame : phrase):")
    for row in sents:
        print(f"  {15 + round(row[1] * 30):5d} : {(row[3] + ': ') if len(row) > 3 else ''}{row[0][:60]}")

if __name__ == "__main__":
    main()
