// ═══════════════════════════════════════════════════════════════
// ── CONFIGURATION GLOBALE FOX ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════

const FOX_CONFIG = {
  // Système XP
  xpPerHour: 100, // 1h = 100 XP
  
  // Contingent légal
  contingentAnnuel: 220, // heures
  
  // Durée hebdomadaire légale
  dureeHebdo: 35, // heures
  
  // Durée journalière légale
  dureeJour: 10, // heures (sans dérogation)
  dureeJourMax: 12, // heures (avec dérogation)
  
  // Majorations
  majoration25: 8, // 8 premières heures à +25%
  majoration50: Infinity, // heures suivantes à +50%
  
  // Seuils burn-out
  burnoutSeuils: {
    sain: 20,
    vigilance: 40,
    risque: 60,
    danger: 80,
    critique: 100
  },
  
  // Profil utilisateur
  _PROFILE_KEY: 'FOX_USER_PROFILE',
  
  // Version
  version: '3.0.0'
};

console.log('✅ config.js chargé');
