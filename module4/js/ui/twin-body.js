/**
 * Twin Body — Corps humain SVG interactif
 */
(function(global){
'use strict';

const ZONES=[
  {id:'brain',  label:'Cerveau',  score:'stress',      desc:'Charge cognitive et stress mental'},
  {id:'eyes',   label:'Yeux',     score:'errorRisk',   desc:'Fatigue visuelle et risque erreur'},
  {id:'heart',  label:'Coeur',    score:'overloadRisk',desc:'Surcharge cardio-vasculaire'},
  {id:'lungs',  label:'Poumons',  score:'recovery',    desc:'Capacité de récupération', invert:true},
  {id:'spine',  label:'Colonne',  score:'fatigue',     desc:'Fatigue physique générale'},
  {id:'arms',   label:'Bras',     score:'performance', desc:'Performance motrice', invert:true},
  {id:'legs',   label:'Jambes',   score:'fatigue',     desc:'Récupération physique', invert:true},
];

function scoreToClass(val, invert=false){
  const v=invert?(100-val):val;
  if(v>=85) return 'crit';
  if(v>=70) return 'risk';
  if(v>=50) return 'warn';
  return 'ok';
}

function scoreToColor(val, invert=false){
  const v=invert?(100-val):val;
  if(v>=85) return '#f5355d';
  if(v>=70) return '#ff7c00';
  if(v>=50) return '#f5a623';
  return '#00e87a';
}

class TwinBody {
  constructor(container, tooltipEl){
    this._container=container;
    this._tooltip=tooltipEl;
    this._scores=null;
  }

  render(scores){
    this._scores=scores;
    this._container.innerHTML=`
      <div class="twin-body-wrap">
        <div class="twin-svg-container">
          ${this._buildSVG(scores)}
        </div>
        <div class="twin-legend">${this._buildLegend(scores)}</div>
      </div>`;
    this._bindEvents();
  }

  update(scores){
    this._scores=scores;
    ZONES.forEach(z=>{
      const el=this._container.querySelector('#bz-'+z.id);
      if(!el) return;
      const val=scores[z.score]||0;
      const cls=scoreToClass(val,z.invert);
      el.setAttribute('class','body-zone zone-'+cls);
      const circle=this._container.querySelector('#bz-'+z.id+'-core');
      if(circle) circle.setAttribute('class','body-zone zone-'+cls+'-c');
    });
    const legendItems=this._container.querySelectorAll('.twin-legend-item');
    legendItems.forEach((el,i)=>{
      if(!ZONES[i]) return;
      const z=ZONES[i];
      const val=scores[z.score]||0;
      el.querySelector('.twin-legend-dot').style.background=scoreToColor(val,z.invert);
      el.querySelector('.twin-legend-val').textContent=z.invert?(100-val):val;
    });
  }

  _buildSVG(scores){
    const c=s=>scoreToClass(scores[s]||0);
    const ci=s=>scoreToClass(scores[s]||0, true);
    return `
    <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg" style="height:320px;width:auto;">
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,215,240,0.08)"/>
          <stop offset="100%" stop-color="rgba(0,215,240,0)"/>
        </radialGradient>
        <filter id="glow-f">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Aura -->
      <ellipse cx="80" cy="190" rx="70" ry="180" fill="url(#bg-glow)"/>
      <!-- Head zone (brain) -->
      <ellipse id="bz-brain" class="body-zone zone-${c('stress')}" cx="80" cy="38" rx="26" ry="28"
        filter="url(#glow-f)" data-zone="brain"/>
      <!-- Eyes -->
      <g id="bz-eyes" class="body-zone zone-${c('errorRisk')}" data-zone="eyes">
        <ellipse cx="69" cy="34" rx="7" ry="5"/>
        <ellipse cx="91" cy="34" rx="7" ry="5"/>
      </g>
      <!-- Outline head -->
      <ellipse cx="80" cy="38" rx="26" ry="28" fill="none" stroke="rgba(0,215,240,0.3)" stroke-width=".8"/>
      <!-- Neck -->
      <rect x="72" y="64" width="16" height="14" rx="5" fill="rgba(29,60,95,0.8)"
        stroke="rgba(0,215,240,0.2)" stroke-width=".6"/>
      <!-- Torso (heart + lungs + spine) -->
      <rect x="42" y="78" width="76" height="88" rx="14" class="body-zone zone-base"
        stroke="rgba(0,215,240,0.2)" stroke-width=".8"/>
      <!-- Heart zone (left chest) -->
      <ellipse id="bz-heart" class="body-zone zone-${c('overloadRisk')}" cx="66" cy="108" rx="18" ry="16"
        filter="url(#glow-f)" data-zone="heart"/>
      <!-- Lungs zone (right chest — recovery) -->
      <ellipse id="bz-lungs" class="body-zone zone-${ci('recovery')}" cx="94" cy="108" rx="18" ry="16"
        filter="url(#glow-f)" data-zone="lungs"/>
      <!-- Spine zone -->
      <rect id="bz-spine" class="body-zone zone-${c('fatigue')}" x="72" y="82" width="16" height="80" rx="6"
        filter="url(#glow-f)" data-zone="spine"/>
      <!-- Torso outline -->
      <rect x="42" y="78" width="76" height="88" rx="14" fill="none"
        stroke="rgba(0,215,240,0.25)" stroke-width=".8"/>
      <!-- Arms -->
      <rect id="bz-arms" class="body-zone zone-${ci('performance')}" x="12" y="82" width="26" height="76" rx="12"
        data-zone="arms"/>
      <rect class="body-zone zone-${ci('performance')}" x="122" y="82" width="26" height="76" rx="12"/>
      <!-- Hips -->
      <rect x="44" y="166" width="72" height="26" rx="10" fill="rgba(29,60,95,0.85)"
        stroke="rgba(0,215,240,0.2)" stroke-width=".8"/>
      <!-- Legs -->
      <rect id="bz-legs" class="body-zone zone-${ci('fatigue')}" x="46" y="192" width="28" height="116" rx="13"
        data-zone="legs"/>
      <rect class="body-zone zone-${ci('fatigue')}" x="86" y="192" width="28" height="116" rx="13"/>
      <!-- Feet -->
      <ellipse cx="60" cy="314" rx="18" ry="9" fill="rgba(29,60,95,0.8)"
        stroke="rgba(0,215,240,0.2)" stroke-width=".8"/>
      <ellipse cx="100" cy="314" rx="18" ry="9" fill="rgba(29,60,95,0.8)"
        stroke="rgba(0,215,240,0.2)" stroke-width=".8"/>
      <!-- Center line decoration -->
      <line x1="80" y1="78" x2="80" y2="192" stroke="rgba(0,215,240,0.15)" stroke-width=".5" stroke-dasharray="3,4"/>
    </svg>`;
  }

  _buildLegend(scores){
    return ZONES.map((z,i)=>{
      const val=scores[z.score]||0;
      const disp=z.invert?(100-val):val;
      const color=scoreToColor(val,z.invert);
      return `<span class="twin-legend-item" data-zone="${z.id}">
        <span class="twin-legend-dot" style="background:${color};width:7px;height:7px;border-radius:50%;display:inline-block;"></span>
        <span class="twin-legend-val" style="font-family:var(--font-mono);font-size:9px;color:${color};">${disp}</span>
        <span style="font-size:9px;color:var(--text-muted);">${z.label}</span>
      </span>`;
    }).join('');
  }

  _bindEvents(){
    const zones=this._container.querySelectorAll('[data-zone]');
    zones.forEach(el=>{
      el.addEventListener('mouseenter', e=>this._showTooltip(e));
      el.addEventListener('mouseleave', ()=>this._hideTooltip());
    });
    const legendItems=this._container.querySelectorAll('.twin-legend-item');
    legendItems.forEach(el=>{
      el.addEventListener('mouseenter', e=>{
        const z=ZONES.find(z=>z.id===el.dataset.zone);
        if(z) this._showTooltipForZone(z, e);
      });
      el.addEventListener('mouseleave', ()=>this._hideTooltip());
    });
  }

  _showTooltip(e){
    const zoneId=e.currentTarget.dataset.zone;
    if(!zoneId) return;
    const z=ZONES.find(z=>z.id===zoneId);
    if(!z) return;
    this._showTooltipForZone(z, e);
  }

  _showTooltipForZone(z, e){
    if(!this._scores) return;
    const val=this._scores[z.score]||0;
    const disp=z.invert?(100-val):val;
    const color=scoreToColor(val,z.invert);
    this._tooltip.innerHTML=`
      <div class="twin-tooltip-title">${z.label}</div>
      <div class="twin-tooltip-val" style="color:${color};">${disp}<span style="font-size:11px;color:var(--text-muted)">/100</span></div>
      <div class="twin-tooltip-desc">${z.desc}</div>`;
    this._tooltip.classList.remove('hidden');
    this._tooltip.style.left='50%';
    this._tooltip.style.top='0';
    this._tooltip.style.transform='translate(-50%, calc(-100% - 8px))';
  }

  _hideTooltip(){
    this._tooltip.classList.add('hidden');
  }
}

global.TwinBody=TwinBody;
}(typeof window!=='undefined'?window:global));