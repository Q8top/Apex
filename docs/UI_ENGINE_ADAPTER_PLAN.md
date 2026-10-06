# UI_ENGINE_ADAPTER_PLAN.md

# sweet-demo.js -> Phase 1 MathEngine 接入方案

# Version: 1.0.0-draft
# Date:    2026-10-06
# Status:  Audit complete, implementation pending
# Author:  Architecture Team

---

## 0. 目的

sweet-demo.js 当前拥有独立数学逻辑 (rollGrid / calcWin / spin / RNG)。
Phase 1 Math Engine 是唯一数学权威。

:
  1. 让 sweet-demo.js 通过 Adapter 层消费 MathEngine
  2. 删除 sweet-demo.js 内所有数学逻辑
  3. 保持 UI / DOM / 现有构建链不变

'EOF':::::
  新增 Bomb / Wild / State Machine 等新逻辑
  修改 RNG / Config / MathEngine 内部
  修改 sweet-demo.html 结构

---

## 1. 现状扫描 (Audit 2026-10-06)

### 1.1 文件规模

  src/js/sweet-demo.js    967 行
  src/js/engine/math-engine.js   499 行 (Phase 1)
  src/js/engine/rng.js           115 行 (Phase 1)
  src/js/engine/symbol-system.js  80 行 (Phase 1)

### 1.2 sweet-demo.js 关键函数

  数学逻辑 (需删除):
    prng(n)               : 50   sin-hash RNG
    nextRand()            : 54   种子推进
    rollGrid()            : 122  盘面生成
    calcWin(symbols,bet)  : 210  判奖 + tier 分级

  旋转主流程 (需重写):
    spin(isFree)          : 288  含 8 处数学调用

  UI 渲染 (保留):
    buildReels()          : 91
    paintCell(idx, spec)  : 107
    updateAll()           : 259
    popWinAmount()        : 279

  反馈 / 音效 (保留):
    ensureAudio()         : 408
    playSpinFeedback(win) : 430
    showBigWin(tier,...)  : 471
    updateFreeSpinUI()    : 486

  抽屉 / 历史 (保留):
    loadHistory() / saveHistory() / renderHistory() / openDrawer() / closeDrawer()
    renderPaytable() / openPaytable() / closePaytable()

  绑定 / 初始化:
    bindEvents()          : 807
    getMode() / applyMode() / fitReels() / init()

### 1.3 违规点

  sin-hash:                src/js/sweet-demo.js:50-51
  旧 RTP 引擎依赖:         src/js/sweet-demo.js:130, 343
  免费旋转阈值硬编码:       src/js/sweet-demo.js:348-351
  免费旋转 for + setTimeout 递归: src/js/sweet-demo.js:385-392
  tier 分级重复:           src/js/sweet-demo.js:245-252

### 1.4 现有依赖 (window 全局)

  window.ApexSweetSymbols  : 视觉 (sweet.js 导出, 保留)
  window.ApexSweetRTP      : 旧 RTP (sweet-rtp.js, 应删除)

### 1.5 HTML 引用

  sweet-demo.html 加载顺序:
    /src/js/sweet.js         (符号视觉)
    /src/js/sweet-rtp.js     (旧 RTP, 应删除)
    /src/js/sweet-demo.js    (本文件)

---

## 2. MathEngine 接口对照

### 2.1 Engine 可复用 API

  构造函数:
    new MathEngine(config, { seed, mode })
    createMathEngine(config, { seed, mode })

  主入口:
    playSpin(bet) -> GameResult

  细分 (供 UI 高级用途):
    rollGrid()                      纯随机盘面
    rollHitDecision(overrideRate)   命中决策
    rollGridTargeted(isWin)         靶向盘面
    evaluate(grid, bet)             单次判奖
    tumble(grid, bet)               连消
    playFreeSpins(bet, spinsAwarded) 免费旋转循环
    freeSpinsAward(scatterCount)    触发次数查询
    freeSpinsRetrigger(scatterCount) 追加次数查询

  当前 UI 只需 playSpin(bet) 一个入口。

