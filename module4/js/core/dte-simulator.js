/**
 * DTE Simulator — Moteur de simulation jour par jour
 */
(function(global){
'use strict';

class DTESimulator {
  constructor(engine){ this._engine=engine; }

  /**
   * Simule un plan de travail
   * @param {Object} plan - {days, hoursPerDay, restDays}
   * @param {Object} initialScores - scores initiaux (depuis engine)
   */
  run(plan={}, initialScores=null){
    const D=this._engine.getDefaults();
    const {days=14, hoursPerDay=0, restDays=[0]}=plan;
    const nb=Math.min(days,D.MAX_SIM);
    const s=initialScores||this._engine.getState()&&this._engine.getState().scores;
    if(!s) throw new Error('[DTE-Sim] Aucun score initial. Lancez engine.analyze() d abord.');

    let fat=s._f, str=s._s, perf=s._p;
    const today=new Date();
    const timeline=[];
    let totFat=0, maxFat=fat, totPerf=0, daysAlert=0, daysCrit=0;

    for(let i=0;i<nb;i++){
      const dt=new Date(today); dt.setDate(dt.getDate()+i+1);
      const dow=dt.getDay();
      const isRest=restDays.includes(dow);
      const planned=isRest?0:hoursPerDay;
      const total=isRest?0:D.BASE_JOUR+planned;
      const load=Math.max(0,Math.min(1,total/14));
      const rec=isRest?D.RECOVERY_WE:D.RECOVERY;
      const over=Math.max(0,total-(D.BASE_JOUR+2))/4;

      fat=Math.max(0,Math.min(1,fat+load*.12-rec));
      str=Math.max(0,Math.min(1,str+over*.08-(isRest?.05:0)));
      perf=Math.max(0,Math.min(1,1+fat*(-.7)+.5*.3));

      const fScore=Math.round(fat*100);
      let alert='OK';
      if(fScore>=D.SEUIL_CRIT){alert='CRITIQUE';daysCrit++;}
      else if(fScore>=D.SEUIL_RISQUE){alert='RISQUE';daysAlert++;}
      else if(fScore>=D.SEUIL_ALERTE){alert='ALERTE';daysAlert++;}

      totFat+=fat; totPerf+=perf;
      if(fat>maxFat) maxFat=fat;

      timeline.push({
        date:  dt.toISOString().slice(0,10),
        jour:  ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][dow],
        isRest, hoursExtra:planned, totalHours:total,
        fatigue:fScore, stress:Math.round(str*100),
        performance:Math.round(perf*100), alert,
      });
    }

    const avg=v=>Math.round(v/nb*100);
    return {
      timeline,
      summary:{
        avgFatigue:   avg(totFat),
        maxFatigue:   Math.round(maxFat*100),
        avgPerformance:avg(totPerf),
        finalFatigue: Math.round(fat*100),
        finalStress:  Math.round(str*100),
        daysAlert, daysCrit,
        score:Math.max(0,avg(totPerf)-daysCrit*15-daysAlert*5),
      }
    };
  }

  /**
   * Génère et compare 3 scénarios
   */
  scenarios(days=14, norm=null){
    const n=norm||this._engine.getState()&&this._engine.getState().norm;
    const scores=this._engine.getState()&&this._engine.getState().scores;
    if(!n||!scores) return null;
    const avg=n._avgExtra7;

    const plans={
      actuel:   {days,hoursPerDay:avg,              restDays:[0]},
      optimise: {days,hoursPerDay:Math.max(0,avg-1.5),restDays:[0]},
      securise: {days,hoursPerDay:0,                restDays:[0,6]},
    };
    const labels={
      actuel:   {emoji:'▶️', label:'Rythme actuel',  desc:'Continuation du rythme en cours'},
      optimise: {emoji:'⚡', label:'Optimisé',         desc:'Réduction de 1h30/jour'},
      securise: {emoji:'🛡️',label:'Sécurisé',         desc:'Zéro HS, week-ends complets'},
    };
    const result=[];
    for(const [name,plan] of Object.entries(plans)){
      const sim=this.run(plan, scores);
      const q=sim.summary.avgPerformance-sim.summary.avgFatigue*.4-(sim.summary.finalStress)*.3;
      result.push({name,...labels[name],plan,summary:sim.summary,quality:Math.round(q),sim});
    }
    result.sort((a,b)=>b.quality-a.quality);
    return {scenarios:result, best:result[0]};
  }

  /**
   * Prédit l'état dans N jours
   */
  futurState(days=30, norm=null){
    const n=norm||this._engine.getState()&&this._engine.getState().norm;
    const scores=this._engine.getState()&&this._engine.getState().scores;
    if(!n||!scores) return null;
    const sim=this.run({days,hoursPerDay:n._avgExtra7,restDays:[0]}, scores);
    const future=new Date(); future.setDate(future.getDate()+days);
    const maxDay=sim.timeline.reduce((m,d)=>d.fatigue>m.fatigue?d:m,sim.timeline[0]);
    const alertDays=sim.timeline.filter(d=>d.alert!=='OK');
    return {
      days, date:future.toISOString().slice(0,10),
      fatigue:sim.summary.finalFatigue,
      stress: sim.summary.finalStress,
      performance:sim.summary.avgPerformance,
      maxFatigueDay:maxDay,
      alertDays, summary:sim.summary,
    };
  }
}

global.DTESimulator=DTESimulator;
}(typeof window!=='undefined'?window:global));