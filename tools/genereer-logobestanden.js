// Schrijft de SVG-bestanden en de previewpagina uit tools/logo-combi.js.
// Bewerk nooit de uitvoer; bewerk de maatvoering en draai dit opnieuw.

const fs = require('fs');
const path = require('path');
const m = require('./logo-combi.js');

const wortel = path.join(__dirname, '..');
const uit = path.join(wortel, 'assets', 'logo-nieuw');
fs.mkdirSync(uit, { recursive: true });

// Een vaste kleur in plaats van currentColor, voor bestanden die los worden
// aangeleverd aan een drukker of borduurder.
const vast = (svg, kleur) => svg.replace(/currentColor/g, kleur);

const beeldmerk = m.omhul(m.beeldmerk, `0 0 ${m.BREED} ${m.HOOG}`, 'OK Timmerwerken');
const faviconSvg = m.omhul(m.favicon, `0 0 ${m.BREED} ${m.HOOG}`, 'OK Timmerwerken');

const bestanden = {
  'beeldmerk.svg': beeldmerk,
  'beeldmerk-zwart.svg': vast(beeldmerk, '#000000'),
  'beeldmerk-wit.svg': vast(beeldmerk, '#ffffff'),
  'favicon.svg': faviconSvg,
  'favicon-zwart.svg': vast(faviconSvg, '#000000'),
  'favicon-wit.svg': vast(faviconSvg, '#ffffff'),
};

for (const [naam, inhoud] of Object.entries(bestanden)) {
  fs.writeFileSync(path.join(uit, naam), inhoud);
}
console.log(`${Object.keys(bestanden).length} bestanden geschreven naar assets/logo-nieuw/`);
