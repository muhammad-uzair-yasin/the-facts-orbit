# BRIEF — Why do we get déjà vu? (Nov 29, 2026)

- Composition `DejaVu` · 1080×1920 · 30 fps · narration slug `dejavu` · mastered -14 LUFS / -1.5 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-29-deja-vu-why-it-happens`
- Voices (Kokoro, speaker tags in script.txt): asker = `af_aoede`, host = `am_adam`
- Cast: asker **DJ** (CAST[39]); host **Hacker** (CAST[5]); story figure **Student** (CAST[22]) as the person living the moment and the VR volunteer. Mouths via `talkFor(f, "asker"|"host", SPK, ENV)`; the listener reacts.
- Q&A bubbles: "DÉJÀ VU?!", "A GLITCH?!" (RGB-split glitch), "AND?", "WHY SO STRANGE?", "SHOULD I WORRY?" — pop on the line's first word, leave when it ends.
- Cues: `const F` at the top of Film.tsx is looked up from words.ts word starts (`W(word, n)`); asker lines come from SPK.

## Scenes (Director camera + transitions)
1. Neon DJ room (glowing "ENCORE" sign, deck, synthwave grid floor) with slice-glitch flickers; cover "DÉJÀ VU / WHY DOES IT HAPPEN?".
2. **whip** → "THIS MOMENT" (REC): a student at a café table; ghost copies of the same moment appear on "lived… before" + replay icon; then 3 people icons, 2 light up, "2 OUT OF 3 PEOPLE".
3. **zoom** → "A GLITCH?!": green code rain, whole-frame slice glitch on "glitch/Matrix", "NOT QUITE" chip.
4. **flash** → lab: kinetic "2012", "COLORADO STATE UNIV.", volunteer in a VR headset that lights up, virtual-world panel, "ON PURPOSE" stamp.
5. **wipe** → floor plans: SEEN BEFORE room vs NEW PLACE with different objects; dashed layout outline slides down and matches — "SAME LAYOUT ✓"; old room fogs over "FORGOTTEN ???".
6. **iris** → neon room: "AND?" bubble, "DÉJÀ VU ✓".
7. **zoom** → brain: pattern grid lights "PATTERN MATCH ✓", memory drawers searched one by one, red "ERROR 404 / MEMORY NOT FOUND".
8. **push** → "WHY SO STRANGE?" bubble; brain with ERROR CHECK magnifier; left half goes cyan "FAMILIAR!", right half magenta "NO, NEW!", halves split, lightning + "CLASH!" stamp + shake.
9. **whip** → "SHOULD I WORRY?" bubble, "NOT AT ALL ✓"; déjà-vu-by-age bar chart (15–25 peak "YOUNG ADULTS", trend arrow down with age), green check "MEMORY: WORKING".
10. **spin** → subscribe outro with cursor click; both characters wave.
Sound: CC0 kit — pops on bubbles/chips, riser into the replay and VR, booms on 2-of-3, 2012, CLASH, impacts on glitch, ON PURPOSE, MEMORY NOT FOUND and the check, click on subscribe.

## Sources / fact check
- About two-thirds of people report having experienced déjà vu (survey literature reviewed by A. S. Brown, 2003/2004).
- Cleary et al. (2012), Colorado State University, Consciousness and Cognition: VR scenes sharing the spatial layout of previously seen, unrecalled scenes produced more déjà vu.
- Memory-checking / conflict-detection account: Akira O'Connor et al. (2016), University of St Andrews (frontal regions active during induced déjà vu).
- Most frequent around ages 15–25 and declines with age.
