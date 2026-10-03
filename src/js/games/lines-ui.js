/* 通用固定线 · UI（每款游戏通过 window.LinesEngine.init(cfg) 注入配置） */
(function(){
'use strict';
var A = window.LinesAudio;

/* 诊断：把错误直接显示到页面 */
(function(){
  function show(txt){
    var d = document.getElementById('__lines_err_box');
    if(!d){
      d = document.createElement('div');
      d.id = '__lines_err_box';
      d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:8px 10px;font:12px/1.4 monospace;z-index:999999;max-height:50vh;overflow:auto;white-space:pre-wrap;word-break:break-all;';
      document.body.appendChild(d);
    }
    d.textContent += txt + '\n';
  }
  window.addEventListener('error', function(e){
    show('✗ ' + (e.message||'') + '  @' + ((e.filename||'').split('/').pop()) + ':' + (e.lineno||''));
  });
  window.addEventListener('unhandledrejection', function(e){
    show('✗ Promise: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
  });
  // 5 秒后如果还没 ready，显示状态
  setTimeout(function(){
    var box = document.getElementById('lm-grid');
    var ready = document.querySelector('#__lines_err_box');
    if(!ready && box && box.children.length === 0){
      show('⚠ 网格空：lm-grid 有 ' + box.children.length + ' 个 cell');
    }
  }, 4000);
})();

var MODE = (function(){
  var m = String(location.search).match(/[?&]mode=([a-z]+)/i);
  return (m && m[1].toLowerCase()==='real') ? 'real' : 'demo';
})();

var GAME_ID = document.body.getAttribute('data-game') || 'unknown';
var CFG = null, E = null, S = null;
var LS_STATE='apex_lines_'+GAME_ID+'_'+MODE+'_state';
var LS_HIST ='apex_lines_'+GAME_ID+'_'+MODE+'_history';

var state = {balance:1000, betIndex:2, spinning:false, grid:null, history:[], autoOn:false, ready:false, safetyTimer:null};

function $(id){return document.getElementById(id);}
function fmt(n,s){var v=Math.round(n*100)/100;var t=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (s&&v>0?'+':'')+'¥'+t;}
function bet(){return CFG.betSteps[state.betIndex];}
function toast(m,ms){var e=$('lm-toast');if(!e)return;e.textContent=m;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[Lines]',n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}
function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;}catch(e){}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function buildGrid(){var box=$('lm-grid');if(!box)return;box.innerHTML='';for(var i=0;i<CFG.rows*CFG.cols;i++){var c=document.createElement('div');c.className='lm-cell';c.setAttribute('data-idx',String(i));box.appendChild(c);}}
function cellAt(c,r){return document.querySelectorAll('#lm-grid .lm-cell')[r*CFG.cols+c];}
function paintGrid(grid){for(var c=0;c<CFG.cols;c++)for(var r=0;r<CFG.rows;r++){var el=cellAt(c,r);if(!el)continue;var sym=grid&&grid[c]?grid[c][r]:null;var fn=S[sym];el.innerHTML=fn?fn():'';el.classList.remove('winning','popping');}}
function highlightCells(cells,on){cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.toggle('winning',!!on);});}

function renderBalance(animate){var el=$('lm-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('lm-bet');if(e1)e1.textContent=fmt(bet());var e2=$('lm-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderWin(amount,combo){var el=$('lm-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',amount>0);if(amount>0){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}var l=$('lm-win-label');if(l)l.textContent=amount>0?'恭喜中奖':'本局中奖';var cb=$('lm-combo');if(cb){if(combo){cb.textContent=combo;cb.classList.add('show');}else{cb.textContent='';cb.classList.remove('show');}}}
function showFsBanner(rem){var b=$('lm-fs-banner');if(!b)return;if(rem>0){b.hidden=false;var c=$('lm-fs-count');if(c)c.textContent=rem;}else{b.hidden=true;}}
function showFsSummary(amt){var el=$('lm-fs-summary');if(!el)return;var t=$('lm-fs-total');if(t)t.textContent=fmt(amt);el.classList.add('show');setTimeout(function(){el.classList.remove('show');},3000);}

function spinReel(c,dur,onDone){var cells=[];for(var r=0;r<CFG.rows;r++)cells.push(cellAt(c,r));var pool=Object.keys((MODE==='demo'?CFG.weightsDemo:CFG.weightsReal)||CFG.weightsReal||{});var start=performance.now(),last=0,every=55;function loop(now){var el=now-start;if(el-last>=every){last=el;for(var r2=0;r2<CFG.rows;r2++){var rnd=pool[Math.floor(E.randFloat()*pool.length)];cells[r2].innerHTML=S[rnd]?S[rnd]():'';}}if(el<dur)requestAnimationFrame(loop);else{safeAudio(function(){A.reelStop(c);},'reelStop');if(onDone)onDone();}}requestAnimationFrame(loop);}

function releaseSpin(){state.spinning=false;var sb=$('lm-spin');if(sb){sb.disabled=false;sb.classList.remove('spinning');}if(state.safetyTimer){clearTimeout(state.safetyTimer);state.safetyTimer=null;}}

function doSpin(){
  if(state.spinning||!state.ready)return;
  var b=bet();
  if(state.balance<b){toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值'));stopAuto();return;}
  document.querySelectorAll('#lm-grid .lm-cell').forEach(function(c){c.classList.remove('winning','popping');});
  renderWin(0);
  state.spinning=true;
  var sb=$('lm-spin');if(sb){sb.disabled=true;sb.classList.add('spinning');}
  safeAudio(A.init,'init');safeAudio(A.spinStart,'spinStart');
  if(state.safetyTimer)clearTimeout(state.safetyTimer);
  state.safetyTimer=setTimeout(function(){if(state.spinning){paintGrid(state.grid||E.spin());releaseSpin();stopAuto();}},8000);
  var result;
  try{result=(MODE==='demo')?E.spinDemo(b):E.playFullSpin(b);state.grid=result.grid;}catch(e){console.error('[Lines]',e);releaseSpin();return;}
  if(MODE==='demo'){state.balance-=b;saveState();renderBalance(true);}
  var firstGrid=result.grid;
  var baseDelay=500,stagger=110,done=0;
  for(var ci=0;ci<CFG.cols;ci++){
    (function(c){
      spinReel(c,baseDelay+c*stagger,function(){
        done++;
        if(done===CFG.cols){
          paintGrid(firstGrid);
          setTimeout(function(){
            if(result.scatterCount>=3){safeAudio(A.freeSpin,'freeSpin');toast('🎉 免费旋转触发！',2000);setTimeout(function(){runFs(b);},800);}
            else{finish(result.totalWin,b,result.wins);}
          },250);
        }
      });
    })(ci);
  }
}

function runFs(b){
  safeAudio(A.fsBgStart,'fsBgStart');
  // FS 舞台脉冲（对比 sweet）
  if (stage) { stage.classList.add('fs-stage-pulse'); }
  var stage=document.querySelector('.lm-stage');if(stage)stage.classList.add('fs-mode');
  var fsRes;
  try{fsRes=E.playFreeSpins(b);}catch(e){console.error(e);safeAudio(A.fsBgStop,'fsBgStop');if(stage)stage.classList.remove('fs-mode');if(stage)stage.classList.remove('fs-stage-pulse');releaseSpin();return;}
  var spins=fsRes.spins,idx=0,total=fsRes.totalWin;
  function next(){
    if(idx>=spins.length){
      safeAudio(A.fsBgStop,'fsBgStop');if(stage)stage.classList.remove('fs-mode');
      showFsBanner(0);
      if(total>0){safeAudio(A.fsSummary,'fsSummary');showFsSummary(total);}
      setTimeout(function(){finish(total,b,[]);},total>0?1800:200);
      return;
    }
    var s=spins[idx++];showFsBanner(s.remaining);paintGrid(s.result.grid);
    var shown=0;
    if(s.result.wins&&s.result.wins.length){
      var cells=[];s.result.wins.forEach(function(w){w.cells.forEach(function(p){cells.push(p);});});
      highlightCells(cells,true);shown=s.result.totalWin;renderWin(shown,'');
      setTimeout(function(){cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.add('popping');});},400);
    }
    setTimeout(next,900);
  }
  next();
}

function submitReal(b,w){return fetch('/api/slot/spin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},body:JSON.stringify({bet:b,totalWin:w})}).then(function(r){return r.ok?r.json():null;}).then(function(d){if(d&&typeof d.balanceAfter==='number')state.balance=d.balanceAfter;return true;}).catch(function(){toast('网络错误');return false;});}

function finish(amount,betAmt){
  // BigWin 分级横幅
  if (typeof ApexBigWin !== 'undefined' && amount > 0 && betAmt) {
    try { ApexBigWin.celebrate(amount, betAmt); } catch(e){}
  }
  releaseSpin();
  if(amount>0){state.balance+=amount;if(betAmt&&amount>=betAmt*30)safeAudio(A.winBig,'winBig');else if(betAmt&&amount>=betAmt*8)safeAudio(A.winMedium,'winMedium');else safeAudio(A.winSmall,'winSmall');}
  else safeAudio(A.lose,'lose');
  if(MODE==='demo'){saveState();renderBalance(true);}
  else submitReal(bet(),amount).then(function(){renderBalance(true);});
  renderWin(amount);
  state.history.unshift({bet:betAmt,win:amount,delta:amount-(betAmt||0),ts:Date.now()});
  if(state.history.length>30)state.history=state.history.slice(0,30);
  saveHist();
  if(state.autoOn)setTimeout(function(){if(state.autoOn)doSpin();},700);
}

function changeBet(d){if(state.spinning)return;var i=state.betIndex+d;if(i<0)i=0;if(i>=CFG.betSteps.length)i=CFG.betSteps.length-1;if(i===state.betIndex)return;state.betIndex=i;saveState();renderBet();safeAudio(A.click,'click');}
function startAuto(){if(state.autoOn)return;state.autoOn=true;var b=$('lm-auto');if(b)b.classList.add('active');toast('自动旋转已开',900);if(!state.spinning)doSpin();}
function stopAuto(){state.autoOn=false;var b=$('lm-auto');if(b)b.classList.remove('active');}

function openModal(t,h){var m=$('lm-modal');if(!m)return;var a=$('lm-modal-title');if(a)a.textContent=t;var b=$('lm-modal-body');if(b)b.innerHTML=h;m.classList.add('show');}
function closeModal(){var m=$('lm-modal');if(m)m.classList.remove('show');}
function showHistory(){
  if(!state.history.length){openModal('游戏记录','<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>');return;}
  var tb=0,tw=0,w=0;state.history.forEach(function(h){tb+=h.bet||0;tw+=h.win||0;if(h.win>h.bet)w++;});
  var head='<div class="hist-summary"><div><span>总局数</span><b>'+state.history.length+'</b></div><div><span>获胜次数</span><b>'+w+'</b></div><div><span>总下注</span><b>'+fmt(tb)+'</b></div><div><span>总收获</span><b>'+fmt(tw)+'</b></div></div><h4 style="margin-top:14px;font-weight:800;">最近记录</h4>';
  var rows='';state.history.forEach(function(h){var d=h.delta;var cls=d>0?'win':'lose';var t=new Date(h.ts);var hh=String(t.getHours()).padStart(2,'0'),mm=String(t.getMinutes()).padStart(2,'0');rows+='<div class="hist-row"><div><div style="font-weight:700;">下注 '+fmt(h.bet)+'</div><div style="font-size:12px;color:#999;">'+hh+':'+mm+' · 收获 '+fmt(h.win)+'</div></div><div class="hist-amt '+cls+'">'+((d>0?'+':'')+'¥'+d.toFixed(2))+'</div></div>';});
  openModal('游戏记录',head+rows);
}
function showPaytable(){
  var rows=[];
  for(var sym in CFG.payouts){if(!CFG.payouts.hasOwnProperty(sym))continue;var t=CFG.payouts[sym];var fn=S[sym];rows.push({sym:sym,icon:fn?fn():'',t:t});}
  var html='<div style="font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.7;">'+CFG.cols+'×'+CFG.rows+' · '+CFG.paylines.length+' 条固定线</div>';
  rows.forEach(function(r){html+='<div class="sym-row"><div class="sym-icon">'+r.icon+'</div><div><div class="sym-name">'+(CFG.names[r.sym]||r.sym)+'</div><div class="sym-pay">3×'+(r.t[3]||0)+' · 4×'+(r.t[4]||0)+' · 5×'+(r.t[5]||0)+'</div></div></div>';});
  openModal('赔付表',html);
}
function actionMode(){
  if(state.spinning){toast('请等待本局结束');return;}
  var isDemo=MODE==='demo';
  var html='<div style="text-align:center;padding:8px 0 16px;"><div style="font-size:12px;color:#888;font-weight:700;letter-spacing:2px;margin-bottom:6px;">当前余额</div><div style="font-size:32px;font-weight:900;color:#0a0a0a;">'+fmt(state.balance)+'</div></div><div style="display:flex;gap:8px;"><button id="lm-reset-ok" style="flex:1;height:46px;border:0;border-radius:12px;background:#0a0a0a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;">'+(isDemo?'重置为 ¥1,000':'充值余额')+'</button><button id="lm-reset-cancel" style="flex:1;height:46px;border:0;border-radius:12px;background:#f0f0f2;color:#555;font-weight:800;font-size:14px;cursor:pointer;">取消</button></div>';
  openModal(isDemo?'重置余额':'充值余额',html);
  setTimeout(function(){var ok=$('lm-reset-ok'),ca=$('lm-reset-cancel');if(ok)ok.onclick=function(){if(isDemo){state.balance=1000;state.betIndex=2;state.history=[];saveState();saveHist();renderBalance();renderBet();renderWin(0);closeModal();toast('已重置');}else{closeModal();openModal('充值','<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中</p>');}};if(ca)ca.onclick=closeModal;},50);
}

function setupMode(){
  var b=document.querySelector('.lm-brand');if(b&&MODE==='demo')b.textContent=b.textContent+' · 试玩';
  var ma=$('lm-mode-action');
  if(ma){var isDemo=MODE==='demo';ma.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg><span>'+(isDemo?'重置余额':'充值余额')+'</span>';}
}

function bind(){
  var e;
  if((e=$('lm-bet-minus')))e.onclick=function(){changeBet(-1);};
  if((e=$('lm-bet-plus')))e.onclick=function(){changeBet(1);};
  if((e=$('lm-spin')))e.onclick=doSpin;
  if((e=$('lm-auto')))e.onclick=function(){if(state.autoOn)stopAuto();else startAuto();};
  if((e=$('lm-history')))e.onclick=showHistory;
  if((e=$('lm-paytable')))e.onclick=showPaytable;
  if((e=$('lm-menu')))e.onclick=actionMode;
  if((e=$('lm-mode-action')))e.onclick=actionMode;
  var so=true;
  if((e=$('lm-sound')))e.onclick=function(){so=!so;safeAudio(function(){A.enabled(so);},'toggle');e.style.opacity=so?'1':'0.35';toast(so?'音效已开':'音效已关',900);};
  if((e=$('lm-modal-x')))e.onclick=closeModal;
  var mask=document.querySelector('.lm-modal-mask');if(mask)mask.onclick=closeModal;
  document.addEventListener('keydown',function(ev){if(ev.target&&ev.target.tagName==='BUTTON')return;if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();doSpin();}else if(ev.key==='ArrowUp'){ev.preventDefault();changeBet(1);}else if(ev.key==='ArrowDown'){ev.preventDefault();changeBet(-1);}else if(ev.key==='Escape'){closeModal();stopAuto();}});
  document.addEventListener('visibilitychange',function(){if(document.hidden&&state.autoOn)stopAuto();});
  window.addEventListener('pagehide',function(){if(state.autoOn)stopAuto();});
}

function init(){
  try{
    CFG = window.LinesGameConfig;
    E = window.LinesEngine;
    S = window.LinesGameSymbols;
    if(!CFG||!E||!S){
      var missing = [];
      if(!CFG) missing.push('LinesGameConfig');
      if(!E) missing.push('LinesEngine');
      if(!S) missing.push('LinesGameSymbols');
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:10px;font:14px monospace;z-index:999999;';
      d.textContent = '初始化失败：缺 ' + missing.join(', ');
      document.body.appendChild(d);
      return;
    }
    E.init(CFG);
    E.setMode(MODE);
    safeAudio(A.init,'initAudio');
    buildGrid();renderWin(0);bind();setupMode();
    if(MODE==='real'){
      fetch('/api/me',{credentials:'include',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
        if(!d||!d.success||!d.user){toast('请先登录');setTimeout(function(){location.replace('/');},800);return;}
        state.balance=Number(d.user.walletBalance)||0;state.ready=true;renderBalance();renderBet();paintGrid(E.spin());
        loadHist();
        if(typeof ApexLoader!=='undefined')ApexLoader.hide();
      }).catch(function(){toast('网络错误');if(typeof ApexLoader!=='undefined')ApexLoader.hide();});
    } else {
      loadState();loadHist();state.ready=true;renderBalance();renderBet();paintGrid(E.spin());
      if(typeof ApexLoader!=='undefined')ApexLoader.hide();
      if(typeof ApexLoader!=='undefined')ApexLoader.hide();
    }
  } catch(err){
    var d2 = document.createElement('div');
    d2.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:10px;font:12px monospace;z-index:999999;white-space:pre-wrap;max-height:50vh;overflow:auto;';
    d2.textContent = 'init 崩了：' + err.message + '\n' + (err.stack||'').split('\n').slice(0,5).join('\n');
    document.body.appendChild(d2);
    if(typeof ApexLoader!=='undefined')ApexLoader.hide();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
