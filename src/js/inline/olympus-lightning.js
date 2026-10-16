/* Apex Olympus - Zeus lightning strike on the board. */
(function (global) {
'use strict';
var canvas = null, ctx = null, raf = 0;
var bolts = [];
var swirls = [];
var auraOn = false;
var ripples = [];
var DPR = 1;
var resizeBound = false;
var BOARD = { L: 0.044, R: 0.967, T: 0.230, B: 0.530 };
var rndState = 0;
var NOISE = (function () {
var buf = new Uint32Array(256);
crypto.getRandomValues(buf);
var out = new Float64Array(256);
for (var i = 0; i < 256; i++) out[i] = buf[i] / 4294967296;
return out;
})();
function rnd() {
rndState = (rndState + 1) & 255;
return NOISE[rndState];
}
function initCanvas() {
if (canvas) return true;
canvas = document.getElementById('olLightning');
if (!canvas) return false;
ctx = canvas.getContext('2d');
resize();
if (!resizeBound) {
  resizeBound = true;
  window.addEventListener('resize', resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
  }
}
return true;
}
function resize() {
if (!canvas) return;
var nextDPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
var cw = canvas.clientWidth, ch = canvas.clientHeight;
if (cw <= 0 || ch <= 0) return;
var nw = Math.floor(cw * nextDPR);
var nh = Math.floor(ch * nextDPR);
DPR = nextDPR;
// setting width/height clears the canvas - only do it when it really changes
if (canvas.width !== nw || canvas.height !== nh) {
  canvas.width = nw;
  canvas.height = nh;
}
}
function makeBolt(sx, sy, ex, ey) {
var segs = 14 + Math.floor(rnd() * 6);
var pts = [{ x: sx, y: sy }];
var dx = ex - sx, dy = ey - sy;
var perpX = -dy, perpY = dx;
var len = Math.sqrt(dx*dx + dy*dy) || 1;
perpX /= len; perpY /= len;
for (var i = 1; i < segs; i++) {
var t = i / segs;
var jitter = Math.sin(t * Math.PI) * (18 + rnd() * 26) * (rnd() - 0.5) * 2;
pts.push({ x: sx + dx * t + perpX * jitter, y: sy + dy * t + perpY * jitter });
}
pts.push({ x: ex, y: ey });
return pts;
}
function branches(pts) {
var out = [];
if (!pts || pts.length < 10) return out;
var n = 2 + Math.floor(rnd() * 2);
for (var b = 0; b < n; b++) {
var idx = 3 + Math.floor(rnd() * (pts.length - 6));
if (idx < 0 || idx >= pts.length) continue;
var base = pts[idx];
var dir = rnd() < 0.5 ? 1 : -1;
var br = [{ x: base.x, y: base.y }];
var cx = base.x, cy = base.y;
var steps = 3 + Math.floor(rnd() * 3);
for (var s = 0; s < steps; s++) {
cx += (rnd() - 0.5) * 46 + dir * 18;
cy += (rnd() - 0.3) * 32 + 22;
br.push({ x: cx, y: cy });
}
out.push(br);
}
return out;
}
function drawPolyline(pts, w, color, blur) {
ctx.save();
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.shadowColor = color;
ctx.shadowBlur = blur;
ctx.strokeStyle = color;
ctx.lineWidth = w;
ctx.beginPath();
ctx.moveTo(pts[0].x, pts[0].y);
for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
ctx.stroke();
ctx.restore();
}
function drawBolt(b, age) {
var fade = 1 - Math.min(1, age / 420);
if (fade <= 0) return;
var pts = b.pts;
var brs = b.brs;
// outer glow
ctx.globalAlpha = fade * 0.45;
drawPolyline(pts, 18, 'rgba(80,140,255,0.85)', 32);
for (var i = 0; i < brs.length; i++) drawPolyline(brs[i], 12, 'rgba(80,140,255,0.7)', 22);
// mid layer
ctx.globalAlpha = fade * 0.85;
drawPolyline(pts, 7, 'rgba(170,215,255,0.95)', 18);
for (var j = 0; j < brs.length; j++) drawPolyline(brs[j], 5, 'rgba(170,215,255,0.9)', 14);
// core
ctx.globalAlpha = fade;
drawPolyline(pts, 3, '#ffffff', 10);
for (var k = 0; k < brs.length; k++) drawPolyline(brs[k], 2, '#ffffff', 6);
ctx.globalAlpha = 1;
}
function spawnSwirl(cx, cy, opts) {
opts = opts || {};
var life = opts.life || 620;
var color = opts.color || 'gold';
var palette = color === 'blue'
? ['#8ec7ff', '#4a90ff', '#c0e4ff', '#ffffff']
: ['#ffe680', '#ffc93c', '#fff5c0', '#ff8f00'];
var count = 16 + Math.floor(rnd() * 8);
var ps = [];
for (var i = 0; i < count; i++) {
var ang = (i / count) * Math.PI * 2 + rnd() * 0.6;
var rad = 22 + rnd() * 18;
ps.push({
angle: ang,
radius: rad,
speed: 0.32 + rnd() * 0.22,
inward: 0.86 + rnd() * 0.06,
size: 1.6 + rnd() * 2.4,
color: palette[Math.floor(rnd() * palette.length)]
});
}
swirls.push({
cx: cx, cy: cy,
particles: ps,
t0: performance.now(),
life: life
});
}
function drawSwirl(s, age) {
var t = age / s.life;
if (t >= 1) return;
var fade = 1 - t;
var easeIn = Math.pow(t, 0.6);
var ps = s.particles;
// core glow
var coreR = 8 + 26 * (1 - easeIn);
ctx.save();
ctx.globalAlpha = fade * 0.35;
var g = ctx.createRadialGradient(s.cx, s.cy, 0, s.cx, s.cy, coreR * 2.4);
g.addColorStop(0, 'rgba(255,245,200,0.9)');
g.addColorStop(0.4, 'rgba(255,200,60,0.5)');
g.addColorStop(1, 'rgba(255,160,30,0)');
ctx.fillStyle = g;
ctx.beginPath();
ctx.arc(s.cx, s.cy, coreR * 2.4, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
// spiral particles
for (var i = 0; i < ps.length; i++) {
var p = ps[i];
var ang = p.angle + p.speed * (age / 16.67);
var rad = p.radius * Math.pow(p.inward, age / 16.67);
if (rad < 0.4) continue;
var x = s.cx + Math.cos(ang) * rad;
var y = s.cy + Math.sin(ang) * rad;
// comet tail: draw 5 fading ghosts behind
for (var k = 4; k >= 0; k--) {
var angB = p.angle + p.speed * ((age - k * 22) / 16.67);
var radB = p.radius * Math.pow(p.inward, Math.max(0, age - k * 22) / 16.67);
if (radB < 0.4) continue;
var xb = s.cx + Math.cos(angB) * radB;
var yb = s.cy + Math.sin(angB) * radB;
ctx.save();
ctx.globalAlpha = fade * (0.15 + 0.55 * (1 - k / 5));
ctx.fillStyle = p.color;
ctx.shadowColor = p.color;
ctx.shadowBlur = 10;
ctx.beginPath();
ctx.arc(xb, yb, p.size * (1 - k * 0.14), 0, Math.PI * 2);
ctx.fill();
ctx.restore();
}
ctx.save();
ctx.globalAlpha = fade;
ctx.fillStyle = '#ffffff';
ctx.shadowColor = p.color;
ctx.shadowBlur = 16;
ctx.beginPath();
ctx.arc(x, y, p.size, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
}
}

function spawnRipple(cx, cy, opts) {
opts = opts || {};
ripples.push({
cx: cx, cy: cy,
t0: performance.now(),
life: opts.life || 620,
radius: opts.radius || 46,
hue: opts.hue || 'gold'
});
}
function drawRipple(r, age) {
var t = age / r.life;
if (t >= 1) return;
var ease = 1 - Math.pow(1 - t, 2.2);
var rad = 8 + r.radius * ease;
var fade = 1 - t;
var palette = r.hue === 'blue'
? ['#8ec7ff', '#4a90ff', '#ffffff']
: ['#ffe680', '#ffc93c', '#ffffff'];
ctx.save();
ctx.globalCompositeOperation = 'lighter';
// 3 expanding rings, staggered
for (var k = 0; k < 3; k++) {
var rk = rad * (1 - k * 0.18);
if (rk <= 1) continue;
ctx.globalAlpha = fade * (0.85 - k * 0.22);
ctx.beginPath();
ctx.arc(r.cx, r.cy, rk, 0, Math.PI * 2);
ctx.strokeStyle = palette[k % palette.length];
ctx.lineWidth = 3 - k * 0.6;
ctx.shadowColor = palette[k];
ctx.shadowBlur = 16 - k * 4;
ctx.stroke();
}
// center light
ctx.globalAlpha = fade * 0.9;
var g = ctx.createRadialGradient(r.cx, r.cy, 0, r.cx, r.cy, rad * 0.6);
g.addColorStop(0, 'rgba(255,255,255,0.95)');
g.addColorStop(0.4, 'rgba(255,235,160,0.55)');
g.addColorStop(1, 'rgba(255,180,40,0)');
ctx.fillStyle = g;
ctx.beginPath();
ctx.arc(r.cx, r.cy, rad * 0.6, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
}

function drawAura(now, W, H) {
if (!auraOn) return;
var x0 = BOARD.L * W, x1 = BOARD.R * W;
var y0 = BOARD.T * H, y1 = BOARD.B * H;
var cw = (x1 - x0) / 6;
var ch = (y1 - y0) / 5;
var t = now * 0.001;
ctx.save();
ctx.globalCompositeOperation = 'lighter';
// outer frame glow
ctx.lineWidth = 2.4;
ctx.strokeStyle = 'rgba(255,200,60,0.55)';
ctx.shadowColor = '#ffe680';
ctx.shadowBlur = 18;
roundRect(x0 - 2, y0 - 2, (x1 - x0) + 4, (y1 - y0) + 4, 6);
ctx.stroke();
// 6 vertical jitter columns
for (var c = 0; c <= 6; c++) {
var x = x0 + cw * c;
var jitter = Math.sin(t * 6 + c * 1.7) * 2;
goldWire(x + jitter, y0, x + Math.sin(t * 4 + c) * 2, y1, 2);
}
// 6 horizontal jitter rows
for (var r = 0; r <= 5; r++) {
var y = y0 + ch * r;
var jitter = Math.cos(t * 5 + r * 2.1) * 2;
goldWire(x0, y + jitter, x1, y + Math.cos(t * 3.4 + r) * 2, 2);
}
// node halos: at each internal intersection
for (var ci = 1; ci < 6; ci++) {
for (var ri = 1; ri < 5; ri++) {
var nx = x0 + cw * ci;
var ny = y0 + ch * ri;
var pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 8 + ci * 2 + ri * 3));
ctx.globalAlpha = pulse * 0.55;
ctx.beginPath();
ctx.arc(nx, ny, 4 + pulse * 3, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255,220,120,0.85)';
ctx.shadowColor = '#ffe680';
ctx.shadowBlur = 14;
ctx.fill();
}
}
ctx.restore();
}
function goldWire(x1, y1, x2, y2, w) {
var segs = 5;
ctx.beginPath();
ctx.moveTo(x1, y1);
for (var i = 1; i < segs; i++) {
var f = i / segs;
var mx = x1 + (x2 - x1) * f + (rnd() - 0.5) * 5;
var my = y1 + (y2 - y1) * f + (rnd() - 0.5) * 5;
ctx.lineTo(mx, my);
}
ctx.lineTo(x2, y2);
ctx.lineWidth = w;
ctx.strokeStyle = 'rgba(255,215,90,0.78)';
ctx.shadowColor = '#ffe680';
ctx.shadowBlur = 12;
ctx.stroke();
}
function roundRect(x, y, w, h, r) {
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.lineTo(x + w - r, y);
ctx.arcTo(x + w, y, x + w, y + r, r);
ctx.lineTo(x + w, y + h - r);
ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
ctx.lineTo(x + r, y + h);
ctx.arcTo(x, y + h, x, y + h - r, r);
ctx.lineTo(x, y + r);
ctx.arcTo(x, y, x + r, y, r);
ctx.closePath();
}

function tick() {
if (!ctx) return;
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.save();
ctx.scale(DPR, DPR);
var now = performance.now();
var alive = [];
for (var i = 0; i < bolts.length; i++) {
var age = now - bolts[i].t0;
if (age < 420) {
drawBolt(bolts[i], age);
alive.push(bolts[i]);
}
}
bolts = alive;
var aliveSwirls = [];
for (var j = 0; j < swirls.length; j++) {
var ageS = now - swirls[j].t0;
if (ageS < swirls[j].life) {
drawSwirl(swirls[j], ageS);
aliveSwirls.push(swirls[j]);
}
}
swirls = aliveSwirls;
// ripples (multiplier landing)
var aliveRipples = [];
for (var ri = 0; ri < ripples.length; ri++) {
var ageR = now - ripples[ri].t0;
if (ageR < ripples[ri].life) {
drawRipple(ripples[ri], ageR);
aliveRipples.push(ripples[ri]);
}
}
ripples = aliveRipples;
// aura layer (persistent during FS)
if (auraOn) drawAura(now, canvas.width / DPR, canvas.height / DPR);
ctx.restore();
if (bolts.length > 0 || swirls.length > 0 || ripples.length > 0 || auraOn) {
raf = requestAnimationFrame(tick);
} else {
raf = 0;
if (canvas) canvas.classList.remove('on');
}
}
function strike(opts) {
if (!initCanvas()) return;
opts = opts || {};
var w = canvas.clientWidth, h = canvas.clientHeight;
var sx = (opts.fromX != null ? opts.fromX : 0.42) * w;
var sy = (opts.fromY != null ? opts.fromY : 0.11) * h;
var count = opts.count || 1;
for (var i = 0; i < count; i++) {
var ex = (opts.toX != null ? opts.toX : (0.1 + rnd() * 0.8)) * w;
var ey = (opts.toY != null ? opts.toY : (0.26 + rnd() * 0.22)) * h;
var pts = makeBolt(sx, sy, ex, ey);
var brs = branches(pts);
bolts.push({ pts: pts, brs: brs, t0: performance.now() });
}
canvas.classList.add('on');
if (!raf) raf = requestAnimationFrame(tick);
}
function strikeCell(col, row) {
if (!initCanvas()) return;
var w = canvas.clientWidth || window.innerWidth;
var h = canvas.clientHeight || window.innerHeight;
var cw = (BOARD.R - BOARD.L) / 6;
var ch = (BOARD.B - BOARD.T) / 5;
var toX = BOARD.L + cw * (col + 0.5);
var toY = BOARD.T + ch * (row + 0.5);
strike({ toX: toX, toY: toY, count: 1 });
}
global.OlympusLightning = Object.freeze({
strike: strike,
strikeCell: strikeCell,
init: initCanvas,
rippleCell: function (col, row, opts) {
if (!initCanvas() || !canvas) return;
var w = canvas.clientWidth || window.innerWidth;
var h = canvas.clientHeight || window.innerHeight;
var cw = (BOARD.R - BOARD.L) / 6;
var ch = (BOARD.B - BOARD.T) / 5;
var cx = (BOARD.L + cw * (col + 0.5)) * w;
var cy = (BOARD.T + ch * (row + 0.5)) * h;
if (canvas) canvas.classList.add('on');
spawnRipple(cx, cy, opts);
if (!raf) raf = requestAnimationFrame(tick);
},
setAura: function (on) {
if (!initCanvas()) return;
var was = auraOn;
auraOn = !!on;
if (auraOn) {
if (canvas) canvas.classList.add('on');
if (!raf) raf = requestAnimationFrame(tick);
} else if (was && !raf && bolts.length === 0 && swirls.length === 0 && ripples.length === 0) {
if (canvas) canvas.classList.remove('on');
}
},
isAuraOn: function () { return auraOn; },
swirlAt: function (cx, cy, opts) {
if (!initCanvas()) return;
if (canvas) canvas.classList.add('on');
spawnSwirl(cx, cy, opts);
if (!raf) raf = requestAnimationFrame(tick);
},
// convenience: given a board cell (col, row), compute canvas px
swirlCell: function (col, row, opts) {
if (!initCanvas() || !canvas) return;
var w = canvas.clientWidth || window.innerWidth;
var h = canvas.clientHeight || window.innerHeight;
var cw = (BOARD.R - BOARD.L) / 6;
var ch = (BOARD.B - BOARD.T) / 5;
var cx = (BOARD.L + cw * (col + 0.5)) * w;
var cy = (BOARD.T + ch * (row + 0.5)) * h;
this.swirlAt(cx, cy, opts);
}
});
})(typeof window !== 'undefined' ? window : globalThis);
