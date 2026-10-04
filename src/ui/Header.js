// @ts-check
/* Apex · 顶栏
 * 职责：返回 / 游戏名 + 模式徽章 / 音效 / 菜单
 * 规则：不处理业务逻辑，事件通过回调暴露
 */

import { MODE } from '../shared/constants.js';
import { audioManager } from '../audio/AudioManager.js';

export class Header {
  /**
   * @param {Object} deps
   * @param {HTMLElement} deps.root        顶栏容器
   * @param {string} deps.gameName
   * @param {string} deps.backHref         返回链接
   * @param {() => void} [deps.onMenu]
   * @param {() => void} [deps.onBack]
   */
  constructor(deps) {
    if (!deps || !deps.root) throw new Error('Header: root required');
    this._root = deps.root;
    this._gameName = deps.gameName || '游戏';
    this._backHref = deps.backHref || '/';
    this._onMenu = deps.onMenu || function () {};
    this._onBack = deps.onBack || null;
    this._mounted = false;
    this._mode = MODE.DEMO;
  }

  /** 挂载 */
  mount() {
    if (this._mounted) return;
    const root = this._root;
    root.classList.add('ax-header');
    root.innerHTML = '';

    const back = document.createElement('a');
    back.className = 'ax-header-btn';
    back.href = this._backHref;
    back.setAttribute('aria-label', '返回');
    back.innerHTML = svgBack();
    root.appendChild(back);

    const mid = document.createElement('div');
    mid.className = 'ax-header-mid';
    const title = document.createElement('div');
    title.className = 'ax-header-title';
    title.textContent = this._gameName;
    const badge = document.createElement('span');
    badge.className = 'ax-header-badge';
    badge.textContent = '试玩模式';
    mid.appendChild(title);
    mid.appendChild(badge);
    root.appendChild(mid);

    const sound = document.createElement('button');
    sound.type = 'button';
    sound.className = 'ax-header-btn';
    sound.setAttribute('aria-label', '音效');
    sound.innerHTML = svgSoundOn();
    root.appendChild(sound);

    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'ax-header-btn';
    menu.setAttribute('aria-label', '菜单');
    menu.innerHTML = svgMenu();
    root.appendChild(menu);

    this._badge = badge;
    this._soundBtn = sound;

    // 事件
    const self = this;
    back.addEventListener('click', function (e) {
      if (self._onBack) {
        e.preventDefault();
        self._onBack();
      }
    });
    sound.addEventListener('click', function () {
      const muted = audioManager.toggleMute();
      self._renderSoundIcon(!muted);
    });
    menu.addEventListener('click', function () {
      self._onMenu();
    });

    this._renderSoundIcon(!audioManager.isMuted());
    this._mounted = true;
  }

  /** 切换模式 */
  setMode(mode) {
    this._mode = mode;
    if (!this._badge) return;
    if (mode === MODE.REAL) {
      this._badge.textContent = '游戏模式';
      this._badge.classList.add('is-real');
    } else {
      this._badge.textContent = '试玩模式';
      this._badge.classList.remove('is-real');
    }
  }

  /** 更新游戏名 */
  setGameName(name) {
    this._gameName = name;
    const t = this._root.querySelector('.ax-header-title');
    if (t) t.textContent = name;
  }

  _renderSoundIcon(on) {
    if (!this._soundBtn) return;
    this._soundBtn.innerHTML = on ? svgSoundOn() : svgSoundOff();
  }
}

function svgBack() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
}
function svgSoundOn() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a9 9 0 010 14"/></svg>';
}
function svgSoundOff() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
}
function svgMenu() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
}
