/* 幸运水果 · UI v3（双模式：demo / real） */
(function(){
'use strict';

var C = window.SlotConfig, E = window.SlotEngine,
    S = window.SlotSymbols, A = window.SlotAudio;

var MODE = (function(){
  var m = String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v = m ? m[1].toLowerCase() : 'demo';
  return v === 'real' ? 'real' : 'demo';
})();

var LS_STATE = 'apex_slot_v3_' + MODE + '_state';
var LS_HIST  = 'apex_slot_v3_' + MODE + '_history';
var LS_SET   = 'apex_slot_v3_settings';
var SCHEMA   = 3;

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false,
  grid: null, history: [],
  autoOn: false, soundOn: true, ready: false
};

function $(id){ return document.getElementById(id); }
function fmt(n, sign){
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet(){ return C.CONFIG.betSteps[state.betIndex]; }
function toast(msg, ms){
  var t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(function(){ t.classList.remove('show'); }, ms || 1500);
}
function flash(big){
  var el = $('flash'); if (!el) return;
  el.classList.add('show'); if (big) el.classList.add('big');
  setTimeout(function(){ el.classList.remove('show','big'); }, big?2400:600);
}
function bump(el){
  if (!el) return; el.classList.remove('bump');
  void el.offsetWidth; el.classList.add('bump');
}
function getCsrf(){
  var m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

/* ---- 存储 ---- */
function loadSettings(){
  try { var d = JSON.parse(localStorage.getItem(LS_SET)||'{}'); if (typeof d.soundOn==='boolean') state.soundOn=d.soundOn; } catch(e){}
}
function saveSettings(){ try{ localStorage.setItem(LS_SET, JSON.stringify({soundOn:state.soundOn})); }catch(e){} }
function loadHistory(){
  try { var d = JSON.parse(localStorage.getItem(LS_HIST)||'[]'); if (Array.isArray(d)) state.history=d.slice(0,50); } catch(e){}
}
function saveHistory(){ try{ localStorage.setItem(LS_HIST, JSON.stringify(state.history.slice(0,50))); }catch(e){} }
function loadDemoState(){
  try {
    var d = JSON.parse(localStorage.getItem(LS_STATE)||'{}');
    if (typeof d.balance==='number' && d.balance>=0) state.balance=d.balance;
    else state.balance = C.CONFIG.initialBalance;
    if (typeof d.betIndex==='number' && d.betIndex>=0 && d.betIndex<C.CONFIG.betSteps.length) state.betIndex=d.betIndex;
  } catch(e){ state.balance = C.CONFIG.initialBalance; }
}
function saveDemoState(){
  try{ localStorage.setItem(LS_STATE, JSON.stringify({version:SCHEMA, balance:state.balance, betIndex:state.betIndex})); }catch(e){}
}

/* ---- 远端（real） ---- */
function fetchRemoteBalance(){
  return fetch('/api/me',{credentials:'include',cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){ return d&&d.success&&d.user ? (Number(d.user.walletBalance)||0) : null; })
    .catch(function(){ return null; });
}
function remoteSpin(betAmt, totalWin){
  return fetch('/api/slot/spin',{
    method:'POST', credentials:'include',
    headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},
    body: JSON.stringify({bet:betAmt, totalWin:totalWin})
  }).then(function(r){ return r.json().catch(function(){return null;}); })
    .then(function(d){
      if (d&&d.success) return {ok:true, balance:Number(d.balanceAfter)};
      if (d&&d.code==='insufficient_balance') return {ok:false, reason:'NO_BALANCE'};
      return {ok:false, reason:'ERROR'};
    }).catch(function(){ return {ok:false, reason:'NETWORK'}; });
}

/* ---- 网格 ---- */
function buildGrid(){
  var box = $('reels');
  var svg = document.getElementById('win-lines');
  box.innerHTML='';
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','win-lines');
    svg.id='win-lines';
    svg.setAttribute('preserveAspectRatio','none');
  }
  box.appendChild(svg);
  for (var i=0;i<9;i++){ var c=document.createElement('div'); c.className='cell'; box.appendChild(c); }
}
function cellAt(r,c){ return document.querySelectorAll('#reels .cell')[r*3+c]; }
function drawWinLines(wins){
  var svg = document.getElementById('win-lines');
  if (!svg) return;
  var box = document.getElementById('reels');
  var boxRect = box.getBoundingClientRect();
  svg.setAttribute('viewBox', '0 0 ' + boxRect.width + ' ' + boxRect.height);
  var cells = document.querySelectorAll('#reels .cell');
  var html = '';
  wins.forEach(function(w){
    var pts = w.positions.map(function(p){
      var cell = cells[p.row * 3 + p.col]; if (!cell) return null;
      var r = cell.getBoundingClientRect();
      return { x: r.left - boxRect.left + r.width/2, y: r.top - boxRect.top + r.height/2 };
    }).filter(Boolean);
    if (pts.length < 2) return;
    var d = 'M' + pts.map(function(pt){ return pt.x + ' ' + pt.y; }).join(' L');
    html += '<path d="' + d + '"/>';
    pts.forEach(function(pt, i){
      html += '<circle cx="' + pt.x + '" cy="' + pt.y + '" style="animation-delay:' + (i*0.1) + 's"/>';
    });
  });
  svg.innerHTML = html;
}
function clearWinLines(){
  var svg = document.getElementById('win-lines');
  if (svg) svg.innerHTML = '';
}

function paintColStatic(col, syms){
  for (var r=0;r<3;r++){ var el=cellAt(r,col); var fn=S[syms[r]]; el.innerHTML=fn?fn():'';
    el.classList.remove('spinning','settling','winning'); }
}

/* ---- 渲染 ---- */
function renderBalance(){ $('balance').textContent = fmt(state.balance); }
function renderBet(){ $('bet').textContent = fmt(bet()); $('bet-txt').textContent = '下注 ' + fmt(bet()); }
function renderWin(amount){
  var el = $('win-value');
  el.textContent = amount>0 ? fmt(amount,true) : fmt(0);
  el.classList.toggle('winning', amount>0);
  if (amount>0){ el.classList.remove('pulsing'); void el.offsetWidth; el.classList.add('pulsing'); }
  $('win-label').textContent = amount>0 ? '恭喜中奖' : '本局中奖';
  $('won').textContent = amount>0 ? fmt(amount) : '¥0';
}

/* ---- 转轮动画 ---- */
function spinReel(col, target, dur, onDone){
  var cells=[cellAt(0,col),cellAt(1,col),cellAt(2,col)];
  var wobj=(MODE==='demo')?C.WEIGHTS_DEMO:C.WEIGHTS_REAL;
  var pool=Object.keys(wobj);
  cells.forEach(function(c){ c.classList.remove('winning'); c.classList.add('spinning'); });
  var start=performance.now(), lastTick=0, every=60;
  function loop(now){
    var el=now-start;
    if (el-lastTick>=every){
      lastTick=el;
      for (var r=0;r<3;r++){
        var rnd=pool[Math.floor(E.randFloat()*pool.length)];
        var fn=S[rnd]; cells[r].innerHTML=fn?fn():'';
      }
    }
    if (el<dur) requestAnimationFrame(loop);
    else {
      for (var r2=0;r2<3;r2++){
        var fn2=S[target[r2]]; cells[r2].innerHTML=fn2?fn2():'';
        cells[r2].classList.remove('spinning'); cells[r2].classList.add('settling');
        (function(e){ setTimeout(function(){ e.classList.remove('settling'); },480); })(cells[r2]);
      }
      A.reelStop(col); if (onDone) onDone();
    }
  }
  requestAnimationFrame(loop);
}

/* ---- Spin ---- */
function doSpin(){
  if (state.spinning || !state.ready) return;
  var b = bet();
  if (state.balance < b){
    A.lose();
    toast('余额不足' + (MODE==='demo'?'，请重置':'，请充值'));
    var sb=$('spin'); sb.classList.add('shake'); setTimeout(function(){ sb.classList.remove('shake'); },420);
    stopAuto(); return;
  }
  clearWinLines();
  document.querySelectorAll('#reels .cell').forEach(function(c){ c.classList.remove('winning','settling'); });
  renderWin(0);
  state.spinning=true;
  var sb2=$('spin'); sb2.disabled=true; sb2.classList.add('spinning');
  $('reels').classList.add('active'); A.spinStart();

  var grid = (MODE==='demo') ? E.spinDemo(b) : E.spin();
  var result=E.evaluate(grid,b); state.grid=grid;
  var cols=[[],[],[]];
  for (var c=0;c<3;c++) for (var r=0;r<3;r++) cols[c].push(grid[r][c]);

  var baseDelay=C.CONFIG.minSpinMs, stagger=200, done=0;
  [0,1,2].forEach(function(c){
    var dur=baseDelay+c*stagger*1.6;
    spinReel(c, cols[c], dur, function(){ done++;
      if (done===3) setTimeout(function(){ finishSpin(result,b,grid); },260);
    });
  });
}

function finishSpin(result, bAmt, grid){
  if (MODE==='demo'){
    state.balance -= bAmt; state.balance += result.totalWin;
    renderBalance(); saveDemoState(); showResult(result,bAmt,grid);
  } else {
    remoteSpin(bAmt, result.totalWin).then(function(res){
      if (res.ok){ state.balance=res.balance; renderBalance(); showResult(result,bAmt,grid); }
      else if (res.reason==='NO_BALANCE'){ toast('余额不足，请充值'); state.balance=0; renderBalance(); releaseSpin(); stopAuto(); }
      else { toast('结算失败，请稍后重试'); releaseSpin(); stopAuto(); }
    });
  }
}

function showResult(result, bAmt, grid){
  if (result.totalWin>0){
    if (is777Grid(grid)) { show777(grid); }
    renderWin(result.totalWin); bump($('balance')); bump($('won'));
    result.wins.forEach(function(w){ w.positions.forEach(function(p){
      var el=cellAt(p.row,p.col); if (el) el.classList.add('winning');
    }); });
    setTimeout(function(){ drawWinLines(result.wins); }, 80);
    var ratio=result.totalWin/bAmt;
    if (ratio>=30){ A.winBig(); flash(true); showCelebrate(ratio, result.totalWin); }
    else if (ratio>=10){ A.winBig(); flash(true); showCelebrate(ratio, result.totalWin); }
    else if (ratio>=2){ A.winMedium(); flash(false); showCelebrate(ratio, result.totalWin); }
    else { A.winSmall(); }
  } else A.lose();

  var delta=result.totalWin - bAmt;
  state.history.unshift({bet:bAmt, win:result.totalWin, delta:delta, ts:Date.now(), grid:grid, mode:MODE});
  state.history = state.history.slice(0,50); saveHistory();

  releaseSpin();
  if (state.autoOn) setTimeout(function(){ if (state.autoOn) doSpin(); },800);
}

function releaseSpin(){
  state.spinning=false;
  var sb=$('spin'); sb.disabled=false; sb.classList.remove('spinning');
  $('reels').classList.remove('active');
}

/* ---- 自动 ---- */
function startAuto(){
  if (state.spinning || state.autoOn) return;
  state.autoOn=true;
  var btn=$('btn-auto'); btn.classList.add('active');
  btn.querySelector('span').textContent='停止';
  toast('自动模式开启'); doSpin();
}
function stopAuto(){
  state.autoOn=false;
  var btn=$('btn-auto');
  if (btn){ btn.classList.remove('active');
    var sp=btn.querySelector('span'); if (sp) sp.textContent='自动'; }
}

/* ---- 下注 ---- */
function changeBet(dir){
  if (state.spinning) return;
  var n=state.betIndex+dir;
  if (n<0) n=0; if (n>=C.CONFIG.betSteps.length) n=C.CONFIG.betSteps.length-1;
  if (n===state.betIndex) return;
  state.betIndex=n; renderBet(); A.click();
  if (MODE==='demo') saveDemoState();
}

/* ---- 弹窗 ---- */
function is777Grid(grid){
  if (!grid) return false;
  var lines = C.PAYLINES;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i], hit = 0;
    for (var c = 0; c < line.length; c++) {
      var sym = grid[line[c]][c];
      if (sym === 'seven' || sym === 'goldenSeven') hit++; else break;
    }
    if (hit === 3) return true;
  }
  return false;
}

