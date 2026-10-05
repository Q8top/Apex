#!/usr/bin/env python3
"""Apex · Olympus 符号程序化生成器 — Pillow + NumPy"""
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

OUT = 'assets/games/olympus/symbols'
S   = 256
SS  = 3
W   = S * SS

def canvas(): return Image.new('RGBA', (W, W), (0,0,0,0))
def P(cx, cy, r, deg):
    a = math.radians(deg - 90)
    return (cx + r*math.cos(a), cy + r*math.sin(a))

def vgrad(stops, size=W):
    t = np.linspace(0, 1, size)
    pos = np.array([s[0] for s in stops])
    rgb = np.array([_hex2rgb(s[1]) if isinstance(s[1], str) else s[1] for s in stops], float)
    r = np.interp(t, pos, rgb[:,0]); g = np.interp(t, pos, rgb[:,1]); b = np.interp(t, pos, rgb[:,2])
    arr = np.stack([r,g,b,np.full(size,255)], -1).astype(np.uint8)
    return Image.fromarray(np.tile(arr[:,None,:], (1,size,1)), 'RGBA')

def _hex2rgb(c):
    if isinstance(c, str):
        c = c.lstrip('#')
        return (int(c[0:2],16), int(c[2:4],16), int(c[4:6],16))
    return tuple(c)

def rgrad(inner, outer, cx=.5, cy=.42):
    inner = _hex2rgb(inner); outer = _hex2rgb(outer)
    y, x = np.mgrid[0:W, 0:W].astype(float)
    d = np.clip(np.sqrt(((x/W-cx)*.72)**2 + ((y/W-cy)*.72)**2), 0, 1)
    r = inner[0]*(1-d) + outer[0]*d
    g = inner[1]*(1-d) + outer[1]*d
    b = inner[2]*(1-d) + outer[2]*d
    arr = np.stack([r,g,b,np.full((W,W),255)], -1).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

GOLD = [(0,(255,250,220)),(.18,(250,225,140)),(.42,(232,178,60)),(.68,(180,128,20)),(.88,(110,74,0)),(1,(200,145,40))]

def paste_mask(base, layer, mask):
    base.paste(layer, (0,0), mask)

def save(img, name):
    img = img.resize((S,S), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, name + '.png'))
    print('  ->', name + '.png')

# ================= 宝石：12 切面 + 台面渐变 =================
def gem(name, shades, edge):
    img = canvas(); cx = cy = W/2
    rO = W*.42; rT = W*.20; N = 12
    outer = [P(cx, cy, rO, i*(360/N)) for i in range(N)]
    table = [P(cx, cy, rT, i*(360/N)) for i in range(N)]
    d = ImageDraw.Draw(img)
    for i in range(N):
        j = (i+1) % N
        deg = i*(360/N)
        f = .5 + .5*math.cos(math.radians(deg + 45))
        c = shades[int((1-f)*(len(shades)-1))]
        d.polygon([table[i], table[j], outer[j], outer[i]], fill=c)
    face = rgrad(shades[-1], shades[0])
    m = Image.new('L', (W,W), 0); ImageDraw.Draw(m).polygon(table, fill=255)
    paste_mask(img, face, m)
    hl = Image.new('RGBA', (W,W), (0,0,0,0)); hd = ImageDraw.Draw(hl)
    hd.polygon([table[N-2], table[N-1], (cx,cy)], fill=(255,255,255,150))
    img.alpha_composite(hl)
    d.line([outer[N-2], outer[N-1]], fill=(255,255,255,160), width=int(W*.018))
    d.polygon(outer, outline=edge, width=int(W*.006))
    save(img, name)

