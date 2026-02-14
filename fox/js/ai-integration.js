// ═══════════════════════════════════════════════════════════════
//  KITSUNE — Renard sage 100% LOCAL
//  Aucune API, aucune clé, fonctionne offline
//  Utilise : FOX_SCENARIOS (600 scénarios) + legal-engine.js
//            + module-reader.js (données réelles du joueur)
// ═══════════════════════════════════════════════════════════════

class KitsuneLocal {

  constructor() {
    this.history      = [];
    this.isProcessing = false;
    this.playerName   = localStorage.getItem('FOX_PLAYER_NAME') || 'Joueur';

    this.intentMap = {
      heures:      ['durée','heure','temps','semaine','journée','quotidien','hebdo'],
      nuit:        ['nuit','nocturne','minuit','22h','23h'],
      dimanche:    ['dimanche','jour de repos','repos dominical'],
      conges:      ['congé','vacances','cp','rtt','récupération'],
      salaire:     ['salaire','paie','rémunération','majoration','prime','indemnité'],
      licenciement:['licenciement','rupture','licencié','démission','préavis'],
      harcelement: ['harcèlement','moral','sexuel','violence','intimidation'],
      burnout:     ['burn-out','burnout','épuisement','surmenage','stress','fatigue'],
      contingent:  ['contingent','220','quota','dépassement','accord'],
      repos:       ['repos compensateur','récupération','compensation','pause'],
      syndicat:    ['syndicat','délégué','représentant','cse','irp'],
      sante:       ['santé','médecin','arrêt','accident','maladie','invalidité'],
    };
  }

