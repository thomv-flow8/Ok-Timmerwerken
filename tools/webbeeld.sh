#!/bin/sh
# Maakt webversies van de bruikbare projectfoto's: jpg, kwaliteit 80.
# Gebruik: sh tools/webbeeld.sh
set -e
uit=assets/web
mkdir -p "$uit"
maak() { # <bronpad> <naam> <maxbreedte>
  sips -s format jpeg -s formatOptions 80 -Z "$3" "$1" --out "$uit/$2.jpg" >/dev/null
  printf '%-30s ' "$2.jpg"; sips -g pixelWidth -g pixelHeight "$uit/$2.jpg" | awk -F': ' '/pixel/{printf "%s ", $2}'; echo
}

echo "— aangeleverd door Ozcan (hogere kwaliteit) —"
maak assets/aangeleverd/foto-04.jpg            betonvloer-spiegel        2048
maak assets/aangeleverd/foto-03.jpg            betonvloer-storten        2048
maak assets/aangeleverd/foto-11.jpg            betonvloer-vlinderen      1600
maak assets/aangeleverd/foto-10.jpg            betonvloer-berging        1600
maak assets/aangeleverd/foto-09.jpg            betonvloer-berging-raam   1600
maak assets/aangeleverd/foto-12.jpg            betonvloer-tuin-groot     2048
maak assets/aangeleverd/foto-08.jpg            betonvloer-tuin-licht     2048
maak assets/aangeleverd/foto-05.jpg            betonvloer-tuin-donker    2048
maak assets/aangeleverd/foto-06-rechtgezet.jpg vliering-constructie      1600
maak assets/aangeleverd/foto-07.jpg            tuinhuis-deuren           1600
maak assets/aangeleverd/foto-02.jpg            vlonder-lichtkoepels      2048
maak assets/aangeleverd/foto-01.jpg            vlonder-hoek              2048
maak assets/aangeleverd/foto-13.jpg            velux-montagepartner       600

echo "— van het Werkspot-profiel —"
maak assets/werkspot/sp-10.jpg betonvloer-woonkamer     2000
maak assets/werkspot/sp-17.jpg betonvloer-oprit         1600
maak assets/werkspot/sp-06.jpg beton-wapening           1600
maak assets/werkspot/sp-16.jpg timmerwerk-tvwand        1600
maak assets/werkspot/sp-11.jpg timmerwerk-lamellenwand  1600
maak assets/werkspot/sp-12.jpg dakraam-velux            1600
maak assets/werkspot/sp-09.jpg carport-douglas          1600
maak assets/werkspot/sp-19.jpg carport-overkapping      1600
maak assets/werkspot/sp-20.jpg carport-tussenwoning     1600
maak assets/werkspot/sp-07.jpg verbouwing-ruwbouw       1600
