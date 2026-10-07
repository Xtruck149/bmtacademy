// Génère des numéros de certificat avec suffixe aléatoire (non énumérable).
//
// Usage :
//   npm run certificats:numero -- 2025 0007        # → AATHCI-BMTGA-2025-0007-K7Q2
//   npm run certificats:numero -- 2025 0007 3      # 3 numéros à partir de 0007
//
// Alphabet sans caractères ambigus (pas de 0/O, 1/I) pour limiter les erreurs de saisie.
import { webcrypto as crypto } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const [annee, debut, nombre = '1'] = process.argv.slice(2);

if (!/^\d{4}$/.test(annee || '') || !/^\d{1,4}$/.test(debut || '') || !/^\d+$/.test(nombre)) {
  console.error('Usage : npm run certificats:numero -- <année> <n° de départ> [nombre]');
  process.exit(1);
}

const suffixe = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => ALPHABET[b % ALPHABET.length]).join('');

for (let i = 0; i < Number(nombre); i++) {
  console.log(`AATHCI-BMTGA-${annee}-${String(Number(debut) + i).padStart(4, '0')}-${suffixe()}`);
}
