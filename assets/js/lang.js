/* ==========================================================
   Bascule FR/EN — 100% côté client, préférence en localStorage.
   Traduit uniquement les éléments porteurs de data-fr/data-en.
   Cette page ne fait PAS partie des pages traduites en intégralité :
   seuls le hero et quelques titres le sont (voir TODO.md).
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'bmt-lang';
  const translatable = document.querySelectorAll('[data-fr][data-en]');

  function apply(lang) {
    translatable.forEach(el => {
      el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-fr');
    });
    document.documentElement.lang = lang;
    toggle.textContent = lang === 'en' ? 'FR' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Passer en français' : 'Switch to English');
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (err) { /* localStorage indisponible */ }
  }

  let current = 'fr';
  try { current = localStorage.getItem(STORAGE_KEY) || 'fr'; } catch (err) { /* localStorage indisponible */ }
  apply(current);

  toggle.addEventListener('click', () => {
    current = current === 'en' ? 'fr' : 'en';
    apply(current);
  });
});
