# Logopakket OK Timmerwerken: alle logovarianten als SVG en transparante PNG, uit de originele vectorvormen
# (assets/logo-oud/ok-timmerwerken-icoon.svg en -woord.svg, overgenomen uit het EPS-bestand van 2021).
# Gebruik: python3 tools/logopakket.py   → docs/merk/logopakket/{svg,png}
import os, re
from PIL import Image, ImageDraw, ImageChops

ROOT = os.path.join(os.path.dirname(__file__), '..')
UIT = os.path.join(ROOT, 'docs/merk/logopakket')
KLEUREN = {'zwart': '#14130f', 'wit': '#ffffff', 'brons': '#b58a52'}

def pad_uit(bestand):
    s = open(os.path.join(ROOT, bestand)).read()
    return re.search(r' d="([^"]+)"', s).group(1)

ICOON, WOORD = pad_uit('assets/logo-oud/ok-timmerwerken-icoon.svg'), pad_uit('assets/logo-oud/ok-timmerwerken-woord.svg')
IW, IH, WW, WH = 444, 418, 862, 74

# opbouw per variant: lijst van (pad, x, y, schaal) en de totale maat
def staand():
    s = 0.62                                   # icoon iets kleiner dan de woordbreedte, zoals in de footer
    iw, ih = IW * s, IH * s
    gap = 52
    return [(ICOON, (WW - iw) / 2, 0, s), (WOORD, 0, ih + gap, 1)], WW, ih + gap + WH
def liggend():
    wh = IH * 0.33                             # woordhoogte = 1/3 van het icoon (zoals de menubalk)
    s = wh / WH
    gap = IH * 0.30
    return [(ICOON, 0, 0, 1), (WOORD, IW + gap, (IH - wh) / 2, s)], IW + gap + WW * s, IH
def beeldmerk():
    return [(ICOON, 0, 0, 1)], IW, IH
def woordmerk():
    return [(WOORD, 0, 0, 1)], WW, WH

VARIANTEN = {'staand': staand, 'liggend': liggend, 'beeldmerk': beeldmerk, 'woordmerk': woordmerk}

def svg(onderdelen, w, h, kleur, marge=0, achtergrond=None, rond=0):
    W, H = w + 2 * marge, h + 2 * marge
    bg = f'<rect width="{W:g}" height="{H:g}" rx="{rond:g}" fill="{achtergrond}"/>' if achtergrond else ''
    delen = ''.join(f'<path transform="translate({x + marge:.2f} {y + marge:.2f}) scale({sc:.5f})" d="{d}"/>' for d, x, y, sc in onderdelen)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}">{bg}<g fill="{kleur}">{delen}</g></svg>\n'

# ---------- rasteren (zelfde vormen, 4x supersampling) ----------
def subpaden(d):
    toks = re.findall(r'[MLCZ]|-?[\d.]+', d); i = 0; cur = None; sp = []; alle = []
    while i < len(toks):
        t = toks[i]
        if t == 'M':
            if sp: alle.append(sp)
            cur = (float(toks[i + 1]), float(toks[i + 2])); sp = [cur]; i += 3
        elif t == 'L':
            cur = (float(toks[i + 1]), float(toks[i + 2])); sp.append(cur); i += 3
        elif t == 'C':
            x1, y1, x2, y2, x3, y3 = map(float, toks[i + 1:i + 7]); x0, y0 = cur
            for k in range(1, 25):
                u = k / 24; a = (1 - u) ** 3; b = 3 * (1 - u) ** 2 * u; c = 3 * (1 - u) * u * u; e = u ** 3
                sp.append((a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3))
            cur = (x3, y3); i += 7
        else:
            i += 1
    if sp: alle.append(sp)
    return alle

def masker(onderdelen, w, h, breedte, marge=0, SS=4):
    sc = breedte / (w + 2 * marge); W, H = round((w + 2 * marge) * sc), round((h + 2 * marge) * sc)
    m = Image.new('1', (W * SS, H * SS), 0)
    for d, x, y, s in onderdelen:
        vorm = Image.new('1', m.size, 0)
        for sp in subpaden(d):        # even-odd per vorm: gaten (O, R, P …) blijven open
            laag = Image.new('1', m.size, 0)
            ImageDraw.Draw(laag).polygon([((x + marge + px * s) * sc * SS, (y + marge + py * s) * sc * SS) for px, py in sp], fill=1)
            vorm = ImageChops.logical_xor(vorm, laag)
        m = ImageChops.logical_or(m, vorm)
    return m.convert('L').resize((W, H), Image.LANCZOS)

def png(onderdelen, w, h, kleur, breedte, marge=0, achtergrond=None, rond=0):
    m = masker(onderdelen, w, h, breedte, marge)
    rgb = tuple(int(kleur[i:i + 2], 16) for i in (1, 3, 5))
    vorm = Image.new('RGBA', m.size, rgb + (0,)); vorm.putalpha(m)
    if not achtergrond: return vorm
    bg = Image.new('RGBA', m.size, (0, 0, 0, 0))
    ab = tuple(int(achtergrond[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    r = round(rond * m.size[0] / (w + 2 * marge))
    ImageDraw.Draw(bg).rounded_rectangle((0, 0, m.size[0] - 1, m.size[1] - 1), radius=r, fill=ab)
    bg.alpha_composite(vorm); return bg

if __name__ == '__main__':
    for sub in ('svg', 'png', 'favicon'):
        os.makedirs(os.path.join(UIT, sub), exist_ok=True)
    teller = 0
    for naam, maak in VARIANTEN.items():
        onderdelen, w, h = maak()
        for kl, hexw in KLEUREN.items():
            open(os.path.join(UIT, 'svg', f'ok-timmerwerken-{naam}-{kl}.svg'), 'w').write(svg(onderdelen, w, h, hexw)); teller += 1
            for br in (2000, 600):
                png(onderdelen, w, h, hexw, br).save(os.path.join(UIT, 'png', f'ok-timmerwerken-{naam}-{kl}-{br}.png'), optimize=True); teller += 1
    # favicon / app-icoon: beeldmerk op een vierkant (donker met wit, en licht met donker)
    onderdelen, w, h = beeldmerk()
    marge = (w * 1.36 - w) / 2; extra_h = (w - h) / 2   # vierkant maken
    vk = [(d, x, y + extra_h, s) for d, x, y, s in onderdelen]
    open(os.path.join(UIT, 'favicon', 'favicon.svg'), 'w').write(svg(vk, w, w, '#ffffff', marge, '#14130f', rond=w * 0.22)); teller += 1
    for maat in (32, 180, 192, 512):
        png(vk, w, w, '#ffffff', maat, marge, '#14130f', rond=w * 0.22).save(os.path.join(UIT, 'favicon', f'favicon-{maat}.png'), optimize=True); teller += 1
    png(vk, w, w, '#14130f', 512, marge, '#f4f1ec', rond=w * 0.22).save(os.path.join(UIT, 'favicon', 'app-icoon-licht-512.png'), optimize=True); teller += 1
    print(f'{teller} bestanden in {os.path.relpath(UIT, ROOT)}')
