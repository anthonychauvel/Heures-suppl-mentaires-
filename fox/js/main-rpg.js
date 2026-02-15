// FOX main-rpg.js \u2014 v4-fix-final
// ===== MAIN RPG CONTROLLER =====
// Orchestration principale du jeu

// \u00C9tat global du jeu
let gameState = {
    player: {
        name: "H\u00E9ros",
        title: "Apprenti Travailleur",
        level: 1,
        xp: 0,
        energy: 100,
        wisdom: 0,
        chapter: 1
    },
    hours: {
        weekly: 0,
        monthly: 0,
        annual: 0,
        total: 0
    },
    currentScene: 'office',
    unlockedScenes: ['office']
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('\uD83E\uDD8A Module 3 RPG - Ultimate charg\u00E9!');
    try { initializeGame(); } catch(e) { console.warn('initializeGame:', e); }
    try { loadGameState(); } catch(e) { console.warn('loadGameState:', e); }
    try { updateAllDisplays(); } catch(e) { console.warn('updateAllDisplays:', e); }
    try { setupEventListeners(); } catch(e) { console.warn('setupEventListeners:', e); }
    try { showWelcomeMessage(); } catch(e) { console.warn('showWelcomeMessage:', e); }
});

// Initialiser le jeu
function initializeGame() {
    // V\u00E9rifier si c'est la premi\u00E8re fois
    const isFirstTime = !localStorage.getItem('rpg_game_state');
    
    if (isFirstTime) {
        showTutorial();
    }
}

// Charger l'\u00E9tat du jeu
function loadGameState() {
    const saved = localStorage.getItem('rpg_game_state');
    if (saved) {
        gameState = JSON.parse(saved);
    }
    
    // Synchroniser avec les syst\u00E8mes
    xpSystem.currentXP = gameState.player.xp;
    xpSystem.level = gameState.player.level;
}

// Sauvegarder l'\u00E9tat du jeu
function saveGameState() {
    gameState.player.xp = xpSystem.currentXP;
    gameState.player.level = xpSystem.level;
    localStorage.setItem('rpg_game_state', JSON.stringify(gameState));
}

// Helper s\u00E9curis\u00E9 \u2014 \u00E9vite les erreurs si l'\u00E9l\u00E9ment n'existe pas dans le DOM
function _set(id, val, prop) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prop === 'width') el.style.width = val;
    else if (prop === 'html') el.innerHTML = val;
    else el.textContent = val;
}

// Mettre \u00E0 jour tous les affichages
function updateAllDisplays() {
    try { updatePlayerStats(); } catch(e) {}
    try { updateLeague(); } catch(e) {}
    try { updateXPBar(); } catch(e) {}
    try { updateVitalStats(); } catch(e) {}
    try { updateQuickStats(); } catch(e) {}
}

// Mettre \u00E0 jour les stats du joueur
function updatePlayerStats() {
    _set('level-display', gameState.player.level);
    _set('current-xp', xpSystem.currentXP);
    _set('next-level-xp', xpSystem.getXPForNextLevel(gameState.player.level));
    const progress = xpSystem.getCurrentLevelProgress();
    _set('xp-progress', progress.percentage + '%', 'width');
}

// Mettre \u00E0 jour la ligue
function updateLeague() {
    const league = leagueSystem.getCurrentLeague(xpSystem.currentXP);
    _set('league-display', league.name);
}

// Mettre \u00E0 jour la barre XP
function updateXPBar() {
    const progress = xpSystem.getCurrentLevelProgress();
    _set('xp-progress', progress.percentage + '%', 'width');
}

// Mettre \u00E0 jour les stats vitales
function updateVitalStats() {
    _set('energy-current', gameState.player.energy);
    _set('energy-bar', gameState.player.energy + '%', 'width');
    _set('wisdom-current', gameState.player.wisdom);
    _set('wisdom-bar', (gameState.player.wisdom / 100) * 100 + '%', 'width');
}

// Mettre \u00E0 jour les stats rapides
function updateQuickStats() {
    _set('total-hours', gameState.hours.total.toFixed(1) + 'h');
    try {
        const scenariosStats = scenarioSystemAI.getStats();
        _set('scenarios-count', scenariosStats.read + '/600');
        _set('scenarios-read-count', scenariosStats.read);
        _set('scenarios-favorites', scenariosStats.favorites);
    } catch(e) {}
    try {
        const badgesStats = badgeSystem.getBadgeStats();
        _set('badges-count', badgesStats.unlocked + '/50');
    } catch(e) {}
    
    const questsStats = questSystem.getStats();
    document.getElementById('quests-active').textContent = questsStats.active;
}

