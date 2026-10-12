#!/usr/bin/env node
/* Apex lint: quick rules check. Non-blocking on warnings. */
'use strict';
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var cssFiles = [
  'src/css/sweet-demo.css',
  'src/css/sweet-modal.css',
  'src/css/tokens.css',
  'src/css/base.css'
];
var jsFiles = [
  'src/js/inline/sweet-demo.js',
  'src/js/presentation/audio-synth.js',
  'src/js/ui/sweet-rules.js',
  'src/js/ui/sweet-history.js',
  'src/js/ui/sweet-settings.js'
];

var errCount = 0;
var warnCount = 0;
function err(m) { console.log('[ERR] ' + m); errCount++; }
function warn(m) { console.log('[WARN] ' + m); warnCount++; }

cssFiles.forEach(function (f) {
  var p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { err('missing css ' + f); return; }
  var s = fs.readFileSync(p, 'utf8');
  var ob = (s.match(/\{/g) || []).length;
  var cb = (s.match(/\}/g) || []).length;
  if (ob !== cb) err('brace mismatch ' + f + ' {=' + ob + ' }=' + cb);
  if (/transition[^;]*\b(top|left|right|bottom|width|height)\b/.test(s)) {
    warn('transition on layout prop in ' + f);
  }
  var wc = (s.match(/will-change/g) || []).length;
  if (wc > 5) warn('will-change count ' + wc + ' in ' + f);
});

jsFiles.forEach(function (f) {
  var p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { err('missing js ' + f); return; }
  var s = fs.readFileSync(p, 'utf8');
  if (/eval\(/.test(s)) err('eval in ' + f);
});

console.log('');
console.log('lint: errors=' + errCount + ' warnings=' + warnCount);
process.exit(errCount > 0 ? 1 : 0);
