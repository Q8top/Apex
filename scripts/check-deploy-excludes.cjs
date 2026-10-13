#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// 敏感路径清单：4 份部署清单必须同时覆盖
// pattern: 字面量匹配（.assetsignore/.cfignore）或路由前缀（routes/redirects）
const MUST_EXCLUDE = [
  { route: '/package.json',     ignore: 'package.json' },
  { route: '/package-lock.json',ignore: 'package-lock.json' },
  { route: '/wrangler.toml',    ignore: 'wrangler.toml' },
  { route: '/.env',             ignore: '.env' },
  { route: '/.dev.vars',        ignore: '.dev.vars' },
  { route: '/_routes.json',     ignore: '_routes.json' },
  { route: '/_headers',         ignore: '_headers' },
  { route: '/README.md',        ignore: 'README.md' },
  { route: '/functions/*',      ignore: 'functions/' },
  { route: '/migrations/*',     ignore: 'migrations/' },
  { route: '/scripts/*',        ignore: 'scripts/' },
  { route: '/tests/*',          ignore: 'tests/' },
  { route: '/docs/*',           ignore: 'docs/' },
  { route: '/node_modules/*',   ignore: 'node_modules/' },
  { route: '/.git/*',           ignore: '.git/' },
  { route: '/.github/*',        ignore: '.github/' },
  { route: '/.wrangler/*',      ignore: '.wrangler/' },
];

function readSafe(p){
  try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
  catch(e) { return ''; }
}

const assets = readSafe('.assetsignore');
const cf    = readSafe('.cfignore');
const routes = readSafe('_routes.json');
const redir  = readSafe('_redirects');

function hasIgnore(text, token){
  if (!text) return false;
  const lines = text.split('\n');
  for (const ln of lines) {
    const s = ln.trim();
    if (!s || s.startsWith('#')) continue;
    if (s === token) return true;
  }
  return false;
}

function hasRoute(text, pattern){
  if (!text) return false;
  // 精确行匹配（route 部分必须是完整字段）
  const base = pattern.replace(/\/$/, '');
  const re = new RegExp('(^|\\s|\")' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|\"|/|\\*|$)');
  return re.test(text);
}

const miss = [];
for (const m of MUST_EXCLUDE) {
  const a = hasIgnore(assets, m.ignore);
  const c = hasIgnore(cf, m.ignore);
  const r = hasRoute(routes, m.route);
  const d = hasRoute(redir, m.route);
  if (!(a && c && r && d)) {
    miss.push(m.route + '  [assets=' + a + ' cf=' + c + ' routes=' + r + ' redirects=' + d + ']');
  }
}

console.log('[check-deploy-excludes] checked=' + MUST_EXCLUDE.length + ' miss=' + miss.length);
for (const x of miss) console.log('  MISS ' + x);
process.exit(miss.length === 0 ? 0 : 1);
