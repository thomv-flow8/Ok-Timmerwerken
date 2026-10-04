// Bron voor alle logoconcepten. Eén plek: zowel de previewpagina als de
// losse SVG-bestanden worden hieruit gegenereerd.
// `svg` bevat alleen de binnenkant; `currentColor` maakt elk concept herkleurbaar.

module.exports = [
  {
    id: 'gevel',
    naam: 'Gevel',
    viewBox: '0 0 100 100',
    idee: 'De evolutie van het huidige logo: het gevelsilhouet blijft, maar wordt een gesloten vorm met de letters OK eruit gespaard.',
    sterk: 'Herkenbaar voor bestaande klanten, en het monogram is eindelijk leesbaar.',
    zwak: 'De uitgespaarde letters lopen op 16 pixels dicht; als favicon is een vereenvoudigde versie nodig.',
    svg: `<mask id="m-gevel">
    <rect width="100" height="100" fill="#fff"/>
    <circle cx="35" cy="69" r="13" fill="none" stroke="#000" stroke-width="7"/>
    <path d="M63,56 V82 M63,69 L79,55 M63,69 L79,83" fill="none" stroke="#000" stroke-width="7" stroke-linecap="square"/>
  </mask>
  <path d="M8,44 L50,10 L92,44 L92,94 L8,94 Z" fill="currentColor" mask="url(#m-gevel)"/>`,
  },
  {
    id: 'spant',
    naam: 'Spant',
    viewBox: '0 0 100 100',
    idee: 'Geen huis maar een dakspant: twee kepers, een trekbalk en een hanenbalk — het meest herkenbare teken van timmerwerk dat er bestaat.',
    sterk: 'Bouwkundig en eigen. Van alle concepten het best schaalbaar: blijft op 16 pixels leesbaar.',
    zwak: 'Zegt niets over beton, en bevat de letters OK niet.',
    svg: `<g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square">
    <path d="M8,72 L50,30 L92,72"/><path d="M8,72 H92"/><path d="M50,30 V72"/>
  </g>`,
  },
  {
    id: 'monogram',
    naam: 'Monogram',
    viewBox: '0 0 100 86',
    idee: 'De letters zelf zijn het merk: een perfecte cirkel als O en een K waarvan de bovenarm op dakhelling staat.',
    sterk: 'Het meest eigentijds, en het sterkst op social waar een profielfoto rond is.',
    zwak: 'De verwijzing naar het dak is subtiel; zonder uitleg ziet niet iedereen die.',
    svg: `<g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="square">
    <circle cx="31" cy="43" r="22"/>
    <path d="M66,21 V65 M66,43 L88,21 M66,43 L88,65"/>
  </g>`,
  },
  {
    id: 'verstek',
    naam: 'Verstek',
    viewBox: '0 0 100 100',
    idee: 'Een hoek van twee balken, met de verstekzaagsnede van 45 graden er zichtbaar in. De verbinding waar een timmerman op afgerekend wordt.',
    sterk: 'Volwassen en bouwkundig, zonder cliché huisje. Werkt uitstekend als beeldmerk op briefpapier en als watermerk.',
    zwak: 'Het meest abstract van de acht: wie geen timmerman is, ziet een hoekstuk en geen verbinding. Bevat de letters OK niet.',
    svg: `<mask id="m-verstek">
    <rect width="100" height="100" fill="#fff"/>
    <path d="M66,66 L88,88" stroke="#000" stroke-width="6"/>
  </mask>
  <path d="M88,12 H66 V66 H12 V88 H88 Z" fill="currentColor" mask="url(#m-verstek)"/>`,
  },
  {
    id: 'keper',
    naam: 'Keper',
    viewBox: '0 0 100 96',
    idee: 'Een dakvlak dat als een luifel over de letters OK heen ligt. Combineert de naam met het vak, zonder het huis helemaal uit te tekenen.',
    sterk: 'Naam én vak in één teken, en ruimtelijk: het dak beschermt de letters. Sluit aan op "uw zorg is onze zorg".',
    zwak: 'Drie losse onderdelen; het is het drukste van de acht en verliest het meest bij verkleining.',
    svg: `<g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="square">
    <path d="M6,36 L50,8 L94,36"/>
    <circle cx="27" cy="66" r="17"/>
    <path d="M67,49 V83 M67,66 L87,49 M67,66 L87,83"/>
  </g>`,
  },
  {
    id: 'stempel',
    naam: 'Stempel',
    viewBox: '0 0 100 100',
    idee: 'Een massief vierkant met afgeronde hoeken en OK eruit gespaard — een keurmerk of gietstempel, zoals je die in beton drukt.',
    sterk: 'Leest als een kwaliteitszegel en sluit aan op garantie en de Velux-erkenning. Perfect vierkant, dus ideaal als profielfoto en app-icoon.',
    zwak: 'Minder eigen: een afgerond vierkant met initialen is een veelgebruikte vorm.',
    svg: `<mask id="m-stempel">
    <rect width="100" height="100" fill="#fff"/>
    <circle cx="36" cy="50" r="14" fill="none" stroke="#000" stroke-width="7"/>
    <path d="M64,36 V64 M64,50 L80,36 M64,50 L80,64" fill="none" stroke="#000" stroke-width="7" stroke-linecap="square"/>
  </mask>
  <rect x="6" y="6" width="88" height="88" rx="16" fill="currentColor" mask="url(#m-stempel)"/>`,
  },
  {
    id: 'gevel-open',
    naam: 'Gevel open',
    viewBox: '0 0 100 100',
    idee: 'Dezelfde gevel als concept 1, maar omgekeerd: een getekende omtrek met de letters massief erin.',
    sterk: 'Lichter en eleganter dan de dichte variant, en de letters blijven bij verkleining langer leesbaar.',
    zwak: 'Een dunne omtrek is kwetsbaar: op werkkleding en bij gravures vult hij snel dicht.',
    svg: `<g fill="none" stroke="currentColor" stroke-linejoin="miter">
    <path d="M10,46 L50,12 L90,46 L90,90 L10,90 Z" stroke-width="8"/>
    <circle cx="35" cy="68" r="11" stroke-width="6"/>
    <path d="M63,57 V79 M63,68 L77,56 M63,68 L77,80" stroke-width="6" stroke-linecap="square"/>
  </g>`,
  },
];
