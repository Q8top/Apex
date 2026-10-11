(function(){
'use strict';
var BETS=[20,50,100,200,500,1000,2000,5000,10000];
var BOARD_N=49;
var state={mode:'demo',balance:1000000,betIndex:2,spinning:false,auto:false,fast:false,fs:null,last:null};
var refs={};
var cells=[];
var bootQueue=[];
function $(id){return document.getElementById(id);}
function fmtMinor(m){return '\u00a5'+(m/100).toFixed(2);}
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
function onBoot(fn){
  if(document.readyState!=='loading'){try{fn();}catch(e){console.error('[SR boot]',e);}}
  else bootQueue.push(fn);
}
function cacheRefs(){
  refs.board=$('sr-board');refs.bal=$('sr-balance');refs.bet=$('sr-bet');
  refs.betDisplay=$('sr-bet-display');refs.win=$('sr-win');
  refs.tumble=$('sr-tumble-counter');refs.winArea=$('sr-win-area');
  refs.spin=$('sr-spin-btn');refs.auto=$('sr-auto-btn');refs.fast=$('sr-fast-btn');
  refs.minus=$('sr-bet-minus');refs.plus=$('sr-bet-plus');
  refs.menu=$('sr-menu-btn');refs.back=$('sr-back-btn');
}
function buildBoard(){
  if(!refs.board)return;
  refs.board.innerHTML='';cells=[];
  for(var i=0;i<BOARD_N;i++){
    var c=document.createElement('div');
    c.className='sr-cell';c.setAttribute('data-idx',String(i));
    refs.board.appendChild(c);cells.push(c);
  }
}
function paintStats(){
  if(refs.bal)refs.bal.textContent=fmtMinor(state.balance);
  var b=BETS[state.betIndex];
  if(refs.bet)refs.bet.textContent=fmtMinor(b);
  if(refs.betDisplay)refs.betDisplay.textContent=fmtMinor(b);
}
function init(){
  cacheRefs();buildBoard();paintStats();
  for(var i=0;i<bootQueue.length;i++){try{bootQueue[i]();}catch(e){console.error(e);}}
  bootQueue=[];
}
ready(init);
window.ApexSRMain=Object.freeze({
  state:state,BETS:BETS,cells:cells,refs:refs,
  fmtMinor:fmtMinor,paintStats:paintStats,buildBoard:buildBoard,onBoot:onBoot
});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function renderGrid(grid){
  var cs=M.cells;
  for(var i=0;i<cs.length;i++){
    var c=cs[i];c.innerHTML='';
    var sym=grid[i];
    if(sym&&window.ApexSRSymbolsV3){
      var svg=window.ApexSRSymbolsV3.get(sym);
      if(svg)c.innerHTML=svg;
    }
  }
}
function runDemoSpin(){
  var E=window.ApexSugarRushGameEngine;
  if(!E||typeof E.spin!=='function')return null;
  try{return E.spin('demo',M.BETS[M.state.betIndex]);}
  catch(e){console.error('[SR spin]',e);return null;}
}
function doSpin(){
  if(M.state.spinning)return;
  M.state.spinning=true;
  var bet=M.BETS[M.state.betIndex];
  var res=runDemoSpin();
  if(!res){M.state.spinning=false;return;}
  M.state.last=res;
  renderGrid(res.finalGrid||[]);
  M.state.balance+=(res.winMinor||0)-bet;
  M.paintStats();
  var w=document.getElementById('sr-win');
  if(w)w.textContent=M.fmtMinor(res.winMinor||0);
  if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:res.winMinor||0,fs:!!res.fsTriggered});
  M.state.spinning=false;
}
M.onBoot(function(){
  var res=runDemoSpin();
  if(res&&res.finalGrid)renderGrid(res.finalGrid);
  else{
    var S=window.ApexSRSymbolsV3,ids=S?S.list():[],g=[];
    for(var i=0;i<49;i++)g.push(ids[i%ids.length]||null);
    renderGrid(g);
  }
  var sp=document.getElementById('sr-spin-btn');
  if(sp)sp.addEventListener('click',doSpin);
});
window.ApexSRRender=Object.freeze({renderGrid:renderGrid,doSpin:doSpin});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function onMinus(){if(M.state.spinning)return;if(M.state.betIndex>0)M.state.betIndex--;M.paintStats();}
function onPlus(){if(M.state.spinning)return;if(M.state.betIndex<M.BETS.length-1)M.state.betIndex++;M.paintStats();}
var autoTimer=null;
function autoTick(){
  if(!M.state.auto)return;
  if(!M.state.spinning&&window.ApexSRRender)window.ApexSRRender.doSpin();
  autoTimer=setTimeout(autoTick,M.state.fast?450:1100);
}
function onAuto(){
  M.state.auto=!M.state.auto;
  var b=document.getElementById('sr-auto-btn');
  if(b)b.classList.toggle('is-active',M.state.auto);
  if(M.state.auto)autoTick();
  else if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
}
function onFast(){
  M.state.fast=!M.state.fast;
  var b=document.getElementById('sr-fast-btn');
  if(b)b.classList.toggle('is-active',M.state.fast);
}
M.onBoot(function(){
  var m=document.getElementById('sr-bet-minus');if(m)m.addEventListener('click',onMinus);
  var p=document.getElementById('sr-bet-plus');if(p)p.addEventListener('click',onPlus);
  var a=document.getElementById('sr-auto-btn');if(a)a.addEventListener('click',onAuto);
  var f=document.getElementById('sr-fast-btn');if(f)f.addEventListener('click',onFast);
});
window.ApexSRControls=Object.freeze({onMinus:onMinus,onPlus:onPlus,onAuto:onAuto,onFast:onFast});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function openSheet(){
  var S=window.ApexSRSheet;if(!S)return;
  S.setTitle('\u6e38\u620f\u83dc\u5355');S.open();
}
function registerItems(){
  var S=window.ApexSRSheet;if(!S)return;
  S.register('rules',{icon:'#ic-book',label:'\u6e38\u620f\u89c4\u5219',onClick:function(){
    S.close();setTimeout(function(){if(window.ApexSRRules)window.ApexSRRules.open();},220);
  }});
  S.register('history',{icon:'#ic-history',label:'\u6e38\u620f\u8bb0\u5f55',onClick:function(){
    S.close();setTimeout(function(){if(window.ApexSRHistory)window.ApexSRHistory.open();},220);
  }});
  S.register('settings',{icon:'#ic-settings',label:'\u6e38\u620f\u8bbe\u7f6e',onClick:function(){
    S.close();setTimeout(function(){if(window.ApexSRSettings)window.ApexSRSettings.open();},220);
  }});
  S.register('home',{icon:'#ic-home',label:'\u8fd4\u56de\u5927\u5385',className:'sr-sheet-item--home',onClick:function(){
    S.close();setTimeout(function(){window.location.href='/';},220);
  }});
}
function onBack(){window.location.href='/';}
M.onBoot(function(){
  var m=document.getElementById('sr-menu-btn');if(m)m.addEventListener('click',openSheet);
  var b=document.getElementById('sr-back-btn');if(b)b.addEventListener('click',onBack);
  registerItems();
});
window.ApexSRMenu=Object.freeze({openSheet:openSheet,registerItems:registerItems});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
var TIERS=[
  {min:0,   cls:'',       label:'WIN'},
  {min:5,   cls:'',       label:'NICE'},
  {min:20,  cls:'is-big', label:'BIG WIN'},
  {min:100, cls:'is-huge',label:'MEGA WIN'},
  {min:500, cls:'is-huge',label:'EPIC WIN'}
];
function tierOf(x){var r=TIERS[0];for(var i=0;i<TIERS.length;i++)if(x>=TIERS[i].min)r=TIERS[i];return r;}
function rollNumber(el,from,to,dur){
  if(!el)return;
  var t0=performance.now();
  function frame(now){
    var p=Math.min(1,(now-t0)/dur);
    var e=1-Math.pow(1-p,3);
    var v=Math.round(from+(to-from)*e);
    el.textContent=M.fmtMinor(v);
    if(p<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function ensureBurst(){
  var b=document.getElementById('sr-win-burst');
  if(b)return b;
  var stage=document.getElementById('sr-stage')||document.getElementById('sr-main');
  if(!stage)return null;
  b=document.createElement('div');b.className='sr-win-burst';b.id='sr-win-burst';b.hidden=true;
  var inner=document.createElement('div');inner.className='sr-win-burst-inner';
  var lb=document.createElement('div');lb.className='sr-win-burst-label';
  var vl=document.createElement('div');vl.className='sr-win-burst-value';
  inner.appendChild(lb);inner.appendChild(vl);
  b.appendChild(inner);
  stage.appendChild(b);
  return b;
}
function showWin(amountMinor){
  var b=ensureBurst();if(!b)return;
  var inner=b.querySelector('.sr-win-burst-inner');
  var lb=b.querySelector('.sr-win-burst-label');
  var vl=b.querySelector('.sr-win-burst-value');
  var mult=amountMinor/(M.BETS[M.state.betIndex]||100);
  var t=tierOf(mult);
  inner.className='sr-win-burst-inner'+(t.cls?' '+t.cls:'');
  lb.textContent=t.label;
  vl.textContent=M.fmtMinor(0);
  b.hidden=false;
  rollNumber(vl,0,amountMinor,620);
  var dur=t.cls==='is-huge'?1800:1200;
  setTimeout(function(){b.hidden=true;},dur);
}
M.onBoot(function(){});
window.ApexSRFx=Object.freeze({showWin:showWin,rollNumber:rollNumber,tierOf:tierOf});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function clearCells(){
  var cs=M.cells;for(var i=0;i<cs.length;i++){
    cs[i].classList.remove('is-winning','is-anticipating','is-dropping','is-popping');
  }
}
function markWinning(res){
  var pos=res&&(res.winPositions||res.winningPositions||res.lastWinPositions);
  if(!pos||!pos.length)return;
  var cs=M.cells;
  for(var i=0;i<pos.length;i++){
    var p=pos[i];var idx=(typeof p==='number')?p:(p&&(p.index!==undefined?p.index:p.idx));
    if(typeof idx==='number'&&cs[idx])cs[idx].classList.add('is-winning');
  }
}
function doSpinV2(){
  if(M.state.spinning)return;
  M.state.spinning=true;clearCells();
  var bet=M.BETS[M.state.betIndex];
  var res=null;
  try{res=window.ApexSugarRushGameEngine.spin('demo',bet);}catch(e){console.error('[spinV2]',e);M.state.spinning=false;return;}
  if(!res){M.state.spinning=false;return;}
  M.state.last=res;
  window.ApexSRRender.renderGrid(res.finalGrid||[]);
  M.state.balance+=(res.winMinor||0)-bet;
  M.paintStats();
  var win=res.winMinor||0;
  var w=document.getElementById('sr-win');
  if(w&&window.ApexSRFx)window.ApexSRFx.rollNumber(w,0,win,560);
  else if(w)w.textContent=M.fmtMinor(win);
  markWinning(res);
  if(win>0&&window.ApexSRFx)window.ApexSRFx.showWin(win);
  if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:win,fs:!!res.fsTriggered});
  var hold=win>0?620:0;
  setTimeout(function(){clearCells();M.state.spinning=false;},hold);
}
M.onBoot(function(){
  var old=document.getElementById('sr-spin-btn');
  if(!old)return;
  var nb=old.cloneNode(true);
  old.parentNode.replaceChild(nb,old);
  nb.addEventListener('click',doSpinV2);
});
window.ApexSRSpinV2=Object.freeze({doSpinV2:doSpinV2,markWinning:markWinning,clearCells:clearCells});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function haptic(ms){
  if(!navigator.vibrate)return;
  if(window.ApexSRSettings&&!window.ApexSRSettings.get('haptic'))return;
  try{navigator.vibrate(ms);}catch(e){}
}
function countInGrid(grid,id){var n=0;for(var i=0;i<grid.length;i++)if(grid[i]===id)n++;return n;}
function anticipateScatter(grid,cb){
  var n=countInGrid(grid,'lollipop');
  if(n<2){if(cb)cb();return;}
  var cs=M.cells,idx=[];
  for(var i=0;i<grid.length;i++)if(grid[i]==='lollipop')idx.push(i);
  for(var j=0;j<idx.length;j++)cs[idx[j]].classList.add('is-anticipating');
  haptic([20,40,20]);
  setTimeout(function(){
    for(var k=0;k<idx.length;k++)cs[idx[k]].classList.remove('is-anticipating');
    if(cb)cb();
  },700);
}
function setTumble(n){
  var el=document.getElementById('sr-tumble-counter');
  if(!el)return;
  if(!n){el.hidden=true;return;}
  el.textContent='x'+n;el.hidden=false;
}
M.onBoot(function(){
  var orig=M.onBoot;
});
window.ApexSRFx2=Object.freeze({
  haptic:haptic,anticipateScatter:anticipateScatter,setTumble:setTumble,countInGrid:countInGrid
});
})();

