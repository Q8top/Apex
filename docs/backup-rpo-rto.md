# Apex 备份策略 RPO RTO 文档

## 一、术语
- RPO：允许丢失的最大数据时间窗口
- RTO：从故障到恢复的最大时间窗口

## 二、当前 Apex 备份架构

### 主备份 Primary
- 位置：GitHub backups 分支
- 频率：每天 UTC 03:00
- 保留：30 天
- 格式：.sql.gz 加 .sha256
- 验证：Workflow 内自动导入临时 SQLite 验证

### 独立备份 Independent 待实施
- 位置：Cloudflare R2 / S3 兼容存储
- 状态：待实施
- 频率：与主备份同步
- 保留：90 天

## 三、RPO

| 场景 | RPO |
|------|-----|
| 常规故障 应用层 | 0 |
| D1 数据库损坏 | 小于等于 24 小时 |
| Cloudflare 区域故障 | 小于等于 24 小时 |
| 人为误删数据 | 小于等于 24 小时 |

## 四、RTO

| 场景 | RTO |
|------|-----|
| 回滚代码 Pages 部署失败 | 小于等于 5 分钟 |
| 回滚 D1 单表数据 | 小于等于 30 分钟 |
| 全量恢复 D1 | 小于等于 2 小时 |
| 迁移到新 Cloudflare 账号 | 小于等于 8 小时 |

## 五、恢复 Runbook

### 5.1 单表数据回滚

    gunzip -c backups/apex-db-YYYYMMDD_HHMMSS.sql.gz > /tmp/restore.sql
    wrangler d1 execute apex-db --remote --file=/tmp/single-table-restore.sql --yes

### 5.2 全量恢复 D1

    bash scripts/restore.sh backups/apex-db-YYYYMMDD_HHMMSS.sql.gz --remote --yes

### 5.3 验证恢复

    bash scripts/verify-backup.sh

## 六、演练记录
- 本地演练：Round 97/98 已验证导出、导入、完整性、数据一致性。
- 生产演练：待执行。
