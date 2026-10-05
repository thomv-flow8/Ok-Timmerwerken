#!/usr/bin/env node
// Genereert de Over-ons-pagina en de zes dienstpagina's in preview/.
// Bron voor de inhoud: docs/inhoud.json. Bron voor de opmaak, navigatie, footer,
// iconen en gedeelde scripts: preview/d-lijn.html (de hoofdpagina) — zo blijft alles
// op één plek en hoeft niets dubbel onderhouden te worden.
// Gebruik: node tools/genereer-paginas.js
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hoofd = fs.readFileSync(path.join(root, 'preview/d-lijn.html'), 'utf8');
const inhoud = JSON.parse(fs.readFileSync(path.join(root, 'docs/inhoud.json'), 'utf8'));

// ---------- delen uit de hoofdpagina ----------
function tussen(tekst, start, eind, metEind = true) {
  const i = tekst.indexOf(start);
  if (i < 0) throw new Error('Niet gevonden: ' + start);
  const j = tekst.indexOf(eind, i + start.length);
  if (j < 0) throw new Error('Einde niet gevonden na: ' + start);
  return tekst.slice(i, metEind ? j + eind.length : j);
}
const stijl = tussen(hoofd, '<style>', '</style>');
const fonts = tussen(hoofd, '<link rel="preconnect"', 'rel="stylesheet">');
const kopdeel = tussen(hoofd, '<!-- iconenset', '<section class="hero">', false).replace(/\n<!--[^\n]*-->\s*$/, '\n');
const footer = tussen(hoofd, '<footer', '</footer>');
const dock = tussen(hoofd, '<div class="dock">', '</div>');
const gedeeldJs = tussen(hoofd, '// [[gedeeld', '// gedeeld]]');
const reviewkaarten = tussen(hoofd, '<div class="kaarten">', '<div class="reviews-meer">', false).trim();

// Ankers op de hoofdpagina werken vanaf een subpagina via d-lijn.html#…
// (alleen <a>-links; <use href="#i-…"> verwijst naar de iconenset op dezelfde pagina en blijft staan)
const naarHoofd = (html) => html.replace(/(<a\b[^>]*?)href="#([^"]*)"/g, (m, voor, a) => `${voor}href="d-lijn.html${a ? '#' + a : ''}"`);