# ================= 宙斯：紫底 + 金色脸 + 王冠 + 闪电 =================
def zeus():
    img = canvas(); cx = cy = W/2; r = W*.46
    disc = rgrad((120,90,190),(45,20,80))
    m = Image.new('L',(W,W),0); ImageDraw.Draw(m).ellipse([cx-r,cy-r,cx+r,cy+r], fill=255)
    paste_mask(img, disc, m)
    bm = Image.new('L',(W,W),0); ImageDraw.Draw(bm).ellipse([cx-r,cy-r,cx+r,cy+r], outline=255, width=int(W*.04))
    paste_mask(img, vgrad(GOLD), bm)
    d = ImageDraw.Draw(img)
    fr = r*.48; fy = cy + r*.08
    d.ellipse([cx-fr*.9, fy-fr, cx+fr*.9, fy+fr*1.15], fill=(242,222,188))
    for dx in (-fr*.42, fr*.42):
        d.ellipse([cx+dx-fr*.09, fy-fr*.10-fr*.11, cx+dx+fr*.09, fy-fr*.10+fr*.11], fill=(40,25,10))
        d.ellipse([cx+dx-fr*.03, fy-fr*.14-fr*.04, cx+dx+fr*.03, fy-fr*.14+fr*.04], fill=(255,255,255,220))
    d.polygon([(cx,fy-fr*.02),(cx-fr*.11,fy+fr*.22),(cx+fr*.11,fy+fr*.22)], fill=(215,185,145))
    d.ellipse([cx-fr*.85, fy+fr*.45, cx+fr*.85, fy+fr*1.25], fill=(255,250,235))
    cb = fy - fr*.9
    pts = [(cx-fr*.85,cb),(cx-fr*.55,cb-fr*.4),(cx-fr*.2,cb-fr*.1),(cx,cb-fr*.55),
           (cx+fr*.2,cb-fr*.1),(cx+fr*.55,cb-fr*.4),(cx+fr*.85,cb)]
    d.polygon(pts, fill=(245,205,55), outline=(110,74,0))
    fx, fy2 = cx + r*.55, cy - r*.68
    flash = [(fx,fy2),(fx-r*.15,fy2+r*.25),(fx-r*.05,fy2+r*.25),(fx-r*.20,fy2+r*.55),
             (fx-r*.02,fy2+r*.30),(fx-r*.12,fy2+r*.30),(fx+r*.05,fy2)]
    d.polygon(flash, fill=(255,250,200), outline=(110,74,0))
    hl = Image.new('RGBA',(W,W),(0,0,0,0)); ImageDraw.Draw(hl).ellipse([cx-r*.75,cy-r*.75,cx-r*.2,cy-r*.2], fill=(255,255,255,45))
    img.alpha_composite(hl)
    save(img, 'zeus')

# ================= 金冠 =================
def crown():
    img = canvas()
    d = ImageDraw.Draw(img)
    d.rectangle([W*.26, W*.36, W*.74, W*.70], fill=(140,20,55))
    for x in (W*.32, W*.42, W*.52, W*.62):
        d.line([(x,W*.38),(x,W*.68)], fill=(90,10,35), width=int(W*.005))
    base_y = W*.72; top_y = W*.34
    pts = [(W*.16,base_y),(W*.21,top_y+W*.14),(W*.34,top_y+W*.05),(W*.50,top_y-W*.08),
           (W*.66,top_y+W*.05),(W*.79,top_y+W*.14),(W*.84,base_y)]
    d.polygon(pts, fill=(240,200,60), outline=(110,74,0))
    hl = Image.new('RGBA',(W,W),(0,0,0,0)); hd = ImageDraw.Draw(hl)
    hd.polygon([(W*.21,top_y+W*.14),(W*.34,top_y+W*.05),(W*.50,top_y-W*.08),
                (W*.50,top_y+W*.02),(W*.34,top_y+W*.15),(W*.21,top_y+W*.24)], fill=(255,248,200,180))
    img.alpha_composite(hl)
    d.rectangle([W*.14, W*.70, W*.86, W*.82], fill=(240,200,60), outline=(110,74,0))
    d.line([(W*.15,W*.76),(W*.85,W*.76)], fill=(255,245,200,220), width=int(W*.008))
    d.ellipse([W*.47,W*.72,W*.53,W*.79], fill=(220,30,60), outline=(90,0,20))
    d.ellipse([W*.48,W*.73,W*.50,W*.75], fill=(255,180,200))
    for x in (W*.24, W*.76):
        d.ellipse([x-W*.02,W*.73,x+W*.02,W*.78], fill=(120,60,190), outline=(60,20,100))
    save(img, 'crown')

# ================= 圣杯 =================
def chalice():
    img = canvas()
    d = ImageDraw.Draw(img)
    cup = [(W*.22,W*.28),(W*.78,W*.28),(W*.68,W*.62),(W*.32,W*.62)]
    d.polygon(cup, fill=(240,200,60), outline=(110,74,0))
    hl = Image.new('RGBA',(W,W),(0,0,0,0)); hd = ImageDraw.Draw(hl)
    hd.polygon([(W*.28,W*.30),(W*.42,W*.30),(W*.40,W*.60),(W*.32,W*.60)], fill=(255,248,200,200))
    img.alpha_composite(hl)
    d.ellipse([W*.22,W*.24,W*.78,W*.36], fill=(250,225,140), outline=(110,74,0))
    d.ellipse([W*.26,W*.27,W*.74,W*.32], fill=(110,74,0))
    d.rectangle([W*.46,W*.62,W*.54,W*.74], fill=(230,190,50))
    d.ellipse([W*.28,W*.72,W*.72,W*.83], fill=(240,200,60), outline=(110,74,0))
    d.ellipse([W*.30,W*.73,W*.70,W*.77], fill=(255,248,200,220))
    d.polygon([(W*.48,W*.26),(W*.52,W*.26),(W*.50,W*.22)], fill=(120,60,190), outline=(60,20,100))
    save(img, 'chalice')

