/* Apex Olympus - board + HUD (round 2). */
(function () {
  'use strict';

  /* --- 1. board --- */
  var COLS = 6, ROWS = 5, SYM_COUNT = 13;
  var board = document.getElementById('olGrid');
  function pick() {
    var buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % SYM_COUNT;
  }
  if (board) {
    var inner = document.createElement('div');
    inner.className = 'ol-grid-inner';
    for (var i = 0; i < COLS * ROWS; i++) {
      var cell = document.createElement('div');
      cell.className = 'ol-cell';
      var img = document.createElement('img');
      img.src = '/assets/symbols/sym-' + pick() + '.webp?v=1';
      img.alt = ''; img.draggable = false;
      cell.appendChild(img);
      inner.appendChild(cell);
    }
    board.appendChild(inner);
  }

  /* --- 2. state --- */
  var BET_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var state = {
    balance: 1000.00,
    betIdx: 2,
    roundWin: 0,
    ante: false,
    spinning: false,
    auto: false,
    autoTimer: 0,
    speed: 1
  };

  var el = {
    menu:      document.getElementById('olMenu'),
    win:       document.getElementById('olWin'),
    balance:   document.getElementById('olBalance'),
    bet:       document.getElementById('olBet'),
    roundWin:  document.getElementById('olRoundWin'),
    buy:       document.getElementById('olBuy'),
    buyPrice:  document.getElementById('olBuyPrice'),
    ante:      document.getElementById('olAnte'),
    antePrice: document.getElementById('olAntePrice'),
    betMinus:  document.getElementById('olBetMinus'),
    betPlus:   document.getElementById('olBetPlus'),
    spin:      document.getElementById('olSpin'),
    autoBtn:   document.getElementById('olAuto'),
    speedBtn:  document.getElementById('olSpeed'),
    speedIcons: document.getElementById('olSpeedIcons')
  };

  function fmt(n) { return '\u00A5' + n.toFixed(2); }
  function baseBet() { return BET_STEPS[state.betIdx]; }
  function effectiveBet() { return baseBet() * (state.ante ? 1.25 : 1); }

  function renderSpeed() {
    if (!el.speedIcons) return;
    var n = state.speed;
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<i class="ri-flashlight-fill" aria-hidden="true"></i>';
    }
    el.speedIcons.innerHTML = html;
    el.speedBtn.classList.toggle('is-on', n > 1);
  }

  function render() {
    if (el.win) el.win.textContent = fmt(state.roundWin);
    if (el.balance) el.balance.textContent = fmt(state.balance);
    if (el.bet) el.bet.textContent = fmt(effectiveBet());
    if (el.roundWin) el.roundWin.textContent = fmt(state.roundWin);
    if (el.buyPrice) el.buyPrice.textContent = fmt(baseBet() * 100);
    if (el.antePrice) el.antePrice.textContent = fmt(effectiveBet());
    if (el.ante) el.ante.classList.toggle('is-on', state.ante);
    if (el.autoBtn) el.autoBtn.classList.toggle('is-on', state.auto);
    if (el.spin) {
      el.spin.classList.toggle('is-spinning', state.spinning);
      el.spin.classList.toggle('is-auto', state.auto);
    }
    renderSpeed();
  }

  /* --- 3. spin --- */
  function doSpin() {
    if (state.spinning) return;
    var bet = effectiveBet();
    if (state.balance < bet) { stopAuto(); return; }
    state.spinning = true;
    state.balance -= bet;
    state.roundWin = 0;
    render();

    var dur = 900;
    setTimeout(function () {
      var r = new Uint8Array(4);
      crypto.getRandomValues(r);
      var roll = ((r[0] << 24) | (r[1] << 16) | (r[2] << 8) | r[3]) >>> 0;
      var norm = roll / 4294967296;
      var win = 0;
      if (norm < 0.35) win = bet * (1 + Math.floor(norm * 20));
      state.roundWin = Math.round(win * 100) / 100;
      state.balance += state.roundWin;
      state.spinning = false;
      render();
    }, dur / state.speed);
  }

  /* --- 4. auto --- */
  function startAuto() {
    if (state.auto) return;
    state.auto = true;
    render();
    doSpin();
    var tick = function () {
      if (!state.auto) return;
      doSpin();
      state.autoTimer = setTimeout(tick, 1300 / state.speed);
    };
    state.autoTimer = setTimeout(tick, 1300 / state.speed);
  }
  function stopAuto() {
    state.auto = false;
    if (state.autoTimer) { clearTimeout(state.autoTimer); state.autoTimer = 0; }
    render();
  }

  /* --- 5. wire --- */
  if (el.spin) el.spin.addEventListener('click', function () {
    if (state.auto) { stopAuto(); return; }
    doSpin();
  });
  if (el.betMinus) el.betMinus.addEventListener('click', function () {
    if (state.betIdx > 0) { state.betIdx--; render(); }
  });
  if (el.betPlus) el.betPlus.addEventListener('click', function () {
    if (state.betIdx < BET_STEPS.length - 1) { state.betIdx++; render(); }
  });
  if (el.ante) el.ante.addEventListener('click', function () {
    state.ante = !state.ante;
    render();
  });
  if (el.autoBtn) el.autoBtn.addEventListener('click', function () {
    if (state.auto) stopAuto(); else startAuto();
  });
  if (el.speedBtn) el.speedBtn.addEventListener('click', function () {
    state.speed = state.speed === 1 ? 2 : (state.speed === 2 ? 3 : 1);
    render();
  });
  if (el.menu) el.menu.addEventListener('click', function () {
    alert('\u83DC\u5355 \u00B7 \u656C\u8BF7\u671F\u5F85');
  });
  if (el.buy) el.buy.addEventListener('click', function () {
    alert('\u8D2D\u4E70\u514D\u8D39\u65CB\u8F6C \u00B7 \u656C\u8BF7\u671F\u5F85');
  });

  render();
})();
