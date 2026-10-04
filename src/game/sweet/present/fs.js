/* Sweet · Free Spin Presentation
   职责：FS entrance + FS rounds 编排 + FS summary。
   依赖：SweetState / SweetEvents / SweetTimeline / SweetMathEngine /
         SweetWinPresentation / SweetHUD / SweetGameConfig
   规则：
   - FS count 从 SweetGameConfig.getFreeSpinCount 读
   - 每轮都检查 State.isCurrent(gen)
   - 背景音走 Events（audio bridge 监听）
   - 不复刻任何旧 token 逻辑
*/
(function(){
'use strict';

var State = window.SweetState;
var Events = window.SweetEvents;
var Config = window.SweetGameConfig;
var MathEngine = window.SweetMathEngine;
var Win = window.SweetWinPresentation;
var HUD = window.SweetHUD;

var ENTRANCE_MS = 800;
var ENTRANCE_FALLBACK_MS = 1200;

function $(id){ return document.getElementById(id); }

/* ---------- 入场 ---------- */
function playEntrance(count, gen, onDone){
  var banner = $('sw-freespin-banner');
  var stage = document.querySelector('.sw-stage');
  if (!banner) { if (onDone) onDone(); return; }

  var finished = false;
  function finish(){
    if (finished) return;
    finished = true;
    banner.classList.remove('fs-entrance');
    banner.hidden = true;
    if (stage) stage.classList.remove('fs-entrance-active');
    if (State.isCurrent(gen) && onDone) onDone();
  }

  banner.hidden = false;
  banner.classList.add('fs-entrance');
  if (stage) stage.classList.add('fs-entrance-active');
  var c = $('sw-fs-count'); if (c) c.textContent = '×' + count;
  var m = $('sw-fs-mult'); if (m) m.textContent = '';

  banner.addEventListener('animationend', finish, { once: true });
  setTimeout(finish, ENTRANCE_FALLBACK_MS);
}

/* ---------- 单轮 FS spin 内的 tumble 播放 ---------- */
function playFsRound(spinResult, gen, cellAt, onDone){
  if (!State.isCurrent(gen)) { if (onDone) onDone(); return; }
  var rounds = spinResult.rounds || [];
  var idx = 0;
  var totalShown = 0;

  function next(){
    if (!State.isCurrent(gen)) { if (onDone) onDone(); return; }
    if (idx >= rounds.length) { if (onDone) onDone(); return; }
    var rd = rounds[idx];
    if (!rd || !rd.wins || !rd.wins.length) { idx++; next(); return; }
    totalShown += rd.roundWin;
    Events.emit('win:update', {
      amount: totalShown,
      combo: rd.cumMult ? '×' + rd.cumMult + ' 累计' : ''
    });
    Win.playRound(rd, gen, cellAt, function(){
      idx++;
      if (idx < rounds.length && rounds[idx] && rounds[idx].grid) {
        Events.emit('grid:paint', { grid: rounds[idx].grid });
      }
      next();
    });
  }
  next();
}

/* ---------- 总流程 ---------- */
function play(opts){
  var bet = opts.bet;
  var scatterCount = opts.scatterCount;
  var gen = opts.gen;
  var cellAt = opts.cellAt;
  var onFinish = opts.onFinish || function(){};

  var count = Config.getFreeSpinCount(scatterCount);
  if (count <= 0) { onFinish(0); return null; }

  var fsResult;
  try {
    fsResult = MathEngine.playFreeSpins(bet, count);
  } catch(e) {
    console.error('[SweetFS] engine error', e);
    onFinish(0);
    return null;
  }

  var totalWin = fsResult.totalWin;
  var spins = fsResult.spins;
  var idx = 0;

  function nextRound(){
    if (!State.isCurrent(gen)) { onFinish(0); return; }
    if (idx >= spins.length) {
      Events.emit('fs:bgStop', { gen: gen });
      var banner = $('sw-freespin-banner'); if (banner) banner.hidden = true;
      State.to(State.S.FS_SUMMARY);
      if (totalWin > 0) {
        Events.emit('fs:summary', { totalWin: totalWin, gen: gen });
      }
      setTimeout(function(){
        if (!State.isCurrent(gen)) return;
        onFinish(totalWin);
      }, totalWin > 0 ? 1800 : 200);
      return;
    }
    var s = spins[idx];
    idx++;
    var bnr = $('sw-freespin-banner');
    if (bnr) {
      bnr.hidden = false;
      var c = $('sw-fs-count'); if (c) c.textContent = s.remaining;
      var m = $('sw-fs-mult'); if (m) m.textContent = '';
    }
    if (s.result && s.result.finalGrid) {
      Events.emit('grid:paint', { grid: s.result.finalGrid });
    }
    playFsRound(s.result, gen, cellAt, function(){
      setTimeout(nextRound, 250);
    });
  }

  State.to(State.S.FS_ENTRANCE);
  Events.emit('fs:entrance', { count: count, gen: gen });
  playEntrance(count, gen, function(){
    if (!State.isCurrent(gen)) { onFinish(0); return; }
    State.to(State.S.FS_ROUND);
    Events.emit('fs:bgStart', { gen: gen });
    nextRound();
  });

  return { totalWin: totalWin, count: count, spinsCount: spins.length };
}

window.SweetFreeSpin = {
  play: play,
  playEntrance: playEntrance,
  playFsRound: playFsRound,
  ENTRANCE_MS: ENTRANCE_MS,
  ENTRANCE_FALLBACK_MS: ENTRANCE_FALLBACK_MS
};
})();
