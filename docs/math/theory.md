# Apex · 数学理论（Math Theory）

**版本**：math-1.0.0
**状态**：B-1 起草（待 B-2 独立参考模拟交叉验证后定稿）
**最后更新**：2026-10-09
**关联**：v9 施工单 §B、docs/settlement/settlement-transaction-design.md

---

## 0. 目的

本文档解析描述 Apex 数学模型的**理论值**，独立于生产代码：

- 定义抽样空间、每格概率、赔付表、Scatter、Tumble、FS、max-win
- 给出 RTP 的分子分母定义（可解析 or 需模拟）
- 明确解析 vs 模拟分界
- 供 B-2 独立参考模拟器复核

**本文档是描述，不是实现。** 任何数值与代码不一致时，以 `src/config/*.locked.js` 为准。

---

## 1. 抽样空间

### 1.1 棋盘

| 项 | 值 |
|---|---|
| 列数 columns | 6 |
| 行数 rows | 5 |
| 总格数 size | 30 |
| 索引方式 | row-major：idx = row * 6 + col |

每次"旋转"（base spin）从 30 个独立同分布（iid）的符号中抽样。
后续 Tumble 补位也走同一分布。

### 1.2 符号全集（11 个）

| ID | 类型 | 中文 | 类别 |
|---|---|---|---|
| banana | regular | 香蕉 | fruit |
| grape | regular | 葡萄 | fruit |
| watermelon | regular | 西瓜 | fruit |
| plum | regular | 李子 | fruit |
| apple | regular | 苹果 | fruit |
| blue_candy | regular | 蓝糖果 | candy |
| green_candy | regular | 绿糖果 | candy |
| purple_candy | regular | 紫糖果 | candy |
| red_heart_candy | regular | 红心糖 | candy |
| lollipop | scatter | 棒棒糖 | special |
| multiplier_bomb | multiplier | 倍率炸弹 | special |

**regular** 参与 Pay Anywhere 中奖。
**scatter** 只计数，不参与 Pay Anywhere。
**multiplier** 只在 Free Spins 期间出现，作为倍率载体，不参与 Pay Anywhere。

---

## 2. 每格概率（权重表）

### 2.1 权重来源

`src/config/math-profile.js` 的 `PROFILES[mode].baseWeights` 是唯一真值。

**real 模式**：

| 符号 | 权重 |
|---|---|
| BANANA | 14 |
| GRAPE | 14 |
| WATERMELON | 13 |
| PLUM | 13 |
| APPLE | 12 |
| BLUE_CANDY | 6 |
| GREEN_CANDY | 6 |
| PURPLE_CANDY | 5 |
| RED_HEART | 5 |
| **base 合计** | **88** |
| lollipop (scatterWeight) | 1 |
| **总权重** | **89** |

**demo 模式**：

| 符号 | 权重 |
|---|---|
| 9 个 regular | 同 real（合计 88） |
| lollipop (scatterWeight) | 3 |
| **总权重** | **91** |

### 2.2 每格概率

real：`P(sym) = weight(sym) / 89`；`P(lollipop) = 1 / 89 ≈ 1.124%`。

demo：`P(sym) = weight(sym) / 91`；`P(lollipop) = 3 / 91 ≈ 3.297%`。

**注意**：demo 模式 scatter 出现概率是 real 的 3 倍，导致 FS 频率显著更高。

### 2.3 抽样方式

`src/engine/rng.js`：

- `randomInt(max)`：拒绝采样（rejection sampling）消除 modulo bias
- `Rng.pickSymbol()`：按权重表累计比较
- `Rng.generateGrid()`：调用 30 次 pickSymbol

**iid 假设**：每次抽样独立同分布，无放回、无记忆、无相邻约束。

---

## 3. Pay Anywhere 中奖规则

### 3.1 判定

对 regular 符号：统计本次评估中的 30 格，任一 regular 符号出现 **≥ 8 个**即中奖，
**位置无关**（Pay Anywhere），不要求相邻或连成一线。

### 3.2 赔付表（倍率，相对 bet）

来源：`src/config/paytable.locked.js`

| 符号 | 8-9 个 | 10-11 个 | 12+ 个 |
|---|---|---|---|
| BANANA | 0.25 | 0.75 | 2 |
| GRAPE | 0.4 | 0.9 | 4 |
| WATERMELON | 0.5 | 1.0 | 5 |
| PLUM | 0.8 | 1.2 | 8 |
| APPLE | 1.0 | 1.5 | 10 |
| BLUE_CANDY | 1.5 | 2.0 | 12 |
| GREEN_CANDY | 2.0 | 5.0 | 15 |
| PURPLE_CANDY | 2.5 | 10.0 | 25 |
| RED_HEART | 10.0 | 25.0 | 50 |

**档位规则**：8-9 同档，10-11 同档，12+ 最高档（13/15/...均按 12 档）。

### 3.3 单次评估的 payoutMultiplier

单次评估（一次棋盘状态）的 payoutMultiplier 是所有同时中奖符号的赔付之和：

```
payoutMultiplier(state) = Σ over symbols s where count(s) >= 8: paytable(s, count(s))
```

