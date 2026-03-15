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
  const _rc = document.getElementById('radar-canvas');
  DTE.radar = _rc ? new RadarChart(_rc) : null;
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

      if (DTE.radar && DTE.radar._ctx) {
        const raw  = state.raw;
        const norm = state.norm;
        const m1   = raw && raw.m1;
        const D    = DTE.engine.getDefaults ? DTE.engine.getDefaults() : {};

        // Axes de CONFORMITÉ LÉGALE réels (Code du travail FR)
        // Chaque axe = % de conformité (100 = parfait, 0 = violation)

        // 1. Heures hebdo vs max 48h (Art. L3121-20)
        const weeklyH = (norm && norm._recentWeeklyH) || 35;
        const confHebdo = Math.max(0, Math.min(100, Math.round((1 - Math.max(0, weeklyH - 35) / 13) * 100)));

        // 2. Repos quotidien 11h (Art. L3131-1) — si >10h/j → risque
        const dailyH = (norm && norm._avgH7) || 7;
        const confRepos = Math.max(0, Math.min(100, dailyH <= 9 ? 100 : dailyH <= 10 ? 70 : 30));

        // 3. Contingent HS 220h/an (Art. L3121-33)
        const contingPct = (norm && norm._contingentPct) || 0;
        const confCont = Math.max(0, Math.min(100, Math.round((1 - contingPct / 100) * 100)));

        // 4. Jours consécutifs (repos hebdo 35h Art. L3132-1) — max 6j
        const consec = (norm && norm._consec) || 0;
        const confConsec = Math.max(0, Math.min(100, consec <= 5 ? 100 : consec <= 6 ? 60 : 20));

        // 5. HS journalière — limite 3h/j recommandée INRS
        const extraDay = (norm && norm._avgExtra7) || 0;
        const confHS = Math.max(0, Math.min(100, extraDay <= 1 ? 100 : extraDay <= 2 ? 75 : extraDay <= 3 ? 50 : 20));

        // 6. Récupération — capacité à récupérer (base santé)
        const s = state.scores;
        const confRecup = Math.max(0, Math.min(100, s.recovery || (state.scores._hasData ? 70 : 100)));

        DTE.radar.render([
          { label:'Hebdo',   value: confHebdo,  max:100, warn:70, legal:'≤48h/sem' },
          { label:'Repos/j', value: confRepos,  max:100, warn:70, legal:'11h min' },
          { label:'Contingent', value: confCont, max:100, warn:50, legal:'220h/an' },
          { label:'Jours cons.', value: confConsec, max:100, warn:60, legal:'≤6j' },
          { label:'HS/jour', value: confHS,     max:100, warn:70, legal:'≤3h/j' },
          { label:'Récup.',  value: confRecup,  max:100, warn:40, legal:'INRS' },
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
    const state  = DTE._state;
    const norm   = state && state.norm;
    const weekH  = (norm && norm._recentWeeklyH) || 35;
    const cumW   = (norm && norm._cumulWeeks) || 0;

    // ─ FATIGUE ─────────────────────────────────────────────────────
    if (!scores._hasData) {
      advice.push({ type:'info', emoji:'📋',
        titre:'Aucune donnée disponible',
        message:'Saisissez vos heures dans M1 (Suivi annuel) pour activer l\'analyse.',
        source:'' });
    } else if (scores.fatigue >= 85) {
      advice.push({ type:'danger', emoji:'🔴',
        titre:'Épuisement critique — Phase 4',
        message:'Votre corps envoie des signaux d\'alarme. ' +
          (cumW >= 4 ? 'Après ' + cumW + ' semaines de surcharge, la récupération sera longue.' : 'Réduisez vos heures immédiatement.') +
          ' Le sens que vous donnez à votre travail peut atténuer la perception, mais pas les risques biologiques réels.',
        source:'OMS/OIT 2021 · INRS · HAS 2017 · Art. L4121-1 Code du travail' });
    } else if (scores.fatigue >= 60) {
      advice.push({ type:'warning', emoji:'🟠',
        titre:'Fatigue chronique — Phase 3',
        message:'À ' + weekH.toFixed(0) + 'h/sem sur ' + (cumW||1) + ' semaine(s), la fatigue s\'accumule. ' +
          'Votre hygiène de vie (sport, alimentation, sommeil) peut réduire l\'impact de 20 à 30% selon les études INRS.',
        source:'J.Occup.Health 2021 · INRS · Sonnentag 2003' });
    } else if (scores.fatigue >= 35) {
      advice.push({ type:'warning', emoji:'🟡',
        titre:'Fatigue modérée — Phase 2',
        message:'Niveau gérable si vous récupérez bien le week-end. Si vous aimez votre travail et dormez ≥7h, ' +
          'vous pouvez maintenir ce rythme à court terme. Surveillez la durée.',
        source:'Thompson 2022 · Nature Hum.Behav. 2025 (Fan et al.)' });
    } else {
      advice.push({ type:'success', emoji:'🟢',
        titre:'Bonne forme — Phase 1',
        message:'Votre niveau de fatigue est faible. Continuez à vous hydrater, dormir 7-8h et prendre vos pauses. ' +
          'La prévention est le meilleur investissement.',
        source:'OMS — Zone optimale ≤40h/sem · INRS' });
    }

    // ─ HEURES HEBDO vs LÉGAL ────────────────────────────────────────
    if (weekH > 55) {
      advice.push({ type:'danger', emoji:'⚖️',
        titre:'Au-delà du seuil OMS (+35% risque AVC)',
        message: weekH.toFixed(0) + 'h/sem dépasse le seuil OMS 2021. ' +
          'Le risque cardiovasculaire augmente avec la durée d\'exposition. ' +
          'Parlez-en à votre médecin du travail.',
        source:'OMS/OIT 2021 — Pega F. et al., Env. International · Art. L4131-1' });
    } else if (weekH > 48) {
      advice.push({ type:'warning', emoji:'⚖️',
        titre:'Dépassement du maximum légal (48h)',
        message: weekH.toFixed(0) + 'h/sem dépasse la limite absolue (Art. L3121-20). ' +
          'Vérifiez votre accord collectif ou demandez un repos compensateur.',
        source:'Art. L3121-20 Code du travail · Art. L3121-33 (RCO)' });
    }

    // ─ RÉSILIENCE : facteurs humains ────────────────────────────────
    if (scores.fatigue >= 50 && scores.fatigue < 85) {
      advice.push({ type:'info', emoji:'💡',
        titre:'Note : vous n\'êtes pas une batterie',
        message:'Ces données sont des signaux statistiques basés sur des populations. ' +
          'Le sens que vous donnez à votre travail, votre activité physique et votre alimentation ' +
          'peuvent modifier significativement votre vécu. Mais la répétition sur plusieurs semaines finit par impacter tout le monde.',
        source:'Nature Hum.Behav. 2025 (Fan et al.) · ANACT — facteurs de protection' });
    }

    // ─ PERFORMANCE ──────────────────────────────────────────────────
    if (scores.performance < 50) {
      advice.push({ type:'info', emoji:'📉',
        titre:'Efficacité réduite',
        message:'Au-delà de 50h/sem, la productivité par heure chute (Stanford/Pencavel 2014). ' +
          'Les heures supplémentaires au-delà de 55h ne produisent rien de plus.',
        source:'Pencavel J. 2014 — Stanford University' });
    }

    // ─ RÉCUPÉRATION ─────────────────────────────────────────────────
    if (cumW >= 6) {
      advice.push({ type:'warning', emoji:'🛡️',
        titre:'Récupération longue après ' + cumW + ' semaines',
        message:'Plus la surcharge dure, plus le retour à la normale est lent. ' +
          '6 mois de surcharge réduisent la capacité de récupération de 45% (INRS).',
        source:'J.Occup.Health 2021 · INRS — fatigue cumulative' });
    }

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
    const sliderAdj = parseFloat(document.getElementById('timeline-hs')?.value || 0);
    const days      = parseInt(document.getElementById('timeline-days')?.value || 30);
    const norm      = state && state.norm;
    // hs = rythme actuel réel + ajustement slider
    const currentHs = (norm && norm._avgExtra7) || 0;
    const hs        = Math.max(0, currentHs + sliderAdj);

    // Mettre à jour le label pour montrer ce que ça représente
    const hsVal = document.getElementById('timeline-hs-val');
    if (hsVal) {
      const sign = sliderAdj > 0 ? '+' : '';
      hsVal.textContent = sliderAdj === 0
        ? 'Rythme actuel'
        : sign + sliderAdj + 'h/j vs actuel';
    }

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
    if (!wrap) return;

    if (!sim || !sim.timeline) {
      wrap.innerHTML = `<div style="padding:20px;text-align:center;font-family:var(--font-mono);font-size:12px;color:rgba(255,255,255,0.5);">
        📋 Saisissez vos heures dans M1 pour voir votre évolution prévue
      </div>`;
      return;
    }

    const tl  = sim.timeline;
    const s   = sim.summary;
    const ph  = s.finalPhase || { id:1, label:'ADAPTATION', color:'#00ffcc' };
    const c   = v => v >= 80 ? '#ff2244' : v >= 60 ? '#ff6600' : v >= 35 ? '#ffb300' : '#00ffcc';

    // Message principal en langage clair
    const fatFin  = s.finalFatigue || 0;
    const trendMsg = fatFin < 30 ? '📈 Vous allez bien. Continuez à ce rythme.'
                   : fatFin < 50 ? '⚠️ Fatigue qui s\'accumule progressivement.'
                   : fatFin < 70 ? '🔶 Surmenage probable. Réduire les HS conseillé.'
                   : '🔴 Risque élevé. Repos nécessaire urgemment.';
    const weekH = tl[0]?.weeklyHours || 35;
    const omsMsg = weekH >= 55 ? '⚠️ Au-delà de 55h/sem : +35% risque AVC (OMS 2021)'
                 : weekH >= 48 ? '→ Au-delà du maximum légal 48h/sem (Art. L3121-20)'
                 : weekH >= 40 ? '→ Zone de vigilance OCDE (>40h/sem)'
                 : '✓ Zone optimale OMS (≤40h/sem)';

    // Barres semaines (max 8)
    const weeks = Array.from({length:Math.min(8,Math.ceil(tl.length/7))},(_,w)=>{
      const wd  = tl.slice(w*7,(w+1)*7);
      const af  = Math.round(wd.reduce((s,d)=>s+d.fatigue,0)/wd.length);
      return { w:w+1, af, col:c(af), alert:wd.some(d=>d.alert!=='OK') };
    });

    wrap.innerHTML = `
      <!-- MESSAGE PRINCIPAL -->
      <div style="padding:12px 14px;background:rgba(0,10,25,.9);border-left:3px solid ${c(fatFin)};margin-bottom:8px;">
        <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;">${trendMsg}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);">
          Dans <b style="color:${c(fatFin)}">${days} jours</b> :
          Fatigue estimée <b style="color:${c(fatFin)}">${fatFin}%</b> —
          Phase <b style="color:${ph.color}">P${ph.id} ${ph.label}</b>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">${omsMsg}</div>
      </div>

      <!-- SEMAINES : barre simple avec explication -->
      <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:var(--font-mono);margin-bottom:6px;">
        ÉVOLUTION SEMAINE PAR SEMAINE (fatigue prévue)
      </div>
      <div style="display:flex;gap:4px;align-items:flex-end;height:60px;margin-bottom:4px;">
        ${weeks.map(w=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;">
            <div style="font-size:10px;font-weight:600;color:${w.col};">${w.af}%</div>
            <div style="width:100%;background:${w.col};height:${Math.max(4,w.af*0.44)}px;
              opacity:${w.alert?1:0.7};border-radius:1px;"></div>
            <div style="font-size:9px;color:rgba(255,255,255,0.5);">S${w.w}</div>
          </div>`).join('')}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">
        🟢 vert = OK · 🟡 orange = vigilance · 🔴 rouge = alerte
      </div>

      ${s.daysAlert > 0 ? `<div style="margin-top:8px;padding:8px 12px;background:rgba(255,179,0,0.1);border:1px solid rgba(255,179,0,0.3);font-size:11px;color:rgba(255,255,255,0.8);">
        ⚠️ <b>${s.daysAlert} jour(s)</b> en alerte prévus sur la période
      </div>` : ''}`;
  }

  function renderScenarios(days, state, scen) {
    const el = document.getElementById('scenarios-container');
    if (!el) return;
    if (!scen) {
      el.innerHTML = `<div style="padding:16px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">
        📋 Saisissez vos heures dans M1 pour comparer les scénarios
      </div>`; return;
    }
    const c = v => v >= 80 ? '#ff2244' : v >= 60 ? '#ff6600' : v >= 35 ? '#ffb300' : '#00ffcc';

    // Labels humains
    const humanDesc = {
      urgence:     { emoji:'🔥', what:'Si vous continuez + intensément', impact:'Fatigue maximale, sans bénéfice sur la prod.' },
      actuel:      { emoji:'▶️', what:'Si vous continuez comme aujourd\'hui', impact:'Projection de votre trajectoire actuelle.' },
      reduit:      { emoji:'⬇️', what:'Si vous réduisez un peu (-1h/j)', impact:'Récupération progressive, moins de stress.' },
      optimise:    { emoji:'⚡', what:'Si vous optimisez (-2h/j)', impact:'Zone productive OCDE, meilleur équilibre.' },
      equilibre:   { emoji:'⚖️', what:'Si vous repassez à 35h/sem', impact:'Zone optimale OMS. Productivité maximale.' },
      recuperation:{ emoji:'🛡️', what:'Si vous prenez du recul', impact:'Récupération physiologique INRS recommandée.' },
    };

    el.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1);">
        💡 <b>6 scénarios comparatifs</b> — Que se passe-t-il si vous changez de rythme ?
      </div>
      ${scen.scenarios.map((sc, i) => {
        const isBest = sc === scen.best;
        const hd    = humanDesc[sc.key] || { emoji:'▶', what:sc.label, impact:sc.desc };
        const ph    = sc.summary.finalPhase || { color:'#00ffcc', label:'OK' };
        const fat   = sc.summary.avgFatigue || 0;
        return `<div style="padding:10px 12px;background:rgba(0,10,25,.85);
          border:1px solid ${isBest?'rgba(0,200,255,0.5)':'rgba(255,255,255,0.08)'};
          border-left:3px solid ${isBest?'var(--animus)':c(fat)};
          margin-bottom:5px;${isBest?'box-shadow:0 0 12px rgba(0,200,255,0.15);':''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:13px;font-weight:600;color:#fff;">${hd.emoji} ${sc.label}</span>
            ${isBest ? '<span style="font-size:10px;color:var(--animus);border:1px solid var(--animus);padding:1px 7px;">✓ MEILLEURE OPTION</span>' : ''}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:4px;">${hd.what}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:8px;">${hd.impact}</div>
          <div style="display:flex;gap:12px;font-size:11px;">
            <span>Fatigue moy : <b style="color:${c(fat)}">${fat}%</b></span>
            <span>Performance : <b style="color:${c(100-sc.summary.avgPerformance)}">${sc.summary.avgPerformance}%</b></span>
            <span style="color:${ph.color}">Phase finale : P${ph.id}</span>
          </div>
          <div style="margin-top:5px;font-size:10px;color:rgba(255,255,255,0.35);">${sc.oms}</div>
        </div>`;
      }).join('')}`;
  }


  function renderFutur(days, state, fut) {
    const el = document.getElementById('futur-state-container');
    if (!el) return;
    if (!fut || !fut.fatigue) {
      el.innerHTML = `<div style="padding:16px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">
        📋 Complétez M1 pour voir votre état prédit dans ${days} jours
      </div>`; return;
    }
    const c  = v => v >= 80 ? '#ff2244' : v >= 60 ? '#ff6600' : v >= 35 ? '#ffb300' : '#00ffcc';
    const ph = fut.finalPhase || { id:1, label:'ADAPTATION', color:'#00ffcc', desc:'' };

    // Message humain selon la phase
    const msgs = {
      1: '😊 Bonne nouvelle : vous restez en forme sur cette période.',
      2: '⚠️ Attention : la fatigue s\'accumule. Pensez à récupérer.',
      3: '🔶 Surmenage probable. Vos performances vont baisser.',
      4: '🔴 Risque élevé de burn-out. Consultez votre médecin du travail.'
    };
    const advice = {
      1: 'Maintenez ce rythme. Profitez des week-ends.',
      2: 'Réduisez de 1h par jour. Dormez 8h minimum.',
      3: 'Prenez du repos compensateur. Parlez-en à votre employeur.',
      4: 'Activez votre droit au repos. Art. L4121-1 Code du travail.'
    };

    el.innerHTML = `
      <!-- MESSAGE PRINCIPAL -->
      <div style="padding:14px;background:rgba(0,10,25,.9);border-left:3px solid ${ph.color};margin-bottom:10px;">
        <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:6px;">${msgs[ph.id]||msgs[1]}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.6;">${ph.desc}</div>
        <div style="margin-top:8px;padding:6px 10px;background:rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.8);">
          💡 ${advice[ph.id]||advice[1]}
        </div>
      </div>

      <!-- 4 CHIFFRES CLÉS EXPLIQUÉS -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
        ${[
          ['Fatigue', fut.fatigue, 'Votre niveau d\'épuisement prévu', true],
          ['Performance', fut.performance, 'Votre efficacité au travail', false],
          ['Stress', fut.stress, 'Niveau de cortisol (tension)', true],
          ['Risque cardio', fut.cvRisk, 'Basé sur OMS 2021', true],
        ].map(([l,v,desc,bad])=>`
          <div style="padding:10px 12px;background:rgba(0,10,25,.8);border:1px solid ${c(bad?v:100-v)}30;">
            <div style="font-size:20px;font-weight:700;color:${c(bad?v:100-v)};margin-bottom:2px;">${v}%</div>
            <div style="font-size:11px;font-weight:600;color:#fff;">${l}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px;">${desc}</div>
          </div>`).join('')}
      </div>

      <!-- RISQUE OMS SI ÉLEVÉ -->
      ${fut.omsRisk && fut.omsRisk.level !== 'NOMINAL' ? `
      <div style="padding:8px 12px;background:rgba(${fut.omsRisk.level==='ÉLEVÉ'?'255,34,68':'255,102,0'},.1);
        border:1px solid rgba(${fut.omsRisk.level==='ÉLEVÉ'?'255,34,68':'255,102,0'},.3);
        font-size:11px;color:rgba(255,255,255,0.8);margin-bottom:6px;">
        📊 ${fut.omsRisk.txt}
      </div>` : ''}

      <div style="font-size:10px;color:rgba(255,255,255,0.35);padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);">
        Sources : OMS/OIT 2021 · Lancet 2021 · OEM 2025 · Stanford 2014 · INRS/ANACT
      </div>`;
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

  // ── LIVE SYNC — re-analyse toutes les 3s
  let _syncHash = '';
  setInterval(() => {
    try {
      // Hash rapide des données M1 pour détecter un vrai changement
      const yr   = localStorage.getItem('ACTIVE_YEAR_SUFFIX') || '';
      const m1raw = localStorage.getItem('DATA_REPORT_' + yr) || '';
      const m2raw = localStorage.getItem('CA_HS_TRACKER_V1_DATA_' + yr) || '';
      const hash  = m1raw.length + '|' + m2raw.length + '|' + yr;
      if (hash === _syncHash) return; // rien changé → pas de re-analyse
      _syncHash = hash;

      const s = DTE.engine.analyze();
      DTE._state = s;

      // Mettre à jour TOUT : dashboard + twin + footer
      DTE.dashboard.render(s);
      if (DTE.twin) DTE.twin.update(s.scores);

      // Mettre à jour la vue active si prédictions/simulation
      const activeView = document.querySelector('.view:not(.hidden)');
      if (activeView) {
        const vid = activeView.id;
        if (vid === 'view-predictions') renderPredictions(s);
        if (vid === 'view-whatif' && DTE.whatif) DTE.whatif.render();
        if (vid === 'view-heatmap' && DTE.heatmap) DTE.heatmap.render(s);
      }

      // Mettre à jour le footer
      const el = id => document.getElementById(id);
      if(el('footer-year'))    el('footer-year').textContent    = 'ANNÉE ' + (s.raw && s.raw.year || '');
      if(el('footer-time'))    el('footer-time').textContent    = 'ANALYSE : ' + new Date().toTimeString().slice(0,5);
      if(el('footer-status'))  el('footer-status').textContent  = s.scores._hasData ? '■ SYNCHRONISÉ' : '○ EN ATTENTE';
    } catch(_) {}
  }, 3000);

  // Exposer le forçage de sync (bouton visible)
  window._forcSync = () => {
    try {
      _syncHash = ''; // forcer la re-analyse
      const s = DTE.engine.analyze();
      DTE._state = s;
      DTE.dashboard.render(s);
      if (DTE.twin) DTE.twin.update(s.scores);
      const activeView = document.querySelector('.view:not(.hidden)');
      if (activeView) {
        const vid = activeView.id;
        if (vid === 'view-predictions') renderPredictions(s);
      }
      // Feedback visuel
      const btn = document.getElementById('btn-sync-visible');
      if (btn) {
        btn.style.background = 'rgba(0,255,204,0.3)';
        btn.innerHTML = '<span style="font-size:14px;">✓</span> SYNCHRONISÉ';
        setTimeout(() => {
          btn.style.background = 'rgba(0,255,204,0.12)';
          btn.innerHTML = '<span style="font-size:14px;">↻</span> SYNC';
        }, 1500);
      }
    } catch(e) { console.warn('sync error', e); }
  };

  // Aussi câbler btn-refresh
  document.getElementById('btn-refresh')?.addEventListener('click', window._forcSync);
});
