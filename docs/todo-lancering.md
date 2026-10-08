# To-do lancering OK Timmerwerken — wat wij (Thomas + Claude) nog moeten doen

Stand: 7 oktober 2026. Wat Ozcan moet aanleveren of bevestigen staat in `docs/checklist-ozcan.md`.
De technische details van de livegang staan ook in `PROJECT.md` (Checklist livegang).

## Huidige situatie (gecontroleerd op 7 oktober 2026)
| Onderdeel | Waar | Bijzonderheden |
|---|---|---|
| Domein ok-timmerwerken.nl | **GoDaddy** (nameservers ns47/ns48.domaincontrol.com) | Hier passen we de DNS aan |
| Huidige website | **Duda** (`s.multiscreensite.com`) | Opzeggen pas als de nieuwe site goed draait |
| E-mail info@ | **Microsoft 365 via GoDaddy**, spamfilter Proofpoint (`mx1/mx2-us1.ppe-hosted.com`) | ⚠️ MX- en TXT-records **nooit** wijzigen |
| Nieuwe hosting | nog navragen bij Ozcan (vermoedelijk GoDaddy) | Toegang nodig |
| Testomgeving | GitHub Pages, repo **openbaar** | Niet vindbaar (noindex), maar wel openbaar |

---

## Fase 1 — Vóór de livegang (kan nu al / zodra antwoorden binnen zijn)

### Inhoud verwerken (na antwoorden Ozcan)
- [ ] Werktijden aanpassen in `docs/inhoud.json` → `werktijden` (site, footer, contactpagina en Google-gegevens volgen vanzelf);
      ook de omschrijving van de contactpagina (noemt de tijden) en de "nu open"-melding in `preview/d-lijn.html` (gedeeld script) nalopen.
- [ ] "500+ projecten" bevestigen of aanpassen (home-hero en Over ons).
- [ ] Tijdlijn aanvullen (`inhoud.over.tijdlijn`: status `navragen` → `zeker` met jaartal).
- [ ] Diensten: klussen die Ozcan niet meer doet weghalen (en hun doorverwijzing naar de dienstpagina zelf laten wijzen).
- [ ] Tekstcorrecties van Ozcan verwerken (FAQ, aanpak, Over ons, citaat contact).
- [ ] Privacyverklaring: naam hostingpartij, bewaartermijn, cookies invullen; `concept: false` zetten.
- [ ] Nieuwe foto's verwerken (VELUX, recente projecten), indien aangeleverd.
- [ ] Jaartal in de footer (`© 2026`) automatisch laten meelopen.

### Cookiebanner + Google Analytics 4
- [ ] Meet-ID (`G-…`) van Ozcan ontvangen.
- [ ] Eigen, lichte cookiebanner bouwen (huisstijl, geen extern pakket): knoppen **Accepteren** en **Weigeren** even duidelijk,
      keuze onthouden, later te wijzigen via een link "Cookie-instellingen" in de footer.
- [ ] Google Consent Mode v2: standaard alles `denied`; GA4-script pas laden ná Accepteren.
- [ ] Meetpunten instellen als "key events": formulier verstuurd, klik op bellen, WhatsApp en mail.
- [ ] In GA4: gegevensbewaring op 14 maanden, gegevensdeling uit, Google Signals uit, verwerkersvoorwaarden geaccepteerd.
- [ ] Privacyverklaring aanvullen: welke cookies (`_ga`, `_ga_…`), doel, bewaartermijn, Google als verwerker, intrekken van toestemming.
- [ ] Testen: zonder toestemming geen verzoek naar Google; na Accepteren wel (netwerktab controleren).

### Contactformulier (Web3Forms)
- [ ] Toegangssleutel aanmaken op het e-mailadres van Ozcan (hij klikt de bevestigingsmail).
- [ ] Formulier koppelen: verzenden via Web3Forms, nette bedankmelding op de pagina, foutmelding met telefoon/WhatsApp als terugval.
- [ ] Spambescherming: verborgen "honeypot"-veld (geen extra cookies of externe diensten).
- [ ] Testmelding ("formulier is nog in de testfase") weghalen.
- [ ] Proefaanvraag versturen en controleren dat hij **niet** in de spam van Microsoft 365/Proofpoint belandt
      (zo nodig het afzendadres van Web3Forms als veilige afzender toevoegen).

### Technische voorbereiding
- [ ] `SITE` in `tools/genereer-paginas.js` → `https://www.ok-timmerwerken.nl/` (canonical, deelvoorbeeld, sitemap, Google-gegevens).
- [ ] Kiezen: `www.ok-timmerwerken.nl` of zonder www als hoofdadres (advies: met www, zoals nu bij Duda); de andere doorsturen.
- [ ] `noindex` weghalen (`preview/d-lijn.html` en `pagina()` in de generator).
- [ ] `robots.txt`: `User-agent: *` / `Allow: /` / `Sitemap: https://www.ok-timmerwerken.nl/sitemap.xml`.
- [ ] `.htaccess` maken (als de hosting Apache is):
  - [ ] https afdwingen en www/zonder-www gelijktrekken (301)
  - [ ] echte 301-doorverwijzingen voor de 41 oude adressen (uit `inhoud.doorverwijzingen`), ook mét en zonder slash
  - [ ] `ErrorDocument 404 /404.html`
  - [ ] beveiligingsheaders: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Content-Security-Policy (afgestemd op GA4)
  - [ ] caching: lang voor beelden/lettertypes/video, kort voor html
