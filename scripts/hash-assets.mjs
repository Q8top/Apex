// build 阶段：给 dist/ 下所有 HTML 里的 /src/ 引用加内容 hash 版本号
// 源文件保持不动，只改 dist/ 的副本
// 效果：内容变了 → hash 变了 → 浏览器强制拉新
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const distDir = 'dist';
if (!fs.existsSync(distDir)) {
  console.error('dist/ 不存在，跳过 hash');
  process.exit(0);
}

// 找出所有 HTML
const htmlFiles = fs.readdirSync(distDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(distDir, f));

if (htmlFiles.length === 0) {
  console.error('dist/ 里没有 HTML，跳过 hash');
  process.exit(0);
}

const cache = new Map();
function hashOf(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);
  const p = path.join(distDir, relPath);
  if (!fs.existsSync(p)) { cache.set(relPath, null); return null; }
  const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 8);
  cache.set(relPath, h);
  return h;
}

let totalCount = 0;
for (const htmlFile of htmlFiles) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let count = 0;
  html = html.replace(/(src|href)="(\/src\/[^"?]+\.(?:js|css))(\?v=[^"]*)?"/g, (m, attr, p) => {
    const h = hashOf(p.replace(/^\//, ''));
    if (!h) return m;
    count++;
    return `${attr}="${p}?v=${h}"`;
  });
  fs.writeFileSync(htmlFile, html);
  totalCount += count;
  console.log(`[HASH] ${path.basename(htmlFile)}: ${count} 个资源已加 hash`);
}
console.log(`[HASH] 共 ${totalCount} 个引用已加版本号`);
