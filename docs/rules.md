# Standing rules — and WHY each one exists

These come directly from Uzair's feedback while producing the first videos (Oct 30–31, 2026).
Treat them as requirements. If a rule seems to conflict with a skill or template, the rule here wins.

## Script
1. **Hook first — the first spoken line states what the video is about.**
   *Why:* viewers on Shorts never read the title or description; they decide in the first second.
   *Example of a rejected hook:* "Have you ever seen a sunset on Mars?" (Uzair: illogical — nobody has).
   *Accepted:* "Why is the sunset on Mars... blue?" → then "In 2015, NASA's rover filmed..."
   For titles: the title IS the hook, and the first spoken line matches it.
2. **Real, specific knowledge — verified.** Every number/claim is checked against a primary or reputable source before recording. Sources go in the episode `BRIEF.md` (and for news, in the YouTube description).
   *Why:* Uzair: "we need good scripts with hook stoppers and real knowledge." Credibility is the brand.
3. **Length:** ~1 minute is the target, **not a hard cap** — a video runs longer when the content needs it. News roundups are capped at ~2 minutes. (YouTube Shorts allow up to 3 minutes.)
4. **Short spoken sentences, `...` for pauses** (ElevenLabs honours them), numbers written as words in the script so the voice reads them naturally.
5. **End with the channel's own subscribe line** (see docs/network.md table).

## Voice
6. **Uzair's own ElevenLabs cloned voice.** The agent writes the script; Uzair generates the MP3 himself and attaches it.
   *Why:* the ElevenLabs API and connector are unreachable from the agent's workspace (egress proxy blocks api.elevenlabs.io). **Never ask for or store an API key** — one key was pasted in chat on Oct 30 and must be treated as compromised.

## Picture
7. **Characters: use the 50-character cast** (`docs/characters.md`, `engine/characters/`) — a host plus topic-fitting guests.
   *Why:* Uzair (Oct 31) wanted more human-like, more animated characters than the stick figure; the stick figure is now only a fallback.
   Characters must: lip-sync to the voice (`talk` from the loudness envelope), blink, show emotion, keep **both hands visible**, gesture while talking.
8. **Captions: word-by-word, the spoken word highlighted in a colored pill**, said words solid, upcoming words faded.
   *Why:* Uzair chose this over the stick-figure-shorts skill's "plain subtitles only" rule. On light backgrounds use dark ink text (see `LightCaptions` in the Learn AI trailer episode); on dark backgrounds use the kit's `Captions`.
9. **Style is dynamic, built from the topic** — no fixed channel look. Bright/warm for positive or school topics; dark for news/thriller/space. Uzair: "it's not required to follow dark and red style... animations should be dynamic, change according to topic."
10. **Motion on every video:** a slow push-in zoom per shot, impact shakes on key beats, slide/zoom transitions, staggered reveals, kinetic numbers, props from the 204-element library (`engine/element-library/`), and teaching devices where relevant (pen writing on a board, mouse cursor clicking UI). Prefer **one object morphing into another over a fade** (from the motion-graphics skill packs).
11. **Cover frame** (from Nov 2026): first frame shows one big yellow outlined keyword (e.g. MOON, BRAIN) so the Shorts grid looks clickable.

## Publishing
12. **YouTube first, then cross-post** to the other platforms with the YouTube link in every caption.
13. **News descriptions list all sources** (one link per story).
14. **After every video, commit and push the episode to this repo** (script, sents.json, words.ts, Film.tsx, entry.tsx, narration.mp3, BRIEF.md, contact sheet) and update `docs/publish-log.md` + `AGENTS.md` status.
   *Why:* the agent's cloud workspace is ephemeral; the repo is the memory that lets any AI agent continue the work.
