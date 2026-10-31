# How a video is made — step by step

Everything is drawn in code (SVG + React in **Remotion 4.0.242**). Nothing is AI-generated except the voice.
One command rebuilds any episode: `bash engine/render.sh episodes/<episode-dir>`.

## 0. Requirements
Node 18+, ffmpeg, Python 3. `engine/render.sh` runs `npm ci` in `engine/` on first use.
In the Claude cloud workspace Remotion can't download Chrome or Google Fonts (proxy), so the script uses the
pre-installed Playwright chromium (`/opt/pw-browsers/chromium-*/chrome-linux64/chrome`) and a local
Inter 800 font (`engine/public/inter800.woff2`). Elsewhere set `REMOTION_CHROME` or let Remotion download.

## 1. Script
Write it to the rules (docs/rules.md): hook line = topic, verified facts, `...` pauses, channel CTA last.
~140–160 words ≈ 1 minute. Save as `episodes/<YYYY-MM-DD-slug>/script.md`. Send to Uzair to record.

## 2. Voice
Uzair records it in ElevenLabs (his cloned voice) and attaches the MP3 → save as `episodes/<ep>/narration.mp3`.

## 3. Phrase timing (`sents.json`)
```
ffmpeg -i episodes/<ep>/narration.mp3 -af silencedetect=noise=-32dB:d=0.22 -f null - 2>&1 | grep silence_
```
Each pause boundary marks a phrase. Map the script text onto the spoken windows:
`[["Here's everything that happened in AI today...", 0.05, 2.31], ["in two minutes.", 2.78, 3.58], ...]`
(start = previous `silence_end`, end = next `silence_start`).

## 4. Word timings + lip-sync
```
python3 engine/gen_words.py episodes/<ep>/sents.json episodes/<ep>/narration.mp3 episodes/<ep>/words.ts
```
Prints a cue table (frame of each phrase). **Film frame = 15 + round(seconds × 30)** (30 fps, 15-frame lead-in).

## 5. Write the film (`Film.tsx` + `entry.tsx`)
- Copy the closest existing episode as a starting point.
- At the top: `const F = { hook: 17, ... }` — every key word's frame from the cue table. Every action lands **on** its word (start 2–4 frames early).
- Build `SHOTS: ShotDef[]` (`{from, to, z0, z1, fx, fy, render}`), one shot per idea, cuts every 2.5–6 s.
- **Gotcha:** `Shots` in `kit.tsx` passes a *local* frame to `render()`. Our cues are global, so wrap renders to pass the global frame (see any episode's `SHOTS.map(...)`).
- Character: `<Figure ... talk={ENV[f-15]} blink={blinkAt(f, seed)} mood=... armR/armL/elbowR/elbowL ... holdR={prop} glasses />`.
- Captions: `<Captions .../>` on dark sets, a local `LightCaptions` (ink text) on light sets.
- Audio: `<Audio src={staticFile("projects/<slug>/narration.wav")} />` — render.sh converts the MP3 into that path.
- `entry.tsx` registers one `<Composition id="..." durationInFrames={TOTAL} fps={30} width={1080} height={1920} />`.

## 6. QA before showing anyone
```
bash engine/render.sh episodes/<ep> --still 300      # repeat for ~10 frames across the film
```
Look at every still: text inside its box, nothing cut at the edges, captions not over faces, both hands
visible, pen/cursor exactly on its target, props readable, CTA visible. Then render:
```
bash engine/render.sh episodes/<ep>      # -> episodes/<ep>/render.mp4 + render_sheet.jpg
```
Check the contact sheet frame by frame. Save the final sheet as `contact_sheet.jpg` (renders themselves are not committed — they live on YouTube).

## 7. Deliver + post
Send the MP4 to Uzair. When he approves → docs/posting.md.

## 8. Commit
Add `BRIEF.md` (script as recorded, sources, cue table, scene plan, YouTube link), update `docs/publish-log.md`
and the status block in `AGENTS.md`, then commit + push.

## Legacy canvas pipeline (Oct 30 videos only)
The first two videos were made with a different, older pipeline: a canvas page (`engine/legacy-canvas/video.html`,
`video2.html`) driven by `timeline.json`, frames captured with Playwright (`vrender.js`) and encoded with ffmpeg.
It is kept for reference; new videos use the Remotion engine above.
