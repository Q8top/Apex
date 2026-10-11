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
    if(window.ApexSRBalance)window.ApexSRBalance.paintBalanceAnimated(M.state.balance);
    else M.paintStats();
    var win=res.winMinor||0;
    var w=document.getElementById('sr-win');
    if(w&&window.ApexSRFx)window.ApexSRFx.rollNumber(w,0,win,560);
    else if(w)w.textContent=M.fmtMinor(win);
    if(window.ApexSRSpinV2)window.ApexSRSpinV2.markWinning(res);
    var casc=res.cascades|0;
    if(casc>0){if(window.ApexSRTumbleTier)window.ApexSRTumbleTier.setTumbleTiered(casc);else Fx2.setTumble(casc);}
    if(win>0){Fx2.haptic(30);if(window.ApexSRFx)window.ApexSRFx.showWin(win);}
    if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:win,fs:!!res.fsTriggered});
    if(window.ApexSRMultiplier){
      window.ApexSRMultiplier.setMultiplier(res.totalMultiplier||0);
      window.ApexSRMultiplier.setFSMode(!!res.fsTriggered);
    }
    var hold=win>0?680:0;
    setTimeout(function(){
      if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
      if(window.ApexSRTumbleTier)window.ApexSRTumbleTier.setTumbleTiered(0);else Fx2.setTumble(0);
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
    if(casc>0){if(window.ApexSRTumbleTier)window.ApexSRTumbleTier.setTumbleTiered(casc);else if(Fx2)Fx2.setTumble(casc);}
    if(casc>0&&a&&a.sfxLand)a.sfxLand(casc);
    if(win>0){
      if(Fx2)Fx2.haptic(30);
      if(window.ApexSRWinTier)window.ApexSRWinTier.showWinTiered(win);
      else if(window.ApexSRFx)window.ApexSRFx.showWin(win);
      var mult=win/bet;
      if(a&&a.sfxWin)a.sfxWin(tierOf(mult));
    }
    if(res.fsTriggered){
      var spins=res.fsSpinsPlayed|0;
      if(!spins){var sc=res.scatterCount|0;spins=(sc>=6)?20:(sc===5)?15:(sc===4)?12:10;}
      if(window.ApexSRFSEntry&&window.ApexSRFSEntry.playFSEntry)window.ApexSRFSEntry.playFSEntry(spins);
      else if(a&&a.sfxFSEntry)a.sfxFSEntry();
    }
    if(window.ApexSRHistory)window.ApexSRHistory.push({bet:bet,win:win,fs:!!res.fsTriggered});
    var hold=win>0?680:0;
    setTimeout(function(){
      if(window.ApexSRSpinV2)window.ApexSRSpinV2.clearCells();
      if(window.ApexSRTumbleTier)window.ApexSRTumbleTier.setTumbleTiered(0);else if(Fx2)Fx2.setTumble(0);
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

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
function tierClass(mult){
  if(mult>=500)return 'sr-tier-epic';
  if(mult>=100)return 'sr-tier-mega';
  if(mult>=20) return 'sr-tier-big';
  if(mult>=5)  return 'sr-tier-nice';
  return '';
}
function tierLabel(mult){
  if(mult>=500)return 'EPIC WIN';
  if(mult>=100)return 'MEGA WIN';
  if(mult>=20) return 'BIG WIN';
  if(mult>=5)  return 'NICE';
  return 'WIN';
}
function showWinTiered(amountMinor){
  var b=document.getElementById('sr-win-burst');
  if(!b){
    var stage=document.getElementById('sr-stage');
    if(!stage)return;
    b=document.createElement('div');
    b.className='sr-win-burst';b.id='sr-win-burst';b.hidden=true;
    var inner=document.createElement('div');inner.className='sr-win-burst-inner';
    var lb=document.createElement('div');lb.className='sr-win-burst-label';
    var vl=document.createElement('div');vl.className='sr-win-burst-value';
    inner.appendChild(lb);inner.appendChild(vl);b.appendChild(inner);
    stage.appendChild(b);
  }
  var inner=b.querySelector('.sr-win-burst-inner');
  var lb=b.querySelector('.sr-win-burst-label');
  var vl=b.querySelector('.sr-win-burst-value');
  var bet=M.BETS[M.state.betIndex]||100;
  var mult=amountMinor/bet;
  var cls=tierClass(mult);
  inner.className='sr-win-burst-inner'+(cls?' '+cls:'');
  lb.textContent=tierLabel(mult);
  vl.textContent=M.fmtMinor(0);
  b.hidden=false;

  var Fx=window.ApexSRFx;
  if(Fx&&Fx.rollNumber)Fx.rollNumber(vl,0,amountMinor,660);
  else vl.textContent=M.fmtMinor(amountMinor);

  if(cls==='sr-tier-big'||cls==='sr-tier-mega'||cls==='sr-tier-epic'){
    var C=window.ApexSRConfetti;
    if(C){var tier=cls==='sr-tier-epic'?4:cls==='sr-tier-mega'?3:2;C.burst(tier);}
  }
  if(cls==='sr-tier-mega'||cls==='sr-tier-epic'){
    var ring=document.createElement('div');ring.className='sr-tier-ring';
    b.appendChild(ring);
    setTimeout(function(){if(ring.parentNode)ring.parentNode.removeChild(ring);},1500);
    var Fx2=window.ApexSRFx2;
    if(Fx2&&Fx2.haptic)Fx2.haptic([30,40,30,40,30]);
  }
  var dur=(cls==='sr-tier-epic')?2400:(cls==='sr-tier-mega')?2000:1400;
  setTimeout(function(){b.hidden=true;},dur);
}
window.ApexSRWinTier=Object.freeze({showWinTiered:showWinTiered,tierClass:tierClass,tierLabel:tierLabel});
})();

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
var lastN=0;
function tierOf(n){
  if(n>=4)return 4;
  if(n===3)return 3;
  if(n===2)return 2;
  if(n===1)return 1;
  return 0;
}
function setTumbleTiered(n){
  var el=document.getElementById('sr-tumble-counter');
  if(!el)return;
  n=n|0;
  if(n<=0){el.hidden=true;el.className='sr-tumble-counter';lastN=0;return;}
  el.className='sr-tumble-counter';
  var t=tierOf(n);
  el.classList.add('sr-tc-'+t);
  el.textContent='x'+n;
  el.hidden=false;
  if(n!==lastN){
    var a=window.ApexSRAudio;
    if(a&&a.sfxLand)a.sfxLand(n);
    var Fx2=window.ApexSRFx2;
    if(t>=3&&Fx2&&Fx2.haptic)Fx2.haptic([15,25,15]);
    if(t>=4&&a&&a.sfxMultiplier)a.sfxMultiplier(4);
  }
  lastN=n;
}
window.ApexSRTumbleTier=Object.freeze({setTumbleTiered:setTumbleTiered,tierOf:tierOf});
})();

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
var COLORS=['#ff8a1e','#ffd24a','#e5397e','#7c2fff','#5ac8fa','#7ed957','#ff5ea8'];
function spawnCandy(overlay,n){
  for(var i=0;i<n;i++){
    (function(idx){
      setTimeout(function(){
        var c=document.createElement('div');c.className='sr-fs-candy';
        var sz=10+Math.random()*16;
        c.style.width=sz+'px';c.style.height=sz+'px';
        c.style.left=(Math.random()*100)+'%';
        c.style.background=COLORS[Math.floor(Math.random()*COLORS.length)];
        c.style.boxShadow='0 2px 8px rgba(0,0,0,.3), inset 0 -3px 6px rgba(0,0,0,.25)';
        c.style.animationDuration=(2.2+Math.random()*2.2)+'s';
        c.style.animationDelay=(Math.random()*0.6)+'s';
        overlay.appendChild(c);
        setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},5200);
      },idx*22);
    })(i);
  }
}
function ensureOverlay(){
  var o=document.getElementById('sr-fs-overlay');
  if(o)return o;
  o=document.createElement('div');o.className='sr-fs-overlay';o.id='sr-fs-overlay';o.hidden=true;
  var rays=document.createElement('div');rays.className='sr-fs-rays';
  var core=document.createElement('div');core.className='sr-fs-core';
  var pre=document.createElement('div');pre.className='sr-fs-pre';pre.textContent='SWEET BONANZA';
  var title=document.createElement('div');title.className='sr-fs-title';title.textContent='FREE SPINS';
  var count=document.createElement('div');count.className='sr-fs-count';count.textContent='+0';
  var sub=document.createElement('div');sub.className='sr-fs-sub';sub.textContent='TRIGGERED';
  core.appendChild(pre);core.appendChild(title);core.appendChild(count);core.appendChild(sub);
  o.appendChild(rays);o.appendChild(core);
  document.body.appendChild(o);
  return o;
}
function playFSEntry(spins){
  var o=ensureOverlay();
  var count=o.querySelector('.sr-fs-count');
  count.textContent='+'+spins;
  o.hidden=false;
  void o.offsetWidth;
  o.classList.add('is-open');
  spawnCandy(o,64);
  if(window.ApexSRAudio&&window.ApexSRAudio.sfxFSEntry)window.ApexSRAudio.sfxFSEntry();
  var Fx2=window.ApexSRFx2;
  if(Fx2&&Fx2.haptic)Fx2.haptic([40,30,40,30,40,30,60]);
  var hold=(spins>=15)?2600:2000;
  setTimeout(function(){
    o.classList.remove('is-open');
    setTimeout(function(){o.hidden=true;},400);
  },hold);
}
window.ApexSRFSEntry=Object.freeze({playFSEntry:playFSEntry});
})();

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
var COLORS=['#ff8a1e','#ffd24a','#e5397e','#7c2fff','#5ac8fa','#7ed957','#ff5ea8','#ff3a3a'];
var layer=null;
function ensureLayer(){
  if(layer&&layer.parentNode)return layer;
  layer=document.createElement('div');layer.className='sr-confetti-layer';
  document.body.appendChild(layer);
  return layer;
}
function spawn(n){
  var L=ensureLayer();
  for(var i=0;i<n;i++){
    (function(idx){
      setTimeout(function(){
        var p=document.createElement('div');p.className='sr-confetti-piece';
        var dx=(Math.random()*2-1)*180;
        var rot=(Math.random()*2-1)*1080;
        p.style.left=(Math.random()*100)+'%';
        p.style.background=COLORS[Math.floor(Math.random()*COLORS.length)];
        p.style.setProperty('--dx', dx.toFixed(0)+'px');
        p.style.setProperty('--rot', rot.toFixed(0)+'deg');
        p.style.animationDuration=(1.6+Math.random()*1.6)+'s';
        p.style.animationDelay=(Math.random()*0.4)+'s';
        if(Math.random()<0.3){p.style.width='6px';p.style.height='10px';}
        L.appendChild(p);
        setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},3800);
      },idx*12);
    })(i);
  }
}
function burst(tier){
  var n = tier>=4 ? 140 : tier>=3 ? 90 : tier>=2 ? 45 : 0;
  if(n>0)spawn(n);
}
window.ApexSRConfetti=Object.freeze({burst:burst,spawn:spawn});
})();

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
var badge=null,lastVal=0;
function ensureBadge(){
  if(badge&&badge.parentNode)return badge;
  badge=document.createElement('div');badge.className='sr-mult-badge';badge.id='sr-mult-badge';badge.hidden=true;
  var lb=document.createElement('div');lb.className='sr-mult-label';lb.textContent='TOTAL';
  var vl=document.createElement('div');vl.className='sr-mult-value';vl.textContent='0x';
  badge.appendChild(lb);badge.appendChild(vl);
  document.body.appendChild(badge);
  return badge;
}
function setMultiplier(v){
  v=(typeof v==='number')?v:0;
  var b=ensureBadge();
  var vl=b.querySelector('.sr-mult-value');
  if(v<=0){b.classList.remove('is-open');setTimeout(function(){b.hidden=true;},320);lastVal=0;return;}
  vl.textContent=v.toFixed(2)+'x';
  b.hidden=false;
  void b.offsetWidth;
  b.classList.add('is-open');
  if(v!==lastVal){
    b.classList.remove('is-bump');
    void b.offsetWidth;
    b.classList.add('is-bump');
    var a=window.ApexSRAudio;
    if(a&&a.sfxMultiplier){var lvl=Math.min(7,Math.floor(Math.log(Math.max(1,v))/Math.log(1.6)));a.sfxMultiplier(lvl);}
  }
  lastVal=v;
}
function setFSMode(on){
  var app=document.getElementById('sr-app')||document.body;
  if(on)app.classList.add('is-fs');
  else app.classList.remove('is-fs');
}
window.ApexSRMultiplier=Object.freeze({setMultiplier:setMultiplier,setFSMode:setFSMode});
})();

(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;
function fmtThousands(minor){
  var v=(minor/100).toFixed(2);
  var parts=v.split('.');
  var intPart=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '\u00a5'+intPart+'.'+parts[1];
}
function rollBalance(el,from,to,dur){
  if(!el)return;
  var t0=performance.now();
  function frame(now){
    var p=Math.min(1,(now-t0)/dur);
    var e=1-Math.pow(1-p,3);
    var v=Math.round(from+(to-from)*e);
    el.textContent=fmtThousands(v);
    if(p<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
var lastBal=0;
function paintBalanceAnimated(newBal){
  var el=document.getElementById('sr-balance');
  if(!el){lastBal=newBal;return;}
  if(lastBal===0)lastBal=newBal;
  rollBalance(el,lastBal,newBal,540);
  lastBal=newBal;
}
window.ApexSRBalance=Object.freeze({paintBalanceAnimated:paintBalanceAnimated,fmtThousands:fmtThousands,rollBalance:rollBalance,getLast:function(){return lastBal;}});
})();
