# Miniaturen voor de galerijen: vierkant bijgesneden, 192 px (96 px op retina), als WebP in assets/duim/.
# Wordt aangeroepen door genereer-paginas.js met de bronpaden (relatief aan de projectmap); maakt alleen
# ontbrekende of verouderde miniaturen opnieuw.
import os, sys
from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MAAT = 192
for bron in sys.argv[1:]:
    p = os.path.join(ROOT, bron)
    doel = os.path.join(ROOT, 'assets/duim', os.path.splitext(os.path.basename(bron))[0] + '.webp')
    if os.path.exists(doel) and os.path.getmtime(doel) >= os.path.getmtime(p):
        continue
    os.makedirs(os.path.dirname(doel), exist_ok=True)
    im = ImageOps.fit(ImageOps.exif_transpose(Image.open(p)).convert('RGB'), (MAAT, MAAT), Image.LANCZOS)
    im.save(doel, 'WEBP', quality=72, method=6)
