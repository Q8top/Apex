# Settlement Transaction Design

**Version**: 1.0
**Status**: Draft (待 A-3b 集成测试验证后定稿)
**Created**: 2026-10-09
**Related**: v9 施工单 §A-3 / §A-4 / §A-5 / §A-6 / §A-7

---

## 0. 目的与范围

定义 Apex 游戏结算的事务正确性设计，目标：

- 同一 spin_id 最多一次资金变更（幂等）
- 扣款、派彩、FS 消费、FS 创建、ledger、spin 记录原子提交
- FS 会话状态机在并发下正确
- max-win 上限不被突破
- 账本（wallet_ledger）与用户余额始终对账

范围：functions/api/game/spin.js 及其依赖（_engine/、_config/）的结算路径。
不在范围：前端展示、UI 状态机、i18n、音频（C 阶段）。

---

## 1. 现状与已知风险

### 1.1 现状

- functions/api/game/spin.js 有基础结算逻辑
- 使用 env.apex_db.batch([...]) 提交多语句
- 已有 spins 表（幂等 + 审计）、free_spin_sessions 表（FS 状态）
- 缺：_settlement_guard / wallet_ledger / reward_chains 表
- 缺：free_spin_sessions.version 列
- 缺：spins.request_fingerprint 列

### 1.2 已知 P0 风险

| 编号 | 风险 | 现状 | 目标 |
|---|---|---|---|
| R1 | 扣款与派彩合并为 balance - bet + win | 合并 | 分离 |
| R2 | 无法在 batch 内验证上一条 UPDATE 影响 1 行 | 无守卫 | _settlement_guard |
| R3 | 余额不足可能被后续派彩掩盖 | 应用层检查 | DB trigger + 守卫 |
| R4 | 并发触发 FS 可能创建 2 个 active session | 无约束 | 乐观并发 + 唯一约束 |
| R5 | max-win 无封顶机制 | 无 | reward_chains + BigInt |
| R6 | 余额变更无账本 | 无 | wallet_ledger 全记录 |
| R7 | Session 配额无并发保护 | 应用层计数 | BEFORE INSERT trigger |

---

## 2. 核心原则

### 2.1 禁止假设

以下假设必须由真实 Worker + D1 集成测试证明，不得作为既定事实：

1. changes() 在 D1 batch 内一定读取预期前一条语句
2. UPSERT DO UPDATE 一定按预期执行 CHECK 约束
3. CLI 多语句脚本等价于 Worker batch()
4. 零行 UPDATE 自动使 batch 失败
5. RETURNING 子句可跨语句传值

### 2.2 SQL 成功 ≠ 业务成功

db.batch() 返回无异常，不等于业务操作符合预期。

- UPDATE 影响 0 行，D1 视为成功
- INSERT OR IGNORE 冲突时静默跳过
- UPSERT 可能因 CHECK 失败被回滚但 batch 仍返回

必须显式验证每条关键语句的影响行数。

### 2.3 扣款与派彩分离

禁止 wallet_balance = wallet_balance - bet + win。

原因：余额 0、下注 100、中奖 200 → 表达式结果 100，CHECK 看不到下注前不足。

强制规则：扣款和派彩是两条独立 UPDATE，扣款在前且带条件（WHERE wallet_balance >= bet）。

## 3. A-3.4 事务守卫方案

### 3.1 守卫表定义

migration: migrations/0030_settlement_guard.sql

```sql
CREATE TABLE IF NOT EXISTS _settlement_guard (
  slot INTEGER PRIMARY KEY CHECK (slot = 1),
  guard_value INTEGER NOT NULL CHECK (guard_value = 1)
);

INSERT OR IGNORE INTO _settlement_guard (slot, guard_value) VALUES (1, 1);
```

设计说明：

- 表只有一行（slot = 1）
- guard_value CHECK (guard_value = 1)：若写入 0，CHECK 失败，RAISE(ABORT) 触发，整个 batch 回滚
- ON CONFLICT 分支同样受 CHECK 约束（UPDATE 路径）
- INSERT 路径和 UPDATE 路径都必须验证

