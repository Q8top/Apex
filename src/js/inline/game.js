/* Apex · 游戏详情页 */
(function(){
'use strict';

/* ============================================================
   游戏数据（后期从 /api/games 拉取，结构保持一致即可）
   ============================================================ */
var GAMES = {
  'lucky-fruit': {
    name: '幸运水果机',
    sub: '经典老虎机 · 三轴转轮',
    cover: '/assets/games/lucky-fruit.svg',
    intro: '幸运水果机是一款经典的三轴老虎机游戏。玩家选择下注金额后点击开始，三个转轴会同时转动，停止时若三个图标一致即中奖。玩法简单直观，节奏明快，适合所有玩家快速上手。',
    rules: [
      '选择下注金额',
      '点击「开始游戏」启动转轴',
      '等待三个转轴依次停止',
      '根据中奖组合获得对应倍数奖励'
    ],
    prizes: [
      { icon: '🍒', mult: '×10' },
      { icon: '🍋', mult: '×25' },
      { icon: '7️⃣', mult: '×100' }
    ],
    paytable: [
      { combo: '🍒 🍒 🍒', mult: '×10' },
      { combo: '🍋 🍋 🍋', mult: '×25' },
      { combo: '🔔 🔔 🔔', mult: '×50' },
      { combo: '7️⃣ 7️⃣ 7️⃣', mult: '×100' }
    ],
    info: {
      '游戏类型': '经典老虎机',
      '游戏模式': '单人游戏',
      '游戏版本': 'V1.0',
      '上线日期': '2026-10-01'
    }
  }
};

/* ============================================================
   工具
   ============================================================ */
function getParam(name) {
  var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

var id = getParam('id') || 'lucky-fruit';
var g = GAMES[id];

/* ============================================================
   渲染
   ============================================================ */
function notFound() {
  document.getElementById('gm-name').textContent = '游戏不存在';
  document.getElementById('gm-sub').textContent = '';
  document.getElementById('gm-cover').innerHTML = '<i class="ri-error-warning-line" style="font-size:64px;color:#ccc;"></i>';
  document.getElementById('gm-intro').textContent = '未找到该游戏，请返回首页重新选择。';
  document.getElementById('gm-rules').innerHTML = '';
  document.getElementById('gm-prizes').innerHTML = '';
  document.getElementById('gm-paytable').innerHTML = '';
  document.getElementById('gm-info').innerHTML = '';
  document.getElementById('gm-start').disabled = true;
}

function render() {
  document.title = g.name + ' · Apex';
  document.getElementById('gm-top-title').textContent = g.name;
  document.getElementById('gm-cover').innerHTML = '<img src="' + g.cover + '" alt="' + esc(g.name) + '">';
  document.getElementById('gm-name').textContent = g.name;
  document.getElementById('gm-sub').textContent = g.sub;
  document.getElementById('gm-intro').textContent = g.intro;

  document.getElementById('gm-rules').innerHTML = g.rules.map(function(r) {
    return '<li>' + esc(r) + '</li>';
  }).join('');

  document.getElementById('gm-prizes').innerHTML = g.prizes.map(function(p) {
    return '<div class="gm-prize">' +
      '<div class="gm-prize-icon">' + p.icon + '</div>' +
      '<div class="gm-prize-mult">' + esc(p.mult) + '</div>' +
      '</div>';
  }).join('');

  document.getElementById('gm-paytable').innerHTML = g.paytable.map(function(p) {
    return '<tr><td class="gm-combo">' + p.combo + '</td><td>' + esc(p.mult) + '</td></tr>';
  }).join('');

  var infoHtml = '';
  for (var k in g.info) {
    if (g.info.hasOwnProperty(k)) {
      infoHtml += '<dt>' + esc(k) + '</dt><dd>' + esc(g.info[k]) + '</dd>';
    }
  }
  document.getElementById('gm-info').innerHTML = infoHtml;
}

/* ============================================================
   收藏
   ============================================================ */
var FAV_KEY = 'apex_fav_games';
function loadFav() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (e) { return []; } }
function saveFav(arr) { try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {} }
function isFav() { return loadFav().indexOf(id) !== -1; }

function updateFavUI() {
  var btn = document.getElementById('gm-fav');
  if (!btn) return;
  var icon = btn.querySelector('i');
  if (isFav()) { btn.classList.add('active'); icon.className = 'ri-heart-fill'; }
  else { btn.classList.remove('active'); icon.className = 'ri-heart-line'; }
}

/* ============================================================
   交互
   ============================================================ */
function bindEvents() {
  document.getElementById('gm-fav').addEventListener('click', function() {
    var arr = loadFav();
    var idx = arr.indexOf(id);
    if (idx === -1) arr.push(id); else arr.splice(idx, 1);
    saveFav(arr);
    updateFavUI();
  });

  document.getElementById('gm-demo').addEventListener('click', function() {
    alert('试玩功能开发中');
  });

  document.getElementById('gm-support').addEventListener('click', function() {
    alert('客服功能开发中');
  });

  document.getElementById('gm-start').addEventListener('click', function() {
    alert('游戏引擎开发中');
  });

  document.getElementById('gm-more').addEventListener('click', function() {
    alert('更多操作开发中');
  });
}

/* ============================================================
   启动
   ============================================================ */
if (!g) { notFound(); }
else { render(); bindEvents(); updateFavUI(); }

})();
