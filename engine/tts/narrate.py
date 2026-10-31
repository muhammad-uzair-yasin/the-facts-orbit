#!/usr/bin/env python3
"""
Narrate a script with Kokoro and emit exact phrase timings.

    python3 narrate.py script.txt out_dir [--voice af_nicole] [--speed 1.35]

Writes out_dir/narration.mp3 and out_dir/sents.json ([[phrase, start_s, end_s], ...]),
ready for engine/gen_words.py. Each phrase is synthesized separately, edge silence trimmed,
then joined with controlled pauses, so caption timing is exact (no silencedetect guessing).
"""
import re, sys, json, os, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
src, out = args[0], args[1]
voice = args[args.index("--voice") + 1] if "--voice" in args else "af_nicole"
speed = float(args[args.index("--speed") + 1]) if "--speed" in args else 1.35
os.makedirs(out, exist_ok=True)

text = open(src).read().strip()
# split into phrases: after "...", ".", "?", "!", and paragraph breaks; keep the punctuation
parts = []
for para in [p.strip() for p in text.split("\n") if p.strip()]:
    for m in re.finditer(r'.+?(?:\.\.\.|[.?!](?=\s|$)|$)', para):
        s = m.group(0).strip()
        if s:
            parts.append((s, para))
k = Kokoro(os.path.join(HERE, "kokoro-v1.0.onnx"), os.path.join(HERE, "voices-v1.0.bin"))
sr = 24000

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(0.02 * sr)): min(len(a), idx[-1] + int(0.05 * sr))]

audio, sents, t = [], [], 0.08
audio.append(np.zeros(int(0.08 * sr), dtype=np.float32))
for i, (ph, para) in enumerate(parts):
    say = ph[:-3] + "," if ph.endswith("...") else ph   # TTS reads '...' oddly; pause is added by us
    a, _ = k.create(say, voice=voice, speed=speed, lang="en-us")
    a = trim(a.astype(np.float32))
    d = len(a) / sr
    sents.append([ph, round(t, 3), round(t + d, 3)])
    audio.append(a)
    t += d
    last_in_para = (i + 1 == len(parts)) or parts[i + 1][1] != para
    gap = 0.55 if last_in_para else (0.42 if ph.endswith("...") else 0.22 if ph.endswith(("—", ",")) else 0.3)
    audio.append(np.zeros(int(gap * sr), dtype=np.float32))
    t += gap
wav = os.path.join(out, "_raw.wav")
sf.write(wav, np.concatenate(audio), sr)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k",
                os.path.join(out, "narration.mp3")], check=True)
os.remove(wav)
json.dump(sents, open(os.path.join(out, "sents.json"), "w"), indent=0)
words = len(text.split())
print(f"{os.path.basename(out)}: {len(sents)} phrases, {t:.1f}s, {words} words, {words / t * 60:.0f} wpm")
