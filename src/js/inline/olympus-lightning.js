/* Apex Olympus - Zeus lightning strike on the board. */
(function (global) {
'use strict';
var canvas = null, ctx = null, raf = 0;
var bolts = [];
var startTime = 0;
var DPR = 1;
function rnd() {
var buf = new Uint32Array(1);
crypto.getRandomValues(buf);
return buf[0] / 4294967296;
}
function initCanvas() {
if (canvas) return true;
canvas = document.getElementById('olLightning');
if (!canvas) return false;
ctx = canvas.getContext('2d');
resize();
window.addEventListener('resize', resize);
return true;
}
function resize() {
if (!canvas) return;
DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
canvas.width = Math.floor(canvas.clientWidth * DPR);
canvas.height = Math.floor(canvas.clientHeight * DPR);
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
var n = 2 + Math.floor(rnd() * 2);
for (var b = 0; b < n; b++) {
var idx = 3 + Math.floor(rnd() * (pts.length - 6));
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
ctx.restore();
if (bolts.length > 0) {
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
var w = canvas.clientWidth || window.innerWidth;
var h = canvas.clientHeight || window.innerHeight;
var left = 0.044, right = 0.967, top = 0.230, bottom = 0.481;
var cw = (right - left) / 6;
var ch = (bottom - top) / 5;
var toX = left + cw * (col + 0.5);
var toY = top + ch * (row + 0.5);
strike({ toX: toX, toY: toY, count: 1 });
}
global.OlympusLightning = Object.freeze({
strike: strike,
strikeCell: strikeCell,
init: initCanvas
});
})(typeof window !== 'undefined' ? window : globalThis);
