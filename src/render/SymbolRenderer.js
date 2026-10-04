// @ts-check
/* Apex · 符号渲染器
 * 职责：符号 id → DOM 元素
 * 状态：idle / landing / winning / dimmed / removing / respawning / special / multiplier
 * 规则：
 *   - 只做视觉，不参与数学
 *   - 每个符号只创建一次 DOM，通过 class 切换状态
 *   - 支持 Object Pool（同 id 复用节点）
 */

import { logger } from '../shared/logger.js';

/** 默认符号资源路径（游戏可覆盖） */
const DEFAULT_SYMBOL_BASE = '/assets/games/symbols/';

/**
 * 符号 id → 文件名
 * 例：GEM_BLUE → gem-blue.svg
 * @param {string} id
 * @returns {string}
 */
function idToFile(id) {
  return String(id || '').toLowerCase().replace(/_/g, '-') + '.svg';
}

export class SymbolRenderer {
  /**
   * @param {Object} [opts]
   * @param {string} [opts.basePath]
   * @param {Record<string, string>} [opts.customMap] 覆盖默认映射
   */
  constructor(opts) {
    this._base = (opts && opts.basePath) || DEFAULT_SYMBOL_BASE;
    this._map = (opts && opts.customMap) || null;
    /** @type {Map<string, string>} id → url */
    this._urlCache = new Map();
  }

  /**
   * 获取符号 URL
   * @param {string} id
   * @returns {string}
   */
  getUrl(id) {
    if (this._map && this._map[id]) return this._map[id];
    if (this._urlCache.has(id)) return /** @type {string} */ (this._urlCache.get(id));
    const url = this._base + idToFile(id);
    this._urlCache.set(id, url);
    return url;
  }

  /**
   * 创建符号 DOM（空闲态）
   * @param {string} id
   * @returns {HTMLElement}
   */
  create(id) {
    const el = document.createElement('div');
    el.className = 'ax-symbol';
    el.setAttribute('data-symbol', id);

    const img = document.createElement('img');
    img.src = this.getUrl(id);
    img.alt = '';
    img.draggable = false;
    img.loading = 'eager';
    img.decoding = 'async';

    // 图片加载失败兜底
    img.addEventListener('error', function () {
      el.classList.add('is-error');
    }, { once: true });

    el.appendChild(img);
    return el;
  }

  /**
   * 更新符号 id（复用节点时）
   * @param {HTMLElement} el
   * @param {string} id
   */
  update(el, id) {
    if (!el) return;
    const prev = el.getAttribute('data-symbol');
    if (prev === id) return;
    el.setAttribute('data-symbol', id);
    const img = el.querySelector('img');
    if (img) img.src = this.getUrl(id);
  }

  /**
   * 设置状态（清除其他状态，添加目标状态）
   * @param {HTMLElement} el
   * @param {'idle'|'landing'|'winning'|'dimmed'|'removing'|'respawning'|'special'|'multiplier'} state
   */
  setState(el, state) {
    if (!el) return;
    el.classList.remove(
      'is-idle', 'is-landing', 'is-winning', 'is-dimmed',
      'is-removing', 'is-respawning', 'is-special', 'is-multiplier'
    );
    el.classList.add('is-' + state);
  }

  /**
   * 清除所有状态
   * @param {HTMLElement} el
   */
  clearState(el) {
    if (!el) return;
    el.classList.remove(
      'is-idle', 'is-landing', 'is-winning', 'is-dimmed',
      'is-removing', 'is-respawning', 'is-special', 'is-multiplier'
    );
  }

  /**
   * 便捷：直接应用状态到多个节点
   * @param {HTMLElement[]} els
   * @param {string} state
   */
  setStateAll(els, state) {
    for (let i = 0; i < els.length; i++) this.setState(els[i], state);
  }

  /**
   * 预加载一组符号（用于首屏）
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  preload(ids) {
    const urls = ids.map((id) => this.getUrl(id));
    const promises = urls.map(function (url) {
      return new Promise(function (resolve) {
        const img = new Image();
        img.onload = img.onerror = function () { resolve(); };
        img.src = url;
      });
    });
    return Promise.all(promises).then(function () {
      logger.debug('symbols preloaded', ids.length);
    });
  }
}

/** 默认单例 */
export const symbolRenderer = new SymbolRenderer();
