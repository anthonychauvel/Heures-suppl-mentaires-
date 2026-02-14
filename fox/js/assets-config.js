// ===== ASSETS CONFIG - Gestion des images personnalisées =====
//
// STRUCTURE DES DOSSIERS À CRÉER SUR GITHUB :
//
//  assets/
//  ├── badges/
//  │   ├── badge_first_scenario.png      (ou .jpg / .gif)
//  │   ├── badge_scenarios_10.png
//  │   ├── badge_scenarios_25.png
//  │   ├── … (1 image par badge_ID)
//  │   └── badge_league_legend.png
//  │
//  ├── leagues/
//  │   ├── league_bronze3.png
//  │   ├── league_bronze2.png
//  │   ├── league_bronze1.png
//  │   ├── league_silver3.png
//  │   ├── league_silver2.png
//  │   ├── league_silver1.png
//  │   ├── league_gold3.png
//  │   ├── league_gold2.png
//  │   ├── league_gold1.png
//  │   └── league_legend.png
//  │
//  ├── characters/
//  │   ├── fox_spring.png    ← Renard Printemps (Mars-Mai)
//  │   ├── fox_summer.png    ← Renard Été (Juin-Août)
//  │   ├── fox_autumn.png    ← Renard Automne (Sep-Nov)
//  │   └── fox_winter.png    ← Renard Hiver (Déc-Fév)
//  │
//  └── backgrounds/
//      ├── bg_spring.jpg     ← Décor Printemps
//      ├── bg_summer.jpg     ← Décor Été
//      ├── bg_autumn.jpg     ← Décor Automne
//      └── bg_winter.jpg     ← Décor Hiver
//
// SI L’IMAGE N’EXISTE PAS → FALLBACK AUTOMATIQUE SUR EMOJI
// Aucun bug si image manquante !
//
// =====================================================

const ASSETS_CONFIG = {

```
// ==========================================
// CHEMIN RACINE
// ==========================================
basePath: './assets',

// ==========================================
// EXTENSIONS ACCEPTÉES (ordre de priorité)
// ==========================================
extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],

// ==========================================
// 🦊 PERSONNAGE RENARD - 4 SAISONS
// ==========================================
characters: {
    spring: {
        path: './assets/characters/fox_spring.png',
        fallbackEmoji: '🦊',
        alt: 'Kitsune Printemps',
        season: 'spring'
    },
    summer: {
        path: './assets/characters/fox_summer.png',
        fallbackEmoji: '🦊',
        alt: 'Kitsune Été',
        season: 'summer'
    },
    autumn: {
        path: './assets/characters/fox_autumn.png',
        fallbackEmoji: '🦊',
        alt: 'Kitsune Automne',
        season: 'autumn'
    },
    winter: {
        path: './assets/characters/fox_winter.png',
        fallbackEmoji: '🦊',
        alt: 'Kitsune Hiver',
        season: 'winter'
    }
},

// ==========================================
// 🌿 DÉCORS SAISONNIERS - 4 BACKGROUNDS
// ==========================================
backgrounds: {
    spring: {
        path: './assets/backgrounds/bg_spring.jpg',
        fallbackColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        season: 'spring'
    },
    summer: {
        path: './assets/backgrounds/bg_summer.jpg',
        fallbackColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        season: 'summer'
    },
    autumn: {
        path: './assets/backgrounds/bg_autumn.jpg',
        fallbackColor: 'linear-gradient(135deg, #d4a843 0%, #8b4513 100%)',
        season: 'autumn'
    },
    winter: {
        path: './assets/backgrounds/bg_winter.jpg',
        fallbackColor: 'linear-gradient(135deg, #accbee 0%, #e7f0fd 100%)',
        season: 'winter'
    }
},

// ==========================================
// ⚔️ LIGUES - 10 IMAGES
// ==========================================
leagues: {
    1: { path: '../images/Bronze.PNG',       fallbackEmoji: '🥉', name: 'Bronze' },
    2: { path: '../images/Argent.PNG',       fallbackEmoji: '🥈', name: 'Argent' },
    3: { path: '../images/Or.PNG',           fallbackEmoji: '🥇', name: 'Or' },
    4: { path: '../images/Platine.PNG',      fallbackEmoji: '💎', name: 'Platine' },
    5: { path: '../images/Diamant.PNG',      fallbackEmoji: '💠', name: 'Diamant' },
    6: { path: '../images/Maître.PNG',       fallbackEmoji: '🌟', name: 'Maître' },
    7: { path: '../images/Grand Maître.PNG', fallbackEmoji: '👑', name: 'Grand Maître' },
    8: { path: '../images/Champion.PNG',     fallbackEmoji: '🔥', name: 'Champion' },
    9: { path: '../images/Héros.PNG',        fallbackEmoji: '⚡', name: 'Héros' },
   10: { path: '../images/Légende.PNG',      fallbackEmoji: '🏆', name: 'Légende' }
},

// ==========================================
// 🏆 BADGES - 50 IMAGES
// Nom du fichier = badge_[ID].png
// ==========================================
badges: {
     1: { path: '../images/Premier Pas.PNG' },
     2: { path: '../images/Débutant.PNG' },
     3: { path: '../images/Régulier.PNG' },
     4: { path: '../images/Assidu.PNG' },
     5: { path: '../images/Travailleur.PNG' },
     6: { path: '../images/Explorateur.PNG' },
     7: { path: '../images/Curieux.PNG' },
     8: { path: '../images/Niveau 2.PNG' },
     9: { path: '../images/Niveau 5.PNG' },
    10: { path: '../images/Matinal.PNG' },
    11: { path: '../images/Nocturne.PNG' },
    12: { path: '../images/Weekend Warrior.PNG' },
    13: { path: '../images/Mensuel.PNG' },
    14: { path: '../images/XP Hunter.PNG' },
    15: { path: '../images/Sage.PNG' },
    16: { path: '../images/Organisé.PNG' },
    17: { path: '../images/Ami du Renard.PNG' },
    18: { path: '../images/Régularité Bronze.PNG' },
    19: { path: '../images/Marathonien.PNG' },
    20: { path: '../images/Consciencieux.PNG' },
    21: { path: '../images/Persévérant.PNG' },
    22: { path: '../images/Acharné.PNG' },
    23: { path: '../images/Niveau 10.PNG' },
    24: { path: '../images/Régularité Argent.PNG' },
    25: { path: '../images/Régularité Or.PNG' },
    26: { path: '../images/Érudit.PNG' },
    27: { path: '../images/Expert.PNG' },
    28: { path: '../images/Trimestre.PNG' },
    29: { path: '../images/XP Master.PNG' },
    30: { path: '../images/Centenaire.PNG' },
    31: { path: '../images/Noctambule.PNG' },
    32: { path: '../images/Lève-tôt.PNG' },
    33: { path: '../images/Sans Weekend.PNG' },
    34: { path: '../images/Fidèle.PNG' },
    35: { path: '../images/Collectionneur.PNG' },
    36: { path: '../images/Infatigable.PNG' },
    37: { path: '../images/Niveau 20.PNG' },
    38: { path: '../images/Régularité Platine.PNG' },
    39: { path: '../images/Régularité Diamant.PNG' },
    40: { path: '../images/Encyclopédie.PNG' },
    41: { path: '../images/Semestre.PNG' },
    42: { path: '../images/XP Legend.PNG' },
    43: { path: '../images/Bicentenaire.PNG' },
    44: { path: '../images/Dévotion.PNG' },
    45: { path: '../images/Grand Collectionneur.PNG' },
    46: { path: '../images/Titan.PNG' },
    47: { path: '../images/Niveau 50.PNG' },
    48: { path: '../images/Légende Vivante.PNG' },
    49: { path: '../images/Année Complète.PNG' },
    50: { path: '../images/Maître Absolu.PNG' }
}
```

};

