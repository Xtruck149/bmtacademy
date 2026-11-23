/* Catalogue des formations : lit assets/data/formations.json, filtre par catégorie
   et par recherche. Les formations "masque" ne sont jamais affichées. */
(function () {
  'use strict';
  const grid = document.getElementById('catalogue-grid');
  const filters = document.getElementById('catalogue-filters');
  const search = document.getElementById('catalogue-search');
  const status = document.getElementById('catalogue-status');
  if (!grid || !filters) return;

  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  let data = null;
  let active = 'toutes';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  function card(f, catName) {
    const art = el('article', 'card catalogue-card');
    const media = el('div', 'catalogue-media');
    if (f.image) {
      const pic = document.createElement('picture');
      const src = el('source');
      src.type = 'image/webp';
      src.srcset = f.image + '.webp';
      const img = document.createElement('img');
      img.src = f.image + '.jpg';
      img.alt = '';
      img.loading = 'lazy';
      img.width = 640;
      img.height = 400;
      pic.append(src, img);
      media.append(pic);
    } else {
      const img = document.createElement('img');
      img.src = '../assets/img/logo-216.webp';
      img.alt = '';
      img.loading = 'lazy';
      img.width = 108;
      img.height = 104;
      img.className = 'catalogue-logo';
      media.append(img);
    }
    const body = el('div', 'card-body');
    const badges = el('div', 'catalogue-badges');
    badges.append(el('span', 'tag soon', catName));
    if (f.bestseller) badges.append(el('span', 'tag now', 'Populaire'));
    if (f.nouveau) badges.append(el('span', 'tag now', 'Nouveau'));
    if (f.statut === 'bientot') badges.append(el('span', 'tag soon', 'Bientôt'));
    const h = el('h3', 'h4');
    if (f.page) {
      const a = el('a', null, f.titre);
      a.href = f.page;
      h.append(a);
    } else {
      h.textContent = f.titre;
    }
    body.append(badges, h, el('p', null, f.resume));
    if (f.modules) body.append(el('p', 'catalogue-meta', f.modules + ' modules'));
    body.append(el('p', 'catalogue-price', f.prix_fcfa ? fmt(f.prix_fcfa) : 'Prix à définir'));
    const cta = el('a', 'btn btn-outline-dark btn-sm');
    if (f.page) {
      cta.href = f.page;
      cta.textContent = 'Voir la formation';
    } else {
      cta.href = 'https://wa.me/2250101736812?text=' +
        encodeURIComponent("Bonjour, je m'intéresse à la formation " + f.titre + '.');
      cta.textContent = 'Être informé(e)';
    }
    body.append(cta);
    art.append(media, body);
    return art;
  }

  function render() {
    const q = (search.value || '').trim().toLowerCase();
    const names = Object.fromEntries(data.categories.map(c => [c.id, c.titre]));
    const list = data.formations.filter(f => f.statut !== 'masque' &&
      (active === 'toutes' || f.categorie === active) &&
      (!q || (f.titre + ' ' + f.resume).toLowerCase().includes(q)));
    grid.replaceChildren(...list.map(f => card(f, names[f.categorie] || '')));
    status.textContent = list.length + (list.length > 1 ? ' formations' : ' formation');
  }

  function buildFilters() {
    const visible = new Set(data.formations.filter(f => f.statut !== 'masque').map(f => f.categorie));
    const all = [{ id: 'toutes', titre: 'Toutes' }, ...data.categories.filter(c => visible.has(c.id))];
    all.forEach(c => {
      const b = el('button', 'catalogue-chip', c.titre);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c.id === active));
      b.addEventListener('click', () => {
        active = c.id;
        filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        render();
      });
      filters.append(b);
    });
  }

  fetch('../assets/data/formations.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { data = d; buildFilters(); render(); search.addEventListener('input', render); })
    .catch(() => { status.textContent = 'Le catalogue est momentanément indisponible. Consultez la page Toutes les formations.'; });
})();
