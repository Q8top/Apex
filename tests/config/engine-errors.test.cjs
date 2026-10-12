'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/engine/errors.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var E = globalThis.window.ApexEngineErrors;

// --- mount ---
t('mounted', !!E);
t('outer frozen', Object.isFrozen(E));
t('CODES frozen', Object.isFrozen(E.CODES));
t('ApexError is fn', typeof E.ApexError === 'function');

// --- CODES set exact (15) ---
var codes = Object.keys(E.CODES).sort();
var expected = ['INSUFFICIENT_BALANCE','INVALID_BET','INVALID_GRID_SIZE','INVALID_MAX','INVALID_MODE','INVALID_MULTIPLIER','INVALID_RESULT','INVALID_WEIGHTS','NETWORK_ERROR','PROVIDER_UNAVAILABLE','RNG_SYMBOL_NOT_FOUND','RTP_HARD_LIMIT','SPIN_IN_PROGRESS','SPIN_NOT_ALLOWED','SYMBOLS_LOCKED'];
t('exactly 15 codes', JSON.stringify(codes) === JSON.stringify(expected), 'got ' + codes.length);
var codeValOk = codes.every(function(k){ return E.CODES[k] === k; });
t('all code values match keys', codeValOk);

// --- ApexError success path ---
var e1 = E.ApexError('INVALID_BET');
t('code only: name', e1.name === 'ApexError');
t('code only: code', e1.code === 'INVALID_BET');
t('code only: message defaults to code', e1.message === 'INVALID_BET');
t('code only: apex marker', e1.apex === true);
t('code only: instanceof Error', e1 instanceof Error);
t('code only: no originalCode', e1.originalCode === undefined);

var e2 = E.ApexError('INVALID_BET', 'bad bet 0');
t('code+msg: code', e2.code === 'INVALID_BET');
t('code+msg: message preserved', e2.message === 'bad bet 0');
t('code+msg: no originalCode', e2.originalCode === undefined);

// --- ApexError fallback path ---
var badInputs = [
  ['null', null],
  ['undefined', undefined],
  ['empty string', ''],
  ['number 42', 42],
  ['object', {}],
  ['false', false]
];
badInputs.forEach(function(pair){
  var label = pair[0], input = pair[1];
  var err = E.ApexError(input, 'ctx');
  t('fallback code for ' + label, err.code === 'UNKNOWN', 'got ' + JSON.stringify(err.code));
  t('fallback preserves originalCode for ' + label, err.originalCode === input || (input === undefined && err.originalCode === undefined));
  t('fallback message preserved for ' + label, err.message === 'ctx');
  t('fallback apex marker for ' + label, err.apex === true);
});

// --- no-args message defaults to UNKNOWN (not empty) ---
var e3 = E.ApexError();
t('no-args message = UNKNOWN', e3.message === 'UNKNOWN');
t('no-args code = UNKNOWN', e3.code === 'UNKNOWN');

// --- double-new call returns Error (constructor-agnostic) ---
var e4 = new E.ApexError('X');
t('with new works', e4 instanceof Error && e4.code === 'X' && e4.name === 'ApexError');

// --- code value itself is never rewritten when valid ---
var codeName = 'INVALID_MULTIPLIER';
var e5 = E.ApexError(codeName, 'test');
t('valid code passed through unchanged', e5.code === codeName && e5.originalCode === undefined);

// --- mirror byte-identical ---
var s1 = fs.readFileSync(ROOT + '/src/engine/errors.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_engine/errors.js', 'utf8');
t('mirror byte-identical', s1 === s2);

// --- source: no literal-code throws in engine tree (regression guard) ---
var engine = fs.readFileSync(ROOT + '/src/engine/errors.js', 'utf8');
t('comment documents 15 codes', engine.indexOf('CODE inventory') !== -1);
t('comment documents reserved', engine.indexOf('RESERVED') !== -1);
t('comment marks SPIN_IN_PROGRESS reserved', engine.indexOf('SPIN_IN_PROGRESS         -') !== -1);
t('comment marks RTP_HARD_LIMIT reserved', engine.indexOf('RTP_HARD_LIMIT           -') !== -1);

console.log('');
console.log('========== engine/errors ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
