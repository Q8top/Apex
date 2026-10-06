# PROJECT_AUDIT.md

# Apex Candy Tumble - Repository Audit

# 审计日期: 2026-10-06

# 审计范围: 只读, 未修改任何源文件

# 审计触发: FINAL MASTER DEVELOPMENT SPECIFICATION

---

## 0. 最高结论

'EOF''EOF''EOF': 项目可以作为起点, 但不能直接继续加功能.

:

- 现有代码是 Prototype 质量
- 存在 3 处 RNG 违规 + 1 处动态 RTP 违规 (规范 S.35/S.36 明令禁止)
- 数学参数全部硬编码在 sweet.js 里的字符串字段 (m8:'x0.2'), 无法被数学引擎消费
- 零游戏数学测试
- 但: 部署链, 缓存链, 云函数, CI 全部健康, 可作为 Phase 1 的稳定地基

: 进入 Path C, Phase 1 (Math Foundation).
  border-bottom: 1px solid rgba(255,255,255,.05); Vite. 保留现有 build/deploy chain. RNG 换 xorshift128+.

---

## 1. 文件结构

### 1.1 顶层

1.2 src/ 树

src/css/   9 个样式文件, 全部花括号平衡

src/js/
  apiClient.js  captcha.v2.js  passkey.js  passwordPolicy.js
  sweet.js          (1021 行, 详情页 + 符号生成器)
  sweet-demo.js     (967 行,  游戏页)
  sweet-rtp.js      (135 行,  LCG RTP 引擎, 违规)
  inline/  block-01 ~ block-10 + apex-app.js + 其他

1.3 游戏相关文件清单

  sweet.html              132 行   详情页
  sweet-demo.html         142 行   游戏页, 含 2 个重复 ID
  src/js/sweet.js         1021 行  详情页逻辑 + 12+1 符号 SVG 生成器
  src/js/sweet-demo.js    967 行   游戏引擎 + 记录/赔付抽屉
  src/js/sweet-rtp.js     135 行   RTP 引擎, LCG, 违规
  src/css/sweet.css       774 行   详情页样式, 208 花括号平衡
  src/css/sweet-demo.css  734 行   游戏页样式, 138 花括号平衡

---

2. 当前 Build / Deploy Chain

git push main
  -> GitHub Actions ci.yml
       npm ci
       bash scripts/syntax-check.sh
       npm run test:unit
       node tests/security-scan.js
       npm run test:smoke
  -> GitHub Actions deploy.yml
       npm ci
       bash scripts/migrate.sh --remote
       bash scripts/build-dist.sh -> dist/
       wrangler pages deploy dist
       post-deploy health check
       purge CDN cache
  -> Cloudflare Pages apextop.cc.cd