function show777(grid){
  if (!is777Grid(grid)) return;
  var el = document.getElementById('celebrate');
  var tier = document.getElementById('celebrate-tier');
  var amt = document.getElementById('celebrate-amount');
  if (!el || !tier || !amt) return;
  setTimeout(function(){
    tier.textContent = 'LUCKY 777';
    amt.textContent = '';
    el.classList.add('show', 'mega');
    el.setAttribute('aria-hidden','false');
    A.winBig();
    flash(true);
    setTimeout(function(){
      el.classList.remove('show', 'mega');
      el.setAttribute('aria-hidden','true');
    }, 2400);
  }, 600);
}

function showCelebrate(ratio, totalWin){
  var el = document.getElementById('celebrate');
  var tier = document.getElementById('celebrate-tier');
  var amt = document.getElementById('celebrate-amount');
  if (!el || !tier || !amt) return;
  var label = '';
  if (ratio >= 30)      label = 'MEGA WIN';
  else if (ratio >= 10) label = 'BIG WIN';
  else if (ratio >= 2)  label = 'NICE WIN';
  else return; // 小赢不进 banner
  tier.textContent = label;
  amt.textContent = '+' + fmt(totalWin);
  el.classList.toggle('mega', ratio >= 30);
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  setTimeout(function(){
    el.classList.remove('show', 'mega');
    el.setAttribute('aria-hidden', 'true');
  }, 2400);
}

