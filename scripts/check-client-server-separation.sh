#!/usr/bin/env bash
# Apex · 客户端/服务端有意隔离的正向断言
#
# 两处有意差异：
#   1. game-engine.js  — 客户端有 S1.7 守卫；服务端无
#   2. math-profile.js — 服务端有 real；客户端只 demo
#
# 本脚本不断言『两份相同』，而是断言『隔离正确』。
set -euo pipefail
cd "$(dirname "$0")/.."

FAIL=0

# ============ math-profile 隔离 ============
if ! grep -qE 'real[[:space:]]*:[[:space:]]*Object\.freeze' functions/_config/math-profile.js; then
  echo "[FATAL] functions/_config/math-profile.js 缺少 real 块"
  FAIL=1
else
  echo "[OK]   functions/_config/math-profile.js 含 real 块"
fi

if grep -qE 'real[[:space:]]*:[[:space:]]*Object\.freeze' src/config/math-profile.js; then
  echo "[FATAL] src/config/math-profile.js 含 real 块（隔离被破坏）"
  FAIL=1
else
  echo "[OK]   src/config/math-profile.js 不含 real 块"
fi

# ============ game-engine 隔离（用行为标记字符串）============
# 客户端应包含的 S1.7 守卫标记
CLIENT_MARKER_A="client engine is demo-only"
CLIENT_MARKER_B="gridOverride disabled in production"

if ! grep -q "$CLIENT_MARKER_A" src/engine/game-engine.js; then
  echo "[FATAL] src/engine/game-engine.js 缺少 real 拦截守卫 ($CLIENT_MARKER_A)"
  FAIL=1
else
  echo "[OK]   客户端含 real 拦截守卫"
fi

if ! grep -q "$CLIENT_MARKER_B" src/engine/game-engine.js; then
  echo "[FATAL] src/engine/game-engine.js 缺少 gridOverride 生产禁用守卫"
  FAIL=1
else
  echo "[OK]   客户端含 gridOverride 生产禁用"
fi

if grep -q "$CLIENT_MARKER_A" functions/_engine/game-engine.js; then
  echo "[FATAL] 服务端含客户端 real 拦截守卫（服务端不应拒绝 real）"
  FAIL=1
else
  echo "[OK]   服务端不含 real 拦截（允许 real）"
fi

if grep -q "$CLIENT_MARKER_B" functions/_engine/game-engine.js; then
  echo "[FATAL] 服务端含客户端 gridOverride 守卫"
  FAIL=1
else
  echo "[OK]   服务端不含 gridOverride 生产禁"
fi

if [ "$FAIL" = "1" ]; then
  echo "[SUMMARY] client/server separation FAILED"
  exit 1
fi

echo "[SUMMARY] client/server separation passed"
