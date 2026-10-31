# Character library (Oct 31, 2026)

- `Humans.tsx` — the **human rig** (`<Person d={PersonDef} f seed talk wave mood />`): 13 hairstyles, 12 outfits,
  14 hats/headwear (incl. hijab, turban, helmet, crown), glasses, beards, props, kid/adult/old ages, body width.
  Animates: blink, lip-sync (`talk` = voice envelope), wave, breathing, head sway. `CAST` holds 50 ready characters
  (see `cast_50.jpg`, numbered 1–50). Uzair is choosing which to use for upcoming videos.
- `Characters.tsx` — 8 alternative art styles (Classic stick, Bean, Toon, Doodle, Flat, Blobby, Professor, Shade) — `styles_8.png`.
- To use in a film: copy the file next to Film.tsx in `engine/src/` (render.sh copies every `engine/src/*.tsx`), import `Person, CAST`,
  and pass `talk={ENV[f-15]}`.
- Colour helper `mix()` only accepts 6-digit hex (`#000000`, not `#000`).
