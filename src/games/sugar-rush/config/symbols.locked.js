(function(){
'use strict';
/* Apex Sugar Rush - Symbol Locked Manifest
 * 11 symbols. Frozen.
 * Global: window.ApexSugarRushSymbolsLocked
 */
var LOCKED = Object.freeze({
  blue_candy:   Object.freeze({ id:'blue_candy',   kind:'regular',    paytableKey:'BLUE_CANDY' }),
  green_candy:  Object.freeze({ id:'green_candy',  kind:'regular',    paytableKey:'GREEN_CANDY' }),
  purple_candy: Object.freeze({ id:'purple_candy', kind:'regular',    paytableKey:'PURPLE_CANDY' }),
  red_candy:    Object.freeze({ id:'red_candy',    kind:'regular',    paytableKey:'RED_CANDY' }),
  strawberry:   Object.freeze({ id:'strawberry',   kind:'regular',    paytableKey:'STRAWBERRY' }),
  orange:       Object.freeze({ id:'orange',       kind:'regular',    paytableKey:'ORANGE' }),
  mango:        Object.freeze({ id:'mango',        kind:'regular',    paytableKey:'MANGO' }),
  lollipop:     Object.freeze({ id:'lollipop',     kind:'scatter',    paytableKey:null }),
  candy_bomb:   Object.freeze({ id:'candy_bomb',   kind:'multiplier', paytableKey:null })
});

function assertSymbolsLocked(next) {
  var cur = Object.keys(LOCKED).sort().join(',');
  var nxt = Object.keys(next).sort().join(',');
  if (cur !== nxt) throw new Error('SUGAR_RUSH_SYMBOLS_LOCKED mismatch');
  return true;
}
function isLocked(id) { return Object.prototype.hasOwnProperty.call(LOCKED, id); }
function list() { return Object.keys(LOCKED); }
function kindOf(id) { var s = LOCKED[id]; return s ? s.kind : null; }


var LABELS = Object.freeze({
  blue_candy:   '橙色软糖熊',
  green_candy:  '紫色软糖熊',
  purple_candy: '红色软糖熊',
  red_candy:    '绿色星星糖',
  strawberry:   '紫色果冻豆',
  orange:       '橙色爱心糖',
  mango:        '粉色圆形糖果',
  lollipop:     '棒棒糖',
  candy_bomb:   '倍率炸弹'
});
function labelOf(id){ return LABELS[id] || id; }

window.ApexSugarRushSymbolsLocked = Object.freeze({
  SYMBOLS_LOCKED: true,
  LOCKED: LOCKED,
  assertSymbolsLocked: assertSymbolsLocked,
  isLocked: isLocked,
  list: list,
  kindOf: kindOf,
  LABELS: LABELS,
  labelOf: labelOf
});
})();
