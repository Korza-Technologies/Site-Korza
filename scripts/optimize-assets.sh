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

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# App mockups: PNG -> AVIF + WebP at 480w and 800w
for name in hiven loum belletonn pe-de-algodao; do
  src="$SRC/$name-mockup.png"
  for width in 480 800; do
    webp="$OUT/$name-mockup-$width.webp"
    avif="$OUT/$name-mockup-$width.avif"
    if stale "$src" "$webp" || stale "$src" "$avif"; then
      magick "$src" -resize "${width}x" -strip "$TMP/$name-$width.png"
      cwebp -quiet -q 80 -alpha_q 90 -m 6 "$TMP/$name-$width.png" -o "$webp"
      avifenc -q 60 -s 4 "$TMP/$name-$width.png" "$avif" >/dev/null
      echo "image $webp $avif"
    fi
  done
done

# Client logo sprite: half the original size, exact same aspect ratio (2721x2397 = 3 x 907x799),
# so the percentage offsets used in the HTML keep pointing at the same cells.
src="$SRC/client-logos.png"
out="$OUT/client-logos.webp"
if stale "$src" "$out"; then
  magick "$src" -resize 1814x1598! -strip "$TMP/client-logos.png"
  cwebp -quiet -q 85 -m 6 "$TMP/client-logos.png" -o "$out"
  echo "image $out"
fi

# Shopify logo: shown at most ~40px wide, 96px covers high-density screens
src="$SRC/shopify-clean.png"
out="$OUT/shopify-logo.webp"
if stale "$src" "$out"; then
  magick "$src" -resize 96x96 -strip "$TMP/shopify-logo.png"
  cwebp -quiet -q 90 -m 6 "$TMP/shopify-logo.png" -o "$out"
  echo "image $out"
fi

# Apple touch icon: the favicon mark on a full square (iOS rounds the corners itself), 180x180 PNG
src="$OUT/favicon.svg"
out="$OUT/apple-touch-icon.png"
if stale "$src" "$out"; then
  sed 's/ rx="14"//' "$src" > "$TMP/touch-icon.svg"
  magick -density 1152 -background '#155dfc' "$TMP/touch-icon.svg" -resize 180x180 -flatten -depth 8 -strip "$out"
  echo "image $out"
fi

# Open Graph preview: 1200x630 JPEG with the headline and the Hiven app on a phone
out="$OUT/og-image.jpg"
og_sources=("$SRC/hiven-mockup.png" "$OUT/korza-logo.png" "$SRC/jakarta-600.ttf" "$SRC/jakarta-400.ttf" "$0")
og_stale=false
for src in "${og_sources[@]}"; do if stale "$src" "$out"; then og_stale=true; fi; done
if $og_stale; then
  magick "$SRC/hiven-mockup.png" -resize x560 -background none -rotate 7 "$TMP/og-phone.png"
  magick -size 1200x630 gradient:'#ffffff-#eaf1ff' \
    \( -size 620x620 radial-gradient:'#cfe0ff-#eaf1ff00' \) -geometry +640+20 -composite \
    \( "$TMP/og-phone.png" \) -gravity northwest -geometry +790+18 -composite \
    \( "$OUT/korza-logo.png" -resize 200x \) -geometry +80+64 -composite \
    -font "$SRC/jakarta-600.ttf" -pointsize 72 -kerning -2 \
    -fill '#10213b' -annotate +76+196 'Sua marca' \
    -fill '#155dfc' -annotate +76+276 'no bolso do' -annotate +76+356 'seu cliente.' \
    -font "$SRC/jakarta-400.ttf" -pointsize 27 -kerning 0 -fill '#42556c' \
    -annotate +80+478 'Sua loja Nuvemshop ou Shopify em um app' -annotate +80+518 'para iOS e Android.' \
    -strip -sampling-factor 4:2:0 -quality 82 -interlace JPEG "$out"
  echo "image $out"
fi