**注**：`count(s)` 大于 12 也按 12 档；多个符号同时中奖时分别计算并相加。

### 3.4 与 Scatter / Multiplier 的关系

- lollipop（scatter）**不参与** Pay Anywhere 计数
- multiplier_bomb **不参与** Pay Anywhere 计数（FS 期间另算，见 §5.2）

---

## 4. Tumble（连消）

### 4.1 流程

1. 评估当前棋盘，得到 `winningPositions`（所有中奖格索引）
2. 若 `winningPositions` 非空：
   a. 累加本次评估的 `payoutMultiplier` 到 `totalMultiplier`
   b. 移除所有 winningPositions（置 null）
   c. 每列独立压缩：存活符号按原相对顺序下移到底部
   d. 顶部空位用 rng.pickSymbol() 补位（iid）
3. 重复步骤 1，直到 `winningPositions` 为空

### 4.2 安全上限

`maxTumbleSteps` 默认 100（构造时可配）。达到上限时：
- `diagnostics.terminatedBySafetyLimit = true`
- 停止连消，按当前 totalMultiplier 结算

理论上：因为每次 Tumble 补位是 iid，几乎不可能连续 100 步都有中奖。
该上限是**工程保险**，正常不影响 RTP（< 1e-30 概率触发）。

### 4.3 cascade 累加

`totalMultiplier = Σ over cascades: payoutMultiplier(cascade)`

**注**：每个 cascade 独立评估，互不干扰。

---

## 5. Free Spins

### 5.1 Scatter 派彩

来源：`src/engine/bonus.js` 的 `BONUS_RULES.scatterPayouts`

| scatter 数 | Scatter 派彩（倍率） | 触发 FS 局数 |
|---|---|---|
| 4 | 3 | 10 |
| 5 | 5 | 10 |
| 6+ | 100 | 10 |

**关键规则**：Scatter 只在**首轮（step=0）**计数（防止 Tumble 补位误触发）。

**Scatter 派彩独立于 Pay Anywhere**：即使首轮无 regular 中奖，只要有 4+ Scatter，
Scatter 派彩（3/5/100）仍计入 totalMultiplier（engine/game-engine.js 尾部 `totalMultiplier += bonusScatterPayout`）。

### 5.2 FS 中的机制

- FS 期间 scatterWeight 不变，仍可能再触发（4+ 再给 10 局）
- 倍率炸弹（multiplier_bomb）：**只在 FS 期间出现**（通过 mode profile 的 multiplierWeight 控制）

**当前状态**：`multiplierWeight = 0`（real 和 demo 都是 0）。
倍率炸弹**当前不出现**。理论 RTP 计算**不计入**炸弹倍率。

如果未来启用 multiplierWeight > 0，需要重新校准 RTP。

### 5.3 max-win 上限

**当前实现**：`functions/api/game/spin.js` 里 `maxWinMultiplier` 默认 5000（real）。
**当前作用**：仅用于 reward_chains 的 cap 计算，链内累计派彩不超过
`effectiveBetMinor × maxWinMultiplier`。

**当前不生效于 base spin**：base spin（无 FS）不受 maxWinMultiplier 限制。
因此 base spin 单次理论最大派彩无硬上界，但概率极低。

---

## 6. payScale

来源：`src/config/math-profile.js` 的 `PROFILES[mode].payScale`

| 模式 | payScale |
|---|---|
| real | 2.55 |
| demo | 3.60 |

**作用**：理论派彩的最后一步乘子。

```
theoreticalWinMinor = floor(betMinor × totalMultiplier × payScale)
```

**注**：payScale 是 RTP 调校的核心杠杆，**不影响 hitRate**（hitRate 由符号权重 + paytable 决定）。

**BigInt 定点**：`spin.js` 用 BigInt + 10^6 精度计算，避免浮点误差少派 1 分。

---

## 7. RTP 定义

### 7.1 分子分母

RTP = 总派彩 / 总下注

**分母**：每次 base spin 的下注额 `betMinor`。
- 免费旋转**不**单独计下注（下注在触发它的 base spin 已计入）
- 一次 base spin 若触发 FS，其下注计入，FS 内所有 spin 的派彩也归入这次 base spin

**分子**：一次 base spin 的完整派彩，包括：
- base spin 各 cascade 的 Pay Anywhere 派彩
- 若首轮 4+ Scatter：Scatter 派彩（3/5/100）
- 若触发 FS：FS 内所有 spin 的 Pay Anywhere 派彩之和
- （未来若启用）倍率炸弹加成

### 7.2 单次 base spin 的派彩公式

```
baseWin = floor(betMinor × baseMult × payScale)
FSWin   = floor(betMinor × fsMult   × payScale)   // FS 内中奖按触发时的 bet 计算
scatterWin = floor(betMinor × scatterPayout × payScale)
totalWin = baseWin + scatterWin + FSWin
```

**注**：`baseMult` 是所有 cascade 累加，`scatterPayout` 是 4/5/6 档的 3/5/100。

### 7.3 门禁公式

B-3 门禁使用 **overall RTP**（非 seed 均值）：

