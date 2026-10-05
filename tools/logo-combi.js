// Canonieke maatvoering van het beeldmerk: de gevel van het oude logo, opnieuw
// getekend als vector, met een leesbare O en K erin.
//
// Alle maten zijn afgeleid van een meting van assets/logo-oud/ok-timmerwerken-origineel.png:
//   gevel 444 x 417 px, lijndikte 31 px, dakhelling 30 graden.
// Genormaliseerd op een breedte van 100 wordt dat: hoogte 94, lijndikte 7.
//
// Dit bestand is de enige bron. Hieruit komen de SVG-bestanden, de PNG's (via
// tekening.json en tools/svg-naar-png.swift) en de previewpagina. Niets hier
// bevat een kleur: de tekening erft currentColor, dus dezelfde vorm dient als
// zwarte en als witte versie.

const DIKTE = 7;
const BREED = 100;
const HOOG = 94;

// Gevel. Hartlijnen, zodat de buitenmaat exact 100 bij 94 wordt. Linker staander
// omhoog, over de nok, rechter staander omlaag. Geen onderregel: dat open
// onderstuk is precies wat het huidige logo kenmerkt. De staanders hebben een
// stompe afsluiting, anders steken ze onder de grondlijn uit.
const GEVEL = 'M3.5,94 V30.9 L50,4 L96.5,30.9 V94';

// Letters. Kapitaalhoogte 38,3 in een blok van x=14 tot x=86, zodat er rondom
// precies een hele lijndikte lucht tussen de letters en de staanders overblijft.
// Minder lucht dan dat loopt bij verkleining als eerste dicht.
// De twee armen van de K zijn een doorlopende lijn met een knik, geen twee losse
// lijnen: losse lijnen krijgen allebei een rechte afsluiting die bij het hart van
// de stam naar achteren uitsteekt, en dat geeft een wigje links van de stam.
// De knik ligt op de rechterflank van de stam, zoals bij een gezette K. De
// verstekhoek daar valt binnen de stam en is dus onzichtbaar.
const O = { cx: 33.15, cy: 63, r: 15.65 };
const K = 'M59.6,47.35 V78.65 M83.6,46.1 L63.1,63 L83.6,79.9';

// De tekeningen. Elke tekening heeft een eigen vlak, want een favicon en een
// app-tegel zijn vierkant en het beeldmerk niet.
const tekeningen = {
  // Het volledige merk.
  beeldmerk: {
    breed: BREED, hoog: HOOG,
    elementen: [
      { soort: 'pad', d: GEVEL, dikte: DIKTE, afsluiting: 'butt' },
      { soort: 'cirkel', cx: O.cx, cy: O.cy, r: O.r, dikte: DIKTE },
      { soort: 'pad', d: K, dikte: DIKTE, afsluiting: 'square' },
    ],
  },

  // Vereenvoudiging voor het favicon. Op 16 pixels wordt een lijn van 7/100 nog
  // geen anderhalve pixel en lopen de letters dicht. Alleen het silhouet dus,
  // fors dikker: de gevel is het deel dat op die maat herkenbaar blijft.
  favicon: {
    breed: BREED, hoog: HOOG,
    elementen: [
      { soort: 'pad', d: 'M6,94 V30.3 L50,4.5 L94,30.3 V94', dikte: 12, afsluiting: 'butt' },
    ],
  },

};

// Een tekening passend in een vierkant vlak zetten. Zo hoeven de coordinaten
// van de tegels niet met de hand uitgerekend te worden - dat is precies waar
// een stille fout insluipt die pas bij de drukker opvalt.
function inVierkant(naam, vulling) {
  const t = tekeningen[naam];
  const f = (100 * vulling) / Math.max(t.breed, t.hoog);
  const dx = (100 - t.breed * f) / 2;
  const dy = (100 - t.hoog * f) / 2;

  // Alleen M, L en V komen voor; een getal na V is een y, de rest gaat op paren.
  const padOm = (d) => d.replace(/([MLV])([^MLV]*)/g, (_, cmd, rest) => {
    const g = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const om = cmd === 'V'
      ? g.map((y) => (y * f + dy).toFixed(2))
      : g.map((n, i) => (i % 2 === 0 ? n * f + dx : n * f + dy).toFixed(2));
    return cmd + (cmd === 'V' ? om.join(' ') : om.reduce((a, n, i) =>
      (i % 2 === 0 ? [...a, n] : [...a.slice(0, -1), a[a.length - 1] + ',' + n]), []).join(' ')) + ' ';
  }).trim();

  return {
    breed: 100, hoog: 100,
    elementen: t.elementen.map((e) => e.soort === 'cirkel'
      ? { ...e, cx: +(e.cx * f + dx).toFixed(2), cy: +(e.cy * f + dy).toFixed(2),
          r: +(e.r * f).toFixed(2), dikte: +(e.dikte * f).toFixed(2) }
      : { ...e, d: padOm(e.d), dikte: +(e.dikte * f).toFixed(2) }),
  };
}

// Vierkante favicon. Een favicon moet vierkant zijn, en op 16 pixels telt elke
// pixel: daarom bijna vullend, met net genoeg marge om niet af te snijden.
tekeningen.faviconvierkant = inVierkant('favicon', 0.94);

// Vierkante tegel voor een apple-touch-icon en een app-pictogram: alleen het
// silhouet, met lucht rondom zodat het niet tegen de rand plakt.
tekeningen.tegel = inVierkant('favicon', 0.76);

// Vierkante tegel met het volledige merk, voor een profielfoto op social, waar
// het groot genoeg staat om de letters te laten zien.
tekeningen.tegelvol = inVierkant('beeldmerk', 0.72);

