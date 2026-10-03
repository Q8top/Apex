/* 21点 · 配置
   单副牌 · 目标 RTP ≈ 90%（略低于其它游戏因为本游戏有策略成分）
   规则：庄家 <17 要牌、≥17 停牌 · 玩家可选 要牌/停牌/加倍 · 无分牌无保险
*/
(function(){
'use strict';

var SUITS = ['spade', 'heart', 'diamond', 'club'];
var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

var CONFIG = {
  decks: 1,
  winPayout: 0.92,          // 普通赢 1:0.92（标准 1:1 的 92%）
  blackjackPayout: 1.38,    // 21点 1:1.38（标准 1:1.5 的 92%）
  dealerStandOn: 17,        // 庄家 17 停牌
  initialBalance: 1000,
  betSteps: [1, 5, 10, 20, 50, 100],
  defaultBetIndex: 2,
  dealDelayMs: 320,
  maxCards: 10
};

window.BlackjackConfig = {
  SUITS: SUITS, RANKS: RANKS, CONFIG: CONFIG
};
})();
