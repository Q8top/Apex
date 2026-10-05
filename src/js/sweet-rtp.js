/* Sweet Bonanza · RTP 引擎（纯前端模拟）
   ⚠️ 生产环境必须把 RNG 挪到服务端 + 使用 CSPRNG
      前端代码可被逆向，本模块仅供试玩 / 演示 */
(function () {
  'use strict';

  /* ═══════════════ 配置 ═══════════════ */
  var CONFIG = {
    demo: {
      hitRate: 0.50,
      scatterRate: 0.10,
      levels: [
        { w: 62, count: [8, 10],  tier: 'base' },
        { w: 24, count: [10, 12], tier: 'base' },
        { w: 9,  count: [12, 15], tier: 'base' },
        { w: 4,  count: [8, 12],  tier: 'high' },
        { w: 0.9, count: [12, 15], tier: 'high' },
        { w: 0.1, count: [15, 20], tier: 'high' }
      ],
      bombRate: 0.35,
      targetRTP: 1.80
    },
    play: {
      hitRate: 0.28,
      scatterRate: 0.05,
      levels: [
        { w: 68, count: [8, 10],  tier: 'base' },
        { w: 22, count: [8, 10],  tier: 'base' },
        { w: 8,  count: [10, 12], tier: 'base' },
        { w: 1.7, count: [10, 12], tier: 'high' },
        { w: 0.25, count: [12, 15], tier: 'high' },
        { w: 0.05, count: [12, 15], tier: 'high' }
      ],
      bombRate: 0.26,
      targetRTP: 0.90
    }
  };

  /* ═══════════════ 运行状态 ═══════════════ */
  var running = {
    demo: { bet: 0, win: 0, spins: 0 },
    play: { bet: 0, win: 0, spins: 0 }
  };

  /* ═══════════════ RNG（LCG，无 Math.random） ═══════════════ */
  var seed = (Date.now() % 2147483647) | 1;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function reseed(n) { seed = (n % 2147483647) | 1; }

  /* ═══════════════ 加权抽取 ═══════════════ */
  function pickWeighted(items) {
    var total = 0, i;
    for (i = 0; i < items.length; i++) total += items[i].w;
    var r = rand() * total, acc = 0;
    for (i = 0; i < items.length; i++) {
      acc += items[i].w;
      if (r < acc) return items[i];
    }
    return items[items.length - 1];
  }

  /* ═══════════════ 动态命中率修正 ═══════════════
     已进行 ≥20 局后生效
     实际 RTP 高于目标 → 降低命中
     实际 RTP 低于目标 → 提高命中
     修正幅度 ±12% 封顶 */
  function dynamicHit(mode) {
    var cfg = CONFIG[mode], s = running[mode];
    if (s.spins < 20) return cfg.hitRate;
    var actual = s.bet > 0 ? (s.win / s.bet) : 0;
    var diff = actual - cfg.targetRTP;
    var adj = Math.max(-0.12, Math.min(0.12, -diff * 0.25));
    return Math.max(0.05, Math.min(0.85, cfg.hitRate + adj));
  }

  /* ═══════════════ 主决策接口 ═══════════════
     返回 { isWin, level, hasScatter, hitRate }
     hasScatter：是否触发免费旋转 */
  function decide(mode) {
    var cfg = CONFIG[mode];
    var hr = dynamicHit(mode);
    var isWin = rand() < hr;
    var level = isWin ? pickWeighted(cfg.levels) : null;
    var hasScatter = rand() < cfg.scatterRate;
    return {
      isWin: isWin,
      level: level,
      hasScatter: hasScatter,
      hitRate: hr
    };
  }

  /* ═══════════════ 实际结果记录 ═══════════════ */
  function record(mode, bet, win) {
    var s = running[mode];
    s.bet += bet;
    s.win += win;
    s.spins += 1;
  }

  /* ═══════════════ 统计查询 ═══════════════ */
  function stats(mode) {
    var s = running[mode];
    return {
      spins: s.spins,
      totalBet: s.bet,
      totalWin: s.win,
      rtp: s.bet > 0 ? (s.win / s.bet) : 0,
      targetRTP: CONFIG[mode].targetRTP
    };
  }

  /* ═══════════════ 重置 ═══════════════ */
  function reset(mode) {
    if (mode) { running[mode] = { bet: 0, win: 0, spins: 0 }; }
    else {
      running.demo = { bet: 0, win: 0, spins: 0 };
      running.play = { bet: 0, win: 0, spins: 0 };
    }
  }

  /* ═══════════════ 导出 ═══════════════ */
  window.ApexSweetRTP = {
    decide: decide,
    record: record,
    stats: stats,
    reset: reset,
    rand: rand,
    reseed: reseed,
    CONFIG: CONFIG
  };
})();
