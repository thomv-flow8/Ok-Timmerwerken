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
const stijl = tussen(hoofd.slice(hoofd.indexOf('<!-- fonts]] -->')), '<style>', '</style>');   // hoofdstijl staat ná het lettertypeblok
const fonts = tussen(hoofd, '<!-- [[fonts', '<!-- fonts]] -->');
const kopdeel = tussen(hoofd, '<!-- iconenset', '<main id="inhoud">', false).replace(/\n<!--[^\n]*-->\s*$/, '\n');
const footer = tussen(hoofd, '<footer', '</footer>');
const dock = tussen(hoofd, '<div class="dock">', '</div>');
// het contactraster (formulier + gegevens) staat alleen op de contactpagina; hier is de bron
const contactRaster = `<div class="contact-grid">
      <form id="aanvraag">
        <label for="c-naam">Naam</label>
        <input id="c-naam" name="naam" type="text" autocomplete="name" enterkeyhint="next" placeholder="Uw naam" required>
        <div class="veld-rij">
          <div><label for="c-mail">E-mailadres</label>
          <input id="c-mail" name="email" type="email" autocomplete="email" enterkeyhint="next" placeholder="naam@voorbeeld.nl" required></div>
          <div><label for="c-tel">Telefoonnummer</label>
          <input id="c-tel" name="telefoon" type="tel" autocomplete="tel" enterkeyhint="next" placeholder="06 ..."></div>
        </div>
        <label for="c-ber">Waar kunnen we mee helpen?</label>
        <textarea id="c-ber" name="bericht" placeholder="Bijvoorbeeld: gevlinderde betonvloer van 30 m² in de garage" required></textarea>
        <button class="veld-knop" type="submit">Verstuur aanvraag</button>
        <p class="form-privacy">We gebruiken uw gegevens alleen om uw aanvraag te beantwoorden. Lees meer in de <a href="privacy.html">privacyverklaring</a>. Op onze offertes zijn onze <a href="voorwaarden.html">algemene voorwaarden</a> van toepassing.</p>
        <p class="form-melding" role="status" hidden>Dit formulier is nog in de testfase en verstuurt nog niets. Bel of app Ozcan op <a href="tel:+31641429106">06 41 42 91 06</a> of mail naar <a href="mailto:info@ok-timmerwerken.nl">info@ok-timmerwerken.nl</a>.</p>
      </form>
      <div class="contact-info">
        <div class="lbl">Direct contact</div>
        <a href="tel:+31641429106">06 41 42 91 06</a>
        <a href="mailto:info@ok-timmerwerken.nl">info@ok-timmerwerken.nl</a>
        <div class="lbl">Werkgebied</div>
        <a href="#" style="pointer-events:none">Vanuit Gorinchem, door heel Nederland</a>
        <div class="lbl">Werktijden</div>
        <div class="tijden"><span>Maandag – vrijdag</span><span>07:00 – 18:00</span><span>Zaterdag</span><span>07:00 – 15:00</span><span>Zondag</span><span>Gesloten</span></div>
        <div class="nu-open" hidden><i></i><span></span></div>
        <div class="lbl">Erkenning</div>
        <a class="erkend" href="dienst-dakramen.html"><img src="../assets/velux/velux-montagepartner.webp" alt="">Erkend VELUX Montagepartner</a>
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
.d-hero .wrap{grid-template-columns:minmax(0,1fr) calc(100% - min(var(--max),94vw) / 2);gap:clamp(40px,4.5vw,64px)}   /* dienstfoto van de middelste tot de buitenste kolomlijn, links en rechts even veel witruimte (zoals op home); kleinere tussenruimte zodat de introtekst niet langer wordt */
.p-hero .oog,.oproep .oog{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--zacht)}
.kruimel{display:flex;gap:8px;font-size:13px;color:var(--zacht);margin-bottom:clamp(36px,5vw,64px)}
.kruimel a:hover{color:var(--inkt)}
.p-hero h1{font-size:clamp(40px,6.2vw,82px);font-weight:700;letter-spacing:-.04em;line-height:.98}
.p-hero .lead{margin-top:26px;max-width:50ch;color:var(--zacht);font-weight:400;font-size:17.5px;line-height:1.7}
.p-hero .acties{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
.p-hero .knop{padding:13px 24px;font-size:14px}
.p-hero .knop.lijn{background:transparent;color:var(--inkt);border-color:var(--inkt)}
.sfeer-band{padding:clamp(56px,8vw,110px) 0 0}
.sfeer-beeld{width:min(var(--max),94vw);margin:0 0 0 calc(50% - min(var(--max),94vw) / 2)}   /* sfeerbeeld precies tussen de buitenste kolomlijnen */
.sfeer-beeld img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;object-position:50% 62%;border-radius:2px;box-shadow:0 50px 90px -40px rgba(20,19,15,.45)}
.vn-band{padding:clamp(56px,8vw,110px) 0 0}
.vn-grid{display:grid;grid-template-columns:calc(100% - min(var(--max),94vw) / 2) minmax(0,1fr);gap:clamp(40px,4.5vw,64px);align-items:center}   /* schuifbalk van de buitenste tot de middelste kolomlijn, gespiegeld t.o.v. de foto bovenaan */
.vn-grid .oog{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--zacht);margin-bottom:28px}
.vn-grid h2{font-size:clamp(32px,4vw,50px);font-weight:700;letter-spacing:-.03em;line-height:1.02}
.vn-grid .lead{margin-top:20px;color:var(--zacht);font-weight:400;font-size:16px;line-height:1.7}
.vn-hint{display:flex;align-items:center;gap:10px;margin-top:26px;font-size:13px;font-weight:600;color:var(--zacht)}
.vn-hint svg{width:22px;height:22px;flex:none}
.vn{position:relative;overflow:hidden;border-radius:2px;cursor:ew-resize;touch-action:pan-y;user-select:none;-webkit-user-select:none;outline:none;
  box-shadow:0 50px 90px -40px rgba(20,19,15,.45),0 18px 36px -24px rgba(20,19,15,.25)}
.vn:focus-visible{box-shadow:0 0 0 3px var(--vlak),0 0 0 5px var(--inkt)}
.vn img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none}
.vn-voor{position:absolute;inset:0;z-index:2;clip-path:inset(0 calc(100% - var(--pos,50%)) 0 0)}
.vn-greep{position:absolute;z-index:3;top:0;bottom:0;left:var(--pos,50%);width:2px;margin-left:-1px;background:#fff}
.vn-greep::after{content:'';position:absolute;top:50%;left:50%;width:40px;height:40px;margin:-20px 0 0 -20px;
  border-radius:50%;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.25);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2314130f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 6l-5 6 5 6M15 6l5 6-5 6'/%3E%3C/svg%3E");
  background-size:20px;background-repeat:no-repeat;background-position:center}
.vn-l{position:absolute;z-index:4;top:5%;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:#fff;background:rgba(20,19,15,.55);backdrop-filter:blur(6px);padding:5px 10px;border-radius:999px}
.vn-l.l{left:4%}.vn-l.r{right:4%}
.vn-bij{margin-top:14px;font-size:13.5px;color:var(--zacht)}
@media(min-width:821px){.vn-grid > figure{order:-1}}   /* gespiegeld t.o.v. de hero: schuifbalk links, tekst rechts (zigzag); op de telefoon tekst eerst */
@media(max-width:820px){.vn-grid{grid-template-columns:1fr;gap:28px}}
.sfeer-beeld figcaption{margin-top:14px;font-size:13.5px;color:var(--zacht)}
@media(max-width:820px){.sfeer-beeld img{aspect-ratio:4/3}}
.p-beeld{position:relative;aspect-ratio:1/1;background:var(--bg);overflow:hidden;border-radius:2px;
  box-shadow:0 50px 90px -40px rgba(20,19,15,.45),0 18px 36px -24px rgba(20,19,15,.25)}
.p-beeld img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.p-keurmerk{display:flex;align-items:center;gap:16px;margin-top:22px}   /* dakramen: VELUX + Getraind 2025 onder de foto, even hoog */
.p-keurmerk img{height:42px;width:auto;border-radius:5px;flex:none}
.p-keurmerk img+img{height:60px}   /* smalle sticker iets hoger dan het brede woordmerk: visueel even zwaar */
.p-keurmerk span{font-size:13.5px;font-weight:600;line-height:1.35;color:var(--zacht)}
.p-beeld img.p-logo{inset:auto;left:7%;bottom:7%;z-index:2;width:clamp(68px,17%,100px);height:auto;object-fit:contain;border-radius:8px;box-shadow:0 14px 30px -12px rgba(0,0,0,.5)}   /* dakramen: officieel VELUX-logo op de foto, zoals op home */
.p-beeld .tag{position:absolute;left:7%;bottom:7%;font-family:var(--serif);font-style:italic;font-size:19px;
  background:#fff;color:#14130f;padding:6px 18px;border-radius:999px;transform:rotate(-4deg)}
.portret-blok{position:relative;display:flex;align-items:flex-end;justify-content:center;background:transparent}
.portret-blok img{position:relative;z-index:1;width:100%;max-width:520px;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 18%;display:block;border-radius:22px}   /* echte foto van Ozcan, in een afgeronde lijst */
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

/* galerij: grote foto in zijn geheel, pijlen, teller en miniaturen eronder */
.vg-label{position:absolute;z-index:3;left:6%;top:6%;padding:6px 13px;border-radius:999px;font:700 11.5px var(--f,inherit);letter-spacing:.14em;text-transform:uppercase;box-shadow:0 6px 18px -8px rgba(0,0,0,.45)}
.vg-label.voor{background:rgba(255,255,255,.94);color:var(--inkt)}
.vg-label.na{background:var(--inkt);color:#fff}
.vg{margin-top:46px;max-width:1040px;margin-inline:auto}
.vg-podium{position:relative;aspect-ratio:3/2;max-height:62vh;width:100%;background:#f1ede6;border-radius:18px;overflow:hidden;outline:none}
.vg-podium:focus-visible{box-shadow:0 0 0 3px var(--brons)}
.vg-dia{position:absolute;inset:0;margin:0;opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s}
.vg-dia.aan{opacity:1;visibility:visible}
.vg-dia:not(.aan):not(.buur){display:none}   /* verre dia's laden pas als je erheen bladert */
.vg-dia img,.vg-dia video{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:contain;display:block}   /* altijd de hele foto, staand of liggend */
.vg-dia .vg-label{left:20px;top:20px}
.vg-pijl,.vg-groot{position:absolute;z-index:4;border:0;cursor:pointer;display:grid;place-items:center;background:#fff;color:var(--inkt);
  box-shadow:0 6px 18px -8px rgba(20,19,15,.45);transition:transform .2s,background .2s,color .2s}
.vg-pijl{top:50%;width:50px;height:50px;border-radius:50%;transform:translateY(-50%)}
.vg-pijl svg,.vg-groot svg{width:20px;height:20px}
.vg-vorige{left:18px} .vg-volgende{right:18px}
.vg-pijl:hover,.vg-groot:hover{background:var(--brons);color:#fff}
.vg-groot{right:18px;top:18px;width:42px;height:42px;border-radius:50%}
.vg-teller{position:absolute;z-index:4;right:18px;bottom:18px;background:#fff;border-radius:999px;padding:6px 13px;font:600 13px var(--f,inherit);font-variant-numeric:tabular-nums;box-shadow:0 6px 18px -8px rgba(20,19,15,.45)}
.vg-bij{margin:16px 2px 0;font-weight:600;font-size:clamp(17px,1.8vw,20px);letter-spacing:-.01em;min-height:1.4em}
.vg-duimen{display:flex;gap:10px;margin-top:16px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x proximity;scrollbar-width:thin}
.vg-duim{position:relative;flex:none;width:96px;height:96px;padding:0;border:2px solid transparent;border-radius:12px;overflow:hidden;cursor:pointer;background:#f1ede6;scroll-snap-align:start;transition:border-color .2s,opacity .2s;opacity:.72}
.vg-duim img{width:100%;height:100%;object-fit:cover;display:block}
.vg-duim:hover{opacity:1}
.vg-duim.aan{border-color:var(--inkt);opacity:1}
.vg-play{position:absolute;inset:0;display:grid;place-items:center}
.vg-play svg{width:26px;height:26px;fill:#fff;filter:drop-shadow(0 1px 4px rgba(0,0,0,.6))}
.vg-fase{position:absolute;left:5px;bottom:5px;font:700 11px var(--f,inherit);letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:999px}
.vg-fase.voor{background:rgba(255,255,255,.94);color:var(--inkt)} .vg-fase.na{background:var(--inkt);color:#fff}
@media(max-width:760px){.vg-podium{aspect-ratio:4/5;border-radius:14px}.vg-pijl{width:42px;height:42px}.vg-vorige{left:10px}.vg-volgende{right:10px}.vg-duim{width:72px;height:72px}}
.lichtbak{position:fixed;inset:0;z-index:95;background:rgba(10,10,8,.92);display:grid;place-items:center;padding:24px;
  opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s}
.lichtbak.open{opacity:1;visibility:visible;transition:opacity .3s}
.lichtbak img,.lichtbak video{max-width:min(1200px,92vw);max-height:80vh;object-fit:contain;border-radius:6px}
.lichtbak [hidden]{display:none}
.lichtbak p{color:rgba(255,255,255,.8);font-size:14px;margin-top:14px;text-align:center}
.lichtbak button{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:20px;cursor:pointer}

.download{display:inline-flex;align-items:center;gap:12px;margin-top:34px;padding:14px 22px;border-radius:999px;
  background:#14130f;color:#fff;font-weight:600;font-size:14px}
.download::before{content:'↓';color:var(--brons);font-size:16px}
.auteur{display:flex;align-items:center;gap:10px;margin-top:20px;font-size:13.5px;color:var(--zacht)}
.auteur img{width:36px;height:36px;border-radius:50%;flex:none;background:#f2ebdf}
.auteur a{color:var(--inkt);font-weight:600;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}
.p-hero .erkend{display:flex;color:var(--inkt);align-items:center;gap:14px;margin-top:30px;font-size:14px;font-weight:600}
.p-hero .erkend img{width:64px;height:64px;border-radius:6px}

.krul-over{top:auto;bottom:8px;right:9%;width:min(44vw,560px)}   /* van onder het portret naar "Het verhaal" */
@media(max-width:900px){.krul-over{display:none}}

/* juridische tekst */
.juridisch{max-width:760px}
.juridisch h2{font-size:20px;font-weight:700;margin:34px 0 10px;letter-spacing:-.01em}
.juridisch ol{padding-left:22px;color:#4a4740;line-height:1.75;font-weight:400}
.juridisch p{color:#4a4740;line-height:1.8;font-weight:400;margin-top:14px}
.juridisch ul{padding-left:22px;color:#4a4740;line-height:1.75;font-weight:400;margin-top:12px}
.juridisch ul li{margin-top:6px}
.juridisch .bijgewerkt{margin-top:34px;font-size:13.5px;color:var(--zacht)}
.juridisch .zie-ook{margin-top:22px;font-size:14px}
.juridisch .zie-ook a{color:inherit;text-decoration:underline;text-underline-offset:2px}
.juridisch .downloads{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
.juridisch .downloads .download{margin-top:0}
.concept-melding{margin:0 0 30px;padding:16px 20px;border:1px dashed #c6702f;border-radius:12px;background:#fff8f1;color:#7a4a1f;font-size:14px;line-height:1.6}
.concept-melding b{display:block;margin-bottom:6px}
.concept-melding ul{margin:6px 0 0;padding-left:20px;color:inherit}
.form-privacy{margin-top:12px;font-size:12.5px;line-height:1.5;color:var(--zacht)}
.form-privacy a{color:inherit;text-decoration:underline;text-underline-offset:2px}

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
.faq details p{color:var(--zacht);font-weight:400;line-height:1.7;padding:0 44px 26px 0;max-width:68ch}

/* terugknop naar home (zwart bolletje met witte pijl) */
.terug{width:40px;height:40px;border-radius:50%;background:#14130f;color:#fff;display:grid;place-items:center;flex:none;
  transition:transform .25s var(--ease),background .25s}
.terug:hover{transform:translateX(-3px);background:#2a2824}
.terug svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.nav-in .merk{margin-right:auto}


/* afsluitende oproep */
.oproep{padding:clamp(80px,10vw,130px) 0}
.oproep h2{font-size:clamp(36px,5.6vw,72px);font-weight:700;letter-spacing:-.035em;line-height:1;max-width:14ch}
.oproep h2 em{font-family:var(--serif);font-style:italic;font-weight:400}
.oproep p{margin-top:22px;color:var(--zacht);font-weight:400;max-width:46ch;font-size:17px}
.oproep .acties{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
.oproep .knop{padding:13px 24px;font-size:14px}
.oproep .knop.wa{background:#157f4b;color:#fff}
.oproep .knop.lijn{background:transparent;color:var(--inkt);border-color:var(--inkt)}

/* over ons */
.verhaal{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,80px);margin-top:10px}
.verhaal p{color:var(--zacht);font-weight:400;line-height:1.75;font-size:16.5px}
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
  .p-hero .wrap,.d-hero .wrap,.verhaal{grid-template-columns:1fr}
  .p-hero{padding:30px 0 70px}
  .stappen.vier .stap{min-height:0}
}
@media(prefers-reduced-motion:reduce){.op{opacity:1;transform:none;transition:none}}
/* dienstpagina: feitenregel in de hero, werkzaamheden inklapbaar, andere diensten als tegels */
.p-feiten{display:flex;flex-wrap:wrap;gap:10px 28px;margin-top:30px;padding-top:22px;border-top:1px solid var(--rand);font-size:14px;color:var(--zacht)}
.p-feiten b{color:var(--inkt);font-weight:700;margin-right:5px}
.p-feiten a{display:inline-flex;align-items:center;color:var(--zacht);text-decoration:none}
.p-feiten a:hover{color:var(--inkt)}
.p-feiten .sterscore{margin:0 8px 0 2px;font-size:13px;letter-spacing:2px}
.p-wa{display:none}
@media(max-width:760px){.p-hero .p-wa{display:inline-flex}.p-feiten{gap:8px 18px;font-size:13px}}
.p-hero.d-hero{padding-bottom:clamp(56px,7vw,88px)}
.d-hero + .vn-band{padding-top:0}   /* voor/na direct onder de hero */
.d-hero + #werk .sectie{padding-top:clamp(24px,3vw,40px)}   /* zonder voor/na: foto's direct onder de hero */
.ond-acc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(30px,5vw,72px);margin-top:40px;border-top:1px solid var(--rand)}
.ond-acc details{border-bottom:1px solid var(--rand);scroll-margin-top:96px;align-self:start}
.ond-acc summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:46px 1fr 24px;align-items:baseline;padding:22px 0;font-size:clamp(18px,1.6vw,21px);font-weight:700;letter-spacing:-.015em;line-height:1.25}
.ond-acc summary::-webkit-details-marker{display:none}
.ond-acc summary::after{content:'+';font-size:24px;font-weight:300;color:var(--brons);justify-self:end;transition:transform .3s var(--ease)}
.ond-acc details[open] summary::after{transform:rotate(45deg)}
.ond-acc summary:hover{color:#000}
.ond-acc .onr{font-family:var(--serif);font-style:italic;font-weight:400;font-size:22px;color:#8a6532}
.ond-acc p{padding:0 24px 24px 46px;color:#4a4740;line-height:1.75;font-size:16px;max-width:62ch}
.ond-download{margin-top:28px}
@media(max-width:820px){.ond-acc{grid-template-columns:1fr}}
.dt-alle .dt-beeld{display:grid;place-items:center;background:#14130f;color:var(--brons)}
.dt-alle .krul-mini{width:46%;height:auto}
.sectie .dt-raster{margin-top:44px}
/* diensten-overzicht: tegel met de werkzaamheden eronder */
.dt-blok{display:flex;flex-direction:column;border-bottom:1px solid var(--rand)}
.dt-blok .dt{border-bottom:0;padding-bottom:6px}
.dt-lijst{list-style:none;margin:0;padding:0 24px 30px}
.dt-lijst a{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid var(--rand);font-size:14.5px;color:var(--zacht);text-decoration:none;transition:color .2s}
.dt-lijst li:last-child a{border-bottom:0}
.dt-lijst a::after{content:'→';transition:transform .3s var(--ease)}
.dt-lijst a:hover{color:var(--inkt)}.dt-lijst a:hover::after{transform:translateX(4px)}
@media(max-width:420px){.dt-lijst{padding:0 12px 22px}.dt-lijst a{font-size:13.5px}}
.oproep + section .sectie{padding-top:clamp(40px,5vw,64px)}
</style>`;

