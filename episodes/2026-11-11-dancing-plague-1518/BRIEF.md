# BRIEF — Did a whole town really dance until people dropped? (Nov 11, 2026)

- Composition `DancingPlague` · slug `dancing` · 1080×1920 · 30 fps · TOTAL 1862 frames (~62.1 s) · mastered -14 LUFS / -1.5 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-11-dancing-plague-1518`
- Voices (Kokoro, speaker tags in script.txt): asker = `am_eric`, host = `am_adam`
- Cast: asker **Punk** (CAST[30]); host **Professor** (CAST[35]). Story figures: Frau Troffea = custom PersonDef (green dress, bun); town physician = Doctor (CAST[7]) in a long robe + cap with a book; 1518 townspeople and musicians are custom SVG `Dancer` / `Musician` figures (coifs, hats, headscarves). Mouths via `talkFor(f, "asker"|"host", SPK, ENV)`; the listener reacts.
- Tone: curious, slightly eerie; deaths shown respectfully (figures lie down, dusk, candles), no gore.
- Q&A bubbles: "DANCED TO DEATH?!", "FOR FUN?", "WHY NOT STOP THEM?", "WORSE?!", "WHAT WAS IT?!" — pop on the line's first word, leave when it ends.
- Cues: `const F` at the top of Film.tsx is looked up from words.ts word starts (`W(word, n)`); asker lines come from SPK.

## Scenes (Director camera + transitions)
1. Half-timbered Strasbourg street with the cathedral spire; duo; cover "DANCING / THE PLAGUE OF 1518"; bubble "DANCED TO DEATH?!".
2. **flash** → city wide over the river, cathedral; "STRASBOURG" chip, kinetic "JULY 1518".
3. **push** → street close-up: a door opens, Frau Troffea steps out ("FRAU TROFFEA"), starts dancing with motion lines, "CAN'T STOP!" stamp + shake.
4. **iris** → duo (Troffea still dancing behind): "FOR FUN?" bubble, "NOT FOR FUN".
5. **whip** → crowd in the street grows: calendar DAY 1→7, DANCERS counter 1 → rolls → "DOZENS", calendar flips to AUG 1518, counter rolls → "HUNDREDS" as ~95 dancers pop in; camera pulls back.
6. **wipe** → duo with dancers behind: "WHY NOT STOP THEM?" bubble, "THE CRAZY PART...".
7. **zoom** → physician's study: scroll unrolls "DOCTORS' ORDERS / CURE:" → "MORE DANCING?!" (punch + shake).
8. **push** → the stage builds plank by plank ("CITY BUILT A STAGE"), bunting, dancers on it; drummer, piper, fiddler pop in ("+ HIRED MUSICIANS").
9. **whipUp** → duo at dusk in front of the stage: "WORSE?!" bubble, "MUCH WORSE" stamp.
10. **iris** → hot sun on the stage, sweat drops, "RECORDS OF THE TIME", dancers collapse one by one ("EXHAUSTION"); dusk falls, "SOME MAY HAVE DIED", five candles light.
11. **wipe** → duo at dusk: "WHAT WAS IT?!" bubble, "HISTORIANS THINK...".
12. **zoom** → dark town: "MASS PANIC" stamp, cards STARVING (empty bowl), SICK, SAINT'S CURSE (halo + lightning), "= YOU DANCE!".
13. **spin** → network of 16 heads: "FEAR", red links spread head to head ("MIND → MIND"), heads turn red and wobble; big spiky virus + "LIKE A VIRUS".
14. **flash** → sunset hill: kinetic "SEPTEMBER", calm procession walks up to the chapel ("SHRINE OF ST. VITUS"), hands together on "pray", shrine glows, "PLAGUE STOPPED" stamp; then subscribe outro with cursor click, both characters slide in waving.
Sound: CC0 kit — pops on every bubble/chip, ticks on counters, boom on JULY 1518 / HUNDREDS / collapse / virus, impacts on CAN'T STOP, MORE DANCING, MUCH WORSE, MASS PANIC, PLAGUE STOPPED; riser_dark into the deaths and the spreading fear; click on subscribe; whooshes on transitions.

## Sources / fact check
- Strasbourg, July–September 1518; it began with one woman, Frau Troffea, dancing in the street; within about a week dozens had joined, and by August some accounts say hundreds.
- City physicians attributed it to "hot blood" and prescribed more dancing: the council cleared guild halls, built a wooden stage and hired musicians.
- Some chronicles report dancers dying from exhaustion (numbers are uncertain, hence "some may have died").
- Historian John Waller: mass psychogenic illness amid famine and disease, with fear of a curse from St. Vitus.
- In September the dancers were taken to the shrine of St. Vitus at Saverne to pray, and the outbreak ended.
