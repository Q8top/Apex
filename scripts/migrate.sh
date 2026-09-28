#!/usr/bin/env bash
# Apex 迁移系统（P9 修复版）
# 关键改动：
#   1. 已应用迁移按 name 匹配（避免 version 4/5 位不一致导致重跑）
#   2. grep 正则兼容本地 sqlite3 直接文本与远程 wrangler JSON
#   3. INSERT OR IGNORE 防止重复写入
# 用法：bash scripts/migrate.sh [--local|--remote] [--dry-run]
set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$PROJECT_ROOT/scripts/_migrate_helpers.sh"

MODE="--local"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --remote) MODE="--remote" ;;
    --local)  MODE="--local" ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "[WARN] 未知参数: $arg" ;;
  esac
done

echo "[MIGRATE] mode=$MODE dry_run=$DRY_RUN"

# 1) 确保 _migrations 表存在
run_sql_raw "$MODE" "CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);" >/dev/null 2>&1 || true
echo "[OK] _migrations 表已确认"

# 2) 载入已执行迁移（按 name 匹配）
declare -A APPLIED
declare -A APPLIED_CHECKSUMS
while IFS='|' read -r nm ck; do
  nm="$(echo "$nm" | tr -d '[:space:]')"
  ck="$(echo "$ck" | tr -d '[:space:]')"
  if [ -n "$nm" ]; then
    APPLIED["$nm"]=1
    APPLIED_CHECKSUMS["$nm"]="$ck"
  fi
# 提取 "0001_initial.sql|abcdef0123..." 形式
# 兼容：
#   - 本地 sqlite3 直接输出: "0001_initial.sql|abcdef..."
#   - wrangler JSON 输出:    [{"vc":"0001_initial.sql|abcdef..."}]
#   - 生产库 5 位 version:   name 字段若为 "30001_0001_initial.sql" 也能提取尾部
done < <(run_sql_raw "$MODE" "SELECT name || '|' || checksum FROM _migrations;" 2>/dev/null \
  | grep -oE '[0-9]{4}_[a-zA-Z0-9_]+\.sql\|[a-f0-9]+' \
  || true)

APPLIED_COUNT=0
for _k in "${!APPLIED[@]}"; do APPLIED_COUNT=$((APPLIED_COUNT+1)); done
echo "[INFO] 已执行迁移数: $APPLIED_COUNT"

# 3) 遍历迁移
TOTAL=0
NEW_APPLIED=0
SKIPPED=0
MISMATCH=0

apply_one() {
  local mode="$1"
  local f="$2"
  if [ "$mode" = "--remote" ]; then
    run_sql_file "$mode" "$f"
    return $?
  fi
  local db
  db=$(detect_local_sqlite)
  if [ -z "$db" ]; then
    echo "[ERROR] 本地 sqlite 未找到" >&2
    return 1
  fi
  if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] node 未安装" >&2
    return 1
  fi
  node "$PROJECT_ROOT/scripts/_sql_apply.cjs" "$f" "$db"
  return $?
}

for f in $(list_migrations); do
  TOTAL=$((TOTAL+1))
  v="$(migration_version "$f")"
  name="$(basename "$f")"
  ck="$(calc_checksum "$f")"

  if [ -n "${APPLIED[$name]:-}" ]; then
    prev="${APPLIED_CHECKSUMS[$name]:-}"
    if [ "$prev" != "$ck" ]; then
      echo "[MISMATCH] $name checksum 与已执行不一致 (db=$prev file=$ck)"
      MISMATCH=$((MISMATCH+1))
    else
      echo "[SKIP] $name 已执行"
      SKIPPED=$((SKIPPED+1))
    fi
    continue
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[DRY-RUN] 将执行 $name (checksum=$ck)"
    continue
  fi

  echo "[APPLY] $name"
  if ! apply_one "$MODE" "$f"; then
    echo "[ERROR] $name 执行失败"
    exit 1
  fi

  esc_name="${name//\'/\'\'}"
  if ! run_sql_write "$MODE" "INSERT OR IGNORE INTO _migrations (version, name, checksum) VALUES ('$v', '$esc_name', '$ck');" >/dev/null 2>&1; then
    echo "[WARN] $name 已执行但未写入 _migrations 记录"
  fi

  NEW_APPLIED=$((NEW_APPLIED+1))
  echo "[OK] $name applied"
done

echo ""
echo "[SUMMARY] total=$TOTAL skipped=$SKIPPED applied=$NEW_APPLIED mismatch=$MISMATCH"

if [ "$MISMATCH" -gt 0 ]; then
  echo "[WARN] $MISMATCH 个 checksum 不匹配（因手工修复表结构）"
fi
exit 0
