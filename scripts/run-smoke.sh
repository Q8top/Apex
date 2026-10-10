#!/usr/bin/env bash
# Apex smoke test runner (P2-6)
# Starts wrangler pages dev locally, waits for /api/health, runs
# tests/api-smoke.test.js, kills dev server, exits with smoke result.
#
# Usage: bash scripts/run-smoke.sh

set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${SMOKE_PORT:-8788}"
BASE_URL="http://localhost:${PORT}"
HEALTH_TIMEOUT_SEC="${SMOKE_HEALTH_TIMEOUT:-30}"
DEV_LOG="/tmp/apex-smoke-dev.log"

echo "============================================================"
echo "[smoke] start wrangler pages dev on port ${PORT}"
echo "============================================================"

# Start dev server in background
npx wrangler pages dev . --d1 apex_db=apex-db --port "$PORT" > "$DEV_LOG" 2>&1 &
DEV_PID=$!

cleanup() {
  echo "[smoke] kill dev server pid=${DEV_PID}"
  kill "$DEV_PID" 2>/dev/null || true
  wait "$DEV_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for /api/health
echo "[smoke] waiting for ${BASE_URL}/api/health (up to ${HEALTH_TIMEOUT_SEC}s)"
READY=0
for i in $(seq 1 "$HEALTH_TIMEOUT_SEC"); do
  if curl -sf -o /dev/null "${BASE_URL}/api/health"; then
    READY=1
    echo "[smoke] dev server ready after ${i}s"
    break
  fi
  # dev 未起来前提前失败（进程已退出）
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "[smoke][FATAL] dev server exited early. Log tail:"
    tail -20 "$DEV_LOG" || true
    exit 1
  fi
  sleep 1
done

if [ "$READY" != "1" ]; then
  echo "[smoke][FATAL] dev server never became ready. Log tail:"
  tail -20 "$DEV_LOG" || true
  exit 1
fi

# Run smoke test
echo ""
echo "============================================================"
echo "[smoke] running api-smoke.test.js"
echo "============================================================"
BASE_URL="$BASE_URL" node tests/api-smoke.test.js
RC=$?

echo ""
if [ "$RC" = "0" ]; then
  echo "[smoke] PASS"
else
  echo "[smoke] FAIL (rc=${RC})"
fi
exit "$RC"
