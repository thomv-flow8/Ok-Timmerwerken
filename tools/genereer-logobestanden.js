// Schrijft het volledige logopakket uit tools/logo-combi.js.
// Bewerk nooit de uitvoer; bewerk de maatvoering en draai dit opnieuw.
//
//   node tools/genereer-logobestanden.js
//   swift tools/tekening-naar-png.swift assets/logo-nieuw/tekening.json assets/logo-nieuw/png

const fs = require('fs');
const path = require('path');
const m = require('./logo-combi.js');

const uit = path.join(__dirname, '..', 'assets', 'logo-nieuw');
fs.mkdirSync(uit, { recursive: true });

const ZWART = [0, 0, 0];
const WIT = [255, 255, 255];

// --- SVG -----------------------------------------------------------------
// currentColor is de werkversie voor op de site; de vaste varianten zijn voor
// wie een los bestand krijgt aangeleverd, zoals een drukker of borduurder.
const vast = (svg, kleur) => svg.replace(/currentColor/g, kleur);

const svgs = {};
for (const naam of ['beeldmerk', 'faviconvierkant', 'tegel', 'tegelvol', 'liggend', 'staand']) {
  const basis = m.naarSvg(naam, 'OK Timmerwerken');
  svgs[`${naam}.svg`] = basis;
  svgs[`${naam}-zwart.svg`] = vast(basis, '#000000');
  svgs[`${naam}-wit.svg`] = vast(basis, '#ffffff');
}
for (const [naam, inhoud] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(uit, naam), inhoud);
}

// --- Opdrachtenlijst voor de rasteraar ------------------------------------
const uitvoer = [];
const opdracht = (naam, bestand, breedte, kleur, achtergrond) =>
  uitvoer.push({ naam, bestand, breedte, kleur, ...(achtergrond ? { achtergrond } : {}) });

// Het merk op drukmaat, doorzichtig, in beide kleuren.
for (const b of [512, 1024, 2048]) {
  opdracht('beeldmerk', `beeldmerk-zwart-${b}.png`, b, ZWART);
  opdracht('beeldmerk', `beeldmerk-wit-${b}.png`, b, WIT);
}

// Favicon. Vierkant, en doorzichtig zodat de browser zelf de achtergrond bepaalt.
for (const b of [16, 32, 48, 64]) {
  opdracht('faviconvierkant', `favicon-zwart-${b}.png`, b, ZWART);
  opdracht('faviconvierkant', `favicon-wit-${b}.png`, b, WIT);
}

// Apple-touch-icon en app-tegels: die verdragen geen doorzichtigheid, dus wit
// silhouet op een zwart vlak.
opdracht('tegel', 'apple-touch-icon-180.png', 180, WIT, ZWART);
opdracht('tegel', 'app-tegel-192.png', 192, WIT, ZWART);
opdracht('tegel', 'app-tegel-512.png', 512, WIT, ZWART);

// Profielfoto voor social: daar staat het groot genoeg voor de letters.
opdracht('tegelvol', 'profielfoto-1000.png', 1000, WIT, ZWART);
opdracht('tegelvol', 'profielfoto-licht-1000.png', 1000, ZWART, [245, 245, 240]);

// De opmaakvarianten met woordmerk, doorzichtig, in beide kleuren.
for (const b of [800, 1600, 3200]) {
  opdracht('liggend', `liggend-zwart-${b}.png`, b, ZWART);
  opdracht('liggend', `liggend-wit-${b}.png`, b, WIT);
}
for (const b of [600, 1200]) {
  opdracht('staand', `staand-zwart-${b}.png`, b, ZWART);
  opdracht('staand', `staand-wit-${b}.png`, b, WIT);
}

// Mailhandtekening: een vaste, kleine maat op twee keer de schermdichtheid.
// Veel mailprogramma's tonen geen SVG, dus dit moet een PNG zijn.
opdracht('liggend', 'mailhandtekening-440.png', 440, ZWART);
opdracht('liggend', 'mailhandtekening-licht-440.png', 440, WIT);

// Social-banners: wit merk op een zwart vlak. De banner moet dus wel gevuld
// worden - geen doorzichtigheid.
opdracht('bannerLinkedin', 'banner-linkedin-1584.png', 1584, WIT, ZWART);
opdracht('bannerFacebook', 'banner-facebook-1640.png', 1640, WIT, ZWART);

fs.writeFileSync(
  path.join(uit, 'tekening.json'),
  JSON.stringify({ tekeningen: m.tekeningen, uitvoer }, null, 2) + '\n'
);

console.log(`${Object.keys(svgs).length} SVG's en een opdrachtenlijst van ${uitvoer.length} PNG's geschreven naar assets/logo-nieuw/`);
