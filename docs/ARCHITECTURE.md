# ARCHITECTURE.md

# Apex Candy Tumble - System Architecture

# Version: 1.0.0-draft
# Date:    2026-10-06
# Status:  Phase 1 (Math Foundation) 进行中
# Author:  Architecture Team

---

## 0. 文档目的

Apex Candy Tumble 的整体架构、模块分层、依赖方向、
#


:
  MATH_MODEL.md       数学模型与校准
  CONFIG_SCHEMA.md    配置详解
  PROJECT_AUDIT.md    当前仓库审计
  CACHE.md            缓存与部署约束

---

## 1. 核心原则

### 1.1 数学优先

  Math -> Simulation -> Core Gameplay -> State Machine
       -> Animation -> UI/UX -> Audio -> Haptics
       -> Meta -> Backend/Production

. 不允许为了"好看"而修改数学.

### 1.2 分层依赖单向

  Config           (无依赖)
    |
    v
  RNG              (无依赖)
    |
    v
  SymbolSystem     (依赖 Config)
    |
    v
  MathEngine       (依赖 Config + RNG + SymbolSystem)
    |
    v
  Simulator        (依赖 MathEngine, 仅 CLI / 测试)
  Replay           (依赖 MathEngine + 记录文件)

UI / Animation / Audio 依赖 MathEngine 输出, 但不能反向修改数学.

### 1.3 Math Engine 必须

  - UI-independent
  - DOM-independent
  - Browser-independent
  - Node 可直接运行
  - deterministic (same seed + same config = same result)
  - seedable
  - config-driven
  - replayable
  - testable

### 1.4 当前约束 (Path C)

  不引入 Vite / Webpack / Rollup / Parcel
  使用原生 ES Modules
  保留 Cloudflare Pages + Functions + D1 部署链
  保留 scripts/build-dist.sh + hash-assets.mjs + _headers
  保留 GitHub Actions ci.yml + deploy.yml

---

## 2. 分层结构

### 2.1 层 0: Config (唯一数学真源)

  config/game.json        所有数学参数
  config/schema.json      JSON Schema 校验规则
  scripts/validate-config.mjs  零依赖校验器

  内容:
    version / mathVersion / configVersion
    game (grid / winRule)
    modes (demo / real)
    symbols (13 个)
    freeSpins (trigger / retrigger / bomb)
    tumble (safety / combo)
    bigWinThresholds

  禁止:
    在 JS 源码中硬编码数学参数
    使用与 config 不一致的 fallback 数值

### 2.2 层 1: RNG

  src/js/engine/rng.js

  算法: xorshift128+ (Vigna 2016)
  种子派生: SplitMix64

  API:
    new RNG(seed)
    rng.reseed(seed)
    rng.next()        -> BigInt (64 位)
    rng.nextFloat()   -> Number [0, 1)
    rng.int(min, max) -> Number (inclusive)
    rng.pickWeighted(items, weights) -> item
    rng.shuffle(arr)  -> arr (in-place)

  工厂:
    createRNG(seed)
    seedFromString(str)   FNV-1a 派生 (供 Replay 用)

  禁止:
    Math.random
    LCG
    sin-hash
    Date.now 作为数学种子

### 2.3 层 2: SymbolSystem

  src/js/engine/symbol-system.js

  职责:
    从 config.symbols 加载符号池
    按 type 分类 (base / high / scatter / wild)
    提供加权抽取 (pickNormal / pickBase / pickHigh)
    提供 payoutFor(id, count) 查询
    提供 isScatter / isWild / isSpecial 判定

  无状态, 无副作用 (除构造函数一次性初始化)

