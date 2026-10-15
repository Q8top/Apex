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
  var liveCells = null;
  var liveCols = [];
  var SLOTS_PER_COL = 10;

  function symSrc(id) { return "/assets/symbols/sym-" + id.slice(4) + ".webp?v=1"; }

  function layoutCols() {
    if (!liveCols.length) return;
    var colH = liveCols[0].el.clientHeight;
    if (colH <= 0) return;
    var slotH = colH / 5;
    for (var i = 0; i < liveCols.length; i++) {
      liveCols[i].track.style.setProperty('--slot-h', slotH + 'px');
      liveCols[i].track.style.setProperty('--roll-h', (slotH * 5) + 'px');
    }
  }

  function buildBoardDom() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    var inner = document.createElement("div");
    inner.className = "ol-grid-inner";
    liveCols = [];
    for (var c = 0; c < 6; c++) {
      var col = document.createElement("col");
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
  function animateStep(fromBoard, toBoard, onDone) {
    if (!liveCols.length) buildBoardDom();
    // phase 1: mark wins, remove losers
    var winCells = {};
    for (var w = 0; w < (arguments.length > 3 ? 0 : 0); w++) {}
    onDone();
  }

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
      for (var c = 0; c < 6; c++) {
        for (var s = 0; s < liveCols[c].syms.length; s++) {
          var sym = liveCols[c].syms[s];
          if (winKeys[sym.row + '-' + c]) {
            sym.el.classList.add('is-win');
            if (LX && LX.swirlCell) {
              LX.swirlCell(c, sym.row, { color: 'gold', life: 620 });
            }
          }
          else if (isMultId(sym.id)) sym.el.classList.add('is-mult');
          else if (sym.id === 'sym-12') sym.el.classList.add('is-scatter');
        }
      }
      i++;
      var explodeMs = Math.max(280, 420 / state.speed);
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
      // collect old symbols still present in DOM (win ones are exploding)
      var old = [];
      for (var s = 0; s < col.syms.length; s++) {
        var sym = col.syms[s];
        if (sym.el.classList.contains('is-win')) continue;
        old.push({ id: sym.id, row: sym.row, el: sym.el, img: sym.img, used: false });
      }
      // new column top->bottom
      var newIds = [];
      for (var r = 0; r < 5; r++) newIds.push(toBoard[r][c]);
      // keep exploding win nodes aside
      var exploding = [];
      for (var s2 = 0; s2 < col.syms.length; s2++) {
        if (col.syms[s2].el.classList.contains('is-win')) exploding.push(col.syms[s2].el);
      }
      // rebuild col DOM: clear, re-append exploding nodes (they will
      // fade), then place kept + entering nodes
      col.el.innerHTML = '';
      for (var e = 0; e < exploding.length; e++) col.el.appendChild(exploding[e]);
      var newSyms = [];
      for (var r2 = 4; r2 >= 0; r2--) {
        var wantId = newIds[r2];
        if (!wantId) continue;
        // find latest old symbol with this id
        var pick = -1;
        for (var o = old.length - 1; o >= 0; o--) {
          if (!old[o].used && old[o].id === wantId) { pick = o; break; }
        }
        if (pick >= 0) {
          // reuse: update --y and id bookkeeping
          var oldSym = old[pick];
          oldSym.used = true;
          oldSym.el.style.setProperty('--y', String(r2));
          oldSym.row = r2;
          if (oldSym.el.parentNode !== col.el) col.el.appendChild(oldSym.el);
          newSyms.push({ el: oldSym.el, img: oldSym.img, row: r2, id: wantId });
        } else {
          // new symbol from above
          var nel = document.createElement('div');
          nel.className = 'ol-sym is-entering';
          nel.style.setProperty('--y', String(r2 - 1));
          var nimg = document.createElement('img');
          nimg.src = symIdToSrc(wantId);
          nimg.alt = ''; nimg.draggable = false;
          nel.appendChild(nimg);
          col.el.appendChild(nel);
          void nel.offsetHeight;
          nel.style.setProperty('--y', String(r2));
          setTimeout(function (x) { x.classList.remove('is-entering'); }, 400, nel);
          newSyms.push({ el: nel, img: nimg, row: r2, id: wantId });
        }
      }
      // mark multipliers / scatter on settled nodes
      for (var n = 0; n < newSyms.length; n++) {
        var id = newSyms[n].id;
        if (id === 'sym-0' || id === 'sym-1' || id === 'sym-2' || id === 'sym-3') newSyms[n].el.classList.add('is-mult');
        if (id === 'sym-12') newSyms[n].el.classList.add('is-scatter');
      }
      newSyms.sort(function (a, b) { return a.row - b.row; });
      col.syms = newSyms;
    }
  }

  function symIdToSrc(id) {
    return '/assets/symbols/' + id + '.webp?v=1';
  }
  /* ---- state ---- */
  var BET_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var state = {
    balance: 1000.00, betIdx: 2, roundWin: 0,
    ante: false, spinning: false, auto: false, autoTimer: 0, speed: 1
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
    if (el.topAmount) el.topAmount.textContent = fmt(state.roundWin);
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
    }
    renderSpeed();
  }

  /* ---- spin ---- */
  function playBase(profile) {
    return RD.playBase({
      strips: strips, symbols: S.SYMBOLS, paytable: P,
      reels: R, matcher: M, tumble: TB, multiplier: Mu,
      tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: 40, APPLY_MULT: true },
      rng: rng, profile: profile
    });
  }

  function refillScrollingSlots() {
    for (var c = 0; c < liveCols.length; c++) {
      for (var k = 5; k < SLOTS_PER_COL; k++) {
        var buf = new Uint8Array(1);
        crypto.getRandomValues(buf);
        var id = 'sym-' + (buf[0] % 13);
        liveCols[c].slots[k].img.src = '/assets/symbols/' + id + '.webp?v=1';
      }
    }
  }

  function readTrackY(track) {
    var m = getComputedStyle(track).transform;
    if (!m || m === 'none') return 0;
    var mm = m.match(/matrix\(([^)]+)\)/);
    if (!mm) return 0;
    var parts = mm[1].split(',');
    var v = parseFloat(parts[5]);
    return isFinite(v) ? v : 0;
  }

  function realSpin(profile, cb) {
    if (!liveCols.length) buildBoardDom();
    layoutCols();
    refillScrollingSlots();
    for (var c = 0; c < liveCols.length; c++) {
      var col = liveCols[c];
      col.el.classList.remove('is-rolling');
      col.track.style.animation = '';
      col.track.style.transition = '';
      col.track.style.transform = '';
      void col.track.offsetHeight;
      col.el.classList.add('is-rolling');
    }
    var baseDelay = Math.max(420, 750 / state.speed);
    var colDelay = Math.max(70, 110 / state.speed);
    for (var k = 0; k < liveCols.length; k++) {
      (function (idx) {
        setTimeout(function () {
          var col = liveCols[idx];
          var curY = readTrackY(col.track);
          col.el.classList.remove('is-rolling');
          col.track.style.animation = 'none';
          col.track.style.transform = 'translateY(' + curY + 'px)';
          void col.track.offsetHeight;
          col.track.style.transition = 'transform 0.42s cubic-bezier(.22,1.6,.36,1)';
          col.track.style.transform = 'translateY(0)';
          if (AU) AU.stop();
          setTimeout(function () {
            col.track.style.transition = '';
            col.track.style.animation = '';
            col.track.style.transform = '';
          }, 460);
        }, baseDelay + idx * colDelay);
      })(k);
    }
    var total = baseDelay + 6 * colDelay + 480;
    setTimeout(cb, total);
  }
  function doSpin() {
    if (state.spinning) return;
    var bet = effectiveBet();
    if (state.balance < bet) { stopAuto(); return; }
    state.spinning = true;
    state.balance -= bet;
    state.roundWin = 0;
    render();
    if (AU) { AU.unlock(); AU.startBgm(); AU.spin(); }
    if (el.topBanner) el.topBanner.classList.remove('is-win', 'is-big');
    if (BW) BW.hide();
    if (FS) FS.hideAll();

    var profile = MP.DEMO;
    var r = playBase(profile);

    realSpin(profile, function () {
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
        if (BW && r.winX >= 10) BW.play(r.winX, r.winX);
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
  }

  /* ---- free spins ---- */
  function runFreeSpins(profile, count) {
    var st = RD.startFreeSpins({ paytable: P, count: count, tumble: TB });
    var safety = 0;
    var collected = [];
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
        tumbleConfig: { MULT_CHANCE: profile.multChance, MAX_STEPS: 40, APPLY_MULT: true },
        rng: rng, profile: profile
      });
      if (fr) {
        paintBoard(fr.board, fr.values);
        state.roundWin += fr.win;
        state.balance += fr.win;
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
