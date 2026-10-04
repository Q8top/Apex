// @ts-check
/* Apex · Olympus 主控
 * 职责：
 *   - 装配所有模块（state / spin / stage / audio / UI）
 *   - 处理一次 Spin：请求 → 播放 → 结算 → BigWin
 *   - 处理 FS 播放
 *   - 处理 Auto Spin / 生命周期 / 错误恢复
 * 规则：
 *   - 数学由服务端权威（Demo 也走 API）
 *   - 所有异步检查 spinToken
 *   - 服务端失败：不改余额 / 不播 BigWin / 停 Auto
 */

import { MODE, PHASE, TIMING } from '../../shared/constants.js';
import { formatMoney, formatMoneyShort } from '../../shared/money.js';
import { logger } from '../../shared/logger.js';
import { eventBus } from '../../core/EventBus.js';
import { SpinController } from '../../core/SpinController.js';
import { GameState } from '../../core/GameState.js';
import { LifecycleManager } from '../../core/LifecycleManager.js';
import { StageRenderer } from '../../render/StageRenderer.js';
import { WinPresentation } from '../../animation/WinPresentation.js';
import { BigWinPresentation } from '../../animation/BigWinPresentation.js';
import { FreeSpinPresentation } from '../../animation/FreeSpinPresentation.js';
import { audioManager } from '../../audio/AudioManager.js';
import { toast } from '../../ui/Toast.js';
import { Header } from '../../ui/Header.js';
import { Balance } from '../../ui/Balance.js';
import { BetControl } from '../../ui/BetControl.js';
import { SpinButton } from '../../ui/SpinButton.js';
import { bottomSheet } from '../../ui/BottomSheet.js';
import { modal } from '../../ui/Modal.js';
import { apiRequest } from '../../shared/network.js';

import {
  GAME_ID, GAME_NAME, API, BET_STEPS, DEFAULT_BET_INDEX,
  DEMO_INITIAL_BALANCE, BIGWIN_LEVELS, DETAIL_URL
} from './config.js';

export class OlympusController {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.stageRoot
   * @param {HTMLElement} opts.headerRoot
   * @param {HTMLElement} opts.balanceEl
   * @param {HTMLElement} opts.betDisplayEl
   * @param {HTMLElement} opts.winEl
   * @param {HTMLElement} opts.winAmountEl
   * @param {HTMLElement} opts.betMinusBtn
   * @param {HTMLElement} opts.betPlusBtn
   * @param {HTMLElement} opts.betValueEl
   * @param {HTMLElement} opts.spinBtn
   * @param {HTMLElement} opts.fsBannerEl
   * @param {HTMLElement} opts.fsCountLeftEl
   * @param {HTMLElement} opts.fsCountTotalEl
   * @param {HTMLElement} opts.fsSummaryEl
   * @param {HTMLElement} opts.fsSummaryAmountEl
   * @param {HTMLElement} opts.bigwinOverlayEl
   * @param {HTMLElement} opts.bigwinTitleEl
   * @param {HTMLElement} opts.bigwinAmountEl
   * @param {string} [opts.mode]
   */
  constructor(opts) {
    this._opts = opts;
    this._mode = opts.mode === MODE.REAL ? MODE.REAL : MODE.DEMO;
    this._built = false;

    /** @type {GameState|null} */
    this.state = null;
    /** @type {StageRenderer|null} */
    this.stage = null;
    /** @type {SpinController|null} */
    this.spin = null;
    /** @type {LifecycleManager|null} */
    this.lifecycle = null;
    /** @type {Header|null} */
    this.header = null;
    /** @type {Balance|null} */
    this.balance = null;
    /** @type {BetControl|null} */
    this.betControl = null;
    /** @type {SpinButton|null} */
    this.spinButton = null;
    /** @type {WinPresentation|null} */
    this.winPresenter = null;
    /** @type {BigWinPresentation|null} */
    this.bigWinPresenter = null;
    /** @type {FreeSpinPresentation|null} */
    this.fsPresenter = null;

    this._autoRunning = false;
    this._autoTimer = 0;
    this._destroyed = false;
  }

