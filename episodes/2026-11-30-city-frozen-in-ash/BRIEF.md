# BRIEF — How was a whole city frozen in ash? (Nov 30, 2026)

- Composition `Pompeii` · 1080×1920 · 30 fps · narration slug `pompeii` · mastered -14 LUFS / -1.5 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-30-city-frozen-in-ash`
- Voices (Kokoro, speaker tags in script.txt): asker = `bm_fable`, host = `am_adam`
- Cast: asker **Uncle Ji** (CAST[25]); host **Historian** (CAST[45]); story figure **Explorer** (CAST[1]) as archaeologist Giuseppe Fiorelli. Mouths via `talkFor(f, "asker"|"host", SPK, ENV)`; the listener reacts.
- Tone: respectful — people are simple running silhouettes; the casts are smooth, plain plaster shapes; no gore.
- Q&A bubbles: "2,000 YEARS?!" (number counts up inside the bubble), "OUTRUN IT?", "BODY SHAPES?", "WOW... CREEPY!", "STORIES WRONG?!" — pop on the line's first word, leave when it ends.
- Cues: `const F` at the top of Film.tsx is looked up from words.ts word starts (`W(word, n)`); asker lines come from SPK.

## Scenes (Director camera + transitions)
1. Pompeii ruins today (columns, ruined wall, paving, Vesuvius smoking behind); cover "POMPEII / A CITY FROZEN IN ASH".
2. **flash** → kinetic "79 AD"; Roman town (red roofs, temple) under Vesuvius; sky darkens as the plume column rises and lava bombs fly on "erupted" (shake); "VESUVIUS" + "POMPEII" chips.
3. **whip** → side view: people run out of town "MANY ESCAPED"; "SUPERHOT GAS + ASH" surge billows down the slope over the town; speedometer counts to 400+ KM/H ("hundreds").
4. **iris** → ruins: "OUTRUN IT?" bubble, "NO." stamp + shake, "ALMOST INSTANT".
5. **push** → cross-section: ash falls and layers bury the town ("BURIED"), ruler "4–6 M", grass and a tree grow over, counter to "1,700 YEARS FORGOTTEN".
6. **wipe** → ruins with a display case: "BODY SHAPES?" bubble.
7. **zoom** → kinetic "1863", "GIUSEPPE FIORELLI"; hardened-ash block with a HOLLOW → "PERFECT MOLD"; bucket tips, PLASTER pours and fills, the cast lifts out — "THE PEOPLE OF POMPEII".
8. **spin** → museum hall: "WOW... CREEPY!" bubble, "TWIST!" stamp.
9. **flash** → museum label "MOTHER & CHILD"; kinetic "2024", DNA helix builds, label struck through, "A MAN" + "NOT RELATED", the two casts drift apart.
10. **whipUp** → ruins: "STORIES WRONG?!" bubble, "ASH FROZE THE MOMENT", "WE GUESSED THE REST" stamp, then subscribe outro with cursor click; both characters wave.
Sound: CC0 kit — boom on the eruption, riser_dark into the surge and burial, impacts on NO., TWIST!, A MAN and WE GUESSED THE REST, ticks on counters, click on subscribe.

## Sources / fact check
- Vesuvius erupted in 79 AD; pyroclastic surges/flows killed those who remained in Pompeii; the city was buried under roughly 4–6 m of ash and pumice.
- Excavations began in 1748 (≈1,700 years after the eruption).
- Giuseppe Fiorelli introduced the plaster-cast technique in 1863, pouring plaster into voids left by decomposed bodies.
- Pilli et al. (2024), Current Biology: ancient DNA showed the adult in the "mother and child" group from the House of the Golden Bracelet was an unrelated adult male.
