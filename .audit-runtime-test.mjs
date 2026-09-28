// Apex API 运行时单测（Node 原生，无需 workerd）
// 直接调用每个 handler 的 onRequestXxx，mock env/request，断言响应

let pass = 0, fail = 0;
const failures = [];

function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2705 ' + label); }
  else { fail++; failures.push(label); console.log('  \u274c ' + label); }
}

function assertEq(a, b, label) {
  const eq = JSON.stringify(a) === JSON.stringify(b);
  if (eq) { pass++; console.log('  \u2705 ' + label); }
  else { fail++; failures.push(label + ' (期望 ' + JSON.stringify(b) + ' 得到 ' + JSON.stringify(a) + ')'); console.log('  \u274c ' + label + ' (期望 ' + JSON.stringify(b) + ' 得到 ' + JSON.stringify(a) + ')'); }
}

// ============ Fake D1 ============
function makeFakeDB(opts = {}) {
  const calls = [];
  const defaultFirst = opts.defaultFirst ?? null;
  const userFound = opts.userFound ?? null;
  const adminFound = opts.adminFound ?? null;
  const sessionFound = opts.sessionFound ?? null;

  function prepare(sql) {
    calls.push(sql.trim().replace(/\s+/g, ' ').slice(0, 80));
    const stmt = {
      _sql: sql,
      _binds: [],
      bind(...args) { this._binds = args; return this; },
      first: async () => {
        const s = sql.toLowerCase();
        if (s.includes('select 1')) return { '1': 1 };
        if (s.includes('from users where')) return userFound;
        if (s.includes('from admin_users where')) return adminFound;
        if (s.includes('from sessions')) return sessionFound;
        if (s.includes('count(')) return { n: 0 };
        return defaultFirst;
      },
      run: async () => ({ meta: { changes: 0, last_row_id: 1 } }),
      all: async () => ({ results: [] }),
    };
    return stmt;
  }
  return { prepare, _calls: calls, _dumpCalls: () => calls.slice() };
}

// ============ Fake env ============
function makeEnv(overrides = {}) {
  return {
    ENVIRONMENT: 'production',
    PUBLIC_BASE_URL: 'https://apextop.cc.cd',
    EMAIL_FROM: 'Apex <noreply@apextop.cc.cd>',
    EMAIL_REPLY_TO: 'support@apextop.cc.cd',
    CAPTCHA_SECRET: 'test_captcha_secret_32_bytes_long_xx',
    CAPTCHA_SALT: 'test_captcha_salt',
    SESSION_SALT: 'test_session_salt_32_bytes_long_xx',
    AUDIT_SALT: 'test_audit_salt_32_bytes_long_xx',
    RATE_LIMIT_SALT: 'test_rate_limit_salt_32_bytes_lng',
    RESEND_API_KEY: 're_test_dummy_not_real',
    AGENTMAIL_API_KEY: '',
    AGENTMAIL_INBOX_ID: '',
    ALLOWED_ORIGINS: '',
    apex_db: makeFakeDB(overrides.dbOpts || {}),
    ...overrides.env,
  };
}

function makeCtx({ url, method = 'GET', headers = {}, body = null, env, data = {} }) {
  const h = new Headers(headers);
  const init = { method, headers: h };
  if (body !== null && body !== undefined) {
    if (typeof body === 'string') init.body = body;
    else {
      init.body = JSON.stringify(body);
      if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
    }
  }
  const req = new Request(url, init);
  return {
    request: req,
    env: env || makeEnv(),
    data: { requestId: 'apx_test_' + Math.random().toString(36).slice(2, 10), ...data },
    next: async () => new Response('{}', { status: 200 }),
  };
}

const H = 'http://127.0.0.1';

// ============================================================
// 开始
// ============================================================
console.log('\n\u{1F9EA} Apex API 运行时单测\n');

// ---------- health ----------
console.log('\u3010 health \u3011');
{
  const m = await import('./functions/api/health.js');
  const res = await m.onRequestGet(makeCtx({ url: H + '/api/health', env: makeEnv() }));
  assertEq(res.status, 200, 'GET /api/health \u2192 200');
  const body = await res.json();
  assertEq(body.success, true, 'health success=true');
  assertEq(body.checks.db, 'ok', 'health db=ok');
  ok(!body.version, 'health 不泄露 version');
}

// ---------- ready ----------
console.log('\n\u3010 ready \u3011');
{
  const m = await import('./functions/api/ready.js');
  const res = await m.onRequestGet(makeCtx({ url: H + '/api/ready' }));
  assertEq(res.status, 200, 'GET /api/ready \u2192 200');
  const body = await res.json();
  assertEq(body.ready, true, 'ready=true');
}

// ---------- me ----------
console.log('\n\u3010 me \u3011');
{
  const m = await import('./functions/api/me.js');
  const res = await m.onRequestGet(makeCtx({
    url: H + '/api/me',
    env: makeEnv({ dbOpts: { sessionFound: null } }),
  }));
  assertEq(res.status, 401, 'me 无 cookie \u2192 401');
  assertEq(res.headers.get('Cache-Control'), 'no-store', 'me 401 有 Cache-Control:no-store');
  assertEq(res.headers.get('X-Content-Type-Options'), 'nosniff', 'me 401 有 X-Content-Type-Options');
}

