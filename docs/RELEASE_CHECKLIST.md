# Apex Candy Tumble · 发布检查清单

: v1.0.0-draft
 2026-10-07

---

## 一、Symbol 系统

- [x] 11 个符号（5 水果 + 4 糖果 + 2 特殊）
- [x] SVG `<symbol>` + `<use>` 复用
- [x] viewBox 160×160 统一
- [x] 9 层视觉（轮廓 / 主体 / 暗面 / 环境遮蔽 / 主高光 / 次高光 / 镜面 / 描边 / 接触阴影）
- [x] 材质区分（organic / gel / hard-candy / metallic-candy）
- [x] 视觉尺寸校正（--symbol-scale 0.78~0.92）
- [x] 状态动画类（is-winning / is-removing / is-entering）
- [x] prefers-reduced-motion 支持

## 二、Runtime 核心

- [x] EventBus（发布订阅）
- [x] StateMachine（11 阶段严格迁移）
- [x] GameRuntime（状态机 + 事件 + Provider）
- [x] Demo Provider（真实数学驱动）
- [x] 模拟延迟 400~900ms

## 三、数学核心

- [x] Paytable（Pay Anywhere 8+）
- [x] Board Evaluator
- [x] Tumble Engine（移除 + 压缩 + 补位）
- [x] Simulator（10 万局验证）
- [x] RTP 90.98%
- [x] HitRate 34.05%
- [x] Max ≥ 28x
- [x] 数学验证测试（CI，100 万局）

## 四、Bonus Engine

- [x] Scatter 触发（4/5/6 个 → 10/12/15 局）
- [x] Retrigger（3+ → +5 局）
- [x] Multiplier 值域 2/3/5/10/25/50/100
- [x] 免费旋转上限 200 局

## 五、Presentation

- [x] Audio Manager（11 分类）
- [x] Web Audio 合成器（10 预设）
- [x] Haptics Manager（8 模式）
- [x] 中奖 4 级反馈（normal / big / mega / super）
- [x] rAF 数字滚动
- [x] aria-live 分段（滚动中关闭）

## 六、UI

- [x] 首页弹窗（模式选择）
- [x] 试玩页（棋盘 / 余额 / 下注 / 三按钮）
- [x] 菜单抽屉（7 项）
- [x] 游戏规则 Sheet
- [x] 游戏记录 Sheet
- [x] 游戏设置 Sheet
- [x] 重置余额确认

## 七、Settings

- [x] 音效开关
- [x] 音乐音量
- [x] 音效音量
- [x] 震动开关
- [x] 极速模式
- [x] 动画效果
- [x] localStorage 持久化

## 八、安全

- [x] CSP（script-src 'self'）
- [x] X-Frame-Options / X-Content-Type-Options / Referrer-Policy
- [x] Permissions-Policy / HSTS / COOP / CORP
- [x] _redirects 敏感路径全覆盖
- [x] 无内联 script/style
- [x] 无 git 敏感文件
- [x] npm audit 0 漏洞

## 九、无障碍

- [x] aria-live 中奖朗读
- [x] aria-label 全部按钮
- [x] prefers-reduced-motion 全动画关闭
- [x] 焦点管理（Sheet / Dialog）
- [x] 键盘 ESC 关闭

## 十、性能

- [x] DocumentFragment 批量渲染
- [x] 只用 transform / opacity
- [x] will-change: auto 默认
- [x] `<symbol>` + `<use>` 复用
- [x] 定时器清理
- [x] 无 setInterval

## 十一、测试

- [x] syntax-check（90 文件）
- [x] security-scan（0 问题）
- [x] 数学验证（CI，100 万局）

## 十二、未完成（后续版本）

- [ ] Tumble 级联动画（CSS 类已就绪，无触发）
- [ ] 中奖格子高亮（is-winning 未触发）
- [ ] Bonus 页面（数据层已就绪，无 UI）
- [ ] 音效资源接入（合成器已就绪）
- [ ] Server Provider（接口未定义）
- [ ] Idempotency / Recovery
- [ ] 钱包抽象 / 整数金额
- [ ] 本地化 i18n
- [ ] 正式合规审查

## 十三、上线 Gate

### 本地验证
- [x] npm run syntax
- [x] npm run test:security
- [x] node tests/math/math-validation.cjs

### 浏览器验证
- [ ] Chrome Desktop
- [ ] Safari Desktop
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Firefox Desktop

### 部署验证
- [ ] GitHub Actions 全绿
- [ ] Cloudflare Pages 部署成功
- [ ] Health Check 通过
- [ ] 关键页面可访问

---

## 附：当前 HEAD

 `git log --oneline -1` 提供
