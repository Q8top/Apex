/* ============================================================
 * Apex Olympius · play-boot.js
 * ------------------------------------------------------------
 * 唯一组装点：GameEngine + RenderPlayer + AnimationTimeline
 *             + Renderer + SymbolRenderer + GridRenderer。
 *
 * 约束：
 *   - 不出现 Math.random / eval / new Function（注释外）
 *   - 不订阅 EventBus（Phase 2 仍只需 res.result.totalWin）
 *   - onFrame 已挂 GridRenderer（6×5 静态渲染）
 *   - Node 环境下 import 不炸（document 守卫）
 * ============================================================ */

import { GameEngine } from '../game/core/GameEngine.js';
import { AnimationTimeline } from '../game/render/AnimationTimeline.js';
import { Renderer } from '../game/render/Renderer.js';
import { RenderPlayer } from '../game/render/RenderPlayer.js';
import { SymbolRenderer } from '../game/render/SymbolRenderer.js';
import { GridRenderer } from '../game/render/GridRenderer.js';

const DEFAULT_BALANCE = 10000;
const DEFAULT_BET = 10;

function readMode() {
  try {
    const p = new URLSearchParams(window.location.search);
    const m = p.get('mode');
    if (m === 'real' || m === 'demo') return m;
  } catch (e) { /* ignore */ }
  return 'demo';
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function boot() {
  const canvas = document.getElementById('olympius-stage');
  const spinBtn = document.getElementById('oly-spin');
  const balanceEl = document.getElementById('oly-balance');
  const betEl = document.getElementById('oly-bet');
  const winEl = document.getElementById('oly-win');

  if (!canvas || !spinBtn) {
    console.error('[Olympius] play-boot: 必需元素缺失');
    return;
  }

  const mode = readMode();
  const bet = DEFAULT_BET;
  let balance = DEFAULT_BALANCE;

  const timeline = new AnimationTimeline();
  const player = new RenderPlayer({ timeline, debug: false });
  const symbolRenderer = new SymbolRenderer({ debug: false });
  const gridRenderer = new GridRenderer({
    player, symbolRenderer, timeline, debug: false,
  });

  const renderer = new Renderer({
    canvas,
    timeline,
    debug: false,
    onFrame: (dt, ctx, w, h) => {
      gridRenderer.render(ctx, w, h);
    },
  }).init();
  renderer.start();

  const engine = new GameEngine({ mode, bet, player, debug: false });

  function updateHUD() {
    if (balanceEl) balanceEl.textContent = fmt(balance);
    if (betEl) betEl.textContent = fmt(bet);
  }
  updateHUD();

  let spinning = false;

  async function doSpin() {
    if (spinning) return;
    if (typeof engine.isLocked === 'function' && engine.isLocked()) return;

    spinning = true;
    spinBtn.disabled = true;
    spinBtn.setAttribute('aria-busy', 'true');
    if (winEl) winEl.textContent = '0';

    try {
      player.resetVisualState();
      const res = await engine.play();

      if (res && res.ok && res.result) {
        const winAmt = res.result.totalWin || 0;
        balance = balance - bet + winAmt;
        if (winEl) winEl.textContent = fmt(winAmt);
        updateHUD();
      } else if (res && res.ok === false) {
        console.warn('[Olympius] play rejected:', res.reason);
      }
    } catch (e) {
      console.error('[Olympius] spin error:', e);
    } finally {
      spinning = false;
      spinBtn.disabled = false;
      spinBtn.removeAttribute('aria-busy');
    }
  }

  spinBtn.addEventListener('click', doSpin);

  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (document.activeElement === spinBtn) return;
    if (spinning) return;
    e.preventDefault();
    doSpin();
  });

  if (typeof window !== 'undefined') {
    window.__OLY__ = { engine, renderer, player, timeline, symbolRenderer, gridRenderer };
  }

  console.info('[Olympius] boot OK · mode=' + mode + ' bet=' + bet);

  /* 首屏自动展示一次（仅 demo 模式，便于视觉验收） */
  if (mode === 'demo') setTimeout(doSpin, 300);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

export { boot, readMode, DEFAULT_BALANCE, DEFAULT_BET };
