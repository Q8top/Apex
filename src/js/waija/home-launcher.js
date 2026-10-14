/* Apex x Waija - Full-screen demo launcher. */
(function () {
  'use strict';

  var OVERLAY_ID = 'apex-waija-overlay';
  var CSS_HREF   = '/src/css/waija-overlay.css?v=5';
  var CSS_ID     = 'apex-waija-overlay-css';
  var SS_KEY     = 'apex.waija.lastGame';

  var overlay = null;
  var iframe = null;
  var currentUrl = '';

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var link = document.createElement('link');
    link.id = CSS_ID;
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }

  function homeIconSvg() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var p1 = document.createElementNS(NS, 'path');
    p1.setAttribute('d', 'M3 11.5 12 4l9 7.5');
    var p2 = document.createElementNS(NS, 'path');
    p2.setAttribute('d', 'M5.5 10.5V20h13v-9.5');
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  function dotsEl() {
    var w = document.createElement('div');
    w.className = 'awh-dots';
    for (var i = 0; i < 3; i++) w.appendChild(document.createElement('span'));
    return w;
  }

  function applyViewportHeight() {
    if (!overlay) return;
    var vv = window.visualViewport;
    var h = vv && vv.height ? vv.height : window.innerHeight;
    overlay.style.height = h + 'px';
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    ensureCss();
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var load = document.createElement('div');
    load.className = 'awh-loading';
    load.appendChild(dotsEl());

    iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.addEventListener('load', function () {
      if (currentUrl && iframe.src === currentUrl) {
        overlay.classList.add('ready');
      }
    });

    var home = document.createElement('button');
    home.type = 'button';
    home.className = 'awh-home';
    home.setAttribute('aria-label', 'Home');
    home.appendChild(homeIconSvg());
    home.addEventListener('click', close);

    overlay.appendChild(load);
    overlay.appendChild(iframe);
    overlay.appendChild(home);
    document.body.appendChild(overlay);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', applyViewportHeight);
      window.visualViewport.addEventListener('scroll', applyViewportHeight);
    }
    window.addEventListener('resize', applyViewportHeight);
    return overlay;
  }

  function saveSession(url) {
    try {
      if (url) sessionStorage.setItem(SS_KEY, url);
      else sessionStorage.removeItem(SS_KEY);
    } catch (e) {}
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('on');
    overlay.classList.remove('ready');
    currentUrl = '';
    saveSession('');
    if (iframe) iframe.src = 'about:blank';
    document.documentElement.style.overflow = '';
  }

  function open(url) {
    if (!url) return;
    ensureOverlay();
    overlay.classList.remove('ready');
    currentUrl = url;
    iframe.src = url;
    overlay.classList.add('on');
    applyViewportHeight();
    document.documentElement.style.overflow = 'hidden';
    saveSession(url);
  }

  function launchUrl(url, displayName) { open(url); }

  function launch(gameid, displayName) {
    if (!gameid) return;
    ensureOverlay();
    overlay.classList.remove('ready');
    overlay.classList.add('on');
    applyViewportHeight();
    document.documentElement.style.overflow = 'hidden';
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
      close();
    }).catch(function () { close(); });
  }

  window.addEventListener('message', function (ev) {
    if (ev && ev.data && ev.data.type === 'waija:close') close();
  });

  window.ApexWaijaHome = Object.freeze({
    launch: launch,
    launchUrl: launchUrl,
    close: close
  });

  // Restore previous game on page reload so refreshing keeps the player
  // in-game instead of dumping them back to the lobby.
  function restore() {
    var saved = '';
    try { saved = sessionStorage.getItem(SS_KEY) || ''; } catch (e) {}
    if (!saved) return;
    ensureOverlay();
    overlay.classList.remove('ready');
    currentUrl = saved;
    iframe.src = saved;
    overlay.classList.add('on');
    applyViewportHeight();
    document.documentElement.style.overflow = 'hidden';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  } else {
    restore();
  }
})();
