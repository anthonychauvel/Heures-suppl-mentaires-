// ===============================
//  FOX ENGINE – MODULE READER
//  Lecture READ-ONLY de M1 (heures/) et M2 (paye/)
//  via leurs vraies clés localStorage
// ===============================

class ModuleReader {
  constructor() {
    this.year = localStorage.getItem('ACTIVE_YEAR_SUFFIX') || new Date().getFullYear().toString();
    this.module1Data = this.loadModule1Data();
    this.module2Data = this.loadModule2Data();
  }

  // ─────────────────────────────────────────
  //  MODULE 1 — heures/
  //  Clés réelles : DATA_REPORT_{year}, ANNUAL_RATE_{year}, etc.
  // ─────────────────────────────────────────

  loadModule1Data() {
    try {
      const rawData     = JSON.parse(localStorage.getItem('DATA_REPORT_'    + this.year) || '{}');
      const rawReports  = JSON.parse(localStorage.getItem('REPORTS_REPORT_' + this.year) || '{}');
      const annualRate  = Number(localStorage.getItem('ANNUAL_RATE_'  + this.year)) || 10;
      const baseHebdo   = Number(localStorage.getItem('BASE_HEBDO_'   + this.year)) || 35;
      const periodMeta  = JSON.parse(localStorage.getItem('PERIOD_META_REPORT_' + this.year) || '{}');
      const exerciseStart = localStorage.getItem('EXERCISE_START_' + this.year) || '';

      // Calculer le total des heures sup depuis data[]
      // Chaque clé = date "YYYY-MM-DD", valeur = { extra, recup, absent }
      let totalExtra  = 0;
      let totalRecup  = 0;
      let totalAbsent = 0;
      const monthlyBreakdown = {};

      Object.entries(rawData).forEach(([dateKey, val]) => {
        if (typeof val !== 'object') return;
        const extra  = Number(val.extra  || 0);
        const recup  = Number(val.recup  || 0);
        const absent = Number(val.absent || 0);
        totalExtra  += extra;
        totalRecup  += recup;
        totalAbsent += absent;

        // Regrouper par mois YYYY-MM
        const month = dateKey.substring(0, 7);
        if (!monthlyBreakdown[month]) {
          monthlyBreakdown[month] = { extra: 0, recup: 0, absent: 0 };
        }
        monthlyBreakdown[month].extra  += extra;
        monthlyBreakdown[month].recup  += recup;
        monthlyBreakdown[month].absent += absent;
      });

      // Heure sup nette = extra - recup
      const netOvertime = totalExtra - totalRecup;

      // Mois courant
      const currentMonth = new Date().toISOString().substring(0, 7);
      const currentMonthData = monthlyBreakdown[currentMonth] || { extra: 0, recup: 0, absent: 0 };
      const currentMonthHours = baseHebdo + currentMonthData.extra - currentMonthData.recup;

      return {
        year:          this.year,
        baseHebdo,
        annualRate,
        totalExtra,
        totalRecup,
        netOvertime,
        monthlyHours:  currentMonthHours,
        monthlyBreakdown,
        exerciseStart,
        rawReports,
        periodMeta,
        hasData:       Object.keys(rawData).length > 0,
      };
    } catch (e) {
      console.warn('⚠️ Module Reader M1 : erreur lecture', e);
      return this._emptyM1();
    }
  }

  _emptyM1() {
    return {
      year: this.year, baseHebdo: 35, annualRate: 10,
      totalExtra: 0, totalRecup: 0, netOvertime: 0,
      monthlyHours: 35, monthlyBreakdown: {}, hasData: false,
    };
  }

  // ─────────────────────────────────────────
  //  MODULE 2 — paye/
  //  Clés réelles : CA_HS_TRACKER_V1_DATA_{year}, CA_HS_TRACKER_V1_SETTINGS
  // ─────────────────────────────────────────