### 3.2 守卫语句模板

每次需要"验证上一条 UPDATE 影响了恰好 1 行"时，紧跟：

```sql
INSERT INTO _settlement_guard (slot, guard_value)
VALUES (1, CASE WHEN changes() = 1 THEN 1 ELSE 0 END)
ON CONFLICT(slot) DO UPDATE
SET guard_value = CASE WHEN changes() = 1 THEN 1 ELSE 0 END;
```

关键：

- changes() 返回上一条语句影响的行数
- 若为 0，写入 guard_value = 0，CHECK 失败，ABORT，整个 batch 回滚
- 若为 1，guard_value = 1（满足 CHECK），batch 继续
- ON CONFLICT DO UPDATE 覆盖 INSERT 和 UPDATE 两条路径

### 3.3 完整结算 batch 结构

普通局（基础 spin）：

```js
const stmts = [];

// 1) 扣款（条件更新）
stmts.push(env.apex_db.prepare(
  `UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = CURRENT_TIMESTAMP
   WHERE id = ? AND wallet_balance >= ?`
).bind(betMinor, userId, betMinor));

// 2) 守卫：扣款必须影响 1 行
stmts.push(env.apex_db.prepare(
  `INSERT INTO _settlement_guard (slot, guard_value)
   VALUES (1, CASE WHEN changes() = 1 THEN 1 ELSE 0 END)
   ON CONFLICT(slot) DO UPDATE
   SET guard_value = CASE WHEN changes() = 1 THEN 1 ELSE 0 END`
));

// 3) 派彩（若 winMinor > 0）
if (winMinor > 0) {
  stmts.push(env.apex_db.prepare(
    `UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(winMinor, userId));

  // 4) 守卫：派彩必须影响 1 行
  stmts.push(env.apex_db.prepare(
    `INSERT INTO _settlement_guard (slot, guard_value)
     VALUES (1, CASE WHEN changes() = 1 THEN 1 ELSE 0 END)
     ON CONFLICT(slot) DO UPDATE
     SET guard_value = CASE WHEN changes() = 1 THEN 1 ELSE 0 END`
  ));
}

// 5) ledger：bet 事件
stmts.push(env.apex_db.prepare(
  `INSERT INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version)
   VALUES (?, ?, ?, ?, 'bet', ?)`
).bind(eventIdBet, userId, spinId, -betMinor, mathVersion));

// 5b) ledger：win 事件（若 winMinor > 0）
if (winMinor > 0) {
  stmts.push(env.apex_db.prepare(
    `INSERT INTO wallet_ledger (event_id, user_id, spin_id, delta, change_type, math_version)
     VALUES (?, ?, ?, ?, 'win', ?)`
  ).bind(eventIdWin, userId, spinId, winMinor, mathVersion));
}

// 6) FS 会话消费（若 isFreeAuthoritative）
// 见 §A-5 FS 乐观并发

// 7) FS 触发（若普通局触发 bonus）
// 见 §A-6 reward_chains

// 8) spin 记录
stmts.push(env.apex_db.prepare(
  `INSERT INTO spins (spin_id, user_id, request_fingerprint, mode, math_version,
                      effective_bet_minor, fs_session_id, chain_id, result_json,
                      win_minor, balance_delta, balance_before)
   VALUES (?, ?, ?, 'real', ?, ?, ?, ?, ?, ?, ?, ?)`
).bind(spinId, userId, fingerprint, mathVersion, betMinor,
       fsSession?.id || null, chainId || null, JSON.stringify(spinResult),
       winMinor, balanceDelta, balanceBefore));

