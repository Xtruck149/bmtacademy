#!/usr/bin/env node
// Génère assets/data/search-index.json, l'index de la recherche instantanée (Ctrl+K).
// Une entrée par page (titre, description, intertitres) + une entrée par matière du glossaire.
// À relancer après toute modification de contenu : npm run search:build
// (check:links échoue si une page du sitemap manque dans l'index).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = new Set(['404.html', 'offline.html']);

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'private') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(name)) out.push(p);
  }
  return out;
};

const decode = (s) => s
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&rsquo;/g, "'")
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const SECTION = [
  [/^programmes\//, 'Formation'], [/^formations\//, 'Formations'], [/^inclusive\//, 'Sport & inclusion'],
  [/^engagement\//, 'Engagement'], [/^univers\//, 'Univers'], [/./, "L'Académie"],
];

const entries = [];
for (const file of walk(ROOT).sort()) {
  const url = relative(ROOT, file).split(sep).join('/');
  if (SKIP.has(url)) continue;
  const html = readFileSync(file, 'utf8');
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0]
    .replace(/<!-- related:start -->[\s\S]*?<!-- related:end -->/, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || ['', ''])[1]).split(/ \| | — BMT Green Academy/)[0];
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || ['', ''])[1]);
  const heads = [...main.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)].map((m) => decode(m[1])).filter(Boolean);
  const section = SECTION.find(([re]) => re.test(url))[1];
  entries.push({ t: title, u: url, s: section, d: desc, k: [...new Set(heads)].join(' · ').slice(0, 600) });

  // Chaque matière du glossaire devient un résultat direct
  for (const m of main.matchAll(/<div class="glossary-item" id="([^"]+)"[^>]*><h3[^>]*><span class="n">(\d+)<\/span>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>[\s\S]*?<span class="glossary-code">([^<]+)<\/span>/g)) {
    entries.push({ t: decode(m[3]), u: `${url}#${m[1]}`, s: 'Matière', d: decode(m[4]), k: m[5] });
  }
}
writeFileSync(join(ROOT, 'assets/data/search-index.json'), JSON.stringify(entries));
console.log(`✔ index de recherche : ${entries.length} entrées`);
