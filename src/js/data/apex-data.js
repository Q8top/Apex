// Apex 玩法数据 - 自动生成
// 包含 RULES（所有玩法详细规则）和 MODES_MAP（模式选择映射）
// 由 block-10 通过 window.__apexApexRulesV3 和 window.__apexModesMap 访问

(function () {
  var RULES = {
    'Punto Banco': {
      zh: '标准百家樂',
      tagline: '比较庄（Banker）与闲（Player）的最终点数，9 点为最高点数。玩家选择投注项目后，发牌、补牌及结算均按照固定规则自动完成。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '选择你要投注的项目：庄（Banker）／闲（Player）／和（Tie）／庄对／闲对' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌，系统自动完成。' },
        { n: 3, title: '自动补牌', desc: '根据固定规则判断是否需要第三张牌，玩家无需决定要牌或停牌。' },
        { n: 4, title: '比较点数', desc: '最终点数越接近 9 点的一方获胜。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: [
          '8 + 7 = 15 → 5 点',
          '9 + 6 + 8 = 23 → 3 点'
        ],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '如果庄或闲的前两张牌合计为 8 点或 9 点，称为"天牌（Natural）"。出现天牌时，按照规则不再补第三张牌。',
        examples: [
          '闲：4 + 4 = 8 点 → 闲家天牌',
          '庄：K + 9 = 9 点 → 庄家天牌'
        ],
        note: '若双方均为天牌，则直接比较 8 点或 9 点。'
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '闲家 0–5 点补牌，6–7 点停牌；庄家按照固定规则自动判断。'
      },
      outcome: {
        desc: '比较庄与闲的最终点数：',
        rows: [
          { cond: '庄点数 > 闲点数', result: '庄胜' },
          { cond: '闲点数 > 庄点数', result: '闲胜' },
          { cond: '庄点数 = 闲点数', result: '和（Tie）' }
        ]
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      oddsExample: '例如：下注 100 于庄，庄胜时净赢 95，并返还下注本金 100。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。本版本规则：',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ],
        example: '例如：庄 6 点 · 闲 6 点 → 和局'
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家的前两张牌牌面相同（如 7♠ + 7♥）' },
          { t: '闲对 Player Pair', d: '闲家的前两张牌牌面相同（如 K♣ + K♦）' }
        ],
        note: '标准百家樂对子通常以前两张牌 Rank 相同为准，例如 7+7、K+K。'
      },
      examples: [
        { title: '示例 01｜闲胜', lines: ['闲：7 + 2 = 9 点', '庄：4 + 3 = 7 点'], result: '结果：闲胜' },
        { title: '示例 02｜补第三张牌', lines: ['闲：4 + 2 = 6 点 → 补牌', '第三张：7', '最终：4 + 2 + 7 = 13 → 3 点'], result: '系统继续按庄家规则判断是否补牌。' },
        { title: '示例 03｜和局', lines: ['闲：8 + K = 8 点', '庄：5 + 3 = 8 点'], result: '结果：和局（Tie）' }
      ],
      terms: [
        { en: 'Banker', zh: '庄，庄家一方' },
        { en: 'Player', zh: '闲，闲家一方' },
        { en: 'Tie', zh: '和，庄、闲最终点数相同' },
        { en: 'Natural', zh: '天牌，前两张牌合计为 8 或 9 点' },
        { en: 'Banker Pair', zh: '庄对，庄家前两张牌构成对子' },
        { en: 'Player Pair', zh: '闲对，闲家前两张牌构成对子' },
        { en: 'Point', zh: '点数，庄、闲最终牌面点数，最高为 9 点' }
      ],
      faq: [
        { q: '我可以选择第三张牌吗？', a: '不能。庄、闲是否补第三张牌，以及补哪一张牌，均由发牌结果和固定规则决定。' },
        { q: '10、J、Q、K 算多少点？', a: '均为 0 点。' },
        { q: '为什么 8 + 7 是 5 点？', a: '15 只取个位数：8 + 7 = 15 → 5 点。' },
        { q: '9 点是不是最大的？', a: '是。百家樂最终点数范围为 0–9 点，其中 9 点最高。' },
        { q: '庄和闲都是 8 点怎么办？', a: '判定为和局（Tie）。' },
        { q: '天牌还会继续发第三张牌吗？', a: '不会。庄或闲前两张牌合计为 8 或 9 点时，按照规则停止补牌。' },
        { q: '庄和闲哪个一定更容易赢？', a: '不能根据单局结果确定。每局发牌结果具有随机性，历史结果不能保证下一局结果。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。玩家无法控制具体发牌结果或第三张牌。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },
    'Mini Baccarat': {
      zh: '迷你百家樂',
      tagline: '标准百家樂的小型版本，赌桌更紧凑、节奏更快、限红更低，非常适合新手与快速下注。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '庄（Banker）、闲（Player）、和（Tie），或庄对／闲对。' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌，荷官固定担任庄家。' },
        { n: 3, title: '自动补牌', desc: '按标准百家樂规则判断是否补第三张，玩家无需决策。' },
        { n: 4, title: '比较点数', desc: '点数更接近 9 点的一方获胜。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂完全相同；区别在于赌桌更小（通常 7 座）、限红更低、节奏更快。'
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同（如 7♠ + 7♥）' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同（如 K♣ + K♦）' }
        ]
      },
      terms: [
        { en: 'Banker', zh: '庄，庄家一方' },
        { en: 'Player', zh: '闲，闲家一方' },
        { en: 'Tie', zh: '和，庄闲最终点数相同' },
        { en: 'Natural', zh: '天牌，前两张牌合计为 8 或 9 点' },
        { en: 'Mini Table', zh: '迷你桌，座位少、限红低' }
      ],
      faq: [
        { q: '迷你百家樂和标准百家樂有什么不同？', a: '规则完全一致，只是赌桌更小、限红更低、节奏更快，适合新手。' },
        { q: '庄家由谁担任？', a: '庄家由荷官固定担任，玩家只下注庄或闲，不参与发牌。' },
        { q: '我可以选择第三张牌吗？', a: '不能，补牌规则由系统自动执行。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'No Commission Baccarat': {
      zh: '免佣百家樂',
      tagline: '取消庄家赢时 5% 抽水；庄以 6 点取胜时仅赔 0.5 倍作为补偿，适合长期押庄的玩家。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '庄（Banker）、闲（Player）、和（Tie），或庄对／闲对。' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌。' },
        { n: 3, title: '自动补牌', desc: '按标准规则补第三张，玩家无需决策。' },
        { n: 4, title: '比较点数', desc: '点数更接近 9 点的一方获胜；庄以 6 点赢时赔付减半。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂一致；唯一区别：庄赢不抽 5% 佣金，但庄以 6 点赢只赔 0.5 倍。'
      },
      odds: [
        { name: '庄赢（非 6 点）', value: '1 赔 1' },
        { name: '庄赢（6 点）', value: '1 赔 0.5' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 / 闲对', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'No Commission', zh: '免佣，庄赢不抽 5% 佣金' },
        { en: 'Banker 6', zh: '庄家以 6 点赢，赔付减半' },
        { en: 'Commission', zh: '佣金，标准百家樂抽 5%' }
      ],
      faq: [
        { q: '为什么庄以 6 点赢只赔 0.5 倍？', a: '这是免佣规则对"取消抽水"的补偿，长期统计上更接近公平。' },
        { q: '免佣百家樂更适合什么玩家？', a: '适合长期高频押庄的玩家，避免每局抽水。' },
        { q: '除 6 点外其他赔付和标准百家樂一样吗？', a: '是的，闲、和、对子赔率都相同。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'Speed Baccarat': {
      zh: '极速百家樂',
      tagline: '节奏加速版百家樂，每局约 27 秒（标准约 48 秒），下注窗口更短，适合熟练玩家连续高频下注。',
      quickStart: [
        { n: 1, title: '快速下注', desc: '下注窗口约 15 秒，比标准桌更短。' },
        { n: 2, title: '极速发牌', desc: '荷官发牌节奏明显加快。' },
        { n: 3, title: '自动补牌', desc: '补牌规则与标准百家樂完全一致。' },
        { n: 4, title: '立即结算', desc: '一局结束立即开始下一局，几乎无缝衔接。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂完全一致，仅节奏更快：一局约 27 秒、下注窗口约 15 秒。'
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'Speed', zh: '极速，节奏加快版' },
        { en: 'Bet Window', zh: '下注窗口，一局中可下注的时间' },
        { en: 'Round Time', zh: '每局时长' }
      ],
      faq: [
        { q: '极速百家樂一局多长时间？', a: '约 27 秒，标准百家樂约 48 秒。' },
        { q: '我是不是很容易赶不上下注？', a: '下注窗口约 15 秒，建议提前设定好下注方案。' },
        { q: '规则和标准百家樂一样吗？', a: '完全一致，只是节奏更快。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'Baccarat Variants': {
      zh: '百家樂变体',
      tagline: '在标准百家樂基础上加入额外下注选项与附加赔率的衍生玩法合集，为熟悉规则的玩家提供更多策略。',
      quickStart: [
        { n: 1, title: '选择变体', desc: '常见变体包括 Dragon Bonus、Panda 8、Fortune 6、Squeeze 等。' },
        { n: 2, title: '基础下注', desc: '庄、闲、和的基本下注方式与标准百家樂一致。' },
        { n: 3, title: '附加注', desc: '根据变体不同，可额外押 Dragon / Panda / Fortune 6 等。' },
        { n: 4, title: '结算', desc: '基础注 + 附加注分别独立结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '基础规则与标准百家樂一致；差异在于附加注及对应高赔率。'
      },
      odds: [
        { name: 'Dragon Bonus（自然 9 赢）', value: '1 赔 30' },
        { name: 'Panda 8（闲 8 点赢）', value: '1 赔 25' },
        { name: 'Fortune 6（庄 6 点赢）', value: '1 赔 15' },
        { name: '标准庄 / 闲', value: '1 赔 0.95 / 1 赔 1' },
        { name: '标准和（Tie）', value: '1 赔 8' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'Dragon Bonus', zh: '龙加奖，押对自然赢额外加赔' },
        { en: 'Panda 8', zh: '熊猫 8，闲家以 8 点赢额外加赔' },
        { en: 'Fortune 6', zh: '财富 6，庄家以 6 点赢赔付翻倍' },
        { en: 'Squeeze', zh: '捏牌百家樂，实况慢镜头捏牌' }
      ],
      faq: [
        { q: '变体百家樂和标准百家樂有多大不同？', a: '基础规则完全一致，主要差异在附加注类型与对应高赔率。' },
        { q: '新手适合玩变体吗？', a: '建议先熟悉标准百家樂，再尝试附加注，避免误操作。' },
        { q: 'Dragon Bonus 是什么？', a: '若庄或闲以自然 8 或 9 点取胜，押对一方可获得高额额外赔付。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },
    'Classic Blackjack': {
      zh: '经典21点',
      tagline: '目标：让手中牌点数尽量接近 21 点但不超过。超过 21 点（Bust）立即输，达到 21 点为最强牌。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家 1 张明牌 1 张暗牌。' },
        { n: 2, title: '选择操作', desc: '可选择 Hit（要牌）、Stand（停牌）、Double（加倍）、Split（分牌）。' },
        { n: 3, title: '庄家开牌', desc: '你停牌后，庄家翻暗牌并按规则要牌至 17 点或以上。' },
        { n: 4, title: '比点结算', desc: '比谁更接近 21 点但不超；超 21 点爆牌（Bust）即输。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 点或 11 点（自动取最有利值）' }
        ],
        note: '手牌总点数 = 所有牌点数相加。A 可算 1 或 11，系统自动取不爆牌的最大值。',
        examples: [
          'A + 6 = 7 点或 17 点（自动选 17）',
          'A + 6 + K = 17 点（A 只能算 1）',
          '10 + 10 = 20 点'
        ],
        order: '21 点（Blackjack）> 20 点 > 19 点 > … > 0 点；超过 21 点为 Bust'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K，即 21 点，称为"Blackjack"（天生 21 点），是本游戏最强牌。',
        examples: [
          'A + K = Blackjack（21 点）',
          'A + 10 = Blackjack（21 点）'
        ],
        note: '若你 Blackjack 而庄家不是，通常赔率 1 赔 1.5（3:2）。'
      },
      odds: [
        { name: 'Blackjack（天生 21 点）', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '和局（Push）', value: '退回本金' },
        { name: '保险（Insurance）', value: '1 赔 2' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '若你与庄家点数相同，判定为和局（Push）：',
        rows: [
          { bet: '你与庄家同点数', rule: '退回本金' },
          { bet: '双 Blackjack', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '特殊组合：',
        rows: [
          { t: 'Blackjack', d: '前两张 A + 10/J/Q/K，直接获胜' },
          { t: 'Bust（爆牌）', d: '手牌超过 21 点，立即输' },
          { t: 'Soft Hand（软牌）', d: '手牌含 A 且算 11 点不爆' },
          { t: 'Hard Hand（硬牌）', d: '手牌不含 A 或 A 只能算 1 点' }
        ]
      },
      terms: [
        { en: 'Hit', zh: '要牌，再拿一张' },
        { en: 'Stand', zh: '停牌，不再要牌' },
        { en: 'Double', zh: '加倍，赌注翻倍后再拿一张' },
        { en: 'Split', zh: '分牌，两张同点拆成两手' },
        { en: 'Surrender', zh: '投降，放弃一半赌注' },
        { en: 'Insurance', zh: '保险，庄家明牌为 A 时可投' },
        { en: 'Blackjack', zh: '天生 21 点（前两张 A + 10）' },
        { en: 'Bust', zh: '爆牌，超过 21 点' },
        { en: 'Push', zh: '和局，退回本金' }
      ],
      faq: [
        { q: 'A 算 1 还是 11？', a: '系统自动取不爆牌的最大值。如 A + 6 会算 17 点（软牌）。' },
        { q: '庄家在多少点停牌？', a: '标准规则下庄家在 17 点及以上停牌。' },
        { q: 'Blackjack 和 21 点有区别吗？', a: '有。Blackjack 特指前两张 A + 10/J/Q/K，赔付更高（1 赔 1.5）。' },
        { q: '什么时候可以分牌？', a: '当你前两张牌点数相同时（如 8+8、K+Q）。' },
        { q: '保险值得买吗？', a: '长期来看保险对玩家不利，仅当庄家明牌为 A 时可选，谨慎使用。' }
      ],
      disclaimer: '本游戏根据预设 21 点规则自动结算。不同游戏版本可能存在规则差异（如庄家软 17 是否要牌、能否加倍、能否投降等），请以当前游戏页面显示的规则为准。'
    },

    'European Blackjack': {
      zh: '欧洲21点',
      tagline: '欧洲流行的 21 点变体，庄家一开始只有 1 张牌（没有暗牌），但如果你爆牌庄家直接获胜。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家先只发 1 张明牌（无暗牌）。' },
        { n: 2, title: '选择操作', desc: 'Hit / Stand / Double / Split 均可，但规则略有不同。' },
        { n: 3, title: '庄家补牌', desc: '你停牌后，庄家先补 1 张暗牌，再按规则要牌。' },
        { n: 4, title: '比点结算', desc: '爆牌立即输；否则比较点数，更接近 21 点者胜。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点（自动取最有利值）' }
        ],
        note: 'A 可算 1 或 11，系统自动取不爆牌的最大值。',
        examples: ['A + 9 = 20 点', '10 + K = 20 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，为 Blackjack（21 点）。',
        examples: ['A + K = Blackjack'],
        note: '部分规则下欧洲 21 点 Blackjack 只赔 1:1（而非 3:2）。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1.5（部分版本 1 赔 1）' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '和局（Push）', value: '退回本金' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '欧洲 21 点特色：',
        rows: [
          { t: 'No Hole Card', d: '庄家开局无暗牌' },
          { t: 'Bust and Lose', d: '你爆牌立即输，庄家无需再要牌' },
          { t: 'No Peek', d: '庄家不会提前检查是否 Blackjack' }
        ]
      },
      terms: [
        { en: 'No Hole Card', zh: '无暗牌' },
        { en: 'Hit', zh: '要牌' },
        { en: 'Stand', zh: '停牌' },
        { en: 'Double', zh: '加倍' },
        { en: 'Split', zh: '分牌' },
        { en: 'Blackjack', zh: '天生 21 点' }
      ],
      faq: [
        { q: '欧洲 21 点和美式有什么不同？', a: '主要差异：庄家开局只有 1 张明牌，没有暗牌；你爆牌庄家立即获胜，不需要再补牌。' },
        { q: 'Blackjack 赔付是多少？', a: '多数欧洲 21 点赔 1:1.5，部分版本为 1:1，请查看游戏页面显示。' },
        { q: '可以加倍吗？', a: '通常可以，但部分版本限定只在特定点数上（如 9/10/11）加倍。' }
      ],
      disclaimer: '本游戏根据预设欧洲 21 点规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Spanish 21': {
      zh: '西班牙21点',
      tagline: '从 52 张牌中移除 4 张 10，玩家有多种红利操作（如红利加倍、投降、重新分牌），更利于玩家。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '使用 48 张牌（去掉 4 张 10），你获得 2 张明牌，庄家 1 明 1 暗。' },
        { n: 2, title: '选择操作', desc: 'Hit / Stand / Double / Split / Surrender 均可，无 10 让玩家更容易拿 21 点。' },
        { n: 3, title: '庄家开牌', desc: '你停牌后，庄家翻暗牌并按规则要牌至 17 点或以上。' },
        { n: 4, title: '结算', desc: '比点；21 点赔付 3:2，普通获胜 1:1。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 9', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: '牌组中去掉 4 张 10，其余规则与标准 21 点一致。',
        examples: ['A + K = 21 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，为 Blackjack（21 点），赔付 3:2。',
        examples: ['A + K = Blackjack'],
        note: '西班牙 21 点还有其他红利牌型，如 5 张 21 点自动获胜。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '五张 21 点（5-Card 21）', value: '1 赔 1.5' },
        { name: '六张 21 点', value: '1 赔 2' },
        { name: '七张 21 点', value: '1 赔 3' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '西班牙 21 点特色奖励：',
        rows: [
          { t: '5-Card 21', d: '用 5 张牌达到 21 点，赔付 3:2' },
          { t: '6-Card 21', d: '用 6 张牌达到 21 点，赔付 2:1' },
          { t: '7-Card 21', d: '用 7 张牌达到 21 点，赔付 3:1' },
          { t: '红利分牌', d: '分牌后可加倍，红利更多' }
        ]
      },
      terms: [
        { en: '48-Card Deck', zh: '48 张牌组（无 10）' },
        { en: '5-Card 21', zh: '五张 21 点，红利赔付' },
        { en: 'Surrender', zh: '投降，放弃一半赌注' },
        { en: 'Double Down Rescue', zh: '加倍后投降保一半' }
      ],
      faq: [
        { q: '为什么没有 10 点牌？', a: '西班牙 21 点从 52 张牌中去掉 4 张 10，让玩家更容易拿到 21 点。' },
        { q: '5 张 21 点怎么赔？', a: '通常 1 赔 1.5，具体请以当前游戏页面显示为准。' },
        { q: '可以加倍后投降吗？', a: '西班牙 21 点特有的"加倍救援"（Double Down Rescue），可以保住一半赌注。' }
      ],
      disclaimer: '本游戏根据预设西班牙 21 点规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Blackjack Switch': {
      zh: '21点换牌',
      tagline: '你同时玩两手牌，并可以将两手牌的第二张牌互换。庄家 22 点为和局（Push），但 Blackjack 只赔 1:1。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你同时获得两手牌（各 2 张），庄家 1 明 1 暗。' },
        { n: 2, title: '选择换牌', desc: '可选择是否将两手牌的第二张互换，让牌型更有利。' },
        { n: 3, title: '逐手操作', desc: '对两手牌分别进行 Hit / Stand / Double / Split。' },
        { n: 4, title: '结算', desc: '比点；庄家 22 点直接 Push（和局）。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: '你同时打两手牌，每手独立计算点数。',
        examples: ['A + 9 = 20 点', '10 + K = 20 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时为 Blackjack，但本变体只赔 1:1（而非 3:2）。',
        examples: ['A + K = Blackjack'],
        note: '作为"换牌"的补偿，Blackjack 赔付被降低。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '庄家 22 点（Bust 特殊）', value: 'Push（退回本金）' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '以下情况为和局：',
        rows: [
          { bet: '你与庄家同点数', rule: '退回本金' },
          { bet: '庄家爆牌至 22 点', rule: '退回本金（特殊规则）' }
        ]
      },
      pair: {
        desc: '核心机制：',
        rows: [
          { t: 'Switch（换牌）', d: '将两手牌的第二张互换' },
          { t: '22 Push', d: '庄家 22 点为和局，抵消庄家优势' },
          { t: 'Double After Split', d: '分牌后可以加倍' }
        ]
      },
      terms: [
        { en: 'Switch', zh: '换牌，第二张牌互换' },
        { en: 'Two Hands', zh: '两手牌' },
        { en: '22 Push', zh: '庄家 22 点为和局' }
      ],
      faq: [
        { q: '换牌是强制的吗？', a: '不强制，你可以在下注前选择换或不换。' },
        { q: '为什么 Blackjack 只赔 1:1？', a: '因为换牌让玩家有更大优势，因此 Blackjack 赔付被降低。' },
        { q: '庄家 22 点怎么算？', a: '本变体中庄家爆牌至 22 点判定为和局（Push），退回本金。' }
      ],
      disclaimer: '本游戏根据预设 21 点换牌规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Super Fun 21': {
      zh: '超级 21 点',
      tagline: '21 点变体，几乎任何形式的 21 点都能获得额外奖励，玩家有更多低风险机会。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家 1 明 1 暗。' },
        { n: 2, title: '操作', desc: 'Hit / Stand / Double / Split / Surrender 均可，加倍后可以再要牌。' },
        { n: 3, title: '庄家开牌', desc: '庄家按规则要牌至 17 点或以上。' },
        { n: 4, title: '结算', desc: '比点 + 特殊组合奖励。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: 'A 可算 1 或 11，系统自动取最有利值。',
        examples: ['A + 9 = 20 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，Blackjack 通常赔 1:1（而非 3:2）。',
        examples: ['A + K = Blackjack'],
        note: '作为补偿，Super Fun 21 允许"加倍后继续要牌"。'
      },
      odds: [
        { name: 'Blackjack（一般）', value: '1 赔 1' },
        { name: 'Blackjack（黑桃 A + 黑桃 Blackjack）', value: '1 赔 2' },
        { name: '钻石 Blackjack（6 张未爆）', value: '1 赔 1.5' },
        { name: '五张或以上未爆牌获胜', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: 'Super Fun 21 特殊奖励：',
        rows: [
          { t: '钻石 Blackjack', d: '6 张牌达到 21 点（未爆）赔 1:1.5' },
          { t: '黑桃 Blackjack', d: '黑桃 A + 黑桃 J/Q/K 赔 2:1' },
          { t: '5+ 张未爆', d: '用 5 张或以上牌未爆获胜，赔 1:1.5' },
          { t: '自由加倍', d: '加倍后可以继续要牌' },
          { t: '投降', d: '部分版本支持 Surrender' }
        ]
      },
      terms: [
        { en: 'Diamond Blackjack', zh: '钻石 Blackjack，6 张 21 点' },
        { en: 'Free Double', zh: '自由加倍，加倍后可继续要牌' },
        { en: '5-Card Charlie', zh: '5 张牌未爆自动获胜' }
      ],
      faq: [
        { q: '为什么 Blackjack 只赔 1:1？', a: '因为 Super Fun 21 有更多特殊奖励，因此基础 Blackjack 赔付被降低。' },
        { q: '加倍后能继续要牌吗？', a: '可以，这是 Super Fun 21 的特色规则。' },
        { q: '5 张未爆牌怎么赔？', a: '用 5 张或以上牌未爆获胜，可获 1:1.5 赔付。' }
      ],
      disclaimer: '本游戏根据预设 Super Fun 21 规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },
    "Texas Hold'em": {
      zh: '德州扑克',
      tagline: '全球最流行的扑克游戏。2 张底牌 + 5 张公共牌，用 7 张牌中最好的 5 张组成牌型，多轮下注决胜负。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '庄家左边的两人分别下小盲注和大盲注。' },
        { n: 2, title: '发底牌', desc: '每位玩家发 2 张只有自己可见的底牌。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 → 翻牌圈 → 转牌圈 → 河牌圈，每轮可下注 / 跟注 / 加注 / 弃牌。' },
        { n: 4, title: '比牌', desc: '剩余玩家摊牌，用 7 张牌中最好的 5 张比牌型大小。' }
      ],
      pointCalc: {
        rows: [
          { k: '7 张牌', v: '2 张底牌 + 5 张公共牌' },
          { k: '选 5 张', v: '组成最好的 5 张牌型' },
          { k: '比牌顺序', v: '见下方牌型等级' }
        ],
        note: '牌型越稀有排名越高，同牌型再比点数大小。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺', '9♥ 9♦ 9♣ 9♠ K♦ = 四条'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '牌型等级（从高到低）：',
        examples: [
          '皇家同花顺：A-K-Q-J-10 同花',
          '同花顺：5 张连续且同花',
          '四条：4 张同点数',
          '葫芦：3 张 + 1 对',
          '同花：5 张同花色但顺序不连续'
        ],
        note: '同牌型下比高牌点数。例如 A 高同花大于 K 高同花。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' },
        { name: '弃牌', value: '放弃已投入筹码' }
      ],
      oddsNote: '德州扑克赔率取决于底池总额，非固定 1 赔 X；最终赔率由底池除以你的投入计算。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型等级相同 + 高牌点数相同', rule: '平分底池' },
          { bet: '无法决出胜负', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: 'Blinds（盲注）', d: '强制下注，小盲 / 大盲由庄家位置决定' },
          { t: 'Button（庄家）', d: '每轮移动一位玩家，决定下注顺序' },
          { t: 'Flop（翻牌圈）', d: '发出 3 张公共牌 + 一轮下注' },
          { t: 'Turn（转牌圈）', d: '第 4 张公共牌 + 一轮下注' },
          { t: 'River（河牌圈）', d: '第 5 张公共牌 + 最后一轮下注' }
        ]
      },
      terms: [
        { en: 'Hole Cards', zh: '底牌，只有自己可见' },
        { en: 'Flop / Turn / River', zh: '翻牌 / 转牌 / 河牌圈' },
        { en: 'Check', zh: '过牌，不下注' },
        { en: 'Call', zh: '跟注，跟上当前下注额' },
        { en: 'Raise', zh: '加注，提高下注额' },
        { en: 'Fold', zh: '弃牌，放弃手牌' },
        { en: 'All-in', zh: '全下，投入全部筹码' },
        { en: 'Pot', zh: '底池，所有筹码的池子' },
        { en: 'Showdown', zh: '摊牌' }
      ],
      faq: [
        { q: '德州扑克是玩家对玩家吗？', a: '是，德州扑克是一种玩家之间的对战游戏，玩家互相比牌，而不是和庄家对赌。' },
        { q: '最大可以拿几张公共牌？', a: '公共牌有 5 张，加上你的 2 张底牌，共 7 张，从中选最好的 5 张。' },
        { q: '什么时候可以全下（All-in）？', a: '任何时候都可以，但风险极大，需要谨慎判断。' },
        { q: '如何判断谁先下注？', a: '翻牌前从大盲注左边开始；翻牌后从小盲注位置（庄家左边第一个仍在玩的玩家）开始。' },
        { q: '盲注会变化吗？', a: '现金局盲注固定；锦标赛中盲注会按时间递增。' }
      ],
      disclaimer: '本游戏根据预设德州扑克规则自动完成发牌、下注及结算。不同版本可能存在盲注结构、下注上限、底牌处理等差异，请以当前游戏页面显示的规则为准。'
    },

    "Short Deck Hold'em": {
      zh: '短牌德州扑克',
      tagline: '去掉 2-5 的 36 张牌版本，三条大于顺子，同花大于葫芦。更刺激、更 All-in，深受高手喜爱。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '盲注结构与传统德州相似。' },
        { n: 2, title: '发底牌', desc: '每位玩家 2 张底牌，牌组只含 6-A（36 张）。' },
        { n: 3, title: '四轮下注', desc: 'Pre-flop / Flop / Turn / River 各一轮下注。' },
        { n: 4, title: '比牌', desc: '使用短牌特殊牌型等级（三条 > 顺子）。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组大小', v: '36 张（去掉 2 / 3 / 4 / 5）' },
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '从 7 张牌中选最好的 5 张' }
        ],
        note: '短牌中顺子难度变高，因此三条比顺子更强。',
        examples: ['A♦ K♦ Q♦ J♦ 10♦ = 皇家同花顺', '9♣ 9♥ 9♠ 9♦ A♠ = 四条'],
        order: '皇家同花顺 > 同花顺 > 四条 > 同花 > 葫芦 > 三条 > 顺子 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '短牌特殊规则（与传统德州对比）：',
        examples: [
          '三条 > 顺子（传统：顺子 > 三条）',
          '同花 > 葫芦（传统：葫芦 > 同花）',
          'A 可作为 5 或 10 使用，两种顺子并存'
        ],
        note: '因为牌组去掉了小牌，顺子更难成，所以三条被提升。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '短牌德州赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌点数相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '短牌特色：',
        rows: [
          { t: '36-Card Deck', d: '36 张牌（无 2-5）' },
          { t: 'Ante / Button Blind', d: '常见 Ante 代替小盲' },
          { t: 'Flush > Full House', d: '同花大于葫芦' },
          { t: 'Trips > Straight', d: '三条大于顺子' }
        ]
      },
      terms: [
        { en: 'Short Deck', zh: '短牌' },
        { en: '36-Card', zh: '36 张牌' },
        { en: 'Ante', zh: '底注，所有人强制下注' },
        { en: 'Button Blind', zh: '庄家盲，庄家位代替小盲' }
      ],
      faq: [
        { q: '短牌为什么三条比顺子大？', a: '因为去掉了 2-5，顺子更难成，所以三条被提升到顺子之上。' },
        { q: '短牌比传统德州好赢吗？', a: '难度相近但节奏更快，翻牌前 All-in 更常见。' },
        { q: 'A 可以作为 5 或 10 吗？', a: '可以，短牌允许 A-6-7-8-9 和 10-J-Q-K-A 两种顺子。' }
      ],
      disclaimer: '本游戏根据预设短牌德州规则自动完成发牌、下注及结算。不同版本可能在牌型等级上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Fast Fold Poker': {
      zh: '快速弃牌扑克',
      tagline: '弃牌后立即进入新桌，无需等待其他人。也叫 Zoom / Rush / Speed Poker，节奏极快。',
      quickStart: [
        { n: 1, title: '进入池子', desc: '选择盲注级别，系统自动匹配对手。' },
        { n: 2, title: '快速发牌', desc: '你立即收到 2 张底牌，与其他同级别玩家一起成桌。' },
        { n: 3, title: '决策', desc: '下注 / 跟注 / 加注 / 弃牌，与普通德州一致。' },
        { n: 4, title: '弃牌 → 换桌', desc: '若你弃牌，系统立即把你放进新牌局，无需等待。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '从 7 张中选最好的 5 张' },
          { k: '比牌', v: '与传统德州一致' }
        ],
        note: '牌型等级与传统德州完全一致。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'Fast Fold 的核心机制：',
        examples: [
          '弃牌后立即进入新牌桌',
          '每手牌都是全新对手',
          '无需等待其他人完成牌局'
        ],
        note: '适合喜欢高频游戏、不想久等的玩家。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: 'Rake（佣金）', value: '通常为底池的 2.5% - 5%' }
      ],
      oddsNote: '现金局通常抽 Rake；具体数额请以当前游戏页面为准。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'Fast Fold 特色：',
        rows: [
          { t: 'Fast Fold', d: '弃牌即换桌' },
          { t: 'Anonymous', d: '不显示对方用户名' },
          { t: 'Same Stake Pool', d: '只匹配同盲注级别玩家' }
        ]
      },
      terms: [
        { en: 'Zoom Poker', zh: 'PokerStars 品牌的 Fast Fold' },
        { en: 'Rush Poker', zh: 'Full Tilt 品牌的 Fast Fold' },
        { en: 'Speed Poker', zh: 'iPoker 品牌的 Fast Fold' },
        { en: 'Pool', zh: '玩家池，同级别匹配池' }
      ],
      faq: [
        { q: 'Fast Fold 和普通现金局有什么不同？', a: '主要区别是弃牌后立即进入新牌局，无需等待其他人完成当前牌局。' },
        { q: '可以在 Fast Fold 里慢慢玩吗？', a: '可以，但时间限制较严格，超时会被自动弃牌。' },
        { q: 'Fast Fold 公平吗？', a: '是公平的，牌局由随机数生成，玩家池按盲注级别匹配。' }
      ],
      disclaimer: '本游戏根据预设快速弃牌规则自动完成发牌、下注及结算。不同平台品牌不同（Zoom / Rush / Speed），请以当前游戏页面显示的规则为准。'
    },

    'Tournament Poker': {
      zh: '锦标赛扑克',
      tagline: '多桌同时比赛，盲注随时间递增，筹码归零即淘汰，直到产生冠军。',
      quickStart: [
        { n: 1, title: '买入参赛', desc: '支付固定买入（Buy-in）获得起始筹码。' },
        { n: 2, title: '按盲注游戏', desc: '盲注每隔几分钟递增，玩家筹码不变。' },
        { n: 3, title: '淘汰赛制', desc: '筹码归零立即淘汰，无法再买入（或限定次）。' },
        { n: 4, title: '进入钱圈', desc: '存活到奖金区即获得收益，越靠前收益越高。' }
      ],
      pointCalc: {
        rows: [
          { k: '起始筹码', v: '由买入决定，通常 1,000 - 10,000' },
          { k: '盲注结构', v: '每 3 - 10 分钟递增一次' },
          { k: '底牌 / 公共牌', v: '与传统德州一致' }
        ],
        note: '锦标赛的核心是筹码管理，而非一手牌输赢。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '传统德州牌型等级'
      },
      natural: {
        desc: '锦标赛特殊机制：',
        examples: [
          '盲注随时间递增，压力逐渐升高',
          '筹码归零即淘汰',
          '可多次买入（Rebuy 赛制）或单次买入',
          '奖励按名次分配'
        ],
        note: '常见赛制：Rebuy（重买）、Freezeout（单次买入）、Turbo（极速）、Hyper-Turbo（超极速）。'
      },
      odds: [
        { name: '奖金分配', value: '通常前 10%-15% 玩家进入钱圈' },
        { name: '冠军占比', value: '常占总奖池 20%-30%' },
        { name: '买入费', value: '固定' }
      ],
      oddsNote: '锦标赛赔率取决于参赛人数及名次分配，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型相同 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '锦标赛关键术语：',
        rows: [
          { t: 'Buy-in', d: '买入，参赛费用' },
          { t: 'Rebuy', d: '重买，筹码耗尽后再次买入' },
          { t: 'Add-on', d: '增购，中断时额外买入' },
          { t: 'Blind Level', d: '盲注级别，随时间递增' },
          { t: 'ITM', d: 'In The Money，进入奖金区' }
        ]
      },
      terms: [
        { en: 'Freezeout', zh: '单次买入锦标赛' },
        { en: 'Rebuy', zh: '重买赛制' },
        { en: 'Turbo', zh: '极速赛，盲注增长快' },
        { en: 'Hyper-Turbo', zh: '超极速赛' },
        { en: 'Bubble', zh: '泡沫期，快到钱圈时' },
        { en: 'Final Table', zh: '决赛桌' }
      ],
      faq: [
        { q: '筹码用完了还能继续吗？', a: '看赛制：Rebuy 赛可以重买；Freezeout 赛淘汰出局。' },
        { q: '盲注递增会影响策略吗？', a: '会，盲注越高越要激进，否则筹码被蚕食。' },
        { q: 'ITM 是什么意思？', a: 'In The Money，进入奖金区，至少能获得一点奖金。' },
        { q: '什么是泡沫期？', a: '距离进入奖金区只剩一两名玩家时的紧张期。' }
      ],
      disclaimer: '本游戏根据预设锦标赛规则自动完成发牌、下注及结算。不同赛事的盲注结构、重买次数、奖金分配均可能不同，请以当前游戏页面显示的规则为准。'
    },

    'Heads-Up Poker': {
      zh: '单挑扑克',
      tagline: '仅两位玩家对战，位置决定盲注。常用于 SNG 决胜、单挑决斗，是扑克技巧最纯粹的对决形式。',
      quickStart: [
        { n: 1, title: '两人对战', desc: '仅两位玩家参与。' },
        { n: 2, title: '盲注分配', desc: '庄家位下小盲，对手下大盲，翻牌前庄家先行动。' },
        { n: 3, title: '四轮下注', desc: '与德州扑克一致。' },
        { n: 4, title: '比牌', desc: '摊牌比牌型，胜者获得底池。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '7 张中选最好的 5 张' }
        ],
        note: '牌型等级与传统德州完全一致。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'Heads-Up 核心特点：',
        examples: [
          '仅 2 位玩家，位置每手互换',
          '庄家位（Button）= 小盲',
          '翻牌前庄家先行动，翻牌后大盲先行动'
        ],
        note: '单挑中位置极其关键，庄家位有巨大优势。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: 'SNG 决赛', value: '胜者获得约定奖金' }
      ],
      oddsNote: 'Heads-Up 赔率取决于底池总额或约定奖金。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'Heads-Up 特色：',
        rows: [
          { t: 'Button Blind', d: '庄家位下小盲' },
          { t: 'Position Swap', d: '每手互换位置' },
          { t: 'Higher Stakes', d: '单挑赛筹码上升快' }
        ]
      },
      terms: [
        { en: 'Heads-Up', zh: '单挑，两人对战' },
        { en: 'Button Blind', zh: '庄家位盲注' },
        { en: 'Sit & Go', zh: '坐满即开赛（SNG）' },
        { en: '3-Bet', zh: '三次加注，翻牌前再加注' }
      ],
      faq: [
        { q: 'Heads-Up 与普通德州有什么不同？', a: '只有两位玩家，位置每手互换；翻牌前庄家先行动，翻牌后大盲先行动。' },
        { q: '单挑牌局策略一样吗？', a: '不一样。单挑中起手牌范围更广，攻击性更强。' },
        { q: '什么是 SNG？', a: 'Sit & Go：坐满即开赛的锦标赛，常用于 Heads-Up 决胜负。' }
      ],
      disclaimer: '本游戏根据预设单挑德州规则自动完成发牌、下注及结算。不同赛事可能在盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },
    'Omaha': {
      zh: '奥马哈',
      tagline: '每位玩家 4 张底牌 + 5 张公共牌，但只能用底牌中的 2 张 + 公共牌中的 3 张组成 5 张牌型。比德州更刺激、成牌更大。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家发 4 张底牌（德州只有 2 张）。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 → 翻牌圈 → 转牌圈 → 河牌圈。' },
        { n: 4, title: '比牌', desc: '必须用底牌中的恰好 2 张 + 公共牌中的恰好 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成规则', v: '底牌 2 张 + 公共牌 3 张 = 5 张' },
          { k: '比牌', v: '与德州扑克相同牌型等级' }
        ],
        note: '关键区别：必须用 2+3 组合，不能像德州一样任选 5 张。',
        examples: ['底牌 A♠ K♠ 5♦ 5♣，公共牌 Q♠ J♠ 10♠ 3♥ 2♦', '→ 用 A♠ K♠ + Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '奥马哈与传统德州最大的差异是"必须用 2+3 张牌"。',
        examples: [
          '底牌 A♦ A♣ K♠ K♥，公共牌 A♠ A♥ 2♦ 3♣ 4♥',
          '→ 用 A♦ A♣ + A♠ A♥ 2♦ = 四条 A（只能用底牌 2 张）',
          '不能用底牌 4 张 + 公共牌 1 张，也不能用底牌 1 张 + 公共牌 4 张'
        ],
        note: '正因 4 张底牌，奥马哈比德州更容易成大牌，因此下注更激烈。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '奥马哈赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌点数相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '奥马哈关键术语：',
        rows: [
          { t: '4 Hole Cards', d: '4 张底牌' },
          { t: '2+3 Rule', d: '底牌 2 张 + 公共牌 3 张' },
          { t: 'PLO', d: 'Pot-Limit Omaha（限底池奥马哈）' },
          { t: 'Wraps', d: '多顺子听牌' }
        ]
      },
      terms: [
        { en: 'Hole Cards', zh: '底牌（4 张）' },
        { en: 'Board', zh: '公共牌（5 张）' },
        { en: '2+3 Rule', zh: '底牌 2 张 + 公共牌 3 张组合' },
        { en: 'Nuts', zh: '坚果，当前最强可能牌' },
        { en: 'Wraps', zh: '多顺子听牌' },
        { en: 'All-in', zh: '全下' }
      ],
      faq: [
        { q: '奥马哈和德州最大的区别？', a: '奥马哈每位玩家 4 张底牌，且必须用底牌 2 张 + 公共牌 3 张；德州只有 2 张底牌，任意选 5 张。' },
        { q: '可以用 1 张底牌 + 4 张公共牌吗？', a: '不可以，必须恰好 2 张底牌 + 3 张公共牌。' },
        { q: '为什么奥马哈下注更激进？', a: '4 张底牌让玩家更容易成大牌，牌力更接近，因此下注更激烈。' },
        { q: '什么是 PLO？', a: 'Pot-Limit Omaha：底池限注奥马哈，最大下注额为底池金额。' }
      ],
      disclaimer: '本游戏根据预设奥马哈规则自动完成发牌、下注及结算。不同版本可能在底池限注、盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Omaha Hi-Lo': {
      zh: '奥马哈高低',
      tagline: '奥马哈变体——底池分为"高牌"和"低牌"两半，符合条件的低牌也能赢。低牌必须由 5 张不重复且都小于 8 的牌组成。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '与奥马哈相同，小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 4 张底牌。' },
        { n: 3, title: '四轮下注', desc: '与奥马哈一致，翻牌前 / 翻牌 / 转牌 / 河牌。' },
        { n: 4, title: '比牌', desc: '底池分两半：一半给高牌赢家，一半给低牌赢家。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组合规则', v: '底牌 2 张 + 公共牌 3 张（与奥马哈相同）' },
          { k: '低牌条件', v: '5 张不重复且点数 ≤ 8（A 算 1）' }
        ],
        note: '低牌必须由 5 张不同点数的牌组成，且都 ≤ 8（A 可作 1）。',
        examples: ['A-2-3-4-5 = 最佳低牌（轮子）', 'A-2-3-4-6 = 次佳低牌', '有对子或含 9+ 的牌不构成低牌'],
        order: '低牌越小越好：A-2-3-4-5 为最佳'
      },
      natural: {
        desc: 'Hi-Lo 的核心机制：',
        examples: [
          '高牌按传统奥马哈规则比大小',
          '低牌由 5 张不同点数且 ≤ 8 的牌组成',
          '如没有玩家组成合格低牌，则高牌赢家独得全部底池'
        ],
        note: '常见术语：Scoop（同时赢高+低）获得全部底池；Split（分高+低）各得一半。'
      },
      odds: [
        { name: '赢家通吃（Scoop）', value: '获得全部底池' },
        { name: '平分高/低（Split）', value: '高/低各得一半' },
        { name: '无合格低牌', value: '高牌赢家独得全部' }
      ],
      oddsNote: '奥马哈高低赔率取决于底池总额及分池情况。',
      tie: {
        desc: '若两位玩家牌型完全相同：',
        rows: [
          { bet: '高牌相同', rule: '平分高牌部分' },
          { bet: '低牌相同', rule: '平分低牌部分' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: 'Scoop', d: '同时赢高牌和低牌，独得底池' },
          { t: 'Split', d: '一人赢高、一人赢低' },
          { t: 'Qualified Low', d: '合格低牌（5 张 ≤ 8）' },
          { t: 'Wheel', d: '轮子，A-2-3-4-5' }
        ]
      },
      terms: [
        { en: 'Hi-Lo', zh: '高/低分池' },
        { en: 'Scoop', zh: '独得底池' },
        { en: 'Split', zh: '分池' },
        { en: 'Wheel', zh: 'A-2-3-4-5 最佳低牌' },
        { en: 'Qualified Low', zh: '合格低牌' }
      ],
      faq: [
        { q: '什么是"合格低牌"？', a: '5 张不重复且都 ≤ 8 的牌（A 算 1）。不符合条件的玩家不参与低牌争夺。' },
        { q: '如果没人有低牌怎么办？', a: '高牌赢家独得全部底池。' },
        { q: 'Scoop 是什么意思？', a: 'Scoop 指同一位玩家既赢高牌又赢低牌，独得全部底池。' },
        { q: 'A 在低牌里算几点？', a: 'A 在低牌里算 1 点。' }
      ],
      disclaimer: '本游戏根据预设奥马哈高低规则自动完成发牌、下注及结算。不同版本可能在低牌判定标准上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Pot-Limit Omaha': {
      zh: '底池限注奥马哈',
      tagline: '奥马哈最流行的现金局形式：最大下注额 = 当前底池金额。节奏稳健，观赏性强，是职业玩家最爱。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 4 张底牌。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 / 翻牌 / 转牌 / 河牌，每轮下注上限 = 底池。' },
        { n: 4, title: '比牌', desc: '底牌 2 张 + 公共牌 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成规则', v: '底牌 2 张 + 公共牌 3 张' },
          { k: '下注上限', v: '当前底池金额' }
        ],
        note: 'PLO 与普通奥马哈唯一的规则差异是下注上限为底池，但打法节奏完全不同。',
        examples: ['底池 $100 → 最大下注 $100', '底牌 2+3 组合规则不变'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'PLO 的下注机制：',
        examples: [
          '翻牌前：最大加注 = 底池',
          '翻牌后：最大下注 = 当前底池',
          '加注规则：Pot Raise = 底池 + 你要跟注的金额',
          '相比 NLH（无限注德州），PLO 风险更可控'
        ],
        note: 'PLO 是职业玩家最爱的现金局形式之一，兼顾节奏与策略。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: 'PLO 赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'PLO 关键术语：',
        rows: [
          { t: 'Pot-Limit', d: '底池限注' },
          { t: 'Pot Raise', d: '底池加注' },
          { t: 'Rebuy', d: '重买' },
          { t: 'Cap', d: '每人最大投入' }
        ]
      },
      terms: [
        { en: 'Pot-Limit', zh: '底池限注' },
        { en: 'Pot Raise', zh: '底池加注' },
        { en: 'Nuts', zh: '当前最强可能牌' },
        { en: 'Tilt', zh: '情绪失控后乱下注' }
      ],
      faq: [
        { q: 'PLO 和普通奥马哈有什么不同？', a: '底牌、组合、比牌规则完全相同；唯一差异是下注上限为底池。' },
        { q: '为什么 PLO 更流行？', a: '相比无限注，PLO 风险更可控；相比限注，PLO 又更刺激，是职业玩家的主流现金局形式。' },
        { q: '底池加注怎么算？', a: 'Pot Raise = 底池总额 + 你跟注的金额 + 你加注的金额。' }
      ],
      disclaimer: '本游戏根据预设底池限注奥马哈规则自动完成发牌、下注及结算。不同平台可能在 Rake、盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Five Card Omaha': {
      zh: '五张奥马哈',
      tagline: '奥马哈变体——每位玩家 5 张底牌（而非 4 张），成牌更容易、牌力更接近，精彩程度更高。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '与奥马哈相同，小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 5 张底牌（比奥马哈多 1 张）。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 / 翻牌 / 转牌 / 河牌。' },
        { n: 4, title: '比牌', desc: '底牌 2 张 + 公共牌 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '5 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组合规则', v: '底牌 2 张 + 公共牌 3 张' },
          { k: '比牌', v: '与奥马哈相同牌型等级' }
        ],
        note: '五张奥马哈的底牌多 1 张，成牌概率显著提升，牌力更接近。',
        examples: ['5 张底牌让玩家有更多 2 张组合可能', '成牌更频繁，All-in 更常见'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '五张奥马哈的关键特点：',
        examples: [
          '5 张底牌 → C(5,2) = 10 种底牌组合',
          '传统奥马哈 4 张底牌 → C(4,2) = 6 种组合',
          '成牌更频繁，听牌更多，牌力更强',
          '常用 PLO5 表示 Pot-Limit Five Card Omaha'
        ],
        note: '五张奥马哈是 PLO 的进阶版本，在职业牌手中越来越流行。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '五张奥马哈赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '五张奥马哈关键：',
        rows: [
          { t: '5 Hole Cards', d: '5 张底牌' },
          { t: '10 Combinations', d: '10 种底牌组合可能' },
          { t: 'PLO5', d: 'Pot-Limit Five Card Omaha 缩写' },
          { t: 'High Variance', d: '波动大，成牌频繁' }
        ]
      },
      terms: [
        { en: 'PLO5', zh: '底池限注五张奥马哈' },
        { en: '5-Card', zh: '五张底牌' },
        { en: 'Combinations', zh: '底牌组合数' },
        { en: 'Wrap', zh: '多顺子听牌' }
      ],
      faq: [
        { q: '五张奥马哈和普通奥马哈的区别？', a: '底牌从 4 张增加到 5 张，其他规则完全一致。' },
        { q: '为什么成牌更频繁？', a: '5 张底牌提供 10 种 2 张组合，比 4 张底牌的 6 种更多，成牌概率显著提升。' },
        { q: 'PLO5 是什么？', a: 'Pot-Limit Five Card Omaha：底池限注五张奥马哈。' }
      ],
      disclaimer: '本游戏根据预设五张奥马哈规则自动完成发牌、下注及结算。不同平台可能在盲注、Rake 上有差异，请以当前游戏页面显示的规则为准。'
    }
,
    'Niu Niu': {
      zh: '牛牛',
      tagline: '亚洲最流行的扑克变体。每位玩家 5 张牌，3 张牌组合成 10 的倍数（牛），另 2 张牌决定牛几。牌型简单刺激，节奏极快。',
      quickStart: [
        { n: 1, title: '下注', desc: '庄家 / 闲家 / 平倍 / 翻倍 等多个位置可选。' },
        { n: 2, title: '发牌', desc: '庄家与每位闲家各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '从 5 张牌中取 3 张，点数相加为 10 的倍数即"有牛"，剩余 2 张相加取个位数为"牛几"。' },
        { n: 4, title: '比牌', desc: '牛数越大越强，牛牛最强；同牛数再比单张牌大小。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点（也就是 0 点）' }
        ],
        note: '3 张牌组合成 10 的倍数称为"牛"，剩余 2 张牌之和的个位数就是牛几。',
        examples: [
          '3 + 4 + 3 = 10（牛），另 2 张 5 + 6 = 11 → 牛一',
          '2 + 8 + 10 = 20（牛），另 2 张 7 + 8 = 15 → 牛五',
          '5 张牌任意 3 张都无法凑成 10 的倍数 → 无牛'
        ],
        order: '牛牛 > 牛九 > 牛八 > 牛七 > 牛六 > 牛五 > 牛四 > 牛三 > 牛二 > 牛一 > 无牛'
      },
      natural: {
        desc: '特殊牌型（牛牛规则的核心看点）：',
        examples: [
          '五小牛：5 张牌点数都 < 5，且总和 ≤ 10（最强牌型）',
          '炸弹牛：5 张牌中有 4 张点数相同',
          '五花牛：5 张牌都是 J/Q/K',
          '牛牛：3 张凑 10，另 2 张之和也是 10 的倍数'
        ],
        note: '特殊牌型优先级：五小牛 > 炸弹牛 > 五花牛 > 牛牛 > 牛九...'
      },
      odds: [
        { name: '五小牛', value: '最高倍数（通常 5 倍或更高）' },
        { name: '炸弹牛', value: '4 倍' },
        { name: '五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 / 牛八 / 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' },
        { name: '无牛', value: '输（或 1 倍）' }
      ],
      oddsNote: '实际倍数因平台而异；「1 赔 X」表示每下注 1 单位获胜后净赢取 X 单位。',
      tie: {
        desc: '若庄与闲牛数相同时，比牌规则如下：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张牌' },
          { bet: '最大单张也相同', rule: '比最大牌的花色（黑桃 > 红桃 > 梅花 > 方块）' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: '牛 (Ngau)', d: '3 张牌凑成 10 的倍数' },
          { t: '无牛', d: '任意 3 张都无法凑成 10 的倍数' },
          { t: '牛牛', d: '3 张凑 10 + 另 2 张也是 10 的倍数' },
          { t: '五小牛', d: '5 张牌都 < 5，总和 ≤ 10' },
          { t: '炸弹牛', d: '4 张点数相同' }
        ]
      },
      terms: [
        { en: 'Niu Niu', zh: '牛牛' },
        { en: 'Ngau', zh: '牛' },
        { en: 'No Ngau', zh: '无牛' },
        { en: 'Ngau Ngau', zh: '牛牛' },
        { en: 'Five Small', zh: '五小牛' },
        { en: 'Bomb', zh: '炸弹牛' },
        { en: 'Five Flowers', zh: '五花牛' }
      ],
      faq: [
        { q: '牛牛怎么判断牛几？', a: '5 张牌中取 3 张相加为 10 的倍数即"有牛"，剩余 2 张相加取个位数，如 5+6=11 就是牛一。' },
        { q: '无牛是什么意思？', a: '5 张牌中任意 3 张都无法凑成 10 的倍数。' },
        { q: '什么是五小牛？', a: '5 张牌点数都小于 5，且总和 ≤ 10，是牛牛最强牌型。' },
        { q: '炸弹牛是什么？', a: '5 张牌中有 4 张点数相同，如四张 7 + 一张 A。' },
        { q: '花色有影响吗？', a: '仅当牛数相同且最大单张也相同时，才比花色大小（黑桃 > 红桃 > 梅花 > 方块）。' }
      ],
      disclaimer: '本游戏根据预设牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数、特殊牌型上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Classic Niu Niu': {
      zh: '经典牛牛',
      tagline: '牛牛的基础版本——标准 5 张牌，标准倍数，规则清晰易上手，是入门牛牛的最佳选择。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '3 张 + 10 的倍数规则。' },
        { n: 4, title: '比牌', desc: '牛数越大越强；同牛比单张。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '3 张凑 10 的倍数为牛，另 2 张取个位数为牛几。',
        examples: ['3+4+3=10，5+6=11 → 牛一', '5 张牌无法凑 10 → 无牛'],
        order: '牛牛 > 牛九 > 牛八 > 牛七 > 牛六 > 牛五 > 牛四 > 牛三 > 牛二 > 牛一 > 无牛'
      },
      natural: {
        desc: '经典牛牛的固定规则：',
        examples: [
          '五小牛：5 张都 < 5 且总和 ≤ 10',
          '炸弹牛：4 张相同',
          '五花牛：5 张都是 J/Q/K',
          '牛牛：3+2 组合都凑 10 的倍数'
        ],
        note: '特殊牌型倍数统一：五小牛 > 炸弹牛 = 五花牛 > 牛牛 > 牛九...'
      },
      odds: [
        { name: '五小牛', value: '5 倍' },
        { name: '炸弹牛 / 五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 ~ 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' }
      ],
      oddsNote: '倍数固定，实际赔率以下注规则为准。',
      tie: {
        desc: '牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '经典牛牛特色：',
        rows: [
          { t: 'Standard Rules', d: '标准 5 张牌、固定倍数' },
          { t: 'Simple', d: '无额外附加注，规则最清晰' },
          { t: 'Beginner Friendly', d: '适合新手入门' }
        ]
      },
      terms: [
        { en: 'Classic', zh: '经典' },
        { en: 'Standard Rules', zh: '标准规则' },
        { en: 'Beginner Friendly', zh: '新手友好' }
      ],
      faq: [
        { q: '经典牛牛和普通牛牛有什么不同？', a: '规则基本一致，经典牛牛倍数固定、无附加注，更容易上手。' },
        { q: '新手推荐玩哪种？', a: '推荐先玩经典牛牛熟悉规则，再尝试超级牛牛或奖励牛牛。' }
      ],
      disclaimer: '本游戏根据预设经典牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Super Niu Niu': {
      zh: '超级牛牛',
      tagline: '牛牛进阶版——加入更多特殊牌型和更高倍数，如超级五小牛、超级炸弹等，刺激度大幅提升。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '标准 3+2 组合。' },
        { n: 4, title: '结算', desc: '特殊牌型倍数更高。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '超级牛牛新增特殊牌型：',
        examples: [
          '超级五小牛：5 张都 < 5 且总和 ≤ 10，倍数提升至 7-10 倍',
          '超级炸弹牛：4 张相同 + 额外倍率',
          '同花牛：5 张牌同一花色',
          '顺子牛：5 张牌连续'
        ],
        note: '超级牛牛的特殊牌型更多、倍数更高。'
      },
      odds: [
        { name: '超级五小牛', value: '7 - 10 倍' },
        { name: '超级炸弹牛', value: '5 - 6 倍' },
        { name: '同花牛 / 顺子牛', value: '4 - 5 倍' },
        { name: '五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 ~ 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' }
      ],
      oddsNote: '实际倍数因平台而异。',
      tie: {
        desc: '牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '超级牛牛特色：',
        rows: [
          { t: '超级五小牛', d: '更高倍数（7-10 倍）' },
          { t: '同花牛', d: '5 张同一花色' },
          { t: '顺子牛', d: '5 张连续牌' },
          { t: 'High Volatility', d: '波动大，刺激度高' }
        ]
      },
      terms: [
        { en: 'Super', zh: '超级' },
        { en: 'Same Suit', zh: '同花牛' },
        { en: 'Straight', zh: '顺子牛' },
        { en: 'High Volatility', zh: '高波动' }
      ],
      faq: [
        { q: '超级牛牛和经典牛牛的区别？', a: '超级牛牛增加特殊牌型（如同花牛、顺子牛），倍数也更高。' },
        { q: '超级五小牛怎么算？', a: '5 张牌都 < 5 且总和 ≤ 10，倍数通常 7-10 倍。' },
        { q: '适合什么玩家？', a: '适合追求刺激、能承受高波动的高阶玩家。' }
      ],
      disclaimer: '本游戏根据预设超级牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数、特殊牌型上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Bonus Niu Niu': {
      zh: '奖励牛牛',
      tagline: '牛牛变体——除基础牛数外，加入多种附加注和奖励机制，如押牛牛、押特定牛数、押特殊牌型，增加玩法深度。',
      quickStart: [
        { n: 1, title: '基础下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '附加注', desc: '可额外押"出牛牛"、"出五小牛"、"出炸弹牛"等。' },
        { n: 3, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 4, title: '结算', desc: '基础注 + 附加注分别独立结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典牛牛一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '奖励牛牛特色：',
        examples: [
          '基础牛牛：3+2 组合，标准倍数',
          '附加注：押"开出牛牛"或"开出五小牛"',
          '连开奖励：连续开出特定牌型可获额外奖励',
          '庄闲对押：庄和闲各下一个注，双重刺激'
        ],
        note: '附加注让玩家在基础玩法之外有更多策略选择。'
      },
      odds: [
        { name: '基础牛牛', value: '3 倍' },
        { name: '附加：出牛牛', value: '5 - 8 倍' },
        { name: '附加：出五小牛', value: '20 - 50 倍' },
        { name: '附加：出炸弹牛', value: '15 - 30 倍' },
        { name: '附加：出五花牛', value: '10 - 20 倍' }
      ],
      oddsNote: '附加注赔率较高，中奖概率较低，请理性下注。',
      tie: {
        desc: '基础注牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '奖励牛牛特色：',
        rows: [
          { t: 'Side Bets', d: '附加注类型' },
          { t: 'Bonus on Ngau Ngau', d: '开出牛牛额外奖励' },
          { t: 'Streak Bonus', d: '连开奖励' },
          { t: 'Double Bet', d: '庄闲双押' }
        ]
      },
      terms: [
        { en: 'Bonus', zh: '奖励' },
        { en: 'Side Bet', zh: '附加注' },
        { en: 'Streak', zh: '连开' },
        { en: 'Double Bet', zh: '双押' }
      ],
      faq: [
        { q: '奖励牛牛和经典牛牛的区别？', a: '奖励牛牛增加多种附加注和连开奖励，玩法更丰富。' },
        { q: '附加注有优势吗？', a: '附加注赔率高，但中奖概率低，长期看平衡。' },
        { q: '连开奖励是什么？', a: '连续多局开出特定牌型可获得额外奖励。' }
      ],
      disclaimer: '本游戏根据预设奖励牛牛规则自动完成发牌、组合及结算。不同平台可能在附加注类型、倍率上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Variant Niu Niu': {
      zh: '变体牛牛',
      tagline: '牛牛变体合集——包含多种变体规则，如换牌牛牛、无牛翻倍、明牌牛牛等，让游戏更具策略性。',
      quickStart: [
        { n: 1, title: '选择变体', desc: '如换牌牛牛 / 明牌牛牛 / 无牛翻倍。' },
        { n: 2, title: '下注', desc: '选择庄 / 闲。' },
        { n: 3, title: '发牌 + 变体操作', desc: '根据变体不同，可能允许换牌或明牌。' },
        { n: 4, title: '比牌', desc: '牛数越大越强；变体特殊规则可能影响结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典牛牛一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '常见牛牛变体：',
        examples: [
          '换牌牛牛：可换 1-2 张牌再组合',
          '明牌牛牛：部分牌面公开，增加策略性',
          '无牛翻倍：出现"无牛"时翻倍赔付',
          '双庄牛牛：两位庄家，玩家可选押哪一方',
          '倍数牛牛：不同牛数对应不同倍数（更细致）'
        ],
        note: '变体规则多样，具体以当前游戏页面显示为准。'
      },
      odds: [
        { name: '基础牛牛', value: '3 倍' },
        { name: '无牛翻倍', value: '若出现无牛，翻倍结算' },
        { name: '换牌牛牛', value: '换牌后赔率可能调整' },
        { name: '双庄牛牛', value: '两位庄家分别结算' }
      ],
      oddsNote: '变体规则多样，实际赔率以当前游戏页面显示的规则为准。',
      tie: {
        desc: '基础牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '变体牛牛特色：',
        rows: [
          { t: 'Swap Niu Niu', d: '换牌牛牛' },
          { t: 'Open Card', d: '明牌牛牛' },
          { t: 'No Ngau Multiplier', d: '无牛翻倍' },
          { t: 'Double Banker', d: '双庄牛牛' }
        ]
      },
      terms: [
        { en: 'Variant', zh: '变体' },
        { en: 'Swap', zh: '换牌' },
        { en: 'Open Card', zh: '明牌' },
        { en: 'Double Banker', zh: '双庄' }
      ],
      faq: [
        { q: '变体牛牛和经典牛牛的区别？', a: '变体牛牛引入换牌、明牌、无牛翻倍等特殊规则，策略性更强。' },
        { q: '换牌牛牛能换几张？', a: '通常允许换 1-2 张，具体以当前游戏页面显示为准。' },
        { q: '哪种变体最刺激？', a: '无牛翻倍和明牌牛牛刺激度较高。' }
      ],
      disclaimer: '本游戏根据预设变体牛牛规则自动完成发牌、组合及结算。不同平台差异较大，请以当前游戏页面显示的规则为准。'
    }

  };

  var MODES_MAP = {
    'Baccarat': [
      { en: 'Punto Banco', zh: '彭托银行' },
      { en: 'Mini Baccarat', zh: '迷你百家樂' },
      { en: 'No Commission Baccarat', zh: '免佣百家樂' },
      { en: 'Speed Baccarat', zh: '极速百家樂' },
      { en: 'Baccarat Variants', zh: '百家樂变体' }
    ],
    'Blackjack': [
      { en: 'Classic Blackjack', zh: '经典21点' },
      { en: 'European Blackjack', zh: '欧洲21点' },
      { en: 'Spanish 21', zh: '西班牙21点' },
      { en: 'Blackjack Switch', zh: '21点换牌' },
      { en: 'Super Fun 21', zh: '超级21点' }
    ],
    "Texas Hold'em": [
      { en: "Texas Hold'em", zh: '德州扑克' },
      { en: "Short Deck Hold'em", zh: '短牌德州' },
      { en: 'Fast Fold Poker', zh: '快速弃牌' },
      { en: 'Tournament Poker', zh: '锦标赛扑克' },
      { en: 'Heads-Up Poker', zh: '单挑扑克' }
    ],
    'Omaha': [
      { en: 'Omaha', zh: '奥马哈' },
      { en: 'Omaha Hi-Lo', zh: '奥马哈高低' },
      { en: 'Pot-Limit Omaha', zh: '底池限注奥马哈' },
      { en: 'Five Card Omaha', zh: '五张奥马哈' }
    ],
    'Niu Niu': [
      { en: 'Niu Niu', zh: '牛牛' },
      { en: 'Classic Niu Niu', zh: '经典牛牛' },
      { en: 'Super Niu Niu', zh: '超级牛牛' },
      { en: 'Bonus Niu Niu', zh: '奖励牛牛' },
      { en: 'Variant Niu Niu', zh: '变体牛牛' }
    ]
  };

  window.__apexApexRulesV3 = RULES;
  window.__apexModesMap = MODES_MAP;
  console.log('[Apex] data 已加载: ' + Object.keys(RULES).length + ' 个玩法, ' + Object.keys(MODES_MAP).length + ' 个模式表');
})();
