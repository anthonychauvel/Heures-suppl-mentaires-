/**
 * Dashboard — Rendu principal du tableau de bord
 */
(function(global){
'use strict';

class Dashboard {
  constructor(){}

  render(state, risks, advice){
    // Pas de données M1 → bandeau info
    const noData = state && state.scores && !state.scores._hasData;
    const noDataBanner = document.getElementById('no-data-banner');
    if(noData){
      if(!noDataBanner){
        const b = document.createElement('div');
        b.id = 'no-data-banner';
        b.style.cssText = 'background:rgba(255,179,0,0.08);border:1px solid rgba(255,179,0,0.3);border-left:3px solid var(--amber);padding:8px 14px;margin-bottom:6px;font-family:var(--font-mono);font-size:10px;color:var(--amber);letter-spacing:.08em;';
        const m1ok = state.scores._hasM1, m2ok = state.scores._hasM2;
        const missing = [];
        if(!m1ok) missing.push('M1 (suivi des heures)');
        if(!m2ok) missing.push('M2 (données de paie)');
        b.innerHTML = '&#9888;&nbsp; DONNÉES MANQUANTES — Saisissez vos données dans : ' + missing.join(' et ') + ' pour activer l\'analyse complète';
        const grid = document.querySelector('.dashboard-grid');
        if(grid) grid.parentNode.insertBefore(b, grid);
      }
    } else {
      if(noDataBanner) noDataBanner.remove();
    }
    if(!state||!state.scores) return;
    const {scores, norm, raw}=state;
    this._renderHero(scores, norm, raw);
    this._renderScores(scores);
    this._renderRisks(risks||[]);
    this._renderAdvice(advice||[]);
    this._renderRadar(scores, norm);
    this._updateFooter(scores, norm, raw);
  }

  _renderHero(scores, norm, raw){
    const D=window.DTE&&window.DTE.engine?window.DTE.engine.getDefaults():{CONTINGENT_MAX:220,SEUIL_ALERTE:75};
    const el=document.getElementById('score-global-value');
    if(!el) return;
    const sg=window.DTE&&window.DTE.app?window.DTE.app.scoreGlobal:this._calcGlobal(scores);
    el.textContent=sg;
    const levelMap={EXCELLENT:'excellent',BON:'bon',MOYEN:'moyen',FAIBLE:'faible',CRITIQUE:'critique'};
    const level=sg>=80?'EXCELLENT':sg>=60?'BON':sg>=40?'MOYEN':sg>=20?'FAIBLE':'CRITIQUE';
    const lel=document.getElementById('hero-level');
    if(lel){lel.textContent=level;lel.className='hero-level '+levelMap[level];}
    const mel=document.getElementById('marge-securite');
    if(mel){ const m=D.SEUIL_ALERTE-scores.fatigue; mel.textContent=(m>0?'+':'')+m; mel.style.color=m>0?'var(--green)':m>-10?'var(--amber)':'var(--red)';}
    // Bars
    const container=document.querySelector('.panel--hero');
    if(container){
      const old=container.querySelector('.hero-bars');
      if(old) old.remove();
      const barHtml=`<div class="hero-bars" style="margin-top:auto;">
        ${[['Fatigue','fatigue','red'],['Stress','stress','amber'],['Performance','performance','cyan']].map(([l,k,c])=>`
          <div class="hero-bar-label" style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:8px;">
            <span>${l}</span><span style="color:var(--${c})">${scores[k]}</span>
          </div>
          <div class="hero-bar"><div class="hero-bar-fill" style="width:${scores[k]}%;background:var(--${c});box-shadow:0 0 6px var(--${c})40;"></div></div>
        `).join('')}
      </div>`;
      container.insertAdjacentHTML('beforeend',barHtml);
    }
  }

  _calcGlobal(scores){
    return Math.max(0,Math.min(100,scores.performance-Math.floor(scores.fatigue*.3)));
  }

  _renderScores(scores){
    const el=document.getElementById('scores-grid');
    if(!el) return;
    const defs=[
      {key:'fatigue',      label:'FATIGUE',       sub:'INRS — cumul non-linéaire',   color:v=>v>=80?'var(--red)':v>=60?'var(--orange)':v>=35?'var(--amber)':'var(--sync)'},
      {key:'stress',       label:'CORTISOL',      sub:'Thompson 2022 + ANACT',       color:v=>v>=70?'var(--red)':v>=50?'var(--orange)':v>=30?'var(--amber)':'var(--sync)'},
      {key:'performance',  label:'PERFORMANCE',   sub:'Pencavel/Stanford 2014',      color:v=>v<40?'var(--red)':v<60?'var(--orange)':v<80?'var(--amber)':'var(--sync)'},
      {key:'cvRisk',       label:'RISQUE CARDIO', sub:'OMS/OIT 2021 RR=1.35 AVC',  color:v=>v>=40?'var(--red)':v>=20?'var(--orange)':v>=8?'var(--amber)':'var(--sync)'},
      {key:'cogRisk',      label:'RISQUE CÉRÉBRAL',sub:'OEM 2025 — >52h/sem',       color:v=>v>=50?'var(--red)':v>=25?'var(--orange)':v>=10?'var(--amber)':'var(--sync)'},
      {key:'musculoRisk',  label:'MUSCULO',       sub:'Lancet 2021 HR=1.15',        color:v=>v>=50?'var(--red)':v>=30?'var(--orange)':v>=15?'var(--amber)':'var(--sync)'},
    ];
    el.innerHTML=defs.map(d=>{
      const v=scores[d.key]||0;
      const c=d.color(v);
      return `<div class="score-card">
        <div class="score-card-label">${d.label}</div>
        <div class="score-card-val" style="color:${c};">${v}</div>
        <div class="score-card-bar"><div class="score-card-bar-fill" style="width:${v}%;background:${c};"></div></div>
        <div class="score-card-sub">${d.sub}</div>
      </div>`;
    }).join('');
  }

  _renderRisks(risks){
    const el=document.getElementById('risks-list');
    if(!el) return;
    if(!risks.length){
      el.innerHTML=`<div class="risk-empty">✅ Aucun risque détecté</div>`; return;
    }
    el.innerHTML=risks.map(r=>`
      <div class="risk-item ${r.level} anim-fade">
        <div class="risk-emoji">${r.emoji}</div>
        <div class="risk-body">
          <div class="risk-title">${r.titre}</div>
          <div class="risk-msg">${r.message}</div>
          <div class="risk-article">${r.article}</div>
        </div>
      </div>`).join('');
  }

  _renderAdvice(advice){
    const el=document.getElementById('advice-list');
    if(!el) return;
    el.innerHTML=advice.map(a=>`
      <div class="advice-item ${a.type||'info'} anim-fade">
        <div class="advice-emoji">${a.emoji||'💡'}</div>
        <div>
          <div class="advice-title">${a.titre}</div>
          <div class="advice-msg">${a.message}</div>
        </div>
      </div>`).join('');
  }

  _renderRadar(scores, norm){
    const canvas=document.getElementById('radar-canvas');
    if(!canvas||!window.DTE||!window.DTE.radar) return;
    const D=window.DTE.engine?window.DTE.engine.getDefaults():{CONTINGENT_MAX:220};
    const axes=[
      {label:'Durée/jour',  value:7+(norm._avgExtra7||0), max:10, warn:8},
      {label:'Hebdoma.', value:35+(norm._avgExtra7||0)*5, max:48, warn:44},
      {label:'Consécutifs', value:norm._consec||0,        max:6,  warn:5},
      {label:'Contingent',  value:norm._contingentPct||0, max:100,warn:75},
      {label:'Repos quoti.',value:Math.max(0,11-((norm._avgExtra7||0)*.5)),max:11,warn:9,invert:true},
      {label:'Fatigue',     value:scores.fatigue,         max:100,warn:75},
    ];
    window.DTE.radar.render(axes);
    const leg=document.querySelector('.radar-legend');
    if(leg) leg.innerHTML=axes.map(a=>{
      const pct=a.value/a.max;
      const c=pct>a.warn/a.max?(pct>.9?'#f5355d':'#f5a623'):'#00d7f0';
      return `<span class="radar-legend-item"><span class="radar-legend-dot" style="background:${c};"></span>${a.label}</span>`;
    }).join('');
  }

  _updateFooter(scores, norm, raw){
    const year=raw&&raw.year?raw.year:new Date().getFullYear();
    const el=document.getElementById('footer-year'); if(el) el.textContent='Année '+year;
    const ts=document.getElementById('footer-timestamp'); if(ts) ts.textContent='Analyse : '+new Date().toLocaleTimeString('fr-FR');
    const cont=document.getElementById('footer-contingent'); if(cont) cont.textContent=`Contingent : ${raw&&raw.m1?Math.round(raw.m1.totalExtra):0}/220h`;
    const st=document.getElementById('footer-status');
    if(st){
      if(scores.fatigue>=95){st.textContent='● DANGER CRITIQUE';st.className='status-danger';}
      else if(scores.fatigue>=75){st.textContent='● VIGILANCE';st.className='status-warn';}
      else{st.textContent='● OPÉRATIONNEL';st.className='status-ok';}
    }
  }
}

global.Dashboard=Dashboard;
}(typeof window!=='undefined'?window:global));