### 2.2 GameResult 结构 (Engine 输出)

  {
    mode:             'demo' | 'real',
    bet:              number,
    isWinDecision:    boolean,
    initialGrid:      [[id, id, ...], ...],   // 5 x 6
    scatterCount:     number,
    freeSpinsAwarded: number,
    tumble: {
      totalWin:       number,
      tumbleCount:    number,
      history:        [ { step, wins, winIds, totalPayout,
                          totalMult, scatterCount, wildCount,
                          gridBefore } ],
      finalGrid:      [[...]],
      safetyHit:      boolean
    },
    freeSpins: null | {
      spinsPlayed:    number,
      spinsRemaining: number,
      retriggerCount: number,
      totalWin:       number,
      totalBombMult:  number,
      bombList:       [ { spin, step, multiplier } ],
      history:        [ { spin, grid, tumble, bombs,
                          spinMult, spinWin, retrigger? } ]
    },
    baseWin:          number,
    freeSpinsWin:     number,
    totalWin:         number,
    winRatio:         number
  }

### 2.3 UI 消费点 (sweet-demo.js)

  sweet-demo.js 需要从 GameResult 取:

  盘面渲染:
    initialGrid             -> buildReels() + paintCell()
    tumble.history[].winIds -> 高亮中奖 cell
    tumble.finalGrid        -> 最终盘面

  数值显示:
    totalWin                -> 本局中奖金额
    winRatio                -> tier 判定 (供大额中奖特效)

  免费旋转:
    freeSpinsAwarded        -> 触发提示
    freeSpins.history       -> 每次 FS 展示

  历史记录:
    bet / totalWin / scatterCount / tumble.tumbleCount
    -> 写入 state.history

### 2.4 差异分析

  ┌────────────────────────┬────────────────┬──────────────┐
  │ 项                     │ 现有           │ Engine       │
  ├────────────────────────┼────────────────┼──────────────┤
  │ 盘面 grid 结构         │ symbol[] 扁平  │ [[id]...] 2D │
  │ 中奖信息               │ calcWin 返回   │ tumble.wins  │
  │ tier 分级              │ 手写在 calcWin │ 无 (UI 侧算) │
  │ 免费旋转触发           │ 手写阈值       │ freeSpinsAward│
  │ 免费旋转执行           │ 手写 for 递归  │ playFreeSpins│
  │ RNG                    │ sin-hash       │ xorshift128+ │
  │ 命中决策               │ 旧 RTP 引擎    │ rollHitDecision│
  │ 炸弹倍数               │ 无 (旧简化为1.5x)│ playFreeSpins│
  └────────────────────────┴────────────────┴──────────────┘

  结论:
    现有 UI 若改用 Engine, 需处理三处适配:
    (A) grid 结构: 扁平 symbol[] -> 2D id[][]
    (B) tier: UI 侧从 winRatio 计算
    (C) 免费旋转: 交给 Engine, UI 只展示 freeSpins.history

---

## 3. KEEP / REPLACE / DELETE / DEFER

### 3.1 KEEP (保留, 不改)

  UI 渲染:
    buildReels()           DOM 创建 30 个 cell
    paintCell(idx, spec)   渲染单个符号 (改用 id 而非 spec)
    updateAll()            数值显示
    popWinAmount()         中奖金额弹出动画

  反馈 / 音效:
    ensureAudio()          Web Audio 解锁
    playSpinFeedback(win)  音效 + 震动 (参数化)
    showBigWin(tier,...)   大额中奖弹层
    updateFreeSpinUI()     免费旋转徽章

  抽屉 / 历史:
    loadHistory() / saveHistory()
    renderHistory() / openDrawer() / closeDrawer()
    renderPaytable() / openPaytable() / closePaytable()

  绑定 / 初始化:
    bindEvents()  (内部调用会调整)
    getMode() / applyMode()
    fitReels()
    init()  (流程会调整)

### 3.2 REPLACE (替换实现)

  prng(n)                -> 删除, 用 Engine (xorshift128+)
  nextRand()             -> 删除, 用 Engine
  rollGrid()             -> 删除, 用 engine.playSpin() 的 initialGrid
  calcWin(symbols, bet)  -> 删除, 用 engine.playSpin() 的 tumble.wins

  spin(isFree)           -> 重写为 consumeResult()
                            职责: 调用 engine.playSpin(bet)
                                  消费 GameResult
                                  渲染 + 反馈 + 记录

  state.seed             -> 替换为 engineInstance 持有的 RNG
  state 里的 balance/won -> 保留 (UI 本地)