// 9) 提交 + 错误分类
try {
  await env.apex_db.batch(stmts);
} catch (e) {
  const msg = String(e.message || '');
  if (msg.includes('CHECK constraint failed') || msg.includes('insufficient_balance')) {
    return { status: 400, body: { success: false, code: 'insufficient_balance' } };
  }
  if (msg.includes('UNIQUE constraint failed: spins.spin_id')) {
    return await handleIdempotentConflict(env, user, spinId, fingerprint, betMinor);
  }
  if (msg.includes('UNIQUE constraint failed: idx_chain_base_spin')) {
    return { status: 409, body: { success: false, code: 'chain_conflict' } };
  }
  throw e;
}
```

### 3.4 真实 D1 集成测试矩阵（A-3.4 门禁）

必须由真实 Worker + 真实 D1 执行。若任一失败，整个方案作废，改用：

- AFTER UPDATE trigger 维护独立计数，违反时 ABORT
- 或阻断正式模式

| # | 场景 | 期望 |
|---|---|---|
| 1 | 扣款影响 1 行，哨兵通过 | 成功 |
| 2 | 扣款影响 0 行（余额 99 下注 100） | ABORT，整批回滚 |
| 3 | 余额 0、下注 100、中奖 200 | ABORT，余额保持 0，spins 无记录 |
| 4 | 扣款成功，派彩 0 行 | ABORT，整批回滚 |
| 5 | 扣款成功，ledger 插入失败（UNIQUE 冲突） | 整批回滚 |
| 6 | 扣款成功，spin 插入失败 | 整批回滚 |
| 7 | FS 消费 0 行 | ABORT，整批回滚 |
| 8 | 哨兵表清空后重新 INSERT 路径 | 失败时同样 ABORT |
| 9 | 哨兵表已有行，ON CONFLICT UPDATE 路径 | 失败时同样 ABORT |
| 10 | 同一 batch 多次守卫 | 每次都验证正确的前置操作 |

测试 1、4、8、9 必须覆盖 INSERT 和 UPDATE 两条路径：

- 先 DELETE 守卫行，执行一次
- 恢复后（INSERT OR IGNORE），再执行一次

---

## 4. A-3.5 四层接口契约

职责严格分离：

```js
// 层次 1：构造单次余额变更语句（不提交、不宣称成功）
function buildBalanceChangeStatements(env, opts) {
  // opts: { userId, delta, changeType, refType, refId, mathVersion, guardAfter }
  // 返回：[updateStmt, guardStmt?, ledgerStmt]
  // 不执行，只构造
}

// 层次 2：构造完整结算计划
function buildSettlementPlan(env, spinContext) {
  // 调用 buildBalanceChangeStatements 构造扣款、派彩
  // 加上 FS 更新、spin 记录、守卫
  // 返回：{ stmts: [...], metadata: {...} }
}

// 层次 3：唯一提交入口
async function executeSettlementTransaction(env, plan) {
  try {
    await env.apex_db.batch(plan.stmts);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: classifyError(e) };
  }
}

// 层次 4：错误分类（只从数据库错误文本分类，不猜测）
function classifyError(e) {
  const msg = String(e.message || '');
  if (msg.includes('insufficient_balance')) return 'insufficient_balance';
  if (msg.includes('spins.spin_id')) return 'idempotent_conflict';
  if (msg.includes('idx_chain_base_spin')) return 'chain_conflict';
  if (msg.includes('CHECK constraint failed')) return 'guard_failed';
  return 'unknown';
}
```

关键：

- 层次 1 和 2 不提交
- 层次 3 是唯一提交点
- 层次 4 只从数据库错误分类

## 5. A-3.6 结算顺序（目标流程）

普通局：

```
1. 校验请求 + 幂等查询
2. 服务端生成 spinResult（引擎）
3. 扣款（条件 UPDATE）
4. 守卫（扣款必须 1 行）
5. 派彩（若 winMinor > 0）
6. 守卫（派彩必须 1 行）
7. ledger: bet 事件
8. ledger: win 事件（若 winMinor > 0）
9. 若触发 bonus：
   a. reward_chains 创建
   b. free_spin_sessions 创建
