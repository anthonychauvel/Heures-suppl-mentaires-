// ===== BADGE SYSTEM =====
// G\u00E8re les 50 badges r\u00E9partis en 4 raret\u00E9s

class BadgeSystem {
    constructor() {
        this.badges = this.initializeBadges();
        this.unlockedBadges = this.loadUnlockedBadges();
    }

    // Initialiser les 50 badges
    initializeBadges() {
        return [
            // COMMUN (20 badges)
            { id: 1, img: '../images/Premier_Pas.PNG', name: 'Premier Pas', icon: '\uD83D\uDC63', rarity: 'common', description: 'Premi\u00E8re heure sup enregistr\u00E9e', condition: (stats) => stats.totalHours >= 1 },
            { id: 2, img: '../images/Debutant.PNG', name: 'D\u00E9butant', icon: '\uD83C\uDF31', rarity: 'common', description: '5 heures sup', condition: (stats) => stats.totalHours >= 5 },
            { id: 3, img: '../images/Regulier.PNG', name: 'R\u00E9gulier', icon: '\uD83D\uDCC5', rarity: 'common', description: '10 heures sup', condition: (stats) => stats.totalHours >= 10 },
            { id: 4, img: '../images/Assidu.PNG', name: 'Assidu', icon: '\u23F0', rarity: 'common', description: '20 heures sup', condition: (stats) => stats.totalHours >= 20 },
            { id: 5, img: '../images/Travailleur.PNG', name: 'Travailleur', icon: '\uD83D\uDCBC', rarity: 'common', description: '30 heures sup', condition: (stats) => stats.totalHours >= 30 },
            { id: 6, img: '../images/Explorateur.PNG', name: 'Explorateur', icon: '\uD83D\uDDFA\uFE0F', rarity: 'common', description: 'Consulter 5 sc\u00E9narios', condition: (stats) => stats.scenariosRead >= 5 },
            { id: 7, img: '../images/Curieux.PNG', name: 'Curieux', icon: '\uD83D\uDD0D', rarity: 'common', description: 'Consulter 10 sc\u00E9narios', condition: (stats) => stats.scenariosRead >= 10 },
            { id: 8, img: '../images/Niveau_2.PNG', name: 'Niveau 2', icon: '\uD83C\uDFAF', rarity: 'common', description: 'Atteindre le niveau 2', condition: (stats) => stats.level >= 2 },
            { id: 9, img: '../images/Niveau_5.PNG', name: 'Niveau 5', icon: '\uD83C\uDFAF', rarity: 'common', description: 'Atteindre le niveau 5', condition: (stats) => stats.level >= 5 },
            { id: 10, img: '../images/Matinal.PNG', name: 'Matinal', icon: '\uD83C\uDF05', rarity: 'common', description: '5 heures sup avant 8h', condition: (stats) => stats.earlyHours >= 5 },
            { id: 11, img: '../images/Nocturne.PNG', name: 'Nocturne', icon: '\uD83C\uDF19', rarity: 'common', description: '5 heures sup apr\u00E8s 21h', condition: (stats) => stats.nightHours >= 5 },
            { id: 12, img: '../images/Weekend_Warrior.PNG', name: 'Weekend Warrior', icon: '\uD83C\uDFD6\uFE0F', rarity: 'common', description: '5 heures sup le weekend', condition: (stats) => stats.weekendHours >= 5 },
            { id: 13, img: '../images/Mensuel.PNG', name: 'Mensuel', icon: '\uD83D\uDCCA', rarity: 'common', description: 'Premier mois compl\u00E9t\u00E9', condition: (stats) => stats.monthsTracked >= 1 },
            { id: 14, img: '../images/XP_Hunter.PNG', name: 'XP Hunter', icon: '\u2B50', rarity: 'common', description: '1000 XP accumul\u00E9s', condition: (stats) => stats.totalXP >= 1000 },
            { id: 15, img: '../images/Sage.PNG', name: 'Sage', icon: '\uD83D\uDCDA', rarity: 'common', description: 'Lire toute la section Infos', condition: (stats) => stats.readInfo },
            { id: 16, img: '../images/Organise.PNG', name: 'Organis\u00E9', icon: '\uD83D\uDCCB', rarity: 'common', description: 'Exporter ses donn\u00E9es', condition: (stats) => stats.exportedData },
            { id: 17, img: '../images/Ami_du_Renard.PNG', name: 'Ami du Renard', icon: '\uD83E\uDD8A', rarity: 'common', description: 'Interagir 10 fois avec le renard', condition: (stats) => stats.foxInteractions >= 10 },
            { id: 18, img: '../images/Regularite_Bronze.PNG', name: 'R\u00E9gularit\u00E9 Bronze', icon: '\uD83E\uDD49', rarity: 'common', description: 'Atteindre la ligue Bronze', condition: (stats) => stats.league >= 1 },
            { id: 19, img: '../images/Marathonien.PNG', name: 'Marathonien', icon: '\uD83C\uDFC3', rarity: 'common', description: '40 heures sup', condition: (stats) => stats.totalHours >= 40 },
            { id: 20, img: '../images/Consciencieux.PNG', name: 'Consciencieux', icon: '\u2705', rarity: 'common', description: 'Tracker 7 jours cons\u00E9cutifs', condition: (stats) => stats.consecutiveDays >= 7 },

            // RARE (15 badges)
            { id: 21, img: '../images/Perseverant.PNG', name: 'Pers\u00E9v\u00E9rant', icon: '\uD83D\uDCAA', rarity: 'rare', description: '50 heures sup', condition: (stats) => stats.totalHours >= 50 },
            { id: 22, img: '../images/Acharne.PNG', name: 'Acharn\u00E9', icon: '\uD83D\uDD25', rarity: 'rare', description: '75 heures sup', condition: (stats) => stats.totalHours >= 75 },
            { id: 23, img: '../images/Niveau_10.PNG', name: 'Niveau 10', icon: '\uD83C\uDFAF', rarity: 'rare', description: 'Atteindre le niveau 10', condition: (stats) => stats.level >= 10 },
            { id: 24, img: '../images/Regularite_Argent.PNG', name: 'R\u00E9gularit\u00E9 Argent', icon: '\uD83E\uDD48', rarity: 'rare', description: 'Atteindre la ligue Argent', condition: (stats) => stats.league >= 2 },
            { id: 25, img: '../images/Regularite_Or.PNG', name: 'R\u00E9gularit\u00E9 Or', icon: '\uD83E\uDD47', rarity: 'rare', description: 'Atteindre la ligue Or', condition: (stats) => stats.league >= 3 },
            { id: 26, img: '../images/Erudit.PNG', name: '\u00C9rudit', icon: '\uD83C\uDF93', rarity: 'rare', description: 'Consulter 25 sc\u00E9narios', condition: (stats) => stats.scenariosRead >= 25 },
            { id: 27, img: '../images/Expert.PNG', name: 'Expert', icon: '\uD83E\uDDE0', rarity: 'rare', description: 'Consulter 50 sc\u00E9narios', condition: (stats) => stats.scenariosRead >= 50 },
            { id: 28, img: '../images/Trimestre.PNG', name: 'Trimestre', icon: '\uD83D\uDCC6', rarity: 'rare', description: '3 mois de suivi', condition: (stats) => stats.monthsTracked >= 3 },
            { id: 29, img: '../images/XP_Master.PNG', name: 'XP Master', icon: '\uD83C\uDF1F', rarity: 'rare', description: '5000 XP accumul\u00E9s', condition: (stats) => stats.totalXP >= 5000 },
            { id: 30, img: '../images/Centenaire.PNG', name: 'Centenaire', icon: '\uD83D\uDCAF', rarity: 'rare', description: '100 heures sup', condition: (stats) => stats.totalHours >= 100 },
            { id: 31, img: '../images/Noctambule.PNG', name: 'Noctambule', icon: '\uD83E\uDD89', rarity: 'rare', description: '20 heures sup de nuit', condition: (stats) => stats.nightHours >= 20 },
            { id: 32, img: '../images/Leve-tot.PNG', name: 'L\u00E8ve-t\u00F4t', icon: '\uD83D\uDC13', rarity: 'rare', description: '20 heures sup matinales', condition: (stats) => stats.earlyHours >= 20 },
            { id: 33, img: '../images/Sans_Weekend.PNG', name: 'Sans Weekend', icon: '\u26A0\uFE0F', rarity: 'rare', description: '20 heures sup le weekend', condition: (stats) => stats.weekendHours >= 20 },
            { id: 34, img: '../images/Fidele.PNG', name: 'Fid\u00E8le', icon: '\uD83C\uDF96\uFE0F', rarity: 'rare', description: 'Tracker 30 jours cons\u00E9cutifs', condition: (stats) => stats.consecutiveDays >= 30 },
            { id: 35, img: '../images/Collectionneur.PNG', name: 'Collectionneur', icon: '\uD83C\uDFC5', rarity: 'rare', description: 'D\u00E9bloquer 10 badges', condition: (stats) => stats.badgesUnlocked >= 10 },

            // \u00C9PIQUE (10 badges)
            { id: 36, img: '../images/Infatigable.PNG', name: 'Infatigable', icon: '\u26A1', rarity: 'epic', description: '150 heures sup', condition: (stats) => stats.totalHours >= 150 },
            { id: 37, img: '../images/Niveau_20.PNG', name: 'Niveau 20', icon: '\uD83C\uDFAF', rarity: 'epic', description: 'Atteindre le niveau 20', condition: (stats) => stats.level >= 20 },
            { id: 38, img: '../images/Regularite_Platine.PNG', name: 'R\u00E9gularit\u00E9 Platine', icon: '\uD83D\uDC8E', rarity: 'epic', description: 'Atteindre la ligue Platine', condition: (stats) => stats.league >= 4 },
            { id: 39, img: '../images/Regularite_Diamant.PNG', name: 'R\u00E9gularit\u00E9 Diamant', icon: '\uD83D\uDCA0', rarity: 'epic', description: 'Atteindre la ligue Diamant', condition: (stats) => stats.league >= 5 },
            { id: 40, img: '../images/Encyclopedie.PNG', name: 'Encyclop\u00E9die', icon: '\uD83D\uDCD6', rarity: 'epic', description: 'Consulter 100 sc\u00E9narios', condition: (stats) => stats.scenariosRead >= 100 },
            { id: 41, img: '../images/Semestre.PNG', name: 'Semestre', icon: '\uD83D\uDCC5', rarity: 'epic', description: '6 mois de suivi', condition: (stats) => stats.monthsTracked >= 6 },
            { id: 42, img: '../images/XP_Legend.PNG', name: 'XP Legend', icon: '\u2728', rarity: 'epic', description: '10000 XP accumul\u00E9s', condition: (stats) => stats.totalXP >= 10000 },
            { id: 43, img: '../images/Bicentenaire.PNG', name: 'Bicentenaire', icon: '\uD83D\uDD1F', rarity: 'epic', description: '200 heures sup', condition: (stats) => stats.totalHours >= 200 },
            { id: 44, img: '../images/Devotion.PNG', name: 'D\u00E9votion', icon: '\uD83D\uDE4F', rarity: 'epic', description: 'Tracker 60 jours cons\u00E9cutifs', condition: (stats) => stats.consecutiveDays >= 60 },
            { id: 45, img: '../images/Grand_Collectionneur.PNG', name: 'Grand Collectionneur', icon: '\uD83C\uDFC6', rarity: 'epic', description: 'D\u00E9bloquer 25 badges', condition: (stats) => stats.badgesUnlocked >= 25 },

            // L\u00C9GENDAIRE (5 badges)
            { id: 46, img: '../images/Titan.PNG', name: 'Titan', icon: '\u2694\uFE0F', rarity: 'legendary', description: '300 heures sup', condition: (stats) => stats.totalHours >= 300 },
            { id: 47, img: '../images/Niveau_50.PNG', name: 'Niveau 50', icon: '\uD83D\uDC51', rarity: 'legendary', description: 'Atteindre le niveau 50', condition: (stats) => stats.level >= 50 },
            { id: 48, img: '../images/Legende_Vivante.PNG', name: 'L\u00E9gende Vivante', icon: '\uD83C\uDFC6', rarity: 'legendary', description: 'Atteindre la ligue L\u00E9gende', condition: (stats) => stats.league >= 10 },
            { id: 49, img: '../images/Annee_Complete.PNG', name: 'Ann\u00E9e Compl\u00E8te', icon: '\uD83C\uDF8A', rarity: 'legendary', description: '12 mois de suivi', condition: (stats) => stats.monthsTracked >= 12 },
            { id: 50, img: '../images/Maitre_Absolu.PNG', name: 'Ma\u00EEtre Absolu', icon: '\uD83C\uDF0C', rarity: 'legendary', description: 'D\u00E9bloquer tous les autres badges', condition: (stats) => stats.badgesUnlocked >= 49 }
        ];
    }

