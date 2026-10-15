#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const HTMLS = ['index.html','sweet-demo.html','sugar-rush.html',
  'announcements.html','privacy.html','terms.html',
  'status.html','404.html',
  'loading.html','coming-soon.html',
  'olympus.html'];
const SKIP = ['http://','https://','//','data:','mailto:',
  '#','tel:','javascript:'];
const RE = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;

function isLocal(u){
  for (const p of SKIP) if (u.indexOf(p) === 0) return false;
  return true;
}
function existsLocal(local){
  if (fs.existsSync(path.join(ROOT, local))) return true;
  if (!path.extname(local)) {
    if (fs.existsSync(path.join(ROOT, local + '.html'))) return true;
    if (fs.existsSync(path.join(ROOT, local, 'index.html'))) return true;
  }
  return false;
}

let miss = [];
let ok = 0;
for (const html of HTMLS) {
  const fp = path.join(ROOT, html);
  if (!fs.existsSync(fp)) {
    console.log('[SKIP] no ' + html);
    continue;
  }
  const src = fs.readFileSync(fp, 'utf8');
  const seen = new Set();
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(src)) !== null) {
    const u = m[1];
    if (!isLocal(u)) continue;
    const clean = u.split('?')[0].split('#')[0];
    if (!clean || clean === '/' || seen.has(clean)) continue;
    seen.add(clean);
    const local = clean.replace(/^\//, '');
    if (existsLocal(local)) ok++;
    else miss.push(html + ' :: ' + u + ' -> ' + local);
  }
}

console.log('[check-html-refs] ok=' + ok + ' miss=' + miss.length);
for (const x of miss) console.log('  MISS ' + x);
process.exit(miss.length === 0 ? 0 : 1);
