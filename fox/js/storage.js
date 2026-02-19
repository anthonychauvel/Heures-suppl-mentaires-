// ═══════════════════════════════════════════════════════════════
// ── GESTION STORAGE LOCALSTORAGE ───────────────────────────────
// ═══════════════════════════════════════════════════════════════

const storage = {
  // Sauvegarder
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch(e) {
      console.warn('Erreur storage.set:', e);
      return false;
    }
  },
  
  // Charger
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch(e) {
      console.warn('Erreur storage.get:', e);
      return defaultValue;
    }
  },
  
  // Supprimer
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch(e) {
      console.warn('Erreur storage.remove:', e);
      return false;
    }
  },
  
  // Vider tout
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch(e) {
      console.warn('Erreur storage.clear:', e);
      return false;
    }
  }
};

console.log('✅ storage.js chargé');
