// ═══════════════════════════════════════════════════════════════
// ── MODULE READER : Lecture et analyse M1/M2 (Version simplifiée)
// ═══════════════════════════════════════════════════════════════

const moduleReader = {
  // Lire M1 (annual tracker)
  readM1(year) {
    try {
      return JSON.parse(localStorage.getItem('DATA_REPORT_' + year) || '{}');
    } catch(e) { return {}; }
  },
  
  // Lire M2 (monthly tracker)
  readM2(year) {
    try {
      return JSON.parse(localStorage.getItem('CA_HS_TRACKER_V1_DATA_' + year) || '{}');
    } catch(e) { return {}; }
  },
  
  // Calculer heures sup M1
  calculateM1Hours(year) {
    const data = this.readM1(year);
    let total = 0;
    
    Object.entries(data).forEach(([k, v]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'object') {
        total += (v.extra || 0);
      }
    });
    
    return total;
  },
  
  // Calculer heures sup M2
  calculateM2Hours(year) {
    const data = this.readM2(year);
    let total = 0;
    
    Object.entries(data).forEach(([mk, mv]) => {
      if (/^\d{4}-\d{2}$/.test(mk) && mv && mv.days && !mv.closed) {
        Object.values(mv.days).forEach(hrs => {
          const base = 7; // Base journalière par défaut
          total += Math.max(0, (hrs || 0) - base);
        });
      }
    });
    
    return total;
  },
  
  // Sélectionner source primaire
  selectPrimaryModule() {
    const year = new Date().getFullYear();
    const m1 = this.calculateM1Hours(year);
    const m2 = this.calculateM2Hours(year);
    
    console.log('🦊 moduleReader : M1=' + m1 + 'h, M2=' + m2 + 'h');
    
    // Si M1 vide et M2 rempli → M2
    if (m1 === 0 && m2 > 0) return 'M2';
    // Sinon M1 (par défaut)
    return 'M1';
  },
  
  // Historique complet toutes années
  getFullHistory() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    
    const history = {};
    
    years.forEach(y => {
      const m1Hours = this.calculateM1Hours(y);
      const m2Hours = this.calculateM2Hours(y);
      
      history[y] = {
        m1: { 
          hasData: m1Hours > 0, 
          netOvertime: m1Hours, 
          totalAnnual: m1Hours 
        },
        m2: { 
          hasData: m2Hours > 0, 
          totalAnnual: m2Hours, 
          annualHours: m2Hours 
        }
      };
    });
    
    return { years, history };
  },
  
  // Sync minimal
  syncWithGameState() {
    // Déjà géré par les fonctions ci-dessus
  },
  
  // Score burn-out simplifié
  getBurnoutScore() {
    const year = new Date().getFullYear();
    const m1 = this.calculateM1Hours(year);
    const m2 = this.calculateM2Hours(year);
    const total = Math.max(m1, m2);
    
    let score = 0;
    if (total > 500) score = 80;
    else if (total > 300) score = 60;
    else if (total > 150) score = 40;
    else if (total > 50) score = 20;
    
    const level = score >= 80 ? 'critique' : 
                  score >= 60 ? 'danger' : 
                  score >= 40 ? 'risque' : 
                  score >= 20 ? 'vigilance' : 'sain';
    
    return { score, level };
  }
};

console.log('✅ module-reader.js chargé');
