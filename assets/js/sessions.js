/* ==========================================================
   Prochaines rentrées — 100% côté client, aucun backend.
   Charge assets/data/sessions.json (dates placeholder) et
   affiche les sessions à venir triées par date.
   ========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('sessions-grid');
  if (!grid) return;

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  try {
    const res = await fetch('../assets/data/sessions.json', { cache: 'no-store' });
    const data = await res.json();
    const sessions = (data.sessions || []).slice().sort((a, b) => a.date.localeCompare(b.date));

    grid.innerHTML = sessions.map(s => {
      const isLimited = s.places === 'limitees';
      const badgeClass = isLimited ? 'limited' : 'available';
      const badgeText = isLimited ? 'Places limitées' : 'Places disponibles';
      return `
        <div class="card card--bordered">
          <div class="card-body">
            <span class="tag ${badgeClass}">${badgeText}</span>
            <h4 class="mt-md">${s.formation}</h4>
            <p>${formatDate(s.date)}</p>
            <p class="form-note">${s.lieu}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    grid.innerHTML = '<p class="form-note">Calendrier indisponible pour le moment.</p>';
  }
});
