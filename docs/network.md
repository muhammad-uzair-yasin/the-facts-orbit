# The channel network — what it is and why it's built this way

Owner: **Muhammad Uzair Yasin** (Agentic AI developer, Lahore, Pakistan; CEO of Postsiva).
Production engine: an AI agent (Claude) writes scripts, builds every video in code, and posts via Postsiva.
Uzair records the narration in his own ElevenLabs cloned voice and approves/directs.

## The 4 channels (one purpose each — one repo each)

| Channel | Handle | YouTube channel_id | Purpose (ONE video/day) | End CTA | Repo |
|---|---|---|---|---|---|
| Learn AI With Uzair | @uzair.devops | UCZYmYaoskkNkoOE7LyJOKuw | **Agent School** — a sequenced free 6-month AI course, 1 lesson/day | "Lesson N+1 drops tomorrow — subscribe so you don't fall behind" | `learn-ai-with-uzair` |
| Agentic Ai with Uzair | @agenticaiwithuzair | UCqmcLDjI298RwYjOjb17d8w | **AI tools** — one useful/free AI tool or repo per day | "Subscribe for a new AI tool every day" | `agentic-ai-with-uzair` |
| Ai News | @thedailyai-01 | UCaW1ycHQgEaWcIi14v3Ce9w | **Daily AI news roundup** — everything that happened in AI today | "Subscribe, same time tomorrow" | `ai-news-daily` |
| The Facts Orbit | @factsorbitdaily | UClV1WKFxpcsT2_4MvfxJP-A (note: `UCl` = lowercase L) | **Facts** — space, history, nature, world, human nature, science, "what if" | "Subscribe for a new fact every single day" | `the-facts-orbit` |

### Why single-purpose channels (decided by Uzair, Oct 31 2026)
- Originally everything went to one channel (AI + facts + news mixed). YouTube's recommender learns *who a channel is for*; a mixed feed confuses it and subscribers who came for one thing churn on the others.
- So each audience got its own channel: learners (course), builders (tools), followers of the industry (news), general curious viewers (facts).
- Every description cross-links the other three so audiences can flow between them.

## Shared identity across all 4
- **One character everywhere:** a hand-drawn-style **stick figure** (white round head, ink outline, stick limbs, one colored costume). The 3D mascot "Piva" was built first and then **retired** by Uzair (Oct 31) — kept only as an archived artifact.
- **No fixed visual style per channel.** Each video's world (set, palette, light) is designed from its topic. Bright paper classroom for school, navy studio for news, Mars dusk for a Mars fact, etc.
- **Word-by-word highlighted captions** synced to the voice, on every video.

## Funnel
YouTube is the lead platform. When a video is cross-posted (Instagram Reels, Facebook Reels, TikTok, LinkedIn page, Threads, Bluesky, Mastodon), the caption always carries the YouTube video link + the channel link, to pull subscribers to YouTube.

## Daily slate (from Nov 1, 2026)
| Slot | Channel | Source of content |
|---|---|---|
| Lesson | Learn AI With Uzair | Next lesson in `learn-ai-with-uzair/docs/content-plan.md` (strict order) |
| News | Ai News | The Daily AI News Digest (scheduled research task) + fresh search |
| Tool | Agentic Ai with Uzair | Digest sections "New AI tools" + "Free tools" + trending GitHub repos |
| Fact | The Facts Orbit | Queue in `the-facts-orbit/docs/content-plan.md` |
