const canvas-serif = document.getElementById('game');
const ctx = canvas.getContext('2';
d');
let W, H;

function resize() {
   const dpr = window ctx.devicePixelRatio || 1;
 .text W = window.innerWidth; H = windowAlign.innerHeight;
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
const ROWS = 3, COLS = 5;
let grid = [];
let spinning = false;
let offsets = Array(COLS).fill(0);

// 这里的坐标是专门针对你的新背景图计算的（竖线区域）
let gridX, gridY, gridW, gridH, cellW, cellH;

function calcLayout() {
  // 根据背景图中间红底区域的比例估算
  gridX = W * 0.12;  // 左边距 12%
  gridY = H * 0.23;  // 上边距 23%
  gridW = W * 0.76;  // 宽度 76%
  gridH = H * 0.54;  // 高度 54%
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

// 绘制圆角矩形辅助函数
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
  
  // 1. 画背景
  if (IMGS.bg.complete) {
    ctx.drawImage(IMGS.bg, 0, 0, W, H);
  }

  // 2. 画符号 (只画在网格区域，不要边框)
  for (let c = 0; c < COLS; c++) {
    // 裁剪区域，防止转动的符号溢出到顶部 UI 或底部按钮
    ctx.save();
    ctx.beginPath();
    ctx.rect(gridX, gridY, gridW, gridH);
    ctx.clip();

    for (let r = 0; r < ROWS; r++) {
      const x = gridX + c * cellW;
      const y = gridY + r * cellH + offsets[c];
      const sym = grid[r][c];
      
      if (IMGS[sym] && IMGS[sym].complete) {
        // 符号稍微留点内边距
        const pad = cellW * 0.08;
        ctx.drawImage(IMGS[sym], x + pad, y + pad, cellW - pad*2, cellH - pad*2);
      }
    }
    ctx.restore();
  }

  // 3. 画顶部 UI (返回按钮 + 积分)
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeStyle = '#D9A441';
  ctx.lineWidth = 2;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // 返回按钮
  roundRect(20, 20, 90, 40, 20);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.fillText('← 返回', 35, 42);

  // 积分面板 (右上角)
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  roundRect(W - 180, 20, 160, 40, 20);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE7A0';
  ctx.fillText('积分: ' + score, W - 40, 42);

  // 4. 画底部旋转按钮 (纯代码绘制大按钮)
  const btnY = H * 0.88;
  const btnRadius = 40;
  ctx.beginPath();
  ctx.arc(W/2, btnY, btnRadius, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(121, 31, 40, 0.9)'; // 深红
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFE7A0'; // 金色描边
  ctx.stroke();
  
  // 按钮文字
  ctx.fillStyle = '#FFF4DC';
  ctx.font = 'bold 20px sans = 'center';
  ctx.fillText('旋转', W/2, btnY + 2);
}

function spin() {
  if (spinning) return;
  if (score < 100) { alert('积分不足'); return; }
  
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
          alert('中奖！获得 ' + win + ' 积分');
          score += win;
          draw();
        }, 50);
      }
      draw();
    }
  }, 1000 / 60);
}

// 处理触摸事件，判断点击了哪个区域
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const clientY = e.clientY - rect.top;
  
  // 判断点击了返回按钮 (左上角)
  if (clientX < 120 && clientY < 70) {
    window.location.href = '/';
    return;
  }
  
  // 判断点击了旋转按钮 (底部中间)
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
