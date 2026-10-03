/* 星光公主 · UI */
(function(){
'use strict';

var C=window.StarlightConfig, E=window.StarlightEngine, S=window.StarlightSymbols, A=window.StarlightAudio;

var MODE=(function(){
  var m=String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v=m?m[1].toLowerCase():'demo';
  return v==='real'?'real':'demo';
})();

var LS_STATE='apex_starlight_v1_'+MODE+'_state';
var LS_HIST='apex_starlight_v1_'+MODE+'_history';
var POOL=['gemBlue','gemGreen','gemYellow','gemPurple','gemRed','moon','crown','princess','heart'];

var state={balance:C.CONFIG.initialBalance,betIndex:C.CONFIG.defaultBetIndex,spinning:false,grid:null,history:[],autoOn:false,ready:false,safetyTimer:null,freeSpinMode:false};

function $(id){return document.getElementById(id);}
function fmt(n,sign){var v=Math.round(n*100)/100;var s=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (sign&&v>0?'+':'')+'¥'+s;}
function bet(){return C.CONFIG.betSteps[state.betIndex];}
function toast(m,ms){var t=$('sl-toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(function(){t.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[Starlight] audio@'+n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}

function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;else state.balance=C.CONFIG.initialBalance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;}catch(e){state.balance=C.CONFIG.initialBalance;}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function buildGrid(){var box=$('sl-grid');if(!box)return;box.innerHTML='';var total=C.CONFIG.rows*C.CONFIG.cols;for(var i=0;i<total;i++){var c=document.createElement('div');c.className='sl-cell';c.setAttribute('data-idx',String(i));box.appendChild(c);}}
function cellAt(r,c){return document.querySelectorAll('#sl-grid .sl-cell')[r*C.CONFIG.cols+c];}
function paintGrid(grid){for(var r=0;r<C.CONFIG.rows;r++){for(var c=0;c<C.CONFIG.cols;c++){var el=cellAt(r,c);if(!el)continue;var sym=grid&&grid[r]?grid[r][c]:null;var fn=S[sym];el.innerHTML=fn?fn():'';el.classList.remove('winning','popping');}}}
function highlightCells(cells,on){cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.toggle('winning',!!on);});}

