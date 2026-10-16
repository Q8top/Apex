'use strict';
/* Apex - Olympus simulator. Loads src/games/olympus/** and runs
 * playBase + FS loop over N spins with a seeded RNG. Reports RTP,
 * hit rate, FS trigger rate, avg FS len, max win. */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;
if (!global.window) global.window = {};

[
  '/src/games/olympus/config/symbols.js',
  '/src/games/olympus/config/paytable.js',
  '/src/games/olympus/config/reel-weights.js',
  '/src/games/olympus/config/math-profile.js',
  '/src/games/olympus/engine/matcher.js',
  '/src/games/olympus/engine/reels.js',
  '/src/games/olympus/engine/multiplier.js',
  '/src/games/olympus/engine/tumble.js',
  '/src/games/olympus/engine/round.js'
].forEach(function(p){ require(ROOT + p); });
require(ROOT + '/functions/games/olympus/config/real-profile.js');
var REAL_PROFILE = global.window.OlympusRealProfile && global.window.OlympusRealProfile.REAL;

var S  = global.window.OlympusSymbols;
var P  = global.window.OlympusPaytable;
var RW = global.window.OlympusReelWeights;
var MP = global.window.OlympusMathProfile;
var M  = global.window.OlympusMatcher;
var R  = global.window.OlympusReels;
var Mu = global.window.OlympusMultiplier;
var TB = global.window.OlympusTumble;
var RD = global.window.OlympusRound;

function SeededRng(seed) {
  var h = 2166136261 >>> 0;
  var s = String(seed);
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  this.state = h || 1;
}
SeededRng.prototype.next = function () {
  var x = this.state;
  x ^= (x << 13) >>> 0; x = x >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  this.state = x >>> 0;
  return this.state / 4294967296;
};

function simulate(mode, spins, seed) {
  var profile;
  if (mode === 'real') {
    if (!REAL_PROFILE) throw new Error('real profile not loaded');
    profile = REAL_PROFILE;
  } else {
    profile = MP.getProfile(mode);
  }
  var rngObj = new SeededRng(seed);
  var rng = function () { return rngObj.next(); };
  var strips = R.buildStrips({ WEIGHTS: RW.columnsOf() }, rng);
  var totalWinX = 0, hits = 0, fsTriggers = 0, fsSpinsTotal = 0, maxWin = 0;
  var baseHits = 0, fsHits = 0;
  for (var i = 0; i < spins; i++) {
    var r = RD.playBase({
      strips: strips, symbols: S.SYMBOLS, paytable: P,
      reels: R, matcher: M, tumble: TB, multiplier: Mu,
      rng: rng, profile: profile
    });
    totalWinX += r.baseWin;
    if (r.baseWin > 0) { hits++; baseHits++; }
    if (r.baseWin > maxWin) maxWin = r.baseWin;
    if (r.triggerFS) {
      fsTriggers++;
      var st = RD.startFreeSpins({ count: r.fsAward, tumble: TB });
      var guard = 0;
      while (st.remaining > 0 && guard < 500) {
        var fr = RD.nextFreeSpin(st, {
          strips: strips, symbols: S.SYMBOLS, paytable: P,
          reels: R, matcher: M, tumble: TB, multiplier: Mu,
          rng: rng, profile: profile
        });
        if (!fr) break;
        guard++;
      }
      fsSpinsTotal += st.spinsPlayed;
      totalWinX += st.totalWin;
      if (st.totalWin > 0) fsHits++;
      if (st.totalWin > maxWin) maxWin = st.totalWin;
    }
  }
  return {
    mode: mode, seed: seed, spins: spins,
    payScale: profile.payScale,
    rtp: Number((totalWinX / spins).toFixed(6)),
    hitRate: Number((hits / spins).toFixed(6)),
    baseHitRate: Number((baseHits / spins).toFixed(6)),
    fsTriggerRate: Number((fsTriggers / spins).toFixed(6)),
    fsHitRate: Number((fsHits / spins).toFixed(6)),
    avgFsLen: fsTriggers > 0 ? Number((fsSpinsTotal / fsTriggers).toFixed(3)) : 0,
    maxWinX: Number(maxWin.toFixed(2))
  };
}

var argv = process.argv.slice(2);
var opts = { mode: 'demo', spins: 100000, seed: 'd1' };
for (var i = 0; i < argv.length; i++) {
  var arg = argv[i], k, v, eq = arg.indexOf('=');
  if (eq > 0) { k = arg.slice(0, eq); v = arg.slice(eq + 1); }
  else { k = arg; v = argv[i + 1]; if (v == null || v.slice(0,2) === '--') v = undefined; else i++; }
  if (k === '--mode') opts.mode = v;
  else if (k === '--spins') opts.spins = parseInt(v, 10);
  else if (k === '--seed') opts.seed = v;
  else if (k === '--help') { console.log('usage: --mode=demo|real --spins=N --seed=S'); process.exit(0); }
}
var res = simulate(opts.mode, opts.spins, opts.seed);
console.log(JSON.stringify(res, null, 2));
