/* Apex · i18n 本地化
 * 支持 zh-CN / en-US，语言从 localStorage 或 navigator.language
 *
 * 说明：
 *   - 未知 locale 一律回退 DEFAULT，不尝试 zh-TW/zh-HK 拆分（当前无繁体表）
 *   - t(key) 使用 hasOwnProperty 查表，避免命中原型链（如 t('toString')）
 *   - STRINGS 深层冻结，禁止运行时改写
 *   - 监听 storage 事件，多标签语言切换自动同步
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'apex.sweet.lang';
  var DEFAULT = 'zh-CN';

  var STRINGS = {
    'zh-CN': {
      'game.title':           '糖果连连爆',
      'game.demo':            '试玩模式',
      'game.menu':            '游戏菜单',
      'stat.balance':         '试玩余额',
      'stat.bet':             '投注金额',
      'stat.win':             '本局赢得',
      'btn.reset':            '重置余额',
      'btn.recharge':         '充值余额',
      'btn.auto':             '自动',
      'btn.spin':             '旋转',
      'btn.fast':             '极速',
      'btn.stop':             '停止',
      'btn.spinning':         '旋转中',
      'btn.bonus':            '免费旋转中',
      'win.label':            '本局赢得',
      'win.big':              '大奖',
      'win.mega':             '超级中奖',
      'win.super':            '超级大奖',
      'menu.rules':           '游戏规则',
      'menu.history':         '游戏记录',
      'menu.settings':        '游戏设置',
      'menu.sound':           '音效设置',
      'menu.vibrate':         '震动反馈',
      'menu.help':            '游戏帮助',
      'menu.home':            '返回大厅',
      'toast.insufficient':   '试玩余额不足',
      'toast.reset.done':     '试玩余额已重置',
      'toast.coming':         '功能开发中',
      'bonus.title':          'Candy Storm',
      'bonus.spinLeft':       '剩余局数',
      'bonus.totalWin':       '累计赢得',
      'bonus.multiplier':     '倍率合计',
      'bonus.claim':          '领取'
    },
    'en-US': {
      'game.title':           'Candy Tumble',
      'game.demo':            'Demo Mode',
      'game.menu':            'Game Menu',
      'stat.balance':         'Balance',
      'stat.bet':             'Bet',
      'stat.win':             'Win',
      'btn.reset':            'Reset',
      'btn.recharge':         'Recharge',
      'btn.auto':             'Auto',
      'btn.spin':             'Spin',
      'btn.fast':             'Turbo',
      'btn.stop':             'Stop',
      'btn.spinning':         'Spinning',
      'btn.bonus':            'Free Spins',
      'win.label':            'Win',
      'win.big':              'Big Win',
      'win.mega':             'Mega Win',
      'win.super':            'Super Win',
      'menu.rules':           'Rules',
      'menu.history':         'History',
      'menu.settings':        'Settings',
      'menu.sound':           'Sound',
      'menu.vibrate':         'Haptics',
      'menu.help':            'Help',
      'menu.home':            'Home',
      'toast.insufficient':   'Insufficient balance',
      'toast.reset.done':     'Balance reset',
      'toast.coming':         'Coming soon',
      'bonus.title':          'Candy Storm',
      'bonus.spinLeft':       'Spins Left',
      'bonus.totalWin':       'Total Win',
      'bonus.multiplier':     'Multiplier',
      'bonus.claim':          'Claim'
    }
  };

  // 深层冻结：外层 + 每个语言字典
  Object.keys(STRINGS).forEach(function (k) { Object.freeze(STRINGS[k]); });
  Object.freeze(STRINGS);

  var lang = DEFAULT;

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (e) {}
    var nav = (navigator.language || 'zh-CN');
    if (nav.indexOf('zh') === 0) return 'zh-CN';
    if (nav.indexOf('en') === 0) return 'en-US';
    return DEFAULT;
  }

  function t(key, fallback) {
    var dict = STRINGS[lang] || STRINGS[DEFAULT];
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    var fb = STRINGS[DEFAULT];
    if (Object.prototype.hasOwnProperty.call(fb, key)) return fb[key];
    return (fallback !== undefined && fallback !== null) ? fallback : key;
  }

  function setLang(code) {
    if (!STRINGS[code]) return false;
    lang = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    return true;
  }

  function getLang() { return lang; }
  function getLangs() { return Object.keys(STRINGS); }

  // 多标签同步：其他标签改了 STORAGE_KEY，本标签跟随
  try {
    window.addEventListener('storage', function (ev) {
      if (!ev || ev.key !== STORAGE_KEY) return;
      var next = ev.newValue;
      if (next && STRINGS[next] && next !== lang) lang = next;
    });
  } catch (e) {}

  lang = detect();

  window.ApexI18n = Object.freeze({
    t: t,
    set: setLang,
    get: getLang,
    langs: getLangs,
    STRINGS: STRINGS
  });
})();
