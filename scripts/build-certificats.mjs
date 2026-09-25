// Génère assets/data/certificats.json (index PUBLIC chiffré) à partir d'un CSV PRIVÉ.
//
// Pourquoi : l'ancien JSON publiait en clair le nom de chaque diplômé — n'importe qui
// pouvait télécharger la liste complète. Désormais chaque entrée est chiffrée
// (AES-GCM 256) avec une clé dérivée du numéro de certificat (PBKDF2-SHA-256) :
// on ne peut lire une entrée qu'en connaissant son numéro, exactement comme sur
// la page de vérification. L'identifiant de l'entrée est lui aussi dérivé par PBKDF2,
// donc chaque tentative de devinette coûte ~200 000 itérations.
//
// Limite honnête : la protection vaut ce que vaut l'imprévisibilité des numéros.
// Des numéros séquentiels (…-2025-0001, 0002…) restent énumérables avec du temps de
// calcul. Recommandé pour les nouveaux certificats : ajouter un suffixe aléatoire,
// ex. AATHCI-BMTGA-2025-0001-K7Q2.
//
// Usage :
//   npm run certificats:build                 # lit private/certificats.csv (gitignoré)
//   npm run certificats:build -- --exemple    # lit scripts/certificats.exemple.csv
// CSV : séparateur « ; », en-tête numero;nom;formation;annee, UTF-8.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 200_000;
const src = process.argv.includes('--exemple') ? 'scripts/certificats.exemple.csv' : 'private/certificats.csv';
const OUT = 'assets/data/certificats.json';

if (!existsSync(src)) {
  console.error(`✖ ${src} introuvable. Créez-le (voir en-tête de ce script) ou lancez avec --exemple.`);
  process.exit(1);
}

const normalize = s => s.trim().toUpperCase().replace(/\s+/g, '');
const b64 = buf => Buffer.from(buf).toString('base64');
const enc = new TextEncoder();

const rows = readFileSync(src, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
const header = rows.shift().split(';').map(h => h.trim().toLowerCase());
for (const col of ['numero', 'nom', 'formation', 'annee']) {
  if (!header.includes(col)) { console.error(`✖ Colonne « ${col} » absente de ${src}`); process.exit(1); }
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const entries = {};
const seen = new Set();

for (const [i, line] of rows.entries()) {
  const cells = line.split(';');
  const rec = Object.fromEntries(header.map((h, j) => [h, (cells[j] || '').trim()]));
  const numero = normalize(rec.numero);
  if (!numero) { console.error(`✖ Ligne ${i + 2} : numéro vide`); process.exit(1); }
  if (seen.has(numero)) { console.error(`✖ Ligne ${i + 2} : numéro en double ${numero}`); process.exit(1); }
  seen.add(numero);

  const base = await crypto.subtle.importKey('raw', enc.encode(numero), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, base, 512));
  const id = Buffer.from(bits.slice(32)).toString('hex');
  const key = await crypto.subtle.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = { numero, nom: rec.nom, formation: rec.formation, annee: rec.annee };
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload)));
  entries[id] = { iv: b64(iv), data: b64(data) };
}

const out = {
  _lisezmoi: 'Fichier GÉNÉRÉ par scripts/build-certificats.mjs — ne pas éditer à la main. Chaque entrée est chiffrée avec une clé dérivée du numéro de certificat : aucun nom n’est lisible sans connaître le numéro.',
  version: 2,
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: b64(salt) },
  entries,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`✔ ${seen.size} certificat(s) chiffré(s) → ${OUT}`);
