// Schrijft preview/merk.html uit tools/logo-combi.js: de korte merkpagina met
// alle onderdelen, kleuren, minimummaten en vrije ruimte.
// Bewerk nooit de HTML; bewerk de bron of dit script en draai opnieuw.

const fs = require('fs');
const path = require('path');
const m = require('./logo-combi.js');

const svg = (naam, extra = '') => {
  const t = m.tekeningen[naam];
  return `<svg viewBox="0 0 ${t.breed} ${t.hoog}" ${extra} role="img" aria-label="OK Timmerwerken">
${m.naarSvgBinnenkant(t.elementen)}
</svg>`;
};

// Een beeldmerk met de vrije ruimte eromheen getekend: een rand van een halve
// gevelbreedte, de klassieke clear-space-maat. We tekenen het merk in een ruimer
// vlak met een stippelkader.
function metVrijeRuimte() {
  const marge = m.BREED * 0.5;
  const b = m.BREED + marge * 2;
  const h = m.HOOG + marge * 2;
  return `<svg viewBox="0 0 ${b} ${h}" role="img" aria-label="Vrije ruimte rond het beeldmerk">
  <rect x="2" y="2" width="${b - 4}" height="${h - 4}" fill="none" stroke="var(--zacht)" stroke-width="1" stroke-dasharray="6 5"/>
  <rect x="${marge}" y="${marge}" width="${m.BREED}" height="${m.HOOG}" fill="none" stroke="var(--rand)" stroke-width="1"/>
  <g transform="translate(${marge} ${marge})">
${m.naarSvgBinnenkant(m.tekeningen.beeldmerk.elementen)}
  </g>
  <text x="${marge / 2}" y="${h / 2}" fill="var(--zacht)" font-size="18" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">½</text>
</svg>`;
}

const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OK Timmerwerken — merkrichtlijnen</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{ --vlak:#000; --inkt:#fff; --kaart:#202020; --zacht:#8a8a8a; --rand:#333;
  --f:'Inter',system-ui,sans-serif; --serif:'Instrument Serif',Georgia,serif; }
.licht{ --vlak:#f5f5f0; --inkt:#12110f; --kaart:#fff; --zacht:#6b6762; --rand:#e3e1d9; }
body{background:#000;color:#fff;font-family:var(--f);font-weight:400;-webkit-font-smoothing:antialiased}
section{background:var(--vlak);color:var(--inkt);padding:88px 0}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}
h1{font-size:clamp(34px,6vw,60px);font-weight:300;letter-spacing:-.03em;line-height:1.05}
h1 em{font-family:var(--serif);font-style:italic}
.sub{color:var(--zacht);font-weight:300;margin-top:16px;max-width:60ch;line-height:1.6}
h2{font-size:clamp(24px,3.4vw,36px);font-weight:300;letter-spacing:-.02em;margin-bottom:12px}
h2 em{font-family:var(--serif);font-style:italic}
p.lead{color:var(--zacht);max-width:64ch;font-weight:300;line-height:1.65;margin-bottom:40px}
h3{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--zacht);margin-bottom:18px}
svg{display:block;width:100%;height:auto;color:inherit}

.rooster{display:grid;gap:20px}
.k2{grid-template-columns:1fr 1fr}
.k3{grid-template-columns:repeat(3,1fr)}
.kaart{border:1px solid var(--rand);border-radius:10px;padding:40px;display:flex;
  flex-direction:column;gap:22px}
