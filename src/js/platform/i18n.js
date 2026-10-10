/* Apex · i18n v2 本地化（C-1 扩展）
 * 支持 11 语言注册表 + 回退链 + Intl 金额格式化 + RTL。
 *  - 现有翻译：zh-CN / en-US 完整
 *  - 其他语言：注册可切换，翻译暂走 fallback -> en-US（后续独立补）
 *  - t(key, params) 支持 {name} 占位；t(key, 'FB') 兼容旧 fallback
 *  - formatMinor(minor, opts) 用 Intl.NumberFormat，minor units 是分
 *  - setLang 立即更新 <html lang/dir>
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'apex.sweet.lang';
  var DEFAULT = 'zh-CN';

  var LANG_REGISTRY = [
    { code: 'zh-CN', name: '简体中文',         dir: 'ltr' },
    { code: 'en-US', name: 'English',          dir: 'ltr' },
    { code: 'ja',    name: '日本語',            dir: 'ltr', fallback: 'en-US' },
    { code: 'ko',    name: '한국어',            dir: 'ltr', fallback: 'en-US' },
    { code: 'th',    name: 'ไทย',              dir: 'ltr', fallback: 'en-US' },
    { code: 'vi',    name: 'Tiếng Việt',       dir: 'ltr', fallback: 'en-US' },
    { code: 'id',    name: 'Bahasa Indonesia', dir: 'ltr', fallback: 'en-US' },
    { code: 'ms',    name: 'Bahasa Melayu',    dir: 'ltr', fallback: 'en-US' },
    { code: 'ar',    name: 'العربية',          dir: 'rtl', fallback: 'en-US' },
    { code: 'es',    name: 'Español',          dir: 'ltr', fallback: 'en-US' },
    { code: 'pt-BR', name: 'Português (BR)',   dir: 'ltr', fallback: 'en-US' }
  ];
  var CODES = LANG_REGISTRY.map(function (x) { return x.code; });
  var META = {};
  LANG_REGISTRY.forEach(function (x) { META[x.code] = x; });
  Object.freeze(META);
  Object.freeze(LANG_REGISTRY);

  var STRINGS = {
    'zh-CN': {
      'game.title': '糖果连连爆', 'game.demo': '试玩模式', 'game.menu': '游戏菜单',
      'stat.balance': '试玩余额', 'stat.bet': '投注金额', 'stat.win': '本局赢得',
      'btn.reset': '重置余额', 'btn.recharge': '充值余额', 'btn.auto': '自动',
      'btn.spin': '旋转', 'btn.fast': '极速', 'btn.stop': '停止',
      'btn.skip': '跳过',
      'btn.spinning': '旋转中', 'btn.bonus': '免费旋转中',
      'win.label': '本局赢得', 'win.big': '大奖', 'win.mega': '超级中奖',
      'win.super': '超级大奖', 'win.epic': '史诗大奖', 'win.ultra': '至尊大奖',
      'menu.rules': '游戏规则', 'menu.history': '游戏记录', 'menu.settings': '游戏设置',
      'menu.sound': '音效设置', 'menu.vibrate': '震动反馈', 'menu.help': '游戏帮助',
      'menu.home': '返回大厅',
      'toast.insufficient': '试玩余额不足', 'toast.reset.done': '试玩余额已重置',
      'toast.coming': '功能开发中',
      'net.offline': '网络已断开',
      'net.online': '网络已恢复',
      'bonus.title': 'Candy Storm', 'bonus.spinLeft': '剩余局数',
      'bonus.totalWin': '累计赢得', 'bonus.multiplier': '倍率合计', 'bonus.claim': '领取'
    },
    'en-US': {
      'game.title': 'Apex', 'game.demo': 'Demo Mode', 'game.menu': 'Game Menu',
      'stat.balance': 'Balance', 'stat.bet': 'Bet', 'stat.win': 'Win',
      'btn.reset': 'Reset', 'btn.recharge': 'Recharge', 'btn.auto': 'Auto',
      'btn.spin': 'Spin', 'btn.fast': 'Turbo', 'btn.stop': 'Stop',
      'btn.skip': 'Skip',
      'btn.spinning': 'Spinning', 'btn.bonus': 'Free Spins',
      'win.label': 'Win', 'win.big': 'Big Win', 'win.mega': 'Mega Win',
      'win.super': 'Super Win', 'win.epic': 'Epic Win', 'win.ultra': 'Ultra Win',
      'menu.rules': 'Rules', 'menu.history': 'History', 'menu.settings': 'Settings',
      'menu.sound': 'Sound', 'menu.vibrate': 'Haptics', 'menu.help': 'Help',
      'menu.home': 'Home',
      'toast.insufficient': 'Insufficient balance', 'toast.reset.done': 'Balance reset',
      'toast.coming': 'Coming soon',
      'net.offline': 'Network disconnected',
      'net.online': 'Network restored',
      'bonus.title': 'Candy Storm', 'bonus.spinLeft': 'Spins Left',
      'bonus.totalWin': 'Total Win', 'bonus.multiplier': 'Multiplier', 'bonus.claim': 'Claim'
    }
  };
  Object.keys(STRINGS).forEach(function (k) { Object.freeze(STRINGS[k]); });
  Object.freeze(STRINGS);

  var lang = DEFAULT;

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CODES.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var nav = (typeof navigator !== 'undefined' && navigator.language) || 'zh-CN';
    if (CODES.indexOf(nav) >= 0) return nav;
    var prefix = String(nav).split('-')[0];
    for (var i = 0; i < CODES.length; i++) {
      if (CODES[i].split('-')[0] === prefix) return CODES[i];
    }
    return DEFAULT;
  }

  function lookup(code, key) {
    var d = STRINGS[code];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return undefined;
  }

  function t(key, second) {
    var params = null, fallback = null;
    if (typeof second === 'string') fallback = second;
    else if (second && typeof second === 'object') params = second;

    var val = lookup(lang, key);
    if (val === undefined) {
      var fb = META[lang] && META[lang].fallback;
      if (fb) val = lookup(fb, key);
    }
    if (val === undefined) val = lookup(DEFAULT, key);
    if (val === undefined) val = lookup('en-US', key);
    if (val === undefined) return fallback != null ? fallback : key;

    if (params) {
      val = String(val).replace(/\{(\w+)\}/g, function (_, k) {
        return Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : '{' + k + '}';
      });
    }
    return val;
  }

  function formatMinor(minor, opts) {
    opts = opts || {};
    var locale = opts.locale || lang;
    var currency = opts.currency || 'CNY';
    var n = Number(minor) / 100;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: currency,
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(n);
    } catch (e) {
      return n.toFixed(2) + ' ' + currency;
    }
  }

  function applyLangAttrs() {
    try {
      if (typeof document === 'undefined' || !document.documentElement) return;
      document.documentElement.lang = lang;
      document.documentElement.dir = (META[lang] && META[lang].dir) || 'ltr';
    } catch (e) {}
  }

  function setLang(code) {
    if (CODES.indexOf(code) < 0) return false;
    lang = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    applyLangAttrs();
    return true;
  }

  function getLang() { return lang; }
  function getLangs() { return CODES.slice(); }
  function getMeta(code) { return META[code || lang] || null; }

  try {
    window.addEventListener('storage', function (ev) {
      if (!ev || ev.key !== STORAGE_KEY) return;
      var next = ev.newValue;
      if (next && CODES.indexOf(next) >= 0 && next !== lang) {
        lang = next; applyLangAttrs();
      }
    });
  } catch (e) {}

  lang = detect();
  applyLangAttrs();
  try {
    if (typeof document !== 'undefined' && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyLangAttrs);
    }
  } catch (e) {}

  window.ApexI18n = Object.freeze({
    t: t, set: setLang, get: getLang, langs: getLangs, meta: getMeta,
    formatMinor: formatMinor, STRINGS: STRINGS, REGISTRY: LANG_REGISTRY
  });
})();
