/* Sweet · Particles
   Canvas 2D 粒子系统。
   用途：中奖 spark / BigWin confetti。
   约束：Object Pooling + DPR 限制 max 2 + rAF 只在有活跃粒子时跑。
*/
(function(){
'use strict';

var Events = window.SweetEvents;
var RNG = window.SweetRNG;

var MAX_PARTICLES = 60;
var DPR = Math.min(window.devicePixelRatio || 1, 2);

var canvas = null;
var ctx = null;
var active = false;
var rafId = 0;
var pool = [];
var list = [];

function init(canvasEl){
  canvas = canvasEl;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize, { passive: true });
  for (var i = 0; i < MAX_PARTICLES; i++) {
    pool.push({ x:0, y:0, vx:0, vy:0, life:0, maxLife:1, size:1, color:'#fff', rotation:0, vr:0 });
  }
}

function resize(){
  if (!canvas || !ctx) return;
  var rect = canvas.getBoundingClientRect();
  var w = Math.max(1, Math.floor(rect.width));
  var h = Math.max(1, Math.floor(rect.height));
  canvas.width = w * DPR;
  canvas.height = h * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function acquire(){
  if (pool.length) return pool.pop();
  if (list.length < MAX_PARTICLES) return { x:0,y:0,vx:0,vy:0,life:0,maxLife:1,size:1,color:'#fff',rotation:0,vr:0 };
  return null;
}

function release(p){
  if (pool.length < MAX_PARTICLES) pool.push(p);
}

function spawn(p){
  if (!p) return;
  list.push(p);
  if (!active) {
    active = true;
    rafId = requestAnimationFrame(tick);
  }
}

function tick(now){
  if (!ctx) { active = false; rafId = 0; return; }
  var dt = 16.67;
  ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
  for (var i = list.length - 1; i >= 0; i--) {
    var p = list[i];
    p.life += dt;
    if (p.life >= p.maxLife) {
      list.splice(i, 1);
      release(p);
      continue;
    }
    p.vy += 0.15 * dt / 16.67;
    p.vx *= 0.995;
    p.vy *= 0.995;
    p.x += p.vx * dt / 16.67;
    p.y += p.vy * dt / 16.67;
    p.rotation += p.vr * dt / 16.67;
    var t = p.life / p.maxLife;
    var alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (list.length > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    active = false;
    rafId = 0;
  }
}

function burst(cx, cy, opts){
  if (!canvas) return;
  opts = opts || {};
  var count = opts.count || 20;
  var color = opts.color || '#ffd54f';
  var spread = opts.spread || 3.5;
  var sizeMin = opts.sizeMin || 2;
  var sizeMax = opts.sizeMax || 4;
  var lifeMin = opts.lifeMin || 600;
  var lifeMax = opts.lifeMax || 1200;
  var used = 0;
  for (var i = 0; i < count; i++) {
    if (list.length >= MAX_PARTICLES) break;
    var p = acquire();
    if (!p) break;
    var angle = (Math.PI * 2) * (i / count) + RNG.rand() * 0.4;
    var speed = spread * (0.5 + RNG.rand() * 0.8);
    p.x = cx; p.y = cy;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 0.8;
    p.life = 0;
    p.maxLife = lifeMin + RNG.rand() * (lifeMax - lifeMin);
    p.size = sizeMin + RNG.rand() * (sizeMax - sizeMin);
    p.color = color;
    p.rotation = RNG.rand() * Math.PI;
    p.vr = (RNG.rand() - 0.5) * 0.2;
    spawn(p);
    used++;
  }
  return used;
}

function clear(){
  while (list.length) release(list.pop());
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  active = false;
  if (ctx) ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
}

function bindEvents(){
  Events.on('fx:burst', function(d){
    if (!d) return;
    burst(d.x, d.y, d.opts || {});
  });
  Events.on('win:roundStart', function(d){
    if (!d || !d.cells || !d.cells.length || !canvas) return;
    var rect = canvas.getBoundingClientRect();
    var c = d.cells[0];
    var px = rect.width * ((c[1] + 0.5) / 6);
    var py = rect.height * ((c[0] + 0.5) / 5);
    burst(px, py, { count: 6, color: '#ffd54f', spread: 2.5, lifeMin: 500, lifeMax: 900 });
  });
  Events.on('fs:summary', function(){
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    burst(rect.width / 2, rect.height / 2, { count: 24, color: '#ffe37a', spread: 5, lifeMin: 900, lifeMax: 1600, sizeMin: 3, sizeMax: 5 });
  });
}

window.SweetParticles = {
  init: init,
  burst: burst,
  clear: clear,
  bindEvents: bindEvents,
  MAX: MAX_PARTICLES
};
})();