function openModal(t,h){ $('modal-title').textContent=t; $('modal-body').innerHTML=h;
  $('modal').classList.add('show'); $('modal').setAttribute('aria-hidden','false'); }
function closeModal(){ $('modal').classList.remove('show'); $('modal').setAttribute('aria-hidden','true'); }

function showPaytable(){
  var order=['cherry','lemon','orange','grape','watermelon','bell','bar','seven','goldenSeven','wild'];
  var html='';
  order.forEach(function(id){
    var s=C.SYMBOLS[id], m=C.PAYOUTS[id], svg=S[id]?S[id]():'';
    html += '<div class="sym-row"><div class="sym-icon">'+svg+'</div>'+
      '<div class="sym-info"><div class="sym-name">'+s.name+'</div>'+
      '<div class="sym-pay">3 个相同 → ×'+m+'</div></div></div>';
  });
  html += '<h4>中奖线</h4><p>共 5 条：横排 3 条 + 对角线 2 条</p>' +
    '<h4>百搭（Wild）</h4><p>可替代除自己以外的任意符号，帮助凑成三连。</p>';
  openModal('赔付表', html);
}
function showHistory(){
  if (!state.history.length){
    openModal('游戏记录','<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>'); return;
  }
  var tb=0,tw=0,w=0;
  state.history.forEach(function(h){ tb+=h.bet; tw+=h.win; if(h.win>0) w++; });
  var head='<div class="hist-summary">'+
    '<div><span>总局数</span><b>'+state.history.length+'</b></div>'+
    '<div><span>中奖次数</span><b>'+w+'</b></div>'+
    '<div><span>总下注</span><b>'+fmt(tb)+'</b></div>'+
    '<div><span>总中奖</span><b>'+fmt(tw)+'</b></div>'+
    '</div><h4 style="margin-top:18px;">最近记录</h4>';
  var rows='';
  state.history.forEach(function(h){
    var cls=h.delta>0?'win':'lose';
    var txt=(h.delta>0?'+':'')+'¥'+h.delta.toFixed(2);
    var t=new Date(h.ts), hh=String(t.getHours()).padStart(2,'0'), mm=String(t.getMinutes()).padStart(2,'0');
    rows+='<div class="hist-row"><div><div style="font-weight:700;">下注 '+fmt(h.bet)+'</div>'+
      '<div style="font-size:12px;color:#999;">'+hh+':'+mm+' · 中奖 '+fmt(h.win)+'</div></div>'+
      '<div class="hist-amt '+cls+'">'+txt+'</div></div>';
  });
  openModal('游戏记录', head+rows);
}

