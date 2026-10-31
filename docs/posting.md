# Posting — Postsiva

All publishing goes through **Postsiva** (Uzair's own social media platform), via its MCP server
("Postsiva Social Media Manager"). Workspace name: "Learn AI WIth Uzair".

## Flow
1. `get_upload_link(media_type="video")` → returns an upload page URL (expires in ~15 min).
2. **Upload with the curl command** from the tool result (`curl -X POST https://backend.postsiva.com/media/upload -H "X-Upload-Token: …" -F media=@file.mp4 -F media_type=video`) → returns `media_id`. One token can upload several files within its 15 min. (Uzair allowlisted the Postsiva domain on Nov 1, 2026; before that he uploaded by hand.)
3. Post with `multi_execute_tool(tools=[{tool_slug, arguments}])` — note: the key is `tools`, not `tool_calls`.
   Tool discovery: `search_tools(queries=[{use_case, toolkits}])`. Action tools need Uzair's go-ahead.
4. One `media_id` works for every platform tool — upload once, post everywhere.

## YouTube
`YOUTUBE_POST_VIDEO { channel_id, title, media_id, description, made_for_kids:false, visibility:"PUBLIC", playlist_id?, scheduled_time? (ISO 8601 with timezone), draft? }`
- Channel ids: see docs/network.md.
- `scheduled_time` schedules instead of publishing now.
- Other YouTube tools: `YOUTUBE_GET_ACCOUNTS`, `YOUTUBE_CREATE_PLAYLIST`, `YOUTUBE_GET_PLAYLISTS`, `YOUTUBE_GET_POST`, `YOUTUBE_COMMENT_ON_POST`.

## Cross-posting (after YouTube is live)
| Platform | Tool slug | Extra args |
|---|---|---|
| Instagram Reel | INSTAGRAM_POST_REEL | text |
| Facebook Reel | FACEBOOK_POST_REEL | page_id `756356074224043`, text |
| TikTok | TIKTOK_POST_VIDEO | text (required) |
| LinkedIn page | LINKEDIN_POST_VIDEO | page_id `urn:li:organization:108813535`, text |
| Threads | THREADS_POST_VIDEO | text |
| Bluesky | BLUESKY_POST_VIDEO | text |
| Mastodon | MASTODON_POST_VIDEO | text (account @uzairyasin@mastodon.social) |
| Pinterest | PINTEREST_POST_VIDEO | not connected yet |

Every caption carries the YouTube video link + the channel link (funnel to YouTube).

## Description template
```
<one-line hook / what the video is>

<3–6 lines of the actual content, emoji bullets>

<channel promise line, e.g. "⏱ One minute of AI news. Every single day. Subscribe so you never miss a drop.">

More from me:
<links to the other three channels>

<📰 SOURCES — required for news; recommended for facts>

#tags #shorts
```

## Timing (Uzair, Nov 1 2026: maximise the US audience)
Weekdays 4:00 PM ET = 21:00 UTC (EST, Nov–Mar) / 20:00 UTC (EDT, Mar–Nov). Weekends 12:00 PM ET = 17:00 UTC (EST) / 16:00 UTC (EDT).
Reschedule with `YOUTUBE_MANAGE_SCHEDULED_POST {scheduled_post_id, channel_id, action:"reschedule", scheduled_time}`.
