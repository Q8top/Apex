/* 6 款老虎机共用 · Big Win 分级（原版 Pragmatic 4 级） */
(function(){
'use strict';

/* 判定等级：返回 { tier: 'big'|'mega'|'super'|'mega2', label: 'BIG WIN', mult: N } 或 null */
function tier(totalWin, bet){
  if(!bet || totalWin<=0) return null;
  var m = totalWin / bet;
  if (m >= 100) return { tier:'mega2', label:'MEGA WIN',  mult: m };
  if (m >= 50)  return { tier:'super', label:'SUPER WIN', mult: m };
  if (m >= 25)  return { tier:'mega',  label:'MEGA WIN',  mult: m };
  if (m >= 15)  return { tier:'big',   label:'BIG WIN',   mult: m };
  return null;
}

/* 渲染并显示庆祝横幅（3 秒自动隐藏） */
function celebrate(amount, bet, opts){
  opts = opts || {};
  var t = tier(amount, bet);
  if (!t) return false;
  var container = opts.container || document.body;
  var el = document.createElement('div');
  el.className = 'celebrate show ' + t.tier;
  el.innerHTML =
    '<div class="celebrate-glow"></div>' +
    '<div class="celebrate-content">' +
      '<div class="celebrate-tier">' + t.label + '</div>' +
      '<div class="celebrate-amount">¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div>' +
    '</div>';
  container.appendChild(el);
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }, 2600);
  return t;
}

window.ApexBigWin = { tier: tier, celebrate: celebrate };
})();
