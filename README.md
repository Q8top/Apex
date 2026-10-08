# Apex · 糖果连连爆

Sweet Bonanza 风格的 Pay Anywhere 老虎机游戏。纯前端 + Cloudflare Pages，
无框架、无构建、IIFE 风格、CSP 严格。

**线上**：https://apextop.cc.cd
**游戏页**：https://apextop.cc.cd/sweet-demo?mode=demo

---

## 技术栈

| 项 | 值 |
|---|---|
| 前端 | 纯 HTML5 + CSS3 + 原生 ES2015+ JS |
| 模块风格 | IIFE（`(function(){...})()`），挂 `window.ApexXxx` |
| 构建 | 无（不用 Vite / Webpack / TS） |
| 部署 | 推送 GitHub main → Cloudflare Pages 自动部署 |
| 随机源 | `crypto.getRandomValues`（禁 Math.random） |
| 金额 | 整数 minor units（分），不用浮点 |
| CSP | `script-src 'self'`（禁内联、禁 eval） |

---

## 游戏功能

- 6×5 棋盘，Pay Anywhere（8+ 同符号即中，位置无关）
- Tumble 连消（中奖消失 → 下落 → 补位 → 循环）
- Scatter 免费旋转（4=3x / 5=5x / 6+=100x + 10 FS）
- Multiplier Bomb（FS 期间 x2~x100，同轮相加）
- 双模式：real（RTP ~91%）/ demo（RTP ~157%）
- 9 种符号：5 水果 + 4 糖果
- 完整音效 + 振动 + 中英双语 + 历史记录 + 规则页

---

## 项目结构

```
src/
  config/      冻结层（version / math-profile / symbols.locked / paytable.locked / public-rules）
  engine/      新引擎 9 模块（errors / grid / rng / multiplier / evaluator / tumble / bonus / payout / game-engine）
  provider/    provider（基类）/ local-demo / demo-adapter（游戏用）/ server（stub）
  wallet/      wallet（基类）/ demo-wallet
  core/        state（状态机）/ runtime（串接）
  js/          老业务（inline 主控 / engine 符号 / math 赔率+bonus / presentation 音频 / platform / ui sheets）
tests/
  math/        seeded-rng / simulator-v2 / rtp-gate / rtp-baseline / compare-v1-v2
  *.test.js    安全 / 密码 / CSRF / 响应头 / CBOR / WebAuthn
docs/
  ARCHITECTURE.md   架构总览（先看这个）
  math/MATH_SPEC.md 数学规格
```

---

## 快速开始

无需安装依赖即可看效果，本地起个静态服务：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/sweet-demo.html?mode=demo
```

如果要跑 wrangler（含 Functions）：

```bash
npm install
npm run dev    # wrangler pages dev
```

---

## 测试

| 命令 | 内容 | 耗时 |
|---|---|---|
| `npm run syntax` | 全项目语法检查 | ~2s |
| `npm run test:security` | 安全扫描（Math.random / eval / Function） | ~1s |
| `npm run test:rtp` | RTP 门禁（5 万局 × 2 模式） | ~6s |
| `npm run test:rtp:full` | 完整校准（20 万局 × 2 模式） | ~20s |
| `npm run test:all` | 全部单测 | ~30s |
| `npm run verify` | 语法 + 全部单测 | ~35s |

CI（.github/workflows/ci.yml）每次 push 自动跑：
语法 → RTP 门禁 → 单测 → 安全扫描 → API 冒烟。

---

## 部署

推送 `main` 分支即触发 Cloudflare Pages 自动部署：

```bash
git add -A
git commit -m "feat: ..."
git push origin main
# 30~90 秒后 https://apextop.cc.cd 生效
```

手动部署（备用）：

```bash
npm run deploy   # wrangler pages deploy
```

---

## 核心概念

### 双模式

- **demo**：试玩，虚拟余额，RTP ~157%，可本地跑
- **real**：正式，真钱，RTP ~91%，必须服务器权威（ServerProvider 预留）
- 入口：URL `?mode=demo` / `?mode=real`（默认 real）

### 冻结层

以下内容已锁定，不新增 / 不删除 / 不替换：

- **符号**：9 种（5 水果 + 4 糖果）+ 2 特殊（棒棒糖 / 倍率炸弹）
- **视觉**：symbols-v2.js（256 viewBox，uid 隔离，feDropShadow）
- **赔率**：paytable.locked.js（版本化只读）

数学参数（权重 / payScale / pityRate）**可改**，但必须：
跑 `npm run test:rtp:full` + bump math version + 更新基线。

### 金额

统一用 **minor units（分）**，不用浮点。

```js
betMinor = 200     // 代表 ¥2.00
winMinor = calculatePayout(betMinor, multiplier)
display = formatMinor(winMinor, '¥')  // '¥4.00'
```

---

## 修改指南

先读 `docs/ARCHITECTURE.md`。核心原则：

1. **改一个文件**：每次只改 1 个，别连坐
2. **备份必做**：`cp xxx .audit-backup-<时间戳>/`
3. **语法必过**：`node --check xxx.js`
4. **单测必跑**：改引擎跑 `node tests/...`，改数学跑 `npm run test:rtp`
5. **随机只用 crypto**：禁 `Math.random`（安全扫描会拦）
6. **CSP 严格**：HTML 里不写内联 `<script>` 和 `style="..."`
7. **推送前看 CI**：红了先修再推，别堆

---

## 相关文档

| 文档 | 内容 |
|---|---|
| `docs/ARCHITECTURE.md` | 架构总览 / 加载顺序 / 数据流 / 回退 |
| `docs/math/MATH_SPEC.md` | 数学规格 / 参数 / 赔率 / 验证方式 |
| `docs/CACHE.md` | 缓存策略 |
| `docs/RELEASE_CHECKLIST.md` | 发布前检查清单 |
| `docs/backup-rpo-rto.md` | 备份与恢复 |

---

## 许可

私有项目。符号视觉为原创，游戏玩法参考 Pragmatic Play 的 Sweet Bonanza（不涉及原版资产）。
