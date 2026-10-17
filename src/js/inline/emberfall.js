const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();
const SYMS = ['dragon', 'seal', 'wild', 'phoenix', 'lotus', 'crown', 'feather', 'bell', 'ingot', 'coin', 'jade'];
const IMGS = {};
IMGS.bg = new Image(); IMGS.bg.src = '/assets/emberfall/bg.webp';
SYMS.forEach(s => { IMGS[s] = new Image(); IMGS[s].src = '/assets/emberfall/' + s + '.webp'; });
let score = 10000;
let spinning = false;
const ROWS = 3, COLS = 5;
let grid = [];
let offsets = Array(COLS).fill(0);
let gridX, gridY, gridW, gridH, cellW, cellH;
function calcLayout() {
  gridX = W * 0.12;
  gridY = H * 0.23;
  gridW = W * 0.76;
  gridH = H * 0.54;
  cellW = gridW / COLS;
  cellH = gridH / ROWS;
}
calcLayout();
window.addEventListener('resize', calcLayout);
function getRandomSym() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return SYMS[buf[0] % SYMS.length];
}
for (let r = 0; r < ROWS; r++) {
  grid[r] = [];
  for (let c = 0; c < COLS; c++) grid[r][c] = getRandomSym();
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  if (IMGS.bg.complete) {
    ctx.drawImage(IMGS.bg, 0, 0, W, H);
  }
  for (let c = 0; c < COLS; c++) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(gridX, gridY, gridW, gridH);
    ctx.clip();
    for (let r = 0; r < ROWS; r++) {
      const x = gridX + c * cellW;
      const y = gridY + r * cellH + offsets[c];
      const sym = grid[r][c];
      if (IMGS[sym] && IMGS[sym].complete) {
        const pad = cellW * 0.08;
        ctx.drawImage(IMGS[sym], x + pad, y + pad, cellW - pad*2, cellH - pad*2);
      }
    }
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeStyle = '#D9A441';
  ctx.lineWidth = 2;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  roundRect(20, 20, 90, 40, 20);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.fillText('\u2190 \u8fd4\u56de', 35, 42);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  roundRect(W - 180, 20, 160, 40, 20);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.fillText('\u79ef\u5206: ' + score, W - 40, 42);
  const btnY = H * 0.88;
  const btnRadius = 40;
  ctx.beginPath();
  ctx.arc(W/2, btnY, btnRadius, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(121, 31, 40, 0.9)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFE7A0';
  ctx.stroke();
  ctx.fillStyle = '#FFF4DC';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u65cb\u8f6c', W/2, btnY + 2);
}
function spin() {
  if (spinning) return;
  if (score < 100) { alert('\u79ef\u5206\u4e0d\u8db3'); return; }
  spinning = true;
  score -= 100;
  let speed = 0;
  const spinInterval = setInterval(() => {
    speed += 0.4;
    for (let c = 0; c < COLS; c++) {
      offsets[c] += speed;
      if (offsets[c] > cellH) {
        offsets[c] -= cellH;
        for (let r = ROWS - 1; r > 0; r--) grid[r][c] = grid[r-1][c];
        grid[0][c] = getRandomSym();
      }
    }
    draw();
    if (speed > 25) {
      clearInterval(spinInterval);
      offsets.fill(0);
      spinning = false;
      let win = 0;
      for (let r = 0; r < ROWS; r++) {
        let first = grid[r][0];
        let match = true;
        for (let c = 1; c < COLS; c++) {
          if (grid[r][c] !== first) match = false;
        }
        if (match) win += 500;
      }
      if (win > 0) {
        setTimeout(() => {
          alert('\u4e2d\u5956\uff01\u83b7\u5f97 ' + win + ' \u79ef\u5206');
          score += win;
          draw();
        }, 50);
      }
      draw();
    }
  }, 1000 / 60);
}
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const clientY = e.clientY - rect.top;
  if (clientX < 120 && clientY < 70) {
    window.location.href = '/';
    return;
  }
  const btnY = H * 0.88;
  const distToCenter = Math.hypot(clientX - W/2, clientY - btnY);
  if (distToCenter < 60) {
    spin();
    return;
  }
});
function loop() {
  if (!spinning) draw();
  requestAnimationFrame(loop);
}
loop();