#!/usr/bin/env bash
# Apex D1 备份脚本
# - 自动生成带时间戳的文件
# - 计算 SHA256
# - 可选 gzip 压缩
# - 支持 --remote / --local
# - 结果输出到 backups/

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="--remote"
OUTPUT_DIR="$PROJECT_ROOT/backups"

while [ $# -gt 0 ]; do
  case "$1" in
    --remote)
      MODE="--remote"; shift ;;
    --local)
      MODE="--local"; shift ;;
    --output)
      OUTPUT_DIR="$2"; shift 2 ;;
    *)
      echo "[ERROR] 未知参数：$1"; exit 1 ;;
  esac
done

mkdir -p "$OUTPUT_DIR"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "[ERROR] 未检测到 wrangler 命令"
  exit 1
fi

DATE=$(date +%Y%m%d_%H%M%S)
RAW_FILE="$OUTPUT_DIR/apex-db-${DATE}.sql"
GZ_FILE="${RAW_FILE}.gz"
SUM_FILE="${GZ_FILE}.sha256"

echo "[BACKUP] mode=$MODE output=$RAW_FILE"

if [ "$MODE" = "--remote" ]; then
  wrangler d1 export apex-db --remote --output="$RAW_FILE"
else
  wrangler d1 export apex-db --local --output="$RAW_FILE"
fi

if [ ! -f "$RAW_FILE" ]; then
  echo "[ERROR] 备份文件未生成：$RAW_FILE"
  exit 1
fi

SIZE=$(stat -c%s "$RAW_FILE" 2>/dev/null || wc -c < "$RAW_FILE")
if [ "$SIZE" -lt 100 ]; then
  echo "[ERROR] 备份文件过小（${SIZE}B），可能失败"
  rm -f "$RAW_FILE"
  exit 1
fi

gzip -f "$RAW_FILE"
# ============================================================
# 备份完整性校验（gzip + SQLite integrity + 表数量）
# 任何一步失败都删除备份并退出，防止生成无效备份
# ============================================================
if ! gunzip -t "$GZ_FILE" 2>/dev/null; then
  echo "[FATAL] gzip 损坏，删除 $GZ_FILE"
  rm -f "$GZ_FILE"
  exit 1
fi
TMP_SQL=$(mktemp)
TMP_DB=$(mktemp)
rm -f "$TMP_DB"
gunzip -c "$GZ_FILE" > "$TMP_SQL"
if command -v sqlite3 >/dev/null 2>&1; then
  if ! sqlite3 "$TMP_DB" < "$TMP_SQL" 2>/dev/null; then
    echo "[FATAL] SQL 导入临时 SQLite 失败，备份可能损坏"
    rm -f "$TMP_SQL" "$TMP_DB" "$GZ_FILE"
    exit 1
  fi
  INTEG=$(sqlite3 "$TMP_DB" "PRAGMA integrity_check;" 2>/dev/null || echo "fail")
  if [ "$INTEG" != "ok" ]; then
    echo "[FATAL] SQLite integrity_check != ok：$INTEG"
    rm -f "$TMP_SQL" "$TMP_DB" "$GZ_FILE"
    exit 1
  fi
  TBL_COUNT=$(sqlite3 "$TMP_DB" ".tables" 2>/dev/null | tr -s ' \t\n' '\n' | grep -c . || echo 0)
  if [ "$TBL_COUNT" -lt 5 ]; then
    echo "[FATAL] 表数量异常（$TBL_COUNT < 5）"
    rm -f "$TMP_SQL" "$TMP_DB" "$GZ_FILE"
    exit 1
  fi
  echo "[BACKUP] integrity_check=ok, tables=$TBL_COUNT"
else
  echo "[WARN] 缺少 sqlite3，仅校验 gzip 完整性"
fi
rm -f "$TMP_SQL" "$TMP_DB"

sha256sum "$GZ_FILE" > "$SUM_FILE"

echo "[OK] $GZ_FILE ($SIZE B)"
echo "[OK] $SUM_FILE"

# 清理 30 天前的备份
find "$OUTPUT_DIR" -name "apex-db-*.sql.gz" -mtime +30 -delete 2>/dev/null || true
find "$OUTPUT_DIR" -name "apex-db-*.sql.gz.sha256" -mtime +30 -delete 2>/dev/null || true
