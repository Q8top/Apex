// build 阶段：给 dist/index.html 中所有 /src/ 引用加内容 hash 版本号
// 源文件保持不动，只改 dist/ 的副本
// 效果：内容变了 → hash 变了 → 浏览器强制拉新
import fs from 'node:fs';
import crypto from 'node:crypto';

const distIndex = 'dist/index.html';
if (!fs.existsSync(distIndex)) {
  console.error('dist/index.html 不存在，跳过 hash');
  process.exit(0);
}

let html = fs.readFileSync(distIndex, 'utf8');

const cache = new Map();
function hashOf(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);
  const p = 'dist' + relPath;
  if (!fs.existsSync(p)) { cache.set(relPath, null); return null; }
  const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 8);
  cache.set(relPath, h);
  return h;
}

let count = 0;
// 匹配 src="/src/xxx" 或 href="/src/xxx"，同时清掉旧的 ?v=
html = html.replace(/(src|href)="(\/src\/[^"?]+\.(?:js|css))(\?v=[^"]*)?"/g, (m, attr, path) => {
  const h = hashOf(path);
  if (!h) return m;
  count++;
  return `${attr}="${path}?v=${h}"`;
});

fs.writeFileSync(distIndex, html);
console.log(`[HASH] ${count} 个资源已加 hash 版本号`);
