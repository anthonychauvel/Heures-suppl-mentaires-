// ══════════════════════════════════════════════════════════════════════
//  KITSUNE POOL — 600+ messages contextuels
//  Remplace _getHourlyBubble — même signature, même appel
//  Varie par : heure × jour × HS du jour × situation légale × contingent
// ══════════════════════════════════════════════════════════════════════

function _getHourlyBubble(hour, day, todayOT) {
  const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const jr    = JOURS[day];
  const name  = localStorage.getItem('FOX_USER_NAME') || '';
  const pr    = name ? name + ' ' : '';

  // Seed déterministe : change toutes les heures ET si les HS changent
  const _now  = new Date();
  const _seed = _now.getFullYear() * 1000000
              + (_now.getMonth()+1) * 10000
              + _now.getDate() * 100
              + hour
              + Math.round((todayOT ? todayOT.extra : 0) * 10);
  function _pick(arr) { return arr[_seed % arr.length]; }

  const xh = todayOT ? todayOT.extra : 0;
  const th = todayOT ? todayOT.total : 0;

  // Contexte légal rapide
  let s = {};
  try { s = _analyzeLegalSituation(); } catch(e) {}
  const semTot    = s.weekly?.maxWeekTotal || 0;
  const contPct   = s.annual?.contingentPct || 0;
  const contH     = s.annual?.annualOT || 0;
  const avgViol   = s.weekly?.hasAvgViol || false;
  const weekViol  = s.weekly?.hasWeekViol || false;
  const dayViol   = s.daily?.hasDailyCrit || false;
  const bo        = (typeof gameState !== 'undefined') ? (gameState.burnout || 0) : 0;
  const isWE      = (day === 0 || day === 6);
  const isLundi   = day === 1;
  const isVen     = day === 5;

  // ───────────────────────────────────────────────
  //  HS SAISIES AUJOURD'HUI
  // ───────────────────────────────────────────────
  if (xh > 0) {

    // ── NUIT TARDIVE 23h–5h ─────────────────────
    if (hour >= 23 || hour < 5) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup enregistrées. Ton repos de 11h part maintenant (Art. L3131-1) — surveille l'heure de reprise.`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr}, journée de ${_fmtH(th)} au total. À ${hour}h, tu devrais déjà être en repos légal.`,
        `🦊 [Nuit — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Le travail entre 21h et 6h déclenche des droits spécifiques dans la plupart des conventions.`,
        `🦊 ${pr}${_fmtH(xh)} sup sur ce ${jr}. Il est ${hour}h — ton repos de 11h consécutives est une obligation légale absolue (Art. L3131-1).`,
        `🦊 [${jr} — ${hour}h] Tu travailles encore ? Ces heures nocturnes s'ajoutent à tes ${_fmtH(xh)} sup du jour. Note l'heure exacte de fin de poste.`,
        `🦊 Journée de ${_fmtH(th)} ce ${jr} avec ${_fmtH(xh)} sup. À ${hour}h : si reprise demain matin avant ${(hour+11)%24}h, c'est une violation du repos quotidien.`,
        `🦊 [${hour}h — nuit] ${_fmtH(xh)} sup tracées aujourd'hui. Travail de nuit = droits renforcés selon ta convention (surveillance médicale, majoration, repos compensateur).`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. Le travail nocturne après 21h est encadré par l'Art. L3122-29 — vérifie si ta convention prévoit une majoration spécifique.`,
        `🦊 [${jr} nuit] Journée à ${_fmtH(th)} dont ${_fmtH(xh)} sup. Si tu es travailleur de nuit habituel (≥270h/an), des droits supplémentaires s'appliquent (Art. L3122-5).`,
        `🦊 ${_fmtH(xh)} sup saisies, total ${_fmtH(th)}. Il est ${hour}h — la fatigue nocturne est documentée. Prends soin de ton repos avant la prochaine prise de poste.`,
        `🦊 [${jr} — ${hour}h] Heure tardive avec ${_fmtH(xh)} sup au compteur. Majorations HS : +25% sur les 8 premières heures sup/sem, +50% au-delà (Art. L3121-36).`,
        `🦊 Nuit de travail détectée sur ${jr}. Tes ${_fmtH(xh)} sup sont bien tracées. Pense à vérifier ton prochain bulletin pour les majorations correspondantes.`,
        `🦊 [${hour}h] Fin de journée tardive — ${_fmtH(th)} dont ${_fmtH(xh)} sup. Le droit à la déconnexion (Art. L2242-17) te protège, mais tu choisis de rester connecté à FOX.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}, total ${_fmtH(th)}. À ${hour}h, l'amplitude journalière est importante — surveille la récupération avant la prochaine prise de poste.`,
        `🦊 [${jr} — ${hour}h] Longue journée avec ${_fmtH(xh)} sup. Les heures entre 22h et 5h relèvent souvent du travail de nuit — consulte ta convention collective.`,
        `🦊 Journée de ${_fmtH(th)} ce ${jr} dont ${_fmtH(xh)} sup. En nuit, la vigilance baisse — un accident de trajet sur le chemin du retour est aussi un accident du travail.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup enregistrées. Ton contingent annuel progresse : ${contPct > 0 ? contPct+'% utilisé' : 'suivi actif dans FOX'}.`,
        `🦊 ${pr}Bonne nuit après cette journée de ${_fmtH(th)} (${_fmtH(xh)} sup). Ton repos de 11h minimum est le garant de ta sécurité au travail (Art. L3131-1).`,
        `🦊 [Nuit — ${hour}h] ${_fmtH(xh)} sup saisies sur ${jr}. Si tu travailles la nuit régulièrement, FOX peut suivre le cumul nocturne — utile pour justifier le statut travailleur de nuit.`,
        `🦊 ${_fmtH(xh)} sup + heure tardive ce ${jr}. Rappel : ton employeur doit s'assurer que le repos de 11h est effectif avant toute nouvelle prise de poste (Art. L3131-1).`,
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} bien tracée. Ces heures nocturnes génèrent potentiellement des majorations conventionnelles — vérifie dès réception du bulletin.`,
        `🦊 Fin de poste à ${hour}h ce ${jr}. ${_fmtH(xh)} sup à majorer sur le prochain bulletin. Heure de reprise légale : pas avant ${(hour+11)%24}h.`,
        `🦊 [${jr} nuit] ${_fmtH(xh)} sup saisies. Le score burn-out FOX est à ${bo}/100 — le travail nocturne l'augmente plus vite que le travail de jour. Surveille-le.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. À ${hour}h, ton corps est en mode nocturne. Ces conditions méritent une compensation — connais ta convention collective.`,
        `🦊 [${hour}h] Nuit de travail avec ${_fmtH(xh)} sup. En logistique/transport, les postes de nuit sont fréquents — tes droits sont renforcés par la loi.`,
        `🦊 ${pr}${_fmtH(xh)} sup saisies ce ${jr}. Il est ${hour}h — mérite-toi un bon repos. Ton corps récupère mieux avant minuit selon les chronobiologistes.`,
        `🦊 [${jr} — ${hour}h] Journée à ${_fmtH(th)}. Ces heures nocturnes comptent doublement dans ton bien-être à long terme. FOX les suit, mais protège aussi ta santé.`,
        `🦊 Nuit avec ${_fmtH(xh)} sup ce ${jr}. Si le travail nocturne est habituel, tu as droit à une surveillance médicale renforcée (Art. L3122-42) — réclame-la.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(th)} dont ${_fmtH(xh)} sup. La fatigue nocturne cumulative est un risque documenté — FOX surveille la tendance sur 12 semaines.`,
        `🦊 ${_fmtH(xh)} sup tracées sur ce ${jr}. À ${hour}h : assure-toi que le transport du retour est sécurisé — les accidents de trajet nocturnes sont plus fréquents.`,
      ];
      return _pick(msgs);
    }

    // ── AUBE 5h–8h ──────────────────────────────
    if (hour < 8) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] Prise de poste matinale avec ${_fmtH(xh)} sup déjà saisies. Amplitude à surveiller — journée de ${_fmtH(th)} au compteur.`,
        `🦊 ${pr}Tôt ce ${jr} ! ${_fmtH(xh)} sup enregistrées. Ton repos depuis hier était-il bien de 11h minimum (Art. L3131-1) ?`,
        `🦊 [${hour}h — ${jr}] Démarrage matinal. ${_fmtH(xh)} sup tracées, journée à ${_fmtH(th)}. Avant 6h, c'est souvent du travail de nuit — vérifie ta convention.`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr} matin. Ces heures doivent apparaître avec majoration sur ton prochain bulletin (Art. L3121-36).`,
        `🦊 [${jr} — ${hour}h] Début de journée précoce avec ${_fmtH(xh)} sup. Si tu as commencé avant 6h, tes droits nuit peuvent s'appliquer — consulte ta convention.`,
        `🦊 ${_fmtH(xh)} sup + journée à ${_fmtH(th)} ce ${jr}. Prise de poste à ${hour}h — assure-toi que le repos de 11h depuis hier était bien respecté.`,
        `🦊 [${hour}h] Matin précoce avec ${_fmtH(xh)} sup au compteur. En logistique, les prises de poste à ${hour}h sont courantes — tes droits sont identiques à ceux des autres salariés.`,
        `🦊 ${pr}${_fmtH(xh)} sup saisies sur ce ${jr} à ${hour}h. Rappel : les heures avant 6h sont souvent majorées dans les conventions logistique/transport.`,
        `🦊 [${jr} matin] ${_fmtH(th)} dont ${_fmtH(xh)} sup. Prise de poste précoce — ton employeur doit s'assurer du transport sécurisé si tu rentres après minuit (Art. L3122-44).`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Le contingent annuel tourne à ${contPct > 0 ? contPct+'%' : 'un rythme à surveiller'} — FOX actualise en continu.`,
        `🦊 [${hour}h — ${jr}] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. L'amplitude journalière maximum est 13h entre deux repos — surveille la durée totale.`,
        `🦊 Matin très tôt ce ${jr}. ${_fmtH(xh)} sup enregistrées. Si la semaine cumule ${semTot > 0 ? _fmtH(semTot) : 'beaucoup'}, surveille le plafond de 48h (Art. L3121-20).`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies. Bonne saisie précoce — la précision sur l'heure de début est clé pour justifier les majorations en cas de litige.`,
        `🦊 ${_fmtH(xh)} sup à ${hour}h ce ${jr}. Ces heures contribuent au contingent annuel (${contH > 0 ? contH+'h cumulées' : 'suivi en cours'}) — limite légale 220h (Art. L3121-30).`,
        `🦊 [${hour}h] Poste du matin avec ${_fmtH(xh)} sup. Ta journée de ${_fmtH(th)} est bien tracée. N'oublie pas de noter l'heure de fin exacte pour le calcul du repos.`,
        `🦊 ${pr}${_fmtH(xh)} sup ce ${jr} matin à ${hour}h. Si cette amplitude est régulière, ton médecin du travail peut être consulté pour un suivi adapté.`,
        `🦊 [${jr} — ${hour}h] Journée précoce à ${_fmtH(th)} dont ${_fmtH(xh)} sup. Le travail avant 6h dans certaines branches ouvre droit à un repos compensateur spécifique.`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr} à ${hour}h. Ton score burn-out est à ${bo}/100 — les débuts de poste très matinaux sont identifiés comme facteur de risque.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup tracées. Ces heures matinales méritent compensation. FOX les cumule dans ton contingent annuel automatiquement.`,
        `🦊 Prise de poste à ${hour}h ce ${jr} avec ${_fmtH(xh)} sup. Amplitude journalière à surveiller — FOX te préviendra si tu approches des limites réglementaires.`,
      ];
      return _pick(msgs);
    }

    // ── MATIN 8h–12h ────────────────────────────
    if (hour < 12) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies ce matin. Journée à ${_fmtH(th)} — ton total hebdomadaire est en cours de calcul dans FOX.`,
        `🦊 ${_fmtH(xh)} supplémentaires enregistrées ce ${jr} à ${hour}h. Majorations : +25% sur les 8 premières h sup/sem, +50% au-delà (Art. L3121-36).`,
        `🦊 [${hour}h — ${jr}] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Rappel : au-delà de 10h/jour, une dérogation est nécessaire (Art. L3121-18).`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} matin. Ces heures s'ajoutent au contingent annuel — actuellement à ${contPct > 0 ? contPct+'%' : 'un niveau à surveiller'} (limite : 220h).`,
        `🦊 [${jr} ${hour}h] Bon démarrage avec ${_fmtH(xh)} sup tracées. Ces heures doivent figurer sur ton bulletin avec la majoration applicable ce mois-ci.`,
        `🦊 ${pr}Il est ${hour}h ce ${jr}. ${_fmtH(xh)} sup saisies — ton journal FOX se remplit. Continue à saisir régulièrement pour avoir un dossier solide.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup + journée à ${_fmtH(th)} ce ${jr}. Si la semaine dépasse 44h en moyenne sur 12 semaines, une alerte sera levée (Art. L3121-22).`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} matin — total ${_fmtH(th)}. ${weekViol ? '⚠️ La semaine dépasse déjà 48h — alerte en cours.' : 'Semaine encore dans les limites — continue la saisie.'}`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ces heures génèrent des majorations ET alimentent ton compteur de récupération si ta convention le prévoit.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. Chaque heure sup non majorée sur ton bulletin peut être réclamée — délai de prescription 3 ans (Art. L3245-1).`,
        `🦊 [${hour}h — matin] ${_fmtH(xh)} sup saisies ce ${jr}. Journée à ${_fmtH(th)} — si tu approches de 10h journalières, une pause est conseillée (Art. L3121-16).`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. Il est ${hour}h — la journée est encore longue. FOX surveille si tu approches du seuil de 10h (Art. L3121-18) ou 12h (dérogation).`,
        `🦊 [${jr} ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup bien tracées. Ta précision dans FOX te protège — c'est toi qui gardes la maîtrise des données.`,
        `🦊 ${_fmtH(xh)} sup enregistrées ce ${jr} à ${hour}h. Si tu n'as pas encore reçu tes bulletins de paie vérifiés, garde FOX comme référence en cas de litige.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup au compteur. Ces heures valent de l'argent — +25% minimum sur les premières, +50% sur les suivantes. Chaque minute compte.`,
        `🦊 ${pr}Matin actif ce ${jr} avec ${_fmtH(xh)} sup. La semaine cumule ${semTot > 0 ? _fmtH(semTot) : 'des heures à surveiller'} — plafond légal 48h (Art. L3121-20).`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ton contingent annuel avance : ${contH > 0 ? contH+'h cumulées sur l\'année' : 'suivi actif'}. Limite : 220h.`,
        `🦊 ${_fmtH(xh)} sup saisies. Il est ${hour}h ce ${jr} — si ton poste est régulier, le modèle de saisie FOX t'aide à anticiper les fins de semaine chargées.`,
        `🦊 [${hour}h] Journée de ${_fmtH(th)} ce ${jr}. ${_fmtH(xh)} sup bien tracées. Un conseil : compare cette journée avec la même semaine l'an passé dans FOX.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} matin. Ces heures peuvent être récupérées ou payées selon l'accord en vigueur — vérifie si un accord de récupération écrit existe.`,
        `🦊 [${jr} ${hour}h] ${_fmtH(xh)} sup + total journée ${_fmtH(th)}. ${contPct >= 80 ? '🚨 Contingent à '+contPct+'% — zone critique.' : contPct >= 50 ? '⚠️ Contingent à '+contPct+'% — surveille.' : 'Contingent dans les limites.'}`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. À ${hour}h du matin, c'est un signe de journée chargée. FOX compare avec tes données historiques pour détecter les tendances.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(th)} dont ${_fmtH(xh)} sup bien enregistrées. Si la semaine dépasse 44h hebdo sur 3 mois consécutifs, c'est une violation de la moyenne (Art. L3121-22).`,
        `🦊 Journée de ${_fmtH(th)} ce ${jr} à ${hour}h. ${_fmtH(xh)} sup au compteur. Ces heures doivent être rémunérées dans les 3 mois, sauf accord de récupération signé.`,
        `🦊 [${jr} — ${hour}h] Saisie matinale confirmée : ${_fmtH(xh)} sup. Ton historique FOX construit une preuve robuste en cas de contestation du bulletin.`,
        `🦊 ${_fmtH(xh)} sup enregistrées ce ${jr} à ${hour}h. Bon réflexe de saisie ! L'exact horaire de début de dépassement est une information clé juridiquement.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup ce ${jr}, journée à ${_fmtH(th)}. Si tu travailles plus de 6h consécutives, ta pause de 20 min est un droit absolu (Art. L3121-16).`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} matin. Le calcul des majorations part de la 36ème heure de la semaine civile (lundi 0h → dimanche 24h).`,
        `🦊 [${jr} ${hour}h] Journée active avec ${_fmtH(xh)} sup. Pense à noter aussi les pauses non payées — elles ne comptent pas dans le temps de travail effectif.`,
        `🦊 ${pr}${_fmtH(xh)} sup saisies ce ${jr} à ${hour}h. Si ta journée s'annonce longue, prévois ta pause — 20 min obligatoires après 6h de travail (Art. L3121-16).`,
        `🦊 [${hour}h — matin] ${_fmtH(xh)} sup tracées ce ${jr}. Ton total hebdomadaire en cours : ${semTot > 0 ? _fmtH(semTot) : 'calcul en cours'} — FOX surveille le seuil de 48h.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. Il est ${hour}h — si ces HS sont régulières, demande confirmation écrite à ton employeur que le contingent est bien autorisé (Art. L3121-30).`,
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ton burn-out FOX : ${bo}/100. Un matin chargé mérite une vraie coupure méridienne.`,
        `🦊 ${_fmtH(xh)} sup enregistrées ce matin (${jr}). L'employeur a 1 mois pour payer les heures sup du mois précédent, sauf accord de récupération en vigueur.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup ce ${jr}, total ${_fmtH(th)}. La durée maximale journalière est 10h (sauf dérogation 12h) — tu es ${th <= 10 ? 'dans les limites' : '⚠️ au-delà du seuil'} (Art. L3121-18).`,
        `🦊 ${pr}Saisie confirmée : ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Si ton poste prévoit régulièrement ces amplitudes, un accord collectif devrait le prévoir explicitement.`,
        `🦊 [${jr} ${hour}h] ${_fmtH(xh)} sup bien tracées. FOX calcule automatiquement les majorations applicables selon les seuils légaux — vérifie l'analyse pour le détail.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. À ${hour}h, ta journée est bien engagée. Note : le temps de trajet domicile-travail ne compte pas, sauf dépassement inhabituel.`,
        `🦊 [${hour}h — ${jr}] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Pense à clore ta saisie en fin de journée avec l'heure exacte — la précision te protège.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Ces heures valent des droits concrets : rémunération majorée, repos compensateur potentiel, et alimentation du contingent.`,
      ];
      return _pick(msgs);
    }

    // ── MIDI 12h–14h ────────────────────────────
    if (hour < 14) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] Mi-journée avec ${_fmtH(xh)} sup au compteur. Total du jour : ${_fmtH(th)}. Prends ta vraie pause — c'est aussi du temps de récupération.`,
        `🦊 Pause méritée ! ${_fmtH(xh)} sup enregistrées ce ${jr}. Ta pause de ${hour}h doit durer au moins 20 min après 6h de travail (Art. L3121-16).`,
        `🦊 [Midi — ${jr}] Journée à ${_fmtH(th)} avec ${_fmtH(xh)} sup. Ces heures apparaîtront sur ton bulletin avec majoration — +25% minimum (Art. L3121-36).`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr}. Il est ${hour}h — si tu travailles pendant la pause méridienne, ces heures comptent dans le temps de travail effectif.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup + journée à ${_fmtH(th)}. Ta pause déjeuner est un droit — une vraie coupure améliore la vigilance de l'après-midi.`,
        `🦊 ${pr}Mi-journée active ce ${jr} avec ${_fmtH(xh)} sup. ${contPct >= 60 ? '⚠️ Contingent à '+contPct+'% — la trajectoire mérite un point avec ton responsable.' : 'Contingent sous contrôle.'}`,
        `🦊 [${jr} ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Si tu déjeunes à ton poste, note si ces minutes t'ont été imposées — elles peuvent être du temps de travail effectif.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à midi. Ces heures s'ajoutent à la semaine en cours (${semTot > 0 ? _fmtH(semTot) : 'calcul en cours'}) — FOX surveille le plafond 48h.`,
        `🦊 [Midi — ${hour}h] ${_fmtH(xh)} sup tracées, total ${_fmtH(th)}. Ta pause de midi est aussi de la prévention — ton score burn-out FOX est à ${bo}/100.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. Il est ${hour}h — si l'après-midi s'annonce chargée, anticipe l'heure de fin dans ton plan de journée.`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup bien enregistrées. Le calcul des majorations commence à la 36ème heure hebdomadaire — FOX suit tout.`,
        `🦊 Journée à ${_fmtH(th)} ce ${jr}. ${_fmtH(xh)} sup au compteur. À midi, si tu dépasses déjà 6h depuis ce matin, ta pause de 20 min est obligatoire (Art. L3121-16).`,
        `🦊 [${hour}h — midi] ${_fmtH(xh)} sup saisies ce ${jr}. Ces heures génèrent des droits — rémunération majorée ET potentiellement repos compensateur obligatoire (Art. L3121-38).`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Ton contingent annuel avance (${contH > 0 ? contH+'h' : 'calcul en cours'}). Au-delà de 220h, un accord spécifique est requis.`,
        `🦊 [${jr} midi] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Prends soin de toi ce midi — une coupure réelle de 20 min minimum te recharge légalement et biologiquement.`,
        `🦊 ${_fmtH(xh)} sup enregistrées ce ${jr}. À ${hour}h, la journée est à mi-parcours. Note : les temps de trajet domicile/travail ne font pas partie des HS.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup ce ${jr}, total ${_fmtH(th)}. FOX compare avec tes semaines précédentes — si le rythme s'accélère, l'analyse détaillée te le montrera.`,
        `🦊 ${pr}Midi avec ${_fmtH(xh)} sup ce ${jr}. Si ces HS sont régulières sur le mois, c'est une opportunité de vérifier si ton contingent est correctement autorisé par accord collectif.`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup. ${weekViol ? '⚠️ Semaine déjà au-delà de 48h — situation critique à signaler.' : 'Semaine en cours dans les limites légales.'}`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr} à ${hour}h. Midi est le bon moment pour vérifier ton cumul hebdomadaire dans l'analyse FOX — anticipe plutôt que de subir.`,
      ];
      return _pick(msgs);
    }

    // ── APRÈS-MIDI 14h–17h ───────────────────────
    if (hour < 17) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies — journée à ${_fmtH(th)}. En fin d'après-midi, pense à noter l'heure exacte de sortie.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. À ce rythme, surveille ta moyenne sur 12 semaines : limite de 44h/sem (Art. L3121-22).`,
        `🦊 [${hour}h — ${jr}] Journée à ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ton contingent annuel est mis à jour : ${contH > 0 ? contH+'h' : 'calcul en cours'} / 220h limite.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. Il est ${hour}h — si tu restes jusqu'à la fermeture, pense à enregistrer l'heure exacte pour une saisie précise.`,
        `🦊 [${jr} ${hour}h] ${_fmtH(xh)} sup + total ${_fmtH(th)}. Le seuil de 10h journalières est à ${Math.max(0, 10-th) > 0 ? _fmtH(Math.max(0,10-th))+' d\'ici la limite' : '⚠️ déjà dépassé'} (Art. L3121-18).`,
        `🦊 ${pr}Il est ${hour}h ce ${jr} avec ${_fmtH(xh)} sup. Si la journée continue, les heures supplémentaires s'accumulent — FOX les suit automatiquement.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup saisies ce ${jr}. Journée de ${_fmtH(th)}. Ces heures génèrent +25% sur les premières ou +50% si tu as déjà dépassé 8 sup/sem.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. La semaine cumule ${semTot > 0 ? _fmtH(semTot) : 'des heures'} — alerte si tu approches de 48h (Art. L3121-20).`,
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup bien tracées. Ces heures ont une valeur juridique — conserve l'historique FOX.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. À ${hour}h, l'après-midi avance. Si tu pars plus tard que prévu, note l'heure exacte — chaque fraction d'heure compte dans les majorations.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(th)} dont ${_fmtH(xh)} sup. ${avgViol ? '⚠️ La moyenne de 44h/12 sem est dépassée — violation Art. L3121-22.' : 'Moyenne hebdomadaire dans les limites.'}`,
        `🦊 ${_fmtH(xh)} sup saisies. Il est ${hour}h ce ${jr} — si tu as travaillé sans pause depuis ce matin, rappelle-toi que 20 min sont obligatoires après 6h (Art. L3121-16).`,
        `🦊 [${jr} ${hour}h] ${_fmtH(xh)} sup + journée à ${_fmtH(th)}. Pense à clore ta saisie ce soir avec l'heure exacte de fin de poste — c'est le moment le plus souvent oublié.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. Ces heures doivent figurer sur ton prochain bulletin de paie. Si elles manquent, tu as 3 ans pour les réclamer (Art. L3245-1).`,
        `🦊 [${hour}h — ${jr}] Journée active avec ${_fmtH(xh)} sup. Le droit à la déconnexion (Art. L2242-17) commence dès ta fin de poste — pas d'obligation de répondre après.`,
        `🦊 ${pr}${_fmtH(xh)} sup ce ${jr}. À ${hour}h, si l'activité ralentit, note quand même l'heure de fin effective — pas l'heure théorique de fin de poste.`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ton score burn-out est à ${bo}/100. Un après-midi chargé mérite une vraie récupération ce soir.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Si la journée approche de 10h, une dérogation de l'inspecteur du travail est requise pour aller jusqu'à 12h (Art. L3121-18).`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup saisies ce ${jr}. FOX calcule si tu approches du repos compensateur obligatoire : déclenché quand les HS dépassent le contingent annuel.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. À ${hour}h, la journée tire à sa fin. Ces heures s'ajoutent à ton contingent (${contPct > 0 ? contPct+'%' : 'calcul en cours'} utilisé).`,
        `🦊 [${jr} ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ces HS rémunérées participent aussi à ta retraite — les cotisations sont calculées sur le salaire total incluant majorations.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Si un accord de récupération existe dans ta boîte, vérifie que ces heures sont bien programmées en repos et non perdues.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup + total journée ${_fmtH(th)}. En logistique, les HS de l'après-midi sont fréquentes — FOX les trace toutes pour toi.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. Il est ${hour}h — si tu es cadre autonome, ton régime HS est différent (forfait jours) — vérifie ton contrat.`,
        `🦊 [${jr} — ${hour}h] Journée à ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ces heures méritent d'être réclamées si elles n'apparaissent pas sur ton prochain bulletin.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. À ${hour}h de l'après-midi, une pensée pour ce soir : droit à la déconnexion actif dès la sortie du travail (Art. L2242-17).`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup tracées, total ${_fmtH(th)}. Si la semaine dépasse 44h, une alerte FOX te le signalera — anticipe plutôt qu'attendre.`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr} à ${hour}h. Bien noté. Ces heures alimentent ton dossier — si la tendance est systématique, c'est une opportunité de négocier.`,
        `🦊 [${jr} ${hour}h] ${_fmtH(th)} dont ${_fmtH(xh)} sup. Rappel : les heures sup au-delà du contingent de 220h ouvrent droit à un repos compensateur obligatoire (Art. L3121-38).`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr}. Il est ${hour}h — si tu pars dans l'heure, note l'heure exacte. FOX ne peut pas deviner l'heure de fin réelle.`,
      ];
      return _pick(msgs);
    }

    // ── FIN DE JOURNÉE 17h–20h ──────────────────
    if (hour < 20) {
      const msgs = [
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Bien enregistré. Ton repos de 11h démarre à la fin de poste (Art. L3131-1).`,
        `🦊 Fin de journée avec ${_fmtH(xh)} sup. Total : ${_fmtH(th)}. Ces heures doivent figurer sur ton bulletin de paie avec majorations (+25% ou +50%).`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies. Bonne saisie — déconnecte vraiment ce soir. Le droit à la déconnexion te protège (Art. L2242-17).`,
        `🦊 Journée de ${_fmtH(th)} terminée (${_fmtH(xh)} sup). Heure de reprise légale minimale demain : pas avant ${(hour+11)%24}h selon Art. L3131-1.`,
        `🦊 [${jr} soir] ${_fmtH(xh)} sup au compteur. La semaine cumule ${semTot > 0 ? _fmtH(semTot) : 'des heures importantes'} — ${weekViol ? '⚠️ plafond de 48h dépassé.' : 'dans les limites légales.'}`,
        `🦊 ${pr}${_fmtH(xh)} sup ce ${jr} soir. Ton contingent annuel : ${contH > 0 ? contH+'h' : 'en cours de calcul'} / 220h légales (Art. L3121-30). ${contPct >= 80 ? '🚨 Zone rouge.' : ''}`,
        `🦊 [${hour}h — ${jr}] Bonne journée de ${_fmtH(th)}. ${_fmtH(xh)} sup bien tracées. Sois vigilant : ces HS doivent apparaître explicitement sur le bulletin avec taux de majoration.`,
        `🦊 Fin de journée à ${hour}h ce ${jr}. ${_fmtH(xh)} sup enregistrées — sois vigilant à bien noter l'heure exacte de fin, pas l'heure théorique.`,
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. Ton score burn-out FOX : ${bo}/100. Ce soir, une vraie coupure est de la prévention active.`,
        `🦊 ${_fmtH(xh)} sup saisies ce ${jr}. À ${hour}h, le droit à la déconnexion s'applique — pas d'obligation légale de répondre aux messages pro après le poste.`,
        `🦊 [${hour}h — soir] ${_fmtH(xh)} sup + total ${_fmtH(th)} ce ${jr}. Ces HS génèrent du repos compensateur si le contingent de 220h est dépassé (Art. L3121-38).`,
        `🦊 Journée bien tracée ce ${jr} : ${_fmtH(th)} dont ${_fmtH(xh)} sup. L'employeur a l'obligation de payer ces HS dans le délai légal — bulletin du mois prochain.`,
        `🦊 [${jr} ${hour}h] ${_fmtH(xh)} sup enregistrées. Ces heures sont prouvées dans FOX. En cas de non-paiement, la prescription est de 3 ans (Art. L3245-1).`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} soir. Journée de ${_fmtH(th)} total. Si c'est régulier, une discussion avec ton employeur sur l'organisation est légitime.`,
        `🦊 [${hour}h] Fin de journée avec ${_fmtH(xh)} sup ce ${jr}. Rappel : les temps de déplacement professionnels comptent dans le temps de travail effectif (Art. L3121-4).`,
        `🦊 ${pr}${_fmtH(xh)} sup saisies ce ${jr} à ${hour}h. Bon travail — décompresse vraiment ce soir. La récupération active protège ta performance demain.`,
        `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup bien tracées. ${avgViol ? '⚠️ La moyenne 44h/12 sem est dépassée — Art. L3121-22 en jeu.' : 'Rythme hebdomadaire correct.'}`,
        `🦊 ${_fmtH(xh)} sup ce ${jr}. Il est ${hour}h — si tu travailles encore, note l'heure de fin réelle. Si tu es parti, c'est parfait — repos en cours.`,
        `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup enregistrées. Ces heures alimentent ton contingent annuel et peuvent générer un repos compensateur obligatoire au-delà de 220h.`,
        `🦊 Bonne fin de journée ${pr}! ${_fmtH(xh)} sup tracées ce ${jr}. Ces heures méritent une compensation — vérifie leur présence sur ton prochain bulletin.`,
        `🦊 [${jr} soir] ${_fmtH(xh)} sup + total ${_fmtH(th)}. Ton dossier FOX grossit. Si une contestation survient un jour, ces données horodatées seront tes meilleures preuves.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. Ces heures sont enregistrées avec l'heure. Ton employeur ne peut pas contester ce que tu as documenté avec précision.`,
        `🦊 [${hour}h — ${jr}] Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup. FOX calcule automatiquement si un repos compensateur obligatoire est dû selon ton contingent.`,
        `🦊 ${_fmtH(xh)} sup ce ${jr} soir. Ton droit à la déconnexion commence maintenant — aucune obligation légale de répondre aux messages pro hors temps de travail.`,
        `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup bien saisies. Journée de ${_fmtH(th)} total. En logistique, les semaines chargées sont normales — mais elles doivent être compensées.`,
        `🦊 Fin de poste à ${hour}h ce ${jr}. ${_fmtH(xh)} sup tracées. Demain matin, pas de reprise légale avant ${(hour+11)%24}h — ton repos de 11h est garanti par la loi.`,
        `🦊 [${hour}h] ${_fmtH(xh)} sup ce ${jr}, total journée ${_fmtH(th)}. Un soir par semaine sans écran pro améliore significativement la qualité du sommeil — essaie ce soir.`,
        `🦊 ${pr}Journée de ${_fmtH(th)} dont ${_fmtH(xh)} sup ce ${jr}. Bien méritée. ${contPct >= 70 ? '⚠️ Contingent à '+contPct+'% — à surveiller sur les prochaines semaines.' : 'Continue sur cette lancée de saisie régulière.'}`,
        `🦊 [${jr} soir — ${hour}h] ${_fmtH(xh)} sup enregistrées. Ces heures ne peuvent pas être simplement annulées par ton employeur sans accord — elles sont dues.`,
        `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} à ${hour}h. Bonne saisie. Le cumul hebdomadaire (${semTot > 0 ? _fmtH(semTot) : 'en cours'}) est comparé automatiquement au seuil de 48h.`,
      ];
      return _pick(msgs);
    }

    // ── SOIRÉE 20h–23h ──────────────────────────
    const msgs_soir = [
      `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies + travail en soirée. Journée de ${_fmtH(th)} — repos de 11h obligatoire (Art. L3131-1). Heure de reprise : pas avant ${(hour+11)%24}h.`,
      `🦊 Soirée de travail avec ${_fmtH(xh)} sup au compteur. Au-delà de 21h, certaines conventions prévoient une majoration de nuit — vérifie la tienne.`,
      `🦊 [${jr} — ${hour}h] Journée de ${_fmtH(th)} avec ${_fmtH(xh)} sup. Le droit à la déconnexion est actif (Art. L2242-17) — mais tes heures sont bien tracées.`,
      `🦊 ${_fmtH(xh)} sup + ${hour}h ce soir. Journée totale de ${_fmtH(th)}. Ces heures nocturnes peuvent générer des droits conventionnels spécifiques — vérifie ta convention.`,
      `🦊 [${jr} soir] ${_fmtH(xh)} sup saisies. Il est ${hour}h — ton repos de 11h avant la prochaine prise de poste est une obligation légale, pas une option.`,
      `🦊 Travail en soirée ce ${jr}. ${_fmtH(xh)} sup + journée de ${_fmtH(th)}. Le travail entre 21h et 6h relève souvent du travail de nuit selon les conventions.`,
      `🦊 [${hour}h — ${jr}] ${_fmtH(xh)} sup tracées. Ces heures de soirée valent de l'argent — majoration +25% au minimum, potentiellement +50% selon le cumul hebdo.`,
      `🦊 Journée de ${_fmtH(th)} ce ${jr} dont ${_fmtH(xh)} sup. Il est ${hour}h — ton score burn-out FOX est à ${bo}/100. Protège ton sommeil ce soir.`,
      `🦊 [${jr} — ${hour}h] ${_fmtH(xh)} sup saisies en soirée. Si cette amplitude est régulière, c'est un signe qui mérite un entretien avec ton médecin du travail.`,
      `🦊 ${_fmtH(xh)} sup + travail à ${hour}h ce ${jr}. Journée de ${_fmtH(th)}. Le contingent annuel est à ${contPct > 0 ? contPct+'%' : 'un niveau à surveiller'} — limite : 220h.`,
      `🦊 [${hour}h — soir] Longue journée ce ${jr} avec ${_fmtH(xh)} sup. ${weekViol ? '⚠️ Semaine au-delà de 48h — violation à signaler (Art. L3121-20).' : 'Semaine dans les limites.'}`,
      `🦊 ${_fmtH(xh)} sup saisies ce ${jr}. Il est ${hour}h — si tu continues à travailler, note l'heure exacte de fin pour le calcul de repos demain.`,
      `🦊 [${jr} ${hour}h] Soirée de travail + ${_fmtH(xh)} sup + total ${_fmtH(th)}. ${dayViol ? '🚨 Journée critique — dépasse les seuils réglementaires.' : 'Dans les seuils légaux — bien saisie.'}`,
      `🦊 ${_fmtH(xh)} supplémentaires ce ${jr} soir. Ces heures tardives méritent une vraie récupération. Le sommeil avant minuit est plus réparateur selon la chronobiologie.`,
      `🦊 [${hour}h — ${jr}] ${_fmtH(th)} dont ${_fmtH(xh)} sup bien tracées. Ces heures de soirée génèrent des droits — rémunération et repos compensateur si contingent dépassé.`,
      `🦊 ${_fmtH(xh)} sup ce ${jr} à ${hour}h. Prise de poste demain matin avant ${(hour+11)%24}h = violation du repos quotidien. Note-le si ça arrive (Art. L3131-1).`,
      `🦊 [${jr} soir] ${_fmtH(xh)} sup enregistrées. Il est ${hour}h — pas d'obligation légale de répondre aux messages pro ce soir. Droit à la déconnexion activé.`,
      `🦊 Soirée productive ce ${jr}. ${_fmtH(xh)} sup bien tracées. Journée de ${_fmtH(th)}. Ces HS alimentent ton dossier — en cas de litige, la précision temporelle compte.`,
      `🦊 [${hour}h] ${_fmtH(xh)} sup saisies ce ${jr}. Ces heures de soirée font partie du temps de travail effectif — elles génèrent les mêmes droits que les heures de jour.`,
      `🦊 ${pr}${_fmtH(xh)} sup + ${hour}h ce ${jr}. Journée de ${_fmtH(th)}. Bonne nuit ${pr}— ton repos de 11h minimum est le fondement de ta récupération (Art. L3131-1).`,
    ];
    return _pick(msgs_soir);
  }

  // ───────────────────────────────────────────────
  //  MODE NORMAL — pas de HS saisies aujourd'hui
  //  Messages contextuels + heure + situation
  // ───────────────────────────────────────────────

  // ── WEEK-END sans HS ────────────────────────────
  if (isWE) {
    const jourWE = day === 6 ? 'Samedi' : 'Dimanche';
    const msgs = [
      `🦊 [${jourWE} — ${hour}h] Tu consultes FOX ce week-end. Si tu travailles aujourd'hui, ces heures comptent et méritent d'être déclarées.`,
      `🦊 ${jourWE} ${hour}h — le repos hebdomadaire de 35h consécutives est un droit absolu (Art. L3132-2). Tu y es, profite-en.`,
      `🦊 [${jourWE} ${hour}h] Consultation week-end. Si tu travailles ce ${jourWE.toLowerCase()}, les modalités (majorations, repos compensateur) dépendent de ta convention collective.`,
      `🦊 ${jourWE} — ${hour}h. FOX surveille même le week-end. Si des heures sont à saisir pour ce jour, fais-le maintenant pendant que c'est frais.`,
      `🦊 [${hour}h — ${jourWE}] Le travail du ${jourWE.toLowerCase()} est encadré par la loi. En cas de travail ce jour, ta convention définit les droits spécifiques (Art. L3132-3 et suivants).`,
      `🦊 ${jourWE} ${hour}h. Si tu n'as pas travaillé cette semaine, ton contingent annuel reste inchangé. Si tu as travaillé, saisis tes heures dans M1 ou M2.`,
      `🦊 [${jourWE} — ${hour}h] Week-end détecté. Ton droit à 35h de repos consécutives par semaine est une protection fondamentale (Art. L3132-2) — profite-en pleinement.`,
      `🦊 ${jourWE} ${hour}h — tu consultes FOX. Rappel : les HS de la semaine écoulée doivent être saisies avant lundi pour un suivi précis.`,
      `🦊 [${hour}h — ${jourWE}] Week-end en cours. Le travail du dimanche est possible sous conditions strictes — les dérogations sont limitées et les contreparties obligatoires.`,
      `🦊 ${jourWE} ${hour}h. Si tu travailles ce week-end, c'est du temps travaillé effectif — chaque heure génère les mêmes droits qu'en semaine, parfois plus selon la convention.`,
      `🦊 [${jourWE} — ${hour}h] FOX tourne aussi le week-end. Si ta semaine a été chargée, le bilan dans l'analyse te montre où tu en es par rapport aux seuils légaux.`,
      `🦊 ${jourWE} ${hour}h. La loi garantit le repos dominical (Art. L3132-3) sauf dérogations spécifiques. Si tu travailles ce dimanche, tes droits restent entiers.`,
      `🦊 [${jourWE} — ${hour}h] Consultation week-end. Le décompte annuel continue — si cette semaine a vu des HS, pense à les saisir avant lundi matin.`,
      `🦊 ${jourWE} ${hour}h — un point sur la semaine passée ? L'analyse FOX te donne le cumul des HS, le statut légal et les violations éventuelles. Tout est là.`,
      `🦊 [${jourWE} — ${hour}h] Si tu travailles ce week-end, note l'heure de début et fin. Ces heures peuvent être majorées selon ta convention collective.`,
      `🦊 ${jourWE} ${hour}h. Profite de ton repos hebdomadaire. Le repos complet protège ta performance et ta santé — c'est aussi pour ça que la loi l'impose.`,
      `🦊 [${hour}h — ${jourWE}] Semaine chargée ? Le bilan dans FOX te montre si des violations ont été détectées et les articles applicables. Consulte l'analyse.`,
      `🦊 ${jourWE} ${hour}h. En cas de travail exceptionnel ce week-end, garde une trace écrite de la demande de ton employeur — protection en cas de litige.`,
      `🦊 [${jourWE} — ${hour}h] Ton score burn-out FOX est à ${bo}/100. Le week-end est fait pour récupérer — une déconnexion réelle aujourd'hui est du soin préventif.`,
      `🦊 ${jourWE} ${hour}h. Si tu consultes FOX le week-end par habitude, c'est bon signe — tu gardes un œil sur tes droits. Mais prends aussi du temps pour toi.`,
    ];
    return _pick(msgs);
  }

  // ── LUNDI 5h–12h ────────────────────────────────
  if (isLundi && hour < 12) {
    const msgs = [
      `🦊 [Lundi — ${hour}h] Nouvelle semaine ! La semaine civile (lundi 0h → dimanche 24h) repart à zéro pour le calcul des heures sup.`,
      `🦊 Lundi ${hour}h — la semaine recommence. Pense à saisir tes heures au fil des jours, pas en fin de semaine. La précision compte.`,
      `🦊 [Lundi matin — ${hour}h] Bonne semaine ${pr}! FOX repart sur une semaine fraîche — les compteurs hebdomadaires sont remis à zéro.`,
      `🦊 Lundi ${hour}h. Si la semaine dernière a été chargée, vérifie que toutes les heures ont bien été saisies dans M1 ou M2 avant de commencer la nouvelle semaine.`,
      `🦊 [Lundi — ${hour}h] Début de semaine. Ton contingent annuel en cours : ${contH > 0 ? contH+'h / 220h limite' : 'aucune heure saisie cette année encore'}. FOX surveille.`,
      `🦊 Lundi ${hour}h — semaine fraîche. Si la dernière semaine avait des violations, elles sont enregistrées dans l'historique FOX. Cette semaine, tu pars sur une base propre.`,
      `🦊 [Lundi matin — ${hour}h] La semaine civile commence. Rappel : le calcul des HS se fait de lundi 0h à dimanche 24h — pas selon le planning de ta boîte.`,
      `🦊 Lundi ${hour}h. En début de semaine, le bon réflexe : vérifier que les HS de la semaine précédente ont bien été saisies et apparaîtront sur le prochain bulletin.`,
      `🦊 [Lundi — ${hour}h] Semaine zéro. FOX scrute la nouvelle semaine. En cas de HS prévisibles, anticipe avec ton responsable pour un accord clair dès maintenant.`,
      `🦊 Lundi ${hour}h — nouvelle page. Si des HS sont habituelles chaque semaine, assure-toi qu'elles sont autorisées par un accord collectif (Art. L3121-30).`,
    ];
    return _pick(msgs);
  }

  // ── VENDREDI soir ────────────────────────────────
  if (isVen && hour >= 16) {
    const msgs = [
      `🦊 [Vendredi — ${hour}h] Fin de semaine en approche. Saisis tes heures avant de partir — c'est plus précis que de reconstituer lundi matin.`,
      `🦊 Vendredi ${hour}h — la semaine se termine. Ton total hebdomadaire en cours : ${semTot > 0 ? _fmtH(semTot) : 'aucune heure saisie cette semaine'}.`,
      `🦊 [Vendredi soir — ${hour}h] Bonne fin de semaine ! Déconnecte vraiment ce week-end. Ton droit à 35h de repos consécutives commence maintenant (Art. L3132-2).`,
      `🦊 Vendredi ${hour}h. Avant de partir, un dernier coup d'œil à ton cumul hebdomadaire dans FOX — est-ce que tout est bien saisi ?`,
      `🦊 [Vendredi — ${hour}h] Week-end mérité. Si la semaine a été chargée, le bilan dans l'analyse FOX te montre le statut légal exact de tes heures.`,
      `🦊 Vendredi ${hour}h. Le droit à la déconnexion commence à ta sortie (Art. L2242-17) — pas d'obligation de répondre aux emails pro ce soir ni demain.`,
      `🦊 [Vendredi soir — ${hour}h] Fin de semaine civile dans quelques heures. Saisis tes dernières heures avant dimanche minuit pour un suivi précis.`,
      `🦊 Vendredi ${hour}h — si tu as fait des HS cette semaine, vérifie le cumul dans FOX. La limite de 48h est ferme (Art. L3121-20). ${weekViol ? '⚠️ Dépassement détecté.' : 'Tu es dans les limites.'}`,
      `🦊 [Vendredi — ${hour}h] Semaine en cours de clôture. ${contPct >= 70 ? '⚠️ Contingent à '+contPct+'% — surveille les prochaines semaines.' : 'Contingent bien géré cette semaine.'}`,
      `🦊 Vendredi ${hour}h. Bonne fin de semaine ${pr}! Un vrai décrochage ce week-end, c'est la meilleure préparation pour une semaine productive et saine lundi.`,
    ];
    return _pick(msgs);
  }

  // ── NUIT 23h–5h ────────────────────────────────
  if (hour >= 23 || hour < 5) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] Tu consultes FOX très tard. Si tu travailles, ces heures de nuit génèrent des droits spécifiques — trace-les dans M1 ou M2.`,
      `🦊 Il est ${hour}h ce ${jr}. Le travail entre 21h et 6h est souvent considéré comme travail de nuit dans les conventions collectives.`,
      `🦊 [${jr} — ${hour}h] Consultation nocturne. Si tu travailles ce soir, note l'heure exacte — le repos de 11h part de ta sortie (Art. L3131-1).`,
      `🦊 Nuit de ${jr}. Il est ${hour}h — si tu travailles régulièrement la nuit (≥270h/an), tu es travailleur de nuit avec des droits renforcés (Art. L3122-5).`,
      `🦊 [${jr} — ${hour}h] Nuit détectée. En logistique/transport, le travail nocturne est fréquent. Tes droits restent entiers quelle que soit l'heure.`,
      `🦊 ${jr} ${hour}h. Si tu surveilles FOX pour un poste de nuit en cours, pense à saisir tes heures dans M1 ou M2 dès que possible.`,
      `🦊 [${jr} nuit — ${hour}h] Tu es connecté très tard. Ton score burn-out FOX : ${bo}/100. Le sommeil nocturne est irremplaçable — protège-le.`,
      `🦊 Nuit du ${jr}, ${hour}h. Les accidents de trajet nocturnes sont plus fréquents — si tu rentres, prends soin de toi sur le chemin du retour.`,
      `🦊 [${hour}h — ${jr}] Consultation nocturne. FOX surveille tes droits à toute heure. Si des heures de nuit sont à saisir, fais-le maintenant pendant que tu y penses.`,
      `🦊 ${jr} ${hour}h. En cas de travail de nuit régulier, tu as droit à une surveillance médicale renforcée (Art. L3122-42) — réclame-la si besoin.`,
      `🦊 [${jr} — ${hour}h] Il est tard. Si tu n'as pas travaillé, ton repos de 11h est en cours — c'est la loi qui s'applique même sans ta vigilance.`,
      `🦊 Nuit en cours sur ${jr}, ${hour}h. Rappel utile : les HS s'appliquent sur la semaine civile — les heures travaillées cette nuit comptent pour lundi si après minuit.`,
    ];
    return _pick(msgs);
  }

  // ── MATIN 5h–9h ────────────────────────────────
  if (hour < 9) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] Bonne journée ${pr}! Pense à saisir tes heures au fil de la journée — c'est plus précis que de reconstituer en fin de semaine.`,
      `🦊 ${jr} ${hour}h — journée qui commence. Un conseil : note l'heure de prise de poste maintenant — 10 secondes qui peuvent compter en cas de litige.`,
      `🦊 [${jr} matin — ${hour}h] Démarrage précoce. Ton repos depuis hier était-il bien de 11h minimum (Art. L3131-1) ? Si non, c'est une violation à noter.`,
      `🦊 ${jr} ${hour}h. La semaine civile est en cours. Ton cumul hebdomadaire : ${semTot > 0 ? _fmtH(semTot) : 'aucune heure saisie cette semaine encore'}.`,
      `🦊 [${jr} — ${hour}h] Matin précoce. En logistique, les prises de poste à ${hour}h sont fréquentes — assure-toi que ton repos de 11h depuis hier était bien respecté.`,
      `🦊 ${jr} ${hour}h. FOX surveille ta situation. Avant 6h, c'est souvent du travail de nuit selon les conventions — vérifie si ta branche prévoit des majorations spécifiques.`,
      `🦊 [${jr} — ${hour}h] Bon début de journée. Ton contingent annuel en cours : ${contH > 0 ? contH+'h / 220h' : 'pas d\'heures saisies cette année'}. FOX est en veille.`,
      `🦊 ${jr} ${hour}h — prise de poste matinale. La précision des horaires dans FOX est ta meilleure protection en cas de contestation du bulletin de paie.`,
      `🦊 [${jr} matin — ${hour}h] Démarrage de journée. N'oublie pas : les pauses imposées sans possibilité de vaquer librement restent du temps de travail effectif.`,
      `🦊 ${jr} ${hour}h. Matin actif ! Rappel : si tu commences avant 6h régulièrement, le statut travailleur de nuit peut s'appliquer (Art. L3122-5) — avec des droits renforcés.`,
    ];
    return _pick(msgs);
  }

  // ── MILIEU MATIN 9h–12h ─────────────────────────
  if (hour < 12) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] Milieu de matinée. FOX surveille ta situation légale en temps réel. Si des HS sont en cours, saisis-les dès la fin de journée.`,
      `🦊 ${jr} ${hour}h. Connais-tu ta convention collective ? Elle peut améliorer la loi — mais jamais la dégrader. Un bon point de vérification ce matin.`,
      `🦊 [${jr} — ${hour}h] Il est ${hour}h. Ton contingent annuel : ${contH > 0 ? contH+'h saisies' : 'aucune donnée saisie'}. La saisie régulière est ta meilleure protection.`,
      `🦊 ${jr} ${hour}h. La semaine est bien entamée. Cumul en cours : ${semTot > 0 ? _fmtH(semTot) : 'rien de saisi cette semaine'}. FOX surveille le seuil de 44h moyen.`,
      `🦊 [${jr} matin — ${hour}h] Les heures sup se calculent sur la semaine civile complète — surveille le cumul, pas juste la journée isolée.`,
      `🦊 ${jr} ${hour}h. Si tu utilises FOX régulièrement, ton historique se construit. C'est une preuve solide en cas de non-paiement des HS (prescription 3 ans).`,
      `🦊 [${jr} — ${hour}h] Matinée en cours. Pense à vérifier ton dernier bulletin de paie — les majorations HS doivent y apparaître explicitement avec taux et base.`,
      `🦊 ${jr} ${hour}h. FOX calcule ton exposition légale en continu. Si une alerte apparaît dans la bulle, prends-la au sérieux — c'est basé sur tes données réelles.`,
      `🦊 [${jr} — ${hour}h] Il est ${hour}h. Un rappel utile : les délégués syndicaux et représentants du personnel sont là pour t'aider si tu as des questions sur tes droits.`,
      `🦊 ${jr} ${hour}h. La durée maximale journalière est 10h (Art. L3121-18). La semaine maximale est 48h (Art. L3121-20). FOX surveille les deux.`,
      `🦊 [${jr} — ${hour}h] Bonne matinée. Le droit du travail est complexe mais FOX le décortique pour toi. Si une situation te semble anormale, consulte le glossaire.`,
      `🦊 ${jr} ${hour}h. Ton score burn-out FOX est à ${bo}/100. ${bo >= 50 ? 'Zone orange — quelques ajustements s\'imposent cette semaine.' : bo >= 30 ? 'Score modéré — surveille la tendance.' : 'Situation saine — continue ainsi.'}`,
    ];
    return _pick(msgs);
  }

  // ── MIDI 12h–14h ────────────────────────────────
  if (hour < 14) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] Heure de déjeuner. Ta pause est un droit : 20 min minimum après 6h de travail (Art. L3121-16). Prends-la vraiment.`,
      `🦊 ${jr} ${hour}h — pause méridienne. Mange loin de ton écran si tu peux. Les coupures réelles améliorent la concentration et protègent contre le burn-out.`,
      `🦊 [${jr} midi — ${hour}h] Une vraie coupure à midi, c'est de la prévention active. Ton score burn-out FOX : ${bo}/100 — le repas tranquille fait baisser le compteur.`,
      `🦊 ${jr} ${hour}h. Si tu manges à ton poste parce qu'on te l'impose, ces minutes peuvent être du temps de travail effectif. Note-le si c'est régulier.`,
      `🦊 [${jr} — ${hour}h] Midi. Les pauses ne font pas partie du temps de travail effectif — sauf si tu dois rester disponible pour intervenir (Art. L3121-2).`,
      `🦊 ${jr} ${hour}h. Mi-journée — le bon moment pour faire un point sur le cumul hebdomadaire dans FOX. Anticipe plutôt que de subir les dépassements.`,
      `🦊 [${jr} midi — ${hour}h] Pause méritée. Rappel : les repas d'affaires ou déjeuners professionnels avec obligation de présence font partie du temps de travail.`,
      `🦊 ${jr} ${hour}h. Le droit du travail prévoit des protections concrètes. FOX les scrute pour toi pendant que tu déjeunes — profites-en.`,
      `🦊 [${jr} — ${hour}h] Midi arrive. ${contPct >= 60 ? '⚠️ Contingent à '+contPct+'% — point avec ton responsable recommandé.' : 'Contingent dans les limites — continue la saisie régulière.'}`,
      `🦊 ${jr} ${hour}h. Si tu n'as pas encore saisi les heures de cette semaine, c'est le bon moment — la mémoire est encore fraîche à midi.`,
    ];
    return _pick(msgs);
  }

  // ── DÉBUT APRÈS-MIDI 14h–17h ──────────────────
  if (hour < 17) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] Après-midi en cours. Si la semaine est chargée, c'est le bon moment pour faire le point sur ton cumul dans FOX.`,
      `🦊 ${jr} ${hour}h. Pense à noter tout événement inhabituel aujourd'hui — rappel imprévu, réunion tardive — ça compte dans les HS si c'est demandé par l'employeur.`,
      `🦊 [${jr} — ${hour}h] Il est ${hour}h. Ton analyse légale FOX se met à jour à chaque saisie — consulte-la pour voir exactement où tu en es ce soir.`,
      `🦊 ${jr} ${hour}h. Les heures sup se calculent sur la semaine civile complète — surveille le cumul total, pas juste la journée isolée d'aujourd'hui.`,
      `🦊 [${jr} après-midi — ${hour}h] Après-midi actif. Si tu dépasses tes horaires habituels ce soir, saisis-le immédiatement dans M1 ou M2.`,
      `🦊 ${jr} ${hour}h. FOX surveille ta situation légale en continu. Si une alerte rouge apparaît, c'est basé sur tes données réelles — prends-la au sérieux.`,
      `🦊 [${jr} — ${hour}h] Il est ${hour}h. Si tu travailles encore, note l'heure de dépassement — le moment exact où tu dépasses ta base journalière est important.`,
      `🦊 ${jr} ${hour}h. Rappel : les temps de déplacement professionnels (hors domicile-travail habituel) font partie du temps de travail effectif (Art. L3121-4).`,
      `🦊 [${jr} — ${hour}h] Après-midi en cours. ${avgViol ? '⚠️ La moyenne de 44h/12 sem est franchie — Art. L3121-22 en jeu. Parle-en à ton représentant.' : 'Moyenne hebdomadaire dans les limites légales.'}`,
      `🦊 ${jr} ${hour}h. Ton burn-out FOX : ${bo}/100. ${bo >= 50 ? 'Score élevé — quelques actions de récupération s\'imposent ce soir.' : 'Situation saine — maintiens les pauses régulières.'}`,
      `🦊 [${jr} — ${hour}h] Il est ${hour}h de l'après-midi. La saisie en temps réel dans FOX est toujours plus précise que la reconstitution a posteriori.`,
      `🦊 ${jr} ${hour}h. Si des HS sont prévues ce soir, anticipe : informe quelqu'un de ton heure de fin tardive prévue — la transparence protège les deux parties.`,
    ];
    return _pick(msgs);
  }

  // ── FIN D'APRÈS-MIDI 17h–19h ───────────────────
  if (hour < 19) {
    const msgs = [
      `🦊 [${jr} — ${hour}h] La journée tire à sa fin. Si tu dépasses l'heure habituelle, saisis l'heure exacte dans FOX — chaque minute compte.`,
      `🦊 ${jr} ${hour}h — fin d'après-midi. Si tu restes au-delà de ta base, ces heures s'ajoutent au contingent annuel. Saisis-les dès que possible.`,
      `🦊 [${jr} — ${hour}h] Bientôt la fin. La saisie immédiate est toujours plus fiable que la reconstitution le lendemain matin.`,
      `🦊 ${jr} ${hour}h. Ton droit à la déconnexion commence à ta sortie (Art. L2242-17) — aucune obligation légale de répondre après.`,
      `🦊 [${jr} — ${hour}h] ${semTot > 0 ? 'Semaine à '+_fmtH(semTot)+' en cours.' : 'Semaine sans HS saisies pour l\'instant.'} ${weekViol ? '⚠️ Dépasse le plafond légal de 48h.' : 'Dans les limites.'}`,
      `🦊 ${jr} ${hour}h. Si tu envisages de rester ce soir, calcule d'abord : heure de fin + 11h = heure de reprise légale minimale demain (Art. L3131-1).`,
      `🦊 [${jr} — ${hour}h] Fin de journée approche. ${contPct >= 70 ? '⚠️ Contingent à '+contPct+'% — zone de vigilance.' : 'Contingent bien géré — continue le suivi régulier.'}`,
      `🦊 ${jr} ${hour}h. Les HS non saisies dans FOX ne sont pas perdues — la prescription est de 3 ans (Art. L3245-1). Mais la saisie immédiate reste la meilleure preuve.`,
      `🦊 [${jr} — ${hour}h] Approche de la sortie. Si des HS ont eu lieu cette semaine, vérifie qu'elles sont toutes bien saisies dans M1 ou M2 avant de partir.`,
      `🦊 ${jr} ${hour}h. La saisie régulière dans FOX te donne un avantage : ton historique est daté, horodaté et difficile à contester en cas de litige.`,
    ];
    return _pick(msgs);
  }

  // ── SOIRÉE 19h–23h ──────────────────────────────
  const msgs_fin = [
    `🦊 [${jr} — ${hour}h] Il est tard. Ton repos de 11h consécutives est obligatoire avant la prochaine prise de poste (Art. L3131-1).`,
    `🦊 ${jr} ${hour}h — si tu travailles encore, ces heures de soirée sont du temps de travail effectif à déclarer dans FOX.`,
    `🦊 [${jr} — ${hour}h] Soirée. Le droit à la déconnexion te protège (Art. L2242-17). Au-delà de 21h, certaines conventions prévoient une majoration de nuit.`,
    `🦊 ${jr} ${hour}h. Si tu as saisi des heures cette semaine, elles sont bien enregistrées. Bonne soirée ${pr}— ton repos est ta meilleure préparation.`,
    `🦊 [${jr} — ${hour}h] Soirée en cours. Si tu travailles, note l'heure exacte — ton repos de 11h part de ta sortie réelle, pas de l'heure théorique.`,
    `🦊 ${jr} ${hour}h. En soirée, le droit du travail continue de s'appliquer. Les heures après 21h méritent attention — vérifie si ta convention prévoit une majoration.`,
    `🦊 [${jr} — ${hour}h] Il est ${hour}h. Ton contingent annuel : ${contH > 0 ? contH+'h / 220h légales' : 'aucune donnée saisie cette année'}. FOX attend tes saisies.`,
    `🦊 ${jr} ${hour}h. Si la semaine a été chargée, le bilan dans FOX te donnera le statut légal exact. ${weekViol ? '⚠️ Semaine au-delà de 48h détectée.' : 'Semaine dans les limites.'}`,
    `🦊 [${jr} — ${hour}h] Soirée. Ton score burn-out FOX : ${bo}/100. ${bo >= 50 ? 'Zone orange — prends soin de ton repos ce soir.' : 'Situation saine — maintiens les bonnes habitudes.'}`,
    `🦊 ${jr} ${hour}h. Fin de journée — si des HS ont eu lieu, saisis-les maintenant. Dans 24h, les détails précis commencent à s'estomper.`,
    `🦊 [${jr} soir — ${hour}h] Si tu consultes FOX à cette heure, tu es probablement encore au travail ou tu viens de rentrer. Pense à saisir tes heures ce soir.`,
    `🦊 ${jr} ${hour}h. En soirée, l'employeur ne peut pas exiger une disponibilité permanente sauf astreinte formellement prévue et rémunérée (Art. L3121-9).`,
    `🦊 [${jr} — ${hour}h] Soirée. Les semaines qui s'accumulent méritent un suivi sérieux — FOX te montre la tendance sur 12 semaines glissantes.`,
    `🦊 ${jr} ${hour}h. Si tu penses à FOX en soirée, c'est bon signe — tu es vigilant sur tes droits. Mais n'oublie pas aussi de te reposer.`,
    `🦊 [${jr} soir — ${hour}h] ${avgViol ? '⚠️ La moyenne de 44h/12 sem est franchie — situation à corriger collectivement (Art. L3121-22).' : 'Moyenne hebdomadaire correcte. Continue la saisie régulière.'}`,
  ];
  return _pick(msgs_fin);
}
