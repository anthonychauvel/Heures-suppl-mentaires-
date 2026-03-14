/**
 * APP.JS — Digital Twin Engine — Orchestrateur principal
 */
window.DTE = window.DTE || {};

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ── 1. Instanciation ────────────────────────────────────────── */
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
  DTE.checkin     = new Checkin();
  DTE.ai          = new AIAdvisor();
  DTE.pdf         = new PDFReport();
  DTE.notifs      = new Notifications();
  DTE.notifications = DTE.notifs;
  if (typeof ScenarioAdvisor !== 'undefined') DTE.scenarioAdvisor = new ScenarioAdvisor();
  if (typeof GlossaryUI !== 'undefined') DTE.glossary = new GlossaryUI();

  /* ── 2. Analyse ──────────────────────────────────────────────── */
  function runAnalysis() {
    try {
      const state  = DTE.engine.analyze();
      DTE.learning.autoAdapt();
      const risks  = DTE.risks.detect(state.scores, state.norm);
      const advice = buildAdvice(state.scores, risks);
      DTE.lastRisks  = risks;
      DTE.lastAdvice = advice;
      DTE._state     = state;

      DTE.dashboard.render(state, risks, advice);
      DTE.twin.update(state.scores);

      if (DTE.radar) {
        const s = state.scores;
        DTE.radar.render([
          { label:'Fatigue',  value: 100-(s.fatigue||0),   max:100, warn:40 },
          { label:'Stress',   value: 100-(s.stress||0),    max:100, warn:40 },
          { label:'Perf.',    value: s.performance||0,     max:100, warn:30 },
          { label:'Récup.',   value: s.recovery||0,        max:100, warn:30 },
          { label:'Cardio',   value: 100-(s.cvRisk||0),    max:100, warn:40 },
          { label:'Cognitif', value: 100-(s.cogRisk||0),   max:100, warn:40 },
        ]);
      }

      // Footer
      const yr = DTE.engine._year ? DTE.engine._year() : new Date().getFullYear();
      const el = id => document.getElementById(id);
      if (el('footer-year'))       el('footer-year').textContent       = 'ANNÉE ' + yr;
      if (el('footer-timestamp'))  el('footer-timestamp').textContent  = 'ANALYSE : ' + new Date().toLocaleTimeString('fr-FR');
      if (el('footer-contingent')) el('footer-contingent').textContent = 'CONTINGENT : ' + Math.round(state.norm._contingentPct || 0) + '/220H';
      const statusEl = el('footer-status');
      if (statusEl) {
        const f = state.scores.fatigue;
        statusEl.className = f >= 85 ? 'status-danger' : f >= 60 ? 'status-warn' : 'status-ok';
        statusEl.textContent = f >= 85 ? '■ CRITIQUE' : f >= 60 ? '■ ALERTE' : '■ SYNCHRONISÉ';
      }

      // Score global dans DTE.app
      if(!state.scores._hasData) {
        DTE.app = { scoreGlobal: null };
      } else {
        const dangers = risks.filter(r => r.level === 'CRITIQUE').length;
        const alertes = risks.filter(r => r.level !== 'CRITIQUE').length;
        const base = state.scores.performance || 50;
        DTE.app = { scoreGlobal: Math.max(0, Math.min(100, base - dangers * 15 - alertes * 5)) };
      }

      DTE.notifs.checkAndNotify(state, risks);
      DTE.checkin.checkIfNeeded();
      document.dispatchEvent(new CustomEvent('dte:analyzed', { detail: state }));
    } catch (err) {
      console.error('[DTE App] Analysis error:', err);
    }
  }

  /* ── 3. Conseils ─────────────────────────────────────────────── */
  function buildAdvice(scores, risks) {
    const advice = [];
    if (scores.fatigue >= 85)        advice.push({ type:'danger',  emoji:'🚨', title:'Fatigue critique', msg:'Réduisez vos heures immédiatement.' });
    else if (scores.fatigue >= 70)   advice.push({ type:'warning', emoji:'⚠️', title:'Fatigue élevée',   msg:'Limitez les heures supplémentaires cette semaine.' });
    else                             advice.push({ type:'success', emoji:'✓',  title:'Fatigue maîtrisée', msg:'Votre niveau de fatigue est dans les normes.' });
    if (scores.stress >= 70)         advice.push({ type:'warning', emoji:'😰', title:'Stress élevé',      msg:'Planifiez des pauses de récupération.' });
    if (scores.overloadRisk >= 70)   advice.push({ type:'danger',  emoji:'⚡', title:'Surcharge',         msg:'Vérifiez votre contingent HS annuel (Art. L3121-33).' });
    if (scores.performance < 45)     advice.push({ type:'info',    emoji:'📉', title:'Performance basse', msg:'Votre concentration est réduite — report des décisions importantes.' });
    if (scores.errorRisk >= 70)      advice.push({ type:'warning', emoji:'🔍', title:'Risque erreur',      msg:'Faites vérifier vos travaux importants par un collègue.' });
    if (advice.length === 0)         advice.push({ type:'success', emoji:'✅', title:'Situation saine',    msg:'Tous vos indicateurs sont dans les normes légales.' });
    return advice;
  }

  /* ── 4. Navigation ───────────────────────────────────────────── */
  let _predictionsInited = false;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const view = this.dataset.view;
      document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
      });
      const target = document.getElementById('view-' + view);
      if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
      if (view === 'predictions') { _predictionsInited = false; initPredictions(); }
      if (view === 'whatif')      initWhatIf();
      if (view === 'heatmap' && DTE.heatmap) DTE.heatmap.render(DTE._state);
    });
  });

  /* ── 5. Vue Prévisions ───────────────────────────────────────── */
  function initPredictions() {
    if (!DTE._state) { setTimeout(initPredictions, 300); return; }
    const state = DTE._state;
    const hsEl   = document.getElementById('timeline-hs');
    const daysEl = document.getElementById('timeline-days');
    if (hsEl)   { hsEl.oninput   = e => { document.getElementById('timeline-hs-val').textContent = parseFloat(e.target.value)+'H'; renderPredictions(state); }; }
    if (daysEl) { daysEl.onchange = () => renderPredictions(state); }
    renderPredictions(state);
  }

  function renderPredictions(state) {
    const hs   = parseFloat(document.getElementById('timeline-hs')?.value   || 0);
    const days = parseInt(document.getElementById('timeline-days')?.value || 30);
    let sim = null, fut = null, scen = null;
    try { sim  = DTE.simulator.run({ days, hoursPerDay: hs, restDays: [0] }, state.scores); } catch(e) {}
    try { fut  = DTE.simulator.futurState(days, state.norm); } catch(e) {}
    try { scen = DTE.simulator.scenarios(days, state.norm); } catch(e) {}
    renderTimeline(sim, days);
    renderScenarios(days, state, scen);
    renderFutur(days, state, fut);
  }

  function renderTimeline(sim, days) {
    const wrap = document.getElementById('timeline-canvas')?.parentElement;
    if (!wrap || !sim) return;
    const tl = sim.timeline;
    const c = v => v >= 80 ? '#ff2244' : v >= 60 ? '#ff6600' : v >= 35 ? '#ffb300' : '#00ffcc';
    const milestones = [7, 14, 30, 60, 90].filter(d => d <= days);
    if (!milestones.includes(days)) milestones.push(days);
    const phases = DTE.simulator.getPhases ? DTE.simulator.getPhases() : [];
    const phaseChanges = [];
    let lastP = tl[0]?.phase;
    tl.forEach((d, i) => {
      if (d.phase !== lastP) { phaseChanges.push({ day:i+1, to:d.phase, color:d.phaseColor, label:d.phaseLabel }); lastP = d.phase; }
    });

    wrap.innerHTML = `
      <div style="padding:8px 0 4px;">
        <div style="position:relative;height:3px;background:rgba(0,200,255,0.1);margin:0 16px;">
          <div id="tl-progress" style="position:absolute;left:0;top:0;height:100%;width:0%;background:linear-gradient(90deg,var(--animus),var(--sync));box-shadow:var(--glow-a);transition:width 1.2s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin:0 8px;margin-top:-5px;">
          ${milestones.map(d => {
            const idx = Math.min(d-1, tl.length-1);
            const f = tl[idx]?.fatigue || 0;
            const col = c(f);
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
              <div style="width:12px;height:12px;border:2px solid ${col};transform:rotate(45deg);background:rgba(0,6,15,.9);${f>=80?'animation:zone-crit-pulse 1.2s ease-in-out infinite;':''}box-shadow:0 0 6px ${col}50;"></div>
              <div style="font-family:var(--font-mono);font-size:8px;color:${col};">J+${d}</div>
              <div style="font-family:var(--font-hud);font-size:14px;font-weight:700;color:${col};">${f}</div>
              <div style="font-size:7px;color:var(--text-muted);">fat.</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      ${phaseChanges.length ? `
      <div style="margin:4px 0;padding:5px 8px;background:rgba(0,10,25,0.6);border:1px solid rgba(0,200,255,0.06);">
        <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);letter-spacing:.12em;margin-bottom:4px;">⟳ TRANSITIONS PRÉVUES</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${phaseChanges.map(p => `<span style="font-family:var(--font-mono);font-size:8px;border:1px solid ${p.color}50;padding:2px 7px;color:${p.color};">J+${p.day} → ${p.label}</span>`).join('')}
        </div>
      </div>` : ''}
      <div style="margin-top:6px;">
        <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);letter-spacing:.12em;margin-bottom:4px;">ÉVOLUTION SEMAINE PAR SEMAINE</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(36px,1fr));gap:2px;">
          ${Array.from({length:Math.ceil(tl.length/7)},(_,w)=>{
            const wd = tl.slice(w*7,(w+1)*7);
            const af = Math.round(wd.reduce((s,d)=>s+d.fatigue,0)/wd.length);
            const as_ = Math.round(wd.reduce((s,d)=>s+d.stress,0)/wd.length);
            const col2 = c(af);
            const alert = wd.some(d=>d.alert!=='OK');
            return `<div style="background:rgba(0,10,25,.9);border:1px solid ${alert?col2+'60':'rgba(0,200,255,0.07)'};padding:3px;text-align:center;">
              <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);">S${w+1}</div>
              <div style="height:24px;display:flex;align-items:flex-end;gap:1px;justify-content:center;margin:2px 0;">
                <div style="width:6px;background:${col2};height:${Math.max(2,af*.24)}px;"></div>
                <div style="width:6px;background:var(--amber);height:${Math.max(2,as_*.24)}px;opacity:.7;"></div>
              </div>
              <div style="font-family:var(--font-hud);font-size:9px;color:${col2};">${af}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:var(--gap);margin-top:4px;font-family:var(--font-mono);font-size:7px;color:var(--text-muted);">
          <span>■ FATIGUE</span><span style="color:var(--amber);">■ STRESS</span>
        </div>
      </div>`;
    setTimeout(()=>{const p=document.getElementById('tl-progress');if(p)p.style.width='100%';},80);
  }

  function renderScenarios(days, state, scen) {
    const el = document.getElementById('scenarios-container');
    if (!el) return;
    const advisor = DTE.scenarioAdvisor;
    const topAdvice = advisor ? advisor.match(state, 2) : [];
    const c = v => v>=80?'#ff2244':v>=60?'#ff6600':v>=35?'#ffb300':'#00ffcc';
    if (!scen) { el.innerHTML=`<div style="color:var(--text-muted);font-size:10px;font-family:var(--font-mono);padding:var(--gap);">Saisissez vos heures dans M1 pour activer les scénarios.</div>`; return; }
    el.innerHTML = scen.scenarios.map(sc => {
      const isBest = sc===scen.best;
      const ph = sc.summary.finalPhase||{id:1,label:'ADAPT.',color:'#00ffcc'};
      return `<div style="background:rgba(0,10,25,.85);border:1px solid ${isBest?'var(--animus)':'rgba(0,200,255,0.1)'};${isBest?'box-shadow:0 0 14px rgba(0,200,255,0.18);':''}margin-bottom:3px;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-bottom:1px solid rgba(0,200,255,0.07);${isBest?'background:rgba(0,200,255,0.05);':''}">
          <span style="font-family:var(--font-hud);font-size:11px;color:${isBest?'var(--animus)':'var(--text)'};">${sc.emoji} ${sc.label}</span>
          ${isBest?'<span style="font-family:var(--font-mono);font-size:7px;color:var(--animus);border:1px solid var(--animus);padding:1px 5px;">✓ OPTIMAL</span>':''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);">
          ${[['FAT.MOY',sc.summary.avgFatigue,c(sc.summary.avgFatigue)],['PIC',sc.summary.maxFatigue,c(sc.summary.maxFatigue)],['PERF',sc.summary.avgPerformance,c(100-sc.summary.avgPerformance)],['P'+ph.id,ph.label.slice(0,5),ph.color]].map(([l,v,col])=>`
            <div style="text-align:center;padding:4px;border-right:1px solid rgba(0,200,255,0.05);">
              <div style="font-family:var(--font-hud);font-size:${typeof v==='number'?'14':'10'}px;font-weight:700;color:${col};">${v}</div>
              <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);">${l}</div>
            </div>`).join('')}
        </div>
        <div style="padding:3px 8px;font-family:var(--font-mono);font-size:7px;color:var(--text-muted);">${sc.oms}</div>
      </div>`;
    }).join('')+(topAdvice.length?`
      <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(0,200,255,0.1);">
        <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);letter-spacing:.12em;margin-bottom:4px;">▶ CONSEILS ADAPTÉS</div>
        ${topAdvice.map(a=>`<div style="background:rgba(0,10,25,.8);border-left:2px solid var(--animus);padding:4px 8px;margin-bottom:3px;">
          <div style="font-family:var(--font-hud);font-size:10px;color:var(--text);">${a.titre}</div>
          <div style="font-size:9px;color:var(--text-dim);">${a.message.substring(0,80)}…</div>
        </div>`).join('')}
      </div>`:'');
  }

  function renderFutur(days, state, fut) {
    const el = document.getElementById('futur-state-container');
    if (!el) return;
    if (!fut) { el.innerHTML=`<div style="color:var(--text-muted);font-size:10px;font-family:var(--font-mono);">Données M1 insuffisantes.</div>`; return; }
    const c = v=>v>=80?'var(--red)':v>=60?'var(--orange)':v>=35?'var(--amber)':'var(--sync)';
    const ph = fut.finalPhase||{id:1,label:'ADAPTATION',color:'#00ffcc',desc:'',symptoms:[]};
    const h = days||30;
    el.innerHTML=`
      <div style="border:1px solid ${fut.omsRisk.color};border-left:3px solid ${fut.omsRisk.color};padding:6px 9px;margin-bottom:4px;background:rgba(0,10,25,.7);">
        <div style="font-family:var(--font-mono);font-size:7px;letter-spacing:.1em;color:${fut.omsRisk.color};margin-bottom:2px;">■ RISQUE OMS — ${fut.omsRisk.level}</div>
        <div style="font-size:9px;color:var(--text-dim);">${fut.omsRisk.txt}</div>
      </div>
      ${fut.brainRisk?`<div style="border:1px solid ${fut.brainRisk.color};border-left:3px solid ${fut.brainRisk.color};padding:6px 9px;margin-bottom:4px;background:rgba(0,10,25,.7);">
        <div style="font-family:var(--font-mono);font-size:7px;color:${fut.brainRisk.color};margin-bottom:2px;">■ RISQUE CÉRÉBRAL — OEM 2025</div>
        <div style="font-size:9px;color:var(--text-dim);">${fut.brainRisk.txt}</div>
      </div>`:''}
      <div style="border:1px solid ${ph.color}50;padding:7px 9px;margin-bottom:4px;background:rgba(0,10,25,.7);">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:3px;">
          <div style="width:20px;height:20px;border:2px solid ${ph.color};transform:rotate(45deg);background:${ph.color}20;flex-shrink:0;"></div>
          <span style="font-family:var(--font-hud);font-size:12px;color:${ph.color};">P${ph.id} — ${ph.label}</span>
        </div>
        <div style="font-size:9px;color:var(--text-dim);margin-bottom:4px;">${ph.desc}</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;">
          ${(ph.symptoms||[]).slice(0,3).map(s=>`<span style="font-family:var(--font-mono);font-size:7px;color:${ph.color};border:1px solid ${ph.color}40;padding:1px 4px;">${s}</span>`).join('')}
        </div>
      </div>
      <div class="futur-grid" style="margin-bottom:4px;">
        <div class="futur-item"><div class="futur-item-label">FAT J+${h}</div><div class="futur-item-val" style="color:${c(fut.fatigue)}">${fut.fatigue}</div></div>
        <div class="futur-item"><div class="futur-item-label">STR J+${h}</div><div class="futur-item-val" style="color:${c(fut.stress)}">${fut.stress}</div></div>
        <div class="futur-item"><div class="futur-item-label">PERF</div><div class="futur-item-val" style="color:${c(100-fut.performance)}">${fut.performance}</div></div>
        <div class="futur-item"><div class="futur-item-label">CARDIO</div><div class="futur-item-val" style="color:${c(fut.cvRisk)}">${fut.cvRisk}</div></div>
      </div>
      <div style="padding:5px 9px;background:rgba(0,255,204,.04);border:1px solid rgba(0,255,204,.15);margin-bottom:4px;">
        <div style="font-family:var(--font-mono);font-size:7px;color:var(--sync);margin-bottom:2px;">★ NATURE HUM.BEHAV. 2025 (Fan, Schor — 2 896 personnes, 6 pays)</div>
        <div style="font-size:9px;color:var(--text-dim);">−8h/sem maintient la productivité et réduit le burn-out de 8.8%. 90% des entreprises ont continué.</div>
      </div>
      <div style="font-family:var(--font-mono);font-size:7px;color:var(--text-muted);opacity:.5;">Sources : OMS 2021 · Lancet 2021 · OEM 2025 · Pencavel 2014 · Nature 2025 · INRS/ANACT</div>`;
  }

  function initWhatIf() {
    const container = document.getElementById('whatif-container');
    if (!container || DTE.whatif) return;
    const chartInstance = new TimelineChart(null);
    DTE.whatif = new WhatIfPanel(container, DTE.simulator, chartInstance);
    DTE.whatif.render();
  }

  /* ── 7. Header — boutons ─────────────────────────────────────── */
  function wireButtons() {
    // RETOUR
    document.getElementById('btn-back')?.addEventListener('click', () => {
      if (window.parent && window.parent !== window) {
        try {
          const ov = window.parent.document.getElementById('dte-overlay');
          if (ov) { ov.classList.remove('open'); window.parent.document.body.style.overflow = ''; return; }
        } catch(e) {}
      }
      if (window.history.length > 1) window.history.back();
      else window.close();
    });

    // SOURCES / GLOSSAIRE
    document.getElementById('btn-glossary')?.addEventListener('click', () => DTE.glossary?.open());

    // AIDE
    const helpModal = document.getElementById('help-modal');
    document.getElementById('btn-help')?.addEventListener('click', () => helpModal?.classList.remove('hidden'));
    document.getElementById('help-close')?.addEventListener('click', () => helpModal?.classList.add('hidden'));
    document.getElementById('help-ok')?.addEventListener('click',    () => helpModal?.classList.add('hidden'));
    helpModal?.querySelector('.modal-overlay')?.addEventListener('click', () => helpModal.classList.add('hidden'));

    // CHECK-IN
    document.getElementById('btn-checkin')?.addEventListener('click', () => DTE.checkin.open());

    // CONSEILLER
    document.getElementById('btn-ai')?.addEventListener('click', () => DTE.ai.open());

    // REFRESH
    document.getElementById('btn-refresh')?.addEventListener('click', () => {
      runAnalysis();
      DTE.notifs.show('Analyse actualisée', 'info', '↺');
    });

    // PDF
    document.getElementById('btn-pdf')?.addEventListener('click', () => {
      const state = DTE._state;
      const fut   = state ? DTE.simulator.futurState(30, state.norm) : null;
      DTE.pdf.generate(state, DTE.lastRisks||[], DTE.lastAdvice||[], fut);
    });
  }

  /* ── 8. Écran bienvenue (1ère visite) ────────────────────────── */
  function showWelcomeIfNeeded() {
    if (localStorage.getItem('DTE_WELCOMED')) return;
    const ov = document.createElement('div');
    ov.id = 'welcome-overlay';
    ov.innerHTML = `
      <div class="welcome-box">
        <div class="welcome-logo">DIGITAL TWIN</div>
        <div class="welcome-sub">MODULE 4 — ANALYSE PRÉDICTIVE</div>
        <div class="welcome-desc">
          Votre jumeau numérique analyse vos heures travaillées pour calculer votre état de santé et anticiper les risques légaux.
        </div>
        <div class="welcome-steps">
          <div class="welcome-step"><span class="welcome-step-num">1</span><span>Ce module lit automatiquement vos données de M1 (heures) et M2 (paie). Aucune saisie supplémentaire.</span></div>
          <div class="welcome-step"><span class="welcome-step-num">2</span><span>Il calcule votre fatigue, stress et performance, et prédit votre état dans 30 jours.</span></div>
          <div class="welcome-step"><span class="welcome-step-num">3</span><span>Simulez des scénarios, consultez 1000 conseils juridiques, exportez un rapport PDF.</span></div>
        </div>
        <button class="btn btn--animus" id="welcome-start" style="width:100%;justify-content:center;padding:12px;">
          &#9654;&nbsp; VOIR MON ANALYSE
        </button>
      </div>`;
    document.body.appendChild(ov);
    document.getElementById('welcome-start')?.addEventListener('click', () => {
      localStorage.setItem('DTE_WELCOMED', '1');
      ov.classList.add('hide');
      setTimeout(() => ov.remove(), 500);
    });
  }

  /* ── 9. Events ───────────────────────────────────────────────── */
  document.addEventListener('dte:checkin', () => {
    DTE.notifs.show('Check-in enregistré', 'info', '📋');
    runAnalysis();
  });

  /* ── Init ────────────────────────────────────────────────────── */
  wireButtons();
  runAnalysis();
  showWelcomeIfNeeded();

  // ── LIVE SYNC — re-analyse toutes les 5s (capter les changements M1/M2/M3)
  setInterval(() => {
    try {
      const s = DTE.engine.analyze();
      const changed = !DTE._state
        || s.scores._hasData !== DTE._state.scores._hasData
        || Math.abs((s.scores.fatigue||0)-(DTE._state.scores.fatigue||0)) >= 1
        || Math.abs((s.scores.performance||0)-(DTE._state.scores.performance||0)) >= 1;
      if (changed) { DTE._state = s; DTE.dashboard.render(s); }
    } catch(_) {}
  }, 5000);
});
