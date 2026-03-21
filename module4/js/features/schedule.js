/**
 * schedule.js — Gestion des horaires et régimes de travail
 *
 * Stockage :
 *   DTE_SETTINGS                    → profil global
 *   DTE_SCHEDULE_OVERRIDES_{year}   → overrides par jour
 *
 * Références légales :
 *   Art. L3131-1  — 11h repos obligatoire entre deux journées
 *   Art. L3122-2  — travailleur de nuit : ≥3h entre 21h-6h, ≥2×/sem
 *   Art. L3121-34 — durée max journalière : 10h (dérogatoire 12h)
 *
 * Références scientifiques :
 *   IARC 2019 Groupe 2A — travail de nuit cancérogène probable
 *   Kivimäki 2015 (Lancet) — nuit : RR ×1.4-1.7 cardio
 *   INRS — sommeil diurne = 70% efficacité du nocturne
 *   Thompson 2022 — dette de sommeil → cortisol +14%/nuit
 */
(function(global) {
'use strict';

const STORAGE_KEY  = 'DTE_SETTINGS';
const OVERRIDE_KEY = (year) => 'DTE_SCHEDULE_OVERRIDES_' + year;

const DEFAULTS = {
  startH:     9,
  endH:       17,
  commuteH:   0,
  regimeType: 'standard',
};

const REGIME_LABELS = {
  standard:       { label: 'Horaires standards',    desc: '8h-20h — baseline OMS',            icon: '☀️' },
  decale:         { label: 'Horaires décalés',       desc: 'Fin >21h ou début <6h',             icon: '🌆' },
  nuit_partielle: { label: 'Nuit partielle',          desc: '1-2h entre 21h-6h',                icon: '🌙' },
  nuit_complete:  { label: 'Nuit complète',           desc: '≥3h entre 21h-6h (Art. L3122-2)',  icon: '🌑' },
};

/* ── LECTURE / ÉCRITURE ─────────────────────────────────────────── */

function loadSettings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? Object.assign({}, DEFAULTS, JSON.parse(s)) : { ...DEFAULTS };
  } catch(_) { return { ...DEFAULTS }; }
}

function saveSettings(settings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch(_) {}
}

function loadOverrides(year) {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY(year)) || '{}');
  } catch(_) { return {}; }
}

function saveOverride(dateKey, data) {
  const year = dateKey.slice(0, 4);
  const ov   = loadOverrides(year);
  if (data === null) {
    delete ov[dateKey];
  } else {
    ov[dateKey] = data;
  }
  try { localStorage.setItem(OVERRIDE_KEY(year), JSON.stringify(ov)); } catch(_) {}
}

/* ── CALCULS LÉGAUX ─────────────────────────────────────────────── */

/**
 * Vérifie la règle des 11h (Art. L3131-1)
 * endH = heure fin journée J, startH = heure début journée J+1
 * Retourne { ok, reposH, violation }
 */
function checkRepos11h(endHPrev, startHNext) {
  const endHNorm = endHPrev > startHNext ? endHPrev - 24 : endHPrev; // passage minuit
  const reposH   = startHNext - endHNorm;
  return {
    ok:        reposH >= 11,
    reposH:    Math.round(reposH * 10) / 10,
    violation: reposH < 11,
    deficit:   Math.max(0, 11 - reposH),
  };
}

/**
 * Classifie le régime automatiquement depuis startH/endH
 */
function autoClassify(startH, endH) {
  const passeMinuit = endH < startH;
  let nightH = 0;
  if (passeMinuit) {
    nightH = (24 - Math.max(21, startH)) + Math.min(6, endH);
  } else {
    if (startH < 6)  nightH += Math.min(endH, 6) - startH;
    if (endH   > 21) nightH += endH - Math.max(startH, 21);
  }
  nightH = Math.max(0, nightH);
  if (nightH >= 3)  return 'nuit_complete';
  if (nightH > 0)   return 'nuit_partielle';
  if (endH > 21 || startH < 6) return 'decale';
  return 'standard';
}

/* ── RENDU UI ───────────────────────────────────────────────────── */