  async chat(userMessage) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.history.push({ role: 'user', text: userMessage });
    const response = this._generateResponse(userMessage);
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    this.history.push({ role: 'kitsune', text: response.text });
    this.isProcessing = false;
    return response;
  }

  _generateResponse(msg) {
    const lower = msg.toLowerCase();

    if (this._match(lower, ['bonjour','salut','coucou','hello','bonsoir']))
      return this._greet();

    if (this._match(lower, ['qui es-tu','c\'est quoi','tu es quoi','qui êtes']))
      return this._intro();

    if (this._match(lower, ['mes heures','mon solde','combien j\'ai','mon compteur','mon cumul','mon total']))
      return this._playerStats();

    if (this._match(lower, ['burn-out','burnout','épuisement','fatigue','score','comment je vais']))
      return this._burnoutAdvice();

    if (this._match(lower, ['badge','niveau','ligue','xp','progression']))
      return this._playerProgress();

    if (this._match(lower, ['limite','légal','loi','code du travail','droit','article']))
      return this._legalLimits(lower);

    if (this._match(lower, ['conseil','aide','quoi faire','que faire','recommande']))
      return this._advice();

    const scenario = this._findScenario(lower, this._detectIntent(lower));
    if (scenario) return this._scenarioResponse(scenario);

    return this._defaultResponse();
  }

  _greet() {
    const h = new Date().getHours();
    const c = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
    const opts = [
      `${c} ! 🦊 Je suis Kitsune, ton guide en droit du travail. Pose-moi n'importe quelle question sur tes heures sup ou tes droits.`,
      `${c} ${this.playerName} ! 🦊 Je connais 600 situations juridiques et tes données personnelles. Qu'est-ce qui te préoccupe ?`,
      `${c} ! ✨ Le renard sage est là. Parle-moi de tes heures, de tes droits, ou de comment tu te sens.`,
    ];
    return { text: opts[Math.floor(Math.random() * opts.length)], type: 'greet' };
  }

  _intro() {
    return { text: `🦊 Je suis Kitsune, le moteur d'intelligence du FOX Engine.\n\nJe connais :\n• 600 scénarios juridiques du droit du travail français\n• Tes heures saisies dans les Modules 1 et 2\n• Les articles du Code du travail (L3121-1 et suivants)\n• Ton score burn-out et ta progression\n\nJe fonctionne entièrement en local — sans internet. Pose-moi une question concrète !`, type: 'intro' };
  }

  _playerStats() {
    try {
      const cum = moduleReader.getCumulatedSummary();
      const net = (cum.totalNetOvertime || 0).toFixed(1);
      const src = cum.source === 'fusion' ? 'M1+M2 fusionnés' : `Module ${cum.source.replace('M','')}`;
      const contingent = (cum.totalPlus25 || 0) + (cum.totalPlus50 || 0);
      let msg = `📊 Ton bilan, ${this.playerName} :\n\n• **${net}h** d'heures sup nettes cumulées\n• Données sur **${cum.years.length} année(s)** (${src})\n• **${cum.monthCount || 0}** mois analysés\n`;
      if (cum.totalPlus25 > 0) msg += `• ${cum.totalPlus25.toFixed(1)}h à +25%\n`;
      if (cum.totalPlus50 > 0) msg += `• ${cum.totalPlus50.toFixed(1)}h à +50%\n`;
      if (contingent > 220) msg += `\n🚨 Contingent dépassé (${contingent.toFixed(0)}/220h) — repos compensateurs obligatoires (Art. L3121-30).`;
      else if (contingent > 180) msg += `\n⚠️ Tu approches du contingent (${contingent.toFixed(0)}/220h).`;
      else msg += `\n✅ Dans les limites du contingent (${contingent.toFixed(0)}/220h).`;
      return { text: msg, type: 'stats' };
    } catch(e) {
      return { text: `🦊 Ouvre d'abord le Module 1 ou 2 et saisis quelques heures, puis reviens me voir !`, type: 'nodata' };
    }
  }

  _burnoutAdvice() {
    try {
      const bo = moduleReader.getBurnoutScore();
      const msgs = {
        sain:      `🟢 Score burn-out : **${bo.score}/100** — Tu vas bien ! Continue à surveiller ta charge.`,
        vigilance: `🟡 Score burn-out : **${bo.score}/100** — Vigilance. Vérifie tes droits à repos compensateur et parle à ton médecin du travail (Art. L4624-1).`,
        risque:    `🟠 Score burn-out : **${bo.score}/100** — Zone de risque. Visite médicale prioritaire. Ton employeur a une obligation de prévention (Art. L4121-1).`,
        danger:    `🔴 Score burn-out : **${bo.score}/100** — Danger. Trop d'heures sur trop de semaines. Sollicite les RH et le médecin du travail rapidement.`,
        critique:  `⛔ Score burn-out : **${bo.score}/100** — Critique. Ta santé passe avant tout. Le burn-out est reconnu juridiquement. Contacte ton médecin, syndicat et le CSE.`,
      };
      return { text: msgs[bo.level] || msgs.sain, type: 'burnout' };
    } catch(e) {
      return { text: `🦊 Saisis quelques semaines dans le Module 1 ou 2 pour calculer ton score burn-out.`, type: 'nodata' };
    }
  }

  _playerProgress() {
    try {
      const cum = moduleReader.getCumulatedSummary();
      return { text: `🎮 Ta progression :\n\n• ${cum.years.length} an(s) de données\n• ${cum.monthCount} mois analysés\n• +${cum.xpBonus} XP bonus multi-années\n\nContinue à remplir tes modules pour débloquer plus de badges ! 🏆`, type: 'progress' };
    } catch(e) {
      return { text: `🦊 Commence à saisir tes heures pour voir ta progression !`, type: 'nodata' };
    }
  }

  _legalLimits(lower) {
    const limits = [
      { keys: ['48h','quarante-huit'], text: `📖 **Limite de 48h/semaine** (Art. L3121-20)\nMaximum absolu. Sur 12 semaines, la moyenne ne peut dépasser 44h (Art. L3121-22).` },
      { keys: ['10h','quotidien','journée'], text: `📖 **Limite journalière de 10h** (Art. L3121-18)\nSauf dérogation conventionnelle ou autorisation de l'inspection du travail.` },
      { keys: ['220','contingent'], text: `📖 **Contingent annuel** (Art. L3121-33)\n220h par an. Au-delà → repos compensateur obligatoire (100% pour >20 salariés, 50% sinon).` },
      { keys: ['repos','11h'], text: `📖 **Repos quotidien minimal** (Art. L3131-1)\n11 heures consécutives minimum entre deux journées de travail.` },
      { keys: ['35h','durée légale'], text: `📖 **Durée légale : 35h/semaine** (Art. L3121-27)\nAu-delà : +25% de la 36e à la 43e heure, +50% à partir de la 44e.` },
    ];
    for (const l of limits) {
      if (l.keys.some(k => lower.includes(k))) return { text: l.text, type: 'legal' };
    }
    return { text: `📖 **Limites légales principales** :\n\n• Durée légale : **35h/sem** (L3121-27)\n• Maximum journalier : **10h** (L3121-18)\n• Maximum hebdo : **48h** (L3121-20)\n• Moyenne 12 sem : **44h** (L3121-22)\n• Contingent annuel : **220h** (L3121-33)\n• Repos quotidien : **11h min** (L3131-1)\n\nTu veux en savoir plus sur l'une d'elles ?`, type: 'legal' };
  }

  _advice() {
    try {
      const bo  = moduleReader.getBurnoutScore();
      const cum = moduleReader.getCumulatedSummary();
      const contingent = (cum.totalPlus25 || 0) + (cum.totalPlus50 || 0);
      const advices = [];
      if (bo.score >= 60)   advices.push(`🔴 Consulte le médecin du travail — score burn-out à ${bo.score}/100.`);
      if (contingent > 180) advices.push(`⚠️ ${contingent.toFixed(0)}h sur le contingent — surveille les prochaines semaines.`);
      if ((cum.totalNetOvertime||0) > 100) advices.push(`📊 ${cum.totalNetOvertime.toFixed(0)}h sup nettes — vérifie les majorations sur ta fiche de paie.`);
      if (advices.length === 0) advices.push(`✅ Ta situation semble équilibrée. Exporte tes données régulièrement.`);
      advices.push(`💡 Explore les 600 scénarios pour anticiper des situations spécifiques.`);
      return { text: `🦊 Mes conseils :\n\n` + advices.join('\n'), type: 'advice' };
    } catch(e) {
      return { text: `🦊 Saisis quelques semaines d'heures pour que je puisse te donner des conseils personnalisés.`, type: 'nodata' };
    }
  }

  _scenarioResponse(scenario) {
    let text = `🦊 Situation correspondante :\n\n**${scenario.title || scenario.situation || 'Scénario'}**\n\n`;
    if (scenario.description) text += `${scenario.description}\n\n`;
    if (scenario.advice || scenario.conseil) text += `💡 **Conseil** : ${scenario.advice || scenario.conseil}\n\n`;
    const refs = scenario.legalRef || scenario.articles || scenario.references;
    if (refs) text += `📖 **Références** : ${Array.isArray(refs) ? refs.join(', ') : refs}\n\n`;
    const risk = scenario.risk || scenario.riskLevel;
    if (risk) {
      const e = risk >= 80 ? '🔴' : risk >= 50 ? '🟠' : risk >= 30 ? '🟡' : '🟢';
      text += `${e} Niveau de risque : ${risk}/100\n\n`;
    }
    text += `Tu veux en savoir plus ?`;
    return { text, type: 'scenario', scenario };
  }

  _defaultResponse() {
    return { text: `🦊 Je peux t'aider sur :\n\n• **Ton solde** — "quelles sont mes heures sup ?"\n• **Ton bien-être** — "comment je vais ?"\n• **Les limites légales** — "quelle est la limite hebdomadaire ?"\n• **Un droit précis** — ex: "j'ai travaillé un dimanche, quels sont mes droits ?"\n• **Tes conseils** — "qu'est-ce que tu me recommandes ?"`, type: 'default' };
  }

  _findScenario(lower, intent) {
    if (typeof FOX_SCENARIOS === 'undefined') return null;
    let pool = FOX_SCENARIOS;
    if (intent && intent !== 'general') {
      const filtered = FOX_SCENARIOS.filter(s => {
        const t = ((s.title||'') + ' ' + (s.description||'') + ' ' + (s.situation||'')).toLowerCase();
        return this.intentMap[intent]?.some(kw => t.includes(kw));
      });
      if (filtered.length > 0) pool = filtered;
    }
    const words = lower.split(/\s+/).filter(w => w.length > 3);
    const scored = pool.map(s => {
      const t = ((s.title||'') + ' ' + (s.description||'') + ' ' + (s.situation||'') + ' ' + (s.conseil||s.advice||'')).toLowerCase();
      return { s, score: words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0) };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    return scored.length > 0 ? scored[0].s : null;
  }

  _detectIntent(lower) {
    for (const [intent, kws] of Object.entries(this.intentMap)) {
      if (kws.some(kw => lower.includes(kw))) return intent;
    }
    return 'general';
  }

  _match(str, kws) { return kws.some(k => str.includes(k)); }

  reset() { this.history = []; }
}

// ═══════════════════════════════════════════════════════════════
//  INSTANCE GLOBALE + FONCTIONS APPELÉES DEPUIS index.html
// ═══════════════════════════════════════════════════════════════

const kitsune = new KitsuneLocal();

async function askKitsune(message) {
  const response = await kitsune.chat(message);
  return response?.text || '🦊 ...';
}

function showAILoading(show) {
  const el = document.getElementById('ai-loading');
  if (el) el.style.display = show ? 'block' : 'none';
}

console.log('✅ Kitsune LOCAL chargé — 100% offline, 0 API');
