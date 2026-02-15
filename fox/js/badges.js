// ===== BADGE SYSTEM =====
// Gère les 50 badges répartis en 4 raretés

class BadgeSystem {
    constructor() {
        this.badges = this.initializeBadges();
        this.unlockedBadges = this.loadUnlockedBadges();
    }

    // Initialiser les 50 badges
    initializeBadges() {
        return [
            // COMMUN (20 badges)
            { id: 1, img: '../images/Premier_Pas.PNG', name: 'Premier Pas', icon: '👣', rarity: 'common', description: 'Première heure sup enregistrée', condition: (stats) => stats.totalHours >= 1 },
            { id: 2, img: '../images/Debutant.PNG', name: 'Débutant', icon: '🌱', rarity: 'common', description: '5 heures sup', condition: (stats) => stats.totalHours >= 5 },
            { id: 3, img: '../images/Regulier.PNG', name: 'Régulier', icon: '📅', rarity: 'common', description: '10 heures sup', condition: (stats) => stats.totalHours >= 10 },
            { id: 4, img: '../images/Assidu.PNG', name: 'Assidu', icon: '⏰', rarity: 'common', description: '20 heures sup', condition: (stats) => stats.totalHours >= 20 },
            { id: 5, img: '../images/Travailleur.PNG', name: 'Travailleur', icon: '💼', rarity: 'common', description: '30 heures sup', condition: (stats) => stats.totalHours >= 30 },
            { id: 6, img: '../images/Explorateur.PNG', name: 'Explorateur', icon: '🗺️', rarity: 'common', description: 'Consulter 5 scénarios', condition: (stats) => stats.scenariosRead >= 5 },
            { id: 7, img: '../images/Curieux.PNG', name: 'Curieux', icon: '🔍', rarity: 'common', description: 'Consulter 10 scénarios', condition: (stats) => stats.scenariosRead >= 10 },
            { id: 8, img: '../images/Niveau_2.PNG', name: 'Niveau 2', icon: '🎯', rarity: 'common', description: 'Atteindre le niveau 2', condition: (stats) => stats.level >= 2 },
            { id: 9, img: '../images/Niveau_5.PNG', name: 'Niveau 5', icon: '🎯', rarity: 'common', description: 'Atteindre le niveau 5', condition: (stats) => stats.level >= 5 },
            { id: 10, img: '../images/Matinal.PNG', name: 'Matinal', icon: '🌅', rarity: 'common', description: '5 heures sup avant 8h', condition: (stats) => stats.earlyHours >= 5 },
            { id: 11, img: '../images/Nocturne.PNG', name: 'Nocturne', icon: '🌙', rarity: 'common', description: '5 heures sup après 21h', condition: (stats) => stats.nightHours >= 5 },
            { id: 12, img: '../images/Weekend_Warrior.PNG', name: 'Weekend Warrior', icon: '🏖️', rarity: 'common', description: '5 heures sup le weekend', condition: (stats) => stats.weekendHours >= 5 },
            { id: 13, img: '../images/Mensuel.PNG', name: 'Mensuel', icon: '📊', rarity: 'common', description: 'Premier mois complété', condition: (stats) => stats.monthsTracked >= 1 },
            { id: 14, img: '../images/XP_Hunter.PNG', name: 'XP Hunter', icon: '⭐', rarity: 'common', description: '1000 XP accumulés', condition: (stats) => stats.totalXP >= 1000 },
            { id: 15, img: '../images/Sage.PNG', name: 'Sage', icon: '📚', rarity: 'common', description: 'Lire toute la section Infos', condition: (stats) => stats.readInfo },
            { id: 16, img: '../images/Organise.PNG', name: 'Organisé', icon: '📋', rarity: 'common', description: 'Exporter ses données', condition: (stats) => stats.exportedData },
            { id: 17, img: '../images/Ami_du_Renard.PNG', name: 'Ami du Renard', icon: '🦊', rarity: 'common', description: 'Interagir 10 fois avec le renard', condition: (stats) => stats.foxInteractions >= 10 },
            { id: 18, img: '../images/Regularite_Bronze.PNG', name: 'Régularité Bronze', icon: '🥉', rarity: 'common', description: 'Atteindre la ligue Bronze', condition: (stats) => stats.league >= 1 },
            { id: 19, img: '../images/Marathonien.PNG', name: 'Marathonien', icon: '🏃', rarity: 'common', description: '40 heures sup', condition: (stats) => stats.totalHours >= 40 },
            { id: 20, img: '../images/Consciencieux.PNG', name: 'Consciencieux', icon: '✅', rarity: 'common', description: 'Tracker 7 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 7 },

            // RARE (15 badges)
            { id: 21, img: '../images/Perseverant.PNG', name: 'Persévérant', icon: '💪', rarity: 'rare', description: '50 heures sup', condition: (stats) => stats.totalHours >= 50 },
            { id: 22, img: '../images/Acharne.PNG', name: 'Acharné', icon: '🔥', rarity: 'rare', description: '75 heures sup', condition: (stats) => stats.totalHours >= 75 },
            { id: 23, img: '../images/Niveau_10.PNG', name: 'Niveau 10', icon: '🎯', rarity: 'rare', description: 'Atteindre le niveau 10', condition: (stats) => stats.level >= 10 },
            { id: 24, img: '../images/Regularite_Argent.PNG', name: 'Régularité Argent', icon: '🥈', rarity: 'rare', description: 'Atteindre la ligue Argent', condition: (stats) => stats.league >= 2 },
            { id: 25, img: '../images/Regularite_Or.PNG', name: 'Régularité Or', icon: '🥇', rarity: 'rare', description: 'Atteindre la ligue Or', condition: (stats) => stats.league >= 3 },
            { id: 26, img: '../images/Erudit.PNG', name: 'Érudit', icon: '🎓', rarity: 'rare', description: 'Consulter 25 scénarios', condition: (stats) => stats.scenariosRead >= 25 },
            { id: 27, img: '../images/Expert.PNG', name: 'Expert', icon: '🧠', rarity: 'rare', description: 'Consulter 50 scénarios', condition: (stats) => stats.scenariosRead >= 50 },
            { id: 28, img: '../images/Trimestre.PNG', name: 'Trimestre', icon: '📆', rarity: 'rare', description: '3 mois de suivi', condition: (stats) => stats.monthsTracked >= 3 },
            { id: 29, img: '../images/XP_Master.PNG', name: 'XP Master', icon: '🌟', rarity: 'rare', description: '5000 XP accumulés', condition: (stats) => stats.totalXP >= 5000 },
            { id: 30, img: '../images/Centenaire.PNG', name: 'Centenaire', icon: '💯', rarity: 'rare', description: '100 heures sup', condition: (stats) => stats.totalHours >= 100 },
            { id: 31, img: '../images/Noctambule.PNG', name: 'Noctambule', icon: '🦉', rarity: 'rare', description: '20 heures sup de nuit', condition: (stats) => stats.nightHours >= 20 },
            { id: 32, img: '../images/Leve-tot.PNG', name: 'Lève-tôt', icon: '🐓', rarity: 'rare', description: '20 heures sup matinales', condition: (stats) => stats.earlyHours >= 20 },
            { id: 33, img: '../images/Sans_Weekend.PNG', name: 'Sans Weekend', icon: '⚠️', rarity: 'rare', description: '20 heures sup le weekend', condition: (stats) => stats.weekendHours >= 20 },
            { id: 34, img: '../images/Fidele.PNG', name: 'Fidèle', icon: '🎖️', rarity: 'rare', description: 'Tracker 30 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 30 },
            { id: 35, img: '../images/Collectionneur.PNG', name: 'Collectionneur', icon: '🏅', rarity: 'rare', description: 'Débloquer 10 badges', condition: (stats) => stats.badgesUnlocked >= 10 },

            // ÉPIQUE (10 badges)
            { id: 36, img: '../images/Infatigable.PNG', name: 'Infatigable', icon: '⚡', rarity: 'epic', description: '150 heures sup', condition: (stats) => stats.totalHours >= 150 },
            { id: 37, img: '../images/Niveau_20.PNG', name: 'Niveau 20', icon: '🎯', rarity: 'epic', description: 'Atteindre le niveau 20', condition: (stats) => stats.level >= 20 },
            { id: 38, img: '../images/Regularite_Platine.PNG', name: 'Régularité Platine', icon: '💎', rarity: 'epic', description: 'Atteindre la ligue Platine', condition: (stats) => stats.league >= 4 },
            { id: 39, img: '../images/Regularite_Diamant.PNG', name: 'Régularité Diamant', icon: '💠', rarity: 'epic', description: 'Atteindre la ligue Diamant', condition: (stats) => stats.league >= 5 },
            { id: 40, img: '../images/Encyclopedie.PNG', name: 'Encyclopédie', icon: '📖', rarity: 'epic', description: 'Consulter 100 scénarios', condition: (stats) => stats.scenariosRead >= 100 },
            { id: 41, img: '../images/Semestre.PNG', name: 'Semestre', icon: '📅', rarity: 'epic', description: '6 mois de suivi', condition: (stats) => stats.monthsTracked >= 6 },
            { id: 42, img: '../images/XP_Legend.PNG', name: 'XP Legend', icon: '✨', rarity: 'epic', description: '10000 XP accumulés', condition: (stats) => stats.totalXP >= 10000 },
            { id: 43, img: '../images/Bicentenaire.PNG', name: 'Bicentenaire', icon: '🔟', rarity: 'epic', description: '200 heures sup', condition: (stats) => stats.totalHours >= 200 },
            { id: 44, img: '../images/Devotion.PNG', name: 'Dévotion', icon: '🙏', rarity: 'epic', description: 'Tracker 60 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 60 },
            { id: 45, img: '../images/Grand_Collectionneur.PNG', name: 'Grand Collectionneur', icon: '🏆', rarity: 'epic', description: 'Débloquer 25 badges', condition: (stats) => stats.badgesUnlocked >= 25 },


            // COMPÉTENCES (15 badges — IDs 51-65)
            { id: 51, img: '../images/Initie.PNG',           name: 'Initié',            icon: '🦊', rarity: 'common',    description: 'Premier scénario narré par Kitsune',                   condition: (s) => s.scenariosNarrated >= 1 },
            { id: 52,   name: 'Surplus +25%',      icon: '📈', rarity: 'common',    description: 'Premières HS à +25% détectées',                        condition: (s) => s.totalPlus25 > 0 },
            { id: 53,   name: 'Surplus +50%',      icon: '📊', rarity: 'common',    description: 'Premières HS à +50% détectées',                        condition: (s) => s.totalPlus50 > 0 },
            { id: 54, img: '../images/Alerte_Jaune.PNG',     name: 'Alerte Jaune',      icon: '💛', rarity: 'common',    description: 'Score burn-out > 20 détecté',                          condition: (s) => s.burnoutPeak > 20 },
            { id: 55,          name: 'Exporté',           icon: '📄', rarity: 'common',    description: 'Premier rapport RTF exporté',                          condition: (s) => s.exportedData },
            { id: 56,        name: 'Narrateur',         icon: '📖', rarity: 'rare',      description: '10 scénarios narrés par Kitsune',                      condition: (s) => s.scenariosNarrated >= 10 },
            { id: 57, img: '../images/Juriste_Junior.PNG',   name: 'Juriste Junior',    icon: '⚖️', rarity: 'rare',      description: '5 scénarios juridiques narrés',                        condition: (s) => s.scenariosLegal >= 5 },
            { id: 58, img: '../images/Alerte_Orange.PNG',    name: 'Alerte Orange',     icon: '🟠', rarity: 'rare',      description: 'Score burn-out > 50 détecté',                          condition: (s) => s.burnoutPeak > 50 },
            { id: 59, img: '../images/Contingent_25.PNG',    name: 'Contingent 25%',    icon: '🕐', rarity: 'rare',      description: '25% du contingent annuel consommé (55h/220h)',          condition: (s) => s.contingentPercent >= 25 },
            { id: 60,        name: 'Bien-Être',         icon: '🌿', rarity: 'rare',      description: '3 scénarios bien-être narrés par Kitsune',             condition: (s) => s.scenariosWellbeing >= 3 },
            { id: 61,  name: 'Grand Narrateur',   icon: '📚', rarity: 'epic',      description: '30 scénarios narrés par Kitsune',                      condition: (s) => s.scenariosNarrated >= 30 },
            { id: 62, img: '../images/Contingent_Mi.PNG',    name: 'Contingent 50%',    icon: '⏰', rarity: 'epic',      description: '50% du contingent annuel consommé (110h/220h)',         condition: (s) => s.contingentPercent >= 50 },
            { id: 63, img: '../images/Alerte_Rouge.PNG',  name: 'Alerte Rouge',      icon: '🔴', rarity: 'epic',      description: 'Score burn-out > 70 — situation critique',              condition: (s) => s.burnoutPeak > 70 },
            { id: 64,      name: 'Multi-Années',      icon: '📅', rarity: 'epic',      description: 'Données sur au moins 2 années différentes',             condition: (s) => s.yearsTracked >= 2 },
            { id: 65, img: '../images/Renard_Omniscient.PNG',    name: 'Renard Expert',     icon: '🏆', rarity: 'legendary', description: 'Contingent 220h dépassé — tu connais le prix des heures', condition: (s) => s.contingentPercent >= 100 },

            // LÉGENDAIRE (5 badges)
            { id: 46, img: '../images/Titan.PNG', name: 'Titan', icon: '⚔️', rarity: 'legendary', description: '300 heures sup', condition: (stats) => stats.totalHours >= 300 },
            { id: 47, img: '../images/Niveau_50.PNG', name: 'Niveau 50', icon: '👑', rarity: 'legendary', description: 'Atteindre le niveau 50', condition: (stats) => stats.level >= 50 },
            { id: 48, img: '../images/Legende_Vivante.PNG', name: 'Légende Vivante', icon: '🏆', rarity: 'legendary', description: 'Atteindre la ligue Légende', condition: (stats) => stats.league >= 10 },
            { id: 49, img: '../images/Annee_Complete.PNG', name: 'Année Complète', icon: '🎊', rarity: 'legendary', description: '12 mois de suivi', condition: (stats) => stats.monthsTracked >= 12 },
            { id: 50, img: '../images/Maitre_Absolu.PNG', name: 'Maître Absolu', icon: '🌌', rarity: 'legendary', description: 'Débloquer tous les autres badges', condition: (stats) => stats.badgesUnlocked >= 49 }
        ];
    }

    // Charger les badges débloqués depuis le localStorage
    loadUnlockedBadges() {
        const saved = localStorage.getItem('rpg_unlocked_badges');
        return saved ? JSON.parse(saved) : [];
    }

    // Sauvegarder les badges débloqués
    saveUnlockedBadges() {
        localStorage.setItem('rpg_unlocked_badges', JSON.stringify(this.unlockedBadges));
    }

    // Vérifier et débloquer les badges
    checkAndUnlockBadges(stats) {
        const newlyUnlocked = [];
        
        for (let badge of this.badges) {
            // Si le badge n'est pas déjà débloqué et que la condition est remplie
            if (!this.unlockedBadges.includes(badge.id) && badge.condition(stats)) {
                this.unlockedBadges.push(badge.id);
                newlyUnlocked.push(badge);
            }
        }
        
        if (newlyUnlocked.length > 0) {
            this.saveUnlockedBadges();
        }
        
        return newlyUnlocked;
    }

    // Obtenir tous les badges par rareté
    getBadgesByRarity(rarity) {
        if (rarity === 'all') {
            return this.badges;
        }
        return this.badges.filter(b => b.rarity === rarity);
    }

    // Obtenir le nombre de badges débloqués
    getUnlockedCount() {
        return this.unlockedBadges.length;
    }

    // Vérifier si un badge est débloqué
    isBadgeUnlocked(badgeId) {
        return this.unlockedBadges.includes(badgeId);
    }

    // Obtenir les statistiques des badges
    getBadgeStats() {
        const byRarity = {
            common: { total: 0, unlocked: 0 },
            rare: { total: 0, unlocked: 0 },
            epic: { total: 0, unlocked: 0 },
            legendary: { total: 0, unlocked: 0 }
        };
        
        for (let badge of this.badges) {
            byRarity[badge.rarity].total++;
            if (this.isBadgeUnlocked(badge.id)) {
                byRarity[badge.rarity].unlocked++;
            }
        }
        
        return {
            total: this.badges.length,
            unlocked: this.unlockedBadges.length,
            byRarity: byRarity,
            completionPercentage: (this.unlockedBadges.length / this.badges.length) * 100
        };
    }

    // Réinitialiser tous les badges
    reset() {
        this.unlockedBadges = [];
        this.saveUnlockedBadges();
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BadgeSystem;
}

// Instance globale
const badgeSystem = new BadgeSystem();
console.log('✅ badgeSystem initialisé');
