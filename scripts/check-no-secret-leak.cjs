#!/usr/bin/env node
'use strict';
/* S1.6: 敏感数值泄露扫描
 * 扫描 dist/ 与 src/，检测 RTP 目标区间 / payScale / maxWinMultiplier 明文。
 * 例外：src/config/math-profile.js 是 demo 档（允许 demo 参数）。
 * 用法：
 *   node scripts/check-no-secret-leak.cjs
 *   node scripts/check-no-secret-leak.cjs dist
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const argDir = process.argv[2];
const SCAN_DIRS = argDir ? [argDir] : ['dist', 'src'];

// 允许豁免的文件（demo 档允许含 demo 参数；functions/_config 是服务端）
function isExempt(file) {
  const rel = file.replace(/\\/g, '/');
  if (/\/functions\//.test(rel)) return true;                  // 服务端
  if (/\/src\/config\/math-profile\.js$/.test(rel)) return true; // SB demo 档
  if (/\/src\/games\/sugar-rush\/config\/math-profile\.js$/.test(rel)) return true; // SR demo 档
  if (/\/functions\/_config\//.test(rel)) return true;        // 共享 config
  return false;
}

const PATTERNS = [
  { re: /1\.30[\s\S]{0,30}2\.50/, msg: 'demo RTP 目标区间明文' },
  { re: /0\.88[\s\S]{0,30}0\.93/, msg: 'real RTP 目标区间明文' },
  { re: /payScale\s*:\s*2\.[45]/,  msg: 'real payScale 明文' },
  { re: /maxWinMultiplier\s*:\s*5000/, msg: 'real maxWinMultiplier 明文' }
];

let hits = 0, files = 0;

function scan(dir) {
  const abs = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(abs, e.name);
    if (e.isDirectory()) { scan(full); continue; }
    if (!/\.(js|css|html|json)$/.test(e.name)) continue;
    if (isExempt(full)) continue;
    files++;
    let src;
    try { src = fs.readFileSync(full, 'utf-8'); } catch (e) { continue; }
    for (const p of PATTERNS) {
      if (p.re.test(src)) {
        console.error('[LEAK] ' + path.relative(ROOT, full) + ': ' + p.msg);
        hits++;
      }
    }
  }
}

SCAN_DIRS.forEach(scan);
console.log('[scan] files=' + files + '  hits=' + hits);
if (hits > 0) { console.error('[FATAL] 检测到 ' + hits + ' 处敏感信息泄露'); process.exit(1); }
console.log('[OK] 无敏感信息泄露');
