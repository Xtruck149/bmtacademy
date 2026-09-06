# TODO — Reproduce remaining content from the old bmtgreenacademy.com

Status: **largely complete** (2026-09-06). Between an earlier round of work already on `main` (37 commits — full nav restructuring, real photography under `assets/img/`, and dedicated pages for nearly everything on this list) and this pass, almost everything from the original audit is now built. Full extracted copy and **every** photo and video from the old live site are staged under [`content-import/`](content-import) for reference (gitignored raw media: `content-import/media/` — **1,710 images, 409MB** — and `content-import/video/` — **72 clips, 627MB** — pulled straight from the old site's own asset manifest, so this is the complete set, not a sample).

## Groupe 1-4 — Fonctionnalités statiques (nouvelle passe, 2026-09-06)

Toutes les tâches des Groupes 1 à 4 d'une spécification produit sont maintenant en place, 100% statiques (aucun backend), commitées par groupe atomique :

- [x] **Groupe 1** — Copyright dynamique (`#copyright-year` + JS), fallback email sous le bouton WhatsApp de `contact.html`, icônes Instagram/Facebook dans tous les footers + `sameAs` JSON-LD.
- [x] **Groupe 2** — Toutes les `.jpg`/`.png` inline converties en `<picture>` avec source `.webp` (originaux conservés), `background-image` converti en `image-set()` avec fallback JPG. 73 fichiers WebP générés (assets/img : 4.4MB → 7.6MB avec les deux formats côte à côte).
- [x] **Groupe 3** — Section "Ce que disent nos étudiants" (placeholders explicites) sur `contact.html` et `a-propos.html` ; emplacement du lien certificat AATHCI avec commentaire TODO dans `contact.html`.
- [x] **Groupe 4** — 8 fonctionnalités statiques : quiz "Trouve ta formation" (`formations/trouve-ta-formation.html`), vérification de certificat (`verification.html` + `assets/data/certificats.json`), Service Worker (`sw.js`, à la racine — pas dans `assets/`, voir note ci-dessous), badge Alumni téléchargeable (`formations/mon-badge.html`), carte interactive diaspora (`a-propos.html#diaspora` + `assets/data/diaspora.json`), calendrier des rentrées (`formations/index.html` + `assets/data/sessions.json`), bascule FR/EN (`index.html` et `formations/index.html`), FAQ avec recherche instantanée (`faq.html`).

**Écart volontaire par rapport à la spec** : `sw.js` vit à la racine du dépôt plutôt que dans `assets/`. GitHub Pages ne permet pas d'envoyer l'en-tête `Service-Worker-Allowed`, donc un Service Worker enregistré depuis `assets/sw.js` ne pourrait avoir qu'un scope `assets/` et ne contrôlerait aucune page HTML du site — la mise en cache hors-ligne des pages (l'objectif principal de la tâche) ne fonctionnerait pas du tout. Placé à la racine, son scope couvre tout le site.

**Bug découvert et corrigé pendant cette passe** : `.hero--photo::before` (le gradient sombre garantissant la lisibilité du texte sur les photos) et `.hero::before` (le filigrane du logo, appliqué à tous les hero) ciblaient le même pseudo-élément avec une spécificité CSS égale — le filigrane, déclaré plus bas dans la feuille de style, gagnait systématiquement, laissant les 25 pages à photo de fond totalement non assombries avec du texte blanc illisible par-dessus. Corrigé en déplaçant le gradient sur `::after` ; le logo reste centré et discret sur les hero à couleur plate, et devient un vrai badge `<img>` net et bien présenté à droite sur les hero à photo.

## Audit technique (2026-09-06)

- [x] **`sitemap.xml` incomplet** — manquait les 4 pages du Groupe 4 (quiz, badge, vérification, FAQ). Ajouté.
- [x] **`faq.html`** — le champ de recherche référençait une classe CSS jamais définie (`form-group-input`) avec des styles inline dupliqués. Nettoyé pour réutiliser `.form-group`.
- [x] **Canonical / `og:url` / `og:image` / JSON-LD `url` pointaient vers `bmtgreenacademy.com`** (domaine non connecté à ce dépôt, voir "Still open" ci-dessous) sur les 34 pages + `sitemap.xml` + `robots.txt`. Repointés vers `https://xtruck149.github.io/bmtacademy` — l'adresse où le site est réellement servi — sur demande explicite de l'utilisateur. Si le domaine `bmtgreenacademy.com` est un jour connecté à ce dépôt (CNAME + DNS), ces URLs devront être repointées une seconde fois.
- Vérifié sans problème : 0 lien/asset cassé (href/src/srcset/url()) sur 36 pages HTML, tous les JSON et JSON-LD valides, aucune image sans `alt`, aucun sélecteur CSS dupliqué au niveau racine, empilement des pseudo-éléments hero cohérent, aucun script temporaire oublié dans `content-import/`.

## Placeholders à remplacer avant mise en production

