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
,
    'Classic Slots': {
      zh: '经典老虎机',
      tagline: '最经典的老虎机形式——3 个转轴 + 1 条中奖线。简单直观，中奖画面感强，是最容易上手的老虎机类型。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '选择每转的筹码金额（如 0.1 / 0.5 / 1 / 5）。' },
        { n: 2, title: '按下旋转', desc: '点击 SPIN 按钮，3 个转轴开始旋转。' },
        { n: 3, title: '转轴停下', desc: '转轴逐一停下，显示最终图案组合。' },
        { n: 4, title: '结算', desc: '若图案组合落在中奖线上，则按赔率派彩；否则下注额扣除。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '3 个' },
          { k: '中奖线', v: '1 条水平线' },
          { k: '常见符号', v: 'BAR / 7 / 樱桃 / 铃铛 / 柠檬' },
          { k: '赔付方式', v: '3 个相同符号连成一线' }
        ],
        note: '赔付按符号稀有度决定：7 最高，樱桃最低。',
        examples: [
          '7-7-7 = 最高奖（通常 100x - 1000x）',
          'BAR-BAR-BAR = 中等奖',
          '樱桃-樱桃-樱桃 = 低等奖'
        ],
        order: '777 > BAR > 铃铛 > 柠檬 > 樱桃 > 无匹配'
      },
      natural: {
        desc: '经典老虎机特殊符号：',
        examples: [
          'Wild（百搭）：可以替代任何符号，帮助中奖',
          'Scatter（散点）：无需连成线，任意位置出现 3 个即可触发奖励',
          'Multiplier（倍率）：中奖金额乘以指定倍数',
          'Nudge / Hold：让转轴微调或锁定，增加中奖机会'
        ],
        note: '经典老虎机通常只有 1 条中奖线，符号越稀有赔率越高。'
      },
      odds: [
        { name: '777（三个 7）', value: '通常 100x - 1000x' },
        { name: '3 个 BAR', value: '通常 20x - 100x' },
        { name: '3 个铃铛', value: '通常 10x - 30x' },
        { name: '3 个柠檬', value: '通常 5x - 15x' },
        { name: '3 个樱桃', value: '通常 2x - 5x' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位；本金按结算规则返还。',
      terms: [
        { en: 'Spin', zh: '旋转' },
        { en: 'Reel', zh: '转轴' },
        { en: 'Payline', zh: '中奖线' },
        { en: 'Wild', zh: '百搭符号' },
        { en: 'Scatter', zh: '散点符号' },
        { en: 'RTP', zh: '返还率（Return to Player）' }
      ],
      faq: [
        { q: 'RTP 是什么？', a: '返还率（Return to Player）：理论上每下注 100 单位，长期平均返还的金额。如 RTP 96% 表示长期返还 96 单位。' },
        { q: '结果可以预测吗？', a: '不能。老虎机每次旋转都是独立随机事件，前一次结果不影响下一次。' },
        { q: 'Wild 和 Scatter 有什么区别？', a: 'Wild 可替代任何符号帮助中奖；Scatter 无需连线，任意位置出现指定数量即可触发奖励。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生，每次旋转相互独立。RTP 为长期理论值，短期内可能存在较大波动。'
    },

    'Video Slots': {
      zh: '视频老虎机',
      tagline: '现代老虎机主流形式——5 个转轴 + 20-243 条中奖线，配合 3D 动画、音效、剧情和多种奖励机制，沉浸感强。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '选择每条线的下注金额 × 中奖线数。' },
        { n: 2, title: '旋转', desc: '点击 SPIN 或使用自动旋转。' },
        { n: 3, title: '转轴停下', desc: '转轴逐一停下，系统自动判断中奖组合。' },
        { n: 4, title: '结算 + 特殊奖励', desc: '基础中奖 + 免费旋转 + 倍率 + 特殊符号效果。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '通常 5 个' },
          { k: '中奖线', v: '20 - 243 条' },
          { k: '特殊符号', v: 'Wild / Scatter / Bonus / Multiplier' },
          { k: '赔付方向', v: '通常从左到右' }
        ],
        note: '中奖线越多，中奖频率越高，但单次赔率相应降低。',
        examples: [
          '5 个相同符号 + Wild 替换 = 高额赔付',
          '3+ Scatter 触发免费旋转',
          'Bonus 符号触发额外小游戏'
        ],
        order: '多线中奖 > 单线中奖 > 无中奖'
      },
      natural: {
        desc: '视频老虎机常见奖励机制：',
        examples: [
          'Free Spins（免费旋转）：3+ Scatter 触发，10-20 次免费旋转',
          'Wild Multiplier（百搭倍率）：Wild 参与中奖时乘以倍率',
          'Cascading Reels（连锁消除）：中奖符号消除后新符号落下',
          'Bonus Game（奖励游戏）：进入额外小游戏，可能获得高额奖金'
        ],
        note: '视频老虎机通常有丰富的特色机制，RTP 一般 95% - 97%。'
      },
      odds: [
        { name: '5 同符号', value: '通常 100x - 5000x' },
        { name: '4 同符号', value: '通常 10x - 200x' },
        { name: '3 同符号', value: '通常 1x - 20x' },
        { name: 'Free Spins 触发', value: '10 - 20 次免费旋转' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Payline', zh: '中奖线' },
        { en: 'Wild', zh: '百搭符号' },
        { en: 'Scatter', zh: '散点符号' },
        { en: 'Free Spins', zh: '免费旋转' },
        { en: 'Cascading', zh: '连锁消除' },
        { en: 'Auto Spin', zh: '自动旋转' }
      ],
      faq: [
        { q: '中奖线越多越好吗？', a: '不一定。线越多中奖频率越高，但单次赔率会降低。选择适合自己的线数即可。' },
        { q: '免费旋转会消耗余额吗？', a: '不会。免费旋转是奖励，不扣除余额，中奖金额归玩家。' },
        { q: '什么是 Auto Spin？', a: '自动旋转：设定次数后系统自动连续旋转，无需每次点击。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值，短期内可能存在较大波动。'
    },

    '3-Reel Slots': {
      zh: '三轴老虎机',
      tagline: '仅有 3 个转轴的经典老虎机，符号少、中奖简单、节奏快，适合新手和休闲玩家。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '设定每转的筹码金额。' },
        { n: 2, title: '旋转', desc: '点击 SPIN。' },
        { n: 3, title: '停下', desc: '3 个转轴停止，判断中奖线。' },
        { n: 4, title: '结算', desc: '中奖组合按赔率派彩。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '3 个' },
          { k: '符号数', v: '通常 5-9 种' },
          { k: '中奖线', v: '1 - 5 条' },
          { k: '赔付方向', v: '仅从左到右' }
        ],
        note: '三轴老虎机玩法最直观：3 个转轴 + 少量符号 + 1-5 条中奖线。',
        examples: ['7-7-7 = 最高奖', '樱桃-樱桃-樱桃 = 低等奖'],
        order: '777 > BAR > 铃铛 > 柠檬 > 樱桃 > 无匹配'
      },
      natural: {
        desc: '三轴老虎机常见特色：',
        examples: [
          'Nudge：某个转轴自动微调一格',
          'Hold：某个转轴锁定，其他转轴继续旋转',
          'Multiplier：特殊符号中奖时乘倍率'
        ],
        note: '三轴老虎机简单但刺激，适合喜欢快速节奏的玩家。'
      },
      odds: [
        { name: '三个 7', value: '通常 100x - 1000x' },
        { name: '三个 BAR', value: '通常 20x - 100x' },
        { name: '三个同符号', value: '按符号稀有度决定' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: '3-Reel', zh: '三轴' },
        { en: 'Nudge', zh: '自动微调' },
        { en: 'Hold', zh: '锁定转轴' }
      ],
      faq: [
        { q: '三轴比五轴简单吗？', a: '是的。三轴符号少、中奖线少，规则更直观。' },
        { q: '三轴 RTP 通常多少？', a: '约 92% - 96%，比五轴略低，因为中奖频率更高。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    '5-Reel Slots': {
      zh: '五轴老虎机',
      tagline: '现代老虎机主流——5 个转轴 + 20-243 条中奖线，配合多种特色机制，中奖机会多、奖励更丰富。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '设定每条线的下注额。' },
        { n: 2, title: '旋转', desc: '点击 SPIN 或自动旋转。' },
        { n: 3, title: '停下', desc: '5 个转轴逐一停下。' },
        { n: 4, title: '结算', desc: '判断所有中奖线，多线可同时中奖。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '5 个' },
          { k: '中奖线', v: '20 - 243 条' },
          { k: '符号数', v: '10+ 种' },
          { k: '赔付方向', v: '通常从左到右' }
        ],
        note: '5 轴老虎机中奖概率更高，但单次赔率通常低于 3 轴。',
        examples: ['5 同符号 + Wild 替换 = 高额赔付', '3+ Scatter 触发免费旋转'],
        order: '5 同 > 4 同 > 3 同 > 无中奖'
      },
      natural: {
        desc: '五轴老虎机常见奖励：',
        examples: [
          'Free Spins：10-20 次免费旋转',
          'Wild Multiplier：百搭符号乘倍率',
          'Cascading：中奖符号消除，新符号落下',
          'Bonus Game：进入额外小游戏'
        ],
        note: '五轴老虎机通常 RTP 95% - 97%，奖励机制更丰富。'
      },
      odds: [
        { name: '5 同符号', value: '通常 100x - 5000x' },
        { name: '4 同符号', value: '通常 10x - 200x' },
        { name: '3 同符号', value: '通常 1x - 20x' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: '5-Reel', zh: '五轴' },
        { en: '243 Ways', zh: '243 条中奖方式' },
        { en: 'Payline', zh: '中奖线' }
      ],
      faq: [
        { q: '5 轴比 3 轴好吗？', a: '不是绝对。5 轴中奖频率高但单次赔率低；3 轴相反。看个人偏好。' },
        { q: '什么是 243 Ways？', a: '243 Ways to Win：不是固定线，而是任意位置匹配即可中奖，中奖机会更多。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Multi-Reel': {
      zh: '多轴老虎机',
      tagline: '转轴数量超过 5 个的老虎机（如 6 轴、7 轴、8 轴），中奖方式更多样，通常配合 Megaways 机制。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '设定总下注额。' },
        { n: 2, title: '旋转', desc: '点击 SPIN。' },
        { n: 3, title: '停下', desc: '多轴逐一停下，系统自动计算所有中奖方式。' },
        { n: 4, title: '结算', desc: '按中奖方式派彩。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '6 - 8 个' },
          { k: '每轴符号数', v: '2 - 7 个不等' },
          { k: '中奖方式', v: '可达数十万种' },
          { k: '赔付方向', v: '通常从左到右' }
        ],
        note: '多轴老虎机的转轴数更多，中奖方式也更丰富。',
        examples: ['6 轴 × 每轴 7 格 → 可达 117,649 种中奖方式', '配合 Cascading 机制效果更佳'],
        order: '多轴中奖 > 单轴中奖 > 无中奖'
      },
      natural: {
        desc: '多轴老虎机特色：',
        examples: [
          'Megaways：每轴符号数随旋转变化，可达数十万中奖方式',
          'Cascading Reels：中奖符号消除后新符号落下',
          'Multiplier 累积：每次连锁消除倍率递增',
          'Free Spins 结合高倍率'
        ],
        note: '多轴老虎机波动通常较大，适合追求高额奖金的玩家。'
      },
      odds: [
        { name: '最高奖', value: '可达 10,000x - 50,000x' },
        { name: '免费旋转触发', value: '配合倍率可达更高' },
        { name: '常规中奖', value: '按符号组合计算' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Megaways', zh: '每轴可变符号数机制' },
        { en: 'Ways', zh: '中奖方式数' },
        { en: 'Cascading', zh: '连锁消除' }
      ],
      faq: [
        { q: '多轴老虎机波动大吗？', a: '是。中奖频率较低但单次奖励可能非常高，适合追求刺激的玩家。' },
        { q: '什么是 Ways？', a: 'Ways to Win：中奖方式数。如 117,649 Ways 表示有 117,649 种中奖可能。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。波动较大，请理性游戏。'
    },

    'Branded Slots': {
      zh: '品牌主题老虎机',
      tagline: '基于知名 IP（电影 / 电视剧 / 音乐 / 角色）制作的老虎机，配合 IP 专属动画和音效，沉浸感强。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '设定下注额。' },
        { n: 2, title: '旋转', desc: '点击 SPIN。' },
        { n: 3, title: '观看动画', desc: '品牌元素融入转轴动画和奖励场景。' },
        { n: 4, title: '结算', desc: '基础中奖 + 品牌特色奖励机制。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '通常 5 个' },
          { k: '中奖线', v: '20 - 243 条' },
          { k: '特色机制', v: '与 IP 相关' },
          { k: '赔付方向', v: '通常从左到右' }
        ],
        note: '品牌老虎机与普通视频老虎机规则相同，只是视觉和主题不同。',
        examples: [
          '电影主题：配合电影片段触发免费旋转',
          '电视剧主题：角色符号 + 剧情触发奖励',
          '音乐主题：音符符号 + 节奏触发倍率'
        ],
        order: '品牌特色奖励 > 常规中奖 > 无中奖'
      },
      natural: {
        desc: '品牌老虎机特色机制：',
        examples: [
          '电影片段触发：中奖时播放真实电影片段',
          '角色 Wild：特定角色符号作为百搭',
          '剧情 Bonus：进入与 IP 相关的奖励小游戏',
          '音效强化：配合主题音乐增强沉浸感'
        ],
        note: '品牌老虎机 RTP 通常 95% - 97%。'
      },
      odds: [
        { name: '最高奖', value: '可达 5,000x - 20,000x' },
        { name: '品牌特色奖励', value: '视 IP 而定' },
        { name: '常规中奖', value: '按符号组合计算' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Branded', zh: '品牌主题' },
        { en: 'IP', zh: '知识产权 / 品牌' },
        { en: 'Bonus Feature', zh: '奖励特色' }
      ],
      faq: [
        { q: '品牌老虎机更好赢吗？', a: '不是。品牌只是主题差异，RTP 和波动与普通老虎机接近。' },
        { q: '为什么品牌老虎机下注更贵？', a: '因为 IP 授权成本高，部分品牌机最低下注额比普通老虎机高。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。不同品牌机 RTP 略有差异，请查看具体游戏页面。'
    },

    'Progressive Jackpot': {
      zh: '累进奖池',
      tagline: '每局下注的一部分累积进奖池，奖池越滚越大，直到有人中奖。可达数百万甚至上亿，是老虎机最高奖励形式。',
      quickStart: [
        { n: 1, title: '选择下注', desc: '需下注达到资格线（如最大注），才能参与奖池争夺。' },
        { n: 2, title: '旋转', desc: '每转的一部分（如 1%-3%）自动注入奖池。' },
        { n: 3, title: '触发条件', desc: '符合触发条件（如中 5 个特殊符号）即赢得当前奖池。' },
        { n: 4, title: '领奖', desc: '中奖后奖池清零，从头开始累积。' }
      ],
      pointCalc: {
        rows: [
          { k: '奖池来源', v: '每局下注的一部分' },
          { k: '累积速度', v: '随玩家量增加' },
          { k: '触发方式', v: '中特定符号组合' },
          { k: '奖池规模', v: '数万至数百万' }
        ],
        note: '累进奖池的核心是"越多人玩，奖池越大"。',
        examples: [
          'Mega Moolah 曾超过 2000 万美元',
          'Mega Fortune 曾超过 1700 万欧元',
          '通常每下注 1 单位注入 1% - 3% 至奖池'
        ],
        order: '中奖池符号 > 中其他大奖 > 无中奖'
      },
      natural: {
        desc: '累进奖池常见类型：',
        examples: [
          'Local：单机累积，奖池较小',
          'Network：跨赌场 / 跨平台累积，奖池可达千万',
          'Global：全球累积，奖池最高',
          'Mystery：随机触发，无需特定符号'
        ],
        note: '累进奖池的 RTP 通常略低于普通老虎机（因为部分注入奖池）。'
      },
      odds: [
        { name: 'Mega Jackpot', value: '数百万至数千万' },
        { name: 'Major Jackpot', value: '数万至数十万' },
        { name: 'Minor Jackpot', value: '数百至数千' },
        { name: 'Mini Jackpot', value: '数十至数百' }
      ],
      oddsNote: '奖池金额为实时数额，请以游戏内显示为准。',
      terms: [
        { en: 'Progressive', zh: '累进' },
        { en: 'Local Jackpot', zh: '本地奖池' },
        { en: 'Network Jackpot', zh: '联网奖池' },
        { en: 'Mystery Jackpot', zh: '神秘奖池（随机触发）' }
      ],
      faq: [
        { q: '为什么累进奖池会越来越大？', a: '因为每局下注的一部分被注入奖池。玩家越多，奖池越大。' },
        { q: '中奖后奖池会怎样？', a: '中奖后奖池清零，从头开始累积。' },
        { q: '必须最大下注吗？', a: '通常是的，需达到资格线才能参与奖池争夺。' },
        { q: '累进奖池 RTP 高吗？', a: '整体 RTP 通常略低于普通老虎机，因为部分资金进入奖池。' }
      ],
      disclaimer: '本游戏奖池金额为实时累积值。中奖概率极低，请理性参与。'
    },

    'Fixed Jackpot': {
      zh: '固定奖池',
      tagline: '奖池金额固定（如 10,000 倍下注额），不随累积变化。中奖条件明确，适合追求稳定大奖的玩家。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额。' },
        { n: 2, title: '旋转', desc: '点击 SPIN。' },
        { n: 3, title: '触发', desc: '中特定符号组合即获得固定奖池金额。' },
        { n: 4, title: '结算', desc: '固定奖池 = 固定倍数 × 下注额。' }
      ],
      pointCalc: {
        rows: [
          { k: '奖池金额', v: '固定（如 1,000x - 10,000x）' },
          { k: '触发条件', v: '中特定符号组合' },
          { k: '是否累积', v: '否' },
          { k: '中奖频率', v: '低但可预测' }
        ],
        note: '固定奖池意味着每次中奖金额相同（按下注倍数计）。',
        examples: [
          '下注 1 单位 → 中奖池 = 10,000 单位',
          '下注 10 单位 → 中奖池 = 100,000 单位'
        ],
        order: '固定奖池 > 其他大奖 > 无中奖'
      },
      natural: {
        desc: '固定奖池特点：',
        examples: [
          '奖池金额固定（如 10,000x 下注额）',
          '不随其他玩家下注变化',
          '中奖条件明确（如 5 个特殊符号）',
          '相比累进奖池，中奖概率略高'
        ],
        note: '固定奖池适合追求稳定大奖的玩家。'
      },
      odds: [
        { name: 'Mini Jackpot', value: '通常 100x - 500x' },
        { name: 'Major Jackpot', value: '通常 1,000x - 5,000x' },
        { name: 'Mega Jackpot', value: '通常 5,000x - 10,000x' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Fixed Jackpot', zh: '固定奖池' },
        { en: 'Multiplier', zh: '倍数' },
        { en: 'Trigger', zh: '触发' }
      ],
      faq: [
        { q: '固定奖池和累进奖池哪个好？', a: '固定奖池中奖概率略高，但奖池金额固定；累进奖池金额可能更高但概率极低。' },
        { q: '固定奖池会变化吗？', a: '不会。金额固定，只有下注额影响实际奖金。' }
      ],
      disclaimer: '本游戏奖池金额固定。中奖概率请以游戏内显示为准。'
    },

    'Local Jackpot': {
      zh: '本地奖池',
      tagline: '仅在单个赌场或单个平台累积的奖池。规模小于联网奖池，但玩家池更小，中奖概率相对更高。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定下注额。' },
        { n: 2, title: '旋转', desc: '每转的一部分注入本地奖池。' },
        { n: 3, title: '触发', desc: '中特定符号组合赢得本地奖池。' },
        { n: 4, title: '结算', desc: '奖池清零，从头累积。' }
      ],
      pointCalc: {
        rows: [
          { k: '奖池范围', v: '单机 / 单平台' },
          { k: '累积速度', v: '取决于本地玩家量' },
          { k: '奖池规模', v: '数万至数十万' },
          { k: '中奖频率', v: '高于联网奖池' }
        ],
        note: '本地奖池玩家池小，累积速度慢，但中奖概率更高。',
        examples: ['小平台：数万级', '大平台：数十万级'],
        order: '中奖池 > 其他大奖 > 无中奖'
      },
      natural: {
        desc: '本地奖池特点：',
        examples: [
          '仅在单个平台累积',
          '玩家池小于联网奖池',
          '奖池累积速度慢但中奖概率更高',
          '适合喜欢稳定中奖机会的玩家'
        ],
        note: '本地奖池 RTP 与联网接近，只是中奖概率分布不同。'
      },
      odds: [
        { name: '本地奖池金额', value: '实时累积' },
        { name: '中奖概率', value: '高于联网奖池' }
      ],
      oddsNote: '奖池金额为实时数额，请以游戏内显示为准。',
      terms: [
        { en: 'Local', zh: '本地' },
        { en: 'Standalone', zh: '独立累积' },
        { en: 'Platform Jackpot', zh: '平台奖池' }
      ],
      faq: [
        { q: '本地奖池和联网奖池的区别？', a: '本地奖池仅单个平台累积，玩家池小；联网奖池跨平台累积，金额更高但中奖概率更低。' },
        { q: '本地奖池金额稳定吗？', a: '稳定性取决于该平台玩家量。玩家多则增长快。' }
      ],
      disclaimer: '本游戏奖池金额为实时累积值。请理性参与。'
    },

    'Network Jackpot': {
      zh: '联网奖池',
      tagline: '跨赌场、跨平台累积的巨额奖池。玩家池最大，奖池可达数百万甚至上千万，是老虎机最高奖励形式之一。',
      quickStart: [
        { n: 1, title: '下注', desc: '需最大注（Max Bet）才能参与联网奖池。' },
        { n: 2, title: '旋转', desc: '每转的一部分注入联网奖池。' },
        { n: 3, title: '触发', desc: '中奖池符号组合赢得当前金额。' },
        { n: 4, title: '结算', desc: '中奖后联网奖池清零，重新累积。' }
      ],
      pointCalc: {
        rows: [
          { k: '奖池范围', v: '跨赌场 / 跨平台' },
          { k: '奖池规模', v: '数百万至数千万' },
          { k: '累积速度', v: '快（玩家基数大）' },
          { k: '中奖概率', v: '极低' }
        ],
        note: '联网奖池的核心是"全球玩家一起累积"。',
        examples: [
          'Mega Moolah 曾超过 2,000 万美元',
          'Mega Fortune 曾超过 1,700 万欧元',
          'WOWPot 曾超过 400 万欧元'
        ],
        order: '中奖池 > 其他大奖 > 无中奖'
      },
      natural: {
        desc: '联网奖池特点：',
        examples: [
          '跨平台累积，金额极高',
          '中奖概率极低（百万分之一以下）',
          '通常需要最大注才能参与',
          '中奖后奖池清零，重新开始'
        ],
        note: '联网奖池是老虎机最高奖励形式，但请理性参与。'
      },
      odds: [
        { name: '联网奖池金额', value: '实时累积' },
        { name: '历史最高', value: 'Mega Moolah 超过 2,000 万美元' }
      ],
      oddsNote: '奖池金额为实时数额，请以游戏内显示为准。',
      terms: [
        { en: 'Network', zh: '联网' },
        { en: 'Max Bet', zh: '最大注' },
        { en: 'Linked Jackpot', zh: '联动奖池' }
      ],
      faq: [
        { q: '联网奖池为什么金额这么高？', a: '因为跨平台累积，全球玩家一起注入。' },
        { q: '中奖概率多低？', a: '极低，通常百万分之一以下。请理性参与。' },
        { q: '必须最大注吗？', a: '是的，联网奖池通常要求最大注才能参与。' }
      ],
      disclaimer: '本游戏奖池金额为实时累积值。中奖概率极低，请理性参与。'
    },

    'Mystery Jackpot': {
      zh: '神秘奖池',
      tagline: '无需特定符号组合即可触发的奖池。系统随机挑选玩家，奖励惊喜感强。是老虎机最刺激的奖池形式。',
      quickStart: [
        { n: 1, title: '下注', desc: '每次下注都有机会被随机选中。' },
        { n: 2, title: '旋转', desc: '每次旋转都可能触发。' },
        { n: 3, title: '随机触发', desc: '系统随机挑选玩家，无需特殊符号。' },
        { n: 4, title: '领奖', desc: '中奖后系统弹出提示，奖金立即入账。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发方式', v: '随机' },
          { k: '中奖条件', v: '无需特定符号' },
          { k: '中奖概率', v: '不定（由系统决定）' },
          { k: '奖池规模', v: '可配置' }
        ],
        note: '神秘奖池不依赖符号组合，而是按概率随机触发。',
        examples: [
          '每转有 1/10000 概率触发',
          '随机选中玩家中奖',
          '中奖金额可能相同（固定）或不同（渐进）'
        ],
        order: '随机中奖 > 无中奖'
      },
      natural: {
        desc: '神秘奖池特点：',
        examples: [
          '随机触发，无需特定符号',
          '中奖时机不可预测',
          '有时分等级（Mini / Minor / Major）',
          '给玩家"随时可能中大奖"的期待感'
        ],
        note: '神秘奖池常与固定奖池结合，形成分级奖励体系。'
      },
      odds: [
        { name: 'Mini', value: '数十至数百' },
        { name: 'Minor', value: '数百至数千' },
        { name: 'Major', value: '数千至数万' },
        { name: 'Grand', value: '数十万以上' }
      ],
      oddsNote: '奖池金额及触发概率以游戏内显示为准。',
      terms: [
        { en: 'Mystery', zh: '神秘' },
        { en: 'Random Trigger', zh: '随机触发' },
        { en: 'Tiered', zh: '分级' }
      ],
      faq: [
        { q: '神秘奖池怎么触发？', a: '系统按概率随机触发，不需要特定符号组合。' },
        { q: '神秘奖池公平吗？', a: '公平。触发概率由 RNG 决定，不受玩家行为影响。' },
        { q: '有保底机制吗？', a: '部分神秘奖池有保底机制，如每 N 转必触发一次，但具体以游戏内为准。' }
      ],
      disclaimer: '本游戏奖池触发由随机数生成器（RNG）决定。请理性参与。'
    }
,
    'Megaways': {
      zh: 'Megaways',
      tagline: 'Big Time Gaming 首创的机制——每个转轴上的符号数随旋转实时变化（2-7 个），中奖方式可达数十万种，是老虎机最流行的玩法之一。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定总下注额（无需选择线数）。' },
        { n: 2, title: '旋转', desc: '每个转轴随机显示 2-7 个符号。' },
        { n: 3, title: '自动计算', desc: '系统自动计算所有"相邻转轴相同符号"的中奖方式。' },
        { n: 4, title: '结算', desc: '按中奖方式派彩 + 特色机制奖励。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '通常 6 个 + 1 个横轴' },
          { k: '每轴符号数', v: '2 - 7 个（随旋转变化）' },
          { k: '中奖方式', v: '可达 117,649 种（或更多）' },
          { k: '赔付方向', v: '从左到右相邻匹配' }
        ],
        note: '每轴符号数不同，中奖方式数 = 各轴符号数的乘积。',
        examples: ['6 轴 × 7 格 → 117,649 中奖方式', '6 轴 × 5 格 → 15,625 中奖方式'],
        order: '中奖方式越多，单次赔付越低；反之越高'
      },
      natural: {
        desc: 'Megaways 特色机制：',
        examples: [
          'Cascading Reels：中奖符号消除，新符号从上方落下',
          'Multiplier 递增：每次连锁消除倍率 +1，可达 x10 以上',
          'Free Spins：4+ Scatter 触发 12-20 次免费旋转',
          '最大 Megaways：部分游戏可达 200,704 或 1,000,000 种中奖方式'
        ],
        note: 'Megaways RTP 通常 96% 左右，波动较大。'
      },
      odds: [
        { name: '最高奖', value: '可达 10,000x - 50,000x' },
        { name: '免费旋转触发', value: '4+ Scatter 触发' },
        { name: '常规中奖', value: '按符号组合计算' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Megaways', zh: 'BTG 专利机制' },
        { en: 'Ways to Win', zh: '中奖方式数' },
        { en: 'Cascading', zh: '连锁消除' },
        { en: 'Multiplier', zh: '倍率' }
      ],
      faq: [
        { q: 'Megaways 和普通老虎机的区别？', a: 'Megaways 每轴符号数随旋转变化，中奖方式可达数十万种；普通老虎机符号数固定。' },
        { q: '为什么 Megaways 中奖方式这么多？', a: '中奖方式数 = 每轴符号数的乘积。每轴 2-7 个符号，6 轴可达 117,649 种组合。' },
        { q: 'Megaways 波动大吗？', a: '通常较大，中奖频率不高但单次奖励可能极高。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。Megaways 为 Big Time Gaming 的注册商标。'
    },

    'Cluster Pays': {
      zh: 'Cluster Pays',
      tagline: '无中奖线机制——相同符号以"群组"形式（相邻 5 个以上）连成一片即中奖，配合连锁消除，中奖机会更多。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定总下注额。' },
        { n: 2, title: '旋转', desc: '符号出现在网格中。' },
        { n: 3, title: '识别群组', desc: '系统自动寻找 5 个以上相邻的相同符号。' },
        { n: 4, title: '结算', desc: '群组消失 → 新符号落下 → 可再次连锁中奖。' }
      ],
      pointCalc: {
        rows: [
          { k: '网格', v: '通常 7x7 或 6x5' },
          { k: '中奖条件', v: '5+ 相同符号相邻' },
          { k: '无固定中奖线', v: '任意位置相邻匹配' },
          { k: '连锁', v: '中奖符号消除后新符号落下' }
        ],
        note: 'Cluster Pays 没有固定中奖线，只看"相邻符号群组"。',
        examples: ['9 个相同符号连成一片 → 按 9 个赔付', '连锁消除可多次中奖'],
        order: '群组越大，赔付越高；15+ 群组可达最高赔率'
      },
      natural: {
        desc: 'Cluster Pays 特色机制：',
        examples: [
          'Cluster Size：5-25 个符号群组，越大赔付越高',
          'Cascading：消除后新符号落下，可连锁',
          'Multiplier：连锁中每次倍率递增',
          'Free Spins：特殊符号触发免费旋转'
        ],
        note: 'Cluster Pays RTP 通常 96% 左右，中奖频率高但单次奖励偏小。'
      },
      odds: [
        { name: '15+ 群组', value: '最高赔率（如 50x - 500x）' },
        { name: '10-14 群组', value: '中等赔率' },
        { name: '5-9 群组', value: '低额赔率' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Cluster', zh: '群组' },
        { en: 'Cluster Size', zh: '群组大小' },
        { en: 'Cascading', zh: '连锁消除' }
      ],
      faq: [
        { q: 'Cluster Pays 和普通老虎机有什么不同？', a: 'Cluster Pays 没有中奖线，只看相邻符号群组；普通老虎机需要符号落在线上。' },
        { q: '群组至少几个符号？', a: '通常 5 个，具体以游戏内规则为准。' },
        { q: 'Cluster Pays 更适合什么玩家？', a: '适合喜欢频繁中奖、节奏明快的玩家。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Ways to Win': {
      zh: 'Ways to Win',
      tagline: '介于固定线和 Megaways 之间的机制——每轴符号数固定，但所有位置相邻匹配即可中奖，中奖方式数 = 各轴符号数的乘积。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定总下注额。' },
        { n: 2, title: '旋转', desc: '符号落在固定网格上。' },
        { n: 3, title: '计算', desc: '从左到右相邻转轴上的相同符号，任意位置匹配即中奖。' },
        { n: 4, title: '结算', desc: '按中奖方式派彩。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '通常 5 - 6 个' },
          { k: '每轴符号数', v: '固定（如 3 或 4）' },
          { k: '中奖方式', v: '3^5 = 243 或 4^5 = 1024' },
          { k: '赔付方向', v: '从左到右相邻匹配' }
        ],
        note: 'Ways to Win 是 Megaways 的"固定符号数"版本。',
        examples: ['5 轴 × 3 格 = 243 Ways', '6 轴 × 4 格 = 4,096 Ways'],
        order: 'Ways 越多，中奖频率越高'
      },
      natural: {
        desc: 'Ways to Win 特色：',
        examples: [
          '相邻转轴符号匹配即中奖，无需固定线',
          '中奖方式数 = 各轴符号数乘积',
          '通常配合 Wild / Scatter 增强',
          'RTP 通常 95% - 97%'
        ],
        note: '常见例子：243 Ways（5 轴 3 格）、1024 Ways（5 轴 4 格）。'
      },
      odds: [
        { name: '5 同符号', value: '最高' },
        { name: '4 同符号', value: '中等' },
        { name: '3 同符号', value: '低额' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Ways to Win', zh: '中奖方式' },
        { en: '243 Ways', zh: '243 种中奖方式' },
        { en: '1024 Ways', zh: '1024 种中奖方式' }
      ],
      faq: [
        { q: 'Ways to Win 和 Payline 的区别？', a: 'Payline 是固定中奖线；Ways to Win 是任意位置相邻匹配，中奖方式更多。' },
        { q: 'Ways 越多越好吗？', a: '不绝对。Ways 多则中奖频率高但单次赔率低，看个人偏好。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Cascading Reels': {
      zh: '连锁消除',
      tagline: '中奖符号消失后，上方符号落下形成新组合，可能连续中奖。使单次旋转可以产生多次赔付，刺激度极高。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定下注额。' },
        { n: 2, title: '旋转', desc: '符号落入网格。' },
        { n: 3, title: '中奖消除', desc: '中奖符号消失，上方符号落下填补空位。' },
        { n: 4, title: '连锁循环', desc: '若落下的新符号再次中奖，继续消除，直到无中奖为止。' }
      ],
      pointCalc: {
        rows: [
          { k: '网格', v: '通常 5-7 轴' },
          { k: '中奖方式', v: 'Payline 或 Cluster' },
          { k: '连锁', v: '中奖后符号消失 + 新符号落下' },
          { k: '倍率', v: '每次连锁可递增' }
        ],
        note: '连锁消除中，一次旋转可能触发多次中奖，单次赔付可以叠加。',
        examples: ['第一次中奖 x2 → 消除 → 再次中奖 x3 → 再消除 → 再中奖 x5', '总赔付 = 2 + 3 + 5 = 10 倍'],
        order: '连锁次数越多，总赔付越高'
      },
      natural: {
        desc: 'Cascading Reels 特色：',
        examples: [
          'Multiplier 递增：每次连锁倍率 +1',
          'Free Spins 中连锁更频繁',
          '适合追求"单次高额"的玩家',
          '常见于 Sweet Bonanza、Gates of Olympus 等'
        ],
        note: 'RTP 通常 96% 左右，波动大。'
      },
      odds: [
        { name: '最高奖', value: '可达 5,000x - 21,000x' },
        { name: '单次连锁奖励', value: '视连锁次数决定' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Cascading Reels', zh: '连锁消除' },
        { en: 'Tumble', zh: '同步机制（NetEnt 版本）' },
        { en: 'Multiplier', zh: '连锁倍率' }
      ],
      faq: [
        { q: '连锁消除和普通老虎机有什么不同？', a: '普通老虎机中奖后符号不动；连锁消除中奖符号消失，新符号落下继续中奖。' },
        { q: '连锁最多几次？', a: '理论无上限，实际受网格大小和符号数影响。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。波动较大，请理性游戏。'
    },

    'Tumble': {
      zh: 'Tumble',
      tagline: 'NetEnt 版本的连锁消除机制——中奖符号消除后，上方符号落下，若再次中奖则继续消除。经典 Gonzo\'s Quest 的标志机制。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定下注额。' },
        { n: 2, title: '旋转', desc: '符号落入网格。' },
        { n: 3, title: '中奖消除', desc: '中奖符号消失并崩落。' },
        { n: 4, title: '连锁继续', desc: '落下的符号若再中奖，继续消除，直到稳定。' }
      ],
      pointCalc: {
        rows: [
          { k: '机制', v: '连锁消除' },
          { k: '与 Cascading 区别', v: 'Tumble 是 NetEnt 商标名' },
          { k: '中奖方式', v: 'Payline' },
          { k: '连锁极限', v: '理论无上限' }
        ],
        note: 'Tumble 与 Cascading 机制基本一致，只是不同厂商的命名差异。',
        examples: ['Gonzo\'s Quest：经典 Tumble 游戏', '每次连锁倍率递增'],
        order: '连锁次数越多，赔付越高'
      },
      natural: {
        desc: 'Tumble 特色：',
        examples: [
          '中奖符号消除后新符号落下',
          '连锁可触发免费旋转',
          'Gonzo\'s Quest 的黄金雕像收集机制',
          'RTP 通常 95% - 96%'
        ],
        note: 'Tumble 是 NetEnt 的标志性机制，用于多款经典游戏。'
      },
      odds: [
        { name: '最高奖', value: '可达 2,500x - 10,000x' },
        { name: '连锁奖励', value: '视次数决定' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Tumble', zh: 'NetEnt 连锁机制' },
        { en: 'Cascading', zh: '连锁消除（通用说法）' },
        { en: 'Sticky Wild', zh: '粘性百搭' }
      ],
      faq: [
        { q: 'Tumble 和 Cascading 一样吗？', a: '功能一致，Tumble 是 NetEnt 的商标名，其他厂商通常叫 Cascading。' },
        { q: 'Gonzo\'s Quest 是什么？', a: 'NetEnt 的经典 Tumble 老虎机，被认为是史上最成功的老虎机之一。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。Tumble 是 NetEnt 的注册商标。'
    },

    'Hold & Win': {
      zh: 'Hold & Win',
      tagline: '特殊符号"锁定"在原位，玩家获得若干次重转机会，若期间再有特殊符号落下则再次锁定并重置重转次数。是近年最火爆的老虎机机制。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定下注额。' },
        { n: 2, title: '旋转', desc: '若出现 6+ 特殊符号，触发 Hold & Win。' },
        { n: 3, title: '锁定 + 重转', desc: '特殊符号锁定在原位，玩家获得 3 次重转。' },
        { n: 4, title: '追加 + 结算', desc: '重转期间新特殊符号落下则锁定并重置重转次数，直到结束。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发条件', v: '6+ 特殊符号' },
          { k: '重转次数', v: '初始 3 次' },
          { k: '锁定', v: '特殊符号固定不动' },
          { k: '重置', v: '有新符号落则重转次数重置为 3' }
        ],
        note: 'Hold & Win 的核心是"锁定 + 重转"，用最少的下注获得连续中奖机会。',
        examples: ['6 个硬币符号触发 → 3 次重转 → 新符号落下 → 再 3 次', '最终若填满 15 格 → 触发 Grand Jackpot'],
        order: '特殊符号越多，奖励越高；填满网格触发 Grand Jackpot'
      },
      natural: {
        desc: 'Hold & Win 特色：',
        examples: [
          'Hold & Win Respins：经典重转机制',
          'Jackpot：填满网格触发 Mini / Minor / Major / Grand',
          'Multiplier：每个符号带倍率，最终累积',
          'Free Spins：部分游戏免费旋转中也触发 Hold & Win'
        ],
        note: 'RTP 通常 95% - 96%，波动大，适合追求高额奖励的玩家。'
      },
      odds: [
        { name: 'Grand Jackpot', value: '1,000x - 5,000x' },
        { name: 'Major Jackpot', value: '100x - 500x' },
        { name: 'Minor Jackpot', value: '20x - 100x' },
        { name: 'Mini Jackpot', value: '5x - 20x' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Hold & Win', zh: '锁定重转机制' },
        { en: 'Respin', zh: '重转' },
        { en: 'Coin Symbol', zh: '硬币符号' },
        { en: 'Jackpot', zh: '奖池' }
      ],
      faq: [
        { q: 'Hold & Win 多久触发一次？', a: '视游戏而定，通常几百到几千转触发一次。' },
        { q: '重转期间下注会消耗余额吗？', a: '不会。重转是奖励，不消耗额外下注。' },
        { q: '填满网格有什么用？', a: '填满网格通常触发 Grand Jackpot，是最高奖励。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'All Ways': {
      zh: 'All Ways',
      tagline: '类似 Ways to Win 的机制，但强调"所有方向"或"所有位置"的匹配。常见于经典 Novomatic 或 Amatic 老虎机。',
      quickStart: [
        { n: 1, title: '下注', desc: '设定总下注额。' },
        { n: 2, title: '旋转', desc: '符号落在固定网格上。' },
        { n: 3, title: '全方向匹配', desc: '无论左右还是任意位置，相同符号相邻即中奖。' },
        { n: 4, title: '结算', desc: '按匹配方式派彩。' }
      ],
      pointCalc: {
        rows: [
          { k: '转轴', v: '通常 5 个' },
          { k: '每轴符号数', v: '固定 3 个' },
          { k: '匹配方向', v: '所有方向' },
          { k: '中奖方式', v: '5^3 = 125 或 5^4 = 625' }
        ],
        note: 'All Ways 与 Ways to Win 类似，只是更强调"全方向"。',
        examples: ['5 轴 × 3 格 = 125 Ways', '5 轴 × 4 格 = 625 Ways'],
        order: 'Ways 越多，中奖频率越高'
      },
      natural: {
        desc: 'All Ways 特色：',
        examples: [
          '所有方向相邻符号匹配即中奖',
          '无固定中奖线限制',
          '常见于 Novomatic / Amatic 游戏',
          'RTP 通常 95% 左右'
        ],
        note: 'All Ways 是 Ways to Win 的变体，主要流行于欧洲经典老虎机。'
      },
      odds: [
        { name: '5 同符号', value: '最高' },
        { name: '4 同符号', value: '中等' },
        { name: '3 同符号', value: '低额' }
      ],
      oddsNote: '"Xx"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'All Ways', zh: '全方向中奖' },
        { en: 'Ways', zh: '中奖方式' },
        { en: 'Any Direction', zh: '任意方向' }
      ],
      faq: [
        { q: 'All Ways 和 Ways to Win 一样吗？', a: '基本一致，All Ways 更强调全方向匹配，主要区别在于厂商实现。' },
        { q: 'All Ways 适合什么玩家？', a: '适合喜欢频繁中奖的玩家。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    }
,
    'Free Spins': {
      zh: '免费旋转',
      tagline: '老虎机最经典奖励机制——无需下注即可旋转若干次，中奖金额全部归玩家。通常由 3 个以上 Scatter 触发。',
      quickStart: [
        { n: 1, title: '旋转触发', desc: '3+ Scatter 符号出现在任意位置即触发。' },
        { n: 2, title: '获得次数', desc: '通常 10-20 次免费旋转。' },
        { n: 3, title: '中奖入账', desc: '免费旋转中奖金额全部归玩家。' },
        { n: 4, title: '追加次数', desc: '免费旋转中出现 3+ Scatter 可再追加。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发条件', v: '3+ Scatter 符号' },
          { k: '免费次数', v: '通常 10 - 20 次' },
          { k: '是否消耗余额', v: '否' },
          { k: '追加条件', v: '再出现 3+ Scatter' }
        ],
        note: '免费旋转是老虎机最高频奖励，中奖金额归玩家，不消耗额外下注。',
        examples: ['3 Scatter 触发 10 次免费旋转', '4 Scatter 触发 15 次', '5 Scatter 触发 20 次'],
        order: '5 Scatter > 4 Scatter > 3 Scatter > 无'
      },
      natural: {
        desc: '免费旋转常见特色：',
        examples: [
          'Multiplier：免费旋转中所有中奖 ×2 或 ×3',
          'Retrigger：免费旋转中再触发 Scatter 可追加次数',
          'Sticky Wild：免费旋转中 Wild 会固定在原位',
          'Expanding Wild：Wild 可扩展覆盖整个转轴'
        ],
        note: '免费旋转 RTP 通常占总 RTP 的 30% - 70%。'
      },
      odds: [
        { name: '3 Scatter', value: '10 次免费旋转' },
        { name: '4 Scatter', value: '15 次免费旋转' },
        { name: '5 Scatter', value: '20 次免费旋转' },
        { name: '追加（Retrigger）', value: '再 +5 至 +15 次' }
      ],
      oddsNote: '具体次数以游戏内规则为准。',
      terms: [
        { en: 'Free Spins', zh: '免费旋转' },
        { en: 'Scatter', zh: '散点符号' },
        { en: 'Retrigger', zh: '追加触发' },
        { en: 'Sticky Wild', zh: '粘性百搭' }
      ],
      faq: [
        { q: '免费旋转会消耗余额吗？', a: '不会。免费旋转是纯奖励，不消耗额外下注。' },
        { q: '免费旋转中奖金额有限制吗？', a: '通常无上限，部分游戏可能设置单次最大奖额。' },
        { q: '如何触发免费旋转？', a: '3+ Scatter 符号出现在任意位置即可触发。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。免费旋转次数与倍率以游戏内显示为准。'
    },

    'Bonus Buy': {
      zh: '奖励购买',
      tagline: '直接花钱购买免费旋转或奖励游戏，跳过基础游戏等待。快速进入高波动奖励机制，代价是支付 50-200 倍下注额。',
      quickStart: [
        { n: 1, title: '选择购买', desc: '点击 Buy Bonus 按钮。' },
        { n: 2, title: '支付费用', desc: '支付 50x - 200x 下注额。' },
        { n: 3, title: '立即触发', desc: '直接进入免费旋转或奖励游戏。' },
        { n: 4, title: '中奖入账', desc: '奖励中奖金额归玩家。' }
      ],
      pointCalc: {
        rows: [
          { k: '购买费用', v: '通常 50x - 200x 下注额' },
          { k: '触发内容', v: '免费旋转 / 奖励游戏' },
          { k: '是否需要等待', v: '否，立即触发' },
          { k: '是否消耗余额', v: '是（按购买价扣款）' }
        ],
        note: 'Bonus Buy 适合想跳过基础游戏、直接体验奖励机制的玩家。',
        examples: [
          'Sweet Bonanza Buy Free Spins：100x 下注额',
          'Gates of Olympus Buy Free Spins：100x 下注额',
          'Money Train Buy Bonus：80x 下注额'
        ],
        order: '购买费用越高，通常奖励机制越强'
      },
      natural: {
        desc: 'Bonus Buy 特色：',
        examples: [
          'Feature Buy：直接购买奖励机制',
          'Random Buy：随机触发不同奖励',
          'Bonus Buy 价格通常 50x - 200x',
          '部分游戏支持购买"超级免费旋转"（更贵但更强）'
        ],
        note: 'Bonus Buy RTP 通常与基础游戏一致，但波动更大。'
      },
      odds: [
        { name: '标准购买', value: '100x 下注额' },
        { name: '超级购买', value: '200x 下注额' },
        { name: '奖励返回', value: '理论 RTP 一致' }
      ],
      oddsNote: 'Bonus Buy 为固定价格，非 1 赔 X。',
      terms: [
        { en: 'Bonus Buy', zh: '奖励购买' },
        { en: 'Feature Buy', zh: '特性购买' },
        { en: 'Super Buy', zh: '超级购买' }
      ],
      faq: [
        { q: 'Bonus Buy 划算吗？', a: '不绝对。RTP 与基础游戏一致，但波动更大。适合追求刺激的玩家。' },
        { q: '购买后能退回吗？', a: '不能。购买即视为消费，无论奖励结果如何。' },
        { q: '为什么有些游戏没有 Bonus Buy？', a: '部分司法辖区禁止 Bonus Buy 功能，因此部分游戏不提供。' }
      ],
      disclaimer: '本游戏 Bonus Buy 为可选功能，请理性消费。RTP 为长期理论值。'
    },

    'Pick Bonus': {
      zh: 'Pick Bonus',
      tagline: '奖励小游戏——玩家从若干选项中挑选若干个，每个隐藏不同奖金。选得越多奖金越高，但选择权在玩家手中。',
      quickStart: [
        { n: 1, title: '触发', desc: '3+ Bonus 符号触发 Pick Bonus。' },
        { n: 2, title: '挑选', desc: '从 12-25 个选项中挑选若干个。' },
        { n: 3, title: '揭晓', desc: '每选一个即揭晓隐藏奖金。' },
        { n: 4, title: '结算', desc: '累计所有揭晓金额，即为总奖金。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发条件', v: '3+ Bonus 符号' },
          { k: '选项数', v: '通常 12 - 25 个' },
          { k: '可选次数', v: '3 - 5 次' },
          { k: '奖金', v: '随机分布' }
        ],
        note: 'Pick Bonus 的核心是"玩家选择"，增加参与感。',
        examples: [
          '从 12 个礼盒中选 3 个',
          '从 20 个金币中选 5 个',
          '每个选项奖金 5x - 100x 下注额'
        ],
        order: '选到越多高额选项，总奖金越高'
      },
      natural: {
        desc: 'Pick Bonus 特色：',
        examples: [
          'Pick & Win：经典挑选机制',
          'Collection Bonus：集齐指定符号后触发',
          'Progressive Pick：每次挑选可能触发下一阶段',
          'Multiplier Reveal：挑选结果是倍率'
        ],
        note: 'Pick Bonus 让玩家有"策略参与"的错觉，实际结果早已由 RNG 决定。'
      },
      odds: [
        { name: '单次挑选最高', value: '100x - 500x' },
        { name: '累计最高', value: '500x - 5,000x' },
        { name: '常规挑选', value: '5x - 50x' }
      ],
      oddsNote: 'Xx 表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Pick Bonus', zh: '挑选奖励' },
        { en: 'Pick & Win', zh: '挑选赢奖' },
        { en: 'Reveal', zh: '揭晓' }
      ],
      faq: [
        { q: '挑选顺序影响结果吗？', a: '不影响。所有选项结果由 RNG 提前决定，玩家选择只是动画展示。' },
        { q: 'Pick Bonus 触发概率高吗？', a: '较低，通常几百转触发一次。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。玩家选择不影响最终结果。'
    },

    'Gamble Feature': {
      zh: '赌倍特性',
      tagline: '中奖后选择"赌一把"——猜对颜色 / 花色则奖金翻倍，猜错则全部失去。高风险高回报，刺激度极高。',
      quickStart: [
        { n: 1, title: '中奖', desc: '获得任意中奖。' },
        { n: 2, title: '选择赌倍', desc: '点击 Gamble 按钮。' },
        { n: 3, title: '猜牌', desc: '猜下一张牌颜色（红 / 黑）或花色。' },
        { n: 4, title: '结果', desc: '猜对奖金翻倍，猜错失去全部奖金。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发条件', v: '任意中奖后' },
          { k: '猜颜色', v: '红 / 黑（50% 概率）' },
          { k: '猜花色', v: '♠ ♥ ♣ ♦（25% 概率）' },
          { k: '翻倍率', v: '猜颜色 ×2，猜花色 ×4' }
        ],
        note: 'Gamble Feature 是"全押式"玩法，赢则翻倍，输则归零。',
        examples: [
          '中奖 100 → 猜对颜色 → 200',
          '中奖 100 → 猜对花色 → 400',
          '中奖 100 → 猜错 → 0'
        ],
        order: '猜花色 > 猜颜色 > 不赌'
      },
      natural: {
        desc: 'Gamble Feature 特色：',
        examples: [
          'Color Gamble：猜红或黑（50/50）',
          'Suit Gamble：猜花色（1/4）',
          'Limited Gamble：最多可赌倍若干次',
          'Double or Nothing：真正的"全押式"',
          'Partial Gamble：可赌一半奖金'
        ],
        note: 'Gamble Feature 使短期波动极大，请谨慎使用。'
      },
      odds: [
        { name: '猜对颜色', value: '1 赔 1（奖金翻倍）' },
        { name: '猜对花色', value: '1 赔 3（奖金 ×4）' },
        { name: '猜错', value: '失去全部奖金' }
      ],
      oddsNote: 'Gamble 无庄家优势或劣势（视牌组构成），但波动极大。',
      terms: [
        { en: 'Gamble', zh: '赌倍' },
        { en: 'Double or Nothing', zh: '双倍或归零' },
        { en: 'Partial Gamble', zh: '部分赌倍' }
      ],
      faq: [
        { q: 'Gamble 划算吗？', a: '理论期望相同，但波动极大。短期可能翻倍，也可能归零。' },
        { q: '可以连续赌倍吗？', a: '部分游戏允许，最多可赌若干次。' },
        { q: '输了会怎样？', a: '失去全部中奖金额。' }
      ],
      disclaimer: 'Gamble Feature 波动极大，请谨慎使用。本游戏结果由 RNG 产生。'
    },

    'Multiplier': {
      zh: '倍率',
      tagline: '在基础中奖上乘以倍率——2x / 5x / 10x / 100x 不等，有时可叠加。是老虎机提升单次奖励的核心机制。',
      quickStart: [
        { n: 1, title: '旋转', desc: '设定下注额旋转。' },
        { n: 2, title: '中奖', desc: '基础中奖金额产生。' },
        { n: 3, title: '倍率生效', desc: '若中奖含 Multiplier，按倍率放大。' },
        { n: 4, title: '叠加', desc: '多个 Multiplier 可叠加（乘法或加法，视游戏而定）。' }
      ],
      pointCalc: {
        rows: [
          { k: 'Multiplier 来源', v: 'Wild / 符号 / 特殊机制' },
          { k: '常见倍率', v: '2x / 3x / 5x / 10x / 100x' },
          { k: '叠加方式', v: '乘法或加法' },
          { k: '生效时机', v: '中奖时' }
        ],
        note: 'Multiplier 使基础中奖金额成倍增加，是老虎机核心奖励机制。',
        examples: [
          '基础中奖 10x × Multiplier 5x = 50x',
          '两个 Multiplier 2x + 3x（乘法）= 6x',
          '三个 Multiplier 2x + 3x + 5x（乘法）= 30x'
        ],
        order: 'Multiplier 越高，单次奖励越大'
      },
      natural: {
        desc: 'Multiplier 常见类型：',
        examples: [
          'Wild Multiplier：Wild 参与中奖时生效',
          'Global Multiplier：全局倍率，影响所有中奖',
          'Progressive Multiplier：连锁中倍率递增',
          'Random Multiplier：随机触发倍率'
        ],
        note: 'Gates of Olympus 的 Zeus 随机倍率可达 500x，Sweet Bonanza 的糖果倍率可达 100x。'
      },
      odds: [
        { name: '低倍率', value: '2x - 5x' },
        { name: '中倍率', value: '10x - 50x' },
        { name: '高倍率', value: '100x - 500x' },
        { name: '超高倍率', value: '1,000x 以上' }
      ],
      oddsNote: 'Xx 表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Multiplier', zh: '倍率' },
        { en: 'Global Multiplier', zh: '全局倍率' },
        { en: 'Progressive Multiplier', zh: '递增倍率' }
      ],
      faq: [
        { q: 'Multiplier 可以叠加吗？', a: '部分游戏支持，通常为乘法叠加；具体以游戏内规则为准。' },
        { q: 'Multiplier 什么时候生效？', a: '中奖时生效。若符号未参与中奖，倍率不生效。' }
      ],
      disclaimer: '本游戏结果由 RNG 产生。Multiplier 触发概率以游戏内显示为准。'
    },

    'Respins': {
      zh: '重转',
      tagline: '免费再转若干次，但只重转部分转轴（如 1-3 轴），其他轴锁定。常见于 Hold & Win 机制，中奖机会多。',
      quickStart: [
        { n: 1, title: '触发', desc: '特定条件下触发 Respins。' },
        { n: 2, title: '锁定 + 重转', desc: '部分转轴锁定，其余重转。' },
        { n: 3, title: '追加', desc: '新特殊符号落下则再获得重转。' },
        { n: 4, title: '结算', desc: '重转结束后累计中奖。' }
      ],
      pointCalc: {
        rows: [
          { k: '触发条件', v: '特殊符号 / 特定机制' },
          { k: '重转次数', v: '初始 3 次（或更多）' },
          { k: '重转范围', v: '部分转轴' },
          { k: '追加机制', v: '新符号落下则重置' }
        ],
        note: 'Respins 与 Free Spins 的区别：Respins 通常只重转部分转轴，Free Spins 则全部重转。',
        examples: [
          '6+ 硬币符号触发 → 3 次 Respins',
          'Respins 中新符号落下 → 重置为 3 次',
          '最终按符号数量累积奖金'
        ],
        order: 'Respins 越多，中奖机会越多'
      },
      natural: {
        desc: 'Respins 常见类型：',
        examples: [
          'Hold & Win Respins：经典重转机制',
          'Symbol Respins：特定符号触发重转',
          'Nudge Respins：转轴微调后重转',
          'Sticky Respins：锁定符号重转'
        ],
        note: 'Respins 常与 Hold & Win、Jackpot 机制结合。'
      },
      odds: [
        { name: 'Respins 初始', value: '3 次' },
        { name: '追加次数', value: '每次新符号 +3 次' },
        { name: '累计中奖', value: '视符号数量与数值' }
      ],
      oddsNote: 'Xx 表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Respin', zh: '重转' },
        { en: 'Hold & Win', zh: '锁定重转' },
        { en: 'Sticky Wild', zh: '粘性百搭' }
      ],
      faq: [
        { q: 'Respins 和 Free Spins 的区别？', a: 'Respins 通常只重转部分转轴（其他锁定），Free Spins 则全部重转。' },
        { q: 'Respins 中下注消耗余额吗？', a: '通常不消耗。Respins 是奖励机制。' }
      ],
      disclaimer: '本游戏结果由 RNG 产生。Respins 触发条件以游戏内显示为准。'
    }
,
    'Jacks or Better': {
      zh: 'Jacks or Better',
      tagline: '视频扑克最经典的玩法——一对 J 或更高即获胜。规则简单、RTP 高（99%+），是职业玩家首选。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额（通常 1-5 倍）。' },
        { n: 2, title: '发牌', desc: '系统发 5 张牌，全部明牌。' },
        { n: 3, title: '换牌', desc: '选择保留部分牌，其余换新牌。' },
        { n: 4, title: '结算', desc: '根据最终 5 张牌型派彩。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组', v: '52 张' },
          { k: '起始牌', v: '5 张' },
          { k: '换牌次数', v: '1 次（可选 0-5 张）' },
          { k: '最低中奖', v: '一对 J 或更高' }
        ],
        note: 'Jacks or Better 的最低中奖牌型是"一对 J/Q/K/A"，一对 10 或更低不算中奖。',
        examples: ['一对 J → 1:1', '两对 → 2:1', '三条 → 3:1', '同花 → 6:1'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 J+'
      },
      natural: {
        desc: 'Jacks or Better 牌型等级：',
        examples: [
          '皇家同花顺：A-K-Q-J-10 同花（最高）',
          '同花顺：5 张连续同花',
          '四条：4 张同点数',
          '葫芦：3 张 + 1 对',
          '同花：5 张同花但不连续',
          '顺子：5 张连续但不同花',
          '三条：3 张同点数',
          '两对：两组对子',
          '一对 J / Q / K / A：最低中奖'
        ],
        note: 'Jacks or Better 的 RTP 可达 99.54%，是视频扑克最高之一。'
      },
      odds: [
        { name: '皇家同花顺', value: '1 赔 800' },
        { name: '同花顺', value: '1 赔 50' },
        { name: '四条', value: '1 赔 25' },
        { name: '葫芦', value: '1 赔 9' },
        { name: '同花', value: '1 赔 6' },
        { name: '顺子', value: '1 赔 4' },
        { name: '三条', value: '1 赔 3' },
        { name: '两对', value: '1 赔 2' },
        { name: '一对 J 或更高', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位获胜后净赢取 X 单位。皇家同花顺在 5 倍下注时通常赔 4000 单位。',
      terms: [
        { en: 'Draw', zh: '换牌' },
        { en: 'Hold', zh: '保留牌' },
        { en: 'RTP', zh: '返还率' },
        { en: 'Royal Flush', zh: '皇家同花顺' }
      ],
      faq: [
        { q: '可以换几张牌？', a: '最多 5 张，由你决定。保留越好的牌越好。' },
        { q: '为什么叫 Jacks or Better？', a: '因为最低中奖牌型是一对 J/Q/K/A，一对 10 或更低不算中奖。' },
        { q: 'Jacks or Better RTP 是多少？', a: '最优策略下 RTP 约 99.54%，是视频扑克最高之一。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Deuces Wild': {
      zh: 'Deuces Wild',
      tagline: '视频扑克变体——所有 2 都是 Wild（百搭），可以替代任何牌。中奖更容易，但普通对子赔率降低。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额。' },
        { n: 2, title: '发牌', desc: '发 5 张牌，全部明牌。' },
        { n: 3, title: '换牌', desc: '保留部分牌，其余换新。' },
        { n: 4, title: '结算', desc: '注意 2 是 Wild，参与任何中奖组合。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组', v: '52 张' },
          { k: 'Wild 牌', v: '4 张 2（所有 2）' },
          { k: '起始牌', v: '5 张' },
          { k: '最低中奖', v: '三条（3 of a Kind）' }
        ],
        note: 'Deuces Wild 中 2 是百搭，可以替代任何牌。因此三条即可中奖，但对子不赔付。',
        examples: ['三条 → 1:1', '顺子 → 2:1', '同花 → 2:1', '四条（含 2 张 2）→ 4:1'],
        order: '自然皇家同花顺 > 4 张 2 + A > 野生皇家同花顺 > 5 张 2 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条'
      },
      natural: {
        desc: 'Deuces Wild 特殊规则：',
        examples: [
          '4 张 2（Four Deuces）：最高奖，赔 200x',
          '野生皇家同花顺：用 2 补充的皇家同花顺',
          '5 张 2：赔率极高（1000x）',
          '自然皇家同花顺：不用 2 的皇家同花顺（最高）'
        ],
        note: 'Deuces Wild RTP 在最优策略下约 100.76%（部分版本），是玩家优势版本。'
      },
      odds: [
        { name: '自然皇家同花顺', value: '1 赔 800' },
        { name: '4 张 2 + A', value: '1 赔 400' },
        { name: '野生皇家同花顺', value: '1 赔 25' },
        { name: '5 张 2（Five of a Kind）', value: '1 赔 15' },
        { name: '同花顺', value: '1 赔 9' },
        { name: '四条', value: '1 赔 5' },
        { name: '葫芦', value: '1 赔 3' },
        { name: '同花', value: '1 赔 2' },
        { name: '顺子', value: '1 赔 2' },
        { name: '三条', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Deuces Wild', zh: '2 是百搭' },
        { en: 'Natural Royal', zh: '自然皇家同花顺' },
        { en: 'Four Deuces', zh: '四张 2' }
      ],
      faq: [
        { q: '为什么对子不算中奖？', a: '因为 2 是 Wild，中奖概率大幅提升，所以对子不再赔付，补偿是其他牌型赔率提高。' },
        { q: 'Deuces Wild RTP 是多少？', a: '最优策略下可达 100.76%（部分版本），玩家占优。' },
        { q: '4 张 2 怎么算？', a: '4 张 2 是特殊牌型，赔率 200x。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Joker Poker': {
      zh: 'Joker Poker',
      tagline: '视频扑克变体——加入 1 张 Joker（百搭），牌组 53 张。Joker 可替代任何牌，中奖更容易。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额。' },
        { n: 2, title: '发牌', desc: '发 5 张牌（含 Joker 时更强）。' },
        { n: 3, title: '换牌', desc: '保留部分牌，其余换新。' },
        { n: 4, title: '结算', desc: 'Joker 可替代任何牌。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组', v: '53 张（52 + 1 Joker）' },
          { k: 'Wild 牌', v: '1 张 Joker' },
          { k: '起始牌', v: '5 张' },
          { k: '最低中奖', v: '两对（Two Pair）' }
        ],
        note: 'Joker Poker 中 Joker 是百搭，可以替代任何牌。最低中奖是两对。',
        examples: ['两对 → 1:1', '三条 → 2:1', '顺子 → 4:1', '含 Joker 的五条 → 最高奖'],
        order: '五条（含 Joker）> 皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对'
      },
      natural: {
        desc: 'Joker Poker 特殊牌型：',
        examples: [
          '五条（Five of a Kind）：含 Joker 的 4 张相同点数牌',
          '皇家同花顺：Joker 可替代皇家同花顺中缺失的牌',
          '同花顺：Joker 辅助',
          '四条：4 张同点数'
        ],
        note: 'Joker Poker RTP 通常在 98% - 100% 之间，取决于具体版本。'
      },
      odds: [
        { name: '五条（Five of a Kind）', value: '1 赔 800' },
        { name: '皇家同花顺', value: '1 赔 100' },
        { name: '同花顺', value: '1 赔 50' },
        { name: '四条', value: '1 赔 20' },
        { name: '葫芦', value: '1 赔 7' },
        { name: '同花', value: '1 赔 5' },
        { name: '顺子', value: '1 赔 4' },
        { name: '三条', value: '1 赔 3' },
        { name: '两对', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Joker', zh: '百搭牌' },
        { en: 'Five of a Kind', zh: '五条' },
        { en: 'Wild', zh: '百搭' }
      ],
      faq: [
        { q: 'Joker 可以替代任何牌吗？', a: '是的，Joker 是百搭牌，可以替代任何牌。' },
        { q: '五条怎么组成？', a: '五条 = Joker + 4 张相同点数牌（如 Joker + 4 张 7）。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Bonus Poker': {
      zh: 'Bonus Poker',
      tagline: '视频扑克变体——四条 A 或 2/3/4 有更高赔率，鼓励玩家追求高额奖金。RTP 约 99.2%。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额。' },
        { n: 2, title: '发牌', desc: '发 5 张牌。' },
        { n: 3, title: '换牌', desc: '保留部分牌，其余换新。' },
        { n: 4, title: '结算', desc: '四条 A / 2 / 3 / 4 有特殊赔率。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组', v: '52 张' },
          { k: '起始牌', v: '5 张' },
          { k: '换牌次数', v: '1 次' },
          { k: '最低中奖', v: '一对 J 或更高' }
        ],
        note: 'Bonus Poker 的特殊之处是四条按点数分级赔付。',
        examples: ['四条 A → 80x', '四条 2/3/4 → 40x', '四条 5-K → 25x'],
        order: '皇家同花顺 > 同花顺 > 四条 A > 四条 2-4 > 四条 5-K > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 J+'
      },
      natural: {
        desc: 'Bonus Poker 特色赔率：',
        examples: [
          '四条 A：赔率 80x（比其他版本高）',
          '四条 2 / 3 / 4：赔率 40x',
          '四条 5 - K：赔率 25x',
          '皇家同花顺：赔率 800x'
        ],
        note: 'Bonus Poker RTP 约 99.17%，略低于 Jacks or Better。'
      },
      odds: [
        { name: '皇家同花顺', value: '1 赔 800' },
        { name: '同花顺', value: '1 赔 50' },
        { name: '四条 A', value: '1 赔 80' },
        { name: '四条 2 / 3 / 4', value: '1 赔 40' },
        { name: '四条 5 - K', value: '1 赔 25' },
        { name: '葫芦', value: '1 赔 8' },
        { name: '同花', value: '1 赔 5' },
        { name: '顺子', value: '1 赔 4' },
        { name: '三条', value: '1 赔 3' },
        { name: '两对', value: '1 赔 2' },
        { name: '一对 J 或更高', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Bonus Poker', zh: '奖励扑克' },
        { en: 'Four Aces', zh: '四条 A' },
        { en: 'Four 2s-4s', zh: '四条 2-4' }
      ],
      faq: [
        { q: 'Bonus Poker 和 Jacks or Better 的区别？', a: 'Bonus Poker 四条按点数分级赔付：四条 A 赔 80x，四条 2-4 赔 40x，四条 5-K 赔 25x。' },
        { q: '为什么四条 A 赔率这么高？', a: '奖励玩法鼓励玩家追求高额奖金，是平衡设计。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
    },

    'Aces & Faces': {
      zh: 'Aces & Faces',
      tagline: '视频扑克变体——四条 A、2、3、4 及 J/Q/K 有更高赔率，突出"人头牌"概念。RTP 约 99.4%。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择下注额。' },
        { n: 2, title: '发牌', desc: '发 5 张牌。' },
        { n: 3, title: '换牌', desc: '保留部分牌，其余换新。' },
        { n: 4, title: '结算', desc: '四条特殊点数有更高赔率。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组', v: '52 张' },
          { k: '起始牌', v: '5 张' },
          { k: '换牌次数', v: '1 次' },
          { k: '最低中奖', v: '一对 J 或更高' }
        ],
        note: 'Aces & Faces 突出"人头牌"（J/Q/K）和 A 的特殊赔率。',
        examples: ['四条 A / 2 / 3 / 4 → 80x', '四条 J / Q / K → 80x', '四条 5-10 → 50x'],
        order: '皇家同花顺 > 同花顺 > 四条 A/2/3/4/J/Q/K > 四条 5-10 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 J+'
      },
      natural: {
        desc: 'Aces & Faces 特色：',
        examples: [
          '四条 A / 2 / 3 / 4：赔率 80x',
          '四条 J / Q / K：赔率 80x',
          '四条 5 - 10：赔率 50x',
          '皇家同花顺：赔率 800x'
        ],
        note: 'Aces & Faces RTP 约 99.40%，是视频扑克较高的版本。'
      },
      odds: [
        { name: '皇家同花顺', value: '1 赔 800' },
        { name: '同花顺', value: '1 赔 50' },
        { name: '四条 A/2/3/4/J/Q/K', value: '1 赔 80' },
        { name: '四条 5 - 10', value: '1 赔 50' },
        { name: '葫芦', value: '1 赔 8' },
        { name: '同花', value: '1 赔 5' },
        { name: '顺子', value: '1 赔 4' },
        { name: '三条', value: '1 赔 3' },
        { name: '两对', value: '1 赔 2' },
        { name: '一对 J 或更高', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位获胜后净赢取 X 单位。',
      terms: [
        { en: 'Aces & Faces', zh: 'A 和人头牌' },
        { en: 'Faces', zh: '人头牌（J / Q / K）' }
      ],
      faq: [
        { q: 'Aces & Faces 和 Bonus Poker 的区别？', a: 'Aces & Faces 把四条 J/Q/K 也归入高赔率组，突出"人头牌"概念。' },
        { q: '四条 5-10 赔率多少？', a: '赔率 50x（低于四条 A/J/Q/K 的 80x）。' }
      ],
      disclaimer: '本游戏结果由随机数生成器（RNG）产生。RTP 为长期理论值。'
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
