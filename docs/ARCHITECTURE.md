# Apex · 架构总览

**版本**：arch-1.0.0
**最后更新**：2026-10-08

---

## 1. 顶层结构

```
src/
  config/      冻结层（版本 / 符号 / 赔率 / 规则 / 数学参数）
  engine/      新引擎（纯逻辑，无 UI 依赖）
  provider/    Provider 三件套（基类 / demo adapter / server stub）
  wallet/      钱包（基类 / demo 实现）
  core/        状态机 + Runtime（串接 provider/wallet/state）
  js/          老业务（sweet-demo.js / 符号 / 音频 / UI sheets）
tests/math/    模拟器 / 门禁 / 基线 / 对比
docs/          文档
```

---

## 2. 加载顺序（sweet-demo.html）

新模块 → 冻结层 → 老业务：

```
1. config/       version → math-profile → symbols.locked → paytable.locked → public-rules
2. engine/       errors → grid → rng → multiplier → evaluator → tumble → bonus → payout → game-engine
3. provider/     provider → local-demo → server
4. wallet/       wallet → demo-wallet
5. core/         state → runtime
6. 老业务        sweet-win-feedback → 符号系统 → 音频 → UI sheets → sweet-demo
7. debug/        debug-boot（?debug=1 才显示）
```

**依赖方向**：config ← engine ← provider/wallet ← core ← sweet-demo.js
逆向引用禁止（engine 不依赖 core，core 不依赖 sweet-demo.js）。

---

## 3. 引擎模块职责

| 文件 | 职责 | 关键导出 |
|---|---|---|
| engine/errors.js | 错误码 + ApexError 工厂 | CODES / ApexError |
| engine/grid.js | 6×5 常量 + 索引/坐标 | GRID / getIndex / getRow |
| engine/rng.js | crypto 随机 + 加权抽签 | randomInt / Rng |
| engine/multiplier.js | 倍率状态 Map | MultiplierState |
| engine/evaluator.js | 30 格评估（Pay Anywhere） | evaluate / lookupPayout |
| engine/tumble.js | 移除 + 下落 + 补位 | tumble / removePositions |
| engine/bonus.js | Scatter 派彩 + FS 规则 | BONUS_RULES / scatterPayout |
| engine/payout.js | minor units 金额 | calculatePayout / formatMinor |
| engine/game-engine.js | 完整 spin 串接 | GameEngine |

---

## 4. Core / Provider / Wallet

| 文件 | 职责 |
|---|---|
| core/state.js | 纯函数状态机（idle/spinning/bonus） |
| core/runtime.js | 串接 provider + wallet + state 的 startSpin |
| provider/provider.js | 抽象基类（未实现抛错） |
| provider/local-demo.js | Demo 唯一实现（调 GameEngine） |
| provider/demo-adapter.js | 适配老 ApexDemoProvider 接口（Phase 4 后游戏用这个） |
| provider/server.js | Real 模式预留（fetch + Idempotency-Key） |
| wallet/wallet.js | 钱包基类 |
| wallet/demo-wallet.js | 内存余额（minor units） |

---

## 5. 数学系统

详见 docs/math/MATH_SPEC.md。

| 项 | 值 |
|---|---|
| real RTP | 0.9109（目标 0.88~0.93） |
| demo RTP | 1.5660（目标 1.30~2.50） |
| 参数真值 | src/config/math-profile.js |
| 门禁 | npm run test:rtp（CI 自动） |

---

## 6. Spin 数据流

```
用户点旋转
  → sweet-demo.js spin()
  → ApexDemoProvider.spin({bet, free})
  → demo-adapter.js
      ① MathProfile 取权重 → Rng 生成 30 格
      ② demo 保底注入（pityRate）
      ③ GameEngine.spin() → cascades/bonus/totalMultiplier
      ④ payScale 缩放 + cascades 转 tumbles
      ⑤ 返回老格式（grid/tumbles/totalWin/feature）
  → sweet-demo.js onSpinResult → playTumbleSequence
```

---

## 7. 修改纪律

| 想改 | 改哪 | 附注 |
|---|---|---|
| 数学参数 | config/math-profile.js | 跑 npm run test:rtp:full |
| 赔率值 | config/paytable.locked.js | 需 bump version |
| 符号视觉 | engine/symbols-v2.js | 冻结，不再改 |
| 引擎逻辑 | engine/*.js | 加单测 |
| UI/动画 | js/inline/sweet-demo.js | 附截图 |

**每次改动流程**：备份 → 改一个文件 → node --check → 单测 → commit → push → 看 CI。

---

## 8. 回退路径

Phase 4 切换后如需回退到老引擎：

```bash
sed -i 's|/src/provider/demo-adapter.js|/src/js/core/game-provider-demo.js|' sweet-demo.html
```

老 provider 文件已在 cleanup commit 删除，如需回退从 git 历史恢复：

```bash
git show d272bbd~1:src/js/core/game-provider-demo.js > src/js/core/game-provider-demo.js
```

---

## 9. 相关文档

| 文件 | 内容 |
|---|---|
| docs/math/MATH_SPEC.md | 数学规格（目标 / 参数 / 赔率 / 验证） |
| docs/CACHE.md | 缓存策略 |
| docs/RELEASE_CHECKLIST.md | 发布检查清单 |
| docs/backup-rpo-rto.md | 备份与恢复 |
