# B-3 · 生产 vs 参考 对比报告

**版本**：math-1.0.0
**生成时间**：2026-10-09
**样本**：每模式 10 万局（生产 vs 参考，不同 seed）
**状态**：✅ 已修正（2026-10-09，simulator-v2.cjs 已加入 FS 模拟）

---

## 1. 对比结果

### 1.1 real 模式

| 指标 | 生产 | 参考 | 差异 | 门禁 | 判定 |
|---|---|---|---|---|---|
| RTP | 0.9186 | 0.9222 | 0.0036 | <0.01 | ✅ PASS |
| hitRate | 0.3254 | 0.3237 | 0.0017 | <0.05 | ✅ PASS |
| bonusRate | 0.0003 | 0.0004 | 0.0000 | — | ✅ |
| p95 | 4.58 | 4.58 | 0 | — | ✅ |
| p99 | 8.54 | 8.79 | 0.25 | — | ✅ |

### 1.2 demo 模式

| 指标 | 生产 | 参考 | 差异 | 门禁 | 判定 |
|---|---|---|---|---|---|
| RTP | 1.8092 | 2.0297 | **0.2206** | <0.01 | ❌ FAIL |
| hitRate | 0.5479 | 0.5463 | 0.0017 | <0.05 | ✅ PASS |
| bonusRate | 0.0137 | 0.0139 | 0.0003 | — | ✅ |
| p95 | 7.37 | 7.37 | 0 | — | ✅ |
| p99 | 12.78 | 21.60 | **8.82** | — | ❌ |
| maxWin | 362.88 | 452.16 | **89.28** | — | ❌ |

---

## 2. 差异特征

### 2.1 real 一致

- RTP 差 0.0036（< 1 百分点）
- hitRate 差 0.0017（< 0.5 百分点）
- p95 完全相同
- 判定：**real 生产与参考逻辑一致**

### 2.2 demo 尾部差异

- hitRate 一致（差 0.0017）→ 单次 spin 的中奖分布一致
- p95 一致 → 中档位派彩一致
- **p99 差 8.82** → 极端派彩差异大
- **maxWin 差 89** → 最大派彩差异大

**结论：差异集中在尾部**，即中奖次数分布一致、单次金额一致，
但**尾部（大额派彩）出现频率**或**幅度**不同。

---

## 3. 根因定位

### 3.1 关键代码差异

**参考实现**（`tools/reference-sim/sim.cjs`）：

```js
function simulateOneSpin(rng, pool, paytable, bonusRules, profile) {
  const base = baseSpin(rng, pool, paytable, bonusRules, gridOverride);
  let totalMultiplier = base.totalMultiplier;
  let fsMultiplierSum = 0;
  if (base.bonusTriggered) {
    let remaining = bonusRules.initialSpins;
    while (remaining > 0) {
      remaining--;
      const fs = baseSpin(rng, pool, paytable, bonusRules);
      fsMultiplierSum += fs.totalMultiplier;  // ← 计入 FS 派彩
      if (fs.bonusTriggered) remaining += bonusRules.retriggerSpins;
    }
  }
  totalMultiplier += fsMultiplierSum;  // ← FS 派彩加入总分
  return { totalMultiplier, ... };
}
```

**生产 simulator**（`tests/math/simulator-v2.cjs`）：

```js
var res = engine.spin({ mode, betMinor, spinId, gridOverride });
var winMinor = Math.floor(betMinor * res.totalMultiplier * payScale);
// res.totalMultiplier = engine 内 base cascades + scatter 派彩之和
// 不含 FS（engine 只处理 base spin，不级联 FS）
```

### 3.2 结论

**`tests/math/simulator-v2.cjs` 有缺陷**：

- 只算 base spin 的 `res.totalMultiplier`
- **没有**模拟 FS 期间的派彩
- FS 触发时，`bonusRate ≈ 0.0137` 的局数贡献的派彩**被漏计**

**为什么 real 影响小？**

- real scatterWeight=1 → FS 频率 = demo 的 1/3
- FS 贡献 < 0.3 百分点 → 在 1 百分点门禁内

**为什么 demo 影响大？**

- demo scatterWeight=3 → FS 频率 ≈ 1.4%（10 万局 = 1400 局触发 FS）
- 每局 FS 期望额外派彩 = ~0.5× bet
- 总贡献 ≈ 1400 × 0.5×bet / 100000×bet = 0.7 绝对百分点 RTP
- 但实测差 22 百分点 → **说明 FS 内单局派彩方差极大，p99/maxWin 被严重拉低**

---

## 4. 真实游戏路径 vs 两个模拟器

**真实游戏 demo 路径**（`src/js/inline/sweet-demo.js`）：

