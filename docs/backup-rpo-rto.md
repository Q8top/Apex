# Apex 备份策略 RPO / RTO

## 一、术语

- **RPO**（Recovery Point Objective）：允许丢失的最大数据时间窗口
- **RTO**（Recovery Time Objective）：从故障到恢复的最大时间窗口

---

## 二、备份架构（三层防护）

### 第一层：D1 Time Travel（Cloudflare 内置）

- 位置：Cloudflare 平台侧
- 保留：Free 计划 7 天 / Paid 计划 30 天
- 用途：短期误操作回滚（如误删某行）
- 恢复：`wrangler d1 time-travel restore apex-db --timestamp=<unix>`

### 第二层：加密异地备份（GitHub Release + Cloudflare KV）

- 触发：GitHub Actions `Daily Database Backup`（每天 UTC 03:00）
- 流程：
  1. `wrangler d1 export` 导出 SQL
  2. `gzip` 压缩
  3. **`age` 公钥加密** → `.sql.gz.age`
  4. 上传 GitHub Release + Cloudflare KV
  5. CI 验证 KV 中备份是有效的 age 文件
- 保留：30 天
- 格式：`apex-db-YYYYMMDD_HHMMSS.sql.gz.age` + `.sha256`

### 第三层：离线私钥

- 位置：你本地 + 离线备份（U 盘 / 密码管理器 / 打印件）
- 用途：解密第二层备份
- 绝不进：Git / GitHub / Cloudflare / CI

---

## 三、RPO

| 场景 | RPO |
|------|-----|
| 常规应用层故障 | 0 |
| D1 数据库损坏 | <= 24 小时 |
| Cloudflare 区域故障 | <= 24 小时 |
| 人为误删（近期） | <= 5 分钟（Time Travel） |
| 人为误删（超期） | <= 24 小时（加密备份） |

---

## 四、RTO

| 场景 | RTO |
|------|-----|
| 回滚代码（Pages 部署失败） | <= 5 分钟 |
| 回滚 D1 单表（Time Travel） | <= 30 分钟 |
| 全量恢复 D1（加密备份） | <= 2 小时 |
| 迁移到新 Cloudflare 账号 | <= 8 小时 |

---

## 五、密钥管理

### age 密钥对

- **公钥**（`age1...`）：存入 GitHub Secret `AGE_PUBLIC_KEY`
- **私钥**（`AGE-SECRET-KEY-1...`）：离线保存，例如 `~/apex-backup-key.txt`，权限 `chmod 600`

### 私钥丢失 = 所有加密备份永久无法恢复

 3 份离线备份：
1. 本地密码管理器（1Password / Bitwarden / KeePass）
2. 离线 U 盘
3. 打印一份锁抽屉

### 密钥轮换

1. `age-keygen -o ~/apex-backup-key-new.txt`
2. 更新 GitHub Secret `AGE_PUBLIC_KEY` 为新公钥
3. 旧备份仍可用旧私钥解密（保留旧私钥 >= 30 天）
4. 30 天后旧备份过期，可安全销毁旧私钥

---

## 六、恢复 Runbook

### 6.1 单表回滚（Time Travel）

    wrangler d1 time-travel info apex-db
    wrangler d1 time-travel restore apex-db --timestamp=1727000000

### 6.2 全量恢复（本地解密演练）

for f in *.bak *.bak.*; do   if [ -f "$f" ]; then     rm -f "$f";     echo "  ✓ 删除: $f";   fi; done  age 私钥。

    cd /root/projects/Apex
    export AGE_SECRET_KEY_FILE=~/apex-backup-key.txt
    export CLOUDFLARE_KV_NAMESPACE_ID=<你的 KV ID>
    bash scripts/restore-from-remote.sh --from-kv --latest --dry-run

dry-run 会：下载 KV -> age 解密 -> gunzip -> 导入临时 SQLite -> integrity_check -> 表数量检查。不碰生产。

dry-run 通过后正式恢复（会清空生产 D1）：

    bash scripts/restore-from-remote.sh --from-kv --latest --yes

### 6.3 从 GitHub Release 恢复（KV 不可用时）

    bash scripts/restore-from-remote.sh --from-release --yes

### 6.4 从本地文件恢复

    bash scripts/restore-from-remote.sh --file backups/apex-db-XXX.sql.gz.age --yes

---

## 七、验证与演练

### 每月

    export AGE_SECRET_KEY_FILE=~/apex-backup-key.txt
    export CLOUDFLARE_KV_NAMESPACE_ID=<你的 KV ID>
    bash scripts/restore-from-remote.sh --from-kv --latest --dry-run

### 每季度

      D1 完整恢复演练。

### 每年

for f in *.bak *.bak.*; do   if [ -f "$f" ]; then     rm -f "$f";     echo "  ✓ 删除: $f";   done; fi

---

## 八、CI 与本地分工

| 步骤 | CI | 本地 |
|------|-----|------|
| 导出备份 | 是 | 可手动 |
| gzip 压缩 | 是 | 可手动 |
| age 加密 | 是（公钥） | 是（公钥） |
| 上传 KV / Release | 是 | KV 可手动 |
| 上传完整性验证 | 是（不解密） | — |
| 完整解密 + SQLite 校验 | 否（无私钥） | 是（有私钥） |

---

## 九、禁止事项

- 私钥 commit 到 git
- 私钥上传任何远程存储
- 明文数据库备份上传任何地方
- 备份文件（即使加密）发到聊天 / 邮箱 / 网盘

---

for f in *.bak *.bak.*; do   if [ -f "$f" ]; then     rm -f "$f";     echo "  ✓ 删除: $f";   fi; done2026-09-30