- [ ] Bepalen hoe we uploaden: via het beheerpaneel/FTP, of automatisch vanuit GitHub (deploy-actie met de inlog als geheim).
- [ ] Lijst maken van wat er **niet** online hoeft: `preview/`, `docs/`, `tools/`, `.git`, `.claude`, `assets/whatsapp`, proefbestanden.

### Back-up van de oude site
- [ ] Laatste controle dat alles van de Duda-site is overgenomen (gedaan op 7 okt: alle 44 pagina's, voorwaarden, disclaimer, reviews).
- [ ] Schermafbeeldingen/pdf van de oude pagina's bewaren in `docs/` (naslag voor als er later vragen komen).

---

## Fase 2 — Livegang (op een rustig moment, bijvoorbeeld 's avonds)

- [ ] 1–2 dagen vooraf: TTL van de A- en CNAME-records bij GoDaddy verlagen (bv. 600 seconden), zodat de overstap snel doorwerkt.
- [ ] Site bouwen (`node tools/genereer-paginas.js`) en uploaden naar de nieuwe hosting.
- [ ] Indien mogelijk eerst testen op het tijdelijke adres van de hosting.
- [ ] DNS bij GoDaddy: **alleen** de A-record (`@`) en de CNAME `www` naar de nieuwe hosting laten wijzen.
      ⚠️ MX, TXT (SPF, Microsoft-verificatie) en eventuele `autodiscover`-records ongemoeid laten.
- [ ] Domein bij Duda loskoppelen (zodat Duda niet blijft proberen het domein te gebruiken).
- [ ] https-certificaat aanzetten op de nieuwe hosting.
- [ ] Na de overstap controleren:
  - [ ] alle pagina's laden via https, op desktop en mobiel
  - [ ] de 41 oude adressen sturen met een 301 door naar de juiste plek (script met curl)
  - [ ] onbekend adres → 404-pagina
  - [ ] formulier verstuurt en mail komt aan bij Ozcan
  - [ ] cookiebanner: weigeren = geen Google, accepteren = GA4 meet (realtime in GA4)
  - [ ] e-mail van en naar info@ok-timmerwerken.nl werkt nog (proefmail heen en terug)
  - [ ] favicon, deelvoorbeeld (WhatsApp, Facebook Sharing Debugger), sitemap.xml, robots.txt

---

## Fase 3 — Na de livegang (eerste weken)

### Google
- [ ] **Google Search Console**: domeineigendom toevoegen (verificatie via DNS-TXT bij GoDaddy — naast de bestaande TXT-records, niets verwijderen).
- [ ] Sitemap indienen: `https://www.ok-timmerwerken.nl/sitemap.xml`.
- [ ] Indexering aanvragen (URL-inspectie) voor de homepage, de 8 dienstpagina's, Over ons, Reviews en Contact.
- [ ] Na 1–2 weken: rapport "Pagina's" nalopen (niet geïndexeerd, 404's, doorverwijzingen) en oplossen.
- [ ] Search Console koppelen aan GA4.
- [ ] Bing Webmaster Tools: site importeren vanuit Search Console (2 minuten werk, extra vindbaarheid).
- [ ] **Google-bedrijfsprofiel**: website-link naar de nieuwe site, werktijden gelijk aan de site, eventueel een paar nieuwe foto's.
- [ ] Rich Results Test draaien op de homepage (controle van de bedrijfsgegevens voor Google).

### Overige
- [ ] Audit opnieuw draaien op het echte domein (`squirrel audit https://www.ok-timmerwerken.nl --format llm -C full`) en de laatste punten oplossen.
- [ ] Links naar de nieuwe site op Werkspot, Instagram en in de mailhandtekening.
- [ ] Duda-abonnement opzeggen, pas als alles minimaal 2 weken goed draait (en na een laatste back-up).
- [ ] Testomgeving: GitHub Pages uitzetten of de repo privé maken (de repo is nu openbaar, met o.a. het portret).
- [ ] `PROJECT.md` bijwerken: livegang gedaan, waar de site staat, hoe je een wijziging publiceert.

---

## Doorlopend onderhoud
- [ ] Reviews elke paar maanden bijwerken (`docs/reviews.json`, scores en aantallen op home, Over ons en reviewpagina lopen mee).
- [ ] Nieuwe projectfoto's toevoegen aan de galerijen (`docs/inhoud.json` → `galerij`).
- [ ] Maandelijks even in Search Console en GA4 kijken (fouten, zoekwoorden, aanvragen).
- [ ] Tijdlijn en "500+ projecten" af en toe bijwerken (jaren lopen al vanzelf mee).

## Optioneel (kleine winst)
- [x] `llms.txt` voor AI-zoekmachines (wordt door de generator gemaakt uit `docs/inhoud.json` en `docs/reviews.json`; loopt mee met `SITE`).
- [x] Inline CSS/JS verkleinen bij het bouwen (~10 KB per pagina).
- [ ] Foto's in WebP-formaat (iets lichter; meer werk).
