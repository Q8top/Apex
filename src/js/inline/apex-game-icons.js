/* Apex 游戏图标库 — 纯 SVG 内联，无外部依赖
 * 规范：viewBox 200x200，白底黑框 2px，内容缩至 60~88% 居中
 * 挂载：window.ApexGameIcons.render(key) -> svgString
 */
(function(){
'use strict';
var F='<rect x="30" y="30" width="140" height="140" rx="30" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>';
var I=[
{k:'olympus',c:'#d4af37',b:'<path d="M-5 -55 L20 -55 L0 -5 L25 -5 L-15 55 L5 5 L-20 5 Z" fill="{c}"/>'},
{k:'sweet',c:'#ff5c9d',b:'<circle r="38" fill="#fff" stroke="{c}" stroke-width="7"/><path d="M0 0 A 20 20 0 0 1 20 20 A 14 14 0 0 1 6 34 A 8 8 0 0 1 -2 26" fill="none" stroke="{c}" stroke-width="5" stroke-linecap="round"/><rect x="-3.5" y="38" width="7" height="30" rx="3.5" fill="{c}"/>'},
{k:'sugar',c:'#a855f7',b:'<rect x="-42" y="-42" width="84" height="84" rx="16" fill="{c}" opacity=".15" stroke="{c}" stroke-width="5"/><circle cx="-18" cy="-18" r="10" fill="{c}"/><circle cx="18" cy="-18" r="10" fill="{c}" opacity=".55"/><circle cx="-18" cy="18" r="10" fill="{c}" opacity=".55"/><circle cx="18" cy="18" r="10" fill="{c}"/>'},
{k:'bass',c:'#0891b2',b:'<path d="M-50 0 Q-20 -35 20 -20 Q45 -10 55 0 Q45 10 20 20 Q-20 35 -50 0 Z" fill="{c}"/><circle cx="-15" cy="-6" r="4" fill="#fff"/><path d="M-50 0 L-62 -12 L-62 12 Z" fill="{c}"/>'},
{k:'dog',c:'#f97316',b:'<path d="M-38 -10 L-38 -38 L-22 -30 L22 -30 L38 -38 L38 -10 Q38 25 0 40 Q-38 25 -38 -10 Z" fill="{c}"/><circle cx="-13" cy="-5" r="4" fill="#fff"/><circle cx="13" cy="-5" r="4" fill="#fff"/><ellipse cx="0" cy="15" rx="9" ry="7" fill="#fff"/>'},
{k:'book',c:'#b8860b',b:'<path d="M-40 -45 L40 -45 L40 45 L-40 45 Z" fill="{c}"/><path d="M-40 -45 Q0 -55 0 -40 L0 45 Q0 35 -40 45 Z" fill="#fff" opacity=".92"/><path d="M0 -40 Q0 -55 40 -45 L40 45 Q0 35 0 45 Z" fill="#fff" opacity=".72"/><path d="M-28 0 L28 0 M-28 12 L28 12 M-28 -12 L28 -12" stroke="{c}" stroke-width="3" opacity=".5"/>'},
{k:'starburst',c:'#3b82f6',b:'<path d="M0 -55 L12 -12 L55 0 L12 12 L0 55 L-12 12 L-55 0 L-12 -12 Z" fill="{c}"/>'},
{k:'gonzo',c:'#16a34a',b:'<path d="M-45 40 L0 -40 L45 40 Z" fill="{c}"/><path d="M-25 40 L0 0 L25 40 Z" fill="#fff"/><rect x="-45" y="40" width="90" height="8" fill="{c}"/>'},
{k:'buffalo',c:'#92400e',b:'<path d="M-45 -20 Q-45 -45 -25 -40 Q0 -50 25 -40 Q45 -45 45 -20 Q45 25 0 45 Q-45 25 -45 -20 Z" fill="{c}"/><circle cx="-15" cy="-10" r="4" fill="#fff"/><circle cx="15" cy="-10" r="4" fill="#fff"/>'},
{k:'wolf',c:'#eab308',b:'<path d="M-40 -40 L-25 -10 L-10 -30 L0 -15 L10 -30 L25 -10 L40 -40 L30 25 L0 45 L-30 25 Z" fill="{c}"/><circle cx="-12" cy="0" r="3.5" fill="#fff"/><circle cx="12" cy="0" r="3.5" fill="#fff"/>'},
{k:'fruit',c:'#dc2626',b:'<circle cx="-12" cy="10" r="28" fill="{c}"/><circle cx="18" cy="20" r="22" fill="{c}" opacity=".85"/><path d="M-12 -18 Q-4 -40 20 -42" fill="none" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/><path d="M-15 -15 Q-30 -30 -45 -28 Q-40 -12 -25 -8 Z" fill="#16a34a"/>'},
{k:'megaways',c:'#be185d',b:'<path d="M0 -45 L38 0 L0 45 L-38 0 Z" fill="{c}"/><path d="M0 -25 L20 0 L0 25 L-20 0 Z" fill="#fff"/>'}
];
function render(k){
  var it=null,i;
  for(i=0;i<I.length;i++){if(I[i].k===k){it=I[i];break;}}
  if(!it)return '';
  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+F+'<g transform="translate(100 100)">'+it.b.replace(/\{c\}/g,it.c)+'</g></svg>';
}
window.ApexGameIcons={render:render,_defs:I};
})();