// Configuration des \u00E9couteurs d'\u00E9v\u00E9nements
function setupEventListeners() {
    // Onglets de contenu
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchContentPanel(this.dataset.content);
        });
    });

    // Bouton de g\u00E9n\u00E9ration de sc\u00E9nario
    const genBtn = document.getElementById('generate-scenario-btn'); if (genBtn) genBtn.addEventListener('click', generateScenarioWithAI);

    // Bouton parler \u00E0 Kitsune
    const foxBtn = document.getElementById('talk-to-fox'); if (foxBtn) foxBtn.addEventListener('click', openKitsuneDialogue);

    // Bouton d'ajout d'heures
    const addBtn = document.getElementById('add-hours-btn'); if (addBtn) addBtn.addEventListener('click', addHoursAndAnalyze);

    // Fermeture du modal
    const closeBtn = document.querySelector('.close'); if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Input IA
    const sendBtn = document.getElementById('send-ai-message'); if (sendBtn) sendBtn.addEventListener('click', sendMessageToKitsune);
    const aiInp = document.getElementById('ai-input'); if (aiInp) aiInp.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessageToKitsune();
    });
}

// Changer de panneau de contenu
function switchContentPanel(panelName) {
    // D\u00E9sactiver tous les panneaux
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activer le panneau s\u00E9lectionn\u00E9
    document.getElementById(`${panelName}-panel`).classList.add('active');
    document.querySelector(`[data-content="${panelName}"]`).classList.add('active');

    // Actions sp\u00E9cifiques par panneau
    if (panelName === 'scenarios') {
        loadScenarios();
    } else if (panelName === 'quests') {
        loadQuests();
    }
}

// G\u00E9n\u00E9rer un sc\u00E9nario avec l'IA
async function generateScenarioWithAI() {
    const type = document.getElementById('scenario-type').value;
    const difficulty = document.getElementById('scenario-difficulty').value;
    const context = document.getElementById('scenario-context').value;

    showNotification('\uD83E\uDD16 Kitsune g\u00E9n\u00E8re votre sc\u00E9nario...', 'info');

    const result = await aiIntegration.generateScenario(type, difficulty, context);

    if (result.error) {
        showNotification('\u274C ' + result.error, 'error');
        if (result.fallback) {
            displayGeneratedScenario(result.fallback);
        }
        return;
    }

    displayGeneratedScenario(result);
    showNotification('\u2728 Sc\u00E9nario g\u00E9n\u00E9r\u00E9 avec succ\u00E8s!', 'success');

    // Ajouter XP et sagesse pour avoir g\u00E9n\u00E9r\u00E9 un sc\u00E9nario
    addXP(50);
    addWisdom(5);

    // Mettre \u00E0 jour la progression de qu\u00EAte
    questSystem.updateQuestProgress('side_002', 'gen_ai_10', 1);

    saveGameState();
}

// Afficher le sc\u00E9nario g\u00E9n\u00E9r\u00E9
function displayGeneratedScenario(scenario) {
    const container = document.getElementById('generated-scenario');
    
    document.getElementById('generated-title').textContent = scenario.title;
    document.getElementById('generated-difficulty').textContent = scenario.difficulty;
    document.getElementById('generated-difficulty').className = `difficulty-badge ${scenario.difficulty}`;
    
    document.getElementById('generated-content').innerHTML = `
        <p><strong>Personnage :</strong> ${scenario.character} - ${scenario.profession}</p>
        <p><strong>Situation :</strong> ${scenario.situation}</p>
    `;
    
    document.getElementById('generated-advice').innerHTML = `
        <h4>\uD83D\uDCA1 Conseil Juridique</h4>
        <p>${scenario.advice}</p>
        <p style="margin-top: 15px;"><em>R\u00E9f\u00E9rence : ${scenario.legalReference}</em></p>
    `;
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    // Sauvegarder le sc\u00E9nario IA
    scenarioSystemAI.addAIScenario(scenario);
}

// Ouvrir le dialogue avec Kitsune
function openKitsuneDialogue() {
    const modal = document.getElementById('ai-modal');
    modal.classList.add('show');
    
    // Message d'accueil
    if (aiIntegration.conversationHistory.length === 0) {
        addToConversation('Bonjour! Je suis Kitsune, ton guide dans ce monde du droit du travail. Pose-moi tes questions! \uD83E\uDD8A', 'assistant');
    }
}

// Fermer le modal
function closeModal() {
    document.getElementById('ai-modal').classList.remove('show');
}

// Envoyer un message \u00E0 Kitsune
async function sendMessageToKitsune() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Afficher le message de l'utilisateur
    addToConversation(message, 'user');
    input.value = '';

    // Afficher le chargement
    showAILoading(true);

    // Envoyer \u00E0 l'IA
    const response = await aiIntegration.chatWithKitsune(message);

    showAILoading(false);

    if (response.error) {
        addToConversation(response.message, 'assistant');
    } else {
        addToConversation(response.message, 'assistant');
        
        // R\u00E9compenser l'interaction
        gameState.player.energy = Math.max(0, gameState.player.energy - 2);
        addWisdom(3);
        
        // Mettre \u00E0 jour qu\u00EAte
        questSystem.updateQuestProgress('main_001', 'talk_to_kitsune', 1);
        questSystem.updateQuestProgress('daily_002', 'ask_kitsune', 1);
    }

    saveGameState();
    updateAllDisplays();
}