// --- Opmaakvarianten -----------------------------------------------------
// Beeldmerk en woordmerk samen. Het woordmerk staat als letteromtrekken in
// tools/woordmerk-omtrekken.js, zodat hier geen lettertype nodig is.

const woord = require('./woordmerk-omtrekken.js');

// Het woordmerk op een gewenste kapitaalhoogte zetten, met de basislijn op y=0.
function woordElement(sleutel, kapitaal, dx, dy) {
  const w = woord[sleutel];
  const f = kapitaal / w.kapitaal;
  return {
    element: { soort: 'vorm', d: w.d, plaatsing: { f: +f.toFixed(5), dx, dy } },
    breedte: w.breedte * f,
  };
}

// Liggend: beeldmerk links, woordmerk rechts. Voor de navigatiebalk, de
// mailhandtekening en een briefhoofd. De kapitaalhoogte van het woord is 34
// procent van de hoogte van het merk - dezelfde verhouding als in de preview.
{
  const merkHoog = HOOG;
  const kapitaal = merkHoog * 0.34;
  const tussen = merkHoog * 0.38;
  const w = woordElement('volledig', kapitaal, BREED + tussen, merkHoog / 2 + kapitaal / 2);
  tekeningen.liggend = {
    breed: +(BREED + tussen + w.breedte).toFixed(2),
    hoog: merkHoog,
    elementen: [...tekeningen.beeldmerk.elementen, w.element],
  };
}

// Staand: beeldmerk boven, woordmerk eronder - de opbouw van het huidige logo.
{
  const kapitaal = HOOG * 0.17;
  const tussen = HOOG * 0.20;
  const w = woordElement('timmerwerken', kapitaal, 0, 0);
  const breed = Math.max(BREED, w.breedte);
  // Beide onderdelen horizontaal centreren in het gezamenlijke vlak.
  const merkOp = (breed - BREED) / 2;
  w.element.plaatsing.dx = (breed - w.breedte) / 2;
  w.element.plaatsing.dy = HOOG + tussen + kapitaal;
  tekeningen.staand = {
    breed: +breed.toFixed(2),
    hoog: +(HOOG + tussen + kapitaal).toFixed(2),
    elementen: [
      ...tekeningen.beeldmerk.elementen.map((e) => ({
        ...e, plaatsing: { f: 1, dx: +merkOp.toFixed(2), dy: 0 },
      })),
      w.element,
    ],
  };
}

// Een tekening centreren in een rechthoekig vlak, op een deel van de hoogte.
// Voor social-banners: een breed vlak met de liggende opmaak in het midden.
function inVlak(naam, breed, hoog, deelVanHoogte) {
  const t = tekeningen[naam];
  const f = (hoog * deelVanHoogte) / t.hoog;
  const dx = (breed - t.breed * f) / 2;
  const dy = (hoog - t.hoog * f) / 2;
  return {
    breed, hoog,
    elementen: t.elementen.map((e) => ({
      ...e,
      plaatsing: {
        f: +((e.plaatsing ? e.plaatsing.f : 1) * f).toFixed(5),
        dx: +(dx + (e.plaatsing ? e.plaatsing.dx * f : 0)).toFixed(2),
        dy: +(dy + (e.plaatsing ? e.plaatsing.dy * f : 0)).toFixed(2),
      },
    })),
  };
}

// Social-banners, met de liggende opmaak gecentreerd. De maten zijn de gangbare
// omslagformaten; de kleur bepaalt de rasteraar (wit merk op een zwart vlak).
tekeningen.bannerLinkedin = inVlak('liggend', 1584, 396, 0.34);
tekeningen.bannerFacebook = inVlak('liggend', 1640, 624, 0.30);

const beeldmerk = tekeningen.beeldmerk.elementen;
const favicon = tekeningen.favicon.elementen;

// --- Uitvoer naar SVG ----------------------------------------------------

function elementNaarSvg(e) {
  // Een element mag een eigen schaal en verschuiving hebben; zo passen het
  // beeldmerk en het woordmerk in een gezamenlijke opmaak zonder dat hun
  // coordinaten met de hand omgerekend worden.
  const plaats = e.plaatsing
    ? ` transform="translate(${e.plaatsing.dx} ${e.plaatsing.dy}) scale(${e.plaatsing.f})"`
    : '';

  // Een gevulde vorm is het woordmerk; de rest is lijnwerk.
  if (e.soort === 'vorm') {
    return `  <path d="${e.d}" fill="currentColor"${plaats}/>`;
  }
  const g = `fill="none" stroke="currentColor" stroke-width="${e.dikte}" stroke-linejoin="miter"`;
  if (e.soort === 'cirkel') {
    return `  <circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" ${g}${plaats}/>`;
  }
  return `  <path d="${e.d}" ${g} stroke-linecap="${e.afsluiting}"${plaats}/>`;
}

function naarSvg(naam, titel) {
  const t = tekeningen[naam];
  const body = t.elementen.map(elementNaarSvg).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.breed} ${t.hoog}" role="img" aria-label="${titel}">
  <title>${titel}</title>
${body}
</svg>
`;
}

// Alleen de binnenkant, voor inbedding in een pagina waar de omhulling al staat.
function naarSvgBinnenkant(elementen) {
  return elementen.map(elementNaarSvg).join('\n');
}

module.exports = {
  DIKTE, BREED, HOOG, GEVEL, O, K,
  tekeningen, beeldmerk, favicon,
  naarSvg, naarSvgBinnenkant,
};