// ---------- bouwstenen ----------
function pagina({ titel, omschrijving, body, voorladen }) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(omschrijving)}">
<link rel="icon" href="../assets/icon/favicon.svg" type="image/svg+xml">
<link rel="icon" href="../assets/icon/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../assets/icon/apple-touch-icon.png">${[].concat(voorladen || []).map((v, i) => `\n<link rel="preload" as="image" href="${v}"${i ? '' : ' fetchpriority="high"'}>`).join('')}
<!-- GEGENEREERD door tools/genereer-paginas.js uit docs/inhoud.json — niet met de hand aanpassen -->
${fonts}
${stijl}
${extraStijl}
</head>
<body>
<a class="naar-inhoud" href="#inhoud">Naar de inhoud</a>

${naarHoofd(kopdeel).replace('<div class="nav-in">\n    <a class="merk"', '<div class="nav-in">\n    <a class="terug" href="d-lijn.html" aria-label="Terug naar de homepage" title="Terug naar home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a>\n    <a class="merk"')}
<main id="inhoud">
${body}
</main>

${naarHoofd(footer)}

${dock}

<div class="lichtbak" id="lichtbak" role="dialog" aria-modal="true" aria-label="Foto vergroot">
  <button type="button"><span aria-hidden="true">×</span><span class="vh">Sluiten</span></button>
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
    if(doelEl && doelEl.tagName==='DETAILS') doelEl.open=true;
    if(doelEl) addEventListener('load',function(){ setTimeout(function(){ document.documentElement.style.scrollBehavior='auto';
      doelEl.scrollIntoView({block:'start'}); document.documentElement.style.scrollBehavior=''; vang(); },60); }); }

  // Krullen tekenen zich mee met het scrollen, en weer terug bij omhoog scrollen
  var krullen=[].slice.call(document.querySelectorAll('svg.krul path'));
  krullen.forEach(function(p){ p._L=p.getTotalLength(); p.style.strokeDasharray=p._L; p.style.strokeDashoffset=rm?0:p._L; });
  function krulScroll(){ var h=innerHeight; krullen.forEach(function(p){ var r=p.ownerSVGElement.getBoundingClientRect(), top=r.top+scrollY,
    t=top<h ? .22+scrollY/(top+r.height)*1.1 : (h*.95-r.top)/(r.height+h*.25);
    t=Math.min(1,Math.max(0,t)); p.style.strokeDashoffset=(p._L*(1-t)).toFixed(1); }); }
  if(!rm && krullen.length){ addEventListener('scroll',krulScroll,{passive:true}); krulScroll(); }

  // voor/na-schuif: loopt vanzelf heen en weer zodra hij in beeld is; met muis, vinger of pijltjestoetsen neemt u het over
  [].forEach.call(document.querySelectorAll('.vn'),function(el){
    var zelf=false, slepen=false, zicht=false, t0=performance.now(), terug;
    function pos(){ return parseFloat(el.style.getPropertyValue('--pos'))||50; }
    function zet(v){ v=Math.min(100,Math.max(0,v)); el.style.setProperty('--pos',v.toFixed(2)+'%'); el.setAttribute('aria-valuenow',Math.round(v)); }
    function uitPunt(e){ var r=el.getBoundingClientRect(); zet((e.clientX-r.left)/r.width*100); }
    function overnemen(){ zelf=true; clearTimeout(terug); }
    // na loslaten verder schuiven vanaf de plek waar de lijn nu staat
    function loslaten(ms){ clearTimeout(terug); terug=setTimeout(function(){ zelf=false; t0=performance.now()-Math.asin(Math.max(-1,Math.min(1,(pos()-50)/40)))*1300; },ms); }
    el.addEventListener('pointerdown',function(e){ overnemen(); slepen=true; el.setPointerCapture(e.pointerId); uitPunt(e); });
    el.addEventListener('pointermove',function(e){ if(slepen||e.pointerType==='mouse'){ overnemen(); uitPunt(e); } });
    el.addEventListener('pointerup',function(e){ slepen=false; if(e.pointerType!=='mouse') loslaten(2500); });
    el.addEventListener('pointercancel',function(){ slepen=false; loslaten(2500); });
    el.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse'&&!slepen) loslaten(600); });
    el.addEventListener('keydown',function(e){ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ e.preventDefault(); overnemen(); zet(pos()+(e.key==='ArrowRight'?5:-5)); } });
    el.addEventListener('blur',function(){ loslaten(1500); });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ zicht=es[0].isIntersecting; }).observe(el); else zicht=true;
    zet(50);
    if(!rm) (function schuif(t){ if(!zelf&&zicht) zet(50+40*Math.sin((t-t0)/1300)); requestAnimationFrame(schuif); })(performance.now());
  });

  // voor/na in de dienst-tegels (zoals op de homepage): eigen ritme per tegel, muis neemt het over
  [].forEach.call(document.querySelectorAll('.dt.heeft-voor'),function(t,i){
    var as=t.classList.contains('as-y')?'y':'x', zelf=false, zicht=false, t0=performance.now()-i*900;
    t.addEventListener('mousemove',function(e){ zelf=true; var r=t.querySelector('.dt-beeld').getBoundingClientRect();
      var v=as==='y'?(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width; t.style.setProperty('--pos',Math.min(100,Math.max(0,v*100))+'%'); });
    t.addEventListener('mouseleave',function(){ zelf=false; t0=performance.now(); });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ zicht=es[0].isIntersecting; }).observe(t); else zicht=true;
    if(rm) return;
    (function zwaai(n){ if(!zelf&&zicht) t.style.setProperty('--pos',(50+38*Math.sin((n-t0)/1400)).toFixed(2)+'%'); requestAnimationFrame(zwaai); })(performance.now());
  });

  // Lichtbak voor de galerij
  var lb=document.getElementById('lichtbak'), lbImg=lb.querySelector('img'), lbVid=null, lbTxt=lb.querySelector('p');
  // videospeler pas aanmaken als iemand een video groot bekijkt (pagina's zonder video's hebben er dan geen)
  function speler(){ if(!lbVid){ lbVid=document.createElement('video'); lbVid.controls=true; lbVid.muted=true; lbVid.loop=true; lbVid.setAttribute('playsinline',''); lbImg.after(lbVid); } return lbVid; }
  function dicht(){ lb.classList.remove('open'); if(lbVid) lbVid.pause(); }

  // galerij met grote foto en miniaturen: foto's staan in hun geheel in beeld; video speelt stil als hij actief en in beeld is
  var vg=document.querySelector('.vg');
  if(vg){
    var dias=[].slice.call(vg.querySelectorAll('.vg-dia')), duimen=[].slice.call(vg.querySelectorAll('.vg-duim')), vgPod=vg.querySelector('.vg-podium'),
        vgTel=vg.querySelector('.vg-teller'), vgBij=vg.querySelector('.vg-bij'), bij=JSON.parse(vg.dataset.bij), vgNu=0, vgZicht=false;
    function vgToon(i){ vgNu=(i+dias.length)%dias.length;
      dias.forEach(function(f,j){ var aan=j===vgNu; f.classList.toggle('aan',aan); if(aan) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden','true');
        var v=f.querySelector('video'); if(!v) return;
        if(aan && vgZicht && !rm){ if(!v.getAttribute('src')) v.src=v.dataset.src; v.play().catch(function(){}); } else v.pause(); });
      duimen.forEach(function(b,j){ var aan=j===vgNu; b.classList.toggle('aan',aan); if(aan){ b.setAttribute('aria-current','true');
        var rij=b.parentNode, l=b.offsetLeft-rij.offsetLeft; if(l<rij.scrollLeft||l+b.offsetWidth>rij.scrollLeft+rij.clientWidth) rij.scrollTo({left:l-rij.clientWidth/2+b.offsetWidth/2,behavior:rm?'auto':'smooth'}); }
        else b.removeAttribute('aria-current'); });
      vgTel.textContent=(vgNu+1)+' / '+dias.length; vgBij.textContent=bij[vgNu];
      // buren alvast laden (en tonen voor de overgang), zodat bladeren direct een hele foto laat zien
      dias.forEach(function(f,j){ var a=(j-vgNu+dias.length)%dias.length; f.classList.toggle('buur',a===1||a===dias.length-1); }); }
    vg.querySelector('.vg-vorige').addEventListener('click',function(){ vgToon(vgNu-1); });
    vg.querySelector('.vg-volgende').addEventListener('click',function(){ vgToon(vgNu+1); });
    duimen.forEach(function(b){ b.addEventListener('click',function(){ vgToon(+b.dataset.i); }); });
    vgPod.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ e.preventDefault(); vgToon(vgNu+1); } if(e.key==='ArrowLeft'){ e.preventDefault(); vgToon(vgNu-1); } });
    var vx=null; vgPod.addEventListener('pointerdown',function(e){ vx=e.clientX; });
    vgPod.addEventListener('pointerup',function(e){ if(vx===null) return; var dx=e.clientX-vx; vx=null; if(dx<-40) vgToon(vgNu+1); else if(dx>40) vgToon(vgNu-1); });
    vg.querySelector('.vg-groot').addEventListener('click',function(){ var f=dias[vgNu], im=f.querySelector('img'), vd=f.querySelector('video');
      if(vd){ vd.pause(); var sp=speler(); lbImg.hidden=true; sp.hidden=false; sp.poster=vd.poster; sp.src=vd.dataset.src; lbTxt.textContent=vd.getAttribute('aria-label'); sp.play().catch(function(){}); }
      else { if(lbVid){ lbVid.hidden=true; lbVid.pause(); } lbImg.hidden=false; lbImg.src=im.src; lbImg.alt=im.alt; lbTxt.textContent=im.alt; }
      lb.classList.add('open'); });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ vgZicht=es[0].isIntersecting; vgToon(vgNu); },{threshold:.25}).observe(vgPod);
    vgToon(0);
  }
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.closest('button')) dicht(); });
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
let reviewsHash = '';
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
  // eerst een deel tonen, de rest staat als tekst in de pagina en komt erbij met 'Toon meer' (houdt de pagina licht)
  const eersteReviews = 24;
  const logo = (b) => b === 'google'
    ? `<img class="rv-bron g" src="../assets/socials/google-officieel.png" alt="Google" width="96" height="96" loading="lazy">`
    : `<img class="rv-bron" src="../assets/socials/werkspot-officieel.png" alt="Werkspot" width="96" height="96" loading="lazy">`;
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
${toon.slice(0, eersteReviews).map(kaart).join('\n')}
    </div>
    <button type="button" class="rv-alle">Toon meer reviews <span>(${toon.length - eersteReviews})</span></button>
    <p class="rv-fout" role="status" hidden>De overige reviews konden niet worden geladen. Bekijk ze op <a href="${g.url}" target="_blank" rel="noopener">Google</a> of <a href="${w.url}" target="_blank" rel="noopener">Werkspot</a>.</p>
    <p class="rv-noot">Reviews zoals geplaatst op Google en Werkspot; reviews die op beide staan tonen we één keer. Reviews met alleen sterren en geen tekst tellen mee in de totalen. Bekijk ze ook zelf op <a href="${g.url}" target="_blank" rel="noopener">Google</a> en <a href="${w.url}" target="_blank" rel="noopener">Werkspot</a>.</p>
  </div>
