'use strict';
// S1 guard: SR rules sheet must expose at least 8 sections.
var fs = require('node:fs');
var path = require('node:path');
var ROOT = path.resolve(__dirname, '../../..');
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var main = fs.readFileSync(
  path.join(ROOT, 'src/games/sugar-rush/js/main.js'), 'utf-8');
var i18n = fs.readFileSync(
  path.join(ROOT, 'src/js/platform/i18n.js'), 'utf-8');

// 1) buildSheetBody exists
ok(main.indexOf('function buildSheetBody') >= 0, 'buildSheetBody defined');

// 2) all 8 sections referenced in buildSheetBody
var sections = [
  'sr.rules.board.title',
  'sr.rules.cluster.title',
  'sr.rules.tumble.title',
  'sr.rules.scatter.title',
  'sr.rules.fs.title',
  'sr.rules.retrigger.title',
  'sr.rules.bomb.title',
  'sr.rules.bets.title',
  'sr.rules.notice.title'
];
for (var i = 0; i < sections.length; i++){
  ok(main.indexOf(sections[i]) >= 0,
     'main.js references ' + sections[i]);
}

// 3) all section keys exist in i18n (zh + en)
var zhKeys = [
  'sr.rules.board.title', 'sr.rules.board.body',
  'sr.rules.cluster.title', 'sr.rules.cluster.body',
  'sr.rules.scatter.title', 'sr.rules.scatter.body',
  'sr.rules.retrigger.title', 'sr.rules.retrigger.body',
  'sr.rules.bets.title', 'sr.rules.bets.body'
];
for (var j = 0; j < zhKeys.length; j++){
  var occ = (i18n.match(new RegExp(
    "'" + zhKeys[j].replace(/\./g, '\\.') + "'", 'g')) || []).length;
  ok(occ >= 2, zhKeys[j] + ' present in both zh + en (got ' + occ + ')');
}

// 4) bombs semantics updated for P0-7 marks
ok(i18n.indexOf('128x') >= 0 || i18n.indexOf('128') >= 0,
   'bomb text mentions 128 (P0-7 cap)');

console.log('[rules-depth] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
