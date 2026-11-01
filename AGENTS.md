# AGENTS.md — handoff manual (The Facts Orbit)

You are continuing the production of **The Facts Orbit** (@factsorbitdaily, channel_id `UClV1WKFxpcsT2_4MvfxJP-A`).
Read this file, then `docs/rules.md`, then `docs/content-plan.md`. Everything you need is in this repo.

## The job
**One verified, surprising fact per day** — space, history, nature, world & culture, human nature/psychology, science and "what if" scenarios — acted out by the stick figure.
One video per day. End line of every video: *"Subscribe for a new fact every single day."*

## Who does what
- **Uzair (owner):** approves, records the narration in his ElevenLabs cloned voice from your script, uploads finished MP4s to Postsiva when asked (the agent workspace can't reach the upload server), gives direction.
- **You (agent):** research + verify facts, write scripts, build the film in code, QA, publish via Postsiva MCP, keep this repo up to date.

## Current status (update this block after every video)
- First video published Oct 31 (https://youtu.be/-mQPpige55M).
- Nov 1–7: 7 films rendered, uploaded and scheduled for US prime time (weekdays 21:00 UTC, weekends 17:00 UTC).
- Nov 8–30: 23 films in the **Q&A duo format** (a cast character asks with their own Kokoro voice, Adam `am_adam` explains). All rendered, passed the 2-pass QA, and were uploaded and scheduled on Nov 1. IDs are in docs/publish-log.md. The brief is docs/film-brief-nov8-30.md. November is fully scheduled.

## Next actions
1. December queue: validate demand first (YouTube search ceiling + median Short views), present topics to Uzair, then script → narrate (engine/tts/narrate.py) → gen_words → Film.tsx → render ONE AT A TIME (2 CPUs) → `python3 engine/qa/verify.py episodes/<ep>` and look at every passA/passB sheet → fix → upload → schedule.
2. Fill in YouTube links in docs/publish-log.md as videos go live.
3. Reserve topics: the Tunguska event, the immortal jellyfish, the Bloop, Pyramids Part 2.

## Definition of done for a video
1. Script follows docs/rules.md (hook = topic, verified facts, CTA last) and Uzair recorded it.
2. Film built with the engine: word-highlight captions, lip-sync, both hands, motion on every shot, cover frame.
3. QA stills checked; final MP4 sent to Uzair; approved.
4. Published (YouTube first, then cross-posts if requested) with description per docs/posting.md.
5. **Committed + pushed**: `episodes/<date>-<slug>/` (script.md, sents.json, words.ts, Film.tsx, entry.tsx, narration.mp3, BRIEF.md with link + sources, contact_sheet.jpg) + `docs/publish-log.md` + the status block above.

## Don'ts
- Don't change the channel's purpose or the rules without Uzair.
- Don't commit rendered MP4s (they live on YouTube) or any API keys/tokens.
- Don't invent facts, prices or links — verify or cut.