```
RTP_overall = (Σ over all spins: winMinor) / (Σ over all spins: betMinor)
```

报告同时提供 `RTP_seed_mean`（每个 seed 独立算 RTP 后求均值），仅作参考。
当所有 seed 的下注额相同时两者一致。

---

## 8. 解析 vs 模拟分界

### 8.1 可以解析计算的部分

**理论无 Tumble 情况**（只考虑单次评估）：

```
E[payoutMultiplier | iid grid] = Σ over symbols s: E[paytable(s, count(s)) × 1(count(s)>=8)]
```

单符号 count 服从二项分布：`count(s) ~ Binomial(30, p_s)`，其中 `p_s = weight(s) / W`。

```
E_payout(s) = Σ_{k=8}^{30} binomial(30, k) × p_s^k × (1-p_s)^(30-k) × paytable(s, k)
```

**Scatter 派彩**（与 Pay Anywhere 独立）：

```
E_scatter = Σ_{k=4}^{30} binomial(30, k) × p_ll^k × (1-p_ll)^(30-k) × scatterPayout(k)
```

**注**：`scatterPayout(k)` 只区分 4/5/6+，k>=6 都是 100。

### 8.2 必须模拟的部分

**Tumble 链**：因为每一步都依赖上一步的棋盘状态，且需要判定"无中奖"终止条件，
难以用闭式解析表达。

**Free Spins 期望派彩**：因为 FS 内可能再触发（4+ Scatter），涉及几何级数（recursive FS），
虽然理论上可以用马尔可夫链或迭代求解，但代码复杂度高，且 Tumble 的贡献仍然需要模拟。

**max-win 截断**：极端情况截断后，理论期望值需减去被截断部分的贡献，难以解析。
（当前 max-win 只对 FS 生效，base spin 无截断，简化了问题。）

### 8.3 结论

**理论 RTP 只能通过蒙特卡洛模拟逼近**，模拟器必须：
- 使用独立的符号权重实现
- 使用独立的 Pay Anywhere 实现
- 使用独立的 Tumble 实现
- 使用独立的 Scatter 判定
- 使用独立的 FS 触发

这是 B-2 独立参考模拟器的核心要求。

---

## 9. 参考基线值（截至 2026-10-09）

### 9.1 生产引擎 120 万局 × 6 seed

**real 模式**：
- RTP 均值 = 0.9169
- RTP 范围 = [0.9111, 0.9207]
- 极差 = 0.0095
- hitRate = 0.3244

**demo 模式**：
- RTP 均值 = 2.0873
- RTP 范围 = [2.0623, 2.1091]
- 极差 = 0.0467
- hitRate = 0.5487

### 9.2 目标区间

**real**：RTP [0.88, 0.93]，hitRate [0.20, 0.35]
**demo**：RTP [1.30, 2.50]，hitRate [0.45, 0.60]

**注**：real RTP 上限 0.93 对应"平台侧盈利"的下限；此上界为行业常规要求，
**不得超过 0.94**（无论任何理由）。

### 9.3 与理论的偏差容忍

施工单要求：B-3 参考模拟 vs 生产模拟的 RTP 差异 **< 1 绝对百分点**。

如果 B-2 参考模拟结果偏离超过 1%，说明生产代码存在隐藏 bug（或参考实现有 bug），
必须先定位并修复，才能进 C 阶段。

---

## 10. 未决问题（待 B-2 回答）

| # | 问题 | 验证方式 |
|---|---|---|
| Q1 | 理论单次评估 payoutMultiplier 是否与生产引擎一致？ | 参考实现 vs 生产随机抽样相同 grid |
| Q2 | Tumble 期望步数是否合理？（生产 avgTumbles ≈ 1.5） | 参考实现独立统计 |
| Q3 | Scatter 触发 FS 的概率是否接近预期？ | 参考实现统计 scatterCount 分布 |
| Q4 | FS 内 Tumble 期望是否与 base 一致？ | 参考实现分开统计 |
| Q5 | 理论 RTP 与生产 RTP 差异是否 < 1%？ | bootstrap CI 对比 |

---

## 11. 不做的事情（明确边界）

- ❌ 不修改生产代码（B 阶段只读）
- ❌ 不引入新数学（math-1.0.0 冻结）
- ❌ 不改 payScale / 权重 / 赔率
- ❌ 不把 B 阶段结果作为发布许可

B 阶段只是**验证**，不是**调优**。任何调优必须在 B-2 报告差异后另行决策。

---

## 12. 参考

- `src/config/math-profile.js`（权重 / payScale / RTP 目标）
- `src/config/paytable.locked.js`（赔付表）
- `src/engine/rng.js`（抽样方式）
- `src/engine/evaluator.js`（Pay Anywhere 判定）
- `src/engine/tumble.js`（连消）
- `src/engine/bonus.js`（Scatter 与 FS 规则）
- `src/engine/game-engine.js`（完整 spin 流程）
- `functions/api/game/spin.js`（payScale / BigInt / max-win）
- `tests/math/rtp-baseline.json`（基线存档）
- `docs/settlement/settlement-transaction-design.md`（事务设计）