const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- extra opmaak voor de subpagina's ----------
const extraStijl = `<style>
/* ---------- subpagina's (gegenereerd) ---------- */
.p-hero{padding:56px 0 96px}
.p-hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,6vw,96px);align-items:center}
.p-hero .oog,.oproep .oog{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--zacht)}
.kruimel{display:flex;gap:8px;font-size:13px;color:var(--zacht);margin-bottom:clamp(36px,5vw,64px)}
.kruimel a:hover{color:var(--inkt)}
.p-hero h1{font-size:clamp(40px,6.2vw,82px);font-weight:700;letter-spacing:-.04em;line-height:.98}
.p-hero .lead{margin-top:26px;max-width:50ch;color:var(--zacht);font-weight:300;font-size:17.5px;line-height:1.7}
.p-hero .acties{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
.p-hero .knop{padding:13px 24px;font-size:14px}
.p-hero .knop.lijn{background:transparent;color:var(--inkt);border-color:var(--inkt)}
.p-beeld{position:relative;aspect-ratio:1/1;background:var(--bg);overflow:hidden;border-radius:2px;
  box-shadow:0 50px 90px -40px rgba(20,19,15,.45),0 18px 36px -24px rgba(20,19,15,.25)}
.p-beeld img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.p-beeld .tag{position:absolute;left:7%;bottom:7%;font-family:var(--serif);font-style:italic;font-size:19px;
  background:#fff;color:#14130f;padding:6px 18px;border-radius:999px;transform:rotate(-4deg)}
.p-beeld .bijsch{position:absolute;left:14px;top:14px;font-size:11px;color:#fff;background:rgba(0,0,0,.5);
  backdrop-filter:blur(6px);border-radius:999px;padding:6px 12px}

.sectie{padding:clamp(70px,9vw,120px) 0}
.sectie .kop{padding:0 0 8px}
.stappen.vier .stap{min-height:220px}
.stap .snr.klein{font-size:42px}

/* galerij: echte projecten, met lichtbak */
.galerij{columns:3 280px;column-gap:18px;margin-top:46px}
.galerij figure{break-inside:avoid;margin:0 0 18px;position:relative;border-radius:10px;overflow:hidden;cursor:zoom-in;
  background:#eee}
.galerij img{width:100%;height:auto;display:block}
.galerij figcaption{position:absolute;left:0;right:0;bottom:0;padding:34px 16px 14px;font-size:13px;color:#fff;
  background:linear-gradient(to top,rgba(10,10,8,.7),transparent);opacity:0;transform:translateY(6px);
  transition:opacity .35s var(--ease),transform .35s var(--ease)}
.galerij figure:hover figcaption{opacity:1;transform:none}
@media(hover:none){.galerij figcaption{opacity:1;transform:none}}
.lichtbak{position:fixed;inset:0;z-index:95;background:rgba(10,10,8,.92);display:grid;place-items:center;padding:24px;
  opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s}
.lichtbak.open{opacity:1;visibility:visible;transition:opacity .3s}
.lichtbak img{max-width:min(1200px,92vw);max-height:80vh;object-fit:contain;border-radius:6px}
.lichtbak p{color:rgba(255,255,255,.8);font-size:14px;margin-top:14px;text-align:center}
.lichtbak button{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:20px;cursor:pointer}

/* review-citaat */
.citaat{max-width:880px}
.citaat blockquote{font-family:var(--serif);font-style:italic;font-size:clamp(26px,3.4vw,42px);line-height:1.25;
  letter-spacing:-.01em}
.citaat .wie{margin-top:26px;font-size:14px}.citaat .wie b{font-weight:600}
.citaat .wie span{color:var(--zacht);margin-left:8px}
.citaat .sterren{color:var(--brons);letter-spacing:3px;margin-bottom:20px;display:block}

/* veelgestelde vragen */
.faq{margin-top:40px;border-top:1px solid var(--rand);max-width:880px}
.faq details{border-bottom:1px solid var(--rand)}
.faq summary{list-style:none;cursor:pointer;padding:24px 44px 24px 0;font-size:19px;font-weight:600;
  letter-spacing:-.01em;position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:'+';position:absolute;right:6px;top:20px;font-size:26px;font-weight:300;
  transition:transform .3s var(--ease)}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{color:var(--zacht);font-weight:300;line-height:1.7;padding:0 44px 26px 0;max-width:68ch}

/* andere diensten */
.andere{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:40px}
.andere a{display:flex;align-items:center;gap:14px;padding:20px 22px;border:1px solid var(--rand);border-radius:12px;
  background:var(--kaart);transition:transform .3s var(--ease),box-shadow .3s}
.andere a:hover{transform:translateY(-3px);box-shadow:0 18px 40px -26px rgba(20,19,15,.4)}
.andere i{width:14px;height:14px;border-radius:50%;background:var(--kl);flex:none}
.andere span{font-weight:600;font-size:15px;flex:1}
.andere a::after{content:'→';color:var(--zacht)}

/* afsluitende oproep */
.oproep{padding:clamp(80px,10vw,130px) 0}
.oproep h2{font-size:clamp(36px,5.6vw,72px);font-weight:700;letter-spacing:-.035em;line-height:1;max-width:14ch}
.oproep h2 em{font-family:var(--serif);font-style:italic;font-weight:400}
.oproep p{margin-top:22px;color:var(--zacht);font-weight:300;max-width:46ch;font-size:17px}
.oproep .acties{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
.oproep .knop{padding:13px 24px;font-size:14px}
.oproep .knop.wa{background:#25D366;color:#fff}
.oproep .knop.lijn{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}

/* over ons */
.verhaal{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,80px);margin-top:10px}
.verhaal p{color:var(--zacht);font-weight:300;line-height:1.75;font-size:16.5px}
.verhaal p:first-child{color:var(--inkt);font-size:20px;line-height:1.55;font-weight:400}

/* binnenkomst */
.op{opacity:0;transform:translateY(24px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.op.in{opacity:1;transform:none}

@media(max-width:820px){
  .p-hero .wrap,.verhaal{grid-template-columns:1fr}
  .p-hero{padding:30px 0 70px}
  .stappen.vier .stap{min-height:0}
}
@media(prefers-reduced-motion:reduce){.op{opacity:1;transform:none;transition:none}}
</style>`;

// ---------- bouwstenen ----------
function pagina({ titel, omschrijving, body }) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(omschrijving)}">
<!-- GEGENEREERD door tools/genereer-paginas.js uit docs/inhoud.json — niet met de hand aanpassen -->
${fonts}
${stijl}
${extraStijl}
</head>
<body>

${naarHoofd(kopdeel)}
${body}

${naarHoofd(footer)}

${dock}

<div class="lichtbak" id="lichtbak" role="dialog" aria-modal="true" aria-label="Foto vergroot">
  <button type="button" aria-label="Sluiten">×</button>
  <div><img alt=""><p></p></div>
</div>