// Ajouter \u00E0 la conversation
function addToConversation(message, role) {
    const container = document.getElementById('ai-conversation');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    messageEl.innerHTML = `
        <div class="message-avatar">${role === 'user' ? '\uD83D\uDC64' : '\uD83E\uDD8A'}</div>
        <div class="message-bubble">${message}</div>
    `;
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// Ajouter des heures et analyser
async function addHoursAndAnalyze() {
    const hours = parseFloat(document.getElementById('hours-worked').value);
    const type = document.getElementById('hours-type').value;
    const period = document.getElementById('tracking-period').value;

    if (!hours || hours <= 0) {
        showNotification('\u26A0\uFE0F Veuillez entrer un nombre d\'heures valide', 'warning');
        return;
    }

    // Ajouter aux totaux
    switch (period) {
        case 'weekly':
            gameState.hours.weekly += hours;
            break;
        case 'monthly':
            gameState.hours.monthly += hours;
            break;
        case 'annual':
            gameState.hours.annual += hours;
            break;
    }
    gameState.hours.total += hours;

    // Ajouter XP (100 XP par heure)
    const xpGained = Math.floor(hours * 100);
    const result = addXP(xpGained);

    // Analyser avec l'IA
    const analysis = await aiIntegration.analyzeLegalCompliance(hours, gameState.hours.weekly, { type });
    displayLegalAnalysis(analysis);

    // Notification
    showNotification(`\u2705 ${hours}h ajout\u00E9es! +${xpGained} XP`, 'success');

    if (result.leveledUp) {
        setTimeout(() => {
            showNotification(`\uD83C\uDF89 NIVEAU ${result.newLevel}!`, 'success');
            playLevelUpAnimation();
        }, 500);
    }

    // Mettre \u00E0 jour qu\u00EAtes
    questSystem.updateQuestProgress('main_001', 'track_hours', 1);
    if (hours > 35) {
        questSystem.updateQuestProgress('main_002', 'track_overtime', 1);
    }

    // R\u00E9initialiser
    document.getElementById('hours-worked').value = '';
    
    saveGameState();
    updateAllDisplays();
}

// Afficher l'analyse l\u00E9gale
function displayLegalAnalysis(analysis) {
    const statusEl = document.getElementById('legal-status');
    const calcEl = document.getElementById('overtime-calc');
    
    if (analysis.isCompliant) {
        statusEl.innerHTML = `<div style="color: var(--success);">\u2705 Conforme au droit du travail</div>`;
    } else {
        statusEl.innerHTML = `<div style="color: var(--danger);">\u26A0\uFE0F Alertes d\u00E9tect\u00E9es:</div>
            <ul>${analysis.alerts.map(a => `<li>${a}</li>`).join('')}</ul>`;
    }

    calcEl.innerHTML = `
        <p>8 premi\u00E8res heures (+25%): ${analysis.overtimeBreakdown.at25}h</p>
        <p>Au-del\u00E0 (+50%): ${analysis.overtimeBreakdown.at50}h</p>
    `;
}

// Ajouter de l'XP
function addXP(amount) {
    const oldLevel = xpSystem.level;
    const result = xpSystem.addXP(amount / 100); // Convertir en heures
    
    gameState.player.xp = xpSystem.currentXP;
    gameState.player.level = xpSystem.level;
    
    return result;
}

// Ajouter de la sagesse
function addWisdom(amount) {
    gameState.player.wisdom = Math.min(100, gameState.player.wisdom + amount);
    updateVitalStats();
}

// Charger les sc\u00E9narios
function loadScenarios() {
    const container = document.getElementById('scenarios-list');
    const scenarios = scenarioSystemAI.getAllScenarios().slice(0, 20); // Charger les 20 premiers
    
    container.innerHTML = '';
    
    scenarios.forEach(scenario => {
        const card = createScenarioCard(scenario);
        container.appendChild(card);
    });
}

// Cr\u00E9er une carte de sc\u00E9nario
function createScenarioCard(scenario) {
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.innerHTML = `
        <h4>${scenario.title}</h4>
        <p class="category">${scenario.category}</p>
        <p>${scenario.situation}</p>
        <button onclick="readScenario(${scenario.id})" class="btn-primary">Lire</button>
    `;
    return card;
}

// Lire un sc\u00E9nario
function readScenario(scenarioId) {
    const scenario = scenarioSystemAI.getScenarioById(scenarioId);
    if (!scenario) return;

    // Marquer comme lu
    const wasNew = scenarioSystemAI.markAsRead(scenarioId);
    
    if (wasNew) {
        // R\u00E9compenser
        addXP(scenario.xpReward || 100);
        addWisdom(scenario.wisdomReward || 5);
        
        // Mettre \u00E0 jour qu\u00EAtes
        questSystem.updateQuestProgress('main_001', 'read_5_scenarios', 1);
        questSystem.updateQuestProgress('side_001', 'read_50', 1);
        questSystem.updateQuestProgress('daily_001', 'read_3_today', 1);
        
        showNotification(`\uD83D\uDCDA Sc\u00E9nario lu! +${scenario.xpReward || 100} XP`, 'success');
    }

    saveGameState();
    updateAllDisplays();
}

// Charger les qu\u00EAtes
function loadQuests() {
    loadActiveQuests();
    loadAvailableQuests();
    loadCompletedQuests();
}

function loadActiveQuests() {
    const container = document.getElementById('active-quests');
    const quests = questSystem.getActiveQuests();
    
    container.innerHTML = '';
    quests.forEach(quest => {
        const card = createQuestCard(quest, 'active');
        container.appendChild(card);
    });
}

function loadAvailableQuests() {
    const container = document.getElementById('available-quests');
    const quests = questSystem.getAvailableQuests();
    
    container.innerHTML = '';
    quests.forEach(quest => {
        const card = createQuestCard(quest, 'available');
        container.appendChild(card);
    });
}

function loadCompletedQuests() {
    const container = document.getElementById('completed-quests');
    const quests = questSystem.getCompletedQuests();
    
    container.innerHTML = '';
    quests.forEach(quest => {
        const card = createQuestCard(quest, 'completed');
        container.appendChild(card);
    });
}

function createQuestCard(quest, status) {
    const card = document.createElement('div');
    card.className = `quest-card ${quest.type} ${status}`;
    
    let buttonHTML = '';
    if (status === 'available') {
        buttonHTML = `<button onclick="acceptQuest('${quest.id}')" class="btn-primary">Accepter</button>`;
    }
    
    card.innerHTML = `
        <h4>${quest.title}</h4>
        <p class="quest-type">${quest.type.toUpperCase()}</p>
        <p>${quest.description}</p>
        ${buttonHTML}
    `;
    
    return card;
}

function acceptQuest(questId) {
    const result = questSystem.acceptQuest(questId);
    if (result.success) {
        showNotification(`\uD83D\uDCDC Qu\u00EAte accept\u00E9e: ${result.quest.title}`, 'success');
        loadQuests();
    } else {
        showNotification(`\u274C ${result.error}`, 'error');
    }
}

// D\u00E9marrer une nouvelle qu\u00EAte (action du monde)
function startNewQuest() {
    switchContentPanel('quests');
    showNotification('\uD83D\uDCDC Consultez vos qu\u00EAtes disponibles!', 'info');
}

// Explorer le monde
function exploreWorld() {
    showNotification('\uD83D\uDDFA\uFE0F Fonctionnalit\u00E9 \u00E0 venir: Exploration du monde!', 'info');
}

// Parler \u00E0 Kitsune (raccourci)
function talkToKitsune() {
    openKitsuneDialogue();
}

// Ouvrir le g\u00E9n\u00E9rateur de sc\u00E9narios
function openScenarioGenerator() {
    switchContentPanel('scenarios');
    document.querySelector('.scenario-generator').scrollIntoView({ behavior: 'smooth' });
}

// D\u00E9marrer un combat
function startBattle() {
    const enemy = combatSystem.getRandomEnemy(gameState.player.level);
    if (!enemy) {
        showNotification('Aucun ennemi disponible \u00E0 votre niveau!', 'warning');
        return;
    }

    const result = combatSystem.startBattle(enemy.id);
    if (result.success) {
        displayBattle(result.battle);
    }
}

function displayBattle(battle) {
    // Mettre \u00E0 jour l'affichage du combat
    document.getElementById('enemy-avatar').textContent = battle.enemy.avatar;
    document.getElementById('enemy-name').textContent = battle.enemy.name;
    document.getElementById('enemy-hp').textContent = battle.enemy.hp;
    
    updateBattleDisplay(battle);
    
    // Afficher les actions
    const actionsEl = document.getElementById('combat-actions');
    actionsEl.innerHTML = `
        <button class="combat-btn" onclick="playerAttack()">\u2694\uFE0F Attaquer</button>
        <button class="combat-btn" onclick="legalStrike()">\u2696\uFE0F Frappe L\u00E9gale</button>
        <button class="combat-btn" onclick="defendAction()">\uD83D\uDEE1\uFE0F D\u00E9fendre</button>
    `;
}

function updateBattleDisplay(battle) {
    // Mise \u00E0 jour des barres de vie
    const playerHpPercent = (battle.playerHp / battle.playerMaxHp) * 100;
    const enemyHpPercent = (battle.enemy.hp / battle.enemy.maxHp) * 100;
    
    document.getElementById('player-health').style.width = playerHpPercent + '%';
    document.getElementById('enemy-health').style.width = enemyHpPercent + '%';
    
    document.getElementById('player-hp').textContent = battle.playerHp;
    document.getElementById('enemy-hp').textContent = battle.enemy.hp;
    
    // Mise \u00E0 jour du log
    const log = combatSystem.getCombatLog();
    const logEl = document.getElementById('combat-log');
    logEl.innerHTML = log.map(entry => `<p class="${entry.type}">${entry.message}</p>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
}

function playerAttack() {
    const result = combatSystem.playerAction('attack');
    handleBattleResult(result);
}

function legalStrike() {
    const result = combatSystem.playerAction('legal_strike');
    handleBattleResult(result);
}

function defendAction() {
    const result = combatSystem.playerAction('defend');
    handleBattleResult(result);
}

function handleBattleResult(result) {
    const battle = combatSystem.getCurrentBattle();
    if (battle) {
        updateBattleDisplay(battle);
    }

    if (result.status === 'victory') {
        showNotification('\uD83C\uDF89 VICTOIRE!', 'success');
        addXP(result.rewards.xp);
        addWisdom(result.rewards.wisdom);
        
        questSystem.updateQuestProgress('side_003', 'win_5_battles', 1);
        
        setTimeout(() => {
            document.getElementById('combat-actions').innerHTML = `
                <button class="combat-btn" onclick="startBattle()">\uD83C\uDFAE Nouveau Combat</button>
            `;
        }, 2000);
    } else if (result.status === 'defeat') {
        showNotification('\uD83D\uDC80 D\u00E9faite...', 'error');
        setTimeout(() => {
            document.getElementById('combat-actions').innerHTML = `
                <button class="combat-btn" onclick="startBattle()">\uD83D\uDD04 R\u00E9essayer</button>
            `;
        }, 2000);
    }

    saveGameState();
    updateAllDisplays();
}

// Animations
function playLevelUpAnimation() {
    // TODO: Ajouter une animation de niveau sup\u00E9rieur
}

// Afficher le message de bienvenue
function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('\uD83E\uDD8A Bienvenue dans Module 3 RPG!', 'info');
    }, 1000);
}

// Afficher le tutoriel
function showTutorial() {
    // TODO: Impl\u00E9menter le tutoriel interactif
}

// Syst\u00E8me de notifications
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:80px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = 'background:rgba(30,30,30,0.95);border:1px solid rgba(255,140,66,0.4);color:#fff;padding:10px 16px;border-radius:10px;font-size:0.85rem;box-shadow:0 4px 20px rgba(0,0,0,0.4);';
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Ouvrir les menus
function openMenu(menuType) {
    switch (menuType) {
        case 'inventory':
            showNotification('\uD83C\uDF92 Inventaire - Fonctionnalit\u00E9 \u00E0 venir!', 'info');
            break;
        case 'achievements':
            showNotification('\uD83C\uDFC6 Succ\u00E8s - Fonctionnalit\u00E9 \u00E0 venir!', 'info');
            break;
        case 'collection':
            switchContentPanel('scenarios');
            break;
        case 'settings':
            showNotification('\u2699\uFE0F Options - Fonctionnalit\u00E9 \u00E0 venir!', 'info');
            break;
    }
}

// ===== FONCTIONS MODULES 1 & 2 =====

function refreshModule1() {
    moduleReader.syncWithGameState();
    displayModule1();
    showNotification('\uD83D\uDCC5 Module 1 actualis\u00E9', 'success');
}

function refreshModule2() {
    moduleReader.syncWithGameState();
    displayModule2();
    showNotification('\uD83D\uDCCA Module 2 actualis\u00E9', 'success');
}

function displayModule1() {
    const m1 = moduleReader.getModule1Summary();
    const container = document.getElementById('module1-display');
    if (!container) return;
    container.innerHTML = `
        <div class="module-summary">
            <h4>${m1.monthName} ${m1.year}</h4>
            <div class="stat-row">
                <span>Heures totales:</span>
                <strong>${m1.totalHours.toFixed(1)}h</strong>
            </div>
            <div class="stat-row">
                <span>Moyenne hebdomadaire:</span>
                <strong>${m1.weeklyAverage}h</strong>
            </div>
            <div class="stat-row">
                <span>Heures suppl\u00E9mentaires:</span>
                <strong>${m1.overtimeHours.toFixed(1)}h</strong>
            </div>
            <div class="compliance-badge ${m1.isCompliant ? 'compliant' : 'non-compliant'}">
                ${m1.isCompliant ? '\u2705 Conforme' : '\u26A0\uFE0F Non conforme'}
            </div>
            ${m1.alerts.length > 0 ? `
                <div class="alerts-section">
                    ${m1.alerts.map(a => `<div class="alert ${a.level}">${a.message}</div>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function displayModule2() {
    const m2 = moduleReader.getModule2Summary();
    const container = document.getElementById('module2-display');
    if (!container) return;
    container.innerHTML = `
        <div class="module-summary">
            <h4>Ann\u00E9e ${m2.year}</h4>
            <div class="stat-row">
                <span>Heures totales:</span>
                <strong>${m2.totalHours.toFixed(1)}h</strong>
            </div>
            <div class="contingent-bar">
                <div class="contingent-label">Contingent: ${m2.contingent.used.toFixed(1)}h / ${m2.contingent.total}h</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${m2.contingent.percentage}%; background: ${m2.contingent.percentage > 100 ? 'var(--danger)' : 'var(--primary)'}"></div>
                </div>
                <div class="contingent-remaining">${m2.contingent.remaining.toFixed(1)}h restantes</div>
            </div>
            <div class="stat-row">
                <span>Moyenne mensuelle:</span>
                <strong>${m2.monthlyAverage}h</strong>
            </div>
            <div class="stat-row">
                <span>Projection annuelle:</span>
                <strong>${m2.projectedAnnual.value}h</strong>
            </div>
            <div class="breakdown-section">
                <h5>R\u00E9partition des HS:</h5>
                <div>+25%: ${m2.breakdown.at25}h</div>
                <div>+50%: ${m2.breakdown.at50}h</div>
            </div>
            ${m2.alerts.length > 0 ? `
                <div class="alerts-section">
                    ${m2.alerts.map(a => `<div class="alert ${a.level}">${a.message}</div>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function exportModule1() {
    moduleReader.exportModuleData(1);
    showNotification('\uD83D\uDCE5 Module 1 export\u00E9 en JSON', 'success');
}

function exportModule2() {
    moduleReader.exportModuleData(2);
    showNotification('\uD83D\uDCE5 Module 2 export\u00E9 en JSON', 'success');
}

// ===== FONCTIONS SNAPSHOTS =====

function createSnapshot() {
    const nameInput = document.getElementById('snapshot-name');
    const name = nameInput.value.trim();
    
    const result = snapshotSystem.createSnapshot(name || null, false);
    
    if (result.success) {
        showNotification(`\uD83D\uDCF8 ${result.message}`, 'success');
        nameInput.value = '';
        loadSnapshotsList();
    } else {
        showNotification(`\u274C ${result.error}`, 'error');
    }
}

function loadSnapshotsList() {
    if (typeof snapshotSystem === 'undefined') return;
    const snapshots = snapshotSystem.getAllSnapshots();
    const container = document.getElementById('snapshots-list');
    if (!container) return;
    const stats = snapshotSystem.getStats();
    
    // Mettre \u00E0 jour les stats
    _set('snapshot-total', stats.total);
    _set('snapshot-manual', stats.manual);
    _set('snapshot-auto', stats.automatic);
    
    if (snapshots.length === 0) {
        container.innerHTML = '<p class="placeholder">Aucun snapshot cr\u00E9\u00E9</p>';
        return;
    }
    
    container.innerHTML = snapshots.map(snap => `
        <div class="snapshot-card ${snap.automatic ? 'auto' : 'manual'}">
            <div class="snapshot-header">
                <h4>${snap.name}</h4>
                <span class="snapshot-badge">${snap.automatic ? '\u23F0 Auto' : '\uD83D\uDC64 Manuel'}</span>
            </div>
            <div class="snapshot-info">
                <div>\uD83D\uDCC5 ${new Date(snap.timestamp).toLocaleString('fr-FR')}</div>
                <div>\u2B50 Niveau ${snap.data.xp.level} | \uD83D\uDC8E ${snap.data.xp.currentXP} XP</div>
            </div>
            <div class="snapshot-actions">
                <button onclick="restoreSnapshot('${snap.id}')" class="btn-primary small">\uD83D\uDD04 Restaurer</button>
                <button onclick="exportSnapshotFile('${snap.id}')" class="btn-secondary small">\uD83D\uDCE5 Export</button>
                <button onclick="deleteSnapshot('${snap.id}')" class="btn-danger small">\uD83D\uDDD1\uFE0F Supprimer</button>
            </div>
        </div>
    `).join('');
}

function restoreSnapshot(snapshotId) {
    if (!confirm('\u26A0\uFE0F Restaurer ce snapshot ? L\'\u00E9tat actuel sera remplac\u00E9.')) return;
    
    const result = snapshotSystem.restoreSnapshot(snapshotId);
    
    if (result.success) {
        showNotification(`\uD83D\uDD04 ${result.message}`, 'success');
        updateAllDisplays();
        location.reload(); // Recharger pour appliquer tous les changements
    } else {
        showNotification(`\u274C ${result.error}`, 'error');
    }
}

function deleteSnapshot(snapshotId) {
    if (!confirm('Supprimer ce snapshot ?')) return;
    
    const result = snapshotSystem.deleteSnapshot(snapshotId);
    
    if (result.success) {
        showNotification(`\uD83D\uDDD1\uFE0F ${result.message}`, 'success');
        loadSnapshotsList();
    } else {
        showNotification(`\u274C ${result.error}`, 'error');
    }
}

function exportSnapshotFile(snapshotId) {
    const result = snapshotSystem.exportSnapshot(snapshotId);
    if (result.success) {
        showNotification('\uD83D\uDCE5 Snapshot export\u00E9', 'success');
    }
}

function toggleAutoSnapshots() {
    const btn = document.getElementById('auto-snapshot-btn');
    const isActive = snapshotSystem.autoSnapshotInterval !== null;
    
    if (isActive) {
        snapshotSystem.disableAutoSnapshots();
        btn.textContent = '\u23F0 Auto: OFF';
        showNotification('Auto-snapshots d\u00E9sactiv\u00E9s', 'info');
    } else {
        snapshotSystem.enableAutoSnapshots(30);
        btn.textContent = '\u23F0 Auto: ON (30 min)';
        showNotification('Auto-snapshots activ\u00E9s (30 min)', 'success');
    }
}

function cleanupSnapshots() {
    const result = snapshotSystem.cleanupAutoSnapshots(5);
    showNotification(`\uD83E\uDDF9 ${result.message}`, 'success');
    loadSnapshotsList();
}

// ===== FONCTIONS EXPORT =====

function exportRTFFull() {
    const result = rtfExport.exportFullReport();
    if (result.success) {
        localStorage.setItem('FOX_RTF_EXPORTED', '1');
        showNotification('\uD83D\uDCDD Rapport RTF complet g\u00E9n\u00E9r\u00E9', 'success');
    }
}

function exportRTFModule1() {
    const result = rtfExport.exportModule1Report();
    if (result.success) {
        showNotification('\uD83D\uDCDD Rapport Module 1 RTF g\u00E9n\u00E9r\u00E9', 'success');
    }
}

function exportRTFModule2() {
    const result = rtfExport.exportModule2Report();
    if (result.success) {
        showNotification('\uD83D\uDCDD Rapport Module 2 RTF g\u00E9n\u00E9r\u00E9', 'success');
    }
}

function exportRTFProgress() {
    const result = rtfExport.exportProgressReport();
    if (result.success) {
        showNotification('\uD83D\uDCDD Rapport de progression RTF g\u00E9n\u00E9r\u00E9', 'success');
    }
}

function exportJSONFull() {
    const fullData = {
        gameState: gameState,
        xp: { currentXP: xpSystem.currentXP, level: xpSystem.level },
        badges: badgeSystem.unlockedBadges,
        scenarios: scenarioSystemAI.getStats(),
        quests: questSystem.getStats(),
        module1: moduleReader.module1Data,
        module2: moduleReader.module2Data,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `module3_rpg_complet_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('\uD83D\uDCE6 Export JSON complet r\u00E9ussi', 'success');
}

function triggerImport() {
    document.getElementById('import-file').click();
}

function importSnapshot() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const result = await snapshotSystem.importSnapshot(file);
        
        if (result.success) {
            showNotification('\uD83D\uDCBE Snapshot import\u00E9 avec succ\u00E8s', 'success');
            loadSnapshotsList();
        } else {
            showNotification(`\u274C ${result.error}`, 'error');
        }
    };
    input.click();
}

// Initialiser les affichages au chargement des panneaux
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser Module 1 & 2
    try { displayModule1(); } catch(e) { console.warn('displayModule1:', e); }
    try { displayModule2(); } catch(e) { console.warn('displayModule2:', e); }
    
    // Initialiser Snapshots
    try { loadSnapshotsList(); } catch(e) { console.warn('loadSnapshotsList:', e); }
    
    // Event listener pour cr\u00E9er un snapshot
    const snapBtn = document.getElementById('create-snapshot-btn'); if (snapBtn) snapBtn.addEventListener('click', createSnapshot);
    
    // Event listener pour l'import de fichier
    const importFile = document.getElementById('import-file'); if (importFile) importFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Restaurer les donn\u00E9es
            if (data.gameState) gameState = data.gameState;
            if (data.xp) {
                xpSystem.currentXP = data.xp.currentXP;
                xpSystem.level = data.xp.level;
            }
            
            showNotification('\uD83D\uDCC2 Donn\u00E9es import\u00E9es avec succ\u00E8s', 'success');
            updateAllDisplays();
            location.reload();
            
        } catch (error) {
            showNotification('\u274C Erreur lors de l\'import', 'error');
        }
    });
});

