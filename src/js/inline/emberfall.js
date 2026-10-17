window.onerror = function(msg, url, line) {
  var e = document.getElementById('err');
  if(e) { e.style.display = 'block'; e.innerHTML += '<b>Error:</b> ' + msg + '<br>Line: ' + line + '<br><br>'; }
};

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

IMGS.bg = new Image();
IMGS.bg.src = '/assets/emberfall/bg.webp';

SYMS.forEach(s => {
  IMGS[s] = new Image();
  IMGS[s].src = '/assets/emberfall/' + s + '.webp';
});

let score = 10000;
const scoreEl = document.getElementById('score');
const ROWS = 3, COLS = 5;
let grid = [];
let spinning = false;
let offsets = Array(COLS).fill(0);

function getRandomSym() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return SYMS[buf[0] % SYMS.length];
}

for (let r = 0; r < ROWS; r++) {
  grid[r] = [];
  for (let c = 0; c < COLS; c++) grid[r][c] = getRandomSym();
}

function draw() {
  ctx.fillStyle = '#171019';
  ctx.fillRect(0, 0, W, H);

  if (IMGS.bg && IMGS.bg.complete) {
    ctx.drawImage(IMGS.bg, 0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
  }

  const cellW = Math.min(W / 6.5, H / 8);
  const cellH = cellW;
  const startX = (W - cellW * COLS) / 2;
  const startY = (H - cellH * ROWS) / 2;

  ctx.strokeStyle = '#D9A441';
  ctx.lineWidth = 4;
  ctx.strokeRect(startX - 10, startY - 10, cellW * COLS + 20, cellH * ROWS + 20);

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH + offsets[c];
      const sym = grid[r][c];
      
      if (IMGS[sym] && IMGS[sym].complete) {
        ctx.drawImage(IMGS[sym], x + 5, y + 5, cellW - 10, cellH - 10);
      } else {
        ctx.fillStyle = '#333'; ctx.fillRect(x + 5, y + 5, cellW - 10, cellH - 10);
        ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif';
        ctx.fillText(sym, x + 20, y + 40);
      }
    }
  }
}

function spin() {
  if (spinning) return;
  if (score < 100) { alert('积分不足'); return; }
  
  spinning = true;
  score -= 100;
  scoreEl.innerText = score;
  
  let speed = 0;
  const spinInterval = setInterval(() => {
    speed += 0.5;
    for (let c = 0; c < COLS; c++) {
      offsets[c] += speed;
      if (offsets[c] > 60) {
        offsets[c] -= 60;
        for (let r = 0; r < ROWS; r++) grid[r][c] = getRandomSym();
      }
    }
    draw();

    if (speed > 20) {
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
          scoreEl.innerText = score;
        }, 100);
      }
      draw();
    }
  }, 16);
}

function loop() {
  if (!spinning) draw();
  requestAnimationFrame(loop);
}
loop();

canvas.addEventListener('pointerdown', spin);
