/* Apex x Waija - Lobby controller (demo mode).
 *
 * Flow:
 *   1. Render a fixed list of 12 curated games.
 *   2. Click card -> POST /api/waija/demo-launch -> open iframe.
 *   3. Close iframe -> back to lobby.
 */
(function () {
  'use strict';

  // Curated list - add more as they are validated.
  var GAMES = [
    { id: 'waija-pragmaticslots/gates-of-olympus',  name: '\u5965\u6797\u5339\u65af',  sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/sweet-bonanza',     name: '\u7cd6\u679c\u8fde\u8fde\u7206', sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/sugar-rush',        name: '\u751c\u871c\u7206\u5956',  sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/big-bass-bonanza',  name: '\u5de8\u578b\u9c88\u9c7c',  sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/the-dog-house',     name: '\u72d7\u72d7\u4e4b\u5bb6',  sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/buffalo-king',      name: '\u6c34\u725b\u4e4b\u738b',  sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/wolf-gold',         name: '\u72fc\u9ec4\u91d1',      sub: 'Pragmatic' },
    { id: 'waija-pragmaticslots/fruit-party',       name: '\u6c34\u679c\u6d3e\u5bf9',  sub: 'Pragmatic' },
  ];

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

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  function render() {
    var html = '';
    for (var i = 0; i < GAMES.length; i++) {
      var g = GAMES[i];
      html += '<div class="ggr-card" data-game="' + esc(g.id) + '">';
      html += '<div class="ggr-thumb">' + esc(g.name) + '</div>';
      html += '<div class="t">' + esc(g.name) + '<div class="p">' + esc(g.sub) + '</div></div>';
      html += '</div>';
    }
    grid.innerHTML = html;
    loader.hidden = true;
    empty.hidden = true;
    grid.hidden = false;
    note.hidden = false;
    note.textContent = '\u6f14\u793a\u6a21\u5f0f\uff1a\u5f53\u524d\u4e3a\u514d\u8d39\u8bd5\u73a9\uff08demo\uff09\u3002';
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

  function launch(gameid) {
    showToast('\u6b63\u5728\u542f\u52a8\u2026');
    api('/api/waija/demo-launch', {
      method: 'POST',
      body: { gameid: gameid, lang: 'zh' }
    }).then(function (r) {
      if (r.ok && r.body && r.body.success && r.body.url) {
        openIframe(r.body.url);
        return;
      }
      var code = r.body && r.body.code ? r.body.code : ('http_' + r.status);
      if (code === 'unauthenticated') {
        showToast('\u8bf7\u5148\u767b\u5f55', 4000);
        return;
      }
      if (code === 'waija_not_configured') {
        showToast('Waija \u672a\u914d\u7f6e', 5000);
        return;
      }
      showToast('\u542f\u52a8\u5931\u8d25\uff1a' + code, 4000);
    }).catch(function () {
      showToast('\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u91cd\u8bd5', 4000);
    });
  }

  grid.addEventListener('click', function (e) {
    var card = e.target && e.target.closest ? e.target.closest('.ggr-card') : null;
    if (!card) return;
    var id = card.getAttribute('data-game');
    if (id) launch(id);
  })

  closeBtn.addEventListener('click', closeIframe);

  render();
})();
