#!/usr/bin/env bash
# Apex D1 恢复脚本
# 用法：
#   bash scripts/restore.sh backups/apex-db-XXX.sql.gz --remote
#   bash scripts/restore.sh backups/apex-db-XXX.sql.gz --local
#   bash scripts/restore.sh backups/apex-db-XXX.sql.gz --remote --yes
#
# 说明：
# - 先校验 SHA256
# - 再导入临时 SQLite 验证 SQL 语法
# - 需手动加 --yes 才真正覆盖目标数据库
# - 恢复后再次导出并验证表数量 >= 5

set -euo pipefail

GZ_FILE=""
MODE=""
CONFIRM=0

while [ $# -gt 0 ]; do
  case "$1" in
    --remote) MODE="--remote"; shift ;;
    --local)  MODE="--local"; shift ;;
    --yes)    CONFIRM=1; shift ;;
    -*)       echo "[ERROR] 未知参数：$1"; exit 1 ;;
    *)        GZ_FILE="$1"; shift ;;
  esac
done

if [ -z "$GZ_FILE" ] || [ ! -f "$GZ_FILE" ]; then
  echo "[ERROR] 请提供备份文件路径"
  exit 1
fi

if [ -z "$MODE" ]; then
  echo "[ERROR] 必须指定 --remote 或 --local"
  exit 1
fi

# 1) 校验 checksum
if [ -f "${GZ_FILE}.sha256" ]; then
  echo "[VERIFY] sha256"
  if ! sha256sum -c "${GZ_FILE}.sha256" >/dev/null 2>&1; then
    echo "[ERROR] SHA256 校验失败"
    exit 1
  fi
  echo "[OK] checksum 校验通过"
fi

# 2) 解压到临时文件
TMP_SQL="$(mktemp)"
trap 'rm -f "${TMP_SQL:-}"' EXIT
gunzip -c "$GZ_FILE" > "$TMP_SQL"
echo "[INFO] SQL 大小：$(wc -c < "$TMP_SQL") B"

# 3) 语法验证：导入临时 SQLite
if command -v sqlite3 >/dev/null 2>&1; then
  TMP_DB="$(mktemp)"
  rm -f "$TMP_DB"
  if ! sqlite3 "$TMP_DB" < "$TMP_SQL"; then
    echo "[ERROR] SQL 无法导入临时数据库"
    rm -f "$TMP_DB"
    exit 1
  fi
  echo "[OK] SQL 语法验证通过"
  rm -f "$TMP_DB"
fi

if [ "$CONFIRM" -ne 1 ]; then
  echo "[WARN] 未指定 --yes，跳过真正导入"
  echo "       如需真正导入：bash scripts/restore.sh <file> $MODE --yes"
  exit 0
fi

# 4) 真正导入
echo "[RESTORE] $MODE"
if [ "$MODE" = "--remote" ]; then
  wrangler d1 execute apex-db --remote --file="$TMP_SQL" --yes
else
  wrangler d1 execute apex-db --local --file="$TMP_SQL" --yes
fi

# 5) Post-restore 验证：重新导出并统计表数量
if command -v sqlite3 >/dev/null 2>&1; then
  TMP_SQL2="$(mktemp)"
  TMP_DB2="$(mktemp)"
  rm -f "$TMP_DB2"
  if wrangler d1 export apex-db "$MODE" --output="$TMP_SQL2" >/dev/null 2>&1 && [ -s "$TMP_SQL2" ]; then
    if sqlite3 "$TMP_DB2" < "$TMP_SQL2" 2>/dev/null; then
      TBL=$(sqlite3 "$TMP_DB2" ".tables" 2>/dev/null | tr -s ' \t\n' '\n' | grep -c . || echo 0)
      echo "[VERIFY] 恢复后表数量: $TBL"
      if [ "$TBL" -lt 5 ]; then
        echo "[ERROR] 恢复后表数量异常（$TBL < 5）"
        rm -f "$TMP_SQL2" "$TMP_DB2"
        exit 1
      fi
    else
      echo "[WARN] post-verify 无法导入临时库，跳过检查"
    fi
  else
    echo "[WARN] post-verify 无法导出，跳过检查"
  fi
  rm -f "$TMP_SQL2" "$TMP_DB2"
fi

echo "[OK] 恢复完成"
