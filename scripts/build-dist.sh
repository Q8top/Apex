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
for f in index.html home.html 404.html privacy.html terms.html status.html announcements.html game.html slot.html olympus.html tts-preview.html; do
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
# 5. Cloudflare Pages 特殊文件（_headers / _redirects / _routes.json）
# 注意：_routes.json 决定哪些路径被静态资源服务、哪些交给 Functions，
#       缺失会导致 /functions /migrations 等源码目录被意外暴露
for f in _headers _redirects _routes.json; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$DIST/" && echo "  [COPY] $f"
done

# 6. src/ 整个目录（前端 JS/CSS）
if [ -d "$ROOT/src" ]; then
  cp -r "$ROOT/src" "$DIST/src"
  echo "  [COPY] src/"
fi

# 6.5 fonts/ 目录（自托管字体，去 Google Fonts）
if [ -d "$ROOT/fonts" ]; then
  cp -r "$ROOT/fonts" "$DIST/fonts"
  echo "  [COPY] fonts/"
fi

# 6.9 assets/ 目录（游戏封面图等）
if [ -d "$ROOT/assets" ]; then
  cp -r "$ROOT/assets" "$DIST/assets"
  echo "  [COPY] assets/"
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
# 注意：_routes.json 是 Cloudflare Pages 必需的路由配置文件，
#       必须存在于 dist/ 才会生效，绝不能列入"不应存在"清单。
# 注意：.assetsignore 是构建期文件，不需要进入 dist/。
for bad in wrangler.toml package.json package-lock.json .env .dev.vars .gitignore \
           tests functions migrations scripts docs backups .wrangler .git .github; do
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

# ============================================================
# [Phase6 自动添加] 强制复制 sw.js 到 dist/
# 原因：旧版 SW 缓存了 HTML，此自杀版 SW 必须部署给所有用户，
#       否则旧设备上的旧 SW 永远不会注销。
# ============================================================
if [ -f "$ROOT/sw.js" ]; then
  cp -f "$ROOT/sw.js" "$DIST/sw.js"
  echo "  [COPY] sw.js"
else
  echo "  [WARN] 根目录 sw.js 不存在，跳过"
fi

# ============================================================
# [R20] 给静态资源加内容 hash 版本号（浏览器强制拉新）
# ============================================================
node scripts/hash-assets.mjs
