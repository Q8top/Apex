/* Apex Olympus · Canvas 2D 符号渲染器 */
(function(){
'use strict';

var cache = {};

function poly(ctx, pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
function lighten(c, amt){
  var r = Math.max(0, Math.min(255, Math.round(c[0] + amt*255)));
  var g = Math.max(0, Math.min(255, Math.round(c[1] + amt*255)));
  var b = Math.max(0, Math.min(255, Math.round(c[2] + amt*255)));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function rgba(c, a){ return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

/* 宝石通用绘制 */
function drawGem(ctx, S, palette){
  var cx = S/2, cy = S/2;
  var R = S * 0.42;
  var base = palette.base;
  ctx.save();

  // 外部投影
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, cy + R * 0.95, R * 0.85, R * 0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // 内发光
  var ig = ctx.createRadialGradient(cx, cy, R*0.1, cx, cy, R*1.15);
  ig.addColorStop(0,   rgba(base, 0.85));
  ig.addColorStop(0.5, rgba(base, 0.35));
  ig.addColorStop(1,   rgba(base, 0));
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.15, 0, Math.PI*2);
  ctx.fill();

  // 8 边形轮廓
  var pts = [
    [cx - R*0.55, cy - R*0.75],
    [cx + R*0.55, cy - R*0.75],
    [cx + R*0.95, cy - R*0.15],
    [cx + R*0.75, cy + R*0.60],
    [cx,          cy + R*0.95],
    [cx - R*0.75, cy + R*0.60],
    [cx - R*0.95, cy - R*0.15]
  ];

  // 主渐变
  var g = ctx.createLinearGradient(cx-R, cy-R, cx+R, cy+R);
  g.addColorStop(0,   lighten(base, 0.55));
  g.addColorStop(0.4, lighten(base, 0.15));
  g.addColorStop(0.75, lighten(base, -0.20));
  g.addColorStop(1,   lighten(base, -0.55));
  poly(ctx, pts);
  ctx.fillStyle = g;
  ctx.fill();

  // 冠部切面
  var topL = [cx - R*0.55, cy - R*0.75];
  var topR = [cx + R*0.55, cy - R*0.75];
  var tableL = [cx - R*0.30, cy - R*0.40];
  var tableR = [cx + R*0.30, cy - R*0.40];
  var center = [cx, cy - R*0.05];

  poly(ctx, [topL, tableL, center]);
  var gL = ctx.createLinearGradient(topL[0], topL[1], center[0], center[1]);
  gL.addColorStop(0, lighten(base, 0.75));
  gL.addColorStop(1, lighten(base, 0.20));
  ctx.fillStyle = gL; ctx.fill();

  poly(ctx, [tableL, tableR, center]);
  var gC = ctx.createLinearGradient(cx, cy-R*0.4, cx, cy);
  gC.addColorStop(0, lighten(base, 0.85));
  gC.addColorStop(1, lighten(base, 0.30));
  ctx.fillStyle = gC; ctx.fill();

  poly(ctx, [topR, tableR, center]);
  var gR = ctx.createLinearGradient(topR[0], topR[1], center[0], center[1]);
  gR.addColorStop(0, lighten(base, 0.20));
  gR.addColorStop(1, lighten(base, -0.20));
  ctx.fillStyle = gR; ctx.fill();

  // 台面亮梯形
  poly(ctx, [topL, topR, tableR, tableL]);
  var gT = ctx.createLinearGradient(cx, cy-R*0.75, cx, cy-R*0.4);
  gT.addColorStop(0, 'rgba(255,255,255,0.95)');
  gT.addColorStop(0.5, lighten(base, 0.9));
  gT.addColorStop(1, lighten(base, 0.55));
  ctx.fillStyle = gT; ctx.fill();

  // 亭部
  var pavL = [cx - R*0.75, cy + R*0.60];
  var pavR = [cx + R*0.75, cy + R*0.60];
  var bot = [cx, cy + R*0.95];

  poly(ctx, [pts[6], tableL, center, pavL]);
  var gPL = ctx.createLinearGradient(pts[6][0], pts[6][1], pavL[0], pavL[1]);
  gPL.addColorStop(0, lighten(base, -0.05));
  gPL.addColorStop(1, lighten(base, -0.35));
  ctx.fillStyle = gPL; ctx.fill();

  poly(ctx, [tableL, tableR, bot]);
  var gPC = ctx.createLinearGradient(cx, cy, cx, cy+R);
  gPC.addColorStop(0, lighten(base, 0.10));
  gPC.addColorStop(1, lighten(base, -0.45));
  ctx.fillStyle = gPC; ctx.fill();

  poly(ctx, [pts[2], tableR, center, pavR]);
  var gPR = ctx.createLinearGradient(pts[2][0], pts[2][1], pavR[0], pavR[1]);
  gPR.addColorStop(0, lighten(base, -0.25));
  gPR.addColorStop(1, lighten(base, -0.55));
  ctx.fillStyle = gPR; ctx.fill();

  // 腰线
  ctx.beginPath();
  ctx.moveTo(pts[6][0], pts[6][1]);
  ctx.lineTo(pts[2][0], pts[2][1]);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = S*0.012;
  ctx.stroke();

  // 镜面高光 1
  var hg1 = ctx.createRadialGradient(cx-R*0.35, cy-R*0.45, 0, cx-R*0.35, cy-R*0.45, S*0.10);
  hg1.addColorStop(0,   'rgba(255,255,255,1)');
  hg1.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  hg1.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = hg1;
  ctx.beginPath();
  ctx.arc(cx-R*0.35, cy-R*0.45, S*0.10, 0, Math.PI*2);
  ctx.fill();

  // 镜面高光 2
  var hg2 = ctx.createRadialGradient(cx+R*0.4, cy+R*0.25, 0, cx+R*0.4, cy+R*0.25, S*0.05);
  hg2.addColorStop(0,   'rgba(255,255,255,0.9)');
  hg2.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = hg2;
  ctx.beginPath();
  ctx.arc(cx+R*0.4, cy+R*0.25, S*0.05, 0, Math.PI*2);
  ctx.fill();

  // 台面亮点
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.ellipse(cx-R*0.15, cy-R*0.6, S*0.02, S*0.008, 0, 0, Math.PI*2);
  ctx.fill();

  // 外轮廓
  poly(ctx, pts);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = S*0.01;
  ctx.stroke();

  ctx.restore();
}

/* 占位：后续段会追加更多函数 */
window.ApexCanvasSymbols = { _ready: false, _drawGem: drawGem, _poly: poly, _lighten: lighten, _rgba: rgba, _cache: cache };

/* ============ 皇冠 ============ */
function drawCrown(ctx, S){
  var cx = S/2, cy = S/2;
  var R = S * 0.40;
  ctx.save();

  var glow = ctx.createRadialGradient(cx, cy, R*0.2, cx, cy, R*1.4);
  glow.addColorStop(0, 'rgba(255,220,100,0.55)');
  glow.addColorStop(1, 'rgba(255,220,100,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.4, 0, Math.PI*2);
  ctx.fill();

  var baseY = cy + R*0.7;
  var baseH = R*0.35;
  var baseW = R*1.7;
  var gB = ctx.createLinearGradient(cx, baseY, cx, baseY+baseH);
  gB.addColorStop(0, 'rgb(255,240,180)');
  gB.addColorStop(0.4, 'rgb(240,200,80)');
  gB.addColorStop(1, 'rgb(140,90,20)');
  ctx.fillStyle = gB;
  ctx.fillRect(cx - baseW/2, baseY, baseW, baseH);

  function spike(x, w, h){
    var g = ctx.createLinearGradient(x-w/2, cy-R*0.5, x, cy-R*0.5+h);
    g.addColorStop(0, 'rgb(255,240,180)');
    g.addColorStop(0.6, 'rgb(240,200,80)');
    g.addColorStop(1, 'rgb(160,110,30)');
    ctx.fillStyle = g;
    poly(ctx, [[x-w/2, cy-R*0.5+h], [x, cy-R*0.5], [x+w/2, cy-R*0.5+h]]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,10,0.7)';
    ctx.lineWidth = S*0.008;
    ctx.stroke();
  }

  var bodyTop = cy - R*0.5 + R*0.35;
  var bodyH = baseY - bodyTop;
  var gM = ctx.createLinearGradient(cx-R, 0, cx+R, 0);
  gM.addColorStop(0, 'rgb(255,240,180)');
  gM.addColorStop(0.35, 'rgb(240,200,80)');
  gM.addColorStop(0.7, 'rgb(200,150,40)');
  gM.addColorStop(1, 'rgb(120,70,10)');
  ctx.fillStyle = gM;
  ctx.fillRect(cx-R*0.85, bodyTop, R*1.7, bodyH);

  spike(cx-R*0.65, R*0.28, R*0.55);
  spike(cx,           R*0.32, R*0.75);
  spike(cx+R*0.65, R*0.28, R*0.55);

  var rg = ctx.createRadialGradient(cx-R*0.04, cy-R*0.95, 0, cx, cy-R*0.9, R*0.15);
  rg.addColorStop(0, 'rgb(255,200,200)');
  rg.addColorStop(0.5, 'rgb(220,50,50)');
  rg.addColorStop(1, 'rgb(120,10,10)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy-R*0.9, R*0.13, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(cx-R*0.04, cy-R*0.94, R*0.04, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(cx-R*0.7, bodyTop+S*0.02, S*0.03, bodyH-S*0.04);

  var gems = [
    [cx-R*0.6, baseY + baseH/2, [220, 50, 50]],
    [cx,       baseY + baseH/2, [60, 120, 220]],
    [cx+R*0.6, baseY + baseH/2, [60, 180, 90]]
  ];
  for (var i = 0; i < gems.length; i++){
    var gm = gems[i];
    var gr = ctx.createRadialGradient(gm[0]-2, gm[1]-2, 0, gm[0], gm[1], S*0.05);
    gr.addColorStop(0, 'rgb(' + Math.min(255, gm[2][0]+80) + ',' + Math.min(255, gm[2][1]+80) + ',' + Math.min(255, gm[2][2]+80) + ')');
    gr.addColorStop(1, 'rgb(' + gm[2][0] + ',' + gm[2][1] + ',' + gm[2][2] + ')');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(gm[0], gm[1], S*0.045, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

/* ============ 圣杯 ============ */
function drawGoblet(ctx, S){
  var cx = S/2, cy = S/2;
  var R = S * 0.40;
  ctx.save();

  var glow = ctx.createRadialGradient(cx, cy, R*0.2, cx, cy, R*1.4);
  glow.addColorStop(0, 'rgba(255,220,120,0.5)');
  glow.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.4, 0, Math.PI*2);
  ctx.fill();

  var bg = ctx.createLinearGradient(cx-R*0.7, 0, cx+R*0.7, 0);
  bg.addColorStop(0, 'rgb(140,90,20)');
  bg.addColorStop(0.5, 'rgb(255,240,180)');
  bg.addColorStop(1, 'rgb(140,90,20)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(cx, cy+R*0.75, R*0.85, R*0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillRect(cx-R*0.55, cy+R*0.55, R*1.1, R*0.2);

  var sg = ctx.createLinearGradient(cx-R*0.1, 0, cx+R*0.1, 0);
  sg.addColorStop(0, 'rgb(140,90,20)');
  sg.addColorStop(0.5, 'rgb(240,200,80)');
  sg.addColorStop(1, 'rgb(140,90,20)');
  ctx.fillStyle = sg;
  ctx.fillRect(cx-R*0.1, cy+R*0.1, R*0.2, R*0.5);

  var cupTop = cy - R*0.75;
  var cupBot = cy + R*0.1;
  var cupW = R*1.4;

  var cg = ctx.createLinearGradient(cx-cupW/2, 0, cx+cupW/2, 0);
  cg.addColorStop(0, 'rgb(140,90,20)');
  cg.addColorStop(0.15, 'rgb(240,200,80)');
  cg.addColorStop(0.4, 'rgb(255,240,180)');
  cg.addColorStop(0.6, 'rgb(240,200,80)');
  cg.addColorStop(0.85, 'rgb(200,140,40)');
  cg.addColorStop(1, 'rgb(140,90,20)');
  ctx.fillStyle = cg;
  poly(ctx, [
    [cx-cupW/2, cupTop], [cx+cupW/2, cupTop],
    [cx+cupW*0.35, cupBot], [cx-cupW*0.35, cupBot]
  ]);
  ctx.fill();

  var og = ctx.createLinearGradient(cx-cupW/2, 0, cx+cupW/2, 0);
  og.addColorStop(0, 'rgb(200,140,40)');
  og.addColorStop(0.5, 'rgb(255,240,180)');
  og.addColorStop(1, 'rgb(200,140,40)');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.ellipse(cx, cupTop, cupW/2, cupW*0.12, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = 'rgba(60,30,0,0.75)';
  ctx.beginPath();
  ctx.ellipse(cx, cupTop, cupW/2 * 0.85, cupW*0.1, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = S*0.02;
  ctx.beginPath();
  ctx.moveTo(cx - cupW*0.3, cupTop + R*0.25);
  ctx.quadraticCurveTo(cx - cupW*0.35, cy, cx - cupW*0.2, cupBot - R*0.05);
  ctx.stroke();

  var rg = ctx.createRadialGradient(cx-R*0.04, cy-R*0.3, 0, cx, cy-R*0.25, R*0.15);
  rg.addColorStop(0, 'rgb(255,200,200)');
  rg.addColorStop(0.5, 'rgb(220,50,50)');
  rg.addColorStop(1, 'rgb(120,10,10)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy-R*0.25, R*0.13, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

/* ============ 沙漏 ============ */
function drawHourglass(ctx, S){
  var cx = S/2, cy = S/2;
  var R = S * 0.40;
  ctx.save();

  var glow = ctx.createRadialGradient(cx, cy, R*0.2, cx, cy, R*1.4);
  glow.addColorStop(0, 'rgba(255,220,120,0.5)');
  glow.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.4, 0, Math.PI*2);
  ctx.fill();

  function woodFrame(y){
    var g = ctx.createLinearGradient(cx-R*0.9, 0, cx+R*0.9, 0);
    g.addColorStop(0, 'rgb(60,35,10)');
    g.addColorStop(0.3, 'rgb(160,110,50)');
    g.addColorStop(0.5, 'rgb(220,170,80)');
    g.addColorStop(0.7, 'rgb(160,110,50)');
    g.addColorStop(1, 'rgb(60,35,10)');
    ctx.fillStyle = g;
    ctx.fillRect(cx-R*0.85, y, R*1.7, R*0.25);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(cx-R*0.85, y+S*0.01, R*1.7, S*0.012);
  }
  woodFrame(cy-R*0.85);
  woodFrame(cy+R*0.6);

  var glg = ctx.createLinearGradient(cx-R*0.6, 0, cx+R*0.6, 0);
  glg.addColorStop(0, 'rgba(220,200,180,0.6)');
  glg.addColorStop(0.5, 'rgba(255,250,230,0.9)');
  glg.addColorStop(1, 'rgba(220,200,180,0.6)');
  ctx.fillStyle = glg;
  poly(ctx, [
    [cx-R*0.5, cy-R*0.6], [cx+R*0.5, cy-R*0.6],
    [cx+R*0.15, cy], [cx+R*0.5, cy+R*0.6],
    [cx-R*0.5, cy+R*0.6], [cx-R*0.15, cy]
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,30,0.7)';
  ctx.lineWidth = S*0.012;
  ctx.stroke();

  var sg1 = ctx.createLinearGradient(0, cy-R*0.55, 0, cy-R*0.1);
  sg1.addColorStop(0, 'rgb(255,220,90)');
  sg1.addColorStop(1, 'rgb(200,140,40)');
  ctx.fillStyle = sg1;
  poly(ctx, [
    [cx-R*0.42, cy-R*0.55], [cx+R*0.42, cy-R*0.55],
    [cx+R*0.12, cy], [cx-R*0.12, cy]
  ]);
  ctx.fill();

  var sg2 = ctx.createLinearGradient(0, cy, 0, cy+R*0.55);
  sg2.addColorStop(0, 'rgb(255,220,90)');
  sg2.addColorStop(1, 'rgb(180,120,30)');
  ctx.fillStyle = sg2;
  poly(ctx, [
    [cx-R*0.42, cy+R*0.55], [cx+R*0.42, cy+R*0.55], [cx, cy+R*0.05]
  ]);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,220,90,0.9)';
  ctx.fillRect(cx-S*0.008, cy-R*0.05, S*0.016, R*0.15);

  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = S*0.015;
  ctx.beginPath();
  ctx.moveTo(cx-R*0.35, cy-R*0.5);
  ctx.quadraticCurveTo(cx-R*0.4, cy, cx-R*0.25, cy+R*0.4);
  ctx.stroke();

  ctx.restore();
}

/* ============ WILD ============ */
function drawWild(ctx, S){
  var cx = S/2, cy = S/2;
  var R = S * 0.42;
  ctx.save();

  var glow = ctx.createRadialGradient(cx, cy, R*0.3, cx, cy, R*1.4);
  glow.addColorStop(0, 'rgba(180,120,255,0.6)');
  glow.addColorStop(1, 'rgba(180,120,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.4, 0, Math.PI*2);
  ctx.fill();

  var bg = ctx.createRadialGradient(cx-R*0.3, cy-R*0.3, 0, cx, cy, R);
  bg.addColorStop(0, 'rgb(200,160,255)');
  bg.addColorStop(0.5, 'rgb(140,80,230)');
  bg.addColorStop(1, 'rgb(60,20,120)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI*2);
  ctx.fill();

  var ring = ctx.createLinearGradient(cx-R, cy-R, cx+R, cy+R);
  ring.addColorStop(0, 'rgb(255,240,180)');
  ring.addColorStop(0.5, 'rgb(220,170,50)');
  ring.addColorStop(1, 'rgb(140,90,20)');
  ctx.strokeStyle = ring;
  ctx.lineWidth = S*0.03;
  ctx.beginPath();
  ctx.arc(cx, cy, R*0.96, 0, Math.PI*2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,240,180,0.55)';
  ctx.lineWidth = S*0.008;
  ctx.beginPath();
  ctx.arc(cx, cy, R*0.85, 0, Math.PI*2);
  ctx.stroke();

  var hg = ctx.createRadialGradient(cx-R*0.35, cy-R*0.4, 0, cx-R*0.35, cy-R*0.4, R*0.5);
  hg.addColorStop(0, 'rgba(255,255,255,0.7)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(cx-R*0.3, cy-R*0.35, R*0.4, R*0.28, -0.4, 0, Math.PI*2);
  ctx.fill();

  var wg = ctx.createLinearGradient(cx, cy-R*0.5, cx, cy+R*0.5);
  wg.addColorStop(0, 'rgb(255,250,200)');
  wg.addColorStop(0.5, 'rgb(250,220,80)');
  wg.addColorStop(1, 'rgb(180,120,20)');
  ctx.fillStyle = wg;
  var ww = R * 0.6, wh = R * 0.5;
  poly(ctx, [
    [cx-ww, cy-wh*0.7], [cx-ww*0.65, cy+wh],
    [cx, cy-wh*0.15], [cx+ww*0.65, cy+wh],
    [cx+ww, cy-wh*0.7], [cx+ww*0.55, cy-wh*0.7],
    [cx, cy+wh*0.5], [cx-ww*0.55, cy-wh*0.7]
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,10,0.7)';
  ctx.lineWidth = S*0.008;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  poly(ctx, [
    [cx-ww, cy-wh*0.7], [cx-ww*0.65, cy+wh], [cx-ww*0.3, cy+wh*0.3]
  ]);
  ctx.fill();

  ctx.restore();
}

/* ============ SCATTER ============ */
function drawScatter(ctx, S){
  var cx = S/2, cy = S/2;
  var R = S * 0.42;
  ctx.save();

  var glow = ctx.createRadialGradient(cx, cy, R*0.3, cx, cy, R*1.5);
  glow.addColorStop(0, 'rgba(255,140,40,0.85)');
  glow.addColorStop(0.6, 'rgba(255,100,20,0.35)');
  glow.addColorStop(1, 'rgba(255,100,20,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R*1.5, 0, Math.PI*2);
  ctx.fill();

  var bg = ctx.createRadialGradient(cx-R*0.25, cy-R*0.25, 0, cx, cy, R);
  bg.addColorStop(0, 'rgb(255,240,180)');
  bg.addColorStop(0.4, 'rgb(255,160,60)');
  bg.addColorStop(0.8, 'rgb(200,80,20)');
  bg.addColorStop(1, 'rgb(120,40,10)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI*2);
  ctx.fill();

  var ring = ctx.createLinearGradient(cx, cy-R, cx, cy+R);
  ring.addColorStop(0, 'rgb(255,250,200)');
  ring.addColorStop(0.5, 'rgb(240,190,50)');
  ring.addColorStop(1, 'rgb(160,90,10)');
  ctx.strokeStyle = ring;
  ctx.lineWidth = S*0.035;
  ctx.beginPath();
  ctx.arc(cx, cy, R*0.94, 0, Math.PI*2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,240,180,0.75)';
  ctx.lineWidth = S*0.01;
  ctx.beginPath();
  ctx.arc(cx, cy, R*0.82, 0, Math.PI*2);
  ctx.stroke();

  var hg = ctx.createRadialGradient(cx-R*0.3, cy-R*0.35, 0, cx-R*0.3, cy-R*0.35, R*0.45);
  hg.addColorStop(0, 'rgba(255,255,255,0.7)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(cx-R*0.3, cy-R*0.35, R*0.35, R*0.25, -0.4, 0, Math.PI*2);
  ctx.fill();

  var boltG = ctx.createLinearGradient(cx, cy-R*0.8, cx, cy+R*0.8);
  boltG.addColorStop(0, 'rgb(255,255,255)');
  boltG.addColorStop(0.5, 'rgb(255,250,180)');
  boltG.addColorStop(1, 'rgb(250,180,40)');
  ctx.fillStyle = boltG;
  var bw = R * 0.35;
  poly(ctx, [
    [cx + bw*0.4,  cy - R*0.75],
    [cx - bw*0.6,  cy + R*0.05],
    [cx - bw*0.05, cy + R*0.05],
    [cx - bw*0.5,  cy + R*0.75],
    [cx + bw*0.7,  cy - R*0.15],
    [cx + bw*0.05, cy - R*0.15]
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,10,0.85)';
  ctx.lineWidth = S*0.01;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  poly(ctx, [
    [cx + bw*0.4,  cy - R*0.75],
    [cx - bw*0.15, cy - R*0.15],
    [cx - bw*0.05, cy - R*0.15]
  ]);
  ctx.fill();

  ctx.restore();
}

/* ============ 调度 + 导出 ============ */
var PALETTES = {
  red:    { base: [220, 60, 60] },
  purple: { base: [160, 80, 240] },
  yellow: { base: [250, 210, 60] },
  green:  { base: [60, 200, 120] },
  blue:   { base: [80, 140, 250] }
};

var DRAWERS = {
  crown:     drawCrown,
  red:       function(ctx, S){ drawGem(ctx, S, PALETTES.red); },
  purple:    function(ctx, S){ drawGem(ctx, S, PALETTES.purple); },
  yellow:    function(ctx, S){ drawGem(ctx, S, PALETTES.yellow); },
  green:     function(ctx, S){ drawGem(ctx, S, PALETTES.green); },
  blue:      function(ctx, S){ drawGem(ctx, S, PALETTES.blue); },
  goblet:    drawGoblet,
  hourglass: drawHourglass,
  wild:      drawWild,
  scatter:   drawScatter
};

function render(key, size){
  size = size || 200;
  var k = key + '@' + size;
  if (cache[k]) return cache[k];
  var drawer = DRAWERS[key];
  if (!drawer) return '';
  var c = document.createElement('canvas');
  c.width = size; c.height = size;
  var ctx = c.getContext('2d');
  drawer(ctx, size);
  var url = c.toDataURL('image/png');
  cache[k] = url;
  return url;
}

window.ApexCanvasSymbols = {
  render: render,
  keys: Object.keys(DRAWERS)
};
console.log('[Apex][canvas-symbols] ready, ' + Object.keys(DRAWERS).length + ' symbols');

})();
