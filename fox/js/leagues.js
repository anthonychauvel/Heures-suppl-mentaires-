// ===== LEAGUE SYSTEM =====
// Gère les 10 ligues de progression

class LeagueSystem {
    constructor() {
        this.leagues = [
            { id: 1, name: 'Bronze', icon: '🥉', minXP: 0, color: '#CD7F32' },
            { id: 2, name: 'Argent', icon: '🥈', minXP: 1000, color: '#C0C0C0' },
            { id: 3, name: 'Or', icon: '🥇', minXP: 2500, color: '#FFD700' },
            { id: 4, name: 'Platine', icon: '💎', minXP: 5000, color: '#E5E4E2' },
            { id: 5, name: 'Diamant', icon: '💠', minXP: 8000, color: '#B9F2FF' },
            { id: 6, name: 'Maître', icon: '🌟', minXP: 12000, color: '#FF6B9D' },
            { id: 7, name: 'Grand Maître', icon: '👑', minXP: 17000, color: '#FFD700' },
            { id: 8, name: 'Champion', icon: '🔥', minXP: 25000, color: '#FF4500' },
            { id: 9, name: 'Héros', icon: '⚡', minXP: 35000, color: '#00BFFF' },
            { id: 10, name: 'Légende', icon: '🏆', minXP: 50000, color: '#FF00FF' }
        ];
    }

    // Obtenir la ligue actuelle basée sur l'XP
    getCurrentLeague(totalXP) {
        let currentLeague = this.leagues[0];
        
        for (let league of this.leagues) {
            if (totalXP >= league.minXP) {
                currentLeague = league;
            } else {
                break;
            }
        }
        
        return currentLeague;
    }

    // Obtenir la prochaine ligue
    getNextLeague(totalXP) {
        const current = this.getCurrentLeague(totalXP);
        const currentIndex = this.leagues.findIndex(l => l.id === current.id);
        
        if (currentIndex < this.leagues.length - 1) {
            return this.leagues[currentIndex + 1];
        }
        
        return null; // Déjà à la ligue maximale
    }

    // Calculer la progression vers la prochaine ligue
    getLeagueProgress(totalXP) {
        const current = this.getCurrentLeague(totalXP);
        const next = this.getNextLeague(totalXP);
        
        if (!next) {
            return {
                current: current,
                next: null,
                xpInCurrentLeague: totalXP - current.minXP,
                xpNeededForNext: 0,
                percentage: 100,
                isMaxLeague: true
            };
        }
        
        const xpInCurrentLeague = totalXP - current.minXP;
        const xpNeededForNext = next.minXP - current.minXP;
        const percentage = (xpInCurrentLeague / xpNeededForNext) * 100;
        
        return {
            current: current,
            next: next,
            xpInCurrentLeague: xpInCurrentLeague,
            xpNeededForNext: xpNeededForNext,
            xpRemainingForNext: next.minXP - totalXP,
            percentage: percentage,
            isMaxLeague: false
        };
    }

    // Obtenir toutes les ligues
    getAllLeagues() {
        return this.leagues;
    }

    // Formater l'affichage de la ligue
    formatLeagueDisplay(league) {
        return `${league.icon} ${league.name}`;
    }

    // Obtenir un message motivant basé sur la ligue
    getLeagueMessage(league) {
        const messages = {
            'Bronze': 'Bienvenue ! Chaque grande aventure commence ici ! 🌱',
            'Argent': 'Tu progresses bien ! Continue comme ça ! 🌟',
            'Or': 'Excellent travail ! Tu brilles de mille feux ! ✨',
            'Platine': 'Impressionnant ! Tu es un vrai professionnel ! 💪',
            'Diamant': 'Exceptionnel ! Peu de gens atteignent ce niveau ! 💎',
            'Maître': 'Tu maîtrises ton art ! Incroyable parcours ! 🎯',
            'Grand Maître': 'Un statut d\'élite ! Tu es remarquable ! 🌟',
            'Champion': 'Champion parmi les champions ! 🏆',
            'Héros': 'Une légende vivante ! Respect absolu ! ⚡',
            'Légende': 'Le sommet de la gloire ! Tu es une LÉGENDE ! 👑'
        };
        
        return messages[league.name] || 'Continue ton excellent travail !';
    }

    // Calculer les récompenses par ligue
    getLeagueRewards(league) {
        const rewards = {
            'Bronze': { badges: 5, scenarios: 10 },
            'Argent': { badges: 8, scenarios: 15 },
            'Or': { badges: 12, scenarios: 20 },
            'Platine': { badges: 18, scenarios: 30 },
            'Diamant': { badges: 25, scenarios: 40 },
            'Maître': { badges: 32, scenarios: 50 },
            'Grand Maître': { badges: 38, scenarios: 60 },
            'Champion': { badges: 43, scenarios: 70 },
            'Héros': { badges: 47, scenarios: 80 },
            'Légende': { badges: 50, scenarios: 100 }
        };
        
        return rewards[league.name] || { badges: 0, scenarios: 0 };
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeagueSystem;
}