/* ---- 重置 / 充值 ---- */
function actionMode(){
  if (state.spinning){ toast('请等待本局结束'); return; }
  if (MODE==='demo'){
    if (!confirm('重置演示余额为 ¥'+C.CONFIG.initialBalance.toFixed(2)+'？')) return;
    state.balance=C.CONFIG.initialBalance; state.betIndex=C.CONFIG.defaultBetIndex;
    state.history=[]; saveDemoState(); saveHistory();
    renderBalance(); renderBet(); renderWin(0); toast('已重置');
  } else {
    openModal('充值',
      '<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>'+
      '<p style="font-size:12px;color:#999;text-align:center;">如需增加账户余额，请联系平台客服。</p>');
  }
}

function toggleSound(){
  state.soundOn=!state.soundOn; A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn?'1':'0.35';
  saveSettings(); if (state.soundOn) A.click();
}

/* ---- 绑定 ---- */
function bind(){
  $('bet-minus').addEventListener('click', function(){ changeBet(-1); });
  $('bet-plus').addEventListener('click', function(){ changeBet(1); });
  $('spin').addEventListener('click', function(){ A.init(); doSpin(); });
  $('btn-auto').addEventListener('click', function(){ if (state.autoOn) stopAuto(); else startAuto(); });
  $('btn-history').addEventListener('click', showHistory);
  $('btn-paytable').addEventListener('click', showPaytable);
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-menu').addEventListener('click', actionMode);
  var ma=$('btn-mode-action'); if (ma) ma.addEventListener('click', actionMode);
  $('modal-x').addEventListener('click', closeModal);
  document.querySelector('.modal-mask').addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e){
    var k = String(e.key || '').toLowerCase();
    if (e.key===' '||e.key==='Enter'){
      if (document.activeElement && document.activeElement.tagName==='BUTTON') return;
      e.preventDefault(); A.init(); doSpin(); return;
    }
    if (e.key==='ArrowUp'){ e.preventDefault(); changeBet(1); return; }
    if (e.key==='ArrowDown'){ e.preventDefault(); changeBet(-1); return; }
    if (e.key==='Escape'){ closeModal(); stopAuto(); return; }
    if (k==='m'){ toggleSound(); return; }
    if (k==='h'){ showHistory(); return; }
    if (k==='p'){ showPaytable(); return; }
    if (k==='a'){ if (state.autoOn) stopAuto(); else startAuto(); return; }
  });

  document.addEventListener('visibilitychange', function(){ if (document.hidden && state.autoOn) stopAuto(); });
  window.addEventListener('pagehide', function(){ if (state.autoOn) stopAuto(); });
}

