/* Apex booting: 兜底移除类，防止永久白屏 */
(function(){
  'use strict';
  function off(){try{document.body.classList.remove('apex-booting');}catch(e){}}
  function arm(){
    var ms=2500;
    try{if(localStorage.getItem('apex_auth_hint')==='1')ms=30000;}catch(e){}
    setTimeout(off,ms);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arm);
  else arm();
})();
