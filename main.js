// ==========================================
// FRUIT WANDERER - MAIN ENTRY POINT
// ==========================================

const gameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    roundPixels: true,
    antialias: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MainMenuScene,
        BananaHillsScene,
        WatermelonWetlandsScene,
        BossArenaScene
    ],
    callbacks: {
        preBoot: function() {
            console.log('🍊 Fruit Wanderer Initializing...');
        },
        postBoot: function() {
            console.log('✨ Game Ready!');
        }
    }
};

const game = new Phaser.Game(gameConfig);

// Global game data
window.gameData = {
    essenceSeeds: 0,
    juiceCurrency: 0,
    health: 5,
    maxHealth: 5,
    unlockedAbilities: [],
    defeatedBosses: [],
    currentRegion: null,
    playerPosition: { x: 0, y: 0 }
};

// Movement upgrade stats
window.abilityStats = {
    dashDistance: 100,
    dashCooldown: 500,
    movementSpeed: 200,
    acceleration: 800,
    deceleration: 600,
    maxVelocity: 200
};
