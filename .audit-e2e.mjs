const BASE = 'https://apextop.cc.cd';
const jar = new Map();
function saveCookies(res) {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  for (const c of sc) {
    const m = c.match(/^([^=]+)=([^;]*)/);
    if (m) jar.set(m[1].trim(), m[2]);
  }
}
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}
async function call(method, path, body) {
  const headers = { 'Cookie': cookieHeader() };
  if (body) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const csrf = jar.get('apex_csrf') || jar.get('__Host-apex_csrf');
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  const res = await fetch(BASE + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  saveCookies(res);
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

const TS = Date.now().toString().slice(-8);
const USER = 'e2e_' + TS;
const EMAIL = `e2e_${TS}@example.invalid`;
const PASS = 'E2eTest-Pass9xYz!Q2';

console.log('══════ E2E @ ' + new Date().toISOString().slice(11,19) + ' ══════');
console.log('');
console.log('测试账号: ' + USER + ' / ' + EMAIL);
console.log('');

const signals = {
  webdriver: false,
  languages: ['zh-CN', 'en'],
  platform: 'Linux x86_64',
  hardwareConcurrency: 8,
  deviceMemory: 8,
  screenWidth: 1920,
  screenHeight: 1080,
  mouseMoves: 20, touches: 0, keypresses: 8, scrolls: 3, dwellTime: 4000,
};

async function getCaptcha(purpose) {
  const ch = await call('POST', '/api/captcha/challenge', { purpose });
  if (!ch.data || !ch.data.challenge) throw new Error('challenge failed: ' + JSON.stringify(ch.data));
  const v = await call('POST', '/api/captcha/verify', {
    challenge: ch.data.challenge,
    signature: ch.data.signature,
    purpose,
    signals,
  });
  if (!v.data || !v.data.token) throw new Error('verify failed: ' + JSON.stringify(v.data));
  return v.data.token;
}

// 0. 预热 CSRF
let r = await call('GET', '/api/health');
console.log('[' + r.status + '] GET /api/health  (预热 CSRF)');
console.log('     csrf cookie: ' + (jar.get('apex_csrf') || '').slice(0, 16) + '...');
console.log('');

// 1. CAPTCHA
const cap1 = await getCaptcha('register');
console.log('[--] CAPTCHA (register) OK  token=' + cap1.slice(0, 20) + '...');
console.log('');

// 2. 注册
r = await call('POST', '/api/register', {
  username: USER, email: EMAIL, password: PASS, captchaToken: cap1,
});
console.log('[' + r.status + '] POST /api/register');
console.log('     ' + JSON.stringify(r.data));
console.log('');

// 3. 登录
const cap2 = await getCaptcha('login');
r = await call('POST', '/api/login', {
  account: USER, password: PASS, captchaToken: cap2,
});
console.log('[' + r.status + '] POST /api/login');
console.log('     ' + JSON.stringify(r.data));
console.log('');

// 4. /api/me
r = await call('GET', '/api/me');
console.log('[' + r.status + '] GET /api/me');
console.log('     ' + JSON.stringify(r.data));
console.log('');

// 5. /api/sessions
r = await call('GET', '/api/sessions');
console.log('[' + r.status + '] GET /api/sessions');
console.log('     ' + JSON.stringify(r.data).slice(0, 300));
console.log('');

// 6. logout
r = await call('POST', '/api/logout', {});
console.log('[' + r.status + '] POST /api/logout');
console.log('     ' + JSON.stringify(r.data));
console.log('');

// 7. logout 后 /api/me
r = await call('GET', '/api/me');
console.log('[' + r.status + '] GET /api/me (logout 后)');
console.log('     ' + JSON.stringify(r.data));
console.log('');

console.log('══════ 完成 ══════');