<script>
(function(){
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Binnenkomst van blokken
  var op=[].slice.call(document.querySelectorAll('.op'));
  if(rm || !('IntersectionObserver' in window)) op.forEach(function(e){ e.classList.add('in'); });
  else { var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.15});
    op.forEach(function(e){ io.observe(e); }); }

  // Lichtbak voor de galerij
  var lb=document.getElementById('lichtbak'), lbImg=lb.querySelector('img'), lbTxt=lb.querySelector('p');
  document.querySelectorAll('.galerij figure').forEach(function(f){
    f.addEventListener('click',function(){ var i=f.querySelector('img');
      lbImg.src=i.src; lbImg.alt=i.alt; lbTxt.textContent=f.querySelector('figcaption').textContent; lb.classList.add('open'); });
  });
  function dicht(){ lb.classList.remove('open'); }
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.tagName==='BUTTON') dicht(); });
  addEventListener('keydown',function(e){ if(e.key==='Escape') dicht(); });

  ${gedeeldJs}
})();
</script>
</body>
</html>
`;
}

function oog(tekst) { return `<span class="oog">${esc(tekst)}<i class="baan"></i></span>`; }

function oproep() {
  return `<section class="oproep donker">
  <div class="kolommen"></div>
  <div class="wrap op">
    ${oog('Contact')}
    <h2>Vraag vrijblijvend <em>advies</em> aan.</h2>
    <p>Vertel kort wat u van plan bent. Ozcan reageert binnen een dag en komt graag langs om het ter plaatse te bekijken.</p>
    <div class="acties">
      <a class="knop" href="tel:+31641429106">Bel 06 41 42 91 06</a>
      <a class="knop wa" href="https://wa.me/31641429106" target="_blank" rel="noopener">WhatsApp</a>
      <a class="knop lijn" href="d-lijn.html#contact">Contactformulier</a>
    </div>
  </div>
</section>`;
}

function stappenRaster(items, cta) {
  const stappen = items.map(([kop, tekst], i) => `      <div class="stap">
        <div class="snr klein">${String(i + 1).padStart(2, '0')}</div>
        <h3>${esc(kop)}</h3>
        <p>${esc(tekst)}</p>
      </div>`).join('\n');
  const slot = cta ? `
      <a class="stap stap-cta" href="d-lijn.html#contact">
        <div><div class="snr">→</div>
        <h3>${esc(cta[0])}</h3>
        <p>${esc(cta[1])}</p></div>
        <span class="verder">${esc(cta[2])}</span>
      </a>` : '';
  return `<div class="stappen vier op">\n${stappen}${slot}\n    </div>`;
}

// ---------- dienstpagina ----------
function dienstPagina(d, alle) {
  const galerij = d.galerij.map(([src, bijschrift]) => `      <figure data-kantel><img src="${src}" alt="${esc(bijschrift)}" loading="lazy"><figcaption>${esc(bijschrift)}</figcaption></figure>`).join('\n');
  const faq = d.faq.map(([v, a]) => `      <details><summary>${esc(v)}</summary><p>${esc(a)}</p></details>`).join('\n');
  const andere = alle.filter((x) => x.slug !== d.slug).map((x) => `      <a href="dienst-${x.slug}.html" style="--kl:${x.kleur}"><i></i><span>${esc(x.naam)}</span></a>`).join('\n');
  const review = d.review ? `
<section class="fris">
  <div class="kolommen"></div>
  <div class="wrap sectie op">
    <div class="citaat">
      <span class="sterren">★★★★★</span>
      <blockquote>"${esc(d.review[0])}"</blockquote>
      <div class="wie"><b>${esc(d.review[1])}</b><span>${esc(d.review[2])}</span></div>
    </div>
  </div>
</section>` : '';

  const body = `<!-- HERO -->
<section class="p-hero">
  <div class="kolommen"></div>
  <div class="wrap">
    <div>
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><a href="d-lijn.html#diensten">Diensten</a><span>/</span><span>${esc(d.naam)}</span></div>
      ${oog(d.nr + ' — ' + d.naam)}
      <h1>${esc(d.kop)}</h1>
      <p class="lead">${esc(d.intro)}</p>
      <div class="acties">
        <a class="knop" href="d-lijn.html#contact">Vraag vrijblijvend advies</a>
        <a class="knop lijn" href="#werk">Bekijk uitgevoerd werk</a>
      </div>
    </div>
    <div class="p-beeld" style="--bg:${d.kleur}" data-kantel>
      <img src="${d.beeld}" alt="${esc(d.beeldAlt)}">
    </div>
  </div>
</section>

<!-- WAT WE DOEN -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Wat we doen')}
      <h2>Alles rond ${esc(d.naam.toLowerCase())}, in één hand.</h2>
    </div>
    ${stappenRaster(d.werk)}
  </div>
