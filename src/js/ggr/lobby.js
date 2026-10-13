/* Apex x GGR - Lobby controller.
 *
 * Flow:
 *   1. GET /api/ggr/games -> render catalog cards
 *   2. click card -> POST /api/ggr/launch -> open iframe
 *   3. iframe close -> return to lobby
 *
 * Requires the user to be logged in (launch endpoint enforces it).
 * If 503 ggr_not_configured -> shows a coming-soon notice.
 */
(function () {
  'use strict';

  var grid    = document.getElementById('ggr-grid');
  var loader  = document.getElementById('ggr-loader');
  var empty   = document.getElementById('ggr-empty');
  var note    = document.getElementById('ggr-note');
  var toast   = document.getElementById('ggr-toast');
  var wrap    = document.getElementById('ggr-iframe-wrap');
  var iframe  = document.getElementById('ggr-iframe');
  var closeBtn= document.getElementById('ggr-close');

  function showToast(msg, ms) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, ms || 3000);
  }

  function api(path, opts) {
    opts = opts || {};
    var init = {
      method: opts.method || 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    return fetch(path, init).then(function (res) {
      return res.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) {}
        return { status: res.status, ok: res.ok, body: j };
      });
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderGames(games) {
    if (!games || !games.length) {
      loader.hidden = true; grid.hidden = true; empty.hidden = false;
      return;
    }
    var html = '';
    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      var thumb = g.thumbnail || '';
      if (thumb && thumb.charAt(0) === '/') {
        thumb = 'https://api.ggrlabs.com' + thumb;
      }
      html += '<div class="ggr-card" data-game="' + esc(g.identifier) + '">';
      html += '<img loading="lazy" src="' + esc(thumb) + '" alt="' + esc(g.title) + '" onerror="this.style.opacity=0.3">';
      html += '<div class="t">' + esc(g.title) + '<div class="p">' + esc(g.provider) + '</div></div>';
      html += '</div>';
    }
    grid.innerHTML = html;
    loader.hidden = true;
    empty.hidden = true;
    grid.hidden = false;
  }

  function openIframe(url) {
    iframe.src = url;
    wrap.classList.add('show');
    closeBtn.classList.add('show');
  }

  function closeIframe() {
    iframe.src = 'about:blank';
    wrap.classList.remove('show');
    closeBtn.classList.remove('show');
  }

  function launch(gameId) {
    showToast('正在启动…');
    api('/api/ggr/launch', {
      method: 'POST',
      body: { game: gameId, mode: 'demo' }
    }).then(function (r) {
      if (r.ok && r.body && r.body.success && r.body.url) {
        openIframe(r.body.url);
        return;
      }
      var code = r.body && r.body.code ? r.body.code : ('http_' + r.status);
      if (code === 'unauthenticated') {
        showToast('请先登录', 4000);
        return;
      }
      if (code === 'ggr_not_configured') {
        showToast('游戏接入准备中，稍后开放', 5000);
        return;
      }
      showToast('启动失败：' + code, 4000);
    }).catch(function () {
      showToast('网络错误，请重试', 4000);
    });
  }

  grid.addEventListener('click', function (e) {
    var card = e.target && e.target.closest ? e.target.closest('.ggr-card') : null;
    if (!card) return;
    var gameId = card.getAttribute('data-game');
    if (gameId) launch(gameId);
  })

  closeBtn.addEventListener('click', closeIframe);
  window.addEventListener('message', function (ev) {
    if (ev && ev.data && ev.data.type === 'ggr:close') closeIframe();
  })

  api('/api/ggr/games').then(function (r) {
    if (r.ok && r.body && r.body.success) {
      if (r.body.mock) {
        note.hidden = false;
        note.textContent = '试玩目录：GGR 接入完成后将自动切换为正式游戏列表。';
      }
      renderGames(r.body.games);
    } else {
      loader.hidden = true;
      empty.hidden = false;
    }
  }).catch(function () {
    loader.hidden = true;
    empty.hidden = false;
  })
})();
