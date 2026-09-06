document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile navigation ---- */
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-mobile-overlay');

  function closeNav() {
    if (navLinks) navLinks.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }
  function openNav() {
    if (navLinks) navLinks.classList.add('open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (overlay) { overlay.classList.add('visible'); overlay.style.display = 'block'; }
    document.body.style.overflow = 'hidden';
  }

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks && navLinks.classList.contains('open');
      isOpen ? closeNav() : openNav();
    });
  }
  if (overlay) overlay.addEventListener('click', closeNav);
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  }

  /* ---- Header scroll state ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onHeaderScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ---- Scroll progress bar ---- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  /* ---- Back to top button ---- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Retour en haut');
  toTop.innerHTML = '&#8593;';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);

  const onScroll = () => {
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
    toTop.classList.toggle('visible', h.scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Hero floating orbs ---- */
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.hero-orb')) {
    ['o1', 'o2', 'o3'].forEach(cls => {
      const orb = document.createElement('span');
      orb.className = 'hero-orb ' + cls;
      hero.appendChild(orb);
    });
  }

  /* ---- Pole-block accordion ---- */
  document.querySelectorAll('.pole-block-head').forEach(head => {
    head.setAttribute('role', 'button');
    head.setAttribute('aria-expanded', String(head.closest('.pole-block').classList.contains('is-open')));
    head.setAttribute('tabindex', '0');
    head.addEventListener('click', () => {
      const block = head.closest('.pole-block');
      const isOpen = block.classList.contains('is-open');
      block.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(!isOpen));
    });
    head.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
    });
  });

  /* ---- Accordion (FAQ, etc.) ---- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '0';
      }
    });
  });

  /* ---- Tab filtering ---- */
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    const targetSelector = tabGroup.dataset.target;
    const items = targetSelector ? document.querySelectorAll(targetSelector) : [];
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
            item.style.opacity = '0';
            requestAnimationFrame(() => { item.style.opacity = '1'; });
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });

  /* ---- Scroll reveal observer ---- */
  const autoReveal = document.querySelectorAll(
    '.pillars, .poles-list, .atouts-grid, .featured-grid, .parcours-steps, .team-grid, .partner-grid, .name-cloud, .grid-3, .grid-4, .value-cards, .stats-row, .logo-grid'
  );
  autoReveal.forEach(el => el.classList.add('reveal-stagger'));

  const soloReveal = document.querySelectorAll(
    '.section-header, .about-grid, .founder-card, .hero-quote, .accred-badge, .notice-box, .pole-block-head, .quote-block, .split-layout, .form-grid, .contact-split'
  );
  soloReveal.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-scale').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-scale').forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          let current = 0;
          const step = Math.max(1, Math.floor(target / 60));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = prefix + current.toLocaleString() + suffix;
          }, 20);
          cio.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---- Contact form: build a prefilled WhatsApp message ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const subject = contactForm.subject.value;
      const message = contactForm.message.value.trim();
      const text = `Bonjour \u00e9quipe BMT Green Academy,\n\nNom : ${name}\nEmail : ${email}\nSujet : ${subject}\n\n${message}`;
      window.open('https://wa.me/2250101736812?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* ---- Magnetic tilt on elevated cards (fine pointer + motion allowed only) ---- */
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.card--elevated, .formation-card, .founder-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    /* ---- Magnetic pull on primary CTA buttons ---- */
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.3;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
        btn.style.transform = `translate(${(dx - 2).toFixed(1)}px, ${(dy - 2).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---- Active nav link based on current page ---- */
  document.querySelectorAll('.nav-links a').forEach(link => {
    const hashMatches = link.hash ? link.hash === window.location.hash : true;
    if (link.pathname === window.location.pathname && hashMatches) {
      link.classList.add('active');
    }
  });

  /* ---- Footer copyright year (never needs manual updating again) ---- */
  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

});
