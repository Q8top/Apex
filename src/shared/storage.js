// @ts-check
/* Apex · 本地存储
 * 容错：JSON parse 失败 / 禁用 / 配额满 / 损坏 → 静默降级
 */

import { logger } from './logger.js';

const NS = 'apex';

function fullKey(key) {
  return NS + '_' + key;
}

/**
 * 安全读取 JSON
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (e) {
    logger.warn('storage.readJSON failed', key, e && e.message);
    try { localStorage.removeItem(fullKey(key)); } catch (_) {}
    return fallback;
  }
}

/**
 * 安全写入 JSON
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function writeJSON(key, value) {
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch (e) {
    logger.warn('storage.writeJSON failed', key, e && e.message);
    return false;
  }
}

/**
 * 读取字符串
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
export function readString(key, fallback) {
  try {
    const v = localStorage.getItem(fullKey(key));
    return v === null ? fallback : v;
  } catch (_) {
    return fallback;
  }
}

/**
 * 写入字符串
 * @param {string} key
 * @param {string} value
 */
export function writeString(key, value) {
  try {
    localStorage.setItem(fullKey(key), String(value));
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 删除
 * @param {string} key
 */
export function remove(key) {
  try { localStorage.removeItem(fullKey(key)); } catch (_) {}
}

/**
 * 检查可用性（隐私模式 / 禁用）
 * @returns {boolean}
 */
export function isAvailable() {
  try {
    const k = '__apex_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (_) {
    return false;
  }
}

/** 预定义的键名（避免拼写错误） */
export const KEYS = {
  SOUND: 'sound_enabled',
  DEMO_STATE_PREFIX: 'demo_state_',
  FAVS: 'favs',
  HISTORY_PREFIX: 'history_',
  QUALITY: 'quality',
  TURBO: 'turbo'
};