</section>

<!-- UITGEVOERD WERK -->
<section id="werk" class="fris">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Uitgevoerd werk')}
      <h2>Echte projecten van <em class="serif">OK</em>.</h2>
      <p class="lead">Foto's van klussen die Ozcan en zijn ploeg hebben uitgevoerd. Klik op een foto om hem groot te bekijken.</p>
    </div>
    <div class="galerij op">
${galerij}
    </div>
  </div>
</section>

<!-- AANPAK -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Zo pakken we het aan')}
      <h2>In drie stappen <em class="serif">klaar</em>.</h2>
    </div>
    ${stappenRaster(d.aanpak, ['Klaar voor stap 1?', 'Bel, app of mail Ozcan. Binnen een dag hoort u van ons.', 'Plan een afspraak'])}
  </div>
</section>
${review}

<!-- VRAGEN -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Veelgestelde vragen')}
      <h2>Goed om te weten.</h2>
    </div>
    <div class="faq op">
${faq}
    </div>
  </div>
</section>

<!-- ANDERE DIENSTEN -->
<section class="fris">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Meer van OK')}
      <h2>Andere diensten.</h2>
    </div>
    <div class="andere op">
${andere}
    </div>
  </div>
</section>

${oproep()}`;

  return pagina({
    titel: `${d.naam} — OK Timmerwerken Gorinchem`,
    omschrijving: d.intro.slice(0, 155),
    body,
  });
}

// ---------- over ons ----------
function overPagina(o) {
  const body = `<!-- HERO -->
<section class="p-hero">
  <div class="kolommen"></div>
  <div class="wrap">
    <div>
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Over ons</span></div>
      ${oog('Over ons')}
      <h1>${esc(o.kop)}</h1>
      <p class="lead">${esc(o.intro)}</p>
      <div class="acties">
        <a class="knop" href="d-lijn.html#contact">Maak kennis met Ozcan</a>
        <a class="knop lijn" href="d-lijn.html#diensten">Bekijk de diensten</a>
      </div>
    </div>
    <div class="p-beeld" style="--bg:#c4af92;aspect-ratio:4/5" data-kantel>
      <img src="${o.beeld}" alt="${esc(o.beeldAlt)}">
      <span class="bijsch">Portret volgt</span>
      <span class="tag">— Ozcan, OK Timmerwerken</span>
    </div>
  </div>
</section>

<!-- VERHAAL -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Het verhaal')}
      <h2>Vakwerk uit <em class="serif">Gorinchem</em>.</h2>
    </div>
    <div class="verhaal op">
      <p>${esc(o.verhaal[0])}</p>
      <div>${o.verhaal.slice(1).map((p) => `<p style="margin-bottom:18px">${esc(p)}</p>`).join('')}</div>
    </div>
  </div>
</section>

<!-- WAARDEN -->
<section class="fris">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Waar we voor staan')}
      <h2>Drie dingen die u <em class="serif">altijd</em> krijgt.</h2>
    </div>
    ${stappenRaster(o.waarden, ['Kennismaken?', 'Ozcan komt graag langs om uw plannen te bespreken — gratis en vrijblijvend.', 'Plan een afspraak'])}
  </div>
</section>

<!-- REVIEWS -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Wat klanten zeggen')}
      <h2>In de reviews staat <em class="serif">Ozcan</em>.</h2>
    </div>
    <div class="op">
    ${reviewkaarten}
    </div>
  </div>
</section>

${oproep()}`;
  return pagina({
    titel: 'Over ons — OK Timmerwerken Gorinchem',
    omschrijving: o.intro.slice(0, 155),
    body,
  });
}

// ---------- schrijven ----------
const uit = path.join(root, 'preview');
const geschreven = [];
for (const d of inhoud.diensten) {
  const f = `dienst-${d.slug}.html`;
  fs.writeFileSync(path.join(uit, f), dienstPagina(d, inhoud.diensten));
  geschreven.push(f);
}
fs.writeFileSync(path.join(uit, 'over.html'), overPagina(inhoud.over));
geschreven.push('over.html');

// controle: bestaan alle verwezen beelden?
let mist = 0;
for (const f of geschreven) {
  const html = fs.readFileSync(path.join(uit, f), 'utf8');
  for (const m of html.matchAll(/src="(\.\.\/assets\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(uit, m[1]))) { console.error(`  ontbreekt in ${f}: ${m[1]}`); mist++; }
  }
}
console.log(`${geschreven.length} pagina's geschreven: ${geschreven.join(', ')}${mist ? ` — ${mist} beeld(en) ontbreken` : ' — alle beelden gevonden'}`);
