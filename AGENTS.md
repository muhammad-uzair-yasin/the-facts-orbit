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
- Nov 1–7 week: topics picked by demand research; 7 scripts written AND narrated by the agent (Kokoro am_adam) in `episodes/2026-11-0*/`. Films not built yet.

## Next actions
1. For each `episodes/2026-11-0*` folder: run engine/gen_words.py → build Film.tsx/entry.tsx (topic-built world, cover frame with big yellow keyword) → QA → send to Uzair.
2. Uzair uploads each MP4 (Postsiva upload link) → schedule with `scheduled_time` (Nov N, 14:00 UTC).
3. Keep the queue ≥ 7 ahead, rotating niches; psychology lists get Part 2 sequels.

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