function renderBalance(animate){var el=$('sl-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('sl-bet');if(e1)e1.textContent=fmt(bet());var e2=$('sl-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderWin(amount,combo){var el=$('sl-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',amount>0);if(amount>0){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}var lbl=$('sl-win-label');if(lbl)lbl.textContent=amount>0?'恭喜中奖':'本局中奖';var cb=$('sl-combo');if(cb){if(combo){cb.textContent=combo;cb.classList.add('show');}else{cb.textContent='';cb.classList.remove('show');}}}

function showFsBanner(remaining,mult){var b=$('sl-freespin-banner');if(!b)return;if(remaining>0){b.hidden=false;var cnt=$('sl-fs-count');if(cnt)cnt.textContent=remaining;var m=$('sl-fs-mult');if(m)m.textContent=mult?'×'+mult:'';}else{b.hidden=true;var m2=$('sl-fs-mult');if(m2)m2.textContent='';}}
function showFsSummary(amount){var el=$('sl-fs-summary');if(!el)return;var t=$('sl-fs-total');if(t)t.textContent=fmt(amount);el.classList.add('show');setTimeout(function(){el.classList.remove('show');},3000);}

function spinReel(c,dur,onDone){var cells=[];for(var r=0;r<C.CONFIG.rows;r++)cells.push(cellAt(r,c));var start=performance.now(),lastTick=0,every=55;function loop(now){var el=now-start;if(el-lastTick>=every){lastTick=el;for(var r2=0;r2<C.CONFIG.rows;r2++){var rnd=POOL[Math.floor(E.randFloat()*POOL.length)];cells[r2].innerHTML=S[rnd]?S[rnd]():'';}}if(el<dur)requestAnimationFrame(loop);else{safeAudio(function(){A.reelStop(c);},'reelStop');if(onDone)onDone();}}requestAnimationFrame(loop);}

function releaseSpin(){state.spinning=false;var sb=$('sl-spin');if(sb){sb.disabled=false;sb.classList.remove('spinning');}if(state.safetyTimer){clearTimeout(state.safetyTimer);state.safetyTimer=null;}}

function doSpin(){
  if(state.spinning||!state.ready)return;
  var b=bet();
  if(state.balance<b){toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值'));stopAuto();return;}
  document.querySelectorAll('#sl-grid .sl-cell').forEach(function(c){c.classList.remove('winning','popping');});
  renderWin(0);
  state.spinning=true;
  var sb=$('sl-spin');if(sb){sb.disabled=true;sb.classList.add('spinning');}
  safeAudio(A.init,'init');safeAudio(A.spinStart,'spinStart');
  if(state.safetyTimer)clearTimeout(state.safetyTimer);
  state.safetyTimer=setTimeout(function(){if(state.spinning){paintGrid(state.grid||E.spin());releaseSpin();stopAuto();}},9000);
  var result;
  try{result=(MODE==='demo')?E.spinDemo(b):E.playFullSpin(b);state.grid=result.finalGrid;}catch(e){console.error('[Starlight] engine error:',e);releaseSpin();return;}
  if(MODE==='demo'){state.balance-=b;saveState();renderBalance(true);}
  var firstGrid=result.rounds.length?result.rounds[0].grid:result.finalGrid;
  var baseDelay=500,stagger=100,done=0,cols=C.CONFIG.cols;
  for(var ci=0;ci<cols;ci++){
    (function(c){
      spinReel(c,baseDelay+c*stagger,function(){
        done++;
        if(done===cols){
          paintGrid(firstGrid);
          setTimeout(function(){
            if(result.scatterCount>=4){safeAudio(A.freeSpin,'freeSpin');toast('🎉 免费旋转触发！+15 次',2200);setTimeout(function(){runFreeSpins(b);},800);}
            else{playRounds(result,b);}
          },250);
        }
      });
    })(ci);
  }
}

function playRounds(result,betAmt){
  var rounds=result.rounds,totalShown=0,i=0;
  function playOne(){
    if(i>=rounds.length){finish(totalShown,betAmt);return;}
    var rd=rounds[i];
    if(!rd){i++;playOne();return;}
    if(rd.grid)paintGrid(rd.grid);
    if(!rd.wins||rd.wins.length===0){i++;setTimeout(playOne,250);return;}
    var cells=[];rd.wins.forEach(function(w){w.cells.forEach(function(p){cells.push(p);});});
    highlightCells(cells,true);
    totalShown+=rd.roundWin;
    renderWin(totalShown,rd.multiplier?'×'+rd.multiplier:'');
    safeAudio(A.tumble,'tumble');
    setTimeout(function(){
      cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.add('popping');});
      setTimeout(function(){
        highlightCells(cells,false);
        i++;
        if(i<rounds.length&&rounds[i]&&rounds[i].grid){paintGrid(rounds[i].grid);setTimeout(playOne,250);}
        else{finish(totalShown,betAmt);}
      },220);
    },500);
  }
  playOne();
}

function runFreeSpins(b){
  state.freeSpinMode=true;
  var stage=document.querySelector('.sl-stage');
  if(stage)stage.classList.add('fs-mode');
  safeAudio(A.fsBgStart,'fsBgStart');
  var fsResult;
  try{fsResult=E.playFreeSpins(b);}
  catch(e){console.error('[Starlight] freespin error:',e);state.freeSpinMode=false;if(stage)stage.classList.remove('fs-mode');safeAudio(A.fsBgStop,'fsBgStop');releaseSpin();return;}
  var totalWin=fsResult.totalWin,spins=fsResult.spins,idx=0;
  function nextFs(){
    if(idx>=spins.length){
      state.freeSpinMode=false;if(stage)stage.classList.remove('fs-mode');
      safeAudio(A.fsBgStop,'fsBgStop');
      showFsBanner(0);
      if(totalWin>0){safeAudio(A.fsSummary,'fsSummary');showFsSummary(totalWin);}
      setTimeout(function(){finish(totalWin,b);},totalWin>0?1800:200);
      return;
    }
    var s=spins[idx];idx++;
    var zMult=s.starMult||0;
    showFsBanner(s.remaining,zMult>0?zMult:null);
    var shown=0;
    s.rounds.forEach(function(rd,ri){
      setTimeout(function(){
        if(rd.grid)paintGrid(rd.grid);
        if(rd.wins&&rd.wins.length){
          var cells=[];rd.wins.forEach(function(w){w.cells.forEach(function(p){cells.push(p);});});
          highlightCells(cells,true);
          shown+=rd.roundWin;
          renderWin(shown,'');
          safeAudio(A.tumble,'tumble');
          setTimeout(function(){
            cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.add('popping');});
            setTimeout(function(){highlightCells(cells,false);},220);
          },500);
        }
      },ri*700);
    });
    setTimeout(nextFs,Math.max(1500,s.rounds.length*700+500));
  }
  nextFs();
}