  loadModule2Data() {
    try {
      const prefix   = 'CA_HS_TRACKER_V1';
      const yearData = JSON.parse(localStorage.getItem(`${prefix}_DATA_${this.year}`) || '{}');
      const settings = JSON.parse(localStorage.getItem(`${prefix}_SETTINGS`) || '{}');
      const snapshots = JSON.parse(localStorage.getItem(`${prefix}_SNAPSHOTS`) || '[]');

      // Calculer total annuel des heures sup depuis yearData
      // Structure : { "YYYY-MM": { hsPlus25, hsPlus50, ... } }
      let totalAnnual     = 0;
      let totalPlus25     = 0;
      let totalPlus50     = 0;
      const monthlyBreakdown = {};

      Object.entries(yearData).forEach(([key, month]) => {
        if (!/^\d{4}-\d{2}$/.test(key)) return;
        if (typeof month !== 'object') return;

        // Adapter selon les champs présents dans M2
        const hs25 = Number(month.hsPlus25  || month.hs25  || month.extra25 || 0);
        const hs50 = Number(month.hsPlus50  || month.hs50  || month.extra50 || 0);
        const total = hs25 + hs50;

        totalPlus25 += hs25;
        totalPlus50 += hs50;
        totalAnnual += total;
        monthlyBreakdown[key] = { hs25, hs50, total };
      });

      const contingentMax       = settings.contingentAnnuel || 220;
      const contingentRemaining = Math.max(0, contingentMax - totalAnnual);
      const contingentUsed      = Math.min(totalAnnual, contingentMax);

      return {
        year:              this.year,
        annualHours:       totalAnnual,
        totalPlus25,
        totalPlus50,
        contingentMax,
        contingentUsed,
        contingentRemaining,
        contingentPercent: Math.min(100, Math.round((totalAnnual / contingentMax) * 100)),
        monthlyBreakdown,
        settings,
        snapshots,
        hasData:           Object.keys(yearData).length > 0,
      };
    } catch (e) {
      console.warn('⚠️ Module Reader M2 : erreur lecture', e);
      return this._emptyM2();
    }
  }

  _emptyM2() {
    return {
      year: this.year, annualHours: 0, totalPlus25: 0, totalPlus50: 0,
      contingentMax: 220, contingentUsed: 0, contingentRemaining: 220,
      contingentPercent: 0, monthlyBreakdown: {}, hasData: false,
    };
  }

  // ─────────────────────────────────────────
  //  SYNC avec le gameState RPG
  // ─────────────────────────────────────────

  syncWithGameState() {
    this.year      = localStorage.getItem('ACTIVE_YEAR_SUFFIX') || new Date().getFullYear().toString();
    this.module1Data = this.loadModule1Data();
    this.module2Data = this.loadModule2Data();
  }

  // ─────────────────────────────────────────
  //  RÉSUMÉS (appelés par main-rpg.js)
  // ─────────────────────────────────────────

  getModule1Summary() {
    const m1 = this.module1Data;
    const alerts = [];

    if (m1.netOvertime > 200) alerts.push({ type: 'danger', msg: `🚨 ${m1.netOvertime}h sup accumulées` });
    else if (m1.netOvertime > 100) alerts.push({ type: 'warning', msg: `⚠️ ${m1.netOvertime}h sup — restez vigilant` });

    if (!m1.hasData) alerts.push({ type: 'info', msg: '📊 Aucune donnée M1 — saisissez vos heures dans le Module 1' });

    return {
      label:        'Module 1 — Suivi hebdomadaire',
      year:          m1.year,
      baseHebdo:     m1.baseHebdo,
      totalHours:    m1.monthlyHours,
      weeklyAverage: m1.baseHebdo,
      overtimeHours: m1.netOvertime,
      isCompliant:   m1.netOvertime < m1.annualRate * 10,
      alerts,
      hasData:       m1.hasData,
    };
  }

