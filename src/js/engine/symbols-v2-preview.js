(function () {
  'use strict';
  var V2 = window.ApexSymbolsV2;
  var root = document.getElementById('sym-v2-root');
  if (!root || !V2) return;

  var IDS = V2.list();
  var SIZES = [ { label: 'L 96px', px: 96 },
                { label: 'M 64px', px: 64 },
                { label: 'S 40px', px: 40 } ];
  var BGS = [ { label: 'light', cls: 'bg-light' },
              { label: 'dark',  cls: 'bg-dark'  },
              { label: 'reel',  cls: 'bg-reel'  } ];

  function cell(symId, px, bgCls, tag) {
    var wrap = document.createElement('div');
    wrap.className = 'pv-cell ' + bgCls;
    var box = document.createElement('div');
    box.className = 'pv-box';
    box.style.width = px + 'px';
    box.style.height = px + 'px';
    box.innerHTML = V2.get(symId, tag);
    wrap.appendChild(box);
    return wrap;
  }

  function row(title, className) {
    var sec = document.createElement('section');
    sec.className = 'pv-row ' + (className || '');
    var h = document.createElement('h2');
    h.className = 'pv-h2';
    h.textContent = title;
    sec.appendChild(h);
    return sec;
  }

  function grid(items) {
    var g = document.createElement('div');
    g.className = 'pv-grid';
    items.forEach(function (el) { g.appendChild(el); });
    return g;
  }

  IDS.forEach(function (id) {
    root.appendChild(row('符号：' + id, 'pv-first'));

    var sec1 = row('① 三尺寸（同一 uid）');
    sec1.appendChild(grid(SIZES.map(function (s) {
      return cell(id, s.px, 'bg-reel', 'size-' + s.px);
    })));
    root.appendChild(sec1);

    var sec2 = row('② 三背景（64px）');
    sec2.appendChild(grid(BGS.map(function (b) {
      return cell(id, 64, b.cls, 'bg-' + b.cls);
    })));
    root.appendChild(sec2);

    var sec3 = row('③ 三个同屏（验证 uid 隔离）');
    sec3.appendChild(grid([0, 1, 2].map(function (i) {
      return cell(id, 72, 'bg-reel', 'dup-' + i);
    })));
    root.appendChild(sec3);
  });

  var stat = document.getElementById('sym-v2-stat');
  if (stat) {
    stat.textContent = 'ApexSymbolsV2 · ' + IDS.length + ' symbols · viewBox '
      + V2.VIEWBOX;
  }
})();
