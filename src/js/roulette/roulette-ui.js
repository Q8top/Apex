/* 欧洲/美式轮盘 · UI */
(function(){
'use strict';
var C=window.RouletteConfig, E=window.RouletteEngine, S=window.RouletteSymbols, A=window.RouletteAudio;

/* 欧洲 / 美式由 URL ?type= 决定（默认 euro） */
var TYPE=(function(){
  // 1) 优先从 URL ?type= 读取（向后兼容）
  var m=String(location.search).match(/[?&]type=([a-z]+)/i);
  if (m) { var v=m[1].toLowerCase(); return v==='american'?'american':'euro'; }
  // 2) 从页面文件名判断（roulette-amer.html → american）
  if (/roulette-amer/i.test(location.pathname)) return 'american';
  // 3) 兜底
  return 'euro';
})();
var IS_AMER = (TYPE === 'american');
var WHEEL = IS_AMER ? C.AMER_WHEEL : C.EURO_WHEEL;
var SCALE = IS_AMER ? C.AMER_SCALE : C.EURO_SCALE;

var MODE=(function(){
  var m=String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v=m?m[1].toLowerCase():'demo';
  return v==='real'?'real':'demo';
})();

var LS_STATE='apex_roulette_'+TYPE+'_v1_'+MODE+'_state';
var LS_HIST='apex_roulette_'+TYPE+'_v1_'+MODE+'_history';

var state={
  balance:1000, betIndex:2, history:[],
  phase:'idle',   // idle | spinning | done
  bets:[],        // [{spot, amount}]
  lastNum:null, lastWin:0,
  ready:false, spinTimer:null
};

function $(id){return document.getElementById(id);}
function fmt(n,sign){var v=Math.round(n*100)/100;var s=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (sign&&v>0?'+':'')+'¥'+s;}
function bet(){return C.CONFIG.betSteps[state.betIndex];}
function toast(m,ms){var t=$('rl-toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(function(){t.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[RL] audio@'+n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}

function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;}catch(e){}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function renderBalance(animate){var el=$('rl-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('rl-bet');if(e1)e1.textContent=fmt(bet());var e2=$('rl-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderWin(amount,win){var el=$('rl-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',!!win);if(win){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}}
function renderTotalBet(){var el=$('rl-total-bet');if(!el)return;var t=0;state.bets.forEach(function(b){t+=b.amount;});el.textContent=fmt(t);}

/* ───── 生成轮盘 ───── */
function buildWheel(){
  var wrap=$('rl-wheel-svg');
  if(wrap)wrap.innerHTML=S.wheelSVG(IS_AMER);
  var ballWrap=$('rl-ball-wrap');
  if(ballWrap)ballWrap.innerHTML='<div class="rl-ball">'+S.ball()+'</div>';
}

/* ───── 生成注区 ───── */
function buildBoard(){
  var grid=$('rl-grid');if(!grid)return;
  var html='';
  var colOffset = IS_AMER ? 3 : 2;   // 美式占 2 列 0+00，欧洲占 1 列 0

  // 0 / 00
  if(IS_AMER){
    html += '<div class="rl-cell green zero" data-spot="straight:-1" style="grid-column:1;grid-row:1/4;">00</div>';
    html += '<div class="rl-cell green zero" data-spot="straight:0" style="grid-column:2;grid-row:1/4;">0</div>';
  } else {
    html += '<div class="rl-cell green zero" data-spot="straight:0" style="grid-column:1;grid-row:1/4;">0</div>';
  }

  // 12 列 × 3 行数字
  for (var col = 0; col < 12; col++) {
    for (var row = 0; row < 3; row++) {
      var num = col * 3 + (3 - row);
      var cls = C.isRed(num) ? 'red' : 'black';
      var gc = col + colOffset;
      var gr = row + 1;
      html += '<div class="rl-cell num '+cls+'" data-spot="straight:'+num+'" style="grid-column:'+gc+';grid-row:'+gr+';">'+num+'</div>';
    }
  }

  // 3 打（grid-row 4）
  var dozenStart = colOffset;
  var dozenSpan = Math.floor(12 / 3);  // 4
  html += '<div class="rl-cell wide" data-spot="dozen1" style="grid-column:'+(dozenStart)+' / span 4;grid-row:4;">1st 12</div>';
  html += '<div class="rl-cell wide" data-spot="dozen2" style="grid-column:'+(dozenStart+4)+' / span 4;grid-row:4;">2nd 12</div>';
  html += '<div class="rl-cell wide" data-spot="dozen3" style="grid-column:'+(dozenStart+8)+' / span 4;grid-row:4;">3rd 12</div>';

  // 底部 6 类（grid-row 5）
  var b1 = IS_AMER ? 1 : 1;
  var row5Start = IS_AMER ? 1 : 1;
  var span5 = 2;  // 每个占 2 列
  var c = row5Start;
  html += '<div class="rl-cell wide-2" data-spot="low"  style="grid-column:'+c+' / span 2;grid-row:5;">1-18</div>';   c += 2;
  html += '<div class="rl-cell wide-2" data-spot="even" style="grid-column:'+c+' / span 2;grid-row:5;">双</div>';      c += 2;
  html += '<div class="rl-cell red wide-2"   data-spot="red"  style="grid-column:'+c+' / span 2;grid-row:5;">红</div>'; c += 2;
  html += '<div class="rl-cell black wide-2" data-spot="black" style="grid-column:'+c+' / span 2;grid-row:5;">黑</div>'; c += 2;
  html += '<div class="rl-cell wide-2" data-spot="odd"  style="grid-column:'+c+' / span 2;grid-row:5;">单</div>';      c += 2;
  html += '<div class="rl-cell wide-2" data-spot="high" style="grid-column:'+c+' / span 2;grid-row:5;">19-36</div>';

  grid.innerHTML = html;

  // 事件绑定（事件委托）
  if (!grid.dataset.bound) {
    grid.dataset.bound='1';
    grid.addEventListener('click', function(e){
      var cell = e.target.closest ? e.target.closest('.rl-cell') : null;
      if (!cell) return;
      if (state.phase !== 'idle') { toast('请等待本局结束'); return; }
      var spot = cell.getAttribute('data-spot');
      if (spot) addBet(spot);
    });
  }
}

function addBet(spot){
  if (state.balance < bet()) { toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值')); return; }
  var exist = null;
  for (var i = 0; i < state.bets.length; i++) if (state.bets[i].spot === spot) { exist = state.bets[i]; break; }
  if (exist) exist.amount += bet();
  else state.bets.push({ spot: spot, amount: bet() });
  state.balance -= bet();
  if (MODE==='demo') { saveState(); }
  renderBalance(true);
  paintChips();
  renderTotalBet();
  safeAudio(A.chip,'chip');
}

function paintChips(){
  var cells = document.querySelectorAll('.rl-cell');
  cells.forEach(function(cell){
    cell.classList.remove('has-chips');
    var old = cell.querySelector('.chip-badge');
    if (old) old.remove();
  });
  var map = {};
  state.bets.forEach(function(b){
    if (!map[b.spot]) map[b.spot] = 0;
    map[b.spot] += b.amount;
  });
  cells.forEach(function(cell){
    var spot = cell.getAttribute('data-spot');
    if (map[spot]) {
      cell.classList.add('has-chips');
      var b = document.createElement('span');
      b.className = 'chip-badge';
      b.textContent = Math.round(map[spot]);
      cell.appendChild(b);
    }
  });
}

function clearBets(){
  if (state.phase !== 'idle') return;
  if (!state.bets.length) return;
  // 退回本金
  var back = 0;
  state.bets.forEach(function(b){ back += b.amount; });
  state.balance += back;
  state.bets = [];
  if (MODE==='demo') saveState();
  renderBalance(true);
  paintChips();
  renderTotalBet();
  safeAudio(A.click,'clear');
}

/* ───── 旋转动画 ───── */
function animateSpin(targetNum, durMs){
  var wheelEl = $('rl-wheel-svg');
  var ballWrap = $('rl-ball-wrap');
  if (!wheelEl || !ballWrap) return;

  var idx = WHEEL.indexOf(targetNum);
  if (idx < 0) idx = 0;
  var targetAngle = (idx / WHEEL.length) * 360;

  // 球：多圈 + 停在目标角度
  ballWrap.style.transition = 'none';
  ballWrap.style.transform = 'rotate(0deg)';
  void ballWrap.offsetWidth;
  ballWrap.style.transition = 'transform ' + durMs + 'ms cubic-bezier(.15,.75,.25,1)';
  ballWrap.style.transform = 'rotate(' + (360 * 7 + targetAngle) + 'deg)';

  // 轮盘：反向多圈（回到原位）
  wheelEl.style.transition = 'none';
  wheelEl.style.transform = 'rotate(0deg)';
  void wheelEl.offsetWidth;
  wheelEl.style.transition = 'transform ' + durMs + 'ms cubic-bezier(.2,.7,.3,1)';
  wheelEl.style.transform = 'rotate(' + (-360 * 5) + 'deg)';

  safeAudio(function(){ A.spinStart(durMs); }, 'spinStart');
}

/* ───── 主流程 ───── */
function doSpin(){
  if (state.phase !== 'idle') return;
  if (!state.bets.length) { toast('请先下注'); return; }
  state.phase = 'spinning';
  var sb = $('rl-spin'); if (sb) sb.disabled = true;
  var cb = $('rl-clear'); if (cb) cb.disabled = true;

  var num = E.spin(IS_AMER);
  state.lastNum = num;
  var totalBet = 0; state.bets.forEach(function(b){ totalBet += b.amount; });

  // 结算（提前计算，动画结束才显示）
  var res = E.settle(state.bets, num, SCALE);

  // 动画
  animateSpin(num, C.CONFIG.spinDurationMs);

  state.spinTimer = setTimeout(function(){
    safeAudio(function(){ A.spinStop(); }, 'spinStop');
    safeAudio(function(){ A.ballSettle(); }, 'ballSettle');

    // 显示数字
    var el = $('rl-result-num');
    if (el) {
      el.textContent = (num === -1 ? '00' : String(num));
      el.classList.add('show');
    }

    // 显示结果
    if (res.netWin > 0) {
      safeAudio(function(){ A.win(); }, 'win');
      renderWin(res.totalWin - totalBet, true);
      if (res.netWin >= 50) safeAudio(function(){ A.bigWin(); }, 'bigWin');
    } else if (res.netWin === 0 && res.totalWin > 0) {
      renderWin(0, false);
    } else {
      safeAudio(function(){ A.lose(); }, 'lose');
      renderWin(0, false);
    }

    // real 模式：提交服务端
    if (MODE === 'real' && res.totalWin > 0) {
      fetch('/api/slot/spin', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},
        body:JSON.stringify({bet:totalBet,totalWin:res.totalWin})
      }).then(function(r){return r.ok?r.json():null;}).then(function(d){
        if (d && typeof d.balanceAfter === 'number') { state.balance = d.balanceAfter; renderBalance(true); }
      }).catch(function(){});
    } else if (MODE === 'real') {
      // 输了也要告诉服务端扣注（我们的 /api/slot/spin 只接受 totalWin，那 bet 也一起传，输时 totalWin=0）
      fetch('/api/slot/spin', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},
        body:JSON.stringify({bet:totalBet,totalWin:0})
      }).then(function(r){return r.ok?r.json():null;}).then(function(d){
        if (d && typeof d.balanceAfter === 'number') { state.balance = d.balanceAfter; renderBalance(true); }
      }).catch(function(){});
    } else {
      // demo: 加回赢分
      if (res.totalWin > 0) {
        state.balance += res.totalWin;
        saveState();
        renderBalance(true);
      }
    }

    // 记录
    state.history.unshift({
      num: num, bet: totalBet, win: res.totalWin,
      delta: res.totalWin - totalBet, ts: Date.now()
    });
    if (state.history.length > 30) state.history = state.history.slice(0, 30);
    saveHist();

    // 清空当前注单（等 2 秒后）
    setTimeout(function(){
      state.bets = [];
      paintChips();
      renderTotalBet();
      var el2 = $('rl-result-num'); if (el2) el2.classList.remove('show');

      state.phase = 'idle';
      if (sb) sb.disabled = false;
      if (cb) cb.disabled = false;
    }, 2200);
  }, C.CONFIG.spinDurationMs + 200);
}

/* ───── 弹窗 ───── */
function openModal(t,h){var m=$('rl-modal');if(!m)return;var a=$('rl-modal-title');if(a)a.textContent=t;var b=$('rl-modal-body');if(b)b.innerHTML=h;m.classList.add('show');m.setAttribute('aria-hidden','false');}
function closeModal(){var m=$('rl-modal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');}

function showHistory(){
  if(!state.history.length){openModal('游戏记录','<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>');return;}
  var tb=0,tw=0,w=0;
  state.history.forEach(function(h){tb+=h.bet;tw+=h.win;if(h.win>h.bet)w++;});
  var head='<div class="hist-summary">'+
    '<div><span>总局数</span><b>'+state.history.length+'</b></div>'+
    '<div><span>获胜次数</span><b>'+w+'</b></div>'+
    '<div><span>总下注</span><b>'+fmt(tb)+'</b></div>'+
    '<div><span>总收获</span><b>'+fmt(tw)+'</b></div>'+
    '</div><h4 style="margin-top:14px;font-weight:800;">最近记录</h4>';
  var rows='';
  state.history.forEach(function(h){
    var d=h.delta;
    var cls=d>0?'win':'lose';
    var txt=(d>0?'+':'')+'¥'+d.toFixed(2);
    var t=new Date(h.ts),hh=String(t.getHours()).padStart(2,'0'),mm=String(t.getMinutes()).padStart(2,'0');
    var numShow=(h.num===-1?'00':String(h.num));
    rows+='<div class="hist-row"><div><div style="font-weight:700;">下注 '+fmt(h.bet)+'</div>'+
      '<div style="font-size:12px;color:#999;">'+hh+':'+mm+' · 开出 '+numShow+' · 收获 '+fmt(h.win)+'</div></div>'+
      '<div class="hist-amt '+cls+'">'+txt+'</div></div>';
  });
  openModal('游戏记录',head+rows);
}

function showRules(){
  var html='<div style="font-size:13.5px;line-height:1.9;color:#333;">'+
    '<p style="margin:0 0 10px;"><b>'+(IS_AMER?'美式':'欧洲')+'轮盘</b>：'+(IS_AMER?'38 格（0 + 00）':'37 格（单 0）')+'</p>'+
    '<p style="margin:16px 0 10px;"><b>下注方式</b></p>'+
    '<p style="margin:0 0 6px;">· 点格下注 · 点「清除」退还全部下注 · 点「旋转」开始</p>'+
    '<p style="margin:16px 0 10px;"><b>赔付倍数</b></p>'+
    '<p style="margin:0 0 6px;">· 单数字 straight：×35</p>'+
    '<p style="margin:0 0 6px;">· 红/黑、单/双、小/大：×1</p>'+
    '<p style="margin:0 0 6px;">· 打（1st/2nd/3rd 12）：×2</p>'+
    '<p style="margin:16px 0 10px;"><b>说明</b></p>'+
    '<p style="margin:0;color:#888;">本游戏为虚拟积分娱乐，不涉及真实货币</p>'+
    '</div>';
  openModal('游戏规则',html);
}

function actionMode(){
  var isDemo=MODE==='demo';
  var html='<div style="text-align:center;padding:8px 0 16px;">'+
    '<div style="font-size:12px;color:#888;font-weight:700;letter-spacing:2px;margin-bottom:6px;">当前余额</div>'+
    '<div style="font-size:32px;font-weight:900;color:#0a0a0a;font-variant-numeric:tabular-nums;">'+fmt(state.balance)+'</div>'+
    '</div>'+
    '<div style="display:flex;gap:8px;">'+
    '<button id="rl-reset-ok" style="flex:1;height:46px;border:0;border-radius:12px;background:#0a0a0a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;">'+(isDemo?'重置为 ¥1,000.00':'充值余额')+'</button>'+
    '<button id="rl-reset-cancel" style="flex:1;height:46px;border:0;border-radius:12px;background:#f0f0f2;color:#555;font-weight:800;font-size:14px;cursor:pointer;">取消</button>'+
    '</div>';
  openModal(isDemo?'重置余额':'充值余额',html);
  setTimeout(function(){
    var ok=$('rl-reset-ok'),ca=$('rl-reset-cancel');
    if(ok)ok.addEventListener('click',function(){
      if(isDemo){state.balance=1000;state.betIndex=2;state.bets=[];state.history=[];saveState();saveHist();renderBalance();renderBet();paintChips();renderTotalBet();closeModal();toast('已重置');}
      else{closeModal();openModal('充值','<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');}
    });
    if(ca)ca.addEventListener('click',closeModal);
  },50);
}

function changeBet(d){
  if (state.phase !== 'idle') return;
  var idx = state.betIndex + d;
  if (idx < 0) idx = 0;
  if (idx >= C.CONFIG.betSteps.length) idx = C.CONFIG.betSteps.length - 1;
  if (idx === state.betIndex) return;
  state.betIndex = idx; saveState(); renderBet();
  safeAudio(A.click,'click');
}

function setupMode(){
  var brand = document.querySelector('.rl-brand');
  if (brand) {
    var base = IS_AMER ? '美式轮盘' : '欧洲轮盘';
    brand.textContent = base + (MODE==='demo'?' · 试玩':'');
  }
  var ma=$('rl-mode-action');
  if(ma){
    var isDemo=MODE==='demo';
    var ic=isDemo?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;stroke:currentColor;fill:none;"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;stroke:currentColor;fill:none;"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
    ma.innerHTML=ic+'<span>'+(isDemo?'重置余额':'充值余额')+'</span>';
  }
}

function bind(){
  var e;
  if((e=$('rl-bet-minus')))e.addEventListener('click',function(){changeBet(-1);});
  if((e=$('rl-bet-plus')))e.addEventListener('click',function(){changeBet(1);});
  if((e=$('rl-spin')))e.addEventListener('click',doSpin);
  if((e=$('rl-clear')))e.addEventListener('click',clearBets);
  if((e=$('rl-history')))e.addEventListener('click',showHistory);
  if((e=$('rl-menu')))e.addEventListener('click',showRules);
  if((e=$('rl-mode-action')))e.addEventListener('click',actionMode);
  var soundOn=true;
  if((e=$('rl-sound')))e.addEventListener('click',function(){soundOn=!soundOn;safeAudio(function(){A.enabled(soundOn);},'toggle');e.style.opacity=soundOn?'1':'0.35';toast(soundOn?'音效已开':'音效已关',900);});
  if((e=$('rl-modal-x')))e.addEventListener('click',closeModal);
  var mask=document.querySelector('.rl-modal-mask');if(mask)mask.addEventListener('click',closeModal);
  document.addEventListener('keydown',function(ev){
    if(ev.target&&ev.target.tagName==='INPUT')return;
    if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();if(state.phase==='idle')doSpin();}
    else if(ev.key==='ArrowUp'){ev.preventDefault();changeBet(1);}
    else if(ev.key==='ArrowDown'){ev.preventDefault();changeBet(-1);}
    else if(ev.key==='Escape'){closeModal();}
  });
}

function init(){
  safeAudio(A.init,'initAudio');
  buildWheel();
  buildBoard();
  bind();
  setupMode();
  renderBalance();renderBet();renderWin(0);renderTotalBet();
  if(MODE==='real'){
    fetch('/api/me',{credentials:'include',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d||!d.success||!d.user){toast('请先登录');setTimeout(function(){location.replace('/');},800);return;}
      state.balance=Number(d.user.walletBalance)||0;state.ready=true;renderBalance();
      loadHist();
    }).catch(function(){toast('网络错误');});
  } else {
    loadState();loadHist();state.ready=true;renderBalance();renderBet();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
