#!/usr/bin/env node
// 零依赖 JSON Schema 极简校验器
// 覆盖: $ref type required additionalProperties properties patternProperties
//       enum minimum maximum exclusiveMinimum exclusiveMaximum
//       minLength maxLength minItems maxItems minProperties items oneOf pattern
// 用法: node scripts/validate-config.mjs [configPath] [schemaPath]
//      默认: config/game.json  config/schema.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const configPath = args[0] || path.join(ROOT, 'config/game.json');
const schemaPath = args[1] || path.join(ROOT, 'config/schema.json');

function loadJson(p, label) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('[FATAL] ' + label + ' 读取失败: ' + p);
    console.error('        ' + e.message);
    process.exit(2);
  }
}

function resolveRef(root, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  let cur = root;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[p];
  }
  return cur;
}

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}

function typeMatches(v, expected) {
  const actual = typeOf(v);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  if (expected === 'integer') return actual === 'integer';
  return actual === expected;
}

const errors = [];

function addError(p, msg) {
  errors.push({ path: p || '/', message: msg });
}

function walk(data, schema, root, p) {
  if (!schema) return;

  if (schema.$ref) {
    const target = resolveRef(root, schema.$ref);
    if (!target) { addError(p, '无法解析 $ref: ' + schema.$ref); return grew; }
    walk(data, target, root, p);
    return;
  }

  if (schema.oneOf) {
    let pass = 0;
    for (const sub of schema.oneOf) {
      const before = errors.length;
      walk(data, sub, root, p);
      const grew = errors.length > before;
      if (!grew) pass++;
      while (errors.length > before) errors.pop();
    }
    if (pass !== 1) addError(p, 'oneOf 应恰好匹配 1 项, 实际 ' + pass);
    return;
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const ok = allowed.some(t => typeMatches(data, t));
    if (!ok) {
      addError(p, '类型应为 ' + allowed.join('|') + ', 实际 ' + typeOf(data));
      return;
    }
  }

  if (typeof data === 'string') {
    if (schema.minLength != null && data.length < schema.minLength)
      addError(p, '字符串长度 < ' + schema.minLength);
    if (schema.maxLength != null && data.length > schema.maxLength)
      addError(p, '字符串长度 > ' + schema.maxLength);
    if (schema.pattern && !(new RegExp(schema.pattern).test(data)))
      addError(p, '不匹配 pattern: ' + schema.pattern);
    if (schema.enum && !schema.enum.includes(data))
      addError(p, '值不在 enum: ' + JSON.stringify(schema.enum));
  }

  if (typeof data === 'number') {
    if (schema.minimum != null && data < schema.minimum)
      addError(p, '值 < minimum(' + schema.minimum + ')');
    if (schema.maximum != null && data > schema.maximum)
      addError(p, '值 > maximum(' + schema.maximum + ')');
    if (schema.exclusiveMinimum != null && data <= schema.exclusiveMinimum)
      addError(p, '值 <= exclusiveMinimum(' + schema.exclusiveMinimum + ')');
    if (schema.exclusiveMaximum != null && data >= schema.exclusiveMaximum)
      addError(p, '值 >= exclusiveMaximum(' + schema.exclusiveMaximum + ')');
  }

  if (Array.isArray(data)) {
    if (schema.minItems != null && data.length < schema.minItems)
      addError(p, '数组长度 < ' + schema.minItems);
    if (schema.maxItems != null && data.length > schema.maxItems)
      addError(p, '数组长度 > ' + schema.maxItems);
    if (schema.items) {
      data.forEach((item, i) => walk(item, schema.items, root, p + '/' + i));
    }
  }

  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);

    if (schema.minProperties != null && keys.length < schema.minProperties)
      addError(p, '属性数 < ' + schema.minProperties);

    if (schema.required) {
      for (const k of schema.required) {
        if (!(k in data)) addError(p, '缺少必填字段: ' + k);
      }
    }

    if (schema.properties) {
      for (const k of keys) {
        if (schema.properties[k]) {
          walk(data[k], schema.properties[k], root, p + '/' + k);
        }
      }
    }

    if (schema.patternProperties) {
      for (const k of keys) {
        for (const pat of Object.keys(schema.patternProperties)) {
          if (new RegExp(pat).test(k)) {
            walk(data[k], schema.patternProperties[pat], root, p + '/' + k);
          }
        }
      }
    }

    if (schema.additionalProperties === false) {
      const allowed = new Set();
      if (schema.properties) Object.keys(schema.properties).forEach(k => allowed.add(k));
      const patterns = schema.patternProperties ? Object.keys(schema.patternProperties) : [];
      for (const k of keys) {
        if (allowed.has(k)) continue;
        if (patterns.some(pat => new RegExp(pat).test(k))) continue;
        addError(p, '不允许的额外字段: ' + k);
      }
    }
  }
}

// ── 主流程 ──
const schema = loadJson(schemaPath, 'schema');
const config = loadJson(configPath, 'config');

walk(config, schema, schema, '');

if (errors.length === 0) {
  console.log('[VALID] ' + path.relative(ROOT, configPath) + ' 通过 ' + path.relative(ROOT, schemaPath));
  process.exit(0);
} else {
  console.log('[INVALID] 共 ' + errors.length + ' 处错误:');
  for (const e of errors) console.log('  ' + e.path + '  ' + e.message);
  process.exit(1);
}
