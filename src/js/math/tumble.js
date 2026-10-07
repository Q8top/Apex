/* Apex · Tumble Engine
 * 移除中奖符号 → 列内压缩 → 顶部补新符号
 * 输入：grid (30), removePositions (array of index)
 * 输出：{ grid, moves, added }  仅数据，不涉及动画
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;

  function idx(col, row) { return row * COLS + col; }

  function removeAndCompress(grid, positions, pickSymbol) {
    if (!Array.isArray(grid) || grid.length !== COLS * ROWS) {
      throw new Error('tumble: grid 长度必须为 30');
    }
    if (typeof pickSymbol !== 'function') {
      throw new Error('tumble: 需要 pickSymbol 回调');
    }

    var kill = {};
    for (var i = 0; i < positions.length; i++) kill[positions[i]] = 1;

    var next = grid.slice();
    var moves = [];   // { from, to } 用于动画
    var added = [];   // { col, symbol, landedAt }

    for (var c = 0; c < COLS; c++) {
      var survivors = [];
      for (var r = ROWS - 1; r >= 0; r--) {
        var src = idx(c, r);
        if (!kill[src]) survivors.push({ symbol: grid[src], row: r });
      }
      // 从底往上重新填充
      var writeRow = ROWS - 1;
      for (var s = 0; s < survivors.length; s++) {
        var from = idx(c, survivors[s].row);
        var to = idx(c, writeRow);
        next[to] = survivors[s].symbol;
        if (from !== to) moves.push({ from: from, to: to });
        writeRow--;
      }
      // 剩余顶部补新
      while (writeRow >= 0) {
        var sym = pickSymbol(c, writeRow);
        var land = idx(c, writeRow);
        next[land] = sym;
        added.push({ col: c, symbol: sym, landedAt: land });
        writeRow--;
      }
    }

    return { grid: next, moves: moves, added: added };
  }

  window.ApexTumble = Object.freeze({
    COLS: COLS,
    ROWS: ROWS,
    removeAndCompress: removeAndCompress
  });
})();
