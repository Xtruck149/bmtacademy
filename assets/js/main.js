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

  /* ---- Header scroll shadow ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 4px 30px rgba(11,61,46,0.12)'
        : 'none';
    }, { passive: true });
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

  /* ---- Smooth scroll offset for sticky header ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Pole-block accordion ---- */
  document.querySelectorAll('.pole-block-head').forEach(head => {
    head.setAttribute('role', 'button');
    head.setAttribute('aria-expanded', 'false');
    head.setAttribute('tabindex', '0');
    head.addEventListener('click', () => {
      const block = head.closest('.pole-block');
      const isOpen = block.classList.contains('is-open');
      block.classList.toggle('is-open');
      head.setAttribute('aria-expanded', !isOpen);
    });
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        head.click();
      }
    });
  });

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

  /* ---- Contact form success feedback ---- */
  if (window.location.search.includes('sent=1')) {
    const form = document.querySelector('.contact-form');
    if (form) {
      const msg = document.createElement('div');
      msg.style.cssText = 'background:linear-gradient(120deg,rgba(31,169,124,0.14),rgba(52,211,153,0.14));border:1px solid rgba(31,169,124,0.35);border-radius:var(--radius-sm);padding:18px 24px;margin-bottom:24px;font-weight:600;color:var(--green-mid);';
      msg.textContent = 'Votre message a bien été envoyé ! Nous vous répondrons très rapidement.';
      form.parentNode.insertBefore(msg, form);
      history.replaceState(null, '', window.location.pathname);
    }
  }
});
