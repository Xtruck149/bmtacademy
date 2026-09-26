#!/usr/bin/env python3
"""Optimisation des images du site (à relancer après l'ajout de photos) :

1. Ré-encode les .webp trop lourds depuis leur .jpg (qualité 78, largeur max 1600 px).
   Pourquoi : beaucoup de .webp étaient à peine plus légers que le .jpg (compression faible).
2. Crée une variante « -640.webp » pour chaque image de plus de 900 px de large.
   Pourquoi : une vignette de galerie affichée en 220 px n'a pas besoin d'un fichier de 1600 px ;
   le navigateur choisit la bonne taille grâce à srcset/sizes (gain majeur sur mobile).
3. Crée les logos webp (logo-216.webp pour l'en-tête, logo.webp pour le reste).

Usage : python3 scripts/optimize-images.py   (nécessite Pillow : pip install pillow)
"""
import glob
import os
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(__file__), '..')
os.chdir(ROOT)
MAX_W, Q, SMALL = 1600, 78, 640
saved = made = 0

for webp in sorted(glob.glob('assets/img/**/*.webp', recursive=True)):
    if webp.endswith(f'-{SMALL}.webp') or os.path.basename(webp).startswith('logo'):
        continue
    jpg = webp[:-5] + '.jpg'
    src = jpg if os.path.exists(jpg) else (webp[:-5] + '.png' if os.path.exists(webp[:-5] + '.png') else None)
    im = ImageOps.exif_transpose(Image.open(src or webp))
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    # 1. ré-encodage si le gain dépasse 10 %
    if src:
        full = im if im.width <= MAX_W else im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        tmp = webp + '.tmp'
        full.save(tmp, 'WEBP', quality=Q, method=6)
        old = os.path.getsize(webp)
        # on ne réduit jamais la définition d'une image déjà publiée (les attributs width/height restent justes)
        if full.size == Image.open(webp).size and os.path.getsize(tmp) < old * 0.9:
            saved += old - os.path.getsize(tmp)
            os.replace(tmp, webp)
        else:
            os.remove(tmp)
    # 2. variante réduite
    w, h = Image.open(webp).size
    small = webp[:-5] + f'-{SMALL}.webp'
    if w > 900 and not os.path.exists(small):
        im.resize((SMALL, round(h * SMALL / w)), Image.LANCZOS).save(small, 'WEBP', quality=Q, method=6)
        made += 1

# 3. logos
logo = Image.open('assets/img/logo.png').convert('RGBA')
logo.save('assets/img/logo.webp', 'WEBP', quality=80, method=6)
logo.resize((216, round(logo.height * 216 / logo.width)), Image.LANCZOS).save('assets/img/logo-216.webp', 'WEBP', quality=80, method=6)

print(f'✔ webp ré-encodés : {saved // 1024} Ko économisés — variantes {SMALL}px créées : {made}')
