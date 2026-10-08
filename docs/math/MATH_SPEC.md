# Apex · 数学规格

**版本**：`math-1.0.0`
**状态**：已校准（120 万局 + 6 seed × 20 万局验证）
**最后更新**：2026-10-08

---

## 1. 目标区间

| 模式 | RTP 目标 | HitRate 目标 | BonusRate |
|---|---|---|---|
| real | 0.88 ~ 0.93 | 0.20 ~ 0.35 | ~0.0006 |
| demo | 1.30 ~ 2.50 | 0.45 ~ 0.60 | ~0.029 |

---

## 2. 实测基线

| 模式 | RTP 均值 | RTP 范围 | 极差 | HitRate |
|---|---|---|---|---|
| real | **0.9109** | [0.9055, 0.9148] | 0.0093 | 0.3241 |
| demo | **1.5660** | [1.5590, 1.5745] | 0.0154 | 0.5401 |

echo -n "  正常停止: "; grep -c "'停止'" src/js/inline/sweet-demo.js || true6 seed × 20 万局 = 120 万局/模式。极差 < 0.02 说明 seed 不影响结果。

---

## 3. 数学参数（单一真值来源）

**位置**：`src/config/math-profile.js`

### 3.1 权重（两模式相同）

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
| **基础合计** | **88** |

### 3.2 Scatter / Multiplier 权重

| 模式 | scatterWeight（棒棒糖） | multiplierWeight |
|---|---|---|
| real | 1 | 0 |
| demo | 3 | 0 |

### 3.3 全局缩放（payScale）

| 模式 | payScale |
|---|---|
| real | 2.55 |
| demo | 3.60 |

**作用**：payScale 全局缩放赔率，不影响 hitRate。这是唯一的安全 RTP 调节杠杆。

### 3.4 Pity 保底（仅 demo）

| 参数 | 值 |
|---|---|
| pityRate | 0.35 |
| pitySymbol | BANANA |
| pityMinCount | 8 |

**逻辑**：若某次 spin 完全无中奖，以 35% 概率注入 8 个 BANANA 保底中奖。仅影响体验感，不用于 real。

---

## 4. 赔率表

**位置**：`src/config/paytable.locked.js`（版本化只读）

| 符号 | 8 个 | 10 个 | 12+ 个 |
|---|---|---|---|
| RED_HEART（红心糖） | 10x | 25x | 50x |
| PURPLE_CANDY（紫糖） | 2.5x | 10x | 25x |
| GREEN_CANDY（绿糖） | 2x | 5x | 15x |
| BLUE_CANDY（蓝糖） | 1.5x | 2x | 12x |
| APPLE（苹果） | 1x | 1.5x | 10x |
| PLUM（李子） | 0.8x | 1.2x | 8x |
| WATERMELON（西瓜） | 0.5x | 1x | 5x |
| GRAPE（葡萄） | 0.4x | 0.9x | 4x |
| BANANA（香蕉） | 0.25x | 0.75x | 2x |

**规则**：8~9 同档，10~11 同档，12+ 最高档。赔率值乘 payScale 后才是最终赔率。

---

## 5. 特殊符号规则

### 5.1 Scatter（棒棒糖）

| 出现数 | 派彩 | 免费旋转 |
|---|---|---|
| 4 | 3x | 10 FS |
| 5 | 5x | 10 FS |
| 6+ | 100x | 10 FS |

- FS 期间再次出现 4+ Scatter 再触发 10 FS
- Scatter 不参与 Pay Anywhere 计数

### 5.2 Multiplier Bomb（倍率炸弹）

- 仅 Free Spins 期间出现
- 倍率范围：x2 ~ x100
- 同一轮（一次 spin 的所有连消）结束时，场上所有炸弹倍率相加
- 作用于本轮总派彩

---

## 6. 引擎流程

**实现**：`src/engine/game-engine.js`

1. 生成 30 格（Rng 加权抽签）
2. Evaluate：识别 8+ 同符号（Pay Anywhere）
3. 有中奖 → Tumble（消除 + 下落 + 补位）→ 重复 2
4. 无中奖 → 结算
5. 总派彩 = 累加所有连消的 payoutMultiplier x betMinor x payScale

**安全上限**：`maxTumbleSteps` 默认 100，防死循环。

---

## 7. 验证方式

### 7.1 快速门禁（CI 自动，每次 push）

```
npm run test:rtp
```

5 万局 x 2 模式，约 6 秒。超区间 CI 变红。

### 7.2 完整校准（手动）

```
npm run test:rtp:full
```

20 万局/模式，约 20 秒。

### 7.3 基线存档

`tests/math/rtp-baseline.json` 保存最近一次校准结果。
改参数后必须重跑并更新此文件。

---

## 8. 修改纪律

### 允许修改

- `baseWeights` 权重值
- `scatterWeight` / `multiplierWeight`
- `payScale`
- `pityRate` / `pitySymbol` / `pityMinCount`
- `targetRtp` / `targetHitRate` 区间

### 修改流程

1. 改 src/config/math-profile.js
2. node --check 语法
3. 跑 npm run test:rtp:full 验证（120 万局）
4. 达标后 bump math-profile.VERSION
5. 更新 rtp-baseline.json
6. 更新本文件 §2、§3
7. commit + push

### 禁止

- 直接改 paytable.locked.js（要改先讨论 + bump version）
- 在 runtime 里动态调 RTP
- 用 Math.random 替代 crypto
- 未验证就 push

---

## 9. 已知偏差

| 项 | 说明 |
|---|---|
| demo RTP | 历史 1.78 调整为 1.566，仍在 1.30~2.50 区间。如需调回，改 demo.payScale 到约 4.10 |
| BonusRate | real ~0.0006（约 1/1667 局触发）。体感偏低，可考虑提高 scatterWeight |
| MaxWin | real 约 51x~77x（120 万局内），无 1000x+ 极端。如需要更大波动可调 maxTumbleSteps |

---

## 10. 相关文件

| 文件 | 作用 |
|---|---|
| src/config/math-profile.js | 参数真值来源 |
| src/config/paytable.locked.js | 赔率表 |
| src/config/symbols.locked.js | 符号元数据 |
| tests/math/simulator-v2.cjs | Monte Carlo 模拟器 |
| tests/math/seeded-rng.cjs | 可复现随机（xorshift32） |
| tests/math/rtp-gate.cjs | CI 门禁脚本 |
| tests/math/rtp-baseline.json | 基线存档 |
