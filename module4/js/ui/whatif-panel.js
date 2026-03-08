/**
 * WhatIf Panel — Simulation avancée What If
 */
(function(global){
'use strict';

class WhatIfPanel {
  constructor(container, simulator, chart){
    this._container=container;
    this._simulator=simulator;
    this._chart=chart;
    this._plan={days:14,hoursPerDay:0,restDays:[0]};
  }

  render(){
    this._container.innerHTML=`
      <div class="whatif-controls">
        <div class="panel">
          <div class="panel-label">Paramètres de simulation</div>
          <div class="whatif-control">
            <div class="whatif-control-label">HEURES SUPPLÉMENTAIRES / JOUR</div>
            <div class="whatif-slider-row">
              <label>HS/jour</label><span id="wi-hs-val">0h</span>
            </div>
            <input type="range" id="wi-hs" min="0" max="5" step="0.5" value="0" style="width:100%;accent-color:var(--cyan);">
          </div>
          <div class="whatif-control" style="margin-top:var(--gap);">
            <div class="whatif-control-label">HORIZON DE SIMULATION</div>
            <div class="whatif-slider-row">
              <label>Jours</label><span id="wi-days-val">14 jours</span>
            </div>
            <input type="range" id="wi-days" min="7" max="90" step="1" value="14" style="width:100%;accent-color:var(--cyan);">
          </div>
          <div class="whatif-control" style="margin-top:var(--gap);">
            <div class="whatif-control-label">JOURS DE REPOS</div>
            <div class="whatif-checkbox-row"><input type="checkbox" id="wi-sun" checked> Dimanche</div>
            <div class="whatif-checkbox-row"><input type="checkbox" id="wi-sat"> Samedi</div>
          </div>
          <div class="whatif-control" style="margin-top:var(--gap);">
            <div class="whatif-control-label">SCÉNARIOS PRÉDÉFINIS</div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;">
              <button class="btn btn--ghost wi-preset" data-hs="0" data-days="30" data-sun="1" data-sat="1">🛡️ Récupération totale</button>
              <button class="btn btn--ghost wi-preset" data-hs="1" data-days="14" data-sun="1" data-sat="0">⚡ Optimisé standard</button>
              <button class="btn btn--ghost wi-preset" data-hs="2.5" data-days="14" data-sun="1" data-sat="0">📦 Rush projet</button>
              <button class="btn btn--ghost wi-preset" data-hs="4" data-days="7"  data-sun="0" data-sat="0">🔥 Urgence max</button>
            </div>
          </div>
        </div>
      </div>
      <div class="whatif-result">
        <div class="panel">
          <div class="panel-label">Évolution prédite</div>
          <canvas id="whatif-canvas"></canvas>
        </div>
        <div class="panel" style="margin-top:var(--gap);">
          <div class="panel-label">Résumé de simulation</div>
          <div class="whatif-summary" id="wi-summary"></div>
        </div>
      </div>`;

    this._chart._canvas=document.getElementById('whatif-canvas');
    this._chart._ctx=this._chart._canvas.getContext('2d');
    this._bindEvents();
    this._simulate();
  }

  _bindEvents(){
    const run=()=>this._simulate();
    const wiHs=document.getElementById('wi-hs');
    const wiDays=document.getElementById('wi-days');
    wiHs.addEventListener('input',e=>{document.getElementById('wi-hs-val').textContent=e.target.value+'h';this._plan.hoursPerDay=parseFloat(e.target.value);run();});
    wiDays.addEventListener('input',e=>{document.getElementById('wi-days-val').textContent=e.target.value+' jours';this._plan.days=parseInt(e.target.value);run();});
    document.getElementById('wi-sun').addEventListener('change',()=>{this._updateRest();run();});
    document.getElementById('wi-sat').addEventListener('change',()=>{this._updateRest();run();});
    document.querySelectorAll('.wi-preset').forEach(btn=>{
      btn.addEventListener('click',()=>{
        wiHs.value=btn.dataset.hs;
        document.getElementById('wi-hs-val').textContent=btn.dataset.hs+'h';
        this._plan.hoursPerDay=parseFloat(btn.dataset.hs);
        wiDays.value=btn.dataset.days;
        document.getElementById('wi-days-val').textContent=btn.dataset.days+' jours';
        this._plan.days=parseInt(btn.dataset.days);
        document.getElementById('wi-sun').checked=btn.dataset.sun==='1';
        document.getElementById('wi-sat').checked=btn.dataset.sat==='1';
        this._updateRest(); run();
      });
    });
  }

  _updateRest(){
    const rest=[];
    if(document.getElementById('wi-sun').checked) rest.push(0);
    if(document.getElementById('wi-sat').checked) rest.push(6);
    this._plan.restDays=rest;
  }

  _simulate(){
    try{
      const result=this._simulator.run(this._plan);
      const canvas=document.getElementById('whatif-canvas');
      if(canvas){
        canvas.style.height='240px';
        const r=canvas.parentElement.getBoundingClientRect();
        canvas.width=r.width||600; canvas.height=240;
        this._chart._canvas=canvas;
        this._chart._ctx=canvas.getContext('2d');
        this._chart.render(result.timeline);
      }
      this._renderSummary(result.summary);
    }catch(err){ console.warn('[WhatIf]',err); }
  }

  _renderSummary(s){
    const el=document.getElementById('wi-summary');
    if(!el) return;
    const colorFor=v=>v>=85?'var(--red)':v>=70?'var(--orange)':v>=50?'var(--amber)':'var(--green)';
    el.innerHTML=`
      <div class="whatif-stat">
        <span class="whatif-stat-val" style="color:${colorFor(s.avgFatigue)}">${s.avgFatigue}</span>
        <div class="whatif-stat-label">Fatigue moy.</div>
      </div>
      <div class="whatif-stat">
        <span class="whatif-stat-val" style="color:${colorFor(s.maxFatigue)}">${s.maxFatigue}</span>
        <div class="whatif-stat-label">Pic fatigue</div>
      </div>
      <div class="whatif-stat">
        <span class="whatif-stat-val" style="color:${colorFor(100-s.avgPerformance)}">${s.avgPerformance}</span>
        <div class="whatif-stat-label">Performance</div>
      </div>
      <div class="whatif-stat">
        <span class="whatif-stat-val" style="color:${s.daysCrit>0?'var(--red)':s.daysAlert>0?'var(--amber)':'var(--green)'}">${s.daysAlert+s.daysCrit}</span>
        <div class="whatif-stat-label">Jours alerte</div>
      </div>`;
  }
}

global.WhatIfPanel=WhatIfPanel;
}(typeof window!=='undefined'?window:global));