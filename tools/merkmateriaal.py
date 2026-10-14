# Merkmateriaal OK Timmerwerken in de stijl van de website: kaart (bord/bus/flyer), social-set en mailhandtekening.
# Maakt HTML-bronnen in docs/merk/logopakket/_bron/ en zet ze met tools/schiet.swift om naar PNG.
# Gebruik: python3 tools/merkmateriaal.py <pad-naar-schiet-programma>
import os, re, sys, subprocess, http.server, threading, functools, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PAK = os.path.join(ROOT, 'docs/merk/logopakket')
BRON = os.path.join(PAK, '_bron')
SCHIET = sys.argv[1]
os.makedirs(BRON, exist_ok=True)
for sub in ('kaart', 'social', 'mailhandtekening'): os.makedirs(os.path.join(PAK, sub), exist_ok=True)

site = open(os.path.join(ROOT, 'preview/d-lijn.html')).read()
symbool = lambda k: re.search(r'<symbol id="%s"[^>]*>.*?</symbol>' % k, site, re.S).group(0)
ICONEN = ''.join(symbool(k) for k in ['i-truweel', 'i-isolatie', 'i-potlood', 'i-dakraam', 'i-hamer', 'i-fundering', 'i-kwast', 'i-plattegrond', 'i-whatsapp'])
ICONEN += ('<symbol id="i-tel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></symbol>'
           '<symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></symbol>'
           '<symbol id="i-web" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.8 5.7 3.8 9s-1.2 6.3-3.8 9c-2.6-2.7-3.8-5.7-3.8-9S9.4 5.7 12 3z"/></symbol>')
SPRITE = f'<svg width="0" height="0" style="position:absolute" aria-hidden="true">{ICONEN}</svg>'
logo = lambda variant, kleur: f'../svg/ok-timmerwerken-{variant}-{kleur}.svg'

DIENSTEN = [('i-truweel', 'Betonvloeren'), ('i-isolatie', 'Vliering &amp; zolder'), ('i-potlood', 'Carport &amp; overkapping'), ('i-dakraam', 'Dakramen (VELUX)'),
            ('i-hamer', 'Timmerwerk &amp; afbouw'), ('i-fundering', 'Funderingen'), ('i-kwast', 'Onderhoud &amp; renovatie'), ('i-plattegrond', 'Nieuwbouw')]

BASIS = '''
@font-face{font-family:Inter;src:url(../../../../assets/fonts/inter-latin.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(../../../../assets/fonts/instrument-serif-italic-latin.woff2) format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:VW;height:VH;overflow:hidden}
body{font-family:Inter,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400}
'''