  getModule2Summary() {
    const m2 = this.module2Data;
    const alerts = [];

    if (m2.contingentPercent >= 100)
      alerts.push({ type: 'danger',  msg: `🚨 Contingent annuel atteint (${m2.annualHours}h / ${m2.contingentMax}h)` });
    else if (m2.contingentPercent >= 80)
      alerts.push({ type: 'warning', msg: `⚠️ ${m2.contingentPercent}% du contingent consommé` });

    if (!m2.hasData) alerts.push({ type: 'info', msg: '📊 Aucune donnée M2 — consultez le Module 2 Paie' });

    return {
      label:              'Module 2 — Paie & contingent',
      year:                m2.year,
      totalHours:          m2.annualHours,
      contingentUsed:      m2.contingentUsed,
      contingentRemaining: m2.contingentRemaining,
      contingentPercent:   m2.contingentPercent,
      contingentMax:       m2.contingentMax,
      overtimeRate:        m2.contingentPercent,
      isCompliant:         m2.annualHours <= m2.contingentMax,
      alerts,
      hasData:             m2.hasData,
    };
  }

  exportModuleData(moduleNum) {
    const data = moduleNum === 1 ? this.module1Data : this.module2Data;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `module${moduleNum}_export_${this.year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instance globale
const moduleReader = new ModuleReader();
console.log('✅ Module Reader connecté — M1:', moduleReader.module1Data.hasData ? 'données OK' : 'vide', '| M2:', moduleReader.module2Data.hasData ? 'données OK' : 'vide');

// ═══════════════════════════════════════════════════════════════
//  EXTENSION MULTI-ANNÉES  (ajout — ne modifie pas ce qui précède)
// ═══════════════════════════════════════════════════════════════

class ModuleReaderPro extends ModuleReader {

  // ── Détection automatique de toutes les années stockées ────────
  detectAllYears() {
    const years = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // M1 : DATA_REPORT_YYYY
      const m1Match = key && key.match(/^DATA_REPORT_(\d{4})$/);
      if (m1Match) years.add(m1Match[1]);
      // M2 : CA_HS_TRACKER_V1_DATA_YYYY
      const m2Match = key && key.match(/^CA_HS_TRACKER_V1_DATA_(\d{4})$/);
      if (m2Match) years.add(m2Match[1]);
    }
    return [...years].sort();
  }

  // ── Chargement M1 pour une année donnée ────────────────────────
  loadModule1ForYear(year) {
    try {
      const rawData    = JSON.parse(localStorage.getItem(`DATA_REPORT_${year}`)    || '{}');
      const annualRate = Number(localStorage.getItem(`ANNUAL_RATE_${year}`))  || 10;
      const baseHebdo  = Number(localStorage.getItem(`BASE_HEBDO_${year}`))   || 35;

      let totalExtra = 0, totalRecup = 0, totalAbsent = 0;
      const monthlyBreakdown = {};
      const weeklyData = {}; // clé = "YYYY-Www"

      Object.entries(rawData).forEach(([dateKey, val]) => {
        if (typeof val !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
        const extra  = Number(val.extra  || 0);
        const recup  = Number(val.recup  || 0);
        const absent = Number(val.absent || 0);
        totalExtra  += extra;
        totalRecup  += recup;
        totalAbsent += absent;

        const month = dateKey.substring(0, 7);
        if (!monthlyBreakdown[month]) monthlyBreakdown[month] = { extra: 0, recup: 0, absent: 0 };
        monthlyBreakdown[month].extra  += extra;
        monthlyBreakdown[month].recup  += recup;
        monthlyBreakdown[month].absent += absent;

        // Regrouper par semaine ISO
        const weekKey = this._getISOWeek(dateKey);
        if (!weeklyData[weekKey]) weeklyData[weekKey] = { extra: 0, recup: 0, totalHours: baseHebdo };
        weeklyData[weekKey].extra  += extra;
        weeklyData[weekKey].recup  += recup;
        weeklyData[weekKey].totalHours = baseHebdo + weeklyData[weekKey].extra - weeklyData[weekKey].recup;
      });

      return {
        year, baseHebdo, annualRate,
        totalExtra, totalRecup, netOvertime: totalExtra - totalRecup,
        totalAbsent, monthlyBreakdown, weeklyData,
        hasData: Object.keys(rawData).length > 0,
      };
    } catch(e) {
      return { year, baseHebdo: 35, annualRate: 10, totalExtra: 0, totalRecup: 0,
               netOvertime: 0, monthlyBreakdown: {}, weeklyData: {}, hasData: false };
    }
  }

  // ── Chargement M2 pour une année donnée ────────────────────────
  loadModule2ForYear(year) {
    try {
      const prefix   = 'CA_HS_TRACKER_V1';
      const yearData = JSON.parse(localStorage.getItem(`${prefix}_DATA_${year}`) || '{}');
      const settings = JSON.parse(localStorage.getItem(`${prefix}_SETTINGS`) || '{}');
      let totalAnnual = 0, totalPlus25 = 0, totalPlus50 = 0;
      const monthlyBreakdown = {};

      Object.entries(yearData).forEach(([key, month]) => {
        if (!/^\d{4}-\d{2}$/.test(key) || typeof month !== 'object') return;
        const hs25 = Number(month.hsPlus25 || month.hs25 || month.extra25 || 0);
        const hs50 = Number(month.hsPlus50 || month.hs50 || month.extra50 || 0);
        totalPlus25 += hs25; totalPlus50 += hs50; totalAnnual += hs25 + hs50;
        monthlyBreakdown[key] = { hs25, hs50, total: hs25 + hs50 };
      });

      const contingentMax = settings.contingentAnnuel || 220;
      return {
        year, totalAnnual, totalPlus25, totalPlus50, contingentMax,
        contingentPercent: Math.min(100, Math.round((totalAnnual / contingentMax) * 100)),
        monthlyBreakdown, hasData: Object.keys(yearData).length > 0,
      };
    } catch(e) {
      return { year, totalAnnual: 0, contingentMax: 220, contingentPercent: 0,
               monthlyBreakdown: {}, hasData: false };
    }
  }

  // ── Historique complet toutes années ───────────────────────────
  getFullHistory() {
    const years = this.detectAllYears();
    const history = {};
    years.forEach(y => {
      history[y] = {
        m1: this.loadModule1ForYear(y),
        m2: this.loadModule2ForYear(y),
      };
    });
    return { years, history };
  }

  // ── Analyse tendance sur N semaines glissantes ─────────────────
  getRollingAnalysis(weeksBack = 12) {
    const allYears  = this.detectAllYears();
    const allWeeks  = [];

    allYears.forEach(y => {
      const data = this.loadModule1ForYear(y);
      Object.entries(data.weeklyData).forEach(([wk, val]) => {
        allWeeks.push({ week: wk, year: y, ...val });
      });
    });

    allWeeks.sort((a, b) => a.week.localeCompare(b.week));
    const last = allWeeks.slice(-weeksBack);

    if (last.length === 0) return this._emptyRolling();

    const avgTotal  = last.reduce((s, w) => s + w.totalHours, 0) / last.length;
    const avgExtra  = last.reduce((s, w) => s + w.extra,      0) / last.length;
    const maxTotal  = Math.max(...last.map(w => w.totalHours));
    const violations = {
      over48    : last.filter(w => w.totalHours >= 48).length,
      over44avg : avgTotal >= 44,
      over35    : last.filter(w => w.totalHours > 35).length,
    };

    // Tendance : compare première moitié vs deuxième moitié
    const half   = Math.floor(last.length / 2);
    const avgOld = half > 0 ? last.slice(0, half).reduce((s, w) => s + w.totalHours, 0) / half : avgTotal;
    const avgNew = half > 0 ? last.slice(half).reduce(  (s, w) => s + w.totalHours, 0) / (last.length - half) : avgTotal;
    const trend  = avgNew > avgOld + 1 ? 'hausse' : avgNew < avgOld - 1 ? 'baisse' : 'stable';

    return { avgTotal, avgExtra, maxTotal, violations, trend,
             weeksAnalyzed: last.length, weeks: last };
  }

  _emptyRolling() {
    return { avgTotal: 35, avgExtra: 0, maxTotal: 35,
             violations: { over48: 0, over44avg: false, over35: 0 },
             trend: 'stable', weeksAnalyzed: 0, weeks: [] };
  }

  // ── Score Burn-Out (0-100) ─────────────────────────────────────
  getBurnoutScore() {
    const rolling  = this.getRollingAnalysis(12);
    const history  = this.getFullHistory();
    let score = 0;

    // Moyenne hebdo > 35 → +2 pts/h au-dessus
    const overshoot = Math.max(0, rolling.avgTotal - 35);
    score += Math.min(30, overshoot * 2);

    // Semaines à 48h (violations absolues) → +8 pts chacune (cap 24)
    score += Math.min(24, rolling.violations.over48 * 8);

    // Tendance à la hausse → +10
    if (rolling.trend === 'hausse') score += 10;

    // Moyenne > 44h sur la période → +15
    if (rolling.violations.over44avg) score += 15;

    // Présence sur plusieurs années de dépassements → +5
    const yearsWithOvertime = Object.values(history.history)
      .filter(y => y.m1.netOvertime > 50).length;
    score += Math.min(10, yearsWithOvertime * 5);

    // Absences élevées (signe de fatigue) → +6
    const totalAbsent = Object.values(history.history)
      .reduce((s, y) => s + (y.m1.totalAbsent || 0), 0);
    if (totalAbsent > 20) score += 6;

    return {
      score:       Math.min(100, Math.round(score)),
      level:       score < 20 ? 'sain' : score < 40 ? 'vigilance' :
                   score < 60 ? 'risque' : score < 80 ? 'danger' : 'critique',
      color:       score < 20 ? '#4CAF50' : score < 40 ? '#FF8C42' :
                   score < 60 ? '#FF6B35' : score < 80 ? '#E53935' : '#B71C1C',
      details: { overshoot, violations: rolling.violations, trend: rolling.trend, yearsWithOvertime },
    };
  }

  // ── Utilitaire : numéro de semaine ISO ─────────────────────────
  _getISOWeek(dateStr) {
    const d    = new Date(dateStr);
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day  = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  // ═══════════════════════════════════════════════════════════════
  //  CUMUL MULTI-ANNÉES — FUSION INTELLIGENTE PÉRIODE PAR PÉRIODE
  //  Pour chaque mois de chaque année, on choisit la meilleure
  //  source disponible → préserve le cumul même si on change de
  //  module en cours d'année ou entre les années.
  //
  //  Règle anti-doublon par mois :
  //  - M1 seul présent    → on prend M1
  //  - M2 seul présent    → on prend M2
  //  - Les deux présents  → on prend celui du choix manuel,
  //                         sinon celui avec le plus d'entrées
  //  - Aucun              → mois ignoré
  // ═══════════════════════════════════════════════════════════════

  getCumulatedHours() {
    const years   = this.detectAllYears();
    const manual  = localStorage.getItem('FOX_SOURCE_OVERRIDE'); // M1, M2 ou null

    let totalExtra  = 0;
    let totalRecup  = 0;
    let totalAbsent = 0;
    let totalPlus25 = 0;
    let totalPlus50 = 0;
    let weekCount   = 0;
    let monthCount  = 0;
    const perYear   = {};
    // Source globale = 'fusion' ou la source forcée
    const globalSource = manual || 'fusion';

    years.forEach(y => {
      const m1 = this.loadModule1ForYear(y);
      const m2 = this.loadModule2ForYear(y);

      // Extraire les données M1 brutes par mois
      const m1Raw = this._safeJSON('DATA_REPORT_' + y, {});
      // Extraire les données M2 brutes par mois
      const m2Raw = this._safeJSON('CA_HS_TRACKER_V1_DATA_' + y, {});

      // Construire un index des mois couverts par chaque module
      const m1Months = {}; // { 'YYYY-MM': { heures } }
      const m2Months = {}; // { 'YYYY-MM': { heures } }

      // M1 : regrouper les jours par mois
      Object.entries(m1Raw).forEach(([date, day]) => {
        const m = date.substring(0, 7); // YYYY-MM
        if (!m1Months[m]) m1Months[m] = { extra: 0, recup: 0, absent: 0, days: 0 };
        m1Months[m].extra  += parseFloat(day.sup25 || 0) + parseFloat(day.sup50 || 0);
        m1Months[m].recup  += parseFloat(day.recup || 0);
        m1Months[m].absent += parseFloat(day.absent || 0);
        m1Months[m].days   += 1;
      });

      // M2 : chaque entrée est déjà mensuelle
      Object.entries(m2Raw).forEach(([monthKey, data]) => {
        // monthKey peut être 'YYYY-MM' ou un index numérique
        const m = monthKey.length === 7 ? monthKey : `${y}-${String(Object.keys(m2Raw).indexOf(monthKey)+1).padStart(2,'0')}`;
        if (!m2Months[m]) m2Months[m] = { plus25: 0, plus50: 0 };
        m2Months[m].plus25 += parseFloat(data.hs25 || data.heures25 || data.totalPlus25 || 0);
        m2Months[m].plus50 += parseFloat(data.hs50 || data.heures50 || data.totalPlus50 || 0);
      });

      // Union de tous les mois couverts
      const allMonths = new Set([...Object.keys(m1Months), ...Object.keys(m2Months)]);
      let yearExtra = 0, yearRecup = 0, yearAbsent = 0, yearPlus25 = 0, yearPlus50 = 0;
      const monthDetail = {};

      allMonths.forEach(m => {
        const hasM1 = !!m1Months[m];
        const hasM2 = !!m2Months[m];

        let src;
        if (manual) {
          // Choix forcé : si le module forcé n'a pas de données ce mois, on prend l'autre
          if (manual === 'M1') src = hasM1 ? 'M1' : (hasM2 ? 'M2' : null);
          else                 src = hasM2 ? 'M2' : (hasM1 ? 'M1' : null);
        } else {
          // Auto : si un seul présent → on le prend, si les deux → M1 (plus granulaire)
          if (hasM1 && hasM2)  src = 'M1';
          else if (hasM1)      src = 'M1';
          else if (hasM2)      src = 'M2';
          else                 src = null;
        }

        if (!src) return;

        monthCount++;
        if (src === 'M1') {
          const d = m1Months[m];
          yearExtra  += d.extra;
          yearRecup  += d.recup;
          yearAbsent += d.absent;
          monthDetail[m] = { src: 'M1', extra: d.extra };
        } else {
          const d = m2Months[m];
          yearPlus25 += d.plus25;
          yearPlus50 += d.plus50;
          const tot   = d.plus25 + d.plus50;
          yearExtra  += tot;
          monthDetail[m] = { src: 'M2', hs25: d.plus25, hs50: d.plus50 };
        }
      });

      // Récupération M1 si pas prise en compte via les mois
      if (!Object.keys(m1Months).length && m1.totalRecup) yearRecup += m1.totalRecup;
      weekCount += Object.keys(m1.weeklyData || {}).length;

      totalExtra  += yearExtra;
      totalRecup  += yearRecup;
      totalAbsent += yearAbsent;
      totalPlus25 += yearPlus25;
      totalPlus50 += yearPlus50;

      const net = yearExtra - yearRecup;
      perYear[y] = {
        source    : globalSource,
        net,
        extra     : yearExtra,
        recup     : yearRecup,
        hs25      : yearPlus25,
        hs50      : yearPlus50,
        months    : monthDetail,
        m1Coverage: Object.keys(m1Months).length,
        m2Coverage: Object.keys(m2Months).length,
      };
    });

    const netOvertime = totalExtra - totalRecup;

    return {
      source      : globalSource,
      years,
      totalExtra,
      totalRecup,
      totalAbsent,
      totalPlus25,
      totalPlus50,
      netOvertime,
      weekCount,
      monthCount,
      contingentMax         : 220,
      contingentUsedCurrent : totalPlus25 + totalPlus50,
      perYear,
    };
  }

  // Utilitaire JSON sécurisé
  _safeJSON(key, def) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || def; }
    catch(e) { return def; }
  }

  // ═══════════════════════════════════════════════════════════════
  //  SÉLECTION ANTI-TRICHE
  //  Compare la densité de données M1 vs M2 sur TOUTES les années.
  //  Retourne 'M1' ou 'M2' — celui qui a le plus d'entrées.
  //  Si les deux sont vides → 'M1' par défaut (plus granulaire).
  //  Si les deux ont des données → celui avec le plus d'entrées.
  //  Impossible d'utiliser les deux à la fois.
  // ═══════════════════════════════════════════════════════════════

  selectPrimaryModule() {
    // ── Choix manuel (prioritaire sur l'auto) ─────────────────────
    const manual = localStorage.getItem('FOX_SOURCE_OVERRIDE');
    if (manual === 'M1' || manual === 'M2') {
      if (!this._primaryLogged) {
        console.log(`🦊 Source forcée manuellement : ${manual}`);
        this._primaryLogged = true;
      }
      return manual;
    }

    // ── Sélection automatique par densité de données ──────────────
    const years = this.detectAllYears();
    let m1Entries = 0;
    let m2Entries = 0;

    years.forEach(y => {
      try {
        const raw = JSON.parse(localStorage.getItem('DATA_REPORT_' + y) || '{}');
        m1Entries += Object.keys(raw).length;
      } catch(e) {}
      try {
        const raw = JSON.parse(localStorage.getItem('CA_HS_TRACKER_V1_DATA_' + y) || '{}');
        m2Entries += Object.keys(raw).length * 20;
      } catch(e) {}
    });

    const winner = m2Entries > m1Entries ? 'M2' : 'M1';

    if (!this._primaryLogged) {
      console.log(`🦊 Anti-triche auto — M1: ${m1Entries} · M2: ${m2Entries} (×20) → source: ${winner}`);
      this._primaryLogged = true;
    }

    return winner;
  }

  // ── Forcer manuellement la source ─────────────────────────────
  setSourceOverride(source) {
    if (source === 'auto') {
      localStorage.removeItem('FOX_SOURCE_OVERRIDE');
      console.log('🦊 Source repassée en automatique');
    } else if (source === 'M1' || source === 'M2') {
      localStorage.setItem('FOX_SOURCE_OVERRIDE', source);
      console.log(`🦊 Source forcée : ${source}`);
    }
    this._primaryLogged = false;
  }

  getSourceMode() {
    const manual = localStorage.getItem('FOX_SOURCE_OVERRIDE');
    return manual ? 'manuel' : 'auto';
  }

  // ── Alias pratique : résumé cumulé pour le HUD / RPG ───────────
  getCumulatedSummary() {
    const cum    = this.getCumulatedHours();
    const bo     = this.getBurnoutScore();
    const rolling = this.getRollingAnalysis(12);

    return {
      source          : cum.source,
      years           : cum.years,
      totalNetOvertime: cum.netOvertime,
      totalPlus25     : cum.totalPlus25,
      totalPlus50     : cum.totalPlus50,
      weekCount       : cum.weekCount,
      monthCount      : cum.monthCount,
      burnoutScore    : bo.score,
      burnoutLevel    : bo.level,
      trend           : rolling.trend,
      avgWeekly       : rolling.avgTotal,
      perYear         : cum.perYear,
      // XP bonus multi-années : +500 XP par année de données
      xpBonus         : cum.years.length * 500,
    };
  }

  // ── Override getBurnoutScore pour utiliser le cumul ─────────────
  // (remplace la version de la classe parente qui ne regardait qu'une année)
  getBurnoutScore() {
    const cum    = this.getCumulatedHours();
    const rolling = this.getRollingAnalysis(12);
    let score = 0;

    // Dépassement moyen hebdo
    const overshoot = Math.max(0, rolling.avgTotal - 35);
    score += Math.min(30, overshoot * 2);

    // Semaines à 48h+
    score += Math.min(24, (rolling.violations.over48 || 0) * 8);

    // Tendance haussière
    if (rolling.trend === 'hausse') score += 10;

    // Moyenne > 44h
    if (rolling.violations.over44avg) score += 15;

    // Années avec overtime > 50h NET (signal d'exposition chronique)
    const yearsWithOvertime = Object.values(cum.perYear)
      .filter(y => (y.net || 0) > 50).length;
    score += Math.min(15, yearsWithOvertime * 5);

    // Absences élevées (fatigue accumulée sur toutes les années)
    if (cum.totalAbsent > 20) score += 6;

    // Bonus si beaucoup d'années avec des données (longue exposition)
    if (cum.years.length >= 3) score += 5;
    if (cum.years.length >= 5) score += 5;

    const final = Math.min(100, Math.round(score));
    return {
      score  : final,
      level  : final < 20 ? 'sain'      : final < 40 ? 'vigilance' :
               final < 60 ? 'risque'    : final < 80 ? 'danger'    : 'critique',
      color  : final < 20 ? '#4CAF50'   : final < 40 ? '#FF8C42'   :
               final < 60 ? '#FF6B35'   : final < 80 ? '#E53935'   : '#B71C1C',
      details: {
        overshoot, yearsWithOvertime,
        violations : rolling.violations,
        trend      : rolling.trend,
        years      : cum.years.length,
        source     : cum.source,
      },
    };
  }

  // ── Export historique complet toutes années ────────────────────
  exportFullHistory() {
    const data    = this.getFullHistory();
    const cumul   = this.getCumulatedHours();
    const burnout = this.getBurnoutScore();
    const rolling = this.getRollingAnalysis();
    const summary = this.getCumulatedSummary();
    const payload = {
      exportDate   : new Date().toISOString(),
      antiCheat    : { primaryModule: cumul.source, reason: 'module avec le plus d\'entrées sélectionné automatiquement' },
      cumulatedHours: cumul,
      summary,
      burnoutScore : burnout,
      rolling,
      ...data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `fox_historique_complet_${new Date().getFullYear()}.json`;
    a.click(); URL.revokeObjectURL(url);
  }
}

// ── Instance globale ──────────────────────────────────────────────
const moduleReader = new ModuleReaderPro();

// Log de démarrage : années, source anti-triche, score burn-out cumulé
const _foxInitYears   = moduleReader.detectAllYears();
const _foxInitPrimary = moduleReader.selectPrimaryModule();
const _foxInitBurnout = moduleReader.getBurnoutScore();
console.log(
  `✅ Module Reader PRO\n` +
  `   Années détectées : ${_foxInitYears.join(', ') || 'aucune'}\n` +
  `   Source anti-triche : ${_foxInitPrimary} (sélection automatique)\n` +
  `   Score Burn-Out cumulé : ${_foxInitBurnout.score}/100 (${_foxInitBurnout.level})`
);
