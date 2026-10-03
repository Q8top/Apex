/* 21点 · 扑克牌 SVG（重写版：字号合理 + 无溢出） */
(function(){
'use strict';
var C = window.BlackjackConfig;

/* 单张牌 SVG（不含 faceDown） */
function card(suit, rank, faceDown){
  if (faceDown) return back();
  var red = (suit === 'heart' || suit === 'diamond');
  var color = red ? '#d0202a' : '#0a0a0a';
  var sym = suitSymbol(suit, color);
  var rankTxt = rank;
  var isFace = (rank === 'J' || rank === 'Q' || rank === 'K');

  // 中央区域
  var center;
  if (isFace) {
    // 花牌：中央画简化的人物剪影 + 花色
    center = '<g transform="translate(50,78)">' +
      '<circle cx="0" cy="-22" r="10" fill="' + color + '" opacity=".85"/>' +
      '<path d="M-16 -8 Q-16 12 0 22 Q16 12 16 -8 Q0 6 -16 -8 Z" fill="' + color + '" opacity=".72"/>' +
      '<circle cx="0" cy="-22" r="10" fill="none" stroke="#0a0a0a" stroke-width="1.2"/>' +
      '<path d="M-16 -8 Q-16 12 0 22 Q16 12 16 -8 Q0 6 -16 -8 Z" fill="none" stroke="#0a0a0a" stroke-width="1.2"/>' +
      // 中央小圆框里放 rank
      '<circle cx="0" cy="0" r="9" fill="#fff" stroke="' + color + '" stroke-width="1.5"/>' +
      '<text x="0" y="3" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="900" fill="' + color + '">' + rankTxt + '</text>' +
      '</g>';
  } else {
    center = '<g transform="translate(50,78) scale(2.1)">' + sym + '</g>';
  }

  // 左上角 + 右下角（180° 对称）
  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" overflow="hidden">' +
    '<rect x="2" y="2" width="96" height="146" rx="8" fill="#ffffff" stroke="#0a0a0a" stroke-width="1.8"/>' +
    // 左上角
    '<g transform="translate(18,26)">' +
      '<text x="0" y="0" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="900" fill="' + color + '">' + rankTxt + '</text>' +
    '</g>' +
    '<g transform="translate(18,42) scale(0.72)">' + sym + '</g>' +
    // 右下角（旋转 180°）
    '<g transform="translate(82,124) rotate(180)">' +
      '<text x="0" y="0" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="900" fill="' + color + '">' + rankTxt + '</text>' +
      '<g transform="translate(0,16) scale(0.72)">' + sym + '</g>' +
    '</g>' +
    // 中央
    center +
  '</svg>';
}

function suitSymbol(suit, color){
  var c = color || '#0a0a0a';
  if (suit === 'heart') return '<path d="M0 6 C-6 2 -10 -2 -10 -6 C-10 -10 -6 -12 -3 -10 C-1 -9 0 -7 0 -6 C0 -7 1 -9 3 -10 C6 -12 10 -10 10 -6 C10 -2 6 2 0 6 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/>';
  if (suit === 'diamond') return '<path d="M0 -9 L7 0 L0 9 L-7 0 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1"/>';
  if (suit === 'spade') return '<path d="M0 -9 C-6 -3 -10 1 -10 6 C-10 10 -6 12 -3 10 C-1 9 0 7 0 5 C0 7 1 9 3 10 C6 12 10 10 10 6 C10 1 6 -3 0 -9 Z" fill="' + c + '" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/>';
  if (suit === 'club') return '<circle cx="0" cy="-5" r="5" fill="' + c + '"/><circle cx="-4.5" cy="4" r="5" fill="' + c + '"/><circle cx="4.5" cy="4" r="5" fill="' + c + '"/><rect x="-1.5" y="4" width="3" height="8" rx="1.2" fill="' + c + '"/>';
  return '';
}

function back(){
  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" overflow="hidden">' +
    '<rect x="2" y="2" width="96" height="146" rx="8" fill="#2a3a5a" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<rect x="8" y="8" width="84" height="134" rx="5" fill="none" stroke="#7a9ad0" stroke-width="1.4" opacity=".8"/>' +
    '<path d="M14 30 L86 30 M14 50 L86 50 M14 70 L86 70 M14 90 L86 90 M14 110 L86 110 M14 130 L86 130" stroke="#5a7aaa" stroke-width="1.4" opacity=".65"/>' +
    '<path d="M26 14 L26 136 M50 14 L50 136 M74 14 L74 136" stroke="#5a7aaa" stroke-width="1.4" opacity=".65"/>' +
    '<circle cx="50" cy="75" r="16" fill="none" stroke="#a8c0e8" stroke-width="2" opacity=".9"/>' +
    '<circle cx="50" cy="75" r="16" fill="#3a4a6a" opacity=".8"/>' +
    '<text x="50" y="81" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="900" fill="#c8d8f0">A</text>' +
  '</svg>';
}

function empty(){
  return '<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" overflow="hidden">' +
    '<rect x="2" y="2" width="96" height="146" rx="8" fill="none" stroke="#aaa" stroke-width="1.8" stroke-dasharray="6 6" opacity=".45"/>' +
  '</svg>';
}

window.BlackjackSymbols = { card: card, back: back, empty: empty, suitSymbol: suitSymbol };
})();
