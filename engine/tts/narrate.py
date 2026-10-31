#!/usr/bin/env python3
"""
Narrate a script with Kokoro and emit exact phrase timings — supports multiple speakers.

    python3 narrate.py script.txt out_dir [--voice am_adam] [--speed 1.1]

Speaker tags (optional) at the start of a paragraph:  [voice_id:Name] text...
e.g.  [af_sky:kid] What if Earth suddenly stopped spinning?
      [am_adam:host] If you live near the equator...
Untagged paragraphs use --voice and speaker name "host".
Writes out_dir/narration.mp3 and out_dir/sents.json ([[phrase, start_s, end_s, speaker], ...]).
"""
import re, sys, json, os, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
src, out = args[0], args[1]
voice0 = args[args.index("--voice") + 1] if "--voice" in args else "am_adam"
speed = float(args[args.index("--speed") + 1]) if "--speed" in args else 1.1
os.makedirs(out, exist_ok=True)

parts = []  # (phrase, para_index, voice, speaker)
for pi, para in enumerate([p.strip() for p in open(src).read().split("\n") if p.strip()]):
    v, who = voice0, "host"
    m = re.match(r"\[([a-z]{2}_[a-z]+)(?::([A-Za-z0-9_-]+))?\]\s*(.*)", para)
    if m:
        v, who, para = m.group(1), (m.group(2) or m.group(1)), m.group(3)
    for mm in re.finditer(r'.+?(?:\.\.\.|[.?!](?=\s|$)|$)', para):
        s = mm.group(0).strip()
        if s:
            parts.append((s, pi, v, who))
k = Kokoro(os.path.join(HERE, "kokoro-v1.0.onnx"), os.path.join(HERE, "voices-v1.0.bin"))
sr = 24000

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(0.02 * sr)): min(len(a), idx[-1] + int(0.05 * sr))]

audio, sents, t = [np.zeros(int(0.08 * sr), dtype=np.float32)], [], 0.08
for i, (ph, pi, v, who) in enumerate(parts):
    say = ph[:-3] + "," if ph.endswith("...") else ph
    a, _ = k.create(say, voice=v, speed=speed, lang="en-gb" if v.startswith("b") else "en-us")
    a = trim(a.astype(np.float32))
    d = len(a) / sr
    sents.append([ph, round(t, 3), round(t + d, 3), who])
    audio.append(a)
    t += d
    last_in_para = (i + 1 == len(parts)) or parts[i + 1][1] != pi
    speaker_change = (i + 1 < len(parts)) and parts[i + 1][3] != who
    gap = 0.6 if speaker_change else 0.55 if last_in_para else (0.42 if ph.endswith("...") else 0.3)
    audio.append(np.zeros(int(gap * sr), dtype=np.float32))
    t += gap
wav = os.path.join(out, "_raw.wav")
sf.write(wav, np.concatenate(audio), sr)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k",
                os.path.join(out, "narration.mp3")], check=True)
os.remove(wav)
json.dump(sents, open(os.path.join(out, "sents.json"), "w"), indent=0)
words = sum(len(p[0].split()) for p in parts)
spk = sorted(set(p[3] for p in parts))
print(f"{os.path.basename(out)}: {len(sents)} phrases, {t:.1f}s, {words} words, {words / t * 60:.0f} wpm, speakers={spk}")
