# Apex 生产化审计报告

: 2026-09-28 06:18:34
: Termux + Node 20.20.2 + wrangler 4.86.0
https://apextop.cc.cd / https://apex-8rg.pages.dev

## 1. 已修复问题

### P0 (阻断级)
- **P0-1** functions/api/login.js 被 admin 登录覆盖 → 恢复为用户登录
- **P0-2** src/js/inline/block-02.js 假 startCaptcha 覆盖真实现 → 删除
- **P0-3** _redirects 拦截 /src/* → 线上 CSS/JS 302 → 删除该规则

### P1 (功能缺陷)
- **P1-1** functions/api/ready.js 缺 const { env } → 补上
- **P1-2** 远程 D1 admin_sessions 缺 4 列、admin_users 缺 2 列 → ADD COLUMN
- **P1-3** 远程 D1 rate_limit_buckets 结构错 → 重跑 0023

### P2 (安全/稳定)
- **P2-1** functions/api/me.js 401 缺安全头 → 补 no-store + nosniff
- **P2-2** src/js/inline/block-05.js Splash 无超时兜底 → 5s 超时
- **P2-3** src/js/inline/block-05.js innerHTML 拼接 → textContent

### P3 (代码质量)
- **P3-1** functions/_validation.js 死变量 ALPHABwET_FWD → 删除

## 2. 修改文件

functions/api/login.js
functions/api/ready.js
functions/api/me.js
functions/_validation.js
src/js/inline/block-02.js
src/js/inline/block-05.js
_redirects

## 3. 测试结果 (全部 PASS)

| 测试 | 结果 |
|---|---|
| 语法检查 | 82/82 PASS |
| 运行时单测 | 33/33 PASS |
| security-scan | 未发现问题 PASS |
| password-length | 10/0 PASS |
| password-policy | 34/0 PASS |
| csrf-middleware | 13/0 PASS |
| response-headers | 14/0 PASS |
| cbor | 16/0 PASS |
| webauthn | 37/0 PASS |
| json-shape | 8/0 PASS |
| admin-routes | 3 端点 0 未声明 PASS |
| 生产依赖漏洞 | 0 PASS |

## 4. 线上 Smoke Test

https://apextop.cc.cd/
- 首页 200
- CSS/JS 200
- /api/health 200 db=ok
- /api/ready 200
- /api/me 401
- /api/status 200
- OPTIONS 204
- CSRF 拦截生效
- 敏感路径 302
- HSTS/CSP/X-Frame/X-Content-Type/Referrer 全齐

## 5. 数据库

D1 apex-db: 16 张表
- users/admin_users/sessions/admin_sessions/passkeys 全齐
- rate_limit_buckets 结构修正
- admin_sessions 8 列 / admin_users 10 列

## 6. 未执行 / BLOCKED

- Passkey 端到端：需要真实浏览器指纹/面容
- 邮件端到端：需要真实邮箱
- E2E Playwright：Termux 无浏览器
- Admin MFA 首绑流程：需要真实 TOTP App
- 双设备 Session 管理：需要多端

## 7. 安全清单 (已通过)

[x] HTTPS+HSTS  [x] Secure Cookie  [x] HttpOnly Session  [x] SameSite=Strict
[x] CSRF 双重 Cookie  [x] CORS 同源  [x] CSP script-src 'self'
[x] X-Frame-Options DENY  [x] X-Content-Type-Options nosniff
[x] Referrer-Policy  [x] Rate Limit 全覆盖  [x] SQL 参数化
[x] PBKDF2-SHA256  [x] Session 轮换+撤销  [x] TOTP 重放保护
[x] RBAC Fail-Closed  [x] Audit Log  [x] Secret 隔离

## 8. 回滚

git log 有本次 commit
      .audit-backup-* 覆盖对应文件
