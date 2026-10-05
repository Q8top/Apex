#!/usr/bin/env python3
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 256; SS = 3; W = SIZE*SS
OUT  = 'assets/games/olympus/symbols'
os.makedirs(OUT, exist_ok=True)

def canvas(): return Image.new('RGBA', (W,W), (0,0,0,0))

def radial(inner, outer, cx=.42, cy=.38, r=.72, p=1.15):
    y, x = np.mgrid[0:W, 0:W].astype(float)
    d = np.clip(np.sqrt(((x/W)-cx)**2 + ((y/W)-cy)**2) / r, 0, 1) ** p
    a = np.array(inner, float); b = np.array(outer, float)
    o = a[None,None,:]*(1-d[...,None]) + b[None,None,:]*d[...,None]
    return Image.fromarray(o.astype(np.uint8), 'RGB')

def poly(pts):
    m = Image.new('L',(W,W),0); ImageDraw.Draw(m).polygon(pts, fill=255); return m

def ell(box):
    m = Image.new('L',(W,W),0); ImageDraw.Draw(m).ellipse(box, fill=255); return m

def paste(c, layer, mask): c.paste(layer, (0,0), mask)

def shadow(c, mask, dy=W*.018, blur=W*.020, op=55):
    s = Image.new('RGBA',(W,W),(0,0,0,0))
    s.paste((0,0,0,op), (0,int(dy)), mask)
    s = s.filter(ImageFilter.GaussianBlur(blur))
    c.alpha_composite(s)

def shine(c, mask, a=140, blur=W*.008):
    h = Image.new('RGBA',(W,W),(255,255,255,a)).filter(ImageFilter.GaussianBlur(blur))
    c.paste(h, (0,0), mask)

def save(img, n):
    img.resize((SIZE,SIZE), Image.LANCZOS).save(os.path.join(OUT, n+'.png'))
    print('  ->', n+'.png')

# ---------- 宙斯：紫盘 + 金闪电 ----------
def zeus():
    c = canvas(); cx = cy = W/2; R = W*.44
    m = ell([cx-R, cy-R, cx+R, cy+R])
    paste(c, radial((150,110,215),(55,20,105),.40,.34), m)
    edge = Image.new('L',(W,W),0)
    ImageDraw.Draw(edge).ellipse([cx-R, cy-R, cx+R, cy+R], outline=255, width=int(W*.020))
    paste(c, radial((255,240,160),(190,130,25),.4,.4,.9), edge)
    bolt = [(cx, cy-R*.62),(cx-R*.30, cy+R*.05),(cx-R*.08, cy+R*.05),
            (cx-R*.28, cy+R*.62),(cx+R*.32, cy-R*.10),(cx+R*.08, cy-R*.10),(cx+R*.22, cy-R*.62)]
    bm = poly(bolt)
    paste(c, radial((255,250,200),(210,160,30),.4,.2,.6), bm)
    hl = poly([(cx-R*.20,cy-R*.50),(cx,cy-R*.55),(cx-R*.18,cy+R*.00),(cx-R*.35,cy+R*.02)])
    shine(c, hl, 180, W*.005)
    hm = ell([cx-R*.78, cy-R*.78, cx-R*.30, cy-R*.30])
    shine(c, hm, 90, W*.014)
    shadow(c, ell([cx-R*.85, cy+R*.88, cx+R*.85, cy+R*1.10]), op=50)
    save(c, 'zeus')

