#!/usr/bin/env python3
"""Two-pass verification of a rendered episode.
usage: verify.py <episode_dir>
 - audio check: cross-correlates render audio vs narration.mp3; expects the voice to start at frame 15 (0.5 s)
 - duration check: video length == TOTAL frames
 - pass A: one frame per second (t = 0,1,2..), pass B: half-seconds (0.5,1.5..)
   each thumb labeled: time, frame, speaker (from SPK) and the word being spoken (from WORDS)
Writes <ep>/qa/passA_1.jpg, passA_2.jpg, passB_1.jpg, passB_2.jpg and prints a report.
"""
import sys, os, re, json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont

ep = sys.argv[1].rstrip('/')
src = open(os.path.join(ep, 'words.ts')).read()
def arr(name):
    m = re.search(r'export const %s[^=]*=\s*(\[.*?\]);\n' % name, src, re.S)
    return json.loads(re.sub(r',\s*\]', ']', m.group(1).replace('\n', '')))
WORDS = arr('WORDS'); SPK = arr('SPK')
TOTAL = int(re.search(r'export const TOTAL = (\d+)', src).group(1))
mp4 = os.path.join(ep, 'render.mp4')
qa = os.path.join(ep, 'qa'); os.makedirs(qa, exist_ok=True)

def pcm(path, sr=8000):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32)

# --- audio sync
sr = 8000
a = pcm(mp4, sr); b = pcm(os.path.join(ep, 'narration.mp3'), sr)
def env(x, hop=80):
    n = len(x) // hop
    return np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
ea, eb = env(a), env(b)  # 100 Hz envelopes
ea = (ea - ea.mean()) / (ea.std() + 1e-9); eb = (eb - eb.mean()) / (eb.std() + 1e-9)
best, bo = -1e9, 0
for off in range(0, 200):  # 0..2 s
    L = min(len(eb), len(ea) - off)
    c = float(np.dot(ea[off:off + L], eb[:L]) / L)
    if c > best: best, bo = c, off
offset = bo / 100.0
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout)
nb = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip().strip(',')
print(f'audio offset {offset:.2f}s (expect 0.50) corr {best:.2f} | frames {nb} (TOTAL {TOTAL}) | dur {dur:.1f}s')
ok = abs(offset - 0.5) <= 0.07 and best > 0.6 and abs(int(nb) - TOTAL) <= 1

# --- frame passes
def label(fr):
    who = next((s[2] for s in SPK if s[0] <= fr < s[1] + 4), '-')
    w = next((x[2] for x in WORDS if x[0] <= fr < x[1]), '')
    return who, w
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    font = ImageFont.load_default()
def sheet(times, out_prefix):
    tw, th = 216, 384
    thumbs = []
    tmp = os.path.join(qa, '_f'); os.makedirs(tmp, exist_ok=True)
    sel = '+'.join('eq(n\\,%d)' % int(round(t * 30)) for t in times)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf', f"select='{sel}',scale={tw}:{th}", '-vsync', '0', os.path.join(tmp, '%04d.png')], check=True)
    files = sorted(os.listdir(tmp))
    for t, fn in zip(times, files):
        im = Image.open(os.path.join(tmp, fn)).convert('RGB')
        fr = int(round(t * 30)); who, w = label(fr)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, tw, 40], fill=(0, 0, 0))
        col = (255, 210, 60) if who == 'asker' else (120, 220, 255) if who == 'host' else (200, 200, 200)
        d.text((4, 2), f'{t:.1f}s f{fr} {who.upper()}', fill=col, font=font)
        d.text((4, 20), f'"{w}"', fill=(255, 255, 255), font=font)
        thumbs.append(im); os.remove(os.path.join(tmp, fn))
    cols = 8; per = 40
    outs = []
    for k in range(0, len(thumbs), per):
        chunk = thumbs[k:k + per]; rows = (len(chunk) + cols - 1) // cols
        S = Image.new('RGB', (cols * tw, rows * th), (20, 20, 20))
        for i, im in enumerate(chunk): S.paste(im, ((i % cols) * tw, (i // cols) * th))
        p = f'{out_prefix}_{k // per + 1}.jpg'; S.save(p, quality=82); outs.append(p)
    return outs
n = int(TOTAL / 30)
A = sheet([float(i) for i in range(0, n + 1) if i * 30 < TOTAL], os.path.join(qa, 'passA'))
B = sheet([i + 0.5 for i in range(0, n + 1) if (i + 0.5) * 30 < TOTAL - 1], os.path.join(qa, 'passB'))
print('AUTO', 'OK' if ok else 'PROBLEM'); print('\n'.join(A + B))
