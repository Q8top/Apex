(function(){
'use strict';
var I=window.ApexI18n;
if(!I||typeof I.t!=='function'){
  window.ApexSRI18nBind=Object.freeze({
    apply:function(){},t:function(k,f){return f||k;}
  });
  return;
}

function tr(key,fallback){
  try{
    var v=I.t(key);
    if(v && v!==key) return v;
  }catch(e){}
  return fallback!==undefined?fallback:key;
}

function apply(root){
  root=root||document;

  /* data-i18n -> textContent */
  var nodes=root.querySelectorAll('[data-i18n]');
  for(var i=0;i<nodes.length;i++){
    var key=nodes[i].getAttribute('data-i18n');
    var fb=nodes[i].getAttribute('data-i18n-fallback');
    var txt=tr(key,fb);
    if(txt!=null) nodes[i].textContent=txt;
  }

  /* data-i18n-aria -> aria-label */
  var ariaNodes=root.querySelectorAll('[data-i18n-aria]');
  for(var j=0;j<ariaNodes.length;j++){
    var ak=ariaNodes[j].getAttribute('data-i18n-aria');
    var afb=ariaNodes[j].getAttribute('data-i18n-aria-fallback');
    var av=tr(ak,afb);
    if(av!=null) ariaNodes[j].setAttribute('aria-label',av);
  }

  /* data-i18n-title -> document.title */
  var titleEl=document.querySelector('title');
  if(titleEl){
    var tk=tr('sr.title',null);
    if(tk&&tk!=='sr.title') document.title=tk;
  }
}

/* 手动触发（供其它模块调用）*/
function refresh(){ apply(document); }

/* 页启动时应用一次 */
if(document.readyState!=='loading') refresh();
else document.addEventListener('DOMContentLoaded',refresh);

/* 语言变更时（i18n 是否广播待查）尝试监听 */
if(typeof window.addEventListener==='function'){
  window.addEventListener('apex:lang',refresh);
}

window.ApexSRI18nBind=Object.freeze({
  apply:apply,
  refresh:refresh,
  tr:tr
});
})();
