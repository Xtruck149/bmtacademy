/* ==========================================================
   FAQ — recherche instantanée, 100% côté client.
   Filtre les .accordion-item de #faq-list par mot-clé (question +
   réponse), sans backend ni index externe.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('faq-search-input');
  const list = document.getElementById('faq-list');
  const empty = document.getElementById('faq-empty');
  if (!input || !list) return;

  const items = Array.from(list.querySelectorAll('.accordion-item')).map(item => ({
    el: item,
    text: item.textContent.toLowerCase(),
  }));

  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  input.addEventListener('input', () => {
    const query = normalize(input.value.trim());
    let visibleCount = 0;

    items.forEach(({ el, text }) => {
      const matches = !query || normalize(text).includes(query);
      el.hidden = !matches;
      if (matches) visibleCount++;
    });

    empty.hidden = visibleCount > 0;
  });
});
