/**
 * TwinBody — Corps humain wireframe Animus
 * SVG externe chargé + zones colorées dynamiquement selon les scores
 */
(function(global){
'use strict';

const ZONE_MAP = {
  brain:  { score:'stress',      label:'Cerveau',   desc:'Charge cognitive & stress' },
  heart:  { score:'overloadRisk',label:'Cœur',      desc:'Risque de surcharge cardiaque' },
  lungs:  { score:'recovery',    label:'Poumons',   desc:'Capacité de récupération', invert:true },
  spine:  { score:'fatigue',     label:'Colonne',   desc:'Fatigue structurelle' },
  arms:   { score:'performance', label:'Bras',      desc:'Performance motrice', invert:true },
  legs:   { score:'fatigue',     label:'Jambes',    desc:'Endurance & mobilité', invert:true },
};

const COLORS = {
  ok:   '#00ffcc',
  warn: '#ffb300',
  risk: '#ff6600',
  crit: '#ff2244',
};

function scoreToColor(v, invert){
  const val = invert ? 100 - v : v;
  if(val < 40) return COLORS.ok;
  if(val < 60) return COLORS.warn;
  if(val < 80) return COLORS.risk;
  return COLORS.crit;
}

function scoreToLevel(v, invert){
  const val = invert ? 100 - v : v;
  if(val < 40) return 'ok';
  if(val < 60) return 'warn';
  if(val < 80) return 'risk';
  return 'crit';
}

class TwinBody {
  constructor(container, tooltipEl){
    this._container = container;
    this._tooltip   = tooltipEl;
    this._scores    = {};
    this._svgLoaded = false;
    this._load();
  }

  _load(){
    fetch('assets/wireframe-body.svg')
      .then(r => r.text())
      .then(svgText => {
        this._container.innerHTML = `
          <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
            <div id="twin-svg-inner" style="height:100%;max-height:320px;position:relative;">${svgText}</div>
          </div>`;
        this._svgLoaded = true;
        this._bindEvents();
        if(Object.keys(this._scores).length) this._apply();
      })
      .catch(() => {
        // Fallback inline minimal
        this._container.innerHTML = this._fallback();
        this._svgLoaded = true;
        this._bindEvents();
      });
  }

  update(scores){
    this._scores = scores || {};
    if(this._svgLoaded) this._apply();
  }

  _apply(){
    const s = this._scores;
    if(!s || !Object.keys(s).length) return;

    Object.entries(ZONE_MAP).forEach(([zone, cfg]) => {
      const raw = s[cfg.score] || 0;
      const col = scoreToColor(raw, cfg.invert);
      const lvl = scoreToLevel(raw, cfg.invert);

      // Color gradient stops
      const grad = document.getElementById('zone-' + zone);
      if(grad){
        grad.querySelector('stop').setAttribute('stop-color', col);
      }

      // Node dots
      const nodes = document.querySelectorAll(`.zone-node[data-zone="${zone}"]`);
      nodes.forEach(n => {
        n.setAttribute('fill', col);
        n.style.filter = lvl === 'crit' ? `drop-shadow(0 0 6px ${col})` : `drop-shadow(0 0 3px ${col})`;
      });

      // Fill overlays
      const fills = document.querySelectorAll(`[data-zone="${zone}"]`);
      fills.forEach(el => {
        el.style.setProperty(`--zone-${zone}-c`, col);
        if(lvl === 'crit'){
          el.style.animation = 'zone-crit-pulse 1.2s ease-in-out infinite';
        } else {
          el.style.animation = '';
        }
      });

      // Stroke on outline paths via CSS var
      const svgEl = this._container.querySelector('svg');
      if(svgEl) svgEl.style.setProperty(`--zone-${zone}-col`, col);
    });
  }

  _bindEvents(){
    const container = this._container;
    const tooltip   = this._tooltip;
    if(!container || !tooltip) return;

    container.addEventListener('mousemove', e => {
      const target = e.target.closest('.zone-node, .body-zone');
      if(!target) { tooltip.classList.add('hidden'); return; }
      const zone = target.dataset.zone;
      if(!zone) return;
      const cfg = ZONE_MAP[zone];
      if(!cfg) return;
      const raw = this._scores[cfg.score] || 0;
      const col = scoreToColor(raw, cfg.invert);
      const lvl = scoreToLevel(raw, cfg.invert);
      const labels = { ok:'NOMINAL', warn:'VIGILANCE', risk:'ALERTE', crit:'CRITIQUE' };

      tooltip.innerHTML = `
        <div class="twin-tooltip-title" style="color:${col}">${cfg.label.toUpperCase()}</div>
        <div class="twin-tooltip-val" style="color:${col}">${raw}<span style="font-size:11px;color:var(--text-muted)">/100</span></div>
        <div class="twin-tooltip-desc">${cfg.desc}</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:${col};margin-top:4px;letter-spacing:.1em;">${labels[lvl]||lvl}</div>`;
      tooltip.classList.remove('hidden');

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.left = (x < rect.width/2 ? x + 12 : x - tooltip.offsetWidth - 12) + 'px';
      tooltip.style.top  = Math.max(0, y - 40) + 'px';
      tooltip.style.transform = 'none';
    });

    container.addEventListener('mouseleave', () => {
      if(tooltip) tooltip.classList.add('hidden');
    });

    // Touch support
    container.addEventListener('touchstart', e => {
      const t = e.touches[0];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      const zoneEl = target && target.closest('.zone-node, .body-zone');
      if(!zoneEl){ tooltip.classList.add('hidden'); return; }
      const zone = zoneEl.dataset.zone;
      if(!zone || !ZONE_MAP[zone]) return;
      const cfg = ZONE_MAP[zone];
      const raw = this._scores[cfg.score] || 0;
      const col = scoreToColor(raw, cfg.invert);
      tooltip.innerHTML = `
        <div class="twin-tooltip-title" style="color:${col}">${cfg.label.toUpperCase()}</div>
        <div class="twin-tooltip-val" style="color:${col}">${raw}/100</div>
        <div class="twin-tooltip-desc">${cfg.desc}</div>`;
      tooltip.classList.remove('hidden');
      setTimeout(() => tooltip.classList.add('hidden'), 2500);
    }, {passive:true});
  }

  _fallback(){
    return `<svg viewBox="0 0 200 380" style="height:100%;opacity:.7">
      <ellipse cx="100" cy="35" rx="25" ry="28" fill="none" stroke="#00c8ff" stroke-width="1.2"/>
      <rect x="75" y="63" width="50" height="65" rx="8" fill="none" stroke="#00c8ff" stroke-width="1.2"/>
      <rect x="75" y="128" width="50" height="45" rx="6" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="30" y="70" width="42" height="22" rx="10" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="128" y="70" width="42" height="22" rx="10" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="30" y="92" width="18" height="80" rx="9" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="152" y="92" width="18" height="80" rx="9" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="76" y="173" width="22" height="110" rx="11" fill="none" stroke="#00c8ff" stroke-width="1"/>
      <rect x="102" y="173" width="22" height="110" rx="11" fill="none" stroke="#00c8ff" stroke-width="1"/>
    </svg>`;
  }
}

global.TwinBody = TwinBody;
}(typeof window !== 'undefined' ? window : global));
