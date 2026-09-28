// 密码长度检查回归测试
// 防止有人误删 password_length_invalid 检查（PBKDF2 DoS 防护）
'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;

function check(name, cond) {
  if (cond) { console.log('  ✓ ' + name); pass++; }
  else { console.log('  ✗ ' + name); fail++; }
}

console.log('🧪 密码长度检查回归测试');
console.log('');

const files = [
  'functions/api/register.js',
  'functions/api/login.js',
  'functions/api/reset-password.js',
  'functions/api/delete-account.js',
  'functions/api/admin/login.js',
];

for (const f of files) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) {
    check(f + ' 存在', false);
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  check(f + ' 含 password_length_invalid', content.includes('password_length_invalid'));
  check(f + ' 长度上限为 256', content.includes('1-256'));
}

console.log('');
console.log('📊 ' + pass + ' 通过 / ' + fail + ' 失败');
if (fail > 0) process.exit(1);
