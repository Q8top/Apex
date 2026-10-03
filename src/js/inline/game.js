/* Apex · 游戏详情页 */
(function(){
'use strict';

/* ---------- 游戏路由 ---------- */
var GAME_ROUTES = {
  'lucky-fruit': { html: '/slot.html',    symLib: 'SlotSymbols' },
  'olympus':     { html: '/olympus.html', symLib: 'OlympusSymbols' },
  'sweet':       { html: '/sweet.html',   symLib: 'SweetSymbols' },
  'sugar':       { html: '/sugar.html',   symLib: 'SugarSymbols' },
  'starlight':   { html: '/starlight.html', symLib: 'StarlightSymbols' },
  'bigbass':     { html: '/bigbass.html',   symLib: 'BigBassSymbols' },
  'aviator':     { html: '/aviator.html', symLib: null },
  'crash':       { html: '/crash.html',   symLib: null },
  'jetx':        { html: '/jetx.html',    symLib: null },
  'blackjack':      { html: '/blackjack.html', symLib: null },
  'roulette-euro':  { html: '/roulette-euro.html', symLib: null },
  'roulette-amer':  { html: '/roulette-amer.html', symLib: null },
  '1001-mg':        { html: '/1001-mg.html', symLib: 'LinesGameSymbols' }
};
function currentGame() {
  var id = getParam('id') || 'lucky-fruit';
  return { id: id, route: GAME_ROUTES[id] || GAME_ROUTES['lucky-fruit'] };
}
function getSymLib() {
  var r = currentGame().route;
  return window[r.symLib] || null;
}

/* ---------- 游戏数据 ---------- */
var GAMES = {
  'lucky-fruit': {
    name: '幸运水果机',
    sub: '经典三轴老虎机 · 3×3 · 5 条中奖线',
    images: [],
    intro: '幸运水果机是一款 3×3 经典老虎机游戏。每局同时结算 5 条固定中奖线（3 横 + 2 斜），每条线上连续 3 个相同符号即中奖。多条线可同时中奖，百搭（Wild）可替代除自己外任意符号。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '三个转轴依次停止，形成 3×3 结果矩阵',
      '同时结算 5 条固定中奖线（上行 / 中行 / 下行 / 主对角 / 副对角）',
      '每条线上 3 个符号相同即中奖，独立计算',
      '百搭（Wild）可替代除自己外的任意符号',
      '中奖金额 = 对应符号赔率 × 单线下注额'
    ],
    prizes: [
      { symbol: 'cherry',      mult: '×14' },
      { symbol: 'lemon',       mult: '×22' },
      { symbol: 'orange',      mult: '×28' },
      { symbol: 'grape',       mult: '×42' },
      { symbol: 'watermelon',  mult: '×56' },
      { symbol: 'bell',        mult: '×84' },
      { symbol: 'bar',         mult: '×140' },
      { symbol: 'seven',       mult: '×280' },
      { symbol: 'goldenSeven', mult: '×700' },
      { symbol: 'wild',        mult: '×840' }
    ],
    paytable: [
      { symbol: 'cherry', mult: '×14' },
      { symbol: 'lemon', mult: '×22' },
      { symbol: 'orange', mult: '×28' },
      { symbol: 'grape', mult: '×42' },
      { symbol: 'watermelon', mult: '×56' },
      { symbol: 'bell', mult: '×84' },
      { symbol: 'bar', mult: '×140' },
      { symbol: 'seven', mult: '×280' },
      { symbol: 'goldenSeven', mult: '×700' },
      { symbol: 'wild', mult: '×840' }
    ],
    info: {
      '游戏类型': '经典老虎机',
      '游戏网格': '3 × 3',
      '中奖线': '5 条',
      '符号数量': '10 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '最大倍数': '×840',
      '上线日期': '2026-10-02'
    }
  },
  'olympus': {
    name: '奥林匹斯之门',
    sub: 'Cluster Pays · Tumble 连击 · 乘法器',
    images: [],
    intro: '奥林匹斯之门是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，若再次形成中奖则触发连击。每个连击轮次会掉落随机乘法器，作用于当轮赢分。4 个及以上 Zeus 触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次形成中奖则触发 Tumble 连击',
      '每个 Tumble 轮次随机掉落 1~2 个乘法器（×2 ~ ×1000），累加后与当轮赢分相乘',
      '出现 4 个及以上 Zeus（Scatter）触发免费旋转 15 次',
      '免费旋转中每次 Tumble 后可能额外掉落 Zeus，继续累积倍数'
    ],
    prizes: [
      { symbol: 'gemBlue',   mult: '8个×0.25' },
      { symbol: 'gemGreen',  mult: '8个×0.4' },
      { symbol: 'gemYellow', mult: '8个×0.5' },
      { symbol: 'gemPurple', mult: '8个×0.8' },
      { symbol: 'gemRed',    mult: '8个×1' },
      { symbol: 'cup',       mult: '8个×1.5' },
      { symbol: 'ring',      mult: '8个×2' },
      { symbol: 'hourglass', mult: '8个×2.5' },
      { symbol: 'crown',     mult: '8个×10' },
      { symbol: 'zeus',      mult: '4个→FS' }
    ],
    paytable: [
      { symbol: 'gemBlue',    mult: '8-9个×0.25 · 10-11个×0.75 · 12+个×2' },
      { symbol: 'gemGreen',   mult: '8-9个×0.40 · 10-11个×0.90 · 12+个×4' },
      { symbol: 'gemYellow',  mult: '8-9个×0.50 · 10-11个×1.00 · 12+个×5' },
      { symbol: 'gemPurple',  mult: '8-9个×0.80 · 10-11个×1.20 · 12+个×8' },
      { symbol: 'gemRed',     mult: '8-9个×1.00 · 10-11个×1.50 · 12+个×10' },
      { symbol: 'cup',        mult: '8-9个×1.50 · 10-11个×2.00 · 12+个×12' },
      { symbol: 'ring',       mult: '8-9个×2.00 · 10-11个×5.00 · 12+个×15' },
      { symbol: 'hourglass',  mult: '8-9个×2.50 · 10-11个×10.0 · 12+个×25' },
      { symbol: 'crown',      mult: '8-9个×10.0 · 10-11个×25.0 · 12+个×50' },
      { symbol: 'zeus',       mult: '4+ 个 → 免费旋转 15 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '10 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（4+ Zeus）',
      '最大倍率': '×5000（连击）',
      '上线日期': '2026-10-02'
    }
  },
  'sweet': {
    name: '甜蜜蜜',
    sub: 'Cluster Pays · 炸弹倍数 · 免费旋转',
    images: [],
    intro: '甜蜜蜜是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，可连续触发 Tumble 连击。免费旋转中每次 Tumble 会掉落炸弹倍数，跨轮累积作用于赢分。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行的网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次中奖则触发 Tumble 连击',
      '出现 4 个及以上棒棒糖（Scatter）触发免费旋转',
      '免费旋转中每次 Tumble 会掉落炸弹倍数（×2 ~ ×100），跨轮累积后与赢分相乘'
    ],
    prizes: [
      { symbol: 'candyBlue',   mult: '8个×0.25' },
      { symbol: 'candyGreen',  mult: '8个×0.4' },
      { symbol: 'candyPurple', mult: '8个×0.5' },
      { symbol: 'candyRed',    mult: '8个×0.8' },
      { symbol: 'candyOrange', mult: '8个×1' },
      { symbol: 'candyYellow', mult: '8个×1.5' },
      { symbol: 'banana',      mult: '8个×2' },
      { symbol: 'grape',       mult: '8个×2.5' },
      { symbol: 'watermelon',  mult: '8个×5' },
      { symbol: 'apple',       mult: '8个×8' },
      { symbol: 'plum',        mult: '8个×10' },
      { symbol: 'lollipop',    mult: '4个→FS' }
    ],
    paytable: [
      { symbol: 'candyBlue',    mult: '8-9个×0.25 · 10-11个×0.75 · 12+个×2' },
      { symbol: 'candyGreen',   mult: '8-9个×0.40 · 10-11个×0.90 · 12+个×4' },
      { symbol: 'candyPurple',  mult: '8-9个×0.50 · 10-11个×1.00 · 12+个×5' },
      { symbol: 'candyRed',     mult: '8-9个×0.80 · 10-11个×1.20 · 12+个×8' },
      { symbol: 'candyOrange',  mult: '8-9个×1.00 · 10-11个×1.50 · 12+个×10' },
      { symbol: 'candyYellow',  mult: '8-9个×1.50 · 10-11个×2.00 · 12+个×12' },
      { symbol: 'banana',       mult: '8-9个×2.00 · 10-11个×5.00 · 12+个×15' },
      { symbol: 'grape',        mult: '8-9个×2.50 · 10-11个×10.0 · 12+个×25' },
      { symbol: 'watermelon',   mult: '8-9个×5.00 · 10-11个×15.0 · 12+个×40' },
      { symbol: 'apple',        mult: '8-9个×8.00 · 10-11个×20.0 · 12+个×45' },
      { symbol: 'plum',         mult: '8-9个×10.0 · 10-11个×25.0 · 12+个×50' },
      { symbol: 'lollipop',     mult: '4/5/6 个 → 免费旋转 10/12/15 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '12 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（4+ 棒棒糖）',
      '上线日期': '2026-10-02'
    }
  },
  'sugar': {
    name: '糖果狂欢',
    sub: 'Cluster Pays · 位置倍率 · 免费旋转',
    images: [],
    intro: '糖果狂欢是一款 7×7 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 5 个及以上相同糖果即形成中奖。中奖符号消失后上方符号下落补位，同时在网格上随机位置附加倍率方块；中奖 cluster 覆盖到倍率方块时，该 cluster 赢分乘以覆盖格子的倍率总和。出现 3 个及以上棒棒糖触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '7 列 × 7 行网格生成 49 个符号',
      '相邻（水平/垂直）相同糖果 ≥5 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '每次 Tumble 后有概率在随机位置掉落倍率方块（×2 ~ ×128）',
      '中奖 cluster 覆盖格子上的倍率总和 × 该 cluster 赢分',
      '出现 3 个及以上棒棒糖（Scatter）触发免费旋转 10 次',
      '免费旋转中每次 Tumble 也会持续附加位置倍率，倍数可长期累积'
    ],
    prizes: [
      { symbol: 'candyBlue',   mult: '5个×0.2' },
      { symbol: 'candyGreen',  mult: '5个×0.25' },
      { symbol: 'candyYellow', mult: '5个×0.3' },
      { symbol: 'candyRed',    mult: '5个×0.4' },
      { symbol: 'candyPurple', mult: '5个×0.5' },
      { symbol: 'heart',       mult: '5个×0.8' },
      { symbol: 'star',        mult: '5个×1' },
      { symbol: 'rainbow',     mult: '5个×2' },
      { symbol: 'lollipop',    mult: '3个→FS' }
    ],
    paytable: [
      { symbol: 'candyBlue',   mult: '5-6个×0.2 · 7-8个×0.5 · 9-10个×1.5 · 11-12个×3 · 13-14个×6 · 15+个×15' },
      { symbol: 'candyGreen',  mult: '5-6个×0.25 · 7-8个×0.6 · 9-10个×2 · 11-12个×4 · 13-14个×8 · 15+个×20' },
      { symbol: 'candyYellow', mult: '5-6个×0.3 · 7-8个×0.8 · 9-10个×2.5 · 11-12个×5 · 13-14个×10 · 15+个×25' },
      { symbol: 'candyRed',    mult: '5-6个×0.4 · 7-8个×1 · 9-10个×3 · 11-12个×6 · 13-14个×12 · 15+个×30' },
      { symbol: 'candyPurple', mult: '5-6个×0.5 · 7-8个×1.5 · 9-10个×5 · 11-12个×10 · 13-14个×20 · 15+个×50' },
      { symbol: 'heart',       mult: '5-6个×0.8 · 7-8个×2 · 9-10个×8 · 11-12个×15 · 13-14个×30 · 15+个×75' },
      { symbol: 'star',        mult: '5-6个×1 · 7-8个×2.5 · 9-10个×10 · 11-12个×20 · 13-14个×40 · 15+个×100' },
      { symbol: 'rainbow',     mult: '5-6个×2 · 7-8个×5 · 9-10个×20 · 11-12个×50 · 13-14个×100 · 15+个×250' },
      { symbol: 'lollipop',    mult: '3+ 个 → 免费旋转 10 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '7 × 7',
      '最小 cluster': '5 个',
      '符号数量': '9 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（3+ 棒棒糖）',
      '位置倍率': '×2 ~ ×128',
      '上线日期': '2026-10-02'
    }
  },
  'starlight': {
    name: '星光公主',
    sub: 'Cluster Pays · Tumble 连击 · 乘法器 · 免费旋转',
    images: [],
    intro: '星光公主是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，若再次形成中奖则触发连击。每个连击轮次会掉落随机乘法器，作用于当轮赢分。4 个及以上星星（Scatter）触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次形成中奖则触发 Tumble 连击',
      '每个 Tumble 轮次随机掉落 1~2 个乘法器（×2 ~ ×1000），累加后与当轮赢分相乘',
      '出现 4 个及以上星星（Scatter）触发免费旋转 15 次',
      '免费旋转中每次 Tumble 后可能额外掉落星星，继续累积倍数'
    ],
    prizes: [
      { symbol: 'gemBlue',   mult: '8个×0.25' },
      { symbol: 'gemGreen',  mult: '8个×0.4' },
      { symbol: 'gemYellow', mult: '8个×0.5' },
      { symbol: 'gemPurple', mult: '8个×0.8' },
      { symbol: 'gemRed',    mult: '8个×1' },
      { symbol: 'moon',      mult: '8个×1.5' },
      { symbol: 'crown',     mult: '8个×2' },
      { symbol: 'princess',  mult: '8个×2.5' },
      { symbol: 'heart',     mult: '8个×10' },
      { symbol: 'star',      mult: '4个→FS' }
    ],
    paytable: [
      { symbol: 'gemBlue',    mult: '8-9个×0.25 · 10-11个×0.75 · 12+个×2' },
      { symbol: 'gemGreen',   mult: '8-9个×0.40 · 10-11个×0.90 · 12+个×4' },
      { symbol: 'gemYellow',  mult: '8-9个×0.50 · 10-11个×1.00 · 12+个×5' },
      { symbol: 'gemPurple',  mult: '8-9个×0.80 · 10-11个×1.20 · 12+个×8' },
      { symbol: 'gemRed',     mult: '8-9个×1.00 · 10-11个×1.50 · 12+个×10' },
      { symbol: 'moon',       mult: '8-9个×1.50 · 10-11个×2.00 · 12+个×12' },
      { symbol: 'crown',      mult: '8-9个×2.00 · 10-11个×5.00 · 12+个×15' },
      { symbol: 'princess',   mult: '8-9个×2.50 · 10-11个×10.0 · 12+个×25' },
      { symbol: 'heart',      mult: '8-9个×10.0 · 10-11个×25.0 · 12+个×50' },
      { symbol: 'star',       mult: '4+ 个 → 免费旋转 15 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '10 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（4+ 星星）',
      '最大倍率': '×5000（连击）',
      '上线日期': '2026-10-02'
    }
  },
  'bigbass': {
    name: '大鱼大亨',
    sub: '线式老虎机 · 渔民收集 · 免费旋转',
    images: [],
    intro: '大鱼大亨是一款 5×3 线式老虎机。共 10 条固定中奖线，左起连续 3/4/5 个相同符号即中奖。渔民（Wild）可替代任意普通符号，同时是 Scatter，3+ 触发免费旋转。免费旋转中，金钱鱼（带金额）落地，渔民落地时收集它们。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '5 列 × 3 行 = 15 格',
      '共 10 条固定中奖线，左起连续 3/4/5 个相同符号即中奖',
      '渔民（Wild）可替代任意普通符号',
      '出现 3/4/5 个渔民 → 免费旋转 10/15/20 次',
      '免费旋转中金钱鱼随机落地，带金额 ×0.2 ~ ×2000 线注',
      '每次 spin 落地的渔民会收集该 spin 所有金钱鱼金额',
      '免费旋转分 3 档：收集倍数 ×1 / ×2 / ×3，4 个渔民升一档 +10 次'
    ],
    prizes: [
      { symbol: 'ten',        mult: '3个×0.2' },
      { symbol: 'jack',       mult: '3个×0.2' },
      { symbol: 'queen',      mult: '3个×0.5' },
      { symbol: 'king',       mult: '3个×0.5' },
      { symbol: 'ace',        mult: '3个×1' },
      { symbol: 'fishingRod', mult: '3个×1' },
      { symbol: 'tackleBox',  mult: '3个×2' },
      { symbol: 'dragonfly',  mult: '3个×5' },
      { symbol: 'bass',       mult: '3个×10' },
      { symbol: 'fisherman',  mult: '3个→FS' },
      { symbol: 'moneyFish',  mult: '×0.2~2000' }
    ],
    paytable: [
      { symbol: 'ten',        mult: '3个×0.2 · 4个×0.5 · 5个×2' },
      { symbol: 'jack',       mult: '3个×0.2 · 4个×0.5 · 5个×2' },
      { symbol: 'queen',      mult: '3个×0.5 · 4个×1 · 5个×5' },
      { symbol: 'king',       mult: '3个×0.5 · 4个×1 · 5个×5' },
      { symbol: 'ace',        mult: '3个×1 · 4个×2 · 5个×10' },
      { symbol: 'fishingRod', mult: '3个×1 · 4个×2.5 · 5个×15' },
      { symbol: 'tackleBox',  mult: '3个×2 · 4个×10 · 5个×40' },
      { symbol: 'dragonfly',  mult: '3个×5 · 4个×15 · 5个×75' },
      { symbol: 'bass',       mult: '3个×10 · 4个×50 · 5个×200' },
      { symbol: 'fisherman',  mult: 'Wild/Scatter · 3/4/5 个 → 10/15/20 免费旋转' },
      { symbol: 'moneyFish',  mult: '免费旋转中掉落 · ×0.2 ~ ×2000 · 渔民收集' }
    ],
    info: {
      '游戏类型': '线式老虎机',
      '游戏网格': '5 × 3',
      '中奖线': '10 条',
      '符号数量': '11 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（3+渔民）',
      '上线日期': '2026-10-02'
    }
  }
,
  'aviator': {
    name: '飞行员',
    sub: 'Crash 类 · 实时倍率 · 提现锁定',
    images: [],
    intro: '飞行员是一款 Crash 类即时游戏。每局从 1.00× 开始，倍率随时间指数上升。玩家在飞机爆炸前点「提现」锁定当前倍率，获得 下注 × 倍率 的奖励；没点则爆炸输掉下注。',
    rules: ['点击 − / + 调整下注金额', '点击「下注」开始一局', '倍率从 1.00× 开始指数上升', '任何时刻点「提现」锁定当前倍率', '奖励 = 下注 × 提现倍率', '若倍率在你提现前到达崩点→本局输掉下注', '可设置自动提现倍率，达到后自动锁定'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': 'Crash 类',
      '玩法': '实时倍率 + 提现锁定',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '自动提现': '支持（1.01 ~ 100×）',
      '上线日期': '2026-10-03'
    }
  }
,
  'crash': {
    name: '崩盘',
    sub: 'Crash 类 · 实时倍率 · 提现锁定',
    images: [],
    intro: '崩盘是一款 Crash 类即时游戏。每局从 1.00× 开始，倍率随时间指数上升。玩家在崩盘前点「提现」锁定当前倍率，获得 下注 × 倍率 的奖励。',
    rules: ['点击 − / + 调整下注金额', '点击「下注」开始一局', '倍率从 1.00× 开始指数上升', '任何时刻点「提现」锁定当前倍率', '奖励 = 下注 × 提现倍率', '若倍率在你提现前到达崩点→本局输掉下注', '可设置自动提现倍率，达到后自动锁定'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': 'Crash 类',
      '玩法': '实时倍率 + 提现锁定',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '自动提现': '支持（1.01 ~ 100×）',
      '上线日期': '2026-10-03'
    }
  }
,
  'jetx': {
    name: '喷气机',
    sub: 'Crash 类 · 实时倍率 · 提现锁定',
    images: [],
    intro: '喷气机是一款 Crash 类即时游戏。每局从 1.00× 开始，倍率随时间指数上升。玩家在爆炸前点「提现」锁定当前倍率，获得 下注 × 倍率 的奖励。',
    rules: ['点击 − / + 调整下注金额', '点击「下注」开始一局', '倍率从 1.00× 开始指数上升', '任何时刻点「提现」锁定当前倍率', '奖励 = 下注 × 提现倍率', '若倍率在你提现前到达崩点→本局输掉下注', '可设置自动提现倍率，达到后自动锁定'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': 'Crash 类',
      '玩法': '实时倍率 + 提现锁定',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '自动提现': '支持（1.01 ~ 100×）',
      '上线日期': '2026-10-03'
    }
  }
,
  'blackjack': {
    name: '21点',
    sub: '玩家 vs 庄家 · 要牌停牌加倍',
    images: [],
    intro: '21点是一款经典扑克博弈游戏。玩家与庄家比手牌点数大小，尽量接近 21 点但不超标。玩家可选择要牌、停牌、加倍。庄家 <17 要牌，≥17 停牌。',
    rules: ['点击 − / + 调整下注金额', '点击「下注」开始发牌', '目标：手牌点数尽量接近 21 点（不超 21）', '要牌：再要一张 · 停牌：停止 · 加倍：翻倍下注', '庄家 <17 要牌，≥17 停牌', '普通赢 ×0.92 · 21点 ×1.38 · 和局退回本金'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': '21点',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '上线日期': '2026-10-03'
    }
  }
,
  'roulette-euro': {
    name: '欧洲轮盘',
    sub: '37 格 · 单 0 · 经典轮盘',
    images: [],
    intro: '欧洲轮盘是一款经典轮盘游戏。轮盘共 37 格（数字 1-36 + 单 0）。玩家在注区下注，球落数字决定输赢。',
    rules: ['点击数字格下注', '点击「清除」退还全部下注', '点击「旋转」开始，球落在某数字即开', '单数字 ×35 · 红/黑 · 单/双 · 小/大 各 ×1', '打（1st/2nd/3rd 12） ×2'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': '欧洲轮盘',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '上线日期': '2026-10-03'
    }
  }
,
  'roulette-amer': {
    name: '美式轮盘',
    sub: '38 格 · 双 0 · 经典轮盘',
    images: [],
    intro: '美式轮盘是一款经典轮盘游戏。轮盘共 38 格（数字 1-36 + 0 + 00）。玩家在注区下注，球落数字决定输赢。',
    rules: ['点击数字格下注', '点击「清除」退还全部下注', '点击「旋转」开始，球落在某数字即开', '单数字 ×35 · 红/黑 · 单/双 · 小/大 各 ×1', '打（1st/2nd/3rd 12） ×2'],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': '美式轮盘',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '上线日期': '2026-10-03'
    }
  },
  '1001-mg': {
    name: '1001神秘精灵财富',
    sub: '5×3 · 10 线 · 阿拉伯神话',
    images: [],
    intro: '1001神秘精灵财富是一款 5×3 的 10 线老虎机。汇集神灯、飞毯、宫殿、精灵等阿拉伯神话符号。出现 3 个及以上 Scatter 触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '5 列 × 3 行 = 15 格',
      '共 10 条固定中奖线，左起连续 3/4/5 个相同符号即中奖',
      'Wild（金色 W）可替代任意普通符号',
      '出现 3/4/5 个 Scatter（金色星月）触发免费旋转 10/15/20 次'
    ],
    prizes: [],
    paytable: [],
    info: {
      '游戏类型': '固定线老虎机',
      '游戏网格': '5 × 3',
      '中奖线': '10 条',
      '符号数量': '11 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（3+ Scatter）',
      '上线日期': '2026-10-04'
    }
  }
};

