#!/usr/bin/env python3
"""Mise en forme automatique des médias dans toutes les pages (ré-exécutable) :

1. Galeries « mosaïque » : chaque vignette reçoit une forme adaptée à SA photo
   (portrait → tuile haute, panoramique → tuile large, 1re photo paysage → tuile vedette).
   Pourquoi : l'ancien motif fixe (nth-child) recadrait les portraits en bandeaux et coupait les visages.
2. srcset + sizes sur chaque <picture> qui a une variante « -640.webp »
   (créée par scripts/optimize-images.py) : le mobile télécharge la petite version.
3. Vidéos : les cadres des vidéos verticales reçoivent la classe is-portrait
   (les vidéos paysage occupent 2 colonnes, les verticales 1 : grille équilibrée).
4. Logos : .png (34 Ko) → .webp (14–21 Ko).
5. Héros photo sur mobile : variante « -960.webp » (crée si besoin) chargée en priorité
   sur les écrans ≤ 720 px, au lieu de l'image pleine taille (LCP plus rapide en 4G).

Usage : python3 scripts/optimize-images.py && python3 scripts/enhance-media.py
"""
import glob
import os
import re
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
os.chdir(ROOT)

SIZES = {
    'feature': '(max-width: 720px) 100vw, 520px',
    'wide': '(max-width: 720px) 100vw, 520px',
    'tall': '(max-width: 720px) 50vw, 260px',
    'tile': '(max-width: 720px) 50vw, 260px',
    'related-thumb': '(max-width: 720px) 100vw, 400px',
    'photo-banner': '(max-width: 1240px) 100vw, 1180px',
    'photo-card': '(max-width: 720px) 100vw, 640px',
    'default': '(max-width: 720px) 100vw, 600px',
}
_dim = {}


def dims(path):
    if path not in _dim:
        _dim[path] = Image.open(path).size if os.path.exists(path) else None
    return _dim[path]


def shape(w, h):
    r = h / w
    if r > 1.18:
        return 'tall'
    if r < 0.62:
        return 'wide'
    return 'tile'


def tile_classes(grid_html):
    """Attribue is-feature / is-tall / is-wide à chaque vignette d'une galerie."""
    feature_done = False

    def repl(m):
        nonlocal feature_done
        fig = m.group(0)
        wh = re.search(r'<img [^>]*width="(\d+)" height="(\d+)"', fig)
        kind = shape(int(wh.group(1)), int(wh.group(2))) if wh else 'tile'
        if not feature_done and kind in ('tile', 'wide'):
            kind, feature_done = 'feature', True
        cls = 'gallery-item' + ('' if kind == 'tile' else f' is-{kind}')
        fig = re.sub(r'<figure class="gallery-item[^"]*"', f'<figure class="{cls}"', fig, count=1)
        return fig.replace('<picture>', f'<picture data-sizes="{kind}">', 1)
    return re.sub(r'<figure class="gallery-item[^"]*">.*?</figure>', repl, grid_html, flags=re.S)


def responsive(page, html):
    base = os.path.dirname(page)

    def repl(m):
        pic = m.group(0)
        kind = m.group(1)
        src = re.search(r'<source srcset="([^",]+\.webp)" type="image/webp"', pic)
        if not src:
            return pic
        url = src.group(1)
        small_url = url[:-5] + '-640.webp'
        full = os.path.normpath(os.path.join(base, url))
        small = os.path.normpath(os.path.join(base, small_url))
        d = dims(full)
        if not d or d[0] <= 900 or not os.path.exists(small):
            return pic
        if not kind:
            before = html[max(0, m.start() - 400):m.start()]
            ctx = re.findall(r'class="([^"]+)"', before)
            last = ctx[-1] if ctx else ''
            kind = next((k for k in ('related-thumb', 'photo-banner', 'photo-card') if k in last), 'default')
        new = f'<source srcset="{small_url} 640w, {url} {d[0]}w" sizes="{SIZES[kind]}" type="image/webp"'
        return pic.replace(src.group(0), new, 1)
    html = re.sub(r'<picture(?: data-sizes="(\w+)")?>.*?</picture>', repl, html, flags=re.S)
    return re.sub(r'<picture data-sizes="\w+">', '<picture>', html)


def hero_mobile(page, html):
    """Ajoute --hero-m (image mobile) au héros photo et précharge la bonne image selon l'écran."""
    base = os.path.dirname(page)
    m = re.search(r'(<section class="[^"]*hero--photo[^"]*" style=")([^"]*)"', html)
    if not m:
        return html
    style = re.sub(r";?--hero-m:url\('[^']*'\)", '', m.group(2))
    w = re.search(r"url\('([^']+)\.webp'\)", style)
    if not w:
        return html
    url = w.group(1) + '.webp'
    full = os.path.normpath(os.path.join(base, url))
    d = dims(full)
    if not d or d[0] <= 1000:
        mob = url
    else:
        mob = w.group(1) + '-960.webp'
        mob_path = os.path.normpath(os.path.join(base, mob))
        if not os.path.exists(mob_path):
            im = Image.open(full)
            im.resize((960, round(im.height * 960 / im.width)), Image.LANCZOS).save(mob_path, 'WEBP', quality=72, method=6)
    # url() dans une variable CSS : résolue par rapport à style.css (assets/css/), d'où le chemin « ../img/… »
    css_rel = os.path.relpath(os.path.normpath(os.path.join(base, mob)), 'assets/css').replace(os.sep, '/')
    html = html[:m.start()] + m.group(1) + style + f";--hero-m:url('{css_rel}')" + '"' + html[m.end():]
    pre = (f'<!-- lcp:start --><link rel="preload" as="image" href="{mob}" type="image/webp" fetchpriority="high" media="(max-width: 720px)">'
           f'<link rel="preload" as="image" href="{url}" type="image/webp" fetchpriority="high" media="(min-width: 721px)"><!-- lcp:end -->')
    return re.sub(r'<!-- lcp:start -->.*?<!-- lcp:end -->', pre, html, count=1)


changed = 0
for page in sorted(glob.glob('**/*.html', recursive=True)):
    if page.startswith(('node_modules', 'google')):
        continue
    s = o = open(page, encoding='utf8').read()
    # 1. galeries (hors affiches)
    s = re.sub(r'<div class="gallery-grid">.*?</div>',
               lambda m: tile_classes(m.group(0)), s, flags=re.S)
    # 2. srcset/sizes (on repart de la source simple pour rester ré-exécutable)
    s = re.sub(r'<source srcset="([^" ]+\.webp) 640w, ([^" ]+\.webp) \d+w" sizes="[^"]*" type="image/webp"',
               r'<source srcset="\2" type="image/webp"', s)
    s = responsive(page, s)
    s = hero_mobile(page, s)
    # 3. vidéos verticales
    s = re.sub(r'<figure class="photo-card(?: is-portrait)?">(<video [^>]*width="(\d+)" height="(\d+)")',
               lambda m: f'<figure class="photo-card{" is-portrait" if int(m.group(3)) > int(m.group(2)) else ""}">{m.group(1)}', s)
    # 4. logos webp
    s = re.sub(r'src="((?:\.\./)*)assets/img/logo\.png"( alt="[^"]*" class="logo-mark")', r'src="\1assets/img/logo-216.webp"\2', s)
    s = re.sub(r'<img src="((?:\.\./)*)assets/img/logo\.png"', r'<img src="\1assets/img/logo.webp"', s)
    if s != o:
        open(page, 'w', encoding='utf8').write(s)
        changed += 1
print(f'✔ médias mis en forme sur {changed} page(s)')
