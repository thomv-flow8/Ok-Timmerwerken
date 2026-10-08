// Bouwt de printversies (A4) van de algemene voorwaarden en het herroepingsformulier uit docs/inhoud.json,
// en zet ze met tools/pdf.swift om naar pdf in assets/documenten/.
// Gebruik: node tools/genereer-documenten.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const inhoud = JSON.parse(fs.readFileSync(path.join(root, 'docs/inhoud.json'), 'utf8'));
const v = inhoud.juridisch.voorwaarden;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const map = path.join(root, 'tools/.documenten');   // tijdelijke printbestanden (niet in git)
fs.mkdirSync(map, { recursive: true });

const bedrijf = {
  naam: 'OK Timmerwerken',
  adres: 'Suzanna van Oostdijkstraat 4, 4206 XW Gorinchem',
  kvk: '51855232',
  tel: '06 41 42 91 06',
  mail: 'info@ok-timmerwerken.nl',
  web: 'www.ok-timmerwerken.nl',
};

// huisstijl van de site: Inter + Instrument Serif (cursief accentwoord), inkt #14130f, brons #b58a52, warm grijs
const stijl = `
@font-face{font-family:Inter;src:url(../../assets/fonts/inter-latin.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:Inter;src:url(../../assets/fonts/inter-latin-ext.woff2) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+1E00-1EFF,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(../../assets/fonts/instrument-serif-italic-latin.woff2) format('woff2')}
@page{size:A4}   /* marges zet tools/pdf.swift (NSPrintInfo); een marge hier gaat daar overheen */
*{box-sizing:border-box;margin:0;padding:0}
body{font:9.2pt/1.55 Inter,Helvetica,Arial,sans-serif;color:#14130f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
em.serif{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:0}
.band{display:flex;align-items:center;justify-content:space-between;gap:18px;background:#14130f;color:#fff;border-radius:10px;padding:16px 20px}
.band img{height:44px;width:auto;display:block}
.band .gegevens{text-align:right;font-size:7.6pt;line-height:1.6;color:#cfccc5}
.band .gegevens b{color:#fff;font-weight:600}
.oog{display:flex;align-items:center;gap:10px;margin:22px 0 8px;font-size:7.4pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#b58a52}
.oog::after{content:'';width:60px;height:1px;background:#d9d5cc}
h1{font-size:25pt;line-height:1.05;font-weight:700;letter-spacing:-.025em;margin-bottom:10px}
h1 em.serif{font-size:1.12em}
.intro{color:#4a4740;font-weight:300;max-width:150mm;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #e9e7e1}
.artikel{break-inside:avoid;margin-bottom:11px}
.artikel .nr{display:block;font-size:6.8pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#b58a52}
h2{font-size:10.6pt;font-weight:700;letter-spacing:-.01em;margin:1px 0 4px}
ol{padding-left:15px;color:#2f2d28;font-weight:350}
li{margin-top:2.5px;padding-left:1px}
li::marker{color:#b58a52;font-weight:600;font-size:.92em}
.slot{margin-top:14px;padding-top:10px;border-top:1px solid #e9e7e1;display:flex;justify-content:space-between;gap:12px;font-size:7.6pt;color:#6b6762}
`;

const kop = `<div class="band"><img src="../../assets/logo-oud/ok-timmerwerken-wit.png" alt="OK Timmerwerken">
  <div class="gegevens"><b>OK Timmerwerken</b> · timmer- en betonwerk<br>${esc(bedrijf.adres)}<br>KvK ${bedrijf.kvk} · ${bedrijf.tel} · ${bedrijf.mail}</div></div>`;
const slot = (links) => `<div class="slot"><span>${links}</span><span>${bedrijf.web}</span></div>`;

