# BMT Green Academy

**École Internationale des Arts Thérapeutiques, du Leadership Social et des Métiers Verts**

Site officiel de BMT Green Academy — académie internationale fondée à Abidjan, Côte d'Ivoire, dédiée à la formation, la recherche et le développement durable.

## Structure du site

```
├── index.html                    # Accueil
├── a-propos.html                 # Qui sommes-nous
├── contact.html                  # Contact & formulaire
├── equipe.html                   # Équipe
├── partenaires.html              # Partenaires
├── 404.html                      # Page d'erreur (servie par GitHub Pages à toute profondeur)
├── offline.html                  # Page hors connexion (Service Worker)
├── faq.html                      # FAQ avec recherche
├── verification.html             # Vérification de certificat
├── formations/
│   ├── index.html                # 9 pôles de formations
│   └── parcours-etudiant.html    # Modalités d'inscription
├── programmes/
│   ├── art-de-la-paix.html
│   ├── art-de-limpact.html
│   ├── grounding-respiration-consciente.html
│   ├── maquillage-fx.html
│   ├── musicotherapie.html
│   ├── mystere-sacre-des-epices.html
│   ├── noblesse-du-coeur.html
│   ├── profilage-criminel.html
│   ├── rap-ivoire-therapie.html
│   ├── sexotherapie.html
│   ├── therapie-par-lart-adultes.html
│   ├── therapie-par-lart-enfants.html
│   ├── therapie-par-lart-handicap.html
│   └── therapie-par-le-rire.html
├── engagement/
│   ├── ambassadeurs-paix-fraternite.html
│   ├── objectifs-developpement-durable.html
│   └── rse-happy-art.html
├── inclusive/
│   ├── sport-etudes.html         # Sport-Études (FIRBALL)
│   ├── roll-ball-enfants.html
│   ├── roll-ball-femmes.html
│   ├── roll-ball-hommes.html
│   └── roll-ball-handi.html
├── univers/
│   └── therapixel-afrika.html    # Thérapixel Afrika®
├── assets/
│   ├── css/style.css             # Styles principaux
│   ├── js/main.js                # Interactions
│   └── img/                      # Photos, logos, avatars d'équipe et de partenaires
├── sw.js                         # Service Worker (hors-ligne, cache)
├── robots.txt                    # SEO
├── sitemap.xml                   # SEO
├── scripts/                      # Outillage Node (serve, check-links, certificats)
└── .github/                      # CI qualité, Dependabot, modèle de PR
```

## Fonctionnalités

- Design responsive (mobile-first)
- Animations au scroll (IntersectionObserver) et transitions natives entre
  pages (View Transitions API, dégradation silencieuse si non supporté)
- Menu hamburger mobile
- Barre de progression de scroll, bouton retour en haut
- Halo lumineux au survol des sections hero (pointeur fin uniquement)
- Bascule magnétique 3D sur les cartes au survol
- Accordéons interactifs (pôles de formation)
- Formulaire de contact : construit un message WhatsApp pré-rempli côté
  client (site 100% statique, aucun backend requis)
- `prefers-reduced-motion` respecté : toutes les animations sont
  désactivées si l'utilisateur le demande
- Skip-to-content (accessibilité)
- Open Graph & Twitter Cards (réseaux sociaux)
- JSON-LD : `EducationalOrganization` (accueil), `BreadcrumbList` (33 pages), `Course` (14 programmes)
- Mode hors connexion (Service Worker + `offline.html`), PWA installable
- Canonical URLs
- Favicon multi-format

## Technologies

- HTML5 sémantique
- CSS3 (variables, grilles, animations, View Transitions API)
- JavaScript vanilla (aucune dépendance)
- Google Fonts (Baloo 2 + Nunito)

## Déploiement

Site statique, sans backend. Déployé via **GitHub Pages** depuis la branche `main` (source: `/`) :
**https://xtruck149.github.io/bmtacademy/**

