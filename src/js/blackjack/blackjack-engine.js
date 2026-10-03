/* 21点 · 引擎
   纯函数式：newDeck / shuffle / handValue / dealerPlay / settle
   UI 层控制发牌时序
*/
(function(){
'use strict';

var C = window.BlackjackConfig;

function randInt(n){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] % n;
}

function newDeck(){
  var d = [];
  for (var di = 0; di < C.CONFIG.decks; di++) {
    for (var si = 0; si < C.SUITS.length; si++) {
      for (var ri = 0; ri < C.RANKS.length; ri++) {
        d.push({ suit: C.SUITS[si], rank: C.RANKS[ri] });
      }
    }
  }
  return d;
}

function shuffle(deck){
  var a = deck.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = randInt(i + 1);
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function cardValue(rank){
  if (rank === 'A') return 11;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return parseInt(rank, 10);
}

function handValue(cards){
  var total = 0, aces = 0;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].rank === 'A') { aces++; total += 11; }
    else total += cardValue(cards[i].rank);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isSoft(cards){
  var total = 0, aces = 0;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].rank === 'A') { aces++; total += 11; }
    else total += cardValue(cards[i].rank);
  }
  return aces > 0 && total <= 21;
}

function isBlackjack(cards){
  return cards.length === 2 && handValue(cards) === 21;
}

function isBust(cards){
  return handValue(cards) > 21;
}

/* 庄家策略：<17 要牌（软 17 停，即 >=17 停） */
function dealerPlay(dealerCards, deck){
  var d = dealerCards.slice();
  var k = deck.slice();
  var draws = [];
  while (handValue(d) < C.CONFIG.dealerStandOn) {
    var c = k.shift();
    d.push(c);
    draws.push(c);
  }
  return { cards: d, deck: k, draws: draws };
}

/* 结算：返回 { result, winAmount, multiplier, detail } */
function settle(playerCards, dealerCards, bet, doubled){
  var pv = handValue(playerCards);
  var dv = handValue(dealerCards);
  var actualBet = doubled ? bet * 2 : bet;
  var pBJ = isBlackjack(playerCards);
  var dBJ = isBlackjack(dealerCards);
  var cfg = C.CONFIG;

  // 玩家爆牌 → 输
  if (pv > 21) return { result: 'bust', winAmount: 0, multiplier: -1, detail: '玩家爆牌' };

  // 双方 Blackjack → 和局
  if (pBJ && dBJ) return { result: 'push', winAmount: actualBet, multiplier: 0, detail: '双方21点·和局' };

  // 玩家 Blackjack → 赢 1.38×
  if (pBJ) return { result: 'blackjack', winAmount: actualBet + actualBet * cfg.blackjackPayout, multiplier: cfg.blackjackPayout, detail: '21点！' };

  // 庄家 Blackjack → 输
  if (dBJ) return { result: 'lose', winAmount: 0, multiplier: -1, detail: '庄家21点' };

  // 庄家爆牌 → 赢
  if (dv > 21) return { result: 'win', winAmount: actualBet + actualBet * cfg.winPayout, multiplier: cfg.winPayout, detail: '庄家爆牌' };

  // 比大小
  if (pv > dv) return { result: 'win', winAmount: actualBet + actualBet * cfg.winPayout, multiplier: cfg.winPayout, detail: '玩家赢' };
  if (pv < dv) return { result: 'lose', winAmount: 0, multiplier: -1, detail: '庄家赢' };
  return { result: 'push', winAmount: actualBet, multiplier: 0, detail: '和局' };
}

window.BlackjackEngine = {
  newDeck: newDeck, shuffle: shuffle,
  cardValue: cardValue, handValue: handValue, isSoft: isSoft,
  isBlackjack: isBlackjack, isBust: isBust,
  dealerPlay: dealerPlay, settle: settle,
  randInt: randInt
};
})();
