# Checklist nieuwe website OK Timmerwerken — nog navragen en aanleveren

Stand: 7 oktober 2026. Onze eigen takenlijst: `docs/todo-lancering.md`. Testadres: https://thomv-flow8.github.io/Ok-Timmerwerken/ (niet vindbaar in Google).

De site is inhoudelijk en technisch klaar. Alles hieronder wacht op een antwoord of een bestand van Ozcan.
**Vet** = nodig vóór de livegang; de rest mag later.

---

## 1. Bevestigen of kiezen

### Bedrijfsgegevens
- [ ] **Werktijden** — Google zegt ma–vr 7:00–20:00, za 7:00–16:00; de oude site zei ma–vr 7:00–18:00, za 7:00–15:00.
      Wat klopt? (Komt op de site, in de footer, in de gegevens voor Google en moet gelijk staan op het Google-bedrijfsprofiel.)
- [ ] **Adres op de site** — Suzanna van Oostdijkstraat 4, 4206 XW Gorinchem staat in de footer en bij Google. Is dat oké om openbaar te tonen?
- [ ] **Werkgebied** — "Gorinchem en regio Zuid-Holland". Klopt dat zo?
- [ ] **"U hoort meestal binnen een dag van ons"** — die belofte staat op de contactpagina. Haalbaar?

### Cijfers en tijdlijn
- [ ] **"500+ projecten"** — een schatting (175 reviews sinds 2019). Klopt het ongeveer, of meer/minder?
- [ ] Tijdlijn op Over ons — vragen in `docs/vraag-ozcan-tijdlijn.md`: begintijd, jaar vaste ploeg, sinds wanneer betonwerk,
      jaar VELUX Montagepartner, een keerpunt. (Nu staan alleen de zekere punten online: 2011, 2019, 2021, nu.)

### Diensten
- [ ] **Doet hij alle klussen van de oude site nog?** — afvinklijst in `docs/vraag-ozcan-diensten.md`
      (houtrot, tegelwerk, HSB-wanden, schuimbeton, zwembadfundering, enz.). Alles staat nu op de site.
- [ ] Mist er een klus die hij wél doet?

### Teksten en beelden
- [ ] **Alle teksten nalezen** — vooral de veelgestelde vragen en "zo pakken we het aan" op de 8 dienstpagina's,
      het verhaal op Over ons en het citaat op de contactpagina ("U belt met Ozcan, niet met een kantoor…").
- [ ] **Portret** — de foto van Ozcan op Over ons en Contact is een AI-bewerking op basis van zijn eigen foto's. Akkoord dat die online staat?
- [ ] **Renders** — de hero (huis met wolken) en de beelden bij de diensten op de homepage zijn gegenereerd; de galerijen zijn zijn eigen foto's. Akkoord?
- [ ] **Origineel logo** — exact overgetrokken van zijn logo, niets aan veranderd. Akkoord?
- [ ] **Naam bij de teksten** — op de dienstpagina's staat nu "Geschreven door Ozcan, eigenaar van OK Timmerwerken" met zijn kleine portret (helpt bij Google). Akkoord, of liever weg?
- [ ] Algemene voorwaarden en disclaimer — woordelijk van de oude site. Nog actueel?

### Privacy en cookies
- [ ] **Privacyverklaring nalezen en goedkeuren** (staat nu als concept op /privacyverklaring/). Daarin nog in te vullen:
  - [ ] **Naam van de hostingpartij** (waar website en e-mail staan)
  - [ ] **Bewaartermijn** van aanvragen zonder opdracht (voorstel: 12 maanden)
- [x] Statistieken: **Google Analytics 4 met cookiebanner** (gekozen). Gevolg: bezoekers krijgen een banner met "Accepteren" en
      "Weigeren"; Google Analytics laadt pas na "Accepteren"; de privacyverklaring krijgt een cookie-overzicht.

---

## 2. Aanleveren

### Nodig voor de livegang
- [ ] **Hosting** — naam van de partij (het domein staat bij **GoDaddy**; is de hosting daar ook?) en toegang voor Thomas om de site te plaatsen (beheerpaneel of FTP/SFTP).
      Wachtwoorden niet via WhatsApp of mail; samen inloggen of via de "gebruiker toevoegen"-functie van de hosting.
- [ ] **Domeinbeheer** — ok-timmerwerken.nl staat bij GoDaddy; toegang voor Thomas tot de DNS-instellingen (voor de overstap en het https-certificaat).
- [ ] **E-mail** — de mailbox lijkt te draaien bij **Microsoft 365 via GoDaddy**: klopt dat? En moeten aanvragen via het formulier op info@ok-timmerwerken.nl binnenkomen?
- [ ] **Formulier (Web3Forms, gratis)** — er wordt een sleutel aangemaakt op dat e-mailadres; Ozcan krijgt één bevestigingsmail en moet daarop klikken.
- [ ] **Google Analytics 4** — met Ozcans Google-account een GA4-property aanmaken (of Thomas als beheerder toevoegen) en de
      meet-ID doorgeven (begint met `G-`). In de instellingen: gegevensdeling met Google uit, de verwerkersvoorwaarden van Google accepteren.
- [ ] **Google Search Console** — met hetzelfde Google-account; Thomas toevoegen als gebruiker. Nodig om de sitemap in te dienen
      en te zien hoe de site in Google staat.

### Na de livegang
- [ ] **Google-bedrijfsprofiel** — websitelink naar de nieuwe site, werktijden gelijk aan de site (Thomas eventueel als beheerder toevoegen).
- [ ] **Werkspot-profiel en Instagram** — link naar de nieuwe website.

### Graag, maar niet verplicht
- [ ] Recente projectfoto's, vooral van een geplaatst **VELUX-dakraam** en van grote verbouwingen (origineel uit de telefoon, niet via WhatsApp: die verkleint ze).
- [ ] Een echte foto van Ozcan, als hij liever geen AI-portret wil.
- [ ] Het logo als origineel bestand (ai, eps, pdf of svg), als dat bestaat.
- [ ] Een export van de Google-reviews (via Google Takeout), zodat de reviewpagina met de officiële gegevens wordt bijgewerkt.

---

## 3. Wat Thomas/Claude daarna doen

1. Antwoorden verwerken: werktijden, tijdlijn, diensten, tekstcorrecties, 500+.
2. Cookiebanner bouwen + Google Analytics 4 (laadt pas na toestemming), privacyverklaring aanvullen met cookies.
3. Formulier koppelen aan Web3Forms (met spambescherming), testmelding weghalen, proefaanvraag versturen.
4. Livegang op de eigen hosting: zoekmachineblokkade eraf, echte doorverwijzingen voor de 41 oude adressen,
   https en beveiligingsinstellingen, sitemap indienen in Search Console (zie de checklist in `PROJECT.md`).
5. Audit opnieuw draaien op het echte domein en de laatste punten oplossen.