</section>

${oproep()}
`;
  {   // de rest als los bestand; de hash in de naam ververst de cache bij nieuwe reviews
    const rest = JSON.stringify(toon.slice(eersteReviews).map(kaart));
    fs.mkdirSync(path.join(root, 'assets/data'), { recursive: true });
    fs.writeFileSync(path.join(root, 'assets/data/reviews-meer.json'), rest + '\n');
    reviewsHash = require('crypto').createHash('md5').update(rest).digest('hex').slice(0, 8);
  }
  return pagina({
    titel: 'Reviews — OK Timmerwerken Gorinchem',
    omschrijving: `${totaal} reviews op Google en Werkspot, gemiddeld ${nl(gemiddeld)} uit 5. Lees wat klanten over het timmer- en betonwerk van OK Timmerwerken in Gorinchem zeggen.`,
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
.rv-alle{display:flex;align-items:center;gap:6px;margin:30px auto 0;border:0;background:var(--inkt);color:#fff;border-radius:999px;padding:14px 24px;font:600 14px var(--f,inherit);cursor:pointer}
.rv-alle span{color:rgba(255,255,255,.7);font-weight:500}
.rv-alle[hidden]{display:none}
.rv-alle[disabled]{opacity:.6;cursor:progress}
.rv-fout{margin:14px auto 0;max-width:60ch;text-align:center;color:var(--zacht);font-size:14px}
.rv-fout a{color:inherit;text-decoration:underline}
/* muur: kolommen tussen de verticale lijnen */
.rv-muur{columns:4 250px;column-gap:18px}
.rv{break-inside:avoid;-webkit-column-break-inside:avoid;margin:0 0 18px;background:#fff;border-radius:16px;padding:30px 26px 26px;text-align:center;
  box-shadow:0 30px 60px -44px rgba(20,19,15,.4);display:inline-flex;width:100%;vertical-align:top;flex-direction:column;align-items:center}
/* inline-flex + volle breedte: Safari breekt een kaart dan nooit over twee kolommen (anders lekt schaduw/marge naar de volgende kolom) */
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
  function inkorten(k){ var p=k.querySelector('.rv-tekst'), b=k.querySelector('.rv-meer');
    k.classList.add('kort'); if(p.scrollHeight>p.clientHeight+4){ b.hidden=false; b.addEventListener('click',function(){ var open=k.classList.toggle('kort'); b.textContent=open?'Lees volledig':'Minder tonen'; }); } else k.classList.remove('kort'); }
  [].forEach.call(document.querySelectorAll('.rv'),inkorten);
  // "Toon meer": de overige reviews staan als tekst in de pagina en worden per 24 toegevoegd
  // de overige reviews staan in een los bestand dat pas laadt als iemand verder wil lezen (houdt de pagina licht)
  var muur=document.querySelector('.rv-muur'), knop=document.querySelector('.rv-alle'), rest=null, filter='alle', bezig=false;
  function haal(klaar){ if(rest) return klaar(); if(bezig) return; bezig=true; knop.disabled=true;
    fetch('../assets/data/reviews-meer.json?v=${reviewsHash}').then(function(r){ if(!r.ok) throw r; return r.json(); })
      .then(function(d){ rest=d; bezig=false; knop.disabled=false; klaar(); })
      .catch(function(){ bezig=false; knop.disabled=false; document.querySelector('.rv-fout').hidden=false; }); }
  function meer(n){ var stuk=rest.splice(0,n), tmp=document.createElement('div'); tmp.innerHTML=stuk.join('');
    [].slice.call(tmp.children).forEach(function(k){ k.hidden=filter!=='alle' && k.dataset.bron.indexOf(filter)<0; muur.appendChild(k); inkorten(k); });
    if(rest.length) knop.querySelector('span').textContent='('+rest.length+')'; else knop.hidden=true; }
  knop.addEventListener('click',function(){ haal(function(){ meer(24); }); });
  // filter op platform (laadt eerst alle reviews, zodat de telling klopt)
  var f=document.querySelector('.rv-filter');
  f.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    filter=b.dataset.f;
    [].forEach.call(f.children,function(x){ x.classList.toggle('aan',x===b); });
    function pas(){ [].forEach.call(document.querySelectorAll('.rv'),function(k){ k.hidden=filter!=='alle' && k.dataset.bron.indexOf(filter)<0; }); }
    pas(); if(filter!=='alle') haal(function(){ if(rest.length) meer(rest.length); pas(); }); });
})();
</script>
</body>`);
}

