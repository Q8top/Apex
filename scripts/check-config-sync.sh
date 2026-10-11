#!/usr/bin/env bash
# Apex · 校验 src/ 与 functions/ 镜像一致
# 目的：防止前后端 config/engine 漂移
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PAIRS=(
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
  # game-engine.js 客户端/服务端有差异（S1.7），不做 hash 对比
  # Sugar Rush 专属（物理隔离，独立镜像）
  "src/games/sugar-rush/config/symbols.locked.js:functions/games/sugar-rush/config/symbols.locked.js"
  "src/games/sugar-rush/config/paytable.locked.js:functions/games/sugar-rush/config/paytable.locked.js"
  "src/games/sugar-rush/config/math-profile.js:functions/games/sugar-rush/config/math-profile.js"
  "src/games/sugar-rush/engine/errors.js:functions/games/sugar-rush/engine/errors.js"
  "src/games/sugar-rush/engine/grid.js:functions/games/sugar-rush/engine/grid.js"
  "src/games/sugar-rush/engine/rng.js:functions/games/sugar-rush/engine/rng.js"
  "src/games/sugar-rush/engine/payout.js:functions/games/sugar-rush/engine/payout.js"
  "src/games/sugar-rush/engine/multiplier.js:functions/games/sugar-rush/engine/multiplier.js"
  "src/games/sugar-rush/engine/evaluator.js:functions/games/sugar-rush/engine/evaluator.js"
  "src/games/sugar-rush/engine/tumble.js:functions/games/sugar-rush/engine/tumble.js"
  "src/games/sugar-rush/engine/bonus.js:functions/games/sugar-rush/engine/bonus.js"
  "src/games/sugar-rush/engine/cap.js:functions/games/sugar-rush/engine/cap.js"
  "src/games/sugar-rush/engine/game-engine.js:functions/games/sugar-rush/engine/game-engine.js"
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

# B-1: 单向断言 —— 前端 src/config/math-profile.js 不得含 real 参数
# S1.6 精神：客户端与服务端数学隔离，real 只允许在 functions/_config/
if [ -f "src/config/math-profile.js" ]; then
  if grep -qE 'real[[:space:]]*:[[:space:]]*Object\.freeze' src/config/math-profile.js; then
    echo "[FATAL] src/config/math-profile.js 含 real 块，前后端隔离被破坏"
    echo "         real 参数只允许存在于 functions/_config/math-profile.js"
    FAIL=1
  else
    echo "[OK]   src/config/math-profile.js 不含 real 块（隔离正常）"
  fi
fi

echo ""
if [ "$FAIL" = "0" ]; then
  echo "[SUMMARY] config-sync passed"
  exit 0
else
  echo "[SUMMARY] config-sync FAILED"
  echo "  请执行: bash scripts/sync-engine.sh"
  exit 1
fi