/* ---------- 工具 ---------- */
function getParam(n) {
  var m = location.search.match(new RegExp('[?&]' + n + '=([^&]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

var id = getParam('id') || 'lucky-fruit';
var g = GAMES[id];

function notFound() {
  document.getElementById('gm-name').textContent = '游戏不存在';
  document.getElementById('gm-sub').textContent = '';
  document.getElementById('gm-intro').textContent = '未找到该游戏，请返回首页重新选择。';
  // 关键：即使游戏不存在，返回键也要能点
  var back = document.getElementById('gm-back');
  if (back) {
    back.addEventListener('click', function(e){
      e.preventDefault();
      // 优先 history.back()，失败则跳首页
      try { if (window.history.length > 1) history.back(); else location.replace('/'); }
      catch(err) { location.replace('/'); }
    });
  }
  // 隐藏无效按钮（免费试玩、开始游戏、收藏）
  ['gm-fav','gm-demo','gm-start','gm-support','gm-more'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) { el.disabled = true; el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }
  });
}

/* ---------- 轮播 ---------- */
function renderCarousel() {
  var track = document.getElementById('gm-carousel-track');
  var dots = document.getElementById('gm-carousel-dots');
  if (!track || !dots) return;
  var imgs = (g.images && g.images.length) ? g.images : [null, null, null];
  track.innerHTML = imgs.map(function(src){
    if (src) return '<div class="gm-carousel-slide"><img src="' + esc(src) + '" alt=""></div>';
    return '<div class="gm-carousel-slide"><div class="gm-slide-ph"><i class="ri-image-line" aria-hidden="true"></i><span>游戏画面</span></div></div>';
  }).join('');
  dots.innerHTML = imgs.map(function(_, i){
    return '<button type="button" class="gm-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" aria-label="' + (i+1) + '"></button>';
  }).join('');
  var dotEls = dots.querySelectorAll('.gm-dot');
  var n = imgs.length, cur = 0;
  function setA(i) { for (var k = 0; k < dotEls.length; k++) dotEls[k].classList.toggle('active', k === i); }
  function goto(i) { track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }); cur = i; setA(i); }
  setInterval(function(){ if (document.hidden) return; goto((cur + 1) % n); }, 3500);
  var paused = false;
  function pause() { paused = true; setTimeout(function(){ paused = false; }, 6000); }
  track.addEventListener('pointerdown', pause, { passive: true });
  track.addEventListener('touchstart', pause, { passive: true });
  var ticking = false;
  track.addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var w = track.clientWidth; if (!w) return;
      var i = Math.round(track.scrollLeft / w);
      if (i < 0) i = 0; if (i > n - 1) i = n - 1;
      if (i !== cur) { cur = i; setA(i); }
    });
  }, { passive: true });
  dots.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.gm-dot') : null;
    if (!b) return;
    var i = parseInt(b.getAttribute('data-idx'), 10) || 0;
    goto(i); pause();
  });
}

