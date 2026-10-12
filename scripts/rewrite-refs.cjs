#!/usr/bin/env node
'use strict';
/* S2.4: dist/ 里所有 /src/ 下 js/css 重命名为 name.hash.ext
 *        并把 dist/*.html 里的引用改为新名。
 * 与 hash-assets.mjs 的区别：不用 ?v= 查询串，直接改文件名。
 * 效果：内容变 → 文件名变 → HTML 引用变 → 浏览器强制拉新。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST = path.resolve(process.argv[2] || 'dist');
if (!fs.existsSync(DIST)){
  console.error('[rewrite-refs] dist not found: ' + DIST);
  process.exit(0);
}

function sha8(file){
  const h = crypto.createHash('sha256');
  h.update(fs.readFileSync(file));
  return h.digest('hex').slice(0, 8);
}

// 1) 找出所有 /src/ 下 js/css
const srcDir = path.join(DIST, 'src');
const toRename = [];

function walk(dir){
  for (const e of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, e.name);
    if (e.isDirectory()){ walk(full); continue; }
    if (!/\.(js|css)$/.test(e.name)) continue;
    if (/\.([0-9a-f]{8})\.(js|css)$/.test(e.name)) continue; // 已 hash
    toRename.push(full);
  }
}
if (fs.existsSync(srcDir)) walk(srcDir);

// 2) 重命名
const mapping = [];   // [oldUrlPath, newUrlPath]
for (const f of toRename){
  const dir = path.dirname(f);
  const base = path.basename(f);
  const dot = base.lastIndexOf('.');
  const stem = base.slice(0, dot);
  const ext = base.slice(dot);
  const h = sha8(f);
  const newName = stem + '.' + h + ext;
  const newFull = path.join(dir, newName);
  // 保留原名（旧 HTML 仍引用不带 hash 的路径，避免 404）
  fs.copyFileSync(f, newFull);
  // 从 dist/ 起的 URL 路径（前导 /）
  const oldUrl = '/' + path.relative(DIST, f).split(path.sep).join('/');
  const newUrl = '/' + path.relative(DIST, newFull).split(path.sep).join('/');
  mapping.push([oldUrl, newUrl]);
}
console.log('[rewrite-refs] renamed ' + mapping.length + ' files');

// 3) 按长度降序（避免短路径匹配先命中）
mapping.sort((a, b) => b[0].length - a[0].length);

// 4) 重写 dist/*.html
const htmlFiles = fs.readdirSync(DIST)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(DIST, f));

let totalHits = 0;
for (const hf of htmlFiles){
  let html = fs.readFileSync(hf, 'utf-8');
  let hits = 0;
  for (const [oldUrl, newUrl] of mapping){
    // 匹配 旧URL 可选的 ?v=xxx 后缀
    const esc = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(esc + '(\\?v=[0-9a-f]+)?', 'g');
    const before = html.length;
    html = html.replace(re, newUrl);
    if (html.length !== before || html.indexOf(newUrl) >= 0) hits++;
  }
  if (hits > 0){
    fs.writeFileSync(hf, html);
    console.log('[rewrite-refs] ' + path.basename(hf) + ': ' + hits + ' refs');
    totalHits += hits;
  }
}
console.log('[rewrite-refs] total ' + totalHits + ' refs rewritten');

// 6) cleanup: delete plain copies that are no longer referenced anywhere
const textExt = /\.(html|js|css|json|xml|txt|webmanifest)$/i;
const allText = [];
(function walkAll(d){
  for (const e of fs.readdirSync(d, { withFileTypes: true })){
    const full = path.join(d, e.name);
    if (e.isDirectory()){ walkAll(full); continue; }
    if (textExt.test(e.name)) allText.push(full);
  }
})(DIST);
const blob = allText.map(f => fs.readFileSync(f, 'utf-8')).join('\n');

let removed = 0, kept = 0;
for (const [oldUrl] of mapping){
  const abs = path.join(DIST, oldUrl);
  if (!fs.existsSync(abs)) continue;
  const rel = oldUrl.replace(/^\//, '');
  if (blob.indexOf(oldUrl) >= 0 || blob.indexOf(rel) >= 0){ kept++; continue; }
  fs.unlinkSync(abs);
  removed++;
}
console.log('[rewrite-refs] cleanup removed=' + removed + ' kept=' + kept);


// 5) 验证：不应有 ?v= 残留
let leftover = 0;
for (const hf of htmlFiles){
  const s = fs.readFileSync(hf, 'utf-8');
  if (/[?&]v=/.test(s)) leftover++;
}
if (leftover > 0){
  console.warn('[rewrite-refs] WARN: ' + leftover + ' HTML still contain ?v=');
}
