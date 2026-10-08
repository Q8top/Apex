(function () {
  'use strict';

  var POLL_MS = 60000;

  function setStatus(id, state, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = 'status ' + state;
    el.textContent = text;
  }

  function setOverall(state, title, meta) {
    var dot = document.getElementById('overall-dot');
    if (dot) dot.className = 'dot ' + state;
    var t = document.getElementById('overall-title');
    if (t) t.textContent = title;
    var m = document.getElementById('overall-meta');
    if (m) m.textContent = meta;
  }

  function mapState(state) {
    if (state === 'ok') return 'ok';
    if (state === 'warn') return 'warn';
    if (state === 'error') return 'err';
    return 'loading';
  }

  function mapLabel(state) {
    if (state === 'ok') return '正常';
    if (state === 'warn') return '降级';
    if (state === 'error') return '异常';
    return '未知';
  }

  async function checkAll() {
    ['website', 'api', 'db', 'email'].forEach(function (k) {
      setStatus('status-' + k, 'loading', '检查中');
    });
    setOverall('loading', '检查中...', '正在获取系统状态');

    var errCount = 0;
    var warnCount = 0;

    try {
      var t0 = performance.now();
      var r = await fetch('/', { method: 'HEAD', cache: 'no-store' });
      var ms = Math.round(performance.now() - t0);
      if (r.ok) {
        setStatus('status-website', 'ok', '正常 ' + ms + 'ms');
      } else {
        setStatus('status-website', 'err', 'HTTP ' + r.status);
        errCount++;
      }
    } catch (e) {
      setStatus('status-website', 'err', '不可达');
      errCount++;
    }

    try {
      var t1 = performance.now();
      var res = await fetch('/api/status', { cache: 'no-store' });
      var ms2 = Math.round(performance.now() - t1);
      var data = await res.json().catch(function () { return null; });
      var checks = (data && typeof data === 'object' && data.checks && typeof data.checks === 'object')
        ? data.checks : {};

      setStatus('status-api', res.ok ? 'ok' : 'err', '正常 ' + ms2 + 'ms');
      if (!res.ok) errCount++;

      var dbState = checks.db && checks.db.state;
      setStatus('status-db', mapState(dbState), mapLabel(dbState));
      if (dbState === 'error') errCount++;
      else if (dbState === 'warn') warnCount++;

      var email = (checks.email && typeof checks.email === 'object') ? checks.email : {};
      var emailState = email.state;
      var providers = Array.isArray(email.providers) ? email.providers : [];
      var descEl = document.getElementById('email-provider-desc');
      if (descEl) {
        if (providers.length === 0) descEl.textContent = '未配置';
        else if (providers.length === 1) descEl.textContent = '主通道正常';
        else descEl.textContent = '主通道正常 · 备用通道就绪';
      }
      setStatus('status-email', mapState(emailState), mapLabel(emailState));
      if (emailState === 'error') errCount++;
      else if (emailState === 'warn') warnCount++;
    } catch (e) {
      setStatus('status-api', 'err', '不可达');
      setStatus('status-db', 'err', '不可达');
      setStatus('status-email', 'err', '不可达');
      errCount += 3;
    }

    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    var stamp = hh + ':' + mm + ':' + ss;

    if (errCount === 0 && warnCount === 0) {
      setOverall('ok', '所有系统正常', '最后检查：' + stamp);
    } else if (errCount === 0) {
      setOverall('warn', '部分服务降级', warnCount + ' 项降级');
    } else {
      setOverall('err', '服务不可用', errCount + ' 项异常');
    }
  }

  function boot() {
    var btn = document.getElementById('btn-refresh');
    if (btn && !btn.__apexBound) {
      btn.__apexBound = true;
      btn.addEventListener('click', checkAll);
    }
    checkAll();
    if (!window.__apexStatusTimer) {
      window.__apexStatusTimer = setInterval(checkAll, POLL_MS);
    }
  }

  window.checkAll = checkAll;
  window.__apexStatusCheck = checkAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
