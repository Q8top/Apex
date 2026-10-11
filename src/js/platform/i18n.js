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
      'bonus.totalWin': '累计赢得', 'bonus.multiplier': '倍率合计', 'bonus.claim': '领取',
      'sr.title': '甜蜜爆奖',
      'sr.mode.demo': '试玩模式',
      'sr.mode.real': '正式游戏',
      'sr.balance': '试玩余额',
      'sr.bet': '投注金额',
      'sr.win': '本局赢得',
      'sr.btn.reset': '重置余额',
      'sr.btn.auto': '自动',
      'sr.btn.stop': '停止',
      'sr.btn.spinning': '旋转中',
      'sr.btn.bonus': '免费旋转中',
      'sr.btn.spin': '旋转',
      'sr.btn.fast': '极速',
      'sr.btn.skip': '跳过',
      'sr.fs.title': '免费旋转',
      'sr.fs.sub': 'FREE SPINS',
      'sr.fs.remaining': '剩余',
      'sr.sheet.rules': '游戏规则',
      'sr.sheet.sfx': '音效',
      'sr.sheet.sfx.on': '开',
      'sr.sheet.sfx.off': '关',
      'sr.sheet.privacy': '隐私政策',
      'sr.sheet.terms': '用户协议',
      'sr.back': '返回大厅',
      'sr.rules.intro': '7×7 盘面，相邻 5 个或以上同符号连成一簇即中奖。',
            'sr.rules.board.title': '玩法说明',
      'sr.rules.board.body': '7 列 x 7 行棋盘，每次旋转生成 49 个符号。',
      'sr.rules.cluster.title': '中奖规则',
      'sr.rules.cluster.body': '相邻（上下左右）5 个或以上相同符号连成一簇即中奖，位置不需在同一直线。',
      'sr.rules.scatter.title': 'Scatter 触发',
      'sr.rules.scatter.body': '3 / 4 / 5 / 6 个棒棒糖分别触发 10 / 12 / 15 / 20 次免费旋转，并额外派彩 2x / 5x / 20x / 100x。',
      'sr.rules.retrigger.title': '免费旋转中重触发',
      'sr.rules.retrigger.body': '免费旋转期间再次出现 3 个或以上棒棒糖，可再获得 3 次免费旋转。',
      'sr.rules.bets.title': '下注金额',
      'sr.rules.bets.body': '1.00 / 2.00 / 5.00 / 10.00 / 20.00 / 50.00 / 100.00，共 7 档。',
      'sr.rules.tumble.title': 'Tumble 连消',
      'sr.rules.tumble.body': '中奖符号消失后，上方符号下落，顶部补充新符号，循环直到无中奖。',
      'sr.rules.fs.title': '免费旋转',
      'sr.rules.fs.body': '3 个或以上棒棒糖（Scatter）触发，最高 20 次，可重触发。',
      'sr.rules.bomb.title': '倍率炸弹',
      'sr.rules.bomb.body': '免费旋转中随机出现，值为 2x 至 128x。格子上的标记在每次消除时翻倍（上限 128x），簇的赢利 = 赔表值 x 簇内标记之和，跨回合累积。',
      'sr.rules.notice.title': '注意',
      'sr.rules.notice.item1': '本游戏仅供娱乐，不涉及真实货币。',
      'sr.rules.notice.item2': '试玩模式余额为虚拟，可随时重置。',
      'sr.toast.insufficient': '余额不足，请重置或降低投注',
      'sr.toast.loginRequired': '请先登录',
      'sr.toast.realSpinFailed': '旋转失败'
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
      'bonus.totalWin': 'Total Win', 'bonus.multiplier': 'Multiplier', 'bonus.claim': 'Claim',
      'sr.title': 'Sugar Rush',
      'sr.mode.demo': 'Demo Mode',
      'sr.mode.real': 'Real Play',
      'sr.balance': 'Balance',
      'sr.bet': 'Bet',
      'sr.win': 'Win',
      'sr.btn.reset': 'Reset',
      'sr.btn.auto': 'Auto',
      'sr.btn.stop': 'Stop',
      'sr.btn.spinning': 'Spinning',
      'sr.btn.bonus': 'Free Spins',
      'sr.btn.spin': 'Spin',
      'sr.btn.fast': 'Turbo',
      'sr.btn.skip': 'Skip',
      'sr.fs.title': 'Free Spins',
      'sr.fs.sub': 'FREE SPINS',
      'sr.fs.remaining': 'Left',
      'sr.sheet.rules': 'Game Rules',
      'sr.sheet.sfx': 'Sound',
      'sr.sheet.sfx.on': 'On',
      'sr.sheet.sfx.off': 'Off',
      'sr.sheet.privacy': 'Privacy',
      'sr.sheet.terms': 'Terms',
      'sr.back': 'Back to Lobby',
      'sr.rules.intro': '7x7 grid. Five or more adjacent same symbols form a winning cluster.',
            'sr.rules.board.title': 'Board',
      'sr.rules.board.body': '7 by 7 grid. Each spin places 49 symbols.',
      'sr.rules.cluster.title': 'Cluster Pays',
      'sr.rules.cluster.body': 'Five or more same symbols touching up, down, left or right form a cluster. No alignment required.',
      'sr.rules.scatter.title': 'Scatter Trigger',
      'sr.rules.scatter.body': '3 / 4 / 5 / 6 lollipops trigger 10 / 12 / 15 / 20 free spins, with 2x / 5x / 20x / 100x scatter payout.',
      'sr.rules.retrigger.title': 'Retrigger',
      'sr.rules.retrigger.body': 'Three or more lollipops during free spins award 3 more spins.',
      'sr.rules.bets.title': 'Bet Levels',
      'sr.rules.bets.body': '1.00 / 2.00 / 5.00 / 10.00 / 20.00 / 50.00 / 100.00, 7 levels.',
      'sr.rules.tumble.title': 'Tumble',
      'sr.rules.tumble.body': 'Winning symbols disappear, symbols above fall down, new symbols drop from top, repeat until no more wins.',
      'sr.rules.fs.title': 'Free Spins',
      'sr.rules.fs.body': '3 or more Lollipops (Scatter) trigger up to 20 Free Spins, retriggerable.',
      'sr.rules.bomb.title': 'Multiplier Bomb',
      'sr.rules.bomb.body': 'Appears during free spins with values 2x to 128x. Grid marks double on each cascade (cap 128x). Cluster win = paytable x sum of marks. Marks persist across spins.',
      'sr.rules.notice.title': 'Notice',
      'sr.rules.notice.item1': 'This game is for entertainment only; no real money involved.',
      'sr.rules.notice.item2': 'Demo balance is virtual and can be reset anytime.',
      'sr.toast.insufficient': 'Insufficient balance',
      'sr.toast.loginRequired': 'Please log in',
      'sr.toast.realSpinFailed': 'Spin failed'
    },
    'ja': {
      'game.title': 'キャンディクラッシュ',
      'game.demo': 'デモモード',
      'game.menu': 'メニュー',
      'stat.balance': '残高',
      'stat.bet': 'ベット',
      'stat.win': '勝利',
      'btn.reset': 'リセット',
      'btn.recharge': 'チャージ',
      'btn.auto': 'オート',
      'btn.spin': 'スピン',
      'btn.fast': 'ターボ',
      'btn.stop': '停止',
      'btn.skip': 'スキップ',
      'btn.spinning': 'スピン中',
      'btn.bonus': 'フリースピン中',
      'win.label': '勝利',
      'win.big': 'ビッグウィン',
      'win.mega': 'メガウィン',
      'win.super': 'スーパーウィン',
      'win.epic': 'エピックウィン',
      'win.ultra': 'ウルトラウィン',
      'menu.rules': 'ルール',
      'menu.history': '履歴',
      'menu.settings': '設定',
      'menu.sound': 'サウンド',
      'menu.vibrate': 'バイブ',
      'menu.help': 'ヘルプ',
      'menu.home': 'ホーム',
      'toast.insufficient': '残高不足',
      'toast.reset.done': 'リセット完了',
      'toast.coming': '公開予定',
      'net.offline': 'ネットワーク切断',
      'net.online': 'ネットワーク復旧',
      'bonus.title': 'キャンディストーム',
      'bonus.spinLeft': '残り',
      'bonus.totalWin': '累計',
      'bonus.multiplier': '倍率',
      'bonus.claim': '受取'
    },
    'ko': {
      'game.title': '캔디 크러시',
      'game.demo': '데모 모드',
      'game.menu': '게임 메뉴',
      'stat.balance': '잔액',
      'stat.bet': '베팅',
      'stat.win': '승리',
      'btn.reset': '리셋',
      'btn.recharge': '충전',
      'btn.auto': '자동',
      'btn.spin': '스핀',
      'btn.fast': '터보',
      'btn.stop': '정지',
      'btn.skip': '건너뛰기',
      'btn.spinning': '스핀 중',
      'btn.bonus': '프리 스핀 중',
      'win.label': '승리',
      'win.big': '빅 윈',
      'win.mega': '메가 윈',
      'win.super': '슈퍼 윈',
      'win.epic': '에픽 윈',
      'win.ultra': '울트라 윈',
      'menu.rules': '규칙',
      'menu.history': '기록',
      'menu.settings': '설정',
      'menu.sound': '사운드',
      'menu.vibrate': '진동',
      'menu.help': '도움말',
      'menu.home': '홈',
      'toast.insufficient': '잔액 부족',
      'toast.reset.done': '리셋 완료',
      'toast.coming': '개발 중',
      'net.offline': '네트워크 끊김',
      'net.online': '네트워크 복구',
      'bonus.title': '캔디 스톰',
      'bonus.spinLeft': '남은 횟수',
      'bonus.totalWin': '누적 상금',
      'bonus.multiplier': '배수',
      'bonus.claim': '받기'
    },
    'es': {
      'game.title': 'Apex Candy',
      'game.demo': 'Modo Demo',
      'game.menu': 'Menú',
      'stat.balance': 'Saldo',
      'stat.bet': 'Apuesta',
      'stat.win': 'Ganancia',
      'btn.reset': 'Reiniciar',
      'btn.recharge': 'Recargar',
      'btn.auto': 'Auto',
      'btn.spin': 'Girar',
      'btn.fast': 'Turbo',
      'btn.stop': 'Parar',
      'btn.skip': 'Saltar',
      'btn.spinning': 'Girando',
      'btn.bonus': 'Tiradas gratis',
      'win.label': 'Ganancia',
      'win.big': 'Gran premio',
      'win.mega': 'Mega premio',
      'win.super': 'Súper premio',
      'win.epic': 'Épico',
      'win.ultra': 'Ultra',
      'menu.rules': 'Reglas',
      'menu.history': 'Historial',
      'menu.settings': 'Ajustes',
      'menu.sound': 'Sonido',
      'menu.vibrate': 'Vibración',
      'menu.help': 'Ayuda',
      'menu.home': 'Inicio',
      'toast.insufficient': 'Saldo insuficiente',
      'toast.reset.done': 'Saldo reiniciado',
      'toast.coming': 'Próximamente',
      'net.offline': 'Sin conexión',
      'net.online': 'Conexión restaurada',
      'bonus.title': 'Candy Storm',
      'bonus.spinLeft': 'Tiradas restantes',
      'bonus.totalWin': 'Total ganado',
      'bonus.multiplier': 'Multiplicador',
      'bonus.claim': 'Reclamar'
    },
    'pt-BR': {
      'game.title': 'Apex Candy',
      'game.demo': 'Modo Demo',
      'game.menu': 'Menu',
      'stat.balance': 'Saldo',
      'stat.bet': 'Aposta',
      'stat.win': 'Ganho',
      'btn.reset': 'Reiniciar',
      'btn.recharge': 'Recarregar',
      'btn.auto': 'Auto',
      'btn.spin': 'Girar',
      'btn.fast': 'Turbo',
      'btn.stop': 'Parar',
      'btn.skip': 'Pular',
      'btn.spinning': 'Girando',
      'btn.bonus': 'Giros grátis',
      'win.label': 'Ganho',
      'win.big': 'Grande prêmio',
      'win.mega': 'Mega prêmio',
      'win.super': 'Super prêmio',
      'win.epic': 'Épico',
      'win.ultra': 'Ultra',
      'menu.rules': 'Regras',
      'menu.history': 'Histórico',
      'menu.settings': 'Configurações',
      'menu.sound': 'Som',
      'menu.vibrate': 'Vibração',
      'menu.help': 'Ajuda',
      'menu.home': 'Início',
      'toast.insufficient': 'Saldo insuficiente',
      'toast.reset.done': 'Saldo reiniciado',
      'toast.coming': 'Em breve',
      'net.offline': 'Sem conexão',
      'net.online': 'Conexão restaurada',
      'bonus.title': 'Candy Storm',
      'bonus.spinLeft': 'Giros restantes',
      'bonus.totalWin': 'Total ganho',
      'bonus.multiplier': 'Multiplicador',
      'bonus.claim': 'Resgatar'
    },
    'ar': {
      'game.title': 'حلوى الانفجار',
      'game.demo': 'وضع التجريب',
      'game.menu': 'القائمة',
      'stat.balance': 'الرصيد',
      'stat.bet': 'الرهان',
      'stat.win': 'الفوز',
      'btn.reset': 'إعادة تعيين',
      'btn.recharge': 'إعادة شحن',
      'btn.auto': 'تلقائي',
      'btn.spin': 'دوران',
      'btn.fast': 'سريع',
      'btn.stop': 'إيقاف',
      'btn.skip': 'تخطي',
      'btn.spinning': 'يدور',
      'btn.bonus': 'دورات مجانية',
      'win.label': 'الفوز',
      'win.big': 'فوز كبير',
      'win.mega': 'فوز ميغا',
      'win.super': 'فوز سوبر',
      'win.epic': 'فوز ملحمي',
      'win.ultra': 'فوز فائق',
      'menu.rules': 'القواعد',
      'menu.history': 'السجل',
      'menu.settings': 'الإعدادات',
      'menu.sound': 'الصوت',
      'menu.vibrate': 'الاهتزاز',
      'menu.help': 'المساعدة',
      'menu.home': 'الرئيسية',
      'toast.insufficient': 'الرصيد غير كافي',
      'toast.reset.done': 'تمت إعادة التعيين',
      'toast.coming': 'قريبا',
      'net.offline': 'انقطع الاتصال',
      'net.online': 'تم استعادة الاتصال',
      'bonus.title': 'Candy Storm',
      'bonus.spinLeft': 'الدورات المتبقية',
      'bonus.totalWin': 'الإجمالي',
      'bonus.multiplier': 'المضاعف',
      'bonus.claim': 'استلام'
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
