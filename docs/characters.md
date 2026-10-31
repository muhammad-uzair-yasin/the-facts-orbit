# The Cast — 50 characters (default characters for ALL videos)

**Standing rule (Uzair, Oct 31 2026): prefer these characters when creating videos.** Pick a host + topic-fitting guests
from this list; use the old stick figure only as a fallback. Preview: `engine/characters/cast_50.jpg`.

Code: `engine/characters/Humans.tsx` → `<Person d={CAST[n-1]} f={f} seed={n} talk={ENV[f-15]} wave={0|1} mood="happy|neutral|surprised" />`
(copy Humans.tsx into `engine/src/` so render.sh picks it up). Every character can be re-dressed: skin, hair (13), outfit (12),
hat (14 incl. hijab/turban/helmet/crown), glasses, beard, prop, age (kid/adult/old), body width.

| # | Character | Outfit | Headwear | Prop | Best for |
|---|---|---|---|---|---|
| 1 | **Scientist** | lab | — | flask | science, experiments, body facts |
| 2 | **Explorer** | jacket | explorer | mag | history, ancient sites, nature |
| 3 | **Astronaut** | space | helmet | — | space, what-if space |
| 4 | **Detective** | jacket | beret | mag | mysteries, psychology tricks, true stories |
| 5 | **Teacher** | sweater | — | pointer | lessons, explainers (Agent School) |
| 6 | **Hacker** | hoodie | headset | laptop | cybersecurity, AI tools, dev news |
| 7 | **Chef** | apron | chef | — | food facts |
| 8 | **Doctor** | lab | — | coffee | health/body science |
| 9 | **Engineer** | overalls | hard | wrench | how things are built, tech |
| 10 | **Grandpa** | sweater | — | book | history, 'back in the day' |
| 11 | **Grandma** | dress | — | coffee | everyday life, stories |
| 12 | **Gamer Kid** | tee | — | phone | games, tech for kids |
| 13 | **School Girl** | dress | — | book | learning, curiosity |
| 14 | **Pilot** | uniform | cap | — | aviation, travel |
| 15 | **King** | kurta | crown | — | history, empires |
| 16 | **Traveler** | kurta | turban | — | travel, cultures, ancient trade |
| 17 | **Reporter** | suit | — | mic | AI News anchor/field reporter |
| 18 | **Business** | suit | — | phone | money, startups, AI business news |
| 19 | **Artist** | tee | beret | brush | creativity, AI art tools |
| 20 | **Photographer** | jacket | — | camera | cameras, creator tools |
| 21 | **Athlete** | tee | — | ball | sports, body |
| 22 | **Cowboy** | jacket | cowboy | — | Wild West history |
| 23 | **Student** | hoodie | — | book | Agent School learner, study tips |
| 24 | **Graduate** | dress | grad | — | careers, milestones |
| 25 | **Hijabi Coder** | jacket | hijab | laptop | coding, AI tools, Agent School |
| 26 | **Uncle Ji** | kurta | — | coffee | everyday Pakistani audience, humour |
| 27 | **Mechanic** | overalls | cap | wrench | how machines work |
| 28 | **Nurse** | uniform | — | none | health |
| 29 | **Rapper** | hoodie | — | mic | music, culture |
| 30 | **Skater** | tee | beanie | — | youth, trends |
| 31 | **Punk** | jacket | — | — | rebellious/shock facts |
| 32 | **Librarian** | sweater | — | book | books, history, knowledge |
| 33 | **Gardener** | overalls | cap | — | plants, nature |
| 34 | **Influencer** | dress | — | phone | social media, creator tools |
| 35 | **Space Kid** | space | helmet | — | kid-friendly space |
| 36 | **Professor** | suit | — | pointer | science/space explainers, what-if |
| 37 | **Imam / Scholar** | kurta | turban | book | Islamic history, scholarship |
| 38 | **Firefighter** | uniform | hard | — | safety, disasters |
| 39 | **Police** | uniform | cap | — | law, safety |
| 40 | **DJ** | tee | headset | — | music tech, audio AI |
| 41 | **Baker** | apron | none | coffee | food, everyday science |
| 42 | **Farmer** | overalls | cowboy | — | food, agriculture, nature |
| 43 | **YouTuber** | hoodie | — | camera | creator tips, AI video tools |
| 44 | **Marathoner** | tee | — | — | endurance, body |
| 45 | **Brainy Girl** | sweater | — | globe | geography, kid science |
| 46 | **Historian** | jacket | — | globe | history, archaeology |
| 47 | **Diver** | space | helmet | — | ocean, Titanic, deep sea |
| 48 | **Robot Fan** | tee | — | laptop | robots, AI for kids |
| 49 | **Sufi Poet** | kurta | — | book | poetry, culture, history |
| 50 | **Host Uzair-style** | jacket | — | laptop | network host — AI channels, intros |

## Suggested casting
- **Learn AI With Uzair (Agent School):** host #50 Host Uzair-style or #5 Teacher; students #23 Student, #25 Hijabi Coder, #12 Gamer Kid.
- **Agentic Ai with Uzair (tools):** #6 Hacker, #43 YouTuber, #34 Influencer, #19 Artist, #40 DJ.
- **Ai News:** anchor #17 Reporter or #18 Business; guests by story (e.g. #6 Hacker for security, #3 Astronaut for space).
- **The Facts Orbit:** host #2 Explorer or #36 Professor; guests by topic — #47 Diver (ocean/Titanic), #3 Astronaut (space), #4 Detective (psychology tricks), #1 Scientist (body/science), #46 Historian / #15 King (history).

## Also available
`engine/characters/Characters.tsx` — 8 alternative art styles (Classic stick, Bean, Toon, Doodle, Flat, Blobby, Professor, Shade): `styles_8.png`.
