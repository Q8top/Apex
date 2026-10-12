# Apex · Sweet Bonanza 交接文档

最后更新：2026-10-12

## 项目状态

Sweet Bonanza 已完成核心开发，可本地运行 / 可上线 demo。
真实钱通道已建骨架（未接 PSP）。

## 关键文件地图

### 前端

| 文件 | 职责 |
|---|---|
| `src/css/tokens.css` | 设计令牌唯一真值 |
| `src/css/base.css` | reset + focus + reduced-motion + safe-area |
| `src/css/sweet-demo.css` | Sweet 游戏页（含横屏 / 桌面 / RTL） |
| `src/css/sweet-modal.css` | 首页模式选择弹窗 |
| `src/js/inline/sweet-demo.js` | 主逻辑：状态机 / 数字滚动 / buy-fs / bigwin / history |
| `src/js/inline/sweet-symbol-renderer.js` | 符号渲染门面 |
| `src/js/inline/sweet-win-feedback.js` | 分级赢奖反馈 |
| `src/js/presentation/audio-synth.js` | Web Audio 合成器（17 presets） |
| `src/js/presentation/audio-lifecycle.js` | 音频生命周期（iOS 锁屏恢复） |
| `src/js/platform/i18n.js` | 11 语言（含 ar RTL） |
| `src/js/ui/sweet-rules.js` | 规则面板 |
| `src/js/ui/sweet-history.js` | 历史面板（local + server） |
| `src/js/ui/sweet-settings.js` | 设置面板 |
| `src/provider/server-adapter.js` | real 模式服务端适配 |
| `src/provider/demo-adapter.js` | demo 模式本地适配 |

### 服务端（Cloudflare Functions）

| 文件 | 职责 |
|---|---|
| `functions/api/game/spin.js` | 权威 spin（幂等 + 乐观锁 + 定点化） |
| `functions/api/game/buy-fs.js` | 购买免费旋转（real 模式） |
| `functions/api/game/history.js` | 最近 N 局记录 |
| `functions/api/pay/deposit.js` | 充值意图骨架（未接 PSP） |

### 引擎

| 文件 | 职责 |
|---|---|
| `src/engine/*.js` | Sweet 客户端引擎（9 文件） |
| `functions/_engine/*.js` | Sweet 服务端引擎（镜像） |
| `src/games/sugar-rush/engine/*.js` | SR 独立引擎（10 文件） |

## 敏感信息隔离

以下目录**只允许服务端存在**，客户端绝无 real 参数：

- `functions/_config/math-profile.js`（Sweet real RTP）
- `functions/games/sugar-rush/config/math-profile.real.js`（SR real RTP）

CI 门禁 `check-client-server-separation.sh` 强制。

## 常用命令

```bash
# 本地开发
npx wrangler pages dev . --d1 apex_db=apex-db

# 全量门禁（17 套件）
node scripts/final-gate.cjs

# 单独套件
npm run test:api       # spin + buy-fs + history + deposit
npm run lint:sweet     # 快速规则检查
npm run a11y:tab       # tab order 静态检查

# RTP 门禁
node tools/rtp-gate-v3.cjs          # SR
node tests/math/rtp-gate.cjs 200000 # Sweet
```

## 部署

`main` 分支推送 → GitHub Actions 跑 CI（含 RTP 门禁）→ Cloudflare Pages 自动部署。

## 已知未完成

1. 真机性能实测（Lighthouse / 60fps）— 需人工执行
2. Service Worker 保留自杀版，未做离线缓存
3. PSP 充值接口骨架未接第三方
4. WebSocket 实时余额推送未做
5. Sugar Rush 未同步本轮 Sweet 的所有 UI 优化
