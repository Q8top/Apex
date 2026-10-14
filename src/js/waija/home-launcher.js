/* Apex x Waija - Full-screen demo launcher for homepage cards.
 *
 * Usage:
 *   window.ApexWaijaHome.launchUrl(url, displayName)
 *   window.ApexWaijaHome.launch(gameid, displayName)   [legacy]
 *
 * Overlay CSS lives in /src/css/waija-overlay.css (loaded lazily).
 * All overlay DOM uses class names, no inline style, so it works
 * under our CSP (style-src 'self').
 */
(function () {
  'use strict';

  var OVERLAY_ID = 'apex-waija-overlay';
  var CSS_HREF   = '/src/css/waija-overlay.css?v=1';
  var CSS_ID     = 'apex-waija-overlay-css';
  var overlay = null;
  var iframe = null;

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var link = document.createElement('link');
    link.id = CSS_ID;
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    ensureCss();
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'awh-x';
    x.setAttribute('aria-label', '\u5173\u95ed');
    x.textContent = '\u00d7';
    x.addEventListener('click', close);

    iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');

    overlay.appendChild(iframe);
    overlay.appendChild(x);
    document.body.appendChild(overlay);
    return overlay;
  }

  function showToast(msg) {
    ensureOverlay();
    var t = overlay.querySelector('.awh-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'awh-toast';
    t.textContent = msg;
    overlay.appendChild(t);
    return t;
  }

  function clearToast() {
    if (!overlay) return;
    var t = overlay.querySelector('.awh-toast');
    if (t) t.remove();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('on');
    if (iframe) iframe.src = 'about:blank';
    document.documentElement.style.overflow = '';
  }

  function open(url) {
    ensureOverlay();
    clearToast();
    iframe.src = url;
    overlay.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
  }

  // Direct URL launcher (used for vendor public demos).
  function launchUrl(url, displayName) {
    if (!url) return;
    ensureOverlay();
    overlay.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    open(url);
  }

  // Backend-driven launcher (calls /api/waija/demo-launch).
  function launch(gameid, displayName) {
    if (!gameid) return;
    ensureOverlay();
    overlay.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    // no loading toast: the vendor's own splash covers this

    fetch('/api/waija/demo-launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ gameid: gameid, lang: 'zh' })
    }).then(function (res) {
      return res.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) {}
        return { status: res.status, ok: res.ok, body: j };
      });
    }).then(function (r) {
      if (r.ok && r.body && r.body.success && r.body.url) {
        open(r.body.url);
        return;
      }
      var code = (r.body && r.body.code) || ('http_' + r.status);
      showToast('\u542f\u52a8\u5931\u8d25\uff1a' + code);
    }).catch(function () {
      showToast('\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u91cd\u8bd5');
    });
  }

  window.addEventListener('message', function (ev) {
    if (ev && ev.data && ev.data.type === 'waija:close') close();
  });

  window.ApexWaijaHome = Object.freeze({
    launch:    launch,
    launchUrl: launchUrl,
    close:     close
  });
})();
