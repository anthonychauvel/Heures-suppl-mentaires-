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
            { id: 1, name: 'Premier Pas', icon: '👣', rarity: 'common', description: 'Première heure sup enregistrée', condition: (stats) => stats.totalHours >= 1 },
            { id: 2, name: 'Débutant', icon: '🌱', rarity: 'common', description: '5 heures sup', condition: (stats) => stats.totalHours >= 5 },
            { id: 3, name: 'Régulier', icon: '📅', rarity: 'common', description: '10 heures sup', condition: (stats) => stats.totalHours >= 10 },
            { id: 4, name: 'Assidu', icon: '⏰', rarity: 'common', description: '20 heures sup', condition: (stats) => stats.totalHours >= 20 },
            { id: 5, name: 'Travailleur', icon: '💼', rarity: 'common', description: '30 heures sup', condition: (stats) => stats.totalHours >= 30 },
            { id: 6, name: 'Explorateur', icon: '🗺️', rarity: 'common', description: 'Consulter 5 scénarios', condition: (stats) => stats.scenariosRead >= 5 },
            { id: 7, name: 'Curieux', icon: '🔍', rarity: 'common', description: 'Consulter 10 scénarios', condition: (stats) => stats.scenariosRead >= 10 },
            { id: 8, name: 'Niveau 2', icon: '🎯', rarity: 'common', description: 'Atteindre le niveau 2', condition: (stats) => stats.level >= 2 },
            { id: 9, name: 'Niveau 5', icon: '🎯', rarity: 'common', description: 'Atteindre le niveau 5', condition: (stats) => stats.level >= 5 },
            { id: 10, name: 'Matinal', icon: '🌅', rarity: 'common', description: '5 heures sup avant 8h', condition: (stats) => stats.earlyHours >= 5 },
            { id: 11, name: 'Nocturne', icon: '🌙', rarity: 'common', description: '5 heures sup après 21h', condition: (stats) => stats.nightHours >= 5 },
            { id: 12, name: 'Weekend Warrior', icon: '🏖️', rarity: 'common', description: '5 heures sup le weekend', condition: (stats) => stats.weekendHours >= 5 },
            { id: 13, name: 'Mensuel', icon: '📊', rarity: 'common', description: 'Premier mois complété', condition: (stats) => stats.monthsTracked >= 1 },
            { id: 14, name: 'XP Hunter', icon: '⭐', rarity: 'common', description: '1000 XP accumulés', condition: (stats) => stats.totalXP >= 1000 },
            { id: 15, name: 'Sage', icon: '📚', rarity: 'common', description: 'Lire toute la section Infos', condition: (stats) => stats.readInfo },
            { id: 16, name: 'Organisé', icon: '📋', rarity: 'common', description: 'Exporter ses données', condition: (stats) => stats.exportedData },
            { id: 17, name: 'Ami du Renard', icon: '🦊', rarity: 'common', description: 'Interagir 10 fois avec le renard', condition: (stats) => stats.foxInteractions >= 10 },
            { id: 18, name: 'Régularité Bronze', icon: '🥉', rarity: 'common', description: 'Atteindre la ligue Bronze', condition: (stats) => stats.league >= 1 },
            { id: 19, name: 'Marathonien', icon: '🏃', rarity: 'common', description: '40 heures sup', condition: (stats) => stats.totalHours >= 40 },
            { id: 20, name: 'Consciencieux', icon: '✅', rarity: 'common', description: 'Tracker 7 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 7 },

            // RARE (15 badges)
            { id: 21, name: 'Persévérant', icon: '💪', rarity: 'rare', description: '50 heures sup', condition: (stats) => stats.totalHours >= 50 },
            { id: 22, name: 'Acharné', icon: '🔥', rarity: 'rare', description: '75 heures sup', condition: (stats) => stats.totalHours >= 75 },
            { id: 23, name: 'Niveau 10', icon: '🎯', rarity: 'rare', description: 'Atteindre le niveau 10', condition: (stats) => stats.level >= 10 },
            { id: 24, name: 'Régularité Argent', icon: '🥈', rarity: 'rare', description: 'Atteindre la ligue Argent', condition: (stats) => stats.league >= 2 },
            { id: 25, name: 'Régularité Or', icon: '🥇', rarity: 'rare', description: 'Atteindre la ligue Or', condition: (stats) => stats.league >= 3 },
            { id: 26, name: 'Érudit', icon: '🎓', rarity: 'rare', description: 'Consulter 25 scénarios', condition: (stats) => stats.scenariosRead >= 25 },
            { id: 27, name: 'Expert', icon: '🧠', rarity: 'rare', description: 'Consulter 50 scénarios', condition: (stats) => stats.scenariosRead >= 50 },
            { id: 28, name: 'Trimestre', icon: '📆', rarity: 'rare', description: '3 mois de suivi', condition: (stats) => stats.monthsTracked >= 3 },
            { id: 29, name: 'XP Master', icon: '🌟', rarity: 'rare', description: '5000 XP accumulés', condition: (stats) => stats.totalXP >= 5000 },
            { id: 30, name: 'Centenaire', icon: '💯', rarity: 'rare', description: '100 heures sup', condition: (stats) => stats.totalHours >= 100 },
            { id: 31, name: 'Noctambule', icon: '🦉', rarity: 'rare', description: '20 heures sup de nuit', condition: (stats) => stats.nightHours >= 20 },
            { id: 32, name: 'Lève-tôt', icon: '🐓', rarity: 'rare', description: '20 heures sup matinales', condition: (stats) => stats.earlyHours >= 20 },
            { id: 33, name: 'Sans Weekend', icon: '⚠️', rarity: 'rare', description: '20 heures sup le weekend', condition: (stats) => stats.weekendHours >= 20 },
            { id: 34, name: 'Fidèle', icon: '🎖️', rarity: 'rare', description: 'Tracker 30 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 30 },
            { id: 35, name: 'Collectionneur', icon: '🏅', rarity: 'rare', description: 'Débloquer 10 badges', condition: (stats) => stats.badgesUnlocked >= 10 },

            // ÉPIQUE (10 badges)
            { id: 36, name: 'Infatigable', icon: '⚡', rarity: 'epic', description: '150 heures sup', condition: (stats) => stats.totalHours >= 150 },
            { id: 37, name: 'Niveau 20', icon: '🎯', rarity: 'epic', description: 'Atteindre le niveau 20', condition: (stats) => stats.level >= 20 },
            { id: 38, name: 'Régularité Platine', icon: '💎', rarity: 'epic', description: 'Atteindre la ligue Platine', condition: (stats) => stats.league >= 4 },
            { id: 39, name: 'Régularité Diamant', icon: '💠', rarity: 'epic', description: 'Atteindre la ligue Diamant', condition: (stats) => stats.league >= 5 },
            { id: 40, name: 'Encyclopédie', icon: '📖', rarity: 'epic', description: 'Consulter 100 scénarios', condition: (stats) => stats.scenariosRead >= 100 },
            { id: 41, name: 'Semestre', icon: '📅', rarity: 'epic', description: '6 mois de suivi', condition: (stats) => stats.monthsTracked >= 6 },
            { id: 42, name: 'XP Legend', icon: '✨', rarity: 'epic', description: '10000 XP accumulés', condition: (stats) => stats.totalXP >= 10000 },
            { id: 43, name: 'Bicentenaire', icon: '🔟', rarity: 'epic', description: '200 heures sup', condition: (stats) => stats.totalHours >= 200 },
            { id: 44, name: 'Dévotion', icon: '🙏', rarity: 'epic', description: 'Tracker 60 jours consécutifs', condition: (stats) => stats.consecutiveDays >= 60 },
            { id: 45, name: 'Grand Collectionneur', icon: '🏆', rarity: 'epic', description: 'Débloquer 25 badges', condition: (stats) => stats.badgesUnlocked >= 25 },

            // LÉGENDAIRE (5 badges)
            { id: 46, name: 'Titan', icon: '⚔️', rarity: 'legendary', description: '300 heures sup', condition: (stats) => stats.totalHours >= 300 },
            { id: 47, name: 'Niveau 50', icon: '👑', rarity: 'legendary', description: 'Atteindre le niveau 50', condition: (stats) => stats.level >= 50 },
            { id: 48, name: 'Légende Vivante', icon: '🏆', rarity: 'legendary', description: 'Atteindre la ligue Légende', condition: (stats) => stats.league >= 10 },
            { id: 49, name: 'Année Complète', icon: '🎊', rarity: 'legendary', description: '12 mois de suivi', condition: (stats) => stats.monthsTracked >= 12 },
            { id: 50, name: 'Maître Absolu', icon: '🌌', rarity: 'legendary', description: 'Débloquer tous les autres badges', condition: (stats) => stats.badgesUnlocked >= 49 }
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
