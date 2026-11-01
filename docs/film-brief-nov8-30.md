# Film brief: Facts Orbit, Nov 8–30 2026 (Q&A duo format)

Every episode is a **conversation**. `asker` (a cast character with its own Kokoro voice) asks the question
and reacts. `host` (voice am_adam, a topic-matched cast character) explains. The script and voice are final.
Each episode folder already has `script.txt`, `narration.mp3`, `sents.json` and `words.ts` (WORDS, CHUNKS, TOTAL, ENV, SPK).

## What to build per episode
`Film.tsx`, `entry.tsx`, `BRIEF.md`, plus a few QA stills. **Do NOT run a full render**, because Claude renders all films one at a time. The machine has 2 CPUs shared by 6 agents.
Also **do not git commit**.

Start from `episodes/2026-11-07-what-if-black-hole/Film.tsx` + `entry.tsx` (Director camera, transitions, talkFor lip-sync,
SFX, Cover, Caps, Outro). Read `docs/pipeline.md` (sections 5, 6, Camera) and `docs/rules.md` (Picture) first.
Engine: `engine/src/factkit.tsx`, `engine/src/kit.tsx`, `engine/src/Humans.tsx` (CAST indices listed below).

### Q&A format rules (the point of this batch)
- Both characters are on screen in dialogue shots. The speaker's mouth comes from `talkFor(f, "asker"|"host", SPK, ENV)`, the other one listens and reacts.
  Use `mood="surprised"` on the asker for "?!", "Wait...", "No way" lines and `happy` or neutral otherwise.
- Every asker line shows a **question/reaction bubble or card** near the asker, holding a short keyword version of the line, e.g. "40 MILES?!".
  Pop it in on the line's first word and remove it when the line ends. The bubble is the engagement hook, so keep it big, bold and readable.
- Story beats get **illustrated scenes** built from the topic, e.g. a volcano erupting, a dog at a station, a plane with an open rear stair, an emu outrunning a truck.
  When a story figure is needed, use extra cast characters such as the story's real person. Stories are told in pictures, not just talking heads.
- First frame: `Cover` with one big yellow outlined keyword plus the title (rule 11). The first line is the title/hook.
- 6–10 shots, cuts every 2.5–6 s, vary transitions (never the same twice in a row), punches on key numbers, shakes on impacts,
  kinetic numbers (countUp/BigNum) for every number spoken, SFX via Cue/transitionCues.
- Captions: `Caps` (dark or light variant to fit the set). Keep faces above the caption band.
- Both hands visible, no text cut at frame edges, no text overlapping faces.
- End: the Outro subscribe click with both characters waving.
- Every key action lands on its word: compute frames from `words.ts` WORDS (frame = start frame of the word). Put a `const F = {...}` cue table at the top.
- Use 6-digit hex colors (`mix()` now accepts 3-digit hex too, but stay consistent).
- `Narration slug="<slug>"` must be a unique lowercase slug per episode, the same slug used in render.sh. Composition `durationInFrames={TOTAL}`.

### QA
`bash engine/render.sh episodes/<ep> --still <frame>` for ~6–8 frames across the film. Look at each PNG with Read, fix problems,
then delete the still PNGs. Check: question bubbles readable, both characters visible in dialogue shots, nothing cut off, captions clear.
If a still errors with a TypeScript/React error, fix it. The film must compile.

### BRIEF.md
Use the same structure as the black-hole BRIEF: comp id, voices, cast, scenes with transitions, sound, and sources/fact check (copy from the list below).

