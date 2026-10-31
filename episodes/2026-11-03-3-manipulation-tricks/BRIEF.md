# BRIEF — 3 tricks people use to make you say yes (and how to spot them) — Nov 3, 2026

- Composition `Manipulation` · 1080×1920 · 30 fps · 77.3 s · mastered -14.0 LUFS / -1.4 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-03-3-manipulation-tricks`
- Status: built Nov 1, awaiting Uzair's approval → schedule Nov 3, 14:00 UTC

## Cast + voices (Kokoro, engine/tts/narrate.py, speaker tags in script.txt)
- Host: CAST[3] #4 Detective — `am_adam` (speaker "host"), narrates like a noir detective
- Guest: CAST[17] #18 Business, the smooth manipulator — `am_michael` (speaker "guest"): "Could you do me a tiny favor?" / "Okay, okay... then how about just this?" / "Here, have a free soda. No strings attached."
- Extras (no voice): CAST[25] #26 Uncle Ji (homeowner), CAST[22] #23 Student (gift target)
- Lip-sync per speaker via `talkFor(f, who, SPK, ENV)`.

## Scenes (Director camera + transitions)
1. Cover "SAY YES? / 3 TRICKS · HOW TO SPOT THEM" → noir office: evidence board with 3 cards + red string, lamp cone, detective vs manipulator, HOW TO SPOT THEM chip
2. whip → TRICK 1/3 FOOT IN THE DOOR: house, homeowner at the door, manipulator offers tiny "BE A SAFE DRIVER" window sign, TINY ASK chip
3. iris → 1966: big ugly DRIVE CAREFULLY lawn sign, bar chart 17% (asked cold) vs 76% (tiny sign first), SMALL YES FIRST → BIG YES LATER
4. zoom → TRICK 2/3 DOOR IN THE FACE: 2-YEAR VOLUNTEER JOB card, door SLAMS (boom + shake), THE REAL REQUEST, ZOO TRIP ticket
5. wipe → 1975: kids row, TAKE KIDS TO THE ZOO?, bars 17% vs 50%
6. push → TRICK 3/3 THE FREE GIFT: soda slides across the desk to the student, "NO STRINGS" with strings dangling
7. whipUp → 1971: raffle tickets stack, ×1.0 → ×2.0 counter, DEBT weight drops (boom + shake)
8. flash → phone RED FLAG CHECK UI: 3 flags tick, cursor clicks PAUSE, IS THIS MY CHOICE?
9. spin → CASE CLOSED stamp, subscribe click outro, detective waves
Punch-ins on every percentage and reveal; CC0 SFX (whoosh per transition, pops, ticks, impacts, booms, risers, click).

## Sources
- Freedman & Fraser (1966), foot-in-the-door: 76% vs 17% — https://en.wikipedia.org/wiki/Foot-in-the-door_technique
- Cialdini et al. (1975), door-in-the-face (zoo chaperone): 50% vs 17% — https://en.wikipedia.org/wiki/Door-in-the-face_technique
- Regan (1971), reciprocity: free soda → ~2× raffle tickets bought
