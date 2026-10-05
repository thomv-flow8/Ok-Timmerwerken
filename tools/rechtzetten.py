#!/usr/bin/env python3
# Zet een scheve foto recht. Detecteert de kleine scheefstand uit de dominante
# horizontale en verticale lijnen, draait die weg, en snijdt het grootste
# rechthoekige vlak met dezelfde beeldverhouding uit - zonder zwarte hoeken.
#
#   python3 tools/rechtzetten.py <in.jpg> <uit.jpg> [hoek]
#
# Zonder [hoek] wordt de hoek automatisch bepaald (begrensd op +-4 graden).
# Met [hoek] wordt die hoek afgedwongen (positief = tegen de klok in rechtzetten).

import sys, math
import numpy as np
from PIL import Image

def grijs_klein(img, maxzij=800):
    g = img.convert("L")
    s = maxzij / max(g.size)
    if s < 1:
        g = g.resize((max(1, int(g.size[0]*s)), max(1, int(g.size[1]*s))))
    return np.asarray(g, dtype=np.float32)

def scheefstand(a):
    # Eenvoudige gradient via centrale verschillen.
    gx = a[1:-1, 2:] - a[1:-1, :-2]
    gy = a[2:, 1:-1] - a[:-2, 1:-1]
    gx = gx[:, :gy.shape[1]]; gy = gy[:gx.shape[0], :]
    mag = np.hypot(gx, gy)
    drempel = np.percentile(mag, 88)
    m = mag > drempel
    if m.sum() < 80:
        return 0.0
    # Richting van de rand staat loodrecht op de gradient.
    rand = np.degrees(np.arctan2(gy[m], gx[m])) + 90.0
    # Vouw naar afwijking van het dichtstbijzijnde veelvoud van 90 graden.
    afw = ((rand + 45.0) % 90.0) - 45.0
    w = mag[m]
    sel = np.abs(afw) <= 5.0
    if sel.sum() < 50:
        return 0.0
    hist, randen = np.histogram(afw[sel], bins=100, range=(-5, 5), weights=w[sel])
    i = int(np.argmax(hist))
    return float((randen[i] + randen[i+1]) / 2)

def grootste_rechthoek(w, h, hoek_rad, doel_aspect):
    # Grootste as-gelijnde rechthoek binnen een om 'hoek' gedraaid w x h beeld.
    s, c = abs(math.sin(hoek_rad)), abs(math.cos(hoek_rad))
    langer = w >= h
    lang, kort = (w, h) if langer else (h, w)
    if kort <= 2*s*c*lang or abs(s-c) < 1e-10:
        x = 0.5*kort
        wr, hr = (x/s, x/c) if langer else (x/c, x/s)
    else:
        c2 = c*c - s*s
        wr = (w*c - h*s)/c2
        hr = (h*c - w*s)/c2
    # Pas de doel-beeldverhouding in deze maximale rechthoek.
    if wr/hr > doel_aspect:
        cw, ch = hr*doel_aspect, hr
    else:
        cw, ch = wr, wr/doel_aspect
    return cw, ch

def main():
    inpad, uitpad = sys.argv[1], sys.argv[2]
    img = Image.open(inpad).convert("RGB")
    W, H = img.size
    if len(sys.argv) > 3:
        hoek = float(sys.argv[3])
    else:
        a = grijs_klein(img)
        ruw = scheefstand(a)
        # Kies het teken dat de restscheefstand het kleinst maakt.
        beste, best_rest = 0.0, 1e9
        for kand in (ruw, -ruw):
            k = max(-4.0, min(4.0, kand))
            gedr = img.rotate(k, resample=Image.BICUBIC, expand=True)
            rest = abs(scheefstand(grijs_klein(gedr)))
            if rest < best_rest:
                best_rest, beste = rest, k
        hoek = beste
    if abs(hoek) < 0.25:
        img.save(uitpad, quality=95)
        print(f"{inpad}: recht genoeg ({hoek:+.2f} graden), ongewijzigd")
        return
    gedraaid = img.rotate(hoek, resample=Image.BICUBIC, expand=True)
    GW, GH = gedraaid.size
    cw, ch = grootste_rechthoek(W, H, math.radians(hoek), W/H)
    cw, ch = int(cw), int(ch)
    left = (GW - cw)//2; top = (GH - ch)//2
    bij = gedraaid.crop((left, top, left+cw, top+ch)).resize((W, H), Image.LANCZOS)
    bij.save(uitpad, quality=95)
    print(f"{inpad}: rechtgezet {hoek:+.2f} graden")

if __name__ == "__main__":
    main()
