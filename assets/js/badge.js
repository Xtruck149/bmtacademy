/* ==========================================================
   Badge Alumni — génération 100% côté client via Canvas.
   Aucune donnée n'est envoyée nulle part : tout reste dans le
   navigateur, le badge est juste une image dessinée localement.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('badge-form');
  if (!form) return;

  const canvas = document.getElementById('badge-canvas');
  const ctx = canvas.getContext('2d');
  const actions = document.getElementById('badge-actions');
  const downloadBtn = document.getElementById('badge-download');

  const BRAND_GREEN = '#0E4D38';
  const GOLD = '#B98A3D';
  const INK = '#142016';

  function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawBadge({ nom, formation, annee }) {
    const w = canvas.width, h = canvas.height;

    // Fond
    ctx.fillStyle = BRAND_GREEN;
    ctx.fillRect(0, 0, w, h);

    // Bande dorée en haut
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, w, 14);

    // Cadre
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    // Médaillon
    ctx.beginPath();
    ctx.arc(w / 2, 150, 66, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle = BRAND_GREEN;
    ctx.font = '700 34px Baloo 2, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BMT', w / 2, 150);

    // "Alumni"
    ctx.fillStyle = GOLD;
    ctx.font = '700 26px Baloo 2, Nunito, sans-serif';
    ctx.fillText('CERTIFICAT ALUMNI', w / 2, 250);

    // Nom
    ctx.fillStyle = '#fff';
    ctx.font = '800 44px Baloo 2, Nunito, sans-serif';
    wrapText(nom, w - 160).forEach((line, i, arr) => {
      const y = 320 + i * 50 - ((arr.length - 1) * 25);
      ctx.fillText(line, w / 2, y);
    });

    // Formation
    ctx.fillStyle = '#EFE6CF';
    ctx.font = '500 26px Nunito, sans-serif';
    const formationLines = wrapText(formation, w - 200);
    let fy = 400;
    formationLines.forEach(line => { ctx.fillText(line, w / 2, fy); fy += 34; });

    // Année
    ctx.fillStyle = GOLD;
    ctx.font = '700 24px Baloo 2, Nunito, sans-serif';
    ctx.fillText(`Promotion ${annee}`, w / 2, fy + 20);

    // Pied de badge
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 16px Nunito, sans-serif';
    ctx.fillText('BMT Green Academy — bmtgreenacademy.com', w / 2, h - 50);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('badge-nom').value.trim();
    const formation = document.getElementById('badge-formation').value.trim();
    const annee = document.getElementById('badge-annee').value.trim();
    if (!nom || !formation || !annee) return;

    canvas.hidden = false;
    actions.hidden = false;
    drawBadge({ nom, formation, annee });
  });

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'badge-alumni-bmt.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});
