(function () {
  'use strict';

  var GAME_NAMES = {
    olympus:   '奥林匹斯之门',
    sweet:     '糖果连连爆',
    sugar:     '甜蜜爆奖',
    bass:      '巨型鲈鱼',
    dog:       '狗狗之家',
    book:      '死亡之书',
    starburst: '星爆',
    gonzo:     '刚果探险',
    buffalo:   '水牛之王',
    wolf:      '狼黄金',
    fruit:     '水果派对',
    megaways:  '大富翁'
  };

  var MODE_LABELS = {
    demo: '试玩模式',
    real: '真实模式'
  };

  /* 盘面配置 */
  var COLS = 6, ROWS = 5;

  /* 符号池（权重越高出现越多） */
  var POOL = [
    { id: 'zeus',      w: 1 },
    { id: 'crown',     w: 2 },
    { id: 'chalice',   w: 3 },
    { id: 'ring',      w: 3 },
    { id: 'hourglass', w: 4 },
    { id: 'gem-red',   w: 6 },
    { id: 'gem-purple',w: 6 },
    { id: 'gem-blue',  w: 7 },
    { id: 'gem-green', w: 7 },
    { id: 'gem-yellow',w: 7 }
  ];
  var POOL_FLAT = (function () {
    var out = [];
    for (var i = 0; i < POOL.length; i++) {
      for (var j = 0; j < POOL[i].w; j++) out.push(POOL[i].id);
    }
    return out;
  })();

  /* 下注档位 */
  var BET_STEPS = [1, 2, 5, 10, 20, 50, 100];
  var DEFAULT_BALANCE = { demo: 10000, real: 0 };

  /* ---------- URL 参数 ---------- */
  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var mode     = params.get('mode') || 'demo';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;
  var modeText = MODE_LABELS[mode] || MODE_LABELS.demo;

  /* ---------- DOM ---------- */
  var page       = document.querySelector('.gp-page');
  var titleEl    = document.getElementById('gpTitle');
  var modeEl     = document.getElementById('gpMode');
  var backBtn    = document.getElementById('gpBack');
  var menuBtn    = document.getElementById('gpMenu');
  var soundBtn   = document.getElementById('gpSound');
  var boardEl    = document.getElementById('gpBoard');
  var prizeEl    = document.getElementById('gpPrize');
  var balanceEl  = document.getElementById('gpBalance');
  var betEl      = document.getElementById('gpBet');
  var winEl      = document.getElementById('gpWin');
  var betValueEl = document.getElementById('gpBetValue');
  var betMinus   = document.getElementById('gpBetMinus');
  var betPlus    = document.getElementById('gpBetPlus');
  var spinBtn    = document.getElementById('gpSpin');
  var rechargeEl = document.getElementById('gpRecharge');
  var autoBtn    = document.getElementById('gpAuto');
  var histBtn    = document.getElementById('gpHistory');
  var payBtn     = document.getElementById('gpPaytable');
  var toastEl    = document.getElementById('gpToast');

  if (!page || !boardEl) return;

  page.setAttribute('data-game-id', gameId);
  page.setAttribute('data-mode', mode);
  if (titleEl) titleEl.textContent = gameName;
  if (modeEl)  modeEl.textContent  = modeText;
  document.title = gameName + ' · ' + modeText;

  /* ---------- 状态 ---------- */
  var balance   = DEFAULT_BALANCE[mode] || 0;
  var betIndex  = 3;   /* BET_STEPS[3] = 10 */
  var lastWin   = 0;

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 1800);
  }

  /* ---------- 金额格式化 ---------- */
  function fmtMoney(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  /* ---------- 随机符号 ---------- */
  function pick() {
    return POOL_FLAT[Math.floor(Math.random() * POOL_FLAT.length)];
  }

  /* ---------- 渲染盘面 ---------- */
  function renderBoard() {
    if (!window.ApexOlympusSymbols) {
      boardEl.innerHTML = '<div style="grid-column:1/-1;color:#fff;padding:20px;text-align:center;font-size:12px">符号库加载中…</div>';
      return;
    }
    window.ApexOlympusSymbols.ensureDefs();
    var frag = '';
    for (var i = 0; i < COLS * ROWS; i++) {
      var id = pick();
      var svg = window.ApexOlympusSymbols.render(id);
      frag += '<div class="gp-cell">' + svg + '</div>';
    }
    boardEl.innerHTML = frag;
  }

  /* ---------- 刷新 UI ---------- */
  function refreshUI() {
    if (balanceEl)  balanceEl.textContent  = fmtMoney(balance);
    if (betEl)      betEl.textContent      = fmtMoney(BET_STEPS[betIndex]);
    if (winEl)      winEl.textContent      = fmtMoney(lastWin);
    if (prizeEl)    prizeEl.textContent    = fmtMoney(lastWin);
    if (betValueEl) betValueEl.textContent = '下注 ' + fmtMoney(BET_STEPS[betIndex]);
  }

  /* ---------- 重置 / 充值 ---------- */
  if (rechargeEl) {
    if (mode === 'demo') {
      rechargeEl.textContent = '重置余额';
      rechargeEl.addEventListener('click', function () {
        balance = DEFAULT_BALANCE.demo;
        lastWin = 0;
        refreshUI();
        toast('余额已重置');
      });
    } else {
      rechargeEl.textContent = '充值余额';
      rechargeEl.addEventListener('click', function () {
        toast('充值功能即将开放');
      });
    }
  }

  /* ---------- 下注 ---------- */
  if (betMinus) betMinus.addEventListener('click', function () {
    if (betIndex > 0) { betIndex--; refreshUI(); }
  });
  if (betPlus) betPlus.addEventListener('click', function () {
    if (betIndex < BET_STEPS.length - 1) { betIndex++; refreshUI(); }
  });

  /* ---------- 旋转 ---------- */
  var spinning = false;
  if (spinBtn) spinBtn.addEventListener('click', function () {
    if (spinning) return;
    var bet = BET_STEPS[betIndex];
    if (balance < bet) { toast('余额不足'); return; }

    spinning = true;
    balance -= bet;
    lastWin = 0;
    refreshUI();

    var cellEls = boardEl.querySelectorAll('.gp-cell');
    var tick = 0;
    var timer = window.setInterval(function () {
      for (var i = 0; i < cellEls.length; i++) {
        if (Math.random() < 0.4) {
          var id = pick();
          cellEls[i].innerHTML = window.ApexOlympusSymbols
            ? window.ApexOlympusSymbols.render(id)
            : '';
        }
      }
      tick++;
      if (tick >= 8) {
        window.clearInterval(timer);
        renderBoard();
        spinning = false;
      }
    }, 80);
  });

  /* ---------- 工具按钮 ---------- */
  if (autoBtn)  autoBtn.addEventListener('click',  function () { toast('自动旋转即将开放'); });
  if (histBtn)  histBtn.addEventListener('click',  function () { toast('游戏记录即将开放'); });
  if (payBtn)   payBtn.addEventListener('click',   function () { toast('赔付表即将开放'); });

  /* ---------- 顶栏 ---------- */
  if (backBtn) backBtn.addEventListener('click', function () {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
  });
  if (menuBtn)  menuBtn.addEventListener('click',  function () { toast('菜单即将开放'); });

  var soundOn = true;
  if (soundBtn) soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    toast(soundOn ? '音效已开启' : '音效已关闭');
  });

  /* ---------- 初始化 ---------- */
  renderBoard();
  refreshUI();
})();
