#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src/engine"
DST="$ROOT/functions/_engine"
CFG_SRC="$ROOT/src/config"
CFG_DST="$ROOT/functions/_config"

[ -d "$SRC" ] || { echo "[FATAL] src/engine 不存在"; exit 1; }
mkdir -p "$DST" "$CFG_DST"
# S1.8: 隔离文件不删（客户端/服务端有意差异）
ISOLATED_ENGINE="game-engine.js"
ISOLATED_CONFIG="math-profile.js"
find "$DST" -maxdepth 1 -name '*.js' -not -name "$ISOLATED_ENGINE" -delete
find "$CFG_DST" -maxdepth 1 -name '*.js' -not -name "$ISOLATED_CONFIG" -delete

c=0
for f in "$SRC"/*.js; do
  [ -f "$f" ] || continue
  bn="$(basename "$f")"
  if [ "$bn" = "$ISOLATED_ENGINE" ]; then
    echo "[SKIP] $bn (client/server isolated)"
    continue
  fi
  cp -a "$f" "$DST/"
  c=$((c+1))
done
echo "[OK] engine $c 个"

for f in version.js math-profile.js symbols.locked.js paytable.locked.js; do
  if [ "$f" = "$ISOLATED_CONFIG" ]; then
    echo "[SKIP] $f (client/server isolated)"
    continue
  fi
  [ -f "$CFG_SRC/$f" ] && cp -a "$CFG_SRC/$f" "$CFG_DST/"
done
echo "[OK] config 3 个（math-profile 隔离）"

# S1.8: 数量检查改为 >=（隔离文件不同步）
sc=$(find "$SRC" -maxdepth 1 -name '*.js' | wc -l)
dc=$(find "$DST" -maxdepth 1 -name '*.js' | wc -l)
if [ "$dc" -lt "$((sc - 1))" ]; then
  echo "[FATAL] functions/_engine 文件数异常 src=$sc dst=$dc"
  exit 1
fi
echo "[OK] 一致性校验通过"