(function(){
var M=window.ApexSRMain;if(!M)return;
function spinWithAnticipation(){
  if(M.state.spinning)return;
  var E=window.ApexSugarRushGameEngine;
  var Fx2=window.ApexSRFx2;
  if(!E||!Fx2){if(window.ApexSRSpinV2)window.ApexSRSpinV2.doSpinV2();return;}
  M.state.spinning=true;
  var bet=M.BETS[M.state.betIndex];
  var res=null;
  try{res=E.spin('demo',bet);}catch(e){console.error('[spinAnt]',e);M.state.spinning=false;return;}
  if(!res){M.state.spinning=false;return;}
  M.state.last=res;
  var grid=res.finalGrid||[];
  Fx2.anticipateScatter(grid,function(){
    if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
    if(window.ApexSRRender)window.ApexSRRender.renderGrid(grid);
    M.state.balance+=(res.winMinor||0)-bet;
    M.paintStats();
    var win=res.winMinor||0;
    var w=document.getElementById('sr-win');
    if(w&&window.ApexSRFx)window.ApexSRFx.rollNumber(w,0,win,560);
    else if(w)w.textContent=M.fmtMinor(win);
    if(window.ApexSRSpinV2)window.ApexSRSpinV2.markWinning(res);
    var casc=res.cascades|0;
    if(casc>0)Fx2.setTumble(casc);
    if(win>0){Fx2.haptic(30);if(window.ApexSRFx)window.ApexSRFx.showWin(win);}
    if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:win,fs:!!res.fsTriggered});
    var hold=win>0?680:0;
    setTimeout(function(){
      if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
      Fx2.setTumble(0);
      M.state.spinning=false;
    },hold);
  });
}
M.onBoot(function(){
  var old=document.getElementById('sr-spin-btn');
  if(!old)return;
  var nb=old.cloneNode(true);
  old.parentNode.replaceChild(nb,old);
  nb.addEventListener('click',spinWithAnticipation);
});
window.ApexSRSpinAnt=Object.freeze({spinWithAnticipation:spinWithAnticipation});
})();
(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
function A(){return window.ApexSRAudio;}
function tierOf(x){return window.ApexSRFx?window.ApexSRFx.tierOf(x):0;}
function spinWithAudio(){
  if(M.state.spinning)return;
  var a=A();if(a&&a.sfxTap)a.sfxTap();
  var E=window.ApexSugarRushGameEngine,Fx2=window.ApexSRFx2;
  if(!E){return;}
  if(a&&a.sfxSpin)a.sfxSpin();
  M.state.spinning=true;
  var bet=M.BETS[M.state.betIndex];
  var res=null;
  try{res=E.spin('demo',bet);}catch(e){console.error('[spinAud]',e);M.state.spinning=false;return;}
  if(!res){M.state.spinning=false;return;}
  M.state.last=res;
  var grid=res.finalGrid||[];
  var nScatter=0;
  for(var i=0;i<grid.length;i++)if(grid[i]==='lollipop')nScatter++;
  if(nScatter>=2&&a&&a.sfxScatter)a.sfxScatter();
  var run=function(){
    if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
    if(window.ApexSRRender)window.ApexSRRender.renderGrid(grid);
    M.state.balance+=(res.winMinor||0)-bet;
    M.paintStats();
    var win=res.winMinor||0;
    var w=document.getElementById('sr-win');
    if(w&&window.ApexSRFx)window.ApexSRFx.rollNumber(w,0,win,560);
    else if(w)w.textContent=M.fmtMinor(win);
    if(window.ApexSRSpinV2)window.ApexSRSpinV2.markWinning(res);
    var casc=res.cascades|0;
    if(casc>0&&Fx2)Fx2.setTumble(casc);
    if(casc>0&&a&&a.sfxLand)a.sfxLand(casc);
    if(win>0){
      if(Fx2)Fx2.haptic(30);
      if(window.ApexSRFx)window.ApexSRFx.showWin(win);
      var mult=win/bet;
      if(a&&a.sfxWin)a.sfxWin(tierOf(mult));
    }
    if(res.fsTriggered&&a&&a.sfxFSEntry)a.sfxFSEntry();
    if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:win,fs:!!res.fsTriggered});
    var hold=win>0?680:0;
    setTimeout(function(){
      if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
      if(Fx2)Fx2.setTumble(0);
      M.state.spinning=false;
    },hold);
  };
  if(Fx2&&nScatter>=2)Fx2.anticipateScatter(grid,run);
  else run();
}
function bind(){
  var old=document.getElementById('sr-spin-btn');
  if(!old)return;
  var nb=old.cloneNode(true);
  old.parentNode.replaceChild(nb,old);
  nb.addEventListener('click',spinWithAudio);
}
M.onBoot(bind);
window.ApexSRAudioBridge=Object.freeze({spinWithAudio:spinWithAudio,bind:bind});
})();
