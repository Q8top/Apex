(function() {
  'use strict';

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
    ['website', 'api', 'db', 'email'].forEach(function(k) {
      setStatus('status-' + k, 'loading', '检查中');
    });
    setOverall('loading', '检查中...', '正在获取系统状态');

    var errCount = 0;
    var warnCount = 0;

    // 1) 前端
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

    // 2) API + DB + Email
    try {
      var t1 = performance.now();
      var res = await fetch('/api/status', { cache: 'no-store' });
      var ms2 = Math.round(performance.now() - t1);
      var data = await res.json();
      var checks = (data && data.checks) || {};

      setStatus('status-api', res.ok ? 'ok' : 'err', '正常 ' + ms2 + 'ms');
      if (!res.ok) errCount++;

      var dbState = checks.db && checks.db.state;
      setStatus('status-db', mapState(dbState), mapLabel(dbState));
      if (dbState === 'error') errCount++;
      else if (dbState === 'warn') warnCount++;

      var email = checks.email || {};
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

  // 关键：暴露到全局，让 HTML 的 onclick 能找到
  window.checkAll = checkAll;
  window.__apexStatusCheck = checkAll;

  // 绑定刷新按钮
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btn-refresh');
    if (btn) btn.addEventListener('click', checkAll);
    checkAll();
    setInterval(checkAll, 60000);
  });

  // 兜底：DOM 已加载就直接跑
  if (document.readyState !== 'loading') {
    var btn2 = document.getElementById('btn-refresh');
    if (btn2) btn2.addEventListener('click', checkAll);
    checkAll();
    setInterval(checkAll, 60000);
  }
})();