  /** 初始化所有模块 */
  build() {
    if (this._built) return;
    const o = this._opts;

    // State
    this.state = new GameState({
      mode: this._mode,
      bet: BET_STEPS[DEFAULT_BET_INDEX],
      balance: this._mode === MODE.DEMO ? DEMO_INITIAL_BALANCE : 0,
      phase: PHASE.LOADING
    });

    // 舞台
    this.stage = new StageRenderer(o.stageRoot);
    this.stage.mount();

    // Header
    this.header = new Header({
      root: o.headerRoot,
      gameName: GAME_NAME,
      backHref: DETAIL_URL,
      onMenu: () => this._openMenu(),
      onBack: () => this._onBack()
    });
    this.header.mount();
    this.header.setMode(this._mode);

    // Balance
    this.balance = new Balance({
      balanceEl: o.balanceEl,
      betEl: o.betDisplayEl,
      winEl: o.winEl
    });
    this.balance.setBalance(this.state.get('balance'));
    this.balance.setBet(this.state.get('bet'));
    this.balance.setWin(0);

    // BetControl
    this.betControl = new BetControl({
      minusBtn: o.betMinusBtn,
      plusBtn: o.betPlusBtn,
      valueEl: o.betValueEl,
      steps: BET_STEPS,
      initialIndex: DEFAULT_BET_INDEX,
      onChange: (bet) => this._onBetChange(bet),
      onClick: () => audioManager.play('click')
    });
    this.betControl.bind();

    // SpinButton
    this.spinButton = new SpinButton({
      root: o.spinBtn,
      onClick: () => this._onSpinTap()
    });
    this.spinButton.bind();

    // Win 播放
    this.winPresenter = new WinPresentation({
      stage: this.stage,
      winAmountEl: o.winAmountEl,
      formatter: function (v) { return formatMoneyShort(Math.round(v * 100)); },
      playSfx: function (name, arg) { audioManager.play(name, arg); }
    });

    // BigWin
    this.bigWinPresenter = new BigWinPresentation({
      overlay: o.bigwinOverlayEl,
      titleEl: o.bigwinTitleEl,
      amountEl: o.bigwinAmountEl,
      formatter: function (v) { return formatMoney(Math.round(v * 100)); },
      playSfx: function (name, arg) { audioManager.play(name, arg); },
      stage: this.stage,
      levels: BIGWIN_LEVELS
    });

    // FS
    this.fsPresenter = new FreeSpinPresentation({
      stage: this.stage,
      bannerEl: o.fsBannerEl,
      countLeftEl: o.fsCountLeftEl,
      countTotalEl: o.fsCountTotalEl,
      summaryEl: o.fsSummaryEl,
      summaryAmountEl: o.fsSummaryAmountEl,
      winPresenter: this.winPresenter,
      formatter: function (v) { return formatMoney(Math.round(v * 100)); },
      playSfx: function (name, arg) { audioManager.play(name, arg); }
    });

    // SpinController
    this.spin = new SpinController({
      canSpin: () => this._canSpin(),
      requestResult: () => this._requestResult(),
      present: (result, token) => this._present(result, token),
      settle: (result) => this._settle(result)
    });

    // Audio
    audioManager.bindLifecycle();
    audioManager.bindGlobalUnlock();

    // Lifecycle
    this.lifecycle = new LifecycleManager();
    this.lifecycle.start();
    eventBus.on('lifecycle:background', () => this._onBackground());
    eventBus.on('lifecycle:foreground', () => this._onForeground());

    // 渲染初始网格（无中奖，纯视觉）
    this.stage.setGrid(makeInitialGrid());

    // 就绪
    this.state.set('ready', true);
    this.state.set('phase', PHASE.IDLE);
    this.spinButton.setState('idle');

    // Real 模式：拉取余额
    if (this._mode === MODE.REAL) {
      this._refreshRealBalance();
    }

    this._built = true;
    logger.info('OlympusController built · mode=' + this._mode);
  }

  // ── 主流程 ──

  _canSpin() {
    if (!this.state || !this.spinButton) return false;
    if (this.state.get('spinning')) return false;
    if (this.state.get('phase') !== PHASE.IDLE) return false;
    if (this.state.get('balance') < this.state.get('bet')) return false;
    return true;
  }

  _onSpinTap() {
    if (this.spinButton.isSpinning()) {
      // Auto 运行中：点击停止
      if (this._autoRunning) this._stopAuto();
      return;
    }
    audioManager.unlock();
    audioManager.play('click');
    this._doSpin();
  }