- **Réseaux sociaux** — `https://instagram.com/bmtgreenacademy` et `https://facebook.com/bmtgreenacademy` dans tous les footers + JSON-LD sont des URLs d'exemple, à remplacer par les vrais comptes.
- **Témoignages** — `contact.html` et `a-propos.html` contiennent 3+3 cartes `[Témoignage à remplacer]` explicitement fictives, jamais présentées comme réelles.
- **Certificat AATHCI** — lien vers le PDF ou le site de l'association à ajouter dans `contact.html` (commentaire `<!-- TODO -->` en place).
- **`assets/data/certificats.json`** — 3 entrées fictives marquées `"placeholder": true`, à remplacer par les vrais numéros de certificats délivrés.
- **`assets/data/diaspora.json`** — 8 villes avec effectifs d'exemple marqués `"placeholder": true`, à remplacer par les vrais chiffres de l'Académie.
- **`assets/data/sessions.json`** — 6 sessions avec dates d'exemple marquées `"placeholder": true`, à remplacer par le vrai calendrier.
- **FAQ (`faq.html`)** — contenu réaliste mais explicitement marqué "Brouillon — à valider avec l'équipe pédagogique", notamment les tarifs et facilités de paiement.
- **Traductions FR/EN** — seuls le hero et quelques titres d'`index.html` et `formations/index.html` sont traduits (voir `data-fr`/`data-en` dans ces deux fichiers). Le H1 de chaque hero, tout le contenu des pôles/programmes, les footers, et toutes les autres pages restent en français uniquement.

## Media now integrated into the live pages

- [x] **Roll Ball Hommes/Femmes/Enfants/Handi** — all 4 pages were using a generic reused stock photo (`roll-ball-action.jpg` / `roll-ball-team.jpg`). Replaced each with a real, verified, category-specific photo from the old site (`assets/img/roll-ball-{hommes,femmes,enfants,handi}-1.jpg`), each visually confirmed to show the correct team/category before use, credited to ABDY Photographie (the watermark on the originals).
- Maquillage FX, Ambassadeurs de la Paix, Grounding, Rap Ivoire Thérapie, Thérapie par le Rire already had correct real photography from the earlier build pass — no changes needed.

## Site-wide technical/aesthetic audit (this pass)

- [x] **Image optimization** — re-encoded all 80 JPG/PNG assets (mozjpeg quality 78, PNG level 9, capped at 1920px wide). `assets/img`: 6.6MB → 4.4MB (-33%), no visible quality loss (spot-checked the logo and a photo-heavy image), no format changes.
- [x] **Accessibility** — fixed 21 team photos in `equipe.html` that had empty `alt=""` (a real WCAG failure for meaningful content images); now `alt="Photo de <name>"`.
- [x] **SEO** — homepage `<title>` was 112 characters (badly truncated in search results); shortened to match its own already-correct, shorter `og:title`. Fixed a raw `&` → `&amp;` in `maquillage-fx.html`'s social meta tags.
- [x] **Verified, no fix needed**: 0 broken links/assets (32 pages), 0 console errors, 0 horizontal-overflow elements at 375px width across every page type — checked via real page loads (an initial `iframe.srcdoc`-based test method gave false positives due to relative-URL resolution quirks; discarded and re-verified properly before concluding anything).
- Confirmed the `<title>` vs `og:title` differences on several programme pages (longer keyword-rich `<title>`, punchier `og:title` for social shares) are intentional — left alone.
- [x] **Docs** — README now documents the GitHub Pages deployment and flags that `bmtgreenacademy.com` is a separate, unconnected domain.

## Hero photo wallpapers + navigation-visibility fixes (earlier pass)

The site went live at **https://xtruck149.github.io/bmtacademy/** (GitHub Pages, auto-deploys from `main` — note: **`bmtgreenacademy.com` is a separate, still-live deployment of the OLD site and is not connected to this repo**; nothing pushed here appears there until someone points that domain at this repo or redeploys this code where it's actually hosted).

