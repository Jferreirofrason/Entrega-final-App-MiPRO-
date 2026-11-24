#!/bin/sh
# Genera el HTML y el PDF del handoff a partir del Markdown.
# El Markdown es la fuente de verdad; esto solo lo publica.
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Sin argumento, el handoff general; con argumento, el documento que se pida.
#   sh docs/pdf.sh hu-1518-1579-notificaciones-handoff
BASE="${1:-mipro-design-handoff}"

python3 "$DIR/generar.py" "$BASE"

"$CHROME" --headless --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$DIR/$BASE.pdf" \
  --virtual-time-budget=20000 \
  "file://$DIR/$BASE.html" >/dev/null 2>&1

echo "escrito docs/$BASE.pdf"
