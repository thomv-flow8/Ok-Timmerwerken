# To-do lancering OK Timmerwerken — wat wij (Thomas + Claude) nog moeten doen

Stand: 9 oktober 2026. Wat Ozcan moet aanleveren of bevestigen staat in `docs/checklist-ozcan.md`.
De technische details van de livegang staan ook in `PROJECT.md` (Checklist livegang).

## Huidige situatie
| Onderdeel | Waar | Bijzonderheden |
|---|---|---|
| Domein ok-timmerwerken.nl | **GoDaddy** (nameservers ns47/ns48.domaincontrol.com) | Hier passen we de DNS aan |
| Huidige website | **Duda** (`s.multiscreensite.com`) | Opzeggen pas als de nieuwe site goed draait |
| E-mail info@ | **Microsoft 365 via GoDaddy**, spamfilter Proofpoint (`mx1/mx2-us1.ppe-hosted.com`) | ⚠️ MX- en TXT-records **nooit** wijzigen |
| Nieuwe hosting | nog navragen bij Ozcan (vermoedelijk GoDaddy) | Toegang nodig |
| Testomgeving | GitHub Pages, repo **openbaar** | Niet vindbaar (noindex), maar wel openbaar |
| Audit testsite | 56 (9 okt) | Rest van de aftrek is testomgeving; verwachting na livegang 80+ |

## Al gedaan (sinds 7 oktober)
- [x] Algemene voorwaarden 1.0 + pdf in huisstijl + herroepingsformulier (`node tools/genereer-documenten.js`)
- [x] Jaartal in de footer loopt automatisch mee
- [x] `llms.txt` en een Markdown-versie (`index.md`) van elke pagina
- [x] Foto's < 200 KB, CSS/JS/pictogrammen als losse cachebare bestanden, reviews deels uitgesteld geladen
- [x] Voor-en-na in de galerijen, galerijen geordend met Ozcan, fotostrook gelijk aan de galerijen

---

## Fase 1 — Vóór de livegang (zodra Ozcan akkoord is / antwoorden binnen zijn)

### Inhoud verwerken
- [ ] Antwoorden uit `docs/checklist-ozcan.md` verwerken: werktijden (`docs/inhoud.json` → `werktijden`, plus de omschrijving
      van de contactpagina), 500+, tijdlijn (`navragen` → `zeker`), diensten, tekstcorrecties, portret/renders, auteursregel.
- [ ] Privacyverklaring: hostingpartij, bewaartermijn, Web3Forms en cookies/GA4 invullen; `concept: false` zetten.
- [ ] Voorwaarden: ingangsdatum invullen (`juridisch.voorwaarden.versie`) en pdf opnieuw maken (`node tools/genereer-documenten.js`).
- [ ] Eventuele jurist-opmerkingen verwerken.

### Contactformulier (Web3Forms)
- [ ] Toegangssleutel aanmaken op info@ok-timmerwerken.nl (Ozcan klikt de bevestigingsmail).
- [ ] Formulier koppelen: verzenden via Web3Forms, nette bedankmelding, foutmelding met telefoon/WhatsApp als terugval.
- [ ] Spambescherming: verborgen "honeypot"-veld (lost ook de audit-waarschuwing "formulier zonder CAPTCHA" grotendeels op).
- [ ] Testmelding ("formulier is nog in de testfase") weghalen (`tools/genereer-paginas.js`, contactpagina).
- [ ] Proefaanvraag versturen; controleren dat hij **niet** in de spam van Microsoft 365/Proofpoint belandt.

### Cookiebanner + Google Analytics 4
- [ ] Meet-ID (`G-…`) van Ozcan ontvangen.
- [ ] Eigen, lichte cookiebanner (huisstijl): **Accepteren** en **Weigeren** even duidelijk, keuze onthouden,
      later te wijzigen via "Cookie-instellingen" in de footer.
- [ ] Google Consent Mode v2: standaard alles `denied`; GA4 pas laden ná Accepteren.
- [ ] Key events: formulier verstuurd, klik op bellen, WhatsApp en mail.
- [ ] In GA4: bewaring 14 maanden, gegevensdeling uit, Google Signals uit, verwerkersvoorwaarden geaccepteerd.
- [ ] Privacyverklaring aanvullen met de cookies (`_ga`, `_ga_…`), doel, bewaartermijn, Google als verwerker.
- [ ] Testen: zonder toestemming geen verzoek naar Google; na Accepteren wel.

