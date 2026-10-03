/* 21点 · 扑克牌 SVG 渲染 */
(function(){
'use strict';
var C = window.BlackjackConfig;

/* 渲染单张牌为 SVG 字符串 */
function card(suit, rank, faceDown){
  if (faceDown) return back();
  var red = (suit === 'heart' || suit === 'diamond');
  var color = red ? '#d63b3b' : '#0a0a0a';
  var suitPath = suitSymbol(suit, color);
  var rankTxt = rank;
  var isFace = (rank === 'J' || rank === 'Q' || rank === 'K');
  var fontSize = rank === '10' ? 42 : 52;

  var body = '';
  if (isFace) {
    // 简化的花牌：中间画个人物剪影 + 花色
    body = '<rect x="6" y="6" width="88" height="138" rx="6" fill="#fff8f0" stroke="#0a0a0a" stroke-width="2"/>' +
           '<g transform="translate(50,72)">' +
           '<circle cx="0" cy="-16" r="9" fill="' + color + '" opacity=".85"/>' +
           '<path d="M-14 -4 Q-14 8 0 18 Q14 8 14 -4 Q0 4 -14 -4 Z" fill="' + color + '" opacity=".75"/>' +
           '<circle cx="0" cy="-16" r="9" fill="none" stroke="#0a0a0a" stroke-width="1.5"/>' +
           '<path d="M-14 -4 Q-14 8 0 18 Q14 8 14 -4 Q0 4 -14 -4 Z" fill="none" stroke="#0a0a0a" stroke-width="1.5"/>' +
           '</g>' +
           '<text x="50" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="900" fill="' + color + '">' + rankTxt + '</text>';
  } else {
    body = '<rect x="6" y="6" width="88" height="138" rx="6" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>';
  }

  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
    body +
    // 左上角 rank + suit
    '<text x="14" y="30" font-family="Georgia,serif" font-size="' + fontSize + '" font-weight="900" fill="' + color + '" text-anchor="middle">' + rankTxt + '</text>' +
    '<g transform="translate(14,42)">' + suitPath + '</g>' +
    // 右下角翻转
    '<g transform="translate(86,120) rotate(180)">' +
      '<text x="0" y="0" font-family="Georgia,serif" font-size="' + fontSize + '" font-weight="900" fill="' + color + '" text-anchor="middle">' + rankTxt + '</text>' +
      '<g transform="translate(0,12)">' + suitPath + '</g>' +
    '</g>' +
    // 中央花色（数字牌）
    (isFace ? '' : '<g transform="translate(50,75) scale(1.8)">' + suitPath + '</g>') +
  '</svg>';
}

function suitSymbol(suit, color){
  var c = color || '#0a0a0a';
  if (suit === 'heart') return '<path d="M0 6 C-6 2 -10 -2 -10 -6 C-10 -10 -6 -12 -3 -10 C-1 -9 0 -7 0 -6 C0 -7 1 -9 3 -10 C6 -12 10 -10 10 -6 C10 -2 6 2 0 6 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/>';
  if (suit === 'diamond') return '<path d="M0 -8 L6 0 L0 8 L-6 0 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1"/>';
  if (suit === 'spade') return '<path d="M0 -8 C-6 -2 -10 2 -10 6 C-10 10 -6 12 -3 10 C-1 9 0 7 0 5 C0 7 1 9 3 10 C6 12 10 10 10 6 C10 2 6 -2 0 -8 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/>';
  if (suit === 'club') return '<circle cx="0" cy="-4" r="4.5" fill="' + c + '"/><circle cx="-4" cy="4" r="4.5" fill="' + c + '"/><circle cx="4" cy="4" r="4.5" fill="' + c + '"/><rect x="-1.2" y="4" width="2.4" height="8" fill="' + c + '"/>';
  return '';
}

function back(){
  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
    '<rect x="6" y="6" width="88" height="138" rx="6" fill="#2a3a5a" stroke="#0a0a0a" stroke-width="2"/>' +
    '<rect x="12" y="12" width="76" height="126" rx="4" fill="none" stroke="#7a9ad0" stroke-width="1.5" opacity=".7"/>' +
    '<path d="M20 30 L80 30 M20 50 L80 50 M20 70 L80 70 M20 90 L80 90 M20 110 L80 110 M20 130 L80 130" stroke="#4a5a7a" stroke-width="1.5" opacity=".55"/>' +
    '<path d="M30 20 L30 130 M50 20 L50 130 M70 20 L70 130" stroke="#4a5a7a" stroke-width="1.5" opacity=".55"/>' +
    '<circle cx="50" cy="75" r="14" fill="none" stroke="#7a9ad0" stroke-width="2" opacity=".8"/>' +
    '<text x="50" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="900" fill="#a8c0e8">A</text>' +
  '</svg>';
}

function empty(){
  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
    '<rect x="6" y="6" width="88" height="138" rx="6" fill="none" stroke="#aaa" stroke-width="2" stroke-dasharray="6 6" opacity=".45"/>' +
  '</svg>';
}

window.BlackjackSymbols = { card: card, back: back, empty: empty, suitSymbol: suitSymbol };
})();
