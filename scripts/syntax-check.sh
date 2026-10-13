#!/usr/bin/env bash
# Apex global JS syntax check
# covers: .js .cjs .mjs under functions/ src/ scripts/ tests/ + root
set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

FAIL=0
COUNT=0

TMP=$(mktemp)
{
  find functions src scripts tests -type f \
    \( -name "*.js" -o -name "*.cjs" -o -name "*.mjs" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/.wrangler/*" \
    -not -path "*/dist/*"
  find . -maxdepth 1 -type f \
    \( -name "*.js" -o -name "*.cjs" -o -name "*.mjs" \)
} | sort -u > "$TMP"

while IFS= read -r file; do
  COUNT=$((COUNT + 1))
  if node --check "$file" >/dev/null 2>&1; then
    echo "[OK] $file"
  else
    echo "[FAIL] $file"
    node --check "$file" || true
    FAIL=$((FAIL + 1))
  fi
done < "$TMP"
rm -f "$TMP"

echo ""
echo "[SUMMARY] checked=$COUNT failed=$FAIL"
[ "$FAIL" -eq 0 ]
