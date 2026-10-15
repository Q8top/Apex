/* Apex Olympus - 6x5 board + HUD interaction (UI only, no RNG). */
(function () {
  'use strict';

  /* --- 1. board --- */
  var COLS = 6, ROWS = 5, SYM_COUNT = 13;
  var board = document.getElementById("olGrid");
  if (board) {
    var inner = document.createElement("div");
    inner.className = "ol-grid-inner";
    for (var i = 0; i < COLS * ROWS; i++) {
      var cell = document.createElement("div");
      cell.className = "ol-cell";
      var img = document.createElement("img");
      img.src = "/assets/symbols/sym-" + pick() + ".webp?v=1";
      img.alt = ""; img.draggable = false;
      cell.appendChild(img);
      inner.appendChild(cell);
    }
    board.appendChild(inner);
  }

  function pick() {
    var buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % SYM_COUNT;
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
    menu:      document.getElementById("olMenu"),
    win:       document.getElementById("olWin"),
    balance:   document.getElementById("olBalance"),
    bet:       document.getElementById("olBet"),
    roundWin:  document.getElementById("olRoundWin"),
    buy:       document.getElementById("olBuy"),
    betMinus:  document.getElementById("olBetMinus"),
    betPlus:   document.getElementById("olBetPlus"),
    spin:      document.getElementById("olSpin"),
    ante:      document.getElementById("olAnte"),
    autoBtn:   document.getElementById("olAuto"),
    speedBtn:  document.getElementById("olSpeed"),
    speedLbl:  document.getElementById("olSpeedLabel")
  };

  function fmt(n) { return "\u00A5" + n.toFixed(2); }
  function effectiveBet() { return BET_STEPS[state.betIdx] * (state.ante ? 1.25 : 1); }

  function render() {
    if (el.win) el.win.textContent = fmt(state.roundWin);
    if (el.balance) el.balance.textContent = fmt(state.balance);
    if (el.bet) el.bet.textContent = fmt(effectiveBet());
    if (el.roundWin) el.roundWin.textContent = fmt(state.roundWin);
    if (el.buy) {
      var price = BET_STEPS[state.betIdx] * 100;
      var pl = el.buy.querySelector(".ol-buy-price");
      if (pl) pl.textContent = fmt(price);
    }
    if (el.speedLbl) el.speedLbl.textContent = state.speed + "x";
    if (el.autoBtn) el.autoBtn.classList.toggle("is-on", state.auto);
    if (el.spin) {
      el.spin.classList.toggle("is-spinning", state.spinning);
      el.spin.classList.toggle("is-auto", state.auto);
    }
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
  if (el.spin) el.spin.addEventListener("click", function () {
    if (state.auto) { stopAuto(); return; }
    doSpin();
  });
  if (el.betMinus) el.betMinus.addEventListener("click", function () {
    if (state.betIdx > 0) { state.betIdx--; render(); }
  });
  if (el.betPlus) el.betPlus.addEventListener("click", function () {
    if (state.betIdx < BET_STEPS.length - 1) { state.betIdx++; render(); }
  });
  if (el.ante) el.ante.addEventListener("change", function () {
    state.ante = !!el.ante.checked;
    render();
  });
  if (el.autoBtn) el.autoBtn.addEventListener("click", function () {
    if (state.auto) stopAuto(); else startAuto();
  });
  if (el.speedBtn) el.speedBtn.addEventListener("click", function () {
    state.speed = state.speed === 1 ? 2 : (state.speed === 2 ? 3 : 1);
    render();
  });
  if (el.menu) el.menu.addEventListener("click", function () {
    alert("\u83DC\u5355 \u00B7 \u656C\u8BF7\u671F\u5F85");
  });
  if (el.buy) el.buy.addEventListener("click", function () {
    alert("\u8D2D\u4E70\u514D\u8D39\u65CB\u8F6C \u00B7 \u656C\u8BF7\u671F\u5F85");
  });

  render();
})();