### 3.3 DELETE (完全删除)

  prng()                      : 函数
  nextRand()                  : 函数
  rollGrid()                  : 函数 (122 行起)
  calcWin()                   : 函数 (210 行起)
  spin() 里的数学部分         : 308 / 316 行
  spin() 里的免费旋转硬编码   : 348-392 行
  spin() 里的 tier 判定       : 复用 Engine (UI 侧算或使用 winRatio)

  window.ApexSweetRTP 依赖    : 130 / 343 行
  sweet-rtp.js 引用           : sweet-demo.html 中 script 标签

### 3.4 DEFER (本次不做)

  Bomb / Bomb Explosion       : Phase 2
  Wild 替代                    : Phase 2
  State Machine               : Phase 2
  Combo / Fever               : Phase 2
  Bomb 累加逻辑修复           : Phase 2 (已知 TODO)
  多标签页 BroadcastChannel  : 未来
  真钱架构                     : 未来阶段

---

## 4. Adapter 接口设计

### 4.1 设计原则

  1. UI 不直接 import MathEngine 内部方法
     只通过 Adapter 调用
  2. Adapter 无业务状态
     状态由 UI 层 (state 对象) 持有
  3. Adapter 无 DOM 依赖
     纯数据转换 + Engine 调用封装
  4. Adapter 可被未来真钱替换
     真钱时同一 UI 调 ServerAdapter, 接口相同

### 4.2 Adapter 接口 (src/js/ui/engine-adapter.js)

  export class EngineAdapter {
    // 构造: 提供 config + 初始 seed/mode
    constructor(config, opts)

    // 主入口: 执行一局
    // 返回 { raw: GameResult, view: ViewModel }
    playSpin(bet)

    // 切换模式 (demo/real)
    setMode(mode)

    // 重置 seed (新会话)
    reseed(seed)

    // 暴露只读 config
    getConfig()
  }

### 4.3 ViewModel (UI 只消费这个)

  {
    // 盘面 (2D id[][])
    grid:          [[id, id, ...], ...],
    finalGrid:     [[id, id, ...], ...],

    // 中奖
    totalWin:      number,
    winRatio:      number,
    tier:          'none' | 'small' | 'nice' | 'big' | 'mega' | 'epic',
    winIds:        [id, ...],
    scatterCount:  number,

    // 连消
    tumbleCount:   number,
    tumbleSteps:   [ { step, winIds, totalPayout }, ... ],

    // 免费旋转
    freeSpinsAwarded: number,
    freeSpins:     null | {
      spinsPlayed:  number,
      totalWin:     number,
      history:      [ { spin, grid, spinWin, spinMult }, ... ]
    },

    // 元信息
    bet:           number,
    mode:          'demo' | 'real'
  }

### 4.4 Adapter 内部职责

  1. 调用 engine.playSpin(bet)
  2. 把 GameResult 转换成 ViewModel
     - 从 winRatio 算 tier (阈值从 config.bigWinThresholds 读)
     - 从 tumble.history 提取 winIds 供高亮
     - 从 tumble.history 提取每步供动画
  3. 不修改 GameResult
  4. 不修改 UI state

### 4.5 tier 计算 (UI 侧)

  function computeTier(ratio, thresholds) {
    if (ratio <= 0) return 'none';
    if (ratio < thresholds.big) return 'small';
    if (ratio < thresholds.mega) return 'nice';
    if (ratio < thresholds.super) return 'big';
    if (ratio < thresholds.epic) return 'mega';
    return 'epic';
  }

  阈值来自 config.bigWinThresholds:
    big:   10
    mega:  30
    super: 60
    epic:  150

---

