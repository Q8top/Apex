#!/usr/bin/env bash
# Apex 双通道远程备份脚本
# 通道 1：GitHub Releases（仅 CI，本地无 gh 时跳过）
# 通道 2：Cloudflare KV（本地 + CI 都可）
#
# 用法：
#   bash scripts/backup-remote.sh              # 自动检测环境
#   bash scripts/backup-remote.sh --no-release # 只走 KV
#   bash scripts/backup-remote.sh --no-kv      # 只走 Release

set -euo pipefail

# ============================================================
# 配置
# ============================================================
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/backups"
KV_NAMESPACE_ID="24dc2e9b5cd649b7a0c866f3592e7a6a"
KV_LATEST_KEY="backup:latest"
KV_INDEX_KEY="backup:index"
KV_KEEP_DAYS=30
RELEASE_KEEP_DAYS=30
D1_BINDING="apex-db"
MIN_BACKUP_BYTES=100

# ============================================================
# 参数
# ============================================================
USE_RELEASE=1
USE_KV=1
while [ $# -gt 0 ]; do
  case "$1" in
    --no-release) USE_RELEASE=0; shift ;;
    --no-kv)      USE_KV=0; shift ;;
    *)            echo "[ERROR] 未知参数：$1"; exit 1 ;;
  esac
done

# ============================================================
# 环境检测
# ============================================================
IS_CI=0
[ "${GITHUB_ACTIONS:-}" = "true" ] && IS_CI=1

HAS_GH=0
command -v gh >/dev/null 2>&1 && HAS_GH=1

HAS_WRANGLER=0
command -v wrangler >/dev/null 2>&1 && HAS_WRANGLER=1

if [ "$HAS_WRANGLER" = "0" ]; then
  echo "[FATAL] 缺少 wrangler"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# ============================================================
# 1) 生成备份
# ============================================================
DATE=$(date -u +%Y%m%d_%H%M%S)
STAMP=$(date -u +%Y%m%d-%H%M%S)
RAW="$OUTPUT_DIR/apex-db-${DATE}.sql"
GZ="${RAW}.gz"
SUM="${GZ}.sha256"

echo "[BACKUP] date=$DATE"
echo "[BACKUP] target=$GZ"

wrangler d1 export "$D1_BINDING" --remote --output="$RAW"

if [ ! -f "$RAW" ]; then
  echo "[FATAL] 导出失败：$RAW 不存在"
  exit 1
fi

SIZE=$(stat -c%s "$RAW" 2>/dev/null || wc -c < "$RAW")
if [ "$SIZE" -lt "$MIN_BACKUP_BYTES" ]; then
  echo "[FATAL] 备份文件过小：${SIZE}B"
  rm -f "$RAW"
  exit 1
fi

gzip -f "$RAW"
sha256sum "$GZ" > "$SUM"
HASH=$(awk '{print $1}' "$SUM")

echo "[OK] 本地生成：$GZ (${SIZE}B, sha256=${HASH:0:16}...)"

# ============================================================
# 2) 通道 1：GitHub Releases
# ============================================================
RELEASE_OK=0
if [ "$USE_RELEASE" = "1" ]; then
  if [ "$HAS_GH" = "1" ] && [ -n "${GITHUB_TOKEN:-}" ]; then
    echo "[RELEASE] 上传到 GitHub Releases..."
    TAG="backup-${STAMP}"
    if gh release create "$TAG" \
         --title "Apex DB Backup $STAMP" \
         --notes "Auto backup at $(date -u +%Y-%m-%dT%H:%M:%SZ). size=${SIZE}B sha256=${HASH}" \
         "$GZ" "$SUM" 2>&1; then
      RELEASE_OK=1
      echo "[OK] Release 已上传：$TAG"
    else
      echo "[WARN] Release 上传失败（继续）"
    fi
  else
    if [ "$IS_CI" = "1" ]; then
      echo "[RELEASE] CI 环境但缺少 gh 或 GITHUB_TOKEN，跳过"
    else
      echo "[RELEASE] 本地环境无 gh CLI，跳过 Release 通道"
    fi
  fi
fi

