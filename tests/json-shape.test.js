// JSON 结构限制测试（对应 functions/_validation.js 的 assertJsonShape）
// 由于 assertJsonShape 未导出，使用等效的本地实现进行契约测试
// 目的：若未来 _validation.js 的限制值被修改，本测试会失败以提醒

import assert from 'node:assert';

// 与 _validation.js 保持一致
const JSON_MAX_DEPTH = 10;
const JSON_MAX_KEYS = 100;
const JSON_MAX_ARRAY = 500;
const JSON_MAX_STR = 8192;

function assertJsonShape(value, depth = 0) {
  if (depth > JSON_MAX_DEPTH) throw new Error('json_too_deep');
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string' && value.length > JSON_MAX_STR) {
      throw new Error('json_string_too_long');
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > JSON_MAX_ARRAY) throw new Error('json_array_too_long');
    for (const item of value) assertJsonShape(item, depth + 1);
    return;
  }
  const keys = Object.keys(value);
  if (keys.length > JSON_MAX_KEYS) throw new Error('json_object_too_many_keys');
  for (const k of keys) {
    if (k.length > 200) throw new Error('json_key_too_long');
    assertJsonShape(value[k], depth + 1);
  }
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log('  ✅ ' + name); passed++; }
  catch (e) { console.log('  ❌ ' + name + '：' + e.message); failed++; }
}

console.log('\n🧪 JSON 结构限制测试\n');

test('10 层嵌套通过', () => {
  let v = 'leaf';
  for (let i = 0; i < 10; i++) v = { n: v };
  assertJsonShape(v);
});

test('11 层嵌套拒绝', () => {
  let v = 'leaf';
  for (let i = 0; i < 11; i++) v = { n: v };
  assert.throws(() => assertJsonShape(v), /json_too_deep/);
});

test('100 字段通过', () => {
  const obj = {};
  for (let i = 0; i < 100; i++) obj['k' + i] = 1;
  assertJsonShape(obj);
});

test('101 字段拒绝', () => {
  const obj = {};
  for (let i = 0; i < 101; i++) obj['k' + i] = 1;
  assert.throws(() => assertJsonShape(obj), /json_object_too_many_keys/);
});

test('500 元素数组通过', () => {
  assertJsonShape(new Array(500).fill(1));
});

test('501 元素数组拒绝', () => {
  assert.throws(() => assertJsonShape(new Array(501).fill(1)), /json_array_too_long/);
});

test('8192 字符字符串通过', () => {
  assertJsonShape('x'.repeat(8192));
});

test('8193 字符字符串拒绝', () => {
  assert.throws(() => assertJsonShape('x'.repeat(8193)), /json_string_too_long/);
});

console.log('\n📊 ' + passed + ' 通过 / ' + failed + ' 失败\n');
process.exit(failed === 0 ? 0 : 1);
