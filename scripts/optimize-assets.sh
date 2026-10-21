#!/usr/bin/env bash
# Generates the optimized files in assets/ from the originals in assets-src/.
# Idempotent: an output is rebuilt only when it is missing or older than its source.
# Requires: cwebp, avifenc, magick (ImageMagick 7), python3 -m fontTools (with brotli).
set -euo pipefail

cd "$(dirname "$0")/.."
SRC=assets-src
OUT=assets

stale() { [ ! -f "$2" ] || [ "$1" -nt "$2" ]; }

# Fonts: Plus Jakarta Sans TTF -> WOFF2
for weight in 400 600 700; do
  src="$SRC/jakarta-$weight.ttf"
  out="$OUT/jakarta-$weight.woff2"
  if stale "$src" "$out"; then
    python3 -m fontTools.ttLib.woff2 compress -o "$out" "$src"
    echo "font  $out"
  fi
done