function renderSchedulePanel(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const settings = loadSettings();
  const today    = new Date();
  const todayKey = today.getFullYear() + '-'
    + String(today.getMonth()+1).padStart(2,'0') + '-'
    + String(today.getDate()).padStart(2,'0');
  const overrides = loadOverrides(today.getFullYear());
  const todayOv   = overrides[todayKey] || null;

  const autoR = autoClassify(settings.startH, settings.endH);
  const regime = REGIME_LABELS[autoR] || REGIME_LABELS.standard;

  // Contrôle de violation 11h si override du jour
  let reposAlert = '';
  if (todayOv && overrides[_prevDayKey(todayKey)]) {
    const prev = overrides[_prevDayKey(todayKey)];
    const r11  = checkRepos11h(prev.endH || settings.endH, todayOv.startH || settings.startH);
    if (r11.violation) {
      reposAlert = `<div style="background:rgba(200,40,56,.12);border:1px solid #c82838;
        padding:6px 10px;font-size:10px;color:#c82838;margin-bottom:8px;font-family:var(--font-mono);">
        ⚠ VIOLATION L3131-1 — Repos entre journées : ${r11.reposH}h / 11h obligatoires
        (déficit : ${r11.deficit.toFixed(1)}h)
      </div>`;
    }
  }

  el.innerHTML = `
    <div style="padding:var(--gap);">
      ${reposAlert}

      <!-- PROFIL GLOBAL -->
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--animus);
        letter-spacing:.12em;margin-bottom:10px;">PROFIL HORAIRE GLOBAL</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <div>
          <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);
            margin-bottom:4px;">HEURE DÉBUT</div>
          <input type="time" id="sch-start" value="${_toTimeStr(settings.startH)}"
            style="width:100%;background:rgba(0,10,25,.9);color:var(--text);
            border:1px solid rgba(0,200,255,0.2);padding:5px 8px;
            font-family:var(--font-mono);font-size:12px;box-sizing:border-box;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);
            margin-bottom:4px;">HEURE FIN</div>
          <input type="time" id="sch-end" value="${_toTimeStr(settings.endH)}"
            style="width:100%;background:rgba(0,10,25,.9);color:var(--text);
            border:1px solid rgba(0,200,255,0.2);padding:5px 8px;
            font-family:var(--font-mono);font-size:12px;box-sizing:border-box;">
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);
          margin-bottom:4px;">TRAJET ALLER (minutes)</div>
        <div style="display:flex;gap:6px;">
          ${[0, 15, 30, 45, 60, 90].map(m =>
            `<button onclick="window._schCommute(${m})"
              style="flex:1;padding:5px 2px;font-family:var(--font-mono);font-size:10px;
              background:rgba(0,10,25,${settings.commuteH*60===m?'.95':'.7'});
              border:1px solid rgba(0,200,255,${settings.commuteH*60===m?'0.6':'0.15'});
              color:${settings.commuteH*60===m?'var(--animus)':'var(--text-dim)'};
              cursor:pointer;" id="sch-c-${m}">${m===0?'0':''+m}</button>`
          ).join('')}
        </div>
        <div style="font-size:9px;color:var(--text-dim);margin-top:3px;
          font-family:var(--font-mono);">minutes · aller uniquement (×2 = total)</div>
      </div>

      <!-- CLASSIFICATION AUTO -->
      <div style="padding:8px 10px;background:rgba(0,10,25,.7);
        border-left:3px solid var(--animus);margin-bottom:12px;" id="sch-regime-info">
        <div style="font-size:11px;color:#fff;font-weight:600;">${regime.icon} ${regime.label}</div>
        <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${regime.desc}</div>
        ${autoR !== 'standard' ? `<div style="font-size:9px;color:#ffb300;margin-top:4px;
          font-family:var(--font-mono);">→ Facteur biologique ×${
            autoR==='nuit_complete'?'1.40':autoR==='nuit_partielle'?'1.20':'1.10'
          } appliqué (cortisol + cvRisk)</div>` : ''}
      </div>

      <button onclick="window._schSaveGlobal()"
        style="width:100%;padding:8px;background:rgba(0,200,170,0.12);
        border:1px solid var(--sync);color:var(--sync);font-family:var(--font-mono);
        font-size:10px;letter-spacing:.1em;cursor:pointer;margin-bottom:16px;">
        ENREGISTRER LE PROFIL
      </button>

      <!-- OVERRIDE DU JOUR -->
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--animus);
        letter-spacing:.12em;margin-bottom:8px;">
        OVERRIDE AUJOURD'HUI
        <span style="color:var(--text-dim);font-size:8px;margin-left:6px;">
          ${todayKey}${todayOv ? ' · <span style="color:var(--sync)">✓ défini</span>' : ''}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <div>
          <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);
            margin-bottom:4px;">DÉBUT (aujourd'hui)</div>
          <input type="time" id="ov-start" value="${_toTimeStr((todayOv||settings).startH)}"
            style="width:100%;background:rgba(0,10,25,.9);color:var(--text);
            border:1px solid rgba(255,179,0,0.3);padding:5px 8px;
            font-family:var(--font-mono);font-size:12px;box-sizing:border-box;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);
            margin-bottom:4px;">FIN (aujourd'hui)</div>
          <input type="time" id="ov-end" value="${_toTimeStr((todayOv||settings).endH)}"
            style="width:100%;background:rgba(0,10,25,.9);color:var(--text);
            border:1px solid rgba(255,179,0,0.3);padding:5px 8px;
            font-family:var(--font-mono);font-size:12px;box-sizing:border-box;">
        </div>
      </div>

      <div style="display:flex;gap:6px;">
        <button onclick="window._schSaveOverride()"
          style="flex:1;padding:7px;background:rgba(255,179,0,0.10);
          border:1px solid rgba(255,179,0,0.4);color:#ffb300;font-family:var(--font-mono);
          font-size:10px;letter-spacing:.1em;cursor:pointer;">
          APPLIQUER CE JOUR
        </button>
        ${todayOv ? `<button onclick="window._schClearOverride()"
          style="padding:7px 12px;background:rgba(200,40,56,.10);
          border:1px solid rgba(200,40,56,.3);color:#c82838;font-family:var(--font-mono);
          font-size:10px;cursor:pointer;">✕</button>` : ''}
      </div>

      <!-- LÉGENDE LÉGALE -->
      <div style="margin-top:14px;padding:8px;background:rgba(255,255,255,0.03);
        font-size:9px;color:var(--text-dim);font-family:var(--font-mono);line-height:1.7;">
        L3131-1 · 11h repos entre journées<br>
        L3122-2 · Nuit = ≥3h entre 21h-6h, ≥2×/sem<br>
        L3121-34 · Max journalier : 10h (dérogatoire 12h)<br>
        IARC 2019 · Travail nuit = cancérogène probable (Groupe 2A)
      </div>
    </div>`;

  // ── Handlers ──
  window._schSaveGlobal = () => {
    const s = loadSettings();
    s.startH    = _parseTime(document.getElementById('sch-start').value);
    s.endH      = _parseTime(document.getElementById('sch-end').value);
    s.regimeType = autoClassify(s.startH, s.endH);
    saveSettings(s);
    renderSchedulePanel(containerId);
    _triggerReanalysis();
  };

  window._schCommute = (minutes) => {
    const s = loadSettings();
    s.commuteH = minutes / 60;
    saveSettings(s);
    renderSchedulePanel(containerId);
    _triggerReanalysis();
  };

  window._schSaveOverride = () => {
    const startH = _parseTime(document.getElementById('ov-start').value);
    const endH   = _parseTime(document.getElementById('ov-end').value);
    saveOverride(todayKey, {
      startH, endH,
      regimeType: autoClassify(startH, endH),
    });
    renderSchedulePanel(containerId);
    _triggerReanalysis();
  };

  window._schClearOverride = () => {
    saveOverride(todayKey, null);
    renderSchedulePanel(containerId);
    _triggerReanalysis();
  };

  // Mise à jour temps réel du régime affiché
  ['sch-start','sch-end'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const sh = _parseTime(document.getElementById('sch-start').value);
      const eh = _parseTime(document.getElementById('sch-end').value);
      const ar = autoClassify(sh, eh);
      const rg = REGIME_LABELS[ar] || REGIME_LABELS.standard;
      const ri = document.getElementById('sch-regime-info');
      if (ri) ri.innerHTML = `
        <div style="font-size:11px;color:#fff;font-weight:600;">${rg.icon} ${rg.label}</div>
        <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${rg.desc}</div>
        ${ar !== 'standard' ? `<div style="font-size:9px;color:#ffb300;margin-top:4px;
          font-family:var(--font-mono);">→ Facteur ×${
            ar==='nuit_complete'?'1.40':ar==='nuit_partielle'?'1.20':'1.10'
          } appliqué</div>` : ''}`;
    });
  });
}

/* ── UTILITAIRES ────────────────────────────────────────────────── */

function _toTimeStr(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
}

function _parseTime(str) {
  if (!str) return 9;
  const [h, m] = str.split(':');
  return parseInt(h||0) + parseInt(m||0)/60;
}

function _prevDayKey(dateKey) {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-'
    + String(d.getMonth()+1).padStart(2,'0') + '-'
    + String(d.getDate()).padStart(2,'0');
}

function _triggerReanalysis() {
  // Déclencher une nouvelle analyse engine si disponible
  try {
    if (window.DTE && window.DTE.engine) {
      window.DTE.engine.analyze();
      document.dispatchEvent(new CustomEvent('dte:schedule:changed'));
    }
  } catch(_) {}
}

/* ── EXPORT ─────────────────────────────────────────────────────── */
global.DTESchedule = {
  loadSettings,
  saveSettings,
  loadOverrides,
  saveOverride,
  checkRepos11h,
  autoClassify,
  renderSchedulePanel,
  REGIME_LABELS,
};

}(typeof window !== 'undefined' ? window : global));
