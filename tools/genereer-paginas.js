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
const reviewData = JSON.parse(fs.readFileSync(path.join(root, 'docs/reviews.json'), 'utf8'));

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
// het contactraster (formulier + gegevens) staat alleen op de contactpagina; hier is de bron
const contactRaster = `<div class="contact-grid">
      <form id="aanvraag" novalidate>
        <label for="c-naam">Naam</label>
        <input id="c-naam" name="naam" type="text" autocomplete="name" placeholder="Uw naam" required>
        <div class="veld-rij">
          <div><label for="c-mail">E-mailadres</label>
          <input id="c-mail" name="email" type="email" autocomplete="email" placeholder="naam@voorbeeld.nl" required></div>
          <div><label for="c-tel">Telefoonnummer</label>
          <input id="c-tel" name="telefoon" type="tel" autocomplete="tel" placeholder="06 ..."></div>
        </div>
        <label for="c-ber">Waar kunnen we mee helpen?</label>
        <textarea id="c-ber" name="bericht" placeholder="Bijvoorbeeld: gevlinderde betonvloer van 30 m² in de garage" required></textarea>
        <button class="veld-knop" type="submit">Verstuur aanvraag</button>
        <p class="form-melding" role="status" hidden>Dit formulier is nog in de testfase en verstuurt nog niets. Bel of app Ozcan op <a href="tel:+31641429106">06 41 42 91 06</a> of mail naar <a href="mailto:info@ok-timmerwerken.nl">info@ok-timmerwerken.nl</a>.</p>
      </form>
      <div class="contact-info">
        <div class="lbl">Direct contact</div>
        <a href="tel:+31641429106">06 41 42 91 06</a>
        <a href="mailto:info@ok-timmerwerken.nl">info@ok-timmerwerken.nl</a>
        <div class="lbl">Werkgebied</div>
        <a href="#" style="pointer-events:none">Gorinchem en regio Zuid-Holland</a>
        <div class="lbl">Werktijden</div>
        <div class="tijden"><span>Maandag – vrijdag</span><span>07:00 – 20:00</span><span>Zaterdag</span><span>07:00 – 16:00</span><span>Zondag</span><span>Gesloten</span></div>
        <div class="nu-open" hidden><i></i><span></span></div>
        <div class="lbl">Erkenning</div>
        <a class="erkend" href="dienst-dakramen.html"><img src="../assets/web/velux-montagepartner.jpg" alt="VELUX Montagepartner">Erkend VELUX Montagepartner</a>
      </div>
    </div><!-- /contact-grid -->`;