def kaart(thema):
    d = thema == 'donker'
    ink, bg, zacht, lijn, logo_kl = ('#ffffff', '#14130f', '#b9b4aa', 'rgba(255,255,255,.14)', 'wit') if d else ('#14130f', '#f6f3ee', '#6b6762', '#ddd6cb', 'zwart')
    rijen = ''.join(f'<li><span class="ic"><svg><use href="#{i}"/></svg></span>{t}</li>' for i, t in DIENSTEN)
    return f'''<!doctype html><meta charset="utf-8"><style>{BASIS.replace('VW','1800px').replace('VH','1200px')}
body{{background:{bg};color:{ink};position:relative}}
.lijnen{{position:absolute;inset:0;display:grid;grid-template-columns:repeat(2,1fr);pointer-events:none}}
.lijnen i{{border-right:1px solid {lijn}}} .lijnen i:first-child{{border-left:1px solid {lijn}}}
.vlak{{position:absolute;inset:0;padding:110px 120px;display:grid;grid-template-columns:1fr 1fr;gap:110px}}
.links{{display:flex;flex-direction:column}}
.logo{{width:560px}}
.oog{{display:flex;align-items:center;gap:18px;margin:58px 0 16px;font-size:17px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b58a52}}
.oog::after{{content:'';width:120px;height:1px;background:{lijn}}}
h1{{font-size:62px;line-height:1.02;letter-spacing:-.03em;font-weight:700}}
h1 em{{font-size:1.1em}}
.contact{{margin-top:auto;list-style:none}}
.contact li{{display:flex;align-items:center;gap:22px;padding:19px 0;border-top:1px solid {lijn};font-size:34px;font-weight:600;letter-spacing:-.01em}}
.contact li:last-child{{border-bottom:1px solid {lijn}}}
.ic{{width:58px;height:58px;flex:none;border-radius:50%;border:1.5px solid #b58a52;color:#b58a52;display:grid;place-items:center}}
.ic svg{{width:28px;height:28px}}
.rechts{{display:flex;flex-direction:column}}
.kop{{font-size:17px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:{zacht};margin-bottom:10px}}
.diensten{{list-style:none}}
.diensten li{{display:flex;align-items:center;gap:22px;padding:15px 0;border-top:1px solid {lijn};font-size:33px;font-weight:600;letter-spacing:-.015em}}
.diensten li:last-child{{border-bottom:1px solid {lijn}}}
.velux{{margin-top:auto;display:flex;align-items:center;gap:22px;font-size:20px;line-height:1.35;color:{zacht}}}
.velux img{{height:96px;border-radius:8px}}
.velux b{{color:{ink};font-weight:600}}
</style><body>{SPRITE}<div class="lijnen"><i></i><i></i></div>
<div class="vlak"><div class="links"><img class="logo" src="{logo('staand', logo_kl)}" alt="">
<span class="oog">Timmer- en betonwerk · Gorinchem</span><h1>Vakwerk waar u<br>op kunt <em>bouwen</em>.</h1>
<ul class="contact"><li><span class="ic"><svg><use href="#i-web"/></svg></span>www.ok-timmerwerken.nl</li><li><span class="ic"><svg><use href="#i-mail"/></svg></span>info@ok-timmerwerken.nl</li><li><span class="ic"><svg><use href="#i-tel"/></svg></span>06 41 42 91 06</li></ul></div>
<div class="rechts"><span class="kop">Wat we doen</span><ul class="diensten">{rijen}</ul>
<div class="velux"><img src="../../../../assets/velux/velux-montagepartner.jpg" alt=""><img src="../../../../assets/velux/velux-getraind-2025.jpg" alt=""><span><b>Erkend VELUX Montagepartner</b><br>getraind en gecertificeerd door VELUX</span></div></div></div>'''

def profiel():
    return f'''<!doctype html><meta charset="utf-8"><style>{BASIS.replace('VW','540px').replace('VH','540px')}
body{{background:#14130f;display:grid;place-items:center}} img{{width:300px}}</style><body><img src="{logo('beeldmerk','wit')}" alt="">'''

def omslag():
    # Facebook toont op mobiel alleen het midden (± 555 van de 820 breed): kaartje en huis staan daarbinnen
    return f'''<!doctype html><meta charset="utf-8"><style>{BASIS.replace('VW','820px').replace('VH','312px')}
body{{background:#d8cdc2;position:relative}}
.beeld{{position:absolute;right:-34px;top:50%;transform:translateY(-50%);width:650px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 26%)}}
.v{{position:absolute;left:138px;top:50%;transform:translateY(-50%);background:#fff;border-radius:14px;padding:22px 24px;box-shadow:0 18px 40px -24px rgba(20,19,15,.5)}}
.v img{{width:210px;display:block}} .v p{{margin-top:12px;font-size:14px;font-weight:600;color:#14130f}} .v p em{{font-size:1.15em}}
.v small{{display:block;margin-top:5px;font-size:11.5px;line-height:1.45;color:#6b6762}}</style>
<body><img class="beeld" src="../../../../assets/render/hero-wolken.jpg" alt=""><div class="v"><img src="{logo('liggend','zwart')}" alt=""><p>Vakwerk waar u op kunt <em>bouwen</em>.</p><small>Timmer- en betonwerk · Gorinchem<br>06 41 42 91 06 · ok-timmerwerken.nl</small></div>'''