/* ---------- 渲染 ---------- */
function render() {
  document.title = g.name + ' · Apex';
  document.getElementById('gm-top-title').textContent = g.name;
  document.getElementById('gm-name').textContent = g.name;
  document.getElementById('gm-sub').textContent = g.sub;
  document.getElementById('gm-intro').textContent = g.intro;

  document.getElementById('gm-rules').innerHTML = g.rules.map(function(r){
    return '<li>' + esc(r) + '</li>';
  }).join('');

  var prizesEl = document.getElementById('gm-prizes');
  if (!g.prizes || !g.prizes.length) {
    prizesEl.innerHTML = '<p style="color:#999;font-size:13px;padding:8px 0;">本游戏不含固定赔付表，规则见上方说明。</p>';
  } else {
  prizesEl.innerHTML = g.prizes.map(function(pr){
    var lib = getSymLib();
    var svg = (lib && pr.symbol && lib[pr.symbol])
      ? '<span class="gm-sym-inline">' + lib[pr.symbol]() + '</span>'
      : (pr.icon || '');
    return '<div class="gm-prize"><div class="gm-prize-icon">' + svg + '</div>' +
      '<div class="gm-prize-mult">' + esc(pr.mult) + '</div></div>';
  }).join('');
  }

  var paytableEl = document.getElementById('gm-paytable');
  if (!g.paytable || !g.paytable.length) {
    paytableEl.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;font-size:13px;padding:12px 0;">本游戏不含固定赔付表，实时倍率由系统随机生成。</td></tr>';
  } else {
  paytableEl.innerHTML = g.paytable.map(function(pt){
    var lib = getSymLib();
    var symHtml;
    if (lib && pt.symbol && lib[pt.symbol]) {
      var svg = lib[pt.symbol]();
      symHtml = '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>';
    } else {
      symHtml = esc(pt.combo || '');
    }
    return '<tr><td class="gm-combo">' + symHtml + '</td><td>' + esc(pt.mult) + '</td></tr>';
  }).join('');
  }

  var infoHtml = '';
  for (var k in g.info) {
    if (g.info.hasOwnProperty(k)) infoHtml += '<dt>' + esc(k) + '</dt><dd>' + esc(g.info[k]) + '</dd>';
  }
  document.getElementById('gm-info').innerHTML = infoHtml;

  renderCarousel();
}

