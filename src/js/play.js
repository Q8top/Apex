(function () {
  'use strict';

  var GAME_NAMES = {
    olympus:   '奥林匹斯之门',
    sweet:     '糖果连连爆',
    sugar:     '甜蜜爆奖',
    bass:      '巨型鲈鱼',
    dog:       '狗狗之家',
    book:      '死亡之书',
    starburst: '星爆',
    gonzo:     '刚果探险',
    buffalo:   '水牛之王',
    wolf:      '狼黄金',
    fruit:     '水果派对',
    megaways:  '大富翁'
  };

  var MODE_LABELS = {
    demo: '试玩模式',
    real: '真实模式'
  };

  var page    = document.querySelector('.gp-page');
  var titleEl = document.getElementById('gpTitle');
  var modeEl  = document.getElementById('gpMode');
  var backBtn = document.getElementById('gpBack');
  var menuBtn = document.getElementById('gpMenu');
  var toastEl = document.getElementById('gpToast');

  if (!page) return;

  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var mode     = params.get('mode') || 'demo';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;
  var modeText = MODE_LABELS[mode] || MODE_LABELS.demo;

  page.setAttribute('data-game-id', gameId);
  page.setAttribute('data-mode', mode);
  if (titleEl) titleEl.textContent = gameName;
  if (modeEl)  modeEl.textContent  = modeText;
  document.title = gameName + ' · ' + modeText;

  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 1800);
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      toast('菜单即将开放');
    });
  }
})();