/* ---- 模式 UI ---- */
function setupModeUI(){
  var ma=$('btn-mode-action'); if (!ma) return;
  ma.style.display='';
  var ic = MODE==='demo'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
  ma.innerHTML = ic + '<span>' + (MODE==='demo' ? '重置余额' : '充值余额') + '</span>';
  var brand=document.querySelector('.brand');
  if (brand && MODE==='demo') brand.textContent='幸运水果 · 试玩';
}

/* ---- 启动 ---- */
function init(){
  loadSettings(); loadHistory();
  E.setMode(MODE);
  A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn?'1':'0.35';
  buildGrid(); renderWin(0); bind(); setupModeUI();

  if (MODE==='real'){
    fetchRemoteBalance().then(function(bal){
      if (bal===null){ toast('请先登录'); setTimeout(function(){ location.replace('/'); },800); return; }
      state.balance=bal; state.ready=true;
      renderBalance(); renderBet();
      var g=E.spin();
      for (var c=0;c<3;c++){ var col=[]; for (var r=0;r<3;r++) col.push(g[r][c]); paintColStatic(c,col); }
      console.log('[幸运水果] real 就绪');
    });
  } else {
    loadDemoState(); state.ready=true;
    renderBalance(); renderBet();
    var g2=E.spin();
    for (var c2=0;c2<3;c2++){ var col2=[]; for (var r2=0;r2<3;r2++) col2.push(g2[r2][c2]); paintColStatic(c2,col2); }
    console.log('[幸运水果] demo 就绪');
  }
}
if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