// ==========================================
// FONCTIONS HELPERS
// ==========================================

/**

- Renvoie un élément <img> avec fallback automatique sur emoji
- Usage: getAssetImg(‘badges’, ‘first_scenario’, ‘badge-icon’)
  */
  function getAssetImg(type, id, cssClass = ‘’, size = ‘48px’) {
  const config = ASSETS_CONFIG[type]?.[id];
  if (!config) return `<span style="font-size:${size}">${'❓'}</span>`;
  
  return `<img  src="${config.path}"  alt="${config.alt || id}" class="${cssClass}" style="width:${size};height:${size};object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span class="${cssClass}-fallback" style="font-size:${size};display:none;">${config.fallbackEmoji}</span>`;
  }

/**

- Renvoie l’image ou l’emoji d’une ligue
  */
  function getLeagueAsset(leagueId, size = ‘40px’) {
  return getAssetImg(‘leagues’, leagueId, ‘league-img’, size);
  }

/**

- Renvoie l’image ou l’emoji d’un badge
  */
  function getBadgeAsset(badgeId, size = ‘48px’) {
  return getAssetImg(‘badges’, badgeId, ‘badge-img’, size);
  }

/**

- Renvoie le renard saisonnier
  */
  function getFoxAsset(season, size = ‘80px’) {
  const config = ASSETS_CONFIG.characters[season];
  if (!config) return `<span style="font-size:${size}">🦊</span>`;
  
  return `<img  src="${config.path}"  alt="${config.alt}" class="fox-character-img" style="width:${size};height:auto;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span class="fox-fallback" style="font-size:${size};display:none;">🦊</span>`;
  }

/**

- Applique le background saisonnier
  */
  function applySeasonBackground(season) {
  const config = ASSETS_CONFIG.backgrounds[season];
  if (!config) return;
  
  const bgElements = document.querySelectorAll(’.background-layer’);
  bgElements.forEach(el => {
  el.style.opacity = ‘0’;
  el.style.backgroundImage = ‘’;
  });
  
  const targetEl = document.getElementById(`bg-${season}`);
  if (targetEl) {
  const img = new Image();
  img.onload = () => {
  targetEl.style.backgroundImage = `url('${config.path}')`;
  targetEl.style.opacity = ‘0.15’;
  };
  img.onerror = () => {
  // Fallback sur gradient CSS
  targetEl.style.background = config.fallbackColor;
  targetEl.style.opacity = ‘0.3’;
  };
  img.src = config.path;
  }
  }

/**

- Détecte la saison actuelle
  */
  function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5)  return ‘spring’;
  if (month >= 6 && month <= 8)  return ‘summer’;
  if (month >= 9 && month <= 11) return ‘autumn’;
  return ‘winter’;
  }

console.log(‘🎨 Assets Config chargé - Images + Fallback Emoji activés’);