.kaart .vak{flex:1;display:flex;align-items:center;justify-content:center;min-height:150px}
.kaart figcaption{font-size:13px;color:var(--zacht);font-weight:300}
.op-zwart{background:#000}
.op-zwart .inkt{color:#fff}
.op-creme{background:#f5f5f0}
.op-creme .inkt{color:#12110f}

.maatrij{display:flex;align-items:flex-end;gap:40px;flex-wrap:wrap}
.maat{text-align:center}
.maat .doos{margin:0 auto 10px}
.maat figcaption{font-size:11px;color:var(--zacht);letter-spacing:.06em}

.kleur{border:1px solid var(--rand);border-radius:10px;overflow:hidden}
.kleur .staal{height:120px}
.kleur .info{padding:18px 20px}
.kleur b{display:block;font-weight:500;margin-bottom:4px}
.kleur span{color:var(--zacht);font-size:13px;font-family:ui-monospace,monospace}

.goedfout{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.goedfout .kaart{min-height:0}
.badge{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.goed .badge{color:#4caf50}
.fout .badge{color:#d9775f}
ul.doe{list-style:none;display:grid;gap:12px}
ul.doe li{padding-left:24px;position:relative;font-weight:300;line-height:1.55;color:var(--zacht)}
ul.doe li::before{content:'';position:absolute;left:0;top:9px;width:11px;height:1px;background:currentColor}

@media(max-width:720px){ .k2,.k3,.goedfout{grid-template-columns:1fr} }
</style>
</head>
<body>

<section>
  <div class="wrap">
    <h1>OK Timmerwerken<br><em>merkrichtlijnen</em></h1>
    <p class="sub">Eén beeldmerk, één lettertype, één kleur. Deze pagina laat zien welke
    bestanden er zijn en hoe ze gebruikt worden. Alles is afgeleid van één bron, dus elke
    maat klopt met elke andere.</p>
  </div>
</section>

<section class="licht">
  <div class="wrap">
    <h2>De <em>onderdelen</em></h2>
    <p class="lead">Het beeldmerk staat op zichzelf. Daarnaast is er een liggende en een
    staande opmaak met het woordmerk erbij. Het woordmerk is gezet uit Inter SemiBold en
    omgezet naar omtrekken, zodat een drukker geen lettertype hoeft te installeren.</p>
    <div class="rooster k2">
      <figure class="kaart"><div class="vak"><div style="max-width:150px">${svg('beeldmerk')}</div></div>
        <figcaption>Beeldmerk — op zichzelf, voor kleine en vierkante plekken</figcaption></figure>
      <figure class="kaart"><div class="vak"><div style="max-width:150px">${svg('staand')}</div></div>
        <figcaption>Staand — de opbouw van het oorspronkelijke logo</figcaption></figure>
    </div>
    <div class="rooster" style="margin-top:20px">
      <figure class="kaart"><div class="vak"><div style="max-width:440px;width:100%">${svg('liggend')}</div></div>
        <figcaption>Liggend — voor de navigatiebalk, de mailhandtekening en een briefhoofd</figcaption></figure>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>Op licht én <em>donker</em></h2>
    <p class="lead">Omdat de tekening currentColor erft, is er maar één vorm. Op een donkere
    ondergrond wordt die wit, op een lichte zwart. Nooit grijs, nooit met een verloop.</p>
    <div class="rooster k2">
      <figure class="kaart op-zwart"><div class="vak"><div class="inkt" style="max-width:150px">${svg('beeldmerk')}</div></div>
        <figcaption>Wit op zwart</figcaption></figure>
      <figure class="kaart op-creme"><div class="vak"><div class="inkt" style="max-width:150px">${svg('beeldmerk')}</div></div>
        <figcaption>Zwart op crème</figcaption></figure>
    </div>
  </div>
</section>

<section class="licht">
  <div class="wrap">
    <h2>Kleur &amp; <em>typografie</em></h2>
    <div class="rooster k3">
      <div class="kleur"><div class="staal" style="background:#000"></div>
        <div class="info"><b>Zwart</b><span>#000000</span></div></div>
      <div class="kleur"><div class="staal" style="background:#f5f5f0;border-bottom:1px solid #e3e1d9"></div>
        <div class="info"><b>Crème</b><span>#F5F5F0</span></div></div>
      <div class="kleur"><div class="staal" style="background:#12110f"></div>
        <div class="info"><b>Inkt</b><span>#12110F</span></div></div>
    </div>
    <p class="lead" style="margin-top:32px">Woordmerk en alle teksten: <b>Inter</b>. De italic
    serif-accenten op de site: <b>Instrument Serif</b>. Geen messing meer — het merk is bewust
    zwart-wit, zodat het in borduurwerk, gravure, zeefdruk en een betonstempel werkt.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>Hoe klein kan het <em>nog</em>?</h2>
    <p class="lead">Het volledige beeldmerk blijft tot ongeveer 24 pixels overeind. Daaronder
    lopen de letters dicht; daarvoor is er een vereenvoudiging zonder letters, voor het favicon
    en de app-tegel.</p>
    <h3>Volledig beeldmerk</h3>
    <div class="maatrij" style="margin-bottom:48px">
      ${[96, 64, 48, 32, 24].map((p) => `<figure class="maat"><div class="doos" style="width:${Math.round(p * m.BREED / m.HOOG)}px">${svg('beeldmerk')}</div><figcaption>${p} px</figcaption></figure>`).join('\n      ')}
    </div>
    <h3>Vereenvoudigd — favicon en app-tegel</h3>
    <div class="maatrij">
      ${[32, 24, 16].map((p) => `<figure class="maat"><div class="doos" style="width:${p}px">${svg('faviconvierkant')}</div><figcaption>${p} px</figcaption></figure>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="licht">
  <div class="wrap">
    <h2>Vrije <em>ruimte</em></h2>
    <p class="lead">Houd rondom het beeldmerk minstens een halve gevelbreedte vrij van tekst,
    randen of andere logo's. Zo blijft het teken rustig staan.</p>
    <div style="max-width:380px">${metVrijeRuimte()}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>Wel en <em>niet</em></h2>
    <ul class="doe">
      <li>Gebruik alleen de kant-en-klare bestanden uit <b>assets/logo-nieuw</b>.</li>
      <li>Zet het altijd in één kleur: zwart op licht, wit op donker.</li>
      <li>Geef het rondom lucht en laat het nooit tegen een rand plakken.</li>
    </ul>
    <ul class="doe" style="margin-top:24px">
      <li>Rek het niet uit en draai het niet — gebruik de liggende of staande opmaak.</li>
      <li>Zet er geen verloop, schaduw of extra kleur op.</li>
      <li>Teken de letters niet na in een ander lettertype; het woordmerk zit vast in omtrekken.</li>
    </ul>
  </div>
</section>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'preview', 'merk.html'), html);
console.log('preview/merk.html geschreven');