10. spin 记录
11. batch 提交
```

FS 局：

```
1. 校验请求 + 幂等查询
2. 解析 FS 会话（含 version）
3. 服务端生成 spinResult（引擎）
4. FS 消费（乐观并发 UPDATE）
5. 守卫（FS 消费必须 1 行）
6. 派彩（若 winMinor > 0）
7. 守卫（派彩必须 1 行）
8. ledger: win 事件（若 winMinor > 0）
9. 若重触发：增加局数（无守卫，0 行是合法业务结果）
10. spin 记录
11. batch 提交
```

本流程是目标，A-3.4 门禁通过前不作为实现模板。

---

## 6. A-4 幂等协议

### 6.1 请求指纹

```js
async function computeRequestFingerprint(input) {
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) {
      throw new Error(`fingerprint: ${k} 不可为空`);
    }
  }
  if (!Number.isSafeInteger(input.betMinor) || input.betMinor < 1) {
    throw new Error('fingerprint: betMinor 必须是正安全整数');
  }
  const canonical = JSON.stringify([
    'v1',
    String(input.userId),
    String(input.spinId),
    'sweet',
    input.betMinor.toString(10),
  ]);
  return await sha256Hex(canonical);
}
```

### 6.2 规范化规则

| A | B | 等价 |
|---|---|---|
| 100 | "100" | ✅（先校验再 toString）|
| 100 | 100.0 | ✅ |
| 100 | 100.5 | ❌（浮点拒绝）|
| 缺失 | null | ❌（均拒绝）|
| 有未知字段 | 无 | ✅（不进入指纹）|

### 6.3 原子持久化不变量

1. 结算上下文、spin 记录、资金变更、ledger 事件同一原子提交
2. 失败事务不得留下可被误判为"已成功"的记录
3. 已完成 spin 必须在重新读取 FS 状态前返回原结果

实现：request_fingerprint 与 spins 行同批写入。

### 6.4 三分类处理

| 场景 | 响应 |
|---|---|
| 查不到 | 尝试首次结算 |
| 同用户同指纹 | 返回原结果（cached: true）|
| 同用户不同指纹 | 409 idempotency_conflict |
| 不同用户 | 409 spin_id_taken |
| UNIQUE 冲突后仍找不到 | 返回可重试错误 |

### 6.5 Legacy 兼容

- 能比较下注、模式时逐项比较
- 无法还原语义：返回 legacy 冲突，要求新 spin_id
- 不伪造指纹

---

## 7. A-5 FS 状态机

### 7.1 状态

```
active
 ├─ 最后一局消费完成且无有效重触发 → completed
 ├─ 到期 → expired
 └─ 管理员取消 → cancelled
