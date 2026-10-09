#!/bin/bash
# Apex D-2 fault suite runner.
cd "$(dirname "$0")/../.." || exit 1

PASS=0
FAIL=0
for f in d1-fault rate-limit-fault concurrency-fault config-fault; do
  echo ""
  echo "============================================================"
  echo "=== $f ==="
  echo "============================================================"
  if node "tests/fault/$f.cjs"; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
done

echo ""
echo "============================================================"
echo "fault suite: $PASS pass / $FAIL fail"
echo "============================================================"
[ $FAIL -eq 0 ] && exit 0 || exit 1