1. `doSpin()` 调 `provider.spin({bet, free:false})`
2. 若 `result.feature.triggered`，调 `runBonusSequence()`
3. `runBonusSequence` 循环 10 次 `provider.spin({bet, free:true})`
4. 累加 `totalWinMinor`

→ **真实游戏算 FS 派彩**

**simulator-v2.cjs**：不算 FS 派彩
**参考模拟器**：算 FS 派彩

**所以 simulator-v2.cjs 与真实游戏路径不一致**。

---

## 5. 修正方案

### 5.1 修正目标

- 让 simulator-v2.cjs 模拟 FS（对齐参考 + 真实游戏）
- 重跑 100 万局 real + demo
- 更新基线存档（`tests/math/rtp-baseline.json`）
- 更新本文档 + `docs/math/theory.md` §9 基线值

### 5.2 修正范围

**只改 `tests/math/simulator-v2.cjs`**（测试工具，不是产品代码）

**不动**：
- `src/engine/*`（生产引擎）
- `src/config/math-profile.js`（权重 / payScale / RTP 目标）
- `src/config/paytable.locked.js`（赔付表）
- `functions/`（Worker 代码）

### 5.3 预期修正后结果

基于 B-3 参考实现：

| 模式 | 修正后 RTP 预期 | 目标区间 | 判定 |
|---|---|---|---|
| real | 0.9109（几乎不变，FS 影响 < 0.3pt） | [0.88, 0.93] | ✅ 仍达标 |
| demo | ~1.9~2.0（升 0.2~0.4） | [1.30, 2.50] | ✅ 仍达标 |

**结论：修正后 RTP 仍落在目标区间。** 无需调 payScale。

---

## 6. 关键提醒

**demo RTP 从 1.566 修正到 ~1.9 后，与"原目标 178%"的关系**：

- 修正前声称 RTP 1.566（但这是**错误低估**）
- 修正后真实 RTP ≈ 1.9（**仍在 1.30~2.50 区间内**）
- 玩家侧体感：期望派彩更高（1.9 / 1.566 = +21%）

**real RTP 从 0.9109 修正到实际值（预计 < 0.92，仍 < 0.93 硬上限）**：

- FS 贡献真实存在，之前被漏计
- 修正后可能略升，需要重跑确认是否仍 < 0.93
- 若超过 0.93，需要调低 payScale 到 2.50（+/- 微调）

---

## 7. 施工单一致性

本报告符合 v9 施工单 §B 的要求：

- ✅ 独立参考模拟器（B-2）已建成
- ✅ 对比测试（B-3）已执行
- ✅ 发现生产侧缺陷（非参考侧）
- ⏳ 修正待执行
- ⏳ 修正后重跑 100 万局

**B 阶段出口依赖修正完成 + 100 万局复核通过。**



---

## 8. 修正后复核（2026-10-09）

### 8.1 修正内容

`tests/math/simulator-v2.cjs` 新增 `runFreeSpins()`：
- base spin 若 `res.bonus.triggered` 为真，循环 `res.bonus.awardedSpins` 次 FS
- FS 内若再触发（`fs.bonus.triggered`），`remaining += retriggerSpins`
- 累加所有 FS 的 `totalMultiplier` 到 base spin 派彩
- FS 次数上限 1000（防死循环）

**未动**：`src/engine/*`、`functions/*`、`src/config/*`。

### 8.2 修正后 6 seeds × 20 万局

| 模式 | RTP 均值 | RTP 范围 | 极差 | hitRate |
|---|---|---|---|---|
| real | 0.9169 | [0.9111, 0.9207] | 0.0095 | 0.3244 |
| demo | 2.0873 | [2.0623, 2.1091] | 0.0467 | 0.5487 |

### 8.3 生产 vs 参考（100 万局单 seed）

| 模式 | 生产 RTP | 参考 RTP | 差异 | 门禁 | 判定 |
|---|---|---|---|---|---|
| real | 0.9165 | 0.9160 | 0.0005 | <0.01 | ✅ PASS |
| demo | 2.0934 | 2.0913 | 0.0021 | <0.01 | ✅ PASS |

修正前 demo 差异 0.2206（FAIL），修正后 0.0021（PASS），下降 100 倍。

### 8.4 目标区间校验

- real 0.9169 ∈ [0.88, 0.93] ✅；< 0.94 硬上限 ✅
- demo 2.0873 ∈ [1.30, 2.50] ✅

### 8.5 结论

**B-3 修正完成。** 生产与参考在 FS 语义上对齐；两者 RTP 差 < 1 绝对百分点；两模式均在目标区间。B 阶段出口条件满足。
