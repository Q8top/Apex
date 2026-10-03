/* 21点 · UI */
(function(){
'use strict';
var C=window.BlackjackConfig, E=window.BlackjackEngine, S=window.BlackjackSymbols, A=window.BlackjackAudio;

var MODE=(function(){
  var m=String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v=m?m[1].toLowerCase():'demo';
  return v==='real'?'real':'demo';
})();

var LS_STATE='apex_blackjack_v1_'+MODE+'_state';
var LS_HIST='apex_blackjack_v1_'+MODE+'_history';

var state={
  balance:1000, betIndex:2, history:[],
  phase:'idle',   // idle | dealing | player | dealer | done
  deck:[], playerCards:[], dealerCards:[], dealerHidden:true,
  doubled:false, currentBet:0,
  ready:false, history_autoStop:false
};

function $(id){return document.getElementById(id);}
function fmt(n,sign){var v=Math.round(n*100)/100;var s=v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');return (sign&&v>0?'+':'')+'¥'+s;}
function bet(){return C.CONFIG.betSteps[state.betIndex];}
function toast(m,ms){var t=$('bj-toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(function(){t.classList.remove('show');},ms||1500);}
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function safeAudio(fn,n){try{if(typeof fn==='function')fn();}catch(e){console.warn('[BJ] audio@'+n,e&&e.message);}}
function getCsrf(){var m=document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);return m?decodeURIComponent(m[1]):'';}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}

function loadState(){if(MODE==='real')return;try{var d=JSON.parse(localStorage.getItem(LS_STATE)||'{}');if(typeof d.balance==='number'&&d.balance>=0)state.balance=d.balance;if(typeof d.betIndex==='number')state.betIndex=d.betIndex;}catch(e){}}
function saveState(){if(MODE==='real')return;try{localStorage.setItem(LS_STATE,JSON.stringify({balance:state.balance,betIndex:state.betIndex}));}catch(e){}}
function loadHist(){try{var d=JSON.parse(localStorage.getItem(LS_HIST)||'[]');if(Array.isArray(d))state.history=d.slice(0,30);}catch(e){}}
function saveHist(){try{localStorage.setItem(LS_HIST,JSON.stringify(state.history.slice(0,30)));}catch(e){}}

function renderBalance(animate){var el=$('bj-balance');if(!el)return;el.textContent=fmt(state.balance);if(animate)bump(el);}
function renderBet(){var e1=$('bj-bet');if(e1)e1.textContent=fmt(bet());var e2=$('bj-bet-txt');if(e2)e2.textContent='下注 '+fmt(bet());}
function renderWin(amount,win){var el=$('bj-win-value');if(el){el.textContent=amount>0?fmt(amount,true):fmt(0);el.classList.toggle('winning',!!win);if(win){el.classList.remove('pulsing');void el.offsetWidth;el.classList.add('pulsing');}}}

function cardHTML(c,faceDown,extraCls){
  var svg=(faceDown||!c)?S.back():(S.card(c.suit,c.rank,false));
  return '<div class="bj-card '+(extraCls||'')+'">'+svg+'</div>';
}

function paintDealer(dealIn){
  var box=$('bj-dealer-cards');if(!box)return;
  box.innerHTML='';
  state.dealerCards.forEach(function(c,i){
    var hide=(state.dealerHidden&&i===1);
    var cls=dealIn&&dealIn[i]?'deal-in':'';
    box.insertAdjacentHTML('beforeend',cardHTML(c,hide,cls));
  });
  var lbl=$('bj-dealer-score');
  if(lbl){
    if(state.dealerHidden){lbl.textContent='?';lbl.classList.add('hidden');}
    else{
      lbl.classList.remove('hidden');
      var v=E.handValue(state.dealerCards);
      lbl.textContent=String(v);
      lbl.classList.toggle('soft',E.isSoft(state.dealerCards));
    }
  }
}

function paintPlayer(dealIn){
  var box=$('bj-player-cards');if(!box)return;
  box.innerHTML='';
  state.playerCards.forEach(function(c,i){
    var cls=dealIn&&dealIn[i]?'deal-in':'';
    box.insertAdjacentHTML('beforeend',cardHTML(c,false,cls));
  });
  var lbl=$('bj-player-score');
  if(lbl){
    var v=E.handValue(state.playerCards);
    lbl.textContent=String(v);
    lbl.classList.toggle('soft',E.isSoft(state.playerCards));
  }
}

function setActions(phase){
  var row=$('bj-actions');if(!row)return;
  if(phase==='idle'||phase==='done'){
    row.className='bj-action-row single';
    row.innerHTML='<button class="bj-btn bj-btn-deal" id="bj-deal">下注 ' + fmt(bet()) + '</button>';
  } else if(phase==='player'){
    row.className='bj-action-row three';
    row.innerHTML='<button class="bj-btn bj-btn-hit" id="bj-hit">要牌</button>' +
      '<button class="bj-btn bj-btn-stand" id="bj-stand">停牌</button>' +
      '<button class="bj-btn bj-btn-double" id="bj-double">加倍</button>';
  } else {
    row.className='bj-action-row single';
    row.innerHTML='<button class="bj-btn bj-btn-deal" disabled>发牌中…</button>';
  }
  bindActions();
}

function bindActions(){
  var e;
  if((e=$('bj-deal')))e.addEventListener('click',onDeal);
  if((e=$('bj-hit')))e.addEventListener('click',onHit);
  if((e=$('bj-stand')))e.addEventListener('click',onStand);
  if((e=$('bj-double')))e.addEventListener('click',onDouble);
}

function showResult(text,cls,sub){
  var el=$('bj-result');if(!el)return;
  el.innerHTML=text+(sub?'<span class="sub">'+sub+'</span>':'');
  el.className='bj-result '+(cls||'')+' show';
}
function hideResult(){
  var el=$('bj-result');if(el)el.classList.remove('show');
}

async function onDeal(){
  if(state.phase!=='idle'&&state.phase!=='done')return;
  if(state.balance<bet()){toast('余额不足'+(MODE==='demo'?'，请重置':'，请充值'));return;}
  hideResult();
  state.phase='dealing';
  state.currentBet=bet();
  state.doubled=false;
  state.dealerHidden=true;
  state.deck=E.shuffle(E.newDeck());
  state.playerCards=[];
  state.dealerCards=[];
  state.playerCards.push(state.deck.shift());
  state.dealerCards.push(state.deck.shift());
  state.playerCards.push(state.deck.shift());
  state.dealerCards.push(state.deck.shift());
  paintPlayer([1,1]);
  paintDealer([1,0]);
  safeAudio(A.deal,'deal');
  await sleep(C.CONFIG.dealDelayMs);
  safeAudio(A.deal,'deal2');
  await sleep(C.CONFIG.dealDelayMs);
  if(MODE==='demo'){state.balance-=state.currentBet;saveState();renderBalance(true);}

  // Blackjack 立刻结算
  if(E.isBlackjack(state.playerCards)){
    state.dealerHidden=false;
    paintDealer([0,1]);
    safeAudio(A.reveal,'reveal');
    await sleep(500);
    return await finishRound();
  }
  state.phase='player';
  setActions('player');
}

async function onHit(){
  if(state.phase!=='player')return;
  safeAudio(A.hit,'hit');
  state.playerCards.push(state.deck.shift());
  paintPlayer([1]);
  await sleep(300);
  var v=E.handValue(state.playerCards);
  if(v>21){
    safeAudio(A.bust,'bust');
    await sleep(300);
    return await finishRound();
  }
  if(v===21){
    return await onStand();
  }
}

async function onStand(){
  if(state.phase!=='player')return;
  state.phase='dealer';
  setActions('dealer');
  state.dealerHidden=false;
  paintDealer([0,1]);
  safeAudio(A.reveal,'reveal');
  await sleep(600);
  while(E.handValue(state.dealerCards)<C.CONFIG.dealerStandOn){
    state.dealerCards.push(state.deck.shift());
    paintDealer([0,0,1]);
    safeAudio(A.hit,'dealerHit');
    await sleep(500);
  }
  await finishRound();
}

async function onDouble(){
  if(state.phase!=='player')return;
  if(state.playerCards.length!==2)return;
  if(state.balance<bet()){toast('余额不足加倍');return;}
  state.doubled=true;
  if(MODE==='demo'){state.balance-=state.currentBet;saveState();renderBalance(true);}
  safeAudio(A.double,'double');
  state.playerCards.push(state.deck.shift());
  paintPlayer([0,0,1]);
  await sleep(400);
  if(E.handValue(state.playerCards)>21){
    safeAudio(A.bust,'bust');
    await sleep(300);
    return await finishRound();
  }
  return await onStand();
}

async function finishRound(){
  state.phase='done';
  var totalBet=state.doubled?state.currentBet*2:state.currentBet;
  var res=E.settle(state.playerCards, state.dealerCards, state.currentBet, state.doubled);
  var pv=E.handValue(state.playerCards), dv=E.handValue(state.dealerCards);

  var sub='玩家 '+pv+' · 庄家 '+dv;
  if(res.result==='bust'){safeAudio(A.lose,'lose');showResult('爆牌','lose',sub);}
  else if(res.result==='lose'){safeAudio(A.lose,'lose');showResult('庄家赢','lose',sub);}
  else if(res.result==='push'){safeAudio(A.push,'push');showResult('和局','push',sub);}
  else if(res.result==='blackjack'){safeAudio(A.blackjack,'blackjack');showResult('★ 21点！','win',sub);}
  else{safeAudio(A.win,'win');showResult('恭喜中奖','win',sub);}

  // 结算
  var netWin = res.winAmount - totalBet;   // 净变化（相对下注，含下注）
  if(res.winAmount>0){
    state.balance += res.winAmount;
    renderBalance(true);
    renderWin(res.winAmount-totalBet,true);
    if(MODE==='real'){
      try{
        await fetch('/api/slot/spin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrf()},body:JSON.stringify({bet:totalBet,totalWin:res.winAmount})});
      }catch(e){}
    }
  } else {
    renderWin(0,false);
  }
  if(MODE==='demo')saveState();

  state.history.unshift({bet:totalBet,win:res.winAmount||0,delta:netWin,ts:Date.now(),result:res.result});
  if(state.history.length>30)state.history=state.history.slice(0,30);
  saveHist();

  await sleep(1800);
  hideResult();
  state.phase='idle';
  setActions('idle');
}

function openModal(title,html){var m=$('bj-modal');if(!m)return;var t=$('bj-modal-title');if(t)t.textContent=title;var b=$('bj-modal-body');if(b)b.innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');}
function closeModal(){var m=$('bj-modal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');}

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
    var tag=({bust:'爆牌',lose:'庄赢',push:'和局',win:'赢',blackjack:'21点'})[h.result]||'';
    rows+='<div class="hist-row"><div><div style="font-weight:700;">下注 '+fmt(h.bet)+'</div>'+
      '<div style="font-size:12px;color:#999;">'+hh+':'+mm+' · '+tag+' · 收获 '+fmt(h.win)+'</div></div>'+
      '<div class="hist-amt '+cls+'">'+txt+'</div></div>';
  });
  openModal('游戏记录',head+rows);
}

function showRules(){
  var html='<div style="font-size:13.5px;line-height:1.9;color:#333;">'+
    '<p style="margin:0 0 10px;"><b>目标</b>：手牌点数尽量接近 21 点，但不能超过。</p>'+
    '<p style="margin:0 0 6px;"><b>点数</b>：2-10 按面值，J/Q/K 算 10，A 可算 1 或 11</p>'+
    '<p style="margin:0 0 6px;"><b>庄家</b>：< 17 要牌，≥ 17 停牌</p>'+
    '<p style="margin:16px 0 10px;"><b>操作</b></p>'+
    '<p style="margin:0 0 6px;">· <b>要牌</b>：再要一张</p>'+
    '<p style="margin:0 0 6px;">· <b>停牌</b>：停止要牌，与庄家比大小</p>'+
    '<p style="margin:0 0 6px;">· <b>加倍</b>：下注翻倍 + 只发一张牌（仅限初始两张时）</p>'+
    '<p style="margin:16px 0 10px;"><b>赔付</b></p>'+
    '<p style="margin:0 0 6px;">· 普通赢 ×0.92 · 21点 ×1.38 · 和局退回本金</p>'+
    '<p style="margin:0;color:#888;">本游戏为虚拟积分娱乐，不涉及真实货币</p>'+
    '</div>';
  openModal('游戏规则',html);
}

function actionMode(){
  var isDemo=MODE==='demo';
  var html='<div class="cr-mode-bal" style="text-align:center;padding:8px 0 16px;">'+
    '<div style="font-size:12px;color:#888;font-weight:700;letter-spacing:2px;margin-bottom:6px;">当前余额</div>'+
    '<div style="font-size:32px;font-weight:900;color:#0a0a0a;font-variant-numeric:tabular-nums;">'+fmt(state.balance)+'</div>'+
    '</div>'+
    '<div style="display:flex;gap:8px;">'+
    '<button id="bj-reset-ok" style="flex:1;height:46px;border:0;border-radius:12px;background:#0a0a0a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;">'+(isDemo?'重置为 ¥1,000.00':'充值余额')+'</button>'+
    '<button id="bj-reset-cancel" style="flex:1;height:46px;border:0;border-radius:12px;background:#f0f0f2;color:#555;font-weight:800;font-size:14px;cursor:pointer;">取消</button>'+
    '</div>';
  openModal(isDemo?'重置余额':'充值余额',html);
  setTimeout(function(){
    var ok=$('bj-reset-ok'),ca=$('bj-reset-cancel');
    if(ok)ok.addEventListener('click',function(){
      if(isDemo){state.balance=1000;state.betIndex=2;state.history=[];saveState();saveHist();renderBalance();renderBet();setActions('idle');closeModal();toast('已重置');}
      else{closeModal();openModal('充值','<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');}
    });
    if(ca)ca.addEventListener('click',closeModal);
  },50);
}

function changeBet(d){
  if(state.phase!=='idle'&&state.phase!=='done')return;
  var idx=state.betIndex+d;
  if(idx<0)idx=0;if(idx>=C.CONFIG.betSteps.length)idx=C.CONFIG.betSteps.length-1;
  if(idx===state.betIndex)return;
  state.betIndex=idx;saveState();renderBet();setActions('idle');
  safeAudio(A.click,'click');
}

function setupMode(){
  var b=document.querySelector('.bj-brand');
  if(b&&MODE==='demo')b.textContent='21点 · 试玩';
  var ma=$('bj-mode-action');
  if(ma){
    var isDemo=MODE==='demo';
    var ic=isDemo?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
    ma.innerHTML=ic+'<span>'+(isDemo?'重置余额':'充值余额')+'</span>';
  }
}

function bind(){
  var e;
  if((e=$('bj-bet-minus')))e.addEventListener('click',function(){changeBet(-1);});
  if((e=$('bj-bet-plus')))e.addEventListener('click',function(){changeBet(1);});
  if((e=$('bj-history')))e.addEventListener('click',showHistory);
  if((e=$('bj-menu')))e.addEventListener('click',showRules);
  if((e=$('bj-mode-action')))e.addEventListener('click',actionMode);
  var soundOn=true;
  if((e=$('bj-sound')))e.addEventListener('click',function(){soundOn=!soundOn;safeAudio(function(){A.enabled(soundOn);},'toggle');e.style.opacity=soundOn?'1':'0.35';toast(soundOn?'音效已开':'音效已关',900);});
  if((e=$('bj-modal-x')))e.addEventListener('click',closeModal);
  var mask=document.querySelector('.bj-modal-mask');if(mask)mask.addEventListener('click',closeModal);
  document.addEventListener('keydown',function(ev){
    if(ev.target&&ev.target.tagName==='INPUT')return;
    if(state.phase==='idle'||state.phase==='done'){
      if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();onDeal();}
      else if(ev.key==='ArrowUp'){ev.preventDefault();changeBet(1);}
      else if(ev.key==='ArrowDown'){ev.preventDefault();changeBet(-1);}
    } else if(state.phase==='player'){
      if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();onHit();}
      else if(ev.key==='s'||ev.key==='S'){ev.preventDefault();onStand();}
      else if(ev.key==='d'||ev.key==='D'){ev.preventDefault();onDouble();}
    }
    if(ev.key==='Escape'){closeModal();}
  });
}

function init(){
  safeAudio(A.init,'initAudio');
  bind();
  setupMode();
  renderBalance();renderBet();setActions('idle');
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