## Episodes (comp id · slug · asker voice + cast · host cast · story figures)
| folder | comp | slug | asker | host | ideas |
|---|---|---|---|---|---|
| 2026-11-08-survived-both-atomic-bombs | AtomicBombs | atomic | af_bella · Graduate CAST[23] | Historian CAST[45] | Yamaguchi = Engineer CAST[8] in a suit-ish look or Business CAST[17]; map of Japan Hiroshima→Nagasaki train, two flashes, "3 KM" rings, calendar Aug 6 → Aug 9, "ONLY ONE" stamp, age 93. Respectful tone, no gore. |
| 2026-11-09-loudest-sound-in-history | Krakatoa | krakatoa | am_puck · Skater CAST[29] | Explorer CAST[1] | volcano erupting, ship at 40 miles, sound-ring map reaching ~3,000 miles, NY vs LA comparison, barometer needle/pressure wave circling globe ×, 36,000+ tsunami, red sunsets + fire engine |
| 2026-11-10-dog-waited-9-years | Hachiko | hachiko | af_sky · School Girl CAST[12] | Grandpa CAST[9] | draw an Akita dog (cream/tan, curled tail) as a custom SVG; Prof. Ueno = Professor CAST[35]; Shibuya station, train arriving, seasons/calendar counter 9 yrs 9 months, bronze statue 1934, reunion ending. Warm and emotional. |
| 2026-11-11-dancing-plague-1518 | DancingPlague | dancing | am_eric · Punk CAST[30] | Professor CAST[35] | Strasbourg 1518 street, dancer crowd count growing (1 → dozens → hundreds), stage + musicians, "CURE: MORE DANCING?!", fear spreading mind to mind as a virus graphic, shrine in September |
| 2026-11-12-what-if-sun-disappeared | SunGone | sungone | af_nova · Space Kid CAST[34] | Astronaut CAST[2] | 8-minute timer (8:20), light beam traveling, Earth flying off a tangent line, Moon going dark, planets fading, thermometer 0°F → -100°F, frozen ocean with vent life below |
| 2026-11-13-would-you-hurt-a-stranger | Milgram | milgram | am_michael · Business CAST[17] | Scientist CAST[0] | 1961 Yale lab, shock panel 15→450 V with labels, actor behind wall, experimenter in lab coat (Doctor CAST[7]), "1 in 1000" predicted vs 65% actual bar, 2 rebels → 10% |
| 2026-11-14-mandela-effect | Mandela | mandela | bf_emma · Influencer CAST[33] | Detective CAST[3] | memory vs reality cards (MEMORY ✗ / REALITY ✓): Mandela 1990/1994/2013 timeline, quote card "Luke, I am…" → "No, I am…", generic top-hat rich man WITHOUT monocle (do NOT draw the real Monopoly mascot, Pikachu, or Darth Vader; use text cards/silhouettes only), memory as rebuilding puzzle pieces |
| 2026-11-15-how-deep-is-the-ocean | Ocean | ocean | am_liam · YouTuber CAST[42] | Diver CAST[46] | depth scale descending (crane camera down), Everest silhouette dropped in with 2 km water above, pressure 1000× / 8 tons per square inch, Trieste bathyscaphe 1960 with cracked window, ~5 hrs timer, amphipods, plastic bag 2019 |
| 2026-11-16-why-yawns-are-contagious | Yawn | yawn | af_jessica · Nurse CAST[27] | Doctor CAST[7] | yawn chain, brain cooling (cold pack on forehead), family > strangers, kids age 4–5, chimps + dog, baby in womb 11 weeks (simple, tasteful), ending: asker yawns. Characters actually yawn: big open mouth. |
| 2026-11-17-war-lost-to-birds | EmuWar | emuwar | am_echo · Cowboy CAST[21] | Farmer CAST[41] | custom SVG emus (lots), wheat fields 1932 W. Australia, 20,000 counter, Major Meredith (Police CAST[38] or Pilot CAST[13]) + 2 machine guns (simple non-graphic) + 10,000 bullets, jammed gun, truck chase with emus faster (50 km/h), ~1,000 / ~10 bullets each, "WINNER: EMUS" trophy. Comedic. |
| 2026-11-18-what-if-you-never-sleep | NoSleep | nosleep | af_sarah · Hijabi Coder CAST[24] | Scientist CAST[0] | 1964 Randy Gardner (Skater CAST[29]), day counter 1→11, blurry eyes, street sign turning into a person hallucination, math fail, 18 h awake = drunk meter, microsleep blink, 14 h sleep, record book "NO LONGER ACCEPTED" |
| 2026-11-19-truth-about-bermuda-triangle | Bermuda | bermuda | bm_george · Traveler CAST[15] | Pilot CAST[13] | map triangle Miami–Bermuda–Puerto Rico, Flight 19 (5 planes, Dec 1945), spinning compass, wrong direction arrow, rescue plane + flames, Coast Guard / Lloyd's "NO MORE THAN ANYWHERE ELSE" stamp, busy traffic dots, storms & current, 1975 investigation "EXAGGERATED" |
| 2026-11-20-what-if-every-human-vanished | HumansGone | humansgone | af_river · Artist CAST[18] | Professor CAST[35] | city lights going out (night map), subway flooding, dogs (big survives, small not), Chernobyl town with wolves/boar/horses and plants overgrowing, timeline decades/centuries, plastic, radio waves expanding into space |
| 2026-11-21-is-megalodon-still-alive | Megalodon | megalodon | am_puck · Gamer Kid CAST[11] | Explorer CAST[1] | megalodon vs school bus scale (~15 m), tooth vs hand, coastal warm waters vs deep sea, teeth fossil map "ALL MILLIONS OF YEARS OLD", whale with no bite marks, 3.6 million years ago cooling + great white rival |
| 2026-11-22-why-you-wake-up-and-cant-move | SleepParalysis | paralysis | bf_isabella · Librarian CAST[31] | Doctor CAST[7] | bedroom at night, 1 in 12 people, brain "muscle switch" OFF during dreams, mind awake first, shadow figure in the room + weight on chest (spooky, not gory), names: Old Hag / kanashibari / 1781 painting as a frame, timer seconds, sleep on side tip |
| 2026-11-23-hijacked-a-plane-and-vanished | DBCooper | dbcooper | am_eric · YouTuber CAST[42] | Detective CAST[3] | Nov 24 1971, ticket "DAN COOPER" Portland, note "I HAVE A BOMB" (simple), $200,000 + 4 parachutes, Seattle passengers released, 727 rear stairs at night in rain, jump, "NEVER FOUND", 1980 boy finds $5,800 bills by river, serial numbers match. Cooper = Business CAST[17] with shades. |
| 2026-11-24-marshmallow-test | Marshmallow | marshmallow | af_heart · Brainy Girl CAST[44] | Scientist CAST[0] | 1 marshmallow now vs 2 later, 15-minute timer, kids coping (covering eyes, singing), school success chart, 2012 twist broken promise (crayons) → 3 min vs 12 min bars, 2018 study home life, "TRUST" reveal |
| 2026-11-25-why-do-we-dream | Dreams | dreams | bf_alice · Graduate CAST[23] | Professor CAST[35] | night sky dreamy palette, 2 hours a night clock, forgetting (memories evaporating), brain replaying the day (film reel), 2010 Harvard maze ×10 better, chase/falling rehearsal, blind dreamers: sound/touch/smell icons |
| 2026-11-26-concrete-that-heals-itself | Concrete | concrete | bm_daniel · Mechanic CAST[26] | Engineer CAST[8] | Pantheon dome (~1,900 yrs), modern concrete cracking at 50–100 yrs, MIT 2023 lime clasts (white lumps) under a magnifier, crack + water → lumps dissolve → crack sealed animation, Roman harbor wall + seawater + volcanic ash growing crystals, STRONGER over time |
| 2026-11-27-what-space-does-to-your-body | SpaceBody | spacebody | af_kore · Photographer CAST[19] | Astronaut CAST[2] | ISS interior, spine stretching +5 cm ruler, puffy face / bird legs, bone density -1%/month, treadmill 2 h/day, NASA twin study: two figures (Scott in space, Mark on Earth) ~1 year, DNA strand with caps (telomeres) lengthening |
| 2026-11-28-3-tricks-to-read-anyone | ReadPeople2 | readpeople2 | am_michael · Business CAST[17] | Detective CAST[3] | "PART 2" badge, numbered 1/2/3 cards, real vs fake smile (eye crinkles close-up), pupils dilating, coin flip 54%, story told backwards (rewind icon), cracks showing |
| 2026-11-29-deja-vu-why-it-happens | DejaVu | dejavu | af_aoede · DJ CAST[39] | Hacker CAST[5] | glitch effect, 2 out of 3 people, 2012 Colorado VR: new room with same layout as forgotten room (layout overlay match), brain two parts arguing FAMILIAR vs NEW, most common in young adults, healthy memory check ✓ |
| 2026-11-30-city-frozen-in-ash | Pompeii | pompeii | bm_fable · Uncle Ji CAST[25] | Historian CAST[45] | Vesuvius 79 AD over Pompeii, people fleeing, ash/gas cloud wave racing down at hundreds km/h, burial layers, forgotten ~1,700 years, 1863 Fiorelli plaster poured into hollow (respectful, simple shapes), 2024 DNA twist "MOTHER?" → "MAN, NOT RELATED", "WE GUESSED THE REST" |

