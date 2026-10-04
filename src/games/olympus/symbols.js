// @ts-check
/* Apex · Olympus 符号定义
 * 用途：符号 id → 元数据 + 视觉资源路径
 * 说明：
 *   - 只放可公开信息（id / 显示名 / 层级 / 资源路径）
 *   - 权重 / 倍率属机密，不放这里
 */

/** 符号资源基础路径 */
const BASE = '/assets/games/symbols/';

/**
 * @typedef {Object} SymbolDef
 * @property {string} id         唯一标识
 * @property {string} name       显示名
 * @property {'low'|'mid'|'high'|'special'} tier
 * @property {string} file       相对基础路径的文件名
 */

/** @type {Record<string, SymbolDef>} */
export const SYMBOLS = {
  GEM_BLUE:   { id: 'GEM_BLUE',   name: '蓝宝石',  tier: 'low',     file: 'gem-blue.svg' },
  GEM_GREEN:  { id: 'GEM_GREEN',  name: '绿宝石',  tier: 'low',     file: 'gem-green.svg' },
  GEM_PURPLE: { id: 'GEM_PURPLE', name: '紫水晶',  tier: 'low',     file: 'gem-purple.svg' },
  GEM_RED:    { id: 'GEM_RED',    name: '红宝石',  tier: 'low',     file: 'gem-red.svg' },
  CHALICE:    { id: 'CHALICE',    name: '圣杯',    tier: 'mid',     file: 'chalice.svg' },
  RING:       { id: 'RING',       name: '金戒指',  tier: 'mid',     file: 'ring.svg' },
  HOURGLASS:  { id: 'HOURGLASS',  name: '沙漏',    tier: 'mid',     file: 'hourglass.svg' },
  CROWN:      { id: 'CROWN',      name: '金冠',    tier: 'high',    file: 'crown.svg' },
  SCATTER:    { id: 'SCATTER',    name: 'Scatter', tier: 'special', file: 'scatter.svg' },
  MULTIPLIER: { id: 'MULTIPLIER', name: '倍数球',  tier: 'special', file: 'multiplier.svg' }
};

/** 符号 ID 列表（用于遍历 / 预加载） */
export const SYMBOL_IDS = Object.keys(SYMBOLS);

/** 普通符号（参与中奖判定） */
export const PAY_SYMBOLS = SYMBOL_IDS.filter(function (id) {
  return id !== 'SCATTER' && id !== 'MULTIPLIER';
});

/** 特殊符号 */
export const SPECIAL_SYMBOLS = ['SCATTER', 'MULTIPLIER'];

/**
 * 符号 id → 完整 URL
 * @param {string} id
 * @returns {string}
 */
export function symbolUrl(id) {
  const def = SYMBOLS[id];
  return def ? BASE + def.file : '';
}

/**
 * 符号 id → 显示名
 * @param {string} id
 * @returns {string}
 */
export function symbolName(id) {
  const def = SYMBOLS[id];
  return def ? def.name : id;
}

/**
 * 构建自定义映射表（供 SymbolRenderer 用）
 * @returns {Record<string, string>}
 */
export function buildSymbolMap() {
  const map = {};
  for (let i = 0; i < SYMBOL_IDS.length; i++) {
    const id = SYMBOL_IDS[i];
    map[id] = symbolUrl(id);
  }
  return map;
}
