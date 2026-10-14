# Voor/na-paar uitlijnen voor de schuifbalk: zoekt schaal + verschuiving waarmee de na-foto op de voor-foto past
# (correlatie van randen, grof naar fijn), snijdt beide bij tot het gedeelde stuk en slaat ze even groot op.
# Gebruik: [SCHAAL=min,max] python3 tools/voorna-uitlijnen.py <voor.jpg> <na.jpg> <uit-prefix> [controle.jpg]
#   → <uit-prefix>-voor.jpg en <uit-prefix>-na.jpg (max 1100 breed), en eventueel een controlebeeld (overlap + half/half)
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

def randen(im, w):
    g = im.convert('L').resize((w, round(im.height * w / im.width)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(g, dtype=np.float32); gx = np.abs(np.diff(a, axis=1))[:-1]; gy = np.abs(np.diff(a, axis=0))[:, :-1]
    e = np.hypot(gx, gy); return (e - e.mean()) / (e.std() + 1e-6)

def zoek(ia, ib, W, schalen, R, stap):
    ea = randen(ia, W); H, Wa = ea.shape; best = None
    for s in schalen:
        eb = randen(ib, round(W * s))
        for dy in range(-R, R + 1, stap):
            for dx in range(-R, R + 1, stap):
                oy = (eb.shape[0] - H) // 2 + dy; ox = (eb.shape[1] - Wa) // 2 + dx
                y0, x0 = max(0, -oy), max(0, -ox); y1 = min(H, eb.shape[0] - oy); x1 = min(Wa, eb.shape[1] - ox)
                if (y1 - y0) < H * .6 or (x1 - x0) < Wa * .6: continue
                r = float((ea[y0:y1, x0:x1] * eb[y0 + oy:y1 + oy, x0 + ox:x1 + ox]).mean())
                if best is None or r > best[0]: best = (r, s, dx, dy)
    return best

def uitsnede(ia, ib, W, s, dx, dy):
    k = ia.width / W; H = round(ia.height * W / ia.width); bw = round(W * s); bh = round(ib.height * bw / ib.width)
    oy = (bh - H) // 2 + dy; ox = (bw - W) // 2 + dx
    y0, x0 = max(0, -oy), max(0, -ox); y1 = min(H, bh - oy); x1 = min(W, bw - ox)
    ca = ia.crop((round(x0 * k), round(y0 * k), round(x1 * k), round(y1 * k))); kb = ib.width / bw
    cb = ib.crop((round((x0 + ox) * kb), round((y0 + oy) * kb), round((x1 + ox) * kb), round((y1 + oy) * kb))).resize(ca.size, Image.LANCZOS)
    return ca, cb

def fijn(ia, ib, s, dx, dy, W=320):
    # rond de grove schatting: schaal in stapjes van 0,005 en verschuiving per pixel op dubbele resolutie
    ea = randen(ia, W); H, Wa = ea.shape; best = None
    for ss in np.arange(s - .02, s + .021, .005):
        eb = randen(ib, round(W * ss))
        for ddy in range(dy * 2 - 6, dy * 2 + 7):
            for ddx in range(dx * 2 - 6, dx * 2 + 7):
                oy = (eb.shape[0] - H) // 2 + ddy; ox = (eb.shape[1] - Wa) // 2 + ddx
                y0, x0 = max(0, -oy), max(0, -ox); y1 = min(H, eb.shape[0] - oy); x1 = min(Wa, eb.shape[1] - ox)
                if (y1 - y0) < H * .6 or (x1 - x0) < Wa * .6: continue
                r = float((ea[y0:y1, x0:x1] * eb[y0 + oy:y1 + oy, x0 + ox:x1 + ox]).mean())
                if best is None or r > best[0]: best = (r, ss, ddx, ddy)
    return best

if __name__ == '__main__':
    voor, na, prefix = sys.argv[1:4]
    ia = ImageOps.exif_transpose(Image.open(voor)).convert('RGB'); ib = ImageOps.exif_transpose(Image.open(na)).convert('RGB')
    lo, hi = map(float, os.environ.get('SCHAAL', '0.6,1.6').split(','))   # bv. SCHAAL=0.85,1.1 als hij een verkeerde schaal pakt
    _, s, dx, dy = zoek(ia, ib, 160, np.arange(lo, hi, 0.03), 36, 3)
    r, s, dx, dy = fijn(ia, ib, s, dx, dy)
    ca, cb = uitsnede(ia, ib, 320, s, dx, dy)
    if ca.width > 1100:
        h = round(ca.height * 1100 / ca.width); ca = ca.resize((1100, h), Image.LANCZOS); cb = cb.resize((1100, h), Image.LANCZOS)
    ca.save(prefix + '-voor.jpg', quality=78, optimize=True, progressive=True)
    cb.save(prefix + '-na.jpg', quality=78, optimize=True, progressive=True)
    print(f'overeenkomst {r:.2f}  schaal {s:.3f}  maat {ca.size[0]}x{ca.size[1]}')
    if len(sys.argv) > 4:
        half = ca.copy(); half.paste(cb.crop((ca.width // 2, 0, ca.width, ca.height)), (ca.width // 2, 0))
        o = Image.new('RGB', (ca.width * 2 + 20, ca.height), 'white'); o.paste(Image.blend(ca, cb, .5), (0, 0)); o.paste(half, (ca.width + 20, 0))
        o.thumbnail((1200, 1200)); o.save(sys.argv[4], quality=82)
