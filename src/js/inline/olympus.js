/* Apex Olympus - HUD wiring + engine integration. */
(function () {
  'use strict';

  var S  = window.OlympusSymbols;
  var P  = window.OlympusPaytable;
  var W  = window.OlympusReelWeights;
  var MP = window.OlympusMathProfile;
  var R  = window.OlympusReels;
  var M  = window.OlympusMatcher;
  var Mu = window.OlympusMultiplier;
  var TB = window.OlympusTumble;
  var RD = window.OlympusRound;

  if (!S || !P || !W || !MP || !R || !M || !Mu || !TB || !RD) {
    console.error('[olympus] engine modules missing');
    return;
  }

  /* ---- RNG (mulberry32 seeded from crypto) ---- */
  function makeRng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var seedBuf = new Uint32Array(1);
  crypto.getRandomValues(seedBuf);
  var rng = makeRng(seedBuf[0]);

  /* ---- reel strips (demo profile for the page) ---- */
  var stripCfg = {
    STRIP_LEN: W.STRIP_LEN,
    WEIGHTS: W.columnsOf('demo'),
    sumWeights: W.sumWeights
  };
  var strips = R.buildStrips(stripCfg, rng);

  /* ---- render board ---- */
  var gridEl = document.getElementById('olGrid');
  function renderBoard(board) {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    var inner = document.createElement('div');
    inner.className = 'ol-grid-inner';
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[r].length; c++) {
        var cell = document.createElement('div');
        cell.className = 'ol-cell';
        var id = board[r][c];
        if (id) {
          var img = document.createElement('img');
          img.src = '/assets/symbols/sym-' + id.slice(4) + '.webp?v=1';
          img.alt = ''; img.draggable = false;
          cell.appendChild(img);
        }
        inner.appendChild(cell);
      }
    }
    gridEl.appendChild(inner);
  }

  /* ---- state ---- */
  var BET_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var state = {
    balance: 1000.00, betIdx: 2, roundWin: 0,
    ante: false, spinning: false, auto: false, autoTimer: 0, speed: 1
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
    var html = "";
    for (var i = 0; i < state.speed; i++) html += '<i class="ri-flashlight-fill" aria-hidden="true"></i>';
    el.speedIcons.innerHTML = html;
    if (el.speedBtn) el.speedBtn.classList.toggle('is-on', state.speed > 1);
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

  /* ---- one spin through the engine ---- */
  function playOneSpin(profile, multMap) {
    return RD.playSpin({
      strips: strips, symbols: S.SYMBOLS, paytable: P,
      reels: R, matcher: M, tumble: TB, multiplier: Mu,
      tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: 40, APPLY_MULT: true },
      rng: rng, profile: profile, multiplierMap: multMap
    });
  }

  function playBase(profile) {
    return RD.playBase({
      strips: strips, symbols: S.SYMBOLS, paytable: P,
      reels: R, matcher: M, tumble: TB, multiplier: Mu,
      tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: 40, APPLY_MULT: true },
      rng: rng, profile: profile
    });
  }

  function doSpin() {
    if (state.spinning) return;
    var bet = effectiveBet();
    if (state.balance < bet) { stopAuto(); return; }
    state.spinning = true;
    state.balance -= bet;
    state.roundWin = 0;
    render();

    var profile = MP.DEMO;
    var dur = 900 / state.speed;
    setTimeout(function () {
      var r = playBase(profile);
      renderBoard(r.board);
      state.roundWin = r.winX;
      state.balance += r.winX;
      render();
      if (r.triggerFS) runFreeSpins(profile, r.fsAward);
      else { state.spinning = false; render(); }
    }, dur);
  }

  /* ---- free spins (simplified loop) ---- */
  function runFreeSpins(profile, count) {
    var st = RD.startFreeSpins({ paytable: P, count: count });
    var safety = 0;
    var step = 600 / state.speed;
    function tick() {
      if (st.remaining <= 0 || safety >= 200) {
        state.spinning = false; render(); return;
      }
      var fr = RD.nextFreeSpin(st, {
        strips: strips, symbols: S.SYMBOLS, paytable: P,
        reels: R, matcher: M, tumble: TB, multiplier: Mu,
        tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: 40, APPLY_MULT: true },
        rng: rng, profile: profile
      });
      if (fr) {
        renderBoard(fr.board);
        state.roundWin += fr.win;
        state.balance += fr.win;
        render();
      }
      safety++;
      setTimeout(tick, step);
    }
    setTimeout(tick, step);
  }

  /* ---- auto ---- */
  function startAuto() {
    if (state.auto) return;
    state.auto = true; render(); doSpin();
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

  /* ---- wire ---- */
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
    state.ante = !state.ante; render();
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

  /* ---- initial board ---- */
  var initBoard = R.fillBoard(strips, 5, rng);
  renderBoard(initBoard);
  render();
})();