// Sauvegarder automatiquement toutes les 30 secondes
setInterval(() => {
    saveGameState();
    moduleReader.syncWithGameState();
}, 30000);

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', () => {
    saveGameState();
});


// \u2500\u2500 Syst\u00E8me de badges : construction des stats r\u00E9elles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function buildBadgeStats() {
  try {
    const cum  = moduleReader.getCumulatedSummary ? moduleReader.getCumulatedSummary() : {};
    const cumH = moduleReader.getCumulatedHours   ? moduleReader.getCumulatedHours()   : {};
    const bo   = moduleReader.getBurnoutScore     ? moduleReader.getBurnoutScore()     : { score: 0 };
    const xp   = typeof xpSystem     !== 'undefined' ? xpSystem.currentXP : 0;
    const lvl  = typeof xpSystem     !== 'undefined' ? xpSystem.level     : 1;
    const leagueId = typeof leagueSystem !== 'undefined'
      ? (leagueSystem.getCurrentLeague(xp).id || 0) : 0;
    const badgesUnlocked = typeof badgeSystem !== 'undefined'
      ? badgeSystem.getUnlockedCount() : 0;

    // Sc\u00E9narios narr\u00E9s par Kitsune
    const narrated = JSON.parse(localStorage.getItem('FOX_SCENARIOS_NARRATED') || '[]');
    const narratedLegal    = narrated.filter(id => id >= 1   && id <= 400).length;
    const narratedWellbeing = narrated.filter(id => id >= 401).length;

    // Burn-out peak
    const currentBo   = bo.score || 0;
    const storedPeak  = parseInt(localStorage.getItem('FOX_BURNOUT_PEAK') || '0');
    const burnoutPeak = Math.max(currentBo, storedPeak);
    if (currentBo > storedPeak) localStorage.setItem('FOX_BURNOUT_PEAK', String(currentBo));

    // M1 + M2 simultan\u00E9s
    let hasM1andM2 = false;
    const history = moduleReader.getFullHistory ? moduleReader.getFullHistory() : { years: [], history: {} };
    for (const y of history.years || []) {
      const d = history.history[y];
      if (d && d.m1 && d.m1.hasData && d.m2 && d.m2.hasData) { hasM1andM2 = true; break; }
    }

    // Contingent (% du 220h l\u00E9gal)
    const totalOT = cum.totalNetOvertime || 0;
    const contingentPercent = cumH.contingentPercent != null
      ? cumH.contingentPercent
      : Math.min(100, Math.round((totalOT / 220) * 100));

    return {
      // XP / ligue
      totalXP  : xp,
      level    : lvl,
      league   : leagueId,
      // Heures
      totalHours   : totalOT,
      totalPlus25  : cum.totalPlus25  || 0,
      totalPlus50  : cum.totalPlus50  || 0,
      // Temps
      monthsTracked : cum.monthCount || 0,
      yearsTracked  : (cum.years || []).length,
      // Burn-out
      burnoutScore : currentBo,
      burnoutPeak  : burnoutPeak,
      // Contingent
      contingentPercent : contingentPercent,
      // Badges
      badgesUnlocked : badgesUnlocked,
      // Sc\u00E9narios
      scenariosRead      : narrated.length,    // compat badges existants
      scenariosNarrated  : narrated.length,
      scenariosLegal     : narratedLegal,
      scenariosWellbeing : narratedWellbeing,
      // Actions
      exportedData : !!localStorage.getItem('FOX_RTF_EXPORTED'),
      hasM1andM2   : hasM1andM2,
      // Non track\u00E9 (badges existants li\u00E9s \u00E0 ces stats ne se d\u00E9clenchent pas encore)
      consecutiveDays : 0,
      weekendHours    : 0,
      earlyHours      : 0,
      nightHours      : 0,
      foxInteractions : 0,
      readInfo        : false,
    };
  } catch(e) {
    console.warn('buildBadgeStats:', e);
    return {};
  }
}

