// Genereert assets/logo/*.svg en preview/logo.html uit tools/logo-concepten.js
const fs = require('fs');
const concepten = require('./logo-concepten.js');

const MESSING = '#b08d4f';

// ---------- losse SVG-bestanden ----------
fs.mkdirSync('assets/logo', { recursive: true });
for (const c of concepten) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${c.viewBox}" role="img" aria-label="OK Timmerwerken">
  <title>OK Timmerwerken — beeldmerk ${c.naam}</title>
  ${c.svg.trim()}
</svg>
`;
  fs.writeFileSync(`assets/logo/${c.id}.svg`, svg);
}
console.log(`${concepten.length} SVG-bestanden geschreven naar assets/logo/`);

// ---------- hulpjes ----------
const maat = (c, h) => {
  const [, , vb, vh] = c.viewBox.split(/\s+/).map(Number);
  return { w: Math.round(h * (vb / vh)), h };
};
const merk = (c, h, extra = '') => {
  const { w } = maat(c, h);
  return `<svg class="merk" width="${w}" height="${h}" viewBox="${c.viewBox}" ${extra} aria-hidden="true"><use href="#merk-${c.id}"/></svg>`;
};
const woord = (kleur, px) =>
  `<span class="woord ${kleur}" style="font-size:${px}px">OK <span class="dun">Timmerwerken</span></span>`;

// ---------- previewpagina ----------
const symbolen = concepten
  .map((c) => `  <symbol id="merk-${c.id}" viewBox="${c.viewBox}">${c.svg}</symbol>`)
  .join('\n');

const overzicht = concepten
  .map((c, i) => `      <figure class="tegel">
        ${merk(c, 56)}
        <figcaption><b>${i + 1}. ${c.naam}</b></figcaption>
      </figure>`)
  .join('\n');

const secties = concepten
  .map((c, i) => `
  <section class="concept">
    <div class="kop"><span class="nr">CONCEPT ${i + 1}</span><h2>${c.naam}</h2></div>
    <p class="idee">${c.idee}</p>
    <dl class="weging">
      <div><dt>Sterk</dt><dd>${c.sterk}</dd></div>
      <div><dt>Let op</dt><dd>${c.zwak}</dd></div>
    </dl>

    <div class="proeven">
      <div class="proef donker"><div class="mid">
        <div class="lockup gestapeld">${merk(c, 104)}${woord('op-donker', 19)}</div>
        <span class="bijschrift">op zwart</span></div></div>
      <div class="proef licht"><div class="mid">
        <div class="lockup gestapeld">${merk(c, 104)}${woord('op-licht', 19)}</div>
        <span class="bijschrift">op crème</span></div></div>
    </div>

    <div class="klein">
      <figure>${merk(c, 64, 'style="color:#fff"')}<figcaption>64px, één kleur</figcaption></figure>
      <figure>${merk(c, 32, 'style="color:#fff"')}<figcaption>32px</figcaption></figure>
      <figure>${merk(c, 16, 'style="color:#fff"')}<figcaption>16px (favicon)</figcaption></figure>
      <figure class="rond">${merk(c, 40, 'style="color:#fff"')}<figcaption>profielfoto</figcaption></figure>
    </div>

    <div class="balk">
      <div class="lockup">${merk(c, 28)}${woord('op-donker', 14)}</div>
      <nav><span>Diensten</span><span>Werkwijze</span><span>Reviews</span><span>Over ons</span></nav>
      <span class="knop">Vraag advies aan</span>
    </div>
  </section>`)
  .join('\n');

const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OK Timmerwerken — logoconcepten</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --zwart:#000; --creme:#f5f5f0; --houtskool:#202020; --grafiet:#333;
  --messing:${MESSING}; --rook:#999;
  --accent:var(--messing);
  --f:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif;
}
body.kleurloos{--accent:var(--creme)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--zwart);color:#fff;font-family:var(--f);line-height:1.5;
  -webkit-font-smoothing:antialiased;padding:48px 24px 120px}
.wrap{max-width:1100px;margin:0 auto}
h1{font-weight:300;font-size:clamp(28px,4.5vw,44px);letter-spacing:-.025em;line-height:1.05}
.intro{color:rgba(255,255,255,.7);max-width:64ch;margin-top:16px;font-size:17px}
a{color:inherit}

.schakelaar{display:inline-flex;gap:4px;background:var(--houtskool);border-radius:999px;
  padding:4px;margin-top:32px}
.schakelaar button{border:0;background:transparent;color:rgba(255,255,255,.7);font:inherit;
  font-size:14px;font-weight:500;padding:9px 18px;border-radius:999px;cursor:pointer;transition:.2s}
.schakelaar button[aria-pressed="true"]{background:var(--accent);color:#000}

/* het merk */
.merk{display:block;flex:none;color:var(--accent)}
.lockup{display:flex;align-items:center;gap:14px}
.lockup.gestapeld{flex-direction:column;gap:14px}
.woord{font-weight:500;letter-spacing:.17em;text-transform:uppercase;white-space:nowrap;line-height:1}
.woord .dun{font-weight:300}
.op-licht{color:#12110f}.op-donker{color:#fff}

/* overzicht */
.overzicht{margin-top:40px;background:var(--houtskool);border-radius:12px;padding:32px;
  display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
@media(max-width:780px){.overzicht{grid-template-columns:repeat(2,1fr)}}
.tegel{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.tegel figcaption{font-size:12px;color:var(--rook);letter-spacing:.04em}
.tegel b{color:#fff;font-weight:500}

/* concepten */
.concept{margin-top:72px;border-top:1px solid var(--grafiet);padding-top:32px}
.kop{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:10px}
.kop h2{font-weight:400;font-size:26px;letter-spacing:-.015em}
.kop .nr{font-size:13px;font-weight:500;letter-spacing:.16em;color:var(--rook)}
.idee{color:rgba(255,255,255,.72);max-width:70ch;font-size:16px}
.weging{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;font-size:15px}
@media(max-width:700px){.weging{grid-template-columns:1fr;gap:12px}}
.weging dt{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--rook);margin-bottom:5px}
.weging dd{color:rgba(255,255,255,.78)}

.proeven{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:28px}
@media(max-width:800px){.proeven{grid-template-columns:1fr}}
.proef{border-radius:10px;padding:40px 32px;display:grid;place-items:center;min-height:230px}
.proef.donker{background:var(--houtskool)}
.proef.licht{background:var(--creme)}
.proef.wit{background:#fff}
.mid{text-align:center}
.bijschrift{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--rook);
  margin-top:14px;display:block}

.klein{display:flex;gap:32px;align-items:flex-end;flex-wrap:wrap;margin-top:16px;
  background:var(--houtskool);border-radius:10px;padding:28px 32px}
.klein figure{text-align:center}
.klein figcaption{font-size:11px;color:var(--rook);margin-top:10px;letter-spacing:.05em}
.klein .rond .merk{background:#000;border-radius:50%;padding:14px;box-sizing:content-box}

.balk{margin-top:16px;background:#000;border:1px solid var(--grafiet);border-radius:10px;
  padding:16px 22px;display:flex;align-items:center;gap:28px}
.balk nav{display:flex;gap:22px;margin-left:auto;font-size:14px;font-weight:500;color:rgba(255,255,255,.8)}
.balk .knop{background:var(--creme);color:#000;border-radius:999px;padding:10px 18px;
  font-size:14px;font-weight:500}
@media(max-width:760px){.balk nav{display:none}}

/* woordmerk-concept */
.woordmerk-proef{display:grid;place-items:center;min-height:230px}
.wm{text-align:center}
.wm .regel{font-weight:500;letter-spacing:.3em;text-transform:uppercase;line-height:1}
.wm .sub{font-weight:300;letter-spacing:.3em;text-transform:uppercase;font-size:12px;
  margin-top:14px;color:var(--rook)}
.wm hr{border:0;border-top:1px solid currentColor;opacity:.35;margin:16px auto 0;width:100%}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
${symbolen}
</defs></svg>

<div class="wrap">
  <h1>Logoconcepten</h1>
  <p class="intro">Acht richtingen, allemaal vectorvormen zonder verlopen, getekend om ook op
    16 pixels en in één kleur te werken — precies wat het huidige logo niet kan. Bovenaan staan
    ze naast elkaar; daaronder elk concept in zijn gebruikscontexten, met waar het sterk in is en
    waar je op moet letten. De letters in het woordmerk worden in het eindpakket omgezet naar
    vormen, zodat er geen lettertype meer nodig is.</p>

  <div class="schakelaar" role="group" aria-label="Kleurvariant">
    <button id="k-messing" aria-pressed="true">Messing accent</button>
    <button id="k-kleurloos" aria-pressed="false">Kleurloos</button>
  </div>

  <div class="overzicht">
${overzicht}
      <figure class="tegel">
        <span class="woord op-donker" style="font-size:13px;letter-spacing:.26em">OK</span>
        <figcaption><b>8. Woordmerk</b></figcaption>
      </figure>
  </div>
${secties}

  <!-- ══ concept 8: alleen typografie ══ -->
  <section class="concept">
    <div class="kop"><span class="nr">CONCEPT 8</span><h2>Woordmerk</h2></div>
    <p class="idee">Helemaal geen beeldmerk. Alleen de naam, ruim gespatieerd tussen twee
      haarlijnen — zoals een stempel op een bouwtekening. Dit is wat de referentiesites die je
      koos (Sequel, Custo) zelf doen: de naam ís het logo.</p>
    <dl class="weging">
      <div><dt>Sterk</dt><dd>Nooit onleesbaar, nooit te klein, en past naadloos bij het gekozen
        ontwerp. Niets om verkeerd te interpreteren.</dd></div>
      <div><dt>Let op</dt><dd>Geen teken voor social, bus of werkkleding. In de praktijk wil je
        er altijd nog een klein beeldmerk naast — dat zou dan een van de zeven hierboven worden.</dd></div>
    </dl>
    <div class="proeven">
      <div class="proef donker woordmerk-proef"><div class="wm op-donker">
        <div class="regel" style="font-size:26px;color:var(--accent)">OK Timmerwerken</div>
        <hr><div class="sub">Timmer- en betonwerk · Gorinchem</div>
      </div></div>
      <div class="proef licht woordmerk-proef"><div class="wm op-licht">
        <div class="regel" style="font-size:26px">OK Timmerwerken</div>
        <hr><div class="sub">Timmer- en betonwerk · Gorinchem</div>
      </div></div>
    </div>
    <div class="balk">
      <span class="woord op-donker" style="font-size:14px">OK Timmerwerken</span>
      <nav><span>Diensten</span><span>Werkwijze</span><span>Reviews</span><span>Over ons</span></nav>
      <span class="knop">Vraag advies aan</span>
    </div>
  </section>

  <!-- ══ ter vergelijking ══ -->
  <section class="concept">
    <div class="kop"><span class="nr">TER VERGELIJKING</span><h2>Het huidige logo</h2></div>
    <p class="idee">Dezelfde formaten, zodat de verschillen zichtbaar worden. Let op wat er op
      32 en 16 pixels overblijft, dat het grijze woordmerk op zwart wegvalt, en dat er in de
      woordregel geen "OK" staat.</p>
    <div class="proeven">
      <div class="proef wit"><div class="mid">
        <img src="../assets/logo-oud/ok-timmerwerken-origineel.png" alt="Huidige logo van OK Timmerwerken" style="height:120px">
        <span class="bijschrift">origineel, op wit</span></div></div>
      <div class="proef donker"><div class="mid">
        <img src="../assets/logo-oud/ok-timmerwerken-origineel.png" alt="" style="height:120px">
        <span class="bijschrift">origineel, op zwart — het woordmerk valt weg</span></div></div>
    </div>
    <div class="klein">
      <figure><img src="../assets/logo-oud/ok-timmerwerken-origineel.png" alt="" style="height:64px"><figcaption>64px</figcaption></figure>
      <figure><img src="../assets/logo-oud/ok-timmerwerken-origineel.png" alt="" style="height:32px"><figcaption>32px</figcaption></figure>
      <figure><img src="../assets/logo-oud/ok-timmerwerken-origineel.png" alt="" style="height:16px"><figcaption>16px</figcaption></figure>
    </div>
  </section>

  <section class="concept">
    <div class="kop"><span class="nr">DAARNA</span><h2>Wat het pakket wordt</h2></div>
    <p class="idee">Zodra er een richting gekozen is, lever ik: beeldmerk, woordmerk en combinatie
      als SVG en PNG (transparant, meerdere maten) · liggende, staande en vierkante opmaak ·
      eenkleurvarianten zwart en wit voor borduren, graveren en zeefdruk · favicon-set ·
      profielfoto en omslagbanner voor social · een HTML-mailhandtekening · en een briefpapier-
      en offertekop. Plus een korte huisstijlpagina met kleuren, lettertype, minimumformaten en
      witruimteregels.</p>
  </section>
</div>

<script>
var mes = document.getElementById('k-messing'), kl = document.getElementById('k-kleurloos');
function zet(kleurloos){
  document.body.classList.toggle('kleurloos', kleurloos);
  mes.setAttribute('aria-pressed', String(!kleurloos));
  kl.setAttribute('aria-pressed', String(kleurloos));
}
mes.addEventListener('click', function(){ zet(false); });
kl.addEventListener('click', function(){ zet(true); });
</script>
</body>
</html>
`;

fs.writeFileSync('preview/logo.html', html);
console.log(`preview/logo.html geschreven — ${concepten.length + 1} concepten, ${html.split('\n').length} regels`);