// ---------- login ----------
console.log('\n\u3010 login \u3011');
{
  const m = await import('./functions/api/login.js');
  // 空 body
  const res1 = await m.onRequestPost(makeCtx({
    url: H + '/api/login', method: 'POST', body: {},
  }));
  assertEq(res1.status, 400, 'login 空 body \u2192 400');
  const b1 = await res1.json();
  assertEq(b1.success, false, 'login 空 body success=false');
  ok(b1.code === 'missing_fields' || b1.code === 'captcha_missing', 'login 空 body 有 error code (' + b1.code + ')');

  // 缺 captcha
  const res2 = await m.onRequestPost(makeCtx({
    url: H + '/api/login', method: 'POST', body: { account: 'a', password: 'b' },
  }));
  assertEq(res2.status, 400, 'login 缺 captcha \u2192 400');
  const b2 = await res2.json();
  assertEq(b2.code, 'captcha_missing', 'login 缺 captcha code=captcha_missing');

  // 密码过长
  const longPwd = 'x'.repeat(300);
  const res3 = await m.onRequestPost(makeCtx({
    url: H + '/api/login', method: 'POST',
    body: { account: 'a', password: longPwd, captchaToken: 'x' },
  }));
  assertEq(res3.status, 400, 'login 超长密码 \u2192 400');
  const b3 = await res3.json();
  assertEq(b3.code, 'password_length_invalid', 'login 超长密码 code=password_length_invalid');

  // 检查 login.js 中没有 admin_users 引用
  const loginSrc = (await import('node:fs')).readFileSync('functions/api/login.js', 'utf8');
  ok(!loginSrc.includes('admin_users'), 'login.js 源码无 admin_users 引用');
  ok(loginSrc.includes('FROM users'), 'login.js 源码含 FROM users');
}

// ---------- register ----------
console.log('\n\u3010 register \u3011');
{
  const m = await import('./functions/api/register.js');
  const res = await m.onRequestPost(makeCtx({
    url: H + '/api/register', method: 'POST', body: {},
  }));
  assertEq(res.status, 400, 'register 空 body \u2192 400');
  const b = await res.json();
  ok(['captcha_missing','missing_fields','password_length_invalid'].includes(b.code), 'register 空 body 有合理 code (' + b.code + ')');
}

// ---------- sessions ----------
console.log('\n\u3010 sessions \u3011');
{
  const m = await import('./functions/api/sessions.js');
  const res = await m.onRequestGet(makeCtx({
    url: H + '/api/sessions',
    env: makeEnv({ dbOpts: { sessionFound: null } }),
  }));
  assertEq(res.status, 401, 'sessions 未登录 \u2192 401');
}

// ---------- logout ----------
console.log('\n\u3010 logout \u3011');
{
  const m = await import('./functions/api/logout.js');
  const res = await m.onRequestPost(makeCtx({
    url: H + '/api/logout', method: 'POST', body: {},
  }));
  assertEq(res.status, 200, 'logout 未登录 \u2192 200（幂等）');
}

// ---------- admin/login ----------
console.log('\n\u3010 admin/login \u3011');
{
  const m = await import('./functions/api/admin/login.js');
  const res = await m.onRequestPost(makeCtx({
    url: H + '/api/admin/login', method: 'POST', body: {},
  }));
  assertEq(res.status, 400, 'admin login 空 body \u2192 400');
}

// ---------- captcha/challenge ----------
console.log('\n\u3010 captcha/challenge \u3011');
{
  const m = await import('./functions/api/captcha/challenge.js');
  const res = await m.onRequestPost(makeCtx({
    url: H + '/api/captcha/challenge', method: 'POST', body: {},
  }));
  assertEq(res.status, 400, 'challenge 空 body \u2192 400');
  const b = await res.json();
  assertEq(b.code, 'invalid_purpose', 'challenge 空 body code=invalid_purpose');

  const res2 = await m.onRequestPost(makeCtx({
    url: H + '/api/captcha/challenge', method: 'POST', body: { purpose: 'login' },
  }));
  assertEq(res2.status, 200, 'challenge purpose=login \u2192 200');
  const b2 = await res2.json();
  ok(b2.challenge && b2.signature, 'challenge 返回 challenge+signature');
}

// ---------- devCode 守卫 ----------
console.log('\n\u3010 devCode/devToken 生产守卫 \u3011');
{
  const fs = await import('node:fs');
  for (const f of [
    'functions/api/send-reset-code.js',
    'functions/api/send-verify-email.js',
    'functions/api/passkey/recover-challenge.js',
  ]) {
    const src = fs.readFileSync(f, 'utf8');
    const idx = src.indexOf('devCode') >= 0 ? src.indexOf('devCode') : src.indexOf('devToken');
    const before = src.slice(Math.max(0, idx - 200), idx);
    ok(before.includes('isDevelopment'), f + ' dev 分支有 isDevelopment 守卫');
  }
}

// ---------- OPTIONS ----------
console.log('\n\u3010 OPTIONS \u3011');
{
  for (const f of [
    'functions/api/health.js',
    'functions/api/login.js',
    'functions/api/register.js',
  ]) {
    const m = await import('./' + f);
    if (m.onRequestOptions) {
      const res = await m.onRequestOptions(makeCtx({ url: H + '/api/x', method: 'OPTIONS' }));
      assertEq(res.status, 204, f + ' OPTIONS \u2192 204');
    }
  }
}

// ---------- 汇总 ----------
console.log('\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
console.log('\u{1F4CA} \u901A\u8FC7 ' + pass + ' / \u5931\u8D25 ' + fail);
if (failures.length) {
  console.log('\n\u5931\u8D25\u9879:');
  for (const f of failures) console.log('  - ' + f);
}
console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
process.exit(fail === 0 ? 0 : 1);
