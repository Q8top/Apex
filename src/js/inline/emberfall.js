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
let gridX, gridY, gridW, gridH, cellW, cellH, symSize;

function calcLayout() {
  // 根据图2背景图，精准计算中间红区的坐标
  gridX = W * 0.05;  // 左侧留出金边
  gridY = H * 0.24;  // 顶部建筑下方
  gridW = W * 0.90;  // 占据大部分宽度
  gridH = H * 0.52;  // 到底部暗区上方
  cellW = gridW / COLS;
  cellH = gridH / ROWS;
  // 强制符号是正方形，且只占单元格的 75%（留出呼吸空间）
  symSize = Math.min(cellW, cellH) * 0.75;
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

  // 绘制符号（严格裁剪，防止旋转时溢出）
  ctx.save();
  ctx.beginPath();
  ctx.rect(gridX, gridY, gridW, gridH);
  ctx.clip();
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const x = gridX + c * cellW + (cellW - symSize)/2;
      const y = gridY + r * cellH + offsets[c] + (cellH - symSize)/2;
      const sym = grid[r][c];
      if (IMGS[sym] && IMGS[sym].complete) {
        ctx.drawImage(IMGS[sym], x, y, symSize, symSize);
      }
    }
  }
  ctx.restore();

  // 绘制顶部 UI
  ctx.fillStyle = 'rgba(30, 10, 10, 0.7)';
  ctx.strokeStyle = '#D9A441';
  ctx.lineWidth = 2;
  ctx.font = 'bold 16px sans-serif';
  ctx.textBaseline = 'middle';

  // 返回按钮
  roundRect(W*0.05, H*0.03, W*0.25, H*0.06, H*0.03);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.textAlign = 'center';
  ctx.fillText('\u2190 \u8fd4\u56de', W*0.175, H*0.06);

  // 积分面板
  ctx.fillStyle = 'rgba(30, 10, 10, 0.7)';
  roundRect(W*0.55, H*0.03, W*0.40, H*0.06, H*0.03);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.fillText('\u79ef\u5206: ' + score, W*0.75, H*0.06);

  // 绘制底部旋转按钮（径向渐变立体感）
  const btnY = H * 0.86;
  const btnRadius = Math.min(W, H) * 0.09;
  const grd = ctx.createRadialGradient(W/2, btnY - btnRadius*0.3, 10, W/2, btnY, btnRadius);
  grd.addColorStop(0, '#a82a35');
  grd.addColorStop(1, '#5a121a');
  ctx.beginPath();
  ctx.arc(W/2, btnY, btnRadius, 0, Math.PI*2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFE7A0';
  ctx.stroke();
  // 按钮内部高光
  ctx.beginPath();
  ctx.arc(W/2, btnY, btnRadius - 4, 0, Math.PI*2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.stroke();

  ctx.fillStyle = '#FFF4DC';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u65cb\u8f6c', W/2, btnY);
}

function spin() {
  if (spinning) return;
  if (score < 100) { alert('\u79ef\u5206\u4e0d\u8db3'); return; }
  spinning = true;
  score -= 100;
  let speed = 0;
  const spinInterval = setInterval(() => {
    speed += 0.6;
    for (let c = 0; c < COLS; c++) {
      offsets[c] += speed;
      if (offsets[c] > cellH) {
        offsets[c] -= cellH;
        for (let r = ROWS - 1; r > 0; r--) grid[r][c] = grid[r-1][c];
        grid[0][c] = getRandomSym();
      }
    }
    draw();
    if (speed > 30) {
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
  if (clientX < W*0.35 && clientY < H*0.1) {
    window.location.href = '/';
    return;
  }
  const btnY = H * 0.86;
  const distToCenter = Math.hypot(clientX - W/2, clientY - btnY);
  if (distToCenter < Math.min(W, H) * 0.1) {
    spin();
    return;
  }
});

function loop() {
  if (!spinning) draw();
  requestAnimationFrame(loop);
}
loop();