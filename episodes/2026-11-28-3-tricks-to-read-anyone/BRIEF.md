# BRIEF — Can you really read people? Part 2 (Nov 28, 2026)

- Composition `ReadPeople2` · 1080×1920 · 30 fps · narration slug `readpeople2` · mastered -14 LUFS / -1.5 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-28-3-tricks-to-read-anyone`
- Voices (Kokoro, speaker tags in script.txt): asker = `am_michael`, host = `am_adam`
- Cast: asker **Business** (CAST[17]); host **Detective** (CAST[3]); story figure **Professor** (CAST[35]) as Guillaume Duchenne in a sepia portrait. Mouths via `talkFor(f, "asker"|"host", SPK, ENV)`; the listener reacts (asker surprised on "?!" lines, at 54% and at "cracks").
- Q&A bubbles: every asker line pops a big speech bubble near the asker on its first word and leaves when the line ends — "READ PEOPLE?!", "HOW?", "WHAT'S #2?", "AND #3?", "CATCH A LIAR?!".
- Cues: `const F` at the top of Film.tsx is looked up from words.ts word starts (`W(word, n)`); asker lines come from SPK.

## Scenes (Director camera + transitions)
1. Detective's office at night (blinds, cork board with red string, desk lamp); cover "READ ANYONE / 3 TRICKS · PART 2"; asker asks, red "PART 2" badge pops.
2. **zoom** → "BACKED BY SCIENCE": trick cards 1/2/3 fan in on "Three"; card 1 takes focus with "IS THE SMILE REAL?"; both characters below, "HOW?" bubble.
3. **whip** → close-up faces: magnifier sweeps to the eyes; REAL ✓ smile squints with eye-ring muscle squeeze and crinkles drawing on; FAKE ✗ face slides up with the mouth circled "ONLY THE MOUTH".
4. **flash** → sepia portrait "G. DUCHENNE", French flag chip, kinetic "1860s", "THE DUCHENNE SMILE".
5. **iris** → office: "WHAT'S #2?" bubble, card 2 flips to "WATCH THE PUPILS".
6. **zoom** → giant eye: "ECKHARD HESS" + kinetic "1960s"; pupil dilates on "bigger" with a PUPIL SIZE bar, heart "INTERESTED" reflected as a spark in the eye.
7. **push** → office: "AND #3?" bubble, card 3 "EYE CONTACT MYTH", shifty-eyes "LIARS LOOK AWAY" card with MYTH stamp + shake.
8. **wipe** → counter 0→54% with a meter and the 50% COIN FLIP line; spinning coin, "BARELY BETTER THAN A COIN".
9. **spin** → "CATCH A LIAR?!" bubble; story panels HOME/DRIVE/CAFE/NIGHT reorder in reverse with a rewind icon, BRAIN LOAD gauge climbs into the red, panels crack + "CRACKS SHOW" stamp.
10. **whipUp** → subscribe outro with cursor click; both characters wave.
Sound: CC0 kit — pops on every bubble/card, whooshes on transitions, boom on 1860s and 54%, riser into dilation, riser_dark into brain load, impacts on MYTH and CRACKS SHOW, click on subscribe.

## Sources / fact check
- Duchenne smile: Guillaume Duchenne (1862), genuine smiles engage the orbicularis oculi around the eyes (crow's-feet crinkles); posed smiles mostly use the mouth (zygomaticus major).
- Pupil dilation and interest: Eckhard Hess, University of Chicago, 1960s (Hess & Polt 1960).
- Lie detection accuracy ≈54%: Bond & DePaulo (2006) meta-analysis, Personality and Social Psychology Review.
- Reverse-order recall raises liars' cognitive load and exposes cues: Vrij et al. (2008), Law and Human Behavior.