  async _doSpin() {
    if (!this._canSpin()) return;

    // 重置本轮
    this.state.resetRound();
    this.winPresenter.reset();
    this.balance.setWin(0);
    this.state.set('phase', PHASE.SPINNING);
    this.spinButton.setState('spinning');
    this.betControl.setLocked(true);

    audioManager.play('spinStart');

    await this.spin.doSpin();

    // 完成后回到 IDLE
    if (this._destroyed) return;
    this.state.set('phase', PHASE.IDLE);
    this.state.set('spinning', false);
    this.betControl.setLocked(false);

    if (this._autoRunning) {
      // 检查错误：若刚失败则停止 Auto
      this._scheduleAuto();
    } else {
      this.spinButton.setState('idle');
    }
  }

  async _requestResult() {
    const bet = this.state.get('bet');
    const betMajor = bet / 100; // API 用主单位
    const endpoint = this._mode === MODE.REAL ? API.SPIN_REAL : API.SPIN_DEMO;

    const res = await apiRequest('POST', endpoint, { bet: betMajor }, { timeout: 12000, retry: 1 });
    if (!res.ok || !res.data || res.data.success !== true || !res.data.result) {
      logger.warn('spin request failed', res.error || 'invalid');
      eventBus.emit('spin:error', { reason: res.code || 'api_error' });
      return null;
    }
    return res.data;
  }

  async _present(data, token) {
    if (!this.spin.isTokenValid(token)) return;
    const result = data.result;
    const initialGrid = result.initialGrid;

    // Reel 滚动
    await this.stage.playSpin(initialGrid);
    if (!this.spin.isTokenValid(token)) return;

    // 逐 tumble 播放
    const tumbles = result.tumbles || [];
    for (let i = 0; i < tumbles.length; i++) {
      if (!this.spin.isTokenValid(token)) return;
      const t = tumbles[i];
      const nextGrid = (i + 1 < tumbles.length) ? tumbles[i + 1].grid : null;
      await this.winPresenter.play({
        wins: t.wins || [],
        roundWin: t.roundWin || 0,
        grid: t.grid,
        nextGrid: nextGrid,
        tumbleIndex: i
      });
    }

    // FS 播放
    if (result.freeSpins && result.freeSpins.rounds && result.freeSpins.rounds.length > 0) {
      if (!this.spin.isTokenValid(token)) return;
      this.state.updateFS({
        active: true,
        awarded: result.freeSpins.awarded,
        remaining: result.freeSpins.awarded,
        multiplier: 0,
        totalWin: 0
      });
      await this.fsPresenter.play(result.freeSpins);
      this.state.updateFS({ active: false, remaining: 0 });
    }
  }

  async _settle(data) {
    const result = data.result;
    const totalWin = Number(data.totalWin) || 0; // 主单位
    const bet = this.state.get('bet');
    const totalWinMinor = Math.round(totalWin * 100);

    if (this._mode === MODE.REAL) {
      // Real：以服务端 balanceAfter 为准
      if (typeof data.balanceAfter === 'number') {
        this.state.setBalance(Math.round(data.balanceAfter * 100));
        this.balance.setBalance(this.state.get('balance'));
      }
    } else {
      // Demo：服务端返回的 totalWin 也要累加到本地余额
      const newBal = this.state.get('balance') - bet + totalWinMinor;
      this.state.setBalance(newBal);
      this.balance.setBalance(newBal);
    }

    this.state.set('lastWin', totalWinMinor);
    this.state.set('currentWin', totalWinMinor);
    this.balance.setWin(totalWinMinor);

    // 大奖播放（仅当确实有赢 + 服务端已确认）
    if (totalWinMinor > 0) {
      const betMajor = bet / 100;
      const level = this.bigWinPresenter.classify(betMajor > 0 ? (totalWin / betMajor) : 0);
      if (level !== 'NONE') {
        await this.bigWinPresenter.play(totalWin, betMajor);
      } else {
        audioManager.play('winMedium');
      }
    }
  }

  _onBetChange(bet) {
    this.state.set('bet', bet);
    this.balance.setBet(bet);
  }

  // ── Auto ──

  _scheduleAuto() {
    if (!this._autoRunning) return;
    if (this._autoTimer) clearTimeout(this._autoTimer);
    const self = this;
    this._autoTimer = window.setTimeout(function () {
      if (!self._autoRunning) return;
      if (!self._canSpin()) {
        self._stopAuto();
        return;
      }
      self._doSpin();
    }, TIMING.AUTO_DELAY);
  }

