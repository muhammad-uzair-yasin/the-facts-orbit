# BRIEF — What if you fell into a black hole? (Nov 7, 2026)

- Composition `BlackHole` · 1080×1920 · 30 fps · ~53.6 s · mastered -14 LUFS / -1.5 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-07-what-if-black-hole`
- Voices (Kokoro, engine/tts/narrate.py, speaker tags in script.txt): host = `am_adam` (speed 1.0), kid = `af_heart`
- Cast: host **#3 Astronaut** (CAST[2]) — the one who falls; kid **#45 Brainy Girl** (CAST[44]) — asks the question, then plays the friend watching from far away. Mouths via `talkFor(f, speaker, SPK, ENV)`; non-speaker reacts.

## Scenes (Director camera + transitions)
1. Night hill, kid at a telescope asks the question (cover "BLACK HOLE / WHAT IF YOU FELL IN?"); astronaut walks in, waves — "It depends…".
2. **spin** → "SIZE MATTERS": small black hole "FEW × SUN" vs giant "SUPERMASSIVE" pop in.
3. **whip** → small black hole below; tidal arrows (HEAD: WEAK PULL / FEET: STRONG PULL); astronaut stretched tall and thin (scaleY up, scaleX down), noodle gag, letter-by-letter "SPAGHETTIFICATION" with shake + punch-in.
4. **zoom** → supermassive black hole; dashed "POINT OF NO RETURN" horizon ring; astronaut drifts across calmly, "FEELS NOTHING ✓".
5. **iris** → "FRIEND'S VIEW": kid in a distant ship window; astronaut slows, freezes at the edge and fades to red (feColorMatrix redshift); clock slows to "TIME: FROZEN"; FROZEN stamp.
6. **wipe** → split screen: left FRIEND'S VIEW (frozen, red, clock STOPPED) vs right YOUR VIEW (falling through streaking stars, clock TICKING NORMALLY, "STRAIGHT THROUGH").
7. **flash** → "TWO VERSIONS" + "BOTH TRUE" stamp, both characters.
8. **push** → subscribe outro with cursor click; both characters wave.
Sound: CC0 kit — whooshes on transitions, riser_dark into the stretch and the freeze, impacts/booms on SPAGHETTIFICATION, FROZEN, BOTH TRUE; pops on UI chips; click on subscribe.

## Sources / fact check
- Stellar-mass black holes: tidal forces near the horizon stretch infalling objects ("spaghettification").
- Supermassive black holes (e.g. Sagittarius A*, ~4 million solar masses): tidal forces at the event horizon are far weaker, so an infalling person would cross it without feeling anything unusual.
- Gravitational time dilation + redshift: a distant observer sees an infalling object slow, appear to freeze near the horizon and fade/redshift; the infaller's own clock ticks normally and they cross in finite proper time (standard general relativity; see NASA/Hubble and textbook treatments of black-hole event horizons).