    // Charger les badges d\u00E9bloqu\u00E9s depuis le localStorage
    loadUnlockedBadges() {
        const saved = localStorage.getItem('rpg_unlocked_badges');
        return saved ? JSON.parse(saved) : [];
    }

    // Sauvegarder les badges d\u00E9bloqu\u00E9s
    saveUnlockedBadges() {
        localStorage.setItem('rpg_unlocked_badges', JSON.stringify(this.unlockedBadges));
    }

    // V\u00E9rifier et d\u00E9bloquer les badges
    checkAndUnlockBadges(stats) {
        const newlyUnlocked = [];
        
        for (let badge of this.badges) {
            // Si le badge n'est pas d\u00E9j\u00E0 d\u00E9bloqu\u00E9 et que la condition est remplie
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

    // Obtenir tous les badges par raret\u00E9
    getBadgesByRarity(rarity) {
        if (rarity === 'all') {
            return this.badges;
        }
        return this.badges.filter(b => b.rarity === rarity);
    }

    // Obtenir le nombre de badges d\u00E9bloqu\u00E9s
    getUnlockedCount() {
        return this.unlockedBadges.length;
    }

    // V\u00E9rifier si un badge est d\u00E9bloqu\u00E9
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

    // R\u00E9initialiser tous les badges
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
console.log('\u2705 badgeSystem initialis\u00E9');
