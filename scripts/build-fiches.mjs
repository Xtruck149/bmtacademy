// Génère les fiches formation listées dans assets/data/formations.json qui possèdent
// un champ "fiche" (slug + modules). Gabarit : en-tête/pied de programmes/musicotherapie.html.
// Usage : node scripts/build-fiches.mjs   (puis npm run search:build && npm test)
import fs from 'node:fs';

const BASE = 'https://xtruck149.github.io/bmtacademy';
const data = JSON.parse(fs.readFileSync('assets/data/formations.json', 'utf8'));
const tpl = fs.readFileSync('programmes/musicotherapie.html', 'utf8');
const head0 = tpl.slice(0, tpl.indexOf('<main id="main-content">'));
const foot = tpl.slice(tpl.indexOf('</main>') + '</main>'.length);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonld = o => JSON.stringify(o, null, 2);

for (const f of data.formations.filter(x => x.fiche)) {
  const { slug, intro, modules, unite, points } = f.fiche;
  const url = `${BASE}/programmes/${slug}.html`;
  const wa = 'https://wa.me/2250101736812?text=' + encodeURIComponent(`Bonjour, je m'intéresse à la formation ${f.titre}.`);
  const cover = f.couverture;
  const prix = f.prix_fcfa ? `${String(f.prix_fcfa).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA` : 'Prix à définir';

  // En-tête : on remplace titres, URLs et JSON-LD du gabarit.
  let head = head0
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(f.titre)} | BMT Green Academy</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(f.resume)} Formation BMT Green Academy.">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(f.titre)} | BMT Green Academy">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(f.resume)}">`)
    .replace(/https:\/\/xtruck149\.github\.io\/bmtacademy\/programmes\/musicotherapie\.html/g, url)
    .replace(/<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "BreadcrumbList"[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${jsonld({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Formations', item: BASE + '/formations/index.html' },
          { '@type': 'ListItem', position: 3, name: f.titre, item: url },
        ],
      })}\n</script>`)
    .replace(/<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "Course"[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${jsonld({
        '@context': 'https://schema.org', '@type': 'Course', name: f.titre, description: f.resume, url,
        provider: { '@type': 'EducationalOrganization', name: 'BMT Green Academy', url: BASE + '/' },
        inLanguage: 'fr',
      })}\n</script>`);
  head = head.replace(/<link rel="preload" as="image"[^>]*>/g, '');
  const ogImg = cover ? `${BASE}/${cover}.jpg` : `${BASE}/assets/img/logo-512.png`;
  head = head.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogImg}$2`).replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${ogImg}$2`).replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(f.titre)} — BMT Green Academy$2`).replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(f.titre)}$2`);

  const cards = modules.map((m, i) => `      <div class="card card--elevated">
        <div class="card-body">
          <span class="card-tag card-tag--gold">${unite || 'Module'} ${i + 1}</span>
          <h3 class="h4">${esc(m)}</h3>
        </div>
      </div>`).join('\n');
  const docsHtml = (f.documents || []).length ? `<section class="section-compact bg-cream">
  <div class="wrap">
    <div class="section-header centered">
      <span class="eyebrow">Supports de formation</span>
      <h2>Les documents que vous recevez</h2>
    </div>
    <div class="grid-3">
${f.documents.map(x => `      <figure class="photo-card"><picture><source srcset="../${x.image}.webp" type="image/webp"><img src="../${x.image}.jpg" alt="Couverture : ${esc(x.titre)}" width="900" height="1274" loading="lazy"></picture><figcaption>${esc(x.titre)}${x.pages ? ' — ' + x.pages + ' pages' : ''}</figcaption></figure>`).join('\n')}
    </div>
  </div>
</section>

` : '';
const pts = (points || []).map(p => `          <li>${esc(p)}</li>`).join('\n');

  const main = `<main id="main-content">

<div class="wrap">
  <nav class="breadcrumbs" aria-label="Fil d'Ariane">
    <a href="../index.html">Accueil</a>
    <span class="sep">/</span>
    <a href="../formations/index.html">Formations</a>
    <span class="sep">/</span>
    <span class="current" aria-current="page">${esc(f.titre)}</span>
  </nav>
</div>

<section class="hero hero--default hero--short">
  <img src="../assets/img/logo.webp" alt="" aria-hidden="true" class="hero-logo-badge" width="260" height="260">
  <div class="wrap hero-inner">
    <span class="eyebrow eyebrow--light">Formation BMT Green Academy</span>
    <h1>${esc(f.titre)}</h1>
    <p class="lead">${esc(f.resume)}</p>
    <div class="hero-actions">
      <a href="${wa}" class="btn btn-primary">Être informé(e) — ${prix}</a>
      <a href="../formations/catalogue.html" class="btn btn-outline">Retour au catalogue</a>
    </div>
  </div>
</section>

<section class="section-compact bg-cream">
  <div class="wrap">
    <div class="split-layout">
      <div>
        <span class="eyebrow">Présentation</span>
        <h2>${esc(f.titre)}</h2>
${intro.map(p => `        <p>${esc(p)}</p>`).join('\n')}
${pts ? `        <ul>\n${pts}\n        </ul>` : ''}
      </div>
${cover ? `      <figure class="photo-card">
        <picture><source srcset="../${cover}.webp" type="image/webp"><img src="../${cover}.jpg" alt="Couverture du support de formation : ${esc(f.titre)}" width="900" height="1274" loading="lazy"></picture>
      </figure>` : ''}
    </div>
  </div>
</section>

<section class="section-compact bg-surface">
  <div class="wrap">
    <div class="section-header centered">
      <span class="eyebrow">Programme</span>
      <h2>${modules.length} ${unite === 'Partie' ? 'parties' : 'modules'}</h2>
    </div>
    <div class="grid-3">
${cards}
    </div>
  </div>
</section>

${docsHtml}<section class="cta-band">
  <div class="wrap">
    <h2>${prix}</h2>
    <p>Formation en ligne, à votre rythme, avec évaluation finale et certificat BMT Green Academy.</p>
    <a href="${wa}" class="btn btn-primary">Nous écrire sur WhatsApp</a>
  </div>
</section>

<div class="nav-mobile-overlay"></div>
</main>`;
  fs.writeFileSync(`programmes/${slug}.html`, head + main + foot);
  console.log('fiche', slug);
}
