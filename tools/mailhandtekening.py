# Mailhandtekening OK Timmerwerken in de donkere stijl van de visitekaart (zoals Ozcans voorbeeld), als HTML-tabel
# zodat telefoon, mail en website aanklikbaar blijven. Beelden (logo, icoontjes, VELUX) staan op de website.
# Gebruik: python3 tools/mailhandtekening.py <pad-naar-schiet-programma>
#   → assets/merk/handtekening/*.png (komt online), docs/merk/logopakket/mailhandtekening/mailhandtekening-donker.html
#     en een voorbeeldafbeelding mailhandtekening-donker-voorbeeld.png
import os, re, sys, subprocess, http.server, threading, functools
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SCHIET = sys.argv[1]
BEELD = os.path.join(ROOT, 'assets/merk/handtekening')
UIT = os.path.join(ROOT, 'docs/merk/logopakket/mailhandtekening')
LIVE = 'https://www.ok-timmerwerken.nl/assets/merk/handtekening/'
os.makedirs(BEELD, exist_ok=True)

INKT, BRONS, ZACHT, LIJN = '#14130f', '#b58a52', '#b9b4aa', '#3a352d'
DIENSTEN = [('i-meten', 'Totale renovatie'), ('i-hamer', 'Timmerwerk'), ('i-kwast', 'Onderhoud'), ('i-plattegrond', 'Nieuwbouw'),
            ('i-fundering', 'Funderingen'), ('i-truweel', 'Betonvloeren'), ('i-dakraam', 'Dakramen'), ('i-isolatie', 'Vliering &amp; zolder')]
CONTACT = ['i-web', 'i-mail', 'i-tel']

# ---------- 1. icoontjes: bronzen lijn in een bronzen cirkel, op de donkere achtergrond (2x voor scherpte) ----------
site = open(os.path.join(ROOT, 'preview/d-lijn.html')).read()
symbool = lambda k: re.search(r'<symbol id="%s"[^>]*>.*?</symbol>' % k, site, re.S).group(0)
extra = ('<symbol id="i-tel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></symbol>'
         '<symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></symbol>'
         '<symbol id="i-web" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.8 5.7 3.8 9s-1.2 6.3-3.8 9c-2.6-2.7-3.8-5.7-3.8-9S9.4 5.7 12 3z"/></symbol>')
namen = CONTACT + [k for k, _ in DIENSTEN]
sprite = '<svg width="0" height="0" style="position:absolute">' + ''.join(symbool(k) for k in [k for k, _ in DIENSTEN]) + extra + '</svg>'
C = 64   # cel van 64 px = icoon van 32 px op 2x
vel = f'''<!doctype html><meta charset="utf-8"><style>*{{margin:0;padding:0}}html,body{{background:{INKT};width:{C * len(namen)}px;height:{C}px;overflow:hidden}}
.i{{float:left;width:{C}px;height:{C}px;display:grid;place-items:center}}.i span{{width:{C - 4}px;height:{C - 4}px;border:2.4px solid {BRONS};border-radius:50%;display:grid;place-items:center;color:{BRONS};box-sizing:border-box}}
.i svg{{width:{C // 2}px;height:{C // 2}px;stroke-width:1.7}}.i.d svg{{width:{round(C * .74)}px;height:{round(C * .74)}px;stroke-width:1.45}}</style><body>{sprite}''' + ''.join(f'<div class="i{"" if k in CONTACT else " d"}"><span><svg><use href="#{k}"/></svg></span></div>' for k in namen)
tmp = os.path.join(BEELD, '_vel.html'); open(tmp, 'w').write(vel)

class Stil(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Stil, directory=ROOT)); poort = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = lambda rel: f'http://127.0.0.1:{poort}/{rel}'
png = os.path.join(BEELD, '_vel.png')
subprocess.run([SCHIET, url('assets/merk/handtekening/_vel.html'), str(C * len(namen)), str(C), png], check=True, capture_output=True)
v = Image.open(png).convert('RGB'); s = v.width / (C * len(namen))   # schiet levert retina (2x)
for i, k in enumerate(namen):
    v.crop((round(i * C * s), 0, round((i + 1) * C * s), round(C * s))).resize((48, 48), Image.LANCZOS).save(os.path.join(BEELD, k.replace('i-', 'icoon-') + '.png'), optimize=True)
os.remove(tmp); os.remove(png)

# ---------- 2. logo (wit, staand) en VELUX-keurmerk op maat ----------
logo = Image.open(os.path.join(ROOT, 'docs/merk/logopakket/png/ok-timmerwerken-staand-wit-600.png'))
logo.resize((340, round(logo.height * 340 / logo.width)), Image.LANCZOS).save(os.path.join(BEELD, 'logo-staand-wit.png'), optimize=True)
velux = Image.open(os.path.join(ROOT, 'assets/velux/velux-montagepartner.webp')).convert('RGB')
velux.resize((round(velux.width * 88 / velux.height), 88), Image.LANCZOS).save(os.path.join(BEELD, 'velux-montagepartner.png'), optimize=True)
getraind = Image.open(os.path.join(ROOT, 'assets/velux/velux-getraind-2025.webp')).convert('RGB')
getraind.resize((round(getraind.width * 112 / getraind.height), 112), Image.LANCZOS).save(os.path.join(BEELD, 'velux-getraind-2025.png'), optimize=True)
LW, LH = 170, round(logo.height * 170 / logo.width); VH = 44; VW = round(velux.width * VH / velux.height)
GH = 56; GW = round(getraind.width * GH / getraind.height)   # smalle sticker iets hoger, zodat ze visueel even zwaar zijn (zoals op de site)