2.1 关键构建机制

  scripts/build-dist.sh        显式白名单拷贝到 dist/
  scripts/hash-assets.mjs      扫 dist/*.html, 加 ?v=sha256
  scripts/check-cache-refs.sh  CI 自检所有 /src/ 引用
  _headers                     HTML no-store; /src/* immutable; 45 条

2.2 评估

  可保留: 整个链健康, 无冗余, 无 build tool 依赖
  符合 Path C: package.json 已 type: module
  注意: build-dist.sh:18 白名单有 3 个不存在的文件
        home.html, olympus.html, sugar.html, 死条目

---

3. RNG 使用点, 严重违规

3.1 违规清单

  src/js/sweet-rtp.js:46-51    LCG        规范 S.36 明令禁止    DELETE
  src/js/sweet.js:8            sin-hash   规范 S.36 明令禁止    REWRITE
  src/js/sweet-demo.js:51      sin-hash   规范 S.36 明令禁止    REWRITE

3.2 具体代码

  sweet-rtp.js:46-51
    var seed = (Date.now() % 2147483647) | 1;
    function rand() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;   <- LCG
      return seed / 0x7fffffff;
    }

  sweet.js:8
    function seeded(n) {
      var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

  sweet-demo.js:50-51
    function prng(n) {
      var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

3.3 影响

  - 可被逆向, 玩家可预测下一个结果
  - 分布不均匀, 数学期望不可靠
  - 无 Replay 能力, seed 依赖 Date.now()

---

4. 动态 RTP 违规, 严重

4.1 违规点

  src/js/sweet-rtp.js:70-76

    function dynamicHit(mode) {
      var cfg = CONFIG[mode], s = running[mode];
      if (s.spins < 20) return cfg.hitRate;
      var actual = s.bet > 0 ? (s.win / s.bet) : 0;
      var diff = actual - cfg.targetRTP;
      var adj = Math.max(-0.12, Math.min(0.12, -diff * 0.25));
      return Math.max(0.05, Math.min(0.85, cfg.hitRate + adj));
    }

4.2 规范冲突

  规范 S.35 明确禁止:
    玩家连续输钱 -> 提高中奖率
    玩家赢钱太多 -> 降低中奖率
    根据玩家历史调整下一次 Spin 概率

4.3 处理

  DELETE sweet-rtp.js 全文件
  RTP 控制改为 Config 参数 + 加权抽取 + 静态数学模型
  由 Simulator 校准, 而非运行时反馈修正

---

5. Math / Payout 硬编码

5.1 硬编码位置

  src/js/sweet.js:124-136
  13 个符号定义

  示例:
    { id: 'banana', name: '香蕉', type: 'base', shape: 'banana',
      m8: 'x0.2', m10: 'x0.5', m12: 'x2', ... }

5.2 问题

  1. 字符串形式 x0.2, 数学引擎无法直接消费
  2. 散落在 UI 层, sweet.js 同时管渲染和数学
  3. 无 weight 字段, 无法做加权抽取
  4. 无 tier, 无法按等级分组

5.3 处理

  REWRITE: 拆到 config/game.json

  目标格式:
    {
      "id": "banana",
      "name": "香蕉",
      "type": "base",
      "weight": 22,
      "payout": { "8": 0.2, "10": 0.5, "12": 2.0 }
    }

  sweet.js 只保留 SVG 渲染职责

---

6. Duplicate HTML IDs

  sweet-demo.html:99    id="demo-bigwin"    重复
  sweet-demo.html:102   id="demo-bigwin"    重复

document.getElementById 只返回第一个, 第二个成为孤儿 DOM
  不致命, showBigWin 里 if (!el) 会兜底创建
  但违反规范 S.97

: REWRITE, 删除重复的第 102 行

---

7. CSS 异常

  文件                      {      }      平衡
  announcements.css        30     30      OK
  apex-app.css            182    182      OK
  apex-boot.css             3      3      OK
  main.css                408    408      OK
  privacy.css              25     25      OK
  status.css               33     33      OK
  sweet-demo.css          138    138      OK
  sweet.css               208    208      OK
  terms.css                21     21      OK

OK: 全部平衡, 无异常

---

8. Broken References

8.1 假阳性, 无需处理

  404.html  -> /privacy /status /terms
  index.html -> /privacy /status /terms

  上述 6 条是 CF clean URL
  /privacy 会 308 到 /privacy.html, 实际不断

8.2 真断链

  无

8.3 死代码

  scripts/slot-rtp-sim.mjs    引用不存在的 src/js/slot/slot-config.js
  scripts/apex-rtp-sim.mjs    引用不存在的 src/js/slot/slot-engine.js 等

: DELETE, 两个脚本是历史遗留

---

9. Console Error / Warn

  分布:

    passkey.js                         7  (WebAuthn 兼容性检测, 预期)
    sweet-demo.js                      1  (ApexSweetSymbols 未加载时 error)
    apiClient.js                       1
    captcha.v2.js                      1
    block-01 ~ block-10                各 1
    event-bindings.js                  1

1: 无 game 页 console 污染, 符合规范

---

10. 当前测试覆盖

10.1 现有测试

  api-smoke.test.js         API 冒烟
  cbor.test.js              CBOR 编码
  csrf-middleware.test.js   CSRF
  json-shape.test.js        JSON 结构
  password-policy.test.js   密码策略
  password-length.test.js   密码长度
  response-headers.test.js  响应头
  security-scan.js          全项目安全扫描
  webauthn.test.js          WebAuthn

10.2 缺失, 关键

  零游戏数学测试, RTP / Hit Rate / Tumble / Free Spins / Bomb
  零 RNG 测试
  零 Replay 测试
  零 Config 校验

10.3 处理

  Phase 1 必须新建 tests/math/ 目录, 含:
    rng.test.js
    math-engine.test.js
    tumble.test.js
    freespin.test.js
    bomb.test.js
    replay.test.js
    config-schema.test.js

---

11. 当前 Cloudflare 配置

  project name         apex
  build output         dist
  compatibility_date   2026-09-01
  nodejs_compat        yes
  D1 binding           apex_db -> apex-db, id 1b144350
  ENVIRONMENT          production
  PUBLIC_BASE_URL      https://apextop.cc.cd
  _headers 条目        45
  _redirects 条目      45

  width: 34px; 完整, 无缺失

---

12. RNG / Replay 能力

  需求              现状             结论
  Seedable          no, Date.now()   必须重写
  Deterministic     no               必须重写
  Replay 一致        no               必须新建
  xorshift128+      no               必须新建
  CSPRNG 兼容接口    no               必须新建

---

13. 性能 / 体积基线

13.1 游戏页体积

  sweet.js           ~50 KB  (未压缩)
  sweet-demo.js      ~34 KB
  sweet-rtp.js       ~4.5 KB
  sweet.css          ~28 KB
  sweet-demo.css     ~21 KB
  sweet-demo.html    ~7.5 KB
  -------------------------
  总计               ~145 KB

13.2 已知瓶颈

  paintCell() 每次 innerHTML='' 后 appendChild, 强制 reflow
  showBigWin() 每次 innerHTML 重建, 产生垃圾
  fitReels() 使用 getComputedStyle + clientWidth, 每帧强制 layout

Phase 3 需优化

---

14. KEEP / REWRITE / DELETE / DEFER 清单

14.1 KEEP, 保留

  scripts/build-dist.sh                部署链核心
  scripts/hash-assets.mjs              缓存 hash 机制
  scripts/check-cache-refs.sh          CI 自检
  _headers / _redirects                CF 配置
  wrangler.toml                        D1 + vars
  functions/*                          云函数全保留
  migrations/*                         D1 schema
  sweet.js 的 SVG 生成器                 12+1 符号视觉资产
    pHeart pStar pCircle pDrop pDiamond
    pFlower pRing pLolli pBanana pGrape
    pWatermelon pCherry pWild
    + buildSymbolArt 分派器
  sweet-demo.css 的 .demo-drawer-* 样式   抽屉样式
  sweet-demo.js 的 Toast / Drawer / Paytable UI 逻辑

14.2 REWRITE, 重写

  sweet-rtp.js                                LCG + 动态 RTP, 全违规
  sweet-demo.js 的 rollGrid / calcWin / spin   数学逻辑散落
  sweet.js 的 SYMBOLS 数组                     数学参数迁到 config
  sweet.js 的 seeded 函数                      sin-hash
  sweet-demo.js 的 prng / nextRand             sin-hash
  sweet-demo.html:102                          重复 demo-bigwin ID

14.3 DELETE, 删除

  scripts/slot-rtp-sim.mjs        死代码
  scripts/apex-rtp-sim.mjs        死代码
  根目录 47+ 个 .audit-backup-*    污染
  .audit-fix/                     污染
  .audit-1791185051/              污染
  .audit-1791185429/              污染

14.4 DEFER, 推迟

  sw.js                               Phase 3 末确认设备升级后再删
  paintCell / fitReels 优化            Phase 3
  showBigWin DOM 重建优化              Phase 3
  docs/p1-math-acceptance.md          Phase 1 后评估

---

15. 与规范的冲突点

  规范 S.36 RNG 必须 xorshift128+    现状 LCG + sin-hash        重写
  规范 S.35 禁止动态 RTP              dynamicHit 存在             删除
  规范 S.41 禁止硬编码数学            SYMBOLS 内嵌 payout         迁移
  规范 S.39 Config 唯一数学源         无 config/ 目录             新建
  规范 S.92 Layer 1 完整前不做 Meta    无 Layer 1 数学            Phase 1 后
  规范 S.97 禁止重复 HTML ID          demo-bigwin 两次            修复
  规范 S.98 开发顺序                  已按 Path C 排序            通过
  规范 S.9 构建工具                   现有链无 Vite               符合 Path C

---

16. 风险评估

  RNG 可预测                高    任何严肃玩家可逆向
  动态 RTP 违规             高    未来接真钱, 法律风险
  数学逻辑散落              中    修改任何参数需改 sweet.js
  无数学测试                中    无法验证 RTP 是否达标
  47+ 备份污染              低    已 gitignore, 但视觉污染
  死脚本                    低    不参与 CI
  CSS 全平衡                -     无
  部署链健康                -     无

---

17. Phase 1 入口建议

17.1 前置动作, 不改源码, 仅新增/删除

  rm -rf .audit-* .audit-fix/
  rm scripts/slot-rtp-sim.mjs scripts/apex-rtp-sim.mjs
  mkdir -p config/environments
  mkdir -p src/js/engine
  mkdir -p tests/math

17.2 Phase 1 顺序

  1. 写 config/game.json + config/schema.json
  2. 写 src/js/engine/rng.js, xorshift128+
  3. 写 src/js/engine/math-engine.js, 纯函数
  4. 写 src/js/engine/symbol-system.js, 从 config 读
  5. 写 src/js/engine/tumble-engine.js
  6. 写 src/js/engine/freespin-engine.js
  7. 写 src/js/engine/bomb-engine.js
  8. 写 scripts/simulate.js
  9. 跑 10M Demo + 3x100M Real
  10. 验收通过 -> Phase 2

17.3 Phase 1 硬约束

  不引入 Vite
  不改 HTML / CSS
  不动 sweet-demo.html UI
  不做动画
  不接真钱
  ES Modules 原生
  config 驱动
  RNG = xorshift128+
  Math Engine 纯函数, Node 可跑
  Simulator 先证明数学

---

18. 待用户确认

.

1. 是否同意 KEEP/REWRITE/DELETE/DEFER 分类
  2. 是否同意 17.1 的前置清理
  3. 是否批准进入 Phase 1

1"批准进入 Phase 1"之前, 不写任何代码.

---

END OF PROJECT_AUDIT.md