```

### 7.2 默认冻结

允许最后一局 FS 触发 Scatter 并重触发。maxRetriggers 限制累计次数。

若不接受，编码前必须评审改定。

### 7.3 乐观并发

free_spin_sessions 增加 version 列，所有状态变更路径（消费、重触发、取消、过期、完成）都递增 version。

更新语句见 §3.3 第 6 步。

retriggerAdd / retriggerIncrement 严格约束：

- retriggerAdd ∈ {0, fsRetriggerSpins}
- retriggerIncrement ∈ {0, 1}
- 由同一判定生成
- 不许突破上限或溢出安全整数

### 7.4 冲突识别

通过守卫表统一检测。FS 消费 UPDATE 后紧跟守卫语句。若 changes() = 0，ABORT。

应用层从错误分类：

| 业务结果 | 检测方式 | 响应 |
|---|---|---|
| 版本冲突 | FS 更新 0 行 + 会话存在 + version 不匹配 | 409 fs_concurrent_update |
| 会话已过期 | 会话存在 + expires_at <= now | 409 fs_session_expired |
| 会话已完成 | 会话存在 + status != active | 409 fs_session_not_active |
| 局数耗尽 | 会话存在 + remaining_spins = 0 | 409 fs_exhausted |
| 会话不存在 | 查不到 | 409 fs_session_not_found |
| 数据库执行失败 | 非 ABORT 类错误 | 500 internal_error |

判定方法：ABORT 后查询一次会话状态确定原因。不能只凭"0 行"断言。

```js
async function classifyFsFailure(env, fsSessionId, expectedVersion) {
  const s = await env.apex_db.prepare(
    `SELECT status, remaining_spins, expires_at, version
     FROM free_spin_sessions WHERE id = ?`
  ).bind(fsSessionId).first();

  if (!s) return { code: 'fs_session_not_found', status: 409 };
  if (s.status !== 'active') return { code: 'fs_session_not_active', status: 409 };
  if (new Date(s.expires_at) <= new Date()) return { code: 'fs_session_expired', status: 409 };
  if (s.remaining_spins <= 0) return { code: 'fs_exhausted', status: 409 };
  if (s.version !== expectedVersion) return { code: 'fs_concurrent_update', status: 409 };
  return { code: 'fs_unknown_failure', status: 409 };
}
```

---

## 8. A-6 金额与 max-win

### 8.1 上限

```
MIN_BET_MINOR = 1
MAX_BET_MINOR = 10000
MAX_WIN_MULTIPLIER = 5000 (real) / 25000 (demo)
MAX_WIN_SCOPE = "per_base_spin"
```

### 8.2 reward_chains 表

```sql
CREATE TABLE IF NOT EXISTS reward_chains (
  chain_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  base_spin_id TEXT NOT NULL UNIQUE,
  effective_bet_minor INTEGER NOT NULL,
  max_win_multiplier INTEGER NOT NULL,
  chain_win_minor INTEGER NOT NULL DEFAULT 0,
  cap_reached INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  math_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (base_spin_id) REFERENCES spins(spin_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_chain_user ON reward_chains(user_id, status);
```

### 8.3 联合一致性约束

应用层每次创建 FS 会话时必须验证：

1. reward_chains.base_spin_id 存在且属于当前用户
2. reward_chains.user_id == free_spin_sessions.user_id
3. reward_chains.effective_bet_minor == free_spin_sessions.bet_minor
4. reward_chains.max_win_multiplier == mathProfile[mathVersion].maxWinMultiplier
5. 创建 FS 会话的 spin 的 spin_id == reward_chains.base_spin_id
6. reward_chains.chain_win_minor == 该 base_spin 已提交的 win_minor

每日对账检查：

```sql
SELECT rc.chain_id, rc.user_id, s.user_id AS base_spin_user,
       rc.effective_bet_minor, s.bet_minor AS base_spin_bet,
       rc.math_version, s.math_version AS base_spin_math
FROM reward_chains rc
JOIN spins s ON s.spin_id = rc.base_spin_id
WHERE rc.user_id != s.user_id
   OR rc.effective_bet_minor != s.bet_minor
   OR rc.math_version != s.math_version;
```

期望：无行返回。

### 8.4 BigInt 定点金额

```js
const PRECISION_SCALE = 1000000n;  // 10^6

function mulFixed(a, b) {
  return (a * b) / PRECISION_SCALE;
}

function toMinor(fixedValue) {
  const minor = fixedValue / (PRECISION_SCALE / 100n);
  return Number(minor);
}
```

舍入规则：toMinor 使用向下取整（保守，避免因舍入突破上限）。

### 8.5 applyWinCap 语义

- 输入：chainWinMinor / theoreticalWinFixed / betMinor / maxMultiplier
- 输出：actualWinMinor / newChainWinMinor / cappedThisSpin / chainCapReached / zeroWin
- chainCapReached：本局结算后累计值 >= capMinor
- 封顶后 FS 继续：局数正常消费，派彩为 0，chain_cap_reached 记录，不终止链

### 8.6 校验函数

```js
function validateBet(betMinor, maxBetMinor) {
  if (!Number.isSafeInteger(betMinor)) return 'invalid_integer';
  if (betMinor < 1) return 'below_minimum';
  if (betMinor > maxBetMinor) return 'above_maximum';
  return null;
}

function safeMul(a, b, label) {
  const r = a * b;
  if (!Number.isSafeInteger(r)) throw new Error(`${label}: unsafe`);
  return r;
}
```

---

## 9. A-7 账本（wallet_ledger）

### 9.1 Schema

```sql
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  spin_id TEXT,
  delta INTEGER NOT NULL,
  change_type TEXT NOT NULL,
  ref_type TEXT, ref_id TEXT,
  math_version TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON wallet_ledger(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_spin ON wallet_ledger(spin_id);
```

### 9.2 字段语义

| 字段 | 语义 |
|---|---|
| balance_delta | 本笔净变化（权威）|
| balance_before | 非权威快照（若无法事务内取得）|
| balance_after | 仅 batch 后查询则为查询时快照 |

### 9.3 三层对账

第一层 · 余额汇总：

```sql
SELECT u.id, u.wallet_balance, COALESCE(SUM(l.delta), 0) AS ledger_sum
FROM users u
LEFT JOIN wallet_ledger l ON l.user_id = u.id
GROUP BY u.id
HAVING u.wallet_balance != COALESCE(SUM(l.delta), 0);
```

第二层 · 事件完整性：

```sql
-- 每用户恰好一条 opening
SELECT user_id FROM wallet_ledger WHERE change_type = 'opening'
GROUP BY user_id HAVING COUNT(*) != 1;

-- 无重复 event_id
SELECT event_id FROM wallet_ledger GROUP BY event_id HAVING COUNT(*) > 1;

-- 无空 event_id
SELECT COUNT(*) FROM wallet_ledger WHERE event_id IS NULL OR event_id = '';
```

第三层 · 交易级一致性：

```sql
-- 付费局：bet 事件 delta = -bet_minor；win 事件 delta = win_minor（若 > 0）
SELECT s.spin_id, s.bet_minor, s.win_minor,
  COALESCE(SUM(CASE WHEN l.change_type = 'bet' THEN l.delta ELSE 0 END), 0) AS bet_delta,
  COALESCE(SUM(CASE WHEN l.change_type = 'win' THEN l.delta ELSE 0 END), 0) AS win_delta
FROM spins s
LEFT JOIN wallet_ledger l ON l.spin_id = s.spin_id
WHERE s.is_free = 0
GROUP BY s.spin_id
HAVING bet_delta != -s.bet_minor
    OR (s.win_minor > 0 AND win_delta != s.win_minor)
    OR (s.win_minor = 0 AND win_delta != 0);

-- 免费局：无 bet 事件；win 事件 delta = win_minor（若 > 0）
SELECT s.spin_id, s.win_minor,
  COALESCE(SUM(CASE WHEN l.change_type = 'bet' THEN 1 ELSE 0 END), 0) AS bet_count,
  COALESCE(SUM(CASE WHEN l.change_type = 'win' THEN l.delta ELSE 0 END), 0) AS win_delta
FROM spins s
LEFT JOIN wallet_ledger l ON l.spin_id = s.spin_id
WHERE s.is_free = 1
GROUP BY s.spin_id
HAVING bet_count != 0
    OR (s.win_minor > 0 AND win_delta != s.win_minor)
    OR (s.win_minor = 0 AND win_delta != 0);

-- 完全无 ledger 关联但有预期变更的 spin
SELECT s.spin_id FROM spins s
WHERE (s.bet_minor > 0 OR s.win_minor > 0)
  AND NOT EXISTS (SELECT 1 FROM wallet_ledger l WHERE l.spin_id = s.spin_id);
```

### 9.4 首次启用

迁移时为每个现有账户创建一条 opening 事件，delta = 当前余额。

### 9.5 外键前提

必须验证 D1 环境确实启用外键约束（PRAGMA foreign_keys）。

---

## 10. A-8 迁移策略

- Wrangler D1 migration tracking
- 迁移编号严格按序列（当前 0019 → 0021，0020 已删不复用）
- 旧库升级前备份 + Staging 验证
- 验证 schema、索引、约束、触发器、旧数据

### 10.1 兼容窗口

第一步（扩展）：部署新 schema，旧代码可运行，新代码双写，观察至少一个发布周期。
第二步（收缩）：确认旧代码退出，执行不可逆迁移，保留回滚窗口。

回滚应用代码时：新结构必须兼容旧代码，否则不得部署第一步。

---

## 11. A-9 Session 与账号安全

### 11.1 改密撤销

撤销除当前外的所有：

```sql
DELETE FROM sessions WHERE user_id = ? AND id != ? AND revoked_at IS NULL;
```

### 11.2 Session 配额

MAX_ACTIVE_SESSIONS_PER_USER = 20

方案：BEFORE INSERT trigger 检测。

```sql
CREATE TRIGGER IF NOT EXISTS trg_sessions_limit
BEFORE INSERT ON sessions
FOR EACH ROW
WHEN (
  SELECT COUNT(*) FROM sessions
  WHERE user_id = NEW.user_id
    AND revoked_at IS NULL
    AND expires_at > CURRENT_TIMESTAMP
) >= 20
BEGIN
  SELECT RAISE(ABORT, 'session_limit_exceeded');
END;
```

若此 trigger 在真实 D1 中工作，则并发保护可靠。
若不可靠（subquery 不支持），改用独立计数表 + 一致性对账。

必须实测此 trigger 在 D1 中的行为。

---

## 12. A-3b 测试清单（门禁）

### 12.1 事务守卫 10 项（§3.4）

见上文表格。测试 1、4、8、9 必须覆盖 INSERT + UPDATE 两条路径。

### 12.2 幂等

- 同 ID 同参数 → cached
- 同 ID 不同下注 → 409 idempotency_conflict
- 同 ID 不同用户 → 409 spin_id_taken
- 同 ID 并发 → 一个成功一个 cached 或 409
- 事务失败重试 → 幂等
- FS 状态变化后重试 → 返回原结果
- 指纹规范化等价表（§6.2）
- 结算上下文原子性

### 12.3 FS 并发

- 两普通局并发触发 FS → 只创建一个
- 两请求并发消费同一局 → 一个成功一个 409
- remaining_spins = 1 并发 → 一个成功一个 fs_exhausted
- 乐观并发冲突 → 整批回滚
- 六种组合（§7.4）
- 判定一致性：retriggerAdd 与 retriggerIncrement 必须成对
- 并发冲突分类正确

### 12.4 账本三层对账

- 余额汇总无差异
- 每用户唯一 opening
- 无重复/空 event_id
- 付费局 bet_delta = -bet_minor
- 付费局 win_delta = win_minor
- 免费局无 bet 事件
- 无孤立 ledger
- 主动构造错误：余额变化无 ledger / 重复 / 孤立 / opening 缺失 / bet 重复 / win 缺失 / 免费局有 bet

### 12.5 Session 配额

- 改密后其他 session 立即失效
- 并发创建 21 个：最多 20 个有效
- 过期清理不误删有效 session
- 计数与真实数量一致
- 禁用账号返回 403

---

## 13. 未决问题（待 A-3b 验证）

| # | 问题 | 验证方式 |
|---|---|---|
| Q1 | D1 batch 内 changes() 行为 | 真实 Worker + D1 集成测试 |
| Q2 | UPSERT + CHECK 约束在 batch 内行为 | 同上 |
| Q3 | BEFORE INSERT trigger 在 D1 中支持 | 同上 |
| Q4 | 外键约束是否默认启用 | PRAGMA foreign_keys 查询 |
| Q5 | batch 内失败是否整批回滚 | 主动构造失败 |

---

## 14. 文档状态

| 阶段 | 状态 |
|---|---|
| 设计（本文档）| Draft |
| A-3b 集成测试 | 未执行 |
| 定稿 | 待 A-3b 通过后 |

本文档是**设计**，不是**证明**。所有断言必须经 A-3b 真实 D1 集成测试验证后才生效。

