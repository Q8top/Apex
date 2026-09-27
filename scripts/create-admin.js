// Apex 管理员创建工具 v2
//
// 用法：
//   node scripts/create-admin.js <username> <role>             # 生产（--remote）
//   node scripts/create-admin.js <username> <role> --local     # 本地 D1
//
// 安全设计：
//   1. 密码不允许通过命令行参数传入（防止进入 shell history / ps）
//   2. 密码通过 stdin 交互式读取（不回显）
//   3. role 必须显式指定且经过白名单校验
//   4. SQL 写入 0600 权限临时文件，通过 wrangler --file 执行
//      - 不经过 shell 转义，无 shell 注入面
//      - 不打印 SQL 到终端（避免用户复制时出错 / 泄露 hash）
//   5. 执行完毕立即删除临时文件
//
// 依赖：Node 20+，wrangler 或 npx

import { hashPassword } from '../functions/_password.js';
import readline from 'node:readline';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const VALID_ROLES = new Set(['super_admin', 'admin', 'support', 'analyst', 'viewer']);
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

// SQL 字面量安全转义（单引号加倍，符合 SQLite 标准）
function sqlEscape(v) {
  if (typeof v !== "string") throw new Error("sqlEscape 只接受字符串");
  return "'" + v.replace(/'/g, "''") + "'";
}

function usage() {
  console.error('用法：node scripts/create-admin.js <username> <role> [--local]');
  console.error('  role 必须是以下之一：' + [...VALID_ROLES].join(' / '));
  console.error('');
  console.error('示例：node scripts/create-admin.js alice admin');
  console.error('密码将在下一步通过交互式输入（不回显）。');
  process.exit(1);
}

function readPasswordHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let buf = '';
    const onData = (ch) => {
      ch = ch.toString('utf8');
      for (const c of ch) {
        switch (c) {
          case '\n':
          case '\r':
          case '\u0004':
            if (stdin.isTTY) stdin.setRawMode(wasRaw);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(buf);
            return;
          case '\u0003':
            process.stdout.write('\n');
            process.exit(130);
            return;
          case '\u007f':
          case '\b':
            buf = buf.slice(0, -1);
            break;
          default:
            buf += c;
        }
      }
    };
    stdin.on('data', onData);
  });
}

function checkPasswordPolicy(pwd) {
  if (typeof pwd !== 'string') return '密码必须是字符串';
  if (pwd.length < 12) return '密码至少 12 位';
  if (pwd.length > 256) return '密码过长（>256）';
  if (!/[a-z]/.test(pwd)) return '密码必须包含小写字母';
  if (!/[A-Z]/.test(pwd)) return '密码必须包含大写字母';
  if (!/[0-9]/.test(pwd)) return '密码必须包含数字';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return '密码必须包含特殊字符';
  return null;
}

function findWranglerCmd() {
  // 优先直接调用 wrangler，回退到 npx wrangler
  const direct = spawnSync('wrangler', ['--version'], { stdio: 'ignore' });
  if (direct.status === 0) return { cmd: 'wrangler', base: [] };
  const viaNpx = spawnSync('npx', ['wrangler', '--version'], { stdio: 'ignore' });
  if (viaNpx.status === 0) return { cmd: 'npx', base: ['wrangler'] };
  return null;
}

function runWranglerExecute(sqlFilePath, local) {
  const w = findWranglerCmd();
  if (!w) {
    console.error('[ERROR] 未找到 wrangler，也无法通过 npx 调用');
    console.error('        请先安装：npm i -g wrangler  或  npm i -D wrangler');
    process.exit(1);
  }
  const args = [...w.base, 'd1', 'execute', 'apex-db', `--file=${sqlFilePath}`, '--yes'];
  args.push(local ? '--local' : '--remote');
  console.log('');
  console.log('[执行] ' + w.cmd + ' ' + args.join(' ').replace(sqlFilePath, '<tmpfile>'));
  const r = spawnSync(w.cmd, args, { stdio: 'inherit' });
  return r.status === 0;
}

(async () => {
  const args = process.argv.slice(2);
  const flags = new Set();
  const positional = [];
  for (const a of args) {
    if (a.startsWith('--')) flags.add(a);
    else positional.push(a);
  }
  const LOCAL = flags.has('--local');

  const username = positional[0];
  const role = positional[1];

  if (!username || !role) usage();
  if (!USERNAME_RE.test(username)) {
    console.error('[ERROR] username 必须 3-32 位，仅限字母/数字/下划线');
    process.exit(1);
  }
  if (!VALID_ROLES.has(role)) {
    console.error('[ERROR] role 必须是：' + [...VALID_ROLES].join(' / '));
    process.exit(1);
  }
  if (role === 'super_admin') {
    console.error('[WARN] 你正在创建 super_admin。建议先创建 admin，需要时再手动升级。');
  }

  const pwd1 = await readPasswordHidden('请输入密码（不回显）：');
  const policyErr = checkPasswordPolicy(pwd1);
  if (policyErr) {
    console.error('[ERROR] ' + policyErr);
    process.exit(1);
  }
  const pwd2 = await readPasswordHidden('请再次确认密码：');
  if (pwd1 !== pwd2) {
    console.error('[ERROR] 两次输入不一致');
    process.exit(1);
  }

  const hash = await hashPassword(pwd1);

  // SQL 写入 0600 权限临时文件，绝不打印到终端
  const tmpFile = path.join(os.tmpdir(), `apex-admin-${crypto.randomUUID()}.sql`);
  const sql = `INSERT INTO admin_users (username, password_hash, role, status) VALUES (${sqlEscape(username)}, ${sqlEscape(hash)}, ${sqlEscape(role)}, 'active');\n`;

  try {
    fs.writeFileSync(tmpFile, sql, { mode: 0o600 });
    console.log('');
    console.log('[OK] 密码已哈希，SQL 已写入临时文件（权限 0600）');

    const ok = runWranglerExecute(tmpFile, LOCAL);
    if (!ok) {
      console.error('[ERROR] wrangler 执行失败，SQL 未生效');
      process.exit(1);
    }
    console.log('');
    console.log('[OK] 管理员已创建：' + username + ' (' + role + ')');
    console.log('     环境：' + (LOCAL ? 'local' : 'remote'));
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
})().catch((e) => { console.error('[FATAL]', e); process.exit(1); });