## 5. 实施顺序 (8 步)

  每步独立 commit, 独立测试.

  Step 1: 新建 src/js/ui/ 目录
    - mkdir src/js/ui

  Step 2: 写 src/js/ui/engine-adapter.js
    - EngineAdapter 类
    - ViewModel 转换
    - computeTier 工具
    - 不改 sweet-demo.js

  Step 3: 写 tests/ui/engine-adapter.test.js
    - ViewModel 结构测试
    - tier 计算测试
    - GameResult -> ViewModel 无损转换测试
    - 不改 sweet-demo.js

  Step 4: 修改 sweet-demo.html
    - 删除 <script src="/src/js/sweet-rtp.js">
    - 添加 <script src="/src/js/engine/rng.js" type="module">
    - 添加 <script src="/src/js/engine/symbol-system.js" type="module">
    - 添加 <script src="/src/js/engine/math-engine.js" type="module">
    - 添加 <script src="/src/js/ui/engine-adapter.js" type="module">

  Step 5: 重写 sweet-demo.js 的 spin 函数
    - spin(isFree) -> consumeResult(bet)
    - 内部调用 adapter.playSpin(bet)
    - 消费 ViewModel 渲染
    - 删除 rollGrid / calcWin / prng / nextRand

  Step 6: 更新 init()
    - 创建 adapter 实例
    - 用 adapter 生成初始盘面
    - 不再依赖 symbolPool (由 adapter 内部处理)

  Step 7: 回归测试 + 手动测试
    - node tests/math/*.test.js
    - node tests/ui/*.test.js
    - 浏览器实际 spin 验证

  Step 8: 清理
    - 删除 src/js/sweet-rtp.js (旧 RTP)
    - 删除 sweet-demo.html 中 sweet-rtp.js 引用
    - 更新 docs/ARCHITECTURE.md 记录接入完成

---

## 6. 风险

  R1: UI 与 Engine 的 grid 结构不同
      风险: 低. Adapter 负责转换.
      缓解: ViewModel 输出 2D id[][], UI 用相同循环.

  R2: 免费旋转动画时序
      风险: 中. Engine 返回整批 FS 结果, 但 UI 需要逐个播放.
      缓解: 遍历 freeSpins.history, 逐个 setTimeout 展示.
      说明: 这不是 State Machine, 只是现有 setTimeout 的编排.

  R3: 历史记录格式变化
      风险: 低. 旧 state.history 结构保留.
      缓解: 用 ViewModel 字段填充.

  R4: 现有 sweet-demo.js 有未提交改动
      风险: 中. 两套改动可能冲突.
      缓解: 先 stash / 单独 commit 现有改动, 再开始接入.
      当前: 有 M src/js/sweet-demo.js 未提交.

  R5: 模式切换 (demo/real)
      风险: 低. Adapter 有 setMode.
      缓解: 切换时重新创建 engine 实例 (新 seed).

  R6: 未实现功能被误加
      风险: 中. 接入时容易顺手加 Bomb / Wild.
      缓解: 本阶段只做等效替换, 不添加任何新逻辑.

---

## 7. 验收标准

  A1: sweet-demo.js 无任何数学计算
      grep 'rollGrid\|calcWin\|nextRand\|prng' 应只出现在注释

  A2: sweet-demo.js 无 sin-hash
      grep '12.9898\|43758' 应为空

  A3: sweet-demo.js 无旧 RTP 依赖
      grep 'ApexSweetRTP' 应为空

  A4: 免费旋转阈值由 config 提供
      不再硬编码 4->10 / 5->12 / 6->15

  A5: ViewModel 测试全通过
      tests/ui/engine-adapter.test.js

  A6: 现有测试无回归
      node tests/math/rng.test.js            36 PASS
      node tests/math/math-engine.test.js    3152 PASS
      node tests/math/replay.test.js         78 PASS
      node tests/ui/engine-adapter.test.js   N PASS

  A7: 浏览器手动验证
      - 点击旋转, 盘面正确显示
      - 中奖时 winIds 高亮
      - 免费旋转触发时进入循环
      - 历史记录正确累加
      - 大额中奖弹层正确弹出

  A8: 现有构建链不受影响
      bash scripts/build-dist.sh 成功
      bash scripts/check-cache-refs.sh 通过

---

## 8. 附录

### 8.1 相关文档

  docs/ARCHITECTURE.md           模块分层 (见第 2.5 节)
  docs/MATH_MODEL.md             数学模型与校准
  docs/PROJECT_AUDIT.md          仓库审计
  docs/CACHE.md                  缓存策略

### 8.2 相关代码

  src/js/engine/rng.js           xorshift128+
  src/js/engine/symbol-system.js 符号池
  src/js/engine/math-engine.js   数学引擎
  src/js/engine/replay.js        Replay 系统
  src/js/sweet.js                视觉 (SVG 生成器, 保留)
  src/js/sweet-demo.js           待接入

### 8.3 变更日志

  2026-10-06  draft
  - 完成 sweet-demo.js 审计
  - 完成 MathEngine 接口对照
  - 完成 KEEP/REPLACE/DELETE/DEFER 分类
  - 完成 Adapter 接口设计
  - 完成实施顺序
  - 待实现

---

## END OF UI_ENGINE_ADAPTER_PLAN.md
