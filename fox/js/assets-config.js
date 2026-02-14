// ===== ASSETS CONFIG - Gestion des images personnalis\u00E9es =====
//
// STRUCTURE DES DOSSIERS \u00C0 CR\u00C9ER SUR GITHUB :
//
//  assets/
//  \u251C\u2500\u2500 badges/
//  \u2502   \u251C\u2500\u2500 badge_first_scenario.png      (ou .jpg / .gif)
//  \u2502   \u251C\u2500\u2500 badge_scenarios_10.png
//  \u2502   \u251C\u2500\u2500 badge_scenarios_25.png
//  \u2502   \u251C\u2500\u2500 … (1 image par badge_ID)
//  \u2502   \u2514\u2500\u2500 badge_league_legend.png
//  \u2502
//  \u251C\u2500\u2500 leagues/
//  \u2502   \u251C\u2500\u2500 league_bronze3.png
//  \u2502   \u251C\u2500\u2500 league_bronze2.png
//  \u2502   \u251C\u2500\u2500 league_bronze1.png
//  \u2502   \u251C\u2500\u2500 league_silver3.png
//  \u2502   \u251C\u2500\u2500 league_silver2.png
//  \u2502   \u251C\u2500\u2500 league_silver1.png
//  \u2502   \u251C\u2500\u2500 league_gold3.png
//  \u2502   \u251C\u2500\u2500 league_gold2.png
//  \u2502   \u251C\u2500\u2500 league_gold1.png
//  \u2502   \u2514\u2500\u2500 league_legend.png
//  \u2502
//  \u251C\u2500\u2500 characters/
//  \u2502   \u251C\u2500\u2500 fox_spring.png    \u2190 Renard Printemps (Mars-Mai)
//  \u2502   \u251C\u2500\u2500 fox_summer.png    \u2190 Renard \u00C9t\u00E9 (Juin-Ao\u00FBt)
//  \u2502   \u251C\u2500\u2500 fox_autumn.png    \u2190 Renard Automne (Sep-Nov)
//  \u2502   \u2514\u2500\u2500 fox_winter.png    \u2190 Renard Hiver (D\u00E9c-F\u00E9v)
//  \u2502
//  \u2514\u2500\u2500 backgrounds/
//      \u251C\u2500\u2500 bg_spring.jpg     \u2190 D\u00E9cor Printemps
//      \u251C\u2500\u2500 bg_summer.jpg     \u2190 D\u00E9cor \u00C9t\u00E9
//      \u251C\u2500\u2500 bg_autumn.jpg     \u2190 D\u00E9cor Automne
//      \u2514\u2500\u2500 bg_winter.jpg     \u2190 D\u00E9cor Hiver
//
// SI L’IMAGE N’EXISTE PAS \u2192 FALLBACK AUTOMATIQUE SUR EMOJI
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
// EXTENSIONS ACCEPT\u00C9ES (ordre de priorit\u00E9)
// ==========================================
extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],

// ==========================================
// \uD83E\uDD8A PERSONNAGE RENARD - 4 SAISONS
// ==========================================
characters: {
    spring: {
        path: './assets/characters/fox_spring.png',
        fallbackEmoji: '\uD83E\uDD8A',
        alt: 'Kitsune Printemps',
        season: 'spring'
    },
    summer: {
        path: './assets/characters/fox_summer.png',
        fallbackEmoji: '\uD83E\uDD8A',
        alt: 'Kitsune \u00C9t\u00E9',
        season: 'summer'
    },
    autumn: {
        path: './assets/characters/fox_autumn.png',
        fallbackEmoji: '\uD83E\uDD8A',
        alt: 'Kitsune Automne',
        season: 'autumn'
    },
    winter: {
        path: './assets/characters/fox_winter.png',
        fallbackEmoji: '\uD83E\uDD8A',
        alt: 'Kitsune Hiver',
        season: 'winter'
    }
},

// ==========================================
// \uD83C\uDF3F D\u00C9CORS SAISONNIERS - 4 BACKGROUNDS
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
// \u2694\uFE0F LIGUES - 10 IMAGES
// ==========================================
leagues: {
    1: { path: '../images/Bronze.PNG',       fallbackEmoji: '\uD83E\uDD49', name: 'Bronze' },
    2: { path: '../images/Argent.PNG',       fallbackEmoji: '\uD83E\uDD48', name: 'Argent' },
    3: { path: '../images/Or.PNG',           fallbackEmoji: '\uD83E\uDD47', name: 'Or' },
    4: { path: '../images/Platine.PNG',      fallbackEmoji: '\uD83D\uDC8E', name: 'Platine' },
    5: { path: '../images/Diamant.PNG',      fallbackEmoji: '\uD83D\uDCA0', name: 'Diamant' },
    6: { path: '../images/Ma%C3%AEtre.PNG',       fallbackEmoji: '\uD83C\uDF1F', name: 'Ma\u00EEtre' },
    7: { path: '../images/Grand%20Ma%C3%AEtre.PNG', fallbackEmoji: '\uD83D\uDC51', name: 'Grand Ma\u00EEtre' },
    8: { path: '../images/Champion.PNG',     fallbackEmoji: '\uD83D\uDD25', name: 'Champion' },
    9: { path: '../images/H%C3%A9ros.PNG',        fallbackEmoji: '\u26A1', name: 'H\u00E9ros' },
   10: { path: '../images/L%C3%A9gende.PNG',      fallbackEmoji: '\uD83C\uDFC6', name: 'L\u00E9gende' }
},