### 2.4 层 3: MathEngine

  src/js/engine/math-engine.js

  构造:
    new MathEngine(config, { seed | rng, mode })

  公开 API:
    emptyGrid()                     -> grid
    rollGrid()                      -> grid (纯随机)
    rollHitDecision(overrideRate)   -> { isWin }
    getFreeSpinHitRate()            -> Number
    rollGridTargeted(isWin)         -> grid (靶向)
    evaluate(grid, bet)             -> { wins, totalPayout, ... }
    removeWins(grid, winIds)        -> removed
    dropAndRefill(grid)             -> grid
    tumble(grid, bet)               -> { totalWin, tumbleCount, ... }
    rollBombMultiplier()            -> Number
    accumulateBombs(tumbleHistory)  -> { list, accumulated }
    freeSpinsAward(scatterCount)    -> Number
    freeSpinsRetrigger(scatterCount)-> Number
    playFreeSpins(bet, spinsAwarded)-> { ... }
    playSpin(bet)                   -> { ... 完整一局 }

  无 DOM, 无网络, 无存储
  给定 seed + config, 输出确定性

### 2.5 层 4: 工具 (Simulator / Analyze / Replay)

  scripts/simulate.js        RTP 模拟器 (流式统计)
  scripts/analyze-rtp.js     RTP 分解诊断
  scripts/replay.js          (待建, Phase 1 Step 6)

  仅 Node 端运行, 不进入 dist/
  依赖 MathEngine, 不反向修改

---

## 3. 层 5: UI / Presentation (Phase 3 才启动)

### 3.1 现有 Prototype (待重构)

  sweet.html            详情页 (132 行)
  sweet-demo.html       游戏页 (142 行)
  src/js/sweet.js       详情页 + SVG 生成器 (1021 行)
  src/js/sweet-demo.js  游戏页 (967 行)
  src/css/sweet.css     774 行
  src/css/sweet-demo.css 734 行

  问题:
    数学逻辑与 UI 混杂 (sweet-demo.js 的 rollGrid / calcWin / spin)
    RNG 使用 sin-hash (违规)
    SYMBOLS 数组硬编码在 sweet.js

  处理策略:
    Phase 3 时, sweet-demo.js 将改为调用 window.ApexMathEngine 的封装
    sweet.js 的 SVG 生成器保留 (视觉资产)
    数学逻辑全部下线

### 3.2 未来 UI 层结构 (Phase 3)

  src/js/ui/
    main.js              入口
    reel-renderer.js     6x5 grid 渲染
    tumble-animation.js  连消动画
    big-win.js           大额中奖表现
    drawer.js            记录/赔付抽屉
    audio.js             Web Audio 合成
    haptics.js           navigator.vibrate

  UI 只消费 MathEngine 的 GameResult
  禁止 UI 修改 MathEngine 状态

### 3.3 GameResult 结构 (UI 输入契约)

  {
    mode, bet,
    isWinDecision,
    initialGrid:       [[id, id, ...], ...],
    scatterCount,
    freeSpinsAwarded,
    tumble: {
      totalWin, tumbleCount, history[], finalGrid, safetyHit
    },
    freeSpins: {
      spinsPlayed, spinsRemaining, retriggerCount,
      totalWin, totalBombMult, bombList[], history[]
    } | null,
    baseWin, freeSpinsWin, totalWin,## winRatio
  }

---

 4. 层 6: Cloudflare 部署链 (现有, 保留)

### 4.1 组件

  Cloudflare Pages         静态托管 + clean URL
  Cloudflare Functions     边缘 API (登录/注册/会话)
  D1 (apex-db)             SQLite (users / sessions / logs / audit_logs)
  GitHub Actions            CI + deploy + daily-backup
 见 wrangler.toml             build项目配置

### 4.2 构建流程

  git push main
    |
    v
  GitHub Actions: ci.yml
    |-- npm ci
    |-- bash scripts/syntax-check.sh
    |-- npm run test:unit
    |-- node tests/security-scan.js
    +-- npm run test:smoke
    |
    v
  GitHub Actions: deploy.yml
    |-- npm ci
    |-- bash scripts/migrate.sh --remote
    |-- bash scripts/build-dist.sh      -> dist/
    |-- wrangler pages deploy dist
    |-- post-deploy health check
    +-- purge CDN cache
    |
    v
  Cloudflare Pages (apextop.cc.cd)

