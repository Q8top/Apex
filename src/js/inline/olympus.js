/* Apex Olympus - HUD + engine + tumble playback. */
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
  var AU = window.OlympusAudio;
  var LX = window.OlympusLightning;
  var BW = window.OlympusBigWin;
  var FS = window.OlympusFs;
  function rnd() {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }

  if (!S || !P || !W || !MP || !R || !M || !Mu || !TB || !RD) {
    console.error('[olympus] engine modules missing');
    return;
  }

  /* ---- RNG ---- */
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

  /* ---- strips ---- */
  var stripCfg = {
    STRIP_LEN: W.STRIP_LEN,
    WEIGHTS: W.columnsOf('demo'),
    sumWeights: W.sumWeights
  };
  var strips = R.buildStrips(stripCfg, rng);

  /* ---- board render ---- */
  var gridEl = document.getElementById("olGrid");
  var liveCols = [];


  function buildBoardDom() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    var inner = document.createElement("div");
    inner.className = "ol-grid-inner";
    liveCols = [];
    for (var c = 0; c < 6; c++) {
      var col = document.createElement("div");
      col.className = "ol-col";
      inner.appendChild(col);
      liveCols.push({ el: col, syms: [] });
    }
    gridEl.appendChild(inner);
    layoutCols();
  }

  function layoutCols() {
    if (!liveCols.length) return;
    var colH = liveCols[0].el.clientHeight;
    if (colH <= 0) return;
    var slotH = colH / 5;
    for (var i = 0; i < liveCols.length; i++) {
      liveCols[i].el.style.setProperty('--slot-h', slotH + 'px');
    }
  }

  function symIdToSrc(id) {
    return '/assets/symbols/' + id + '.webp?v=1';
  }

  // full repaint: destroy everything in each column and rebuild
  function isMultId(id) {
    return id === 'sym-0' || id === 'sym-1' || id === 'sym-2' || id === 'sym-3';
  }

  function paintBoard(board, values) {
    if (!liveCols.length) buildBoardDom();
    for (var c = 0; c < 6; c++) {
      var col = liveCols[c];
      while (col.el.firstChild) col.el.removeChild(col.el.firstChild);
      col.syms = [];
      for (var r = 0; r < 5; r++) {
        var id = board[r][c];
        if (!id) continue;
        var el = document.createElement('div');
        el.className = 'ol-sym';
        el.style.setProperty('--y', String(r));
        var img = document.createElement('img');
        img.src = symIdToSrc(id);
        img.alt = ''; img.draggable = false;
        el.appendChild(img);
        var val = (values && values[r] && values[r][c]) || 0;
        if (isMultId(id)) {
          el.classList.add('is-mult');
          if (val > 0) {
            var lbl = document.createElement('span');
            lbl.className = 'ol-sym-value';
            lbl.textContent = val + '\u00D7';
            el.appendChild(lbl);
          }
        }
        col.el.appendChild(el);
        col.syms.push({ el: el, img: img, row: r, id: id, value: val });
      }
    }
  }

  // animation step: from one board to next

  // play history frame-by-frame with real tumble physics
  function playHistory(history, onDone) {
    if (!history || !history.length) { onDone(); return; }
    var i = 0;
    function nextFrame() {
      if (i >= history.length) { onDone(); return; }
      var h = history[i];
      if (AU) AU.tumble();
      // build win lookup keyed by r-c
      var winKeys = {};
      for (var w = 0; w < h.wins.length; w++) {
        var cells = h.wins[w].cells;
        for (var k = 0; k < cells.length; k++) {
          winKeys[cells[k].r + '-' + cells[k].c] = true;
        }
      }
      // phase A: show the pre-removal board
      paintBoard(h.board, h.values);
      // mark wins + spawn swirl per winning cell
      var sawMult = false, sawScatter = false;
      for (var c = 0; c < 6; c++) {
        for (var s = 0; s < liveCols[c].syms.length; s++) {
          var sym = liveCols[c].syms[s];
          if (winKeys[sym.row + '-' + c]) {
            sym.el.classList.add('is-win');
            if (LX && LX.swirlCell) {
              LX.swirlCell(c, sym.row, { color: 'gold', life: 620 });
            }
          }
          else if (isMultId(sym.id)) {
            sym.el.classList.add('is-mult');
            if (!sawMult) { sawMult = true; if (AU && AU.multiplier) AU.multiplier(); }
            if (LX && LX.rippleCell) LX.rippleCell(c, sym.row, { hue: 'gold', life: 720, radius: 56 });
          }
          else if (sym.id === 'sym-12') {
            sym.el.classList.add('is-scatter');
            if (!sawScatter) { sawScatter = true; if (AU && AU.scatter) AU.scatter(); }
          }
        }
      }
      i++;
      var explodeMs = state.skipAnim ? 30 : Math.max(280, 420 / state.speed);
      setTimeout(function () {
        // phase B: move remaining symbols and drop new ones
        if (i < history.length) {
          var next = history[i];
          applyTumble(h.board, next.board, h.values, next.values);
          setTimeout(nextFrame, Math.max(340, 420 / state.speed));
        } else {
          // last frame: settle final board from the engine's final state
          nextFrame();
        }
      }, explodeMs);
    }
    nextFrame();
  }

  // Given two consecutive boards, animate symbols moving down and new
  // symbols entering. Strategy per column: read old column as list of
  // ids top to bottom. Read new column same way. Then: for each id in
  // the NEW column (bottom-up), find the latest unmatched occurrence in
  // the OLD column; keep its DOM node and change --y. Ids in new but
  // not matched -> create new .ol-sym entering from above.
  function applyTumble(fromBoard, toBoard, fromValues, toValues) {
    if (!liveCols.length) return;
    for (var c = 0; c < 6; c++) {
      var col = liveCols[c];
      // collect old symbols still present (win ones are exploding away)
      var old = [];
      for (var s = 0; s < col.syms.length; s++) {
        var sym = col.syms[s];
        if (sym.el.classList.contains('is-win')) continue;
        old.push({ id: sym.id, row: sym.row, el: sym.el, img: sym.img, used: false });
      }
      // new column top->bottom
      var newIds = [];
      for (var r = 0; r < 5; r++) newIds.push(toBoard[r][c]);
      // keep exploding nodes aside
      var exploding = [];
      for (var s2 = 0; s2 < col.syms.length; s2++) {
        if (col.syms[s2].el.classList.contains('is-win')) exploding.push(col.syms[s2].el);
      }
      col.el.innerHTML = '';
      for (var e = 0; e < exploding.length; e++) col.el.appendChild(exploding[e]);
      var newSyms = [];
      for (var r2 = 4; r2 >= 0; r2--) {
        var wantId = newIds[r2];
        if (!wantId) continue;
        var val = (toValues && toValues[r2] && toValues[r2][c]) || 0;
        var pick = -1;
        for (var o = old.length - 1; o >= 0; o--) {
          if (!old[o].used && old[o].id === wantId) { pick = o; break; }
        }
        if (pick >= 0) {
          var os = old[pick];
          os.used = true;
          os.el.style.setProperty('--y', String(r2));
          os.el.classList.remove('is-entering');
          // refresh the value badge on reused node
          refreshValueBadge(os.el, wantId, val);
          if (os.el.parentNode !== col.el) col.el.appendChild(os.el);
          newSyms.push({ el: os.el, img: os.img, row: r2, id: wantId, value: val });
        } else {
          var nel = document.createElement('div');
          nel.className = 'ol-sym is-entering';
          nel.style.setProperty('--y', String(r2 - 1));
          var nimg = document.createElement('img');
          nimg.src = symIdToSrc(wantId);
          nimg.alt = ''; nimg.draggable = false;
          nel.appendChild(nimg);
          refreshValueBadge(nel, wantId, val);
          col.el.appendChild(nel);
          void nel.offsetHeight;
          nel.style.setProperty('--y', String(r2));
          setTimeout(function (x) { x.classList.remove('is-entering'); }, 400, nel);
          newSyms.push({ el: nel, img: nimg, row: r2, id: wantId, value: val });
        }
      }
      // glow states for settled nodes
      for (var n = 0; n < newSyms.length; n++) {
        var sid = newSyms[n].id;
        if (isMultId(sid)) newSyms[n].el.classList.add('is-mult');
        if (sid === 'sym-12') newSyms[n].el.classList.add('is-scatter');
      }
      newSyms.sort(function (a, b) { return a.row - b.row; });
      col.syms = newSyms;
    }
  }

  // Adds, updates, or removes the gold value label on a symbol.
  function refreshValueBadge(el, id, val) {
    var existing = el.querySelector('.ol-sym-value');
    if (isMultId(id) && val > 0) {
      if (existing) { existing.textContent = val + '\u00D7'; }
      else {
        var sp = document.createElement('span');
        sp.className = 'ol-sym-value';
        sp.textContent = val + '\u00D7';
        el.appendChild(sp);
      }
    } else if (existing) {
      el.removeChild(existing);
    }
  }

  /* ---- state ---- */
  var BET_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var state = {
    balance: 1000.00, betIdx: 2, roundWin: 0,
    ante: false, spinning: false, auto: false, autoTimer: 0, speed: 1,
    skipAnim: false
  };

  var el = {
    menu:      document.getElementById("olMenu"),
    win:       document.getElementById("olWin"),
    balance:   document.getElementById("olBalance"),
    bet:       document.getElementById("olBet"),
    roundWin:  document.getElementById("olRoundWin"),
    buy:       document.getElementById("olBuy"),
    buyPrice:  document.getElementById("olBuyPrice"),
    ante:      document.getElementById("olAnte"),
    antePrice: document.getElementById("olAntePrice"),
    betMinus:  document.getElementById("olBetMinus"),
    betPlus:   document.getElementById("olBetPlus"),
    spin:      document.getElementById("olSpin"),
    autoBtn:   document.getElementById("olAuto"),
    speedBtn:  document.getElementById("olSpeed"),
    speedIcons: document.getElementById("olSpeedIcons"),
    topBanner:  document.querySelector(".ol-top-banner"),
    topAmount:  document.getElementById("olTopAmount")
  };

  function fmt(n) { return '\u00A5' + n.toFixed(2); }
  function baseBet() { return BET_STEPS[state.betIdx]; }
  function effectiveBet() { return baseBet() * (state.ante ? 1.25 : 1); }

  function renderSpeed() {
    if (!el.speedIcons) return;
    var html = "";
    for (var i = 0; i < state.speed; i++) html += '<i class="ri-flashlight-fill" aria-hidden="true"></i>';
    el.speedIcons.innerHTML = html;
    if (el.speedBtn) el.speedBtn.classList.toggle("is-on", state.speed > 1);
  }

  function render() {
    if (el.win) el.win.textContent = fmt(state.roundWin);
    // topAmount is owned by playHistory (per-step TUMBLE WIN), not render()
    if (el.balance) el.balance.textContent = fmt(state.balance);
    if (el.bet) el.bet.textContent = fmt(effectiveBet());
    if (el.roundWin) el.roundWin.textContent = fmt(state.roundWin);
    if (el.buyPrice) el.buyPrice.textContent = fmt(baseBet() * 100);
    if (el.antePrice) el.antePrice.textContent = fmt(effectiveBet());
    if (el.ante) el.ante.classList.toggle("is-on", state.ante);
    if (el.autoBtn) el.autoBtn.classList.toggle("is-on", state.auto);
    if (el.spin) {
      el.spin.classList.toggle("is-spinning", state.spinning);
      el.spin.classList.toggle("is-auto", state.auto);
      el.spin.classList.toggle("is-stop", state.spinning && !state.auto);
    }
    renderSpeed();
  }

  /* ---- spin ---- */
  function playBase(profile) {
    return RD.playBase({
      strips: strips, symbols: S.SYMBOLS, paytable: P,
      reels: R, matcher: M, tumble: TB, multiplier: Mu,
      tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: profile.maxSteps || 40, APPLY_MULT: true },
      rng: rng, profile: profile
    });
  }

  function refillScrollingSlots() {
  for (var c = 0; c < 6; c++) {
    for (var r = 0; r < 5; r++) {
      var sym = liveCols[c].syms[r];
      if (!sym || !sym.img) continue;
      var buf = new Uint8Array(1);
      crypto.getRandomValues(buf);
      sym.img.src = '/assets/symbols/sym-' + (buf[0] % 13) + '.webp?v=1';
    }
  }
}

