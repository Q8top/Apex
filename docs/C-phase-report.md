# C 阶段交付报告

**版本**：math-1.0.0 · C 阶段
**完成时间**：2026-10-09
**状态**：✅ 出口

---

## 1. 概述

C 阶段交付「表现层」7 个模块 + 真机性能优化。所有模块：
- 纯 ES2015+ IIFE，挂 `window.Apex*`
- 无框架、无构建、无内联
- 测试全过（假 DOM / 假时钟 / 假 RAF）

---

## 2. 交付模块

| 模块 | 文件 | 断言 | 职责 |
|---|---|---|---|
| C-1 | `src/js/platform/i18n.js` | 35 | 11 语言注册 + 回退链 + Intl + RTL |
| C-2 | `src/js/presentation/audio-bridge.js` | 35 | 事件映射 + 节流 + 并发上限 + 自动播放降级 |
| C-3 | `src/js/presentation/renderer.js` | 35 | 源优先级 + 降级 + PLACEHOLDER + bootCheck |
| C-4 | `src/js/presentation/perf.js` | 45 | 环形缓冲 + mark/measure/timeIt + report |
| C-5 | `src/js/presentation/animator.js` | 50 | RAF 调度 + 绝对时间 + visibility + reduced-motion |
| C-6 | `src/js/presentation/autospin.js` | 40 | 状态机 + 停止条件 + 无泄漏 |
| C-7 | `src/js/presentation/a11y.js` | 50 | focus trap + announcer + reduced-motion + 键盘 |

**合计**：290 断言

---

## 3. 真机性能优化

### 3.1 诊断（低端 Android）

| 指标 | 优化前 |
|---|---|
| filter 元素 | 30（每格 1 个 feDropShadow） |
| gradient 元素 | 100 |
| 单格 SVG 字符数 | 2151 平均 |
| renderBoard p50 | 30.4ms |
| renderBoard p95 | 54ms |
| forced reflow | 54.9ms |

### 3.2 优化刀

| 刀 | commit | 改动 | 效果 |
|---|---|---|---|
| 1 | 2cef9d3 | 去 SVG `<filter feDropShadow>` | filter 30→0 |
| 2 | bf41db2 | defs 全局共享（隐藏 sprite） | 单格字符 2151→~500 |
| 3 | 8bce8bd | 去 CSS `filter: drop-shadow` + `contain: layout style paint` + `backface-visibility: hidden` | 最大收益 |

### 3.3 结果

iPhone 级丝滑不可达（硬件差 3~5x），但游戏体验已正常。

---

## 4. 接线

### 4.1 第一步（f5fadaa）
- audio-bridge：12 处 `audio.play(...)` → `playAudio(...)`（dash 名透传）
- a11y：sheet/confirm 焦点 trap + 恢复

### 4.2 第二步（f2b41be）
- autospin：`startAuto/stopAuto` → `ApexAutoSpin` 状态机
- animator：`tumbleSetTimeout` → `animator.delay()`（页面隐藏自动暂停）
- 3 处 `resolveAutoDone`：正常 / bonus / error

---

## 5. 附带修复

- 6fa38ff：3 个糖果符号（GREEN/PURPLE/RED_HEART）V2 补齐 `candy()` 生成器

---

## 6. 未做（明确）

| 项 | 原因 |
|---|---|
| CSP 里 CF Analytics 白名单 | 不影响功能，用户可选关 |
| 音频模块内部 `_state` 废弃标记清理 | 兼容性保留 |
| autospin 里 `state.autoSpin` 冗余布尔 | 渲染层依赖，保留 |
| `scheduleAuto()` 空壳 | 保险起见保留（防旧调用） |

---

## 7. 出口条件对照

| 施工单 §C 要求 | 状态 |
|---|---|
| C-1 i18n 8+ 语言 | ✅ 11 语言 |
| C-2 音频统一事件映射 | ✅ |
| C-3 渲染门面 + bootCheck | ✅ |
| C-4 渲染性能测 30 格首渲 | ✅ 离线基准 + 真机验证 |
| C-5 Tumble 动画绝对时间 + 页面隐藏暂停 | ✅（animator.delay） |
| C-6 自动旋转状态机 + 无泄漏 | ✅ |
| C-7 可访问性键盘 / SR / reduced-motion | ✅ |

---

## 8. 遗留（非阻塞）

- CSP `_headers` 未加 `static.cloudflareinsights.com`：Cloudflare Pages 自动注入的 Web Analytics 撞 `script-src 'self'`。功能无影响，Console 报 2 条错误。
- 未接入 a11y announcer 到中奖播报（可选优化）
- 未接入 perf 埋点到 renderBoard（可选优化）

---

C 阶段完成。

---

## 9. C 阶段全量回归证据（2026-10-09）

cat > ~/apex-peek-winthreshold.sh << 'OUTER'
#!/bin/bash
set -eu
cd /root/projects/Apex

echo "═══ sweet-demo.js 里音频阈值 ═══"
sed -n '/if (state.win > 0) {/,/^    }/p' src/js/inline/sweet-demo.js | head -25

echo ""
echo "═══ audio-synth.js 里的 win 音效名 ═══"
grep -n "'win-\|'big-win'\|'mega-win'\|'super-win'" src/js/presentation/audio-synth.js

echo ""
echo "═══ haptics.winPulse 的阈值 ═══"
sed -n '/function winPulse/,/^  }/p' src/js/presentation/haptics.js

echo "==PEEK-DONE=="
OUTER
`bash /tmp/apex-regress.sh`（本地一次性跑）

| 项 | 结果 | 耗时 |
|---|---|---|
| syntax-check | checked=145 failed=0 | 8s |
| config-sync | passed | <1s |
| engine-tests | 127/127 | 1s |
| settlement-guard-10 | 32/32 | <1s |
| settlement-a2-runtime-isolation | 13/13 | 3s |
| settlement-a4-idempotency | 26/26 | <1s |
| settlement-a5-fs-concurrency | 21/21 | <1s |
| settlement-a6-reward-chain | 12/12 | <1s |
| settlement-a7-ledger-recon | 25/25 | <1s |
| settlement-a8-backup-restore | 18/18 | 1s |
| settlement-a9-session-limit | 13/13 | <1s |
| e2e-spin-sql | 24/24 | <1s |
| e2e-spin-api | 30/30 | <1s |
| security-scan | 0 issues / 186 files | 1s |
| rtp-gate-50k | PASS (2 modes) | 6s |

**PASS: 15 / FAIL: 0**

> 注：settlement 8 项用 node:sqlite 模拟，不完全等价 D1；
> 真实 D1 验证见 .github/workflows/d1-integration.yml（手动触发）。
