# TODO — Reproduce remaining content from the old bmtgreenacademy.com

Status: **largely complete** (2026-09-06). Between an earlier round of work already on `main` (37 commits — full nav restructuring, real photography under `assets/img/`, and dedicated pages for nearly everything on this list) and this pass, almost everything from the original audit is now built. Full extracted copy and every photo/video found from the old live site remain staged under [`content-import/`](content-import) for reference (gitignored raw media: `content-import/media/` 265 images, `content-import/video/` 8 clips).

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

## Still open (lower priority)

- **Videos** — only 8 of the old site's ~70+ b-roll clips were captured (`content-import/video/`). None are embedded on the current site (photography was used instead). Getting more requires opening each old-site page, playing its video once, and grabbing the `.mp4` URL from the Network tab (`https://bmtgreenacademy.com/_assets/video/<hash>.mp4`, all public). This is a bigger, separate design decision (whether/how to add video at all) rather than a content-parity gap.
