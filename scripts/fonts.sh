#!/usr/bin/env bash
set -euo pipefail

src="${1:?usage: scripts/fonts.sh <folder with the source .ttf files>}"
out="$(cd "$(dirname "$0")/.." && pwd)/public/fonts"
pyftsubset="${PYFTSUBSET:-pyftsubset}"

latin='U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2190-2193'
symbols='U+2500-257F,U+2580-259F,U+25A0-25FF'
braille='U+2800-28FF'

subset() {
  "$pyftsubset" "$src/$1.ttf" --unicodes="$2" --flavor=woff2 --layout-features='kern' \
    --name-IDs='' --obfuscate-names --output-file="$out/$3.woff2"
}

rm -f "$out"/*.woff2
mkdir -p "$out"
subset IBMPlexMono-Regular "$latin,$symbols" plot-400
subset IBMPlexMono-SemiBold "$latin,$symbols" plot-600
subset SpaceMono-Regular "$latin" stub-400
subset SpaceMono-Bold "$latin" stub-700
subset JetBrainsMono-Regular "$latin,$symbols" tui-400
subset JetBrainsMono-Bold "$latin,$symbols" tui-700
subset NotoSansSymbols2-Regular "$braille" braille-400

ls -l "$out"