const gedeeldJs = tussen(hoofd, '// [[gedeeld', '// gedeeld]]');

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
.portret-blok{position:relative;display:flex;align-items:flex-end;justify-content:center;background:transparent}   /* vrijstaand op wit: één geheel met de pagina */
.portret-blok img{position:relative;z-index:1;width:100%;height:auto;display:block;
  -webkit-mask-image:linear-gradient(to bottom,#000 72%,transparent 99%);mask-image:linear-gradient(to bottom,#000 72%,transparent 99%)}
.portret-blok .tag{z-index:2;opacity:1;translate:0 0;position:absolute;left:4%;bottom:12%;font-family:var(--serif);font-style:italic;font-size:19px;
  background:#14130f;color:#fff;padding:6px 18px;border-radius:999px;transform:rotate(-4deg)}
.p-beeld.leeg{display:grid;place-items:center;border:1px dashed #cfc5b5;box-shadow:none}
.leeg-in{display:flex;flex-direction:column;align-items:center;gap:10px;color:#9a8f7e;text-align:center}
.leeg-in svg{width:64px;height:auto;margin-bottom:6px}
.leeg-in span{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.leeg-in em{font-family:var(--serif);font-size:22px;color:#7d7262}
.p-beeld .bijsch{position:absolute;left:14px;top:14px;font-size:11px;color:#fff;background:rgba(0,0,0,.5);
  backdrop-filter:blur(6px);border-radius:999px;padding:6px 12px}

.sectie{padding-top:clamp(70px,9vw,120px);padding-bottom:clamp(70px,9vw,120px)}   /* alleen boven/onder: de zijmarge van .wrap blijft staan */
.sectie .kop{padding:0 0 8px}
.stappen.vier .stap{min-height:220px}
.stap .snr.klein{font-size:42px}

/* 3D-kaarten: grote vierkante foto in het midden, buren kantelen naar achteren en zijn gedimd;
   de actieve foto beweegt licht mee met de muis. Klassen met kc- om botsingen met gedeelde stijlen te voorkomen. */
.kc{margin-top:46px}
.kc-podium{--kc-maat:min(70vmin,560px);--kc-marge:min(4vmin,32px);position:relative;width:var(--kc-maat);height:var(--kc-maat);margin:0 auto;outline:none}
.kc-rail{position:absolute;left:calc(-1 * var(--kc-marge));top:0;display:flex;height:100%;margin:0;padding:0;transition:transform 1s var(--ease)}
.kc-persp{perspective:1200px;transform-style:preserve-3d}
.kc-kaart{position:relative;width:var(--kc-maat);height:var(--kc-maat);margin:0 var(--kc-marge);list-style:none;cursor:pointer;
  transform-origin:bottom;transform:scale(.98) rotateX(8deg);transition:transform .5s cubic-bezier(.4,0,.2,1)}
.kc-kaart.aan{transform:scale(1) rotateX(0);cursor:default}
.kc-vlak{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:#1d1d1a;transition:transform .15s ease-out;
  box-shadow:0 50px 90px -40px rgba(20,19,15,.5)}
.kc-kaart.aan .kc-vlak{transform:translate3d(calc(var(--x,0px) / 30),calc(var(--y,0px) / 30),0)}
.kc-vlak img{position:absolute;inset:-10%;width:120%;height:120%;max-width:none;object-fit:cover;opacity:.5;transition:opacity .6s ease}
.kc-kaart.aan .kc-vlak img{opacity:1}
.kc-kaart.aan .kc-vlak::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,8,.65),rgba(10,10,8,.05) 55%)}
.kc-tekst{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:0 7% 7%;color:#fff;opacity:0;visibility:hidden;transition:opacity 1s ease,visibility 1s}
.kc-kaart.aan .kc-tekst{opacity:1;visibility:visible}
.kc-nr{font-family:var(--serif);font-style:italic;color:#e7c9a0;font-size:22px}
.kc-tekst h3{font-size:clamp(19px,2.4vw,28px);font-weight:600;letter-spacing:-.02em;line-height:1.15;margin-top:6px}
.kc-groot{margin-top:18px;border:0;background:#fff;color:var(--inkt);border-radius:999px;padding:11px 20px;font:600 13.5px var(--f,inherit);cursor:pointer;
  transition:background .25s,color .25s}
.kc-groot:hover{background:var(--brons);color:#fff}
.kc-bediening{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:34px}
.kc-teller{min-width:76px;text-align:center;font-family:var(--serif);font-style:italic;font-size:22px;color:var(--brons)}
.kc-pijl{width:48px;height:48px;border-radius:50%;border:0;background:var(--inkt);color:#fff;cursor:pointer;display:grid;place-items:center;
  transition:transform .25s,background .25s}
.kc-pijl:hover{transform:translateY(-2px);background:var(--brons)}
.kc-pijl:active{transform:translateY(1px)}
.kc-pijl svg{width:18px;height:18px}
.kc-pijl:focus-visible,.kc-podium:focus-visible .kc-kaart.aan .kc-vlak{outline:2px solid var(--brons);outline-offset:3px}
@media(max-width:600px){.kc-podium{--kc-maat:80vw;--kc-marge:3vw}.kc-groot{padding:10px 16px}}   /* op telefoons groter dan 70vmin */
@media(prefers-reduced-motion:reduce){.kc-rail,.kc-kaart,.kc-vlak,.kc-vlak img,.kc-tekst{transition:none}}
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
.p-hero .erkend{display:flex;color:var(--inkt);align-items:center;gap:14px;margin-top:30px;font-size:14px;font-weight:600}
.p-hero .erkend img{width:64px;height:64px;border-radius:6px}
.krul-over{top:auto;bottom:8px;right:9%;width:min(44vw,560px)}   /* van onder het portret naar "Het verhaal" */
@media(max-width:900px){.krul-over{display:none}}
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
/* skyline van Gorinchem (eigen lijntekening): tekent zichzelf als het verhaal in beeld komt */
.skyline{display:block;width:100%;max-width:520px;height:auto;margin-top:clamp(28px,4vw,48px);overflow:visible}
.skyline path{fill:none;stroke:var(--brons);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;
  stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.6s var(--ease) calc(.4s + var(--d))}
.verhaal.in .skyline path{stroke-dashoffset:0}
@media(prefers-reduced-motion:reduce){.skyline path{stroke-dashoffset:0;transition:none}}

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

  // Krullen tekenen zich mee met het scrollen, en weer terug bij omhoog scrollen
  var krullen=[].slice.call(document.querySelectorAll('svg.krul path'));
  krullen.forEach(function(p){ p._L=p.getTotalLength(); p.style.strokeDasharray=p._L; p.style.strokeDashoffset=rm?0:p._L; });
  function krulScroll(){ var h=innerHeight; krullen.forEach(function(p){ var r=p.ownerSVGElement.getBoundingClientRect(), top=r.top+scrollY,
    t=top<h ? .22+scrollY/(top+r.height)*1.1 : (h*.95-r.top)/(r.height+h*.25);
    t=Math.min(1,Math.max(0,t)); p.style.strokeDashoffset=(p._L*(1-t)).toFixed(1); }); }
  if(!rm && krullen.length){ addEventListener('scroll',krulScroll,{passive:true}); krulScroll(); }

  // Lichtbak voor de galerij
  var lb=document.getElementById('lichtbak'), lbImg=lb.querySelector('img'), lbTxt=lb.querySelector('p');
  function dicht(){ lb.classList.remove('open'); }

  // 3D-kaarten: klik op een zijkaart schuift ernaartoe; de actieve kaart volgt licht de muis; "Bekijk groot" opent de lichtbak
  var kc=document.querySelector('.kc');
  if(kc){
    var rail=kc.querySelector('.kc-rail'), kaarten=[].slice.call(kc.querySelectorAll('.kc-kaart')), podium=kc.querySelector('.kc-podium'),
        teller=kc.querySelector('.kc-teller'), aantal=kaarten.length, nu=0;
    function nn(i){ return (i<9?'0':'')+(i+1); }
    function toon(i){ nu=(i+aantal)%aantal;
      rail.style.transform='translateX(-'+(nu*(100/aantal))+'%)';
      kaarten.forEach(function(k,j){ k.classList.toggle('aan',j===nu); });
      teller.textContent=nn(nu)+' / '+nn(aantal-1); }
    rail.addEventListener('click',function(e){
      var g=e.target.closest('.kc-groot');
      if(g){ var k=kaarten[+g.dataset.groot], im=k.querySelector('img'); lbImg.src=im.src; lbImg.alt=im.alt; lbTxt.textContent=im.alt; lb.classList.add('open'); return; }
      var k2=e.target.closest('.kc-kaart'); if(k2 && +k2.dataset.i!==nu) toon(+k2.dataset.i); });
    if(!rm) kaarten.forEach(function(k){ var x=0,y=0,raf=0;
      k.addEventListener('mousemove',function(e){ var r=k.getBoundingClientRect(); x=e.clientX-(r.left+r.width/2); y=e.clientY-(r.top+r.height/2);
        if(!raf) raf=requestAnimationFrame(function(){ raf=0; k.style.setProperty('--x',x+'px'); k.style.setProperty('--y',y+'px'); }); });
      k.addEventListener('mouseleave',function(){ k.style.setProperty('--x','0px'); k.style.setProperty('--y','0px'); }); });
    kc.querySelector('.kc-vorige').addEventListener('click',function(){ toon(nu-1); });
    kc.querySelector('.kc-volgende').addEventListener('click',function(){ toon(nu+1); });
    podium.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ e.preventDefault(); toon(nu+1); } if(e.key==='ArrowLeft'){ e.preventDefault(); toon(nu-1); } });
    var x0=null; podium.addEventListener('pointerdown',function(e){ x0=e.clientX; });
    podium.addEventListener('pointerup',function(e){ if(x0===null) return; var dx=e.clientX-x0; x0=null; if(dx<-40) toon(nu+1); else if(dx>40) toon(nu-1); });
    toon(0);
  }
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
      <a class="knop lijn" href="contact.html">Contactformulier</a>
    </div>
  </div>
</section>`;
}

function stappenRaster(items, cta, iconen = [], ctaLink = 'contact.html') {
  const stappen = items.map(([kop, tekst], i) => `      <div class="stap">
        <div class="snr klein">${String(i + 1).padStart(2, '0')}</div>${iconen[i] ? `<svg class="sico" aria-hidden="true"><use href="#${iconen[i]}"/></svg>` : ''}
        <h3>${esc(kop)}</h3>
        <p>${esc(tekst)}</p>
      </div>`).join('\n');
  const slot = cta ? `
      <a class="stap stap-cta" href="${ctaLink}">
        <div><svg class="cta-krul" viewBox="0 0 140 100" aria-hidden="true"><path d="M132,10 C104,0 72,8 74,30 C76,50 106,48 102,32 C98,16 64,24 50,46 C41,61 33,76 25,90 M25,90 L22,77 M25,90 L36,83"/></svg>
        <h3>${esc(cta[0])}</h3>
        <p>${esc(cta[1])}</p></div>
        <span class="verder">${esc(cta[2])}</span>
      </a>` : '';
  return `<div class="stappen vier op">\n${stappen}${slot}\n    </div>`;
}


// ---------- contactpagina ----------


// ---------- reviewpagina: alle reviews van Google en Werkspot door elkaar, als muur van kaarten ----------
function reviewsPagina() {
  const MND = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const datumTekst = (r) => {
    const [j, m, dg] = r.datum.split('-');
    if (r.datum_precisie === 'jaar') return j;
    if (!dg) return `${MND[+m - 1]} ${j}`;
    return `${+dg} ${MND[+m - 1]} ${j}`;
  };
  const naamTekst = (r) => {
    if (r.naam === 'Werkspot-gebruiker') return r.plaats ? `Klant uit ${r.plaats}` : 'Klant via Werkspot';
    if (r.naam === 'Klant van OK timmerwerken') return 'Klant via Werkspot';
    return r.naam.replace(/(^|\s)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  };
  const alle = reviewData.reviews;
  const g = reviewData.bronnen.google, w = reviewData.bronnen.werkspot;
  const totaal = g.aantal + w.aantal;
  const gemiddeld = (alle.reduce((s, r) => s + r.score, 0) / alle.length);
  const toon = alle.filter((r) => r.tekst && !r.dubbel_met).sort((a, b) => (a.datum < b.datum ? 1 : -1));
  const logo = (b) => b === 'google'
    ? `<img class="rv-bron g" src="../assets/socials/google-officieel.png" alt="Google">`
    : `<img class="rv-bron" src="../assets/socials/werkspot-officieel.png" alt="Werkspot">`;
  const kaart = (r) => {
    const bronnen = [r.bron].concat(r.ook_op ? [r.ook_op] : []);
    const sub = [r.plaats && r.naam !== 'Werkspot-gebruiker' ? r.plaats : '', r.klus ? r.klus.split(':')[0] : ''].filter(Boolean).join(' · ');
    return `      <article class="rv" data-bron="${bronnen.join(' ')}">
        <span class="rv-quote" aria-hidden="true">“</span>
        <p class="rv-tekst">${esc(r.tekst).replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>')}</p>
        <button type="button" class="rv-meer" hidden>Lees volledig</button>
        ${r.fotos_bij_review ? `<a class="rv-fotos" href="${reviewData.bronnen[r.bron].url}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-camera"/></svg>${r.fotos_bij_review === 1 ? '1 foto' : `${r.fotos_bij_review} foto's`} bekijken op ${r.bron === 'google' ? 'Google' : 'Werkspot'}</a>` : ''}
        <i class="sterscore" style="--pct:${r.score * 20}%" role="img" aria-label="${r.score} van 5 sterren"></i>
        <div class="rv-wie"><b>${esc(naamTekst(r))}</b>${sub ? `<span>${esc(sub)}</span>` : ''}
          <small>${datumTekst(r)} ${bronnen.map(logo).join('')}</small></div>
      </article>`;
  };
  const nl = (x, d = 1) => x.toFixed(d).replace('.', ',');
  const body = `<!-- HERO -->
<section class="p-hero rv-hero">
  <div class="kolommen"></div>
  <div class="wrap">
    <div>
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Reviews</span></div>
      ${oog('Reviews')}
      <h1>${totaal} klanten gingen u <em class="serif">voor</em>.</h1>
      <p class="lead">Alle reviews van Google en Werkspot op één plek, door elkaar en ongefilterd — ook de reviews met vier sterren. Gemiddeld ${nl(gemiddeld)} uit 5.</p>
    </div>
    <div class="rv-scores">
      <a class="rv-score" href="${g.url}" target="_blank" rel="noopener">${logo('google')}<b>${nl(g.score)}</b><i class="sterscore" style="--pct:${g.score * 20}%" aria-hidden="true"></i><span>${g.aantal} reviews op Google</span></a>
      <a class="rv-score" href="${w.url}" target="_blank" rel="noopener">${logo('werkspot')}<b>${nl(w.score)}</b><i class="sterscore" style="--pct:${w.score * 20}%" aria-hidden="true"></i><span>${w.aantal} reviews op Werkspot</span></a>
    </div>
  </div>
</section>

<!-- ALLE REVIEWS -->
<section class="fris" id="alle">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="rv-filter" role="group" aria-label="Filter op platform">
      <button type="button" class="aan" data-f="alle">Alle <span>${toon.length}</span></button>
      <button type="button" data-f="google">Google <span>${toon.filter((r) => r.bron === 'google' || r.ook_op === 'google').length}</span></button>
      <button type="button" data-f="werkspot">Werkspot <span>${toon.filter((r) => r.bron === 'werkspot').length}</span></button>
    </div>
    <div class="rv-muur">
${toon.map(kaart).join('\n')}
    </div>
    <p class="rv-noot">Reviews zoals geplaatst op Google en Werkspot; reviews die op beide staan tonen we één keer. Reviews met alleen sterren en geen tekst tellen mee in de totalen. Bekijk ze ook zelf op <a href="${g.url}" target="_blank" rel="noopener">Google</a> en <a href="${w.url}" target="_blank" rel="noopener">Werkspot</a>.</p>
  </div>
</section>

${oproep()}
`;
  return pagina({
    titel: 'Reviews — OK Timmerwerken Gorinchem',
    omschrijving: `${totaal} reviews op Google en Werkspot, gemiddeld ${nl(gemiddeld)} uit 5. Lees wat klanten over OK Timmerwerken in Gorinchem zeggen.`,
    body,
  }).replace('</head>', `<style>
/* reviewpagina */
.rv-hero .wrap{align-items:end}
.rv-scores{display:grid;gap:14px;justify-self:end;width:min(100%,380px)}
.rv-score{display:grid;grid-template-columns:auto 1fr;grid-template-areas:'logo cijfer' 'logo sterren' 'logo tekst';column-gap:16px;align-items:center;
  background:#14130f;border:1px solid #14130f;border-radius:16px;padding:18px 22px;color:#fff;transition:transform .3s var(--ease),box-shadow .3s;
  box-shadow:0 30px 60px -40px rgba(20,19,15,.55)}   /* zwart, zoals het scoreblok op home */
.rv-score:hover{transform:translateY(-2px);box-shadow:0 24px 46px -26px rgba(20,19,15,.6)}
.rv-score .rv-bron{grid-area:logo;width:46px;height:46px}
.rv-score .rv-bron.g{padding:7px;box-shadow:none}
.rv-score .sterscore{--ster-leeg:rgba(255,255,255,.22)}
.rv-score b{grid-area:cijfer;font-size:34px;font-weight:300;line-height:1}
.rv-score .sterscore{grid-area:sterren;margin-top:4px}
.rv-score span{grid-area:tekst;font-size:13px;color:rgba(255,255,255,.7);margin-top:4px}
.rv-bron{width:18px;height:18px;border-radius:50%;object-fit:contain;vertical-align:-4px;margin-left:4px}
.rv-bron.g{background:#fff;padding:2px;box-shadow:0 0 0 1px var(--rand)}
.rv-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:34px}
.rv-filter button{border:1px solid var(--rand);background:#fff;border-radius:999px;padding:9px 16px;font:600 13.5px var(--f,inherit);cursor:pointer;color:var(--inkt)}
.rv-filter button span{color:var(--zacht);font-weight:500;margin-left:4px}
.rv-filter button.aan{background:var(--inkt);border-color:var(--inkt);color:#fff}
.rv-filter button.aan span{color:rgba(255,255,255,.7)}
/* muur: kolommen tussen de verticale lijnen */
.rv-muur{columns:4 250px;column-gap:18px}
.rv{break-inside:avoid;margin:0 0 18px;background:#fff;border-radius:16px;padding:30px 26px 26px;text-align:center;
  box-shadow:0 30px 60px -44px rgba(20,19,15,.4);display:flex;flex-direction:column;align-items:center}
.rv[hidden]{display:none}
.rv-quote{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#f2ebdf;color:var(--brons);
  font-family:var(--serif);font-size:44px;line-height:1;padding-top:14px;margin-bottom:18px}
.rv-tekst{font-size:15.5px;line-height:1.6;color:#2b2925;font-weight:400}
.rv.kort .rv-tekst{display:-webkit-box;-webkit-line-clamp:9;-webkit-box-orient:vertical;overflow:hidden}
.rv-meer{margin-top:10px;border:0;background:none;color:var(--brons);font:600 13px var(--f,inherit);cursor:pointer}
.rv-meer::after{content:' ›'}
/* foto's bij de review: niet overgenomen (geen gebruiksrecht), wel een link naar de bron */
.rv-fotos{display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:6px 12px 6px 10px;border:1px solid var(--rand);border-radius:9999px;font-size:12.5px;font-weight:600;color:var(--inkt);transition:background .25s,border-color .25s}
.rv-fotos svg{width:16px;height:16px;color:var(--brons)}
.rv-fotos:hover{background:#f5f1ea;border-color:var(--brons)}
.rv .sterscore{margin:18px auto 0}
.rv-wie{margin-top:18px;padding-top:16px;border-top:1px solid var(--rand);width:100%}
.rv-wie b{display:block;font-size:16px;font-weight:600}
.rv-wie span{display:block;font-size:13px;color:var(--zacht);margin-top:3px}
.rv-wie small{display:block;font-size:12.5px;color:var(--zacht);margin-top:6px}
.rv-noot{margin-top:30px;font-size:13px;color:var(--zacht);max-width:70ch}
.rv-noot a{text-decoration:underline}
@media(max-width:820px){.rv-scores{justify-self:start}}
</style>
</head>`).replace('</body>', `<script>
(function(){
  // lange reviews inkorten met "Lees volledig"
  [].forEach.call(document.querySelectorAll('.rv'),function(k){ var p=k.querySelector('.rv-tekst'), b=k.querySelector('.rv-meer');
    k.classList.add('kort'); if(p.scrollHeight>p.clientHeight+4){ b.hidden=false; b.addEventListener('click',function(){ var open=k.classList.toggle('kort'); b.textContent=open?'Lees volledig':'Minder tonen'; }); } else k.classList.remove('kort'); });
  // filter op platform
  var f=document.querySelector('.rv-filter');
  f.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    [].forEach.call(f.children,function(x){ x.classList.toggle('aan',x===b); });
    [].forEach.call(document.querySelectorAll('.rv'),function(k){ k.hidden=b.dataset.f!=='alle' && k.dataset.bron.indexOf(b.dataset.f)<0; }); });
})();
</script>
</body>`);
}

// ---------- dienstpagina ----------
function dienstPagina(d, alle) {
  const n = d.galerij.length, nn = (i) => String(i).padStart(2, '0');
  const kaarten = d.galerij.map(([src, bijschrift], i) => `          <div class="kc-persp"><li class="kc-kaart${i ? '' : ' aan'}" data-i="${i}">
            <div class="kc-vlak"><img src="${src}" alt="${esc(bijschrift)}"${i > 2 ? ' loading="lazy"' : ''}></div>
            <div class="kc-tekst"><span class="kc-nr">${nn(i + 1)}</span><h3>${esc(bijschrift)}</h3><button type="button" class="kc-groot" data-groot="${i}">Bekijk groot</button></div>
          </li></div>`).join('\n');
  const pijl = (r) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${r ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 6l-6 6 6 6'}"/></svg>`;
  const galerij = `    <div class="kc op">
      <div class="kc-podium" tabindex="0" aria-roledescription="carrousel" aria-label="Foto's van uitgevoerd werk">
        <ul class="kc-rail">
${kaarten}
        </ul>
      </div>
      <div class="kc-bediening">
        <button type="button" class="kc-pijl kc-vorige" aria-label="Vorige foto">${pijl(false)}</button>
        <span class="kc-teller" aria-live="polite">01 / ${nn(n)}</span>
        <button type="button" class="kc-pijl kc-volgende" aria-label="Volgende foto">${pijl(true)}</button>
      </div>
    </div>`;
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
        <a class="knop" href="contact.html">Vraag vrijblijvend advies</a>
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
      <p class="lead">Foto's van klussen die Ozcan en zijn ploeg hebben uitgevoerd. Klik op een foto aan de zijkant om ernaartoe te gaan, of op <em>Bekijk groot</em>.</p>
    </div>
${galerij}
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
    ${stappenRaster(d.aanpak, ['Klaar voor stap 1?', 'Bel, app of mail Ozcan. Binnen een dag hoort u van ons.', 'Plan een afspraak'], d.aanpak_iconen)}
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
  // uitgelichte review: Kevin (Google) gaat over Ozcan zelf — afspraken, eerlijk, meedenken
  const uit = reviewData.reviews.find((r) => r.bron === 'google' && r.naam === 'Kevin' && r.tekst);
  if (!uit) throw new Error('uitgelichte review (Kevin, Google) niet gevonden in docs/reviews.json');
  const maanden = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const totaalReviews = reviewData.bronnen.google.aantal + reviewData.bronnen.werkspot.aantal;
  const metScore = reviewData.reviews;
  const nlScore = (metScore.reduce((t, r) => t + r.score, 0) / metScore.length).toFixed(1).replace('.', ',');
  const body = `<!-- HERO -->
<section class="p-hero">
  <div class="kolommen"></div>
  <svg class="krul krul-over" viewBox="0 0 560 230" aria-hidden="true"><path d="M548,8 C470,-2 396,30 408,84 C419,132 484,124 474,86 C464,48 384,52 330,104 C276,156 162,198 34,212 M34,212 L49,202 M34,212 L49,222"/></svg>
  <div class="wrap">
    <div>
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Over ons</span></div>
      ${oog('Over ons')}
      <h1>${esc(o.kop)}</h1>
      <p class="lead">${esc(o.intro)}</p>
      <div class="acties">
        <a class="knop" href="contact.html">Maak kennis met Ozcan</a>
        <a class="knop lijn" href="d-lijn.html#diensten">Bekijk de diensten</a>
      </div>
      <div class="feiten">
        <div><b data-tel data-sinds="2011" data-naar="15">15</b><span>jaar vakwerk,<br>sinds 2011</span></div>
        <div><b data-tel data-naar="500" data-na="+">500+</b><span>projecten<br>opgeleverd</span></div>
      </div>
      <a class="erkend" href="dienst-dakramen.html"><img src="../assets/web/velux-montagepartner.jpg" alt="VELUX Montagepartner">Erkend VELUX Montagepartner — getraind en gecertificeerd door VELUX</a>
    </div>
    <div class="portret-blok">
      <img src="../assets/render/portret/web/ozcan-bovenlijf.webp" alt="Ozcan, eigenaar van OK Timmerwerken" width="1600" height="1550">
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
      <div><p>${esc(o.verhaal[0])}</p>
        <svg class="skyline" viewBox="0 0 600 136" role="img" aria-label="Lijntekening van Gorinchem: Merwedebrug, Grote Kerk, trapgevels, Dalempoort, kanon op de vestingwal en molen De Hoop"><path pathLength="1" style="--d:0.00s" d="M0 118 H172 M6 118 Q46 80 86 118 M22 105.8 V118 M34 100.7 V118 M46 99.0 V118 M58 100.7 V118 M70 105.8 V118 M86 118 Q126 80 166 118 M102 105.8 V118 M114 100.7 V118 M126 99.0 V118 M138 100.7 V118 M150 105.8 V118 M6 118 V130 M166 118 V130 M86 118 V130"/><path pathLength="1" style="--d:0.18s" d="M205 130 V40 H235 V130 M205 70 H235 M205 52 H235 M216 64 V58 M224 64 V58 M216 96 V84 M224 96 V84 M209 40 V30 H231 V40 M213 30 L220 6 L227 30"/><path pathLength="1" style="--d:0.36s" d="M235 130 V96 L275 80 L315 96 V130 M252 122 V108 M268 122 V108 M284 122 V108 M300 122 V108"/><path pathLength="1" style="--d:0.54s" d="M330 130 V92 H336 V84 H342 V76 H348 V68 H362 V76 H368 V84 H374 V92 H380 V130 M349 88 H361 V100 H349 Z M343 112 H353 V130 M359 112 H369 V122 H359 Z"/><path pathLength="1" style="--d:0.72s" d="M395 130 V88 H455 V130 M415 130 V112 Q425 100 435 112 V130 M391 88 L425 70 L459 88 M421 74 V62 H429 V74 M419 62 L425 54 L431 62"/><path pathLength="1" style="--d:0.90s" d="M465 130 L471 116 H521 L527 130 M480 111 L513 103 M481 115 L514 107 M513 103 L514 107 M486 116 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"/><path pathLength="1" style="--d:1.08s" d="M549 130 L556 76 H574 L581 130 M541 101 H589 M562 130 V118 Q565 113 568 118 V130 M554 76 Q565 64 576 76 M565 71 L541 47 M565 71 L589 47 M565 71 L541 95 M565 71 L589 95 M545 51 L551 45 M585 51 L579 45"/><path pathLength="1" style="--d:1.26s" d="M0 130 H600"/></svg></div>
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
    ${stappenRaster(o.waarden, ['Kennismaken?', 'Ozcan komt graag langs om uw plannen te bespreken — gratis en vrijblijvend.', 'Plan een afspraak'], ['i-persoon', 'i-ploeg', 'i-afspraak'])}
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
    <figure class="uitgelicht op">
      <span class="uit-quote" aria-hidden="true">“</span>
      <blockquote>${esc(uit.tekst)}</blockquote>
      <figcaption><i class="sterscore" style="--pct:${uit.score * 20}%" role="img" aria-label="${uit.score} van 5 sterren"></i>
        <span><img class="uit-bron" src="../assets/socials/google-officieel.png" alt="Google"><b>${esc(uit.naam)}</b> · Google-review, ${maanden[+uit.datum.slice(5, 7) - 1]} ${uit.datum.slice(0, 4)}</span></figcaption>
    </figure>
    <div class="uit-voet op"><span>Gemiddeld <b>${nlScore}</b> uit ${totaalReviews} reviews op Google en Werkspot</span><a class="pil" href="reviews.html">Lees alle reviews</a></div>
  </div>
</section>

${oproep()}`;
  return pagina({
    titel: 'Over ons — OK Timmerwerken Gorinchem',
    omschrijving: o.intro.slice(0, 155),
    body,
  }).replace('</head>', `<style>
/* Over ons: één uitgelichte review over Ozcan zelf (de drie kaarten staan al op home) */
.uitgelicht{position:relative;max-width:880px;margin:0 auto;padding:clamp(34px,5vw,56px) clamp(24px,5vw,64px);background:#fff;
  border:1px solid var(--rand);border-radius:20px;box-shadow:0 46px 80px -56px rgba(20,19,15,.38)}
.uit-quote{position:absolute;top:-30px;left:clamp(24px,5vw,64px);font-family:var(--serif);font-size:110px;line-height:1;color:var(--brons)}
.uitgelicht blockquote{margin:0;font-family:var(--serif);font-style:italic;font-size:clamp(22px,2.4vw,30px);line-height:1.35;color:var(--inkt)}
.uitgelicht figcaption{margin-top:26px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;font-size:14px;color:var(--zacht)}
.uitgelicht figcaption .sterscore{margin:0}
.uitgelicht figcaption span{display:inline-flex;align-items:center;gap:8px}
.uitgelicht figcaption b{color:var(--inkt);font-weight:600}
.uit-bron{width:22px;height:22px;border-radius:50%;background:#fff;padding:2px;box-shadow:0 0 0 1px var(--rand)}
.uit-voet{max-width:880px;margin:26px auto 0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;font-size:14px;color:var(--zacht)}
.uit-voet b{color:var(--inkt)}
</style>
</head>`);
}

// ---------- contactpagina: kop + twee gelijke kaarten (direct contact | formulier) ----------
function contactPagina() {
  const formHtml = contactRaster.slice(contactRaster.indexOf('<form'), contactRaster.indexOf('</form>') + 7);
  const body = `<section class="p-hero c2-hero" id="contact">
  <div class="kolommen"></div>
  <div class="wrap c2-wrap">
    <div class="c2-kop">
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Contact</span></div>
      ${oog('Contact')}
      <h1>Vertel ons wat u van <em class="serif">plan</em> bent.</h1>
      <p class="lead">Een vloer, een vliering, een carport of een complete verbouwing: Ozcan denkt graag met u mee. U hoort meestal binnen een dag van ons.</p>
    </div>
    <div class="c2-kaarten">
      <!-- links: direct contact (donkere kaart, zelfde beeldtaal als de 'Kennismaken?'-kaart) -->
      <div class="c2-direct">
        <div class="c2-wie">
          <div class="c2-avatar"><img src="../assets/render/portret/web/ozcan-bovenlijf.webp" alt="Ozcan, eigenaar van OK Timmerwerken"></div>
          <div><b>Ozcan</b><span>eigenaar van OK Timmerwerken</span></div>
        </div>
        <p class="c2-citaat">U belt met Ozcan, niet met een kantoor. Hij komt kijken, maakt de offerte en staat zelf op de bouw.</p>
        <div class="c2-acties">
          <a class="knop c2-bel" href="tel:+31641429106">Bel 06 41 42 91 06</a>
          <a class="knop wa-knop" href="https://wa.me/31641429106" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>
          <a class="knop c2-mail" href="mailto:info@ok-timmerwerken.nl">Mail</a>
        </div>
        <div class="c2-info">
          <div><div class="lbl">E-mail</div><a href="mailto:info@ok-timmerwerken.nl">info@ok-timmerwerken.nl</a>
            <div class="lbl">Werkgebied</div><p>Gorinchem en regio Zuid-Holland</p></div>
          <div><div class="lbl">Werktijden</div>
            <div class="tijden"><span>Ma – vr</span><span>07:00 – 20:00</span><span>Zaterdag</span><span>07:00 – 16:00</span><span>Zondag</span><span>Gesloten</span></div>
            <div class="nu-open" hidden><i></i><span></span></div></div>
        </div>
      </div>
      <!-- rechts: het formulier -->
      <div class="c2-form contact-grid">
        <div class="c-formkop"><h2>Stuur een aanvraag</h2><p>Vrijblijvend. Heeft u foto's of maten? Stuur ze gerust via <a href="https://wa.me/31641429106" target="_blank" rel="noopener">WhatsApp</a>.</p></div>
        ${formHtml}
      </div>
    </div>
  </div>
</section>

<section class="creme">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Zo gaat het verder')}
      <h2>Na uw bericht, in drie <em class="serif">stappen</em>.</h2>
    </div>
    ${stappenRaster([
      ['We komen langs', 'Gratis en vrijblijvend. We bekijken de situatie ter plaatse, denken mee over wat mogelijk is en zeggen eerlijk wanneer iets geen goed idee is.'],
      ['U krijgt een duidelijke offerte', 'Vaste prijs, heldere omschrijving van het werk en de materialen, en een realistische planning. Wat erin staat, is wat u betaalt.'],
      ['We leveren netjes op', 'Op de afgesproken dag, met een opgeruimde werkplek en garantie op het werk. Is er achteraf iets, dan komen we terug.'],
    ], ['Liever direct bellen?', 'Bel of app Ozcan. Binnen een dag hoort u van ons.', 'Bel 06 41 42 91 06'], ['i-bezoek', 'i-offerte', 'i-opgeleverd'], 'tel:+31641429106')}
  </div>
</section>
`;
  return pagina({ titel: 'Contact — OK Timmerwerken Gorinchem', omschrijving: 'Neem contact op met OK Timmerwerken in Gorinchem: bel, app of stuur een vrijblijvende aanvraag. Ma–vr 07:00–20:00, za 07:00–16:00.', body }).replace('</head>', `<style>
/* de werktijden staan al in de kaart, dus niet nog eens in de footer */
.foot-tijden-kol{display:none}
@media(min-width:761px){.foot-grid{grid-template-columns:1.6fr 1fr 1fr}}
.c2-hero{padding:36px 0 84px}
.c2-wrap{display:block!important}
.c2-kop{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;align-items:end}   /* kop links, korte tekst rechts: zo staat het formulier eerder in beeld */
.c2-kop .kruimel,.c2-kop .oog{grid-column:1 / -1}
.c2-kop .kruimel{margin-bottom:28px}.c2-kop .oog{margin-bottom:40px}   /* compacter dan de andere hero's: hier draait het om het formulier */
.c2-kop h1{font-size:clamp(36px,4.6vw,62px)}
.c2-kop .lead{margin:0;padding-left:34px;max-width:46ch}
.c2-kaarten{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:34px;align-items:stretch}
/* links: donker */
.c2-direct{background:#14130f;color:#fff;border-radius:20px;padding:34px 34px 30px;display:flex;flex-direction:column;
  box-shadow:0 40px 80px -50px rgba(20,19,15,.55)}
.c2-wie{display:flex;align-items:center;gap:16px}
.c2-avatar{width:84px;height:84px;flex:none;border-radius:50%;overflow:hidden;background:#f2ebdf}
.c2-avatar img{width:100%;height:100%;object-fit:cover;object-position:50% 10%;transform:scale(1.25);transform-origin:50% 0}
.c2-wie b{display:block;font-size:22px;font-weight:700;letter-spacing:-.02em}
.c2-wie span{font-size:13px;color:rgba(255,255,255,.6)}
.c2-citaat{margin-top:22px;font-family:var(--serif);font-style:italic;font-size:21px;line-height:1.35;color:rgba(255,255,255,.92)}
.c2-acties{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.c2-acties .knop{padding:12px 20px;font-size:14px}
.c2-bel{background:#fff;color:#14130f;border-color:#fff}.c2-bel:hover{background:transparent;color:#fff}
.c2-mail{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)}.c2-mail:hover{background:#fff;color:#14130f}
.c2-info{margin-top:auto;padding-top:26px;border-top:1px solid rgba(255,255,255,.14);display:grid;grid-template-columns:1fr 1fr;gap:6px 28px}
.c2-direct .c2-info{margin-top:28px}
.c2-info .lbl{color:rgba(255,255,255,.5);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;margin:0 0 6px}
.c2-info .lbl ~ .lbl{margin-top:16px}
.c2-info a,.c2-info p{color:#fff;font-size:14.5px;display:block}
.c2-info .tijden{display:grid;grid-template-columns:auto auto;gap:3px 14px;font-size:14px;width:fit-content}
.c2-info .tijden span:nth-child(even){color:rgba(255,255,255,.6)}
.c2-direct .nu-open{color:#fff;font-size:13.5px;margin-top:12px}
.c2-direct .nu-open.dicht i{background:rgba(255,255,255,.4)}
/* rechts: wit formulier */
.c2-form{display:block!important;margin-top:0!important;background:#fff;border:1px solid var(--rand);border-radius:20px;padding:34px 34px 30px;
  box-shadow:0 40px 80px -50px rgba(20,19,15,.45)}
.c-formkop h2{font-size:24px;font-weight:700;letter-spacing:-.02em}
.c-formkop p{margin:6px 0 20px;font-size:14px;color:var(--zacht)}
.c-formkop p a{color:var(--inkt);text-decoration:underline;text-underline-offset:2px}
.c2-form textarea{min-height:120px}
@media(max-width:900px){.c2-kaarten,.c2-kop{grid-template-columns:1fr}.c2-kop .lead{padding-left:0;margin-top:16px}.c2-form{order:-1}}
@media(max-width:520px){.c2-direct,.c2-form{padding:26px 22px}.c2-info{grid-template-columns:1fr}.c2-info > div + div .lbl{margin-top:16px}}
</style>
</head>`);
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
// contactpagina
fs.writeFileSync(path.join(uit, 'contact.html'), contactPagina());
geschreven.push('contact.html');
// reviewpagina
fs.writeFileSync(path.join(uit, 'reviews.html'), reviewsPagina());
geschreven.push('reviews.html');
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
  h = h.replace(/href="contact\.html"/g, `href="${pre}contact/"`);
  h = h.replace(/href="reviews\.html"/g, `href="${pre}reviews/"`);
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
schrijf('contact/index.html', herschrijf(fs.readFileSync(path.join(uit, 'contact.html'), 'utf8'), '../'));
schrijf('reviews/index.html', herschrijf(fs.readFileSync(path.join(uit, 'reviews.html'), 'utf8'), '../'));
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