# ============================================================
# 3) 通道 2：Cloudflare KV
# ============================================================
KV_OK=0
if [ "$USE_KV" = "1" ]; then
  echo "[KV] 上传到 Cloudflare KV..."
  KV_SIZE=$(stat -c%s "$GZ")
  KV_LIMIT=$((25 * 1024 * 1024))

  if [ "$KV_SIZE" -gt "$KV_LIMIT" ]; then
    echo "[WARN] 备份 ${KV_SIZE}B 超过 KV 25MiB 限制，跳过 KV 通道"
  else
    # 3.1 最新备份
    if wrangler kv key put \
         --namespace-id="$KV_NAMESPACE_ID" \
         "$KV_LATEST_KEY" \
         --path "$GZ" \
         --remote 2>&1 | tail -3; then
      KV_OK=1
      echo "[OK] KV 已写入 $KV_LATEST_KEY"
    else
      echo "[WARN] KV 写入 $KV_LATEST_KEY 失败"
    fi

    # 3.2 历史备份
    HIST_KEY="backup:${STAMP}"
    wrangler kv key put \
      --namespace-id="$KV_NAMESPACE_ID" \
      "$HIST_KEY" \
      --path "$GZ" \
      --remote 2>&1 | tail -2 || true

    # 3.3 sha256（存成纯文本）
    SHA_FILE=$(mktemp)
    printf '%s' "$HASH" > "$SHA_FILE"
    wrangler kv key put \
      --namespace-id="$KV_NAMESPACE_ID" \
      "backup:${STAMP}:sha256" \
      --path "$SHA_FILE" \
      --remote 2>&1 | tail -2 || true
    rm -f "$SHA_FILE"

    # 3.4 更新索引
    INDEX_FILE="$OUTPUT_DIR/kv-index.json"
    if wrangler kv key get \
         --namespace-id="$KV_NAMESPACE_ID" \
         "$KV_INDEX_KEY" \
         --remote > "$INDEX_FILE" 2>/dev/null; then
      :
    else
      echo '[]' > "$INDEX_FILE"
    fi

    # 用 node 更新 JSON（避免 jq 依赖）
    node -e "
      const fs=require('fs');
      const p='$INDEX_FILE';
      let arr=[]; try{arr=JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){arr=[];}
      arr.unshift({stamp:'$STAMP',size:${KV_SIZE},sha256:'$HASH',date:'$(date -u +%Y-%m-%dT%H:%M:%SZ)'});
      arr=arr.slice(0,30);
      fs.writeFileSync(p,JSON.stringify(arr,null,2));
    "
    wrangler kv key put \
      --namespace-id="$KV_NAMESPACE_ID" \
      "$KV_INDEX_KEY" \
      --path "$INDEX_FILE" \
      --remote 2>&1 | tail -2 || true
    rm -f "$INDEX_FILE"

    echo "[OK] KV 索引已更新"
  fi
fi

# ============================================================
# 4) 清理旧备份
# ============================================================
find "$OUTPUT_DIR" -name "apex-db-*.sql.gz" -mtime +$KV_KEEP_DAYS -delete 2>/dev/null || true
find "$OUTPUT_DIR" -name "apex-db-*.sql.gz.sha256" -mtime +$KV_KEEP_DAYS -delete 2>/dev/null || true

if [ "$RELEASE_OK" = "1" ] && [ "$HAS_GH" = "1" ]; then
  echo "[CLEANUP] 清理 ${RELEASE_KEEP_DAYS} 天前的 Release..."
  gh release list --limit 100 --json tagName,createdAt \
    --jq ".[] | select(.createdAt < \"$(date -u -d "-${RELEASE_KEEP_DAYS} days" +%Y-%m-%d)\") | .tagName" \
    2>/dev/null | while read -r tag; do
      [ -n "$tag" ] && gh release delete "$tag" --yes --cleanup-tag 2>/dev/null || true
    done
fi

# ============================================================
# 5) 汇总
# ============================================================
echo ""
echo "[SUMMARY]"
echo "  local_file : $GZ"
echo "  size_bytes : $SIZE"
echo "  sha256     : $HASH"
echo "  release_ok : $RELEASE_OK"
echo "  kv_ok      : $KV_OK"

if [ "$RELEASE_OK" = "0" ] && [ "$KV_OK" = "0" ]; then
  echo "[FATAL] 所有远程通道均失败"
  exit 1
fi

exit 0
