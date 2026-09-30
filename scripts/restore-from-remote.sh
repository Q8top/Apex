#!/usr/bin/env bash
# Apex 多通道恢复脚本
#
# 恢复优先级：
#   1) --file <path>      本地指定文件
#   2) --from-release     从 GitHub Release 下载
#   3) --from-kv          从 Cloudflare KV 下载
#   4) 自动模式           依次尝试：Release → KV → 本地 backups/
#
# 用法：
#   bash scripts/restore-from-remote.sh --latest             # 自动，取最新
#   bash scripts/restore-from-remote.sh --from-kv            # 强制 KV
#   bash scripts/restore-from-remote.sh --from-release       # 强制 Release
#   bash scripts/restore-from-remote.sh --stamp 20260927-030000
#   bash scripts/restore-from-remote.sh --file backups/xxx.sql.gz
#   bash scripts/restore-from-remote.sh --latest --yes       # 跳过确认
#   bash scripts/restore-from-remote.sh --latest --dry-run   # 只验证不导入

set -euo pipefail

# ============================================================
# 配置
# ============================================================
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$PROJECT_ROOT/.restore-work"
# KV_NAMESPACE_ID：优先从环境变量读取，缺失时 fallback 到内置默认值
KV_NAMESPACE_ID="${CLOUDFLARE_KV_NAMESPACE_ID:-}"
if [ -z "$KV_NAMESPACE_ID" ]; then
  echo "[FATAL] 未设置 CLOUDFLARE_KV_NAMESPACE_ID"
  echo "  本地：export CLOUDFLARE_KV_NAMESPACE_ID=<your_namespace_id>"
  echo "  CI：通过 GitHub Actions Secret 注入"
  exit 1
fi
KV_LATEST_KEY="backup:latest"
KV_INDEX_KEY="backup:index"
D1_BINDING="apex-db"

# ============================================================
# 参数
# ============================================================
MODE="auto"        # auto | release | kv | file
STAMP=""
LOCAL_FILE=""
CONFIRM=0
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --latest)       MODE="auto"; shift ;;
    --from-release) MODE="release"; shift ;;
    --from-kv)      MODE="kv"; shift ;;
    --file)         MODE="file"; LOCAL_FILE="$2"; shift 2 ;;
    --stamp)        STAMP="$2"; shift 2 ;;
    --yes)          CONFIRM=1; shift ;;
    --dry-run)      DRY_RUN=1; shift ;;
    -h|--help)
      echo "用法: bash $0 [--latest|--from-release|--from-kv|--file <path>] [--stamp <stamp>] [--yes] [--dry-run]"
      exit 0
      ;;
    *) echo "[ERROR] 未知参数：$1"; exit 1 ;;
  esac
done

# ============================================================
# 环境检测
# ============================================================
HAS_GH=0
command -v gh >/dev/null 2>&1 && HAS_GH=1

HAS_WRANGLER=0
command -v wrangler >/dev/null 2>&1 && HAS_WRANGLER=1

if [ "$HAS_WRANGLER" = "0" ]; then
  echo "[FATAL] 缺少 wrangler"
  exit 1
fi

mkdir -p "$WORK_DIR"

# ============================================================
# 工具函数
# ============================================================
log()  { echo "[$(date -u +%H:%M:%S)] $*"; }
ok()   { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FATAL] $*"; exit 1; }

# 返回 0 表示找到并已落地到 $1
try_fetch_from_release() {
  local dest="$1"
  if [ "$HAS_GH" = "0" ]; then
    warn "本地无 gh CLI，跳过 Release 通道"
    return 1
  fi
  log "尝试 GitHub Release..."

  local tag
  if [ -n "$STAMP" ]; then
    tag="backup-${STAMP}"
  else
    tag=$(gh release list --limit 1 --json tagName --jq '.[0].tagName' 2>/dev/null || echo "")
    [ -z "$tag" ] && { warn "Release 列表为空"; return 1; }
  fi

  log "  下载 Release: $tag"
  gh release download "$tag" \
    --pattern "*.sql.gz" \
    --dir "$WORK_DIR" 2>/dev/null || { warn "Release 下载失败"; return 1; }

  local got
  got=$(ls -1t "$WORK_DIR"/apex-db-*.sql.gz 2>/dev/null | head -1)
  [ -z "$got" ] && { warn "Release 无匹配文件"; return 1; }

  cp "$got" "$dest"
  ok "Release 下载完成：$dest"
  return 0
}

