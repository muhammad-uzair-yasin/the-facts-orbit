#!/usr/bin/env bash
# bash engine/thumbs/render_thumbs.sh 01 02 ...   -> episodes/<ep>/thumbnail.png
set -euo pipefail
ENG="$(cd "$(dirname "$0")/.." && pwd)"; REPO="$(dirname "$ENG")"; cd "$ENG"
B=src/build_thumbs; rm -rf $B && mkdir -p $B && cp src/*.tsx thumbs/*.tsx $B/
CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux64/chrome | head -1)
npx remotion bundle $B/entry.tsx --out-dir=/tmp/thumb_bundle --log=error >/dev/null
for e in "$@"; do ep=$(ls -d "$REPO"/episodes/2026-11-$e-*); npx remotion still /tmp/thumb_bundle Thumb$e "$ep/thumbnail.png" --browser-executable="$CH" --log=error; echo "$ep/thumbnail.png"; done