⚠️ Le nom de domaine **bmtgreenacademy.com** pointe actuellement vers un site différent (l'ancienne version) et **n'est pas connecté à ce dépôt**. Tant qu'aucun fichier `CNAME` n'est ajouté ici et que le DNS du domaine n'est pas repointé vers GitHub Pages, les mises à jour de ce dépôt ne seront visibles qu'à l'adresse `xtruck149.github.io/bmtacademy/`, jamais sur `bmtgreenacademy.com`.

Pour prévisualiser en local : `npm run serve` puis **http://localhost:8000/bmtacademy/** — le serveur reproduit le sous-chemin `/bmtacademy/` de GitHub Pages, indispensable pour tester `404.html` et `offline.html` (qui utilisent `<base href="/bmtacademy/">`). Aucune étape de build.

> ⚠️ Si un domaine personnalisé est branché un jour (fichier `CNAME`), remplacer `<base href="/bmtacademy/">` par `<base href="/">` dans `404.html` et `offline.html`, et repointer canonical / `og:url` / JSON-LD / `sitemap.xml` / `robots.txt`.

## Développement & qualité

Prérequis : Node.js ≥ 20. Node ne sert **qu'à l'outillage** : rien n'est compilé, le site publié reste 100 % statique.

```bash
npm install          # une seule fois
npm run serve        # prévisualisation locale
npm test             # tout vérifier avant de pousser
```

| Commande | Rôle |
|---|---|
| `npm run lint:html` | Validation HTML + accessibilité de base (html-validate) |
| `npm run lint:css` | Lint CSS (stylelint) |
| `npm run lint:js` | Lint JavaScript (ESLint) |
| `npm run check:links` | Liens, images et ancres locaux ; `<title>`, description, canonical, un seul `<h1>`, `<main>`, `alt`, aucun saut de niveau de titre ; cohérence `sitemap.xml` ↔ pages |
| `npm run certificats:build` | Régénère l'index chiffré des certificats (voir ci-dessous) |

Ces vérifications tournent automatiquement sur GitHub Actions (`.github/workflows/qualite.yml`) à chaque push sur `main` et chaque pull request. Dependabot propose chaque mois la mise à jour de l'outillage.

**Ajouter une page** : la déclarer dans `sitemap.xml` (sinon `check:links` échoue), reprendre l'en-tête/pied d'une page voisine (le contenu va dans `<main id="main-content">`). Un titre qui doit paraître plus petit garde le bon niveau et prend une classe : `<h3 class="h4">`.

**Modifier CSS/JS** : le Service Worker (`sw.js`) sert ces fichiers en *stale-while-revalidate* — les visiteurs récupèrent la nouvelle version dès la visite suivante. Incrémenter `CACHE_VERSION` dans `sw.js` pour forcer une purge complète (ou si la liste `PRECACHE` change).

## Vérification des certificats

`verification.html` interroge `assets/data/certificats.json`, un **index chiffré** : chaque entrée est chiffrée (AES-GCM) avec une clé dérivée du numéro de certificat (PBKDF2, 200 000 itérations). Le nom d'un diplômé n'est lisible que si l'on connaît son numéro — la liste complète n'est plus téléchargeable en clair.

1. Tenir la liste réelle dans `private/certificats.csv` (dossier **gitignoré**, ne jamais le committer) :
   ```
   numero;nom;formation;annee
   AATHCI-BMTGA-2025-0001-K7Q2;Prénom Nom;Musicothérapie;2025
   ```
2. `npm run certificats:build` → régénère `assets/data/certificats.json`, à committer.

Recommandation : ajouter un **suffixe aléatoire** aux nouveaux numéros (ex. `-K7Q2`). Des numéros purement séquentiels restent devinables par force brute, ce qui limite la protection.


## Accréditation

AATHCI-BMTGA-IA-2025-CI-19 — Association des Arts Thérapeutes et Praticiens Holistiques de Côte d'Ivoire

## Contact

- **Email** : Bmtgreenacademy@gmail.com
- **Téléphone** : +225 01 01 73 68 12 / 07 77 77 62 00
- **WhatsApp** : [Écrire sur WhatsApp](https://wa.me/2250101736812)
- **Adresse** : Abidjan, Côte d'Ivoire