// Vérifications statiques du site (aucune dépendance, exécuté en CI) :
//  - chaque lien/asset local (href, src, srcset, poster, url()) pointe vers un fichier existant
//  - chaque ancre #id locale existe dans la page cible
//  - chaque page a un <title>, une meta description, un canonical, un seul <h1>, un <main>
//  - sitemap.xml ↔ pages HTML cohérents
// Usage : npm run check:links
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const ROOT = resolve('.');
const SITE = 'https://xtruck149.github.io/bmtacademy/';
const SKIP_DIRS = new Set(['.git', 'node_modules', 'content-import', '.github', 'scripts', 'private']);
const NOT_IN_SITEMAP = new Set(['404.html', 'offline.html']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(name)) out.push(p);
  }
  return out;
}

const pages = walk(ROOT);
const errors = [];
const idCache = new Map();
const idsOf = (file) => {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1])));
  }
  return idCache.get(file);
};

for (const page of pages) {
  const rel = relative(ROOT, page);
  const html = readFileSync(page, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  // <base href="/bmtacademy/"> (404.html) : les chemins relatifs partent de la racine du site.
  const hasBase = /<base href="\/bmtacademy\/">/.test(html);
  const baseDir = hasBase ? ROOT : dirname(page);
  const refs = [];
  for (const m of html.matchAll(/<(?!base\b)[a-z]+\b[^>]*?\s(?:href|src|poster)=["']([^"']+)["']/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/g)) m[1].split(',').forEach(s => refs.push(s.trim().split(/\s+/)[0]));
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refs.push(m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref) || ref.includes('${')) continue;
    const [pathPart, hash] = ref.split('#');
    const target = pathPart ? resolve(baseDir, decodeURI(pathPart.split('?')[0])) : page;
    if (!existsSync(target)) { errors.push(`${rel} → fichier introuvable : ${ref}`); continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) {
      errors.push(`${rel} → ancre introuvable : ${ref}`);
    }
  }

  if (rel === 'offline.html') continue;
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel} → <title> manquant`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel} → meta description manquante`);
  if (rel !== '404.html' && !/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) errors.push(`${rel} → canonical manquant`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel} → ${h1} balise(s) <h1> (1 attendue)`);
  if (!/<main[\s>]/.test(html)) errors.push(`${rel} → landmark <main> manquant`);
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) errors.push(`${rel} → <img> sans alt : ${m[0].slice(0, 80)}`);
}

// sitemap ↔ pages
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const inSitemap = new Set();
for (const loc of locs) {
  if (!loc.startsWith(SITE)) { errors.push(`sitemap.xml → URL hors site : ${loc}`); continue; }
  let p = loc.slice(SITE.length) || 'index.html';
  if (p.endsWith('/')) p += 'index.html';
  inSitemap.add(p);
  if (!existsSync(join(ROOT, p))) errors.push(`sitemap.xml → page inexistante : ${loc}`);
}
for (const page of pages) {
  const rel = relative(ROOT, page).split('\\').join('/');
  if (!NOT_IN_SITEMAP.has(rel) && !inSitemap.has(rel)) errors.push(`sitemap.xml → page absente : ${rel}`);
}

if (errors.length) {
  console.error(`✖ ${errors.length} problème(s) :\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✔ ${pages.length} pages vérifiées, ${locs.length} URL du sitemap — aucun problème.`);