Three real bugs were reported via the live site and fixed:
- [x] **Invisible dropdown menu text** — `.site-header--dark .nav-links a { color:#fff }` and the intended fix `.site-header--dark .nav-dropdown-panel a { color: var(--ink) }` had equal CSS specificity, so the later rule always won, making every nav dropdown panel's links white-on-white (fully invisible) on any dark-header page. Fixed by raising the panel-link rule's specificity.
- [x] **New pages hidden behind a collapsed accordion** — every Pôle on `formations/index.html` (including the ones containing Maquillage FX, the Roll Ball pages, Profilage Criminel, etc.) was collapsed by default via `.pole-block-body { max-height:0 }`, so those "Voir la page complète" links were invisible until a visitor clicked a Pôle header first. Defaulted all 9 Pôles open.
- [x] **Real photos as hero backgrounds, site-wide** — added a `.hero--photo` variant (cover background + dark gradient overlay) and applied it everywhere a real photo already existed: all 6 flagship programs, Profilage Criminel, both Thérapie par l'Art pages, Maquillage FX, Grounding, Thérapie par le Rire, Rap Ivoire Thérapie, Thérapixel Afrika, Ambassadeurs de la Paix, RSE/Happy Art, ODD, Sport-Études + all 4 Roll Ball pages, Home, and Qui sommes-nous (founder photo). Also gave the 6 flagship "Formations phares" cards their own program photo instead of a flat color fill.
- [x] **Bug this introduced, caught and fixed**: `.hero--warm` sets dark ink text for its light gold background — combined with the new dark photo overlay, that text would have been invisible. Forced `.hero--photo` to always use light text/gold accents regardless of the color variant it's paired with, including a CSS specificity fix so it reliably wins over `.hero--warm`'s conflicting rule. Verified via a cache-bypassing fetch against the deployed CSS (GitHub Pages' CDN cache briefly served stale CSS after each push during testing — not a real bug, resolves in a few minutes or a hard refresh).

## Still open

- **Video embeds** — no video is used anywhere on the site yet (it's fully photo-based by design); the 72 downloaded clips aren't matched to specific pages beyond the 8 originally tied to the founder Biographie page by timing. Before embedding any, they need to be previewed (no `ffmpeg`/`ffprobe` available in this environment to inspect them locally) and matched to the right page — a deliberate next step, not done blindly.
- **`bmtgreenacademy.com` is not connected to this repo** — if the goal is to replace the live site, that needs a `CNAME` file here plus a DNS change on the domain owner's side. Flagged to the user; not something to do unilaterally.

## What this pass added on top of the existing work

- [x] **Founder bio** (`index.html`, `a-propos.html`) — added Wharton, Northwestern, Case Western Reserve, UNITAR, UN CC:Learn, UNOCHA, the base Master's in HR, and the "Fondatrice d'écosystèmes à impact" tagline (the C3RD credential was already present on `engagement/objectifs-developpement-durable.html`).
- [x] **`partenaires.html`** — corrected **"Mairie de San-Pédro" → "Mairie de Sassandra"** (the old site's "SAH-SANDRA" is a real coastal town in Côte d'Ivoire; San-Pédro was almost certainly a transcription slip).
- [x] **`inclusive/roll-ball-handi.html`** — new page for the 4th Roll Ball category (Handi Roll Ball), matching the existing Hommes/Femmes/Enfants pages. Cross-linked from all three sibling pages, `sport-etudes.html`, `formations/index.html` Pôle VIII, and `sitemap.xml`.
- [x] **Bug fix — `programmes/maquillage-fx.html`**: added the "Dydy's Art" brand name (was missing; only the formatrice's full name and prize were listed).

## Bugs found and fixed

- Checked **`assets/js/main.js`**'s active-nav-link logic for the classic "compares bare filename, wrongly matches every page named `index.html`" bug (found and fixed this exact issue in an earlier iteration of this work). Already correctly implemented (`link.pathname === window.location.pathname`, with hash-matching for the `#engagement` anchor) — no fix needed.
- [x] **`formations/index.html` Pôle III** — "L'Art de l'Impact" (a real, live flagship program with its own page and a spot in the top "Formations phares" grid) was tagged `class="tag now"` (styled green/available) but placed under the "Bientôt" (coming soon) heading — a visually contradictory placement. Moved it into the "Disponible" list and turned it into a working link to `programmes/art-de-limpact.html`.
- [x] **`formations/index.html` Pôle VIII** — the Roll Ball detail-card grid only listed Enfants/Femmes/Hommes; added the missing Handi Roll Ball card.
- [x] **`programmes/*.html` (14 files)** — the top nav's "Formations" item was missing `class="active"` on every individual program page, while it was correctly present on the Roll Ball/Sport-Études pages. Fixed for consistency (nav highlight now correctly shows "Formations" as active on every program detail page).
- Investigated and ruled out as **not** a bug: `formations/index.html` Pôle I links the "Gélothérapie" tag to `programmes/therapie-par-le-rire.html` — this looks like a mismatch at first glance, but "gélothérapie" is the clinical term for laughter therapy, so pairing it with the Thérapie par le Rire page is intentional (same pattern as "Coach Dignité"/"L'Art de la Paix" sharing one page under two names on the old site).
- Verified: 0 broken internal links or asset references across all 32 pages (custom link-checker run twice, before and after these edits). PWA manifest, robots.txt, sitemap.xml↔files consistency, and the WhatsApp-redirect contact form were all already correct.

## Intentionally not built (judgment call, unchanged from the original audit)

- Thérapies Naturelles, Gélothérapie, Grounding — no unique copy beyond what's already in the Pôle I tag list / dedicated Grounding page.
- "Nos Domaines d'Action" and "BMT Company" as standalone partner cards — no unique copy on the old site beyond what's already reflected via team roles in `equipe.html`.
- "RSE" (distinct from "RSE/QVT — Happy Art") — old site's RSE menu item was just a link-through to the ODD content, already covered by `engagement/objectifs-developpement-durable.html`.
