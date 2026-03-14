// ================================================================
//  VUE ANALYSE PRO — vue-pro.js
//  Tableau de bord sobre — analyse légale et conseils
//  Public cible : utilisateurs 40+ qui veulent du concret,
//  sans gamification ni mascotte.
// ================================================================

(function() {
  'use strict';

  // ── Utilitaires ─────────────────────────────────────────────────
  function fmtH(h) {
    if (!h || isNaN(h)) return '0h';
    var t = Math.round(Math.abs(parseFloat(h)) * 10) / 10;
    var hh = Math.floor(t);
    var mm = Math.round((t - hh) * 60);
    return mm > 0 ? hh + 'h' + String(mm).padStart(2,'0') : hh + 'h';
  }

  function readM1(yr) {
    try { return JSON.parse(localStorage.getItem('DATA_REPORT_' + yr) || '{}'); } catch(e) { return {}; }
  }
  function readM2(yr) {
    try { return JSON.parse(localStorage.getItem('CA_HS_TRACKER_V1_DATA_' + yr) || '{}'); } catch(e) { return {}; }
  }
  function getActiveYear() {
    return localStorage.getItem('ACTIVE_YEAR_SUFFIX') || String(new Date().getFullYear());
  }
  function getAllYears() {
    var yrs = [];
    Object.keys(localStorage).forEach(function(k) {
      var m = k.match(/\d{4}$/);
      if ((k.indexOf('DATA_REPORT_') === 0 || k.indexOf('CA_HS_TRACKER_V1_DATA_') === 0) && m)
        if (yrs.indexOf(m[0]) < 0) yrs.push(m[0]);
    });
    return yrs.sort();
  }

  // ── Données ─────────────────────────────────────────────────────
  function calcAnnualHS(yr) {
    var total = 0; var source = 'aucune'; var hasM1 = false;
    var m1 = readM1(yr);
    Object.keys(m1).forEach(function(k) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && (m1[k].extra||0) > 0) { total += m1[k].extra; hasM1 = true; }
    });
    if (hasM1) return { total: Math.round(total*10)/10, source: 'M1' };
    var m2 = readM2(yr);
    Object.keys(m2).forEach(function(mk) {
      var mv = m2[mk];
      if (mv && mv.days) { Object.keys(mv.days).forEach(function(d) { total += (mv.days[d]||0); source = 'M2'; }); }
    });
    return { total: Math.round(total*10)/10, source: source };
  }

  function calcTodayHS() {
    var yr = getActiveYear(); var now = new Date();
    var dk = yr + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var m1 = readM1(yr);
    if (m1[dk] && (m1[dk].extra||0) > 0) return { extra: m1[dk].extra, total: m1[dk].total||0 };
    var mk = yr + '-' + String(now.getMonth()+1).padStart(2,'0');
    var m2 = readM2(yr);
    if (m2[mk] && m2[mk].days && m2[mk].days[String(now.getDate())])
      return { extra: m2[mk].days[String(now.getDate())], total: 0 };
    return { extra: 0, total: 0 };
  }

  function getMonthlyData(yr) {
    var months = Array(12).fill(0);
    var m1 = readM1(yr);
    Object.keys(m1).forEach(function(k) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      var mo = parseInt(k.split('-')[1]) - 1;
      if ((m1[k].extra||0) > 0) months[mo] += m1[k].extra;
    });
    var m2 = readM2(yr);
    Object.keys(m2).forEach(function(mk) {
      var mv = m2[mk]; if (!mv || !mv.days) return;
      var mo = parseInt(mk.split('-')[1]) - 1;
      if (months[mo] > 0) return;
      Object.keys(mv.days).forEach(function(d) { months[mo] += (mv.days[d]||0); });
    });
    return months.map(function(v) { return Math.round(v*10)/10; });
  }

  function getFullAnalysis() {
    if (typeof _analyzeLegalSituation === 'function') {
      try { return _analyzeLegalSituation(); } catch(e) { return null; }
    }
    return null;
  }

  // ── Conseils contextuels ─────────────────────────────────────────
  // Pas de Kitsune, pas de RPG — conseils factuels basés sur la situation réelle
  function buildAdvice(a, annual, today, burnout) {
    var items = [];
    var CONTINGENT = 220;
    var pct = annual.total > 0 ? Math.round(annual.total / CONTINGENT * 100) : 0;

    if (!a && annual.total === 0) {
      items.push({
        icon: 'ℹ️',
        titre: 'Aucune donnée enregistrée',
        texte: 'Commencez à saisir vos heures dans le Module Annuel (M1) ou Mensuel (M2) pour obtenir une analyse personnalisée.'
      });
      return items;
    }

    // Violations critiques
    if (a && a.daily && a.daily.hasDailyCrit) {
      items.push({
        icon: '🚨', urgent: true,
        titre: 'Journée de ' + fmtH(a.daily.maxDayTotal) + ' détectée',
        texte: 'La durée maximale journalière est de 10h, extensible à 12h uniquement par accord collectif (Art. L3121-18). Une journée de ' + fmtH(a.daily.maxDayTotal) + ' dépasse ce seuil.',
        loi: 'Art. L3121-18'
      });
    }
    if (a && a.weekly && a.weekly.hasWeekViol) {
      items.push({
        icon: '🚨', urgent: true,
        titre: 'Semaine de ' + fmtH(a.weekly.maxWeekTotal) + ' détectée',
        texte: 'Le plafond absolu de 48h/semaine a été dépassé. Aucun accord individuel ne peut y déroger (Art. L3121-20). Cette semaine peut faire l\'objet d\'un rappel de salaire ou d\'un signalement à l\'inspection du travail.',
        loi: 'Art. L3121-20'
      });
    }
    if (a && a.annual && a.annual.hasContingentDanger) {
      items.push({
        icon: '🚨', urgent: true,
        titre: 'Contingent annuel dépassé',
        texte: 'Vous avez effectué ' + fmtH(annual.total) + ' d\'heures supplémentaires, soit ' + pct + '% du contingent légal de 220h. Au-delà, des contreparties obligatoires en repos sont dues de plein droit (Art. L3121-33).',
        loi: 'Art. L3121-33'
      });
    }

    // Alertes
    if (a && a.daily && a.daily.hasDailyRisk && !a.daily.hasDailyCrit) {
      items.push({
        icon: '⚠️',
        titre: 'Journée longue enregistrée (' + fmtH(a.daily.maxDayTotal) + ')',
        texte: 'Des journées entre 10h et 12h sont possibles par accord collectif mais doivent rester exceptionnelles. Vérifiez que votre convention collective l\'autorise explicitement.',
        loi: 'Art. L3121-18'
      });
    }
    if (a && a.weekly && a.weekly.hasAvgViol) {
      items.push({
        icon: '⚠️',
        titre: 'Moyenne hebdomadaire > 44h sur 12 semaines',
        texte: 'La moyenne de ' + fmtH(a.weekly.maxAvg12) + ' sur une période glissante de 12 semaines dépasse le seuil légal de 44h. C\'est une violation de l\'Art. L3121-22, même si aucune semaine isolée ne dépasse 48h.',
        loi: 'Art. L3121-22'
      });
    }
    if (a && a.weekly && a.weekly.hasWeekAlert && !a.weekly.hasWeekViol) {
      items.push({
        icon: '⚠️',
        titre: 'Semaine entre 44h et 48h',
        texte: 'Vous avez eu une semaine à ' + fmtH(a.weekly.maxWeekTotal) + '. C\'est légalement possible mais contribue à la moyenne sur 12 semaines (seuil : 44h). Surveillez la tendance.',
        loi: 'Art. L3121-22'
      });
    }
    if (pct >= 75 && pct < 100) {
      items.push({
        icon: '⚠️',
        titre: 'Contingent annuel à ' + pct + '%',
        texte: 'Vous avez réalisé ' + fmtH(annual.total) + ' sur les 220h de contingent légal. À ce rythme, le dépassement est probable avant la fin de l\'année. Anticipez les contreparties en repos.',
        loi: 'Art. L3121-30'
      });
    }

    // Burn-out
    if (burnout >= 70) {
      items.push({
        icon: '🔴',
        titre: 'Score de surmenage élevé',
        texte: 'Votre indicateur de surmenage est à ' + burnout + '/100. L\'employeur a une obligation légale de résultat sur votre santé (Art. L4121-1). Une consultation du médecin du travail est recommandée — elle est gratuite, confidentielle et indépendante de votre employeur.',
        loi: 'Art. L4121-1'
      });
    } else if (burnout >= 40) {
      items.push({
        icon: '🟠',
        titre: 'Indicateur de surmenage modéré (' + burnout + '/100)',
        texte: 'Le niveau actuel appelle à la vigilance. Veillez à respecter les temps de repos obligatoires : 11h entre deux prises de poste (Art. L3131-1) et 35h consécutives par semaine (Art. L3132-2).',
        loi: 'Art. L3131-1'
      });
    }

    // Aujourd'hui
    if (today.extra > 2) {
      items.push({
        icon: '📋',
        titre: 'Journée de ' + fmtH(today.total || (7 + today.extra)) + ' aujourd\'hui',
        texte: fmtH(today.extra) + ' d\'heures supplémentaires saisies. Au taux légal, cela représente une majoration de ' + (today.extra <= 8 ? '25%' : '50%') + '. Ces heures constituent une créance sur votre employeur réclamable jusqu\'à 3 ans après leur réalisation (Art. L3245-1).',
        loi: 'Art. L3245-1'
      });
    }

    // Situation saine
    if (!items.length && annual.total > 0) {
      items.push({
        icon: '✅',
        titre: 'Situation dans les limites légales',
        texte: fmtH(annual.total) + ' d\'heures supplémentaires enregistrées cette année (' + pct + '% du contingent de 220h). Aucune violation détectée. Continuez à documenter régulièrement.'
      });
    }

    // Conseil systématique sur la documentation
    if (annual.total > 0) {
      items.push({
        icon: '📌',
        titre: 'Rappel : prescription 3 ans',
        texte: 'Les heures supplémentaires impayées sont réclamables jusqu\'à 3 ans après leur réalisation. Exportez régulièrement vos données pour conserver un historique portable et opposable.',
        loi: 'Art. L3245-1'
      });
    }

    return items;
  }

  // ── Graphique SVG sobre ──────────────────────────────────────────
  function renderBarChart(months, yr) {
    var MOIS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
    var max  = Math.max.apply(null, months.concat([1]));
    var nowMo = (new Date().getFullYear() + '') === yr ? new Date().getMonth() : -1;
    var W = 12; var GAP = 4; var H = 80;
    var totalW = 12 * (W + GAP) - GAP;
    var out = '<svg viewBox="0 0 ' + totalW + ' ' + (H + 20) + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;display:block;margin:0 auto;">';
    // Ligne 44h
    var line44 = H - Math.round(44 / max * H);
    if (max > 44) {
      out += '<line x1="0" y1="' + line44 + '" x2="' + totalW + '" y2="' + line44 + '" stroke="#E5393522" stroke-width="1" stroke-dasharray="3,3"/>';
    }
    months.forEach(function(val, i) {
      var bh = val > 0 ? Math.max(3, Math.round(val / max * H)) : 2;
      var x  = i * (W + GAP);
      var y  = H - bh;
      var col;
      if (i === nowMo) col = '#e0e0e0';
      else if (val > 44) col = '#E53935';
      else if (val > 20) col = '#607D8B';
      else if (val > 0)  col = '#455A64';
      else col = '#1C2B35';
      out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + bh + '" rx="2" fill="' + col + '"/>';
      if (val > 0) {
        out += '<text x="' + (x + W/2) + '" y="' + (y - 3) + '" text-anchor="middle" font-size="5.5" fill="#607D8B">' + (val % 1 ? val.toFixed(1) : val) + '</text>';
      }
      out += '<text x="' + (x + W/2) + '" y="' + (H + 13) + '" text-anchor="middle" font-size="6.5" fill="' + (i===nowMo?'#e0e0e0':'#455A64') + '">' + MOIS[i] + '</text>';
    });
    out += '</svg>';
    return out;
  }

  // ── Historique multi-années ──────────────────────────────────────
  function renderYearHistory() {
    var yrs = getAllYears();
    if (!yrs.length) return '<div style="color:#455A64;font-size:0.8rem;">Aucun historique disponible.</div>';
    return yrs.reverse().map(function(yr) {
      var a = calcAnnualHS(yr);
      var pct = a.total > 0 ? Math.min(Math.round(a.total/220*100), 100) : 0;
      var col = pct >= 100 ? '#E53935' : pct >= 75 ? '#FF9800' : pct > 0 ? '#607D8B' : '#2D3F4A';
      return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.04);">'
        + '<div style="font-size:0.85rem;color:#90A4AE;font-weight:600;min-width:36px;">' + yr + '</div>'
        + '<div style="flex:1;background:rgba(255,255,255,0.05);border-radius:3px;height:6px;">'
        + '<div style="background:' + col + ';width:' + pct + '%;height:6px;border-radius:3px;"></div>'
        + '</div>'
        + '<div style="font-size:0.82rem;color:#90A4AE;min-width:50px;text-align:right;">' + fmtH(a.total) + '</div>'
        + '<div style="font-size:0.7rem;color:' + col + ';min-width:28px;text-align:right;">' + pct + '%</div>'
        + '</div>';
    }).join('');
  }

  // ── Bloc conseil ────────────────────────────────────────────────
  function renderAdviceBlock(item) {
    var borderCol = item.urgent ? '#E53935' : item.icon === '✅' ? '#2E7D32' : item.icon === '📌' ? '#37474F' : '#B0BEC5';
    var bgCol = item.urgent ? 'rgba(229,57,53,0.05)' : item.icon === '✅' ? 'rgba(46,125,50,0.05)' : 'rgba(255,255,255,0.02)';
    return '<div style="background:' + bgCol + ';border:1px solid rgba(255,255,255,0.06);border-left:3px solid ' + borderCol + ';border-radius:0 10px 10px 0;padding:13px 14px;margin-bottom:10px;">'
      + '<div style="display:flex;align-items:flex-start;gap:10px;">'
      + '<div style="font-size:1.1rem;margin-top:1px;flex-shrink:0;">' + item.icon + '</div>'
      + '<div style="flex:1;">'
      + '<div style="font-weight:700;color:#B0BEC5;font-size:0.85rem;margin-bottom:5px;">' + item.titre + '</div>'
      + '<div style="color:#607D8B;font-size:0.78rem;line-height:1.6;">' + item.texte + '</div>'
      + (item.loi ? '<div style="margin-top:6px;"><span style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:2px 7px;font-size:0.65rem;color:#455A64;letter-spacing:0.5px;">' + item.loi + '</span></div>' : '')
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // ── Bloc stat ────────────────────────────────────────────────────
  function statBox(label, value, sub, highlight) {
    return '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">'
      + '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;">' + label + '</div>'
      + '<div style="font-size:1.6rem;font-weight:700;color:' + (highlight||'#90A4AE') + ';line-height:1.1;">' + value + '</div>'
      + (sub ? '<div style="font-size:0.7rem;color:#455A64;margin-top:4px;">' + sub + '</div>' : '')
      + '</div>';
  }

  // ── Rendu principal ──────────────────────────────────────────────
  function renderVuePro() {
    var container = document.getElementById('vue-pro');
    if (!container) return;

    var yr     = getActiveYear();
    var annual = calcAnnualHS(yr);
    var today  = calcTodayHS();
    var months = getMonthlyData(yr);
    var analy  = getFullAnalysis();
    var burnout= 0;
    try { var gs = JSON.parse(localStorage.getItem('FOX_GAME_STATE')||'{}'); burnout = gs.burnout||0; } catch(e) {}
    var advice = buildAdvice(analy, annual, today, burnout);
    var pct    = annual.total > 0 ? Math.min(Math.round(annual.total/220*100), 100) : 0;
    var statusCol = pct >= 100 ? '#E53935' : pct >= 75 ? '#FF9800' : pct >= 50 ? '#FFD700' : annual.total > 0 ? '#4CAF50' : '#37474F';
    var nightC = parseInt(localStorage.getItem('FOX_NIGHT_COUNT')||'0') + parseInt(localStorage.getItem('FOX_NIGHT_WEEKEND_COUNT')||'0');
    var weekC  = parseInt(localStorage.getItem('FOX_WEEKEND_COUNT')||'0') + parseInt(localStorage.getItem('FOX_NIGHT_WEEKEND_COUNT')||'0');
    var now    = new Date();
    var dateStr= now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    var hasAlert = advice.some(function(a){ return a.urgent; });

    container.innerHTML = ''

      // ── HEADER ──────────────────────────────────────────────────
      + '<div style="position:sticky;top:0;z-index:20;background:#06080f;border-bottom:1px solid rgba(255,255,255,0.05);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">'
      +   '<div>'
      +     '<div style="font-weight:700;font-size:0.95rem;color:#90A4AE;letter-spacing:0.5px;">TABLEAU DE BORD</div>'
      +     '<div style="font-size:0.65rem;color:#2D3F4A;margin-top:1px;text-transform:capitalize;">' + dateStr + '</div>'
      +   '</div>'
      +   '<button onclick="VuePro.hide()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#546E7A;border-radius:8px;padding:7px 14px;font-size:0.75rem;cursor:pointer;font-family:inherit;letter-spacing:0.5px;">← Retour</button>'
      + '</div>'

      + '<div style="padding:18px;max-width:500px;margin:0 auto;">'

      // ── ALERTE URGENTE (si applicable) ──────────────────────────
      + (hasAlert ? '<div style="background:rgba(229,57,53,0.08);border:1px solid rgba(229,57,53,0.25);border-radius:10px;padding:11px 14px;margin-bottom:18px;font-size:0.8rem;color:#EF9A9A;display:flex;align-items:center;gap:10px;"><span style="font-size:1.1rem;">🚨</span>Violations légales détectées — consultez les recommandations ci-dessous.</div>' : '')

      // ── CHIFFRES CLÉS ────────────────────────────────────────────
      + '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Synthèse ' + yr + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">'
      +   statBox('Heures sup.', fmtH(annual.total), 'Source ' + annual.source, statusCol)
      +   statBox('Contingent', pct + '%', 'Plafond 220h/an', statusCol)
      +   statBox('Aujourd\'hui', today.extra > 0 ? fmtH(today.extra) : '—', today.extra > 0 ? 'Journée ' + fmtH(today.total||7+today.extra) : 'Aucune saisie', today.extra > 0 ? '#90A4AE' : '#37474F')
      +   statBox('Surmenage', burnout + '/100', burnout > 60 ? 'Niveau élevé' : burnout > 30 ? 'Modéré' : 'Satisfaisant', burnout > 60 ? '#E53935' : burnout > 30 ? '#FF9800' : '#4CAF50')
      + '</div>'

      // ── BARRE CONTINGENT ─────────────────────────────────────────
      + '<div style="margin-bottom:20px;">'
      +   '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
      +     '<div style="font-size:0.68rem;color:#37474F;letter-spacing:1px;text-transform:uppercase;">Contingent annuel</div>'
      +     '<div style="font-size:0.72rem;color:' + statusCol + ';">' + fmtH(annual.total) + ' / 220h</div>'
      +   '</div>'
      +   '<div style="background:rgba(255,255,255,0.04);border-radius:4px;height:8px;">'
      +     '<div style="background:' + statusCol + ';width:' + pct + '%;height:8px;border-radius:4px;transition:width 0.4s;"></div>'
      +   '</div>'
      +   '<div style="display:flex;justify-content:space-between;margin-top:4px;">'
      +     '<div style="font-size:0.6rem;color:#2D3F4A;">0h</div>'
      +     '<div style="font-size:0.6rem;color:#2D3F4A;">110h — 50%</div>'
      +     '<div style="font-size:0.6rem;color:#37474F;">220h</div>'
      +   '</div>'
      + '</div>'

      // ── GRAPHIQUE ───────────────────────────────────────────────
      + '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;margin-bottom:20px;">'
      +   '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Répartition mensuelle</div>'
      +   renderBarChart(months, yr)
      +   '<div style="display:flex;gap:14px;justify-content:center;margin-top:10px;flex-wrap:wrap;">'
      +     '<div style="display:flex;align-items:center;gap:5px;font-size:0.65rem;color:#455A64;"><div style="width:10px;height:6px;background:#e0e0e0;border-radius:2px;"></div>Mois en cours</div>'
      +     '<div style="display:flex;align-items:center;gap:5px;font-size:0.65rem;color:#455A64;"><div style="width:10px;height:6px;background:#607D8B;border-radius:2px;"></div>Normal</div>'
      +     '<div style="display:flex;align-items:center;gap:5px;font-size:0.65rem;color:#455A64;"><div style="width:10px;height:6px;background:#E53935;border-radius:2px;"></div>> 44h</div>'
      +   '</div>'
      + '</div>'

      // ── POSTES ATYPIQUES ─────────────────────────────────────────
      + (nightC > 0 || weekC > 0
        ? '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;margin-bottom:20px;">'
        + '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Postes atypiques détectés</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
        + (nightC > 0 ? '<div style="background:rgba(156,136,255,0.05);border:1px solid rgba(156,136,255,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:#9C88FF;">' + nightC + '</div><div style="font-size:0.68rem;color:#455A64;margin-top:2px;">Saisies de nuit</div><div style="font-size:0.62rem;color:#37474F;margin-top:2px;">Majoration possible</div></div>' : '')
        + (weekC  > 0 ? '<div style="background:rgba(255,152,0,0.05);border:1px solid rgba(255,152,0,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:#FF9800;">' + weekC + '</div><div style="font-size:0.68rem;color:#455A64;margin-top:2px;">Week-ends travaillés</div><div style="font-size:0.62rem;color:#37474F;margin-top:2px;">Vérifier contreparties</div></div>' : '')
        + '</div></div>'
        : '')

      // ── RECOMMANDATIONS ──────────────────────────────────────────
      + '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Recommandations</div>'
      + advice.map(renderAdviceBlock).join('')

      // ── HISTORIQUE ANNUEL ────────────────────────────────────────
      + '<div style="margin-top:20px;margin-bottom:20px;">'
      +   '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Historique annuel</div>'
      +   '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;">'
      +   renderYearHistory()
      +   '<div style="font-size:0.62rem;color:#2D3F4A;margin-top:8px;">Plafond légal : 220h/an · Barre rouge = dépassement</div>'
      +   '</div>'
      + '</div>'

      // ── RÉFÉRENCES LÉGALES ───────────────────────────────────────
      + '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;margin-bottom:20px;">'
      +   '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Références légales clés</div>'
      +   [
          ['L3121-18','Durée max journalière : 10h (12h par accord)'],
          ['L3121-20','Durée max hebdomadaire absolue : 48h'],
          ['L3121-22','Moyenne max sur 12 semaines : 44h'],
          ['L3121-30','Contingent annuel : 220h'],
          ['L3121-36','Majorations : 25% (8 prem. HS) puis 50%'],
          ['L3131-1', 'Repos quotidien : 11h minimum'],
          ['L3132-2', 'Repos hebdomadaire : 35h consécutives'],
          ['L3245-1', 'Prescription : 3 ans pour réclamer des HS'],
          ['L3121-33','Contrepartie obligatoire en repos au-delà du contingent'],
          ['L4121-1', 'Obligation de résultat sur la santé : employeur'],
        ].map(function(r) {
          return '<div style="display:flex;align-items:baseline;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);">'
            + '<div style="font-size:0.68rem;color:#455A64;min-width:68px;font-variant-numeric:tabular-nums;font-family:monospace;">Art. ' + r[0] + '</div>'
            + '<div style="font-size:0.75rem;color:#546E7A;line-height:1.4;">' + r[1] + '</div>'
            + '</div>';
        }).join('')
      + '</div>'

      // ── ACCÈS MODULES ────────────────────────────────────────────
      + '<div style="font-size:0.62rem;color:#37474F;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Accès modules</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">'
      +   '<a href="../heures/index.html" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;text-align:center;text-decoration:none;display:block;">'
      +     '<div style="font-size:1.4rem;margin-bottom:4px;">📅</div>'
      +     '<div style="font-size:0.78rem;color:#607D8B;font-weight:600;">Suivi annuel</div>'
      +     '<div style="font-size:0.65rem;color:#37474F;margin-top:2px;">Module M1</div>'
      +   '</a>'
      +   '<a href="../paye/index.html" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;text-align:center;text-decoration:none;display:block;">'
      +     '<div style="font-size:1.4rem;margin-bottom:4px;">💰</div>'
      +     '<div style="font-size:0.78rem;color:#607D8B;font-weight:600;">Paie mensuelle</div>'
      +     '<div style="font-size:0.65rem;color:#37474F;margin-top:2px;">Module M2</div>'
      +   '</a>'
      + '</div>'
      + '<button onclick="openPopup(\'popup-analyse\')" style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:13px;font-size:0.82rem;color:#546E7A;cursor:pointer;font-family:inherit;margin-bottom:8px;">⚖️ Simuler une semaine de travail</button>'
      + '<button onclick="openPopup(\'popup-glossaire\')" style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:13px;font-size:0.82rem;color:#546E7A;cursor:pointer;font-family:inherit;">📚 Glossaire juridique</button>'

      // ── DISCLAIMER ──────────────────────────────────────────────
      + '<div style="margin-top:20px;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.01);">'
      +   '<div style="font-size:0.65rem;color:#2D3F4A;line-height:1.7;">'
      +   'Ces informations sont indicatives et basées sur le Code du travail français. Elles ne constituent pas un conseil juridique. En cas de litige, consultez un avocat spécialisé en droit du travail ou un conseiller du salarié (liste disponible en mairie).'
      +   '</div>'
      + '</div>'

      + '</div>'; // fin padding
  }

  // ── API publique ──────────────────────────────────────────────────
  window.VuePro = {
    show: function() {
      var gaming  = document.getElementById('gaming-main');
      var hud     = document.getElementById('gaming-hud');
      var pro     = document.getElementById('vue-pro');
      var bgDecor = document.getElementById('bg-decor');
      if (gaming)  gaming.style.display  = 'none';
      if (bgDecor) bgDecor.style.opacity = '0.06';
      if (pro) { pro.style.display = 'block'; renderVuePro(); }
      localStorage.setItem('FOX_VUE', 'pro');
    },
    hide: function() {
      var gaming  = document.getElementById('gaming-main');
      var pro     = document.getElementById('vue-pro');
      var bgDecor = document.getElementById('bg-decor');
      if (gaming)  gaming.style.display  = 'flex';
      if (bgDecor) bgDecor.style.opacity = '1';
      if (pro)    pro.style.display      = 'none';
      localStorage.setItem('FOX_VUE', 'fox');
    },
    refresh: function() {
      if (localStorage.getItem('FOX_VUE') === 'pro') renderVuePro();
    },
    init: function() {
      if (localStorage.getItem('FOX_VUE') === 'pro') {
        setTimeout(function() { window.VuePro.show(); }, 700);
      }
    }
  };

})();
