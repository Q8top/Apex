(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

// 数据：按「时间」分组，每条含多条内容
// 结构：[ { t: '时间', items: ['内容1', '内容2', ...] }, ... ]
// 未来接口返回同结构即可
var M=[
  {t:'2026-10-01 15:00',items:[
    '\u6B22\u8FCE\u6765\u5230 Apex\uFF0C\u795D\u60A8\u4F53\u9A8C\u6109\u5FEB\uFF01',
    '\u8BF7\u52FF\u5411\u4EFB\u4F55\u4EBA\u900F\u9732\u8D26\u53F7\u5BC6\u7801\u4E0E\u9A8C\u8BC1\u7801',
    '\u5E73\u53F0\u6B63\u5728\u6301\u7EED\u4F18\u5316\uFF0C\u611F\u8C22\u60A8\u7684\u652F\u6301'
  ]},
  {t:'2026-09-30 18:20',items:[
    '\u65B0\u589E\u767B\u5F55\u8BBE\u5907\u7BA1\u7406\u529F\u80FD'
  ]}
];

var list=document.getElementById('ann-list');
var empty=document.getElementById('ann-empty');
if(!list)return;
if(!M||!M.length){if(empty)empty.hidden=false;return;}
list.innerHTML=M.map(function(g){
  var items=(g.items||[]).map(function(x,i){
    var num=(g.items.length>1)?('<span class="ann-num">'+(i+1)+'</span>'):'';
    return '<li class="ann-row">'+num+'<span class="ann-text">'+esc(x)+'</span></li>';
  }).join('');
  return '<li class="ann-item">'
    + '<div class="ann-time"><i class="ri-time-line" aria-hidden="true"></i>'
    + esc(g.t)+'</div>'
    + '<ol class="ann-rows">'+items+'</ol>'
    + '</li>';
}).join('');
})();
