// ApexTop - UI 路由控制
document.addEventListener('DOMContentLoaded', function() {
  function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.input-wrap').forEach(e => e.classList.remove('error'));
  }

  const $ = id => document.getElementById(id);

  $('go-register').onclick = (e) => { e.preventDefault(); switchView('view-register'); };
  $('go-login-from-reg').onclick = (e) => { e.preventDefault(); switchView('view-login'); };
  $('go-forgot').onclick = (e) => { e.preventDefault(); switchView('view-forgot'); };
  $('go-login-from-forgot').onclick = (e) => { e.preventDefault(); switchView('view-login'); };

  // 语言切换
  $('langBtn').onclick = (e) => { e.stopPropagation(); $('langMenu').classList.toggle('show'); };
  document.addEventListener('click', () => $('langMenu').classList.remove('show'));
});
