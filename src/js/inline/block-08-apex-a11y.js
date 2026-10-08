(function () {
  'use strict';

  function forEachNode(nodeList, fn) {
    for (var i = 0; i < nodeList.length; i++) fn(nodeList[i], i);
  }

  // 1. 输入框无障碍属性
  forEachNode(document.querySelectorAll('input'), function (input) {
    if (!input.id) return;
    var group = input.closest ? input.closest('.input-group') : null;
    var label = group ? group.querySelector('label') : null;
    if (label && !label.htmlFor) label.htmlFor = input.id;
    if (!input.getAttribute('aria-label') && input.placeholder) {
      input.setAttribute('aria-label', input.placeholder);
    }
  });

  // 2. 主按钮 aria-label
  forEachNode(document.querySelectorAll('.btn-primary'), function (btn) {
    if (!btn.getAttribute('aria-label') && btn.textContent.trim()) {
      btn.setAttribute('aria-label', btn.textContent.trim());
    }
  });

  // 3. 密码小眼睛
  forEachNode(document.querySelectorAll('.btn-toggle'), function (btn) {
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', '显示或隐藏密码');
    btn.setAttribute('tabindex', '0');
  });

  // 4. Tab 无障碍状态
  forEachNode(document.querySelectorAll('.tab'), function (tab) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected',
      tab.classList.contains('active') ? 'true' : 'false');
  });

  // 5. 语言切换按钮
  var langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.setAttribute('aria-label', '切换语言');
    langBtn.setAttribute('aria-haspopup', 'true');
  }

  // 6. [role=button] 键盘可访问
  forEachNode(document.querySelectorAll('[role="button"]'), function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
})();