# ================= 神戒 =================
def ring():
    img = canvas()
    cx = W/2; cy = W/2 + W*.09
    rx, ry = W*.30, W*.26; rw = int(W*.075)
    d = ImageDraw.Draw(img)
    d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry], outline=(240,200,60), width=rw)
    d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry], outline=(110,74,0), width=int(W*.008))
    d.ellipse([cx-rx+rw/2,cy-ry+rw/2,cx+rx-rw/2,cy+ry-rw/2], outline=(110,74,0), width=int(W*.005))
    d.ellipse([cx-rx-rw/2,cy-ry-rw/2,cx+rx+rw/2,cy+ry+rw/2], outline=(110,74,0), width=int(W*.005))
    hl = Image.new('RGBA',(W,W),(0,0,0,0)); hd = ImageDraw.Draw(hl)
    hd.arc([cx-rx,cy-ry,cx+rx,cy+ry], 200, 250, fill=(255,248,200,220), width=int(W*.018))
    img.alpha_composite(hl)
    gy = cy - ry - W*.04; gr = W*.11
    d.polygon([(cx,gy-gr),(cx+gr,gy),(cx,gy+gr),(cx-gr,gy)], fill=(220,100,220), outline=(80,30,80))
    d.polygon([(cx,gy-gr),(cx+gr*.5,gy),(cx,gy)], fill=(255,200,255,200))
    d.polygon([(cx-W*.06,gy+gr*.9),(cx+W*.06,gy+gr*.9),(cx+W*.04,cy-ry+W*.02),(cx-W*.04,cy-ry+W*.02)],
              fill=(240,200,60), outline=(110,74,0))
    save(img, 'ring')

# ================= 沙漏 =================
def hourglass():
    img = canvas()
    cx = W/2
    d = ImageDraw.Draw(img)
    d.rectangle([W*.18,W*.09,W*.82,W*.19], fill=(240,200,60), outline=(110,74,0))
    d.rectangle([W*.18,W*.81,W*.82,W*.91], fill=(240,200,60), outline=(110,74,0))
    d.line([(W*.20,W*.11),(W*.80,W*.11)], fill=(255,248,200,220), width=int(W*.008))
    d.line([(W*.20,W*.89),(W*.80,W*.89)], fill=(255,248,200,220), width=int(W*.008))
    glass = Image.new('RGBA',(W,W),(0,0,0,0)); gd = ImageDraw.Draw(glass)
    gd.polygon([(W*.26,W*.19),(W*.74,W*.19),(cx,W*.50)], fill=(200,230,255,200))
    gd.polygon([(W*.26,W*.81),(W*.74,W*.81),(cx,W*.50)], fill=(200,230,255,200))
    img.alpha_composite(glass)
    sand1 = Image.new('RGBA',(W,W),(0,0,0,0)); sd1 = ImageDraw.Draw(sand1)
    sd1.polygon([(W*.29,W*.22),(W*.71,W*.22),(cx,W*.48)], fill=(240,200,60,240))
    img.alpha_composite(sand1)
    d.polygon([(W*.29,W*.78),(W*.71,W*.78),(cx,W*.55)], fill=(240,200,60,240))
    d.line([(cx,W*.50),(cx,W*.55)], fill=(255,235,150), width=int(W*.012))
    refl = Image.new('RGBA',(W,W),(0,0,0,0)); rd = ImageDraw.Draw(refl)
    rd.line([(W*.32,W*.24),(W*.38,W*.42)], fill=(255,255,255,220), width=int(W*.012))
    rd.line([(W*.32,W*.76),(W*.38,W*.60)], fill=(255,255,255,140), width=int(W*.010))
    img.alpha_composite(refl)
    save(img, 'hourglass')

def main():
    print('生成 10 个符号…')
    zeus(); crown(); chalice(); ring(); hourglass()
    gem('gem-red',    ['#3A0008','#8B0A22','#C11030','#E63950','#FF8A8A'], '#3A0008')
    gem('gem-purple', ['#1A0A3D','#4A1F9E','#7A3FD1','#9B5DE5','#C098FF'], '#1A0A3D')
    gem('gem-blue',   ['#031843','#0D47A1','#0D6FD1','#2196F3','#6BC0FF'], '#031843')
    gem('gem-green',  ['#052008','#1B5E20','#2E8B33','#43A047','#7CD17E'], '#052008')
    gem('gem-yellow', ['#3D2900','#B8860B','#D9A000','#FFC107','#FFE580'], '#3D2900')
    print('完成')

if __name__ == '__main__':
    main()