# ---------- 金冠 ----------
def crown():
    c = canvas()
    cloth = poly([(W*.18,W*.55),(W*.82,W*.55),(W*.82,W*.70),(W*.18,W*.70)])
    paste(c, radial((160,30,60),(95,10,35),.5,.4,.7), cloth)
    pts = [(W*.10,W*.72),(W*.16,W*.38),(W*.30,W*.55),(W*.40,W*.24),
           (W*.50,W*.48),(W*.60,W*.24),(W*.70,W*.55),(W*.84,W*.38),(W*.90,W*.72)]
    m = poly(pts)
    paste(c, radial((255,240,150),(195,135,25),.4,.35,.78), m)
    base = poly([(W*.10,W*.70),(W*.90,W*.70),(W*.90,W*.82),(W*.10,W*.82)])
    paste(c, radial((255,225,120),(175,115,18),.4,.4,.85), base)
    hl = poly([(W*.16,W*.38),(W*.30,W*.55),(W*.50,W*.48),(W*.50,W*.54),
               (W*.30,W*.61),(W*.16,W*.44)])
    shine(c, hl, 160, W*.005)
    for cx_, col in [(W*.22,(140,60,200)),(W*.50,(220,30,55)),(W*.78,(140,60,200))]:
        gm = ell([cx_-W*.030, W*.725, cx_+W*.030, W*.775])
        paste(c, radial(col,(60,20,80) if col[0]<180 else (120,10,30),.5,.5,.06), gm)
        hg = ell([cx_-W*.012, W*.730, cx_+W*.006, W*.742])
        shine(c, hg, 220, W*.002)
    tm = ell([W*.485, W*.215, W*.515, W*.245])
    paste(c, radial((255,235,150),(200,150,30),.5,.5,.1), tm)
    shadow(c, poly(pts), op=48)
    save(c, 'crown')

# ---------- 圣杯 ----------
def chalice():
    c = canvas()
    cup = poly([(W*.22,W*.28),(W*.78,W*.28),(W*.68,W*.64),(W*.32,W*.64)])
    paste(c, radial((255,240,150),(185,125,22),.4,.35,.78), cup)
    rim = ell([W*.20,W*.24,W*.80,W*.36])
    paste(c, radial((255,245,180),(205,155,45),.45,.45,.65), rim)
    rim_in = ell([W*.25,W*.27,W*.75,W*.33])
    paste(c, Image.new('RGB',(W,W),(115,80,20)), rim_in)
    hl = poly([(W*.28,W*.31),(W*.42,W*.31),(W*.40,W*.62),(W*.32,W*.62)])
    shine(c, hl, 130, W*.006)
    stem = poly([(W*.46,W*.64),(W*.54,W*.64),(W*.54,W*.76),(W*.46,W*.76)])
    paste(c, radial((255,235,140),(200,150,30),.4,.4,.6), stem)
    base = ell([W*.28,W*.74,W*.72,W*.84])
    paste(c, radial((255,240,150),(185,125,22),.4,.4,.72), base)
    base_hl = ell([W*.32,W*.755,W*.60,W*.785])
    shine(c, base_hl, 130, W*.004)
    tm = ell([W*.485,W*.225,W*.515,W*.255])
    paste(c, radial((200,150,255),(80,40,140),.5,.5,.1), tm)
    shadow(c, cup, op=40)
    save(c, 'chalice')

# ---------- 神戒 ----------
def ring():
    c = canvas(); cx = W/2; cy = W/2 + W*.10
    rx, ry = W*.32, W*.26; rw = int(W*.075)
    m = Image.new('L',(W,W),0)
    ImageDraw.Draw(m).ellipse([cx-rx,cy-ry,cx+rx,cy+ry], outline=255, width=rw)
    paste(c, radial((255,235,140),(185,125,22),.4,.4,.9), m)
    ha = Image.new('RGBA',(W,W),(0,0,0,0))
    ImageDraw.Draw(ha).arc([cx-rx,cy-ry,cx+rx,cy+ry],200,260,fill=(255,250,220,200),width=int(W*.016))
    c.alpha_composite(ha.filter(ImageFilter.GaussianBlur(W*.006)))
    base = poly([(cx-W*.10,cy-ry),(cx-W*.06,cy-ry-W*.14),(cx+W*.06,cy-ry-W*.14),(cx+W*.10,cy-ry)])
    paste(c, radial((255,235,140),(200,150,30),.4,.3,.4), base)
    gy = cy - ry - W*.14; gr = W*.085
    gm = poly([(cx,gy-gr),(cx+gr,gy),(cx,gy+gr),(cx-gr,gy)])
    paste(c, radial((255,180,220),(200,30,90),.5,.35,.55), gm)
    shine(c, poly([(cx-gr*.5,gy-gr*.3),(cx+gr*.1,gy-gr*.6),(cx+gr*.2,gy-gr*.2)]), 180, W*.003)
    shadow(c, m, op=40)
    save(c, 'ring')

