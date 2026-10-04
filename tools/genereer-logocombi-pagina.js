// Schrijft preview/logo-combi.html uit tools/logo-combi.js.
// Bewerk nooit de HTML; bewerk de maatvoering en draai dit opnieuw.

const fs = require('fs');
const path = require('path');
const m = require('./logo-combi.js');

const merk = `<svg viewBox="0 0 ${m.BREED} ${m.HOOG}" role="img" aria-label="OK Timmerwerken">${m.beeldmerk}</svg>`;
const fav = `<svg viewBox="0 0 ${m.BREED} ${m.HOOG}" role="img" aria-label="OK Timmerwerken">${m.favicon}</svg>`;

const maten = [96, 64, 48, 32, 24, 16];
const ladder = (svg) => maten.map((p) =>
  `<figure class="trap"><div class="doos" style="width:${Math.round(p * m.BREED / m.HOOG)}px">${svg}</div><figcaption>${p} px</figcaption></figure>`
).join('\n      ');

const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OK Timmerwerken — het nieuwe beeldmerk</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --vlak:#000; --inkt:#fff; --kaart:#202020; --zacht:#999; --rand:#333;
  --f:'Inter',system-ui,sans-serif; --serif:'Instrument Serif',Georgia,serif;
}
.licht{ --vlak:#f5f5f0; --inkt:#12110f; --kaart:#fff; --zacht:#6b6762; --rand:#e3e1d9; }
body{background:#000;color:#fff;font-family:var(--f);font-weight:400;
  -webkit-font-smoothing:antialiased}
section{background:var(--vlak);color:var(--inkt);padding-top:88px;padding-bottom:88px}
.wrap{max-width:1080px;margin:0 auto;padding-left:28px;padding-right:28px}
h2{font-size:clamp(28px,4vw,42px);font-weight:300;letter-spacing:-.02em;margin-bottom:10px}
h2 em{font-family:var(--serif);font-style:italic}
p.lead{color:var(--zacht);max-width:62ch;font-weight:300;line-height:1.6;margin-bottom:40px}
h3{font-size:13px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;
  color:var(--zacht);margin-bottom:20px}

/* Het beeldmerk erft gewoon de tekstkleur van zijn omgeving. */
svg{display:block;width:100%;height:auto;color:inherit}

.duo{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:56px}
.paneel{border-radius:10px;padding:56px 40px;display:flex;align-items:center;
  justify-content:center;min-height:300px}
.paneel span{display:block;width:170px}
.op-zwart{background:#000;color:#fff;border:1px solid var(--rand)}
.op-creme{background:#f5f5f0;color:#12110f}

.rij{display:flex;align-items:flex-end;gap:36px;flex-wrap:wrap;margin-bottom:56px}
.trap{text-align:center}
.doos{margin:0 auto 10px}
figcaption{font-size:11px;color:var(--zacht);letter-spacing:.08em}

.naast{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center;
  border:1px solid var(--rand);border-radius:10px;overflow:hidden;margin-bottom:56px}
.naast > div{padding:48px 40px;text-align:center}
.naast img{width:100%;max-width:260px;height:auto}
.naast .nieuw{background:var(--kaart)}
.naast b{display:block;font-size:11px;font-weight:500;letter-spacing:.12em;
  text-transform:uppercase;color:var(--zacht);margin-top:24px}

/* Horizontale opmaak, zoals in de navigatiebalk en de mailhandtekening. */
.lockup-h{display:inline-flex;align-items:center;gap:14px}
.lockup-h .mark{width:34px;flex:none}
.woord{font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  font-size:15px;line-height:1;white-space:nowrap}
.woord i{font-style:normal;font-weight:300;color:var(--zacht)}

.lockup-v{display:inline-flex;flex-direction:column;align-items:center;gap:18px}
.lockup-v .mark{width:132px}
.lockup-v .woord{font-size:22px;letter-spacing:.22em}

nav.balk a{color:inherit;text-decoration:none}
nav.balk{display:flex;align-items:center;justify-content:space-between;
  border:1px solid var(--rand);border-radius:10px;padding:16px 22px;margin-bottom:24px}
nav.balk ul{display:flex;gap:26px;list-style:none;font-size:14px;font-weight:300}
nav.balk .knop{border-radius:9999px;padding:9px 18px;font-size:13px;font-weight:500;
  background:var(--inkt);color:var(--vlak)}
@media(max-width:720px){
  .duo,.naast{grid-template-columns:1fr}
  nav.balk ul{display:none}
}

ul.punten{list-style:none;display:grid;gap:14px;max-width:72ch}
ul.punten li{padding-left:26px;position:relative;font-weight:300;line-height:1.6;
  color:var(--zacht)}
ul.punten li::before{content:'';position:absolute;left:0;top:10px;width:12px;
  height:1px;background:currentColor}
ul.punten b{color:var(--inkt);font-weight:500}
</style>
</head>
<body>

<section>
  <div class="wrap">
    <h2>Het nieuwe <em>beeldmerk</em></h2>
    <p class="lead">De gevel van het huidige logo, opnieuw getekend als vector, met een O en
    een K die eindelijk leesbaar zijn. Dakhelling, breedte en lijndikte zijn opgemeten aan het
    origineel en letterlijk overgenomen: 30 graden, verhouding 100 bij 94, lijn van 7 procent.
    Eén lijndikte in de hele tekening, en geen enkele kleur — dezelfde tekening is de zwarte
    en de witte versie.</p>

    <div class="duo">
      <div class="paneel op-zwart"><span>${merk}</span></div>
      <div class="paneel op-creme"><span>${merk}</span></div>
    </div>

    <h3>Naast het huidige logo</h3>
    <div class="naast">
      <div><img src="../assets/logo-oud/ok-timmerwerken-wit.png" alt="Het huidige logo in wit">
        <b>Nu — pixels, k zonder stam</b></div>
      <div class="nieuw"><div style="max-width:200px;margin:0 auto">${merk}</div>
        <b>Nieuw — vector, leesbare OK</b></div>
    </div>
  </div>
</section>

<section class="licht">
  <div class="wrap">
    <h2>Hoe klein kan het <em>nog</em>?</h2>
    <p class="lead">De echte toets voor een beeldmerk. Het volledige merk blijft tot ongeveer
    24 pixels overeind; daaronder lopen de letters dicht. Voor het favicon en de app-tegel is
    er daarom een vereenvoudiging: alleen het silhouet, fors dikker.</p>

    <h3>Volledig beeldmerk</h3>
    <div class="rij">
      ${ladder(merk)}
    </div>

    <h3>Vereenvoudigd, voor favicon en app-tegel</h3>
    <div class="rij">
      ${ladder(fav)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>In <em>gebruik</em></h2>
    <p class="lead">Het woordmerk staat in Inter, hetzelfde lettertype als de site. Dat scheelt
    een tweede lettertype en houdt het geheel één geluid.</p>

    <h3>Navigatiebalk</h3>
    <nav class="balk">
      <a class="lockup-h" href="#"><span class="mark">${merk}</span>
        <span class="woord">OK <i>Timmerwerken</i></span></a>
      <ul><li>Diensten</li><li>Over ons</li><li>Contact</li></ul>
      <span class="knop">WhatsApp</span>
    </nav>
  </div>
</section>

<section class="licht">
  <div class="wrap">
    <h3>Staand, zoals het origineel</h3>
    <div style="text-align:center;padding:56px 0">
      <span class="lockup-v"><span class="mark">${merk}</span>
        <span class="woord">Timmerwerken</span></span>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>Wat dit <em>oplost</em></h2>
    <ul class="punten">
      <li><b>Het is nu vector.</b> Oneindig schaalbaar, dus bruikbaar op een bedrijfsbus, een
      bouwbord en een gevelletter. Het huidige logo is een PNG van 894 pixels breed.</li>
      <li><b>De OK is leesbaar.</b> De K heeft een stam. In het huidige logo deelt de K zijn
      stam met de O, waardoor er eerder OA dan OK staat.</li>
      <li><b>Eén kleur, één dikte.</b> Geen verlopen meer. Daarmee werkt het in borduurwerk op
      werkkleding, in gravure, in zeefdruk en in een stempel op nat beton.</li>
      <li><b>De gevel blijft.</b> Bestaande klanten herkennen het teken: dezelfde open vorm,
      dezelfde dakhelling, dezelfde verhouding.</li>
    </ul>
  </div>
</section>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'preview', 'logo-combi.html'), html);
console.log('preview/logo-combi.html geschreven');
