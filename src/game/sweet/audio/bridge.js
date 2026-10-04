/* Sweet · Audio Bridge
   监听 Events → 调 SweetAudio。
   不改 SweetAudio 本身（Audio J 已真机验证）。
   Sound on/off 从 localStorage 持久化。
*/
(function(){
'use strict';

var Events = window.SweetEvents;
var A = window.SweetAudio;

var LS_KEY = 'sweetSoundOn';
var _enabled = true;

function safe(fn, tag){
  try { if (typeof fn === 'function') fn(); } catch(e){ console.warn('[SweetAudioBridge] ' + tag, e && e.message); }
}

function init(){
  if (!A) { console.error('[SweetAudioBridge] SweetAudio 未加载'); return; }
  try {
    _enabled = localStorage.getItem(LS_KEY) !== '0';
  } catch(e) { _enabled = true; }
  safe(function(){ A.init(); }, 'init');
  safe(function(){ A.enabled(_enabled); }, 'enabled-init');
}

function isEnabled(){ return _enabled; }

function setEnabled(v){
  _enabled = !!v;
  safe(function(){ A.enabled(_enabled); }, 'enabled-set');
  try { localStorage.setItem(LS_KEY, _enabled ? '1' : '0'); } catch(e){}
}

function bindEvents(){
  if (!A) return;

  Events.on('audio:click', function(){ safe(A.click, 'click'); });
  Events.on('spin:start', function(){ safe(A.spinStart, 'spinStart'); });
  Events.on('reel:colstop', function(d){ safe(function(){ A.reelStop(d.col); }, 'reelStop'); });
  Events.on('win:roundStart', function(){ safe(A.tumble, 'tumble'); });
  Events.on('bomb:show', function(){ safe(A.bomb, 'bomb'); });

  Events.on('fs:entrance', function(){ safe(A.freeSpin, 'freeSpin'); });
  Events.on('fs:bgStart', function(){ safe(A.fsBgStart, 'fsBgStart'); });
  Events.on('fs:bgStop', function(){ safe(A.fsBgStop, 'fsBgStop'); });
  Events.on('fs:summary', function(){ safe(A.fsSummary, 'fsSummary'); });

  Events.on('win:settled', function(d){
    if (!d || !(d.totalWin > 0)) { safe(A.lose, 'lose'); return; }
    var ratio = d.totalWin / (d.bet || 1);
    if (ratio >= 10) safe(A.winBig, 'winBig');
    else if (ratio >= 2) safe(A.winMedium, 'winMedium');
    else safe(A.winSmall, 'winSmall');
  });
}

window.SweetAudioBridge = {
  init: init,
  bindEvents: bindEvents,
  isEnabled: isEnabled,
  setEnabled: setEnabled
};
})();
