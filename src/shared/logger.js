// @ts-check
/* Apex · 日志
 * 生产环境静默 debug；不输出敏感数据（余额 / token / 交易）
 */

const PREFIX = '[Apex]';
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

/** 当前日志等级：URL 参数 ?debug=1 开启 debug */
const currentLevel = (function () {
  if (typeof location === 'undefined') return LEVELS.warn;
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('debug') === '1') return LEVELS.debug;
  } catch (_) {}
  return LEVELS.warn;
})();

function should(level) {
  return LEVELS[level] >= currentLevel;
}

function fmt(level, args) {
  return [PREFIX + '[' + level + ']'].concat(Array.from(args));
}

export const logger = {
  debug(/** @type {any[]} */ ...args) {
    if (should('debug')) console.log.apply(console, fmt('debug', args));
  },
  info(/** @type {any[]} */ ...args) {
    if (should('info')) console.info.apply(console, fmt('info', args));
  },
  warn(/** @type {any[]} */ ...args) {
    if (should('warn')) console.warn.apply(console, fmt('warn', args));
  },
  error(/** @type {any[]} */ ...args) {
    if (should('error')) console.error.apply(console, fmt('error', args));
  }
};
