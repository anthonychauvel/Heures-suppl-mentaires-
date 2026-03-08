/**
 * Radar Chart — Conformité légale (6 axes)
 */
(function(global){
'use strict';

class RadarChart {
  constructor(canvas){ this._canvas=canvas; this._ctx=canvas.getContext('2d'); }

  render(axes){
    const cv=this._canvas, ctx=this._ctx;
    const W=cv.width, H=cv.height, cx=W/2, cy=H/2;
    const r=Math.min(W,H)/2-36;
    const N=axes.length;
    ctx.clearRect(0,0,W,H);

    // Grid circles
    for(let i=1;i<=4;i++){
      ctx.beginPath();
      ctx.arc(cx,cy,r*(i/4),0,Math.PI*2);
      ctx.strokeStyle=`rgba(0,215,240,${.06+.04*i})`;
      ctx.lineWidth=1;
      ctx.stroke();
      // Label 25%,50%,75%,100%
      ctx.fillStyle='rgba(0,215,240,0.3)';
      ctx.font='8px JetBrains Mono,monospace';
      ctx.textAlign='center';
      ctx.fillText((i*25)+'%',cx+r*(i/4)+6,cy-3);
    }

    // Axes
    for(let i=0;i<N;i++){
      const angle=-Math.PI/2+(2*Math.PI/N)*i;
      const ex=cx+r*Math.cos(angle), ey=cy+r*Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(ex,ey);
      ctx.strokeStyle='rgba(0,215,240,0.12)';
      ctx.lineWidth=1;
      ctx.stroke();
      // Labels
      const lx=cx+(r+20)*Math.cos(angle), ly=cy+(r+20)*Math.sin(angle);
      ctx.fillStyle='rgba(110,155,185,0.9)';
      ctx.font='9px JetBrains Mono,monospace';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      const short=axes[i].label.length>10?axes[i].label.substring(0,10)+'..':axes[i].label;
      ctx.fillText(short,lx,ly);
    }

    // Data polygon
    const points=[];
    for(let i=0;i<N;i++){
      const angle=-Math.PI/2+(2*Math.PI/N)*i;
      const pct=Math.max(0,Math.min(1,axes[i].value/axes[i].max));
      points.push({x:cx+r*pct*Math.cos(angle), y:cy+r*pct*Math.sin(angle)});
    }

    // Fill
    ctx.beginPath();
    points.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath();
    ctx.fillStyle='rgba(0,215,240,0.08)';
    ctx.fill();
    ctx.strokeStyle='rgba(0,215,240,0.7)';
    ctx.lineWidth=1.5;
    ctx.stroke();

    // Warning overlay (red for exceeded axes)
    const exceeded=axes.filter(a=>a.value>a.warn);
    if(exceeded.length){
      const redPts=[];
      for(let i=0;i<N;i++){
        const angle=-Math.PI/2+(2*Math.PI/N)*i;
        const pct=Math.max(0,Math.min(1,axes[i].value/axes[i].max));
        if(axes[i].value>axes[i].warn){
          redPts.push({x:cx+r*pct*Math.cos(angle),y:cy+r*pct*Math.sin(angle),i});
        }
      }
    }

    // Dots
    points.forEach((p,i)=>{
      const pct=axes[i].value/axes[i].max;
      const color=pct>axes[i].warn/axes[i].max
        ?(pct>.9?'#f5355d':'#f5a623')
        :'#00d7f0';
      ctx.beginPath();
      ctx.arc(p.x,p.y,4,0,Math.PI*2);
      ctx.fillStyle=color;
      ctx.fill();
      ctx.strokeStyle=color;
      ctx.lineWidth=1;
      ctx.stroke();
    });

    // Center dot
    ctx.beginPath();
    ctx.arc(cx,cy,3,0,Math.PI*2);
    ctx.fillStyle='rgba(0,215,240,0.5)';
    ctx.fill();
  }
}

global.RadarChart=RadarChart;
}(typeof window!=='undefined'?window:global));