# ---------- 3. de handtekening (tabel, inline stijlen; werkt in Outlook, Gmail en Apple Mail) ----------
def handtekening(b):
    f = 'font-family:Arial,Helvetica,sans-serif'
    rij = lambda icoon, inhoud, rand=True: (f'<tr><td width="32" style="padding:7px 8px 7px 0;{"border-bottom:1px solid " + LIJN + ";" if rand else ""}vertical-align:middle">'
        f'<img src="{b}icoon-{icoon}.png" width="24" height="24" alt="" style="display:block;border:0"></td>'
        f'<td style="padding:7px 0;{"border-bottom:1px solid " + LIJN + ";" if rand else ""}{f};font-size:14px;color:#ffffff;vertical-align:middle">{inhoud}</td></tr>')
    a = lambda href, tekst: f'<a href="{href}" style="color:#ffffff;text-decoration:none;font-weight:bold">{tekst}</a>'
    dienst = lambda icoon, naam, rand: (f'<tr><td width="28" style="padding:4px 8px 4px 0;{"border-bottom:1px solid " + LIJN + ";" if rand else ""}vertical-align:middle">'
        f'<img src="{b}icoon-{icoon.replace("i-", "")}.png" width="22" height="22" alt="" style="display:block;border:0"></td>'
        f'<td style="padding:4px 0;{"border-bottom:1px solid " + LIJN + ";" if rand else ""}{f};font-size:13px;font-weight:bold;color:#ffffff;vertical-align:middle;white-space:nowrap">{naam}</td></tr>')
    diensten = ''.join(dienst(k, n, i < len(DIENSTEN) - 1) for i, (k, n) in enumerate(DIENSTEN))
    return f'''<table cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="{INKT}" style="width:600px;background:{INKT};border-radius:12px;{f}">
  <tr>
    <td width="320" style="padding:22px 18px 20px 24px;vertical-align:top">
      <img src="{b}logo-staand-wit.png" width="{LW}" height="{LH}" alt="OK Timmerwerken" style="display:block;border:0;width:{LW}px;height:{LH}px">
      <div style="{f};font-size:16px;font-weight:bold;color:#ffffff;padding:16px 0 1px">Ozcan</div>
      <div style="{f};font-size:12px;color:{ZACHT};padding-bottom:8px">Eigenaar &middot; timmer- en betonwerk</div>
      <table cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid {LIJN}">
        {rij("web", a("https://www.ok-timmerwerken.nl", "www.ok-timmerwerken.nl"))}
        {rij("mail", a("mailto:info@ok-timmerwerken.nl", "info@ok-timmerwerken.nl"))}
        {rij("tel", a("tel:+31641429106", "06 41 42 91 06") + f' &nbsp;<a href="https://wa.me/31641429106" style="color:{BRONS};text-decoration:none;font-size:12px;font-weight:bold">WhatsApp</a>', False)}
      </table>
    </td>
    <td width="256" style="padding:22px 24px 20px 0;vertical-align:top">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">{diensten}</table>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px"><tr>
        <td style="vertical-align:middle;padding-right:10px"><img src="{b}velux-montagepartner.png" width="{VW}" height="{VH}" alt="Erkend VELUX Montagepartner" style="display:block;border:0;border-radius:4px"></td>
        <td style="vertical-align:middle;padding-right:10px"><img src="{b}velux-getraind-2025.png" width="{GW}" height="{GH}" alt="Getraind door VELUX 2025" style="display:block;border:0;border-radius:4px"></td>
        <td style="vertical-align:middle;{f};font-size:11px;line-height:1.35;color:{ZACHT}">Erkend VELUX<br>Montagepartner</td>
      </tr></table>
    </td>
  </tr>
</table>'''

uitleg = '<!-- Open dit bestand in Safari of Chrome, selecteer alles (Cmd+A), kopieer (Cmd+C) en plak het in het handtekeningveld van Outlook. De beelden komen van www.ok-timmerwerken.nl en verschijnen zodra de nieuwe site live staat. -->'
open(os.path.join(UIT, 'mailhandtekening-donker.html'), 'w').write(f'<!doctype html><meta charset="utf-8"><title>Mailhandtekening OK Timmerwerken (donker)</title>\n{uitleg}\n<body style="margin:24px">\n{handtekening(LIVE)}\n</body>\n')
# voorbeeld met de lokale beelden, onder een stukje mailtekst
vb = os.path.join(BEELD, '_voorbeeld.html')
open(vb, 'w').write(f'<!doctype html><meta charset="utf-8"><body style="margin:0;padding:28px;background:#fff;font-family:Arial,sans-serif;font-size:14px;color:#222">'
                    f'<p style="margin:0 0 6px">Beste meneer De Vries,</p><p style="margin:0 0 6px">Hierbij de offerte voor de nieuwe betonvloer. Heeft u vragen, bel of app gerust.</p><p style="margin:0 0 18px">Met vriendelijke groet,</p>{handtekening("")}</body>')
subprocess.run([SCHIET, url('assets/merk/handtekening/_voorbeeld.html'), '660', '520', os.path.join(UIT, 'mailhandtekening-donker-voorbeeld.png')], check=True, capture_output=True)
os.remove(vb); srv.shutdown()
print('klaar:', sorted(os.listdir(BEELD)))
