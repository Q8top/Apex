import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.cwd();
const IGNORE = new Set(['node_modules','.git','.wrangler','dist']);
function walk(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(IGNORE.has(e.name)||e.name.startsWith('.audit-backup'))continue;const f=path.join(d,e.name);e.isDirectory()?walk(f,o):o.push(f);}return o;}
const js = walk(path.join(ROOT,'functions')).concat(walk(path.join(ROOT,'src')));
const rel = f => path.relative(ROOT,f);

console.log('\n=== [1] XSS 危险 API ===');
let n1=0;
for (const f of js){ const L=fs.readFileSync(f,'utf8').split('\n'); L.forEach((l,i)=>{ const t=l.trim();
  if (/\beval\s*\(/.test(t)){console.log('  ERROR '+rel(f)+':'+(i+1)+'  eval  '+t.slice(0,100));n1++;}
  if (/new\s+Function\s*\(/.test(t)){console.log('  ERROR '+rel(f)+':'+(i+1)+'  new Function  '+t.slice(0,100));n1++;}
  if (/document\.write\s*\(/.test(t)){console.log('  ERROR '+rel(f)+':'+(i+1)+'  document.write');n1++;}
  if (/\.innerHTML\s*=/.test(t) && /\+\s*[a-zA-Z_$]/.test(t)){console.log('  WARN '+rel(f)+':'+(i+1)+'  innerHTML 拼接  '+t.slice(0,100));n1++;}
});}
console.log('  总计: '+n1);

console.log('\n=== [2] SQL 模板拼接 ===');
let n2=0;
for (const f of js){ const L=fs.readFileSync(f,'utf8').split('\n'); L.forEach((l,i)=>{ if (/prepare\s*\(\s*`[^`]*\$\{/.test(l)){console.log('  '+rel(f)+':'+(i+1)+'  '+l.trim().slice(0,120));n2++;} });}
console.log('  总计: '+n2);

console.log('\n=== [3] Cookie 属性 ===');
let n3=0;
for (const f of js){ const L=fs.readFileSync(f,'utf8').split('\n'); L.forEach((l,i)=>{ if (/Path=/.test(l) && /(sessionCookie|adminCookie|csrf|Cookie=)/.test(l)){ const sec=/Secure/.test(l),h=/HttpOnly/.test(l),ss=/SameSite/.test(l); if(!sec||!ss){console.log('  '+rel(f)+':'+(i+1)+'  Secure='+sec+' HttpOnly='+h+' SameSite='+ss+'  '+l.trim().slice(0,120));n3++;} } });}
console.log('  总计: '+n3);

console.log('\n=== [4] 敏感 API Rate Limit 覆盖 ===');
for (const f of ['functions/api/login.js','functions/api/register.js','functions/api/send-reset-code.js','functions/api/reset-password.js','functions/api/send-verify-email.js','functions/api/admin/login.js']){
  const p=path.join(ROOT,f); if(!fs.existsSync(p)){console.log('  MISS '+f);continue;}
  const s=fs.readFileSync(p,'utf8'); console.log('  '+(/enforceIpRateLimit|enforceKeyRateLimit/.test(s)?'OK  ':'MISS')+' '+f);
}

console.log('\n=== [5] CSRF 中间件 ===');
{const s=fs.readFileSync(path.join(ROOT,'functions/_middleware.js'),'utf8'); console.log('  verifyCsrf: '+(s.includes('verifyCsrf')?'OK':'MISS')); console.log('  SAFE_METHODS: '+(/SAFE_METHODS/.test(s)?'OK':'MISS'));}

console.log('\n=== [6] 日志泄露 ===');
let n6=0;
for (const f of js){ const L=fs.readFileSync(f,'utf8').split('\n'); L.forEach((l,i)=>{ if (/console\.(log|warn|error|info)/.test(l) && /password|token|secret|hash/i.test(l) && !/redactSensitive|\[REDACTED\]|\.message/.test(l)){console.log('  '+rel(f)+':'+(i+1)+'  '+l.trim().slice(0,130));n6++;} });}
console.log('  总计: '+n6);

console.log('\n=== [7] Open Redirect / SSRF ===');
let n7=0;
for (const f of js){ const L=fs.readFileSync(f,'utf8').split('\n'); L.forEach((l,i)=>{ if (/location\.(href|assign|replace)\s*=/.test(l) && !/\.reload/.test(l)){console.log('  REDIR '+rel(f)+':'+(i+1)+'  '+l.trim().slice(0,120));n7++;} if (/fetch\s*\(\s*(url|userUrl|params|body\.)/.test(l)){console.log('  SSRF  '+rel(f)+':'+(i+1)+'  '+l.trim().slice(0,120));n7++;} });}
console.log('  总计: '+n7);

console.log('\n=== [8] 响应敏感字段 ===');
let n8=0;
function wapi(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);e.isDirectory()?wapi(f,o):(e.name.endsWith('.js')&&e.name!=='_middleware.js'&&o.push(f));}return o;}
for (const f of wapi(path.join(ROOT,'functions/api'))){ const s=fs.readFileSync(f,'utf8'); if (/jsonResponse[^)]*password_hash/.test(s)){console.log('  '+rel(f)+'  password_hash');n8++;} if (/jsonResponse[^)]*totp_secret/.test(s)){console.log('  '+rel(f)+'  totp_secret');n8++;} if (/jsonResponse[^)]*token_hash/.test(s)){console.log('  '+rel(f)+'  token_hash');n8++;} }
console.log('  总计: '+n8);

console.log('\n=== [9] GitHub Actions ===');
const wd=path.join(ROOT,'.github/workflows');
if (fs.existsSync(wd)) for (const f of fs.readdirSync(wd)){ const s=fs.readFileSync(path.join(wd,f),'utf8'); console.log('  '+f+'  pin-SHA='+/uses:\s*\S+@[0-9a-f]{40}/.test(s)+'  echo-secret='+/echo\s+\$\{\{\s*secrets\./.test(s)); }

console.log('\n=== 汇总 ===');
console.log('  XSS: '+n1+'  SQL: '+n2+'  Cookie: '+n3+'  日志: '+n6+'  Redirect/SSRF: '+n7+'  响应: '+n8);
