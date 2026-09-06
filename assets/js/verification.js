/* ==========================================================
   Vérification de certificat — 100% côté client, aucun backend.
   Cherche le numéro saisi dans assets/data/certificats.json.
   Pour ajouter de vrais certificats, éditez ce fichier JSON.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('verif-form');
  if (!form) return;

  const input = document.getElementById('verif-numero');
  const resultBox = document.getElementById('verif-result');

  function normalize(str) {
    return str.trim().toUpperCase().replace(/\s+/g, '');
  }

  function render(html, cls) {
    resultBox.className = `mt-xl result-card ${cls}`;
    resultBox.innerHTML = html;
    resultBox.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const numero = normalize(input.value);
    if (!numero) return;

    render('<p>Recherche en cours…</p>', '');

    try {
      const res = await fetch('assets/data/certificats.json', { cache: 'no-store' });
      const data = await res.json();
      const match = (data.certificats || []).find(c => normalize(c.numero) === numero);

      if (match) {
        render(`
          <h3>✔ Certificat valide</h3>
          <p><strong>${match.nom}</strong></p>
          <p>${match.formation} — Promotion ${match.annee}</p>
          <p class="form-note">Numéro : ${match.numero}</p>
        `, 'result-valid');
      } else {
        render(`
          <h3>Certificat non trouvé</h3>
          <p>Aucun certificat ne correspond à ce numéro. Vérifiez la saisie ou <a href="contact.html">contactez-nous</a>.</p>
        `, 'result-invalid');
      }
    } catch (err) {
      render('<p>Impossible de vérifier le certificat pour le moment. Réessayez plus tard.</p>', 'result-invalid');
    }
  });
});
