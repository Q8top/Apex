/* Apex - shared sheet core
 * open/close + scroll lock + ESC + focus restore
 * Shared by: sweet-rules / sweet-history / sweet-settings
 */
(function () {
  'use strict';

  var CLOSE_ANIM_MS = 300;

  function lockScroll() {
    if (window.ApexSheetLock) window.ApexSheetLock.lock();
    else document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    if (window.ApexSheetLock) window.ApexSheetLock.unlock();
    else document.body.style.overflow = '';
  }

  function createContext(getRoot, getPanel) {
    return {
      closeTimer: null,
      escHandler: null,
      focusBefore: null,
      getRoot: getRoot,
      getPanel: getPanel
    };
  }

  function bindEsc(ctx, onEsc) {
    if (ctx.escHandler) return;
    ctx.escHandler = function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) onEsc();
    };
    document.addEventListener('keydown', ctx.escHandler);
  }

  function unbindEsc(ctx) {
    if (!ctx.escHandler) return;
    document.removeEventListener('keydown', ctx.escHandler);
    ctx.escHandler = null;
  }

  function isOpen(ctx) {
    var root = ctx.getRoot();
    return !!(root && root.classList.contains('is-open'));
  }

  function close(ctx) {
    var root = ctx.getRoot();
    if (!root || !root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    unlockScroll();
    unbindEsc(ctx);
    if (ctx.focusBefore && typeof ctx.focusBefore.focus === 'function') {
      try { ctx.focusBefore.focus(); } catch (e) {}
    }
    ctx.focusBefore = null;
    if (ctx.closeTimer) clearTimeout(ctx.closeTimer);
    ctx.closeTimer = setTimeout(function () {
      ctx.closeTimer = null;
      var r = ctx.getRoot();
      if (r && !r.classList.contains('is-open')) r.setAttribute('hidden', '');
    }, CLOSE_ANIM_MS);
  }

  function open(ctx, hooks) {
    var ensure = hooks && hooks.ensure;
    var onOpen = hooks && hooks.onOpen;
    var r = ensure();
    if (ctx.closeTimer) { clearTimeout(ctx.closeTimer); ctx.closeTimer = null; }
    var wasOpen = r.classList.contains('is-open');
    if (onOpen) onOpen();
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');
    if (!wasOpen) {
      lockScroll();
      ctx.focusBefore = (document.activeElement && document.activeElement !== document.body)
        ? document.activeElement : null;
      bindEsc(ctx, function () { close(ctx); });
    }
    var panel = ctx.getPanel();
    if (panel && typeof panel.focus === 'function') {
      try { panel.focus(); } catch (e) {}
    }
  }

  window.ApexSheetCore = Object.freeze({
    CLOSE_ANIM_MS: CLOSE_ANIM_MS,
    createContext: createContext,
    lockScroll: lockScroll,
    unlockScroll: unlockScroll,
    bindEsc: bindEsc,
    unbindEsc: unbindEsc,
    isOpen: isOpen,
    close: close,
    open: open
  });
})();