// V\u00E9rifier et notifier les nouveaux badges d\u00E9bloqu\u00E9s
function checkAndAwardBadges() {
  try {
    if (typeof badgeSystem === 'undefined') return;
    const stats     = buildBadgeStats();
    const newBadges = badgeSystem.checkAndUnlockBadges(stats);
    for (const badge of newBadges) {
      const rarityColors = {
        common: '#7FB3D3', rare: '#82E0AA', epic: '#BB8FCE', legendary: '#F4D03F'
      };
      const color = rarityColors[badge.rarity] || '#FF8C42';
      showNotification(
        '\u{1F3C5} Badge d\u00E9bloqu\u00E9 : ' + badge.name + ' (' + badge.description + ')',
        'success',
        4000
      );
      // Bonus XP pour chaque badge d\u00E9bloqu\u00E9
      if (typeof xpSystem !== 'undefined') {
        const xpReward = { common: 50, rare: 150, epic: 400, legendary: 1000 };
        const gained = xpReward[badge.rarity] || 50;
        xpSystem.addXP(gained / 100); // addXP prend des heures (\u00D7100 = XP)
        console.log('\u{1F3C5} Badge : ' + badge.name + ' \u2192 +' + gained + ' XP');
      }
    }
    return newBadges;
  } catch(e) {
    console.warn('checkAndAwardBadges:', e);
    return [];
  }
}
