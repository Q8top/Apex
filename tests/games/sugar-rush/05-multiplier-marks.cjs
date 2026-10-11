'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }
var M = window.ApexSugarRushMultiplier;
ok(typeof M.MarkState === 'function', 'MarkState exists');
ok(M.GRID_SIZE === 49, 'GRID_SIZE=49');
ok(M.MARKED === 1, 'MARKED=1');
ok(M.MAX_MARK === 128, 'MAX_MARK=128');

// 原版语义测试
var st = new M.MarkState();
ok(st.get(0) === 0, 'init 0 (unmarked)');

// 第 1 次获胜：仅标记
st.updateAfterWin([5]);
ok(st.get(5) === M.MARKED, '1st win: 0 -> MARKED(1)');

// 第 2 次获胜：MARKED -> 2x
st.updateAfterWin([5]);
ok(st.get(5) === 2, '2nd win: MARKED -> 2x');

// 第 3 次获胜：2x -> 4x
st.updateAfterWin([5]);
ok(st.get(5) === 4, '3rd win: 2x -> 4x');

// 第 4-7 次
st.updateAfterWin([5]); ok(st.get(5) === 8,  '4th: 4x -> 8x');
st.updateAfterWin([5]); ok(st.get(5) === 16, '5th: 8x -> 16x');
st.updateAfterWin([5]); ok(st.get(5) === 32, '6th: 16x -> 32x');
st.updateAfterWin([5]); ok(st.get(5) === 64, '7th: 32x -> 64x');
st.updateAfterWin([5]); ok(st.get(5) === 128, '8th: 64x -> 128x');

// 封顶
st.updateAfterWin([5]); ok(st.get(5) === 128, '9th: capped at 128x');
st.updateAfterWin([5]); ok(st.get(5) === 128, '10th: still 128x');

// sumInCluster: MARKED 不计入
var st2 = new M.MarkState();
st2.updateAfterWin([0]);      // 0 -> MARKED
st2.updateAfterWin([1]);      // 1 -> MARKED
st2.updateAfterWin([1]);      // 1 -> 2x
st2.updateAfterWin([2]);      // 2 -> MARKED
st2.updateAfterWin([2]);      // 2 -> 2x
st2.updateAfterWin([2]);      // 2 -> 4x

ok(st2.sumInCluster([0]) === 0,    'cluster [0]: MARKED only -> 0');
ok(st2.sumInCluster([1]) === 2,    'cluster [1]: 2x -> 2');
ok(st2.sumInCluster([2]) === 4,    'cluster [2]: 4x -> 4');
ok(st2.sumInCluster([0,1,2]) === 6, 'cluster [0,1,2]: 0 + 2 + 4 = 6');

// 顺序保证：先用已有乘数，再更新
var st3 = new M.MarkState();
// 假设一个位置第一次赢
st3.updateAfterWin([10]);   // MARKED
// 第二次赢：结算时用 0（只标记），然后变成 2x
var win2 = st3.sumInCluster([10]);
ok(win2 === 0, 'before 2nd win: multiplier = 0');
st3.updateAfterWin([10]);   // MARKED -> 2x
ok(st3.get(10) === 2, 'after 2nd win: 2x');
// 第三次赢：结算时用 2，然后变成 4x
var win3 = st3.sumInCluster([10]);
ok(win3 === 2, 'before 3rd win: multiplier = 2');
st3.updateAfterWin([10]);
ok(st3.get(10) === 4, 'after 3rd win: 4x');

// snapshot / restore
var st4 = new M.MarkState();
st4.updateAfterWin([3, 20, 48]);
st4.updateAfterWin([3, 20, 48]);
var snap = st4.snapshot();
ok(snap.length === 3, 'snapshot 3 entries');
var st5 = new M.MarkState({ fromSnapshot: snap });
ok(st5.get(3) === 2, 'restore pos 3: 2x');
ok(st5.get(20) === 2, 'restore pos 20: 2x');
ok(st5.get(48) === 2, 'restore pos 48: 2x');

// reset
st5.reset();
ok(st5.get(3) === 0, 'reset clears');
ok(st5.snapshot().length === 0, 'reset snapshot empty');

// legacy API
var ls = new M.MultiplierState();
ls.add(0, 5); ls.add(1, 10);
ok(ls.total() === 15, 'legacy total');
ok(ls.size() === 2, 'legacy size');

// visual
var st6 = new M.MarkState();
st6.updateAfterWin([0]);
st6.updateAfterWin([0]);
st6.updateAfterWin([5]);
var vis = st6.visual();
ok(vis.length === 2, 'visual 2');
ok(vis[0].position === 0 && vis[0].value === 2, 'visual[0] = {0, 2}');
ok(vis[1].position === 5 && vis[1].value === 1, 'visual[1] = {5, 1 MARKED}');

// validation
var threw = false;
try { st6.set(10, 3); } catch (e) { threw = true; }
ok(threw, 'reject non-power-of-2 value');
threw = false;
try { st6.set(10, 0); } catch (e) { threw = true; }
ok(!threw, 'accept 0 (unmarked)');
threw = false;
try { st6.set(10, 1); } catch (e) { threw = true; }
ok(!threw, 'accept 1 (MARKED)');

console.log('[multiplier-marks] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
