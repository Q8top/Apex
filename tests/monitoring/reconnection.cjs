'use strict';
/* P1-8 reconnection.js test. */
var path = require('path');
var fs = require('fs');
var vm = require('vm');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}

var SRC = fs.readFileSync(path.join(ROOT, 'src/js/presentation/reconnection.js'), 'utf8');
var fail = 0;
function t(n, c, e) { if (c) console.log('  ok   ' + n); else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

function fresh(onlineState) {
  var listeners = {};
  global.window = {
    addEventListener: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); }
  };
  Object.defineProperty(global, 'navigator', {
    value: { onLine: onlineState !== false },
    configurable: true, writable: true
  });
  vm.runInThisContext(SRC, { filename: 'reconnection.js' });
  return { listeners: listeners, RC: global.window.ApexReconnection };
}
function fire(env, name) { (env.listeners[name] || []).forEach(function (f) { f(); }); }

console.log('\n=== 1) mount ===');
var e1 = fresh(true);
t('1a mounted', !!e1.RC);
t('1b has create', typeof e1.RC.create === 'function');
t('1c frozen', Object.isFrozen(e1.RC));

console.log('\n=== 2) initial online ===');
var r1 = e1.RC.create();
t('2a isOnline true', r1.isOnline() === true);
t('2b frozen instance', Object.isFrozen(r1));

console.log('\n=== 3) initial offline ===');
var e2 = fresh(false);
var r2 = e2.RC.create();
t('3a isOnline false', r2.isOnline() === false);

console.log('\n=== 4) onChange fires on offline->online ===');
var e3 = fresh(true);
var r3 = e3.RC.create();
var events = [];
r3.onChange(function (v) { events.push(v); });
fire(e3, 'offline');
t('4a offline fires', events.length === 1 && events[0] === false);
fire(e3, 'online');
t('4b online fires', events.length === 2 && events[1] === true);
t('4c isOnline true', r3.isOnline() === true);

console.log('\n=== 5) duplicate events skipped ===');
var e4 = fresh(true);
var r4 = e4.RC.create();
var n4 = 0;
r4.onChange(function () { n4++; });
fire(e4, 'online');
t('5a no change -> no fire', n4 === 0);
fire(e4, 'offline');
t('5b offline fires once', n4 === 1);
fire(e4, 'offline');
t('5c duplicate offline no fire', n4 === 1);
fire(e4, 'online');
fire(e4, 'online');
t('5d online + dup -> 1 fire (total 2)', n4 === 2);

console.log('\n=== 6) unsubscribe ===');
var e5 = fresh(true);
var r5 = e5.RC.create();
var n5 = 0;
var off = r5.onChange(function () { n5++; });
off();
fire(e5, 'offline');
t('6a unsubscribe stops fires', n5 === 0);

console.log('\n=== 7) multiple listeners ===');
var e6 = fresh(true);
var r6 = e6.RC.create();
var a = 0, b = 0;
r6.onChange(function () { a++; });
r6.onChange(function () { b++; });
fire(e6, 'offline');
t('7a both listeners fire', a === 1 && b === 1);

console.log('\n=== 8) listener throw isolated ===');
var e7 = fresh(true);
var r7 = e7.RC.create();
var ok7 = 0;
r7.onChange(function () { throw new Error('boom'); });
r7.onChange(function () { ok7++; });
var threw = false;
try { fire(e7, 'offline'); } catch (e) { threw = true; }
t('8a throw does not propagate', threw === false);
t('8b second listener still fires', ok7 === 1);

console.log('\n=== 9) non-function onChange ===');
var e8 = fresh(true);
var r8 = e8.RC.create();
var off8 = r8.onChange(null);
t('9a returns noop fn', typeof off8 === 'function');
off8();

console.log('\n=== 10) no window -> no crash ===');
var oldWin = global.window;
global.window = undefined;
var threw10 = false;
try { vm.runInThisContext(SRC, { filename: 'reconnection.js' }); } catch (e) { threw10 = true; }
global.window = oldWin;
t('10a no window no crash', threw10 === false);

console.log('\ntotal: 21, failed: ' + fail);
process.exit(fail > 0 ? 1 : 0);
