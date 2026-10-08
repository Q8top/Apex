(function(){
'use strict';
/* Apex · 悬浮诊断面板
 * 触发：?debug=1
 * 只读，不修改任何游戏状态。
 * 挂载：无（一次性执行）
 */
function qs(name){
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1]) : null;
}
if (qs('debug') !== '1') return;

var CHECKS = [
  ['config/version',        'ApexVersion'],
  ['config/math-profile',   'ApexMathProfile'],
  ['config/symbols.locked', 'ApexSymbolsLocked'],
  ['config/paytable.locked','ApexPaytableLocked'],
  ['config/public-rules',   'ApexPublicRules'],
  ['engine/errors',         'ApexEngineErrors'],
  ['engine/grid',           'ApexEngineGrid'],
  ['engine/rng',            'ApexEngineRng'],
  ['engine/multiplier',     'ApexEngineMultiplier'],
  ['engine/evaluator',      'ApexEngineEvaluator'],
  ['engine/tumble',         'ApexEngineTumble'],
  ['engine/bonus',          'ApexEngineBonus'],
  ['engine/payout',         'ApexEnginePayout'],
  ['engine/game-engine',    'ApexEngineGameEngine'],
  ['provider/provider',     'ApexCoreProvider'],
  ['provider/local-demo',   'ApexCoreLocalDemoProvider'],
  ['provider/server',       'ApexCoreServerProvider'],
  ['wallet/wallet',         'ApexCoreWallet'],
  ['wallet/demo-wallet',    'ApexCoreDemoWallet'],
  ['core/state',            'ApexCoreState'],
  ['core/runtime',          'ApexCoreRuntime'],
  ['symbols V2',            'ApexSymbolsV2'],
  ['old symbols',           'ApexSymbols'],
  ['old evaluator',         'ApexEvaluator'],
  ['old paytable',          'ApexPaytable'],
  ['old demo provider',     'ApexDemoProvider'],
  ['rules sheet',           'ApexRules'],
  ['history sheet',         'ApexHistory'],
  ['settings sheet',        'ApexSettings'],
  ['audio',                 'ApexAudio'],
  ['haptics',               'ApexHaptics'],
  ['i18n',                  'ApexI18n']
];

function el(tag, style, text){
  var e = document.createElement(tag);
  if (style) for (var k in style) e.style[k] = style[k];
  if (text != null) e.textContent = text;
  return e;
}

window.addEventListener('load', function(){
  setTimeout(function(){
    var wrap = el('div', {
      position: 'fixed', top: '10px', left: '10px', right: '10px',
      maxHeight: '80vh', overflow: 'auto',
      background: 'rgba(10,16,28,0.97)',
      color: '#E6EDF6', padding: '14px', borderRadius: '12px',
      font: '12px/1.5 -apple-system,sans-serif',
      zIndex: '999999', boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      border: '1px solid rgba(120,160,220,0.3)'
    });

    var ok = 0, bad = 0;
    var title = el('div', { fontSize: '15px', fontWeight: '700', marginBottom: '8px' });
    var ver = (window.ApexVersion && window.ApexVersion.VERSION)
      ? window.ApexVersion.VERSION.game : '?';
    var mathV = window.ApexMathProfile ? window.ApexMathProfile.VERSION : '?';

    var list = el('div', {});
    CHECKS.forEach(function(c){
      var present = typeof window[c[1]] !== 'undefined';
      if (present) ok++; else bad++;
      var row = el('div', {
        display: 'flex', justifyContent: 'space-between',
        padding: '4px 8px', borderBottom: '1px solid rgba(120,160,220,0.1)',
        fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '11.5px'
      });
      row.appendChild(el('span', { color: '#A9B7CC' }, c[0]));
      row.appendChild(el('span', {
        color: present ? '#5BD97B' : '#FF6B6B', fontWeight: '700'
      }, present ? '✓' : '✗'));
      list.appendChild(row);
    });

    title.textContent = (bad === 0 ? '✓ ' : '✗ ') + '模块 ' + ok + '/' + (ok + bad);
    title.style.color = (bad === 0) ? '#5BD97B' : '#FF6B6B';
    wrap.appendChild(title);
    wrap.appendChild(el('div', {
      fontSize: '11px', color: '#7A8798', marginBottom: '8px'
    }, 'game=' + ver + ' · math=' + mathV + ' · URL=' + location.search));
    wrap.appendChild(list);

    var close = el('button', {
      marginTop: '10px', padding: '8px 16px', borderRadius: '8px',
      background: '#3B9EFF', color: '#fff', border: '0',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer'
    }, '关闭');
    close.onclick = function(){ wrap.remove(); };
    wrap.appendChild(close);

    document.body.appendChild(wrap);
    document.title = (bad === 0 ? '✓ ' : '✗ ') + ok + '/' + (ok + bad) + ' Apex';
  }, 800);
});
})();
