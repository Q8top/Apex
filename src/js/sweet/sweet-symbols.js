/* 甜蜜蜜 · 符号接口薄壳
   实际渲染委托给 SymbolRenderer（/src/game/symbols/）
   保留 window.SweetSymbols 的 12 个 key 与 <defs> 注入逻辑（其他文件依赖）
*/
(function(){
'use strict';

var DEFS_ID = 'sweet-sym-defs';

function ensureDefs(){
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('style', 'position:absolute;overflow:hidden');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs>' +
    '<radialGradient id="sw-blue" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#b0e0ff"/><stop offset="70%" stop-color="#4a9de0"/><stop offset="100%" stop-color="#205a90"/></radialGradient>' +
    '<radialGradient id="sw-green" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#a8eaa8"/><stop offset="70%" stop-color="#3f9a4a"/><stop offset="100%" stop-color="#1f6028"/></radialGradient>' +
    '<radialGradient id="sw-purple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#d8b0f0"/><stop offset="70%" stop-color="#9060c0"/><stop offset="100%" stop-color="#5a3080"/></radialGradient>' +
    '<radialGradient id="sw-red" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff9090"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#a01828"/></radialGradient>' +
    '<radialGradient id="sw-orange" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffc090"/><stop offset="70%" stop-color="#f08a3c"/><stop offset="100%" stop-color="#b85a1c"/></radialGradient>' +
    '<radialGradient id="sw-yellow" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff2a0"/><stop offset="70%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></radialGradient>' +
    '<radialGradient id="sw-banana" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#f0e8a0"/><stop offset="70%" stop-color="#d8b84a"/><stop offset="100%" stop-color="#a08030"/></radialGradient>' +
    '<radialGradient id="sw-grape" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#b088e0"/><stop offset="70%" stop-color="#7a4aa8"/><stop offset="100%" stop-color="#522e80"/></radialGradient>' +
    '<radialGradient id="sw-watermelon" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff8080"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#b02028"/></radialGradient>' +
    '<radialGradient id="sw-apple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff7878"/><stop offset="70%" stop-color="#d03838"/><stop offset="100%" stop-color="#901818"/></radialGradient>' +
    '<radialGradient id="sw-plum" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#c890d8"/><stop offset="70%" stop-color="#8a4898"/><stop offset="100%" stop-color="#5a2868"/></radialGradient>' +
    '<linearGradient id="sw-lolli" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9ed8"/><stop offset="50%" stop-color="#c870b8"/><stop offset="100%" stop-color="#7a2870"/></linearGradient>' +
  '</defs>';
  document.body.appendChild(svg);
}

ensureDefs();

var KEYS = ['candyBlue','candyGreen','candyPurple','candyRed','candyOrange','candyYellow','banana','grape','watermelon','apple','plum','lollipop'];
var API = {};
KEYS.forEach(function(k){
  API[k] = function(){
    ensureDefs();
    return window.SymbolRenderer.render(k);
  };
});
window.SweetSymbols = API;
})();
