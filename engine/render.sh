#!/usr/bin/env bash
# Render (or preview a still of) one episode with the shared Remotion engine.
#
#   bash engine/render.sh episodes/<episode-dir>                 -> episodes/<episode-dir>/render.mp4
#   bash engine/render.sh episodes/<episode-dir> out.mp4
#   bash engine/render.sh episodes/<episode-dir> --still 300     -> episodes/<episode-dir>/still_300.png
#
# Episode folder must contain: Film.tsx, entry.tsx, words.ts, narration.mp3 (+ optional extra/*.mp3 beds).
# Film.tsx imports "./kit" and "./words"; its audio uses staticFile("projects/<slug>/narration.wav").
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
ENG="$REPO/engine"
EP="$(cd "$1" && pwd)"; shift
MODE=render; FRAME=0; OUT="$EP/render.mp4"
if [[ "${1:-}" == "--still" ]]; then MODE=still; FRAME="${2:-0}"; OUT="$EP/still_${FRAME}.png"; elif [[ -n "${1:-}" ]]; then OUT="$1"; fi

cd "$ENG"
[[ -d node_modules ]] || npm ci --no-audit --no-fund

SLUG="$(grep -o 'projects/[A-Za-z0-9_-]*/' "$EP/Film.tsx" | head -1 | cut -d/ -f2 || true)"
[[ -n "$SLUG" ]] || SLUG="$(grep -o '<Narration slug="[A-Za-z0-9_-]*"' "$EP/Film.tsx" | head -1 | cut -d'"' -f2)"
COMP="$(grep -o 'id="[A-Za-z0-9_-]*"' "$EP/entry.tsx" | head -1 | cut -d'"' -f2)"
mkdir -p "public/projects/$SLUG"
ffmpeg -y -v error -i "$EP/narration.mp3" -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 "public/projects/$SLUG/narration.wav"
if [[ -d "$EP/extra" ]]; then for f in "$EP"/extra/*.mp3; do ffmpeg -y -v error -i "$f" -ar 48000 "public/projects/$SLUG/$(basename "${f%.mp3}").wav"; done; fi

B="src/build_$SLUG"
rm -rf "$B" && mkdir -p "$B"
cp src/*.tsx "$EP/Film.tsx" "$EP/entry.tsx" "$EP/words.ts" "$B/"

# Chrome: Remotion downloads its own on a normal machine. In the Claude cloud workspace the download is
# blocked, so point it at the pre-installed Playwright chromium.
CHROME_ARG=()
if [[ -n "${REMOTION_CHROME:-}" ]]; then CHROME_ARG=(--browser-executable="$REMOTION_CHROME")
else for c in /opt/pw-browsers/chromium-*/chrome-linux64/chrome; do [[ -x "$c" ]] && CHROME_ARG=(--browser-executable="$c") && break; done; fi

if [[ $MODE == still ]]; then
  npx remotion still "$B/entry.tsx" "$COMP" "$OUT" --frame="$FRAME" "${CHROME_ARG[@]}" --log=error
else
  npx remotion render "$B/entry.tsx" "$COMP" "$OUT" "${CHROME_ARG[@]}" --concurrency=${RENDER_CONCURRENCY:-2} --log=error
  # master: -14 LUFS integrated, true peak <= -1.5 dBTP (YouTube/TikTok targets)
  ffmpeg -y -v error -i "$OUT" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k "${OUT%.mp4}_m.mp4" && mv "${OUT%.mp4}_m.mp4" "$OUT"
  ffmpeg -y -v error -i "$OUT" -vf "select='not(mod(n\,150))',scale=270:-1,tile=6x3" -frames:v 1 "${OUT%.mp4}_sheet.jpg" || true
fi
echo "done -> $OUT"
