// @ts-check
/* Apex · Olympus 游戏页入口
 * 职责：
 *   - 等待 DOM
 *   - 解析 URL 参数 mode
 *   - 收集 DOM 引用
 *   - 启动 OlympusController
 *   - 全局错误捕获
 * 规则：
 *   - 不使用 inline script
 *   - 不使用 Math.random
 *   - 页面离开时 destroy
 */

import { MODE } from '../../shared/constants.js';
import { logger } from '../../shared/logger.js';
import { OlympusController } from './controller.js';

/** 是否已启动 */
let _controller = null;

/** DOM 辅助 */
function $(id) { return document.getElementById(id); }

/** 从 URL 读 mode */
function readMode() {
  try {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode');
    if (m === MODE.REAL) return MODE.REAL;
    return MODE.DEMO;
  } catch (_) {
    return MODE.DEMO;
  }
}

/** 检查必需 DOM */
function collectDom() {
  const refs = {
    stageRoot: $('ax-stage'),
    headerRoot: $('ax-header'),
    balanceEl: $('ax-balance'),
    betDisplayEl: $('ax-bet-display'),
    winEl: $('ax-total-win'),
    winAmountEl: $('ax-win-amount'),
    betMinusBtn: $('ax-bet-minus'),
    betPlusBtn: $('ax-bet-plus'),
    betValueEl: $('ax-bet-value'),
    spinBtn: $('ax-spin'),
    fsBannerEl: $('ax-fs-banner'),
    fsCountLeftEl: $('ax-fs-left'),
    fsCountTotalEl: $('ax-fs-total'),
    fsSummaryEl: $('ax-fs-summary'),
    fsSummaryAmountEl: $('ax-fs-amount'),
    bigwinOverlayEl: $('ax-bigwin'),
    bigwinTitleEl: $('ax-bigwin-title'),
    bigwinAmountEl: $('ax-bigwin-amount')
  };

  const required = [
    'stageRoot', 'headerRoot', 'balanceEl',
    'betMinusBtn', 'betPlusBtn', 'betValueEl', 'spinBtn',
    'fsBannerEl', 'fsCountLeftEl', 'fsCountTotalEl',
    'fsSummaryEl', 'fsSummaryAmountEl',
    'bigwinOverlayEl', 'bigwinTitleEl', 'bigwinAmountEl'
  ];

  const missing = required.filter(function (k) { return !refs[k]; });
  if (missing.length > 0) {
    throw new Error('缺少必需 DOM: ' + missing.join(', '));
  }
  return refs;
}

/** 显示致命错误 */
function fatal(msg) {
  logger.error('FATAL', msg);
  const root = document.body;
  const el = document.createElement('div');
  el.className = 'ax-fatal';
  el.textContent = msg;
  root.appendChild(el);
}

/** 启动 */
function boot() {
  try {
    const mode = readMode();
    const dom = collectDom();

    _controller = new OlympusController(Object.assign({ mode: mode }, dom));
    _controller.build();

    // 开发工具（生产也会挂，但只暴露控制器引用，不泄漏数学）
    /** @type {any} */ (window).__olympus = _controller;
    logger.info('Olympus 已启动');
  } catch (e) {
    fatal('游戏启动失败：' + (e && e.message ? e.message : '未知错误'));
  }
}

/** 全局错误 */
window.addEventListener('error', function (e) {
  logger.error('window.error', e && e.message);
});
window.addEventListener('unhandledrejection', function (e) {
  logger.error('unhandledrejection', e && e.reason);
});

/** 页面离开 */
window.addEventListener('beforeunload', function () {
  if (_controller) {
    try { _controller.destroy(); } catch (_) {}
  }
});

/** DOM ready → boot */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