try_fetch_from_kv() {
  local dest="$1"
  log "尝试 Cloudflare KV..."

  local key
  if [ -n "$STAMP" ]; then
    key="backup:${STAMP}"
  else
    key="$KV_LATEST_KEY"
  fi

  log "  下载 KV key: $key"
  if wrangler kv key get \
       --namespace-id="$KV_NAMESPACE_ID" \
       "$key" \
       --remote > "$dest" 2>/dev/null; then
    if [ -s "$dest" ]; then
      ok "KV 下载完成：$dest"
      return 0
    else
      warn "KV 返回空内容"
      rm -f "$dest"
      return 1
    fi
  else
    warn "KV 下载失败"
    rm -f "$dest" 2>/dev/null || true
    return 1
  fi
}

try_fetch_from_local() {
  local dest="$1"
  log "尝试本地 backups/..."
  local latest
  latest=$(ls -1t "$PROJECT_ROOT"/backups/apex-db-*.sql.gz 2>/dev/null | head -1)
  if [ -z "$latest" ]; then
    warn "backups/ 无文件"
    return 1
  fi
  cp "$latest" "$dest"
  ok "本地下载完成：$dest"
  return 0
}

# ============================================================
# 1) 定位备份文件
# ============================================================
TARGET="$WORK_DIR/restore-target.sql.gz"
rm -f "$TARGET"

FOUND=0

case "$MODE" in
  file)
    [ -f "$LOCAL_FILE" ] || fail "指定文件不存在：$LOCAL_FILE"
    cp "$LOCAL_FILE" "$TARGET"
    FOUND=1
    ok "使用指定文件：$LOCAL_FILE"
    ;;
  release)
    try_fetch_from_release "$TARGET" && FOUND=1
    ;;
  kv)
    try_fetch_from_kv "$TARGET" && FOUND=1
    ;;
  auto)
    try_fetch_from_release "$TARGET" && FOUND=1
    if [ "$FOUND" = "0" ]; then
      try_fetch_from_kv "$TARGET" && FOUND=1
    fi
    if [ "$FOUND" = "0" ]; then
      try_fetch_from_local "$TARGET" && FOUND=1
    fi
    ;;
esac

[ "$FOUND" = "1" ] || fail "所有通道均无法获取备份"
[ -f "$TARGET" ] || fail "备份文件落地失败"

SIZE=$(stat -c%s "$TARGET")
log "备份文件大小：${SIZE}B"

# ============================================================
# 2) SHA256 校验（如果同目录有 .sha256）
# ============================================================
# 尝试从 KV 拉取 sha256（如果使用了 KV 通道）
if [ -n "$STAMP" ]; then
  SHA_FROM_KV=$(wrangler kv key get \
    --namespace-id="$KV_NAMESPACE_ID" \
    "backup:${STAMP}:sha256" \
    --remote 2>/dev/null || echo "")
  if [ -n "$SHA_FROM_KV" ]; then
    ACTUAL=$(sha256sum "$TARGET" | awk '{print $1}')
    if [ "$SHA_FROM_KV" = "$ACTUAL" ]; then
      ok "SHA256 与 KV 记录一致"
    else
      warn "SHA256 与 KV 记录不一致（可能被篡改）"
      warn "  KV:     $SHA_FROM_KV"
      warn "  实际:   $ACTUAL"
      fail "备份完整性校验失败"
    fi
  fi
fi

# ============================================================
# 3) 解压 + 导入临时 SQLite 验证
# ============================================================
log "解压..."
TMP_SQL="$WORK_DIR/restore.sql"
gunzip -c "$TARGET" > "$TMP_SQL"
ok "SQL 大小：$(stat -c%s "$TMP_SQL")B"