// ==========================================
// \uD83C\uDFC6 BADGES - 50 IMAGES
// Nom du fichier = badge_[ID].png
// ==========================================
badges: {
     1: { path: '../images/Premier%20Pas.PNG' },
     2: { path: '../images/D%C3%A9butant.PNG' },
     3: { path: '../images/R%C3%A9gulier.PNG' },
     4: { path: '../images/Assidu.PNG' },
     5: { path: '../images/Travailleur.PNG' },
     6: { path: '../images/Explorateur.PNG' },
     7: { path: '../images/Curieux.PNG' },
     8: { path: '../images/Niveau%202.PNG' },
     9: { path: '../images/Niveau%205.PNG' },
    10: { path: '../images/Matinal.PNG' },
    11: { path: '../images/Nocturne.PNG' },
    12: { path: '../images/Weekend%20Warrior.PNG' },
    13: { path: '../images/Mensuel.PNG' },
    14: { path: '../images/XP%20Hunter.PNG' },
    15: { path: '../images/Sage.PNG' },
    16: { path: '../images/Organis%C3%A9.PNG' },
    17: { path: '../images/Ami%20du%20Renard.PNG' },
    18: { path: '../images/R%C3%A9gularit%C3%A9%20Bronze.PNG' },
    19: { path: '../images/Marathonien.PNG' },
    20: { path: '../images/Consciencieux.PNG' },
    21: { path: '../images/Pers%C3%A9v%C3%A9rant.PNG' },
    22: { path: '../images/Acharn%C3%A9.PNG' },
    23: { path: '../images/Niveau%2010.PNG' },
    24: { path: '../images/R%C3%A9gularit%C3%A9%20Argent.PNG' },
    25: { path: '../images/R%C3%A9gularit%C3%A9%20Or.PNG' },
    26: { path: '../images/%C3%89rudit.PNG' },
    27: { path: '../images/Expert.PNG' },
    28: { path: '../images/Trimestre.PNG' },
    29: { path: '../images/XP%20Master.PNG' },
    30: { path: '../images/Centenaire.PNG' },
    31: { path: '../images/Noctambule.PNG' },
    32: { path: '../images/L%C3%A8ve-t%C3%B4t.PNG' },
    33: { path: '../images/Sans%20Weekend.PNG' },
    34: { path: '../images/Fid%C3%A8le.PNG' },
    35: { path: '../images/Collectionneur.PNG' },
    36: { path: '../images/Infatigable.PNG' },
    37: { path: '../images/Niveau%2020.PNG' },
    38: { path: '../images/R%C3%A9gularit%C3%A9%20Platine.PNG' },
    39: { path: '../images/R%C3%A9gularit%C3%A9%20Diamant.PNG' },
    40: { path: '../images/Encyclop%C3%A9die.PNG' },
    41: { path: '../images/Semestre.PNG' },
    42: { path: '../images/XP%20Legend.PNG' },
    43: { path: '../images/Bicentenaire.PNG' },
    44: { path: '../images/D%C3%A9votion.PNG' },
    45: { path: '../images/Grand%20Collectionneur.PNG' },
    46: { path: '../images/Titan.PNG' },
    47: { path: '../images/Niveau%2050.PNG' },
    48: { path: '../images/L%C3%A9gende%20Vivante.PNG' },
    49: { path: '../images/Ann%C3%A9e%20Compl%C3%A8te.PNG' },
    50: { path: '../images/Ma%C3%AEtre%20Absolu.PNG' }
}
```

};

// ==========================================
// FONCTIONS HELPERS
// ==========================================

/**

- Renvoie un \u00E9l\u00E9ment <img> avec fallback automatique sur emoji
- Usage: getAssetImg(‘badges’, ‘first_scenario’, ‘badge-icon’)
  */
  function getAssetImg(type, id, cssClass = ‘’, size = ‘48px’) {
  const config = ASSETS_CONFIG[type]?.[id];
  if (!config) return `<span style="font-size:${size}">${'\u2753'}</span>`;
  
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
  if (!config) return `<span style="font-size:${size}">\uD83E\uDD8A</span>`;
  
  return `<img  src="${config.path}"  alt="${config.alt}" class="fox-character-img" style="width:${size};height:auto;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span class="fox-fallback" style="font-size:${size};display:none;">\uD83E\uDD8A</span>`;
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

- D\u00E9tecte la saison actuelle
  */
  function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5)  return ‘spring’;
  if (month >= 6 && month <= 8)  return ‘summer’;
  if (month >= 9 && month <= 11) return ‘autumn’;
  return ‘winter’;
  }

console.log(’\uD83C\uDFA8 Assets Config charg\u00E9 - Images + Fallback Emoji activ\u00E9s’);
