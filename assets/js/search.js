/* ==========================================================
   Recherche instantanée — Ctrl+K / ⌘K / « / » ou bouton loupe.
   Index statique : assets/data/search-index.json (npm run search:build).
   100 % côté client, insensible aux accents, navigation au clavier.
   ========================================================== */
(() => {
  const btn = document.querySelector('.search-toggle');
  if (!btn || typeof HTMLDialogElement !== 'function') return;

  // Racine du site déduite de l'emplacement de ce script (fonctionne à toute profondeur)
  const script = document.currentScript || document.querySelector('script[src$="search.js"]');
  const root = new URL('../../', script.src);
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const dlg = document.createElement('dialog');
  dlg.className = 'search-dialog';
  dlg.setAttribute('closedby', 'any');
  dlg.setAttribute('aria-label', 'Rechercher sur le site');
  dlg.innerHTML = `
    <div class="search-head">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="Rechercher une formation, une matière, une page…" aria-label="Rechercher" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list">
      <button type="button" aria-label="Fermer la recherche">Échap</button>
    </div>
    <ul class="search-results" id="search-results" role="listbox" aria-label="Résultats"></ul>`;
  document.body.appendChild(dlg);
  const input = dlg.querySelector('input');
  const list = dlg.querySelector('.search-results');
  dlg.querySelector('.search-head button').addEventListener('click', () => dlg.close());

  // Repli « clic sur le fond » pour les navigateurs sans l'attribut closedby
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dlg.addEventListener('click', (e) => {
      if (e.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) dlg.close();
    });
  }

  let index = null;
  let active = -1;
  const load = () => index || (index = fetch(new URL('assets/data/search-index.json', root))
    .then((r) => r.json())
    .then((d) => d.map((e) => ({ ...e, nt: norm(e.t), nd: norm(e.d), nk: norm(e.k) })))
    .catch(() => (index = null, [])));

  const highlight = (text, terms) => {
    let out = esc(text);
    terms.forEach((t) => {
      if (t.length < 2) return;
      const n = norm(text);
      const i = n.indexOf(t);
      if (i < 0) return;
      const raw = text.slice(i, i + t.length);
      out = out.replace(esc(raw), `<mark>${esc(raw)}</mark>`);
    });
    return out;
  };

  const render = async () => {
    const q = norm(input.value.trim());
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) {
      list.innerHTML = '<li class="search-hint">Tapez quelques lettres : « musico », « roll ball », « certificat », « CHROMA »…</li>';
      active = -1;
      return;
    }
    const data = await load();
    const scored = [];
    for (const e of data) {
      let score = 0;
      let ok = true;
      for (const t of terms) {
        const s = (e.nt.includes(t) ? 10 : 0) + (e.nt.startsWith(t) ? 5 : 0) + (e.nk.includes(t) ? 4 : 0) + (e.nd.includes(t) ? 2 : 0);
        if (!s) { ok = false; break; }
        score += s;
      }
      if (ok) scored.push([score + (e.s === 'Matière' ? 0 : 1), e]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    const top = scored.slice(0, 12).map(([, e]) => e);
    active = top.length ? 0 : -1;
    list.innerHTML = top.length
      ? top.map((e, i) => `<li><a href="${new URL(e.u, root).href}" role="option" id="sr-${i}" aria-selected="${i === 0}">
          <span class="sr-section">${esc(e.s)}</span>
          <span class="sr-title">${highlight(e.t, terms)}</span>
          <span class="sr-desc">${highlight(e.d.slice(0, 150), terms)}</span></a></li>`).join('')
      : '<li class="search-empty">Aucun résultat. Essayez un autre mot, ou <a href="' + new URL('contact.html', root).href + '">écrivez-nous</a>.</li>';
    input.setAttribute('aria-activedescendant', active >= 0 ? 'sr-0' : '');
  };

  const move = (d) => {
    const items = [...list.querySelectorAll('a[role="option"]')];
    if (!items.length) return;
    active = (active + d + items.length) % items.length;
    items.forEach((a, i) => a.setAttribute('aria-selected', String(i === active)));
    items[active].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', items[active].id);
  };

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const a = list.querySelectorAll('a[role="option"]')[active];
      if (a) { e.preventDefault(); location.href = a.href; }
    }
  });

  const open = () => {
    if (dlg.open) return;
    dlg.showModal();
    input.select();
    render();
    load();
  };
  btn.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
  });
})();
