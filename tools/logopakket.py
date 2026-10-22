# Logopakket OK Timmerwerken: alle logovarianten als SVG en transparante PNG, uit de originele vectorvormen
# (assets/logo-oud/ok-timmerwerken-icoon.svg en -woord.svg, overgenomen uit het EPS-bestand van 2021).
# Gebruik: python3 tools/logopakket.py   → docs/merk/logopakket/{svg,png}
import os, re, glob
import numpy as np
from PIL import Image, ImageDraw, ImageChops

ROOT = os.path.join(os.path.dirname(__file__), '..')
UIT = os.path.join(ROOT, 'docs/merk/logopakket')
# kleurverlopen van het originele logo (gemeten uit assets/logo-oud/ok-timmerwerken-origineel.png), in de eigen
# coördinaten van icoon (444x418) en woord (862x74) — dezelfde als op de site (preview/d-lijn.html)
VERLOOP = {
    'huis': ((0, 0, 444, 0), [(0, '#f3d88e'), (.5, '#eacf85'), (1, '#c7ab60')]),
    'ok': ((50, 0, 390, 0), [(0, '#efd48a'), (.6, '#c1a35c'), (1, '#b69852')]),
    'poot': ((330, 300, 392, 380), [(0, '#dcdadb'), (1, '#bdbcbc')]),
    'woord': ((0, 0, 862, 0), [(0, '#d4d1d2'), (1, '#bdbdbd')]),
}
Z, W = '#14130f', '#ffffff'
# per kleurvariant: kleur of verloop per onderdeel (huis, o+K, poot van de K, woord)
KLEUREN = {
    'zwart': dict(huis=Z, ok=Z, poot=Z, woord=Z),
    'wit': dict(huis=W, ok=W, poot=W, woord=W),
    'goud': dict(huis='huis', ok='ok', poot='poot', woord='woord'),      # op donker: goud met zilver, zoals het origineel
    'goud-zwart': dict(huis='huis', ok='ok', poot=Z, woord=Z),           # op licht: goud, poot en woord zwart
}
NAAM_WOORDMERK = {'goud': 'zilver'}   # het woordmerk heeft geen goud: de 'goud'-variant is zilver, 'goud-zwart' = zwart

def pad_uit(bestand):
    s = open(os.path.join(ROOT, bestand)).read()
    return re.search(r' d="([^"]+)"', s).group(1)

ICOON, WOORD = pad_uit('assets/logo-oud/ok-timmerwerken-icoon.svg'), pad_uit('assets/logo-oud/ok-timmerwerken-woord.svg')
_d = [x.strip() for x in re.split(r'(?=M)', ICOON) if x.strip()]
assert len(_d) == 4, 'icoon heeft 4 subpaden: huis, o, o-binnen + K-schuin, K-poot'
DELEN = [('huis', _d[0]), ('ok', ' '.join(_d[1:3])), ('poot', _d[3])]   # onderdelen van het icoon
IW, IH, WW, WH = 444, 418, 862, 74

icoon = lambda x, y, s: [(rol, d, x, y, s) for rol, d in DELEN]

# opbouw per variant: lijst van (pad, x, y, schaal) en de totale maat
def staand():
    s = 0.62                                   # icoon iets kleiner dan de woordbreedte, zoals in de footer
    iw, ih = IW * s, IH * s
    gap = 52
    return icoon((WW - iw) / 2, 0, s) + [('woord', WOORD, 0, ih + gap, 1)], WW, ih + gap + WH
def liggend():
    wh = IH * 0.33                             # woordhoogte = 1/3 van het icoon (zoals de menubalk)
    s = wh / WH
    gap = IH * 0.30
    return icoon(0, 0, 1) + [('woord', WOORD, IW + gap, (IH - wh) / 2, s)], IW + gap + WW * s, IH
def beeldmerk():
    return icoon(0, 0, 1), IW, IH
def woordmerk():
    return [('woord', WOORD, 0, 0, 1)], WW, WH

VARIANTEN = {'staand': staand, 'liggend': liggend, 'beeldmerk': beeldmerk, 'woordmerk': woordmerk}

def svg(onderdelen, w, h, kleuren, marge=0, achtergrond=None, rond=0):
    W, H = w + 2 * marge, h + 2 * marge
    bg = f'<rect width="{W:g}" height="{H:g}" rx="{rond:g}" fill="{achtergrond}"/>' if achtergrond else ''
    gebruikt = sorted({kleuren[r] for r, *_ in onderdelen if not kleuren[r].startswith('#')})
    defs = ''.join(f'<linearGradient id="g-{v}" gradientUnits="userSpaceOnUse" x1="{VERLOOP[v][0][0]}" y1="{VERLOOP[v][0][1]}" x2="{VERLOOP[v][0][2]}" y2="{VERLOOP[v][0][3]}">'
                   + ''.join(f'<stop offset="{o:g}" stop-color="{c}"/>' for o, c in VERLOOP[v][1]) + '</linearGradient>' for v in gebruikt)
    vul = lambda r: kleuren[r] if kleuren[r].startswith('#') else f'url(#g-{kleuren[r]})'
    delen = ''.join(f'<path fill="{vul(r)}" transform="translate({x + marge:.2f} {y + marge:.2f}) scale({sc:.5f})" d="{d}"/>' for r, d, x, y, sc in onderdelen)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}">{"<defs>" + defs + "</defs>" if defs else ""}{bg}{delen}</svg>\n'

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

