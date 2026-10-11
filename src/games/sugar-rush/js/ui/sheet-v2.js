(function(){
'use strict';
var root = null, navEl = null, titleEl = null, backdropEl = null;
var lastFocus = null, isOpen = false;
var items = [];

function ensureRefs(){
  if (root) return true;
  root = document.getElementById('sr-sheet-root');
  if (!root) return false;
  navEl = document.getElementById('sr-sheet-nav');
  titleEl = document.getElementById('sr-sheet-title');
  backdropEl = document.getElementById('sr-sheet-backdrop');
  if (!navEl || !titleEl || !backdropEl) return false;
  backdropEl.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  return true;
}

function onKey(e){
  if (!isOpen) return;
  if (e.key === 'Escape'){ e.preventDefault(); close(); }
  if (e.key === 'Tab'){ trapTab(e); }
}

function trapTab(e){
  var focusables = root.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  var first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}

function register(id, opts){
  if (!opts || typeof opts.onClick !== 'function') return;
  items.push({ id: id, icon: opts.icon || '', label: opts.label || '',
              sub: opts.sub || '', className: opts.className || '', onClick: opts.onClick });
}

function buildItem(it){
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sr-sheet-item' + (it.className ? ' ' + it.className : '');
  btn.setAttribute('data-item-id', it.id);
  if (it.icon){
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sr-ic');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', it.icon);
    svg.appendChild(use);
    btn.appendChild(svg);
  }
  var txt = document.createElement('span');
  txt.textContent = it.label;
  if (it.sub){
    var sub = document.createElement('span');
    sub.className = 'sr-sheet-sub';
    sub.textContent = it.sub;
    txt.appendChild(sub);
  }
  btn.appendChild(txt);
  var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chev.setAttribute('class', 'sr-ic sr-ic-sm sr-sheet-chevron');
  chev.setAttribute('aria-hidden', 'true');
  var cu = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  cu.setAttribute('href', '#ic-chevron-right');
  chev.appendChild(cu);
  btn.appendChild(chev);
  btn.addEventListener('click', function(){ it.onClick(); });
  return btn;
}

function renderNav(){
  if (!ensureRefs()) return;
  navEl.innerHTML = '';
  for (var i = 0; i < items.length; i++) navEl.appendChild(buildItem(items[i]));
}

function open(){
  if (!ensureRefs()) return;
  if (isOpen) return;
  renderNav();
  lastFocus = document.activeElement;
  root.hidden = false;
  /* force reflow so transition runs */
  void root.offsetWidth;
  root.classList.add('is-open');
  isOpen = true;
  var first = navEl.querySelector('.sr-sheet-item');
  if (first) first.focus();
}

function close(){
  if (!isOpen) return;
  isOpen = false;
  root.classList.remove('is-open');
  setTimeout(function(){ root.hidden = true; }, 300);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function setTitle(t){ if (titleEl) titleEl.textContent = t; }

window.ApexSRSheet = Object.freeze({
  register: register,
  open: open,
  close: close,
  isOpen: function(){ return isOpen; },
  setTitle: setTitle
});
})();
