// Apex Olympus - symbol definitions
// Multiplier gems use 4 base images (sym-0..sym-3) but 15 face
// values shown as a numeric overlay at render time. The gem
// colour maps to a value bucket:
//   sym-0 (purple): 2, 3, 4, 5
//   sym-1 (blue):   6, 8, 10, 12
//   sym-2 (green):  15, 20, 25, 50
//   sym-3 (red):    100, 250, 500

window.OlympusSymbols = Object.freeze({
  SYMBOLS: [
    { id: 'sym-0', src: '/assets/symbols/sym-0.webp', type: 'multiplier', bucket: 0, values: [2,3,4,5] },
    { id: 'sym-1', src: '/assets/symbols/sym-1.webp', type: 'multiplier', bucket: 1, values: [6,8,10,12] },
    { id: 'sym-2', src: '/assets/symbols/sym-2.webp', type: 'multiplier', bucket: 2, values: [15,20,25,50] },
    { id: 'sym-3', src: '/assets/symbols/sym-3.webp', type: 'multiplier', bucket: 3, values: [100,250,500] },
    { id: 'sym-4',  src: '/assets/symbols/sym-4.webp',  type: 'mid',  pay: [0.5, 1.0, 1.5, 3.0, 5.0] },
    { id: 'sym-5',  src: '/assets/symbols/sym-5.webp',  type: 'mid',  pay: [0.5, 1.0, 2.0, 4.0, 10.0] },
    { id: 'sym-6',  src: '/assets/symbols/sym-6.webp',  type: 'mid',  pay: [0.75, 1.5, 3.0, 6.0, 15.0] },
    { id: 'sym-7',  src: '/assets/symbols/sym-7.webp',  type: 'high', pay: [1.0, 2.0, 4.0, 8.0, 20.0] },
    { id: 'sym-8',  src: '/assets/symbols/sym-8.webp',  type: 'high', pay: [0.25, 0.5, 0.75, 1.5, 2.5] },
    { id: 'sym-9',  src: '/assets/symbols/sym-9.webp',  type: 'high', pay: [0.25, 0.5, 0.75, 1.5, 2.5] },
    { id: 'sym-10', src: '/assets/symbols/sym-10.webp', type: 'high', pay: [0.25, 0.5, 1.0, 2.0, 4.0] },
    { id: 'sym-11', src: '/assets/symbols/sym-11.webp', type: 'high', pay: [0.4, 0.8, 1.2, 2.0, 5.0] },
    { id: 'sym-12', src: '/assets/symbols/sym-12.webp', type: 'scatter' }
  ],
  getById: function (id) {
    for (var i = 0; i < this.SYMBOLS.length; i++)
      if (this.SYMBOLS[i].id === id) return this.SYMBOLS[i];
    return null;
  },
  getScatter: function () {
    for (var i = 0; i < this.SYMBOLS.length; i++)
      if (this.SYMBOLS[i].type === "scatter") return this.SYMBOLS[i];
    return null;
  },
  isMultiplier: function (id) {
    var d = this.getById(id);
    return !!(d && d.type === "multiplier");
  }
});