### Technische voorbereiding
- [ ] `SITE` in `tools/genereer-paginas.js` → `https://www.ok-timmerwerken.nl/` (canonical, deelvoorbeeld, sitemap, Google-gegevens, llms.txt).
- [ ] Kiezen: met of zonder www als hoofdadres (advies: met www); de andere doorsturen.
- [ ] `noindex` weghalen: `preview/d-lijn.html` (regel 7) en `pagina()` in de generator. (De doorverwijspagina's houden noindex.)
- [ ] `robots.txt` → `User-agent: *` / `Allow: /` / `Sitemap: https://www.ok-timmerwerken.nl/sitemap.xml`.
- [ ] `.htaccess` (als de hosting Apache is):
  - [ ] https afdwingen en www/zonder-www gelijktrekken (301)
  - [ ] echte 301-doorverwijzingen voor de 41 oude adressen (uit `inhoud.doorverwijzingen`), met en zonder slash
  - [ ] `ErrorDocument 404 /404.html`
  - [ ] beveiligingsheaders: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Content-Security-Policy (afgestemd op GA4 en Web3Forms)
  - [ ] caching: lang voor `assets/` (beelden, lettertypes, video, css/js met hash), kort voor html
  - [ ] Markdown voor AI-assistenten: bij `Accept: text/markdown` de `index.md` van de pagina geven
- [ ] Uploadmethode kiezen: beheerpaneel/FTP, of automatisch vanuit GitHub (deploy-actie met de inlog als geheim).
- [ ] Niet uploaden: `preview/`, `docs/`, `tools/`, `.git`, `.claude`, `assets/whatsapp`, `assets/aangeleverd`, ruwe renders.

---

## Fase 2 — Livegang (op een rustig moment, bijvoorbeeld 's avonds)
- [ ] 1–2 dagen vooraf: TTL van de A- en CNAME-records bij GoDaddy verlagen (bv. 600 seconden).
- [ ] Site bouwen (`node tools/genereer-paginas.js`) en uploaden; zo mogelijk eerst testen op het tijdelijke adres van de hosting.
- [ ] DNS bij GoDaddy: **alleen** de A-record (`@`) en de CNAME `www` naar de nieuwe hosting.
      ⚠️ MX, TXT (SPF, Microsoft-verificatie) en `autodiscover` ongemoeid laten.
- [ ] Domein bij Duda loskoppelen.
- [ ] https-certificaat aanzetten.
- [ ] Controleren:
  - [ ] alle pagina's via https, desktop en mobiel
  - [ ] de 41 oude adressen geven een 301 naar de juiste plek (script met curl)
  - [ ] onbekend adres → 404-pagina
  - [ ] formulier verstuurt, mail komt aan bij Ozcan
  - [ ] cookiebanner: weigeren = geen Google, accepteren = GA4 meet (realtime)
  - [ ] e-mail van en naar info@ok-timmerwerken.nl werkt nog
  - [ ] favicon, deelvoorbeeld (WhatsApp, Facebook Sharing Debugger), sitemap.xml, robots.txt, llms.txt

---

## Fase 3 — Na de livegang (eerste weken)

### Google
- [ ] **Search Console**: domeineigendom toevoegen (DNS-TXT bij GoDaddy, naast de bestaande TXT-records).
- [ ] Sitemap indienen: `https://www.ok-timmerwerken.nl/sitemap.xml`.
- [ ] Indexering aanvragen (URL-inspectie) voor home, de 8 dienstpagina's, Over ons, Reviews en Contact.
- [ ] Na 1–2 weken: rapport "Pagina's" nalopen (niet geïndexeerd, 404's, doorverwijzingen).
- [ ] Search Console koppelen aan GA4.
- [ ] Bing Webmaster Tools: site importeren vanuit Search Console.
- [ ] Google-bedrijfsprofiel: websitelink en werktijden gelijk aan de site.
- [ ] Rich Results Test op de home en een dienstpagina.

### Overige
- [ ] Audit op het echte domein (`squirrel audit https://www.ok-timmerwerken.nl --format llm -C full`) en laatste punten oplossen.
- [ ] Links naar de nieuwe site op Werkspot, Instagram en in de mailhandtekening.
- [ ] Duda opzeggen na minimaal 2 weken goed draaien (en na een laatste back-up).
- [ ] Testomgeving: GitHub Pages uitzetten of de repo privé maken.
- [ ] `PROJECT.md` bijwerken: waar de site staat en hoe je een wijziging publiceert.

## Doorlopend onderhoud
- [ ] Reviews elke paar maanden bijwerken (`docs/reviews.json`; scores, aantallen en `reviews-meer.json` lopen mee).
- [ ] Nieuwe projectfoto's in de galerijen (`docs/inhoud.json` → `galerij`; 4e element `voor`/`na` voor paren) en de fotostrook gelijk houden.
- [ ] Maandelijks Search Console en GA4 bekijken.
- [ ] Tijdlijn en "500+ projecten" af en toe bijwerken.
