(function(){
'use strict';
var CHECKS = [
  ['ApexVersion',            'config/version'],
  ['ApexMathProfile',        'config/math-profile'],
  ['ApexSymbolsLocked',      'config/symbols.locked'],
  ['ApexPaytableLocked',     'config/paytable.locked'],
  ['ApexPublicRules',        'config/public-rules'],
  ['ApexEngineErrors',       'engine/errors'],
  ['ApexEngineGrid',         'engine/grid'],
  ['ApexEngineRng',          'engine/rng'],
  ['ApexEngineMultiplier',   'engine/multiplier'],
  ['ApexEngineEvaluator',    'engine/evaluator'],
  ['ApexEngineTumble',       'engine/tumble'],
  ['ApexEngineBonus',        'engine/bonus'],
  ['ApexEnginePayout',       'engine/payout'],
  ['ApexEngineGameEngine',   'engine/game-engine'],
  ['ApexCoreProvider',       'provider/provider'],
  ['ApexCoreLocalDemoProvider', 'provider/local-demo'],
  ['ApexCoreServerProvider', 'provider/server'],
  ['ApexCoreWallet',         'wallet/wallet'],
  ['ApexCoreDemoWallet',     'wallet/demo-wallet'],
  ['ApexCoreState',          'core/state'],
  ['ApexCoreRuntime',        'core/runtime'],
  ['ApexEngineSymbolRender', 'old engine symbols-render'],
  ['ApexEngineSymbols',      'old engine symbols'],
  ['ApexFruitSvg',           'old fruit svg'],
  ['ApexSymbolsV2',          'symbols v2'],
  ['ApexSymbols',            'old symbols'],
  ['ApexSymbolRenderer',     'old renderer'],
  ['ApexPaytable',           'old paytable'],
  ['ApexEvaluator',          'old evaluator'],
  ['ApexTumble',             'old tumble'],
  ['ApexBonus',              'old bonus'],
  ['ApexSimulator',          'old simulator'],
  ['ApexAudio',              'audio'],
  ['ApexAudioSynth',         'audio-synth'],
  ['ApexHaptics',            'haptics'],
  ['ApexI18n',               'i18n'],
  ['ApexWallet',             'old wallet'],
  ['ApexEventBus',           'events'],
  ['ApexGameState',          'old state'],
  ['ApexGameRuntime',        'old runtime'],
  ['ApexDemoProvider',       'old provider'],
  ['ApexRules',              'rules'],
  ['ApexHistory',            'history'],
  ['ApexSettings',           'settings'],
  ['ApexSheetLock',          'sheet-lock'],
  ['ApexWinFeedback',        'win-feedback'],
  ['ApexSweetModal',         'modal']
];

var root = document.getElementById('report');
var ok = 0, bad = 0;
var groupNew = ['config/version','config/math-profile','config/symbols.locked','config/paytable.locked','config/public-rules',
                'engine/errors','engine/grid','engine/rng','engine/multiplier','engine/evaluator','engine/tumble','engine/bonus','engine/payout','engine/game-engine',
                'provider/provider','provider/local-demo','provider/server',
                'wallet/wallet','wallet/demo-wallet',
                'core/state','core/runtime'];

function section(title){
  var h = document.createElement('h2');
  h.textContent = title;
  root.appendChild(h);
}
function row(name, path, present){
  var div = document.createElement('div');
  div.className = 'row';
  var n = document.createElement('span');
  n.className = 'name';
  n.textContent = name;
  var v = document.createElement('span');
  v.className = 'val ' + (present ? 'ok' : 'bad');
  v.textContent = present ? '✓ ' + path : '✗ 未挂载';
  div.appendChild(n); div.appendChild(v);
  root.appendChild(div);
  if (present) ok++; else bad++;
}

section('Phase 3 新模块（应全部 ✓）');
CHECKS.forEach(function(c){
  if (groupNew.indexOf(c[1]) < 0) return;
  row(c[0], c[1], typeof window[c[0]] !== 'undefined');
});

section('Phase 1 冻结层（应全部 ✓）');
CHECKS.forEach(function(c){
  if (c[1].indexOf('config/') !== 0) return;
  row(c[0], c[1], typeof window[c[0]] !== 'undefined');
});

section('符号系统（应全部 ✓）');
['ApexSymbolsV2','ApexEngineSymbolRender','ApexEngineSymbols','ApexFruitSvg','ApexSymbolRenderer','ApexSymbols'].forEach(function(k){
  row(k, '', typeof window[k] !== 'undefined');
});

section('旧业务（应全部 ✓，Phase 3 未改动）');
['ApexPaytable','ApexEvaluator','ApexTumble','ApexBonus','ApexSimulator','ApexAudio','ApexAudioSynth','ApexHaptics','ApexI18n','ApexWallet','ApexEventBus','ApexGameState','ApexGameRuntime','ApexDemoProvider','ApexRules','ApexHistory','ApexSettings','ApexSheetLock','ApexWinFeedback'].forEach(function(k){
  row(k, '', typeof window[k] !== 'undefined');
});

// 汇总
var sum = document.createElement('div');
sum.className = 'summary';
var version = (window.ApexVersion && window.ApexVersion.VERSION) ? window.ApexVersion.VERSION.game : '?';
var mathV = window.ApexMathProfile ? window.ApexMathProfile.VERSION : '?';
sum.innerHTML = '<b>汇总</b><br>'
  + '挂载 ✓ <span class="ok">' + ok + '</span> · 未挂载 <span class="bad">' + bad + '</span><br>'
  + '版本 game=' + version + ' math=' + mathV + '<br>'
  + 'UA: ' + navigator.userAgent.slice(0, 60);
root.appendChild(sum);

// 顶部标题颜色
document.title = (bad === 0 ? '✓ ' : '✗ ') + 'Apex 模块 ' + ok + '/' + (ok + bad);
})();
