/* Gates of Olympus · 服务端 RNG
 *
 * 🔒 机密文件 — 严禁以任何形式暴露到前端
 *    基于 crypto.getRandomValues 生成种子 → xorshift128 伪随机序列
 *    支持 seed 复现（Debug / Replay）
 *    ⚠️ 禁止调用 Math.random（CI 会拦截）
 */

function randomSeed() {
  var buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(function(n) {
    return ('00000000' + n.toString(16)).slice(-8);
  }).join('');
}

function hashSeed(seed) {
  var out = new Uint32Array(4);
  for (var k = 0; k < 4; k++) {
    var h = (2166136261 >>> 0) ^ (k * 2654435761);
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    out[k] = h;
  }
  return out;
}

export class RNG {
  constructor(seed) {
    this._seed = seed || randomSeed();
    var s = hashSeed(this._seed);
    if (s[0] === 0 && s[1] === 0 && s[2] === 0 && s[3] === 0) s[0] = 1;
    this._s0 = s[0] >>> 0;
    this._s1 = s[1] >>> 0;
    this._s2 = s[2] >>> 0;
    this._s3 = s[3] >>> 0;
    for (var i = 0; i < 16; i++) this._next32();
  }

  _next32() {
    var t = this._s3;
    var s = this._s0;
    this._s3 = this._s2;
    this._s2 = this._s1;
    this._s1 = s;
    t ^= t << 11;
    t ^= t >>> 8;
    this._s0 = (t ^ s ^ (s >>> 19)) >>> 0;
    return this._s0;
  }

  next() {
    return this._next32() / 4294967296;
  }

  int(min, max) {
    var span = max - min + 1;
    return min + Math.floor(this.next() * span);
  }

  pickWeighted(items, getWeight) {
    var total = 0;
    for (var i = 0; i < items.length; i++) total += getWeight(items[i]);
    if (total <= 0) return items[0];
    var r = this.next() * total;
    var acc = 0;
    for (var j = 0; j < items.length; j++) {
      acc += getWeight(items[j]);
      if (r < acc) return items[j];
    }
    return items[items.length - 1];
  }

  getSeed() { return this._seed; }
}

export { randomSeed };