// ---------- dienstpagina ----------
// Opbouw: hero (met feitenregel) → voor/na → uitgevoerd werk → wat we doen (inklapbaar) → aanpak → sfeer + review → vragen → contact → andere diensten
function dienstPagina(d, alle) {
  const n = d.galerij.length, nn = (i) => String(i).padStart(2, '0');
  // galerij-item: [beeld, bijschrift] of [video.mp4, bijschrift, beginbeeld.jpg] — een video speelt (zonder geluid) als de kaart in het midden staat.
  // Optioneel 4e element 'voor' of 'na' (bij een foto is het 3e dan ''): label op de kaart; voor en na staan direct na elkaar.
  const faseNaam = { voor: 'Voor', na: 'Na' };
  const pijl = (r) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${r ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 6l-6 6 6 6'}"/></svg>`;
  // galerij: grote foto in zijn geheel (niet bijgesneden), pijlen, teller en een rij miniaturen eronder
  const vgDia = d.galerij.map(([src, bijschrift, poster, fase], i) => {
    const video = /\.mp4$/.test(src), label = fase ? `<span class="vg-label ${fase}">${faseNaam[fase]}</span>` : '';
    return `          <figure class="vg-dia${i ? (i === 1 || i === d.galerij.length - 1 ? ' buur' : '') : ' aan'}" data-i="${i}"${i ? ' aria-hidden="true"' : ''}>${label}${video
      ? `<video data-src="${src}" poster="${poster}" muted loop playsinline preload="none" aria-label="${esc(bijschrift)}"></video>`
      : `<img src="${src}" alt="${fase ? faseNaam[fase] + ': ' : ''}${esc(bijschrift)}" loading="lazy">`}</figure>`;
  }).join('\n');
  // miniaturen: kleine vierkante WebP's in assets/duim (tools/miniaturen.py), zodat de rij niet de grote foto's laadt
  const duimBron = d.galerij.map(([src, , poster]) => (/\.mp4$/.test(src) ? poster : src).replace(/^\.\.\//, ''));
  require('child_process').execFileSync('python3', [path.join(root, 'tools/miniaturen.py'), ...duimBron]);
  const duim = (bron) => '../assets/duim/' + path.basename(bron).replace(/\.[a-z]+$/i, '.webp');
  const vgDuim = d.galerij.map(([src, bijschrift, poster, fase], i) => `          <button type="button" class="vg-duim${i ? '' : ' aan'}" data-i="${i}" aria-label="${fase ? faseNaam[fase] + ' — ' : ''}foto ${i + 1}: ${esc(bijschrift)}"${i ? '' : ' aria-current="true"'}><img src="${duim(/\.mp4$/.test(src) ? poster : src)}" alt="" loading="lazy" width="96" height="96">${/\.mp4$/.test(src) ? '<span class="vg-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>' : ''}${fase ? `<span class="vg-fase ${fase}">${faseNaam[fase]}</span>` : ''}</button>`).join('\n');
  const vgBij = d.galerij.map(([, bijschrift]) => bijschrift);
  const galerij = `    <div class="vg op" data-bij='${esc(JSON.stringify(vgBij)).replace(/'/g, '&#39;')}'>
      <div class="vg-podium" tabindex="0" aria-roledescription="carrousel" aria-label="Foto's van uitgevoerd werk">
${vgDia}
        <button type="button" class="vg-pijl vg-vorige" aria-label="Vorige foto">${pijl(false)}</button>
        <button type="button" class="vg-pijl vg-volgende" aria-label="Volgende foto">${pijl(true)}</button>
        <button type="button" class="vg-groot" aria-label="Foto vergroten"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>
        <span class="vg-teller" aria-live="polite">1 / ${n}</span>
      </div>
      <p class="vg-bij">${esc(d.galerij[0][1])}</p>
      <div class="vg-duimen" role="group" aria-label="Kies een foto">
${vgDuim}
      </div>
    </div>`;
  const pBeeld = `    <div class="p-beeld" style="--bg:${d.kleur}" data-kantel>
      <img src="${d.beeld}" alt="${esc(d.beeldAlt)}" fetchpriority="high">${d.slug === 'dakramen' ? '\n      <img class="p-logo" src="../assets/velux/velux-montagepartner.webp" alt="Erkend VELUX Montagepartner">' : ''}
    </div>`;
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

  // sfeerbeeld (render op basis van eigen foto), na de aanpak
  const sfeerBand = d.sfeer ? `

<!-- SFEERBEELD -->
<section class="sfeer-band">
  <div class="kolommen"></div>
  <div class="wrap">
    <figure class="sfeer-beeld op"><img src="${d.sfeer[0]}" alt="${esc(d.sfeer[1])}" loading="lazy"><figcaption>${esc(d.sfeer[2])}</figcaption></figure>
  </div>
</section>` : '';
  // feitenregel onder de knoppen (zelfde cijfers als de hero op home; reviews live uit reviews.json)
  const g = reviewData.bronnen.google, w = reviewData.bronnen.werkspot, rv = reviewData.reviews;
  const gem = (rv.reduce((t, r) => t + r.score, 0) / rv.length).toFixed(1).replace('.', ',');
  const feiten = `<div class="p-feiten">
        <span><b>${new Date().getFullYear() - 2011} jaar</b> vakwerk</span>
        <span><b>500+</b> projecten</span>
        <a href="reviews.html"><b>${gem}</b><i class="sterscore" style="--pct:${(parseFloat(gem.replace(',', '.')) / 5 * 100).toFixed(0)}%" aria-hidden="true"></i>${g.aantal + w.aantal} reviews</a>
      </div>`;
  // werkzaamheden: één lijst, per onderdeel in- en uitklapbaar (ankers van de oude site blijven werken: het onderdeel klapt open)
  const ondLijst = (d.onderdelen || d.werk.map(([titel, tekst]) => ({ id: '', titel, tekst })));
  const werkzaamheden = `<!-- WAT WE DOEN -->
<section class="creme" id="werkzaamheden">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Wat we doen')}
      <h2>Alles rond <em class="serif">${esc(d.naam.charAt(0).toLowerCase() + d.naam.slice(1))}</em>, in één hand.</h2>
    </div>
    <div class="ond-acc op">
${ondLijst.map((o, i) => `      <details${o.id ? ` id="${o.id}"` : ''}><summary><span class="onr">${String(i + 1).padStart(2, '0')}</span>${esc(o.titel)}</summary><p>${esc(o.tekst)}</p></details>`).join('\n')}
    </div>${d.download ? `
    <div class="ond-download"><a class="download" href="${d.download[1]}" target="_blank" rel="noopener">${esc(d.download[0])}</a></div>` : ''}
  </div>
</section>`;
  // vaste vragen voor elke dienst: prijs (CONCEPTTEKST — eerst akkoord Ozcan) en werkgebied
  const faqV2 = [...d.faq,
    ['Wat kost het, en waar hangt de prijs van af?', 'Dat hangt af van de omvang, de opbouw en de bereikbaarheid. Ozcan komt vrijblijvend langs, kijkt ter plaatse wat er nodig is en u krijgt daarna een duidelijke prijs op papier.'],
    ['Werken jullie ook bij mij in de buurt?', 'OK Timmerwerken werkt vanuit Gorinchem, door heel Nederland. Vertel waar de klus is, dan horen we binnen een dag van ons.'],
  ].map(([v, a]) => `      <details><summary>${esc(v)}</summary><p>${esc(a)}</p></details>`).join('\n');
  // andere diensten: dezelfde tegels als op de homepage (inclusief de bewegende voor/na-lijn), zonder de huidige dienst
  const tegels = tussen(hoofd, '<div class="dt-raster op">', '</div>\n    <div class="alle-knop">', false).split('\n').filter((r) => /<a class="dt/.test(r) && !r.includes(`href="dienst-${d.slug}.html"`)).join('\n');
  const andereV2 = `<!-- ANDERE DIENSTEN -->
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Meer van OK')}
      <h2>Andere diensten.</h2>
    </div>
    <div class="dt-raster op">
${tegels}
        <a class="dt dt-alle" href="diensten.html"><div class="dt-beeld"><svg class="krul-mini" viewBox="0 0 140 100" aria-hidden="true"><path d="M132,10 C104,0 72,8 74,30 C76,50 106,48 102,32 C98,16 64,24 50,46 C41,61 33,76 25,90 M25,90 L22,77 M25,90 L36,83" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></div><div class="dt-tekst"><span class="dt-nr"></span><h3>Alle diensten</h3><span class="dt-pijl" aria-hidden="true">→</span><p>Alle werkzaamheden op een rij.</p></div></a>
    </div>
  </div>
</section>`;
  const body = `<!-- HERO -->
<section class="p-hero d-hero">
  <div class="kolommen"></div>
  <div class="wrap">
    <div>
      <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><a href="diensten.html">Diensten</a><span>/</span><span>${esc(d.naam)}</span></div>
      ${oog(d.nr + ' — ' + d.naam)}
      <h1>${esc(d.kop)}</h1>
      <p class="lead">${esc(d.intro)}</p>
      <p class="auteur"><img src="../assets/render/portret/web/ozcan-foto-avatar-72.webp" alt="" width="36" height="36"><span>Geschreven door <a rel="author" href="over.html">Ozcan</a>, eigenaar van OK Timmerwerken</span></p>
      <div class="acties">
        <a class="knop" href="contact.html">Vraag vrijblijvend advies</a>
        <a class="knop wa-knop p-wa" href="https://wa.me/31641429106" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>
        <a class="knop lijn" href="#werk">Bekijk uitgevoerd werk</a>
      </div>
      ${feiten}
    </div>
    ${d.slug === 'dakramen' ? `<div class="p-rechts">
${pBeeld}
      <div class="p-keurmerk"><img src="../assets/velux/velux-logo.webp" alt="" loading="lazy"><img src="../assets/velux/velux-getraind-2025.webp" alt="" loading="lazy"><span>Getraind en gecertificeerd<br>door VELUX</span></div>
    </div>` : pBeeld}
  </div>
</section>${d.voorna ? `

<!-- VOOR & NA -->
<section class="vn-band" id="voor-na">
  <div class="kolommen"></div>
  <div class="wrap">
    <div class="vn-grid">
      <div class="op">
        <span class="oog">Voor &amp; na<i class="baan"></i></span>
        <h2>${d.voorna.kop}</h2>
        <p class="lead">${esc(d.voorna.tekst)}</p>
        <p class="vn-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18"/></svg>Sleep de lijn om te vergelijken</p>
      </div>
      <figure class="op">
        <div class="vn" style="aspect-ratio:${d.voorna.verhouding}" tabindex="0" role="slider" aria-label="Voor en na vergelijken: ${esc(d.voorna.bij)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <img src="${d.voorna.na}" alt="Na: ${esc(d.voorna.altNa)}" loading="lazy">
          <div class="vn-voor"><img src="${d.voorna.voor}" alt="Voor: ${esc(d.voorna.altVoor)}" loading="lazy"></div>
          <div class="vn-greep" aria-hidden="true"></div>
          <span class="vn-l l" aria-hidden="true">Voor</span><span class="vn-l r" aria-hidden="true">Na</span>
        </div>
        <figcaption class="vn-bij">${esc(d.voorna.bij)}</figcaption>
      </figure>
    </div>
  </div>
</section>` : ''}

<!-- UITGEVOERD WERK -->
<section id="werk">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Uitgevoerd werk')}
      <h2>Echte projecten van <em class="serif">OK</em>.</h2>
      <p class="lead">Foto's van klussen die OK Timmerwerken heeft uitgevoerd. Blader met de pijlen of kies een foto in de rij eronder.</p>
    </div>
${galerij}
  </div>
</section>

${werkzaamheden}

<!-- AANPAK -->
<section class="fris">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Zo pakken we het aan')}
      <h2>In drie stappen <em class="serif">klaar</em>.</h2>
    </div>
    ${stappenRaster(d.aanpak, ['Klaar voor stap 1?', 'Bel, app of mail Ozcan. Binnen een dag hoort u van ons.', 'Vraag vrijblijvend advies'], d.aanpak_iconen)}
  </div>
</section>
${sfeerBand}${review}

<!-- VRAGEN -->
<section class="donker">
  <div class="kolommen"></div>
  <div class="wrap sectie">
    <div class="kop op">
      ${oog('Veelgestelde vragen')}
      <h2>Goed om te weten.</h2>
    </div>
    <div class="faq op">
${faqV2}
    </div>
  </div>
</section>

${oproep()}

${andereV2}`;

  return pagina({
    titel: `${d.naam} — OK Timmerwerken Gorinchem`,
    omschrijving: d.intro.slice(0, 155),
    body,
    voorladen: d.slug === 'dakramen' ? [d.beeld, '../assets/velux/velux-montagepartner.webp'] : d.beeld,
  });
}

// ---------- over ons ----------
// Tijdlijn op Over ons (data: inhoud.over.tijdlijn). Live alleen 'zeker'; in de proef ook 'navragen' (gemarkeerd).
function tijdlijnHtml(items, ookNavragen) {
  const g = reviewData.bronnen.google, w = reviewData.bronnen.werkspot, alle = reviewData.reviews;
  const nl = (x) => x.toFixed(1).replace('.', ',');
  const vul = (t) => t.replace('{werkspot.aantal}', w.aantal).replace('{google.aantal}', g.aantal).replace('{google.score}', nl(g.score))
    .replace('{totaal}', g.aantal + w.aantal).replace('{gemiddeld}', nl(alle.reduce((t2, r) => t2 + r.score, 0) / alle.length));
  const lijst = items.filter((x) => x.status === 'zeker' || ookNavragen);
  const punten = lijst.map((x) => {
    const nav = x.status !== 'zeker';
    const jaar = x.jaar === 'nu' ? `Nu <small data-jaar-nu>${new Date().getFullYear()}</small>` : (x.jaar || '20??');
    return `        <li class="tl-punt${nav ? ' tl-nav' : ''}"><span class="tl-jaar">${jaar}</span><span class="tl-dot" aria-hidden="true"></span>
          <b>${esc(vul(x.titel))}</b><p>${esc(vul(x.tekst))}</p>${nav ? '<span class="tl-label">navragen bij Ozcan</span>' : ''}</li>`;
  }).join('\n');
  return `
    <div class="tijdlijn" style="--n:${lijst.length}">
      <div class="tl-lijn" aria-hidden="true"><i></i></div>
      <ol>
${punten}
      </ol>
    </div>
    <script>
    // tijdlijn: de lijn tekent zich mee met het scrollen; een punt licht op zodra de lijn het bereikt
    (function(){
      var t=document.querySelector('.tijdlijn'); if(!t) return;
      var pts=[].slice.call(t.querySelectorAll('.tl-punt')), n=pts.length;
      [].forEach.call(t.querySelectorAll('[data-jaar-nu]'),function(e){ e.textContent=new Date().getFullYear(); });
      function zet(p){ t.style.setProperty('--p',p.toFixed(3)); pts.forEach(function(e,i){ e.classList.toggle('aan', p>=(i+.35)/n); }); }
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){ zet(1); return; }
      var tik=false;
      function stand(){ tik=false; var r=t.getBoundingClientRect(), h=innerHeight;
        zet(Math.min(1,Math.max(0,(h*.88-r.top)/(r.height+h*.3)))); }
      addEventListener('scroll',function(){ if(!tik){ tik=true; requestAnimationFrame(stand);} },{passive:true});
      addEventListener('resize',stand); stand();
    })();
    </script>`;
}

function overPagina(o, proef = false) {
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
      <a class="erkend" href="dienst-dakramen.html"><img src="../assets/velux/velux-montagepartner.webp" alt="" loading="lazy">Erkend VELUX Montagepartner — getraind en gecertificeerd door VELUX</a>
    </div>
    <div class="portret-blok">
      <img src="../assets/render/portret/web/ozcan-foto.webp" alt="Ozcan, eigenaar van OK Timmerwerken" width="1086" height="1448" fetchpriority="high">
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
    </div>${o.tijdlijn ? tijdlijnHtml(o.tijdlijn, proef) : ''}
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
    ${stappenRaster(o.waarden, ['Kennismaken?', 'Ozcan komt graag langs om uw plannen te bespreken — gratis en vrijblijvend.', 'Vraag vrijblijvend advies'], ['i-persoon', 'i-hamer', 'i-afspraak'])}
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
        <span><img class="uit-bron" src="../assets/socials/google-officieel.png" alt="" loading="lazy"><b>${esc(uit.naam)}</b> · Google-review, ${maanden[+uit.datum.slice(5, 7) - 1]} ${uit.datum.slice(0, 4)}</span></figcaption>
    </figure>
    <div class="uit-voet op"><span>Gemiddeld <b>${nlScore}</b> uit ${totaalReviews} reviews op Google en Werkspot</span><a class="pil" href="reviews.html">Lees alle reviews</a></div>
  </div>
</section>

${oproep()}`;
  return pagina({
    titel: 'Over ons — OK Timmerwerken Gorinchem',
    omschrijving: o.intro.slice(0, 155),
    body,
    voorladen: '../assets/render/portret/web/ozcan-foto.webp',
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
/* tijdlijn 2011 – nu: liggend op desktop, staand op mobiel; --p (0–1) = hoe ver de lijn getekend is */
.tijdlijn{position:relative;margin-top:clamp(64px,8vw,104px);--p:0}
.tijdlijn ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--n),1fr);gap:0 22px}
.tl-lijn{position:absolute;left:0;right:0;top:63px;height:2px;background:var(--rand)}
.tl-lijn i{position:absolute;inset:0;background:var(--brons);transform:scaleX(var(--p));transform-origin:0 50%}
.tl-punt{position:relative;opacity:.28;transform:translateY(10px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
.tl-punt.aan{opacity:1;transform:none}
.tl-jaar{display:flex;align-items:baseline;gap:8px;height:44px;font-size:clamp(26px,2.6vw,36px);font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--inkt)}
.tl-jaar small{font-size:13px;font-weight:500;letter-spacing:0;color:var(--zacht)}
.tl-dot{display:block;width:14px;height:14px;margin:12px 0 22px;border-radius:50%;background:#fff;border:2px solid var(--rand);position:relative;z-index:1;
  transition:background .4s,border-color .4s,transform .5s var(--ease)}
.tl-punt.aan .tl-dot{background:var(--brons);border-color:var(--brons);transform:scale(1.15)}
.tl-punt b{display:block;font-size:16px;font-weight:600;letter-spacing:-.01em;line-height:1.3}
.tl-punt p{margin-top:6px;font-size:14.5px;font-weight:400;line-height:1.55;color:var(--zacht)}
.tl-punt:last-child .tl-dot{box-shadow:0 0 0 6px rgba(181,138,82,.2)}
/* proef: nog navragen */
.tl-nav .tl-jaar{color:#c6702f}
.tl-nav .tl-dot{border-style:dashed;border-color:#c6702f;background:#fff!important}
.tl-label{display:inline-block;margin-top:10px;padding:3px 9px;border:1px dashed #c6702f;border-radius:999px;font-size:11px;font-weight:600;color:#c6702f}
@media(max-width:900px){
  .tijdlijn ol{grid-template-columns:1fr;gap:26px;padding-left:34px}
  .tl-lijn{left:6px;right:auto;top:6px;bottom:6px;width:2px;height:auto}
  .tl-lijn i{transform:scaleY(var(--p));transform-origin:50% 0}
  .tl-jaar{height:auto;font-size:26px}
  .tl-dot{position:absolute;left:-34px;top:6px;margin:0}
  .tl-punt b{margin-top:6px}
}
@media(prefers-reduced-motion:reduce){.tl-punt{transition:none}}
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
          <div class="c2-avatar"><img src="../assets/render/portret/web/ozcan-foto-avatar.webp" alt="Ozcan, eigenaar van OK Timmerwerken"></div>
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
            <div class="lbl">Werkgebied</div><p>Vanuit Gorinchem, door heel Nederland</p></div>
          <div><div class="lbl">Werktijden</div>
            <div class="tijden"><span>Ma – vr</span><span>07:00 – 18:00</span><span>Zaterdag</span><span>07:00 – 15:00</span><span>Zondag</span><span>Gesloten</span></div>
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
  // de werktijden staan al in de kaart, dus de werktijdenkolom gaat uit de footer (weghalen i.p.v. verbergen: geen verborgen tekst)
  return pagina({ titel: 'Contact — OK Timmerwerken Gorinchem', omschrijving: 'Neem contact op met OK Timmerwerken in Gorinchem: bel, app of stuur een vrijblijvende aanvraag. Ma–vr 07:00–18:00, za 07:00–15:00.', body })
    .replace(/\s*<div class="foot-tijden-kol">[\s\S]*?<\/div>\s*<\/div>/, '').replace('</head>', `<style>
@media(min-width:761px){.foot-grid{grid-template-columns:1.6fr 1fr 1fr}}
.c2-hero{padding:36px 0 84px}
.c2-wrap{display:block!important}
.c2-kop{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;align-items:end}   /* kop links, korte tekst rechts: zo staat het formulier eerder in beeld */
.c2-kop .kruimel,.c2-kop .oog{grid-column:1 / -1}
.c2-kop .kruimel{margin-bottom:28px}.c2-kop .oog{margin-bottom:40px}   /* compacter dan de andere hero's: hier draait het om het formulier */
.c2-kop h1{font-size:clamp(36px,4.6vw,62px)}
.c2-kop .lead{margin:0;padding-left:34px;max-width:46ch}
.c2-kaarten{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:34px;align-items:stretch}
/* links: wit — direct contact */
.c2-direct{background:#fff;color:var(--inkt);border:1px solid var(--rand);border-radius:20px;padding:34px 34px 30px;display:flex;flex-direction:column;
  box-shadow:0 40px 80px -50px rgba(20,19,15,.45)}
.c2-wie{display:flex;align-items:center;gap:16px}
.c2-avatar{width:84px;height:84px;flex:none;border-radius:50%;overflow:hidden;background:#f2ebdf}
.c2-avatar img{width:100%;height:100%;object-fit:cover}   /* ozcan-foto-avatar.webp is al uitgesneden (hoofd en schouders) */
.c2-wie b{display:block;font-size:22px;font-weight:700;letter-spacing:-.02em}
.c2-wie span{font-size:13px;color:var(--zacht)}
.c2-citaat{margin-top:22px;font-family:var(--serif);font-style:italic;font-size:21px;line-height:1.35;color:var(--inkt)}
.c2-acties{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.c2-acties .knop{padding:12px 20px;font-size:14px}
.c2-bel{background:var(--inkt);color:#fff;border-color:var(--inkt)}.c2-bel:hover{background:#fff;color:var(--inkt)}
.c2-mail{background:transparent;color:var(--inkt);border:1px solid var(--inkt)}.c2-mail:hover{background:var(--inkt);color:#fff}
.c2-info{margin-top:28px;padding-top:26px;border-top:1px solid var(--rand);display:grid;grid-template-columns:1fr 1fr;gap:6px 28px}
.c2-info .lbl{color:var(--zacht);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;margin:0 0 6px}
.c2-info .lbl ~ .lbl{margin-top:16px}
.c2-info a,.c2-info p{color:var(--inkt);font-size:14.5px;display:block}
.c2-info .tijden{display:grid;grid-template-columns:auto auto;gap:3px 14px;font-size:14px;width:fit-content}
.c2-info .tijden span:nth-child(even){color:var(--zacht)}
.c2-direct .nu-open{font-size:13.5px;margin-top:12px}
/* rechts: wit — het formulier (zelfde kaart als links) */
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
  // tegels van de homepage (zelfde beeld, label en voor/na-lijn), met per dienst de werkzaamheden eronder
  const homeTegels = tussen(hoofd, '<div class="dt-raster op">', '</div>\n    <div class="alle-knop">', false).split('\n').filter((r) => /<a class="dt/.test(r));
  const blokken = alle.map((x) => {
    const tegel = homeTegels.find((r) => r.includes(`href="dienst-${x.slug}.html"`));
    if (!tegel) throw new Error(`geen home-tegel voor ${x.slug}`);
    return `      <div class="dt-blok">
        ${tegel.trim()}
        <ul class="dt-lijst">
${(x.onderdelen || []).map((o) => `          <li><a href="dienst-${x.slug}.html#${o.id}">${esc(o.titel)}</a></li>`).join('\n')}
        </ul>
      </div>`;
  }).join('\n');
  const body = `<section class="p-hero" style="padding-bottom:20px">
  <div class="kolommen"></div>
  <div class="wrap" style="display:block">
    <div class="kruimel"><a href="d-lijn.html">Home</a><span>/</span><span>Diensten</span></div>
    ${oog('Diensten')}
    <h1>Alle vakken, <em class="serif">één</em> aanspreekpunt.</h1>
    <p class="lead">Timmerwerk, betonwerk, dakramen, onderhoud en nieuwbouw — van de fundering tot de laatste lijst. Kies een vakgebied of ga direct naar een werkzaamheid.</p>
  </div>
</section>
<section>
  <div class="kolommen"></div>
  <div class="wrap sectie" style="padding-top:20px">
    <div class="dt-raster op">
${blokken}
    </div>
  </div>
</section>

${oproep()}`;
  return pagina({ titel: 'Diensten — OK Timmerwerken Gorinchem', omschrijving: 'Alle diensten van OK Timmerwerken in Gorinchem: timmerwerk, betonvloeren, funderingen, Velux-dakramen, carports, onderhoud en nieuwbouw.', body });
}

// ---------- juridische pagina's ----------
const juridischeOmschrijving = {
  'Algemene voorwaarden': 'De algemene voorwaarden van OK Timmerwerken in Gorinchem: offertes, uitvoering, betaling, garantie en aansprakelijkheid bij timmer- en betonwerk.',
  'Privacyverklaring': 'Hoe OK Timmerwerken in Gorinchem omgaat met uw persoonsgegevens: welke gegevens we verwerken, waarom, hoe lang we ze bewaren en uw rechten.',
  'Disclaimer': 'Disclaimer van OK Timmerwerken in Gorinchem: over de informatie op deze website, aansprakelijkheid, links naar andere sites en het gebruik van beelden.',
};
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
      <p class="zie-ook">Zie ook: ${[['Algemene voorwaarden', 'voorwaarden.html'], ['Privacyverklaring', 'privacy.html'], ['Disclaimer', 'disclaimer.html']].filter(([t]) => t !== titel).map(([t, h]) => `<a href="${h}">${t.toLowerCase()}</a>`).join(' en ')}.</p>
    </div>
  </div>
</section>`;
  return pagina({ titel: `${titel} — OK Timmerwerken Gorinchem`, omschrijving: juridischeOmschrijving[titel] || `${titel} van OK Timmerwerken, Gorinchem.`, body });
}
function privacyHtml(v) {
  const lijst = (l) => (l ? `\n      <ul>${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const alineas = (a) => (a || []).map((x) => `\n      <p>${esc(x)}</p>`).join('');
  const concept = v.concept ? `      <div class="concept-melding"><b>Concept — nog niet definitief</b>Deze tekst moet OK Timmerwerken nog controleren, in het bijzonder:<ul>${v.concept_punten.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>\n` : '';
  return `${concept}      <p>${esc(v.intro)}</p>
${v.secties.map((x) => `      <h2>${esc(x.titel)}</h2>${alineas(x.alineas)}${lijst(x.lijst)}${alineas(x.na)}`).join('\n')}
      <p class="bijgewerkt">Laatst bijgewerkt: ${esc(v.bijgewerkt)}</p>`;
}

function voorwaardenHtml(v) {
  const formulier = v.formulier ? `\n        <a class="download" href="${v.formulier}" target="_blank" rel="noopener">Herroepingsformulier (pdf)</a>` : '';
  return `      <p>${esc(v.intro)}</p>
      <div class="downloads">
        <a class="download" href="${v.pdf}" target="_blank" rel="noopener">Download als pdf</a>${formulier}
      </div>
${v.artikelen.map((a) => `      <h2>${esc(a.titel)}</h2>\n      <ol>${a.leden.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`).join('\n')}${v.versie ? `\n      <p class="bijgewerkt">${esc(v.versie)}</p>` : ''}`;
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
fs.writeFileSync(path.join(uit, 'over-proef.html'), overPagina(inhoud.over, true));   // PROEF tijdlijn — niet in de nette URL's
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
fs.writeFileSync(path.join(uit, 'privacy.html'), juridischPagina('Privacyverklaring', privacyHtml(inhoud.juridisch.privacy)));
geschreven.push('diensten.html', 'voorwaarden.html', 'disclaimer.html', 'privacy.html');

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
  h = h.replace(/href="privacy\.html"/g, `href="${pre}privacyverklaring/"`);
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
schrijf('privacyverklaring/index.html', herschrijf(fs.readFileSync(path.join(uit, 'privacy.html'), 'utf8'), '../'));

// ---------- vindbaarheid: canonical, voorbeeld bij delen, bedrijfsgegevens voor Google, sitemap, 404 ----------
// SITE = het adres waaronder de site draait. Nu de testomgeving; BIJ LIVEGANG wijzigen in 'https://www.ok-timmerwerken.nl/'.
const SITE = 'https://thomv-flow8.github.io/Ok-Timmerwerken/';
const sitePaginas = ['', 'over-ons/', 'diensten/', ...slugs.map((s) => `diensten/${s}/`), 'contact/', 'reviews/', 'algemene-voorwaarden/', 'disclaimer/', 'privacyverklaring/'];
const dagen = { 'Maandag – vrijdag': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'Zaterdag': ['Saturday'], 'Zondag': ['Sunday'] };
const bedrijf = {
  '@context': 'https://schema.org', '@type': 'GeneralContractor', '@id': SITE + '#bedrijf',
  name: 'OK Timmerwerken', url: SITE, logo: SITE + 'assets/icon/icon-512.png', image: SITE + 'assets/og/ok-timmerwerken-delen.jpg',
  description: 'Timmer- en betonwerk vanuit Gorinchem, door heel Nederland. Erkend VELUX Montagepartner.',
  telephone: '+31641429106', email: 'info@ok-timmerwerken.nl', foundingDate: '2011',
  address: { '@type': 'PostalAddress', streetAddress: 'Suzanna van Oostdijkstraat 4', postalCode: '4206 XW', addressLocality: 'Gorinchem', addressCountry: 'NL' },
  areaServed: [{ '@type': 'City', name: 'Gorinchem' }, { '@type': 'Country', name: 'Nederland' }],
  // werktijden uit inhoud.werktijden, zodat ze altijd gelijk zijn aan wat op de site staat
  openingHoursSpecification: inhoud.werktijden.filter(([, t]) => t !== 'Gesloten').map(([dag, t]) => {
    if (!dagen[dag]) throw new Error(`onbekende dag in werktijden: ${dag}`);
    const [open, dicht] = t.split('–').map((x) => x.trim());
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: dagen[dag], opens: open, closes: dicht };
  }),
  sameAs: ['https://www.instagram.com/oktimmerwerken', reviewData.bronnen.werkspot.url.replace(/\/reviews$/, ''), reviewData.bronnen.google.url],
};
// lengte van een mp4 uit de 'mvhd'-box (tijdschaal en duur), als ISO 8601 (PT20S)
function videoDuur(bestand) {
  const b = fs.readFileSync(bestand), i = b.indexOf('mvhd');
  if (i < 0) return undefined;
  const v = b[i + 4], ts = v ? b.readUInt32BE(i + 24) : b.readUInt32BE(i + 16), du = v ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  return `PT${Math.round(du / ts)}S`;
}
function videoGegevens(rel) {
  const m = rel.match(/^diensten\/([a-z]+)\/$/); if (!m) return '';
  const dienst = inhoud.diensten.find((x) => x.slug === m[1]); if (!dienst) return '';
  const vids = dienst.galerij.filter((g) => /\.mp4$/.test(g[0]));
  if (!vids.length) return '';
  const lijst = vids.map(([src, naam, poster]) => {
    const pad = src.replace('../', ''), stat = fs.statSync(path.join(root, pad));
    return { '@type': 'VideoObject', name: naam, description: `${naam} — ${dienst.naam} door OK Timmerwerken in Gorinchem.`,
      thumbnailUrl: SITE + poster.replace('../', ''), contentUrl: SITE + pad, uploadDate: stat.mtime.toISOString().slice(0, 10),
      duration: videoDuur(path.join(root, pad)), inLanguage: 'nl' };
  });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': lijst })}</script>\n`;
}
// wie de pagina schreef (E-E-A-T): dienstpagina's door Ozcan, de reviewpagina door het bedrijf
function paginaGegevens(rel, titel, oms) {
  const bedrijfKort = { '@type': 'GeneralContractor', '@id': SITE + '#bedrijf', name: 'OK Timmerwerken', url: SITE };
  let auteur = null;
  if (/^diensten\/[a-z]+\/$/.test(rel)) auteur = { '@type': 'Person', '@id': `${SITE}over-ons/#ozcan`, name: 'Ozcan', jobTitle: 'Eigenaar', url: `${SITE}over-ons/`, worksFor: bedrijfKort };
  else if (rel === 'reviews/') auteur = bedrijfKort;
  if (!auteur) return '';
  const pg = { '@context': 'https://schema.org', '@type': 'WebPage', name: titel, description: oms, url: `${SITE}${rel}`, inLanguage: 'nl', author: auteur, publisher: bedrijfKort };
  return `<script type="application/ld+json">${JSON.stringify(pg)}</script>\n`;
}
function vindbaar(rel) {
  const doel = path.join(root, rel === '' ? 'index.html' : rel + 'index.html');
  let html = fs.readFileSync(doel, 'utf8');
  const titel = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const oms = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1];
  if (!titel || !oms) throw new Error(`${rel || 'home'}: titel of omschrijving ontbreekt`);
  const kop = `<link rel="canonical" href="${SITE}${rel}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="OK Timmerwerken">
<meta property="og:title" content="${titel}">
<meta property="og:description" content="${oms}">
<meta property="og:url" content="${SITE}${rel}">
<meta property="og:image" content="${SITE}assets/og/ok-timmerwerken-delen.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="OK Timmerwerken — timmer- en betonwerk in Gorinchem">
<meta name="twitter:card" content="summary_large_image">
${rel === '' ? `<script type="application/ld+json">${JSON.stringify(bedrijf)}</script>\n` : ''}${paginaGegevens(rel, titel, oms)}${videoGegevens(rel)}`;
  html = html.replace(/(<meta name="description" content="[^"]*">\n)/, `$1${kop}`);
  fs.writeFileSync(doel, html);
}
sitePaginas.forEach(vindbaar);
const vandaag = new Date().toISOString().slice(0, 10);
schrijf('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitePaginas.map((r) => `  <url><loc>${SITE}${r}</loc><lastmod>${vandaag}</lastmod></url>`).join('\n')}
</urlset>
`);
// llms.txt (llmstxt.org): korte, leesbare samenvatting van de site voor AI-assistenten en -zoekmachines,
// opgebouwd uit dezelfde inhoud als de pagina's, zodat hij altijd actueel is
{
  const rb = reviewData.bronnen, tijden = inhoud.werktijden.map(([d, t]) => `${d} ${t.toLowerCase()}`).join(', ');
  const kort = (t) => t.replace(/\s+/g, ' ').trim();
  const cijfer = (n) => n.toFixed(1).replace('.', ',');
  schrijf('llms.txt', `# OK Timmerwerken

> Timmer- en betonwerk vanuit Gorinchem, door heel Nederland, sinds 2011. Eenmanszaak van Ozcan: één vast aanspreekpunt van offerte tot oplevering. Erkend VELUX Montagepartner (door VELUX getraind in 2025). Beoordeeld met een ${cijfer(rb.werkspot.score)} op Werkspot (${rb.werkspot.aantal} reviews) en een ${cijfer(rb.google.score)} op Google (${rb.google.aantal} reviews).

- Adres: Suzanna van Oostdijkstraat 4, 4206 XW Gorinchem
- Werkgebied: vanuit Gorinchem, door heel Nederland
- Telefoon en WhatsApp: 06 41 42 91 06
- E-mail: info@ok-timmerwerken.nl
- KvK: 51855232
- Werktijden: ${tijden}
- Offerte: gratis en vrijblijvend, na een bezoek ter plaatse

## Diensten

${inhoud.diensten.map((d) => `- [${d.naam}](${SITE}diensten/${d.slug}/): ${kort(d.intro)}`).join('\n')}

## Over het bedrijf

- [Over ons](${SITE}over-ons/): ${kort(inhoud.over.intro)}
- [Reviews](${SITE}reviews/): alle klantbeoordelingen van Werkspot en Google op één pagina.
- [Contact](${SITE}contact/): bellen, appen of een vrijblijvende aanvraag sturen.
- [Alle diensten](${SITE}diensten/): overzicht van alle werkzaamheden.

## Optional

- [Algemene voorwaarden](${SITE}algemene-voorwaarden/)
- [Privacyverklaring](${SITE}privacyverklaring/)
- [Disclaimer](${SITE}disclaimer/)
`);
}
// 404: GitHub Pages toont /404.html bij elk onbekend adres, op elke diepte. Daarom eerst het basisadres bepalen
// (testomgeving /Ok-Timmerwerken/ of straks /) zodat beelden en links overal kloppen.
const nietGevonden = pagina({
  titel: 'Pagina niet gevonden — OK Timmerwerken',
  omschrijving: 'Deze pagina bestaat niet (meer). Ga naar de homepage, de diensten of neem contact op met OK Timmerwerken.',
  body: `<section class="p-hero">
  <div class="kolommen"></div>
  <div class="wrap" style="display:block">
    ${oog('404')}
    <h1>Deze pagina bestaat <em class="serif">niet</em> (meer).</h1>
    <p class="lead">Misschien is het adres veranderd: de site is vernieuwd. Hieronder vindt u de weg terug.</p>
    <div class="acties">
      <a class="knop" href="d-lijn.html">Naar de homepage</a>
      <a class="knop lijn" href="diensten.html">Bekijk de diensten</a>
      <a class="knop lijn" href="contact.html">Contact</a>
    </div>
  </div>
</section>
${oproep()}`,
}).replace('<head>\n', `<head>\n<script>document.write('<base href="' + (location.pathname.indexOf('/Ok-Timmerwerken/') === 0 ? '/Ok-Timmerwerken/' : '/') + '">');</script>\n`);
schrijf('404.html', herschrijf(nietGevonden, ''));

// Afmetingen van elke foto als width/height op <img>: de browser reserveert dan meteen de juiste ruimte (geen verspringen).
// Gelezen uit het bestand zelf (JPEG/PNG/WebP), zonder extra pakketten; de CSS (img{height:auto}) bepaalt de echte weergavemaat.
function beeldMaten(bestand) {
  const b = fs.readFileSync(bestand);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const soort = b.toString('ascii', 12, 16);
    if (soort === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (soort === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
    if (soort === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xff || (m >= 0xd0 && m <= 0xd9) || m === 0x01) { i += m === 0xff ? 1 : 2; continue; }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}
// tekstversie van elke pagina in Markdown (index.md naast index.html), voor AI-assistenten;
// de pagina verwijst ernaar met <link rel="alternate" type="text/markdown">
const htmlEnt = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€', middot: '·', ndash: '–', mdash: '—', hellip: '…' };
const tekst = (t) => t.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, c) => (c[0] === '#' ? String.fromCodePoint(c[1].toLowerCase() === 'x' ? parseInt(c.slice(2), 16) : +c.slice(1)) : htmlEnt[c] ?? m));
function naarMarkdown(html, paginaUrl) {
  let m = (html.match(/<main id="inhoud">([\s\S]*?)<\/main>/) || [])[1] || '';
  m = m.replace(/<(script|style|svg|video|button|template|form|noscript)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<div class="kruimel">[\s\S]*?<\/div>/g, '')
    .replace(/<span\b[^>]*(?:aria-hidden="true"|class="dt-tag")[^>]*>[^<]*<\/span>/gi, '')   // decoratie (Voor/Na-labels, pijlen, labeltjes) niet in de tekst
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (t, href, inh) => {
      const label = inh.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!label) return '';
      if (/^(tel:|mailto:|#)/.test(href)) return label;
      return `[${label}](${new URL(href, paginaUrl).href})`;
    })
    .replace(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (t, n, inh) => `\n\n${'#'.repeat(+n)} ${inh.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n\n`)
    .replace(/<li\b[^>]*>/gi, '\n- ').replace(/<\/li>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(b|strong)\b[^>]*>/gi, '**')
    .replace(/<\/(p|div|section|ul|ol|figure|figcaption|article|blockquote|dd|dt|dl|summary|details)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ');
  return tekst(m).split('\n').map((r) => r.replace(/[ \t]+/g, ' ').replace(/ ([.,;:!?])/g, '$1').trim()).join('\n')
    .replace(/\*\*\s*\*\*/g, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
for (const rel of sitePaginas) {
  const doel = path.join(root, rel, 'index.html');
  let html = fs.readFileSync(doel, 'utf8');
  const titel = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const oms = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
  fs.writeFileSync(path.join(root, rel, 'index.md'), `# ${tekst(titel)}\n\n> ${tekst(oms)}\n\nBron: ${SITE}${rel}\n\n${naarMarkdown(html, SITE + rel)}`);
  html = html.replace(/(<link rel="canonical" href="[^"]*">\n)/, `$1<link rel="alternate" type="text/markdown" href="index.md">\n`);
  fs.writeFileSync(doel, html);
}

// gedeelde opmaak als los, cachebaar bestand: site.css (lettertypes + hoofdstijl) voor de homepage en
// alles.css (site.css + de opmaak van de subpagina's) voor alle andere pagina's: zo laadt elke pagina
// maar één stylesheet (geen keten van twee CSS-bestanden). De browser haalt ze maar één keer op.
// Paden in de CSS zijn relatief aan de preview-map (../assets/…) en worden relatief aan assets/css/ (../…).
const siteBlokken = [tussen(fonts, '<style>', '</style>'), stijl], paginaBlokken = [extraStijl];
const cssBlokken = [['site.css', siteBlokken], ['alles.css', [...siteBlokken, ...paginaBlokken]]];
const cssLinks = {};
fs.mkdirSync(path.join(root, 'assets/css'), { recursive: true });
for (const [naam, blokken] of cssBlokken) {
  const inhoudCss = verkleinCss(blokken.map((b) => b.replace(/^<style>|<\/style>$/g, '')).join('\n').split('../assets/').join('../'));
  fs.writeFileSync(path.join(root, 'assets/css', naam), inhoudCss + '\n');
  cssLinks[naam] = require('crypto').createHash('md5').update(inhoudCss).digest('hex').slice(0, 8);
}
try { fs.unlinkSync(path.join(root, 'assets/css/pagina.css')); } catch (e) {}   // vervangen door alles.css
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://api.web3forms.com; form-action 'self' https://api.web3forms.com; base-uri 'self'; object-src 'none'";
function cssNaarBestand(html, rel) {
  if (process.env.INLINE_CSS) return html;   // alleen voor vergelijkingstests
  // de diepte van de pagina bepaalt het voorvoegsel; de site-opmaak moet er altijd in zitten
  for (const pre of ['../../', '../', '']) {
    const delen = (blokken) => blokken.map((b) => b.split('../assets/').join(pre + 'assets/'));
    const site = delen(siteBlokken), pag = delen(paginaBlokken);
    if (!site.every((d) => html.includes(d))) continue;
    const sub = pag.every((d) => html.includes(d));
    const naam = sub ? 'alles.css' : 'site.css';
    [...site, ...(sub ? pag : [])].forEach((x, i) => { html = html.replace(x, i === 0 ? `<link rel="stylesheet" href="${pre}assets/css/${naam}?v=${cssLinks[naam]}">` : ''); });
    return html;
  }
  throw new Error(`${rel}: gedeelde CSS niet gevonden`);
}

// verkleinen van de inline CSS en JS (veilig: alleen commentaar en witruimte; regeleinden in JS blijven staan)
function verkleinCss(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1').replace(/:\s+/g, ':').replace(/;}/g, '}').trim();
}
function verkleinJs(js) {
  const regels = js.split('\n').map((r) => r.trim()).filter((r) => r && !r.startsWith('//') && !/^\/\*.*\*\/$/.test(r));
  // regels na ; { of , veilig aan elkaar (geen automatische puntkomma mogelijk); overige regeleinden blijven staan
  return regels.reduce((uit, r) => uit + (uit === '' ? '' : /[;{,]$/.test(uit) && !/\/\/[^'"]*$/.test(uit) ? '' : '\n') + r, '');
}
function verklein(html) {
  return html
    .replace(/<style>([\s\S]*?)<\/style>/g, (t, css) => `<style>${verkleinCss(css)}</style>`)
    .replace(/<script>([\s\S]*?)<\/script>/g, (t, js) => `<script>${verkleinJs(js)}</script>`)
    .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (t, j) => `<script type="application/ld+json">${JSON.stringify(JSON.parse(j))}</script>`);
}
// pictogrammen (de SVG-iconenset) en het pagina-script als losse, cachebare bestanden; de bestandsnaam bevat een
// hash van de inhoud, zodat een wijziging altijd een nieuwe naam krijgt. Scheelt per pagina ~45 KB HTML.
for (const m of ['assets/js', 'assets/icons']) { fs.rmSync(path.join(root, m), { recursive: true, force: true }); fs.mkdirSync(path.join(root, m), { recursive: true }); }
const hash = (t) => require('crypto').createHash('md5').update(t).digest('hex').slice(0, 10);
function naarLosseBestanden(html, rel) {
  if (process.env.INLINE_CSS) return html;   // alleen voor vergelijkingstests
  const pre = '../'.repeat(rel.split('/').length - 1);
  const sprite = html.match(/<svg width="0" height="0" style="position:absolute" aria-hidden="true">([\s\S]*?)<\/svg>\n?/);
  if (sprite) {
    const inhoud = `<svg xmlns="http://www.w3.org/2000/svg">${sprite[1].trim()}</svg>\n`, naam = `assets/icons/${hash(inhoud)}.svg`;
    fs.writeFileSync(path.join(root, naam), inhoud);
    html = html.replace(sprite[0], '').replace(/<use href="#(i-[^"]+)"/g, `<use href="${pre}${naam}#$1"`);
  }
  return html.replace(/<script>((?:(?!<\/script>)[\s\S]){1500,})<\/script>/g, (t, js) => {   // nooit over een </script> heen
    const naam = `assets/js/${hash(js)}.js`;
    fs.writeFileSync(path.join(root, naam), js + '\n');
    return `<script src="${pre}${naam}"></script>`;
  });
}
const matenCache = {};
let metMaten = 0;
let bespaard = 0;
for (const rel of [...sitePaginas.map((r) => r + 'index.html'), '404.html']) {
  const doel = path.join(root, rel), map = path.dirname(doel);
  const html = fs.readFileSync(doel, 'utf8').replace(/<img\b([^>]*)>/g, (tag, attr) => {
    if (/\swidth=/.test(attr)) return tag;
    const m = attr.match(/\s(?:src|data-src)="([^"]+\.(?:jpe?g|png|webp))"/);
    if (!m || /^https?:/.test(m[1])) return tag;
    const bestand = path.join(map, m[1]);
    if (!fs.existsSync(bestand)) return tag;
    const maat = matenCache[bestand] || (matenCache[bestand] = beeldMaten(bestand));
    if (!maat) return tag;
    metMaten++;
    return `<img${attr} width="${maat[0]}" height="${maat[1]}">`;
  });
  const klein = naarLosseBestanden(verklein(cssNaarBestand(html, rel)), rel);
  // beveiligingsbeleid (CSP): GitHub Pages kan geen headers zetten, een meta-tag wel. Alleen op pagina's zonder inline script.
  const metCsp = /<script>/.test(klein) ? klein : klein.replace(/(<meta charset="[^"]*">)/i, `$1\n<meta http-equiv="Content-Security-Policy" content="${CSP}">`);
  bespaard += html.length - klein.length;
  fs.writeFileSync(doel, metCsp);
}
console.log(`afmetingen toegevoegd aan ${metMaten} <img>-tags (${Object.keys(matenCache).length} verschillende beelden); CSS/JS verkleind: ${Math.round(bespaard / 1024)} KB minder`);

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
for (const rel of ['index.html', 'over-ons/index.html', 'diensten/index.html', 'algemene-voorwaarden/index.html', 'disclaimer/index.html', 'privacyverklaring/index.html', ...slugs.map((s) => `diensten/${s}/index.html`)]) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const map = path.dirname(path.join(root, rel));
  if (/d-lijn\.html|dienst-[a-z]+\.html|over\.html|diensten\.html|voorwaarden\.html|disclaimer\.html|privacy\.html|\.\.\/assets\/(?!)/.test(html.replace(/\.\.\/(\.\.\/)?assets\//g, ''))) { console.error(`  ${rel}: bevat nog een preview-link`); fout++; }
  for (const m of html.matchAll(/(?:src|href)="([^"#:?][^"]*\.(?:jpg|png|webp|svg))"/g)) {
    if (!fs.existsSync(path.join(map, m[1]))) { console.error(`  ${rel}: ontbreekt ${m[1]}`); fout++; }
  }
}
console.log(`site gebouwd: index.html, over-ons/, diensten/ (+${slugs.length}), algemene-voorwaarden/, disclaimer/, 404.html, sitemap.xml, ${oud.length} doorverwijzingen${fout ? ` — ${fout} probleem/problemen` : ' — alle links en beelden in orde'}`);
