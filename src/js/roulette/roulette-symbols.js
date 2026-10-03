/* 轮盘 · SVG 组件（转轮 + 球） */
(function(){
'use strict';
var C = window.RouletteConfig;

/* 计算给定数字在轮盘上的角度（0-360，顶部为 0） */
function angleOf(n, wheel){
  var idx = wheel.indexOf(n);
  if (idx < 0) return 0;
  return (idx / wheel.length) * 360;
}

/* 生成轮盘 SVG（静态结构，球由 UI 层绝对定位） */
function wheelSVG(isAmerican){
  var wheel = isAmerican ? C.AMER_WHEEL : C.EURO_WHEEL;
  var N = wheel.length;
  var segAngle = 360 / N;
  var R = 90;   // 外径
  var r = 58;   // 内径

  var paths = '';
  for (var i = 0; i < N; i++) {
    var a1 = i * segAngle;
    var a2 = (i + 1) * segAngle;
    var mid = a1 + segAngle / 2;
    var num = wheel[i];
    // 决定颜色
    var fill;
    if (num === 0 || num === -1) fill = '#0a7a3a';  // 绿
    else if (C.isRed(num)) fill = '#c82828';
    else fill = '#0a0a0a';

    // 扇形路径（从 a1 到 a2，用极坐标转直角）
    var p1 = polar(R, a1), p2 = polar(R, a2);
    var p3 = polar(r, a2), p4 = polar(r, a1);
    var d = 'M ' + p1.x + ' ' + p1.y + ' A ' + R + ' ' + R + ' 0 0 1 ' + p2.x + ' ' + p2.y +
            ' L ' + p3.x + ' ' + p3.y + ' A ' + r + ' ' + r + ' 0 0 0 ' + p4.x + ' ' + p4.y + ' Z';
    paths += '<path d="' + d + '" fill="' + fill + '" stroke="#fff" stroke-width="0.5"/>';

    // 数字（放在扇形中间，稍微偏外）
    var nr = (R + r) / 2 - 4;
    var np = polar(nr, mid);
    var label = (num === -1) ? '00' : String(num);
    paths += '<text x="' + np.x + '" y="' + np.y + '" text-anchor="middle" dominant-baseline="central" font-family="Manrope,sans-serif" font-size="7.5" font-weight="800" fill="#fff" transform="rotate(' + (mid + 90) + ' ' + np.x + ' ' + np.y + ')">' + label + '</text>';
  }

  return '<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
    '<circle cx="0" cy="0" r="96" fill="#3a2a10" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="0" cy="0" r="92" fill="#5a3a18" stroke="#0a0a0a" stroke-width="1"/>' +
    paths +
    '<circle cx="0" cy="0" r="30" fill="#5a3a18" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="0" cy="0" r="20" fill="radial-gradient(#e8c870,#a08838)" stroke="#0a0a0a" stroke-width="1.5"/>' +
    '<circle cx="0" cy="0" r="6" fill="#0a0a0a"/>' +
    '</svg>';
}

function polar(r, deg){
  var rad = (deg - 90) * Math.PI / 180;
  return { x: Math.round(r * Math.cos(rad) * 100) / 100, y: Math.round(r * Math.sin(rad) * 100) / 100 };
}

/* 小球 SVG */
function ball(){
  return '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" fill="#fff" stroke="#0a0a0a" stroke-width="1"/><ellipse cx="7" cy="7" rx="3" ry="2" fill="#fff" opacity=".9"/></svg>';
}

window.RouletteSymbols = {
  wheelSVG: wheelSVG,
  ball: ball,
  angleOf: angleOf,
  polar: polar
};
})();
