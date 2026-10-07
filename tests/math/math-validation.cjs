// Apex · 数学验证（CI，100 万局）
// 运行: node tests/math/math-validation.js
'use strict';
var path = require('path');
global.window = {};
// Node 22 内置 webcrypto，无需手动赋值

var ROOT = path.join(__dirname, '../..');
require(path.join(ROOT, 'src/js/inline/sweet-symbols.js'));
require(path.join(ROOT, 'src/js/math/paytable.js'));
require(path.join(ROOT, 'src/js/math/evaluator.js'));
require(path.join(ROOT, 'src/js/math/tumble.js'));
require(path.join(ROOT, 'src/js/math/simulator.js'));

console.log('🧪 数学验证（100 万局）\n');

var r = window.ApexSimulator.simulate(1000000, 200);
var passed = 0, failed = 0;

function check(name, cond, detail) {
  if (cond) { passed++; console.log('  ✅ ' + name + ' ' + detail); }
  else { failed++; console.log('  ❌ ' + name + ' ' + detail); }
}

check('RTP 88~93%', r.rtp >= 0.88 && r.rtp <= 0.93,
      (r.rtp * 100).toFixed(2) + '%');
check('HitRate 25~40%', r.hitRate >= 0.25 && r.hitRate <= 0.40,
      (r.hitRate * 100).toFixed(2) + '%');
check('Max >= 10x', r.max >= 10, r.max.toFixed(2) + 'x');
check('P95 >= 3x', r.p95 >= 3, r.p95.toFixed(2) + 'x');

console.log('\n📊 通过 ' + passed + ' / 失败 ' + failed);
process.exit(failed > 0 ? 1 : 0);
