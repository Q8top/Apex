// @ts-check
/* Apex · Spin 控制器
 * 目的：所有 Spin 唯一入口
 * 规则：
 *   - UI / Auto / FS / Debug 都必须通过 doSpin()
 *   - 每次 Spin 生成新 spinToken
 *   - 所有异步回调前检查 token
 *   - 严格锁定：spinning = true 时不允许再次进入
 */

import { logger } from '../shared/logger.js';
import { eventBus } from './EventBus.js';

export class SpinController {
  /**
   * @param {Object} deps
   * @param {() => boolean} deps.canSpin  能否 Spin（余额足够 + 状态 IDLE）
   * @param {() => Promise<any>} deps.requestResult  请求结果（服务端 / 本地）
   * @param {(result:any, token:number) => Promise<void>} deps.present  播放动画
   * @param {(result:any) => Promise<void>} deps.settle  结算
   */
  constructor(deps) {
    this._deps = deps;
    this._token = 0;
    this._spinning = false;
    this._locked = false;
  }

  /** 当前 token */
  getToken() { return this._token; }

  /** 是否正在 Spin */
  isSpinning() { return this._spinning; }

  /**
   * 触发一次 Spin
   * @returns {Promise<boolean>} 是否成功执行
   */
  async doSpin() {
    // 双重锁定：spinning + locked
    if (this._spinning || this._locked) {
      logger.debug('spin ignored (locked)');
      return false;
    }

    this._spinning = true;
    this._locked = true;
    const token = ++this._token;

    eventBus.emit('spin:start', { token: token });

    try {
      // 1. 请求结果
      const result = await this._deps.requestResult();
      if (token !== this._token) {
        logger.debug('spin aborted (token changed after request)');
        return false;
      }
      if (!result) {
        logger.warn('spin result empty');
        eventBus.emit('spin:error', { token: token, reason: 'empty_result' });
        return false;
      }

      // 2. 播放动画
      await this._deps.present(result, token);
      if (token !== this._token) {
        logger.debug('spin aborted (token changed after present)');
        return false;
      }

      // 3. 结算
      await this._deps.settle(result);
      if (token !== this._token) {
        logger.debug('spin aborted (token changed after settle)');
        return false;
      }

      eventBus.emit('spin:end', { token: token, result: result });
      return true;
    } catch (e) {
      logger.error('spin failed', e && e.message);
      eventBus.emit('spin:error', { token: token, error: e && e.message });
      return false;
    } finally {
      // 只有当前 token 才解锁
      if (token === this._token) {
        this._spinning = false;
        this._locked = false;
      }
    }
  }

  /**
   * 强制解锁（仅用于 ERROR 恢复）
   */
  forceRelease() {
    this._token++;
    this._spinning = false;
    this._locked = false;
    logger.warn('spin force released');
  }

  /**
   * 检查 token 是否仍有效
   * @param {number} token
   * @returns {boolean}
   */
  isTokenValid(token) {
    return token === this._token;
  }

  /**
   * 取消当前 Spin（用于页面离开 / 后台恢复）
   */
  cancel() {
    this._token++;
    this._spinning = false;
    this._locked = false;
    logger.debug('spin cancelled');
  }
}
