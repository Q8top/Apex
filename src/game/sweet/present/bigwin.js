/* Sweet · Big Win Presentation
   职责：桥接共享 ApexBigWin（17 款共用）。
   规则：
   - 不修改 ApexBigWin 本身
   - 只在 Real settlement 成功后（由 app 层 emit）被调用
   - 通过 Events.on('win:big') 响应
*/
(function(){
'use strict';

var Events = window.SweetEvents;

function show(totalWin, bet){
  if (typeof window.ApexBigWin === 'undefined') return false;
  if (!(totalWin > 0)) return false;
  try {
    window.ApexBigWin.celebrate(totalWin, bet);
    return true;
  } catch(e) {
    console.error('[SweetBigWin] celebrate error', e);
    return false;
  }
}

function bindEvents(){
  Events.on('win:big', function(d){
    if (!d) return;
    show(d.totalWin, d.bet);
  });
}

window.SweetBigWin = {
  show: show,
  bindEvents: bindEvents
};
})();
