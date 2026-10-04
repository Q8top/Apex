// POST /api/slot/spin-demo
// Demo 模式结算：服务端权威，不写 D1，不扣真余额
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { parseJsonBody } from '../../_validation.js';
import { getCurrentUser } from '../../_auth.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { RNG } from '../../_math/olympus/rng.js';
import { spinDemo } from '../../_math/olympus/engine.js';

const MIN_BET = 1;
const MAX_BET = 10000;

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';

  const _rl = await enforceIpRateLimit(env, request, 'slot-spin-demo', 300, 60);
  if (_rl) return _rl;

  const user = await getCurrentUser(env, request);
  if (!user) return errorResponse('请先登录', 401, 'unauthenticated', requestId);

  const parsed = await parseJsonBody(request, 2048);
  if (!parsed.ok) return errorResponse(parsed.message, parsed.status, 'bad_request', requestId);

  const body = parsed.data || {};
  const bet = Number(body.bet);

  if (!Number.isInteger(bet) || bet < MIN_BET || bet > MAX_BET) {
    return errorResponse('无效下注', 400, 'invalid_bet', requestId);
  }

  let result;
  try {
    const rng = new RNG();
    result = spinDemo(rng, bet);
  } catch (e) {
    console.error('[slot/spin-demo] math failed:', e && e.message ? e.message : e);
    return errorResponse('生成结果失败', 500, 'math_error', requestId);
  }

  const safeResult = {
    initialGrid: result.initialGrid,
    finalGrid: result.finalGrid,
    tumbles: result.tumbles,
    tumbleCount: result.tumbleCount,
    scatterCount: result.scatterCount,
    freeSpins: result.freeSpins,
    baseTotalWin: result.baseTotalWin,
    totalWin: result.totalWin,
    capped: result.capped,
  };

  return jsonResponse({
    success: true,
    bet,
    totalWin: result.totalWin,
    mode: 'demo',
    result: safeResult,
  }, 200, requestId);
}

export async function onRequestOptions() {
  return optionsResponse('');
}