def handtekening_voorbeeld():
    return f'''<!doctype html><meta charset="utf-8"><style>{BASIS.replace('VW','640px').replace('VH','230px')}
body{{background:#fff;padding:28px}}</style><body>{handtekening('../svg/ok-timmerwerken-liggend-zwart.svg')}'''

def handtekening(logo_url):
    # tabelopmaak met inline stijlen: werkt in Outlook / Microsoft 365, Gmail en Apple Mail
    return f'''<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#14130f;font-size:14px;line-height:1.5">
  <tr>
    <td style="padding:0 0 12px 0" colspan="2"><img src="{logo_url}" alt="OK Timmerwerken" width="220" style="display:block;width:220px;height:auto;border:0"></td>
  </tr>
  <tr>
    <td style="border-top:2px solid #b58a52;padding-top:10px;vertical-align:top" colspan="2">
      <div style="font-weight:bold;font-size:15px;color:#14130f">Ozcan</div>
      <div style="color:#6b6762;font-size:13px;padding-bottom:6px">Eigenaar &middot; timmer- en betonwerk &middot; Erkend VELUX Montagepartner</div>
      <div><span style="color:#b58a52;font-weight:bold">T</span>&nbsp; <a href="tel:+31641429106" style="color:#14130f;text-decoration:none">06 41 42 91 06</a> &nbsp;&nbsp;<span style="color:#b58a52;font-weight:bold">WhatsApp</span>&nbsp; <a href="https://wa.me/31641429106" style="color:#14130f;text-decoration:none">stuur een bericht</a></div>
      <div><span style="color:#b58a52;font-weight:bold">E</span>&nbsp; <a href="mailto:info@ok-timmerwerken.nl" style="color:#14130f;text-decoration:none">info@ok-timmerwerken.nl</a> &nbsp;&nbsp;<span style="color:#b58a52;font-weight:bold">W</span>&nbsp; <a href="https://www.ok-timmerwerken.nl" style="color:#14130f;text-decoration:none">www.ok-timmerwerken.nl</a></div>
    </td>
  </tr>
</table>'''

STUKKEN = [('kaart-licht', kaart('licht'), 1800, 1200, 'kaart'), ('kaart-donker', kaart('donker'), 1800, 1200, 'kaart'),
           ('profielfoto-1080', profiel(), 540, 540, 'social'), ('facebook-omslag-1640x624', omslag(), 820, 312, 'social'),
           ('mailhandtekening-voorbeeld', handtekening_voorbeeld(), 640, 230, 'mailhandtekening')]

# kleine webserver vanaf de projectmap, zodat lettertypes en beelden laden
class Stil(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Stil, directory=ROOT)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler); poort = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
for naam, html, w, h, map_ in STUKKEN:
    open(os.path.join(BRON, naam + '.html'), 'w').write(html)
    uit = os.path.join(PAK, map_, naam + '.png')
    subprocess.run([SCHIET, f'http://127.0.0.1:{poort}/docs/merk/logopakket/_bron/{naam}.html', str(w), str(h), uit], check=True, capture_output=True)
    print('ok', os.path.relpath(uit, ROOT))
srv.shutdown()

# mailhandtekening om te plakken: logo vanaf de website (wordt na de livegang www.ok-timmerwerken.nl)
LIVE = 'https://www.ok-timmerwerken.nl/assets/merk/mailhandtekening-logo.png'
os.makedirs(os.path.join(ROOT, 'assets/merk'), exist_ok=True)
shutil.copy(os.path.join(PAK, 'png/ok-timmerwerken-liggend-zwart-600.png'), os.path.join(ROOT, 'assets/merk/mailhandtekening-logo.png'))
open(os.path.join(PAK, 'mailhandtekening', 'mailhandtekening.html'), 'w').write(f'''<!doctype html><meta charset="utf-8"><title>Mailhandtekening OK Timmerwerken</title>
<!-- Selecteer alles hieronder in de browser (Cmd+A), kopieer (Cmd+C) en plak het in het handtekeningveld van Outlook. -->
<body style="margin:24px">
{handtekening(LIVE)}
</body>
''')
print('ok mailhandtekening.html')
