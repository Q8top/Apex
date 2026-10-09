#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src/engine"
DST="$ROOT/functions/_engine"
CFG_SRC="$ROOT/src/config"
CFG_DST="$ROOT/functions/_config"

[ -d "$SRC" ] || { echo "[FATAL] src/engine 不存在"; exit 1; }
mkdir -p "$DST" "$CFG_DST"
find "$DST" -maxdepth 1 -name '*.js' -delete
find "$CFG_DST" -maxdepth 1 -name '*.js' -delete

c=0
for f in "$SRC"/*.js; do [ -f "$f" ] || continue; cp -a "$f" "$DST/"; c=$((c+1)); done
echo "[OK] engine $c 个"

for f in version.js math-profile.js symbols.locked.js paytable.locked.js; do
  [ -f "$CFG_SRC/$f" ] && cp -a "$CFG_SRC/$f" "$CFG_DST/"
done
echo "[OK] config 4 个"

sc=$(find "$SRC" -maxdepth 1 -name '*.js' | wc -l)
dc=$(find "$DST" -maxdepth 1 -name '*.js' | wc -l)
[ "$sc" = "$dc" ] || { echo "[FATAL] 文件数不一致 src=$sc dst=$dc"; exit 1; }
echo "[OK] 一致性校验通过"