### 4.3 缓存策略 (见 CACHE.md)

  HTML:        no-store (含 clean URL)
  /src/*:      immutable (hash 由 hash-assets.mjs 生成)
  /fonts/*:    immutable
  /assets/*:   immutable
  sw.js:       no-cache (自杀版)

### 4.4 构建产物约束

  dist/ 只含:
    *.html (白名单: -dist.sh 第 18 行)
    静态资源 (manifest / robots / sitemap / favicon)
    图片 (*.webp / *.jpeg / *.jpg / *.png)
    _headers / _redirects / _routes.json
    src/ (整个目录, 含 config/)
    fonts/ / assets/ / i18n/
    sw.js

  禁止进 dist/:
    wrangler.toml / package.json / .env / tests / functions
    migrations / scripts / docs / backups / .git / .github

### 4.5 Engine 部署影响

  config/game.json 会随 src/ 进入 dist/, 供 UI 端加载
  engine/*.js 同理, 作为 ES Module 被 UI 引用
  Simulator / analyze-rtp / replay 不进入 dist/ (scripts/ 被排除)

---

## 5. 数据流

### 5.1 单局 Spin (Math 层)

  Client 调用
    |
    v
  MathEngine.playSpin(bet)
    |
    |-- rollHitDecision()          [RNG]
    |-- rollGridTargeted(isWin)    [SymbolSystem + RNG]
    |-- tumble(grid, bet)          [递归 evaluate + remove + drop]
    |     |-- evaluate()
    |     |-- removeWins()
    |     +-- dropAndRefill()      [RNG]
    |
    |-- evaluate(initialGrid) -> scatterCount
    |-- freeSpinsAward(scatterCount)
    |-- if awarded > 0:
    |     playFreeSpins(bet, awarded)
    |       |-- per spin:
    |       |     rollHitDecision(freeSpinHitRate)
    |       |     rollGridTargeted()
    |       |     tumble()
    |       |     accumulateBombs()    [RNG]
    |       |     spinWin = totalWin * (1 + bombAcc/10)
    |       +-- retrigger 检查
    |
    +-- return GameResult

### 5.2 Simulator 数据流

  CLI args (mode, spins, seed, bet)
    |
    v
  createMathEngine(config, { seed, mode })
    |
    v
  for i in 0..spins:
    spin = engine.playSpin(bet)
    StreamStats.add(spin.totalWin / bet)
    accumulators++
    |
    v
  StreamStats 输出:
    mean (精确 Welford)
    variance (精确 Welford)
    min / max (精确)
    P50..P99.9 (histogram 近似)
    |
    v
  console.log 报告 + exit code

### 5.3 Replay 数据流 (未来 Phase 1 Step 6)

  Spin 记录 (JSONL)
    |
    |-- spinId
    |-- roundId
    |-- seed
    |-- configVersion / mathVersion
    |-- mode
    |-- bet
    |-- result (完整 GameResult)
    |
    v
  node scripts/replay.js --spin <id>
    |
    v
  createMathEngine(config, { seed, mode })
    |
    v
  engine.playSpin(bet)
    |
    v
  与记录的 result 逐字段比对
    |
    v
  PASS / FAIL

---

## 6. 未来真钱架构边界 (Interface / Mock only)

### 6.1 当前状态

  当前项目为 Demo / Simulation 环境
  不连接真实支付
  不实现真实资金结算
  不部署真钱 Game Server
  不实现 KYC / AML / Geolocation 强制系统

### 6.2 未来目标架构 (仅供参考)

  Client
    |
    v
  API (HTTPS / JSON)
    |
    v
  Game Server (authoritative)
    |-- Math Engine (同算法, 服务端版本)
    |-- RNG (CSPRNG, 服务端)
    |-- Result
    |
    +-> Wallet Service (authoritative balance)
    +-> Ledger (immutable entries)
    +-> Audit / Logs
    +-> Replay / Verification

  与当前 Client-side Math Engine 的区别:
    - 真钱结果由服务端决定
    - Client 只消费 Result 与动画
    - 客户端不能修改余额 / 结果 / seed
    - 需要 idempotency key 防止重复扣款

### 6.3 当前架构为未来预留的能力

  已完成:
    确定性 Math Engine (同 seed 同结果)
    GameResult 结构稳定
    Config 版本化 (configVersion / mathVersion)
    Replay 概念设计 (待实现)

  未实现 (本次不做):
    API Contract 文档 (docs/API_CONTRACT.md)
    MockWallet / MockLedger
    IdempotencyKey 模型
    Server-authoritative 接口
    KYC / AML / 地理限制

### 6.4 强制约束

  真钱模式下:
    Client 不能决定结果
    Client 不能决定 payout
    Client 不能修改余额
    Client 不能提交任意 win
    Client 不能选择 RNG seed
    Client 不能覆盖 config

  以上为未来阶段的硬性约束. 当前阶段不实现, 但架构不得阻碍.

---

## 7. 模块清单

### 7.1 Engine 模块

  src/js/engine/rng.js
    导出: RNG, createRNG, seedFromString
    行数: 115
    依赖: 无

  src/js/engine/symbol-system.js
    导出: SymbolSystem, createSymbolSystem
    行数: 80
    依赖: 无 (仅消费 config 对象)

  src/js/engine/math-engine.js
    导出: MathEngine, createMathEngine, createMathEngineFromSeed
    行数: 499
    依赖: rng.js, symbol-system.js

### 7.2 工具模块

  scripts/validate-config.mjs
    零依赖 JSON Schema 极简校验
    行数: 181

  scripts/simulate.js
    流式 RTP 模拟器
    行数: 329

  scripts/analyze-rtp.js
    RTP 分解诊断
    行数: 133

### 7.3 测试模块

  tests/math/rng.test.js
    36 项测试
    行数: 247

  tests/math/math-engine.test.js
    3152 项测试
    行数: 345

### 7.4 配置文件

  config/game.json        当前 v1.0.0
  config/schema.json      Draft-07

---

## 8. 依赖规则

### 8.1 允许

  Config -> 无
  RNG -> 无
  SymbolSystem -> Config (输入参数)
  MathEngine -> Config + RNG + SymbolSystem
  Simulator -> MathEngine
  Analyze -> MathEngine
  UI (未来) -> MathEngine + Config
  Replay (未来) -> MathEngine + 记录文件

### 8.2 禁止

  MathEngine 引用 UI / DOM / window / document
  MathEngine 使用 Math.random / Date.now / LCG / sin-hash
  RNG 引用 Config / SymbolSystem / MathEngine
  SymbolSystem 引用 RNG / MathEngine
  任何 Engine 模块引用 scripts/ 或 tests/
  任何 Engine 模块依赖第三方 npm 包

### 8.3 ES Module 规范

  全部模块使用 import / export
  全部路径相对 (无 alias)
  顶层无副作用 (除模块初始化)
  纯函数优先

---

## 9. 版本策略

### 9.1 版本字段

  config/game.json:
    version         整体版本 (semver)
    mathVersion     数学变化时递增
    configVersion   配置结构变化时递增

  buildVersion:
    由 git commit hash 标识 (无独立字段)

### 9.2 递增规则

  数学逻辑变化 (payout / hitRate / 概率)
    -> mathVersion++

  配置结构变化 (新增字段 / 字段语义变化)
    -> configVersion++

  不影响数学的其他变化
    -> version++ (patch)

  破坏性 API 变化
    -> version++ (major)

### 9.3 当前版本

  version:        1.0.0
  mathVersion:    1.0.0
  configVersion:  1.0.0

---

## 10. 变更日志

  2026-10-06  初稿
  - 创建 ARCHITECTURE.md
  - 记录分层 / 依赖 / 部署 / 数据流
  - 记录未来真钱架构边界 (Interface only)
  - 记录版本策略

  与本文档相关的其他提交:
    a5d9aab  RNG abstraction (xorshift128+)
    111759b  Math Engine
    f768624  Simulator
    23bcb1f  RTP calibration via freeSpinHitRate
    1f6bb09  MATH_MODEL.md
    8f5258c  Simulator streaming fix

---

## END OF ARCHITECTURE.md