function submitReal(b,win){
  return fetch('/api/slot/spin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},body:JSON.stringify({bet:b,totalWin:win})})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){if(d&&typeof d.balanceAfter==='number')state.balance=d.balanceAfter;return true;})
    .catch(function(){toast('网络错误');return false;});
}

function finish(amount,betAmt){
  releaseSpin();
  if(amount>0){state.balance+=amount;if(betAmt&&amount>=betAmt*30)safeAudio(A.winBig,'winBig');else if(betAmt&&amount>=betAmt*8)safeAudio(A.winMedium,'winMedium');else safeAudio(A.winSmall,'winSmall');}
  else{safeAudio(A.lose,'lose');}
  if(MODE==='demo'){saveState();renderBalance(true);}
  else{submitReal(bet(),amount).then(function(){renderBalance(true);});}
  renderWin(amount);
  state.history.unshift({bet: betAmt, win: amount, delta: amount - betAmt, ts: Date.now()});
  if(state.history.length>30)state.history=state.history.slice(0,30);
  saveHist();
  if(state.autoOn)setTimeout(function(){if(state.autoOn)doSpin();},700);
}

function changeBet(d){if(state.spinning)return;var idx=state.betIndex+d;if(idx<0)idx=0;if(idx>=C.CONFIG.betSteps.length)idx=C.CONFIG.betSteps.length-1;if(idx===state.betIndex)return;state.betIndex=idx;saveState();renderBet();safeAudio(A.click,'click');}
function startAuto(){if(state.autoOn)return;state.autoOn=true;var b=$('sl-auto');if(b)b.classList.add('active');toast('自动旋转已开',900);if(!state.spinning)doSpin();}
function stopAuto(){state.autoOn=false;var b=$('sl-auto');if(b)b.classList.remove('active');}

function openModal(title,html){var m=$('sl-modal');if(!m)return;var t=$('sl-modal-title');if(t)t.textContent=title;var b=$('sl-modal-body');if(b)b.innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');}
function closeModal(){var m=$('sl-modal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');}
function showPaytable(){
  var rows=[['gemBlue','蓝心','8-9个×0.25 · 10-11个×0.75 · 12+个×2'],['gemGreen','绿心','8-9个×0.4 · 10-11个×0.9 · 12+个×4'],['gemYellow','黄心','8-9个×0.5 · 10-11个×1 · 12+个×5'],['gemPurple','紫心','8-9个×0.8 · 10-11个×1.2 · 12+个×8'],['gemRed','红心','8-9个×1 · 10-11个×1.5 · 12+个×10'],['moon','月亮','8-9个×1.5 · 10-11个×2 · 12+个×12'],['crown','皇冠','8-9个×2 · 10-11个×5 · 12+个×15'],['princess','公主','8-9个×2.5 · 10-11个×10 · 12+个×25'],['heart','爱心','8-9个×10 · 10-11个×25 · 12+个×50'],['star','星星','4+ 个 → 免费旋转 15 次']];
  var html='<div style="font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.7;">6×5 Cluster Pays（8 个及以上相邻同类消除）· Tumble · 乘法器 · 免费旋转</div>';
  rows.forEach(function(r){var fn=S[r[0]];html+='<div class="sym-row"><div class="sym-icon">'+(fn?fn():'')+'</div><div><div class="sym-name">'+r[1]+'</div><div class="sym-pay">'+r[2]+'</div></div></div>';});
  openModal('赔付表',html);
}
function showHistory(){
  if (!state.history.length) { openModal('游戏记录', '<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>'); return; }
  var tb = 0, tw = 0, w = 0;
  state.history.forEach(function(h){ tb += h.bet || 0; tw += h.win || 0; if (h.win > 0) w++; });
  var head = '<div class="hist-summary">' +
    '<div><span>总局数</span><b>' + state.history.length + '</b></div>' +
    '<div><span>中奖次数</span><b>' + w + '</b></div>' +
    '<div><span>总下注</span><b>' + fmt(tb) + '</b></div>' +
    '<div><span>总中奖</span><b>' + fmt(tw) + '</b></div>' +
    '</div><h4 style="margin-top:14px;font-weight:800;">最近记录</h4>';
  var rows = '';
  state.history.forEach(function(h){
    var d = (h.delta != null) ? h.delta : ((h.win || 0) - (h.bet || 0));
    var cls = d > 0 ? 'win' : 'lose';
    var txt = (d > 0 ? '+' : '') + '¥' + d.toFixed(2);
    var ts = h.ts || h.t || Date.now();
    var t = new Date(ts), hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
    rows += '<div class="hist-row"><div><div style="font-weight:700;">下注 ' + fmt(h.bet || 0) + '</div>' +
      '<div style="font-size:12px;color:#999;">' + hh + ':' + mm + ' · 中奖 ' + fmt(h.win || 0) + '</div></div>' +
      '<div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openModal('游戏记录', head + rows);
}
function actionMode(){
  if(state.spinning){toast('请等待本局结束');return;}
  if(MODE==='demo'){
    if(!confirm('重置演示余额为 ¥'+C.CONFIG.initialBalance.toFixed(2)+'？'))return;
    state.balance=C.CONFIG.initialBalance;state.betIndex=C.CONFIG.defaultBetIndex;state.history=[];
    saveState();saveHist();renderBalance();renderBet();renderWin(0);toast('已重置');
  }else{openModal('充值','<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');}
}

function setupMode(){
  var ma=$('sl-mode-action');if(!ma)return;
  var isDemo=MODE==='demo';
  var ic=isDemo?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
  ma.innerHTML=ic+'<span>'+(isDemo?'重置余额':'充值余额')+'</span>';
  var b=document.querySelector('.sl-brand');if(b&&isDemo)b.textContent='星光公主 · 试玩';
}

function bind(){
  var e;
  if((e=$('sl-bet-minus')))e.addEventListener('click',function(){changeBet(-1);});
  if((e=$('sl-bet-plus')))e.addEventListener('click',function(){changeBet(1);});
  if((e=$('sl-spin')))e.addEventListener('click',doSpin);
  if((e=$('sl-auto')))e.addEventListener('click',function(){if(state.autoOn)stopAuto();else startAuto();});
  if((e=$('sl-history')))e.addEventListener('click',showHistory);
  if((e=$('sl-paytable')))e.addEventListener('click',showPaytable);
  if((e=$('sl-menu')))e.addEventListener('click',actionMode);
  if((e=$('sl-mode-action')))e.addEventListener('click',actionMode);
  var soundOn=true;
  if((e=$('sl-sound')))e.addEventListener('click',function(){soundOn=!soundOn;safeAudio(function(){A.enabled(soundOn);},'toggle');e.style.opacity=soundOn?'1':'0.35';toast(soundOn?'音效已开':'音效已关',900);});
  if((e=$('sl-modal-x')))e.addEventListener('click',closeModal);
  var mask=document.querySelector('.sl-modal-mask');if(mask)mask.addEventListener('click',closeModal);
  document.addEventListener('keydown',function(ev){
    if(ev.target&&ev.target.tagName==='BUTTON')return;
    if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();doSpin();}
    else if(ev.key==='ArrowUp'){ev.preventDefault();changeBet(1);}
    else if(ev.key==='ArrowDown'){ev.preventDefault();changeBet(-1);}
    else if(ev.key==='Escape'){closeModal();stopAuto();}
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden&&state.autoOn)stopAuto();});
  window.addEventListener('pagehide',function(){if(state.autoOn)stopAuto();});
}

function init(){
  E.setMode(MODE);
  safeAudio(A.init,'initAudio');
  buildGrid();renderWin(0);bind();setupMode();
  if(MODE==='real'){
    fetch('/api/me',{credentials:'include',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d||!d.success||!d.user){toast('请先登录');setTimeout(function(){location.replace('/');},800);return;}
      state.balance=Number(d.user.walletBalance)||0;state.ready=true;renderBalance();renderBet();paintGrid(E.spin());
    }).catch(function(){toast('网络错误');});
  }else{
    loadState();loadHist();state.ready=true;renderBalance();renderBet();paintGrid(E.spin());
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

})();
