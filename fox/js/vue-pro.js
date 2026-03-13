// ================================================================
//  VUE ANALYSE PRO — vue-pro.js
//  Lecture seule des données M1/M2/FOX
//  Accessible via bouton 📊 PRO dans le HUD
//  N'interfère PAS avec le moteur RPG
// ================================================================

(function() {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────
  function fmtH(h) {
    if (!h || isNaN(h)) return '0h';
    var t = Math.round(h * 10) / 10;
    var hh = Math.floor(t);
    var mm = Math.round((t - hh) * 60);
    return mm > 0 ? hh + 'h' + String(mm).padStart(2,'0') : hh + 'h';
  }

  function readM1(yr) {
    try { return JSON.parse(localStorage.getItem('DATA_REPORT_' + yr) || '{}'); }
    catch(e) { return {}; }
  }

  function readM2(yr) {
    try { return JSON.parse(localStorage.getItem('CA_HS_TRACKER_V1_DATA_' + yr) || '{}'); }
    catch(e) { return {}; }
  }

  function getActiveYear() {
    return localStorage.getItem('ACTIVE_YEAR_SUFFIX') || String(new Date().getFullYear());
  }

  function getAllYears() {
    var yrs = [];
    Object.keys(localStorage).forEach(function(k) {
      var m = k.match(/\d{4}$/);
      if ((k.indexOf('DATA_REPORT_') === 0 || k.indexOf('CA_HS_TRACKER_V1_DATA_') === 0) && m)
        { if (yrs.indexOf(m[0]) < 0) yrs.push(m[0]); }
    });
    return yrs.sort();
  }

  // ── Calcul heures année ─────────────────────────────────────────
  function calcAnnualHS(yr) {
    var totalHS = 0;
    var source  = 'aucune';

    // Priorité M1 (hebdomadaire)
    var m1 = readM1(yr);
    var keys = Object.keys(m1);
    var hasM1 = false;
    keys.forEach(function(k) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && m1[k].extra > 0) {
        totalHS += m1[k].extra;
        hasM1 = true;
      }
    });
    if (hasM1) { source = 'M1'; return { total: Math.round(totalHS*10)/10, source: source }; }

    // Fallback M2 (mensuel)
    var m2 = readM2(yr);
    Object.keys(m2).forEach(function(mk) {
      var mv = m2[mk];
      if (mv && mv.days) {
        Object.keys(mv.days).forEach(function(d) {
          totalHS += (mv.days[d] || 0);
        });
        source = 'M2';
      }
    });
    return { total: Math.round(totalHS*10)/10, source: source };
  }

  // ── Calcul HS du jour ───────────────────────────────────────────
  function calcTodayHS() {
    var yr  = getActiveYear();
    var now = new Date();
    var dk  = yr + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var m1  = readM1(yr);
    if (m1[dk] && m1[dk].extra > 0) return { extra: m1[dk].extra, total: m1[dk].total || 0 };
    // M2 : clé YYYY-MM, jour = String(day)
    var mk = yr + '-' + String(now.getMonth()+1).padStart(2,'0');
    var m2 = readM2(yr);
    if (m2[mk] && m2[mk].days && m2[mk].days[String(now.getDate())])
      return { extra: m2[mk].days[String(now.getDate())], total: 0 };
    return { extra: 0, total: 0 };
  }

  // ── Statut légal (simplifié) ────────────────────────────────────
  function legalStatus(totalHS) {
    var CONTINGENT = 220;
    var pct = Math.round(totalHS / CONTINGENT * 100);
    if (totalHS === 0) return { label: 'Aucune HS détectée', color: '#555', pct: 0 };
    if (pct < 50)     return { label: 'Situation normale', color: '#4CAF50', pct: pct };
    if (pct < 75)     return { label: 'Charge modérée', color: '#FF9800', pct: pct };
    if (pct < 100)    return { label: 'Vigilance requise', color: '#FF5722', pct: pct };
    return              { label: '⚠️ Contingent dépassé', color: '#E53935', pct: pct };
  }

  // ── Violations récentes ─────────────────────────────────────────
  function getRecentViolations(n) {
    try {
      var v = JSON.parse(localStorage.getItem('FOX_VIOLATIONS_HISTORY') || '[]');
      return v.slice(-n).reverse();
    } catch(e) { return []; }
  }

  // ── Rendu HTML ──────────────────────────────────────────────────
  function renderVuePro() {
    var container = document.getElementById('vue-pro');
    if (!container) return;

    var yr      = getActiveYear();
    var annual  = calcAnnualHS(yr);
    var today   = calcTodayHS();
    var status  = legalStatus(annual.total);
    var viols   = getRecentViolations(3);
    var burnout = 0;
    try {
      var gs = JSON.parse(localStorage.getItem('FOX_GAME_STATE') || '{}');
      burnout = gs.burnout || 0;
    } catch(e) {}
    var level = parseInt(localStorage.getItem('rpg_level') || '1');
    var xp    = parseInt(localStorage.getItem('rpg_xp')    || '0');

    var pctBar = Math.min(status.pct, 100);

    var violsHTML = '';
    if (viols.length === 0) {
      violsHTML = '<div style="color:#555;font-size:0.8rem;padding:8px 0;">Aucune violation enregistrée</div>';
    } else {
      viols.forEach(function(v) {
        violsHTML += '<div style="background:rgba(229,57,53,0.08);border-left:3px solid #E53935;'
          + 'border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px;font-size:0.78rem;color:#eee;">'
          + (v.message || v.type || JSON.stringify(v))
          + '</div>';
      });
    }

    container.innerHTML = ''
      + '<div style="max-width:480px;margin:0 auto;padding-bottom:24px;">'

      // ── En-tête ──
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">'
      +   '<div>'
      +     '<div style="font-size:1.1rem;font-weight:700;color:#e0e0e0;">📊 Analyse PRO</div>'
      +     '<div style="font-size:0.72rem;color:#555;margin-top:2px;">'
      +       new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long',year:'numeric'})
      +     '</div>'
      +   '</div>'
      +   '<button onclick="VuePro.hide()" style="background:rgba(255,255,255,0.05);border:1px solid '
      +     'rgba(255,255,255,0.1);color:#888;border-radius:8px;padding:6px 14px;font-size:0.78rem;cursor:pointer;font-family:inherit;">🦊 Jeu</button>'
      + '</div>'

      // ── Année + source ──
      + '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;margin-bottom:12px;">'
      +   '<div style="font-size:0.7rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Année ' + yr + ' · source ' + annual.source + '</div>'
      +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
      +     '<div>'
      +       '<div style="font-size:1.8rem;font-weight:900;color:#FF8C42;">' + fmtH(annual.total) + '</div>'
      +       '<div style="font-size:0.72rem;color:#666;">HS cumulées</div>'
      +     '</div>'
      +     '<div>'
      +       '<div style="font-size:1.8rem;font-weight:900;color:' + (today.extra > 0 ? '#4CAF50' : '#444') + ';">'
      +         (today.extra > 0 ? fmtH(today.extra) : '—') + '</div>'
      +       '<div style="font-size:0.72rem;color:#666;">HS aujourd\'hui</div>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      // ── Statut légal ──
      + '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;margin-bottom:12px;">'
      +   '<div style="font-size:0.7rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Statut légal · contingent 220h/an</div>'
      +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      +     '<div style="font-weight:700;color:' + status.color + ';">' + status.label + '</div>'
      +     '<div style="font-size:0.82rem;color:#666;">' + status.pct + '%</div>'
      +   '</div>'
      +   '<div style="background:rgba(255,255,255,0.05);border-radius:4px;height:6px;">'
      +     '<div style="background:' + status.color + ';width:' + pctBar + '%;height:6px;border-radius:4px;transition:width 0.4s;"></div>'
      +   '</div>'
      + '</div>'

      // ── Burn-out + Niveau ──
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'
      +   '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;">'
      +     '<div style="font-size:0.7rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Burn-out</div>'
      +     '<div style="font-size:1.6rem;font-weight:900;color:' + (burnout > 60 ? '#E53935' : burnout > 30 ? '#FF9800' : '#4CAF50') + ';">'
      +       burnout + '<span style="font-size:0.9rem;">/100</span></div>'
      +   '</div>'
      +   '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;">'
      +     '<div style="font-size:0.7rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Niveau FOX</div>'
      +     '<div style="font-size:1.6rem;font-weight:900;color:#FF8C42;">Niv. ' + level + '</div>'
      +     '<div style="font-size:0.7rem;color:#555;">' + xp + ' XP</div>'
      +   '</div>'
      + '</div>'

      // ── Violations récentes ──
      + '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;margin-bottom:12px;">'
      +   '<div style="font-size:0.7rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">3 dernières violations</div>'
      +   violsHTML
      + '</div>'

      // ── Analyse Kitsune texte ──
      + '<div style="background:rgba(255,140,66,0.05);border:1px solid rgba(255,140,66,0.15);border-radius:10px;padding:12px 14px;">'
      +   '<div style="font-size:0.7rem;color:#FF8C42;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🦊 Analyse Kitsune</div>'
      +   '<div id="pro-kitsune-text" style="font-size:0.82rem;color:#aaa;line-height:1.6;">'
      +     _buildKitsuneAnalysis(annual.total, today.extra, burnout, status) 
      +   '</div>'
      + '</div>'

      + '</div>'; // fin max-width
  }

  // ── Analyse textuelle Kitsune ───────────────────────────────────
  function _buildKitsuneAnalysis(totalHS, todayHS, burnout, status) {
    var lines = [];
    if (totalHS === 0) {
      lines.push('Aucune heure supplémentaire enregistrée pour l\'année en cours. Saisis tes heures dans M1 ou M2 pour que l\'analyse soit disponible.');
      return lines.join('<br>');
    }
    lines.push('Tu as accumulé <strong style="color:#FF8C42;">' + fmtH(totalHS) + '</strong> de HS cette année.');
    if (status.pct >= 100) {
      lines.push('⚠️ Le contingent légal de 220h est dépassé. Des contreparties obligatoires en repos s\'appliquent (Art. L3121-33).');
    } else if (status.pct >= 75) {
      lines.push('Le contingent annuel de 220h est atteint à ' + status.pct + '%. Surveille le rythme des prochaines semaines.');
    }
    if (todayHS > 0) {
      lines.push('Aujourd\'hui : <strong style="color:#4CAF50;">' + fmtH(todayHS) + '</strong> sup enregistrées.');
    }
    if (burnout >= 70) {
      lines.push('🔴 Niveau de burn-out élevé (' + burnout + '/100). Consulte le médecin du travail si ce niveau persiste.');
    } else if (burnout >= 40) {
      lines.push('🟠 Burn-out modéré (' + burnout + '/100). Surveille ta charge sur les prochains jours.');
    } else {
      lines.push('💚 Niveau de burn-out satisfaisant (' + burnout + '/100).');
    }
    return lines.join('<br><br>');
  }

  // ── API publique ────────────────────────────────────────────────
  window.VuePro = {
    show: function() {
      var gaming = document.getElementById('gaming-main');
      var pro    = document.getElementById('vue-pro');
      var bgDecor = document.getElementById('bg-decor');
      if (gaming) gaming.style.display = 'none';
      if (bgDecor) bgDecor.style.opacity = '0.15';
      if (pro) {
        pro.style.display = 'block';
        renderVuePro();
      }
      localStorage.setItem('FOX_VUE', 'pro');
    },
    hide: function() {
      var gaming = document.getElementById('gaming-main');
      var pro    = document.getElementById('vue-pro');
      var bgDecor = document.getElementById('bg-decor');
      if (gaming) gaming.style.display = 'flex';
      if (bgDecor) bgDecor.style.opacity = '1';
      if (pro) pro.style.display = 'none';
      localStorage.setItem('FOX_VUE', 'fox');
    },
    refresh: function() {
      if (localStorage.getItem('FOX_VUE') === 'pro') renderVuePro();
    },
    init: function() {
      // Restaurer la vue au chargement
      if (localStorage.getItem('FOX_VUE') === 'pro') {
        setTimeout(function() { window.VuePro.show(); }, 600);
      }
    }
  };

})();
