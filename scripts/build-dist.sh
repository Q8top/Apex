#!/usr/bin/env bash
# Apex 生产部署打包脚本
# 目的：只拷贝"必要时上 CDN"的静态资源，敏感文件不上传
# 用法：bash scripts/build-dist.sh [--clean]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

echo "[BUILD] ROOT=$ROOT"
echo "[BUILD] DIST=$DIST"

# 1. 清空
rm -rf "$DIST"
mkdir -p "$DIST"

# 2. 静态 HTML 页面（显式白名单，绝不 *.html 通配）
for f in index.html 404.html privacy.html terms.html status.html; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$DIST/" && echo "  [COPY] $f"
done

# 3. SEO / PWA / 元数据
for f in manifest.json robots.txt sitemap.xml favicon.svg; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$DIST/" && echo "  [COPY] $f"
done

# 4. 图片资源（根目录下所有图片）
for f in "$ROOT"/*.webp "$ROOT"/*.jpeg "$ROOT"/*.jpg "$ROOT"/*.png; do
  [ -f "$f" ] || continue
  bn="$(basename "$f")"
  cp "$f" "$DIST/" && echo "  [COPY] $bn"
done
# 5. Cloudflare Pages 特殊文件（_headers / _redirects）
for f in _headers _redirects; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$DIST/" && echo "  [COPY] $f"
done

# 6. src/ 整个目录（前端 JS/CSS）
if [ -d "$ROOT/src" ]; then
  cp -r "$ROOT/src" "$DIST/src"
  echo "  [COPY] src/"
fi

# 7. i18n/ 目录（浏览器 fetch 加载的语言包）
if [ -d "$ROOT/i18n" ]; then
  cp -r "$ROOT/i18n" "$DIST/i18n"
  echo "  [COPY] i18n/"
fi

# 8. 明确警告：以下目录绝不能进入 dist/
echo ""
echo "[BUILD] 检查 dist/ 中不应存在的敏感文件..."
BAD=0
for bad in wrangler.toml package.json package-lock.json .env .dev.vars .gitignore \
           tests functions migrations scripts docs backups .wrangler .git .github \
           .assetsignore _routes.json sw.js; do
  if [ -e "$DIST/$bad" ]; then
    echo "  [ERROR] dist/$bad 不应存在"
    BAD=1
  fi
done
[ "$BAD" = "1" ] && { echo "[BUILD] 失败：dist/ 含敏感文件"; exit 1; }

# 9. 统计
echo ""
echo "[BUILD] dist/ 内容清单："
find "$DIST" -type f | sort
echo ""
echo "[BUILD] 文件数：$(find "$DIST" -type f | wc -l)"
echo "[BUILD] 总大小：$(du -sh "$DIST" | awk '{print $1}')"
echo "[BUILD] 完成"
