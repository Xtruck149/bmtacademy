/* ==========================================================
   Quiz "Trouve ta formation" — 100% côté client, aucun backend.
   Chaque réponse ajoute des points à des pages de programmes ;
   à la fin, les 3 pages avec le plus de points sont recommandées.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quiz-form');
  if (!form) return;

  const PAGE_TITLES = {
    'programmes/art-de-la-paix.html': "L'Art de la Paix",
    'programmes/art-de-limpact.html': "L'Art de l'Impact",
    'programmes/sexotherapie.html': 'Sexothérapie',
    'programmes/mystere-sacre-des-epices.html': 'Le Mystère Sacré des Épices',
    'programmes/musicotherapie.html': 'Musicothérapie',
    'programmes/grounding-respiration-consciente.html': 'Grounding & Respiration Consciente',
    'programmes/maquillage-fx.html': 'Maquillage FX',
    'programmes/rap-ivoire-therapie.html': 'Rap Ivoire Thérapie',
    'programmes/therapie-par-lart-adultes.html': "Thérapie par l'Art — Adultes",
    'programmes/therapie-par-lart-enfants.html': "Thérapie par l'Art — Enfants",
    'programmes/profilage-criminel.html': 'Profilage Criminel',
    'engagement/objectifs-developpement-durable.html': 'Objectifs de Développement Durable',
    'engagement/rse-happy-art.html': 'Happy Art — RSE/QVT',
    'engagement/ambassadeurs-paix-fraternite.html': 'Ambassadeurs de la Paix',
    'inclusive/sport-etudes.html': 'Sport-Études',
    'inclusive/roll-ball-hommes.html': 'Roll Ball Hommes',
    'inclusive/roll-ball-femmes.html': 'Roll Ball Femmes',
    'inclusive/roll-ball-enfants.html': 'Roll Ball Enfants',
    'inclusive/roll-ball-handi.html': 'Handi Roll Ball',
    'formations/parcours-etudiant.html': 'Parcours étudiant complet',
  };

  // Points awarded to each page per answer value.
  const SCORING = {
    q1: {
      bienetre: { 'programmes/art-de-la-paix.html': 2, 'programmes/mystere-sacre-des-epices.html': 2, 'programmes/grounding-respiration-consciente.html': 2 },
      leadership: { 'programmes/art-de-limpact.html': 2, 'engagement/objectifs-developpement-durable.html': 2, 'engagement/rse-happy-art.html': 1 },
      art: { 'programmes/musicotherapie.html': 2, 'programmes/maquillage-fx.html': 2, 'programmes/rap-ivoire-therapie.html': 1 },
      sport: { 'inclusive/sport-etudes.html': 2, 'inclusive/roll-ball-hommes.html': 1, 'inclusive/roll-ball-femmes.html': 1 },
    },
    q2: {
      accompagner: { 'programmes/sexotherapie.html': 2, 'programmes/art-de-la-paix.html': 1, 'programmes/profilage-criminel.html': 1 },
      transformer: { 'engagement/objectifs-developpement-durable.html': 2, 'programmes/art-de-limpact.html': 1, 'engagement/ambassadeurs-paix-fraternite.html': 1 },
      creer: { 'programmes/therapie-par-lart-adultes.html': 2, 'programmes/therapie-par-lart-enfants.html': 1, 'programmes/musicotherapie.html': 1 },
      performer: { 'inclusive/sport-etudes.html': 2, 'inclusive/roll-ball-handi.html': 1 },
    },
    q3: {
      court: { 'programmes/mystere-sacre-des-epices.html': 1, 'programmes/grounding-respiration-consciente.html': 1, 'programmes/maquillage-fx.html': 1 },
      complet: { 'formations/parcours-etudiant.html': 2, 'engagement/rse-happy-art.html': 1 },
    },
    q4: {
      moi: { 'programmes/art-de-la-paix.html': 1, 'programmes/grounding-respiration-consciente.html': 1 },
      enfants: { 'programmes/therapie-par-lart-enfants.html': 2, 'inclusive/roll-ball-enfants.html': 2 },
      institution: { 'engagement/rse-happy-art.html': 2, 'engagement/objectifs-developpement-durable.html': 1 },
      handicap: { 'inclusive/roll-ball-handi.html': 2, 'inclusive/sport-etudes.html': 1 },
    },
  };

  const steps = Array.from(document.querySelectorAll('.quiz-step'));
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const errorMsg = document.getElementById('quiz-error');
  const progressDots = Array.from(document.querySelectorAll('[data-step-dot]'));
  const resultBox = document.getElementById('quiz-result');
  const resultCards = document.getElementById('quiz-result-cards');
  const restartBtn = document.getElementById('quiz-restart');

  let current = 0;

  function updateProgress() {
    progressDots.forEach((dot, i) => {
      dot.classList.toggle('now', i <= current);
      dot.classList.toggle('soon', i > current);
    });
  }

  function showStep(index) {
    steps.forEach((step, i) => { step.hidden = i !== index; });
    prevBtn.hidden = index === 0;
    nextBtn.textContent = index === steps.length - 1 ? 'Voir mes recommandations' : 'Suivant';
    errorMsg.hidden = true;
    updateProgress();
  }

  function currentStepAnswered() {
    const inputs = steps[current].querySelectorAll('input[type="radio"]');
    return Array.from(inputs).some(i => i.checked);
  }

  nextBtn.addEventListener('click', () => {
    if (!currentStepAnswered()) {
      errorMsg.hidden = false;
      return;
    }
    if (current < steps.length - 1) {
      current++;
      showStep(current);
    } else {
      showResults();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      showStep(current);
    }
  });

  function showResults() {
    const scores = {};
    for (const [name, options] of Object.entries(SCORING)) {
      const selected = form.querySelector(`input[name="${name}"]:checked`);
      if (!selected) continue;
      const pagePoints = options[selected.value] || {};
      for (const [page, points] of Object.entries(pagePoints)) {
        scores[page] = (scores[page] || 0) + points;
      }
    }
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);

    resultCards.innerHTML = ranked.map(([page]) => `
      <article class="formation-card">
        <div class="formation-card-body">
          <h4>${PAGE_TITLES[page] || page}</h4>
        </div>
        <div class="formation-card-footer">
          <a href="../${page}" class="btn btn-primary btn-sm">Découvrir</a>
        </div>
      </article>
    `).join('');

    form.hidden = true;
    document.getElementById('quiz-progress').hidden = true;
    resultBox.hidden = false;
  }

  restartBtn.addEventListener('click', () => {
    form.reset();
    current = 0;
    showStep(current);
    form.hidden = false;
    document.getElementById('quiz-progress').hidden = false;
    resultBox.hidden = true;
  });

  showStep(0);
});
