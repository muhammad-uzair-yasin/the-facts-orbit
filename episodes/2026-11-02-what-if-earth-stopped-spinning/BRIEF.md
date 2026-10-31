# BRIEF — What if Earth stopped spinning? (Nov 2, 2026)

- Composition `EarthSpin` · 1080×1920 · 30 fps · 58.8 s · mastered -14.0 LUFS / -1.3 dBTP
- Rebuild: `bash engine/render.sh episodes/2026-11-02-what-if-earth-stopped-spinning`
- Status: built Nov 1, awaiting Uzair's approval → schedule Nov 2, 14:00 UTC

## Cast & voices (agent-generated, Kokoro)
- Host: CAST #36 Professor — `am_adam` (speaker "host")
- Kid: CAST #35 Space Kid — `af_sky` (speaker "kid"): asks the hook question and "So... are we in danger?"
- Lip-sync per speaker via `talkFor(f, speaker, SPK, ENV)`; host is flipped to face the kid.

## Shots (Director camera + transitions)
1. Hook — starfield, spinning globe with rotation arrow, both characters on a small planet; cover "EARTH STOPS / WHAT IF EARTH STOPPED SPINNING?" (camera pull-back)
2. `zoom` — equator ring, speedometer counting to 1,670 KM/H, RIGHT NOW chip, AIR / OCEANS / GROUND riding along the spin (crane + push)
3. `flash` — globe brakes with sparks + skid marks, STOP sign, 0 KM/H, "...NOT WHAT'S ON IT" (boom + big shake)
4. `whip` — dusk street: trees, cars and houses launched east with speed lines and dust, PEOPLE/CARS/BUILDINGS/TREES chips, wind gauge past the hurricane band → OFF THE SCALE, ground SCRAPED CLEAN (tracking pan + roll)
5. `iris` — Earth squashed by its bulge → relaxes to a sphere, oceans slide to the poles with flow arrows, ONE RING CONTINENT
6. `wipe` — split day/night: stuck sun vs moon, 1 DAY = 1 YEAR, calendar DAYLIGHT 1–6 → NIGHT 1–6 (pans day → night)
7. `push` — kid worried ("!"), clock "+2 ms / CENTURY", WE'RE FINE stamp
8. `spin` — subscribe outro with cursor click, both characters waving
Punch-ins and shakes on 1,670 / RIGHT NOW / STOP / OFF THE SCALE / SCRAPED CLEAN / RING CONTINENT / 1 YEAR / WE'RE FINE. SFX: CC0 kit (whoosh per transition, pops on chips, riser_dark into STOP, boom on the halt and on 1 YEAR, impacts on reveals, click on subscribe).

## Sources / fact check
- Equatorial rotation speed ≈ 1,670 km/h (Earth's circumference ~40,075 km / ~24 h).
- Day lengthening ≈ 2 ms per century (tidal braking; commonly cited ~1.7–2.3 ms/century).
- Without rotation: ocean redistribution toward the poles + equatorial land ring and a ~1-year solar day are standard thought-experiment results (e.g. ESRI's Witold Fraczek model).
