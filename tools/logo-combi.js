// Canonieke maatvoering van het nieuwe beeldmerk: de gevel van het oude logo,
// opnieuw getekend als vector, met een leesbare O en K erin.
//
// Alle maten zijn afgeleid van een meting van assets/logo-oud/ok-timmerwerken-origineel.png:
//   gevel 444 x 417 px, lijndikte 31 px, dakhelling 30 graden.
// Genormaliseerd op een breedte van 100 wordt dat: hoogte 94, lijndikte 7.
//
// Niets in dit bestand bevat een kleur. Het beeldmerk erft currentColor, dus
// dezelfde tekening dient als zwarte en als witte versie.

const DIKTE = 7;
const BREED = 100;
const HOOG = 94;

// Gevel. Hartlijnen, zodat de buitenmaat exact 100 x 94 wordt.
// Linker staander omhoog, over de nok, rechter staander omlaag. Geen onderregel:
// dat open onderstuk is precies wat het huidige logo kenmerkt.
const GEVEL = 'M3.5,94 V30.9 L50,4 L96.5,30.9 V94';

// Letters. Kapitaalhoogte 38,3 en een blok van 14 tot 86 breed, zodat er rondom
// precies een hele lijndikte lucht tussen de letters en de staanders overblijft.
// Minder lucht dan dat loopt bij verkleining als eerste dicht.
const O = { cx: 33.15, cy: 63, r: 15.65 };
const K = 'M59.6,47.35 V78.65 M59.6,63 L83.4,45.9 M59.6,63 L83.4,80.1';

// Het beeldmerk in twee groepen, omdat de gevel een stompe lijnafsluiting nodig
// heeft (anders steken de staanders onderuit) en de letters een rechte.
const beeldmerk = `  <g fill="none" stroke="currentColor" stroke-width="${DIKTE}" stroke-linejoin="miter">
    <path d="${GEVEL}" stroke-linecap="butt"/>
    <g stroke-linecap="square">
      <circle cx="${O.cx}" cy="${O.cy}" r="${O.r}"/>
      <path d="${K}"/>
    </g>
  </g>`;

// Favicon. Op 16 pixels wordt een lijn van 7/100 nog geen anderhalve pixel en
// lopen de letters dicht. Daarom alleen het silhouet, fors dikker: de gevel is
// het deel dat op die maat nog herkenbaar is.
const favicon = `  <path d="M6,94 V30.3 L50,4.5 L94,30.3 V94" fill="none" stroke="currentColor"
    stroke-width="12" stroke-linecap="butt" stroke-linejoin="miter"/>`;

function omhul(inhoud, viewBox, titel) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${titel}">
  <title>${titel}</title>
${inhoud}
</svg>
`;
}

module.exports = { DIKTE, BREED, HOOG, GEVEL, O, K, beeldmerk, favicon, omhul };
