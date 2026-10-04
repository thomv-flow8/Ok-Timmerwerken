#!/bin/sh
# Maakt webversies van de bruikbare projectfoto's: max 2000px breed, jpg kwaliteit hoog.
# Gebruik: sh tools/webbeeld.sh
set -e
uit=assets/web
mkdir -p "$uit"
maak() { # <bron> <naam> <maxbreedte>
  sips -s format jpeg -s formatOptions 80 -Z "$3" "assets/werkspot/$1" --out "$uit/$2.jpg" >/dev/null
  printf '%-28s ' "$2.jpg"; sips -g pixelWidth -g pixelHeight "$uit/$2.jpg" | awk -F': ' '/pixel/{printf "%s ", $2}'; echo
}
maak sp-10.jpg betonvloer-woonkamer     2000
maak sp-17.jpg betonvloer-oprit         1600
maak sp-13.jpg betonvloer-tuin          1600
maak sp-06.jpg beton-wapening           1600
maak sp-15.jpg fundering-zwembad        1600
maak sp-16.jpg timmerwerk-tvwand        1600
maak sp-11.jpg timmerwerk-lamellenwand  1600
maak sp-03.jpg timmerwerk-vlonder       1600
maak sp-12.jpg dakraam-velux            1600
maak sp-09.jpg carport-douglas          1600
maak sp-19.jpg carport-overkapping      1600
maak sp-20.jpg carport-tussenwoning     1600
maak sr-24.jpg berging-zwart            1600
maak sr-22.jpg overkapping-zijkant      1600
maak sp-18.jpg tuinhuis-aanbouw         1600
maak sp-07.jpg verbouwing-ruwbouw       1600
maak sr-23.jpg hsb-wand                 1600