## Sources / fact notes (copy the relevant ones into each BRIEF.md)
- Yamaguchi: Mitsubishi engineer, ~3 km from both hypocentres (Hiroshima Aug 6, Nagasaki Aug 9 1945); officially recognized as a double survivor in 2009; died 2010 aged 93 (BBC, Guardian obituaries).
- Krakatoa Aug 27 1883: Norham Castle captain ~40 mi away ("ear-drums of over half my crew have been shattered"); heard on Rodrigues ~4,800 km/3,000 mi away; pressure wave recorded worldwide for ~5 days; 36,000+ deaths, mostly tsunamis; vivid red sunsets, fire engines called out in Poughkeepsie NY (Nautilus "The Sound So Loud…", Simon Winchester's "Krakatoa").
- Hachiko: Akita, Prof. Hidesaburo Ueno (Univ. of Tokyo) 1924; Ueno died May 1925; waited ~9 yr 9 mo at Shibuya; statue 1934 with Hachiko present; died March 8 1935; remains partly buried beside Ueno in Aoyama Cemetery.
- Dancing plague: Strasbourg, July–Sept 1518, Frau Troffea; physicians prescribed more dancing (stage, musicians); deaths reported in some chronicles; John Waller's mass psychogenic illness explanation (St. Vitus); taken to St. Vitus shrine at Saverne.
- Sun gone: light and gravity at c, ~8 min 20 s; Earth moves on a tangent; temps ~0°F within a week, ~-100°F within a year (PopSci / Live Science estimates); hydrothermal vent ecosystems.
- Milgram 1961–63, Yale: 15–450 V; 26/40 (65%) to 450 V; psychiatrists predicted ~0.1%; two-peers-rebel variation → 10%.
- Mandela Effect: Fiona Broome 2009; Mandela released 1990, president 1994, died 2013; "No, I am your father" (Empire Strikes Back); Mr. Monopoly has no monocle; Pikachu tail no black tip; Prasad & Bainbridge 2022, Psychological Science (Univ. of Chicago) — visual Mandela effect.
- Challenger Deep ~10,935 m; Everest 8,849 m; pressure ~1,086 bar (~8 tons/sq in); Trieste Jan 23 1960, Piccard & Walsh, cracked window, ~4 h 47 min descent; amphipods; Vescovo 2019 plastic bag.
- Yawning: brain-cooling hypothesis (Gallup; cold-pack study); contagion stronger with kin/friends (Norscia & Palagi 2011); children rarely catch yawns before ~4–5; chimps and dogs catch yawns; foetal yawning from ~11 weeks.
- Emu War: Nov–Dec 1932, ~20,000 emus, Major G.P.W. Meredith, two Lewis guns, 10,000 rounds; jammed gun; truck chase; 986 kills with 9,860 rounds; emus run ~50 km/h; Meredith quote about bullet-carrying capacity.
- Randy Gardner 1964, 264.4 h (~11 days), observed by William Dement; vision problems day 2, hallucination (street sign as person) day 4; slept ~14 h; Guinness stopped accepting sleep-deprivation records; 17–19 h awake ≈ 0.05% BAC (Williamson & Feyer 2000); microsleeps.
- Bermuda Triangle: Flight 19 Dec 5 1945 (5 TBM Avengers, Lt. Charles Taylor, compass trouble, thought he was over the Keys); PBM Mariner rescue plane lost, ship saw flames; US Coast Guard & Lloyd's: no higher loss rate; Larry Kusche 1975 "The Bermuda Triangle Mystery—Solved".
- Humans gone: Alan Weisman "The World Without Us" (NYC subway pumps, flooding within days); Chernobyl Exclusion Zone wildlife (wolves, boar, Przewalski's horses); radio signals expanding ~100 light years.
- Megalodon: ~15–18 m estimates; teeth up to ~18 cm; coastal/warm waters; extinct ~3.6 Mya; no recent teeth; competition with great white (2022 zinc-isotope study, Nature Communications).
- Sleep paralysis: ~7.6% lifetime prevalence general population (Sharpless & Barber 2011 ≈ 1 in 12–13); REM atonia; Old Hag (Newfoundland), kanashibari (Japan); Fuseli "The Nightmare" 1781; supine sleep linked.
- D.B. Cooper: Nov 24 1971, Northwest Orient Flight 305 Portland→Seattle, "Dan Cooper", $200,000 + 4 parachutes, passengers released in Seattle, jumped from 727 aft stairs over SW Washington; 1980 Brian Ingram (8) found $5,800 on the Columbia River bank, serials matched; FBI ended active investigation 2016.
- Marshmallow test: Mischel, Stanford Bing Nursery School late 1960s–70s; Shoda, Mischel & Peake 1990 follow-up; Kidd, Palmeri & Aslin 2012 (Rochester) unreliable vs reliable adult ~3 vs ~12 min; Watts, Duncan & Quan 2018 replication, link much reduced by family background.
- Dreams: ~2 h/night of dreaming (REM-heavy); Wamsley & Stickgold 2010 (Harvard, maze nap, ~10× improvement); threat-simulation theory (Revonsuo); congenitally blind dream in sound, touch, smell.
- Roman concrete: Pantheon ~126 AD, largest unreinforced concrete dome; Seymour/Masic et al. 2023 Science Advances (MIT) lime clasts, hot mixing, self-healing; Jackson et al. 2017 (Univ. of Utah) seawater + volcanic ash → aluminous tobermorite in marine concrete.
- Space body: spine elongation up to ~3% (~5 cm); fluid shift "puffy face, bird legs"; ~1–1.5% bone loss per month in hips/spine; ~2 h/day exercise; NASA Twins Study (Scott Kelly 340 days, 2019 Science) telomeres lengthened in space, most changes returned.
- Read people: Duchenne smile (Guillaume Duchenne 1862); Eckhard Hess pupil dilation 1960s; Bond & DePaulo 2006 meta-analysis 54% lie detection; reverse-order recall increases liar cognitive load (Vrij et al. 2008).
- Déjà vu: ~2/3 of people experience; Cleary et al. 2012 (Colorado State) VR spatial-layout study; memory-checking theory (Akira O'Connor 2016); more common age 15–25, declines with age.
- Pompeii: Vesuvius 79 AD; pyroclastic surges; buried under ~4–6 m; rediscovered 1748; Giuseppe Fiorelli plaster casts 1863; 2024 Current Biology DNA study (Pilli et al.): "mother and child" was an unrelated adult male.