log "导入到临时 SQLite 验证..."
TMP_DB="$WORK_DIR/verify.sqlite"
rm -f "$TMP_DB"
if ! sqlite3 "$TMP_DB" < "$TMP_SQL" 2>/dev/null; then
  fail "SQL 无法导入临时 SQLite"
fi

INTEG=$(sqlite3 "$TMP_DB" "PRAGMA integrity_check;" 2>/dev/null || echo "fail")
[ "$INTEG" = "ok" ] && ok "SQLite integrity_check = ok" || fail "SQLite 完整性检查失败：$INTEG"

TBL_COUNT=$(sqlite3 "$TMP_DB" ".tables" 2>/dev/null | tr -s ' ' '\n' | grep -c . || echo 0)
ok "识别到 $TBL_COUNT 张表"
[ "$TBL_COUNT" -lt 5 ] && fail "表数量异常（<5），备份可能不完整"

# ============================================================
# 4) 交互式确认
# ============================================================
echo ""
echo "=========================================="
echo "  准备恢复到：$D1_BINDING --remote"
echo "  备份来源：$MODE"
echo "  表数量：$TBL_COUNT"
echo "  完整性：ok"
echo "=========================================="

if [ "$DRY_RUN" = "1" ]; then
  ok "dry-run 模式，跳过真正导入"
  rm -f "$TMP_DB"
  ok "验证通过，未修改生产数据"
  exit 0
fi

if [ "$CONFIRM" != "1" ]; then
  echo ""
  echo "⚠️  此操作将覆盖生产 D1 数据库！"
  echo "⚠️  请确认已备份当前生产数据！"
  echo ""
  read -rp "输入 YES 继续：" answer
  [ "$answer" = "YES" ] || fail "用户取消"
fi

# ============================================================
# 5) 真正导入
# ============================================================
log "导入到 D1 --remote..."
# === APEX-AUTO DROP-BEFORE-IMPORT ===
if [ -z "${DRY_RUN:-}" ] && [ -n "${TMP_SQL:-}" ] && [ -f "$TMP_SQL" ]; then
  _APEX_DROP_SQL="/tmp/apex-drop-$$.sql"
  {
    echo "PRAGMA foreign_keys=OFF;"
    grep -oiE 'CREATE TABLE (IF NOT EXISTS )?["`\[]?[a-zA-Z_][a-zA-Z0-9_]*' "$TMP_SQL" 2>/dev/null \
      | awk '{print $NF}' | tr -d '"`[]' | sort -u \
      | while IFS= read -r _t; do
          [ -n "$_t" ] && echo "DROP TABLE IF EXISTS \"$_t\";"
        done
    echo "PRAGMA foreign_keys=ON;"
  } > "$_APEX_DROP_SQL"
  echo "[INFO] APEX-AUTO: 清空目标表..."
  if ! wrangler d1 execute "$D1_BINDING" --remote --file="$_APEX_DROP_SQL" --yes; then
    rm -f "$_APEX_DROP_SQL"
    fail "APEX-AUTO: DROP 失败"
  fi
  rm -f "$_APEX_DROP_SQL"
fi
# === APEX-AUTO END ===
if ! wrangler d1 execute "$D1_BINDING" --remote --file="$TMP_SQL" --yes; then
  fail "导入失败"
fi

# ============================================================
# 6) 导入后验证
# ============================================================
log "导入后验证..."
wrangler d1 execute "$D1_BINDING" --remote \
  --command="SELECT COUNT(*) AS users FROM users;" 2>&1 | tail -10

ok "恢复完成"
ok "  来源：$MODE"
ok "  大小：${SIZE}B"
ok "  表数量：$TBL_COUNT"

rm -f "$TMP_DB"
echo ""
echo "[SUMMARY]"
echo "  source      : $MODE"
echo "  backup_size : ${SIZE}B"
echo "  tables      : $TBL_COUNT"
echo "  integrity   : ok"

exit 0
