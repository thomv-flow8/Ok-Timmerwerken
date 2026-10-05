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
// reviews-raster (3 reviews + scores) — de optel-animatie draait alleen op de hoofdpagina, dus hier de eindwaarde
const reviewkaarten = tussen(hoofd, '<div class="kaarten">', '<!-- /kaarten -->')
  .replace(/<b data-tel data-naar="([\d.]+)" data-dec="(\d)">[^<]*<\/b>/g, (m, n, d) => `<b>${Number(n).toFixed(Number(d)).replace('.', ',')}</b>`);

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
.portret-blok{position:relative;aspect-ratio:1/1.04;border-radius:28px;overflow:hidden;display:flex;align-items:flex-end;
  justify-content:center;padding-top:9%;
  background:radial-gradient(120% 90% at 50% 18%,#ffffff 0%,#f6f1e9 52%,#e9e0d1 100%)}   /* zachte, warme gloed: blendt in, net iets anders dan de achtergrond */
.portret-blok img{width:100%;height:auto;display:block}
.portret-blok .tag{position:absolute;left:7%;bottom:7%;font-family:var(--serif);font-style:italic;font-size:19px;
  background:#14130f;color:#fff;padding:6px 18px;border-radius:999px;transform:rotate(-4deg)}
.p-beeld.leeg{display:grid;place-items:center;border:1px dashed #cfc5b5;box-shadow:none}
.leeg-in{display:flex;flex-direction:column;align-items:center;gap:10px;color:#9a8f7e;text-align:center}
.leeg-in svg{width:64px;height:auto;margin-bottom:6px}
.leeg-in span{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.leeg-in em{font-family:var(--serif);font-size:22px;color:#7d7262}
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

/* alle werkzaamheden: inhoudsopgave links (blijft staan), teksten rechts */
.onderdelen{display:grid;grid-template-columns:260px 1fr;gap:clamp(30px,6vw,90px);margin-top:46px;align-items:start}
.ond-nav{position:sticky;top:100px;display:flex;flex-direction:column;border-left:1px solid var(--rand)}
.ond-nav a{padding:9px 0 9px 18px;font-size:14px;color:var(--zacht);margin-left:-1px;border-left:2px solid transparent;
  transition:color .2s,border-color .2s}
.ond-nav a:hover{color:var(--inkt);border-left-color:var(--brons)}
.ond-lijst article{padding:30px 0 32px;border-top:1px solid var(--rand);scroll-margin-top:96px;display:grid;
  grid-template-columns:56px 1fr;gap:0 20px}
.ond-lijst article:first-child{border-top:0;padding-top:0}
.ond-lijst .onr{font-family:var(--serif);font-style:italic;font-size:28px;color:var(--brons);line-height:1.1}
.ond-lijst h3{font-size:clamp(21px,2.2vw,26px);font-weight:700;letter-spacing:-.02em;line-height:1.2}
.ond-lijst p{grid-column:2;margin-top:10px;color:#4a4740;font-weight:300;line-height:1.75;font-size:16px;max-width:64ch}
.download{display:inline-flex;align-items:center;gap:12px;margin-top:34px;padding:14px 22px;border-radius:999px;
  background:#14130f;color:#fff;font-weight:600;font-size:14px}
.download::before{content:'↓';color:var(--brons);font-size:16px}
.p-hero .erkend{display:flex;align-items:center;gap:14px;margin-top:30px;font-size:14px;font-weight:600}
.p-hero .erkend img{width:64px;height:64px;border-radius:6px}
@media(max-width:820px){.onderdelen{grid-template-columns:1fr}.ond-nav{display:none}
  .ond-lijst article{grid-template-columns:1fr}.ond-lijst p{grid-column:1}}

/* diensten-overzicht */
.overzicht{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:28px 22px;margin-top:46px}
.overzicht .blok .kaart{aspect-ratio:4/3}
.overzicht .blok ul{list-style:none;margin-top:14px}
.overzicht .blok li a{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid var(--rand);
  font-size:14px;color:#4a4740}
.overzicht .blok li a::after{content:'→';color:var(--zacht)}
.overzicht .blok li a:hover{color:var(--inkt)}

/* juridische tekst */
.juridisch{max-width:760px}
.juridisch h2{font-size:20px;font-weight:700;margin:34px 0 10px;letter-spacing:-.01em}
.juridisch ol{padding-left:22px;color:#4a4740;line-height:1.75;font-weight:300}
.juridisch p{color:#4a4740;line-height:1.8;font-weight:300;margin-top:14px}

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
.donker .faq details p{color:rgba(255,255,255,.68)}
.donker .faq summary::after{color:var(--brons)}
.donker .faq summary:hover{color:#fff}
.faq details p{color:var(--zacht);font-weight:300;line-height:1.7;padding:0 44px 26px 0;max-width:68ch}

/* terugknop naar home (zwart bolletje met witte pijl) */
.terug{width:40px;height:40px;border-radius:50%;background:#14130f;color:#fff;display:grid;place-items:center;flex:none;
  transition:transform .25s var(--ease),background .25s}
.terug:hover{transform:translateX(-3px);background:#2a2824}
.terug svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.nav-in .merk{margin-right:auto}

/* andere diensten: beeldkaarten met dienstkleur */
.andere{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:44px;
  width:min(var(--max),94vw);margin-left:calc(50% - min(var(--max),94vw) / 2)}   /* 2 rijen van 4, precies tussen de lijnen */
.andere > a{margin:14px}
a.kaart.alle-kaart{background:#14130f;display:flex;flex-direction:column;justify-content:flex-end;padding:22px;color:#fff}
a.kaart.alle-kaart::after{display:none}
.alle-kaart .krul-mini{width:70px;margin-bottom:auto;color:var(--brons)}
.alle-kaart b{font-size:19px;font-weight:600;line-height:1.2}
.alle-kaart small{display:block;margin-top:8px;color:rgba(255,255,255,.65);font-size:13px}
a.kaart{position:relative;display:block;aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:var(--kl);
  color:#fff;box-shadow:0 30px 60px -40px rgba(20,19,15,.5)}
a.kaart img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  clip-path:circle(38% at 50% 40%);transition:clip-path .8s var(--ease),transform .8s var(--ease)}
a.kaart:hover img{clip-path:circle(80% at 50% 40%);transform:scale(1.04)}
a.kaart::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,8,.72) 0%,rgba(10,10,8,0) 48%)}
.kaart .knr{position:absolute;top:14px;left:16px;z-index:1;font-family:var(--serif);font-style:italic;font-size:26px}
.kaart .knaam{position:absolute;left:16px;right:16px;bottom:16px;z-index:1}
.kaart .knaam b{display:block;font-size:17px;font-weight:600;letter-spacing:-.01em;line-height:1.2}
.kaart .knaam span{display:inline-flex;gap:6px;margin-top:8px;font-size:12.5px;color:rgba(255,255,255,.8)}
.kaart .knaam span::after{content:'→';transition:transform .3s var(--ease)}
.kaart:hover .knaam span::after{transform:translateX(4px)}
@media(max-width:820px){.andere{grid-template-columns:1fr 1fr;width:auto;margin-left:0}.andere > a{margin:6px}}

/* afsluitende oproep */
.oproep{padding:clamp(80px,10vw,130px) 0}
.oproep h2{font-size:clamp(36px,5.6vw,72px);font-weight:700;letter-spacing:-.035em;line-height:1;max-width:14ch}
.oproep h2 em{font-family:var(--serif);font-style:italic;font-weight:400}
.oproep p{margin-top:22px;color:var(--zacht);font-weight:300;max-width:46ch;font-size:17px}
.oproep .acties{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
.oproep .knop{padding:13px 24px;font-size:14px}
.oproep .knop.wa{background:#25D366;color:#fff}
.oproep .knop.lijn{background:transparent;color:var(--inkt);border-color:var(--inkt)}

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
<meta name="robots" content="noindex, nofollow">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(omschrijving)}">
<!-- GEGENEREERD door tools/genereer-paginas.js uit docs/inhoud.json — niet met de hand aanpassen -->
${fonts}
${stijl}
${extraStijl}
</head>
<body>

${naarHoofd(kopdeel).replace('<div class="nav-in">\n    <a class="merk"', '<div class="nav-in">\n    <a class="terug" href="d-lijn.html" aria-label="Terug naar de homepage" title="Terug naar home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a>\n    <a class="merk"')}
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
  // vangnet: ook vanuit de scroll onthullen (sommige browsers vuren de observer te laat)
  function vang(){ var h=innerHeight; op.forEach(function(e){ if(!e.classList.contains('in') && e.getBoundingClientRect().top<h*.92) e.classList.add('in'); }); }
  addEventListener('scroll',vang,{passive:true}); addEventListener('load',vang); vang();
  // kom je binnen via een anker (bijv. een doorverwijzing van de oude site), spring dan naar die werkzaamheid
  if(location.hash && location.hash.length>1){ var doelEl=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(doelEl) addEventListener('load',function(){ setTimeout(function(){ document.documentElement.style.scrollBehavior='auto';
      doelEl.scrollIntoView({block:'start'}); document.documentElement.style.scrollBehavior=''; vang(); },60); }); }

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
  return `<section class="oproep">
  <div class="kolommen"></div>
  <div class="scheidlijn" data-teken aria-hidden="true"></div>
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
        <div><svg class="cta-krul" viewBox="0 0 140 100" aria-hidden="true"><path d="M132,10 C104,0 72,8 74,30 C76,50 106,48 102,32 C98,16 64,24 50,46 C41,61 33,76 25,90 M25,90 L22,77 M25,90 L36,83"/></svg>
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
  const andere = alle.filter((x) => x.slug !== d.slug).map((x) => `      <a class="kaart" href="dienst-${x.slug}.html" style="--kl:${x.kleur}" data-kantel>
        <img src="${x.beeld}" alt="" loading="lazy">
        <span class="knr">${x.nr}</span>
        <span class="knaam"><b>${esc(x.naam)}</b><span>Bekijk dienst</span></span>
      </a>`).join('\n') + `
      <a class="kaart alle-kaart" href="diensten.html">
        <svg class="krul-mini" viewBox="0 0 140 100" aria-hidden="true"><path d="M132,10 C104,0 72,8 74,30 C76,50 106,48 102,32 C98,16 64,24 50,46 C41,61 33,76 25,90 M25,90 L22,77 M25,90 L36,83" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        <b>Alle diensten</b><small>Alle werkzaamheden op een rij →</small>
      </a>`;
  const onderdelen = d.onderdelen ? `
<!-- ALLE WERKZAAMHEDEN -->
<section class="creme" id="werkzaamheden">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Alle werkzaamheden')}
      <h2>Wat we doen binnen <em class="serif">${esc(d.naam.charAt(0).toLowerCase() + d.naam.slice(1))}</em>.</h2>
    </div>
    <div class="onderdelen op">
      <nav class="ond-nav" aria-label="Werkzaamheden">
${d.onderdelen.map((o) => `        <a href="#${o.id}">${esc(o.titel)}</a>`).join('\n')}
      </nav>
      <div class="ond-lijst">
${d.onderdelen.map((o, i) => `        <article id="${o.id}"><span class="onr">${String(i + 1).padStart(2, '0')}</span><h3>${esc(o.titel)}</h3><p>${esc(o.tekst)}</p></article>`).join('\n')}
${d.download ? `        <a class="download" href="${d.download[1]}" target="_blank" rel="noopener">${esc(d.download[0])}</a>` : ''}
      </div>
    </div>
  </div>
</section>` : '';
  const erkend = d.slug === 'dakramen' ? `
      <div class="erkend"><img src="../assets/web/velux-montagepartner.jpg" alt="VELUX Montagepartner">Erkend VELUX Montagepartner — getraind en gecertificeerd door VELUX</div>` : '';
  const review = d.review ? `
<section>
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
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><a href="diensten.html">Diensten</a><span>/</span><span>${esc(d.naam)}</span></div>
      ${oog(d.nr + ' — ' + d.naam)}
      <h1>${esc(d.kop)}</h1>
      <p class="lead">${esc(d.intro)}</p>
      <div class="acties">
        <a class="knop" href="d-lijn.html#contact">Vraag vrijblijvend advies</a>
        <a class="knop lijn" href="#werk">Bekijk uitgevoerd werk</a>
      </div>${erkend}
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
      <h2>Alles rond ${esc(d.naam.charAt(0).toLowerCase() + d.naam.slice(1))}, in één hand.</h2>
    </div>
    ${stappenRaster(d.werk)}
  </div>
</section>
${onderdelen}

<!-- UITGEVOERD WERK -->
<section id="werk">
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
<section class="fris">
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
<section class="donker">
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
<section>
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
    <div class="portret-blok" data-kantel>
      <img src="../assets/render/portret/web/ozcan-bovenlijf.webp" alt="Ozcan, eigenaar van OK Timmerwerken" width="800" height="775">
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

// ---------- diensten-overzicht ----------
function overzichtPagina(alle) {
  const blokken = alle.map((x) => `      <div class="blok">
        <a class="kaart" href="dienst-${x.slug}.html" style="--kl:${x.kleur}" data-kantel>
          <img src="${x.beeld}" alt="" loading="lazy">
          <span class="knr">${x.nr}</span>
          <span class="knaam"><b>${esc(x.naam)}</b><span>Bekijk dienst</span></span>
        </a>
        <ul>
${(x.onderdelen || []).map((o) => `          <li><a href="dienst-${x.slug}.html#${o.id}">${esc(o.titel)}</a></li>`).join('\n')}
        </ul>
      </div>`).join('\n');
  const body = `<section class="p-hero" style="padding-bottom:20px">
  <div class="kolommen"></div>
  <div class="wrap" style="display:block">
    <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Diensten</span></div>
    ${oog('Diensten')}
    <h1>Alle vakken, <em class="serif">één</em> ploeg.</h1>
    <p class="lead">Timmerwerk, betonwerk, dakramen, onderhoud en nieuwbouw — van de fundering tot de laatste lijst. Kies een dienst of ga direct naar een werkzaamheid.</p>
  </div>
</section>
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie" style="padding-top:20px">
    <div class="overzicht op">
${blokken}
    </div>
  </div>
</section>

${oproep()}`;
  return pagina({ titel: 'Diensten — OK Timmerwerken Gorinchem', omschrijving: 'Alle diensten van OK Timmerwerken: timmerwerk, betonvloeren, funderingen, dakramen (Velux), carports, onderhoud & renovatie en nieuwbouw in Gorinchem en Zuid-Holland.', body });
}

// ---------- juridische pagina's ----------
function juridischPagina(titel, inhoudHtml) {
  const body = `<section class="p-hero" style="padding-bottom:20px">
  <div class="kolommen"></div>
  <div class="wrap" style="display:block">
    <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>${esc(titel)}</span></div>
    ${oog('OK Timmerwerken')}
    <h1>${esc(titel)}</h1>
  </div>
</section>
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie" style="padding-top:20px">
    <div class="juridisch">
${inhoudHtml}
    </div>
  </div>
</section>`;
  return pagina({ titel: `${titel} — OK Timmerwerken`, omschrijving: `${titel} van OK Timmerwerken, Gorinchem.`, body });
}
function voorwaardenHtml(v) {
  return `      <p>${esc(v.intro)}</p>
      <a class="download" href="${v.pdf}" target="_blank" rel="noopener">Download als pdf</a>
${v.artikelen.map((a) => `      <h2>${esc(a.titel)}</h2>\n      <ol>${a.leden.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`).join('\n')}`;
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
fs.writeFileSync(path.join(uit, 'diensten.html'), overzichtPagina(inhoud.diensten));
fs.writeFileSync(path.join(uit, 'voorwaarden.html'), juridischPagina('Algemene voorwaarden', voorwaardenHtml(inhoud.juridisch.voorwaarden)));
fs.writeFileSync(path.join(uit, 'disclaimer.html'), juridischPagina('Disclaimer', inhoud.juridisch.disclaimer.alineas.map((p) => `      <p>${esc(p)}</p>`).join('\n')));
geschreven.push('diensten.html', 'voorwaarden.html', 'disclaimer.html');

// controle: bestaan alle verwezen beelden?
let mist = 0;
for (const f of geschreven) {
  const html = fs.readFileSync(path.join(uit, f), 'utf8');
  for (const m of html.matchAll(/src="(\.\.\/assets\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(uit, m[1]))) { console.error(`  ontbreekt in ${f}: ${m[1]}`); mist++; }
  }
}
console.log(`${geschreven.length} pagina's geschreven: ${geschreven.join(', ')}${mist ? ` — ${mist} beeld(en) ontbreken` : ' — alle beelden gevonden'}`);

// ---------- bouwen: de echte site met nette adressen in de hoofdmap ----------
// preview/ blijft de werkomgeving; hieronder komt de publieke structuur:
//   /index.html                     ← preview/d-lijn.html
//   /over-ons/index.html            ← preview/over.html
//   /diensten/<slug>/index.html     ← preview/dienst-<slug>.html
// Alle verwijzingen worden relatief herschreven, zodat het werkt op github.io/Ok-Timmerwerken/
// én straks op ok-timmerwerken.nl.
const slugs = inhoud.diensten.map((d) => d.slug);
function herschrijf(html, pre) {
  const home = pre || './';
  let h = html.split('../assets/').join(pre + 'assets/');
  h = h.replace(/href="d-lijn\.html(#[^"]*)?"/g, (m, a) => `href="${a ? (pre ? pre + a : a) : home}"`);
  h = h.replace(/href="over\.html"/g, `href="${pre}over-ons/"`);
  h = h.replace(/href="diensten\.html"/g, `href="${pre}diensten/"`);
  h = h.replace(/href="voorwaarden\.html"/g, `href="${pre}algemene-voorwaarden/"`);
  h = h.replace(/href="disclaimer\.html"/g, `href="${pre}disclaimer/"`);
  for (const s of slugs) h = h.replace(new RegExp(`href="dienst-${s}\\.html(#[^"]*)?"`, 'g'), (m, a) => `href="${pre}diensten/${s}/${a || ''}"`);
  return h;
}
function schrijf(rel, html) {
  const doel = path.join(root, rel);
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  fs.writeFileSync(doel, html);
}
schrijf('index.html', herschrijf(fs.readFileSync(path.join(uit, 'd-lijn.html'), 'utf8'), ''));
schrijf('over-ons/index.html', herschrijf(fs.readFileSync(path.join(uit, 'over.html'), 'utf8'), '../'));
for (const s of slugs) {
  schrijf(`diensten/${s}/index.html`, herschrijf(fs.readFileSync(path.join(uit, `dienst-${s}.html`), 'utf8'), '../../'));
}
schrijf('diensten/index.html', herschrijf(fs.readFileSync(path.join(uit, 'diensten.html'), 'utf8'), '../'));
schrijf('algemene-voorwaarden/index.html', herschrijf(fs.readFileSync(path.join(uit, 'voorwaarden.html'), 'utf8'), '../'));
schrijf('disclaimer/index.html', herschrijf(fs.readFileSync(path.join(uit, 'disclaimer.html'), 'utf8'), '../'));

// doorverwijzingen: elk oud adres van ok-timmerwerken.nl krijgt een klein bestand dat direct doorstuurt
// naar de nieuwe plek (GitHub Pages kent geen serverredirects; dit werkt ook voor Google via canonical).
const oud = Object.entries(inhoud.doorverwijzingen);
for (const [van, naar] of oud) {
  const diepte = van.split('/').length;
  const pre = '../'.repeat(diepte);
  let doel;
  if (naar === '@overzicht') doel = `${pre}diensten/`;
  else if (naar.startsWith('#')) doel = `${pre}${naar}`;
  else { const [sl, anker] = naar.split('#'); doel = `${pre}diensten/${sl}/${anker ? '#' + anker : ''}`; }
  schrijf(`${van}/index.html`, `<!doctype html>
<html lang="nl"><head><meta charset="utf-8">
<title>Doorverwijzing — OK Timmerwerken</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${doel}">
<link rel="canonical" href="${doel}">
<script>location.replace(${JSON.stringify(doel)});</script>
</head><body><p>Deze pagina is verhuisd: <a href="${doel}">ga naar de nieuwe pagina</a>.</p></body></html>
`);
}
// controle: verwijst de gebouwde site nog naar preview-bestanden, en bestaan alle beelden?
let fout = 0;
for (const rel of ['index.html', 'over-ons/index.html', 'diensten/index.html', 'algemene-voorwaarden/index.html', 'disclaimer/index.html', ...slugs.map((s) => `diensten/${s}/index.html`)]) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const map = path.dirname(path.join(root, rel));
  if (/d-lijn\.html|dienst-[a-z]+\.html|over\.html|diensten\.html|voorwaarden\.html|disclaimer\.html|\.\.\/assets\/(?!)/.test(html.replace(/\.\.\/(\.\.\/)?assets\//g, ''))) { console.error(`  ${rel}: bevat nog een preview-link`); fout++; }
  for (const m of html.matchAll(/(?:src|href)="([^"#:?][^"]*\.(?:jpg|png|webp|svg))"/g)) {
    if (!fs.existsSync(path.join(map, m[1]))) { console.error(`  ${rel}: ontbreekt ${m[1]}`); fout++; }
  }
}
console.log(`site gebouwd: index.html, over-ons/, diensten/ (+${slugs.length}), algemene-voorwaarden/, disclaimer/, ${oud.length} doorverwijzingen${fout ? ` — ${fout} probleem/problemen` : ' — alle links en beelden in orde'}`);
