/**
 * Heatmap — Vue calendrier annuelle des niveaux de risque
 */
(function(global){
'use strict';

function getRiskLevel(extra){
  if(extra>=4) return 'crit';
  if(extra>=2.5) return 'danger';
  if(extra>=1) return 'warn';
  return 'ok';
}

class Heatmap {
  constructor(container){ this._container=container; }

  render(m1Days, year){
    const y=parseInt(year)||new Date().getFullYear();
    const months=[];
    for(let m=0;m<12;m++){
      const days=[];
      const dim=new Date(y,m+1,0).getDate();
      for(let d=1;d<=dim;d++){
        const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const entry=m1Days[key];
        if(entry) days.push({key,extra:entry.extra,absent:entry.absent});
        else days.push({key,extra:null,absent:false});
      }
      months.push({month:m, days});
    }

    const monthNames=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

    this._container.innerHTML=`
      <div class="heatmap-months">
        ${months.map(m=>`
          <div class="heatmap-month">
            <div class="heatmap-month-name">${monthNames[m.month]}</div>
            <div class="heatmap-cells">
              ${m.days.map(d=>{
                if(d.extra===null){
                  return `<div class="heatmap-cell empty" title="${d.key}"></div>`;
                }
                const level=d.absent?'empty':getRiskLevel(d.extra);
                return `<div class="heatmap-cell ${level}" 
                  title="${d.key} — +${d.extra}h${d.absent?' (absent)':''}"
                  data-date="${d.key}" data-extra="${d.extra}"></div>`;
              }).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="heatmap-legend">
        <span>Niveaux de risque :</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-swatch" style="background:var(--green-dim);border:1px solid rgba(0,232,122,0.4);"></span>Normal</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-swatch" style="background:var(--amber-dim);border:1px solid rgba(245,166,35,0.4);"></span>Attention</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-swatch" style="background:var(--orange-dim);border:1px solid rgba(255,124,0,0.4);"></span>Risque</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-swatch" style="background:var(--red-dim);border:1px solid rgba(245,53,93,0.4);"></span>Critique</span>
      </div>`;
  }
}

global.Heatmap=Heatmap;
}(typeof window!=='undefined'?window:global));