def hexrgb(k): return tuple(int(k[i:i + 2], 16) for i in (1, 3, 5))

def vulling(kleur, x, y, s, sc, marge, maat):
    # effen kleur, of een lineair verloop in de eigen coördinaten van het onderdeel (net als in de SVG)
    if kleur.startswith('#'): return Image.new('RGB', maat, hexrgb(kleur))
    (x1, y1, x2, y2), stops = VERLOOP[kleur]
    px = lambda gx, gy: ((x + marge + gx * s) * sc, (y + marge + gy * s) * sc)
    (ax, ay), (bx, by) = px(x1, y1), px(x2, y2)
    yy, xx = np.mgrid[0:maat[1], 0:maat[0]].astype(np.float32) + .5
    dx, dy = bx - ax, by - ay
    t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    os_, cs = [o for o, _ in stops], np.array([hexrgb(c) for _, c in stops], dtype=np.float32)
    rgb = np.stack([np.interp(t, os_, cs[:, i]) for i in range(3)], axis=-1)
    return Image.fromarray(rgb.round().astype(np.uint8))

def png(onderdelen, w, h, kleuren, breedte, marge=0, achtergrond=None, rond=0):
    sc = breedte / (w + 2 * marge)
    beeld = None
    for r, d, x, y, s in onderdelen:
        m = masker([(d, x, y, s)], w, h, breedte, marge)
        laag = vulling(kleuren[r], x, y, s, sc, marge, m.size).convert('RGBA'); laag.putalpha(m)
        if beeld is None: beeld = Image.new('RGBA', m.size, (0, 0, 0, 0))
        beeld.alpha_composite(laag)
    if not achtergrond: return beeld
    bg = Image.new('RGBA', beeld.size, (0, 0, 0, 0))
    r = round(rond * beeld.size[0] / (w + 2 * marge))
    ImageDraw.Draw(bg).rounded_rectangle((0, 0, beeld.size[0] - 1, beeld.size[1] - 1), radius=r, fill=hexrgb(achtergrond) + (255,))
    bg.alpha_composite(beeld); return bg

if __name__ == '__main__':
    for sub in ('svg', 'png', 'favicon'):
        os.makedirs(os.path.join(UIT, sub), exist_ok=True)
    for oud in glob.glob(os.path.join(UIT, '*', 'ok-timmerwerken-*-brons*')):   # brons is vervangen door goud
        os.remove(oud)
    teller = 0
    for naam, maak in VARIANTEN.items():
        onderdelen, w, h = maak()
        for kl, kleuren in KLEUREN.items():
            if naam == 'woordmerk' and kl == 'goud-zwart': continue      # gelijk aan zwart
            kn = NAAM_WOORDMERK.get(kl, kl) if naam == 'woordmerk' else kl
            open(os.path.join(UIT, 'svg', f'ok-timmerwerken-{naam}-{kn}.svg'), 'w').write(svg(onderdelen, w, h, kleuren)); teller += 1
            for br in (2000, 600):
                png(onderdelen, w, h, kleuren, br).save(os.path.join(UIT, 'png', f'ok-timmerwerken-{naam}-{kn}-{br}.png'), optimize=True); teller += 1
    # favicon / app-icoon: beeldmerk in goud op een donker vierkant (en goud met zwart op licht)
    onderdelen, w, h = beeldmerk()
    marge = (w * 1.36 - w) / 2; extra_h = (w - h) / 2   # vierkant maken
    vk = [(r, d, x, y + extra_h, s) for r, d, x, y, s in onderdelen]
    open(os.path.join(UIT, 'favicon', 'favicon.svg'), 'w').write(svg(vk, w, w, KLEUREN['goud'], marge, '#14130f', rond=w * 0.22)); teller += 1
    for maat in (32, 180, 192, 512):
        png(vk, w, w, KLEUREN['goud'], maat, marge, '#14130f', rond=w * 0.22).save(os.path.join(UIT, 'favicon', f'favicon-{maat}.png'), optimize=True); teller += 1
    png(vk, w, w, KLEUREN['goud-zwart'], 512, marge, '#f4f1ec', rond=w * 0.22).save(os.path.join(UIT, 'favicon', 'app-icoon-licht-512.png'), optimize=True); teller += 1
    # iconen van de website zelf (assets/icon): tabblad rond, telefoon-startscherm en Google vierkant (iOS rondt zelf af)
    IC = os.path.join(ROOT, 'assets/icon')
    open(os.path.join(IC, 'favicon.svg'), 'w').write(svg(vk, w, w, KLEUREN['goud'], marge, '#14130f', rond=w * 0.22))
    png(vk, w, w, KLEUREN['goud'], 32, marge, '#14130f', rond=w * 0.22).save(os.path.join(IC, 'favicon-32.png'), optimize=True)
    png(vk, w, w, KLEUREN['goud'], 180, marge, '#14130f').save(os.path.join(IC, 'apple-touch-icon.png'), optimize=True)
    png(vk, w, w, KLEUREN['goud'], 512, marge, '#14130f').save(os.path.join(IC, 'icon-512.png'), optimize=True)
    teller += 4
    print(f'{teller} bestanden in {os.path.relpath(UIT, ROOT)}')