  startAuto() {
    if (this._autoRunning) return;
    this._autoRunning = true;
    this.spinButton.setState('auto');
    toast.info('自动旋转已开启');
    if (!this.state.get('spinning')) this._doSpin();
  }

  _stopAuto() {
    this._autoRunning = false;
    if (this._autoTimer) { clearTimeout(this._autoTimer); this._autoTimer = 0; }
    if (!this.state.get('spinning')) this.spinButton.setState('idle');
    toast.info('自动旋转已停止');
  }

  // ── 生命周期 ──

  _onBackground() {
    if (this._autoRunning) {
      this._autoRunning = false;
      if (this._autoTimer) { clearTimeout(this._autoTimer); this._autoTimer = 0; }
      logger.debug('auto paused (background)');
    }
  }

  _onForeground() {
    if (this.state && this.state.get('ready')) {
      this.stage.grid && this.stage.grid.refresh();
    }
  }

  _onBack() {
    this._stopAuto();
    this.stage.cancelAll();
    if (this.spin) this.spin.cancel();
    audioManager.play('click');
    window.location.href = DETAIL_URL;
  }

  // ── 菜单 ──

  _openMenu() {
    audioManager.play('click');
    const self = this;
    const body = document.createElement('div');
    body.innerHTML = ''
      + '<button type="button" class="ax-sheet-item" data-act="auto">自动旋转</button>'
      + '<button type="button" class="ax-sheet-item" data-act="history">游戏记录</button>'
      + '<button type="button" class="ax-sheet-item" data-act="paytable">赔付表</button>'
      + '<button type="button" class="ax-sheet-item" data-act="reset">重置余额</button>'
      + '<button type="button" class="ax-sheet-item" data-act="help">游戏说明</button>';
    body.addEventListener('click', function (e) {
      const btn = /** @type {HTMLElement} */ (e.target).closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      bottomSheet.close();
      if (act === 'auto') { self.startAuto(); }
      else if (act === 'history') { toast.info('记录功能即将上线'); }
      else if (act === 'paytable') { window.location.href = DETAIL_URL; }
      else if (act === 'reset') { self._confirmReset(); }
      else if (act === 'help') { window.location.href = DETAIL_URL; }
    });
    bottomSheet.open({ title: '菜单', body: body });
  }

  async _confirmReset() {
    if (this._mode === MODE.REAL) {
      toast.info('充值功能即将上线');
      return;
    }
    const r = await modal.show({
      title: '重置余额',
      body: '将余额恢复到 ¥1,000.00？',
      buttons: [
        { label: '取消', value: false },
        { label: '确定', value: true, primary: true }
      ]
    });
    if (r) {
      this.state.setBalance(DEMO_INITIAL_BALANCE);
      this.balance.setBalance(DEMO_INITIAL_BALANCE);
      toast.success('余额已重置');
    }
  }

  async _refreshRealBalance() {
    const res = await apiRequest('GET', API.ME, null, { timeout: 10000 });
    if (res.ok && res.data && res.data.user && typeof res.data.user.walletBalance === 'number') {
      const minor = Math.round(res.data.user.walletBalance * 100);
      this.state.setBalance(minor);
      this.balance.setBalance(minor);
    } else {
      logger.warn('refresh real balance failed');
      toast.error('余额加载失败');
    }
  }

  // ── 销毁 ──

  destroy() {
    this._destroyed = true;
    this._stopAuto();
    if (this.lifecycle) this.lifecycle.stop();
    if (this.spin) this.spin.cancel();
    if (this.stage) this.stage.destroy();
    if (this.winPresenter) this.winPresenter.cancel();
    if (this.bigWinPresenter) this.bigWinPresenter.cancel();
    if (this.fsPresenter) this.fsPresenter.cancel();
  }
}

/* 初始网格：无中奖的静态展示 */
function makeInitialGrid() {
  const SYMS = ['GEM_BLUE', 'GEM_GREEN', 'GEM_PURPLE', 'GEM_RED', 'CHALICE', 'RING', 'HOURGLASS', 'CROWN'];
  const grid = [];
  for (let c = 0; c < 6; c++) {
    const col = [];
    for (let r = 0; r < 5; r++) {
      col.push(SYMS[(c * 5 + r * 3) % SYMS.length]);
    }
    grid.push(col);
  }
  return grid;
}
