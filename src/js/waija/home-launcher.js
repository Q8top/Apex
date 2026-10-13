/* Apex x Waija - Full-screen demo launcher for homepage cards.
 *
 * Usage:
 *   window.ApexWaijaHome.launch(gameid, displayName)
 *
 * Creates one overlay lazily, reuses it on subsequent launches.
 * Does not modify any existing DOM or CSS class.
 */
(function () {
  'use strict';

  var OVERLAY_ID = 'apex-waija-overlay';
  var STYLE_ID   = 'apex-waija-overlay-style';
  var overlay = null;
  var iframe = null;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '#' + OVERLAY_ID + '{position:fixed;inset:0;background:#000;z-index:2147483600;display:none;}'
      + '#' + OVERLAY_ID + '.on{display:block;}'
      + '#' + OVERLAY_ID + ' iframe{width:100%;height:100%;border:0;display:block;background:#000;}'
      + '#' + OVERLAY_ID + ' .awh-x{position:absolute;top:10px;right:10px;width:44px;height:44px;'
      + 'border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:22px;cursor:pointer;'
      + 'display:flex;align-items:center;justify-content:center;line-height:1;z-index:2;}'
      + '#' + OVERLAY_ID + ' .awh-x:active{transform:scale(.95);}'
      + '#' + OVERLAY_ID + ' .awh-toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);'
      + 'background:#222;color:#fff;padding:14px 20px;border-radius:10px;font-size:14px;'
      + 'max-width:80%;text-align:center;line-height:1.5;}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    injectStyle();
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
    iframe.setAttribute('allowfullscreen', 'true');
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

  function launch(gameid, displayName) {
    if (!gameid) return;
    ensureOverlay();
    overlay.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    showToast('\u6b63\u5728\u52a0\u8f7d ' + (displayName || '\u6e38\u620f') + '\u2026');

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
    launch: launch,
    close:  close
  });
})();
