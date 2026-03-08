/**
 * APP.JS — Orchestrateur principal Digital Twin Engine
 * Init, routing, wiring événements, génération du rapport complet
 */

window.DTE = window.DTE || {};

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  /* ── 1. Instanciation ───────────────────────────────────────── */
  DTE.engine      = new DTEEngine();
  DTE.simulator   = new DTESimulator(DTE.engine);
  DTE.risks       = new DTERisks();
  DTE.learning    = new DTELearning(DTE.engine);
  DTE.dashboard   = new Dashboard();
  DTE.radar       = new RadarChart(document.getElementById('radar-canvas'));
  DTE.twin        = new TwinBody(
    document.getElementById('twin-body-container'),
    document.getElementById('twin-body-tooltip')
  );
  DTE.timeline    = new TimelineChart(document.getElementById('timeline-canvas'));
  DTE.heatmap     = new Heatmap(document.getElementById('heatmap-container'));
  DTE.whatifChart = new TimelineChart({getContext:()=>null, parentElement:{getBoundingClientRect:()=>({width:600})}, style:{}, width:600, height:240, onmousemove:null, onmouseleave:null});
  DTE.whatif      = null; // init lazily
  DTE.checkin     = new Checkin();
  DTE.ai          = new AIAdvisor();
  DTE.pdf         = new PDFReport();
  DTE.notifs      = new Notifications();
  DTE.notifications = DTE.notifs; // alias
  DTE.scenarioAdvisor = new ScenarioAdvisor();

  /* ── 2. Première analyse ────────────────────────────────────── */
  function runAnalysis() {
    try {
      const state = DTE.engine.analyze();
      DTE.learning.autoAdapt();
      const risks = DTE.risks.detect(state.scores, state.norm);
      const advice = buildAdvice(state.scores, risks);
      DTE.lastRisks  = risks;
      DTE.lastAdvice = advice;

      // Score global
      const dangers  = risks.filter(r => r.level === 'CRITIQUE').length;
      const alertes  = risks.filter(r => r.level !== 'CRITIQUE').length;
      DTE.app = { scoreGlobal: Math.max(0, Math.min(100, state.scores.performance - dangers * 15 - alertes * 5)) };

      // Render dashboard
      DTE.dashboard.render(state, risks, advice);

      // Twin body
      DTE.twin.render(state.scores);

      // Notifications proactives
      DTE.notifs.checkAndNotify(state, risks);

      // Check-in matinal
      DTE.checkin.checkIfNeeded();

      document.dispatchEvent(new CustomEvent('dte:analyzed', { detail: state }));
    } catch (err) {
      console.error('[DTE App] Analysis error:', err);
      DTE.notifs.show('Erreur d'analyse', 'warning', '⚠️', err.message);
    }
  }

  /* ── 3. Conseil / Advice ────────────────────────────────────── */
  function buildAdvice(scores, risks) {
    const advice = [];
    if (scores.fatigue < 40 && scores.stress < 40) {
      advice.push({ type:'success', emoji:'✅', titre:'Situation saine', message:'Votre rythme est bien équilibré. Continuez ainsi.' });
    }
    if (scores.recovery < 10) {
      advice.push({ type:'warning', emoji:'😴', titre:'Récupération insuffisante', message:'Taux de récupération très bas. Priorisez le repos ce week-end.' });
    }
    if (scores.performance < 60) {
      advice.push({ type:'warning', emoji:'📉', titre:'Performance dégradée', message:'Performance estimée à ' + scores.performance + '/100. La fatigue impacte votre efficacité.' });
    }
    // Meilleur scénario
    try {
      const scen = DTE.simulator.scenarios(14);
      if (scen && scen.best) {
        advice.push({ type:'info', emoji: scen.best.emoji, titre:'Scénario recommandé : ' + scen.best.label, message: scen.best.desc });
      }
    } catch (_) {}
    // Top 2 risques
    risks.slice(0, 2).forEach(r => {
      advice.push({
        type: r.level === 'CRITIQUE' ? 'danger' : 'warning',
        emoji: r.emoji,
        titre: r.titre,
        message: r.actions[0] || r.message
      });
    });
    return advice;
  }

  /* ── 4. Navigation ──────────────────────────────────────────── */
  function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const view = this.dataset.view;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.view').forEach(v => {
          v.classList.remove('active');
          v.classList.add('hidden');
        });
        const target = document.getElementById('view-' + view);
        if (target) {
          target.classList.remove('hidden');
          setTimeout(() => target.classList.add('active'), 10);
        }
        // Lazy init views
        if (view === 'predictions') initPredictions();
        if (view === 'whatif')      initWhatIf();
        if (view === 'heatmap')     initHeatmap();
      });
    });
  }

  /* ── 5. Vue Prédictions ─────────────────────────────────────── */
  function initPredictions() {
    const state = DTE.engine.getState();
    if (!state) return;
    // Default timeline
    const defaultSim = DTE.simulator.run({ days:30, hoursPerDay: state.norm._avgExtra7||0, restDays:[0] }, state.scores);
    const canvas = document.getElementById('timeline-canvas');
    if (canvas) {
      const w = canvas.parentElement.getBoundingClientRect().width || 600;
      canvas.width = w; canvas.height = 220;
      DTE.timeline._canvas = canvas;
      DTE.timeline._ctx = canvas.getContext('2d');
      DTE.timeline.render(defaultSim.timeline);
    }

    // Controls
    const hsRange = document.getElementById('timeline-hs');
    const daysSelect = document.getElementById('timeline-days');
    function updateTimeline() {
      const hs = parseFloat(hsRange?.value || 0);
      const days = parseInt(daysSelect?.value || 30);
      document.getElementById('timeline-hs-val').textContent = hs;
      const sim = DTE.simulator.run({ days, hoursPerDay: hs, restDays:[0] }, state.scores);
      const cv = document.getElementById('timeline-canvas');
      if (cv) {
        cv.width = cv.parentElement.getBoundingClientRect().width || 600;
        DTE.timeline._canvas = cv;
        DTE.timeline._ctx = cv.getContext('2d');
        DTE.timeline.render(sim.timeline);
      }
    }
    if (hsRange) hsRange.addEventListener('input', updateTimeline);
    if (daysSelect) daysSelect.addEventListener('change', updateTimeline);

    // Scénarios
    const scen = DTE.simulator.scenarios(14, state.norm);
    const scenEl = document.getElementById('scenarios-container');
    if (scenEl && scen) {
      scenEl.innerHTML = scen.scenarios.map(sc => `
        <div class="scenario-card ${sc.name === scen.best.name ? 'best' : ''}">
          <div class="scenario-top">
            <div class="scenario-name">${sc.emoji} ${sc.label}</div>
            <div class="scenario-score">Score : ${sc.quality}</div>
          </div>
          <div class="scenario-desc">${sc.desc}</div>
          <div class="scenario-stats">
            <span>Fatigue moy. : ${sc.summary.avgFatigue}%</span>
            <span>Performance : ${sc.summary.avgPerformance}%</span>
            <span>Alertes : ${sc.summary.daysAlert+sc.summary.daysCrit}j</span>
          </div>
        </div>`).join('');
    }

    // Futur state
    const fut = DTE.simulator.futurState(30, state.norm);
    const futEl = document.getElementById('futur-state-container');
    if (futEl && fut) {
      const c = v => v >= 75 ? 'var(--red)' : v >= 50 ? 'var(--amber)' : 'var(--green)';
      futEl.innerHTML = `
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-bottom:var(--gap);">
          Dans 30 jours (${fut.date})
        </div>
        <div class="futur-grid">
          <div class="futur-item"><div class="futur-item-label">FATIGUE</div><div class="futur-item-val" style="color:${c(fut.fatigue)}">${fut.fatigue}</div></div>
          <div class="futur-item"><div class="futur-item-label">STRESS</div><div class="futur-item-val" style="color:${c(fut.stress)}">${fut.stress}</div></div>
          <div class="futur-item"><div class="futur-item-label">PERFORMANCE</div><div class="futur-item-val" style="color:${c(100-fut.performance)}">${fut.performance}</div></div>
          <div class="futur-item"><div class="futur-item-label">JOURS ALERTE</div><div class="futur-item-val" style="color:${fut.alertDays.length>5?'var(--red)':'var(--green)'}">${fut.alertDays.length}</div></div>
        </div>
        ${fut.maxFatigueDay?`<div style="margin-top:var(--gap);font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Pic fatigue : ${fut.maxFatigueDay.date} — ${fut.maxFatigueDay.fatigue}%</div>`:''}`;
    }
  }

  /* ── 6. Vue What-If ─────────────────────────────────────────── */
  function initWhatIf() {
    const container = document.getElementById('whatif-container');
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    const fakeCanvas = { getContext: () => ({}) };
    DTE.whatif = new WhatIfPanel(container, DTE.simulator, DTE.timeline);
    DTE.whatif.render();
  }

  /* ── 7. Vue Heatmap ─────────────────────────────────────────── */
  function initHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    const state = DTE.engine.getState();
    if (state) DTE.heatmap.render(state.raw.m1.days, state.raw.year);
  }

  /* ── 8. Actions header ──────────────────────────────────────── */
  function setupActions() {
    document.getElementById('btn-checkin')?.addEventListener('click', () => DTE.checkin.open());
    document.getElementById('btn-ai')?.addEventListener('click',      () => DTE.ai.open());
    document.getElementById('btn-refresh')?.addEventListener('click', () => { runAnalysis(); DTE.notifs.show('Analyse actualisée','info','↺'); });
    document.getElementById('btn-pdf')?.addEventListener('click', () => {
      const state = DTE.engine.getState();
      const fut   = state ? DTE.simulator.futurState(30, state.norm) : null;
      DTE.pdf.generate(state, DTE.lastRisks||[], DTE.lastAdvice||[], fut);
    });
  }

  /* ── 9. Events ──────────────────────────────────────────────── */
  document.addEventListener('dte:checkin', e => {
    DTE.notifs.show('Données check-in intégrées','info','📋');
    runAnalysis();
  });

  /* ── 10. Radar legend ───────────────────────────────────────── */
  function addRadarLegend() {
    const panel = document.getElementById('panel-radar');
    if (panel && !panel.querySelector('.radar-legend')) {
      panel.insertAdjacentHTML('beforeend', '<div class="radar-legend" id="radar-legend"></div>');
    }
  }

  /* ── INIT ───────────────────────────────────────────────────── */
  addRadarLegend();
  setupNav();
  setupActions();
  runAnalysis();
});