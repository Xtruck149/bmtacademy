/* ==========================================================
   Carte interactive diaspora — 100% côté client.
   Charge assets/data/diaspora.json (données placeholder) et
   dessine des points cliquables/survolables sur le SVG #diaspora-map.
   ========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  const svg = document.getElementById('diaspora-map');
  if (!svg) return;

  const group = document.getElementById('diaspora-points');
  const detail = document.getElementById('diaspora-detail');
  const svgNS = 'http://www.w3.org/2000/svg';

  function showDetail(point) {
    detail.innerHTML = `
      <h4>${point.ville}</h4>
      <p>${point.pays}</p>
      <p class="diaspora-count">${point.etudiants} étudiants &amp; alumni</p>
      <p class="form-note">Donnée d'exemple — à remplacer par le chiffre réel.</p>
    `;
  }

  try {
    const res = await fetch('assets/data/diaspora.json', { cache: 'no-store' });
    const data = await res.json();

    (data.points || []).forEach(point => {
      const radius = 6 + Math.sqrt(point.etudiants) * 0.9;

      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
      dot.setAttribute('r', radius);
      dot.setAttribute('class', 'diaspora-point');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `${point.ville}, ${point.pays} — ${point.etudiants} étudiants`);

      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `${point.ville} (${point.pays}) — ${point.etudiants} étudiants`;
      dot.appendChild(title);

      dot.addEventListener('mouseenter', () => showDetail(point));
      dot.addEventListener('focus', () => showDetail(point));
      dot.addEventListener('click', () => showDetail(point));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(point); }
      });

      group.appendChild(dot);
    });
  } catch (err) {
    detail.innerHTML = '<p class="form-note">Impossible de charger les données de la carte pour le moment.</p>';
  }
});