// ---------- algemene voorwaarden ----------
const voorwaarden = `<!doctype html><html lang="nl"><meta charset="utf-8"><title>Algemene voorwaarden OK Timmerwerken</title><style>${stijl}</style>
<body>${kop}
<span class="oog">OK Timmerwerken · Gorinchem</span>
<h1>Algemene <em class="serif">voorwaarden</em></h1>
<p class="intro">${esc(v.intro)}</p>
${v.artikelen.map((a) => { const [nr, ...t] = a.titel.split(' - '); return `<div class="artikel"><span class="nr">${esc(nr)}</span><h2>${esc(t.join(' - '))}</h2><ol>${a.leden.map((l) => `<li>${esc(l)}</li>`).join('')}</ol></div>`; }).join('\n')}
${slot(esc(v.versie || ''))}
</body></html>`;

// ---------- modelformulier voor herroeping (model uit de bijlage bij art. 6:230m BW, toegespitst op aanneming van werk) ----------
const formulier = `<!doctype html><html lang="nl"><meta charset="utf-8"><title>Herroepingsformulier OK Timmerwerken</title><style>${stijl}
body{font-size:10pt}
.uitleg{max-width:150mm}
.uitleg{color:#4a4740;margin:4px 0 18px}
.aan{margin-bottom:16px;padding:12px 14px;background:#f4f2ee;border-left:3px solid #b58a52;border-radius:6px}
.veld{margin-top:16px}
.veld b{display:block;font-size:7.6pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6b6762;margin-bottom:2px}
.lijn{border-bottom:.8pt solid #b9b5ad;height:24px}
.tekst{margin-top:16px}
.noot{margin-top:22px;font-size:8.5pt;color:#6b6762}
</style><body>${kop}
<span class="oog">Artikel 7 · bedenktijd 14 dagen</span>
<h1>Herroepings<em class="serif">formulier</em></h1>
<p class="uitleg">Dit formulier alleen invullen en terugsturen als u de overeenkomst wilt herroepen. U kunt dat doen binnen 14 dagen nadat de overeenkomst is gesloten (zie artikel 7 van onze algemene voorwaarden).</p>
<div class="aan"><b>Aan:</b> ${esc(bedrijf.naam)}, ${esc(bedrijf.adres)}<br>E-mail: ${bedrijf.mail}</div>
<p class="tekst">Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende de uitvoering van het volgende werk / de levering van de volgende dienst (*) herroep/herroepen (*):</p>
<div class="veld"><div class="lijn"></div><div class="lijn"></div></div>
<div class="veld"><b>Overeenkomst gesloten op (datum offerte of akkoord):</b><div class="lijn"></div></div>
<div class="veld"><b>Naam/Namen consument(en):</b><div class="lijn"></div></div>
<div class="veld"><b>Adres consument(en):</b><div class="lijn"></div><div class="lijn"></div></div>
<div class="veld"><b>Handtekening van consument(en)</b> (alleen als dit formulier op papier wordt ingediend):<div class="lijn" style="height:44px"></div></div>
<div class="veld"><b>Datum:</b><div class="lijn"></div></div>
<p class="noot">(*) Doorhalen wat niet van toepassing is.<br>U mag de herroeping ook op een andere ondubbelzinnige manier melden, bijvoorbeeld per e-mail. Bent u op uw uitdrukkelijk verzoek binnen de bedenktijd al met het werk begonnen, dan betaalt u het deel dat al is uitgevoerd.</p>
${slot('Modelformulier voor herroeping')}
</body></html>`;

const swift = path.join(map, 'pdf');
if (!fs.existsSync(swift)) execFileSync('swiftc', ['-O', path.join(__dirname, 'pdf.swift'), '-o', swift], { stdio: 'inherit' });
for (const [naam, html] of [['algemene-voorwaarden-ok-timmerwerken', voorwaarden], ['herroepingsformulier-ok-timmerwerken', formulier]]) {
  const bron = path.join(map, `${naam}.html`);
  fs.writeFileSync(bron, html);
  const doel = path.join(root, 'assets/documenten', `${naam}.pdf`);
  console.log(execFileSync(swift, [bron, doel]).toString().trim());
}
