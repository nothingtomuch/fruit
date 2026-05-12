// ==========================================
// GAME CONSTANTS
// ==========================================

const COLORS = {
    // Banana Hills Palette
    bananaHills: {
        sky: '#87CEEB',
        grass: '#90EE90',
        grassDark: '#228B22',
        dirt: '#8B4513',
        banana: '#FFE135',
        bananaBrown: '#8B7355',
        sun: '#FFD700',
        cloud: '#FFFFFF'
    },
    
    // Watermelon Wetlands Palette
    watermelonWetlands: {
        sky: '#2C3E50',
        water: '#5DADE2',
        waterDark: '#2E86AB',
        watermelon: '#FC5A8D',
        watermelonDark: '#2D5A27',
        watermelonLight: '#C8E6C9',
        mist: '#B0BEC5',
        lilyPad: '#4CAF50'
    },
    
    // UI Colors
    ui: {
        panel: 'rgba(255, 255, 255, 0.9)',
        panelDark: 'rgba(44, 62, 80, 0.95)',
        text: '#2C3E50',
        textLight: '#ECF0F1',
        highlight: '#F39C12',
        health: '#E74C3C',
        healthBg: 'rgba(231, 76, 60, 0.3)',
        seed: '#FFD700',
        juice: '#9B59B6'
    },
    
    // Shadow Colors
    shadows: {
        soft: 'rgba(0, 0, 0, 0.15)',
        medium: 'rgba(0, 0, 0, 0.25)',
        hard: 'rgba(0, 0, 0, 0.4)'
    },
    
    // Essence Seed
    essenceSeed: {
        glow: '#FFD700',
        core: '#FFF8DC',
        aura: 'rgba(255, 215, 0, 0.5)'
    }
};

const ELEVATION = {
    GROUND: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CLIFF: 4
};

const TERRAIN_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    WATER: 'water',
    BANANA_PEEL: 'banana_peel',
    STONE: 'stone',
    WOOD: 'wood',
    VINE: 'vine',
    BRIDGE: 'bridge'
};

const PLAYER_STATES = {
    IDLE: 'idle',
    WALKING: 'walking',
    DASHING: 'dashing',
    CLIMBING: 'climbing',
    INTERACTING: 'interacting'
};

const BOSS_STATES = {
    IDLE: 'idle',
    APPROACHING: 'approaching',
    ATTACKING: 'attacking',
    RECOVERING: 'recovering',
    PHASE_CHANGE: 'phase_change',
    DEFEATED: 'defeated'
};

const DIALOGUE_SPEEDS = {
    TYPING: 30,
    PAUSE_BETWEEN_LINES: 200,
    FADE_IN: 100,
    FADE_OUT: 100
};

const AUDIO = {
    MUSIC: {
        MENU: 'menu_music',
        BANANA_HILLS: 'banana_hills_music',
        WATERMELON_WETLANDS: 'watermelon_wetlands_music',
        BOSS: 'boss_music'
    },
    SFX: {
        DASH: 'dash',
        COLLECT: 'collect',
        JUMP: 'jump',
        LAND: 'land',
        DIALOGUE: 'dialogue',
        BOSS_ATTACK: 'boss_attack',
        BOSS_HIT: 'boss_hit',
        AMBIENCE: 'ambience'
    }
};

// Particle configurations
const PARTICLES = {
    dashTrail: {
        speed: 50,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 300,
        quantity: 2,
        blendMode: 'ADD'
    },
    
    landing: {
        speed: 30,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 200,
        quantity: 5
    },
    
    essenceSeed: {
        speed: 20,
        scale: { start: 0.4, end: 0.2 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 500,
        quantity: 1,
        blendMode: 'ADD'
    },
    
    rain: {
        speed: 200,
        scale: { start: 0.3, end: 0.3 },
        alpha: { start: 0.6, end: 0.4 },
        lifespan: 1000,
        quantity: 50
    },
    
    leaves: {
        speed: 30,
        scale: { start: 0.5, end: 0.3 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 3000,
        quantity: 1
    },
    
    fireflies: {
        speed: 15,
        scale: { start: 0.4, end: 0.4 },
        alpha: { start: 0.8, end: 0.8 },
        lifespan: 2000,
        quantity: 10,
        blendMode: 'ADD'
    }
};
