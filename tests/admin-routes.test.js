// tests/admin-routes.test.js
//
// 目的：Fail-Closed 权限矩阵的完整性测试
// 断言：functions/api/admin/ 下每个 .js 端点文件（除 _middleware.js）都在
//       ROUTE_PERMISSIONS 或 PUBLIC_PATHS 中有对应声明，否则 CI 失败。
//
// 为什么需要这个测试？
//   Fail-Closed 设计下，未声明路径会被 403。这本身是好事，但会导致开发者
//   忘记声明时静默失败。此测试在 CI 阶段显式失败，让问题在开发阶段暴露。

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ADMIN_DIR = path.join(ROOT, 'functions/api/admin');

const { ROUTE_PERMISSIONS } = await import(
  url.pathToFileURL(path.join(ROOT, 'functions/_admin.js')).href
);

// 从文件路径推导 HTTP 路径
//   functions/api/admin/login.js         → /api/admin/login
//   functions/api/admin/users.js         → /api/admin/users
//   functions/api/admin/users/[id].js    → /api/admin/users/:id   (可选)
function fileToRoute(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  return '/' + rel
    .replace(/^functions\//, '')
    .replace(/\.js$/, '')
    .replace(/\/index$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1');
}

const PUBLIC_PATHS = new Set(['/api/admin/login']);

function matchAny(pathname) {
  for (const r of ROUTE_PERMISSIONS) {
    if (r.pattern.test(pathname)) return true;
  }
  return false;
}

let failed = 0;
const files = fs.readdirSync(ADMIN_DIR, { withFileTypes: true });

console.log('[admin-routes] 检查 functions/api/admin/ 下所有端点...');

for (const ent of files) {
  if (!ent.isFile()) continue;
  if (!ent.name.endsWith('.js')) continue;
  if (ent.name === '_middleware.js') continue;

  const file = path.join(ADMIN_DIR, ent.name);
  const route = fileToRoute(file);

  const isPublic = PUBLIC_PATHS.has(route);
  const isDeclared = matchAny(route);

  if (!isPublic && !isDeclared) {
    console.error(`  [FAIL] ${ent.name} → ${route} 未在 ROUTE_PERMISSIONS 声明`);
    failed++;
  } else {
    const tag = isPublic ? 'PUBLIC' : 'DECLARED';
    console.log(`  [OK]   ${ent.name} → ${route} [${tag}]`);
  }
}

console.log('');
console.log(`[admin-routes] 检查完成：${files.filter(f => f.isFile() && f.name.endsWith('.js') && f.name !== '_middleware.js').length} 个端点，${failed} 个未声明`);

if (failed > 0) {
  console.error('');
  console.error('【Fail-Closed 违规】');
  console.error('  以下端点在 ROUTE_PERMISSIONS 未声明，运行时会被 403。');
  console.error('  请在 functions/_admin.js 的 ROUTE_PERMISSIONS 中补充声明。');
  process.exit(1);
}
process.exit(0);
