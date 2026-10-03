/* Apex 全局 loading 遮罩控制 */
(function(){
'use strict';
function getEl(){ return document.getElementById('apex-loader'); }
function hide(){
  var e = getEl();
  if(!e || e.classList.contains('apex-hide')) return;
  e.classList.add('apex-hide');
  setTimeout(function(){ if(e.parentNode) e.parentNode.removeChild(e); }, 350);
}
function show(){
  var e = getEl();
  if(e){ e.classList.remove('apex-hide'); return; }
  e = document.createElement('div');
  e.id = 'apex-loader'; e.className = 'apex-loader';
  e.innerHTML = '<div class="apex-loader-spin"></div>';
  document.body.appendChild(e);
}
function arm(){
  setTimeout(hide, 900);
  if(document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
else arm();
window.ApexLoader = { show: show, hide: hide };
})();
