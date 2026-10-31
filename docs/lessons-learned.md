# Lessons learned (bugs we hit and how they were fixed)

## Remotion / rendering
- **Remotion can't download Chrome** in the cloud workspace → `--browser-executable=/opt/pw-browsers/chromium-*/chrome-linux64/chrome` (render.sh does this).
- **`@remotion/google-fonts` is blocked** → local `inter800.woff2` loaded with `@font-face` + `staticFile` (`FontStyle` in kit.tsx).
- **Render crashed at `--concurrency=3`** → use `--concurrency=2`.
- **Scenes appeared empty** (props never showed): `Shots` passes a LOCAL frame to `render()`, cue frames are GLOBAL → wrap renders to pass the global frame.
- **Chalk text cut off at both sides + pen out of sync**: the reveal clip used an estimated text width, real glyphs were wider → force the text to the estimated width with SVG `textLength` + `lengthAdjust="spacingAndGlyphs"`; the pen then sits exactly on the reveal edge.
- **One-handed character**: left arm at the default angle hides behind the torso → `armL={-34}` `elbowL={-18}`.
- **Captions over the character**: captions at y≈1650–1680, characters grounded above the caption band.
- **White captions vanish on light backgrounds** → `LightCaptions` (ink text, teal pill).
- **Mojibake (â€")** in generator pages → `<meta charset="utf-8">` first.
- **Brand renders in a serif fallback font** → wait for `document.fonts` before drawing.

## Content
- Hooks must be logical and state the topic (see rules.md #1).
- Countdown/counters: check they tick at a believable speed (the trailer's 24 h clock first ran 60× too fast).
- Visual metaphors must read instantly: a starburst "maple leaf" was redrawn as a real leaf.

## Workflow
- ElevenLabs API + Postsiva upload backend are blocked from the workspace → Uzair records voice and uploads files himself.
- GitHub: the agent session can push to existing repos but cannot create new ones → Uzair creates empty repos.
- The agent's workspace is wiped after inactivity → **always push after each video** (rules.md #14).