# ---------- 沙漏 ----------
def hourglass():
    c = canvas()
    top = poly([(W*.18,W*.10),(W*.82,W*.10),(W*.82,W*.18),(W*.18,W*.18)])
    bot = poly([(W*.18,W*.82),(W*.82,W*.82),(W*.82,W*.90),(W*.18,W*.90)])
    for m in (top, bot):
        paste(c, radial((255,235,140),(190,130,25),.4,.4,.6), m)
    glass = poly([(W*.28,W*.18),(W*.72,W*.18),(W*.50,W*.50),(W*.72,W*.82),(W*.28,W*.82),(W*.50,W*.50)])
    paste(c, Image.new('RGB',(W,W),(205,232,255)), glass)
    sand_top = poly([(W*.32,W*.22),(W*.68,W*.22),(W*.50,W*.46)])
    paste(c, radial((255,235,140),(200,150,30),.5,.3,.4), sand_top)
    sand_bot = poly([(W*.32,W*.78),(W*.68,W*.78),(W*.50,W*.55)])
    paste(c, radial((255,240,160),(210,160,40),.5,.7,.4), sand_bot)
    ImageDraw.Draw(c).line([(W*.50,W*.48),(W*.50,W*.55)], fill=(255,235,150), width=int(W*.012))
    ha = Image.new('RGBA',(W,W),(0,0,0,0)); hd = ImageDraw.Draw(ha)
    hd.line([(W*.34,W*.24),(W*.40,W*.42)], fill=(255,255,255,200), width=int(W*.012))
    hd.line([(W*.34,W*.76),(W*.40,W*.60)], fill=(255,255,255,140), width=int(W*.010))
    c.alpha_composite(ha.filter(ImageFilter.GaussianBlur(W*.004)))
    shadow(c, Image.new('L',(W,W),255), op=28)
    save(c, 'hourglass')

# ---------- 6 切面宝石 ----------
def gem(name, light, mid, dark, edge, rim):
    c = canvas(); cx = cy = W/2; R = W*.42
    pts = [(cx+R*math.cos(math.radians(i*60-90)), cy+R*math.sin(math.radians(i*60-90))) for i in range(6)]
    m = poly(pts)
    paste(c, radial(light, dark, .40, .35, .78), m)
    inner = [(cx+R*.5*math.cos(math.radians(i*60-90)), cy+R*.5*math.sin(math.radians(i*60-90))) for i in range(6)]
    paste(c, radial(mid, light, .40, .30, .5), poly(inner))
    d = ImageDraw.Draw(c)
    for i in range(6):
        d.line([pts[i], pts[(i+1)%6]], fill=edge+(140,), width=int(W*.004))
        d.line([(cx,cy), pts[i]], fill=edge+(90,), width=int(W*.003))
    shine(c, poly([(cx-R*.55,cy-R*.55),(cx-R*.05,cy-R*.65),
                   (cx-R*.10,cy-R*.20),(cx-R*.55,cy-R*.30)]), 140, W*.010)
    f = Image.new('L',(W,W),0)
    ImageDraw.Draw(f).polygon(pts, outline=255, width=int(W*.008))
    f = f.filter(ImageFilter.GaussianBlur(W*.006))
    c.paste(Image.new('RGBA',(W,W),rim+(180,)), (0,0), f)
    shadow(c, m, op=42)
    save(c, name)

print('生成 v3 符号…')
zeus(); crown(); chalice(); ring(); hourglass()
gem('gem-red',    (255,180,190),(255,120,140),(140,10,30),(60,0,10),(255,100,130))
gem('gem-purple', (220,180,255),(180,120,255),(70,25,150),(30,10,60),(180,140,255))
gem('gem-blue',   (180,220,255),(100,180,255),(20,60,160),(10,25,70),(140,200,255))
gem('gem-green',  (200,255,200),(120,230,140),(25,110,40),(10,45,20),(150,255,170))
gem('gem-yellow', (255,245,180),(255,220,120),(170,120,20),(60,40,5),(255,230,140))
print('==V3-OK==')
