// @ts-check
/* Apex · 金额
 * 全部以最小单位（分）作为整数存储；展示时格式化
 */

import { MONEY_SCALE } from './constants.js';

/** 显示货币符号（未来可切换） */
const CURRENCY = '¥';

/**
 * 显示格式：1234567 → "¥12,345.67"
 * @param {number} minorUnits 最小单位（分）
 * @returns {string}
 */
export function formatMoney(minorUnits) {
  const v = Number(minorUnits) || 0;
  const major = v / MONEY_SCALE;
  const sign = major < 0 ? '-' : '';
  const abs = Math.abs(major);
  const parts = abs.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + CURRENCY + parts.join('.');
}

/**
 * 短格式：不带小数（用于小空间展示）
 * @param {number} minorUnits
 * @returns {string}
 */
export function formatMoneyShort(minorUnits) {
  const v = Number(minorUnits) || 0;
  return CURRENCY + Math.round(v / MONEY_SCALE).toLocaleString('en-US');
}

/**
 * 解析用户输入 / API 值 → 最小单位
 * @param {number|string} value
 * @returns {number}
 */
export function toMinor(value) {
  const n = Number(value) || 0;
  return Math.round(n * MONEY_SCALE);
}

/**
 * 从最小单位 → 主单位（浮点）
 * @param {number} minorUnits
 * @returns {number}
 */
export function toMajor(minorUnits) {
  return (Number(minorUnits) || 0) / MONEY_SCALE;
}
