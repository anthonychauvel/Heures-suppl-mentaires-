/**
 * Lifestyle — Questionnaire rythme de vie
 * Stockage : DTE_LIFESTYLE = { sport, nutrition, sleep_habits, social, sens, stress_extra, alcool, pause }
 * Impacts calibrés sur : INRS, ANACT, Nature 2025 (Fan), Thompson 2022, Sonnentag 2003
 */
(function(global){ 'use strict';

const QUESTIONS = [
  {
    id: 'sport',
    emoji: '🏃',
    titre: 'Activité physique',
    question: 'À quelle fréquence faites-vous de l\'activité physique ?',
    opts: [
      { v:0, e:'😴', l:'Jamais',            impact:'Récupération réduite de 25% (INRS)' },
      { v:1, e:'🚶', l:'1× par semaine',    impact:'Bénéfice limité' },
      { v:2, e:'🏃', l:'2-3× par semaine',  impact:'Optimal : cortisol −15%, récup +20%' },
      { v:3, e:'⚡', l:'4×+ par semaine',   impact:'Très actif : fatigue physique à surveiller' },
    ],
    source: 'INRS · OMS : 150min/sem recommandées · Sonnentag 2003',
  },
  {
    id: 'nutrition',
    emoji: '🥗',
    titre: 'Alimentation',
    question: 'Comment qualifieriez-vous votre alimentation ?',
    opts: [
      { v:0, e:'🍕', l:'Mal équilibrée',    impact:'+12% fatigue chronique (INRS)' },
      { v:1, e:'🥙', l:'Passable',          impact:'Léger impact sur récupération' },
      { v:2, e:'🥗', l:'Équilibrée',        impact:'Neutre — base saine' },
      { v:3, e:'🥦', l:'Très soignée',      impact:'Récupération +10%, cortisol −8%' },
    ],
    source: 'INRS — alimentation et fatigue au travail · ANACT 2022',
  },
  {
    id: 'sleep_quality',
    emoji: '😴',
    titre: 'Qualité du sommeil',
    question: 'Comment dormez-vous en général (hors ce matin) ?',
    opts: [
      { v:0, e:'😵', l:'Très mal (troubles)',   impact:'+20% fatigue, −18% perf (Thompson 2022)' },
      { v:1, e:'😞', l:'Mal (6h ou moins)',     impact:'+10% fatigue, −10% perf' },
      { v:2, e:'😐', l:'Correctement (7h)',     impact:'Base normale' },
      { v:3, e:'😊', l:'Très bien (8h+)',       impact:'Récupération optimale' },
    ],
    source: 'Thompson 2022 (Frontiers) · OMS : 7-9h adultes',
  },
  {
    id: 'sens',
    emoji: '🎯',
    titre: 'Sens au travail',
    question: 'Trouvez-vous du sens dans votre travail ?',
    opts: [
      { v:0, e:'😶', l:'Non, aucun sens',      impact:'Fatigue perçue ×1.4 (Nature 2025)' },
      { v:1, e:'😕', l:'Peu de sens',          impact:'Fatigue perçue légèrement amplifiée' },
      { v:2, e:'😐', l:'Moyennement',          impact:'Neutre' },
      { v:3, e:'🚀', l:'Oui, très motivant',   impact:'Fatigue perçue −40%, résil. ↑ (Nature 2025)' },
    ],
    source: 'Fan et al. Nature Hum.Behav. 2025 · Maslach Burnout Inventory',
  },
  {
    id: 'social',
    emoji: '👥',
    titre: 'Soutien social',
    question: 'Avez-vous un bon soutien (famille, amis, collègues) ?',
    opts: [
      { v:0, e:'😔', l:'Non, isolé(e)',        impact:'Stress ×1.3 — facteur aggravant (ANACT)' },
      { v:1, e:'🙁', l:'Peu de soutien',       impact:'Légère vulnérabilité au stress' },
      { v:2, e:'🙂', l:'Soutien correct',      impact:'Neutre' },
      { v:3, e:'🤝', l:'Très bien entouré(e)', impact:'Stress −20%, burnout −15% (ANACT RPS)' },
    ],
    source: 'ANACT — Risques psychosociaux 2022 · ANI Stress 2008',
  },
  {
    id: 'stress_extra',
    emoji: '⚡',
    titre: 'Stress extérieur',
    question: 'Avez-vous des sources de stress en dehors du travail ?',
    opts: [
      { v:0, e:'😌', l:'Non, vie calme',       impact:'Pas d\'amplification' },
      { v:1, e:'🙂', l:'Peu de stress',        impact:'Impact faible' },
      { v:2, e:'😟', l:'Stress modéré',        impact:'Cortisol +10% (ANACT)' },
      { v:3, e:'😱', l:'Stress intense',       impact:'Cortisol +25%, récup −20% (ANACT)' },
    ],
    source: 'ANACT RPS · Thompson 2022 · ANI Stress 2008',
  },
  {
    id: 'pauses',
    emoji: '☕',
    titre: 'Pauses au travail',
    question: 'Faites-vous des vraies pauses pendant la journée ?',
    opts: [
      { v:0, e:'💻', l:'Non, je travaille sans pause', impact:'Fatigue +15%, erreurs ×2 (INRS)' },
      { v:1, e:'🕐', l:'1 pause courte',               impact:'Insuffisant si >8h/j' },
      { v:2, e:'☕', l:'Pauses régulières',            impact:'Optimal — récupération normale' },
      { v:3, e:'🧘', l:'Pauses + déconnexion totale',  impact:'Récupération +18% (Sonnentag 2003)' },
    ],
    source: 'Sonnentag 2003 — Détachement psychologique · INRS 2021',
  },
  {
    id: 'ecrans_soir',
    emoji: '📱',
    titre: 'Écrans le soir',
    question: 'Utilisez-vous des écrans moins d\'1h avant de dormir ?',
    opts: [
      { v:0, e:'📱', l:'Oui, jusqu\'au coucher',  impact:'Sommeil dégradé (mélatonine −50%)' },
      { v:1, e:'💡', l:'Parfois',                 impact:'Impact modéré sur sommeil' },
      { v:2, e:'🌙', l:'Rarement',                impact:'Peu d\'impact' },
      { v:3, e:'✨', l:'Non, j\'arrête 1h avant', impact:'Sommeil +15% qualité (OMS)' },
    ],
    source: 'OMS — hygiène du sommeil · INRS 2021',
  },
];

class LifestylePanel {
  constructor() {
    this._modal = null;
    this._step  = 0;
    this._data  = this._load();
  }

  _load() {
    try { return JSON.parse(localStorage.getItem('DTE_LIFESTYLE') || '{}'); }
    catch(_) { return {}; }
  }

  _save(data) {
    localStorage.setItem('DTE_LIFESTYLE', JSON.stringify(data));
    this._data = data;
  }

  // Retourne les boosts calculés depuis les réponses lifestyle
  // Appelé depuis dte-engine.js pour modifier les scores
  static getBoosts() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem('DTE_LIFESTYLE') || '{}'); }
    catch(_) {}
    if (!Object.keys(d).length) return { fatigue:0, stress:0, performance:0, recovery:0, cvRisk:0 };

    const b = { fatigue:0, stress:0, performance:0, recovery:0, cvRisk:0 };

    // Sport (0=jamais → 3=très actif)
    if (d.sport !== undefined) {
      const s = d.sport / 3;  // 0-1
      b.fatigue    -= s * 0.08;   // sport réduit fatigue (INRS)
      b.recovery   += s * 0.10;   // meilleure récup
      b.stress     -= s * 0.06;   // cortisol réduit
      b.cvRisk     -= s * 0.05;   // cardio protection
      if (d.sport === 3) b.fatigue += 0.04;  // sur-entraînement possible
    }

    // Nutrition
    if (d.nutrition !== undefined) {
      const n = d.nutrition / 3;
      b.fatigue  -= n * 0.05;
      b.recovery += n * 0.06;
    }

    // Qualité du sommeil habituell (≠ check-in du jour)
    if (d.sleep_quality !== undefined) {
      const sl = (d.sleep_quality - 2) / 2;  // -1 à +1
      b.fatigue    -= sl * 0.12;   // Thompson 2022
      b.performance += sl * 0.10;
      b.recovery   += sl * 0.08;
    }

    // Sens au travail — Nature 2025 (Fan et al.)
    if (d.sens !== undefined) {
      const se = (d.sens - 1.5) / 1.5;  // -1 à +1
      b.fatigue    -= se * 0.15;  // perception fatigue réduite
      b.performance += se * 0.08;
      b.stress     -= se * 0.06;
    }

    // Soutien social
    if (d.social !== undefined) {
      const so = (d.social - 1) / 2;
      b.stress  -= so * 0.08;   // ANACT RPS
      b.recovery += so * 0.04;
    }

    // Stress extérieur
    if (d.stress_extra !== undefined) {
      b.stress  += (d.stress_extra / 3) * 0.15;   // ANACT
      b.recovery -= (d.stress_extra / 3) * 0.08;
    }

    // Pauses
    if (d.pauses !== undefined) {
      const p = d.pauses / 3;
      b.fatigue    -= p * 0.06;   // Sonnentag 2003
      b.performance += p * 0.07;
    }

    // Écrans le soir (inversé : 0=mauvais, 3=bon)
    if (d.ecrans_soir !== undefined) {
      const ec = d.ecrans_soir / 3;
      b.fatigue    -= ec * 0.05;
      b.recovery   += ec * 0.06;
    }

    // Clamp chaque boost
    for (const k of Object.keys(b)) {
      b[k] = Math.max(-0.30, Math.min(0.30, b[k]));
    }
    return b;
  }

  open() {
    if (!this._modal) {
      this._modal = document.createElement('div');
      this._modal.id = 'lifestyle-modal';
      this._modal.className = 'modal hidden';
      document.body.appendChild(this._modal);
    }
    this._step = 0;
    this._render();
    this._modal.classList.remove('hidden');
  }

  close() {
    this._modal?.classList.add('hidden');
  }

  _render() {
    const q   = QUESTIONS[this._step];
    const n   = QUESTIONS.length;
    const pct = Math.round((this._step / n) * 100);
    const val = this._data[q.id];

    this._modal.innerHTML = '<div class="modal-overlay"></div>'
      + '<div class="modal-box" style="max-width:480px;">'
      + '<div class="modal-header">'
      + '<h2 style="font-size:13px;letter-spacing:.06em;">🌿 RYTHME DE VIE — ' + (this._step+1) + ' / ' + n + '</h2>'
      + '<span class="modal-close" id="ls-close">✕</span>'
      + '</div>'

      + '<div style="height:3px;background:rgba(255,255,255,0.08);margin:0 -16px 16px;">'
      + '<div style="height:100%;width:' + pct + '%;background:var(--sync);transition:width .3s;"></div>'
      + '</div>'

      + '<div style="text-align:center;font-size:32px;margin-bottom:10px;">' + q.emoji + '</div>'
      + '<div style="font-size:15px;font-weight:600;color:#fff;text-align:center;margin-bottom:6px;">' + q.question + '</div>'
      + '<div style="font-size:10px;color:rgba(255,255,255,0.4);text-align:center;margin-bottom:16px;font-style:italic;">📚 ' + q.source + '</div>'

      + '<div style="display:flex;flex-direction:column;gap:8px;">'
      + q.opts.map(o => {
          const selected = val === o.v;
          return '<button data-val="' + o.v + '" style="display:flex;align-items:center;gap:12px;padding:11px 14px;'
            + 'background:rgba(0,10,25,' + (selected?'.95':'.75') + ');cursor:pointer;text-align:left;'
            + 'border:' + (selected?'2px solid rgba(0,255,204,0.7)':'1px solid rgba(255,255,255,0.1)') + ';">'
            + '<span style="font-size:22px;flex-shrink:0;">' + o.e + '</span>'
            + '<div style="flex:1;">'
            + '<div style="font-size:13px;color:#fff;">' + o.l + '</div>'
            + '<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">' + o.impact + '</div>'
            + '</div>'
            + (selected ? '<span style="color:var(--sync);font-size:16px;">✓</span>' : '')
            + '</button>';
        }).join('')
      + '</div>'

      + (this._step > 0 ? '<button id="ls-prev" style="margin-top:12px;font-size:11px;color:rgba(255,255,255,0.4);background:none;border:none;cursor:pointer;">← Précédent</button>' : '')
      + '</div>';

    // Un clic = réponse + avance
    this._modal.querySelectorAll('button[data-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._data[q.id] = parseInt(btn.dataset.val);
        setTimeout(() => {
          if (this._step < n - 1) { this._step++; this._render(); }
          else { this._submit(); }
        }, 200);
      });
    });

    this._modal.querySelector('.modal-overlay')?.addEventListener('click', () => this.close());
    document.getElementById('ls-close')?.addEventListener('click', () => this.close());
    document.getElementById('ls-prev')?.addEventListener('click', () => { this._step--; this._render(); });
  }

  _submit() {
    this._save(this._data);

    // Calcul du résumé des impacts
    const b = LifestylePanel.getBoosts();
    const fatImpact  = Math.round(b.fatigue  * 100);
    const perfImpact = Math.round(b.performance * 100);
    const strImpact  = Math.round(b.stress   * 100);
    const recImpact  = Math.round(b.recovery  * 100);

    const fmt = (v, inv) => {
      if (Math.abs(v) < 1) return '<span style="color:rgba(255,255,255,0.4)">= stable</span>';
      const good = inv ? v > 0 : v < 0;
      const col  = good ? '#00aa88' : '#c82838';
      const sign = v > 0 ? '+' : '';
      return '<span style="color:' + col + '">' + sign + v + '%</span>';
    };

    this._modal.innerHTML = '<div class="modal-overlay"></div>'
      + '<div class="modal-box" style="max-width:480px;">'
      + '<div class="modal-header">'
      + '<h2 style="font-size:13px;">🌿 RYTHME DE VIE — Enregistré</h2>'
      + '<span class="modal-close" id="ls-close2">✕</span>'
      + '</div>'

      + '<div style="text-align:center;font-size:40px;margin:16px 0 12px;">✅</div>'
      + '<div style="font-size:14px;font-weight:600;color:#fff;text-align:center;margin-bottom:6px;">Profil de vie enregistré</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,0.6);text-align:center;margin-bottom:16px;">Vos scores ont été ajustés selon votre rythme de vie.</div>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px;">'
      + [['Fatigue', fatImpact, true], ['Stress', strImpact, true], ['Performance', perfImpact, false], ['Récupération', recImpact, false]].map(([l, v, inv]) =>
          '<div style="padding:10px;background:rgba(0,10,25,.8);border:1px solid rgba(255,255,255,0.08);text-align:center;">'
          + '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px;">' + l + '</div>'
          + '<div style="font-size:18px;font-weight:700;">' + fmt(v, inv) + '</div>'
          + '</div>'
        ).join('')
      + '</div>'

      + '<div style="font-size:10px;color:rgba(255,255,255,0.35);padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);">'
      + '📚 Sources : INRS · ANACT RPS · Nature 2025 (Fan et al.) · Thompson 2022 · Sonnentag 2003 · OMS'
      + '</div>'

      + '<button id="ls-done" style="width:100%;margin-top:14px;padding:10px;background:rgba(0,255,204,0.1);border:1px solid rgba(0,255,204,0.3);color:var(--sync);font-family:var(--font-mono);font-size:12px;cursor:pointer;">FERMER ET METTRE À JOUR</button>'
      + '</div>';

    document.getElementById('ls-done')?.addEventListener('click', () => {
      this.close();
      // Mise à jour subtitle du bouton
      const sub = document.getElementById('lifestyle-sub');
      if (sub) sub.textContent = '✓ Profil enregistré — cliquer pour modifier';
      // Re-analyse complète
      if (window._fullSync) window._fullSync();
      else if (window._forcSync) window._forcSync();
    });
    document.getElementById('ls-close2')?.addEventListener('click', () => this.close());
    this._modal.querySelector('.modal-overlay')?.addEventListener('click', () => this.close());
  }

  // Retourne true si le profil existe
  static hasData() {
    try {
      const d = JSON.parse(localStorage.getItem('DTE_LIFESTYLE') || '{}');
      return Object.keys(d).length >= 4;
    } catch(_) { return false; }
  }
}

global.LifestylePanel = LifestylePanel;
}(typeof window !== 'undefined' ? window : global));
