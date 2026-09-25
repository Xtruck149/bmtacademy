/* ==========================================================
   Vérification de certificat — 100% côté client, aucun backend.
   assets/data/certificats.json est un index CHIFFRÉ généré par
   scripts/build-certificats.mjs : le numéro saisi sert à dériver
   (PBKDF2) l'identifiant de l'entrée et sa clé AES-GCM. Aucun nom
   de diplômé n'est lisible sans connaître le numéro exact.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('verif-form');
  if (!form) return;

  const input = document.getElementById('verif-numero');
  const resultBox = document.getElementById('verif-result');
  const submitBtn = form.querySelector('[type="submit"]');
  const enc = new TextEncoder();

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalize = str => str.trim().toUpperCase().replace(/\s+/g, '');
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toHex = buf => Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');

  function render(html, cls) {
    resultBox.className = `mt-xl result-card ${cls}`;
    resultBox.innerHTML = html;
    resultBox.hidden = false;
  }

  let indexPromise = null;
  const loadIndex = () => {
    indexPromise = indexPromise || fetch('assets/data/certificats.json', { cache: 'no-store' })
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .catch(err => { indexPromise = null; throw err; });
    return indexPromise;
  };

  async function lookup(numero) {
    const index = await loadIndex();
    const { kdf, entries } = index;
    const base = await crypto.subtle.importKey('raw', enc.encode(numero), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: kdf.hash, salt: fromB64(kdf.salt), iterations: kdf.iterations }, base, 512));
    const entry = entries[toHex(bits.slice(32))];
    if (!entry) return null;
    const key = await crypto.subtle.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(entry.iv) }, key, fromB64(entry.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const numero = normalize(input.value);
    if (!numero) return;

    if (!window.crypto || !crypto.subtle) {
      render('<p>Votre navigateur ne permet pas la vérification sécurisée. Essayez un navigateur récent ou <a href="contact.html">contactez-nous</a>.</p>', 'result-invalid');
      return;
    }

    render('<p>Recherche en cours…</p>', '');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const match = await lookup(numero);
      if (match) {
        render(`
          <h3>✔ Certificat valide</h3>
          <p><strong>${esc(match.nom)}</strong></p>
          <p>${esc(match.formation)} — Promotion ${esc(match.annee)}</p>
          <p class="form-note">Numéro : ${esc(match.numero)}</p>
        `, 'result-valid');
      } else {
        render(`
          <h3>Certificat non trouvé</h3>
          <p>Aucun certificat ne correspond à ce numéro. Vérifiez la saisie ou <a href="contact.html">contactez-nous</a>.</p>
        `, 'result-invalid');
      }
    } catch (err) {
      render('<p>Impossible de vérifier le certificat pour le moment. Réessayez plus tard.</p>', 'result-invalid');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
