/* Crash 系列 · UI（Aviator / Crash / JetX 共用） */
(function(){
'use strict';
var C=window.CrashCore, A=window.CrashAudio;

var GAME=(function(){
  var d=document.body.getAttribute('data-game')||'aviator';
  return d;
})();
var MODE=(function(){
  var m=String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v=m?m[1].toLowerCase():'demo';
  return v==='real'?'real':'demo';
})();

var LS_STATE='apex_crash_v1_'+GAME+'_'+MODE+'_state';
var LS_HIST='apex_crash_v1_'+GAME+'_'+MODE+'_history';

var state={
  balance:1000, betIndex:3, history:[],
  roundState:'idle',       // idle | flying | busted | cashed
  currentMulti:1.00,
  crashAt:0,
  startTime:0,
  cashedMulti:0,
  rafId:0,
  autoX:0,                 // 自动提现倍率（0=关闭）
  ready:false,
  safetyTimer:null
};

function $(id){return document.getElementById(id);}
function fmt(n,sign){var v=Math.round(n*100)/100;var s=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (sign&&v>0?'+':'')+'¥'+s;}
function bet(){return [1,2,5,10,20,50,100][state.betIndex];}
function toast(m,ms){var t=$('cr-toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(function(){t.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[Crash] audio@'+n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}

function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;if(typeof d.autoX==='number')state.autoX=d.autoX;}catch(e){}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex,autoX:state.autoX}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function renderBalance(animate){var el=$('cr-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('cr-bet');if(e1)e1.textContent=fmt(bet());var e2=$('cr-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderAutoX(){var el=$('cr-auto-x');if(!el)return;el.textContent=state.autoX>0?(state.autoX.toFixed(2)+'×'):'关闭';}
function renderMulti(v){var el=$('cr-multi');if(el)el.innerHTML=v.toFixed(2)+'<span class="cr-multi-x">×</span>';}
function renderStatus(s){var el=$('cr-status');if(el)el.textContent=s;}
function renderWin(amount,combo){
  var el=$('cr-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',amount>0);if(amount>0){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}
  var lbl=$('cr-win-label');if(lbl)lbl.textContent=amount>0?'恭喜中奖':'本局收获';
  var cb=$('cr-combo');if(cb){if(combo){cb.textContent=combo;cb.classList.add('show');}else{cb.textContent='';cb.classList.remove('show');}}
}
function renderHistory(){
  var el=$('cr-history');if(!el)return;
  var html='';
  state.history.slice(0,20).forEach(function(h){
    var cls=h.win>0?'win':'lose';
    html+='<span class="cr-hist-chip '+cls+'">'+h.mult.toFixed(2)+'×</span>';
  });
  el.innerHTML=html;
}

/* canvas 曲线 */
var cv=null, cx=null;
function initCanvas(){
  cv=$('cr-canvas');if(!cv)return;
  cx=cv.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize',resizeCanvas);
}
function resizeCanvas(){
  if(!cv)return;
  var r=cv.parentElement.getBoundingClientRect();
  var dpr=window.devicePixelRatio||1;
  cv.width=r.width*dpr;cv.height=r.height*dpr;
  cv.style.width=r.width+'px';cv.style.height=r.height+'px';
  cx.setTransform(dpr,0,0,dpr,0,0);
  drawScene();
}
function drawScene(){
  if(!cx)return;
  var w=cv.width/(window.devicePixelRatio||1), h=cv.height/(window.devicePixelRatio||1);
  cx.clearRect(0,0,w,h);
  // 网格
  cx.strokeStyle='rgba(255,255,255,.06)';cx.lineWidth=1;
  for(var i=1;i<6;i++){cx.beginPath();cx.moveTo(w*i/6,0);cx.lineTo(w*i/6,h);cx.stroke();cx.beginPath();cx.moveTo(0,h*i/6);cx.lineTo(w,h*i/6);cx.stroke();}

  if(state.roundState==='idle'){return;}

  var t=(state.roundState==='flying')?(Date.now()-state.startTime):(state.lastBustedT||0);
  var isBusted=state.roundState==='busted';
  var isCashed=state.roundState==='cashed';
  var multi=isBusted?state.crashAt:(isCashed?state.cashedMulti:C.multiAt(t));
  var progress=Math.min(multi/state.crashAt,1);

  // 曲线终点
  var ex=w*0.05 + (w*0.85)*Math.pow(progress,0.7);
  var ey=h*0.92 - (h*0.78)*Math.pow(progress,0.9);
  if(isBusted){ex=w*0.05+(w*0.85);ey=h*0.14;}

  // 尾迹 + 曲线（用主题色）
  var accent=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e5484d';
  cx.lineWidth=3.5;cx.lineCap='round';
  // 外发光
  cx.strokeStyle=accent;cx.globalAlpha=0.25;
  cx.beginPath();cx.moveTo(w*0.05,h*0.92);
  cx.quadraticCurveTo(w*0.45,h*0.65,ex,ey);cx.stroke();
  cx.globalAlpha=1;
  // 主线
  cx.beginPath();cx.moveTo(w*0.05,h*0.92);
  cx.quadraticCurveTo(w*0.45,h*0.65,ex,ey);cx.stroke();

  // 虚线尾迹（流动感）
  cx.setLineDash([6,8]);cx.globalAlpha=.4;
  cx.beginPath();cx.moveTo(w*0.05,h*0.92);
  cx.quadraticCurveTo(w*0.45,h*0.65,ex*0.8,ey*0.8);
  cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;

  // 图标
  if(isBusted){
    // 爆炸冲击波
    var bustAge=(Date.now()-state.lastBustedT)/1000;
    if(bustAge<0.8){
      var r=20+bustAge*120;
      cx.globalAlpha=Math.max(0,1-bustAge/0.8);
      cx.strokeStyle='#fff8c0';cx.lineWidth=4;
      cx.beginPath();cx.arc(ex,ey,r,0,Math.PI*2);cx.stroke();
      cx.strokeStyle=accent;cx.lineWidth=2.5;
      cx.beginPath();cx.arc(ex,ey,r*0.7,0,Math.PI*2);cx.stroke();
      cx.globalAlpha=1;
    }
    // 爆炸星
    cx.fillStyle='#ffe060';
    cx.beginPath();
    for(var k=0;k<12;k++){
      var ang=k*Math.PI/6;
      var rr=(k%2===0)?16:7;
      cx.lineTo(ex+Math.cos(ang)*rr, ey+Math.sin(ang)*rr);
    }
    cx.closePath();cx.fill();
    cx.strokeStyle='#0a0a0a';cx.lineWidth=1.5;cx.stroke();
  } else {
    // 飞机/火箭图标（按游戏类型）
    drawVehicle(ex,ey,accent);
  }

  // 起点小圆
  cx.fillStyle=accent;cx.beginPath();cx.arc(w*0.05,h*0.92,4,0,Math.PI*2);cx.fill();
  cx.strokeStyle='#0a0a0a';cx.lineWidth=1.5;cx.stroke();
}

function drawVehicle(x,y,accent){
  cx.save();
  cx.translate(x,y);
  var game=document.body.getAttribute('data-game')||'aviator';
  if(game==='aviator'){
    // 飞机（侧视 45°）
    cx.rotate(-0.3);
    cx.fillStyle=accent;cx.strokeStyle='#0a0a0a';cx.lineWidth=2;
    cx.beginPath();
    cx.moveTo(16,0);cx.lineTo(-2,-8);cx.lineTo(-4,0);cx.lineTo(-14,-6);
    cx.lineTo(-10,0);cx.lineTo(-14,6);cx.lineTo(-4,0);cx.lineTo(-2,8);
    cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle='#fff';
    cx.beginPath();cx.arc(6,-1,2,0,Math.PI*2);cx.fill();
  } else if(game==='crash'){
    // 火箭（斜向上）
    cx.rotate(-0.6);
    cx.fillStyle=accent;cx.strokeStyle='#0a0a0a';cx.lineWidth=2;
    cx.beginPath();
    cx.moveTo(14,0);cx.lineTo(4,-6);cx.lineTo(-8,-6);cx.lineTo(-12,-2);
    cx.lineTo(-12,2);cx.lineTo(-8,6);cx.lineTo(4,6);
    cx.closePath();cx.fill();cx.stroke();
    // 尾焰
    cx.fillStyle='#ffb040';
    cx.beginPath();cx.moveTo(-12,-3);cx.lineTo(-20,0);cx.lineTo(-12,3);cx.closePath();cx.fill();
    cx.fillStyle='#fff8c0';
    cx.beginPath();cx.moveTo(-12,-1.5);cx.lineTo(-16,0);cx.lineTo(-12,1.5);cx.closePath();cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(4,-1.5,1.8,0,Math.PI*2);cx.fill();
  } else {
    // 喷气机（侧视 30°）
    cx.rotate(-0.5);
    cx.fillStyle=accent;cx.strokeStyle='#0a0a0a';cx.lineWidth=2;
    cx.beginPath();
    cx.moveTo(14,0);cx.lineTo(0,-6);cx.lineTo(-10,-5);cx.lineTo(-10,5);
    cx.lineTo(0,6);cx.closePath();cx.fill();cx.stroke();
    // 机翼
    cx.beginPath();
    cx.moveTo(0,-2);cx.lineTo(-6,-12);cx.lineTo(2,-4);cx.closePath();
    cx.fill();cx.stroke();
    cx.beginPath();
    cx.moveTo(0,2);cx.lineTo(-6,12);cx.lineTo(2,4);cx.closePath();
    cx.fill();cx.stroke();
    // 尾焰
    cx.fillStyle='#ffb040';
    cx.beginPath();cx.moveTo(-10,-2);cx.lineTo(-18,0);cx.lineTo(-10,2);cx.closePath();cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(6,-1,1.6,0,Math.PI*2);cx.fill();
  }
  cx.restore();
}

/* 游戏循环 */
function tick(){
  if(state.roundState!=='flying')return;
  var t=Date.now()-state.startTime;
  var multi=C.multiAt(t);
  state.currentMulti=multi;
  // 自动提现
  if(state.autoX>0 && multi>=state.autoX && state.autoX<state.crashAt){
    doCashout(state.autoX);return;
  }
  if(multi>=state.crashAt){
    doBust(state.crashAt);return;
  }
  renderMulti(multi);
  updateCashoutBtn(multi);
  drawScene();
  state.rafId=requestAnimationFrame(tick);
}

function startRound(){
  if(state.roundState!=='idle')return;
  if(state.balance<bet()){toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值'));return;}
  state.roundState='flying';
  state.crashAt=C.generateCrash();
  state.startTime=Date.now();
  state.currentMulti=1.00;
  state.cashedMulti=0;
  renderWin(0);
  renderMulti(1.00);
  renderStatus('飞行中');
  if(MODE==='demo'){state.balance-=bet();saveState();renderBalance(true);}
  safeAudio(A.bet,'bet');
  setTimeout(function(){safeAudio(A.startRise,'startRise');},100);
  setActionBtn('cashout');
  drawScene();
  state.rafId=requestAnimationFrame(tick);
}

function doCashout(x){
  if(state.roundState!=='flying')return;
  cancelAnimationFrame(state.rafId);
  state.roundState='cashed';
  state.cashedMulti=x;
  var win=bet()*x;
  renderMulti(x);
  renderStatus('已提现');
  safeAudio(A.stopRise,'stopRise');
  safeAudio(A.cashout,'cashout');
  renderWin(win,'提现 '+x.toFixed(2)+'×');
  finish(win);
}

function doBust(crash){
  cancelAnimationFrame(state.rafId);
  state.roundState='busted';
  state.lastBustedT=Date.now();
  renderMulti(crash);
  renderStatus('已爆炸');
  // 爆炸后继续绘制 1.2 秒冲击波
  var bustDraw=function(){
    drawScene();
    if(Date.now()-state.lastBustedT<1200){state.rafId=requestAnimationFrame(bustDraw);}
  };
  state.rafId=requestAnimationFrame(bustDraw);
  safeAudio(A.stopRise,'stopRise');
  safeAudio(A.bust,'bust');
  renderWin(0);
  state.history.unshift({mult: crash, win: 0, ts: Date.now()});
  saveHist();
  renderHistory();
  finish(0);
}

function finish(win){
  if(win>0){
    state.balance+=win;
    if(MODE==='demo'){saveState();renderBalance(true);}
    else{submitReal(bet(),win).then(function(){renderBalance(true);});}
    if(win>=bet()*10)safeAudio(A.highWin,'highWin');
  }
  state.history.unshift({mult: state.roundState==='cashed'?state.cashedMulti:state.crashAt, win: win, ts: Date.now()});
  if(state.history.length>30)state.history=state.history.slice(0,30);
  saveHist();
  renderHistory();
  setActionBtn('next');
  setTimeout(function(){
    if(state.roundState==='cashed'||state.roundState==='busted'){
      state.roundState='idle';
      renderStatus('准备中');
      renderMulti(1.00);
      renderWin(0);
      setActionBtn('bet');
      drawScene();
    }
  },1800);
}

function submitReal(b,win){
  return fetch('/api/slot/spin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},body:JSON.stringify({bet:b,totalWin:win})})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){if(d&&typeof d.balanceAfter==='number')state.balance=d.balanceAfter;return true;})
    .catch(function(){toast('网络错误');return false;});
}

function updateCashoutBtn(multi){
  var b=$('cr-action');
  if(!b)return;
  if(state.roundState!=='flying')return;
  var amt=bet()*multi;
  b.textContent='提现 '+fmt(amt);
}

function setActionBtn(mode){
  var b=$('cr-action');if(!b)return;
  b.classList.remove('cr-action-primary','cr-action-danger','cr-action-next');
  if(mode==='bet'){b.textContent='下注 '+fmt(bet());b.classList.add('cr-action-primary');}
  else if(mode==='cashout'){b.textContent='提现 '+fmt(bet()*state.currentMulti);b.classList.add('cr-action-danger');}
  else if(mode==='next'){b.textContent='下一局';b.classList.add('cr-action-next');}
}

function onAction(){
  if(state.roundState==='idle'){startRound();}
  else if(state.roundState==='flying'){doCashout(state.currentMulti);}
  else if(state.roundState==='busted'||state.roundState==='cashed'){/* 自动进入 idle，忽略 */}
}

function changeBet(d){
  if(state.roundState!=='idle')return;
  var idx=state.betIndex+d;
  if(idx<0)idx=0;if(idx>6)idx=6;
  if(idx===state.betIndex)return;
  state.betIndex=idx;saveState();renderBet();
  setActionBtn('bet');
  safeAudio(A.click,'click');
}

function openModal(title,html){var m=$('cr-modal');if(!m)return;var t=$('cr-modal-title');if(t)t.textContent=title;var b=$('cr-modal-body');if(b)b.innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');}
function closeModal(){var m=$('cr-modal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');}

function showHistory(){
  if(!state.history.length){openModal('游戏记录','<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>');return;}
  var tb=0,tw=0,w=0;
  state.history.forEach(function(h){tb+=bet();tw+=h.win||0;if(h.win>0)w++;});
  var head='<div class="hist-summary">'+
    '<div><span>总局数</span><b>'+state.history.length+'</b></div>'+
    '<div><span>提现次数</span><b>'+w+'</b></div>'+
    '<div><span>总下注</span><b>'+fmt(tb)+'</b></div>'+
    '<div><span>总收获</span><b>'+fmt(tw)+'</b></div>'+
    '</div><h4 style="margin-top:14px;font-weight:800;">最近记录</h4>';
  var rows='';
  state.history.forEach(function(h){
    var d=(h.win||0)-bet();
    var cls=d>0?'win':'lose';
    var txt=(d>0?'+':'')+'¥'+d.toFixed(2);
    var t=new Date(h.ts),hh=String(t.getHours()).padStart(2,'0'),mm=String(t.getMinutes()).padStart(2,'0');
    rows+='<div class="hist-row"><div><div style="font-weight:700;">下注 '+fmt(bet())+'</div>'+
      '<div style="font-size:12px;color:#999;">'+hh+':'+mm+' · '+h.mult.toFixed(2)+'× · 收获 '+fmt(h.win||0)+'</div></div>'+
      '<div class="hist-amt '+cls+'">'+txt+'</div></div>';
  });
  openModal('游戏记录',head+rows);
}

function autoXSetting(){
  var cur = state.autoX > 0 ? state.autoX.toFixed(2) : '';
  var html = '<div style="padding:4px 0 6px;">' +
    '<div class="cr-auto-title">倍率区间 1.01 ~ 100</div>' +
    '<input type="text" inputmode="decimal" class="cr-auto-ipt" id="cr-auto-ipt" placeholder="留空=关闭" value="' + cur + '" autocomplete="off">' +
    '<div class="cr-auto-title" style="margin-top:16px;">快捷选择</div>' +
    '<div class="cr-auto-grid">' +
      '<button class="cr-auto-opt" data-x="1.5">1.50×</button>' +
      '<button class="cr-auto-opt" data-x="2">2.00×</button>' +
      '<button class="cr-auto-opt" data-x="3">3.00×</button>' +
      '<button class="cr-auto-opt" data-x="5">5.00×</button>' +
    '</div>' +
    '<button class="cr-auto-submit" id="cr-auto-ok">确定</button>' +
    '<button class="cr-auto-cancel" id="cr-auto-cancel">关闭自动提现</button>' +
    '<div class="cr-auto-hint">达到设定倍率时，系统自动为你提现</div>' +
    '</div>';
  openModal('自动提现', html);
  setTimeout(function(){
    var inp = $('cr-auto-ipt');
    var ok = $('cr-auto-ok');
    var ca = $('cr-auto-cancel');
    var opts = document.querySelectorAll('.cr-auto-opt');
    if (inp) setTimeout(function(){ try { inp.focus(); } catch(e){} }, 100);
    opts.forEach(function(b){
      b.addEventListener('click', function(){
        var x = b.getAttribute('data-x');
        if (inp) inp.value = x;
      });
    });
    if (ok) ok.addEventListener('click', function(){
      var v = (inp ? inp.value : '').trim();
      if (v === '') { state.autoX = 0; }
      else {
        var n = parseFloat(v);
        if (isNaN(n) || n < 1.01 || n > 100) { toast('请输入 1.01 ~ 100'); return; }
        state.autoX = n;
      }
      saveState(); renderAutoX(); closeModal();
      toast(state.autoX > 0 ? ('自动提现 ' + state.autoX.toFixed(2) + '×') : '已关闭自动提现');
    });
    if (ca) ca.addEventListener('click', function(){
      state.autoX = 0; saveState(); renderAutoX(); closeModal();
      toast('已关闭自动提现');
    });
    if (inp) inp.addEventListener('keydown', function(ev){
      if (ev.key === 'Enter') { ev.preventDefault(); if (ok) ok.click(); }
    });
  }, 30);
}

function actionMenu(){
  var isDemo = MODE === 'demo';
  var html = '<div class="cr-mode-bal">' +
    '<div class="lbl">当前余额</div>' +
    '<div class="val">¥' + state.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div>' +
    '</div>' +
    '<div class="cr-mode-btn-row">' +
    '<button class="cr-mode-ok" id="cr-mode-ok">' + (isDemo ? '重置为 ¥1,000.00' : '充值余额') + '</button>' +
    '<button class="cr-mode-cancel" id="cr-mode-cancel">取消</button>' +
    '</div>';
  openModal(isDemo ? '重置余额' : '充值余额', html);
  setTimeout(function(){
    var ok = $('cr-mode-ok');
    var ca = $('cr-mode-cancel');
    if (ok) ok.addEventListener('click', function(){
      if (isDemo) {
        state.balance = 1000;
        state.betIndex = 3;
        state.history = [];
        saveState(); saveHist();
        renderBalance(); renderBet(); renderHistory();
        setActionBtn('bet');
        closeModal();
        toast('已重置为 ¥1,000.00');
      } else {
        closeModal();
        openModal('充值', '<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');
      }
    });
    if (ca) ca.addEventListener('click', closeModal);
  }, 30);
}

function showRules(){
  var html = '<div style="font-size:13.5px;line-height:1.9;color:#333;">' +
    '<p style="margin:0 0 12px;"><b>玩法</b></p>' +
    '<p style="margin:0 0 6px;">1. 点击 − / + 调整下注金额</p>' +
    '<p style="margin:0 0 6px;">2. 点击「下注」开始一局，倍率从 1.00× 开始实时上升</p>' +
    '<p style="margin:0 0 6px;">3. 任何时刻点「提现」锁定当前倍率，奖励 = 下注 × 倍率</p>' +
    '<p style="margin:0 0 6px;">4. 若倍率在你提现前到达崩点，本局输掉下注</p>' +
    '<p style="margin:0 0 6px;">5. 可设置自动提现倍率，达到后系统自动锁定</p>' +
    '<p style="margin:16px 0 12px;"><b>自动提现</b></p>' +
    '<p style="margin:0 0 6px;">点击「自动提现」格或设置 1.01 ~ 100 倍，留空则关闭</p>' +
    '<p style="margin:16px 0 12px;"><b>说明</b></p>' +
    '<p style="margin:0;color:#888;">本游戏为虚拟积分娱乐，不涉及真实货币</p>' +
    '</div>';
  openModal('游戏规则', html);
}

function setupMode(){
  var b=document.querySelector('.cr-brand');
  if(b&&MODE==='demo')b.textContent=b.textContent+' · 试玩';
  renderAutoX();
}

function bind(){
  var e;
  if((e=$('cr-bet-minus')))e.addEventListener('click',function(){changeBet(-1);});
  if((e=$('cr-bet-plus')))e.addEventListener('click',function(){changeBet(1);});
  if((e=$('cr-action')))e.addEventListener('click',onAction);
  if((e=$('cr-auto-stat')))e.addEventListener('click',autoXSetting);
  if((e=$('cr-history')))e.addEventListener('click',showHistory);
  if((e=$('cr-menu')))e.addEventListener('click',showRules);
  if((e=$('cr-mode-action')))e.addEventListener('click',actionMenu);
  var soundOn=true;
  if((e=$('cr-sound')))e.addEventListener('click',function(){soundOn=!soundOn;safeAudio(function(){A.enabled(soundOn);},'toggle');e.style.opacity=soundOn?'1':'0.35';toast(soundOn?'音效已开':'音效已关',900);});
  if((e=$('cr-modal-x')))e.addEventListener('click',closeModal);
  var mask=document.querySelector('.cr-modal-mask');if(mask)mask.addEventListener('click',closeModal);
  document.addEventListener('keydown',function(ev){
    if(ev.target&&ev.target.tagName==='INPUT')return;
    if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();onAction();}
    else if(ev.key==='ArrowUp'){ev.preventDefault();changeBet(1);}
    else if(ev.key==='ArrowDown'){ev.preventDefault();changeBet(-1);}
    else if(ev.key==='Escape'){closeModal();}
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden&&state.roundState==='flying'){doCashout(state.currentMulti);}});
  window.addEventListener('pagehide',function(){if(state.roundState==='flying'){doCashout(state.currentMulti);}});
}

function init(){
  C.setMode(MODE);
  safeAudio(A.init,'initAudio');
  initCanvas();
  bind();
  setupMode();
  renderBalance();renderBet();renderWin(0);renderMulti(1.00);renderStatus('准备中');setActionBtn('bet');
  if(MODE==='real'){
    fetch('/api/me',{credentials:'include',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d||!d.success||!d.user){toast('请先登录');setTimeout(function(){location.replace('/');},800);return;}
      state.balance=Number(d.user.walletBalance)||0;state.ready=true;renderBalance();
      loadHist();renderHistory();
    }).catch(function(){toast('网络错误');});
  }else{
    loadState();loadHist();state.ready=true;renderBalance();renderBet();renderHistory();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
