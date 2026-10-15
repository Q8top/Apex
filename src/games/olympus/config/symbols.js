// Apex Olympus - symbol definitions
// type:  low | mid | high | scatter | multiplier
// pay :  [8, 9, 10, 11, 12+] connected -> bet multipliers
//        (for multiplier symbols pay is [] because they have a value instead)
// NOTE: original Gates of Olympus uses Pay-Anywhere (8+ of same kind
//       anywhere on the board), not cluster-adjacency. Engine will follow
//       the Pay-Anywhere rule.

window.OlympusSymbols = Object.freeze({
  SYMBOLS: [
    { id: 'sym-0',  src: '/assets/symbols/sym-0.webp',  n: '\u7D2B\u5B9D\u77F3', type: 'multiplier', value: 2,   pay: [] },
    { id: 'sym-1',  src: '/assets/symbols/sym-1.webp',  n: '\u84DD\u5B9D\u77F3', type: 'multiplier', value: 5,   pay: [] },
    { id: 'sym-2',  src: '/assets/symbols/sym-2.webp',  n: '\u7EFF\u5B9D\u77F3', type: 'multiplier', value: 10,  pay: [] },
    { id: 'sym-3',  src: '/assets/symbols/sym-3.webp',  n: '\u7EA2\u5B9D\u77F3', type: 'multiplier', value: 25,  pay: [] },
    { id: 'sym-4',  src: '/assets/symbols/sym-4.webp',  n: '\u6C99\u6F0F',      type: 'mid',  pay: [0.5, 1.0, 1.5, 3.0, 5.0] },
    { id: 'sym-5',  src: '/assets/symbols/sym-5.webp',  n: '\u6212\u6307',      type: 'mid',  pay: [0.5, 1.0, 2.0, 4.0, 10.0] },
    { id: 'sym-6',  src: '/assets/symbols/sym-6.webp',  n: '\u5723\u676F',      type: 'mid',  pay: [0.75, 1.5, 3.0, 6.0, 15.0] },
    { id: 'sym-7',  src: '/assets/symbols/sym-7.webp',  n: '\u7EA2\u516D\u8FB9\u5B9D\u77F3', type: 'high', pay: [1.0, 2.0, 4.0, 8.0, 20.0] },
    { id: 'sym-8',  src: '/assets/symbols/sym-8.webp',  n: '\u7D2B\u4E09\u89D2\u5B9D\u77F3', type: 'high', pay: [0.25, 0.5, 0.75, 1.5, 2.5] },
    { id: 'sym-9',  src: '/assets/symbols/sym-9.webp',  n: '\u9EC4\u516D\u8FB9\u5B9D\u77F3', type: 'high', pay: [0.25, 0.5, 0.75, 1.5, 2.5] },
    { id: 'sym-10', src: '/assets/symbols/sym-10.webp', n: '\u7EFF\u4E09\u89D2\u5B9D\u77F3', type: 'high', pay: [0.25, 0.5, 1.0, 2.0, 4.0] },
    { id: 'sym-11', src: '/assets/symbols/sym-11.webp', n: '\u84DD\u83F1\u5F62\u5B9D\u77F3', type: 'high', pay: [0.4, 0.8, 1.2, 2.0, 5.0] },
    { id: 'sym-12', src: '/assets/symbols/sym-12.webp', n: 'Zeus', type: 'scatter', pay: [] }
  ],

  // helpers
  getById: function (id) {
    for (var i = 0; i < this.SYMBOLS.length; i++) {
      if (this.SYMBOLS[i].id === id) return this.SYMBOLS[i];
    }
    return null;
  },
  getMultiplierSymbols: function () {
    return this.SYMBOLS.filter(function (s) { return s.type === "multiplier"; });
  },
  getScatter: function () {
    for (var i = 0; i < this.SYMBOLS.length; i++) {
      if (this.SYMBOLS[i].type === "scatter") return this.SYMBOLS[i];
    }
    return null;
  }
});
