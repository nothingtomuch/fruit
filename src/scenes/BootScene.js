// ==========================================
// BOOT SCENE
// Load initial assets and setup
// ==========================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x2C3E50, 0.8);
        progressBox.fillRoundedRect(
            this.scale.width / 2 - 160,
            this.scale.height / 2 - 25,
            320,
            50,
            10
        );

        const loadingText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 50,
            'Loading...',
            {
                fontFamily: 'Segoe UI',
                fontSize: '24px',
                color: '#FFFFFF'
            }
        );
        loadingText.setOrigin(0.5);

        // Progress bar events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFFD700, 1);
            progressBar.fillRoundedRect(
                this.scale.width / 2 - 150,
                this.scale.height / 2 - 15,
                300 * value,
                30,
                8
            );
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Create procedural textures (done in preload so they're ready for other scenes)
        this.createProceduralTextures();
        
        // Since we're not loading external assets, manually complete the loading
        this.load.emit('complete');
    }

    create() {
        // Load saved game data
        window.saveSystem.load();
        
        // Apply saved settings to game data
        const saveData = window.saveSystem.getData();
        window.gameData.essenceSeeds = saveData.essenceSeeds;
        window.gameData.juiceCurrency = saveData.juiceCurrency;
        window.gameData.health = saveData.health;
        window.gameData.collectedSeeds = saveData.collectedSeeds || [];
        window.gameData.defeatedBosses = saveData.defeatedBosses || [];
        window.gameData.unlockedAbilities = saveData.unlockedAbilities || [];
        
        // Transition to main menu
        this.scene.start('MainMenuScene');
    }

    /**
     * Create all procedural textures used throughout the game
     */
    createProceduralTextures() {
        // Blob shadow texture
        createBlobShadow(this, 'blob_shadow', 20, 0.25);
        
        // Gradient sky textures
        createGradientTexture(this, 'sky_banana_hills', 1024, 768, ['#87CEEB', '#E0F6FF']);
        createGradientTexture(this, 'sky_watermelon', 1024, 768, ['#2C3E50', '#34495E']);
        
        // Grass texture
        const grassGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        grassGraphics.fillStyle(COLORS.bananaHills.grass, 1);
        grassGraphics.fillRect(0, 0, 64, 64);
        // Add some variation
        for (let i = 0; i < 20; i++) {
            const gx = Math.random() * 64;
            const gy = Math.random() * 64;
            grassGraphics.fillStyle(COLORS.bananaHills.grassDark, 0.3);
            grassGraphics.fillCircle(gx, gy, 2);
        }
        grassGraphics.generateTexture('grass_tile', 64, 64);
        grassGraphics.destroy();
        
        // Water texture
        const waterGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        waterGraphics.fillStyle(COLORS.watermelonWetlands.water, 0.8);
        waterGraphics.fillRect(0, 0, 64, 64);
        // Add wave patterns
        for (let i = 0; i < 5; i++) {
            waterGraphics.lineStyle(2, COLORS.watermelonWetlands.waterDark, 0.3);
            waterGraphics.moveTo(0, i * 15);
            waterGraphics.lineTo(64, i * 15 + 5);
        }
        waterGraphics.generateTexture('water_tile', 64, 64);
        waterGraphics.destroy();
        
        // Dirt texture
        const dirtGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        dirtGraphics.fillStyle(COLORS.bananaHills.dirt, 1);
        dirtGraphics.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 30; i++) {
            dirtGraphics.fillStyle('#6B3E12', 0.4);
            dirtGraphics.fillCircle(Math.random() * 64, Math.random() * 64, randomInt(1, 3));
        }
        dirtGraphics.generateTexture('dirt_tile', 64, 64);
        dirtGraphics.destroy();
        
        // Stone texture
        const stoneGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        stoneGraphics.fillStyle('#7F8C8D', 1);
        stoneGraphics.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 15; i++) {
            stoneGraphics.fillStyle('#95A5A6', 0.5);
            stoneGraphics.fillCircle(Math.random() * 64, Math.random() * 64, randomInt(2, 5));
        }
        stoneGraphics.generateTexture('stone_tile', 64, 64);
        stoneGraphics.destroy();
        
        // Wood/bridge texture
        const woodGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        woodGraphics.fillStyle('#8B4513', 1);
        woodGraphics.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 8; i++) {
            woodGraphics.fillStyle('#A0522D', 0.6);
            woodGraphics.fillRect(0, i * 8, 64, 2);
        }
        woodGraphics.generateTexture('wood_tile', 64, 64);
        woodGraphics.destroy();
        
        // Banana peel texture (slippery surface)
        const bananaPeelGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bananaPeelGraphics.fillStyle(COLORS.bananaHills.banana, 0.7);
        bananaPeelGraphics.fillRect(0, 0, 64, 64);
        bananaPeelGraphics.lineStyle(2, COLORS.bananaHills.bananaBrown, 0.4);
        for (let i = 0; i < 5; i++) {
            bananaPeelGraphics.moveTo(10, i * 12);
            bananaPeelGraphics.lineTo(54, i * 12 + 6);
        }
        bananaPeelGraphics.generateTexture('banana_peel_tile', 64, 64);
        bananaPeelGraphics.destroy();
        
        // Lily pad texture
        const lilyPadGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        lilyPadGraphics.fillStyle(COLORS.watermelonWetlands.lilyPad, 1);
        lilyPadGraphics.fillCircle(32, 32, 28);
        lilyPadGraphics.lineStyle(2, '#2E7D32', 1);
        lilyPadGraphics.strokeCircle(32, 32, 28);
        // Cut out wedge
        lilyPadGraphics.fillStyle(COLORS.watermelonWetlands.lilyPad, 1);
        lilyPadGraphics.beginPath();
        lilyPadGraphics.moveTo(32, 32);
        lilyPadGraphics.lineTo(50, 20);
        lilyPadGraphics.lineTo(55, 35);
        lilyPadGraphics.closePath();
        lilyPadGraphics.fillPath();
        lilyPadGraphics.generateTexture('lily_pad', 64, 64);
        lilyPadGraphics.destroy();
        
        // Essence seed glow texture
        const seedGlowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        seedGlowGraphics.fillStyle(COLORS.essenceSeed.glow, 0.3);
        seedGlowGraphics.fillCircle(16, 16, 16);
        seedGlowGraphics.fillStyle(COLORS.essenceSeed.core, 1);
        seedGlowGraphics.fillCircle(16, 16, 8);
        seedGlowGraphics.generateTexture('essence_seed', 32, 32);
        seedGlowGraphics.destroy();
        
        // Player texture (orange fruit)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        // Body
        playerGraphics.fillStyle('#FFA500', 1);
        playerGraphics.fillCircle(16, 16, 14);
        // Highlight
        playerGraphics.fillStyle('#FFD700', 0.5);
        playerGraphics.fillCircle(12, 12, 5);
        // Leaf
        playerGraphics.fillStyle('#228B22', 1);
        playerGraphics.fillEllipse(16, 2, 8, 5);
        // Eyes
        playerGraphics.fillStyle(0xFFFFFF, 1);
        playerGraphics.fillCircle(12, 14, 4);
        playerGraphics.fillCircle(20, 14, 4);
        playerGraphics.fillStyle(0x2C3E50, 1);
        playerGraphics.fillCircle(13, 15, 2);
        playerGraphics.fillCircle(21, 15, 2);
        playerGraphics.generateTexture('player', 32, 32);
        playerGraphics.destroy();
        
        console.log('✅ Procedural textures created');
    }
}

window.BootScene = BootScene;