/* ---------- 收藏 ---------- */
var FAV_KEY = 'apex_fav_games';
function loadFav(){ try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(e){ return []; } }
function saveFav(a){ try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch(e){} }
function isFav(){ return loadFav().indexOf(id) !== -1; }
function updateFavUI(){
  var b = document.getElementById('gm-fav'); if (!b) return;
  var i = b.querySelector('i');
  if (isFav()) { b.classList.add('active'); i.className = 'ri-star-fill'; }
  else { b.classList.remove('active'); i.className = 'ri-star-line'; }
}

/* ---------- 事件 ---------- */
function bindEvents() {
  document.getElementById('gm-fav').addEventListener('click', function(){
    var arr = loadFav(); var idx = arr.indexOf(id);
    if (idx === -1) arr.push(id); else arr.splice(idx, 1);
    saveFav(arr); updateFavUI();
  });
  document.getElementById('gm-support').addEventListener('click', function(){ alert('客服功能开发中'); });
  document.getElementById('gm-demo').addEventListener('click', function(){
    location.href = currentGame().route.html + '?mode=demo';
  });
  document.getElementById('gm-start').addEventListener('click', function(){
    location.href = currentGame().route.html + '?mode=real';
  });
  document.getElementById('gm-more').addEventListener('click', function(){ alert('更多操作开发中'); });

  var back = document.getElementById('gm-back');
  if (back) back.addEventListener('click', function(e){
    e.preventDefault();
    location.replace('/');
  });
}

if (!g) { notFound(); } else { render(); bindEvents(); updateFavUI(); }


if (typeof ApexLoader !== 'undefined') { try { ApexLoader.hide(); } catch(e){} }

/* ===== bfcache 恢复时重新检查（防止侧滑返回显示旧状态） ===== */
window.addEventListener('pageshow', function(e){
  if (e.persisted) {
    // 从 bfcache 恢复
    try {
      var idNow = getParam('id') || 'lucky-fruit';
      var gNow = GAMES[idNow];
      if (gNow) {
        // 有效游戏 → 重渲染确保显示正确
        render();
        bindEvents();
        updateFavUI();
      } else {
        notFound();
      }
      if (typeof ApexLoader !== 'undefined') { try { ApexLoader.hide(); } catch(err){} }
    } catch(err) {
      // 兜底：直接跳首页
      location.replace('/');
    }
  }
});

})();
