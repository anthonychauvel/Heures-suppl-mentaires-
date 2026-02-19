// ═══════════════════════════════════════════════════════════════
// ── SYSTÈME XP : Gestion niveaux et progression ────────────────
// ═══════════════════════════════════════════════════════════════

const xpSystem = {
  level: 1,
  currentXP: 0,
  xpPerHour: 100, // 1h de travail = 100 XP
  
  // Charger depuis localStorage
  load() {
    try {
      this.level = parseInt(localStorage.getItem('rpg_level')) || 1;
      this.currentXP = parseInt(localStorage.getItem('rpg_xp')) || 0;
      console.log('🦊 XP chargé : niveau', this.level, ', XP', this.currentXP);
    } catch(e) {
      console.warn('Erreur chargement XP:', e);
    }
  },
  
  // Sauvegarder dans localStorage
  saveToStorage() {
    try {
      localStorage.setItem('rpg_level', this.level);
      localStorage.setItem('rpg_xp', this.currentXP);
    } catch(e) {
      console.warn('Erreur sauvegarde XP:', e);
    }
  },
  
  // Ajouter de l'XP (heures → XP)
  addXP(hours) {
    const xpGain = Math.round(hours * this.xpPerHour);
    this.currentXP += xpGain;
    
    let leveledUp = false;
    let levelsBefore = this.level;
    
    // Level up automatique
    while (this.currentXP >= this.getXPForNextLevel()) {
      this.currentXP -= this.getXPForNextLevel();
      this.level++;
      leveledUp = true;
    }
    
    if (leveledUp) {
      console.log('🎉 LEVEL UP ! Niveau', levelsBefore, '→', this.level);
    }
    
    this.saveToStorage();
    
    return { 
      xpGained: xpGain, 
      leveledUp: leveledUp,
      newLevel: this.level 
    };
  },
  
  // Retirer de l'XP (pénalités)
  removeXP(amount) {
    this.currentXP = Math.max(0, this.currentXP - amount);
    
    // Level down si nécessaire
    while (this.level > 1 && this.currentXP < 0) {
      this.level--;
      this.currentXP += this.getXPForNextLevel();
    }
    
    this.currentXP = Math.max(0, this.currentXP);
    this.saveToStorage();
    
    console.log('⚠️ -' + amount + ' XP → niveau', this.level, ', XP', this.currentXP);
  },
  
  // XP requis pour le niveau suivant
  getXPForNextLevel() {
    // Formule exponentielle : 1000 * 1.15^(level-1)
    return Math.floor(1000 * Math.pow(1.15, this.level - 1));
  },
  
  // Progression dans le niveau actuel
  getCurrentLevelProgress() {
    const needed = this.getXPForNextLevel();
    return {
      current: this.currentXP,
      needed: needed,
      percentage: Math.floor((this.currentXP / needed) * 100)
    };
  },
  
  // Reset complet
  reset() {
    this.level = 1;
    this.currentXP = 0;
    this.saveToStorage();
    console.log('🦊 XP reset');
  }
};

// Charger automatiquement au démarrage
xpSystem.load();

console.log('✅ xp-system.js chargé');
