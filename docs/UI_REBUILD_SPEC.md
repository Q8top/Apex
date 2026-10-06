# UI_REBUILD_SPEC.md
# Phase 3B - Presentation System Rebuild
# 版本: 1.0.0
# 日期: 2026-10-06
# 状态: SPEC 固化, 待实施

========================================
0. 文档目的
========================================

 SPEC 定义 Phase 3B 的完整范围:
  - 现状审计结论
  - 目标设计系统
  - 动画时序
  - FX 系统
  - 音频/触觉事件
  - 组件层级
  - 性能预算
  - 验收标准

 SPEC 只描述表现层 (Presentation)。
 (Math Engine / RNG / Config) 完全冻结。

========================================
1. 边界声明 (硬约束)
========================================

'SPEC_EOF':::::::::
  - config/game.json (任何数值)
  - src/js/engine/rng.js
  - src/js/engine/symbol-system.js
  - src/js/engine/math-engine.js
  - src/js/engine/replay.js
  - RTP / hitRate / scatterRate / bombRate / freeSpinHitRate
  - payouts / weights / Big Win 阈值

'SPEC_EOF''SPEC_EOF':::::::::
  - src/css/*.css (表现)
  - sweet-demo.html (结构, 不改语义)
  - src/js/sweet-demo.js (只改渲染/动画/交互, 不改数学调用)
  - 新增 src/js/ui/*.js ()
  - 新增 src/css/ui/*.css (可选)

'SPEC_EOF':
  Math Engine -> EngineAdapter -> ViewModel -> Renderer

========================================
2. 现状审计结论 (2026-10-06)
========================================

2.1 文件规模
  src/css/sweet.css         774 行
  src/css/sweet-demo.css    737 行
  src/js/sweet-demo.js      901 行
  sweet-demo.html           138 行
  src/js/ui/engine-adapter.js  176 行

2.2 视觉层级问题
  - Header / Grid / Win / Bet / Spin / Bottom 无主次
  - Grid 每个 cell 都像独立按钮, 无整体感
  - Cell 背景色 (紫色) 强于符号本身
  - 没有统一的视觉光效

2.3 动画现状
  @keyframes 总数: 4
    demo-win-flash   简单闪烁
    demo-spin-blur   简单滚动
    demo-pop         简单弹跳
    bigwin-pop       简单弹入
  transition: 14 处
  animation:  7 处
  无组合动画, 无时序编排

2.4 特效现状
  粒子:     无
  屏幕抖动: 无
  屏幕闪光: 无
  冲击波:   无
  光晕:     仅 CSS box-shadow

2.5 音频现状
  Web Audio: 有 (ensureAudio + playSpinFeedback)
  音效种类: 2 种 (普通赢 / 大赢)
  无音乐, 无环境音, 无 UI 音

2.6 触觉现状
  navigator.vibrate: 3 处
  无分级 (light / medium / heavy)
  无事件绑定 (combo / bigwin / fs)

2.7 交互现状
  点击反馈: 简单 scale
  按住: 无
  长按: 无
  拖拽: 无

========================================
3. Visual Design System
========================================

3.1 色板 (Color Tokens)
  --c-bg-deep:     #0d0512  最深背景
  --c-bg-board:    #1a0b1f  板面背景
  --c-bg-cell:     #2a1035  cell 基础色
  --c-bg-elev-1:   #3a1a45  cell 高亮
  --c-bg-elev-2:   #4a2355  cell 中亮

  --c-text-1:      #ffffff  主文本
  --c-text-2:      #e6dcf0  次文本
  --c-text-3:      #a89ab8  弱文本
  --c-text-muted:  #6a5c78  禁用

  --c-accent-1:    #ffce6b  金色 (中奖)
  --c-accent-2:    #ff7eb6  粉色 (品牌)
  --c-accent-3:    #7c5cff  紫色 (稀有)
  --c-win:         #ffb547  中奖金黄
  --c-win-big:     #ff3d7f  大额玫红
  --c-loss:        #8a8a92  未中奖灰

  --c-glow-gold:   rgba(255,206,107,.55)
  --c-glow-pink:   rgba(255,126,182,.55)
  --c-glow-violet: rgba(124,92,255,.55)

3.2 字号 (Typography)
  字体栈: "Manrope", system-ui, "PingFang SC", "Microsoft YaHei"

  --fs-display:    32px   本局中奖主数字
  --fs-display-xl: 44px   大额中奖
  --fs-title:      17px   区块标题
  --fs-body:       14px   正文
  --fs-caption:    12px   次要信息
  --fs-micro:      10.5px 极弱

  字重: 400 / 600 / 700 / 800 / 900
  数字: font-variant-numeric: tabular-nums

3.3 间距 (Spacing)
  --sp-1:  4px
  --sp-2:  8px
  --sp-3:  12px
  --sp-4:  16px
  --sp-5:  20px
  --sp-6:  24px
  --sp-8:  32px

3.4 圆角 (Radius)
  --r-s:  8px    小部件
  --r-m:  14px   卡片
  --r-l:  20px   大板面
  --r-xl: 28px   主按钮
  --r-pill: 999px

3.5 阴影 (Shadow)
  --sh-1: 0 1px 2px rgba(0,0,0,.35)
  --sh-2: 0 4px 12px rgba(0,0,0,.45)
  --sh-3: 0 8px 24px rgba(0,0,0,.55)
  --sh-glow-gold:   0 0 32px var(--c-glow-gold)
  --sh-glow-pink:   0 0 32px var(--c-glow-pink)
  --sh-inset-top:   inset 0 1px 0 rgba(255,255,255,.18)
  --sh-inset-deep:  inset 0 -3px 6px rgba(0,0,0,.5)

3.6 动效曲线 (Easing)
  --ease-out:      cubic-bezier(.16, 1, .3, 1)
  --ease-in-out:   cubic-bezier(.65, 0, .35, 1)
  --ease-elastic:  cubic-bezier(.34, 1.56, .64, 1)
  --ease-snap:     cubic-bezier(.2, .9, .3, 1.1)

3.7 时长 (Duration)
  --d-instant:  80ms    微反馈
  --d-fast:     160ms   按钮
  --d-normal:   240ms   切换
  --d-slow:     400ms   入场
  --d-land:     320ms   symbol 落地
  --d-pop:      420ms   symbol 消失
  --d-count-up: 900ms   数字滚动
  --d-bigwin:   1800ms  大额中奖

========================================
4. Layout System
========================================

4.1 视觉层级 (从强到弱)
  Tier 1 (主角):
    - 6x5 Grid
    - 本局中奖金额
  Tier 2 (次主角):
    - SPIN 按钮
  Tier 3 (信息):
    - 余额 / 下注 / 赢得
  Tier 4 (辅助):
    - Header (返回/标题/菜单)
    - Bet 调节
  Tier 5 (弱化):
    - 自动 / 记录 / 赔付

4.2 屏幕分区 (纵向 flex)
  +--------------------------------+
  | Header        56px             |
  +--------------------------------+
  |                                |
  | Board (flex-grow)              |
  |   - 6x5 Grid                   |
  |   - FS 徽章 (内嵌)              |
  |                                |
  | Win Amount (居中, 大号)         |
  +--------------------------------+
  | Stats         56px             |
  +--------------------------------+
  | Bet Control   56px             |
  +--------------------------------+
  | SPIN          72px             |
  +--------------------------------+
  | Bottom Nav    44px             |
  +--------------------------------+

4.3 响应式断点
  --bp-sm:  360px    小屏
  --bp-md:  480px    标准
  --bp-lg:  768px    平板
  --bp-xl:  1024px   桌面

  竖屏优先。横屏显示提示 "请竖屏使用"。

4.4 Safe Area
  padding-top:    env(safe-area-inset-top)
  padding-bottom: env(safe-area-inset-bottom)
  padding-left:   env(safe-area-inset-left)
  padding-right:  env(safe-area-inset-right)

========================================
5. Symbol System
========================================

5.1 技术路线 (保持)
  JavaScript -> Symbol Definition -> SVG Generator -> SVG
    - Path
    - Gradient (Linear / Radial)
    - Highlight
    - Shadow
    - Stroke
    - Decoration
  -> DOM Cell -> CSS -> Animation

  不改为 PNG, 不改为静态图片。

5.2 符号状态机
  IDLE       待机 (微呼吸 + 微高光)
  LAND       落地 (scale 1.08 -> 1.0)
  HIGHLIGHT  中奖 (glow + pulse)
  POP        消失 (scale 1.0 -> 1.15 -> 0)
  FALLING    下落 (translateY 加速)
  APPEAR     出现 (scale 0 -> 1.05 -> 1.0)

5.3 IDLE 微动效
  频率: 3-5s 循环
  动作: scale 1.0 -> 1.02 -> 1.0
  高光: SVG radial gradient 微移
  随机相位: 每个 cell 用 hash(id) 分配延迟
  禁用条件: prefers-reduced-motion

5.4 特殊符号动效
  scatter (lollipop):
    - 旋转光晕 (现有, 保留)
    - 触发前 intensify (0.6s 加速)
  wild (rainbow):
    - hue-rotate 6s
    - 边缘 sparkle

========================================
6. Animation Timeline
========================================

6.1 SPIN 时序 (base game)
  T=0      Button pressed
           - SPIN 按钮 down 动画
           - 所有 cell 进入 FALLING
  T=900ms  Grid 冻结到 initialGrid
           - 每个 cell: LAND (stagger 8ms)
  T=1200ms Evaluate 完成
           - 若中奖: 进入 6.2 TUMBLE
           - 若未中奖: 进入 6.4 RESULT
  T=1500ms 解禁 SPIN

6.2 TUMBLE 时序 (每次连消)
  T=0      HIGHLIGHT 开始
           - 中奖符号: glow + pulse (2 cycles)
           - WIN 金额开始 count-up
  T=500ms  HIGHLIGHT 结束
           - WIN 金额定格
  T=600ms  POP 开始
           - 中奖符号: scale 1.15 -> 0 (300ms)
  T=900ms  POP 结束
           - 其他 cell: FALLING 开始
  T=1100ms FALLING 结束
           - 顶部: APPEAR (stagger 10ms)
  T=1250ms LAND 完成
           - combo +1 (若 >1 显示 combo text)
  T=1400ms 回到 T=0, 继续判奖

6.3 FS 序列时序 (每个 FS spin)
  与 6.1 相同, 但:
    - 徽章显示剩余次数
    - win 金额分步累计显示
    - 每步之间 100ms 停顿

6.4 RESULT 时序 (整局结束)
  T=0      所有动画停止
  T=200ms  WIN 金额 (整局) count-up
  T=1100ms count-up 完成
  T=1200ms 若触发 FS: FS 徽章发光 + toast
  T=1500ms 若 tier >= 'big': Big Win 弹层

6.5 Big Win 时序
  T=0      背景 dim (opacity 0 -> 1, 200ms)
  T=200ms  大标题 pop-in
           - scale 0.4 -> 1.15 -> 1.0 (600ms, elastic)
  T=800ms  金额 count-up (900ms)
  T=1700ms 粒子爆发 (0.8s)
  T=2500ms 弹层 fade out
  T=2700ms 恢复正常

6.6 combo text
  combo 2: TUMBLE
  combo 3: COMBO
  combo 5: FEVER
  combo 10: SUPER FEVER
  显示位置: Grid 上方居中
  动画: slide-down + fade

========================================
7. FX System
========================================

7.1 粒子 (Particle)
  实现: Canvas 2D 覆盖层 (不用 DOM)
  池化: 200 个预分配
  类型:
    win-spark  中奖粒子 (金色小点)
    big-win    大额爆裂 (多色)
    fs-trigger 免费旋转触发 (粉金色)
  生命周期: 600-1200ms
  数量上限:
    low-end:  40
    mid:      120
    high:     200

7.2 屏幕抖动 (Screen Shake)
  触发:
    big win     轻抖 (2px, 300ms)
    mega win    中抖 (4px, 500ms)
    epic win    强抖 (6px, 700ms)
    free spins  轻微脉冲 (1px, 200ms)
  实现: transform translate on board
  禁用条件: prefers-reduced-motion

7.3 屏幕闪光 (Screen Flash)
  触发: fs-trigger / epic win
  实现: 全屏 div, background radial-gradient
  时长: 400ms
  颜色: gold 或 pink

7.4 冲击波 (Shockwave)
  触发: big win / fs-trigger
  实现: 单 div, scale 0 -> 3, opacity 1 -> 0
  时长: 600ms

7.5 光晕 (Glow)
  触发: HIGHLIGHT / combo
  实现: cell box-shadow
  颜色: --c-glow-gold

========================================
8. Audio Event System
========================================

8.1 事件列表
  ui-click        按钮点击
  spin-start      旋转开始
  spin-land       落地
  win-small       小奖
  win-big         大额
  combo           连消
  tumble          tumble 循环
  fs-trigger      免费旋转触发
  fs-spin         每次 FS
  big-win         大额中奖弹层
  mega-win        超大奖

8.2 音效定义 (Web Audio 合成, 无素材依赖)
  ui-click:     短音, sine 800Hz, 60ms
  spin-start:   扫频, sawtooth 200->400Hz, 200ms
  spin-land:    短促, square 300Hz, 80ms
  win-small:    双音, sine 660/880Hz, 200ms
  win-big:      三音, sine 523/659/784Hz, 400ms
  combo:        上升音阶, 4 音
  fs-trigger:   琶音, 6 音上升
  big-win:      和弦 + 长尾, 800ms
  mega-win:     和弦 + 长尾 + 回声, 1200ms

8.3 优先级 (并发时)
  1. big-win / mega-win
  2. fs-trigger
  3. win-big
  4. combo
  5. win-small
  6. spin-land
  7. spin-start
  8. ui-click

8.4 静默降级
  AudioContext 不可用: 静默跳过
  不报错, 不阻塞

========================================
9. Haptic System
========================================

9.1 事件与强度
  ui-click        light  10ms
  spin-start      light  15ms
  spin-land       light  8ms
  win-small       medium 25ms
  win-big         heavy  60ms
  combo           medium [20, 30, 20]
  fs-trigger      heavy  [40, 30, 40]
  big-win         heavy  [60, 40, 60, 40, 120]
  mega-win        heavy  [80, 50, 80, 50, 160]

9.2 降级
  navigator.vibrate 不存在: 静默跳过
  尊重用户设置 (未来可加 toggle)

========================================
10. Component Hierarchy
========================================

10.1 HTML 结构 (目标)
  body.sd-demo-body
    main.demo-shell
      header.demo-header
      section.demo-board
        div.demo-reels
          div.demo-cell (x30)
        div.demo-freespins (badge)
        canvas.demo-particles
      section.demo-win
      section.demo-stats
      section.demo-bet
      section.demo-spin
      section.demo-actions
    div.demo-bigwin (overlay)
    div.demo-drawer (history)
    div.demo-drawer (paytable)
    div.demo-flash (full-screen fx)

10.2 JS 模块 (目标)
  src/js/ui/engine-adapter.js    (已存在, 不改)
  src/js/ui/presenter.js          新增 (ViewModel -> DOM)
  src/js/ui/animation.js          新增 (时序编排)
  src/js/ui/particles.js          新增 (Canvas 粒子)
  src/js/ui/audio.js              新增 (Web Audio 事件)
  src/js/ui/haptics.js            新增 (vibrate 事件)
  src/js/ui/events.js             新增 (事件总线)

10.3 事件总线
  单一入口:
    emit('WIN_SMALL', { amount })
    emit('FS_TRIGGER', { spins })
    emit('COMBO', { n })

  订阅者:
    animation 监听 -> 播放动画
    particles 监听 -> 喷粒子
    audio     监听 -> 播音效
    haptics   监听 -> 震动

========================================
11. Performance Budget
========================================

11.1 帧率
  目标: 60 FPS (low-end Android)
  允许降级: 30 FPS

11.2 帧预算 (16.67ms)
  JS:        6ms
  Layout:    2ms
  Paint:     4ms
  Composite: 4ms

11.3 设备分级
  high:  flags.gpu >= 2 && ram >= 4GB
  mid:   ram >= 2GB
  low:   其他

11.4 降级策略
  low 设备:
    - 粒子数 <= 40
    - 禁用 screen shake
    - 禁用 screen flash
    - 动画时长 x1.5
    - 关闭 IDLE 微动效

11.5 内存
  总 JS heap <= 30MB
  粒子池 <= 200 项
  DOM 节点 <= 200

11.6 冷启动
  HTML -> 首屏 <= 1.5s (4G)
  fetch config <= 200ms
  初始化 <= 500ms

========================================
12. Acceptance Criteria
========================================

12.1 视觉
  [ ] 视觉层级: Grid + Win 为绝对主角
  [ ] Cell 边界弱化, 整体感增强
  [ ] 符号在 cell 中居中, 边界留白一致
  [ ] 色板统一 (无散落硬编码色)
  [ ] 字号统一 (无散落硬编码)

12.2 动画
  [ ] SPIN 有清晰时序 (落地 stagger)
  [ ] TUMBLE 有 HIGHLIGHT -> POP -> FALL -> LAND 四阶段
  [ ] 中奖符号有 glow pulse
  [ ] 未中奖符号不闪烁
  [ ] Big Win 有 count-up
  [ ] combo >= 3 有文字提示
  [ ] FS 徽章显示剩余次数

12.3 FX
  [ ] 中奖有粒子
  [ ] 大额中奖有 screen shake
  [ ] FS 触发有 flash
  [ ] Big Win 有冲击波

12.4 音频
  [ ] 8 种以上事件音效
  [ ] 无声时静默降级
  [ ] 无 console error

12.5 触觉
  [ ] 5 种以上事件震动
  [ ] 降级不报错

12.6 性能
  [ ] iPhone 12+ 60 FPS
  [ ] 中端 Android 60 FPS
  [ ] 低端 Android 30 FPS
  [ ] 冷启动 <= 1.5s

12.7 回归
  [ ] 3326 项测试通过 (Math / RNG / Replay / Adapter)
  [ ] Math Engine / RNG / Config 零 diff
  [ ] 现有 spin / FS / history / paytable 功能不破坏

12.8 无障碍
  [ ] prefers-reduced-motion 生效
  [ ] 触控目标 >= 44px
  [ ] 色彩对比度 >= WCAG AA

========================================
13. 实施顺序 (8 阶段)
========================================

P1  Design System (CSS tokens)
    新增 src/css/ui/tokens.css, 引入到 sweet-demo.html

P2  Layout Rebuild (HTML + CSS)
    重做 sweet-demo.html 结构, 更新 sweet-demo.css

P3  Presenter 拆分
    新增 src/js/ui/presenter.js, sweet-demo.js 只保留 init/bind

P4  Animation 系统
    新增 src/js/ui/animation.js, 实现 6.1-6.6 时序

P5  FX 系统
    新增 src/js/ui/particles.js + flash + shake

P6  Audio 系统
    新增 src/js/ui/audio.js, 事件驱动音效

P7  Haptics 系统
    新增 src/js/ui/haptics.js, 事件驱动震动

P8  性能 + 验收
    device profile, 降级策略, 全测试

========================================
14. 附录
========================================

14.1 参考文档
  docs/ARCHITECTURE.md         系统架构
  docs/MATH_MODEL.md           数学模型
  docs/UI_ENGINE_ADAPTER_PLAN.md  Phase 3A 接入方案

14.2 相关代码
  src/js/ui/engine-adapter.js  Phase 3A 已就位
  src/js/sweet.js              SVG Symbol 生成器
  src/js/sweet-demo.js         当前 UI 主入口

14.3 变更日志
  2026-10-06  初稿
  - Phase 3A 完成 (EngineAdapter 接入)
  - 本 SPEC 定义 Phase 3B 完整范围
  - 待实施

========================================
END OF UI_REBUILD_SPEC.md
========================================
