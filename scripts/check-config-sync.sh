#!/usr/bin/env bash
# Apex · 校验 src/ 与 functions/ 镜像一致
# 目的：防止前后端 config/engine 漂移
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PAIRS=(
  "src/config/math-profile.js:functions/_config/math-profile.js"
  "src/config/paytable.locked.js:functions/_config/paytable.locked.js"
  "src/config/symbols.locked.js:functions/_config/symbols.locked.js"
  "src/config/version.js:functions/_config/version.js"
  "src/engine/errors.js:functions/_engine/errors.js"
  "src/engine/grid.js:functions/_engine/grid.js"
  "src/engine/rng.js:functions/_engine/rng.js"
  "src/engine/multiplier.js:functions/_engine/multiplier.js"
  "src/engine/evaluator.js:functions/_engine/evaluator.js"
  "src/engine/tumble.js:functions/_engine/tumble.js"
  "src/engine/bonus.js:functions/_engine/bonus.js"
  "src/engine/payout.js:functions/_engine/payout.js"
  "src/engine/game-engine.js:functions/_engine/game-engine.js"
)

FAIL=0
for p in "${PAIRS[@]}"; do
  A="${p%%:*}"; B="${p##*:}"
  if [ ! -f "$A" ]; then echo "[MISS] $A"; FAIL=1; continue; fi
  if [ ! -f "$B" ]; then echo "[MISS] $B"; FAIL=1; continue; fi
  HA=$(sha256sum "$A" | cut -c1-16)
  HB=$(sha256sum "$B" | cut -c1-16)
  if [ "$HA" != "$HB" ]; then
    echo "[DIFF] $A"
    echo "       src: $HA"
    echo "       fnc: $HB"
    FAIL=1
  else
    echo "[OK]   $A"
  fi
done

echo ""
if [ "$FAIL" = "0" ]; then
  echo "[SUMMARY] config-sync passed"
  exit 0
else
  echo "[SUMMARY] config-sync FAILED"
  echo "  请执行: bash scripts/sync-engine.sh"
  exit 1
fi
