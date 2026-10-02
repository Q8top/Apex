/* 大鱼大亨 · UI */
(function(){
'use strict';
var C=window.BigBassConfig,E=window.BigBassEngine,S=window.BigBassSymbols,A=window.BigBassAudio;

var MODE=(function(){
  var m=String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v=m?m[1].toLowerCase():'demo';
  return v==='real'?'real':'demo';
})();

var LS_STATE='apex_bigbass_v1_'+MODE+'_state';
var LS_HIST='apex_bigbass_v1_'+MODE+'_history';
var POOL=['ten','jack','queen','king','ace','fishingRod','tackleBox','dragonfly','bass','fisherman'];

var state={balance:C.CONFIG.initialBalance,betIndex:C.CONFIG.defaultBetIndex,spinning:false,grid:null,history:[],autoOn:false,ready:false,safetyTimer:null,freeSpinMode:false};

function $(id){return document.getElementById(id);}
function fmt(n,sign){var v=Math.round(n*100)/100;var s=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (sign&&v>0?'+':'')+'¥'+s;}
function bet(){return C.CONFIG.betSteps[state.betIndex];}
function toast(m,ms){var t=$('bb-toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(function(){t.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[BigBass] audio@'+n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}

function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;else state.balance=C.CONFIG.initialBalance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;}catch(e){state.balance=C.CONFIG.initialBalance;}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function buildGrid(){var box=$('bb-grid');if(!box)return;box.innerHTML='';var total=C.CONFIG.rows*C.CONFIG.cols;for(var i=0;i<total;i++){var c=document.createElement('div');c.className='bb-cell';c.setAttribute('data-idx',String(i));box.appendChild(c);}}
function cellAt(c,r){return document.querySelectorAll('#bb-grid .bb-cell')[r*C.CONFIG.cols+c];}
function paintGrid(grid,fishMap){for(var c=0;c<C.CONFIG.cols;c++){for(var r=0;r<C.CONFIG.rows;r++){var el=cellAt(c,r);if(!el)continue;var sym=grid&&grid[c]?grid[c][r]:null;var fn=S[sym];el.innerHTML=fn?fn():'';el.classList.remove('winning','popping','collecting');if(fishMap){var key=c+','+r;var val=fishMap[key];if(val!=null){var badge=document.createElement('div');badge.className='bb-fish-badge';badge.textContent='×'+val;el.appendChild(badge);}}}}}
function highlightCells(cells,on){cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.toggle('winning',!!on);});}
function collectCells(cells){cells.forEach(function(p){var el=cellAt(p[0],p[1]);if(el)el.classList.add('collecting');});}

