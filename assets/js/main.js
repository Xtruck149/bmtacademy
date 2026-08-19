document.addEventListener('DOMContentLoaded', () => {

  /* ---- Menu mobile ---- */
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---- Barre de progression de scroll ---- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  /* ---- Bouton retour en haut ---- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Retour en haut');
  toTop.innerHTML = '↑';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);

  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
    toTop.classList.toggle('visible', h.scrollTop > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Marquage automatique des blocs à animer ---- */
  const autoTargets = document.querySelectorAll(
    '.pillars, .poles-list, .atouts-grid, .featured-grid, .parcours-steps, .team-grid, .partner-grid, .name-cloud'
  );
  autoTargets.forEach(el => el.classList.add('reveal-stagger'));

  const soloTargets = document.querySelectorAll(
    '.section-head, .about-grid, .founder-card, .hero-quote, .accred-badge, .notice-box, .pole-block-head'
  );
  soloTargets.forEach(el => el.classList.add('reveal'));

  /* ---- Observer d'apparition au scroll ---- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Orbes flottants dans le hero ---- */
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.hero-orb')) {
    ['o1', 'o2', 'o3'].forEach(cls => {
      const orb = document.createElement('span');
      orb.className = 'hero-orb ' + cls;
      hero.appendChild(orb);
    });
  }
});