function realSpin(cb) {
  if (!liveCols.length) buildBoardDom();
  layoutCols();
  var swapTimer = setInterval(function () { refillScrollingSlots(); }, Math.max(28, 45 / state.speed));
  for (var c = 0; c < 6; c++) liveCols[c].el.classList.add('is-rolling');
  var baseDelay = state.skipAnim ? 60 : Math.max(420, 750 / state.speed);
  var colDelay = Math.max(70, 110 / state.speed);
  for (var k = 0; k < 6; k++) {
    (function (idx) {
      setTimeout(function () {
        liveCols[idx].el.classList.remove('is-rolling');
        liveCols[idx].el.classList.add('is-stopped');
        if (AU) AU.stop();
        setTimeout(function () { liveCols[idx].el.classList.remove('is-stopped'); }, 240);
      }, baseDelay + idx * colDelay);
    })(k);
  }
  var total = baseDelay + 6 * colDelay + 300;
  setTimeout(function () {
    clearInterval(swapTimer);
    for (var j = 0; j < 6; j++) liveCols[j].el.classList.remove('is-rolling', 'is-stopped');
    try { cb(); } catch (e) { console.error('[olympus] spin cb failed', e); }
  }, total);
}

    function doSpin() {
    if (state.spinning) return;
    var bet = effectiveBet();
    if (state.balance < bet) { stopAuto(); return; }
    state.skipAnim = false;
    state.spinning = true;
    state.balance -= bet;
    state.roundWin = 0;
    render();
    if (AU) { AU.unlock(); AU.startBgm(); AU.spin(); }
    if (el.topBanner) el.topBanner.classList.remove('is-win', 'is-big');
    if (BW) BW.hide();
    if (FS) FS.hideAll();
    if (LX && LX.isAuraOn && LX.isAuraOn()) LX.setAura(false);

    var profile = MP.DEMO;
    var r = playBase(profile);

    realSpin(function () {
      playHistory(r.history, function () {
        paintBoard(r.board, r.values);
        state.roundWin = r.winX;
        state.balance += r.winX;
        render();
        if (el.topBanner) {
          el.topBanner.classList.remove('is-win', 'is-big');
          if (r.winX > 0) { void el.topBanner.offsetWidth; el.topBanner.classList.add('is-win'); }
          if (r.winX >= 50) el.topBanner.classList.add('is-big');
        }
        if (LX && r.winX > 0) {
          var strikes = 1;
          if (r.winX >= 50) strikes = 6;
          else if (r.winX >= 10) strikes = 3;
          else strikes = 1;
          for (var li = 0; li < strikes; li++) {
            (function (n) {
              setTimeout(function () {
                var rr = (rnd() * 5) | 0;
                var cc = (rnd() * 6) | 0;
                LX.strikeCell(cc, rr);
              }, n * 90);
            })(li);
          }
        }
        if (AU && r.winX > 0) {
          if (r.winX >= 50) { AU.winBig(); AU.playPayout(); }
          else if (r.winX >= 10) { AU.winMid(); AU.playPayout(); }
          else { AU.winSmall(); }
        }
        if (BW && r.winX >= 10) BW.play(r.winX);
        else if (BW) BW.hide();
        if (r.triggerFS) {
          if (AU) AU.fsTrigger();
          if (LX) {
            for (var fi = 0; fi < 8; fi++) {
              (function (n) {
                setTimeout(function () {
                  LX.strike({ fromX: 0.42, fromY: 0.10,
                              toX: 0.1 + rnd() * 0.8,
                              toY: 0.24 + rnd() * 0.24,
                              count: 1 });
                }, n * 70);
              })(fi);
            }
          }
          if (FS) {
            FS.showIntro(r.fsAward, function () {
              runFreeSpins(profile, r.fsAward);
            });
          } else {
            runFreeSpins(profile, r.fsAward);
          }
        }
        else { state.spinning = false; render(); }
      });
    });
    // safety: if spinning stuck >20s, force unlock
    clearTimeout(state.__watchdog);
    state.__watchdog = setTimeout(function () {
      if (state.spinning) {
        console.warn("[olympus] spin watchdog fired, forcing unlock");
        state.spinning = false;
        if (FS) FS.hideAll();
        if (LX) LX.setAura(false);
        render();
      }
    }, 20000);
  }

  /* ---- free spins ---- */
  function runFreeSpins(profile, count) {
    var st = RD.startFreeSpins({ paytable: P, count: count, tumble: TB });
    var safety = 0;
    var collected = [];
    if (LX) LX.setAura(true);
    if (FS) FS.showPanel();
    if (FS) FS.updatePanel(st.remaining, 0, collected);

    function scanMult() {
      if (!st.multMap) return 0;
      var sum = 0;
      for (var r = 0; r < st.multMap.length; r++) {
        for (var c = 0; c < st.multMap[r].length; c++) {
          var v = st.multMap[r][c];
          if (v > 0) {
            // dedupe: only add if not already recorded at this value
            sum += v;
            var found = false;
            for (var k = 0; k < collected.length; k++) if (collected[k] === v) { found = true; break; }
            if (!found) collected.push(v);
          }
        }
      }
      return sum;
    }

    function tick() {
      if (st.remaining <= 0 || safety >= 200) {
        var totalWin = st.totalWin;
        if (LX) LX.setAura(false);
        if (FS) FS.hidePanel();
        if (FS) {
          FS.showSummary(totalWin, function () {
            state.spinning = false;
            state.roundWin = 0;
            render();
          });
        } else {
          state.spinning = false;
          render();
        }
        return;
      }
      var fr = RD.nextFreeSpin(st, {
        strips: strips, symbols: S.SYMBOLS, paytable: P,
        reels: R, matcher: M, tumble: TB, multiplier: Mu,
        tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: profile.maxSteps || 40, APPLY_MULT: true },
        rng: rng, profile: profile
      });
      if (fr) {
        paintBoard(fr.board, fr.values);
        state.roundWin += fr.win;
        state.balance += fr.win;
        if (el.topAmount) el.topAmount.textContent = fmt(fr.win);
        render();
        if (AU && fr.win > 0) AU.winSmall();
        if (LX && fr.win > 0) {
          var rr = (rnd() * 5) | 0;
          var cc = (rnd() * 6) | 0;
          LX.strikeCell(cc, rr);
        }
        var multSum = scanMult();
        if (FS) FS.updatePanel(st.remaining, multSum, collected);
      }
      safety++;
      setTimeout(tick, 700 / state.speed);
    }
    setTimeout(tick, 700 / state.speed);
  }

  /* ---- auto ---- */
  function startAuto() {
    if (state.auto) return;
    state.auto = true; render(); doSpin();
    var tick = function () {
      if (!state.auto) return;
      doSpin();
      state.autoTimer = setTimeout(tick, 1800 / state.speed);
    };
    state.autoTimer = setTimeout(tick, 1800 / state.speed);
  }
  function stopAuto() {
    state.auto = false;
    if (state.autoTimer) { clearTimeout(state.autoTimer); state.autoTimer = 0; }
    render();
  }

  /* ---- wire ---- */
  if (el.spin) el.spin.addEventListener("click", function () {
    if (AU) AU.button();
    if (state.spinning) { state.skipAnim = true; return; }
    if (state.auto) { stopAuto(); return; }
    doSpin();
  });
  if (el.betMinus) el.betMinus.addEventListener("click", function () {
    if (AU) AU.button();
    if (state.betIdx > 0) { state.betIdx--; render(); }
  });
  if (el.betPlus) el.betPlus.addEventListener("click", function () {
    if (AU) AU.button();
    if (state.betIdx < BET_STEPS.length - 1) { state.betIdx++; render(); }
  });
  if (el.ante) el.ante.addEventListener("click", function () {
    if (AU) AU.button();
    state.ante = !state.ante; render();
  });
  if (el.autoBtn) el.autoBtn.addEventListener("click", function () {
    if (AU) AU.button();
    if (state.auto) stopAuto(); else startAuto();
  });
  if (el.speedBtn) el.speedBtn.addEventListener("click", function () {
    if (AU) AU.button();
    state.speed = state.speed === 1 ? 2 : (state.speed === 2 ? 3 : 1);
    render();
  });
  if (el.menu) el.menu.addEventListener("click", function () {
    if (AU) AU.button();
    alert('\u83DC\u5355 \u00B7 \u656C\u8BF7\u671F\u5F85');
  });
  if (el.buy) el.buy.addEventListener("click", function () {
    if (AU) AU.button();
    alert('\u8D2D\u4E70\u514D\u8D39\u65CB\u8F6C \u00B7 \u656C\u8BF7\u671F\u5F85');
  });

  /* ---- keyboard ---- */
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' && e.key !== ' ') return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    if (state.spinning) { state.skipAnim = true; return; }
    if (state.auto) { stopAuto(); return; }
    doSpin();
  });

  /* ---- background handling ---- */
  // When the tab goes hidden, pause everything: audio, timers, animation.
  // When it comes back, force-reset so the player sees a clean board.
  function onHidden() {
    if (AU && AU.stopBgm) AU.stopBgm();
    if (state.spinning) {
      // cancel auto loop
      stopAuto();
      // force-unlock; next user spin will reset the board
      state.spinning = false;
      state.skipAnim = false;
      if (FS) FS.hideAll();
      if (LX && LX.isAuraOn && LX.isAuraOn()) LX.setAura(false);
      if (BW) BW.hide();
      render();
    }
    // clear watchdog
    if (state.__watchdog) { clearTimeout(state.__watchdog); state.__watchdog = 0; }
    // stop any FS intro timeout
    if (FS && FS.pauseTimer) FS.pauseTimer();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      onHidden();
    } else {
      if (AU && AU.resume) AU.resume();
      if (AU && AU.startBgm) AU.startBgm();
    }
  });
  window.addEventListener('pagehide', onHidden);

  /* ---- init ---- */
  buildBoardDom();
  var initBoard = R.fillBoard(strips, 5, rng);
  paintBoard(initBoard);
  render();

  // audio requires a user gesture; unlock on first pointer / touch
  function tryUnlockAudio() {
    if (AU) { AU.unlock(); AU.startBgm(); }
    document.removeEventListener('pointerdown', tryUnlockAudio);
    document.removeEventListener('touchstart', tryUnlockAudio);
  }
  document.addEventListener('pointerdown', tryUnlockAudio, { once: true });
  document.addEventListener('touchstart', tryUnlockAudio, { once: true });
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutCols, 160);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutCols, 160);
    });
  }
})();
