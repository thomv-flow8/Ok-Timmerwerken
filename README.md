# OK Timmerwerken — website

Nieuwe website voor OK Timmerwerken (timmer- en betonwerk, Gorinchem).
Zie `PROJECT.md` voor de analyse, de gemaakte keuzes en de stand van zaken.

## Previews bekijken
```bash
node tools/serve.js
```
Daarna: http://localhost:5173/preview/

## Hulpmiddelen
```bash
sh tools/webbeeld.sh                                      # webversies van de projectfoto's
swift tools/contactvel.swift assets/werkspot uit.png 6 300 # contactvel van een map met foto's
```

## Mappen
- `preview/` — de drie ontwerprichtingen (A vellum, B gallery, C nocturne)
- `assets/werkspot/` — 24 projectfoto's op ware resolutie, van het Werkspot-profiel
- `assets/web/` — verkleinde webversies
- `docs/reviews.json` — 28 citeerbare reviews (4,9 uit 5 uit 78)
