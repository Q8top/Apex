'use strict';
/* Apex · A-2.3 Demo 运行时网络隔离测试
 *
 * 目标：Demo 模式（?mode=demo）在运行时不得发起任何 /api/ 请求。
 *
 * 手段：
 *   1. 静态扫描：demo-adapter.js / local-demo.js / 前端 demo 路径不 import apiClient
 *   2. 运行时替换：注入 fake fetch，命中 /api/ 立即 throw 并记录
 *
 * 局限：本测试不启动真实浏览器，用 Node 模拟。真实浏览器需在 Demo 模式加
 *       网络拦截图（待 C 阶段）。
 */
const fs = require('node:fs');
const path = require('node:path');
const ROOT = require('node:path').resolve(__dirname, '../..');

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

console.log('\n=== 1. 静态扫描：Demo 相关文件不引用 /api/ ===');
var demoFiles = [
  'src/provider/demo-adapter.js',
  'src/provider/local-demo.js',
  'src/provider/provider.js',
];
demoFiles.forEach(function(f) {
  var full = path.join(ROOT, f);
  if (!fs.existsSync(full)) { t(f + ' 存在', false); return; }
  var s = fs.readFileSync(full, 'utf-8');
  var hasApi = /\/api\//.test(s);
  t(f + ' 无 /api/ 引用', !hasApi);
  var hasFetch = /[^a-zA-Z]fetch\s*\(/.test(s);
  t(f + ' 无 fetch 调用', !hasFetch);
});

console.log('\n=== 2. 静态扫描：server-adapter 只用于 real 模式 ===');
var sa = path.join(ROOT, 'src/provider/server-adapter.js');
if (fs.existsSync(sa)) {
  var saSrc = fs.readFileSync(sa, 'utf-8');
  t('server-adapter 引用 apiClient', saSrc.indexOf('apiClient') >= 0);
  t('server-adapter 引用 /api/game/spin', saSrc.indexOf('/api/game/spin') >= 0);
}

console.log('\n=== 3. sweet-demo.js 分流逻辑 ===');
var sd = fs.readFileSync(path.join(ROOT, 'src/js/inline/sweet-demo.js'), 'utf-8');
t('sweet-demo.js 读 GAME_MODE', sd.indexOf('GAME_MODE') >= 0);
t('GAME_MODE=demo 走 ApexDemoProvider', sd.indexOf("GAME_MODE === 'demo'") >= 0 && sd.indexOf('ApexDemoProvider') >= 0);
t('GAME_MODE=real 走 ApexServerProvider', sd.indexOf("ApexServerProvider.create") >= 0);

console.log('\n=== 4. 运行时替换：Demo provider 调 spin 不得触发网络 ===');
// 加载 Demo provider（需要 engine）
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

// 记录所有 fetch 调用
var fetchCalls = [];
var origFetch = globalThis.fetch;
globalThis.fetch = function(url) {
  fetchCalls.push(String(url));
  throw new Error('NETWORK_IN_DEMO: ' + url);
};

// 按顺序加载引擎 + demo adapter
var load = [
  '/src/config/version.js',
  '/src/config/math-profile.js',
  '/src/config/symbols.locked.js',
  '/src/config/paytable.locked.js',
  '/src/engine/errors.js',
  '/src/engine/grid.js',
  '/src/engine/rng.js',
  '/src/engine/multiplier.js',
  '/src/engine/evaluator.js',
  '/src/engine/tumble.js',
  '/src/engine/bonus.js',
  '/src/engine/payout.js',
  '/src/engine/game-engine.js',
  '/src/js/math/paytable.js',
  '/src/js/math/bonus.js',
  '/src/provider/demo-adapter.js',
];
try {
  load.forEach(function(f) { require(ROOT + f); });
} catch (e) {
  console.log('  [WARN] 加载失败:', e.message);
}

var fetchBefore = fetchCalls.length;

(async function() {
  if (!globalThis.window.ApexDemoProvider) {
    t('ApexDemoProvider 挂载', false);
    process.exit(1);
  }
  var provider = globalThis.window.ApexDemoProvider.create({ initialBalance: 1000000, mode: 'demo' });
  t('Demo provider 创建', !!provider);

  // 跑 5 次 spin
  for (var i = 0; i < 5; i++) {
    await provider.spin({ bet: 200, free: false });
  }
  t('Demo spin 5 次后无 fetch 调用', fetchCalls.length === fetchBefore);
  if (fetchCalls.length > fetchBefore) {
    console.log('    fetch 被调用了:', fetchCalls.slice(fetchBefore));
  }

  globalThis.fetch = origFetch;

  console.log('\n============================================');
  console.log('总计 ' + pass + ' 通过 / ' + fail + ' 失败');
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
})().catch(function(e) {
  console.error('FATAL', e.message);
  globalThis.fetch = origFetch;
  process.exit(1);
});
