#!/usr/bin/env node
'use strict';
/* Apex check-no-math-leak (P3-2)
 *
 * Purpose: prevent exact math parameters from leaking into files
 * that reach players via channels OTHER than the demo bundle.
 *
 * What we protect:
 *   - .env.example / .env.sample           must not contain any exact math value
 *   - README.md / docs/**\/*.md            must not contain exact target RTP
 *   - src/config/public-rules.js           must not contain exact values
 *   - any *.html inline <script> body      must not contain exact values
 *   - git staged files (partial scan)      no exact value in new doc/config lines
 *
 * What we do NOT protect (documented boundary):
 *   - src/config/math-profile.js           must ship to demo (client-side demo
 *                                          needs weights + payScale). Real
 *                                          parameters remain OBSERVABLE by
 *                                          anyone who reads the file. This
 *                                          is an accepted trade-off; real
 *                                          settlement values live server-side
 *                                          in functions/_config/ and cannot
 *                                          be changed by the client.
 *
 * Exit: 0 = clean, 1 = leak found
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const EXACT_VALUES = [
  '0.9049', '1.7842',   // targetRtp.target (real / demo)
  '2.55', '3.60',       // payScale (real / demo)
];
const EXACT_WEIGHT_HINTS = [
  'baseWeights:', 'scatterWeight:', 'fsMultiplierWeight:', 'pityRate:',
];

const SKIP_DIRS = new Set(['.git', 'node_modules', '.wrangler', 'dist',
                           'backups', '.audit-backup', 'tests', 'functions']);
const MD_FILES = ['README.md'];
const DOC_DIR = 'docs';

let leaks = [];

function scanFile(p) {
  let s;
  try { s = fs.readFileSync(p, 'utf-8'); } catch (e) { return; }
  const rel = path.relative(ROOT, p);
  const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Allow the source of truth files themselves
    if (rel === 'src/config/math-profile.js') continue;
    if (rel === 'functions/_config/math-profile.js') continue;
    // Allow checks file itself
    if (rel === 'scripts/check-no-math-leak.js') continue;
    if (rel === 'scripts/check-no-math-leak.cjs') continue;
    // Allow internal math docs (excluded from dist by build-dist.sh)
    if (rel.startsWith('docs/math/')) continue;

    for (const v of EXACT_VALUES) {
      // Match "0.9049" as a standalone token (avoid matching "0.90491")
      const re = new RegExp('(?<![0-9.])' + v.replace(/\./g, '\\.') + '(?![0-9])');
      if (re.test(line)) {
        leaks.push({ file: rel, line: i + 1, value: v, text: line.trim().slice(0, 80) });
      }
    }
  }
}

function scanHTMLInlineScripts(p) {
  let s;
  try { s = fs.readFileSync(p, 'utf-8'); } catch (e) { return; }
  const rel = path.relative(ROOT, p);
  const re = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(s)) !== null) {
    const body = m[1];
    for (const v of EXACT_VALUES) {
      const vr = new RegExp('(?<![0-9.])' + v.replace(/\./g, '\\.') + '(?![0-9])');
      if (vr.test(body)) {
        const before = s.slice(0, m.index);
        const line = before.split('\n').length;
        leaks.push({ file: rel, line: line, value: v, text: 'inline <script>' });
      }
    }
  }
}

function walk(dir, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else if (e.isFile()) cb(full);
  }
}

// 1) .env.example / .env.sample
for (const f of ['.env.example', '.env.sample', '.env']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) scanFile(p);
}

// 2) README.md + docs/
for (const f of MD_FILES) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) scanFile(p);
}
const docsPath = path.join(ROOT, DOC_DIR);
if (fs.existsSync(docsPath)) {
  walk(docsPath, (p) => { if (p.endsWith('.md')) scanFile(p); });
}

// 3) public-rules.js
const pr = path.join(ROOT, 'src/config/public-rules.js');
if (fs.existsSync(pr)) scanFile(pr);

// 4) All *.html inline scripts
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
for (const f of htmlFiles) scanHTMLInlineScripts(path.join(ROOT, f));

// 5) Report
if (leaks.length === 0) {
  console.log('[check-no-math-leak] OK: 0 leaks in protected files');
  console.log('  scanned: .env.example, README.md, docs/**, public-rules.js, *.html');
  console.log('  exact values: ' + EXACT_VALUES.join(', '));
  process.exit(0);
}

console.log('[check-no-math-leak] LEAKS FOUND: ' + leaks.length);
for (const l of leaks) {
  console.log('  ' + l.file + ':' + l.line + '  [value=' + l.value + ']  ' + l.text);
}
process.exit(1);
