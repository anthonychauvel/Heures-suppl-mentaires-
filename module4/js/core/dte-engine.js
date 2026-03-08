/**
 * DTE Engine — Lecture données M1/M2/RPG + Normalisation + Scores
 * LECTURE SEULE — ne modifie jamais les données sources
 */
(function(global){
'use strict';
const D = {
  BASE_HEBDO:35, BASE_JOUR:7, SLEEP_OPTIMAL:8,
  CONTINGENT_MAX:220, RECOVERY:0.15, RECOVERY_WE:0.25,
  LR:0.05, SEUIL_ALERTE:75, SEUIL_RISQUE:85, SEUIL_CRIT:95,
  VARIAB_WINDOW:4, MAX_SIM:90
};
const W = {
  fat:  {heures:.4, consec:.2, sommeil:.3, surcharge:.1, burnout:.2},
  str:  {fatigue:.5, charge:.3, variab:.2, external:.15},
  perf: {fatigue:-.7, motiv:.3}
};

class DTEEngine {
  constructor(){ this._coefs = this._loadCoefs(); this._cache = null; }

  /* ── Public ── */
  analyze(){
    const raw   = this._readAll();
    const norm  = this._normalize(raw);
    const scores= this._scores(norm);
    this._cache = {raw, norm, scores};
    return {raw, norm, scores};
  }
  getState(){ return this._cache; }
  getCoefs(){ return {...this._coefs}; }
  getDefaults(){ return D; }

  /* ── Read sources (READ ONLY) ── */
  _readAll(){
    const year = this._year();
    return { year, m1: this._m1(year), m2: this._m2(year), rpg: this._rpg() };
  }
  _year(){
    try{ const s=localStorage.getItem('ACTIVE_YEAR_SUFFIX'); if(s) return s; }catch(_){}
    return String(new Date().getFullYear());
  }
  _m1(year){
    const r={days:{},totalExtra:0,totalRecup:0,violations:[]};
    try{
      const raw=localStorage.getItem('DATA_REPORT_'+year);
      if(!raw) return r;
      const d=JSON.parse(raw);
      const days=d.days||d.jours||{};
      for(const [date,e] of Object.entries(days)){
        const extra=parseFloat(e.extra||e.hs||0);
        const recup=parseFloat(e.recup||e.repos||0);
        const absent=parseFloat(e.absent||0);
        r.days[date]={extra,recup,absent};
        r.totalExtra+=extra; r.totalRecup+=recup;
      }
      r.violations=d.violations||[];
    }catch(e){ console.warn('[DTE-E] m1:',e); }
    return r;
  }
  _m2(year){
    const r={months:{},contract:D.BASE_HEBDO,totalWorked:0,totalDaysOff:0};
    try{
      const raw=localStorage.getItem('CA_HS_TRACKER_V1_DATA_'+year);
      if(!raw) return r;
      const d=JSON.parse(raw);
      r.contract=parseFloat(d.contractHours||d.heuresContrat||D.BASE_HEBDO);
      const months=d.months||d.mois||{};
      for(const [m,e] of Object.entries(months)){
        const worked=parseFloat(e.worked||e.travaillees||0);
        const off=parseFloat(e.daysOff||e.conges||0);
        r.months[m]={worked,daysOff:off};
        r.totalWorked+=worked; r.totalDaysOff+=off;
      }
    }catch(e){ console.warn('[DTE-E] m2:',e); }
    return r;
  }
  _rpg(){
    const r={xp:0,level:1,badges:[],burnout:0,violations:[],motivation:.5,stress:0};
    try{
      r.xp=parseInt(localStorage.getItem('rpg_xp')||0);
      r.level=parseInt(localStorage.getItem('rpg_level')||1);
      const b=localStorage.getItem('rpg_badges'); if(b) r.badges=JSON.parse(b);
      const bu=localStorage.getItem('rpg_burnout');
      if(bu){ const bv=JSON.parse(bu); r.burnout=parseFloat(bv.score||bv.value||bv||0); }
      const v=localStorage.getItem('rpg_violations'); if(v) r.violations=JSON.parse(v);
      const lf=Math.min(r.level/50,1), bf=Math.min(r.badges.length/20,1);
      r.motivation=lf*.6+bf*.4;
      const now=Date.now();
      const recent=r.violations.filter(vv=>{ const d=new Date(vv.date||vv.timestamp||0).getTime(); return (now-d)<30*864e5; });
      r.stress=Math.min(recent.length/10,1);
    }catch(e){ console.warn('[DTE-E] rpg:',e); }
    return r;
  }

  /* ── Normalize ── */
  _normalize(raw){
    const {m1,m2,rpg}=raw;
    const clamp=(v,min,max)=>max===min?0:Math.max(0,Math.min(1,(v-min)/(max-min)));
    const today=new Date();
    const recent7=[], days=m1.days;
    for(let i=0;i<7;i++){
      const d=new Date(today); d.setDate(d.getDate()-i);
      const k=d.toISOString().slice(0,10);
      if(days[k]) recent7.push(days[k]);
    }
    const avgExtra7=recent7.length?recent7.reduce((s,d)=>s+d.extra,0)/recent7.length:0;
    const avgH7=D.BASE_JOUR+avgExtra7;

    // Consecutive days
    let consec=0;
    for(let i=0;i<30;i++){
      const d=new Date(today); d.setDate(d.getDate()-i);
      const k=d.toISOString().slice(0,10);
      const e=days[k]; if(!e||e.absent>0) break; consec++;
    }

    // Overload ratio (days > base+2h)
    const allDays=Object.values(days);
    const overThresh=allDays.filter(d=>(D.BASE_JOUR+d.extra)>D.BASE_JOUR+2).length;
    const overRatio=allDays.length?overThresh/allDays.length:0;

    // Weekly variability (sigma)
    const weekTotals=[];
    for(let w=0;w<D.VARIAB_WINDOW;w++){
      let wt=0;
      for(let dd=0;dd<7;dd++){
        const dt=new Date(today); dt.setDate(dt.getDate()-w*7-dd);
        const k=dt.toISOString().slice(0,10);
        const e=days[k]; if(e) wt+=D.BASE_JOUR+(e.extra||0);
      }
      weekTotals.push(wt);
    }
    const mean=weekTotals.reduce((a,b)=>a+b,0)/weekTotals.length;
    const sigma=Math.sqrt(weekTotals.reduce((s,v)=>s+Math.pow(v-mean,2),0)/weekTotals.length);

    // Sleep debt proxy
    const sleepDebt=Math.max(0,avgH7-9)*.5;

    const contingentPct=(m1.totalExtra/D.CONTINGENT_MAX)*100;

    return {
      heures:    clamp(avgH7,0,14),
      consec:    clamp(consec,0,14),
      sommeil:   clamp(sleepDebt,0,4),
      surcharge: clamp(overRatio,0,1),
      variab:    clamp(sigma,0,5),
      burnout:   Math.max(0,Math.min(1,rpg.burnout/100)),
      motiv:     Math.max(0,Math.min(1,rpg.motivation)),
      extStress: Math.max(0,Math.min(1,rpg.stress)),
      _avgExtra7:avgExtra7,
      _consec:   consec,
      _contingentPct: contingentPct,
    };
  }

  /* ── Scores ── */
  _scores(norm){
    const c=this._coefs;
    const fat_raw =
      norm.heures   *W.fat.heures   *c.fh +
      norm.consec   *W.fat.consec   *c.fc +
      norm.sommeil  *W.fat.sommeil +
      norm.surcharge*W.fat.surcharge+
      norm.burnout  *W.fat.burnout;
    const fatigue=Math.max(0,Math.min(1,fat_raw));

    const str_raw =
      fatigue      *W.str.fatigue +
      norm.heures  *W.str.charge +
      norm.variab  *W.str.variab +
      norm.extStress*W.str.external;
    const stress=Math.max(0,Math.min(1,str_raw));

    const perf_raw=1+fatigue*W.perf.fatigue+norm.motiv*W.perf.motiv;
    const perf=Math.max(0,Math.min(1,perf_raw));

    const recovery=Math.max(0,D.RECOVERY-fatigue*.1);
    const errRisk =Math.max(0,Math.min(1,fatigue*.6+stress*.3+(1-perf)*.1));
    const overRisk=Math.max(0,Math.min(1,norm.surcharge*.5+norm.heures*.3+norm.consec*.2));

    return {
      fatigue:     Math.round(fatigue*100),
      stress:      Math.round(stress*100),
      performance: Math.round(perf*100),
      recovery:    Math.round(recovery*100),
      errorRisk:   Math.round(errRisk*100),
      overloadRisk:Math.round(overRisk*100),
      _f:fatigue, _s:stress, _p:perf, _r:recovery,
    };
  }

  /* ── Adaptive coefs ── */
  _loadCoefs(){
    const def={fh:1,fc:1};
    try{ const r=localStorage.getItem('DTE_COEFS'); if(r) return Object.assign(def,JSON.parse(r)); }catch(_){}
    return def;
  }
  saveCoefs(){ try{ localStorage.setItem('DTE_COEFS',JSON.stringify(this._coefs)); }catch(_){} }
  adapt(real,predicted,key){
    const err=real-predicted;
    this._coefs[key]=Math.max(.5,Math.min(2,this._coefs[key]-D.LR*err));
    this.saveCoefs();
  }
  resetCoefs(){ this._coefs={fh:1,fc:1}; this.saveCoefs(); }
  autoAdapt(rpgBurnout,predFatigue){
    if(!rpgBurnout) return;
    const real=rpgBurnout/100;
    this.adapt(real,predFatigue,'fh');
    this.adapt(real,predFatigue,'fc');
  }
}

global.DTEEngine=DTEEngine;
if(typeof module!=='undefined'&&module.exports) module.exports={DTEEngine};
}(typeof window!=='undefined'?window:global));