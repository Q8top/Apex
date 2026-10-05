#!/bin/bash
# CI 自检：dist/*.html 里所有 /src/ 引用必须带 ?v=
# 用法：bash scripts/check-cache-refs.sh  （在 build-dist.sh 之后跑）
set -eu
cd "$(dirname "$0")/.."

[ -d dist ] || { echo "[SKIP] dist/ 不存在"; exit 0; }

FAIL=0
for f in dist/*.html; do
  [ -f "$f" ] || continue
  refs=$(grep -oE '(href|src)="/src/[^"]+"' "$f" 2>/dev/null || true)
  [ -z "$refs" ] && continue
  while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    url="${ref#*\"}"
    url="${url%\"}"
    case "$url" in
      *\?v=*) ;;
      *) echo "[FAIL] $(basename "$f"): 缺 ?v= -> $url"; FAIL=1 ;;
    esac
  done <<< "$refs"
done

if [ "$FAIL" = "1" ]; then
  echo ""
  echo "[提示] HTML 里 /src/ 引用必须写成 /src/... 前导斜杠，"
  echo "       hash-assets.mjs 才能自动加 ?v= 内容 hash"
  exit 1
fi

echo "[OK] 所有 /src/ 引用都带 ?v= hash"
