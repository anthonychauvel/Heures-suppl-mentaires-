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
        // Scanner les clés localStorage pour diagnostic
        const foundKeys = [];
        try {
          for(let i=0;i<localStorage.length;i++){
            const k=localStorage.key(i);
            if(k&&(k.startsWith('DATA_REPORT_')||k.startsWith('CA_HS_TRACKER')))
              foundKeys.push(k);
          }
        } catch(_){}
        const keyTxt = foundKeys.length
          ? ' · Clés détectées : <b style="color:var(--sync)">' + foundKeys.join(', ') + '</b>'
          : ' · <b style="color:var(--red)">Aucune clé M1/M2 dans localStorage</b> — vérifiez que M1 est bien sur le même domaine';
        const missing = [];
        if(!m1ok) missing.push('M1 heures');
        if(!m2ok) missing.push('M2 paie (optionnel)');
        b.innerHTML = '&#9888;&nbsp; ANALYSE EN ATTENTE' + (missing.length ? ' — données manquantes : ' + missing.join(', ') : '') + keyTxt;
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
    // Pas de données → afficher "--" et pas CRITIQUE
    const hasData = scores && scores._hasData;
    const sg = hasData ? (window.DTE&&window.DTE.app ? window.DTE.app.scoreGlobal : this._calcGlobal(scores)) : null;
    el.textContent = sg !== null ? sg : '--';
    const levelMap={EXCELLENT:'excellent',BON:'bon',MOYEN:'moyen',FAIBLE:'faible',CRITIQUE:'critique'};
    const level = sg === null ? 'EN ATTENTE' : sg>=80?'EXCELLENT':sg>=60?'BON':sg>=40?'MOYEN':sg>=20?'FAIBLE':'CRITIQUE';
    const lel=document.getElementById('hero-level');
    if(lel){
      lel.textContent=level;
      lel.className='hero-level '+(levelMap[level]||'bon');
      if(sg===null){ lel.style.color='var(--text-muted)'; lel.style.borderColor='var(--text-muted)'; lel.style.background='transparent'; }
    }
    const mel=document.getElementById('marge-securite');
    if(mel){
      if(!hasData){ mel.textContent='—'; mel.style.color='var(--text-muted)'; }
      else { const m=(D.SEUIL_ALERTE||75)-(scores.fatigue||0); mel.textContent=(m>0?'+':'')+m; mel.style.color=m>0?'var(--sync)':m>-10?'var(--amber)':'var(--red)'; }
    }
    // Bars
    const container=document.querySelector('.panel--hero');
    if(container){
      const old=container.querySelector('.hero-bars');
      if(old) old.remove();
      const hasDat = scores._hasData;
      const fatV   = scores.fatigue || 0;
      const perfV  = scores.performance || 0;
      const strV   = scores.stress || 0;
      const fatLbl = fatV<35?'Vous êtes en forme':fatV<60?'Fatigue modérée':fatV<80?'Surmenage':' Épuisement critique';
      const perfLbl= perfV>80?'Très efficace':perfV>60?'Efficacité correcte':perfV>40?'Baisse de performance':'Efficacité très réduite';
      const strLbl = strV<30?'Peu stressé':strV<60?'Stress modéré':strV<80?'Stress élevé':'Stress critique';
      const barHtml=`<div class="hero-bars" style="margin-top:auto;">
        ${!hasDat ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:12px;line-height:1.7;">
            📋 Saisissez des heures dans<br><b style="color:#fff">M1 (Suivi annuel)</b><br>pour activer l'analyse complète.
          </div>` :
          [
            ['🧠 Fatigue','fatigue','red', fatV, fatLbl],
            ['⚡ Performance','performance','cyan', perfV, perfLbl],
            ['💊 Stress','stress','amber', strV, strLbl],
          ].map(([l,k,col,v,desc])=>`
            <div style="margin-top:10px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="font-size:11px;color:#fff;">${l}</span>
                <span style="font-size:12px;font-weight:700;color:var(--${col});">${v}%</span>
              </div>
              <div class="hero-bar"><div class="hero-bar-fill" style="width:${v}%;background:var(--${col});box-shadow:0 0 6px var(--${col})40;"></div></div>
              <div style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px;">${desc}</div>
            </div>`).join('')
          }
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
      {key:'fatigue',     label:'FATIGUE',       sub:'Votre niveau d\'épuisement cumulé',      color:v=>v>=80?'var(--red)':v>=60?'var(--orange)':v>=35?'var(--amber)':'var(--sync)', inv:false},
      {key:'stress',      label:'STRESS',        sub:'Tension nerveuse & cortisol',            color:v=>v>=70?'var(--red)':v>=50?'var(--orange)':v>=30?'var(--amber)':'var(--sync)', inv:false},
      {key:'performance', label:'PERFORMANCE',   sub:'Votre efficacité au travail',            color:v=>v<40?'var(--red)':v<60?'var(--orange)':v<80?'var(--amber)':'var(--sync)',  inv:true},
      {key:'cvRisk',      label:'CŒUR',          sub:'Risque cardiovasculaire (OMS 2021)',     color:v=>v>=40?'var(--red)':v>=20?'var(--orange)':v>=8?'var(--amber)':'var(--sync)',  inv:false},
      {key:'cogRisk',     label:'CERVEAU',       sub:'Risque cognitif si ≥52h/sem (OEM 2025)',color:v=>v>=50?'var(--red)':v>=25?'var(--orange)':v>=10?'var(--amber)':'var(--sync)', inv:false},
      {key:'recovery',    label:'RÉCUPÉRATION',  sub:'Capacité à récupérer le week-end',       color:v=>v<20?'var(--red)':v<40?'var(--orange)':v<60?'var(--amber)':'var(--sync)',   inv:true},
    ];
    el.innerHTML=defs.map(d=>{
      const v=Math.round(scores[d.key])||0;
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
    const borderCol = t => t==='danger'?'#c83040':t==='warning'?'#b88a18':t==='success'?'#00aa88':'#2090b8';
    el.innerHTML = advice.length ? advice.map(a=>`
      <div class="advice-item anim-fade" style="
        padding:10px 12px;margin-bottom:6px;
        border-left:3px solid ${borderCol(a.type||'info')};
        background:rgba(0,10,25,.88);cursor:pointer;"
        onclick="this.querySelector('.advice-detail').style.display=this.querySelector('.advice-detail').style.display==='none'?'block':'none'">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <span style="font-size:15px;flex-shrink:0;">${a.emoji||'💡'}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#ffffff;margin-bottom:3px;">
              ${a.titre||a.title||'Conseil'}
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.80);line-height:1.55;">
              ${a.message||a.msg||''}
            </div>
            <div class="advice-detail" style="display:none;margin-top:6px;padding-top:6px;
              border-top:1px solid rgba(255,255,255,0.08);">
              ${(a.source)?`<div style="font-size:10px;color:rgba(255,255,255,0.45);font-style:italic;">
                📚 Source : ${a.source}</div>`:''}
            </div>
            <div style="font-size:9px;color:rgba(255,255,255,0.30);margin-top:4px;">
              Toucher pour ${a.source?'voir la source':'plus d\'info'}
            </div>
          </div>
        </div>
      </div>`).join('') :
      '<div style="padding:14px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">Analysez vos heures dans M1 pour voir les recommandations.</div>';
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