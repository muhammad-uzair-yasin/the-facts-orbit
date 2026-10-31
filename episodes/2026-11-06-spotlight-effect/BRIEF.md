# BRIEF — Nobody is looking at you (spotlight effect) · Nov 6, 2026

- Composition `Spotlight` · 1080×1920 · 30 fps · 51.9 s · mastered -14.0 LUFS / -1.4 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-06-spotlight-effect`
- Status: built Nov 1 (night), awaiting Uzair's approval → schedule Nov 6, 14:00 UTC

## Cast & voices (Kokoro, engine/tts/narrate.py)
- Host / narrator: CAST #18 Business — voice `am_adam` (speaker "host")
- Guest: CAST #23 Student in a loud pink tee with a generic cartoon face print (not a real person) — voice `am_eric` (speaker "guest"), line: "Everyone is staring at my shirt..."
- Crowd extras (no voice): #1 Scientist, #34 Influencer, #21 Athlete, #11 Grandma, #30 Skater, #27 Mechanic, #5 Teacher
- Lip-sync per speaker via `talkFor(f, who, SPK, ENV)`.

## Scenes (Director camera + transitions)
1. Cover SPOTLIGHT / NOBODY IS LOOKING AT YOU → student alone in a theatre spotlight, eyes in the dark turn away (push-out).
2. whip → "PSYCHOLOGY STUDY · CORNELL 2000" card; pink shirt falls onto the student, OH NO stamp; host on the left.
3. iris → party room, student walks in under the beam, crowd on phones/coffee, only two glance (eye icons); "EVERYONE SEES ME!" bubble + orbiting question marks (camera pushes in, slight roll).
4. wipe → "HOW MANY NOTICED?" 10-person grid, guess bar fills to 50% (host gestures).
5. flash on "About a quarter" → reality bar 25% vs guess 50%, "2× OVERESTIMATE", "NOBODY CARED" stamp.
6. zoom → "THE SPOTLIGHT EFFECT": student at the centre of orbit rings; "everyone else" eye-watchers converge.
7. push → everyone has their own mini spotlight + worry bubbles (MY HAIR! / MY SHIRT? / DID I SAY THAT? …).
8. whipUp → montage cards BAD HAIR DAY, MEETING MISTAKE get struck through → NOBODY REMEMBERS.
9. spin → spotlight shrinks, "DO THE THING" button, cursor click, confetti, student waves happily.
10. zoom → subscribe outro with student + host.
Punch-ins on staring / half / quarter / twice / nobody / do-it; shakes on OH NO, quarter, NOBODY CARED, click. SFX: CC0 kit + transition whooshes.

## Source
Gilovich, T., Medvec, V. H., & Savitsky, K. (2000). The spotlight effect in social judgment. *Journal of Personality and Social Psychology*, 78(2). Shirt wearers guessed ~50% of observers noticed; actual ~25%.