function renderBalance(animate){var el=$('bb-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('bb-bet');if(e1)e1.textContent=fmt(bet());var e2=$('bb-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderWin(amount,combo){var el=$('bb-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',amount>0);if(amount>0){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}var lbl=$('bb-win-label');if(lbl)lbl.textContent=amount>0?'恭喜中奖':'本局中奖';var cb=$('bb-combo');if(cb){if(combo){cb.textContent=combo;cb.classList.add('show');}else{cb.textContent='';cb.classList.remove('show');}}}

function showFsBanner(remaining,level){var b=$('bb-freespin-banner');if(!b)return;if(remaining>0){b.hidden=false;var cnt=$('bb-fs-count');if(cnt)cnt.textContent=remaining;var lv=$('bb-fs-level');if(lv)lv.textContent=level?('×'+level):'';}else{b.hidden=true;}}
function showFsSummary(amount){var el=$('bb-fs-summary');if(!el)return;var t=$('bb-fs-total');if(t)t.textContent=fmt(amount);el.classList.add('show');setTimeout(function(){el.classList.remove('show');},3000);}

function spinReel(c,dur,onDone){var cells=[];for(var r=0;r<C.CONFIG.rows;r++)cells.push(cellAt(c,r));var start=performance.now(),lastTick=0,every=55;function loop(now){var el=now-start;if(el-lastTick>=every){lastTick=el;for(var r2=0;r2<C.CONFIG.rows;r2++){var rnd=POOL[Math.floor(E.randFloat()*POOL.length)];cells[r2].innerHTML=S[rnd]?S[rnd]():'';}}if(el<dur)requestAnimationFrame(loop);else{safeAudio(function(){A.reelStop(c);},'reelStop');if(onDone)onDone();}}requestAnimationFrame(loop);}

function releaseSpin(){state.spinning=false;var sb=$('bb-spin');if(sb){sb.disabled=false;sb.classList.remove('spinning');}if(state.safetyTimer){clearTimeout(state.safetyTimer);state.safetyTimer=null;}}

function doSpin(){
  if(state.spinning||!state.ready)return;
  var b=bet();
  if(state.balance<b){toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值'));stopAuto();return;}
  document.querySelectorAll('#bb-grid .bb-cell').forEach(function(c){c.classList.remove('winning','popping','collecting');});
  renderWin(0);
  state.spinning=true;
  var sb=$('bb-spin');if(sb){sb.disabled=true;sb.classList.add('spinning');}
  safeAudio(A.init,'init');safeAudio(A.spinStart,'spinStart');
  if(state.safetyTimer)clearTimeout(state.safetyTimer);
  state.safetyTimer=setTimeout(function(){if(state.spinning){paintGrid(state.grid||E.spin());releaseSpin();stopAuto();}},9000);
  var result;
  try{result=(MODE==='demo')?E.spinDemo(b):E.playFullSpin(b);state.grid=result.grid;}catch(e){console.error('[BigBass] engine error:',e);releaseSpin();return;}
  if(MODE==='demo'){state.balance-=b;saveState();renderBalance(true);}
  var baseDelay=500,stagger=110,done=0,cols=C.CONFIG.cols;
  for(var ci=0;ci<cols;ci++){
    (function(c){
      spinReel(c,baseDelay+c*stagger,function(){
        done++;
        if(done===cols){
          paintGrid(result.grid);
          setTimeout(function(){
            if(result.scatterCount>=3){safeAudio(A.freeSpin,'freeSpin');var trig=C.SCATTER_TRIGGER[Math.min(result.scatterCount,5)]||10;toast('🎉 免费旋转触发！+'+trig+' 次',2200);setTimeout(function(){runFreeSpins(b);},800);}
            else{finish(result.totalWin,b,result.wins);}
          },250);
        }
      });
    })(ci);
  }
}

function highlightLineCells(wins,on){var cells=[];wins.forEach(function(w){w.cells.forEach(function(p){cells.push(p);});});highlightCells(cells,on);return cells;}

function runFreeSpins(b){
  state.freeSpinMode=true;
  var stage=document.querySelector('.bb-stage');
  if(stage)stage.classList.add('fs-mode');
  safeAudio(A.fsBgStart,'fsBgStart');
  var fsResult;
  try{fsResult=E.playFreeSpins(b);}
  catch(e){console.error('[BigBass] freespin error:',e);state.freeSpinMode=false;if(stage)stage.classList.remove('fs-mode');safeAudio(A.fsBgStop,'fsBgStop');releaseSpin();return;}
  var totalWin=fsResult.totalWin,spins=fsResult.spins,idx=0;
  function nextFs(){
    if(idx>=spins.length){
      state.freeSpinMode=false;if(stage)stage.classList.remove('fs-mode');
      safeAudio(A.fsBgStop,'fsBgStop');
      showFsBanner(0);
      if(totalWin>0){safeAudio(A.fsSummary,'fsSummary');showFsSummary(totalWin);}
      setTimeout(function(){finish(totalWin,b,[]);},totalWin>0?1800:200);
      return;
    }
    var s=spins[idx];idx++;
    showFsBanner(s.remaining,s.level);
    var fishMap={};s.moneyFishes.forEach(function(f){fishMap[f.c+','+f.r]='×'+f.value;});
    paintGrid(s.grid,fishMap);
    var shown=0;
    var lineCells=[];
    if(s.wins&&s.wins.length){s.wins.forEach(function(w){w.cells.forEach(function(p){lineCells.push(p);});});highlightCells(lineCells,true);shown+=s.baseWin;renderWin(shown,'');safeAudio(A.lineWin,'lineWin');}
    if(s.moneyFishes.length)setTimeout(function(){safeAudio(A.fishDrop,'fishDrop');},400);
    var nextDelay=900;
    if(s.fishermen.length&&s.moneyFishes.length){
      nextDelay=1700;
      setTimeout(function(){
        safeAudio(A.fishCollect,'fishCollect');
        var fcells=s.moneyFishes.map(function(f){return [f.c,f.r];});
        collectCells(fcells);
        shown+=s.collectWin;renderWin(shown,'收集 ×'+(C.FS_LEVELS[s.level-1].mult));
      },900);
    }
    if(s.levelUp)setTimeout(function(){safeAudio(A.levelUp,'levelUp');toast('★ 升级档位！+10 次',1600);},nextDelay);
    setTimeout(function(){highlightCells(lineCells,false);nextFs();},nextDelay+700);
  }
  nextFs();
}

function submitReal(b,win){
  return fetch('/api/slot/spin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},body:JSON.stringify({bet:b,totalWin:win})})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){if(d&&typeof d.balanceAfter==='number')state.balance=d.balanceAfter;return true;})
    .catch(function(){toast('网络错误');return false;});
}

function finish(amount,betAmt,wins){
  releaseSpin();
  if(amount>0){state.balance+=amount;if(betAmt&&amount>=betAmt*30)safeAudio(A.winBig,'winBig');else if(betAmt&&amount>=betAmt*8)safeAudio(A.winMedium,'winMedium');else safeAudio(A.winSmall,'winSmall');}
  else{safeAudio(A.lose,'lose');}
  if(MODE==='demo'){saveState();renderBalance(true);}
  else{submitReal(bet(),amount).then(function(){renderBalance(true);});}
  renderWin(amount);
  state.history.unshift({t:Date.now(),bet:betAmt,win:amount});
  if(state.history.length>30)state.history=state.history.slice(0,30);
  saveHist();
  if(state.autoOn)setTimeout(function(){if(state.autoOn)doSpin();},700);
}

function changeBet(d){if(state.spinning)return;var idx=state.betIndex+d;if(idx<0)idx=0;if(idx>=C.CONFIG.betSteps.length)idx=C.CONFIG.betSteps.length-1;if(idx===state.betIndex)return;state.betIndex=idx;saveState();renderBet();safeAudio(A.click,'click');}
function startAuto(){if(state.autoOn)return;state.autoOn=true;var b=$('bb-auto');if(b)b.classList.add('active');toast('自动旋转已开',900);if(!state.spinning)doSpin();}
function stopAuto(){state.autoOn=false;var b=$('bb-auto');if(b)b.classList.remove('active');}

function openModal(title,html){var m=$('bb-modal');if(!m)return;var t=$('bb-modal-title');if(t)t.textContent=title;var b=$('bb-modal-body');if(b)b.innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');}
function closeModal(){var m=$('bb-modal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');}

function showPaytable(){
  var rows=[
    ['ten','10','3个×0.2 · 4个×0.5 · 5个×2'],
    ['jack','J','3个×0.2 · 4个×0.5 · 5个×2'],
    ['queen','Q','3个×0.5 · 4个×1 · 5个×5'],
    ['king','K','3个×0.5 · 4个×1 · 5个×5'],
    ['ace','A','3个×1 · 4个×2 · 5个×10'],
    ['fishingRod','鱼竿','3个×1 · 4个×2.5 · 5个×15'],
    ['tackleBox','渔具盒','3个×2 · 4个×10 · 5个×40'],
    ['dragonfly','蜻蜓','3个×5 · 4个×15 · 5个×75'],
    ['bass','大鱼','3个×10 · 4个×50 · 5个×200'],
    ['fisherman','渔民 Wild/Scatter','替代任意符号（不含金钱鱼）· 3/4/5 个 → 10/15/20 免费旋转'],
    ['moneyFish','金钱鱼','免费旋转中掉落 · ×0.2 ~ ×2000 · 渔民收集']
  ];
  var html='<div style="font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.7;">5×3 固定 10 线 · 左起连续 3/4/5 个相同即中奖 · 渔民收集金钱鱼</div>';
  rows.forEach(function(r){var fn=S[r[0]];html+='<div class="sym-row"><div class="sym-icon">'+(fn?fn():'')+'</div><div><div class="sym-name">'+r[1]+'</div><div class="sym-pay">'+r[2]+'</div></div></div>';});
  openModal('赔付表',html);
}
function showHistory(){
  if(!state.history.length){openModal('记录','<p style="text-align:center;color:#999;padding:20px 0;">暂无记录</p>');return;}
  var html='',totalBet=0,totalWin=0;
  state.history.slice(0,20).forEach(function(h){totalBet+=h.bet||0;totalWin+=h.win||0;var cls=h.win>0?'win':'lose';var sign=h.win>0?'+':'';html+='<div class="hist-row"><span>下注 '+fmt(h.bet||0)+'</span><span class="hist-amt '+cls+'">'+sign+fmt(h.win||0)+'</span></div>';});
  html+='<div class="hist-summary"><div>总局数 <b>'+state.history.length+'</b></div><div>净赢 <b>'+fmt(totalWin-totalBet)+'</b></div></div>';
  openModal('记录',html);
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
  var ma=$('bb-mode-action');if(!ma)return;
  var isDemo=MODE==='demo';
  var ic=isDemo?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
  ma.innerHTML=ic+'<span>'+(isDemo?'重置余额':'充值余额')+'</span>';
  var b=document.querySelector('.bb-brand');if(b&&isDemo)b.textContent='大鱼大亨 · 试玩';
}

function bind(){
  var e;
  if((e=$('bb-bet-minus')))e.addEventListener('click',function(){changeBet(-1);});
  if((e=$('bb-bet-plus')))e.addEventListener('click',function(){changeBet(1);});
  if((e=$('bb-spin')))e.addEventListener('click',doSpin);
  if((e=$('bb-auto')))e.addEventListener('click',function(){if(state.autoOn)stopAuto();else startAuto();});
  if((e=$('bb-history')))e.addEventListener('click',showHistory);
  if((e=$('bb-paytable')))e.addEventListener('click',showPaytable);
  if((e=$('bb-menu')))e.addEventListener('click',actionMode);
  if((e=$('bb-mode-action')))e.addEventListener('click',actionMode);
  var soundOn=true;
  if((e=$('bb-sound')))e.addEventListener('click',function(){soundOn=!soundOn;safeAudio(function(){A.enabled(soundOn);},'toggle');e.style.opacity=soundOn?'1':'0.35';toast(soundOn?'音效已开':'音效已关',900);});
  if((e=$('bb-modal-x')))e.addEventListener('click',closeModal);
  var mask=document.querySelector('.bb-modal-mask');if(mask)mask.addEventListener('click',closeModal);
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
