// ===== LEAGUE SYSTEM =====
// G\u00E8re les 10 ligues de progression

class LeagueSystem {
    constructor() {
        this.leagues = [
            { id: 1, img: '../images/Bronze.PNG', name: 'Bronze', icon: '\uD83E\uDD49', minXP: 0, color: '#CD7F32' },
            { id: 2, img: '../images/Argent.PNG', name: 'Argent', icon: '\uD83E\uDD48', minXP: 1000, color: '#C0C0C0' },
            { id: 3, img: '../images/Or.PNG', name: 'Or', icon: '\uD83E\uDD47', minXP: 2500, color: '#FFD700' },
            { id: 4, img: '../images/Platine.PNG', name: 'Platine', icon: '\uD83D\uDC8E', minXP: 5000, color: '#E5E4E2' },
            { id: 5, img: '../images/Diamant.PNG', name: 'Diamant', icon: '\uD83D\uDCA0', minXP: 8000, color: '#B9F2FF' },
            { id: 6, img: '../images/Maitre.PNG', name: 'Ma\u00EEtre', icon: '\uD83C\uDF1F', minXP: 12000, color: '#FF6B9D' },
            { id: 7, img: '../images/Grand_Maitre.PNG', name: 'Grand Ma\u00EEtre', icon: '\uD83D\uDC51', minXP: 17000, color: '#FFD700' },
            { id: 8, img: '../images/Champion.PNG', name: 'Champion', icon: '\uD83D\uDD25', minXP: 25000, color: '#FF4500' },
            { id: 9, img: '../images/Heros.PNG', name: 'H\u00E9ros', icon: '\u26A1', minXP: 35000, color: '#00BFFF' },
            { id: 10, img: '../images/Legende.PNG', name: 'L\u00E9gende', icon: '\uD83C\uDFC6', minXP: 50000, color: '#FF00FF' }
        ];
    }

    // Obtenir la ligue actuelle bas\u00E9e sur l'XP
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
        
        return null; // D\u00E9j\u00E0 \u00E0 la ligue maximale
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

    // Obtenir un message motivant bas\u00E9 sur la ligue
    getLeagueMessage(league) {
        const messages = {
            'Bronze': 'Bienvenue ! Chaque grande aventure commence ici ! \uD83C\uDF31',
            'Argent': 'Tu progresses bien ! Continue comme \u00E7a ! \uD83C\uDF1F',
            'Or': 'Excellent travail ! Tu brilles de mille feux ! \u2728',
            'Platine': 'Impressionnant ! Tu es un vrai professionnel ! \uD83D\uDCAA',
            'Diamant': 'Exceptionnel ! Peu de gens atteignent ce niveau ! \uD83D\uDC8E',
            'Ma\u00EEtre': 'Tu ma\u00EEtrises ton art ! Incroyable parcours ! \uD83C\uDFAF',
            'Grand Ma\u00EEtre': 'Un statut d\'\u00E9lite ! Tu es remarquable ! \uD83C\uDF1F',
            'Champion': 'Champion parmi les champions ! \uD83C\uDFC6',
            'H\u00E9ros': 'Une l\u00E9gende vivante ! Respect absolu ! \u26A1',
            'L\u00E9gende': 'Le sommet de la gloire ! Tu es une L\u00C9GENDE ! \uD83D\uDC51'
        };
        
        return messages[league.name] || 'Continue ton excellent travail !';
    }

    // Calculer les r\u00E9compenses par ligue
    getLeagueRewards(league) {
        const rewards = {
            'Bronze': { badges: 5, scenarios: 10 },
            'Argent': { badges: 8, scenarios: 15 },
            'Or': { badges: 12, scenarios: 20 },
            'Platine': { badges: 18, scenarios: 30 },
            'Diamant': { badges: 25, scenarios: 40 },
            'Ma\u00EEtre': { badges: 32, scenarios: 50 },
            'Grand Ma\u00EEtre': { badges: 38, scenarios: 60 },
            'Champion': { badges: 43, scenarios: 70 },
            'H\u00E9ros': { badges: 47, scenarios: 80 },
            'L\u00E9gende': { badges: 50, scenarios: 100 }
        };
        
        return rewards[league.name] || { badges: 0, scenarios: 0 };
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeagueSystem;
}

// Instance globale
const leagueSystem = new LeagueSystem();
console.log('\u2705 leagueSystem initialis\u00E9');
